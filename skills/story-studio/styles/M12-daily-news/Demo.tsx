import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { LOOKS, Person } from "../../components/Figures";
import { Street, type InsetGeom } from "../../components/Inset";
import { MapFrame } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Car, Hemicycle, Helicopter, Lectern, Palm, Rain, RescueBoat, Waves } from "./kit/Art";
import {
  BLACK, BLUE, clamp, CREAM, dailyCam, DatePlate, FloodPaint, font, GREEN, Hanging, Kicker, num, paint, PaintedMap, PaintPin, ramp, RED, SceneSign, Sheet,
  StormTrack, TinDefs, YELLOW, type LL, type Story,
} from "./kit/Tin";

// M12 tin signboard news: the 60-second daily world-news short cut to 20 s with 3 sample stories, painted like a
// Thai hand-lettered tin sign. A red "ด่วน" sign swings in over the painted map at frame 0, a cream sign counts the
// day's stories over a painted globe, then every story drops in as its own enamel sign on two wires (its colour per
// story) with a painted illustration sign hanging below, a painted arrow + name plate on the place, and the
// country painted enamel red. Captions low, date plate and story discs at the bottom. 20 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M12", name: "ป้ายสังกะสีข่าวรายวัน", frames: 600, cover: 248, sizes: ["9x16", "16x9"] };

const DATE = "จันทร์ 1 ม.ค. · ตัวอย่าง";
const HOOK_END = 60;
const INTRO = { start: 60, end: 128 };
const PL = { taipei: [121.565, 25.033] as LL, ishigaki: [124.156, 24.344] as LL, valencia: [-0.3763, 39.4699] as LL, bucharest: [26.1025, 44.4268] as LL };
const TRACK: LL[] = [[131, 18.5], [127.5, 21.5], [124.6, 24.2], [125.5, 27], [128, 29.5]];
const STORIES: Story[] = [
  { id: "storm", ids: ["158", "392"], focus: [125, 24.5], zoom: 3.6, start: 128, end: 290, pin: { at: PL.ishigaki, label: "ซากิชิมะ", f: 214 } },
  { id: "spain", ids: ["724"], focus: [-1.5, 39.5], zoom: 6, start: 290, end: 450, pin: { at: PL.valencia, label: "บาเลนเซีย", f: 318 } },
  { id: "romania", ids: ["642"], focus: [25, 45.6], zoom: 7, start: 450, end: 570, pin: { at: PL.bucharest, label: "บูคาเรสต์", f: 476 } },
];
const [ST, ES, RO] = STORIES;
const CUE = { wind: 150, track: 210, rain: 312, rescue: 372, pm: 470, vote: 506 };

type Head = { f: number; tag: string; head: string; stat?: string | ((f: number) => string); label?: string };
const SIGNS: { id: string; from: number; to: number; bg: string; edge: string; ink: string; statInk: string; heads: Head[] }[] = [
  { id: "hook", from: 0, to: HOOK_END, bg: RED, edge: YELLOW, ink: YELLOW, statInk: CREAM, heads: [{ f: 0, tag: "ด่วน · ไต้หวัน · ญี่ปุ่น", head: "ซูเปอร์ไต้ฝุ่นเข้าใกล้", stat: "~200", label: "กม./ชม." }] },
  { id: "intro", from: INTRO.start, to: INTRO.end, bg: CREAM, edge: RED, ink: GREEN, statInk: RED, heads: [{ f: INTRO.start, tag: DATE, head: "3 ข่าวใหญ่ใน 24 ชั่วโมง", stat: "60", label: "วินาที" }] },
  { id: "storm", from: ST.start + 4, to: ST.end, bg: YELLOW, edge: RED, ink: BLACK, statInk: RED, heads: [
    { f: ST.start + 4, tag: "1 · ไต้หวัน · ญี่ปุ่น", head: "ซูเปอร์ไต้ฝุ่นเข้าใกล้", stat: "~198", label: "กม./ชม." },
    { f: CUE.track, tag: "1 · ไต้หวัน · ญี่ปุ่น", head: "คาดผ่านหมู่เกาะซากิชิมะ", stat: "2 วัน", label: "ข้างหน้า" },
  ] },
  { id: "spain", from: ES.start + 4, to: ES.end, bg: CREAM, edge: BLUE, ink: BLUE, statInk: RED, heads: [
    { f: ES.start + 4, tag: "2 · สเปน", head: "ฝนถล่มฝั่งตะวันออก", stat: "40 ปี", label: "หนักสุดในรอบ" },
    { f: CUE.rescue, tag: "2 · สเปน", head: "กู้ภัยช่วยคนติดน้ำท่วม", stat: (f) => `${Math.round(interpolate(f, [CUE.rescue, CUE.rescue + 30], [0, 450], clamp))}+`, label: "คน" },
  ] },
  { id: "romania", from: RO.start + 4, to: RO.end, bg: GREEN, edge: YELLOW, ink: CREAM, statInk: YELLOW, heads: [
    { f: RO.start + 4, tag: "3 · โรมาเนีย", head: "ได้นายกฯ คนใหม่" },
    { f: CUE.vote, tag: "3 · โรมาเนีย", head: "สภารับรองท่วมท้น", stat: "280–58", label: "เสียง" },
  ] },
  { id: "outro", from: RO.end, to: 612, bg: RED, edge: YELLOW, ink: CREAM, statInk: YELLOW, heads: [{ f: RO.end, tag: "แผนที่ข่าวโลก", head: "พบกันพรุ่งนี้", label: "ทุกวัน · กดติดตามไว้" }] },
];
const LINES = [
  { text: "แผนที่ข่าวโลก วันนี้ สามเรื่อง ในหกสิบวินาที", start: INTRO.start, len: 66 },
  { text: "ไต้หวันและญี่ปุ่น เตรียมรับซูเปอร์ไต้ฝุ่น ลมเกือบ 200 กม./ชม. คาดผ่านหมู่เกาะซากิชิมะ", start: ST.start, len: 156 },
  { text: "สเปน ฝนถล่มหนักสุดในรอบ 40 ปี กู้ภัยช่วยคนได้กว่า 450 คน", start: ES.start, len: 154 },
  { text: "โรมาเนีย สภารับรองนายกฯ คนใหม่ ด้วยเสียง 280 ต่อ 58", start: RO.start, len: 114 },
];

