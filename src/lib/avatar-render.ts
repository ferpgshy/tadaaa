// Desenha os avatares com as ilustrações do DiceBear. Importar só onde precisa desenhar
// (editor, modo Galera): as páginas comuns usam as imagens já salvas no perfil.
import { createAvatar, type Style } from "@dicebear/core";
import { adventurer, avataaars, bigSmile, lorelei, micah, notionists, openPeeps, personas } from "@dicebear/collection";
import { AVATAR_BG, AVATAR_MOODS, seededRandom, type AvatarConfig, type AvatarMood, type AvatarStyleId } from "./avatar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStyle = Style<any> & { schema: { properties: Record<string, SchemaProp> } };
type SchemaProp = { type?: string; items?: { enum?: string[]; pattern?: string }; default?: unknown; minimum?: number; maximum?: number };

const STYLES: Record<AvatarStyleId, AnyStyle> = {
  avataaars: avataaars as AnyStyle,
  adventurer: adventurer as AnyStyle,
  lorelei: lorelei as AnyStyle,
  notionists: notionists as AnyStyle,
  bigSmile: bigSmile as AnyStyle,
  personas: personas as AnyStyle,
  micah: micah as AnyStyle,
  openPeeps: openPeeps as AnyStyle,
};

/** Paleta extra para cores que no estilo original têm só preto. */
const EXTRA_COLORS = ["000000", "2c1b18", "724133", "a55728", "d6b370", "e8e1e1", "e0195e", "7b3fe4", "19c3d6", "2fae66", "ffc93c", "ff6b3d", "ffffff"];

export type PartControl =
  | { kind: "choice"; prop: string; values: string[]; probProp?: string }
  | { kind: "color"; prop: string; values: string[] };

/** Peças editáveis de um estilo, lidas do próprio esquema da ilustração. */
export function stylePartsOf(style: AvatarStyleId): PartControl[] {
  const props = STYLES[style].schema.properties;
  const out: PartControl[] = [];
  for (const [prop, def] of Object.entries(props)) {
    const en = def.items?.enum;
    if (en && en.length > 1) {
      out.push({ kind: "choice", prop, values: [...en].sort(naturalSort), probProp: props[`${prop}Probability`] ? `${prop}Probability` : undefined });
    } else if (prop.endsWith("Color") && prop !== "backgroundColor" && def.items?.pattern) {
      const base = (Array.isArray(def.default) ? (def.default as string[]) : []).filter((c) => c !== "transparent");
      const values = prop === "skinColor" || prop === "baseColor" || base.length >= 6 ? base : [...new Set([...base, ...EXTRA_COLORS])];
      if (values.length > 1) out.push({ kind: "color", prop, values });
    }
  }
  return out;
}

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

/** Expressões: só onde o estilo tem peças que significam isso. */
const MOODS: Partial<Record<AvatarStyleId, Partial<Record<AvatarMood, Record<string, string>>>>> = {
  avataaars: {
    happy: { mouth: "smile", eyes: "happy", eyebrows: "raisedExcitedNatural" },
    sad: { mouth: "sad", eyes: "cry", eyebrows: "sadConcernedNatural" },
    shock: { mouth: "screamOpen", eyes: "surprised", eyebrows: "raisedExcitedNatural" },
  },
  bigSmile: {
    happy: { eyes: "cheery", mouth: "openedSmile" },
    sad: { eyes: "sad", mouth: "openSad" },
    shock: { eyes: "starstruck", mouth: "gapSmile" },
  },
  personas: {
    happy: { eyes: "happy", mouth: "bigSmile" },
    sad: { eyes: "sleep", mouth: "frown" },
    shock: { eyes: "open", mouth: "surprise" },
  },
  micah: {
    happy: { eyes: "smiling", mouth: "laughing" },
    sad: { eyebrows: "down", mouth: "sad" },
    shock: { eyes: "round", eyebrows: "up", mouth: "surprised" },
  },
  openPeeps: { happy: { face: "smileBig" }, sad: { face: "concerned" }, shock: { face: "awe" } },
  lorelei: { happy: { mouth: "happy09" }, sad: { mouth: "sad03" }, shock: { mouth: "sad08" } },
};

