import { Easing, interpolate, random } from "remotion";
import type { InsetGeom } from "../../../components/Inset";

// Props for the daily world-news short (from the 21 Oct edition). Same conventions as template components/Props:
// (x, y) = ground point, `scale` ≈ 1 px per design unit, dark outlines, two-tone shading. No injured people are drawn.
const INK = "#1b1d24";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const age = (f: number, at: number, len: number) => (f < at ? 0 : Math.min(1, (f - at) / len));
type P = { x: number; y: number; scale?: number };

// Speaker's lectern with two microphones.
export const Lectern = ({ x, y, scale = 1, color = "#5b3a24" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-34 0 L-26 -80 L26 -80 L34 0 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <rect x={-40} y={-92} width={80} height={14} rx={3} fill="#7a5235" stroke={INK} strokeWidth={1.4} />
    <circle cx={0} cy={-46} r={14} fill="#d9b44a" stroke={INK} strokeWidth={1.2} />
    <path d="M-8 -92 L-14 -112 M8 -92 L14 -112" stroke="#222" strokeWidth={2} />
    <circle cx={-14} cy={-114} r={4} fill="#222" />
    <circle cx={14} cy={-114} r={4} fill="#222" />
  </g>
);


// Palm tree bending in the wind (wind 0–1).
export const Palm = ({ x, y, scale = 1, wind = 0, frame, seed = 0 }: P & { wind?: number; frame: number; seed?: number }) => {
  const sway = wind * (18 + 6 * Math.sin(frame * 0.35 + seed));
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d={`M-5 0 Q${sway * 0.4} -60 ${sway} -120 L${sway + 8} -120 Q${sway * 0.4 + 8} -60 5 0 Z`} fill="#7a5a3a" stroke={INK} strokeWidth={1.2} />
      {[-150, -110, -60, -20, 20].map((a, i) => {
        const ang = ((a + sway * 2.2) * Math.PI) / 180;
        const ex = sway + 4 + Math.cos(ang) * 60;
        const ey = -120 + Math.sin(ang) * 30 + 22;
        return <path key={i} d={`M${sway + 4} -120 Q${(sway + 4 + ex) / 2} ${-140 + i * 2} ${ex} ${ey}`} stroke="#2f7a3a" strokeWidth={9} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Slanted rain over a box.
export const Rain = ({ g, k, frame, slant = 0.35, n = 70 }: { g: InsetGeom; k: number; frame: number; slant?: number; n?: number }) =>
  k <= 0 ? null : (
    <g stroke="#cfe6ff" strokeWidth={2 * g.s} opacity={0.55 * k}>
      {Array.from({ length: n }, (_, i) => {
        const px = random(`rx${i}`) * (g.W + 200 * g.s) + g.x - 100 * g.s;
        const sp = 18 + random(`rs${i}`) * 10;
        const py = g.y + (((random(`ry${i}`) * g.H + frame * sp * g.s) % (g.H + 40 * g.s)) - 20 * g.s);
        const len = 26 * g.s;
        return <line key={i} x1={px + py * slant - g.y * slant} y1={py} x2={px + (py + len) * slant - g.y * slant} y2={py + len} />;
      })}
    </g>
  );

// Waves along the bottom of a panel.
export const Waves = ({ g, level, frame, color = "#3b7fb5", amp = 8 }: { g: InsetGeom; level: number; frame: number; color?: string; amp?: number }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const px = g.x + (g.W * i) / 40;
    pts.push(`${px},${level + Math.sin(i * 0.9 + frame * 0.18) * amp * g.s}`);
  }
  return <path d={`M${g.x},${g.y + g.H} L${pts.join(" L")} L${g.x + g.W},${g.y + g.H} Z`} fill={color} opacity={0.88} />;
};

// Simple car (for flooded streets), facing right.
export const Car = ({ x, y, scale = 1, color = "#c0392b" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-56 -10 L-56 -26 Q-54 -30 -40 -32 L-24 -48 L22 -48 L40 -32 Q56 -30 58 -22 L58 -10 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <path d="M-20 -44 L0 -44 L0 -32 L-34 -32 Z M4 -44 L20 -44 L34 -32 L4 -32 Z" fill="#9fc3d8" />
    {[-34, 36].map((cx) => (
      <circle key={cx} cx={cx} cy={-8} r={11} fill="#222" />
    ))}
  </g>
);

// Rescue helicopter, facing left, rotor blur.
export const Helicopter = ({ x, y, scale = 1, frame }: P & { frame: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-40 0 Q-44 -26 -14 -28 L20 -28 Q30 -20 30 -8 L30 0 Z" fill="#e63946" stroke={INK} strokeWidth={1.6} />
    <path d="M-36 -6 Q-36 -22 -16 -22 L-16 -6 Z" fill="#9fc3d8" />
    <rect x={28} y={-18} width={70} height={7} fill="#e63946" stroke={INK} strokeWidth={1.2} />
    <ellipse cx={98} cy={-18} rx={4} ry={14 * Math.abs(Math.sin(frame * 1.3))} fill="#ccc" />
    <rect x={-6} y={-36} width={6} height={8} fill="#333" />
    <ellipse cx={-3} cy={-37} rx={70 * Math.abs(Math.cos(frame * 0.9)) + 10} ry={3} fill="#555" opacity={0.6} />
    <path d="M-34 8 L24 8 M-24 0 L-26 8 M14 0 L16 8" stroke="#333" strokeWidth={2.4} />
    <line x1={-8} y1={8} x2={-8} y2={60} stroke="#ddd" strokeWidth={1.4} strokeDasharray="4 3" />
  </g>
);

// Inflatable rescue boat with two rescuers (orange vests).
export const RescueBoat = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-60 -6 Q-62 8 -48 10 L52 10 Q64 4 62 -10 Z" fill="#f77f00" stroke={INK} strokeWidth={1.6} />
    {[-20, 20].map((dx) => (
      <g key={dx}>
        <rect x={dx - 8} y={-40} width={16} height={30} rx={4} fill="#ff9f1c" stroke={INK} strokeWidth={1.2} />
        <circle cx={dx} cy={-48} r={8} fill="#e0a87e" stroke={INK} strokeWidth={1.2} />
        <path d={`M${dx - 9} -52 Q${dx} -62 ${dx + 9} -52 Z`} fill="#fff" stroke={INK} strokeWidth={1} />
      </g>
    ))}
  </g>
);

// Parliament hemicycle: seats fill in order, yes = green, no = red (k 0–1).
export const Hemicycle = ({ x, y, r, s, yes, no, k }: { x: number; y: number; r: number; s: number; yes: number; no: number; k: number }) => {
  const total = 40 * 5;
  const rows = 5;
  const dots: { px: number; py: number; i: number }[] = [];
  let i = 0;
  for (let row = 0; row < rows; row++) {
    const rr = r * (0.5 + row * 0.12);
    const n = 28 + row * 6;
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (j / (n - 1)) * Math.PI;
      dots.push({ px: x + Math.cos(a) * rr, py: y - Math.sin(a) * rr, i: i++ });
    }
  }
  dots.sort((a, b) => Math.atan2(b.py - y, b.px - x) - Math.atan2(a.py - y, a.px - x));
  const shown = Math.round(dots.length * k);
  const yesN = Math.round((dots.length * yes) / (yes + no));
  void total;
  return (
    <g>
      {dots.map((d, idx) => (
        <circle key={d.i} cx={d.px} cy={d.py} r={6 * s} fill={idx >= shown ? "#3a4255" : idx < yesN ? "#3fb950" : "#ff3b30"} stroke="#0b1426" strokeWidth={1 * s} />
      ))}
    </g>
  );
};


// Typhoon cloud spiral, rotating (k = scale/opacity).
export const Spiral = ({ x, y, r, k, frame }: { x: number; y: number; r: number; k: number; frame: number }) => {
  if (k <= 0) return null;
  const rot = -frame * 2.2;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={Math.min(1, k)}>
      <defs>
        <radialGradient id="tycloud">
          <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
          <stop offset="0.55" stopColor="#f2f5f8" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 0.75} fill="url(#tycloud)" />
      <g style={{ filter: `blur(${r * 0.035}px)` }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} transform={`rotate(${i * 60})`} d={`M${r * 0.15} 0 Q${r * 0.7} ${-r * 0.2} ${r * 0.95} ${r * 0.35} Q${r * 1.05} ${r * 0.8} ${r * 0.55} ${r * 1.15}`} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={r * 0.2} fill="none" strokeLinecap="round" />
        ))}
      </g>
      <circle r={r * 0.09} fill="#1b2b44" stroke="#dfe7ef" strokeWidth={r * 0.05} />
    </g>
  );
};
