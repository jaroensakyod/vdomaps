import { loadFont } from "@remotion/google-fonts/Kanit";
import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

// Blueprint kit for the giant-machines channel ("ยักษ์เหล็ก"): blueprint paper, a world camera in metres, dimension
// lines that draw themselves, and Bagger 293 drawn in code (bucket wheel turning, belts running, dirt flowing).
// World units are metres, y up, ground at 0. Strokes use non-scaling-stroke so lines stay crisp at every zoom.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const BP = {
  paper: "#1b4f8a",
  paperDark: "#0d2c52",
  grid: "rgba(160,210,255,0.10)",
  gridMajor: "rgba(160,210,255,0.22)",
  line: "#cfe6ff",
  ink: "#0b1d33",
  steel: "#e6edf5",
  steelShade: "#aebdcd",
  steelDark: "#6f8296",
  accent: "#f2b632",
  dirt: "#8a5a33",
  dirtLight: "#b07a48",
  yellow: "#ffd23f",
  water: "#4fc3ff",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);
const NS = { vectorEffect: "non-scaling-stroke" } as const;
const P = (x: number, y: number) => `${x},${-y}`;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- paper ----------
export const Blueprint = () => (
  <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="bp-paper" cx="50%" cy="40%" r="75%">
        <stop offset="0" stopColor={BP.paper} />
        <stop offset="1" stopColor={BP.paperDark} />
      </radialGradient>
      <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M24 0H0V24" fill="none" stroke={BP.grid} strokeWidth={1} />
      </pattern>
      <pattern id="bp-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M120 0H0V120" fill="none" stroke={BP.gridMajor} strokeWidth={1.4} />
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="url(#bp-paper)" />
    <rect width="1080" height="1920" fill="url(#bp-grid)" />
    <rect width="1080" height="1920" fill="url(#bp-grid-major)" />
    <rect x="28" y="28" width="1024" height="1864" fill="none" stroke={BP.line} strokeOpacity={0.35} strokeWidth={2} />
  </svg>
);

