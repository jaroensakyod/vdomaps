import type { ReactNode } from "react";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { AnchorCtx, view } from "../news/kit";
import { CityDot, Ring } from "../ep05/beatsKit";
import { ApproxNote, Battle, Trail } from "../ep06/mapkit";
import { BreakoutScene, CityGlowScene, DawnMarchScene, FiveRidersScene, InquiryScene, MarchOutScene, OfficersScene, PhichaiCampScene, ProclaimScene, RampartGunScene, SiegeNightScene, TrenchScene, BannerDawnScene } from "../ep06/scenes";
import { DrillScene, FleetScene, PotsScene } from "../ep07/scenes";
import { CrownScene, FortAssaultScene, RuinsScene } from "../ep08/scenes";
import { MonkSiegeScene, PhitsanulokScene } from "../ep09/scenes";
import { ArchiveScene, MoonPrangScene, NightRiverScene, ThroneScene } from "../ep04/ch0";
import { CapitalScene, EmeraldScene, RankScene } from "../ep04/ch1";
import { MeditationScene, ScribeScene, TributeScene } from "../ep04/ch2";
import { NightCrossScene, OrdainScene, RuinDigScene, WallAssaultScene } from "../ep04/ch3";
import { ArmyArriveScene, ChronicleScene as RoyalChronicle, DawnRiverScene, DuskRiverScene, FortScene } from "../ep04/ch5";
import { ChronicleScene as FadedChronicle } from "../ep04/ch6";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type ChapterM } from "./beatsKit";
import { ElementPoll, HookTitle, MumateCTA, PillarSlam, ThreeYears, TwoCards, YearChip, Cycle, LuckRibbon } from "./bazi";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { ForgeScene, QuenchScene, SheathScene } from "./scenes";

// History on the Map × Mumate EP.1: ดวงพระเจ้าตาก. Eight chapters; the BaZi card (Ep.tsx) runs across all of them.

// Episode-4 panels have a fixed anchor (Thonburi); At moves their pin to where the camera is.
const At = ({ p, children }: { p: [number, number]; children: ReactNode }) => <AnchorCtx.Provider value={p}>{children}</AnchorCtx.Provider>;
// Panels in a row: each ends 14 frames into the next one (house rule, no gap), the last at `end`.
type Shot = [number, (start: number, end: number) => ReactNode];
const chain = (shots: Shot[], end: number) => shots.map(([f, make], i) => <g key={i}>{make(f, i < shots.length - 1 ? shots[i + 1][0] + 14 : end + 14)}</g>);

// ---------------- 0 · hook ----------------
const T0 = { span: B.span.start, between: B.between.start, pots: wp("between", "แผ่นดิน", 0.5), two: B.twolayer.start, bazi: wp("twolayer", "ปาจื้อ", 0.6), q: B.question.start, honest: B.honest.start };
const END0 = B.birth.start;
export const m0: ChapterM = {
  name: "ดวงพระเจ้าตาก",
  from: 0,
  to: END0,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.thonWide, w, h, 0.95, 0.06) },
    { frame: T0.span, cam: view(VW.plain, w, h, 0.95, 0.06) },
    { frame: T0.two, cam: view(VW.siam, w, h, 0.9, 0.06) },
  ],
  years: [[0, "2325"], [T0.span, "2277"], [T0.span + 60, "2325"]],
  heads: [
    { f: T0.span, tag: "พ.ศ. 2277 → 2325", head: "48 ปีตามการนับแบบเก่า", color: GOLD },
    { f: T0.between, tag: "ระหว่างนั้น", head: "กษัตริย์องค์เดียวของกรุงธนบุรี", color: GOLD, portrait: "taksin_king" },
    { f: T0.two, tag: "วันนี้เล่าสองชั้น", head: "แผนที่ + ดวงปาจื้อ", color: GOLD },
    { f: T0.q, tag: "คำถามของวันนี้", head: "ดวงตรงกับประวัติศาสตร์ไหม?", color: RED },
    { f: T0.honest, tag: "ร่วมกับ Mumate", head: "หลักฐานนำ ดวงตาม", color: GOLD },
  ],
  Map: () => (
    <>
      <CityDot at={PL.thon} color={TAK_C} r={14} start={B.hook.end} />
      <PointLabel at={PL.thon} text="ธนบุรี" start={B.hook.end} color={TAK_C} size={0.85} />
      <CityDot at={PL.ayut} color={TAK_C} r={14} start={T0.span} />
      <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T0.span} color={TAK_C} size={0.8} />
      <Arrow points={[PL.ayut, [100.53, 14.05], PL.thon]} start={T0.span + 40} end={T0.span + 90} color={GOLD} width={10} variant="dashed" />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [B.hook.end - 6, (s, e) => <CrownScene id="m0crown" anchor={PL.thon} start={s} end={e} />],
        [T0.span, (s, e) => <At p={PL.ayut}><MoonPrangScene id="m0prang" start={s} end={e} /></At>],
        [T0.between, (s, e) => <PhichaiCampScene id="m0camp" anchor={PL.ayut} start={s} end={e} />],
        [T0.pots, (s, e) => <PotsScene id="m0pots" anchor={PL.ayut} start={s} end={e} hits={[s + 20]} />],
        [T0.two, (s, e) => <At p={PL.ayut}><ArchiveScene id="m0arch" start={s} end={e} /></At>],
        [T0.q, (s, e) => <At p={PL.ayut}><ThroneScene id="m0throne" start={s} end={e} /></At>],
        [T0.honest, (s, e) => <At p={PL.ayut}><ScribeScene id="m0scribe" start={s} end={e} /></At>],
      ], END0)}
    </>
  ),
  Screen: () => (
    <>
      <HookTitle end={B.hook.end} />
      <PillarSlam chars={["寅", "寅"]} at={[2, 14]} until={B.hook.end - 4} y={0.47} />
      <TwoCards a={["หลักฐาน", "เกิดอะไรขึ้น"]} b={["ดวง", "อีกมุมมองหนึ่ง"]} from={T0.honest + 10} to={END0 - 6} />
    </>
  ),
  sfx: [[0, SFX.hit, 0.45], [14, SFX.hit, 0.35], [0, SFX.swell, 0.3], [T0.q, SFX.pop, 0.25], [T0.two - 6, SFX.whoosh, 0.25]],
  Audio: () => (
    <>
      <Hit id="gong" at={4} volume={0.5} />
      <Bed id="wind" from={0} to={T0.two + 30} volume={0.12} />
      <Bed id="fire_crackle" from={T0.two} to={END0 + 30} volume={0.1} />
    </>
  ),
};