const useLayout = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const v = height > width;
  return v
    ? { s, head: { x: 60 * s, y: height * 0.09, w: width - 120 * s, h: 360 * s, wire: 110 }, scene: { x: 90 * s, y: height * 0.5, w: width - 180 * s, h: 390 * s, wire: 210 } }
    : { s, head: { x: 70 * s, y: 120 * s, w: 820 * s, h: 320 * s, wire: 80 }, scene: { x: 90 * s, y: 580 * s, w: 780 * s, h: 330 * s, wire: 90 } };
};

const HeadSign = ({ sign }: { sign: (typeof SIGNS)[number] }) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const s = L.s;
  const cur = [...sign.heads].reverse().find((h) => frame >= h.f) ?? sign.heads[0];
  const stat = typeof cur.stat === "function" ? cur.stat(frame) : cur.stat;
  return (
    <Hanging from={sign.from} to={sign.to} jolts={sign.heads.slice(1).map((h) => h.f)} x={L.head.x} y={L.head.y} w={L.head.w} h={L.head.h} bg={sign.bg} edge={sign.edge} wire={L.head.wire}>
      <div style={{ position: "absolute", inset: `${30 * s}px ${40 * s}px`, display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1.3 }}>
        <div style={{ fontFamily: font, fontSize: 36 * s, ...paint(s, sign.ink === BLACK ? RED : sign.ink, BLACK, 2) }}>{cur.tag}</div>
        <div style={{ fontFamily: font, fontSize: 76 * s, ...paint(s, sign.ink, sign.ink === BLACK ? "rgba(0,0,0,0.25)" : BLACK, 5) }}>{cur.head}</div>
        {(stat || cur.label) && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 * s }}>
            {stat && <span style={{ fontFamily: num, fontSize: 96 * s, lineHeight: 1.15, ...paint(s, sign.statInk, BLACK, 7) }}>{stat}</span>}
            {cur.label && <span style={{ fontFamily: font, fontSize: 40 * s, ...paint(s, sign.ink, BLACK, 2) }}>{cur.label}</span>}
          </div>
        )}
      </div>
    </Hanging>
  );
};

const Town = ({ g }: { g: InsetGeom }) => (
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={g.x + i * (g.W / 6) + 6 * g.s} y={g.ground - (150 + (i % 3) * 30) * g.s} width={g.W / 6 - 12 * g.s} height={(150 + (i % 3) * 30) * g.s} fill={[YELLOW, CREAM, "#e98a3a", CREAM][i % 4]} stroke={BLACK} strokeWidth={3 * g.s} />
        {[0, 1].map((r) => <rect key={r} x={g.x + i * (g.W / 6) + 40 * g.s} y={g.ground - (130 - r * 50) * g.s} width={28 * g.s} height={30 * g.s} fill={BLUE} stroke={BLACK} strokeWidth={2 * g.s} />)}
      </g>
    ))}
  </>
);

