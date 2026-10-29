// Voice drift check after TTS. Usage: node scripts/voice-pitch.mjs <slug> [--drop 0.1]
// Gemini TTS reading a long BATCH take drifts: later paragraphs come out deeper (29 Oct 2026, mumate01: 133 Hz at the
// start of a take, 103 Hz ten paragraphs later — viewers hear "a different voice" across a 1-minute stretch).
// Prints each beat's median pitch (autocorrelation on 16 kHz mono) and flags beats more than --drop (default 10 %)
// below the episode median, plus runs of 3+ low beats in a row. Re-make flagged beats one request each
// (remove them from timing.json, run tts without BATCH), check again, then align.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const slug = process.argv[2];
if (!slug) throw new Error("usage: node scripts/voice-pitch.mjs <slug> [--drop 0.1]");
const i = process.argv.indexOf("--drop");
const drop = i > 0 ? Number(process.argv[i + 1]) : 0.1;
const timing = JSON.parse(readFileSync(`src/episodes/${slug}/timing.json`, "utf8"));

const pitch = (file) => {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1e9 });
  const x = new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
  const N = 640;
  const f0 = [];
  for (let p = 0; p + N < x.length; p += 320) {
    let e = 0;
    for (let k = 0; k < N; k++) e += x[p + k] ** 2;
    if (e / N < 1e-4) continue; // silence
    let best = 0;
    let lag = 0;
    for (let L = 64; L <= 228; L++) { // 70–250 Hz
      let c = 0;
      for (let k = 0; k < N - L; k++) c += x[p + k] * x[p + k + L];
      if (c > best) (best = c), (lag = L);
    }
    if (best / e > 0.5) f0.push(16000 / lag); // voiced frames only
  }
  f0.sort((a, b) => a - b);
  return f0[f0.length >> 1] ?? 0;
};

const rows = timing.map((t) => ({ id: t.id, hz: pitch(`public/${t.file}`) }));
const median = [...rows].map((r) => r.hz).sort((a, b) => a - b)[rows.length >> 1];
const low = (r) => r.hz < median * (1 - drop);
for (const r of rows) console.log(r.id.padEnd(12), String(Math.round(r.hz)).padStart(4), "Hz", low(r) ? "⚠ low" : "");
const flagged = rows.filter(low).map((r) => r.id);
let run = [];
const runs = [];
for (const r of rows) {
  if (low(r)) run.push(r.id);
  else {
    if (run.length >= 3) runs.push(run);
    run = [];
  }
}
if (run.length >= 3) runs.push(run);
console.log(`median ${Math.round(median)} Hz · ${flagged.length} beat(s) more than ${Math.round(drop * 100)} % lower${flagged.length ? `: ${flagged.join(" ")}` : ""}`);
for (const r of runs) console.log(`⚠ ${r.length} low beats in a row (${r[0]} → ${r[r.length - 1]}) — viewers will hear a different voice there`);
