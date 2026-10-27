import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot, MapFlag } from "../ep05/beatsKit";
import { ApproxNote, Battle, Poll2 } from "../ep06/mapkit";
import { InquiryScene, OfficersScene, WallLookoutScene } from "../ep06/scenes";
import { AmbushRiverScene, DrillScene, FleetScene } from "../ep07/scenes";
import { CrownScene, RiverCampNightScene, RiverMouthScene, SubmitScene, UpriverScene } from "../ep08/scenes";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter9 } from "./beatsKit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { AmbushScene, FloodPlainScene, JunctionScene, MonkSiegeScene, PhitsanulokScene, RetreatScene, ScoutScene, TraitorGateScene, WoundScene } from "./scenes";

// Episode 9: กษัตริย์โดนยิงขา — the Phitsanulok campaign of 1768 and the fight at Koeichai. Seven chapters.

// ---------------- 0 · hook ----------------
const T0 = {
  setup: B.setup.start,
  phit: wp("setup", "พิษณุโลก", 0.4),
  shin: wp("setup", "หน้าแข้ง", 0.85),
  q: B.question.start,
  why: wp("question", "ทำไม", 0.7),
  go: B.go.start,
};
const HOOK_SHOTS = [4, 26];
export const e9c0: Chapter9 = {
  name: "กษัตริย์โดนยิงขา",
  from: 0,
  to: B.recap.start,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.koeichai, w, h, 0.95, 0.06) },
    { frame: T0.q, cam: view(VW.pho, w, h, 0.95, 0.06) },
    { frame: T0.go + 10, cam: view(VW.siam, w, h, 0.9, 0.06) },
  ],
  years: [[0, "2311"]],
  heads: [
    { f: T0.setup, tag: "พ.ศ. 2311", head: "ยกทัพไปตีพิษณุโลก", color: GOLD },
    { f: T0.shin, tag: "กลางทาง", head: "ถูกยิงที่หน้าแข้งซ้าย", color: RED },
    { f: T0.q, tag: "คำถามของวันนี้", head: "ไล่พม่าได้ แต่ทำไมแพ้?", color: GOLD },
  ],
  Map: () => (
    <>
      <Battle at={PL.koeichai} start={2} end={B.recap.start} color={RED} size={1.2} />
      <CityDot at={PL.phitsanulok} color={RED} r={13} start={T0.phit} />
      <PointLabel at={PL.koeichai} text="เกยไชย" start={T0.setup} color={RED} size={0.85} />
    </>
  ),
  Panels: () => (
    <>
      <AmbushScene id="e9amb0" anchor={PL.koeichai} start={0} end={T0.q + 14} shots={HOOK_SHOTS} />
      <RetreatScene id="e9ret0" anchor={PL.pho} start={T0.q} end={B.recap.start + 14} />
    </>
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    const o = interpolate(frame, [B.hook.end - 2, B.hook.end + 12], [1, 0], clamp);
    return o > 0 ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: "10%", textAlign: "center", opacity: o, fontFamily: "Kanit", color: "#fff", lineHeight: 1.2, textShadow: "0 6px 30px rgba(0,0,0,0.95)", transform: `scale(${1 + 0.06 * Math.max(0, 1 - frame / 8)})` }}>
        <div style={{ fontSize: 104, fontWeight: 900 }}>กษัตริย์<span style={{ color: "#ff6b5f" }}>โดนยิงขา</span></div>
        <div style={{ fontSize: 96, fontWeight: 900, color: GOLD }}>แล้วแพ้ได้ไง?</div>
      </div>
    ) : null;
  },
  sfx: [[0, SFX.hit, 0.5], [0, SFX.swell, 0.3], [T0.why, SFX.pop, 0.3], [T0.go - 6, SFX.whoosh, 0.3]],
  Audio: () => (
    <>
      {HOOK_SHOTS.map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.65} />)}
      <Bed id="jungle_rain" from={0} to={T0.q + 40} volume={0.16} />
      <Bed id="ship_creak" from={T0.q} to={B.recap.start + 40} volume={0.14} />
    </>
  ),
};

