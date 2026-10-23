import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { Fighter, PAL, type G } from "./v2";
import { Fire } from "./v2";
import type { Costume } from "../../../components/Scene";

// Small drawing helpers shared by chapters 3 and 4 of episode 4 (riot, night assault, interregnum).

// Show children only inside [a, b).
export const Win = ({ a, b, children }: { a: number; b: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  return frame >= a && frame < b ? <>{children}</> : null;
};

// Hand torch on a pole: base at (x, y), flame on top.
export const Torch = ({ x, y, s, h = 90, seed = 0 }: { x: number; y: number; s: number; h?: number; seed?: number }) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y - h * s} stroke="#4a2f18" strokeWidth={4 * s} />
    <Fire x={x} y={y - h * s} h={34 * s} seed={seed} />
  </g>
);

// Bamboo ladder leaning on a wall: foot (x, y), top (x2, y2).
export const Ladder = ({ x, y, x2, y2, s }: { x: number; y: number; x2: number; y2: number; s: number }) => {
  const n = 7;
  const dx = 10 * s;
  return (
    <g stroke="#7a5a2a" strokeWidth={4 * s} strokeLinecap="round">
      <line x1={x - dx} y1={y} x2={x2 - dx} y2={y2} />
      <line x1={x + dx} y1={y} x2={x2 + dx} y2={y2} />
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 0.5) / n;
        const px = x + (x2 - x) * k;
        const py = y + (y2 - y) * k;
        return <line key={i} x1={px - dx} y1={py} x2={px + dx} y2={py} strokeWidth={3 * s} />;
      })}
    </g>
  );
};

// Field tent with a door flap; base-left (x, y), width w.
export const Tent = ({ x, y, w, s, color = "#d8c8a0", glow = 0 }: { x: number; y: number; w: number; s: number; color?: string; glow?: number }) => (
  <g>
    <path d={`M${x} ${y} L${x + w / 2} ${y - w * 0.62} L${x + w} ${y} Z`} fill={color} stroke={PAL.ink} strokeWidth={2 * s} />
    <path d={`M${x + w * 0.42} ${y} L${x + w / 2} ${y - w * 0.3} L${x + w * 0.58} ${y} Z`} fill={glow > 0 ? "#ffcf7a" : "#3a2a1a"} opacity={glow > 0 ? 0.6 + glow * 0.4 : 0.9} />
    <line x1={x + w / 2} y1={y - w * 0.62} x2={x + w / 2} y2={y - w * 0.74} stroke="#4a2f18" strokeWidth={3 * s} />
  </g>
);

// Falling rain streaks over the whole panel.
export const Rain = ({ g, n = 60, slant = 0.35, opacity = 0.45 }: { g: G; n?: number; slant?: number; opacity?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g stroke="#cfe0f0" strokeWidth={1.6 * g.s} opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const x0 = g.x + ((i * 53.7) % g.W);
        const y0 = g.y + ((i * 91.3 + frame * 38) % (g.H + 60 * g.s)) - 30 * g.s;
        return <line key={i} x1={x0} y1={y0} x2={x0 - 26 * slant * g.s} y2={y0 + 26 * g.s} />;
      })}
    </g>
  );
};

// Stars in a night sky (upper part of the panel).
export const Stars = ({ g, n = 26 }: { g: G; n?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={g.x + ((i * 137.5) % g.W)} cy={g.y + ((i * 59.3) % (g.H * 0.45))} r={(1 + (i % 3) * 0.6) * g.s} fill="#f4f6ff" opacity={0.4 + 0.4 * Math.abs(Math.sin(frame * 0.05 + i))} />
      ))}
    </g>
  );
};

