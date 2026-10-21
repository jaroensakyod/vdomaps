import { geoArea } from "d3-geo";
import type { Feature, FeatureCollection, MultiLineString } from "geojson";
import type { ReactNode } from "react";
import { random, useCurrentFrame } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land10 from "world-atlas/land-10m.json";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { C, fonts } from "./theme";

const landTopo = land10 as unknown as Topology<{ land: GeometryCollection }>;
const land = feature(landTopo, landTopo.objects.land);
export const landFeatures = { ...land, features: land.features.filter((f) => geoArea(f) < 2 * Math.PI) };

type Rivers = FeatureCollection<MultiLineString, { name: string }>;
const MAIN = ["แม่น้ำเจ้าพระยา", "แม่น้ำลพบุรี", "แม่น้ำป่าสัก"];

// Rivers drawn as the reference look: a brown bank band, the water, and a light centre line.
// Width grows with zoom (exaggerated, so the river reads as a river at every scale).
const RiverSet = ({ data, boost = 1, glow }: { data: Rivers; boost?: number; glow?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const pxPerDeg = (projection.scale() * Math.PI) / 180;
  const widthFor = (name: string) => {
    const main = MAIN.includes(name);
    const w = Math.min(Math.max(pxPerDeg * 0.0035, 5 * s), 54 * s) * boost;
    return main ? w : w * 0.62;
  };
  const ds = data.features.map((f) => ({ name: f.properties.name, d: path(f) ?? "", w: widthFor(f.properties.name) }));
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {ds.map((r) => <path key={`b${r.name}`} d={r.d} stroke={C.bank} strokeWidth={r.w * 1.9} opacity={0.75} />)}
      {ds.map((r) => <path key={`w${r.name}`} d={r.d} stroke={C.water} strokeWidth={r.w} />)}
      {ds.map((r) => <path key={`h${r.name}`} d={r.d} stroke={C.waterHi} strokeWidth={r.w * 0.22} opacity={0.8} />)}
      {glow && ds.filter((r) => glow[r.name]).map((r) => <path key={`g${r.name}`} d={r.d} stroke="#fff7c2" strokeWidth={r.w * 0.6} opacity={glow[r.name]} />)}
    </g>
  );
};

// Hand-picked hill country (decoration only): Tenasserim range on the west border and the northern hills.
const HILLS: [number, number][] = Array.from({ length: 260 }, (_, i) => [92 + random(`hx${i}`) * 14, 8 + random(`hy${i}`) * 16] as [number, number]).filter(
  ([lon, lat]) => (lon > 97.6 && lon < 99.4 && lat > 10.5 && lat < 17) || (lat > 17.2 && lon > 97.6 && lon < 101.8) || (lon > 101.2 && lon < 102.4 && lat > 14.2 && lat < 17),
);

const Hills = () => {
  const { projection, s, width, height } = useMap();
  return (
    <g stroke="#a48b66" strokeWidth={2.2 * s} fill="none" strokeLinejoin="round" opacity={0.55}>
      {HILLS.map((pt, i) => {
        const p = projection(pt);
        if (!p || p[0] < -40 || p[1] < -40 || p[0] > width + 40 || p[1] > height + 40) return null;
        const h = 14 * s;
        return <path key={i} d={`M${p[0] - h} ${p[1]} L${p[0]} ${p[1] - h} L${p[0] + h} ${p[1]} M${p[0] + h * 0.4} ${p[1] - h * 0.6} L${p[0] + h * 1.2} ${p[1] + h * 0.1}`} />;
      })}
    </g>
  );
};

// Flood around a point: a wobbly blob of water, radius in degrees, grown by k (0 → 1).
export const Flood = ({ at, radius, k, squash = 1 }: { at: [number, number]; radius: number; k: number; squash?: number }) => {
  const frame = useCurrentFrame();
  const { projection } = useMap();
  if (k <= 0) return null;
  const c = projection(at);
  if (!c) return null;
  const pxPerDeg = (projection.scale() * Math.PI) / 180;
  const r = radius * pxPerDeg * k;
  const pts = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const w = 1 + 0.08 * Math.sin(a * 5 + random(`f${i % 7}`) * 3 + frame * 0.03) + 0.05 * Math.sin(a * 11);
    return [c[0] + Math.cos(a) * r * w, c[1] + Math.sin(a) * r * w * squash];
  });
  const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
  return (
    <g>
      <path d={d} fill={C.flood} opacity={0.62} />
      <path d={d} fill="none" stroke={C.water} strokeWidth={4} opacity={0.5} strokeDasharray="10 8" />
    </g>
  );
};

