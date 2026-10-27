import { geoArea } from "d3-geo";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { country } from "../../../components/data";
import type { InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { PAL, type Costume } from "../../../components/Scene";
import { clamp, display, font } from "../../worldhistory/kit/news";

// What if America: channel pieces. Real-world scenes use the house news look as is; what-if scenes get the
// channel grade (magenta-violet over the satellite map), the "WHAT IF" chip and the split transition between them.
export const WHATIF = "#e0409a"; // what-if accent
export const REAL = "#4fa3ff"; // real-world accent (USA blue)
export const RUSSIA = "#e5484d";

export const COSTUME_W: Record<string, Costume> = {
  soviet: { jacket: "#5d6150", sash: "#3a3a30", pants: "#4a4c40", head: "helmet", headColor: "#4a4d40", skin: "#e0b08a" },
  russia1860: { jacket: "#2f4a32", sash: "#c9302c", pants: "#2a2a2a", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" },
  usa1860: { jacket: "#2b3f6e", sash: "#efe6d0", pants: "#6f8fc4", head: "helmet", headColor: "#22305a", skin: "#e0b08a" },
};

// ---- map ----

// Alaska only, cut out of the US feature (Natural Earth 1:50m): polygons north of 50°N west of 129°W, plus the
// western Aleutians across the date line.
const us = country("840") as Feature<MultiPolygon>;
export const alaska: Feature<MultiPolygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "MultiPolygon",
    coordinates: us.geometry.coordinates.filter((poly) => {
      const ring = poly[0];
      const lon = ring.reduce((a, p) => a + p[0], 0) / ring.length;
      const lat = ring.reduce((a, p) => a + p[1], 0) / ring.length;
      return lat > 50 && (lon < -129 || lon > 170);
    }),
  },
};
export const russia = country("643");
export const canada = country("124");

// Alaska–Canada border, approximate (141°W, then the panhandle line).
export const BORDER: [number, number][] = [[-141, 69.65], [-141, 60.3], [-139.1, 60.35], [-137.5, 59.2], [-135.5, 59.8], [-133.4, 58.4], [-131.8, 56.6], [-130.0, 55.9], [-130.0, 54.7]];

// A country shape moved to another place at its true size: offsets in km from its centroid, rotated, re-placed.
export const moveTrueSize = (f: Feature<Polygon | MultiPolygon>, to: [number, number], rotateDeg = 0): Feature<MultiPolygon> => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const main = polys.reduce((a, b) => (b[0].length > a[0].length ? b : a));
  const lon0 = main[0].reduce((a, p) => a + p[0], 0) / main[0].length;
  const lat0 = main[0].reduce((a, p) => a + p[1], 0) / main[0].length;
  const r = (rotateDeg * Math.PI) / 180;
  const KM = 111.32;
  const mv = (p: Position): Position => {
    const dx = (p[0] - lon0) * Math.cos((lat0 * Math.PI) / 180) * KM;
    const dy = (p[1] - lat0) * KM;
    const rx = dx * Math.cos(r) - dy * Math.sin(r);
    const ry = dx * Math.sin(r) + dy * Math.cos(r);
    const lat = to[1] + ry / KM;
    return [to[0] + rx / (KM * Math.cos((lat * Math.PI) / 180)), lat];
  };
  // d3 fills the side to the right of a ring: a polygon wound the other way (geoBoundaries, GeoJSON RFC order)
  // would cover the whole globe minus the shape, so flip any polygon whose spherical area is over a hemisphere.
  const moved = polys.map((poly) => poly.map((ring) => ring.map(mv)));
  const wound = moved.map((poly) => (geoArea({ type: "Polygon", coordinates: poly }) > 2 * Math.PI ? poly.map((ring) => [...ring].reverse()) : poly));
  return { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates: wound } };
};

// The what-if grade over the whole map: violet multiply + a magenta lift + dark vignette. k = 0..1.
export const WhatIfGrade = ({ k }: { k: number }) => {
  const { width, height } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={k} style={{ pointerEvents: "none" }}>
      <defs>
        <radialGradient id="wi-vig" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0.5" stopColor="#12031a" stopOpacity={0} />
          <stop offset="1" stopColor="#12031a" stopOpacity={0.7} />
        </radialGradient>
      </defs>
      {/* plain alpha layers, no blend modes: SplitOut moves this layer in an isolated group, where multiply would
          blend with nothing and turn the frame flat violet */}
      <rect width={width} height={height} fill="#2a0636" opacity={0.5} />
      <rect width={width} height={height} fill="#ff3a8a" opacity={0.14} />
      <rect width={width} height={height} fill="url(#wi-vig)" />
    </g>
  );
};

