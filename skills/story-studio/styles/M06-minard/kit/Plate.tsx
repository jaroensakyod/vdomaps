import { loadFont } from "@remotion/google-fonts/Taviraj";
import { geoOrthographic } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";
import { useJson } from "../../../components/useJson";
import type { ArmyPt } from "./Army";
import { RETREAT, TEMPS } from "./data1812";

// M06 engraved statistical plate: an ivory sheet printed from a copper plate — plate mark, ruled double border, a
// title cartouche with flourishes, land shaded with engraved hatching, the sea water-lined, rivers as fine double
// cuts, little forest marks, an engraved temperature graph under the map. The army band itself is printed flat
// (kit/Army.tsx). Everything is drawn from data; the layout is this pack's own, not a copy of any plate.

const normal = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
loadFont("italic", { weights: ["400", "600"], subsets: ["thai", "latin"] });
export const font = normal;

export const C = {
  paper: "#f8f4ea", // white ivory sheet
  ink: "#21140b", // copperplate brown-black
  tan: "#c9a46c", // the advance band (flat tint)
  sepia: "#8a5530", // sepia ink: hatching, border band, small text
  red: "#a8432a", // one muted vermilion accent: the burning city, the coldest day
};
const GROUND = "#66290f"; // bistre ground of the title block
const LIGHT = "#e3c9a0"; // sepia reserved on the dark ground
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Screen boxes [x, y, w, h] for the plate on each format.
export const usePlate = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  return vertical
    ? { vertical, s, width, height, title: [70, 58, 940, 440], map: [70, 520, 940, 540], graph: [70, 1104, 940, 270], caption: [70, 1420, 940, 230] }
    : { vertical, s, width, height, title: [60, 60, 640, 590], map: [740, 60, 1120, 640], graph: [740, 724, 1120, 210], caption: [60, 680, 640, 260] };
};
export type Box = [number, number, number, number];

// Camera fitting [w, s, e, n] into a screen box (pass `focusOf(box)` to <MapFrame>).
export const fitBox = ([w, so, e, n]: [number, number, number, number], box: number[], k = 1): Cam => {
  const lon = (w + e) / 2;
  const lat = (so + n) / 2;
  const f = region([[w, so], [w, n], [e, n], [e, so]]);
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([box[2], box[3]], f);
  return { lon, lat, scale: p.scale() * k };
};
export const focusOf = (box: number[], width: number, height: number) => ({ focusX: (box[0] + box[2] / 2) / width, focusY: (box[1] + box[3] / 2) / height });

// The sheet: ivory paper with soft foxing, the plate mark pressed in, a ruled double border.
export const Sheet = () => {
  const { width, height, s } = usePlate();
  const m = 26 * s;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="m06-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={21} />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.16 -0.05" />
        </filter>
        <filter id="m06-fibre" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={1} seed={5} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.15  0 0 0 0.35 -0.08" />
        </filter>
        <radialGradient id="m06-age" cx="0.5" cy="0.45" r="0.8">
          <stop offset="0.6" stopColor="#f8f4ea" stopOpacity={0} />
          <stop offset="1" stopColor="#9c8f74" stopOpacity={0.18} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={C.paper} />
      <rect width={width} height={height} filter="url(#m06-paper)" />
      <rect width={width} height={height} filter="url(#m06-fibre)" />
      <rect width={width} height={height} fill="url(#m06-age)" />
      {/* plate mark: a pressed rectangle, light on one side, shadow on the other */}
      <rect x={m} y={m} width={width - 2 * m} height={height - 2 * m} fill="none" stroke="#fff8e6" strokeWidth={3 * s} opacity={0.8} transform={`translate(${1.5 * s},${1.5 * s})`} />
      <rect x={m} y={m} width={width - 2 * m} height={height - 2 * m} fill="none" stroke="#8a7350" strokeWidth={2 * s} opacity={0.55} />
      {/* engraved border band: dense diagonal hatching between two heavy rules */}
      <defs>
        <pattern id="m06-band" width={4 * s} height={4 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} x2={0} y1={0} y2={4 * s} stroke={C.sepia} strokeWidth={1.6 * s} />
        </pattern>
      </defs>
      <path fillRule="evenodd" d={`M${m + 12 * s} ${m + 12 * s} H${width - m - 12 * s} V${height - m - 12 * s} H${m + 12 * s} Z M${m + 34 * s} ${m + 34 * s} V${height - m - 34 * s} H${width - m - 34 * s} V${m + 34 * s} Z`} fill="url(#m06-band)" />
      <rect x={m + 12 * s} y={m + 12 * s} width={width - 2 * m - 24 * s} height={height - 2 * m - 24 * s} fill="none" stroke={C.ink} strokeWidth={3 * s} />
      <rect x={m + 34 * s} y={m + 34 * s} width={width - 2 * m - 68 * s} height={height - 2 * m - 68 * s} fill="none" stroke={C.ink} strokeWidth={2 * s} />
    </svg>
  );
};

