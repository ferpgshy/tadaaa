import type { CSSProperties } from "react";

/** Moldura em volta da imagem do avatar (índice de AVATAR_FRAMES). */
export function frameStyle(frame: number): CSSProperties {
  switch (frame) {
    case 1:
      return { padding: 3, background: "linear-gradient(135deg,#fff3b0,#f5b301 40%,#b7791f 70%,#ffe08a)", boxShadow: "0 0 0 1px #7a4d0b" };
    case 2:
      return { padding: 2, background: "#2de2e6", boxShadow: "0 0 10px #2de2e6, 0 0 18px #ff2e97" };
    case 3:
      return { padding: 3, background: "conic-gradient(#ff3d7f,#ffc93c,#8fd14f,#19c3d6,#7b3fe4,#ff3d7f)" };
    case 4:
      return { padding: 3, background: "linear-gradient(0deg,#ff3d00,#ff9100 45%,#ffd600)", boxShadow: "0 0 12px #ff6d00" };
    default:
      return {};
  }
}
