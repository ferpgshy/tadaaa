"use client";

import { useState, type Ref } from "react";
import { t } from "@/i18n";
import { AVATARS, useProfile } from "@/lib/profile";
import { sfx } from "@/lib/sfx";

export function ProfileDialog({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const store = useProfile();
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  return (
    <dialog
      ref={ref}
      onToggle={(e) => {
        // Ao abrir, carrega o perfil salvo no formulário.
        if ((e.currentTarget as HTMLDialogElement).open) {
          setNick(store.nickname);
          setAvatar(store.avatar);
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="pop m-auto w-[min(92vw,460px)] rounded-3xl bg-cream p-0 text-ink backdrop:bg-black/60"
    >
      <form
        method="dialog"
        className="flex flex-col gap-5 p-6"
        onSubmit={() => {
          store.setProfile(nick, avatar);
          sfx.good();
        }}
      >
        <h2 className="font-display text-3xl font-extrabold">{t.profile.title}</h2>

        <label className="flex flex-col gap-2">
          <span className="font-display font-bold">{t.profile.nickname}</span>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={24}
            placeholder={t.profile.nicknamePlaceholder}
            className="pop-sm rounded-xl bg-field px-4 py-3 text-lg outline-none focus:bg-sun/20"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-display font-bold">{t.profile.avatar}</legend>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={avatar === a}
                onClick={() => {
                  setAvatar(a);
                  sfx.click();
                }}
                className={`grid aspect-square place-items-center rounded-xl border-[length:var(--line-w)] text-2xl transition ${
                  avatar === a ? "scale-110 border-line bg-sun shadow-pop-sm" : "border-transparent bg-field hover:border-ink/30"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="text-sm text-ink/60">{t.profile.note}</p>

        <button type="submit" className="pop pressable rounded-2xl bg-primary py-3 font-display text-xl font-extrabold text-on-primary">
          {t.profile.save}
        </button>
      </form>
    </dialog>
  );
}
