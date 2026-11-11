"use client";

import { t } from "@/i18n";
import type { ThemeId } from "@/lib/settings";

const S = t.settings;

/** Miniatura de um tema: o próprio site desenhado com as cores daquele tema. */
export function ThemeCard({
  id,
  active,
  onPick,
  compact = false,
}: {
  id: ThemeId;
  active: boolean;
  onPick: () => void;
  /** Versão menor, usada nas boas-vindas. */
  compact?: boolean;
}) {
  const info = S.themes[id];
  return (
    <button
      type="button"
      data-theme={id}
      aria-pressed={active}
      onClick={onPick}
      className={`pop pressable flex flex-col overflow-hidden rounded-3xl bg-paper text-left text-ink ${
        active ? "outline-4 outline-offset-4 outline-[var(--focus)]" : ""
      }`}
    >
      <span className="bd-b flex items-center justify-between bg-header px-3 py-2 text-header-fg">
        <span className="pop-sm rounded-lg bg-sun px-2 py-0.5 font-display text-sm font-extrabold text-ink">
          {t.brand.name}
          <span className="text-accent">!</span>
        </span>
        <span className="flex gap-1" aria-hidden>
          <span className="size-2.5 rounded-full bg-current opacity-60" />
          <span className="size-2.5 rounded-full bg-current opacity-60" />
        </span>
      </span>
      <span className={`sunburst bd-b flex items-center gap-3 ${compact ? "p-2.5" : "p-4"}`}>
        <span className="pop-sm flex flex-1 flex-col gap-2 rounded-xl bg-cream p-3">
          <span className="font-display text-sm font-extrabold">⏱️ {S.preview.card}</span>
          <span className="flex items-center gap-2">
            <span className="pop-sm rounded-lg bg-primary px-3 py-1 font-display text-xs font-extrabold text-on-primary">
              {S.preview.button}
            </span>
            {!compact && (
              <span className="rounded-md bg-display px-2 py-0.5 font-mono text-xs font-bold text-display-fg">9,98</span>
            )}
          </span>
        </span>
      </span>
      <span className={`flex items-center justify-between gap-3 bg-cream ${compact ? "p-3" : "p-4"}`}>
        <span>
          <span className={`block font-display font-extrabold ${compact ? "text-base" : "text-lg"}`}>{info.name}</span>
          {!compact && <span className="block text-sm text-ink/70">{info.hint}</span>}
        </span>
        {active && (
          <span className="pop-sm grid size-8 shrink-0 place-items-center rounded-full bg-lime font-bold" aria-hidden>
            ✓
          </span>
        )}
      </span>
    </button>
  );
}
