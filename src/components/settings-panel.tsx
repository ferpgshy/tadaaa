"use client";

import { useRef, useState } from "react";
import { t } from "@/i18n";
import { AVATARS, useProfile } from "@/lib/profile";
import { MOTION_MODES, TEXT_SIZES, THEMES, useSettings, type ThemeId } from "@/lib/settings";
import { sfx } from "@/lib/sfx";
import { useHydrated } from "@/lib/use-hydrated";

const S = t.settings;

export function SettingsPanel() {
  const hydrated = useHydrated();
  const settings = useSettings();
  const profile = useProfile();

  // Antes de hidratar, mostra o padrão para não divergir do HTML do servidor.
  const cur = hydrated ? settings : { ...settings, theme: "auditorio" as ThemeId };

  return (
    <div className="flex flex-col gap-8">
      <Section title={S.sections.look} icon="🎨">
        <Field label={S.theme}>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {THEMES.map((id) => (
              <ThemeCard
                key={id}
                id={id}
                active={cur.theme === id}
                onPick={() => {
                  settings.set({ theme: id });
                  sfx.good();
                }}
              />
            ))}
          </div>
        </Field>

        <Field label={S.textSize}>
          <Segmented
            value={hydrated ? settings.textSize : "m"}
            options={TEXT_SIZES.map((v, i) => ({
              value: v,
              label: (
                <span className="flex items-baseline gap-2">
                  <span style={{ fontSize: `${0.85 + i * 0.2}rem` }} className="font-display font-extrabold">
                    Aa
                  </span>
                  {S.textSizes[v]}
                </span>
              ),
            }))}
            onChange={(v) => settings.set({ textSize: v })}
          />
        </Field>

        <Field label={S.motion}>
          <Segmented
            value={hydrated ? settings.motion : "system"}
            options={MOTION_MODES.map((v) => ({
              value: v,
              label: (
                <span className="flex flex-col items-start">
                  <span>{S.motionModes[v].name}</span>
                  <span className="text-xs font-normal opacity-70">{S.motionModes[v].hint}</span>
                </span>
              ),
            }))}
            onChange={(v) => settings.set({ motion: v })}
          />
        </Field>

        <Toggle
          label={S.decor}
          hint={S.decorHint}
          checked={hydrated ? settings.decor : true}
          onChange={(decor) => settings.set({ decor })}
        />
      </Section>

      <Section title={S.sections.sound} icon="🔊">
        <Toggle
          label={S.soundEffects}
          checked={hydrated ? !profile.muted : true}
          onChange={(on) => {
            profile.setMuted(!on);
            if (on) setTimeout(sfx.good, 30);
          }}
        />
        <Field label={`${S.volume}: ${Math.round((hydrated ? settings.volume : 0.8) * 100)}%`}>
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={hydrated ? settings.volume : 0.8}
              disabled={hydrated && profile.muted}
              onChange={(e) => settings.set({ volume: Number(e.target.value) })}
              onPointerUp={() => sfx.click()}
              aria-label={S.volume}
              className="focus-ring h-3 w-full max-w-md cursor-pointer accent-[var(--primary)] disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => sfx.win()}
              className="pop-sm pressable rounded-xl bg-cyan px-4 py-2 font-display font-bold"
            >
              ▶ {S.testSound}
            </button>
          </div>
        </Field>
        <Toggle
          label={S.vibration}
          hint={S.vibrationHint}
          checked={hydrated ? settings.vibration : true}
          onChange={(vibration) => settings.set({ vibration })}
        />
      </Section>

      <Section title={S.sections.profile} icon={hydrated ? profile.avatar : "😎"}>
        <Field label={S.nickname}>
          <input
            value={hydrated ? profile.nickname : ""}
            onChange={(e) => profile.setProfile(e.target.value, profile.avatar)}
            maxLength={24}
            placeholder={t.profile.nicknamePlaceholder}
            className="pop-sm w-full max-w-md rounded-xl bg-field px-4 py-3 text-lg outline-none focus:bg-sun/20"
          />
        </Field>
        <Field label={S.avatar}>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => {
              const on = hydrated && profile.avatar === a;
              return (
                <button
                  key={a}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    profile.setProfile(profile.nickname, a);
                    sfx.click();
                  }}
                  className={`grid size-12 place-items-center rounded-xl text-2xl transition ${
                    on ? "pop-sm scale-110 bg-sun" : "bg-field hover:scale-105"
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      <Section title={S.sections.language} icon="🌎">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pop-sm rounded-xl bg-sun px-4 py-2 font-display font-bold">🇧🇷 {S.languageCurrent}</span>
          <span className="text-ink/60">{S.languageSoon}</span>
        </div>
      </Section>

      <Section title={S.sections.data} icon="🗂️">
        <div className="grid gap-4 md:grid-cols-3">
          <DangerButton
            label={S.clearRecords}
            hint={S.clearRecordsHint}
            onConfirm={() => profile.clearRecords()}
          />
          <DangerButton label={S.resetSettings} hint={S.resetSettingsHint} onConfirm={() => settings.reset()} />
          <DangerButton
            label={S.resetAll}
            hint={S.resetAllHint}
            onConfirm={() => {
              settings.reset();
              profile.clearRecords();
              profile.resetProfile();
              profile.setMuted(false);
            }}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="pop flex flex-col gap-7 rounded-4xl bg-cream p-5 sm:p-8">
      <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold sm:text-3xl">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-display text-lg font-bold text-ink/75">{label}</span>
      {children}
    </div>
  );
}

function Segmented<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: { value: V; label: React.ReactNode }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => {
            onChange(o.value);
            sfx.click();
          }}
          className={`pop-sm pressable rounded-2xl px-5 py-2.5 text-left font-display font-bold ${
            value === o.value ? "bg-sun" : "bg-field"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        onChange(!checked);
        sfx.click();
      }}
      className="focus-ring flex items-center justify-between gap-4 rounded-2xl text-left"
    >
      <span>
        <span className="block font-display text-lg font-bold">{label}</span>
        {hint && <span className="block text-sm text-ink/60">{hint}</span>}
      </span>
      <span
        className={`pop-sm relative h-9 w-16 shrink-0 rounded-full transition-colors ${checked ? "bg-lime" : "bg-field"}`}
        aria-hidden
      >
        <span
          className={`bd absolute top-1/2 size-6 -translate-y-1/2 rounded-full bg-cream transition-all ${
            checked ? "left-[calc(100%-1.75rem)]" : "left-1"
          }`}
        />
      </span>
      <span className="sr-only">{checked ? S.on : S.off}</span>
    </button>
  );
}

