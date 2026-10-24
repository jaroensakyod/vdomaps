import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Tent } from "../nrs/kit";
import { BattleMark, CityDot, MapTag, Ring } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { BattleScene, Candle, CompareScene, CoronationScene, MarchScene, Noble, PAL, PassScene, RetreatScene, RiverCampScene, SiegeCampScene, SkirtScene, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 1 "ก่อนศึก" (beats recap → plan, พ.ศ. 2130–2135): recap, Naresuan crowned, the crown prince's
// first try and Nanda's anger, the last invasion in three columns, the numbers, the camp at Nong Sarai and the plan.
const T = {
  recap: B.recap.start,
  back: wf("recap", "ถอย", 0.85),
  crown: B.crown.start,
  king: wf("crown", "ครองราชย์", 0.35),
  ekat: wf("crown", "เอกาทศรถ", 0.75),
  test: B.test.start,
  come: wf("test", "ยก", 0.7),
  lose: wf("test", "พ่าย", 0.9),
  scold: B.scold.start,
  skirt: wf("scold", "ผ้า", 0.7),
  again: wf("scold", "อีก", 0.92),
  march: B.march.start,
  pass: wf("march", "เจดีย์", 0.4),
  lamao: wf("march", "ละเมา", 0.65),
  navy: wf("march", "เรือ", 0.88),
  size: B.size.start,
  small: wf("size", "หมื่น", 0.6, 1),
  turn: B.turn.start,
  khmer: wf("turn", "เขมร", 0.2),
  suphan: wf("turn", "สุพรรณบุรี", 0.55),
  camp: wf("turn", "หนอง", 0.75),
  plan: B.plan.start,
  feint: wf("plan", "ถอย", 0.35),
  strike: wf("plan", "ตี", 0.9),
};
const END = B.dawn.start;
const TEST = [T.come + 20, T.come + 44];

type Sc = { id: string; start: number; end: number };

// War council: the king and his generals kneel round a cloth map by lamplight; markers move on it.
const CouncilScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
      {(g, pan, lt) => {
        const back = interpolate(lt, [20, 60], [0, 1], clamp);
        const fwd = interpolate(lt, [90, 120], [0, 1], clamp);
        const cx = g.x + g.W * 0.5 + pan * 0.5;
        const cy = g.ground - 20 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1a10" />
            <Tent x={cx} y={g.ground + 40 * g.s} w={g.W * 1.1} s={g.s} color="#4a2a18" stripe={RED} lit={0.3} />
            <path d={`M${cx - 200 * g.s} ${cy} L${cx + 200 * g.s} ${cy} L${cx + 160 * g.s} ${cy - 60 * g.s} L${cx - 160 * g.s} ${cy - 60 * g.s} Z`} fill="#e9dcc0" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <path d={`M${cx - 150 * g.s} ${cy - 30 * g.s} Q${cx} ${cy - 50 * g.s} ${cx + 150 * g.s} ${cy - 20 * g.s}`} stroke="#4a8ab0" strokeWidth={3 * g.s} fill="none" />
            <circle cx={cx + (40 - back * 60 + fwd * 120) * g.s} cy={cy - 28 * g.s} r={9 * g.s} fill={RED} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            {[0, 1, 2].map((i) => <circle key={i} cx={cx + (100 + i * 22 - back * 40) * g.s} cy={cy - (18 + i * 8) * g.s} r={7 * g.s} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
            <Noble x={cx - 250 * g.s} y={g.ground - 4 * g.s} scale={g.sc * 0.7} mode="sit" jacket="#9a2a1e" />
            {[0, 1, 2].map((i) => <Noble key={i} x={cx + (230 + i * 70) * g.s} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode="kneel" flip bow={0.4 + 0.2 * Math.sin(frame * 0.05 + i)} phase={i} jacket={["#efe6d0", PAL.indigo, "#c9b48a"][i]} />)}
            <Candle x={cx - 180 * g.s} y={cy} s={g.s * 1.3} />
          </g>
        );
      }}
    </V2>
  );
};

