import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { bbox } from "../../../components/Region";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { SFX } from "../../../components/Sound";
import { B, BLUE, CityRing, clamp, font, GOLD, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, CityWall, Moon } from "./Period";
import { DryField, Rain, WallCannon, WarElephant, WaterBand } from "./Period2";
import { BigTent, Burst, BurmesePalace, MapTable, Parasol, Royal, ThaiPalace } from "./Period3";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";

// Chapter 2 "ศัตรูที่จำบทเรียน" (beats burma → spoiler): Konbaung Burma, Alaungpaya's 1760 siege and death,
// Hsinbyushin and the two lessons, Ayutthaya still on the old formula.
const T = {
  burma: B.burma.start,
  dyn: wf("burma", "ราชวงศ์", 0.28),
  founder: wf("burma", "ผู้", 0.55),
  unite: wf("burma", "รวม", 0.86),
  y60: B.y2303.start,
  siege: wf("y2303", "ล้อม", 0.5),
  short: wf("y2303", "แต่", 0.72),
  two: B.twoversions.start,
  thai: wf("twoversions", "พงศาวดาร", 0.18),
  burst: wf("twoversions", "แตก", 0.33),
  bur: wf("twoversions", "ฝั่ง", 0.45),
  ill: wf("twoversions", "ประชวร", 0.58),
  agree: wf("twoversions", "แต่", 0.64),
  died: wf("twoversions", "สวรรคต", 0.88),
  son: B.son.start,
  hsin: wf("son", "มัง", 0.3),
  lessons: wf("son", "บท", 0.62),
  lesson: B.lesson.start,
  one: wf("lesson", "ทาง", 0.2),
  l2: wf("lesson", "สอง", 0.4, 0),
  rainy: wf("lesson", "ฝน", 0.92),
  ayut: B.ayutthaya.start,
  ekk: wf("ayutthaya", "เอก", 0.2),
  court: wf("ayutthaya", "ราช", 0.35),
  fight: wf("ayutthaya", "แย่ง", 0.52),
  same: wf("ayutthaya", "ยัง", 0.75),
  formula: wf("ayutthaya", "สูตร", 0.92, 1),
  spoil: B.spoiler.start,
  crash: wf("spoiler", "พัง", 0.92),
};
const END = B.plan.start;

const AVA: [number, number] = [96.08, 21.9];
const KINYWA: [number, number] = [97.55, 16.9]; // where Alaungpaya died on the way home (approximate)
const R1760: [number, number][] = [[98.6, 12.45], [99.6, 12.3], [99.95, 13.1], [99.8, 13.55], [100.1, 14.45], [100.5, 14.36]];
const BACK1760: [number, number][] = [[100.45, 14.4], [100.0, 15.4], [99.15, 16.85], [98.5, 16.75], KINYWA];
const V2 = {
  burma: bbox([[93.5, 12], [101.5, 24]]),
  west: bbox([[97.3, 11.6], [101.2, 17.4]]),
};

const world = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const MYANMAR = feature(world, world.objects.countries).features.find((f) => String(f.id) === "104")!;

// Burma highlight (news style: red wash + glowing outline).
const BurmaGlow = ({ k }: { k: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(MYANMAR) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill={RED} fillOpacity={0.14} />
      <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke="#ff8a80" strokeWidth={2.5 * s} />
    </g>
  );
};

const SKY: [string, string] = ["#3a6ea5", "#bfe0f2"];

// Konbaung court: palace with pyatthat, banners, guards.
const PalaceScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c2palace" anchor={AVA} start={start} end={end} sky={["#e98b3a", "#f8d9a0"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#b79a6e" />
        <BurmesePalace x={g.cx} y={g.ground - 6 * g.s} s={g.s * 0.9} />
        {[0.1, 0.22, 0.78, 0.9].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 8 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" flip={fx > 0.5} phase={i} />)}
      </g>
    )}
  </Panel>
);

