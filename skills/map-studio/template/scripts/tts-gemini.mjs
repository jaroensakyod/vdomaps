// Voice-over per beat with Gemini TTS. Usage: GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]
// Reads src/episodes/<slug>/beats.json, writes public/audio/<slug>/<beat id>.wav and src/episodes/<slug>/timing.json.
// Character voices: a beat with "speaker" uses voices.json[speaker] (voices.json next to beats.json or one folder
// up, e.g. src/episodes/sankok/voices.json); "voice" on a beat names a Gemini voice directly. Others: the narrator
// (voices.json "narrator", else the [voice] argument). timing.json keeps each beat's text and voice, so a re-run only
// regenerates beats whose text, voice or speed changed (FORCE=1 regenerates all); reused beats keep their word timing.
// "speed" on a beat (e.g. 1.15 for an angry line, 0.92 for a heavy one) changes its tempo without changing pitch.
// Send plain text only: an English style instruction in the prompt gets read aloud. Write numbers as Thai words.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const [slug, defaultVoice = "Charon", model = "gemini-3.8-flash-tts"] = process.argv.slice(2);
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

const timing = [];
for (const beat of beats) {
  const voice = voiceFor(beat);
  if (beat.speaker && !beat.voice && !voices[beat.speaker]) console.warn(`⚠ ${beat.id}: no voice for speaker "${beat.speaker}" in voices.json, using ${voice}`);
  const old = before.find((t) => t.id === beat.id);
  const speed = beat.speed ?? 1;
  if (old && !process.env.FORCE && old.text === beat.text && old.voice === voice && (old.speed ?? 1) === speed && existsSync(`public/${old.file}`)) {
    timing.push(old);
    console.log(beat.id.padEnd(10), old.sec.toFixed(2), voice, "(unchanged)");
    continue;
  }
  const file = `${dir}/${beat.id.replace(/[^\w-]/g, "_")}.wav`;
  {
    // Free-tier keys are rate-limited per minute: on 429, wait the delay the API suggests (or 30 s) and retry.
    let json;
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: beat.text }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
        }),
      });
      json = await res.json();
      if (json.error?.code !== 429 || attempt >= 8) break;
      const hint = JSON.stringify(json.error.details ?? []).match(/"retryDelay":"(\d+)s"/);
      const wait = (hint ? Number(hint[1]) : 30) + 2;
      console.log(`  ${beat.id}: rate limited, retrying in ${wait} s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
    }
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error(`${beat.id}: ${JSON.stringify(json).slice(0, 300)}`);
    const buf = Buffer.from(part.inlineData.data, "base64");
    const raw = `${file}.raw`;
    writeFileSync(raw, buf);
    // Normalise to 48 kHz WAV and trim leading/trailing silence; raw PCM models return audio/l16.
    const input = part.inlineData.mimeType.includes("wav") ? ["-i", raw] : ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw];
    execFileSync("ffmpeg", ["-v", "error", "-y", ...input, "-af",
      "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse" +
        (speed !== 1 ? `,atempo=${speed}` : ""),
      "-ar", "48000", file]);
  }
  const sec = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  timing.push({ id: beat.id, file: file.replace("public/", ""), sec, voice, text: beat.text, ...(speed !== 1 ? { speed } : {}) });
  console.log(beat.id.padEnd(10), sec.toFixed(2), voice);
}
writeFileSync(`${epDir}/timing.json`, JSON.stringify(timing, null, 2));
console.log("total", timing.reduce((a, b) => a + b.sec, 0).toFixed(1), "s");
