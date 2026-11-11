"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarImage } from "@/components/avatar-image";
import { HIDE_OPTIONS, ROUND_OPTIONS, TARGETS, errorMs, formatDiff, formatSeconds, roundPoints, verdict, type VerdictKey } from "@/games/cronometro-cego/logic";
import { t } from "@/i18n";
import { sanitizeAvatar, type AvatarMood } from "@/lib/avatar";
import { partyStandings, type PartyPlayer, type PartySettings } from "@/lib/party/protocol";
import { myPlayerId, useParty } from "@/lib/party/use-party";
import { useProfile, type AvatarImages } from "@/lib/profile";
import { sfx } from "@/lib/sfx";
import { useHydrated } from "@/lib/use-hydrated";
import { InvitePanel } from "./invite-panel";
import { HoldTimer } from "@/games/cronometro-cego/hold-timer";
import { SuspiciousBadge } from "@/games/cronometro-cego/blind-timer-game";
import type { InvalidReason } from "@/games/cronometro-cego/anticheat";

const P = t.party;
const L = t.blindTimer;
const A = t.anticheat;

const moodFor = (v: VerdictKey): AvatarMood =>
  v === "perfect" || v === "surgical" || v === "close" ? "happy" : v === "broken" ? "sad" : v === "meh" ? "shock" : "neutral";

