// Elevation for relief maps: Copernicus DEM GLO-90 → hillshade, colour relief and an elevation grid.
// Usage: node scripts/fetch-dem.mjs <name> <west> <south> <east> <north> [pixelsPerDegree=600] [exaggeration=1.5]
// Writes public/raster/<name>-hillshade.png (grey, multiply it over imagery or a flat map),
//        public/raster/<name>-relief.png (hypsometric colours × hillshade, a ready base map),
//        public/raster/<name>-dem.json ({ bbox, credit, min, max, peak: [lon, lat, m], grid: w×h metres, ~200 wide }),
//        and the same { bbox, credit } sidecars as fetch-imagery so <Raster> can read them.
// Tiles: 1°×1° Cloud-Optimised GeoTIFFs on AWS open data (no account). Sea tiles do not exist → 0 m.
// Licence: free incl. commercial, attribution required (credit string below).
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fromArrayBuffer } from "geotiff";

const [name, ...a] = process.argv.slice(2);
const [w, s, e, n, ppd = 600, exag = 1.5] = a.map(Number);
if (!name || [w, s, e, n].some(Number.isNaN)) throw new Error("usage: node scripts/fetch-dem.mjs <name> <w> <s> <e> <n> [pixelsPerDegree] [exaggeration]");
const CREDIT = "Elevation: Copernicus DEM GLO-90 © DLR e.V. 2010–2014, © Airbus 2014–2018, provided under COPERNICUS by the EU and ESA";
const W = Math.round((e - w) * ppd);
const H = Math.round((n - s) * ppd);
if (W * H > 40e6) throw new Error(`${W}×${H} is too big; lower pixelsPerDegree`);

const tileName = (lat, lon) => {
  const la = `${lat < 0 ? "S" : "N"}${String(Math.abs(lat)).padStart(2, "0")}_00`;
  const lo = `${lon < 0 ? "W" : "E"}${String(Math.abs(lon)).padStart(3, "0")}_00`;
  return `Copernicus_DSM_COG_30_${la}_${lo}_DEM`;
};

// Load every 1° tile the bbox touches.
const tiles = new Map();
for (let lat = Math.floor(s); lat < n; lat++)
  for (let lon = Math.floor(w); lon < e; lon++) {
    const t = tileName(lat, lon);
    const res = await fetch(`https://copernicus-dem-90m.s3.amazonaws.com/${t}/${t}.tif`);
    if (res.status === 404 || res.status === 403) {
      tiles.set(`${lat},${lon}`, null); // open sea
      continue;
    }
    if (!res.ok) throw new Error(`${t}: ${res.status}`);
    const img = await (await fromArrayBuffer(await res.arrayBuffer())).getImage();
    const [data] = await img.readRasters();
    tiles.set(`${lat},${lon}`, { data, w: img.getWidth(), h: img.getHeight() });
    process.stdout.write(".");
  }
console.log(` ${tiles.size} tiles`);

// Resample to the output grid (bilinear inside a tile; tile rows run north → south).
const elev = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  const lat = n - ((y + 0.5) / H) * (n - s);
  for (let x = 0; x < W; x++) {
    const lon = w + ((x + 0.5) / W) * (e - w);
    const tl = Math.floor(lat), tn = Math.floor(lon);
    const t = tiles.get(`${tl},${tn}`);
    if (!t) continue;
    const fx = (lon - tn) * (t.w - 1), fy = (tl + 1 - lat) * (t.h - 1);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(x0 + 1, t.w - 1), y1 = Math.min(y0 + 1, t.h - 1);
    const dx = fx - x0, dy = fy - y0, d = t.data;
    const v = d[y0 * t.w + x0] * (1 - dx) * (1 - dy) + d[y0 * t.w + x1] * dx * (1 - dy) + d[y1 * t.w + x0] * (1 - dx) * dy + d[y1 * t.w + x1] * dx * dy;
    elev[y * W + x] = v > -500 ? v : 0;
  }
}

