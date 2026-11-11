import type { Metadata } from "next";
import Link from "next/link";
import { BlindTimerGame, BlindTimerRecords } from "@/games/cronometro-cego/blind-timer-game";
import { t } from "@/i18n";

const info = t.games["cronometro-cego"];
const L = t.blindTimer;

export const metadata: Metadata = {
  title: info.name,
  description: info.tagline,
};

export default function BlindTimerPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
        <Link href="/" className="w-fit font-display font-bold text-ink/60 hover:text-ink">
          ← {L.back}
        </Link>
        <h1 className="flex items-center gap-3 font-display text-4xl leading-none font-extrabold tracking-tight sm:text-5xl">
          <span aria-hidden>⏱️</span> {info.name}
        </h1>
        <p className="text-lg text-ink/75">{L.howTo}</p>

        <div className="pop-sm hidden rounded-3xl bg-cream p-5 lg:block">
          <h2 className="mb-3 font-display text-xl font-extrabold">{L.howToTitle}</h2>
          <ol className="flex flex-col gap-3">
            {L.steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun font-display text-sm font-extrabold">
                  {i + 1}
                </span>
                <span className="text-ink/80">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="hidden lg:block">
          <BlindTimerRecords />
        </div>
      </aside>

      <section id="game" className="min-w-0 scroll-mt-28">
        <BlindTimerGame />
      </section>
    </div>
  );
}
