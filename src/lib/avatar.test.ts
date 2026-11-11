import { describe, expect, it } from "vitest";
import { AVATAR_STYLES, sanitizeAvatar, seededRandom } from "./avatar";
import { avatarFromName, randomAvatarConfig, renderAllMoods, renderAvatarUri, stylePartsOf } from "./avatar-render";

describe("avatar ilustrado", () => {
  it("todos os estilos têm peças editáveis e geram imagem", () => {
    for (const s of AVATAR_STYLES) {
      expect(stylePartsOf(s.id).length).toBeGreaterThan(3);
      const uri = renderAvatarUri(randomAvatarConfig(s.id));
      expect(uri.startsWith("data:image/svg+xml")).toBe(true);
    }
  });

  it("gera as 4 expressões no estilo Clássico", () => {
    const imgs = renderAllMoods(randomAvatarConfig("avataaars"));
    expect(Object.keys(imgs).sort()).toEqual(["happy", "neutral", "sad", "shock"]);
    expect(imgs.happy).not.toBe(imgs.sad);
  });

  it("mesmo nome gera o mesmo avatar; trocar o sorteio muda", () => {
    expect(avatarFromName("Ana")).toEqual(avatarFromName("ana "));
    expect(avatarFromName("Ana", 1)).not.toEqual(avatarFromName("Ana", 0));
    const r = seededRandom("x");
    expect(r()).toBeGreaterThanOrEqual(0);
  });

  it("descarta avatar salvo inválido ou de formato antigo", () => {
    expect(sanitizeAvatar(null)).toBeNull();
    expect(sanitizeAvatar({ skin: 2, hair: 3 })).toBeNull();
    const ok = sanitizeAvatar({ style: "avataaars", seed: "a", options: { top: "fro", x: { bad: 1 } }, frame: 9 });
    expect(ok).toEqual({ style: "avataaars", seed: "a", options: { top: "fro" }, frame: 0 });
  });
});
