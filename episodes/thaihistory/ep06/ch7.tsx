import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { CityDot, MapTag, Ring, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { HillsScene, PassScene, SickTentScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 7 "เมืองหาง" (beats north → ekathot, พ.ศ. 2148): Ava rising in the Shan states, the last march
// north, the illness and death at Mueang Hang (25 April 1605), the three candidate places, Ekathotsarot succeeds.
const T = {
  north: B.north.start,
  lanna: wf("north", "ล้านนา", 0.2),
  ava: wf("north", "อังวะ", 0.55),
  shan: wf("north", "ฉาน", 0.9),
  march: B.lastmarch.start,
  ill: wf("lastmarch", "ประชวร", 0.9),
  death: B.death.start,
  hang: wf("death", "หาง", 0.5),
  date: wf("death", "เมษายน", 0.7),
  where: B.wherehang.start,
  wh: wf("wherehang", "เวียงแหง", 0.35),
  fang: wf("wherehang", "ฝาง", 0.55),
  shan2: wf("wherehang", "ฉาน", 0.9),
  ek: B.ekathot.start,
};
const END = B.answer.start;

export const e6c7: ChapterN = {
  name: "เมืองหาง",
  from: B.north.start,
  to: END,
  cams: (w, h) => [
    { frame: T.north, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.ava, cam: view(VW.shan, w, h, 0.85, 0.1) },
    { frame: T.march, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.ill, cam: view(VW.north, w, h, 0.8, 0.1) },
    { frame: T.where, cam: view(VW.shan, w, h, 1.0, 0.1) },
    { frame: T.ek, cam: view(VW.shan, w, h, 1.0, 0.1) },
  ],
  years: [[T.north, "2147"], [T.march, "2148"]],
  heads: [
    ...heads(["north"], { north: { chips: [{ text: "ล้านนา ใต้อยุธยา", f: T.lanna }, { text: "อังวะผงาด", f: T.ava }] } }),
    ...heads(["lastmarch"], { lastmarch: { portrait: "naresuan_king" } }),
    ...heads(["death"], { death: { portrait: "naresuan_king", color: GOLD } }),
    ...heads(["wherehang"], { wherehang: { chips: [{ text: "เวียงแหง", f: T.wh }, { text: "ฝาง", f: T.fang }, { text: "รัฐฉาน", f: T.shan2 }] } }),
    ...heads(["ekathot"], { ekathot: { portrait: "ekathotsarot" } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const lk = interpolate(frame, [T.lanna, T.lanna + 15, T.march, T.march + 20], [0, 1, 1, 0], clamp);
    return (
      <>
        <Zones k={{ lanna: lk, siam: lk }} colors={{ lanna: GOLD }} />
        <CityDot at={PL.ava} color="#3a5aa8" r={16} start={T.ava} />
        <PointLabel at={PL.ava} text="อังวะ" start={T.ava} color="#6a8aff" size={0.85} />
        <Arrow points={R.avaShan} start={T.shan - 10} end={T.shan + 25} color="#6a8aff" width={12} />
        <CityDot at={PL.ayut} color={GOLD} r={14} start={T.march} />
        <Arrow points={R.lastMarch} start={T.march + 10} end={T.ill} color={GOLD} width={16} />
        <CityDot at={PL.wianghaeng} color={GOLD} r={12} start={T.hang} />
        <PointLabel at={PL.wianghaeng} text="เมืองหาง?" start={T.hang} color={GOLD} size={0.8} />
        <Ring at={PL.wianghaeng} r={0.08} color={GOLD} start={T.date} end={T.where} />
        <CityDot at={PL.wianghaeng} color={GOLD} r={12} start={T.wh} />
        <MapTag at={[PL.wianghaeng[0] - 0.3, PL.wianghaeng[1] - 0.1]} text="เวียงแหง" start={T.wh} end={END} color={GOLD} size={28} />
        <CityDot at={PL.fang} color={GOLD} r={12} start={T.fang} />
        <MapTag at={[PL.fang[0] + 0.3, PL.fang[1] - 0.1]} text="ฝาง" start={T.fang} end={END} color={GOLD} size={28} />
        <CityDot at={PL.mongton} color={GOLD} r={12} start={T.shan2} />
        <MapTag at={[PL.mongton[0] + 0.2, PL.mongton[1] + 0.2]} text="รัฐฉาน" start={T.shan2} end={END} color={GOLD} size={28} />
        <MapTag at={[99.0, 18.6]} text="(ตำแหน่งยังถกเถียง)" start={T.wh + 20} end={END} size={22} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.north, (a, b) => <HillsScene id="e6c7hills" army start={a} end={b} />],
        [T.march, (a, b) => <PassScene id="e6c7pass" at={PL.chiangmai} side="siam" light="dawn" start={a} end={b} />],
        [T.death, (a, b) => <SickTentScene id="e6c7sick" start={a} end={b} />],
        [T.where, (a, b) => <HillsScene id="e6c7hills2" at={PL.wianghaeng} start={a} end={b} />],
        [T.ek, (a, b) => <SickTentScene id="e6c7ek" arrive start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.lanna, SFX.pop, 0.3],
    [T.ava, SFX.pop, 0.3],
    [T.march + 10, SFX.whoosh, 0.3],
    [T.wh, SFX.pop, 0.3],
    [T.fang, SFX.pop, 0.3],
    [T.shan2, SFX.pop, 0.3],
  ],
  night: (f) => interpolate(f, [T.death - 10, T.death + 20, T.where - 10, T.where + 10, T.ek, T.ek + 20], [0, 0.6, 0.6, 0, 0, 0.5], clamp),
  Audio: () => (
    <>
      <Bed id="wind" from={T.north} to={T.march} volume={0.18} />
      <Bed id="army_marching" from={T.march} to={T.death} volume={0.2} />
      <Bed id="jungle_rain" from={T.death} to={T.where} volume={0.12} />
      <Hit id="gong" at={T.date} volume={0.45} />
      <Bed id="wind" from={T.where} to={END} volume={0.15} />
      <Hit id="elephant" at={T.ek + 30} volume={0.3} />
    </>
  ),
};
