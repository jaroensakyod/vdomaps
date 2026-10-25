import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { LOOKS, Person, type Look } from "../../components/Figures";
import { InsetPanel, Street } from "../../components/Inset";
import { PointLabel } from "../../components/Labels";
import { MapFrame, Sphere } from "../../components/Map";
import { CoastSkyline, InfoChip, LaunchTower, MarsPhobos, RockiesSkyline, Rocket, Smoke, VoteBars } from "../../components/Props";
import { Raster } from "../../components/Raster";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { style } from "../../components/style";
import type { StyleDemo } from "../types";
import { BG, Borders, clamp, Highlight, HookTitle, MapCredit, newsCam, RED, StoryCard, TopBar, type Story } from "./kit/News";

// M01 satellite news map: a two-story world-news sample. The Blue Marble globe spins under a hook title, flies to
// each country (red wash + glow), a dark news card slides in with a big stat, a pulsing pin lands, and an
// illustration panel ("ภาพประกอบ") hangs off the pin on a dashed red leader line. 15 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M01", name: "ข่าวแผนที่ดาวเทียม", frames: 450, cover: 215, sizes: ["9x16", "16x9"] };

const F = style.font;
const TANEGASHIMA: [number, number] = [130.9752, 30.4007];
const ALBERTA: [number, number] = [-113.4938, 53.5461];
const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

const STORIES: Story[] = [
  { id: "japan", country: "392", name: "ญี่ปุ่น", tag: "อวกาศ", stat: "3 ปี", statLabel: "กว่าตัวอย่างจะกลับโลก", headline: "ยิงจรวดส่งยานสำรวจดวงจันทร์ของดาวอังคาร", sources: "ตัวอย่างสไตล์ · ไม่ใช่ข่าวจริง", focus: [133, 33], zoom: 5, start: 70, end: 255 },
  { id: "canada", country: "124", name: "แคนาดา", tag: "ประชามติ", stat: "76%", statLabel: "เลือกอยู่กับแคนาดา", headline: "อัลเบอร์ตาลงคะแนน ไม่แยกตัว", sources: "ตัวอย่างสไตล์ · ไม่ใช่ข่าวจริง", focus: [-112, 54], zoom: 3.2, start: 255, end: 440 },
];
const PINS = [
  { at: TANEGASHIMA, label: "ทาเนกาชิมะ" },
  { at: ALBERTA, label: "อัลเบอร์ตา" },
];
const LINES = [
  { text: "สองข่าวใหญ่ทั่วโลก บนแผนที่", start: 12, len: 54 },
  { text: "ญี่ปุ่นยิงจรวด ส่งยานไปดวงจันทร์โฟบอส ของดาวอังคาร", start: 76, len: 170 },
  { text: "แคนาดา ชาวอัลเบอร์ตาราวสามในสี่ เลือกอยู่กับแคนาดาต่อ", start: 262, len: 170 },
];

// Japan: launch pad on the coast, ignition, lift-off, Mars + Phobos, info chip.
const JapanPanel = ({ st }: { st: Story }) => {
  const ignite = 140;
  const phobos = 178;
  const chip = 198;
  return (
    <InsetPanel id="japan" anchor={TANEGASHIMA} label="ทาเนกาชิมะ · ภาพประกอบ" start={st.start + 34} end={st.end} sky={["#4a7fb5", "#d8ecf7"]} font={F}>
      {(g) => {
        const burn = ramp(g.frame, ignite, ignite + 8);
        const lift = interpolate(g.frame, [ignite + 12, st.end], [0, 1], clamp) ** 2 * 260 * g.s;
        const rx = g.cx + 40 * g.s;
        return (
          <>
            <CoastSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#8a8a86" kerb="#a0a09b" marks={false} />
            <LaunchTower x={rx} y={g.ground + 4 * g.s} scale={g.sc} />
            <Rocket x={rx} y={g.ground - 4 * g.s} scale={g.sc} lift={lift} burn={burn} />
            {burn > 0 && [-1, 0, 1].map((i) => <Smoke key={i} x={rx + i * 50 * g.s} y={g.ground - 4 * g.s} size={36 * g.s} seed={70 + i} wind={i * 0.5} k={burn} />)}
            {g.frame >= phobos && <MarsPhobos x={g.x + 110 * g.s} y={g.y + 120 * g.s} scale={g.sc * 1.1} p={ramp(g.frame, phobos, phobos + 12)} />}
            {g.frame >= chip && <InfoChip x={g.x + g.W - 210 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.85} label="ตัวอย่างกลับถึงโลก" value="อีก 3 ปี" font={F} color="#4ea8de" />}
          </>
        );
      }}
    </InsetPanel>
  );
};

