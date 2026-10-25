import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { PAL, PaperGrain } from "../../../components/Scene";

// WW1 trench-battle pieces in house style v2: shell bursts (smoke, dirt column, fireball, shock ring), barbed wire,
// a rhomboid tank with moving tracks, biplanes, shattered trees, the dusk sky and mud, and the two-camera `View`
// that shows the same live world through several clipped windows. World units: ground line GROUND, x −400…3000.
export const GROUND = 1000; // world ground line
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const since = (list: number[], f: number) => { let d = 1e9; for (const x of list) if (x <= f) d = Math.min(d, f - x); return d; };

// Shell burst on the ground at world x; age = frames since impact (draws 0–70).
export const Explosion = ({ x, size, age }: { x: number; size: number; age: number }) => {
  if (age < 0 || age > 70) return null;
  const k = age / 70;
  const fire = interpolate(age, [0, 4, 22], [0, 1, 0], clamp);
  const ring = interpolate(age, [0, 14], [0, 1], clamp);
  return (
    <g transform={`translate(${x},${GROUND}) scale(${size})`}>
      {/* dark smoke rising */}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={`s${i}`} cx={(rnd(i + x) - 0.5) * 80 + k * 30} cy={-60 - age * (2.2 + i * 0.4)} r={30 + age * 0.9 + i * 6} fill="#3a3330" opacity={0.55 * (1 - k)} />
      ))}
      {/* dirt column */}
      {Array.from({ length: 9 }, (_, i) => {
        const vx = (rnd(i * 3 + x) - 0.5) * 9;
        const vy = -10 - rnd(i * 7 + x) * 9;
        return <circle key={`d${i}`} cx={vx * age} cy={Math.min(0, vy * age + 0.35 * age * age)} r={10 + rnd(i) * 10} fill="#5a4630" opacity={1 - k} />;
      })}
      {/* fireball */}
      {fire > 0 && (
        <g>
          <circle cx={0} cy={-40} r={70 * fire + 20} fill="#ff7a1a" opacity={0.85 * fire} />
          <circle cx={0} cy={-40} r={40 * fire + 10} fill="#ffd25a" opacity={fire} />
          <circle cx={0} cy={-40} r={18 * fire} fill="#fff6d8" opacity={fire} />
        </g>
      )}
      {/* shock ring on the ground */}
      {ring < 1 && <ellipse cx={0} cy={0} rx={40 + ring * 160} ry={8 + ring * 26} fill="none" stroke="#fff1c8" strokeWidth={6 * (1 - ring)} opacity={1 - ring} />}
    </g>
  );
};

// Barbed-wire entanglement: crossed stakes every 60 px with two looping strands, from x0 to x1.
export const Wire = ({ x0, x1 }: { x0: number; x1: number }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 60) + 1 }, (_, i) => {
      const x = x0 + i * 60;
      return <path key={i} d={`M${x - 14} ${GROUND} L${x + 14} ${GROUND - 56} M${x + 14} ${GROUND} L${x - 14} ${GROUND - 56}`} stroke="#3a2a1a" strokeWidth={5} />;
    })}
    {[0, 1].map((r) => (
      <path key={r} d={`M${x0} ${GROUND - 30 - r * 16} ` + Array.from({ length: Math.floor((x1 - x0) / 14) }, (_, i) => `q7 ${i % 2 ? -14 : 14} 14 0`).join(" ")} stroke="#6a6a6a" strokeWidth={2.4} fill="none" />
    ))}
  </g>
);

