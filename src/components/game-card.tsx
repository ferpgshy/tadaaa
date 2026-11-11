import Link from "next/link";
import { t } from "@/i18n";
import { gameHref, type GameEntry } from "@/games/catalog";

const bg: Record<GameEntry["color"], string> = {
  sun: "bg-sun",
  pink: "bg-pink",
  cyan: "bg-cyan",
  grape: "bg-grape",
  lime: "bg-lime",
  tomato: "bg-tomato",
};

export function GameCard({ game, big = false }: { game: GameEntry; big?: boolean }) {
  const info = t.games[game.slug];

  if (big) {
    return (
      <Link
        href={gameHref(game.slug)}
        className="pop pressable group flex flex-col overflow-hidden rounded-3xl bg-cream md:flex-row"
      >
        <div
          className={`${bg[game.color]} sunburst-soft flex items-center justify-center bd-b px-8 py-10 md:w-2/5 md:border-b-0 md:border-r-[length:var(--line-w)] md:border-r-line`}
        >
          <span className="text-8xl transition-transform group-hover:scale-110 group-hover:-rotate-6 lg:text-9xl" aria-hidden>
            {game.icon}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6 lg:p-10">
          <span className="w-fit rounded-full bd bg-lime px-3 py-0.5 font-display text-sm font-extrabold">
            ● {t.home.liveBadge}
          </span>
          <h3 className="font-display text-4xl leading-tight font-extrabold lg:text-5xl">{info.name}</h3>
          <p className="text-lg text-ink/75 lg:text-xl">{info.tagline}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <span className="text-sm font-semibold text-ink/70">
              👥 {t.home.players}: {info.players}
            </span>
            <span className="pop-sm rounded-xl bg-primary px-5 py-2 font-display text-lg font-extrabold text-on-primary">
              {t.home.play} →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="pop-sm relative flex flex-col overflow-hidden rounded-3xl bg-cream" aria-disabled>
      <div className={`${bg[game.color]} soon-stripes flex items-center justify-between bd-b px-5 py-4`}>
        <span className="text-4xl" aria-hidden>
          {game.icon}
        </span>
        <span className="rounded-full bd bg-cream px-3 py-0.5 font-display text-xs font-extrabold">
          🔒 {t.home.soonBadge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="font-display text-xl leading-tight font-extrabold">{info.name}</h3>
        <p className="text-sm text-ink/70">{info.tagline}</p>
        <p className="mt-auto pt-2 text-xs font-semibold text-ink/70">
          👥 {t.home.players}: {info.players}
        </p>
      </div>
    </div>
  );
}