// The channel's transition out of (or into) the what-if world: the graded layer cracks along a jagged diagonal
// and the two halves slide apart over `len` frames. The crack glow rises over 2 frames and fades over 12.
const CRACK = (w: number, h: number) => [[-0.05, 0.3], [0.22, 0.38], [0.35, 0.33], [0.52, 0.47], [0.66, 0.44], [0.8, 0.58], [1.05, 0.64]].map(([x, y]) => [x * w, y * h] as [number, number]);
export const SplitOut = ({ at, len = 16, children }: { at: number; len?: number; children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  if (frame >= at + len) return null;
  if (frame < at) return <g>{children}</g>;
  const t = interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (x) => x * x });
  const crack = CRACK(width, height);
  const line = crack.map((p) => p.join(",")).join(" L");
  const top = `M0,0 L${width},0 L${line.split(" L").reverse().join(" L")} Z`;
  const bottom = `M${line} L${width},${height} L0,${height} Z`;
  const glow = interpolate(frame, [at, at + 2, at + 14], [0, 1, 0], clamp);
  return (
    <g>
      <defs>
        <clipPath id="split-top"><path d={top} /></clipPath>
        <clipPath id="split-bot"><path d={bottom} /></clipPath>
      </defs>
      <g transform={`translate(${-t * 140 * s},${-t * 420 * s})`} opacity={1 - t}>
        <g clipPath="url(#split-top)">{children}</g>
      </g>
      <g transform={`translate(${t * 140 * s},${t * 420 * s})`} opacity={1 - t}>
        <g clipPath="url(#split-bot)">{children}</g>
      </g>
      <path d={`M${line}`} fill="none" stroke="#fff" strokeWidth={10 * s} opacity={glow} style={{ filter: `drop-shadow(0 0 ${14 * s}px ${WHATIF})` }} />
    </g>
  );
};

// The way in: the crack flashes and the graded halves slide together from outside along it.
// Outside [at, at + len) it draws nothing; the caller shows the full layer from at + len on.
export const SplitIn = ({ at, len = 16, children }: { at: number; len?: number; children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  if (frame < at || frame >= at + len) return null;
  const t = 1 - interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) * (1 - x) });
  const line = CRACK(width, height).map((p) => p.join(",")).join(" L");
  const top = `M0,0 L${width},0 L${line.split(" L").reverse().join(" L")} Z`;
  const bottom = `M${line} L${width},${height} L0,${height} Z`;
  const glow = interpolate(frame, [at, at + 2, at + 14], [0, 1, 0], clamp); // gone before the layer takes over
  return (
    <g>
      <defs>
        <clipPath id="splitin-top"><path d={top} /></clipPath>
        <clipPath id="splitin-bot"><path d={bottom} /></clipPath>
      </defs>
      <g transform={`translate(${-t * 140 * s},${-t * 420 * s})`} opacity={1 - t}>
        <g clipPath="url(#splitin-top)">{children}</g>
      </g>
      <g transform={`translate(${t * 140 * s},${t * 420 * s})`} opacity={1 - t}>
        <g clipPath="url(#splitin-bot)">{children}</g>
      </g>
      <path d={`M${line}`} fill="none" stroke="#fff" strokeWidth={10 * s} opacity={glow} style={{ filter: `drop-shadow(0 0 ${14 * s}px ${WHATIF})` }} />
    </g>
  );
};

