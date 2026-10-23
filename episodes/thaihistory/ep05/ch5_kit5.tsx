import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";
import { Glow, PAL, type Costume } from "../../../components/Scene";
import { clamp, font } from "../news/kit";
import type { G } from "../ep04/v2";

// Local pieces for chapters 5–6 (buffer state, treaties, ceded lands).

export const SUIT: Costume = { jacket: "#1f2028", sash: "#efe6d0", pants: "#1f2028", head: "short", skin: "#e0b08a" };
export const SIAM_OFF: Costume = { jacket: "#f2ecdc", sash: PAL.gilt, pants: "#2b3a67", head: "short" };
export const MALAY: Costume = { jacket: "#2a6a5a", sash: PAL.gilt, pants: "#4a3a6a", head: "wrap", headColor: "#c9302c" };
export const VIET_COURT = "#3fa7d6";
export const CEDED = "#ff9a3a";

// Hand-drawn approximate area on the map (soft fill, glow, dashed edge), not tied to a country outline.
export const HandArea = ({ ring, color, k, dashed = true }: { ring: [number, number][]; color: string; k: number; dashed?: boolean }) => {
  const { path, s } = useMap();
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  const d = path(region(ring)) ?? "";
  const pz = 0.85 + 0.15 * Math.sin(frame * 0.1);
  return (
    <g opacity={k}>
      <path d={d} fill={color} fillOpacity={0.28 * pz} />
      <path d={d} fill="none" stroke={color} strokeWidth={14 * s} strokeOpacity={0.3} style={{ filter: `blur(${7 * s}px)` }} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={3.5 * s} strokeLinejoin="round" strokeDasharray={dashed ? `${14 * s} ${8 * s}` : undefined} />
    </g>
  );
};

// A burst of sparks where two fronts meet: rises over 3 frames, fades over 20 (no strobe).
export const Sparks = ({ at: c, f, size = 1 }: { at: [number, number]; f: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  const t = frame - f;
  if (!p || t < 0 || t > 30) return null;
  const o = interpolate(t, [0, 3, 30], [0, 1, 0], clamp);
  const r = interpolate(t, [0, 24], [10, 90], clamp) * s * size;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={o}>
      <circle r={r * 0.7} fill="#fff2b0" opacity={0.35} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + i * 0.3;
        return <line key={i} x1={Math.cos(a) * r * 0.4} y1={Math.sin(a) * r * 0.4} x2={Math.cos(a) * r} y2={Math.sin(a) * r} stroke={i % 2 ? "#ffd25a" : "#fff"} strokeWidth={3 * s} strokeLinecap="round" />;
      })}
    </g>
  );
};

// Small "แนวโดยประมาณ" tag pinned to a map point.
export const ApproxTag = ({ at: c, start, end = 1e9, text = "แนวโดยประมาณ" }: { at: [number, number]; start: number; end?: number; text?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      <rect x={-92 * s} y={-20 * s} width={184 * s} height={38 * s} rx={19 * s} fill="rgba(8,14,26,0.82)" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5 * s} />
      <text y={8 * s} textAnchor="middle" fontSize={22 * s} fontWeight={700} fill="#fff" fontFamily={font}>{text}</text>
    </g>
  );
};

// Crystal chandelier with a warm glow (hangs from y).
export const Chandelier = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.04 + x) * 2 * s;
  return (
    <g transform={`translate(${sway},0)`}>
      <line x1={x} y1={y - 80 * s} x2={x} y2={y} stroke="#8a6a30" strokeWidth={2 * s} />
      <Glow x={x} y={y + 16 * s} s={s * 0.8} color="#ffd890" core="#fff4d8" />
      <path d={`M${x - 46 * s} ${y + 10 * s} Q${x} ${y + 44 * s} ${x + 46 * s} ${y + 10 * s}`} stroke={PAL.gilt} strokeWidth={3 * s} fill="none" />
      {[-40, -20, 0, 20, 40].map((d) => (
        <g key={d}>
          <line x1={x + d * s} y1={y + (10 + Math.abs(d) * -0.1 + 14) * s} x2={x + d * s} y2={y + (34 - Math.abs(d) * 0.3) * s} stroke="#f4f0e6" strokeWidth={1.4 * s} />
          <ellipse cx={x + d * s} cy={y + 4 * s} rx={3 * s} ry={6 * s} fill="#ffe7a0" />
        </g>
      ))}
    </g>
  );
};

