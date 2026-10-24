import { useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { BattleMark, CityDot } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { C } from "../nrs/kit";
import { Backdrop, Fighter, Grass, Hall, JudgementScene, Monk, PalaceWall, PortScene, Smoke, V2 } from "../nrs/scenes";
import { Ladder, Pyatthat } from "../nrs/kit";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 3 "หลังศึก" (beats punish → tavoy, พ.ศ. 2135–2136): the death sentence for the generals who
// fell behind, the monks' plea, and the campaign to Tavoy and Tenasserim instead.
const T = {
  punish: B.punish.start,
  chakri: wf("punish", "จักรี", 0.5),
  risk: wf("punish", "เสี่ยง", 0.85),
  plea: B.plea.start,
  ask: wf("plea", "ขอ", 0.45),
  send: wf("plea", "ทวาย", 0.75),
  tav: B.tavoy.start,
  both: wf("tavoy", "ตะนาวศรี", 0.5),
  sea: wf("tavoy", "อันดามัน", 0.9),
};
const END = B.warn.start;

type Sc = { id: string; start: number; end: number };

// Senior monks walk in procession across the palace court toward the hall (to plead for the generals).
const MonksWalkScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} />
        <Hall x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 20 * g.s} w={300 * g.s} s={g.s} />
        {[0, 1, 2, 3].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.09) + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.62} mode="walk" phase={i * 1.3} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// Siamese troops storm the walls of a coastal town with ladders; smoke over the gate.
const StormScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.tavoy} start={start} end={end} sky={["#5a6a8a", "#e8b880"]} accent={GOLD} hits={[start + 40, start + 80]}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.3]} />
        <Pyatthat x={g.x + g.W * 0.6 + pan * 0.3} y={g.ground - 100 * g.s} w={150 * g.s} s={g.s} n={3} />
        <PalaceWall x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={100 * g.s} s={g.s} color="#c9b48a" />
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.6 + i * 0.16) + pan * 0.5} y={g.ground - 104 * g.s} scale={g.sc * 0.42} flip mode="attack" costume={C.burma} phase={i} />)}
        <Ladder x={g.x + g.W * 0.42 + pan * 0.6} y={g.ground + 4 * g.s} h={104 * g.s} s={g.s} lean={22} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.04 + i * 0.08) + lt * 0.3 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.56} mode={i % 2 ? "run" : "attack"} costume={C.siam} phase={i} />)}
        <Smoke x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 140 * g.s} s={g.s} dark />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export const e6c3: ChapterN = {
  name: "หลังศึก",
  from: B.punish.start,
  to: END,
  cams: (w, h) => [
    { frame: T.punish, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.send, cam: view(VW.south, w, h, 0.9, 0.1) },
    { frame: T.tav, cam: view(VW.south, w, h, 0.9, 0.1) },
  ],
  years: [[T.punish, "2135"], [T.tav, "2136"]],
  heads: [
    { f: T.punish, tag: "คำตอบ", head: "ตัดสินประหาร", color: RED, chips: [{ text: "เจ้าพระยาจักรี", f: T.chakri }, { text: "พระยาพระคลัง", f: T.chakri + 25 }] },
    ...heads(["plea"]),
    ...heads(["tavoy"], { tavoy: { chips: [{ text: "ทวาย", f: T.tav + 30 }, { text: "ตะนาวศรี", f: T.both }] } }),
  ],
  Map: () => {
    useCurrentFrame();
    return (
      <>
        <CityDot at={PL.ayut} color={GOLD} r={16} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.punish + 6} color={GOLD} size={0.8} />
        <Arrow points={R.tavoy} start={T.send} end={T.send + 40} color={GOLD} width={14} />
        <Arrow points={R.tenasserim} start={T.send + 20} end={T.send + 60} color={GOLD} width={12} />
        <CityDot at={PL.tavoy} color={RED} r={14} start={T.send} />
        <CityDot at={PL.tenasserim} color={RED} r={14} start={T.send + 20} />
        <PointLabel at={PL.tavoy} text="ทวาย" start={T.tav + 30} color={GOLD} size={0.8} />
        <PointLabel at={PL.tenasserim} text="ตะนาวศรี" start={T.both} color={GOLD} size={0.8} />
        <BattleMark at={PL.tavoy} start={T.tav + 30} end={END} color={GOLD} size={0.8} />
        <BattleMark at={PL.tenasserim} start={T.both} end={END} color={GOLD} size={0.8} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.punish, (a, b) => <JudgementScene id="e6c3judge" start={a} end={b} />],
        [T.plea, (a, b) => <MonksWalkScene id="e6c3walk" start={a} end={b} />],
        [T.ask, (a, b) => <JudgementScene id="e6c3plea" monks start={a} end={b} />],
        [T.tav, (a, b) => <StormScene id="e6c3storm" start={a} end={b} />],
        [T.both, (a, b) => <PortScene id="e6c3port" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.chakri, SFX.pop, 0.3],
    [T.chakri + 25, SFX.pop, 0.3],
    [T.send, SFX.whoosh, 0.3],
  ],
  Audio: () => (
    <>
      <Hit id="gong" at={T.punish + 4} volume={0.45} />
      <Bed id="wind" from={T.punish} to={T.tav} volume={0.12} />
      <Hit id="battle_cry" at={T.tav + 20} volume={0.35} />
      <Hit id="sword_clash" at={T.tav + 40} volume={0.35} />
      <Hit id="wood_break" at={T.tav + 80} volume={0.35} />
      <Bed id="sea_rough" from={T.both} to={END + 10} volume={0.18} />
      <Hit id="ship_bell" at={T.both} volume={0.3} />
    </>
  ),
};
