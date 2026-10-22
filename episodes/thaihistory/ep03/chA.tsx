import { useCurrentFrame, interpolate } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { AssaultScene, PeopleScene } from "../ep02/scenes";
import { clamp, GOLD, RED, view, type Chapter } from "../news/kit";
import { B, BURMA_C, CityDot, LANNA_C, MON_C, QING_C, SIAM_C, Stockades, wf, Zones } from "./beatsKit";
import { PL, VW } from "./places";
import { BurmaCourtScene, KaungtonScene, LannaScene, MarchScene, QingArmyScene, RefugeeScene, RoyalCampScene, TruceScene } from "./scenes";

// Chapters 1–2 of episode 3: Burma's war with China (recap → free), the spark (lanna → order).

const QING_1: [number, number][] = [[100.9, 22.2], [100.2, 21.7], [99.6, 21.3]];
const QING_2: [number, number][] = [[98.7, 24.9], [97.9, 24.5], [97.35, 24.3]];
const QING_3: [number, number][] = [[99.2, 24.0], [98.0, 23.2], [97.0, 22.5], [96.5, 22.05]];
const QING_4: [number, number][] = [[98.4, 25.6], [97.7, 24.9], [97.32, 24.4]];
const IRRAWADDY: [number, number][] = [[97.6, 25.3], [97.35, 24.6], [97.3, 24.4]];

const C1 = {
  recap: B.recap.start,
  why: B.why.start,
  burma: wf("why", "พม่า", 0.3),
  enemy: wf("why", "ศัตรู", 0.75),
  qing: B.qing.start,
  four: wf("qing", "สี่", 0.45),
  q3: B.q3.start,
  ava: wf("q3", "กรุง", 0.3),
  broke: wf("q3", "แตก", 0.55),
  q4: B.q4.start,
  river: wf("q4", "กอง", 0.7),
  azae: B.azae.start,
  name: wf("azae", "อะ", 0.88),
  kaungton: B.kaungton.start,
  sick: wf("kaungton", "โรค", 0.75),
  peace: B.peace.start,
  talks: wf("peace", "เจรจา", 0.2),
  back: wf("peace", "ถอย", 0.4),
  free: B.free.start,
  east: wf("free", "ตะวัน", 0.45),
  risen: wf("free", "ไทย", 0.9),
  end: B.lanna.start,
};

