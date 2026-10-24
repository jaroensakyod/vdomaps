import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C } from "../nrs/kit";
import { BattleMark, CityDot, Ring, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { Backdrop, Boat, BurningCityScene, CitySiegeScene, Grass, LawaekScene, PAL, PeguScene, PortScene, RevoltScene, River, Tree, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 6 "หงสาวดีล่ม" (beats flip → irony, พ.ศ. 2136–2142): the balance turns, Longvek falls (legend vs
// records), the siege of Hongsawadi, the empire breaking apart, Hongsawadi burned and Nanda Bayin's end at Toungoo.
const T = {
  flip: B.flip.start,
  mon: wf("flip", "เมาะลำเลิง", 0.45),
  attack: wf("flip", "บุก", 0.9),
  lw: B.lawaek.start,
  fall: wf("lawaek", "ละแวก", 0.3),
  legend: B.legend.start,
  flee: wf("legend", "เวียงจันทน์", 0.9),
  pegu: B.pegu1.start,
  hostage: wf("pegu1", "องค์ประกัน", 0.35),
  three: wf("pegu1", "เดือน", 0.6),
  relief: wf("pegu1", "แปร", 0.75),
  crumble: B.crumble.start,
  burn: B.burn.start,
  first: wf("burn", "ก่อน", 0.3),
  take: wf("burn", "พา", 0.55),
  fire: wf("burn", "เผา", 0.85),
  tg: B.toungoo.start,
  lack: wf("toungoo", "เสบียง", 0.45),
  killed: wf("toungoo", "ปลง", 0.85),
  irony: B.irony.start,
};
const END = B.north.start;
const SIEGE = [T.three - 10, T.three + 20];

type Sc = { id: string; start: number; end: number };

// Night on the Mekong: a royal boat slips upriver past dark palms (the Khmer king flees to Vientiane).
const FleeScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.vientiane} start={start} end={end} sky={["#0b1026", "#2a2a4a"]} accent={GOLD} warm={0.04}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#22282a" ground="#1a1712" mist="#8a90b0" />
        {[0.1, 0.3, 0.86].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 1.1} kind="palm" />)}
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#16263a" night />
        <Boat x={g.x + g.W * 0.3 + lt * 0.6 * g.s + pan * 0.7} y={g.ground + 8 * g.s} w={170 * g.s} s={g.s} n={4} costume={C.khmer} canopy gilt />
        <Grass g={g} shift={pan * 1.6} color="#10160e" />
      </g>
    )}
  </V2>
);

