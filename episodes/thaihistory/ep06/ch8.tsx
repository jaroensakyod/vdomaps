import { interpolate, useCurrentFrame } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Elephant, RoyalGun } from "../nrs/kit";
import { BattleMark, CityDot } from "../nrs/map";
import { PL, VW } from "../nrs/places";
import { BurningCityScene, Candle, DutchScene, PAL, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 8 "คำตอบ" (beats answer → poll): what all the sources agree on, what is still debated, what is
// certain about the outcome, the lesson and the comment question (glaive, lance or gun?).
const T = {
  ans: B.answer.start,
  a1: B.a1.start,
  a2: B.a2.start,
  ngao: wf("a2", "ง้าว", 0.45),
  lance: wf("a2", "หอก", 0.65),
  gun: wf("a2", "ปืน", 0.9),
  a3: B.a3.start,
  burned: wf("a3", "เผา", 0.9),
  lesson: B.lesson.start,
  poll: B.poll.start,
};
const END = B.poll.end + 45;

type Sc = { id: string; start: number; end: number };

// Three lamps lit one by one on a lacquer table (the three answers).
const LampsScene = ({ id, start, end, lit }: Sc & { lit: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
          <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a1a12" stroke={PAL.ink} strokeWidth={2 * g.s} />
          {[0.25, 0.5, 0.75].map((f, i) => {
            const on = frame >= (lit[i] ?? 1e9);
            return (
              <g key={f}>
                <circle cx={g.x + g.W * f + pan * 0.5} cy={g.ground - 90 * g.s} r={(on ? 70 : 0) * g.s} fill="#ffd25a" opacity={0.18} />
                {on ? <Candle x={g.x + g.W * f + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 2} /> : <rect x={g.x + g.W * f - 6 * g.s + pan * 0.5} y={g.ground - 70 * g.s} width={12 * g.s} height={40 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />}
                <text x={g.x + g.W * f + pan * 0.5} y={g.ground + 30 * g.s} textAnchor="middle" fontSize={40 * g.s} fontWeight={900} fill={on ? PAL.gilt : "#7a5a3a"}>{["①", "②", "③"][i]}</text>
              </g>
            );
          })}
        </g>
      )}
    </V2>
  );
};

// The duel as a temple mural: two elephants painted inside a gilt frame on a red wall.
const MuralScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#5a1a12", "#7a2a1a"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6a1e14" />
        <rect x={g.x + g.W * 0.12 + pan * 0.3} y={g.y + 30 * g.s} width={g.W * 0.76} height={g.H - 70 * g.s} fill="#e9dcc0" stroke={PAL.gilt} strokeWidth={10 * g.s} />
        <Elephant x={g.x + g.W * 0.36 + pan * 0.3} y={g.ground - 10 * g.s} s={g.s * 0.42} swing={0.8} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} umbrella />
        <Elephant x={g.x + g.W * 0.64 + pan * 0.3} y={g.ground - 10 * g.s} s={g.s * 0.42} flip swing={0.2} cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} umbrella />
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.16 + i * 0.085) + pan * 0.3} cy={g.y + 48 * g.s} r={5 * g.s} fill={PAL.gilt} />)}
      </g>
    )}
  </V2>
);

