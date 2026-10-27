import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot, MapFlag } from "../ep05/beatsKit";
import { Battle, DateCard, Poll2 } from "../ep06/mapkit";
import { BannerDawnScene, PhichaiCampScene } from "../ep06/scenes";
import { FleetScene, PortCityScene } from "../ep07/scenes";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter8 } from "./beatsKit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { CampFallsScene, CremationScene, CrownScene, DreamScene, FortAssaultScene, FortScene, MarchHomeScene, PortThonburiScene, RiverCampNightScene, RiverMouthScene, RuinsScene, SubmitScene, SukiCampScene, ThonginScene, TwoCampsScene, UpriverScene, VanguardScene } from "./scenes";

// Episode 8: ธนบุรีและค่ายโพธิ์สามต้น (Nov–Dec 1767). Seven chapters, cues on the spoken word (wp).

// ---------------- 0 · hook ----------------
const T0 = {
  setup: B.setup.start,
  last: wp("setup", "สุดท้าย", 0.75),
  q: B.question.start,
  five: wp("question", "ห้าร้อย", 0.35),
  seven: wp("question", "เจ็ด", 0.85),
  go: B.go.start,
};
export const e8c0: Chapter8 = {
  name: "7 เดือน กู้กรุงคืน",
  from: 0,
  to: B.recap.start,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.camps, w, h, 0.95, 0.06) },
    { frame: T0.q, cam: view(VW.island, w, h, 0.9, 0.06) },
    { frame: T0.go + 10, cam: view(VW.fleet, w, h, 0.95, 0.06) },
  ],
  years: [[0, "2310"]],
  heads: [
    { f: T0.setup, tag: "6 พ.ย. 2310", head: "ค่ายพม่าค่ายสุดท้ายแตก", color: GOLD },
    { f: T0.q, tag: "คำถามของวันนี้", head: "กลับมาไล่พม่าได้ยังไง?", color: GOLD, chips: [{ text: "500 คน", f: T0.five }, { text: "7 เดือน", f: T0.seven }] },
  ],
  Map: () => (
    <>
      <CityDot at={PL.ayut} color={RED} r={14} start={0} />
      <Battle at={PL.campW} start={2} end={B.recap.start} color={GOLD} size={1.2} />
      <PointLabel at={PL.phosamton} text="ค่ายโพธิ์สามต้น" start={T0.last} color={GOLD} size={0.85} />
    </>
  ),
  Panels: () => (
    <>
      <CampFallsScene id="e8fall0" anchor={PL.campW} start={0} end={T0.q + 14} />
      <RiverCampNightScene id="e8night0" anchor={PL.campE} start={T0.q} end={B.recap.start + 14} />
    </>
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    const o = interpolate(frame, [B.hook.end - 2, B.hook.end + 12], [1, 0], clamp);
    return o > 0 ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: "10%", textAlign: "center", opacity: o, fontFamily: "Kanit", color: "#fff", lineHeight: 1.15, textShadow: "0 6px 30px rgba(0,0,0,0.95)", transform: `scale(${1 + 0.06 * Math.max(0, 1 - frame / 8)})` }}>
        <div style={{ fontSize: 160, fontWeight: 900, color: GOLD }}>7 เดือน</div>
        <div style={{ fontSize: 96, fontWeight: 900 }}>กู้กรุงคืน<span style={{ color: "#ff6b5f" }}>ได้ไง?</span></div>
      </div>
    ) : null;
  },
  sfx: [[0, SFX.hit, 0.55], [0, SFX.swell, 0.3], [T0.five, SFX.pop, 0.3], [T0.seven, SFX.pop, 0.3], [T0.go - 6, SFX.whoosh, 0.3]],
  Audio: () => (
    <>
      <Hit id="battle_cry" at={2} volume={0.5} />
      <Bed id="fire_big" from={0} to={T0.q + 40} volume={0.18} />
      <Bed id="wind" from={T0.q} to={B.recap.start + 40} volume={0.14} />
    </>
  ),
};

