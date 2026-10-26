import { loadFont } from "@remotion/google-fonts/Srisakdi";
import { loadFont as loadLatin } from "@remotion/google-fonts/Trirong";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { ReactNode } from "react";
import { interpolate, random } from "remotion";

// M35 temple stucco relief: the story is modelled in white lime stucco (ปูนปั้น) on a Thai temple gable. Everything
// in the gable is a HEIGHT MAP (grey = height) lit by a low warm sun through an SVG lighting filter, so the kanok
// flame scrolls, the chedis and the map's carved rivers read as real relief. The sun moves (azimuth and elevation
// animate) and elements rise out of the plaster as the story names them. Black mould streaks and moss weather it;
// red-lacquer and gilt bargeboards, orange and green roof tiles frame it.

export const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
// Srisakdi's Latin capitals are ornamental; the pack ID in the kicker is set in Trirong
export const latin = loadLatin("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  skyTop: "#1f3d66",
  skyLow: "#f0a560",
  stucco: "#fbf5ea", // lime stucco in sun
  field: "#3db394", // the painted jade-green ground behind the relief
  wall: "#d8c8a6",
  mould: "#24251d",
  moss: "#5c6a34",
  lacquer: "#7a2618",
  gilt: "#caa04c",
  giltDark: "#8a6524",
  tile: "#c45a2c", // orange roof tiles
  tileDark: "#7d3218",
  tileEdge: "#2f6e4a", // the green-glazed edge course
  incised: "#43372a",
  text: "#fff3dc",
};

export const W = 1080;
export const H = 1920;

// gable geometry: inner triangle (the stucco panel)
export const APEX: [number, number] = [1010, 40];
export const BL: [number, number] = [-700, 1900];
export const BR: [number, number] = [2720, 1900];
export const tri = `M${APEX[0]} ${APEX[1]} L${BR[0]} ${BR[1]} L${BL[0]} ${BL[1]} Z`;
// half width of the panel at height y
export const halfAt = (y: number) => ((BR[0] - BL[0]) / 2) * ((y - APEX[1]) / (BL[1] - APEX[1]));

// height (0..1) → grey fill for the height map
export const hgt = (h: number) => {
  const v = Math.round(Math.max(0, Math.min(1, h)) * 255);
  return `rgb(${v},${v},${v})`;
};
// rise: from the plaster level `base` to `top` as k goes 0 → 1
export const rise = (k: number, top: number, base = BASE) => hgt(base + (top - base) * Math.max(0, Math.min(1, k)));
export const BASE = 0.34;