// ---------- camera ----------
// Keys: [frame, x, y, zoom px/m]. Holds between keys; each move eases from the previous key to the next.
export type CamKey = [number, number, number, number];
export const camAt = (keys: CamKey[], f: number) => {
  if (f <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const [f1, x1, y1, z1] = keys[i];
    const [f0, x0, y0, z0] = keys[i - 1];
    if (f <= f1) {
      const k = ease((f - f0) / Math.max(1, f1 - f0));
      // zoom moves in log space so a 5× zoom feels even; position follows 1/zoom so the picture glides toward the
      // target at an even screen speed instead of sweeping across while zoomed in
      const z = Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * k);
      const kp = Math.abs(z1 - z0) > 1e-6 ? (1 / z - 1 / z0) / (1 / z1 - 1 / z0) : k;
      return [f, x0 + (x1 - x0) * kp, y0 + (y1 - y0) * kp, z] as CamKey;
    }
  }
  return keys[keys.length - 1];
};
// Screen anchor of the camera centre (fraction of the 1080×1920 frame).
export const ANCHOR = { x: 540, y: 1920 * 0.4 };
export const World = ({ cam, children }: { cam: CamKey; children: ReactNode }) => {
  const [, x, y, z] = cam;
  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) scale(${z}) translate(${-x},${y})`}>{children}</g>
    </svg>
  );
};
// World point → screen px (for HTML labels that follow the camera).
export const toScreen = (cam: CamKey, x: number, y: number): [number, number] => [ANCHOR.x + (x - cam[1]) * cam[3], ANCHOR.y + (cam[2] - y) * cam[3]];

// ---------- ground ----------
// Ground line, hatched earth below it, and the mine face the wheel cuts into.
export const Ground = ({ from = -400, to = 400 }: { from?: number; to?: number }) => (
  <g>
    <defs>
      <pattern id="bp-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V10" stroke={BP.line} strokeOpacity={0.35} strokeWidth={0.5} />
      </pattern>
    </defs>
    <path d={`M${P(-400, 24)}L${P(-104, 24)}C${P(-96, 22)} ${P(-90, 6)} ${P(-84, 0)}L${P(to, 0)}L${P(to, -14)}L${P(from, -14)}Z`} fill={BP.dirt} fillOpacity={0.55} />
    <path d={`M${P(-400, 24)}L${P(-104, 24)}C${P(-96, 22)} ${P(-90, 6)} ${P(-84, 0)}L${P(to, 0)}L${P(to, -14)}L${P(from, -14)}Z`} fill="url(#bp-hatch)" />
    <path d={`M${P(-400, 24)}L${P(-104, 24)}C${P(-96, 22)} ${P(-90, 6)} ${P(-84, 0)}L${P(to, 0)}`} fill="none" stroke={BP.line} strokeWidth={2.5} {...NS} />
  </g>
);

// ---------- Bagger 293 ----------
// Lattice truss between a top chord and a bottom chord, n bays.
const truss = (t: [number, number, number, number], b: [number, number, number, number], n: number) => {
  let d = `M${P(t[0], t[1])}L${P(t[2], t[3])}M${P(b[0], b[1])}L${P(b[2], b[3])}`;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const tx = t[0] + (t[2] - t[0]) * k, ty = t[1] + (t[3] - t[1]) * k;
    const bx = b[0] + (b[2] - b[0]) * k, by = b[1] + (b[3] - b[1]) * k;
    d += `M${P(tx, ty)}L${P(bx, by)}`;
    if (i < n) {
      const k2 = (i + 1) / n;
      d += `M${P(tx, ty)}L${P(b[0] + (b[2] - b[0]) * k2, b[1] + (b[3] - b[1]) * k2)}`;
    }
  }
  return d;
};
// Filled band behind a truss so it reads as a solid boom from far away.
const band = (t: [number, number, number, number], b: [number, number, number, number]) => `M${P(t[0], t[1])}L${P(t[2], t[3])}L${P(b[2], b[3])}L${P(b[0], b[1])}Z`;

export const WHEEL = { x: -92, y: 13.5, r: 10.8 };
export const APEX = { x: 2, y: 96 };
export const EXTENT = { left: -102.8, right: 124 };
const BOOM_T: [number, number, number, number] = [-10, 31, -86, 22];
const BOOM_B: [number, number, number, number] = [-14, 18, -86, 13];
const CW_T: [number, number, number, number] = [12, 32, 58, 42];
const CW_B: [number, number, number, number] = [14, 24, 58, 34];
const BR_T: [number, number, number, number] = [20, 26, 112, 30];
const BR_B: [number, number, number, number] = [20, 20, 112, 24];

const Wheel = ({ frame, glow = 0, glowAt = -1 }: { frame: number; glow?: number; glowAt?: number }) => {
  const a = -frame * 1.4; // counter-clockwise: buckets climb the face
  const { x, y, r } = WHEEL;
  return (
    <g transform={`translate(${x},${-y})`}>
      <g transform={`rotate(${a})`}>
        {Array.from({ length: 20 }, (_, i) => {
          const lit = glowAt >= 0 && i < glowAt;
          return (
            <g key={i} transform={`rotate(${i * 18})`}>
              <path d={`M-1.9,${-r + 0.6}L-2.4,${-r - 2.2}L2.6,${-r - 2.6}L1.9,${-r + 0.6}Z`} fill={lit ? BP.yellow : BP.steelShade} stroke={BP.ink} strokeWidth={1.4} {...NS} />
              {[-1.6, -0.2, 1.2, 2.4].map((tx) => <path key={tx} d={`M${tx},${-r - 2.4}l0.3,-0.9`} stroke={BP.ink} strokeWidth={1.2} {...NS} />)}
            </g>
          );
        })}
        <circle r={r} fill="none" stroke={BP.ink} strokeWidth={4} {...NS} />
        <circle r={r} fill="none" stroke={BP.steel} strokeWidth={2} {...NS} />
        <circle r={r - 1.6} fill="none" stroke={BP.steelDark} strokeWidth={1.6} {...NS} />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M0,0L${Math.cos((i * 36 * Math.PI) / 180) * (r - 1.6)},${Math.sin((i * 36 * Math.PI) / 180) * (r - 1.6)}`} stroke={BP.steelShade} strokeWidth={2.2} {...NS} />
        ))}
      </g>
      <circle r={2.2} fill={BP.steelShade} stroke={BP.ink} strokeWidth={1.6} {...NS} />
      <circle r={0.8} fill={BP.ink} />
      {glow > 0 && <circle r={r + 2.8} fill="none" stroke={BP.yellow} strokeWidth={5} strokeOpacity={glow * 0.8} {...NS} />}
    </g>
  );
};

