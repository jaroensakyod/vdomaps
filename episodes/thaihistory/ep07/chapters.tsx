import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { clamp, view } from "../news/kit";
import { CityDot, MapFlag } from "../ep05/beatsKit";
import { ApproxNote, Battle, Poll2 } from "../ep06/mapkit";
import { BannerDawnScene, GateRideScene, WaitCampScene, WhisperScene } from "../ep06/scenes";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter7 } from "./beatsKit";
import { HookTitle, QuoteCard, TenFold } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { AmbushRiverScene, AssaultScene, DawnTakenScene, DrillScene, FleeBoatScene, FleetScene, ForestMarchScene, GateChargeScene, LastMealScene, MonksScene, PortCityScene, PotsScene, RebelRoutScene, ShipyardScene, StandoffScene, TratJunksScene, WallGunScene, WatKaewScene } from "./scenes";

// Episode 7: ทุบหม้อข้าว ตีจันทบุรี (Feb–Oct 1767). Seven chapters, cues on the spoken word (wp).

// Night over the map, 0 → 1 → 0 between the given frames.
const Night = ({ a, b, k = 0.55 }: { a: number; b: number; k?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useMap();
  const d = interpolate(frame, [a - 20, a + 10, b - 10, b + 20], [0, 1, 1, 0], clamp);
  return d > 0 ? <rect width={width} height={height} fill="#06112b" opacity={k * d} /> : null;
};

// ---------------- 0 · hook ----------------
const T0 = {
  setup: B.setup.start,
  date: wp("setup", "มิถุนายน", 0.3),
  pots: wp("setup", "หม้อ", 0.85),
  q: B.question.start,
  why: wp("question", "ทำไม", 0.3),
  how: wp("question", "ยังไง", 0.85),
  go: B.go.start,
};
const HOOK_POTS = [6, 22, 38];
export const e7c0: Chapter7 = {
  name: "ทุบหม้อข้าว ตีจันทบุรี",
  from: 0,
  to: B.recap.start,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.chan, w, h, 0.95, 0.06) },
    { frame: T0.q, cam: view(VW.chan, w, h, 1.0, 0.06) },
    { frame: T0.go + 10, cam: view(VW.east, w, h, 0.95, 0.06) },
  ],
  years: [[0, "2310"]],
  heads: [
    { f: T0.setup, tag: "15 มิ.ย. 2310", head: "ก่อนตีเมืองจันทบุรี", color: GOLD },
    { f: T0.pots, tag: "คำสั่ง", head: "ทุบหม้อข้าวทิ้ง", color: RED },
    { f: T0.q, tag: "คำถามของวันนี้", head: "ทำไม และตีได้ยังไง?", color: GOLD, chips: [{ text: "ทำไมทุบ", f: T0.why }, { text: "ตีได้ยังไง", f: T0.how }] },
  ],
  Map: () => (
    <>
      <CityDot at={PL.chan} color={RED} r={16} start={0} />
      <PointLabel at={PL.chan} text="จันทบุรี" start={T0.date} color={RED} size={0.9} />
      <Battle at={PL.watkaew} start={4} end={B.recap.start} color={GOLD} />
    </>
  ),
  Panels: () => (
    <>
      <PotsScene id="e7pots0" anchor={PL.watkaew} start={0} end={T0.q + 14} hits={HOOK_POTS} />
      <StandoffScene id="e7stand0" anchor={PL.chan} start={T0.q} end={B.recap.start + 14} />
    </>
  ),
  Screen: () => <HookTitle end={B.hook.end} />,
  sfx: [[0, SFX.hit, 0.5], [0, SFX.swell, 0.3], [T0.why, SFX.pop, 0.3], [T0.how, SFX.pop, 0.3], [T0.go - 6, SFX.whoosh, 0.3]],
  Audio: () => (
    <>
      {HOOK_POTS.map((f) => <Hit key={f} id="wood_break" at={f} volume={0.7} />)}
      <Bed id="fire_crackle" from={0} to={T0.q + 40} volume={0.2} />
      <Hit id="war_drums" at={T0.pots} volume={0.4} />
      <Bed id="wind" from={T0.q} to={B.recap.start + 40} volume={0.16} />
    </>
  ),
};