// Alaungpaya: the warrior king on a war elephant under the royal parasol, army behind.
const WarriorKing = ({ id, start, end, dark = false }: { id: string; start: number; end: number; dark?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={AVA} start={start} end={end} sky={dark ? ["#a8461f", "#f2b35e"] : ["#e98b3a", "#f8d9a0"]}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <DryField x={g.x} y={g.ground - 20 * g.s} W={g.W} H={g.H} s={g.s} />
            {[0, 1, 2, 3, 4, 5].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.02 + i * 0.09 + m * 0.08)} y={g.ground + 4 * g.s} scale={g.sc * 0.75} hold={i % 2 ? "spear" : "sword"} phase={i} />)}
            <WarElephant x={g.x + g.W * (0.62 + m * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} side="#c9a03c" />
            <Parasol x={g.x + g.W * (0.62 + m * 0.1) - 6 * g.s} y={g.ground - 100 * g.s} s={g.s * 0.8} />
          </g>
        );
      }}
    </Panel>
  );
};

// Thai chronicle: a siege gun bursts beside the king.
const BurstScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2burst" anchor={P.ayut} start={start} end={end} sky={["#7a3a1a", "#e98b3a"]} accent={BLUE}>
      {(g) => {
        const k = interpolate(frame, [T.burst, T.burst + 24], [0, 1], clamp);
        const shake = k > 0 && k < 0.4 ? Math.sin(frame * 3) * 5 : 0;
        return (
          <g transform={`translate(${shake * g.s},0)`}>
            <Skyline g={g} color="#5d3a2a" base={60} />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a6a42" />
            {k < 0.3 && <WallCannon x={g.x + g.W * 0.35} y={g.ground - 6 * g.s} s={g.sc * 1.3} />}
            <Royal x={g.x + g.W * 0.62} y={g.ground + 6 * g.s} scale={g.sc} pose="point" robe="#c9a03c" />
            <Parasol x={g.x + g.W * 0.68} y={g.ground + 4 * g.s} s={g.s * 0.8} />
            <Burst x={g.x + g.W * 0.35} y={g.ground - 30 * g.s} s={g.s} k={k} />
            <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#fff">ฉบับพงศาวดารไทย</text>
          </g>
        );
      }}
    </Panel>
  );
};

// Burmese chronicle: the king lies ill in his field tent.
const IllScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c2ill" anchor={KINYWA} start={start} end={end} sky={["#2a2f4a", "#6b5a73"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4a3a" />
        <BigTent x={g.cx} y={g.ground - 4 * g.s} s={g.s} w={360} />
        <Royal x={g.cx} y={g.ground - 8 * g.s} scale={g.sc} pose="lie" />
        <BurmeseSoldier x={g.x + g.W * 0.18} y={g.ground + 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" />
        <BurmeseSoldier x={g.x + g.W * 0.82} y={g.ground + 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" flip />
        <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#fff">ฉบับบันทึกพม่า</text>
      </g>
    )}
  </Panel>
);

// Funeral march home at dusk: lowered parasols, soldiers walking.
const FuneralScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2funeral" anchor={KINYWA} start={start} end={end} sky={["#2a2f4a", "#c8461f"]}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Moon x={g.x + g.W * 0.85} y={g.y + 80 * g.s} r={26 * g.s} />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a3020" />
            {[0, 1, 2, 3, 4].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.9 - i * 0.16 - m * 0.1)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" flip phase={i} jacket="#3a2a2a" />)}
            {[0.35, 0.6].map((fx, i) => <Parasol key={i} x={g.x + g.W * (fx - m * 0.1)} y={g.ground - 40 * g.s} s={g.s * 0.8} tilt={-25} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Hsinbyushin on the throne.
const ThroneScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c2throne" anchor={AVA} start={start} end={end} sky={["#5a1a14", "#a8322a"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a1a14" />
        {[0.15, 0.85].map((fx) => <rect key={fx} x={g.x + g.W * fx - 14 * g.s} y={g.y} width={28 * g.s} height={g.H} fill="#d9a93a" opacity={0.85} />)}
        <Royal x={g.cx} y={g.ground - 4 * g.s} scale={g.sc * 1.1} pose="sit" robe="#e2b84a" />
        <Parasol x={g.cx + 70 * g.s} y={g.ground} s={g.s} tiers={5} />
        <Parasol x={g.cx - 70 * g.s} y={g.ground} s={g.s} tiers={5} />
      </g>
    )}
  </Panel>
);