// ---------------------------------------------------------------- the lighting
// `az` sun azimuth (deg, SVG convention: 0 = from the right, 90 = from below, 180 = from the left, 270 = from above),
// `el` elevation (deg). `scale` = relief depth in px.
export const ReliefDefs = ({ az, el, scale = 13 }: { az: number; el: number; scale?: number }) => (
  <defs>
    <filter id="m35-relief" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.33 0.33 0.33 0 0" result="h" />
      <feGaussianBlur in="h" stdDeviation={2.2} result="hb" />
      <feDiffuseLighting in="hb" surfaceScale={scale} diffuseConstant={1.7} lightingColor="#ffe6c4" result="lit">
        <feDistantLight azimuth={az} elevation={el} />
      </feDiffuseLighting>
      <feSpecularLighting in="hb" surfaceScale={scale} specularConstant={0.55} specularExponent={22} lightingColor="#fff6e4" result="spec">
        <feDistantLight azimuth={az} elevation={el} />
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
      {/* paint: the sunk ground (height below ~0.45) is the gable's painted blue field, everything raised is white */}
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.33 -0.33 -0.33 0 1" result="low" />
      <feComponentTransfer in="low" result="groundMask">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1" />
      </feComponentTransfer>
      <feGaussianBlur in="groundMask" stdDeviation={0.8} result="gm" />
      <feFlood floodColor={C.field} result="blue" />
      <feComposite in="blue" in2="gm" operator="in" result="blueIn" />
      <feFlood floodColor={C.stucco} result="white" />
      <feMerge result="paint">
        <feMergeNode in="white" />
        <feMergeNode in="blueIn" />
      </feMerge>
      <feComposite in="lit" in2="paint" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="col" />
      {/* a little sky bounce in the shadows so they are cool and not black */}
      <feFlood floodColor="#4a5a78" floodOpacity={0.16} result="amb" />
      <feComposite in="amb" in2="col" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="col2" />
      <feComposite in="specIn" in2="col2" operator="arithmetic" k1={0} k2={0.5} k3={1} k4={0} result="all" />
      <feComposite in="all" in2="SourceAlpha" operator="in" />
    </filter>
    {/* black mould: vertical streaks running down from the ledges */}
    <filter id="m35-mould" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.022 0.003" numOctaves={4} seed={21} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.14  0 0 0 0 0.15  0 0 0 0 0.11  0 0 0 3.4 -1.55" />
    </filter>
    <filter id="m35-moss" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={4} seed={5} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.36  0 0 0 0 0.42  0 0 0 0 0.2  0 0 0 3.8 -1.75" />
    </filter>
    <filter id="m35-grit" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={8} />
      <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 0.35 -0.05" />
    </filter>
    <linearGradient id="m35-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.skyTop} />
      <stop offset="0.5" stopColor="#8a6c84" />
      <stop offset="1" stopColor={C.skyLow} />
    </linearGradient>
    <linearGradient id="m35-mouldFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
      <stop offset="0.35" stopColor="#fff" stopOpacity={0.35} />
      <stop offset="0.8" stopColor="#fff" stopOpacity={0.15} />
      <stop offset="1" stopColor="#fff" stopOpacity={0.6} />
    </linearGradient>
    <linearGradient id="m35-mossFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.7" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#fff" stopOpacity={0.9} />
    </linearGradient>
    <mask id="m35-mouldMask" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="url(#m35-mouldFade)" />
    </mask>
    <mask id="m35-mossMask" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="url(#m35-mossFade)" />
    </mask>
    <linearGradient id="m35-eave" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#120a06" stopOpacity={0.4} />
      <stop offset="0.6" stopColor="#120a06" stopOpacity={0.08} />
      <stop offset="1" stopColor="#120a06" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="m35-gilt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f0d48a" />
      <stop offset="0.5" stopColor={C.gilt} />
      <stop offset="1" stopColor={C.giltDark} />
    </linearGradient>
    <clipPath id="m35-tri">
      <path d={tri} />
    </clipPath>
  </defs>
);

// A relief group: children are a height map (use `hgt`/`rise` fills); the filter lights it.
export const Relief = ({ children, x = 0, y = 0, w = W, h = H }: { children: ReactNode; x?: number; y?: number; w?: number; h?: number }) => (
  <g filter="url(#m35-relief)">
    <rect x={x} y={y} width={w} height={h} fill={hgt(BASE)} />
    {/* lime texture: small pits and lumps in the plaster */}
    {Array.from({ length: 140 }, (_, i) => (
      <circle key={i} cx={x + random(`px${i}`) * w} cy={y + random(`py${i}`) * h} r={1.5 + random(`pr${i}`) * 4} fill={hgt(BASE + (random(`ph${i}`) - 0.5) * 0.12)} />
    ))}
    {children}
  </g>
);

// Weathering over a region (multiply): mould streaks fading down, moss gathered at the foot.
export const Weather = ({ x, y, w, h, mould = 1, moss = 1 }: { x: number; y: number; w: number; h: number; mould?: number; moss?: number }) => (
  <g style={{ mixBlendMode: "multiply" }}>
    <g mask="url(#m35-mouldMask)" opacity={mould}>
      <rect x={x} y={y} width={w} height={h} filter="url(#m35-mould)" />
    </g>
    <g mask="url(#m35-mossMask)" opacity={moss}>
      <rect x={x} y={y} width={w} height={h} filter="url(#m35-moss)" />
    </g>
    <rect x={x} y={y} width={w} height={h} filter="url(#m35-grit)" opacity={0.12} />
  </g>
);

