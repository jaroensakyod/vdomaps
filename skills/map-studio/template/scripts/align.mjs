// Word timing for every VO beat with whisper.cpp (local, free). Usage: node scripts/align.mjs <slug>
// Reads src/episodes/<slug>/beats.json + timing.json, adds `words: [{w, s, e}]` (seconds from the beat's audio
// start) to each timing entry, and prints how well the VO matches the script.
// Env: WHISPER_MODEL (default large-v3; Thai needs large-v3 or at least medium), WHISPER_VERSION (default 1.5.5,
// the build Remotion ships for Windows), WHISPER_LANG (default th).
// The script text is kept; Whisper only lends its timing. Thai tokens are sub-word (and sometimes split
// mid-character), so script and transcript are aligned character by character with an edit-distance path.
import { downloadWhisperModel, installWhisperCpp, transcribe } from "@remotion/install-whisper-cpp";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [slug] = process.argv.slice(2);
if (!slug) throw new Error("usage: node scripts/align.mjs <slug>");
const model = process.env.WHISPER_MODEL ?? "large-v3";
const version = process.env.WHISPER_VERSION ?? "1.5.5";
const language = process.env.WHISPER_LANG ?? "th";
const whisperPath = "whisper.cpp";

const dir = `src/episodes/${slug}`;
const beats = JSON.parse(readFileSync(`${dir}/beats.json`, "utf8"));
const timingFile = `${dir}/timing.json`;
const timing = JSON.parse(readFileSync(timingFile, "utf8"));

await installWhisperCpp({ to: whisperPath, version, printOutput: false });
await downloadWhisperModel({ model, folder: whisperPath, printOutput: true });

const bare = (s) => s.replace(/\s+/g, "");
const norm = (c) => c.toLowerCase();

// Edit-distance alignment: for each script char, the index of the transcript char it lines up with (or -1).
const alignChars = (a, b) => {
  const n = a.length, m = b.length;
  const d = Array.from({ length: n + 1 }, (_, i) => Int32Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      d[i][j] = Math.min(d[i - 1][j - 1] + (norm(a[i - 1]) === norm(b[j - 1]) ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);
  const map = new Array(n).fill(-1);
  let matches = 0;
  for (let i = n, j = m; i > 0 && j > 0; ) {
    const same = norm(a[i - 1]) === norm(b[j - 1]);
    if (d[i][j] === d[i - 1][j - 1] + (same ? 0 : 1)) {
      map[i - 1] = j - 1;
      if (same) matches++;
      i--, j--;
    } else if (d[i][j] === d[i - 1][j] + 1) i--;
    else j--;
  }
  return { map, score: n ? matches / n : 1 };
};

// Transcript as characters, each with [s, e] seconds spread evenly across its token.
const transcriptChars = (json) => {
  const out = [];
  for (const item of json.transcription)
    for (const t of item.tokens ?? []) {
      if (t.text.startsWith("[_")) continue;
      const chars = [...bare(t.text)];
      const s = t.offsets.from / 1000, e = t.offsets.to / 1000;
      chars.forEach((c, k) => out.push({ c, s: s + ((e - s) * k) / chars.length, e: s + ((e - s) * (k + 1)) / chars.length }));
    }
  return out;
};

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
for (const [i, t] of timing.entries()) {
  const spoken = (beats.find((b) => b.id === t.id) ?? beats[i]).text;
  const wav16 = path.join(tmp, `${i}.wav`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `public/${t.file}`, "-ar", "16000", "-ac", "1", wav16]);
  const json = await transcribe({ inputPath: wav16, whisperPath, whisperCppVersion: version, model, tokenLevelTimestamps: true, language, printOutput: false });
  const hyp = transcriptChars(json);
  const script = [...bare(spoken)];
  const { map, score } = alignChars(script, hyp.map((h) => h.c));

  // Unmatched script chars get times interpolated between their matched neighbours.
  const times = map.map((j) => (j >= 0 ? { s: hyp[j].s, e: hyp[j].e } : null));
  for (let k = 0; k < times.length; k++) {
    if (times[k]) continue;
    let p = k - 1, q = k + 1;
    while (q < times.length && !times[q]) q++;
    const from = p >= 0 ? times[p].e : 0, to = q < times.length ? times[q].s : t.sec;
    const span = q - p - 1;
    for (let r = k; r < q; r++) times[r] = { s: from + ((to - from) * (r - k)) / span, e: from + ((to - from) * (r - k + 1)) / span };
    k = q - 1;
  }

  let pos = 0, last = 0;
  t.words = words(spoken).map((w) => {
    const n = [...bare(w)].length;
    const s = Math.max(last, times[pos].s);
    const e = Math.max(s, times[pos + n - 1].e);
    pos += n;
    last = e;
    return { w, s: +s.toFixed(3), e: +Math.min(e, t.sec).toFixed(3) };
  });
  const heard = hyp.map((h) => h.c).join("");
  console.log(`${t.id.padEnd(12)} match ${(score * 100).toFixed(0).padStart(3)}%  ${t.words.length} words`);
  if (score < 0.7) console.log(`  ⚠ VO may not match the script — heard: ${heard}`);
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(timingFile, JSON.stringify(timing, null, 2));
console.log(`wrote ${timingFile}`);
