import { loadFont } from "@remotion/google-fonts/Charmonman";
import type { ReactNode } from "react";
import { random } from "remotion";

// N25 glass mosaic (กระจกเกรียบ): the whole frame is a temple wall set with small pieces of mirror and coloured
// glass in a lime-plaster bed, divided by raised gilded stucco. Every tile is a little facet at its own angle, so a
// band of light sweeping over the wall makes single pieces flash. Scenes change by re-setting the wall: tiles turn
// over one by one, a wave from one point. Pictures are classifier functions (x, y) → glass colour.

export const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  grout: "#0f3a1a", // lime-plaster bed seen between pieces (darkened by age)
  red: "#9e1a1f", // ruby glass of the bands
  gold: "#e2b245", // gilded stucco
  goldHi: "#fff1b8",
  goldLo: "#6e4a12",
  emerald: "#139a6a",
  mirror: "#c9d3d6",
  blue: "#1d4f9e",
  text: "#fff1c4",
};
export const W = 1080;
export const H = 1920;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- tiles ----------
export type Tile = { cx: number; cy: number; pts: [number, number][]; f: number; g: number; i: number };
const S = 22; // tile pitch
export const TILES: Tile[] = (() => {
  const out: Tile[] = [];
  let i = 0;
  for (let r = 0; r * S < H + S; r++)
    for (let c = -1; c * S < W + S; c++) {
      const ox = (r % 2) * S * 0.5;
      const cx = c * S + ox + (random(`x${i}`) - 0.5) * 4;
      const cy = r * S + (random(`y${i}`) - 0.5) * 4;
      const h = S * 0.5 - 1.3;
      const pts: [number, number][] = [
        [-h, -h], [h, -h], [h, h], [-h, h],
      ].map(([dx, dy], k) => [cx + dx + (random(`p${i}${k}`) - 0.5) * 5, cy + dy + (random(`q${i}${k}`) - 0.5) * 5]);
      out.push({ cx, cy, pts, f: random(`f${i}`), g: random(`g${i}`), i });
      i++;
    }
  return out;
})();

// glass: 'm' mirror (silver, flashes hardest), 'g' coloured glass, 'd' dull (plaster showing)
export type Glass = { c: string; k?: "m" | "g" | "d" };
export type Picture = (x: number, y: number, t: Tile) => Glass | null; // null = no glass here (plaster, sky)

const rgb = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const cache = new Map<string, number[]>();
const toRgb = (h: string) => cache.get(h) ?? (cache.set(h, rgb(h)), rgb(h));
const hex2 = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");

// Shade one tile: its own tilt (f) dims or lifts it; the light band `u0` (diagonal position) makes it flash.
export const shade = (g: Glass, t: Tile, u0: number, twinkle: number) => {
  const [r, gg, b] = toRgb(g.c);
  const tilt = 0.84 + 0.3 * t.f;
  const u = t.cx * 0.55 + t.cy * 0.83;
  const band = Math.exp(-(((u - u0) / 170) ** 2));
  const facet = t.g > 0.55 ? ((t.g - 0.55) / 0.45) ** 2 : 0;
  const k = g.k === "m" ? 1 : g.k === "d" ? 0.1 : 0.3;
  const flash = Math.min(1, band * facet * 1.6 * k + (g.k === "m" ? twinkle * facet * 0.5 : 0));
  const m = (v: number) => v * tilt * (1 - flash) + 255 * flash;
  return { fill: `#${hex2(m(r))}${hex2(m(gg))}${hex2(m(b))}`, flash };
};

// The wall: every tile, coloured by picture A, turning over to picture B as `flip` passes its delay.
// `origin` is where the re-setting wave starts.
export const Wall = ({ A, B, flip = 0, origin = [540, 960], u0, twinkle, clip }: { A: Picture; B?: Picture; flip?: number; origin?: [number, number]; u0: number; twinkle: number; clip?: string }) => {
  const sparks: Tile[] = [];
  const maxD = 2300;
  const polys = TILES.map((t) => {
    let p = 0;
    if (B && flip > 0) {
      const d = Math.hypot(t.cx - origin[0], t.cy - origin[1]) / maxD;
      p = Math.max(0, Math.min(1, (flip * 1.35 - d - t.f * 0.25) / 0.2));
    }
    const pic = p >= 0.5 && B ? B : A;
    const g = pic(t.cx, t.cy, t);
    if (!g) return null;
    const { fill, flash } = shade(g, t, u0, twinkle);
    if (flash > 0.82 && sparks.length < 40) sparks.push(t);
    const sx = Math.abs(Math.cos(p * Math.PI));
    const pts = t.pts.map(([x, y]) => `${(t.cx + (x - t.cx) * sx).toFixed(1)},${y.toFixed(1)}`).join(" ");
    return <polygon key={t.i} points={pts} fill={fill} />;
  });
  return (
    <g>
      {clip ? (
        <g clipPath={clip}>
          <rect x={0} y={0} width={W} height={H} fill={C.grout} />
          <rect x={0} y={0} width={W} height={H} filter="url(#n25-plaster)" />
        </g>
      ) : null}
      {polys}
      {/* glints: four-point stars on the pieces catching the light */}
      <g fill="#fff">
        {sparks.map((t) => {
          const s = 10 + t.f * 16;
          return <path key={t.i} d={`M${t.cx} ${t.cy - s} L${t.cx + 2} ${t.cy - 2} L${t.cx + s} ${t.cy} L${t.cx + 2} ${t.cy + 2} L${t.cx} ${t.cy + s} L${t.cx - 2} ${t.cy + 2} L${t.cx - s} ${t.cy} L${t.cx - 2} ${t.cy - 2} Z`} opacity={0.9} filter="url(#n25-glow)" />;
        })}
      </g>
    </g>
  );
};

