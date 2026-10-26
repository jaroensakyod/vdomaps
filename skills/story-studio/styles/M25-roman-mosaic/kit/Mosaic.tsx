import { loadFont } from "@remotion/google-fonts/Trirong";
import { geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land50 from "world-atlas/land-50m.json";
import { distance, hash, rasterise } from "./grid";

// M25 Roman mosaic: the whole frame is a floor of small cut stone tesserae. First the design is drawn on the dark
// setting bed (squared guide grid, coast, city rings, dashed road lines); then the stones drop in, spreading out
// from the capital. Land is golden limestone with a few rows following the coast, the sea is dark stone with
// blue-green crest rows that follow the coast (andamento), the coast is ringed by a terracotta row, the border is
// dark / cream / dentil / cream / terracotta rows. Roads are laid stone by stone in red, city to city; cities are
// rosettes. One lighting filter gives every stone its bevel, grain and set-in shadow.
// Optional: `emblem` sets the map as a round or rounded-rectangle panel (emblema) in a porphyry floor (OpusSectile).

export const font = loadFont("normal", { weights: ["500", "700", "800"], subsets: ["thai", "latin"] }).fontFamily;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const C = {
  mortar: "#3a1f28", // dark setting bed
  sinopia: "#a5512f",
  ink: "#2a2522", // dark stone: coast row, border, text
  cream: "#eadfc6",
  terracotta: "#a8472d",
  road: ["#a3301f", "#86251a", "#b53a24"],
  land: ["#e6bb4e", "#e2b44a", "#eac158", "#dfb048", "#e6b950"],
  coastIn: "#b8743e",
  // sea rows by distance from the coast, near → far; two stones per row
  sea: [["#7fd0bf", "#92d8c8"], ["#4fb7a8", "#5dbfae"], ["#38a093", "#43a89a"], ["#2b8a82", "#33928a"], ["#22746f", "#287c76"], ["#1b615e", "#206864"], ["#164f4e", "#1a5654"]],
  fleck: "#e6f1ec",
  deep: ["#16191c", "#1b1f23"], // dark sea stone
  chalk: "#e2b98a", // ochre guide lines on the bed
  white: ["#f3eee3", "#ebe5d6", "#f7f3ea", "#e4ddcc"],
  porphyry: "#6a2a3e", // imperial porphyry
  coastOut: "#2a2522", // the dark row just off the coast (reads as a shadow line on the dark bed)
  marble: "#f1ebdd",
  inlay: "#7a2418",
};

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

export type Tile = { x: number; y: number; d: string; fill: string; t: number };
export type Box = [number, number, number, number];

// Frame geometry (9:16 at 1080×1920).
export const W = 1080;
export const H = 1920;
export const CELL = 10;
export const RU = 14; // size unit of the city rosettes (px), independent of the stone size
export const BORDER = 5 * CELL; // 5 rows of border stones
export const FIELD: Box = [BORDER, BORDER, W - 2 * BORDER, H - 2 * BORDER];

// A projection fitting a [w, s, e, n] box into a screen box.
export const fitProjection = ([w, s, e, n]: [number, number, number, number], box: Box): GeoProjection => {
  const lon = (w + e) / 2;
  const lat = (s + n) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]);
  p.fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], { type: "MultiPoint", coordinates: [[w, s], [e, n], [w, n], [e, s]] });
  return p;
};

// One stone: an irregular quad around (x, y), size a × b, rotated `rot` radians.
const quad = (x: number, y: number, a: number, b: number, rot: number, seed: number) => {
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const pts = [[-a, -b], [a, -b], [a, b], [-a, b]].map(([u, v], k) => {
    const ju = (hash(seed, k, 1) - 0.5) * a * 0.32;
    const jv = (hash(seed, k, 2) - 0.5) * b * 0.32;
    const uu = u + ju, vv = v + jv;
    return `${(x + uu * cs - vv * sn).toFixed(1)} ${(y + uu * sn + vv * cs).toFixed(1)}`;
  });
  return `M${pts[0]}L${pts[1]}L${pts[2]}L${pts[3]}Z`;
};

const pick = <T,>(arr: T[], r: number) => arr[Math.min(arr.length - 1, Math.floor(r * arr.length))];

export type Road = { pts: [number, number][]; at: number; len: number };
export type City = { at: [number, number]; t: number; big?: boolean };

type Build = { field: Tile[]; border: Tile[]; roads: Tile[][]; cities: Tile[][]; paths: string[]; coast: string; cityPx: [number, number][] };
const cache = new Map<string, Build>();

