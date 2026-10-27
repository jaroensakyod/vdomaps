// Sum costs.jsonl (written by gemini-cost.mjs) per episode and script. Usage: node scripts/cost-report.mjs [episode]
import { existsSync, readFileSync } from "node:fs";
import { money } from "./gemini-cost.mjs";

const [only] = process.argv.slice(2);
if (!existsSync("costs.jsonl")) throw new Error("no costs.jsonl yet — run tts, transcribe or image first");
const lines = readFileSync("costs.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((l) => !only || l.episode === only);
const sums = new Map();
for (const l of lines) {
  const s = sums.get(l.episode) ?? { runs: 0, usd: 0, byScript: {}, audioTok: 0, images: 0 };
  s.runs++;
  s.usd += l.usd;
  s.byScript[l.script] = (s.byScript[l.script] ?? 0) + l.usd;
  for (const m of Object.values(l.models)) (s.audioTok += m.audio), (s.images += m.image ? m.requests : 0);
  sums.set(l.episode, s);
}
let total = 0;
for (const [ep, s] of sums) {
  total += s.usd;
  const parts = Object.entries(s.byScript).map(([k, v]) => `${k} $${v.toFixed(4)}`).join(" · ");
  console.log(`${ep.padEnd(20)} ${money(s.usd).padEnd(22)} ${s.runs} runs · ${parts}${s.audioTok ? ` · ${(s.audioTok / 25 / 60).toFixed(1)} min audio made` : ""}${s.images ? ` · ${s.images} images` : ""}`);
}
if (sums.size > 1) console.log(`${"all".padEnd(20)} ${money(total)}`);
