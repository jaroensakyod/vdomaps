import type { Feature, FeatureCollection, MultiLineString } from "geojson";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { CARD, font } from "./News";

// Old canals and rivers drawn as glowing lines over imagery (data: kit/canals.mjs → public/data/old-canals.json).
// Each waterway = wide blurred halo + crisp core + thin white centre. Lines draw on with pathLength, light up one by
// one in their own colour, and a clip zone can light up only one stretch of a long river.

export type Canal = Feature<MultiLineString, { name: string; era: string }>;
export const useCanals = (file = "data/old-canals.json") => useJson<FeatureCollection<MultiLineString, { name: string; era: string }>>(file)?.features ?? [];

export const CYAN = "#5fd0ff";
export const ERA: Record<string, string> = { river: CYAN, old: "#ffc94a", thon: "#58e08f", rat: "#ff7ad9" };

// Width in px for the current zoom: rivers twice as wide as canals, never thinner than 3 px at 1080.
const widthFor = (pxDeg: number, s: number, river: boolean) => Math.min(Math.max(pxDeg * 0.0003, 3 * s), 10 * s) * (river ? 2 : 1);

// One glowing waterway. draw 0 → 1 = how much of the line is drawn; lit 0 → 1 = glow strength; dim lowers it.
export const GlowLine = ({ f, draw = 1, lit = 0, color, dim = 1, clip }: { f: Canal; draw?: number; lit?: number; color?: string; dim?: number; clip?: string }) => {
  const { path, projection, s } = useMap();
  if (draw <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const river = f.properties.era === "river";
  const w = widthFor(pxDeg, s, river);
  const d = path(f) ?? "";
  const c = color ?? ERA[f.properties.era] ?? CYAN;
  const dash = draw < 1 ? { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - draw } : {};
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={dim} clipPath={clip ? `url(#${clip})` : undefined}>
      <path d={d} stroke={c} strokeWidth={w * (3.4 + lit * 3)} strokeOpacity={0.32 + lit * 0.4} style={{ filter: `blur(${(6 + lit * 8) * s}px)` }} {...dash} />
      <path d={d} stroke={c} strokeWidth={w * (1 + lit * 0.7)} strokeOpacity={0.92} {...dash} />
      <path d={d} stroke="#ffffff" strokeWidth={Math.max(1, w * 0.28)} strokeOpacity={0.35 + lit * 0.55} {...dash} />
    </g>
  );
};

// A circular clip zone at lon/lat with a radius in degrees, used to light up one stretch (e.g. a shortcut canal).
export const ClipZone = ({ id, at, r }: { id: string; at: [number, number]; r: number }) => {
  const { projection } = useMap();
  const p = projection(at);
  if (!p) return null;
  return (
    <defs>
      <clipPath id={id}>
        <circle cx={p[0]} cy={p[1]} r={(r * projection.scale() * Math.PI) / 180} />
      </clipPath>
    </defs>
  );
};

// Middle vertex of a waterway's longest line: where its name tag goes.
export const midOf = (f: Canal): [number, number] => {
  const longest = f.geometry.coordinates.reduce((a, b) => (b.length > a.length ? b : a));
  return longest[Math.floor(longest.length / 2)] as [number, number];
};

// Name tag on the water: dark pill with a coloured dot, pops in at `start`. at = lon/lat (default: middle of `f`).
export const WaterTag = ({ text, sub, at, start, color = CYAN, dx = 0, dy = -40 }: { text: string; sub?: string; at: [number, number]; start: number; color?: string; dx?: number; dy?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, s } = useMap();
  if (frame < start) return null;
  const p = projection(at);
  if (!p) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 12, mass: 0.6 } });
  const fs = 32 * s;
  const w = Math.max(text.length, (sub?.length ?? 0) * 0.75) * fs * 0.6 + 60 * s;
  const h = (sub ? 86 : 56) * s;
  const x = p[0] + dx * s - w / 2;
  const y = p[1] + dy * s - h / 2;
  return (
    <g opacity={Math.min(1, k)} transform={`translate(${p[0] + dx * s},${p[1] + dy * s}) scale(${k}) translate(${-p[0] - dx * s},${-p[1] - dy * s})`} fontFamily={font}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={CARD} stroke={color} strokeWidth={2.5 * s} />
      <circle cx={x + 24 * s} cy={y + 28 * s} r={8 * s} fill={color} />
      <text x={x + 42 * s} y={y + 39 * s} fontSize={fs} fontWeight={900} fill="#fff">{text}</text>
      {sub && <text x={x + 42 * s} y={y + 72 * s} fontSize={22 * s} fontWeight={700} fill={color}>{sub}</text>}
    </g>
  );
};

// Darken / cool the imagery so the glow reads (k 0 → 1).
export const DuskGrade = ({ k }: { k: number }) => {
  const { width, height } = useMap();
  return k > 0 ? <rect width={width} height={height} fill="#04102a" opacity={0.42 * k} /> : null;
};
