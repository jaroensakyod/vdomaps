import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Tent } from "../nrs/kit";
import { BattleMark, CityDot, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { Backdrop, Candle, CoronationScene, DuelSilhouetteScene, Fighter, Grass, PAL, PalaceWall, Prang, PyreScene, River, ThroneLightScene, TrainingScene, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5, chapter 8 "คำตอบ" (beats answer → poll): three answers from the evidence, the lesson, the teaser for
// the elephant duel, and the comment question.
const T = {
  ans: B.answer.start,
  three: wf("answer", "สาม", 0.85),
  a1: B.a1.start,
  a2: B.a2.start,
  island: wf("a2", "เกาะ", 0.7),
  a3: B.a3.start,
  ava: wf("a3", "อังวะ", 0.6),
  lesson: B.lesson.start,
  next: B.next.start,
  crown: wf("next", "ครองราชย์", 0.25),
  again: wf("next", "อีก", 0.6),
  duel: wf("next", "ยุทธหัตถี", 0.92),
  poll: B.poll.start,
};
const END = B.poll.end + 45;

type Sc = { id: string; start: number; end: number };

// Three lamps lit one by one on a lacquer table (the three answers).
const LampsScene = ({ id, start, end, lit }: Sc & { lit: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
          <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a1a12" stroke={PAL.ink} strokeWidth={2 * g.s} />
          {[0.25, 0.5, 0.75].map((f, i) => {
            const on = frame >= (lit[i] ?? 1e9);
            return (
              <g key={f}>
                <circle cx={g.x + g.W * f + pan * 0.5} cy={g.ground - 90 * g.s} r={(on ? 70 : 0) * g.s} fill="#ffd25a" opacity={0.18} />
                {on && <Candle x={g.x + g.W * f + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 2} />}
                {!on && <rect x={g.x + g.W * f - 6 * g.s + pan * 0.5} y={g.ground - 70 * g.s} width={12 * g.s} height={40 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />}
                <text x={g.x + g.W * f + pan * 0.5} y={g.ground + 30 * g.s} textAnchor="middle" fontSize={40 * g.s} fontWeight={900} fill={on ? PAL.gilt : "#7a5a3a"}>{["①", "②", "③"][i]}</text>
              </g>
            );
          })}
        </g>
      )}
    </V2>
  );
};

// The island city behind its moat: defenders on the walls, the enemy camp stranded across the water.
const MoatScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6f8fb8", "#f2c98a"]} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} ridges={false} />
        {[0.6, 0.78, 0.92].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.2} y={g.ground - 90 * g.s} h={(130 + i * 20) * g.s} s={g.s} />)}
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 40 * g.s} w={g.W * 0.55} h={80 * g.s} s={g.s} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.58 + i * 0.12) + pan * 0.3} y={g.ground - 120 * g.s} scale={g.sc * 0.42} flip mode="stand" costume={C.siam} phase={i} />)}
        <River g={g} y={g.ground - 40 * g.s} pan={pan} />
        {[0.1, 0.26].map((f) => <Tent key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 34 * g.s} w={90 * g.s} s={g.s} stripe="#2a3a6a" />)}
        <Fighter x={g.x + g.W * 0.36 + pan * 0.7} y={g.ground + 34 * g.s} scale={g.sc * 0.5} mode="stand" costume={C.burma} />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export const e5c8: ChapterN = {
  name: "คำตอบ",
  from: B.answer.start,
  to: END,
  cams: (w, h) => [
    { frame: T.ans, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.a1, cam: view(VW.pegu, w, h, 0.9, 0.1) },
    { frame: T.a2, cam: view(VW.central, w, h, 0.9, 0.1) },
    { frame: T.a3, cam: view(VW.empire, w, h, 0.85, 0.08) },
    { frame: T.lesson, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.again, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.duel, cam: view(VW.suphan, w, h, 0.9, 0.1) },
  ],
  years: [[T.ans, "2130"], [T.next, "2133"]],
  heads: [
    ...heads(["answer"], { answer: { portrait: "naresuan_prince" } }),
    ...heads(["a1", "a2", "a3", "lesson"]),
    ...heads(["next"], { next: { portrait: "naresuan_king", color: RED } }),
    { f: T.again, tag: "ตอนหน้า", head: "ยุทธหัตถี", color: RED, portrait: "mingyi_swa" },
    ...heads(["poll"]),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ek = interpolate(frame, [T.a3, T.a3 + 20, T.lesson, T.lesson + 20], [0, 1, 1, 0], clamp);
    const flick = (k: number) => 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.2 + k));
    return (
      <>
        <CityDot at={PL.pegu} color={RED} r={14} start={T.ans} />
        <CityDot at={PL.ayut} color={GOLD} r={14} start={T.ans} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={T.a1} color={RED} size={0.8} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.a2} color={GOLD} size={0.8} />
        <Zones k={{ burma: ek, lanna: ek * flick(1), lanxang: ek * flick(2) }} colors={{ lanna: "#e05a3a", lanxang: "#e05a3a" }} />
        <PointLabel at={PL.ava} text="อังวะ" start={T.ava} color="#6a8aff" size={0.8} />
        <Arrow points={R.swa1592} start={T.again} end={T.again + 50} color={RED} width={14} />
        <CityDot at={PL.nongsarai} color={RED} r={14} start={T.duel - 10} />
        <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={T.duel} color={RED} size={0.8} />
        <BattleMark at={PL.nongsarai} start={T.duel + 10} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [T.ans, (a, b) => <LampsScene id="e5c8lamps" lit={[T.a1, T.a2, T.a3]} start={a} end={b} />],
        [T.a1 + 30, (a, b) => <TrainingScene id="e5c8train" start={a} end={b} />],
        [T.a2, (a, b) => <MoatScene id="e5c8moat" start={a} end={b} />],
        [T.a3, (a, b) => <PyreScene id="e5c8pyre" burn={0.4} start={a} end={b} />],
        [T.lesson, (a, b) => <ThroneLightScene id="e5c8light" start={a} end={b} />],
        [T.next, (a, b) => <CoronationScene id="e5c8crown" start={a} end={b} />],
        [T.again, (a, b) => <DuelSilhouetteScene id="e5c8duel" start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.a1, SFX.pop, 0.3],
    [T.a2, SFX.pop, 0.3],
    [T.a3, SFX.pop, 0.3],
    [T.again, SFX.whoosh, 0.3],
    [T.poll, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.ans} to={T.lesson} volume={0.12} />
      <Hit id="gong" at={T.crown} volume={0.4} />
      <Bed id="war_drums" from={T.again} to={END} volume={0.3} />
      <Hit id="elephant" at={T.duel} volume={0.55} />
      <Hit id="war_horn_drums" at={T.poll + 10} volume={0.3} />
    </>
  ),
};
