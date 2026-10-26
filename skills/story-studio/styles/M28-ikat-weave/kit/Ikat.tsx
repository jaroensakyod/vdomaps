import { loadFont } from "@remotion/google-fonts/Krub";
import { geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiLineString } from "geojson";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import { hash, rasterise } from "./grid";

// M28 ikat (mudmee): the map is woven. Every weft pick is one row of the thread grid; along it the colour
// changes where the yarn was tied and dyed before weaving, so edges step from row to row and bleed sideways
// (one horizontal-only blur on the woven layer). Countries are dye grounds with diamond / hook motifs, rivers are
// pale thread, cities are woven yellow diamonds. Above the fell line is cloth, below it bare warp, the reed
// beating each pick in and a shuttle crossing — the cloth grows row by row.

export const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const W = 1080;
export const H = 1920;
export const CW = 6; // warp spacing (px)
export const PH = 6; // pick height (px)
export const C = {
  ground: "#1d1a2e", // indigo-black (thread shadows, text)
  natural: "#5a3a6a", // ground for the neighbours
  head: "#8e1b26", // head band ground
  lac: "#9e1f2a", // lac red
  lacDark: "#6e1420",
  yellow: "#e0a72c",
  cream: "#f1e6cc",
  indigo: "#2b3d73",
  indigoLight: "#4a62a3",
  warp: "#cfc4ae",
  loom: "#120c08",
};

const topo = countries50 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const COUNTRIES = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const byId = (id: string) => COUNTRIES.features.find((f) => f.id === id) as Feature<Geometry>;

export const fitProjection = ([w, s, e, n]: [number, number, number, number], box: [number, number, number, number]): GeoProjection => {
  const p = geoOrthographic().rotate([-(w + e) / 2, -(s + n) / 2]);
  p.fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] });
  return p;
};

// Ground classes, each a dyed ground with its own tied motif.
type Ground = "laos" | "thai" | "other" | "band" | "stripe";
export type Run = { y: number; x: number; w: number; fill: string };
export type Woven = { runs: Run[]; rows: number; y0: number };

const diamond = (u: number, v: number, P: number) => Math.abs((((u % P) + P) % P) - P / 2) + Math.abs((((v % P) + P) % P) - P / 2);

// Colour of one thread cell (u = warp column, v = pick row) for a ground.
const cellColour = (g: Ground, u: number, v: number, r: number): string => {
  if (g === "laos") {
    const d = diamond(u, v, 18);
    if (d >= 8 && d < 9) return C.cream; // diamond lattice
    if (d < 1.5) return C.yellow; // centre dot
    if (d >= 4 && d < 5 && ((u + v) & 1)) return C.lacDark; // inner ring, broken (ikat speckle)
    return r < 0.06 ? C.lacDark : C.lac;
  }
  if (g === "thai") {
    const d = diamond(u + 9, v, 18);
    if (d >= 8 && d < 9) return C.indigoLight;
    // hooks (ขอ): little spurs off the diamond's corners
    const uu = (((u + 9) % 18) + 18) % 18, vv = ((v % 18) + 18) % 18;
    if ((uu === 9 && (vv === 2 || vv === 3)) || (vv === 9 && (uu === 2 || uu === 3))) return C.yellow;
    if (d < 1.5) return C.cream;
    return C.indigo;
  }
  if (g === "other") {
    const d = diamond(u, v + 6, 12);
    if (d < 1) return C.indigo;
    if (d >= 5 && d < 5.6 && (u & 1)) return "#73508a";
    return C.natural;
  }
  if (g === "stripe") {
    // the hook band (หมี่ขอ) in the head stripe
    const d = diamond(u, v, 10);
    if (d >= 4 && d < 5) return C.yellow;
    if (d < 1.5) return C.cream;
    return C.indigo;
  }
  return C.head;
};

const cache = new Map<string, Woven>();

