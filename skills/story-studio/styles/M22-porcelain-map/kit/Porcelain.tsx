import { loadFont } from "@remotion/google-fonts/Charm";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";

// M22 porcelain map: the map is painted in cobalt under a clear glaze on a white plate. One plate, top-down, on a
// polished rosewood stand: an iron-brown lip, a wave border on the rim, a ring of cloud-collar scrolls on the cavetto, the map
// in the well — land in pale cobalt wash, coast in a dark brushed line, sea in ripple strokes, places as tiny
// painted motifs. A wobble filter makes every cobalt line look brushed and pooled; crackle and a fixed window
// highlight sit on top of the glaze, so they stay still while the plate turns.

export const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  wood: "#4a2216",
  woodDeep: "#160805",
  glaze: "#f6f7f3",
  cobalt: "#1d3f8f", // dark heaped cobalt
  wash: "#6f8fcb", // diluted wash
  pale: "#b9c9e6", // thin wash
  iron: "#7a4a22", // brown iron lip
  text: "#16326f",
};

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
export const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Map projection that fits [w, s, e, n] into a circle of radius rr around 0,0.
export const wellProjection = ([w, s, e, n]: [number, number, number, number], rr: number): GeoProjection =>
  geoMercator().fitExtent(
    [[-rr, -rr], [rr, rr]],
    { type: "MultiPoint", coordinates: [[w, s], [e, s], [e, n], [w, n], [(w + e) / 2, s], [(w + e) / 2, n]] } as never,
  );

export const Defs = () => (
  <defs>
    {/* brushed cobalt: displaced edges and uneven density, as cobalt pools and spreads under the glaze */}
    <filter id="m22-brush" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={7} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation="0.7" result="soft" />
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={3} seed={19} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.35" result="a" />
      <feComposite in="soft" in2="a" operator="arithmetic" k1="0.5" k2="0.62" result="mot" />
      <feComposite in="mot" in2="soft" operator="in" />
    </filter>
    <filter id="m22-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.32" numOctaves={3} seed={2} result="a" />
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.05" numOctaves={2} seed={3} result="b" />
      <feBlend in="a" in2="b" mode="screen" />
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.04  0 0 0 0 0.02  0 0 0 1.1 -0.45" />
    </filter>
    <filter id="m22-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
    <filter id="m22-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
  </defs>
);

// Polished rosewood stand with a soft overhead light: long grain, a sheen band, the white plate on dark wood.
export const Rosewood = ({ w, h }: { w: number; h: number }) => (
  <g>
    <defs>
      <radialGradient id="m22-light" cx="0.45" cy="0.38" r="0.85">
        <stop offset="0" stopColor="#6e3524" />
        <stop offset="0.55" stopColor={C.wood} />
        <stop offset="1" stopColor={C.woodDeep} />
      </radialGradient>
    </defs>
    <rect width={w} height={h} fill="url(#m22-light)" />
    <rect width={w} height={h} filter="url(#m22-grain)" opacity={0.7} />
    <rect x={-200} y={h * 0.12} width={w + 400} height={h * 0.1} fill="#ffd9c0" opacity={0.06} transform={`rotate(-8 ${w / 2} ${h / 2})`} />
  </g>
);

// A cobalt group: everything inside gets the brushed / pooled look.
export const Cobalt = ({ children, opacity = 1 }: { children: ReactNode; opacity?: number }) => (
  <g filter="url(#m22-brush)" opacity={opacity}>
    {children}
  </g>
);

