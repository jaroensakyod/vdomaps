import { loadFont } from "@remotion/google-fonts/Chonburi";
import { geoEquirectangular, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

// M33 tattoo flash: the story is a sheet of tattoo designs pinned to a shop wall. Every design is a bold black
// outline in a limited palette (red, green, yellow, black on aged paper). The map itself is a flash medallion in a
// rope ring. Each design "inks in": the outline is pulled first (stroke draws on), then the colour is packed in from
// the centre, then the white highlights flick on. All designs here are original.

export const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  wall: "#1a1210", // the shop wall round the sheet
  paper: "#f6dc7c", // aged manila flash paper
  paperDark: "#c9ad74",
  ink: "#121010", // outline black
  red: "#c4211b",
  redDark: "#8e1512",
  green: "#22783b",
  greenDark: "#14512a",
  yellow: "#f1b712",
  yellowDark: "#c48a08",
  cream: "#f6ead0", // highlights / banner ground
  pencil: "#8f7a56",
};

export const W = 1080;
export const H = 1920;

// 0..1 of a design's ink-in: outline 0–0.55, colour 0.45–0.9, highlights 0.85–1
export const inkK = (frame: number, start: number, len = 46) => interpolate(frame, [start, start + len], [0, 1], clamp);
const seg = (k: number, a: number, b: number) => interpolate(k, [a, b], [0, 1], clamp);

// ---------------------------------------------------------------- the sheet
export const SheetDefs = () => (
  <defs>
    <filter id="m33-paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={7} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.62  0 0 0 0 0.46  0 0 0 0 0.12  0 0 0 0.6 -0.26" />
    </filter>
    <filter id="m33-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 0.22 0" />
    </filter>
    {/* hand-painted colour: a little uneven, the paper shows through */}
    <filter id="m33-paint" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={11} result="t" />
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.22" result="a" />
      <feComposite in="SourceGraphic" in2="a" operator="in" />
    </filter>
    {/* ink lines: slightly wobbly, a touch of bleed */}
    <filter id="m33-ink" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={4} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={2.6} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <radialGradient id="m33-vig" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stopColor="#6b4a1c" stopOpacity={0} />
      <stop offset="1" stopColor="#6b4a1c" stopOpacity={0.3} />
    </radialGradient>
    <pattern id="m33-dots" width="9" height="9" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill={C.ink} />
      <circle cx="6.5" cy="6.5" r="1.1" fill={C.ink} />
    </pattern>
  </defs>
);

