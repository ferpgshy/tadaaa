"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n";
import { useProfile } from "@/lib/profile";
import { sfx } from "@/lib/sfx";
import { useHydrated } from "@/lib/use-hydrated";
import { AvatarImage } from "@/components/avatar-image";
import { useCreateRoom } from "@/components/party/party-entry";
import type { AvatarMood } from "@/lib/avatar";
import type { AvatarImages } from "@/lib/profile";
import {
  HIDE_OPTIONS,
  MAX_PLAYERS,
  ROUND_OPTIONS,
  TARGETS,
  errorMs,
  formatDiff,
  formatSeconds,
  roundPoints,
  standings,
  surpriseTarget,
  verdict,
  type Shot,
  type VerdictKey,
} from "./logic";

const L = t.blindTimer;
const SLUG = "cronometro-cego";

type Phase = "setup" | "ready" | "running" | "result" | "podium";
type Config = {
  mode: "solo" | "group";
  target: number | "surprise";
  hideAfter: number;
  rounds: number;
  players: string[];
  /** Avatar de cada jogador (modo Galera), na mesma ordem de players. */
  avatars?: (PlayerAvatar | null)[];
};

type PlayerAvatar = { images: AvatarImages | null; frame: number };

/** Reação do avatar ao resultado. */
const moodFor = (v: VerdictKey): AvatarMood =>
  v === "perfect" || v === "surgical" || v === "close" ? "happy" : v === "broken" ? "sad" : v === "meh" ? "shock" : "neutral";

const verdictColor: Record<VerdictKey, string> = {
  perfect: "bg-lime",
  surgical: "bg-lime",
  close: "bg-cyan",
  almost: "bg-sun",
  meh: "bg-tomato",
  broken: "bg-pink",
};

