import { AVATAR_PARTS as P, type AvatarConfig } from "@/lib/avatar";

const INK = "#1b1035";
const W = 3; // espessura do contorno (estilo adesivo)

function star(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return pts.join(" ");
}

function Face({ shape, skin }: { shape: number; skin: string }) {
  const p = { fill: skin, stroke: INK, strokeWidth: W, strokeLinejoin: "round" as const };
  switch (shape) {
    case 1:
      return <rect x={20} y={26} width={60} height={62} rx={18} {...p} />;
    case 2:
      return <ellipse cx={50} cy={58} rx={28} ry={32} {...p} />;
    case 3:
      return <polygon points="50,24 79,40 79,73 50,89 21,73 21,40" {...p} />;
    case 4:
      return <path d="M50 22 C64 34 80 46 80 62 C80 78 66 88 50 88 C34 88 20 78 20 62 C20 46 36 34 50 22Z" {...p} />;
    default:
      return <circle cx={50} cy={57} r={31} {...p} />;
  }
}

function Eyes({ kind, c }: { kind: number; c: string }) {
  const line = { fill: "none", stroke: c, strokeWidth: W, strokeLinecap: "round" as const };
  switch (kind) {
    case 1:
      return (
        <g {...line}>
          <path d="M34 55 Q40 47 46 55" />
          <path d="M54 55 Q60 47 66 55" />
        </g>
      );
    case 2:
      return (
        <g {...line}>
          <path d="M34 52 Q40 57 46 52" />
          <path d="M54 52 Q60 57 66 52" />
        </g>
      );
    case 3:
      return (
        <g fill="#f5b301" stroke={c} strokeWidth={2} strokeLinejoin="round">
          <polygon points={star(40, 52, 7)} />
          <polygon points={star(60, 52, 7)} />
        </g>
      );
    case 4:
      return (
        <g fill={c} stroke={c} strokeWidth={W} strokeLinejoin="round">
          <rect x={29} y={46} width={18} height={11} rx={4} />
          <rect x={53} y={46} width={18} height={11} rx={4} />
          <path d="M47 50 H53" fill="none" />
          <path d="M33 49 L38 49" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case 5:
      return (
        <g>
          <circle cx={50} cy={51} r={10} fill="#fff" stroke={INK} strokeWidth={W} />
          <circle cx={51} cy={52} r={4.5} fill={INK} />
        </g>
      );
    case 6:
      return (
        <g stroke={c} strokeWidth={W}>
          <circle cx={40} cy={52} r={7} fill="#fff" stroke={INK} />
          <circle cx={60} cy={52} r={7} fill="#fff" stroke={INK} />
          <circle cx={40} cy={53} r={3} fill={INK} stroke="none" />
          <circle cx={60} cy={53} r={3} fill={INK} stroke="none" />
        </g>
      );
    case 7:
      return (
        <g>
          <circle cx={40} cy={52} r={4} fill={c} />
          <path d="M54 54 Q60 47 66 54" fill="none" stroke={c} strokeWidth={W} strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g fill={c}>
          <circle cx={40} cy={52} r={4} />
          <circle cx={60} cy={52} r={4} />
        </g>
      );
  }
}

function Mouth({ kind, c }: { kind: number; c: string }) {
  const line = { fill: "none", stroke: c, strokeWidth: W, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case 1:
      return (
        <g>
          <path d="M38 66 Q50 84 62 66 Z" fill={c} stroke={c} strokeWidth={W} strokeLinejoin="round" />
          <path d="M44 74 Q50 80 56 74 Q50 72 44 74Z" fill="#ff7ab6" />
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M40 67 Q50 76 60 67" {...line} />
          <path d="M47 71 Q47 80 52 80 Q57 80 56 70" fill="#ff7ab6" stroke={c} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      );
    case 3:
      return <ellipse cx={50} cy={71} rx={4.5} ry={5.5} fill={c} />;
    case 4:
      return <path d="M42 70 H58" {...line} />;
    case 5:
      return (
        <g>
          <path d="M39 67 Q50 76 61 67" {...line} />
          <rect x={45} y={70} width={10} height={7} rx={1.5} fill="#fff" stroke={c} strokeWidth={2.5} />
          <path d="M50 70.5 V77" stroke={c} strokeWidth={2} />
        </g>
      );
    case 6:
      return <path d="M47 65 Q55 68 48 71 Q55 74 47 77" {...line} />;
    default:
      return <path d="M40 67 Q50 77 60 67" {...line} />;
  }
}

function Extra({ kind, color, back }: { kind: number; color: string; back?: boolean }) {
  if (kind === 5) {
    // fone: arco atrás da cabeça, conchas na frente
    return back ? (
      <path d="M17 58 A33 33 0 0 1 83 58" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
    ) : (
      <g fill={color} stroke={INK} strokeWidth={W}>
        <rect x={11} y={50} width={11} height={18} rx={5} />
        <rect x={78} y={50} width={11} height={18} rx={5} />
      </g>
    );
  }
  if (back) return null;
  switch (kind) {
    case 1:
      return (
        <g fill="#ff6b9a" opacity={0.6}>
          <ellipse cx={32} cy={63} rx={5.5} ry={3.5} />
          <ellipse cx={68} cy={63} rx={5.5} ry={3.5} />
        </g>
      );
    case 2:
      return (
        <path
          d="M37 66 Q43 59 50 64 Q57 59 63 66 Q57 69 50 66 Q43 69 37 66Z"
          fill={color}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 3:
      return (
        <g fill="#8d5a3b" opacity={0.75}>
          {[
            [31, 61],
            [35, 64],
            [29, 65],
            [69, 61],
            [65, 64],
            [71, 65],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} />
          ))}
        </g>
      );
    case 4:
      return (
        <g transform="rotate(-25 66 62)">
          <rect x={58} y={58} width={17} height={8} rx={3} fill="#ffd9a0" stroke={INK} strokeWidth={2} />
          <path d="M64 58 V66 M69 58 V66" stroke={INK} strokeWidth={1.2} opacity={0.6} />
        </g>
      );
    default:
      return null;
  }
}

