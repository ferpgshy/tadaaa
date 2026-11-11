import { t } from "@/i18n";

export type GameCategory = keyof typeof t.categories;
export type GameSlug = keyof typeof t.games;

export type GameEntry = {
  slug: GameSlug;
  category: GameCategory;
  live: boolean;
  color: "sun" | "pink" | "cyan" | "grape" | "lime" | "tomato";
  icon: string;
};

export const catalog: GameEntry[] = [
  { slug: "cronometro-cego", category: "tempo", live: true, color: "pink", icon: "⏱️" },
  { slug: "chuta-o-numero", category: "estimativa", live: false, color: "cyan", icon: "🎯" },
  { slug: "impostor", category: "social", live: false, color: "grape", icon: "🕵️" },
  { slug: "sentiu-o-minuto", category: "tempo", live: false, color: "sun", icon: "🧘" },
  { slug: "batata-quente", category: "tempo", live: false, color: "tomato", icon: "🥔" },
  { slug: "reflexo", category: "tempo", live: false, color: "lime", icon: "⚡" },
  { slug: "onde-e-isso", category: "estimativa", live: false, color: "cyan", icon: "🗺️" },
  { slug: "que-ano-foi", category: "estimativa", live: false, color: "sun", icon: "📅" },
  { slug: "quanto-custa", category: "estimativa", live: false, color: "lime", icon: "💸" },
  { slug: "mais-ou-menos", category: "estimativa", live: false, color: "pink", icon: "⚖️" },
  { slug: "na-testa", category: "social", live: false, color: "sun", icon: "🤔" },
  { slug: "palavra-proibida", category: "social", live: false, color: "tomato", icon: "🤐" },
  { slug: "termometro", category: "social", live: false, color: "cyan", icon: "🌡️" },
  { slug: "mimica", category: "social", live: false, color: "pink", icon: "🎭" },
  { slug: "quem-e-mais-provavel", category: "social", live: false, color: "lime", icon: "👉" },
  { slug: "duas-verdades", category: "social", live: false, color: "grape", icon: "🤥" },
  { slug: "stop", category: "social", live: false, color: "sun", icon: "✋" },
  { slug: "qual-e-a-musica", category: "musica", live: false, color: "grape", icon: "🎵" },
];

export const gameHref = (slug: GameSlug) => `/jogos/${slug}`;
