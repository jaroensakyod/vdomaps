import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Calendar, CardLayout, Compare, FourSources, GOLD, GREEN, RED, Timeline, ThreeQuestions, VIET_C, CHINA_C, BLUE, font } from "./kit/Cards";
import { HeadCard, Subtitle, type Head } from "./kit/Head";

// N09 evidence cards: "which source says what" without a map — the end of King Taksin (2325): three death dates
// ringed on a calendar, Thai vs Vietnamese chronicle side by side, when the Thai chronicles were written, then
// the one point all four sides agree on, and the three questions to ask any source. 18 s.
export const demo: StyleDemo = { id: "N09", name: "การ์ดหลักฐาน", frames: 540, cover: 205, sizes: ["9x16", "16x9"] };

const T = { cal: 0, d6: 46, d7: 58, d10: 70, cmp: 110, thai: 128, viet: 150, stamp: 186, tl: 230, w1: 252, w2: 272, w3: 296, four: 350, c: [372, 386, 400, 414], match: 436, q: 470, end: 540 };

const HEADS: Head[] = [
  { f: 0, tag: "หลักฐานไม่ตรงกัน", head: "พระเจ้าตากสิ้นพระชนม์วันไหน?", color: GOLD },
  { f: 40, tag: "วันสิ้นพระชนม์", head: "มีถึง 3 วัน", stat: "6 · 7 · 10", label: "เมษายน 2325", color: RED, sure: "mid" },
  { f: T.cmp, tag: "วิธีไม่ตรงกัน", head: "ไทย vs เวียดนาม", color: RED, sure: "mid" },
  { f: T.tl, tag: "พงศาวดารไทย", head: "ชำระในสมัยหลัง", color: GOLD, chips: [{ text: "ทุกฉบับอยู่หลัง 2325", f: T.w3 }] },
  { f: T.four, tag: "แต่มีเรื่องหนึ่ง", head: "ที่ทุกฝ่ายตรงกัน", color: GREEN },
  { f: T.match, tag: "4 ฝ่ายตรงกัน", head: "สิ้นพระชนม์ ต้น เม.ย. 2325", color: GREEN, sure: "high" },
  { f: T.q, tag: "", head: "" },
];
const LINES: [number, string][] = [
  [0, "หลักฐานแต่ละฉบับ ให้วันไม่ตรงกัน"],
  [T.cmp, "เล่าวิธีสิ้นพระชนม์ต่างกันด้วย"],
  [T.tl, "พงศาวดารไทยเขียนหลังเหตุการณ์หลายปี"],
  [T.four, "แต่ทั้งสี่ฝ่ายตรงกันอยู่เรื่องหนึ่ง"],
  [T.q, "ก่อนเชื่อหลักฐาน ถามสามข้อนี้เสมอ"],
];

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Bed id="fire_crackle" from={0} to={T.end} volume={0.1} fade={30} />
    {[T.d6, T.d7, T.d10].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.35} />)}
    <Sfx src={SFX.whoosh} at={T.cmp - 4} volume={0.25} />
    <Sfx src={SFX.pop} at={T.thai} volume={0.35} />
    <Sfx src={SFX.pop} at={T.viet} volume={0.35} />
    <Sfx src={SFX.hit} at={T.stamp} volume={0.35} />
    <Sfx src={SFX.whoosh} at={T.tl - 4} volume={0.25} />
    {[T.w1, T.w2].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.35} />)}
    <Sfx src={SFX.pop} at={T.w3} volume={0.35} />
    {T.c.map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.4} />)}
    <Sfx src={SFX.hit} at={T.match} volume={0.4} />
    {[T.q + 6, T.q + 18, T.q + 30].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.3} />)}
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const wide = width > height;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #12203a 0%, #070d1a 55%, #02060d 100%)" }}>
      <Audio />
      {/* faint archive backdrop: ruled manuscript lines drifting slowly */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={0} x2={width} y1={((i * 52 + frame * 0.4) % (height + 52)) - 26} y2={((i * 52 + frame * 0.4) % (height + 52)) - 26} stroke="#e8dcc0" strokeWidth={2 * s} strokeDasharray={`${28 * s} ${12 * s}`} />)}
      </svg>
      <div style={{ position: "absolute", top: height * (wide ? 0.012 : 0.04), left: 0, right: 0, textAlign: "center", fontFamily: font, color: GOLD, fontSize: 36 * s, fontWeight: 700, opacity: 0.85 }}>N09 · การ์ดหลักฐาน</div>
      <CardLayout panel={wide ? { top: 0.37, h: 380 } : { top: 0.36, h: 400 }} head={wide ? { top: 0.07, h: 300 } : { top: 0.1, h: 290 }} scale={wide ? 1.05 : 1.25}>
        <HeadCard heads={HEADS} from={0} to={T.end} top={wide ? 0.07 : 0.1} />
        <Calendar start={T.cal} end={T.cmp + 8} title="เมษายน พ.ศ. 2325" first={1} marks={[[6, T.d6], [7, T.d7], [10, T.d10]]} />
        <Compare
          start={T.cmp}
          end={T.tl + 8}
          title="วิธีสิ้นพระชนม์ · หลักฐานเล่าต่างกัน"
          left={{ tag: "พงศาวดารไทย (ฉบับหลัง)", text: "ประหาร", color: GOLD, f: T.thai, icon: "thai" }}
          right={{ tag: "พงศาวดารเวียดนาม", text: "ถุงกำมะหยี่ · ท่อนจันทน์", color: VIET_C, f: T.viet, icon: "viet" }}
          stamp={{ text: "เล่าต่างกัน", f: T.stamp }}
        />
        <Timeline
          start={T.tl}
          end={T.four + 8}
          title="พงศาวดารไทย เขียน/ชำระเมื่อไหร่"
          from={2318}
          to={2420}
          marks={[
            { at: 2325, top: "2325", bottom: "เหตุการณ์", f: T.tl + 8, color: RED, big: true },
            { at: 2346, top: "2338", bottom: "ฉบับ 2338", f: T.w1 },
            { at: 2400, top: "สมัยหลัง", bottom: "ฉบับพระราช\nหัตถเลขา", f: T.w2 },
          ]}
          zone={{ from: 2329, text: "ชำระในสมัยราชวงศ์ใหม่", f: T.w3 }}
        />
        <FourSources
          start={T.four}
          end={T.end}
          checks={T.c}
          sources={[["ไทย", "พงศาวดาร", GOLD], ["จีน", "บันทึกราชวงศ์ชิง", CHINA_C], ["เวียดนาม", "พงศาวดารเวียดนาม", VIET_C], ["ฝรั่งเศส", "จดหมายบาทหลวง", BLUE]]}
          bottom={{ text: "สิ้นพระชนม์ ต้น เม.ย. 2325", f: T.match }}
        />
        <ThreeQuestions start={T.q} end={T.end} fs={[T.q + 6, T.q + 18, T.q + 30]} />
      </CardLayout>
      <Subtitle lines={LINES} top={wide ? 0.86 : 0.765} />
    </AbsoluteFill>
  );
};
