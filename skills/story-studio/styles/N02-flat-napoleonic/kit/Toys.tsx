import type { ReactNode } from "react";
import { at, type Cam, type Paint } from "./Table";

// N02 toys: cast-metal figures painted in gloss enamel, each on a little green base. Every toy is a function
// (p: Paint) => SVG, 100 units tall, feet at y = 0, facing right; `p(name)` gives the glossy paint (or the flat
// shadow colour when the same drawing is used for the lamp shadow). Figures are rigid castings — they never
// move their limbs; they move by being pushed (`hop` in Table.tsx), tipped over, or recoiling.

export type Uniform = { coat: string; front: string; trousers: string; facing: string; hat: "shako" | "kiver" | "bicorne" | "busby" };
export const FRENCH: Uniform = { coat: "blue", front: "white", trousers: "white", facing: "red", hat: "shako" };
export const RUSSIAN: Uniform = { coat: "green", front: "green", trousers: "white", facing: "red", hat: "kiver" };
export const GUARD: Uniform = { coat: "blue", front: "white", trousers: "white", facing: "red", hat: "busby" };

const Base = ({ p, w = 26 }: { p: Paint; w?: number }) => (
  <g>
    <rect x={-w} y={-3} width={w * 2} height={6} rx={2} fill={p("base")} />
    <rect x={-w} y={-6} width={w * 2} height={4} rx={2} fill={p("base")} opacity={0.9} />
  </g>
);

const Hat = ({ p, u, x = 2, y = -95 }: { p: Paint; u: Uniform; x?: number; y?: number }) => {
  if (u.hat === "bicorne") return <path d={`M${x - 16} ${y + 2} Q${x} ${y - 16} ${x + 16} ${y + 2} Q${x} ${y - 3} ${x - 16} ${y + 2} Z`} fill={p("black")} />;
  if (u.hat === "busby")
    return (
      <g>
        <path d={`M${x - 8} ${y} L${x - 9} ${y - 24} Q${x} ${y - 30} ${x + 9} ${y - 24} L${x + 8} ${y} Z`} fill={p("black")} />
        <rect x={x + 4} y={y - 26} width={4} height={14} rx={2} fill={p("red")} />
      </g>
    );
  const top = u.hat === "kiver" ? y - 20 : y - 19;
  return (
    <g>
      <path d={`M${x - 7} ${y} L${x - 8} ${top} L${x + 9} ${top} L${x + 8} ${y} Z`} fill={p("black")} />
      <path d={`M${x + 1} ${y - 4} l3 -8 l3 8 Z`} fill={p("gold")} />
      {u.hat === "kiver" ? <path d={`M${x - 8} ${top} Q${x} ${top - 6} ${x + 9} ${top} Z`} fill={p("black")} /> : <circle cx={x + 1} cy={top - 3} r={3.6} fill={p("red")} />}
      <path d={`M${x} ${y} l12 1 l-1 2 l-11 -1 Z`} fill={p("black")} />
    </g>
  );
};

