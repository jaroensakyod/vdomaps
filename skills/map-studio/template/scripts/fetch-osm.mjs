// OpenStreetMap features in a bbox via the Overpass API → GeoJSON lines/points with Thai and English names.
// Usage: node scripts/fetch-osm.mjs <name> <west> <south> <east> <north> [preset|"raw overpass filter"]
//   presets: rivers (river + canal), bigrivers (river only), roads (motorway–primary), rail, cities (place=city|town)
// Writes public/data/<name>.geojson. Licence ODbL: on screen "© OpenStreetMap contributors" — required.
// Keep the bbox small (a province, a city); Overpass rejects or times out on country-wide queries of dense features.
import { mkdirSync, writeFileSync } from "node:fs";

const PRESETS = {
  rivers: 'way["waterway"~"^(river|canal)$"]',
  bigrivers: 'way["waterway"="river"]',
  roads: 'way["highway"~"^(motorway|trunk|primary)$"]',
  rail: 'way["railway"="rail"]',
  cities: 'node["place"~"^(city|town)$"]',
};
const [name, ...a] = process.argv.slice(2);
const [w, s, e, n] = a.slice(0, 4).map(Number);
const filter = PRESETS[a[4] ?? "rivers"] ?? a[4];
if (!name || [w, s, e, n].some(Number.isNaN)) throw new Error("usage: node scripts/fetch-osm.mjs <name> <w> <s> <e> <n> [preset|filter]");

const query = `[out:json][timeout:180];${filter}(${s},${w},${n},${e});out geom;`;
const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "map-studio/1.0" },
  body: "data=" + encodeURIComponent(query),
});
if (!res.ok) throw new Error(`Overpass ${res.status}: ${(await res.text()).slice(0, 300)}`);
const { elements } = await res.json();

const r5 = (v) => Math.round(v * 1e5) / 1e5;
const features = elements.flatMap((el) => {
  const t = el.tags ?? {};
  const properties = { id: el.id, name: t["name:th"] ?? t.name ?? null, name_en: t["name:en"] ?? null, kind: t.waterway ?? t.highway ?? t.railway ?? t.place ?? null };
  if (el.type === "node") return [{ type: "Feature", properties, geometry: { type: "Point", coordinates: [r5(el.lon), r5(el.lat)] } }];
  if (!el.geometry?.length) return [];
  return [{ type: "Feature", properties, geometry: { type: "LineString", coordinates: el.geometry.map((p) => [r5(p.lon), r5(p.lat)]) } }];
});

mkdirSync("public/data", { recursive: true });
const out = `public/data/${name}.geojson`;
writeFileSync(out, JSON.stringify({ type: "FeatureCollection", credit: "© OpenStreetMap contributors (ODbL)", features }));
const named = [...new Set(features.map((f) => f.properties.name).filter(Boolean))];
console.log(`${out}  ${features.length} features  e.g. ${named.slice(0, 8).join(", ")}`);
