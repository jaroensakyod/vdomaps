import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { B, clamp, font, GOLD, P, Panel, QuizNews, RED, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, CityWall, Fire, Smoke } from "./Period";
import { Rain, SiamSoldier, Townsperson, WallCannon } from "./Period2";
import { ThaiPalace } from "./Period3";
import { HorseGeneral, Palisade, StiltHouse } from "./Period4";
import { BigCannon, Buffalo, Furnace, Monk, Monument, PalmLeaf, SamutKhoi, Villager } from "./Period5";

// Chapter 4 "บางระจัน" (beats village → note).
const GREEN = "#3f8f4a";
const T = {
  village: B.village.start,
  gather: wf("village", "หลาย", 0.3),
  notArmy: wf("village", "ไม่ใช่", 0.66),
  farmers: wf("village", "ชาวนา", 0.88),
  leaders: B.leaders.start,
  monk: wf("leaders", "พระ", 0.03),
  heads: wf("leaders", "หัวหน้า", 0.27),
  taen: wf("leaders", "แท่น", 0.35),
  in: wf("leaders", "อิน", 0.42),
  mueang: wf("leaders", "เมือง", 0.5),
  chan: wf("leaders", "จัน", 0.6),
  joke: wf("leaders", "ชื่อ", 0.72),
  fight: B.fight.start,
  dig: wf("fight", "ขุด", 0.25),
  beat: wf("fight", "ตี", 0.48),
  quiz: B.quiz1.start,
  ask: wf("quiz1", "ขอ", 0.24),
  guess: wf("quiz1", "ลอง", 0.6),
  ans: B.quiz1a.start,
  no: wf("quiz1a", "ไม่", 0.18),
  fear: wf("quiz1a", "กลัว", 0.42),
  cast: B.cast.start,
  crack: wf("cast", "ร้าว", 0.76),
  hard: wf("cast", "แต่", 0.37),
  fall: B.fall.start,
  falls: wf("fall", "ก่อน", 0.66),
  note: B.note.start,
  burmese: wf("note", "ฝั่ง", 0.31),
  remember: wf("note", "แต่", 0.59),
};
const END = B.siege.start;

const BANG: [number, number] = [100.33, 14.9]; // approximate
const VILLAGES: [number, number][] = [[100.1, 15.1], [100.55, 15.15], [100.15, 14.7], [100.6, 14.75], [100.35, 15.25]];
const V4 = { bang: bbox([[100.14, 14.66], [100.72, 15.14]]) };
const DAY: [string, string] = ["#6fa3c9", "#e6f0d0"];

const VillageWalls = ({ g }: { g: { x: number; W: number; ground: number; s: number } }) => (
  <>
    <StiltHouse x={g.x + g.W * 0.12} y={g.ground - 40 * g.s} s={g.s * 0.7} />
    <StiltHouse x={g.x + g.W * 0.88} y={g.ground - 44 * g.s} s={g.s * 0.7} flip />
    <Palisade x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} y={g.ground - 12 * g.s} s={g.s * 0.9} />
  </>
);

// Families arriving with bundles and carts.
const RefugeeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4ref" anchor={BANG} start={start} end={end} sky={DAY} accent={GREEN}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7d9a4f" />
            <StiltHouse x={g.x + g.W * 0.85} y={g.ground - 40 * g.s} s={g.s * 0.8} />
            {[0, 1, 2, 3, 4].map((i) => <Townsperson key={i} x={g.x + g.W * (0.05 + i * 0.12 + m * 0.18)} y={g.ground + 8 * g.s} scale={g.sc * 0.8} load={i % 2 === 0} woman={i === 1 || i === 4} cloth={["#7a2f4a", "#3f6a3a", "#2f4f6b", "#b5532e", "#6b5a44"][i]} phase={i} />)}
            <Buffalo x={g.x + g.W * (0.7 + m * 0.05)} y={g.ground + 6 * g.s} scale={g.sc * 0.7} />
          </g>
        );
      }}
    </Panel>
  );
};