export const e3c1: Chapter = {
  name: "พม่ากับจีน",
  from: C1.recap,
  to: C1.end,
  cams: (w, h) => [
    { frame: C1.recap, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C1.burma - 6, cam: view(VW.siam, w, h, 0.66, 0.1) },
    { frame: C1.burma + 30, cam: view(VW.region, w, h, 0.7, 0.1) },
    { frame: C1.qing + 20, cam: view(VW.burma, w, h, 0.8, 0.08) },
    { frame: C1.free, cam: view(VW.burma, w, h, 0.8, 0.08) },
    { frame: C1.east + 20, cam: view(VW.region, w, h, 0.7, 0.1) },
  ],
  years: [[C1.recap, "2313"], [C1.qing, "2308–2312"], [C1.free, "2312–2317"]],
  heads: [
    { f: C1.recap, tag: "ตอนที่แล้ว", head: "รวม 5 ก๊กสำเร็จ", color: GOLD, portrait: "taksin_king" },
    { f: C1.why, tag: "ทำไมพม่าไม่กลับมา?", head: "ส่งมาได้แค่ทัพเล็ก ๆ", color: RED },
    { f: C1.enemy, tag: "เพราะพม่ามีศัตรู", head: "ที่ใหญ่กว่ามาก", color: QING_C },
    { f: C1.qing, tag: "พ.ศ. 2308–2312", head: "จีนบุกพม่า", stat: (f) => `${Math.min(4, Math.max(1, Math.ceil((f - C1.qing) / 18)))} ครั้ง`, color: QING_C },
    { f: C1.q3, tag: "ครั้งที่ 3", head: "บุกเกือบถึงกรุงอังวะ", color: QING_C, chips: [{ text: "ทัพจีนแตก", f: C1.broke }, { text: "แม่ทัพจีนเสียชีวิต", f: C1.broke + 40 }] },
    { f: C1.q4, tag: "ครั้งที่ 4", head: "ทัพที่ใหญ่ที่สุด", color: QING_C, chips: [{ text: "ทางบก", f: C1.q4 + 120 }, { text: "กองเรือตามอิรวดี", f: C1.river }] },
    { f: C1.azae, tag: "แม่ทัพผู้หยุดทัพจีน", head: "มหาสีหสุระ", color: RED, portrait: "azaewungyi", chips: [{ text: "อะแซหวุ่นกี้", f: C1.name }] },
    { f: C1.kaungton, tag: "ศึกกองตน", head: "ทัพจีนติดค่าย", color: RED, chips: [{ text: "โรคระบาด", f: C1.sick }] },
    { f: C1.peace, tag: "ทัพจีนขอสงบศึก", head: "แล้วถอยกลับไป", color: RED, portrait: "azaewungyi" },
    { f: C1.free, tag: "ศึกจีนจบ", head: "พม่าหันกลับมา", color: RED, portrait: "hsinbyushin" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const qingK = interpolate(frame, [C1.enemy, C1.enemy + 15], [0, 1], clamp);
    const burmaK = interpolate(frame, [C1.burma, C1.burma + 15], [0, 1], clamp);
    const siamK = frame < C1.burma ? 1 : interpolate(frame, [C1.burma, C1.burma + 20, C1.east, C1.east + 15], [1, 0.35, 0.35, 1], clamp);
    return (
      <>
        <Zones k={{ siam: siamK, burma: burmaK, qing: qingK, lanna: burmaK * 0.5 }} />
        {frame >= C1.qing && frame < C1.peace + 60 && (
          <g opacity={interpolate(frame, [C1.back, C1.back + 30], [1, 0.25], clamp)}>
            <Arrow points={QING_1} start={C1.qing + 4} end={C1.qing + 18} color={QING_C} width={14} />
            <Arrow points={QING_2} start={C1.qing + 22} end={C1.qing + 36} color={QING_C} width={14} />
            <g opacity={interpolate(frame, [C1.broke, C1.broke + 15], [1, 0.35], clamp)}>
              <Arrow points={QING_3} start={C1.qing + 40} end={C1.q3 + 40} color={QING_C} width={18} />
            </g>
            <Arrow points={QING_4} start={C1.q4} end={C1.q4 + 40} color={QING_C} width={22} />
            <Arrow points={IRRAWADDY} start={C1.river} end={C1.river + 30} color={QING_C} width={12} variant="dashed" />
          </g>
        )}
        {frame >= C1.ava && frame < C1.free && <CityDot at={PL.ava} color={BURMA_C} r={12} start={C1.ava} />}
        {frame >= C1.ava && frame < C1.free && <PointLabel at={PL.ava} text="อังวะ" start={C1.ava} color={RED} size={0.75} />}
        {frame >= C1.kaungton && frame < C1.free && (
          <>
            <Stockades center={PL.kaungton} n={8} r0={0.35} start={C1.kaungton + 10} step={3} />
            <PointLabel at={PL.kaungton} text="กองตน" start={C1.kaungton + 10} color={RED} size={0.75} />
          </>
        )}
        {frame >= C1.back && frame < C1.free + 30 && <Arrow points={[PL.kaungton, [98.0, 24.9], [98.8, 25.3]]} start={C1.back} end={C1.back + 30} color={QING_C} width={14} variant="dashed" />}
        {frame >= C1.east && <Arrow points={[[96.6, 21.6], [98.0, 19.6], [99.3, 17.6]]} start={C1.east} end={C1.east + 40} color={BURMA_C} width={14} variant="dashed" />}
        {frame >= C1.risen && <CityDot at={PL.thon} color={SIAM_C} r={14} start={C1.risen} />}
      </>
    );
  },
  Panels: () => (
    <>
      <RoyalCampScene id="e3c1recap" anchor={PL.thon} start={C1.recap} end={C1.why + 14} />
      <BurmaCourtScene id="e3c1why" anchor={PL.ava} start={C1.why} end={C1.qing + 14} />
      <QingArmyScene id="e3c1qing" anchor={[99.6, 23.0]} start={C1.qing} end={C1.q3 + 14} />
      <QingArmyScene id="e3c1q3" anchor={PL.ava} start={C1.q3} end={C1.q4 + 14} fallAt={C1.broke} />
      <QingArmyScene id="e3c1q4" anchor={PL.kaungton} start={C1.q4} end={C1.azae + 14} />
      <MarchScene id="e3c1azae" anchor={PL.kaungton} start={C1.azae} end={C1.kaungton + 14} />
      <KaungtonScene id="e3c1kt" anchor={PL.kaungton} start={C1.kaungton} end={C1.peace + 14} />
      <TruceScene id="e3c1peace" anchor={PL.kaungton} start={C1.peace} end={C1.free + 14} bowAt={C1.talks + 20} left="qing" />
      <BurmaCourtScene id="e3c1free" anchor={PL.ava} start={C1.free} end={C1.end + 14} />
    </>
  ),
  sfx: [
    [C1.recap, SFX.swell, 0.3],
    [C1.burma - 6, SFX.whoosh, 0.35],
    [C1.enemy, SFX.hit, 0.4],
    [C1.qing + 4, SFX.pop, 0.3],
    [C1.qing + 22, SFX.pop, 0.3],
    [C1.qing + 40, SFX.pop, 0.3],
    [C1.broke, SFX.hit, 0.5],
    [C1.q4, SFX.whoosh, 0.35],
    [C1.name, SFX.hit, 0.45],
    [C1.kaungton + 10, SFX.tick, 0.3],
    [C1.talks, SFX.swell, 0.25],
    [C1.east, SFX.whoosh, 0.35],
  ],
};

const C2 = {
  lanna: B.lanna.start,
  unhappy: wf("lanna", "แต่", 0.65),
  kawila: B.kawila.start,
  side: wf("kawila", "หัน", 0.7),
  cm: B.chiangmai.start,
  hit: wf("chiangmai", "เชียงใหม่", 0.55),
  fled: wf("chiangmai", "หนี", 0.85),
  base: B.base.start,
  now: wf("base", "ตอน", 0.7),
  mon: B.mon.start,
  rise: wf("mon", "ลุกฮือ", 0.35),
  flee: wf("mon", "อพยพ", 0.75),
  chase: B.chase.start,
  bk: wf("chase", "บางแก้ว", 0.5),
  bangkaeo: B.bangkaeo.start,
  days: wf("bangkaeo", "ล้อม", 0.5, 1),
  surrender: wf("bangkaeo", "ยอม", 0.85),
  twice: B.twice.start,
  lose2: wf("twice", "แพ้", 0.2),
  cannot: wf("twice", "พม่า", 0.65),
  order: B.order.start,
  best: wf("order", "แม่ทัพ", 0.45),
  end: B.march.start,
};
const MON_IN: [number, number][] = [[97.63, 16.53], [98.2, 15.6], [98.6, 14.6], [99.2, 14.0], [99.7, 13.75]];
const CHASE: [number, number][] = [[97.7, 16.3], [98.3, 15.3], [98.8, 14.4], [99.4, 13.9], [99.83, 13.72]];

export const e3c2: Chapter = {
  name: "ชนวนศึก",
  from: C2.lanna,
  to: C2.end,
  cams: (w, h) => [
    { frame: C2.lanna, cam: view(VW.region, w, h, 0.7, 0.1) },
    { frame: C2.lanna + 35, cam: view(VW.lanna, w, h, 0.9, 0.06) },
    { frame: C2.mon - 4, cam: view(VW.lanna, w, h, 0.9, 0.06) },
    { frame: C2.mon + 30, cam: view(VW.west, w, h, 0.9, 0.06) },
    { frame: C2.bangkaeo, cam: view(VW.west, w, h, 0.9, 0.06) },
    { frame: C2.bangkaeo + 30, cam: view(VW.ratchaburi, w, h, 0.9, 0.06) },
    { frame: C2.twice, cam: view(VW.ratchaburi, w, h, 0.9, 0.06) },
    { frame: C2.twice + 30, cam: view(VW.region, w, h, 0.7, 0.1) },
  ],
  years: [[C2.lanna, "2317–2318"]],
  heads: [
    { f: C2.lanna, tag: "ล้านนา", head: "ใต้อำนาจพม่า", stat: "200+ ปี", label: "เกือบตลอด", color: LANNA_C },
    { f: C2.unhappy, tag: "ขุนนางล้านนา", head: "เริ่มไม่พอใจพม่า", color: LANNA_C },
    { f: C2.kawila, tag: "ล้านนาเปลี่ยนข้าง", head: "พระยาจ่าบ้าน · กาวิละ", color: LANNA_C, portrait: "kawila", chips: [{ text: "เข้ากับฝ่ายไทย", f: C2.side }] },
    { f: C2.cm, tag: "ต้นปี 2318", head: "ตีเชียงใหม่ได้", color: GOLD, chips: [{ text: "ไทย + ล้านนา", f: C2.cm + 70 }, { text: "ข้าหลวงพม่าหนี", f: C2.fled }] },
    { f: C2.base, tag: "ฐานทัพพม่า", head: "กลายเป็นของไทย", color: GOLD },
    { f: C2.mon, tag: "ทางใต้ของพม่า", head: "ชาวมอญลุกฮือ", color: MON_C, chips: [{ text: "ถูกปราบ", f: C2.rise + 50 }, { text: "หนีเข้าไทยจำนวนมาก", f: C2.flee }] },
    { f: C2.chase, tag: "ทัพพม่าไล่ตาม", head: "ถึงบางแก้ว ราชบุรี", color: RED },
    { f: C2.bangkaeo, tag: "ศึกบางแก้ว", head: "ล้อมทุกทาง ตัดน้ำ ตัดเสบียง", color: GOLD, portrait: "taksin_king", stat: (f) => `${Math.round(interpolate(f, [C2.days, C2.surrender], [1, 47], clamp))} วัน`, label: "ล้อม" },
    { f: C2.surrender, tag: "ทัพพม่าที่บางแก้ว", head: "ยอมแพ้ทั้งค่าย", color: GOLD },
    { f: C2.twice, tag: "พม่าเสีย 2 ครั้ง", head: "ปล่อยไว้ไม่ได้", color: RED, chips: [{ text: "เชียงใหม่ ✕", f: C2.twice + 10 }, { text: "บางแก้ว ✕", f: C2.lose2 + 20 }] },
    { f: C2.order, tag: "พระเจ้ามังระ", head: "ส่งแม่ทัพที่เก่งที่สุด", color: RED, portrait: "hsinbyushin" },
    { f: C2.best + 40, tag: "แม่ทัพใหญ่", head: "อะแซหวุ่นกี้", color: RED, portrait: "azaewungyi" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const lannaGold = frame >= C2.hit;
    return (
      <>
        <Zones k={{ siam: 0.8, burma: 0.7, lanna: 1 }} colors={lannaGold ? { lanna: GOLD } : {}} />
        {frame >= C2.kawila && frame < C2.mon && (
          <>
            <PointLabel at={PL.lampang} text="ลำปาง" start={C2.kawila + 30} color={LANNA_C} size={0.7} />
            <PointLabel at={PL.chiangmai} text="เชียงใหม่" start={C2.kawila + 10} color={lannaGold ? GOLD : LANNA_C} size={0.75} />
          </>
        )}
        {frame >= C2.cm && frame < C2.mon && <Arrow points={[PL.plk, [99.9, 17.6], PL.lampang, PL.chiangmai]} start={C2.cm + 40} end={C2.hit} color={GOLD} width={18} />}
        {frame >= C2.fled && frame < C2.mon && <Arrow points={[PL.chiangmai, [98.4, 19.3], [97.9, 19.9]]} start={C2.fled} end={C2.fled + 25} color={RED} width={10} variant="dashed" />}
        {frame >= C2.base && frame < C2.mon && <Arrow points={[PL.chiangmai, PL.lampang, [99.7, 17.4], PL.plk]} start={C2.base + 10} end={C2.base + 40} color={RED} width={12} variant="dashed" opacity={frame < C2.now ? 0.8 : 0.25} />}
        {frame >= C2.mon && frame < C2.twice + 30 && (
          <>
            <PointLabel at={PL.martaban} text="เมาะตะมะ" start={C2.mon + 20} color={MON_C} size={0.7} />
            <Arrow points={MON_IN} start={C2.flee} end={C2.flee + 40} color={MON_C} width={14} />
          </>
        )}
        {frame >= C2.chase && frame < C2.twice + 30 && <Arrow points={CHASE} start={C2.chase} end={C2.bk + 10} color={RED} width={16} />}
        {frame >= C2.bk && frame < C2.twice + 30 && <PointLabel at={PL.bangkaeo} text="บางแก้ว" start={C2.bk} color={RED} size={0.75} />}
        {frame >= C2.bangkaeo && frame < C2.twice + 30 && (
          <>
            <Stockades center={PL.bangkaeo} n={9} r0={0.09} start={C2.bangkaeo + 10} step={3} color={SIAM_C} />
            <g opacity={interpolate(frame, [C2.surrender, C2.surrender + 10], [1, 0], clamp)}>
              <CityDot at={PL.bangkaeo} color={BURMA_C} r={10} />
            </g>
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <LannaScene id="e3c2lanna" anchor={PL.chiangmai} start={C2.lanna} end={C2.cm + 14} />
      <LannaScene id="e3c2cm" anchor={PL.chiangmai} start={C2.cm} end={C2.mon + 14} taken />
      <RefugeeScene id="e3c2mon" anchor={PL.martaban} start={C2.mon} end={C2.chase + 14} />
      <MarchScene id="e3c2chase" anchor={PL.bangkaeo} start={C2.chase} end={C2.bangkaeo + 14} />
      <AssaultScene id="e3c2bk" anchor={PL.bangkaeo} start={C2.bangkaeo} end={C2.twice + 14} breakAt={C2.surrender} wood />
      <BurmaCourtScene id="e3c2order" anchor={PL.ava} start={C2.twice} end={C2.end + 14} />
    </>
  ),
  sfx: [
    [C2.lanna, SFX.whoosh, 0.35],
    [C2.side, SFX.pop, 0.35],
    [C2.hit, SFX.hit, 0.5],
    [C2.fled, SFX.whoosh, 0.25],
    [C2.mon, SFX.whoosh, 0.35],
    [C2.chase, SFX.whoosh, 0.3],
    [C2.bangkaeo + 10, SFX.tick, 0.3],
    [C2.surrender, SFX.hit, 0.5],
    [C2.twice + 10, SFX.pop, 0.35],
    [C2.lose2 + 20, SFX.pop, 0.35],
    [C2.best + 40, SFX.hit, 0.45],
  ],
};
void PeopleScene;