// Lay out every stone once: the field (land + sea + coast row), the border, the roads (stones along each line,
// laid over `len` frames from `at`), the city rosettes. `start`/`spread` time the opening lay from `origin`.
// `emblem`: the map is set as a round panel (emblema) in a white limestone floor with black crosslets.
// round (r) or a rounded rectangle (hw, hh, rr)
export type Emblem = { cx: number; cy: number; r: number; hw?: number; hh?: number; rr?: number };
// signed distance (px) from the emblem edge, > 0 outside
export const emblemDist = (e: Emblem, x: number, y: number) => {
  if (e.hw === undefined || e.hh === undefined) return Math.hypot(x - e.cx, y - e.cy) - e.r;
  const rr = e.rr ?? 0;
  const qx = Math.abs(x - e.cx) - e.hw + rr, qy = Math.abs(y - e.cy) - e.hh + rr;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
};
export const useMosaic = (key: string, proj: GeoProjection, roads: Road[], cities: City[], origin: [number, number], start = 2, spread = 96, emblem?: Emblem): Build => {
  const hit = cache.get(key);
  if (hit) return hit;
  const [fx, fy, fw, fh] = FIELD;
  const cols = Math.round(fw / CELL);
  const rows = Math.round(fh / CELL);
  const cw = fw / cols, ch = fh / rows;
  const path = geoPath(proj);
  const landD = path(LAND) ?? "";
  // land path is in screen units; shift into field units for the raster
  const mask = rasterise([landD], fw, fh, cols, rows, undefined, -fx, -fy);
  const isLand = (i: number) => mask.v[i] >= 0.5;
  const seaD = distance(cols, rows, isLand);
  const landD2 = distance(cols, rows, (i) => !isLand(i));
  const routePx = roads.map((r) => r.pts.map((p) => proj(p) as [number, number]));
  const cityPx = cities.map((c) => proj(c.at) as [number, number]);
  // keep mortar bare where roads and cities will be set
  const nearLine = (x: number, y: number, pts: [number, number][], r: number) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      if (Math.hypot(x - ax - t * dx, y - ay - t * dy) < r) return true;
    }
    return false;
  };
  const [ox, oy] = proj(origin) as [number, number];
  const field: Tile[] = [];
  const maxR = Math.hypot(fw, fh);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let x = fx + (c + 0.5) * cw;
      let y = fy + (r + 0.5) * ch;
      if (routePx.some((p) => nearLine(x, y, p, cw * 1.7))) continue;
      if (cityPx.some(([px, py], k) => Math.hypot(x - px, y - py) < RU * (cities[k].big ? 2.3 : 1.7))) continue;
      const h1 = hash(c, r, 3);
      let fill: string;
      let rot = (hash(c, r, 4) - 0.5) * 0.18;
      let a = cw * 0.48, b = ch * 0.48;
      if (emblem) {
        const dx = x - emblem.cx, dy = y - emblem.cy;
        const dr = emblemDist(emblem, x, y) / cw; // cells outside the emblem edge
        if (dr > -3.2) {
          const ang = Math.atan2(dy, dx);
          if (dr < 3.6) {
            // rows round the emblem: black, rope (red / white twist), black, then two white rows
            const row = Math.round(dr + 3);
            const round = emblem.hw === undefined;
            if (round) {
              x = emblem.cx + Math.cos(ang) * (emblem.r + (row - 3) * cw);
              y = emblem.cy + Math.sin(ang) * (emblem.r + (row - 3) * cw);
              rot = ang;
            }
            const along = round ? (ang * emblem.r) / cw : Math.abs(dx) > (emblem.hw ?? 0) - 1 ? y / cw : x / cw;
            const twist = Math.floor(along / 1.6 + row * 0.5) % 2 === 0;
            fill = row <= 0 ? C.ink : row === 1 || row === 2 ? (twist ? C.terracotta : C.cream) : row === 3 ? C.ink : pick(C.white, h1);
          } else continue; // outside: the cut-marble floor (OpusSectile), no tesserae
          const t = start + (Math.hypot(x - (proj(origin) as number[])[0], y - (proj(origin) as number[])[1]) / Math.hypot(fw, fh)) * spread * 1.6 + hash(c, r, 7) * 10;
          field.push({ x, y, d: quad(x, y, a, b, rot, i), fill, t });
          continue;
        }
      }
      if (isLand(i)) {
        const dl = landD2[i];
        if (dl <= 4.5) {
          // a few rows of stones follow the coast inside the land too, then plain grid (opus tessellatum)
          const at = (cc: number, rr: number) => landD2[Math.max(0, Math.min(rows - 1, rr)) * cols + Math.max(0, Math.min(cols - 1, cc))];
          const gx = at(c + 1, r) - at(c - 1, r);
          const gy = at(c, r + 1) - at(c, r - 1);
          const g = Math.hypot(gx, gy) || 1;
          rot = Math.atan2(gy, gx) + (hash(c, r, 5) - 0.5) * 0.1;
          const snap = (Math.round(dl) - dl) * cw * 0.6;
          x += (gx / g) * snap;
          y += (gy / g) * snap;
        }
        const row = Math.round(dl);
        fill = row <= 1 ? C.coastIn : row === 2 ? "#d9b27a" : pick(C.land, h1);
      } else {
        const d = seaD[i];
        // andamento: rotate along the coast contour and pull stones onto whole-number contour rows
        const at = (cc: number, rr: number) => seaD[Math.max(0, Math.min(rows - 1, rr)) * cols + Math.max(0, Math.min(cols - 1, cc))];
        const gx = at(c + 1, r) - at(c - 1, r);
        const gy = at(c, r + 1) - at(c, r - 1);
        const g = Math.hypot(gx, gy) || 1;
        rot = Math.atan2(gy, gx) + (hash(c, r, 5) - 0.5) * 0.1;
        const snap = (Math.round(d) - d) * cw * 0.7;
        x += (gx / g) * snap;
        y += (gy / g) * snap;
        a = cw * 0.46;
        b = ch * 0.52;
        const row = Math.round(d);
        if (row <= 1) fill = C.coastOut;
        else {
          // andamento: blue-green crest rows following the coast, dark sea stone between, crests thinning out
          const crest = row % 3 === 2 && (row < 12 || hash(c, r, 6) < 0.55);
          const band = C.sea[Math.min(C.sea.length - 1, Math.floor((row - 2) / 3))];
          fill = crest ? band[h1 < 0.5 ? 0 : 1] : h1 < 0.5 ? C.deep[0] : C.deep[1];
          if (!crest && row >= 8 && hash(c, r, 8) < 0.025) fill = C.fleck;
        }
      }
      const t = start + (Math.hypot(x - ox, y - oy) / maxR) * spread * 1.6 + hash(c, r, 7) * 10;
      field.push({ x, y, d: quad(x, y, a, b, rot, i), fill, t });
    }
  // border: dark, cream, dentils, cream, terracotta (outside → in)
  const border: Tile[] = [];
  const bRow = [C.ink, C.cream, "dentil", C.cream, C.terracotta];
  const ring = (k: number) => {
    const inset = (k + 0.5) * CELL;
    const out: [number, number][] = [];
    const nx = Math.round((W - 2 * inset) / CELL), ny = Math.round((H - 2 * inset) / CELL);
    for (let u = 0; u < nx; u++) out.push([inset + (u * (W - 2 * inset)) / nx, inset]);
    for (let u = 0; u < ny; u++) out.push([W - inset, inset + (u * (H - 2 * inset)) / ny]);
    for (let u = 0; u < nx; u++) out.push([W - inset - (u * (W - 2 * inset)) / nx, H - inset]);
    for (let u = 0; u < ny; u++) out.push([inset, H - inset - (u * (H - 2 * inset)) / ny]);
    return out;
  };
  for (let k = 0; k < 5; k++)
    ring(k).forEach(([x, y], u) => {
      let fill = bRow[k];
      if (fill === "dentil") fill = u % 2 ? C.ink : C.cream;
      border.push({ x, y, d: quad(x, y, CELL * 0.42, CELL * 0.42, (hash(u, k, 8) - 0.5) * 0.14, u * 7 + k), fill, t: 0 });
    });
  // roads: two rows of red stones along the line, laid in order
  const roadTiles = routePx.map((pts, ri) => {
    const out: Tile[] = [];
    const segs: { ax: number; ay: number; dx: number; dy: number; l: number }[] = [];
    let total = 0;
    for (let k = 0; k < pts.length - 1; k++) {
      const dx = pts[k + 1][0] - pts[k][0], dy = pts[k + 1][1] - pts[k][1];
      const l = Math.hypot(dx, dy);
      segs.push({ ax: pts[k][0], ay: pts[k][1], dx, dy, l });
      total += l;
    }
    const step = cw * 0.92;
    let run = 0;
    let n = 0;
    for (const s of segs) {
      const ang = Math.atan2(s.dy, s.dx);
      const nx = -s.dy / s.l, ny = s.dx / s.l;
      for (let u = 0; u < s.l; u += step) {
        const bx = s.ax + (s.dx * u) / s.l, by = s.ay + (s.dy * u) / s.l;
        const f = (run + u) / total;
        for (const side of [-1, 0, 1]) {
          const x = bx + nx * side * cw, y = by + ny * side * cw;
          out.push({ x, y, d: quad(x, y, step * 0.44, cw * 0.4, ang, 1000 * ri + n++), fill: pick(C.road, hash(n, ri, 9)), t: roads[ri].at + f * roads[ri].len });
        }
      }
      run += s.l;
    }
    return out;
  });
  // cities: a cream marble centre stone, a ring of small dark stones (Rome: two rings, gold centre)
  const cityTiles = cityPx.map(([x, y], k) => {
    const big = cities[k].big;
    const out: Tile[] = [{ x, y, d: quad(x, y, RU * (big ? 0.75 : 0.55), RU * (big ? 0.75 : 0.55), 0.785, 5000 + k), fill: big ? "#d9a63c" : C.marble, t: cities[k].t }];
    const rings = big ? [[1.25, 10, C.ink], [1.9, 16, C.terracotta]] : [[1.1, 8, C.ink]];
    for (const [rr, n, fill] of rings as [number, number, string][])
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2;
        const px = x + Math.cos(a) * rr * RU, py = y + Math.sin(a) * rr * RU;
        out.push({ x: px, y: py, d: quad(px, py, RU * 0.3, RU * 0.36, a, 6000 + k * 40 + j), fill, t: cities[k].t + 2 + j * 0.6 });
      }
    return out;
  });
  const sinopia = routePx.map((pts) => `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}`);
  const b: Build = { field, border, roads: roadTiles, cities: cityTiles, paths: sinopia, coast: landD, cityPx };
  cache.set(key, b);
  return b;
};

