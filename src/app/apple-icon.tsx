import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Mesmo desenho do icon.svg, em PNG para a tela inicial do iPhone.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffc93c" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <rect x="0" y="0" width="64" height="64" fill="#ffc93c" />
          <path d="M13 15h28v10h-9v24h-10V25H13z" fill="#1b1035" />
          <rect x="44" y="15" width="8" height="21" rx="4" fill="#ff3d7f" stroke="#1b1035" strokeWidth="2.5" />
          <circle cx="48" cy="45" r="4.5" fill="#ff3d7f" stroke="#1b1035" strokeWidth="2.5" />
        </svg>
      </div>
    ),
    size,
  );
}