// Dirt lumps along a path: belt from (x0,y0) to (x1,y1), lumps moving at `speed` m/frame.
const Belt = ({ frame, from, to, speed, n, seed }: { frame: number; from: [number, number]; to: [number, number]; speed: number; n: number; seed: number }) => {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  return (
    <g>
      <path d={`M${P(...from)}L${P(...to)}`} stroke={BP.ink} strokeWidth={2} strokeDasharray="6 5" strokeDashoffset={-frame * 2} {...NS} />
      {Array.from({ length: n }, (_, i) => {
        const d = (((i / n) * len + frame * speed + rnd(seed + i) * 3) % len + len) % len;
        const k = d / len;
        const s = 0.7 + rnd(seed + i * 3) * 0.8;
        return <ellipse key={i} cx={from[0] + (to[0] - from[0]) * k} cy={-(from[1] + (to[1] - from[1]) * k) - s * 0.5} rx={s} ry={s * 0.6} fill={i % 3 ? BP.dirt : BP.dirtLight} />;
      })}
    </g>
  );
};

export const Bagger = ({ frame, wheelGlow = 0, buckets = -1, pile = 0 }: { frame: number; wheelGlow?: number; buckets?: number; pile?: number }) => {
  const track = (frame * 0.05) % 2;
  const stroke = { stroke: BP.ink, strokeWidth: 2, ...NS };
  const thin = { stroke: BP.ink, strokeWidth: 1.2, fill: "none", ...NS };
  // Dirt pouring off the end of the bridge onto the spoil pile.
  const drop = Array.from({ length: 14 }, (_, i) => {
    const t = ((frame * 0.9 + i * 7) % 26) / 26;
    return <ellipse key={i} cx={122 + t * 3 + rnd(i) * 1.5} cy={-(26 - t * t * (26 - 2 - pile * 18))} rx={0.9} ry={0.6} fill={i % 2 ? BP.dirt : BP.dirtLight} />;
  });
  return (
    <g>
      {/* spoil pile under the discharge chute */}
      <path d={`M${P(118 - pile * 30, 0)}Q${P(126, pile * 34)} ${P(134 + pile * 30, 0)}Z`} fill={BP.dirt} stroke={BP.ink} strokeWidth={1.6} {...NS} />
      {/* suspension cables */}
      <path d={`M${P(APEX.x, APEX.y)}L${P(-86, 23)}M${P(APEX.x - 1, APEX.y - 2)}L${P(-80, 23.5)}M${P(APEX.x, APEX.y)}L${P(58, 43)}M${P(APEX.x + 1, APEX.y - 2)}L${P(52, 41)}`} stroke={BP.ink} strokeWidth={1.4} {...NS} />
      {/* discharge bridge to the loading unit */}
      <path d={band(BR_T, BR_B)} fill={BP.steel} fillOpacity={0.5} />
      <path d={truss(BR_T, BR_B, 14)} {...thin} />
      <path d={`M${P(108, 6)}L${P(112, 30)}L${P(116, 6)}`} fill="none" {...stroke} />
      <rect x={103} y={-7} width={20} height={6} rx={2} fill={BP.steelDark} {...stroke} />
      <path d={`M${P(118, 30)}L${P(124, 30)}L${P(123, 26)}L${P(120, 26)}Z`} fill={BP.steelShade} {...stroke} />
      <Belt frame={frame} from={[21, 26.4]} to={[120, 30.4]} speed={0.5} n={34} seed={40} />
      {drop}
      {/* counterweight boom */}
      <path d={band(CW_T, CW_B)} fill={BP.steel} fillOpacity={0.55} />
      <path d={truss(CW_T, CW_B, 8)} {...thin} />
      <rect x={52} y={-48} width={16} height={18} fill={BP.steelDark} {...stroke} />
      <path d={`M${P(52, 39)}L${P(68, 39)}`} {...thin} />
      {/* bucket-wheel boom */}
      <path d={band(BOOM_T, BOOM_B)} fill={BP.steel} fillOpacity={0.6} />
      <path d={truss(BOOM_T, BOOM_B, 14)} {...thin} />
      <Belt frame={frame} from={[-84, 22.4]} to={[-12, 31.4]} speed={0.5} n={28} seed={7} />
      {/* main mast (A-frame) */}
      <path d={band([-9, 30, APEX.x - 1, APEX.y], [10, 30, APEX.x + 1, APEX.y])} fill={BP.steel} fillOpacity={0.35} />
      <path d={truss([-9, 30, APEX.x - 0.6, APEX.y - 2], [10, 30, APEX.x + 0.6, APEX.y - 2], 12)} {...thin} />
      <path d={`M${P(-9, 30)}L${P(APEX.x, APEX.y)}L${P(10, 30)}`} fill="none" stroke={BP.ink} strokeWidth={2.6} {...NS} />
      <circle cx={APEX.x} cy={-APEX.y} r={1.4} fill={BP.accent} {...stroke} />
      {/* upper structure */}
      <path d={`M${P(-18, 10)}L${P(20, 10)}L${P(22, 24)}L${P(-14, 28)}Z`} fill={BP.steel} {...stroke} />
      <path d={`M${P(-18, 13)}L${P(20, 13)}`} stroke={BP.accent} strokeWidth={5} {...NS} />
      <path d={`M${P(-6, 27)}L${P(14, 25)}L${P(15, 33)}L${P(-5, 35)}Z`} fill={BP.steelShade} {...stroke} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={-14 + i * 4.6} y={-21} width={2.6} height={3} fill={BP.paperDark} stroke={BP.ink} strokeWidth={1} {...NS} />
      ))}
      <rect x={-16} y={-10} width={32} height={3} fill={BP.steelDark} {...stroke} />
      {/* crawlers */}
      {[-24, -8, 8].map((cx, i) => (
        <g key={i}>
          <rect x={cx} y={-7} width={16} height={7} rx={3.2} fill={BP.steelDark} {...stroke} />
          <rect x={cx} y={-7} width={16} height={7} rx={3.2} fill="none" stroke={BP.ink} strokeWidth={2} strokeDasharray="3 2" strokeDashoffset={-track * 5} {...NS} />
          {[3, 8, 13].map((wx) => <circle key={wx} cx={cx + wx} cy={-3.5} r={1.8} fill={BP.steelShade} stroke={BP.ink} strokeWidth={1.2} {...NS} />)}
        </g>
      ))}
      {/* wheel last: in front of boom and mine face */}
      <Wheel frame={frame} glow={wheelGlow} glowAt={buckets} />
      {/* dirt crumbling off the face below the wheel */}
      {Array.from({ length: 10 }, (_, i) => {
        const t = ((frame * 0.8 + i * 9) % 30) / 30;
        return <ellipse key={i} cx={-101 + rnd(i + 9) * 4} cy={-(14 - t * t * 13)} rx={0.7} ry={0.5} fill={BP.dirtLight} opacity={1 - t * 0.5} />;
      })}
    </g>
  );
};