// ---------------- 1 · Chanthaburi will not join ----------------
const T1 = {
  recap: B.recap.start,
  rayong: wp("recap", "ระยอง", 0.7),
  why: B.why.start,
  need: wp("why", "ข้าว", 0.7),
  chan: B.chan.start,
  name: wp("chan", "จันทบุรี", 0.4),
  ships: wp("chan", "สำเภา", 0.85),
  envoy: B.envoy.start,
  promise: wp("envoy", "รับปาก", 0.8),
  nocome: B.nocome.start,
  ten: wp("nocome", "สิบ", 0.2),
  rebels: B.rebels.start,
  flee: wp("rebels", "หนี", 0.8),
};
const END1 = B.monks.start;
export const e7c1: Chapter7 = {
  name: "จันทบุรีไม่ยอม",
  from: T1.recap,
  to: END1,
  cams: (w, h) => [
    { frame: T1.recap, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: T1.why, cam: view(VW.rayong, w, h, 0.95, 0.06) },
    { frame: T1.chan, cam: view(VW.east, w, h, 0.95, 0.06) },
    { frame: T1.envoy, cam: view(VW.east, w, h, 1.0, 0.06) },
  ],
  years: [[T1.recap, "2310"]],
  heads: [
    { f: T1.recap, tag: "ตอนที่แล้ว", head: "ฝ่าวงล้อม มาตั้งหลักที่ระยอง", stat: "500", label: "คน", color: GOLD },
    { f: T1.why, tag: "ระยองเล็กไป", head: "ต้องมีเมืองที่ใหญ่กว่า", color: GOLD, chips: [{ text: "ข้าว", f: T1.need }, { text: "เงิน", f: T1.need + 8 }, { text: "เรือ", f: T1.need + 16 }] },
    { f: T1.chan, tag: "เมืองท่าทางตะวันออก", head: "จันทบุรี", color: GOLD },
    { f: T1.envoy, tag: "ราว ก.พ. 2310", head: "ส่งคนไปชวนร่วมมือ", color: GOLD },
    { f: T1.nocome, tag: "รอ 10 วัน", head: "พระยาจันทบุรีไม่มา", color: RED },
    { f: T1.rebels, tag: "ขุนราม หมื่นซ่อง", head: "แพ้ แล้วหนีไปจันทบุรี", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={[PL.ayut, [101.0, 13.9], [100.95, 13.1], PL.rayong]} start={T1.recap} end={T1.rayong} color={TAK_C} width={10} variant="dashed" opacity={interpolate(frame, [T1.why, T1.why + 15], [1, 0], clamp)} />
        <CityDot at={PL.rayong} color={TAK_C} r={14} start={T1.recap} />
        <PointLabel at={PL.rayong} text="ระยอง" start={T1.rayong} color={TAK_C} size={0.85} />
        <CityDot at={PL.chan} color={RED} r={14} start={T1.name} />
        <PointLabel at={PL.chan} text="จันทบุรี" start={T1.name} color={RED} size={0.9} />
        <Arrow points={[PL.rayong, PL.klaeng, PL.chan]} start={T1.envoy} end={T1.envoy + 40} color={TAK_C} width={8} variant="dashed" opacity={interpolate(frame, [T1.nocome, T1.nocome + 15], [1, 0.3], clamp)} />
        <Arrow points={ROUTE.rebels} start={T1.flee - 10} end={T1.flee + 30} color={BURMA_C} width={9} variant="dashed" />
        <PointLabel at={PL.klaeng} text="แกลง" start={T1.rebels} color={BURMA_C} size={0.7} />
        <Battle at={PL.klaeng} start={T1.rebels + 10} end={END1} color={GOLD} size={0.9} />
      </>
    );
  },
  Panels: () => (
    <>
      <BannerDawnScene id="e7recap" anchor={PL.rayong} start={T1.recap} end={T1.why + 14} />
      <DrillScene id="e7drill0" anchor={PL.rayong} start={T1.why} end={T1.chan + 14} />
      <PortCityScene id="e7port" anchor={PL.chan} start={T1.chan} end={T1.envoy + 14} />
      <GateRideScene id="e7envoy" anchor={PL.chan} start={T1.envoy} end={T1.nocome + 14} />
      <WaitCampScene id="e7wait" anchor={PL.rayong} start={T1.nocome} end={T1.rebels + 14} />
      <RebelRoutScene id="e7rebels" anchor={PL.klaeng} start={T1.rebels} end={END1 + 14} hits={[T1.rebels + 30]} />
    </>
  ),
  sfx: [[T1.need, SFX.pop, 0.25], [T1.need + 8, SFX.pop, 0.25], [T1.need + 16, SFX.pop, 0.25], [T1.ten, SFX.tick, 0.3]],
  Audio: () => (
    <>
      <Bed id="wind" from={T1.recap} to={T1.chan + 30} volume={0.14} />
      <Bed id="sea_rough" from={T1.chan} to={T1.envoy + 30} volume={0.14} />
      <Hit id="ship_bell" at={T1.ships} volume={0.35} />
      <Bed id="horse_gallop" from={T1.envoy} to={T1.nocome + 20} volume={0.14} />
      <Bed id="fire_crackle" from={T1.nocome} to={T1.rebels + 30} volume={0.12} />
      <Bed id="sword_battle" from={T1.rebels} to={END1 + 30} volume={0.16} />
      <Hit id="sword_clash" at={T1.rebels + 30} volume={0.45} />
    </>
  ),
};

