import { loadFont } from "@remotion/google-fonts/Niramit";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land10 from "world-atlas/land-10m.json";

// M31 weather radar scope: a round phosphor scope set in a painted steel console. Range rings, azimuth bezel and
// a coastline glow faint green; a sweep beam turns once every `period` frames and leaves a fading afterglow.
// Rain echoes are painted only where the beam has passed: each pixel shows the storm as it was when the beam last
// crossed its bearing, coloured on a reflectivity (dBZ) scale. Everything drawn in code.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  console: "#5f6a35", // olive-drab enamel steel
  stencil: "#f1ecd2", // painted lettering on the console
  scope: "#03110a", // phosphor glass, off
  phosphor: "#2fd35a", // sweep, rings, coast
  dim: "#1d6b37",
  text: "#c9f5d2",
  amber: "#f5e12a",
  red: "#ef2b1b",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (f: number, a: number, b: number, d = 10) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);

const topo = land10 as unknown as Topology<{ land: GeometryCollection }>;
export const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

// Reflectivity colour steps [dBZ, colour] (a conventional radar scale, drawn in our own tones).
export const DBZ: [number, string][] = [
  [15, "#7be38a"],
  [22, "#2fc04f"],
  [28, "#13892f"],
  [34, "#f5e12a"],
  [40, "#f8b21c"],
  [45, "#f5731a"],
  [50, "#ef2b1b"],
  [55, "#b8121a"],
  [60, "#d23ad8"],
];
const DBZ_RGB = DBZ.map(([d, c]) => [d, parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] as const);

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number) => vnoise(x, y) * 0.5 + vnoise(x * 2.03, y * 2.03) * 0.3 + vnoise(x * 4.1, y * 4.1) * 0.2;

export type Scope = { cx: number; cy: number; r: number; rangeKm: number; centre: [number, number] };

// Mercator projection with the scope centre at the screen centre of the scope and `rangeKm` at radius `r`.
export const scopeProj = (s: Scope): GeoProjection => {
  const kmPerDeg = 111.32;
  const scale = (s.r / s.rangeKm) * kmPerDeg * (180 / Math.PI) * Math.cos((s.centre[1] * Math.PI) / 180);
  return geoMercator().center(s.centre).scale(scale).translate([s.cx, s.cy]);
};

// A tropical storm as a rain field: an eye, a dense core and spiral bands, broken up by convective cells.
export type Storm = { at: (t: number) => [number, number]; spin: number; size: number };
const stormDbz = (dx: number, dy: number, t: number, st: Storm) => {
  const r = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  const z = r / st.size;
  const phi = th + Math.log(Math.max(z, 0.05)) * 1.9 - t * st.spin;
  const band = Math.pow(0.5 + 0.5 * Math.cos(2 * phi), 2.4) * Math.exp(-z * 1.25);
  const core = Math.exp(-Math.pow((z - 0.17) / 0.11, 2)) * 1.05;
  const eye = z < 0.07 ? 0 : 1;
  const cells = fbm(dx / 22 + t * 0.012, dy / 22 - t * 0.008);
  const grain = vnoise(dx / 7 + t * 0.03, dy / 7);
  const v = Math.max(core, band) * eye * (0.1 + 1.45 * Math.pow(cells, 1.4)) * (0.8 + 0.4 * grain);
  return 8 + v * 56;
};

// The painted echoes on the scope (ImageData at `cell` px), given the beam angle now.
export const echoField = ({ scope, frame, period, storm, cell = 3, proj }: { scope: Scope; frame: number; period: number; storm: Storm; cell?: number; proj: GeoProjection }) => {
  const D = Math.ceil((scope.r * 2) / cell);
  const img = new ImageData(D, D);
  const kmPerPx = scope.rangeKm / scope.r;
  const beam = ((frame / period) * Math.PI * 2) % (Math.PI * 2); // clockwise from north
  // storm centre in screen px at time t
  const cache = new Map<number, [number, number]>();
  const centreAt = (t: number) => {
    const k = Math.round(t);
    if (!cache.has(k)) cache.set(k, proj(storm.at(k)) as [number, number]);
    return cache.get(k)!;
  };
  for (let j = 0; j < D; j++) {
    for (let i = 0; i < D; i++) {
      const x = scope.cx - scope.r + (i + 0.5) * cell;
      const y = scope.cy - scope.r + (j + 0.5) * cell;
      const ox = x - scope.cx, oy = y - scope.cy;
      const rr = Math.hypot(ox, oy);
      if (rr > scope.r - 2) continue;
      let az = Math.atan2(ox, -oy); // clockwise from north
      if (az < 0) az += Math.PI * 2;
      let age = (beam - az) / (Math.PI * 2);
      if (age < 0) age += 1;
      const tp = frame - age * period;
      if (tp < 0) continue; // the beam has not reached this bearing yet
      const [sx, sy] = centreAt(tp);
      const dbz = stormDbz((x - sx) * kmPerPx, (y - sy) * kmPerPx, tp, storm);
      if (dbz < DBZ[0][0]) continue;
      let k = 0;
      while (k < DBZ_RGB.length - 1 && dbz >= DBZ_RGB[k + 1][0]) k++;
      const [, R, G, B] = DBZ_RGB[k];
      const glow = 1 - age * 0.42; // phosphor afterglow fades over one turn
      const p = (j * D + i) * 4;
      img.data[p] = R * glow;
      img.data[p + 1] = G * glow;
      img.data[p + 2] = B * glow;
      img.data[p + 3] = 235 * (0.65 + 0.35 * glow);
    }
  }
  return { img, D, beam };
};