/** Imagens dos avatares de quem está na sala (quem não criou avatar ganha um pelo nome). */
function usePlayerImages(players: PartyPlayer[]) {
  const [lib, setLib] = useState<typeof import("@/lib/avatar-render") | null>(null);
  useEffect(() => {
    void import("@/lib/avatar-render").then(setLib);
  }, []);
  const key = players.map((p) => `${p.id}:${p.name}:${JSON.stringify(p.avatar)}`).join("|");
  return useMemo(() => {
    const out: Record<string, { images: AvatarImages; frame: number }> = {};
    if (!lib) return out;
    for (const p of players) {
      const cfg = sanitizeAvatar(p.avatar) ?? lib.avatarFromName(p.name || p.id);
      out[p.id] = { images: lib.renderAllMoods(cfg), frame: cfg.frame };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a chave de texto resume os jogadores
  }, [lib, key]);
}

export function PartyRoom({ code }: { code: string }) {
  const hydrated = useHydrated();
  const nickname = useProfile((p) => p.nickname);
  const avatar = useProfile((p) => p.avatar);
  const setNickname = useProfile((p) => p.setNickname);
  const [draftName, setDraftName] = useState("");
  const [meId] = useState(() => (typeof window === "undefined" ? "" : myPlayerId()));

  const me = hydrated && nickname.trim() && meId ? { id: meId, name: nickname.trim(), avatar: sanitizeAvatar(avatar) } : null;
  const { status, players, state, hostId, isHost, dispatch } = useParty(code, me);
  const images = usePlayerImages(players);
  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const nameOf = (id: string) => byId[id]?.name ?? "—";

  // Tempo que eu mandei nesta rodada (antes do host confirmar).
  const [sent, setSent] = useState<Record<number, number>>({});
  const [sentInvalid, setSentInvalid] = useState<Record<number, InvalidReason | undefined>>({});
  const prevPhase = useRef(state.phase);
  useEffect(() => {
    if (prevPhase.current !== state.phase) {
      if (state.phase === "roundEnd") sfx.good();
      if (state.phase === "podium") sfx.fanfare();
      prevPhase.current = state.phase;
    }
  }, [state.phase]);

  if (!hydrated) return <div className="h-96 animate-pulse rounded-4xl bg-field" />;

  if (status === "unconfigured") return <Notice text={P.unconfigured} />;

  // 1) Sem apelido: pede antes de entrar.
  if (!me) {
    return (
      <form
        className="pop mx-auto flex w-full max-w-lg flex-col gap-4 rounded-4xl bg-cream p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (draftName.trim()) setNickname(draftName.trim());
        }}
      >
        <h1 className="font-display text-3xl font-extrabold">{P.title(code)}</h1>
        <label className="flex flex-col gap-2">
          <span className="font-display font-bold">{P.yourName}</span>
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            maxLength={24}
            placeholder={P.namePlaceholder}
            className="pop-sm rounded-xl bg-field px-4 py-3 text-lg outline-none focus:bg-sun/20"
          />
        </label>
        <button type="submit" className="pop pressable rounded-2xl bg-primary py-3 font-display text-xl font-extrabold text-on-primary">
          {P.enter} →
        </button>
      </form>
    );
  }

  if (status === "error")
    return (
      <Notice text={P.error}>
        <button type="button" onClick={() => location.reload()} className="pop pressable rounded-2xl bg-primary px-6 py-3 font-display font-bold text-on-primary">
          🔁 {P.retry}
        </button>
      </Notice>
    );

  const inRoster = state.roster.includes(me.id);
  const roundRes = state.results[state.round] ?? {};
  const myTime = roundRes[me.id] ?? sent[state.round];
  const playersSorted = [...players].sort((a, b) => a.joinedAt - b.joinedAt);

  const playerList = (
    <div className="pop flex flex-col gap-3 rounded-4xl bg-cream p-5">
      <h2 className="font-display text-xl font-extrabold">👥 {P.players(players.length)}</h2>
      <ul className="flex flex-col gap-2">
        {playersSorted.map((p) => {
          const playing = state.phase === "playing" && state.roster.includes(p.id);
          const done = playing && roundRes[p.id] !== undefined;
          return (
            <li key={p.id} className="flex items-center gap-3">
              <AvatarImage images={images[p.id]?.images} frame={images[p.id]?.frame} size={40} alt={p.name} />
              <span className="min-w-0 flex-1 truncate font-display font-bold">
                {p.name}
                {p.id === me.id && <span className="font-normal text-ink/70"> ({P.you})</span>}
              </span>
              {p.id === hostId && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold">👑 {P.host}</span>}
              {playing && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${done ? "bg-lime" : "bg-field"}`}>
                  {done ? `✅ ${P.done}` : `⏳ ${P.playing}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-8">
      <section className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">⏱️ {P.title(code)}</h1>
          {status !== "online" && <span className="animate-pulse font-display font-bold text-ink/70">{P.connecting}</span>}
          {state.phase !== "lobby" && state.phase !== "podium" && (
            <span className="pop-sm rounded-full bg-cream px-4 py-1 font-display font-bold">{P.round(state.round + 1, state.settings.rounds)}</span>
          )}
        </div>

        {state.phase === "lobby" && (
          <>
            {isHost ? (
              <HostSettings
                settings={state.settings}
                onChange={(settings) => dispatch({ type: "configure", settings })}
                onStart={() => {
                  sfx.start();
                  dispatch({ type: "start", roster: playersSorted.map((p) => p.id) });
                }}
                alone={players.length < 2}
              />
            ) : (
              <Notice text={P.waitingHost} />
            )}
            <div className="lg:hidden">
              <InvitePanel code={code} />
            </div>
          </>
        )}

        {state.phase === "playing" &&
          (!inRoster ? (
            <Notice text={P.spectator} />
          ) : myTime === undefined ? (
            <HoldTimer
              key={state.round}
              target={state.target}
              hideAfter={state.settings.hideAfter}
              onResult={({ elapsedMs, invalid }) => {
                setSent((s) => ({ ...s, [state.round]: elapsedMs }));
                setSentInvalid((s) => ({ ...s, [state.round]: invalid }));
                dispatch({ type: "submit", playerId: me.id, round: state.round, elapsedMs, invalid });
              }}
            />
          ) : (
            <div className="pop flex flex-col items-center gap-3 rounded-4xl bg-cream p-8 text-center">
              <AvatarImage images={images[me.id]?.images} frame={images[me.id]?.frame} mood={moodFor(verdict(errorMs(myTime, state.target)))} size={96} alt={me.name} />
              <p className="font-display text-2xl font-extrabold">{P.youStopped(formatSeconds(myTime))}</p>
              {(state.invalid?.[state.round]?.[me.id] ?? sentInvalid[state.round]) && (
                <p className="pop-sm rounded-xl bg-tomato px-3 py-1 font-display font-bold">
                  🚫 {A.invalid[(state.invalid?.[state.round]?.[me.id] ?? sentInvalid[state.round])!]}
                </p>
              )}
              <p className="animate-pulse text-ink/70">{P.waitingOthers}</p>
            </div>
          ))}

        {state.phase === "roundEnd" && (
          <RoundResults
            ids={state.roster}
            results={roundRes}
            invalid={state.invalid?.[state.round] ?? {}}
            onVoid={isHost ? (id) => dispatch({ type: "void", playerId: id, round: state.round }) : undefined}
            target={state.target}
            nameOf={nameOf}
            images={images}
            footer={
              isHost ? (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "next" })}
                  className="pop pressable rounded-2xl bg-primary px-8 py-4 font-display text-2xl font-extrabold text-on-primary"
                >
                  {state.round + 1 >= state.settings.rounds ? `🏆 ${P.seePodium}` : `${P.nextRound} →`}
                </button>
              ) : (
                <p className="text-ink/70">{P.waitingNext}</p>
              )
            }
          />
        )}

        {(state.phase === "roundEnd" || state.phase === "podium") && (
          <Standings state={state} nameOf={nameOf} images={images} podium={state.phase === "podium"} />
        )}

        {state.phase === "podium" && isHost && (
          <button
            type="button"
            onClick={() => dispatch({ type: "lobby" })}
            className="pop pressable self-center rounded-2xl bg-primary px-8 py-4 font-display text-2xl font-extrabold text-on-primary"
          >
            🔁 {P.playAgain}
          </button>
        )}
      </section>

      <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        {playerList}
        <div className={state.phase === "lobby" ? "hidden lg:block" : ""}>
          <InvitePanel code={code} />
        </div>
        <Link href="/" className="w-fit font-display font-bold text-ink/70 hover:text-ink">
          ← {P.leave}
        </Link>
      </aside>
    </div>
  );
}

function Notice({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="pop flex flex-col items-center gap-4 rounded-4xl bg-cream p-8 text-center">
      <p className="font-display text-xl font-bold">{text}</p>
      {children}
    </div>
  );
}

function HostSettings({
  settings,
  onChange,
  onStart,
  alone,
}: {
  settings: PartySettings;
  onChange: (s: PartySettings) => void;
  onStart: () => void;
  alone: boolean;
}) {
  const chip = (active: boolean, label: React.ReactNode, onClick: () => void, key: string | number) => (
    <button
      key={key}
      type="button"
      aria-pressed={active}
      onClick={() => {
        onClick();
        sfx.click();
      }}
      className={`pop-sm pressable rounded-2xl px-4 py-2 font-display font-bold ${active ? "bg-sun" : "bg-field"}`}
    >
      {label}
    </button>
  );
  return (
    <div className="pop flex flex-col gap-5 rounded-4xl bg-cream p-5 sm:p-8">
      <h2 className="font-display text-2xl font-extrabold">⚙️ {P.settings}</h2>
      <Row label={L.target}>
        {TARGETS.map((s) => chip(settings.target === s, `${s}${L.seconds}`, () => onChange({ ...settings, target: s }), s))}
        {chip(settings.target === "surprise", `🎲 ${L.surprise}`, () => onChange({ ...settings, target: "surprise" }), "s")}
      </Row>
      <Row label={L.hideAfter}>
        {HIDE_OPTIONS.map((s) => chip(settings.hideAfter === s, s === 0 ? `🙈 ${L.hideNever}` : `${s}${L.seconds}`, () => onChange({ ...settings, hideAfter: s }), s))}
      </Row>
      <Row label={L.rounds}>
        {ROUND_OPTIONS.map((r) => chip(settings.rounds === r, r, () => onChange({ ...settings, rounds: r }), r))}
      </Row>
      {alone && <p className="text-sm font-semibold text-ink/70">💡 {P.startAlone}</p>}
      <button type="button" onClick={onStart} className="pop pressable self-start rounded-2xl bg-primary px-8 py-4 font-display text-2xl font-extrabold text-on-primary">
        ▶ {P.start}
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display font-bold text-ink/75">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function RoundResults({
  ids,
  results,
  invalid,
  onVoid,
  target,
  nameOf,
  images,
  footer,
}: {
  ids: string[];
  results: Record<string, number>;
  invalid: Record<string, InvalidReason>;
  /** Juiz humano: só o host recebe este botão. */
  onVoid?: (id: string) => void;
  target: number;
  nameOf: (id: string) => string;
  images: Record<string, { images: AvatarImages; frame: number }>;
  footer: React.ReactNode;
}) {
  const rows = ids
    .filter((id) => results[id] !== undefined)
    .map((id) => ({ id, ms: results[id], err: errorMs(results[id], target), bad: invalid[id] }))
    // Quem não valeu vai para o fim.
    .sort((a, b) => Number(Boolean(a.bad)) - Number(Boolean(b.bad)) || Math.abs(a.err) - Math.abs(b.err));
  return (
    <div className="pop flex flex-col gap-4 rounded-4xl bg-cream p-5 sm:p-8">
      <h2 className="font-display text-2xl font-extrabold">
        🎯 {P.roundResult} · {P.target(formatSeconds(target * 1000))}
      </h2>
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const v = verdict(r.err);
          return (
            <motion.li
              key={r.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-center gap-3 rounded-2xl bg-field p-2 pr-4"
            >
              <span className="w-6 text-center font-display text-xl font-extrabold">{i + 1}</span>
              <AvatarImage images={images[r.id]?.images} frame={images[r.id]?.frame} mood={r.bad ? "sad" : moodFor(v)} size={48} alt={nameOf(r.id)} />
              <span className="min-w-0 flex-1 truncate font-display font-bold">
                {nameOf(r.id)}
                {r.bad && (
                  <span title={A.invalid[r.bad]} className="ml-2 rounded-full bg-tomato px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                    🚫 {r.bad === "judge" ? A.voidedBy : A.invalidStamp}
                  </span>
                )}
              </span>
              <span className={`font-mono font-bold ${r.bad ? "line-through opacity-60" : ""}`}>{formatSeconds(r.ms)}s</span>
              <span className="hidden font-mono text-sm text-ink/70 sm:inline">{formatDiff(r.err)}</span>
              <span className="w-16 text-right font-mono font-bold">
                {r.bad ? 0 : roundPoints(r.err)} {P.points}
              </span>
              {onVoid && !r.bad && (
                <button
                  type="button"
                  onClick={() => onVoid(r.id)}
                  title={A.voidBtn}
                  className="pop-sm pressable rounded-lg bg-cream px-2 py-1 text-xs font-bold"
                >
                  ⚖️ {A.voidBtn}
                </button>
              )}
            </motion.li>
          );
        })}
      </ol>
      <div className="flex justify-center">{footer}</div>
    </div>
  );
}

