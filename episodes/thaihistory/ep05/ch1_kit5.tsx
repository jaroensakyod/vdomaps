import { interpolate, useCurrentFrame } from "remotion";
import { PAL } from "../../../components/Scene";
import { clamp } from "../news/kit";
import type { G } from "../ep04/v2";

// Scene pieces for chapters 1–2 of episode 5 (house style v2).

// A royal figure seen from behind, seated (no face): robe, sash, pointed crown. Base centre (x, y).
export const BackFigure = ({ x, y, scale, robe = "#efe6d0", crown = true }: { x: number; y: number; scale: number; robe?: string; crown?: boolean }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.07);
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-44 0 Q-46 -50 -30 -70 L30 -70 Q46 -50 44 0 Z" fill={robe} stroke={PAL.ink} strokeWidth={2.2} />
      <path d="M-24 -70 L24 -70 L20 -40 L-20 -40 Z" fill={PAL.gilt} opacity={0.8} />
      <path d={`M-22 -70 Q-26 -100 -14 -112 L14 -112 Q26 -100 22 -70 Z`} fill={robe} stroke={PAL.ink} strokeWidth={2} transform={`translate(0,${b})`} />
      <ellipse cx={0} cy={-124 + b} rx={13} ry={14} fill="#2a1a12" stroke={PAL.ink} strokeWidth={2} />
      {crown && <path d={`M-12 ${-130 + b} L0 ${-172 + b} L12 ${-130 + b} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6} />}
    </g>
  );
};

// Throne dais with tiered back panel (gilt), base centre (x, y).
export const Throne = ({ x, y, s, glow = 1 }: { x: number; y: number; s: number; glow?: number }) => (
  <g>
    <circle cx={x} cy={y - 150 * s} r={110 * s} fill="#ffd890" opacity={0.25 * glow} />
    <path d={`M${x - 90 * s} ${y} L${x - 70 * s} ${y - 50 * s} L${x + 70 * s} ${y - 50 * s} L${x + 90 * s} ${y} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * s} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${x - (60 - i * 14) * s} ${y - (50 + i * 50) * s} L${x} ${y - (110 + i * 50) * s} L${x + (60 - i * 14) * s} ${y - (50 + i * 50) * s} Z`} fill={i % 2 ? "#b8862a" : "#8a2a22"} stroke={PAL.gilt} strokeWidth={2.4 * s} />
    ))}
  </g>
);

// Sun with a moon disc sliding over it (k 0..1 = totality at 1): corona appears near totality.
export const Eclipse = ({ x, y, r, k }: { x: number; y: number; r: number; k: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.4} fill="#ffe7a0" opacity={0.35 * (1 - k) + 0.25 * k} />
    {k > 0.8 && Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const len = r * (1.6 + (i % 3) * 0.3);
      return <line key={i} x1={x + Math.cos(a) * r} y1={y + Math.sin(a) * r} x2={x + Math.cos(a) * len} y2={y + Math.sin(a) * len} stroke="#f4f6ff" strokeWidth={r * 0.08} opacity={(k - 0.8) * 4} strokeLinecap="round" />;
    })}
    <circle cx={x} cy={y} r={r} fill="#fff2c0" />
    <circle cx={x + (1 - k) * r * 2.1} cy={y - (1 - k) * r * 0.4} r={r * 1.02} fill="#141a30" />
  </g>
);

// Swarm of mosquitoes drifting around (x, y).
export const Mosquitoes = ({ x, y, s, n = 14 }: { x: number; y: number; s: number; n?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const mx = x + Math.sin(frame * 0.09 + i * 1.7) * 60 * s + Math.cos(i * 3.1) * 40 * s;
        const my = y + Math.cos(frame * 0.11 + i * 2.3) * 30 * s + Math.sin(i * 1.3) * 20 * s;
        const wing = Math.sin(frame * 2 + i) * 2 * s;
        return (
          <g key={i}>
            <line x1={mx - 4 * s} y1={my} x2={mx + 4 * s} y2={my} stroke="#1a140f" strokeWidth={1.6 * s} />
            <ellipse cx={mx - 1 * s} cy={my - 3 * s + wing} rx={3 * s} ry={1.4 * s} fill="#cfd8e0" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

// Mangrove roots + trunks band along the ground.
export const Mangroves = ({ g, pan, color = "#1f2a1a" }: { g: G; pan: number; color?: string }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const x = g.x + ((i * 137 + pan * 0.6) % (g.W + 100 * g.s)) - 50 * g.s;
      const h = (90 + (i % 3) * 30) * g.s;
      return (
        <g key={i}>
          {[-1, -0.4, 0.4, 1].map((f) => <path key={f} d={`M${x} ${g.ground - h * 0.35} Q${x + f * 20 * g.s} ${g.ground - h * 0.2} ${x + f * 34 * g.s} ${g.ground}`} stroke={color} strokeWidth={3 * g.s} fill="none" />)}
          <rect x={x - 4 * g.s} y={g.ground - h} width={8 * g.s} height={h * 0.66} fill={color} />
          <ellipse cx={x} cy={g.ground - h} rx={50 * g.s} ry={26 * g.s} fill={color} />
        </g>
      );
    })}
  </g>
);

// Burmese tiered roof (pyatthat) palace, base centre (x, y).
export const Pyatthat = ({ x, y, s, w = 200 }: { x: number; y: number; s: number; w?: number }) => (
  <g>
    <rect x={x - (w / 2) * s} y={y - 60 * s} width={w * s} height={60 * s} fill="#8a2a22" stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 6 }, (_, i) => {
      const hw = (w / 2 - i * 14) * s;
      const ty = y - 60 * s - i * 22 * s;
      return <path key={i} d={`M${x - hw - 10 * s} ${ty} L${x - hw + 8 * s} ${ty - 20 * s} L${x + hw - 8 * s} ${ty - 20 * s} L${x + hw + 10 * s} ${ty} Z`} fill={i % 2 ? "#b8862a" : PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * s} />;
    })}
    <path d={`M${x - 5 * s} ${y - 192 * s} L${x} ${y - 240 * s} L${x + 5 * s} ${y - 192 * s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * s} />
  </g>
);

