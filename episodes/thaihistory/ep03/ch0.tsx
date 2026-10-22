import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, RED, view, type Chapter } from "../news/kit";
import { B, BURMA_C, CityDot, Stockades, wf, Zones } from "./beatsKit";
import { INVADE, PL } from "./places";
import { DefendersScene, MarchScene, SiegeScene } from "./scenes";

// Episode 3 opening (beats hook → question): the great Burmese army closes on Phitsanulok.
const T = {
  setup: B.setup.start,
  general: wf("setup", "แม่ทัพ", 0.2),
  men: wf("setup", "ยก", 0.5),
  besiege: wf("setup", "บุก", 0.75),
  stakes: B.stakes.start,
  months: wf("stakes", "ราว", 0.55),
  twist: wf("stakes", "ตอน", 0.75),
  q: B.question.start,
};
const END = B.recap.start;
export const HOOKVIEW = bbox([[97.6, 15.3], [101.6, 17.9]]);

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
        <div style={{ fontSize: 108 * s, fontWeight: 900 }}>แม่ทัพที่<span style={{ color: "#ff6b5f" }}>ชนะจีน</span></div>
        <div style={{ fontSize: 100 * s, fontWeight: 900 }}>ทำไมเอา<span style={{ color: GOLD }}>ไทย</span>ไม่ลง?</div>
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

export const e3ch0: Chapter = {
  name: "ศึกอะแซหวุ่นกี้",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(HOOKVIEW, w, h, 0.8, 0.08) },
    { frame: T.setup, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: T.besiege - 10, cam: view(HOOKVIEW, w, h, 0.85, 0.08) },
    { frame: T.besiege + 25, cam: view(bbox([[99.6, 16.3], [100.9, 17.3]]), w, h, 0.9, 0.06) },
    { frame: T.q, cam: view(bbox([[99.6, 16.3], [100.9, 17.3]]), w, h, 0.9, 0.06) },
    { frame: T.q + 35, cam: view(HOOKVIEW, w, h, 0.8, 0.08) },
  ],
  years: [[0, "2318–2319"]],
  heads: [
    { f: T.setup, tag: "พ.ศ. 2318", head: "แม่ทัพผู้หยุดทัพจีน", color: RED, portrait: "azaewungyi" },
    { f: T.men, tag: "ทัพพม่า", head: "บุกหัวเมืองเหนือ", stat: "ราว 35,000", label: "คน", color: RED, portrait: "azaewungyi" },
    { f: T.besiege, tag: "เป้าหมาย", head: "ล้อมพิษณุโลก", color: RED },
    { f: T.stakes, tag: "ทหารไทยในเมือง", head: "น้อยกว่าหลายเท่า", color: GOLD },
    { f: T.months, tag: "การล้อมลากยาว", head: "แต่เมืองยังไม่แตก", stat: "ราว 4 เดือน", color: GOLD },
    { f: T.twist, tag: "และตอนจบ", head: "ไม่มีใครคาดคิด", color: GOLD },
    { f: T.q, tag: "คำถามของวันนี้", head: "ทำไมเอาไทยไม่ลง?", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zk = interpolate(frame, [0, 10], [0, 1], clamp) * interpolate(frame, [T.setup, T.setup + 20], [1, 0.5], clamp);
    return (
      <>
        <Zones k={{ siam: zk, burma: zk, lanna: zk * 0.6 }} />
        <Arrow points={INVADE} start={0} end={40} color={BURMA_C} width={30} />
        <Stockades center={PL.plk} n={10} r0={0.16} r1={0.1} start={T.besiege} step={4} creepFrom={T.stakes} creepTo={T.q} />
        <Stockades center={PL.plk} n={1} r0={0.16} start={4} step={0} out={T.setup} />
        <CityDot at={PL.plk} color={GOLD} r={16} />
        <PointLabel at={PL.plk} text="พิษณุโลก" start={T.besiege + 20} color={GOLD} size={0.85} />
      </>
    );
  },
  Panels: () => (
    <>
      <MarchScene id="e3hook" anchor={PL.tak} start={-12} end={T.besiege + 14} />
      <SiegeScene id="e3siege" anchor={PL.plk} start={T.besiege} end={T.stakes + 14} />
      <DefendersScene id="e3def" anchor={PL.plk} start={T.stakes} end={T.q + 14} />
      <SiegeScene id="e3q" anchor={PL.plk} start={T.q} end={END + 14} night />
    </>
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
    [T.general, SFX.pop, 0.3],
    [T.men, SFX.hit, 0.45],
    [T.besiege, SFX.whoosh, 0.35],
    [T.months, SFX.tick, 0.35],
    [T.twist, SFX.riser, 0.25],
    [T.q, SFX.pop, 0.35],
  ],
};