// Three weapons on a lacquered rack — ngao, lance and gun — each lit in turn.
const WeaponsScene = ({ id, start, end, on }: Sc & { on: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#120c08", "#2a1a10"]} accent={GOLD} warm={0.08}>
      {(g, pan) => {
        const lit = (i: number) => (frame >= (on[i] ?? 1e9) ? 1 : 0.35);
        const y0 = g.ground - 20 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1a1008" />
            <rect x={g.x + g.W * 0.1} y={y0} width={g.W * 0.8} height={24 * g.s} fill="#5a1a12" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {[0.25, 0.5, 0.75].map((f, i) => <ellipse key={f} cx={g.x + g.W * f + pan * 0.4} cy={g.y + g.H * 0.45} rx={110 * g.s} ry={120 * g.s} fill="#ffe2a0" opacity={0.12 * lit(i)} />)}
            <g opacity={lit(0)} transform={`translate(${g.x + g.W * 0.25 + pan * 0.4},${y0}) rotate(-70)`}>
              <line x1={0} y1={0} x2={230 * g.s} y2={0} stroke="#5a3a1f" strokeWidth={8 * g.s} strokeLinecap="round" />
              <path d={`M${226 * g.s} ${-14 * g.s} Q${290 * g.s} ${-28 * g.s} ${306 * g.s} ${6 * g.s} Q${270 * g.s} ${-2 * g.s} ${226 * g.s} ${14 * g.s} Z`} fill="#d7dbde" stroke={PAL.ink} strokeWidth={2.5 * g.s} />
            </g>
            <g opacity={lit(1)} transform={`translate(${g.x + g.W * 0.5 + pan * 0.4},${y0}) rotate(-80)`}>
              <line x1={0} y1={0} x2={260 * g.s} y2={0} stroke="#5a3a1f" strokeWidth={6 * g.s} strokeLinecap="round" />
              <path d={`M${258 * g.s} ${-10 * g.s} L${300 * g.s} 0 L${258 * g.s} ${10 * g.s} Z`} fill="#d7dbde" stroke={PAL.ink} strokeWidth={2 * g.s} />
            </g>
            <g opacity={lit(2)} transform={`translate(${g.x + g.W * 0.75 - 130 * g.s + pan * 0.4},${y0 - 60 * g.s}) rotate(-20,${130 * g.s},0)`}>
              <RoyalGun x={0} y={0} w={260 * g.s} s={g.s * 1.8} glow={0} />
            </g>
            {["ง้าว", "หอก", "ปืน"].map((t, i) => <text key={t} x={g.x + g.W * (0.25 + i * 0.25) + pan * 0.4} y={g.ground + 34 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill={PAL.gilt} opacity={lit(i)}>{t}</text>)}
          </g>
        );
      }}
    </V2>
  );
};

export const e6c8: ChapterN = {
  name: "คำตอบ",
  from: B.answer.start,
  to: END,
  cams: (w, h) => [
    { frame: T.ans, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.a3, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.lesson, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.poll, cam: view(VW.suphan, w, h, 0.9, 0.1) },
  ],
  years: [[T.ans, "2135"], [T.a3, "2142"]],
  heads: [
    ...heads(["answer"], { answer: { portrait: "naresuan_king" } }),
    ...heads(["a1", "a2", "a3", "lesson", "poll"]),
  ],
  Map: () => (
    <>
      <CityDot at={PL.nongsarai} color={GOLD} r={16} start={T.ans} />
      <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={T.ans + 6} color={GOLD} size={0.8} />
      <BattleMark at={PL.nongsarai} start={T.a1} end={T.a3} color={GOLD} />
      <CityDot at={PL.pegu} color={RED} r={14} start={T.a3} />
      <PointLabel at={PL.pegu} text="หงสาวดี" start={T.a3 + 6} color={RED} size={0.8} />
      <BattleMark at={PL.pegu} start={T.burned} end={T.poll} />
    </>
  ),
  Panels: () =>
    chain(
      [
        [T.ans, (a, b) => <LampsScene id="e6c8lamps" lit={[T.a1, T.a2, T.a3]} start={a} end={b} />],
        [T.a1 + 20, (a, b) => <MuralScene id="e6c8mural" start={a} end={b} />],
        [T.a2, (a, b) => <WeaponsScene id="e6c8weap" on={[T.ngao, T.lance, T.gun]} start={a} end={b} />],
        [T.a3, (a, b) => <BurningCityScene id="e6c8burn" at={PL.pegu} start={a} end={b} />],
        [T.lesson, (a, b) => <DutchScene id="e6c8dutch" start={a} end={b} />],
        [T.poll, (a, b) => <WeaponsScene id="e6c8poll" on={[T.poll + 30, T.poll + 50, T.poll + 70]} start={a} end={b} />],
      ],
      END,
    ),
  sfx: [
    [T.a1, SFX.pop, 0.3],
    [T.a2, SFX.pop, 0.3],
    [T.a3, SFX.pop, 0.3],
    [T.ngao, SFX.pop, 0.25],
    [T.lance, SFX.pop, 0.25],
    [T.gun, SFX.pop, 0.25],
    [T.poll, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.ans} to={T.a3} volume={0.12} />
      <Bed id="fire_big" from={T.a3} to={T.lesson} volume={0.15} />
      <Hit id="gong" at={T.lesson + 4} volume={0.35} />
      <Bed id="war_drums" from={T.poll} to={END} volume={0.25} />
      <Hit id="elephant" at={T.poll + 20} volume={0.4} />
    </>
  ),
};
