// node scripts/stills.mjs <composition> <out dir> <f1,f2,…|step> [scale] [cols] — bundle once, render stills, write <out dir>/sheet.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // the project, wherever it is installed
const [id, out, list, scale = "0.3", cols = "5"] = process.argv.slice(2);
const dir = path.join(root, out);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id });
const frames = list.includes(",") ? list.split(",").map(Number) : Array.from({ length: Math.floor(composition.durationInFrames / Number(list)) }, (_, i) => 20 + i * Number(list));
let i = 0;
for (const f of frames.filter((x) => x < composition.durationInFrames)) {
  await renderStill({ composition, serveUrl, output: path.join(dir, `${String(i++).padStart(3, "0")}.jpg`), imageFormat: "jpeg", frame: f, scale: Number(scale), chromiumOptions: { gl: "angle" } });
}
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(dir, "%03d.jpg"), "-vf", `tile=${cols}x${Math.ceil(i / Number(cols))}`, "-frames:v", "1", path.join(dir, "sheet.jpg")]);
console.log(`${i} stills → ${out}/sheet.jpg`);