const Stain = ({ x, y, r, o }: { x: number; y: number; r: number; o: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#a57c3c" opacity={o * 0.35} />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#8a5f24" strokeWidth={3} opacity={o * 0.4} />
  </g>
);

const PinHole = ({ x, y }: { x: number; y: number }) => (
  <g>
    <circle cx={x} cy={y} r={13} fill="#a98a52" opacity={0.5} />
    <path d={`M${x - 9} ${y + 3} L${x} ${y - 10} L${x + 10} ${y + 2} L${x + 2} ${y + 10} Z`} fill={C.wall} />
    <path d={`M${x - 9} ${y + 3} L${x} ${y - 10}`} stroke="#f4e5c0" strokeWidth={1.5} opacity={0.6} />
  </g>
);

// The flash sheet pinned to the wall: wall border, the paper (stains, foxing, crease, pin holes, pencil guides).
export const Sheet = ({ children, tilt = -0.5 }: { children?: ReactNode; tilt?: number }) => (
  <>
    <rect width={W} height={H} fill={C.wall} />
    <rect width={W} height={H} filter="url(#m33-grain)" opacity={0.8} />
    <g transform={`rotate(${tilt} 540 960)`}>
      <rect x={30} y={36} width={W - 60} height={H - 70} fill="#000" opacity={0.55} transform="translate(8 12)" />
      <rect x={30} y={36} width={W - 60} height={H - 70} fill={C.paper} />
      <rect x={30} y={36} width={W - 60} height={H - 70} filter="url(#m33-paper)" />
      <rect x={30} y={36} width={W - 60} height={H - 70} filter="url(#m33-grain)" />
      <Stain x={880} y={1600} r={110} o={0.6} />
      <Stain x={150} y={300} r={70} o={0.5} />
      <Stain x={960} y={240} r={46} o={0.4} />
      {/* fold crease across the sheet */}
      <path d="M30 1045 L1050 1018" stroke="#fff6dc" strokeWidth={3} opacity={0.35} />
      <path d="M30 1049 L1050 1022" stroke="#7a5a2a" strokeWidth={2} opacity={0.25} />
      {/* faint pencil guide lines from laying out the sheet */}
      <g stroke={C.pencil} strokeWidth={1.3} opacity={0.35} fill="none">
        <path d="M70 330 L1010 330" />
        <path d="M70 1290 L1010 1290" />
        <path d="M540 60 L540 140" />
        <circle cx={540} cy={790} r={392} strokeDasharray="6 10" />
      </g>
      <rect x={30} y={36} width={W - 60} height={H - 70} fill="url(#m33-vig)" />
      {/* torn corner */}
      <path d="M1050 36 L1050 96 L1018 70 L996 36 Z" fill={C.wall} />
      {children}
      <PinHole x={70} y={78} />
      <PinHole x={1008} y={112} />
      <PinHole x={68} y={1838} />
      <PinHole x={1010} y={1836} />
    </g>
  </>
);

// ---------------------------------------------------------------- ink-in designs
// A design is fills (colour, under) + lines (black outline, over) + hi (white flicks). `k` 0..1 runs the ink-in.
export type Part = { d: string; fill?: string; w?: number; dots?: boolean };
export const Flash = ({ id, k, x, y, s = 1, rot = 0, fills = [], lines = [], hi = [], children }: { id: string; k: number; x: number; y: number; s?: number; rot?: number; fills?: Part[]; lines?: Part[]; hi?: string[]; children?: ReactNode }) => {
  if (k <= 0) return null;
  const line = seg(k, 0, 0.55);
  const col = seg(k, 0.45, 0.9);
  const hk = seg(k, 0.85, 1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-pack`}>
          <circle cx={0} cy={0} r={20 + col * 420} />
        </clipPath>
      </defs>
      {/* colour packed in from the centre, a hair off the line like hand-painted flash */}
      <g clipPath={`url(#${id}-pack)`} opacity={col > 0 ? 1 : 0} filter="url(#m33-paint)">
        <g transform="translate(2 2)">
          {fills.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)}
        </g>
        {fills.filter((p) => p.dots).map((p, i) => <path key={`d${i}`} d={p.d} fill="url(#m33-dots)" opacity={0.55} />)}
      </g>
      {/* the outline pulled first */}
      <g filter="url(#m33-ink)" fill="none" stroke={C.ink} strokeLinecap="round" strokeLinejoin="round">
        {lines.map((p, i) => <path key={i} d={p.d} strokeWidth={(p.w ?? 7) / s} pathLength={1} strokeDasharray={`${line} 2`} />)}
      </g>
      {children ? <g opacity={col}>{children}</g> : null}
      <g fill="none" stroke={C.cream} strokeWidth={5 / s} strokeLinecap="round" opacity={hk}>
        {hi.map((d, i) => <path key={i} d={d} />)}
      </g>
    </g>
  );
};

// Original swallow, facing right (≈ 300 × 200).
const SW_BODY = "M92 -8 C72 -32 22 -30 -20 -12 L-92 -4 L-160 -36 L-116 6 L-160 44 L-92 14 L-20 16 C22 30 72 26 92 -8 Z";
const SW_WING_A = "M10 -14 C-20 -80 -96 -122 -176 -112 C-130 -92 -90 -60 -70 -16 Z";
const SW_WING_B = "M6 14 C-30 64 -100 96 -170 92 C-124 70 -86 44 -70 16 Z";
const SW_THROAT = "M70 4 C76 20 54 30 34 22 C46 14 56 8 70 4 Z";
const SW_BELLY = "M36 22 C6 30 -24 24 -60 13 L-22 10 C8 14 26 14 36 22 Z";
export const Swallow = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash
    {...p}
    fills={[
      { d: SW_WING_A, fill: C.ink },
      { d: SW_WING_B, fill: C.ink },
      { d: SW_BODY, fill: C.ink },
      { d: SW_THROAT, fill: C.red },
      { d: SW_BELLY, fill: C.cream },
      { d: "M92 -10 L116 -4 L92 2 Z", fill: C.yellow },
    ]}
    lines={[{ d: SW_WING_A }, { d: SW_WING_B }, { d: SW_BODY }, { d: SW_THROAT, w: 5 }, { d: SW_BELLY, w: 5 }, { d: "M92 -10 L116 -4 L92 2", w: 5 }]}
    hi={["M-40 -52 C-80 -84 -120 -98 -150 -104", "M-46 46 C-84 70 -120 82 -146 86", "M60 -20 C40 -24 20 -20 0 -14"]}
  >
    <circle cx={70} cy={-10} r={6} fill={C.cream} />
    <circle cx={71} cy={-10} r={3} fill={C.ink} />
  </Flash>
);