// ---------------- 1 · why Phitsanulok first ----------------
const T1 = {
  recap: B.recap.start,
  split: B.split.start,
  ruang: B.ruang.start,
  first: B.first.start,
  big: wp("first", "ใหญ่", 0.5),
  near: wp("first", "ใกล้", 0.65),
  road: wp("first", "เหนือ", 0.9),
};
const END1 = B.rain.start;
export const e9c1: Chapter9 = {
  name: "ทำไมพิษณุโลกก่อน",
  from: T1.recap,
  to: END1,
  cams: (w, h) => [
    { frame: T1.recap, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: T1.ruang, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: T1.first, cam: view(VW.siam, w, h, 0.92, 0.06) },
  ],
  years: [[T1.recap, "2311"]],
  heads: [
    { f: T1.recap, tag: "ตอนที่แล้ว", head: "กษัตริย์ที่ธนบุรี", color: GOLD },
    { f: T1.split, tag: "แผ่นดินยังแตก", head: "หัวเมืองตั้งตัวเป็นอิสระ", color: RED },
    { f: T1.ruang, tag: "เจ้าพระยาพิษณุโลก (เรือง)", head: "คุมหัวเมืองเหนือทั้งหมด", color: RED },
    { f: T1.first, tag: "ก๊กแรกที่จะตี", head: "พิษณุโลก", color: GOLD, chips: [{ text: "ใหญ่", f: T1.big }, { text: "ใกล้", f: T1.near }, { text: "คุมทางเหนือ", f: T1.road }] },
  ],
  Map: () => (
    <>
      <CityDot at={PL.thonburi} color={TAK_C} r={14} start={T1.recap} />
      <PointLabel at={PL.thonburi} text="ธนบุรี" start={T1.recap} color={TAK_C} size={0.85} />
      <CityDot at={PL.phitsanulok} color={RED} r={14} start={T1.split} />
      <PointLabel at={PL.phitsanulok} text="พิษณุโลก" start={T1.split} color={RED} size={0.9} />
      <CityDot at={PL.fang} color="#e8a030" r={11} start={T1.split + 20} />
      <PointLabel at={PL.fang} text="เจ้าพระฝาง" start={T1.split + 20} color="#e8a030" size={0.75} />
      <Arrow points={[PL.thonburi, PL.ayut, PL.chainat, PL.pho, PL.phitsanulok]} start={T1.first} end={T1.road + 20} color={TAK_C} width={10} variant="dashed" />
    </>
  ),
  Panels: () => (
    <>
      <CrownScene id="e9recap" anchor={PL.thonburi} start={T1.recap} end={T1.split + 14} />
      <SubmitScene id="e9split" anchor={PL.phitsanulok} start={T1.split} end={T1.ruang + 14} />
      <PhitsanulokScene id="e9phit" anchor={PL.phitsanulok} start={T1.ruang} end={T1.first + 14} />
      <DrillScene id="e9drill" anchor={PL.thonburi} start={T1.first} end={END1 + 14} />
    </>
  ),
  sfx: [[T1.big, SFX.pop, 0.25], [T1.near, SFX.pop, 0.25], [T1.road, SFX.pop, 0.25]],
  Audio: () => (
    <>
      <Hit id="gong" at={T1.recap + 6} volume={0.3} />
      <Bed id="wind" from={T1.recap} to={T1.first + 30} volume={0.14} />
      <Bed id="army_marching" from={T1.first} to={END1 + 30} volume={0.14} />
    </>
  ),
};