const Face = ({ p, x = 2, y = -86, frost = false }: { p: Paint; x?: number; y?: number; frost?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={7.5} fill={p(frost ? "cream" : "skin")} />
    <circle cx={x + 4.5} cy={y - 1.5} r={1.1} fill={p("black")} />
    <path d={`M${x + 2} ${y + 3} q3 1.6 6 0`} stroke={p("black")} strokeWidth={1.6} fill="none" />
    <circle cx={x + 3} cy={y + 1.5} r={1.6} fill={p("red")} opacity={0.6} />
  </g>
);

// Line infantryman. pose: "march" (stride, musket shouldered), "stand" (at attention), "trudge" (bent, blanket).
export const soldier = (u: Uniform, pose: "march" | "stand" | "trudge" = "march", frost = 0) => (p: Paint): ReactNode => {
  const bend = pose === "trudge" ? 10 : 0;
  const lf = pose === "stand" ? -3 : -9, rf = pose === "stand" ? 5 : 11;
  return (
    <g>
      <Base p={p} />
      <g transform={`rotate(${bend} 0 -6)`}>
        {/* legs */}
        <path d={`M-5 -50 L${lf - 3} -5 L${lf + 4} -5 L2 -48 Z`} fill={p(u.trousers)} />
        <path d={`M0 -50 L${rf - 3} -5 L${rf + 4} -5 L7 -48 Z`} fill={p(u.trousers)} />
        <path d={`M${lf - 3.4} -20 L${lf - 3} -4 L${lf + 7} -4 L${lf + 4.2} -20 Z`} fill={p("black")} />
        <path d={`M${rf - 3.4} -20 L${rf - 3} -4 L${rf + 7} -4 L${rf + 4.2} -20 Z`} fill={p("black")} />
        {/* pack */}
        <rect x={-16} y={-80} width={9} height={22} rx={2} fill={p("brown")} />
        <rect x={-17} y={-85} width={11} height={7} rx={3.5} fill={p("greycoat")} />
        {/* coat with tails */}
        <path d="M-9 -80 L9 -80 L10 -50 L4 -46 L-3 -40 L-12 -42 L-9 -50 Z" fill={p(u.coat)} />
        <path d="M-1 -79 L7 -79 L8 -54 L-1 -54 Z" fill={p(u.front)} />
        <path d="M-9 -79 L9 -55 M9 -79 L-9 -55" stroke={p("white")} strokeWidth={3} />
        <rect x={-9} y={-55} width={19} height={4} fill={p("white")} />
        <rect x={-8} y={-82} width={16} height={4} rx={2} fill={p(u.facing)} />
        <ellipse cx={8} cy={-78} rx={5} ry={2.6} fill={p(u.facing)} />
        {/* arm + musket at the shoulder */}
        <path d="M6 -78 L12 -62 L8 -60 L2 -74 Z" fill={p(u.coat)} />
        <rect x={9} y={-63} width={5} height={4} fill={p(u.facing)} />
        <path d="M6 -48 L15 -110 L17.5 -110 L10 -48 Z" fill={p("brown")} />
        <path d="M14.2 -104 L16.8 -124 L17.6 -124 L16 -104 Z" fill={p("grey")} />
        <Face p={p} frost={frost > 0.5} />
        <Hat p={p} u={u} />
        {pose === "trudge" && <path d="M-14 -84 Q0 -92 10 -82 L9 -70 Q-2 -66 -15 -72 Z" fill={p("greycoat")} />}
        {frost > 0 && (
          <g opacity={frost}>
            <path d="M-16 -86 q14 -8 28 0 l0 2 q-14 -5 -28 0 Z" fill={p("white")} />
            <rect x={-6} y={-117} width={16} height={4} rx={2} fill={p("white")} />
          </g>
        )}
      </g>
    </g>
  );
};

export const napoleon = (p: Paint): ReactNode => (
  <g>
    <Base p={p} w={30} />
    <path d="M-6 -48 L-8 -5 L0 -5 L1 -46 Z" fill={p("white")} />
    <path d="M2 -48 L5 -5 L13 -5 L8 -46 Z" fill={p("white")} />
    <path d="M-9 -24 L-9 -4 L2 -4 L0 -24 Z M4 -24 L5 -4 L15 -4 L11 -24 Z" fill={p("black")} />
    <path d="M-12 -82 L11 -82 L15 -34 L-15 -34 Z" fill={p("greycoat")} />
    <path d="M-2 -80 L7 -80 L7 -44 L-2 -44 Z" fill={p("white")} />
    <path d="M2 -72 L12 -66 L4 -60 Z" fill={p("greycoat")} />
    <rect x={-12} y={-84} width={22} height={5} rx={2.5} fill={p("green")} />
    <Face p={p} y={-90} />
    <path d="M-20 -95 Q2 -116 24 -95 Q2 -101 -20 -95 Z" fill={p("black")} />
    <circle cx={2} cy={-104} r={3} fill={p("red")} />
  </g>
);

export const kutuzov = (p: Paint): ReactNode => (
  <g>
    <Base p={p} w={30} />
    <path d="M-7 -46 L-9 -5 L0 -5 L1 -44 Z M3 -46 L6 -5 L14 -5 L9 -44 Z" fill={p("white")} />
    <path d="M-9 -22 L-9 -4 L1 -4 L0 -22 Z M5 -22 L6 -4 L15 -4 L12 -22 Z" fill={p("black")} />
    <path d="M-16 -82 L14 -82 L17 -40 L-18 -40 Z" fill={p("green")} />
    <path d="M-14 -62 L16 -62 L16 -57 L-14 -57 Z" fill={p("gold")} />
    <path d="M-16 -82 L16 -60 L16 -55 L-16 -77 Z" fill={p("blue")} />
    <ellipse cx={-14} cy={-80} rx={6} ry={3} fill={p("gold")} />
    <ellipse cx={13} cy={-80} rx={6} ry={3} fill={p("gold")} />
    <circle cx={1} cy={-90} r={8.5} fill={p("skin")} />
    <path d="M-7 -92 q8 -10 16 0 l-1 -6 q-7 -6 -14 0 Z" fill={p("white")} />
    <rect x={2} y={-93} width={7} height={3} fill={p("black")} />
    <path d="M-20 -98 Q1 -118 22 -98 Q1 -104 -20 -98 Z" fill={p("black")} />
    <path d="M-12 -104 q10 -12 22 -2" stroke={p("white")} strokeWidth={4} fill="none" />
  </g>
);

// Field gun on a wooden carriage; `recoil` 0→1 rolls it back.
export const cannon = (recoil = 0) => (p: Paint): ReactNode => (
  <g transform={`translate(${-recoil * 14},0)`}>
    <rect x={-46} y={-10} width={40} height={8} fill={p("wood")} transform="rotate(10 -46 -10)" />
    <path d="M-30 -30 L18 -40 L20 -30 L-28 -20 Z" fill={p("wood")} />
    <path d="M-8 -44 L46 -52 Q50 -48 46 -42 L-6 -30 Q-14 -36 -8 -44 Z" fill={p("gold")} />
    <ellipse cx={47} cy={-47} rx={3} ry={5.5} fill={p("char")} />
    <circle cx={-4} cy={-24} r={20} fill="none" stroke={p("brown")} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI;
      return <line key={i} x1={-4 - Math.cos(a) * 19} y1={-24 - Math.sin(a) * 19} x2={-4 + Math.cos(a) * 19} y2={-24 + Math.sin(a) * 19} stroke={p("brown")} strokeWidth={3} />;
    })}
    <circle cx={-4} cy={-24} r={4} fill={p("black")} />
  </g>
);

