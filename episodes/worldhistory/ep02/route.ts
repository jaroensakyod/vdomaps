// Hannibal's march, 218 BC: [lon, lat, men] at each of Polybius's counts (Histories 3.35, 3.56, 3.60).
// The route is approximate: the Rhône crossing and the Alpine pass are disputed; the band uses the
// Col de la Traversette only as a stand-in (the video says nobody knows the pass).
export type Pt = [lon: number, lat: number, men: number];

export const MARCH: Pt[] = [
  [-0.98, 37.6, 102000], // New Carthage: 90,000 foot + 12,000 horse at the Ebro (Polybius)
  [-0.28, 39.68, 102000], // Saguntum
  [0.5, 40.8, 102000], // Ebro crossing (approx.)
  [1.9, 41.6, 80000], // fighting north of the Ebro, Hanno left behind, men sent home
  [2.86, 42.47, 59000], // Pyrenees (Le Perthus, approx.): 50,000 + 9,000
  [3.0, 43.18, 59000], // Narbo
  [4.2, 43.7, 52000],
  [4.81, 44.14, 46000], // Rhône crossing (approx.): 38,000 + 8,000 leave it
  [5.2, 44.9, 45000],
  [5.9, 45.15, 42000], // Allobroges (approx.)
  [6.6, 44.9, 36000],
  [7.07, 44.71, 31000], // the pass (stand-in: Traversette)
  [7.69, 45.07, 26000], // Taurini / plain of the Po: 20,000 + 6,000
];

export const PLACE = {
  carthage: [10.32, 36.85], newcarthage: [-0.98, 37.6], saguntum: [-0.28, 39.68], ebro: [0.5, 40.8],
  pyrenees: [2.86, 42.47], narbo: [3.0, 43.18], massilia: [5.37, 43.3], rhone: [4.81, 44.14],
  traversette: [7.07, 44.71], clapier: [6.92, 45.17], montgenevre: [6.72, 44.93], montcenis: [6.9, 45.25],
  littlestbernard: [6.88, 45.68], turin: [7.69, 45.07], ticinus: [9.0, 45.2], trebia: [9.57, 44.99],
  arno: [10.8, 43.72], trasimene: [12.09, 43.2], cannae: [16.13, 41.31], rome: [12.48, 41.89],
  sicily: [14.0, 37.5], sardinia: [9.0, 40.0], corsica: [9.1, 42.15], zama: [9.45, 36.3], pisa: [10.4, 43.72],
} satisfies Record<string, [number, number]>;

// Five candidate passes, for the "which pass?" beat.
export const PASSES: [string, [number, number]][] = [
  ["Traversette", PLACE.traversette], ["Montgenèvre", PLACE.montgenevre], ["Mont Cenis", PLACE.montcenis],
  ["Clapier", PLACE.clapier], ["Little St Bernard", PLACE.littlestbernard],
];