// Top bar: channel badge + chapter on the left, the world chip on the right ("WHAT IF" in magenta, or a year).
export const WhatIfBar = ({ chapter, chip, whatIf }: { chapter: string; chip: string; whatIf: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const breathe = whatIf ? 0.75 + 0.25 * Math.sin(frame * 0.12) : 1;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: "#0d1b3a", border: `${2 * s}px solid ${REAL}`, padding: `${2 * s}px ${14 * s}px`, borderRadius: 8 * s, fontFamily: display, fontWeight: 700, fontSize: 32 * s, letterSpacing: 1 * s }}>
          WHAT IF <span style={{ color: RUSSIA }}>AMERICA</span>
        </div>
        {chapter && <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * s, background: whatIf ? WHATIF : "rgba(8,14,26,0.8)", border: `${2 * s}px solid ${whatIf ? "#ffb3dc" : "rgba(255,255,255,0.25)"}`, padding: `${2 * s}px ${18 * s}px`, borderRadius: 30 * s, fontWeight: 900, fontSize: 30 * s, boxShadow: whatIf ? `0 0 ${24 * s * breathe}px ${WHATIF}` : "none" }}>
        {whatIf && <span style={{ width: 14 * s, height: 14 * s, borderRadius: "50%", background: "#fff", opacity: breathe }} />}
        {chip}
      </div>
    </div>
  );
};

// ---- illustration pieces (style v2: ink outline, depth layers) ----

// Falling snow, deterministic. depth 0 (far, small, slow) … 1 (near, big, fast).
export const Snow = ({ g, n = 40, depth = 0.5, wind = 1 }: { g: InsetGeom; n?: number; depth?: number; wind?: number }) => {
  const frame = useCurrentFrame();
  const speed = (0.8 + depth * 2.2) * g.s;
  const r = (1.2 + depth * 2.6) * g.s;
  return (
    <g fill="#fff" opacity={0.55 + depth * 0.35}>
      {Array.from({ length: n }, (_, i) => {
        const fx = ((i * 0.6180339) % 1) * (g.W + 200 * g.s);
        const fy = ((i * 0.381966 + 0.13) % 1) * g.H;
        const y = g.y + ((fy + frame * speed) % g.H);
        const x = g.x - 100 * g.s + ((fx + frame * speed * 0.4 * wind + Math.sin(frame * 0.05 + i) * 8 * g.s) % (g.W + 200 * g.s));
        return <circle key={i} cx={x} cy={y} r={r} />;
      })}
    </g>
  );
};

export const Pine = ({ x, y, h, color = "#1f3a2e", snow = true }: { x: number; y: number; h: number; color?: string; snow?: boolean }) => {
  const w = h * 0.42;
  const tiers = [0, 0.3, 0.55];
  return (
    <g>
      <rect x={x - h * 0.03} y={y - h * 0.12} width={h * 0.06} height={h * 0.12} fill="#3a2a1c" />
      {tiers.map((t, i) => {
        const ty = y - h * 0.1 - t * h;
        const tw = w * (1 - t * 0.85);
        return (
          <g key={i}>
            <path d={`M${x - tw} ${ty} L${x} ${ty - h * 0.45} L${x + tw} ${ty} Z`} fill={color} stroke={PAL.ink} strokeWidth={h * 0.012} strokeOpacity={0.7} />
            {snow && <path d={`M${x - tw * 0.55} ${ty - h * 0.2} L${x} ${ty - h * 0.45} L${x + tw * 0.55} ${ty - h * 0.2} Q${x} ${ty - h * 0.26} ${x - tw * 0.55} ${ty - h * 0.2} Z`} fill="#eef3f8" opacity={0.85} />}
          </g>
        );
      })}
    </g>
  );
};

// A waving flag on a pole. `stripes` top→bottom; `canton` = a blue field with stars (US). `raise` 0 = at the
// foot of the pole, 1 = at the top.
export const Flag = ({ x, y, s, h = 170, raise = 1, stripes, canton = false, w = 66 }: { x: number; y: number; s: number; h?: number; raise?: number; stripes: string[]; canton?: boolean; w?: number }) => {
  const frame = useCurrentFrame();
  const fh = w * 0.62 * s;
  const fw = w * s;
  const top = y - h * s + (1 - raise) * (h * s - fh - 20 * s);
  const N = 7;
  const wav = (i: number) => Math.sin(frame * 0.22 - i * 0.9) * 4 * s * (i / N);
  const xs = Array.from({ length: N + 1 }, (_, i) => [x + (i * fw) / N, wav(i)] as [number, number]);
  const band = (y0: number, y1: number, x1 = fw) => {
    const pts = xs.filter(([px]) => px - x <= x1 + 0.01);
    const t = pts.map(([px, dy]) => `${px},${top + y0 + dy}`).join(" L");
    const b = [...pts].reverse().map(([px, dy]) => `${px},${top + y1 + dy}`).join(" L");
    return `M${t} L${b} Z`;
  };
  const sh = fh / stripes.length;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - h * s - 6 * s} stroke="#3a2a1c" strokeWidth={4 * s} />
      <circle cx={x} cy={y - h * s - 8 * s} r={4 * s} fill={PAL.gilt} />
      {stripes.map((c, i) => <path key={i} d={band(i * sh, (i + 1) * sh + 0.5)} fill={c} />)}
      {canton && <path d={band(0, sh * 7, fw * 0.43)} fill="#2a3f86" />}
      <path d={band(0, fh)} fill="none" stroke={PAL.ink} strokeWidth={1.4 * s} />
    </g>
  );
};
export const RU_FLAG = ["#f4f1ea", "#2a52be", "#d52b1e"];
export const US_FLAG = Array.from({ length: 13 }, (_, i) => (i % 2 ? "#f4f1ea" : "#b22234"));