export function BlindTimerGame() {
  const profile = useProfile();
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<Config | null>(null);
  const [turn, setTurn] = useState(0);
  const [target, setTarget] = useState(10);
  const [shots, setShots] = useState<Shot[]>([]);
  const [recordStatus, setRecordStatus] = useState<"first" | "better" | false>(false);

  const startRef = useRef(0);
  const stoppedAtRef = useRef(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const players = config?.mode === "group" ? config.players : [profile.nickname || t.profile.defaultNick];
  const playerIdx = turn % players.length;
  const round = Math.floor(turn / players.length);
  const totalTurns = config?.mode === "group" ? config.rounds * players.length : Infinity;
  const lastShot = shots.at(-1);
  const avatarOf = (idx: number): PlayerAvatar | null =>
    config?.mode === "group" ? (config.avatars?.[idx] ?? null) : { images: profile.avatarImages, frame: profile.avatar?.frame ?? 0 };

  const pickTarget = (c: Config) => (c.target === "surprise" ? surpriseTarget() : c.target);

  const begin = (c: Config) => {
    setConfig(c);
    setShots([]);
    setTurn(0);
    setTarget(pickTarget(c));
    setPhase("ready");
    if (c.mode === "group") profile.setLastPlayers(c.players);
  };

  const next = useCallback(() => {
    if (!config) return;
    if (turn + 1 >= totalTurns) {
      sfx.fanfare();
      setPhase("podium");
      return;
    }
    setTurn((n) => n + 1);
    // Mesmo alvo para todos na rodada; sorteia de novo quando a rodada vira.
    const nextRound = Math.floor((turn + 1) / players.length);
    if (config.mode === "solo" || nextRound !== round) setTarget(pickTarget(config));
    setPhase("ready");
  }, [config, turn, totalTurns, players.length, round]);

  const act = useCallback(
    (ts: number) => {
      if (phase === "ready") {
        startRef.current = ts;
        sfx.start();
        setPhase("running");
      } else if (phase === "running") {
        const elapsedMs = ts - startRef.current;
        stoppedAtRef.current = performance.now();
        const shot: Shot = { player: playerIdx, round, target, elapsedMs };
        setShots((s) => [...s, shot]);
        const err = errorMs(elapsedMs, target);
        const v = verdict(err);
        const saved =
          config?.mode === "solo" ? profile.saveLowerRecord(`${SLUG}:${target}`, Math.round(Math.abs(err))) : false;
        // Só comemora quando bate uma marca anterior (a primeira jogada sempre "seria" recorde).
        setRecordStatus(saved);
        sfx.stop();
        setTimeout(() => (v === "perfect" || v === "surgical" ? sfx.win() : v === "broken" ? sfx.buzz() : sfx.good()), 150);
        setPhase("result");
      } else if (phase === "result") {
        // Evita pular o resultado com um toque duplo sem querer.
        if (performance.now() - stoppedAtRef.current > 700) next();
      }
    },
    [phase, playerIdx, round, target, config, profile, next],
  );

  useEffect(() => {
    if (phase !== "ready" && phase !== "running" && phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      // Esc volta para as regras (fora do meio de uma jogada).
      if (e.key === "Escape" && phase !== "running" && !document.querySelector("dialog[open]")) {
        setPhase("setup");
        return;
      }
      if (e.code !== "Space" && e.code !== "Enter") return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, button, a, dialog")) return;
      e.preventDefault();
      if (!e.repeat) act(e.timeStamp);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, act]);

  // No resultado, garante que os botões de ação (De novo / Próximo) apareçam na tela.
  useEffect(() => {
    if (phase !== "result") return;
    const id = setTimeout(() => actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 350);
    return () => clearTimeout(id);
  }, [phase]);

  // Quando muda de tela (regras / jogo / pódio), garante que o topo do jogo fique visível.
  const view = phase === "setup" || phase === "podium" ? phase : "play";
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    const el = document.getElementById("game");
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [view]);

  const hideMs = (config?.hideAfter ?? 3) * 1000;
  useEffect(() => {
    if (phase !== "running") return;
    let id = 0;
    const loop = () => {
      const el = displayRef.current;
      const elapsed = performance.now() - startRef.current;
      if (el) {
        const hidden = elapsed >= hideMs;
        el.textContent = hidden ? L.hidden : formatSeconds(elapsed);
        el.dataset.hidden = String(hidden);
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [phase, hideMs]);

  if (phase === "setup" || !config) return <Setup initial={config} onStart={begin} />;

  if (phase === "podium") {
    return (
      <Podium
        players={players}
        avatars={config.mode === "group" ? config.avatars : [avatarOf(0)]}
        shots={shots}
        onAgain={() => begin(config)}
        onSetup={() => setPhase("setup")}
      />
    );
  }

  const err = lastShot ? errorMs(lastShot.elapsedMs, lastShot.target) : 0;
  const v = verdict(err);
  const record = profile.records[`${SLUG}:${target}`];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="pop-sm flex min-w-0 items-center gap-2 rounded-2xl bg-cream px-3 py-1.5 sm:gap-3 sm:px-4 sm:py-2">
          <AvatarImage images={avatarOf(playerIdx)?.images} frame={avatarOf(playerIdx)?.frame} size={32} alt={players[playerIdx]} />
          <span className="shrink-0 text-sm text-ink/70 sm:text-base">{L.turnOf}</span>
          <span className="truncate font-display text-xl font-extrabold sm:text-2xl">{players[playerIdx]}</span>
        </div>
        {config.mode === "group" && (
          <div className="pop-sm shrink-0 rounded-2xl bg-cream px-3 py-1.5 font-display font-bold sm:px-4 sm:py-2">
            <span className="hidden sm:inline">{L.round} </span>
            {round + 1}/{config.rounds}
          </div>
        )}
        <button
          type="button"
          onClick={() => setPhase("setup")}
          aria-label={L.changeSetup}
          className="pop-sm pressable shrink-0 rounded-2xl bg-cream px-3 py-1.5 font-display font-bold sm:px-4 sm:py-2"
        >
          ⚙️<span className="hidden sm:inline"> {L.changeSetup}</span>
        </button>
      </div>

      <div
        role="button"
        tabIndex={-1}
        aria-label={phase === "ready" ? L.pressToStart : phase === "running" ? L.pressToStop : undefined}
        onPointerDown={(e) => {
          if (phase === "ready" || phase === "running") {
            e.preventDefault();
            act(e.timeStamp);
          }
        }}
        className={`pop relative flex min-h-[320px] touch-manipulation flex-col items-center justify-center gap-4 sm:min-h-[380px] sm:gap-6 overflow-hidden rounded-4xl p-5 text-center select-none sm:p-8 lg:min-h-[480px] ${
          phase === "result" ? "bg-cream" : "sunburst cursor-pointer"
        }`}
      >
        <div className="rounded-full bd bg-cream px-5 py-1 font-display text-xl font-bold">
          {L.targetLabel} <span className="text-accent">{formatSeconds(target * 1000)}s</span>
        </div>

        {phase !== "result" && (
          <>
            <div className="pop rounded-3xl bg-display px-6 py-5 sm:px-10 sm:py-6">
              <span
                key={phase}
                ref={displayRef}
                data-hidden={phase === "running" && hideMs === 0}
                className="block min-w-[5ch] font-mono text-7xl font-bold text-display-fg tabular-nums data-[hidden=true]:animate-pulse data-[hidden=true]:text-accent sm:text-8xl xl:text-9xl"
              >
                {phase === "running" && hideMs === 0 ? L.hidden : "0,00"}
              </span>
            </div>
            <p className="font-display text-xl font-extrabold sm:text-2xl">
              <span className="pointer-coarse:hidden">{phase === "ready" ? L.pressToStart : L.pressToStop}</span>
              <span className="hidden pointer-coarse:inline">{phase === "ready" ? L.tapToStart : L.tapToStop}</span>
            </p>
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {phase === "result" && lastShot
            ? `${L.stoppedAt} ${formatSeconds(lastShot.elapsedMs)}s. ${L.verdicts[v]}. ${L.diff} ${formatDiff(err)}.`
            : phase === "running"
              ? L.running
              : ""}
        </p>
        {phase === "result" && lastShot && (
          <ResultView
            elapsedMs={lastShot.elapsedMs}
            err={err}
            v={v}
            status={recordStatus}
            avatar={avatarOf(lastShot.player)}
            name={players[lastShot.player]}
            record={config.mode === "solo" ? record : undefined}
          />
        )}
      </div>

      {phase === "result" && lastShot && (
        <div ref={actionsRef} className="flex scroll-mb-6 flex-wrap justify-center gap-3 sm:gap-4">
          {turn + 1 >= totalTurns ? (
            <BigButton color="bg-primary text-on-primary" onClick={next}>
              🏆 {L.seeResults}
            </BigButton>
          ) : (
            <BigButton color="bg-primary text-on-primary" onClick={next}>
              {config.mode === "solo" ? `🔁 ${L.again}` : `${L.next}: ${players[(turn + 1) % players.length]} →`}
            </BigButton>
          )}
          {config.mode === "solo" && <ShareButton elapsedMs={lastShot.elapsedMs} target={lastShot.target} />}
        </div>
      )}

      {config.mode === "solo" && shots.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {shots.slice(-8).map((s, i) => {
            const e = errorMs(s.elapsedMs, s.target);
            return (
              <span key={i} className={`rounded-full border-2 border-line px-3 py-0.5 font-mono ${verdictColor[verdict(e)]}`}>
                {formatDiff(e)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BlindTimerRecords() {
  const hydrated = useHydrated();
  const records = useProfile((s) => s.records);
  const mine = hydrated
    ? Object.entries(records)
        .filter(([k]) => k.startsWith(`${SLUG}:`))
        .map(([k, v]) => [Number(k.split(":")[1]), v] as const)
        .sort((a, b) => a[0] - b[0])
    : [];

  return (
    <div className="pop-sm rounded-3xl bg-cream p-5">
      <h2 className="mb-3 font-display text-xl font-extrabold">⭐ {L.recordsTitle}</h2>
      {mine.length === 0 ? (
        <p className="text-ink/70">{L.noRecords}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {mine.map(([target, err]) => (
            <li key={target} className="flex items-center justify-between border-b border-ink/10 pb-2 last:border-0">
              <span className="font-display font-bold">
                {L.target} {target}
                {L.seconds}
              </span>
              <span className={`rounded-full border-2 border-line px-3 font-mono text-sm ${verdictColor[verdict(err)]}`}>
                ±{formatDiff(err).slice(1)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultView({
  elapsedMs,
  err,
  v,
  status,
  record,
  avatar,
  name,
}: {
  elapsedMs: number;
  err: number;
  v: VerdictKey;
  status: "first" | "better" | false;
  record?: number;
  avatar: PlayerAvatar | null;
  name: string;
}) {
  const isRecord = status === "better";
  const mood = moodFor(v);
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {avatar?.images && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={
            mood === "happy"
              ? { scale: 1, opacity: 1, y: [0, -16, 0, -8, 0] }
              : mood === "sad"
                ? { scale: 1, opacity: 1, x: [0, -6, 6, -4, 4, 0] }
                : { scale: [0.6, 1.15, 1], opacity: 1 }
          }
          transition={{ duration: 0.9, delay: 0.25 }}
        >
          <AvatarImage images={avatar.images} frame={avatar.frame} mood={mood} size={88} alt={name} />
        </motion.div>
      )}
      <p className="font-display text-lg text-ink/70 sm:text-xl">{L.stoppedAt}</p>
      <motion.p
        initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 14 }}
        className="font-mono text-7xl font-bold tabular-nums sm:text-8xl xl:text-9xl"
      >
        {formatSeconds(elapsedMs)}s
      </motion.p>
      <motion.div
        initial={{ scale: 2, opacity: 0, rotate: 10 }}
        animate={{ scale: 1, opacity: 1, rotate: -3 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 12 }}
        className={`pop rounded-2xl px-6 py-2 text-center font-display text-2xl font-extrabold sm:text-4xl ${verdictColor[v]}`}
      >
        {L.verdicts[v]}
      </motion.div>
      <p className="text-center font-display text-lg sm:text-xl">
        {L.diff}: <span className="font-mono font-bold">{formatDiff(err)}</span> · {roundPoints(err)} {L.points}
      </p>
      <AnimatePresence>
        {isRecord && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-full bg-primary px-4 py-1 font-display font-bold text-on-primary"
          >
            ⭐ {L.newRecord}
          </motion.p>
        )}
      </AnimatePresence>
      {status === "first" && <p className="text-ink/70">{L.firstMark}</p>}
      {record !== undefined && !status && (
        <p className="text-ink/70">
          {L.record}: <span className="font-mono">±{formatDiff(record).slice(1)}</span>
        </p>
      )}
    </div>
  );
}

function BigButton({ children, color, onClick }: { children: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pop pressable rounded-2xl px-8 py-4 font-display text-2xl font-extrabold ${color}`}
    >
      {children}
    </button>
  );
}

function ShareButton({ elapsedMs, target }: { elapsedMs: number; target: number }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${location.origin}/jogos/${SLUG}`;
    const text = L.shareText(formatSeconds(elapsedMs), formatSeconds(target * 1000), url);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* usuário cancelou */
    }
  };
  return (
    <BigButton color="bg-cyan" onClick={share}>
      {copied ? `✅ ${L.copied}` : `📣 ${L.share}`}
    </BigButton>
  );
}

function Setup({ initial, onStart }: { initial: Config | null; onStart: (c: Config) => void }) {
  const hydrated = useHydrated();
  const { nickname, lastPlayers } = useProfile();
  const [mode, setMode] = useState<Config["mode"]>(initial?.mode ?? "solo");
  const [target, setTarget] = useState<Config["target"]>(initial?.target ?? 10);
  const [hideAfter, setHideAfter] = useState(initial?.hideAfter ?? 3);
  const [rounds, setRounds] = useState(initial?.rounds ?? 3);
  const [players, setPlayers] = useState<string[] | null>(initial?.players ?? null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [salts, setSalts] = useState<Record<string, number>>({});
  const createRoom = useCreateRoom();
  const [lib, setLib] = useState<typeof import("@/lib/avatar-render") | null>(null);
  // Seletores separados: um objeto novo a cada leitura faria o zustand re-renderizar sem parar.
  const profileImages = useProfile((p) => p.avatarImages);
  const profileFrame = useProfile((p) => p.avatar?.frame ?? 0);

  useEffect(() => {
    if (mode === "group" && !lib) void import("@/lib/avatar-render").then(setLib);
  }, [mode, lib]);

  const defaults = lastPlayers.length ? lastPlayers : [nickname || "Jogador 1", "Jogador 2"];
  const list = players ?? (hydrated ? defaults : []);

  // Cada jogador ganha um avatar sorteado pelo nome (o seu usa o avatar do perfil). 🔄 sorteia outro.
  // A lista é recriada a cada render; a chave de texto evita refazer os avatares à toa.
  const listKey = list.join("\n");
  const avatars = useMemo<(PlayerAvatar | null)[]>(
    () =>
      (listKey ? listKey.split("\n") : []).map((name) => {
        if (name === nickname && profileImages && !salts[name]) return { images: profileImages, frame: profileFrame };
        if (!lib) return null;
        const cfg = lib.avatarFromName(name, salts[name] ?? 0);
        return { images: lib.renderAllMoods(cfg), frame: 0 };
      }),
    [listKey, lib, salts, nickname, profileImages, profileFrame],
  );

  const addPlayer = () => {
    const name = draft.trim().slice(0, 20);
    if (!name) return;
    if (list.length >= MAX_PLAYERS) {
      setError(L.maxPlayers);
      return;
    }
    if (list.some((p) => p.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError(L.duplicatePlayer);
      sfx.buzz();
      return;
    }
    setPlayers([...list, name]);
    setDraft("");
    setError("");
    sfx.click();
  };

  const start = () => {
    if (mode === "group" && list.length < 2) {
      setError(L.needPlayers);
      sfx.buzz();
      return;
    }
    sfx.click();
    onStart({ mode, target, hideAfter, rounds, players: list, avatars });
  };

  return (
    <div className="pop flex flex-col gap-7 rounded-4xl bg-cream p-5 sm:p-8 lg:p-10">
      <h2 className="font-display text-3xl font-extrabold">{L.setupTitle}</h2>

      <Field label={L.mode}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(
            [
              ["solo", "🧍", L.modeSolo, L.modeSoloHint],
              ["group", "🎉", L.modeGroup, L.modeGroupHint],
              ["online", "🌐", t.party.online, t.party.onlineHint],
            ] as const
          ).map(([value, icon, label, hint]) => (
            <Choice
              key={value}
              active={mode === value}
              onClick={() => (value === "online" ? createRoom() : setMode(value))}
              className="flex min-w-0 flex-col items-start gap-2 p-4 text-left sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="text-3xl sm:text-4xl">{icon}</span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-extrabold sm:text-2xl">{label}</span>
                <span className="block text-sm text-ink/70">{hint}</span>
              </span>
            </Choice>
          ))}
        </div>
      </Field>

      <Field label={L.target}>
        <div className="flex flex-wrap gap-3">
          {TARGETS.map((s) => (
            <Choice key={s} active={target === s} onClick={() => setTarget(s)}>
              {s}
              {L.seconds}
            </Choice>
          ))}
          <Choice active={target === "surprise"} onClick={() => setTarget("surprise")}>
            🎲 {L.surprise}
          </Choice>
        </div>
      </Field>

      <Field label={L.hideAfter}>
        <div className="flex flex-wrap gap-3">
          {HIDE_OPTIONS.map((s) => (
            <Choice key={s} active={hideAfter === s} onClick={() => setHideAfter(s)}>
              {s === 0 ? `🙈 ${L.hideNever}` : `${s}${L.seconds}`}
            </Choice>
          ))}
        </div>
      </Field>

      {mode === "group" && (
        <>
          <Field label={`${L.players} (${list.length}/${MAX_PLAYERS})`}>
            <div className="flex flex-wrap gap-2">
              {list.map((p, i) => (
                <span key={`${p}-${i}`} className="pop-sm flex items-center gap-2 rounded-full bg-sun py-1 pr-1 pl-1 font-display font-bold">
                  <AvatarImage images={avatars[i]?.images} frame={avatars[i]?.frame} size={34} alt={p} className="rounded-full" />
                  {p}
                  <button
                    type="button"
                    aria-label={`${t.avatar.reroll}: ${p}`}
                    title={t.avatar.reroll}
                    onClick={() => {
                      setSalts((s) => ({ ...s, [p]: (s[p] ?? 0) + 1 }));
                      sfx.click();
                    }}
                    className="grid size-7 place-items-center rounded-full bg-cream text-sm hover:bg-cyan"
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    aria-label={`${L.removePlayer} ${p}`}
                    onClick={() => setPlayers(list.filter((_, j) => j !== i))}
                    className="grid size-7 place-items-center rounded-full bg-cream hover:bg-primary hover:text-on-primary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form
              className="mt-3 flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                addPlayer();
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={L.playerPlaceholder}
                maxLength={20}
                className="pop-sm min-w-0 flex-1 rounded-xl bg-field px-4 py-2 text-lg outline-none focus:bg-sun/20"
              />
              <button type="submit" className="pop-sm pressable rounded-xl bg-cyan px-5 font-display font-bold">
                + {L.addPlayer}
              </button>
            </form>
          </Field>

          <Field label={L.rounds}>
            <div className="flex flex-wrap gap-3">
              {ROUND_OPTIONS.map((r) => (
                <Choice key={r} active={rounds === r} onClick={() => setRounds(r)}>
                  {r}
                </Choice>
              ))}
            </div>
          </Field>
        </>
      )}

      {error && <p className="font-bold text-accent">{error}</p>}

      <button
        type="button"
        onClick={start}
        className="pop pressable self-start rounded-2xl bg-primary px-10 py-4 font-display text-2xl font-extrabold text-on-primary"
      >
        ▶ {L.start}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-display text-lg font-bold text-ink/70">{label}</span>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
  className = "px-5 py-2 font-display text-lg font-bold",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        onClick();
        sfx.click();
      }}
      className={`pop-sm pressable rounded-2xl ${active ? "bg-sun" : "bg-field"} ${className}`}
    >
      {children}
    </button>
  );
}

function Podium({
  players,
  avatars,
  shots,
  onAgain,
  onSetup,
}: {
  players: string[];
  avatars?: (PlayerAvatar | null)[];
  shots: Shot[];
  onAgain: () => void;
  onSetup: () => void;
}) {
  const table = standings(players.length, shots);
  const medals = ["🥇", "🥈", "🥉"];
  const podiumColors = ["bg-sun", "bg-cyan", "bg-tomato"];
  const order = [1, 0, 2].filter((i) => i < table.length);
  const heights = ["h-48", "h-36", "h-28"];

  return (
    <div className="pop flex flex-col items-center gap-10 rounded-4xl bg-cream p-6 sm:p-10">
      <h2 className="font-display text-5xl font-extrabold">🏆 {L.podiumTitle}</h2>

      <div className="flex items-end justify-center gap-4">
        {order.map((pos, i) => {
          const s = table[pos];
          return (
            <motion.div
              key={s.player}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 * (2 - pos), type: "spring", stiffness: 200, damping: 16 }}
              className="flex w-36 flex-col items-center gap-2"
            >
              <motion.div
                animate={pos === 0 ? { y: [0, -14, 0] } : undefined}
                transition={pos === 0 ? { repeat: Infinity, duration: 0.7, delay: 1, repeatDelay: 0.4 } : undefined}
                className="relative"
              >
                <AvatarImage
                  images={avatars?.[s.player]?.images}
                  frame={avatars?.[s.player]?.frame}
                  mood={pos === 0 ? "happy" : pos === table.length - 1 && table.length > 2 ? "sad" : "neutral"}
                  size={pos === 0 ? 84 : 68}
                  alt={players[s.player]}
                />
                <span className="absolute -right-3 -bottom-2 text-3xl">{medals[pos]}</span>
              </motion.div>
              <span className="max-w-full truncate font-display text-xl font-extrabold">{players[s.player]}</span>
              <span className="font-mono">{s.total} pts</span>
              <div
                className={`pop-sm flex w-full items-start justify-center rounded-t-2xl pt-3 font-display text-4xl font-extrabold ${podiumColors[pos]} ${heights[pos]}`}
                data-order={i}
              >
                {pos + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      <table className="w-full max-w-xl text-left">
        <thead>
          <tr className="bd-b font-display">
            <th className="py-2">#</th>
            <th>{L.players}</th>
            <th className="text-right">{L.avgError}</th>
            <th className="text-right">{L.total}</th>
          </tr>
        </thead>
        <tbody>
          {table.map((s, i) => (
            <tr key={s.player} className="border-b border-ink/15">
              <td className="py-2 font-display font-bold">{i + 1}</td>
              <td className="font-semibold">{players[s.player]}</td>
              <td className="text-right font-mono">±{formatDiff(s.avgAbsErr).slice(1)}</td>
              <td className="text-right font-mono font-bold">{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap justify-center gap-4">
        <BigButton color="bg-primary text-on-primary" onClick={onAgain}>
          🔁 {L.playAgain}
        </BigButton>
        <BigButton color="bg-cream" onClick={onSetup}>
          ⚙️ {L.changeSetup}
        </BigButton>
      </div>
    </div>
  );
}