// A galloping horse with a rider, facing right; feet on y. `rider` costume for the figure on its back.
export const Horse = ({ x, y, scale, rider, color = "#5a3a22", phase = 0 }: { x: number; y: number; scale: number; rider?: Costume; color?: string; phase?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.55 + phase;
  const bob = Math.sin(t * 2) * 3;
  const leg = (lx: number, a: number, key: string) => {
    const k = Math.sin(t + a);
    const kneeX = lx + k * 12;
    const footX = lx + k * 24 - Math.max(0, -k) * 10;
    return <path key={key} d={`M${lx} -58 L${kneeX} -30 L${footX} 0`} stroke={PAL.ink} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  };
  const legC = (lx: number, a: number, key: string) => {
    const k = Math.sin(t + a);
    const kneeX = lx + k * 12;
    const footX = lx + k * 24 - Math.max(0, -k) * 10;
    return <path key={key} d={`M${lx} -58 L${kneeX} -30 L${footX} 0`} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={46} ry={5} fill="#000" opacity={0.28} />
      <g transform={`translate(0,${bob})`}>
        {[leg(-30, 0, "a"), leg(28, 1.6, "b"), leg(-22, 3.1, "c"), leg(36, 4.7, "d")]}
        {[legC(-30, 0, "a"), legC(28, 1.6, "b"), legC(-22, 3.1, "c"), legC(36, 4.7, "d")]}
        <path d={`M-40 -70 q-24 ${4 + Math.sin(t) * 6} -30 26`} stroke="#2a1a10" strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-70} rx={46} ry={20} fill={color} stroke={PAL.ink} strokeWidth={2.4} />
        <path d="M34 -80 L54 -112 L64 -110 L52 -74 Z" fill={color} stroke={PAL.ink} strokeWidth={2.2} />
        <path d="M50 -114 L80 -102 L78 -94 L54 -100 Z" fill={color} stroke={PAL.ink} strokeWidth={2.2} />
        <path d="M44 -84 Q48 -104 56 -116" stroke="#1a1008" strokeWidth={5} fill="none" />
        <circle cx={66} cy={-106} r={1.8} fill={PAL.ink} />
        {rider && <Fighter x={-2} y={-28} scale={0.95} mode="stand" costume={rider} weapon="none" phase={phase} />}
      </g>
    </g>
  );
};

// Makruk (Thai chess) board seen at an angle; pieces slide on `move` (0–1).
export const Makruk = ({ x, y, w, s, move = 0 }: { x: number; y: number; w: number; s: number; move?: number }) => {
  const n = 8;
  const h = w * 0.34;
  const cell = (i: number, j: number) => {
    const f = (v: number) => v / n;
    const top = 0.7;
    const row = (r: number) => ({ x0: x + (w * (1 - top) * (1 - r)) / 2, wd: w * (top + (1 - top) * r), y: y - h + h * r });
    const a = row(f(j));
    const b = row(f(j + 1));
    return `M${a.x0 + a.wd * f(i)} ${a.y} L${a.x0 + a.wd * f(i + 1)} ${a.y} L${b.x0 + b.wd * f(i + 1)} ${b.y} L${b.x0 + b.wd * f(i)} ${b.y} Z`;
  };
  const piece = (i: number, j: number, dark: boolean, key: string) => {
    const top = 0.7;
    const r = (j + 0.5) / n;
    const x0 = x + (w * (1 - top) * (1 - r)) / 2;
    const wd = w * (top + (1 - top) * r);
    const px = x0 + wd * ((i + 0.5) / n);
    const py = y - h + h * r;
    return (
      <g key={key}>
        <ellipse cx={px} cy={py} rx={8 * s} ry={4 * s} fill="#000" opacity={0.3} />
        <path d={`M${px - 7 * s} ${py} L${px - 4 * s} ${py - 16 * s} L${px + 4 * s} ${py - 16 * s} L${px + 7 * s} ${py} Z`} fill={dark ? "#2a1a10" : "#efe6d0"} stroke={PAL.ink} strokeWidth={1.2 * s} />
        <circle cx={px} cy={py - 19 * s} r={5 * s} fill={dark ? "#2a1a10" : "#efe6d0"} stroke={PAL.ink} strokeWidth={1.2 * s} />
      </g>
    );
  };
  return (
    <g>
      <path d={`M${x - 10 * s} ${y + 14 * s} L${x + w + 10 * s} ${y + 14 * s} L${x + w * 0.85 + 6 * s} ${y - h - 8 * s} L${x + w * 0.15 - 6 * s} ${y - h - 8 * s} Z`} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: n * n }, (_, k) => <path key={k} d={cell(k % n, Math.floor(k / n))} fill={(k + Math.floor(k / n)) % 2 ? "#c9a46a" : "#e6cf9a"} stroke={PAL.ink} strokeWidth={0.5 * s} />)}
      {[1, 3, 4, 6].map((i) => piece(i, 2, true, `d${i}`))}
      {piece(2, 1, true, "dk")}
      {[0, 2, 5, 7].map((i) => piece(i, 5, false, `l${i}`))}
      {piece(3 + move * 1, 6 - move * 2, false, "lk")}
    </g>
  );
};