// ---------------- 2 · the trap ----------------
const T2 = {
  monks: B.monks.start,
  four: wp("monks", "สี่", 0.4),
  trap: B.trap.start,
  know: wp("trap", "กับดัก", 0.3),
  two: wp("trap", "สอง", 0.7),
  march: B.march.start,
  klaeng: wp("march", "แกลง", 0.6),
  lure: B.lure.start,
  river: wp("lure", "แม่น้ำ", 0.6),
  hide: wp("lure", "ซุ่ม", 0.9),
  avoid: B.avoid.start,
  tc: wp("avoid", "ท่าช้าง", 0.6),
  wk: wp("avoid", "วัดแก้ว", 0.9),
  demand: B.demand.start,
  out: wp("demand", "ออกมา", 0.5),
  hand: wp("demand", "ส่งตัว", 0.8),
  refuse: B.refuse.start,
};
const END2 = B.eat.start;
export const e7c2: Chapter7 = {
  name: "กับดักจันทบุรี",
  from: T2.monks,
  to: END2,
  cams: (w, h) => [
    { frame: T2.monks, cam: view(VW.east, w, h, 1.0, 0.06) },
    { frame: T2.lure, cam: view(VW.chan, w, h, 1.0, 0.06) },
    { frame: T2.avoid, cam: view(VW.city, w, h, 0.95, 0.06) },
  ],
  years: [[T2.monks, "2310"]],
  heads: [
    { f: T2.monks, tag: "เมษายน 2310", head: "พระสงฆ์มาเชิญไปจันทบุรี", stat: "4", label: "รูป", color: GOLD },
    { f: T2.trap, tag: "รู้ว่าเป็นกับดัก", head: "แต่ตอบรับ แล้วเตรียมทัพ", stat: "2", label: "เดือน", color: GOLD },
    { f: T2.march, tag: "มิถุนายน 2310", head: "เดินทัพไปจันทบุรี", color: GOLD },
    { f: T2.lure, tag: "คนนำทาง", head: "พาข้ามแม่น้ำ ไปหาคนซุ่ม", color: RED },
    { f: T2.avoid, tag: "ไม่ข้ามแม่น้ำ", head: "ตั้งทัพที่วัดแก้ว ท่าช้าง", color: GOLD },
    { f: T2.demand, tag: "ยื่นเงื่อนไข", head: "ออกมาหาเอง และส่งตัวคนร้าย", color: GOLD },
    { f: T2.refuse, tag: "จันทบุรีไม่ยอม", head: "เผชิญหน้ากันคนละฝั่งกำแพง", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.rayong} color={TAK_C} r={12} start={T2.monks} end={T2.lure} />
        <CityDot at={PL.chan} color={RED} r={14} start={T2.monks} />
        <PointLabel at={PL.chan} text="จันทบุรี" start={T2.monks} color={RED} size={0.85} />
        <Arrow points={[PL.chan, PL.klaeng, PL.rayong]} start={T2.monks + 10} end={T2.four + 30} color="#e8a030" width={8} variant="dashed" opacity={interpolate(frame, [T2.trap, T2.trap + 15], [1, 0], clamp)} />
        <Arrow points={ROUTE.toChan} start={T2.march} end={T2.klaeng + 40} color={TAK_C} width={12} />
        <Arrow points={ROUTE.lure} start={T2.river - 10} end={T2.river + 20} color={BURMA_C} width={9} variant="dashed" opacity={interpolate(frame, [T2.avoid, T2.avoid + 20], [1, 0.35], clamp)} />
        <Battle at={PL.ford} start={T2.hide} end={T2.avoid + 30} color={RED} size={0.8} />
        <PointLabel at={PL.ford} text="จุดซุ่ม (ประมาณ)" start={T2.hide} color={BURMA_C} size={0.7} />
        <CityDot at={PL.watkaew} color={TAK_C} r={12} start={T2.wk} />
        <PointLabel at={PL.watkaew} text="วัดแก้ว (ประมาณ)" start={T2.wk} color={TAK_C} size={0.75} />
        <PointLabel at={PL.thachang} text="ท่าช้าง" start={T2.tc} color={TAK_C} size={0.7} />
      </>
    );
  },
  Panels: () => (
    <>
      <MonksScene id="e7monks" anchor={PL.rayong} start={T2.monks} end={T2.trap + 14} />
      <DrillScene id="e7drill" anchor={PL.rayong} start={T2.trap} end={T2.march + 14} />
      <ForestMarchScene id="e7forest" anchor={PL.klaeng} start={T2.march} end={T2.lure + 14} />
      <AmbushRiverScene id="e7ambush" anchor={PL.ford} start={T2.lure} end={T2.avoid + 14} />
      <WatKaewScene id="e7watkaew" anchor={PL.watkaew} start={T2.avoid} end={T2.demand + 14} />
      <WhisperScene id="e7demand" anchor={PL.watkaew} start={T2.demand} end={T2.refuse + 14} />
      <StandoffScene id="e7stand" anchor={PL.chan} start={T2.refuse} end={END2 + 14} />
    </>
  ),
  Screen: () => <ApproxNote from={T2.lure} to={END2} />,
  sfx: [[T2.four, SFX.pop, 0.3], [T2.two, SFX.pop, 0.3], [T2.hide, SFX.hit, 0.3], [T2.wk, SFX.pop, 0.3]],
  Audio: () => (
    <>
      <Hit id="gong" at={T2.monks + 10} volume={0.3} />
      <Bed id="wind" from={T2.monks} to={T2.march + 30} volume={0.14} />
      <Bed id="army_marching" from={T2.march} to={T2.lure + 30} volume={0.16} />
      <Hit id="elephant" at={T2.klaeng} volume={0.35} />
      <Bed id="jungle_rain" from={T2.lure} to={T2.avoid + 30} volume={0.1} />
      <Bed id="fire_crackle" from={T2.avoid} to={END2 + 40} volume={0.14} />
    </>
  ),
};

