import { bbox } from "../../../components/Region";

// Places for × Mumate EP.1, Taksin's life 1734–1782. Village and battle points are approximate (as in episodes 4–9).
export const PL = {
  ayut: [100.566, 14.357],
  tak: [99.13, 16.87],
  phichai: [100.584, 14.352],
  phosaohan: [100.74, 14.35],
  phrannok: [100.84, 14.31],
  jolo: [101.31, 13.73],
  rayong: [101.28, 12.68],
  chanthaburi: [102.1, 12.61],
  posamton: [100.58, 14.29], // Pho Sam Ton camp (approximate)
  thon: [100.4893, 13.7432],
  watArun: [100.4889, 13.7437],
  fort: [100.4905, 13.7418],
  watPho: [100.493, 13.7465],
  ramanya: [100.492, 13.772],
  fang: [100.33, 17.62],
  phitsanulok: [100.262, 16.822],
  chiangmai: [98.985, 18.79],
  vientiane: [102.6, 17.97],
  siemreap: [103.86, 13.36],
  nakhonsi: [99.96, 8.43],
} satisfies Record<string, [number, number]>;

export const VW = {
  siam: bbox([[97.6, 12.2], [103.6, 19.4]]),
  region: bbox([[97.5, 8.0], [106.0, 20.5]]),
  south: bbox([[97.8, 7.6], [102.4, 14.4]]),
  island: bbox([[100.5, 14.3], [100.64, 14.4]]),
  plain: bbox([[100.15, 13.6], [100.85, 14.5]]),
  west: bbox([[98.6, 13.9], [101.0, 17.2]]),
  east: bbox([[100.3, 12.3], [102.4, 14.6]]),
  route: bbox([[100.35, 12.45], [101.8, 14.5]]),
  chan: bbox([[101.6, 12.3], [102.5, 12.95]]),
  thon: bbox([[100.474, 13.728], [100.506, 13.768]]),
  thonWide: bbox([[100.43, 13.68], [100.56, 13.82]]),
  north: bbox([[98.4, 15.8], [101.2, 19.2]]),
  laos: bbox([[99.8, 13.4], [103.2, 18.6]]),
  cambodia: bbox([[100.2, 12.6], [104.2, 14.6]]),
};

export const ROUTE = {
  breakout: [PL.phichai, [100.65, 14.385], PL.phosaohan, PL.phrannok, [101.08, 14.2], [101.21, 14.2], [101.36, 13.9], PL.jolo] as [number, number][],
  coast: [PL.jolo, [101.12, 13.55], [100.98, 13.36], [100.9, 12.97], [100.91, 12.66], PL.rayong] as [number, number][],
  chan: [PL.rayong, [101.65, 12.78], [101.9, 12.7], PL.chanthaburi] as [number, number][],
  fleet: [PL.chanthaburi, [101.6, 12.55], [100.95, 12.9], [100.6, 13.45], PL.thon, [100.5, 13.95], PL.posamton] as [number, number][],
  takToAyut: [PL.tak, [99.6, 16.2], [100.1, 15.3], [100.4, 14.7], PL.ayut] as [number, number][],
  fang: [PL.thon, [100.5, 14.3], [100.13, 15.2], [100.2, 16.3], PL.phitsanulok, PL.fang] as [number, number][],
  chiangmai: [PL.phitsanulok, [99.6, 17.6], PL.chiangmai] as [number, number][],
  laos: [PL.thon, [101.2, 14.6], [102.1, 14.97], [102.4, 16.4], PL.vientiane] as [number, number][],
  revolt: [PL.ayut, [100.53, 14.1], [100.5, 13.9], PL.ramanya, PL.thon] as [number, number][],
  cambodiaBack: [PL.siemreap, [102.6, 13.7], [101.71, 13.98], [101.0, 13.85], PL.thon] as [number, number][],
  legend: [PL.thon, [100.2, 12.5], [99.6, 10.6], PL.nakhonsi] as [number, number][],
};
