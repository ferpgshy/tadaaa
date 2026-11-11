// Avatar montado por peças. Guardamos só índices, então o objeto é pequeno e fácil de salvar.

export const AVATAR_PARTS = {
  shape: ["redondo", "quadrado", "feijão", "hexágono", "gota"],
  skin: ["#ffdcc0", "#f1b98c", "#c98b5e", "#8d5a3b", "#5b3a29", "#ffc93c", "#8fd14f", "#19c3d6", "#a77bf3", "#ff9ec8"],
  eyes: ["bolinha", "feliz", "sono", "estrela", "óculos", "ciclope", "uau", "piscadinha"],
  mouth: ["sorriso", "risada", "língua", "surpresa", "sério", "dentinhos", "bico"],
  top: ["nada", "topete", "cacheado", "boné", "coroa", "cartola", "gorro", "chifres", "moicano"],
  topColor: ["#1b1035", "#5b3a29", "#c0392b", "#f5b301", "#ff3d7f", "#19c3d6", "#7b3fe4", "#f3f0ff"],
  extra: ["nada", "bochechas", "bigode", "sardas", "curativo", "fone"],
  bg: ["#ffc93c", "#ff3d7f", "#19c3d6", "#a77bf3", "#8fd14f", "#ff6b3d", "#1b1035", "#fffbef"],
} as const;

export type AvatarPart = keyof typeof AVATAR_PARTS;
export type AvatarConfig = Record<AvatarPart, number>;

export const DEFAULT_AVATAR: AvatarConfig = {
  shape: 0,
  skin: 5,
  eyes: 0,
  mouth: 0,
  top: 1,
  topColor: 0,
  extra: 1,
  bg: 2,
};

export function randomAvatar(rand: () => number = Math.random): AvatarConfig {
  const pick = (k: AvatarPart) => Math.floor(rand() * AVATAR_PARTS[k].length);
  const cfg = Object.fromEntries((Object.keys(AVATAR_PARTS) as AvatarPart[]).map((k) => [k, pick(k)])) as AvatarConfig;
  // Evita fundo igual à cor do corpo (o rosto sumiria).
  if (AVATAR_PARTS.bg[cfg.bg] === AVATAR_PARTS.skin[cfg.skin]) cfg.bg = (cfg.bg + 1) % AVATAR_PARTS.bg.length;
  return cfg;
}

/** Garante que um avatar salvo antigo/corrompido continua válido. */
export function sanitizeAvatar(v: unknown): AvatarConfig | null {
  if (!v || typeof v !== "object") return null;
  const out = { ...DEFAULT_AVATAR };
  for (const k of Object.keys(AVATAR_PARTS) as AvatarPart[]) {
    const n = (v as Record<string, unknown>)[k];
    if (typeof n === "number" && Number.isInteger(n) && n >= 0 && n < AVATAR_PARTS[k].length) out[k] = n;
  }
  return out;
}