// Canada: voters in coats walking to a small polling hall, then the vote bars.
const VOTERS: { look: Look; hat: "beanie" | "cap" | "none" }[] = [
  { look: LOOKS[3], hat: "beanie" },
  { look: LOOKS[0], hat: "none" },
  { look: LOOKS[5], hat: "cap" },
  { look: LOOKS[2], hat: "beanie" },
];
const CanadaPanel = ({ st }: { st: Story }) => {
  const share = 330;
  return (
    <InsetPanel id="alberta" anchor={ALBERTA} label="อัลเบอร์ตา · ภาพประกอบ" start={st.start + 34} end={st.end} sky={["#5fa8d3", "#e3f1f9"]} font={F}>
      {(g) => {
        const hall = g.cx + 150 * g.s;
        return (
          <>
            <RockiesSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#7d7f7a" kerb="#9b9d97" marks={false} />
            <rect x={hall - 90 * g.s} y={g.ground - 120 * g.s} width={180 * g.s} height={110 * g.s} fill="#b5654b" stroke="#5a2e22" strokeWidth={1.6 * g.s} />
            <path d={`M${hall - 100 * g.s} ${g.ground - 120 * g.s} L${hall} ${g.ground - 165 * g.s} L${hall + 100 * g.s} ${g.ground - 120 * g.s} Z`} fill="#4b4b4b" />
            <rect x={hall - 22 * g.s} y={g.ground - 64 * g.s} width={44 * g.s} height={54 * g.s} fill="#3a2a20" />
            <rect x={hall - 70 * g.s} y={g.ground - 108 * g.s} width={140 * g.s} height={30 * g.s} rx={4 * g.s} fill="#fff" stroke="#5a2e22" strokeWidth={1.2 * g.s} />
            <text x={hall} y={g.ground - 87 * g.s} textAnchor="middle" fontSize={20 * g.s} fontWeight={900} fill="#d52b1e" fontFamily={F}>หน่วยเลือกตั้ง</text>
            {VOTERS.map((v, i) => (
              <Person key={i} x={g.cx - 320 * g.s + i * 72 * g.s + ramp(g.frame, st.start + 34, st.end, Easing.linear) * 60 * g.s} y={g.ground + 14 * g.s} scale={g.sc} look={v.look} hat={v.hat} outfit="coat" pose="walk" phase={i * 1.2} />
            ))}
            {g.frame >= share && (
              <VoteBars x={g.x + 30 * g.s} y={g.y + 90 * g.s} scale={g.sc * 0.9} font={F} k={ramp(g.frame, share, share + 25)} items={[{ label: "อยู่กับแคนาดา", value: 76, color: "#d52b1e" }, { label: "แยกตัว", value: 24, color: "#9aa3ad" }]} />
            )}
          </>
        );
      }}
    </InsetPanel>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  const cam = camAt(newsCam(STORIES, width, height, [100, 20, 125, 28]), frame);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.swell} at={10} volume={0.35} />
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={st.start - 10} volume={0.3} />)}
      {STORIES.map((st) => <Sfx key={`p${st.id}`} src={SFX.pop} at={st.start + 34} volume={0.35} />)}
      <Hit id="thunder_rumble" at={140} volume={0.3} />
      <Bed id="city_crowd" from={290} to={450} volume={0.12} />
      <MapFrame cam={cam}>
        <Sphere />
        <Raster layers={[{ name: "world", opacity: 0.85 }]} />
        <Borders />
        {STORIES.map((st) => <Highlight key={st.id} id={st.country} opacity={interpolate(frame, [st.start + 20, st.start + 34, st.end - 6, st.end + 6], [0, 1, 1, 0], clamp)} />)}
        {STORIES.map((st, i) => (frame >= st.start && frame < st.end ? <PointLabel key={st.id} at={PINS[i].at} text={PINS[i].label} start={st.start + 34} color={RED} size={0.9} /> : null))}
        <JapanPanel st={STORIES[0]} />
        <CanadaPanel st={STORIES[1]} />
      </MapFrame>
      <TopBar title="แผนที่ข่าวโลก" date="ฉบับตัวอย่าง" stories={STORIES} />
      <HookTitle title="2 ข่าวใหญ่ทั่วโลก" sub="บนแผนที่ดาวเทียม · ใน 15 วินาที" from={6} to={66} />
      {STORIES.map((st, i) => <StoryCard key={st.id} story={st} index={i} count={STORIES.length} />)}
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={F} />)}
      <MapCredit />
      <div style={{ position: "absolute", ...(vertical ? { top: 22, left: 0, right: 0, textAlign: "center" as const } : { bottom: 14, left: 24 }), fontFamily: F, fontSize: 30 * s, fontWeight: 700, color: "#fff", opacity: 0.8 }}>M01 · ข่าวแผนที่ดาวเทียม</div>
    </AbsoluteFill>
  );
};
