import { bbox } from "../../../components/Region";
import { view } from "../kit/news";

// Hand-off views: chapter N starts on H[N] and ends holding H[N + 1], so the camera never jumps between chapters.
const BOX: Record<number, [[[number, number], [number, number]], number]> = {
  1: [[[-6, 33.5], [19, 47]], 0.04], // western Mediterranean (end of ch0)
  2: [[[-6, 35], [16, 45]], 0.1], // Rome, Carthage and Spain
  3: [[[-3, 36.8], [5, 43.6]], 0.2], // Spain, the Ebro, the Pyrenees (lifted: New Carthage clears the panel)
  4: [[[3.5, 43.3], [8.5, 46]], 0.1], // the Rhône and the Alps
  5: [[[5.8, 44.4], [7.9, 45.8]], 0.08], // the Alpine passes
  6: [[[6.5, 44], [11, 46]], 0.1], // northern Italy
  7: [[[7, 40.5], [17.5, 46]], 0.1], // Italy
  8: [[[-6, 33.5], [19, 47]], 0.04], // the whole western Mediterranean
};

export const H = (n: number, w: number, h: number) => {
  const [box, lift] = BOX[n];
  return view(bbox(box), w, h, 1, lift);
};
