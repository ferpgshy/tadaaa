"use client";

import { useRef, useState } from "react";
import { t } from "@/i18n";
import { AVATAR_STYLES, sanitizeAvatar, type AvatarConfig } from "@/lib/avatar";
import { useProfile } from "@/lib/profile";
import { MOTION_MODES, TEXT_SIZES, THEMES, useSettings, type ThemeId } from "@/lib/settings";
import { sfx } from "@/lib/sfx";
import dynamic from "next/dynamic";
import { ProfileAvatar } from "./profile-avatar";
import { ThemeCard } from "./theme-card";
import { useHydrated } from "@/lib/use-hydrated";

// O editor (com todas as ilustrações) só é baixado depois que a página aparece.
const AvatarEditor = dynamic(() => import("./avatar-editor").then((m) => m.AvatarEditor), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-3xl bg-field" />,
});
const loadAvatarLib = () => import("@/lib/avatar-render");

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

      <Section id="perfil" title={S.sections.profile} icon={<ProfileAvatar size={36} />}>
        <Field label={S.nickname}>
          <input
            value={hydrated ? profile.nickname : ""}
            onChange={(e) => profile.setNickname(e.target.value)}
            maxLength={24}
            placeholder={t.profile.nicknamePlaceholder}
            className="pop-sm w-full max-w-md rounded-xl bg-field px-4 py-3 text-lg outline-none focus:bg-sun/20"
          />
        </Field>
        <Field label={S.avatar}>
          {hydrated ? <ProfileAvatarField /> : <div className="h-14" />}
        </Field>
        <button
          type="button"
          onClick={() => {
            profile.setOnboarded(false);
            sfx.click();
          }}
          className="pop-sm pressable flex w-fit flex-col gap-0.5 rounded-2xl bg-field px-4 py-3 text-left"
        >
          <span className="font-display text-lg font-bold">👋 {t.onboarding.redo}</span>
          <span className="text-sm text-ink/70">{t.onboarding.redoHint}</span>
        </button>
      </Section>

      <Section title={S.sections.language} icon="🌎">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pop-sm rounded-xl bg-sun px-4 py-2 font-display font-bold">🇧🇷 {S.languageCurrent}</span>
          <span className="text-ink/70">{S.languageSoon}</span>
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

      <Section id="creditos" title={t.avatar.credits} icon="🎨">
        <p className="text-ink/75">
          {t.avatar.creditsText}{" "}
          <a href="https://www.dicebear.com" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">
            dicebear.com
          </a>
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {AVATAR_STYLES.map((s) => (
            <li key={s.id} className="text-sm text-ink/80">
              <span className="font-bold">{s.label}</span> ·{" "}
              <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {s.author}
              </a>{" "}
              · {s.license}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/** Editor do avatar do perfil: cada mudança já salva a imagem (todas as expressões). */
function ProfileAvatarField() {
  const avatar = useProfile((p) => p.avatar);
  const setAvatar = useProfile((p) => p.setAvatar);
  const cfg = sanitizeAvatar(avatar);
  // Guarda a escolha na hora e gera as imagens (todas as expressões) logo em seguida.
  const save = (next: AvatarConfig) => {
    setAvatar(next, useProfile.getState().avatarImages);
    void loadAvatarLib().then((m) => {
      if (useProfile.getState().avatar === next) setAvatar(next, m.renderAllMoods(next));
    });
  };

  if (!cfg) {
    return (
      <button
        type="button"
        onClick={() => {
          void loadAvatarLib().then((m) => save(m.randomAvatarConfig("avataaars")));
          sfx.good();
        }}
        className="pop pressable flex w-fit items-center gap-3 rounded-2xl bg-primary px-6 py-4 font-display text-xl font-extrabold text-on-primary"
      >
        🎨 {t.avatar.create}
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <AvatarEditor value={cfg} onChange={save} />
      <p className="text-sm font-semibold text-ink/70">✅ {t.avatar.saved}</p>
    </div>
  );
}

function Section({
  id,
  title,
  icon,
  children,
}: {
  id?: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="pop flex scroll-mt-28 flex-col gap-7 rounded-4xl bg-cream p-5 sm:p-8">
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
        {hint && <span className="block text-sm text-ink/70">{hint}</span>}
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