// ---------------- 1 · what the Burmese left behind ----------------
const T1 = {
  recap: B.recap.start,
  gone: B.gone.start,
  china: wp("gone", "จีน", 0.9),
  suki: B.suki.start,
  pst: wp("suki", "โพธิ์", 0.3),
  name: wp("suki", "สุกี้", 0.75),
  thongin: B.thongin.start,
  tb: wp("thongin", "ธนบุรี", 0.15),
  ti: wp("thongin", "ทองอิน", 0.55),
};
const END1 = B.coast.start;
export const e8c1: Chapter8 = {
  name: "พม่าเหลืออะไรไว้",
  from: T1.recap,
  to: END1,
  cams: (w, h) => [
    { frame: T1.recap, cam: view(VW.fleet, w, h, 0.95, 0.06) },
    { frame: T1.gone, cam: view(VW.region, w, h, 0.9, 0.06) },
    { frame: T1.suki, cam: view(VW.plain, w, h, 0.9, 0.06) },
  ],
  years: [[T1.recap, "2310"]],
  heads: [
    { f: T1.recap, tag: "ตอนที่แล้ว", head: "กองเรือออกจากจันทบุรี", stat: "ราว 5,000", label: "คน", color: GOLD },
    { f: T1.gone, tag: "หลังกรุงแตก", head: "ทัพใหญ่พม่ากลับไปแล้ว", color: RED, chips: [{ text: "พม่ากำลังรบกับจีน", f: T1.china }] },
    { f: T1.suki, tag: "ที่เหลือไว้", head: "ค่ายโพธิ์สามต้น นายทัพสุกี้", color: RED },
    { f: T1.thongin, tag: "ธนบุรี", head: "นายทองอิน คนที่พม่าตั้ง", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={ROUTE.fleet} start={T1.recap} end={T1.recap + 60} color={TAK_C} width={11} variant="dashed" opacity={interpolate(frame, [T1.gone, T1.gone + 15], [1, 0], clamp)} />
        <Arrow points={ROUTE.home} start={T1.gone + 10} end={T1.china} color={BURMA_C} width={12} variant="dashed" />
        <CityDot at={PL.ava} color={BURMA_C} r={12} start={T1.gone + 20} end={T1.suki} />
        <PointLabel at={PL.ava} text="อังวะ" start={T1.gone + 20} color={BURMA_C} size={0.8} />
        <CityDot at={PL.phosamton} color={RED} r={13} start={T1.pst} />
        <PointLabel at={PL.phosamton} text="ค่ายโพธิ์สามต้น" start={T1.pst} color={RED} size={0.8} />
        <CityDot at={PL.thonburi} color={RED} r={13} start={T1.tb} />
        <PointLabel at={PL.thonburi} text="ธนบุรี (นายทองอิน)" start={T1.tb} color={RED} size={0.8} />
      </>
    );
  },
  Panels: () => (
    <>
      <FleetScene id="e8fleet" anchor={PL.chonburi} start={T1.recap} end={T1.gone + 14} />
      <MarchHomeScene id="e8home" anchor={PL.ayut} start={T1.gone} end={T1.suki + 14} />
      <SukiCampScene id="e8suki" anchor={PL.phosamton} start={T1.suki} end={T1.thongin + 14} />
      <ThonginScene id="e8thongin" anchor={PL.thonburi} start={T1.thongin} end={END1 + 14} />
    </>
  ),
  sfx: [[T1.china, SFX.pop, 0.25], [T1.name, SFX.pop, 0.25], [T1.ti, SFX.pop, 0.25]],
  Audio: () => (
    <>
      <Bed id="ship_sailing" from={T1.recap} to={T1.gone + 30} volume={0.16} />
      <Bed id="army_marching" from={T1.gone} to={T1.suki + 30} volume={0.16} />
      <Hit id="war_drums" at={T1.gone + 10} volume={0.3} />
      <Bed id="fire_crackle" from={T1.suki} to={END1 + 30} volume={0.12} />
    </>
  ),
};