// Title cartouche: double ruled frame with scrolled corners, kicker, title, sub-title; children hold the live figure.
export const Cartouche = ({ box, kicker, title, sub, children }: { box: number[]; kicker: string; title: string; sub: string; children?: ReactNode }) => {
  const { s, vertical } = usePlate();
  const [x, y, w, h] = box;
  const r = 26 * s;
  const scroll = (cx: number, cy: number, sx: number, sy: number, i: number) => (
    <path key={i} d={`M${cx} ${cy + sy * r * 1.6} q0 ${-sy * r * 1.6} ${sx * r * 1.6} ${-sy * r * 1.6} M${cx + sx * r * 0.4} ${cy + sy * r * 0.4} c${sx * r * 0.6} ${-sy * r * 0.1} ${sx * r * 0.7} ${sy * r * 0.5} ${sx * r * 0.2} ${sy * r * 0.6} c${-sx * r * 0.4} ${sy * r * 0.1} ${-sx * r * 0.5} ${-sy * r * 0.4} ${-sx * r * 0.1} ${-sy * r * 0.5}`} fill="none" stroke={C.ink} strokeWidth={1.6 * s} />
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <pattern id="m06-ground" width={3.4 * s} height={3.4 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
            <line x1={0} x2={3.4 * s} y1={1.7 * s} y2={1.7 * s} stroke={C.paper} strokeWidth={0.7 * s} />
          </pattern>
        </defs>
        {/* engraved dark ground: the title is reserved in paper white on a ruled black field */}
        <rect x={r + 7 * s} y={r * 0.6 + 7 * s} width={w - 2 * r - 14 * s} height={h - 1.2 * r - 14 * s} fill={GROUND} />
        <rect x={r + 7 * s} y={r * 0.6 + 7 * s} width={w - 2 * r - 14 * s} height={h - 1.2 * r - 14 * s} fill="url(#m06-ground)" opacity={0.28} />
        <rect x={r} y={r * 0.6} width={w - 2 * r} height={h - 1.2 * r} fill="none" stroke={C.ink} strokeWidth={2.2 * s} />
        <rect x={r + 7 * s} y={r * 0.6 + 7 * s} width={w - 2 * r - 14 * s} height={h - 1.2 * r - 14 * s} fill="none" stroke={C.ink} strokeWidth={0.8 * s} />
        {[[r, r * 0.6, -1, -1], [w - r, r * 0.6, 1, -1], [r, h - r * 0.6, -1, 1], [w - r, h - r * 0.6, 1, 1]].map(([cx, cy, sx, sy], i) => scroll(cx, cy, sx, sy, i))}
        {/* a thin laurel of short engraved strokes along the top rule */}
        {Array.from({ length: 18 }, (_, i) => {
          const px = w / 2 + (i - 8.5) * 16 * s;
          return <path key={i} d={`M${px} ${r * 0.6} q${6 * s} ${-9 * s} ${12 * s} ${-2 * s}`} fill="none" stroke={C.ink} strokeWidth={1.1 * s} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: r + 30 * s, right: r + 30 * s, top: r + 20 * s, textAlign: "center", fontFamily: font, color: C.paper }}>
        <div style={{ fontSize: 24 * s, letterSpacing: 6 * s, color: LIGHT, fontWeight: 600 }}>{kicker}</div>
        <div style={{ fontSize: (vertical ? 50 : 40) * s, fontWeight: 700, lineHeight: 1.3, marginTop: 4 * s }}>{title}</div>
        <div style={{ fontSize: 26 * s, fontStyle: "italic", color: LIGHT, marginTop: 2 * s }}>{sub}</div>
        <div style={{ height: 1.5 * s, background: C.paper, margin: `${12 * s}px auto ${4 * s}px`, width: "62%" }} />
        <div style={{ height: 0.8 * s, background: C.paper, margin: `0 auto`, width: "40%" }} />
        {children}
      </div>
    </div>
  );
};

// The live figure in the cartouche: tag, headline and a big plate numeral; each new one wipes in left to right.
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string; color?: string };
export const Figure = ({ heads }: { heads: Head[] }) => {
  const frame = useCurrentFrame();
  const { s, vertical } = usePlate();
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  const wipe = interpolate(frame, [h.f, h.f + 14], [0, 100], clamp);
  return (
    <div style={{ marginTop: 10 * s, clipPath: `inset(0 ${100 - wipe}% 0 0)`, fontFamily: font, color: C.paper }}>
      <div style={{ fontSize: 26 * s, fontStyle: "italic", color: LIGHT }}>{h.tag}</div>
      <div style={{ fontSize: (vertical ? 40 : 38) * s, fontWeight: 600, lineHeight: 1.3 }}>{h.head}</div>
      {h.stat && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 14 * s }}>
          <span style={{ fontSize: (vertical ? 64 : 86) * s, fontWeight: 700, lineHeight: 1.15, color: h.color === C.red ? "#ec8a68" : C.paper }}>{h.stat}</span>
          {h.label && <span style={{ fontSize: 28 * s, fontStyle: "italic" }}>{h.label}</span>}
        </div>
      )}
    </div>
  );
};

