import { loadFont } from "@remotion/google-fonts/Prompt";
import type { FeatureCollection, Geometry } from "geojson";
import { geoOrthographic } from "d3-geo";
import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";

// M20 metro line: a person's life drawn as a transit line. Stations are life stages (place, date, age); the line
// runs only horizontal, vertical or at 45° between them (octilinear), over a faint real map; interchange pills mark
// where the life crosses other people's lines; a little two-car train runs the route and pauses at each station;
// a station sign at the foot shows where the life is now.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  paper: "#ffffff", // diagram paper
  land: "#e6e6e1", // faint real land
  water: "#f6f9fa",
  line: "#e2531d", // the life line
  ink: "#1d1f24", // text, station rims of interchanges
  other1: "#6a4c9c", // another person's line (purple)
  other2: "#178a5b", // another person's line (green)
  muted: "#9a958a",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

export const useDiagram = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return { s, width, height, map: [90 * s, 330 * s, 900 * s, 1100 * s] };
};
export const fitBox = ([w, so, e, n]: [number, number, number, number], box: number[], k = 1): Cam => {
  const lon = (w + e) / 2;
  const lat = (so + n) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([box[2], box[3]], region([[w, so], [w, n], [e, n], [e, so]]));
  return { lon, lat, scale: p.scale() * k };
};

export type XY = [number, number];
// Octilinear leg from a to b: "diag" = the 45° part first, "straight" = the horizontal/vertical part first.
export const octi = (a: XY, b: XY, mode: "diag" | "straight" = "diag"): XY[] => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const d = Math.min(Math.abs(dx), Math.abs(dy));
  const diag: XY = [Math.sign(dx) * d, Math.sign(dy) * d];
  const rest: XY = [dx - diag[0], dy - diag[1]];
  const first = mode === "diag" ? diag : rest;
  return [a, [a[0] + first[0], a[1] + first[1]], b];
};
// Round the corners of a polyline (metro lines bend on arcs, not points).
export const rounded = (pts: XY[], r: number) => {
  if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p, q, n] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const l2 = Math.hypot(n[0] - q[0], n[1] - q[1]);
    if (l1 < 1 || l2 < 1) continue;
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a: XY = [q[0] - ((q[0] - p[0]) / l1) * rr, q[1] - ((q[1] - p[1]) / l1) * rr];
    const b: XY = [q[0] + ((n[0] - q[0]) / l2) * rr, q[1] + ((n[1] - q[1]) / l2) * rr];
    d += ` L${a[0]} ${a[1]} Q${q[0]} ${q[1]} ${b[0]} ${b[1]}`;
  }
  const z = pts[pts.length - 1];
  return d + ` L${z[0]} ${z[1]}`;
};
const clean = (pts: XY[]) => pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.5);
export const lengthOf = (pts: XY[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
// Point and heading at distance `t` along a polyline.
export const along = (pts: XY[], t: number): { p: XY; ang: number } => {
  let left = t;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    if (left <= l || i === pts.length - 2) {
      const k = l ? Math.min(1, left / l) : 0;
      return { p: [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k], ang: Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) };
    }
    left -= l;
  }
  return { p: pts[pts.length - 1], ang: 0 };
};
// The first `t` px of a polyline.
export const cut = (pts: XY[], t: number): XY[] => {
  const out: XY[] = [pts[0]];
  let left = t;
  for (let i = 0; i < pts.length - 1 && left > 0; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    const k = Math.min(1, left / l);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    left -= l;
  }
  return out;
};

export type Leg = { to: number; mode?: "diag" | "straight"; via?: XY[]; sea?: boolean };
// Build the whole route: station screen points + legs → one polyline, the distance of each stop, sea spans.
export const buildRoute = (pts: XY[], start: number, legs: Leg[]) => {
  let cur = start;
  const poly: XY[] = [pts[start]];
  const stops: number[] = [0];
  const sea: [number, number][] = [];
  for (const leg of legs) {
    const chain = [pts[cur], ...(leg.via ?? []), pts[leg.to]];
    const s0 = lengthOf(clean(poly));
    for (let i = 0; i < chain.length - 1; i++) poly.push(...octi(chain[i], chain[i + 1], i === chain.length - 2 ? leg.mode : "straight").slice(1));
    const s1 = lengthOf(clean(poly));
    if (leg.sea) sea.push([s0, s1]);
    stops.push(s1);
    cur = leg.to;
  }
  return { poly: clean(poly), stops, sea };
};

// Paper, faint real land and a light 45° guide grid.
export const Ground = () => {
  const { path, s, width, height } = useMap();
  const land = useMemo(() => path(LAND) ?? "", [path]);
  return (
    <g>
      <rect width={width} height={height} fill={C.water} />
      <defs>
        <pattern id="m20-grid" width={60 * s} height={60 * s} patternUnits="userSpaceOnUse">
          <path d={`M0 0 L${60 * s} ${60 * s} M${60 * s} 0 L0 ${60 * s}`} stroke="#d8d9d4" strokeWidth={0.8 * s} />
        </pattern>
      </defs>
      {/* a pale blue band off the coast, like a printed diagram */}
      <path d={land} fill="none" stroke="#dbe6ea" strokeWidth={44 * s} />
      <path d={land} fill="none" stroke="#e8eff1" strokeWidth={90 * s} opacity={0.7} />
      <path d={land} fill={C.land} />
      <path d={land} fill="url(#m20-grid)" opacity={0.6} />
      <path d={land} fill="none" stroke="#b9bbb4" strokeWidth={1.6 * s} />
      <text x={width * 0.545} y={height * 0.635} fontFamily={font} fontSize={26 * s} fontWeight={500} fill="#9fb4bc" letterSpacing={8 * s} textAnchor="middle">
        อ่าวไทย
      </text>
    </g>
  );
};

