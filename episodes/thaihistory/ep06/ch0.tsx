import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { BattleMark, CityDot } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { CompareScene, DuelScene, DuelSilhouetteScene, MusketScene, RetreatScene, ThroneLightScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 6 opening (beats hook → question): the elephant duel at Nong Sarai — glaive, lance or bullet?
const T = {
  setup: B.setup.start,
  clash: wf("setup", "ปะทะ", 0.45),
  riders: wf("setup", "กษัตริย์", 0.7),
  result: B.result.start,
  never: wf("result", "หงสาวดี", 0.6),
  stakes: B.stakes.start,
  ngao: wf("stakes", "พระแสงของ้าว", 0.7),
  gun: wf("stakes", "กระสุนปืน", 0.92),
  q: B.question.start,
};
const END = B.recap.start;
const DUEL = [T.clash + 10, T.clash + 34];

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.1, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>ยุทธหัตถี</div>
        <div style={{ fontSize: 80 * s, fontWeight: 900 }}><span style={{ color: GOLD }}>ง้าว</span> หรือ <span style={{ color: "#ff6b5f" }}>ปืน</span>?</div>
      </div>
    </AbsoluteFill>
  );
};

const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.q || frame > END + 6) return null;
  const k = interpolate(frame, [T.q, T.q + 10], [0, 1], clamp);
  return <div style={{ position: "absolute", right: 70 * s, top: height * 0.34, width: 150 * s, height: 150 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: `${150 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${40 * s}px rgba(255,59,48,0.7)` }}>?</div>;
};

export const e6c0: ChapterN = {
  name: "ยุทธหัตถี",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.setup, cam: view(VW.suphan, w, h, 0.9, 0.1) },
    { frame: T.setup + 50, cam: view(VW.nongsarai, w, h, 1.0, 0.1) },
    { frame: T.result, cam: view(VW.nongsarai, w, h, 1.0, 0.1) },
    { frame: T.never, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.stakes, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.stakes + 40, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.q, cam: view(VW.region, w, h, 0.9, 0.1) },
    { frame: T.q + 40, cam: view(VW.suphan, w, h, 0.9, 0.1) },
  ],
  years: [[0, "2135"]],
  heads: [
    ...heads(["setup"], { setup: { portrait: "naresuan_king" } }),
    { f: T.riders, tag: "บนหลังช้าง", head: "กษัตริย์อยุธยา · รัชทายาทหงสาวดี", color: RED, portrait: "mingyi_swa" },
    ...heads(["result", "stakes"], { result: { color: RED }, stakes: { chips: [{ text: "ง้าว", f: T.ngao }, { text: "หอก", f: T.ngao + 25 }, { text: "ปืน", f: T.gun }] } }),
    ...heads(["question"]),
  ],
  Map: () => (
    <>
      <CityDot at={PL.nongsarai} color={RED} r={16} />
      <CityDot at={PL.ayut} color={GOLD} r={14} start={6} />
      <PointLabel at={PL.nongsarai} text="หนองสาหร่าย" start={8} color={RED} size={0.8} />
      <PointLabel at={PL.ayut} text="อยุธยา" start={16} color={GOLD} size={0.7} />
      <BattleMark at={PL.nongsarai} start={T.clash} end={T.result + 40} />
      <Arrow points={R.swa1592} start={T.setup + 10} end={T.setup + 50} color={RED} width={12} />
      <Arrow points={R.rout} start={T.never} end={T.never + 40} color={RED} width={12} variant="dashed" />
      <PointLabel at={PL.pegu} text="หงสาวดี" start={T.never} color={RED} size={0.8} />
    </>
  ),
  Panels: () =>
    chain(
      [
        [-12, (a, b) => <DuelSilhouetteScene id="e6hook" start={a} end={b} />],
        [T.setup, (a, b) => <DuelScene id="e6duel0" phase="charge" start={a} end={b} hits={DUEL} />],
        [T.result, (a, b) => <RetreatScene id="e6ret" at={PL.threePagodas} start={a} end={b} />],
        [T.stakes, (a, b) => <CompareScene id="e6cmp" left="khoi" right="parabaik" tilt={1} start={a} end={b} />],
        [T.gun, (a, b) => <MusketScene id="e6musk" start={a} end={b} shots={[T.gun + 12]} />],
        [T.q, (a, b) => <ThroneLightScene id="e6q" start={a} end={b} />],
      ],
      END,
    ),
  Screen: () => (
    <>
      <HookTitle />
      <QuestionMark />
    </>
  ),
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    [T.ngao, SFX.pop, 0.3],
    [T.ngao + 25, SFX.pop, 0.3],
    [T.gun, SFX.pop, 0.3],
    [T.q, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="war_drums" from={0} to={T.result} volume={0.35} />
      <Hit id="elephant" at={6} volume={0.6} />
      <Hit id="elephant" at={T.clash - 10} volume={0.5} />
      {DUEL.map((f, i) => <Hit key={f} id={i ? "sword_battle" : "sword_clash"} at={f} volume={0.5} />)}
      <Bed id="wind" from={T.result} to={T.gun} volume={0.2} />
      <Hit id="rifle_echo" at={T.gun + 12} volume={0.45} />
      <Hit id="gong" at={T.q + 4} volume={0.4} />
    </>
  ),
};
