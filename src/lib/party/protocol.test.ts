import { describe, expect, it } from "vitest";
import { electHost, initialState, newRoomCode, normalizeCode, partyStandings, reduce } from "./protocol";

const fixed = () => 0.5;

describe("sala online", () => {
  it("código curto, sem letras confusas, e normaliza o que a pessoa digita", () => {
    const c = newRoomCode();
    expect(c).toMatch(/^[A-Z2-9]{4}$/);
    expect(normalizeCode(" kj-x4 ")).toBe("KJX4");
    expect(normalizeCode("KJ0X")).toBeNull(); // 0 não existe nos códigos
    expect(normalizeCode("AB")).toBeNull();
  });

  it("rodada termina quando todos mandam o tempo; não aceita reenvio", () => {
    let s = reduce(initialState(), { type: "start", roster: ["a", "b"] }, fixed);
    expect(s.phase).toBe("playing");
    s = reduce(s, { type: "submit", playerId: "a", round: 0, elapsedMs: 9_900 });
    expect(s.phase).toBe("playing");
    const again = reduce(s, { type: "submit", playerId: "a", round: 0, elapsedMs: 10_000 });
    expect(again).toBe(s);
    s = reduce(s, { type: "submit", playerId: "b", round: 0, elapsedMs: 12_000 });
    expect(s.phase).toBe("roundEnd");
  });

  it("quem cai no meio não trava a rodada, mas continua na partida", () => {
    let s = reduce(initialState(), { type: "start", roster: ["a", "b"] }, fixed);
    expect(reduce(s, { type: "sweep", present: ["a"] })).toBe(s); // ninguém jogou ainda: espera
    s = reduce(s, { type: "submit", playerId: "a", round: 0, elapsedMs: 10_000 });
    s = reduce(s, { type: "sweep", present: ["a"] });
    expect(s.phase).toBe("roundEnd");
    expect(s.roster).toEqual(["a", "b"]);
  });

  it("vai até o pódio e soma pontos certo", () => {
    let s = reduce(initialState(), { type: "configure", settings: { target: 10, hideAfter: 3, rounds: 2 } });
    s = reduce(s, { type: "start", roster: ["a", "b"] });
    s = reduce(s, { type: "submit", playerId: "a", round: 0, elapsedMs: 10_000 });
    s = reduce(s, { type: "submit", playerId: "b", round: 0, elapsedMs: 10_500 });
    s = reduce(s, { type: "next" });
    expect(s.round).toBe(1);
    s = reduce(s, { type: "submit", playerId: "a", round: 1, elapsedMs: 9_800 });
    s = reduce(s, { type: "submit", playerId: "b", round: 1, elapsedMs: 10_000 });
    s = reduce(s, { type: "next" });
    expect(s.phase).toBe("podium");
    const table = partyStandings(s);
    expect(table.map((x) => x.id)).toEqual(["a", "b"]);
    expect(table[0].total).toBe(1000 + 800);
  });

  it("antitrapaça: jogada que não vale e anulação pelo host contam 0", () => {
    let s = reduce(initialState(), { type: "configure", settings: { target: 10, hideAfter: 3, rounds: 1 } });
    s = reduce(s, { type: "start", roster: ["a", "b", "c"] });
    s = reduce(s, { type: "submit", playerId: "a", round: 0, elapsedMs: 10_000, invalid: "focus" });
    s = reduce(s, { type: "submit", playerId: "b", round: 0, elapsedMs: 10_200 });
    s = reduce(s, { type: "submit", playerId: "c", round: 0, elapsedMs: 10_400 });
    s = reduce(s, { type: "void", playerId: "b", round: 0 });
    expect(s.invalid[0]).toEqual({ a: "focus", b: "judge" });
    const t = partyStandings(s);
    expect(t[0].id).toBe("c");
    expect(t.find((x) => x.id === "a")!.total).toBe(0);
    expect(t.find((x) => x.id === "b")!.total).toBe(0);
  });

  it("host é quem criou; se sair, o mais antigo assume", () => {
    expect(electHost([{ id: "b", name: "B", avatar: null, joinedAt: 1 }, { id: "a", name: "A", avatar: null, joinedAt: 5, host: true }])).toBe("a");
    expect(electHost([{ id: "b", name: "B", avatar: null, joinedAt: 3 }, { id: "c", name: "C", avatar: null, joinedAt: 1 }])).toBe("c");
    expect(electHost([])).toBeNull();
  });
});
