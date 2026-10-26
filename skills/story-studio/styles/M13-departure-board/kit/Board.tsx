import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { interpolate, random } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import { region } from "../../../components/Region";

// M13 departure board: a station split-flap board. Inside it, an amber dot-matrix LED map on black; each army is a
// "route" row of split-flap blades (destination, day count, status) that flip like a real board; routes light up dot
// by dot on the LED map. Everything is drawn here; no imagery.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  casing: "#2f5a4c", // enamel green (plate rule and lettering)
  board: "#0b0b0a", // the black board face
  tile: "#1b1b1a", // a flap blade
  amber: "#ffb21e", // LED amber
  amberDim: "#5a3a06", // LED off
  cream: "#efe8d4", // printed blade lettering
  red: "#e8412c", // one alarm accent: halted / delayed
  rivet: "#8d9390",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// ---------- casing ----------
// Painted steel casing with rivets, a black board face, and an acrylic sheen.
export const Casing = ({ width = 1080, height = 1920, modules = [[30, 1890]], bare = false }: { width?: number; height?: number; modules?: [number, number][]; bare?: boolean }) => (
  <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="m13-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.02" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.27  0 0 0 0 0.26  0 0 0 0.55 0" />
      </filter>
      <linearGradient id="m13-casing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dfe3e1" />
        <stop offset="0.5" stopColor="#c2c7c5" />
        <stop offset="1" stopColor="#a3a9a6" />
      </linearGradient>
      <linearGradient id="m13-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#121211" />
        <stop offset="1" stopColor="#070707" />
      </linearGradient>
    </defs>
    {!bare && <rect width={width} height={height} fill="url(#m13-casing)" />}
    {!bare && <rect width={width} height={height} filter="url(#m13-grain)" />}
    {/* inner bevel round the board face */}
    {modules.map(([a, b], i) => (
      <g key={i}>
        <rect x={34} y={a - 4} width={width - 68} height={b - a + 8} rx={10} fill="#0e1513" opacity={0.85} />
        <rect x={34} y={b + 2} width={width - 68} height={3} fill="#e6ebe8" opacity={0.6} />
        <rect x={38} y={a} width={width - 76} height={b - a} rx={8} fill="url(#m13-face)" stroke="#33443e" strokeWidth={2} />
      </g>
    ))}
    {/* rivets along the casing */}
    {!bare && Array.from({ length: 12 }, (_, i) => 60 + (i * (height - 120)) / 11).flatMap((y, i) => [
      <circle key={`l${i}`} cx={17} cy={y} r={5} fill={C.rivet} stroke="#4a4f4d" strokeWidth={1.5} />,
      <circle key={`r${i}`} cx={width - 17} cy={y} r={5} fill={C.rivet} stroke="#4a4f4d" strokeWidth={1.5} />,
    ])}
    {!bare && Array.from({ length: 7 }, (_, i) => 60 + (i * (width - 120)) / 6).flatMap((x, i) => [
      <circle key={`t${i}`} cx={x} cy={17} r={5} fill={C.rivet} stroke="#4a4f4d" strokeWidth={1.5} />,
      <circle key={`b${i}`} cx={x} cy={height - 17} r={5} fill={C.rivet} stroke="#4a4f4d" strokeWidth={1.5} />,
    ])}
  </svg>
);

// Enamel name plate bolted to the casing above the board: green vitreous enamel, a cream inset rule, chipped
// corners, bolts. Holds the kicker and the board's name.
export const EnamelPlate = ({ x, y, w, h, left, right }: { x: number; y: number; w: number; h: number; left: string; right: string }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="m13-enamel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6553" />
          <stop offset="1" stopColor="#1f4a3c" />
        </linearGradient>
        <filter id="m13-enamel-tex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={3} seed={9} />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.14 0" />
        </filter>
      </defs>
      <rect x={0} y={4} width={w} height={h - 4} rx={14} fill="#0c1411" opacity={0.6} />
      <rect x={0} y={0} width={w} height={h - 4} rx={14} fill="url(#m13-enamel)" />
      <rect x={0} y={0} width={w} height={h - 4} rx={14} filter="url(#m13-enamel-tex)" />
      <rect x={10} y={10} width={w - 20} height={h - 24} rx={8} fill="none" stroke="#efe8d4" strokeWidth={3} />
      {/* chipped enamel showing black steel at two corners */}
      <path d={`M${w - 40} ${h - 4} q8 -10 22 -8 q4 -8 16 -14 L${w} ${h - 18} q0 12 -14 14 Z`} fill="#1a1a18" />
      <path d="M0 26 q10 -2 12 -12 q6 2 10 -12 L14 0 Q0 0 0 14 Z" fill="#1a1a18" />
      {[[24, h / 2 - 2], [w - 24, h / 2 - 2]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={8} fill="#8b8f86" stroke="#3b3e38" strokeWidth={2} />
          <path d={`M${cx - 5} ${cy} h10`} stroke="#3b3e38" strokeWidth={2} />
        </g>
      ))}
    </svg>
    <div style={{ position: "absolute", left: 50, right: 50, top: 0, height: h - 4, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, fontWeight: 700, color: "#f4eedb" }}>
      <span style={{ fontSize: 40, letterSpacing: 1 }}>{left}</span>
      <span style={{ fontSize: 30, letterSpacing: 3, color: "#ffcf5a" }}>{right}</span>
    </div>
  </div>
);

