// House SFX library: download every sound in sfx/library.json and process it into public/sfx/lib/<id>.mp3.
// Usage: node scripts/sfx-lib.mjs [id ...]   (FORCE=1 re-processes)
// The mp3s are git-ignored — Mixkit/Pixabay licences allow use in videos but not redistributing the files.
// Processing: optional cut (start/len, or the loudest `loudest`-second window), leading-silence trim for shots,
// short fades (beds get 0.4 s so they loop), loudness: shots −16 LUFS, beds −20 LUFS (then mix by volume).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const lib = JSON.parse(readFileSync("sfx/library.json", "utf8"));
const only = process.argv.slice(2);
const out = "public/sfx/lib";
const raw = `${out}/.raw`;
mkdirSync(raw, { recursive: true });

const urlOf = (it) => it.url ?? `https://assets.mixkit.co/active_storage/sfx/${it.mixkit}/${it.mixkit}-preview.mp3`;
const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "pipe", "pipe"] });
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();

// Start of the loudest `len`-second window (momentary loudness from ebur128, 0.1 s steps).
const loudestStart = (f, len) => {
  const err = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 << 20 }).stderr;
  const pts = [...err.matchAll(/t:\s*([\d.]+)\s+TARGET.*?M:\s*(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  let best = 0;
  let bestV = -1e9;
  const n = Math.round(len * 10);
  for (let i = 0; i + n < pts.length; i += 5) {
    const v = pts.slice(i, i + n).reduce((a, [, m]) => a + Math.max(m, -70), 0) / n;
    if (v > bestV) (bestV = v), (best = pts[i][0]);
  }
  return best;
};

// Timing of a processed file, for syncing with pictures: loudness envelope at 30 fps (dB, one value per video
// frame), `hit` = the frame where the main transient starts (first frame within 6 dB of the peak, after a rise),
// `peak` = loudest frame. Sounds are placed so their `hit` lands on the picture's event frame.
const timingOf = (f) => {
  const pcm = spawnSync("ffmpeg", ["-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], { maxBuffer: 256 << 20 }).stdout;
  const x = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 4));
  const env = [];
  for (let i = 0; i < x.length; i += 1600) {
    let s = 0;
    const n = Math.min(1600, x.length - i);
    for (let j = 0; j < n; j++) s += x[i + j] * x[i + j];
    env.push(Math.max(-60, Math.round(10 * Math.log10(s / n + 1e-12))));
  }
  const max = Math.max(...env);
  const peak = env.indexOf(max);
  let hit = peak;
  while (hit > 0 && env[hit - 1] >= max - 6) hit--;
  return { env, hit, peak };
};

const index = [];
for (const it of lib.items) {
  const dst = `${out}/${it.id}.mp3`;
  if (only.length && !only.includes(it.id)) continue;
  const src = `${raw}/${it.id}.mp3`;
  if (!existsSync(src)) {
    const res = await fetch(urlOf(it), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.log(`${it.id.padEnd(20)} ✗ HTTP ${res.status}`);
      continue;
    }
    writeFileSync(src, Buffer.from(await res.arrayBuffer()));
  }
  if (!existsSync(dst) || process.env.FORCE) {
    const total = dur(src);
    const len = it.len ?? it.loudest ?? (it.kind === "bed" ? 30 : 12);
    const start = it.start ?? (it.loudest ? loudestStart(src, it.loudest) : 0);
    const cut = Math.min(len, total - start);
    const fade = it.kind === "bed" ? 0.4 : 0.05;
    const filters = [
      ...(it.kind === "shot" && it.start === undefined ? ["silenceremove=start_periods=1:start_threshold=-45dB"] : []),
      `afade=t=in:d=${fade}`,
      `afade=t=out:st=${Math.max(0, cut - (it.kind === "bed" ? 0.4 : 0.15))}:d=${it.kind === "bed" ? 0.4 : 0.15}`,
      `loudnorm=I=${it.kind === "bed" ? -20 : -16}:TP=-1.5:LRA=11`,
    ];
    ff(["-ss", String(start), "-t", String(cut), "-i", src, "-af", filters.join(","), "-ar", "48000", "-ac", "2", "-b:a", "192k", dst]);
  }
  const d = dur(dst);
  const { env, hit, peak } = timingOf(dst);
  index.push({ id: it.id, cat: it.cat, kind: it.kind, align: it.align ?? "hit", frames: env.length, hit, peak, env });
  console.log(`${it.id.padEnd(20)} ${it.kind.padEnd(4)} ${d.toFixed(1).padStart(5)} s  hit f${String(hit).padEnd(4)} peak f${String(peak).padEnd(4)} ${it.title}`);
}
// Timing table for the components (numbers only, safe to commit): src/components/sfx-index.json.
if (!only.length) writeFileSync("src/components/sfx-index.json", JSON.stringify(Object.fromEntries(index.map(({ id, ...r }) => [id, r]))));
