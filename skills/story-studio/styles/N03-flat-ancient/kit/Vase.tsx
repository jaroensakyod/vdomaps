import { loadFont } from "@remotion/google-fonts/NotoSerifThai";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// N03 vase: the screen is the belly of a black-glazed pot. Figures are reserved in the orange clay with fine black
// relief lines; the picture band wraps round the pot between two key-pattern borders, so everything on it lives at
// an arc position `u` (px along the circumference). Turning the pot (`rot`) is the camera: shapes near the edges
// squeeze, sag with the curve and fall into shadow. One pot holds the whole story — scenes sit side by side
// around it and the pot turns from one to the next.
export const font = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  glaze: "#120b07",
  glaze2: "#1d120b",
  clay: "#dc7438",
  clayLight: "#ea9a5e",
  dilute: "#8a4320",
  line: "#140a05",
  white: "#efe3cc",
  text: "#f0d2a8",
};

export type Vz = { W: number; H: number; cx: number; R: number; rot: number; e: number; top: number; bot: number; v: boolean; s: number };
export const useVase = (rot: number): Vz => {
  const { width: W, height: H } = useVideoConfig();
  const v = H > W;
  const top = v ? H * 0.47 : H * 0.31;
  const bot = v ? H * 0.89 : H * 0.76;
  return { W, H, cx: W / 2, R: v ? W * 0.68 : W * 0.6, rot, e: v ? 46 : 40, top, bot, v, s: (bot - top) / 800 };
};
const proj = (z: Vz, u: number) => {
  const th = (u - z.rot) / z.R;
  return { th, x: z.cx + z.R * Math.sin(th), c: Math.cos(th) };
};

// Place something drawn in local units (feet at 0) at arc position u, height y (screen px of the band line).
export const On = ({ z, u, y, s = 1, flip = false, children }: { z: Vz; u: number; y: number; s?: number; flip?: boolean; children: ReactNode }) => {
  const p = proj(z, u);
  if (p.c < 0.06 || Math.abs(p.th) > Math.PI / 2) return null;
  const k = z.s * s;
  return <g transform={`translate(${p.x},${y + z.e * p.c}) scale(${p.c * k * (flip ? -1 : 1)},${k})`}>{children}</g>;
};

// A key (meander) border wrapping round the pot at height y; h = band height in px.
export const Meander = ({ z, y, h }: { z: Vz; y: number; h: number }) => {
  const unit = h * 1.15;
  const first = Math.floor((z.rot - z.R * 1.6) / unit);
  const n = Math.ceil((z.R * 3.2) / unit);
  const q = h / 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = (first + i) * unit;
        const p = proj(z, u + unit / 2);
        if (p.c < 0.04 || Math.abs(p.th) > Math.PI / 2) return null;
        // one key unit: clay ground with a black hooked line, 10 × 11.5 grid
        return (
          <g key={first + i} transform={`translate(${p.x},${y + z.e * p.c}) scale(${p.c},1) translate(${-unit / 2},0)`}>
            <rect x={-0.5} y={0} width={unit + 1} height={h} fill={C.clay} />
            <path d={`M0 ${9 * q} H${10 * q} V${1 * q} H${2.5 * q} V${6.5 * q} H${7.5 * q} V${3.5 * q} H${5 * q}`} stroke={C.line} strokeWidth={q * 1.15} fill="none" strokeLinecap="square" />
          </g>
        );
      })}
    </g>
  );
};

