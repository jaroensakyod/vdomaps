// Voice-over per beat with Gemini TTS. Usage: GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]
// Reads src/episodes/<slug>/beats.json, writes public/audio/<slug>/<beat id>.wav and src/episodes/<slug>/timing.json.
// Character voices: a beat with "speaker" uses voices.json[speaker] (voices.json next to beats.json or one folder
// up, e.g. src/episodes/sankok/voices.json); "voice" on a beat names a Gemini voice directly. Others: the narrator
// (voices.json "narrator", else the [voice] argument). timing.json keeps each beat's text and voice, so a re-run only
// regenerates beats whose text, voice or speed changed (FORCE=1 regenerates all); reused beats keep their word timing.
// "speed" on a beat (e.g. 1.15 for an angry line, 0.92 for a heavy one) changes its tempo without changing pitch.
// Send plain text only: an English style instruction in the prompt gets read aloud. Write numbers as Thai words.
//
// BATCH=1: one request per voice (split every BATCH_CHARS characters) instead of one per beat (the TTS models allow only ~100 requests a day, ~10 a
// minute). All beats of a voice are read in one go, one paragraph each; Whisper (scripts/whisper-lib.mjs) finds
// where each paragraph starts and the file is cut in the silence between them (snapped to the quietest stretch). An episode of 11 beats with a
// narrator and 2 characters = 3 requests instead of 11. If Whisper cannot place the cuts cleanly (match < 75 % or
// paragraphs overlapping), that voice falls back to one request per beat.
//
// Daily cap: when a model says to wait hours, the script moves on to TTS_FALLBACK (default
// gemini-3.8-flash-lite-tts, same voices, own quota) and marks those beats with "model" in timing.json.
import "./env.mjs";
import { meter } from "./gemini-cost.mjs";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const [slug, defaultVoice = "Charon", firstModel = "gemini-3.8-flash-tts"] = process.argv.slice(2);
// Daily cap on one model → carry on with the next (each TTS model has its own quota). TTS_FALLBACK="" turns it off.
const models = [firstModel, ...(process.env.TTS_FALLBACK ?? "gemini-3.8-flash-lite-tts").split(",").filter((m) => m && m !== firstModel)];
let model = models[0];
const key = process.env.GEMINI_API_KEY;
if (!slug || !key) throw new Error("usage: GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]");
const epDir = `src/episodes/${slug}`;
const beats = JSON.parse(readFileSync(`${epDir}/beats.json`, "utf8"));
const voicesFile = [`${epDir}/voices.json`, `${epDir}/../voices.json`].find((f) => existsSync(f));
const voices = voicesFile ? JSON.parse(readFileSync(voicesFile, "utf8")) : {};
const before = existsSync(`${epDir}/timing.json`) ? JSON.parse(readFileSync(`${epDir}/timing.json`, "utf8")) : [];
const voiceFor = (b) => b.voice ?? (b.speaker ? voices[b.speaker] : undefined) ?? voices.narrator ?? defaultVoice;
const dir = `public/audio/${slug}`;
mkdirSync(dir, { recursive: true });
let requests = 0;
const cost = meter("tts", slug);

// One Gemini TTS request → 48 kHz WAV at `out` (untrimmed).
const speak = async (text, voice, out) => {
  // Rate-limited keys: on 429, wait the delay the API suggests (or 30 s) and retry — unless it is the daily cap.
  let json;
  for (let attempt = 1; ; attempt++) {
    // A dropped connection mid-response ("fetch failed", "other side closed") is retried too, after 15 s.
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
        }),
      });
      requests++;
      json = await res.json();
    } catch (err) {
      if (attempt >= 5) throw err;
      console.log(`  connection dropped (${err.cause?.code ?? err.message}), retrying in 15 s`);
      await new Promise((r) => setTimeout(r, 15000));
      continue;
    }
    if (json.error?.code !== 429 || attempt >= 8) break;
    const hint = JSON.stringify(json.error.details ?? []).match(/"retryDelay":"(\d+)s"/);
    const wait = (hint ? Number(hint[1]) : 30) + 2;
    if (wait > 300) {
      const next = models[models.indexOf(model) + 1];
      if (!next) throw new Error(`daily TTS quota used up on ${models.join(", ")} (the API asks to wait ${(wait / 3600).toFixed(1)} h) — try again later`);
      console.log(`  ⚠ daily quota used up on ${model} — switching to ${next}`);
      model = next;
      attempt = 0;
      continue;
    }
    console.log(`  rate limited, retrying in ${wait} s`);
    await new Promise((r) => setTimeout(r, wait * 1000));
  }
  if (json.usageMetadata) cost.add(model, json);
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`TTS failed: ${JSON.stringify(json).slice(0, 300)}`);
  const raw = `${out}.raw`;
  writeFileSync(raw, Buffer.from(part.inlineData.data, "base64"));
  // Raw PCM models return audio/l16 at 24 kHz.
  const input = part.inlineData.mimeType.includes("wav") ? ["-i", raw] : ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw];
  execFileSync("ffmpeg", ["-v", "error", "-y", ...input, "-ar", "48000", out]);
  rmSync(raw);
};

const duration = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// Trim leading/trailing silence (+ tempo change) into the beat's final file; `range` cuts a slice of a long take.
const finish = (src, beat, range) => {
  const file = `${dir}/${beat.id.replace(/[^\w-]/g, "_")}.wav`;
  const speed = beat.speed ?? 1;
  const cut = range ? ["-ss", range[0].toFixed(3), "-to", range[1].toFixed(3)] : [];
  execFileSync("ffmpeg", ["-v", "error", "-y", ...cut, "-i", src, "-af",
    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse" +
      (speed !== 1 ? `,atempo=${speed}` : ""),
    "-ar", "48000", file]);
  return { id: beat.id, file: file.replace("public/", ""), sec: duration(file), voice: voiceFor(beat), text: beat.text, ...(speed !== 1 ? { speed } : {}), ...(model !== models[0] ? { model } : {}) };
};