// Reeds bending with a wind that swings between left and right (`wind` −1 … 1).
export const Reeds = ({ g, y, wind, shift = 0, color = "#6b7a3a", n = 26, h = 90 }: { g: G; y: number; wind: number; shift?: number; color?: string; n?: number; h?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const rx = g.x - 30 * g.s + i * ((g.W + 60 * g.s) / n) + shift;
      const hh = (h + (i % 4) * 14) * g.s;
      const bend = wind * hh * 0.45 + Math.sin(i * 1.3) * 4 * g.s;
      return <path key={i} d={`M${rx} ${y} Q${rx + bend * 0.3} ${y - hh * 0.6} ${rx + bend} ${y - hh}`} stroke={color} strokeWidth={4 * g.s} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

// Wind streaks blowing in direction `dir` (1 right, −1 left).
export const WindStreaks = ({ g, dir, opacity = 0.5 }: { g: G; dir: number; opacity?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g stroke="#f4ecd8" strokeWidth={2 * g.s} strokeLinecap="round" opacity={opacity} fill="none">
      {Array.from({ length: 9 }, (_, i) => {
        const off = ((frame * 14 + i * 140) % (g.W + 200 * g.s)) - 100 * g.s;
        const sx = dir > 0 ? g.x + off : g.x + g.W - off;
        const sy = g.y + g.H * (0.18 + (i % 5) * 0.12);
        return <path key={i} d={`M${sx} ${sy} q${dir * 40 * g.s} ${-8 * g.s} ${dir * 80 * g.s} 0`} />;
      })}
    </g>
  );
};

// Iron bars of a cell window/door spanning (x, y)–(x+w, y−h); `open` 0–1 swings the door away.
export const Bars = ({ x, y, w, h, s, open = 0 }: { x: number; y: number; w: number; h: number; s: number; open?: number }) => (
  <g transform={`translate(${x},${y}) scale(${1 - open * 0.85},1)`}>
    <rect x={0} y={-h} width={w} height={h} fill="none" stroke="#2a2420" strokeWidth={6 * s} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={(w * (i + 0.5)) / 6} y1={-h} x2={(w * (i + 0.5)) / 6} y2={0} stroke="#3a3430" strokeWidth={5 * s} />)}
    <line x1={0} y1={-h * 0.5} x2={w} y2={-h * 0.5} stroke="#3a3430" strokeWidth={5 * s} />
  </g>
);

// Chain links between two points; `broken` 0–1 separates the middle.
export const Chain = ({ a, b, s, broken = 0 }: { a: [number, number]; b: [number, number]; s: number; broken?: number }) => {
  const n = 9;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1);
        const gap = broken * (k < 0.5 ? -1 : 1) * 26 * s;
        const sag = Math.sin(k * Math.PI) * 14 * s * (1 - broken * 0.5);
        const px = a[0] + (b[0] - a[0]) * k + gap;
        const py = a[1] + (b[1] - a[1]) * k + sag + broken * Math.abs(gap) * 0.8;
        return <ellipse key={i} cx={px} cy={py} rx={7 * s} ry={4.5 * s} fill="none" stroke="#8a8a86" strokeWidth={2.6 * s} transform={`rotate(${i % 2 ? 0 : 90},${px},${py})`} />;
      })}
    </g>
  );
};

// Golden folded robes (pha trai) on a footed tray.
export const RobeTray = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    <path d={`M${x - 26 * s} ${y} L${x - 14 * s} ${y - 14 * s} L${x + 14 * s} ${y - 14 * s} L${x + 26 * s} ${y} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * s} />
    <rect x={x - 34 * s} y={y - 20 * s} width={68 * s} height={7 * s} rx={3 * s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * s} />
    {[0, 1, 2].map((i) => <rect key={i} x={x - (26 - i * 4) * s} y={y - (34 + i * 11) * s} width={(52 - i * 8) * s} height={12 * s} rx={3 * s} fill={i % 2 ? "#e0902e" : "#d9822b"} stroke={PAL.ink} strokeWidth={1.4 * s} />)}
  </g>
);

// Birds flying across (morning).
export const Birds = ({ g, lt }: { g: G; lt: number }) => (
  <g stroke={PAL.ink} strokeWidth={2 * g.s} fill="none" strokeLinecap="round">
    {[0, 1, 2, 3].map((i) => {
      const bx = g.x + g.W * (0.15 + i * 0.07) + lt * 1.6 * g.s;
      const by = g.y + g.H * (0.2 + (i % 2) * 0.06);
      const f = Math.sin(lt * 0.5 + i) * 5 * g.s;
      return <path key={i} d={`M${bx - 9 * g.s} ${by - f} Q${bx - 4 * g.s} ${by - 4 * g.s} ${bx} ${by} Q${bx + 4 * g.s} ${by - 4 * g.s} ${bx + 9 * g.s} ${by - f}`} />;
    })}
  </g>
);
