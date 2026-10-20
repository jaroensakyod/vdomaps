import { C } from "./theme";

// Everyone who speaks or gets a character card. `voice` keys live in ../voices.json (the narrator is "narrator").
// Names follow kit/glossary.md.
export type Person = { name: string; zh: string; color: string; role?: string };

export const CAST = {
  narrator: { name: "ผู้เล่า", zh: "", color: C.ink },
  zhangjiao: { name: "เตียวก๊ก", zh: "張角", color: C.yellow, role: "ผู้นำโจรโพกผ้าเหลือง" },
  liubei: { name: "เล่าปี่", zh: "劉備", color: C.shu, role: "เชื้อสายราชวงศ์ฮั่น คนขายรองเท้าฟาง" },
  guanyu: { name: "กวนอู", zh: "關羽", color: C.shu, role: "ชายหน้าแดง เคราดำยาว" },
  zhangfei: { name: "เตียวหุย", zh: "張飛", color: C.shu, role: "คนขายเนื้อ เสียงดังดุจฟ้าผ่า" },
  caocao: { name: "โจโฉ", zh: "曹操", color: C.wei, role: "ขุนพลหนุ่มจากเมืองหลวง" },
  hejin: { name: "โฮจิ๋น", zh: "何進", color: C.han, role: "แม่ทัพใหญ่ พี่ชายฮองเฮา" },
  zhangrang: { name: "เตียวเหยียง", zh: "張讓", color: C.han, role: "หัวหน้าสิบขันที" },
  yuanshao: { name: "อ้วนเสี้ยว", zh: "袁紹", color: C.yuan, role: "ขุนนางตระกูลใหญ่" },
  dongzhuo: { name: "ตั๋งโต๊ะ", zh: "董卓", color: C.dong, role: "ขุนศึกชายแดนตะวันตก" },
  lvbu: { name: "ลิโป้", zh: "呂布", color: C.lvbu, role: "ขุนพลที่เก่งที่สุดในแผ่นดิน" },
  dingyuan: { name: "เต๊งหงวน", zh: "丁原", color: C.han, role: "เจ้าเมือง ผู้มีพระคุณของลิโป้" },
  huangfusong: { name: "ฮองฮูสง", zh: "皇甫嵩", color: C.han, role: "แม่ทัพหลวงผู้ปราบโจรผ้าเหลือง" },
  seer: { name: "ผู้ทำนาย", zh: "許劭", color: C.ink, role: "นักดูคนชื่อดังแห่งยุค" },
  emperor: { name: "พระเจ้าเหี้ยนเต้", zh: "漢獻帝", color: C.han, role: "ฮ่องเต้องค์สุดท้ายของฮั่น" },
} satisfies Record<string, Person>;

export type CastKey = keyof typeof CAST;
export const person = (key?: string): Person => (key && key in CAST ? CAST[key as CastKey] : CAST.narrator);
