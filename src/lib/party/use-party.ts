"use client";

// Conexão da sala via Supabase Realtime (broadcast + presence, sem banco de dados).
// O host guarda o estado oficial; os outros mandam eventos e recebem o estado.
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AvatarConfig } from "@/lib/avatar";
import { electHost, initialState, reduce, type PartyEvent, type PartyPlayer, type PartyState } from "./protocol";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const partyAvailable = Boolean(URL && KEY);

let client: SupabaseClient | null = null;
function getClient() {
  if (!URL || !KEY) return null;
  client ??= createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** Id do jogador nesta aba (duas abas = dois jogadores, útil para testar). */
export function myPlayerId() {
  try {
    let id = sessionStorage.getItem("tadaaa-player-id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tadaaa-player-id", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export const hostKey = (code: string) => `tadaaa-host-${code}`;

export type PartyStatus = "idle" | "connecting" | "online" | "error" | "unconfigured";

type Me = { id: string; name: string; avatar: AvatarConfig | null };

export function useParty(code: string, me: Me | null) {
  const [status, setStatus] = useState<PartyStatus>(partyAvailable ? "idle" : "unconfigured");
  const [players, setPlayers] = useState<PartyPlayer[]>([]);
  const [state, setState] = useState<PartyState>(initialState);
  const stateRef = useRef(state);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const hostIdRef = useRef<string | null>(null);
  const meId = me?.id ?? null;

  const hostId = electHost(players);
  const isHost = Boolean(meId && hostId === meId);

  // Mantém refs em dia para os callbacks da conexão.
  useEffect(() => {
    hostIdRef.current = hostId;
  }, [hostId]);

  const publish = useCallback((next: PartyState) => {
    stateRef.current = next;
    setState(next);
    void channelRef.current?.send({ type: "broadcast", event: "state", payload: next });
  }, []);

  const applyAsHost = useCallback(
    (ev: PartyEvent) => {
      const next = reduce(stateRef.current, ev);
      if (next !== stateRef.current) publish(next);
    },
    [publish],
  );

  /** Ações do jogador: o host aplica na hora; os outros pedem ao host. */
  const dispatch = useCallback(
    (ev: PartyEvent) => {
      if (hostIdRef.current && hostIdRef.current === meId) applyAsHost(ev);
      else void channelRef.current?.send({ type: "broadcast", event: "event", payload: ev });
    },
    [applyAsHost, meId],
  );

  useEffect(() => {
    if (!me || !partyAvailable) return;
    const sb = getClient();
    if (!sb) return;
    const joinedAt = Date.now();
    const wantHost = (() => {
      try {
        return sessionStorage.getItem(hostKey(code)) === me.id;
      } catch {
        return false;
      }
    })();

    const ch = sb.channel(`tadaaa-sala-${code}`, {
      config: { broadcast: { self: false }, presence: { key: me.id } },
    });
    channelRef.current = ch;
    queueMicrotask(() => setStatus("connecting"));

    const readPlayers = () => {
      const raw = ch.presenceState<Omit<PartyPlayer, "id">>();
      const list: PartyPlayer[] = Object.entries(raw).map(([id, metas]) => ({ ...(metas[0] as Omit<PartyPlayer, "id">), id }));
      setPlayers(list);
      return list;
    };

    ch.on("presence", { event: "sync" }, () => {
      const list = readPlayers();
      const host = electHost(list);
      hostIdRef.current = host;
      if (host === me.id) {
        // Quem caiu durante a partida deixa de travar a rodada (mas não perde o lugar).
        applyAsHost({ type: "sweep", present: list.map((p) => p.id) });
        // Garante que quem acabou de entrar recebe o estado atual.
        void ch.send({ type: "broadcast", event: "state", payload: stateRef.current });
      }
    });

    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      const next = payload as PartyState;
      // Fica sempre com a versão mais nova. Assim, se o host recarregar a página,
      // ele recupera a partida com quem ficou na sala, em vez de zerar tudo.
      if (next.version > stateRef.current.version) {
        stateRef.current = next;
        setState(next);
      }
    });

    ch.on("broadcast", { event: "event" }, ({ payload }) => {
      if (hostIdRef.current === me.id) applyAsHost(payload as PartyEvent);
    });

    ch.on("broadcast", { event: "hello" }, () => {
      // Quem chegou recebe o estado; se fui eu quem guardou a versão mais nova, mando também.
      if (hostIdRef.current === me.id || stateRef.current.version > 0) void ch.send({ type: "broadcast", event: "state", payload: stateRef.current });
    });

    ch.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        setStatus("online");
        await ch.track({ name: me.name, avatar: me.avatar, joinedAt, host: wantHost });
        void ch.send({ type: "broadcast", event: "hello", payload: {} });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      channelRef.current = null;
      void sb.removeChannel(ch);
    };
    // Reconecta só se a sala ou a pessoa mudar (nome/avatar são atualizados abaixo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, meId, applyAsHost]);

  // Nome/avatar mudaram: atualiza a presença sem reconectar.
  // Compara pelo conteúdo (texto): o objeto do avatar é recriado a cada render e, comparado
  // por referência, fazia a presença ser reenviada sem parar (e o servidor passava a descartar).
  const meName = me?.name;
  const meAvatarKey = JSON.stringify(me?.avatar ?? null);
  const lastSent = useRef("");
  useEffect(() => {
    const ch = channelRef.current;
    if (!ch || status !== "online" || !meName) return;
    const sig = `${meName}|${meAvatarKey}`;
    if (!lastSent.current) {
      lastSent.current = sig; // o primeiro envio já foi feito ao entrar na sala
      return;
    }
    if (sig === lastSent.current) return;
    lastSent.current = sig;
    const current = ch.presenceState<Omit<PartyPlayer, "id">>()[meId ?? ""]?.[0];
    if (!current) return;
    void ch.track({ ...current, name: meName, avatar: JSON.parse(meAvatarKey) });
  }, [meName, meAvatarKey, meId, status]);

  return { status, players, state, hostId, isHost, dispatch };
}
