// Byzantine gold-mosaic engine. A picture is a function `paint(x, y) → region name`; tiles (tesserae) are laid
// over it in three ways: straight rows (`rows`, the gold ground), rings around a centre (`rings`, haloes and
// arches — the andamento follows the curve) and a fine jittered grid (`fine`, figures, faces, buildings). Every
// tile is a slightly irregular quad with its own tilt; gold tiles flash when the moving light band crosses them,
// at a different moment for each tilt. Tiles on a region border take the region's outline colour, which gives
// the icon its dark contour lines. 1080×1920 frame. Build tiles once (module level), animate per frame.
export type Tile = { d: string; x: number; y: number; region: string; fill: string; gold: boolean; tilt: number; r: number; edge: boolean };
export type Paint = (x: number, y: number) => string | null;
export type Swatch = { shades: string[]; outline?: string; gold?: boolean };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// point in polygon ([x0, y0, x1, y1, …])
export const inPoly = (x: number, y: number, p: number[]) => {
  let inside = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
export const inEll = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// distance from a point to a polyline — for drapery folds
export const distLine = (x: number, y: number, p: number[]) => {
  let best = 1e9;
  for (let i = 0; i + 3 < p.length; i += 2) {
    const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3];
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
    best = Math.min(best, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)));
  }
  return best;
};

const quad = (x: number, y: number, s: number, a: number, seed: number) => {
  const h = s / 2;
  const pts = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v], k) => {
    const ju = (rnd(seed * 4 + k) - 0.5) * s * 0.14, jv = (rnd(seed * 4 + k + 2) - 0.5) * s * 0.14;
    const uu = u + ju, vv = v + jv;
    return [x + uu * Math.cos(a) - vv * Math.sin(a), y + uu * Math.sin(a) + vv * Math.cos(a)];
  });
  return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`;
};

type Opts = { paint: Paint; swatch: Record<string, Swatch>; keep: (region: string) => boolean; shade?: (region: string, x: number, y: number) => number; seed?: number };

const make = (o: Opts, x: number, y: number, s: number, a: number, id: number, edgeProbe: number): Tile | null => {
  const region = o.paint(x, y);
  if (!region || !o.keep(region)) return null;
  const sw = o.swatch[region];
  if (!sw) return null;
  let edge = false;
  if (sw.outline && edgeProbe > 0) {
    for (const [dx, dy] of [[edgeProbe, 0], [-edgeProbe, 0], [0, edgeProbe], [0, -edgeProbe]]) if (o.paint(x + dx, y + dy) !== region) edge = true;
  }
  const r = rnd(id + (o.seed ?? 0) * 7919);
  const dark = o.shade ? o.shade(region, x, y) : 0;
  const idx = Math.min(sw.shades.length - 1, Math.floor(r * sw.shades.length * 0.999) + dark);
  return { d: quad(x, y, s * 0.9, a, id), x, y, region, fill: edge ? sw.outline! : sw.shades[idx], gold: !!sw.gold && !edge, tilt: rnd(id * 3 + 1), r, edge };
};

// straight rows, each row nudged sideways (the way gold grounds are set)
export const rows = (o: Opts, box: [number, number, number, number], s: number) => {
  const out: Tile[] = [];
  let id = 1 + (o.seed ?? 0) * 100000;
  for (let y = box[1] + s / 2; y < box[3]; y += s) {
    const off = rnd(y) * s;
    for (let x = box[0] + s / 2 - off; x < box[2] + s; x += s) {
      const t = make(o, x + (rnd(id) - 0.5) * 2, y + (rnd(id + 9) - 0.5) * 2, s, (rnd(id + 5) - 0.5) * 0.08, id++, 0);
      if (t) out.push(t);
    }
  }
  return out;
};
// concentric rings around (cx, cy) from r0 to r1
export const rings = (o: Opts, cx: number, cy: number, r0: number, r1: number, s: number, a0 = 0, a1 = Math.PI * 2) => {
  const out: Tile[] = [];
  let id = 50000 + (o.seed ?? 0) * 100000;
  for (let r = r0 + s / 2; r < r1; r += s) {
    const n = Math.max(6, Math.round(((a1 - a0) * r) / s));
    for (let k = 0; k < n; k++) {
      const a = a0 + ((k + 0.5) / n) * (a1 - a0);
      const t = make(o, cx + Math.cos(a) * r, cy + Math.sin(a) * r, s, a + (rnd(id) - 0.5) * 0.1, id++, s * 0.55);
      if (t) out.push(t);
    }
  }
  return out;
};
// fine jittered grid for figures and buildings
export const fine = (o: Opts, box: [number, number, number, number], s: number) => {
  const out: Tile[] = [];
  let id = 200000 + (o.seed ?? 0) * 100000;
  for (let y = box[1] + s / 2; y < box[3]; y += s)
    for (let x = box[0] + s / 2 + ((Math.round(y / s) % 2) * s) / 2; x < box[2]; x += s) {
      const t = make(o, x + (rnd(id) - 0.5) * s * 0.12, y + (rnd(id + 3) - 0.5) * s * 0.12, s, (rnd(id + 7) - 0.5) * 0.18, id++, s * 0.62);
      if (t) out.push(t);
    }
  return out;
};

// light band for the shimmer: position along x + 0.6 y
export const glint = (t: Tile, band: number) => {
  const d = (t.x + t.y * 0.6 - band - t.tilt * 260) / 120;
  return Math.exp(-d * d) * (0.35 + 0.65 * t.tilt);
};

// one tile as it is set: k 0 → 1 (pressed in from slightly larger and lighter), plus an optional fall offset
export const TileEl = ({ t, k = 1, glow = 0, fall }: { t: Tile; k?: number; glow?: number; fall?: { dx: number; dy: number; rot: number; o: number } }) => {
  if (k <= 0) return null;
  const s = k < 1 ? 1 + (1 - k) * 0.8 : 1;
  const tr = fall ? `translate(${fall.dx},${fall.dy}) rotate(${fall.rot},${t.x},${t.y})` : s !== 1 ? `translate(${t.x},${t.y}) scale(${s}) translate(${-t.x},${-t.y})` : undefined;
  return (
    <g transform={tr} opacity={fall ? fall.o : Math.min(1, k * 1.4)}>
      <path d={t.d} fill={t.fill} />
      {glow > 0.04 && <path d={t.d} fill="#fff4c4" opacity={Math.min(0.85, glow)} />}
    </g>
  );
};

export const MosaicDefs = () => (
  <defs>
    {/* the mortar bed between and under the tiles */}
    <filter id="bz-mortar" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
      <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0.5 0" />
    </filter>
    {/* letters set in tesserae: text is cut by a tile grid with mortar gaps */}
    <pattern id="bz-tiles" width={11} height={11} patternUnits="userSpaceOnUse">
      <rect x={0.9} y={0.9} width={9.2} height={9.2} fill="#fff" />
    </pattern>
    <radialGradient id="bz-light" cx="0.45" cy="0.3" r="0.85">
      <stop offset="0" stopColor="#fff6dc" stopOpacity={0.16} />
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.3} />
    </radialGradient>
    <mask id="bz-tilemask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
      <rect width={1080} height={1920} fill="url(#bz-tiles)" />
    </mask>
  </defs>
);