// ---------------- 1 · the birth chart ----------------
const T1 = { birth: B.birth.start, no: B.nohour.start, chart: B.chart.start, dm: B.daymaster.start, earth: B.earth.start, tiger: B.tiger.start, sum: B.summary.start, bridge: B.bridge.start };
const END1 = B.tak.start;
export const m1: ChapterM = {
  name: "ดวงพื้น",
  from: T1.birth,
  to: END1,
  cams: (w, h) => [
    { frame: T1.birth, cam: view(VW.island, w, h, 0.95, 0.06) },
    { frame: T1.no, cam: view(VW.plain, w, h, 0.9, 0.06) },
    { frame: T1.bridge, cam: view(VW.west, w, h, 0.9, 0.06) },
  ],
  years: [[T1.birth, "2277"]],
  heads: [
    { f: T1.birth, tag: "หลักฐานที่นิยมอ้างอิง", head: "ประสูติ 17 เม.ย. 2277", color: GOLD },
    { f: T1.no, tag: "ไม่ทราบยามเกิด", head: "ดวงนี้มี 3 เสา", color: RED },
    { f: T1.chart, tag: "ระบบ Mumate", head: "ปีไม้เสือ · เดือนดินมังกร · วันโลหะเสือ", color: GOLD },
    { f: T1.dm, tag: "ธาตุประจำตัว", head: "โลหะหยาง = ดาบ", color: GOLD },
    { f: T1.earth, tag: "ดินให้กำเนิดโลหะ", head: "มีคนหนุนหลัง", color: GOLD },
    { f: T1.tiger, tag: "เสือสองตัว", head: "ดาวเจ็ดสังหาร", color: RED },
    { f: T1.sum, tag: "ดวงพื้นตามตำรา", head: "ดาบที่ต้องผ่านไฟ", color: GOLD },
  ],
  Map: () => (
    <>
      <Ring at={PL.ayut} r={26} color={GOLD} start={T1.birth + 6} end={T1.no + 20} />
      <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T1.birth} color={TAK_C} size={0.9} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T1.birth, (s, e) => <At p={PL.ayut}><CapitalScene id="m1cap" start={s} end={e} /></At>],
        [T1.no, (s, e) => <At p={PL.ayut}><MoonPrangScene id="m1moon" start={s} end={e} /></At>],
        [T1.chart, (s, e) => <At p={PL.ayut}><ArchiveScene id="m1arch" start={s} end={e} /></At>],
        [T1.dm, (s, e) => <ForgeScene id="m1forge" anchor={PL.ayut} start={s} end={e} heatAt={s} />],
        [T1.earth, (s, e) => <At p={PL.ayut}><RuinDigScene id="m1dig" start={s} end={e} /></At>],
        [T1.tiger, (s, e) => <ForgeScene id="m1forge2" anchor={PL.ayut} start={s} end={e} heatAt={s + 30} />],
        [T1.bridge, (s, e) => <MarchOutScene id="m1march" anchor={PL.ayut} start={s} end={e} />],
      ], END1)}
    </>
  ),
  Screen: () => <Cycle from="earth" to="metal" label="ดินให้กำเนิดโลหะ" start={wp("earth", "ดินให้", 0.25)} end={T1.tiger - 4} />,
  sfx: [[T1.chart, SFX.riser, 0.25], [wp("chart", "ไม้เสือ", 0.6), SFX.pop, 0.25], [wp("chart", "ดินมังกร", 0.75), SFX.pop, 0.25], [wp("chart", "โลหะเสือ", 0.9), SFX.pop, 0.3], [T1.bridge - 6, SFX.whoosh, 0.25]],
  Audio: () => (
    <>
      <Bed id="wind" from={T1.birth} to={T1.dm + 30} volume={0.12} />
      <Bed id="fire_big" from={T1.dm} to={T1.bridge + 30} volume={0.1} />
      <Hit id="sword_draw" at={T1.dm + 10} volume={0.4} />
    </>
  ),
};

