// Word timing for every VO beat with whisper.cpp (local, free). Usage: node scripts/align.mjs <slug>
// Reads src/episodes/<slug>/beats.json + timing.json, adds `words: [{w, s, e}]` (seconds from the beat's audio
// start) to each timing entry that has none yet (FORCE=1 redoes all), and prints how well the VO matches the script.
// Env: WHISPER_MODEL (default large-v3; Thai needs large-v3 or at least medium), WHISPER_VERSION (default 1.5.5,
// the build Remotion ships for Windows), WHISPER_LANG (default th), WHISPER_DIR (model folder, default ./whisper.cpp —
// point several projects at one shared folder so the model is downloaded once).
// GPU: if whisper-cuda/build/bin/whisper-cli(.exe) exists (or WHISPER_BIN points at a whisper-cli), all pending beats
// go through it in ONE call, so the model loads once. Official CUDA builds: github.com/ggml-org/whisper.cpp
// releases, e.g. whisper-bin-win-cuda-11.8.0-x64.zip with its Release/ folder moved to whisper-cuda/build/bin/.
// Measured on an RTX 2060: one 10 s beat in 7 s (3 s of it loading the model) vs ~25 s on the CPU build.
// No NVIDIA GPU: point WHISPER_BIN at the official BLAS build (whisper-blas-bin-x64.zip) — still one call, all threads.
// The script text is kept; Whisper only lends its timing. Thai tokens are sub-word (and sometimes split
// mid-character), so script and transcript are aligned character by character with an edit-distance path.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { bare, charTimes, language, whisper } from "./whisper-lib.mjs";

const [slug] = process.argv.slice(2);
if (!slug) throw new Error("usage: node scripts/align.mjs <slug>");
const dir = `src/episodes/${slug}`;
const beats = JSON.parse(readFileSync(`${dir}/beats.json`, "utf8"));
const timingFile = `${dir}/timing.json`;
const timing = JSON.parse(readFileSync(timingFile, "utf8"));

const segmenter = new Intl.Segmenter(language, { granularity: "word" });
const words = (text) => {
  const out = [];
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (!bare(segment)) continue;
    if (!isWordLike && out.length) out[out.length - 1] += segment; // punctuation sticks to the word before it
    else out.push(segment);
  }
  return out;
};

const tmp = path.join(tmpdir(), `align-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const todo = timing
  .map((t, i) => ({ t, i, wav16: path.join(tmp, `${i}.wav`) }))
  .filter(({ t }) => {
    const keep = t.words?.length && !process.env.FORCE;
    if (keep) console.log(`${t.id.padEnd(12)} kept (already aligned; FORCE=1 to redo)`);
    return !keep;
  });
for (const { t, wav16 } of todo) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `public/${t.file}`, "-ar", "16000", "-ac", "1", wav16]);

const results = await whisper(todo.map(({ wav16 }) => wav16));

for (const { t, i, wav16 } of todo) {
  const spoken = (beats.find((b) => b.id === t.id) ?? beats[i]).text;
  const { times, score, heard } = charTimes([...bare(spoken)], results.get(wav16), t.sec);
  let pos = 0, last = 0;
  t.words = words(spoken).map((w) => {
    const n = [...bare(w)].length;
    const s = Math.max(last, times[pos].s);
    const e = Math.max(s, times[pos + n - 1].e);
    pos += n;
    last = e;
    return { w, s: +s.toFixed(3), e: +Math.min(e, t.sec).toFixed(3) };
  });
  console.log(`${t.id.padEnd(12)} match ${(score * 100).toFixed(0).padStart(3)}%  ${t.words.length} words`);
  if (score < 0.7) console.log(`  ⚠ VO may not match the script — heard: ${heard}`);
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(timingFile, JSON.stringify(timing, null, 2));
console.log(`wrote ${timingFile}`);
