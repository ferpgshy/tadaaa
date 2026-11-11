import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { catalog, gameHref, type GameCategory } from "@/games/catalog";
import { t } from "@/i18n";

export default function Home() {
  const live = catalog.filter((g) => g.live);
  const soon = catalog.filter((g) => !g.live);
  const categories = Object.keys(t.categories) as GameCategory[];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6">
      <section className="sunburst relative overflow-hidden rounded-[2rem] border-[3px] border-ink px-6 py-14 text-center shadow-pop-lg sm:px-12 sm:py-20">
        <p className="mx-auto mb-5 w-fit -rotate-1 rounded-full border-[3px] border-ink bg-cream px-4 py-1 font-display text-sm font-bold">
          {t.home.heroKicker}
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-7xl">
          {t.home.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium sm:text-xl">{t.home.heroText}</p>
        {live[0] && (
          <Link
            href={gameHref(live[0].slug)}
            className="pop pressable mt-9 inline-block rotate-1 rounded-2xl bg-pink px-8 py-4 font-display text-2xl font-extrabold text-white"
          >
            {t.home.heroCta}: {t.games[live[0].slug].name} →
          </Link>
        )}
      </section>

      <section id="jogos" className="scroll-mt-28">
        <h2 className="mb-6 font-display text-4xl font-extrabold">
          <span className="mr-3 inline-block size-4 animate-pulse rounded-full bg-pink align-middle" aria-hidden />
          {t.home.liveTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {live.map((g) => (
            <GameCard key={g.slug} game={g} big />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-display text-4xl font-extrabold">{t.home.soonTitle}</h2>
        <div className="flex flex-col gap-10">
          {categories.map((cat) => {
            const games = soon.filter((g) => g.category === cat);
            if (!games.length) return null;
            return (
              <div key={cat}>
                <h3 className="mb-4 font-display text-xl font-bold text-ink/70">{t.categories[cat]}</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {games.map((g) => (
                    <GameCard key={g.slug} game={g} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