// Acrylic sheen over the whole face (draw last).
export const Sheen = ({ width = 1080, height = 1920 }: { width?: number; height?: number }) => (
  <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <defs>
      <linearGradient id="m13-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.07} />
        <stop offset="0.35" stopColor="#fff" stopOpacity={0.015} />
        <stop offset="0.36" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#fff" stopOpacity={0.03} />
      </linearGradient>
    </defs>
    <rect x={30} y={30} width={width - 60} height={height - 60} rx={8} fill="url(#m13-sheen)" opacity={0.7} />
  </svg>
);

// ---------- split-flap ----------
// A flap sequence: [frame, text, cycles] — with cycles > 0 the blade first spins through random pool entries, one
// per `dur` frames, before it settles (what a real board does).
export type FlapStep = [number, string, number?];
export const expand = (steps: FlapStep[], pool: string[], dur = 5, seed = "f") => {
  const out: [number, string][] = [];
  steps.forEach(([f, text, cyc = 0], si) => {
    for (let c = 0; c < cyc; c++) out.push([f + c * dur, pool[Math.floor(random(`${seed}${si}${c}`) * pool.length)]]);
    out.push([f + cyc * dur, text]);
  });
  return out;
};
export const flapAt = (list: [number, string][], frame: number, dur = 5) => {
  let i = -1;
  for (let k = 0; k < list.length; k++) if (list[k][0] <= frame) i = k;
  if (i < 0) return { from: "", to: "", p: 1 };
  return { from: i > 0 ? list[i - 1][1] : "", to: list[i][1], p: Math.min(1, (frame - list[i][0]) / dur) };
};
// Frames where a sequence flips (for the clack sound).
export const flipFrames = (list: [number, string][]) => list.map(([f]) => f);