// The lighting: blur the stones' alpha into a height map, rake it with a low light (bevel + shine), add stone grain
// and a dark set-in shadow on the mortar. `az` moves the light a little over the shot.
export const MosaicDefs = ({ az = 225 }: { az?: number }) => (
  <defs>
    <filter id="m25-stone" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="h" />
      <feSpecularLighting in="h" surfaceScale="3.2" specularConstant="0.75" specularExponent="16" lightingColor="#fff6e6" result="sp">
        <feDistantLight azimuth={az} elevation="38" />
      </feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi" />
      <feDiffuseLighting in="h" surfaceScale="1.7" diffuseConstant="1.05" lightingColor="#ffffff" result="df">
        <feDistantLight azimuth={az} elevation="56" />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="df" operator="arithmetic" k1="1.22" k2="0" k3="0" k4="0" result="lit" />
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={4} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.34 -0.1" result="grain" />
      <feComposite in="grain" in2="SourceAlpha" operator="in" result="g2" />
      <feComposite in="lit" in2="spi" operator="arithmetic" k2="1" k3="0.55" result="shine" />
      <feComposite in="g2" in2="shine" operator="over" result="stone" />
      <feOffset in="SourceAlpha" dx="1.4" dy="1.8" result="o" />
      <feGaussianBlur in="o" stdDeviation="1.2" result="ob" />
      <feColorMatrix in="ob" values="0 0 0 0 0.16  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0.42 0" result="sh" />
      <feMerge>
        <feMergeNode in="sh" />
        <feMergeNode in="stone" />
      </feMerge>
    </filter>
    <filter id="m25-mortar" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={9} />
      <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0.55 -0.12" />
    </filter>
    <filter id="m25-grime" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={2} />
      <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0.5 -0.18" />
    </filter>
    <radialGradient id="m25-vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#1b130b" stopOpacity={0.3} />
    </radialGradient>
  </defs>
);