export const EchoCanvas = ({ img, scope }: { img: ImageData; scope: Scope }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = img.width;
    cv.height = img.height;
    cv.getContext("2d")!.putImageData(img, 0, 0);
  }, [img]);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", left: scope.cx - scope.r, top: scope.cy - scope.r, width: scope.r * 2, height: scope.r * 2, imageRendering: "pixelated", filter: "blur(0.6px) saturate(1.1)", clipPath: "circle(50%)" }}
    />
  );
};

// Painted steel console with fine speckle, a bevelled well around the scope and four screws.
export const Console = ({ width, height, scope }: { width: number; height: number; scope: Scope }) => (
  <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id="m31-speck" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.7  0 0 0 0 0.6  0 0 0 0.09 0" />
      </filter>
      <linearGradient id="m31-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7a8642" />
        <stop offset="0.5" stopColor={C.console} />
        <stop offset="1" stopColor="#465026" />
      </linearGradient>
      <radialGradient id="m31-well" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.9" stopColor="#000" stopOpacity={0.9} />
        <stop offset="1" stopColor="#000" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="m31-bezel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5d675f" />
        <stop offset="0.45" stopColor="#262d28" />
        <stop offset="1" stopColor="#0c100d" />
      </linearGradient>
      <radialGradient id="m31-glass" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#062514" />
        <stop offset="0.8" stopColor={C.scope} />
        <stop offset="1" stopColor="#010603" />
      </radialGradient>
    </defs>
    <rect width={width} height={height} fill="url(#m31-steel)" />
    <rect width={width} height={height} filter="url(#m31-speck)" />
    {/* panel seams */}
    {[372, 1418].map((y) => (
      <g key={y}>
        <line x1={0} x2={width} y1={y} y2={y} stroke="#000" strokeWidth={3} />
        <line x1={0} x2={width} y1={y + 3} y2={y + 3} stroke="#9aa564" strokeWidth={1.5} />
      </g>
    ))}
    {[[44, 44], [width - 44, 44], [44, height - 44], [width - 44, height - 44], [44, 400], [width - 44, 400], [44, 1446], [width - 44, 1446]].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={13} fill="#8b9558" stroke="#2b3016" strokeWidth={2} />
        <line x1={x - 8} x2={x + 8} y1={y - 3 + (i % 3)} y2={y + 3 - (i % 3)} stroke="#0b0f0c" strokeWidth={3} />
      </g>
    ))}
    <circle cx={scope.cx} cy={scope.cy} r={scope.r + 68} fill="url(#m31-well)" />
    <circle cx={scope.cx} cy={scope.cy} r={scope.r + 44} fill="url(#m31-bezel)" stroke="#000" strokeWidth={3} />
    <circle cx={scope.cx} cy={scope.cy} r={scope.r + 6} fill="#000" />
    <circle cx={scope.cx} cy={scope.cy} r={scope.r} fill="url(#m31-glass)" />
  </svg>
);

// Rings, cross-hairs, coastline and azimuth bezel: everything fixed on the scope face.
export const Graticule = ({ scope, proj, rings }: { scope: Scope; proj: GeoProjection; rings: number[] }) => {
  const path = useMemo(() => geoPath(proj), [proj]);
  const land = useMemo(() => path(LAND) ?? "", [path]);
  const { cx, cy, r } = scope;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id="m31-face">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <filter id="m31-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={3} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g clipPath="url(#m31-face)">
        <path d={land} fill="#06190d" stroke={C.phosphor} strokeWidth={2.2} strokeOpacity={0.85} filter="url(#m31-glow)" />
        {rings.map((km) => (
          <circle key={km} cx={cx} cy={cy} r={(km / scope.rangeKm) * r} fill="none" stroke={C.phosphor} strokeOpacity={0.45} strokeWidth={1.6} strokeDasharray={km === scope.rangeKm ? undefined : "2 7"} />
        ))}
        <path d={`M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}`} stroke={C.phosphor} strokeOpacity={0.3} strokeWidth={1.2} />
      </g>
      {rings.map((km) => (
        <text key={km} x={cx + 8} y={cy - (km / scope.rangeKm) * r + 26} fontFamily={font} fontSize={21} fontWeight={600} fill={C.phosphor} opacity={0.8}>{km} กม.</text>
      ))}
      {/* azimuth bezel: ticks every 5°, figures every 30° */}
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const big = i % 6 === 0;
        const r0 = r + 10, r1 = r + (big ? 30 : 20);
        return <line key={i} x1={cx + Math.sin(a) * r0} y1={cy - Math.cos(a) * r0} x2={cx + Math.sin(a) * r1} y2={cy - Math.cos(a) * r1} stroke="#a9b5ac" strokeWidth={big ? 3 : 1.6} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const rr = r + 50;
        if (i === 0) return null;
        return <text key={i} x={cx + Math.sin(a) * rr} y={cy - Math.cos(a) * rr + 7} textAnchor="middle" fontFamily={font} fontSize={19} fontWeight={600} fill="#8e9a91">{String(i * 30).padStart(3, "0")}</text>;
      })}
      <text x={cx} y={cy - r - 34} textAnchor="middle" fontFamily={font} fontSize={26} fontWeight={700} fill="#d8e2da">N</text>
    </svg>
  );
};

