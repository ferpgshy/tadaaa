// Regras da sala online (sem rede): estado único, mantido pelo host e repassado a todos.
// Fica separado da conexão para dar para testar e reaproveitar em outros jogos.
import type { AvatarConfig } from "@/lib/avatar";
import { errorMs, roundPoints, surpriseTarget } from "@/games/cronometro-cego/logic";

export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I/L
export const CODE_LENGTH = 4;

export function newRoomCode(rand: () => number = Math.random) {
  return Array.from({ length: CODE_LENGTH }, () => CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)]).join("");
}

export function normalizeCode(raw: string) {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
  return c.length === CODE_LENGTH && [...c].every((ch) => CODE_ALPHABET.includes(ch)) ? c : null;
}

export type PartyPlayer = {
  id: string;
  name: string;
  avatar: AvatarConfig | null;
  /** Quando entrou (ms). O mais antigo assume se o host sair. */
  joinedAt: number;
  host?: boolean;
};

export type PartySettings = { target: number | "surprise"; hideAfter: number; rounds: number };

export type PartyState = {
  phase: "lobby" | "playing" | "roundEnd" | "podium";
  settings: PartySettings;
  round: number;
  /** Alvo da rodada atual, em segundos. */
  target: number;
  /** Alvo de cada rodada já jogada (para o placar). */
  targets: Record<number, number>;
  /** Jogadores que participam da partida (fixado ao começar). */
  roster: string[];
  /** results[rodada][jogador] = tempo parado em ms. */
  results: Record<number, Record<string, number>>;
  version: number;
};

export const DEFAULT_SETTINGS: PartySettings = { target: 10, hideAfter: 3, rounds: 3 };

export function initialState(): PartyState {
  return { phase: "lobby", settings: DEFAULT_SETTINGS, round: 0, target: 10, targets: {}, roster: [], results: {}, version: 0 };
}

const pickTarget = (s: PartySettings, rand?: () => number) => (s.target === "surprise" ? surpriseTarget(rand) : s.target);

export type PartyEvent =
  | { type: "configure"; settings: PartySettings }
  | { type: "start"; roster: string[] }
  | { type: "submit"; playerId: string; round: number; elapsedMs: number }
  | { type: "next" }
  | { type: "lobby" }
  /** Quem está conectado agora: se todos os presentes já jogaram, a rodada fecha. */
  | { type: "sweep"; present: string[] };

/** Aplica um evento (só o host roda isto). Devolve o mesmo objeto se nada mudou. */
export function reduce(state: PartyState, ev: PartyEvent, rand?: () => number): PartyState {
  const bump = (s: PartyState): PartyState => ({ ...s, version: state.version + 1 });
  switch (ev.type) {
    case "configure":
      if (state.phase !== "lobby") return state;
      return bump({ ...state, settings: ev.settings });
    case "start": {
      if (ev.roster.length < 1) return state;
      const target = pickTarget(state.settings, rand);
      return bump({ ...state, phase: "playing", round: 0, target, targets: { 0: target }, roster: ev.roster, results: {} });
    }
    case "submit": {
      if (state.phase !== "playing" || ev.round !== state.round || !state.roster.includes(ev.playerId)) return state;
      const roundRes = state.results[state.round] ?? {};
      if (roundRes[ev.playerId] !== undefined) return state; // não deixa reenviar
      const nextRes = { ...roundRes, [ev.playerId]: Math.max(0, Math.round(ev.elapsedMs)) };
      const done = state.roster.every((id) => nextRes[id] !== undefined);
      return bump({ ...state, results: { ...state.results, [state.round]: nextRes }, phase: done ? "roundEnd" : "playing" });
    }
    case "sweep": {
      // Quem caiu continua na partida (e volta com os pontos se reconectar); só não trava a rodada.
      if (state.phase !== "playing") return state;
      const roundRes = state.results[state.round] ?? {};
      const present = state.roster.filter((id) => ev.present.includes(id));
      const anyone = Object.keys(roundRes).length > 0;
      const done = anyone && present.every((id) => roundRes[id] !== undefined);
      return done ? bump({ ...state, phase: "roundEnd" }) : state;
    }
    case "next": {
      if (state.phase !== "roundEnd") return state;
      if (state.round + 1 >= state.settings.rounds) return bump({ ...state, phase: "podium" });
      const target = pickTarget(state.settings, rand);
      return bump({ ...state, phase: "playing", round: state.round + 1, target, targets: { ...state.targets, [state.round + 1]: target } });
    }
    case "lobby":
      return bump({ ...state, phase: "lobby", round: 0, targets: {}, roster: [], results: {} });
  }
}

export type PartyStanding = { id: string; total: number; avgAbsErr: number; played: number };

/** Placar: soma de pontos (1000 no exato), desempate pelo menor erro médio. */
export function partyStandings(state: PartyState): PartyStanding[] {
  const targets = state.targets;
  return state.roster
    .map((id) => {
      let total = 0;
      let errSum = 0;
      let played = 0;
      for (const [r, res] of Object.entries(state.results)) {
        const t = targets[Number(r)];
        if (res[id] === undefined || t === undefined) continue;
        const e = errorMs(res[id], t);
        total += roundPoints(e);
        errSum += Math.abs(e);
        played++;
      }
      return { id, total, avgAbsErr: played ? errSum / played : Infinity, played };
    })
    .sort((a, b) => b.total - a.total || a.avgAbsErr - b.avgAbsErr);
}

/** Quem é o host: quem marcou host; se saiu, o mais antigo da sala. */
export function electHost(players: PartyPlayer[]): string | null {
  if (!players.length) return null;
  const flagged = players.filter((p) => p.host).sort((a, b) => a.joinedAt - b.joinedAt)[0];
  if (flagged) return flagged.id;
  return [...players].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}