// Stones laid by `frame`: settled ones batched per colour, the ones still dropping in drawn one by one.
export const Stones = ({ tiles, frame, drop = 7 }: { tiles: Tile[]; frame: number; drop?: number }) => {
  const byFill = new Map<string, string[]>();
  const moving: Tile[] = [];
  for (const t of tiles) {
    if (frame < t.t) continue;
    if (frame < t.t + drop) moving.push(t);
    else {
      const a = byFill.get(t.fill);
      if (a) a.push(t.d);
      else byFill.set(t.fill, [t.d]);
    }
  }
  return (
    <g>
      {[...byFill].map(([fill, ds]) => <path key={fill} d={ds.join("")} fill={fill} />)}
      {moving.map((t, i) => {
        const k = (frame - t.t) / drop;
        const sc = 1 + (1 - k) * (1 - k) * 0.9;
        return <path key={i} d={t.d} fill={t.fill} opacity={Math.min(1, k * 2.5)} transform={`translate(${t.x} ${t.y}) scale(${sc}) translate(${-t.x} ${-t.y})`} />;
      })}
    </g>
  );
};

export const Mortar = () => (
  <g>
    <rect width={W} height={H} fill={C.mortar} />
    <rect width={W} height={H} filter="url(#m25-mortar)" />
  </g>
);

