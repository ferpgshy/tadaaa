import { describe, expect, it } from "vitest";
import { invalidByTargets, isSuspicious, targetSchedule } from "./anticheat";
import { standings } from "./logic";

describe("antitrapaça", () => {
  it("alvos só aparecem depois que o tempo some e nunca perto do fim", () => {
    for (const [target, hide] of [
      [5, 3],
      [10, 3],
      [30, 1],
      [60, 0],
    ]) {
      const list = targetSchedule(target, hide);
      for (const t of list) {
        expect(t.at).toBeGreaterThanOrEqual(Math.max(hide * 1000, 900));
        expect(t.at).toBeLessThan(target * 1000 - 900);
        expect(t.x).toBeGreaterThanOrEqual(12);
        expect(t.x).toBeLessThanOrEqual(88);
      }
    }
    expect(targetSchedule(60, 1).length).toBeGreaterThan(15);
    expect(targetSchedule(10, 3, () => 0).length).toBeGreaterThan(0);
  });

  it("perder 1 alvo pode; perder 2 anula", () => {
    expect(invalidByTargets(0)).toBe(false);
    expect(invalidByTargets(1)).toBe(false);
    expect(invalidByTargets(2)).toBe(true);
  });

  it("suspeito com 2 acertos quase perfeitos", () => {
    expect(isSuspicious([5, 300, 200])).toBe(false);
    expect(isSuspicious([5, 12, 400])).toBe(true);
  });

  it("jogada anulada vale 0 e não entra no erro médio", () => {
    const res = standings(2, [
      { player: 0, round: 0, target: 10, elapsedMs: 10_000, invalid: "focus" },
      { player: 1, round: 0, target: 10, elapsedMs: 10_400 },
    ]);
    expect(res[0].player).toBe(1);
    const p0 = res.find((s) => s.player === 0)!;
    expect(p0.total).toBe(0);
    expect(p0.avgAbsErr).toBe(Infinity);
  });
});
