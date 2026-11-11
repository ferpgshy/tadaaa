import { describe, expect, it } from "vitest";
import { errorMs, formatDiff, formatSeconds, roundPoints, standings, surpriseTarget, verdict } from "./logic";

describe("cronômetro cego", () => {
  it("calcula erro com sinal", () => {
    expect(errorMs(9_950, 10)).toBe(-50);
    expect(errorMs(10_120, 10)).toBe(120);
  });

  it("pontua 1000 no exato e nunca negativo", () => {
    expect(roundPoints(0)).toBe(1000);
    expect(roundPoints(-250)).toBe(750);
    expect(roundPoints(5000)).toBe(0);
  });

  it("classifica veredito pelas faixas", () => {
    expect(verdict(8)).toBe("perfect");
    expect(verdict(-40)).toBe("surgical");
    expect(verdict(150)).toBe("close");
    expect(verdict(399)).toBe("almost");
    expect(verdict(-900)).toBe("meh");
    expect(verdict(1500)).toBe("broken");
  });

  it("formata como cronômetro (trunca)", () => {
    expect(formatSeconds(9_999)).toBe("9,99");
    expect(formatSeconds(10_000)).toBe("10,00");
    expect(formatDiff(-23)).toBe("−0,023s");
    expect(formatDiff(1500)).toBe("+1,500s");
  });

  it("sorteia alvo surpresa entre 5 e 20", () => {
    expect(surpriseTarget(() => 0)).toBe(5);
    expect(surpriseTarget(() => 0.9999)).toBe(20);
  });

  it("ordena pódio por pontos e desempata pelo erro médio", () => {
    const res = standings(3, [
      { player: 0, round: 0, target: 10, elapsedMs: 10_300 },
      { player: 1, round: 0, target: 10, elapsedMs: 9_990 },
      { player: 2, round: 0, target: 10, elapsedMs: 15_000 },
    ]);
    expect(res.map((s) => s.player)).toEqual([1, 0, 2]);
    expect(res[0].total).toBe(990);
  });
});