// The design drawn on the bare setting bed before any stone goes in (the mosaicist's guide): a squared grid,
// the coast, the city rings — in pale ochre, revealed from `origin` outwards as k goes 0 → 1.
export const Sketch = ({ coast, cities, k, origin }: { coast: string; cities: [number, number][]; k: number; origin: [number, number] }) => {
  if (k <= 0) return null;
  const [fx, fy, fw, fh] = FIELD;
  const r = k * Math.hypot(fw, fh);
  const grid = [];
  for (let x = fx + CELL * 8; x < fx + fw; x += CELL * 8) grid.push(`M${x} ${fy}V${fy + fh}`);
  for (let y = fy + CELL * 8; y < fy + fh; y += CELL * 8) grid.push(`M${fx} ${y}H${fx + fw}`);
  return (
    <g>
      <defs>
        <clipPath id="m25-sketch">
          <circle cx={origin[0]} cy={origin[1]} r={r} />
        </clipPath>
        <clipPath id="m25-fieldclip">
          <rect x={fx} y={fy} width={fw} height={fh} />
        </clipPath>
      </defs>
      <g clipPath="url(#m25-fieldclip)">
        <g clipPath="url(#m25-sketch)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={grid.join("")} stroke={C.chalk} strokeWidth={1} opacity={0.22} />
          <path d={coast} stroke={C.chalk} strokeWidth={3} opacity={0.75} />
          <path d={coast} stroke={C.chalk} strokeWidth={1.2} opacity={0.5} transform="translate(0 7)" />
          {cities.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={CELL * 1.5} stroke={C.chalk} strokeWidth={2} opacity={0.8} />)}
        </g>
      </g>
    </g>
  );
};

// Red-ochre underdrawing on the bare mortar, drawn on before the stones go in.
export const Sinopia = ({ d, k }: { d: string; k: number }) => (
  <path d={d} fill="none" stroke="#e88a5c" strokeWidth={3} strokeLinecap="round" strokeDasharray="10 7" pathLength={1000} opacity={0.85 * Math.min(1, k * 3)} style={{ strokeDashoffset: 0 }} clipPath={undefined} />
);

// The floor round the emblem: one polished slab of imperial porphyry (deep purple-red, fine pale speckle), the
// emblem set into it with a white marble ring. Drawn under the stones; it is already there when the stones go in.
export const OpusSectile = ({ emblem, az = 225 }: { emblem: Emblem; az?: number }) => {
  const [fx, fy, fw, fh] = FIELD;
  const pad = 3.6 * CELL;
  const hole = emblem.r + pad;
  const hw = emblem.hw;
  const sheen = interpolate(az, [200, 250], [0.25, 0.75]);
  return (
    <g>
      <defs>
        <mask id="m25-floor" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={fx} y={fy} width={fw} height={fh} fill="#fff" />
          {hw !== undefined ? <rect x={emblem.cx - hw - pad} y={emblem.cy - (emblem.hh ?? 0) - pad} width={2 * (hw + pad)} height={2 * ((emblem.hh ?? 0) + pad)} rx={(emblem.rr ?? 0) + pad} fill="#000" /> : <circle cx={emblem.cx} cy={emblem.cy} r={hole} fill="#000" />}
        </mask>
        <filter id="m25-speckle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={12} />
          <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.86  0 0 0 0 0.84  0 0 0 9 -6.6" />
        </filter>
        <filter id="m25-cloud" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={3} seed={6} />
          <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 0 0.1  0 0 0 0.7 -0.2" />
        </filter>
        <linearGradient id="m25-polish" x1="0" y1="0" x2="1" y2="1">
          <stop offset={sheen - 0.22} stopColor="#fff" stopOpacity={0} />
          <stop offset={sheen} stopColor="#fff" stopOpacity={0.16} />
          <stop offset={sheen + 0.22} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g mask="url(#m25-floor)">
        <rect x={fx} y={fy} width={fw} height={fh} fill={C.porphyry} />
        <rect x={fx} y={fy} width={fw} height={fh} filter="url(#m25-cloud)" />
        <rect x={fx} y={fy} width={fw} height={fh} filter="url(#m25-speckle)" opacity={0.7} />
        <rect x={fx} y={fy} width={fw} height={fh} fill="url(#m25-polish)" />
        {hw !== undefined ? (
          <rect x={emblem.cx - hw - pad - 9} y={emblem.cy - (emblem.hh ?? 0) - pad - 9} width={2 * (hw + pad + 9)} height={2 * ((emblem.hh ?? 0) + pad + 9)} rx={(emblem.rr ?? 0) + pad + 9} fill="none" stroke={C.marble} strokeWidth={14} />
        ) : (
          <circle cx={emblem.cx} cy={emblem.cy} r={hole + 9} fill="none" stroke={C.marble} strokeWidth={14} />
        )}
      </g>
    </g>
  );
};

