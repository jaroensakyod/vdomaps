import { loadFont } from "@remotion/google-fonts/IBMPlexSansThai";
import { geoCircle, geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import land50 from "world-atlas/land-50m.json";
import { region } from "../../../components/Region";

// M14 seismograph: a scientific chart recorder. A hammertone instrument casing with dials and an alarm lamp; a
// window onto millimetre grid paper where the map is printed in technical pen and a pen plotter draws the
// epicentre rings in red; below, a drum of graph paper turning under a stylus that writes the seismogram.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  casing: "#25706b", // hammertone instrument-teal paint
  paper: "#f4f6ef", // chart paper
  gridMinor: "#b3d6be", // millimetre lines
  gridMajor: "#4f9a70", // centimetre lines
  ink: "#1b2735", // technical-pen blue-black
  red: "#d62d20", // plotter pen + alarm
  chrome: "#c9ced1",
  label: "#e9ecea", // engraved lettering on the casing
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (frame: number, f0: number, f1: number, d = 8) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);
export type Box = [number, number, number, number];

const topoL = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topoL, topoL.objects.land) as unknown as FeatureCollection<Geometry>;
const topoC = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const BORDERS = mesh(topoC, topoC.objects.countries, (a, b) => a !== b);

// ---------- casing ----------
export const Casing = ({ windows }: { windows: Box[] }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      {/* hammertone: hammered paint lit from the top left */}
      <filter id="m14-hammer" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={12} result="n" />
        <feDiffuseLighting in="n" surfaceScale={3.2} lightingColor="#ffffff" result="l">
          <feDistantLight azimuth={225} elevation={52} />
        </feDiffuseLighting>
        <feColorMatrix in="l" values="0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 0 0.95  0.9 0 0 0 -0.62" />
      </filter>
      <linearGradient id="m14-case" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#2f8a84" />
        <stop offset="1" stopColor="#1b5552" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#m14-case)" />
    <rect width={1080} height={1920} filter="url(#m14-hammer)" />
    {windows.map(([x, y, w, h], i) => (
      <g key={i}>
        {/* chrome bezel round each window, recessed */}
        <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={18} fill="#262e34" />
        <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={14} fill="none" stroke={C.chrome} strokeWidth={5} />
        <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={14} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.2} transform="translate(-1,-1)" />
        {[[x - 4, y - 4], [x + w + 4, y - 4], [x - 4, y + h + 4], [x + w + 4, y + h + 4]].map(([cx, cy], j) => <Screw key={j} cx={cx} cy={cy} r={0} />)}
      </g>
    ))}
  </svg>
);

const Screw = ({ cx, cy, r: _r, rot = 30 }: { cx: number; cy: number; r?: number; rot?: number }) => (
  <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
    <circle r={8} fill="#aab1b5" stroke="#2b3238" strokeWidth={1.6} />
    <path d="M-5 0 H5" stroke="#3d454b" strokeWidth={2} />
  </g>
);

// Glass over a window: a soft diagonal reflection and an inner shadow.
export const Glass = ({ box }: { box: Box }) => {
  const [x, y, w, h] = box;
  const id = `m14-glass-${y}`;
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
          <stop offset="0.3" stopColor="#fff" stopOpacity={0.03} />
          <stop offset="0.31" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={10} style={{ filter: "blur(5px)" }} />
    </g>
  );
};

// An engraved label plate (kicker): black anodised plate, letters cut through to bright metal.
export const Plate = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 6, background: "linear-gradient(#20262b, #14181b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 3px 4px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontWeight: 600, color: "#d8dcda", letterSpacing: 3 }}>
    {children}
  </div>
);