// Tongues / rays: a row of black-glazed tongues on clay (top) or rays pointing down (foot).
export const Tongues = ({ z, y, h, rays = false }: { z: Vz; y: number; h: number; rays?: boolean }) => {
  const unit = h * (rays ? 0.7 : 0.55);
  const first = Math.floor((z.rot - z.R * 1.6) / unit);
  const n = Math.ceil((z.R * 3.2) / unit);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = (first + i) * unit;
        const p = proj(z, u + unit / 2);
        if (p.c < 0.04 || Math.abs(p.th) > Math.PI / 2) return null;
        return (
          <g key={first + i} transform={`translate(${p.x},${y + z.e * p.c}) scale(${p.c},1) translate(${-unit / 2},0)`}>
            <rect x={-0.5} y={0} width={unit + 1} height={h} fill={C.clay} />
            {rays ? (
              <path d={`M${unit * 0.2} 0 L${unit * 0.5} ${h * 0.96} L${unit * 0.8} 0 Z`} fill={C.line} />
            ) : (
              <path d={`M${unit * 0.24} 0 L${unit * 0.24} ${h * 0.55} Q${unit * 0.5} ${h * 0.95} ${unit * 0.76} ${h * 0.55} L${unit * 0.76} 0 Z`} fill={C.line} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// The pot: black glaze with a soft vertical sheen and a dark turn at both edges. `children` = the picture band.
export const Pot = ({ z, children }: { z: Vz; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { W, H, v } = z;
  const mh = v ? 72 : 44;
  const neck = z.top - mh - (v ? 152 : 76);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="n03-turn" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.55} />
          <stop offset="0.16" stopColor="#000" stopOpacity={0.25} />
          <stop offset="0.36" stopColor="#000" stopOpacity={0} />
          <stop offset="0.7" stopColor="#000" stopOpacity={0.12} />
          <stop offset="0.9" stopColor="#000" stopOpacity={0.35} />
          <stop offset="1" stopColor="#000" stopOpacity={0.75} />
        </linearGradient>
        <linearGradient id="n03-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.2" stopColor="#fff2dc" stopOpacity={0} />
          <stop offset="0.27" stopColor="#fff2dc" stopOpacity={0.06} />
          <stop offset="0.33" stopColor="#fff8ec" stopOpacity={0.13} />
          <stop offset="0.4" stopColor="#fff2dc" stopOpacity={0.05} />
          <stop offset="0.5" stopColor="#fff2dc" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="n03-body" cx="0.4" cy="0.45" r="0.8">
          <stop offset="0" stopColor={C.glaze2} />
          <stop offset="1" stopColor="#050302" />
        </radialGradient>
        <filter id="n03-glaze" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={5} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.6  0 0 0 0.05 0" />
        </filter>
        <filter id="n03-fire" x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={3} seed={11} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.08  0 0 0 0 0  0 0 0 0.9 -0.35" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#n03-body)" />
      {/* the neck of the pot, left in bare clay: the titles are painted on it in black glaze */}
      <rect width={W} height={z.top - mh - (v ? 152 : 76)} fill={C.clay} />
      <rect y={z.top - mh - (v ? 152 : 76) - 14} width={W} height={5} fill={C.line} />
      <Tongues z={z} y={z.top - mh - (v ? 140 : 66)} h={v ? 130 : 62} />
      <Meander z={z} y={z.top - mh} h={mh} />
      <g>{children}</g>
      <Meander z={z} y={z.bot} h={mh} />
      <Tongues z={z} y={z.bot + mh + (v ? 16 : 12)} h={v ? 160 : 64} rays />
      {/* the foot of the pot, bare clay again: the spoken line is painted on it */}
      {!v && <rect y={z.bot + mh + 12 + 64 + z.e + 8} width={W} height={H} fill={C.clay} />}
      {!v && <rect y={z.bot + mh + 12 + 64 + z.e + 8} width={W} height={5} fill={C.line} />}
      {/* firing marks: the clay and glaze are never perfectly even */}
      <rect y={neck} width={W} height={H} filter="url(#n03-fire)" opacity={0.5} />
      <rect width={W} height={H} filter="url(#n03-glaze)" />
      <rect y={neck} width={W} height={H} fill="url(#n03-turn)" />
      <rect width={W} height={neck} fill="url(#n03-turn)" opacity={0.12} />
      <rect width={W} height={H} fill="url(#n03-sheen)" opacity={0.9 + Math.sin(frame / 40) * 0.1} />
    </svg>
  );
};

// ---- type: classical serif in clay colours, set straight on the glaze ----
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string };
export const Titles = ({ z, heads }: { z: Vz; heads: Head[] }) => {
  const frame = useCurrentFrame();
  const cur = [...heads].reverse().find((h) => frame >= h.f) ?? heads[0];
  const k = interpolate(frame, [cur.f, cur.f + 18], [0, 1], clamp);
  const s = z.v ? 1 : z.H / 1080;
  return (
    <AbsoluteFill style={{ fontFamily: font, color: C.line, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: z.v ? 80 : 22 * s, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 28 * s, fontWeight: 600, letterSpacing: 6, color: "#4a200c" }}>N03 · ภาพเขียนแดงบนไห</div>
        <div style={{ opacity: k, transform: `translateY(${(1 - k) * 12}px)` }}>
          <div style={{ fontSize: 30 * s, fontWeight: 400, color: "#4a200c", marginTop: (z.v ? 10 : 2) * s }}>{cur.tag}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26 * s, flexWrap: "wrap" }}>
            <span style={{ fontSize: (z.v ? 76 : 56) * s, fontWeight: 800, lineHeight: 1.3 }}>{cur.head}</span>
            {!z.v && cur.stat && <Stat cur={cur} s={s} v={z.v} />}
          </div>
          {z.v && cur.stat && <Stat cur={cur} s={s} v={z.v} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Stat = ({ cur, s, v }: { cur: Head; s: number; v: boolean }) => (
  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 14 * s }}>
    <span style={{ fontSize: (v ? 96 : 72) * s, fontWeight: 800, color: "#5a1e0c", letterSpacing: 3 }}>{cur.stat}</span>
    <span style={{ fontSize: 34 * s, fontWeight: 600 }}>{cur.label}</span>
  </span>
);

export const Line = ({ z, text, start, end }: { z: Vz; text: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  const s = z.v ? 1 : z.H / 1080;
  const k = interpolate(frame, [start, start + 10, end - 8, end], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: z.v ? 470 : 998 * s, textAlign: "center", opacity: k, fontFamily: font, fontWeight: 700, fontSize: (z.v ? 56 : 42) * s, color: C.line, lineHeight: 1.4, padding: "0 60px" }}>
      {text}
    </div>
  );
};

// The honest label, written along the lower border like a painted inscription.
export const Label = ({ z }: { z: Vz }) => {
  const s = z.v ? 1 : z.H / 1080;
  return (
    <div style={{ position: "absolute", left: z.v ? 0 : 40 * s, right: z.v ? 0 : undefined, top: 30 * s, textAlign: z.v ? "center" : "left", fontFamily: font, fontSize: 24 * s, letterSpacing: 8, color: "#4a200c", opacity: 0.85 }}>
      ภาพประกอบ · ไม่ใช่ภาพจากภาชนะจริง
    </div>
  );
};