// Cossack lancer on a galloping horse (one rigid casting).
export const cossack = (p: Paint): ReactNode => (
  <g>
    <rect x={-48} y={-6} width={96} height={6} rx={2} fill={p("base")} />
    <path d="M-36 -6 L-30 -34 L-24 -34 L-28 -6 Z M30 -6 L20 -34 L27 -34 L38 -6 Z" fill={p("horse")} />
    <path d="M-46 -44 Q-40 -66 -10 -64 L20 -64 Q36 -70 42 -84 L54 -80 Q50 -64 40 -52 Q30 -36 0 -36 L-30 -36 Q-46 -36 -46 -44 Z" fill={p("horse")} />
    <path d="M42 -84 L56 -76 L52 -72 L40 -78 Z" fill={p("black")} />
    <path d="M-46 -48 Q-58 -40 -60 -26" stroke={p("black")} strokeWidth={5} fill="none" />
    <path d="M-8 -64 L8 -64 L10 -98 L-6 -98 Z" fill={p("blue")} />
    <path d="M-8 -66 L4 -50 L10 -52 L0 -66 Z" fill={p("blue")} />
    <path d="M-6 -72 L8 -72 L8 -68 L-6 -68 Z" fill={p("red")} />
    <circle cx={2} cy={-104} r={7} fill={p("skin")} />
    <path d="M-5 -100 q7 8 14 0 l0 6 q-7 6 -14 0 Z" fill={p("black")} />
    <path d="M-6 -109 L-5 -124 L10 -124 L10 -109 Z" fill={p("black")} />
    <rect x={-6} y={-126} width={16} height={4} fill={p("red")} />
    <path d="M-30 -60 L66 -130 L67.5 -128 L-28 -57 Z" fill={p("brown")} />
    <path d="M62 -127 L74 -136 L70 -126 Z" fill={p("grey")} />
    <path d="M56 -122 L44 -128 L52 -114 Z" fill={p("red")} />
  </g>
);