export const e6c1: ChapterN = {
  name: "ก่อนศึก",
  from: B.recap.start,
  to: END,
  cams: (w, h) => [
    { frame: T.recap, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.back, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.crown, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.test, cam: view(VW.north, w, h, 0.8, 0.1) },
    { frame: T.scold, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.march, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.size, cam: view(VW.west, w, h, 0.85, 0.1) },
    { frame: T.turn, cam: view(VW.west, w, h, 0.85, 0.1) },
    { frame: T.suphan, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.plan, cam: view(VW.nongsarai, w, h, 0.85, 0.1) },
  ],
  years: [[T.recap, "2130"], [T.crown, "2133"], [T.march, "2135"]],
  heads: [
    ...heads(["recap"]),
    ...heads(["crown"], { crown: { portrait: "naresuan_king", chips: [{ text: "พระเอกาทศรถ เสมอพระเจ้าแผ่นดิน", f: T.ekat }] } }),
    ...heads(["test"], { test: { portrait: "mingyi_swa", color: RED } }),
    ...heads(["scold"], { scold: { portrait: "nanda_bayin", color: RED } }),
    ...heads(["march"], { march: { color: RED, chips: [{ text: "เจดีย์สามองค์", f: T.pass }, { text: "แม่ละเมา", f: T.lamao }, { text: "ทัพเรือเชียงใหม่", f: T.navy }] } }),
    ...heads(["size"], { size: { stat: (f: number) => (f < T.small ? "240,000" : "24,000"), label: "คน", color: RED } }),
    ...heads(["turn"], { turn: { portrait: "naresuan_king" } }),
    ...heads(["plan"]),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={16} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.recap + 6} color={GOLD} size={0.8} />
        <Arrow points={R.retreat1587} start={T.recap + 20} end={T.back + 20} color={RED} width={12} variant="dashed" />
        <Ring at={PL.ayut} r={0.12} color={GOLD} start={T.king} end={T.test} />
        <Arrow points={R.swa1590} start={T.come} end={T.come + 30} color={RED} width={14} />
        <BattleMark at={[100.0, 16.2]} start={T.lose - 10} end={T.scold} color={GOLD} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.scold} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.scold + 6} color={RED} size={0.85} />
        <Arrow points={R.swa1592} start={T.pass - 10} end={T.pass + 30} color={RED} width={16} />
        <Arrow points={R.maelamao} start={T.lamao - 6} end={T.lamao + 30} color={RED} width={12} />
        <Arrow points={R.cmNavy} start={T.navy - 6} end={T.navy + 30} color="#3fbf6a" width={10} variant="dashed" />
        <PointLabel at={PL.threePagodas} text="ด่านเจดีย์สามองค์" start={T.pass} color={RED} size={0.65} />
        <Arrow points={R.toKhmerAbort} start={T.khmer - 10} end={T.khmer + 15} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.suphan, T.suphan + 15], [1, 0], clamp)} />
        <Arrow points={R.toNongsarai} start={T.suphan - 10} end={T.camp} color={GOLD} width={16} />
        <CityDot at={PL.nongsarai} color={GOLD} r={14} start={T.camp} />
        <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={T.camp} color={GOLD} size={0.8} />
        <MapTag at={[99.93, 14.55]} text="แม่น้ำท่าคอย (โดยประมาณ)" start={T.camp + 10} end={T.plan + 20} color="#bfe6ff" size={22} />
        <Arrow points={[[99.88, 14.62], [99.93, 14.63], [99.96, 14.64]]} start={T.feint} end={T.feint + 20} color={GOLD} width={10} variant="dashed" />
        <Arrow points={[[99.99, 14.66], [99.95, 14.64], [99.9, 14.62]]} start={T.strike - 10} end={T.strike + 10} color={GOLD} width={14} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.recap, (a, b) => <SiegeCampScene id="e6c1camp" start={a} end={b} />],
        [T.back, (a, b) => <RetreatScene id="e6c1ret" start={a} end={b} />],
        [T.crown, (a, b) => <CoronationScene id="e6c1crown" start={a} end={b} />],
        [T.test, (a, b) => <BattleScene id="e6c1bat" at={[100.0, 16.2]} hits={TEST} start={a} end={b} />],
        [T.scold, (a, b) => <SkirtScene id="e6c1skirt" throw={T.skirt} start={a} end={b} />],
        [T.march, (a, b) => <PassScene id="e6c1pass" side="burma" start={a} end={b} />],
        [T.lamao, (a, b) => <MarchScene id="e6c1march" at={PL.maelamao} side="burma" dir={1} start={a} end={b} />],
        [T.size, (a, b) => <CompareScene id="e6c1cmp" left="khoi" right="parabaik" tilt={-1} start={a} end={b} />],
        [T.turn, (a, b) => <MarchScene id="e6c1turn" at={PL.suphan} side="siam" dir={-1} light="dusk" start={a} end={b} />],
        [T.camp, (a, b) => <RiverCampScene id="e6c1river" start={a} end={b} />],
        [T.plan, (a, b) => <CouncilScene id="e6c1plan" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.ekat, SFX.pop, 0.3],
    [T.pass, SFX.pop, 0.3],
    [T.lamao, SFX.pop, 0.3],
    [T.navy, SFX.pop, 0.3],
    [T.pass - 10, SFX.whoosh, 0.3],
    [T.feint, SFX.whoosh, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={T.recap} to={T.crown} volume={0.15} />
      <Hit id="gong" at={T.king} volume={0.45} />
      <Bed id="crowd_cheer" from={T.king} to={T.test} volume={0.1} />
      {TEST.map((f, i) => <Hit key={f} id={i ? "sword_battle" : "battle_cry"} at={f} volume={0.4} />)}
      <Hit id="wood_hit" at={T.skirt} volume={0.35} />
      <Bed id="war_drums" from={T.march} to={T.turn} volume={0.3} />
      <Bed id="army_marching" from={T.march} to={T.size} volume={0.2} />
      <Hit id="elephant" at={T.turn + 30} volume={0.35} />
      <Bed id="fire_crackle" from={T.plan} to={END + 10} volume={0.18} />
    </>
  ),
};
