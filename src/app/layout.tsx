import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
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

export const metadata: Metadata = {
  title: {
    default: `${t.brand.name} · jogos de festa no navegador`,
    template: `%s · ${t.brand.name}`,
  },
  description: t.brand.tagline,
};

export const viewport: Viewport = {
  themeColor: "#ffc93c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={t.locale}
      className={`${bricolage.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="px-6 py-8 text-center text-sm text-ink/60">
          {t.brand.name} · {t.profile.note}
        </footer>
      </body>
    </html>
  );
}
