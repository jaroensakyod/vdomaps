import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Timeline of the 22 Oct 2026 edition + word cues (Whisper timing after snap-words).
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
  helsinki: [24.94, 60.17] as LL,
  hague: [4.3, 52.08] as LL,
  paris: [2.35, 48.86] as LL,
  dammam: [49.8, 26.47] as LL,
  spb: [30.34, 59.93] as LL,
  kyiv: [30.52, 50.45] as LL,
  ouaga: [-1.53, 12.37] as LL,
  sansal: [-89.19, 13.69] as LL,
  pap: [-72.33, 18.54] as LL,
  nino: [-140, 0] as LL,
  okinawa: [127.68, 26.21] as LL,
  taipei: [121.56, 25.03] as LL,
};
