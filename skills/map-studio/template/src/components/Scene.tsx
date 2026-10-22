import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "./Inset";

// House illustration style (v2, set 22 Oct 2026): depth layers, light, jointed figures with motion,
// ink outlines on a paper texture, impact shake/flash. Use inside an InsetPanel child: `(g) => <Depth g={g} …>`.
// Every channel uses these pieces; only the palette and costumes change with the story.

export const PAL = {
  ink: "#1a140f",
  ochre: "#a8322a",
  indigo: "#2b3a67",
  green: "#5b6e4a",
  chalk: "#efe6d0",
  gilt: "#d9a93a",
  earth: "#6b5236",
  skin: "#b9784e",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A two-segment limb (angles in degrees from straight down), ink outline under the colour.
export const limb = (x: number, y: number, a1: number, l1: number, a2: number, l2: number, color: string, w: number) => {
  const r = Math.PI / 180;
  const jx = x + Math.sin(a1 * r) * l1;
  const jy = y + Math.cos(a1 * r) * l1;
  const ex = jx + Math.sin((a1 + a2) * r) * l2;
  const ey = jy + Math.cos((a1 + a2) * r) * l2;
  const d = `M${x} ${y} L${jx} ${jy} L${ex} ${ey}`;
  return {
    end: [ex, ey] as [number, number],
    el: (
      <g>
        <path d={d} stroke={PAL.ink} strokeWidth={w + 3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
  };
};

// Head styles cover most stories: short-cropped, head-wrap with tail, helmet, topknot, crown point.
export type Head = "short" | "wrap" | "helmet" | "topknot" | "crown" | "brodie";
export type Costume = { jacket: string; sash: string; pants: string; head: Head; headColor?: string; skin?: string };
export const COSTUME: Record<string, Costume> = {
  siam: { jacket: PAL.indigo, sash: PAL.ochre, pants: "#3a2a22", head: "short" },
  burma: { jacket: PAL.ochre, sash: PAL.gilt, pants: "#5a4a3a", head: "wrap", headColor: PAL.chalk },
  qing: { jacket: "#3a5a8a", sash: PAL.gilt, pants: "#2a2a2a", head: "helmet", headColor: "#c9302c" },
  lanna: { jacket: "#2a3a2a", sash: "#3fbf6a", pants: "#2a2420", head: "topknot" },
  europe: { jacket: "#2f4f86", sash: "#efe6d0", pants: "#efe6d0", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" },
  ww1khaki: { jacket: "#8a7a4a", sash: "#5a4a2a", pants: "#7a6a3e", head: "brodie", headColor: "#5f5a3a", skin: "#e0b08a" },
  ww1grey: { jacket: "#6d725c", sash: "#3a3a32", pants: "#5a5e4c", head: "helmet", headColor: "#4a4e44", skin: "#e0b08a" },
  ww1blue: { jacket: "#5a78a8", sash: "#2a3a5a", pants: "#4a6290", head: "brodie", headColor: "#4a6290", skin: "#e0b08a" },
};

// Jointed soldier: "walk" (leg/arm cycle + bob), "run" (faster, leaning), "attack" (thrusts), "aim" (weapon level,
// still), "stand" (breathing). weapon "rifle" is a short gun with bayonet; `flash` (0–1) draws a muzzle flash at its tip.
export const Fighter = ({ x, y, scale, flip = false, phase = 0, mode = "walk", costume = COSTUME.siam, weapon = "spear", flash = 0 }: { x: number; y: number; scale: number; flip?: boolean; phase?: number; mode?: "walk" | "run" | "attack" | "aim" | "stand"; costume?: Costume; weapon?: "spear" | "rifle" | "none"; flash?: number }) => {
  const frame = useCurrentFrame();
  const run = mode === "run";
  const t = frame * (run ? 0.45 : 0.28) + phase;
  const w = mode === "walk" || run ? (run ? 1.35 : 1) : 0;
  const bob = w ? -Math.abs(Math.sin(t)) * (run ? 6 : 3) : Math.sin(frame * 0.08 + phase) * 0.8;
  const lean = run ? 12 : 0;
  const strike = mode === "attack" ? (Math.sin(frame * 0.22 + phase) + 1) / 2 : 0;
  const { jacket, sash, pants, head, headColor = PAL.chalk, skin = PAL.skin } = costume;
  const r = Math.PI / 180;
  const aim = mode === "aim";
  const arm = limb(6, -98, mode === "attack" ? -60 - strike * 50 : aim ? -85 : run ? -70 : -25 + Math.sin(t) * 15 * w, 20, mode === "attack" ? -40 + strike * 30 : aim ? -5 : run ? -20 : -50, 18, jacket, 7);
  const [hx, hy] = arm.end;
  const ang = mode === "attack" ? 95 - strike * 15 : aim ? 92 : run ? 110 : 168;
  const len = weapon === "rifle" ? 46 : 70;
  const tip: [number, number] = [hx + Math.sin(ang * r) * (len + 14), hy + Math.cos(ang * r) * (len + 14)];
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={20} ry={4} fill="#000" opacity={0.28} />
      <g transform={`translate(0,${bob}) rotate(${lean},0,-60)`}>
        {limb(-3, -60, Math.sin(t) * 28 * w, 30, -Math.max(0, Math.cos(t)) * 40 * w, 30, pants, 9).el}
        {limb(3, -60, -Math.sin(t) * 28 * w, 30, -Math.max(0, -Math.cos(t)) * 40 * w, 30, pants, 9).el}
        {limb(-6, -98, 20 + Math.sin(t) * 20 * w, 20, -30, 18, jacket, 7).el}
        <path d="M-12 -100 Q-14 -78 -10 -58 L10 -58 Q14 -78 12 -100 Q0 -106 -12 -100 Z" fill={jacket} stroke={PAL.ink} strokeWidth={2.2} />
        <path d="M-11 -70 L11 -66 L11 -60 L-11 -64 Z" fill={sash} stroke={PAL.ink} strokeWidth={1.4} />
        <g transform="translate(0,-114)">
          <ellipse cx={0} cy={0} rx={9} ry={10.5} fill={skin} stroke={PAL.ink} strokeWidth={2} />
          {head === "short" && <path d="M-9.5 -2 Q-10 -13 0 -13 Q10 -13 9.5 -2 Q4 -6 -9.5 -2 Z" fill="#1f1712" />}
          {head === "wrap" && (
            <g>
              <path d="M-10 -3 Q-11 -14 0 -14 Q11 -14 10 -3 Z" fill={headColor} stroke={PAL.ink} strokeWidth={1.6} />
              <path d={`M8 -10 q${10 + Math.sin(frame * 0.3) * 2} -4 14 2`} stroke={PAL.ochre} strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>
          )}
          {head === "helmet" && <path d="M-11 -1 Q-11 -16 0 -16 Q11 -16 11 -1 Z M-2 -16 L0 -24 L2 -16 Z" fill={headColor} stroke={PAL.ink} strokeWidth={1.6} />}
          {head === "topknot" && <path d="M-9.5 -2 Q-10 -13 0 -13 Q10 -13 9.5 -2 Z M-4 -12 Q0 -22 4 -12 Z" fill="#1f1712" />}
          {head === "crown" && <path d="M-10 -3 L0 -30 L10 -3 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4} />}
          {head === "brodie" && <path d="M-17 -4 Q-14 -6 -9 -6 Q-8 -17 0 -17 Q8 -17 9 -6 Q14 -6 17 -4 Q0 -1 -17 -4 Z" fill={headColor} stroke={PAL.ink} strokeWidth={1.6} />}
          <circle cx={5} cy={0} r={1.4} fill={PAL.ink} />
        </g>
        {weapon !== "none" && (
          <g>
            <line x1={hx - Math.sin(ang * r) * 30} y1={hy - Math.cos(ang * r) * 30} x2={hx + Math.sin(ang * r) * len} y2={hy + Math.cos(ang * r) * len} stroke={weapon === "rifle" ? "#3a2a1a" : "#5a3a1f"} strokeWidth={weapon === "rifle" ? 5 : 3} strokeLinecap="round" />
            <path d={`M${hx + Math.sin(ang * r) * len} ${hy + Math.cos(ang * r) * len} l${Math.sin((ang - 8) * r) * 14} ${Math.cos((ang - 8) * r) * 14} l${Math.sin((ang + 8) * r) * -2} ${Math.cos((ang + 8) * r) * -2} Z`} fill="#cfd3d6" stroke={PAL.ink} strokeWidth={1.2} />
            {flash > 0 && <g transform={`translate(${tip[0]},${tip[1]})`} opacity={flash}><circle r={14 * flash} fill="#ffd25a" /><circle r={7 * flash} fill="#fff8d8" /></g>}
          </g>
        )}
        {arm.el}
      </g>
    </g>
  );
};

// Fluttering banner on a pole (y = foot of the pole).
export const Banner = ({ x, y, s, color }: { x: number; y: number; s: number; color: string }) => {
  const frame = useCurrentFrame();
  const pts = Array.from({ length: 6 }, (_, i) => [i * 12 * s, Math.sin(frame * 0.25 - i * 0.9) * 4 * s * (i / 5)]);
  const top = pts.map(([px, py]) => `${x + px},${y - 120 * s + py}`).join(" L");
  const bot = [...pts].reverse().map(([px, py]) => `${x + px},${y - 88 * s + py}`).join(" L");
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 124 * s} stroke="#4a2f18" strokeWidth={3.5 * s} />
      <path d={`M${top} L${bot} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
    </g>
  );
};

// One parallax ridge across the panel; pass `shift` from Depth's pan × layer factor.
export const Ridge = ({ g, base, amp, seed, color, shift = 0 }: { g: InsetGeom; base: number; amp: number; seed: number; color: string; shift?: number }) => {
  const n = 14;
  const pts = Array.from({ length: n + 3 }, (_, i) => {
    const px = g.x - 120 * g.s + (i * (g.W + 240 * g.s)) / n + shift;
    const py = base - (Math.sin(i * 1.7 + seed) * 0.5 + Math.sin(i * 0.6 + seed * 2) * 0.5 + 1) * amp;
    return `${px},${py}`;
  });
  return <path d={`M${g.x - 200 * g.s},${g.y + g.H} L${pts.join(" L")} L${g.x + g.W + 200 * g.s},${g.y + g.H} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.5} />;
};

// Foreground grass tufts (fastest parallax layer).
export const Grass = ({ g, shift = 0, color = "#2f3a24" }: { g: InsetGeom; shift?: number; color?: string }) => (
  <g>
    {Array.from({ length: 18 }, (_, i) => {
      const gx = g.x + i * 52 * g.s + shift;
      return <path key={i} d={`M${gx} ${g.y + g.H} q${6 * g.s} ${-30 * g.s} ${14 * g.s} ${-46 * g.s} q${-2 * g.s} ${22 * g.s} ${8 * g.s} ${46 * g.s} Z`} fill={color} />;
    })}
  </g>
);

// Sun / moon glow.
export const Glow = ({ x, y, s, color = "#ffd38a", core = "#ffe7b8" }: { x: number; y: number; s: number; color?: string; core?: string }) => (
  <g>
    <circle cx={x} cy={y} r={120 * s} fill={color} opacity={0.35} />
    <circle cx={x} cy={y} r={40 * s} fill={core} opacity={0.9} />
  </g>
);

// Paper grain + vignette (always last inside the panel).
export const PaperGrain = ({ g, id }: { g: InsetGeom; id: string }) => (
  <g>
    <defs>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.22 0" />
      </filter>
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.55" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.45} />
      </radialGradient>
    </defs>
    <rect x={g.x} y={g.y} width={g.W} height={g.H} filter={`url(#grain-${id})`} />
    <rect x={g.x} y={g.y} width={g.W} height={g.H} fill={`url(#vig-${id})`} />
  </g>
);

// The scene wrapper: slow push-in + pan for the panel's life, optional impact shake/flash, warm light, grain.
// children get `pan` (px) to offset parallax layers: far ×0.2, mid ×0.5, near ×0.7, foreground ×1.6.
export const Depth = ({ g, id, start, end, impact = 0, warm = 0.08, children }: { g: InsetGeom; id: string; start: number; end: number; impact?: number; warm?: number; children: (pan: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const push = 1 + interpolate(frame, [start, end], [0, 0.07], clamp);
  const pan = interpolate(frame, [start, end], [0, -40], clamp) * g.s;
  const shake = impact * 6 * g.s;
  return (
    <g transform={`translate(${Math.sin(frame * 2.3) * shake},${Math.cos(frame * 3.1) * shake})`}>
      <g transform={`translate(${g.cx},${g.ground}) scale(${push}) translate(${-g.cx},${-g.ground})`}>{children(pan)}</g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#ffb060" opacity={warm} />
      <PaperGrain g={g} id={id} />
      {impact > 0.7 && <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#fff" opacity={(impact - 0.7) * 1.2} />}
    </g>
  );
};

// Impact envelope for a repeating event (cannon, blow): 1 → 0 over `len` frames after each hit.
export const impactAt = (frame: number, hits: number[], len = 8) => {
  const h = hits.filter((f) => frame >= f && frame < f + len).pop();
  return h === undefined ? 0 : 1 - (frame - h) / len;
};

// Gun shot: muzzle flash, rising smoke puffs, ball on an arc, dust burst on landing. `t` = frames since the shot.
export const Shot = ({ from, to, t, s, flight = 16 }: { from: [number, number]; to: [number, number]; t: number; s: number; flight?: number }) => {
  if (t < 0 || t > 40) return null;
  const k = interpolate(t, [2, 2 + flight], [0, 1], clamp);
  const bx = from[0] + (to[0] - from[0]) * k;
  const by = from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * 70 * s;
  const hit = t >= 2 + flight && t < 10 + flight ? 1 - (t - 2 - flight) / 8 : 0;
  return (
    <g>
      {t < 5 && <circle cx={from[0] - 8 * s} cy={from[1]} r={(18 - t * 3) * s} fill="#fff2b0" opacity={0.9} />}
      {Array.from({ length: 5 }, (_, i) => {
        const age = t - i * 3;
        if (age < 0) return null;
        return <circle key={i} cx={from[0] - (10 + age * 0.8) * s} cy={from[1] - age * 1.4 * s} r={(8 + age * 0.9) * s} fill="#e9e2d6" opacity={0.55 * (1 - age / 40)} />;
      })}
      {k > 0 && k < 1 && <circle cx={bx} cy={by} r={5 * s} fill="#111" />}
      {hit > 0 && (
        <g>
          <circle cx={to[0]} cy={to[1] - 10 * s} r={(40 - hit * 20) * s} fill="#c8a070" opacity={hit * 0.7} />
          {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={to[0] + Math.cos(i) * (1 - hit) * 40 * s} cy={to[1] - 10 * s - Math.abs(Math.sin(i * 1.3)) * (1 - hit) * 40 * s} r={4 * s} fill={PAL.earth} />)}
        </g>
      )}
    </g>
  );
};