// Illustration signs: one per story, the scene repainted (with a jolt) on each cue.
const SceneSigns = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const sc = L.scene;
  const sign = (id: string, from: number, to: number, jolts: number[], bg: string, edge: string, sky: [string, string], draw: (g: InsetGeom) => ReactNode) => (
    <Hanging key={id} from={from} to={to} jolts={jolts} x={sc.x} y={sc.y} w={sc.w} h={sc.h} bg={bg} edge={edge} wire={sc.wire}>
      <SceneSign w={sc.w - 20 * L.s} h={sc.h - 20 * L.s} sky={sky}>{draw}</SceneSign>
    </Hanging>
  );
  return (
    <>
      {sign("hook", 8, HOOK_END, [], RED, YELLOW, ["#5e7f9c", "#3b6d9a"], (g) => {
        const w = 1;
        return (
          <>
            <Waves g={g} level={g.ground - 20 * g.s} frame={g.frame} amp={14} color={BLUE} />
            {[0.15, 0.4, 0.68, 0.88].map((fx, i) => <Palm key={i} x={g.x + g.W * fx} y={g.ground - 10 * g.s} scale={g.sc * 1.05} wind={w} frame={g.frame} seed={i} />)}
            <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#e6c77a" />
            <Rain g={g} k={1} frame={g.frame} slant={0.6} />
          </>
        );
      })}
      {sign("storm", ST.start + 20, ST.end, [CUE.track], YELLOW, RED, ["#6f8ea8", "#3b6d9a"], (g) => {
        const isle = frame >= CUE.track;
        const w = 0.3 + 0.7 * ramp(g.frame, CUE.wind, CUE.wind + 30);
        return isle ? (
          <>
            <Waves g={g} level={g.ground - 40 * g.s} frame={g.frame} amp={14} color={BLUE} />
            <path d={`M${g.x + 150 * g.s} ${g.ground - 38 * g.s} Q${g.cx} ${g.ground - 200 * g.s} ${g.x + g.W - 180 * g.s} ${g.ground - 38 * g.s} Z`} fill={GREEN} stroke={BLACK} strokeWidth={4 * g.s} />
            <line x1={g.cx + 60 * g.s} y1={g.ground - 140 * g.s} x2={g.cx + 60 * g.s} y2={g.ground - 280 * g.s} stroke={CREAM} strokeWidth={6 * g.s} />
            <path d={`M${g.cx + 62 * g.s} ${g.ground - 280 * g.s} l${70 * g.s + Math.sin(g.frame * 0.5) * 8 * g.s} ${16 * g.s} l${-70 * g.s} ${16 * g.s} Z`} fill={RED} stroke={BLACK} strokeWidth={3 * g.s} />
            <Rain g={g} k={1} frame={g.frame} slant={0.5} />
          </>
        ) : (
          <>
            <Waves g={g} level={g.ground - 20 * g.s} frame={g.frame} amp={6 + 10 * w} color={BLUE} />
            {[0.15, 0.4, 0.68, 0.88].map((fx, i) => <Palm key={i} x={g.x + g.W * fx} y={g.ground - 10 * g.s} scale={g.sc * 1.05} wind={w} frame={g.frame} seed={i} />)}
            <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#e6c77a" />
            <Rain g={g} k={w} frame={g.frame} slant={0.6 * w} />
          </>
        );
      })}
      {sign("spain", ES.start + 20, ES.end, [CUE.rescue], CREAM, BLUE, ["#7d8b96", "#9aa8b3"], (g) => {
        const rescue = frame >= CUE.rescue;
        const lvl = ramp(g.frame, CUE.rain, CUE.rain + 90, Easing.out(Easing.quad));
        return (
          <>
            <Town g={g} />
            {!rescue && <Street g={g} color="#5b5b5b" kerb="#9a9a9a" />}
            {!rescue && <Car x={g.x + 220 * g.s} y={g.ground + 40 * g.s} scale={g.sc} color={RED} />}
            <Waves g={g} level={rescue ? g.ground - 70 * g.s : g.ground + 30 * g.s - lvl * 110 * g.s} frame={g.frame} color="#8a6a3f" amp={5} />
            {rescue && <RescueBoat x={g.x + g.W * (0.2 + 0.25 * ramp(g.frame, CUE.rescue, ES.end, Easing.linear))} y={g.ground - 66 * g.s} scale={g.sc} />}
            {rescue && <Helicopter x={g.x + g.W * (0.85 - 0.15 * ramp(g.frame, CUE.rescue, ES.end, Easing.linear))} y={g.y + 120 * g.s} scale={g.sc} frame={g.frame} />}
            {!rescue && <Rain g={g} k={1} frame={g.frame} slant={0.2} n={90} />}
          </>
        );
      })}
      {sign("romania", RO.start + 20, RO.end, [CUE.vote], GREEN, YELLOW, ["#26466e", "#3a2a22"], (g) => {
        const vote = frame >= CUE.vote;
        const k = ramp(g.frame, CUE.vote, CUE.vote + 45, Easing.out(Easing.quad));
        return vote ? (
          <>
            <Hemicycle x={g.cx} y={g.ground - 10 * g.s} r={240 * g.s} s={g.s} yes={280} no={58} k={k} />
            <text x={g.cx} y={g.ground - 30 * g.s} textAnchor="middle" fontSize={60 * g.s} fill={YELLOW} stroke={BLACK} strokeWidth={8 * g.s} paintOrder="stroke" fontFamily={num}>{Math.round(280 * k)} : {Math.round(58 * k)}</text>
          </>
        ) : (
          <>
            {(["#002b7f", "#fcd116", "#ce1126"] as const).map((c, i) => <rect key={c} x={g.x + g.W * 0.68 + i * 44 * g.s} y={g.y + 50 * g.s} width={44 * g.s} height={120 * g.s} fill={c} stroke={BLACK} strokeWidth={3 * g.s} />)}
            <Person x={g.x + g.W * 0.38} y={g.ground - 30 * g.s} scale={g.sc * 1.1} look={LOOKS[0]} outfit="suit" pose="wave" />
            <Lectern x={g.x + g.W * 0.38} y={g.ground} scale={g.sc} color="#5b3a24" />
          </>
        );
      })}
    </>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const cam = camAt(dailyCam(STORIES, width, height, { focus: [123.5, 24.5], zoom: 5, to: HOOK_END }, { at: INTRO.start, to: INTRO.end, lon: [120, 100] }, demo.frames), frame);
  const active = STORIES.find((st) => frame >= st.start - 4 && frame < st.end);
  const red = active ? interpolate(frame, [active.start + 14, active.start + 28, active.end - 6, active.end + 2], [0, 1, 1, 0], clamp) : frame < HOOK_END ? 1 : 0;
  const capTop = vertical ? 0.785 : 0.88;
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <Sfx src={SFX.hit} at={0} volume={0.45} />
      <Sfx src={SFX.swell} at={INTRO.start} volume={0.25} />
      {SIGNS.map((sg) => <Sfx key={sg.id} src={SFX.whoosh} at={sg.from} volume={0.25} />)}
      {[CUE.track, CUE.rescue, CUE.vote].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.3} />)}
      <Bed id="wind_storm" from={0} to={ST.end} volume={0.12} />
      <Bed id="rain_heavy" from={ES.start} to={CUE.rescue + 20} volume={0.12} />
      <Hit id="thunder_close" at={CUE.rain} volume={0.22} />
      <MapFrame cam={cam} focusY={vertical ? 0.42 : 0.5}>
        <TinDefs />
        <PaintedMap ids={active ? active.ids : ST.ids} k={red} />
        <FloodPaint at={[-0.25, 39.15]} radius={0.45} k={frame > ES.start && frame < ES.end ? ramp(frame, CUE.rain, CUE.rain + 50) : 0} />
        <StormTrack track={TRACK} from={0} to={HOOK_END} trackAt={0} />
        <StormTrack track={TRACK} from={ST.start + 10} to={ST.end} trackAt={CUE.track} />
        {frame < HOOK_END && <PaintPin at={PL.ishigaki} label="ซากิชิมะ" start={10} />}
        {active && <PaintPin key={active.id} at={active.pin.at} label={active.pin.label} start={Math.max(active.start + 26, active.pin.f)} />}
      </MapFrame>
      <Sheet />
      <SceneSigns />
      {SIGNS.map((sg) => <HeadSign key={sg.id} sign={sg} />)}
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={font} color={YELLOW} stroke={BLACK} top={capTop} />)}
      <DatePlate date={DATE} stories={STORIES} from={INTRO.start - 4} />
      <Kicker text="M12 · ป้ายสังกะสีข่าวรายวัน" />
    </AbsoluteFill>
  );
};
