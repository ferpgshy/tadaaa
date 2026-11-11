"use client";

import { useProfile } from "./profile";
import { useSettings } from "./settings";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || useProfile.getState().muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = "square", baseGain = 0.06, delay = 0) {
  const ac = audio();
  const gain = baseGain * useSettings.getState().volume;
  if (!ac || gain <= 0) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function vibrate(pattern: number | number[]) {
  if (!useSettings.getState().vibration) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* sem suporte */
  }
}

export const sfx = {
  click: () => tone(660, 0.05, "triangle", 0.04),
  start: () => {
    tone(523, 0.08, "square");
    tone(784, 0.12, "square", 0.06, 0.08);
    vibrate(30);
  },
  stop: () => {
    tone(392, 0.1, "square", 0.07);
    vibrate(40);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "square", 0.06, i * 0.09));
    vibrate([40, 40, 80]);
  },
  good: () => {
    tone(659, 0.1, "triangle", 0.07);
    tone(880, 0.16, "triangle", 0.07, 0.1);
  },
  buzz: () => {
    tone(110, 0.35, "sawtooth", 0.08);
    tone(98, 0.35, "sawtooth", 0.06, 0.05);
    vibrate(200);
  },
  fanfare: () => {
    [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.16, "square", 0.05, i * 0.12),
    );
  },
};
