import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Shot } from "../../../components/Scene";
import { SFX } from "../../../components/Sound";
import { clamp, GOLD, QuizNews, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { C, Dust, Elephant } from "../nrs/kit";
import { BattleMark, CityDot, MapTag } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { Backdrop, BattleScene, DuelScene, Fighter, Grass, MusketScene, NgaoCloseScene, PAL, Smoke, Tree, V2 } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6, chapter 2 "วันยุทธหัตถี" (beats dawn → quiz1): the day of the duel as the later Thai chronicles tell it —
// guns at dawn, the elephants in musth, alone in the enemy ranks, the dust, the challenge, the hat, the blow,
// Ekathotsarot's duel, the mahout shot, the rout; quiz: what happened to the generals who fell behind?
const T = {
  dawn: B.dawn.start,
  guns: wf("dawn", "ปืน", 0.3),
  fast: wf("dawn", "เร็ว", 0.85),
  musth: B.musth.start,
  chai: wf("musth", "ไชยานุภาพ", 0.25),
  prab: wf("musth", "ปราบไตรจักร", 0.5),
  run: wf("musth", "วิ่ง", 0.85),
  alone: B.alone.start,
  few: wf("alone", "ไม่กี่", 0.8),
  dust: B.dust.start,
  clear: wf("dust", "จาง", 0.45),
  see: wf("dust", "อุปราชา", 0.75),
  ch: B.challenge.start,
  invite: wf("challenge", "เชิญ", 0.3),
  honour: wf("challenge", "เกียรติ", 0.6),
  clash: B.clash.start,
  ram: wf("clash", "รุน", 0.5),
  cut: wf("clash", "ฟัน", 0.9),
  hat: B.hat.start,
  dodge: wf("hat", "เบี่ยง", 0.2),
  name: wf("hat", "มาลาเบี่ยง", 0.85),
  strike: B.strike.start,
  up: wf("strike", "ดัน", 0.3),
  blow: wf("strike", "ฟัน", 0.55),
  ekat: B.ekat.start,
  ekBlow: wf("ekat", "ฟัน", 0.75),
  mahout: B.mahout.start,
  bullet: wf("mahout", "กระสุน", 0.6),
  rout: B.rout.start,
  broke: wf("rout", "แตก", 0.6),
  quiz: B.quiz1.start,
};
const END = B.punish.start;
const REVEAL = END - 2;

type Sc = { id: string; start: number; end: number };

// Dawn: gun smoke over the scrub, the Siamese vanguard falling back fast.
const VanguardScene = ({ id, start, end, shots }: Sc & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#4a5a8a", "#f6b880"]} accent={RED} hits={shots}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.42]} />
          {shots.map((f) => <Smoke key={f} x={g.x + g.W * 0.88} y={g.ground - 40 * g.s} s={g.s} n={frame > f ? 5 : 0} />)}
          {shots.map((f, i) => <Shot key={`s${f}`} from={[g.x + g.W * 0.9, g.ground - 50 * g.s]} to={[g.x + g.W * (0.5 - i * 0.1), g.ground - 10 * g.s]} t={frame - f} s={g.s} flight={12} />)}
          {Array.from({ length: 7 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.7 - i * 0.09) - lt * 1.1 * g.s + pan * 0.7} y={g.ground + 18 * g.s + (i % 2) * 8 * g.s} scale={g.sc * 0.52} flip mode="run" costume={C.siam} weapon={i % 3 ? "spear" : "none"} phase={i} />)}
          {[0.12, 0.9].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 1.2} y={g.ground + 34 * g.s} s={g.s * 1.3} />)}
          <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
        </g>
      )}
    </V2>
  );
};