// Generals around a map table: the lessons.
const PlanScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c2plan" anchor={AVA} start={start} end={end} sky={["#3a1a14", "#6b2a20"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a1a14" />
        <MapTable x={g.cx} y={g.ground} s={g.s * 1.4} />
        <Royal x={g.cx - 210 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.9} pose="point" robe="#8e2a22" side="#2f4f6b" />
        <BurmeseSoldier x={g.cx + 200 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.9} pose="stand" hold="sword" flip />
        <BurmeseSoldier x={g.cx + 290 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" flip phase={2} />
      </g>
    )}
  </Panel>
);

// Lesson 2: a camp that stays through the monsoon (dry → rain, the camp is still there).
const StayScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2stay" anchor={P.ayut} start={start} end={end} sky={frame > (start + end) / 2 ? ["#4a5866", "#9aa8b4"] : ["#f2b35e", "#fbe3b0"]}>
      {(g) => {
        const wet = interpolate(frame, [(start + end) / 2 - 10, (start + end) / 2 + 10], [0, 1], clamp);
        return (
          <g>
            <DryField x={g.x} y={g.ground - 20 * g.s} W={g.W} H={g.H} s={g.s} />
            {wet > 0 && <WaterBand x={g.x} y={g.ground - 10 * g.s} W={g.W} H={g.H} s={g.s} color="#5f8fa8" />}
            <path d={`M${g.x + g.W * 0.25} ${g.ground - 20 * g.s} Q${g.cx} ${g.ground - 80 * g.s} ${g.x + g.W * 0.75} ${g.ground - 20 * g.s} Z`} fill="#8a6a42" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            {[0.4, 0.55].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 34 * g.s} ${g.ground - 50 * g.s} L${g.x + g.W * fx} ${g.ground - 110 * g.s} L${g.x + g.W * fx + 34 * g.s} ${g.ground - 50 * g.s} Z`} fill={i ? "#e8dcc0" : "#b8362c"} stroke="#1b1d24" strokeWidth={1.4 * g.s} />)}
            <BurmeseSoldier x={g.x + g.W * 0.66} y={g.ground - 44 * g.s} scale={g.sc * 0.8} pose="stand" hold="spear" />
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={wet} />
            <text x={g.cx} y={g.y + 92 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34 * g.s} fill="#fff">{wet > 0.5 ? "หน้าฝน: ยังไม่ถอย" : "หน้าแล้ง: ตั้งค่าย"}</text>
          </g>
        );
      }}
    </Panel>
  );
};

// Ayutthaya court: palace exterior; on "แย่งชิง" two groups of nobles face each other and the palace cracks.
const CourtScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2court" anchor={P.ayut} start={start} end={end} sky={SKY} accent={BLUE}>
      {(g) => {
        const crack = interpolate(frame, [T.fight, T.fight + 20], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#c9b48a" />
            <ThaiPalace x={g.cx} y={g.ground - 6 * g.s} s={g.s * 0.8} crack={crack} />
            {frame >= T.fight && (
              <>
                {[0.08, 0.17].map((fx, i) => <Royal key={`a${i}`} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} pose={i ? "stand" : "point"} robe="#2f4f86" side="#7a2f4a" phase={i} />)}
                {[0.83, 0.92].map((fx, i) => <Royal key={`b${i}`} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} pose={i ? "point" : "stand"} robe="#3f8f4a" side="#7a2f4a" flip phase={i + 2} />)}
              </>
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// The formula, again: shut gate under rain.
const OldFormula = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2old" anchor={P.ayut} start={start} end={end} sky={["#4a5866", "#9aa8b4"]} accent={GOLD}>
      {(g) => {
        const crack = interpolate(frame, [T.crash - 6, T.crash + 6], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#7a6a4a" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={120 * g.s} s={g.s} />
            <rect x={g.cx - 50 * g.s} y={g.ground - 90 * g.s} width={100 * g.s} height={90 * g.s} fill="#8a4a24" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
            {crack > 0 && <path d={`M${g.cx + 20 * g.s} ${g.ground - 120 * g.s} l${-20 * g.s} ${40 * g.s * crack} l${24 * g.s} ${30 * g.s * crack} l${-16 * g.s} ${50 * g.s * crack}`} stroke="#1b1d24" strokeWidth={5 * g.s} fill="none" />}
          </g>
        );
      }}
    </Panel>
  );
};

// "สปอยล์": a red stamp slams across the screen.
const SpoilerStamp = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.spoil + 4 || frame > END + 10) return null;
  const k = interpolate(frame, [T.spoil + 4, T.spoil + 12], [2.2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const o = interpolate(frame, [END - 4, END + 10], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${k}) rotate(-10deg)`, border: `${10 * s}px solid ${RED}`, color: RED, borderRadius: 18 * s, padding: `${6 * s}px ${40 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 130 * s, lineHeight: 1.2, background: "rgba(8,14,26,0.6)" }}>สปอยล์!</div>
    </AbsoluteFill>
  );
};

export const ch2: Chapter = {
  name: "ศัตรูที่จำบทเรียน",
  from: B.burma.start,
  to: END,
  cams: (w, h) => [
    { frame: T.burma, cam: view(V.central, w, h, 1) },
    { frame: T.burma + 40, cam: view(V2.burma, w, h, 0.95, 0.04) },
    { frame: T.y60, cam: view(V2.burma, w, h, 0.95, 0.04) },
    { frame: T.y60 + 35, cam: view(V2.west, w, h, 1, 0.1) },
    { frame: T.son, cam: view(V2.west, w, h, 1, 0.1) },
    { frame: T.son + 35, cam: view(V2.burma, w, h, 0.95, 0.04) },
    { frame: T.ayut, cam: view(V2.burma, w, h, 0.95, 0.04) },
    { frame: T.ayut + 40, cam: view(V.island, w, h, 0.7) },
  ],
  years: [[T.burma, "2295"], [T.y60, "2303"], [T.son, "2306"], [T.ayut, "2308"]],
  heads: [
    { f: T.burma, tag: "ฝั่งตะวันตก", head: "พม่า", color: RED },
    { f: T.dyn, tag: "พ.ศ. 2295", head: "ราชวงศ์ใหม่: คองบอง", color: RED },
    { f: T.founder, tag: "ผู้ก่อตั้ง", head: "พระเจ้าอลองพญา", color: RED, chips: [{ text: "กษัตริย์นักรบ", f: T.founder + 30 }, { text: "รวมพม่าทั้งประเทศ", f: T.unite }] },
    { f: T.y60, tag: "พ.ศ. 2303", head: "ยกทัพมาล้อมอยุธยาเอง", color: RED },
    { f: T.short, tag: "ล้อมได้", head: "ไม่ถึงเดือน ต้องถอย", stat: "< 1 เดือน", color: RED },
    { f: T.two, tag: "ทำไมถอย?", head: "มีสองฉบับ", color: GOLD, chips: [{ text: "ไทย: ปืนใหญ่แตกใส่", f: T.thai }, { text: "พม่า: ประชวร", f: T.bur }] },
    { f: T.agree, tag: "ทั้งสองฉบับตรงกัน", head: "สวรรคตระหว่างทางกลับ", color: GOLD },
    { f: T.son, tag: "พ.ศ. 2306", head: "พระเจ้ามังระขึ้นครองราชย์", color: RED },
    { f: T.lessons, tag: "พม่าได้", head: "บทเรียน 2 ข้อ", color: RED },
    { f: T.lesson, tag: "บทเรียนของพม่า", head: "ห้ามพลาดซ้ำ", color: RED, chips: [{ text: "① บุกทางเดียวไม่พอ", f: T.lesson }, { text: "② ต้องอยู่ข้ามหน้าฝน", f: T.l2 }] },
    { f: T.ayut, tag: "ฝั่งอยุธยา", head: "พระเจ้าเอกทัศ", color: BLUE },
    { f: T.court, tag: "ราชสำนัก", head: "แย่งชิงราชสมบัติหลายรอบ", color: BLUE },
    { f: T.same, tag: "แผนป้องกันกรุง", head: "ยังใช้สูตรรอน้ำ", color: GOLD },
    { f: T.spoil, tag: "สปอยล์ไว้ก่อน", head: "ครั้งนี้สูตรนี้จะพัง", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <BurmaGlow k={interpolate(frame, [T.burma + 20, T.burma + 40, T.ayut + 10, T.ayut + 30], [0, 1, 1, 0], clamp) * (frame >= T.y60 && frame < T.son ? 0.4 : 1)} />
        {frame >= T.burma && frame < T.ayut + 20 && <PointLabel at={AVA} text="อังวะ" start={T.burma + 30} color={RED} size={0.8} />}
        {frame >= T.founder && frame < T.y60 + 10 &&
          [[[94.3, 20.0], [95.8, 21.0], [96.1, 21.8]], [[97.8, 17.0], [96.6, 19.5], [96.1, 21.7]], [[95.0, 17.2], [95.7, 19.8], [96.0, 21.6]]].map((pts, i) => (
            <Arrow key={i} points={pts as [number, number][]} start={T.unite - 10 + i * 6} end={T.unite + 20 + i * 6} color={GOLD} width={14} />
          ))}
        {frame >= T.y60 && frame < T.son + 10 && (
          <>
            <Arrow points={R1760} start={T.y60 + 10} end={T.siege + 20} color={RED} width={22} />
            <CityRing k={interpolate(frame, [T.siege, T.siege + 15], [0, 1], clamp)} color={RED} />
            <Arrow points={BACK1760} start={T.short + 10} end={T.agree + 30} color={RED} width={14} variant="dashed" />
            <PointLabel at={[98.6, 12.45]} text="มะริด" start={T.y60 + 10} color={RED} size={0.7} />
            {frame >= T.agree && <PointLabel at={KINYWA} text="สวรรคต" start={T.died - 10} color={GOLD} size={0.75} />}
          </>
        )}
        {frame >= T.lesson && frame < T.ayut && (
          <>
            <g opacity={interpolate(frame, [T.lesson, T.lesson + 10, T.l2, T.l2 + 10], [0, 1, 1, 0.3], clamp)}>
              <Arrow points={[[98.2, 14.1], [99.5, 14.0], [100.4, 14.3]]} start={T.lesson} end={T.lesson + 25} color={RED} width={20} />
            </g>
            {frame >= T.one + 10 && <PointLabel at={[99.4, 14.05]} text="✕" start={T.one + 10} color={RED} size={1.2} />}
          </>
        )}
        {frame >= T.ayut + 20 && <CityRing k={interpolate(frame, [T.ayut + 30, T.ayut + 45], [0, 1], clamp)} color={BLUE} />}
      </>
    );
  },
  Panels: () => (
    <>
      <PalaceScene start={T.dyn} end={T.founder + 14} />
      <WarriorKing id="c2king" start={T.founder} end={T.y60 + 14} />
      <WarriorKing id="c2march" start={T.y60} end={T.two + 14} dark />
      <BurstScene start={T.thai} end={T.bur + 14} />
      <IllScene start={T.bur} end={T.agree + 14} />
      <FuneralScene start={T.agree} end={T.son + 14} />
      <ThroneScene start={T.son} end={T.lessons + 14} />
      <PlanScene start={T.lessons} end={T.l2 + 14} />
      <StayScene start={T.l2} end={T.ayut + 14} />
      <CourtScene start={T.ayut} end={T.same + 14} />
      <OldFormula start={T.same} end={END + 14} />
    </>
  ),
  Screen: () => <SpoilerStamp />,
  sfx: [
    [T.burma, SFX.whoosh, 0.4],
    [T.dyn, SFX.swell, 0.3],
    [T.founder, SFX.pop, 0.3],
    [T.unite, SFX.whoosh, 0.3],
    [T.y60 + 6, SFX.whoosh, 0.35],
    [T.siege, SFX.hit, 0.4],
    [T.burst, SFX.hit, 0.6],
    [T.bur, SFX.pop, 0.3],
    [T.died, SFX.hit, 0.35],
    [T.son, SFX.swell, 0.3],
    [T.lesson, SFX.pop, 0.35],
    [T.l2, SFX.pop, 0.35],
    [T.ayut, SFX.whoosh, 0.4],
    [T.fight, SFX.hit, 0.35],
    [T.spoil + 4, SFX.hit, 0.6],
  ],
};
void Skyline;
