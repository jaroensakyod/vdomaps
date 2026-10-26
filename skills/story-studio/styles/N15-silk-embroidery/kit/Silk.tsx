import type { ReactNode } from "react";

// N15 silk embroidery kit: scenes stitched on plum silk stretched in a wooden embroidery hoop, lying on grey linen.
// Fills are satin stitch (parallel floss with a sheen that runs across the thread), outlines are couched gold
// thread (a gold cord tied down with tiny stitches), water is running stitch in silver. Every shape "sews in":
// the stitches advance across it, with the needle and its thread at the leading edge.

export const C = {
  linen: "#c9b58f", // unbleached flax linen
  silk: "#3d1a3a", // plum silk ground
  gold: "#d8b25a", // gold thread
  jade: "#5f9e7e", // jade floss
  peony: "#e58aa0", // peony floss
  ivory: "#f4ead2", // ivory floss / text
  sapphire: "#5a78b8",
  wood: "#d2a56c",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SilkDefs = () => (
  <defs>
    <pattern id="n15-linen" width="5" height="5" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill={C.linen} />
      <rect width="5" height="1.6" fill="#d6c39d" />
      <rect width="1.6" height="5" fill="#b39f7a" opacity="0.6" />
    </pattern>
    <pattern id="n15-silkweave" width="3" height="3" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="none" />
      <rect width="3" height="1" fill="#ffffff" opacity="0.05" />
    </pattern>
    <radialGradient id="n15-sheen" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#7a3a6e" />
      <stop offset="0.45" stopColor={C.silk} />
      <stop offset="1" stopColor="#1f0a1e" />
    </radialGradient>
    <linearGradient id="n15-silklight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.42" stopColor="#ffd9f0" stopOpacity="0.12" />
      <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.2" />
      <stop offset="0.58" stopColor="#ffd9f0" stopOpacity="0.1" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="n15-goldcord" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff1b8" />
      <stop offset="0.5" stopColor={C.gold} />
      <stop offset="1" stopColor="#8a6424" />
    </linearGradient>
    <linearGradient id="n15-wood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ecc78f" />
      <stop offset="0.5" stopColor={C.wood} />
      <stop offset="1" stopColor="#9a6c3a" />
    </linearGradient>
    <linearGradient id="n15-brass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#7a5a20" />
      <stop offset="0.5" stopColor="#f7df9a" />
      <stop offset="1" stopColor="#7a5a20" />
    </linearGradient>
    <filter id="n15-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
    <filter id="n15-tiny" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" />
    </filter>
    <filter id="n15-raise" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="1.6" floodColor="#12030f" floodOpacity="0.7" />
    </filter>
    <filter id="n15-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 -0.42" />
    </filter>
  </defs>
);

// Linen table, the hoop with silk stretched in it. Children are clipped to the silk.
export const Hoop = ({ cx, cy, r, children, tilt = 0 }: { cx: number; cy: number; r: number; children?: ReactNode; tilt?: number }) => (
  <g>
    <ellipse cx={cx + 26} cy={cy + 40} rx={r + 40} ry={r + 34} fill="#3a3128" opacity={0.5} filter="url(#n15-blur)" />
    {/* silk overspill outside the hoop, gathered */}
    <circle cx={cx} cy={cy} r={r + 52} fill="#2b1029" />
    {Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2 + tilt;
      return <line key={i} x1={cx + Math.cos(a) * (r + 20)} y1={cy + Math.sin(a) * (r + 20)} x2={cx + Math.cos(a + 0.05) * (r + 54)} y2={cy + Math.sin(a + 0.05) * (r + 54)} stroke="#5a2754" strokeWidth={5} opacity={0.6} filter="url(#n15-tiny)" />;
    })}
    <clipPath id="n15-silk">
      <circle cx={cx} cy={cy} r={r} />
    </clipPath>
    <g clipPath="url(#n15-silk)">
      <circle cx={cx} cy={cy} r={r} fill="url(#n15-sheen)" />
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="url(#n15-silkweave)" />
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="url(#n15-silklight)" />
      {children}
      {/* tension: the silk darkens a little where the inner ring grips it */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#12030f" strokeWidth={46} opacity={0.45} filter="url(#n15-blur)" />
    </g>
    {/* outer ring with screw clamp */}
    <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="url(#n15-wood)" strokeWidth={30} />
    <circle cx={cx} cy={cy} r={r + 1} fill="none" stroke="#7a5230" strokeWidth={2} opacity={0.8} />
    <circle cx={cx} cy={cy} r={r + 28} fill="none" stroke="#7a5230" strokeWidth={2} opacity={0.6} />
    <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="#fff1d0" strokeWidth={3} opacity={0.35} strokeDasharray="40 22 90 30" />
    <g transform={`translate(${cx},${cy - r - 22})`}>
      <rect x={-34} y={-30} width={22} height={40} rx={4} fill="url(#n15-wood)" stroke="#7a5230" strokeWidth={2} />
      <rect x={12} y={-30} width={22} height={40} rx={4} fill="url(#n15-wood)" stroke="#7a5230" strokeWidth={2} />
      <rect x={-54} y={-20} width={108} height={14} rx={7} fill="url(#n15-brass)" />
      <circle cx={-60} cy={-13} r={14} fill="url(#n15-brass)" stroke="#6a4c18" strokeWidth={2} />
    </g>
  </g>
);