// ---------- gilded stucco ----------
export const MosaicDefs = ({ az = 225 }: { az?: number }) => (
  <defs>
    {/* raised gilded stucco: blurred alpha as a height map, lit by a moving lamp, plus a cast shadow */}
    <filter id="n25-emboss" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation={2.6} result="h" />
      <feSpecularLighting in="h" surfaceScale={6} specularConstant={1.25} specularExponent={16} lightingColor="#fff4cc" result="s">
        <feDistantLight azimuth={az} elevation={42} />
      </feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
      <feDiffuseLighting in="h" surfaceScale={6} diffuseConstant={1} lightingColor="#ffffff" result="d">
        <feDistantLight azimuth={az} elevation={50} />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="lit" />
      <feComposite in="lit" in2="s2" operator="arithmetic" k1={0} k2={1} k3={0.9} k4={0} result="shine" />
      <feOffset in="SourceAlpha" dx={4} dy={7} result="o" />
      <feGaussianBlur in="o" stdDeviation={3} result="ob" />
      <feColorMatrix in="ob" values="0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 0 0.01  0 0 0 0.85 0" result="sh" />
      <feMerge>
        <feMergeNode in="sh" />
        <feMergeNode in="shine" />
      </feMerge>
    </filter>
    <filter id="n25-plaster" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={3} />
      <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.78  0 0 0 0 0.6  0 0 0 0.35 -0.05" />
    </filter>
    <filter id="n25-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={1.4} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="n25-relief" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx={3} dy={5} stdDeviation={2.5} floodColor="#1a0e04" floodOpacity={0.85} />
    </filter>
    <linearGradient id="n25-gold" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stopColor={C.goldHi} />
      <stop offset="0.35" stopColor={C.gold} />
      <stop offset="0.7" stopColor="#b07a1e" />
      <stop offset="1" stopColor={C.goldHi} />
    </linearGradient>
    <radialGradient id="n25-dome" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stopColor="#fff3c0" />
      <stop offset="0.35" stopColor="#e9bd52" />
      <stop offset="0.75" stopColor="#b8801f" />
      <stop offset="1" stopColor="#7a5212" />
    </radialGradient>
    <pattern id="n25-scales" width={28} height={20} patternUnits="userSpaceOnUse">
      <path d="M0 20 Q7 6 14 20 Q21 6 28 20 M-14 10 Q-7 -4 0 10 Q7 -4 14 10 Q21 -4 28 10 Q35 -4 42 10" fill="none" stroke="#6e4a12" strokeWidth={1.6} />
      <path d="M1 19 Q7 8 13 19 M15 19 Q21 8 27 19" fill="none" stroke="#fff1b8" strokeWidth={1} opacity={0.7} />
    </pattern>
    <radialGradient id="n25-seamglow">
      <stop offset="0" stopColor="#e6fff4" stopOpacity={0.95} />
      <stop offset="0.25" stopColor="#9ff7d0" stopOpacity={0.6} />
      <stop offset="0.6" stopColor="#3fdc9c" stopOpacity={0.18} />
      <stop offset="1" stopColor="#3fdc9c" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="n25-vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.5} />
    </radialGradient>
  </defs>
);

