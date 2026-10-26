import { loadFont } from "@remotion/google-fonts/NotoSerifThai";
import { geoGraticule, geoOrthographic } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";

// M17 star chart: an antique celestial chart on deep indigo paper. Cities are stars, a family is a constellation
// (gold lines for marriages, silver dotted lines for descent), the coast is a faint silver line, a fine gold
// coordinate grid covers the sky, and a graduated ring round the chart is a year dial that turns to the date.

export const font = loadFont("normal", { weights: ["400", "500", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  sky: "#0b1438", // indigo chart paper
  deep: "#050920", // vignette / outside the dial
  gold: "#d9b45f", // constellation lines, ring, grid
  silver: "#b9c4dc", // coast, descent lines, small text
  star: "#fff4d6", // star cores
  text: "#f2e8cc", // titles and captions
  rose: "#e98f6f", // one warm accent: the brightest star's halo
  paper: "#ebdfc2", // the printed sheet round the sky
  ink: "#2a2136", // printing ink on the sheet
  ochre: "#8c5f1c", // ochre ink accents on the sheet
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);
export const fade = (frame: number, f0: number, f1: number, d = 12) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);
export const rise = (frame: number, f0: number, d = 20) => ease(interpolate(frame, [f0, f0 + d], [0, 1], clamp));

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// 9:16 layout: the round chart (centre, radius of the dial), title block above it, caption block below.
export const useChart = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return { s, width, height, cx: width / 2, cy: 905 * s, R: 500 * s, r: 438 * s };
};

// Camera fitting [w, s, e, n] into a square of side `side` centred on the chart.
export const fitSquare = ([w, so, e, n]: [number, number, number, number], side: number, k = 1): Cam => {
  const lon = (w + e) / 2;
  const lat = (so + n) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([side, side], region([[w, so], [w, n], [e, n], [e, so]]));
  return { lon, lat, scale: p.scale() * k };
};

