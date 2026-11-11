import { ImageResponse } from "next/og";
import { t } from "@/i18n";

export const alt = `${t.brand.name}: ${t.brand.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagem que aparece quando alguém compartilha o link (WhatsApp, Instagram, X...).
export default function OpengraphImage() {
  const rays = Array.from({ length: 20 }, (_, i) => i * 18);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffc93c",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" style={{ position: "absolute", inset: 0 }} viewBox="0 0 1200 630">
          {rays.map((deg) => (
            <path
              key={deg}
              d="M600 760 L560 -400 L640 -400 Z"
              fill="#ffd766"
              transform={`rotate(${deg} 600 760)`}
            />
          ))}
        </svg>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#1b1035",
            color: "#ffc93c",
            fontSize: 150,
            fontWeight: 900,
            padding: "10px 56px 24px",
            borderRadius: 40,
            transform: "rotate(-3deg)",
            boxShadow: "16px 16px 0 #ff3d7f",
          }}
        >
          {t.brand.name}
          <span style={{ color: "#ff3d7f" }}>!</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 38,
            fontWeight: 700,
            color: "#1b1035",
            background: "#fffbef",
            border: "6px solid #1b1035",
            borderRadius: 999,
            padding: "14px 40px",
          }}
        >
          {t.brand.tagline}
        </div>
      </div>
    ),
    size,
  );
}
