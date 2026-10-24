import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Dust, Elephant, Tent } from "../nrs/kit";
import { BattleMark, CityDot, MapTag } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { AmbushScene, Backdrop, Banner, CampNightScene, Fighter, Fire, Grass, LootScene, Noble, PAL, Palisade, PassScene, Prang, Smoke, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 5 "หงสาวดีบุก" (beats twoarmies → angry, พ.ศ. 2127–2129): two armies from west and north,
// beaten one at a time, the chronicle numbers, Ban Saket, the spoils, and Nanda Bayin decides to come himself.
const T = {
  two: B.twoarmies.start,
  pasim: wf("twoarmies", "พะสิม", 0.3),
  cm: wf("twoarmies", "เชียงใหม่", 0.62),
  squeeze: wf("twoarmies", "บีบ", 0.85),
  split: B.split.start,
  first: wf("split", "แตก", 0.5),
  turn: wf("split", "หัน", 0.8),
  num: B.numbers1.start,
  lakh: wf("numbers1", "แสน", 0.3),
  higher: wf("numbers1", "สูง", 0.65),
  saket: B.saket.start,
  camp: wf("saket", "ค่าย", 0.4),
  brothers: wf("saket", "เอกาทศรถ", 0.65),
  broke: wf("saket", "แตก", 0.9),
  loot: B.loot.start,
  el: wf("loot", "ช้าง", 0.4),
  horse: wf("loot", "ม้า", 0.62),
  boat: wf("loot", "เรือ", 0.85),
  angry: B.angry.start,
  self: wf("angry", "เอง", 0.85),
};
const END = B.invade.start;
const RAID = [T.brothers + 10, T.brothers + 34, T.broke];

type Sc = { id: string; start: number; end: number };

// Two columns close in from both edges toward the island city in the middle.
const TwoFrontsScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#5a6a8a", "#e8b880"]} accent={RED}>
    {(g, pan, lt) => {
      const k = interpolate(lt, [0, 120], [0, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.25]} />
          <Prang x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 20 * g.s} h={170 * g.s} s={g.s} gold />
          {Array.from({ length: 5 }, (_, i) => <Fighter key={`w${i}`} x={g.x + g.W * (0.02 + i * 0.06) + k * 90 * g.s + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.5} mode="walk" costume={C.burma} phase={i} />)}
          {Array.from({ length: 5 }, (_, i) => <Fighter key={`n${i}`} x={g.x + g.W * (0.98 - i * 0.06) - k * 90 * g.s + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.5} flip mode="walk" costume={C.lanna} phase={i + 0.5} />)}
          <Banner x={g.x + g.W * 0.2 + k * 90 * g.s + pan * 0.7} y={g.ground + 12 * g.s} s={g.s * 0.8} color={PAL.chalk} />
          <Banner x={g.x + g.W * 0.8 - k * 90 * g.s + pan * 0.7} y={g.ground + 12 * g.s} s={g.s * 0.8} color="#3fbf6a" />
          <Grass g={g} shift={pan * 1.6} />
        </g>
      );
    }}
  </V2>
);

// Rows of tiny soldiers multiply across the plain (how big was the army?), a question mark over them.
const CrowdScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan, lt) => {
      const rows = Math.min(5, 1 + Math.floor(lt / 24));
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.22]} />
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: 16 }, (_, i) => <Fighter key={`${r}-${i}`} x={g.x + g.W * (0.03 + i * 0.062) + (r % 2) * 20 * g.s + pan * (0.3 + r * 0.12)} y={g.ground - (80 - r * 22) * g.s} scale={g.sc * (0.24 + r * 0.05)} mode="stand" costume={r % 2 ? C.burma : C.lanna} phase={i + r} />),
          )}
          <text x={g.x + g.W * 0.5} y={g.y + 90 * g.s} textAnchor="middle" fontSize={84 * g.s} fontWeight={900} fill="#fff" stroke={PAL.ink} strokeWidth={4 * g.s} paintOrder="stroke" opacity={interpolate(lt, [40, 60], [0, 1], clamp)}>?</text>
          <Grass g={g} shift={pan * 1.6} />
        </g>
      );
    }}
  </V2>
);

