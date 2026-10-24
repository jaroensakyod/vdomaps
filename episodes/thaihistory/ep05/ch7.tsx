import { interpolate, useCurrentFrame } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C } from "../nrs/kit";
import { CityDot, MapTag, Zones } from "../nrs/map";
import { PL, VW } from "../nrs/places";
import { Backdrop, Banner, CompareScene, Fighter, Grass, LostRecordsScene, PAL, River, ScribeScene, ThroneLightScene, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 7 "หลักฐานเล่าไม่ตรงกัน" (beats warn → armysize): which chronicle tells the water-pouring, what
// "independence" meant then, what Thai and Burmese records agree on, and why army numbers differ tenfold.
const T = {
  warn: B.warn.start,
  redo: wf("warn", "ชำระ", 0.4),
  side: wf("warn", "เทียบ", 0.75),
  pr: B.prasoet.start,
  narai: wf("prasoet", "นารายณ์", 0.3),
  noWater: wf("prasoet", "ไม่", 0.85),
  later: B.later.start,
  r1: wf("later", "รัชกาล", 0.55),
  two: wf("later", "สองร้อย", 0.85),
  mean: B.meaning.start,
  king: wf("meaning", "กษัตริย์", 0.8),
  agree: B.agree.start,
  real: wf("agree", "จริง", 0.6),
  fail: wf("agree", "สำเร็จ", 0.95),
  size: B.armysize.start,
  tenk: wf("armysize", "หมื่น", 0.3),
  feed: wf("armysize", "เลี้ยง", 0.75),
};
const END = B.answer.start;

type Sc = { id: string; start: number; end: number };

// Two hills across a river: the Siamese banner on one, Hongsawadi's on the other — two kingdoms apart.
const ApartScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} ridges={false} light={[0.5, 0.25]} />
        <path d={`M${g.x - 50 * g.s} ${g.ground} Q${g.x + g.W * 0.2} ${g.ground - 150 * g.s} ${g.x + g.W * 0.42} ${g.ground} Z`} fill="#5b6e4a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <path d={`M${g.x + g.W * 0.58} ${g.ground} Q${g.x + g.W * 0.8} ${g.ground - 150 * g.s} ${g.x + g.W + 50 * g.s} ${g.ground} Z`} fill="#6a6a4a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <River g={g} y={g.ground - 6 * g.s} pan={pan} />
        <Banner x={g.x + g.W * 0.2 + pan * 0.3} y={g.ground - 110 * g.s} s={g.s * 1.3} color={RED} />
        <Banner x={g.x + g.W * 0.8 + pan * 0.3} y={g.ground - 110 * g.s} s={g.s * 1.3} color={PAL.chalk} />
        {[0, 1, 2].map((i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.1 + i * 0.07) + pan * 0.5} y={g.ground - (60 - i * 14) * g.s} scale={g.sc * 0.44} mode="stand" costume={C.siam} phase={i} />)}
        {[0, 1, 2].map((i) => <Fighter key={`b${i}`} x={g.x + g.W * (0.9 - i * 0.07) + pan * 0.5} y={g.ground - (60 - i * 14) * g.s} scale={g.sc * 0.44} flip mode="stand" costume={C.burma} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// Supplies: a column of soldiers longer than the panel, a handful of rice sacks and one cart (feeding an army).
const SupplyScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#7a8aa0", "#e8c890"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} />
        {Array.from({ length: 14 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.32 + i * 0.05) + ((lt * 0.5) % 40) * g.s + pan * 0.6} y={g.ground + 14 * g.s} scale={g.sc * 0.42} mode="walk" costume={i % 2 ? C.burma : C.siam} phase={i * 0.6} />)}
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={g.x + g.W * (0.08 + (i % 2) * 0.07) + pan * 0.8} cy={g.ground + (10 - Math.floor(i / 2) * 20) * g.s} rx={28 * g.s} ry={20 * g.s} fill="#d8c8a0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />)}
        <text x={g.x + g.W * 0.14} y={g.y + 80 * g.s} textAnchor="middle" fontSize={60 * g.s} fontWeight={900} fill="#fff" stroke={PAL.ink} strokeWidth={4 * g.s} paintOrder="stroke" opacity={interpolate(lt, [30, 50], [0, 1], clamp)}>?</text>
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export const e5c7: ChapterN = {
  name: "หลักฐานเล่าไม่ตรงกัน",
  from: B.warn.start,
  to: END,
  cams: (w, h) => [
    { frame: T.warn, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.pr, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.noWater, cam: view(VW.pegu, w, h, 0.95, 0.1) },
    { frame: T.mean, cam: view(VW.pegu, w, h, 0.95, 0.1) },
    { frame: T.agree, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.size, cam: view(VW.region, w, h, 0.9, 0.1) },
  ],
  years: [[T.warn, "2127"]],
  heads: [
    ...heads(["warn"], { warn: { color: RED } }),
    ...heads(["prasoet"], { prasoet: { stat: "ราว 2223", label: "สมัยสมเด็จพระนารายณ์" } }),
    ...heads(["later"], { later: { stat: "2338", label: "ฉบับพันจันทนุมาศ (เจิม) · โดยประมาณ" } }),
    ...heads(["meaning", "agree"]),
    ...heads(["armysize"], { armysize: { chips: [{ text: "ไทย: หลักแสน", f: T.size + 20 }, { text: "พม่า: หลักหมื่น", f: T.tenk }] } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zk = interpolate(frame, [T.agree, T.agree + 20], [0, 1], clamp);
    return (
      <>
        <Zones k={{ burma: zk, siam: zk }} />
        <CityDot at={PL.khraeng} color={GOLD} r={12} start={T.pr} end={T.mean + 40} />
        <PointLabel at={PL.khraeng} text="เมืองแครง" start={T.noWater - 20} color={GOLD} size={0.8} />
        <MapTag at={[PL.khraeng[0], PL.khraeng[1] - 0.15]} text="หลั่งน้ำ?" start={T.noWater} end={T.mean + 30} color="#ff8a7a" size={34} />
        <CityDot at={PL.pegu} color={RED} r={14} start={T.agree} />
        <CityDot at={PL.ayut} color={GOLD} r={14} start={T.agree} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.agree + 8} color={GOLD} size={0.8} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.agree + 8} color={RED} size={0.8} />
        <MapTag at={[99.3, 16.0]} text="แยกตัว 2127" start={T.real} end={T.size} color={GOLD} size={36} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.warn, (a, b) => <LostRecordsScene id="e5c7lost" start={a} end={b} />],
        [T.pr, (a, b) => <ScribeScene id="e5c7khoi" book="khoi" at={PL.ayut} start={a} end={b} />],
        [T.later, (a, b) => <CompareScene id="e5c7cmp" left="khoi" right="khoi" tilt={1} start={a} end={b} />],
        [T.mean, (a, b) => <ThroneLightScene id="e5c7throne" start={a} end={b} />],
        [T.agree, (a, b) => <ApartScene id="e5c7apart" start={a} end={b} />],
        [T.size, (a, b) => <SupplyScene id="e5c7supply" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.noWater, SFX.pop, 0.3],
    [T.two, SFX.pop, 0.3],
    [T.size + 20, SFX.pop, 0.3],
    [T.tenk, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.warn} to={T.mean} volume={0.18} />
      <Hit id="gong" at={T.mean + 4} volume={0.3} />
      <Bed id="wind" from={T.agree} to={END} volume={0.15} />
      <Bed id="army_marching" from={T.size} to={END} volume={0.12} />
    </>
  ),
};
