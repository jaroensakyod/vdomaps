// Joins the per-beat VO (public/audio/lawnchair/bNN.wav) into one voice.wav at TEMPO, with GAP seconds between beats
// (longer before story turns), and writes words.json: [{w, s, e, beat}] in seconds from the start of voice.wav.
// Usage (from the project root): node src/episodes/lawnchair/build-voice.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const TEMPO = 1.15, LEAD = 0.25, TAIL = 1.2;
const GAP = { b02: 0.3, b06: 0.35, b10: 0.4, b11: 0.25, b12: 0.45, b14: 0.4, b15: 0.45 };
const dir = "src/episodes/lawnchair", out = "public/lawnchair";
mkdirSync(`${out}/beats`, { recursive: true });
const timing = JSON.parse(readFileSync(`${dir}/timing.json`, "utf8"));
const words = [], parts = [];
let t = LEAD;
for (const b of timing) {
  t += GAP[b.id] ?? (b === timing[0] ? 0 : 0.12);
  const f = `${out}/beats/${b.id}.wav`;
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", `public/${b.file}`, "-af", `atempo=${TEMPO}`, "-ar", "48000", "-ac", "1", f]);
  const dur = b.sec / TEMPO;
  parts.push({ f, at: t });
  for (const w of b.words ?? []) words.push({ w: w.w, s: +(t + w.s / TEMPO).toFixed(3), e: +(t + w.e / TEMPO).toFixed(3), beat: b.id });
  t += dur;
}
const total = t + TAIL;
const inputs = parts.flatMap((p) => ["-i", p.f]);
const delays = parts.map((p, i) => `[${i}]adelay=${Math.round(p.at * 1000)}:all=1[a${i}]`).join(";");
const mix = parts.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${parts.length}:normalize=0,apad,atrim=0:${total.toFixed(3)}`;
execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex", `${delays};${mix}`, "-ar", "48000", "-ac", "1", `${out}/voice.wav`]);
writeFileSync(`${dir}/words.json`, JSON.stringify(words, null, 0).replace(/},{/g, "},\n{"));
console.log(`voice.wav ${total.toFixed(2)} s = ${Math.ceil(total * 30)} frames, ${words.length} words`);
for (const p of parts) console.log(p.f.split("/").pop(), (p.at).toFixed(2), Math.round(p.at * 30));
