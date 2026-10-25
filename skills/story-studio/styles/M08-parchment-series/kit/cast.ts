import { C } from "./Parchment";

// Everyone who speaks or gets a character card: Thai name, Chinese name, faction colour, one-line role.
// The figure drawn for a person (card bust, Tableau) is LOOK[key] in kit/Scenes.tsx — keep the keys the same.
// No painted portraits: the card shows a code-drawn bust (see Cards.tsx).
export type Person = { name: string; zh: string; color: string; role?: string };

export const CAST: Record<string, Person> = {
  narrator: { name: "ผู้เล่า", zh: "", color: C.ink },
  liubei: { name: "เล่าปี่", zh: "劉備", color: C.shu, role: "เชื้อสายราชวงศ์ฮั่น คนขายรองเท้าฟาง" },
  guanyu: { name: "กวนอู", zh: "關羽", color: C.shu, role: "ชายหน้าแดง เคราดำยาว" },
  zhangfei: { name: "เตียวหุย", zh: "張飛", color: C.shu, role: "คนขายเนื้อ เสียงดังดุจฟ้าผ่า" },
  caocao: { name: "โจโฉ", zh: "曹操", color: C.wei, role: "ขุนพลหนุ่มจากเมืองหลวง" },
  yuanshao: { name: "อ้วนเสี้ยว", zh: "袁紹", color: C.yuan, role: "แม่ทัพใหญ่ของพันธมิตร" },
  dongzhuo: { name: "ตั๋งโต๊ะ", zh: "董卓", color: C.dong, role: "ขุนศึกชายแดนตะวันตก ยึดเมืองหลวง" },
  huaxiong: { name: "ฮัวหยง", zh: "華雄", color: C.dong, role: "ขุนพลของตั๋งโต๊ะ" },
  sunjian: { name: "ซุนเกี๋ยน", zh: "孫堅", color: C.wu, role: "ขุนพลจากแดนใต้" },
};

export const person = (key?: string): Person => (key && key in CAST ? CAST[key] : CAST.narrator);