// Mark-I-style tank moving right: exhaust smoke, track links that run, turning road wheels, gun flash at gunAt.
export const Tank = ({ x, frame, gunAt }: { x: number; frame: number; gunAt: number[] }) => {
  const flash = Math.max(0, ...gunAt.map((g) => (frame >= g && frame < g + 6 ? 1 - (frame - g) / 6 : 0)));
  return (
    <g transform={`translate(${x},${GROUND + 6})`}>
      {Array.from({ length: 4 }, (_, i) => {
        const age = (frame + i * 9) % 36;
        return <circle key={i} cx={-150 - age * 2} cy={-170 - age * 3} r={14 + age * 0.8} fill="#4a4440" opacity={0.5 * (1 - age / 36)} />;
      })}
      <path d="M-180 0 L-220 -90 L-150 -150 L160 -150 L230 -90 L190 0 Z" fill="#6a6a3a" stroke={PAL.ink} strokeWidth={4} />
      <path d="M-170 -20 L-200 -88 L-148 -128 L150 -128 L206 -88 L176 -20 Z" fill="#555530" />
      {Array.from({ length: 22 }, (_, i) => {
        const p = ((i * 30 + frame * 5) % 660) / 660;
        return <rect key={i} x={-190 + p * 380} y={-16} width={10} height={14} fill="#2a2a1a" />;
      })}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-150 + i * 50} cy={-55} r={16} fill="#3a3a22" stroke={PAL.ink} strokeWidth={3} transform={`rotate(${frame * 6},${-150 + i * 50},-55)`} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={170 + i * 12} y={-118} width={10} height={40} fill={i === 1 ? "#c0302a" : "#f2efe6"} transform="rotate(-36,190,-100)" />)}
      <rect x={-30} y={-190} width={90} height={44} rx={6} fill="#6a6a3a" stroke={PAL.ink} strokeWidth={3} />
      <rect x={58} y={-176} width={90} height={14} fill="#3a3a22" stroke={PAL.ink} strokeWidth={2} />
      {flash > 0 && <g transform="translate(160,-169)"><circle r={40 * flash} fill="#ffd25a" opacity={flash} /><circle r={18 * flash} fill="#fff6d8" /></g>}
    </g>
  );
};

