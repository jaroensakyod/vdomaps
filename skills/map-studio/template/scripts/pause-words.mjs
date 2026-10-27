// Word timing without Whisper (fallback when the CPU is too slow for align.mjs). Usage: node scripts/pause-words.mjs <slug>
// For each beat, ffmpeg silencedetect finds the speech stretches; the script's space-separated phrases are spread over
// the speech time only (silences skipped), in proportion to their length. When the number of stretches equals the
// number of phrases, each phrase gets its own stretch. Writes `words: [{w, s, e}]` (seconds) into timing.json and
// marks them `timed: "pauses"` so a later align.mjs run (FORCE=1) can replace them with Whisper timing.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const slug = process.argv[2];
if (!slug) throw new Error("usage: node scripts/pause-words.mjs <slug>");
const file = `src/episodes/${slug}/timing.json`;
const timing = JSON.parse(readFileSync(file, "utf8"));
const beats = JSON.parse(readFileSync(`src/episodes/${slug}/beats.json`, "utf8"));

const speech = (wav, dur) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" });
  const quiet = [];
  let open = null;
  for (const line of r.stderr.split("\n")) {
    const a = line.match(/silence_start: ([\d.]+)/);
    const b = line.match(/silence_end: ([\d.]+)/);
    if (a) open = Number(a[1]);
    if (b && open !== null) quiet.push([open, Number(b[1])]), (open = null);
  }
  if (open !== null) quiet.push([open, dur]);
  const out = [];
  let t = 0;
  for (const [a, b] of quiet) {
    if (a - t > 0.05) out.push([t, a]);
    t = b;
  }
  if (dur - t > 0.05) out.push([t, dur]);
  return out.length ? out : [[0, dur]];
};

for (const t of timing) {
  const beat = beats.find((b) => b.id === t.id);
  const tokens = beat.text.split(" ").filter(Boolean);
  const segs = speech(`public/${t.file}`, t.sec);
  let words;
  if (segs.length === tokens.length) {
    words = tokens.map((w, i) => ({ w, s: segs[i][0], e: segs[i][1] }));
  } else {
    // Map a character position (0..total) onto the speech time, skipping the silences.
    const talk = segs.reduce((a, [s, e]) => a + e - s, 0);
    const total = tokens.reduce((a, w) => a + w.length, 0);
    const at = (pos) => {
      let left = (pos / total) * talk;
      for (const [s, e] of segs) {
        if (left <= e - s) return s + left;
        left -= e - s;
      }
      return segs[segs.length - 1][1];
    };
    let pos = 0;
    words = tokens.map((w) => {
      const s = at(pos);
      pos += w.length;
      return { w, s: Math.round(s * 1000) / 1000, e: Math.round(at(pos) * 1000) / 1000 };
    });
  }
  t.words = words;
  t.timed = "pauses";
  console.log(t.id.padEnd(10), `${segs.length} stretches / ${tokens.length} phrases`);
}
writeFileSync(file, JSON.stringify(timing, null, 1));
console.log(`wrote ${file}`);
