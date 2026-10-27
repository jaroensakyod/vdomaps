import { bbox } from "../../../components/Region";

// Episode 10 is drawn on Bellin / van der Schley's 1770 map of Siam (public domain). The map is not true to scale, so
// everything lives in the scan's own pixel space, carried as pseudo-degrees near the equator (Mercator ≈ flat there):
// om(px, py) = a point on the full 7181×7299 scan; the raster `bellin1770` is the crop x 1600–5400, y 1200–6000.
export const om = (x: number, y: number): [number, number] => [(x - 3400) / 500, -(y - 3300) / 500];

// Real places → the old map: affine fit to five towns the map names and places well (Siam/Ayutthaya, Louvo/Lopburi,
// Prabat, Tchainat, Laconseran/Nakhon Sawan); residuals 24–90 px, so these pins are approximate (± ~20 km).
const FX = [381.501, 54.032, -35613.898];
const FY = [0.188, -601.588, 12163.296];
export const geo = (lon: number, lat: number) => om(FX[0] * lon + FX[1] * lat + FX[2], FY[0] * lon + FY[1] * lat + FY[2]);

// Towns as printed on the 1770 map (pixel of the town sign). Identifications: Smithies, JSS 83 (1995).
export const OLD = {
  siam: om(3505, 3530), // SIAM = Ayutthaya
  louvo: om(3577, 3368), // Louvo = Lopburi
  prabat: om(3647, 3272), // Prabat = Phra Phutthabat
  tchainat: om(3433, 3035), // Tchainat = Chainat
  laconseran: om(3410, 2727), // Laconseran = Nakhon Sawan
  cambori: om(3096, 2754), // Cambori = Kanchanaburi, printed ~200 km too far north
  campengpet: om(3133, 2453), // Campengpet = Kamphaeng Phet
};

export const PL = {
  donSuphan: geo(100.0206, 14.6334), // Don Chedi monument, Suphan Buri (approximate on this map)
  donKan: geo(99.6817, 14.059), // Ban Don Chedi ruin, Nong Sarai, Phanom Thuan (approximate on this map)
  kanchanaburi: geo(99.53, 14.0), // where Kanchanaburi really is
  ayut: OLD.siam,
  pass: geo(98.4, 15.3), // Three Pagodas Pass (approximate on this map)
  phukhao: geo(100.553, 14.369), // Wat Phu Khao Thong, just north-west of the island
  suphanCity: geo(100.117, 14.474),
};

// The Burmese road (approximate): the pass, down the Khwae Noi to Kanchanaburi, across to Suphan, on to Ayutthaya.
export const ROUTE = {
  burma: [PL.pass, geo(98.75, 14.95), geo(99.1, 14.55), geo(99.4, 14.2), PL.kanchanaburi, geo(99.75, 14.3), geo(99.95, 14.5), PL.suphanCity, geo(100.35, 14.42), PL.ayut] as [number, number][],
  siam: [PL.ayut, geo(100.35, 14.45), PL.donSuphan] as [number, number][],
};

export const VW = {
  siam: bbox([om(2700, 2350), om(4100, 3950)]),
  route: bbox([om(2650, 2750), om(3700, 3900)]),
  both: bbox([om(3000, 3200), om(3600, 3900)]),
  suphan: bbox([om(3150, 3250), om(3550, 3550)]),
  kan: bbox([om(3000, 3550), om(3400, 3850)]),
  ayut: bbox([om(3330, 3380), om(3680, 3660)]),
  three: bbox([om(3050, 3250), om(3700, 3850)]),
  cambori: bbox([om(2950, 2600), om(3500, 3800)]),
};
