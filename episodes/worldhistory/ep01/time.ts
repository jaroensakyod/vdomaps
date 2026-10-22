import { buildBeats } from "../../../components/subs.mjs";
import beatsText from "../../wh01/beats.json";
import timing from "../../wh01/timing.json";

// Episode 1 timeline: beat frames from the TTS take, word frames from Whisper (after snap-words).
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
export const FIRST = { ch1: "toulon", ch2: "blockade", ch3: "gather", ch4: "cross", ch5: "smolensk", ch6: "enter", ch7: "malo", ch8: "answer" } as const;
export const span = (ch: keyof typeof FIRST): [number, number] => {
  const keys = Object.keys(FIRST) as (keyof typeof FIRST)[];
  const next = keys[keys.indexOf(ch) + 1];
  return [B[FIRST[ch]].start, next ? B[FIRST[next]].start : BEATS[BEATS.length - 1].end + 45];
};
