// River network + lakes for a region from Natural Earth 1:10m (public domain), clipped to a bbox.
// Usage: node scripts/fetch-rivers.mjs <name> <west> <south> <east> <north> [maxScalerank=9]
// Writes public/data/<name>.json = { rivers, lakes } FeatureCollections. Rivers keep `name`, `rank` (scalerank:
// 0 = biggest) so scenes can make big rivers thicker and grow them first. Reservoirs (modern dams) are dropped
// so historical scenes stay honest — re-add them with KEEP_RESERVOIRS=1.
// For flow-scaled widths of every stream use HydroRIVERS (see references/data-sources.md) — it is a large download.
import { geoArea } from "d3-geo";
import { mkdirSync, writeFileSync } from "node:fs";

const [name, ...a] = process.argv.slice(2);
const [w, s, e, n, maxRank = 9] = a.map(Number);
if (!name || [w, s, e, n].some(Number.isNaN)) throw new Error("usage: node scripts/fetch-rivers.mjs <name> <w> <s> <e> <n> [maxScalerank]");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const get = async (f) => (await (await fetch(`${NE}/${f}.geojson`)).json()).features;

const inside = ([x, y]) => x >= w && x <= e && y >= s && y <= n;
const points = (g) => {
  const out = [];
  const walk = (c) => (typeof c[0] === "number" ? out.push(c) : c.forEach(walk));
  walk(g.coordinates);
  return out;
};
const round = (c) => (typeof c[0] === "number" ? [Math.round(c[0] * 1e3) / 1e3, Math.round(c[1] * 1e3) / 1e3] : c.map(round));
const keep = (f, properties) => ({ type: "Feature", properties, geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) } });

const rivers = (await get("ne_10m_rivers_lake_centerlines"))
  .filter((f) => f.geometry && !/Lake Centerline/.test(f.properties.featurecla) && f.properties.scalerank <= maxRank && points(f.geometry).some(inside))
  .map((f) => keep(f, { name: f.properties.name, name_th: f.properties.name_th ?? null, rank: f.properties.scalerank }));
const lakes = (await get("ne_10m_lakes"))
  .filter((f) => f.geometry && points(f.geometry).some(inside) && (process.env.KEEP_RESERVOIRS || !/Shuiku|Reservoir|Dam/i.test(f.properties.name ?? "")))
  .map((f) => keep(f, { name: f.properties.name }))
  .filter((f) => geoArea(f) < 2 * Math.PI); // rounding can flip a tiny ring into "the whole globe"

mkdirSync("public/data", { recursive: true });
const out = `public/data/${name}.json`;
writeFileSync(out, JSON.stringify({ credit: "Rivers & lakes: Natural Earth", rivers: { type: "FeatureCollection", features: rivers }, lakes: { type: "FeatureCollection", features: lakes } }));
console.log(`${out}  ${rivers.length} rivers (${[...new Set(rivers.map((r) => r.properties.name).filter(Boolean))].slice(0, 10).join(", ")}), ${lakes.length} lakes`);
