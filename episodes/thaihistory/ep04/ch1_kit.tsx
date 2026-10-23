import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../news/kit";
import { PAL } from "./v2";

// Props for chapters 1–2 of episode 4 (style v2 ink + mural palette): cannon, junk, ship, elephant, emerald
// Buddha pavilion, fireworks, scales, sacks, granary, palanquin, chapel, parasol, chain shadows. Only ch1/ch2 use these.

export const Show = ({ from, to, children }: { from: number; to: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  return frame >= from && frame < to ? <>{children}</> : null;
};

// Bronze cannon on a wheeled carriage (faces right). Recoils for 10 frames after each frame in `fire`.
export const Cannon = ({ x, y, s, fire = [] }: { x: number; y: number; s: number; fire?: number[] }) => {
  const frame = useCurrentFrame();
  const h = fire.filter((f) => frame >= f && frame < f + 10).pop();
  const rec = h === undefined ? 0 : (1 - (frame - h) / 10) * 12;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) translate(${-rec},0)`}>
      <ellipse cx={0} cy={2} rx={40} ry={5} fill="#000" opacity={0.3} />
      <path d="M-34 -6 L22 -6 L30 -22 L-30 -32 Z" fill="#5a3a1f" stroke={PAL.ink} strokeWidth={2} />
      <g transform="rotate(-10,0,-30)">
        <rect x={-36} y={-40} width={84} height={18} rx={8} fill="#6a5a3a" stroke={PAL.ink} strokeWidth={2} />
        <rect x={44} y={-42} width={8} height={22} rx={3} fill="#5a4a2a" stroke={PAL.ink} strokeWidth={1.5} />
        <rect x={-10} y={-40} width={5} height={18} fill="#4a3a20" />
      </g>
      <circle cx={-10} cy={-10} r={14} fill="#6b4a2a" stroke={PAL.ink} strokeWidth={2} />
      {[0, 60, 120].map((a) => <line key={a} x1={-10 + Math.cos((a * Math.PI) / 180) * 12} y1={-10 + Math.sin((a * Math.PI) / 180) * 12} x2={-10 - Math.cos((a * Math.PI) / 180) * 12} y2={-10 - Math.sin((a * Math.PI) / 180) * 12} stroke={PAL.ink} strokeWidth={1.5} />)}
    </g>
  );
};
export const muzzle = (x: number, y: number, s: number): [number, number] => [x + 51 * s, y - 40 * s];

// Walking war elephant (faces right) with an optional gilt howdah and rider.
export const Elephant = ({ x, y, scale, phase = 0, walk = true, rider = "#d9a93a", flip = false, trumpet = -99 }: { x: number; y: number; scale: number; phase?: number; walk?: boolean; rider?: string | null; flip?: boolean; trumpet?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.16 + phase;
  const w = walk ? 1 : 0;
  const bob = Math.abs(Math.sin(t)) * 2 * w;
  const up = interpolate(frame, [trumpet - 8, trumpet, trumpet + 24, trumpet + 34], [0, 1, 1, 0], clamp);
  const sway = Math.sin(frame * 0.07 + phase) * 6 * (1 - up);
  const tx = 84 + sway + up * 26;
  const ty = -30 - up * 128;
  const trunk = `M74 -86 Q${88 + up * 30} ${-60 - up * 30} ${tx} ${ty} Q${tx - 2} ${ty + 12 - up * 20} ${tx - 10} ${ty + 10 - up * 16}`;
  const leg = (lx: number, k: number) => <rect x={lx - 9} y={-62} width={18} height={62} rx={7} fill="#6f665e" stroke={PAL.ink} strokeWidth={2} transform={`rotate(${Math.sin(t + k * Math.PI) * 12 * w},${lx},-62)`} />;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={62} ry={7} fill="#000" opacity={0.3} />
      {leg(-40, 1)}
      {leg(26, 0)}
      <g transform={`translate(0,${-bob})`}>
        <path d="M-58 -80 Q-66 -60 -64 -44" stroke={PAL.ink} strokeWidth={3} fill="none" />
        <ellipse cx={0} cy={-82} rx={60} ry={38} fill="#7d746c" stroke={PAL.ink} strokeWidth={2.4} />
        <circle cx={56} cy={-96} r={27} fill="#7d746c" stroke={PAL.ink} strokeWidth={2.4} />
        <path d={trunk} stroke="#7d746c" strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d={trunk} stroke={PAL.ink} strokeWidth={1.5} fill="none" />
        <path d="M70 -76 Q86 -68 92 -78" stroke="#f4ecd8" strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={40} cy={-92} rx={16} ry={24} fill="#6a6058" stroke={PAL.ink} strokeWidth={2} />
        <circle cx={64} cy={-102} r={2.2} fill={PAL.ink} />
        <path d="M-30 -112 L34 -112 L30 -96 L-26 -96 Z" fill="#a8322a" stroke={PAL.ink} strokeWidth={1.6} />
        {rider && (
          <g>
            <rect x={-26} y={-136} width={46} height={24} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.8} />
            <path d="M-32 -150 L-3 -168 L26 -150 Z" fill={PAL.ochre} stroke={PAL.ink} strokeWidth={1.6} />
            <line x1={-26} y1={-136} x2={-26} y2={-150} stroke={PAL.ink} strokeWidth={2} />
            <line x1={20} y1={-136} x2={20} y2={-150} stroke={PAL.ink} strokeWidth={2} />
            <path d="M-8 -136 Q-10 -150 -4 -158 L8 -158 Q12 -150 10 -136 Z" fill={rider} stroke={PAL.ink} strokeWidth={1.6} />
            <ellipse cx={1} cy={-164} rx={6} ry={7} fill={PAL.skin} stroke={PAL.ink} strokeWidth={1.4} />
            <path d="M-5 -168 L1 -184 L7 -168 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1} />
          </g>
        )}
      </g>
      {leg(-26, 0)}
      {leg(40, 1)}
    </g>
  );
};

// Chinese junk with battened sails (faces right); bobs on the water line y.
export const Junk = ({ x, y, s, sail = "#a8322a", cargo = 0 }: { x: number; y: number; s: number; sail?: string; cargo?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.08 + x) * 3;
  const rock = Math.sin(frame * 0.06 + x) * 1.5;
  const sailAt = (mx: number, mh: number, w: number) => (
    <g>
      <line x1={mx} y1={-20} x2={mx} y2={-mh - 10} stroke="#3a2414" strokeWidth={4} />
      <path d={`M${mx - 4} -34 L${mx - 4} ${-mh} Q${mx + w * 0.7} ${-mh + 6} ${mx + w} ${-mh + 22} L${mx + w * 0.9} -40 Z`} fill={sail} stroke={PAL.ink} strokeWidth={2} />
      {Array.from({ length: Math.floor((mh - 40) / 20) }, (_, i) => <line key={i} x1={mx - 4} y1={-mh + 18 + i * 20} x2={mx + w * 0.97} y2={-mh + 30 + i * 19} stroke={PAL.ink} strokeWidth={1.4} opacity={0.7} />)}
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob * s}) rotate(${rock}) scale(${s})`}>
      {sailAt(-40, 170, 62)}
      {sailAt(40, 140, 54)}
      <path d="M-128 -44 L-108 -40 L110 -26 Q132 -40 142 -56 L150 -50 Q130 6 80 10 L-80 10 Q-116 0 -128 -44 Z" fill="#6b3a1a" stroke={PAL.ink} strokeWidth={2.4} />
      <path d="M-110 -30 L120 -18" stroke="#c9a060" strokeWidth={3} />
      <rect x={-118} y={-70} width={44} height={32} fill="#7a4a22" stroke={PAL.ink} strokeWidth={2} />
      <circle cx={-96} cy={-12} r={6} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4} />
      {Array.from({ length: Math.round(cargo * 6) }, (_, i) => <ellipse key={i} cx={-60 + i * 22} cy={-34 - (i % 2) * 8} rx={13} ry={9} fill="#e8dcc0" stroke={PAL.ink} strokeWidth={1.4} />)}
    </g>
  );
};

