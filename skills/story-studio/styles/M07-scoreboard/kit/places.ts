// Cities on the scoreboard, [lon, lat], with who holds each one in every era (Era.year → Side.key).
// All positions approximate — ancient sites are often disputed. Thai names follow the
// Chao Phraya Phra Khlang (Hon) translation of Sam Kok.
type LL = [number, number];
export type City = { at: LL; th: string; zh: string; held: Record<number, string> };

export const CITIES: Record<string, City> = {
  luoyang: { at: [112.45, 34.62], th: "ลกเอี๋ยง", zh: "洛陽", held: { 190: "dong", 208: "wei", 222: "wei" } },
  changan: { at: [108.94, 34.27], th: "เตียงอัน", zh: "長安", held: { 190: "dong", 208: "wei", 222: "wei" } },
  xuchang: { at: [113.85, 34.04], th: "ฮูโต๋", zh: "許都", held: { 190: "allies", 208: "wei", 222: "wei" } },
  ye: { at: [114.35, 36.32], th: "เงียบกุ๋น", zh: "鄴", held: { 190: "allies", 208: "wei", 222: "wei" } },
  xiangyang: { at: [112.12, 32.01], th: "ซงหยง", zh: "襄陽", held: { 208: "wei", 222: "wei" } },
  jiangling: { at: [112.19, 30.35], th: "กังเหลง", zh: "江陵", held: { 208: "wei", 222: "wu" } },
  chaisang: { at: [115.98, 29.7], th: "ซีสอง", zh: "柴桑", held: { 208: "wu", 222: "wu" } },
  jianye: { at: [118.78, 32.06], th: "เกียนเงียบ", zh: "建業", held: { 208: "wu", 222: "wu" } },
  chengdu: { at: [104.07, 30.66], th: "เซงโต๋", zh: "成都", held: { 222: "shu" } },
  hanzhong: { at: [107.03, 33.07], th: "ฮันต๋ง", zh: "漢中", held: { 208: "wei", 222: "shu" } },
};

export type CityKey = keyof typeof CITIES;