// A crossing line (another person's) with a label at its end.
export const OtherLine = ({ pts, color, k, label, sub, at, anchor = "start" }: { pts: XY[]; color: string; k: number; label: string; sub: string; at: XY; anchor?: "start" | "middle" | "end" }) => {
  const { s } = useDiagram();
  if (k <= 0) return null;
  const L = lengthOf(pts);
  return (
    <g>
      <path d={rounded(pts, 30 * s)} fill="none" stroke={color} strokeWidth={14 * s} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * k} ${L}`} />
      <g opacity={interpolate(k, [0.7, 1], [0, 1], clamp)} fontFamily={font} textAnchor={anchor}>
        <text x={at[0]} y={at[1]} fontSize={25 * s} fontWeight={700} fill={color}>
          {label}
        </text>
        <text x={at[0]} y={at[1] + 28 * s} fontSize={20 * s} fontWeight={500} fill={C.ink} opacity={0.75}>
          {sub}
        </text>
      </g>
    </g>
  );
};

// The life line: drawn solid up to `t` px (behind the train), the rest as a faint ghost; sea legs dashed.
export const LifeLine = ({ poly, t, sea }: { poly: XY[]; t: number; sea: [number, number][] }) => {
  const { s } = useDiagram();
  const L = lengthOf(poly);
  const d = rounded(poly, 34 * s);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={C.line} strokeOpacity={0.18} strokeWidth={16 * s} strokeDasharray={`${3 * s} ${12 * s}`} />
      <path d={d} stroke="#fff" strokeWidth={26 * s} strokeDasharray={`${t} ${L * 2}`} />
      <path d={d} stroke={C.line} strokeWidth={18 * s} strokeDasharray={`${t} ${L * 2}`} />
      {/* sea legs: white dashes inside the line */}
      {sea.map(([a, b], i) => (t > a ? <path key={i} d={d} stroke="#fff" strokeWidth={6 * s} strokeDasharray={`0 ${a} ${Math.min(t, b) - a} ${L * 2}`} /> : null))}
    </g>
  );
};

export type Station = { name: string; what: string; when: string; age?: string; dx: number; dy: number; anchor?: "start" | "middle" | "end"; inter?: boolean };
// A station: white disc with a line-coloured rim (filled ring once reached), or an interchange pill.
export const StationMark = ({ p, st, reached, now }: { p: XY; st: Station; reached: number; now: number }) => {
  const frame = useCurrentFrame();
  const { s } = useDiagram();
  const r = 16 * s;
  const pulse = 1 + 0.25 * now * (0.5 + 0.5 * Math.sin(frame * 0.25));
  return (
    <g>
      {now > 0 && <circle cx={p[0]} cy={p[1]} r={r * 2.4 * pulse} fill={C.line} opacity={0.16 * now} />}
      {st.inter ? (
        <rect x={p[0] - r * 1.2} y={p[1] - r * 1.2} width={r * 2.4} height={r * 2.4} rx={r * 1.2} fill="#fff" stroke={C.ink} strokeWidth={6 * s} />
      ) : (
        <circle cx={p[0]} cy={p[1]} r={r} fill="#fff" stroke={reached > 0 ? C.line : "#c9c3b5"} strokeWidth={7 * s} />
      )}
      <g fontFamily={font} textAnchor={st.anchor ?? "start"} opacity={0.45 + 0.55 * reached}>
        <text x={p[0] + st.dx * s} y={p[1] + st.dy * s} fontSize={33 * s} fontWeight={700} fill={C.ink} stroke={C.paper} strokeWidth={8 * s} paintOrder="stroke" strokeLinejoin="round">
          {st.name}
        </text>
        <text x={p[0] + st.dx * s} y={p[1] + st.dy * s + 30 * s} fontSize={21 * s} fontWeight={500} fill={reached > 0 ? C.line : C.muted} stroke={C.paper} strokeWidth={6 * s} paintOrder="stroke" strokeLinejoin="round">
          {st.when}
        </text>
      </g>
    </g>
  );
};

// The little two-car train on the line, pointing along it.
export const Train = ({ at, ang, k = 1 }: { at: XY; ang: number; k?: number }) => {
  const { s } = useDiagram();
  const car = (x: number) => (
    <g transform={`translate(${x} 0)`}>
      <rect x={-27 * s} y={-15 * s} width={54 * s} height={30 * s} rx={12 * s} fill={C.ink} />
      {[-14, 0, 14].map((wx) => <rect key={wx} x={(wx - 5) * s} y={-8 * s} width={10 * s} height={9 * s} rx={2.5 * s} fill="#ffe7b8" />)}
      <rect x={-27 * s} y={6 * s} width={54 * s} height={4 * s} fill={C.line} />
    </g>
  );
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${(ang * 180) / Math.PI})`} opacity={k}>
      <ellipse cx={-20 * s} cy={6 * s} rx={70 * s} ry={22 * s} fill="#000" opacity={0.18} style={{ filter: `blur(${6 * s}px)` }} />
      {car(-30 * s)}
      {car(30 * s)}
      <path d={`M${57 * s} ${-15 * s} q${14 * s} ${15 * s} 0 ${30 * s}`} fill={C.ink} />
      <circle cx={64 * s} cy={0} r={4 * s} fill="#fff6c8" />
    </g>
  );
};