// ---------------- 2 · Thonburi ----------------
const T2 = {
  coast: B.coast.start,
  mouth: wp("coast", "ปากน้ำ", 0.75),
  tb: B.thonburi.start,
  fort: wp("thonburi", "ป้อม", 0.7),
  attack: B.attack.start,
  storm: wp("attack", "บุก", 0.35),
  caught: wp("attack", "ประหาร", 0.9),
  open: B.open.start,
};
const END2 = B.upriver.start;
const FORT_SHOTS = [T2.storm, T2.storm + 20, T2.storm + 44];
export const e8c2: Chapter8 = {
  name: "ตีธนบุรี",
  from: T2.coast,
  to: END2,
  cams: (w, h) => [
    { frame: T2.coast, cam: view(VW.fleet, w, h, 1.0, 0.06) },
    { frame: T2.mouth, cam: view(VW.mouth, w, h, 0.95, 0.06) },
    { frame: T2.tb, cam: view(VW.thonburi, w, h, 0.95, 0.06) },
  ],
  years: [[T2.coast, "2310"]],
  heads: [
    { f: T2.coast, tag: "ปลาย ต.ค. 2310", head: "เลียบฝั่ง เข้าปากน้ำเจ้าพระยา", color: GOLD },
    { f: T2.tb, tag: "ธนบุรี", head: "เมืองหน้าด่านทางน้ำ มีป้อมแบบฝรั่ง", color: RED },
    { f: T2.attack, tag: "4 พ.ย. 2310", head: "บุกธนบุรี", color: GOLD },
    { f: T2.caught, tag: "นายทองอิน", head: "ถูกจับและประหาร", color: RED },
    { f: T2.open, tag: "ได้ธนบุรี", head: "ทางน้ำสู่กรุงเก่าเปิดแล้ว", color: GOLD },
  ],
  Map: () => (
    <>
      <Arrow points={ROUTE.fleet} start={T2.coast} end={T2.mouth} color={TAK_C} width={12} />
      <Arrow points={ROUTE.mouth} start={T2.mouth} end={T2.tb + 20} color={TAK_C} width={12} />
      <CityDot at={PL.thonburi} color={RED} r={13} start={T2.coast} end={T2.open} />
      <PointLabel at={PL.thonburi} text="ธนบุรี" start={T2.tb} color={RED} size={0.85} />
      <PointLabel at={PL.paknam} text="ปากน้ำ" start={T2.mouth} color={TAK_C} size={0.75} />
      <Battle at={PL.thonburi} start={T2.storm} end={T2.open + 10} color={GOLD} size={1.1} />
      <MapFlag at={PL.thonburi} color={GOLD} start={T2.open} />
      <CityDot at={PL.thonburi} color={TAK_C} r={13} start={T2.open} />
    </>
  ),
  Panels: () => (
    <>
      <RiverMouthScene id="e8mouth" anchor={PL.paknam} start={T2.coast} end={T2.tb + 14} />
      <FortScene id="e8fort" anchor={PL.thonburi} start={T2.tb} end={T2.attack + 14} />
      <FortAssaultScene id="e8assault" anchor={PL.thonburi} start={T2.attack} end={T2.open + 14} shots={FORT_SHOTS} />
      <BannerDawnScene id="e8open" anchor={PL.thonburi} start={T2.open} end={END2 + 14} />
    </>
  ),
  Screen: () => <DateCard start={T2.attack} end={T2.open} day="4" month="พฤศจิกายน" year="2310" color={GOLD} />,
  sfx: [[T2.coast - 6, SFX.whoosh, 0.25], [T2.open, SFX.hit, 0.3]],
  Audio: () => (
    <>
      <Bed id="sea_rough" from={T2.coast} to={T2.tb + 30} volume={0.14} />
      <Bed id="ship_creak" from={T2.tb} to={T2.attack + 30} volume={0.14} />
      {FORT_SHOTS.map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.55} />)}
      <Hit id="cannon_old" at={T2.storm + 30} volume={0.5} />
      <Bed id="sword_battle" from={T2.attack} to={T2.open + 20} volume={0.16} />
      <Bed id="wind" from={T2.open} to={END2 + 40} volume={0.14} />
    </>
  ),
};