// ---------------- 3 · smashing the pots ----------------
const T3 = {
  eat: B.eat.start,
  rice: wp("eat", "ข้าว", 0.7),
  smash: B.smash.start,
  pot: wp("smash", "หม้อ", 0.3),
  pour: wp("smash", "เท", 0.7),
  quote: B.quote.start,
  q1: wp("quote", "คืนนี้", 0.2),
  q2: wp("quote", "เช้า", 0.55),
  q3: wp("quote", "ตาย", 0.85),
  logic: B.logic.start,
  back: wp("logic", "ถอย", 0.35),
  city: wp("logic", "ในเมือง", 0.92),
};
const END3 = B.night.start;
const SMASH = [T3.pot, T3.pot + 18, T3.pot + 34];
export const e7c3: Chapter7 = {
  name: "ทุบหม้อข้าว",
  from: T3.eat,
  to: END3,
  cams: (w, h) => [{ frame: T3.eat, cam: view(VW.city, w, h, 1.05, 0.06) }],
  years: [[T3.eat, "2310"]],
  heads: [
    { f: T3.eat, tag: "เย็น 15 มิ.ย. 2310", head: "กินข้าวที่เหลือให้หมด", color: GOLD },
    { f: T3.smash, tag: "แล้ว…", head: "ทุบหม้อข้าว เทอาหารทิ้ง", color: RED },
    { f: T3.quote, tag: "", head: "" },
    { f: T3.logic, tag: "คำตอบข้อแรก", head: "ไม่มีข้าว = ไม่มีทางถอย", color: GOLD },
    { f: T3.city, tag: "ข้าวมื้อถัดไป", head: "อยู่ในเมือง", color: GOLD },
  ],
  Map: () => (
    <>
      <Night a={T3.eat} b={B.fled.end} k={0.45} />
      <CityDot at={PL.chan} color={RED} r={14} start={T3.eat} />
      <PointLabel at={PL.chan} text="จันทบุรี" start={T3.eat} color={RED} size={0.85} />
      <CityDot at={PL.watkaew} color={TAK_C} r={12} start={T3.eat} />
      <PointLabel at={PL.watkaew} text="ค่ายวัดแก้ว" start={T3.eat} color={TAK_C} size={0.75} />
    </>
  ),
  Panels: () => (
    <>
      <LastMealScene id="e7meal" anchor={PL.watkaew} start={T3.eat} end={T3.smash + 14} />
      <PotsScene id="e7pots" anchor={PL.watkaew} start={T3.smash} end={T3.quote + 14} hits={SMASH} />
      <WatKaewScene id="e7watkaew2" anchor={PL.watkaew} start={T3.logic} end={END3 + 14} />
    </>
  ),
  Screen: () => <QuoteCard start={T3.quote} end={T3.logic + 10} lines={[["“คืนนี้ตีเอาเมืองให้ได้”", T3.q1], ["“ไปหาข้าวกินเช้าในเมือง”", T3.q2], ["“ถ้าไม่ได้ ก็ให้ตายเสียด้วยกัน”", T3.q3]]} />,
  sfx: [[T3.back, SFX.hit, 0.3]],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T3.eat} to={END3 + 30} volume={0.18} />
      {SMASH.map((f) => <Hit key={f} id="wood_break" at={f} volume={0.75} />)}
      <Hit id="gong" at={T3.quote + 4} volume={0.3} />
      <Hit id="war_drums" at={T3.city} volume={0.35} />
    </>
  ),
};

