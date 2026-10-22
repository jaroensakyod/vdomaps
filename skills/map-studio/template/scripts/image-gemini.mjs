// Still images with Gemini (portraits, scene art). Usage: GEMINI_API_KEY=... node scripts/image-gemini.mjs <jobs.json> <out dir> [model]
// jobs.json = { "style": "...shared prompt...", "aspect": "1:1", "items": { "<id>": "<subject prompt>" | { "prompt", "aspect" } } }
// Writes <out dir>/<id>.jpg (ffmpeg converts the PNG the API returns). Existing files are kept unless FORCE=1;
// ONLY=id1,id2 limits the run. Every generated image is AI art: label it on screen ("ภาพประกอบ").
import "./env.mjs";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const [jobsFile, outDir, model = "gemini-3.1-flash-image"] = process.argv.slice(2);
const key = process.env.GEMINI_API_KEY;
if (!jobsFile || !outDir || !key) throw new Error("usage: GEMINI_API_KEY=... node scripts/image-gemini.mjs <jobs.json> <out dir> [model]");
const jobs = JSON.parse(readFileSync(jobsFile, "utf8"));
const only = process.env.ONLY?.split(",");
mkdirSync(outDir, { recursive: true });

for (const [id, item] of Object.entries(jobs.items)) {
  if (only && !only.includes(id)) continue;
  const out = `${outDir}/${id}.jpg`;
  if (existsSync(out) && !process.env.FORCE) {
    console.log(id.padEnd(12), "(exists)");
    continue;
  }
  const { prompt, aspect = jobs.aspect ?? "1:1" } = typeof item === "string" ? { prompt: item } : item;
  let json;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}\n\n${jobs.style ?? ""}` }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } },
      }),
    });
    json = await res.json();
    if (json.error?.code !== 429 || attempt >= 8) break;
    const hint = JSON.stringify(json.error.details ?? []).match(/"retryDelay":"(\d+)s"/);
    const wait = (hint ? Number(hint[1]) : 30) + 2;
    console.log(`  ${id}: rate limited, retrying in ${wait} s`);
    await new Promise((r) => setTimeout(r, wait * 1000));
  }
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`${id}: ${JSON.stringify(json).slice(0, 400)}`);
  const tmp = `${out}.src`;
  writeFileSync(tmp, Buffer.from(part.inlineData.data, "base64"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-q:v", "3", out]);
  rmSync(tmp);
  console.log(id.padEnd(12), "→", out);
}
