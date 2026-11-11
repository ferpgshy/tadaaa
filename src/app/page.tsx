import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { catalog, gameHref, type GameCategory } from "@/games/catalog";
import { t } from "@/i18n";

export default function Home() {
  const live = catalog.filter((g) => g.live);
  const soon = catalog.filter((g) => !g.live);
  const categories = Object.keys(t.categories) as GameCategory[];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 sm:py-10 lg:gap-20">
      <section className="sunburst relative overflow-hidden rounded-4xl bd px-5 py-12 text-center shadow-pop-lg sm:px-12 sm:py-20 lg:py-24">
        <p className="mx-auto mb-5 w-fit -rotate-1 rounded-full bd bg-cream px-4 py-1 font-display text-xs font-bold sm:text-sm">
          {t.home.heroKicker}
        </p>
        <h1 className="mx-auto max-w-4xl font-display text-[2.6rem] leading-[0.95] font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
          {t.home.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium sm:text-xl lg:text-2xl">{t.home.heroText}</p>
        {live[0] && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={gameHref(live[0].slug)}
              className="pop pressable inline-block rotate-1 rounded-2xl bg-primary px-7 py-4 font-display text-xl font-extrabold text-on-primary sm:px-8 sm:text-2xl"
            >
              {t.home.heroCta}
              <span className="hidden sm:inline">: {t.games[live[0].slug].name}</span> →
            </Link>
            <a
              href="#em-breve"
              className="pop-sm pressable -rotate-1 rounded-2xl bg-cream px-5 py-3 font-display text-lg font-bold"
            >
              {t.home.comingCount(soon.length)}
            </a>
          </div>
        )}
      </section>

      <section id="jogos" className="scroll-mt-28">
        <h2 className="mb-6 flex items-center gap-3 font-display text-3xl font-extrabold sm:text-4xl">
          <span className="inline-block size-4 animate-pulse rounded-full bg-primary" aria-hidden />
          {t.home.liveTitle}
        </h2>
        <div className={`grid gap-6 ${live.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {live.map((g) => (
            <GameCard key={g.slug} game={g} big />
          ))}
        </div>
      </section>

      <section id="em-breve" className="scroll-mt-28">
        <h2 className="mb-6 font-display text-3xl font-extrabold sm:text-4xl">{t.home.soonTitle}</h2>
        <div className="flex flex-col gap-10">
          {categories.map((cat) => {
            const games = soon.filter((g) => g.category === cat);
            if (!games.length) return null;
            return (
              <div key={cat}>
                <h3 className="mb-4 font-display text-xl font-bold text-ink/70">{t.categories[cat]}</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