// ---------- dimension lines (draw in from `start`, label pill counts up) ----------
export const DimH = ({ frame, start, x0, x1, y }: { frame: number; start: number; x0: number; x1: number; y: number }) => {
  const k = interpolate(frame, [start, start + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (k <= 0) return null;
  const xm = (x0 + x1) / 2, h = (x1 - x0) / 2;
  return (
    <g>
      <path d={`M${P(x0, 0)}L${P(x0, y - 2)}M${P(x1, 0)}L${P(x1, y - 2)}`} stroke={BP.yellow} strokeWidth={1.4} strokeDasharray="5 4" opacity={k} {...NS} />
      <path d={`M${P(xm - h * k, y)}L${P(xm + h * k, y)}`} stroke={BP.yellow} strokeWidth={3} {...NS} />
      {k > 0.95 && <path d={`M${P(x0, y + 1.5)}L${P(x0, y - 1.5)}M${P(x1, y + 1.5)}L${P(x1, y - 1.5)}`} stroke={BP.yellow} strokeWidth={3} {...NS} />}
    </g>
  );
};
export const DimV = ({ frame, start, x, y0, y1, guide }: { frame: number; start: number; x: number; y0: number; y1: number; guide?: number }) => {
  const k = interpolate(frame, [start, start + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (k <= 0) return null;
  const top = y0 + (y1 - y0) * k;
  return (
    <g>
      {guide !== undefined && <path d={`M${P(guide, y1)}L${P(x + 1.5, y1)}`} stroke={BP.yellow} strokeWidth={1.4} strokeDasharray="5 4" opacity={k} {...NS} />}
      <path d={`M${P(x, y0)}L${P(x, top)}`} stroke={BP.yellow} strokeWidth={3} {...NS} />
      <path d={`M${P(x - 1.5, y0)}L${P(x + 1.5, y0)}`} stroke={BP.yellow} strokeWidth={3} {...NS} />
      {k > 0.95 && <path d={`M${P(x - 1.5, y1)}L${P(x + 1.5, y1)}`} stroke={BP.yellow} strokeWidth={3} {...NS} />}
    </g>
  );
};

// 30-storey tower (3.2 m a floor) rising from the ground next to the machine.
export const Tower = ({ frame, start, x, w = 24, floors = 30 }: { frame: number; start: number; x: number; w?: number; floors?: number }) => {
  const k = interpolate(frame, [start, start + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (k <= 0) return null;
  const h = floors * 3.2 * k;
  const shown = Math.floor(floors * k);
  return (
    <g>
      <rect x={x} y={-h} width={w} height={h} fill={BP.paperDark} fillOpacity={0.85} stroke={BP.line} strokeWidth={2} {...NS} />
      {Array.from({ length: shown }, (_, i) => (
        <g key={i}>
          <path d={`M${P(x, i * 3.2)}L${P(x + w, i * 3.2)}`} stroke={BP.line} strokeOpacity={0.4} strokeWidth={1} {...NS} />
          {Array.from({ length: 5 }, (_, j) => (
            <rect key={j} x={x + 1.6 + j * ((w - 2) / 5)} y={-(i * 3.2 + 2.6)} width={(w - 2) / 5 - 1.4} height={1.8} fill={rnd(i * 7 + j) > 0.55 ? BP.yellow : BP.line} fillOpacity={rnd(i * 7 + j) > 0.55 ? 0.7 : 0.25} />
          ))}
        </g>
      ))}
    </g>
  );
};

// Little Bagger silhouette for the speed race (no world camera): px per metre `z`, ground at (x, y).
export const MiniBagger = ({ frame, x, y, z }: { frame: number; x: number; y: number; z: number }) => (
  <g transform={`translate(${x},${y}) scale(${z})`}>
    <Bagger frame={frame} />
  </g>
);
