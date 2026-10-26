import { loadFont } from "@remotion/google-fonts/Pridi";
import { geoContains, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import land110 from "world-atlas/land-110m.json";
import { region } from "../../../components/Region";

// M16 stained glass: the map as a lancet window in a sandstone wall. Every territory is a pane of coloured
// glass held in dark lead came; the sea and the land around are small quarry panes. Sunlight streams through: light
// shafts, dust, and the window's colours thrown onto the stone floor. When land changes hands its pane cracks and
// a pane of another colour is set in its place; the year sits in a painted glass roundel in the arch.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  stone: "#9a6e4c", // warm sandstone wall
  lead: "#24211f", // lead came
  siam: "#f2b01e", // amber-gold glass
  france: "#2f6ae0", // cobalt glass
  britain: "#d02a48", // ruby glass
  paint: "#3a2412", // grisaille paint on glass
  text: "#2b241c",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type Box = [number, number, number, number];
export type LonLat = [number, number];

type Props = { name: string };
const topo = countries50 as unknown as Topology<{ countries: GeometryCollection<Props> }>;
const COUNTRIES = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, Props>;
export const country = (id: string) => COUNTRIES.features.find((f) => f.id === id) as Feature<Geometry, Props>;
const topoL = land110 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topoL, topoL.objects.land) as unknown as FeatureCollection<Geometry>;

// A pane: a country shape, optionally cut by a hand polygon (`keep` inside it, or `drop` it out).
export type Pane = { id: string; country: string; keep?: LonLat[]; drop?: LonLat[][] };

// ---------- the window shape ----------
// Lancet window: pointed arch of two arcs (radius = 0.62 × width) over straight jambs.
export const archPath = ([x, y, w, h]: Box, inset = 0) => {
  const x0 = x + inset;
  const x1 = x + w - inset;
  const ww = x1 - x0;
  const R = 0.62 * w - inset;
  const rise = Math.sqrt(R * R - (R - ww / 2) * (R - ww / 2));
  const yS = y + inset + rise;
  const yB = y + h - inset;
  return `M${x0} ${yB} V${yS} A${R} ${R} 0 0 1 ${x0 + ww / 2} ${yS - rise} A${R} ${R} 0 0 1 ${x1} ${yS} V${yB} Z`;
};

export const useWindowMap = (box: Box, extent: [number, number, number, number]) =>
  useMemo(() => {
    const [w, s, e, n] = extent;
    const projection = geoMercator().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], region([[w, s], [w, n], [e, n], [e, s]]));
    return { projection, path: geoPath(projection) };
  }, [box.join(), extent.join()]);