// ---------------- 2 · up the river in the flood ----------------
const T2 = {
  rain: B.rain.start,
  army: B.army.start,
  pho: B.pho.start,
  nan: B.nan.start,
};
const END2 = B.kosa.start;
export const e9c2: Chapter9 = {
  name: "ทัพเรือหน้าน้ำ",
  from: T2.rain,
  to: END2,
  cams: (w, h) => [
    { frame: T2.rain, cam: view(VW.plain, w, h, 0.95, 0.06) },
    { frame: T2.pho, cam: view(VW.pho, w, h, 0.95, 0.06) },
  ],
  years: [[T2.rain, "2311"]],
  heads: [
    { f: T2.rain, tag: "หน้าน้ำ", head: "ทุ่งกลายเป็นทะเล", color: GOLD },
    { f: T2.army, tag: "มีบันทึกว่า", head: "ทัพเรือทวนเจ้าพระยา", stat: "ราว 15,000", label: "คน", color: GOLD },
    { f: T2.pho, tag: "ปากน้ำโพ นครสวรรค์", head: "ปิง + น่าน = เจ้าพระยา", color: GOLD },
    { f: T2.nan, tag: "แยกเข้าแม่น้ำน่าน", head: "ทวนน้ำอีกหลายวัน", color: GOLD },
  ],
  Map: () => (
    <>
      <Arrow points={ROUTE.up} start={T2.army} end={T2.pho} color={TAK_C} width={12} />
      <PointLabel at={PL.ayut} text="กรุงเก่า" start={T2.army + 20} color={TAK_C} size={0.7} />
      <PointLabel at={PL.chainat} text="ชัยนาท" start={T2.army + 50} color={TAK_C} size={0.7} />
      <CityDot at={PL.pho} color={TAK_C} r={12} start={T2.pho} />
      <PointLabel at={PL.pho} text="ปากน้ำโพ" start={T2.pho} color={TAK_C} size={0.85} />
      <Arrow points={ROUTE.nan} start={T2.nan} end={T2.nan + 40} color={TAK_C} width={12} />
    </>
  ),
  Panels: () => (
    <>
      <FloodPlainScene id="e9flood" anchor={PL.ayut} start={T2.rain} end={T2.army + 14} />
      <UpriverScene id="e9up" anchor={PL.chainat} start={T2.army} end={T2.pho + 14} />
      <JunctionScene id="e9pho" anchor={PL.pho} start={T2.pho} end={T2.nan + 14} />
      <FloodPlainScene id="e9flood2" anchor={PL.pho} start={T2.nan} end={END2 + 14} />
    </>
  ),
  sfx: [[T2.pho, SFX.pop, 0.25]],
  Audio: () => (
    <>
      <Bed id="rain_heavy" from={T2.rain} to={T2.army + 30} volume={0.14} />
      <Bed id="ship_sailing" from={T2.army} to={END2 + 30} volume={0.16} />
    </>
  ),
};

