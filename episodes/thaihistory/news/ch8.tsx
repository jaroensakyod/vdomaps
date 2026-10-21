import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { RuinScene } from "./ch0";
import { RingScene } from "./ch3";
import { CompareScene, RiderScene } from "./ch5";
import { B, BLUE, CityRing, clamp, font, GOLD, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BellChedi, BurmeseSoldier, CityWall, Dust, Fire, Moon, SiegeCamp, Smoke } from "./Period";
import { Rain, Sampan, SiamSoldier, Townsperson, WaterBand } from "./Period2";
import { Parasol, Royal } from "./Period3";
import { HorseGeneral, Mountains, StiltHouse } from "./Period4";
import { RuinedPrang } from "./Period";

// Chapter 8 "คำตอบ และสิ่งที่ตามมา" (beats answer → poll).
const INK = "#1b1d24";
const TAK = "#d39a1c";
const T = {
  answer: B.answer.start,
  notOne: wf("answer", "คำ", 0.33, 0),
  a1: wf("answer", "พม่า", 0.48),
  a2: wf("answer", "ตั้ง", 0.72),
  a3: wf("answer", "ล้อม", 0.88),
  ans2: B.answer2.start,
  since: wf("answer2", "แต่", 0.43),
  leave: B.leave.start,
  suki: wf("leave", "เหลือ", 0.58),
  chan: B.chanthaburi.start,
  saying: wf("chanthaburi", "มี", 0.7),
  pots: B.pots.start,
  win: B.win.start,
  smash: wf("win", "ทุบ", 0.12),
  noFood: wf("win", "ไม่", 0.42),
  fell: wf("win", "คืน", 0.76),
  ret: B.return.start,
  ships: wf("return", "เรือ", 0.22),
  sail: wf("return", "ยก", 0.42),
  seven: wf("return", "เพียง", 0.83),
  thon: B.thonburi.start,
  newCap: wf("thonburi", "ตั้ง", 0.36),
  crown: wf("thonburi", "ปลาย", 0.68),
  today: B.today.start,
  brick: wf("today", "เจดีย์", 0.22),
  head: wf("today", "วัด", 0.5),
  unsure: wf("today", "จน", 0.79),
  poll: B.poll.start,
  stay: wf("poll", "อยู่", 0.62, 0),
  go: wf("poll", "ตี", 0.78),
  comment: wf("poll", "พิมพ์", 0.97),
};
const END = B.poll.end + 45;

const CHAN: [number, number] = [102.1, 12.61];
const POSAMTON: [number, number] = [100.545, 14.3]; // approximate
const THON: [number, number] = [100.49, 13.74];
const FLEET: [number, number][] = [[102.0, 12.45], [101.3, 12.55], [100.85, 12.9], [100.58, 13.45], [100.52, 13.9], POSAMTON];
const V8 = {
  east: bbox([[100.3, 12.2], [102.5, 14.6]]),
  region: bbox([[94.5, 12], [104, 24]]),
  thon: bbox([[100.25, 13.55], [100.8, 14.5]]),
};
const NIGHT: [string, string] = ["#0b1230", "#2a3a6a"];

