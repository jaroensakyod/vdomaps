// Render several compositions with one bundle and a few renders at a time. Usage:
//   node scripts/render-batch.mjs [--parallel 3] [--concurrency 6] [--loudness] <composition>=<out.mp4> ...
//   node scripts/render-batch.mjs --loudness S02fb=out/ep02-fb.mp4 S03fb=out/ep03-fb.mp4
// Why: one Remotion render keeps the GPU at ~25–30 % (each frame waits for paint → screenshot → encode in turn),
// so running 3 renders side by side fills the gaps. Measured on an RTX 2060 / i7-10875H, 600-frame 9:16 map
// episodes: 1 render at a time 28.5 s per file, 3 side by side 54 s for 3 files (~33 fps overall).
// Keeps the settings of remotion.config.ts (jpeg frames, h264 crf 18, Vulkan GL) — the Node API does not read
// that file, so they are repeated here. --loudness runs scripts/loudness.mjs on every file afterwards.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    parallel: { type: "string", default: "3" },
    concurrency: { type: "string", default: "6" },
    gl: { type: "string", default: "vulkan" },
    loudness: { type: "boolean", default: false },
    timeout: { type: "string", default: "120000" }, // ms per frame/start; ANGLE with many tabs needs more than the 30 s default
  },
});
const jobs = positionals.map((p) => {
  const [id, out] = p.split("=");
  if (!id || !out) throw new Error(`bad job "${p}", expected <composition>=<out.mp4>`);
  return { id, out };
});
if (!jobs.length) throw new Error("usage: node scripts/render-batch.mjs [--parallel 3] [--concurrency 6] [--loudness] <composition>=<out.mp4> ...");

const t0 = Date.now();
const sec = (t) => ((Date.now() - t) / 1000).toFixed(1);
console.log("bundling…");
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
console.log(`bundled in ${sec(t0)} s · ${jobs.length} files, ${values.parallel} at a time, concurrency ${values.concurrency}`);

const render = async ({ id, out }) => {
  const t = Date.now();
  const composition = await selectComposition({ serveUrl, id, timeoutInMilliseconds: Number(values.timeout), chromiumOptions: { gl: values.gl } });
  mkdirSync(dirname(out), { recursive: true });
  let last = -10;
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 18,
    imageFormat: "jpeg",
    outputLocation: out,
    overwrite: true,
    concurrency: Number(values.concurrency),
    chromiumOptions: { gl: values.gl },
    timeoutInMilliseconds: Number(values.timeout),
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct >= last + 25) console.log(`  ${id.padEnd(10)} ${pct}%`), (last = pct);
    },
  });
  if (values.loudness) execFileSync("node", ["scripts/loudness.mjs", out], { stdio: "inherit" });
  console.log(`✓ ${id} → ${out} (${composition.durationInFrames} frames, ${sec(t)} s)`);
};

const queue = [...jobs];
await Promise.all(
  Array.from({ length: Math.min(Number(values.parallel), jobs.length) }, async () => {
    while (queue.length) await render(queue.shift());
  }),
);
console.log(`all done in ${sec(t0)} s`);
