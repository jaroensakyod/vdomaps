// Token and cost meter for the Gemini scripts. `const cost = meter("tts", slug)` then `cost.add(model, json)` after
// every API response; when the process exits (also on a crash or a daily-cap stop) it prints the total and appends one
// line to costs.jsonl in the project folder (git-ignored). `npm run cost [-- <episode>]` sums that file.
// Prices: Standard tier, USD per 1M tokens, from ai.google.dev/gemini-api/docs/pricing (read 2026-10-23). The paid
// tier bills these; a free-tier key pays nothing, so the figures are what it would cost. THB_PER_USD (default 33).
// in = any input · out = text and thinking output · audio / image = audio or image output.
import { appendFileSync } from "node:fs";

const PRICES = {
  "gemini-3.8-flash-tts": [{ in: 0.5, audio: 9 }, { from: "2027-01-01", in: 1, audio: 18 }],
  "gemini-3.8-flash-lite-tts": [{ in: 0.5, audio: 6 }, { from: "2027-01-01", in: 1, audio: 12 }],
  "gemini-3.1-flash-tts-preview": [{ in: 1, audio: 20 }],
  "gemini-2.5-flash-preview-tts": [{ in: 0.5, audio: 10 }],
  "gemini-2.5-pro-preview-tts": [{ in: 1, audio: 20 }],
  "gemini-3.8-flash": [{ in: 0.75, out: 3.75 }, { from: "2027-01-01", in: 1.5, out: 7.5 }],
  "gemini-3.6-flash": [{ in: 0.75, out: 3.75 }, { from: "2027-01-01", in: 1.5, out: 7.5 }],
  "gemini-3.1-flash-image": [{ in: 0.5, out: 3, image: 60 }],
  "gemini-3.1-flash-lite-image": [{ in: 0.25, out: 1.5, image: 30 }],
  "gemini-nano-banana-2.1": [{ in: 1.5, out: 7.5, image: 30 }],
};
export const thbPerUsd = Number(process.env.THB_PER_USD ?? 33);

// The price row in force today (rows are in date order; a row without `from` applies from the start).
const priceOf = (model) => {
  const today = new Date().toISOString().slice(0, 10);
  return (PRICES[model.replace(/^models\//, "")] ?? []).filter((p) => !p.from || p.from <= today).at(-1);
};

// usageMetadata → tokens by kind. Output without a modality breakdown counts as the model's main output.
const tokensOf = (model, u = {}) => {
  const main = /tts/.test(model) ? "audio" : /image/.test(model) ? "image" : "out";
  const t = { in: u.promptTokenCount ?? 0, out: u.thoughtsTokenCount ?? 0, audio: 0, image: 0 };
  const details = u.candidatesTokensDetails;
  if (!details) t[main] += u.candidatesTokenCount ?? 0;
  else for (const d of details) t[{ AUDIO: "audio", IMAGE: "image" }[d.modality] ?? "out"] += d.tokenCount ?? 0;
  return t;
};

export const usd = (model, t) => {
  const p = priceOf(model);
  if (!p) return null;
  return (t.in * p.in + t.out * (p.out ?? 0) + t.audio * (p.audio ?? 0) + t.image * (p.image ?? 0)) / 1e6;
};

export const money = (v) => (v == null ? "price unknown" : `$${v.toFixed(4)} ≈ ฿${(v * thbPerUsd).toFixed(2)}`);

export const meter = (script, episode = "-") => {
  const byModel = new Map();
  process.on("exit", () => {
    if (!byModel.size) return;
    let total = 0;
    let unknown = false;
    for (const [model, m] of byModel) {
      const v = usd(model, m.tokens);
      if (v == null) unknown = true;
      else total += v;
      const { in: i, out, audio, image } = m.tokens;
      console.log(`cost ${model}: ${m.requests} req · in ${i} · out ${out}${audio ? ` · audio ${audio} (${(audio / 25).toFixed(0)} s)` : ""}${image ? ` · image ${image}` : ""} tok · ${money(v)}`);
    }
    console.log(`cost total (${script}${episode !== "-" ? ` ${episode}` : ""}): ${money(total)}${unknown ? " + models without a price" : ""}`);
    const line = { date: new Date().toISOString(), script, episode, usd: Number(total.toFixed(6)), models: Object.fromEntries([...byModel].map(([k, m]) => [k, { requests: m.requests, ...m.tokens }])) };
    appendFileSync("costs.jsonl", JSON.stringify(line) + "\n");
  });
  return {
    add(model, json) {
      const m = byModel.get(model) ?? { requests: 0, tokens: { in: 0, out: 0, audio: 0, image: 0 } };
      const t = tokensOf(model, json?.usageMetadata);
      for (const k in t) m.tokens[k] += t[k];
      m.requests++;
      byModel.set(model, m);
    },
  };
};
