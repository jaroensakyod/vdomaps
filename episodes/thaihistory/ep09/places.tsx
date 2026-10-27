import { bbox } from "../../../components/Region";

// Places for episode 9, the Phitsanulok campaign of 1768 (Koeichai). Koeichai and Sawangkhaburi are approximate.
export const PL = {
  thonburi: [100.4905, 13.742],
  ayut: [100.566, 14.357],
  chainat: [100.125, 15.185],
  pho: [100.125, 15.705], // Pak Nam Pho, Nakhon Sawan: Ping + Nan → Chao Phraya
  koeichai: [100.27, 15.93], // Koeichai, Chum Saeng (approximate)
  phitsanulok: [100.262, 16.822],
  fang: [100.33, 17.62], // Sawangkhaburi / Fang (approximate)
} satisfies Record<string, [number, number]>;

export const VW = {
  siam: bbox([[98.8, 13.4], [101.6, 18.2]]),
  plain: bbox([[99.7, 13.6], [100.9, 15.9]]),
  pho: bbox([[99.85, 15.45], [100.55, 16.1]]),
  koeichai: bbox([[100.1, 15.78], [100.42, 16.05]]),
  north: bbox([[100.04, 16.35], [100.5, 17.15]]),
  city: bbox([[100.15, 16.7], [100.38, 16.92]]),
  fang: bbox([[100.02, 16.72], [100.58, 17.72]]),
};

export const ROUTE = {
  up: [PL.thonburi, [100.5, 13.95], [100.55, 14.2], PL.ayut, [100.45, 14.6], [100.2, 14.95], PL.chainat, [100.1, 15.45], PL.pho] as [number, number][],
  nan: [PL.pho, [100.2, 15.78], PL.koeichai] as [number, number][],
  toPhit: [PL.koeichai, [100.3, 16.2], [100.26, 16.5], PL.phitsanulok] as [number, number][],
  back: [PL.koeichai, PL.pho, PL.chainat, PL.ayut, PL.thonburi] as [number, number][],
  fang: [PL.fang, [100.3, 17.2], PL.phitsanulok] as [number, number][],
};