// A gold or silver tribute tree (ต้นไม้เงินต้นไม้ทอง) on a tray, carried on a pole (base at x, y).
export const TributeTree = ({ x, y, s, metal = "gold" }: { x: number; y: number; s: number; metal?: "gold" | "silver" }) => {
  const frame = useCurrentFrame();
  const c = metal === "gold" ? PAL.gilt : "#d8dde4";
  const hi = metal === "gold" ? "#ffe7a0" : "#ffffff";
  const shimmer = 0.5 + 0.5 * Math.sin(frame * 0.2 + x * 0.05);
  return (
    <g>
      <rect x={x - 22 * s} y={y - 6 * s} width={44 * s} height={8 * s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.2 * s} />
      <path d={`M${x} ${y - 6 * s} L${x} ${y - 70 * s}`} stroke={c} strokeWidth={4 * s} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path d={`M${x} ${y - (22 + i * 14) * s} q${-18 * s} ${-4 * s} ${-26 * s} ${-14 * s}`} stroke={c} strokeWidth={2.4 * s} fill="none" />
          <path d={`M${x} ${y - (26 + i * 14) * s} q${18 * s} ${-4 * s} ${26 * s} ${-14 * s}`} stroke={c} strokeWidth={2.4 * s} fill="none" />
          <ellipse cx={x - 26 * s} cy={y - (36 + i * 14) * s} rx={6 * s} ry={4 * s} fill={i % 2 ? hi : c} stroke={PAL.ink} strokeWidth={0.8 * s} />
          <ellipse cx={x + 26 * s} cy={y - (40 + i * 14) * s} rx={6 * s} ry={4 * s} fill={i % 2 ? c : hi} stroke={PAL.ink} strokeWidth={0.8 * s} />
        </g>
      ))}
      <circle cx={x} cy={y - 74 * s} r={7 * s} fill={hi} opacity={0.6 + 0.4 * shimmer} />
    </g>
  );
};

// A boundary stone with a carved line, half sunk in the ground.
export const BoundaryStone = ({ x, y, s, rise = 1 }: { x: number; y: number; s: number; rise?: number }) => (
  <g transform={`translate(0,${(1 - rise) * 40 * s})`}>
    <path d={`M${x - 16 * s} ${y} L${x - 14 * s} ${y - 54 * s} Q${x} ${y - 66 * s} ${x + 14 * s} ${y - 54 * s} L${x + 16 * s} ${y} Z`} fill="#c9c2b0" stroke={PAL.ink} strokeWidth={1.8 * s} />
    <line x1={x} y1={y - 50 * s} x2={x} y2={y - 8 * s} stroke={PAL.ink} strokeWidth={2 * s} />
  </g>
);

// Thin flagpole row for "equal among nations": colours only, no emblems (base y).
export const FlagRow = ({ g, y, pan, colors }: { g: G; y: number; pan: number; colors: string[][] }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {colors.map((stripes, i) => {
        const x = g.x + g.W * (0.14 + (i * 0.72) / Math.max(1, colors.length - 1)) + pan * 0.7;
        const top = y - 190 * g.s;
        const wave = Math.sin(frame * 0.22 + i) * 5 * g.s;
        const fw = 70 * g.s;
        const fh = 44 * g.s;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={top - 6 * g.s} stroke="#e8e2d0" strokeWidth={3 * g.s} />
            <circle cx={x} cy={top - 8 * g.s} r={4 * g.s} fill={PAL.gilt} />
            {stripes.map((c, j) => (
              <path key={j} d={`M${x} ${top + (j * fh) / stripes.length} q${fw / 2} ${-6 * g.s + wave} ${fw} 0 v${fh / stripes.length} q${-fw / 2} ${6 * g.s - wave} ${-fw} 0 Z`} fill={c} />
            ))}
            <path d={`M${x} ${top} q${fw / 2} ${-6 * g.s + wave} ${fw} 0 v${fh} q${-fw / 2} ${6 * g.s - wave} ${-fw} 0 Z`} fill="none" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
        );
      })}
    </g>
  );
};