// The sheet: aged cream paper printed in ink, with an indigo sky disc in the middle (field stars twinkle only
// inside it), engraved corner spandrels of rays and stars, and a double ink border.
export const Sheet = () => {
  const frame = useCurrentFrame();
  const { width, height, s, cx, cy, R, r } = useChart();
  const field = useMemo(
    () =>
      Array.from({ length: 360 }, (_, i) => {
        const a = random(`fa${i}`) * Math.PI * 2;
        const d = Math.sqrt(random(`fd${i}`)) * r;
        return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: (0.5 + Math.pow(random(`fr${i}`), 3) * 2.2) * s, p: random(`fp${i}`) * 6.28 };
      }),
    [cx, cy, r, s],
  );
  const spandrel = (x: number, y: number, sx: number, sy: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} stroke={C.ink} fill="none" opacity={0.75}>
      {Array.from({ length: 9 }, (_, j) => {
        const a = (j / 8) * (Math.PI / 2);
        return <line key={j} x1={Math.cos(a) * 40 * s} y1={Math.sin(a) * 40 * s} x2={Math.cos(a) * (120 + (j % 2) * 40) * s} y2={Math.sin(a) * (120 + (j % 2) * 40) * s} strokeWidth={(j % 2 ? 0.8 : 1.4) * s} />;
      })}
      <path d={`M${40 * s} 0 A${40 * s} ${40 * s} 0 0 1 0 ${40 * s}`} strokeWidth={1.4 * s} />
      <path d={sparkle(30 * s, 30 * s, 12 * s, 3 * s)} fill={C.ink} stroke="none" />
    </g>
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="m17-sky" cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#18276a" />
          <stop offset="0.7" stopColor={C.sky} />
          <stop offset="1" stopColor={C.deep} />
        </radialGradient>
        <radialGradient id="m17-age" cx="0.5" cy="0.47" r="0.75">
          <stop offset="0.5" stopColor={C.paper} stopOpacity={0} />
          <stop offset="1" stopColor="#8f7445" stopOpacity={0.35} />
        </radialGradient>
        <filter id="m17-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.33  0 0 0 0 0.22  0 0 0 0.14 -0.02" />
        </filter>
        <filter id="m17-fox" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={31} />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.2  0 0 0 0.25 -0.06" />
        </filter>
        <filter id="m17-skyfox" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={4} seed={13} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.38  0 0 0 0 0.8  0 0 0 0.22 -0.06" />
        </filter>
        <clipPath id="m17-disc">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <rect width={width} height={height} fill={C.paper} />
      <rect width={width} height={height} filter="url(#m17-fox)" />
      <rect width={width} height={height} filter="url(#m17-grain)" />
      <rect width={width} height={height} fill="url(#m17-age)" />
      {/* the dial's printed shadow ring and the sky disc */}
      <circle cx={cx} cy={cy} r={R + 18 * s} fill="none" stroke="#6d5530" strokeOpacity={0.25} strokeWidth={16 * s} style={{ filter: `blur(${10 * s}px)` }} />
      <circle cx={cx} cy={cy} r={r} fill="url(#m17-sky)" />
      <g clipPath="url(#m17-disc)">
        <rect width={width} height={height} filter="url(#m17-skyfox)" />
        {field.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={C.star} opacity={0.25 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.07 + f.p))} />
        ))}
      </g>
      {/* sheet border: a heavy and a fine ink rule, spandrels in the corners */}
      <rect x={24 * s} y={24 * s} width={width - 48 * s} height={height - 48 * s} fill="none" stroke={C.ink} strokeWidth={3 * s} />
      <rect x={36 * s} y={36 * s} width={width - 72 * s} height={height - 72 * s} fill="none" stroke={C.ink} strokeWidth={0.9 * s} />
      {spandrel(36 * s, 36 * s, 1, 1, 0)}
      {spandrel(width - 36 * s, 36 * s, -1, 1, 1)}
      {spandrel(36 * s, height - 36 * s, 1, -1, 2)}
      {spandrel(width - 36 * s, height - 36 * s, -1, -1, 3)}
    </svg>
  );
};


// A four-point sparkle path centred on x, y.
export const sparkle = (x: number, y: number, a: number, w: number) =>
  `M${x} ${y - a} Q${x + w * 0.35} ${y - w * 0.35} ${x + a} ${y} Q${x + w * 0.35} ${y + w * 0.35} ${x} ${y + a} Q${x - w * 0.35} ${y + w * 0.35} ${x - a} ${y} Q${x - w * 0.35} ${y - w * 0.35} ${x} ${y - a} Z`;

