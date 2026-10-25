import { loadFont as loadCharm } from "@remotion/google-fonts/Charm";
import { loadFont as loadSrisakdi } from "@remotion/google-fonts/Srisakdi";
import type { ReactNode } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Thai gilt lacquer (ลายรดน้ำ) pieces: gold leaf on deep black lacquer. Every scene is gold line-and-fill motifs —
// architecture, figures, water, fire as kanok flames — with black lines "incised" through the gold (the resist
// lines of the technique). The gold arrives the way it does in the craft: washed down by water (`Scene` wipe with a
// wavy edge). A lacquer page with falling-flower sprigs, a sheen and wear; kanok border bands around the panel.
// Scene units: H = 1000, W = 1000 × panel aspect, ground at y = 800.
export const font = loadCharm("normal", { weights: ["700"], subsets: ["thai", "latin"] }).fontFamily;
export const display = loadSrisakdi("normal", { weights: ["700"], subsets: ["thai", "latin"] }).fontFamily;
export const L = { black: "#0c0806", lacquer: "#15100c", red: "#982517", gold: "#d6a840", pale: "#f4d98a", deep: "#8a6422", text: "#f0cf74", line: "#0c0806", ink: "#24100a" } as const;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const rnd = (i: number) => {
  const x = Math.sin(i * 51.37 + 7.1) * 43758.5453;
  return x - Math.floor(x);
};
export const SH = 1000; // scene height
export const GROUND = 800;
const INC = 2.4; // incised line width (scene units)

// Page geometry: the panel (cabinet door) and where the title / caption go.
export const useLq = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  const panel = wide ? { x: 430 * s, y: 160 * s, w: width - 540 * s, h: 680 * s } : { x: 80 * s, y: 440 * s, w: width - 160 * s, h: 1080 * s };
  const SW = Math.round((SH * panel.w) / panel.h);
  return { s, wide, width, height, panel, SW };
};

// Gold leaf gradient with a moving sheen, in user space of the svg it is used in.
const GoldGrad = ({ id, w, h, frame, light = false }: { id: string; w: number; h: number; frame: number; light?: boolean }) => {
  const p = ((frame * 0.0035) % 1.6) - 0.3;
  const st = (o: number) => Math.max(0, Math.min(1, o));
  const c = light ? ["#d9bb62", "#ecd486", "#fff4cc", "#e6cb74", "#d4b25a"] : ["#9c7428", "#d6a840", "#fbe7a6", "#d2a23c", "#a47a2a"];
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={w} y2={h * 0.7}>
      <stop offset={0} stopColor={c[0]} />
      <stop offset={st(p - 0.2)} stopColor={c[1]} />
      <stop offset={st(p)} stopColor={c[2]} />
      <stop offset={st(p + 0.2)} stopColor={c[3]} />
      <stop offset={1} stopColor={c[4]} />
    </linearGradient>
  );
};

