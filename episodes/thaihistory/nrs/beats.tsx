import type { ReactNode } from "react";
import { Bed as BaseBed, Hit as BaseHit } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { GOLD, LAYOUT, type Chapter, type Head } from "../news/kit";

// Shared timing helpers for the Naresuan episodes: beats from timing.json, word cue frames, panel chains,
// one head card per beat from beats.json `card`, and the episode mix (effects stay under the voice).
type Beat = ReturnType<typeof buildBeats>[number] & { card?: string[] };

export const makeBeats = (timing: Parameters<typeof buildBeats>[0], beatsText: Parameters<typeof buildBeats>[1]) => {
  const cards = Object.fromEntries((beatsText as { id: string; card?: string[] }[]).map((b) => [b.id, b.card]));
  const BEATS = (buildBeats(timing, beatsText, LAYOUT) as Beat[]).map((b) => ({ ...b, card: cards[b.id] }));
  const B = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, Beat>;
  // Frame where `word` is spoken (n-th match); else a share k of the beat.
  const wf = (id: string, word: string, k = 0.5, n = 0) => {
    const b = B[id];
    if (!b) throw new Error(`no beat ${id}`);
    // Whisper splits Thai words into pieces ("หง|สาว|ดี"): find the n-th time `word` starts at a piece boundary.
    const words = (b.words ?? []) as { w: string; s: number }[];
    const joined = words.map((w) => w.w).join("");
    const starts: number[] = [];
    let pos = 0;
    for (const w of words) {
      starts.push(pos);
      pos += w.w.length;
    }
    let found = -1;
    for (let from = 0, c = 0; ; c++) {
      const i = joined.indexOf(word, from);
      if (i < 0) break;
      const piece = starts.findIndex((p, j) => p <= i && i < p + words[j].w.length);
      if (c === n) {
        found = piece;
        break;
      }
      from = i + word.length;
    }
    return found >= 0 ? Math.round(b.start + words[found].s * 30) : Math.round(b.start + b.len * k);
  };
  const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);
  const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);
  // Head cards for a run of beats: card[0] = tag, card[1] = headline; `over` adds portrait/stat/colour per beat.
  const heads = (ids: string[], over: Record<string, Partial<Head>> = {}, color = GOLD): Head[] =>
    ids.map((id) => {
      const card = (B[id] as { card?: string[] }).card ?? ["", ""];
      return { f: B[id].start, tag: card[0], head: card[1] ?? "", color, ...over[id] };
    });
  return { BEATS, B, wf, at, VOICE, heads };
};

// Panel chain: each entry [start, render(start, end)]; every panel ends 14 frames after the next one starts.
export const chain = (items: [number, (start: number, end: number) => ReactNode][], last: number) =>
  items.map(([f, r], i) => <g key={i}>{r(f, (items[i + 1]?.[0] ?? last) + 14)}</g>);

// Episode mix (house note 23 Oct 2026): one-shots lowered, more under narration; beds low and ducking deep.
export const makeMix = (VOICE: [number, number][]) => {
  const under = (f: number) => VOICE.some(([a, b]) => f >= a - 4 && f <= b + 4);
  const Hit = ({ id, at, volume = 0.5 }: { id: string; at: number; volume?: number }) => <BaseHit id={id} at={at} volume={volume * 0.8 * (under(at) ? 0.5 : 1)} />;
  const Bed = ({ volume = 0.25, ...p }: Parameters<typeof BaseBed>[0]) => <BaseBed {...p} volume={volume * 0.7} duck={0.3} voice={VOICE} />;
  return { Hit, Bed };
};

export type ChapterN = Chapter & { Audio?: () => ReactNode };