// The year dial: a graduated ring (one tick a year, long ticks every 5 and 10) with the decades engraved in the
// band and small stars between; it turns so that `year` sits under the gold pointer at the top.
export const YearDial = ({ year, from = 1440, to = 1560, k = 1 }: { year: number; from?: number; to?: number; k?: number }) => {
  const { width, height, s, cx, cy, R, r } = useChart();
  const per = 360 / (to - from);
  const turn = -(year - from) * per; // degrees: year at the top
  const inner = r + 10 * s;
  const ticks: ReactNode[] = [];
  for (let y = from; y < to; y++) {
    const a = ((y - from) * per - 90) * (Math.PI / 180);
    const len = y % 10 === 0 ? 22 : y % 5 === 0 ? 14 : 8;
    ticks.push(<line key={y} x1={Math.cos(a) * R} y1={Math.sin(a) * R} x2={Math.cos(a) * (R - len * s)} y2={Math.sin(a) * (R - len * s)} strokeWidth={(y % 10 === 0 ? 1.6 : 0.9) * s} />);
    if (y % 10 === 0) {
      const t = (y - from) * per;
      ticks.push(
        <text key={`t${y}`} transform={`rotate(${t}) translate(0 ${-(R - 42 * s)})`} textAnchor="middle" fontFamily={font} fontSize={21 * s} fontWeight={500} fill={C.ink} stroke="none" letterSpacing={2 * s}>
          {y}
        </text>,
      );
    }
    if (y % 10 === 5) {
      const t = (y - from) * per;
      ticks.push(<path key={`s${y}`} transform={`rotate(${t}) translate(0 ${-(R - 35 * s)})`} d={sparkle(0, 0, 6 * s, 1.6 * s)} fill={C.ink} stroke="none" />);
    }
  }
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: k }}>
      <g transform={`translate(${cx} ${cy})`} stroke={C.ink} fill="none">
        <circle r={R + 12 * s} strokeWidth={0.8 * s} opacity={0.6} />
        <circle r={R} strokeWidth={2.4 * s} />
        <circle r={inner} strokeWidth={1.2 * s} />
        <circle r={r} strokeWidth={0.8 * s} opacity={0.7} />
        <g transform={`rotate(${turn})`}>{ticks}</g>
        {/* fixed fine degree scale just inside the band */}
        {Array.from({ length: 180 }, (_, i) => {
          const a = (i * 2 * Math.PI) / 180;
          return <line key={i} x1={Math.cos(a) * inner} y1={Math.sin(a) * inner} x2={Math.cos(a) * (inner - (i % 15 === 0 ? 9 : 4) * s)} y2={Math.sin(a) * (inner - (i % 15 === 0 ? 9 : 4) * s)} strokeWidth={0.6 * s} opacity={0.6} />;
        })}
        {/* pointer at the top: a gold wedge over a reading window in the band */}
        <rect x={-44 * s} y={-R + 4 * s} width={88 * s} height={50 * s} rx={6 * s} strokeWidth={1.6 * s} />
        <path d={`M0 ${-R + 2 * s} l${-10 * s} ${-16 * s} h${20 * s} Z`} fill={C.ochre} stroke="none" />
      </g>
      <text x={cx} y={cy - R - 36 * s} textAnchor="middle" fontFamily={font} fontSize={34 * s} fontWeight={700} fill={C.ink} letterSpacing={4 * s}>
        {`ค.ศ. ${Math.round(year)}`}
      </text>
    </svg>
  );
};

// Inside the chart (draw inside <MapFrame>, clipped to the inner circle): faint land, silver coast, gold grid.
export const ChartLand = ({ k = 1 }: { k?: number }) => {
  const { path, s } = useMap();
  const grid = useMemo(() => geoGraticule().step([2, 2])(), []);
  const land = path(LAND) ?? "";
  return (
    <g opacity={k}>
      <path d={land} fill="#1a2a6e" fillOpacity={0.45} />
      <path d={path(grid) ?? ""} fill="none" stroke={C.gold} strokeWidth={0.7 * s} strokeOpacity={0.32} strokeDasharray={`${1.5 * s} ${4 * s}`} />
      <path d={land} fill="none" stroke={C.silver} strokeWidth={4 * s} strokeOpacity={0.12} />
      <path d={land} fill="none" stroke={C.silver} strokeWidth={1.1 * s} strokeOpacity={0.6} />
    </g>
  );
};