// Bell-shaped gilt stupa (Shwedagon-like), base centre (x, y).
export const Stupa = ({ x, y, s, h = 200 }: { x: number; y: number; s: number; h?: number }) => (
  <g>
    <circle cx={x} cy={y - h * 0.55 * s} r={h * 0.55 * s} fill="#ffd25a" opacity={0.15} />
    <rect x={x - h * 0.4 * s} y={y - h * 0.12 * s} width={h * 0.8 * s} height={h * 0.12 * s} fill="#c9a24a" stroke={PAL.ink} strokeWidth={1.6 * s} />
    <path d={`M${x - h * 0.32 * s} ${y - h * 0.12 * s} Q${x - h * 0.3 * s} ${y - h * 0.5 * s} ${x} ${y - h * 0.62 * s} Q${x + h * 0.3 * s} ${y - h * 0.5 * s} ${x + h * 0.32 * s} ${y - h * 0.12 * s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.8 * s} />
    <path d={`M${x - h * 0.06 * s} ${y - h * 0.6 * s} L${x} ${y - h * s} L${x + h * 0.06 * s} ${y - h * 0.6 * s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * s} />
  </g>
);

// Hourglass with sand running (k 0..1 = fraction run out), centre (x, y).
export const Hourglass = ({ x, y, s, k }: { x: number; y: number; s: number; k: number }) => {
  const frame = useCurrentFrame();
  const h = 90 * s;
  const w = 56 * s;
  return (
    <g>
      <rect x={x - w - 8 * s} y={y - h - 14 * s} width={(w + 8 * s) * 2} height={14 * s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * s} />
      <rect x={x - w - 8 * s} y={y + h} width={(w + 8 * s) * 2} height={14 * s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * s} />
      <path d={`M${x - w} ${y - h} L${x + w} ${y - h} L${x + 6 * s} ${y} L${x + w} ${y + h} L${x - w} ${y + h} L${x - 6 * s} ${y} Z`} fill="#dfefff" opacity={0.25} stroke="#f4f6ff" strokeWidth={2 * s} />
      <path d={`M${x - w * (1 - k) * 0.9} ${y - h * (1 - k) * 0.9} L${x + w * (1 - k) * 0.9} ${y - h * (1 - k) * 0.9} L${x} ${y} Z`} fill={PAL.gilt} />
      <path d={`M${x - w * 0.9} ${y + h} L${x + w * 0.9} ${y + h} L${x + w * 0.9 * (1 - k * 0.6)} ${y + h - h * 0.8 * k} L${x - w * 0.9 * (1 - k * 0.6)} ${y + h - h * 0.8 * k} Z`} fill={PAL.gilt} />
      {k < 1 && <line x1={x} y1={y} x2={x} y2={y + h - h * 0.8 * k} stroke={PAL.gilt} strokeWidth={2.4 * s} strokeDasharray={`${4 * s} ${3 * s}`} strokeDashoffset={-frame * 2} />}
    </g>
  );
};

// Simple lamp with glow, base (x, y).
export const Lamp = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  const f = 0.85 + 0.15 * Math.sin(frame * 0.5);
  return (
    <g>
      <circle cx={x} cy={y - 30 * s} r={70 * s * f} fill="#ffd890" opacity={0.18} />
      <rect x={x - 10 * s} y={y - 12 * s} width={20 * s} height={12 * s} fill="#8a6a2a" stroke={PAL.ink} strokeWidth={1.2 * s} />
      <path d={`M${x - 12 * s} ${y - 12 * s} Q${x} ${y - 60 * s} ${x + 12 * s} ${y - 12 * s} Z`} fill="#fff2c0" opacity={0.8} stroke={PAL.ink} strokeWidth={1.2 * s} />
      <ellipse cx={x} cy={y - 26 * s} rx={4 * s} ry={9 * s * f} fill="#ffb030" />
    </g>
  );
};

// Fade value for an on-panel flash: rises over 3 frames, fades over 14 (never a 1-frame strobe).
export const flashAt = (frame: number, f: number) => interpolate(frame - f, [0, 3, 17], [0, 1, 0], clamp);
