import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { along, Anchor, Banner, C, Caravel, clamp, font, H, Heart, inkK, Lettering, Medallion, medallionProj, NauticalStar, Port, Rose, Route, Sheet, SheetDefs, ShipMark, smooth, Swallow, W } from "./kit/Flash";

// M33 tattoo flash: Vasco da Gama's first voyage, Lisbon → round the Cape → Calicut (1497–98), told as a sheet of
// tattoo flash pinned to a shop wall. The map is a flash medallion in a rope ring; each stop is a design that inks in
// outline first, then colour: a swallow for the departure, a nautical star at the Cape, a rose at Calicut, the
// caravel, and a heart for the few who came home. Facts: Britannica "Vasco da Gama". 18 s.
export const demo: StyleDemo = { id: "M33", name: "แผนที่ลายสัก", frames: 540, cover: 505, sizes: ["9x16"] };

const CX = 540;
const CY = 770;
const R = 306;
const proj = medallionProj(CX, CY, 5.0, [26, 4]);
const P = (lon: number, lat: number) => proj([lon, lat]) as [number, number];

// route waypoints (approximate): Lisbon, Cape Verde, the wide swing through the South Atlantic, the Cape,
// up the East African coast to Malindi, across to Calicut.
const LEG1 = smooth([P(-9.1, 38.7), P(-17, 26), P(-23.5, 15), P(-28, -2), P(-27, -22), P(-8, -36), P(10, -38), P(18.5, -35.2)]);
const LEG2 = smooth([P(18.5, -35.2), P(26, -35), P(34, -27), P(41, -15), P(41.5, -4), P(47, 2), P(60, 8), P(75.8, 11.2)]);
const LISBON = P(-9.1, 38.7);
const CAPE = P(18.5, -34.4);
const CALICUT = P(75.8, 11.2);