// A round panel meter: chrome ring, cream dial with a printed scale, red needle.
export const Dial = ({ cx, cy, r, value, max, ticks, label, unit, digits = 1 }: { cx: number; cy: number; r: number; value: number; max: number; ticks: number[]; label: string; unit: string; digits?: number }) => {
  const a0 = -130;
  const a1 = 130;
  const ang = (v: number) => a0 + ((a1 - a0) * Math.max(0, Math.min(max, v))) / max;
  const pt = (v: number, rr: number) => {
    const a = ((ang(v) - 90) * Math.PI) / 180;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  };
  const n = ang(value);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 12} fill="#20272c" />
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={C.chrome} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="#efeee6" />
      {/* red zone at the top of the scale */}
      <path d={`M${pt(max * 0.78, r - 14).join(" ")} A${r - 14} ${r - 14} 0 0 1 ${pt(max, r - 14).join(" ")}`} fill="none" stroke={C.red} strokeWidth={8} />
      {Array.from({ length: 41 }, (_, i) => {
        const v = (max * i) / 40;
        const big = i % 5 === 0;
        const [x0, y0] = pt(v, r - 6);
        const [x1, y1] = pt(v, r - (big ? 24 : 15));
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.ink} strokeWidth={big ? 2.2 : 1} />;
      })}
      {ticks.map((v) => {
        const [x, y] = pt(v, r - 42);
        return (
          <text key={v} x={x} y={y + 7} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={20} fill={C.ink}>
            {v}
          </text>
        );
      })}
      <text x={cx} y={cy + r * 0.34} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={19} fill="#5a6267">
        {label}
      </text>
      <text x={cx} y={cy + r * 0.66} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={C.ink}>
        {value.toFixed(digits)} {unit}
      </text>
      <g transform={`rotate(${n} ${cx} ${cy})`}>
        <path d={`M${cx - 4} ${cy + 16} L${cx} ${cy - r + 12} L${cx + 4} ${cy + 16} Z`} fill={C.red} />
      </g>
      <circle cx={cx} cy={cy} r={11} fill="#2b3238" stroke={C.chrome} strokeWidth={2} />
      {/* dial glass */}
      <path d={`M${cx - r * 0.8} ${cy - r * 0.35} A${r} ${r} 0 0 1 ${cx + r * 0.35} ${cy - r * 0.85}`} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

