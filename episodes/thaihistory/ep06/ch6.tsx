import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot, MapFlag } from "../ep05/beatsKit";
import { B, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { ApproxNote, Battle, DateCard, Poll2 } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { FULL_ROUTE, PL, ROUTE, VW } from "./places";
import { ChanthaburiScene, CityGlowScene, GrowingColumnScene, MarchOutScene, ProclaimScene } from "./scenes";

// Closing (prince → poll): "Chao Tak", the answer on the whole map, the fall of the capital, Chanthaburi next.
const T = {
  prince: B.prince.start,
  self: wp("prince", "ตั้งตัว", 0.4),
  name: wp("prince", "เจ้าตาก", 0.92),
  answer: B.answer.start,
  fight: wp("answer", "สู้", 0.45),
  more: wp("answer", "เพิ่ม", 0.95),
  fall: B.fall.start,
  apr: wp("fall", "เมษายน", 0.65),
  broke: wp("fall", "แตก", 0.95),
  next: B.next.start,
  chan: wp("next", "จันทบุรี", 0.6),
  poll: B.poll.start,
  a: wp("poll", "เดิน", 0.4),
  b: wp("poll", "ย้อน", 0.55),
  btn: wp("poll", "คอมเมนต์", 0.85),
};
export const E6_END = B.poll.end + 60;
const BATTLES: [number, number][] = [PL.hantra, PL.phosaohan, PL.phrannok, PL.bandong, PL.battle, PL.rayong];

export const e6c6: Chapter6 = {
  name: "คำตอบ",
  from: T.prince,
  to: E6_END,
  cams: (w, h) => [
    { frame: T.prince, cam: view(VW.rayong, w, h, 0.85, 0.06) },
    { frame: T.answer, cam: view(VW.route, w, h, 0.95, 0.06) },
    { frame: T.next, cam: view(VW.east, w, h, 0.95, 0.06) },
  ],
  years: [[T.prince, "2310"]],
  heads: [
    { f: T.prince, tag: "ที่ระยอง", head: "ตั้งตัวเป็นเจ้า", color: GOLD },
    { f: T.name, tag: "คนเริ่มเรียกว่า", head: "เจ้าตาก", color: GOLD },
    { f: T.answer, tag: "คำตอบ", head: "ไม่ได้หนีอย่างเดียว สู้ไปตลอดทาง", stat: "ราว 3", label: "สัปดาห์ถึงระยอง", color: GOLD },
    { f: T.more, tag: "ชนะทุกครั้ง", head: "คนเพิ่ม ช้างเพิ่ม อาวุธเพิ่ม", color: GOLD },
    { f: T.fall, tag: "7 เม.ย. 2310", head: "กรุงศรีอยุธยาแตก", color: RED },
    { f: T.next, tag: "เป้าหมายต่อไป", head: "เมืองจันทบุรี", color: GOLD },
    { f: T.poll, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const full = interpolate(frame, [T.answer, T.answer + 15, T.next, T.next + 20], [0, 1, 1, 0.5], clamp);
    return (
      <>
        <g opacity={full}>
          <Arrow points={FULL_ROUTE} start={T.answer} end={T.answer + 60} color={TAK_C} width={14} />
        </g>
        {BATTLES.map((p, i) => <Battle key={i} at={p} start={T.fight + i * 4} end={T.fall} color={GOLD} size={0.9} />)}
        <CityDot at={PL.ayut} color={RED} r={16} start={T.fall} />
        <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T.fall + 6} color={RED} size={0.85} />
        <Battle at={PL.ayut} start={T.broke} end={E6_END} color={RED} size={1.2} />
        <Arrow points={ROUTE.chan} start={T.chan - 10} end={T.chan + 30} color={TAK_C} width={12} variant="dashed" />
        <CityDot at={PL.chanthaburi} color={TAK_C} r={14} start={T.chan} />
        <PointLabel at={PL.chanthaburi} text="จันทบุรี" start={T.chan} color={TAK_C} size={0.9} />
        <MapFlag at={PL.chanthaburi} color={GOLD} start={T.chan + 10} />
      </>
    );
  },
  Panels: () => (
    <>
      <ProclaimScene id="e6proclaim" anchor={PL.rayong} start={T.prince} end={T.answer + 14} />
      <GrowingColumnScene id="e6grow2" anchor={PL.rayong} start={T.answer} end={T.fall + 14} />
      <CityGlowScene id="e6fall" anchor={PL.ayut} start={T.fall} end={T.next + 14} ruin />
      <ChanthaburiScene id="e6chan" anchor={PL.chanthaburi} start={T.next} end={T.poll + 14} />
      <MarchOutScene id="e6march2" anchor={PL.rayong} start={T.poll} end={E6_END} />
    </>
  ),
  Screen: () => (
    <>
      <ApproxNote from={T.answer} to={T.fall} />
      <DateCard start={T.fall} end={T.next} day="7" month="เมษายน" year="2310" />
      <Poll2 start={T.poll} end={E6_END} a={T.a} b={T.b} button={T.btn} />
    </>
  ),
  sfx: [
    [T.name, SFX.hit, 0.35],
    [T.fight, SFX.pop, 0.25],
    [T.fall - 6, SFX.whoosh, 0.25],
    [T.chan, SFX.pop, 0.3],
    [T.a, SFX.pop, 0.3],
    [T.b, SFX.pop, 0.3],
    [T.btn, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.prince} to={T.answer + 30} volume={0.12} />
      <Hit id="gong" at={T.name} volume={0.45} />
      <Bed id="army_marching" from={T.answer} to={T.fall + 30} volume={0.14} />
      <Bed id="fire_big" from={T.fall} to={T.next + 30} volume={0.16} />
      <Hit id="explosion_far" at={T.broke} volume={0.35} />
      <Bed id="wind" from={T.next} to={E6_END} volume={0.14} />
      <Hit id="war_horn" at={T.chan} volume={0.3} />
    </>
  ),
};
