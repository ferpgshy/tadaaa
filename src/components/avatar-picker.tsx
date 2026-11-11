"use client";

import { useState } from "react";
import { t } from "@/i18n";
import { randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { AVATARS } from "@/lib/profile";
import { sfx } from "@/lib/sfx";
import { AvatarBuilder } from "./avatar-builder";

/** Escolha entre emoji pronto ou avatar criado no editor (usado em Configurações e nas boas-vindas). */
export function AvatarPicker({
  emoji,
  custom,
  onEmoji,
  onCustom,
  compact = false,
}: {
  emoji: string;
  custom: AvatarConfig | null;
  onEmoji: (e: string) => void;
  onCustom: (cfg: AvatarConfig | null) => void;
  compact?: boolean;
}) {
  // Guarda o último desenho para não perder ao alternar para emoji e voltar.
  const [draft, setDraft] = useState<AvatarConfig | null>(custom);
  const mode = custom ? "custom" : "emoji";

  return (
    <div className="flex flex-col gap-4">
      <div className="pop-sm flex w-fit rounded-2xl bg-field p-1" role="radiogroup" aria-label={t.profile.avatar}>
        {(["emoji", "custom"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => {
              sfx.click();
              // Sorteio só no clique (nunca na renderização do servidor).
              if (m === "custom") onCustom(custom ?? draft ?? randomAvatar());
              else {
                if (custom) setDraft(custom);
                onCustom(null);
              }
            }}
            className={`rounded-xl px-4 py-2 font-display font-bold transition ${mode === m ? "bg-sun shadow-pop-sm" : "opacity-80 hover:opacity-100"}`}
          >
            {m === "emoji" ? `😎 ${t.avatar.modeEmoji}` : `🎨 ${t.avatar.modeCustom}`}
          </button>
        ))}
      </div>

      {custom ? (
        <AvatarBuilder
          compact={compact}
          value={custom}
          onChange={(cfg) => {
            setDraft(cfg);
            onCustom(cfg);
          }}
        />
      ) : (
        <div className={compact ? "grid grid-cols-6 gap-2 sm:flex sm:flex-wrap" : "flex flex-wrap gap-2"}>
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={emoji === a}
              onClick={() => {
                onEmoji(a);
                sfx.click();
              }}
              className={`grid aspect-square place-items-center rounded-xl text-2xl transition sm:size-14 sm:text-3xl ${
                emoji === a ? "pop-sm scale-105 bg-sun" : "bg-field hover:scale-105"
              } ${compact ? "" : "size-12"}`}
            >
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
