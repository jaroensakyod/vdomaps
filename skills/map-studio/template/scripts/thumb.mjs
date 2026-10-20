// Thumbnail still. Usage: node scripts/thumb.mjs <ThumbComposition> <slug> [--headline "..." --accent "..." --sub "..." --frame N]
// Renders frame 0 of a Thumbnail composition (see src/components/Thumbnail.tsx and Root.tsx) to out/<slug>-thumb.png.
// YouTube limit is 2 MB: a larger PNG is re-encoded to JPG.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { headline: { type: "string" }, accent: { type: "string" }, sub: { type: "string" }, frame: { type: "string" } },
});
const [comp, slug] = positionals;
if (!comp || !slug) throw new Error('usage: node scripts/thumb.mjs <ThumbComposition> <slug> [--headline "..."]');
const props = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, k === "frame" ? Number(v) : v]));

mkdirSync("out", { recursive: true });
let file = `out/${slug}-thumb.png`;
const args = ["remotion", "still", comp, file, "--frame=0", "--image-format=png"];
if (Object.keys(props).length) args.push(`--props=${JSON.stringify(props)}`);
execFileSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });

if (statSync(file).size > 2 * 1024 * 1024) {
  const jpg = file.replace(/\.png$/, ".jpg");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-q:v", "3", jpg]);
  file = jpg;
}
console.log(`${file}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