// Alarm lamp: a red jewel lens; `on` 0–1 lights it.
export const Lamp = ({ cx, cy, on, label }: { cx: number; cy: number; on: number; label: string }) => (
  <g>
    {on > 0 && <circle cx={cx} cy={cy} r={70} fill={C.red} opacity={0.35 * on} style={{ filter: "blur(22px)" }} />}
    <circle cx={cx} cy={cy} r={42} fill="#20272c" />
    <circle cx={cx} cy={cy} r={38} fill="none" stroke={C.chrome} strokeWidth={5} />
    <circle cx={cx} cy={cy} r={32} fill={on > 0.5 ? "#ff4a36" : "#6a1a14"} />
    {/* faceted jewel */}
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a) * 32} ${cy + Math.sin(a) * 32} L${cx + Math.cos(a + Math.PI / 3) * 32} ${cy + Math.sin(a + Math.PI / 3) * 32} Z`} fill={i % 2 ? "#000" : "#fff"} opacity={0.08 + 0.08 * on} />;
    })}
    <circle cx={cx - 10} cy={cy - 12} r={8} fill="#fff" opacity={0.55} />
    <text x={cx} y={cy + 74} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={22} letterSpacing={3} fill={C.label}>
      {label}
    </text>
  </g>
);

// ---------- chart paper + technical-pen map ----------
export const GridPaper = ({ box, minor = 8, offsetX = 0 }: { box: Box; minor?: number; offsetX?: number }) => {
  const [x, y, w, h] = box;
  const lines: ReactNode[] = [];
  const o = ((offsetX % (minor * 5)) + minor * 5) % (minor * 5);
  for (let i = -5; i * minor <= w + minor * 5; i++) {
    const px = x + i * minor - o;
    if (px < x || px > x + w) continue;
    const major = ((i % 5) + 5) % 5 === 0;
    lines.push(<line key={`v${i}`} x1={px} x2={px} y1={y} y2={y + h} stroke={major ? C.gridMajor : C.gridMinor} strokeWidth={major ? 2 : 0.8} />);
  }
  for (let j = 0; j * minor <= h; j++) {
    const major = j % 5 === 0;
    lines.push(<line key={`h${j}`} x1={x} x2={x + w} y1={y + j * minor} y2={y + j * minor} stroke={major ? C.gridMajor : C.gridMinor} strokeWidth={major ? 2 : 0.8} />);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={C.paper} />
      {lines}
    </g>
  );
};

export const usePaperMap = (box: Box, extent: [number, number, number, number]) =>
  useMemo(() => {
    const [w, s, e, n] = extent;
    const projection = geoMercator().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], region([[w, s], [w, n], [e, n], [e, s]]));
    return { projection, path: geoPath(projection) };
  }, [box.join(), extent.join()]);

// Map printed in technical pen: land hatched with fine 45° lines, coast in 1.8 px ink, borders dash-dot.
// `print` 0–1 prints it top to bottom like a plotter pass.
export const PenMap = ({ box, path, print = 1 }: { box: Box; path: ReturnType<typeof geoPath>; print?: number }) => {
  const [x, y, w, h] = box;
  const land = path(LAND) ?? "";
  return (
    <g>
      <defs>
        <pattern id="m14-hatch" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} x2={0} y1={0} y2={7} stroke={C.ink} strokeWidth={0.9} strokeOpacity={0.4} />
        </pattern>
        <clipPath id="m14-print">
          <rect x={x} y={y} width={w} height={h * print} />
        </clipPath>
      </defs>
      <g clipPath="url(#m14-print)">
        <path d={land} fill="url(#m14-hatch)" />
        <path d={land} fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinejoin="round" />
        <path d={path(BORDERS) ?? ""} fill="none" stroke={C.ink} strokeWidth={1.3} strokeDasharray="10 4 2 4" />
      </g>
    </g>
  );
};

// Ring of radius `km` round `at`, drawn by the plotter pen up to fraction k; returns the pen position too.
export const ringPath = (projection: ReturnType<typeof geoMercator>, at: [number, number], km: number) => {
  const ring = geoCircle().center(at).radius(km / 111.2).precision(2)().coordinates[0];
  return ring.map((p) => projection(p as [number, number]) as [number, number]);
};
const lenOf = (pts: [number, number][]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
export const pointAt = (pts: [number, number][], k: number): [number, number] => {
  const L = lenOf(pts) * Math.max(0, Math.min(1, k));
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) {
      const t = d ? (L - acc) / d : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    acc += d;
  }
  return pts[pts.length - 1];
};
export const PenLine = ({ pts, k, color = C.red, width = 2.6, dash }: { pts: [number, number][]; k: number; color?: string; width?: number; dash?: string }) => {
  if (k <= 0) return null;
  const L = lenOf(pts);
  const d = `M${pts.map((p) => p.join(" ")).join(" L")}`;
  if (dash) {
    return (
      <g>
        <mask id={`m14-m-${Math.round(pts[0][0])}-${Math.round(L)}`}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={width + 6} strokeDasharray={`${L * k} ${L + 10}`} />
        </mask>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} mask={`url(#m14-m-${Math.round(pts[0][0])}-${Math.round(L)})`} />
      </g>
    );
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${L * k} ${L + 10}`} />;
};

// The plotter: a gantry bar across the window at the pen's y, a carriage and a red pen at the pen point.
export const Plotter = ({ box, pen, down }: { box: Box; pen: [number, number]; down: boolean }) => {
  const [x, , w] = box;
  const [px, py] = pen;
  return (
    <g>
      <rect x={x} y={py - 9} width={w} height={18} fill="#9aa3a8" opacity={0.92} />
      <rect x={x} y={py - 9} width={w} height={4} fill="#d8dde0" opacity={0.9} />
      <rect x={x} y={py + 6} width={w} height={3} fill="#4c555b" opacity={0.9} />
      <rect x={px - 22} y={py - 26} width={44} height={40} rx={4} fill="#3a4249" stroke="#1d2328" strokeWidth={1.5} />
      <rect x={px - 6} y={py - 4 - (down ? 0 : 6)} width={12} height={18} rx={2} fill={C.red} />
      <circle cx={px} cy={py} r={2.5} fill={C.red} />
      <rect x={px - 22} y={py - 26} width={44} height={6} rx={3} fill="#5d676f" />
    </g>
  );
};

// Technical lettering on the paper (stencil-like, upright), with a white knock-out so it reads over the grid.
export const Lettering = ({ x, y, text, size = 28, anchor = "start", color = C.ink, weight = 600, on = 1 }: { x: number; y: number; text: string; size?: number; anchor?: "start" | "middle" | "end"; color?: string; weight?: number; on?: number }) =>
  on <= 0 ? null : (
    <g opacity={on}>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill="none" stroke={C.paper} strokeWidth={8} strokeLinejoin="round">
        {text}
      </text>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );

// ---------- the drum ----------
// Seismogram amplitude (−1…1) at time t (frames). Quiet microseisms, then the P arrival at `p` and the big S
// phase at `s`, decaying. Simulated; label it ภาพจำลอง on screen.
export const seismo = (t: number, p: number, s: number) => {
  const noise = (Math.sin(t * 1.7) * 0.5 + Math.sin(t * 3.1 + 1) * 0.3 + (random(`n${Math.floor(t)}`) - 0.5) * 0.6) * 0.05;
  const pe = t < p ? 0 : Math.min(1, (t - p) / 6) * Math.exp(-(t - p) / 60) * 0.28;
  const se = t < s ? 0 : Math.min(1, (t - s) / 5) * Math.exp(-(t - s) / 95);
  const osc = Math.sin(t * 2.3) * 0.6 + Math.sin(t * 3.7 + 0.5) * 0.4 + (random(`q${Math.floor(t)}`) - 0.5) * 0.7;
  return noise + (pe + se) * osc;
};

// A horizontal drum wrapped in grid paper, turning so the paper moves left under a stylus at `stylusX`.
// Horizontal grid lines and the trace sit on the cylinder (compressed near the edges).
export const Drum = ({ box, frame, speed, stylusX, signal, marks }: { box: Box; frame: number; speed: number; stylusX: number; signal: (t: number) => number; marks: { f: number; text: string }[] }) => {
  const [x, y, w, h] = box;
  const cy = y + h / 2;
  const R = h / 2 - 8;
  const onCyl = (v: number) => cy + R * Math.sin(Math.max(-1.3, Math.min(1.3, v * 1.25)));
  const shift = frame * speed;
  const hLines: ReactNode[] = [];
  for (let i = -12; i <= 12; i++) {
    const v = i / 12;
    const yy = cy + R * Math.sin(v * 1.35);
    hLines.push(<line key={i} x1={x} x2={x + w} y1={yy} y2={yy} stroke={i % 3 === 0 ? C.gridMajor : C.gridMinor} strokeWidth={i % 3 === 0 ? 1.3 : 0.7} />);
  }
  const vLines: ReactNode[] = [];
  const step = 9;
  const o = shift % (step * 5);
  for (let i = 0; i * step <= w + step * 5; i++) {
    const px = x + i * step - o;
    if (px < x || px > x + w) continue;
    const idx = Math.round((i * step + (shift - o)) / step);
    vLines.push(<line key={i} x1={px} x2={px} y1={y + 4} y2={y + h - 4} stroke={idx % 5 === 0 ? C.gridMajor : C.gridMinor} strokeWidth={idx % 5 === 0 ? 1.3 : 0.7} />);
  }
  // the trace: paper at screen x was under the stylus (stylusX - x) / speed frames ago
  const pts: string[] = [];
  for (let px = x; px <= stylusX; px += 2) {
    const t = frame - (stylusX - px) / speed;
    if (t < 0) continue;
    pts.push(`${px.toFixed(1)},${onCyl(signal(t)).toFixed(1)}`);
  }
  const tip = onCyl(signal(frame));
  const pivot: [number, number] = [x + w + 40, cy - 70];
  return (
    <g>
      <defs>
        <linearGradient id="m14-drum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.55} />
          <stop offset="0.18" stopColor="#000" stopOpacity={0.12} />
          <stop offset="0.36" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.82" stopColor="#000" stopOpacity={0.14} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </linearGradient>
        <clipPath id="m14-drumclip">
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath="url(#m14-drumclip)">
        <rect x={x} y={y} width={w} height={h} fill={C.paper} />
        {vLines}
        {hLines}
        {marks.map((m) => {
          const px = stylusX - (frame - m.f) * speed;
          if (px < x - 100 || frame < m.f) return null;
          return (
            <g key={m.f}>
              <line x1={px} x2={px} y1={y + h - 56} y2={y + h - 30} stroke={C.ink} strokeWidth={2} />
              <text x={px + 6} y={y + h - 34} fontFamily={font} fontWeight={600} fontSize={20} fill={C.ink}>
                {m.text}
              </text>
            </g>
          );
        })}
        <polyline points={pts.join(" ")} fill="none" stroke={C.red} strokeWidth={2.4} strokeLinejoin="round" />
        <rect x={x} y={y} width={w} height={h} fill="url(#m14-drum)" />
        {/* paper not yet written on the right of the stylus is slightly brighter (the drum's lit side) */}
        <rect x={stylusX} y={y} width={x + w - stylusX} height={h} fill="#fff" opacity={0.05} />
      </g>
      {/* drum end caps */}
      {[x - 10, x + w + 10].map((ex, i) => (
        <g key={i}>
          <ellipse cx={ex} cy={cy} rx={14} ry={h / 2 + 6} fill="#2a3237" stroke={C.chrome} strokeWidth={3} />
          <circle cx={ex} cy={cy} r={8} fill={C.chrome} />
        </g>
      ))}
      {/* stylus arm from a pivot on the right */}
      <line x1={pivot[0]} y1={pivot[1]} x2={stylusX} y2={tip} stroke="#2a3237" strokeWidth={7} strokeLinecap="round" />
      <line x1={pivot[0]} y1={pivot[1]} x2={stylusX} y2={tip} stroke={C.chrome} strokeWidth={2} strokeLinecap="round" />
      <circle cx={stylusX} cy={tip} r={6} fill={C.red} stroke="#2a3237" strokeWidth={2} />
      <circle cx={pivot[0]} cy={pivot[1]} r={16} fill="#2a3237" stroke={C.chrome} strokeWidth={3} />
    </g>
  );
};
