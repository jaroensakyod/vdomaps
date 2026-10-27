import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { Compare } from "../ep05/cards";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { Battle, CampRing } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, VW } from "./places";
import { ChroniclesScene, FloodFightScene, GateRideScene, InquiryScene, PowderStoreScene, RampartGunScene, WallLookoutScene } from "./scenes";

// Chapter 1 (who → debate): why Phraya Tak decided to leave the besieged capital.
const T = {
  who: B.who.start,
  tak: wp("who", "ตาก", 0.4),
  defend: wp("who", "ป้องกัน", 0.7),
  gun: B.gun.start,
  ask: wp("gun", "อนุญาต", 0.7),
  fired: B.fired.start,
  fire: wp("fired", "ยิง", 0.4),
  probe: wp("fired", "สอบสวน", 0.8),
  phet: B.phet.start,
  sang: wp("phet", "สังฆาวาส", 0.7),
  judge: B.judge.start,
  out: wp("judge", "ข้างนอก", 0.65),
  debate: B.debate.start,
  flee: wp("debate", "หนี", 0.45),
  order: wp("debate", "รับสั่ง", 0.6),
  real: wp("debate", "จริง", 0.85),
};
const END = B.phichai.start;

export const e6c1: Chapter6 = {
  name: "ทำไมต้องออก",
  from: T.who,
  to: END,
  cams: (w, h) => [
    { frame: T.who, cam: view(VW.siam, w, h, 0.9, 0.06) },
    { frame: T.gun, cam: view(VW.island, w, h, 0.85, 0.06) },
    { frame: T.phet, cam: view(VW.hook, w, h, 1.1, 0.06) },
    { frame: T.judge, cam: view(VW.hook, w, h, 0.95, 0.06) },
  ],
  years: [[T.who, "2309"]],
  heads: [
    { f: T.who, tag: "พระยาตาก (สิน)", head: "เจ้าเมืองตาก", color: GOLD, portrait: "taksin_general" },
    { f: T.defend, tag: "พ.ศ. 2309", head: "ถูกเรียกมาป้องกันกรุง", color: GOLD },
    { f: T.gun, tag: "ในกรุง", head: "ดินปืนเริ่มขาด", color: RED },
    { f: T.ask, tag: "คำสั่ง", head: "ยิงทุกนัดต้องขออนุญาต", color: RED },
    { f: T.fired, tag: "ยิงโดยไม่ขอ", head: "ถูกสอบสวนเอาผิด", color: RED },
    { f: T.phet, tag: "ศึกวัดสังฆาวาส", head: "พระยาเพชรบุรีตาย", color: RED },
    { f: T.judge, tag: "อยู่ หรือ ออก", head: "ออกไปรวมคนกลับมาสู้", color: GOLD },
    { f: T.debate, tag: "นักประวัติศาสตร์", head: "ยังถกเถียงกันอยู่", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ring = interpolate(frame, [T.who, T.gun], [0.6, 1], clamp) * interpolate(frame, [END - 10, END + 10], [1, 0.7], clamp);
    return (
      <>
        <CampRing k={ring} />
        <CityDot at={PL.ayut} color={RED} r={14} start={T.who} />
        <CityDot at={PL.tak} color={TAK_C} r={14} start={T.tak - 6} end={T.gun} />
        {frame < T.gun && <PointLabel at={PL.tak} text="เมืองตาก" start={T.tak} color={TAK_C} size={0.85} />}
        <Arrow points={[PL.tak, [99.9, 15.6], PL.ayut]} start={T.tak} end={T.defend + 10} color={TAK_C} width={10} variant="dashed" opacity={interpolate(frame, [T.gun, T.gun + 15], [1, 0], clamp)} />
        <Battle at={PL.sangkhawat} start={T.sang - 4} end={T.judge} />
        {frame >= T.phet && frame < T.judge + 10 && <PointLabel at={PL.sangkhawat} text="วัดสังฆาวาส (ประมาณ)" start={T.sang} color={BURMA_C} size={0.75} />}
      </>
    );
  },
  Panels: () => (
    <>
      <GateRideScene id="e6gate" anchor={PL.ayut} start={T.who} end={T.gun + 14} />
      <PowderStoreScene id="e6powder" anchor={PL.ayut} start={T.gun} end={T.fired + 14} />
      <RampartGunScene id="e6gun" anchor={PL.ayut} start={T.fired} end={T.probe + 14} fire={T.fire + 8} />
      <InquiryScene id="e6inq" anchor={PL.ayut} start={T.probe} end={T.phet + 14} />
      <FloodFightScene id="e6flood" anchor={PL.sangkhawat} start={T.phet} end={T.judge + 14} shots={[T.phet + 20, T.sang + 6]} />
      <WallLookoutScene id="e6look2" anchor={PL.ayut} start={T.judge} end={T.debate + 14} />
      <ChroniclesScene id="e6chron" anchor={PL.ayut} start={T.debate} end={T.flee + 14} />
    </>
  ),
  Screen: () => (
    <Compare start={T.flee} end={END} title="ทำไมพระยาตากออกจากกรุง" left={{ tag: "บางคนว่า", text: "หนี", color: "#ff6b5f", f: T.flee, icon: "book" }} right={{ tag: "บางคนว่า", text: "มีรับสั่งให้ออก", color: GOLD, f: T.order, icon: "thai" }} stamp={{ text: "ออกไปจริง กลับมาจริง", f: T.real, color: GOLD }} />
  ),
  sfx: [
    [T.tak, SFX.pop, 0.3],
    [T.ask, SFX.tick, 0.3],
    [T.probe, SFX.hit, 0.3],
    [T.flee, SFX.pop, 0.3],
    [T.order, SFX.pop, 0.3],
    [T.real, SFX.hit, 0.35],
  ],
  Audio: () => (
    <>
      <Hit id="horse_neigh" at={T.who + 12} volume={0.35} />
      <Bed id="horse_gallop" from={T.who} to={T.gun + 30} volume={0.12} />
      <Bed id="fire_crackle" from={T.gun} to={T.fired + 40} volume={0.16} />
      <Hit id="cannon_old" at={T.fire + 8} volume={0.7} />
      <Hit id="gong" at={T.probe + 4} volume={0.3} />
      <Bed id="firefight" from={T.phet} to={T.judge + 30} volume={0.14} />
      <Hit id="cannon_far" at={T.phet + 20} volume={0.4} />
      <Hit id="cannon_far" at={T.sang + 6} volume={0.4} />
      <Bed id="wind" from={T.judge} to={END + 40} volume={0.16} />
    </>
  ),
};