// Hillshade: two light directions (NW strong, W soft) so ridges read on both sides.
const mPerPxX = ((e - w) / W) * 111320 * Math.cos((((n + s) / 2) * Math.PI) / 180);
const mPerPxY = ((n - s) / H) * 111320;
const at = (x, y) => elev[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
const shade = new Uint8Array(W * H);
const lights = [
  { az: 315, alt: 45, k: 0.7 },
  { az: 270, alt: 40, k: 0.3 },
// GDAL convention: compass azimuth → maths angle (360 − az + 90).
].map((l) => ({ ...l, az: (((360 - l.az + 90) % 360) * Math.PI) / 180, alt: (l.alt * Math.PI) / 180 }));
let min = Infinity, max = -Infinity, peak = [0, 0, -Infinity];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const z = at(x, y);
    if (z < min) min = z;
    if (z > max) max = z;
    if (z > peak[2]) peak = [w + ((x + 0.5) / W) * (e - w), n - ((y + 0.5) / H) * (n - s), z];
    const dzdx = ((at(x + 1, y) - at(x - 1, y)) / (2 * mPerPxX)) * exag;
    const dzdy = ((at(x, y + 1) - at(x, y - 1)) / (2 * mPerPxY)) * exag; // +y = south
    const slope = Math.atan(Math.hypot(dzdx, dzdy));
    const aspect = Math.atan2(dzdy, -dzdx);
    let v = 0;
    for (const l of lights) v += l.k * (Math.sin(l.alt) * Math.cos(slope) + Math.cos(l.alt) * Math.sin(slope) * Math.cos(l.az - aspect));
    shade[y * W + x] = Math.max(0, Math.min(255, Math.round(255 * (0.25 + 0.85 * v))));
  }

// Hypsometric tint (lowland green → hills tan → high rock) multiplied by the hillshade.
const STOPS = [
  [0, [118, 160, 104]], [200, [150, 178, 112]], [500, [196, 190, 132]], [1000, [186, 156, 112]],
  [1600, [160, 128, 100]], [2400, [176, 166, 158]], [4000, [235, 235, 235]],
];
const tint = (z) => {
  for (let i = 1; i < STOPS.length; i++)
    if (z <= STOPS[i][0]) {
      const [z0, c0] = STOPS[i - 1], [z1, c1] = STOPS[i], t = (z - z0) / (z1 - z0);
      return c0.map((c, k) => c + (c1[k] - c) * t);
    }
  return STOPS[STOPS.length - 1][1];
};
const rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const z = elev[i], sh = shade[i] / 255;
  const c = z <= 0 ? [52, 92, 128] : tint(z);
  const k = z <= 0 ? 1 : 0.35 + 0.8 * sh;
  for (let j = 0; j < 3; j++) rgb[i * 3 + j] = Math.max(0, Math.min(255, Math.round(c[j] * k)));
}

mkdirSync("public/raster", { recursive: true });
const png = (buf, fmt, out) =>
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", fmt, "-s", `${W}x${H}`, "-i", "-", "-frames:v", "1", out], { input: buf });
png(Buffer.from(shade), "gray", `public/raster/${name}-hillshade.png`);
png(rgb, "rgb24", `public/raster/${name}-relief.png`);
const meta = { bbox: [w, s, e, n], width: W, height: H, credit: CREDIT };
writeFileSync(`public/raster/${name}-hillshade.json`, JSON.stringify(meta, null, 2));
writeFileSync(`public/raster/${name}-relief.json`, JSON.stringify(meta, null, 2));

// Small elevation grid for isometric blocks, 3D, profiles or "highest point" labels.
const gw = Math.min(200, W), gh = Math.max(1, Math.round((gw * H) / W));
const grid = [];
for (let y = 0; y < gh; y++)
  for (let x = 0; x < gw; x++) grid.push(Math.round(elev[Math.floor(((y + 0.5) / gh) * H) * W + Math.floor(((x + 0.5) / gw) * W)]));
writeFileSync(`public/raster/${name}-dem.json`, JSON.stringify({ ...meta, min: Math.round(min), max: Math.round(max), peak: [+peak[0].toFixed(4), +peak[1].toFixed(4), Math.round(peak[2])], gridWidth: gw, gridHeight: gh, grid }));
console.log(`public/raster/${name}-{hillshade,relief}.png ${W}×${H}  elevation ${Math.round(min)}–${Math.round(max)} m, peak at ${peak[0].toFixed(3)},${peak[1].toFixed(3)}`);
