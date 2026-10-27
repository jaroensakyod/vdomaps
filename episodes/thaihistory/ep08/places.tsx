import { bbox } from "../../../components/Region";

// Places for episode 8, Thonburi and Pho Sam Ton, Nov–Dec 1767. Camp positions are approximate.
export const PL = {
  ayut: [100.566, 14.357],
  phosamton: [100.565, 14.295], // Pho Sam Ton camps south of the island (approximate)
  campE: [100.58, 14.296], // east-bank camp (approximate)
  campW: [100.55, 14.294], // west-bank camp (approximate)
  chan: [102.105, 12.61],
  chonburi: [100.98, 13.36],
  paknam: [100.59, 13.6],
  thonburi: [100.4905, 13.742], // Wichai Prasit fort, Thonburi
  north: [97.0, 22.0], // the Burmese main army going home (direction)
  ava: [95.98, 21.85],
} satisfies Record<string, [number, number]>;

export const VW = {
  region: bbox([[94.0, 11.5], [103.5, 23.0]]),
  plain: bbox([[100.25, 13.55], [100.9, 14.5]]),
  fleet: bbox([[100.2, 12.3], [102.3, 14.5]]),
  mouth: bbox([[100.4, 13.5], [100.7, 13.8]]),
  thonburi: bbox([[100.44, 13.69], [100.55, 13.79]]),
  river: bbox([[100.4, 13.65], [100.7, 14.4]]),
  camps: bbox([[100.51, 14.26], [100.62, 14.33]]),
  island: bbox([[100.5, 14.28], [100.64, 14.4]]),
};

export const ROUTE = {
  fleet: [PL.chan, [101.7, 12.4], [101.0, 12.55], [100.85, 12.95], PL.chonburi, [100.75, 13.45], PL.paknam] as [number, number][],
  mouth: [PL.paknam, [100.56, 13.66], [100.51, 13.7], PL.thonburi] as [number, number][],
  upriver: [PL.thonburi, [100.5, 13.86], [100.53, 14.0], [100.55, 14.15], [100.57, 14.25], PL.campE] as [number, number][],
  home: [PL.ayut, [99.0, 15.5], [97.8, 17.5], [96.6, 20.0], PL.ava] as [number, number][],
};