// Weave the whole cloth once: from y0 to y1 (screen px), countries + rivers + cities onto the thread grid.
export const useWoven = (key: string, proj: GeoProjection, y0: number, y1: number, rivers: { f: Feature<MultiLineString>; w: number }[], cities: [number, number][], bands: { from: number; to: number; g: Ground }[]): Woven => {
  const hit = cache.get(key);
  if (hit) return hit;
  const cols = Math.ceil(W / CW);
  const rows = Math.ceil((y1 - y0) / PH);
  const path = geoPath(proj);
  const h = rows * PH;
  const lao = rasterise([path(byId("418")) ?? ""], W, h, cols, rows, undefined, 0, -y0);
  const tha = rasterise([path(byId("764")) ?? ""], W, h, cols, rows, undefined, 0, -y0);
  const riv = rivers.map((r) => rasterise([path(r.f) ?? ""], W, h, cols, rows, r.w, 0, -y0));
  const cityCells = cities.map((c) => {
    const [x, y] = proj(c) as [number, number];
    return [x / CW, (y - y0) / PH];
  });
  const runs: Run[] = [];
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * PH;
    // ikat misregistration: each pick slides a little, so edges step and motifs wobble
    const drift = Math.round(Math.sin(r * 0.19) * 1.2 + (hash(r, 1, 3) - 0.5) * 1.6);
    const tone = (hash(r, 2, 4) - 0.5) * 0.12;
    const band = bands.find((b) => y >= b.from && y < b.to);
    let cur = "";
    let start = 0;
    const push = (end: number) => {
      if (cur) runs.push({ y, x: start * CW, w: (end - start) * CW, fill: cur });
    };
    for (let c = 0; c <= cols; c++) {
      let fill = "";
      if (c < cols) {
        const cc = Math.max(0, Math.min(cols - 1, c + drift));
        const i = r * cols + cc;
        const u = c + drift, v = r;
        if (band) fill = cellColour(band.g, u, v, hash(c, r, 5));
        else {
          const cityHit = cityCells.find(([cx, cy]) => Math.abs(cc - cx) + Math.abs(r - cy) < 5.5);
          if (cityHit) {
            const d = Math.abs(cc - cityHit[0]) + Math.abs(r - cityHit[1]);
            fill = d < 1.6 ? C.lac : d < 3.2 ? C.cream : C.yellow;
          } else if (riv.some((g) => g.v[i] > 0.42)) fill = r % 2 ? C.cream : "#e6dbc0";
          else if (lao.v[i] > 0.5) fill = cellColour("laos", u, v, hash(c, r, 5));
          else if (tha.v[i] > 0.5) fill = cellColour("thai", u, v, hash(c, r, 5));
          else fill = cellColour("other", u, v, hash(c, r, 5));
        }
        if (tone !== 0 && fill === C.lac && tone > 0.04) fill = "#a8262f";
        if (fill === C.indigo && tone < -0.04) fill = "#27386a";
      }
      if (fill !== cur) {
        push(c);
        cur = fill;
        start = c;
      }
    }
  }
  const out = { runs, rows, y0 };
  cache.set(key, out);
  return out;
};

// Defs: sideways bleed (ikat), thread relief (each weft pick a rounded thread, warp crossing over every other cell).
export const IkatDefs = () => (
  <defs>
    <filter id="m28-bleed" x="-2%" y="0" width="104%" height="100%">
      <feGaussianBlur stdDeviation="3.2 0.2" />
    </filter>
    <linearGradient id="m28-pick" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity={0.45} />
      <stop offset="0.35" stopColor="#fff" stopOpacity={0.18} />
      <stop offset="0.6" stopColor="#fff" stopOpacity={0.05} />
      <stop offset="1" stopColor="#000" stopOpacity={0.5} />
    </linearGradient>
    <linearGradient id="m28-warpG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#000" stopOpacity={0.5} />
      <stop offset="0.5" stopColor="#fff" stopOpacity={0.12} />
      <stop offset="1" stopColor="#000" stopOpacity={0.5} />
    </linearGradient>
    <pattern id="m28-weave" width={CW * 2} height={PH * 2} patternUnits="userSpaceOnUse">
      <rect width={CW * 2} height={PH * 2} fill="url(#m28-pick)" />
      <rect x={0} y={0} width={CW} height={PH} fill="url(#m28-pick)" />
      {/* the warp shows where it passes over the weft (plain weave: alternate cells) */}
      <rect x={CW + 1} y={0} width={CW - 2} height={PH} fill="url(#m28-warpG)" opacity={0.7} />
      <rect x={1} y={PH} width={CW - 2} height={PH} fill="url(#m28-warpG)" opacity={0.7} />
    </pattern>
    <filter id="m28-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6 0.08" numOctaves={2} seed={5} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 -1.1 0.55" />
    </filter>
    <linearGradient id="m28-bamboo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f0dca4" />
      <stop offset="0.35" stopColor="#e2c47e" />
      <stop offset="0.8" stopColor="#c09a52" />
      <stop offset="1" stopColor="#8a6a30" />
    </linearGradient>
    <linearGradient id="m28-wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6b4426" />
      <stop offset="0.45" stopColor="#4a2c17" />
      <stop offset="1" stopColor="#24150a" />
    </linearGradient>
  </defs>
);

// The woven cloth above `fell` (screen y): runs batched by colour, the bleed filter, the thread relief on top.
export const Cloth = ({ woven, fell }: { woven: Woven; fell: number }) => {
  const by = new Map<string, string[]>();
  for (const r of woven.runs) {
    if (r.y + PH > fell) continue;
    const d = `M${r.x} ${r.y}h${r.w}v${PH}h${-r.w}Z`;
    const a = by.get(r.fill);
    if (a) a.push(d);
    else by.set(r.fill, [d]);
  }
  const top = woven.y0;
  const hgt = Math.max(0, fell - top);
  return (
    <g>
      <g filter="url(#m28-bleed)">
        {[...by].map(([fill, ds]) => <path key={fill} d={ds.join("")} fill={fill} />)}
      </g>
      <rect x={0} y={top} width={W} height={hgt} fill="url(#m28-weave)" />
      <rect x={0} y={top} width={W} height={hgt} filter="url(#m28-fibre)" opacity={0.35} />
    </g>
  );
};