function DangerButton({ label, hint, onConfirm }: { label: string; hint: string; onConfirm: () => void }) {
  const [state, setState] = useState<"idle" | "confirm" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const click = () => {
    clearTimeout(timer.current);
    if (state === "confirm") {
      onConfirm();
      sfx.buzz();
      setState("done");
      timer.current = setTimeout(() => setState("idle"), 1800);
    } else {
      setState("confirm");
      sfx.click();
      timer.current = setTimeout(() => setState("idle"), 3500);
    }
  };

  return (
    <button
      type="button"
      onClick={click}
      className={`pop-sm pressable flex flex-col gap-1 rounded-2xl p-4 text-left ${
        state === "confirm" ? "bg-tomato" : state === "done" ? "bg-lime" : "bg-field"
      }`}
    >
      <span className="font-display text-lg font-extrabold">
        {state === "confirm" ? `⚠️ ${S.confirm}` : state === "done" ? `✅ ${S.done}` : label}
      </span>
      <span className="text-sm text-ink/70">{hint}</span>
    </button>
  );
}

function ThemeCard({ id, active, onPick }: { id: ThemeId; active: boolean; onPick: () => void }) {
  const info = S.themes[id];
  return (
    <button
      type="button"
      data-theme={id}
      aria-pressed={active}
      onClick={onPick}
      className={`pop pressable flex flex-col overflow-hidden rounded-3xl bg-paper text-left text-ink ${
        active ? "outline-4 outline-offset-4 outline-[var(--focus)]" : ""
      }`}
    >
      <span className="bd-b flex items-center justify-between bg-header px-3 py-2 text-header-fg">
        <span className="pop-sm rounded-lg bg-sun px-2 py-0.5 font-display text-sm font-extrabold text-ink">
          {t.brand.name}
          <span className="text-accent">!</span>
        </span>
        <span className="flex gap-1" aria-hidden>
          <span className="size-2.5 rounded-full bg-current opacity-60" />
          <span className="size-2.5 rounded-full bg-current opacity-60" />
        </span>
      </span>
      <span className="sunburst bd-b flex items-center gap-3 p-4">
        <span className="pop-sm flex flex-1 flex-col gap-2 rounded-xl bg-cream p-3">
          <span className="font-display text-sm font-extrabold">⏱️ {S.preview.card}</span>
          <span className="flex items-center gap-2">
            <span className="pop-sm rounded-lg bg-primary px-3 py-1 font-display text-xs font-extrabold text-on-primary">
              {S.preview.button}
            </span>
            <span className="rounded-md bg-display px-2 py-0.5 font-mono text-xs font-bold text-display-fg">9,98</span>
          </span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-3 bg-cream p-4">
        <span>
          <span className="block font-display text-lg font-extrabold">{info.name}</span>
          <span className="block text-sm text-ink/70">{info.hint}</span>
        </span>
        {active && (
          <span className="pop-sm grid size-8 shrink-0 place-items-center rounded-full bg-lime font-bold" aria-hidden>
            ✓
          </span>
        )}
      </span>
    </button>
  );
}