// ---------------- 4 · the night attack ----------------
const T4 = {
  night: B.night.start,
  all: wp("night", "พร้อมกัน", 0.7),
  fire: B.fire.start,
  guns: wp("fire", "ปืน", 0.3),
  graze: wp("fire", "เฉียด", 0.6),
  mahout: B.mahout.start,
  no: wp("mahout", "ไม่ยอม", 0.6),
  gate: B.gate.start,
  hit: wp("gate", "ชน", 0.3),
  fell: B.fell.start,
  fled: B.fled.start,
  boat: wp("fled", "เรือ", 0.3),
  ht: wp("fled", "ฮาเตียน", 0.7),
};
const END4 = B.trat.start;
const SHOTS = [T4.all + 10, T4.all + 34, T4.guns + 4, T4.guns + 30];
export const e7c4: Chapter7 = {
  name: "คืนตีเมือง",
  from: T4.night,
  to: END4,
  cams: (w, h) => [
    { frame: T4.night, cam: view(VW.city, w, h, 1.15, 0.05) },
    { frame: T4.fled, cam: view(VW.gulf, w, h, 0.95, 0.06) },
  ],
  years: [[T4.night, "2310"]],
  heads: [
    { f: T4.night, tag: "ดึกคืน 15 มิ.ย.", head: "บุกเข้าหากำแพงพร้อมกัน", color: GOLD },
    { f: T4.fire, tag: "ปืนจากกำแพง", head: "กระสุนเฉียดพระยาตาก", color: RED },
    { f: T4.mahout, tag: "ควาญจะพาถอย", head: "สั่งให้ช้างเดินหน้า", color: GOLD },
    { f: T4.gate, tag: "ช้างชนประตู", head: "ประตูเมืองพัง", color: GOLD },
    { f: T4.fell, tag: "คืนเดียว", head: "จันทบุรีแตก", color: GOLD },
    { f: T4.fled, tag: "พระยาจันทบุรีหนี", head: "ไปพุทไธมาศ (ฮาเตียน)", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.chan} color={RED} r={14} start={T4.night} end={T4.fell} />
        <Battle at={PL.chan} start={T4.all} end={T4.fell + 10} color={RED} size={1.1} />
        <Arrow points={[PL.watkaew, PL.chan]} start={T4.all - 10} end={T4.all + 20} color={TAK_C} width={14} />
        <MapFlag at={PL.chan} color={GOLD} start={T4.fell} />
        <CityDot at={PL.chan} color={TAK_C} r={14} start={T4.fell} />
        <PointLabel at={PL.chan} text="จันทบุรี" start={T4.night} color={frame >= T4.fell ? TAK_C : RED} size={0.85} />
        <Arrow points={ROUTE.flee} start={T4.boat} end={T4.ht + 20} color={BURMA_C} width={9} variant="dashed" />
        <CityDot at={PL.hatien} color={BURMA_C} r={12} start={T4.ht} />
        <PointLabel at={PL.hatien} text="พุทไธมาศ (ฮาเตียน)" start={T4.ht} color={BURMA_C} size={0.8} />
      </>
    );
  },
  Panels: () => (
    <>
      <AssaultScene id="e7assault" anchor={PL.chan} start={T4.night} end={T4.fire + 14} shots={SHOTS.slice(0, 2)} />
      <WallGunScene id="e7wallgun" anchor={PL.chan} start={T4.fire} end={T4.mahout + 14} fire={T4.graze - 6} />
      <GateChargeScene id="e7gate" anchor={PL.chan} start={T4.mahout} end={T4.fell + 14} hit={T4.hit} />
      <DawnTakenScene id="e7dawn" anchor={PL.chan} start={T4.fell} end={T4.fled + 14} />
      <FleeBoatScene id="e7flee" anchor={PL.chan} start={T4.fled} end={END4 + 14} />
    </>
  ),
  sfx: [[T4.fell, SFX.hit, 0.35]],
  Audio: () => (
    <>
      <Bed id="firefight" from={T4.night} to={T4.gate + 20} volume={0.18} />
      {SHOTS.slice(0, 2).map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.55} />)}
      <Hit id="cannon_old" at={T4.graze - 6} volume={0.6} />
      <Hit id="elephant" at={T4.no} volume={0.55} />
      <Hit id="wood_break" at={T4.hit} volume={0.8} />
      <Hit id="battle_cry" at={T4.hit + 10} volume={0.45} />
      <Bed id="crowd_cheer" from={T4.fell} to={T4.fled + 20} volume={0.12} />
      <Bed id="sea_rough" from={T4.fled} to={END4 + 30} volume={0.14} />
    </>
  ),
};