// ---------------- 3 · Koeichai ----------------
const T3 = {
  kosa: B.kosa.start,
  local: B.local.start,
  koeichai: B.koeichai.start,
  three: wp("koeichai", "สาม", 0.75),
  boats: B.boats.start,
  flood: B.flood.start,
  shot: B.shot.start,
  hit: wp("shot", "หน้าแข้ง", 0.75),
  graze: B.graze.start,
  retreat: B.retreat.start,
};
const END3 = B.twist.start;
const AMBUSH = [T3.boats + 20, T3.boats + 46, T3.boats + 70];
export const e9c3: Chapter9 = {
  name: "ศึกเกยไชย",
  from: T3.kosa,
  to: END3,
  cams: (w, h) => [
    { frame: T3.kosa, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: T3.koeichai, cam: view(VW.koeichai, w, h, 0.95, 0.05) },
    { frame: T3.retreat, cam: view(VW.plain, w, h, 0.85, 0.06) },
  ],
  years: [[T3.kosa, "2311"]],
  heads: [
    { f: T3.kosa, tag: "ฝั่งพิษณุโลก", head: "หลวงโกษา (ยัง) ลงมาดักก่อน", color: RED },
    { f: T3.local, tag: "คนท้องถิ่น", head: "รู้จักทุกคุ้งน้ำ", color: RED },
    { f: T3.koeichai, tag: "ตำบลเกยไชย", head: "ตั้งรับ ห่างพิษณุโลก 3 วันทางเรือ", color: RED },
    { f: T3.boats, tag: "เรือเพรียวลำเล็ก", head: "ซุ่มยิงแล้วหายไป", color: RED },
    { f: T3.flood, tag: "หน้าน้ำ", head: "ไม่รู้ว่าศัตรูจะโผล่ตรงไหน", color: RED },
    { f: T3.shot, tag: "กระสุนนัดเดียว", head: "ถูกหน้าแข้งซ้ายพระเจ้าตาก", color: RED },
    { f: T3.graze, tag: "บางฉบับว่าแค่เฉียด", head: "แต่ทั้งทัพต้องหยุด", color: GOLD },
    { f: T3.retreat, tag: "ถอยกลับธนบุรี", head: "ก๊กแรกที่ตีไม่สำเร็จ", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={ROUTE.toPhit} start={T3.kosa} end={T3.kosa + 40} color={BURMA_C} width={10} variant="dashed" opacity={interpolate(frame, [T3.koeichai, T3.koeichai + 20], [1, 0.4], clamp)} />
        <CityDot at={PL.phitsanulok} color={RED} r={13} start={T3.kosa} />
        <PointLabel at={PL.phitsanulok} text="พิษณุโลก" start={T3.kosa} color={RED} size={0.85} />
        <CityDot at={PL.koeichai} color={RED} r={12} start={T3.koeichai} />
        <PointLabel at={PL.koeichai} text="เกยไชย (ประมาณ)" start={T3.koeichai} color={RED} size={0.8} />
        <CityDot at={PL.pho} color={TAK_C} r={11} start={T3.koeichai} />
        <Battle at={PL.koeichai} start={AMBUSH[0]} end={T3.retreat + 20} color={RED} size={1.2} />
        <Arrow points={ROUTE.back} start={T3.retreat + 10} end={T3.retreat + 60} color={TAK_C} width={11} variant="dashed" />
      </>
    );
  },
  Panels: () => (
    <>
      <ScoutScene id="e9scout" anchor={PL.koeichai} start={T3.kosa} end={T3.local + 14} />
      <ScoutScene id="e9scout2" anchor={PL.koeichai} start={T3.local} end={T3.koeichai + 14} />
      <AmbushRiverScene id="e9reeds" anchor={PL.koeichai} start={T3.koeichai} end={T3.boats + 14} />
      <AmbushScene id="e9amb" anchor={PL.koeichai} start={T3.boats} end={T3.flood + 14} shots={AMBUSH} />
      <AmbushRiverScene id="e9reeds2" anchor={PL.koeichai} start={T3.flood} end={T3.shot + 14} />
      <WoundScene id="e9wound" anchor={PL.koeichai} start={T3.shot} end={T3.graze + 14} hit={T3.hit} />
      <WoundScene id="e9wound2" anchor={PL.koeichai} start={T3.graze} end={T3.retreat + 14} hit={T3.graze - 200} />
      <RetreatScene id="e9ret" anchor={PL.pho} start={T3.retreat} end={END3 + 14} />
    </>
  ),
  Screen: () => <ApproxNote from={T3.koeichai} to={T3.retreat} />,
  sfx: [[T3.three, SFX.pop, 0.25]],
  Audio: () => (
    <>
      <Bed id="jungle_rain" from={T3.kosa} to={T3.boats + 20} volume={0.12} />
      <Bed id="firefight" from={T3.boats} to={T3.shot + 20} volume={0.14} />
      {AMBUSH.map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.55} />)}
      <Hit id="rifle_ww1" at={T3.hit} volume={0.6} />
      <Hit id="crowd_panic" at={T3.hit + 8} volume={0.25} />
      <Bed id="ship_creak" from={T3.graze} to={END3 + 30} volume={0.14} />
    </>
  ),
};

