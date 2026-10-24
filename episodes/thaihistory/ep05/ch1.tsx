import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { BattleMark, CityDot, Ring, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { BurmeseThroneScene, BurningCityScene, CitySiegeScene, CoronationScene, HostageScene, PassScene, PeguScene, PrincessScene, SubmitScene, TrainingScene, WhiteElephantScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 1 "สงครามช้างเผือก" (beats bayin → vassal, พ.ศ. 2106–2112): Bayinnaung's empire, the white
// elephant war, the boy hostage in Hongsawadi, the first fall of Ayutthaya and the vassal king.
const T = {
  bayin: B.bayin.start,
  spread: wf("bayin", "ขยาย", 0.3),
  manipur: wf("bayin", "มณีปุระ", 0.5),
  lanna: wf("bayin", "ล้านนา", 0.7),
  ayut: wf("bayin", "อยุธยา", 0.92),
  biggest: B.biggest.start,
  big: wf("biggest", "ใหญ่", 0.55),
  white: B.whiteel.start,
  ask: wf("whiteel", "ขอ", 0.3),
  refuse: wf("whiteel", "ไม่", 0.5),
  come: wf("whiteel", "ยก", 0.68),
  war: wf("whiteel", "สงคราม", 0.88),
  plok: B.plok.start,
  submit: wf("plok", "อ่อนน้อม", 0.55),
  down: wf("plok", "กรุงศรีอยุธยา", 0.85),
  hostage: B.hostage.start,
  naret: wf("hostage", "พระ", 0.75, 1),
  sister: B.sister.start,
  pegu: B.pegu.start,
  learn: wf("pegu", "เรียน", 0.45),
  fall: B.fall1.start,
  broke: wf("fall1", "แตก", 0.6),
  vassal: B.vassal.start,
  must: wf("vassal", "ขึ้น", 0.55),
};
const END = B.return.start;
const SIEGE = [T.plok + 30, T.plok + 60];

export const e5c1: ChapterN = {
  name: "สงครามช้างเผือก",
  from: B.bayin.start,
  to: END,
  cams: (w, h) => [
    { frame: T.bayin, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.spread, cam: view(VW.empire, w, h, 0.85, 0.08) },
    { frame: T.white, cam: view(VW.empire, w, h, 0.85, 0.08) },
    { frame: T.white + 40, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.plok, cam: view(VW.plok, w, h, 0.9, 0.1) },
    { frame: T.down, cam: view(VW.plok, w, h, 0.9, 0.1) },
    { frame: T.down + 40, cam: view(VW.north, w, h, 0.75, 0.1) },
    { frame: T.hostage, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.sister, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.learn, cam: view(VW.pegu, w, h, 1.05, 0.1) },
    { frame: T.fall, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.broke, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.vassal, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.vassal + 40, cam: view(VW.region, w, h, 0.85, 0.1) },
  ],
  years: [[T.bayin, "2106"], [T.fall, "2112"]],
  heads: [
    ...heads(["bayin"], { bayin: { portrait: "bayinnaung", color: RED, chips: [{ text: "มณีปุระ", f: T.manipur }, { text: "ล้านนา", f: T.lanna }, { text: "ล้านช้าง", f: T.lanna + 18 }, { text: "อยุธยา", f: T.ayut }] } }),
    ...heads(["biggest"], { biggest: { color: RED } }),
    ...heads(["whiteel"], { whiteel: { stat: "ช้างเผือก", label: "ชนวนศึก" } }),
    ...heads(["plok"], { plok: { portrait: "maha_thammaracha" } }),
    ...heads(["hostage", "sister", "pegu"], { hostage: { color: RED }, pegu: { color: RED } }),
    ...heads(["fall1"], { fall1: { color: RED } }),
    ...heads(["vassal"], { vassal: { portrait: "maha_thammaracha", color: RED } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ek = interpolate(frame, [T.spread, T.spread + 20, T.white + 20, T.white + 40], [0, 1, 1, 0], clamp);
    const vk = interpolate(frame, [T.vassal, T.vassal + 20], [0, 1], clamp);
    const burmaRed = "#e05a3a";
    return (
      <>
        <Zones k={{ burma: Math.max(ek, vk * 0.8) }} />
        <Zones k={{ lanna: interpolate(frame, [T.lanna, T.lanna + 12], [0, 1], clamp) * ek, lanxang: interpolate(frame, [T.lanna + 18, T.lanna + 30], [0, 1], clamp) * ek, siam: Math.max(interpolate(frame, [T.ayut, T.ayut + 12], [0, 1], clamp) * ek, vk) }} colors={{ lanna: burmaRed, lanxang: burmaRed, siam: burmaRed }} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.bayin} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.bayin + 6} color={RED} size={0.85} />
        <PointLabel at={PL.manipur} text="มณีปุระ" start={T.manipur} color={RED} size={0.7} />
        <PointLabel at={PL.chiangmai} text="ล้านนา" start={T.lanna} color={RED} size={0.7} />
        <PointLabel at={PL.vientiane} text="ล้านช้าง" start={T.lanna + 18} color={RED} size={0.7} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.ayut} color={GOLD} size={0.75} />
        <Arrow points={R.whiteWar} start={T.come} end={T.come + 40} color={RED} width={16} />
        <Arrow points={R.whiteWarSouth} start={T.down} end={T.down + 35} color={RED} width={16} />
        <CityDot at={PL.plok} color={GOLD} r={14} start={T.white} />
        <PointLabel at={PL.plok} text="พิษณุโลก" start={T.plok} color={GOLD} size={0.8} />
        <BattleMark at={PL.plok} start={T.plok + 10} end={T.hostage} />
        <Arrow points={R.hostage} start={T.naret} end={T.naret + 45} color={RED} width={10} variant="dashed" />
        <Ring at={PL.pegu} r={0.08} color={GOLD} start={T.sister} end={T.fall} />
        <Arrow points={R.fall1569} start={T.fall + 10} end={T.broke} color={RED} width={18} />
        <BattleMark at={PL.ayut} start={T.broke} end={T.vassal + 20} size={1.2} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.bayin, (a, b) => <BurmeseThroneScene id="e5c1throne" start={a} end={b} />],
        [T.biggest, (a, b) => <PeguScene id="e5c1pegu" night start={a} end={b} />],
        [T.white, (a, b) => <WhiteElephantScene id="e5c1white" start={a} end={b} />],
        [T.come, (a, b) => <PassScene id="e5c1pass" at={PL.maelamao} side="burma" start={a} end={b} />],
        [T.plok, (a, b) => <CitySiegeScene id="e5c1plok" at={PL.plok} start={a} end={b} hits={SIEGE} />],
        [T.submit, (a, b) => <SubmitScene id="e5c1sub" at={PL.plok} start={a} end={b} />],
        [T.hostage, (a, b) => <HostageScene id="e5c1host" at={PL.ayut} light="dawn" start={a} end={b} />],
        [T.sister, (a, b) => <PrincessScene id="e5c1sis" start={a} end={b} />],
        [T.pegu, (a, b) => <TrainingScene id="e5c1train" start={a} end={b} />],
        [T.fall, (a, b) => <BurningCityScene id="e5c1burn" start={a} end={b} />],
        [T.vassal, (a, b) => <CoronationScene id="e5c1crown" start={a} end={b} />],
        [T.must, (a, b) => <SubmitScene id="e5c1sub2" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.manipur, SFX.pop, 0.3],
    [T.lanna, SFX.pop, 0.3],
    [T.lanna + 18, SFX.pop, 0.3],
    [T.ayut, SFX.pop, 0.3],
    [T.come, SFX.whoosh, 0.3],
    [T.naret, SFX.whoosh, 0.25],
  ],
  night: (f) => interpolate(f, [T.fall, T.fall + 20, T.vassal, T.vassal + 20], [0, 0.8, 0.8, 0], clamp),
  Audio: () => (
    <>
      <Hit id="gong" at={T.bayin + 6} volume={0.4} />
      <Bed id="crowd_angry" from={T.bayin} to={T.white} volume={0.12} />
      <Hit id="elephant" at={T.white + 20} volume={0.5} />
      <Bed id="war_drums" from={T.come - 10} to={T.hostage} volume={0.3} />
      <Bed id="army_marching" from={T.come} to={T.plok + 20} volume={0.2} />
      {SIEGE.map((f, i) => <Hit key={f} id={i ? "cannon_old" : "arrows_volley"} at={f} volume={0.4} />)}
      <Bed id="wind" from={T.hostage} to={T.fall} volume={0.2} />
      <Hit id="elephant" at={T.hostage + 40} volume={0.3} />
      <Bed id="fire_big" from={T.fall} to={T.vassal + 20} volume={0.3} />
      <Bed id="crowd_panic" from={T.broke} to={T.vassal} volume={0.15} />
      <Hit id="gong" at={T.vassal + 4} volume={0.4} />
    </>
  ),
};
