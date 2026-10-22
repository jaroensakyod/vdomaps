import { interpolate, useCurrentFrame } from "remotion";
import { bbox } from "../../../components/Region";
import { clamp, GOLD } from "../news/kit";
import { B, FACTIONS, wf, type FactionId } from "./beatsKit";
import { Factions } from "./ch0";

// Places and views for episode 2 (approximate points — said in the description).
export const PL = {
  ayut: [100.566, 14.357],
  thon: [100.49, 13.74],
  fort: [100.491, 13.741],
  posamton: [100.545, 14.3],
  chan: [102.1, 12.61],
  trat: [102.51, 12.24],
  rayong: [101.28, 12.68],
  mouth: [100.58, 13.52],
  bangkung: [99.98, 13.42],
  tavoy: [98.19, 14.08],
  plk: [100.26, 16.82],
  koeichai: [100.2, 15.85],
  chainat: [100.12, 15.18],
  fang: [100.1, 17.62],
  korat: [102.1, 14.97],
  phimai: [102.49, 15.22],
  dankhun: [101.77, 15.21],
  nakhon: [99.96, 8.43],
  pattani: [101.25, 6.87],
} satisfies Record<string, [number, number]>;

export const VW = {
  siam: bbox([[97.4, 6.6], [105.4, 19.6]]),
  east: bbox([[100.6, 11.6], [103.2, 14.0]]),
  gulf: bbox([[99.4, 11.8], [103.0, 14.6]]),
  central: bbox([[99.6, 13.2], [101.6, 15.2]]),
  thon: bbox([[100.3, 13.55], [100.75, 14.4]]),
  north: bbox([[99.4, 14.8], [101.3, 18.2]]),
  isan: bbox([[100.3, 14.0], [103.2, 15.9]]),
  south: bbox([[98.0, 6.5], [102.2, 14.2]]),
  west: bbox([[97.9, 12.8], [100.8, 14.6]]),
  island: bbox([[100.52, 14.32], [100.62, 14.4]]),
};

export const FLEET_IN: [number, number][] = [[102.05, 12.45], [101.3, 12.55], [100.85, 12.9], [100.6, 13.4], [100.52, 13.7]];
export const NAN_RIVER: [number, number][] = [[100.5, 13.75], [100.55, 14.3], [100.3, 14.75], [100.12, 15.18], [100.13, 15.7], [100.2, 16.1], [100.25, 16.5], [100.26, 16.82]];

// The five factions as the story goes: Phitsanulok swallowed by Fang, then each one turns gold when taken.
export const FactionStory = ({ show = 1, focus }: { show?: number; focus?: FactionId }) => {
  const frame = useCurrentFrame();
  const turn = (f: number) => interpolate(frame, [f, f + 20], [0, 1], clamp);
  const mergeF = wf("merge", "กลืน", 0.55);
  const colors: Partial<Record<FactionId, string>> = {};
  if (frame >= mergeF) colors.plk = FACTIONS.fang.color;
  if (frame >= wf("prince", "เหลือ", 0.9)) colors.phimai = GOLD;
  if (frame >= wf("nakhon", "แตก", 0.35)) colors.nakhon = GOLD;
  if (frame >= wf("plk2", "แตก", 0.45)) colors.plk = GOLD;
  if (frame >= wf("sawang", "แตก", 0.95)) colors.fang = GOLD;
  void turn;
  const k: Partial<Record<FactionId, number>> = { plk: show, fang: show, phimai: show, nakhon: show, tak: show };
  const dim: Partial<Record<FactionId, number>> = {};
  if (focus) (Object.keys(FACTIONS) as FactionId[]).forEach((id) => { if (id !== focus) dim[id] = 0.7; });
  return <Factions k={k} dim={dim} colors={colors} />;
};

export const after = (id: string) => B[id].start;
