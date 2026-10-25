import type { Feature, Polygon } from "geojson";
import { region } from "../../../components/Region";
import { C } from "./Parchment";

// Spheres of control by year for the scoreboard map (Three Kingdoms China as the worked example).
// Hand-drawn, rough, approximate — say so on screen ("แนวโดยประมาณ") and in the description.
// For a new story: draw each side's area as a [lon, lat] ring (any winding; region() fixes it), one Era per moment.
export type Side = { key: string; name: string; color: string; area: Feature<Polygon>; label: [number, number] };
export type Era = { year: number; title: string; sides: Side[] };

// Han China proper around 184 (without the far western protectorates).
const HAN = region([
  [98, 40.2], [104.5, 41.3], [111.5, 41.6], [117.5, 41.8], [121.5, 41.2], [124.5, 40.2], [122, 37.6], [119.6, 35.2],
  [121.2, 32.2], [121.8, 30], [120.8, 27.6], [119.4, 25.2], [116.5, 23], [112.3, 21.6], [108.6, 21.6], [106, 22.6],
  [103, 22.7], [100, 24.2], [98.6, 25.6], [99.6, 28.2], [102, 31], [100.6, 34.4], [98.2, 37.8],
]);

// 190: Dong Zhuo holds the capital region; the allied warlords camp to the east.
const DONG_190 = region([[105.5, 36.5], [109.5, 36.2], [111.2, 35.6], [113.0, 35.2], [113.4, 34.6], [112.6, 33.8], [110.8, 33.4], [108.5, 33.2], [106.2, 33.6], [105.2, 34.6]]);
const ALLIES_190 = region([[113.4, 35.2], [114.5, 37.8], [115.5, 39.8], [118.5, 39.8], [119.6, 37.4], [119.8, 35], [118, 33.6], [115.5, 32.6], [113.2, 32.4], [112.4, 33.4], [113.4, 34.6]]);

const WEI_208 = region([
  [97, 42], [124, 42], [122.5, 37.5], [120, 35], [119.5, 33.8], [117.5, 32.8], [116, 31.8], [114.6, 31.1],
  [113.4, 30.6], [112.6, 29.9], [111.4, 30.2], [110.6, 31.6], [108.6, 32.8], [106, 33.3], [104, 34.5], [101, 36], [97, 38],
]);
const WU_208 = region([
  [114.4, 30.0], [115.6, 30.4], [117, 31.2], [118.6, 32.0], [120.2, 32.4], [122.5, 32.2], [122.5, 29], [120.5, 26.5],
  [118.5, 24.5], [116, 24.2], [114.6, 25.5], [113.9, 27.5], [114.0, 29.2],
]);

const WEI_222 = region([
  [97, 42], [124, 42], [122.5, 37.5], [120, 35], [119.5, 33.8], [117.5, 32.8], [116, 31.8], [114.6, 31.4],
  [113.2, 31.4], [111.5, 32.0], [110, 32.6], [108, 33.4], [106, 33.6], [104.5, 34.5], [101, 36], [97, 38],
]);
const SHU_222 = region([
  [97.5, 33], [101, 34.6], [104.5, 34.3], [106, 33.4], [108, 32.9], [110, 31.4], [109.6, 29.0], [108.5, 26.5],
  [106, 25.0], [103.5, 23.0], [100, 22.5], [98, 24.5], [97.5, 28],
]);
const WU_222 = region([
  [109.6, 29.0], [110, 31.4], [111.5, 31.9], [113.2, 31.3], [114.6, 31.3], [116, 31.7], [117.5, 32.6], [119.5, 33.6],
  [120.8, 33.2], [122.5, 31.5], [122, 27], [118, 22], [111, 20.5], [108.5, 21.5], [106, 25.0], [108.5, 26.5],
]);

export const ERAS: Record<number, Era> = {
  184: { year: 184, title: "ราชวงศ์ฮั่น", sides: [{ key: "han", name: "ฮั่น", color: C.han, area: HAN, label: [111, 33.5] }] },
  190: {
    year: 190,
    title: "พันธมิตรปราบตั๋งโต๊ะ",
    sides: [
      { key: "dong", name: "ตั๋งโต๊ะ", color: C.dong, area: DONG_190, label: [109.2, 34.6] },
      { key: "allies", name: "พันธมิตร", color: C.yuan, area: ALLIES_190, label: [116.4, 36.2] },
    ],
  },
  208: {
    year: 208,
    title: "ก่อนศึกผาแดง",
    sides: [
      { key: "wei", name: "โจโฉ", color: C.wei, area: WEI_208, label: [108.4, 37.4] },
      { key: "wu", name: "ซุนกวน", color: C.wu, area: WU_208, label: [117.5, 27.5] },
    ],
  },
  222: {
    year: 222,
    title: "สามก๊ก",
    sides: [
      { key: "wei", name: "วุย", color: C.wei, area: WEI_222, label: [108.4, 37.4] },
      { key: "shu", name: "จ๊ก", color: C.shu, area: SHU_222, label: [102.8, 29.2] },
      { key: "wu", name: "ง่อ", color: C.wu, area: WU_222, label: [116.5, 27.5] },
    ],
  },
  280: { year: 280, title: "ราชวงศ์จิ้นรวมแผ่นดิน", sides: [{ key: "jin", name: "จิ้น", color: C.jin, area: HAN, label: [111, 33.5] }] },
};