// Satin-stitch fill. `angle` = thread direction; `k` 0→1 sews it in (stitches advance across the threads);
// `box` = [cx, cy, radius] covering the shape (used for the reveal sweep and the needle).
export const Satin = ({ id, d, color, light, dark, angle, k, box, padded = true }: { id: string; d: string; color: string; light: string; dark: string; angle: number; k: number; box: [number, number, number]; padded?: boolean }) => {
  if (k <= 0) return null;
  const [bx, by, br] = box;
  return (
    <g filter={padded ? "url(#n15-raise)" : undefined}>
      <defs>
        <pattern id={`${id}-p`} width="40" height="4.2" patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          <rect width="40" height="4.2" fill={color} />
          <rect y="0.4" width="40" height="1.6" fill={light} opacity="0.55" />
          <rect y="3.5" width="40" height="0.7" fill={dark} opacity="0.7" />
        </pattern>
        <linearGradient id={`${id}-g`} gradientTransform={`rotate(${angle + 90} 0.5 0.5)`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={d} />
        </clipPath>
        <clipPath id={`${id}-k`}>
          <rect x={-br} y={-br} width={br * 2} height={br * 2 * k} transform={`translate(${bx},${by}) rotate(${angle})`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-k)`}>
        <path d={d} fill={`url(#${id}-p)`} />
        <path d={d} fill={`url(#${id}-g)`} />
        <g clipPath={`url(#${id}-c)`}>
          <path d={d} fill="none" stroke={dark} strokeWidth={8} opacity={0.5} filter="url(#n15-tiny)" />
        </g>
        <path d={d} fill="none" stroke={dark} strokeWidth={1.4} opacity={0.6} />
      </g>
    </g>
  );
};

// Where the needle is while a Satin with this box/angle is at k: on the leading edge, swinging across.
export const needleAt = (box: [number, number, number], angle: number, k: number, frame: number): [number, number] => {
  const [bx, by, br] = box;
  const a = (angle * Math.PI) / 180;
  const along = Math.sin(frame * 0.9) * br * 0.55;
  const across = -br + br * 2 * k;
  return [bx + Math.cos(a) * along - Math.sin(a) * across, by + Math.sin(a) * along + Math.cos(a) * across];
};

// The needle with its thread trailing to the hoop edge.
export const Needle = ({ at, color, from }: { at: [number, number]; color: string; from: [number, number] }) => {
  const [x, y] = at;
  return (
    <g>
      <path d={`M${from[0]},${from[1]} Q${(from[0] + x) / 2 + 60},${(from[1] + y) / 2 - 80} ${x},${y}`} fill="none" stroke={color} strokeWidth={3} filter="url(#n15-raise)" />
      <g transform={`translate(${x},${y}) rotate(-38)`} filter="url(#n15-raise)">
        <path d="M0,0 L120,-3 Q128,0 120,3 Z" fill="#dfe3e8" stroke="#6b7280" strokeWidth={1} />
        <ellipse cx={108} cy={0} rx={7} ry={1.4} fill="#4a4f58" />
        <line x1={2} y1={-0.6} x2={100} y2={-1.8} stroke="#ffffff" strokeWidth={1} opacity={0.9} />
      </g>
    </g>
  );
};

// Couched gold thread along a path (`len` ≈ path length); `k` 0→1 lays it down from the start.
export const Couched = ({ id, d, k, len, w = 5, color = "url(#n15-goldcord)", tie = "#6a4a16" }: { id: string; d: string; k: number; len: number; w?: number; color?: string; tie?: string }) => {
  if (k <= 0) return null;
  return (
    <g filter="url(#n15-raise)">
      <mask id={`n15-cc-${id}`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} strokeLinecap="round" strokeDasharray={`${len * k} ${len * 2}`} />
      </mask>
      <g mask={`url(#n15-cc-${id})`}>
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff6cf" strokeWidth={w * 0.25} strokeLinecap="round" opacity={0.7} transform="translate(-0.8,-1)" />
        <path d={d} fill="none" stroke={tie} strokeWidth={w + 3} strokeDasharray="1.4 11" opacity={0.85} />
      </g>
    </g>
  );
};

// Running stitch (water, wind): dashes of floss that appear in order.
export const Running = ({ id, d, k, len, color, w = 3.4 }: { id: string; d: string; k: number; len: number; color: string; w?: number }) => {
  if (k <= 0) return null;
  return (
    <g filter="url(#n15-raise)">
      <mask id={`n15-run-${id}`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w + 8} strokeDasharray={`${len * k} ${len * 2}`} />
      </mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="14 8" strokeLinecap="round" mask={`url(#n15-run-${id})`} />
    </g>
  );
};

// French knot: a small raised dot of floss.
export const Knot = ({ x, y, r = 6, color }: { x: number; y: number; r?: number; color: string }) => (
  <g filter="url(#n15-raise)">
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.4} fill="#ffffff" opacity={0.55} />
    <path d={`M${x - r * 0.7},${y} a${r * 0.7},${r * 0.7} 0 0 1 ${r * 1.4},0`} fill="none" stroke="#000" strokeWidth={1} opacity={0.3} />
  </g>
);

// Spools of floss on the linen (still-life detail outside the hoop).
export const Spool = ({ x, y, color, rot = 0 }: { x: number; y: number; color: string; rot?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <ellipse cx={8} cy={14} rx={58} ry={20} fill="#3a3128" opacity={0.35} filter="url(#n15-tiny)" />
    <rect x={-50} y={-26} width={100} height={52} rx={6} fill="url(#n15-wood)" />
    <rect x={-40} y={-24} width={80} height={48} fill={color} />
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-40 + i * 5} y1={-24} x2={-38 + i * 5} y2={24} stroke="#000" strokeWidth={1} opacity={0.15} />)}
    <rect x={-40} y={-24} width={80} height={14} fill="#ffffff" opacity={0.22} />
  </g>
);
