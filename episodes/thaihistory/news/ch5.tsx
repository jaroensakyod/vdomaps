import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries50 from "world-atlas/countries-50m.json";
import { B, BLUE, CityRing, clamp, FloodLayer, font, GOLD, P, Panel, QuizNews, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BellChedi, BurmeseSoldier, CityWall, Fire, Moon, SiegeCamp, Smoke } from "./Period";
import { Rain, Sampan, SiamSoldier, Townsperson, WaterBand } from "./Period2";
import { BigTent, BurmesePalace, Royal } from "./Period3";
import { HorseGeneral, StiltHouse } from "./Period4";

// Chapter 5 "ล้อมกรุง 14 เดือน" (beats siege → onemore): the siege, the rains come but Burma stays (cross-section ②),
// hunger and fire inside, Maha Nawrahta dies, China invades Burma, and someone in the city decides something.
const INK = "#1b1d24";
const T = {
  siege: B.siege.start,
  ring: wf("siege", "ค่าย", 0.5),
  q2: B.quiz2.start,
  q2show: wf("quiz2", "จะ", 0.25),
  a2: B.quiz2a.start,
  pick: wf("quiz2a", "เลือก", 0.1),
  sortie: wf("quiz2a", "ออก", 0.27),
  lost: wf("quiz2a", "แพ้", 0.52),
  plan: wf("quiz2a", "แผน", 0.75),
  rain: B.rain.start,
  flood: wf("rain", "น้ำ", 0.32),
  formula: wf("rain", "ตรง", 0.8),
  nomove: B.nomove.start,
  stay: wf("nomove", "ไม่", 0.6),
  how: B.how.start,
  d2: B.diagram2.start,
  mound: wf("diagram2", "โคก", 0.23),
  temple: wf("diagram2", "วัด", 0.39),
  water: wf("diagram2", "น้ำ", 0.56),
  dry: wf("diagram2", "ไม่", 0.67),
  boats: wf("diagram2", "เรือ", 0.8),
  rice: B.rice.start,
  plant: wf("rice", "ทำ", 0.36),
  long: wf("rice", "ไม่", 0.7),
  cmp: B.compare.start,
  broken: wf("compare", "สูตร", 0.58),
  inside: B.inside.start,
  hunger: wf("inside", "ข้าว", 0.37),
  starve: wf("inside", "ผู้คน", 0.56),
  fire: wf("inside", "ไฟ", 0.84),
  bt: B.burmatoo.start,
  sick: wf("burmatoo", "มัง", 0.4),
  ne: wf("burmatoo", "เน", 0.8),
  china: B.china.start,
  cn: wf("china", "จีน", 0.17),
  hurry: wf("china", "พระ", 0.58),
  one: B.onemore.start,
  someone: wf("onemore", "มี", 0.6),
};
const END = B.taksin.start;

const world = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const CF = feature(world, world.objects.countries).features;
const CHINA = CF.find((f) => String(f.id) === "156")!;
const MYANMAR = CF.find((f) => String(f.id) === "104")!;
const V5 = { north: bbox([[93.5, 16], [104, 27.5]]) };

const Glow = ({ f, color, k }: { f: typeof CHINA; color: string; k: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(f) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill={color} fillOpacity={0.16} />
      <path d={d} fill="none" stroke={color} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.5 * s} />
    </g>
  );
};

