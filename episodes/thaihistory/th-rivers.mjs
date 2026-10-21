// Main rivers of the central plain + the waterways around Ayutthaya island, from the raw Overpass dumps
// (fetch-osm.mjs th-central / th-ayut-island) → small MultiLineString files, one feature per river name.
import { readFileSync, writeFileSync } from "node:fs";
const load = (n) => JSON.parse(readFileSync(`public/data/${n}.geojson`, "utf8"));
const pack = (src, keep, dp, out) => {
  const f = 10 ** dp, by = new Map();
  for (const x of load(src).features) {
    const n = x.properties.name;
    if (!n || !keep(n)) continue;
    const line = x.geometry.coordinates.map(([a, b]) => [Math.round(a * f) / f, Math.round(b * f) / f]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
    if (line.length > 1) (by.get(n) ?? by.set(n, []).get(n)).push(line);
  }
  const features = [...by].map(([name, lines]) => ({ type: "Feature", properties: { name }, geometry: { type: "MultiLineString", coordinates: lines } }));
  writeFileSync(`public/data/${out}.json`, JSON.stringify({ type: "FeatureCollection", credit: "© OpenStreetMap contributors (ODbL)", features }));
  console.log(out, features.map((x) => `${x.properties.name}(${x.geometry.coordinates.flat().length})`).join(" "));
};
const BIG = ["แม่น้ำเจ้าพระยา", "แม่น้ำลพบุรี", "แม่น้ำป่าสัก", "แม่น้ำน้อย", "แม่น้ำท่าจีน", "แม่น้ำสุพรรณบุรี", "แม่น้ำนครนายก", "แม่น้ำบางปะกง", "แม่น้ำปราจีนบุรี"];
pack("th-central", (n) => BIG.includes(n), 3, "th-plain");
pack("th-ayut-island", (n) => n.startsWith("แม่น้ำ") || ["คลองเมือง", "คลองท่อ", "คลองมหานาค", "คลองนครบาล", "คลองประจาม", "คลองฉะไกรใหญ่"].includes(n), 4, "th-island");
