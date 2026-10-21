import type { Feature, Polygon } from "geojson";
import { region } from "../../../components/Region";
import { SHU_222, WEI_208, WEI_222, WU_208, WU_222 } from "../../redcliffs/geo";
import { C } from "./theme";

// Spheres of control by year for the scoreboard map. Hand-drawn, rough, approximate (said in the description).
// Each era lists the sides in play; add eras as the batches reach them (200, 214, 263 still to come; 190 added for ep 7).
export type Side = { key: string; name: string; color: string; area: Feature<Polygon>; label: [number, number] };
export type Era = { year: number; title: string; sides: Side[] };

// Han China proper around 184 (without the far western protectorates).
const HAN = region([
  [98, 40.2], [104.5, 41.3], [111.5, 41.6], [117.5, 41.8], [121.5, 41.2], [124.5, 40.2], [122, 37.6], [119.6, 35.2],
  [121.2, 32.2], [121.8, 30], [120.8, 27.6], [119.4, 25.2], [116.5, 23], [112.3, 21.6], [108.6, 21.6], [106, 22.6],
  [103, 22.7], [100, 24.2], [98.6, 25.6], [99.6, 28.2], [102, 31], [100.6, 34.4], [98.2, 37.8],
]);

// 190: Dong Zhuo holds the capital region (Luoyang + Guanzhong); the allied warlords camp to the east.
const DONG_190 = region([[105.5, 36.5], [109.5, 36.2], [111.2, 35.6], [113.0, 35.2], [113.4, 34.6], [112.6, 33.8], [110.8, 33.4], [108.5, 33.2], [106.2, 33.6], [105.2, 34.6]]);
const ALLIES_190 = region([[113.4, 35.2], [114.5, 37.8], [115.5, 39.8], [118.5, 39.8], [119.6, 37.4], [119.8, 35], [118, 33.6], [115.5, 32.6], [113.2, 32.4], [112.4, 33.4], [113.4, 34.6]]);

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
      { key: "wei", name: "โจโฉ", color: C.wei, area: WEI_208, label: [112, 37] },
      { key: "wu", name: "ซุนกวน", color: C.wu, area: WU_208, label: [117.5, 28] },
    ],
  },
  222: {
    year: 222,
    title: "สามก๊ก",
    sides: [
      { key: "wei", name: "วุย", color: C.wei, area: WEI_222, label: [110.5, 38] },
      { key: "shu", name: "จ๊ก", color: C.shu, area: SHU_222, label: [102.8, 29.2] },
      { key: "wu", name: "ง่อ", color: C.wu, area: WU_222, label: [116.5, 27.5] },
    ],
  },
  280: { year: 280, title: "ราชวงศ์จิ้นรวมแผ่นดิน", sides: [{ key: "jin", name: "จิ้น", color: C.jin, area: HAN, label: [111, 33.5] }] },
};

// The eight provinces where the Yellow Turbans rose in 184 (青 徐 幽 冀 荊 揚 兗 豫), one approximate point each.
export const YELLOW_TURBAN_RISINGS: { at: [number, number]; th: string }[] = [
  { at: [115.2, 37.4], th: "กิจิ๋ว" }, // 冀 — Zhang Jiao's own province
  { at: [116.4, 39.6], th: "อิวจิ๋ว" }, // 幽
  { at: [118.6, 36.6], th: "เฉงจิ๋ว" }, // 青
  { at: [116.0, 35.4], th: "กุนจิ๋ว" }, // 兗
  { at: [117.6, 34.0], th: "ซีจิ๋ว" }, // 徐
  { at: [114.4, 33.4], th: "อิจิ๋ว" }, // 豫
  { at: [112.4, 31.0], th: "เกงจิ๋ว" }, // 荊
  { at: [117.6, 30.8], th: "เอียงจิ๋ว" }, // 揚
];