// Eagle standard with a stiff tin tricolour; `fall` 0→1 tips it over onto the table.
export const eagle = (p: Paint): ReactNode => (
  <g>
    <Base p={p} w={14} />
    <rect x={-2} y={-120} width={4} height={116} fill={p("brown")} />
    <rect x={2} y={-112} width={13} height={30} fill={p("blue")} />
    <rect x={15} y={-112} width={13} height={30} fill={p("white")} />
    <rect x={28} y={-112} width={13} height={30} fill={p("red")} />
    <path d="M-10 -128 Q0 -140 10 -128 L4 -122 L0 -126 L-4 -122 Z" fill={p("gold")} />
    <circle cx={0} cy={-134} r={4} fill={p("gold")} />
  </g>
);

// Bottle-brush model tree on a wooden disc; `snow` whitens the tips.
export const tree = (snow = 0, h = 1) => (p: Paint): ReactNode => (
  <g transform={`scale(${h})`}>
    <ellipse cx={0} cy={-2} rx={22} ry={5} fill={p("wood")} />
    <rect x={-2} y={-20} width={4} height={18} fill={p("brown")} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${-26 + i * 5} ${-18 - i * 26} L0 ${-60 - i * 26} L${26 - i * 5} ${-18 - i * 26} Z`} fill={p("green")} />
    ))}
    {snow > 0 && [0, 1, 2, 3].map((i) => <path key={`s${i}`} d={`M${-20 + i * 5} ${-28 - i * 26} L0 ${-60 - i * 26} L${20 - i * 5} ${-28 - i * 26} Q0 ${-38 - i * 26} ${-20 + i * 5} ${-28 - i * 26} Z`} fill={p("white")} opacity={snow} />)}
  </g>
);

// Cardboard house: a kraft box with painted logs, folded card roof, corrugated cut edge. burnt 0→1 chars it.
export const isba = (burnt = 0) => (p: Paint): ReactNode => (
  <g>
    <path d="M-50 0 L-50 -62 L30 -62 L30 0 Z" fill={p("wood")} />
    <path d="M30 0 L30 -62 L52 -70 L52 -8 Z" fill={p("brown")} />
    {[...Array(6)].map((_, i) => <line key={i} x1={-50} y1={-8 - i * 10} x2={30} y2={-8 - i * 10} stroke={p("brown")} strokeWidth={2} />)}
    {[...Array(8)].map((_, i) => <path key={`c${i}`} d={`M${30 + i * 2.7} ${-62 - i} q1.4 4 0 8`} stroke={p("cream")} strokeWidth={0.8} fill="none" opacity={0.6} />)}
    <rect x={-36} y={-46} width={16} height={18} fill={p("cream")} />
    <rect x={-6} y={-46} width={16} height={18} fill={p("cream")} />
    <path d="M-60 -60 L-10 -102 L40 -60 Z" fill={p("red")} />
    <path d="M40 -60 L-10 -102 L14 -110 L62 -68 Z" fill={p("red")} />
    {burnt > 0 && (
      <g opacity={burnt}>
        <path d="M-60 -60 L-10 -102 L40 -60 Z M40 -60 L-10 -102 L14 -110 L62 -68 Z" fill={p("char")} />
        <rect x={-36} y={-46} width={16} height={18} fill={p("char")} />
        <rect x={-6} y={-46} width={16} height={18} fill={p("char")} />
        <path d="M-50 -62 L30 -62 L22 -40 L6 -54 L-14 -36 L-30 -52 L-50 -40 Z" fill={p("char")} />
      </g>
    )}
  </g>
);

// A painted ribbon of river laid across the table between depths z0 (far) and z1 (near), with moving glints.
export const River = ({ c, z0, z1, x0, x1, t }: { c: Cam; z0: number; z1: number; x0: number; x1: number; t: number }) => {
  const a = at(c, x0, z0), b = at(c, x1, z0), d = at(c, x1, z1), e = at(c, x0, z1);
  return (
    <g>
      <defs>
        <linearGradient id="n02-river" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2a5a7a" />
          <stop offset="0.5" stopColor="#3d86a8" />
          <stop offset="1" stopColor="#1d4460" />
        </linearGradient>
      </defs>
      <path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${d.sx} ${d.sy} L${e.sx} ${e.sy} Z`} fill="url(#n02-river)" />
      <path d={`M${e.sx} ${e.sy} L${d.sx} ${d.sy} L${d.sx} ${d.sy + d.k * 0.025} L${e.sx} ${e.sy + e.k * 0.025} Z`} fill="#0f2534" />
      {Array.from({ length: 16 }, (_, i) => {
        const z = z0 + ((i * 0.37) % 1) * (z1 - z0);
        const xx = x0 + (((i * 1.9 + t * 0.012) % 1) + 1) % 1 * (x1 - x0);
        const q = at(c, xx, z);
        return <ellipse key={i} cx={q.sx} cy={q.sy} rx={q.k * 0.12} ry={q.k * 0.008} fill="#d8f0ff" opacity={0.55} />;
      })}
    </g>
  );
};

