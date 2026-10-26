import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import { geoMercator, geoPath, type GeoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate, random } from "remotion";

// M23 searchlight sea: a night naval battle on a real coast. The map is almost black; you only see it where light
// falls on it — a sweeping searchlight cone, a falling star shell, a muzzle flash. Every light source draws the
// "lit" copy of the map (bright land, white surf line) through a mask, so the coast appears inside the beam.
// Light is white / ice blue; the one warm colour is the flare and fire.

export const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  sea: "#03060b",
  land: "#0b0d0f",
  coast: "#3f5a70", // unlit coast, barely there
  ice: "#cfe8ff", // searchlight / tracer
  iceDim: "#6f93b4",
  litLand: "#a3b4c4", // land under light
  surf: "#f2f9ff",
  flare: "#ffae4a", // the one warm colour
  text: "#e6f2ff",
};


export const fit = ([w, s, e, n]: [number, number, number, number], box: [number, number, number, number]): GeoProjection =>
  geoMercator()
    .fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] } as never)
    .clipExtent([[-150, -150], [1230, 2070]]); // cut the world-sized land polygons to the frame (Chrome drops huge paths)

export const Defs = () => (
  <defs>
    <filter id="m23-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="m23-bloom" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <filter id="m23-haze" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves={3} seed={8} />
      <feColorMatrix values="0 0 0 0 0.7  0 0 0 0 0.82  0 0 0 0 1  0 0 0 0.7 -0.3" />
    </filter>
    <filter id="m23-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={2} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0" />
    </filter>
    <radialGradient id="m23-cone" cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stopColor="#fff" stopOpacity={1} />
      <stop offset="1" stopColor="#fff" stopOpacity={0} />
    </radialGradient>
  </defs>
);

// A searchlight: a cone from (x, y) at `angle` degrees (0 = east, clockwise), half-width `spread`, length `len`.
export type Beam = { x: number; y: number; angle: number; spread?: number; len?: number; k?: number };
export const beamPath = ({ x, y, angle, spread = 4.5, len = 900 }: Beam) => {
  const a0 = ((angle - spread) * Math.PI) / 180;
  const a1 = ((angle + spread) * Math.PI) / 180;
  const r = len;
  return `M${x} ${y} L${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} A${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r} Z`;
};

// Flares: a point light (star shell) that lights a big circle, warm.
export type Flare = { x: number; y: number; r: number; k: number };

