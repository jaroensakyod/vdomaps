import { loadFont } from "@remotion/google-fonts/Pridi";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, Card, CrownToken, Face, Ribbon, ribbonMid, Table, TableDefs, Tag, type Court } from "./kit/Cards";

// N17 card table: the Siamese revolution of 1688 as a hand of court cards on green baize. Cards are dealt, flip,
// silk ribbons show who backs whom, Phaulkon's card is turned down, Phetracha takes the crown token. 18 s.
export const demo: StyleDemo = { id: "N17", name: "โต๊ะไพ่", frames: 540, cover: 352, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

const SKIN = "#d9a273";
const PEOPLE: (Court & { at: [number, number]; rot: number })[] = [
  { name: "พระนารายณ์", rank: "ร", suit: "lotus", robe: C.red, trim: C.gold, hat: "crown", hatColor: C.gold, skin: SKIN, item: "lotus", at: [540, 600], rot: -2 },
  { name: "ฟอลคอน", rank: "ข", suit: "anchor", robe: C.navy, trim: "#8fa6d8", hat: "plume", hatColor: "#222", skin: "#ecc29a", item: "scroll", beard: true, at: [262, 990], rot: -6 },
  { name: "พระเพทราชา", rank: "ข", suit: "lotus", robe: "#2f5a3a", trim: C.gold, hat: "lomphok", hatColor: "#f4efe2", skin: SKIN, item: "goad", at: [818, 980], rot: 5 },
  { name: "เดฟาร์ฌ", rank: "ท", suit: "anchor", robe: "#2c3f8a", trim: C.red, hat: "tricorn", hatColor: "#1a1a1a", skin: "#ecc29a", item: "baton", at: [250, 1395], rot: 7 },
  { name: "หลวงสรศักดิ์", rank: "ท", suit: "lotus", robe: "#7a1620", trim: C.gold, hat: "spike", hatColor: "#3a2a1c", skin: SKIN, item: "sword", at: [830, 1385], rot: -4 },
];
const DECK: [number, number] = [540, 1790];
// the rest of the court, face down: a fan that opens at the start and closes as cards are dealt from it
const FAN = 9;
const DEAL = (i: number) => 24 + i * 13;
const FLIP = (i: number) => 104 + i * 16;
// ribbons: from, to, colour, start frame, tag
const TIES: { a: number; b: number; color: string; at: number; tag: string }[] = [
  { a: 0, b: 1, color: C.gold, at: 196, tag: "ไว้วางใจ" },
  { a: 1, b: 3, color: C.gold, at: 226, tag: "พันธมิตร" },
  { a: 2, b: 4, color: C.gold, at: 256, tag: "พ่อลูก" },
  { a: 2, b: 1, color: C.red, at: 300, tag: "ศัตรู" },
];
const CAPS: [number, string, string][] = [
  [0, "ราชสำนักอยุธยา พ.ศ. 2231", "ใครอยู่ข้างใคร"],
  [190, "ฟอลคอน ขุนนางชาวกรีก", "คนโปรดของพระนารายณ์ มีทหารฝรั่งเศสหนุน"],
  [290, "พระเพทราชา เจ้ากรมช้าง", "ขุนนางสยามที่ไม่ยอมรับฟอลคอน"],
  [384, "พ.ค. 2231 พระนารายณ์ประชวรหนัก", "ฟอลคอนถูกจับ และถูกประหาร 5 มิ.ย."],
  [462, "ส.ค. 2231 พระเพทราชาขึ้นครองราชย์", "ทหารฝรั่งเศสถอนตัวปลายปีนั้น"],
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const light = interpolate(frame, [0, 22], [0.2, 1], clamp) * (0.97 + 0.03 * Math.sin(frame * 0.17));
  // Narai falls ill (dims, pushed aside); Phaulkon's card turned down; Phetracha slides into the centre.
  const ill = interpolate(frame, [384, 420], [0, 1], clamp);
  const down = interpolate(frame, [420, 440], [1, 0], { ...clamp, easing: ease });
  const cut = interpolate(frame, [422, 446], [0, 1], { ...clamp, easing: ease });
  const rise = interpolate(frame, [462, 500], [0, 1], { ...clamp, easing: ease });
  const pos = (i: number): { x: number; y: number; rot: number; lift: number; flip: number; dim: number } => {
    const p = PEOPLE[i];
    const k = interpolate(frame, [DEAL(i), DEAL(i) + 18], [0, 1], { ...clamp, easing: ease });
    const f = interpolate(frame, [FLIP(i), FLIP(i) + 14], [0, 1], clamp);
    let x = DECK[0] + (p.at[0] - DECK[0]) * k;
    let y = DECK[1] + (p.at[1] - DECK[1]) * k;
    let rot = p.rot * k;
    let lift = (1 - k) * 0.9 + Math.sin(Math.PI * f) * 0.7;
    let flip = f;
    let dim = 0;
    if (i === 0) { x += -330 * rise; y += -40 * rise; rot += -16 * ill; dim = ill * 0.8; }
    if (i === 1) { flip = Math.min(f, down); lift += Math.sin(Math.PI * (1 - down)) * 0.6; dim = (1 - down) * 0.4; }
    if (i === 2) { x += (540 - p.at[0]) * rise; y += (640 - p.at[1]) * rise; rot -= p.rot * rise; lift += Math.sin(Math.PI * rise) * 0.8; }
    return { x, y, rot, lift, flip, dim };
  };
  const P = PEOPLE.map((_, i) => pos(i));
  const cap = [...CAPS].reverse().find((c) => frame >= c[0])!;
  const capK = interpolate(frame - cap[0], [0, 12], [0, 1], clamp);
  const fan = interpolate(frame, [4, 30], [0.2, 1], { ...clamp, easing: ease });
  const crown = interpolate(frame, [486, 516], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: "#041611" }}>
      <Bed id="rain_light" from={0} to={540} volume={0.12} />
      {PEOPLE.map((_, i) => <Sfx key={`d${i}`} src={SFX.whoosh} at={DEAL(i) - 4} volume={0.25} />)}
      {PEOPLE.map((_, i) => <Sfx key={`f${i}`} src={SFX.pop} at={FLIP(i) + 7} volume={0.3} />)}
      {TIES.map((t) => <Sfx key={t.at} src={SFX.tick} at={t.at} volume={0.3} />)}
      <Hit id="sword_draw" at={422} volume={0.35} />
      <Hit id="gong" at={500} volume={0.4} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <TableDefs />
        <Table light={light} />
        {/* the deck the cards are dealt from */}
        {Array.from({ length: FAN }, (_, j) => {
          const a = (j - (FAN - 1) / 2) * 9.5 * fan;
          const r = (a * Math.PI) / 180;
          return <Card key={j} x={DECK[0] + Math.sin(r) * 420} y={2210 - Math.cos(r) * 420} rot={a} flip={0}><g /></Card>;
        })}
        {PEOPLE.map((p, i) => {
          const q = P[i];
          return (
            <Card key={p.name} x={q.x} y={q.y} rot={q.rot} flip={q.flip} lift={q.lift} dim={q.dim}>
              <Face c={p} font={font} />
            </Card>
          );
        })}
        {TIES.map((t) => {
          const p = interpolate(frame, [t.at, t.at + 26], [0, 1], { ...clamp, easing: ease });
          const toPhaulkon = t.a === 1 || t.b === 1;
          const a = P[t.a], b = P[t.b];
          return <Ribbon key={t.at} a={[a.x, a.y]} b={[b.x, b.y]} color={t.color} p={p} cut={toPhaulkon ? cut : 0} sag={t.color === C.red ? -60 : 60} />;
        })}
        {TIES.map((t) => {
          const a = P[t.a], b = P[t.b];
          const k = interpolate(frame, [t.at + 20, t.at + 32], [0, 1], clamp) * (t.a === 1 || t.b === 1 ? 1 - cut : 1);
          return <Tag key={t.at} x={ribbonMid([a.x, a.y], [b.x, b.y], t.color === C.red ? -60 : 60)[0]} y={ribbonMid([a.x, a.y], [b.x, b.y], t.color === C.red ? -60 : 60)[1]} text={t.tag} color={t.color === C.red ? C.red : "#8a6418"} font={font} k={k} />;
        })}
        {crown > 0 && <CrownToken x={interpolate(crown, [0, 1], [200, 540])} y={interpolate(crown, [0, 1], [420, 430])} s={0.8 + 0.2 * crown} />}
      </svg>
      {/* kicker + title: gold-foil type stamped on the baize */}
      <div style={{ position: "absolute", top: 104, left: 0, right: 0, textAlign: "center", fontFamily: font, opacity: interpolate(frame, [6, 24], [0, 1], clamp) }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6, color: "#e9c46a" }}>N17 · โต๊ะไพ่</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1, color: "#f6d98c", textShadow: "0 2px 0 #5c4214, 0 6px 14px rgba(0,0,0,0.6)" }}>ปฏิวัติ 2231</div>
      </div>
      {/* caption slip */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 290, textAlign: "center", transform: `translateY(${(1 - capK) * 30}px) rotate(-1deg)`, opacity: capK, background: C.card, border: `3px solid ${C.ink}`, borderRadius: 10, padding: "16px 24px", boxShadow: "8px 14px 24px rgba(0,0,0,0.55)", fontFamily: font, color: C.ink }}>
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25 }}>{cap[1]}</div>
        <div style={{ fontSize: 25, fontWeight: 400, lineHeight: 1.3, color: "#4a3a2c" }}>{cap[2]}</div>
      </div>
      <div style={{ position: "absolute", right: 0, left: 0, top: 248, textAlign: "center", fontFamily: font, fontSize: 21, color: "#e9f2d8", opacity: 0.8 }}>ภาพประกอบ · ตัวละครวาดใหม่ ไม่ใช่ภาพเหมือน</div>
    </AbsoluteFill>
  );
};
