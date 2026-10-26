import type { ReactNode } from "react";

// Sand-animation pieces: a glowing light table, and pictures made of dark amber sand. Draw plain opaque shapes
// inside <Sand>; its filter turns them into sand (grainy alpha, soft spread edges, a thin halo of scattered
// grains). `cut` children are finger lines wiped through the sand (light shows through). `scatter` 0 → 120 blows
// the picture apart for the morph to the next one. 1080×1920 frame.
export const SAND = "#3b1d09";
export const GLASS = { x0: 44, y0: 44, x1: 1036, y1: 1876, r: 36 };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const TableDefs = ({ glow = 1 }: { glow?: number }) => (
  <defs>
    <clipPath id="sa-glass"><rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} rx={GLASS.r} /></clipPath>
    <radialGradient id="sa-glow" cx="0.5" cy="0.46" r="0.72">
      <stop offset="0" stopColor="#fff3e2" />
      <stop offset="0.4" stopColor="#ffdcb4" />
      <stop offset="0.78" stopColor="#f5b07a" />
      <stop offset="1" stopColor="#d97a48" />
    </radialGradient>
    <filter id="sa-grains" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={12} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.23  0 0 0 0 0.11  0 0 0 0 0.03  7 0 0 0 -4.3" />
    </filter>
    <filter id="sa-dust" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={4} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.35  0 0 0 0 0.17  0 0 0 0 0.05  0.9 0 0 0 -0.32" />
    </filter>
    <filter id="sa-bezel" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.005 0.2" numOctaves={3} seed={8} />
      <feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0 0.02  0 0 0 0.7 0" />
    </filter>
  </defs>
);

// The light table: dark wooden bezel, glowing glass, a faint drift of thin sand and loose grains everywhere.
export const Table = ({ glow = 1 }: { glow?: number }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#1a0e06" />
    <rect x={0} y={0} width={1080} height={1920} filter="url(#sa-bezel)" />
    <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} rx={GLASS.r} fill="url(#sa-glow)" opacity={glow} />
    <g opacity={glow}>
      <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} rx={GLASS.r} filter="url(#sa-dust)" opacity={0.25} />
      <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} rx={GLASS.r} filter="url(#sa-grains)" />
    </g>
    <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} rx={GLASS.r} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={6} />
  </g>
);

// One sand picture. `id` must be unique in the frame. `cut` = finger lines (stroke them; any colour).
// `soft` = edge blur (2 for lettering, 3.5 for pictures, 12+ for faint smears); `even` 0–1 = how evenly it is laid.
export const Sand = ({ id, children, cut, scatter = 0, opacity = 1, seed = 1, soft = 3.5, even = 0.5 }: { id: string; children: ReactNode; cut?: ReactNode; scatter?: number; opacity?: number; seed?: number; soft?: number; even?: number }) => {
  const s = scatter;
  return (
    <g opacity={opacity}>
      <defs>
        <filter id={`sd-${id}`} x="-0.3" y="-0.3" width="1.6" height="1.6">
          <feTurbulence type="fractalNoise" baseFrequency={0.018 + s * 0.0002} numOctaves={2} seed={seed} result="w" />
          <feDisplacementMap in="SourceAlpha" in2="w" scale={8 + s * 2.2} xChannelSelector="R" yChannelSelector="G" result="dsp" />
          <feGaussianBlur in="dsp" stdDeviation={soft + s * 0.08} result="b" />
          {/* grain: single grains decide the edge */}
          <feTurbulence type="fractalNoise" baseFrequency="1.25" numOctaves={1} seed={seed + 7} result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
          <feComposite in="b" in2="na" operator="arithmetic" k1={0} k2={1.7 - s * 0.006} k3={1.0} k4={-1.05} result="a0" />
          {/* thickness: the sand is laid unevenly, thin patches let the light through */}
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={seed + 3} result="m" />
          <feColorMatrix in="m" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.25" result="ma" />
          <feComposite in="a0" in2="ma" operator="arithmetic" k1={0.75 * (1 - even)} k2={0.42 + 0.58 * even} k3={0} k4={0} result="a" />
          <feFlood floodColor={SAND} result="c" />
          <feComposite in="c" in2="a" operator="in" result="body" />
          {/* thin sand pushed out around the shape: a soft lighter halo of loose grains */}
          <feGaussianBlur in="dsp" stdDeviation={14 + s * 0.3} result="h" />
          <feComposite in="h" in2="na" operator="arithmetic" k1={1.3} k2={0.05} k3={0} k4={-0.02} result="ha" />
          <feFlood floodColor="#5a2c0e" floodOpacity={0.8} result="hc" />
          <feComposite in="hc" in2="ha" operator="in" result="halo" />
          <feMerge><feMergeNode in="halo" /><feMergeNode in="body" /></feMerge>
        </filter>
        {cut && (
          <mask id={`sm-${id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1920} fill="#fff" />
            <g stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round">{cut}</g>
          </mask>
        )}
      </defs>
      <g filter={`url(#sd-${id})`}>
        <g mask={cut ? `url(#sm-${id})` : undefined} fill={SAND} stroke={SAND} strokeLinecap="round" strokeLinejoin="round">{children}</g>
      </g>
    </g>
  );
};

// A thin stream of sand poured from above onto (x, y), with a small pile spreading where it lands.
export const Pour = ({ x, y, frame, on = 1 }: { x: number; y: number; frame: number; on?: number }) =>
  on <= 0 ? null : (
    <g opacity={on} fill={SAND}>
      {Array.from({ length: 160 }, (_, i) => {
        const h = Math.max(1, y - GLASS.y0);
        const yy = GLASS.y0 + ((rnd(i) * h + frame * (46 + rnd(i + 3) * 14)) % h);
        const spread = 3 + ((yy - GLASS.y0) / h) * 9;
        return <circle key={i} cx={x + (rnd(i * 3 + frame) - 0.5) * spread} cy={yy} r={1.1 + rnd(i + 9) * 1.5} opacity={0.6 + rnd(i + 1) * 0.4} />;
      })}
      {Array.from({ length: 26 }, (_, i) => {
        const a = rnd(i + frame * 3) * Math.PI * 2;
        const d = rnd(i * 7 + frame) * 26;
        return <circle key={`p${i}`} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.5} r={1.5} opacity={0.7} />;
      })}
    </g>
  );

// Reveal helper for a drawn stroke: pathLength=1 plus this dash gives 0 → 1 drawing.
export const drawn = (k: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, Math.min(1, k)) });

// What a sweep leaves behind: a faint arc of thin sand where a picture was brushed away.
export const Smear = ({ x, y, r, a0 = -0.4, a1 = 2.2, k, id }: { x: number; y: number; r: number; a0?: number; a1?: number; k: number; id: string }) => {
  const p = (a: number, rr: number) => `${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`;
  const a = a0 + (a1 - a0) * Math.max(0, Math.min(1, k));
  return k <= 0 ? null : (
    <Sand id={id} seed={44} opacity={0.13} soft={18}>
      <path d={`M${p(a0, r)} A${r} ${r} 0 ${a - a0 > Math.PI ? 1 : 0} 1 ${p(a, r)} L${p(a, r * 0.72)} A${r * 0.72} ${r * 0.72} 0 ${a - a0 > Math.PI ? 1 : 0} 0 ${p(a0, r * 0.72)} Z`} stroke="none" />
    </Sand>
  );
};
