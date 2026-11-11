import type { MetadataRoute } from "next";
import { t } from "@/i18n";

// Permite "Adicionar à tela inicial" com nome, cor e ícone do Tadaaa.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${t.brand.name}: jogos de festa`,
    short_name: t.brand.name,
    description: t.brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#fff6df",
    theme_color: "#7b3fe4",
    lang: t.locale,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