// European sailing ship with square sails (faces right).
export const Ship = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07) * 3;
  const belly = Math.sin(frame * 0.05) * 3;
  const mast = (mx: number, h: number) => (
    <g>
      <line x1={mx} y1={-30} x2={mx} y2={-h} stroke="#3a2414" strokeWidth={4} />
      {[0, 1].map((i) => {
        const top = -h + 14 + i * 50;
        return <path key={i} d={`M${mx - 36} ${top} L${mx + 36} ${top} Q${mx + 42 + belly} ${top + 22} ${mx + 34} ${top + 42} L${mx - 34} ${top + 42} Q${mx - 28 + belly} ${top + 22} ${mx - 36} ${top} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.8} />;
      })}
      <path d={`M${mx} ${-h} l22 4 l-22 6 Z`} fill="#f4f6ff" stroke={PAL.ink} strokeWidth={1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob * s}) scale(${s})`}>
      {mast(-30, 170)}
      {mast(50, 150)}
      <line x1={110} y1={-34} x2={160} y2={-70} stroke="#3a2414" strokeWidth={3} />
      <path d="M-120 -50 L-96 -34 L118 -34 L130 -48 Q120 4 90 10 L-84 10 Q-110 -6 -120 -50 Z" fill="#3a2a22" stroke={PAL.ink} strokeWidth={2.4} />
      <path d="M-104 -22 L116 -22" stroke="#c9a060" strokeWidth={3} />
      {[-70, -30, 10, 50, 90].map((px) => <rect key={px} x={px} y={-18} width={9} height={8} fill="#1a140f" />)}
    </g>
  );
};

// The Emerald Buddha on a gilt pavilion (busabok), with slowly turning rays.
export const Busabok = ({ x, y, s, glow = 1 }: { x: number; y: number; s: number; glow?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g transform={`rotate(${frame * 0.4},0,-110)`} opacity={0.35 * glow}>
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M0 -110 L${Math.cos((i / 14) * Math.PI * 2) * 170 - 8} ${-110 + Math.sin((i / 14) * Math.PI * 2) * 170} L${Math.cos((i / 14) * Math.PI * 2) * 170 + 8} ${-110 + Math.sin((i / 14) * Math.PI * 2) * 170} Z`} fill="#ffe7a0" />)}
      </g>
      <circle cx={0} cy={-100} r={70} fill="#ffd25a" opacity={0.25 * glow} />
      {[0, 1, 2].map((i) => <rect key={i} x={-70 + i * 14} y={-16 - i * 14} width={140 - i * 28} height={16} fill={i % 2 ? "#b8862a" : PAL.gilt} stroke={PAL.ink} strokeWidth={1.8} />)}
      <rect x={-40} y={-160} width={7} height={118} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4} />
      <rect x={33} y={-160} width={7} height={118} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-52 + i * 10} ${-160 - i * 18} L${-30 + i * 6} ${-178 - i * 18} L${30 - i * 6} ${-178 - i * 18} L${52 - i * 10} ${-160 - i * 18} Z`} fill={i % 2 ? "#b8862a" : PAL.gilt} stroke={PAL.ink} strokeWidth={1.6} />)}
      <path d="M-8 -232 L0 -268 L8 -232 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4} />
      <ellipse cx={0} cy={-50} rx={30} ry={8} fill="#c9302c" stroke={PAL.ink} strokeWidth={1.4} />
      <path d="M-26 -52 Q-24 -70 0 -72 Q24 -70 26 -52 Z" fill="#1f8a5a" stroke={PAL.ink} strokeWidth={1.8} />
      <path d="M-13 -70 Q-15 -96 -8 -104 L8 -104 Q15 -96 13 -70 Z" fill="#2aa36a" stroke={PAL.ink} strokeWidth={1.8} />
      <ellipse cx={0} cy={-114} rx={9} ry={10.5} fill="#2aa36a" stroke={PAL.ink} strokeWidth={1.8} />
      <path d="M-4 -124 L0 -136 L4 -124 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1} />
      <circle cx={0} cy={-90} r={30} fill="#9fffd0" opacity={0.12 + 0.06 * Math.sin(frame * 0.15)} />
    </g>
  );
};