const Half = ({ text, part, w, h, size, color, weight, rot = 0, shade = 0, style }: { text: string; part: "top" | "bottom"; w: number; h: number; size: number; color: string; weight: number; rot?: number; shade?: number; style?: CSSProperties }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: part === "top" ? 0 : h / 2,
      width: w,
      height: h / 2,
      overflow: "hidden",
      background: part === "top" ? "linear-gradient(#262625, #1d1d1c)" : "linear-gradient(#171716, #121211)",
      borderRadius: part === "top" ? "6px 6px 0 0" : "0 0 6px 6px",
      transformOrigin: part === "top" ? "50% 100%" : "50% 0%",
      transform: rot ? `rotateX(${rot}deg)` : undefined,
      backfaceVisibility: "hidden",
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: 0, right: 0, top: part === "top" ? 0 : -h / 2, height: h, lineHeight: `${h}px`, textAlign: "center", fontFamily: font, fontWeight: weight, fontSize: size, color, whiteSpace: "nowrap", letterSpacing: size * 0.02 }}>
      {text}
    </div>
    {shade > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${shade})` }} />}
  </div>
);

// One split-flap blade: the new text's top half is already showing, the old top half folds down over the split,
// then the new bottom half falls into place. `p` 0 → 1.
export const Blade = ({ x, y, w, h, from, to, p, size, color = C.cream, weight = 600 }: { x: number; y: number; w: number; h: number; from: string; to: string; p: number; size: number; color?: string; weight?: number }) => {
  const props = { w, h, size, color, weight };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, perspective: 700, filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.7))" }}>
      <Half {...props} text={to} part="top" />
      <Half {...props} text={p < 1 ? from : to} part="bottom" />
      {p < 0.5 && <Half {...props} text={from} part="top" rot={-180 * p} shade={p * 1.2} />}
      {p >= 0.5 && p < 1 && <Half {...props} text={to} part="bottom" rot={180 * (1 - p)} shade={(1 - p) * 1.2} />}
      {/* the split, hinge pins, a thin highlight on the top edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: h / 2 - 1.5, height: 3, background: "#000" }} />
      <div style={{ position: "absolute", left: -3, top: h / 2 - 5, width: 6, height: 10, borderRadius: 2, background: "#4a4a46" }} />
      <div style={{ position: "absolute", right: -3, top: h / 2 - 5, width: 6, height: 10, borderRadius: 2, background: "#4a4a46" }} />
      <div style={{ position: "absolute", left: 4, right: 4, top: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
};

// A sequence-driven blade.
export const FlapText = ({ list, frame, dur = 5, ...rest }: { list: [number, string][]; frame: number; dur?: number; x: number; y: number; w: number; h: number; size: number; color?: string | ((t: string) => string); weight?: number }) => {
  const { from, to, p } = flapAt(list, frame, dur);
  const color = typeof rest.color === "function" ? rest.color(to) : rest.color;
  return <Blade {...rest} color={color} from={from} to={to} p={p} />;
};

// A row of digit blades showing value(frame), each digit flipping on its own when it changes.
export const Digits = ({ value, frame, n, x, y, w, h, gap = 8, size, color = C.cream, dur = 4 }: { value: (f: number) => number; frame: number; n: number; x: number; y: number; w: number; h: number; gap?: number; size: number; color?: string; dur?: number }) => {
  const dig = (f: number, i: number) => String(Math.max(0, Math.floor(value(f)))).padStart(n, "0")[i];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        let fc = -1;
        for (let b = 0; b < dur; b++) if (dig(frame - b, i) !== dig(frame - b - 1, i)) { fc = frame - b; break; }
        const p = fc < 0 ? 1 : (frame - fc) / dur;
        return <Blade key={i} x={x + i * (w + gap)} y={y} w={w} h={h} from={fc < 0 ? dig(frame, i) : dig(fc - 1, i)} to={dig(frame, i)} p={p} size={size} color={color} weight={700} />;
      })}
    </>
  );
};

// ---------- LED dot matrix ----------
export type Box = [number, number, number, number];
export const useLedMap = (box: Box, extent: [number, number, number, number]) =>
  useMemo(() => {
    const [w, s, e, n] = extent;
    const f = region([[w, s], [w, n], [e, n], [e, s]]);
    const projection = geoMercator().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], f);
    return { projection, path: geoPath(projection) };
  }, [box.join(), extent.join()]);

const polyLen = (pts: [number, number][]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
// Point and heading at fraction k along a screen polyline.
export const along = (pts: [number, number][], k: number): [number, number, number] => {
  const L = polyLen(pts) * Math.max(0, Math.min(1, k));
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L || i === pts.length - 1) {
      const t = d ? Math.min(1, (L - acc) / d) : 0;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t, Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])];
    }
    acc += d;
  }
  return [pts[0][0], pts[0][1], 0];
};

const PITCH = 10;
// Dot patterns, aligned to the panel so every layer's dots fall on the same grid.
export const LedDefs = ({ box }: { box: Box }) => (
  <defs>
    {[
      ["m13-off", 2.8, "#241804", 0.9],
      ["m13-land", 3.3, C.amber, 0.36],
      ["m13-coast", 3.9, "#ffd36b", 1],
      ["m13-hot", 4.1, "#ffd36b", 1],
      ["m13-red", 4.1, "#ff6a4d", 1],
    ].map(([id, r, c, o]) => (
      <pattern key={id as string} id={id as string} x={box[0]} y={box[1]} width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
        <circle cx={PITCH / 2} cy={PITCH / 2} r={r as number} fill={c as string} opacity={o as number} />
      </pattern>
    ))}
    <filter id="m13-bloom" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={6} />
    </filter>
    <pattern id="m13-txt" x={0} y={0} width={4.6} height={4.6} patternUnits="userSpaceOnUse">
      <circle cx={2.3} cy={2.3} r={1.85} fill={C.amber} />
    </pattern>
    <pattern id="m13-txt-s" x={0} y={0} width={3.2} height={3.2} patternUnits="userSpaceOnUse">
      <circle cx={1.6} cy={1.6} r={1.35} fill="#ffc23d" />
    </pattern>
    <pattern id="m13-txt-red" x={0} y={0} width={4.6} height={4.6} patternUnits="userSpaceOnUse">
      <circle cx={2.3} cy={2.3} r={1.85} fill="#ff6a4d" />
    </pattern>
  </defs>
);

// The LED panel: off dots everywhere, land dots lit at low power, a bezel and a few dead pixels.
export const LedPanel = ({ box, land, children }: { box: Box; land: string; children?: ReactNode }) => {
  const [x, y, w, h] = box;
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={6} fill="#050505" stroke="#2c2c2a" strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h} fill="url(#m13-off)" />
      <clipPath id="m13-panel">
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath="url(#m13-panel)">
        <mask id="m13-landmask">
          <path d={land} fill="#fff" />
        </mask>
        <rect x={x} y={y} width={w} height={h} fill="url(#m13-land)" mask="url(#m13-landmask)" />
        {/* the coastline runs one dot brighter */}
        <mask id="m13-coastmask">
          <path d={land} fill="none" stroke="#fff" strokeWidth={9} />
        </mask>
        <rect x={x} y={y} width={w} height={h} fill="url(#m13-coast)" mask="url(#m13-coastmask)" />
        {children}
      </g>
    </g>
  );
};
export const landPath = (path: ReturnType<typeof geoPath>) => path(LAND) ?? "";

// A route lighting up dot by dot: a bright dot field masked by the stroked route up to k, plus bloom and a
// blinking head block.
export const LedRoute = ({ id, pts, k, frame, red = false, width = 15 }: { id: string; pts: [number, number][]; k: number; frame: number; red?: boolean; width?: number }) => {
  if (k <= 0) return null;
  const L = polyLen(pts);
  // quantise the reveal to the dot pitch so it advances one dot at a time
  const shown = Math.floor((L * Math.min(1, k)) / PITCH) * PITCH;
  const d = `M${pts.map((p) => p.join(" ")).join(" L")}`;
  const [hx, hy] = along(pts, shown / L);
  const blink = Math.floor(frame / 6) % 2 === 0 && k < 1;
  const hot = red ? "url(#m13-red)" : "url(#m13-hot)";
  const glow = red ? "#ff5a3a" : "#ffb21e";
  return (
    <g>
      <mask id={`m13-r-${id}`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${shown} ${L + 50}`} />
        {blink && <rect x={hx - 16} y={hy - 16} width={32} height={32} fill="#fff" />}
      </mask>
      <path d={d} fill="none" stroke={glow} strokeOpacity={0.35} strokeWidth={width * 2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${shown} ${L + 50}`} filter="url(#m13-bloom)" />
      <rect x={0} y={0} width={1080} height={1920} fill={hot} mask={`url(#m13-r-${id})`} />
    </g>
  );
};