// Dawn raid on a stockaded camp: the two princes' elephants smash in, tents burn.
const CampRaidScene = ({ id, start, end, hits }: Sc & { hits: number[] }) => (
  <V2 id={id} anchor={PL.saket} start={start} end={end} sky={["#4a5a8a", "#f6b880"]} accent={GOLD} hits={hits}>
    {(g, pan, lt) => {
      const rush = interpolate(lt, [0, 90], [0, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.35]} />
          {[0.6, 0.76, 0.9].map((f, i) => <Tent key={f} x={g.x + g.W * f + pan * 0.4} y={g.ground - 8 * g.s} w={100 * g.s} s={g.s} stripe="#3fbf6a" />)}
          {[0.66, 0.84].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.4} y={g.ground - 40 * g.s} h={70 * g.s * rush} seed={i} />)}
          <Smoke x={g.x + g.W * 0.75 + pan * 0.4} y={g.ground - 100 * g.s} s={g.s} dark />
          <Palisade x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground + 4 * g.s} w={g.W * 0.12} s={g.s} />
          <Dust x={g.x + g.W * 0.4} y={g.ground} s={g.s} k={0.5} />
          <Elephant x={g.x + g.W * (0.14 + rush * 0.22) + pan * 0.6} y={g.ground + 10 * g.s} s={g.s * 0.42} walk={1.2} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} />
          <Elephant x={g.x + g.W * (0.02 + rush * 0.2) + pan * 0.6} y={g.ground + 24 * g.s} s={g.s * 0.38} walk={1.2} cloth={PAL.indigo} trim={PAL.gilt} riderCostume={{ ...C.prince, jacket: PAL.indigo }} phase={1.5} />
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.7 + i * 0.09) + rush * 40 * g.s + pan * 0.8} y={g.ground + 26 * g.s} scale={g.sc * 0.5} mode="run" costume={C.lanna} weapon={i ? "none" : "spear"} phase={i} />)}
          <Grass g={g} shift={pan * 1.6} />
        </g>
      );
    }}
  </V2>
);

