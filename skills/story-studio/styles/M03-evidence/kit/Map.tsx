import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { useJson } from "../../../components/useJson";
import { clamp, font, RED } from "./Cards";

// M03 map kit (from the Naresuan / Taksin evidence episodes): camera helper, top bar, approximate kingdom
// extents, city dots, battle marker, map tags ("ตำแหน่งโดยประมาณ") and Natural Earth rivers.

// Camera on a bbox, zoomed by k, with the subject lifted into the upper-middle (cards sit above and below).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

type LL = [number, number];
// Places (approximate) for the demo story; add your own the same way.
export const PL = {
  pegu: [96.48, 17.33],
  martaban: [97.6, 16.53],
  threePagodas: [98.4, 15.3],
  kanchanaburi: [99.53, 14.0],
  suphan: [100.12, 14.47],
  nongsarai: [99.96, 14.64], // Don Chedi, Suphan Buri
  phanomthuan: [99.7, 14.13], // Phanom Thuan, Kanchanaburi
  ayut: [100.566, 14.357],
} satisfies Record<string, LL>;
export const VW = {
  region: bbox([[94.0, 11.5], [103.0, 21.0]]),
  west: bbox([[97.6, 13.5], [101.0, 16.0]]),
  duel: bbox([[99.3, 13.85], [100.45, 14.95]]),
};
export const ROUTES = {
  swa1592: [[96.48, 17.33], [97.6, 16.53], [98.4, 15.3], [99.53, 14.0], [99.75, 14.38], [99.93, 14.6]] as LL[],
};

// Rough extents in the 1560s–1600s (approximate — say so in the description).
export const ZONES = {
  burma: { color: "#e05a3a", ring: [[92.3, 20.5], [93.3, 24.6], [94.6, 26.2], [97.0, 27.0], [98.6, 25.0], [98.8, 23.4], [99.4, 22.3], [99.0, 21.2], [98.2, 20.4], [97.9, 19.2], [97.7, 17.8], [98.6, 16.4], [98.5, 15.0], [99.1, 13.3], [98.9, 11.9], [98.6, 10.4], [98.0, 11.6], [97.6, 15.4], [97.2, 16.5], [95.6, 15.8], [94.3, 16.0], [94.2, 18.4], [93.4, 19.6]] as LL[] },
  lanna: { color: "#3fbf6a", ring: [[97.9, 19.2], [98.2, 20.3], [99.0, 21.2], [100.4, 20.4], [101.1, 19.6], [100.8, 17.9], [99.6, 17.6], [98.6, 17.6], [97.7, 17.8]] as LL[] },
  siam: { color: "#ffc94a", ring: [[98.6, 17.6], [99.6, 17.6], [100.8, 17.9], [101.6, 17.2], [102.2, 16.2], [102.9, 15.4], [102.9, 14.2], [102.6, 13.2], [101.4, 12.6], [100.9, 13.4], [100.5, 13.5], [100.0, 13.2], [99.95, 12.6], [99.8, 11.8], [99.5, 10.8], [99.3, 10.0], [99.9, 9.2], [100.3, 8.4], [100.4, 7.2], [101.3, 6.8], [100.6, 6.4], [100.1, 6.5], [99.6, 7.4], [98.4, 8.0], [98.6, 9.5], [99.1, 11.0], [99.4, 12.2], [99.1, 13.3], [98.5, 15.0], [98.6, 16.4], [97.7, 17.8]] as LL[] },
};
export type ZoneId = keyof typeof ZONES;

// Kingdom extents with a soft pulse; k per zone 0–1.
export const Zones = ({ k, colors = {} }: { k: Partial<Record<ZoneId, number>>; colors?: Partial<Record<ZoneId, string>> }) => {
  const { projection, s } = useMap();
  const frame = useCurrentFrame();
  return (
    <g>
      {(Object.keys(ZONES) as ZoneId[]).map((id, i) => {
        const kk = k[id] ?? 0;
        if (kk <= 0) return null;
        const color = colors[id] ?? ZONES[id].color;
        const pts = ZONES[id].ring.map((p) => projection(p)).filter(Boolean) as [number, number][];
        if (pts.length < 3) return null;
        const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
        const pulse = 0.85 + 0.15 * Math.sin(frame * 0.15 + i);
        return (
          <g key={id} opacity={kk}>
            <path d={d} fill={color} fillOpacity={0.22 * pulse} />
            <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Natural Earth rivers (`npm run rivers -- nrs-rivers 94 9 106 22`); hidden when zoomed in very close.
export const BigRivers = ({ name = "nrs-rivers" }: { name?: string }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<MultiLineString | LineString, { name: string | null; rank: number }> }>(`data/${name}.json`);
  if (!data) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  if (pxDeg > 3000) return null;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {data.rivers.features.map((f, i) => {
        const w = Math.max(1.2, (9 - f.properties.rank) * 0.5) * s * Math.min(2, Math.max(0.7, pxDeg / 300));
        return <path key={i} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.6} />;
      })}
    </g>
  );
};

// A glowing city dot; `dashed` = a disputed / proposed location (dashed ring, no fill glow).
export const CityDot = ({ at: c, color = "#ffc94a", r = 14, start = 0, end = 1e9, dashed = false }: { at: LL; color?: string; r?: number; start?: number; end?: number; dashed?: boolean }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.25 * Math.sin(frame * 0.25);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      {dashed ? (
        <circle r={r * 2 * s} fill="none" stroke={color} strokeWidth={3 * s} strokeDasharray={`${8 * s} ${6 * s}`} transform={`rotate(${frame * 1.2})`} />
      ) : (
        <circle r={r * 2.2 * pulse * s} fill={color} opacity={0.25} />
      )}
      <circle r={r * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
    </g>
  );
};

// Crossed-swords battle marker that pops at `start` and pulses.
export const BattleMark = ({ at: c, start, end = 1e9, color = RED, size = 1 }: { at: LL; start: number; end?: number; color?: string; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 8, end, end + 10], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.12 * Math.sin(frame * 0.3);
  const r = 26 * s * size;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${k * pulse})`}>
      <circle r={r * 1.8} fill={color} opacity={0.22} />
      <circle r={r} fill="rgba(8,14,26,0.86)" stroke={color} strokeWidth={3 * s} />
      <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke="#fff" strokeWidth={5 * s} strokeLinecap="round" />
    </g>
  );
};

// A text tag on the map (no pin): "(ตำแหน่งโดยประมาณ)", a source name next to its place, a river name.
export const MapTag = ({ at: c, text, start, end = 1e9, color = "#fff", size = 30, weight = 700 }: { at: LL; text: string; start: number; end?: number; color?: string; size?: number; weight?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  return (
    <text x={p[0]} y={p[1]} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={size * s} fill={color} opacity={k} stroke="rgba(8,14,26,0.85)" strokeWidth={6 * s} paintOrder="stroke">
      {text}
    </text>
  );
};

// Top bar: badge (channel or style id), chapter, year chip.
export const TopBar = ({ badge, chapter, year }: { badge: string; chapter: string; year: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{badge}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>พ.ศ. {year}</div>
    </div>
  );
};
