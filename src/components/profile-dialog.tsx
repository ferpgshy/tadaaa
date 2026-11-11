"use client";

import Link from "next/link";
import { useState, type Ref } from "react";
import { t } from "@/i18n";
import { AVATARS, useProfile } from "@/lib/profile";
import { sfx } from "@/lib/sfx";
import { ProfileAvatar } from "./profile-avatar";

export function ProfileDialog({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const store = useProfile();
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  // Escolher um emoji aqui troca o avatar criado pelo emoji.
  const [pickedEmoji, setPickedEmoji] = useState(false);

  return (
    <dialog
      ref={ref}
      onToggle={(e) => {
        // Ao abrir, carrega o perfil salvo no formulário.
        if ((e.currentTarget as HTMLDialogElement).open) {
          setNick(store.nickname);
          setAvatar(store.avatar);
          setPickedEmoji(false);
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
          store.setProfile(nick.trim(), avatar);
          if (pickedEmoji) store.setAvatarCustom(null);
          sfx.good();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl font-extrabold">{t.profile.title}</h2>
          <button
            type="button"
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
            aria-label={t.profile.close}
            className="pop-sm pressable grid size-10 shrink-0 place-items-center rounded-xl bg-field text-xl font-bold"
          >
            ×
          </button>
        </div>

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
          <Link
            href="/configuracoes#perfil"
            onClick={(e) => e.currentTarget.closest("dialog")?.close()}
            className="pop-sm pressable mb-2 flex items-center gap-3 rounded-2xl bg-sun p-2 pr-4 font-display font-bold"
          >
            <ProfileAvatar size={44} />
            <span>🎨 {store.avatarCustom ? t.avatar.edit : t.avatar.create} →</span>
          </Link>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={avatar === a}
                onClick={() => {
                  setAvatar(a);
                  setPickedEmoji(true);
                  sfx.click();
                }}
                className={`grid aspect-square place-items-center rounded-xl border-[length:var(--line-w)] text-2xl transition ${
                  avatar === a && (pickedEmoji || !store.avatarCustom) ? "scale-110 border-line bg-sun shadow-pop-sm" : "border-transparent bg-field hover:border-ink/30"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="text-sm text-ink/70">{t.profile.note}</p>

        <button type="submit" className="pop pressable rounded-2xl bg-primary py-3 font-display text-xl font-extrabold text-on-primary">
          {t.profile.save}
        </button>
      </form>
    </dialog>
  );
}
