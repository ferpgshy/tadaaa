"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/i18n";
import { sfx, vibrate } from "@/lib/sfx";
import { TARGET_LIFETIME_MS, invalidByTargets, targetSchedule, type InvalidReason, type TargetSpec } from "./anticheat";
import { formatSeconds } from "./logic";

const L = t.blindTimer;
const A = t.anticheat;

export type HoldResult = { elapsedMs: number; invalid?: InvalidReason; missed: number };

/**
 * Cronômetro de segurar: segura o botão (ou a barra de espaço) enquanto conta e solta no alvo.
 * Durante a contagem aparecem alvos para tocar (ou apertar a letra) — assim as duas mãos ficam ocupadas.
 * Sair da tela (trocar de aba/app/janela) anula a jogada.
 */
export function HoldTimer({
  target,
  hideAfter,
  onStart,
  onResult,
}: {
  target: number;
  hideAfter: number;
  onStart?: () => void;
  onResult: (r: HoldResult) => void;
}) {
  const [running, setRunning] = useState(false);
  const [visible, setVisible] = useState<TargetSpec[]>([]);
  const [missed, setMissed] = useState(0);
  const [pop, setPop] = useState<number | null>(null);

  const startTs = useRef(0);
  const done = useRef(false);
  const schedule = useRef<TargetSpec[]>([]);
  const hits = useRef(new Set<number>());
  const missedRef = useRef(0);
  const display = useRef<HTMLSpanElement>(null);
  const holdPointer = useRef<number | null>(null);
  /** Alvos na tela agora (para o teclado achar o alvo pela letra). */
  const visibleRef = useRef<TargetSpec[]>([]);
  const hideMs = hideAfter * 1000;

  const start = useCallback(
    (ts: number) => {
      if (running || done.current) return;
      startTs.current = ts;
      schedule.current = targetSchedule(target, hideAfter);
      hits.current = new Set();
      missedRef.current = 0;
      setMissed(0);
      setVisible([]);
      setRunning(true);
      sfx.start();
      onStart?.();
    },
    [running, target, hideAfter, onStart],
  );

  const finish = useCallback(
    (ts: number, forced?: InvalidReason) => {
      if (!running || done.current) return;
      done.current = true;
      setRunning(false);
      visibleRef.current = [];
      setVisible([]);
      const elapsedMs = ts - startTs.current;
      const invalid = forced ?? (invalidByTargets(missedRef.current) ? "targets" : undefined);
      if (invalid) {
        sfx.buzz();
        vibrate([80, 60, 80]);
      } else sfx.stop();
      onResult({ elapsedMs, invalid, missed: missedRef.current });
    },
    [running, onResult],
  );

  const hit = useCallback((id: number) => {
    if (hits.current.has(id)) return;
    hits.current.add(id);
    visibleRef.current = visibleRef.current.filter((x) => x.id !== id);
    setVisible(visibleRef.current);
    setPop(id);
    sfx.click();
    vibrate(15);
  }, []);

  // Teclado: segura espaço para contar; letras acertam os alvos.
  useEffect(() => {
    const isField = (e: KeyboardEvent) => (e.target as HTMLElement).closest?.("input, textarea, select, dialog");
    const down = (e: KeyboardEvent) => {
      if (isField(e)) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) start(e.timeStamp);
        return;
      }
      if (!running || e.repeat) return;
      const key = e.key.toUpperCase();
      const target = visibleRef.current.find((x) => x.key === key);
      if (target) hit(target.id);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isField(e)) {
        e.preventDefault();
        finish(e.timeStamp);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [start, finish, hit, running]);

  // Saiu da tela durante a contagem: não vale.
  useEffect(() => {
    if (!running) return;
    const leave = () => finish(performance.now(), "focus");
    const vis = () => document.visibilityState === "hidden" && leave();
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [running, finish]);

  // Relógio + alvos (quais aparecem, quais expiraram).
  useEffect(() => {
    if (!running) return;
    let id = 0;
    let lastKey = "";
    const loop = () => {
      const elapsed = performance.now() - startTs.current;
      const el = display.current;
      if (el) {
        const hidden = elapsed >= hideMs;
        el.textContent = hidden ? L.hidden : formatSeconds(elapsed);
        el.dataset.hidden = String(hidden);
      }
      const now: TargetSpec[] = [];
      let miss = 0;
      for (const tg of schedule.current) {
        if (hits.current.has(tg.id)) continue;
        if (elapsed >= tg.at + TARGET_LIFETIME_MS) miss++;
        else if (elapsed >= tg.at) now.push(tg);
      }
      if (miss !== missedRef.current) {
        missedRef.current = miss;
        setMissed(miss);
        sfx.buzz();
      }
      const key = now.map((x) => x.id).join(",");
      if (key !== lastKey) {
        lastKey = key;
        visibleRef.current = now;
        setVisible(now);
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [running, hideMs]);

  return (
    <div
      className={`pop relative flex min-h-[340px] touch-manipulation flex-col items-center justify-center gap-4 overflow-hidden rounded-4xl p-5 text-center select-none sm:min-h-[400px] sm:gap-5 sm:p-8 lg:min-h-[480px] ${
        running ? "bg-cream" : "sunburst"
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="rounded-full bd bg-cream px-5 py-1 font-display text-xl font-bold">
        {L.targetLabel} <span className="text-accent">{formatSeconds(target * 1000)}s</span>
      </div>

      <div className="pop rounded-3xl bg-display px-6 py-4 sm:px-10 sm:py-5">
        <span
          key={String(running)}
          ref={display}
          data-hidden={running && hideMs === 0}
          className="block min-w-[5ch] font-mono text-6xl font-bold text-display-fg tabular-nums data-[hidden=true]:animate-pulse data-[hidden=true]:text-accent sm:text-8xl"
        >
          {running && hideMs === 0 ? L.hidden : "0,00"}
        </span>
      </div>

      {/* Botão de segurar */}
      <button
        type="button"
        aria-label={running ? A.release : A.hold}
        onPointerDown={(e) => {
          if (e.button !== 0 && e.pointerType === "mouse") return;
          e.preventDefault();
          holdPointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          start(e.timeStamp);
        }}
        onPointerUp={(e) => {
          if (holdPointer.current !== e.pointerId) return;
          holdPointer.current = null;
          finish(e.timeStamp);
        }}
        onPointerCancel={(e) => {
          if (holdPointer.current !== e.pointerId) return;
          holdPointer.current = null;
          finish(e.timeStamp);
        }}
        className={`pop relative z-10 grid size-28 place-items-center rounded-full font-display text-lg font-extrabold transition-transform sm:size-32 ${
          running ? "scale-95 bg-primary text-on-primary" : "bg-primary text-on-primary hover:scale-105"
        }`}
      >
        <span className="leading-tight">{running ? `✋ ${A.holding}` : `👆 ${A.holdShort}`}</span>
      </button>

      <p className="max-w-md font-display text-base font-extrabold sm:text-lg">
        {running ? (
          A.releaseHint
        ) : (
          <>
            <span className="pointer-coarse:hidden">{A.howDesktop}</span>
            <span className="hidden pointer-coarse:inline">{A.howTouch}</span>
          </>
        )}
      </p>

      {running && missed > 0 && (
        <p className="pop-sm rounded-full bg-tomato px-4 py-1 text-sm font-bold" role="status">
          ⚠️ {A.missed(missed)}
        </p>
      )}

      {/* Alvos */}
      <AnimatePresence>
        {visible.map((tg) => (
          <motion.button
            key={tg.id}
            type="button"
            aria-label={A.targetLabel(tg.key)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: pop === tg.id ? 1.6 : 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              hit(tg.id);
            }}
            className="pop-sm absolute z-20 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sun font-display text-3xl font-extrabold sm:size-[84px]"
            style={{ left: `${tg.x}%`, top: `${tg.y}%` }}
          >
            <span aria-hidden className="absolute inset-1 rounded-full border-4 border-dashed border-accent" />
            🎯
            <span className="absolute -right-1 -bottom-1 rounded-md bg-ink px-1.5 text-xs text-cream pointer-coarse:hidden">{tg.key}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