// ---------------- 3 · Pho Sam Ton ----------------
const T3 = {
  up: B.upriver.start,
  arrive: wp("upriver", "โพธิ์", 0.8),
  camps: B.camps.start,
  east: wp("camps", "ตะวันออก", 0.55),
  west: wp("camps", "ตะวันตก", 0.9),
  van: B.vanguard.start,
  order: wp("vanguard", "สั่ง", 0.3),
  china: wp("vanguard", "จีน", 0.6),
  cb: B.callback.start,
  noon: B.noon.start,
  fall: wp("noon", "แตก", 0.55),
  seven: B.seven.start,
};
const END3 = B.thibet.start;
const WEST_SHOTS = [T3.china, T3.china + 22, T3.china + 46, T3.cb + 10];
export const e8c3: Chapter8 = {
  name: "ค่ายโพธิ์สามต้น",
  from: T3.up,
  to: END3,
  cams: (w, h) => [
    { frame: T3.up, cam: view(VW.river, w, h, 0.95, 0.06) },
    { frame: T3.camps, cam: view(VW.camps, w, h, 0.95, 0.05) },
  ],
  years: [[T3.up, "2310"]],
  heads: [
    { f: T3.up, tag: "5 พ.ย. 2310", head: "ทวนน้ำถึงโพธิ์สามต้น", color: GOLD },
    { f: T3.camps, tag: "ค่ายสองฝั่งคลอง", head: "ยึดฝั่งตะวันออกได้ก่อน", color: GOLD },
    { f: T3.van, tag: "เช้า 6 พ.ย.", head: "ตีค่ายฝั่งตะวันตก ทหารจีนนำหน้า", color: RED },
    { f: T3.cb, tag: "ขุนพิพิธวาที", head: "อยู่ด้วยตั้งแต่คืนฝ่าวงล้อม", color: GOLD },
    { f: T3.noon, tag: "ราวเที่ยง", head: "ค่ายแตก สุกี้ตายในการรบ", color: GOLD },
    { f: T3.seven, tag: "7 เดือนหลังเสียกรุง", head: "ไม่มีค่ายพม่าข้างกรุงเก่า", color: GOLD },
  ],
  Map: () => (
    <>
      <Arrow points={ROUTE.upriver} start={T3.up} end={T3.arrive + 20} color={TAK_C} width={12} />
      <CityDot at={PL.campE} color={TAK_C} r={12} start={T3.east} />
      <PointLabel at={PL.campE} text="ค่ายฝั่งตะวันออก" start={T3.east} color={TAK_C} size={0.75} />
      <CityDot at={PL.campW} color={RED} r={12} start={T3.camps} end={T3.fall} />
      <PointLabel at={PL.campW} text="ค่ายสุกี้ (ฝั่งตะวันตก)" start={T3.west} color={RED} size={0.75} />
      <Arrow points={[PL.campE, PL.campW]} start={T3.order} end={T3.order + 24} color={TAK_C} width={14} />
      <Battle at={PL.campW} start={T3.china} end={T3.seven + 20} color={GOLD} size={1.2} />
      <MapFlag at={PL.campW} color={GOLD} start={T3.fall} />
      <CityDot at={PL.ayut} color={RED} r={12} start={T3.up} />
      <PointLabel at={PL.ayut} text="กรุงเก่า" start={T3.seven} color={GOLD} size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      <UpriverScene id="e8up" anchor={PL.campE} start={T3.up} end={T3.camps + 14} />
      <TwoCampsScene id="e8camps" anchor={PL.phosamton} start={T3.camps} end={T3.van + 14} />
      <VanguardScene id="e8van" anchor={PL.campW} start={T3.van} end={T3.cb + 14} shots={WEST_SHOTS.slice(0, 3)} />
      <PhichaiCampScene id="e8callback" anchor={PL.campE} start={T3.cb} end={T3.noon + 14} />
      <CampFallsScene id="e8fall" anchor={PL.campW} start={T3.noon} end={T3.seven + 14} />
      <BannerDawnScene id="e8seven" anchor={PL.ayut} start={T3.seven} end={END3 + 14} />
    </>
  ),
  Screen: () => <DateCard start={T3.van} end={T3.cb} day="6" month="พฤศจิกายน" year="2310" color={GOLD} />,
  sfx: [[T3.east, SFX.pop, 0.25], [T3.fall, SFX.hit, 0.35]],
  Audio: () => (
    <>
      <Bed id="ship_sailing" from={T3.up} to={T3.camps + 30} volume={0.14} />
      <Bed id="war_drums" from={T3.camps} to={T3.van + 20} volume={0.14} />
      <Bed id="firefight" from={T3.van} to={T3.cb + 30} volume={0.16} />
      {WEST_SHOTS.slice(0, 3).map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.55} />)}
      <Hit id="battle_cry" at={T3.china} volume={0.45} />
      <Bed id="fire_crackle" from={T3.cb} to={T3.noon + 20} volume={0.14} />
      <Bed id="fire_big" from={T3.noon} to={T3.seven + 30} volume={0.16} />
      <Hit id="gong" at={T3.seven + 6} volume={0.35} />
      <Bed id="wind" from={T3.seven} to={END3 + 40} volume={0.12} />
    </>
  ),
};

