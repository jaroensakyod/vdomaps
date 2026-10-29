import { buildBeats } from "../../../components/subs.mjs";
import { LAYOUT } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// History on the Map × Mumate EP.1 timing (same layout as episodes 1–9): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const wp = (id: string, part: string, k = 0.5) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).find((w) => w.w.includes(part));
  const f = hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
  return Math.min(Math.max(f, b.start), b.end - 6);
};
export const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);
export const VOICE_FLOW: [number, number][] = VOICE.reduce<[number, number][]>((out, [a, b]) => {
  const last = out[out.length - 1];
  if (last && a - last[1] < 45) last[1] = b;
  else out.push([a, b]);
  return out;
}, []);
export const END = BEATS[BEATS.length - 1].end + 60;
export { flashOf, GOLD, RED, softImpact, TAK_C, BURMA_C, ramp, type Chapter6 as ChapterM } from "../ep06/beatsKit";
