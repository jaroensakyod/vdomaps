import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { buildBeats } from "../../../components/subs.mjs";
import { clamp, GOLD, LAYOUT, RED, type Chapter } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 6 timing (same layout as episodes 1–5): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
// Frame of the first spoken word that contains `part` (Whisper splits Thai words its own way), else a share of the beat.
export const wp = (id: string, part: string, k = 0.5) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).find((w) => w.w.includes(part));
  const f = hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
  return Math.min(Math.max(f, b.start), b.end - 6);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);
export const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);
// Voice spans with short pauses (< 45 frames) merged: beds stay ducked through the narration instead of swelling in
// every breath between sentences (that pumping reads as the sound "stuttering").
export const VOICE_FLOW: [number, number][] = VOICE.reduce<[number, number][]>((out, [a, b]) => {
  const last = out[out.length - 1];
  if (last && a - last[1] < 45) last[1] = b;
  else out.push([a, b]);
  return out;
}, []);

export type Chapter6 = Chapter & { Audio?: () => ReactNode };

export const TAK_C = GOLD; // Phraya Tak's band
export const BURMA_C = RED;
export { GOLD, RED };

// 0→1 ramp starting at f over n frames (and back to 0 at `off` if given).
export const ramp = (frame: number, f: number, n = 18, off = 1e9) => interpolate(frame, [f, f + n, off, off + n], [0, 1, 1, 0], clamp);

// Soft impact for panel shake: rises over 2 frames, fades over `len` — never above 0.65, so Depth's white flash
// (impact > 0.7) never fires. House rule: flashes rise ≥ 2 frames and fade ≥ 10.
export const softImpact = (frame: number, hits: number[], len = 14) => {
  let v = 0;
  for (const h of hits) v = Math.max(v, interpolate(frame - h, [-2, 0, len], [0, 0.65, 0], clamp));
  return v;
};

// Muzzle/fire flash envelope for figures: 0 → 1 over 3 frames, back to 0 over 14.
export const flashOf = (frame: number, f: number) => interpolate(frame - f, [0, 3, 17], [0, 1, 0], clamp);
