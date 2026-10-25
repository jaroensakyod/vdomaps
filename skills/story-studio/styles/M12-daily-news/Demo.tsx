import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { LOOKS, Person } from "../../components/Figures";
import { Street, type InsetGeom } from "../../components/Inset";
import { PointLabel } from "../../components/Labels";
import { MapFrame, Sphere } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Car, Helicopter, Hemicycle, Lectern, Palm, Rain, RescueBoat, Waves } from "./kit/Art";
import {
  BG, BLUE, Borders, CAPTION_TOP, chain, Chip, clamp, dailyCam, FloodLayer, font, GOLD, GREEN, HeadCard, Highlight, HookTitle, O, Outro, Panel,
  PanelLine, RED, StormTrack, StoryDots, TopBar, ramp, type Head, type LL, type Story,
} from "./kit/Daily";

// M12 daily news: the 60-second world-news short, cut down to 20 s with 3 sample stories. Shock line at frame 0,
// intro card with the headline count + a dot per story on the spinning globe, then story after story: one head card
// whose text swaps per shot, a fixed-slot "ภาพประกอบ" panel low on screen, captions under it, date stamp on top.
export const demo: StyleDemo = { id: "M12", name: "ข่าวต่างประเทศรายวัน", frames: 600, cover: 248, sizes: ["9x16"] };

const EDITION = { title: "แผนที่ข่าวโลก", date: "จันทร์ 1 ม.ค. · ตัวอย่าง" };
const HOOK_END = 60;
const INTRO = { start: 60, end: 128 };
const PL = { taipei: [121.565, 25.033] as LL, ishigaki: [124.156, 24.344] as LL, valencia: [-0.3763, 39.4699] as LL, oliva: [-0.1197, 38.9196] as LL, bucharest: [26.1025, 44.4268] as LL };
const TRACK: LL[] = [[131, 18.5], [127.5, 21.5], [124.6, 24.2], [125.5, 27], [128, 29.5]];
const STORIES: Story[] = [
  { id: "storm", ids: ["158", "392"], focus: [126, 24], zoom: 3.6, start: 128, end: 290, pin: { at: PL.ishigaki, label: "ซากิชิมะ", f: 214 } },
  { id: "spain", ids: ["724"], focus: [-1.5, 39.5], zoom: 6, start: 290, end: 450, pin: { at: PL.valencia, label: "บาเลนเซีย", f: 318 } },
  { id: "romania", ids: ["642"], focus: [25, 45.8], zoom: 7, start: 450, end: 570, pin: { at: PL.bucharest, label: "บูคาเรสต์", f: 476 } },
];
const [ST, ES, RO] = STORIES;
const CUE = { wind: 150, track: 210, rain: 312, rescue: 372, pm: 470, vote: 506 };