// Firework burst at frame `at` (lasts ~40 frames): rocket trail, then a ring of sparks.
export const Firework = ({ x, y, s, at, color = "#ffd25a" }: { x: number; y: number; s: number; at: number; color?: string }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -12 || t > 42) return null;
  if (t < 0) return <line x1={x} y1={y + (-t) * 14 * s} x2={x} y2={y + (-t + 2) * 14 * s} stroke="#fff2b0" strokeWidth={3 * s} opacity={0.8} />;
  const r = interpolate(t, [0, 18], [6, 74], clamp) * s;
  const o = interpolate(t, [0, 4, 42], [1, 1, 0], clamp);
  return (
    <g opacity={o}>
      {t < 5 && <circle cx={x} cy={y} r={26 * s} fill="#fff8d8" opacity={0.8} />}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const drop = t * t * 0.03 * s;
        return <line key={i} x1={x + Math.cos(a) * r * 0.55} y1={y + Math.sin(a) * r * 0.55 + drop} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r + drop} stroke={color} strokeWidth={3 * s} strokeLinecap="round" />;
      })}
    </g>
  );
};

// Hanging balance with a sack on each pan; `tilt` in degrees.
export const Balance = ({ x, y, s, tilt = 0 }: { x: number; y: number; s: number; tilt?: number }) => {
  const r = (tilt * Math.PI) / 180;
  const ends = [-60, 60].map((d) => [x + Math.cos(r) * d * s, y - 120 * s + Math.sin(r) * d * s]);
  return (
    <g>
      <rect x={x - 4 * s} y={y - 124 * s} width={8 * s} height={124 * s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.4 * s} />
      <rect x={x - 26 * s} y={y - 6 * s} width={52 * s} height={8 * s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.4 * s} />
      <line x1={ends[0][0]} y1={ends[0][1]} x2={ends[1][0]} y2={ends[1][1]} stroke="#3a2414" strokeWidth={5 * s} strokeLinecap="round" />
      {ends.map(([ex, ey], i) => (
        <g key={i}>
          <path d={`M${ex} ${ey} L${ex - 22 * s} ${ey + 46 * s} M${ex} ${ey} L${ex + 22 * s} ${ey + 46 * s}`} stroke={PAL.ink} strokeWidth={1.2 * s} />
          <path d={`M${ex - 26 * s} ${ey + 46 * s} Q${ex} ${ey + 60 * s} ${ex + 26 * s} ${ey + 46 * s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * s} />
          <ellipse cx={ex} cy={ey + 40 * s} rx={14 * s} ry={9 * s} fill={i ? "#f4f4ee" : "#e8dcc0"} stroke={PAL.ink} strokeWidth={1.2 * s} />
        </g>
      ))}
    </g>
  );
};

// Tied sack (rice/salt), base centre (x, y).
export const Sack = ({ x, y, s, color = "#e8dcc0" }: { x: number; y: number; s: number; color?: string }) => (
  <g>
    <path d={`M${x - 20 * s} ${y} Q${x - 26 * s} ${y - 30 * s} ${x - 10 * s} ${y - 44 * s} L${x + 10 * s} ${y - 44 * s} Q${x + 26 * s} ${y - 30 * s} ${x + 20 * s} ${y} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
    <path d={`M${x - 10 * s} ${y - 44 * s} l${4 * s} ${-8 * s} l${12 * s} 0 l${4 * s} ${8 * s}`} fill={color} stroke={PAL.ink} strokeWidth={1.4 * s} />
    <line x1={x - 11 * s} y1={y - 42 * s} x2={x + 11 * s} y2={y - 42 * s} stroke="#7a4a22" strokeWidth={3 * s} />
  </g>
);

// Stilted rice barn with its door open on an empty inside.
export const Granary = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    {[0.08, 0.5, 0.92].map((f) => <rect key={f} x={x + w * f - 4 * s} y={y - w * 0.28} width={8 * s} height={w * 0.28} fill="#4a2f18" stroke={PAL.ink} strokeWidth={1 * s} />)}
    <path d={`M${x} ${y - w * 0.28} L${x + w} ${y - w * 0.28} L${x + w * 0.96} ${y - w * 0.8} L${x + w * 0.04} ${y - w * 0.8} Z`} fill="#8a5a32" stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x + w * 0.04} y1={y - w * (0.36 + i * 0.075)} x2={x + w * 0.96} y2={y - w * (0.36 + i * 0.075)} stroke="#5a3a1f" strokeWidth={1.2 * s} />)}
    <path d={`M${x - w * 0.1} ${y - w * 0.78} L${x + w / 2} ${y - w * 1.16} L${x + w * 1.1} ${y - w * 0.78} Z`} fill="#c9a060" stroke={PAL.ink} strokeWidth={2 * s} />
    <rect x={x + w * 0.36} y={y - w * 0.7} width={w * 0.28} height={w * 0.38} fill="#120c08" stroke={PAL.ink} strokeWidth={1.6 * s} />
    <path d={`M${x + w * 0.64} ${y - w * 0.7} l${w * 0.12} ${-w * 0.03} l0 ${w * 0.38} l${-w * 0.12} ${w * 0.03} Z`} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.4 * s} />
  </g>
);