// Pontoon bridge: cork boats with a deck of lolly sticks, along x at depth z.
export const bridge = (len: number) => (p: Paint): ReactNode => (
  <g>
    {Array.from({ length: Math.ceil(len / 40) }, (_, i) => (
      <path key={i} d={`M${i * 40 - 16} -4 L${i * 40 + 16} -4 L${i * 40 + 12} 8 L${i * 40 - 12} 8 Z`} fill={p("char")} />
    ))}
    <rect x={-20} y={-10} width={len} height={7} fill={p("wood")} />
    {Array.from({ length: Math.ceil(len / 12) }, (_, i) => <line key={i} x1={-20 + i * 12} y1={-10} x2={-20 + i * 12} y2={-3} stroke={p("brown")} strokeWidth={1} />)}
  </g>
);

// Paper flame (orange tissue) for a fire or a shell burst.
export const Flame = ({ x, y, r, k, t }: { x: number; y: number; r: number; k: number; t: number }) => {
  if (k <= 0) return null;
  const w = Math.sin(t * 0.5) * 0.1;
  return (
    <g transform={`translate(${x},${y}) scale(${k * r / 40})`}>
      <path d={`M-30 0 Q-36 -40 -10 -50 Q-14 -${70 + w * 40} 4 -80 Q6 -56 22 -58 Q38 -36 30 0 Z`} fill="#e8541e" opacity={0.92} />
      <path d={`M-16 0 Q-20 -30 -2 -40 Q4 -${54 + w * 30} 12 -44 Q24 -26 18 0 Z`} fill="#ffb02a" opacity={0.95} />
    </g>
  );
};

// Flour "snow" dusted over a patch of the table (x0..x1, z0..z1).
export const Flour = ({ c, x0, x1, z0, z1, k = 1 }: { c: Cam; x0: number; x1: number; z0: number; z1: number; k?: number }) => {
  const a = at(c, x0, z0), b = at(c, x1, z0), d = at(c, x1, z1), e = at(c, x0, z1);
  return (
    <g opacity={k}>
      <defs>
        <filter id="n02-flour" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={2} seed={9} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -0.55" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <filter id="n02-dust" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves={1} seed={2} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  6 0 0 0 -3.2" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
      <path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${d.sx} ${d.sy} L${e.sx} ${e.sy} Z`} fill="#f4f1ea" opacity={0.42} />
      <path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${d.sx} ${d.sy} L${e.sx} ${e.sy} Z`} fill="#fbf8f2" filter="url(#n02-flour)" opacity={0.8} />
      <path d={`M${a.sx} ${a.sy} L${b.sx} ${b.sy} L${d.sx} ${d.sy} L${e.sx} ${e.sy} Z`} fill="#ffffff" filter="url(#n02-dust)" />
    </g>
  );
};

// Falling paper snow, some flakes near the lens (big and soft).
export const PaperSnow = ({ W, H, t, n = 70 }: { W: number; H: number; t: number; n?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const near = i % 7 === 0;
      const sp = near ? 5 : 1.6 + (i % 4) * 0.5;
      const x = ((i * 137.5) % W) + Math.sin(t / 30 + i) * 20;
      const y = ((i * 263 + t * sp) % (H + 40)) - 20;
      return <circle key={i} cx={x} cy={y} r={near ? 12 : 3 + (i % 3)} fill="#fbf8f0" opacity={near ? 0.45 : 0.85} />;
    })}
  </g>
);
