import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Glow } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, GOLD, RED, view } from "../news/kit";
import { B, CHINA_C, CityDot, VIET_C, VOICE, wf, type Chapter4 } from "./beatsKit";
import { BigQuestion, Calendar, Compare, FourSources, GREEN, inBeat, mono, Poll, ThreeQuestions, Timeline } from "./ch6_cards";
import { PL, R, VW } from "./places";
import { Backdrop, Boat, C, Grass, Noble, PAL, Prang, River, Tree, V2 } from "./v2";

// Episode 4, chapter 8 (answer → poll): the answer in three points, the lesson, the poll.

const T = {
  answer: B.answer.start,
  a1: B.a1.start,
  a1match: inBeat("a1", wf("a1", "ตรง", 0.45), 120),
  a2: B.a2.start,
  day: inBeat("a2", wf("a2", "วัน", 0.39), 160),
  how: inBeat("a2", wf("a2", "วิธี", 0.45), 130),
  who: inBeat("a2", wf("a2", "ใคร", 0.56), 100),
  argue: inBeat("a2", wf("a2", "ถก", 0.86), 20),
  a3: B.a3.start,
  over: inBeat("a3", wf("a3", "กว่า", 0.32), 200),
  conflict: inBeat("a3", wf("a3", "ขัด", 0.69), 90),
  notEv: inBeat("a3", wf("a3", "ไม่ใช่", 0.89), 20),
  lesson: B.lesson.start,
  poll: B.poll.start,
  end: B.poll.end + 45,
};
const [HOW, WHO] = [Math.max(T.how, T.day + 12), Math.max(T.who, T.day + 24)];
const Q3 = mono([wf("lesson", "ใคร", 0.48), wf("lesson", "เมื่อ", 0.69), wf("lesson", "ให้", 0.88)], 15, T.lesson + 20, B.lesson.end - 10);
const OPTS = mono([wf("poll", "ไทย", 0.41), wf("poll", "จีน", 0.48), wf("poll", "เวียดนาม", 0.55), wf("poll", "ฝรั่งเศส", 0.71)], 10, T.poll + 20, B.poll.end - 40);
const BUTTON = Math.max(OPTS[3] + 20, inBeat("poll", wf("poll", "พิมพ์", 0.77), 20));
const CHECKS = [T.a1 + 14, T.a1 + 24, T.a1 + 34, T.a1 + 44];
const OAR = T.answer + 24;

// ---------- illustrated panels ----------

// Dawn over the Chao Phraya: Wat Arun far off in the haze, one small boat on the golden water.
// variant "morning": the sun higher, the boat further on, someone resting on the bank.
const DawnRiverScene = ({ id, start, end, variant = "dawn" }: { id: string; start: number; end: number; variant?: "dawn" | "morning" }) => {
  const frame = useCurrentFrame();
  const m = variant === "morning";
  return (
    <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={m ? ["#7fb0d8", "#f6e2b8"] : ["#4a3a6a", "#f6a86a"]} accent={GOLD} warm={m ? 0.06 : 0.12}>
      {(g, pan, lt) => {
        const water = g.ground - 60 * g.s;
        const sunX = g.x + g.W * (m ? 0.7 : 0.62) + pan * 0.1;
        const sunY = m ? g.y + g.H * 0.25 : water - 20 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={null} far={m ? "#8aa0a8" : "#7a5a7a"} mid={m ? "#5a7a5a" : "#4a3a4a"} ground="#3a3020" mist={m ? "#f4f0e0" : "#ffc8a0"} ridges={false} />
            <Glow x={sunX} y={sunY} s={g.s} color={m ? "#fff1c9" : "#ffb060"} core={m ? "#fffaf0" : "#ffe0a0"} />
            {/* far: treeline and Wat Arun silhouette */}
            <path d={`M${g.x - 60 * g.s} ${water} ${[...Array(20)].map((_, i) => `q${30 * g.s} ${-(10 + ((i * 7) % 12)) * g.s} ${60 * g.s} 0`).join(" ")} V${water + 10 * g.s} H${g.x - 60 * g.s} Z`} fill={m ? "#4a6a4a" : "#3a2a3a"} transform={`translate(${pan * 0.2},0)`} />
            <g opacity={0.9}>
              <Prang x={g.x + g.W * 0.3 + pan * 0.2} y={water - 4 * g.s} h={170 * g.s} s={g.s} color={m ? "#b8b2a2" : "#5a4a5a"} gold={m} />
              <Prang x={g.x + g.W * 0.21 + pan * 0.2} y={water - 4 * g.s} h={90 * g.s} s={g.s} color={m ? "#a8a292" : "#4a3a4a"} />
              <Prang x={g.x + g.W * 0.39 + pan * 0.2} y={water - 4 * g.s} h={90 * g.s} s={g.s} color={m ? "#a8a292" : "#4a3a4a"} />
            </g>
            {/* mid: the river with the sun's road on it, mist */}
            <River g={g} y={water} pan={pan} color={m ? "#4a7f9f" : "#5a4a6a"} />
            {[...Array(7)].map((_, i) => <rect key={i} x={sunX - (60 - i * 6) * g.s + Math.sin(frame * 0.1 + i) * 6 * g.s} y={water + (8 + i * 10) * g.s} width={(120 - i * 12) * g.s} height={3 * g.s} fill="#ffe0a0" opacity={0.6 - i * 0.06} />)}
            <rect x={g.x} y={water - 26 * g.s} width={g.W} height={34 * g.s} fill={m ? "#ffffff" : "#ffd8b8"} opacity={0.2} />
            {/* near: one boat */}
            <Boat x={g.x + g.W * (m ? 0.62 : 0.4) + lt * 0.5 * g.s + pan * 0.7} y={water + 46 * g.s} w={130 * g.s} s={g.s} n={1} costume={C.villager} />
            {m && <Noble x={g.x + g.W * 0.16 + pan * 0.9} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="sit" jacket="#8a7a5a" phase={1} />}
            {/* foreground: palm and reeds */}
            <Tree x={g.x + g.W * 0.92 + pan * 1.6} y={g.y + g.H + 10 * g.s} s={g.s * 1.4} kind="palm" />
            <Grass g={g} shift={pan * 1.6} color={m ? "#2f3a24" : "#1e1a18"} />
          </g>
        );
      }}
    </V2>
  );
};