// ---------------- 2 · before the storm ----------------
const T2 = { tak: B.tak.start, intro: B.luckintro.start, l27: B.luck27.start, summon: B.summon.start, siege: B.siege.start, gun: wp("siege", "ปืนใหญ่", 0.6), fired: B.fired.start, fy: B.fireyear.start };
const END2 = B.breakout.start;
export const m2: ChapterM = {
  name: "ก่อนพายุ",
  from: T2.tak,
  to: END2,
  cams: (w, h) => [
    { frame: T2.tak, cam: view(VW.west, w, h, 0.9, 0.06) },
    { frame: T2.summon, cam: view(VW.west, w, h, 0.95, 0.06) },
    { frame: T2.siege, cam: view(VW.island, w, h, 0.95, 0.06) },
  ],
  years: [[T2.tak, "2303"], [T2.summon, "2309"]],
  heads: [
    { f: T2.tak, tag: "พระยาตาก", head: "เจ้าเมืองตาก ใกล้ชายแดนพม่า", color: GOLD, portrait: "taksin_general" },
    { f: T2.intro, tag: "ในปาจื้อ", head: "วัยจร = ช่วงละ 10 ปี", color: GOLD },
    { f: T2.l27, tag: "อายุราว 27–36", head: "วัยจรโลหะแพะ", color: GOLD },
    { f: T2.summon, tag: "ปี 2309", head: "พม่าล้อมกรุง", color: RED },
    { f: T2.siege, tag: "ล้อมราว 14 เดือน", head: "ดินปืนขาด", color: RED },
    { f: T2.fired, tag: "หลักฐานบางแหล่งเล่าว่า", head: "ยิงโดยไม่ขอ ถูกสอบสวน", color: RED },
    { f: T2.fy, tag: "ในดวงจีน ปี 2309", head: "ปีไฟหมา", color: RED },
  ],
  Map: () => (
    <>
      <CityDot at={PL.tak} color={TAK_C} r={14} start={T2.tak} />
      <PointLabel at={PL.tak} text="ตาก" start={T2.tak} color={TAK_C} size={0.9} />
      <Arrow points={ROUTE.takToAyut} start={T2.summon + 20} end={T2.summon + 80} color={TAK_C} width={10} />
      <CityDot at={PL.ayut} color={RED} r={14} start={T2.summon} />
      <Ring at={PL.ayut} r={40} color={BURMA_C} start={T2.siege} end={END2 + 20} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T2.tak, (s, e) => <MarchOutScene id="m2tak" anchor={PL.tak} start={s} end={e} />],
        [T2.intro, (s, e) => <OfficersScene id="m2off" anchor={PL.tak} start={s} end={e} />],
        [T2.summon, (s, e) => <DawnMarchScene id="m2dawn" anchor={PL.tak} start={s} end={e} />],
        [T2.siege, (s, e) => <SiegeNightScene id="m2siege" anchor={PL.ayut} start={s} end={e} />],
        [T2.gun, (s, e) => <RampartGunScene id="m2gun" anchor={PL.ayut} start={s} end={e} fire={T2.fired + 6} />],
        [T2.fired + 40, (s, e) => <InquiryScene id="m2inq" anchor={PL.ayut} start={s} end={e} />],
        [T2.fy, (s, e) => <ForgeScene id="m2forge" anchor={PL.ayut} start={s} end={e} heatAt={s} />],
      ], END2)}
    </>
  ),
  Screen: () => (
    <>
      <LuckRibbon show={[[T2.intro, T2.summon - 4]]} head={[[T2.l27, 2]]} />
      <YearChip gz="丙戌" label="ปีไฟหมา · 2309" star="七杀 ดาวเจ็ดสังหาร" from={wp("fireyear", "ไฟหยาง", 0.35)} to={END2 - 6} />
    </>
  ),
  sfx: [[T2.l27, SFX.pop, 0.25], [T2.fy, SFX.hit, 0.3]],
  Audio: () => (
    <>
      <Bed id="wind" from={T2.tak} to={T2.summon + 30} volume={0.12} />
      <Bed id="war_drums" from={T2.summon} to={T2.fired + 30} volume={0.1} />
      <Hit id="cannon_old" at={T2.fired + 6} volume={0.6} />
      <Bed id="fire_big" from={T2.fy} to={END2 + 30} volume={0.1} />
    </>
  ),
};