// A named star at a city. `b` 0…1 is its brightness (power): the core, glow and spikes all grow with it.
export const Star = ({ at, b, name, sub, dx = 0, dy = -34, anchor = "middle", hot = 0 }: { at: [number, number]; b: number; name: string; sub?: string; dx?: number; dy?: number; anchor?: "start" | "middle" | "end"; hot?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || b <= 0) return null;
  const tw = 1 + 0.08 * Math.sin(frame * 0.2 + at[0]);
  const core = (3 + 5 * b) * s;
  const spike = (14 + 46 * b) * s * tw;
  const [x, y] = p;
  const lx = x + dx * s;
  const ly = y + dy * s;
  const label = Math.min(1, b * 3);
  return (
    <g>
      <circle cx={x} cy={y} r={(22 + 70 * b) * s} fill={hot > 0 ? C.rose : C.star} opacity={0.1 + 0.18 * b + 0.2 * hot} style={{ filter: `blur(${(10 + 16 * b) * s}px)` }} />
      <path d={sparkle(x, y, spike, 6 * s)} fill={C.star} opacity={0.9} />
      <path d={sparkle(x, y, spike * 0.55, 3 * s)} fill={C.star} transform={`rotate(45 ${x} ${y})`} opacity={0.7} />
      <circle cx={x} cy={y} r={core} fill={C.star} />
      <circle cx={x} cy={y} r={core + 4 * s} fill="none" stroke={C.gold} strokeWidth={1 * s} opacity={0.8} />
      {(dx !== 0 || Math.abs(dy) > 40) && <line x1={x} y1={y} x2={lx} y2={ly + 6 * s} stroke={C.silver} strokeWidth={0.8 * s} opacity={0.7 * label} />}
      <g opacity={label} fontFamily={font} textAnchor={anchor}>
        <text x={lx} y={ly} fontSize={30 * s} fontWeight={700} fill={C.text} stroke={C.sky} strokeWidth={6 * s} paintOrder="stroke" letterSpacing={1 * s}>
          {name}
        </text>
        {sub && (
          <text x={lx} y={ly + 26 * s} fontSize={19 * s} fill={C.silver} stroke={C.sky} strokeWidth={5 * s} paintOrder="stroke" letterSpacing={1.5 * s}>
            {sub}
          </text>
        )}
      </g>
    </g>
  );
};

// A marriage: a double gold line drawn from one star to the other, with the year in a small ring at its middle.
export const Bond = ({ a, b, k, year, bend = 0.12, off = [0, 0] }: { a: [number, number]; b: [number, number]; k: number; year: string; bend?: number; off?: [number, number] }) => {
  const { projection, s } = useMap();
  const p = projection(a);
  const q = projection(b);
  if (!p || !q || k <= 0) return null;
  const mx = (p[0] + q[0]) / 2 - (q[1] - p[1]) * bend;
  const my = (p[1] + q[1]) / 2 + (q[0] - p[0]) * bend;
  const d = `M${p[0]} ${p[1]} Q${mx} ${my} ${q[0]} ${q[1]}`;
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) * 1.1;
  const tx = (p[0] + q[0]) / 4 + mx / 2;
  const ty = (p[1] + q[1]) / 4 + my / 2;
  const lab = interpolate(k, [0.8, 1], [0, 1], clamp);
  return (
    <g>
      <path d={d} fill="none" stroke={C.gold} strokeWidth={8 * s} opacity={0.12} strokeDasharray={`${len * k} ${len}`} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke={C.gold} strokeWidth={3.4 * s} strokeDasharray={`${len * k} ${len}`} strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.sky} strokeWidth={1.1 * s} strokeDasharray={`${len * k} ${len}`} />
      {(off[0] || off[1]) ? <line x1={tx} y1={ty} x2={tx + off[0] * s} y2={ty + off[1] * s} stroke={C.gold} strokeWidth={0.8 * s} opacity={lab} /> : null}
      <g opacity={lab} transform={`translate(${tx + off[0] * s} ${ty + off[1] * s})`}>
        <circle r={30 * s} fill={C.sky} stroke={C.gold} strokeWidth={1.6 * s} />
        <circle r={25 * s} fill="none" stroke={C.gold} strokeWidth={0.6 * s} />
        <text y={7 * s} textAnchor="middle" fontFamily={font} fontSize={19 * s} fontWeight={700} fill={C.gold}>
          {year}
        </text>
      </g>
    </g>
  );
};

