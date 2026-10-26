import type { ReactNode } from "react";

// N20 letterpress: a thick cotton sheet on the press bed. Giant wooden-type numerals and small metal-type captions
// are inked and pressed into it — uneven inking, wood grain in the solids, speckled voids, a slight debossed
// shadow on each letter's upper-left edge. Each colour arrives with a press stroke (the platen comes down, thump,
// lifts). Coordinates are for a 1080×1920 frame. Put <PressDefs /> inside the <svg> once.
export const P = {
  bed: "#24211e",
  paper: "#efe8d8",
  paperShade: "#d9d0bc",
  blue: "#1f3f99",
  orange: "#ec5a24",
  black: "#1c1a18",
};
export const SHEET = { x: 34, y: 34, w: 1012, h: 1852 };

// One ink filter per pass so speckle and grain differ between colours (seed).
const InkFilter = ({ id, seed, grain = true }: { id: string; seed: number; grain?: boolean }) => (
  <filter id={id} x="-2%" y="-2%" width="104%" height="104%">
    {/* speckled voids where the paper fibres did not take ink */}
    <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves={3} seed={seed} result="n" />
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 0 0 0 3.25" result="speck" />
    {/* wood grain: long horizontal streaks of thinner ink */}
    <feTurbulence type="fractalNoise" baseFrequency={grain ? "0.003 0.16" : "0.01 0.01"} numOctaves={2} seed={seed + 3} result="g" />
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.78" result="grain" />
    {/* uneven inking across the block */}
    <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={1} seed={seed + 7} result="u" />
    <feColorMatrix in="u" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.9 0 0 0 1.42" result="uneven" />
    <feComposite in="speck" in2="grain" operator="arithmetic" k1={1} result="m1" />
    <feComposite in="m1" in2="uneven" operator="arithmetic" k1={1} result="mask" />
    <feComposite in="SourceGraphic" in2="mask" operator="in" result="inked" />
    {/* ink squeezed to the edges of the type: a slightly darker rim */}
    <feMorphology in="SourceAlpha" operator="erode" radius={3} result="er" />
    <feComposite in="SourceAlpha" in2="er" operator="out" result="rim" />
    <feFlood floodColor="#000" floodOpacity={0.3} />
    <feComposite in2="rim" operator="in" result="rimInk" />
    <feMerge><feMergeNode in="inked" /><feMergeNode in="rimInk" /></feMerge>
  </filter>
);

export const PressDefs = () => (
  <defs>
    <InkFilter id="lp-ink-a" seed={11} />
    <InkFilter id="lp-ink-b" seed={23} />
    <InkFilter id="lp-ink-c" seed={37} grain={false} />
    {/* impression: inner shadow on the upper-left edge of each letter + a faint light lip below-right */}
    <filter id="lp-deboss" x="-2%" y="-2%" width="104%" height="104%">
      <feOffset in="SourceAlpha" dx={3} dy={4} result="o" />
      <feComposite in="SourceAlpha" in2="o" operator="out" result="edge" />
      <feGaussianBlur in="edge" stdDeviation={1.2} result="eb" />
      <feFlood floodColor="#3a2c1c" floodOpacity={0.55} />
      <feComposite in2="eb" operator="in" result="shadow" />
      <feOffset in="SourceAlpha" dx={-2} dy={-2} result="o2" />
      <feComposite in="o2" in2="SourceAlpha" operator="out" result="lip" />
      <feGaussianBlur in="lip" stdDeviation={1} result="lb" />
      <feFlood floodColor="#fffaf0" floodOpacity={0.7} />
      <feComposite in2="lb" operator="in" result="light" />
      <feMerge><feMergeNode in="shadow" /><feMergeNode in="light" /></feMerge>
    </filter>
    <filter id="lp-paper" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={4} seed={5} />
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.16 0" />
    </filter>
    <filter id="lp-cloud" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={8} />
      <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.36  0 0 0 0.22 0" />
    </filter>
    <filter id="lp-deckle" x="-3%" y="-3%" width="106%" height="106%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={2} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={14} />
    </filter>
    <filter id="lp-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={10} /></filter>
    <linearGradient id="lp-platen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0d0b09" stopOpacity={0.85} />
      <stop offset="0.7" stopColor="#0d0b09" stopOpacity={0.55} />
      <stop offset="1" stopColor="#0d0b09" stopOpacity={0} />
    </linearGradient>
  </defs>
);

