import type { Metadata } from "next";
import Link from "next/link";
import { BlindTimerGame, BlindTimerRecords } from "@/games/cronometro-cego/blind-timer-game";
import { t } from "@/i18n";

const info = t.games["cronometro-cego"];
const L = t.blindTimer;

export const metadata: Metadata = {
  title: info.name,
  description: info.tagline,
  openGraph: { title: `${info.name} · ${t.brand.name}`, description: info.tagline },
};

function HowTo() {
  return (
    <details open className="pop-sm group rounded-3xl bg-cream p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-xl font-extrabold">
        {L.howToTitle}
        <span className="transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <ol className="mt-3 flex flex-col gap-3">
        {L.steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-line bg-sun font-display text-sm font-extrabold">
              {i + 1}
            </span>
            <span className="text-ink/80">{s}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export default function BlindTimerPage() {
  return (
    <div className="mx-auto grid w-full max-w-[2400px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10 lg:px-10 2xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)] 2xl:px-16">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:row-span-2 lg:gap-5 lg:self-start">
        <Link href="/" className="w-fit font-display font-bold text-ink/70 hover:text-ink">
          ← {L.back}
        </Link>
        <h1 className="flex items-center gap-3 font-display text-4xl leading-none font-extrabold tracking-tight sm:text-5xl">
          <span aria-hidden>⏱️</span> {info.name}
        </h1>
        <p className="text-lg text-ink/75">{L.howTo}</p>
        <div className="hidden flex-col gap-5 lg:flex">
          <HowTo />
          <BlindTimerRecords />
        </div>
      </aside>

      <section id="game" className="min-w-0 scroll-mt-28">
        <BlindTimerGame />
      </section>

      {/* No celular, as dicas e os recordes vêm depois do jogo. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
        <HowTo />
        <BlindTimerRecords />
      </div>
    </div>
  );
}