// ---------------- 4 · the winner does not last ----------------
const T4 = {
  twist: B.twist.start,
  crown: B.crown.start,
  died: B.died.start,
  brother: B.brother.start,
  fang: B.fang.start,
  famine: B.famine.start,
  open: wp("famine", "เปิด", 0.6),
  switch: B.switch.start,
};
const END4 = B.answer.start;
export const e9c4: Chapter9 = {
  name: "คนชนะก็ไม่รอด",
  from: T4.twist,
  to: END4,
  cams: (w, h) => [
    { frame: T4.twist, cam: view(VW.city, w, h, 0.9, 0.06) },
    { frame: T4.fang, cam: view(VW.fang, w, h, 0.9, 0.06) },
  ],
  years: [[T4.twist, "2311"]],
  heads: [
    { f: T4.twist, tag: "หักมุม", head: "คนชนะก็อยู่ได้ไม่นาน", color: GOLD },
    { f: T4.crown, tag: "เจ้าพระยาพิษณุโลก", head: "ตั้งตัวเป็นกษัตริย์", color: RED },
    { f: T4.died, tag: "ครองได้ไม่นาน", head: "ล้มป่วยและสิ้นชีวิต", color: RED, chips: [{ text: "7 วัน?", f: T4.died + 40 }, { text: "6 เดือน?", f: T4.died + 60 }] },
    { f: T4.brother, tag: "น้องชายขึ้นแทน", head: "พิษณุโลกอ่อนแอลง", color: RED },
    { f: T4.fang, tag: "เจ้าพระฝาง", head: "ยกมาล้อมพิษณุโลก", color: "#e8a030" },
    { f: T4.famine, tag: "ในเมืองอดอยาก", head: "คนในเปิดประตู เมืองแตก", color: "#e8a030" },
    { f: T4.switch, tag: "หลวงโกษา", head: "ไปเป็นทหารเจ้าพระฝาง", color: "#e8a030" },
  ],
  Map: () => (
    <>
      <CityDot at={PL.phitsanulok} color={RED} r={14} start={T4.twist} end={T4.open} />
      <PointLabel at={PL.phitsanulok} text="พิษณุโลก" start={T4.twist} color={RED} size={0.85} />
      <CityDot at={PL.fang} color="#e8a030" r={13} start={T4.fang} />
      <PointLabel at={PL.fang} text="สวางคบุรี (ฝาง)" start={T4.fang} color="#e8a030" size={0.8} />
      <Arrow points={ROUTE.fang} start={T4.fang + 10} end={T4.fang + 50} color="#e8a030" width={12} />
      <MapFlag at={PL.phitsanulok} color="#e8a030" start={T4.open} />
      <CityDot at={PL.phitsanulok} color="#e8a030" r={14} start={T4.open} />
    </>
  ),
  Panels: () => (
    <>
      <PhitsanulokScene id="e9phit2" anchor={PL.phitsanulok} start={T4.twist} end={T4.crown + 14} dusk />
      <CrownScene id="e9crown" anchor={PL.phitsanulok} start={T4.crown} end={T4.died + 14} />
      <SubmitScene id="e9sick" anchor={PL.phitsanulok} start={T4.died} end={T4.brother + 14} pale />
      <InquiryScene id="e9brother" anchor={PL.phitsanulok} start={T4.brother} end={T4.fang + 14} />
      <MonkSiegeScene id="e9siege" anchor={PL.phitsanulok} start={T4.fang} end={T4.famine + 14} />
      <TraitorGateScene id="e9gate" anchor={PL.phitsanulok} start={T4.famine} end={T4.switch + 14} open={T4.open} />
      <OfficersScene id="e9switch" anchor={PL.fang} start={T4.switch} end={END4 + 14} />
    </>
  ),
  sfx: [[T4.died + 40, SFX.pop, 0.25], [T4.died + 60, SFX.pop, 0.25], [T4.open, SFX.hit, 0.3]],
  Audio: () => (
    <>
      <Bed id="wind" from={T4.twist} to={T4.crown + 20} volume={0.12} />
      <Hit id="gong" at={T4.crown + 10} volume={0.35} />
      <Bed id="rain_light" from={T4.died} to={T4.fang + 20} volume={0.1} />
      <Bed id="army_march_crowd" from={T4.fang} to={T4.famine + 20} volume={0.14} />
      <Hit id="prison_door" at={T4.open} volume={0.4} />
      <Bed id="wind" from={T4.switch} to={END4 + 40} volume={0.12} />
    </>
  ),
};