// ---------------- 4 · the old capital ----------------
const T4 = {
  thibet: B.thibet.start,
  royals: B.royals.start,
  cremate: B.cremate.start,
  ruins: B.ruins.start,
  dream: B.dream.start,
};
const END4 = B.decide.start;
export const e8c4: Chapter8 = {
  name: "กรุงเก่า",
  from: T4.thibet,
  to: END4,
  cams: (w, h) => [
    { frame: T4.thibet, cam: view(VW.camps, w, h, 0.9, 0.05) },
    { frame: T4.cremate, cam: view(VW.island, w, h, 0.95, 0.06) },
  ],
  years: [[T4.thibet, "2310"]],
  heads: [
    { f: T4.thibet, tag: "ขุนนางเก่าอยุธยา", head: "พระยาธิเบศรบดี มาอ่อนน้อม", color: GOLD },
    { f: T4.royals, tag: "เจ้านายราชวงศ์เก่า", head: "อยู่ในสภาพลำบาก", color: RED },
    { f: T4.cremate, tag: "พระเจ้าเอกทัศ", head: "ถวายพระเพลิงตามประเพณี", color: GOLD },
    { f: T4.ruins, tag: "กรุงศรีอยุธยา", head: "พังยับ", color: RED },
    { f: T4.dream, tag: "ตามพงศาวดาร", head: "ฝันในวังเก่า", color: GOLD },
  ],
  Map: () => (
    <>
      <CityDot at={PL.campW} color={TAK_C} r={12} start={T4.thibet} />
      <CityDot at={PL.ayut} color={RED} r={14} start={T4.thibet} />
      <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T4.cremate} color={RED} size={0.85} />
    </>
  ),
  Panels: () => (
    <>
      <SubmitScene id="e8thibet" anchor={PL.campW} start={T4.thibet} end={T4.royals + 14} />
      <SubmitScene id="e8royals" anchor={PL.campW} start={T4.royals} end={T4.cremate + 14} pale />
      <CremationScene id="e8cremate" anchor={PL.ayut} start={T4.cremate} end={T4.ruins + 14} />
      <RuinsScene id="e8ruins" anchor={PL.ayut} start={T4.ruins} end={T4.dream + 14} />
      <DreamScene id="e8dream" anchor={PL.ayut} start={T4.dream} end={END4 + 14} />
    </>
  ),
  sfx: [],
  Audio: () => (
    <>
      <Bed id="wind" from={T4.thibet} to={T4.cremate + 30} volume={0.14} />
      <Hit id="gong" at={T4.cremate + 6} volume={0.35} />
      <Bed id="fire_crackle" from={T4.cremate} to={T4.ruins + 30} volume={0.14} />
      <Bed id="wind_storm" from={T4.ruins} to={END4 + 40} volume={0.08} />
      <Hit id="elephant" at={T4.ruins + 20} volume={0.35} />
    </>
  ),
};

