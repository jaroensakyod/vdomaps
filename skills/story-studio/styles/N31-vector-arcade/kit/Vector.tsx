import type { ReactNode } from "react";

// Vector-display arcade pieces. Everything on the tube is a thin line drawn by the beam: no fills, no pixels, no
// scanlines. <Beam> gives every line a phosphor glow (white-hot core, coloured halo); `trail()` repeats a moving
// object at earlier frames, fading, the way the phosphor keeps glowing behind it. <Cabinet> draws the yellow
// cabinet round the tube: printed bezel with the kicker, control panel, coin door. 1080×1920 frame.
// TUBE: the coordinates the picture is drawn in. VIEW: where the tube sits in the cabinet (scaled down).
export const TUBE = { x: 84, y: 300, w: 912, h: 1188, r: 70 };
const K = 0.86;
export const VIEW = { x: 540 - (TUBE.w * K) / 2, y: 134, w: TUBE.w * K, h: TUBE.h * K, r: 60 };
const MAP = `translate(${VIEW.x},${VIEW.y}) scale(${K}) translate(${-TUBE.x},${-TUBE.y})`;
export const C = { white: "#e8f7ff", cyan: "#5fd8ff", red: "#ff5146", green: "#7dffb0", amber: "#ffc24a", black: "#020305" };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---- vector font: strokes on a 4×6 grid, advance 6 ----
const G: Record<string, number[][]> = {
  "0": [[0, 0, 4, 0, 4, 6, 0, 6, 0, 0], [4, 0, 0, 6]], "1": [[1, 1, 2, 0, 2, 6], [1, 6, 3, 6]], "2": [[0, 0, 4, 0, 4, 3, 0, 3, 0, 6, 4, 6]],
  "3": [[0, 0, 4, 0, 4, 6, 0, 6], [0, 3, 4, 3]], "4": [[0, 0, 0, 3, 4, 3], [4, 0, 4, 6]], "5": [[4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6]],
  "6": [[4, 0, 0, 0, 0, 6, 4, 6, 4, 3, 0, 3]], "7": [[0, 0, 4, 0, 4, 6]], "8": [[0, 0, 4, 0, 4, 6, 0, 6, 0, 0], [0, 3, 4, 3]],
  "9": [[4, 3, 0, 3, 0, 0, 4, 0, 4, 6, 0, 6]], A: [[0, 6, 0, 2, 2, 0, 4, 2, 4, 6], [0, 3.5, 4, 3.5]],
  B: [[0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 4, 4, 4, 5, 3, 6, 0, 6, 0, 0], [0, 3, 3, 3]], C: [[4, 0, 0, 0, 0, 6, 4, 6]],
  D: [[0, 0, 2, 0, 4, 2, 4, 4, 2, 6, 0, 6, 0, 0]], E: [[4, 0, 0, 0, 0, 6, 4, 6], [0, 3, 3, 3]], F: [[4, 0, 0, 0, 0, 6], [0, 3, 3, 3]],
  G: [[4, 1, 4, 0, 0, 0, 0, 6, 4, 6, 4, 3, 2, 3]], H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]], I: [[0, 0, 4, 0], [2, 0, 2, 6], [0, 6, 4, 6]],
  J: [[4, 0, 4, 6, 2, 6, 0, 4]], K: [[0, 0, 0, 6], [4, 0, 0, 3, 4, 6]], L: [[0, 0, 0, 6, 4, 6]], M: [[0, 6, 0, 0, 2, 2, 4, 0, 4, 6]],
  N: [[0, 6, 0, 0, 4, 6, 4, 0]], O: [[0, 0, 4, 0, 4, 6, 0, 6, 0, 0]], P: [[0, 6, 0, 0, 4, 0, 4, 3, 0, 3]],
  Q: [[0, 0, 4, 0, 4, 4, 2, 6, 0, 6, 0, 0], [2, 4, 4, 6]], R: [[0, 6, 0, 0, 4, 0, 4, 3, 0, 3], [1, 3, 4, 6]],
  S: [[4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6]], T: [[0, 0, 4, 0], [2, 0, 2, 6]], U: [[0, 0, 0, 6, 4, 6, 4, 0]], V: [[0, 0, 2, 6, 4, 0]],
  W: [[0, 0, 0, 6, 2, 4, 4, 6, 4, 0]], X: [[0, 0, 4, 6], [4, 0, 0, 6]], Y: [[0, 0, 2, 2, 4, 0], [2, 2, 2, 6]], Z: [[0, 0, 4, 0, 0, 6, 4, 6]],
  "-": [[0.5, 3, 3.5, 3]], ":": [[2, 1.2, 2, 1.8], [2, 4.2, 2, 4.8]], ".": [[2, 5.4, 2, 6]], "/": [[0, 6, 4, 0]], "'": [[2, 0, 2, 1.5]], " ": [],
};
export const vtextPath = (text: string, x: number, y: number, size: number, anchor: "start" | "middle" | "end" = "start") => {
  const u = size / 6;
  const w = (text.length * 6 - 2) * u;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return [...text.toUpperCase()].map((ch, i) => (G[ch] ?? []).map((s) => {
    let d = "";
    for (let k = 0; k < s.length; k += 2) d += `${k ? "L" : "M"}${(x0 + (i * 6 + s[k]) * u).toFixed(1)} ${(y + s[k + 1] * u).toFixed(1)}`;
    return d;
  }).join(" ")).join(" ");
};
export const VText = ({ text, x, y, size = 36, color = C.white, anchor = "start", width = 3, opacity = 1 }: { text: string; x: number; y: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; width?: number; opacity?: number }) => (
  <path d={vtextPath(text, x, y, size, anchor)} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
);