// Anchor with a red rope (≈ 260 × 320).
const AN_BODY = "M-12 -118 L12 -118 L12 108 C40 106 82 90 92 50 L78 42 L114 18 L128 62 L110 56 C98 104 46 136 0 136 C-46 136 -98 104 -110 56 L-128 62 L-114 18 L-78 42 L-92 50 C-82 90 -40 106 -12 108 Z";
const AN_STOCK = "M-74 -108 L74 -108 L74 -86 L-74 -86 Z";
const AN_RING = "M0 -118 m-26 -26 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0";
const AN_ROPE = "M0 -168 C60 -150 54 -90 4 -70 C-50 -48 -48 0 6 16 C56 30 52 74 0 90 C-36 100 -60 120 -70 150";
export const Anchor = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash
    {...p}
    fills={[{ d: AN_BODY, fill: C.yellow, dots: true }, { d: AN_STOCK, fill: C.yellowDark }]}
    lines={[{ d: AN_BODY }, { d: AN_STOCK }, { d: AN_RING, w: 9 }]}
    hi={["M-4 -100 L-4 90", "M-60 -97 L40 -97", "M-96 70 C-80 100 -50 118 -20 124"]}
  >
    <path d={AN_ROPE} fill="none" stroke={C.ink} strokeWidth={17} strokeLinecap="round" />
    <path d={AN_ROPE} fill="none" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
    <path d={AN_ROPE} fill="none" stroke={C.redDark} strokeWidth={10} strokeDasharray="5 9" />
  </Flash>
);

// Rose with two leaves (≈ 340 × 200).
const RO_HEAD = "M-80 0 C-90 -60 -30 -95 10 -85 C60 -90 95 -40 85 5 C90 60 40 90 0 85 C-50 92 -85 50 -80 0 Z";
const RO_LEAF_R = "M70 40 C120 26 166 56 178 96 C134 106 90 82 70 40 Z";
const RO_LEAF_L = "M-70 44 C-118 34 -160 64 -170 102 C-128 110 -88 86 -70 44 Z";
export const Rose = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash
    {...p}
    fills={[{ d: RO_LEAF_R, fill: C.green }, { d: RO_LEAF_L, fill: C.green }, { d: RO_HEAD, fill: C.red }, { d: "M-30 -10 C-25 -45 30 -50 35 -10 C38 20 0 30 -10 10 Z", fill: C.redDark }]}
    lines={[
      { d: RO_LEAF_R },
      { d: RO_LEAF_L },
      { d: "M78 48 C110 60 140 76 166 94", w: 4 },
      { d: "M-78 52 C-110 66 -138 82 -158 100", w: 4 },
      { d: RO_HEAD },
      { d: "M-30 -10 C-25 -45 30 -50 35 -10 C38 20 0 30 -10 10 C-18 -5 5 -15 10 -2", w: 6 },
      { d: "M-62 12 C-56 52 20 70 56 30", w: 5 },
      { d: "M-56 -30 C-40 -70 30 -76 62 -40", w: 5 },
    ]}
    hi={["M-66 -6 C-66 -36 -50 -58 -24 -70", "M40 60 C56 52 68 40 72 26"]}
  />
);

// Nautical star, halves red / black.
const star = (r: number, ri: number) => {
  const pt = (a: number, rr: number) => [Math.cos(((a - 90) * Math.PI) / 180) * rr, Math.sin(((a - 90) * Math.PI) / 180) * rr];
  const halves: { d: string; dark: boolean }[] = [];
  for (let i = 0; i < 5; i++) {
    const o = pt(i * 72, r);
    const a = pt(i * 72 - 36, ri);
    const b = pt(i * 72 + 36, ri);
    halves.push({ d: `M0 0 L${a[0]} ${a[1]} L${o[0]} ${o[1]} Z`, dark: true });
    halves.push({ d: `M0 0 L${o[0]} ${o[1]} L${b[0]} ${b[1]} Z`, dark: false });
  }
  const outline = Array.from({ length: 10 }, (_, i) => pt(i * 36, i % 2 ? ri : r)).map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ") + " Z";
  return { halves, outline };
};
const STAR = star(120, 48);
export const NauticalStar = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash
    {...p}
    fills={STAR.halves.map((h) => ({ d: h.d, fill: h.dark ? C.ink : C.red }))}
    lines={[{ d: STAR.outline, w: 8 }, ...STAR.halves.map((h) => ({ d: h.d, w: 3 }))]}
    hi={["M-6 -104 L-2 -60", "M88 -22 L52 -12"]}
  />
);