// Base map: paper sea, land with coast, hills, plain rivers, island waterways. `children` go between the rivers
// and the labels (floods should be passed via `under` so they sit beneath the rivers).
export const ThMap = ({ under, children, glow, island = true, night = 0 }: { under?: ReactNode; children?: ReactNode; glow?: Record<string, number>; island?: boolean; night?: number }) => {
  const { path, s, width, height } = useMap();
  const plain = useJson<Rivers>("data/th-plain.json");
  const isle = useJson<Rivers>("data/th-island.json");
  const landD = path(landFeatures) ?? "";
  return (
    <g>
      <defs>
        <clipPath id="thland">
          <path d={landD} />
        </clipPath>
      </defs>
      <rect width={width} height={height} fill={C.paper} />
      <path d={landD} fill="none" stroke={C.coast} strokeWidth={10 * s} strokeOpacity={0.12} />
      <path d={landD} fill={C.land} stroke={C.coast} strokeWidth={2.4 * s} />
      <Hills />
      {under}
      {plain && <RiverSet data={plain} glow={glow} />}
      {island && isle && <RiverSet data={isle} boost={0.55} glow={glow} />}
      {children}
      {night > 0 && <rect width={width} height={height} fill="#1b2350" opacity={night * 0.5} style={{ mixBlendMode: "multiply" }} />}
    </g>
  );
};

// Town dot + Thai name with a paper halo. size 1 = normal.
export const Place = ({ at, name, color = C.ink, k = 1, dx = 14, dy = 0, size = 1, anchor = "start" }: { at: [number, number]; name: string; color?: string; k?: number; dx?: number; dy?: number; size?: number; anchor?: "start" | "end" | "middle" }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)} transform={`translate(${p[0]},${p[1]})`}>
      <circle r={7 * s * size * k} fill={color} stroke={C.card} strokeWidth={2.5 * s} />
      <text x={dx * s * (anchor === "end" ? -1 : 1)} y={dy * s + 9 * s * size} textAnchor={anchor} fontFamily={fonts.body} fontWeight={700} fontSize={30 * s * size} fill={C.ink} stroke={C.land} strokeWidth={7 * s} paintOrder="stroke">
        {name}
      </text>
    </g>
  );
};

// Small label on a river (italic-ish blue).
export const WaterLabel = ({ at, name, k = 1, rotate = 0 }: { at: [number, number]; name: string; k?: number; rotate?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  return (
    <text transform={`translate(${p[0]},${p[1]}) rotate(${rotate})`} opacity={k} textAnchor="middle" fontFamily={fonts.body} fontWeight={500} fontSize={26 * s} fill="#2c6680" stroke={C.land} strokeWidth={6 * s} paintOrder="stroke">
      {name}
    </text>
  );
};

// Place an icon (any SVG element taking x, y) at a lon/lat.
export const At = ({ at, children }: { at: [number, number]; children: (x: number, y: number, s: number) => ReactNode }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  return p ? <>{children(p[0], p[1], s)}</> : null;
};

// Fit a feature into the part of the vertical frame above the lower card (fractions of width/height),
// by shifting the camera centre so the feature sits in that box instead of the screen centre.
export const fitArea = (object: Parameters<typeof camForFeature>[0], width: number, height: number, box: [number, number, number, number] = [0.05, 0.19, 0.95, 0.64]): Cam => {
  const [x0, y0, x1, y1] = box;
  const c = camForFeature(object, (x1 - x0) * width, (y1 - y0) * height, 0);
  const p = projectionFor(c, width, height);
  const dx = width / 2 - ((x0 + x1) / 2) * width;
  const dy = height / 2 - ((y0 + y1) / 2) * height;
  const [lon, lat] = p.invert!([width / 2 + dx, height / 2 + dy])!;
  return { lon, lat, scale: c.scale };
};

// Tint one country (world-atlas 50m id, e.g. "104" Myanmar) — k = opacity factor.
import countries50 from "world-atlas/countries-50m.json";
const ctopo = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const cfeat = feature(ctopo, ctopo.objects.countries);
export const CountryTint = ({ id, color, k = 1 }: { id: string; color: string; k?: number }) => {
  const { path, s } = useMap();
  const f = cfeat.features.find((x) => String(x.id) === id);
  if (!f || k <= 0) return null;
  return <path d={path(f) ?? ""} fill={color} fillOpacity={0.22 * k} stroke={color} strokeOpacity={0.6 * k} strokeWidth={3 * s} strokeDasharray={`${10 * s} ${6 * s}`} />;
};
