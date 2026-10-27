import { bbox } from "../../../components/Region";

// Places and camera boxes for ep 1. [lon, lat]. Positions marked approx in a comment are approximate on screen.
export const P = {
  sitka: [-135.33, 57.05],
  fairbanks: [-147.72, 64.84],
  anchorage: [-149.9, 61.22],
  silo: [-147.7, 64.8], // what-if, illustrative
  seattle: [-122.33, 47.61],
  vancouver: [-123.12, 49.28],
  borderMid: [-141, 63.5],
  bigDiomede: [-169.06, 65.78],
  littleDiomede: [-168.93, 65.755],
  capeDezhnev: [-169.65, 66.08],
  capePrince: [-168.08, 65.6],
  petropavlovsk: [158.65, 53.02],
  okhotsk: [143.3, 59.36],
  stPetersburg: [30.32, 59.94],
  moscow: [37.62, 55.75],
  kyakhta: [106.45, 50.35],
  beijing: [116.4, 39.9],
  kodiak: [-152.4, 57.79],
  unalaska: [-166.54, 53.89],
  fortRoss: [-123.24, 38.51],
  sanFrancisco: [-122.42, 37.77],
  washington: [-77.04, 38.9],
  london: [-0.13, 51.5],
  paris: [2.35, 48.86],
  sevastopol: [33.52, 44.6],
  victoria: [-123.37, 48.43],
  ottawa: [-75.7, 45.42],
  skagway: [-135.31, 59.46],
  dawson: [-139.43, 64.06], // the Klondike
  prudhoe: [-148.35, 70.25],
  valdez: [-146.35, 61.13],
  greatFalls: [-111.3, 47.5],
  edmonton: [-113.5, 53.5],
  whitehorse: [-135.06, 60.72],
  nome: [-165.4, 64.5],
  uelkal: [-178.7, 65.5],
  yakutsk: [129.7, 62.0],
  krasnoyarsk: [92.9, 56.0],
  attu: [173.2, 52.9],
  kiska: [177.5, 51.98],
  vladivostok: [131.9, 43.12],
  havana: [-82.37, 23.11],
  keyWest: [-81.78, 24.56],
  fortGreely: [-145.73, 63.98],
  dutchHarbor: [-166.54, 53.89],
  juneau: [-134.42, 58.3],
  newOrleans: [-90.07, 29.95],
} satisfies Record<string, [number, number]>;

// Trans-Alaska Pipeline, approximate line Prudhoe Bay → Valdez.
export const PIPELINE: [number, number][] = [[-148.35, 70.25], [-148.7, 69.0], [-149.5, 68.0], [-150.0, 67.0], [-149.7, 66.0], [-148.0, 65.3], [-147.72, 64.84], [-146.0, 64.0], [-145.7, 63.0], [-145.5, 62.0], [-146.35, 61.13]];
// Alaska–Siberia (ALSIB) ferry route, approximate.
export const ALSIB: [number, number][] = [P.greatFalls, P.edmonton, P.whitehorse, P.fairbanks, P.nome, P.uelkal, P.yakutsk, P.krasnoyarsk];
// Bering's 1741 voyage, approximate: Petropavlovsk → the Gulf of Alaska (Kayak Island).
export const BERING_1741: [number, number][] = [P.petropavlovsk, [170, 52], [-175, 53.5], [-160, 56.5], [-150, 59.0], [-144.4, 59.9]];

export const V = {
  globe: bbox([[-180, 30], [-110, 75]]),
  alaska: bbox([[-168, 54], [-132, 71.5]]),
  border: bbox([[-148, 57], [-128, 67]]),
  reach: bbox([[-178, 40], [-112, 74]]),
  bering: bbox([[-176, 62.5], [-162, 68]]),
  diomede: bbox([[-169.5, 65.6], [-168.5, 65.95]]),
  aleutians: bbox([[165, 50], [-150, 62]]),
  pacific: bbox([[100, 30], [-110, 70]]),
  russiaWide: bbox([[25, 40], [-130, 75]]),
  kamchatka: bbox([[152, 49], [166, 59]]),
  crimea: bbox([[26, 40], [42, 48]]),
  europe: bbox([[-10, 38], [45, 62]]),
  canada1860: bbox([[-140, 45], [-60, 70]]),
  america: bbox([[-170, 22], [-60, 72]]),
  usa: bbox([[-125, 24], [-66, 50]]),
  california: bbox([[-127, 35.5], [-119, 41]]),
  klondike: bbox([[-142, 57], [-122, 66]]),
  north: bbox([[-165, 60], [-135, 72]]),
  cuba: bbox([[-88, 20], [-76, 28.5]]),
  vlad: bbox([[126, 38], [140, 48]]),
};