// ---------------- 5 · the answer ----------------
const T5 = {
  answer: B.answer.start,
  field: wp("answer", "สนาม", 0.8),
  three: B.three.start,
  t1: wp("three", "หน้าน้ำ", 0.1),
  t2: wp("three", "ไม่คุ้น", 0.3),
  t3: wp("three", "ศัตรู", 0.5),
  back: B.back.start,
  two: wp("back", "สองปี", 0.25),
  poll: B.poll.start,
  a: wp("poll", "ถอย", 0.5),
  b: wp("poll", "สู้", 0.6),
  btn: wp("poll", "คอมเมนต์", 0.8),
};
export const E9_END = B.poll.end + 60;
export const e9c5: Chapter9 = {
  name: "คำตอบ",
  from: T5.answer,
  to: E9_END,
  cams: (w, h) => [
    { frame: T5.answer, cam: view(VW.koeichai, w, h, 0.9, 0.06) },
    { frame: T5.back, cam: view(VW.siam, w, h, 0.9, 0.06) },
  ],
  years: [[T5.answer, "2311"]],
  heads: [
    { f: T5.answer, tag: "คำตอบ", head: "แพ้ในสนามของอีกฝ่าย", color: GOLD },
    { f: T5.three, tag: "3 อย่าง", head: "เรือเล็กหยุดทัพใหญ่", color: GOLD, chips: [{ text: "หน้าน้ำ", f: T5.t1 }, { text: "ทางไม่คุ้น", f: T5.t2 }, { text: "คนท้องถิ่น", f: T5.t3 }] },
    { f: T5.back, tag: "ตอนหน้า", head: "กลับมาเหนืออีกครั้ง", color: GOLD },
    { f: T5.poll, tag: "", head: "" },
  ],
  Map: () => (
    <>
      <Battle at={PL.koeichai} start={T5.answer} end={T5.back} color={RED} size={1.1} />
      <CityDot at={PL.thonburi} color={TAK_C} r={13} start={T5.back} />
      <Arrow points={[PL.thonburi, PL.ayut, PL.chainat, PL.pho, PL.phitsanulok, PL.fang]} start={T5.two} end={T5.two + 50} color={TAK_C} width={11} variant="dashed" />
      <CityDot at={PL.fang} color="#e8a030" r={13} start={T5.back} />
      <PointLabel at={PL.fang} text="เจ้าพระฝาง" start={T5.back} color="#e8a030" size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      <WallLookoutScene id="e9look" anchor={PL.thonburi} start={T5.answer} end={T5.three + 14} />
      <RiverMouthScene id="e9three" anchor={PL.koeichai} start={T5.three} end={T5.back + 14} />
      <FleetScene id="e9back" anchor={PL.thonburi} start={T5.back} end={T5.poll + 14} dusk />
      <RiverCampNightScene id="e9poll" anchor={PL.koeichai} start={T5.poll} end={E9_END} />
    </>
  ),
  Screen: () => <Poll2 start={T5.poll} end={E9_END} a={T5.a} b={T5.b} button={T5.btn} title="ถ้าคุณเป็นพระเจ้าตาก ถูกยิงแล้วจะ…" optA="ถอยกลับ" optB="สู้ต่อ" />,
  sfx: [[T5.t1, SFX.pop, 0.25], [T5.t2, SFX.pop, 0.25], [T5.t3, SFX.pop, 0.25], [T5.a, SFX.pop, 0.3], [T5.b, SFX.pop, 0.3], [T5.btn, SFX.pop, 0.35]],
  Audio: () => (
    <>
      <Bed id="wind" from={T5.answer} to={T5.back + 20} volume={0.12} />
      <Bed id="ship_sailing" from={T5.back} to={T5.poll + 30} volume={0.14} />
      <Bed id="fire_crackle" from={T5.poll} to={E9_END} volume={0.12} />
    </>
  ),
};