// Neatline round the map with degree ticks and longitude figures (inside the map's <svg>).
export const Neatline = ({ box }: { box: number[] }) => {
  const { projection, s } = useMap();
  const [x, y, w, h] = box;
  const ticks: ReactNode[] = [];
  for (let lon = 10; lon <= 50; lon++) {
    const p = projection([lon, 54.5]);
    if (!p || p[0] < x || p[0] > x + w) continue;
    const big = lon % 2 === 0;
    ticks.push(<line key={`t${lon}`} x1={p[0]} x2={p[0]} y1={y} y2={y + (big ? 12 : 7) * s} />, <line key={`b${lon}`} x1={p[0]} x2={p[0]} y1={y + h} y2={y + h - (big ? 12 : 7) * s} />);
    if (big && p[0] > x + 30 * s && p[0] < x + w - 30 * s)
      ticks.push(
        <text key={`l${lon}`} x={p[0]} y={y + h + 24 * s} textAnchor="middle" fontFamily={font} fontStyle="italic" fontSize={18 * s} fill={C.sepia} stroke="none">
          {lon}°
        </text>,
      );
  }
  return (
    <g stroke={C.ink} strokeWidth={1 * s}>
      <rect x={x} y={y} width={w} height={h} fill="none" strokeWidth={2 * s} />
      <rect x={x - 6 * s} y={y - 6 * s} width={w + 12 * s} height={h + 12 * s} fill="none" strokeWidth={0.8 * s} />
      {ticks}
    </g>
  );
};