// ---------------- 5 · why Thonburi ----------------
const T5 = {
  decide: B.decide.start,
  why: B.why.start,
  sea: wp("why", "ทะเล", 0.35),
  trade: B.trade.start,
  crown: B.crown.start,
  rite: wp("crown", "ปราบดาภิเษก", 0.5),
  day: B.day.start,
};
const END5 = B.answer.start;
export const e8c5: Chapter8 = {
  name: "ทำไมต้องธนบุรี",
  from: T5.decide,
  to: END5,
  cams: (w, h) => [
    { frame: T5.decide, cam: view(VW.river, w, h, 0.95, 0.06) },
    { frame: T5.why, cam: view(VW.plain, w, h, 0.95, 0.06) },
    { frame: T5.crown, cam: view(VW.thonburi, w, h, 0.95, 0.06) },
  ],
  years: [[T5.decide, "2310"]],
  heads: [
    { f: T5.decide, tag: "ไม่ฟื้นอยุธยา", head: "พังเกินซ่อม กว้างเกินรักษา", color: RED },
    { f: T5.why, tag: "ธนบุรี", head: "เล็ก ใกล้ทะเล ถอยทางเรือได้", color: GOLD },
    { f: T5.trade, tag: "ทางผ่านเรือค้าขาย", head: "เรื่องที่พระยาตากถนัดที่สุด", color: GOLD },
    { f: T5.crown, tag: "28 ธันวาคม", head: "ปราบดาภิเษกที่กรุงธนบุรี", color: GOLD },
    { f: T5.day, tag: "ทุกวันนี้", head: "วันสมเด็จพระเจ้าตากสินมหาราช", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.ayut} color={RED} r={14} start={T5.decide} />
        <PointLabel at={PL.ayut} text="กรุงเก่า" start={T5.decide} color={RED} size={0.8} />
        <Arrow points={[PL.ayut, [100.55, 14.15], [100.53, 13.95], [100.5, 13.82], PL.thonburi]} start={T5.why} end={T5.why + 40} color={TAK_C} width={12} variant="dashed" />
        <CityDot at={PL.thonburi} color={TAK_C} r={14} start={T5.why} />
        <PointLabel at={PL.thonburi} text="ธนบุรี" start={T5.why} color={TAK_C} size={0.9} />
        <Arrow points={[PL.thonburi, [100.53, 13.66], PL.paknam, [100.6, 13.3]]} start={T5.sea} end={T5.sea + 30} color="#7fd4ff" width={9} variant="dashed" opacity={interpolate(frame, [T5.trade + 20, T5.trade + 40], [1, 0], clamp)} />
        <MapFlag at={PL.thonburi} color={GOLD} start={T5.crown} />
      </>
    );
  },
  Panels: () => (
    <>
      <RuinsScene id="e8ruins2" anchor={PL.ayut} start={T5.decide} end={T5.why + 14} night />
      <PortThonburiScene id="e8port" anchor={PL.thonburi} start={T5.why} end={T5.trade + 14} />
      <PortCityScene id="e8trade" anchor={PL.thonburi} start={T5.trade} end={T5.crown + 14} />
      <CrownScene id="e8crown" anchor={PL.thonburi} start={T5.crown} end={T5.day + 14} />
      <CrownScene id="e8crown2" anchor={PL.thonburi} start={T5.day} end={END5 + 14} />
    </>
  ),
  sfx: [[T5.sea, SFX.pop, 0.25]],
  Audio: () => (
    <>
      <Bed id="wind" from={T5.decide} to={T5.why + 30} volume={0.12} />
      <Bed id="ship_sailing" from={T5.why} to={T5.crown + 30} volume={0.14} />
      <Hit id="ship_bell" at={T5.trade + 6} volume={0.3} />
      <Hit id="gong" at={T5.rite} volume={0.45} />
      <Bed id="crowd_cheer" from={T5.crown + 20} to={END5 + 30} volume={0.08} />
    </>
  ),
};