// Qing soldier: round hat with a red tassel, blue padded coat, spear with a pennant.
export const QingSoldier = ({ x, y, scale = 1, phase = 0, flip = false }: { x: number; y: number; scale?: number; phase?: number; flip?: boolean }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.3 + phase;
  const sw = Math.sin(t) * 15;
  return (
    <g transform={`translate(${x},${y - Math.abs(Math.sin(t)) * 2.5}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.28} />
      {[-sw, sw].map((a, i) => (
        <g key={i} transform={`translate(0,-40) rotate(${a})`} opacity={i ? 1 : 0.85}>
          <path d="M-5 0 L5 0 L4.5 36 L-4 36 Z" fill="#2a2a34" stroke={INK} strokeWidth={1.4} />
          <path d="M-5 34 L8 34 Q9 39 6 40 L-5 40 Z" fill="#1b1d24" />
        </g>
      ))}
      <path d="M-13 -90 Q-15 -64 -14 -36 L14 -36 Q15 -64 13 -90 Q0 -96 -13 -90 Z" fill="#2f5aa8" stroke={INK} strokeWidth={1.5} />
      <circle cx={0} cy={-62} r={9} fill="#f4ecd8" stroke={INK} strokeWidth={1.2} />
      <text x={0} y={-58} textAnchor="middle" fontSize={11} fontWeight={900} fill="#c0392b">兵</text>
      <g transform="translate(0,-104)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill="#e2b48a" stroke={INK} strokeWidth={1.4} />
        <path d="M-15 -4 Q0 -16 15 -4 Q0 -8 -15 -4 Z" fill="#1b1d24" />
        <path d="M-3 -12 Q0 -2 3 -12 Z" fill="#c0392b" />
        <circle cx={5} cy={1} r={1.3} fill={INK} />
      </g>
      <g transform="translate(6,-86) rotate(-30)">
        <path d="M0 0 L0 22" stroke="#2f5aa8" strokeWidth={7} strokeLinecap="round" />
        <g transform="translate(0,24) rotate(120)">
          <line x1={-30} y1={0} x2={80} y2={0} stroke="#6b4a2b" strokeWidth={2.6} />
          <path d="M80 -4 L96 0 L80 4 Z" fill="#c9ced3" stroke={INK} strokeWidth={1} />
          <path d={`M66 0 L66 ${-20 + Math.sin(frame * 0.3) * 2} L52 -14 Z`} fill="#e2b84a" />
        </g>
      </g>
    </g>
  );
};

const DAY: [string, string] = ["#3a6ea5", "#bfe0f2"];
const STORM: [string, string] = ["#3a4652", "#8a98a4"];

// From the wall: Burmese camps all along the far bank.
const WallView = ({ id, start, end, sky = DAY, rain = 0 }: { id: string; start: number; end: number; sky?: [string, string]; rain?: number }) => (
  <Panel id={id} anchor={P.ayut} start={start} end={end} sky={sky} accent={RED}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 120 * g.s} width={g.W} height={g.H} fill="#7d8a5a" />
        {[0.12, 0.38, 0.64, 0.9].map((fx, i) => <SiegeCamp key={i} x={g.x + g.W * fx} y={g.ground - 116 * g.s} s={g.s * 0.55} w={200} phase={i} />)}
        <WaterBand x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#cfc6b0" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${g.x + (i * g.W) / 13} ${g.ground - 40 * g.s} l0 ${-16 * g.s} q${12 * g.s} ${-16 * g.s} ${24 * g.s} 0 l0 ${16 * g.s} Z`} fill="#e9e1cf" stroke={INK} strokeWidth={g.s} />)}
        {[0.25, 0.7].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground - 40 * g.s} scale={g.sc * 0.75} hold={i ? "gun" : "spear"} phase={i} />)}
        <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={rain} />
      </g>
    )}
  </Panel>
);