// The mask: white where light falls (beams, flares, flashes). The lit map is drawn through it.
// `dawn` 0..1: first light coming up from the east edge (the battle was fought at first light).
export const LightMask = ({ id, beams, flares, flashes = [], dawn = 0 }: { id: string; beams: Beam[]; flares: Flare[]; flashes?: Flare[]; dawn?: number }) => (
  <mask id={id} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1480} height={2320}>
    <rect x={-200} y={-200} width={1480} height={2320} fill="#000" />
    <linearGradient id={`${id}-dawn`} x1="1" y1="0.2" x2="0" y2="0.6">
      <stop offset="0" stopColor="#fff" stopOpacity={dawn} />
      <stop offset="0.7" stopColor="#fff" stopOpacity={dawn * 0.45} />
      <stop offset="1" stopColor="#fff" stopOpacity={0} />
    </linearGradient>
    {dawn > 0 && <rect x={-200} y={-200} width={1480} height={2320} fill={`url(#${id}-dawn)`} />}
    <defs>
      {beams.map((b, i) => (
        <radialGradient key={i} id={`${id}-b${i}`} cx={b.x} cy={b.y} r={b.len ?? 900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity={0.95 * (b.k ?? 1)} />
          <stop offset="0.75" stopColor="#fff" stopOpacity={0.6 * (b.k ?? 1)} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      ))}
      {[...flares, ...flashes].map((f, i) => (
        <radialGradient key={i} id={`${id}-f${i}`} cx={f.x} cy={f.y} r={f.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity={f.k} />
          <stop offset="0.55" stopColor="#fff" stopOpacity={f.k * 0.7} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {beams.map((b, i) => <path key={i} d={beamPath(b)} fill={`url(#${id}-b${i})`} />)}
    {[...flares, ...flashes].map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={`url(#${id}-f${i})`} />)}
  </mask>
);

// The map in the dark: land a shade above the sea, coast a faint line.
export const DarkMap = ({ path, coast, land }: { path: GeoPath; coast?: FeatureCollection<Geometry> | null; land: string }) => (
  <g>
    <path d={land} fill={C.land} />
    <path d={coast ? (path(coast) ?? "") : land} fill="none" stroke={C.coast} strokeWidth={1.1} opacity={0.6} />
  </g>
);

// The same map when light hits it: brighter land with relief speckle, a white surf line, the swell on the water.
export const LitMap = ({ path, coast, land, w, h, tint = C.ice }: { path: GeoPath; coast?: FeatureCollection<Geometry> | null; land: string; w: number; h: number; tint?: string }) => {
  const swell: ReactNode[] = [];
  for (let y = 0; y < h; y += 16) {
    const x0 = random(`sw${y}`) * 120;
    swell.push(<path key={y} d={`M${-x0} ${y} ${Array.from({ length: 14 }, (_, i) => `q40 ${-3 - random(`q${y}-${i}`) * 3} 80 0`).join(" ")}`} fill="none" stroke={tint} strokeWidth={1} opacity={0.16} />);
  }
  const d = coast ? (path(coast) ?? "") : land;
  return (
    <g>
      <rect width={w} height={h} fill="#4a6a90" />
      {swell}
      <path d={land} fill={C.litLand} />
      <rect width={w} height={h} filter="url(#m23-haze)" opacity={0.35} />
      <path d={d} fill="none" stroke={tint} strokeWidth={6} opacity={0.25} />
      <path d={d} fill="none" stroke={C.surf} strokeWidth={1.8} />
    </g>
  );
};

// The visible beams themselves: soft cones in the haze above the map (screen-blended).
export const Beams = ({ beams }: { beams: Beam[] }) => (
  <g style={{ mixBlendMode: "screen" }}>
    <defs>
      {beams.map((b, i) => (
        <radialGradient key={i} id={`m23-bv${i}`} cx={b.x} cy={b.y} r={b.len ?? 900} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.ice} stopOpacity={0.85 * (b.k ?? 1)} />
          <stop offset="0.6" stopColor={C.ice} stopOpacity={0.3 * (b.k ?? 1)} />
          <stop offset="1" stopColor={C.ice} stopOpacity={0} />
        </radialGradient>
      ))}
    </defs>
    {beams.map((b, i) => (
      <g key={i}>
        <path d={beamPath({ ...b, spread: (b.spread ?? 4.5) * 1.5 })} fill={`url(#m23-bv${i})`} opacity={0.5} filter="url(#m23-bloom)" />
        <path d={beamPath(b)} fill={`url(#m23-bv${i})`} />
        <circle cx={b.x} cy={b.y} r={7} fill="#fff" filter="url(#m23-glow)" opacity={b.k ?? 1} />
      </g>
    ))}
  </g>
);

// A star shell: the burning point, its smoke trail, its warm light.
export const StarShell = ({ x, y, k, frame }: { x: number; y: number; k: number; frame: number }) => {
  if (k <= 0) return null;
  const fl = 0.85 + 0.15 * Math.sin(frame * 1.7) * Math.sin(frame * 0.6);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <circle cx={x} cy={y} r={420} fill={C.flare} opacity={0.12 * k * fl} filter="url(#m23-bloom)" />
      <circle cx={x} cy={y} r={120} fill={C.flare} opacity={0.3 * k * fl} filter="url(#m23-bloom)" />
      <path d={`M${x} ${y} q-6 -60 4 -130`} fill="none" stroke="#9aa6b2" strokeWidth={5} opacity={0.25 * k} filter="url(#m23-glow)" />
      <circle cx={x} cy={y} r={9} fill="#fff4dc" opacity={k} filter="url(#m23-glow)" />
      <circle cx={x} cy={y} r={20} fill={C.flare} opacity={0.6 * k * fl} filter="url(#m23-bloom)" />
    </g>
  );
};

// Tracers: a stream of short bright dashes from a to b along a slight arc, moving with the frame.
export const Tracer = ({ a, b, frame, k = 1, bend = 0.12, warm = false }: { a: [number, number]; b: [number, number]; frame: number; k?: number; bend?: number; warm?: boolean }) => {
  if (k <= 0) return null;
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend;
  const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const col = warm ? C.flare : C.ice;
  return (
    <g opacity={k} style={{ mixBlendMode: "screen" }}>
      <path d={d} fill="none" stroke={col} strokeWidth={1} opacity={0.18} />
      <path d={d} fill="none" stroke={col} strokeWidth={3.2} strokeDasharray="22 70" strokeDashoffset={-frame * 26} strokeLinecap="round" filter="url(#m23-glow)" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={1.4} strokeDasharray="10 82" strokeDashoffset={-frame * 26 - 30} strokeLinecap="round" />
    </g>
  );
};

// A burst on impact: warm flash + white core + a few sparks.
export const Impact = ({ x, y, t }: { x: number; y: number; t: number }) => {
  if (t < 0 || t > 1) return null;
  const k = 1 - t;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <circle cx={x} cy={y} r={30 + t * 120} fill={C.flare} opacity={0.5 * k} filter="url(#m23-bloom)" />
      <circle cx={x} cy={y} r={8 + t * 10} fill="#fff" opacity={k} filter="url(#m23-glow)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return <path key={i} d={`M${x + Math.cos(a) * t * 20} ${y + Math.sin(a) * t * 20} L${x + Math.cos(a) * (12 + t * 70)} ${y + Math.sin(a) * (12 + t * 70)}`} stroke={C.flare} strokeWidth={2} opacity={k} />;
      })}
    </g>
  );
};

