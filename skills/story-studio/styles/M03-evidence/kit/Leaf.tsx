import { loadFont as loadCharm } from "@remotion/google-fonts/Charm";
import { loadFont as loadSrisakdi } from "@remotion/google-fonts/Srisakdi";
import { useMemo, type ReactNode } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// M03 palm-leaf manuscript (ใบลาน) primitives: dark lacquered table, golden-brown leaf strips with fibres, string
// holes and a red cord, text and line art incised and blackened with soot, tied cord knots and red lacquer seals.
// Everything is SVG drawn in code; `u` is the size unit (1 at 1080 px wide).

export const fonts = {
  title: loadSrisakdi("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily,
  body: loadCharm("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily,
};

export const C = {
  table: "#1d5650", // the silk wrapping cloth (ผ้าห่อคัมภีร์) the bundle lies on
  leaf: "#e0c590", // leaf body (pale golden straw)
  leafLight: "#f6ead0", // highlight in the cuts / fresh leaf
  leafDark: "#c9b080", // leaf edges, stains
  soot: "#1a0f08", // ink rubbed into the cuts
  lacquer: "#9c2b1b", // red lacquer: Burma side, seals, cord
  gilt: "#d9a441", // gilt lacquer: a third side
  umber: "#5a3a1c", // brown ink: a fourth side
  cord: "#8e2a1a",
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const useU = () => {
  const { width } = useVideoConfig();
  return width / 1080;
};
export const toThai = (v: string | number) => String(v).replace(/[0-9]/g, (d) => "๐๑๒๓๔๕๖๗๘๙"[Number(d)]);

// Deterministic pseudo-random numbers (same leaf every frame).
export const rng = (seed: number) => {
  let x = seed * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
};

// Table: dark teak with long grain, a warm pool of light in the middle.
export const Table = () => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="m03-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={3} seed={7} />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.75  0 0 0 0 0.68  0 0 0 0.9 -0.3" />
        </filter>
        <radialGradient id="m03-pool" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#5fa69a" stopOpacity={0.35} />
          <stop offset="0.6" stopColor="#1d5650" stopOpacity={0.05} />
          <stop offset="1" stopColor="#06201d" stopOpacity={0.5} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={C.table} />
      <rect width={width} height={height} filter="url(#m03-grain)" />
      {/* woven diamond motif of the silk, and a gold-thread border band down each side */}
      <defs>
        <pattern id="m03-weave" width={36} height={36} patternUnits="userSpaceOnUse">
          <path d="M18 4 L32 18 L18 32 L4 18 Z" fill="none" stroke="#8fd0c2" strokeWidth={1.2} opacity={0.22} />
          <circle cx={18} cy={18} r={2.2} fill="#d9a441" opacity={0.35} />
        </pattern>
        <pattern id="m03-border" width={28} height={28} patternUnits="userSpaceOnUse">
          <rect width={28} height={28} fill="#7a1f16" />
          <path d="M14 3 L25 14 L14 25 L3 14 Z" fill="#d9a441" opacity={0.85} />
          <circle cx={14} cy={14} r={3.5} fill="#7a1f16" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#m03-weave)" />
      {[10, width - 38].map((x) => (
        <g key={x}>
          <rect x={x} y={0} width={28} height={height} fill="url(#m03-border)" />
          <rect x={x - 4} y={0} width={2} height={height} fill="#d9a441" opacity={0.7} />
          <rect x={x + 30} y={0} width={2} height={height} fill="#d9a441" opacity={0.7} />
        </g>
      ))}
      <rect width={width} height={height} fill="url(#m03-pool)" />
    </svg>
  );
};

// Fine film of paper grain over everything (one turbulence pass).
export const Grain = ({ opacity = 0.18 }: { opacity?: number }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity, pointerEvents: "none" }}>
      <filter id="m03-dust">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 1.2 -0.2" />
      </filter>
      <rect width={width} height={height} filter="url(#m03-dust)" />
    </svg>
  );
};

export type LeafProps = { x: number; y: number; w: number; h: number; seed?: number; holes?: number[]; children?: ReactNode; tone?: number; shadow?: boolean; margins?: number[] | false };

