import { loadFont } from "@remotion/google-fonts/Niramit";
import { geoBounds, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land10 from "world-atlas/land-10m.json";

// M27 batik: the map is made the way a batik cloth is — wax lines drawn with a canting on cream cotton, the land
// filled with wax, an indigo bath (the sea turns blue, the wax cracks and blue veins seep in), a soga-brown bath
// over everything (land turns brown, the sea deepens), then the wax is boiled off and the cream lines come back.
// The dye stages are masks: `waxA` (resists the indigo) and `waxB` (resists the soga). Everything is drawn in code.

export const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const W = 1080;
export const H = 1920;
export const C = {
  cream: "#efe3c6",
  indigo: "#1c3557",
  indigoDeep: "#0f1e33",
  soga: "#9a6a3a", // the soga dye itself (multiplied over the cloth)
  sogaLand: "#7a4a22", // soga on cream = land
  red: "#9c2b23", // mengkudu red, the one accent
  wax: "#e8c66a",
  text: "#f3e8cc",
};

const topo = land10 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Land polygons inside [w, s, e, n] only (10 m land is large; this keeps the paths short).
export const landIn = ([w, s, e, n]: [number, number, number, number]): Feature<MultiPolygon> => {
  const polys: Polygon["coordinates"][] = [];
  for (const f of LAND.features) {
    const g = f.geometry as Polygon | MultiPolygon;
    const list = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const p of list) {
      const [[a, b], [c, d]] = geoBounds({ type: "Polygon", coordinates: p });
      // skip continent-sized rings (they wrap the far side of the globe and fill the frame when clipped)
      if (c - a > 90) continue;
      if (c >= w && a <= e && d >= s && b <= n) polys.push(p);
    }
  }
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: polys } };
};

export const fitProjection = ([w, s, e, n]: [number, number, number, number], box: [number, number, number, number], clip: [number, number] = [-60, H + 60]): GeoProjection => {
  const p = geoOrthographic().rotate([-(w + e) / 2, -(s + n) / 2]);
  p.fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] });
  p.clipExtent([[-30, clip[0]], [W + 30, clip[1]]]);
  return p;
};
export const pathOf = (proj: GeoProjection, f: Feature) => geoPath(proj)(f as never) ?? "";

// Defs: cotton weave, crackle veins, the sea's wave isen-isen, the land's dot isen-isen.
export const BatikDefs = () => (
  <defs>
    <filter id="m27-cotton" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves={2} seed={4} result="a" />
      <feTurbulence type="fractalNoise" baseFrequency="0.25 0.9" numOctaves={2} seed={8} result="b" />
      <feComposite in="a" in2="b" operator="arithmetic" k2="0.5" k3="0.5" />
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 -1.3 0.75" />
    </filter>
    {/* crackle: thin random contour lines of a turbulence field — where dye ran into cracks in the wax */}
    <filter id="m27-crackle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.011" numOctaves={2} seed={17} result="t" />
      <feComponentTransfer in="t" result="v">
        <feFuncA type="table" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0" />
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={3} result="j" />
      <feDisplacementMap in="v" in2="j" scale="9" xChannelSelector="R" yChannelSelector="G" result="vd" />
      <feFlood floodColor={C.indigo} result="ink" />
      <feComposite in="ink" in2="vd" operator="in" />
    </filter>
    {(['k', 'w'] as const).map((v) => {
      const ink = v === 'k' ? '#000' : '#fff';
      return (
        <g key={v}>
          <pattern id={"m27-waves-" + v} width="64" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 15 Q16 5 32 15 T64 15" fill="none" stroke={ink} strokeWidth={3.2} />
            <circle cx={16} cy={24} r={2.1} fill={ink} />
            <circle cx={48} cy={24} r={2.1} fill={ink} />
          </pattern>
          <pattern id={"m27-dots-" + v} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx={11} cy={11} r={2.2} fill={ink} />
          </pattern>
          {/* tumpal: a row of tall triangles with an inner line and dot fill — the head band of the cloth */}
          <pattern id={"m27-tumpal-" + v} width="90" height="120" patternUnits="userSpaceOnUse">
            <path d="M4 120 L45 8 L86 120" fill="none" stroke={ink} strokeWidth={4} />
            <path d="M20 120 L45 44 L70 120" fill="none" stroke={ink} strokeWidth={3} />
            <circle cx={45} cy={92} r={4} fill={ink} />
            <circle cx={45} cy={30} r={3} fill={ink} />
          </pattern>
        </g>
      );
    })}
    <filter id="m27-bleed" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={11} />
      <feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <radialGradient id="m27-vig" cx="0.5" cy="0.5" r="0.8">
      <stop offset="0.6" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#0a0603" stopOpacity={0.4} />
    </radialGradient>
  </defs>
);