function Standings({
  state,
  nameOf,
  images,
  podium,
}: {
  state: Parameters<typeof partyStandings>[0];
  nameOf: (id: string) => string;
  images: Record<string, { images: AvatarImages; frame: number }>;
  podium: boolean;
}) {
  const table = partyStandings(state);
  const top = [1, 0, 2].filter((i) => i < table.length);
  const medals = ["🥇", "🥈", "🥉"];
  const heights = ["h-40", "h-28", "h-20"];
  const colors = ["bg-sun", "bg-cyan", "bg-tomato"];
  return (
    <div className="pop flex flex-col items-center gap-6 rounded-4xl bg-cream p-5 sm:p-8">
      <h2 className="font-display text-3xl font-extrabold">{podium ? `🏆 ${L.podiumTitle}` : `📊 ${P.standings}`}</h2>
      {podium && (
        <div className="flex items-end justify-center gap-3">
          {top.map((pos) => {
            const s = table[pos];
            return (
              <motion.div
                key={s.id}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 * (2 - pos), type: "spring", stiffness: 200, damping: 16 }}
                className="flex w-28 flex-col items-center gap-1 sm:w-36"
              >
                <motion.div
                  animate={pos === 0 ? { y: [0, -12, 0] } : undefined}
                  transition={pos === 0 ? { repeat: Infinity, duration: 0.7, delay: 1, repeatDelay: 0.4 } : undefined}
                  className="relative"
                >
                  <AvatarImage
                    images={images[s.id]?.images}
                    frame={images[s.id]?.frame}
                    mood={pos === 0 ? "happy" : "neutral"}
                    size={pos === 0 ? 80 : 64}
                    alt={nameOf(s.id)}
                  />
                  <span className="absolute -right-3 -bottom-2 text-3xl">{medals[pos]}</span>
                </motion.div>
                <span className="max-w-full truncate font-display font-extrabold">{nameOf(s.id)}</span>
                {s.suspicious && <SuspiciousBadge />}
                <span className="font-mono text-sm">{s.total} pts</span>
                <div className={`pop-sm flex w-full justify-center rounded-t-2xl pt-2 font-display text-3xl font-extrabold ${colors[pos]} ${heights[pos]}`}>
                  {pos + 1}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <table className="w-full max-w-xl text-left">
        <thead>
          <tr className="border-b-2 border-line font-display">
            <th className="py-2">#</th>
            <th>{L.players}</th>
            <th className="text-right">{L.avgError}</th>
            <th className="text-right">{L.total}</th>
          </tr>
        </thead>
        <tbody>
          {table.map((s, i) => (
            <tr key={s.id} className="border-b border-ink/15">
              <td className="py-2 font-display font-bold">{i + 1}</td>
              <td className="font-semibold">
                {nameOf(s.id)} {s.suspicious && <SuspiciousBadge compact />}
              </td>
              <td className="text-right font-mono">{Number.isFinite(s.avgAbsErr) ? `±${formatDiff(s.avgAbsErr).slice(1)}` : "—"}</td>
              <td className="text-right font-mono font-bold">{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