// Sortie: Siamese troops charge out of the gate, then fall back.
const SortieScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5sortie" anchor={P.ayut} start={start} end={end} sky={DAY} accent={BLUE}>
      {(g) => {
        const out = interpolate(frame, [start, T.lost], [0, 1], clamp);
        const back = interpolate(frame, [T.lost, end], [0, 1], clamp);
        const pos = out - back * 1.1;
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a7a4a" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W * 0.22} ground={g.ground} h={120 * g.s} s={g.s} />
            <SiegeCamp x={g.x + g.W * 0.82} y={g.ground} s={g.s * 0.8} w={220} />
            {[0, 1, 2, 3].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.2 + i * 0.07 + Math.max(0, pos) * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" walk flip={back > 0} phase={i} />)}
            {back > 0 && [0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.78 - i * 0.06 - back * 0.15)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" flip phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Cross-section ②: camps on a mound and round a hilltop temple; the water rises and stops; boats ply between.
const Section2 = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5sec2" anchor={P.ayut} start={start} end={end} sky={STORM} accent={GOLD}>
      {(g) => {
        const lvl = interpolate(frame, [T.water, T.dry], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const water = g.ground - 20 * g.s - lvl * 70 * g.s;
        const boat = interpolate(frame, [T.boats, end], [0, 1], clamp);
        const moundA = `M${g.x + g.W * 0.05} ${g.ground} Q${g.x + g.W * 0.24} ${g.ground - 200 * g.s} ${g.x + g.W * 0.44} ${g.ground} Z`;
        const moundB = `M${g.x + g.W * 0.56} ${g.ground} Q${g.x + g.W * 0.76} ${g.ground - 210 * g.s} ${g.x + g.W * 0.96} ${g.ground} Z`;
        return (
          <g>
            <text x={g.x + 24 * g.s} y={g.y + 90 * g.s} fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>ภาพตัดขวาง ②</text>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f6a4a" />
            {frame >= T.mound && <path d={moundA} fill="#8a6a42" stroke={INK} strokeWidth={1.5 * g.s} />}
            {frame >= T.mound && <SiegeCamp x={g.x + g.W * 0.24} y={g.ground - 98 * g.s} s={g.s * 0.55} w={170} />}
            {frame >= T.temple && <path d={moundB} fill="#8a6a42" stroke={INK} strokeWidth={1.5 * g.s} />}
            {frame >= T.temple && <BellChedi x={g.x + g.W * 0.76} y={g.ground - 102 * g.s} h={110 * g.s} color="#b0623f" />}
            {frame >= T.temple && <SiegeCamp x={g.x + g.W * 0.84} y={g.ground - 82 * g.s} s={g.s * 0.45} w={120} phase={2} />}
            {lvl > 0 && <WaterBand x={g.x} y={water} W={g.W} H={g.H} s={g.s} />}
            {frame >= T.dry && <text x={g.cx} y={water - 14 * g.s} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>น้ำท่วมไม่ถึงค่าย</text>}
            {boat > 0 && <Sampan x={g.x + g.W * (0.32 + boat * 0.3)} y={water + 10 * g.s} scale={g.sc * 0.7} people={2} cargo />}
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
          </g>
        );
      }}
    </Panel>
  );
};

// Burmese soldiers planting rice next to the camp; then the camp settled in for the long haul.
const PaddyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5paddy" anchor={P.ayut} start={start} end={end} sky={["#7aa0c4", "#dbeef2"]} accent={RED}>
      {(g) => {
        const grow = interpolate(frame, [T.plant, T.long], [0.3, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#6f9a5a" />
            <WaterBand x={g.x} y={g.ground - 24 * g.s} W={g.W} H={g.H} s={g.s} color="#8fb0a0" />
            {Array.from({ length: 22 }, (_, i) => {
              const px = g.x + (i / 22) * g.W + 10 * g.s;
              return <path key={i} d={`M${px} ${g.ground - 20 * g.s} l${-4 * g.s} ${-30 * g.s * grow} M${px} ${g.ground - 20 * g.s} l${4 * g.s} ${-28 * g.s * grow} M${px} ${g.ground - 20 * g.s} l0 ${-34 * g.s * grow}`} stroke="#4f9a3a" strokeWidth={2.4 * g.s} />;
            })}
            {frame < T.long && [0.25, 0.5].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground - 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" phase={i} />)}
            {frame >= T.long && (
              <>
                <SiegeCamp x={g.x + g.W * 0.3} y={g.ground - 26 * g.s} s={g.s * 0.8} w={240} />
                <StiltHouse x={g.x + g.W * 0.72} y={g.ground - 40 * g.s} s={g.s * 0.8} />
                <BurmeseSoldier x={g.x + g.W * 0.88} y={g.ground - 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" flip />
              </>
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// Side by side: ① camp under water vs ② camp on high ground.
export const CompareScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5cmp" anchor={P.ayut} start={start} end={end} sky={STORM} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f6a4a" />
        {[0.3, 0.42].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 30 * g.s} ${g.ground - 20 * g.s} L${g.x + g.W * fx} ${g.ground - 70 * g.s} L${g.x + g.W * fx + 30 * g.s} ${g.ground - 20 * g.s} Z`} fill="#b8362c" stroke={INK} strokeWidth={1.4 * g.s} />)}
        <path d={`M${g.x + g.W * 0.55} ${g.ground} Q${g.x + g.W * 0.76} ${g.ground - 190 * g.s} ${g.x + g.W * 0.97} ${g.ground} Z`} fill="#8a6a42" stroke={INK} strokeWidth={1.5 * g.s} />
        <SiegeCamp x={g.x + g.W * 0.76} y={g.ground - 90 * g.s} s={g.s * 0.55} w={170} />
        <WaterBand x={g.x} y={g.ground - 60 * g.s} W={g.W} H={g.H} s={g.s} />
        <line x1={g.cx} y1={g.y} x2={g.cx} y2={g.y + g.H} stroke="#fff" strokeWidth={4 * g.s} />
        <text x={g.x + g.W * 0.25} y={g.y + 90 * g.s} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>① ค่ายบนทุ่ง: จม</text>
        <text x={g.x + g.W * 0.75} y={g.y + 90 * g.s} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>② ค่ายบนที่ดอน: รอด</text>
      </g>
    )}
  </Panel>
);

// Inside the city: a street; then a queue with empty bowls; then the great fire.
const CityInside = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5inside" anchor={P.ayut} start={start} end={end} sky={frame >= T.fire ? ["#2a1a1a", "#c8461f"] : ["#8a8a7a", "#d9d2bc"]} accent={BLUE}>
      {(g) => {
        const burn = interpolate(frame, [T.fire, T.fire + 20], [0, 1], clamp);
        return (
          <g>
            <Skyline g={g} color="#6b5a4a" base={120} burn={burn} />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a08a6a" />
            {[0.1, 0.32, 0.86].map((fx, i) => <StiltHouse key={i} x={g.x + g.W * fx} y={g.ground - 24 * g.s} s={g.s * 0.75} flip={i === 2} />)}
            {burn > 0 && [0.1, 0.32, 0.86].map((fx, i) => <Fire key={`f${i}`} x={g.x + g.W * fx} y={g.ground - 90 * g.s} size={80 * g.s * burn} seed={i} />)}
            {frame >= T.hunger && frame < T.fire && (
              <>
                {Array.from({ length: 3 }, (_, i) => <path key={`j${i}`} d={`M${g.x + g.W * (0.5 + i * 0.07) - 18 * g.s} ${g.ground} q${-6 * g.s} ${-40 * g.s} ${18 * g.s} ${-46 * g.s} q${24 * g.s} ${6 * g.s} ${18 * g.s} ${46 * g.s} Z`} fill="#8a5a32" stroke={INK} strokeWidth={1.2 * g.s} />)}
                {[0.6, 0.68, 0.76].map((fx, i) => <Townsperson key={`q${i}`} x={g.x + g.W * fx + 60 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.75} walk={false} flip woman={i === 1} cloth="#6b5a44" />)}
              </>
            )}
            {burn > 0 && [0.45, 0.58].map((fx, i) => <Townsperson key={`r${i}`} x={g.x + g.W * (fx + burn * 0.15)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} phase={i} cloth="#6b5a44" />)}
            {burn > 0.5 && <Smoke x={g.cx} y={g.ground - 150 * g.s} size={200 * g.s} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Burmese side: sick men in the rain; Maha Nawrahta's tent; Ne Myo alone with the banner.
const BurmaSide = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5bside" anchor={P.ayut} start={start} end={end} sky={STORM} accent={RED}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4a3a" />
          {frame < T.sick ? (
            <>
              <SiegeCamp x={g.x + g.W * 0.3} y={g.ground} s={g.s * 0.8} w={240} />
              {[0.62, 0.78].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} pose="stand" hold="spear" jacket="#6b4a4a" phase={i} />)}
            </>
          ) : frame < T.ne ? (
            <>
              <BigTent x={g.cx} y={g.ground - 4 * g.s} s={g.s} w={360} color="#5a2a22" />
              <Royal x={g.cx} y={g.ground - 8 * g.s} scale={g.sc} pose="lie" robe="#8e2a22" />
            </>
          ) : (
            <HorseGeneral x={g.cx} y={g.ground + 6 * g.s} scale={g.sc * 0.9} banner="#c7322a" />
          )}
          <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
        </g>
      )}
    </Panel>
  );
};

// Qing army marching, then the Burmese king in a hurry.
const ChinaScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5china" anchor={[97.5, 23.5]} start={start} end={end} sky={frame >= T.hurry ? ["#5a1a14", "#a8322a"] : ["#7aa0c4", "#dbeef2"]} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, T.hurry], [0, 1], clamp);
        return frame < T.hurry ? (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a8a5a" />
            {[0, 1, 2, 3, 4, 5].map((i) => <QingSoldier key={i} x={g.x + g.W * (0.04 + i * 0.12 + m * 0.2)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} phase={i} />)}
          </g>
        ) : (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a1a14" />
            <BurmesePalace x={g.x + g.W * 0.3} y={g.ground - 20 * g.s} s={g.s * 0.55} w={360} />
            <Royal x={g.x + g.W * 0.68} y={g.ground + 4 * g.s} scale={g.sc} pose="point" robe="#e2b84a" flip />
          </g>
        );
      }}
    </Panel>
  );
};

// Dusk at the walls; a lone rider by the gate in moonlight.
export const RiderScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5rider" anchor={P.ayut} start={start} end={end} sky={["#0b1230", "#3a3a6a"]} accent={GOLD}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.8} y={g.y + 80 * g.s} r={30 * g.s} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} />
        <rect x={g.cx - 44 * g.s} y={g.ground - 90 * g.s} width={88 * g.s} height={80 * g.s} fill="#0b0f1e" />
        <g opacity={0.9}><HorseGeneral x={g.cx} y={g.ground + 4 * g.s} scale={g.sc * 0.8} banner="#d9a93a" coat="#1b1d24" /></g>
        <text x={g.cx + 140 * g.s} y={g.ground - 140 * g.s} fill={GOLD} fontFamily={font} fontWeight={900} fontSize={80 * g.s}>?</text>
      </g>
    )}
  </Panel>
);

// Big red "ไม่ถอย" / broken formula overlays.
const Stamp = ({ from, to, text, color = RED }: { from: number; to: number; text: string; color?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const k = interpolate(frame, [from, from + 8], [2.2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const o = interpolate(frame, [to - 10, to], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${k}) rotate(-8deg)`, border: `${10 * s}px solid ${color}`, color, borderRadius: 18 * s, padding: `${6 * s}px ${40 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: 1.2, background: "rgba(8,14,26,0.65)" }}>{text}</div>
    </AbsoluteFill>
  );
};

const Hourglass = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.hurry || frame > T.one) return null;
  const k = (frame - T.hurry) / Math.max(1, T.one - T.hurry);
  return (
    <div style={{ position: "absolute", right: 70 * s, top: height * 0.32, width: 110 * s, height: 160 * s, transform: `rotate(${Math.sin(frame * 0.3) * 4}deg)` }}>
      <svg viewBox="-60 -100 120 110" width={110 * s} height={160 * s}>
        <rect x={-34} y={-100} width={68} height={8} rx={3} fill="#8b5a32" />
        <rect x={-34} y={0} width={68} height={8} rx={3} fill="#8b5a32" />
        <path d="M-26 -92 L26 -92 L4 -46 L26 0 L-26 0 L-4 -46 Z" fill="rgba(255,255,255,0.9)" stroke={INK} strokeWidth={3} />
        <path d={`M${-18 + k * 14} ${-86 + k * 34} L${18 - k * 14} ${-86 + k * 34} L0 -48 Z`} fill={GOLD} />
        <path d={`M-20 -2 L20 -2 L${12 - k * 8} ${-10 - k * 20} L${-12 + k * 8} ${-10 - k * 20} Z`} fill={GOLD} />
      </svg>
    </div>
  );
};

export const ch5: Chapter = {
  name: "ล้อมกรุง 14 เดือน",
  from: B.siege.start,
  to: END,
  cams: (w, h) => [
    { frame: T.siege, cam: view(V.island, w, h, 0.45) },
    { frame: T.rain, cam: view(V.island, w, h, 0.45) },
    { frame: T.flood, cam: view(V.plain, w, h, 1.2) },
    { frame: T.inside, cam: view(V.plain, w, h, 1.2) },
    { frame: T.inside + 30, cam: view(V.island, w, h, 1) },
    { frame: T.china, cam: view(V.island, w, h, 1) },
    { frame: T.china + 35, cam: view(V5.north, w, h, 0.95, 0.04) },
    { frame: T.one, cam: view(V5.north, w, h, 0.95, 0.04) },
    { frame: T.one + 40, cam: view(V.island, w, h, 0.8) },
  ],
  years: [[T.siege, "2309"], [T.rain, "2309 · หน้าฝน"], [T.inside, "2310 · มกราคม"], [T.bt, "2310 · มีนาคม"], [T.china, "2310"]],
  heads: [
    { f: T.siege, tag: "กลับมาที่กรุงศรีอยุธยา", head: "ค่ายพม่าล้อมรอบเกาะ", color: RED },
    { f: T.q2, tag: "ถ้าคุณเป็นพระเจ้าเอกทัศ", head: "จะทำยังไงดี?", color: GOLD },
    { f: T.a2, tag: "อยุธยาเลือก", head: "รอน้ำ", color: BLUE },
    { f: T.sortie, tag: "ออกไปตีเป็นครั้งคราว", head: "แพ้กลับมาเกือบทุกครั้ง", color: BLUE },
    { f: T.plan, tag: "แผนหลัก", head: "รอให้ฝนมา", color: BLUE },
    { f: T.rain, tag: "หน้าฝน 2309", head: "ฝนมาแล้ว", color: BLUE, chips: [{ text: "✓ น้ำท่วมทุ่งรอบกรุง", f: T.flood }, { text: "✓ ตรงตามสูตร", f: T.formula }] },
    { f: T.nomove, tag: "แต่", head: "ทัพพม่าไม่ถอย", color: RED },
    { f: T.how, tag: "ชิ้นสำคัญที่สุด", head: "ของคำตอบ", color: GOLD },
    { f: T.d2, tag: "ภาพตัดขวาง ②", head: "พม่าแก้เกม", color: GOLD, chips: [{ text: "ค่ายบนโคก", f: T.mound }, { text: "รอบวัดที่สูง", f: T.temple }, { text: "น้ำท่วมไม่ถึง", f: T.dry }, { text: "มีเรือใช้", f: T.boats }] },
    { f: T.rice, tag: "ที่เด็ดที่สุด", head: "ทำนากินเองระหว่างล้อม", color: RED },
    { f: T.long, tag: "ไม่ได้มาล้อมเฉย ๆ", head: "มาอยู่กันยาว ๆ", color: RED },
    { f: T.cmp, tag: "เทียบสองภาพ", head: "① จม  vs  ② รอด", color: GOLD },
    { f: T.broken, tag: "สรุป", head: "สูตรรอน้ำพังแล้ว", color: RED },
    { f: T.inside, tag: "คนที่ลำบาก", head: "กลายเป็นคนในเมือง", color: BLUE, chips: [{ text: "ข้าวขาด", f: T.hunger }, { text: "อดอยาก", f: T.starve }, { text: "ไฟไหม้ใหญ่", f: T.fire }] },
    { f: T.bt, tag: "ฝั่งพม่าเอง", head: "ก็ไม่สบาย", color: RED },
    { f: T.sick, tag: "ระหว่างล้อม", head: "มังมหานรธาเสียชีวิต", color: RED },
    { f: T.ne, tag: "เหลือคนเดียว", head: "เนเมียวคุมทัพ", color: RED },
    { f: T.china, tag: "ที่บ้านพม่า", head: "จีนยกทัพบุก", color: "#7a4b9a" },
    { f: T.hurry, tag: "พระเจ้ามังระ", head: "ต้องจบศึกให้เร็ว", color: RED },
    { f: T.one, tag: "ทั้งสองฝ่ายรู้", head: "ศึกใกล้จบแล้ว", color: GOLD },
    { f: T.someone, tag: "ในเมือง", head: "มีคนตัดสินใจบางอย่าง", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const { width, height } = useMap();
    const wet = interpolate(frame, [T.rain, T.rain + 20, T.inside, T.inside + 20], [0, 1, 1, 0], clamp);
    return (
      <>
        {wet > 0 && <rect width={width} height={height} fill="#1d3550" opacity={0.3 * wet} />}
        <FloodLayer at={P.ayut} radius={0.42} k={interpolate(frame, [T.flood, T.formula + 20, T.inside, T.inside + 20], [0, 1, 1, 0], clamp)} />
        <CityRing k={interpolate(frame, [T.siege, T.siege + 15, T.china, T.china + 20], [0, 1, 1, 0], clamp)} color={RED} />
        {frame >= T.sortie && frame < T.rain &&
          [0, 1, 2].map((i) => {
            const a = 0.6 + i * 2.1;
            const to: [number, number] = [P.ayut[0] + Math.cos(a) * 0.05, P.ayut[1] + Math.sin(a) * 0.035];
            return (
              <g key={i}>
                <g opacity={interpolate(frame, [T.lost, T.lost + 10], [1, 0], clamp)}><Arrow points={[P.ayut, to]} start={T.sortie + i * 8} end={T.sortie + 25 + i * 8} color={BLUE} width={14} /></g>
                <Arrow points={[to, P.ayut]} start={T.lost + i * 6} end={T.lost + 25 + i * 6} color={BLUE} width={10} variant="dashed" />
              </g>
            );
          })}
        {frame >= T.mound && frame < T.inside && <PointLabel at={[100.5, 14.42]} text="ค่ายบนที่ดอน" start={T.mound} color={RED} size={0.7} />}
        {frame >= T.fire && frame < T.bt + 10 && <PointLabel at={P.ayut} text="ไฟไหม้ในเมือง" start={T.fire} color="#ff8a2a" size={0.75} />}
        {frame >= T.china - 10 && frame < T.one + 20 && (
          <>
            <Glow f={CHINA} color="#b07ad9" k={interpolate(frame, [T.cn - 5, T.cn + 10], [0, 1], clamp)} />
            <Glow f={MYANMAR} color={RED} k={interpolate(frame, [T.cn, T.cn + 10], [0, 0.7], clamp)} />
            {[[[101.5, 25.5], [99.5, 24.5], [97.8, 23.7]], [[102, 23.5], [100.2, 22.6], [98.3, 22.3]]].map((pts, i) => (
              <Arrow key={i} points={pts as [number, number][]} start={T.cn + 10 + i * 8} end={T.cn + 40 + i * 8} color="#b07ad9" width={22} />
            ))}
            <PointLabel at={[96.08, 21.9]} text="อังวะ" start={T.cn} color={RED} size={0.7} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <WallView id="c5wall" start={T.siege} end={T.q2 + 14} />
      <SortieScene start={T.sortie} end={T.plan + 14} />
      <WallView id="c5wait" start={T.plan} end={T.rain + 14} sky={["#5a6676", "#aab6c0"]} />
      <WallView id="c5rain" start={T.rain} end={T.nomove + 14} sky={STORM} rain={1} />
      <Section2 start={T.how + 20} end={T.rice + 14} />
      <PaddyScene start={T.rice} end={T.cmp + 14} />
      <CompareScene start={T.cmp} end={T.inside + 14} />
      <CityInside start={T.inside} end={T.bt + 14} />
      <BurmaSide start={T.bt} end={T.china + 14} />
      <ChinaScene start={T.cn} end={T.one + 14} />
      <RiderScene start={T.someone - 10} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <QuizNews title="ถ้าคุณเป็นพระเจ้าเอกทัศ" question="จะทำยังไงดี?" options={["ยกทัพออกไปตีค่ายพม่า", "ใช้สูตรรอน้ำ"]} answer={1} start={T.q2show} reveal={T.pick} end={T.pick + 30} />
      <Stamp from={T.stay} to={T.how + 10} text="ไม่ถอย!" />
      <Stamp from={T.broken} to={T.inside} text="สูตรรอน้ำ ✕" />
      <Hourglass />
    </>
  ),
  sfx: [
    [T.siege, SFX.whoosh, 0.35],
    [T.ring, SFX.pop, 0.3],
    [T.q2show, SFX.riser, 0.25],
    [T.pick, SFX.hit, 0.45],
    [T.sortie, SFX.whoosh, 0.3],
    [T.lost, SFX.hit, 0.3],
    [T.rain, SFX.swell, 0.35],
    [T.flood, SFX.whoosh, 0.3],
    [T.stay, SFX.hit, 0.65],
    [T.how, SFX.riser, 0.3],
    [T.mound, SFX.pop, 0.3],
    [T.temple, SFX.pop, 0.3],
    [T.dry, SFX.hit, 0.4],
    [T.boats, SFX.pop, 0.3],
    [T.long, SFX.pop, 0.3],
    [T.broken, SFX.hit, 0.6],
    [T.fire, SFX.hit, 0.4],
    [T.sick, SFX.swell, 0.25],
    [T.cn, SFX.whoosh, 0.4],
    [T.hurry, SFX.tick, 0.35],
    [T.someone, SFX.riser, 0.3],
  ],
};
void SiamSoldier;