// The loom below the fell: bare warp in two sheds, the reed beating in, the shuttle crossing with its weft.
export const Loom = ({ fell, frame, bottom = H }: { fell: number; frame: number; bottom?: number }) => {
  const beat = Math.pow(Math.abs(Math.sin(frame * 0.42)), 3); // 1 = reed against the cloth
  const reedY = fell + 14 + (1 - beat) * 46;
  const pass = (frame % 16) / 16;
  const dir = Math.floor(frame / 16) % 2 ? -1 : 1;
  const sx = dir > 0 ? -140 + pass * (W + 280) : W + 140 - pass * (W + 280);
  const cols = Math.ceil(W / CW);
  const warp = Array.from({ length: cols }, (_, i) => {
    const x = i * CW + CW / 2;
    const up = i % 2 === 0;
    const xb = 540 + (x - 540) * 0.94;
    return `M${x} ${fell}L${x + (up ? 0.5 : -0.5)} ${reedY}L${xb} ${bottom}`;
  }).join("");
  return (
    <g>
      <rect x={0} y={fell} width={W} height={bottom - fell} fill={C.loom} />
      <path d={warp} stroke={C.warp} strokeWidth={1.6} opacity={0.75} fill="none" />
      {/* the shed: a soft dark gap where the shuttle runs */}
      <rect x={0} y={fell + 2} width={W} height={10} fill="#000" opacity={0.35} />
      {/* weft trailing from the cloth edge to the shuttle */}
      <path d={dir > 0 ? `M0 ${fell + 7} L${sx} ${fell + 7}` : `M${W} ${fell + 7} L${sx} ${fell + 7}`} stroke={C.lac} strokeWidth={3} opacity={0.9} />
      {/* reed: a wooden frame with fine teeth */}
      <g style={{ filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.6))" }}>
        <rect x={-10} y={reedY} width={W + 20} height={18} fill="url(#m28-wood)" />
        <rect x={-10} y={reedY + 18} width={W + 20} height={46} fill="#000" opacity={0.25} />
        <path d={Array.from({ length: cols }, (_, i) => `M${i * CW} ${reedY + 18}v46`).join("")} stroke="#a89a82" strokeWidth={0.8} opacity={0.7} />
        <rect x={-10} y={reedY + 64} width={W + 20} height={22} fill="url(#m28-wood)" />
      </g>
      {/* shuttle: boat-shaped wood with a bobbin of red yarn */}
      <g transform={`translate(${sx} ${fell + 8})`} style={{ filter: "drop-shadow(4px 8px 5px rgba(0,0,0,0.6))" }}>
        <path d="M-110 0 Q-60 -16 0 -16 Q60 -16 110 0 Q60 16 0 16 Q-60 16 -110 0 Z" fill="#8a5a2e" stroke="#2b170b" strokeWidth={2} />
        <path d="M-90 -2 Q-50 -11 0 -11 Q50 -11 90 -2" stroke="#c48a4f" strokeWidth={3} fill="none" opacity={0.8} />
        <rect x={-34} y={-7} width={68} height={14} rx={6} fill={C.lac} />
        <path d="M-30 -4 H30 M-30 0 H30 M-30 4 H30" stroke="#6e1420" strokeWidth={1.2} />
      </g>
    </g>
  );
};

// A cloth tag (plain cream weave, sewn on) carrying a place name.
export const Tag = ({ x, y, text, sub, k, hot }: { x: number; y: number; text: string; sub?: string; k: number; hot?: boolean }) => {
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - k) * 10}px)`, opacity: k, background: hot ? C.yellow : C.cream, padding: "6px 18px 6px", boxShadow: "3px 6px 10px rgba(0,0,0,0.5)", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 4px)", outline: `2px dashed ${hot ? C.lacDark : C.indigo}`, outlineOffset: -6, textAlign: "center", whiteSpace: "nowrap", fontFamily: font }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.ground, lineHeight: 1.2 }}>{text}</div>
      {sub && <div style={{ fontSize: 20, fontWeight: 600, color: C.lacDark }}>{sub}</div>}
    </div>
  );
};

// The breast beam of the loom: a thick bamboo pole with nodes (the caption sits on it).
export const Bamboo = ({ y, h }: { y: number; h: number }) => (
  <g style={{ filter: "drop-shadow(0 -6px 10px rgba(0,0,0,0.55))" }}>
    <rect x={0} y={y} width={W} height={h} fill="url(#m28-bamboo)" />
    <rect x={0} y={y} width={W} height={h} filter="url(#m28-fibre)" opacity={0.25} />
    {[150, 520, 900].map((x) => (
      <g key={x}>
        <rect x={x - 5} y={y} width={10} height={h} fill="#9c7a3a" opacity={0.55} />
        <rect x={x + 5} y={y} width={3} height={h} fill="#fff3c8" opacity={0.5} />
      </g>
    ))}
    <rect x={0} y={y + 6} width={W} height={5} fill="#fff6d6" opacity={0.45} />
  </g>
);

export const fade = (frame: number, a: number, b: number, d = 12) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
