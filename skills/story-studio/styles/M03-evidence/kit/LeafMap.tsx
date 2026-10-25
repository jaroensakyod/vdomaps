import { geoOrthographic } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { useJson } from "../../../components/useJson";
import { C, clamp, fonts, useU } from "./Leaf";

// M03 map kit: the map incised on a bundle of leaves — coast and rivers as stylus cuts filled with soot, the sea as
// rows of cut waves, kingdom extents as hatched lacquer washes with a dotted cut edge, the march as a red lacquer
// line, cities as drilled holes, a little mountain glyph row. All places and extents are approximate.

type LL = [number, number];
const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
export const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Camera that fits a bbox into a screen box [x, y, w, h]; pass focusX/Y to <MapFrame> from `focusOf(box)`.
export const fitBox = (f: Feature, box: [number, number, number, number], k = 1, centre?: LL): Cam => {
  const coords = (f.geometry as { coordinates: number[][][] }).coordinates[0];
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const lon = centre?.[0] ?? (Math.min(...lons) + Math.max(...lons)) / 2;
  const lat = centre?.[1] ?? (Math.min(...lats) + Math.max(...lats)) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([box[2], box[3]], f as never);
  return { lon, lat, scale: p.scale() * k };
};
export const focusOf = (box: [number, number, number, number], width: number, height: number) => ({ focusX: (box[0] + box[2] / 2) / width, focusY: (box[1] + box[3] / 2) / height });

export const PL = {
  pegu: [96.48, 17.33],
  martaban: [97.6, 16.53],
  threePagodas: [98.4, 15.3],
  kanchanaburi: [99.53, 14.0],
  nongsarai: [99.96, 14.64], // Don Chedi, Suphan Buri
  phanomthuan: [99.7, 14.13], // Phanom Thuan, Kanchanaburi
  ayut: [100.566, 14.357],
} satisfies Record<string, LL>;
export const VW = {
  region: bbox([[94.5, 12.2], [102.5, 19.6]]),
  west: bbox([[97.6, 13.5], [101.0, 16.0]]),
  duel: bbox([[99.3, 13.99], [100.45, 15.09]]),
};
export const ROUTES = {
  swa1592: [[96.48, 17.33], [97.6, 16.53], [98.4, 15.3], [99.53, 14.0], [99.75, 14.38], [99.93, 14.6]] as LL[],
};
// Rough extents in the 1560s–1600s (approximate — say so).
export const ZONES = {
  burma: { color: C.lacquer, ring: [[92.3, 20.5], [93.3, 24.6], [94.6, 26.2], [97.0, 27.0], [98.6, 25.0], [98.8, 23.4], [99.4, 22.3], [99.0, 21.2], [98.2, 20.4], [97.9, 19.2], [97.7, 17.8], [98.6, 16.4], [98.5, 15.0], [99.1, 13.3], [98.9, 11.9], [98.6, 10.4], [98.0, 11.6], [97.6, 15.4], [97.2, 16.5], [95.6, 15.8], [94.3, 16.0], [94.2, 18.4], [93.4, 19.6]] as LL[] },
  siam: { color: C.soot, ring: [[98.6, 17.6], [99.6, 17.6], [100.8, 17.9], [101.6, 17.2], [102.2, 16.2], [102.9, 15.4], [102.9, 14.2], [102.6, 13.2], [101.4, 12.6], [100.9, 13.4], [100.5, 13.5], [100.0, 13.2], [99.95, 12.6], [99.8, 11.8], [99.5, 10.8], [99.3, 10.0], [99.9, 9.2], [100.3, 8.4], [100.4, 7.2], [101.3, 6.8], [100.6, 6.4], [100.1, 6.5], [99.6, 7.4], [98.4, 8.0], [98.6, 9.5], [99.1, 11.0], [99.4, 12.2], [99.1, 13.3], [98.5, 15.0], [98.6, 16.4], [97.7, 17.8]] as LL[] },
};
export type ZoneId = keyof typeof ZONES;
const MOUNTAINS: LL[] = [[98.3, 18.6], [98.6, 17.6], [98.5, 16.6], [98.7, 15.7], [98.9, 14.7], [99.2, 13.6], [99.1, 12.6], [101.7, 16.8], [101.2, 18.3]];

