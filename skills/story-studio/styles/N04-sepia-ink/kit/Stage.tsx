import { loadFont as loadChonburi } from "@remotion/google-fonts/Chonburi";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FigureDefs } from "../../../components/Figures";
import type { InsetGeom } from "../../../components/Inset";

// N04 stage: the sepia-ink illustration panel, full size (no map). A paper page with grain and a brown vignette
// holds one rounded panel: sky gradient, a red "ภาพประกอบ" tag, 3 px ink border. Children get the same geometry
// as an <InsetPanel> (components/Inset.tsx), so Scenes pieces drop in unchanged: draw scenery from `ground` up,
// figures at `sc` scale. Use the same pieces small inside a map's <InsetPanel> when the story has a map.
export const fonts = {
  title: loadChonburi("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily,
  body: loadKanit("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily,
};

export const C = {
  paper: "#e6d4aa",
  card: "#efe1bb",
  ink: "#2a1b0e",
  text: "#3b2a1a",
  red: "#b0302a",
  gold: "#c9a03c",
  // sky pairs (top → bottom)
  day: ["#e9d7a6", "#cdb27a"] as [string, string],
  dusk: ["#5a2a1f", "#c0602e"] as [string, string],
  night: ["#0e1626", "#24324a"] as [string, string],
  hall: ["#6e2a1f", "#6e2a1f"] as [string, string],
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Paper page behind the panel: flat paper + one noise grain + vignette.
export const Page = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg width={width} height={height}>
        <filter id="pg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0.45 0" />
        </filter>
        <radialGradient id="pg-vig" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="#3b2a1a" stopOpacity={0} />
          <stop offset="1" stopColor="#2a1b0e" stopOpacity={0.5} />
        </radialGradient>
        <rect width={width} height={height} filter="url(#pg-grain)" opacity={0.35} />
        <rect width={width} height={height} fill="url(#pg-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

// One illustration panel that pops in at `start` and out at `end`. `box` = [x, y, w, h] as fractions of the frame.
export const Stage = ({ id, start, end, sky, box, label = "ภาพประกอบ", children }: { id: string; start: number; end: number; sky: [string, string]; box?: [number, number, number, number]; label?: string; children: (g: InsetGeom) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const vertical = height > width;
  if (frame < start - 1 || frame > end) return null;
  const pop = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const out = interpolate(frame, [end - 14, end], [1, 0], clamp);
  const k = Math.min(1, pop) * out;
  const [bx, by, bw, bh] = box ?? (vertical ? [0.05, 0.2, 0.9, 0.46] : [0.05, 0.15, 0.9, 0.64]);
  const s = Math.min(width, height) / 1080;
  const x = width * bx, y = height * by, W = width * bw, H = height * bh;
  const ground = y + H - 70 * s;
  const sc = (H / (380 * s)) * 1.55 * s; // same figure-to-panel ratio as an InsetPanel
  const clip = `stage-${id}`;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: k }}>
      <FigureDefs />
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={W} height={H} rx={18 * s} />
        </clipPath>
        <linearGradient id={`${clip}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect x={x + 8 * s} y={y + 12 * s} width={W} height={H} rx={18 * s} fill="rgba(40,25,10,0.35)" />
      <g clipPath={`url(#${clip})`} transform={`translate(0,${(1 - Math.min(1, pop)) * 30 * s})`}>
        <rect x={x} y={y} width={W} height={H} fill={`url(#${clip}-sky)`} />
        {children({ x, y, W, H, ground, cx: x + W / 2, s, sc, vertical, frame })}
      </g>
      <rect x={x} y={y} width={W} height={H} rx={18 * s} fill="none" stroke={C.ink} strokeWidth={4 * s} />
      <rect x={x + 22 * s} y={y + 20 * s} width={(label.length * 17 + 44) * s} height={42 * s} rx={8 * s} fill={C.red} />
      <text x={x + 44 * s} y={y + 50 * s} fontSize={26 * s} fontWeight={700} fill="#fff6dd" fontFamily={fonts.body}>
        {label}
      </text>
    </svg>
  );
};

// Depth inside a panel: slow push-in + pan for the panel's life; children get `pan` px for parallax
// (far × 0.2, mid × 0.6, foreground × 1.6). `impact` 0–1 shakes and flashes; warm light + paper grain on top.
export const Layers = ({ g, id, start, end, impact = 0, warm = 0.08, children }: { g: InsetGeom; id: string; start: number; end: number; impact?: number; warm?: number; children: (pan: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const push = 1 + interpolate(frame, [start, end], [0, 0.07], clamp);
  const pan = interpolate(frame, [start, end], [0, -60], clamp) * g.s;
  const shake = impact * 8 * g.s;
  return (
    <g transform={`translate(${Math.sin(frame * 2.3) * shake},${Math.cos(frame * 3.1) * shake})`}>
      <g transform={`translate(${g.cx},${g.ground}) scale(${push}) translate(${-g.cx},${-g.ground})`}>{children(pan)}</g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#ffb060" opacity={warm} />
      <defs>
        <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.22 0" />
        </filter>
        <radialGradient id={`vig-${id}`} cx="0.5" cy="0.55" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.4} />
        </radialGradient>
      </defs>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} filter={`url(#grain-${id})`} />
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill={`url(#vig-${id})`} />
      {impact > 0.6 && <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#fff6dc" opacity={(impact - 0.6) * 1.2} />}
    </g>
  );
};

// Subtitle-style line under the panel (cream with a dark-brown outline), on from `start` to `end`.
export const Line = ({ text, start, end }: { text: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [start, start + 6, end - 6, end], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: vertical ? height * 0.7 : undefined, bottom: vertical ? undefined : 60 * s, textAlign: "center", fontFamily: fonts.body, fontWeight: 700, fontSize: (vertical ? 62 : 54) * s, lineHeight: 1.45, color: "#fff6dd", WebkitTextStroke: `${12 * s}px ${C.ink}`, paintOrder: "stroke fill", opacity: o }}>
      {text}
    </div>
  );
};