// A reader at a library table: four books in the four sources' colours, morning light from the window.
const ReaderScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e8d8b0", "#f6ecd0"]} accent={GOLD} warm={0.08}>
      {(g, pan) => {
        const tx = g.x + g.W * 0.36 + pan * 0.7;
        const turn = (Math.sin(frame * 0.05) + 1) / 2;
        return (
          <g>
            {/* far: library wall with tall windows */}
            <rect x={g.x - 60 * g.s} y={g.y - 10 * g.s} width={g.W + 120 * g.s} height={g.H + 20 * g.s} fill="#c8b48a" />
            {[0.1, 0.72].map((f) => (
              <g key={f}>
                <rect x={g.x + g.W * f + pan * 0.2} y={g.y + 20 * g.s} width={150 * g.s} height={200 * g.s} fill="#dff0f8" stroke={PAL.ink} strokeWidth={3 * g.s} />
                <Glow x={g.x + g.W * f + 75 * g.s + pan * 0.2} y={g.y + 80 * g.s} s={g.s * 0.6} color="#fff6dc" core="#ffffff" />
                <line x1={g.x + g.W * f + 75 * g.s + pan * 0.2} y1={g.y + 20 * g.s} x2={g.x + g.W * f + 75 * g.s + pan * 0.2} y2={g.y + 220 * g.s} stroke={PAL.ink} strokeWidth={4 * g.s} />
              </g>
            ))}
            {/* light shafts */}
            <path d={`M${g.x + g.W * 0.72 + pan * 0.2} ${g.y + 20 * g.s} l${150 * g.s} 0 l${-120 * g.s} ${280 * g.s} l${-260 * g.s} 0 Z`} fill="#fff6dc" opacity={0.18} />
            {/* mid: shelves */}
            <g transform={`translate(${g.x + g.W * 0.3 + pan * 0.5},${g.y + 30 * g.s})`}>
              <rect x={0} y={0} width={300 * g.s} height={180 * g.s} fill="#6b4a2a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              {[0, 1].map((r) => [...Array(13)].map((_, i) => <rect key={`${r}${i}`} x={(8 + i * 22) * g.s} y={(14 + r * 84 + (i % 3) * 5) * g.s} width={18 * g.s} height={(66 - (i % 3) * 5) * g.s} fill={["#7a2a22", "#2b3a67", "#5b6e4a", "#a8822a"][(i + r) % 4]} stroke={PAL.ink} strokeWidth={1 * g.s} />))}
            </g>
            {/* near: reader and table with four books */}
            <Noble x={tx - 30 * g.s} y={g.ground - 20 * g.s} scale={g.sc * 0.64} mode="kneel" bow={0.3 + 0.08 * turn} jacket="#4a6a8a" />
            <rect x={tx} y={g.ground - 48 * g.s} width={g.W * 0.5} height={20 * g.s} fill="#7a5230" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={tx + 20 * g.s} y={g.ground - 28 * g.s} width={14 * g.s} height={60 * g.s} fill="#5a3a20" />
            <rect x={tx + g.W * 0.46} y={g.ground - 28 * g.s} width={14 * g.s} height={60 * g.s} fill="#5a3a20" />
            <path d={`M${tx + 40 * g.s} ${g.ground - 48 * g.s} l${60 * g.s} ${-8 * g.s} l${60 * g.s} ${8 * g.s} l0 ${-5 * g.s} l${-60 * g.s} ${-8 * g.s} l${-60 * g.s} ${8 * g.s} Z`} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <path d={`M${tx + 100 * g.s} ${g.ground - 61 * g.s} q${(10 - turn * 30) * g.s} ${-20 * g.s} ${(30 - turn * 60) * g.s} ${-4 * g.s}`} stroke={PAL.ink} strokeWidth={1.2 * g.s} fill="#f4ecd8" />
            {[GOLD, CHINA_C, VIET_C, "#4fa3ff"].map((c, i) => <rect key={c} x={tx + (220 + (i % 2) * 6) * g.s} y={g.ground - (68 + i * 18) * g.s} width={150 * g.s} height={16 * g.s} fill={c} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            {/* foreground: hanging plant */}
            <g transform={`translate(${g.x + g.W * 0.06 + pan * 1.6},${g.y}) rotate(${Math.sin(frame * 0.04) * 3})`}>
              <line x1={0} y1={0} x2={0} y2={40 * g.s} stroke={PAL.ink} strokeWidth={2 * g.s} />
              <path d={`M${-24 * g.s} ${40 * g.s} h${48 * g.s} l${-8 * g.s} ${30 * g.s} h${-32 * g.s} Z`} fill="#a8522a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              {[-1, 0, 1].map((d) => <path key={d} d={`M${d * 12 * g.s} ${66 * g.s} q${d * 20 * g.s} ${40 * g.s} ${d * 8 * g.s} ${90 * g.s}`} stroke="#4a7a3a" strokeWidth={6 * g.s} fill="none" strokeLinecap="round" />)}
            </g>
          </g>
        );
      }}
    </V2>
  );
};

