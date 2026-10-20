// Places across the whole series, [lon, lat]. All approximate — ancient sites are often disputed or lost;
// say "โดยประมาณ" on screen. Thai names follow kit/glossary.md. Add places here as episodes need them.
type LL = [number, number];
export type Place = { at: LL; th: string; zh: string };

export const PLACES = {
  luoyang: { at: [112.45, 34.62], th: "ลกเอี๋ยง", zh: "洛陽" },
  changan: { at: [108.94, 34.27], th: "เตียงอัน", zh: "長安" },
  xuchang: { at: [113.85, 34.04], th: "ฮูโต๋", zh: "許都" },
  zhuo: { at: [115.97, 39.49], th: "โต๊ะกุ๋น", zh: "涿郡" }, // ? Thai name to verify
  julu: { at: [115.04, 37.22], th: "กิลก", zh: "鉅鹿" }, // Zhang Jiao's home base · ? Thai name to verify
  guangzong: { at: [115.15, 37.07], th: "กองจง", zh: "廣宗" }, // ? Thai name to verify
  ye: { at: [114.35, 36.32], th: "เงียบกุ๋น", zh: "鄴" }, // ? Thai name to verify
  guandu: { at: [114.0, 34.73], th: "กัวต๋อ", zh: "官渡" },
  hulao: { at: [113.2, 34.83], th: "ด่านเฮาโลก๋วน", zh: "虎牢關" },
  xiapi: { at: [117.95, 34.3], th: "แห้ฝือ", zh: "下邳" },
  pengcheng: { at: [117.18, 34.26], th: "ซีจิ๋ว", zh: "彭城" },
  shouchun: { at: [116.78, 32.56], th: "ซิ่วชุน", zh: "壽春" }, // ? Thai name to verify
  xiangyang: { at: [112.12, 32.01], th: "ซงหยง", zh: "襄陽" },
  fancheng: { at: [112.13, 32.05], th: "อ้วนเสีย", zh: "樊城" },
  jiangling: { at: [112.19, 30.35], th: "กังเหลง", zh: "江陵" },
  changban: { at: [111.8, 30.82], th: "เตียงปัน", zh: "長坂" },
  maicheng: { at: [111.78, 30.75], th: "เป๊กเสีย", zh: "麥城" },
  xiakou: { at: [114.28, 30.57], th: "แฮเค้า", zh: "夏口" },
  chibi: { at: [113.62, 29.86], th: "เซ็กเพ็ก", zh: "赤壁" },
  huarong: { at: [112.6, 29.55], th: "ฮัวหยง", zh: "華容" },
  chaisang: { at: [115.98, 29.7], th: "ซีสอง", zh: "柴桑" }, // ? Thai name to verify
  jianye: { at: [118.78, 32.06], th: "กังตั๋ง (เกียนเงียบ)", zh: "建業" }, // ? Thai name to verify
  ruxu: { at: [117.92, 31.31], th: "ยี่สู", zh: "濡須" },
  hefei: { at: [117.27, 31.86], th: "หับป๋า", zh: "合肥" },
  chengdu: { at: [104.07, 30.66], th: "เซงโต๋", zh: "成都" }, // ? Thai name to verify
  hanzhong: { at: [107.03, 33.07], th: "ฮันต๋ง", zh: "漢中" },
  dingjun: { at: [106.7, 33.15], th: "เขาเตงกุนสัน", zh: "定軍山" },
  tongguan: { at: [110.25, 34.55], th: "ด่านตงก๋วน", zh: "潼關" },
  baidi: { at: [109.57, 31.04], th: "เป๊กเต้เสีย", zh: "白帝城" },
  yiling: { at: [111.29, 30.7], th: "อิเหลง", zh: "夷陵" },
  jieting: { at: [105.8, 34.9], th: "เกเต๋ง", zh: "街亭" },
  chencang: { at: [107.14, 34.36], th: "ตันฉอง", zh: "陳倉" }, // ? Thai name to verify
  wuzhang: { at: [107.7, 34.3], th: "อู่จั้งหยวน", zh: "五丈原" }, // ? Thai name to verify
  qishan: { at: [105.7, 34.15], th: "เขากิสาน", zh: "祁山" },
  yinping: { at: [104.9, 32.9], th: "อิมเป๋ง", zh: "陰平" },
  jiange: { at: [105.53, 32.29], th: "ด่านเกียมโก๊ะ", zh: "劍閣" },
  nanzhong: { at: [102.7, 25.0], th: "ดินแดนใต้ (หนานจง)", zh: "南中" },
} satisfies Record<string, Place>;

export type PlaceKey = keyof typeof PLACES;
export const at = (k: PlaceKey): LL => PLACES[k].at as LL;
