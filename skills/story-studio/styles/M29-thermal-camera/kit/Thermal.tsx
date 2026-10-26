import { loadFont } from "@remotion/google-fonts/ChakraPetch";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import countries50 from "world-atlas/countries-50m.json";

// M29 thermal camera: the whole frame is the live view of an infrared camera pointed at a map. The heat field is
// computed per frame from land/sea and a few hot spots, mapped through an ironbow false-colour palette
// (black → violet → magenta → red → orange → yellow → white), smoothed like a low-resolution sensor, then given
// sensor grain and fixed-pattern column noise. A HUD on top: corner brackets, REC clock, temperature scale bar,
// crosshair spot meter, hot-spot box. Everything drawn in code.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  black: "#07020f", // coldest
  violet: "#5f0a8c",
  red: "#e1371e",
  yellow: "#ffd23a",
  white: "#fffbea", // hottest + HUD text
  hud: "#f4f7f2", // HUD ink
  shadow: "rgba(0,0,0,0.55)",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (f: number, a: number, b: number, d = 10) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);

const landTopo = land50 as unknown as Topology<{ land: GeometryCollection }>;
export const LAND = feature(landTopo, landTopo.objects.land) as unknown as FeatureCollection<Geometry>;
const cTopo = countries50 as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
export const COUNTRIES = feature(cTopo, cTopo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;

// Ironbow palette as a 256-entry lookup.
const STOPS: [number, number, number, number][] = [
  [0, 4, 0, 10],
  [0.12, 22, 4, 72],
  [0.27, 92, 10, 140],
  [0.41, 172, 18, 132],
  [0.54, 224, 52, 58],
  [0.67, 248, 118, 20],
  [0.81, 255, 192, 30],
  [0.92, 255, 238, 118],
  [1, 255, 253, 238],
];
export const LUT = (() => {
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
    const [t0, r0, g0, b0] = STOPS[k];
    const [t1, r1, g1, b1] = STOPS[k + 1];
    const u = (t - t0) / (t1 - t0);
    out[i * 3] = r0 + (r1 - r0) * u;
    out[i * 3 + 1] = g0 + (g1 - g0) * u;
    out[i * 3 + 2] = b0 + (b1 - b0) * u;
  }
  return out;
})();
export const ironbow = (t: number) => {
  const i = Math.max(0, Math.min(255, Math.round(t * 255))) * 3;
  return `rgb(${LUT[i]},${LUT[i + 1]},${LUT[i + 2]})`;
};

// Value noise (smooth, deterministic) and a 3-octave fbm.
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
export const fbm = (x: number, y: number) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.15;

// A hot (or cool) spot: Gaussian bump in degrees.
export type Spot = { at: [number, number]; t: number; r: number };

export type Cam = { lon: number; lat: number; scale: number };
// Mercator camera: `scale` is a zoom factor over a base that fits `extent` into `box`.
export const projFor = (cam: Cam, extent: [number, number, number, number], box: number[]): GeoProjection => {
  const [w, s, e, n] = extent;
  const base = geoMercator().fitExtent(
    [[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]],
    { type: "MultiPoint", coordinates: [[w, s], [e, s], [e, n], [w, n]] },
  );
  const p = geoMercator().scale(base.scale() * cam.scale).center([cam.lon, cam.lat]).translate([box[0] + box[2] / 2, box[1] + box[3] / 2]);
  return p;
};

