import type { Metadata } from "next";
import Link from "next/link";
import { SettingsPanel } from "@/components/settings-panel";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: t.settings.title,
  description: t.settings.intro,
};

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-3">
        <Link href="/" className="w-fit font-display font-bold text-ink/70 hover:text-ink">
          ← {t.blindTimer.back}
        </Link>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">⚙️ {t.settings.title}</h1>
        <p className="max-w-2xl text-lg text-ink/75">
          {t.settings.intro} <span className="text-ink/70">· {t.settings.saved}</span>
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
