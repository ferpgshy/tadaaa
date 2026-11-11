"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "./safe-storage";

export const THEMES = ["auditorio", "neon", "moderno", "fliperama", "doce", "noite"] as const;
export type ThemeId = (typeof THEMES)[number];
export const TEXT_SIZES = ["p", "m", "g", "gg"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];
export const MOTION_MODES = ["full", "system", "off"] as const;
export type MotionMode = (typeof MOTION_MODES)[number];

export type Settings = {
  theme: ThemeId;
  textSize: TextSize;
  motion: MotionMode;
  decor: boolean;
  volume: number; // 0 a 1
  vibration: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "auditorio",
  textSize: "m",
  motion: "system",
  decor: true,
  volume: 0.8,
  vibration: true,
};

/** Chave do localStorage; o script anti-flash do layout lê a mesma chave. */
export const SETTINGS_KEY = "tadaaa-settings";

type SettingsState = Settings & {
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: SETTINGS_KEY, version: 1, storage: safeStorage },
  ),
);

/** Aplica as preferências como atributos no <html> (o CSS faz o resto). */
export function applySettings(s: Pick<Settings, "theme" | "textSize" | "motion" | "decor">) {
  const el = document.documentElement;
  el.dataset.theme = s.theme;
  el.dataset.text = s.textSize;
  el.dataset.motion = s.motion;
  el.dataset.decor = s.decor ? "on" : "off";
}
