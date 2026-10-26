import { loadFont } from "@remotion/google-fonts/Sriracha";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Box, ButaiDefs, Card, Doors, G, OPEN, Stage, Wall } from "./kit/Butai";
import { CourtBack, Cow, FieldBack, Person, YardBack } from "./kit/Cards";

// N23 kamishibai: a short courtroom tale told on a wooden paper-theatre box. Clappers, the doors swing open, and
// three gouache cards are pulled out through the side slot one by one (the second pulled half way first, to tease
// the answer). The spoken line of each card hangs on a paper tag under the box. Generic example story. 18 s.
export const demo: StyleDemo = { id: "N23", name: "ละครกระดาษ", frames: 540, cover: 300, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);

const C1 = (
  <Card x={OPEN.x} y={OPEN.y} n={1} total={3}>
    <FieldBack />
    <path d="M300 420 Q420 450 540 420" fill="none" stroke="#6b4a2a" strokeWidth={6} />
    <Cow x={420} y={520} s={0.9} color="#c08a52" />
    <Person x={190} y={560} s={1.05} shirt={G.vermilion} hat="ngob" pose="pull" />
    <Person x={660} y={560} s={1.05} shirt={G.ultra} pose="pull" face={-1} />
  </Card>
);
const C2 = (
  <Card x={OPEN.x} y={OPEN.y} n={2} total={3}>
    <CourtBack />
    <Person x={420} y={406} s={0.78} shirt="#f2e4c4" pants="#b9802c" hat="tall" pose="sit" face={-1} armA={30} />
    <Person x={160} y={600} s={0.9} shirt={G.vermilion} hat="none" pose="kneel" />
    <Person x={690} y={600} s={0.9} shirt={G.ultra} hat="none" pose="kneel" face={-1} />
    <Cow x={430} y={600} s={0.62} color="#c08a52" />
  </Card>
);
const C3 = (
  <Card x={OPEN.x} y={OPEN.y} n={3} total={3}>
    <YardBack />
    <Cow x={610} y={560} s={1.25} color="#8c5a32" face={-1} />
    <Cow x={360} y={570} s={0.78} color="#c08a52" run={1} />
    <Person x={760} y={520} s={0.9} shirt={G.ultra} hat="none" pose="point" face={-1} />
    <Person x={110} y={590} s={0.95} shirt={G.vermilion} hat="ngob" />
  </Card>
);

const LINES = [
  { from: 70, to: 214, who: "ชาวนาสองคน", say: "“ลูกวัวตัวนี้ของข้า!”" },
  { from: 214, to: 400, who: "ตุลาการ", say: "“ปล่อยมันไว้กลางลาน แล้วดูว่ามันไปหาใคร”" },
  { from: 400, to: 540, who: "ผู้เล่า", say: "ลูกวัววิ่งตรงไปหาแม่ คดีจบในพริบตา" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [26, 70], [0, 1], { ...clamp, easing: ease });
  const pull1 = interpolate(frame, [190, 222], [0, 1], { ...clamp, easing: ease });
  // half pull (tease), hold, then out
  const pull2 = interpolate(frame, [356, 374, 392, 412], [0, 0.42, 0.42, 1], { ...clamp, easing: ease });
  const push = interpolate(frame, [0, demo.frames], [1, 1.06], clamp);
  const line = LINES.find((l) => frame >= l.from && frame < l.to) ?? LINES[0];
  const tagIn = interpolate(frame, [line.from, line.from + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const swing = Math.sin(frame * 0.12) * 1.6 * (1 - tagIn * 0.4) + (1 - tagIn) * 8;
  const on = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: G.wall }}>
      <Hit id="wood_hit" at={6} volume={0.4} />
      <Hit id="wood_hit" at={16} volume={0.45} />
      <Sfx src={SFX.whoosh} at={186} volume={0.25} />
      <Sfx src={SFX.whoosh} at={352} volume={0.2} />
      <Sfx src={SFX.whoosh} at={390} volume={0.25} />
      <Sfx src={SFX.pop} at={404} volume={0.25} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <ButaiDefs />
        <Wall />
        <g transform={`translate(540,760) scale(${push}) translate(-540,-760)`} opacity={on}>
          {frame < 222 ? <Stage back={C2} front={C1} pull={pull1} /> : <Stage back={C3} front={C2} pull={pull2} />}
          <Box title="เรื่องตัวอย่าง" font={font} />
          <Doors open={open} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#f6ead2", opacity: on }}>
        <div style={{ display: "inline-block", fontSize: 32, padding: "4px 20px", background: G.vermilion, color: "#fbeedd", borderRadius: 4, transform: "rotate(-2deg)" }}>N23 · ละครกระดาษ</div>
        <div style={{ fontSize: 92, lineHeight: 1.25, marginTop: 6, textShadow: "0 4px 0 #0f2a48" }}>คดีลูกวัว</div>
      </div>
      {/* the spoken line on a paper tag hung under the box */}
      <div style={{ position: "absolute", left: 170, right: 170, top: 1230, transformOrigin: "50% -60px", transform: `rotate(${swing}deg) scale(${0.9 + tagIn * 0.1})`, opacity: on }}>
        <div style={{ position: "absolute", left: 60, top: -70, width: 3, height: 74, background: "#6b4a2a" }} />
        <div style={{ position: "absolute", right: 60, top: -70, width: 3, height: 74, background: "#6b4a2a" }} />
        <div style={{ background: "#efc35a", padding: "26px 34px 30px", borderRadius: 6, boxShadow: "0 10px 22px rgba(60,30,10,0.3)", fontFamily: font, color: G.ink, textAlign: "center", backgroundImage: "repeating-linear-gradient(0deg, rgba(120,70,20,0.07) 0 2px, transparent 2px 6px)" }}>
          <div style={{ fontSize: 34, color: "#8a2a14" }}>{line.who}</div>
          <div style={{ fontSize: 50, lineHeight: 1.35, opacity: tagIn }}>{line.say}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 26, color: "#cfe2f4", opacity: 0.85 }}>
        ภาพประกอบ · นิทานตัวอย่าง
      </div>
    </AbsoluteFill>
  );
};
