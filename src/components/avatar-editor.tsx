"use client";
/* eslint-disable @next/next/no-img-element -- prévias geradas no navegador (data URI) */

import { useMemo, useState } from "react";
import { t } from "@/i18n";
import { frameStyle } from "@/lib/avatar-bg";
import { AVATAR_BG, AVATAR_FRAMES, AVATAR_STYLES, seededRandom, type AvatarConfig, type AvatarMood, type AvatarStyleId } from "@/lib/avatar";
import { hasMoods, randomAvatarConfig, renderAvatarUri, stylePartsOf, type PartControl } from "@/lib/avatar-render";
import { sfx } from "@/lib/sfx";

const A = t.avatar;
type Tab = keyof typeof A.tabs;

const GROUPS: { id: Tab; icon: string; props: string[] }[] = [
  { id: "face", icon: "🙂", props: ["skinColor", "baseColor", "head", "face", "ears", "eyeShadowColor"] },
  { id: "hair", icon: "💇", props: ["top", "hair", "hairColor", "headContrastColor", "hatColor", "hairAccessories", "hairAccessoriesColor"] },
  { id: "eyes", icon: "👀", props: ["eyes", "eyesColor", "eyebrows", "brows", "eyebrowsColor"] },
  { id: "mouth", icon: "👄", props: ["mouth", "lips", "mouthColor", "nose", "noseColor"] },
  { id: "beard", icon: "🧔", props: ["facialHair", "beard", "facialHairColor"] },
  {
    id: "acc",
    icon: "🕶️",
    props: ["accessories", "accessoriesColor", "glasses", "glassesColor", "earrings", "earringsColor", "earringColor", "features", "freckles", "frecklesColor", "mask", "gesture", "bodyIcon"],
  },
  { id: "top", icon: "👕", props: ["clothing", "clothingGraphic", "clothesColor", "clothingColor", "body", "shirt", "shirtColor"] },
  { id: "bg", icon: "🎨", props: [] },
];
const MOOD_ICON: Record<AvatarMood, string> = { neutral: "🙂", happy: "😄", sad: "😢", shock: "😱" };

/** Agrupa as peças do estilo nas abas (peças desconhecidas vão para Acessórios). */
function tabsFor(style: AvatarStyleId) {
  const parts = stylePartsOf(style);
  const known = new Set(GROUPS.flatMap((g) => g.props));
  return GROUPS.map((g) => ({
    ...g,
    parts: [
      ...g.props.map((p) => parts.find((x) => x.prop === p)).filter((x): x is PartControl => Boolean(x)),
      ...(g.id === "acc" ? parts.filter((x) => !known.has(x.prop)) : []),
    ],
  })).filter((g) => g.id === "bg" || g.parts.length > 0);
}

