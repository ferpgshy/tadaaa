"use client";

import { useState } from "react";
import { t } from "@/i18n";
import type { GameCategory, GameEntry } from "@/games/catalog";
import { sfx } from "@/lib/sfx";
import { GameCard } from "./game-card";

/** Todos os jogos "em breve" numa grade só (sem buracos), com filtro por categoria. */
export function SoonGrid({ games }: { games: GameEntry[] }) {
  const [cat, setCat] = useState<GameCategory | "all">("all");
  const cats = (Object.keys(t.categories) as GameCategory[]).filter((c) => games.some((g) => g.category === c));
  const shown = cat === "all" ? games : games.filter((g) => g.category === cat);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.home.soonTitle}>
        {(["all", ...cats] as const).map((c) => {
          const count = c === "all" ? games.length : games.filter((g) => g.category === c).length;
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cat === c}
              onClick={() => {
                setCat(c);
                sfx.click();
              }}
              className={`pop-sm pressable rounded-full px-4 py-1.5 font-display font-bold ${cat === c ? "bg-sun" : "bg-cream"}`}
            >
              {c === "all" ? t.home.allCategories : t.categories[c]} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {shown.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
}