// A path cut into the leaf: pale lip below, soot in the groove.
export const CutPath = ({ d, w, color = C.soot, dash, opacity = 1 }: { d: string; w: number; color?: string; dash?: string; opacity?: number }) => {
  const { s } = useMap();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <path d={d} stroke={C.leafLight} strokeWidth={w * 1.1} strokeOpacity={0.7} transform={`translate(0,${1.6 * s})`} strokeDasharray={dash} />
      <path d={d} stroke={color} strokeWidth={w} strokeDasharray={dash} />
    </g>
  );
};

// Coast, sea waves and rivers. The sea is rows of small cut waves, clipped outside the land.
export const LeafLand = ({ rivers = "data/nrs-rivers.json" }: { rivers?: string }) => {
  const { path, projection, s, width, height } = useMap();
  const land = path(LAND) ?? "";
  const data = useJson<{ rivers: FeatureCollection<MultiLineString | LineString, { rank: number }> }>(rivers);
  const waves = useMemo(() => {
    const rows: string[] = [];
    const step = 26 * s;
    for (let y = 0, r = 0; y < height; y += step, r++) {
      let d = "";
      for (let x = (r % 2) * 22 * s; x < width; x += 44 * s) d += `M${x} ${y} q${7 * s} ${-7 * s} ${14 * s} 0 `;
      rows.push(d);
    }
    return rows.join(" ");
  }, [s, width, height]);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  return (
    <g>
      <defs>
        <clipPath id="m03-sea">
          <path d={`M-10 -10 H${width + 10} V${height + 10} H-10 Z ${land}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath="url(#m03-sea)">
        <rect width={width} height={height} fill="#8a7a5a" opacity={0.18} />
        <CutPath d={waves} w={2 * s} opacity={0.7} />
      </g>
      <path d={land} fill="#f3dcaa" opacity={0.28} />
      <CutPath d={land} w={5 * s} />
      {data &&
        pxDeg < 3000 &&
        data.rivers.features.map((f, i) => <CutPath key={i} d={path(f) ?? ""} w={Math.max(1.8, (9 - f.properties.rank) * 0.65) * s * Math.min(2, Math.max(0.9, pxDeg / 300))} opacity={0.9} />)}
    </g>
  );
};

// Small cut mountain glyphs along the ranges (decoration, approximate).
export const Mountains = ({ k = 1 }: { k?: number }) => {
  const { projection, s } = useMap();
  return (
    <g opacity={k}>
      {MOUNTAINS.map((m, i) => {
        const p = projection(m);
        if (!p) return null;
        const a = 16 * s;
        const d = `M${p[0] - a * 2} ${p[1] + a * 0.6} L${p[0] - a} ${p[1] - a * 0.6} L${p[0]} ${p[1] + a * 0.6} M${p[0] - a * 0.6} ${p[1] + a * 0.6} L${p[0] + a * 0.5} ${p[1] - a} L${p[0] + a * 1.6} ${p[1] + a * 0.6}`;
        return <CutPath key={i} d={d} w={2.4 * s} />;
      })}
    </g>
  );
};

// Kingdom extents: hatched wash in the side's lacquer colour + dotted cut edge. k per zone 0–1.
export const Zones = ({ k }: { k: Partial<Record<ZoneId, number>> }) => {
  const { projection, s } = useMap();
  return (
    <g>
      <defs>
        {(Object.keys(ZONES) as ZoneId[]).map((id, i) => (
          <pattern key={id} id={`m03-h-${id}`} width={14 * s} height={14 * s} patternUnits="userSpaceOnUse" patternTransform={`rotate(${i ? -35 : 35})`}>
            <line x1={0} y1={0} x2={0} y2={14 * s} stroke={ZONES[id].color} strokeWidth={2.6 * s} />
          </pattern>
        ))}
      </defs>
      {(Object.keys(ZONES) as ZoneId[]).map((id) => {
        const kk = k[id] ?? 0;
        if (kk <= 0) return null;
        const pts = ZONES[id].ring.map((p) => projection(p)).filter(Boolean) as [number, number][];
        if (pts.length < 3) return null;
        const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
        return (
          <g key={id} opacity={kk}>
            {id === "burma" && <path d={d} fill={`url(#m03-h-${id})`} opacity={0.26} />}
            <CutPath d={d} w={3 * s} color={ZONES[id].color} dash={`${1 * s} ${9 * s}`} />
          </g>
        );
      })}
    </g>
  );
};