// ③ of the answer: hunger — empty jars and a queue.
const HungerScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c8hunger" anchor={P.ayut} start={start} end={end} sky={["#8a8a7a", "#d9d2bc"]} accent={GOLD}>
    {(g) => (
      <g>
        <Skyline g={g} color="#6b5a4a" base={120} />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a08a6a" />
        {[0.12, 0.2, 0.28].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 18 * g.s} ${g.ground} q${-6 * g.s} ${-40 * g.s} ${18 * g.s} ${-46 * g.s} q${24 * g.s} ${6 * g.s} ${18 * g.s} ${46 * g.s} Z`} fill="#8a5a32" stroke={INK} strokeWidth={1.2 * g.s} />)}
        {[0.5, 0.6, 0.7, 0.8].map((fx, i) => <Townsperson key={i} x={g.x + g.W * fx} y={g.ground + 8 * g.s} scale={g.sc * 0.75} walk={false} flip woman={i % 2 === 1} cloth="#6b5a44" />)}
      </g>
    )}
  </Panel>
);

// The wall that gave way (night), and the shut gate of the old formula, cracked.
const GaveWay = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c8gave" anchor={P.huaro} start={start} end={end} sky={NIGHT} accent={GOLD}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.82} y={g.y + 80 * g.s} r={26 * g.s} />
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={95 * g.s} s={g.s} breach={1} bx={g.cx} />
      </g>
    )}
  </Panel>
);

const OldFormulaBroken = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c8formula" anchor={P.ayut} start={start} end={end} sky={["#4a5866", "#9aa8b4"]} accent={RED}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#7a6a4a" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={120 * g.s} s={g.s} />
        <rect x={g.cx - 50 * g.s} y={g.ground - 90 * g.s} width={100 * g.s} height={90 * g.s} fill="#8a4a24" stroke={INK} strokeWidth={1.4 * g.s} />
        <path d={`M${g.cx + 20 * g.s} ${g.ground - 120 * g.s} l${-20 * g.s} ${40 * g.s} l${24 * g.s} ${30 * g.s} l${-16 * g.s} ${50 * g.s}`} stroke={INK} strokeWidth={5 * g.s} fill="none" />
        <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
      </g>
    )}
  </Panel>
);

// Burmese army marching home; then Suki's lone camp at Pho Sam Ton.
const HomeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8home" anchor={[97.5, 18]} start={start} end={end} sky={["#e98b3a", "#f8d9a0"]}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return frame < T.suki ? (
          <g>
            <Mountains x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} h={120} seed="home" />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
            {[0, 1, 2, 3, 4].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.9 - i * 0.14 - m * 0.2)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" flip phase={i} />)}
          </g>
        ) : (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7d8a5a" />
            <SiegeCamp x={g.x + g.W * 0.4} y={g.ground} s={g.s * 0.9} w={260} />
            <HorseGeneral x={g.x + g.W * 0.78} y={g.ground + 6 * g.s} scale={g.sc * 0.8} flip />
          </g>
        );
      }}
    </Panel>
  );
};

// Chanthaburi at night: walls, Taksin's men camped outside by the fires.
const ChanScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c8chan" anchor={CHAN} start={start} end={end} sky={NIGHT} accent={GOLD}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.15} y={g.y + 80 * g.s} r={26 * g.s} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x + g.W * 0.55} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} />
        <Fire x={g.x + g.W * 0.25} y={g.ground - 6 * g.s} size={50 * g.s} seed={1} />
        {[0.12, 0.36, 0.44].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" jacket="#5a4a2a" phase={i} />)}
        <HorseGeneral x={g.x + g.W * 0.3} y={g.ground + 4 * g.s} scale={g.sc * 0.7} banner={TAK} coat={TAK} />
      </g>
    )}
  </Panel>
);

// Smashing the rice pots by the fire.
const PotScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8pots" anchor={CHAN} start={start} end={end} sky={NIGHT} accent={GOLD}>
      {(g) => {
        const smash = interpolate(frame, [T.smash, T.smash + 10], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2016" />
            <Fire x={g.cx} y={g.ground - 4 * g.s} size={70 * g.s} seed={2} />
            {[0.25, 0.4, 0.62, 0.78].map((fx, i) => {
              const px = g.x + g.W * fx;
              const k = smash * (i % 2 ? 1 : 0.8);
              return (
                <g key={i}>
                  <g transform={`translate(${px - k * 14 * g.s},${g.ground}) rotate(${-k * 25})`}><path d={`M0 0 L${-24 * g.s} 0 Q${-34 * g.s} ${-20 * g.s} ${-24 * g.s} ${-40 * g.s} L0 ${-44 * g.s} Z`} fill="#9b5a33" stroke={INK} strokeWidth={1.4 * g.s} /></g>
                  <g transform={`translate(${px + k * 14 * g.s},${g.ground}) rotate(${k * 25})`}><path d={`M0 0 L${24 * g.s} 0 Q${34 * g.s} ${-20 * g.s} ${24 * g.s} ${-40 * g.s} L0 ${-44 * g.s} Z`} fill="#a8653b" stroke={INK} strokeWidth={1.4 * g.s} /></g>
                </g>
              );
            })}
            {[0.15, 0.88].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" jacket="#5a4a2a" flip={fx > 0.5} phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Assault on Chanthaburi's gate.
const AssaultScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8assault" anchor={CHAN} start={start} end={end} sky={["#1a1030", "#8a2f1a"]} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2016" />
            <CityWall x0={g.x + g.W * 0.6} x1={g.x + g.W + 10 * g.s} ground={g.ground - 10 * g.s} h={110 * g.s} s={g.s} breach={interpolate(frame, [T.fell, T.fell + 15], [0, 1], clamp)} bx={g.x + g.W * 0.72} />
            <Dust x={g.x + g.W * 0.72} y={g.ground} s={g.s} k={interpolate(frame, [T.fell, T.fell + 25], [0, 1], clamp)} />
            {[0, 1, 2, 3].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.08 + i * 0.1 + m * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "gun" : "spear"} walk jacket="#5a4a2a" phase={i} />)}
            <HorseGeneral x={g.x + g.W * (0.05 + m * 0.3)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} banner={TAK} coat={TAK} gallop />
          </g>
        );
      }}
    </Panel>
  );
};

// Building boats on the beach, then the fleet at sea.
const ShipyardScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8yard" anchor={CHAN} start={start} end={end} sky={["#4fa3d4", "#d8eef6"]} accent={GOLD}>
      {(g) => {
        const sail = frame >= T.sail;
        const m = interpolate(frame, [T.sail, end], [0, 1], clamp);
        return (
          <g>
            <WaterBand x={g.x} y={g.ground - 60 * g.s} W={g.W} H={g.H} s={g.s} color="#3d8fc4" />
            {!sail ? (
              <>
                <path d={`M${g.x} ${g.ground - 20 * g.s} L${g.x + g.W} ${g.ground - 10 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#e9d8a6" />
                <path d={`M${g.cx - 120 * g.s} ${g.ground - 40 * g.s} Q${g.cx} ${g.ground + 10 * g.s} ${g.cx + 130 * g.s} ${g.ground - 46 * g.s}`} fill="none" stroke="#7a4a28" strokeWidth={14 * g.s} />
                {Array.from({ length: 8 }, (_, i) => <line key={i} x1={g.cx - 100 * g.s + i * 30 * g.s} y1={g.ground - 36 * g.s} x2={g.cx - 104 * g.s + i * 30 * g.s} y2={g.ground - 80 * g.s} stroke="#7a4a28" strokeWidth={4 * g.s} />)}
                {[0.2, 0.8].map((fx, i) => <Townsperson key={i} x={g.x + g.W * fx} y={g.ground - 14 * g.s} scale={g.sc * 0.75} walk={false} flip={fx > 0.5} cloth="#5a4a2a" />)}
              </>
            ) : (
              [0, 1, 2, 3].map((i) => <Sampan key={i} x={g.x + g.W * (0.1 + i * 0.22 + m * 0.1)} y={g.ground - 40 * g.s + (i % 2) * 18 * g.s} scale={g.sc * 0.8} people={2} phase={i} flip />)
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// Thonburi: a new city on the river near the sea; the coronation (small figure under parasols).
const ThonScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8thon" anchor={THON} start={start} end={end} sky={frame >= T.crown ? ["#c98a2a", "#fbe3a0"] : ["#4fa3d4", "#d8eef6"]} accent={GOLD}>
      {(g) =>
        frame < T.crown ? (
          <g>
            <Skyline g={{ x: g.x + g.W * 0.2, W: g.W * 0.6, ground: g.ground, s: g.s * 0.8 }} color="#7a5a40" gold base={110} />
            <CityWall x0={g.x + g.W * 0.15} x1={g.x + g.W * 0.85} ground={g.ground - 30 * g.s} h={70 * g.s} s={g.s} />
            <WaterBand x={g.x} y={g.ground - 26 * g.s} W={g.W} H={g.H} s={g.s} />
            <Sampan x={g.x + g.W * 0.2} y={g.ground + 4 * g.s} scale={g.sc * 0.7} cargo people={2} />
            <Sampan x={g.x + g.W * 0.75} y={g.ground + 20 * g.s} scale={g.sc * 0.7} flip phase={2} />
          </g>
        ) : (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a3324" />
            <Royal x={g.cx} y={g.ground - 4 * g.s} scale={g.sc * 0.9} pose="sit" robe="#e2b84a" />
            <Parasol x={g.cx - 80 * g.s} y={g.ground} s={g.s} tiers={7} />
            <Parasol x={g.cx + 80 * g.s} y={g.ground} s={g.s} tiers={7} />
            {[0.12, 0.88].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" flip={fx > 0.5} />)}
          </g>
        )
      }
    </Panel>
  );
};

// Ayutthaya today: gold chedi → brick ruin with visitors; then the Buddha head in the tree roots.
const TodayScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8today" anchor={P.ayut} start={start} end={end} sky={["#4fa3d4", "#d8eef6"]} accent={BLUE}>
      {(g) => {
        const brick = interpolate(frame, [T.brick, T.brick + 25], [0, 1], clamp);
        return frame < T.head ? (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7d9a4f" />
            <g opacity={1 - brick}><BellChedi x={g.x + g.W * 0.3} y={g.ground - 4 * g.s} h={230 * g.s} color="#e2b84a" /></g>
            <g opacity={brick}><BellChedi x={g.x + g.W * 0.3} y={g.ground - 4 * g.s} h={230 * g.s} color="#b0623f" /></g>
            <RuinedPrang x={g.x + g.W * 0.68} y={g.ground} h={200 * g.s} s={g.s} />
            {[0.5, 0.86].map((fx, i) => <Townsperson key={i} x={g.x + g.W * fx} y={g.ground + 8 * g.s} scale={g.sc * 0.7} shirt={i ? "#e4572e" : "#3e7cb1"} cloth="#2f3b55" phase={i} />)}
          </g>
        ) : (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3f6a3a" />
            <rect x={g.cx - 30 * g.s} y={g.y} width={60 * g.s} height={g.H} fill="#6b5a3a" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${g.cx + (i - 4) * 20 * g.s} ${g.y + 40 * g.s} Q${g.cx + (i - 4) * 50 * g.s} ${g.ground - 120 * g.s} ${g.cx + (i - 4) * 70 * g.s} ${g.ground}`} stroke="#6b5a3a" strokeWidth={14 * g.s} fill="none" strokeLinecap="round" />)}
            <ellipse cx={g.cx} cy={g.ground - 110 * g.s} rx={52 * g.s} ry={62 * g.s} fill="#9a8a6a" stroke={INK} strokeWidth={2 * g.s} />
            <path d={`M${g.cx - 30 * g.s} ${g.ground - 120 * g.s} q${12 * g.s} ${-6 * g.s} ${22 * g.s} 0 M${g.cx + 8 * g.s} ${g.ground - 120 * g.s} q${12 * g.s} ${-6 * g.s} ${22 * g.s} 0`} stroke={INK} strokeWidth={2.4 * g.s} fill="none" />
            <path d={`M${g.cx - 10 * g.s} ${g.ground - 84 * g.s} q${10 * g.s} ${6 * g.s} ${20 * g.s} 0`} stroke={INK} strokeWidth={2.4 * g.s} fill="none" />
            {Array.from({ length: 5 }, (_, i) => <path key={`r${i}`} d={`M${g.cx - 60 * g.s + i * 30 * g.s} ${g.ground - 150 * g.s} Q${g.cx - 40 * g.s + i * 20 * g.s} ${g.ground - 110 * g.s} ${g.cx - 50 * g.s + i * 28 * g.s} ${g.ground - 50 * g.s}`} stroke="#5a4a2a" strokeWidth={8 * g.s} fill="none" />)}
            {frame >= T.unsure && <text x={g.x + g.W - 70 * g.s} y={g.y + 130 * g.s} textAnchor="middle" fill={GOLD} fontFamily={font} fontWeight={900} fontSize={110 * g.s}>?</text>}
          </g>
        );
      }}
    </Panel>
  );
};

// The chronicle quote, revealed in step with Phraya Tak's voice.
const QuoteReveal = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const from = T.saying;
  const to = T.win + 10;
  if (frame < from || frame > to) return null;
  const words = (B.pots.words ?? []) as { w: string; s: number }[];
  const text = "ในเพลากลางคืนวันนี้ตีเอาเมืองจันทบูรให้ได้ ไปหาข้าวกินเช้าเอาในเมือง ถ้ามิได้ก็ให้ตายเสียด้วยกันเถิด";
  const spoken = words.filter((w) => B.pots.start + w.s * 30 <= frame).map((w) => w.w).join("").length;
  const total = words.map((w) => w.w).join("").length || 1;
  const shown = frame < B.pots.start ? 0 : Math.round((spoken / total) * text.length);
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, opacity: interpolate(frame, [to - 8, to], [1, 0], clamp), transform: `scale(${0.9 + 0.1 * k})`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${TAK}`, borderRadius: 18 * s, padding: `${20 * s}px ${30 * s}px`, lineHeight: 1.45 }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700, color: TAK }}>พระยาตาก · พระราชพงศาวดารกรุงธนบุรี</div>
      <div style={{ fontSize: 44 * s, fontWeight: 900, marginTop: 6 * s }}>
        “<span>{text.slice(0, shown)}</span>
        <span style={{ opacity: 0.25 }}>{text.slice(shown)}</span>”
      </div>
    </div>
  );
};