// Descent: a dotted silver line from the parents' marriage (its middle) down to the child's star.
export const Descent = ({ from, to, k, bend = 0 }: { from: [number, number][]; to: [number, number]; k: number; bend?: number }) => {
  const { projection, s } = useMap();
  const ps = from.map((f) => projection(f));
  const q = projection(to);
  if (ps.some((p) => !p) || !q || k <= 0) return null;
  const sx = (ps[0]![0] + ps[1]![0]) / 2 - (ps[1]![1] - ps[0]![1]) * bend;
  const sy = (ps[0]![1] + ps[1]![1]) / 2 + (ps[1]![0] - ps[0]![0]) * bend;
  const x = sx + (q[0] - sx) * k;
  const y = sy + (q[1] - sy) * k;
  return (
    <g>
      <line x1={sx} y1={sy} x2={x} y2={y} stroke={C.silver} strokeWidth={2 * s} strokeDasharray={`${2 * s} ${7 * s}`} strokeLinecap="round" />
      <circle cx={x} cy={y} r={4 * s} fill={C.silver} opacity={k < 1 ? 1 : 0} />
    </g>
  );
};

// Title block above the dial: kicker in spaced gold small caps between star rules, title, italic-like sub.
export const TitleBlock = ({ kicker, title, sub, k }: { kicker: string; title: string; sub: string; k: number }) => {
  const { s } = useChart();
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 92 * s, textAlign: "center", fontFamily: font, opacity: k }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * s, color: C.ochre, fontSize: 24 * s, letterSpacing: 7 * s, fontWeight: 500 }}>
        <span style={{ height: 1.2 * s, width: 90 * s, background: C.ochre }} />
        {kicker}
        <span style={{ height: 1.2 * s, width: 90 * s, background: C.ochre }} />
      </div>
      <div style={{ color: C.ink, fontSize: 60 * s, fontWeight: 700, lineHeight: 1.3, marginTop: 16 * s,  }}>{title}</div>
      <div style={{ color: C.ink, fontSize: 27 * s, letterSpacing: 2 * s, marginTop: 6 * s }}>{sub}</div>
    </div>
  );
};

// Caption under the dial, set like a star-catalogue entry: a gold rule, the line, and a small catalogue number.
export const Entry = ({ text, start, len, no }: { text: string; start: number; len: number; no: string }) => {
  const frame = useCurrentFrame();
  const { s, cy, R } = useChart();
  if (frame < start || frame >= start + len) return null;
  const o = interpolate(frame, [start, start + 8, start + len - 6, start + len], [0, 1, 1, 0], clamp);
  const yy = interpolate(frame, [start, start + 12], [14, 0], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 80 * s, right: 80 * s, top: cy + R + 70 * s, textAlign: "center", fontFamily: font, opacity: o, transform: `translateY(${yy * s}px)` }}>
      <div style={{ color: C.ochre, fontSize: 20 * s, letterSpacing: 6 * s }}>✦ {no} ✦</div>
      <div style={{ color: C.ink, fontSize: 46 * s, fontWeight: 500, lineHeight: 1.5, marginTop: 8 * s, whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
};

// Legend line at the foot: star sizes = power, gold = marriage, silver dots = descent.
export const Legend = ({ k }: { k: number }) => {
  const { s, height } = useChart();
  const st = (r: number) => (
    <svg width={30 * s} height={30 * s} style={{ verticalAlign: "middle" }}>
      <path d={sparkle(15 * s, 15 * s, r * s, 2 * s)} fill={C.ink} />
    </svg>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height - 182 * s, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * s, fontFamily: font, fontSize: 21 * s, color: C.ink, opacity: k }}>
      <span>
        {st(5)}
        {st(9)}
        {st(14)} ขนาดดาว = อำนาจ
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 * s }}>
        <span style={{ width: 40 * s, height: 3.4 * s, background: C.ochre }} /> แต่งงาน
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 * s }}>
        <span style={{ width: 40 * s, borderTop: `${2 * s}px dotted ${C.ink}` }} /> ทายาท
      </span>
    </div>
  );
};