// March line in red lacquer, drawn on from start to end, with a cut arrowhead.
export const March = ({ points, start, end, color = C.lacquer, opacity = 1 }: { points: LL[]; start: number; end: number; color?: string; opacity?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const xy = points.map((p) => projection(p)).filter(Boolean) as [number, number][];
  if (xy.length < 2 || frame < start || opacity <= 0) return null;
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = interpolate(frame, [start, end], [0, 1], clamp) * total;
  const out: [number, number][] = [xy[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / (seg[i] || 1));
    out.push([xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t]);
    left -= seg[i];
  }
  const d = `M${out.map((p) => p.join(",")).join(" L")}`;
  const [a, b] = [out[out.length - 2], out[out.length - 1]];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const L = 30 * s;
  const head = `M${b[0] - Math.cos(ang - 0.5) * L} ${b[1] - Math.sin(ang - 0.5) * L} L${b[0]} ${b[1]} L${b[0] - Math.cos(ang + 0.5) * L} ${b[1] - Math.sin(ang + 0.5) * L}`;
  return (
    <g opacity={opacity}>
      <CutPath d={d} w={9 * s} color={color} />
      <CutPath d={d} w={2 * s} color="#e1a07a" dash={`${10 * s} ${14 * s}`} opacity={0.6} />
      <CutPath d={head} w={8 * s} color={color} />
    </g>
  );
};

const show = (frame: number, start: number, end: number) => interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);

// A drilled hole for a city; `dashed` = a proposed / disputed site (a ring of small drill marks).
export const Hole = ({ at, start = 0, end = 1e9, r = 12, dashed = false, color = C.soot }: { at: LL; start?: number; end?: number; r?: number; dashed?: boolean; color?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < start || frame > end + 10) return null;
  const k = show(frame, start, end);
  const sc = interpolate(frame, [start, start + 6, start + 10], [1.8, 0.9, 1], clamp);
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${sc})`} opacity={k}>
      {dashed ? (
        <g transform={`rotate(${frame * 0.8})`}>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={Math.cos((i / 10) * Math.PI * 2) * r * 2.2 * s} cy={Math.sin((i / 10) * Math.PI * 2) * r * 2.2 * s} r={3.2 * s} fill={color} />
          ))}
        </g>
      ) : (
        <circle r={r * 2 * s} fill="none" stroke={color} strokeWidth={3 * s} />
      )}
      <circle r={r * s} cy={2 * s} fill={C.leafLight} opacity={0.7} />
      <circle r={r * s} fill="#0d0703" />
    </g>
  );
};

// Crossed blades cut in a ring: the battle.
export const BattleCut = ({ at, start, end = 1e9 }: { at: LL; start: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < start || frame > end + 10) return null;
  const k = show(frame, start, end);
  const r = 30 * s;
  const sc = interpolate(frame, [start, start + 6, start + 10], [2, 0.92, 1], clamp);
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${sc})`} opacity={k}>
      <circle r={r * 1.35} fill={C.lacquer} opacity={0.22} />
      <CutPath d={`M${-r} 0 a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`} w={3.5 * s} color={C.lacquer} />
      <CutPath d={`M${-r * 0.6} ${-r * 0.6} L${r * 0.6} ${r * 0.6} M${r * 0.6} ${-r * 0.6} L${-r * 0.6} ${r * 0.6}`} w={6 * s} />
    </g>
  );
};

// A place name cut next to its point.
export const PlaceCut = ({ at, text, start, end = 1e9, dx = 0, dy = -34, size = 40, color = C.soot, anchor = "middle", font = fonts.title }: { at: LL; text: ReactNode; start: number; end?: number; dx?: number; dy?: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; font?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < start || frame > end + 10) return null;
  const k = show(frame, start, end);
  const common = { x: p[0] + dx * s, textAnchor: anchor, fontFamily: font, fontWeight: 700, fontSize: size * s } as const;
  return (
    <g opacity={k}>
      <text {...common} y={p[1] + dy * s} fill="none" stroke="#e8c98c" strokeWidth={9 * s} strokeLinejoin="round" opacity={0.85}>
        {text}
      </text>
      <text {...common} y={p[1] + dy * s + 1.6 * s} fill={C.leafLight}>
        {text}
      </text>
      <text {...common} y={p[1] + dy * s} fill={color}>
        {text}
      </text>
    </g>
  );
};
