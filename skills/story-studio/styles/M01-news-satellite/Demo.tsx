import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { LOOKS, Person, type Look } from "../../components/Figures";
import { Street } from "../../components/Inset";
import { MapFrame } from "../../components/Map";
import { CoastSkyline, InfoChip, LaunchTower, MarsPhobos, RockiesSkyline, Rocket, Smoke, VoteBars } from "../../components/Props";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BG, clamp, DayGlobe, font, Highlight, HookTitle, Kicker, Lens, MapCredit, Masthead, NAVY, newsCam, Pin, ramp, StoryCard, TEAL, Ticker, type Story } from "./kit/Morning";

// M01 morning world bulletin: a two-story world-news sample on a sunlit globe. The globe turns under a navy hook
// title on a pale morning sky, then flies to each country (teal wash, navy hairline); a frosted white card wipes in
// with a big teal stat, a pin raises its flag tag, and a round "lens" illustration (ภาพประกอบ) opens on a
// hairline from the pin. A white ticker runs along the lower third. 15 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M01", name: "ข่าวโลกยามเช้า", frames: 450, cover: 222, sizes: ["9x16", "16x9"] };

const TANEGASHIMA: [number, number] = [130.9752, 30.4007];
const ALBERTA: [number, number] = [-113.4938, 53.5461];

const STORIES: Story[] = [
  { id: "japan", country: "392", name: "ญี่ปุ่น", tag: "อวกาศ", stat: "3 ปี", statLabel: "กว่าตัวอย่างจะกลับโลก", headline: "ยิงจรวดส่งยานสำรวจดวงจันทร์ของดาวอังคาร", sources: "ตัวอย่างสไตล์ · ไม่ใช่ข่าวจริง", focus: [133, 33], zoom: 5, start: 70, end: 255 },
  { id: "canada", country: "124", name: "แคนาดา", tag: "ประชามติ", stat: "76%", statLabel: "เลือกอยู่กับแคนาดา", headline: "อัลเบอร์ตาลงคะแนน ไม่แยกตัว", sources: "ตัวอย่างสไตล์ · ไม่ใช่ข่าวจริง", focus: [-112, 54], zoom: 3.2, start: 255, end: 440 },
];
const PINS = [
  { at: TANEGASHIMA, label: "ทาเนกาชิมะ" },
  { at: ALBERTA, label: "อัลเบอร์ตา" },
];
const LINES = [
  { text: "อรุณสวัสดิ์ สองข่าวใหญ่ทั่วโลก เช้านี้", start: 12, len: 54 },
  { text: "ญี่ปุ่นยิงจรวด ส่งยานไปดวงจันทร์โฟบอส ของดาวอังคาร", start: 76, len: 170 },
  { text: "แคนาดา ชาวอัลเบอร์ตาราวสามในสี่ เลือกอยู่กับแคนาดาต่อ", start: 262, len: 170 },
];
const TICKER = ["ตัวอย่างสไตล์ ไม่ใช่ข่าวจริง", "ญี่ปุ่น · ยานสำรวจโฟบอสออกเดินทาง", "แคนาดา · อัลเบอร์ตาเลือกอยู่ต่อ", "พยากรณ์อากาศ · ท้องฟ้าแจ่มใส"];

const JapanLens = ({ st }: { st: Story }) => {
  const ignite = 140;
  const phobos = 178;
  const chip = 198;
  return (
    <Lens id="japan" anchor={TANEGASHIMA} label="ทาเนกาชิมะ · ภาพประกอบ" start={st.start + 34} end={st.end} sky={["#8ec5ea", "#f3f8fb"]}>
      {(g) => {
        const burn = ramp(g.frame, ignite, ignite + 8);
        const lift = interpolate(g.frame, [ignite + 12, st.end], [0, 1], clamp) ** 2 * 200 * g.s;
        const rx = g.cx + 20 * g.s;
        return (
          <>
            <CoastSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={{ ...g, H: g.H * 2 }} color="#a9b1b6" kerb="#c4cace" marks={false} />
            <LaunchTower x={rx} y={g.ground + 4 * g.s} scale={g.sc} />
            <Rocket x={rx} y={g.ground - 4 * g.s} scale={g.sc} lift={lift} burn={burn} />
            {burn > 0 && [-1, 0, 1].map((i) => <Smoke key={i} x={rx + i * 50 * g.s} y={g.ground - 4 * g.s} size={36 * g.s} seed={70 + i} wind={i * 0.5} k={burn} />)}
            {g.frame >= phobos && <MarsPhobos x={g.cx - 150 * g.s} y={g.y + 60 * g.s} scale={g.sc * 1.0} p={ramp(g.frame, phobos, phobos + 12)} />}
            {g.frame >= chip && <InfoChip x={g.cx + 40 * g.s} y={g.y + 70 * g.s} scale={g.sc * 0.8} label="ตัวอย่างกลับถึงโลก" value="อีก 3 ปี" font={font} color={TEAL} />}
          </>
        );
      }}
    </Lens>
  );
};

