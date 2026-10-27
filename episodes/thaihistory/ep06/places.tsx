import { bbox } from "../../../components/Region";

// Places for episode 6, Phraya Tak's breakout, Jan 1767. Most are approximate (named villages from the chronicles,
// placed at today's place of the same name) — said on screen and in the description.
export const PL = {
  tak: [99.13, 16.87],
  ayut: [100.566, 14.357],
  phichai: [100.584, 14.352], // Wat Phichai Songkhram, east bank of the Pa Sak opposite the island
  sangkhawat: [100.54, 14.33], // approximate
  hantra: [100.61, 14.37],
  khaomao: [100.65, 14.385],
  sambandit: [100.69, 14.38],
  phosaohan: [100.74, 14.35], // Uthai district
  phrannok: [100.84, 14.31], // approximate
  bandong: [101.08, 14.2], // approximate
  nakhonnayok: [101.21, 14.2],
  kobjae: [101.5, 14.04], // Dan Kob Jae, Prachantakham
  prachin: [101.37, 14.05],
  jolo: [101.31, 13.73], // Pak Nam Jo Lo, Bang Khla
  battle: [101.36, 13.9], // Jo Lo battle, between Bang Khla and Prachinburi (sources differ)
  thonglang: [101.12, 13.55],
  bangplasoi: [100.98, 13.36], // Chonburi town
  naklua: [100.9, 12.97],
  pattaya: [100.88, 12.93],
  jomtien: [100.87, 12.86],
  sattahip: [100.91, 12.66],
  rayong: [101.28, 12.68],
  watlum: [101.275, 12.678],
  klaeng: [101.65, 12.78],
  chanthaburi: [102.1, 12.61],
} satisfies Record<string, [number, number]>;

export const VW = {
  hook: bbox([[100.45, 14.22], [100.78, 14.48]]),
  island: bbox([[100.5, 14.3], [100.64, 14.4]]),
  siam: bbox([[98.0, 13.2], [102.0, 17.6]]),
  uthai: bbox([[100.52, 14.24], [100.92, 14.46]]),
  phrannok: bbox([[100.6, 14.15], [101.0, 14.45]]),
  nny: bbox([[100.7, 13.95], [101.5, 14.4]]),
  prachin: bbox([[101.05, 13.6], [101.65, 14.2]]),
  coast: bbox([[100.65, 12.55], [101.45, 13.6]]),
  rayong: bbox([[101.1, 12.55], [101.45, 12.8]]),
  route: bbox([[100.35, 12.45], [101.8, 14.5]]),
  east: bbox([[100.4, 12.3], [102.3, 14.5]]),
};

// The march, Wat Phichai → Rayong (approximate line through the named stops).
export const ROUTE = {
  night: [PL.phichai, PL.hantra, PL.khaomao, PL.sambandit] as [number, number][],
  day4: [PL.sambandit, PL.phosaohan, PL.phrannok] as [number, number][],
  nny: [PL.phrannok, [100.98, 14.24], PL.bandong, PL.nakhonnayok] as [number, number][],
  prachin: [PL.nakhonnayok, [101.38, 14.12], PL.kobjae, [101.42, 13.98], PL.battle] as [number, number][],
  coast: [PL.battle, [101.22, 13.66], PL.thonglang, PL.bangplasoi, [100.93, 13.15], PL.naklua] as [number, number][],
  south: [PL.naklua, PL.pattaya, PL.jomtien, [100.9, 12.76], PL.sattahip, [101.05, 12.66], PL.rayong] as [number, number][],
  klaeng: [PL.rayong, [101.45, 12.73], PL.klaeng] as [number, number][],
  chan: [PL.rayong, PL.klaeng, [101.9, 12.7], PL.chanthaburi] as [number, number][],
};
export const FULL_ROUTE: [number, number][] = [...ROUTE.night, ...ROUTE.day4.slice(1), ...ROUTE.nny.slice(1), ...ROUTE.prachin.slice(1), ...ROUTE.coast.slice(1), ...ROUTE.south.slice(1)];