// ---------------------------------------------------------------- relief motifs (height-map shapes)
// Kanok flame scroll: a spiral stem with flame leaves on its outer side. `flip` mirrors it.
const FLAME = "M0 0 C10 -16 8 -44 -10 -70 C20 -52 30 -22 16 2 Z";
export const Kanok = ({ x, y, s = 1, flip = false, rot = 0, h = 0.78, k = 1 }: { x: number; y: number; s?: number; flip?: boolean; rot?: number; h?: number; k?: number }) => {
  if (k <= 0) return null;
  const pts: [number, number][] = [];
  const turns = 1.55 * Math.PI * 2;
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * turns;
    const r = 8 * Math.exp(0.2 * t);
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  const stem = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const leaves = [0.42, 0.52, 0.62, 0.71, 0.8, 0.88, 0.95, 1].map((u) => {
    const i = Math.round(u * 60);
    const t = (i / 60) * turns;
    const [px, py] = pts[i];
    const deg = (t * 180) / Math.PI + 90 - 28; // outward, leaning along the stem
    return { px, py, deg, sc: 0.6 + u * 0.7 };
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <path d={stem} fill="none" stroke={rise(k, h * 0.92)} strokeWidth={13} strokeLinecap="round" />
      <path d={stem} fill="none" stroke={rise(k, h)} strokeWidth={5} strokeLinecap="round" />
      {leaves.map((l, i) => (
        <path key={i} d={FLAME} transform={`translate(${l.px} ${l.py}) rotate(${l.deg}) scale(${l.sc})`} fill={rise(k, h * 0.95)} />
      ))}
      <circle cx={0} cy={0} r={9} fill={rise(k, h)} />
    </g>
  );
};

// Bell-shaped chedi in elevation, base at (x, y), total height `ht`.
export const Chedi = ({ x, y, ht, h = 0.92, k = 1 }: { x: number; y: number; ht: number; h?: number; k?: number }) => {
  if (k <= 0) return null;
  const w = ht * 0.5;
  const f = (hh: number) => rise(k, hh);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w * 0.55} y={-ht * 0.06} width={w * 1.1} height={ht * 0.06} fill={f(h * 0.8)} />
      <rect x={-w * 0.46} y={-ht * 0.11} width={w * 0.92} height={ht * 0.05} fill={f(h * 0.86)} />
      <rect x={-w * 0.38} y={-ht * 0.16} width={w * 0.76} height={ht * 0.05} fill={f(h * 0.9)} />
      <path d={`M${-w * 0.34} ${-ht * 0.16} C${-w * 0.36} ${-ht * 0.36} ${-w * 0.2} ${-ht * 0.5} 0 ${-ht * 0.52} C${w * 0.2} ${-ht * 0.5} ${w * 0.36} ${-ht * 0.36} ${w * 0.34} ${-ht * 0.16} Z`} fill={f(h)} />
      <rect x={-w * 0.1} y={-ht * 0.58} width={w * 0.2} height={ht * 0.06} fill={f(h * 0.88)} />
      <path d={`M${-w * 0.07} ${-ht * 0.58} L0 ${-ht} L${w * 0.07} ${-ht * 0.58} Z`} fill={f(h * 0.95)} />
      {[0.64, 0.7, 0.76, 0.82].map((u) => <rect key={u} x={-w * 0.07 * (1 - (u - 0.58) / 0.42)} y={-ht * u} width={w * 0.14 * (1 - (u - 0.58) / 0.42)} height={2.5} fill={f(h * 0.7)} />)}
      {/* a band of beads round the bell */}
      <rect x={-w * 0.3} y={-ht * 0.2} width={w * 0.6} height={3} fill={f(h * 0.75)} />
    </g>
  );
};

