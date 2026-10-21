// NASA imagery for <Raster>: true colour, night lights or shaded relief, as one equirectangular JPEG + bbox.
// Usage: node scripts/fetch-imagery.mjs <layer> <name> [west south east north] [width]
//   layer: bluemarble | night | relief | (any NASA GIBS EPSG:4326 layer id)
//   default bbox = whole world; width ≤ 8192 px (height follows the bbox aspect).
//   TIME=YYYY-MM-DD for dated layers, e.g. HLS_S30_Nadir_BRDF_Adjusted_Reflectance (Sentinel-2, 30 m; pick a dry,
//   cloud-free day). Preset `hls` = that layer.
// Writes public/raster/<name>.jpg and public/raster/<name>.json ({ bbox, credit }).
// Source: NASA GIBS WMS (gibs.earthdata.nasa.gov). NASA imagery is not copyrighted; credit it on screen anyway.
import { mkdirSync, writeFileSync } from "node:fs";

const LAYERS = {
  bluemarble: { id: "BlueMarble_NextGeneration", credit: "Imagery: NASA Blue Marble" },
  night: { id: "VIIRS_Black_Marble", credit: "Imagery: NASA Black Marble (VIIRS)" },
  relief: { id: "BlueMarble_ShadedRelief_Bathymetry", credit: "Imagery: NASA Blue Marble shaded relief" },
  hls: { id: "HLS_S30_Nadir_BRDF_Adjusted_Reflectance", credit: "Imagery: NASA HLS (Sentinel-2)" },
};

const [layer, name, ...rest] = process.argv.slice(2);
if (!layer || !name) throw new Error("usage: node scripts/fetch-imagery.mjs <bluemarble|night|relief|GIBS id> <name> [w s e n] [width]");
const nums = rest.map(Number);
const [w, s, e, n] = nums.length >= 4 ? nums.slice(0, 4) : [-180, -90, 180, 90];
const width = Math.min(8192, nums[4] ?? 8192);
const height = Math.max(1, Math.round((width * (n - s)) / (e - w)));
if (height > 8192) throw new Error(`bbox too tall for ${width} px wide; pass a smaller width`);
const { id, credit } = LAYERS[layer] ?? { id: layer, credit: `Imagery: NASA GIBS ${layer}` };

// WMS 1.3.0 with EPSG:4326 takes the bbox as lat,lon order.
const url =
  "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0" +
  `&LAYERS=${id}&CRS=EPSG:4326&BBOX=${s},${w},${n},${e}&WIDTH=${width}&HEIGHT=${height}&FORMAT=image/jpeg` +
  (process.env.TIME ? `&TIME=${process.env.TIME}` : "");
const res = await fetch(url);
if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) throw new Error(`${id}: ${res.status} ${(await res.text()).slice(0, 300)}`);
mkdirSync("public/raster", { recursive: true });
writeFileSync(`public/raster/${name}.jpg`, Buffer.from(await res.arrayBuffer()));
writeFileSync(`public/raster/${name}.json`, JSON.stringify({ bbox: [w, s, e, n], width, height, credit, source: id, ...(process.env.TIME ? { time: process.env.TIME } : {}) }, null, 2));
console.log(`public/raster/${name}.jpg  ${width}×${height}  ${credit}`);
