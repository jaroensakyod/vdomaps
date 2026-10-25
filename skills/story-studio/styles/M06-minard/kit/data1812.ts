// Charles Joseph Minard (1869), via the HistData R package (Minard.troops / cities / temp; M. Friendly, after
// L. Wilkinson). Main column = group 1; groups 2–3 are the northern detachments. 340,000 + 60,000 + 22,000 = 422,000 in;
// 4,000 + 6,000 = 10,000 back. Routes are Minard's (approximate: he shifted the retreat south to keep it apart).
export type Pt = [lon: number, lat: number, men: number];

export const ADVANCE: Pt[] = [
  [24, 54.9, 340000], [24.5, 55, 340000], [25.5, 54.5, 340000], [26, 54.7, 320000], [27, 54.8, 300000],
  [28, 54.9, 280000], [28.5, 55, 240000], [29, 55.1, 210000], [30, 55.2, 180000], [30.3, 55.3, 175000],
  [32, 54.8, 145000], [33.2, 54.9, 140000], [34.4, 55.5, 127100], [35.5, 55.4, 100000], [36, 55.5, 100000],
  [37.6, 55.8, 100000],
];
export const RETREAT: Pt[] = [
  [37.7, 55.7, 100000], [37.5, 55.7, 98000], [37, 55, 97000], [36.8, 55, 96000], [35.4, 55.3, 87000],
  [34.3, 55.2, 55000], [33.3, 54.8, 37000], [32, 54.6, 24000], [30.4, 54.4, 20000], [29.2, 54.3, 20000],
  [28.5, 54.2, 20000], [28.3, 54.3, 20000], [27.5, 54.5, 20000], [26.8, 54.3, 12000], [26.4, 54.4, 14000],
  [25, 54.4, 8000], [24.4, 54.4, 4000], [24.2, 54.4, 4000], [24.1, 54.4, 4000],
];
export const NORTH_A: Pt[] = [[24, 55.1, 60000], [24.5, 55.2, 60000], [25.5, 54.7, 60000], [26.6, 55.7, 40000], [27.4, 55.6, 33000], [28.7, 55.5, 33000]];
export const NORTH_R: Pt[] = [[28.7, 55.5, 33000], [29.2, 54.2, 30000], [28.5, 54.1, 30000], [28.3, 54.2, 28000]];
export const FAR_A: Pt[] = [[24, 55.2, 22000], [24.5, 55.3, 22000], [24.6, 55.8, 6000]];
export const FAR_R: Pt[] = [[24.6, 55.8, 6000], [24.2, 54.4, 6000], [24.1, 54.4, 6000]];

// Minard's spellings → modern English names.
export const CITY = {
  kovno: [24, 55], vilna: [25.3, 54.7], smorgoni: [26.4, 54.4], minsk: [27.6, 53.9], studianka: [28.5, 54.3],
  polotsk: [28.7, 55.5], vitebsk: [30.2, 55.3], orsha: [30.4, 54.5], smolensk: [32, 54.8], vyazma: [34.3, 55.2],
  borodino: [35.82, 55.52], mozhaysk: [36, 55.5], moscow: [37.6, 55.8], tarutino: [36.6, 55.3],
  maloyaroslavets: [36.5, 55], krasnoi: [31.4, 54.56], paris: [2.35, 48.86], toulon: [5.93, 43.12],
  tilsit: [21.88, 55.08], warsaw: [21.01, 52.23], petersburg: [30.32, 59.94], elba: [10.3, 42.78],
} satisfies Record<string, [number, number]>;

// Temperature on the retreat: [lon, °C, date] (Minard gives °Réaumur; °C = °R × 1.25).
export const TEMPS: [number, number, string][] = [
  [37.6, 0, "18 Oct"], [36, 0, "24 Oct"], [33.2, -11, "9 Nov"], [32, -26, "14 Nov"], [29.2, -14, ""],
  [28.5, -25, "28 Nov"], [27.2, -30, "1 Dec"], [26.7, -37, "6 Dec"], [25.3, -32, "7 Dec"],
];
