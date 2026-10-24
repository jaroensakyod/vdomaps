import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, FloodLayer, GOLD, QuizNews, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C } from "../nrs/kit";
import { BattleMark, CityDot, MapTag, Ring } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { Backdrop, CompareScene, Fighter, Grass, IslandScene, PAL, RetreatScene, SiegeCampScene, SwordClimbScene, Tree, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 6 "ล้อมกรุงศรีอยุธยา" (beats invade → water, พ.ศ. 2129–2130): Nanda Bayin's siege, the army
// numbers, the island city, the sword in the mouth, Lak Wai Thammu, hunger and retreat; quiz: why leave before the rains?
const T = {
  inv: B.invade.start,
  two: wf("invade", "สอง", 0.45),
  ring: wf("invade", "ล้อม", 0.75),
  nums: B.nums.start,
  big: wf("nums", "แสน", 0.25),
  small: wf("nums", "หมื่น", 0.65, 1),
  ten: wf("nums", "สิบ", 0.9),
  isl: B.island.start,
  three: wf("island", "สาม", 0.35),
  wall: wf("island", "กำแพง", 0.6),
  sword: B.sword.start,
  raid: wf("sword", "ปล้น", 0.35),
  mouth: wf("sword", "คาบ", 0.65),
  fell: B.fell.start,
  spear: wf("fell", "แทง", 0.2),
  again: wf("fell", "ใหม่", 0.55),
  nameS: wf("fell", "พระแสง", 0.8),
  lak: B.lakwai.start,
  trap: wf("lakwai", "ซุ่ม", 0.45),
  lance: wf("lakwai", "ทวน", 0.75),
  hunger: B.hunger.start,
  sick: wf("hunger", "เจ็บ", 0.4),
  leak: wf("hunger", "เล็ดลอด", 0.85),
  ret: B.retreat.start,
  order: wf("retreat", "ถอย", 0.4),
  chase: wf("retreat", "ไล่", 0.6),
  quiz: B.quiz2.start,
  water: B.water.start,
  flood: wf("water", "ท่วม", 0.4),
  best: wf("water", "กำแพง", 0.85),
};
const END = B.warn.start;
const REVEAL = T.water - 2;
const FALLS = [T.spear, T.spear + 50];

type Sc = { id: string; start: number; end: number };

// Lak Wai Thammu's ambush in the scrub: hidden spearmen rise; the prince's lance strikes the commander down.
const LakwaiScene = ({ id, start, end, at }: Sc & { at: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#4a5a6a", "#d8b880"]} accent={GOLD} hits={[at]}>
      {(g, pan, lt) => {
        const rise = interpolate(lt, [10, 30], [0, 1], clamp);
        const down = interpolate(frame, [at + 4, at + 24], [0, 1], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.8, 0.3]} />
            {[0.55, 0.7, 0.86].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 1.2} />)}
            {[0, 1, 2].map((i) => <g key={i} transform={`translate(0,${(1 - rise) * 40 * g.s})`}><Fighter x={g.x + g.W * (0.6 + i * 0.1) + pan * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.52} flip mode="attack" costume={C.burma} phase={i} /></g>)}
            <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.7},${g.ground + 20 * g.s}) rotate(${down * 70})`}>
              <Fighter x={0} y={0} scale={g.sc * 0.58} flip mode="stand" costume={C.burmaRed} />
            </g>
            <Fighter x={g.x + g.W * 0.36 + pan * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.66} mode={frame >= at - 10 && frame < at + 6 ? "attack" : "stand"} costume={C.prince} phase={0} />
            {[0, 1].map((i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.14 + i * 0.1) + pan * 0.8} y={g.ground + 26 * g.s} scale={g.sc * 0.56} mode="run" costume={C.siam} phase={i} />)}
            <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
          </g>
        );
      }}
    </V2>
  );
};

export const e5c6: ChapterN = {
  name: "ล้อมกรุงศรีอยุธยา",
  from: B.invade.start,
  to: END,
  cams: (w, h) => [
    { frame: T.inv, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.two, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.ring, cam: view(VW.central, w, h, 1.0, 0.1) },
    { frame: T.isl, cam: view(VW.central, w, h, 1.0, 0.1) },
    { frame: T.three, cam: view(VW.ayut, w, h, 0.9, 0.1) },
    { frame: T.sword, cam: view(VW.ayut, w, h, 0.75, 0.1) },
    { frame: T.hunger, cam: view(VW.ayut, w, h, 0.75, 0.1) },
    { frame: T.ret, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.chase, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.quiz, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.water, cam: view(VW.central, w, h, 1.0, 0.1) },
  ],
  years: [[T.inv, "2129"], [T.ret, "2130"]],
  heads: [
    ...heads(["invade"], { invade: { portrait: "nanda_bayin", color: RED } }),
    ...heads(["nums"], { nums: { stat: (f: number) => (f < T.small ? "250,000" : "25,000"), label: "คน", color: RED } }),
    ...heads(["island"], { island: { chips: [{ text: "แม่น้ำ 3 สาย", f: T.three }, { text: "กำแพงแข็งแรง", f: T.wall }] } }),
    ...heads(["sword"], { sword: { portrait: "naresuan_prince" } }),
    ...heads(["fell", "lakwai", "hunger"], { hunger: { color: RED } }),
    ...heads(["retreat"]),
    { f: T.quiz, tag: "", head: "" },
    ...heads(["water"], { water: { color: "#4fa3ff" } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fk = interpolate(frame, [T.flood - 10, T.flood + 50], [0, 1], clamp);
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={16} />
        <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T.inv} color={GOLD} size={0.8} />
        <Arrow points={R.nandaNorth} start={T.two} end={T.two + 40} color={RED} width={14} />
        <Arrow points={R.nandaWest} start={T.two + 10} end={T.two + 50} color={RED} width={14} />
        <Ring at={PL.ayut} r={0.07} start={T.ring} end={T.ret} />
        <MapTag at={[100.566, 14.25]} text="ค่ายข้าศึก (โดยประมาณ)" start={T.ring + 10} end={T.isl + 20} size={24} />
        <BattleMark at={PL.pakkhu} start={T.raid} end={T.lak} color={GOLD} size={0.8} />
        <BattleMark at={[100.5, 14.3]} start={T.lance} end={T.hunger} color={GOLD} size={0.8} />
        <Arrow points={R.retreat1587} start={T.order} end={T.order + 50} color={RED} width={14} variant="dashed" />
        <Arrow points={[[100.5, 14.3], [100.0, 14.15], [99.6, 14.0]]} start={T.chase} end={T.chase + 30} color={GOLD} width={12} />
        <FloodLayer at={PL.ayut} radius={0.4} k={fk} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.inv, (a, b) => <SiegeCampScene id="e5c6camp" start={a} end={b} />],
        [T.nums, (a, b) => <CompareScene id="e5c6cmp" left="khoi" right="parabaik" tilt={-1} start={a} end={b} />],
        [T.isl, (a, b) => <IslandScene id="e5c6isl" start={a} end={b} />],
        [T.sword, (a, b) => <SwordClimbScene id="e5c6climb" start={a} end={b} />],
        [T.fell, (a, b) => <SwordClimbScene id="e5c6fall" falls={FALLS} start={a} end={b} />],
        [T.lak, (a, b) => <LakwaiScene id="e5c6lak" at={T.lance} start={a} end={b} />],
        [T.hunger, (a, b) => <SiegeCampScene id="e5c6sick" sick start={a} end={b} />],
        [T.ret, (a, b) => <RetreatScene id="e5c6ret" start={a} end={b} />],
      ],
      T.quiz,
    ).concat([<g key="w">{chain([[T.water, (a, b) => <IslandScene id="e5c6flood" flood={1} start={a} end={b} />]], END)}</g>]),
  Screen: () => <QuizNews title="ลองคิดดู" question="ทำไมต้องถอยก่อนหน้าฝน?" options={["น้ำจะท่วมทุ่งรอบกรุง", "ช้างกลัวฝน", "ฝนทำให้ปืนใช้ไม่ได้"]} answer={0} start={T.quiz} reveal={REVEAL} end={T.water + 26} color={GOLD} />,
  sfx: [
    [T.two, SFX.whoosh, 0.3],
    [T.three, SFX.pop, 0.3],
    [T.wall, SFX.pop, 0.3],
    [T.quiz, SFX.pop, 0.35],
    [REVEAL - 90, SFX.tick, 0.3],
    [REVEAL - 60, SFX.tick, 0.3],
    [REVEAL - 30, SFX.tick, 0.3],
    [REVEAL, SFX.hit, 0.45],
  ],
  night: (f) => interpolate(f, [T.sword - 10, T.sword + 10, T.lak - 10, T.lak + 10], [0, 0.7, 0.7, 0], clamp),
  Audio: () => (
    <>
      <Bed id="war_drums" from={T.inv} to={T.isl} volume={0.3} />
      <Bed id="army_marching" from={T.two} to={T.ring + 30} volume={0.2} />
      <Hit id="gong" at={T.ring} volume={0.35} />
      <Bed id="crowd_angry" from={T.isl} to={T.sword} volume={0.1} />
      <Bed id="fire_crackle" from={T.sword} to={T.lak} volume={0.2} />
      <Hit id="sword_draw" at={T.mouth} volume={0.4} />
      {FALLS.map((f) => <Hit key={f} id="sword_clash" at={f} volume={0.4} />)}
      <Hit id="battle_cry" at={T.trap} volume={0.35} />
      <Hit id="sword_battle" at={T.lance} volume={0.45} />
      <Bed id="wind" from={T.hunger} to={T.ret} volume={0.18} />
      <Bed id="rain_light" from={T.ret} to={T.quiz} volume={0.2} />
      <Bed id="rain_heavy" from={T.water} to={END + 10} volume={0.2} />
    </>
  ),
};