// ---------- the stone wall and floor ----------
export const Wall = ({ win, floorY }: { win: Box; floorY: number }) => {
  const rows: ReactNode[] = [];
  for (let r = 0, y = 0; y < floorY; r++, y += 92) {
    rows.push(<line key={`h${r}`} x1={0} x2={1080} y1={y} y2={y} stroke="#2e2922" strokeWidth={5} opacity={0.85} />, <line key={`k${r}`} x1={0} x2={1080} y1={y + 4} y2={y + 4} stroke="#c9bfa8" strokeWidth={1.5} opacity={0.45} />);
    for (let x = (r % 2) * 110 - 110; x < 1080; x += 220) rows.push(<line key={`v${r}-${x}`} x1={x} x2={x} y1={y} y2={Math.min(floorY, y + 92)} stroke="#2e2922" strokeWidth={5} opacity={0.8} />);
  }
  // flagstones in perspective toward a vanishing point above the window centre
  const vx = 540;
  const vy = floorY - 900;
  const flags: ReactNode[] = [];
  for (let i = -8; i <= 8; i++) {
    const bx = 540 + i * 240;
    const t = (floorY - vy) / (1920 - vy);
    flags.push(<line key={`f${i}`} x1={vx + (bx - vx) * t} y1={floorY} x2={bx} y2={1920} stroke="#3b352d" strokeWidth={2.5} opacity={0.7} />);
  }
  [0.08, 0.2, 0.37, 0.6, 0.92].forEach((k, i) => {
    const y = floorY + (1920 - floorY) * k;
    flags.push(<line key={`r${i}`} x1={0} x2={1080} y1={y} y2={y} stroke="#3b352d" strokeWidth={2.5} opacity={0.7} />);
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="m16-stone" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={4} seed={31} result="n" />
          <feDiffuseLighting in="n" surfaceScale={2.2} lightingColor="#fff" result="l">
            <feDistantLight azimuth={250} elevation={58} />
          </feDiffuseLighting>
          <feColorMatrix in="l" values="0 0 0 0 0.55  0 0 0 0 0.51  0 0 0 0 0.46  0.55 0 0 0 -0.3" />
        </filter>
        <radialGradient id="m16-dim" cx={win[0] + win[2] / 2} cy={win[1] + win[3] * 0.55} r={1300} gradientUnits="userSpaceOnUse">
          <stop offset="0.25" stopColor="#000" stopOpacity={0.1} />
          <stop offset="1" stopColor="#000" stopOpacity={0.62} />
        </radialGradient>
        <linearGradient id="m16-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f2c1f" />
          <stop offset="1" stopColor="#6e4e36" />
        </linearGradient>
      </defs>
      <rect width={1080} height={floorY} fill={C.stone} />
      <rect width={1080} height={floorY} filter="url(#m16-stone)" />
      {rows}
      <rect y={floorY} width={1080} height={1920 - floorY} fill="url(#m16-floor)" />
      <rect y={floorY} width={1080} height={1920 - floorY} filter="url(#m16-stone)" opacity={0.7} />
      {flags}
      <rect width={1080} height={1920} fill="url(#m16-dim)" />
    </svg>
  );
};

// Stone surround: a moulded frame round the arch (three stepped rings) and a sill.
export const Surround = ({ win }: { win: Box }) => (
  <g>
    <path d={archPath([win[0] - 46, win[1] - 46, win[2] + 92, win[3] + 60])} fill="#b2a893" />
    <path d={archPath([win[0] - 46, win[1] - 46, win[2] + 92, win[3] + 60])} fill="url(#m16-stonepat)" opacity={0.5} />
    <path d={archPath([win[0] - 26, win[1] - 26, win[2] + 52, win[3] + 40])} fill="#968c78" />
    <path d={archPath([win[0] - 12, win[1] - 12, win[2] + 24, win[3] + 24])} fill="#6e6656" />
    <path d={archPath([win[0] - 46, win[1] - 46, win[2] + 92, win[3] + 60])} fill="none" stroke="#5a5244" strokeWidth={3} />
  </g>
);

// ---------- glass ----------
// Quarry panes: a jittered grid of small panes over the whole window, coloured by sea / land underneath.
export const useQuarries = (box: Box, projection: GeoProjection, cell = 74) =>
  useMemo(() => {
    const [x, y, w, h] = box;
    const nx = Math.ceil(w / cell) + 1;
    const ny = Math.ceil(h / cell) + 1;
    const v = (i: number, j: number): [number, number] => {
      const edge = i === 0 || j === 0 || i === nx || j === ny;
      return [x + i * (w / nx) + (edge ? 0 : (random(`x${i}-${j}`) - 0.5) * cell * 0.5), y + j * (h / ny) + (edge ? 0 : (random(`y${i}-${j}`) - 0.5) * cell * 0.5)];
    };
    const SEA = ["#1fa3a0", "#2bb3a8", "#1993a0", "#3cc0b0", "#22a8b4"]; // sea-green cathedral glass
    const GROUND = ["#8a5fc0", "#7a52b0", "#9a70cc", "#6f4aa4", "#8460bc"]; // amethyst: land outside the story
    const cells: { d: string; fill: string }[] = [];
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const p = [v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j + 1)];
        const cx = (p[0][0] + p[2][0]) / 2;
        const cy = (p[0][1] + p[2][1]) / 2;
        const ll = projection.invert?.([cx, cy]);
        const onLand = ll ? geoContains(LAND, ll) : false;
        const pal = onLand ? GROUND : SEA;
        cells.push({ d: `M${p.map((q) => q.join(" ")).join(" L")} Z`, fill: pal[Math.floor(random(`c${i}-${j}`) * pal.length)] });
      }
    return cells;
  }, [box.join(), projection]);

export const GlassDefs = () => (
  <defs>
    {/* mottled hand-made glass: seeds, streaks and uneven thickness */}
    <filter id="m16-mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves={3} seed={7} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 -0.32" />
    </filter>
    <filter id="m16-seed" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={1} seed={2} />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 0.55" />
    </filter>
    <filter id="m16-blur8" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={8} />
    </filter>
    <filter id="m16-blur3" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={3} />
    </filter>
    <filter id="m16-blur22" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={22} />
    </filter>
    <pattern id="m16-stonepat" width={6} height={6} patternUnits="userSpaceOnUse">
      <circle cx={2} cy={3} r={0.8} fill="#6b624f" />
    </pattern>
  </defs>
);

// Masks for each territory pane (inside its country, inside `keep`, outside every `drop`).
export const PaneMasks = ({ panes, path }: { panes: Pane[]; path: ReturnType<typeof geoPath> }) => (
  <defs>
    {panes.map((p) => {
      const c = path(country(p.country)) ?? "";
      return (
        <mask key={p.id} id={`m16-p-${p.id}`}>
          <path d={c} fill="#fff" />
          {p.keep && (
            <>
              <path d={c} fill="#000" />
              <clipPath id={`m16-cc-${p.id}`}>
                <path d={c} />
              </clipPath>
              <path d={path(region(p.keep)) ?? ""} fill="#fff" clipPath={`url(#m16-cc-${p.id})`} />
            </>
          )}
          {p.drop?.map((r, i) => <path key={i} d={path(region(r)) ?? ""} fill="#000" />)}
        </mask>
      );
    })}
  </defs>
);

