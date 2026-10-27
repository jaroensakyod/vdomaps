import { loadFont } from "@remotion/google-fonts/Kanit";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Caption } from "../../../components/Caption";
import { FlyingWords, WORDS_NEWS } from "../../../components/shots/FlyingWords";
import { TIMELINE_NEWS, TimelineTravel, type TimelineEvent } from "../../../components/shots/TimelineTravel";
import { Bed, Hit, SFX, Sfx, voiceSpans } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ~21-second test of two shots adapted from video-shotcraft for ประวัติศาสตร์บนแผนที่ (9:16, Thai):
// FlyingWords as the hook (frame 0: "417 ปี จบลงในคืนเดียว" with Ayutthaya words flying past), then TimelineTravel
// through the four turning points of Ayutthaya, each card landing on its spoken year.
const font = loadFont("normal", { weights: ["300", "400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const LAYOUT = { lead: 3, gap: 10 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const HIST_SHOTS_FRAMES = totalFrames(BEATS, LAYOUT);
const END = HIST_SHOTS_FRAMES;
// Whisper put the last words of these beats on the clip's final frame; time their captions by length instead.
const BAD_WORDS = new Set(["fall1", "fall2"]);

const SWITCH = B.found.start - 12; // timeline fades in over the tunnel (14-frame overlap, no blink)
const CUES = [wf("found", "พอศอ"), wf("fall1", "พอศอ"), wf("free", "พระ"), wf("fall2", "พอศอ")];
const TRAVEL = 24;
const EVENTS: TimelineEvent[] = [
  { year: "พ.ศ. 1893", far: "1893", title: "สถาปนากรุงศรีอยุธยา", desc: "พระเจ้าอู่ทอง (สมเด็จพระรามาธิบดีที่ 1) ตั้งราชธานีบนเกาะกลางแม่น้ำ", stat: "เริ่มต้น 417 ปี" },
  { year: "พ.ศ. 2112", far: "2112", title: "เสียกรุงครั้งที่ 1", desc: "ตกเป็นประเทศราชของพม่า สมัยพระเจ้าบุเรงนอง", stat: "15 ปีใต้อำนาจพม่า" },
  { year: "พ.ศ. 2127", far: "2127", title: "ประกาศอิสรภาพ", desc: "สมเด็จพระนเรศวรประกาศอิสรภาพที่เมืองแครง", stat: "กู้เอกราชคืน" },
  { year: "พ.ศ. 2310", far: "2310", title: "เสียกรุงครั้งที่ 2", desc: "กรุงแตก 7 เมษายน หลังถูกล้อมราว 14 เดือน", stat: "สิ้นสุด 417 ปี" },
];
const WORDS = ["กรุงศรีอยุธยา", "33 กษัตริย์", "ช้างศึก", "ปืนใหญ่", "กำแพงเมือง", "พม่า", "ทองคำ", "เมืองท่า", "ฮอลันดา", "โปรตุเกส", "ญี่ปุ่น", "ป้อมเพชร", "แม่น้ำเจ้าพระยา", "เสียกรุง", "ราชธานี", "วัดไชยวัฒนาราม", "การค้า", "ค่ายโพธิ์สามต้น", "พระนเรศวร", "417 ปี"];

export const HistShotsTest = () => {
  const f = useCurrentFrame();
  const voice = voiceSpans(BEATS);
  const tl = interpolate(f, [SWITCH, SWITCH + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#05080f" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {/* UI moments: synthetic */}
      <Sfx src={SFX.hit} at={0} volume={0.55} />
      <Sfx src={SFX.swell} at={SWITCH} volume={0.3} />
      {CUES.slice(1).map((c) => <Sfx key={c} src={SFX.whoosh} at={c - TRAVEL - 4} volume={0.35} />)}
      {CUES.map((c) => <Sfx key={c} src={SFX.pop} at={c - 4} volume={0.3} />)}
      {/* story sounds: house library */}
      <Hit id="gong" at={1} volume={0.5} />
      <Bed id="war_drums" from={0} to={END} volume={0.16} voice={voice} />
      <Hit id="cannon_far" at={CUES[1] + 2} volume={0.4} />
      <Hit id="war_horn_drums" at={CUES[2]} volume={0.35} />
      <Hit id="explosion_far" at={CUES[3] + 2} volume={0.45} />
      <Bed id="fire_crackle" from={CUES[3]} to={END} volume={0.25} voice={voice} />

      {f < SWITCH + 14 && <FlyingWords words={WORDS} accents={[0, 5, 13, 19]} title={"417 ปี\nจบลงในคืนเดียว"} kicker="กรุงศรีอยุธยา" look={{ ...WORDS_NEWS, font }} />}
      {f >= SWITCH && (
        <AbsoluteFill style={{ opacity: tl }}>
          <TimelineTravel events={EVENTS} cues={CUES} look={{ ...TIMELINE_NEWS, font }} kicker="ประวัติศาสตร์บนแผนที่" heading="4 จุดเปลี่ยน กรุงศรีฯ" travel={TRAVEL} from={SWITCH} />
        </AbsoluteFill>
      )}
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={BAD_WORDS.has(b.id) ? undefined : b.words} start={b.start} len={b.len} font={font} top={0.83} />
      ))}
    </AbsoluteFill>
  );
};