// ---- 3D wireframes (orthographic) ----
type V3 = [number, number, number];
export const project = ([x, y, z]: V3, rotY: number, tilt: number): V3 => {
  const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
  const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
  const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
  return [x1, y2, z2];
};
// a polyline on a sphere split into front (z > 0) and back segments
const sphereLines = (lines: V3[][], cx: number, cy: number, r: number, rotY: number, tilt: number) => {
  let front = "", back = "";
  for (const line of lines) {
    let prev: V3 | null = null;
    for (const p of line) {
      const q = project(p, rotY, tilt);
      const X = cx + q[0] * r, Y = cy - q[1] * r;
      if (prev) {
        const seg = `M${(cx + prev[0] * r).toFixed(1)} ${(cy - prev[1] * r).toFixed(1)}L${X.toFixed(1)} ${Y.toFixed(1)}`;
        if (q[2] + prev[2] > 0) front += seg; else back += seg;
      }
      prev = q;
    }
  }
  return { front, back };
};
const latLon = (lat: number, lon: number): V3 => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
export const globeLines = (nLat = 5, nLon = 12, steps = 48) => {
  const lines: V3[][] = [];
  for (let i = 1; i <= nLat; i++) {
    const lat = -Math.PI / 2 + (i * Math.PI) / (nLat + 1);
    lines.push(Array.from({ length: steps + 1 }, (_, k) => latLon(lat, (k / steps) * Math.PI * 2)));
  }
  for (let j = 0; j < nLon; j++) {
    const lon = (j / nLon) * Math.PI * 2;
    lines.push(Array.from({ length: steps + 1 }, (_, k) => latLon(-Math.PI / 2 + (k / steps) * Math.PI, lon)));
  }
  return lines;
};
// small circles on a sphere (craters): centre lat/lon, angular radius
export const craterLines = (list: [number, number, number][], steps = 20) =>
  list.map(([lat, lon, a]) => {
    const c = latLon(lat, lon);
    const e1: V3 = [Math.cos(lon), 0, -Math.sin(lon)];
    const e2: V3 = [c[1] * e1[2] - c[2] * e1[1], c[2] * e1[0] - c[0] * e1[2], c[0] * e1[1] - c[1] * e1[0]];
    return Array.from({ length: steps + 1 }, (_, k) => {
      const t = (k / steps) * Math.PI * 2;
      return [0, 1, 2].map((i) => c[i] * Math.cos(a) + (e1[i] * Math.cos(t) + e2[i] * Math.sin(t)) * Math.sin(a)) as V3;
    });
  });