// ---------------- 3 · 2310, the year everything changed ----------------
const T3 = {
  out: B.breakout.start, chase: B.chase.start, rayong: B.rayong.start, fall: B.fall.start, pig: B.pig.start, off: B.officer.start,
  comb: B.combine.start, read: B.read1.start, pots: B.pots.start, psm: B.posamton.start, crown: B.crown.start,
};
const END3 = B.luck37.start;
const VOLLEYS = [T3.chase + 40, T3.chase + 70, T3.chase + 100];
export const m3: ChapterM = {
  name: "พ.ศ. 2310",
  from: T3.out,
  to: END3,
  cams: (w, h) => [
    { frame: T3.out, cam: view(VW.route, w, h, 0.95, 0.06) },
    { frame: T3.fall, cam: view(VW.island, w, h, 0.95, 0.06) },
    { frame: T3.pots, cam: view(VW.east, w, h, 0.92, 0.06) },
    { frame: T3.psm, cam: view(VW.plain, w, h, 0.92, 0.06) },
    { frame: T3.crown, cam: view(VW.thonWide, w, h, 0.95, 0.06) },
  ],
  years: [[T3.out, "2310"], [T3.crown, "2311"]],
  heads: [
    { f: T3.out, tag: "3 ม.ค. 2310", head: "ราว 500 คน ฝ่าวงล้อม", color: GOLD },
    { f: T3.chase, tag: "พงศาวดารเล่าว่า", head: "พม่าไล่ตาม ถูกตีแตกกลับ", color: GOLD },
    { f: T3.rayong, tag: "ถึงระยอง", head: "\"เจ้าตาก\"", color: GOLD },
    { f: T3.fall, tag: "7 เม.ย. 2310", head: "กรุงศรีอยุธยาแตก", color: RED },
    { f: T3.pig, tag: "ในดวงจีน ปี 2310", head: "ปีไฟหมู", color: RED },
    { f: T3.off, tag: "เรื่องแรก", head: "ดาวขุนนาง", color: GOLD },
    { f: T3.comb, tag: "เรื่องที่สอง", head: "หมูรวมกับเสือ", color: GOLD },
    { f: T3.read, tag: "อ่านย้อนหลัง", head: "ถูกดึงเข้าหาตำแหน่ง", color: GOLD },
    { f: T3.pots, tag: "มิ.ย. 2310", head: "ทุบหม้อข้าว ตีจันทบุรี", color: GOLD },
    { f: T3.psm, tag: "พ.ย. 2310", head: "ตีค่ายโพธิ์สามต้น", color: GOLD },
    { f: T3.crown, tag: "ทางการไทยนับเป็น 28 ธ.ค. 2311", head: "ขึ้นครองราชย์", color: GOLD, portrait: "taksin_king" },
  ],
  Map: () => (
    <>
      <Trail legs={[[ROUTE.breakout, T3.out + 20], [ROUTE.coast, T3.rayong]]} />
      <Battle at={PL.phosaohan} start={T3.chase + 20} end={T3.rayong} size={0.8} />
      <Battle at={PL.phrannok} start={T3.chase + 45} end={T3.rayong} size={0.8} />
      <Battle at={PL.jolo} start={T3.chase + 70} end={T3.rayong} size={0.8} />
      <CityDot at={PL.rayong} color={TAK_C} r={13} start={T3.rayong} />
      <PointLabel at={PL.rayong} text="ระยอง" start={T3.rayong} color={TAK_C} size={0.85} />
      <CityDot at={PL.ayut} color={RED} r={16} start={T3.fall} />
      <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T3.fall} color={RED} size={0.85} />
      <Arrow points={ROUTE.chan} start={T3.pots} end={T3.pots + 50} color={TAK_C} width={10} />
      <CityDot at={PL.chanthaburi} color={TAK_C} r={13} start={T3.pots + 40} />
      <PointLabel at={PL.chanthaburi} text="จันทบุรี" start={T3.pots + 40} color={TAK_C} size={0.85} />
      <Arrow points={ROUTE.fleet} start={T3.psm} end={T3.psm + 80} color={TAK_C} width={10} />
      <Battle at={PL.posamton} start={T3.psm + 70} end={T3.crown} size={0.9} />
      <CityDot at={PL.thon} color={GOLD} r={16} start={T3.crown} />
      <PointLabel at={PL.thon} text="กรุงธนบุรี" start={T3.crown} color={GOLD} size={0.9} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T3.out, (s, e) => <BreakoutScene id="m3out" anchor={PL.phichai} start={s} end={e} />],
        [T3.chase, (s, e) => <TrenchScene id="m3trench" anchor={PL.jolo} start={s} end={e} volleys={VOLLEYS} />],
        [T3.rayong, (s, e) => <ProclaimScene id="m3proc" anchor={PL.rayong} start={s} end={e} />],
        [T3.fall, (s, e) => <CityGlowScene id="m3glow" anchor={PL.ayut} start={s} end={e} />],
        [T3.off, (s, e) => <At p={PL.ayut}><ThroneScene id="m3throne" start={s} end={e} /></At>],
        [T3.comb, (s, e) => <BannerDawnScene id="m3banner" anchor={PL.ayut} start={s} end={e} />],
        [T3.read, (s, e) => <CityGlowScene id="m3ruin" anchor={PL.ayut} start={s} end={e} ruin />],
        [T3.pots, (s, e) => <PotsScene id="m3pots" anchor={PL.chanthaburi} start={s} end={e} hits={[wp("pots", "ทุบ", 0.5)]} />],
        [T3.psm, (s, e) => <FortAssaultScene id="m3psm" anchor={PL.posamton} start={s} end={e} shots={[T3.psm + 80, T3.psm + 110]} />],
        [T3.crown, (s, e) => <CrownScene id="m3crown" anchor={PL.thon} start={s} end={e} />],
      ], END3)}
      <ApproxNote from={T3.out + 20} to={T3.fall} />
    </>
  ),
  Screen: () => (
    <>
      <YearChip gz="丙戌" label="ยังเป็นปีไฟหมา" star="ตามปฏิทินจีน" from={wp("breakout", "ปฏิทิน", 0.75)} to={T3.chase - 4} y={0.18} />
      <YearChip gz="丁亥" label="ปีไฟหมู · 2310" star="正官 ดาวขุนนาง" from={T3.off + 10} to={T3.comb - 4} />
      <PillarSlam chars={["亥", "寅"]} at={[T3.comb + 6, T3.comb + 16]} until={T3.read - 4} y={0.33} text="寅亥合 · การรวม" link={{ f: wp("combine", "ดึง", 0.7), color: GOLD, mode: "bind" }} />
    </>
  ),
  sfx: [[T3.fall, SFX.hit, 0.35], [T3.off + 10, SFX.pop, 0.25], [T3.comb + 6, SFX.hit, 0.3], [T3.comb + 16, SFX.hit, 0.3], [T3.pots - 6, SFX.whoosh, 0.25], [T3.crown, SFX.swell, 0.3]],
  Audio: () => (
    <>
      <Bed id="horse_gallop" from={T3.out} to={T3.chase + 20} volume={0.1} />
      {VOLLEYS.map((f) => <Hit key={f} id="rifle_echo" at={f} volume={0.55} />)}
      <Bed id="fire_big" from={T3.fall} to={T3.pig + 30} volume={0.12} />
      <Hit id="wood_break" at={wp("pots", "ทุบ", 0.5)} volume={0.6} />
      <Bed id="ship_sailing" from={T3.psm} to={T3.crown + 20} volume={0.12} />
      <Hit id="gong" at={T3.crown + 6} volume={0.45} />
    </>
  ),
};

