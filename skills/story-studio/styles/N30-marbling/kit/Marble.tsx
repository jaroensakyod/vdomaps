import type { ReactNode } from "react";

// Paper-marbling (ebru) engine. Paint floats on the size as polygons. Three operations change it, in order:
//   drop   — a new circle of paint; every older shape is pushed outward (p' = c + (p − c)·√(1 + r²/|p − c|²)),
//            so earlier drops become rings around later ones (the classic stone pattern)
//   tine   — a straight comb tooth dragged along a line: paint near it shifts along the line, falling off with
//            distance (exp(−d/λ)); alternate directions make the wavy "gel-git" fields
//   stroke — the stylus drawn along a curve: paint near the path is dragged along it; this is how figures,
//            flower points and lightning are pulled out of drops
// The surface is recomputed from the start of the list every frame (k 0 → 1 inside each op's frames), so it is
// deterministic and needs no state. Polygons are refined before each op to keep edges smooth. 1080×1920 frame.
import { type Pt, type Shape } from "./Sim";
export { head, simulate, type Op, type Pt, type Shape } from "./Sim";

const pathOf = (pts: Pt[]) => {
  let d = "";
  for (let i = 0; i < pts.length; i++) d += `${i ? "L" : "M"}${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  return d + "Z";
};

export const MarbleDefs = () => (
  <defs>
    {/* the size (thickened water) and the paper both have a faint grain */}
    <filter id="mb-grain" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={8} />
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.22 0" />
    </filter>
    <filter id="mb-wood" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves={3} seed={2} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.06  0 0 0 1.4 -0.35" />
    </filter>
    {/* paint on the size: a slight soft edge and a thin darker vein where colours meet */}
    <filter id="mb-paint" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={5} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={4} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <radialGradient id="mb-sheen" cx="0.35" cy="0.25" r="0.9">
      <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
      <stop offset="0.45" stopColor="#fff" stopOpacity={0.02} />
      <stop offset="1" stopColor="#000" stopOpacity={0.3} />
    </radialGradient>
  </defs>
);

// The floating paint. `veins` draws a thin darker line round every shape (how marbled colour fields meet).
export const Surface = ({ shapes, ground, clip, veins = true }: { shapes: Shape[]; ground: string; clip: string; veins?: boolean }) => (
  <g clipPath={`url(#${clip})`}>
    <rect x={0} y={0} width={1080} height={1920} fill={ground} />
    <g filter="url(#mb-paint)">
      {shapes.map((s, i) => <path key={i} d={pathOf(s.pts)} fill={s.color} stroke={veins ? "#120c1c" : "none"} strokeOpacity={0.28} strokeWidth={1.3} />)}
    </g>
    <rect x={0} y={0} width={1080} height={1920} filter="url(#mb-grain)" />
  </g>
);

// The stylus (a thin wooden awl) with its tip at (x, y).
export const Stylus = ({ x, y, show = 1 }: { x: number; y: number; show?: number }) => (
  <g opacity={show}>
    <path d={`M${x + 18} ${y + 14} L${x + 300} ${y - 250}`} stroke="#000" strokeOpacity={0.3} strokeWidth={14} strokeLinecap="round" style={{ filter: "blur(6px)" }} />
    <path d={`M${x} ${y} L${x + 26} ${y - 24}`} stroke="#c9c2b4" strokeWidth={4} strokeLinecap="round" />
    <path d={`M${x + 24} ${y - 22} L${x + 290} ${y - 270}`} stroke="#8a5a2e" strokeWidth={12} strokeLinecap="round" />
    <path d={`M${x + 28} ${y - 28} L${x + 288} ${y - 274}`} stroke="#c58f55" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
  </g>
);

// A comb: a bar with teeth, drawn across the tray; the teeth tips sit on the tine lines.
export const Comb = ({ vertical, offset, teeth, from, to, show = 1 }: { vertical: boolean; offset: number; teeth: number[]; from: number; to: number; show?: number }) => (
  <g opacity={show * 0.9}>
    {vertical ? (
      <g>
        <rect x={from - 10} y={offset - 60} width={to - from + 20} height={26} rx={6} fill="#6e4524" />
        {teeth.map((t) => <path key={t} d={`M${t} ${offset - 40} L${t} ${offset + 30}`} stroke="#d8d2c4" strokeWidth={4} strokeLinecap="round" />)}
      </g>
    ) : (
      <g>
        <rect x={offset - 60} y={from - 10} width={26} height={to - from + 20} rx={6} fill="#6e4524" />
        {teeth.map((t) => <path key={t} d={`M${offset - 40} ${t} L${offset + 30} ${t}`} stroke="#d8d2c4" strokeWidth={4} strokeLinecap="round" />)}
      </g>
    )}
  </g>
);

// The tray: dark wooden rim and the size inside it. Put a <Surface> inside as children.
export const Tray = ({ box, children }: { box: [number, number, number, number]; children: ReactNode }) => {
  const [x0, y0, x1, y1] = box;
  return (
    <g>
      <rect x={x0 - 26} y={y0 - 26} width={x1 - x0 + 52} height={y1 - y0 + 52} rx={18} fill="#3a2414" />
      <rect x={x0 - 26} y={y0 - 26} width={x1 - x0 + 52} height={y1 - y0 + 52} rx={18} filter="url(#mb-wood)" />
      <rect x={x0 - 4} y={y0 - 4} width={x1 - x0 + 8} height={y1 - y0 + 8} rx={6} fill="#1a0f08" />
      {children}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#mb-sheen)" />
    </g>
  );
};
