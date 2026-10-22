// Loudness to YouTube's target. Usage: node scripts/loudness.mjs out/video.mp4 [--target -14] [--check]
// Two-pass ffmpeg loudnorm (measure, then apply linearly) to −14 LUFS integrated, −1.5 dBTP; the video stream
// is copied untouched and the file is replaced. --check only measures.
import { execFileSync, spawnSync } from "node:child_process";
import { renameSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { target: { type: "string", default: "-14" }, check: { type: "boolean", default: false } },
});
const [file] = positionals;
if (!file) throw new Error("usage: node scripts/loudness.mjs out/video.mp4 [--target -14] [--check]");
const I = Number(values.target), TP = -1.5, LRA = 11;

const measure = (f) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", f, "-af", `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const json = r.stderr.slice(r.stderr.lastIndexOf("{"), r.stderr.lastIndexOf("}") + 1);
  if (!json) throw new Error(`no loudness output for ${f}: ${r.stderr.slice(-400)}`);
  return JSON.parse(json);
};

const m = measure(file);
console.log(`${file}: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, LRA ${m.input_lra}`);
if (values.check) process.exit(0);
if (Math.abs(Number(m.input_i) - I) < 0.5 && Number(m.input_tp) <= TP) {
  console.log("already on target");
  process.exit(0);
}

const tmp = file.replace(/(\.\w+)$/, ".loudnorm$1");
const af = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-af", af, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", tmp]);
renameSync(tmp, file);
let after = measure(file);
console.log(`→ ${after.input_i} LUFS, true peak ${after.input_tp} dBTP`);
// Sharp transients (cannon, gunshots) can leave the true peak above TP after the linear gain: catch them with a
// fast look-ahead limiter 0.5 dB under TP (true peak overshoots sample peak slightly). Loudness barely moves.
if (Number(after.input_tp) > TP) {
  const lim = Math.pow(10, (TP - 0.5) / 20).toFixed(3);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-af", `alimiter=limit=${lim}:attack=1:release=50:level=false`, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", tmp]);
  renameSync(tmp, file);
  after = measure(file);
  console.log(`→ limited: ${after.input_i} LUFS, true peak ${after.input_tp} dBTP`);
}
// loudnorm stays linear only while the peak allows it; a mix with loud peaks can land short of the target.
if (Math.abs(Number(after.input_i) - I) > 1) console.warn("⚠ more than 1 LU off target: lower the loudest SFX/music peaks in the mix and render again");
