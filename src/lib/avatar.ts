// Avatar ilustrado (biblioteca DiceBear). Aqui ficam só tipos e metadados, sem carregar as ilustrações:
// o desenho em si fica em avatar-render.ts, importado só onde é preciso desenhar.

export const AVATAR_STYLES = [
  { id: "avataaars", label: "Clássico", author: "Pablo Stanley", license: "Uso livre (pessoal e comercial)", url: "https://avataaars.com/" },
  { id: "personas", label: "Personas", author: "Draftbit", license: "CC BY 4.0", url: "https://personas.draftbit.com/" },
  { id: "bigSmile", label: "Sorrisão", author: "Ashley Seo", license: "CC BY 4.0", url: "http://www.ashleyseo.com/" },
  { id: "micah", label: "Traço fino", author: "Micah Lanier", license: "CC BY 4.0", url: "https://dribbble.com/micahlanier" },
  { id: "adventurer", label: "Aventura", author: "Lisa Wischofsky", license: "CC BY 4.0", url: "https://www.instagram.com/lischi_art/" },
  { id: "lorelei", label: "Elegante", author: "Lisa Wischofsky", license: "CC0 1.0", url: "https://www.instagram.com/lischi_art/" },
  { id: "notionists", label: "Rabisco", author: "Zoish", license: "CC0 1.0", url: "https://heyzoish.gumroad.com/l/notionists" },
  { id: "openPeeps", label: "Desenho à mão", author: "Pablo Stanley", license: "CC0 1.0", url: "https://www.openpeeps.com/" },
] as const;

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];
export type AvatarMood = "neutral" | "happy" | "sad" | "shock";
export const AVATAR_MOODS: AvatarMood[] = ["neutral", "happy", "sad", "shock"];

/** Escolhas explícitas: valor de cada peça (string), cor (hex sem #) ou chance de aparecer (0–100). */
export type AvatarConfig = {
  style: AvatarStyleId;
  seed: string;
  options: Record<string, string | number>;
  frame: number;
};

export const AVATAR_FRAMES = ["Nenhuma", "Ouro", "Neon", "Arco-íris", "Fogo"] as const;

/** Fundo: cores da casa (hex sem #). */
export const AVATAR_BG = ["ffc93c", "ff7ab6", "19c3d6", "a77bf3", "8fd14f", "ff8a5c", "1b1035", "e8ecf3", "b6e3f4", "ffd5dc", "d1d4f9", "c0aede"];

export function isStyle(v: unknown): v is AvatarStyleId {
  return AVATAR_STYLES.some((s) => s.id === v);
}

/** Garante que um avatar salvo antigo/corrompido não quebra o site. */
export function sanitizeAvatar(v: unknown): AvatarConfig | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (!isStyle(o.style) || typeof o.options !== "object" || !o.options) return null;
  const options: Record<string, string | number> = {};
  for (const [k, val] of Object.entries(o.options as Record<string, unknown>)) {
    if (typeof val === "string" && val.length < 40) options[k] = val;
    else if (typeof val === "number" && val >= 0 && val <= 100) options[k] = val;
  }
  const frame = typeof o.frame === "number" && o.frame >= 0 && o.frame < AVATAR_FRAMES.length ? o.frame : 0;
  return { style: o.style, seed: typeof o.seed === "string" ? o.seed.slice(0, 40) : "tadaaa", options, frame };
}

/** Número pseudo-aleatório estável a partir de um texto (mesmo nome = mesmo avatar). */
export function seededRandom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
