import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { chain, type ChapterN } from "../nrs/beats";
import { CityDot, Ring, Zones } from "../nrs/map";
import { PL, R, VW } from "../nrs/places";
import { BattleScene, BurmeseThroneScene, CitySiegeScene, DeclareScene, HostageScene, LeadChargeScene, MarchScene, PeguScene } from "../nrs/scenes";
import { B, Bed, heads, Hit, wf } from "./beatsKit";

// Episode 5 opening (beats hook → question): a boy taken to Hongsawadi comes back to break with it — how?
const T = {
  setup: B.setup.start,
  taken: wf("setup", "พาตัว", 0.3),
  pegu: wf("setup", "หงสาวดี", 0.6),
  realm: wf("setup", "อาณาจักร", 0.8),
  twenty: B.twenty.start,
  border: wf("twenty", "ชายแดน", 0.5),
  declare: wf("twenty", "ประกาศ", 0.7),
  stakes: B.stakes.start,
  who: wf("stakes", "สมเด็จพระนเรศวร", 0.25),
  invade: wf("stakes", "ยกทัพ", 0.7),
  q: B.question.start,
  big: wf("question", "อาณาจักร", 0.55),
};
const END = B.bayin.start;
const CLASH = [T.invade + 20, T.invade + 44];

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
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>ตัวประกันจาก<span style={{ color: "#ff6b5f" }}>หงสาวดี</span></div>
        <div style={{ fontSize: 84 * s, fontWeight: 900 }}>กลับมา<span style={{ color: GOLD }}>ประกาศอิสรภาพ</span>?</div>
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

export const e5c0: ChapterN = {
  name: "ตัวประกันจากหงสาวดี",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.setup, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.taken + 20, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.realm, cam: view(VW.border, w, h, 0.95, 0.1) },
    { frame: T.realm + 40, cam: view(VW.empire, w, h, 0.85, 0.1) },
    { frame: T.twenty, cam: view(VW.empire, w, h, 0.85, 0.1) },
    { frame: T.twenty + 40, cam: view(VW.border, w, h, 1.05, 0.1) },
    { frame: T.stakes, cam: view(VW.border, w, h, 1.05, 0.1) },
    { frame: T.invade, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.q, cam: view(VW.west, w, h, 0.9, 0.1) },
    { frame: T.q + 40, cam: view(VW.region, w, h, 0.85, 0.1) },
  ],
  years: [[0, "2107"], [T.twenty + 20, "2127"]],
  heads: [
    ...heads(["setup"], { setup: { stat: "ราว 9 ขวบ", label: "องค์ประกัน" } }),
    { f: T.realm, tag: "หงสาวดี", head: "อาณาจักรใหญ่ที่สุดในอุษาคเนย์", color: RED, portrait: "bayinnaung" },
    { f: T.twenty, tag: "ราว 20 ปีต่อมา", head: "ยกทัพถึงชายแดนหงสาวดี", color: GOLD, stat: (f: number) => `พ.ศ. ${Math.round(interpolate(f, [T.twenty, T.twenty + 45], [2107, 2127], clamp))}` },
    { f: T.declare, tag: "ประกาศ", head: "ไม่ขึ้นกับหงสาวดีอีก", color: GOLD },
    ...heads(["stakes"], { stakes: { portrait: "naresuan_prince" } }),
    { f: T.invade, tag: "ผลที่ตามมา", head: "หงสาวดียกทัพมาอีกหลายครั้ง", color: RED },
    ...heads(["question"]),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zk = interpolate(frame, [T.realm, T.realm + 15, T.twenty + 20, T.twenty + 40], [0, 1, 1, 0], clamp);
    return (
      <>
        <Zones k={{ burma: zk, lanna: zk * 0.9, siam: zk * 0.9, lanxang: zk * 0.8 }} colors={{ lanna: "#e05a3a", siam: "#e05a3a", lanxang: "#e05a3a" }} />
        <CityDot at={PL.pegu} color={RED} r={16} />
        <CityDot at={PL.plok} color={GOLD} r={14} start={4} />
        <CityDot at={PL.ayut} color={GOLD} r={14} start={8} />
        <Arrow points={R.hostage} start={T.taken} end={T.taken + 50} color={RED} width={10} variant="dashed" />
        <Arrow points={R.march1584} start={T.border - 30} end={T.border + 10} color={GOLD} width={14} />
        <Arrow points={R.nandaWest} start={T.invade} end={T.invade + 40} color={RED} width={16} />
        <PointLabel at={PL.pegu} text="หงสาวดี" start={6} color={RED} size={0.85} />
        <PointLabel at={PL.plok} text="พิษณุโลก" start={14} color={GOLD} size={0.75} />
        <PointLabel at={PL.ayut} text="อยุธยา" start={T.stakes} color={GOLD} size={0.75} />
        <Ring at={PL.khraeng} r={0.15} color={GOLD} start={T.declare} end={T.stakes + 20} />
        <Ring at={PL.ayut} r={0.08} start={T.invade + 30} end={T.q + 10} />
      </>
    );
  },
  Panels: () =>
    chain(
      [
        [-12, (a, b) => <DeclareScene id="e5hook" start={a} end={b} />],
        [T.setup, (a, b) => <HostageScene id="e5host" at={PL.plok} start={a} end={b} />],
        [T.pegu, (a, b) => <PeguScene id="e5pegu" start={a} end={b} />],
        [T.twenty, (a, b) => <MarchScene id="e5march" at={PL.martaban} side="siam" dir={-1} light="dawn" start={a} end={b} />],
        [T.declare, (a, b) => <LeadChargeScene id="e5lead" at={PL.khraeng} start={a} end={b} />],
        [T.invade, (a, b) => <BattleScene id="e5bat" at={PL.ayut} start={a} end={b} hits={CLASH} />],
        [T.q, (a, b) => <CitySiegeScene id="e5siege" at={PL.ayut} start={a} end={b} />],
        [T.big, (a, b) => <BurmeseThroneScene id="e5throne" start={a} end={b} />],
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
    [T.taken, SFX.whoosh, 0.3],
    [T.border - 30, SFX.whoosh, 0.3],
    [T.q, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="war_drums" from={0} to={T.setup + 20} volume={0.35} />
      <Hit id="gong" at={2} volume={0.5} />
      <Bed id="wind" from={T.setup} to={T.twenty + 10} volume={0.2} />
      <Hit id="elephant" at={T.pegu + 20} volume={0.4} />
      <Bed id="army_marching" from={T.twenty} to={T.declare + 10} volume={0.25} />
      <Hit id="war_horn_drums" at={T.declare} volume={0.4} />
      <Hit id="battle_cry" at={T.invade + 10} volume={0.4} />
      {CLASH.map((f, i) => <Hit key={f} id={i ? "sword_battle" : "sword_clash"} at={f} volume={0.45} />)}
      <Bed id="fire_crackle" from={T.q} to={END + 10} volume={0.2} />
    </>
  ),
};