// The two royal elephants in musth crash through the enemy front; Burmese soldiers scatter.
const MusthScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#8a7a6a", "#f2c98a"]} accent={RED} hits={[start + 70]}>
    {(g, pan, lt) => {
      const run = interpolate(lt, [0, 140], [0, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.88, 0.22]} />
          <Dust x={g.x + g.W * (0.2 + run * 0.3)} y={g.ground} s={g.s} k={0.6} />
          <Elephant x={g.x + g.W * (0.12 + run * 0.4) + pan * 0.6} y={g.ground + 14 * g.s} s={g.s * 0.48} walk={1.4} trumpet={interpolate(lt, [10, 22, 60], [0, 1, 0], clamp)} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} />
          <Elephant x={g.x + g.W * (0.0 + run * 0.36) + pan * 0.6} y={g.ground + 30 * g.s} s={g.s * 0.42} walk={1.4} phase={1.4} trumpet={interpolate(lt, [30, 42, 80], [0, 1, 0], clamp)} cloth={PAL.indigo} trim={PAL.gilt} riderCostume={{ ...C.prince, jacket: PAL.indigo }} />
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.62 + i * 0.07) + run * 60 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.5} flip={i % 2 === 0} mode="run" costume={C.burma} phase={i} />)}
          <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
        </g>
      );
    }}
  </V2>
);

// Alone in the enemy ranks: the two royal elephants ringed by Burmese spearmen, a handful of Siamese at their feet.
const SurroundedScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#8a6a4a", "#f2c98a"]} accent={RED}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.2]} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={`b${i}`} x={g.x + g.W * (0.08 + i * 0.2) + pan * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 0.4} flip={i > 2} mode="attack" costume={C.burma} phase={i} />)}
        <Elephant x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground + 14 * g.s} s={g.s * 0.46} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} walk={0.2} />
        <Elephant x={g.x + g.W * 0.66 + pan * 0.6} y={g.ground + 22 * g.s} s={g.s * 0.42} cloth={PAL.indigo} trim={PAL.gilt} riderCostume={{ ...C.prince, jacket: PAL.indigo }} walk={0.2} phase={2} />
        {Array.from({ length: 6 }, (_, i) => <Fighter key={`f${i}`} x={g.x + g.W * (0.02 + i * 0.19) + pan * 1.0} y={g.ground + 40 * g.s} scale={g.sc * 0.62} flip={i > 2} mode="aim" costume={C.burmaRed} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
      </g>
    )}
  </V2>
);

// The dust thins: across the field, the crown prince's elephant waits in the shade of a great tree.
const DustRevealScene = ({ id, start, end, clearAt }: Sc & { clearAt: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [clearAt - 10, clearAt + 30], [1.2, 0.15], clamp);
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#9a7a5a", "#f2c98a"]} accent={RED}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.3, 0.22]} />
          <Tree x={g.x + g.W * 0.78 + pan * 0.4} y={g.ground - 10 * g.s} s={g.s * 2.4} />
          <Elephant x={g.x + g.W * 0.74 + pan * 0.5} y={g.ground + 6 * g.s} s={g.s * 0.42} flip cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} umbrella />
          <Elephant x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground + 26 * g.s} s={g.s * 0.5} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} />
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#d8b98a" opacity={Math.min(0.85, k * 0.7)} />
          <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s * 1.6} k={k} n={10} />
          <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
        </g>
      )}
    </V2>
  );
};

// The challenge (as the chronicles tell it): the king raises his hand toward the crown prince; both elephants turn.
const FaceOffScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#8a5a3a", "#f2b880"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.35]} lightColor={["#ffd38a", "#fff1cc"]} />
        <Elephant x={g.x + g.W * 0.27 + pan * 0.5} y={g.ground + 16 * g.s} s={g.s * 0.5} trumpet={interpolate(lt, [30, 44, 90], [0, 1, 0], clamp)} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} umbrella />
        <Elephant x={g.x + g.W * 0.73 + pan * 0.5} y={g.ground + 16 * g.s} s={g.s * 0.5} flip trumpet={interpolate(lt, [70, 84, 130], [0, 1, 0], clamp)} cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} umbrella />
        <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
      </g>
    )}
  </V2>
);