// The press bed and the cotton sheet: deckled edge, fibre grain, soft cloudiness, a shadow under the sheet.
export const Sheet = () => (
  <g>
    <rect width={1080} height={1920} fill={P.bed} />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M0 ${i * 82 + 20} H1080`} stroke="#000" strokeOpacity={0.18} strokeWidth={2} />)}
    <rect x={SHEET.x + 10} y={SHEET.y + 16} width={SHEET.w} height={SHEET.h} fill="#000" opacity={0.6} filter="url(#lp-soft)" />
    <g filter="url(#lp-deckle)">
      <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={P.paper} />
    </g>
    <rect x={SHEET.x + 6} y={SHEET.y + 6} width={SHEET.w - 12} height={SHEET.h - 12} filter="url(#lp-cloud)" />
    <rect x={SHEET.x + 6} y={SHEET.y + 6} width={SHEET.w - 12} height={SHEET.h - 12} filter="url(#lp-paper)" />
    {/* a few long cotton fibres */}
    {Array.from({ length: 26 }, (_, i) => {
      const x = SHEET.x + 30 + ((i * 397) % (SHEET.w - 60));
      const y = SHEET.y + 30 + ((i * 683) % (SHEET.h - 60));
      return <path key={i} d={`M${x} ${y} q${8 + (i % 5) * 4} ${-6 + (i % 3) * 5} ${18 + (i % 4) * 6} ${(i % 7) - 3}`} stroke="#b9ab8e" strokeWidth={0.9} fill="none" opacity={0.55} />;
    })}
  </g>
);

// Inked type: `ink` = which pass filter (a, b, c), colour from the children's fill. `fresh` 0–1 adds the wet sheen
// just after the stroke. Shift dx/dy a pixel or two for honest registration.
export const Inked = ({ ink = "a", children, fresh = 0, dx = 0, dy = 0 }: { ink?: "a" | "b" | "c"; children: ReactNode; fresh?: number; dx?: number; dy?: number }) => (
  <g transform={`translate(${dx},${dy})`}>
    <g style={{ mixBlendMode: "multiply" }} filter={`url(#lp-ink-${ink})`} opacity={0.94 + fresh * 0.06}>{children}</g>
    <g filter="url(#lp-deboss)">{children}</g>
  </g>
);

// Blind impression only (no ink): a debossed shape, used for the press's own marks.
export const Blind = ({ children }: { children: ReactNode }) => <g filter="url(#lp-deboss)" opacity={0.8}>{children}</g>;

// The platen's shadow during a stroke: k 0 → 1 (coming down) → 0 (lifted). Draw it last, over the sheet.
export const Platen = ({ k }: { k: number }) =>
  k <= 0 ? null : (
    <g>
      <rect x={0} y={-1920 + k * 1920} width={1080} height={1920} fill="url(#lp-platen)" />
      <rect width={1080} height={1920} fill="#0d0b09" opacity={k * 0.35} />
    </g>
  );

// Stroke timing: returns platen k, the contact flag and a small squash for the frame. Down 10 frames, dwell 3, up 14.
export const stroke = (frame: number, at: number) => {
  const d = frame - at;
  const k = d < -10 || d > 17 ? 0 : d < 0 ? (d + 10) / 10 : d < 3 ? 1 : 1 - (d - 3) / 14;
  const hit = d >= 0 && d < 3;
  return { k: Math.max(0, Math.min(1, k)), printed: d >= 0, hit, fresh: d >= 0 ? Math.max(0, 1 - d / 30) : 0 };
};

// Printer's corner crop marks and a registration target.
export const Marks = ({ color = P.black }: { color?: string }) => (
  <g stroke={color} strokeWidth={2} opacity={0.75}>
    {[[90, 90, 1, 1], [990, 90, -1, 1], [90, 1830, 1, -1], [990, 1830, -1, -1]].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M${x - sx * 40} ${y} h${sx * 28} M${x} ${y - sy * 40} v${sy * 28}`} />
    ))}
    <circle cx={540} cy={1846} r={12} fill="none" />
    <path d="M520 1846 H560 M540 1826 V1866" />
  </g>
);
