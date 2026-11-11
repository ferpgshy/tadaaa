"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatSeconds } from "@/games/cronometro-cego/logic";
import { t } from "@/i18n";
import { sfx } from "@/lib/sfx";

const L = t.blindTimer;

/** Uma rodada do Cronômetro Cego no próprio celular: começa, para e devolve o tempo. */
export function OnlineRound({ target, hideAfter, onDone }: { target: number; hideAfter: number; onDone: (elapsedMs: number) => void }) {
  const [phase, setPhase] = useState<"ready" | "running">("ready");
  const start = useRef(0);
  const display = useRef<HTMLSpanElement>(null);
  const hideMs = hideAfter * 1000;

  const act = useCallback(
    (ts: number) => {
      if (phase === "ready") {
        start.current = ts;
        sfx.start();
        setPhase("running");
      } else {
        sfx.stop();
        onDone(ts - start.current);
      }
    },
    [phase, onDone],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      if ((e.target as HTMLElement).closest?.("input, textarea, button, a, dialog")) return;
      e.preventDefault();
      if (!e.repeat) act(e.timeStamp);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  useEffect(() => {
    if (phase !== "running") return;
    let id = 0;
    const loop = () => {
      const el = display.current;
      const elapsed = performance.now() - start.current;
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

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label={phase === "ready" ? L.pressToStart : L.pressToStop}
      onPointerDown={(e) => {
        e.preventDefault();
        act(e.timeStamp);
      }}
      className="pop sunburst flex min-h-[320px] cursor-pointer touch-manipulation flex-col items-center justify-center gap-5 rounded-4xl p-5 text-center select-none sm:min-h-[380px]"
    >
      <div className="rounded-full bd bg-cream px-5 py-1 font-display text-xl font-bold">
        {L.targetLabel} <span className="text-accent">{formatSeconds(target * 1000)}s</span>
      </div>
      <div className="pop rounded-3xl bg-display px-6 py-5 sm:px-10 sm:py-6">
        <span
          key={phase}
          ref={display}
          data-hidden={phase === "running" && hideMs === 0}
          className="block min-w-[5ch] font-mono text-7xl font-bold text-display-fg tabular-nums data-[hidden=true]:animate-pulse data-[hidden=true]:text-accent sm:text-8xl"
        >
          {phase === "running" && hideMs === 0 ? L.hidden : "0,00"}
        </span>
      </div>
      <p className="font-display text-xl font-extrabold sm:text-2xl">
        <span className="pointer-coarse:hidden">{phase === "ready" ? L.pressToStart : L.pressToStop}</span>
        <span className="hidden pointer-coarse:inline">{phase === "ready" ? L.tapToStart : L.tapToStop}</span>
      </p>
    </div>
  );
}
