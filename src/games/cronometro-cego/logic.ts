import { locale } from "@/i18n";

export const TARGETS = [5, 10, 15, 30, 60] as const;
export const HIDE_OPTIONS = [3, 1, 0] as const; // 0 = nunca aparece
export const ROUND_OPTIONS = [1, 3, 5] as const;
export const MAX_PLAYERS = 12;

export type VerdictKey = "perfect" | "surgical" | "close" | "almost" | "meh" | "broken";

/** Erro com sinal: negativo = parou antes do alvo. */
export const errorMs = (elapsedMs: number, targetS: number) => elapsedMs - targetS * 1000;

/** 1000 pontos no tempo exato, perde 1 ponto por ms de erro. */
export const roundPoints = (errMs: number) => Math.max(0, Math.round(1000 - Math.abs(errMs)));

export function verdict(errMs: number): VerdictKey {
  const e = Math.abs(errMs);
  if (e <= 10) return "perfect";
  if (e <= 50) return "surgical";
  if (e <= 150) return "close";
  if (e <= 400) return "almost";
  if (e <= 1000) return "meh";
  return "broken";
}

const two = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const three = new Intl.NumberFormat(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Igual cronômetro de verdade: trunca, não arredonda (9,999 vira 9,99). */
export const formatSeconds = (ms: number) => two.format(Math.floor(Math.max(0, ms) / 10) / 100);

export const formatDiff = (errMs: number) => `${errMs >= 0 ? "+" : "−"}${three.format(Math.abs(errMs) / 1000)}s`;

export const surpriseTarget = (rand: () => number = Math.random) => 5 + Math.floor(rand() * 16); // 5 a 20

export type Shot = { player: number; round: number; target: number; elapsedMs: number };

export type Standing = { player: number; total: number; avgAbsErr: number; shots: number };

export function standings(playerCount: number, shots: Shot[]): Standing[] {
  return Array.from({ length: playerCount }, (_, player) => {
    const mine = shots.filter((s) => s.player === player);
    const errs = mine.map((s) => errorMs(s.elapsedMs, s.target));
    return {
      player,
      total: errs.reduce((sum, e) => sum + roundPoints(e), 0),
      avgAbsErr: errs.length ? errs.reduce((sum, e) => sum + Math.abs(e), 0) / errs.length : Infinity,
      shots: mine.length,
    };
  }).sort((a, b) => b.total - a.total || a.avgAbsErr - b.avgAbsErr);
}
