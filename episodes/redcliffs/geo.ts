import { bbox, circleRegion, region } from "../../components/Region";

// All positions are approximate. The exact site of the Red Cliffs battle is still debated; we use the
// common identification near present-day Chibi, Hubei, on the south bank of the Yangtze.
export const P = {
  xuchang: [113.85, 34.04] as [number, number], // ฮูโต๋ — Cao Cao's capital
  xiangyang: [112.12, 32.01] as [number, number],
  changban: [111.85, 30.85] as [number, number],
  jiangling: [112.19, 30.35] as [number, number], // เกงจิ๋ว (seat of Jing province's south)
  xiakou: [114.28, 30.57] as [number, number], // Liu Bei's refuge
  chaisang: [115.98, 29.7] as [number, number], // Sun Quan's HQ
  jiangdong: [119.2, 30.6] as [number, number], // กังตั๋ง label spot
  redCliffs: [113.62, 29.86] as [number, number], // south bank
  wulin: [113.52, 29.93] as [number, number], // Cao's camp, north bank
  huarong: [112.6, 29.55] as [number, number],
  chengdu: [104.07, 30.66] as [number, number],
};

// Cameras' framing boxes [[west, south], [east, north]].
export const VIEW = {
  china: bbox([
    [99, 21.5],
    [124.5, 41.5],
  ]),
  mid: bbox([
    [108.5, 27.5],
    [120.5, 34.8],
  ]),
  battle: bbox([
    [113.3, 29.68],
    [113.9, 30.1],
  ]),
};

// Spheres of control, 208 CE (before the battle) and ~222 CE (three states). Rough — shown as "approximate".
export const WEI_208 = region([
  [97, 42], [124, 42], [122.5, 37.5], [120, 35], [119.5, 33.8], [117.5, 32.8], [116, 31.8], [114.6, 31.1],
  [113.4, 30.6], [112.6, 29.9], [111.4, 30.2], [110.6, 31.6], [108.6, 32.8], [106, 33.3], [104, 34.5], [101, 36], [97, 38],
]);
export const WU_208 = region([
  [114.4, 30.0], [115.6, 30.4], [117, 31.2], [118.6, 32.0], [120.2, 32.4], [122.5, 32.2], [122.5, 29], [120.5, 26.5],
  [118.5, 24.5], [116, 24.2], [114.6, 25.5], [113.9, 27.5], [114.0, 29.2],
]);
export const LIU_208 = circleRegion(P.xiakou, 0.55);

export const WEI_222 = region([
  [97, 42], [124, 42], [122.5, 37.5], [120, 35], [119.5, 33.8], [117.5, 32.8], [116, 31.8], [114.6, 31.4],
  [113.2, 31.4], [111.5, 32.0], [110, 32.6], [108, 33.4], [106, 33.6], [104.5, 34.5], [101, 36], [97, 38],
]);
export const SHU_222 = region([
  [97.5, 33], [101, 34.6], [104.5, 34.3], [106, 33.4], [108, 32.9], [110, 31.4], [109.6, 29.0], [108.5, 26.5],
  [106, 25.0], [103.5, 23.0], [100, 22.5], [98, 24.5], [97.5, 28],
]);
export const WU_222 = region([
  [109.6, 29.0], [110, 31.4], [111.5, 31.9], [113.2, 31.3], [114.6, 31.3], [116, 31.7], [117.5, 32.6], [119.5, 33.6],
  [120.8, 33.2], [122.5, 31.5], [122, 27], [118, 22], [111, 20.5], [108.5, 21.5], [106, 25.0], [108.5, 26.5],
]);

// The river at the battle runs SW→NE between these two points; boats are placed relative to it.
const A: [number, number] = [113.5, 29.835];
const B: [number, number] = [113.665, 29.945];
const NW: [number, number] = [-0.55, 0.83];
export const onRiver = (u: number, d: number): [number, number] => [
  A[0] + (B[0] - A[0]) * u + NW[0] * d,
  A[1] + (B[1] - A[1]) * u + NW[1] * d,
];
