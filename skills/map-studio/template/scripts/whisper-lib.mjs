// Shared Whisper helpers for align.mjs and tts-gemini.mjs (batch split): run whisper.cpp on 16 kHz WAVs and line
// the transcript up with the script character by character. See align.mjs for the env variables.
import "./env.mjs";
import { downloadWhisperModel, installWhisperCpp, transcribe } from "@remotion/install-whisper-cpp";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";

export const model = process.env.WHISPER_MODEL ?? "large-v3";
const version = process.env.WHISPER_VERSION ?? "1.5.5";
export const language = process.env.WHISPER_LANG ?? "th";
const whisperPath = process.env.WHISPER_DIR ?? "whisper.cpp";
const gpuBin = process.env.WHISPER_BIN ?? ["whisper-cuda/build/bin/whisper-cli.exe", "whisper-cuda/build/bin/whisper-cli"].find((p) => existsSync(p));

export const bare = (s) => s.replace(/\s+/g, "");
const norm = (c) => c.toLowerCase();

// Transcribe 16 kHz mono WAVs; returns whisper JSON per file. GPU build: one call for all files (model loads once).
// -nfa: flash attention would switch DTW token timestamps off.
export const whisper = async (wavs) => {
  if (!gpuBin) await installWhisperCpp({ to: whisperPath, version, printOutput: false });
  await downloadWhisperModel({ model, folder: whisperPath, printOutput: true });
  console.log(gpuBin ? `whisper: prebuilt ${gpuBin}` : `whisper: Remotion CPU build ${version}`);
  const out = new Map();
  if (!wavs.length) return out;
  if (gpuBin) {
    const files = wavs.flatMap((w) => ["-f", w]);
    execFileSync(gpuBin, ["-m", path.join(whisperPath, `ggml-${model}.bin`), "-t", String(availableParallelism()), "-l", language, "-dtw", model.replace(/-/g, "."), "-nfa", "-ojf", "-np", ...files], { stdio: ["ignore", "ignore", "pipe"] }); // its log only shows if it fails
    for (const w of wavs) out.set(w, JSON.parse(readFileSync(`${w}.json`, "utf8")));
  } else for (const w of wavs) out.set(w, await transcribe({ inputPath: w, whisperPath, whisperCppVersion: version, model, tokenLevelTimestamps: true, language, printOutput: false }));
  return out;
};

// Edit-distance alignment: for each script char, the index of the transcript char it lines up with (or -1).
export const alignChars = (a, b) => {
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
export const transcriptChars = (json) => {
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

// Seconds for every script char: matched chars take the transcript time, the rest are spread between neighbours.
export const charTimes = (scriptChars, json, total) => {
  const hyp = transcriptChars(json);
  const { map, score } = alignChars(scriptChars, hyp.map((h) => h.c));
  const times = map.map((j) => (j >= 0 ? { s: hyp[j].s, e: hyp[j].e } : null));
  for (let k = 0; k < times.length; k++) {
    if (times[k]) continue;
    let p = k - 1, q = k + 1;
    while (q < times.length && !times[q]) q++;
    const from = p >= 0 ? times[p].e : 0, to = q < times.length ? times[q].s : total;
    const span = q - p - 1;
    for (let r = k; r < q; r++) times[r] = { s: from + ((to - from) * (r - k)) / span, e: from + ((to - from) * (r - k + 1)) / span };
    k = q - 1;
  }
  return { times, score, heard: hyp.map((h) => h.c).join("") };
};

// Silent stretches of an audio file ([start, end] seconds), from ffmpeg silencedetect.
export const silences = (file, noise = "-40dB", min = 0.12) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", `silencedetect=noise=${noise}:d=${min}`, "-f", "null", "-"], { encoding: "utf8" });
  return [...r.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
};

// Move a cut estimated from Whisper (which tends to run a few tens of ms late) into the middle of the nearest
// silence within `reach` seconds; keeps the estimate when there is none.
export const snapToSilence = (cut, quiet, reach = 0.6) => {
  let best = null;
  for (const [a, b] of quiet) {
    const d = cut < a ? a - cut : cut > b ? cut - b : 0;
    if (d <= reach && (!best || d < best.d)) best = { d, at: (a + b) / 2 };
  }
  return best ? best.at : cut;
};
