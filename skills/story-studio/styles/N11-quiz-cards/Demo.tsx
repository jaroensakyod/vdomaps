import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { NE, NeonText, QuizShow, ShowHeader, StageBackdrop, useU } from "./kit/Neon";

// N11 quiz cards as a neon game show: two end-of-chapter questions on a dark stage — the question board lights up
// inside a ring of chasing marquee bulbs, neon-tube lettering strikes on, lit podium options flicker in, a ring of
// bulbs drains for 3-2-1, then the buzzer flash, the right podium blazes green, the others short out, confetti.
// 15 s.
export const demo: StyleDemo = { id: "N11", name: "ควิซท้ายบท", frames: 450, cover: 150, sizes: ["9x16", "16x9"] };

type Q = { start: number; reveal: number; end: number; question: string; options: string[]; answer: number; explain: string };
const QS: Q[] = [
  { start: 14, reveal: 124, end: 214, question: "กรุงศรีอยุธยาเป็นราชธานีนานกี่ปี?", options: ["217 ปี", "417 ปี", "517 ปี"], answer: 1, explain: "พ.ศ. 1893–2310" },
  { start: 226, reveal: 346, end: 446, question: "แม่น้ำสายไหนไม่ได้ล้อมเกาะเมือง?", options: ["เจ้าพระยา", "ป่าสัก", "ลพบุรี", "ท่าจีน"], answer: 3, explain: "ท่าจีนแยกไปทางตะวันตก" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { wide, u } = useU();
  return (
    <AbsoluteFill style={{ background: NE.stage }}>
      <StageBackdrop />
      {QS.map((q, i) => (
        <AbsoluteFill key={i}>
          <Sfx src={SFX.whoosh} at={q.start - 4} volume={0.25} />
          {[3, 2, 1].map((n) => <Sfx key={n} src={SFX.tick} at={q.reveal - n * 30} volume={0.3} />)}
          <Sfx src={SFX.riser} at={q.reveal - 62} volume={0.2} />
          <Sfx src={SFX.hit} at={q.reveal} volume={0.45} />
          <Sfx src={SFX.pop} at={q.reveal + 2} volume={0.3} />
          {frame <= q.end && <ShowHeader n={i + 1} of={QS.length} title="ทบทวนท้ายบท" start={q.start} top={wide ? 0.06 : 0.1} />}
          <QuizShow question={q.question} options={q.options} answer={q.answer} start={q.start + 6} reveal={q.reveal} end={q.end} explain={q.explain} top={wide ? 0.27 : 0.25} />
        </AbsoluteFill>
      ))}
      <div style={{ position: "absolute", top: wide ? 22 * u : 40 * u, left: 0, right: 0, textAlign: "center" }}>
        <NeonText color={NE.pink} on={0} size={30} seed={1}>N11 · ควิซท้ายบท</NeonText>
      </div>
      <div style={{ position: "absolute", bottom: 26 * u, right: 34 * u, fontFamily: "inherit" }}>
        <NeonText color={NE.cyan} on={8} size={22} seed={5}>ควิซทบทวน · ภาพประกอบ</NeonText>
      </div>
    </AbsoluteFill>
  );
};
