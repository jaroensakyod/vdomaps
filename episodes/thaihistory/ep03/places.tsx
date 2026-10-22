import { bbox } from "../../../components/Region";

// Places and views for episode 3 (approximate points — said in the description).
export const PL = {
  thon: [100.49, 13.74],
  ava: [95.98, 21.86],
  kaungton: [97.3, 24.05],
  yunnan: [100.2, 24.6],
  chiangmai: [98.99, 18.79],
  lampang: [99.49, 18.29],
  martaban: [97.63, 16.53],
  bangkaeo: [99.86, 13.7],
  ratchaburi: [99.81, 13.54],
  maelamao: [98.62, 16.72],
  tak: [99.13, 16.88],
  sukhothai: [99.7, 17.02],
  plk: [100.26, 16.82],
  pakping: [100.29, 16.7],
  kamphaeng: [99.52, 16.48],
  nakhonsawan: [100.12, 15.7],
  phetchabun: [101.16, 16.42],
} satisfies Record<string, [number, number]>;

export const VW = {
  siam: bbox([[97.4, 6.6], [105.4, 19.6]]),
  region: bbox([[94.5, 12.8], [104.0, 25.0]]),
  burma: bbox([[94.0, 14.0], [102.5, 27.2]]),
  lanna: bbox([[97.6, 15.8], [100.8, 20.0]]),
  west: bbox([[97.2, 12.9], [100.9, 17.9]]),
  ratchaburi: bbox([[99.3, 13.2], [100.7, 14.1]]),
  north: bbox([[98.4, 15.4], [101.6, 17.9]]),
  plk: bbox([[99.9, 16.5], [100.6, 17.1]]),
  plkWide: bbox([[99.3, 15.5], [101.4, 17.6]]),
};

// The Nan river south of Phitsanulok (supply line) and the Burmese way in.
export const NAN: [number, number][] = [[100.26, 16.82], [100.29, 16.7], [100.3, 16.45], [100.35, 16.2], [100.2, 15.95], [100.12, 15.7]];
export const NAN_UP: [number, number][] = [[100.49, 13.74], [100.55, 14.3], [100.3, 14.75], [100.12, 15.18], [100.12, 15.7], [100.2, 15.95], [100.35, 16.2], [100.3, 16.45], [100.29, 16.7]];
export const INVADE: [number, number][] = [[97.63, 16.53], [98.2, 16.65], [98.62, 16.72], [99.13, 16.88], [99.7, 17.02], [100.1, 16.9], [100.22, 16.84]];