type FieldOpts = {
  width: number;
  height: number;
  proj: GeoProjection;
  spots: Spot[];
  tMin: number;
  tMax: number;
  seed: number; // sensor noise seed (changes with the stuttered frame)
  cell?: number; // sensor pixel size in screen px
  base?: (lon: number, lat: number) => number; // land temperature before spots
  sea?: number;
  rivers?: FeatureCollection<Geometry> | null; // drawn as cool channels (water is cooler than land in the day)
};
// Computes the false-colour image (ImageData at sensor resolution) and where the hottest pixel is.
export const heatField = ({ width, height, proj, spots, tMin, tMax, seed, cell = 4, base, sea = 26.5, rivers }: FieldOpts) => {
  const W = Math.ceil(width / cell), H = Math.ceil(height / cell);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.scale(1 / cell, 1 / cell);
  ctx.fillStyle = "#f00"; // land in red, rivers in green
  ctx.beginPath();
  geoPath(proj, ctx)(LAND);
  ctx.fill();
  if (rivers) {
    ctx.lineWidth = 3 + 3 * Math.sqrt(proj.scale() / 5000);
    ctx.lineJoin = "round";
    ctx.beginPath();
    geoPath(proj, ctx)(rivers);
    ctx.strokeStyle = "rgb(0,255,0)";
    ctx.globalCompositeOperation = "lighter";
    ctx.stroke();
  }
  ctx.restore();
  const m = ctx.getImageData(0, 0, W, H).data;
  // land mask, then a separable box blur → coastal gradient (land near the sea is cooler)
  const mask = new Float32Array(W * H);
  const riv = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    mask[i] = m[i * 4] / 255;
    riv[i] = m[i * 4 + 1] / 255;
  }
  const blur = (src: Float32Array, r: number) => {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[y * W + Math.max(0, Math.min(W - 1, x))];
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = acc / (2 * r + 1);
        acc += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.max(0, Math.min(H - 1, y)) * W + x];
      for (let y = 0; y < H; y++) {
        out[y * W + x] = acc / (2 * r + 1);
        acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
      }
    }
    return out;
  };
  const soft = blur(mask, 1);
  const coast = blur(mask, 5);
  const wet = blur(riv, 1);
  const img = new ImageData(W, H);
  const span = tMax - tMin;
  let best = -1e9, bx = 0, by = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const ll = proj.invert!([(x + 0.5) * cell, (y + 0.5) * cell]);
      if (!ll) continue;
      const [lon, lat] = ll;
      const n = fbm(lon * 2.2, lat * 2.2);
      const fine = vnoise(lon * 14, lat * 14);
      let tl = base ? base(lon, lat) : 35 + (lat - 12) * 0.15;
      for (const s of spots) {
        const dx = (lon - s.at[0]) / s.r, dy = (lat - s.at[1]) / s.r;
        tl += s.t * Math.exp(-(dx * dx + dy * dy));
      }
      tl += (n - 0.5) * 3 + (fine - 0.5) * 1.2 - (1 - coast[i]) * 4 - wet[i] * 4.5;
      const ts = sea + (n - 0.5) * 1.4 + coast[i] * 2;
      const t = ts + (tl - ts) * soft[i];
      if (soft[i] > 0.9 && t > best) [best, bx, by] = [t, x, y];
      // sensor grain + fixed-pattern column noise
      const g = (hash(i * 0.0137 + seed * 3.1, seed * 0.71 + y) - 0.5) * 0.035 + (hash(x, 7) - 0.5) * 0.018;
      const v = Math.max(0, Math.min(1, (t - tMin) / span + g));
      const k = Math.round(v * 255) * 3;
      img.data[i * 4] = LUT[k];
      img.data[i * 4 + 1] = LUT[k + 1];
      img.data[i * 4 + 2] = LUT[k + 2];
      img.data[i * 4 + 3] = 255;
    }
  }
  return { img, W, H, cell, hot: { t: best, x: (bx + 0.5) * cell, y: (by + 0.5) * cell } };
};

// Draws a field image scaled up with smoothing (soft like a real microbolometer image).
export const HeatCanvas = ({ img, width, height, flat = 0 }: { img: ImageData; width: number; height: number; flat?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = img.width;
    cv.height = img.height;
    cv.getContext("2d")!.putImageData(img, 0, 0);
  }, [img]);
  return (
    <>
      <canvas ref={ref} style={{ position: "absolute", left: 0, top: 0, width, height, filter: "blur(1.2px) contrast(1.04)" }} />
      {/* flat-field correction: the shutter closes and the view goes to one grey */}
      {flat > 0 && <div style={{ position: "absolute", inset: 0, background: "#5a5560", opacity: flat }} />}
    </>
  );
};

// Lens vignette + faint scan banding: the optics, not the scene.
export const Optics = ({ width, height }: { width: number; height: number }) => (
  <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="m29-vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.62} />
      </radialGradient>
      <pattern id="m29-band" width={4} height={6} patternUnits="userSpaceOnUse">
        <rect width={4} height={1} fill="#000" opacity={0.12} />
      </pattern>
    </defs>
    <rect width={width} height={height} fill="url(#m29-band)" />
    <rect width={width} height={height} fill="url(#m29-vig)" />
  </svg>
);

// Text with a dark halo so it reads on any part of the heat image.
export const HudText = ({ children, size, weight = 600, color = C.hud, style }: { children: ReactNode; size: number; weight?: number; color?: string; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing: 0.5, lineHeight: 1.15, textShadow: "0 0 3px #000, 0 0 8px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.6)", ...style }}>{children}</div>
);

// Corner brackets of the viewfinder + the centre reticle guides.
export const Brackets = ({ width, height, inset = 40, len = 90 }: { width: number; height: number; inset?: number; len?: number }) => {
  const x0 = inset, y0 = inset, x1 = width - inset, y1 = height - inset;
  const d = [
    `M${x0} ${y0 + len}V${y0}H${x0 + len}`,
    `M${x1 - len} ${y0}H${x1}V${y0 + len}`,
    `M${x1} ${y1 - len}V${y1}H${x1 - len}`,
    `M${x0 + len} ${y1}H${x0}V${y1 - len}`,
  ].join(" ");
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={9} />
      <path d={d} fill="none" stroke={C.hud} strokeWidth={4} />
    </svg>
  );
};

