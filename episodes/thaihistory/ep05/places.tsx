import { bbox } from "../../../components/Region";

// Places and views for episode 5 (approximate points — said in the description).
export const PL = {
  bkk: [100.4913, 13.75], // Grand Palace
  palace: [100.4913, 13.75],
  frEmbassy: [100.5148, 13.7262], // French legation by the river, Bang Rak (approximate)
  paknam: [100.5856, 13.5458], // Phra Chulachomklao fort, Samut Prakan
  bar: [100.58, 13.42], // Chao Phraya bar / river mouth
  wako: [99.83, 11.7], // Wa Ko, Prachuap Khiri Khan
  ayut: [100.566, 14.357],
  korat: [102.1, 14.97],
  rangoon: [96.16, 16.8],
  mandalay: [96.08, 21.98],
  penang: [100.33, 5.42],
  singapore: [103.85, 1.29],
  batavia: [106.82, -6.13],
  calcutta: [88.36, 22.57],
  saigon: [106.7, 10.78],
  hanoi: [105.85, 21.03],
  hue: [107.58, 16.46],
  oudong: [104.74, 11.82],
  phnompenh: [104.92, 11.56],
  luangprabang: [102.14, 19.89],
  vientiane: [102.6, 17.97],
  champasak: [105.87, 14.89],
  sayaboury: [101.72, 19.25],
  khammouane: [104.8, 17.4], // middle Mekong clashes, 1893 (approximate)
  danSai: [101.15, 17.27],
  chanthaburi: [102.1, 12.61],
  trat: [102.51, 12.24],
  kohkong: [102.98, 11.62],
  kohkut: [102.56, 11.66],
  battambang: [103.2, 13.1],
  siemreap: [103.86, 13.36],
  angkor: [103.867, 13.4125],
  sisophon: [102.98, 13.59],
  kedah: [100.37, 6.12], // Alor Setar
  perlis: [100.2, 6.44], // Kangar
  kelantan: [102.24, 6.13], // Kota Bharu
  terengganu: [103.14, 5.33], // Kuala Terengganu
  ubon: [104.85, 15.24],
  phrae: [100.14, 18.14],
  london: [-0.12, 51.5],
  paris: [2.35, 48.86],
  petersburg: [30.31, 59.94],
  berlin: [13.4, 52.52],
  vienna: [16.37, 48.21],
  rome: [12.5, 41.9],
  suez: [32.55, 29.97],
  colombo: [79.86, 6.93],
  venice: [12.33, 45.44],
} satisfies Record<string, [number, number]>;

export const VW = {
  hook: bbox([[91.0, 0.0], [110.5, 25.0]]),
  sea: bbox([[92.0, 1.0], [110.0, 23.0]]),
  siam: bbox([[97.4, 5.6], [105.6, 20.6]]),
  burma: bbox([[92.0, 9.5], [101.5, 27.0]]),
  lowerBurma: bbox([[93.5, 14.0], [99.5, 20.0]]),
  malaya: bbox([[99.0, 0.8], [105.0, 7.6]]),
  north4: bbox([[99.6, 3.8], [104.0, 7.2]]),
  indochina: bbox([[101.5, 8.2], [110.0, 23.5]]),
  cochin: bbox([[103.5, 8.4], [108.5, 12.6]]),
  cambodia: bbox([[102.2, 10.2], [107.8, 14.8]]),
  mekong: bbox([[99.8, 13.2], [107.0, 22.6]]),
  midMekong: bbox([[101.6, 14.8], [106.6, 19.4]]),
  bkkGulf: bbox([[99.6, 12.2], [101.6, 14.2]]),
  mouth: bbox([[100.45, 13.38], [100.68, 13.78]]),
  river: bbox([[100.47, 13.52], [100.62, 13.78]]),
  bkk: bbox([[100.47, 13.70], [100.55, 13.78]]),
  wako: bbox([[98.8, 10.4], [101.4, 13.9]]),
  east: bbox([[101.2, 11.2], [104.6, 14.2]]),
  west1907: bbox([[101.6, 11.0], [105.0, 15.0]]),
  rail: bbox([[99.8, 13.4], [102.6, 15.6]]),
  asiaRoute: bbox([[85.0, -9.0], [110.0, 24.0]]),
  europeRoute: bbox([[-6.0, -2.0], [104.0, 62.0]]),
  europe: bbox([[-6.0, 38.0], [34.0, 62.0]]),
  south: bbox([[97.8, 3.6], [104.6, 14.0]]),
  northeast: bbox([[99.0, 13.6], [106.0, 19.6]]),
};

// Routes (approximate).
export const R = {
  wakoBack: [[99.83, 11.7], [100.0, 12.5], [100.3, 13.2], [100.55, 13.48], [100.49, 13.75]] as [number, number][],
  travel1871: [[100.55, 13.4], [101.0, 9.0], [103.85, 1.29], [106.82, -6.13]] as [number, number][],
  travel1872: [[103.85, 1.29], [98.0, 4.0], [88.36, 22.57]] as [number, number][],
  irrawaddy: [[96.16, 16.8], [95.5, 18.0], [94.9, 19.5], [94.8, 20.8], [96.08, 21.98]] as [number, number][],
  gunboats: [[100.62, 13.36], [100.585, 13.5], [100.575, 13.56], [100.535, 13.64], [100.535, 13.69], [100.514, 13.725]] as [number, number][],
  blockade: [[99.8, 12.6], [100.4, 12.8], [101.0, 12.85], [101.6, 12.6]] as [number, number][],
  railNorth: [[100.517, 13.755], [100.6, 14.05], [100.566, 14.357], [100.92, 14.52], [101.5, 14.6], [102.1, 14.97]] as [number, number][],
  railSouth: [[100.48, 13.76], [99.95, 13.6], [99.8, 12.6], [99.6, 11.0], [99.2, 9.8], [99.4, 8.8], [100.1, 7.6], [100.47, 7.0], [101.0, 6.6], [101.97, 6.03]] as [number, number][],
  europe1897: [[100.55, 13.4], [103.85, 1.29], [79.86, 6.93], [55.0, 13.0], [43.0, 13.0], [32.55, 29.97], [25.0, 34.5], [12.33, 45.44]] as [number, number][],
  tributeA: [[102.6, 17.97], [101.5, 15.6], [100.49, 13.75]] as [number, number][],
  tributeB: [[102.6, 17.97], [104.6, 17.6], [107.58, 16.46]] as [number, number][],
  koratEast: [[102.1, 14.97], [103.2, 15.6], [104.4, 16.2], [104.8, 17.4]] as [number, number][],
};