// ---------------- 5 · Trat and the fleet ----------------
const T5 = {
  trat: B.trat.start,
  tt: wp("trat", "ตราด", 0.2),
  junk: wp("trat", "สำเภา", 0.55),
  junks: B.junks.start,
  half: wp("junks", "ครึ่ง", 0.2),
  chiam: wp("junks", "เจียม", 0.75),
  gain: B.gain.start,
  g1: wp("gain", "เมืองท่า", 0.45),
  yard: B.yard.start,
  sm: wp("yard", "เสม็ด", 0.35),
  nightw: wp("yard", "กลางคืน", 0.9),
  sail: B.sail.start,
  oct: wp("sail", "ตุลาคม", 0.15),
  five: wp("sail", "ห้าพัน", 0.85),
  ten: B.ten.start,
};
const END5 = B.answer.start;
const JUNK_SHOTS = [T5.junk + 6, T5.junks + 8, T5.junks + 34];
export const e7c5: Chapter7 = {
  name: "ตราดและกองเรือ",
  from: T5.trat,
  to: END5,
  cams: (w, h) => [
    { frame: T5.trat, cam: view(VW.trat, w, h, 0.95, 0.06) },
    { frame: T5.gain, cam: view(VW.chan, w, h, 0.9, 0.06) },
    { frame: T5.sail, cam: view(VW.fleet, w, h, 0.9, 0.06) },
  ],
  years: [[T5.trat, "2310"]],
  heads: [
    { f: T5.trat, tag: "ตราด", head: "เรือสำเภาจีนไม่ยอม", color: RED },
    { f: T5.junks, tag: "รบราวครึ่งวัน", head: "จีนเจียมสวามิภักดิ์", color: GOLD },
    { f: T5.gain, tag: "มีครบแล้ว", head: "เมืองท่า ข้าว เงิน เรือ", color: GOLD },
    { f: T5.yard, tag: "อู่บ้านเสม็ดงาม", head: "ต่อเรือรบ ทั้งวันทั้งคืน", stat: "3", label: "เดือน", color: GOLD },
    { f: T5.sail, tag: "ปลาย ต.ค. 2310", head: "กองเรือออกจากจันทบุรี", stat: "ราว 5,000", label: "คน", color: GOLD },
    { f: T5.ten, tag: "เทียบตอนออกจากอยุธยา", head: "มากขึ้นราว 10 เท่า", color: GOLD },
  ],
  Map: () => (
    <>
      <Arrow points={ROUTE.trat} start={T5.trat} end={T5.tt + 30} color={TAK_C} width={11} />
      <CityDot at={PL.trat} color={TAK_C} r={12} start={T5.tt} />
      <PointLabel at={PL.trat} text="ตราด" start={T5.tt} color={TAK_C} size={0.85} />
      <Battle at={PL.tratmouth} start={T5.half} end={T5.gain + 20} color={GOLD} />
      <CityDot at={PL.chan} color={TAK_C} r={14} start={T5.trat} />
      <PointLabel at={PL.chan} text="จันทบุรี" start={T5.gain} color={TAK_C} size={0.85} />
      <CityDot at={PL.samet} color={TAK_C} r={10} start={T5.sm} />
      <PointLabel at={PL.samet} text="อู่บ้านเสม็ดงาม (ประมาณ)" start={T5.sm} color={TAK_C} size={0.7} />
      <Arrow points={ROUTE.fleet.slice(0, 5)} start={T5.oct} end={T5.five + 20} color={TAK_C} width={12} variant="dashed" />
    </>
  ),
  Panels: () => (
    <>
      <TratJunksScene id="e7trat" anchor={PL.tratmouth} start={T5.trat} end={T5.gain + 14} shots={JUNK_SHOTS} />
      <PortCityScene id="e7port2" anchor={PL.chan} start={T5.gain} end={T5.yard + 14} />
      <ShipyardScene id="e7yard" anchor={PL.samet} start={T5.yard} end={T5.nightw + 14} />
      <ShipyardScene id="e7yard2" anchor={PL.samet} start={T5.nightw} end={T5.sail + 14} night />
      <FleetScene id="e7fleet" anchor={PL.samet} start={T5.sail} end={END5 + 14} />
    </>
  ),
  Screen: () => <TenFold start={T5.ten} end={END5} />,
  sfx: [[T5.g1, SFX.pop, 0.25], [T5.five, SFX.hit, 0.3]],
  Audio: () => (
    <>
      <Bed id="sea_rough" from={T5.trat} to={T5.gain + 30} volume={0.16} />
      {JUNK_SHOTS.map((f) => <Hit key={f} id="cannon_far" at={f} volume={0.55} />)}
      <Bed id="city_crowd" from={T5.gain} to={T5.yard + 20} volume={0.08} />
      <Bed id="wood_hit" from={T5.yard} to={T5.sail + 20} volume={0.12} />
      <Bed id="ship_sailing" from={T5.sail} to={END5 + 40} volume={0.18} />
      <Hit id="war_horn" at={T5.oct} volume={0.35} />
    </>
  ),
};

