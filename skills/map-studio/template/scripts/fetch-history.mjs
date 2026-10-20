// Historical borders for one year from aourednik/historical-basemaps (GPL-3.0 data — credit it, mark it approximate).
// Usage: node scripts/fetch-history.mjs <year> [west south east north]
//   year: 1700, 1530, 200, bc500 … (the file list: github.com/aourednik/historical-basemaps/tree/master/geojson)
// Writes public/data/history-<year>.geojson with features that touch the bbox (whole world if none), and prints
// the polity names in it. Properties: NAME (polity), SUBJECTO (overlord), PARTOF, BORDERPRECISION (1 = rough … 3 = exact).
// These borders are scholarly approximations: say "แนวโดยประมาณ / approximate" on screen every time.
import { mkdirSync, writeFileSync } from "node:fs";

const [year, ...a] = process.argv.slice(2);
if (!year) throw new Error("usage: node scripts/fetch-history.mjs <year> [w s e n]");
const [w, s, e, n] = a.length >= 4 ? a.map(Number) : [-180, -90, 180, 90];
const url = `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${year}.geojson`;
const res = await fetch(url);
if (!res.ok) throw new Error(`world_${year}.geojson: ${res.status} — check the year against the file list`);
const all = (await res.json()).features;

const touches = (g) => {
  let hit = false;
  const walk = (c) => {
    if (hit) return;
    if (typeof c[0] === "number") hit = c[0] >= w && c[0] <= e && c[1] >= s && c[1] <= n;
    else c.forEach(walk);
  };
  walk(g.coordinates);
  return hit;
};
const round = (c) => (typeof c[0] === "number" ? [Math.round(c[0] * 1e3) / 1e3, Math.round(c[1] * 1e3) / 1e3] : c.map(round));
const features = all
  .filter((f) => f.geometry && f.properties?.NAME && touches(f.geometry))
  .map((f) => ({
    type: "Feature",
    properties: { NAME: f.properties.NAME, SUBJECTO: f.properties.SUBJECTO ?? null, PARTOF: f.properties.PARTOF ?? null, BORDERPRECISION: f.properties.BORDERPRECISION ?? null },
    geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) },
  }));

mkdirSync("public/data", { recursive: true });
const out = `public/data/history-${year}.geojson`;
writeFileSync(out, JSON.stringify({ type: "FeatureCollection", credit: "Historical borders: historical-basemaps (A. Ourednik, GPL-3.0), approximate", features }));
console.log(`${out}  ${features.length} polities: ${features.map((f) => f.properties.NAME).join(", ").slice(0, 400)}`);