export const e6c6: ChapterN = {
  name: "หงสาวดีล่ม",
  from: B.flip.start,
  to: END,
  cams: (w, h) => [
    { frame: T.flip, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.lw, cam: view(VW.khmer, w, h, 0.9, 0.1) },
    { frame: T.legend, cam: view(VW.khmer, w, h, 0.9, 0.1) },
    { frame: T.flee - 30, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.pegu, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.hostage, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.crumble, cam: view(VW.burma, w, h, 0.9, 0.1) },
    { frame: T.burn, cam: view(VW.burma, w, h, 0.9, 0.1) },
    { frame: T.first, cam: view(VW.peguWide, w, h, 0.8, 0.1) },
    { frame: T.irony, cam: view(VW.empire, w, h, 0.85, 0.08) },
  ],
  years: [[T.flip, "2136"], [T.lw, "2137"], [T.pegu, "2138"], [T.burn, "2142"], [T.killed, "2143"]],
  heads: [
    ...heads(["flip", "lawaek", "legend"], { legend: { color: RED } }),
    ...heads(["pegu1"], { pegu1: { portrait: "naresuan_king" } }),
    ...heads(["crumble"], { crumble: { color: RED, chips: [{ text: "แปร", f: T.crumble + 30 }, { text: "ตองอู", f: T.crumble + 50 }, { text: "ยะไข่", f: T.crumble + 70 }, { text: "ล้านนา", f: T.crumble + 90 }, { text: "ล้านช้าง", f: T.crumble + 110 }] } }),
    ...heads(["burn"], { burn: { color: RED } }),
    ...heads(["toungoo"], { toungoo: { portrait: "nanda_bayin", color: RED } }),
    ...heads(["irony"], { irony: { portrait: "bayinnaung", color: RED } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ck = interpolate(frame, [T.crumble, T.crumble + 20, T.burn + 40, T.burn + 60], [0, 1, 1, 0], clamp);
    const fl = (k: number) => 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.22 + k));
    const ek = interpolate(frame, [T.irony, T.irony + 20], [0, 1], clamp);
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={14} />
        <CityDot at={PL.moulmein} color={GOLD} r={12} start={T.mon} />
        <PointLabel at={PL.moulmein} text="เมาะลำเลิง" start={T.mon} color={GOLD} size={0.7} />
        <Arrow points={R.lawaek} start={T.lw} end={T.fall + 20} color={GOLD} width={14} />
        <CityDot at={PL.lawaek} color={RED} r={14} start={T.lw} />
        <PointLabel at={PL.lawaek} text="ละแวก" start={T.fall} color={GOLD} size={0.8} />
        <BattleMark at={PL.lawaek} start={T.fall} end={T.legend + 30} color={GOLD} />
        <Arrow points={[[104.75, 11.8], [105.9, 13.5], [105.8, 15.5], [104.0, 17.0], [102.6, 17.97]]} start={T.flee - 40} end={T.flee + 10} color={RED} width={8} variant="dashed" />
        <PointLabel at={PL.vientiane} text="เวียงจันทน์" start={T.flee} color={RED} size={0.7} />
        <Arrow points={R.pegu1595} start={T.pegu + 10} end={T.hostage} color={GOLD} width={16} />
        <CityDot at={PL.pegu} color={RED} r={16} start={T.pegu} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.pegu + 6} color={RED} size={0.85} />
        <Ring at={PL.pegu} r={0.12} color={GOLD} start={T.three - 20} end={T.relief + 30} />
        <Arrow points={[[95.22, 18.82], [95.8, 18.0], [96.4, 17.4]]} start={T.relief} end={T.relief + 20} color={RED} width={10} />
        <Arrow points={[[96.43, 18.94], [96.45, 18.1], [96.48, 17.45]]} start={T.relief + 10} end={T.relief + 30} color={RED} width={10} />
        <Zones k={{ burma: ck, lanna: ck * fl(1), lanxang: ck * fl(2) }} colors={{ lanna: "#e05a3a", lanxang: "#e05a3a" }} />
        {[PL.prome, PL.toungoo, PL.arakan].map((p, i) => <CityDot key={i} at={p} color="#3a5aa8" r={12} start={T.crumble + 30 + i * 20} end={T.burn + 80} />)}
        <Arrow points={R.arakan1599} start={T.first} end={T.first + 30} color="#6a8aff" width={12} />
        <Arrow points={R.toungoo1599} start={T.first + 6} end={T.first + 30} color="#6a8aff" width={12} />
        <Arrow points={R.nandaTaken} start={T.take} end={T.take + 25} color={RED} width={10} variant="dashed" />
        <BattleMark at={PL.pegu} start={T.fire} end={T.tg + 20} />
        <PointLabel at={PL.toungoo} text="ตองอู" start={T.take} color="#6a8aff" size={0.75} />
        <Arrow points={R.toToungoo} start={T.tg + 10} end={T.tg + 40} color={GOLD} width={12} />
        <Ring at={PL.toungoo} r={0.1} color={GOLD} start={T.tg + 30} end={T.killed} />
        <Zones k={{ burma: ek }} colors={{ burma: "#7a4a3a" }} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.flip, (a, b) => <PortScene id="e6c6port" at={PL.moulmein} taken={false} start={a} end={b} />],
        [T.lw, (a, b) => <LawaekScene id="e6c6lw" hits={[T.fall]} start={a} end={b} />],
        [T.legend, (a, b) => <LawaekScene id="e6c6lw2" taken={false} start={a} end={b} />],
        [T.flee - 40, (a, b) => <FleeScene id="e6c6flee" start={a} end={b} />],
        [T.pegu, (a, b) => <PeguScene id="e6c6pegu" start={a} end={b} />],
        [T.three - 20, (a, b) => <CitySiegeScene id="e6c6siege" at={PL.pegu} attacker="siam" hits={SIEGE} start={a} end={b} />],
        [T.crumble, (a, b) => <RevoltScene id="e6c6rev" at={PL.toungoo} start={a} end={b} />],
        [T.burn, (a, b) => <PeguScene id="e6c6burn" burn={1} start={a} end={b} />],
        [T.tg, (a, b) => <CitySiegeScene id="e6c6tg" at={PL.toungoo} attacker="siam" night start={a} end={b} />],
        [T.irony, (a, b) => <BurningCityScene id="e6c6ash" at={PL.pegu} start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.mon, SFX.pop, 0.3],
    [T.lw, SFX.whoosh, 0.3],
    [T.pegu + 10, SFX.whoosh, 0.3],
    [T.crumble + 30, SFX.pop, 0.25],
    [T.crumble + 50, SFX.pop, 0.25],
    [T.crumble + 70, SFX.pop, 0.25],
    [T.crumble + 90, SFX.pop, 0.25],
    [T.crumble + 110, SFX.pop, 0.25],
  ],
  night: (f) => interpolate(f, [T.burn + 20, T.fire, T.irony + 60, T.irony + 90], [0, 0.7, 0.7, 0], clamp),
  Audio: () => (
    <>
      <Bed id="sea_rough" from={T.flip} to={T.lw} volume={0.12} />
      <Bed id="war_drums" from={T.lw} to={T.legend} volume={0.3} />
      <Hit id="battle_cry" at={T.fall} volume={0.4} />
      <Bed id="wind" from={T.legend} to={T.pegu} volume={0.15} />
      <Bed id="army_marching" from={T.pegu} to={T.three} volume={0.2} />
      {SIEGE.map((f, i) => <Hit key={f} id={i ? "cannon_old" : "arrows_volley"} at={f} volume={0.4} />)}
      <Bed id="crowd_angry" from={T.crumble} to={T.burn} volume={0.15} />
      <Bed id="fire_big" from={T.fire - 20} to={T.tg + 30} volume={0.3} />
      <Hit id="wood_break" at={T.fire} volume={0.4} />
      <Hit id="gong" at={T.killed} volume={0.4} />
      <Bed id="fire_crackle" from={T.irony} to={END + 10} volume={0.2} />
    </>
  ),
};