// Heart (≈ 240 × 180).
const HEART = "M0 78 C-120 4 -130 -84 -66 -100 C-28 -110 -6 -86 0 -64 C6 -86 28 -110 66 -100 C130 -84 120 4 0 78 Z";
export const Heart = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash {...p} fills={[{ d: HEART, fill: C.red }, { d: "M0 78 C-60 40 -100 0 -110 -40 C-60 10 -20 40 0 50 Z", fill: C.redDark, dots: true }]} lines={[{ d: HEART, w: 9 }]} hi={["M-80 -70 C-96 -56 -100 -36 -96 -18", "M-56 -86 C-46 -90 -36 -88 -30 -84"]} />
);

// Caravel with the red cross on its sails, riding flash waves (≈ 380 × 360).
const SH_HULL = "M-176 -6 L176 -6 C156 46 112 70 60 72 L-112 72 C-146 58 -168 30 -176 -6 Z";
const SH_STERN = "M-182 -6 L-186 -54 L-108 -54 L-108 -6 Z";
const SH_BOW = "M112 -6 L190 -34 L176 -6 Z";
const SH_MAIN = "M2 -262 L98 -262 C110 -210 110 -152 100 -110 L0 -110 C-10 -152 -10 -210 2 -262 Z";
const SH_FORE = "M100 -196 L176 -196 C186 -160 186 -128 178 -98 L98 -98 C92 -128 92 -160 100 -196 Z";
const SH_MIZ = "M-78 -250 L-78 -76 L-150 -76 Z";
const cross = (cx: number, cy: number, r: number) => `M${cx - r * 0.35} ${cy - r} L${cx + r * 0.35} ${cy - r} L${cx + r * 0.16} ${cy - r * 0.16} L${cx + r} ${cy - r * 0.35} L${cx + r} ${cy + r * 0.35} L${cx + r * 0.16} ${cy + r * 0.16} L${cx + r * 0.35} ${cy + r} L${cx - r * 0.35} ${cy + r} L${cx - r * 0.16} ${cy + r * 0.16} L${cx - r} ${cy + r * 0.35} L${cx - r} ${cy - r * 0.35} L${cx - r * 0.16} ${cy - r * 0.16} Z`;
const WAVE = "M-230 92 C-200 60 -160 60 -150 86 C-140 104 -116 104 -112 88 C-90 60 -40 58 -30 90 C-20 108 6 106 10 90 C36 58 86 58 94 90 C104 108 130 106 134 90 C160 60 206 62 226 92 L226 130 L-230 130 Z";
export const Caravel = (p: { id: string; k: number; x: number; y: number; s?: number; rot?: number }) => (
  <Flash
    {...p}
    fills={[
      { d: SH_MAIN, fill: C.cream },
      { d: SH_FORE, fill: C.cream },
      { d: SH_MIZ, fill: C.cream },
      { d: cross(50, -186, 34), fill: C.red },
      { d: cross(138, -148, 22), fill: C.red },
      { d: SH_HULL, fill: C.yellow },
      { d: SH_STERN, fill: C.yellowDark },
      { d: SH_BOW, fill: C.yellowDark },
      { d: "M-176 -6 L176 -6 L170 12 L-172 12 Z", fill: C.red },
      { d: WAVE, fill: C.green, dots: true },
      { d: "M50 -298 L50 -282 L92 -290 Z", fill: C.red },
      { d: "M-78 -282 L-78 -266 L-40 -274 Z", fill: C.red },
    ]}
    lines={[
      { d: "M50 -300 L50 -6", w: 7 },
      { d: "M138 -226 L138 -6", w: 6 },
      { d: "M-78 -284 L-78 -6", w: 6 },
      { d: SH_MAIN },
      { d: SH_FORE },
      { d: SH_MIZ },
      { d: cross(50, -186, 34), w: 4 },
      { d: cross(138, -148, 22), w: 4 },
      { d: SH_HULL },
      { d: SH_STERN },
      { d: SH_BOW },
      { d: "M-150 30 L150 30 M-130 50 L120 50", w: 4 },
      { d: WAVE, w: 7 },
      { d: "M-120 108 C-100 96 -84 98 -76 112 M14 110 C34 96 50 98 58 112 M150 108 C170 96 186 98 194 112", w: 4 },
    ]}
    hi={["M10 -246 C2 -200 2 -150 8 -122", "M-160 4 C-150 30 -130 50 -110 58", "M-200 82 C-186 70 -170 70 -162 80"]}
  />
);

