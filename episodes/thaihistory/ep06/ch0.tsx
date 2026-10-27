import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { B, BURMA_C, GOLD, RED, TAK_C, wp, type Chapter6 } from "./beatsKit";
import { CampRing, HookTitle } from "./mapkit";
import { Bed, Hit, SFX } from "./mix";
import { PL, ROUTE, VW } from "./places";
import { BreakoutScene, SiegeNightScene, WallLookoutScene } from "./scenes";

// Opening (hook → go): the siege ring around Ayutthaya and one gold line breaking out of it.
const T = {
  setup: B.setup.start,
  siege: wp("setup", "ล้อม", 0.35),
  band: wp("setup", "กลุ่ม", 0.6),
  out: wp("setup", "ตีฝ่า", 0.8),
  q: B.question.start,
  tak: wp("question", "ตาก", 0.15),
  why: wp("question", "ทำไม", 0.5),
  how: wp("question", "ยังไง", 0.7),
  where: wp("question", "ไหน", 0.9),
  go: B.go.start,
};
const END = B.who.start;

export const e6c0: Chapter6 = {
  name: "500 คน ฝ่าวงล้อม",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.hook, w, h, 0.95, 0.06) },
    { frame: T.q, cam: view(VW.hook, w, h, 1.0, 0.06) },
    { frame: T.go + 10, cam: view(VW.island, w, h, 0.9, 0.06) },
  ],
  years: [[0, "2310"]],
  heads: [
    { f: T.setup, tag: "มกราคม พ.ศ. 2310", head: "กรุงศรีอยุธยาถูกล้อม", stat: "กว่า 1 ปี", color: RED },
    { f: T.band, tag: "คืนเดียว", head: "ตีฝ่าวงล้อมออกไป", stat: "ราว 500", label: "คน", color: GOLD },
    { f: T.q, tag: "คำถามของวันนี้", head: "พระยาตาก", color: GOLD, portrait: "taksin_general", chips: [{ text: "ทำไม", f: T.why }, { text: "ยังไง", f: T.how }, { text: "ไปไหน", f: T.where }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ring = interpolate(frame, [END - 20, END + 10], [1, 0.6], clamp);
    const line = interpolate(frame, [T.q, T.q + 15], [1, 0], clamp);
    return (
      <>
        <CampRing k={ring} />
        <CityDot at={PL.ayut} color={RED} r={14} start={0} />
        <Arrow points={ROUTE.night} start={0} end={14} color={TAK_C} width={14} opacity={line} />
        <PointLabel at={PL.ayut} text="กรุงศรีอยุธยา" start={T.siege} color={BURMA_C} size={0.85} />
      </>
    );
  },
  Panels: () => (
    <>
      <SiegeNightScene id="e6siege" anchor={PL.ayut} start={T.setup} end={T.out + 14} />
      <BreakoutScene id="e6break" anchor={PL.phichai} start={T.out} end={T.q + 14} />
      <WallLookoutScene id="e6look1" anchor={PL.ayut} start={T.q} end={END + 14} dusk={false} />
    </>
  ),
  Screen: () => <HookTitle end={B.hook.end} />,
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    [T.why, SFX.pop, 0.3],
    [T.how, SFX.pop, 0.3],
    [T.where, SFX.pop, 0.3],
    [T.go - 6, SFX.whoosh, 0.3],
  ],
  Audio: () => (
    <>
      <Hit id="war_drums" at={2} volume={0.55} />
      <Hit id="cannon_far" at={6} volume={0.45} />
      <Bed id="fire_crackle" from={0} to={T.out + 40} volume={0.22} />
      <Hit id="battle_cry" at={T.out} volume={0.4} />
      <Bed id="wind" from={T.out} to={END + 40} volume={0.18} />
    </>
  ),
};
