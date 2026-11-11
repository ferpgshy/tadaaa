import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fredoka, Geist, Geist_Mono, Orbitron, Silkscreen } from "next/font/google";
import { Header } from "@/components/header";
import { SettingsProvider, settingsBootScript } from "@/components/settings-provider";
import { t } from "@/i18n";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fontes dos outros temas: só baixam quando o tema é usado.
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["600", "800"], preload: false });
const silkscreen = Silkscreen({ variable: "--font-silkscreen", subsets: ["latin"], weight: ["400", "700"], preload: false });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["400", "500", "700"], preload: false });

export const metadata: Metadata = {
  title: {
    default: `${t.brand.name} · jogos de festa no navegador`,
    template: `%s · ${t.brand.name}`,
  },
  description: t.brand.tagline,
};

export const viewport: Viewport = {
  themeColor: "#7b3fe4",
};

const fonts = [bricolage, geistSans, geistMono, orbitron, silkscreen, fredoka].map((f) => f.variable).join(" ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={t.locale}
      data-theme="auditorio"
      data-text="m"
      data-motion="system"
      data-decor="on"
      suppressHydrationWarning
      className={`${fonts} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsBootScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SettingsProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="px-6 py-8 text-center text-sm text-ink/60">
            {t.brand.name} · {t.profile.note}
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
