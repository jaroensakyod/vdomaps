import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Timeline of the 24 Oct 2026 edition + word cues (Whisper timing after snap-words).
export const LAYOUT = { lead: 0, gap: 10, tail: 30 };
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const FRAMES = totalFrames(BEATS, LAYOUT);
export const endOf = (id: string) => B[id].end + LAYOUT.gap;
export const O = 14; // panel overlap

// Frame where `word` starts in beat `id` (n-th match; Thai tokens are joined until they cover the word).
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const ws = (b.words ?? []) as { w: string; s: number }[];
  let seen = 0;
  for (let i = 0; i < ws.length; i++) {
    let acc = "";
    for (let j = i; j < ws.length && acc.length < word.length; j++) acc += ws[j].w;
    if (acc.startsWith(word) && seen++ === n) return Math.round(b.start + ws[i].s * 30);
  }
  return Math.round(b.start + b.len * k);
};

// Consecutive panels: cue frames → [start, end] with the 14-frame overlap (no blink between panels).
export const chain = (cues: number[], end: number) => cues.map((c, i) => [c, i + 1 < cues.length ? cues[i + 1] + O : end] as const);

export type LL = [number, number];
export const PL = {
  nairobi: [36.85, -1.27] as LL,
  trappes: [2.0, 48.78] as LL,
  hebron: [35.1, 31.53] as LL,
  oleshky: [32.53, 46.62] as LL,
  kyiv: [30.52, 50.45] as LL,
  pyongyang: [125.75, 39.03] as LL,
  dandong: [124.38, 40.13] as LL,
  durban: [31.03, -29.86] as LL,
  ishigaki: [124.16, 24.34] as LL,
  miyako: [125.28, 24.8] as LL,
  brasilia: [-47.88, -15.79] as LL,
};
