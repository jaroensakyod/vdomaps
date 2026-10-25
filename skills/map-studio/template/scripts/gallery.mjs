// Covers (and sample clips) of every installed style demo, with one bundle. Usage:
//   npm run gallery [-- N05 M02] [--clips] [--into [<styles dir>]] [--gl angle]
// Writes out/gallery/<id>-9x16.jpg, <id>-16x9.jpg and <id>-4x5.jpg at each demo's cover frame, sheet.jpg (all covers), and with
// --clips out/gallery/<id>.mp4 (first size of the demo). --into copies them into each pack folder as
// cover-9x16.jpg, cover-16x9.jpg, cover-4x5.jpg, sample.mp4 (default: the styles dir found by styles-lib.mjs).
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { findPack, findStylesDir, root } from "./styles-lib.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { clips: { type: "boolean", default: false }, into: { type: "string" }, gl: { type: "string", default: "angle" } },
  strict: false,
});
// `--into` with no value: parseArgs gives `true`
const intoDir = values.into === undefined ? undefined : findStylesDir(typeof values.into === "string" ? values.into : undefined);
if (values.into !== undefined && !intoDir) {
  console.error("ไม่พบโฟลเดอร์ styles สำหรับ --into");
  process.exit(1);
}
const want = new Set(positionals.map((p) => p.toUpperCase()));
const out = path.join(root, "out/gallery");
mkdirSync(out, { recursive: true });

const chromiumOptions = { gl: String(values.gl) };
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), onProgress: () => {} });
const comps = (await getCompositions(serveUrl, { chromiumOptions })).filter((c) => c.id.startsWith("Style-"));
const idOf = (c) => c.id.replace(/^Style-/, "").replace(/-(wide|post)$/, "");
const sizeOf = (c) => (c.id.endsWith("-wide") ? "16x9" : c.id.endsWith("-post") ? "4x5" : "9x16");
const picked = comps.filter((c) => want.size === 0 || want.has(idOf(c)));
if (picked.length === 0) {
  console.error(comps.length ? `ไม่มีสไตล์ ${[...want].join(", ")} ที่ติดตั้งแล้ว` : "ยังไม่ได้ติดตั้งสไตล์ — npm run style -- <ID>");
  process.exit(1);
}

const covers = [];
const clipDone = new Set();
for (const c of picked) {
  const id = idOf(c);
  const size = sizeOf(c);
  const file = path.join(out, `${id}-${size}.jpg`);
  const frame = Math.min(c.durationInFrames - 1, Number(c.props?.cover ?? Math.floor(c.durationInFrames / 2)));
  await renderStill({ composition: c, serveUrl, output: file, imageFormat: "jpeg", jpegQuality: 90, frame, chromiumOptions });
  covers.push(file);
  console.log(`${c.id} frame ${frame} → out/gallery/${id}-${size}.jpg`);
  if (values.clips && !clipDone.has(id)) {
    clipDone.add(id);
    await renderMedia({ composition: c, serveUrl, codec: "h264", crf: 18, outputLocation: path.join(out, `${id}.mp4`), chromiumOptions });
    console.log(`${c.id} → out/gallery/${id}.mp4`);
  }
}

// Contact sheet: every cover fitted into a 360×640 cell, 6 per row.
const cells = path.join(out, ".sheet");
rmSync(cells, { recursive: true, force: true });
mkdirSync(cells);
covers.forEach((f, i) =>
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", f, "-vf", "scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2:color=0x111111", path.join(cells, `${String(i).padStart(3, "0")}.jpg`)]),
);
const cols = Math.min(6, covers.length);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(cells, "%03d.jpg"), "-vf", `tile=${cols}x${Math.ceil(covers.length / cols)}`, "-frames:v", "1", path.join(out, "sheet.jpg")]);
rmSync(cells, { recursive: true, force: true });
console.log(`${covers.length} covers → out/gallery/sheet.jpg`);

if (intoDir) {
  for (const id of new Set(picked.map(idOf))) {
    const pack = findPack(intoDir, id);
    if (!pack) { console.warn(`!! ${id}: no pack folder in ${intoDir}`); continue; }
    for (const [from, to] of [[`${id}-9x16.jpg`, "cover-9x16.jpg"], [`${id}-16x9.jpg`, "cover-16x9.jpg"], [`${id}-4x5.jpg`, "cover-4x5.jpg"], [`${id}.mp4`, "sample.mp4"]])
      if (existsSync(path.join(out, from))) cpSync(path.join(out, from), path.join(pack.dir, to));
    console.log(`copied ${id} → ${path.relative(root, pack.dir) || pack.dir}`);
  }
}
