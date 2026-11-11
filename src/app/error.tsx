"use client";

import Link from "next/link";
import { t } from "@/i18n";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
      <p className="pop sunburst grid size-32 place-items-center rounded-4xl text-6xl" aria-hidden>
        🙀
      </p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{t.error.title}</h1>
      <p className="max-w-xl text-lg text-ink/75">{t.error.text}</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="pop pressable rounded-2xl bg-primary px-7 py-4 font-display text-xl font-extrabold text-on-primary"
        >
          🔁 {t.error.retry}
        </button>
        <Link href="/" className="pop pressable rounded-2xl bg-cream px-7 py-4 font-display text-xl font-extrabold">
          {t.error.home}
        </Link>
      </div>
    </div>
  );
}