// Prang (corn-cob tower) in elevation.
export const Prang = ({ x, y, ht, h = 0.92, k = 1 }: { x: number; y: number; ht: number; h?: number; k?: number }) => {
  if (k <= 0) return null;
  const w = ht * 0.42;
  const f = (hh: number) => rise(k, hh);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w * 0.6} y={-ht * 0.08} width={w * 1.2} height={ht * 0.08} fill={f(h * 0.78)} />
      <rect x={-w * 0.48} y={-ht * 0.16} width={w * 0.96} height={ht * 0.08} fill={f(h * 0.84)} />
      <path d={`M${-w * 0.34} ${-ht * 0.16} L${-w * 0.34} ${-ht * 0.42} C${-w * 0.34} ${-ht * 0.66} ${-w * 0.16} ${-ht * 0.8} 0 ${-ht * 0.84} C${w * 0.16} ${-ht * 0.8} ${w * 0.34} ${-ht * 0.66} ${w * 0.34} ${-ht * 0.42} L${w * 0.34} ${-ht * 0.16} Z`} fill={f(h)} />
      {[0.46, 0.56, 0.65, 0.73].map((u) => <rect key={u} x={-w * 0.36} y={-ht * u} width={w * 0.72} height={3} fill={f(h * 0.7)} />)}
      <rect x={-w * 0.12} y={-ht * 0.36} width={w * 0.24} height={ht * 0.2} fill={f(h * 0.6)} />
      <path d={`M-2 ${-ht * 0.84} L0 ${-ht} L2 ${-ht * 0.84} Z`} fill={f(h)} stroke={f(h)} strokeWidth={3} />
    </g>
  );
};

// A boat on the river (a small relief figure): hull and an oarsman.
export const Boat = ({ x, y, s = 1, h = 0.8, k = 1 }: { x: number; y: number; s?: number; h?: number; k?: number }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={rise(k, h)}>
      <path d="M-44 0 C-30 10 30 10 46 -6 L40 2 C20 12 -24 12 -44 0 Z" />
      <path d="M-46 -2 L-52 -14 L-40 -4 Z M46 -6 L54 -18 L40 -2 Z" />
      <circle cx={-6} cy={-22} r={6} />
      <path d="M-12 -16 L0 -16 L2 -2 L-12 -2 Z" />
      <path d="M0 -14 L22 6" stroke={rise(k, h)} strokeWidth={3} />
    </g>
  );

// Beads along a line (border moulding).
export const Beads = ({ a, b, step = 22, r = 6, h = 0.7 }: { a: [number, number]; b: [number, number]; step?: number; r?: number; h?: number }) => {
  const n = Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / step);
  return (
    <g fill={hgt(h)}>
      {Array.from({ length: n + 1 }, (_, i) => <circle key={i} cx={a[0] + ((b[0] - a[0]) * i) / n} cy={a[1] + ((b[1] - a[1]) * i) / n} r={r} />)}
    </g>
  );
};

// Lotus-petal band (บัว) along a horizontal line, petals pointing up.
export const Lotus = ({ x0, x1, y, size = 36, h = 0.72, down = false }: { x0: number; x1: number; y: number; size?: number; h?: number; down?: boolean }) => {
  const n = Math.floor((x1 - x0) / size);
  const sy = down ? -1 : 1;
  return (
    <g fill={hgt(h)}>
      <rect x={x0} y={down ? y - 8 : y} width={x1 - x0} height={8} />
      {Array.from({ length: n }, (_, i) => {
        const cx = x0 + size * (i + 0.5);
        return <path key={i} d={`M${cx - size * 0.44} ${y} C${cx - size * 0.42} ${y - sy * size * 0.5} ${cx - size * 0.1} ${y - sy * size * 0.8} ${cx} ${y - sy * size * 0.95} C${cx + size * 0.1} ${y - sy * size * 0.8} ${cx + size * 0.42} ${y - sy * size * 0.5} ${cx + size * 0.44} ${y} Z`} />;
      })}
    </g>
  );
};