function Top({ kind, color }: { kind: number; color: string }) {
  const p = { fill: color, stroke: INK, strokeWidth: W, strokeLinejoin: "round" as const };
  switch (kind) {
    case 1:
      return <path d="M30 34 Q34 10 56 14 Q74 18 70 34 Q60 25 50 29 Q40 32 30 34Z" {...p} />;
    case 2:
      return (
        <g {...p}>
          {[
            [30, 34],
            [38, 24],
            [50, 20],
            [62, 24],
            [70, 34],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={9} />
          ))}
        </g>
      );
    case 3:
      return (
        <g {...p}>
          <path d="M22 40 Q24 14 50 14 Q76 14 78 40 Z" />
          <path d="M50 40 H90 Q88 47 77 47 H50 Z" />
          <circle cx={50} cy={14} r={3} fill={INK} />
        </g>
      );
    case 4:
      return (
        <g stroke={INK} strokeWidth={W} strokeLinejoin="round">
          <polygon points="28,34 28,12 39,22 50,6 61,22 72,12 72,34" fill="#f5b301" />
          <circle cx={50} cy={26} r={3.5} fill="#ff3d7f" strokeWidth={2} />
          <circle cx={36} cy={28} r={2.5} fill="#19c3d6" strokeWidth={2} />
          <circle cx={64} cy={28} r={2.5} fill="#19c3d6" strokeWidth={2} />
        </g>
      );
    case 5:
      return (
        <g {...p}>
          <rect x={32} y={2} width={36} height={28} rx={3} />
          <rect x={32} y={21} width={36} height={6} fill="#ff3d7f" />
          <rect x={22} y={28} width={56} height={7} rx={3.5} />
        </g>
      );
    case 6:
      return (
        <g {...p}>
          <path d="M21 42 Q21 12 50 12 Q79 12 79 42 Z" />
          <rect x={18} y={35} width={64} height={10} rx={5} />
          <circle cx={50} cy={10} r={6} fill="#fffbef" />
        </g>
      );
    case 7:
      return (
        <g fill="#fffbef" stroke={INK} strokeWidth={W} strokeLinejoin="round">
          <path d="M30 36 Q16 22 24 8 Q30 24 40 30Z" />
          <path d="M70 36 Q84 22 76 8 Q70 24 60 30Z" />
        </g>
      );
    case 8:
      return <path d="M40 32 L42 6 L48 22 L52 2 L56 22 L60 8 L62 32 Z" {...p} />;
    default:
      return null;
  }
}

export function Avatar({ config, size = 48, className = "", title }: { config: AvatarConfig; size?: number; className?: string; title?: string }) {
  const skin = P.skin[config.skin];
  const hair = P.topColor[config.topColor];
  // Em pele muito escura, olhos e boca ficam claros para não sumirem.
  const feature = config.skin === 4 ? "#fff3e0" : INK;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "Avatar"}
      className={className}
    >
      <rect x={0} y={0} width={100} height={100} rx={24} fill={P.bg[config.bg]} />
      <Extra kind={config.extra} color={hair} back />
      <Face shape={config.shape} skin={skin} />
      <Extra kind={config.extra === 2 || config.extra === 5 ? -1 : config.extra} color={hair} />
      <Eyes kind={config.eyes} c={feature} />
      <Mouth kind={config.mouth} c={feature} />
      {config.extra === 2 && <Extra kind={2} color={hair} />}
      <Top kind={config.top} color={hair} />
      {config.extra === 5 && <Extra kind={5} color={hair} />}
    </svg>
  );
}