// Engraved land: patchy horizontal hatching for relief, water-lined sea along the coast, rivers as fine double
// lines (named ones in heavier ink), and small forest marks. Draw inside a clip to the map box.
export const EngravedLand = ({ rivers = "data/eu-rivers.json", forests = [22, 52, 40, 58] as [number, number, number, number], hi = {} as Record<string, number> }) => {
  const { path, projection, s, width, height } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string; rank: number }>; lakes?: FeatureCollection }>(rivers);
  const land = path(LAND) ?? "";
  const trees = useMemo(() => Array.from({ length: 70 }, (_, i) => [forests[0] + random(`tx${i}`) * (forests[2] - forests[0]), forests[1] + random(`ty${i}`) * (forests[3] - forests[1]), random(`ts${i}`)] as [number, number, number]), [forests]);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  return (
    <g>
      <defs>
        <pattern id="m06-hatch" width={8 * s} height={4.2 * s} patternUnits="userSpaceOnUse">
          <line x1={0} x2={8 * s} y1={2.1 * s} y2={2.1 * s} stroke={C.sepia} strokeWidth={0.9 * s} />
        </pattern>
        <pattern id="m06-cross" width={6 * s} height={6 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
          <line x1={0} x2={6 * s} y1={3 * s} y2={3 * s} stroke={C.sepia} strokeWidth={0.9 * s} />
        </pattern>
        <filter id="m06-relief" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={12} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -3.2 2.1" />
        </filter>
        <mask id="m06-relief-mask">
          <rect width={width} height={height} fill="#fff" filter="url(#m06-relief)" />
        </mask>
        <clipPath id="m06-sea">
          <path d={`M-10 -10 H${width + 10} V${height + 10} H-10 Z ${land}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      {/* relief hatching, patchy */}
      <path d={land} fill="url(#m06-hatch)" opacity={0.62} />
      <path d={land} fill="url(#m06-cross)" mask="url(#m06-relief-mask)" opacity={0.6} />
      {/* water-lining: rings of the coast, fainter outwards */}
      <g clipPath="url(#m06-sea)" fill="none">
        {[7, 6, 5, 4, 3, 2, 1].map((i) => (
          <g key={i}>
            <path d={land} stroke={C.ink} strokeWidth={i * 11 * s} opacity={0.55 - i * 0.05} />
            <path d={land} stroke={C.paper} strokeWidth={i * 11 * s - 1.6 * s} />
          </g>
        ))}
      </g>
      <path d={land} fill="none" stroke={C.ink} strokeWidth={1.8 * s} />
      {data?.lakes?.features.map((f, i) => <path key={`k${i}`} d={path(f as Feature) ?? ""} fill={C.paper} stroke={C.ink} strokeWidth={1 * s} />)}
      {data?.rivers.features.map((f, i) => {
        const k = hi[f.properties.name] ?? 0;
        const w = Math.max(1.4, (10 - f.properties.rank) * 0.5) * s * Math.min(1.6, Math.max(0.8, pxDeg / 250));
        const d = path(f) ?? "";
        return (
          <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke={C.ink} strokeWidth={w + 1.8 * s} />
            <path d={d} stroke={C.paper} strokeWidth={w} />
            {k > 0 && <path d={d} stroke={C.ink} strokeWidth={(w + 3 * s) * k} />}
          </g>
        );
      })}
      {trees.map(([lon, lat, r], i) => {
        const p = projection([lon, lat]);
        if (!p) return null;
        const a = (5 + r * 4) * s;
        return (
          <g key={`f${i}`} transform={`translate(${p[0]},${p[1]})`} stroke={C.sepia} strokeWidth={0.9 * s} fill="none" opacity={0.85}>
            <path d={`M0 ${a} V${a * 1.7}`} />
            <path d={`M${-a} ${a} Q${-a} ${-a} 0 ${-a} Q${a} ${-a} ${a} ${a} Z`} fill={C.paper} />
            <path d={`M${-a * 0.5} ${a * 0.2} L${a * 0.3} ${-a * 0.5} M${-a * 0.4} ${a * 0.8} L${a * 0.6} ${-a * 0.1}`} />
          </g>
        );
      })}
    </g>
  );
};

// City: a small ring and an engraved name (italic for towns, upright small capitals for the target).
export const Town = ({ at, text, k, dy = -18, size = 1, color = C.ink, big = false }: { at: [number, number]; text: string; k: number; dy?: number; size?: number; color?: string; big?: boolean }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  return (
    <g opacity={k}>
      <circle cx={p[0]} cy={p[1]} r={(big ? 8 : 5) * s} fill={C.paper} stroke={color} strokeWidth={1.6 * s} />
      {big && <circle cx={p[0]} cy={p[1]} r={3 * s} fill={color} />}
      <text x={p[0]} y={p[1] + dy * s} textAnchor="middle" fontFamily={font} fontStyle={big ? "normal" : "italic"} fontWeight={big ? 700 : 600} fontSize={(big ? 38 : 32) * s * size} fill={color} stroke={C.paper} strokeWidth={7 * s} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
    </g>
  );
};

// The burning city as engraved rays round it (no glow): short radiating strokes that flicker in length.
export const Burning = ({ at, k }: { at: [number, number]; k: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  return (
    <g opacity={k} stroke={C.red} strokeWidth={1.6 * s} strokeLinecap="round">
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r0 = 16 * s;
        const r1 = (30 + 16 * random(`b${i}-${Math.floor(frame / 3)}`)) * s * k;
        return <line key={i} x1={p[0] + Math.cos(a) * r0} y1={p[1] + Math.sin(a) * r0} x2={p[0] + Math.cos(a) * (r0 + r1)} y2={p[1] + Math.sin(a) * (r0 + r1)} />;
      })}
    </g>
  );
};

// Engraved snow: small six-point stars drifting down the map.
export const Snow = ({ k, box, n = 60 }: { k: number; box: number[]; n?: number }) => {
  const frame = useCurrentFrame();
  const { s } = useMap();
  if (k <= 0) return null;
  const [x, y, w, h] = box;
  return (
    <g opacity={k} stroke={C.ink} strokeWidth={1 * s} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const sy = y + ((random(`sy${i}`) * h + frame * (0.8 + random(`sp${i}`)) * 1.6) % h);
        const sx = x + ((random(`sx${i}`) * w + Math.sin(frame * 0.04 + i) * 8 * s) % w);
        const a = (3 + random(`sr${i}`) * 3) * s;
        return <path key={i} d={`M${sx - a} ${sy} H${sx + a} M${sx - a / 2} ${sy - a * 0.87} L${sx + a / 2} ${sy + a * 0.87} M${sx + a / 2} ${sy - a * 0.87} L${sx - a / 2} ${sy + a * 0.87}`} />;
      })}
    </g>
  );
};

const latAt = (lon: number) => {
  for (let i = 0; i < RETREAT.length - 1; i++) {
    const [a, b] = [RETREAT[i], RETREAT[i + 1]];
    if (lon <= a[0] && lon >= b[0]) return a[1] + ((b[1] - a[1]) * (a[0] - lon)) / (a[0] - b[0] || 1);
  }
  return RETREAT[RETREAT.length - 1][1];
};

// The engraved temperature graph under the map: ruled scale 0 … −40 °C, the line drawn west with the retreat to
// `upto`, fine drop lines from the retreat band down to each reading, dates in italic. `hot` rings −37°.
export const TempGraph = ({ k, upto, box, hot = 0 }: { k: number; upto: number; box: number[]; hot?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const [x, y, w, h] = box;
  const X = (lon: number) => projection([lon, 54.4])?.[0] ?? 0;
  const top = y + 56 * s;
  const Y = (t: number) => top + (-t / 40) * (h - 80 * s);
  const shown = TEMPS.filter((p) => p[0] >= upto);
  const nxt = TEMPS.find((p) => p[0] < upto);
  const last = shown[shown.length - 1];
  const tip: [number, number] | null = nxt && last ? [upto, last[1] + ((nxt[1] - last[1]) * (last[0] - upto)) / (last[0] - nxt[0])] : null;
  const pts = [...shown.map((p) => [p[0], p[1]] as [number, number]), ...(tip ? [tip] : [])];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join(" ");
  const TH: Record<string, string> = { "18 Oct": "18 ต.ค.", "9 Nov": "9 พ.ย.", "14 Nov": "14 พ.ย.", "28 Nov": "28 พ.ย.", "6 Dec": "6 ธ.ค." };
  return (
    <g opacity={k} fontFamily={font}>
      <defs>
        <pattern id="m06-cold" width={5 * s} height={5 * s} patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
          <line x1={0} x2={5 * s} y1={2.5 * s} y2={2.5 * s} stroke={C.sepia} strokeWidth={1.4 * s} />
        </pattern>
      </defs>
      <text x={x + w / 2} y={y + 24 * s} textAnchor="middle" fontSize={26 * s} fontStyle="italic" fill={C.ink}>
        อุณหภูมิระหว่างถอยทัพ (องศาเซลเซียส) · ตามแผนภาพของ Minard
      </text>
      <line x1={x + w * 0.2} x2={x + w * 0.8} y1={y + 36 * s} y2={y + 36 * s} stroke={C.ink} strokeWidth={0.8 * s} />
      {[0, -10, -20, -30, -40].map((t) => (
        <g key={t}>
          <line x1={x} x2={x + w} y1={Y(t)} y2={Y(t)} stroke={C.sepia} strokeWidth={(t === 0 ? 1.4 : 0.7) * s} />
          <text x={x + w - 6 * s} y={Y(t) - 5 * s} textAnchor="end" fontSize={18 * s} fontStyle="italic" fill={C.sepia}>
            {t === 0 ? "0°" : `−${-t}°`}
          </text>
        </g>
      ))}
      {shown.map((p) => {
        const by = projection([p[0], latAt(p[0])])?.[1] ?? 0;
        return <line key={`v${p[0]}`} x1={X(p[0])} x2={X(p[0])} y1={by + 8 * s} y2={Y(p[1])} stroke={C.ink} strokeWidth={0.7 * s} strokeDasharray={`${2 * s} ${3 * s}`} />;
      })}
      {/* the cold below zero, engraved: the area between 0° and the line is hatched */}
      {pts.length > 1 && <path d={`${d} L${X(pts[pts.length - 1][0])},${Y(0)} L${X(pts[0][0])},${Y(0)} Z`} fill="url(#m06-cold)" opacity={0.75} />}
      <path d={d} fill="none" stroke={C.ink} strokeWidth={2.6 * s} strokeLinejoin="round" />
      {shown.map((p) => (
        <g key={p[0]}>
          <circle cx={X(p[0])} cy={Y(p[1])} r={3.5 * s} fill={C.ink} />
          {TH[p[2]] && (
            <text x={X(p[0])} y={Y(p[1]) + 26 * s} textAnchor="middle" fontSize={20 * s} fontStyle="italic" fill={C.ink} stroke={C.paper} strokeWidth={5 * s} paintOrder="stroke">
              {`${p[1] === 0 ? "0" : `−${-p[1]}`}° ${TH[p[2]]}`}
            </text>
          )}
        </g>
      ))}
      {hot > 0 && (
        <g transform={`translate(${X(26.7)},${Y(-37)})`} opacity={hot}>
          <circle r={16 * s} fill="none" stroke={C.red} strokeWidth={2 * s} />
          <circle r={21 * s} fill="none" stroke={C.red} strokeWidth={0.8 * s} />
          <text x={28 * s} y={-14 * s} fontSize={30 * s} fontWeight={700} fill={C.red}>
            −37°
          </text>
        </g>
      )}
    </g>
  );
};

// Legend line under the cartouche: a sample of each band with what it means.
export const Legend = ({ k }: { k: number }) => {
  const { s } = usePlate();
  const item = (color: string, text: string) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 * s, marginRight: 26 * s }}>
      <svg width={70 * s} height={22 * s}>
        <path d={`M0 ${4 * s} L${70 * s} ${8 * s} L${70 * s} ${14 * s} L0 ${18 * s} Z`} fill={color} stroke={C.ink} strokeWidth={1 * s} />
      </svg>
      {text}
    </span>
  );
  const { vertical } = usePlate();
  return <div style={{ opacity: k, fontFamily: font, fontStyle: "italic", fontSize: (vertical ? 24 : 19) * s, whiteSpace: "nowrap", color: C.ink, marginTop: 8 * s }}>{item(C.tan, "ขาไป")}{item(C.ink, "ขากลับ")}<span>ความกว้างแถบ = จำนวนทหาร</span></div>;
};

// Caption set in the plate's type: ink on paper between two fine rules.
// The caption sits in a flat tan tint panel (a second litho stone) with a double rule — always there, text changes.
export const TintPanel = () => {
  const { s, caption } = usePlate();
  const [x, y, w, h] = caption;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: C.tan, border: `${2.4 * s}px solid ${C.ink}`, outline: `${0.8 * s}px solid ${C.ink}`, outlineOffset: `${5 * s}px`, backgroundImage: `repeating-linear-gradient(0deg, rgba(33,20,11,0.08) 0 ${1 * s}px, transparent ${1 * s}px ${4 * s}px)` }} />
  );
};
export const PlateCaption = ({ text, start, len }: { text: string; start: number; len: number }) => {
  const frame = useCurrentFrame();
  const { s, vertical, caption } = usePlate();
  if (frame < start || frame >= start + len) return null;
  const o = interpolate(frame, [start, start + 6, start + len - 4, start + len], [0, 1, 1, 0], clamp);
  const [x, y, w, h] = caption;
  return (
    <div style={{ position: "absolute", left: x + 30 * s, width: w - 60 * s, top: y, height: h, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: o, fontFamily: font, color: C.ink, fontSize: (vertical ? 52 : 44) * s, fontWeight: 600, lineHeight: 1.45 }}>
      {text}
    </div>
  );
};

// Route progress helpers: [frame, lon] keys → band progress / head longitude.
const lens = (pts: ArmyPt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
export const kAt = (pts: ArmyPt[], lon: number) => {
  const l = lens(pts);
  const total = l.reduce((a, b) => a + b, 0);
  const east = pts[pts.length - 1][0] > pts[0][0];
  let acc = 0;
  for (let i = 0; i < l.length; i++) {
    const [a, b] = [pts[i][0], pts[i + 1][0]];
    if (east ? lon <= b : lon >= b) return (acc + l[i] * Math.max(0, Math.min(1, (lon - a) / (b - a || 1)))) / total;
    acc += l[i];
  }
  return 1;
};
export const headAt = (keys: [number, number][], pts: ArmyPt[], frame: number) => {
  const lon = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);
  return frame < keys[0][0] ? 0 : kAt(pts, lon);
};
export const lonAt = (keys: [number, number][], frame: number) => interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);
