import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { ApproxNote, Battle } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { AfterSmokeScene, BurmeseBoatsScene, FordScene, TrenchScene, WaitCampScene } from "./scenes";

// Chapter 4 (crossing → ironic): across at Dan Kob Jae, the Burmese come again from Pak Nam Jo Lo, three volleys.
const T = {
  crossing: B.crossing.start,
  kob: wp("crossing", "กบ", 0.4),
  prachin: wp("crossing", "ปราจีน", 0.7),
  wait: B.wait.start,
  cy: wp("wait", "เชียงเงิน", 0.6),
  burma2: B.burma2.start,
  jolo: wp("burma2", "โจ้", 0.4),
  land: wp("burma2", "บก", 0.6),
  boats: wp("burma2", "เรือ", 0.7),
  trap: B.trap.start,
  dig: wp("trap", "เพลาะ", 0.3),
  hold: wp("trap", "ห้าม", 0.65),
  volley: B.volley.start,
  all: wp("volley", "พร้อม", 0.5),
  ironic: B.ironic.start,
  when: wp("ironic", "ตอนไหน", 0.9),
};
const END = B.coast.start;
// Three volleys ≥ 22 frames apart (each flash rises 3 frames and fades 14 — no strobing).
const V = [T.all, T.all + 24, T.all + 48];

export const e6c4: Chapter6 = {
  name: "ศึกปากน้ำโจ้โล้",
  from: T.crossing,
  to: END,
  cams: (w, h) => [
    { frame: T.crossing, cam: view(VW.prachin, w, h, 0.9, 0.06) },
    { frame: T.burma2, cam: view(VW.prachin, w, h, 1.0, 0.06) },
    { frame: T.trap, cam: view(VW.prachin, w, h, 1.15, 0.04) },
  ],
  years: [[T.crossing, "2310"]],
  heads: [
    { f: T.crossing, tag: "ด่านกบแจะ", head: "ข้ามเข้าเขตปราจีนบุรี", color: GOLD },
    { f: T.wait, tag: "หยุดตั้งค่าย", head: "รอคนที่ตามมาทีหลัง", color: GOLD },
    { f: T.cy, tag: "มาช้า", head: "พระเชียงเงินถูกลงโทษ", color: RED },
    { f: T.burma2, tag: "ทัพพม่าระลอกใหม่", head: "จากปากน้ำโจ้โล้", color: RED, chips: [{ text: "ทางบก", f: T.land }, { text: "ทางเรือ", f: T.boats }] },
    { f: T.trap, tag: "ตั้งรับ", head: "ห้ามยิง จนกว่าจะใกล้", color: GOLD },
    { f: T.volley, tag: "ยิงพร้อมกัน", head: "ปืนทุกกระบอก", stat: (f: number) => `${Math.max(1, V.filter((v) => f >= v).length)}`, label: "/ 3 ชุด", color: RED },
    { f: T.ironic, tag: "ชนะที่โจ้โล้", head: "รู้ว่าควรยิงตอนไหน", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const red = interpolate(frame, [T.ironic, T.ironic + 30], [1, 0.25], clamp);
    return (
      <>
        <Arrow points={ROUTE.prachin.slice(0, 3)} start={T.crossing} end={T.kob + 10} color={TAK_C} width={12} />
        <PointLabel at={PL.kobjae} text="ด่านกบแจะ" start={T.kob} color={TAK_C} size={0.75} />
        <Arrow points={ROUTE.prachin.slice(2)} start={T.prachin} end={T.wait} color={TAK_C} width={12} />
        <CityDot at={PL.prachin} color={TAK_C} r={10} start={T.prachin} />
        <PointLabel at={PL.prachin} text="ปราจีนบุรี" start={T.prachin} color={TAK_C} size={0.75} />
        <CityDot at={PL.jolo} color={BURMA_C} r={12} start={T.jolo - 4} />
        <PointLabel at={PL.jolo} text="ปากน้ำโจ้โล้" start={T.jolo} color={BURMA_C} size={0.8} />
        <Arrow points={[PL.jolo, [101.3, 13.82], [101.34, 13.88]]} start={T.land} end={T.land + 30} color={BURMA_C} width={11} opacity={red} />
        <Arrow points={[PL.jolo, [101.37, 13.78], [101.4, 13.86], [101.38, 13.89]]} start={T.boats} end={T.boats + 30} color={BURMA_C} width={11} variant="dashed" opacity={red} />
        <Battle at={PL.battle} start={V[0]} end={END + 20} color={GOLD} size={1.2} />
      </>
    );
  },
  Panels: () => (
    <>
      <FordScene id="e6ford" anchor={PL.kobjae} start={T.crossing} end={T.wait + 14} />
      <WaitCampScene id="e6wait" anchor={PL.battle} start={T.wait} end={T.burma2 + 14} />
      <BurmeseBoatsScene id="e6boats" anchor={PL.jolo} start={T.burma2} end={T.trap + 14} />
      <TrenchScene id="e6trench" anchor={PL.battle} start={T.trap} end={T.volley + 14} close={1} />
      <TrenchScene id="e6volley" anchor={PL.battle} start={T.volley} end={T.ironic + 14} volleys={V} />
      <AfterSmokeScene id="e6after" anchor={PL.battle} start={T.ironic} end={END + 14} />
    </>
  ),
  Screen: () => <ApproxNote from={T.burma2} to={END} text="จุดรบโจ้โล้ = แนวโดยประมาณ (หลักฐานต่างกัน)" />,
  sfx: [
    [T.kob, SFX.pop, 0.25],
    [T.land, SFX.pop, 0.25],
    [T.boats, SFX.pop, 0.25],
    [T.hold, SFX.tick, 0.3],
    [T.when, SFX.hit, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="ship_sailing" from={T.crossing} to={T.wait + 30} volume={0.14} />
      <Hit id="splash" at={T.crossing + 20} volume={0.35} />
      <Bed id="fire_crackle" from={T.wait} to={T.burma2 + 30} volume={0.14} />
      <Bed id="war_drums" from={T.burma2} to={T.volley + 10} volume={0.16} />
      <Bed id="army_march_crowd" from={T.trap} to={T.volley + 30} volume={0.14} />
      {V.map((v) => <Hit key={v} id="rifle_echo" at={v} volume={0.8} />)}
      {V.map((v) => <Hit key={`c${v}`} id="cannon_far" at={v + 2} volume={0.35} />)}
      <Bed id="wind" from={T.ironic} to={END + 40} volume={0.16} />
    </>
  ),
};