// Bath: dye rising from the bottom of the frame to level y (k 0 → 1), with a wavy surface.
export const bathPath = (k: number, t: number) => {
  const y = interpolate(k, [0, 1], [H + 60, -80]);
  const pts = Array.from({ length: 23 }, (_, i) => `${i * 50} ${(y + Math.sin(i * 0.9 + t * 0.2) * 12).toFixed(1)}`);
  return `M0 ${H + 80} L${pts.join(" L")} L${W + 20} ${H + 80} Z`;
};

// The canting: a little copper bowl with a spout on a bamboo handle (drawn at the head of the wax line).
export const Canting = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k > 0 && k < 1 ? (
    <g transform={`translate(${x} ${y}) rotate(-28)`} style={{ filter: "drop-shadow(8px 14px 6px rgba(20,10,0,0.45))" }}>
      <path d="M0 0 Q6 -16 18 -22" fill="none" stroke="#a86a32" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={30} cy={-26} rx={16} ry={11} fill="#b8743a" stroke="#5a3214" strokeWidth={1.5} />
      <ellipse cx={26} cy={-30} rx={7} ry={3.5} fill="#e7b574" opacity={0.8} />
      <path d="M44 -28 L170 -60" stroke="#c9b27a" strokeWidth={10} strokeLinecap="round" />
      <path d="M44 -28 L170 -60" stroke="#8a7440" strokeWidth={10} strokeLinecap="round" strokeDasharray="2 30" />
      <circle cx={0} cy={0} r={4} fill={C.wax} />
    </g>
  ) : null;

// A red mengkudu motif dropped onto an island: dye spreading out in a soft disc, then the cream canting lines.
export const RedDrop = ({ x, y, k, children }: { x: number; y: number; k: number; children?: ReactNode }) => {
  if (k <= 0) return null;
  const r = interpolate(k, [0, 1], [10, 62], clamp);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g filter="url(#m27-bleed)">
        <circle r={r} fill={C.red} opacity={0.9} style={{ mixBlendMode: "multiply" }} />
        <circle r={r * 0.96} fill="none" stroke="#5e130f" strokeWidth={5} opacity={0.45} />
      </g>
      <g opacity={interpolate(k, [0.5, 1], [0, 1], clamp)}>{children}</g>
    </g>
  );
};

// Clove bud in canting lines (stem, four-point head), and a nutmeg (round fruit, split, mace web).
export const Clove = () => (
  <g fill="none" stroke={C.cream} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 34 L0 -4" />
    <path d="M0 -4 L-12 -14 L0 -36 L12 -14 Z" />
    <path d="M-12 -14 L-24 -26 M12 -14 L24 -26" />
    <circle cx={0} cy={-18} r={3} fill={C.cream} />
    <path d="M0 18 L-12 8 M0 10 L12 0" />
  </g>
);
export const Nutmeg = () => (
  <g fill="none" stroke={C.cream} strokeWidth={3.4} strokeLinecap="round">
    <circle r={26} />
    <path d="M-4 -26 Q8 0 -4 26" />
    <path d="M-14 -16 Q-2 -6 -14 6 M-14 6 Q-2 14 -12 20 M10 -18 Q20 -6 12 6 M12 6 Q22 14 12 20" strokeWidth={2.4} />
    <path d="M0 -26 L6 -38" />
  </g>
);

// Crackle: thin branching cracks (random walks), where indigo ran into cracked wax. Draw masked to waxed areas.
let crackCache: string | null = null;
export const cracks = (seed = 7) => {
  if (crackCache) return crackCache;
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: string[] = [];
  const walk = (x: number, y: number, a: number, n: number, depth: number) => {
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      a += rnd() < 0.15 ? (rnd() - 0.5) * 2.2 : (rnd() - 0.5) * 0.25;
      const l = 5 + rnd() * 9;
      x += Math.cos(a) * l;
      y += Math.sin(a) * l;
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
      if (depth < 2 && rnd() < 0.09) walk(x, y, a + (rnd() < 0.5 ? 1 : -1) * (0.8 + rnd() * 0.6), Math.floor(n * 0.5), depth + 1);
    }
    out.push(d);
  };
  for (let i = 0; i < 520; i++) walk(rnd() * W, rnd() * H, rnd() * Math.PI * 2, 3 + Math.floor(rnd() * 10), 0);
  crackCache = out.join("");
  return crackCache;
};

export const fade = (frame: number, a: number, b: number, d = 12) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