export function hasMoods(style: AvatarStyleId) {
  return Boolean(MOODS[style]);
}

function toDiceBear(cfg: AvatarConfig, mood: AvatarMood) {
  const style = STYLES[cfg.style];
  const props = style.schema.properties;
  const opts: Record<string, unknown> = { seed: cfg.seed };
  const merged = { ...cfg.options, ...(mood !== "neutral" ? MOODS[cfg.style]?.[mood] : undefined) };
  for (const [k, v] of Object.entries(merged)) {
    if (k === "backgroundColor") opts.backgroundColor = [String(v)];
    else if (k === "backgroundType") opts.backgroundType = [String(v)];
    else if (!props[k]) continue;
    else if (typeof v === "number") opts[k] = v;
    else opts[k] = [v];
  }
  return { style, opts };
}

export function renderAvatarUri(cfg: AvatarConfig, mood: AvatarMood = "neutral", size?: number) {
  const { style, opts } = toDiceBear(cfg, mood);
  return createAvatar(style, { ...opts, ...(size ? { size } : {}) }).toDataUri();
}

export function renderAllMoods(cfg: AvatarConfig) {
  const out: Partial<Record<AvatarMood, string>> = {};
  for (const m of hasMoods(cfg.style) ? AVATAR_MOODS : (["neutral"] as AvatarMood[])) out[m] = renderAvatarUri(cfg, m);
  return out;
}

/** No sorteio, só expressões simpáticas (as outras continuam disponíveis no editor). */
const NICE: Partial<Record<AvatarStyleId, Record<string, string[]>>> = {
  avataaars: {
    eyes: ["default", "happy", "wink", "side", "squint"],
    mouth: ["smile", "default", "twinkle", "tongue"],
    eyebrows: ["defaultNatural", "raisedExcitedNatural", "upDownNatural", "default", "raisedExcited"],
    accessories: ["prescription01", "prescription02", "round", "sunglasses", "wayfarers", "kurt"],
  },
  bigSmile: { eyes: ["cheery", "normal", "winking", "starstruck"], mouth: ["openedSmile", "teethSmile", "gapSmile", "kawaii"] },
  personas: { eyes: ["open", "happy", "wink", "glasses", "sunglasses"], mouth: ["smile", "bigSmile", "smirk", "lips"] },
  micah: { mouth: ["smile", "laughing", "smirk"], eyebrows: ["up", "eyelashesUp"] },
  openPeeps: { face: ["smile", "smileBig", "smileLOL", "cute", "cheeky", "calm", "lovingGrin1", "lovingGrin2", "driven", "explaining"] },
  lorelei: { mouth: Array.from({ length: 18 }, (_, i) => `happy${String(i + 1).padStart(2, "0")}`) },
};

/** Avatar aleatório já com todas as escolhas explícitas (o editor mostra o que está selecionado). */
export function randomAvatarConfig(style?: AvatarStyleId, rand: () => number = Math.random): AvatarConfig {
  const ids = Object.keys(STYLES) as AvatarStyleId[];
  const s = style ?? ids[Math.floor(rand() * ids.length)];
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const props = STYLES[s].schema.properties;
  const options: Record<string, string | number> = {};
  for (const part of stylePartsOf(s)) {
    const nice = NICE[s]?.[part.prop]?.filter((v) => part.values.includes(v));
    options[part.prop] = pick(nice?.length ? nice : part.values);
    if (part.kind === "choice" && part.probProp) {
      const def = Number(props[part.probProp]?.default ?? 50);
      options[part.probProp] = rand() * 100 < Math.max(def, 15) ? 100 : 0;
    }
  }
  options.backgroundColor = pick(AVATAR_BG);
  options.backgroundType = rand() < 0.5 ? "gradientLinear" : "solid";
  return { style: s, seed: Math.floor(rand() * 1e9).toString(36), options, frame: 0 };
}

/** Avatar estável a partir de um nome (modo Galera). "salt" muda o sorteio no botão de trocar. */
export function avatarFromName(name: string, salt = 0) {
  return randomAvatarConfig(undefined, seededRandom(`${name.toLowerCase().trim()}#${salt}`));
}