const HEADS: Record<string, Head[]> = {
  intro: [{ f: INTRO.start + 4, tag: EDITION.date, head: "3 ข่าวใหญ่ใน 24 ชั่วโมง", stat: "60", label: "วินาที" }],
  storm: [
    { f: ST.start + 6, tag: "1/3 · ไต้หวัน · ญี่ปุ่น", head: "ซูเปอร์ไต้ฝุ่นเข้าใกล้", stat: "~198", label: "กม./ชม.", color: GOLD },
    { f: CUE.track, tag: "1/3 · ไต้หวัน · ญี่ปุ่น", head: "คาดผ่านหมู่เกาะซากิชิมะ", stat: "2 วัน", label: "ข้างหน้า", color: GOLD },
  ],
  spain: [
    { f: ES.start + 6, tag: "2/3 · สเปน", head: "ฝนถล่มฝั่งตะวันออก", stat: "40 ปี", label: "หนักสุดในรอบ" },
    { f: CUE.rescue, tag: "2/3 · สเปน", head: "กู้ภัยช่วยคนติดน้ำท่วม", stat: (f) => `${Math.round(interpolate(f, [CUE.rescue, CUE.rescue + 30], [0, 450], clamp))}+`, label: "คน", color: GREEN },
  ],
  romania: [
    { f: RO.start + 6, tag: "3/3 · โรมาเนีย", head: "ได้นายกฯ คนใหม่", color: BLUE },
    { f: CUE.vote, tag: "3/3 · โรมาเนีย", head: "สภารับรองท่วมท้น", stat: "280–58", label: "เสียง", color: BLUE },
  ],
};
const LINES = [
  { text: "แผนที่ข่าวโลก วันนี้ สามเรื่อง ในหกสิบวินาที", start: INTRO.start, len: 66 },
  { text: "ไต้หวันและญี่ปุ่น เตรียมรับซูเปอร์ไต้ฝุ่น ลมเกือบ 200 กม./ชม. คาดผ่านหมู่เกาะซากิชิมะ", start: ST.start, len: 156 },
  { text: "สเปน ฝนถล่มหนักสุดในรอบ 40 ปี กู้ภัยช่วยคนได้กว่า 450 คน", start: ES.start, len: 154 },
  { text: "โรมาเนีย สภารับรองนายกฯ คนใหม่ ด้วยเสียง 280 ต่อ 58", start: RO.start, len: 114 },
];

const WindPanel = ({ id, start, end, cue }: { id: string; start: number; end: number; cue: number }) => (
  <Panel id={id} anchor={PL.taipei} start={start} end={end} sky={["#2f3e4e", "#6c7f8f"]}>
    {(g) => {
      const w = 0.3 + 0.7 * ramp(g.frame, cue, cue + 30);
      return (
        <>
          <Waves g={g} level={g.ground - 20 * g.s} frame={g.frame} amp={6 + 10 * w} />
          {[0.15, 0.35, 0.62, 0.85].map((fx, i) => <Palm key={i} x={g.x + g.W * fx} y={g.ground - 10 * g.s} scale={g.sc * (0.95 + (i % 2) * 0.15)} wind={w} frame={g.frame} seed={i} />)}
          <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#c2b280" />
          <Rain g={g} k={w} frame={g.frame} slant={0.6 * w} />
          {g.frame > cue && <Chip g={g} label="ลมใกล้ศูนย์กลาง" value="~198 กม./ชม." color={GOLD} />}
        </>
      );
    }}
  </Panel>
);

const Town = ({ g }: { g: InsetGeom }) => (
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={g.x + i * (g.W / 6) + 6 * g.s} y={g.ground - (150 + (i % 3) * 30) * g.s} width={g.W / 6 - 12 * g.s} height={(150 + (i % 3) * 30) * g.s} fill={["#e9c46a", "#f4a261", "#e5d3b3", "#d4a373"][i % 4]} stroke="#1b1d24" strokeWidth={1.4 * g.s} />
        {[0, 1].map((r) => <rect key={r} x={g.x + i * (g.W / 6) + 40 * g.s} y={g.ground - (130 - r * 50) * g.s} width={28 * g.s} height={30 * g.s} fill="#5b6b7a" />)}
      </g>
    ))}
  </>
);

