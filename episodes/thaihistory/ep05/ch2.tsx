import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, QuizNews, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Elephant } from "../nrs/kit";
import { BattleMark, CityDot, Ring, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { AmbushScene, ArriveScene, Backdrop, BattleScene, Fighter, Grass, LeadChargeScene, PAL, PyreScene, RevoltScene, RiverRaidScene, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 2 "เจ้าชายแห่งพิษณุโลก" (beats return → quiz1, พ.ศ. 2114–2126): the young viceroy, the Khmer
// raids and the win of 2123, how he fought, Bayinnaung's death and the cracks in the empire; quiz: who rebels first?
const T = {
  ret: B.return.start,
  uparat: wf("return", "อุปราช", 0.45),
  teen: wf("return", "วัยรุ่น", 0.85),
  name: B.name.start,
  khmer: B.khmer.start,
  land: wf("khmer", "บก", 0.75),
  sea: wf("khmer", "เรือ", 0.92),
  w23: B.win2123.start,
  five: wf("win2123", "ห้า", 0.3),
  three: wf("win2123", "สาม", 0.65),
  rout: wf("win2123", "แตก", 0.85),
  style: B.style.start,
  front: wf("style", "หน้า", 0.35),
  fast: wf("style", "เร็ว", 0.6),
  ambush: wf("style", "ซุ่ม", 0.8),
  die: B.bayindie.start,
  nanda: wf("bayindie", "นันทบุเรง", 0.6),
  crack: B.crack.start,
  one: wf("crack", "เดียว", 0.45),
  rebel: wf("crack", "แข็งข้อ", 0.85),
  quiz: B.quiz1.start,
};
const END = B.ava.start;
const REVEAL = END - 2;
const RAID = [T.three + 20, T.three + 44];
const AMBUSH = [T.ambush + 10];

// The prince is named: on his elephant at sunrise before Phitsanulok, the army's banners raised one by one.
const NameScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.plok} start={start} end={end} sky={["#4a5a8a", "#f6b880"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.42]} lightColor={["#ffd38a", "#fff1cc"]} />
        <Elephant x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground + 12 * g.s} s={g.s * 0.5} trumpet={interpolate(lt, [20, 32, 70], [0, 1, 0], clamp)} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} umbrella />
        {[0.1, 0.22, 0.78, 0.9].map((f, i) => {
          const up = interpolate(lt, [10 + i * 8, 24 + i * 8], [0, 1], clamp);
          return <g key={f} opacity={up} transform={`translate(0,${(1 - up) * 30 * g.s})`}><Fighter x={g.x + g.W * f + pan * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.56} flip={f > 0.5} mode="stand" costume={C.siam} phase={i} /></g>;
        })}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export const e5c2: ChapterN = {
  name: "เจ้าชายแห่งพิษณุโลก",
  from: B.return.start,
  to: END,
  cams: (w, h) => [
    { frame: T.ret, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.uparat, cam: view(VW.plok, w, h, 0.9, 0.1) },
    { frame: T.khmer, cam: view(VW.plok, w, h, 0.9, 0.1) },
    { frame: T.khmer + 40, cam: view(VW.khmer, w, h, 0.9, 0.1) },
    { frame: T.w23, cam: view(VW.khmer, w, h, 0.9, 0.1) },
    { frame: T.five, cam: view(VW.central, w, h, 0.75, 0.1) },
    { frame: T.style, cam: view(VW.central, w, h, 0.75, 0.1) },
    { frame: T.die, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.crack, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.crack + 40, cam: view(VW.empire, w, h, 0.85, 0.08) },
    { frame: T.quiz, cam: view(VW.empire, w, h, 0.85, 0.08) },
  ],
  years: [[T.ret, "2114"], [T.w23, "2123"], [T.die, "2124"], [T.quiz, "2126"]],
  heads: [
    ...heads(["return"], { return: { portrait: "naresuan_prince" } }),
    ...heads(["name"], { name: { portrait: "naresuan_prince" } }),
    ...heads(["khmer"], { khmer: { color: RED } }),
    ...heads(["win2123"], { win2123: { stat: (f: number) => (f < T.three ? "5,000" : "3,000 > 5,000"), label: "คน" } }),
    ...heads(["style"], { style: { chips: [{ text: "นำทัพเอง", f: T.front }, { text: "ทัพเล็ก เร็ว", f: T.fast }, { text: "ซุ่มตี", f: T.ambush }] } }),
    ...heads(["bayindie"], { bayindie: { portrait: "nanda_bayin", color: RED } }),
    ...heads(["crack"], { crack: { color: RED } }),
    { f: T.quiz, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ek = interpolate(frame, [T.crack + 30, T.crack + 50], [0, 1], clamp);
    const flick = (k: number) => 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.2 + k));
    return (
      <>
        <CityDot at={PL.plok} color={GOLD} r={16} start={T.ret} />
        <PointLabel at={PL.plok} text="พิษณุโลก" start={T.uparat} color={GOLD} size={0.85} />
        <Ring at={PL.plok} r={0.06} color={GOLD} start={T.uparat} end={T.khmer} />
        <CityDot at={PL.lawaek} color={RED} r={14} start={T.khmer} end={T.die} />
        <PointLabel at={PL.lawaek} text="ละแวก" start={T.khmer + 6} color={RED} size={0.75} />
        <Arrow points={R.khmerLand} start={T.land - 10} end={T.land + 25} color={RED} width={14} />
        <Arrow points={R.khmerSea} start={T.sea - 6} end={T.sea + 25} color={RED} width={10} variant="dashed" />
        <Arrow points={R.khmerEast} start={T.five} end={T.five + 30} color={RED} width={14} />
        <Arrow points={[[100.566, 14.357], [101.0, 14.2], [101.4, 13.85]]} start={T.three} end={T.three + 20} color={GOLD} width={14} />
        <BattleMark at={[101.4, 13.75]} start={T.rout - 10} end={T.style + 30} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.die} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.die} color={RED} size={0.85} />
        <Zones k={{ burma: ek, lanna: ek * flick(1), lanxang: ek * flick(2), siam: ek * flick(3) }} colors={{ lanna: "#e05a3a", lanxang: "#e05a3a", siam: "#e05a3a" }} />
        {frame >= T.quiz && <PointLabel at={PL.ava} text="?" start={T.quiz} color={RED} size={0.9} />}
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.ret, (a, b) => <ArriveScene id="e5c2arrive" start={a} end={b} />],
        [T.name, (a, b) => <NameScene id="e5c2name" start={a} end={b} />],
        [T.khmer, (a, b) => <RiverRaidScene id="e5c2raid" at={PL.nakhonnayok} start={a} end={b} />],
        [T.w23, (a, b) => <BattleScene id="e5c2bat" at={[101.4, 13.75]} left="siam" right="khmer" hits={RAID} start={a} end={b} />],
        [T.style, (a, b) => <LeadChargeScene id="e5c2lead" light="day" start={a} end={b} />],
        [T.ambush, (a, b) => <AmbushScene id="e5c2amb" foe="khmer" hits={AMBUSH} start={a} end={b} />],
        [T.die, (a, b) => <PyreScene id="e5c2pyre" start={a} end={b} />],
        [T.crack, (a, b) => <RevoltScene id="e5c2rev" at={PL.pegu} start={a} end={b} />],
      ],
      T.quiz,
    ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="เมืองไหนแข็งข้อก่อน?" options={["อังวะ", "เชียงใหม่", "ละแวก"]} answer={0} start={T.quiz} reveal={REVEAL} end={END + 26} color={GOLD} />,
  sfx: [
    [T.front, SFX.pop, 0.3],
    [T.fast, SFX.pop, 0.3],
    [T.ambush, SFX.pop, 0.3],
    [T.land - 10, SFX.whoosh, 0.3],
    [T.quiz, SFX.pop, 0.35],
    [REVEAL - 90, SFX.tick, 0.3],
    [REVEAL - 60, SFX.tick, 0.3],
    [REVEAL - 30, SFX.tick, 0.3],
    [REVEAL, SFX.hit, 0.45],
  ],
  Audio: () => (
    <>
      <Bed id="crowd_cheer" from={T.ret + 20} to={T.ret + 120} volume={0.12} />
      <Hit id="elephant" at={T.name + 24} volume={0.5} />
      <Bed id="fire_crackle" from={T.khmer} to={T.w23} volume={0.25} />
      <Hit id="splash" at={T.sea} volume={0.3} />
      <Bed id="war_drums" from={T.w23} to={T.style + 20} volume={0.3} />
      {RAID.map((f, i) => <Hit key={f} id={i ? "sword_battle" : "battle_cry"} at={f} volume={0.45} />)}
      <Hit id="horse_gallop" at={T.style + 10} volume={0.3} />
      <Hit id="battle_cry" at={AMBUSH[0]} volume={0.4} />
      <Bed id="fire_big" from={T.die} to={T.crack} volume={0.2} />
      <Hit id="gong" at={T.die + 6} volume={0.45} />
      <Bed id="crowd_angry" from={T.crack} to={T.quiz} volume={0.15} />
    </>
  ),
};
