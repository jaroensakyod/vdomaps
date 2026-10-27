import { bbox } from "../../../components/Region";

// Map pins for episode 1 (sources.md "พิกัดหมุด"). Kapilavastu, Devadaha and the Anoma crossing are approximate:
// the description says so, the screen does not.
export const PL = {
  lumbini: [83.2756, 27.4694],
  tilaura: [83.0549, 27.5772],
  piprahwa: [83.1278, 27.443],
  kapila: [83.09, 27.51],
  devadaha: [83.55, 27.68],
  hills: [83.6, 28.25],
  anoma: [83.13, 26.76],
  rajgir: [85.42, 25.0],
  uruvela: [85.0045, 24.6976],
  bodhgaya: [84.9913, 24.696],
  sarnath: [83.0251, 25.378],
} satisfies Record<string, [number, number]>;

export const VW = {
  asia: bbox([[62, 2], [108, 40]]),
  plain: bbox([[79.5, 23.5], [88.5, 30.2]]),
  foothills: bbox([[82.0, 26.6], [84.4, 28.6]]),
  sakya: bbox([[82.7, 27.2], [83.9, 27.9]]),
  lumbini: bbox([[83.2, 27.41], [83.35, 27.53]]),
  kapila: bbox([[82.96, 27.4], [83.25, 27.63]]),
  anoma: bbox([[82.6, 26.4], [83.9, 27.9]]),
  magadha: bbox([[82.5, 24.3], [86.0, 27.9]]),
  rajgir: bbox([[84.6, 24.4], [85.8, 25.35]]),
  uruvela: bbox([[84.93, 24.63], [85.06, 24.76]]),
  bodhi: bbox([[84.95, 24.665], [85.035, 24.73]]),
  sarnath: bbox([[82.6, 24.3], [85.7, 26.0]]),
  route: bbox([[82.4, 24.3], [86.0, 28.0]]),
};

// The gold route of the whole episode (approximate legs): palace → Anoma → Rajagaha → Uruvela.
export const LEG_ANOMA: [number, number][] = [PL.kapila, [83.25, 27.2], [83.2, 26.95], PL.anoma];
export const LEG_RAJGIR: [number, number][] = [PL.anoma, [83.6, 26.3], [84.4, 25.7], [85.0, 25.3], PL.rajgir];
export const LEG_URUVELA: [number, number][] = [PL.rajgir, [85.25, 24.85], PL.uruvela];