const Panels = () => {
  const [ta, tb] = chain([ST.start + 20, CUE.track], ST.end);
  const [ea, eb] = chain([ES.start + 20, CUE.rescue], ES.end);
  const [ra, rb] = chain([RO.start + 20, CUE.vote], RO.end);
  return (
    <>
      <WindPanel id="hook" start={-12} end={HOOK_END + O} cue={0} />
      <WindPanel id="ty-wind" start={ta[0]} end={ta[1]} cue={CUE.wind} />
      <Panel id="ty-isle" anchor={PL.ishigaki} start={tb[0]} end={tb[1]} sky={["#394b59", "#8796a3"]} accent={GOLD}>
        {(g) => (
          <>
            <Waves g={g} level={g.ground - 30 * g.s} frame={g.frame} amp={12} />
            <path d={`M${g.x + 120 * g.s} ${g.ground - 28 * g.s} Q${g.cx} ${g.ground - 170 * g.s} ${g.x + g.W - 160 * g.s} ${g.ground - 28 * g.s} Z`} fill="#4f7a43" stroke="#1b1d24" strokeWidth={1.6 * g.s} />
            <line x1={g.cx + 60 * g.s} y1={g.ground - 120 * g.s} x2={g.cx + 60 * g.s} y2={g.ground - 250 * g.s} stroke="#ddd" strokeWidth={4 * g.s} />
            <path d={`M${g.cx + 62 * g.s} ${g.ground - 250 * g.s} l${60 * g.s + Math.sin(g.frame * 0.5) * 6 * g.s} ${14 * g.s} l${-60 * g.s} ${14 * g.s} Z`} fill={RED} />
            <Rain g={g} k={1} frame={g.frame} slant={0.5} />
            <Chip g={g} label="คาดผ่านหมู่เกาะซากิชิมะ" value="อีก 2 วัน" color={GOLD} />
          </>
        )}
      </Panel>
      <Panel id="es-flood" anchor={PL.oliva} start={ea[0]} end={ea[1]} sky={["#3c4a57", "#7d8b96"]}>
        {(g) => {
          const lvl = ramp(g.frame, CUE.rain, CUE.rain + 90, Easing.out(Easing.quad));
          return (
            <>
              <Town g={g} />
              <Street g={g} />
              <Car x={g.x + 220 * g.s} y={g.ground + 40 * g.s} scale={g.sc} color="#c0392b" />
              <Car x={g.x + 640 * g.s} y={g.ground + 40 * g.s} scale={g.sc} color="#f1faee" />
              <Waves g={g} level={g.ground + 30 * g.s - lvl * 110 * g.s} frame={g.frame} color="#7a6a4f" amp={5} />
              <Rain g={g} k={1} frame={g.frame} slant={0.2} n={90} />
              {g.frame > CUE.rain + 20 && <Chip g={g} label="กรมอุตุฯ" value="หนักสุดในรอบ ~40 ปี" />}
            </>
          );
        }}
      </Panel>
      <Panel id="es-rescue" anchor={PL.valencia} start={eb[0]} end={eb[1]} sky={["#4b5d6b", "#9aa8b3"]}>
        {(g) => (
          <>
            <Town g={g} />
            <Waves g={g} level={g.ground - 70 * g.s} frame={g.frame} color="#7a6a4f" amp={5} />
            <RescueBoat x={g.x + g.W * (0.2 + 0.25 * ramp(g.frame, eb[0], eb[1], Easing.linear))} y={g.ground - 66 * g.s} scale={g.sc} />
            <Helicopter x={g.x + g.W * (0.85 - 0.15 * ramp(g.frame, eb[0], eb[1], Easing.linear))} y={g.y + 190 * g.s} scale={g.sc * 1.1} frame={g.frame} />
            <Chip g={g} label="ได้รับการช่วยเหลือ" value="450+ คน" color={GREEN} />
          </>
        )}
      </Panel>
      <Panel id="ro-pm" anchor={PL.bucharest} start={ra[0]} end={ra[1]} sky={["#1d3557", "#457b9d"]}>
        {(g) => (
          <>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a22" />
            {(["#002b7f", "#fcd116", "#ce1126"] as const).map((c, i) => <rect key={c} x={g.x + g.W * 0.7 + i * 40 * g.s} y={g.y + 70 * g.s} width={40 * g.s} height={110 * g.s} fill={c} />)}
            <Person x={g.x + g.W * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 1.1} look={LOOKS[0]} outfit="suit" pose="wave" />
            <Lectern x={g.x + g.W * 0.4} y={g.ground} scale={g.sc} color="#2f3e46" />
            <PanelLine g={g} text="นายกฯ คนใหม่ แถลงต่อสภา" />
          </>
        )}
      </Panel>
      <Panel id="ro-vote" anchor={PL.bucharest} start={rb[0]} end={rb[1]} sky={["#2b2d42", "#4a4e69"]}>
        {(g) => {
          const k = ramp(g.frame, CUE.vote, CUE.vote + 45, Easing.out(Easing.quad));
          return (
            <>
              <Hemicycle x={g.cx} y={g.ground - 10 * g.s} r={250 * g.s} s={g.s} yes={280} no={58} k={k} />
              <text x={g.cx} y={g.ground - 30 * g.s} textAnchor="middle" fontSize={54 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{Math.round(280 * k)} : {Math.round(58 * k)}</text>
            </>
          );
        }}
      </Panel>
    </>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const cam = camAt(dailyCam(STORIES, width, height, { focus: [123.5, 24.5], zoom: 5, to: HOOK_END }, { at: INTRO.start, to: INTRO.end, lon: [120, 100] }, demo.frames), frame);
  const active = STORIES.find((st) => frame >= st.start - 4 && frame < st.end);
  const panelStarts = [ST.start + 20, CUE.track, ES.start + 20, CUE.rescue, RO.start + 20, CUE.vote];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sfx src={SFX.hit} at={0} volume={0.5} />
      <Sfx src={SFX.swell} at={INTRO.start} volume={0.3} />
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={st.start - 12} volume={0.3} />)}
      {panelStarts.map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.25} />)}
      <Sfx src={SFX.tick} at={CUE.vote} volume={0.3} />
      <Bed id="wind_storm" from={0} to={ST.end} volume={0.14} />
      <Bed id="rain_heavy" from={ES.start} to={CUE.rescue + 20} volume={0.14} />
      <Hit id="thunder_close" at={CUE.rain} volume={0.25} />
      <MapFrame cam={cam}>
        <Sphere />
        <Raster layers={[{ name: "world", opacity: 0.9 }]} />
        <Borders />
        {STORIES.map((st) => <Highlight key={st.id} ids={st.ids} opacity={interpolate(frame, [st.start + 14, st.start + 28, st.end - 6, st.end + 6], [0, 1, 1, 0], clamp)} />)}
        <Highlight ids={ST.ids} opacity={interpolate(frame, [HOOK_END, HOOK_END + 10], [1, 0], clamp)} />
        <FloodLayer at={[-0.25, 39.15]} radius={0.45} k={frame > ES.start && frame < ES.end ? ramp(frame, CUE.rain, CUE.rain + 50) : 0} />
        <StormTrack track={TRACK} from={0} to={HOOK_END} trackAt={0} />
        <StormTrack track={TRACK} from={ST.start + 10} to={ST.end} trackAt={CUE.track} />
        <StoryDots points={STORIES.map((st) => st.pin.at)} at={INTRO.start + 20} to={ST.start + 20} />
        {frame < HOOK_END + 10 && <PointLabel at={PL.ishigaki} text="ซากิชิมะ" start={6} color={RED} size={0.9} />}
        {active && <PointLabel key={active.id} at={active.pin.at} text={active.pin.label} start={Math.max(active.start + 26, active.pin.f)} color={RED} size={0.9} />}
        <Panels />
      </MapFrame>
      <TopBar title={EDITION.title} date={EDITION.date} stories={STORIES} from={INTRO.start - 4} />
      <HookTitle badge="ด่วน · ไต้หวัน · ญี่ปุ่น" line1="ซูเปอร์ไต้ฝุ่นเข้าใกล้" line2="ลมเกือบ 200 กม./ชม." to={HOOK_END} />
      {Object.entries(HEADS).map(([id, heads]) => <HeadCard key={id} heads={heads} from={heads[0].f} to={id === "intro" ? INTRO.end + 6 : STORIES.find((st) => st.id === id)!.end} />)}
      <Outro title={EDITION.title} from={RO.end} />
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={font} top={CAPTION_TOP} />)}
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 30 * s, fontWeight: 700, color: "#fff", opacity: 0.8 }}>M12 · ข่าวต่างประเทศรายวัน</div>
    </AbsoluteFill>
  );
};