// Wave border: rows of overlapping scallops round the rim between r0 and r1.
export const WaveBand = ({ r0, r1 }: { r0: number; r1: number }) => {
  const n = 64;
  const rm = (r0 + r1) / 2;
  const items: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    const s = ((2 * Math.PI * rm) / n) * 0.62;
    items.push(
      <g key={i} transform={`rotate(${a}) translate(0 ${-rm})`}>
        {[1, 0.66, 0.33].map((k, j) => (
          <path key={j} d={`M${-s * k} ${s * 0.45} A${s * k} ${s * k} 0 0 1 ${s * k} ${s * 0.45}`} fill="none" stroke={C.cobalt} strokeWidth={j === 0 ? 3.2 : 1.8} />
        ))}
        <circle cx={0} cy={s * 0.25} r={1.8} fill={C.cobalt} />
      </g>,
    );
  }
  return (
    <g>
      <circle r={r1} fill="none" stroke={C.cobalt} strokeWidth={3} />
      <circle r={r0} fill="none" stroke={C.cobalt} strokeWidth={3} />
      <path d={`M0 ${-r1} A${r1} ${r1} 0 1 1 0 ${r1} A${r1} ${r1} 0 1 1 0 ${-r1} M0 ${-r0} A${r0} ${r0} 0 1 0 0 ${r0} A${r0} ${r0} 0 1 0 0 ${-r0}`} fill={C.pale} opacity={0.55} fillRule="evenodd" />
      {items}
    </g>
  );
};

// Cloud-collar scrolls round the cavetto: n lobed clouds, outlined dark, filled with wash.
export const CloudBand = ({ r0, r1, n = 12 }: { r0: number; r1: number; n?: number }) => {
  const rm = (r0 + r1) / 2;
  const h = (r1 - r0) * 0.42;
  const w = ((2 * Math.PI * rm) / n) * 0.4;
  const cloud = `M${-w} ${h * 0.4} C${-w * 1.3} ${-h * 0.2} ${-w * 0.6} ${-h * 0.9} ${-w * 0.25} ${-h * 0.35} C${-w * 0.2} ${-h * 1.2} ${w * 0.2} ${-h * 1.2} ${w * 0.25} ${-h * 0.35} C${w * 0.6} ${-h * 0.9} ${w * 1.3} ${-h * 0.2} ${w} ${h * 0.4} C${w * 0.5} ${h * 0.15} ${w * 0.25} ${h * 0.9} 0 ${h * 0.55} C${-w * 0.25} ${h * 0.9} ${-w * 0.5} ${h * 0.15} ${-w} ${h * 0.4} Z`;
  return (
    <g>
      <circle r={r1} fill="none" stroke={C.cobalt} strokeWidth={2.2} />
      <circle r={r1 - 7} fill="none" stroke={C.cobalt} strokeWidth={1.2} />
      <circle r={r0} fill="none" stroke={C.cobalt} strokeWidth={2.2} />
      <circle r={r0 + 7} fill="none" stroke={C.cobalt} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`rotate(${(i / n) * 360}) translate(0 ${-rm})`}>
          <path d={cloud} fill={C.wash} opacity={0.7} />
          <path d={cloud} fill="none" stroke={C.cobalt} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={`M${-w * 0.45} ${h * 0.15} q${w * 0.45} ${-h * 0.5} ${w * 0.9} 0`} fill="none" stroke={C.cobalt} strokeWidth={1.6} />
          <circle cx={0} cy={-h * 0.15} r={h * 0.12} fill="none" stroke={C.cobalt} strokeWidth={1.6} />
          {/* a small trefoil between clouds */}
          <g transform={`rotate(${180 / n} 0 ${rm}) `}>
            <circle cx={0} cy={0} r={3} fill={C.cobalt} />
          </g>
        </g>
      ))}
    </g>
  );
};

// Ripple strokes for the sea in the well: short curved strokes on staggered rows, clipped to the sea.
export const Ripples = ({ rr, seed = 1 }: { rr: number; seed?: number }) => {
  const out: ReactNode[] = [];
  const step = 34;
  for (let y = -rr; y < rr; y += step) {
    const row = Math.round((y + rr) / step);
    for (let x = -rr + (row % 2) * 30; x < rr; x += 60) {
      const j = random(`${seed}-${x}-${y}`);
      const len = 18 + j * 10;
      out.push(<path key={`${x},${y}`} d={`M${x - len} ${y} q${len * 0.5} ${-8} ${len} 0 q${len * 0.5} ${8} ${len} 0`} fill="none" stroke={C.wash} strokeWidth={2} strokeLinecap="round" />);
    }
  }
  return <g>{out}</g>;
};

