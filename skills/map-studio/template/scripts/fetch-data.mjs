// Fetch extra base layers into public/data. Usage: node scripts/fetch-data.mjs [ISO3 ...]   (default: THA)
// Province boundaries come from geoBoundaries gbOpen (CC BY 4.0 for most countries — the script prints the
// license reported by the API; credit "Boundaries: geoBoundaries" on screen).
import { mkdir, writeFile } from "node:fs/promises";

const isos = process.argv.slice(2).length ? process.argv.slice(2) : ["THA"];
await mkdir("public/data", { recursive: true });

for (const iso of isos) {
  const meta = await (await fetch(`https://www.geoboundaries.org/api/current/gbOpen/${iso}/ADM1/`)).json();
  const res = await fetch(meta.simplifiedGeometryGeoJSON);
  if (!res.ok) throw new Error(`${iso}: ${res.status} ${meta.simplifiedGeometryGeoJSON}`);
  const out = `public/data/${iso.toLowerCase()}-adm1.geojson`;
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log(`${out}  license: ${meta.boundaryLicense}  source: ${meta.boundarySource}`);
}
