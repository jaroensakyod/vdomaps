import { bbox } from "../../../components/Region";

// Places for episode 7, Chanthaburi and Trat, Feb–Oct 1767. Camp, ambush and shipyard points are approximate (placed
// at today's places of the same name) — said on screen and in the description.
export const PL = {
  ayut: [100.566, 14.357],
  rayong: [101.28, 12.68],
  klaeng: [101.65, 12.78],
  chan: [102.105, 12.61], // old town by the Chanthaburi river
  ford: [102.085, 12.6], // where the guides wanted the army to cross (approximate)
  thachang: [102.13, 12.665], // Tha Chang, north of the town (approximate)
  watkaew: [102.115, 12.64], // Wat Kaew camp (approximate)
  samet: [102.07, 12.575], // Ban Samet Ngam shipyard (approximate)
  trat: [102.51, 12.24],
  tratmouth: [102.56, 12.17],
  hatien: [104.48, 10.38], // Phutthaimat / Ha Tien
  chonburi: [100.98, 13.36],
  paknam: [100.59, 13.6],
  thonburi: [100.49, 13.73],
  phosamton: [100.57, 14.29], // Pho Sam Ton camp south of Ayutthaya (approximate)
} satisfies Record<string, [number, number]>;

export const VW = {
  rayong: bbox([[101.1, 12.5], [101.5, 12.85]]),
  east: bbox([[101.1, 12.3], [102.7, 13.0]]),
  chan: bbox([[101.85, 12.45], [102.35, 12.8]]),
  city: bbox([[102.03, 12.56], [102.18, 12.69]]),
  trat: bbox([[102.25, 12.0], [102.75, 12.45]]),
  gulf: bbox([[100.5, 9.9], [105.0, 13.6]]),
  fleet: bbox([[100.2, 12.2], [102.4, 14.6]]),
  siam: bbox([[99.5, 11.5], [103.0, 15.0]]),
};

export const ROUTE = {
  toChan: [PL.rayong, [101.45, 12.73], PL.klaeng, [101.85, 12.72], [102.0, 12.68], PL.thachang] as [number, number][],
  lure: [[102.0, 12.66], PL.ford, [102.1, 12.585]] as [number, number][],
  camp: [PL.thachang, PL.watkaew] as [number, number][],
  rebels: [PL.klaeng, [101.85, 12.7], PL.chan] as [number, number][],
  flee: [PL.chan, [102.15, 12.45], [102.5, 11.9], [103.4, 11.0], PL.hatien] as [number, number][],
  trat: [PL.chan, [102.3, 12.45], PL.trat, PL.tratmouth] as [number, number][],
  fleet: [PL.samet, [101.7, 12.4], [101.0, 12.55], [100.85, 12.95], PL.chonburi, [100.75, 13.45], PL.paknam, PL.thonburi] as [number, number][],
  upriver: [PL.thonburi, [100.52, 13.95], PL.phosamton] as [number, number][],
};