// ---------------- 6 · the answer ----------------
const T6 = {
  answer: B.answer.start,
  timing: wp("answer", "จังหวะ", 0.5),
  ladder: B.ladder.start,
  boat: wp("ladder", "เรือ", 0.2),
  one: wp("ladder", "ธนบุรี", 0.55),
  two: wp("ladder", "โพธิ์", 0.8),
  next: B.next.start,
  poll: B.poll.start,
  a: wp("poll", "ฟื้น", 0.35),
  b: wp("poll", "ย้าย", 0.5),
  btn: wp("poll", "คอมเมนต์", 0.8),
};
export const E8_END = B.poll.end + 60;
export const e8c6: Chapter8 = {
  name: "คำตอบ",
  from: T6.answer,
  to: E8_END,
  cams: (w, h) => [
    { frame: T6.answer, cam: view(VW.region, w, h, 0.9, 0.06) },
    { frame: T6.ladder, cam: view(VW.plain, w, h, 0.95, 0.06) },
  ],
  years: [[T6.answer, "2310"]],
  heads: [
    { f: T6.answer, tag: "คำตอบ", head: "ชนะเพราะจังหวะ ไม่ใช่เพราะคนเยอะ", color: GOLD },
    { f: T6.ladder, tag: "มาทางเรือ", head: "ตีทีละค่าย", color: GOLD, chips: [{ text: "① ธนบุรี", f: T6.one }, { text: "② โพธิ์สามต้น", f: T6.two }] },
    { f: T6.next, tag: "ตอนหน้า", head: "แผ่นดินยังแตกเป็นหลายก๊ก", color: GOLD },
    { f: T6.poll, tag: "", head: "" },
  ],
  Map: () => (
    <>
      <Arrow points={ROUTE.home} start={T6.answer} end={T6.timing} color={BURMA_C} width={11} variant="dashed" />
      <Battle at={PL.thonburi} start={T6.one} end={E8_END} color={GOLD} />
      <Battle at={PL.campW} start={T6.two} end={E8_END} color={GOLD} />
      <Arrow points={[...ROUTE.mouth, ...ROUTE.upriver.slice(1)]} start={T6.boat} end={T6.two + 10} color={TAK_C} width={12} />
      <CityDot at={PL.thonburi} color={TAK_C} r={13} start={T6.ladder} />
      <PointLabel at={PL.thonburi} text="ธนบุรี" start={T6.one} color={TAK_C} size={0.85} />
      <PointLabel at={PL.phosamton} text="โพธิ์สามต้น" start={T6.two} color={TAK_C} size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      <MarchHomeScene id="e8home2" anchor={PL.ayut} start={T6.answer} end={T6.ladder + 14} />
      <FleetScene id="e8fleet2" anchor={PL.thonburi} start={T6.ladder} end={T6.next + 14} dusk />
      <PortThonburiScene id="e8port2" anchor={PL.thonburi} start={T6.next} end={T6.poll + 14} />
      <RiverCampNightScene id="e8night2" anchor={PL.thonburi} start={T6.poll} end={E8_END} />
    </>
  ),
  Screen: () => <Poll2 start={T6.poll} end={E8_END} a={T6.a} b={T6.b} button={T6.btn} title="ถ้าคุณเป็นพระยาตาก คุณจะ…" optA="ฟื้นอยุธยา" optB="ไปธนบุรี" />,
  sfx: [[T6.one, SFX.pop, 0.25], [T6.two, SFX.pop, 0.25], [T6.a, SFX.pop, 0.3], [T6.b, SFX.pop, 0.3], [T6.btn, SFX.pop, 0.35]],
  Audio: () => (
    <>
      <Bed id="army_marching" from={T6.answer} to={T6.ladder + 20} volume={0.12} />
      <Bed id="ship_sailing" from={T6.ladder} to={T6.poll + 30} volume={0.14} />
      <Bed id="fire_crackle" from={T6.poll} to={E8_END} volume={0.12} />
    </>
  ),
};