export const Sphere = ({ lines, cx, cy, r, rotY, tilt = 0.38, color = C.cyan, rim = true, backOpacity = 0.16 }: { lines: V3[][]; cx: number; cy: number; r: number; rotY: number; tilt?: number; color?: string; rim?: boolean; backOpacity?: number }) => {
  const { front, back } = sphereLines(lines, cx, cy, r, rotY, tilt);
  return (
    <g fill="none" stroke={color} strokeLinecap="round">
      <path d={back} strokeWidth={1.6} opacity={backOpacity} />
      <path d={front} strokeWidth={2.4} />
      {rim && <circle cx={cx} cy={cy} r={r} strokeWidth={3} />}
    </g>
  );
};

// ---- ships ----
export const Sputnik = ({ x, y, s = 1, a = 0, color = C.white }: { x: number; y: number; s?: number; a?: number; color?: string }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`} fill="none" stroke={color} strokeWidth={2.4 / s} strokeLinecap="round">
    <circle r={14} />
    <path d="M-8 -4 L8 -4 M-10 3 L10 3" opacity={0.7} />
    {[-24, -8, 8, 24].map((d) => <path key={d} d={`M-10 ${d * 0.25} L-64 ${d * 1.2}`} />)}
  </g>
);
export const Vostok = ({ x, y, s = 1, a = 0, color = C.white }: { x: number; y: number; s?: number; a?: number; color?: string }) => (
  <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`} fill="none" stroke={color} strokeWidth={2.4 / s} strokeLinejoin="round">
    <circle cx={22} r={20} />
    <path d="M2 -12 L-10 -18 L-40 -14 L-48 0 L-40 14 L-10 18 L2 12" />
    <path d="M-10 -18 L-10 18 M-40 -14 L-40 14" opacity={0.7} />
    <path d="M-48 -6 L-60 -10 M-48 6 L-60 10" />
    <circle cx={30} cy={-6} r={5} />
  </g>
);
// Apollo lunar module, side view, 1 unit ≈ 1 px at s = 1; legs touch y = 0
export const Lander = ({ x, y, s = 1, color = C.white, legs = 1 }: { x: number; y: number; s?: number; color?: string; legs?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={2.6 / s} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-40 -40 L40 -40 L48 -26 L48 -12 L-48 -12 L-48 -26 Z" />
    <path d="M-24 -40 L-30 -70 L-12 -86 L14 -86 L30 -70 L24 -40" />
    <path d="M-6 -86 L-6 -96 M6 -86 L10 -100" />
    <path d="M-12 -72 L4 -72 L4 -60 L-12 -60 Z" opacity={0.8} />
    <path d="M-10 -12 L-14 0 L14 0 L10 -12" opacity={0.7} />
    <path d={`M-44 -14 L${-44 - 26 * legs} 0 M44 -14 L${44 + 26 * legs} 0 M-30 -12 L${-44 - 26 * legs} 0 M30 -12 L${44 + 26 * legs} 0`} />
    <path d={`M${-54 - 26 * legs} 0 L${-34 - 26 * legs} 0 M${34 + 26 * legs} 0 L${54 + 26 * legs} 0`} />
  </g>
);

// phosphor persistence: draw `render(f)` at earlier frames with falling brightness
export const trail = (frame: number, render: (f: number, k: number) => ReactNode, n = 10, step = 1.5, decay = 0.72) =>
  Array.from({ length: n }, (_, i) => n - 1 - i).map((i) => (
    <g key={i} opacity={i === 0 ? 1 : 0.55 * Math.pow(decay, i)}>{render(frame - i * step, i)}</g>
  ));

// ---- cabinet and tube ----
export const VectorDefs = () => (
  <defs>
    <filter id="va-glow" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation={9} result="b1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation={2.6} result="b2" />
      <feColorMatrix in="SourceGraphic" values="1 0 0 0 0.45  0 1 0 0 0.45  0 0 1 0 0.45  0 0 0 1 0" result="hot" />
      <feComponentTransfer in="b1" result="b1x"><feFuncA type="linear" slope={1.8} /></feComponentTransfer>
      <feMerge><feMergeNode in="b1x" /><feMergeNode in="b2" /><feMergeNode in="hot" /></feMerge>
    </filter>
    <radialGradient id="va-tube" cx="0.5" cy="0.48" r="0.62">
      <stop offset="0" stopColor="#0c1418" />
      <stop offset="0.7" stopColor="#05090b" />
      <stop offset="1" stopColor="#010203" />
    </radialGradient>
    <radialGradient id="va-vig" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0.72" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.55} />
    </radialGradient>
    <linearGradient id="va-glare" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.13} />
      <stop offset="0.3" stopColor="#fff" stopOpacity={0.03} />
      <stop offset="0.31" stopColor="#fff" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="va-marquee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2a0f4a" />
      <stop offset="0.55" stopColor="#5a1a6e" />
      <stop offset="1" stopColor="#c2366a" />
    </linearGradient>
    <linearGradient id="va-bezel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3a0f5c" />
      <stop offset="0.45" stopColor="#c2366a" />
      <stop offset="0.8" stopColor="#f2781b" />
      <stop offset="1" stopColor="#f5b400" />
    </linearGradient>
    <linearGradient id="va-panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#24262c" />
      <stop offset="1" stopColor="#101114" />
    </linearGradient>
    <linearGradient id="va-chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff6c8" />
      <stop offset="0.45" stopColor="#ffc24a" />
      <stop offset="0.55" stopColor="#d9621e" />
      <stop offset="1" stopColor="#ffd27a" />
    </linearGradient>
    <clipPath id="va-tubeclip"><rect x={TUBE.x} y={TUBE.y} width={TUBE.w} height={TUBE.h} rx={TUBE.r} /></clipPath>
    <filter id="va-grain" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={1} seed={3} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
    </filter>
  </defs>
);

