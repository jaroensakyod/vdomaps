import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { clamp, font, GOLD, QuizBackdrop, QuizHeader, QuizNews } from "./kit/Quiz";

// N11 quiz cards: two end-of-chapter questions in the news card look — choices slide in, a 3-2-1 countdown with a
// draining bar, the answer ticks green, the others fade with a red cross, then a one-line explanation. 15 s.
export const demo: StyleDemo = { id: "N11", name: "ควิซท้ายบท", frames: 450, cover: 150, sizes: ["9x16", "16x9"] };

type Q = { start: number; reveal: number; end: number; question: string; options: string[]; answer: number; explain: string };
const QS: Q[] = [
  { start: 14, reveal: 124, end: 214, question: "กรุงศรีอยุธยาเป็นราชธานีนานกี่ปี?", options: ["217 ปี", "417 ปี", "517 ปี"], answer: 1, explain: "พ.ศ. 1893–2310" },
  { start: 226, reveal: 346, end: 446, question: "แม่น้ำสายไหนไม่ได้ล้อมเกาะเมือง?", options: ["เจ้าพระยา", "ป่าสัก", "ลพบุรี", "ท่าจีน"], answer: 3, explain: "ท่าจีนแยกไปทางตะวันตก" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  return (
    <AbsoluteFill>
      <QuizBackdrop />
      {QS.map((q, i) => (
        <AbsoluteFill key={i}>
          <Sfx src={SFX.whoosh} at={q.start - 4} volume={0.25} />
          {[3, 2, 1].map((n) => <Sfx key={n} src={SFX.tick} at={q.reveal - n * 30} volume={0.3} />)}
          <Sfx src={SFX.riser} at={q.reveal - 62} volume={0.2} />
          <Sfx src={SFX.hit} at={q.reveal} volume={0.45} />
          {frame <= q.end && <QuizHeader n={i + 1} of={QS.length} title="ทบทวนท้ายบท" start={q.start} top={wide ? 0.06 : 0.14} />}
          <QuizNews title="ทายกันหน่อย" question={q.question} options={q.options} answer={q.answer} start={q.start + 6} reveal={q.reveal} end={q.end} explain={q.explain} top={wide ? 0.27 : 0.28} />
        </AbsoluteFill>
      ))}
      <div style={{ position: "absolute", top: height * (wide ? 0.9 : 0.045), left: 0, right: 0, textAlign: "center", fontFamily: font, color: GOLD, fontSize: 36 * s, fontWeight: 700, opacity: 0.85 * interpolate(frame, [0, 12], [0, 1], clamp) }}>N11 · ควิซท้ายบท</div>
    </AbsoluteFill>
  );
};
