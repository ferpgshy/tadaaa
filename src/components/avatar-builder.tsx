"use client";

import { useState } from "react";
import { t } from "@/i18n";
import { AVATAR_PARTS as P, randomAvatar, type AvatarConfig, type AvatarPart } from "@/lib/avatar";
import { sfx } from "@/lib/sfx";
import { Avatar } from "./avatar";

const A = t.avatar;
type Tab = keyof typeof A.tabs;
const TABS: { id: Tab; icon: string; tiles?: AvatarPart; colors?: AvatarPart }[] = [
  { id: "face", icon: "🙂", tiles: "shape", colors: "skin" },
  { id: "eyes", icon: "👀", tiles: "eyes" },
  { id: "mouth", icon: "👄", tiles: "mouth" },
  { id: "top", icon: "🎩", tiles: "top", colors: "topColor" },
  { id: "extra", icon: "✨", tiles: "extra" },
  { id: "bg", icon: "🎨", colors: "bg" },
];

export function AvatarBuilder({
  value,
  onChange,
  compact = false,
}: {
  value: AvatarConfig;
  onChange: (v: AvatarConfig) => void;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("face");
  const [history, setHistory] = useState<AvatarConfig[]>([]);
  const current = TABS.find((x) => x.id === tab)!;

  const change = (next: AvatarConfig) => {
    setHistory((h) => [...h.slice(-19), value]);
    onChange(next);
  };

  return (
    <div className={`grid gap-5 ${compact ? "" : "md:grid-cols-[auto_minmax(0,1fr)] md:gap-8"}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="pop rounded-[28%] bg-cream p-1.5">
          <Avatar config={value} size={compact ? 120 : 176} title={A.preview} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              change(randomAvatar());
              sfx.good();
            }}
            className="pop-sm pressable rounded-xl bg-sun px-4 py-2 font-display font-bold"
          >
            🎲 {A.random}
          </button>
          <button
            type="button"
            disabled={!history.length}
            onClick={() => {
              const prev = history.at(-1);
              if (!prev) return;
              setHistory((h) => h.slice(0, -1));
              onChange(prev);
              sfx.click();
            }}
            className="pop-sm pressable rounded-xl bg-field px-4 py-2 font-display font-bold disabled:pointer-events-none disabled:opacity-40"
          >
            ↩ {A.undo}
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label={A.title}>
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => {
                setTab(x.id);
                sfx.click();
              }}
              className={`pop-sm pressable rounded-xl px-2 py-2 font-display text-sm font-bold whitespace-nowrap sm:px-3 sm:text-base ${
                tab === x.id ? "bg-sun" : "bg-field"
              }`}
            >
              <span aria-hidden>{x.icon}</span> {A.tabs[x.id]}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="flex flex-col gap-4">
          {current.tiles && (
            <div className={`grid gap-2 ${compact ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6"}`}>
              {P[current.tiles].map((name, i) => {
                const on = value[current.tiles!] === i;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={on}
                    aria-label={name}
                    title={name}
                    onClick={() => {
                      change({ ...value, [current.tiles!]: i });
                      sfx.click();
                    }}
                    className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 transition ${
                      on ? "pop-sm bg-sun" : "bg-field hover:scale-105"
                    }`}
                  >
                    <Avatar config={{ ...value, [current.tiles!]: i }} size={compact ? 52 : 60} title={name} />
                    <span className="text-xs font-semibold capitalize">{name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {current.colors && (
            <div className="flex flex-col gap-2">
              <span className="font-display font-bold text-ink/75">{A.colorOf[current.colors as "skin" | "topColor" | "bg"]}</span>
              <div className="flex flex-wrap gap-2.5">
                {P[current.colors].map((c, i) => {
                  const on = value[current.colors!] === i;
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${A.color} ${i + 1}`}
                      onClick={() => {
                        change({ ...value, [current.colors!]: i });
                        sfx.click();
                      }}
                      className={`size-10 rounded-full border-[3px] border-line transition ${
                        on ? "scale-110 outline-4 outline-offset-2 outline-[var(--focus)]" : "hover:scale-110"
                      }`}
                      style={{ background: c }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
