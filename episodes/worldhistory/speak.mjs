// beats.json helper for English episodes: fills `text` (what TTS reads) from `caption` (on screen).
// Numbers become hyphen-joined words so both keep the same space-separated tokens for subs.mjs:
// "400,000" → "four-hundred-thousand", "1812" → "eighteen-twelve", "24th" → "twenty-fourth".
// Usage: node speak.mjs ep01/beats.json   (rewrites the file in place; a beat's own `text` wins)
import { readFileSync, writeFileSync } from "node:fs";

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ORD = { one: "first", two: "second", three: "third", five: "fifth", eight: "eighth", nine: "ninth", twelve: "twelfth" };

const under100 = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ""));
const under1000 = (n) => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]}-hundred` : "", r || !h ? under100(r) : ""].filter(Boolean).join("-");
};
const cardinal = (n) => {
  if (n === 0) return "zero";
  const parts = [];
  for (const [v, w] of [[1e6, "million"], [1e3, "thousand"]]) {
    if (n >= v) {
      parts.push(`${under1000(Math.floor(n / v))}-${w}`);
      n %= v;
    }
  }
  if (n) parts.push(under1000(n));
  return parts.join("-");
};
// Years read as pairs: 1812 → eighteen-twelve, 1805 → eighteen-oh-five, 1800 → eighteen-hundred.
const year = (n) => {
  const a = Math.floor(n / 100);
  const b = n % 100;
  return `${under100(a)}-${b === 0 ? "hundred" : b < 10 ? `oh-${ONES[b]}` : under100(b)}`;
};
const ordinal = (n) => {
  const w = cardinal(n).split("-");
  const last = w.pop();
  const o = ORD[last] ?? (last.endsWith("y") ? `${last.slice(0, -1)}ieth` : `${last}th`);
  return [...w, o].join("-");
};

export const speak = (caption) =>
  caption
    .split(" ")
    .map((tok, i, all) => {
      const start = i === 0 || /[.?!]$/.test(all[i - 1]);
      const w = word(tok);
      return start && w !== tok ? w[0].toUpperCase() + w.slice(1) : w;
    })
    .join(" ");

function word(tok) {
  const m = tok.match(/^([^\d−-]*)([−-]?)(\d{1,3}(?:,\d{3})+|\d+)(st|nd|rd|th|s|%|°C|km)?([^\d]*)$/);
  if (!m) return tok;
  const [, pre, minus, digits, suf, post] = m;
  const n = Number(digits.replace(/,/g, ""));
  let w;
  if (suf && /^(st|nd|rd|th)$/.test(suf)) w = ordinal(n);
  else if (!digits.includes(",") && n >= 1100 && n <= 2099 && (!suf || suf === "s")) w = year(n);
  else w = cardinal(n);
  if (suf === "s") w = w.endsWith("y") ? `${w.slice(0, -1)}ies` : `${w}s`;
  if (suf === "%") w += "-percent";
  if (suf === "°C") w += "-degrees";
  if (suf === "km") w += "-kilometres";
  return `${pre}${minus ? "minus-" : ""}${w}${post}`;
}

if (process.argv[2]) {
  const file = process.argv[2];
  const beats = JSON.parse(readFileSync(file, "utf8"));
  for (const b of beats) if (!b.text) b.text = speak(b.caption);
  for (const b of beats) {
    const a = b.text.split(" ").length;
    const c = b.caption.split(" ").length;
    if (a !== c) console.warn(`${b.id}: text has ${a} tokens, caption ${c}`);
  }
  writeFileSync(file, `[\n${beats.map((b) => `  ${JSON.stringify(b)}`).join(",\n")}\n]\n`);
  console.log(`${beats.length} beats, ${beats.reduce((n, b) => n + b.caption.split(" ").length, 0)} words`);
}
