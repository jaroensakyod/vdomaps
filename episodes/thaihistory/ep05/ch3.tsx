import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { CityDot, MapTag, Ring } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { CampNightScene, DeclareScene, MonkCouncilScene, PlotScene, RevoltScene, ScribeScene, SummonScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 3 "เมืองแครง" (beats ava → date, พ.ศ. 2127): Ava rebels, the levy, the slow Siamese army near
// Hongsawadi, the plot and the monk who revealed it, the water poured at Mueang Khraeng and the Burmese date.
const T = {
  ava: B.ava.start,
  uncle: wf("ava", "อา", 0.55),
  summon: B.summon.start,
  levy: wf("summon", "เกณฑ์", 0.2),
  naresuan: wf("summon", "พระนเรศวร", 0.85),
  slow: B.slow.start,
  six: wf("slow", "หก", 0.35),
  hover: wf("slow", "วน", 0.6),
  away: wf("slow", "อังวะ", 0.9),
  plot: B.plot.start,
  rear: wf("plot", "หลัง", 0.85),
  monk: B.monk.start,
  reveal: wf("monk", "เปิดเผย", 0.85),
  declare: B.declare.start,
  khraeng: wf("declare", "แครง", 0.2),
  pour: wf("declare", "หลั่ง", 0.4),
  cut: wf("declare", "ขาด", 0.75),
  date: B.date.start,
  may: wf("date", "พฤษภาคม", 0.7),
};
const END = B.families.start;
const DRUM = [T.levy + 6, T.levy + 26];

export const e5c3: ChapterN = {
  name: "เมืองแครง",
  from: B.ava.start,
  to: END,
  cams: (w, h) => [
    { frame: T.ava, cam: view(VW.empire, w, h, 0.85, 0.08) },
    { frame: T.ava + 30, cam: view(VW.burma, w, h, 0.9, 0.1) },
    { frame: T.summon, cam: view(VW.burma, w, h, 0.9, 0.1) },
    { frame: T.naresuan, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.slow, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.hover, cam: view(VW.pegu, w, h, 0.85, 0.1) },
    { frame: T.plot, cam: view(VW.pegu, w, h, 0.95, 0.1) },
    { frame: T.declare, cam: view(VW.pegu, w, h, 1.1, 0.1) },
    { frame: T.date, cam: view(VW.pegu, w, h, 1.1, 0.1) },
    { frame: T.date + 40, cam: view(VW.region, w, h, 0.85, 0.1) },
  ],
  years: [[T.ava, "2127"]],
  heads: [
    { f: T.ava, tag: "คำตอบ", head: "อังวะแข็งข้อ", color: GOLD, chips: [{ text: "อาของพระเจ้านันทบุเรง", f: T.uncle }] },
    ...heads(["summon"], { summon: { portrait: "nanda_bayin", color: RED } }),
    { f: T.naresuan, tag: "อยุธยาต้องส่งทัพ", head: "พระนเรศวรนำทัพ", color: GOLD, portrait: "naresuan_prince" },
    ...heads(["slow"], { slow: { stat: "≈ 6,000", label: "คน (บันทึกพม่า)" } }),
    ...heads(["plot"], { plot: { portrait: "mingyi_swa", color: RED } }),
    ...heads(["monk"], { monk: { portrait: "khanchong" } }),
    ...heads(["declare"], { declare: { portrait: "naresuan_prince" } }),
    ...heads(["date"], { date: { stat: "3 พ.ค. 2127", label: "โดยประมาณ" } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const glow = interpolate(frame, [T.pour, T.pour + 20], [0, 1], clamp);
    return (
      <>
        <CityDot at={PL.ava} color="#3a5aa8" r={16} start={T.ava} />
        <PointLabel at={PL.ava} text="อังวะ" start={T.ava + 4} color="#6a8aff" size={0.85} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.ava} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.ava + 10} color={RED} size={0.85} />
        <Arrow points={R.ava1584} start={T.levy} end={T.levy + 40} color={RED} width={14} />
        <Arrow points={R.march1584} start={T.naresuan} end={T.naresuan + 40} color={GOLD} width={14} />
        <Ring at={[96.75, 17.25]} r={0.12} color={GOLD} start={T.hover} end={T.plot + 10} />
        <Arrow points={[[96.48, 17.33], [96.8, 17.1], [97.0, 17.12]]} start={T.rear} end={T.rear + 20} color={RED} width={8} variant="dashed" />
        <CityDot at={PL.khraeng} color={GOLD} r={12 + glow * 8} start={T.khraeng} />
        <PointLabel at={PL.khraeng} text="เมืองแครง" start={T.khraeng} color={GOLD} size={0.8} />
        <MapTag at={[PL.khraeng[0], PL.khraeng[1] - 0.12]} text="(ตำแหน่งโดยประมาณ)" start={T.khraeng + 10} end={T.date} size={22} />
        <Ring at={PL.khraeng} r={0.1} color={GOLD} start={T.pour} end={T.date + 30} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.ava, (a, b) => <RevoltScene id="e5c3ava" start={a} end={b} />],
        [T.summon, (a, b) => <SummonScene id="e5c3sum" at={PL.pegu} hits={DRUM} start={a} end={b} />],
        [T.slow, (a, b) => <CampNightScene id="e5c3camp" side="siam" start={a} end={b} />],
        [T.plot, (a, b) => <PlotScene id="e5c3plot" start={a} end={b} />],
        [T.monk, (a, b) => <MonkCouncilScene id="e5c3monk" start={a} end={b} />],
        [T.pour, (a, b) => <DeclareScene id="e5c3pour" close start={a} end={b} />],
        [T.date, (a, b) => <ScribeScene id="e5c3scribe" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.uncle, SFX.pop, 0.3],
    [T.levy, SFX.whoosh, 0.3],
    [T.naresuan, SFX.whoosh, 0.3],
    [T.may, SFX.pop, 0.3],
  ],
  night: (f) => interpolate(f, [T.slow, T.slow + 20, T.monk + 60, T.declare], [0, 0.6, 0.6, 0], clamp),
  Audio: () => (
    <>
      <Bed id="crowd_angry" from={T.ava} to={T.summon} volume={0.18} />
      {DRUM.map((f) => <Hit key={f} id="war_horn_drums" at={f} volume={0.35} />)}
      <Bed id="army_marching" from={T.naresuan} to={T.slow + 40} volume={0.2} />
      <Bed id="fire_crackle" from={T.slow} to={T.declare} volume={0.25} />
      <Bed id="wind" from={T.plot} to={T.monk} volume={0.15} />
      <Hit id="gong" at={T.pour} volume={0.45} />
      <Hit id="splash" at={T.pour + 20} volume={0.3} />
      <Hit id="crowd_cheer" at={T.cut + 6} volume={0.3} />
      <Bed id="fire_crackle" from={T.date} to={END} volume={0.12} />
    </>
  ),
};
