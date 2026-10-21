// Draft timing before the voice-over exists. Usage: node scripts/timing-draft.mjs <slug> [--cps 11.5]
// Writes src/episodes/<slug>/timing.json with each beat's length estimated from its text (Thai TTS reads about
// 11.5 characters a second; `speed` on a beat is honoured), word timing spread evenly (Intl.Segmenter words), and a
// silent WAV per beat so the episode renders. Every entry is marked `"draft": true`: tts-gemini.mjs always
// regenerates draft beats, and scenes cued with timeline().at()/word() move to the real timing by themselves.
// Existing non-draft entries (real VO) are kept.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({ allowPositionals: true, options: { cps: { type: "string", default: "11.5" } } });
const [slug] = positionals;
if (!slug) throw new Error("usage: node scripts/timing-draft.mjs <slug> [--cps 11.5]");
const cps = Number(values.cps);
const epDir = `src/episodes/${slug}`;
const beats = JSON.parse(readFileSync(`${epDir}/beats.json`, "utf8"));
const before = existsSync(`${epDir}/timing.json`) ? JSON.parse(readFileSync(`${epDir}/timing.json`, "utf8")) : [];
const dir = `public/audio/${slug}`;
mkdirSync(dir, { recursive: true });
const segmenter = new Intl.Segmenter("th", { granularity: "word" });
const bare = (s) => s.replace(/\s+/g, "");

const timing = beats.map((beat) => {
  const old = before.find((t) => t.id === beat.id);
  if (old && !old.draft && old.text === beat.text) return old;
  const words = [];
  for (const { segment, isWordLike } of segmenter.segment(beat.text)) {
    if (!bare(segment)) continue;
    if (!isWordLike && words.length) words[words.length - 1] += segment;
    else words.push(segment);
  }
  const chars = words.reduce((a, w) => a + bare(w).length, 0);
  const sec = +(chars / cps / (beat.speed ?? 1) + 0.25).toFixed(3);
  let t = 0;
  const per = sec / Math.max(1, chars);
  const w = words.map((x) => {
    const s = t;
    t += bare(x).length * per;
    return { w: x, s: +s.toFixed(3), e: +t.toFixed(3) };
  });
  const file = `${dir}/${beat.id.replace(/[^\w-]/g, "_")}.wav`;
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", String(sec), file]);
  return { id: beat.id, file: file.replace("public/", ""), sec, text: beat.text, draft: true, words: w };
});
writeFileSync(`${epDir}/timing.json`, JSON.stringify(timing, null, 2));
const drafts = timing.filter((t) => t.draft).length;
console.log(`${slug}: ${timing.length} beats, ${drafts} draft, ~${timing.reduce((a, b) => a + b.sec, 0).toFixed(1)} s of VO`);
