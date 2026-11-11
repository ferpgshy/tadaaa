import type { Metadata } from "next";
import Link from "next/link";
import { BlindTimerGame } from "@/games/cronometro-cego/blind-timer-game";
import { t } from "@/i18n";

const info = t.games["cronometro-cego"];

export const metadata: Metadata = {
  title: info.name,
  description: info.tagline,
};

export default function BlindTimerPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3">
        <Link href="/" className="w-fit font-display font-bold text-ink/60 hover:text-ink">
          ← {t.blindTimer.back}
        </Link>
        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
          ⏱️ {info.name}
        </h1>
        <p className="max-w-2xl text-lg text-ink/75">{t.blindTimer.howTo}</p>
      </div>
      <BlindTimerGame />
    </div>
  );
}
