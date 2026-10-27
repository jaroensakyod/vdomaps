import { interpolate } from "remotion";
import { buildBeats } from "../../../components/subs.mjs";
import beatsText from "./beats.json";
import timing from "./timing.json";

// What if America ep 1 timeline: beat frames from the TTS take, word frames from Whisper (after snap-words).
export const LAYOUT = { lead: 3, gap: 16 };
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const CARD = Object.fromEntries((beatsText as { id: string; card?: string[] }[]).map((b) => [b.id, b.card ?? ["", ""]]));

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9-]/g, "");
// Frame where a word is spoken (n-th match, punctuation and case ignored); else a share of the beat.
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => norm(w.w) === norm(word))[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);

// Chapter spans: each chapter runs from its first beat's start to the next chapter's first beat.
export const FIRST = { ch0: "hook", ch1: "strait", ch2: "why", ch3: "seward", ch4: "fork", ch5: "a1", ch6: "b1", ch7: "you1", ch8: "back" } as const;
export const span = (ch: keyof typeof FIRST): [number, number] => {
  const keys = Object.keys(FIRST) as (keyof typeof FIRST)[];
  const next = keys[keys.indexOf(ch) + 1];
  return [ch === "ch0" ? 0 : B[FIRST[ch]].start, next ? B[FIRST[next]].start : BEATS[BEATS.length - 1].end + 45];
};

// ---- the what-if world ----
// Spans where the channel grade is on. `in`/`out` = "split" (the channel's crack transition, 16 frames) or "fade".
// Real-world moments inside a what-if stretch are `dips` (the grade fades out and back over 10 frames).
export type WorldSpan = { from: number; to: number; in: "split" | "fade" | "none"; out: "split" | "fade" };
export const WORLD: WorldSpan[] = [
  { from: 0, to: B.real.start, in: "none", out: "split" },
  { from: wf("split", "tear", 0.6), to: B.you1.start, in: "split", out: "fade" },
  { from: B.you6.start, to: B.back.start, in: "split", out: "split" },
];
export const DIPS: [number, number][] = [
  [B.a2.start, B.a3.start],
  [B.a7.start, wf("a7", "Path", 0.55)],
  [B.b2.start, B.b4.start],
  [B.b6.start, B.b7.start],
];
export const SPLIT_LEN = 16;
const FADE = 10;

// Grade strength 0..1 at a frame (split edges are drawn by Ep with SplitIn/SplitOut, so here they jump).
export const whatIfK = (f: number) => {
  let k = 0;
  for (const w of WORLD) {
    if (f < w.from - FADE || f > w.to + FADE) continue;
    const a = w.in === "fade" ? interpolate(f, [w.from, w.from + FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : f >= w.from + (w.in === "split" ? SPLIT_LEN : 0) ? 1 : 0;
    const b = w.out === "fade" ? interpolate(f, [w.to - FADE, w.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : f < w.to ? 1 : 0;
    k = Math.max(k, Math.min(a, b));
  }
  for (const [d0, d1] of DIPS) k *= 1 - interpolate(f, [d0 - FADE / 2, d0 + FADE / 2, d1 - FADE / 2, d1 + FADE / 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return k;
};
// True while the viewer is in the what-if world (drives the "WHAT IF" chip and the panel accent).
export const isWhatIf = (f: number) => whatIfK(f) > 0.5 || WORLD.some((w) => w.in === "split" && f >= w.from && f < w.from + SPLIT_LEN);

// Voice spans for ducking library beds under the narration: pass as <Bed voice={VOICE} …>.
export const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);