// Little caravel marker that rides the route on the map (no ink-in, it is "already tattooed").
export const ShipMark = ({ x, y, s = 0.2, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d={SH_MAIN} fill={C.cream} stroke={C.ink} strokeWidth={14} />
    <path d={cross(50, -186, 34)} fill={C.red} />
    <path d="M50 -300 L50 -6" stroke={C.ink} strokeWidth={14} />
    <path d={SH_HULL} fill={C.yellow} stroke={C.ink} strokeWidth={16} />
  </g>
);

// Ribbon banner with folded tails and lettering. `k` 0..1 unrolls it from the centre.
export const Banner = ({ x, y, w, h = 76, text, size = 40, k = 1, fill = C.cream, color = C.ink, tail = C.red, rot = 0, bend = 14 }: { x: number; y: number; w: number; h?: number; text: string; size?: number; k?: number; fill?: string; color?: string; tail?: string; rot?: number; bend?: number }) => {
  if (k <= 0) return null;
  const ww = w * interpolate(k, [0, 0.6], [0.15, 1], clamp);
  const a = ww / 2;
  const t = h * 0.5;
  const tk = interpolate(k, [0.5, 0.8], [0, 1], clamp);
  const band = `M${-a} ${-t} Q0 ${-t - bend} ${a} ${-t} L${a} ${t} Q0 ${t - bend} ${-a} ${t} Z`;
  const tl = `M${-a + 14} ${-t + 22} L${-a - 70 * tk} ${-t + 22} L${-a - 44 * tk} ${t * 0.5 + 12} L${-a - 70 * tk} ${t + 22} L${-a + 14} ${t + 22} Z`;
  const tr = `M${a - 14} ${-t + 22} L${a + 70 * tk} ${-t + 22} L${a + 44 * tk} ${t * 0.5 + 12} L${a + 70 * tk} ${t + 22} L${a - 14} ${t + 22} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} filter="url(#m33-ink)">
      <path d={tl} fill={tail} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={tr} fill={tail} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${-a} ${t} L${-a + 14} ${t + 22} L${-a + 14} ${t - 2} Z`} fill={C.ink} />
      <path d={`M${a} ${t} L${a - 14} ${t + 22} L${a - 14} ${t - 2} Z`} fill={C.ink} />
      <path d={band} fill={fill} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M${-a + 16} ${-t + 10} Q0 ${-t - bend + 10} ${a - 16} ${-t + 10}`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} />
      <text x={0} y={size * 0.36 - bend * 0.35} textAnchor="middle" fontFamily={font} fontSize={size} fill={color} opacity={interpolate(k, [0.55, 0.9], [0, 1], clamp)}>
        {text}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- the map medallion
const LAND = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land as GeometryCollection) as unknown as FeatureCollection<Geometry>;
export const medallionProj = (cx: number, cy: number, pxPerDeg: number, center: [number, number]): GeoProjection =>
  geoEquirectangular().scale((pxPerDeg * 180) / Math.PI).center(center).translate([cx, cy]).clipExtent([[cx - 520, cy - 520], [cx + 520, cy + 520]]);

// Wave flicks scattered over the sea, the classic flash way of saying "water".
const flicks = (cx: number, cy: number, r: number) =>
  Array.from({ length: 70 }, (_, i) => {
    const a = random(`fa${i}`) * Math.PI * 2;
    const d = Math.sqrt(random(`fd${i}`)) * r * 0.95;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d };
  });

// Rope ring: a twisted cord drawn as slanted strokes round the circle.
const Rope = ({ cx, cy, r, k }: { cx: number; cy: number; r: number; k: number }) => {
  const n = 120;
  return (
    <g opacity={k}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={38} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.yellow} strokeWidth={26} />
      {Array.from({ length: Math.round(n * k) }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * (r - 13), y1 = cy + Math.sin(a) * (r - 13);
        const a2 = a + 0.045;
        const x2 = cx + Math.cos(a2) * (r + 13), y2 = cy + Math.sin(a2) * (r + 13);
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Medallion = ({ cx, cy, r, proj, k, children }: { cx: number; cy: number; r: number; proj: GeoProjection; k: number; children?: ReactNode }) => {
  if (k <= 0) return null;
  const path = geoPath(proj);
  const d = path(LAND) ?? "";
  const line = seg(k, 0, 0.55);
  const col = seg(k, 0.45, 0.9);
  return (
    <g>
      <defs>
        <clipPath id="m33-med">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <clipPath id="m33-med-pack">
          <circle cx={cx} cy={cy} r={30 + col * (r + 40)} />
        </clipPath>
      </defs>
      <circle cx={cx + 10} cy={cy + 14} r={r + 26} fill="#000" opacity={0.18} />
      <g clipPath="url(#m33-med)">
        <circle cx={cx} cy={cy} r={r} fill={C.cream} />
        <g opacity={line} stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round">
          {flicks(cx, cy, r).map((f, i) => <path key={i} d={`M${f.x - 12} ${f.y} q 6 -9 12 0 q 6 9 12 0`} />)}
        </g>
        <g clipPath="url(#m33-med-pack)" filter="url(#m33-paint)">
          <path d={d} fill={C.green} transform="translate(2 2)" />
          <path d={d} fill="url(#m33-dots)" opacity={0.28} />
        </g>
        <g filter="url(#m33-ink)">
          <path d={d} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={`${line} 2`} />
        </g>
        {children}
      </g>
      <Rope cx={cx} cy={cy} r={r + 6} k={seg(k, 0.1, 0.7)} />
    </g>
  );
};

// The route as bold red dashes with a black keyline, drawn on to `k`.
export const Route = ({ id, pts, k }: { id: string; pts: [number, number][]; k: number }) => {
  if (k <= 0) return null;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <mask id={id}>
          <path d={d} stroke="#fff" strokeWidth={30} pathLength={1} strokeDasharray={`${k} 2`} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <path d={d} stroke={C.ink} strokeWidth={17} strokeDasharray="26 16" />
        <path d={d} stroke={C.red} strokeWidth={9} strokeDasharray="26 16" />
      </g>
    </g>
  );
};

// Point at `t` 0..1 along a polyline, with its heading.
export const along = (pts: [number, number][], t: number) => {
  const seglen = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seglen.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seglen.length; i++) {
    if (d <= seglen[i] || i === seglen.length - 1) {
      const u = seglen[i] ? Math.min(1, d / seglen[i]) : 0;
      const a = pts[i], b = pts[i + 1];
      return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx: b[0] - a[0] };
    }
    d -= seglen[i];
  }
  return { x: pts[0][0], y: pts[0][1], dx: 1 };
};

// Smooth a few waypoints into a polyline (Catmull-Rom).
export const smooth = (p: [number, number][], n = 12): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)) as [number, number]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};

// A place dot: black ring with a red centre (pops in).
export const Port = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${interpolate(k, [0, 0.6, 1], [0, 1.3, 1], clamp)})`}>
      <circle r={15} fill={C.cream} stroke={C.ink} strokeWidth={6} />
      <circle r={6} fill={C.red} />
    </g>
  );

// Hand-lettered display text: red fill, heavy black keyline, offset black drop. Wipes in outline-first.
export const Lettering = ({ x, y, text, size, k, fill = C.red, anchor = "middle", id }: { x: number; y: number; text: string; size: number; k: number; fill?: string; anchor?: "start" | "middle" | "end"; id: string }) => {
  if (k <= 0) return null;
  const line = seg(k, 0, 0.6);
  const col = seg(k, 0.45, 1);
  return (
    <g>
      <defs>
        <clipPath id={`${id}-wipe`}>
          <rect x={0} y={y - size * 1.4} width={W * line} height={size * 2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-wipe)`} filter="url(#m33-ink)">
        <text x={x + 7} y={y + 8} textAnchor={anchor} fontFamily={font} fontSize={size} fill={C.ink} stroke={C.ink} strokeWidth={size * 0.16} strokeLinejoin="round">{text}</text>
        <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill={C.cream} stroke={C.ink} strokeWidth={size * 0.13} strokeLinejoin="round" style={{ paintOrder: "stroke" }}>{text}</text>
        <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill={fill} opacity={col}>{text}</text>
      </g>
    </g>
  );
};