// Tiered royal parasol (chat) on a pole; foot at (x, y), height h px (unscaled).
export const Parasol = ({ x, y, s, h = 170 }: { x: number; y: number; s: number; h?: number }) => {
  const top = y - h * s;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={top - 10 * s} stroke={PAL.gilt} strokeWidth={4 * s} />
      {Array.from({ length: 5 }, (_, i) => {
        const w = (44 - i * 7) * s;
        const ty = top + 40 * s - i * 14 * s;
        return <path key={i} d={`M${x - w} ${ty} Q${x} ${ty - 12 * s} ${x + w} ${ty} L${x + w} ${ty + 6 * s} L${x - w} ${ty + 6 * s} Z`} fill={i % 2 ? PAL.gilt : "#f4ecd8"} stroke={PAL.ink} strokeWidth={1.4 * s} />;
      })}
      <path d={`M${x - 3 * s} ${top - 30 * s} L${x} ${top - 50 * s} L${x + 3 * s} ${top - 30 * s} Z`} fill={PAL.gilt} />
    </g>
  );
};

// Small mission chapel (gable, bell turret, cross); base-left (x, y).
export const Chapel = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    <rect x={x} y={y - w * 0.5} width={w} height={w * 0.5} fill="#efe6d0" stroke={PAL.ink} strokeWidth={2 * s} />
    <path d={`M${x - w * 0.06} ${y - w * 0.5} L${x + w / 2} ${y - w * 0.86} L${x + w * 1.06} ${y - w * 0.5} Z`} fill="#8a3a2a" stroke={PAL.ink} strokeWidth={2 * s} />
    <rect x={x + w * 0.42} y={y - w * 0.3} width={w * 0.16} height={w * 0.3} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.4 * s} />
    <circle cx={x + w / 2} cy={y - w * 0.62} r={w * 0.06} fill="#3a2a22" />
    <rect x={x + w * 0.44} y={y - w * 1.06} width={w * 0.12} height={w * 0.2} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4 * s} />
    <path d={`M${x + w / 2} ${y - w * 1.06} l0 ${-w * 0.2} M${x + w / 2 - w * 0.06} ${y - w * 1.19} l${w * 0.12} 0`} stroke={PAL.ink} strokeWidth={3 * s} />
  </g>
);

