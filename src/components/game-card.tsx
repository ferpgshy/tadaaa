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
  const body = (
    <>
      <div className={`${bg[game.color]} flex items-center justify-between border-b-[3px] border-ink px-5 ${big ? "py-8" : "py-5"}`}>
        <span className={big ? "text-7xl" : "text-5xl"} aria-hidden>
          {game.icon}
        </span>
        <span
          className={`rounded-full border-[3px] border-ink px-3 py-0.5 font-display text-sm font-extrabold ${
            game.live ? "bg-lime" : "bg-cream"
          }`}
        >
          {game.live ? `● ${t.home.liveBadge}` : t.home.soonBadge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className={`font-display font-extrabold leading-tight ${big ? "text-4xl" : "text-2xl"}`}>{info.name}</h3>
        <p className={`text-ink/75 ${big ? "text-lg" : ""}`}>{info.tagline}</p>
        <p className="mt-auto pt-2 text-sm font-semibold text-ink/60">
          👥 {t.home.players}: {info.players}
        </p>
      </div>
    </>
  );

  const cls = "pop flex flex-col overflow-hidden rounded-3xl bg-cream";
  return game.live ? (
    <Link href={gameHref(game.slug)} className={`${cls} pressable`}>
      {body}
    </Link>
  ) : (
    <div className={`${cls} opacity-70 saturate-50`} aria-disabled>
      {body}
    </div>
  );
}