const LINES = [
  { f: 0, to: 140, t: "ปี 1497 วาสโก ดา กามา ออกจากลิสบอน", s: "เรือ 4 ลำ ลูกเรือราว 170 คน" },
  { f: 140, to: 280, t: "อ้อมแหลมกู๊ดโฮป ปลายทวีปแอฟริกา", s: "22 พฤศจิกายน 1497" },
  { f: 280, to: 410, t: "ถึงกาลิกัต ชายฝั่งอินเดีย", s: "20 พฤษภาคม 1498 · ทางเรือจากยุโรปสู่อินเดีย" },
  { f: 410, to: 560, t: "กลับถึงบ้านปี 1499", s: "เหลือลูกเรือราว 55 คน · ตัวเลขโดยประมาณ" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const leg1 = interpolate(frame, [96, 214], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const leg2 = interpolate(frame, [236, 330], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const ship = frame < 225 ? along(LEG1, leg1) : along(LEG2, leg2);
  const cap = LINES.find((l) => frame >= l.f && frame < l.to) ?? LINES[0];
  const capK = interpolate(frame, [cap.f, cap.f + 12, cap.to - 8, cap.to], [0, 1, 1, cap.to >= demo.frames ? 1 : 0], clamp);
  const bob = Math.sin(frame * 0.12) * 3;
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <Sfx src={SFX.swell} at={4} volume={0.22} />
      <Bed id="sea_rough" from={60} to={demo.frames} volume={0.07} />
      <Bed id="ship_creak" from={100} to={demo.frames} volume={0.06} />
      {[24, 70, 190, 300, 350, 420].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.22} />)}
      {[96, 218, 332, 392, 458].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.2} />)}
      <Hit id="ship_bell" at={332} volume={0.22} />
      <Sfx src={SFX.hit} at={458} volume={0.22} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <SheetDefs />
        <Sheet>
          <Banner x={540} y={104} w={430} h={64} text="M33 · แผนที่ลายสัก" size={32} fill={C.ink} color={C.cream} tail={C.green} bend={8} k={inkK(frame, 0, 24)} />
          <Lettering id="m33-title" x={540} y={262} text="ทางเรือสู่อินเดีย" size={108} k={inkK(frame, 6, 40)} />
          <text x={540} y={336} textAnchor="middle" fontFamily={font} fontSize={34} fill={C.ink} opacity={interpolate(frame, [26, 40], [0, 1], clamp)}>
            วาสโก ดา กามา · ค.ศ. 1497 – 1499
          </text>

          <Medallion cx={CX} cy={CY} r={R} proj={proj} k={inkK(frame, 22, 64)}>
            <Route id="m33-r1" pts={LEG1} k={leg1} />
            <Route id="m33-r2" pts={LEG2} k={leg2} />
            <Port x={LISBON[0]} y={LISBON[1]} k={interpolate(frame, [86, 100], [0, 1], clamp)} />
            <Port x={CAPE[0]} y={CAPE[1]} k={interpolate(frame, [208, 222], [0, 1], clamp)} />
            <Port x={CALICUT[0]} y={CALICUT[1]} k={interpolate(frame, [326, 340], [0, 1], clamp)} />
            {frame >= 96 ? <ShipMark x={ship.x} y={ship.y - 6 + bob} s={0.17} flip={ship.dx < -0.5} /> : null}
            <g opacity={interpolate(frame, [80, 96], [0, 1], clamp)}>
              <rect x={CX - 112} y={CY + R - 78} width={224} height={38} rx={5} fill={C.cream} stroke={C.ink} strokeWidth={3} />
              <text x={CX} y={CY + R - 51} textAnchor="middle" fontFamily={font} fontSize={22} fill={C.ink}>เส้นทางโดยประมาณ</text>
            </g>
          </Medallion>

          {/* the designs round the medallion */}
          <Swallow id="m33-sw" k={inkK(frame, 66, 46)} x={186} y={432} s={0.74} rot={-12} />
          <Banner x={158} y={556} w={196} h={62} text="ลิสบอน" size={36} rot={-6} k={interpolate(frame, [96, 118], [0, 1], clamp)} />
          <NauticalStar id="m33-st" k={inkK(frame, 186, 44)} x={156} y={1086} s={0.62} rot={-8} />
          <Banner x={322} y={1188} w={300} h={64} text="แหลมกู๊ดโฮป" size={34} rot={-4} tail={C.green} k={interpolate(frame, [218, 240], [0, 1], clamp)} />
          <Rose id="m33-ro" k={inkK(frame, 296, 44)} x={900} y={464} s={0.6} rot={10} />
          <Banner x={904} y={584} w={196} h={62} text="กาลิกัต" size={36} rot={5} k={interpolate(frame, [332, 354], [0, 1], clamp)} />

          <Caravel id="m33-sh" k={inkK(frame, 346, 50)} x={322} y={1520} s={0.82} />
          <Banner x={322} y={1676} w={380} h={70} text="4 ลำ · ราว 170 คน" size={36} tail={C.green} k={interpolate(frame, [392, 414], [0, 1], clamp)} />
          <Anchor id="m33-an" k={inkK(frame, 372, 44)} x={866} y={1172} s={0.46} rot={16} />
          <Heart id="m33-he" k={inkK(frame, 418, 44)} x={830} y={1430} s={0.98} />
          <Banner x={830} y={1446} w={300} h={70} text="กลับมา ~55" size={38} fill={C.cream} tail={C.yellow} rot={-5} k={interpolate(frame, [458, 480], [0, 1], clamp)} />
          <text x={830} y={1560} textAnchor="middle" fontFamily={font} fontSize={26} fill={C.ink} opacity={interpolate(frame, [470, 486], [0, 1], clamp)}>
            ค.ศ. 1499 · โดยประมาณ
          </text>

          {/* caption: lettered straight onto the sheet */}
          <g opacity={capK}>
            <path d="M120 1740 L960 1740" stroke={C.ink} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
            <text x={540} y={1800} textAnchor="middle" fontFamily={font} fontSize={46} fill={C.ink}>{cap.t}</text>
            <text x={540} y={1846} textAnchor="middle" fontFamily={font} fontSize={28} fill={C.redDark}>{cap.s}</text>
          </g>
        </Sheet>
      </svg>
      <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 17, color: "#8c7556" }}>
        ลายสักออกแบบใหม่ · ภาพประกอบ · แผนที่จาก Natural Earth
      </div>
    </AbsoluteFill>
  );
};
