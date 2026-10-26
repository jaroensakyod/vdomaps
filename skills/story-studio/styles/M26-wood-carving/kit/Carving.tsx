import { loadFont } from "@remotion/google-fonts/Chonburi";
import { geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiLineString } from "geojson";
import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";

// M26 carved teak relief. Everything is ONE height drawing in grey (white = high wood, black = deep cut) run
// through one filter (`CarveDefs`): the height is raked by a low light from the top left, teak grain is generated
// and bent around the carving, deep cuts darken. Draw new shapes with `g(level)` fills inside <Carved>.
// Levels: 1 relief tops · 0.85 uncut board · 0.62 low relief · 0.3 gouged ground · 0.45 incised letters/grooves.

export const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const W = 1080;
export const H = 1920;
export const g = (v: number) => {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${c},${c},${c})`;
};
export const C = {
  ground: "#4a2a14", // gouged ground after the light
  teak: "#9a6232",
  light: "#c48a4f",
  gold: "#d9a441",
  ink: "#2b170b",
};

const topo = countries50 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const COUNTRIES = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
export const countryById = (id: string) => COUNTRIES.features.find((f) => f.id === id) as Feature<Geometry>;

export const fitProjection = ([w, s, e, n]: [number, number, number, number], box: [number, number, number, number]): GeoProjection => {
  const p = geoOrthographic().rotate([-(w + e) / 2, -(s + n) / 2]);
  p.fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] });
  return p;
};
export const pathOf = (proj: GeoProjection, f: Feature | FeatureCollection) => geoPath(proj)(f as never) ?? "";

// The carving light. `az` = light direction (225 = from the top left), `rake` = elevation in degrees.
export const CarveDefs = ({ az = 225, rake = 26 }: { az?: number; rake?: number }) => (
  <defs>
    <filter id="m26-wood" x="0" y="0" width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="hA" />
      <feGaussianBlur in="hA" stdDeviation="1.7" result="h" />
      <feGaussianBlur in="hA" stdDeviation="16" result="hb" />
      <feDiffuseLighting in="h" surfaceScale="8" diffuseConstant="1.25" lightingColor="#fff" result="L">
        <feDistantLight azimuth={az} elevation={rake} />
      </feDiffuseLighting>
      <feSpecularLighting in="h" surfaceScale="7" specularConstant="0.32" specularExponent="20" lightingColor="#ffe6bd" result="S">
        <feDistantLight azimuth={az} elevation={rake + 8} />
      </feSpecularLighting>
      {/* teak grain: long streaky noise, bent around the carving by the blurred height, cut into growth lines */}
      <feTurbulence type="fractalNoise" baseFrequency="0.0018 0.014" numOctaves={3} seed={7} result="n" />
      <feDisplacementMap in="n" in2="hb" scale="70" xChannelSelector="A" yChannelSelector="A" result="nd" />
      <feComponentTransfer in="nd" result="rings">
        <feFuncR type="table" tableValues="0.15 0.85 0.4 1 0.3 0.9 0.2 0.95 0.45" />
      </feComponentTransfer>
      <feColorMatrix in="rings" values="0.30 0 0 0 0.56  0.21 0 0 0 0.33  0.09 0 0 0 0.12  0 0 0 0 1" result="wood" />
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.35" numOctaves={1} seed={3} result="p" />
      <feColorMatrix in="p" values="0 0 0 0 0.22  0 0 0 0 0.11  0 0 0 0 0.04  0 0 0 -3.2 1.45" result="pores" />
      <feComposite in="pores" in2="wood" operator="over" result="wood2" />
      <feComposite in="wood2" in2="L" operator="arithmetic" k1="1.75" result="lit" />
      <feColorMatrix in="h" values="0 0 0 0.7 0.3  0 0 0 0.7 0.3  0 0 0 0.7 0.3  0 0 0 0 1" result="depth" />
      <feComposite in="lit" in2="depth" operator="arithmetic" k1="1" result="lit2" />
      <feComposite in="lit2" in2="S" operator="arithmetic" k2="1" k3="0.55" />
    </filter>
    {/* gouge scoops for the cut-away ground: concave dishes in rows, a little rotated */}
    <radialGradient id="m26-scoop">
      <stop offset="0" stopColor={g(0.18)} />
      <stop offset="0.75" stopColor={g(0.3)} />
      <stop offset="1" stopColor={g(0.36)} />
    </radialGradient>
    <pattern id="m26-gouge" width="66" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
      <rect width="66" height="44" fill={g(0.32)} />
      {[[0, 0], [33, 0], [66, 0], [16, 22], [49, 22], [0, 44], [33, 44], [66, 44]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="19" ry="12" fill="url(#m26-scoop)" transform={`rotate(${i % 2 ? 14 : -10} ${x} ${y})`} />
      ))}
    </pattern>
    <radialGradient id="m26-vig" cx="0.5" cy="0.46" r="0.78">
      <stop offset="0.6" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#120801" stopOpacity={0.55} />
    </radialGradient>
    <linearGradient id="m26-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6e3a4" />
      <stop offset="0.5" stopColor="#c9a04a" />
      <stop offset="1" stopColor="#6e4c18" />
    </linearGradient>
  </defs>
);

// Wrap the height drawing: everything inside is turned into lit teak.
export const Carved = ({ children }: { children: ReactNode }) => (
  <g filter="url(#m26-wood)">
    <rect width={W} height={H} fill={g(0.85)} />
    {children}
  </g>
);

// One kanok flame (Thai flame-leaf), base at 0,0 pointing up, height ~1 unit.
const KANOK = "M-0.42 0 C-0.46 -0.3 -0.2 -0.42 -0.13 -0.6 C-0.08 -0.76 -0.03 -0.9 0 -1 C0.03 -0.9 0.08 -0.76 0.13 -0.6 C0.2 -0.42 0.46 -0.3 0.42 0 Z";
const KANOK_IN = "M-0.2 -0.1 C-0.2 -0.3 -0.06 -0.4 0 -0.66 C0.06 -0.4 0.2 -0.3 0.2 -0.1 Z";

// Border: a raised band with a row of kanok flames between two beads, on all four sides.
export const KanokBorder = ({ inset = 14, band = 76 }: { inset?: number; band?: number }) => {
  const sides: { x: number; y: number; len: number; rot: number }[] = [
    { x: inset, y: inset + band, len: W - 2 * inset, rot: 0 },
    { x: W - inset - band, y: inset, len: H - 2 * inset, rot: 90 },
    { x: W - inset, y: H - inset - band, len: W - 2 * inset, rot: 180 },
    { x: inset + band, y: H - inset, len: H - 2 * inset, rot: 270 },
  ];
  const step = band * 0.8;
  return (
    <g>
      <rect x={inset} y={inset} width={W - 2 * inset} height={H - 2 * inset} fill="none" stroke={g(0.95)} strokeWidth={8} />
      <path fillRule="evenodd" d={`M${inset + 6} ${inset + 6}H${W - inset - 6}V${H - inset - 6}H${inset + 6}Z M${inset + band} ${inset + band}V${H - inset - band}H${W - inset - band}V${inset + band}Z`} fill={g(0.5)} />
      {sides.map((sd, k) => (
        <g key={k} transform={`translate(${sd.x} ${sd.y}) rotate(${sd.rot})`}>
          {Array.from({ length: Math.floor(sd.len / step) }, (_, i) => (
            <g key={i} transform={`translate(${step * (i + 0.5)} -10) scale(${band * 0.7})`}>
              <path d={KANOK} fill={g(1)} />
              <path d={KANOK_IN} fill={g(0.66)} />
              <circle cx={0} cy={-0.2} r={0.07} fill={g(1)} />
            </g>
          ))}
        </g>
      ))}
      <rect x={inset + band} y={inset + band} width={W - 2 * inset - 2 * band} height={H - 2 * inset - 2 * band} fill="none" stroke={g(1)} strokeWidth={7} />
      <rect x={inset + band + 10} y={inset + band + 10} width={W - 2 * inset - 2 * band - 20} height={H - 2 * inset - 2 * band - 20} fill="none" stroke={g(0.55)} strokeWidth={3} />
    </g>
  );
};

// Thai pointed arch (ซุ้ม) for the map panel: straight sides, ogee top with a flame finial.
export const archPath = (x: number, y: number, w: number, h: number) => {
  const top = y + w * 0.36;
  const cx = x + w / 2;
  return `M${x} ${y + h} V${top} C${x} ${top - w * 0.2} ${cx - w * 0.36} ${top - w * 0.16} ${cx - w * 0.12} ${y + w * 0.1} C${cx - w * 0.04} ${y + w * 0.05} ${cx - 6} ${y + 20} ${cx} ${y} C${cx + 6} ${y + 20} ${cx + w * 0.04} ${y + w * 0.05} ${cx + w * 0.12} ${y + w * 0.1} C${cx + w * 0.36} ${top - w * 0.16} ${x + w} ${top - w * 0.2} ${x + w} ${top} V${y + h} Z`;
};

// Carved rosette (8 raised petals, sunk centre) — a city. `k` 0→1 cuts it in.
export const Rosette = ({ x, y, r, k }: { x: number; y: number; r: number; k: number }) => {
  if (k <= 0) return null;
  const s = interpolate(k, [0, 1], [0.4, 1], clamp);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <circle r={r * 1.08} fill={g(0.42)} />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.56} rx={r * 0.26} ry={r * 0.44} fill={g(1)} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={r * 0.34} fill={g(0.95)} />
      <circle r={r * 0.17} fill={g(0.45)} />
    </g>
  );
};

// A river line, projected, as polylines with lengths — carved (grown) to fraction k.
export type Line = { pts: [number, number][]; len: number };
export const riverLines = (proj: GeoProjection, f: Feature<MultiLineString>[]): Line[] =>
  f.flatMap((x) => x.geometry.coordinates).map((cs) => {
    const pts = cs.map((c) => proj(c as [number, number]) as [number, number]);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return { pts, len };
  });
export const partial = (l: Line, k: number): { d: string; head?: [number, number]; ang: number } => {
  if (k <= 0) return { d: "", ang: 0 };
  const want = l.len * Math.min(1, k);
  let run = 0;
  const out: [number, number][] = [l.pts[0]];
  let ang = 0;
  for (let i = 1; i < l.pts.length; i++) {
    const [ax, ay] = l.pts[i - 1], [bx, by] = l.pts[i];
    const s = Math.hypot(bx - ax, by - ay);
    ang = Math.atan2(by - ay, bx - ax);
    if (run + s >= want) {
      const t = (want - run) / (s || 1);
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
      break;
    }
    out.push([bx, by]);
    run += s;
  }
  return { d: `M${out.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}`, head: out[out.length - 1], ang };
};

// V-cut groove: a wide soft shoulder and a narrow deep cut (the light then makes one wall bright, one dark).
export const Groove = ({ d, w = 9 }: { d: string; w?: number }) =>
  d ? (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={g(0.55)} strokeWidth={w * 1.6} />
      <path d={d} stroke={g(0.3)} strokeWidth={w} />
      <path d={d} stroke={g(0.12)} strokeWidth={w * 0.35} />
    </g>
  ) : null;

// The chisel at the head of a cut, and the chips it throws (drawn on top of the wood, outside the filter).
export const Chisel = ({ at, ang, frame, k }: { at?: [number, number]; ang: number; frame: number; k: number }) => {
  if (!at || k <= 0 || k >= 1) return null;
  const [x, y] = at;
  const tap = Math.abs(Math.sin(frame * 0.9)) * 6;
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const a = ang + Math.PI + (i - 3) * 0.45 + Math.sin(frame * 0.7 + i) * 0.2;
        const life = ((frame * 0.25 + i * 0.37) % 1);
        const r = 12 + life * 46;
        const cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r - Math.sin(life * Math.PI) * 18;
        return <path key={i} d={`M${cx} ${cy} l5 -3 l4 5 l-6 3 Z`} fill="#d9a56a" stroke="#6b3d17" strokeWidth={0.8} opacity={1 - life} transform={`rotate(${(frame * 23 + i * 50) % 360} ${cx} ${cy})`} />;
      })}
      <g transform={`translate(${x} ${y}) rotate(32) scale(1.5) translate(${tap} 0)`} style={{ filter: "drop-shadow(10px 16px 8px rgba(20,8,0,0.55))" }}>
        <path d="M0 -2 L10 -8 L64 -9 L64 9 L10 8 L0 2 Z" fill="#b8bcc0" stroke="#4b4f54" strokeWidth={1.2} />
        <path d="M0 -5 L64 -9 L64 -2 L0 0 Z" fill="#e9edf0" opacity={0.7} />
        <rect x={64} y={-12} width={16} height={24} rx={3} fill="#6d6f72" />
        <path d="M80 -15 L200 -19 Q214 0 200 19 L80 15 Z" fill="#5a2f14" stroke="#2b170b" strokeWidth={1.5} />
        <path d="M84 -12 L198 -15" stroke="#8b5329" strokeWidth={4} opacity={0.7} />
      </g>
    </g>
  );
};

// Gold leaf laid on a rosette (draw it after <Carved>, same x / y / r): the relief shows through.
export const GoldLeaf = ({ x, y, r, k }: { x: number; y: number; r: number; k: number }) =>
  k > 0 ? (
    <g transform={"translate(" + x + " " + y + ")"} opacity={k} style={{ mixBlendMode: "hard-light" }}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.56} rx={r * 0.27} ry={r * 0.45} fill="url(#m26-gold)" transform={"rotate(" + i * 45 + ")"} />
      ))}
      <circle r={r * 0.35} fill="url(#m26-gold)" />
    </g>
  ) : null;

// Khao mo (Thai stylised rock / mountain motif): a cluster of rounded peaks, each with a cut outline and an
// inner curl. Decorative, placed on the ranges (not a terrain model).
export const KhaoMo = ({ x, y, s = 1, k = 1 }: { x: number; y: number; s?: number; k?: number }) => {
  if (k <= 0) return null;
  const peaks = [[-34, 4, 0.8], [0, 0, 1.15], [32, 6, 0.85], [-16, 18, 0.7], [18, 20, 0.7]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={Math.min(1, k * 2)}>
      {peaks.map(([px, py, ps], i) => (
        <g key={i} transform={`translate(${px} ${py}) scale(${ps})`}>
          <path d="M-20 14 C-22 -4 -12 -22 0 -24 C12 -22 22 -4 20 14 Z" fill={g(0.6)} />
          <path d="M-16 12 C-18 -2 -10 -17 0 -19 C10 -17 18 -2 16 12 Z" fill={g(0.98)} />
          <path d="M-6 6 C-8 -4 0 -10 4 -6 C7 -3 4 2 0 1" fill="none" stroke={g(0.62)} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

// A row of small carved dots (bead-and-reel) along a board edge.
export const Beads = ({ x, y, w, step = 22 }: { x: number; y: number; w: number; step?: number }) => (
  <g>
    {Array.from({ length: Math.floor(w / step) }, (_, i) => (
      <g key={i}>
        <ellipse cx={x + step * (i + 0.5)} cy={y} rx={step * 0.32} ry={5} fill={g(1)} />
        <circle cx={x + step * (i + 0.5)} cy={y} r={1.8} fill={g(0.7)} />
      </g>
    ))}
  </g>
);

// Fade helper.
export const fade = (frame: number, a: number, b: number, d = 12) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