const VOTERS: { look: Look; hat: "beanie" | "cap" | "none" }[] = [
  { look: LOOKS[3], hat: "beanie" },
  { look: LOOKS[0], hat: "none" },
  { look: LOOKS[5], hat: "cap" },
];
const CanadaLens = ({ st }: { st: Story }) => {
  const share = 330;
  return (
    <Lens id="alberta" anchor={ALBERTA} label="อัลเบอร์ตา · ภาพประกอบ" start={st.start + 34} end={st.end} sky={["#a3d2ef", "#f5f9fb"]}>
      {(g) => {
        const hall = g.cx + 110 * g.s;
        return (
          <>
            <RockiesSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={{ ...g, H: g.H * 2 }} color="#9da3a0" kerb="#c0c5c1" marks={false} />
            <rect x={hall - 90 * g.s} y={g.ground - 120 * g.s} width={180 * g.s} height={110 * g.s} fill="#d9e4ea" stroke={NAVY} strokeWidth={1.4 * g.s} />
            <path d={`M${hall - 100 * g.s} ${g.ground - 120 * g.s} L${hall} ${g.ground - 165 * g.s} L${hall + 100 * g.s} ${g.ground - 120 * g.s} Z`} fill="#5f7a96" />
            <rect x={hall - 22 * g.s} y={g.ground - 64 * g.s} width={44 * g.s} height={54 * g.s} fill={NAVY} />
            <rect x={hall - 70 * g.s} y={g.ground - 108 * g.s} width={140 * g.s} height={30 * g.s} fill="#fff" stroke={NAVY} strokeWidth={1 * g.s} />
            <text x={hall} y={g.ground - 87 * g.s} textAnchor="middle" fontSize={19 * g.s} fontWeight={700} fill="#d52b1e" fontFamily={font}>หน่วยเลือกตั้ง</text>
            {VOTERS.map((v, i) => (
              <Person key={i} x={g.cx - 230 * g.s + i * 66 * g.s + ramp(g.frame, st.start + 34, st.end, Easing.linear) * 50 * g.s} y={g.ground + 14 * g.s} scale={g.sc} look={v.look} hat={v.hat} outfit="coat" pose="walk" phase={i * 1.2} />
            ))}
            {g.frame >= share && (
              <VoteBars x={g.cx - 200 * g.s} y={g.y + 40 * g.s} scale={g.sc * 0.8} font={font} k={ramp(g.frame, share, share + 25)} items={[{ label: "อยู่กับแคนาดา", value: 76, color: TEAL }, { label: "แยกตัว", value: 24, color: "#9aa3ad" }]} />
            )}
          </>
        );
      }}
    </Lens>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const cam = camAt(newsCam(STORIES, width, height, [100, 20, 125, 28]), frame);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.swell} at={10} volume={0.3} />
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={st.start - 10} volume={0.22} />)}
      {STORIES.map((st) => <Sfx key={`p${st.id}`} src={SFX.tick} at={st.start + 34} volume={0.3} />)}
      <Hit id="thunder_rumble" at={140} volume={0.22} />
      <Bed id="city_crowd" from={290} to={450} volume={0.1} />
      <MapFrame cam={cam} focusY={vertical ? 0.5 : 0.5}>
        <DayGlobe />
        {STORIES.map((st) => <Highlight key={st.id} id={st.country} opacity={interpolate(frame, [st.start + 20, st.start + 34, st.end - 6, st.end + 6], [0, 1, 1, 0], clamp)} />)}
        <JapanLens st={STORIES[0]} />
        <CanadaLens st={STORIES[1]} />
        {STORIES.map((st, i) => (frame >= st.start && frame < st.end ? <Pin key={st.id} at={PINS[i].at} text={PINS[i].label} start={st.start + 34} /> : null))}
      </MapFrame>
      <Masthead title="ข่าวโลกยามเช้า" date="ฉบับตัวอย่าง · วันจันทร์" clock="07:30" stories={STORIES} />
      <HookTitle title="2 ข่าวใหญ่ทั่วโลก" sub="เช้านี้ บนแผนที่ดาวเทียม · 15 วินาที" from={6} to={66} />
      {STORIES.map((st, i) => <StoryCard key={st.id} story={st} index={i} count={STORIES.length} />)}
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={font} color={NAVY} stroke="#ffffff" top={0.745} />)}
      <Ticker label="เช้านี้" items={TICKER} from={20} />
      <MapCredit />
      <Kicker text="M01 · ข่าวโลกยามเช้า" />
    </AbsoluteFill>
  );
};
