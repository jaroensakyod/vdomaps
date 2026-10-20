// Join a series for the long YouTube cut. Usage: node scripts/series.mjs <series> [--suffix -yt] [--tail 12]
// Scans src/episodes/<series>/ep*/ (timing.json + meta.json) and writes, under out/<series>/:
//   youtube-chapters.txt  "0:00 ตอนที่ 1 · <title>" per episode (paste into the YouTube description)
//   concat.txt            ffmpeg concat list of the episode files out/<series>/epNN<suffix>.mp4
// Durations come from the rendered files (ffprobe) when they exist, else from the beat layout + --tail frames
// (the "yt" variant's tail in the series kit). Join with the printed ffmpeg command.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { buildBeats, LAYOUT } from "../src/components/subs.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { suffix: { type: "string", default: "-yt" }, tail: { type: "string", default: "12" } },
});
const [series] = positionals;
if (!series) throw new Error("usage: node scripts/series.mjs <series>");
const src = `src/episodes/${series}`;
const out = `out/${series}`;
mkdirSync(out, { recursive: true });

const eps = readdirSync(src)
  .filter((d) => /^ep\d+$/.test(d) && existsSync(`${src}/${d}/timing.json`))
  .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
if (!eps.length) throw new Error(`no episodes with timing.json under ${src}`);

const clock = (sec) => {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
};

let t = 0;
const chapters = [];
const list = [];
const missing = [];
for (const ep of eps) {
  const n = Number(ep.slice(2));
  const meta = existsSync(`${src}/${ep}/meta.json`) ? JSON.parse(readFileSync(`${src}/${ep}/meta.json`, "utf8")) : {};
  const file = `${out}/${ep}${values.suffix}.mp4`;
  let sec;
  if (existsSync(file)) sec = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  else {
    const beats = buildBeats(JSON.parse(readFileSync(`${src}/${ep}/timing.json`, "utf8")));
    sec = (beats[beats.length - 1].end + Number(values.tail)) / LAYOUT.fps;
    missing.push(ep);
  }
  chapters.push(`${clock(t)} ตอนที่ ${n} · ${meta.chapter ?? meta.title ?? ep}`);
  list.push(`file '${ep}${values.suffix}.mp4'`);
  t += sec;
}

writeFileSync(`${out}/youtube-chapters.txt`, chapters.join("\n") + "\n");
writeFileSync(`${out}/concat.txt`, list.join("\n") + "\n");
console.log(`${eps.length} episodes · ${clock(t)} total → ${out}/youtube-chapters.txt, ${out}/concat.txt`);
if (missing.length) console.log(`(not rendered yet, estimated: ${missing.join(" ")})`);
console.log(`join: ffmpeg -f concat -safe 0 -i ${out}/concat.txt -c copy ${out}/${series}-full.mp4`);