// Biplane (flip = flying left), spinning prop blur, cross or roundel markings, a slow bank.
export const Plane = ({ x, y, flip, frame, color, mark }: { x: number; y: number; flip: boolean; frame: number; color: string; mark: "cross" | "roundel" }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1.3 : 1.3},1.3) rotate(${Math.sin(frame * 0.08) * 5})`}>
    <path d="M-80 -6 L64 -12 L82 0 L64 12 L-80 6 Z" fill={color} stroke={PAL.ink} strokeWidth={3} />
    <rect x={-40} y={-40} width={84} height={11} rx={4} fill={color} stroke={PAL.ink} strokeWidth={3} />
    <rect x={-44} y={20} width={92} height={11} rx={4} fill={color} stroke={PAL.ink} strokeWidth={3} />
    {[-30, 30].map((sx) => <line key={sx} x1={sx} y1={-30} x2={sx} y2={20} stroke={PAL.ink} strokeWidth={3} />)}
    <path d="M-80 -6 L-104 -30 L-94 0 L-104 26 L-80 6 Z" fill={color} stroke={PAL.ink} strokeWidth={3} />
    <ellipse cx={86} cy={0} rx={4} ry={28 * Math.abs(Math.sin(frame * 1.7))} fill="#2a2a2a" opacity={0.7} />
    {mark === "roundel" ? (
      <g><circle cx={0} cy={-35} r={9} fill="#2a4fa8" /><circle cx={0} cy={-35} r={6} fill="#fff" /><circle cx={0} cy={-35} r={3} fill="#c0302a" /></g>
    ) : (
      <g><rect x={-8} y={-38} width={16} height={6} fill="#111" /><rect x={-3} y={-41} width={6} height={12} fill="#111" /></g>
    )}
    <path d="M-10 -6 Q0 -22 12 -6 Z" fill="#3a2a1a" />
  </g>
);

// Shell-shattered tree stump.
export const Tree = ({ x, h, lean }: { x: number; h: number; lean: number }) => (
  <g transform={`translate(${x},${GROUND}) rotate(${lean})`}>
    <path d={`M-12 0 L-8 ${-h} L-2 ${-h - 18} L4 ${-h + 6} L10 0 Z`} fill="#3a2a1e" stroke={PAL.ink} strokeWidth={3} />
    <path d={`M-6 ${-h * 0.6} L-40 ${-h * 0.75} L-38 ${-h * 0.7} Z`} stroke="#3a2a1e" strokeWidth={6} />
  </g>
);

// Dusk sky, low sun, drifting smoke banks, far ridge, mud ground with craters.
export const Battlefield = ({ frame }: { frame: number }) => (
  <g>
    <defs>
      <linearGradient id="ww1sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24305a" />
        <stop offset="0.55" stopColor="#7a5a7a" />
        <stop offset="1" stopColor="#f0a060" />
      </linearGradient>
      <linearGradient id="ww1mud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a6244" />
        <stop offset="1" stopColor="#3e2f1f" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-600} width={3400} height={GROUND + 600} fill="url(#ww1sky)" />
    <circle cx={1300} cy={760} r={260} fill="#ffd38a" opacity={0.3} />
    <circle cx={1300} cy={760} r={80} fill="#ffe9bc" opacity={0.9} />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={(i * 520 + frame * (0.6 + i * 0.1)) % 3000 - 300} cy={720 + (i % 3) * 60} rx={360} ry={70} fill="#5a4e58" opacity={0.35} />)}
    <path d={`M-400 ${GROUND - 60} ` + Array.from({ length: 18 }, (_, i) => `L${-400 + i * 200} ${GROUND - 70 - Math.sin(i * 1.3) * 40 - 30}`).join(" ") + ` L3000 ${GROUND} L-400 ${GROUND} Z`} fill="#5a5560" stroke={PAL.ink} strokeOpacity={0.4} strokeWidth={2} />
    <rect x={-400} y={GROUND - 12} width={3400} height={1400} fill="url(#ww1mud)" />
    {[300, 620, 980, 1260, 1540].map((cx, i) => <ellipse key={i} cx={cx} cy={GROUND + 40 + (i % 2) * 30} rx={110} ry={22} fill="#3a2a1a" opacity={0.7} />)}
  </g>
);

// Sandbag parapet: 3 staggered rows of bags from x over n bags.
export const Sandbags = ({ x, n = 14, rows = 3 }: { x: number; n?: number; rows?: number }) => (
  <g>
    <rect x={x - 30} y={GROUND - 6} width={n * 44 + 84} height={70} fill="#77603f" />
    {Array.from({ length: rows }, (_, row) => Array.from({ length: n }, (_, i) => <ellipse key={`${row}-${i}`} cx={x + i * 44 + (row % 2) * 22} cy={GROUND - 4 - row * 24} rx={26} ry={14} fill={["#b49a64", "#a68c58", "#c2a874"][(i + row) % 3]} stroke={PAL.ink} strokeWidth={2.4} />))}
  </g>
);

// A camera window onto the world: clip rect on screen (x, y, w, h), world centre (cx, cy), zoom, shake, gilt
// frame and a label tab. `children` renders the same live world for every window.
export const View = ({ x, y, w, h, cx, cy, zoom, shake, label, id, font, children }: { x: number; y: number; w: number; h: number; cx: number; cy: number; zoom: number; shake: number; label: string; id: string; font: string; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const sx = Math.sin(frame * 2.3) * shake;
  const sy = Math.cos(frame * 3.1) * shake;
  const g = { x, y, W: w, H: h, ground: y + h, cx: x + w / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <g>
      <defs><clipPath id={`clip-${id}`}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath={`url(#clip-${id})`}>
        <g transform={`translate(${x + w / 2 + sx},${y + h / 2 + sy}) scale(${zoom}) translate(${-cx},${-cy})`}>{children}</g>
        <PaperGrain g={g} id={id} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={PAL.gilt} strokeWidth={4} />
      <rect x={x + 18} y={y + 16} width={label.length * 17 + 40} height={40} rx={8} fill={PAL.gilt} />
      <text x={x + 38} y={y + 45} fontSize={26} fontWeight={900} fill="#1a140f" fontFamily={font}>{label}</text>
    </g>
  );
};