export const e4c8: Chapter4 = {
  name: "คำตอบ",
  from: T.answer,
  to: T.end,
  cams: (w, h) => [
    { frame: T.answer, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.answer + 40, cam: view(VW.hook, w, h, 0.8, 0.1) },
    { frame: T.a1, cam: view(VW.hook, w, h, 0.8, 0.1) },
    { frame: T.a1 + 40, cam: view(VW.asia, w, h, 0.45, 0.1) },
    { frame: T.a2, cam: view(VW.asia, w, h, 0.45, 0.1) },
    { frame: T.a2 + 45, cam: view(VW.hook, w, h, 0.8, 0.1) },
    { frame: T.a3, cam: view(VW.hook, w, h, 0.8, 0.1) },
    { frame: T.a3 + 45, cam: view(VW.south, w, h, 0.55, 0.1) },
    { frame: T.lesson, cam: view(VW.south, w, h, 0.55, 0.1) },
    { frame: T.lesson + 45, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.poll, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.poll + 60, cam: view(VW.hook, w, h, 0.85, 0.1) },
  ],
  years: [[T.answer, "2325"]],
  heads: [
    { f: T.answer, tag: "คำถามของวันนี้", head: "สิ้นพระชนม์จริงไหม?", color: GOLD, portrait: "taksin_king" },
    { f: T.a1, tag: "คำตอบ ①", head: "4 ฝ่ายตรงกัน", color: GREEN, chips: [{ text: "สิ้นพระชนม์ ต้น เม.ย. 2325", f: T.a1match }] },
    { f: T.a2, tag: "② ที่ยังเถียงกัน", head: "วัน · วิธี · ความรับผิดชอบ", color: RED, chips: [{ text: "วันไหน", f: T.day }, { text: "วิธีไหน", f: HOW }, { text: "ใครรับผิดชอบ", f: WHO }] },
    { f: T.a3, tag: "③ ตำนานนครศรีฯ", head: "ตำนาน ไม่ใช่หลักฐาน", color: GOLD, chips: [{ text: "เขียนกว่า 160 ปีหลัง", f: T.over }, { text: "แต่ละฉบับขัดกันเอง", f: T.conflict }] },
    { f: T.lesson, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame < T.a1 + 20 && <CityDot at={PL.thon} color={RED} r={14} start={T.answer} />}
        {frame < T.a1 + 20 && <CityDot at={PL.nakhonsi} color={GOLD} r={14} start={T.answer + 10} />}
        {frame >= T.a1 + 30 && frame < T.a2 + 40 && (
          <>
            <PointLabel at={PL.thon} text="ไทย" start={CHECKS[0]} color={GOLD} size={0.8} />
            <PointLabel at={PL.beijing} text="จีน" start={CHECKS[1]} color={CHINA_C} size={0.8} />
            <PointLabel at={PL.hue} text="เวียดนาม" start={CHECKS[2]} color={VIET_C} size={0.8} />
          </>
        )}
        {frame >= T.a2 + 40 && frame < T.a3 + 40 && <PointLabel at={PL.fort} text="ธนบุรี" start={T.a2 + 50} color={RED} size={0.85} />}
        {frame >= T.a3 + 30 && frame < T.lesson + 40 && (
          <>
            <Arrow points={R.escape} start={T.a3 + 40} end={T.a3 + 100} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.notEv, T.notEv + 20], [1, 0.3], clamp)} />
            <PointLabel at={PL.khunphanom} text="ตำนาน?" start={T.a3 + 90} color={GOLD} size={0.85} />
          </>
        )}
        {frame >= T.poll + 40 && <CityDot at={PL.thon} color={GOLD} r={14} start={T.poll + 50} />}
      </>
    );
  },
  Panels: () => (
    <>
      <DawnRiverScene id="e4c8dawn" start={T.answer} end={T.a1 + 14} />
      <ReaderScene id="e4c8reader" start={T.lesson} end={T.poll + 14} />
      <DawnRiverScene id="e4c8morning" start={T.poll} end={T.end + 30} variant="morning" />
    </>
  ),
  Screen: () => (
    <>
      <BigQuestion start={T.answer + 6} end={T.a1 + 6} />
      <FourSources start={T.a1} end={T.a2 + 8} checks={CHECKS} bottom={{ text: "สิ้นพระชนม์ ต้น เม.ย. 2325", f: T.a1match }} title="① หลักฐานร่วมสมัยทุกฝ่าย" />
      <Calendar start={T.a2} end={HOW + 8} marks={[[6, T.a2 + 12], [7, T.a2 + 20], [10, T.a2 + 28]]} />
      <Compare
        start={HOW}
        end={T.a3 + 8}
        title="② ยังถกเถียงกันได้"
        left={{ tag: "พงศาวดารไทย", text: "ประหาร", color: GOLD, f: HOW + 4, icon: "thai" }}
        right={{ tag: "พงศาวดารเวียดนาม", text: "ท่อนจันทน์ · สั่งลับ ๆ", color: VIET_C, f: HOW + 14, icon: "viet" }}
        stamp={{ text: "ยังถกเถียงได้", f: T.argue }}
      />
      <Timeline
        start={T.a3}
        end={T.lesson + 8}
        title="③ ตำนานปรากฏเมื่อไหร่"
        from={2300}
        to={2520}
        dotted
        marks={[
          { at: 2325, top: "2325", bottom: "เหตุการณ์", f: T.a3 + 6, color: RED, big: true },
          { at: 2492, top: "2492", bottom: "พิมพ์ครั้งแรก", f: T.a3 + 14, big: true },
        ]}
        blink={{ a: 2325, b: 2492, text: "กว่า 160 ปี", f: T.over }}
      />
      <ThreeQuestions start={T.lesson} end={T.poll + 6} fs={Q3} />
      <Poll start={T.poll} end={T.end} opts={OPTS} button={BUTTON} />
    </>
  ),
  sfx: [
    [T.answer, SFX.riser, 0.25],
    [T.answer + 6, SFX.hit, 0.35],
    [T.a1, SFX.pop, 0.35],
    ...CHECKS.map((f) => [f, SFX.tick, 0.35] as [number, string, number]),
    [T.a1 + 34, SFX.whoosh, 0.3],
    [T.a1match, SFX.hit, 0.35],
    [T.a2, SFX.pop, 0.35],
    [T.a2 + 12, SFX.pop, 0.3],
    [T.a2 + 20, SFX.pop, 0.3],
    [T.a2 + 28, SFX.pop, 0.3],
    [HOW, SFX.pop, 0.3],
    [T.argue, SFX.hit, 0.35],
    [T.a3, SFX.pop, 0.35],
    [T.a3 + 39, SFX.whoosh, 0.3],
    [T.over, SFX.tick, 0.3],
    [T.notEv, SFX.hit, 0.35],
    ...Q3.map((f) => [f, SFX.pop, 0.35] as [number, string, number]),
    ...OPTS.map((f) => [f, SFX.pop, 0.3] as [number, string, number]),
    [BUTTON, SFX.hit, 0.4],
  ],
  Audio: () => (
    <>
      {/* dawn on the river: wind, an oar dips */}
      <Hit id="gong" at={T.answer + 6} volume={0.3} />
      <Bed id="wind" from={T.answer} to={T.a1 + 14} volume={0.14} voice={VOICE} />
      <Hit id="splash" at={OAR} volume={0.18} />
      {/* library: rain has stopped, a quiet wind outside */}
      <Bed id="wind" from={T.lesson} to={T.poll + 14} volume={0.08} voice={VOICE} />
      {/* morning on the river to the end */}
      <Bed id="wind" from={T.poll} to={T.end} volume={0.14} voice={VOICE} />
      <Hit id="splash" at={T.poll + 30} volume={0.16} />
    </>
  ),
};