// ---------------- 4 · a decade of clashes ----------------
const T4 = { l37: B.luck37.start, clash: B.clash.start, peers: B.peers.start, non: B.nonstop.start, fang: B.fang.start, north: B.north.start, laos: B.laos.start, peak: B.peak.start, read: B.read2.start };
const END4 = B.luck47.start;
export const m4: ChapterM = {
  name: "ทศวรรษแห่งการปะทะ",
  from: T4.l37,
  to: END4,
  cams: (w, h) => [
    { frame: T4.l37, cam: view(VW.thonWide, w, h, 0.9, 0.06) },
    { frame: T4.non, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: T4.fang, cam: view(VW.north, w, h, 0.9, 0.06) },
    { frame: T4.laos, cam: view(VW.laos, w, h, 0.9, 0.06) },
    { frame: T4.peak, cam: view(VW.siam, w, h, 0.9, 0.06) },
  ],
  years: [[T4.l37, "2313"], [T4.north, "2318"], [T4.laos, "2322"]],
  heads: [
    { f: T4.l37, tag: "ปี 2313 อายุราว 37", head: "วัยจรน้ำลิง", color: GOLD },
    { f: T4.clash, tag: "ลิงชนเสือ", head: "ปะทะ = เดินทาง · ต่อสู้", color: RED },
    { f: T4.peers, tag: "โลหะพบโลหะ", head: "คนเก่งรอบตัว", color: GOLD },
    { f: T4.non, tag: "ทศวรรษนี้", head: "แทบไม่ได้พักรบ", color: RED },
    { f: T4.fang, tag: "2313", head: "ปราบชุมนุมเจ้าพระฝาง", color: GOLD, portrait: "fang" },
    { f: T4.north, tag: "ตีเชียงใหม่ · ศึกอะแซหวุ่นกี้", head: "พม่าถอย", color: GOLD },
    { f: T4.laos, tag: "ศึกเวียงจันทน์", head: "อัญเชิญพระแก้วมรกต", color: GOLD, portrait: "chakri" },
    { f: T4.peak, tag: "กรุงธนบุรี", head: "แข็งแรงที่สุด", color: GOLD },
    { f: T4.read, tag: "อ่านแบบปาจื้อ", head: "ดาบหลายเล่มในฝักเดียว", color: GOLD },
  ],
  Map: () => (
    <>
      <CityDot at={PL.thon} color={GOLD} r={14} start={T4.l37} />
      <Arrow points={ROUTE.fang} start={T4.fang} end={T4.fang + 70} color={TAK_C} width={10} />
      <CityDot at={PL.fang} color="#e8a030" r={12} start={T4.fang + 40} />
      <PointLabel at={PL.fang} text="เจ้าพระฝาง" start={T4.fang + 40} color="#e8a030" size={0.75} />
      <Arrow points={ROUTE.chiangmai} start={T4.north} end={T4.north + 50} color={TAK_C} width={10} />
      <PointLabel at={PL.chiangmai} text="เชียงใหม่" start={T4.north + 30} color={TAK_C} size={0.8} />
      <Ring at={PL.phitsanulok} r={30} color={BURMA_C} start={wp("north", "อะแซ", 0.5)} end={T4.laos} />
      <PointLabel at={PL.phitsanulok} text="พิษณุโลก" start={wp("north", "อะแซ", 0.5)} color={RED} size={0.8} />
      <Arrow points={ROUTE.laos} start={T4.laos} end={T4.laos + 70} color={TAK_C} width={10} />
      <CityDot at={PL.vientiane} color={RED} r={13} start={T4.laos + 50} />
      <PointLabel at={PL.vientiane} text="เวียงจันทน์" start={T4.laos + 50} color={RED} size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T4.l37, (s, e) => <DrillScene id="m4drill" anchor={PL.thon} start={s} end={e} />],
        [T4.clash, (s, e) => <FleetScene id="m4fleet" anchor={PL.thon} start={s} end={e} />],
        [T4.peers, (s, e) => <SheathScene id="m4sheath" anchor={PL.thon} start={s} end={e} />],
        [T4.non, (s, e) => <FiveRidersScene id="m4riders" anchor={PL.thon} start={s} end={e} hits={[]} />],
        [T4.fang, (s, e) => <MonkSiegeScene id="m4monk" anchor={PL.fang} start={s} end={e} />],
        [T4.north, (s, e) => <PhitsanulokScene id="m4phit" anchor={PL.phitsanulok} start={s} end={e} />],
        [T4.laos, (s, e) => <At p={PL.vientiane}><EmeraldScene id="m4emerald" start={s} end={e} /></At>],
        [T4.peak, (s, e) => <At p={PL.thon}><RankScene id="m4rank" start={s} end={e} /></At>],
        [T4.read, (s, e) => <SheathScene id="m4sheath2" anchor={PL.thon} start={s} end={e} crack={wp("read2", "คับ", 0.85)} />],
      ], END4)}
    </>
  ),
  Screen: () => (
    <>
      <LuckRibbon show={[[T4.l37, T4.clash - 4]]} head={[[T4.l37 + 10, 3]]} />
      <PillarSlam chars={["申", "寅", "寅"]} at={[T4.clash + 4, T4.clash + 14, T4.clash + 22]} until={T4.peers - 4} y={0.33} text="寅申冲 · การปะทะ" link={{ f: wp("clash", "ปะทะ", 0.6), color: RED, mode: "clash" }} />
      <YearChip gz="壬申" label="ลิง = โลหะ" star="比肩 คนระดับเดียวกัน" from={T4.peers + 6} to={T4.non - 4} />
    </>
  ),
  sfx: [[T4.l37 + 10, SFX.pop, 0.25], [T4.clash + 4, SFX.hit, 0.3], [T4.clash + 14, SFX.hit, 0.3], [T4.read - 6, SFX.whoosh, 0.2]],
  Audio: () => (
    <>
      <Bed id="army_marching" from={T4.l37} to={T4.peak + 30} volume={0.1} />
      <Hit id="sword_clash" at={wp("clash", "ปะทะ", 0.6)} volume={0.5} />
      <Hit id="war_horn" at={T4.fang + 6} volume={0.4} />
      <Hit id="cannon_far" at={wp("north", "อะแซ", 0.5)} volume={0.45} />
      <Bed id="wind" from={T4.peak} to={END4 + 30} volume={0.1} />
    </>
  ),
};

