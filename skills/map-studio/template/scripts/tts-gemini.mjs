// Voice-over per beat with Gemini TTS. Usage: GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]
// Reads src/episodes/<slug>/beats.json, writes public/audio/<slug>/<nn>.wav and src/episodes/<slug>/timing.json.
// Send plain text only: an English style instruction in the prompt gets read aloud. Write numbers as Thai words.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const [slug, voice = "Charon", model = "gemini-3.8-flash-tts"] = process.argv.slice(2);
const key = process.env.GEMINI_API_KEY;
if (!slug || !key) throw new Error("usage: GEMINI_API_KEY=... node scripts/tts-gemini.mjs <slug> [voice] [model]");
const beats = JSON.parse(readFileSync(`src/episodes/${slug}/beats.json`, "utf8"));
const dir = `public/audio/${slug}`;
mkdirSync(dir, { recursive: true });

const timing = [];
for (const [i, beat] of beats.entries()) {
  const file = `${dir}/${String(i + 1).padStart(2, "0")}.wav`;
  if (!existsSync(file) || process.env.FORCE) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: beat.text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      }),
    });
    const json = await res.json();
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error(`${beat.id}: ${JSON.stringify(json).slice(0, 300)}`);
    const buf = Buffer.from(part.inlineData.data, "base64");
    const raw = `${file}.raw`;
    writeFileSync(raw, buf);
    // Normalise to 48 kHz WAV and trim leading/trailing silence; raw PCM models return audio/l16.
    const input = part.inlineData.mimeType.includes("wav") ? ["-i", raw] : ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw];
    execFileSync("ffmpeg", ["-v", "error", "-y", ...input, "-af",
      "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
      "-ar", "48000", file]);
  }
  const sec = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString());
  timing.push({ id: beat.id, file: file.replace("public/", ""), sec });
  console.log(beat.id, sec.toFixed(2));
}
writeFileSync(`src/episodes/${slug}/timing.json`, JSON.stringify(timing, null, 2));
console.log("total", timing.reduce((a, b) => a + b.sec, 0).toFixed(1), "s");
