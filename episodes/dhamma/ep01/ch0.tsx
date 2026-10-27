import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, font, RED, view, type Chapter } from "../../thaihistory/news/kit";
import { LEAF } from "../kit/Mural";
import { IconStrip } from "../kit/Pictos";
import { B, card, wf } from "./beatsKit";
import { LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA, PL, VW } from "./places";

// Opening (hook → question): the prince who has everything leaves it all in one night.
const T = {
  setup: B.setup.start,
  prince: wf("setup", "เจ้า", 0.3),
  palace: wf("setup", "วัง", 0.62),
  wife: wf("setup", "ชายา", 0.74),
  son: wf("setup", "โอรส", 0.88),
  night: B.night.start,
  ride: wf("night", "ทรง", 0.5),
  q: B.question.start,
  trace: wf("question", "ตาม", 0.45),
  bodhi: wf("question", "โพธิ์", 0.8),
};
const END = B.where.start;

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.12, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 120 * s, fontWeight: 900 }}>ทิ้ง<span style={{ color: LEAF }}>บัลลังก์</span></div>
        <div style={{ fontSize: 110 * s, fontWeight: 900 }}>เพื่ออะไร?</div>
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

export const d1ch0: Chapter = {
  name: "ประสูติถึงตรัสรู้",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.foothills, w, h, 1.1, 0.1) },
    { frame: T.setup, cam: view(VW.foothills, w, h, 1.1, 0.1) },
    { frame: T.setup + 40, cam: view(VW.plain, w, h, 0.9, 0.1) },
    { frame: T.night, cam: view(VW.plain, w, h, 0.9, 0.1) },
    { frame: T.night + 40, cam: view(VW.foothills, w, h, 1.0, 0.1) },
    { frame: T.q, cam: view(VW.foothills, w, h, 1.0, 0.1) },
    { frame: T.q + 40, cam: view(VW.route, w, h, 0.95, 0.1) },
  ],
  years: [[0, "ราว 2,600 ปีก่อน"]],
  heads: [
    { f: T.setup, tag: "ราว 2,600 ปีก่อน · เชิงเขาหิมาลัย", head: "เจ้าชายผู้มีทุกอย่าง", color: LEAF },
    { f: T.prince, tag: "เจ้าชายแห่งศากยะ", head: "เจ้าชายสิทธัตถะ", color: LEAF, portrait: "dhamma/siddhattha_prince" },
    { f: T.palace, tag: "มีทุกอย่าง", head: "วัง 3 หลัง · ชายา · พระโอรส", color: LEAF, portrait: "dhamma/siddhattha_prince" },
    { f: T.wife, tag: "ชายา", head: "พระนางยโสธรา", color: LEAF, portrait: "dhamma/yasodhara" },
    { ...card("night", LEAF), f: T.night },
    card("question", LEAF),
  ],
  night: (f) => interpolate(f, [0, T.setup, T.setup + 30, T.night, T.night + 30, T.q, T.q + 30], [1, 1, 0.15, 0.15, 1, 1, 0.2], clamp),
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={6} color={LEAF} size={0.9} />
        {frame >= T.ride && frame < T.q + 10 && <Arrow points={LEG_ANOMA} start={T.ride} end={T.ride + 50} color={LEAF} width={16} />}
        {frame >= T.trace && (
          <>
            {[LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA].map((pts, i) => <Arrow key={i} points={pts} start={T.trace + i * 18} end={T.trace + 18 + i * 18} color={LEAF} width={12} variant="dashed" opacity={0.8} />)}
            <PointLabel at={PL.lumbini} text="ลุมพินี" start={T.trace} color={LEAF} size={0.7} />
            <PointLabel at={PL.bodhgaya} text="ต้นโพธิ์" start={T.bodhi} color={LEAF} size={0.8} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d0"
      anchor={PL.kapila}
      end={END}
      shots={[
        { f: -12, night: true, icons: [{ k: "gate", x: 0.2, size: 260, d: 0 }, { k: "horse", x: 0.42, move: 0.8, size: 250, d: 4 }, { k: "moon", x: 0.88, y: 200, size: 60, d: 8 }] },
        { f: T.setup, title: "2,600", sub: "ปีก่อน · เชิงเขาหิมาลัย", icons: [{ k: "mountains", x: 0.14, size: 210 }, { k: "mountains", x: 0.86, size: 240, flip: true }] },
        { f: T.palace, icons: ["ร้อน", "ฝน", "หนาว"].map((t, i) => ({ k: "palace" as const, x: 0.2 + i * 0.3, size: 220, d: i * 7, label: `หน้า${t}` })) },
        { f: T.wife, icons: [{ k: "palace", x: 0.12, size: 130 }, { k: "figure", x: 0.42, size: 250, o: { crown: true } }, { k: "figure", x: 0.66, size: 230, o: { crown: true, wide: 1.2 } }] },
        { f: T.son, icons: [{ k: "figure", x: 0.36, size: 250, o: { crown: true }, d: 0 }, { k: "figure", x: 0.66, size: 230, o: { crown: true, wide: 1.2 }, d: 0 }, { k: "baby", x: 0.51, size: 100, d: 4 }] },
        { f: T.night, night: true, icons: [{ k: "gate", x: 0.15, size: 260, d: 0 }, { k: "horse", x: 0.38, move: 0.85, size: 250, d: 2 }] },
        { f: T.ride, night: true, icons: [{ k: "gate", x: 0.12, size: 220 }, { k: "horse", x: 0.42, size: 240 }, { k: "demon", x: 0.78, size: 240, d: 12 }] },
        { f: T.q, icons: [{ k: "question", x: 0.5, size: 270 }, { k: "crown", x: 0.18, size: 170, d: 10 }, { k: "tree", x: 0.84, size: 230, d: 16, o: { kind: "bodhi" } }] },
        { f: T.bodhi, at: PL.bodhgaya, icons: [{ k: "tree", x: 0.5, size: 320, o: { kind: "bodhi" } }, { k: "footprint", x: 0.15, size: 120, d: 8 }, { k: "lotus", x: 0.85, size: 120, d: 12 }] },
      ]}
    />
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
    [T.setup - 6, SFX.whoosh, 0.35],
    [T.palace, SFX.pop, 0.3],
    [T.night - 6, SFX.whoosh, 0.35],
    [T.ride, SFX.whoosh, 0.3],
    [T.q, SFX.riser, 0.25],
    [T.trace, SFX.pop, 0.3],
  ],
};