// ---------------- 5 · too much water ----------------
const T5 = {
  l47: B.luck47.start, water: B.water.start, hurt: B.hurt.start, src: B.thaisource.start, cav: B.caveat.start, hunger: B.hunger.start,
  y25: B["2325"].start, dbl: B.doublewater.start, ben: B.benming.start, rev: B.revolt.start, monk: B.monk.start, ret: B.return.start,
  end: B.end.start, dates: B.dates.start, legend: B.legend.start, king: B.newking.start,
};
const END5 = B.answer.start;
export const m5: ChapterM = {
  name: "น้ำแรง",
  from: T5.l47,
  to: END5,
  cams: (w, h) => [
    { frame: T5.l47, cam: view(VW.thonWide, w, h, 0.9, 0.06) },
    { frame: T5.rev, cam: view(VW.plain, w, h, 0.92, 0.06) },
    { frame: T5.monk, cam: view(VW.thonWide, w, h, 0.95, 0.06) },
    { frame: T5.ret, cam: view(VW.cambodia, w, h, 0.92, 0.06) },
    { frame: T5.end, cam: view(VW.plain, w, h, 0.95, 0.06) },
    { frame: T5.legend, cam: view(VW.south, w, h, 0.9, 0.06) },
    { frame: T5.king, cam: view(VW.thonWide, w, h, 0.95, 0.06) },
  ],
  years: [[T5.l47, "2323"], [T5.y25, "2325"]],
  heads: [
    { f: T5.l47, tag: "ปี 2323 อายุราว 47", head: "วัยจรน้ำไก่", color: GOLD },
    { f: T5.water, tag: "โลหะให้กำเนิดน้ำ", head: "น้ำดึงพลังโลหะ", color: "#4a8df0" },
    { f: T5.hurt, tag: "วัยจรนี้", head: "ดาวทำลายขุนนาง", color: RED },
    { f: T5.src, tag: "หลักฐานไทยบรรยายว่า", head: "ฝึกกรรมฐาน · เฆี่ยนพระ", color: RED },
    { f: T5.cav, tag: "ข้อควรรู้", head: "เขียน/ชำระหลังรัชกาล", color: GOLD },
    { f: T5.hunger, tag: "บ้านเมืองลำบาก", head: "ข้าวขาดแคลน โจรชุกชุม", color: RED },
    { f: T5.y25, tag: "พ.ศ. 2325", head: "ปีน้ำเสือ", color: "#4a8df0" },
    { f: T5.dbl, tag: "น้ำปี + น้ำวัยจร", head: "ดึงพลังสองทาง", color: "#4a8df0" },
    { f: T5.ben, tag: "ปีนักษัตรตัวเอง", head: "เสือสามตัว", color: RED },
    { f: T5.rev, tag: "กบฏพระยาสรรค์", head: "บุกวังตอนตีสี่", color: RED, portrait: "phraya_san" },
    { f: T5.monk, tag: "พงศาวดารเล่าว่า", head: "ผนวชที่วัดแจ้ง", color: GOLD },
    { f: T5.ret, tag: "6 เม.ย. 2325", head: "ทัพถึงหน้าวัดโพธิ์", color: GOLD, portrait: "chakri" },
    { f: T5.end, tag: "พงศาวดารไทยเล่าว่า", head: "พระชนมายุ 48 (นับแบบเก่า)", color: RED },
    { f: T5.dates, tag: "วันสิ้นพระชนม์", head: "6, 7 หรือ 10 เม.ย.", color: GOLD },
    { f: T5.legend, tag: "ตำนานเขาขุนพนม", head: "ดูหลักฐานในตอน 4", color: GOLD },
    { f: T5.king, tag: "6 เม.ย. 2325", head: "เริ่มกรุงรัตนโกสินทร์", color: GOLD },
  ],
  Map: () => (
    <>
      <CityDot at={PL.thon} color={GOLD} r={14} start={T5.l47} />
      <Arrow points={ROUTE.revolt} start={T5.rev + 10} end={T5.rev + 70} color={RED} width={10} />
      <PointLabel at={PL.ayut} text="กรุงเก่า" start={T5.rev} color={RED} size={0.8} />
      <Ring at={PL.thon} r={22} color={RED} start={wp("revolt", "บุก", 0.8)} end={T5.monk + 30} />
      <PointLabel at={PL.watArun} text="วัดแจ้ง" start={T5.monk} color={GOLD} size={0.8} />
      <Arrow points={ROUTE.cambodiaBack} start={T5.ret} end={T5.ret + 70} color={TAK_C} width={10} />
      <PointLabel at={PL.siemreap} text="กัมพูชา" start={T5.ret} color={TAK_C} size={0.8} />
      <PointLabel at={PL.watPho} text="วัดโพธิ์" start={wp("return", "วัดโพธิ์", 0.85)} color={GOLD} size={0.8} />
      <CityDot at={PL.fort} color={RED} r={12} start={T5.end} />
      <PointLabel at={PL.fort} text="ป้อมวิไชยประสิทธิ์" start={T5.end + 10} color={RED} size={0.8} />
      <Arrow points={ROUTE.legend} start={T5.legend + 10} end={T5.legend + 70} color="#c9a7ff" width={8} variant="dashed" />
      <PointLabel at={PL.nakhonsi} text="นครศรีธรรมราช" start={T5.legend + 50} color="#c9a7ff" size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T5.l47, (s, e) => <QuenchScene id="m5q1" anchor={PL.thon} start={s} end={e} dip={s + 20} />],
        [T5.hurt, (s, e) => <QuenchScene id="m5q2" anchor={PL.thon} start={s} end={e} dip={s} deep={0.6} />],
        [T5.src, (s, e) => <At p={PL.thon}><MeditationScene id="m5med" start={s} end={e} /></At>],
        [T5.cav, (s, e) => <At p={PL.thon}><ScribeScene id="m5scribe" start={s} end={e} /></At>],
        [T5.hunger, (s, e) => <At p={PL.thon}><TributeScene id="m5trib" start={s} end={e} /></At>],
        [T5.y25, (s, e) => <QuenchScene id="m5q3" anchor={PL.thon} start={s} end={e} dip={s} deep={1} />],
        [T5.ben, (s, e) => <At p={PL.thon}><NightRiverScene id="m5night" start={s} end={e} /></At>],
        [T5.rev, (s, e) => <At p={PL.ayut}><NightCrossScene id="m5cross" start={s} end={e} /></At>],
        [wp("revolt", "บุก", 0.8), (s, e) => <At p={PL.thon}><WallAssaultScene id="m5wall" start={s} end={e} /></At>],
        [T5.monk, (s, e) => <At p={PL.thon}><OrdainScene id="m5ordain" start={s} end={e} /></At>],
        [T5.ret, (s, e) => <At p={PL.thon}><ArmyArriveScene id="m5army" start={s} end={e} /></At>],
        [T5.end, (s, e) => <At p={PL.thon}><FortScene id="m5fort" start={s} end={e} lower={s + 60} /></At>],
        [T5.dates, (s, e) => <At p={PL.thon}><RoyalChronicle id="m5chron" start={s} end={e} /></At>],
        [T5.legend, (s, e) => <At p={PL.nakhonsi}><DuskRiverScene id="m5dusk" start={s} end={e} /></At>],
        [T5.king, (s, e) => <At p={PL.thon}><DawnRiverScene id="m5dawn" start={s} end={e} /></At>],
      ], END5)}
    </>
  ),
  Screen: () => (
    <>
      <LuckRibbon show={[[T5.l47, T5.water - 4]]} head={[[T5.l47 + 10, 4]]} />
      <Cycle from="metal" to="water" label="โลหะให้กำเนิดน้ำ" start={T5.water + 6} end={T5.hurt - 4} />
      <YearChip gz="癸酉" label="วัยจรน้ำไก่" star="伤官 ดาวทำลายขุนนาง" from={T5.hurt + 6} to={T5.src - 4} />
      <YearChip gz="壬寅" label="ปีน้ำเสือ · 2325" star="ปีน้ำ + วัยจรน้ำ" from={T5.y25 + 6} to={T5.ben - 4} />
      <PillarSlam chars={["寅", "寅", "寅"]} at={[T5.ben + 4, T5.ben + 12, wp("benming", "สาม", 0.85)]} until={T5.rev - 4} y={0.33} text="ปีเกิด · วันเกิด · ปีจร" />
      <ThreeDates from={T5.dates + 6} to={T5.legend - 4} />
    </>
  ),
  sfx: [[T5.l47 + 10, SFX.pop, 0.25], [T5.ben + 4, SFX.hit, 0.3], [T5.ben + 12, SFX.hit, 0.3], [T5.rev, SFX.hit, 0.3], [T5.king, SFX.swell, 0.3]],
  Audio: () => (
    <>
      <Bed id="rain_light" from={T5.l47} to={T5.src + 30} volume={0.1} />
      <Bed id="wind" from={T5.src} to={T5.y25 + 30} volume={0.1} />
      <Bed id="rain_heavy" from={T5.y25} to={T5.rev + 30} volume={0.1} />
      <Bed id="crowd_riot" from={T5.rev} to={T5.monk + 20} volume={0.08} />
      <Hit id="gong" at={T5.monk + 10} volume={0.4} />
      <Bed id="army_marching" from={T5.ret} to={T5.end + 20} volume={0.1} />
      <Hit id="gong" at={T5.end + 60} volume={0.35} />
      <Bed id="wind" from={T5.end + 20} to={END5 + 30} volume={0.1} />
    </>
  ),
};