// Ship silhouette markers, side view, pointed at `heading` (deg, 0 = east). `kind` sets the outline.
export const Ship = ({ x, y, kind, heading = 0, s = 1, lit = 0, sunk = 0 }: { x: number; y: number; kind: "cruiser" | "sloop" | "coastal" | "torpedo"; heading?: number; s?: number; lit?: number; sunk?: number }) => {
  const flipX = Math.cos((heading * Math.PI) / 180) < 0 ? -1 : 1;
  const body: Record<string, string> = {
    cruiser: "M-44 0 L40 0 L48 -6 L-48 -6 Z M-30 -6 v-6 h14 v6 M-10 -6 v-14 h12 v14 M6 -6 v-8 h4 v-10 h3 v10 h4 v8 M22 -6 v-6 h14 v6",
    sloop: "M-32 0 L30 0 L36 -5 L-34 -5 Z M-14 -5 v-10 h10 v10 M2 -5 v-6 h3 v-9 h3 v9 h3 v6 M16 -5 v-5 h10 v5",
    coastal: "M-34 0 L32 0 L36 -7 L-36 -7 Z M-24 -7 v-9 h14 v9 M-6 -7 v-16 h10 v16 M10 -7 v-9 h14 v9",
    torpedo: "M-26 0 L24 0 L30 -4 L-26 -4 Z M-10 -4 v-7 h8 v7 M4 -4 v-10 h3 v10 M12 -4 v-4 h6 v4",
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flipX} ${s}) rotate(${sunk * 24})`} opacity={1 - sunk * 0.55}>
      <path d={body[kind]} fill="#000" stroke={lit > 0.3 ? C.surf : C.iceDim} strokeWidth={1.4 / s} strokeLinejoin="round" />
      <path d="M-40 3 q10 3 20 0 q10 -3 20 0 q10 3 20 0 q10 -3 20 0" fill="none" stroke={C.iceDim} strokeWidth={1 / s} opacity={0.6} />
    </g>
  );
};

// A label in the dark: small caps-like Thai, ice white, with a short leader.
export const Tag = ({ x, y, text, sub, k = 1, anchor = "start", warm = false }: { x: number; y: number; text: string; sub?: string; k?: number; anchor?: "start" | "end" | "middle"; warm?: boolean }) => (
  <g opacity={k} fontFamily={font} textAnchor={anchor}>
    <text x={x} y={y} fontSize={30} fontWeight={700} fill={warm ? C.flare : C.text} stroke={C.sea} strokeWidth={6} paintOrder="stroke">
      {text}
    </text>
    {sub && (
      <text x={x} y={y + 30} fontSize={22} fontWeight={400} fill={C.iceDim} stroke={C.sea} strokeWidth={5} paintOrder="stroke" letterSpacing={1}>
        {sub}
      </text>
    )}
  </g>
);

// Dotted track of a ship (drawn on with k).
export const Track = ({ pts, k }: { pts: [number, number][]; k: number }) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * k;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / seg[i]);
    d += ` L${pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t} ${pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t}`;
    left -= seg[i];
  }
  return <path d={d} fill="none" stroke={C.iceDim} strokeWidth={2} strokeDasharray="3 9" strokeLinecap="round" opacity={0.9} />;
};

export const along = (pts: [number, number][], k: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, k));
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const t = left / seg[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
};

export const ramp = (frame: number, a: number, b: number, c: number, d: number) => interpolate(frame, [a, b, c, d], [0, 1, 1, 0], clamp);
export { geoPath };

// Land fill from OSM coastline ways (natural=coastline, land on the left of the way). Ways are chained end to
// start; chains that close are islands; an open chain (the mainland) is closed through `closeVia` — lon/lat points
// round the land side, outside the frame. Returns an SVG path in screen space (no spherical winding issues).
export const landFromCoast = (coast: FeatureCollection<Geometry> | null, proj: GeoProjection, closeVia: [number, number][]) => {
  if (!coast) return "";
  const key = (p: number[]) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
  const ways = coast.features.map((f) => (f.geometry as { coordinates: number[][] }).coordinates);
  const byStart = new Map<string, number[][]>();
  for (const w of ways) if (key(w[0]) !== key(w[w.length - 1])) byStart.set(key(w[0]), w);
  const ends = new Set([...byStart.values()].map((w) => key(w[w.length - 1])));
  const used = new Set<number[][]>();
  const rings: number[][][] = ways.filter((w) => key(w[0]) === key(w[w.length - 1]));
  const chain = (w0: number[][]) => {
    const out = [...w0];
    used.add(w0);
    let w = w0;
    for (;;) {
      const nx = byStart.get(key(w[w.length - 1]));
      if (!nx || used.has(nx)) break;
      out.push(...nx.slice(1));
      used.add(nx);
      w = nx;
    }
    return out;
  };
  for (const w of byStart.values()) if (!ends.has(key(w[0]))) rings.push([...chain(w), ...closeVia]); // mainland
  for (const w of byStart.values()) if (!used.has(w)) rings.push(chain(w)); // islands made of several ways
  return rings
    .map((r) => r.map((p, i) => { const q = proj(p as [number, number]); return q ? `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}` : ""; }).join("") + "Z")
    .join(" ");
};