// The beam: a bright line plus a fading wedge behind it (the phosphor trail).
export const Sweep = ({ scope, beam }: { scope: Scope; beam: number }) => {
  const { cx, cy, r } = scope;
  const n = 26;
  const wedge = Array.from({ length: n }, (_, i) => {
    const a0 = beam - (i + 1) * 0.03, a1 = beam - i * 0.03;
    return (
      <path
        key={i}
        d={`M${cx} ${cy}L${cx + Math.sin(a0) * r} ${cy - Math.cos(a0) * r}A${r} ${r} 0 0 1 ${cx + Math.sin(a1) * r} ${cy - Math.cos(a1) * r}Z`}
        fill={C.phosphor}
        opacity={0.2 * Math.pow(1 - i / n, 2)}
      />
    );
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      <defs>
        <filter id="m31-beam" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      {wedge}
      <line x1={cx} y1={cy} x2={cx + Math.sin(beam) * r} y2={cy - Math.cos(beam) * r} stroke={C.phosphor} strokeWidth={12} opacity={0.5} filter="url(#m31-beam)" />
      <line x1={cx} y1={cy} x2={cx + Math.sin(beam) * r} y2={cy - Math.cos(beam) * r} stroke="#dfffe6" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={7} fill="#dfffe6" />
    </svg>
  );
};

// Glass reflection over the scope (a soft highlight top-left) and a faint scan texture.
export const Glass = ({ scope }: { scope: Scope }) => {
  const { cx, cy, r } = scope;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="m31-hl" cx="0.3" cy="0.22" r="0.55">
          <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="m31-edge" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.82" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#m31-edge)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#m31-hl)" />
    </svg>
  );
};

// Phosphor text: green with a soft glow.
export const Glow = ({ children, size, weight = 600, color = C.text, style }: { children: ReactNode; size: number; weight?: number; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, lineHeight: 1.2, textShadow: `0 0 10px ${C.phosphor}66, 0 0 2px ${C.phosphor}`, ...style }}>{children}</div>
);

// Engraved label plate on the console.
export const Plate = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 6, background: "linear-gradient(#1b231d, #0b0f0c)", boxShadow: "inset 0 2px 0 #34403a, inset 0 -2px 0 #000, 0 2px 0 #9aa564, 0 -2px 0 #2b3016", display: "flex", alignItems: "center", padding: "0 22px", boxSizing: "border-box" }}>
    {children}
  </div>
);

// dBZ legend strip.
export const Legend = ({ x, y, w }: { x: number; y: number; w: number }) => {
  const n = DBZ.length;
  const cw = w / n;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {DBZ.map(([d, c], i) => (
        <g key={d}>
          <rect x={x + i * cw} y={y} width={cw - 4} height={30} fill={c} />
          <text x={x + i * cw} y={y + 62} fontFamily={font} fontSize={22} fontWeight={600} fill={C.stencil}>{d}</text>
        </g>
      ))}
      <text x={x + w} y={y + 62} textAnchor="end" fontFamily={font} fontSize={22} fontWeight={600} fill={C.stencil}>dBZ</text>
    </svg>
  );
};

// Tropical storm symbol (circle with two spiral arms), drawn in phosphor white.
export const StormMark = ({ x, y, on = 1, rot = 0 }: { x: number; y: number; on?: number; rot?: number }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: on }}>
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0 -16 C 14 -16 22 -30 18 -40 M0 16 C -14 16 -22 30 -18 40" fill="none" stroke="#000" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      <path d="M0 -16 C 14 -16 22 -30 18 -40 M0 16 C -14 16 -22 30 -18 40" fill="none" stroke="#f2fff4" strokeWidth={5} strokeLinecap="round" />
      <circle r={16} fill="none" stroke="#000" strokeWidth={10} opacity={0.6} />
      <circle r={16} fill="none" stroke="#f2fff4" strokeWidth={5} />
    </g>
  </svg>
);