// A city on the LED map: a lit 3×3 block, label in LED text; `flash` pulses it.
export const LedCity = ({ at, text, dx = 14, dy = -16, anchor = "start", on = 1, flash = 0, red = false, size = 30 }: { at: [number, number]; text: string; dx?: number; dy?: number; anchor?: "start" | "end" | "middle"; on?: number; flash?: number; red?: boolean; size?: number }) => {
  if (on <= 0) return null;
  const [x, y] = at;
  const c = red ? "#ff6a4d" : "#ffd36b";
  return (
    <g opacity={on}>
      {flash > 0 && <circle cx={x} cy={y} r={22 + flash * 26} fill={c} opacity={0.35 * flash} filter="url(#m13-bloom)" />}
      {[-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => <circle key={`${i}${j}`} cx={Math.round(x / PITCH) * PITCH + i * PITCH} cy={Math.round(y / PITCH) * PITCH + j * PITCH} r={4} fill={c} />))}
      <text x={x + dx} y={y + dy} textAnchor={anchor} fontFamily={font} fontWeight={700} fontSize={size} fill="none" stroke="#050505" strokeWidth={12} strokeLinejoin="round">
        {text}
      </text>
      <LedText x={x + dx} y={y + dy} text={text} size={size} anchor={anchor} red={red} />
    </g>
  );
};

// Dot-matrix text: the glyphs are a mask over a fine LED dot field.
export const LedText = ({ x, y, text, size, anchor = "start", red = false, weight = 700, glow = true }: { x: number; y: number; text: string; size: number; anchor?: "start" | "end" | "middle"; red?: boolean; weight?: number; glow?: boolean }) => {
  const id = `m13-t-${Math.round(x)}-${Math.round(y)}-${text.length}`;
  const t = (fill: string) => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={weight} fontSize={size} fill={fill}>
      {text}
    </text>
  );
  return (
    <g>
      <mask id={id}>{t("#fff")}</mask>
      {glow && <g opacity={0.45} filter="url(#m13-bloom)">{t(red ? "#ff5a3a" : C.amber)}</g>}
      <rect x={0} y={0} width={1080} height={1920} fill={red ? "url(#m13-txt-red)" : size < 40 ? "url(#m13-txt-s)" : "url(#m13-txt)"} mask={`url(#${id})`} />
    </g>
  );
};

export type Proj = GeoProjection;
export const fade = (frame: number, f0: number, f1: number, d = 8) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);
