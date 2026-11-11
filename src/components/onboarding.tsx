"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { t } from "@/i18n";
import { AVATARS, useProfile } from "@/lib/profile";
import { TEXT_SIZES, THEMES, useSettings } from "@/lib/settings";
import { sfx } from "@/lib/sfx";
import { ThemeCard } from "./settings-panel";

const O = t.onboarding;
const S = t.settings;
const TOTAL = 3;

/** Espera o zustand ler o localStorage, para não abrir as boas-vindas para quem já configurou. */
function useProfileRestored() {
  return useSyncExternalStore(
    (cb) => useProfile.persist.onFinishHydration(cb),
    () => useProfile.persist.hasHydrated(),
    () => false,
  );
}

const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

export function Onboarding() {
  const restored = useProfileRestored();
  const profile = useProfile();
  const settings = useSettings();
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);

  const open = restored && !profile.onboarded;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    sfx.click();
  };

  const finish = (save: boolean) => {
    if (save) profile.setProfile(nick.trim(), avatar);
    profile.setOnboarded(true);
    if (save) sfx.win();
  };

  const name = nick.trim() || t.profile.defaultNick;

  return (
    <dialog
      ref={ref}
      aria-labelledby="onb-title"
      onToggle={(e) => {
        // Ao abrir, parte do que já estiver salvo (quem tinha apelido não perde).
        if ((e.currentTarget as HTMLDialogElement).open) {
          const p = useProfile.getState();
          setNick(p.nickname);
          setAvatar(p.avatar);
          setStep(0);
        }
      }}
      onCancel={(e) => {
        // Esc também conta como "pular": não abre de novo.
        e.preventDefault();
        finish(false);
      }}
      className="pop m-auto w-[min(94vw,760px)] max-h-[92dvh] overflow-y-auto rounded-4xl bg-cream p-0 text-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden>
              {Array.from({ length: TOTAL }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 rounded-full border-2 border-line transition-all ${i === step ? "w-8 bg-primary" : i < step ? "w-2.5 bg-lime" : "w-2.5 bg-field"}`}
                />
              ))}
            </span>
            <span className="text-sm font-semibold whitespace-nowrap text-ink/70">{O.step(step + 1, TOTAL)}</span>
          </div>
          <button
            type="button"
            onClick={() => finish(false)}
            className="rounded-lg px-2 py-1 text-sm font-semibold whitespace-nowrap text-ink/70 underline underline-offset-4 hover:text-ink"
          >
            {O.skip}
          </button>
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: 40 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * dir }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {step === 0 && (
              <>
                <Heading title={O.welcomeTitle} text={O.welcomeText} emoji="🎉" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    go(1);
                  }}
                  className="flex flex-col gap-5"
                >
                  <label className="flex flex-col gap-2">
                    <span className="font-display font-bold">{t.profile.nickname}</span>
                    <input
                      autoFocus
                      value={nick}
                      onChange={(e) => setNick(e.target.value)}
                      maxLength={24}
                      placeholder={t.profile.nicknamePlaceholder}
                      className="pop-sm rounded-xl bg-field px-4 py-3 text-lg outline-none focus:bg-sun/20"
                    />
                  </label>
                  <fieldset>
                    <legend className="mb-2 font-display font-bold">{t.profile.avatar}</legend>
                    <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap">
                      {AVATARS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          aria-pressed={avatar === a}
                          onClick={() => {
                            setAvatar(a);
                            sfx.click();
                          }}
                          className={`grid aspect-square place-items-center rounded-xl text-2xl transition sm:size-14 sm:text-3xl ${
                            avatar === a ? "pop-sm scale-105 bg-sun" : "bg-field hover:scale-105"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Nav onNext={() => go(1)} submit />
                </form>
              </>
            )}

            {step === 1 && (
              <>
                <Heading title={O.lookTitle} text={O.lookText} emoji="🎨" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {THEMES.map((id) => (
                    <ThemeCard
                      key={id}
                      id={id}
                      compact
                      active={settings.theme === id}
                      onPick={() => {
                        settings.set({ theme: id });
                        sfx.good();
                      }}
                    />
                  ))}
                </div>
                <Nav onBack={() => go(0)} onNext={() => go(2)} />
              </>
            )}

            {step === 2 && (
              <>
                <Heading title={O.finalTitle} text={O.finalText} emoji="🎚️" />
                <div className="flex flex-col gap-5">
                  <Row label={S.soundEffects}>
                    <Pills
                      value={profile.muted ? "off" : "on"}
                      options={[
                        ["on", `🔊 ${S.on}`],
                        ["off", `🔇 ${S.off}`],
                      ]}
                      onChange={(v) => {
                        profile.setMuted(v === "off");
                        if (v === "on") setTimeout(sfx.good, 30);
                      }}
                    />
                  </Row>
                  {canVibrate() && (
                    <Row label={S.vibration}>
                      <Pills
                        value={settings.vibration ? "on" : "off"}
                        options={[
                          ["on", `📳 ${S.on}`],
                          ["off", S.off],
                        ]}
                        onChange={(v) => settings.set({ vibration: v === "on" })}
                      />
                    </Row>
                  )}
                  <Row label={S.textSize}>
                    <Pills
                      value={settings.textSize}
                      options={TEXT_SIZES.map((v) => [v, S.textSizes[v]] as [string, string])}
                      onChange={(v) => settings.set({ textSize: v as (typeof TEXT_SIZES)[number] })}
                    />
                  </Row>
                </div>
                <p className="pop-sm flex items-center gap-3 rounded-2xl bg-sun px-4 py-3 font-display text-lg font-extrabold">
                  <span className="text-2xl">{avatar}</span> {O.ready(name)}
                </p>
                <Nav onBack={() => go(1)} onNext={() => finish(true)} last />
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <h2 id="onb-title" className="sr-only">
          {O.welcomeTitle}
        </h2>
      </div>
    </dialog>
  );
}

function Heading({ title, text, emoji }: { title: string; text: string; emoji: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-4xl" aria-hidden>
        {emoji}
      </p>
      <h3 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h3>
      <p className="text-ink/75 sm:text-lg">{text}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-display text-lg font-bold">{label}</span>
      {children}
    </div>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => {
            onChange(v);
            sfx.click();
          }}
          className={`pop-sm pressable rounded-xl px-4 py-2 font-display font-bold ${value === v ? "bg-sun" : "bg-field"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  last = false,
  submit = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  last?: boolean;
  submit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? (
        <button type="button" onClick={onBack} className="pop-sm pressable rounded-2xl bg-field px-4 py-3 font-display font-bold whitespace-nowrap sm:px-5">
          ← {O.back}
        </button>
      ) : (
        <span />
      )}
      <button
        type={submit ? "submit" : "button"}
        onClick={submit ? undefined : onNext}
        className="pop pressable rounded-2xl bg-primary px-5 py-3 font-display text-lg font-extrabold whitespace-nowrap text-on-primary sm:px-7 sm:text-xl"
      >
        {last ? `${O.finish} 🎉` : `${O.next} →`}
      </button>
    </div>
  );
}