// Closing poll.
const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.poll + 60) return null;
  const k = spring({ frame: frame - T.poll - 60, fps, config: { damping: 14 } });
  const opt = (t: string, f: number, c: string) => {
    const on = frame >= f;
    const kk = spring({ frame: frame - f, fps, config: { damping: 10 } });
    return (
      <div style={{ flex: 1, border: `${4 * s}px solid ${c}`, borderRadius: 14 * s, padding: `${18 * s}px ${10 * s}px`, textAlign: "center", fontSize: 40 * s, fontWeight: 900, background: on ? c : "rgba(255,255,255,0.08)", transform: `scale(${on ? 1 + 0.06 * (1 - Math.min(1, kk)) + 0.02 : 1})` }}>{t}</div>
    );
  };
  const btn = spring({ frame: frame - T.comment, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${22 * s}px ${30 * s}px`, lineHeight: 1.35 }}>
        <div style={{ fontSize: 28 * s, fontWeight: 700, color: GOLD }}>คำถามที่ค้างไว้</div>
        <div style={{ fontSize: 54 * s, fontWeight: 900, margin: `${6 * s}px 0 ${16 * s}px` }}>ถ้าคุณเป็นพระยาตาก?</div>
        <div style={{ display: "flex", gap: 18 * s }}>
          {opt("อยู่สู้ในกรุง", T.stay, BLUE)}
          {opt("ตีฝ่าออกไป", T.go, TAK)}
        </div>
        <div style={{ textAlign: "center", fontSize: 32 * s, opacity: 0.85, marginTop: 14 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
      </div>
      {frame >= T.comment && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.36, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${btn})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${60 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 48 * s, boxShadow: `0 0 ${30 * s}px rgba(255,59,48,0.6)` }}>ติดตาม</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const NotOneNight = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.notOne + 20 || frame > T.a1 + 10) return null;
  const k = interpolate(frame, [T.notOne + 20, T.notOne + 28], [2.2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [T.a1 - 6, T.a1 + 10], [1, 0], clamp) }}>
      <div style={{ transform: `scale(${k}) rotate(-6deg)`, border: `${10 * s}px solid ${GOLD}`, color: GOLD, borderRadius: 18 * s, padding: `${8 * s}px ${36 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 92 * s, lineHeight: 1.25, textAlign: "center", background: "rgba(8,14,26,0.7)" }}>ไม่ได้แตก<br />ในคืนเดียว</div>
    </AbsoluteFill>
  );
};

