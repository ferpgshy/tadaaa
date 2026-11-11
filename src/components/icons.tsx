type P = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SoundOn = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const SoundOff = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
    <path d="m16 9 6 6M22 9l-6 6" />
  </svg>
);