// Log house with a pitched roof.
export const LogHouse = ({ x, y, w, h, s }: { x: number; y: number; w: number; h: number; s: number }) => (
  <g stroke={PAL.ink} strokeWidth={1.6 * s}>
    <rect x={x} y={y - h} width={w} height={h} fill="#7a5233" />
    {Array.from({ length: Math.floor(h / (9 * s)) }, (_, i) => <line key={i} x1={x} y1={y - i * 9 * s} x2={x + w} y2={y - i * 9 * s} strokeWidth={0.8 * s} strokeOpacity={0.5} />)}
    <path d={`M${x - 6 * s} ${y - h} L${x + w / 2} ${y - h - h * 0.6} L${x + w + 6 * s} ${y - h} Z`} fill="#4a3322" />
    <path d={`M${x - 2 * s} ${y - h - 2 * s} L${x + w / 2} ${y - h - h * 0.6 + 4 * s} L${x + w + 2 * s} ${y - h - 2 * s}`} fill="none" stroke="#eef3f8" strokeWidth={4 * s} strokeOpacity={0.7} />
    <rect x={x + w * 0.38} y={y - h * 0.62} width={w * 0.22} height={h * 0.32} fill="#ffcf7a" opacity={0.85} />
  </g>
);

// Russian Orthodox church with an onion dome (Sitka's St Michael's, simplified).
export const OnionChurch = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g stroke={PAL.ink} strokeWidth={1.6 * s}>
    <rect x={x - 34 * s} y={y - 60 * s} width={68 * s} height={60 * s} fill="#c9b994" />
    <path d={`M${x - 40 * s} ${y - 60 * s} L${x} ${y - 82 * s} L${x + 40 * s} ${y - 60 * s} Z`} fill="#3f6b4a" />
    <rect x={x - 12 * s} y={y - 112 * s} width={24 * s} height={34 * s} fill="#c9b994" />
    <path d={`M${x - 15 * s} ${y - 112 * s} Q${x - 22 * s} ${y - 132 * s} ${x} ${y - 150 * s} Q${x + 22 * s} ${y - 132 * s} ${x + 15 * s} ${y - 112 * s} Z`} fill="#3f6b4a" />
    <line x1={x} y1={y - 150 * s} x2={x} y2={y - 168 * s} stroke={PAL.gilt} strokeWidth={2.4 * s} />
    <line x1={x - 6 * s} y1={y - 162 * s} x2={x + 6 * s} y2={y - 162 * s} stroke={PAL.gilt} strokeWidth={2.4 * s} />
    <rect x={x - 8 * s} y={y - 26 * s} width={16 * s} height={26 * s} fill="#4a3322" />
  </g>
);

// Snow ground: a soft drift band from y to the panel bottom.
export const SnowGround = ({ g, y, shift = 0, color = "#dfe7ef", shade = "#b9c6d6" }: { g: InsetGeom; y: number; shift?: number; color?: string; shade?: string }) => {
  const pts = Array.from({ length: 12 }, (_, i) => `${g.x - 100 * g.s + i * ((g.W + 200 * g.s) / 11) + shift},${y + Math.sin(i * 1.9) * 6 * g.s}`).join(" L");
  return (
    <g>
      <path d={`M${g.x - 120 * g.s},${g.y + g.H} L${pts} L${g.x + g.W + 120 * g.s},${g.y + g.H} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.4} />
      <rect x={g.x} y={y + 14 * g.s} width={g.W} height={g.H} fill={shade} opacity={0.35} />
    </g>
  );
};