// "ชาวนาธรรมดา": farmers with hoes and sickles, a buffalo in the paddy.
const FarmerScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4farm" anchor={BANG} start={start} end={end} sky={DAY} accent={GREEN}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8fb05a" />
        {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${g.x + (i / 30) * g.W} ${g.ground - 26 * g.s} l${4 * g.s} ${-18 * g.s} M${g.x + (i / 30) * g.W + 6 * g.s} ${g.ground - 26 * g.s} l${-2 * g.s} ${-16 * g.s}`} stroke="#4f8a3a" strokeWidth={2 * g.s} />)}
        <Villager x={g.x + g.W * 0.2} y={g.ground + 6 * g.s} scale={g.sc * 0.9} hold="hoe" band="#c9a03c" />
        <Villager x={g.x + g.W * 0.4} y={g.ground + 6 * g.s} scale={g.sc * 0.9} hold="sickle" band="#c9a03c" phase={2} />
        <Buffalo x={g.x + g.W * 0.72} y={g.ground + 4 * g.s} scale={g.sc * 0.8} flip />
      </g>
    )}
  </Panel>
);

// The monk Thammachot blessing the villagers under a bodhi tree.
const MonkScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4monk" anchor={BANG} start={start} end={end} sky={["#e9b46a", "#fbe7c2"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
        <rect x={g.x + g.W * 0.32} y={g.ground - 210 * g.s} width={22 * g.s} height={190 * g.s} fill="#6b4a2b" />
        <ellipse cx={g.x + g.W * 0.33} cy={g.ground - 220 * g.s} rx={150 * g.s} ry={70 * g.s} fill="#3f6a3a" />
        <Monk x={g.x + g.W * 0.33} y={g.ground - 4 * g.s} scale={g.sc * 1.1} />
        {[0.55, 0.66, 0.77, 0.88].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="none" flip phase={i} />)}
      </g>
    )}
  </Panel>
);

// The four leaders appear on their names; the last one with a fierce moustache, zoomed on the joke.
const LeadersScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4lead" anchor={BANG} start={start} end={end} sky={["#7d5a3a", "#e6b77a"]} accent={GREEN}>
      {(g) => {
        const names: [number, string, boolean][] = [[T.taen, "นายแท่น", false], [T.in, "นายอิน", false], [T.mueang, "นายเมือง", false], [T.chan, "นายจันหนวดเขี้ยว", true]];
        const zoom = interpolate(frame, [T.joke, T.joke + 15], [1, 1.9], clamp);
        const fx = g.x + g.W * 0.84;
        return (
          <g transform={`translate(${fx},${g.ground}) scale(${zoom}) translate(${-fx},${-g.ground})`}>
            <rect x={g.x - g.W} y={g.ground - 20 * g.s} width={g.W * 3} height={g.H * 2} fill="#8a6a42" />
            {names.map(([f, n, m], i) => {
              const k = interpolate(frame, [f, f + 8], [0, 1], clamp);
              const x = g.x + g.W * (0.14 + i * 0.235);
              return k <= 0 ? null : (
                <g key={n} opacity={k} transform={`translate(0,${(1 - k) * 20 * g.s})`}>
                  <Villager x={x} y={g.ground + 4 * g.s} scale={g.sc * (m ? 1.05 : 0.95)} hold={["spear", "sword", "spear", "sword"][i] as "spear" | "sword"} mustache={m} phase={i} />
                  <rect x={x - 70 * g.s} y={g.ground + 12 * g.s} width={140 * g.s} height={36 * g.s} rx={8 * g.s} fill={GREEN} />
                  <text x={x} y={g.ground + 38 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={(m ? 20 : 24) * g.s} fill="#fff">{n}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Digging the moat and raising the stockade.
const DigScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4dig" anchor={BANG} start={start} end={end} sky={DAY} accent={GREEN}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a6a42" />
        <path d={`M${g.x} ${g.ground + 10 * g.s} Q${g.cx} ${g.ground + 60 * g.s} ${g.x + g.W} ${g.ground + 10 * g.s}`} fill="#5a4030" />
        <Palisade x0={g.x + g.W * 0.55} x1={g.x + g.W + 10 * g.s} y={g.ground - 12 * g.s} s={g.s * 0.9} />
        {[0.12, 0.26, 0.4].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="hoe" pose="dig" phase={i * 1.7} />)}
      </g>
    )}
  </Panel>
);

// Villagers charge, Burmese soldiers flee.
const ChargeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4charge" anchor={BANG} start={start} end={end} sky={["#c8461f", "#f2b35e"]} accent={GREEN}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a6a42" />
            <Palisade x0={g.x - 10 * g.s} x1={g.x + g.W * 0.25} y={g.ground - 12 * g.s} s={g.s * 0.9} />
            {[0, 1, 2, 3].map((i) => <Villager key={i} x={g.x + g.W * (0.18 + i * 0.09 + m * 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold={i % 2 ? "sword" : "spear"} pose="charge" mustache={i === 3} phase={i} />)}
            {[0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.68 + i * 0.1 + m * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="spear" phase={i * 2} />)}
            <Smoke x={g.x + g.W * 0.6} y={g.ground - 40 * g.s} size={120 * g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// A rider sent to the capital for cannon.
const MessengerScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4msg" anchor={P.ayut} start={start} end={end} sky={DAY} accent={GREEN}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
            <CityWall x0={g.x + g.W * 0.7} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} />
            <HorseGeneral x={g.x + g.W * (0.1 + m * 0.45)} y={g.ground + 4 * g.s} scale={g.sc * 0.75} gallop banner={GREEN} coat="#3f6a3a" />
          </g>
        );
      }}
    </Panel>
  );
};

// "ไม่ให้": the court says no — palace with an official turning the messenger away.
const RefuseScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4no" anchor={P.ayut} start={start} end={end} sky={["#3a6ea5", "#bfe0f2"]} accent={RED}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#c9b48a" />
        <ThaiPalace x={g.x + g.W * 0.7} y={g.ground - 6 * g.s} s={g.s * 0.65} />
        <SiamSoldier x={g.x + g.W * 0.45} y={g.ground + 6 * g.s} scale={g.sc * 0.9} hold="spear" flip />
        <Villager x={g.x + g.W * 0.2} y={g.ground + 6 * g.s} scale={g.sc * 0.9} hold="none" />
        <text x={g.x + g.W * 0.45} y={g.y + 110 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70 * g.s} fill={RED}>✕</text>
      </g>
    )}
  </Panel>
);

// The fear: Burmese soldiers turning a captured cannon on the city.
const FearScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4fear" anchor={P.ayut} start={start} end={end} sky={["#4a3a4a", "#b07a6a"]} accent={RED}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a6a4a" />
          <CityWall x0={g.x + g.W * 0.72} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} />
          <WallCannon x={g.x + g.W * 0.42} y={g.ground - 4 * g.s} s={g.sc * 1.6} fire={((frame - start) % 60) / 18} />
          {[0.18, 0.28].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.9} pose="stand" hold={i ? "torch" : "spear"} phase={i} />)}
          <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#fff">ถ้าค่ายแตก…</text>
        </g>
      )}
    </Panel>
  );
};

// Casting their own cannon; then it cracks.
const CastScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4cast" anchor={BANG} start={start} end={end} sky={["#5a3a2a", "#c8763a"]} accent={GREEN}>
      {(g) => {
        const cracked = frame >= T.crack;
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4030" />
            {!cracked ? (
              <>
                <Furnace x={g.x + g.W * 0.25} y={g.ground} s={g.s * 1.1} pour={interpolate(frame, [start + 10, start + 50], [0, 1], clamp)} />
                {[0.7, 0.82].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="none" flip phase={i} />)}
              </>
            ) : (
              <>
                <BigCannon x={g.x + g.W * 0.42} y={g.ground} s={g.s * 1.2} crack={interpolate(frame, [T.crack, T.crack + 10], [0, 1], clamp)} puff={interpolate(frame, [T.crack, T.crack + 30], [0, 1], clamp)} />
                {[0.75, 0.87].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="none" flip phase={i} />)}
              </>
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// Five months: rain and sun over the stockade, worn defenders; then it burns.
const HoldScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4hold" anchor={BANG} start={start} end={end} sky={frame >= T.falls ? ["#2a1a1a", "#c8461f"] : ["#4a5866", "#9aa8b4"]} accent={GREEN}>
      {(g) => {
        const burn = interpolate(frame, [T.falls, T.falls + 20], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f6a4a" />
            <VillageWalls g={g} />
            {burn > 0 && [0.2, 0.45, 0.7, 0.9].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - 60 * g.s} size={90 * g.s * burn} seed={i} />)}
            {burn > 0 && [0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.3 + i * 0.15)} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="torch" phase={i} />)}
            {burn === 0 && [0.3, 0.5].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.85} hold="spear" phase={i} />)}
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={1 - burn} />
          </g>
        );
      }}
    </Panel>
  );
};

// Thai chronicle (folding book) vs the near-blank Burmese record.
const ChronicleScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4book" anchor={BANG} start={start} end={end} sky={["#3a2a1a", "#7a5a3a"]} accent={GOLD}>
      {(g) => (
        <g>
          {frame < T.burmese ? (
            <>
              <SamutKhoi x={g.cx} y={g.ground - 10 * g.s} s={g.s * 1.3} k={interpolate(frame, [start, T.burmese], [0, 1], clamp)} />
              <text x={g.cx} y={g.y + 90 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34 * g.s} fill="#fff">พงศาวดารไทย</text>
            </>
          ) : (
            <>
              <PalmLeaf x={g.cx} y={g.ground - 30 * g.s} s={g.s * 1.3} />
              <text x={g.cx} y={g.y + 90 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34 * g.s} fill="#fff">บันทึกพม่า: แทบไม่พูดถึง</text>
              <text x={g.cx + 160 * g.s} y={g.ground - 30 * g.s} fontFamily={font} fontWeight={900} fontSize={90 * g.s} fill={GOLD}>?</text>
            </>
          )}
        </g>
      )}
    </Panel>
  );
};

const MemorialScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4mem" anchor={BANG} start={start} end={end} sky={["#3a6ea5", "#bfe0f2"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7d9a4f" />
        <Monument x={g.cx} y={g.ground} s={g.s * 1.1} />
      </g>
    )}
  </Panel>
);

export const ch4: Chapter = {
  name: "บางระจัน",
  from: B.village.start,
  to: END,
  cams: (w, h) => [
    { frame: T.village, cam: view(V4.bang, w, h, 1) },
    { frame: T.quiz, cam: view(V4.bang, w, h, 1) },
    { frame: T.quiz + 35, cam: view(V.central, w, h, 1.6) },
    { frame: T.cast, cam: view(V.central, w, h, 1.6) },
    { frame: T.cast + 35, cam: view(V4.bang, w, h, 1.1) },
  ],
  years: [[T.village, "2309"]],
  heads: [
    { f: T.village, tag: "เมืองสิงห์บุรี", head: "บ้านบางระจัน", color: GREEN },
    { f: T.gather, tag: "หนีพม่ามารวมกัน", head: "ชาวบ้านหลายหมู่บ้าน", color: GREEN },
    { f: T.notArmy, tag: "ไม่ใช่ทหารหลวง", head: "ชาวนาธรรมดา", color: GREEN },
    { f: T.leaders, tag: "ที่พึ่งทางใจ", head: "พระอาจารย์ธรรมโชติ", color: GOLD },
    { f: T.heads, tag: "ผู้นำบางระจัน", head: "หัวหน้าชาวบ้าน", color: GREEN, chips: [{ text: "นายแท่น", f: T.taen }, { text: "นายอิน", f: T.in }, { text: "นายเมือง", f: T.mueang }, { text: "นายจันหนวดเขี้ยว", f: T.chan }] },
    { f: T.fight, tag: "ตั้งค่าย ขุดคู", head: "เตรียมรับศึก", color: GREEN },
    { f: T.beat, tag: "ตีทัพพม่าแตก", head: "หลายครั้ง", stat: (f) => `${Math.min(3, Math.max(1, Math.floor((f - T.beat) / 25) + 1))} ครั้ง`, color: GREEN },
    { f: T.quiz, tag: "ชาวบ้านขอ", head: "ปืนใหญ่จากกรุงฯ", color: GREEN },
    { f: T.ans, tag: "คำตอบ", head: "ไม่ให้", color: RED },
    { f: T.fear, tag: "เพราะกลัวว่า", head: "พม่าจะเอาไปยิงกรุง", color: RED },
    { f: T.cast, tag: "ไม่มีก็ทำเอง", head: "หล่อปืนใหญ่เอง", color: GREEN },
    { f: T.crack, tag: "หล่อครั้งแรก", head: "ปืนร้าว ใช้ไม่ได้", color: RED },
    { f: T.fall, tag: "ยืนหยัด", head: "บางระจัน", stat: (f) => `${Math.min(5, Math.max(1, Math.ceil((f - T.fall) / 12)))} เดือน`, color: GREEN },
    { f: T.falls, tag: "ในที่สุด", head: "ค่ายบางระจันแตก", color: RED },
    { f: T.note, tag: "ที่มาของเรื่อง", head: "พงศาวดารไทย", color: GOLD },
    { f: T.burmese, tag: "ฝั่งพม่า", head: "แทบไม่บันทึกไว้", color: GOLD },
    { f: T.remember, tag: "แต่สำหรับคนไทย", head: "เรื่องที่จำได้มากที่สุด", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame >= T.gather && frame < T.leaders && VILLAGES.map((v, i) => <Arrow key={i} points={[v, BANG]} start={T.gather + i * 5} end={T.gather + 25 + i * 5} color={GREEN} width={12} />)}
        {frame < T.quiz + 20 && <PointLabel at={BANG} text="บ้านบางระจัน" start={T.village} color={GREEN} size={0.85} />}
        {frame >= T.beat && frame < T.quiz &&
          [0, 1, 2].map((i) => {
            const a = 2.6 + i * 0.8;
            const from: [number, number] = [BANG[0] + Math.cos(a) * 0.2, BANG[1] + Math.sin(a) * 0.15];
            const to: [number, number] = [BANG[0] + Math.cos(a) * 0.05, BANG[1] + Math.sin(a) * 0.04];
            const f = T.beat + i * 25;
            return (
              <g key={i}>
                <g opacity={interpolate(frame, [f + 18, f + 24], [1, 0], clamp)}><Arrow points={[from, to]} start={f} end={f + 15} color={RED} width={16} /></g>
                <Arrow points={[to, from]} start={f + 18} end={f + 30} color={RED} width={10} variant="dashed" />
              </g>
            );
          })}
        {frame >= T.ask && frame < T.cast && (
          <>
            <Arrow points={[BANG, [100.45, 14.62], P.ayut]} start={T.ask} end={T.ask + 30} color={GREEN} width={12} variant="dashed" />
            <PointLabel at={P.ayut} text="กรุงศรีอยุธยา" start={T.ask + 20} color={GOLD} size={0.75} />
            <PointLabel at={BANG} text="บางระจัน" start={T.ask} color={GREEN} size={0.7} />
          </>
        )}
        {frame >= T.falls && frame < END + 10 && <PointLabel at={BANG} text="ค่ายแตก" start={T.falls} color={RED} size={0.85} />}
      </>
    );
  },
  Panels: () => (
    <>
      <RefugeeScene start={T.gather} end={T.notArmy + 14} />
      <FarmerScene start={T.notArmy} end={T.leaders + 14} />
      <MonkScene start={T.leaders} end={T.heads + 14} />
      <LeadersScene start={T.heads} end={T.fight + 14} />
      <DigScene start={T.fight} end={T.beat + 14} />
      <ChargeScene start={T.beat} end={T.quiz + 14} />
      <MessengerScene start={T.quiz} end={T.guess + 14} />
      <RefuseScene start={T.no} end={T.fear + 14} />
      <FearScene start={T.fear} end={T.cast + 14} />
      <CastScene start={T.cast} end={T.fall + 14} />
      <HoldScene start={T.fall} end={T.note + 14} />
      <ChronicleScene start={T.note} end={T.remember + 14} />
      <MemorialScene start={T.remember} end={END + 14} />
    </>
  ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="ราชสำนักจะให้ปืนใหญ่ไหม?" options={["ให้", "ไม่ให้"]} answer={1} start={T.guess} reveal={T.no} end={T.no + 40} />,
  sfx: [
    [T.village, SFX.pop, 0.35],
    [T.gather, SFX.whoosh, 0.3],
    [T.leaders, SFX.swell, 0.25],
    [T.taen, SFX.pop, 0.3],
    [T.in, SFX.pop, 0.3],
    [T.mueang, SFX.pop, 0.3],
    [T.chan, SFX.hit, 0.4],
    [T.beat, SFX.hit, 0.4],
    [T.beat + 25, SFX.hit, 0.35],
    [T.beat + 50, SFX.hit, 0.35],
    [T.ask, SFX.whoosh, 0.3],
    [T.guess, SFX.riser, 0.3],
    [T.guess + 30, SFX.tick, 0.35],
    [T.guess + 60, SFX.tick, 0.35],
    [T.no, SFX.hit, 0.55],
    [T.crack, SFX.hit, 0.5],
    [T.falls, SFX.hit, 0.55],
    [T.note, SFX.pop, 0.3],
    [T.remember, SFX.swell, 0.3],
  ],
};
void V;
void Townsperson;