// Three possible death dates (6 · 7 · 10 April), no date picked.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, font } from "../news/kit";
const ThreeDates = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = width / 1080;
  if (frame < from - 2 || frame > to + 10) return null;
  const o = interpolate(frame, [from, from + 8, to, to + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.22, display: "flex", justifyContent: "center", gap: 24 * s, opacity: o, fontFamily: font }}>
      {["6", "7", "10"].map((d, i) => {
        const k = spring({ frame: frame - from - i * 8, fps, config: { damping: 13 } });
        return (
          <div key={d} style={{ width: 220 * s, background: "#f4ecd8", borderRadius: 20 * s, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.6)", transform: `scale(${0.6 + 0.4 * k}) rotate(${(i - 1) * 4}deg)`, opacity: k, textAlign: "center" }}>
            <div style={{ background: RED, color: "#fff", fontSize: 34 * s, fontWeight: 800, padding: `${6 * s}px 0` }}>เม.ย. 2325</div>
            <div style={{ fontSize: 130 * s, fontWeight: 900, color: "#2a1a10", lineHeight: 1.1 }}>{d}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- 6 · the answer ----------------
const T6 = { ans: B.answer.start, three: B.three.start, a: wp("three", "ไฟหมา", 0.3), b: wp("three", "ไฟหมู", 0.6), c: wp("three", "น้ำเสือ", 0.85), lim: B.limits.start, les: B.lesson.start };
const END6 = B.cta.start;
export const m6: ChapterM = {
  name: "คำตอบ",
  from: T6.ans,
  to: END6,
  cams: (w, h) => [
    { frame: T6.ans, cam: view(VW.region, w, h, 0.9, 0.06) },
    { frame: T6.three, cam: view(VW.plain, w, h, 0.85, 0.06) },
    { frame: T6.lim, cam: view(VW.siam, w, h, 0.9, 0.06) },
  ],
  years: [[T6.ans, "2277–2325"]],
  heads: [
    { f: T6.ans, tag: "กลับมาที่คำถาม", head: "ดวงตรงกับประวัติศาสตร์ไหม?", color: GOLD },
    { f: T6.three, tag: "วางสองชั้นคู่กัน", head: "3 จังหวะ", color: GOLD },
    { f: T6.lim, tag: "ข้อจำกัด", head: "อ่านย้อนหลัง · ดวงยังไม่ครบ", color: RED },
    { f: T6.les, tag: "ดวง = มุมมอง", head: "หลักฐาน = ความจริง", color: GOLD },
  ],
  Map: () => (
    <>
      <CityDot at={PL.ayut} color={RED} r={14} start={T6.a} />
      <PointLabel at={PL.ayut} text="ไฟหมา · อยุธยา" start={T6.a} color={RED} size={0.8} />
      <CityDot at={PL.thon} color={GOLD} r={14} start={T6.b} />
      <PointLabel at={PL.thon} text="ไฟหมู · ธนบุรี" start={T6.b} color={GOLD} size={0.8} />
    </>
  ),
  Panels: () => (
    <>
      {chain([
        [T6.ans, (s, e) => <At p={PL.thon}><ArchiveScene id="m6arch" start={s} end={e} /></At>],
        [T6.three, (s, e) => <ForgeScene id="m6forge" anchor={PL.ayut} start={s} end={e} heatAt={s} />],
        [T6.c, (s, e) => <QuenchScene id="m6q" anchor={PL.thon} start={s} end={e} dip={s} deep={1} />],
        [T6.lim, (s, e) => <At p={PL.thon}><FadedChronicle id="m6chron" start={s} end={e} variant="faded" /></At>],
        [T6.les, (s, e) => <At p={PL.thon}><ScribeScene id="m6scribe" start={s} end={e} /></At>],
      ], END6)}
    </>
  ),
  Screen: () => (
    <>
      <LuckRibbon show={[[T6.ans, T6.three - 4]]} head={[[T6.ans + 6, 2], [T6.ans + 40, 3], [T6.ans + 70, 4]]} />
      <ThreeYears from={T6.three} to={T6.lim - 4} items={[["丙戌", "ไฟหมา", "ถูกบีบ", T6.a], ["丁亥", "ไฟหมู", "ได้ตำแหน่ง", T6.b], ["壬寅", "น้ำเสือ", "จบลง", T6.c]]} />
      <TwoCards a={["หลักฐาน", "ความจริง"]} b={["ดวง", "มุมมอง"]} from={T6.les + 6} to={END6 - 6} />
    </>
  ),
  sfx: [[T6.a, SFX.pop, 0.25], [T6.b, SFX.pop, 0.25], [T6.c, SFX.pop, 0.25]],
  Audio: () => <Bed id="wind" from={T6.ans} to={END6 + 30} volume={0.1} />,
};

// ---------------- 7 · Mumate ----------------
const T7 = { cta: B.cta.start, poll: B.poll.start, next: B.next.start };
export const m7: ChapterM = {
  name: "× Mumate",
  from: T7.cta,
  to: B.next.end + 60,
  cams: (w, h) => [{ frame: T7.cta, cam: view(VW.region, w, h, 0.85, 0.06) }],
  years: [[T7.cta, "2569"]],
  heads: [],
  Map: () => null,
  Panels: () => null,
  Screen: () => (
    <>
      <MumateCTA from={T7.cta} to={T7.poll - 4} />
      <ElementPoll from={T7.poll} to={T7.next - 4} />
      <NextCard from={T7.next} to={B.next.end + 50} />
    </>
  ),
  sfx: [[T7.cta, SFX.swell, 0.3], [T7.poll, SFX.pop, 0.25]],
  Audio: () => <Bed id="wind" from={T7.cta} to={B.next.end + 60} volume={0.08} />,
};

const NextCard = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = width / 1080;
  if (frame < from - 2 || frame > to) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.22, textAlign: "center", fontFamily: font, color: "#fff", opacity: k }}>
      <div style={{ fontSize: 160 * s, fontWeight: 900, color: GOLD, textShadow: "0 6px 30px #000" }}>?</div>
      <div style={{ fontSize: 64 * s, fontWeight: 900, textShadow: "0 4px 20px #000" }}>ตอนหน้า ดวงของใคร?</div>
      <div style={{ fontSize: 36 * s, marginTop: 20 * s, opacity: 0.9 }}>ประวัติศาสตร์บนแผนที่ × Mumate</div>
    </div>
  );
};

export const M_CHAPTERS: ChapterM[] = [m0, m1, m2, m3, m4, m5, m6, m7];
