// M05 data: old waterways of Bangkok / Thonburi from the raw Overpass dump → public/data/old-canals.json.
// Run from the project root after:  npm run osm -- th-bkk 100.44 13.68 100.54 13.80 rivers
//   node src/styles/M05/kit/canals.mjs [in=th-bkk] [out=old-canals]
// One MultiLineString per name, coordinates rounded to 1e-4° (~11 m), with an `era` the scene colours by:
//   river = Chao Phraya today · old = the river's old loop (Bangkok Noi + Bangkok Yai) · thon = Thonburi-era canals ·
//   rat = early Rattanakosin moat. Later canals are left out on purpose (an old map should not show 1900s canals).
// For another city: copy this file, change KEEP and the bbox of the osm fetch.
import { readFileSync, writeFileSync } from "node:fs";

const [src = "th-bkk", out = "old-canals"] = process.argv.slice(2);
const KEEP = {
  แม่น้ำเจ้าพระยา: "river",
  คลองบางกอกน้อย: "old",
  คลองบางกอกใหญ่: "old",
  คลองคูเมืองเดิม: "thon",
  คลองมอญ: "thon",
  คลองชักพระ: "thon",
  คลองบางพลัด: "thon",
  คลองบางยี่ขัน: "thon",
  คลองด่าน: "thon",
  คลองรอบกรุง: "rat",
};
const by = new Map();
for (const x of JSON.parse(readFileSync(`public/data/${src}.geojson`, "utf8")).features) {
  const n = x.properties?.name;
  const key = n && Object.keys(KEEP).find((k) => n.startsWith(k));
  if (!key || x.geometry.type !== "LineString") continue;
  const line = x.geometry.coordinates
    .map(([a, b]) => [Math.round(a * 1e4) / 1e4, Math.round(b * 1e4) / 1e4])
    .filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
  if (line.length > 1) (by.get(key) ?? by.set(key, []).get(key)).push(line);
}
const features = [...by].map(([name, lines]) => ({ type: "Feature", properties: { name, era: KEEP[name] }, geometry: { type: "MultiLineString", coordinates: lines } }));
writeFileSync(`public/data/${out}.json`, JSON.stringify({ type: "FeatureCollection", credit: "© OpenStreetMap contributors (ODbL)", features }));
console.log(out, features.map((f) => `${f.properties.name}(${f.geometry.coordinates.length})`).join(" "));
