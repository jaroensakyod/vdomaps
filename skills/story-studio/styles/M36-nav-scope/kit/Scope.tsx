import { loadFont } from "@remotion/google-fonts/Niramit";
import { loadFont as loadHand } from "@remotion/google-fonts/Itim";
import { geoEquirectangular, geoGraticule, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";

// M36 navigation scope: the story is plotted on an old ship's plotting display — a round amber-phosphor tube in a
// brass bezel on a grey-green enamel console with bakelite knobs and a bakelite card frame. The chart is drawn by the beam (a vector trace with a bright
// head and long afterglow), the ship's track dots forward one fix at a time, the brass bearing cursor turns to the
// heading, and the dead-reckoning card on the panel below is filled in with a yellow grease pencil.

export const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const hand = loadHand("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  enamel: "#5a6e62", // grey-green bridge enamel (hammertone)
  bakelite: "#5a6e62", // lower panel, same enamel
  bakeliteFrame: "#3a1d10", // the bakelite frame round the DR card
  bakeliteHi: "#7a4126",
  brass: "#c4974a",
  brassHi: "#f3d58e",
  brassDark: "#6e4f1f",
  glass: "#0c0703", // the tube face
  phos: "#ffb24a", // amber phosphor
  phosHot: "#fff0c8",
  phosDim: "#8a4f14",
  card: "#ead9b4", // the celluloid DR card
  pencil: "#e8a21c", // yellow-orange grease pencil
  engrave: "#f1e3c0",
};

export const W = 1080;
export const H = 1920;
export const SC = { x: 540, y: 790, r: 372 }; // the tube face

export const Defs = () => (
  <defs>
    <filter id="m36-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={4} result="b" />
      <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="b2" />
      <feMerge>
        <feMergeNode in="b2" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="m36-bakelite" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={4} seed={12} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 1.2 -0.45" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
    {/* hammertone enamel: soft dimpled mottling */}
    <filter id="m36-hammer" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={9} result="n" />
      <feDiffuseLighting in="n" surfaceScale={2.2} diffuseConstant={1} lightingColor="#fff" result="l">
        <feDistantLight azimuth={225} elevation={55} />
      </feDiffuseLighting>
      <feColorMatrix in="l" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.6 0 0 0 0.62" result="dark" />
      <feComposite in="l" in2="l" operator="arithmetic" k1={0} k2={0} k3={0} k4={0} result="none" />
      <feColorMatrix in="l" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.5 0 0 0 -0.32" result="light" />
      <feMerge>
        <feMergeNode in="dark" />
        <feMergeNode in="light" />
      </feMerge>
    </filter>
    <radialGradient id="m36-vig" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0.5" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.45} />
    </radialGradient>
    <filter id="m36-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.06 0" />
    </filter>
    {/* brushed brass: fine horizontal streaks */}
    <filter id="m36-brush" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.6" numOctaves={2} seed={6} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.8  0 0 0 0.25 0" />
      <feComposite in2="SourceAlpha" operator="in" />
    </filter>
    <radialGradient id="m36-bezel" cx="0.38" cy="0.3" r="0.8">
      <stop offset="0" stopColor={C.brassHi} />
      <stop offset="0.45" stopColor={C.brass} />
      <stop offset="0.85" stopColor={C.brassDark} />
      <stop offset="1" stopColor="#3a280e" />
    </radialGradient>
    <linearGradient id="m36-brassBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.brassHi} />
      <stop offset="0.5" stopColor={C.brass} />
      <stop offset="1" stopColor={C.brassDark} />
    </linearGradient>
    <radialGradient id="m36-tube" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#24140a" />
      <stop offset="0.8" stopColor={C.glass} />
      <stop offset="1" stopColor="#000" />
    </radialGradient>
    <radialGradient id="m36-glare" cx="0.3" cy="0.22" r="0.55">
      <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
      <stop offset="1" stopColor="#fff" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="m36-knob" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor="#6a3a22" />
      <stop offset="0.6" stopColor="#2a1309" />
      <stop offset="1" stopColor="#120804" />
    </radialGradient>
    <clipPath id="m36-face">
      <circle cx={SC.x} cy={SC.y} r={SC.r} />
    </clipPath>
  </defs>
);

const Screw = ({ x, y, r = 11, rot = 30 }: { x: number; y: number; r?: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="url(#m36-bezel)" stroke="#2a1c08" strokeWidth={1.5} />
    <path d={`M${-r * 0.7} 0 L${r * 0.7} 0`} stroke="#2a1c08" strokeWidth={2.6} />
  </g>
);
export const Knob = ({ x, y, r = 56, rot = 0, label }: { x: number; y: number; r?: number; rot?: number; label?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 12} fill="none" stroke={C.engrave} strokeWidth={1.4} opacity={0.5} />
    {Array.from({ length: 11 }, (_, i) => {
      const a = ((-135 + i * 27) * Math.PI) / 180;
      return <path key={i} d={`M${Math.sin(a) * (r + 12)} ${-Math.cos(a) * (r + 12)} L${Math.sin(a) * (r + 22)} ${-Math.cos(a) * (r + 22)}`} stroke={C.engrave} strokeWidth={2} opacity={0.7} />;
    })}
    <circle r={r} fill="url(#m36-knob)" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M0 ${-r} L0 ${-r + 8}`} transform={`rotate(${i * 15})`} stroke="#000" strokeWidth={3} opacity={0.5} />)}
    <circle r={r * 0.5} fill="url(#m36-bezel)" />
    <path d={`M0 ${-r * 0.48} L0 ${-r * 0.1}`} transform={`rotate(${rot})`} stroke="#2a1c08" strokeWidth={4} strokeLinecap="round" />
    {label ? <text y={r + 50} textAnchor="middle" fontFamily={font} fontSize={22} fontWeight={600} fill={C.engrave} letterSpacing={2}>{label}</text> : null}
  </g>
);

// The console: grey-green hammertone enamel, a lower instrument plate, the brass bezel round the tube.
export const Console = ({ children }: { children?: ReactNode }) => (
  <>
    <rect width={W} height={H} fill={C.enamel} />
    <rect width={W} height={H} filter="url(#m36-hammer)" />
    <rect width={W} height={H} filter="url(#m36-grain)" />
    <rect width={W} height={H} fill="url(#m36-vig)" />
    {/* lower instrument plate */}
    <rect x={0} y={1260} width={W} height={H - 1260} fill={C.bakelite} />
    <rect x={0} y={1260} width={W} height={H - 1260} filter="url(#m36-hammer)" />
    <rect x={0} y={1264} width={W} height={10} fill="#000" opacity={0.3} />
    <rect x={0} y={1252} width={W} height={12} fill="url(#m36-brassBar)" />
    {[60, 1020].map((x) => [1300, 1880].map((y) => <Screw key={`${x}${y}`} x={x} y={y} rot={x + y} />))}
    {children}
  </>
);

// Bezel with engraved bearing ring (0–360) and the rotating brass cursor pointing at `bearing`.
export const Bezel = ({ bearing, k = 1 }: { bearing: number; k?: number }) => {
  const R0 = SC.r + 8, R1 = SC.r + 86;
  return (
    <g>
      <circle cx={SC.x + 10} cy={SC.y + 18} r={R1 + 26} fill="#000" opacity={0.6} />
      <circle cx={SC.x} cy={SC.y} r={R1 + 24} fill="url(#m36-bezel)" />
      <circle cx={SC.x} cy={SC.y} r={R1 + 24} filter="url(#m36-brush)" />
      <circle cx={SC.x} cy={SC.y} r={R1 + 24} fill="none" stroke="#2a1c08" strokeWidth={3} />
      <circle cx={SC.x} cy={SC.y} r={R1} fill="none" stroke="#3a280e" strokeWidth={2} />
      {/* engraved degree ring on a darkened band */}
      <circle cx={SC.x} cy={SC.y} r={(R0 + R1) / 2} fill="none" stroke="#2a1c08" strokeWidth={R1 - R0} opacity={0.82} />
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const long = i % 2 === 0;
        const r1 = R0 + 2, r2 = R0 + (long ? 22 : 12);
        return <path key={i} d={`M${SC.x + Math.sin(a) * r1} ${SC.y - Math.cos(a) * r1} L${SC.x + Math.sin(a) * r2} ${SC.y - Math.cos(a) * r2}`} stroke={C.brassHi} strokeWidth={long ? 2.6 : 1.6} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const deg = i * 30;
        const a = (deg * Math.PI) / 180;
        const rr = R0 + 52;
        return (
          <text key={i} x={SC.x + Math.sin(a) * rr} y={SC.y - Math.cos(a) * rr + 10} textAnchor="middle" fontFamily={font} fontSize={28} fontWeight={700} fill={C.brassHi} transform={`rotate(${deg} ${SC.x + Math.sin(a) * rr} ${SC.y - Math.cos(a) * rr})`}>
            {String(deg).padStart(3, "0")}
          </text>
        );
      })}
      {/* the bearing cursor: a brass pointer riding the ring and a hairline across the face */}
      <g transform={`rotate(${bearing} ${SC.x} ${SC.y})`} opacity={k}>
        <path d={`M${SC.x} ${SC.y - R0 + 6} L${SC.x - 16} ${SC.y - R1 - 18} L${SC.x + 16} ${SC.y - R1 - 18} Z`} fill="url(#m36-brassBar)" stroke="#2a1c08" strokeWidth={2} />
      </g>
      {[45, 135, 225, 315].map((d) => <Screw key={d} x={SC.x + Math.sin((d * Math.PI) / 180) * (R1 + 6)} y={SC.y - Math.cos((d * Math.PI) / 180) * (R1 + 6)} r={9} rot={d} />)}
    </g>
  );
};

// The tube face: dark glass, faint phosphor graticule rings, the glass glare drawn last by `Glare`.
export const Face = ({ children, k = 1 }: { children?: ReactNode; k?: number }) => (
  <g>
    <circle cx={SC.x} cy={SC.y} r={SC.r} fill="url(#m36-tube)" />
    <g clipPath="url(#m36-face)" opacity={k}>
      {children}
    </g>
  </g>
);
export const Glare = () => (
  <g pointerEvents="none">
    <circle cx={SC.x} cy={SC.y} r={SC.r} fill="url(#m36-glare)" />
    <circle cx={SC.x} cy={SC.y} r={SC.r - 2} fill="none" stroke="#000" strokeWidth={10} opacity={0.6} />
  </g>
);

// ---------------------------------------------------------------- the plot
const LAND = feature(land50 as unknown as Topology, (land50 as unknown as Topology).objects.land as GeometryCollection) as unknown as FeatureCollection<Geometry>;
// Chart projection: equirectangular at `ppd` px per degree with [lon, lat] at the face centre.
export const chartProj = (center: [number, number], ppd: number): GeoProjection =>
  geoEquirectangular()
    .scale((ppd * 180) / Math.PI)
    .center(center)
    .translate([SC.x, SC.y])
    .clipExtent([[SC.x - SC.r - 40, SC.y - SC.r - 40], [SC.x + SC.r + 40, SC.y + SC.r + 40]]);

// Coast drawn by the beam: `k` 0..1 of the trace done, with a hot head; afterglow is the steady line.
export const Coast = ({ proj, k }: { proj: GeoProjection; k: number }) => {
  if (k <= 0) return null;
  const d = geoPath(proj)(LAND) ?? "";
  return (
    <g filter="url(#m36-glow)" fill="none" strokeLinejoin="round">
      <path d={d} fill={C.phosDim} opacity={0.22 * k} />
      <path d={d} stroke={C.phos} strokeWidth={2.6} pathLength={1} strokeDasharray={`${k} 2`} />
    </g>
  );
};
export const Graticule = ({ proj, k = 1 }: { proj: GeoProjection; k?: number }) => {
  const d = geoPath(proj)(geoGraticule().step([5, 5])()) ?? "";
  return <path d={d} fill="none" stroke={C.phos} strokeWidth={1} opacity={0.22 * k} strokeDasharray="2 6" />;
};
// Range rings of the plotter (fixed on the face).
export const Rings = ({ k = 1 }: { k?: number }) => (
  <g fill="none" stroke={C.phos} opacity={0.2 * k}>
    {[0.33, 0.66].map((f) => <circle key={f} cx={SC.x} cy={SC.y} r={SC.r * f} strokeWidth={1.2} />)}
    <path d={`M${SC.x - SC.r} ${SC.y} L${SC.x + SC.r} ${SC.y} M${SC.x} ${SC.y - SC.r} L${SC.x} ${SC.y + SC.r}`} strokeWidth={1} strokeDasharray="4 8" />
  </g>
);

// A phosphor label (small caps in the plotter's own lettering).
export const PLabel = ({ x, y, text, size = 24, k = 1, anchor = "start" }: { x: number; y: number; text: string; size?: number; k?: number; anchor?: "start" | "middle" | "end" }) =>
  k <= 0 ? null : (
    <text x={x} y={y} fontFamily={font} fontWeight={600} fontSize={size} fill={C.phos} textAnchor={anchor} opacity={k} filter="url(#m36-glow)" letterSpacing={1}>
      {text}
    </text>
  );

// Ship's track: one dot per fix up to `n`, fading with age (phosphor persistence); the newest is hot.
export const Track = ({ pts, n }: { pts: [number, number][]; n: number }) => (
  <g filter="url(#m36-glow)">
    {pts.slice(0, Math.max(0, Math.floor(n))).map((p, i, arr) => {
      const age = arr.length - 1 - i;
      const o = Math.max(0.35, 1 - age * 0.03);
      const hot = age === 0;
      return <circle key={i} cx={p[0]} cy={p[1]} r={hot ? 7 : 3.6} fill={hot ? C.phosHot : C.phos} opacity={o} />;
    })}
  </g>
);
// Ship mark: a small chevron at the head pointing along the heading (deg, 0 = north, clockwise).
export const ShipMark = ({ x, y, heading, frame }: { x: number; y: number; heading: number; frame: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${heading})`} filter="url(#m36-glow)">
    <circle r={18 + (frame % 30) * 1.2} fill="none" stroke={C.phosHot} strokeWidth={2} opacity={1 - (frame % 30) / 30} />
    <path d="M0 -16 L10 10 L0 4 L-10 10 Z" fill="none" stroke={C.phosHot} strokeWidth={2.6} strokeLinejoin="round" />
  </g>
);
// Atoll: a tiny phosphor ring.
export const Atoll = ({ x, y, k = 1, r = 5 }: { x: number; y: number; k?: number; r?: number }) => <circle cx={x} cy={y} r={r} fill="none" stroke={C.phos} strokeWidth={2} opacity={0.8 * k} filter="url(#m36-glow)" />;

// Phosphor noise / bloom flicker over the face (the tube is alive).
export const Snow = ({ frame }: { frame: number }) => (
  <g opacity={0.5}>
    {Array.from({ length: 40 }, (_, i) => {
      const a = random(`sa${i}-${frame % 7}`) * Math.PI * 2;
      const d = Math.sqrt(random(`sd${i}-${frame % 7}`)) * SC.r;
      return <circle key={i} cx={SC.x + Math.cos(a) * d} cy={SC.y + Math.sin(a) * d} r={1} fill={C.phos} opacity={random(`so${i}-${frame % 7}`) * 0.5} />;
    })}
  </g>
);

// ---------------------------------------------------------------- the panel below
// Engraved plate text on bakelite (cream fill + dark lower lip).
export const Engraved = ({ x, y, text, size = 26, anchor = "start", weight = 600, spacing = 2, color = C.engrave }: { x: number; y: number; text: string; size?: number; anchor?: "start" | "middle" | "end"; weight?: number; spacing?: number; color?: string }) => (
  <g fontFamily={font} fontSize={size} fontWeight={weight} textAnchor={anchor} letterSpacing={spacing}>
    <text x={x} y={y + 1.5} fill="#000" opacity={0.7}>{text}</text>
    <text x={x} y={y} fill={color}>{text}</text>
  </g>
);
// The celluloid DR card clipped to the panel. Children: grease-pencil lines.
export const Card = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) => (
  <g>
    <rect x={x - 22 + 8} y={y - 22 + 14} width={w + 44} height={h + 44} rx={14} fill="#000" opacity={0.45} />
    <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={14} fill={C.bakeliteFrame} />
    <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={14} filter="url(#m36-bakelite)" />
    <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={14} fill="none" stroke="#a0603a" strokeWidth={1.5} opacity={0.5} />
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C.card} />
    <rect x={x} y={y} width={w} height={h} rx={6} filter="url(#m36-grain)" opacity={0.8} />
    {Array.from({ length: Math.floor((h - 90) / 62) }, (_, i) => <path key={i} d={`M${x + 28} ${y + 110 + i * 62} L${x + w - 28} ${y + 110 + i * 62}`} stroke="#9a8a6a" strokeWidth={1.2} opacity={0.7} />)}
    <path d={`M${x + 160} ${y + 60} L${x + 160} ${y + h - 20}`} stroke="#b25a3a" strokeWidth={1.4} opacity={0.6} />
    {/* brass clip */}
    <rect x={x + w / 2 - 70} y={y - 22} width={140} height={44} rx={8} fill="url(#m36-brassBar)" stroke="#2a1c08" strokeWidth={2} />
    <circle cx={x + w / 2 - 44} cy={y} r={6} fill="#2a1c08" />
    <circle cx={x + w / 2 + 44} cy={y} r={6} fill="#2a1c08" />
    {children}
  </g>
);
// One grease-pencil line that writes itself (clip grows left to right).
export const Pencil = ({ id, x, y, text, k, size = 34, color = C.pencil }: { id: string; x: number; y: number; text: string; k: number; size?: number; color?: string }) =>
  k <= 0 ? null : (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x - 10} y={y - size * 1.3} width={(text.length * size * 0.5 + 40) * k} height={size * 1.9} />
        </clipPath>
      </defs>
      <text x={x} y={y} fontFamily={hand} fontSize={size} fill={color} clipPath={`url(#${id})`} stroke="#5a3a08" strokeWidth={0.6} style={{ paintOrder: "stroke" }}>
        {text}
      </text>
    </g>
  );

export const along = (pts: [number, number][], t: number) => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = Math.max(0, Math.min(1, t)) * L.reduce((a, b) => a + b, 0);
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) {
      const u = L[i] ? Math.min(1, d / L[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u] as [number, number];
    }
    d -= L[i];
  }
  return pts[0];
};