// Ekathotsarot's elephant against the Burmese general's (a second duel nearby).
const EkatScene = ({ id, start, end, blow }: Sc & { blow: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.nongsarai} start={start} end={end} sky={["#6a5a4a", "#e8c890"]} accent={GOLD} hits={[blow]}>
      {(g, pan) => {
        const sw = interpolate(frame, [blow - 12, blow, blow + 20], [0, 1, 0.3], clamp);
        const down = interpolate(frame, [blow + 4, blow + 26], [0, 1], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.15, 0.25]} />
            <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s} k={0.5} />
            <Elephant x={g.x + g.W * 0.33 + pan * 0.6} y={g.ground + 20 * g.s} s={g.s * 0.5} swing={sw} cloth={PAL.indigo} trim={PAL.gilt} riderCostume={{ ...C.prince, jacket: PAL.indigo }} />
            <Elephant x={g.x + g.W * 0.68 + pan * 0.6} y={g.ground + 20 * g.s} s={g.s * 0.48} flip cloth="#3a3a46" trim="#7a2a22" riderCostume={C.burmaRed} slump={down} hurt={down * 0.3} />
            {frame >= blow && frame < blow + 8 && <circle cx={g.x + g.W * 0.52} cy={g.ground - 170 * g.s} r={40 * g.s} fill="#fff4dc" opacity={0.7} />}
            <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
          </g>
        );
      }}
    </V2>
  );
};