// Mountains as painted peak motifs (three strokes and a wash).
export const Peaks = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-30 10 L-12 -16 L0 -2 L12 -22 L32 10 Z" fill={C.wash} opacity={0.55} />
    <path d="M-30 10 L-12 -16 L0 -2 L12 -22 L32 10" fill="none" stroke={C.cobalt} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M-12 -16 L-8 4 M12 -22 L8 6" fill="none" stroke={C.cobalt} strokeWidth={1.4} />
  </g>
);

// Place motifs, painted small: kiln (bottle kiln with smoke), pagoda, prang, flower.
export const Motif = ({ kind, x, y, s = 1 }: { kind: "kiln" | "pagoda" | "prang" | "flower"; x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {kind === "kiln" && (
      <g>
        <path d="M-18 14 C-22 -2 -10 -10 -6 -18 L6 -18 C10 -10 22 -2 18 14 Z" fill={C.wash} stroke={C.cobalt} strokeWidth={2.6} />
        <path d="M-6 14 a6 7 0 0 1 12 0" fill={C.cobalt} />
        <path d="M0 -20 c-8 -8 6 -12 -2 -22 c-6 -8 8 -10 4 -18" fill="none" stroke={C.cobalt} strokeWidth={2} strokeLinecap="round" />
      </g>
    )}
    {kind === "pagoda" && (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${-20 + i * 3} ${12 - i * 11} q${20 - i * 3} ${-8} ${40 - i * 6} 0`} fill="none" stroke={C.cobalt} strokeWidth={2.4} />
            <rect x={-12 + i * 2.4} y={2 - i * 11} width={24 - i * 4.8} height={10} fill={C.wash} stroke={C.cobalt} strokeWidth={1.6} />
          </g>
        ))}
        <path d="M0 -34 V-48" stroke={C.cobalt} strokeWidth={2.4} />
      </g>
    )}
    {kind === "prang" && (
      <g>
        <path d="M-16 14 L-14 -2 C-14 -18 -6 -30 0 -40 C6 -30 14 -18 14 -2 L16 14 Z" fill={C.wash} stroke={C.cobalt} strokeWidth={2.6} />
        {[-2, -12, -22].map((yy, i) => (
          <path key={i} d={`M${-13 + i * 3} ${yy} H${13 - i * 3}`} stroke={C.cobalt} strokeWidth={1.6} />
        ))}
        <path d="M0 -40 V-52" stroke={C.cobalt} strokeWidth={2.2} />
        <path d="M-24 14 H24" stroke={C.cobalt} strokeWidth={2.6} />
      </g>
    )}
    {kind === "flower" && (
      <g>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={0} cy={-8} rx={5} ry={8} transform={`rotate(${i * 60})`} fill={C.wash} stroke={C.cobalt} strokeWidth={1.6} />
        ))}
        <circle r={3.5} fill={C.cobalt} />
      </g>
    )}
  </g>
);

// A junk under sail, painted: hull, two battened sails.
export const Junk = ({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-30 4 Q0 18 34 0 L30 -6 L-26 -4 Z" fill={C.cobalt} />
    <path d="M-8 -6 L-6 -44 Q8 -34 10 -8 Z" fill={C.wash} stroke={C.cobalt} strokeWidth={2.2} />
    <path d="M12 -6 L14 -32 Q24 -24 24 -8 Z" fill={C.wash} stroke={C.cobalt} strokeWidth={2} />
    {[-14, -22, -30, -38].map((yy) => (
      <path key={yy} d={`M-6 ${yy} L${8 - (yy + 44) * 0.05} ${yy + 2}`} stroke={C.cobalt} strokeWidth={1.2} />
    ))}
    <path d="M-40 10 q10 -6 20 0 q10 6 20 0 q10 -6 20 0 q10 6 20 0" fill="none" stroke={C.cobalt} strokeWidth={1.6} />
  </g>
);

// Crackle in the glaze: a fixed network of very fine lines (seeded), in plate space but drawn above the paint.
export const Crackle = ({ rr, n = 70, seed = 5 }: { rr: number; n?: number; seed?: number }) => {
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    let a = random(`${seed}a${i}`) * Math.PI * 2;
    const d = Math.sqrt(random(`${seed}d${i}`)) * rr;
    let x = Math.cos(a) * d;
    let y = Math.sin(a) * d;
    let p = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = 4 + Math.floor(random(`${seed}s${i}`) * 6);
    for (let k = 0; k < steps; k++) {
      a += (random(`${seed}t${i}-${k}`) - 0.5) * 1.6;
      const l = 14 + random(`${seed}l${i}-${k}`) * 26;
      x += Math.cos(a) * l;
      y += Math.sin(a) * l;
      if (Math.hypot(x, y) > rr) break;
      p += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    lines.push(p);
  }
  return <path d={lines.join(" ")} fill="none" stroke="#6f6a5c" strokeWidth={0.7} opacity={0.22} />;
};

// The plate body (white glaze, foot-ring shading, iron lip). Children are painted on it and turn with it.
export const Plate = ({ r, turn = 0, children }: { r: number; turn?: number; children?: ReactNode }) => (
  <g>
    <defs>
      <radialGradient id="m22-body" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#f9faf6" />
        <stop offset="0.6" stopColor={C.glaze} />
        <stop offset="0.66" stopColor="#e4e6e2" />
        <stop offset="0.7" stopColor="#f8f9f5" />
        <stop offset="0.93" stopColor="#eef0ec" />
        <stop offset="0.985" stopColor="#d7d9d3" />
        <stop offset="1" stopColor="#b9bab2" />
      </radialGradient>
      <clipPath id="m22-plate">
        <circle r={r} />
      </clipPath>
    </defs>
    {/* cast shadow on the wood, light from the upper left */}
    <ellipse cx={r * 0.06} cy={r * 0.09} rx={r * 1.01} ry={r * 1.01} fill="#000" opacity={0.7} filter="url(#m22-soft)" />
    <circle r={r} fill="url(#m22-body)" />
    <g clipPath="url(#m22-plate)">
      <g transform={`rotate(${turn})`}>{children}</g>
    </g>
    {/* iron-brown lip */}
    <circle r={r - 2} fill="none" stroke={C.iron} strokeWidth={4} opacity={0.75} />
  </g>
);

// Glaze light: window reflection and rim gleam, fixed to the light (draw after the plate, not inside it).
export const Glaze = ({ r, glint = 0 }: { r: number; glint?: number }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="m22-gleam" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.85} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={-r * 0.42} cy={-r * 0.5} rx={r * 0.2} ry={r * 0.1} transform={`rotate(-40 ${-r * 0.42} ${-r * 0.5})`} fill="url(#m22-gleam)" opacity={0.75} />
    <ellipse cx={-r * 0.3} cy={-r * 0.36} rx={r * 0.07} ry={r * 0.035} transform={`rotate(-40 ${-r * 0.3} ${-r * 0.36})`} fill="url(#m22-gleam)" opacity={0.6} />
    <path d={`M${-r * 0.96} ${-r * 0.1} A${r * 0.97} ${r * 0.97} 0 0 1 ${-r * 0.2} ${-r * 0.95}`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.65} filter="url(#m22-glow)" />
    <path d={`M${r * 0.75} ${r * 0.6} A${r * 0.97} ${r * 0.97} 0 0 1 ${r * 0.4} ${r * 0.88}`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.35} />
    {/* a moving glint that runs round the rim when the plate turns */}
    {glint > 0 && (
      <ellipse cx={Math.cos(-2.2 + glint * 0.8) * r * 0.9} cy={Math.sin(-2.2 + glint * 0.8) * r * 0.9} rx={r * 0.08} ry={r * 0.025} transform={`rotate(${((-2.2 + glint * 0.8) * 180) / Math.PI + 90} ${Math.cos(-2.2 + glint * 0.8) * r * 0.9} ${Math.sin(-2.2 + glint * 0.8) * r * 0.9})`} fill="url(#m22-gleam)" opacity={0.9} />
    )}
  </g>
);

export const pathOf = (proj: GeoProjection) => geoPath(proj);