// Marble tablet with dovetail handles (tabula ansata), letters cut and filled with red inlay.
export const Tablet = ({ box, children, k = 1 }: { box: Box; children: ReactNode; k?: number }) => {
  const [x, y, w, h] = box;
  const e = h * 0.36;
  const d = `M${x} ${y} H${x + w} L${x + w + e} ${y + h * 0.18} V${y + h * 0.82} L${x + w} ${y + h} H${x} L${x - e} ${y + h * 0.82} V${y + h * 0.18} Z`;
  const id = `m25-tab-${Math.round(x)}-${Math.round(y)}`;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbf7ee" />
            <stop offset="0.6" stopColor={C.marble} />
            <stop offset="1" stopColor="#d9cfbb" />
          </linearGradient>
          <filter id={`${id}-v`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves={4} seed={13} />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0 0.38  0 0 -2.2 0 1.1" />
          </filter>
          <clipPath id={`${id}-c`}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} transform="translate(5 8)" fill="#1b140d" opacity={0.45} style={{ filter: "blur(6px)" }} />
        <path d={d} fill={`url(#${id}-g)`} />
        <g clipPath={`url(#${id}-c)`} opacity={0.35}>
          <rect x={x - e} y={y} width={w + 2 * e} height={h} filter={`url(#${id}-v)`} />
        </g>
        <path d={d} fill="none" stroke="#fffaf0" strokeWidth={2} transform="translate(-1 -1)" opacity={0.9} />
        <path d={d} fill="none" stroke="#8d7f66" strokeWidth={1.5} />
        <rect x={x + 14} y={y + 12} width={w - 28} height={h - 24} fill="none" stroke="#a89a80" strokeWidth={1.5} />
        <rect x={x + 15.5} y={y + 13.5} width={w - 28} height={h - 24} fill="none" stroke="#fffaf0" strokeWidth={1} />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: font }}>
        {children}
      </div>
    </div>
  );
};

// Cut letters, filled: cream / gilt on the porphyry tablets (dark lower lip), red on the small marble name-stones.
export const cut = (size: number, weight = 700, color = C.inlay, onDark = false) => ({
  fontFamily: font,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.15,
  textShadow: onDark ? "0 -1.5px 0 rgba(0,0,0,0.7), 0 1px 0 rgba(255,220,200,0.25)" : "0 1.5px 0 rgba(255,250,240,0.95), 0 -1px 0 rgba(60,40,25,0.35)",
});

// A small marble name-stone next to a city.
export const NameStone = ({ x, y, th, la, k, big }: { x: number; y: number; th: string; la: string; k: number; big?: boolean }) => {
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * k})`, opacity: k, padding: big ? "8px 20px 6px" : "5px 14px 4px", background: "linear-gradient(135deg,#fbf7ee,#e4dac6)", boxShadow: "3px 5px 8px rgba(30,20,10,0.45), inset 1px 1px 0 #fffaf0, inset -1px -1px 0 #9b8e76", textAlign: "center", whiteSpace: "nowrap" }}>
      <div style={cut(big ? 40 : 30, 800, big ? C.inlay : C.ink)}>{th}</div>
      <div style={{ ...cut(big ? 17 : 14, 700, C.terracotta), letterSpacing: "0.22em", marginTop: 1 }}>{la}</div>
    </div>
  );
};

export const fade = (frame: number, a: number, b: number, d = 12) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