export const e6c2: ChapterN = {
  name: "วันยุทธหัตถี",
  from: B.dawn.start,
  to: END,
  cams: (w, h) => [
    { frame: T.dawn, cam: view(VW.nongsarai, w, h, 0.9, 0.1) },
    { frame: T.alone, cam: view(VW.nongsarai, w, h, 1.4, 0.1) },
    { frame: T.ch, cam: view(VW.nongsarai, w, h, 1.6, 0.1) },
    { frame: T.ekat, cam: view(VW.nongsarai, w, h, 1.6, 0.1) },
    { frame: T.rout, cam: view(VW.nongsarai, w, h, 1.0, 0.1) },
    { frame: T.broke, cam: view(VW.west, w, h, 0.9, 0.1) },
  ],
  years: [[T.dawn, "2135"]],
  heads: [
    ...heads(["dawn"], { dawn: { color: RED } }),
    ...heads(["musth"], { musth: { chips: [{ text: "เจ้าพระยาไชยานุภาพ", f: T.chai }, { text: "เจ้าพระยาปราบไตรจักร", f: T.prab }] } }),
    ...heads(["alone"], { alone: { color: RED } }),
    ...heads(["dust"], { dust: { portrait: "mingyi_swa", color: RED } }),
    ...heads(["challenge"], { challenge: { portrait: "naresuan_king" } }),
    ...heads(["clash"], { clash: { color: RED, portrait: "mingyi_swa" } }),
    ...heads(["hat", "strike"], { strike: { portrait: "naresuan_king" } }),
    ...heads(["ekat"], { ekat: { portrait: "ekathotsarot" } }),
    ...heads(["mahout"], { mahout: { color: RED } }),
    ...heads(["rout"]),
    { f: T.quiz, tag: "", head: "" },
  ],
  Map: () => (
    <>
      <CityDot at={PL.nongsarai} color={GOLD} r={16} />
      <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={T.dawn + 6} color={GOLD} size={0.8} />
      <Arrow points={[[99.88, 14.62], [99.93, 14.635], [99.955, 14.64]]} start={T.guns} end={T.fast} color={GOLD} width={10} variant="dashed" />
      <Arrow points={[[99.96, 14.645], [99.93, 14.64], [99.9, 14.628]]} start={T.run - 10} end={T.run + 20} color={GOLD} width={14} />
      <BattleMark at={[99.905, 14.63]} start={T.alone} end={T.rout} size={1.2} />
      <MapTag at={[99.905, 14.615]} text="ยุทธหัตถี" start={T.ch} end={T.rout} color={GOLD} size={34} />
      <Arrow points={R.rout} start={T.broke} end={T.broke + 50} color={RED} width={14} variant="dashed" />
      <Arrow points={[[99.96, 14.64], [99.6, 14.25], [99.2, 14.6]]} start={T.broke + 10} end={T.broke + 50} color={GOLD} width={12} />
    </>
  ),
  Panels: () =>
    chain(
      [
        [T.dawn, (a, b) => <VanguardScene id="e6c2van" shots={[T.guns, T.guns + 14]} start={a} end={b} />],
        [T.musth, (a, b) => <MusthScene id="e6c2musth" start={a} end={b} />],
        [T.alone, (a, b) => <SurroundedScene id="e6c2alone" start={a} end={b} />],
        [T.dust, (a, b) => <DustRevealScene id="e6c2dust" clearAt={T.clear} start={a} end={b} />],
        [T.ch, (a, b) => <FaceOffScene id="e6c2face" start={a} end={b} />],
        [T.clash, (a, b) => <DuelScene id="e6c2clash" push={-1} hits={[T.ram, T.cut]} start={a} end={b} />],
        [T.hat, (a, b) => <NgaoCloseScene id="e6c2hat" hatCut={T.dodge + 4} start={a} end={b} />],
        [T.strike, (a, b) => <NgaoCloseScene id="e6c2blow" strike={T.blow} start={a} end={b} />],
        [T.ekat, (a, b) => <EkatScene id="e6c2ekat" blow={T.ekBlow} start={a} end={b} />],
        [T.mahout, (a, b) => <MusketScene id="e6c2musk" who="burma" shots={[T.bullet - 8]} start={a} end={b} />],
        [T.rout, (a, b) => <BattleScene id="e6c2rout" winner="left" light="dusk" hits={[T.broke]} start={a} end={b} />],
      ],
      T.quiz,
    ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="แม่ทัพที่ตามเสด็จไม่ทัน?" options={["ได้รางวัล", "ตัดสินประหาร", "ปลดออก"]} answer={1} start={T.quiz} reveal={REVEAL} end={END + 26} color={GOLD} />,
  sfx: [
    [T.chai, SFX.pop, 0.3],
    [T.prab, SFX.pop, 0.3],
    [T.quiz, SFX.pop, 0.35],
    [REVEAL - 90, SFX.tick, 0.3],
    [REVEAL - 60, SFX.tick, 0.3],
    [REVEAL - 30, SFX.tick, 0.3],
    [REVEAL, SFX.hit, 0.45],
  ],
  Audio: () => (
    <>
      <Bed id="war_drums" from={T.dawn} to={T.dust} volume={0.3} />
      <Hit id="rifle_echo" at={T.guns} volume={0.5} />
      <Hit id="rifle_ww1" at={T.guns + 14} volume={0.35} />
      <Hit id="elephant" at={T.musth + 12} volume={0.6} />
      <Hit id="elephant" at={T.musth + 32} volume={0.5} />
      <Bed id="army_marching" from={T.musth} to={T.alone + 20} volume={0.2} />
      <Hit id="battle_cry" at={T.alone + 10} volume={0.35} />
      <Bed id="wind_storm" from={T.dust} to={T.ch} volume={0.18} />
      <Hit id="elephant" at={T.ch + 34} volume={0.5} />
      <Hit id="elephant" at={T.ch + 74} volume={0.45} />
      <Hit id="sword_clash" at={T.ram} volume={0.5} />
      <Hit id="sword_swish" at={T.cut - 4} volume={0.4} />
      <Hit id="sword_battle" at={T.cut} volume={0.5} />
      <Hit id="sword_swish" at={T.dodge} volume={0.45} />
      <Hit id="sword_clash" at={T.dodge + 4} volume={0.5} />
      <Hit id="sword_swish" at={T.blow - 4} volume={0.45} />
      <Hit id="sword_battle" at={T.blow} volume={0.7} />
      <Hit id="sword_battle" at={T.ekBlow} volume={0.5} />
      <Hit id="rifle_echo" at={T.bullet - 8} volume={0.45} />
      <Hit id="crowd_cheer" at={T.broke} volume={0.4} />
      <Bed id="army_marching" from={T.rout} to={T.quiz} volume={0.2} />
    </>
  ),
};