// Long chain shadows lying across the ground (no chains drawn on figures).
export const ChainShadow = ({ x, y, len, s, angle = -8 }: { x: number; y: number; len: number; s: number; angle?: number }) => (
  <g transform={`rotate(${angle},${x},${y})`} opacity={0.45}>
    {Array.from({ length: Math.floor(len / (22 * s)) }, (_, i) => <ellipse key={i} cx={x + i * 22 * s} cy={y} rx={13 * s} ry={(i % 2 ? 3 : 7) * s} fill="none" stroke="#120c08" strokeWidth={4 * s} />)}
  </g>
);

// A sky band whose colours move from one gradient to another over k (0–1).
const mix = (a: string, b: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};
export const SkyShift = ({ id, x, y, w, h, from, to, k }: { id: string; x: number; y: number; w: number; h: number; from: [string, string]; to: [string, string]; k: number }) => (
  <g>
    <defs>
      <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mix(from[0], to[0], k)} />
        <stop offset="1" stopColor={mix(from[1], to[1], k)} />
      </linearGradient>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#sky-${id})`} />
  </g>
);

// A drifting cloud.
export const Cloud = ({ x, y, s, color = "#efe6d0", o = 0.8 }: { x: number; y: number; s: number; color?: string; o?: number }) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y} rx={60 * s} ry={16 * s} fill={color} />
    <ellipse cx={x - 24 * s} cy={y - 10 * s} rx={30 * s} ry={16 * s} fill={color} />
    <ellipse cx={x + 18 * s} cy={y - 14 * s} rx={34 * s} ry={18 * s} fill={color} />
  </g>
);
