import { describe, expect, it } from "vitest";
import { AVATAR_PARTS, DEFAULT_AVATAR, randomAvatar, sanitizeAvatar } from "./avatar";

describe("avatar", () => {
  it("sorteia só peças válidas e nunca fundo igual ao rosto", () => {
    for (let i = 0; i < 300; i++) {
      const a = randomAvatar();
      for (const [k, v] of Object.entries(a)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(AVATAR_PARTS[k as keyof typeof AVATAR_PARTS].length);
      }
      expect(AVATAR_PARTS.bg[a.bg]).not.toBe(AVATAR_PARTS.skin[a.skin]);
    }
  });

  it("corrige avatar salvo inválido sem quebrar", () => {
    expect(sanitizeAvatar(null)).toBeNull();
    expect(sanitizeAvatar("x")).toBeNull();
    const fixed = sanitizeAvatar({ shape: 99, eyes: 2, mouth: -1, top: 1.5 });
    expect(fixed).toEqual({ ...DEFAULT_AVATAR, eyes: 2 });
  });
});
