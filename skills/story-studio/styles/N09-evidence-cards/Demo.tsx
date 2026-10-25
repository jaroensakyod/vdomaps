import { AbsoluteFill } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Calendar, Compare, FourSources, Headline, NewsPage, Subtitle, ThreeQuestions, Timeline, type Head } from "./kit/Press";

// N09 evidence cards as a broadsheet: "which source says what" without a map — the end of King Taksin (2325),
// set as a front page whose evidence arrives as scissor-cut clippings: three death dates ringed in red pencil on
// an almanac calendar, the Thai vs Vietnamese chronicle as two clipped columns, when the Thai chronicles were
// written, the one point all four sides agree on (ticked), and the three questions to ask any source. 18 s.
export const demo: StyleDemo = { id: "N09", name: "การ์ดหลักฐาน", frames: 540, cover: 205, sizes: ["9x16", "16x9"] };

const T = { cal: 0, d6: 46, d7: 58, d10: 70, cmp: 110, thai: 128, viet: 150, stamp: 186, tl: 230, w1: 252, w2: 272, w3: 296, four: 350, c: [372, 386, 400, 414], match: 436, q: 470, end: 540 };

const HEADS: Head[] = [
  { f: 0, tag: "หลักฐานไม่ตรงกัน", head: "พระเจ้าตากสิ้นพระชนม์วันไหน?" },
  { f: 40, tag: "วันสิ้นพระชนม์", head: "มีถึง 3 วัน", stat: "6 · 7 · 10", label: "เมษายน 2325", sure: "mid" },
  { f: T.cmp, tag: "วิธีไม่ตรงกัน", head: "ไทย กับ เวียดนาม เล่าคนละแบบ", sure: "mid" },
  { f: T.tl, tag: "พงศาวดารไทย", head: "ชำระในสมัยหลัง", chips: [{ text: "ทุกฉบับอยู่หลัง 2325", f: T.w3 }] },
  { f: T.four, tag: "แต่มีเรื่องหนึ่ง", head: "ที่ทุกฝ่ายตรงกัน" },
  { f: T.match, tag: "4 ฝ่ายตรงกัน", head: "สิ้นพระชนม์ ต้น เม.ย. 2325", sure: "high" },
  { f: T.q, tag: "ท้ายข่าว", head: "อ่านหลักฐานอย่างไรดี" },
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

export const Demo = () => (
  <AbsoluteFill>
    <Audio />
    <NewsPage title="ข่าวหลักฐาน" kicker="N09 · การ์ดหลักฐาน" dateline="ฉบับพิเศษ · เมษายน ๒๓๒๕">
      <Headline heads={HEADS} from={0} to={T.end} />
      <Calendar start={T.cal} end={T.cmp + 4} title="ปฏิทิน เมษายน พ.ศ. 2325" first={1} marks={[[6, T.d6], [7, T.d7], [10, T.d10]]} />
      <Compare
        start={T.cmp}
        end={T.tl + 4}
        left={{ tag: "พงศาวดารไทย (ฉบับหลัง)", text: "ประหาร", f: T.thai, pic: "palace" }}
        right={{ tag: "พงศาวดารเวียดนาม", text: "ถุงกำมะหยี่\nท่อนจันทน์", f: T.viet, pic: "boat" }}
        note={{ text: "เล่าต่างกัน!", f: T.stamp }}
      />
      <Timeline
        start={T.tl}
        end={T.four + 4}
        title="พงศาวดารไทย เขียน/ชำระเมื่อไหร่"
        from={2318}
        to={2420}
        marks={[
          { at: 2325, top: "2325", bottom: "เหตุการณ์", f: T.tl + 8, big: true },
          { at: 2346, top: "2338", bottom: "ฉบับ 2338", f: T.w1 },
          { at: 2400, top: "สมัยหลัง", bottom: "ฉบับพระราช\nหัตถเลขา", f: T.w2 },
        ]}
        zone={{ from: 2329, text: "ชำระในสมัยราชวงศ์ใหม่", f: T.w3 }}
      />
      <FourSources
        start={T.four}
        end={T.q - 4}
        checks={T.c}
        sources={[["ไทย", "พงศาวดาร", "palace"], ["จีน", "บันทึกราชวงศ์ชิง", "letter"], ["เวียดนาม", "พงศาวดารเวียดนาม", "boat"], ["ฝรั่งเศส", "จดหมายบาทหลวง", "letter"]]}
        bottom={{ text: "สิ้นพระชนม์ ต้น เม.ย. 2325", f: T.match }}
      />
      <ThreeQuestions start={T.q} end={T.end} fs={[T.q + 6, T.q + 18, T.q + 30]} />
      <Subtitle lines={LINES} />
    </NewsPage>
  </AbsoluteFill>
);
