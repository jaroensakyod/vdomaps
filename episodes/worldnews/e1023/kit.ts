import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Timeline of the 23 Oct 2026 edition + word cues (Whisper timing after snap-words).
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
  abyei: [28.44, 9.59] as LL,
  khartoum: [32.53, 15.5] as LL,
  juba: [31.58, 4.85] as LL,
  taipei: [121.56, 25.03] as LL,
  liuqiu: [120.37, 22.34] as LL,
  kyiv: [30.52, 50.45] as LL,
  moscow: [37.62, 55.75] as LL,
  riyadh: [46.72, 24.71] as LL,
  sanaa: [44.21, 15.37] as LL,
  cairo: [31.24, 30.04] as LL,
  seoul: [126.98, 37.57] as LL,
  beijing: [116.4, 39.9] as LL,
  gothenburg: [11.97, 57.71] as LL,
  warsaw: [21.01, 52.23] as LL,
  delhi: [77.21, 28.61] as LL,
  brasilia: [-47.88, -15.79] as LL,
};