// Which beats need new audio.
const timing = new Map();
const todo = [];
for (const beat of beats) {
  const voice = voiceFor(beat);
  if (beat.speaker && !beat.voice && !voices[beat.speaker]) console.warn(`⚠ ${beat.id}: no voice for speaker "${beat.speaker}" in voices.json, using ${voice}`);
  const old = before.find((t) => t.id === beat.id);
  if (old && !old.draft && !process.env.FORCE && old.text === beat.text && old.voice === voice && (old.speed ?? 1) === (beat.speed ?? 1) && existsSync(`public/${old.file}`)) {
    timing.set(beat.id, old);
    console.log(beat.id.padEnd(10), old.sec.toFixed(2), voice, "(unchanged)");
  } else todo.push(beat);
}

// Writes timing.json with every beat made so far (in script order).
const save = () => {
  const done = beats.map((b) => timing.get(b.id)).filter(Boolean);
  writeFileSync(`${epDir}/timing.json`, JSON.stringify(done, null, 2));
  return done;
};

const perBeat = async (list) => {
  for (const beat of list) {
    const take = `${dir}/_take-${beat.id}.wav`;
    await speak(beat.text, voiceFor(beat), take);
    const t = finish(take, beat);
    rmSync(take);
    timing.set(beat.id, t);
    console.log(beat.id.padEnd(10), t.sec.toFixed(2), t.voice);
  }
};

if (!process.env.BATCH) await perBeat(todo);
else {
  const { bare, charTimes, silences, snapToSilence, whisper } = await import("./whisper-lib.mjs");
  const groups = new Map();
  for (const b of todo) groups.set(voiceFor(b), [...(groups.get(voiceFor(b)) ?? []), b]);
  // Long episodes: at most BATCH_CHARS characters per request (default 1000, about 1.5 min of Thai), so a take stays
  // well inside the output limit of the model and one bad take costs little.
  const max = Number(process.env.BATCH_CHARS ?? 1000);
  const chunks = [];
  for (const [voice, all] of groups) {
    let cur = [];
    for (const b of all) {
      if (cur.length && [...cur, b].reduce((a, x) => a + x.text.length, 0) > max) chunks.push([voice, cur]), (cur = []);
      cur.push(b);
    }
    chunks.push([voice, cur]);
  }
  for (const [voice, list] of chunks) {
    if (list.length === 1) {
      await perBeat(list);
      continue;
    }
    const take = `${dir}/_take-${voice}.wav`;
    await speak(list.map((b) => b.text).join("\n\n"), voice, take);
    const total = duration(take);
    const wav16 = `${take}.16k.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", take, "-ar", "16000", "-ac", "1", wav16]);
    const json = (await whisper([wav16])).get(wav16);
    const chars = list.map((b) => [...bare(b.text)]);
    const { times, score } = charTimes(chars.flat(), json, total);
    // Beat k spans its first char's start to its last char's end; cut halfway through the gap to the next one.
    let pos = 0;
    const spans = chars.map((c) => {
      const span = [times[pos].s, times[pos + c.length - 1].e];
      pos += c.length;
      return span;
    });
    const overlap = spans.some((sp, k) => k && sp[0] < spans[k - 1][1] - 0.05);
    console.log(`${voice}: ${list.length} beats in 1 request, ${total.toFixed(1)} s, match ${(score * 100).toFixed(0)}%${overlap ? ", paragraphs overlap" : ""}`);
    if (score < 0.75 || overlap) {
      console.log(`  ⚠ cannot cut ${voice} cleanly — one request per beat instead`);
      rmSync(take), rmSync(wav16, { force: true }), rmSync(`${wav16}.json`, { force: true });
      await perBeat(list);
      continue;
    }
    // Whisper runs a little late, so each cut moves into the nearest real silence of the take — unless that silence
    // lies outside the gap between the two paragraphs (two cuts landing on one silence leave a beat empty).
    const quiet = silences(take);
    const cuts = spans.slice(1).map((sp, k) => {
      const mid = (spans[k][1] + sp[0]) / 2;
      const snapped = snapToSilence(mid, quiet);
      return snapped > spans[k][0] + 0.2 && snapped < sp[1] - 0.2 ? snapped : mid;
    });
    list.forEach((beat, k) => {
      const from = k ? cuts[k - 1] : 0;
      const to = k < list.length - 1 ? cuts[k] : total;
      const t = finish(take, beat, [from, to]);
      timing.set(beat.id, t);
      console.log(beat.id.padEnd(10), t.sec.toFixed(2), voice, `(${from.toFixed(2)}–${to.toFixed(2)} s of the take)`);
    });
    rmSync(take), rmSync(wav16, { force: true }), rmSync(`${wav16}.json`, { force: true });
    save(); // a crash in a later chunk keeps the beats made so far (a re-run reuses them)
  }
}

const out = save();
console.log("total", out.reduce((a, b) => a + b.sec, 0).toFixed(1), "s ·", requests, "TTS requests");
const other = out.filter((t) => t.model);
if (other.length) console.log(`⚠ ${other.length} beat(s) made on a fallback model (${[...new Set(other.map((t) => t.model))].join(", ")}): ${other.map((t) => t.id).join(", ")} — listen for a change in the voice`);