// One palm-leaf strip, drawn inside an <svg>. Children are drawn on the leaf, clipped to it.
export const Leaf = ({ x, y, w, h, seed = 1, holes = [0.3, 0.7], children, tone = 0, shadow = true, margins = [0.045, 0.955] }: LeafProps) => {
  const u = useU();
  const id = `leaf${seed}`;
  const rx = Math.min(h * 0.22, 26 * u);
  const fib = useMemo(() => {
    const r = rng(seed);
    const out: { y: number; x0: number; x1: number; o: number; sw: number }[] = [];
    for (let yy = 3; yy < h - 2; yy += 2.5 + r() * 4.5) out.push({ y: yy, x0: r() * w * 0.08, x1: w - r() * w * 0.08, o: 0.05 + r() * 0.2, sw: 0.5 + r() * 1.3 });
    const spots = Array.from({ length: 4 }, () => ({ cx: r() * w, cy: r() * h, rx: (30 + r() * 120) * u, ry: (6 + r() * 20) * u, o: 0.06 + r() * 0.12 }));
    return { out, spots };
  }, [seed, w, h, u]);
  const light = ["#f2dfb2", "#eed8a6", "#f5e4bb"][Math.abs(tone) % 3];
  const hr = Math.max(5 * u, h * 0.055);
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`${id}-c`}>
          <rect width={w} height={h} rx={rx} />
        </clipPath>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.leafDark} />
          <stop offset="0.12" stopColor={C.leaf} />
          <stop offset="0.45" stopColor={light} />
          <stop offset="0.86" stopColor={C.leaf} />
          <stop offset="1" stopColor="#bba077" />
        </linearGradient>
        <linearGradient id={`${id}-e`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a3412" stopOpacity={0.55} />
          <stop offset="0.07" stopColor="#5a3412" stopOpacity={0} />
          <stop offset="0.93" stopColor="#5a3412" stopOpacity={0} />
          <stop offset="1" stopColor="#5a3412" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {shadow && <rect x={4 * u} y={10 * u} width={w} height={h} rx={rx} fill="#000" opacity={0.55} style={{ filter: `blur(${9 * u}px)` }} />}
      <rect width={w} height={h} rx={rx} fill={`url(#${id}-g)`} />
      <g clipPath={`url(#${id}-c)`}>
        {fib.out.map((f, i) => (
          <line key={i} x1={f.x0} x2={f.x1} y1={f.y} y2={f.y} stroke="#6b4318" strokeWidth={f.sw * u} opacity={f.o} />
        ))}
        {fib.spots.map((p, i) => (
          <ellipse key={`s${i}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#5a3412" opacity={p.o} style={{ filter: `blur(${8 * u}px)` }} />
        ))}
        <rect width={w} height={h} fill={`url(#${id}-e)`} />
        {margins &&
          margins.map((m) => (
            <g key={m}>
              <line x1={w * m + 1.5 * u} x2={w * m + 1.5 * u} y1={h * 0.12} y2={h * 0.88} stroke={C.leafLight} strokeWidth={1.4 * u} opacity={0.6} />
              <line x1={w * m} x2={w * m} y1={h * 0.12} y2={h * 0.88} stroke={C.soot} strokeWidth={1.6 * u} opacity={0.55} />
            </g>
          ))}
        {children}
      </g>
      <rect width={w} height={h} rx={rx} fill="none" stroke="#4a2a10" strokeWidth={2.2 * u} opacity={0.75} />
      {holes.map((hx) => (
        <g key={hx}>
          <circle cx={w * hx} cy={h / 2 + 1.5 * u} r={hr} fill={C.leafLight} opacity={0.6} />
          <circle cx={w * hx} cy={h / 2} r={hr} fill="#0d0703" />
        </g>
      ))}
    </g>
  );
};

// Text cut into the leaf with a stylus and blackened: a pale lip under each stroke, soot in the cut.
export const Cut = ({ x, y, size, children, font = fonts.body, weight = 700, anchor = "start", color = C.soot, opacity = 1, spacing = 0 }: { x: number; y: number; size: number; children: ReactNode; font?: string; weight?: number; anchor?: "start" | "middle" | "end"; color?: string; opacity?: number; spacing?: number }) => {
  const u = useU();
  const common = { x, textAnchor: anchor, fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: spacing } as const;
  return (
    <g opacity={opacity}>
      <text {...common} y={y + Math.max(1.2 * u, size * 0.035)} fill={C.leafLight} opacity={0.75}>
        {children}
      </text>
      <text {...common} y={y} fill={color} stroke="#000" strokeOpacity={0.25} strokeWidth={0.6 * u}>
        {children}
      </text>
    </g>
  );
};

// A red cord through the holes of a stacked bundle (drawn in the gaps between leaves).
export const CordRun = ({ x, y0, y1, sway = 0 }: { x: number; y0: number; y1: number; sway?: number }) => {
  const u = useU();
  const d = `M${x} ${y0} C${x + sway * u} ${(y0 * 2 + y1) / 3} ${x - sway * u} ${(y0 + y1 * 2) / 3} ${x} ${y1}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#000" strokeWidth={9 * u} opacity={0.4} transform={`translate(${3 * u},${4 * u})`} />
      <path d={d} stroke={C.cord} strokeWidth={7 * u} />
      <path d={d} stroke="#d0604a" strokeWidth={2 * u} strokeDasharray={`${3 * u} ${5 * u}`} opacity={0.7} />
    </g>
  );
};

// Confidence as knots on a short cord: 3 knots = independent sources agree, 2 = disputed, 1 = one side only.
export const Knots = ({ x, y, n, k = 1 }: { x: number; y: number; n: 1 | 2 | 3; k?: number }) => {
  const u = useU();
  const len = 150 * u;
  return (
    <g transform={`translate(${x},${y})`} opacity={k}>
      <path d={`M0 0 C${len * 0.3} ${-10 * u} ${len * 0.7} ${10 * u} ${len} 0`} fill="none" stroke={C.cord} strokeWidth={6 * u} strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const on = i < n;
        const cx = len * (0.25 + i * 0.27);
        return on ? (
          <g key={i} transform={`translate(${cx},0) scale(${interpolate(k, [0.3 + i * 0.2, 0.5 + i * 0.2], [0, 1], clamp)})`}>
            <ellipse rx={13 * u} ry={11 * u} fill={C.cord} stroke="#4a120a" strokeWidth={2 * u} />
            <path d={`M${-8 * u} ${-4 * u} Q0 ${6 * u} ${8 * u} ${-4 * u}`} fill="none" stroke="#d0604a" strokeWidth={2 * u} opacity={0.8} />
          </g>
        ) : (
          <circle key={i} cx={cx} cy={0} r={5 * u} fill="none" stroke={C.soot} strokeWidth={2 * u} strokeDasharray={`${3 * u} ${3 * u}`} opacity={0.5} />
        );
      })}
      <path d={`M${len} 0 l${14 * u} ${22 * u} M${len} 0 l${4 * u} ${26 * u} M${len} 0 l${-6 * u} ${24 * u}`} stroke={C.cord} strokeWidth={3 * u} strokeLinecap="round" />
    </g>
  );
};

// Red lacquer seal pressed onto a leaf; slams in from ×2 at `at`.
export const Seal = ({ x, y, r, text, at, rot = -12, color = C.lacquer }: { x: number; y: number; r: number; text: string; at: number; rot?: number; color?: string }) => {
  const frame = useCurrentFrame();
  const u = useU();
  if (frame < at) return null;
  const t = interpolate(frame, [at, at + 7], [0, 1], clamp);
  const sc = interpolate(t, [0, 0.8, 1], [2.2, 0.94, 1]);
  const ex = Math.max(1, (text.length * 0.36 + 0.5) / 1.6); // stretch the seal for long words
  const blob = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const rr = r * (1 + 0.06 * Math.sin(i * 2.7 + r));
    return `${Math.cos(a) * rr * ex},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`} opacity={t}>
      <polygon points={blob} fill="#000" opacity={0.45} transform={`translate(${3 * u},${5 * u})`} style={{ filter: `blur(${4 * u}px)` }} />
      <polygon points={blob} fill={color} />
      <ellipse rx={r * (0.78 * ex - (ex > 1 ? 0.1 : 0))} ry={r * 0.78} fill="none" stroke="#5e130a" strokeWidth={3 * u} />
      <ellipse rx={r * (0.7 * ex - (ex > 1 ? 0.1 : 0))} ry={r * 0.7} fill="none" stroke="#c9503a" strokeWidth={1.5 * u} opacity={0.6} />
      <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.3} ry={r * 0.12} fill="#fff" opacity={0.25} transform="rotate(-30)" />
      <text y={r * 0.2} textAnchor="middle" fontFamily={fonts.title} fontWeight={700} fontSize={r * (text.length > 3 ? 0.5 : 0.72)} fill="#f3d2b8" opacity={0.92}>
        {text}
      </text>
    </g>
  );
};

// Leaf that slides out of a stack from the right (motion signature): 0 → hidden in the stack, 1 → out.
export const slideOut = (frame: number, start: number, end = 1e9, len = 16) => {
  const a = interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const b = interpolate(frame, [end, end + 12], [1, 0], clamp);
  return Math.min(a, b);
};

// The edges of a pile of leaves at the right of a slot, where new leaves come from.
export const StackEdge = ({ x, y, h, n = 7 }: { x: number; y: number; h: number; n?: number }) => {
  const u = useU();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * 5 * u} y={y + i * (h / n) * 0.12} width={60 * u} height={h - i * (h / n) * 0.24} rx={10 * u} fill={i % 2 ? "#a8763c" : "#bf8f50"} stroke="#4a2a10" strokeWidth={1.5 * u} />
      ))}
    </g>
  );
};

// The lacquered wooden cover board (ไม้ประกับ) of the bundle: black lacquer, gilt rules and a row of petal motifs.
export const CoverBoard = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) => {
  const u = useU();
  const n = Math.floor(w / (46 * u));
  const step = (w - 60 * u) / n;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={4 * u} y={10 * u} width={w} height={h} rx={14 * u} fill="#000" opacity={0.6} style={{ filter: `blur(${10 * u}px)` }} />
      <defs>
        <linearGradient id="m03-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1a0c" />
          <stop offset="0.5" stopColor="#1c0c06" />
          <stop offset="1" stopColor="#0c0503" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} rx={14 * u} fill="url(#m03-board)" stroke="#3a1d0c" strokeWidth={3 * u} />
      <rect x={14 * u} y={12 * u} width={w - 28 * u} height={h - 24 * u} rx={8 * u} fill="none" stroke={C.gilt} strokeWidth={2 * u} opacity={0.8} />
      <rect x={22 * u} y={20 * u} width={w - 44 * u} height={h - 40 * u} rx={6 * u} fill="none" stroke={C.gilt} strokeWidth={1 * u} opacity={0.5} />
      {Array.from({ length: n }, (_, i) => {
        const cx = 30 * u + step * (i + 0.5);
        const cy = 34 * u;
        return <path key={i} d={`M${cx - 14 * u} ${cy + 8 * u} Q${cx} ${cy - 16 * u} ${cx + 14 * u} ${cy + 8 * u} Q${cx} ${cy} ${cx - 14 * u} ${cy + 8 * u} Z`} fill={C.gilt} opacity={0.7} />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const cx = 30 * u + step * (i + 0.5);
        const cy = h - 34 * u;
        return <path key={i} d={`M${cx - 14 * u} ${cy - 8 * u} Q${cx} ${cy + 16 * u} ${cx + 14 * u} ${cy - 8 * u} Q${cx} ${cy} ${cx - 14 * u} ${cy - 8 * u} Z`} fill={C.gilt} opacity={0.7} />;
      })}
      <rect x={0} y={0} width={w} height={h * 0.45} rx={14 * u} fill="#fff" opacity={0.05} />
      {children}
    </g>
  );
};