// Rivers carved into the plaster: a raised bank either side and a deep channel. `k` 0..1 carves along the line.
export const Carved = ({ d, width, k, bank = 0.52, deep = 0.08 }: { d: string; width: number; k: number; bank?: number; deep?: number }) =>
  k <= 0 ? null : (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={hgt(bank)} strokeWidth={width + 12} pathLength={1} strokeDasharray={`${k} 2`} />
      <path d={d} stroke={hgt(deep)} strokeWidth={width} pathLength={1} strokeDasharray={`${k} 2`} />
      {/* ripple ridges in the channel, the way stucco water is modelled */}
      <path d={d} stroke={hgt(deep + 0.12)} strokeWidth={2.4} strokeDasharray="6 10" opacity={k} />
    </g>
  );

// ---------------------------------------------------------------- the painted frame (not relief)
const along = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// The roof seen close up: tile courses filling the frame outside the gable, darker towards the top (eave shade),
// a green-glazed edge course along each bargeboard.
export const Roof = ({ band = 150 }: { band?: number }) => {
  const off = 64;
  const side = (s: 1 | -1) => {
    const foot: [number, number] = [s === -1 ? BL[0] : BR[0], BL[1]];
    // courses run parallel to the slope, stepping outwards
    const dir = [foot[0] + s * off - APEX[0], foot[1] + 18 - (APEX[1] - off)];
    const len = Math.hypot(dir[0], dir[1]);
    const nx = (dir[1] / len) * s, ny = (-dir[0] / len) * s; // outward normal (away from the gable)
    // a band of roof `band` px wide beyond the bargeboard; the sky shows past it
    const ax = APEX[0], ay = APEX[1] - off, fx = foot[0] + s * off, fy = foot[1] + 18;
    const pts = `M${ax} ${ay} L${fx} ${fy} L${fx + nx * band} ${fy + ny * band} L${ax + nx * band} ${ay + ny * band} Z`;
    return (
      <g key={s}>
        <clipPath id={`m35-roof${s}`}>
          <path d={pts} />
        </clipPath>
        <g clipPath={`url(#m35-roof${s})`}>
          <rect x={-400} y={-400} width={W + 800} height={2400} fill={C.tile} />
          {Array.from({ length: 34 }, (_, i) => {
            const o = 40 + i * 26;
            const x0 = APEX[0] + nx * o, y0 = APEX[1] - off + ny * o;
            return (
              <g key={i}>
                <path d={`M${x0 - dir[0] * 0.4} ${y0 - dir[1] * 0.4} l${dir[0] * 1.6} ${dir[1] * 1.6}`} stroke={C.tileDark} strokeWidth={7} opacity={0.75} />
                <path d={`M${x0 - dir[0] * 0.4 + nx * 6} ${y0 - dir[1] * 0.4 + ny * 6} l${dir[0] * 1.6} ${dir[1] * 1.6}`} stroke="#e0804a" strokeWidth={2.5} opacity={0.7} />
              </g>
            );
          })}
          {Array.from({ length: 60 }, (_, i) => {
            const t = (i / 60) * 1.5 - 0.2;
            const x0 = APEX[0] + dir[0] * t, y0 = APEX[1] - off + dir[1] * t;
            return <path key={`e${i}`} d={`M${x0} ${y0} l${nx * 900} ${ny * 900}`} stroke={C.tileDark} strokeWidth={2} opacity={0.45} strokeDasharray="20 6" />;
          })}
          <path d={`M${APEX[0] + nx * 30 - dir[0] * 0.2} ${APEX[1] - off + ny * 30 - dir[1] * 0.2} l${dir[0] * 1.4} ${dir[1] * 1.4}`} stroke={C.tileEdge} strokeWidth={40} />
          <rect x={-20} y={-20} width={W + 40} height={1400} fill="url(#m35-eave)" />
        </g>
      </g>
    );
  };
  return (
    <g>
      {side(-1)}
      {side(1)}
    </g>
  );
};