// A raised gilded-stucco line: dark cast shadow, gold body, a thin highlight ridge.
export const Gilt = ({ d, w = 14, fill = false }: { d: string; w?: number; fill?: boolean }) => (
  <g filter="url(#n25-emboss)">
    <path d={d} stroke="#d9a63a" strokeWidth={w} fill={fill ? "#d9a63a" : "none"} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

// Cartouche outline: a long plaque with flame-pointed ends.
export const cartouche = (x: number, y: number, w: number, h: number) =>
  `M${x + 60} ${y} L${x + w - 60} ${y} C${x + w - 20} ${y} ${x + w} ${y + h * 0.3} ${x + w + 26} ${y + h / 2} C${x + w} ${y + h * 0.7} ${x + w - 20} ${y + h} ${x + w - 60} ${y + h} L${x + 60} ${y + h} C${x + 20} ${y + h} ${x} ${y + h * 0.7} ${x - 26} ${y + h / 2} C${x} ${y + h * 0.3} ${x + 20} ${y} ${x + 60} ${y} Z`;

// A solid mass of gilded stucco (a chedi body, a medallion): domed gold gradient, bevelled edge, fine incised
// scale pattern so it reads as modelled plaster under gold leaf, not a flat cut-out.
export const GiltMass = ({ d }: { d: string }) => (
  <g>
    <g filter="url(#n25-emboss)">
      <path d={d} fill="url(#n25-dome)" />
    </g>
    <path d={d} fill="url(#n25-scales)" opacity={0.55} />
  </g>
);

// Kanok scroll vine (ลายก้านขด) in gilded stucco: a wavy stem down (x, y0..y1) with a spiral curl at every bend,
// each curl ending in a flame tip. side = which way the first curl turns.
const spiral = (x: number, y: number, r0: number, a0: number, dir: number, turns = 1.35) => {
  const pts: string[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * turns * Math.PI * 2;
    const r = r0 * Math.exp(-0.42 * th);
    pts.push(`${(x + Math.cos(a0 + dir * th) * r).toFixed(1)} ${(y + Math.sin(a0 + dir * th) * r).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};
export const scrollVine = (x: number, y0: number, y1: number, amp = 70, step = 210, r = 62, side = 1) => {
  const n = Math.max(1, Math.round((y1 - y0) / step));
  const st = (y1 - y0) / n;
  let stem = `M${x} ${y0}`;
  const curls: string[] = [];
  const tips: string[] = [];
  for (let i = 0; i < n; i++) {
    const s = (i % 2 ? -1 : 1) * side;
    const ya = y0 + i * st;
    stem += ` C${x + s * amp} ${ya + st * 0.25} ${x + s * amp} ${ya + st * 0.75} ${x} ${ya + st}`;
    // curl leaves the crest and winds inward
    const cx = x + s * (amp + r * 0.9), cy = ya + st * 0.5;
    curls.push(spiral(cx, cy, r, s > 0 ? Math.PI : 0, s > 0 ? -1 : 1));
    // flame tip off the outer side of the curl
    const tx = cx + s * r * 0.5, ty = cy - r * 1.05;
    tips.push(`M${cx - s * 6} ${cy - r * 0.9} C${tx} ${ty - 8} ${tx + s * 24} ${ty - 44} ${tx + s * 52} ${ty - 70} C${tx + s * 10} ${ty - 40} ${tx - s * 26} ${ty - 16} ${cx - s * 26} ${cy - r * 0.7}`);
  }
  return { stem, curls, tips };
};
export const Vine = ({ x, y0, y1, side = 1, amp = 70, r = 62, step = 210 }: { x: number; y0: number; y1: number; side?: number; amp?: number; r?: number; step?: number }) => {
  const v = scrollVine(x, y0, y1, amp, step, r, side);
  return (
    <g filter="url(#n25-emboss)" fill="none" stroke="#d9a63a" strokeLinecap="round" strokeLinejoin="round">
      <path d={v.stem} strokeWidth={20} />
      {v.curls.map((d, i) => <path key={i} d={d} strokeWidth={14} />)}
      {v.tips.map((d, i) => <path key={`t${i}`} d={d} fill="#d9a63a" strokeWidth={3} />)}
    </g>
  );
};

// Kanok flame border: a row of flame leaves along a straight run (x0..x1 at y, pointing `dir` up/down).
export const KanokRow = ({ x0, x1, y, dir = -1, size = 34 }: { x0: number; x1: number; y: number; dir?: number; size?: number }) => {
  const n = Math.round((x1 - x0) / size);
  const step = (x1 - x0) / n;
  const d = Array.from({ length: n }, (_, i) => {
    const x = x0 + i * step;
    const h = size * 0.95 * dir;
    return `M${x} ${y} C${x + step * 0.1} ${y + h * 0.5} ${x + step * 0.55} ${y + h * 0.6} ${x + step * 0.75} ${y + h} C${x + step * 0.7} ${y + h * 0.55} ${x + step * 0.95} ${y + h * 0.3} ${x + step} ${y}`;
  }).join(" ");
  return <Gilt d={d} w={5} />;
};

// Lotus-bud bead row (ลูกประคำ): small gilt ovals.
export const Beads = ({ x0, x1, y, gap = 26 }: { x0: number; x1: number; y: number; gap?: number }) => (
  <g filter="url(#n25-relief)">
    {Array.from({ length: Math.floor((x1 - x0) / gap) + 1 }, (_, i) => (
      <ellipse key={i} cx={x0 + i * gap} cy={y} rx={8} ry={6} fill="url(#n25-gold)" />
    ))}
  </g>
);

// Cartouche plaque of gilded stucco with a lime face for text.
export const Plaque = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) => {
  const r = h / 2;
  const d = `M${x + r} ${y} L${x + w - r} ${y} Q${x + w + 10} ${y + h / 2} ${x + w - r} ${y + h} L${x + r} ${y + h} Q${x - 10} ${y + h / 2} ${x + r} ${y} Z`;
  return (
    <g>
      <path d={d} fill="#efe3c4" />
      <path d={d} fill="#000" filter="url(#n25-plaster)" opacity={0.6} />
      <path d={d} fill="none" stroke="#7a5a2a" strokeWidth={22} opacity={0.25} />
      <Gilt d={d} w={12} />
      {children}
    </g>
  );
};
