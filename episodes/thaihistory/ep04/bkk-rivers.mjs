// Thonburi-era canals around the old palace from the raw Overpass dump (fetch-osm.mjs th-bkk) → data/th-bkk.json.
// Later canals (Rattanakosin era and after) are left out.
import { readFileSync, writeFileSync } from "node:fs";
const KEEP = ["คลองบางกอกน้อย", "คลองบางกอกใหญ่", "คลองบางหลวง", "คลองมอญ", "คลองชักพระ", "คลองด่าน", "คลองคูเมืองเดิม", "คลองบางยี่ขัน", "คลองบางพลัด"];
const by = new Map();
for (const x of JSON.parse(readFileSync("public/data/th-bkk.geojson", "utf8")).features) {
  const n = x.properties?.name;
  if (!n || !KEEP.some((k) => n.startsWith(k)) || x.geometry.type !== "LineString") continue;
  const line = x.geometry.coordinates.map(([a, b]) => [Math.round(a * 1e4) / 1e4, Math.round(b * 1e4) / 1e4]);
  (by.get(n) ?? by.set(n, []).get(n)).push(line);
}
const features = [...by].map(([name, lines]) => ({ type: "Feature", properties: { name }, geometry: { type: "MultiLineString", coordinates: lines } }));
writeFileSync("public/data/th-bkk.json", JSON.stringify({ type: "FeatureCollection", credit: "© OpenStreetMap contributors (ODbL)", features }));
console.log("th-bkk", features.map((f) => `${f.properties.name}(${f.geometry.coordinates.length})`).join(" "));