export const ch8: Chapter = {
  name: "คำตอบ",
  from: B.answer.start,
  to: END,
  cams: (w, h) => [
    { frame: T.answer, cam: view(V.island, w, h, 0.6) },
    { frame: T.a1, cam: view(V.island, w, h, 0.6) },
    { frame: T.a1 + 35, cam: view(V.central, w, h, 0.6, 0.05) },
    { frame: T.ans2, cam: view(V.central, w, h, 0.6, 0.05) },
    { frame: T.ans2 + 30, cam: view(V.island, w, h, 1) },
    { frame: T.leave, cam: view(V.island, w, h, 1) },
    { frame: T.leave + 35, cam: view(V8.region, w, h, 0.95, 0.04) },
    { frame: T.suki - 10, cam: view(V8.region, w, h, 0.95, 0.04) },
    { frame: T.suki + 30, cam: view(V.plain, w, h, 1.5) },
    { frame: T.chan, cam: view(V.plain, w, h, 1.5) },
    { frame: T.chan + 35, cam: view(V8.east, w, h, 1, 0.08) },
    { frame: T.thon, cam: view(V8.east, w, h, 1, 0.08) },
    { frame: T.thon + 30, cam: view(V.island, w, h, 0.8) },
    { frame: T.newCap, cam: view(V.island, w, h, 0.8) },
    { frame: T.newCap + 30, cam: view(V8.thon, w, h, 1) },
    { frame: T.today, cam: view(V8.thon, w, h, 1) },
    { frame: T.today + 35, cam: view(V.island, w, h, 1.2) },
    { frame: T.poll, cam: view(V.island, w, h, 1.2) },
    { frame: END, cam: view(V.central, w, h, 0.5, 0.05) },
  ],
  years: [[T.answer, "2310"], [T.leave, "2310"], [T.chan, "2310 · มิถุนายน"], [T.ret, "2310 · พฤศจิกายน"], [T.crown, "2311"], [T.today, "วันนี้"]],
  heads: [
    { f: T.answer, tag: "กลับมาที่คำถามของวันนี้", head: "อยุธยา 417 ปี แตกในคืนเดียวได้ไง?", color: GOLD },
    { f: T.a1, tag: "คำตอบของวันนี้", head: "ไม่ได้แตกในคืนเดียว", color: GOLD, chips: [{ text: "① กว่า 2 ปี ตีหัวเมืองรอบนอก", f: T.a1 }, { text: "② ค่ายบนที่ดอน สูตรรอน้ำพัง", f: T.a2 }, { text: "③ ล้อม 14 เดือน ข้าวหมดเมือง", f: T.a3 }] },
    { f: T.ans2, tag: "7 เมษายน", head: "แค่คืนที่กำแพงยอมแพ้", color: GOLD },
    { f: T.since, tag: "อยุธยาแพ้มาตั้งแต่", head: "วันที่ศัตรูแก้สูตรรอน้ำได้", color: RED },
    { f: T.leave, tag: "หลังกรุงแตก", head: "พม่ากลับไปรบจีน", color: RED },
    { f: T.suki, tag: "เหลือแค่", head: "สุกี้ ที่ค่ายโพธิ์สามต้น", color: RED },
    { f: T.chan, tag: "พระยาตากตั้งหลักฝั่งตะวันออก", head: "จะตีเมืองจันทบุรี", color: TAK },
    { f: T.saying, tag: "", head: "" },
    { f: T.win + 12, tag: "สั่งทุบหม้อข้าวหม้อแกง", head: "ไม่ชนะก็ไม่มีข้าวกิน", color: TAK },
    { f: T.fell, tag: "คืนนั้น", head: "จันทบุรีแตก", color: TAK },
    { f: T.ret, tag: "ต่อเรือ รวบรวมคน", head: "ตีค่ายโพธิ์สามต้นแตก", color: TAK },
    { f: T.seven, tag: "หลังกรุงแตกเพียง", head: "ยึดคืนได้", stat: "7 เดือน", color: TAK },
    { f: T.thon, tag: "ไม่ฟื้นอยุธยา", head: "เมืองพังเกินจะซ่อม", color: TAK },
    { f: T.newCap, tag: "ราชธานีใหม่", head: "ธนบุรี ใกล้ปากอ่าว", color: TAK },
    { f: T.crown, tag: "ปลายปีถัดมา", head: "สมเด็จพระเจ้าตากสินมหาราช", color: TAK },
    { f: T.today, tag: "อยุธยาวันนี้", head: "มรดกโลก", color: BLUE },
    { f: T.head, tag: "วัดมหาธาตุ", head: "เศียรพระในรากไม้", color: BLUE },
    { f: T.poll + 60, tag: "", head: "" },
  ],
  night: (f) => (f >= T.ans2 && f < T.leave ? 0.6 : f >= T.chan && f < T.ret ? 0.7 : 0),
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityRing k={interpolate(frame, [T.answer, T.answer + 15, T.a1, T.a1 + 15], [0, 1, 1, 0], clamp)} color={GOLD} />
        {frame >= T.a1 && frame < T.ans2 && (
          <g opacity={0.8}>
            <Arrow points={[[96.08, 21.9], [98.98, 18.79], [100.12, 15.7], [100.45, 14.6]]} start={T.a1} end={T.a1 + 30} color={RED} width={18} />
            <Arrow points={[[98.19, 14.08], [99.53, 14.02], [100.3, 14.2]]} start={T.a1 + 10} end={T.a1 + 40} color={RED} width={18} />
          </g>
        )}
        {frame >= T.leave && frame < T.chan && (
          <>
            <Arrow points={[[100.4, 14.6], [99.4, 15.6], [98.4, 17.5], [97.2, 19.8], [96.2, 21.6]]} start={T.leave + 10} end={T.suki} color={RED} width={20} variant="dashed" />
            <PointLabel at={POSAMTON} text="ค่ายโพธิ์สามต้น" start={T.suki + 25} color={RED} size={0.75} />
          </>
        )}
        {frame >= T.chan && frame < T.thon + 20 && (
          <>
            <PointLabel at={CHAN} text="จันทบุรี" start={T.chan + 20} color={TAK} size={0.85} />
            <PointLabel at={[101.28, 12.68]} text="ระยอง" start={T.chan + 20} color={TAK} size={0.6} />
            {frame >= T.ret && <Arrow points={FLEET} start={T.sail} end={T.seven} color={TAK} width={18} />}
            {frame >= T.seven && <PointLabel at={POSAMTON} text="โพธิ์สามต้น" start={T.seven} color={TAK} size={0.7} />}
          </>
        )}
        {frame >= T.newCap && frame < T.today && (
          <>
            <Arrow points={[[100.56, 14.32], [100.52, 14.05], [100.49, 13.78]]} start={T.newCap} end={T.newCap + 30} color={TAK} width={20} />
            <PointLabel at={THON} text="ธนบุรี" start={T.newCap + 25} color={TAK} size={0.9} />
            <PointLabel at={P.ayut} text="อยุธยา" start={T.newCap} color={BLUE} size={0.7} />
          </>
        )}
        {frame >= T.today && <PointLabel at={[100.567, 14.357]} text="วัดมหาธาตุ" start={T.head} color={BLUE} size={0.7} />}
      </>
    );
  },
  Panels: () => (
    <>
      <RingScene start={T.a1} end={T.a2 + 14} />
      <CompareScene start={T.a2} end={T.a3 + 14} />
      <HungerScene start={T.a3} end={T.ans2 + 14} />
      <GaveWay start={T.ans2} end={T.since + 14} />
      <OldFormulaBroken start={T.since} end={T.leave + 14} />
      <HomeScene start={T.leave} end={T.chan + 14} />
      <ChanScene start={T.chan} end={T.win + 14} />
      <PotScene start={T.win} end={T.fell + 14} />
      <AssaultScene start={T.fell} end={T.ret + 14} />
      <ShipyardScene start={T.ret} end={T.thon + 14} />
      <RuinScene start={T.thon} end={T.newCap + 14} />
      <ThonScene start={T.newCap} end={T.today + 14} />
      <TodayScene start={T.today} end={T.poll + 14} />
      <RiderScene start={T.poll} end={END + 30} />
    </>
  ),
  Screen: () => (
    <>
      <NotOneNight />
      <QuoteReveal />
      <Poll />
    </>
  ),
  sfx: [
    [T.answer, SFX.riser, 0.3],
    [T.notOne + 20, SFX.hit, 0.6],
    [T.a1, SFX.pop, 0.35],
    [T.a2, SFX.pop, 0.35],
    [T.a3, SFX.pop, 0.35],
    [T.since, SFX.hit, 0.45],
    [T.leave, SFX.whoosh, 0.35],
    [T.chan, SFX.whoosh, 0.35],
    [T.saying, SFX.swell, 0.3],
    [T.smash, SFX.hit, 0.6],
    [T.fell, SFX.hit, 0.5],
    [T.sail, SFX.whoosh, 0.35],
    [T.seven, SFX.pop, 0.4],
    [T.newCap, SFX.whoosh, 0.35],
    [T.crown, SFX.swell, 0.35],
    [T.today, SFX.whoosh, 0.35],
    [T.head, SFX.pop, 0.3],
    [T.poll + 60, SFX.pop, 0.4],
    [T.stay, SFX.tick, 0.35],
    [T.go, SFX.tick, 0.35],
    [T.comment, SFX.hit, 0.45],
  ],
};
void Smoke;
void StiltHouse;
void Fire;