// Bargeboards (ลำยอง) in red lacquer and gilt with bai raka fins, the chofa at the apex, hang hong at the feet.
export const Bargeboards = () => {
  const off = 64;
  const side = (s: 1 | -1) => {
    const foot: [number, number] = [s === -1 ? BL[0] : BR[0], BL[1]];
    const inner = `M${APEX[0]} ${APEX[1]} L${foot[0]} ${foot[1]}`;
    const band = `M${APEX[0]} ${APEX[1]} L${foot[0]} ${foot[1]} L${foot[0] + s * off} ${foot[1] + 18} L${APEX[0]} ${APEX[1] - off} Z`;
    const fins = Array.from({ length: 26 }, (_, i) => {
      const t = (i + 0.5) / 26;
      const p = along([APEX[0], APEX[1] - off], [foot[0] + s * off, foot[1] + 18], t);
      return `M${p[0]} ${p[1]} l${s * 30} ${-34} l${s * -4} ${26} Z`;
    }).join(" ");
    return (
      <g key={s}>
        <path d={fins} fill="url(#m35-gilt)" stroke={C.giltDark} strokeWidth={1.5} />
        <path d={band} fill={C.lacquer} />
        <path d={band} fill="none" stroke="url(#m35-gilt)" strokeWidth={9} strokeLinejoin="round" />
        <path d={inner} stroke={C.giltDark} strokeWidth={3} />
        {/* gilt lozenges along the lacquer */}
        {Array.from({ length: 14 }, (_, i) => {
          const t = (i + 0.5) / 14;
          const a = along([APEX[0], APEX[1] - off / 2], [foot[0] + (s * off) / 2, foot[1] + 9], t);
          return <path key={i} d={`M${a[0]} ${a[1] - 12} l9 12 l-9 12 l-9 -12 Z`} fill={C.gilt} opacity={0.85} />;
        })}
        {/* hang hong: the naga-tail curl at the foot */}
        <path d={`M${foot[0] + s * off * 0.5} ${foot[1] + 10} c${s * 30} 20 ${s * 60} 6 ${s * 66} -28 c${s * 4} -24 ${s * -20} -36 ${s * -34} -18 c${s * 14} -2 ${s * 22} 10 ${s * 14} 22`} fill="none" stroke="url(#m35-gilt)" strokeWidth={16} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g>
      {side(-1)}
      {side(1)}
      {/* chofa: the slender hooked finial at the apex */}
      <g transform={`translate(${APEX[0]} ${APEX[1]}) scale(0.66) translate(${-APEX[0]} ${-APEX[1]})`}>
      <path d={`M${APEX[0] - 22} ${APEX[1] - 54} C${APEX[0] - 20} ${APEX[1] - 120} ${APEX[0] + 6} ${APEX[1] - 176} ${APEX[0] + 40} ${APEX[1] - 190} C${APEX[0] + 18} ${APEX[1] - 160} ${APEX[0] + 6} ${APEX[1] - 120} ${APEX[0] + 18} ${APEX[1] - 54} Z`} fill="url(#m35-gilt)" stroke={C.giltDark} strokeWidth={2} />
      <path d={`M${APEX[0] + 40} ${APEX[1] - 190} c10 -2 16 8 8 14`} fill="none" stroke="url(#m35-gilt)" strokeWidth={8} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- map helpers
export const fitProj = (box: [number, number, number, number], [w, s, e, n]: [number, number, number, number]): GeoProjection =>
  geoMercator().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] } as never);
export const linePath = (proj: GeoProjection, lines: [number, number][][]) => geoPath(proj)({ type: "MultiLineString", coordinates: lines }) ?? "";

// Incised lettering (cut into the plaster): dark, with a light lip on the side away from the sun.
export const Incised = ({ x, y, text, size, weight = 700, anchor = "middle", opacity = 1, color = C.incised }: { x: number; y: number; text: string; size: number; weight?: number; anchor?: "start" | "middle" | "end"; opacity?: number; color?: string }) => (
  <g opacity={opacity} fontFamily={font} fontSize={size} fontWeight={weight} textAnchor={anchor}>
    <text x={x + 1.8} y={y + 2} fill="#fff6e2" opacity={0.75}>{text}</text>
    <text x={x} y={y} fill={color}>{text}</text>
  </g>
);