// Lead lines: every pane's outline. Country outlines plus the hand cuts, clipped to their country.
export const Leads = ({ panes, path, width = 9 }: { panes: Pane[]; path: ReturnType<typeof geoPath>; width?: number }) => {
  const ds: string[] = [];
  const seen = new Set<string>();
  panes.forEach((p) => {
    if (!seen.has(p.country)) {
      seen.add(p.country);
      ds.push(path(country(p.country)) ?? "");
    }
  });
  return (
    <g fill="none" strokeLinejoin="round">
      {ds.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={C.lead} strokeWidth={width} />
          <path d={d} stroke="#7b746a" strokeWidth={1.6} strokeOpacity={0.7} transform="translate(-1.5,-1.5)" />
        </g>
      ))}
      {panes.map((p) =>
        [p.keep, ...(p.drop ?? [])].filter(Boolean).map((r, i) => (
          <g key={`${p.id}${i}`} clipPath={`url(#m16-cl-${p.country})`}>
            <path d={path(region(r as LonLat[])) ?? ""} stroke={C.lead} strokeWidth={width} />
          </g>
        )),
      )}
    </g>
  );
};
export const CountryClips = ({ ids, path }: { ids: string[]; path: ReturnType<typeof geoPath> }) => (
  <defs>
    {ids.map((id) => (
      <clipPath key={id} id={`m16-cl-${id}`}>
        <path d={path(country(id)) ?? ""} />
      </clipPath>
    ))}
  </defs>
);

// A crack spreading across a pane from `at`: jagged white rays, k 0–1.
export const Crack = ({ at, k, size = 160, seed = "c", maskId }: { at: [number, number]; k: number; size?: number; seed?: string; maskId: string }) => {
  if (k <= 0 || k >= 1.5) return null;
  const rays = Array.from({ length: 9 }, (_, i) => {
    const a0 = (i / 9) * Math.PI * 2 + random(`${seed}a${i}`) * 0.5;
    const pts: [number, number][] = [at];
    let [x, y] = at;
    let a = a0;
    const L = size * (0.6 + random(`${seed}l${i}`) * 0.7);
    for (let s = 0; s < 6; s++) {
      a += (random(`${seed}${i}-${s}`) - 0.5) * 0.9;
      x += (Math.cos(a) * L) / 6;
      y += (Math.sin(a) * L) / 6;
      pts.push([x, y]);
    }
    return pts;
  });
  const grow = Math.min(1, k);
  return (
    <g mask={`url(#${maskId})`} opacity={k > 1 ? 1.5 - k : 1}>
      {rays.map((pts, i) => {
        const n = Math.max(2, Math.ceil(pts.length * grow));
        const d = `M${pts.slice(0, n).map((p) => p.join(" ")).join(" L")}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeOpacity={0.4} filter="url(#m16-blur8)" />
            <path d={d} fill="none" stroke="#fffdf4" strokeWidth={2.4} />
          </g>
        );
      })}
      <circle cx={at[0]} cy={at[1]} r={16 * grow} fill="#fff" opacity={0.7} />
    </g>
  );
};

// Painted glass roundel with the year: a ring of small panes, a pale centre with grisaille lettering.
export const Roundel = ({ cx, cy, r, top, big, bottom, flash = 0 }: { cx: number; cy: number; r: number; top: string; big: string; bottom?: string; flash?: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r + 16} fill={C.lead} />
    {Array.from({ length: 16 }, (_, i) => {
      const a0 = (i / 16) * Math.PI * 2;
      const a1 = ((i + 1) / 16) * Math.PI * 2;
      const p = (a: number, rr: number) => `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`;
      return <path key={i} d={`M${p(a0, r - 18)} L${p(a0, r + 12)} A${r + 12} ${r + 12} 0 0 1 ${p(a1, r + 12)} L${p(a1, r - 18)} A${r - 18} ${r - 18} 0 0 0 ${p(a0, r - 18)} Z`} fill={i % 2 ? C.britain : C.france} stroke={C.lead} strokeWidth={5} />;
    })}
    <circle cx={cx} cy={cy} r={r - 18} fill="#f3e6bf" stroke={C.lead} strokeWidth={7} />
    <circle cx={cx} cy={cy} r={r - 18} fill="url(#m16-roundel)" />
    {flash > 0 && <circle cx={cx} cy={cy} r={r} fill="#fff" opacity={0.6 * flash} />}
    <text x={cx} y={cy - 26} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={24} fill={C.paint}>
      {top}
    </text>
    {bottom && (
      <text x={cx} y={cy + 56} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={20} fill={C.paint}>
        {bottom}
      </text>
    )}
    <text x={cx} y={cy + 28} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={54} fill={C.paint}>
      {big}
    </text>
    <defs>
      <radialGradient id="m16-roundel" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
        <stop offset="1" stopColor="#c99a3c" stopOpacity={0.35} />
      </radialGradient>
    </defs>
  </g>
);

export const fadeIn = (frame: number, f0: number, d = 12) => interpolate(frame, [f0, f0 + d], [0, 1], clamp);