// Glowing lines on the tube: wrap everything drawn by the beam in this (one filter for the whole picture).
export const Beam = ({ children, flicker = 1 }: { children: ReactNode; flicker?: number }) => (
  <g transform={MAP}><g clipPath="url(#va-tubeclip)"><g filter="url(#va-glow)" opacity={flicker}>{children}</g></g></g>
);

// The cabinet, seen from the player's spot: the tube high in a printed bezel (kicker printed on its top edge),
// below it a big yellow control panel with the stick and two buttons, and the coin door with lit coin slots.
const STRIPES = ["#f5b400", "#f2781b", "#d8341f", "#8a1730"];
export const Cabinet = ({ kicker, marqueeFont, children, lit = 1 }: { kicker: string; marqueeFont: string; children?: ReactNode; lit?: number }) => (
  <g>
    <rect width={1080} height={1920} fill="#f2b705" />
    <rect width={1080} height={1920} filter="url(#va-grain)" />
    {/* printed bezel glass: a sunset gradient, a ringed planet and stars; black only right round the tube */}
    <rect x={24} y={16} width={1032} height={1170} rx={26} fill="url(#va-bezel)" />
    <g fill="none" stroke="#16110e" opacity={0.45}>
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M24 ${420 + i * 180} L1056 ${420 + i * 180}`} strokeWidth={2 + i * 1.5} />)}
    </g>
    <g opacity={0.9}>
      <circle cx={120} cy={1090} r={120} fill="#f5b400" />
      <ellipse cx={120} cy={1090} rx={200} ry={40} fill="none" stroke="#16110e" strokeWidth={9} transform="rotate(-18,120,1090)" />
      {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={30 + rnd(i + 200) * 1020} cy={30 + rnd(i + 230) * 1140} r={2 + rnd(i + 260) * 3} fill="#fff3d6" />)}
    </g>
    <text x={540} y={86} textAnchor="middle" fontFamily={marqueeFont} fontWeight={700} fontSize={60} fill="#fff3d6" stroke="#16110e" strokeWidth={8} paintOrder="stroke" letterSpacing={2} opacity={0.4 + 0.6 * lit}>{kicker}</text>
    <rect x={VIEW.x - 22} y={VIEW.y - 22} width={VIEW.w + 44} height={VIEW.h + 44} rx={VIEW.r + 16} fill="#050506" />
    <rect x={VIEW.x - 22} y={VIEW.y - 22} width={VIEW.w + 44} height={VIEW.h + 44} rx={VIEW.r + 16} fill="none" stroke="#fff3d6" strokeWidth={3} opacity={0.8} />
    <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} rx={VIEW.r} fill="url(#va-tube)" />
    {children}
    {/* curved glass: vignette, a soft reflection and a bright edge */}
    <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} rx={VIEW.r} fill="url(#va-vig)" />
    <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} rx={VIEW.r} fill="url(#va-glare)" />
    <path d={`M${VIEW.x + 60} ${VIEW.y + 22} Q${VIEW.x + VIEW.w / 2} ${VIEW.y + 5} ${VIEW.x + VIEW.w - 60} ${VIEW.y + 22}`} stroke="#fff" strokeOpacity={0.12} strokeWidth={5} fill="none" />
    <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} rx={VIEW.r} fill="none" stroke="#000" strokeWidth={8} />
    {/* control panel */}
    <path d="M0 1196 L1080 1196 L1080 1240 L0 1240 Z" fill="#16110e" opacity={0.9} />
    <path d="M0 1240 L1080 1240 L1080 1560 L0 1560 Z" fill="#f5c21a" />
    <path d="M0 1556 L1080 1556 L1080 1574 L0 1574 Z" fill="#16110e" opacity={0.5} />
    <g>
      <ellipse cx={230} cy={1450} rx={78} ry={28} fill="#000" opacity={0.5} />
      <rect x={222} y={1360} width={16} height={90} fill="#8a8d94" />
      <circle cx={230} cy={1350} r={46} fill="#d82b2b" />
      <circle cx={215} cy={1334} r={14} fill="#fff" opacity={0.45} />
    </g>
    {[[640, "#16110e"], [830, "#d8341f"]].map(([x, c]) => (
      <g key={x as number}>
        <ellipse cx={x as number} cy={1440} rx={62} ry={22} fill="#000" opacity={0.5} />
        <circle cx={x as number} cy={1420} r={52} fill="#1a1b20" />
        <circle cx={x as number} cy={1414} r={41} fill={c as string} />
        <ellipse cx={(x as number) - 11} cy={1400} rx={15} ry={8} fill="#fff" opacity={0.4} />
      </g>
    ))}
    {/* cabinet front with stripes and the coin door */}
    {STRIPES.map((c, i) => <path key={c} d={`M0 ${1640 + i * 26} L1080 ${1600 + i * 26} L1080 ${1620 + i * 26} L0 ${1660 + i * 26} Z`} fill={c} />)}
    <rect x={340} y={1700} width={400} height={240} rx={14} fill="#2a2a2e" />
    <rect x={352} y={1712} width={376} height={216} rx={10} fill="#4a4b52" />
    {[430, 650].map((x) => (
      <g key={x}>
        <rect x={x - 50} y={1740} width={100} height={120} rx={8} fill="#1a1b20" />
        <rect x={x - 30} y={1756} width={60} height={46} rx={4} fill="#ff3b2a" opacity={0.5 + 0.5 * lit} />
        <rect x={x - 4} y={1764} width={8} height={30} fill="#1a1b20" />
        <text x={x} y={1838} textAnchor="middle" fontFamily={marqueeFont} fontWeight={700} fontSize={22} fill="#ff8a7a">COIN</text>
      </g>
    ))}
  </g>
);