export function AvatarEditor({
  value,
  onChange,
  compact = false,
}: {
  value: AvatarConfig;
  onChange: (v: AvatarConfig) => void;
  compact?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("face");
  const [mood, setMood] = useState<AvatarMood>("neutral");
  const [history, setHistory] = useState<AvatarConfig[]>([]);
  const tabs = useMemo(() => tabsFor(value.style), [value.style]);
  const current = tabs.find((x) => x.id === tab) ?? tabs[0];

  const change = (next: AvatarConfig) => {
    setHistory((h) => [...h.slice(-29), value]);
    onChange(next);
    sfx.click();
  };
  const setOpt = (patch: Record<string, string | number>) => change({ ...value, options: { ...value.options, ...patch } });

  const showMood = hasMoods(value.style) ? mood : "neutral";
  const preview = useMemo(() => renderAvatarUri(value, showMood), [value, showMood]);
  const stylePreviews = useMemo(
    () => Object.fromEntries(AVATAR_STYLES.map((s) => [s.id, renderAvatarUri(randomAvatarConfig(s.id, seededRandom(`estilo-${s.id}`)))])),
    [],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      {/* estilos */}
      <div className="flex min-w-0 flex-col gap-2">
        <span className="font-display font-bold text-ink/75">{A.style}</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {AVATAR_STYLES.map((s) => {
            const on = value.style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  if (on) return;
                  change({ ...randomAvatarConfig(s.id), frame: value.frame });
                  setTab("face");
                }}
                className={`flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl p-1.5 transition ${on ? "pop-sm bg-sun" : "bg-field hover:scale-105"}`}
              >
                <img src={stylePreviews[s.id]} alt="" width={64} height={64} className="size-16 rounded-xl" />
                <span className="text-xs font-bold">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8"}`}>
        {/* prévia */}
        <div className="flex flex-col items-center gap-3 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[30%]" style={frameStyle(value.frame)}>
            <img
              src={preview}
              alt={A.preview}
              width={240}
              height={240}
              className={`${compact ? "size-44 sm:size-52" : "size-52 sm:size-60"} rounded-[28%] bg-field`}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                change({ ...randomAvatarConfig(value.style), frame: value.frame });
                sfx.good();
              }}
              className="pop-sm pressable rounded-xl bg-sun px-4 py-2 font-display font-bold"
            >
              🎲 {A.random}
            </button>
            <button
              type="button"
              disabled={!history.length}
              onClick={() => {
                const prev = history.at(-1);
                if (!prev) return;
                setHistory((h) => h.slice(0, -1));
                onChange(prev);
                sfx.click();
              }}
              className="pop-sm pressable rounded-xl bg-field px-4 py-2 font-display font-bold disabled:pointer-events-none disabled:opacity-40"
            >
              ↩ {A.undo}
            </button>
          </div>
          {hasMoods(value.style) && (
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label={A.moodPreview}>
              {(Object.keys(MOOD_ICON) as AvatarMood[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mood === m}
                  title={A.moods[m]}
                  aria-label={A.moods[m]}
                  onClick={() => {
                    setMood(m);
                    sfx.click();
                  }}
                  className={`grid size-10 place-items-center rounded-xl text-xl transition ${mood === m ? "pop-sm bg-sun" : "bg-field hover:scale-110"}`}
                >
                  {MOOD_ICON[m]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* peças */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label={A.title}>
            {tabs.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={current.id === x.id}
                onClick={() => {
                  setTab(x.id);
                  sfx.click();
                }}
                className={`pop-sm pressable flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 font-display text-xs font-bold sm:flex-row sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm ${
                  current.id === x.id ? "bg-sun" : "bg-field"
                }`}
              >
                <span aria-hidden className="text-base">
                  {x.icon}
                </span>
                <span className="whitespace-nowrap">{A.tabs[x.id]}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel" className="flex flex-col gap-6">
            {current.id === "bg" ? (
              <>
                <Group label={A.labels.backgroundColor}>
                  <Swatches values={AVATAR_BG} selected={String(value.options.backgroundColor ?? "")} onPick={(c) => setOpt({ backgroundColor: c })} />
                </Group>
                <Group label={A.labels.backgroundType}>
                  <Chips
                    items={(["solid", "gradientLinear"] as const).map((v) => [v, A.bgTypes[v]])}
                    selected={String(value.options.backgroundType ?? "solid")}
                    onPick={(v) => setOpt({ backgroundType: v })}
                  />
                </Group>
                <Group label={A.labels.frame}>
                  <Chips
                    items={AVATAR_FRAMES.map((f, i) => [String(i), f])}
                    selected={String(value.frame)}
                    onPick={(v) => change({ ...value, frame: Number(v) })}
                  />
                </Group>
              </>
            ) : (
              current.parts.map((part) => (
                <Group key={part.prop} label={A.labels[part.prop] ?? part.prop}>
                  {part.kind === "color" ? (
                    <Swatches values={part.values} selected={String(value.options[part.prop] ?? "")} onPick={(c) => setOpt({ [part.prop]: c })} />
                  ) : (
                    <Tiles part={part} value={value} onPick={setOpt} />
                  )}
                </Group>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-display font-bold text-ink/75">{label}</span>
      {children}
    </div>
  );
}

function Swatches({ values, selected, onPick }: { values: string[]; selected: string; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {values.map((c, i) => (
        <button
          key={c}
          type="button"
          aria-pressed={selected === c}
          aria-label={`${A.color} ${i + 1}`}
          onClick={() => onPick(c)}
          className={`size-10 rounded-full border-[3px] border-line transition ${
            selected === c ? "scale-110 outline-4 outline-offset-2 outline-[var(--focus)]" : "hover:scale-110"
          }`}
          style={{ background: `#${c}` }}
        />
      ))}
    </div>
  );
}

function Chips({ items, selected, onPick }: { items: [string, string][]; selected: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([v, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={selected === v}
          onClick={() => onPick(v)}
          className={`pop-sm pressable rounded-xl px-3.5 py-2 font-display text-sm font-bold ${selected === v ? "bg-sun" : "bg-field"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Cada opção aparece já aplicada no avatar da pessoa. */
function Tiles({
  part,
  value,
  onPick,
}: {
  part: Extract<PartControl, { kind: "choice" }>;
  value: AvatarConfig;
  onPick: (patch: Record<string, string | number>) => void;
}) {
  const off = part.probProp ? value.options[part.probProp] === 0 : false;
  const previews = useMemo(
    () =>
      part.values.map((v) =>
        renderAvatarUri({
          ...value,
          options: { ...value.options, [part.prop]: v, ...(part.probProp ? { [part.probProp]: 100 } : {}) },
        }),
      ),
    [part, value],
  );
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-8">
      {part.probProp && (
        <button
          type="button"
          aria-pressed={off}
          onClick={() => onPick({ [part.probProp!]: 0 })}
          className={`grid aspect-square place-items-center rounded-2xl p-1 text-xs font-bold transition ${off ? "pop-sm bg-sun" : "bg-field hover:scale-105"}`}
        >
          🚫 {A.none}
        </button>
      )}
      {part.values.map((v, i) => {
        const on = !off && value.options[part.prop] === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            aria-label={`${A.labels[part.prop] ?? part.prop} ${i + 1}`}
            onClick={() => onPick({ [part.prop]: v, ...(part.probProp ? { [part.probProp]: 100 } : {}) })}
            className={`rounded-2xl p-1 transition ${on ? "pop-sm bg-sun" : "bg-field hover:scale-105"}`}
          >
            <img src={previews[i]} alt="" width={72} height={72} className="aspect-square w-full rounded-xl" loading="lazy" />
          </button>
        );
      })}
    </div>
  );
}