// Defs for one svg: gold gradient `${p}gold`, leaf filter `${p}leaf` (mottled leaf + worn specks), falling flowers
// pattern `${p}flowers`, kanok frieze patterns `${p}band` (horizontal) and `${p}bandV` (vertical).
export const LqDefs = ({ p, w, h, unit = 1 }: { p: string; w: number; h: number; unit?: number }) => {
  const frame = useCurrentFrame();
  const u = unit;
  return (
    <defs>
      <GoldGrad id={`${p}gold`} w={w} h={h} frame={frame} />
      <GoldGrad id={`${p}gilt`} w={w} h={h} frame={frame} light />
      <filter id={`${p}leaf`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency={0.016 / u} numOctaves={3} seed={3} result="n" />
        <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="g" />
        <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1={0.7} k2={0.72} k3={0} k4={0} />
      </filter>
      <pattern id={`${p}flowers`} width={150 * u} height={150 * u} patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <Flower x={30 * u} y={34 * u} r={9 * u} fill={`url(#${p}gold)`} />
        <Flower x={105 * u} y={100 * u} r={6 * u} fill={`url(#${p}gold)`} />
        <circle cx={80 * u} cy={30 * u} r={2.2 * u} fill={L.gold} />
        <circle cx={40 * u} cy={118 * u} r={1.8 * u} fill={L.gold} />
        <path d={`M${120 * u} ${40 * u} q${8 * u} ${-10 * u} ${16 * u} 0 q${-8 * u} ${4 * u} ${-16 * u} 0`} fill={L.gold} />
      </pattern>
      <pattern id={`${p}inc`} width={150 * u} height={150 * u} patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <Flower x={30 * u} y={34 * u} r={9 * u} fill={L.black} />
        <Flower x={105 * u} y={100 * u} r={6 * u} fill={L.black} />
        <circle cx={80 * u} cy={30 * u} r={2.2 * u} fill={L.black} />
      </pattern>
      <pattern id={`${p}band`} width={44 * u} height={36 * u} patternUnits="userSpaceOnUse">
        <g transform={`translate(${6 * u},${18 * u}) rotate(90) scale(${30 * u})`}>
          <path d={KANOK} fill={`url(#${p}gold)`} />
        </g>
        <circle cx={38 * u} cy={18 * u} r={3 * u} fill={L.gold} />
      </pattern>
      <pattern id={`${p}bandV`} width={36 * u} height={44 * u} patternUnits="userSpaceOnUse">
        <g transform={`translate(${18 * u},${38 * u}) scale(${30 * u})`}>
          <path d={KANOK} fill={`url(#${p}gold)`} />
        </g>
        <circle cx={18 * u} cy={6 * u} r={3 * u} fill={L.gold} />
      </pattern>
    </defs>
  );
};

// ---------- motifs ----------
// Kanok flame-leaf, base at the origin, tip at (0.12, −1); scale it.
export const KANOK = "M0 0 C-0.36 -0.14 -0.42 -0.56 -0.13 -0.8 C-0.05 -0.88 0.05 -0.95 0.12 -1 C0.06 -0.86 0.17 -0.72 0.3 -0.63 C0.2 -0.56 0.3 -0.32 0.18 -0.15 C0.12 -0.07 0.06 -0.02 0 0 Z";
export const Kanok = ({ x, y, size, rot = 0, flip = false, fill = "url(#sgold)", line = true }: { x: number; y: number; size: number; rot?: number; flip?: boolean; fill?: string; line?: boolean }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -size : size},${size})`}>
    <path d={KANOK} fill={fill} />
    {line && <path d="M0.02 -0.08 C-0.2 -0.3 -0.12 -0.6 0.06 -0.82" fill="none" stroke={L.line} strokeWidth={INC / size} />}
  </g>
);
export const Flower = ({ x, y, r, fill = "url(#sgold)" }: { x: number; y: number; r: number; fill?: string }) => (
  <g transform={`translate(${x},${y})`}>
    {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={0} cy={-r * 0.9} rx={r * 0.45} ry={r * 0.8} transform={`rotate(${a + 45})`} fill={fill} />)}
    <circle r={r * 0.32} fill={L.black} />
  </g>
);
// Spiral scroll (ก้านขด) with kanok leaves along it.
export const Scroll = ({ x, y, r, flip = false, rot = 0 }: { x: number; y: number; r: number; flip?: boolean; rot?: number }) => {
  const pts = Array.from({ length: 40 }, (_, i) => {
    const t = i / 39;
    const a = t * Math.PI * 3.2;
    const rr = r * (1 - t * 0.85);
    return [Math.cos(a) * rr, Math.sin(a) * rr];
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -1 : 1},1)`}>
      <path d={"M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L")} fill="none" stroke="url(#sgold)" strokeWidth={r * 0.12} strokeLinecap="round" />
      {[0.15, 0.4, 0.62].map((t, i) => {
        const a = t * Math.PI * 3.2;
        const rr = r * (1 - t * 0.85);
        return <Kanok key={i} x={Math.cos(a) * rr} y={Math.sin(a) * rr} size={r * (0.5 - i * 0.1)} rot={(a * 180) / Math.PI + 10} line={false} />;
      })}
    </g>
  );
};
// Thai cloud (ลายเมฆ): stacked scallops with a curl.
export const Cloud = ({ x, y, w, flip = false }: { x: number; y: number; w: number; flip?: boolean }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
    <path d={`M${-w / 2} 0 a${w * 0.14} ${w * 0.14} 0 0 1 ${w * 0.22} ${-w * 0.12} a${w * 0.18} ${w * 0.18} 0 0 1 ${w * 0.34} ${-w * 0.04} a${w * 0.12} ${w * 0.12} 0 0 1 ${w * 0.26} ${w * 0.08} a${w * 0.06} ${w * 0.06} 0 0 1 ${w * 0.18} ${w * 0.08} Z`} fill="url(#sgold)" />
    <path d={`M${-w * 0.3} ${-w * 0.02} q${w * 0.1} ${-w * 0.1} ${w * 0.2} 0 M${w * 0.0} ${-w * 0.08} q${w * 0.12} ${-w * 0.1} ${w * 0.24} 0`} fill="none" stroke={L.line} strokeWidth={INC} />
    <path d={`M${w * 0.5} 0 q${w * 0.08} ${-w * 0.1} ${-w * 0.02} ${-w * 0.14} q${-w * 0.06} ${-w * 0.02} ${-w * 0.06} ${w * 0.04}`} fill="none" stroke="url(#sgold)" strokeWidth={w * 0.025} strokeLinecap="round" />
  </g>
);
// Rows of gold water curls (wave scrolls), drifting.
export const Water = ({ W, y, rows = 3, frame, gap = 90, size = 26 }: { W: number; y: number; rows?: number; frame: number; gap?: number; size?: number }) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const off = ((frame * (0.6 + r * 0.3)) % gap) - gap;
      return (
        <g key={r}>
          {Array.from({ length: Math.ceil(W / gap) + 3 }, (_, i) => {
            const x = off + i * gap + (r % 2) * gap * 0.5;
            const yy = y + r * size * 1.6;
            return <path key={i} d={`M${x - gap * 0.5} ${yy} C${x - gap * 0.2} ${yy - size} ${x + gap * 0.2} ${yy - size} ${x + gap * 0.2} ${yy - size * 0.4} C${x + gap * 0.2} ${yy - size * 0.05} ${x - gap * 0.05} ${yy - size * 0.1} ${x} ${yy - size * 0.4}`} fill="none" stroke="url(#sgold)" strokeWidth={3.2} strokeLinecap="round" />;
          })}
        </g>
      );
    })}
  </g>
);
export const Moon = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="url(#sgold)" />
    <circle cx={x} cy={y} r={r * 0.82} fill="none" stroke={L.line} strokeWidth={INC} />
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <path key={i} transform={`translate(${x + Math.cos(a) * r * 1.35},${y + Math.sin(a) * r * 1.35}) rotate(${(a * 180) / Math.PI + 90}) scale(${r * 0.28})`} d={KANOK} fill="url(#sgold)" opacity={0.85} />;
    })}
  </g>
);
export const Stars = ({ W, n, seed, top = 60, bottom = 500 }: { W: number; n: number; seed: number; top?: number; bottom?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = rnd(seed + i) * W;
      const y = top + rnd(seed + i * 3) * (bottom - top);
      const r = 4 + rnd(i + seed * 2) * 6;
      return <path key={i} d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`} fill={L.pale} />;
    })}
  </g>
);

// ---------- architecture ----------
// Khmer-style prang: a corn-cob tower with curved flanks, incised tier lines, a dark niche and a gold finial.
export const Prang = ({ x, y, h }: { x: number; y: number; h: number }) => {
  const w = h * 0.36;
  const tiers = 7;
  const half = (k: number) => w * 0.5 * Math.sin(((1 - k) * Math.PI) / 2) ** 0.7;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M${-w * 0.8} 0 L${-w * 0.8} ${-h * 0.1} L${-w * 0.62} ${-h * 0.12} L${-w * 0.62} ${-h * 0.2} L${-w * 0.5} ${-h * 0.22} L${-w * 0.5} ${-h * 0.3} C${-w * 0.56} ${-h * 0.6} ${-w * 0.3} ${-h * 0.9} 0 ${-h} C${w * 0.3} ${-h * 0.9} ${w * 0.56} ${-h * 0.6} ${w * 0.5} ${-h * 0.3} L${w * 0.5} ${-h * 0.22} L${w * 0.62} ${-h * 0.2} L${w * 0.62} ${-h * 0.12} L${w * 0.8} ${-h * 0.1} L${w * 0.8} 0 Z`} fill="url(#sgold)" />
      {Array.from({ length: tiers }, (_, i) => {
        const k = (i + 1) / (tiers + 1);
        const yy = -h * (0.3 + k * 0.66);
        const hw = half(k) * 1.04;
        return <path key={i} d={`M${-hw} ${yy} Q0 ${yy + h * 0.025} ${hw} ${yy}`} fill="none" stroke={L.line} strokeWidth={INC} />;
      })}
      {Array.from({ length: tiers }, (_, i) => {
        const k = (i + 0.5) / (tiers + 1);
        const yy = -h * (0.3 + k * 0.66);
        return <path key={`n${i}`} d={`M-5 ${yy} L0 ${yy - 10} L5 ${yy} Z`} fill={L.line} />;
      })}
      <path d={`M${-w * 0.16} ${-h * 0.12} L${-w * 0.16} ${-h * 0.22} Q0 ${-h * 0.3} ${w * 0.16} ${-h * 0.22} L${w * 0.16} ${-h * 0.12} Z`} fill={L.black} />
      <path d={`M${-w * 0.8} ${-h * 0.1} L${w * 0.8} ${-h * 0.1} M${-w * 0.62} ${-h * 0.2} L${w * 0.62} ${-h * 0.2}`} stroke={L.line} strokeWidth={INC} />
      <line x1={0} x2={0} y1={-h} y2={-h * 1.12} stroke="url(#sgold)" strokeWidth={5} />
      <circle cx={0} cy={-h * 1.04} r={5} fill="url(#sgold)" />
    </g>
  );
};
// Thai hall seen from the long side: walls with incised pillars and dark windows, two steep stacked roof tiers
// with chofa finials curling up at the ridge ends and small hang-hong flames at the eaves.
export const Hall = ({ x, y, w, glow = 0 }: { x: number; y: number; w: number; glow?: number }) => {
  const h = w * 0.62;
  const tier = (k: number, ww: number, bot: number, rise: number) => {
    const top = bot - rise;
    const tw = ww * 0.4;
    return (
      <g key={k}>
        <path d={`M${-ww / 2} ${bot} L${-tw / 2} ${top} L${tw / 2} ${top} L${ww / 2} ${bot} Z`} fill="url(#sgold)" />
        {[0.3, 0.6].map((f) => <line key={f} x1={-ww / 2 + (ww - tw) / 2 * f} x2={ww / 2 - (ww - tw) / 2 * f} y1={bot - rise * f} y2={bot - rise * f} stroke={L.line} strokeWidth={INC * 0.8} />)}
        <line x1={-ww / 2} x2={ww / 2} y1={bot} y2={bot} stroke={L.line} strokeWidth={INC * 1.4} />
        {[-1, 1].map((d) => (
          <g key={d}>
            <path d={`M${(d * tw) / 2} ${top} q${d * 4} -26 ${d * -8} -40 q${d * 2} 14 ${d * -4} 18`} fill="none" stroke="url(#sgold)" strokeWidth={5} strokeLinecap="round" />
            <path transform={`translate(${(d * ww) / 2},${bot}) scale(${d * 16},16)`} d="M0 0 C0.2 -0.2 0.5 -0.4 0.4 -1 C0.6 -0.6 0.5 -0.2 0 0 Z" fill={L.gold} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w * 0.36} y={-h * 0.42} width={w * 0.72} height={h * 0.42} fill="url(#sgold)" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-w * 0.3 + i * w * 0.12} x2={-w * 0.3 + i * w * 0.12} y1={-h * 0.4} y2={0} stroke={L.line} strokeWidth={INC} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M${-w * 0.25 + i * w * 0.2} ${-h * 0.12} L${-w * 0.25 + i * w * 0.2} ${-h * 0.26} L${-w * 0.2 + i * w * 0.2} ${-h * 0.32} L${-w * 0.15 + i * w * 0.2} ${-h * 0.26} L${-w * 0.15 + i * w * 0.2} ${-h * 0.12} Z`} fill={glow > 0 ? "#f7d070" : L.black} />)}
      {tier(0, w * 1.02, -h * 0.4, h * 0.34)}
      {tier(1, w * 0.62, -h * 0.66, h * 0.36)}
      <rect x={-w * 0.44} y={-6} width={w * 0.88} height={10} fill="url(#sgold)" />
    </g>
  );
};
// Crenellated wall (bai sema merlons) with an optional gate that can swing.
export const Wall = ({ x, y, w, h, gateAt, gateOpen = 0 }: { x: number; y: number; w: number; h: number; gateAt?: number; gateOpen?: number }) => {
  const n = Math.floor(w / 46);
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={-h} width={w} height={h} fill="url(#sgold)" />
      {Array.from({ length: n }, (_, i) => <path key={i} d={`M${i * 46 + 6} ${-h} L${i * 46 + 6} ${-h - 18} Q${i * 46 + 23} ${-h - 40} ${i * 46 + 40} ${-h - 18} L${i * 46 + 40} ${-h} Z`} fill="url(#sgold)" />)}
      {Array.from({ length: 4 }, (_, r) => <line key={r} x1={0} x2={w} y1={-h + (r + 1) * h * 0.2} y2={-h + (r + 1) * h * 0.2} stroke={L.line} strokeWidth={1.4} opacity={0.6} />)}
      {gateAt !== undefined && (
        <g transform={`translate(${w * gateAt},0)`}>
          <path d={`M-50 0 L-50 ${-h * 0.75} Q0 ${-h * 1.05} 50 ${-h * 0.75} L50 0 Z`} fill={L.black} />
          <rect x={-46} y={-h * 0.72} width={46 * (1 - gateOpen)} height={h * 0.72} fill="url(#sgold)" stroke={L.line} strokeWidth={INC} />
          <rect x={46 - 46 * (1 - gateOpen)} y={-h * 0.72} width={46 * (1 - gateOpen)} height={h * 0.72} fill="url(#sgold)" stroke={L.line} strokeWidth={INC} />
        </g>
      )}
    </g>
  );
};
// Tiered parasol (chat) on a pole.
export const Parasol = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <g transform={`translate(${x},${y})`}>
    <line x1={0} x2={0} y1={0} y2={-h} stroke="url(#sgold)" strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => {
      const yy = -h * (0.45 + i * 0.12);
      const ww = h * (0.2 - i * 0.032);
      return (
        <g key={i}>
          <path d={`M${-ww} ${yy + 14} L${-ww * 0.8} ${yy} L${ww * 0.8} ${yy} L${ww} ${yy + 14} Z`} fill="url(#sgold)" />
          {Array.from({ length: 5 }, (_, j) => <line key={j} x1={-ww + (j + 0.5) * ((ww * 2) / 5)} x2={-ww + (j + 0.5) * ((ww * 2) / 5)} y1={yy + 3} y2={yy + 14} stroke={L.line} strokeWidth={1.6} />)}
        </g>
      );
    })}
    <path d={`M0 ${-h} L-6 ${-h - 10} L0 ${-h - 30} L6 ${-h - 10} Z`} fill="url(#sgold)" />
  </g>
);

// ---------- figures (gold silhouettes with incised costume lines) ----------
export type Pose = "kneel" | "prostrate" | "stand" | "walk" | "seated" | "attack" | "run" | "row" | "write";
export const Figure = ({ x, y, s = 1, pose = "stand", flip = false, crown = false, monk = false, phase = 0, frame = 0, spear = false }: { x: number; y: number; s?: number; pose?: Pose; flip?: boolean; crown?: boolean; monk?: boolean; phase?: number; frame?: number; spear?: boolean }) => {
  const sw = Math.sin(frame * 0.18 + phase);
  const G = "url(#sgold)";
  const head = (hx: number, hy: number, tilt = 0) => (
    <g transform={`translate(${hx},${hy}) rotate(${tilt})`}>
      <circle r={13} fill={G} />
      <path d="M5 -2 q6 3 8 6" stroke={L.line} strokeWidth={1.6} fill="none" />
      {crown && <path d="M-11 -8 L0 -52 L11 -8 Z M-14 -6 L14 -6" fill={G} stroke={L.line} strokeWidth={1.4} />}
      {!crown && !monk && <path d="M-12 -6 Q0 -22 12 -6 Z" fill={G} stroke={L.line} strokeWidth={1.4} />}
    </g>
  );
  let body: ReactNode = null;
  switch (pose) {
    case "kneel":
      body = (
        <g>
          <path d="M-16 -132 Q-26 -96 -22 -64 L-46 -10 L-50 0 L36 0 L24 -16 L14 -66 Q22 -104 12 -132 Z" fill={G} />
          <path d="M8 -116 L34 -128 L42 -156 L49 -152 L42 -120 L16 -100 Z" fill={G} />
          <path d="M-20 -70 L22 -68 M-44 -8 Q-10 -30 30 -10" stroke={L.line} strokeWidth={INC} fill="none" />
          {head(0, -148)}
        </g>
      );
      break;
    case "prostrate":
      body = (
        <g>
          <path d="M-70 0 L-62 -34 Q-30 -50 10 -46 L46 -30 L84 -18 L90 0 Z" fill={G} />
          <path d="M-56 -30 Q-20 -10 40 -26 M-20 -46 L-14 0" stroke={L.line} strokeWidth={INC} fill="none" />
          {head(72, -26, 30)}
        </g>
      );
      break;
    case "seated":
      body = (
        <g>
          <path d="M-56 0 Q-56 -26 -20 -34 L-18 -110 Q0 -122 18 -110 L20 -34 Q56 -26 56 0 Z" fill={G} />
          <path d="M18 -100 L44 -80 L40 -60 L18 -70 Z" fill={G} />
          <path d="M-18 -108 L-30 -60 L-12 -44" stroke={L.line} strokeWidth={INC} fill="none" />
          <path d="M-50 -6 Q0 -24 50 -6 M-14 -90 L14 -90" stroke={L.line} strokeWidth={INC} fill="none" />
          {head(0, -126)}
        </g>
      );
      break;
    case "write":
      body = (
        <g>
          <path d="M-30 -10 L-40 0 L30 0 L22 -14 L18 -62 Q26 -100 30 -118 L6 -126 Q-14 -96 -18 -62 Z" fill={G} />
          <path d="M20 -104 L58 -70 L62 -62 L56 -60 L22 -86 Z" fill={G} />
          <path d="M-14 -66 L20 -64 M-36 -6 Q0 -26 26 -12" stroke={L.line} strokeWidth={INC} fill="none" />
          {head(22, -138, 18)}
        </g>
      );
      break;
    case "row":
      body = (
        <g>
          <path d="M-26 0 L-20 -60 Q-6 -74 10 -64 L22 0 Z" fill={G} />
          <line x1={-6 + sw * 16} y1={-56} x2={40 + sw * 30} y2={50} stroke={G} strokeWidth={5} />
          {head(4, -78)}
        </g>
      );
      break;
    default: {
      // stand / walk / run / attack
      const st = pose === "stand" ? 0 : sw * (pose === "run" || pose === "attack" ? 22 : 12);
      const lean = pose === "attack" ? 18 : pose === "run" ? 10 : 0;
      body = (
        <g transform={`rotate(${lean},0,0)`}>
          <path d={`M-16 -134 Q-24 -100 -20 -70 L${-22 - st} 0 L${-8 - st} 0 L0 -54 L${10 + st} 0 L${24 + st} 0 L18 -70 Q22 -102 14 -134 Z`} fill={G} />
          {monk ? (
            <>
              <path d="M-16 -130 L16 -74 M-18 -100 L14 -128" stroke={L.line} strokeWidth={INC} />
              <path d="M8 -100 L34 -94 L36 -88 L10 -86 Z" fill={G} />
              <path d="M24 -96 a16 12 0 0 0 32 0 Z" fill={G} stroke={L.line} strokeWidth={1.6} />
            </>
          ) : (
            <>
              <path d="M-20 -72 L18 -70 M-6 -70 L-4 -30" stroke={L.line} strokeWidth={INC} />
              <path d="M10 -122 L42 -104 L44 -96 L12 -106 Z" fill={G} />
            </>
          )}
          {(spear || pose === "attack") && <g><line x1={-40} y1={-60} x2={96} y2={-150} stroke={G} strokeWidth={5} /><path d="M96 -150 L120 -172 L104 -146 Z" fill={G} /></g>}
          {head(0, -150)}
        </g>
      );
    }
  }
  return <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>{body}</g>;
};

// Royal barge: long hull with a tall curling naga-like prow, a pavilion, oars that sweep.
export const Barge = ({ x, y, w, frame, rowers = 6, pavilion = true }: { x: number; y: number; w: number; frame: number; rowers?: number; pavilion?: boolean }) => (
  <g transform={`translate(${x},${y + Math.sin(frame * 0.08) * 4})`}>
    <path d={`M${-w / 2} -10 Q0 30 ${w / 2} -10 L${w / 2 + 30} -60 Q${w / 2 + 60} -150 ${w / 2 + 20} -190 Q${w / 2 + 50} -150 ${w / 2 + 10} -80 L${w / 2 - 20} -26 Q0 -6 ${-w / 2 + 20} -26 L${-w / 2 - 20} -70 Q${-w / 2 - 34} -110 ${-w / 2 - 10} -130 Q${-w / 2 - 18} -100 ${-w / 2 + 4} -60 Z`} fill="url(#sgold)" />
    <path d={`M${-w / 2 + 20} -14 Q0 10 ${w / 2 - 20} -14`} stroke={L.line} strokeWidth={INC} fill="none" />
    {Array.from({ length: 10 }, (_, i) => <Kanok key={i} x={-w / 2 + 40 + i * ((w - 80) / 9)} y={-2} size={14} rot={90} line={false} fill={L.black} />)}
    <path d={`M${w / 2 + 20} -190 q22 -8 30 10 q-14 -6 -22 6`} fill="url(#sgold)" />
    {pavilion && (
      <g transform="translate(0,-26)">
        <rect x={-70} y={-80} width={140} height={80} fill={L.black} />
        {[-60, -20, 20, 60].map((px) => <rect key={px} x={px - 4} y={-80} width={8} height={80} fill="url(#sgold)" />)}
        <path d="M-90 -80 L-40 -130 L40 -130 L90 -80 Z" fill="url(#sgold)" />
        <path d="M-40 -130 L0 -170 L40 -130" fill="url(#sgold)" stroke={L.line} strokeWidth={INC} />
        <line x1={0} x2={0} y1={-170} y2={-200} stroke="url(#sgold)" strokeWidth={4} />
      </g>
    )}
    {Array.from({ length: rowers }, (_, i) => {
      const rx = -w / 2 + 60 + i * ((w - 120) / Math.max(1, rowers - 1));
      if (pavilion && Math.abs(rx) < 100) return null;
      const a = Math.sin(frame * 0.2 + i * 0.4) * 18;
      return (
        <g key={i} transform={`translate(${rx},-22)`}>
          <circle cx={0} cy={-34} r={9} fill="url(#sgold)" />
          <path d="M-10 0 L-8 -24 L8 -24 L10 0 Z" fill="url(#sgold)" />
          <line x1={0} y1={-20} x2={Math.sin((a * Math.PI) / 180) * 70 - 20} y2={60} stroke="url(#sgold)" strokeWidth={4} />
        </g>
      );
    })}
  </g>
);

// Fire as kanok flames: a cluster of flame-leaves that flicker (scale/rotate), with sparks.
export const KanokFire = ({ x, y, h, frame, seed = 0 }: { x: number; y: number; h: number; frame: number; seed?: number }) => (
  <g transform={`translate(${x},${y})`}>
    {Array.from({ length: 7 }, (_, i) => {
      const k = 0.55 + rnd(seed + i) * 0.5 + Math.sin(frame * 0.35 + i * 1.7 + seed) * 0.12;
      const dx = (i - 3) * h * 0.16;
      return <Kanok key={i} x={dx} y={0} size={h * k * (i === 3 ? 1.25 : 0.9)} rot={(i - 3) * 9 + Math.sin(frame * 0.3 + i) * 6} flip={i % 2 === 0} />;
    })}
    {Array.from({ length: 5 }, (_, i) => {
      const t = ((frame * 2 + i * 23 + seed * 7) % 60) / 60;
      return <circle key={`s${i}`} cx={(rnd(i + seed) - 0.5) * h + Math.sin(t * 6) * 10} cy={-h * (0.8 + t * 1.2)} r={3 * (1 - t)} fill={L.pale} />;
    })}
  </g>
);

export const Candle = ({ x, y, s = 1, frame }: { x: number; y: number; s?: number; frame: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-8} y={-60} width={16} height={60} fill="url(#sgold)" />
    <path d="M-20 0 L20 0 L14 -8 L-14 -8 Z" fill="url(#sgold)" />
    <Kanok x={0} y={-62} size={34 + Math.sin(frame * 0.4) * 3} rot={Math.sin(frame * 0.3) * 6} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * 34} y1={-80 + Math.sin(a) * 34} x2={Math.cos(a) * 46} y2={-80 + Math.sin(a) * 46} stroke={L.pale} strokeWidth={2} opacity={0.7} />;
    })}
  </g>
);
// Folding book (samut khoi) open on a low table; lines appear as k goes 0→1.
export const Book = ({ x, y, w, k }: { x: number; y: number; w: number; k: number }) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M${-w * 0.6} 0 L${w * 0.6} 0 L${w * 0.52} 60 L${-w * 0.52} 60 Z`} fill="url(#sgold)" />
    <line x1={-w * 0.56} x2={w * 0.56} y1={14} y2={14} stroke={L.line} strokeWidth={INC} />
    {[-0.4, 0.4].map((f) => <rect key={f} x={w * f - 8} y={14} width={16} height={46} fill={L.black} />)}
    <path d={`M${-w / 2} -10 L${-w * 0.02} -18 L${-w * 0.02} -70 L${-w / 2} -62 Z M${w / 2} -10 L${w * 0.02} -18 L${w * 0.02} -70 L${w / 2} -62 Z`} fill={L.black} stroke="url(#sgold)" strokeWidth={3} />
    {Array.from({ length: 5 }, (_, i) => {
      const lk = interpolate(k, [i / 5, (i + 1) / 5], [0, 1], clamp);
      return (
        <g key={i}>
          <line x1={-w * 0.46} x2={-w * 0.46 + w * 0.4 * lk} y1={-56 + i * 9} y2={-56 + i * 9 - 2} stroke="url(#sgold)" strokeWidth={2.4} strokeDasharray="6 3" />
          <line x1={w * 0.06} x2={w * 0.06 + w * 0.4 * interpolate(k, [0.5 + i / 10, 0.6 + i / 10], [0, 1], clamp)} y1={-62 + i * 9} y2={-62 + i * 9 + 2} stroke="url(#sgold)" strokeWidth={2.4} strokeDasharray="6 3" />
        </g>
      );
    })}
  </g>
);

// ---------- page and scene ----------
// Black lacquer page: deep black with warm red undercoat showing at the worn edges, faint falling-flower sprigs,
// a broad soft sheen, scratches; outer gold rules with a kanok frieze.
export const LacquerPage = ({ children }: { children: ReactNode }) => {
  const { s, width, height } = useLq();
  const frame = useCurrentFrame();
  const sheenX = interpolate(frame, [0, 600], [-0.2, 0.3]);
  const b = 26 * s;
  return (
    <div style={{ position: "absolute", inset: 0, background: L.gold, overflow: "hidden" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <LqDefs p="p" w={width} h={height} unit={s} />
        <filter id="wear" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={21} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.03  0 0 0 0 0.02  0 0 0 2.2 -1.2" />
        </filter>
        <radialGradient id="edge" cx="50%" cy="50%" r="70%">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={1} />
        </radialGradient>
        <mask id="edgeMask"><rect width={width} height={height} fill="url(#edge)" /></mask>
        <rect width={width} height={height} fill="url(#pgilt)" />
        <g mask="url(#edgeMask)"><rect width={width} height={height} filter="url(#wear)" opacity={0.5} /></g>
        <rect width={width} height={height} fill="url(#pinc)" opacity={0.22} />
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset={Math.max(0, sheenX)} stopColor="#fff" stopOpacity={0} />
          <stop offset={Math.max(0, sheenX + 0.18)} stopColor="#fff8e0" stopOpacity={0.18} />
          <stop offset={Math.max(0, sheenX + 0.36)} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <rect width={width} height={height} fill="url(#sheen)" />
        {Array.from({ length: 14 }, (_, i) => <line key={i} x1={rnd(i) * width} y1={rnd(i + 40) * height} x2={rnd(i) * width + (rnd(i + 9) - 0.5) * 160 * s} y2={rnd(i + 40) * height + (rnd(i + 3) - 0.3) * 60 * s} stroke="#5a3a10" strokeWidth={0.8 * s} opacity={0.3} />)}
        {/* outer border: black rules with red lacquer friezes carrying gold kanok */}
        <rect x={b} y={b} width={width - b * 2} height={height - b * 2} fill="none" stroke={L.black} strokeWidth={4 * s} />
        <rect x={b + 10 * s} y={b + 10 * s} width={width - b * 2 - 20 * s} height={36 * s} fill={L.red} />
        <rect x={b + 10 * s} y={b + 10 * s} width={width - b * 2 - 20 * s} height={36 * s} fill="url(#pband)" />
        <rect x={b + 10 * s} y={height - b - 46 * s} width={width - b * 2 - 20 * s} height={36 * s} fill={L.red} />
        <rect x={b + 10 * s} y={height - b - 46 * s} width={width - b * 2 - 20 * s} height={36 * s} fill="url(#pband)" />
        <rect x={b} y={b + 56 * s} width={width - b * 2} height={height - b * 2 - 112 * s} fill="none" stroke={L.black} strokeWidth={2 * s} />
      </svg>
      {children}
    </div>
  );
};

// The panel (a cabinet door): gold double frame with kanok friezes and corner scrolls; scenes go inside.
export const PanelFrame = () => {
  const { s, panel: p, width, height } = useLq();
  const m = 34 * s;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <path fillRule="evenodd" d={`M${p.x - m} ${p.y - m} h${p.w + m * 2} v${p.h + m * 2} h${-(p.w + m * 2)} Z M${p.x} ${p.y} v${p.h} h${p.w} v${-p.h} Z`} fill={L.red} stroke={L.black} strokeWidth={4 * s} />
      <rect x={p.x - m + 6 * s} y={p.y - m + 6 * s} width={p.w + m * 2 - 12 * s} height={m - 10 * s} fill="url(#pband)" />
      <rect x={p.x - m + 6 * s} y={p.y + p.h + 4 * s} width={p.w + m * 2 - 12 * s} height={m - 10 * s} fill="url(#pband)" />
      <rect x={p.x - m + 6 * s} y={p.y} width={m - 10 * s} height={p.h} fill="url(#pbandV)" />
      <rect x={p.x + p.w + 4 * s} y={p.y} width={m - 10 * s} height={p.h} fill="url(#pbandV)" />
      <rect x={p.x - 2 * s} y={p.y - 2 * s} width={p.w + 4 * s} height={p.h + 4 * s} fill="none" stroke="url(#pgold)" strokeWidth={2.5 * s} />
    </svg>
  );
};

// One scene inside the panel. The gold is washed in from the top with a wavy wet edge over `wash` frames; the scene
// stays until `end` (the next scene washes over it). `hits` shake it. children get the local frame.
export const Scene = ({ id, start, end, hits = [], wash = 26, children }: { id: string; start: number; end: number; hits?: number[]; wash?: number; children: (lt: number, W: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { panel: p, SW, width, height, s } = useLq();
  if (frame < start || frame > end) return null;
  const lt = frame - start;
  const k = interpolate(lt, [0, wash], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) * (1 - t) });
  const edge = -120 + k * (SH + 300);
  const hit = Math.max(0, ...hits.map((h) => (frame >= h && frame < h + 8 ? 1 - (frame - h) / 8 : 0)));
  const push = 1 + lt * 0.0006;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <svg x={p.x + Math.sin(frame * 2.1) * hit * 10 * s} y={p.y + Math.cos(frame * 2.9) * hit * 10 * s} width={p.w} height={p.h} viewBox={`0 0 ${SW} ${SH}`}>
        <LqDefs p="s" w={SW} h={SH} />
        <filter id={`wet-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={id.length * 7} />
          <feDisplacementMap in="SourceGraphic" scale={110} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id={`wash-${id}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={SW + 400} height={SH + 400}>
          <rect x={-200} y={-300} width={SW + 400} height={edge + 300} fill="#fff" filter={`url(#wet-${id})`} />
        </mask>
        <g mask={`url(#wash-${id})`}>
          <rect width={SW} height={SH} fill={L.lacquer} />
          <rect width={SW} height={SH} fill="url(#sflowers)" opacity={0.42} />
          <g filter="url(#sleaf)" transform={`translate(${SW / 2},${SH / 2}) scale(${push}) translate(${-SW / 2},${-SH / 2})`}>{children(lt, SW)}</g>
        </g>
        {k < 1 && <rect x={0} y={edge - 60} width={SW} height={70} fill="#fff4cc" opacity={0.08 * (1 - k)} filter={`url(#wet-${id})`} />}
      </svg>
    </svg>
  );
};