// Dust motes drifting in the sun.
export const Motes = ({ frame, k = 1 }: { frame: number; k?: number }) => (
  <g opacity={k}>
    {Array.from({ length: 26 }, (_, i) => {
      const x = (random(`mx${i}`) * W + frame * (0.3 + random(`ms${i}`) * 0.5)) % W;
      const y = (random(`my${i}`) * 1200 + 200 + Math.sin(frame * 0.02 + i) * 20) % 1900;
      return <circle key={i} cx={x} cy={y} r={1.2 + random(`mr${i}`) * 1.8} fill="#fff2cc" opacity={0.25 + 0.3 * random(`mo${i}`)} />;
    })}
  </g>
);

// A porch column in stucco (height map): fluted octagonal shaft, lotus-bud capital, a base moulding.
export const Column = ({ x, top, bottom, w = 96 }: { x: number; top: number; bottom: number; w?: number }) => (
  <g>
    <rect x={x - w / 2} y={top + 70} width={w} height={bottom - top - 70} fill={hgt(0.62)} />
    {[-0.3, -0.1, 0.1, 0.3].map((u) => <rect key={u} x={x + u * w - 2} y={top + 80} width={4} height={bottom - top - 90} fill={hgt(0.5)} />)}
    {/* lotus capital: rows of petals opening upwards */}
    <rect x={x - w * 0.62} y={top + 54} width={w * 1.24} height={16} fill={hgt(0.72)} />
    {[0, 1, 2].map((r) =>
      Array.from({ length: 5 }, (_, i) => {
        const cx = x - w * 0.5 + (w / 4) * i;
        const cy = top + 54 - r * 18;
        return <path key={`${r}-${i}`} d={`M${cx - 12} ${cy} C${cx - 12} ${cy - 16} ${cx - 3} ${cy - 24} ${cx} ${cy - 28} C${cx + 3} ${cy - 24} ${cx + 12} ${cy - 16} ${cx + 12} ${cy} Z`} fill={hgt(0.7 + r * 0.06)} />;
      }),
    )}
  </g>
);

// The dappled shadow of a bodhi tree beside the temple, falling across part of the gable. `region` is the shadow's
// outline (soft-edged); sun-flecks are holes in it that drift with the wind (`sway` px).
export const Dapple = ({ id, region, sway = 0, k = 0.7 }: { id: string; region: string; sway?: number; k?: number }) => (
  <g>
    <defs>
      <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={28} />
      </filter>
      <filter id={`${id}-holes`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={14} result="n" />
        <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 9 -5.2" result="a" />
        <feGaussianBlur in="a" stdDeviation={2.5} />
      </filter>
      <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}>
        <path d={region} fill="#fff" filter={`url(#${id}-soft)`} />
        <rect x={-200 + sway} y={-200 + sway * 0.4} width={W + 400} height={H + 400} filter={`url(#${id}-holes)`} />
      </mask>
    </defs>
    <rect width={W} height={H} fill="#1a2238" opacity={k} mask={`url(#${id}-mask)`} style={{ mixBlendMode: "multiply" }} />
  </g>
);

// Evening sky behind the roof: indigo above, rose, then amber towards the low sun on the left.
export const Sky = ({ warm = 0 }: { warm?: number }) => (
  <g>
    <defs>
      <linearGradient id="m35-eve" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#e7845e" />
        <stop offset="0.3" stopColor="#f3a565" />
        <stop offset="0.6" stopColor="#f8cf86" />
        <stop offset="0.85" stopColor="#fbe3a8" />
      </linearGradient>
      <radialGradient id="m35-sun" cx="0" cy="0.42" r="0.6">
        <stop offset="0" stopColor="#ffe0a0" stopOpacity={0.9} />
        <stop offset="0.4" stopColor="#ffb070" stopOpacity={0.35} />
        <stop offset="1" stopColor="#ffb070" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#m35-eve)" />
    <rect width={W} height={H} fill="url(#m35-sun)" opacity={0.6 + 0.4 * warm} />
  </g>
);
