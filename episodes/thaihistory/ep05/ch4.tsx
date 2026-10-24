import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { BattleMark, BigRivers, CityDot, MapTag, Ring } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { FamiliesScene, GateScene, GunRelicScene, MarchScene, OathScene, RiverShotScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 4 "แม่น้ำสะโตง" (beats families → gather, พ.ศ. 2127): families brought home, the chase, the shot
// across the Sittaung, the long royal gun, the oath at Sukhothai and the gathering at Ayutthaya.
const T = {
  fam: B.families.start,
  home: wf("families", "บ้าน", 0.5),
  ten: wf("families", "หมื่น", 0.9),
  chase: B.chase.start,
  sura: wf("chase", "สุรกรรมา", 0.4),
  river: wf("chase", "สะโตง", 0.7),
  shotB: B.shot.start,
  fire: wf("shot", "ยิง", 0.3),
  dead: wf("shot", "ช้าง", 0.68),
  back: wf("shot", "ถอย", 0.88),
  gun: B.gun.start,
  name: wf("gun", "พระแสง", 0.6),
  oath: B.oath.start,
  drink: wf("oath", "ดื่ม", 0.45),
  gather: B.gather.start,
  ayut: wf("gather", "กรุงศรีอยุธยา", 0.5),
  big: wf("gather", "ใหญ่", 0.85),
};
const END = B.twoarmies.start;
const SHOT = T.fire + 6;

export const e5c4: ChapterN = {
  name: "แม่น้ำสะโตง",
  from: B.families.start,
  to: END,
  cams: (w, h) => [
    { frame: T.fam, cam: view(VW.pegu, w, h, 1.0, 0.1) },
    { frame: T.chase, cam: view(VW.pegu, w, h, 1.15, 0.1) },
    { frame: T.river, cam: view(VW.pegu, w, h, 1.5, 0.08) },
    { frame: T.back, cam: view(VW.pegu, w, h, 1.5, 0.08) },
    { frame: T.oath, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.drink, cam: view(VW.plok, w, h, 0.85, 0.1) },
    { frame: T.gather, cam: view(VW.north, w, h, 0.8, 0.1) },
    { frame: T.ayut, cam: view(VW.central, w, h, 0.85, 0.1) },
  ],
  years: [[T.fam, "2127"]],
  heads: [
    ...heads(["families"], { families: { stat: (f: number) => `${Math.round(interpolate(f, [T.home, T.ten], [0, 10000], clamp)).toLocaleString("en-US")}`, label: "ครอบครัว (โดยประมาณ)" } }),
    ...heads(["chase"], { chase: { color: RED } }),
    ...heads(["shot"], { shot: { portrait: "naresuan_prince" } }),
    ...heads(["gun"], { gun: { stat: "9 คืบ", label: "ราว 2 เมตร" } }),
    ...heads(["oath", "gather"]),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const rk = interpolate(frame, [T.river - 10, T.river + 10, T.gun + 30, T.gun + 60], [0, 1, 1, 0], clamp);
    return (
      <>
        <BigRivers hi={{ Sittong: rk }} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.fam - 30} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.fam - 30} color={RED} size={0.85} />
        <Arrow points={R.back1584} start={T.home} end={T.home + 60} color={GOLD} width={14} />
        <Arrow points={R.chase} start={T.sura} end={T.sura + 30} color={RED} width={12} />
        <MapTag at={[PL.sittaung[0] + 0.12, PL.sittaung[1] + 0.06]} text="แม่น้ำสะโตง" start={T.river} end={T.gun + 40} color="#bfe6ff" size={30} />
        <BattleMark at={PL.sittaung} start={SHOT} end={T.gun} color={GOLD} />
        <CityDot at={PL.sukhothai} color={GOLD} r={14} start={T.oath} />
        <PointLabel at={PL.sukhothai} text="สุโขทัย" start={T.oath + 6} color={GOLD} size={0.8} />
        <PointLabel at={PL.sawankhalok} text="สวรรคโลก" start={T.drink + 30} color={GOLD} size={0.65} />
        <Arrow points={R.northToAyut} start={T.gather + 10} end={T.ayut + 10} color={GOLD} width={16} />
        <CityDot at={PL.ayut} color={GOLD} r={16} start={T.ayut - 10} />
        <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T.ayut} color={GOLD} size={0.85} />
        <Ring at={PL.ayut} r={0.1} color={GOLD} start={T.big} end={END + 20} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.fam, (a, b) => <FamiliesScene id="e5c4fam" start={a} end={b} />],
        [T.chase, (a, b) => <RiverShotScene id="e5c4chase" start={a} end={b} />],
        [T.shotB, (a, b) => <RiverShotScene id="e5c4shot" shot={SHOT} start={a} end={b} />],
        [T.gun, (a, b) => <GunRelicScene id="e5c4gun" start={a} end={b} />],
        [T.oath, (a, b) => <OathScene id="e5c4oath" start={a} end={b} />],
        [T.gather, (a, b) => <MarchScene id="e5c4march" at={PL.nakhonsawan} side="siam" dir={1} elephants={1} start={a} end={b} />],
        [T.ayut, (a, b) => <GateScene id="e5c4gate" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.home, SFX.whoosh, 0.3],
    [T.sura, SFX.whoosh, 0.25],
    [T.name, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="army_marching" from={T.fam} to={T.chase + 20} volume={0.2} />
      <Bed id="ship_sailing" from={T.chase} to={T.gun} volume={0.15} />
      <Hit id="elephant" at={T.sura + 10} volume={0.4} />
      <Hit id="rifle_echo" at={SHOT} volume={0.6} />
      <Hit id="elephant" at={SHOT + 14} volume={0.45} />
      <Hit id="crowd_cheer" at={T.back + 4} volume={0.3} />
      <Hit id="gong" at={T.gun + 4} volume={0.4} />
      <Bed id="jungle_rain" from={T.oath} to={T.gather} volume={0.12} />
      <Bed id="army_marching" from={T.gather} to={END + 10} volume={0.15} />
    </>
  ),
};
