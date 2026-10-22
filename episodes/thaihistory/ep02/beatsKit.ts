import { buildBeats } from "../../../components/subs.mjs";
import { LAYOUT } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 2 timing (same layout as episode 1): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);

// The five factions after 1767 (approximate extents — said in the description, not on screen).
export const FACTIONS = {
  plk: { name: "พิษณุโลก", color: "#4fa3ff", seat: [100.26, 16.82] as [number, number], ring: [[99.5, 16.0], [100.9, 15.95], [101.25, 17.2], [100.45, 17.45], [99.45, 17.05]] as [number, number][] },
  fang: { name: "เจ้าพระฝาง", color: "#b45ad9", seat: [100.1, 17.62] as [number, number], ring: [[99.55, 17.35], [100.45, 17.5], [101.3, 17.4], [101.25, 18.9], [100.2, 19.15], [99.75, 18.2]] as [number, number][] },
  phimai: { name: "พิมาย", color: "#3fbf6a", seat: [102.49, 15.22] as [number, number], ring: [[101.3, 14.35], [104.4, 14.35], [104.5, 15.85], [102.5, 16.3], [101.3, 15.6]] as [number, number][] },
  nakhon: { name: "นครศรีธรรมราช", color: "#ff8a2a", seat: [99.96, 8.43] as [number, number], ring: [[98.3, 7.1], [100.55, 7.0], [100.3, 9.6], [99.35, 11.0], [98.55, 10.0]] as [number, number][] },
  tak: { name: "พระยาตาก", color: "#ffc94a", seat: [102.1, 12.61] as [number, number], ring: [[100.95, 13.45], [101.6, 12.55], [102.9, 11.65], [102.95, 12.9], [101.8, 13.75], [101.0, 13.75]] as [number, number][] },
};
export type FactionId = keyof typeof FACTIONS;
