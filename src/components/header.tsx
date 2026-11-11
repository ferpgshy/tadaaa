"use client";

import Link from "next/link";
import { useRef } from "react";
import { t } from "@/i18n";
import { useProfile } from "@/lib/profile";
import { useHydrated } from "@/lib/use-hydrated";
import { ProfileDialog } from "./profile-dialog";

export function Header() {
  const hydrated = useHydrated();
  const { nickname, avatar, muted, toggleMuted } = useProfile();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-grape">
      <div className="marquee-lights h-3 bg-ink" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="pop-sm pressable -rotate-2 rounded-xl bg-sun px-4 py-1 font-display text-2xl font-extrabold tracking-tight"
        >
          {t.brand.name}
          <span className="text-pink">!</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/#jogos"
            className="hidden rounded-lg px-3 py-2 font-display text-lg font-bold text-cream hover:bg-white/10 sm:block"
          >
            {t.header.games}
          </Link>
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={hydrated && muted ? t.header.unmute : t.header.mute}
            title={hydrated && muted ? t.header.unmute : t.header.mute}
            className="pop-sm pressable grid size-11 place-items-center rounded-xl bg-cream text-xl"
          >
            {hydrated && muted ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            aria-label={t.header.profile}
            className="pop-sm pressable flex items-center gap-2 rounded-xl bg-cream py-1.5 pr-4 pl-2"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-sun text-xl">
              {hydrated ? avatar : "😎"}
            </span>
            <span className="max-w-36 truncate font-display font-bold">
              {hydrated && nickname ? nickname : t.profile.defaultNick}
            </span>
          </button>
        </nav>
      </div>
      <ProfileDialog ref={dialogRef} />
    </header>
  );
}
