// Transcribe a VO file with Gemini to check what the TTS actually said. Usage: GEMINI_API_KEY=... node scripts/transcribe.mjs file.wav [model]
import { readFileSync } from "node:fs";
const [file, model = "gemini-3.8-flash"] = process.argv.slice(2);
const data = readFileSync(file).toString("base64");
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ contents: [{ parts: [
    { inlineData: { mimeType: "audio/wav", data } },
    { text: "Transcribe this audio verbatim (it may contain Thai and/or English). Mark each pause longer than 0.3 s as [pause Ns] with its approximate length. Output only the transcript." } ] }] }),
});
const j = await res.json();
console.log(j.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? JSON.stringify(j).slice(0, 400));