// ---------------- 6 · the answer ----------------
const T6 = {
  answer: B.answer.start,
  noback: wp("answer", "ถอย", 0.35),
  trapw: wp("answer", "กับดัก", 0.85),
  traps: B.traps.start,
  t1: wp("traps", "แม่น้ำ", 0.2),
  t2: wp("traps", "เข้าเมือง", 0.5),
  t3: wp("traps", "เวลา", 0.85),
  next: B.next.start,
  tb: wp("next", "ธนบุรี", 0.45),
  pst: wp("next", "โพธิ์", 0.65),
  poll: B.poll.start,
  a: wp("poll", "กล้า", 0.35),
  btn: wp("poll", "คอมเมนต์", 0.8),
};
export const E7_END = B.poll.end + 60;
export const e7c6: Chapter7 = {
  name: "คำตอบ",
  from: T6.answer,
  to: E7_END,
  cams: (w, h) => [
    { frame: T6.answer, cam: view(VW.chan, w, h, 0.95, 0.06) },
    { frame: T6.next, cam: view(VW.fleet, w, h, 0.95, 0.06) },
  ],
  years: [[T6.answer, "2310"]],
  heads: [
    { f: T6.answer, tag: "คำตอบ", head: "ทุบหม้อข้าว = ไม่มีทางถอย", color: GOLD },
    { f: T6.trapw, tag: "แต่ที่ชนะจริง", head: "ไม่หลงกับดักเลยสักครั้ง", color: GOLD },
    { f: T6.traps, tag: "3 ครั้ง", head: "ไม่ตามเกมจันทบุรี", color: GOLD, chips: [{ text: "ไม่ข้ามแม่น้ำ", f: T6.t1 }, { text: "ไม่เข้าเมือง", f: T6.t2 }, { text: "เลือกเวลาเอง", f: T6.t3 }] },
    { f: T6.next, tag: "ตอนหน้า", head: "ธนบุรี และค่ายโพธิ์สามต้น", color: GOLD },
    { f: T6.poll, tag: "", head: "" },
  ],
  Map: () => (
    <>
      <CityDot at={PL.chan} color={TAK_C} r={14} start={T6.answer} />
      <Battle at={PL.ford} start={T6.t1} end={T6.next} color={GOLD} size={0.8} />
      <Battle at={PL.chan} start={T6.t2} end={T6.next} color={GOLD} size={0.8} />
      <Battle at={PL.watkaew} start={T6.t3} end={T6.next} color={GOLD} size={0.8} />
      <Arrow points={ROUTE.fleet} start={T6.next} end={T6.tb + 20} color={TAK_C} width={12} variant="dashed" />
      <Arrow points={ROUTE.upriver} start={T6.pst - 10} end={T6.pst + 30} color={TAK_C} width={10} variant="dashed" />
      <CityDot at={PL.thonburi} color={GOLD} r={12} start={T6.tb} />
      <PointLabel at={PL.thonburi} text="ธนบุรี" start={T6.tb} color={GOLD} size={0.85} />
      <CityDot at={PL.phosamton} color={RED} r={12} start={T6.pst} />
      <PointLabel at={PL.phosamton} text="โพธิ์สามต้น" start={T6.pst} color={RED} size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      <GateChargeScene id="e7gate2" anchor={PL.chan} start={T6.answer} end={T6.traps + 14} hit={T6.noback + 20} />
      <AmbushRiverScene id="e7ambush2" anchor={PL.ford} start={T6.traps} end={T6.next + 14} />
      <FleetScene id="e7fleet2" anchor={PL.thonburi} start={T6.next} end={T6.poll + 14} dusk />
      <LastMealScene id="e7meal2" anchor={PL.watkaew} start={T6.poll} end={E7_END} />
    </>
  ),
  Screen: () => <Poll2 start={T6.poll} end={E7_END} a={T6.a} b={T6.a + 12} button={T6.btn} title="ถ้าคุณเป็นทหารคืนนั้น คุณจะ…" optA="ทุบหม้อ สู้" optB="เก็บข้าวไว้ก่อน" />,
  sfx: [[T6.t1, SFX.pop, 0.25], [T6.t2, SFX.pop, 0.25], [T6.t3, SFX.pop, 0.25], [T6.next - 6, SFX.whoosh, 0.25], [T6.a, SFX.pop, 0.3], [T6.btn, SFX.pop, 0.35]],
  Audio: () => (
    <>
      <Bed id="wind" from={T6.answer} to={T6.next + 30} volume={0.14} />
      <Hit id="wood_break" at={T6.noback + 20} volume={0.5} />
      <Bed id="ship_sailing" from={T6.next} to={T6.poll + 30} volume={0.16} />
      <Bed id="fire_crackle" from={T6.poll} to={E7_END} volume={0.14} />
    </>
  ),
};

