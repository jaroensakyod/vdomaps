// Render ONE long composition faster and safely: split it into short segments rendered side by side, then join. Usage:
//   node scripts/render-chunks.mjs <composition> <out.mp4> [--parts 3] [--segment 900] [--concurrency 5] [--gl angle] [--loudness] [--glitch]
//   node scripts/render-chunks.mjs WhatIf01 out/whatif/whatif-ep01.mp4 --loudness --glitch
// Why: one render keeps the machine at ~25 % CPU and the GPU mostly idle (frames wait on paint → screenshot →
// encode in turn), and a 10-minute 9:16 episode took ~45 min. Segments render muted, `parts` at a time; the sound is
// rendered once for the whole timeline (fast, no frames) so there is no click or gap at the joins; ffmpeg then
// joins the segments without re-encoding and lays the full soundtrack under them.
// Resumable (23 Oct 2026, after an FFmpeg crash 0xC0000142 lost a 40-min render at ~75 %): every finished segment
// (30 s by default) stays in <out>.parts/, a crash loses only the segments in progress, and running the same command
// again skips the segments already complete. A failed segment is retried (--retries 3) before the script gives up.
// Keeps the settings of remotion.config.ts (jpeg frames, h264 crf 18); the Node API does not read that file.
// Final renders use --gl angle (house standard: Vulkan sometimes composites a ghosted frame).
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    parts: { type: "string", default: "3" }, // segments rendered at the same time
    segment: { type: "string", default: "900" }, // frames per saved segment
    retries: { type: "string", default: "3" },
    concurrency: { type: "string", default: "5" }, // per segment
    gl: { type: "string", default: "angle" },
    loudness: { type: "boolean", default: false },
    glitch: { type: "boolean", default: false },
    timeout: { type: "string", default: "120000" },
  },
});
const [id, out] = positionals;
if (!id || !out) throw new Error("usage: node scripts/render-chunks.mjs <composition> <out.mp4> [--parts 3] [--segment 900] [--concurrency 5] [--loudness] [--glitch]");

const t0 = Date.now();
const sec = (t) => ((Date.now() - t) / 1000).toFixed(0);
const tmp = `${out}.parts`;
mkdirSync(tmp, { recursive: true });
mkdirSync(dirname(out), { recursive: true });

console.log("bundling…");
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const opts = { serveUrl, timeoutInMilliseconds: Number(values.timeout), chromiumOptions: { gl: values.gl } };
const composition = await selectComposition({ ...opts, id });
const total = composition.durationInFrames;
const size = Math.max(60, Number(values.segment));
const ranges = Array.from({ length: Math.ceil(total / size) }, (_, i) => [i * size, Math.min(total, (i + 1) * size) - 1]);
const n = Math.max(1, Math.min(Number(values.parts), ranges.length));
console.log(`${id}: ${total} frames → ${ranges.length} segments of ${size}, ${n} at a time, concurrency ${values.concurrency} each (bundled in ${sec(t0)} s)`);

const part = (i) => `${tmp}/part${i + 1}.mp4`;
const countFrames = (f) => {
  try {
    return parseInt(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", f]).toString().trim()) || 0;
  } catch {
    return 0;
  }
};
const done = ranges.map(([a, b], i) => existsSync(part(i)) && countFrames(part(i)) === b - a + 1);
if (done.some(Boolean)) console.log(`resuming: ${done.filter(Boolean).length}/${ranges.length} segments already rendered`);

const pct = ranges.map((_, i) => (done[i] ? 100 : 0));
let soundPct = 0;
const report = () => {
  const now = pct.map((p, i) => (p > 0 && p < 100 ? `#${i + 1} ${p}%` : "")).filter(Boolean).join(" ");
  process.stdout.write(`\r  segments ${pct.filter((p) => p === 100).length}/${ranges.length} · ${now} · sound ${soundPct}%   `);
};
const retry = async (label, fn) => {
  for (let k = 1; ; k++) {
    try {
      return await fn();
    } catch (err) {
      if (k >= Number(values.retries)) throw new Error(`${label} failed ${k} times — run the same command again to resume: ${err.message}`);
      console.log(`\n  ${label} failed (${String(err.message).split("\n")[0]}), retry ${k + 1}/${values.retries}`);
    }
  }
};

const renderSegment = (i) =>
  retry(`segment ${i + 1}`, async () => {
    await renderMedia({
      ...opts,
      composition,
      codec: "h264",
      crf: 18,
      imageFormat: "jpeg",
      muted: true,
      frameRange: ranges[i],
      outputLocation: part(i),
      overwrite: true,
      concurrency: Number(values.concurrency),
      onProgress: ({ progress }) => {
        pct[i] = Math.min(99, Math.floor(progress * 100));
        report();
      },
    });
    pct[i] = 100;
    report();
  });
const queue = ranges.map((_, i) => i).filter((i) => !done[i]);
const worker = async () => {
  while (queue.length) await renderSegment(queue.shift());
};
const soundFile = `${tmp}/sound.wav`;
const soundDone = existsSync(soundFile) && statSync(soundFile).size > 1e6;
if (soundDone) soundPct = 100;
await Promise.all([
  ...Array.from({ length: n }, worker),
  soundDone
    ? Promise.resolve()
    : retry("sound", () =>
        renderMedia({
          ...opts,
          composition,
          codec: "wav",
          outputLocation: soundFile,
          overwrite: true,
          onProgress: ({ progress }) => {
            soundPct = Math.floor(progress * 100);
            report();
          },
        }),
      ),
]);
console.log(`\nsegments done in ${sec(t0)} s — joining`);

// Join: concat demuxer copies the h264 segments (same encoder settings), the whole-timeline wav goes under as AAC.
writeFileSync(`${tmp}/list.txt`, ranges.map((_, i) => `file '${resolve(part(i)).replace(/\\/g, "/")}'`).join("\n"));
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${tmp}/list.txt`, "-i", soundFile, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", out], { stdio: "inherit" });
const frames = countFrames(out);
if (frames !== total) throw new Error(`joined file has ${frames} frames, expected ${total} — segments kept in ${tmp}`);
rmSync(tmp, { recursive: true, force: true });
console.log(`✓ ${out} (${total} frames, ${sec(t0)} s)`);

if (values.glitch) execFileSync("node", ["scripts/check-glitch.mjs", out], { stdio: "inherit" });
if (values.loudness) execFileSync("node", ["scripts/loudness.mjs", out], { stdio: "inherit" });
