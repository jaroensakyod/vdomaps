// Subtitles for upload. Usage: node scripts/srt.mjs <slug> [--fps 30 --lead 12 --gap 8 --max 42]
// Uses the same beat layout as the scenes (src/components/subs.mjs) and the word timing from `npm run align`
// when timing.json has it. Writes out/<slug>.srt. Cues: one line ≤ --max chars, at least 0.8 s each.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { buildBeats, cues } from "../src/components/subs.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { fps: { type: "string" }, lead: { type: "string" }, gap: { type: "string" }, max: { type: "string", default: "42" } },
});
const [slug] = positionals;
if (!slug) throw new Error("usage: node scripts/srt.mjs <slug>");
const layout = Object.fromEntries(["fps", "lead", "gap"].filter((k) => values[k]).map((k) => [k, Number(values[k])]));
const fps = layout.fps ?? 30;

const dir = `src/episodes/${slug}`;
const beats = buildBeats(JSON.parse(readFileSync(`${dir}/timing.json`, "utf8")), JSON.parse(readFileSync(`${dir}/beats.json`, "utf8")), layout);

const list = [];
for (const b of beats) {
  const t0 = b.start / fps;
  const beatCues = cues({ text: b.text, spoken: b.spoken, words: b.words, sec: b.sec, maxChars: Number(values.max) });
  // Merge cues shorter than 0.8 s into the next one in the same beat.
  for (let i = 0; i < beatCues.length; i++) {
    const c = beatCues[i];
    if (c.end - c.start < 0.8 && i < beatCues.length - 1) {
      beatCues[i + 1] = { text: `${c.text} ${beatCues[i + 1].text}`, start: c.start, end: beatCues[i + 1].end };
      continue;
    }
    list.push({ text: c.text, start: t0 + c.start, end: t0 + c.end });
  }
}

const ts = (sec) => {
  const ms = Math.round(sec * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = list.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
mkdirSync("out", { recursive: true });
writeFileSync(`out/${slug}.srt`, srt);
console.log(`out/${slug}.srt  ${list.length} cues${beats.some((b) => b.words) ? "" : "  (no word timing — run `npm run align` for exact cues)"}`);
