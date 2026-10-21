// Snap Whisper word starts to real speech onsets. Usage: node scripts/snap-words.mjs <slug> [--db -30]
// Whisper often puts the first word after a pause 0.3–0.5 s early (inside the silence), so captions and word-cued
// visuals fire before the voice. For every pause in each beat's VO (ffmpeg silencedetect), a word that starts inside
// it moves to the pause end, and the word before it ends at the pause start. Rewrites timing.json in place.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { db: { type: "string", default: "-30" } } });
const [slug] = positionals;
if (!slug) throw new Error("usage: node scripts/snap-words.mjs <slug>");
const file = `src/episodes/${slug}/timing.json`;
const timing = JSON.parse(readFileSync(file, "utf8"));
let moved = 0;
for (const t of timing) {
  if (!t.words?.length) continue;
  // silencedetect reports on stderr
  const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", `public/${t.file}`, "-af", `silencedetect=n=${values.db}dB:d=0.1`, "-f", "null", "-"], { encoding: "utf8" });
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const gaps = starts.map((s, i) => [s, ends[i] ?? t.sec]);
  t.words.forEach((w, i) => {
    if (i === 0) return;
    const g = gaps.find(([a, b]) => w.s >= a - 0.12 && w.s < b - 0.02);
    if (!g) return;
    if (g[1] - w.s > 0.05) moved++;
    w.s = +g[1].toFixed(3);
    if (w.e < w.s) w.e = w.s;
    const prev = t.words[i - 1];
    if (prev.e > g[0]) prev.e = +Math.max(prev.s, g[0]).toFixed(3);
  });
}
writeFileSync(file, JSON.stringify(timing, null, 2));
console.log(`${moved} word starts moved to the end of a pause`);