// Nanda Bayin rises from his throne in anger; ministers press their faces to the floor.
const RageScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.pegu} start={start} end={end} sky={["#3a1a10", "#8a3a22"]} accent={RED} warm={0.12} hits={[start + 26]}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a1a12" />
          {[0.2, 0.4, 0.6].map((f) => <rect key={f} x={g.x + g.W * f - 12 * g.s + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#7a2a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#2a1410" />
          <path d={`M${g.x + g.W * 0.72 + pan * 0.5} ${g.ground - 14 * g.s} l${20 * g.s} ${-60 * g.s} l${120 * g.s} 0 l${20 * g.s} ${60 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Fighter x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 74 * g.s} scale={g.sc * 0.7} flip mode={frame > start + 20 && frame < start + 40 ? "attack" : "stand"} costume={{ ...C.burmaPrince, jacket: "#7a1a14" }} weapon="none" />
          {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.12 + i * 0.12) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.58} mode="prostrate" phase={i} jacket={C.burma.jacket} />)}
        </g>
      )}
    </V2>
  );
};

export const e5c5: ChapterN = {
  name: "หงสาวดีบุก",
  from: B.twoarmies.start,
  to: END,
  cams: (w, h) => [
    { frame: T.two, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.pasim, cam: view(VW.west, w, h, 0.8, 0.1) },
    { frame: T.cm, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.split, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.num, cam: view(VW.region, w, h, 1.0, 0.1) },
    { frame: T.saket, cam: view(VW.north, w, h, 0.8, 0.1) },
    { frame: T.camp, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.angry, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.angry + 30, cam: view(VW.region, w, h, 0.9, 0.1) },
  ],
  years: [[T.two, "2127"], [T.saket, "2128"], [T.angry, "2129"]],
  heads: [
    ...heads(["twoarmies"], { twoarmies: { color: RED, chips: [{ text: "พระยาพะสิม · ตะวันตก", f: T.pasim }, { text: "เชียงใหม่ · เหนือ", f: T.cm }] } }),
    ...heads(["split"]),
    ...heads(["numbers1"], { numbers1: { stat: "130,000", label: "ตามพงศาวดารไทย", color: RED } }),
    ...heads(["saket"], { saket: { portrait: "ekathotsarot" } }),
    ...heads(["loot"], { loot: { chips: [{ text: "ช้าง 120", f: T.el }, { text: "ม้า 100", f: T.horse }, { text: "เรือ 400", f: T.boat }] } }),
    ...heads(["angry"], { angry: { portrait: "nanda_bayin", color: RED } }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={16} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.two} color={GOLD} size={0.8} />
        <Arrow points={R.pasim} start={T.pasim} end={T.pasim + 40} color={RED} width={14} />
        <Arrow points={R.chiangmaiDown} start={T.cm} end={T.cm + 40} color="#3fbf6a" width={14} />
        <PointLabel at={PL.threePagodas} text="ด่านเจดีย์สามองค์" start={T.pasim + 10} color={RED} size={0.65} />
        <PointLabel at={PL.chiangmai} text="เชียงใหม่" start={T.cm} color="#3fbf6a" size={0.7} />
        <BattleMark at={[99.6, 14.1]} start={T.first} end={T.saket} color={GOLD} />
        <BattleMark at={[100.35, 14.95]} start={T.turn} end={T.saket} color={GOLD} />
        <MapTag at={[99.4, 15.0]} text="30,000?" start={T.lakh} end={T.saket} color="#ff8a7a" size={34} />
        <MapTag at={[99.6, 17.6]} text="100,000?" start={T.lakh + 10} end={T.saket} color="#ff8a7a" size={34} />
        <Arrow points={R.saket} start={T.saket + 10} end={T.camp} color="#3fbf6a" width={14} />
        <CityDot at={PL.saket} color={RED} r={12} start={T.camp} end={T.angry} />
        <PointLabel at={PL.saket} text="บ้านสระเกศ" start={T.camp} color={GOLD} size={0.7} />
        <BattleMark at={PL.saket} start={T.broke} end={T.angry} color={GOLD} />
        {frame >= T.angry && <PointLabel at={PL.pegu} text="หงสาวดี" start={T.angry + 20} color={RED} size={0.85} />}
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.two, (a, b) => <PassScene id="e5c5pass" side="burma" light="dawn" start={a} end={b} />],
        [T.squeeze, (a, b) => <TwoFrontsScene id="e5c5two" start={a} end={b} />],
        [T.split, (a, b) => <AmbushScene id="e5c5amb" at={[99.6, 14.1]} foe="burma" hits={[T.first]} start={a} end={b} />],
        [T.num, (a, b) => <CrowdScene id="e5c5crowd" start={a} end={b} />],
        [T.saket, (a, b) => <CampNightScene id="e5c5camp" at={PL.saket} side="lanna" stupa={false} start={a} end={b} />],
        [T.brothers - 10, (a, b) => <CampRaidScene id="e5c5raid" hits={RAID} start={a} end={b} />],
        [T.loot, (a, b) => <LootScene id="e5c5loot" start={a} end={b} />],
        [T.angry, (a, b) => <RageScene id="e5c5rage" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.pasim, SFX.whoosh, 0.3],
    [T.cm, SFX.whoosh, 0.3],
    [T.el, SFX.pop, 0.3],
    [T.horse, SFX.pop, 0.3],
    [T.boat, SFX.pop, 0.3],
  ],
  night: (f) => interpolate(f, [T.saket + 20, T.camp, T.brothers, T.broke], [0, 0.5, 0.5, 0], clamp),
  Audio: () => (
    <>
      <Bed id="army_marching" from={T.two} to={T.split} volume={0.2} />
      <Hit id="war_horn_drums" at={T.squeeze} volume={0.35} />
      <Hit id="battle_cry" at={T.first} volume={0.4} />
      <Hit id="sword_battle" at={T.first + 10} volume={0.35} />
      <Bed id="wind" from={T.num} to={T.saket} volume={0.15} />
      <Bed id="fire_crackle" from={T.saket} to={T.brothers} volume={0.2} />
      <Hit id="elephant" at={RAID[0] - 6} volume={0.5} />
      {RAID.map((f, i) => <Hit key={f} id={i === 2 ? "wood_break" : "sword_clash"} at={f} volume={0.4} />)}
      <Bed id="fire_big" from={T.brothers} to={T.loot + 20} volume={0.2} />
      <Hit id="horse_neigh" at={T.horse} volume={0.3} />
      <Hit id="crowd_cheer" at={T.loot + 10} volume={0.25} />
      <Hit id="wood_hit" at={T.angry + 26} volume={0.45} />
    </>
  ),
};
