// Render several stills of one composition with a single bundle. Usage: node scripts/stills-at.mjs <Composition> <outDir> <frame...> [--scale=0.4]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const args = process.argv.slice(2);
const scale = Number(args.find((a) => a.startsWith("--scale="))?.slice(8) ?? 0.4);
const [id, dir, ...frames] = args.filter((a) => !a.startsWith("--"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: path.join(dir, `${id}-${String(f).padStart(5, "0")}.jpg`), imageFormat: "jpeg", scale, chromiumOptions: { gl: "angle" } });
  console.log("still", f);
}
