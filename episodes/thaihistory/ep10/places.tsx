import { bbox } from "../../../components/Region";

// Episode 10 is drawn on Bellin / van der Schley's 1770 map of Siam (public domain). The map is not true to scale, so
// everything lives in the scan's own pixel space, carried as pseudo-degrees near the equator (Mercator ≈ flat there):
// om(px, py) = a point on the full 7181×7299 scan; the raster `bellin1770` is the crop x 2000–4800, y 1700–4800.
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
};

export const VW = {
  siam: bbox([om(2700, 2350), om(4100, 3950)]),
  both: bbox([om(3000, 3200), om(3600, 3900)]),
  suphan: bbox([om(3150, 3250), om(3550, 3550)]),
};