// Vertical temperature scale bar with ticks (the palette and its °C span).
export const ScaleBar = ({ x, y, h, tMin, tMax, ticks }: { x: number; y: number; h: number; tMin: number; tMax: number; ticks: number[] }) => {
  const w = 34;
  const stops = Array.from({ length: 17 }, (_, i) => i / 16);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="m29-scale" x1="0" y1="1" x2="0" y2="0">
          {stops.map((t) => <stop key={t} offset={t} stopColor={ironbow(t)} />)}
        </linearGradient>
      </defs>
      <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill="#000" opacity={0.55} rx={3} />
      <rect x={x} y={y} width={w} height={h} fill="url(#m29-scale)" />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.hud} strokeWidth={2} />
      {ticks.map((t) => {
        const ty = y + h - ((t - tMin) / (tMax - tMin)) * h;
        if (ty < y - 1 || ty > y + h + 1) return null;
        return (
          <g key={t}>
            <line x1={x - 14} x2={x} y1={ty} y2={ty} stroke="#000" strokeWidth={5} opacity={0.5} />
            <line x1={x - 14} x2={x} y1={ty} y2={ty} stroke={C.hud} strokeWidth={2.4} />
            <text x={x - 22} y={ty + 9} textAnchor="end" fontFamily={font} fontWeight={600} fontSize={26} fill={C.hud} stroke="#000" strokeWidth={5} paintOrder="stroke" strokeOpacity={0.6}>{t}°</text>
          </g>
        );
      })}
      <text x={x + w / 2} y={y - 20} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={28} fill={C.hud} stroke="#000" strokeWidth={5} paintOrder="stroke" strokeOpacity={0.6}>{tMax.toFixed(0)}</text>
      <text x={x + w / 2} y={y + h + 40} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={28} fill={C.hud} stroke="#000" strokeWidth={5} paintOrder="stroke" strokeOpacity={0.6}>{tMin.toFixed(0)}</text>
    </svg>
  );
};

// Spot meter: crosshair with a gap and a centre ring; `lock` 0–1 shrinks and brightens it when it locks on.
export const Crosshair = ({ x, y, lock = 0 }: { x: number; y: number; lock?: number }) => {
  const r = 46 - lock * 12;
  const g = 14;
  const arm = 54;
  const d = `M${x - r - arm} ${y}H${x - r + g}M${x + r - g} ${y}H${x + r + arm}M${x} ${y - r - arm}V${y - r + g}M${x} ${y + r - g}V${y + r + arm}`;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} stroke="#000" strokeOpacity={0.55} strokeWidth={9} />
      <path d={d} stroke={C.hud} strokeWidth={3.6} />
      <circle cx={x} cy={y} r={r * 0.45} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={8} />
      <circle cx={x} cy={y} r={r * 0.45} fill="none" stroke={lock > 0.5 ? C.white : C.hud} strokeWidth={3.2} />
      {lock > 0 && <circle cx={x} cy={y} r={r * 1.5} fill="none" stroke={C.hud} strokeWidth={2} strokeDasharray="6 10" opacity={lock} />}
    </svg>
  );
};

// Auto hot-spot box with a little triangle (the camera's own "max" marker).
export const HotBox = ({ x, y, on, label }: { x: number; y: number; on: number; label: string }) => {
  if (on <= 0) return null;
  const s = 34;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: on }}>
      <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={8} />
      <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill="none" stroke={C.white} strokeWidth={3} />
      <path d={`M${x} ${y - s - 8}l-11 -18h22z`} fill={C.white} stroke="#000" strokeWidth={2} />
      <text x={x - s - 12} y={y + s - 4} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={26} fill={C.white} stroke="#000" strokeWidth={5} paintOrder="stroke" strokeOpacity={0.65}>{label}</text>
    </svg>
  );
};

// Thin battery + signal glyphs for the status bar.
export const Battery = ({ x, y, level = 0.7 }: { x: number; y: number; level?: number }) => (
  <svg width={80} height={36} style={{ position: "absolute", left: x, top: y }}>
    <rect x={2} y={4} width={62} height={28} rx={4} fill="none" stroke={C.hud} strokeWidth={3} />
    <rect x={66} y={12} width={8} height={12} rx={2} fill={C.hud} />
    {[0, 1, 2, 3].map((i) => (i < Math.round(level * 4) ? <rect key={i} x={8 + i * 14} y={10} width={10} height={16} fill={C.hud} /> : null))}
  </svg>
);
