import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FigureDefs } from "../../../components/Figures";
import type { InsetGeom } from "../../../components/Inset";

// The news-look frame for flat two-tone figure scenes (no map): dark navy page, red channel chip + year pill,
// a dark head card with a coloured left edge, and one big rounded illustration panel with an accent border and
// a "ภาพประกอบ" tag. Children of <Panel> get the same geometry as an <InsetPanel> (components/Inset.tsx), so the
// figure kits drop into a map's inset panels unchanged when the story has a map.
export const font = loadKanit("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
export const PAGE = ["#0d1422", "#1b2233"] as const;
export const CARD = "rgba(8,14,26,0.86)";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Sky pairs used by the scenes (top → bottom).
export const SKY = {
  dawn: ["#e8a868", "#f6dfb0"] as [string, string],
  summer: ["#8ab8de", "#e8f0f2"] as [string, string],
  smoke: ["#6a6a70", "#c8b89a"] as [string, string],
  winter: ["#7a8a94", "#d8dee2"] as [string, string],
  night: ["#0e1a30", "#2a3a58"] as [string, string],
};

const unit = () => {
  const { width, height } = useVideoConfig();
  return { width, height, s: Math.min(width, height) / 1080, vertical: height > width };
};

export const Page = () => {
  const { width, height } = useVideoConfig();
  return <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PAGE[0]} 0%, ${PAGE[1]} 100%)`, width, height }} />;
};

// Red channel chip + chapter text on the left, year pill on the right.
export const TopBar = ({ channel, chapter, year }: { channel: string; chapter: string; year: string }) => {
  const { height, s } = unit();
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${2 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 30 * s }}>{channel}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>{year}</div>
    </div>
  );
};

// Head card: one per shot. The card stays; tag + headline (+ big stat) swap at each `f`.
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string; color?: string };
export const HeadCard = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { height, s, vertical } = unit();
  const { fps } = useVideoConfig();
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? RED;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: vertical ? 50 * s : undefined, width: vertical ? undefined : 600 * s, top: height * (vertical ? 0.1 : 0.13), transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: CARD, borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${14 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4, zIndex: 2 }}>
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{h.tag}</span>
      <div style={{ fontSize: 58 * s, fontWeight: 900, lineHeight: 1.3, marginTop: 4 * s, transform: `translateY(${(1 - swap) * 14 * s}px)`, opacity: swap }}>{h.head}</div>
      {h.stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, opacity: swap }}>
          <span style={{ fontSize: 90 * s, fontWeight: 900, color: color === RED ? "#ff6b5f" : color, lineHeight: 1.2 }}>{h.stat}</span>
          {h.label && <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{h.label}</span>}
        </div>
      )}
    </div>
  );
};

// One illustration panel, popping in at `start`, out at `end`. `box` = [x, y, w, h] as fractions of the frame.
export const Panel = ({ id, start, end, sky, accent = RED, box, label = "ภาพประกอบ", children }: { id: string; start: number; end: number; sky: [string, string]; accent?: string; box?: [number, number, number, number]; label?: string; children: (g: InsetGeom) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height, s, vertical } = unit();
  const { fps } = useVideoConfig();
  if (frame < start - 1 || frame > end) return null;
  const pop = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const k = Math.min(1, pop) * interpolate(frame, [end - 14, end], [1, 0], clamp);
  const [bx, by, bw, bh] = box ?? (vertical ? [0.046, 0.28, 0.908, 0.44] : [0.37, 0.13, 0.59, 0.64]);
  const x = width * bx, y = height * by, W = width * bw, H = height * bh;
  const ground = y + H - 60 * s;
  const sc = (H / (380 * s)) * 1.55 * s;
  const clip = `panel-${id}`;
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
      <g clipPath={`url(#${clip})`} transform={`translate(0,${(1 - Math.min(1, pop)) * 30 * s})`}>
        <rect x={x} y={y} width={W} height={H} fill={`url(#${clip}-sky)`} />
        {children({ x, y, W, H, ground, cx: x + W / 2, s, sc, vertical, frame })}
      </g>
      <rect x={x} y={y} width={W} height={H} rx={18 * s} fill="none" stroke={accent} strokeWidth={4 * s} />
      <rect x={x + 18 * s} y={y + 16 * s} width={(label.length * 17 + 44) * s} height={40 * s} rx={8 * s} fill={accent} />
      <text x={x + 40 * s} y={y + 45 * s} fontSize={25 * s} fontWeight={900} fill={accent === GOLD ? "#1b1d24" : "#fff"} fontFamily={font}>
        {label}
      </text>
    </svg>
  );
};

// Depth inside a panel: slow push-in + pan; children get `pan` px for parallax (far × 0.2, mid × 0.6,
// foreground × 1.6). `impact` 0–1 shakes and flashes white.
export const Layers = ({ g, start, end, impact = 0, children }: { g: InsetGeom; start: number; end: number; impact?: number; children: (pan: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  const push = 1 + interpolate(frame, [start, end], [0, 0.06], clamp);
  const pan = interpolate(frame, [start, end], [0, -60], clamp) * g.s;
  const shake = impact * 8 * g.s;
  return (
    <g transform={`translate(${Math.sin(frame * 2.3) * shake},${Math.cos(frame * 3.1) * shake})`}>
      <g transform={`translate(${g.cx},${g.ground}) scale(${push}) translate(${-g.cx},${-g.ground})`}>{children(pan)}</g>
      {impact > 0.6 && <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#fff" opacity={(impact - 0.6) * 1.3} />}
    </g>
  );
};

// Subtitle line (white 900 with a dark outline) from `start` to `end`.
export const Line = ({ text, start, end }: { text: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { height, s, vertical } = unit();
  const o = interpolate(frame, [start, start + 5, end - 5, end], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: vertical ? height * 0.765 : undefined, bottom: vertical ? undefined : 60 * s, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: 60 * s, lineHeight: 1.4, color: "#fff", WebkitTextStroke: `${12 * s}px #0b0f18`, paintOrder: "stroke fill", opacity: o }}>
      {text}
    </div>
  );
};
