import { buildBeats } from "../../../components/subs.mjs";
import { LAYOUT } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 10 timing (same layout as episodes 6–9): beats, lookup by id, word cue frames, voice spans.
// 12-frame gaps (not the kit's 16) and narration sped up 6 % with atempo keep the episode near 10 minutes.
export const BEATS = buildBeats(timing, beatsText, { ...LAYOUT, gap: 12 });
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
import type { Chapter6 } from "../ep06/beatsKit";
export { flashOf, GOLD, RED, softImpact, TAK_C, BURMA_C, ramp } from "../ep06/beatsKit";
// Full = a full-screen picture (Flow still in 2.5D) drawn over the map, under the head card and captions.
export type Chapter10 = Chapter6 & { Full?: () => import("react").ReactNode };
