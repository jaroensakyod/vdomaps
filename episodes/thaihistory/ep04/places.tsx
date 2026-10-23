import { bbox } from "../../../components/Region";

// Places and views for episode 4 (approximate points — said in the description).
export const PL = {
  thon: [100.4893, 13.7432], // old palace (Wang Doem), Thonburi
  watArun: [100.4889, 13.7437],
  fort: [100.4905, 13.7418], // Wichai Prasit fort, mouth of Khlong Bangkok Yai
  watPho: [100.493, 13.7465],
  pillar: [100.4941, 13.7526], // Bangkok city pillar
  bangkokNoi: [100.4893, 13.758],
  bangYiRuea: [100.4727, 13.7225], // Wat Intharam (Bang Yi Ruea)
  ramanya: [100.492, 13.772], // Khlong Ramanya (approximate)
  ayut: [100.566, 14.357],
  sanburi: [100.165, 15.07], // Sankhaburi
  korat: [102.1, 14.97],
  saraburi: [100.92, 14.52], // Tha Chao Sanuk (approximate)
  vientiane: [102.6, 17.97],
  donmot: [105.0, 15.33], // Don Mot Daeng (approximate)
  champasak: [105.87, 14.89],
  phnompenh: [104.92, 11.56],
  siemreap: [103.86, 13.36],
  kabin: [101.71, 13.98], // Dan Kabin / Kabin Buri
  nakhonsi: [99.96, 8.43],
  khunphanom: [99.83, 8.48], // Khao Khun Phanom (approximate)
  beijing: [116.4, 39.9],
  hue: [107.58, 16.46],
  saigon: [106.7, 10.78],
} satisfies Record<string, [number, number]>;

export const VW = {
  siam: bbox([[97.4, 6.6], [105.4, 19.6]]),
  region: bbox([[97.5, 8.0], [109.0, 20.5]]),
  mekong: bbox([[99.8, 13.2], [106.2, 18.6]]),
  east: bbox([[99.8, 10.6], [106.8, 15.6]]),
  river: bbox([[99.9, 13.55], [101.0, 15.25]]),
  plain: bbox([[100.15, 13.6], [100.85, 14.5]]),
  thon: bbox([[100.474, 13.728], [100.506, 13.768]]),
  thonWide: bbox([[100.45, 13.7], [100.53, 13.79]]),
  south: bbox([[97.8, 7.4], [102.4, 14.4]]),
  hook: bbox([[97.6, 7.6], [103.6, 15.2]]),
  asia: bbox([[92.0, 6.0], [120.0, 42.0]]),
};

// Routes (approximate).
export const R = {
  laoKorat: [[100.49, 13.74], [101.2, 14.6], [102.1, 14.97], [102.4, 16.4], [102.6, 17.97]] as [number, number][],
  laoChampasak: [[104.9, 11.9], [105.6, 13.6], [105.87, 14.89], [105.0, 16.4], [103.6, 17.5], [102.6, 17.97]] as [number, number][],
  emeraldBack: [[102.6, 17.97], [102.3, 16.6], [101.8, 15.4], [100.92, 14.52], [100.6, 14.1], [100.49, 13.76]] as [number, number][],
  cambodia: [[100.49, 13.74], [101.2, 13.9], [101.71, 13.98], [102.6, 13.7], [103.86, 13.36]] as [number, number][],
  cambodiaBack: [[103.86, 13.36], [102.6, 13.7], [101.71, 13.98], [101.0, 13.85], [100.5, 13.75]] as [number, number][],
  rebelsDown: [[100.566, 14.357], [100.55, 14.1], [100.51, 13.95], [100.5, 13.85], [100.492, 13.772]] as [number, number][],
  sanToAyut: [[100.165, 15.07], [100.3, 14.8], [100.5, 14.5], [100.566, 14.357]] as [number, number][],
  koratDown: [[102.1, 14.97], [101.4, 14.5], [100.9, 14.0], [100.55, 13.8], [100.4893, 13.758]] as [number, number][],
  china: [[100.49, 13.6], [102.5, 10.5], [107.5, 10.5], [112.0, 18.0], [114.0, 22.3], [116.4, 39.9]] as [number, number][],
  escape: [[100.49, 13.73], [100.4, 13.3], [100.1, 12.0], [99.9, 10.5], [99.96, 8.6], [99.83, 8.48]] as [number, number][],
};
