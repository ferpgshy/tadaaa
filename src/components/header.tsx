"use client";

import Link from "next/link";
import { useRef } from "react";
import { t } from "@/i18n";
import { useProfile } from "@/lib/profile";
import { useHydrated } from "@/lib/use-hydrated";
import { Gear, SoundOff, SoundOn } from "./icons";
import { ProfileDialog } from "./profile-dialog";

export function Header() {
  const hydrated = useHydrated();
  const { nickname, avatar, muted, toggleMuted } = useProfile();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <header className="header-bar bd-b sticky top-0 z-30 bg-header text-header-fg">
      <div className="marquee-lights h-3 bg-strip" aria-hidden />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="pop-sm pressable -rotate-2 rounded-xl bg-sun px-3 py-1 font-display text-xl sm:px-4 sm:text-2xl font-extrabold tracking-tight text-ink"
        >
          {t.brand.name}
          <span className="text-accent">!</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#jogos"
            className="hidden rounded-lg px-3 py-2 font-display text-lg font-bold hover:bg-current/10 md:block"
          >
            {t.header.games}
          </Link>
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={hydrated && muted ? t.header.unmute : t.header.mute}
            title={hydrated && muted ? t.header.unmute : t.header.mute}
            className="pop-sm pressable grid size-10 shrink-0 place-items-center rounded-xl bg-cream text-ink sm:size-11"
          >
            {hydrated && muted ? <SoundOff className="size-6 text-accent" /> : <SoundOn className="size-6" />}
          </button>
          <Link
            href="/configuracoes"
            aria-label={t.header.settings}
            title={t.header.settings}
            className="pop-sm pressable grid size-10 shrink-0 place-items-center rounded-xl bg-cream text-ink sm:size-11"
          >
            <Gear className="size-6" />
          </Link>
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            aria-label={`${hydrated && nickname ? nickname : t.profile.defaultNick} · ${t.header.profile}`}
            aria-haspopup="dialog"
            className="pop-sm pressable flex shrink-0 items-center gap-2 rounded-xl bg-cream p-1 text-ink sm:p-1.5 sm:pr-4"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-sun text-lg sm:text-xl">{hydrated ? avatar : "😎"}</span>
            <span className="hidden max-w-36 truncate font-display font-bold sm:inline">
              {hydrated && nickname ? nickname : t.profile.defaultNick}
            </span>
          </button>
        </nav>
      </div>
      <ProfileDialog ref={dialogRef} />
    </header>
  );
}
