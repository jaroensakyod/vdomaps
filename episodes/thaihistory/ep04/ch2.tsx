import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { impactAt } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, GOLD, QuizNews, RED, view } from "../news/kit";
import { B, CHINA_C, CityDot, KHMER_C, Measure, Ring, VIET_C, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { count, MarchScene } from "./ch1";
import { Balance, ChainShadow, Chapel, Cloud, Granary, Junk, Parasol, Sack, Ship, Show } from "./ch1_kit";
import { PL, R, VW } from "./places";
import { Backdrop, Banner, Boat, C, Candle, Fighter, Grass, Hall, King, Manuscript, Monk, Noble, PAL, PalaceWall, Prang, Puppet, River, ShadowStage, Smoke, Tree, V2 } from "./v2";

// Episode 4, chapter 2 "รอยร้าว" (beats warn → quiz1, พ.ศ. 2319–2324): what the later chronicles and a missionary
// say about the last years of the reign, the treasure-digging concession, Cambodia, and the army sent far away.
const PRIEST = { jacket: "#1b1d24", sash: "#2a2a30", pants: "#1b1d24", head: "short", skin: "#e0b08a" } as (typeof C)[string];
const SHADOW = { jacket: "#1a1418", sash: "#1a1418", pants: "#1a1418", head: "short", skin: "#2a2024" } as (typeof C)[string];
const OUT_TO_SEA: [number, number][] = [[100.49, 13.72], [100.56, 13.45], [100.9, 12.7], [101.5, 11.4], [102.4, 10.0]];
const RICE_IN: [number, number][] = [[101.2, 12.2], [100.75, 12.9], [100.56, 13.4], [100.49, 13.7]];
const GULF_V = bbox([[99.7, 12.4], [101.4, 14.9]]);
const SIAM_V = bbox([[97.6, 9.6], [105.0, 19.0]]);

export const T2 = {
  warn: B.warn.start,
  src: wf("warn", "หลัก", 0.55),
  written: wf("warn", "เขียน", 0.75),
  meditate: B.meditate.start,
  med: wf("meditate", "ฝึก", 0.62),
  wat: wf("meditate", "วัด", 0.9),
  fly: B.fly.start,
  rec: wf("fly", "บันทึก", 0.48),
  hover: wf("fly", "เหาะ", 0.94),
  foreign: B.foreign.start,
  outsider: wf("foreign", "คนนอก", 0.15),
  butF: wf("foreign", "แต่", 0.45),
  expel: wf("foreign", "ขับ", 0.88),
  sota: B.sotapanna.start,
  ask: wf("sotapanna", "ถาม", 0.46),
  monks: B.monks.start,
  per: wf("monks", "ตาม", 0.53),
  whip: wf("monks", "เฆี่ยน", 0.78),
  informers: B.informers.start,
  nobles2: wf("informers", "ขุนนาง", 0.5, 1),
  rice: B.rice.start,
  imp: wf("rice", "สั่ง", 0.35),
  bandit: wf("rice", "โจร", 0.75),
  treasure: B.treasure.start,
  dig: wf("treasure", "ขุด", 0.3),
  old: wf("treasure", "กรุง", 0.45),
  squeeze: wf("treasure", "บีบ", 0.72),
  china: B.china.start,
  sendC: wf("china", "ส่ง", 0.5),
  peking: wf("china", "ปักกิ่ง", 0.92),
  cambodia: B.cambodia.start,
  kh: wf("cambodia", "กัมพูชา", 0.1),
  pro: wf("cambodia", "นิยม", 0.68),
  send: B.send.start,
  march: wf("send", "ยก", 0.48),
  men: wf("send", "ราว", 0.52),
  siem: wf("send", "กัมพูชา", 0.6),
  prince: wf("send", "ราชโอรส", 0.77),
  far: B.far.start,
  dist: wf("far", "ห่าง", 0.55),
  quiz: B.quiz1.start,
  end: B.spark.start,
};
const T = T2;
const DIGS = Array.from({ length: 8 }, (_, i) => T.dig + i * 22).filter((f) => f < T.china - 10);
const REVEAL = T.end - 2;

type Sc = { id: string; start: number; end: number };

// A scribe writes by candlelight; shelves of folded manuscripts behind him.
const ScribeScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
      {(g, pan, lt) => (
        <g>
          <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#2a1a10" />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={g.x - 40 * g.s + pan * 0.2} y={g.y + (50 + r * 70) * g.s} width={g.W * 0.5} height={8 * g.s} fill="#5a3a20" />
              {Array.from({ length: 9 }, (_, i) => <rect key={i} x={g.x + (i * 50 - 30) * g.s + pan * 0.2} y={g.y + (26 + r * 70) * g.s} width={40 * g.s} height={24 * g.s} fill={i % 3 ? "#1f1712" : "#e8dcc0"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
            </g>
          ))}
          <rect x={g.x + g.W * 0.7 + pan * 0.2} y={g.y + 40 * g.s} width={110 * g.s} height={130 * g.s} fill="#1a2440" stroke="#5a3a20" strokeWidth={8 * g.s} />
          <circle cx={g.x + g.W * 0.7 + 70 * g.s + pan * 0.2} cy={g.y + 80 * g.s} r={18 * g.s} fill="#f4f6ff" opacity={0.9} />
          <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#4a2f18" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Noble x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 26 * g.s} scale={g.sc * 0.7} mode="kneel" bow={0.25 + 0.05 * Math.sin(frame * 0.1)} />
          <Manuscript x={g.x + g.W * 0.38 + pan * 0.5} y={g.ground - 30 * g.s} w={230 * g.s} s={g.s} dark={false} fade={interpolate(lt, [0, 120], [0.3, 1], clamp)} />
          <line x1={g.x + g.W * 0.38 + 40 * g.s + pan * 0.5 + Math.sin(frame * 0.4) * 20 * g.s} y1={g.ground - 70 * g.s} x2={g.x + g.W * 0.38 + 30 * g.s + pan * 0.5 + Math.sin(frame * 0.4) * 20 * g.s} y2={g.ground - 110 * g.s} stroke={PAL.ink} strokeWidth={3 * g.s} />
          <Candle x={g.x + g.W * 0.64 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 1.3} />
          {[0, 1, 2].map((i) => <rect key={i} x={g.x + g.W * 0.84 + pan * 1.6} y={g.y + g.H - (20 + i * 18) * g.s} width={150 * g.s} height={16 * g.s} fill={i % 2 ? "#e8dcc0" : "#2a2420"} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        </g>
      )}
    </V2>
  );
};

// A later court: scribes kneel in a row copying manuscripts inside a lamp-lit hall.
const CopyHallScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#24160e", "#4a2a18"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#3a2010" />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${g.x + i * 150 * g.s + pan * 0.2} ${g.y} l${40 * g.s} ${60 * g.s} l${40 * g.s} ${-60 * g.s}`} fill="none" stroke={PAL.gilt} strokeWidth={2 * g.s} opacity={0.4} />)}
        {[0.05, 0.38, 0.7].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={26 * g.s} height={g.H} fill="#5a2a14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Noble x={g.x + g.W * (0.12 + i * 0.3) + pan * 0.7} y={g.ground - 2 * g.s} scale={g.sc * 0.62} mode="kneel" bow={0.3} phase={i} jacket={i === 1 ? "#c9b48a" : "#efe6d0"} />
            <Manuscript x={g.x + g.W * (0.16 + i * 0.3) + pan * 0.7} y={g.ground - 4 * g.s} w={120 * g.s} s={g.s} dark={i !== 1} lines={4} />
            <Candle x={g.x + g.W * (0.27 + i * 0.3) + pan * 0.7} y={g.ground - 4 * g.s} s={g.s} />
          </g>
        ))}
        <rect x={g.x + g.W * 0.96 + pan * 1.6} y={g.y} width={60 * g.s} height={g.H} fill="#1a0a06" opacity={0.9} />
      </g>
    )}
  </V2>
);

// Wat Bang Yi Ruea by its canal at night: lit hall windows, a moored boat, moon over palms.
const WatCanalScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.bangYiRuea} start={start} end={end} sky={["#0a1430", "#2a3a5a"]} accent={GOLD} warm={0.04}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.16, 0.24]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2a4a" mid="#1f2a28" ground="#141a14" mist="#9aa8d0" />
        <Hall x={g.x + g.W * 0.36 + pan * 0.5} y={g.ground - 40 * g.s} w={280 * g.s} s={g.s} glow={0.6} roof="#6a2a22" wall="#cfc6b0" />
        <Prang x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 40 * g.s} h={140 * g.s} s={g.s} color="#a8a090" />
        {[0.1, 0.26, 0.92].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />)}
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#101c34" night />
        <Boat x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground + 14 * g.s} w={140 * g.s} s={g.s} n={1} costume={C.villager} />
        <Grass g={g} shift={pan * 1.6} color="#0a100a" />
      </g>
    )}
  </V2>
);

// Inside the wooden sala: one candle, incense smoke, a figure in white seated in meditation; moonlight through posts.
const MeditationScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.bangYiRuea} start={start} end={end} sky={["#0a0c18", "#1a1a2a"]} accent={GOLD} warm={0.06}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#14121a" />
        {[0.15, 0.4, 0.65, 0.9].map((f) => <path key={f} d={`M${g.x + g.W * f + pan * 0.2} ${g.y} l${60 * g.s} 0 l${120 * g.s} ${g.H} l${-60 * g.s} 0 Z`} fill="#cfd8ff" opacity={0.06} />)}
        {[0.08, 0.32, 0.58, 0.84].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={22 * g.s} height={g.H} fill="#3a2414" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 20 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={g.x + i * 90 * g.s + pan * 0.5} y1={g.ground - 20 * g.s} x2={g.x + i * 90 * g.s - 40 * g.s + pan * 0.5} y2={g.y + g.H} stroke="#1a100a" strokeWidth={2 * g.s} />)}
        <Noble x={g.x + g.W * 0.46 + pan * 0.5} y={g.ground - 16 * g.s} scale={g.sc * 0.82} mode="sit" jacket="#efe6d0" />
        <Candle x={g.x + g.W * 0.6 + pan * 0.5} y={g.ground - 18 * g.s} s={g.s * 1.4} />
        <line x1={g.x + g.W * 0.66 + pan * 0.5} y1={g.ground - 18 * g.s} x2={g.x + g.W * 0.66 + pan * 0.5} y2={g.ground - 50 * g.s} stroke="#8a5a32" strokeWidth={2 * g.s} />
        <Smoke x={g.x + g.W * 0.66 + pan * 0.5} y={g.ground - 52 * g.s} s={g.s * 0.6} n={7} />
        <rect x={g.x - 20 * g.s + pan * 1.6} y={g.y} width={70 * g.s} height={g.H} fill="#0a0806" opacity={0.9} />
        <rect x={g.x + g.W * 0.9 + pan * 1.6} y={g.y} width={90 * g.s} height={g.H} fill="#0a0806" opacity={0.9} />
      </g>
    )}
  </V2>
);

// A French missionary writes at a lectern; through the window, the prang of Thonburi.
const PriestScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a2018", "#4a3424"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#4a3424" />
        <rect x={g.x + g.W * 0.08 + pan * 0.2} y={g.y + 30 * g.s} width={260 * g.s} height={190 * g.s} fill="#e8a868" stroke="#2a1a10" strokeWidth={10 * g.s} />
        <Prang x={g.x + g.W * 0.08 + 130 * g.s + pan * 0.2} y={g.y + 218 * g.s} h={150 * g.s} s={g.s * 0.8} gold />
        <rect x={g.x + g.W * 0.08 + 126 * g.s + pan * 0.2} y={g.y + 30 * g.s} width={8 * g.s} height={190 * g.s} fill="#2a1a10" />
        <path d={`M${g.x + g.W * 0.9 + pan * 0.2} ${g.y + 40 * g.s} l0 ${60 * g.s} M${g.x + g.W * 0.9 - 18 * g.s + pan * 0.2} ${g.y + 60 * g.s} l${36 * g.s} 0`} stroke="#d9a93a" strokeWidth={6 * g.s} />
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        <Fighter x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} scale={g.sc * 0.66} mode="stand" weapon="none" costume={PRIEST} />
        <path d={`M${g.x + g.W * 0.56 + pan * 0.5} ${g.ground - 6 * g.s} l${10 * g.s} ${-80 * g.s} l${70 * g.s} ${-14 * g.s} l${10 * g.s} ${14 * g.s} l${-60 * g.s} ${10 * g.s} l${-10 * g.s} ${70 * g.s} Z`} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
        <rect x={g.x + g.W * 0.58 + pan * 0.5} y={g.ground - 104 * g.s} width={56 * g.s} height={14 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.2 * g.s} transform={`rotate(-12,${g.x + g.W * 0.58 + pan * 0.5},${g.ground - 104 * g.s})`} />
        <Candle x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 100 * g.s} s={g.s} />
        <rect x={g.x + g.W * 0.8 + pan * 1.6} y={g.ground - 60 * g.s} width={160 * g.s} height={80 * g.s} fill="#2a1a10" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <rect x={g.x + g.W * 0.82 + pan * 1.6} y={g.ground - 74 * g.s} width={70 * g.s} height={14 * g.s} fill="#7a2a22" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
      </g>
    )}
  </V2>
);

// The letter itself: French handwriting fills the page; the wax seal comes down on the key word.
const LetterScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const seal = interpolate(frame, [T.hover - 8, T.hover], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a1a10", "#4a2a18"]} accent={GOLD} warm={0.1} hits={[T.hover]}>
      {(g, pan, lt) => {
        const px = g.x + g.W * 0.26 + pan * 0.5;
        const py = g.y + 26 * g.s;
        const lines = interpolate(lt, [0, 150], [1, 9], clamp);
        return (
          <g>
            <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#5a3a20" />
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={g.x - 60 * g.s + pan * 0.2} y1={g.y + i * 44 * g.s} x2={g.x + g.W + 60 * g.s + pan * 0.2} y2={g.y + i * 44 * g.s + 10 * g.s} stroke="#3a2414" strokeWidth={3 * g.s} />)}
            <rect x={px + 16 * g.s} y={py + 10 * g.s} width={460 * g.s} height={270 * g.s} fill="#000" opacity={0.3} />
            <rect x={px} y={py} width={460 * g.s} height={270 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {Array.from({ length: 9 }, (_, i) => {
              const k = Math.max(0, Math.min(1, lines - i));
              return k > 0 ? <path key={i} d={`M${px + 24 * g.s} ${py + (30 + i * 25) * g.s} ${Array.from({ length: 24 }, (_, j) => `q${8 * g.s} ${(j % 2 ? 6 : -6) * (j % 5 ? 1 : 0.4) * g.s} ${16 * g.s} 0`).join(" ")}`} stroke="#2a2a5a" strokeWidth={1.8 * g.s} fill="none" strokeDasharray={`${420 * k * g.s} ${1000 * g.s}`} /> : null;
            })}
            <g transform={`translate(${px + 400 * g.s},${py + 230 * g.s}) scale(${1.6 - seal * 0.6})`} opacity={seal}>
              <circle r={26 * g.s} fill="#a8322a" stroke="#6a1a14" strokeWidth={3 * g.s} />
              <path d={`M${-8 * g.s} ${-10 * g.s} l${8 * g.s} ${20 * g.s} l${8 * g.s} ${-20 * g.s}`} stroke="#e8a0a0" strokeWidth={3 * g.s} fill="none" />
            </g>
            <g transform={`translate(${px + 40 * g.s + Math.min(lines - Math.floor(lines), 1) * 380 * g.s},${py + (30 + Math.min(8, Math.floor(lines)) * 25) * g.s})`}>
              <path d={`M0 0 L${60 * g.s} ${-90 * g.s} Q${76 * g.s} ${-110 * g.s} ${70 * g.s} ${-80 * g.s} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            </g>
            <Candle x={g.x + g.W * 0.9 + pan * 1.6} y={g.y + g.H - 10 * g.s} s={g.s * 1.8} />
          </g>
        );
      }}
    </V2>
  );
};

// An outsider's view: the mission chapel by the river, the missionary outside, Siamese townsfolk passing.
const ChapelScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#8ab0c8", "#f4e2b8"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.22]} lightColor={["#fff0c0", "#fffbe8"]} far="#9aa0a8" mid="#6a7a5a" ground="#7a6040" mist="#f4e2b8" />
        <Prang x={g.x + g.W * 0.86 + pan * 0.2} y={g.ground - 40 * g.s} h={160 * g.s} s={g.s} color="#cfc6b0" gold />
        <Chapel x={g.x + g.W * 0.2 + pan * 0.5} y={g.ground - 10 * g.s} w={200 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        <Fighter x={g.x + g.W * 0.46 + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.62} mode="stand" weapon="none" costume={PRIEST} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.95 - i * 0.1) - lt * 0.7 * g.s + pan * 0.7} y={g.ground + 12 * g.s} scale={g.sc * 0.6} mode="walk" flip weapon="none" costume={i % 2 ? C.villager : C.siam} phase={i * 1.2} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a4a24" />
      </g>
    )}
  </V2>
);

// Expelled: the missionary's ship sails out of the river mouth; guards watch from the bank.
const ShipScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.fort} start={start} end={end} sky={["#7a8aa0", "#e8d0a8"]} accent={RED} warm={0.06}>
      {(g, pan) => {
        const sail = interpolate(frame, [T.expel - 20, end], [0, 260], clamp) * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.88, 0.3]} lightColor={["#ffe0b0", "#fff6e0"]} far="#7a8098" mid="#5a6a50" ground="#5a6a50" mist="#e8d0a8" />
            <River g={g} y={g.ground - 70 * g.s} pan={pan} color="#3d6f8f" />
            <Ship x={g.x + g.W * 0.56 + sail + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 0.9} />
            <Fighter x={g.x + g.W * 0.56 + 10 * g.s + sail + pan * 0.5} y={g.ground - 60 * g.s} scale={g.sc * 0.3} mode="stand" weapon="none" costume={PRIEST} />
            <path d={`M${g.x - 60 * g.s} ${g.ground - 4 * g.s} L${g.x + g.W * 0.32 + pan * 0.7} ${g.ground - 4 * g.s} L${g.x + g.W * 0.4 + pan * 0.7} ${g.y + g.H} L${g.x - 60 * g.s} ${g.y + g.H} Z`} fill="#6b5236" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[0.08, 0.2].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode="stand" costume={C.guard} phase={i} />)}
            <Banner x={g.x + g.W * 0.28 + pan * 0.7} y={g.ground + 8 * g.s} s={g.s} color={PAL.ochre} />
            <Grass g={g} shift={pan * 1.6} color="#2f3a24" />
          </g>
        );
      }}
    </V2>
  );
};

// The king on his throne, lit as if from within, speaks to the court (as the chronicle tells it).
const DeclareScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a140c", "#6a3418"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#4a1c10" />
        <g opacity={0.25}>{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${g.x + g.W * 0.66 + pan * 0.2} ${g.y + 90 * g.s} L${g.x + g.W * 0.66 + Math.cos(i * 0.52) * 400 * g.s + pan * 0.2} ${g.y + 90 * g.s + Math.sin(i * 0.52) * 400 * g.s} L${g.x + g.W * 0.66 + Math.cos(i * 0.52 + 0.12) * 400 * g.s + pan * 0.2} ${g.y + 90 * g.s + Math.sin(i * 0.52 + 0.12) * 400 * g.s} Z`} fill="#ffe7a0" />)}</g>
        {[0.1, 0.42, 0.9].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={26 * g.s} height={g.H} fill="#6a2a14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        <rect x={g.x + g.W * 0.56 + pan * 0.5} y={g.ground - 54 * g.s} width={g.W * 0.24} height={40 * g.s} fill="#b8862a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <King x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 54 * g.s} scale={g.sc * 0.8} light={1} />
        {[0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.1 + i * 0.13) + pan * 0.7} y={g.ground - 2 * g.s} scale={g.sc * 0.6} mode="kneel" bow={0.6} phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Candle x={g.x + g.W * 0.52 + pan * 0.7} y={g.ground - 4 * g.s} s={g.s * 1.2} />
        <Candle x={g.x + g.W * 0.88 + pan * 0.7} y={g.ground - 4 * g.s} s={g.s * 1.2} />
        <rect x={g.x + g.W * 0.95 + pan * 1.6} y={g.y} width={70 * g.s} height={g.H} fill="#120806" opacity={0.9} />
      </g>
    )}
  </V2>
);

// The senior monks seated in rows in the ordination hall, a Buddha image behind them in candlelight.
const AssemblyScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a140c", "#5a2a14"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#3a1a10" />
        <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.2},${g.ground - 90 * g.s})`}>
          <circle cx={0} cy={-120 * g.s} r={80 * g.s} fill="#ffd25a" opacity={0.18} />
          <path d={`M${-70 * g.s} 0 Q${-60 * g.s} ${-50 * g.s} 0 ${-56 * g.s} Q${60 * g.s} ${-50 * g.s} ${70 * g.s} 0 Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <path d={`M${-30 * g.s} ${-50 * g.s} Q${-34 * g.s} ${-110 * g.s} ${-16 * g.s} ${-128 * g.s} L${16 * g.s} ${-128 * g.s} Q${34 * g.s} ${-110 * g.s} ${30 * g.s} ${-50 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <ellipse cx={0} cy={-146 * g.s} rx={18 * g.s} ry={20 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <path d={`M${-6 * g.s} ${-164 * g.s} L0 ${-190 * g.s} L${6 * g.s} ${-164 * g.s} Z`} fill={PAL.gilt} />
        </g>
        <rect x={g.x - 50 * g.s} y={g.ground - 60 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1408" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.17) + pan * 0.5} y={g.ground - 40 * g.s} scale={g.sc * 0.42} mode="sit" phase={i} flip={i > 2} />)}
        {[0, 1, 2, 3].map((i) => <Monk key={i} x={g.x + g.W * (0.14 + i * 0.24) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.56} mode="sit" phase={i + 3} flip={i > 1} />)}
        <Candle x={g.x + g.W * 0.36 + pan * 0.5} y={g.ground - 60 * g.s} s={g.s} />
        <Candle x={g.x + g.W * 0.64 + pan * 0.5} y={g.ground - 60 * g.s} s={g.s} />
        <rect x={g.x - 30 * g.s + pan * 1.6} y={g.y} width={70 * g.s} height={g.H} fill="#120806" opacity={0.9} />
      </g>
    )}
  </V2>
);

// The senior monks who answered "no": seated elders with a fan, palace guards arriving.
const ElderScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a2a2a", "#7a5a48"]} accent={RED} warm={0.06}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#4a2a1c" />
        {[0.2, 0.5, 0.8].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={26 * g.s} height={g.H} fill="#5a3420" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        {[0, 1, 2].map((i) => <Monk key={i} x={g.x + g.W * (0.12 + i * 0.16) + pan * 0.5} y={g.ground - 4 * g.s} scale={g.sc * 0.66} mode="sit" phase={i} />)}
        <line x1={g.x + g.W * 0.12 + 22 * g.s + pan * 0.5} y1={g.ground - 30 * g.s} x2={g.x + g.W * 0.12 + 26 * g.s + pan * 0.5} y2={g.ground - 110 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
        <ellipse cx={g.x + g.W * 0.12 + 27 * g.s + pan * 0.5} cy={g.ground - 130 * g.s} rx={22 * g.s} ry={30 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.98 - i * 0.12) - Math.min(lt, 90) * 1.2 * g.s + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.64} mode={lt < 90 ? "walk" : "stand"} flip costume={C.guard} phase={i} />)}
        <Candle x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground - 4 * g.s} s={g.s * 1.2} />
        <rect x={g.x - 30 * g.s + pan * 1.6} y={g.y} width={60 * g.s} height={g.H} fill="#120806" opacity={0.85} />
      </g>
    )}
  </V2>
);

// A grey courtyard: rows of monks kneel, heads bowed; long chain shadows across the paving; guards behind.
const CourtyardScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#5a5a68", "#a8a0a0"]} accent={RED} warm={0.02}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.7, 0.2]} lightColor={["#c8c8d0", "#e8e8f0"]} far="#6a6a78" mid="#5a5a5a" ground="#8a8070" mist="#c8c0c0" ridges={false} />
        {[0, 1].map((i) => <Cloud key={i} x={g.x + g.W * (0.3 + i * 0.5) - lt * 0.3 * g.s + pan * 0.2} y={g.y + (40 + i * 20) * g.s} s={g.s * 1.5} color="#4a4a58" o={0.7} />)}
        <PalaceWall x={g.x - 20 * g.s + pan * 0.5} y={g.ground - 60 * g.s} w={g.W + 40 * g.s} h={60 * g.s} s={g.s} color="#bab0a0" />
        {[0.15, 0.85].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 56 * g.s} scale={g.sc * 0.42} mode="stand" costume={C.guard} flip={i === 1} phase={i} />)}
        {Array.from({ length: 7 }, (_, i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.14) + pan * 0.6} y={g.ground - 20 * g.s} scale={g.sc * 0.44} mode="kneel" bow={0.8} phase={i} />)}
        {Array.from({ length: 6 }, (_, i) => <Monk key={i} x={g.x + g.W * (0.14 + i * 0.15) + pan * 0.8} y={g.ground + 16 * g.s} scale={g.sc * 0.56} mode="kneel" bow={0.85} phase={i + 7} />)}
        <ChainShadow x={g.x - 40 * g.s + pan * 1.6} y={g.y + g.H - 14 * g.s} len={g.W * 0.7} s={g.s} angle={-6} />
        <ChainShadow x={g.x + g.W * 0.5 + pan * 1.6} y={g.y + g.H - 6 * g.s} len={g.W * 0.6} s={g.s} angle={-4} />
      </g>
    )}
  </V2>
);

// Informers in the palace: whispering figures behind a pillar; rice on the scales, salt sacks; nobles prostrate.
const WhisperScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#24160e", "#4a2a18"]} accent={RED} warm={0.08}>
      {(g, pan) => (
        <g>
          <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#3a1e12" />
          {[0.5, 0.75].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#5a2a14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
          {[0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.6 + i * 0.13) + pan * 0.5} y={g.ground - 10 * g.s} scale={g.sc * 0.5} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
          <Balance x={g.x + g.W * 0.4 + pan * 0.7} y={g.ground + 4 * g.s} s={g.s} tilt={Math.sin(frame * 0.05) * 8} />
          <Sack x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} />
          <Sack x={g.x + g.W * 0.54 + pan * 0.7} y={g.ground + 10 * g.s} s={g.s * 0.9} color="#f4f4ee" />
          <rect x={g.x + g.W * 0.14 + pan * 0.7} y={g.y} width={46 * g.s} height={g.H} fill="#5a2a14" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <rect x={g.x + g.W * 0.02 + pan * 0.7} y={g.y + 30 * g.s} width={g.W * 0.3} height={g.H} fill="#e8a858" opacity={0.75} />
          <rect x={g.x + g.W * 0.14 + pan * 0.7} y={g.y} width={46 * g.s} height={g.H} fill="#5a2a14" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <g opacity={0.95}>
            <Fighter x={g.x + g.W * 0.08 + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="stand" weapon="none" costume={SHADOW} />
            <Fighter x={g.x + g.W * 0.24 + 30 * g.s + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="stand" weapon="none" costume={SHADOW} flip phase={2} />
          </g>
          <rect x={g.x + g.W * 0.93 + pan * 1.6} y={g.y} width={70 * g.s} height={g.H} fill="#120806" opacity={0.9} />
        </g>
      )}
    </V2>
  );
};

// Fines: nobles prostrate before an official seated by an open chest of silver.
const FinesScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a140c", "#5a2a14"]} accent={RED} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x - 60 * g.s} y={g.y} width={g.W + 120 * g.s} height={g.H} fill="#4a2414" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x + i * 100 * g.s + pan * 0.2} y={g.y + 20 * g.s} width={60 * g.s} height={110 * g.s} fill="#3a1a0c" stroke="#6a3418" strokeWidth={3 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        <rect x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 34 * g.s} width={g.W * 0.28} height={20 * g.s} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
        <Noble x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 34 * g.s} scale={g.sc * 0.62} mode="sit" jacket="#3a3a5a" flip />
        <g transform={`translate(${g.x + g.W * 0.64 + pan * 0.6},${g.ground - 6 * g.s})`}>
          <rect x={-40 * g.s} y={-40 * g.s} width={80 * g.s} height={40 * g.s} fill="#6b3a1a" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
          <path d={`M${-40 * g.s} ${-40 * g.s} L${-30 * g.s} ${-70 * g.s} L${50 * g.s} ${-70 * g.s} L${40 * g.s} ${-40 * g.s} Z`} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={(-30 + (i % 5) * 15) * g.s} cy={(-42 - Math.floor(i / 5) * 8) * g.s} r={7 * g.s} fill="#e0e0e8" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
        </g>
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.12) + pan * 0.7} y={g.ground - 2 * g.s} scale={g.sc * 0.6} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Fighter x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.64} mode="stand" costume={C.guard} flip />
        <Candle x={g.x + g.W * 0.03 + pan * 1.6} y={g.y + g.H - 8 * g.s} s={g.s * 1.5} />
      </g>
    )}
  </V2>
);

// Rice runs short: an empty barn, villagers queueing with baskets, a Chinese junk bringing rice in; a lurking robber.
const RiceScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const thief = interpolate(frame, [T.bandit - 10, T.bandit + 10], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#b0a080", "#e8d8b0"]} accent={RED} warm={0.1}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.18]} lightColor={["#ffe0a0", "#fff4d0"]} far="#9a9080" mid="#8a7a50" ground="#8a6c45" mist="#e8d8b0" />
          <River g={g} y={g.ground - 70 * g.s} pan={pan * 0.4} color="#5a7a80" />
          <Junk x={g.x + g.W * 0.72 - lt * 0.4 * g.s + pan * 0.4} y={g.ground - 58 * g.s} s={g.s * 0.62} cargo={1} sail="#8a3a2a" />
          <rect x={g.x - 100 * g.s} y={g.ground - 40 * g.s} width={g.W + 200 * g.s} height={g.H} fill="#8a6c45" />
          <Granary x={g.x + g.W * 0.04 + pan * 0.5} y={g.ground - 20 * g.s} w={190 * g.s} s={g.s} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <Fighter x={g.x + g.W * (0.3 + i * 0.09) + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.58} mode={i === 4 ? "walk" : "stand"} flip weapon="none" costume={C.villager} phase={i * 1.3} />
              <ellipse cx={g.x + g.W * (0.3 + i * 0.09) - 14 * g.s + pan * 0.7} cy={g.ground - 60 * g.s} rx={14 * g.s} ry={9 * g.s} fill="#a87a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            </g>
          ))}
          <g opacity={thief}>
            <Fighter x={g.x + g.W * 0.93 + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="stand" flip costume={C.rebel} />
          </g>
          <Grass g={g} shift={pan * 1.6} color="#5a4a24" />
        </g>
      )}
    </V2>
  );
};

// Nang yai: diggers under the broken prang of the old capital; the concession-holder's man raises a whip.
const TreasureShadow = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  const whip = interpolate(frame, [T.squeeze - 10, T.squeeze, T.squeeze + 40], [0, 1, 0.3], clamp);
  return (
    <ShadowStage id={id} anchor={PL.ayut} start={start} end={end}>
      {(g, lt) => {
        const drift = lt * 0.15 * g.s;
        const base = g.ground + 10 * g.s;
        return (
          <g fill="#100a06">
            <g transform={`translate(${g.x + g.W * 0.58 - drift},${base})`}>
              <path d={`M${-90 * g.s} 0 L${-80 * g.s} ${-60 * g.s} L${-60 * g.s} ${-70 * g.s} L${-56 * g.s} ${-150 * g.s} L${-40 * g.s} ${-210 * g.s} L${-20 * g.s} ${-240 * g.s} L${4 * g.s} ${-226 * g.s} L${14 * g.s} ${-250 * g.s} L${30 * g.s} ${-200 * g.s} L${54 * g.s} ${-140 * g.s} L${60 * g.s} ${-70 * g.s} L${84 * g.s} ${-58 * g.s} L${96 * g.s} 0 Z`} />
              {[[-30, -120], [10, -160], [-10, -80], [30, -100]].map(([hx, hy], i) => <circle key={i} cx={hx * g.s} cy={hy * g.s} r={5 * g.s} fill="#f6d9a0" opacity={0.7} />)}
            </g>
            <path d={`M${g.x} ${base} Q${g.x + g.W * 0.2} ${base - 40 * g.s} ${g.x + g.W * 0.4} ${base - 6 * g.s} L${g.x + g.W * 0.4} ${base + 20 * g.s} L${g.x} ${base + 20 * g.s} Z`} />
            <g transform={`translate(${g.x + g.W * 0.24},${base - 30 * g.s})`}>
              <rect x={-26 * g.s} y={-24 * g.s} width={52 * g.s} height={24 * g.s} />
              <path d={`M${-26 * g.s} ${-24 * g.s} L${-20 * g.s} ${-40 * g.s} L${26 * g.s} ${-40 * g.s} L${26 * g.s} ${-24 * g.s} Z`} />
              {[-14, 0, 14].map((cx) => <circle key={cx} cx={cx * g.s} cy={-12 * g.s} r={4 * g.s} fill="#f6d9a0" opacity={0.8} />)}
            </g>
            <Puppet x={g.x + g.W * 0.12} y={base} s={g.s * 0.95} kind="boatman" arm={1 - impactAt(frame, DIGS, 22)} />
            <Puppet x={g.x + g.W * 0.36} y={base} s={g.s * 0.95} kind="boatman" arm={1 - impactAt(frame, DIGS.map((f) => f + 11), 22)} flip />
            <Puppet x={g.x + g.W * 0.86} y={base} s={g.s * 1.1} kind="thai" arm={whip} flip />
          </g>
        );
      }}
    </ShadowStage>
  );
};

// The tribute mission: a junk with red sails and gilt chests heads out to sea for China.
const TributeScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#6a9ac8", "#f0e0c0"]} accent={GOLD} warm={0.06}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.84, 0.24]} lightColor={["#fff0c0", "#fffbe8"]} far="#7a90a8" mid="#5a7a8a" ground="#2f5f7f" mist="#f0e0c0" ridges={false} />
        <path d={`M${g.x - 60 * g.s + pan * 0.2} ${g.ground - 70 * g.s} q${80 * g.s} ${-40 * g.s} ${160 * g.s} 0 Z M${g.x + g.W * 0.6 + pan * 0.2} ${g.ground - 70 * g.s} q${60 * g.s} ${-30 * g.s} ${120 * g.s} 0 Z`} fill="#6a8a9a" stroke={PAL.ink} strokeWidth={1 * g.s} strokeOpacity={0.5} />
        <River g={g} y={g.ground - 70 * g.s} pan={pan} color="#2f5f7f" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${g.x + g.W * (0.2 + i * 0.25) + Math.sin(lt * 0.05 + i) * 20 * g.s + pan * 0.2} ${g.y + (50 + i * 16) * g.s} q${8 * g.s} ${-8 * g.s} ${16 * g.s} 0 q${8 * g.s} ${-8 * g.s} ${16 * g.s} 0`} stroke={PAL.ink} strokeWidth={2 * g.s} fill="none" />)}
        <Junk x={g.x + g.W * 0.36 + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 4 * g.s} s={g.s * 0.95} />
        {[0, 1, 2].map((i) => <rect key={i} x={g.x + g.W * 0.36 - 30 * g.s + i * 30 * g.s + lt * 0.5 * g.s + pan * 0.7} y={g.ground - 52 * g.s} width={24 * g.s} height={18 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${g.x + i * 120 * g.s + pan * 1.6} ${g.y + g.H - 6 * g.s} q${30 * g.s} ${-26 * g.s} ${60 * g.s} 0 q${30 * g.s} ${-26 * g.s} ${60 * g.s} 0`} fill="#1f4a66" stroke="#cfe6f0" strokeWidth={2 * g.s} />)}
      </g>
    )}
  </V2>
);

// Cambodia: Vietnamese-backed troops with red banners march before a Khmer temple; spears come up on the cue.
const VietScene = ({ id, start, end }: Sc) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.phnompenh} start={start} end={end} sky={["#c88a5a", "#f0d8a8"]} accent={VIET_C} warm={0.08}>
      {(g, pan, lt) => {
        const go = lt * 0.8 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.24]} lightColor={["#ffd38a", "#fff2c8"]} far="#8a7a7a" mid="#6a6a48" ground="#7a5a36" mist="#f0d8a8" />
            {[0.56, 0.72, 0.88].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 20 * g.s} h={(i === 1 ? 190 : 130) * g.s} s={g.s} color="#9a9080" />)}
            {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.12) + go + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode={frame >= T.pro && i % 2 ? "attack" : "walk"} costume={C.viet} phase={i * 1.1} />)}
            <Banner x={g.x + g.W * 0.1 + go + pan * 0.7} y={g.ground + 8 * g.s} s={g.s} color="#c9302c" />
            <Banner x={g.x + g.W * 0.4 + go + pan * 0.7} y={g.ground + 8 * g.s} s={g.s} color="#c9302c" />
            <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
          </g>
        );
      }}
    </V2>
  );
};

// The prince who is to rule Cambodia rides in a palanquin under a parasol, guards and banners around him.
const PalanquinScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.kabin} start={start} end={end} sky={["#e0985a", "#f8e0b0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const go = lt * 0.6 * g.s;
      const px = g.x + g.W * 0.42 + go + pan * 0.7;
      const py = g.ground + 8 * g.s;
      const sc = g.sc * 0.6;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.88, 0.3]} lightColor={["#ffd38a", "#fff2c8"]} far="#9a8a8a" mid="#6f7a50" ground="#7a5a36" mist="#f8e0b0" />
          {[0.12, 0.3, 0.64].map((f, i) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.8} kind={i % 2 ? "round" : "palm"} />)}
          {[-70, -30, 30, 70].map((dx, i) => <Fighter key={dx} x={px + dx * g.s} y={py} scale={sc} mode="walk" weapon="none" costume={C.villager} phase={i * 1.5} />)}
          <rect x={px - 100 * g.s} y={py - 98 * sc} width={200 * g.s} height={8 * g.s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          <rect x={px - 40 * g.s} y={py - 98 * sc - 14 * g.s} width={80 * g.s} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <Noble x={px} y={py - 98 * sc - 14 * g.s} scale={sc * 0.8} mode="sit" jacket={PAL.gilt} />
          <Parasol x={px + 30 * g.s} y={py - 98 * sc - 14 * g.s} s={g.s * 0.8} h={130} />
          <Fighter x={g.x + g.W * 0.16 + go + pan * 0.8} y={py + 4 * g.s} scale={sc} mode="walk" costume={C.siam} phase={1} />
          <Banner x={g.x + g.W * 0.18 + go + pan * 0.8} y={py + 4 * g.s} s={g.s} color={PAL.gilt} />
          <Fighter x={g.x + g.W * 0.7 + go + pan * 0.8} y={py + 4 * g.s} scale={sc} mode="walk" costume={C.siam} phase={2.4} />
          <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
        </g>
      );
    }}
  </V2>
);

// The capital left behind: an empty palace forecourt at dusk, one guard; the army's dust far off on the horizon.
const EmptyCapitalScene = ({ id, start, end }: Sc) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#4a3a5a", "#d08a5a"]} accent={RED} warm={0.06}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.5]} lightColor={["#ff9a5a", "#ffd8a0"]} far="#5a4a6a" mid="#4a4038" ground="#5a4630" mist="#d08a5a" />
        {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.78 + i * 0.03) + lt * 0.15 * g.s + pan * 0.2} y={g.ground - 92 * g.s} scale={g.sc * 0.12} mode="walk" costume={C.siam} phase={i} />)}
        <ellipse cx={g.x + g.W * 0.86 + lt * 0.15 * g.s + pan * 0.2} cy={g.ground - 96 * g.s} rx={70 * g.s} ry={10 * g.s} fill="#d0a070" opacity={0.4} />
        <PalaceWall x={g.x + g.W * 0.02 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.6} h={70 * g.s} s={g.s} gateAt={0.4} gateOpen={0.4} color="#bab0a0" />
        <Hall x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 90 * g.s} w={220 * g.s} s={g.s} roof="#7a3a2a" />
        <Smoke x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 100 * g.s} s={g.s * 0.6} n={4} />
        <Fighter x={g.x + g.W * 0.3 + Math.sin(lt * 0.02) * 60 * g.s + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.6} mode="walk" flip={Math.cos(lt * 0.02) < 0} costume={C.guard} />
        <Banner x={g.x + g.W * 0.66 + pan * 0.7} y={g.ground + 8 * g.s} s={g.s} color={PAL.ochre} />
        <Grass g={g} shift={pan * 1.6} color="#2a2418" />
      </g>
    )}
  </V2>
);

export const e4c2: Chapter4 = {
  name: "รอยร้าว",
  from: T.warn,
  to: T.end,
  cams: (w, h) => [
    { frame: T.warn, cam: view(VW.thonWide, w, h, 1.0, 0.1) },
    { frame: T.wat - 20, cam: view(VW.thonWide, w, h, 1.0, 0.1) },
    { frame: T.wat + 20, cam: view(VW.thonWide, w, h, 0.92, 0.06) },
    { frame: T.expel - 8, cam: view(VW.thonWide, w, h, 0.92, 0.06) },
    { frame: T.expel + 30, cam: view(SIAM_V, w, h, 0.85, 0.04) },
    { frame: T.sota, cam: view(SIAM_V, w, h, 0.85, 0.04) },
    { frame: T.sota + 40, cam: view(VW.thonWide, w, h, 1.0, 0.1) },
    { frame: T.rice, cam: view(VW.thonWide, w, h, 1.0, 0.1) },
    { frame: T.rice + 36, cam: view(GULF_V, w, h, 0.95, -0.02) },
    { frame: T.china, cam: view(GULF_V, w, h, 0.95, -0.02) },
    { frame: T.china + 40, cam: view(VW.asia, w, h, 0.85, 0.1) },
    { frame: T.kh - 6, cam: view(VW.asia, w, h, 0.85, 0.1) },
    { frame: T.kh + 34, cam: view(VW.east, w, h, 0.92, 0.13) },
    { frame: T.quiz, cam: view(VW.east, w, h, 0.92, 0.13) },
    { frame: T.quiz + 40, cam: view(SIAM_V, w, h, 0.85, 0.04) },
  ],
  years: [[T.warn, "2319–2324"], [T.china, "2324"]],
  heads: [
    { f: T.warn, tag: "ฟังให้ดี", head: "อ่านหลักฐานอย่างระวัง", color: GOLD },
    { f: T.written, tag: "หลักฐานส่วนใหญ่", head: "เขียนทีหลัง", color: RED },
    { f: T.meditate, tag: "พงศาวดารเล่า", head: "ฝึกกรรมฐานอย่างหนัก", color: GOLD, portrait: "taksin_king" },
    { f: T.fly, tag: "บาทหลวงฝรั่งเศส", head: "บันทึกมิชชันนารี", color: GOLD },
    { f: T.hover, tag: "บาทหลวงคูเดบันทึกว่า", head: "\"เพื่อจะเหาะได้\"", color: GOLD },
    { f: T.foreign, tag: "หลักฐานคนนอก", head: "ไม่อยู่ใต้ราชสำนักใหม่", color: GOLD, chips: [{ text: "คนนอก ✓", f: T.outsider }] },
    { f: T.butF, tag: "หลักฐานคนนอก", head: "แต่ไม่เป็นกลาง", color: RED, chips: [{ text: "คนนอก ✓", f: T.butF }, { text: "มีเหตุให้ไม่ชอบ ✓", f: T.expel }] },
    { f: T.sota, tag: "พงศาวดารเล่า", head: "ตรัสว่าบรรลุโสดาบัน", color: GOLD, portrait: "taksin_king" },
    { f: T.ask, tag: "พงศาวดารเล่า", head: "คำถามถึงพระสงฆ์", color: GOLD },
    { f: T.monks, tag: "ตามพงศาวดาร", head: "ผู้ตอบว่าไม่ได้ ถูกลงโทษ", color: RED },
    { f: T.whip, tag: "ตามพงศาวดาร", head: "พระถูกเฆี่ยนราว", stat: count(T.whip, 500), label: "รูป", color: RED },
    { f: T.informers, tag: "ฟ้องกันในวัง", head: "ค้าข้าว ค้าเกลือ", color: RED },
    { f: T.rice, tag: "นอกวัง", head: "ข้าวขาดแคลน", color: RED },
    { f: T.bandit, tag: "ข้าวขาดแคลน", head: "โจรชุกชุม", color: RED },
    { f: T.treasure, tag: "ราชสำนักเปิด", head: "ประมูลขุดสมบัติ", color: GOLD },
    { f: T.squeeze, tag: "ประมูลขุดสมบัติ", head: "บีบชาวบ้านกรุงเก่า", color: RED },
    { f: T.china, tag: "ปี 2324", head: "ทูตไปปักกิ่ง", color: CHINA_C },
    { f: T.cambodia, tag: "กัมพูชา", head: "กษัตริย์ฝ่ายไทยถูกสังหาร", color: RED },
    { f: T.pro, tag: "กัมพูชา", head: "ฝ่ายนิยมญวนขึ้นครอง", color: VIET_C },
    { f: T.send, tag: "ปลายปี 2324", head: "ทัพไปกัมพูชา", color: GOLD, portrait: "chakri" },
    { f: T.men, tag: "ทัพไปกัมพูชา", head: "ราว", stat: count(T.men, 20000), label: "คน", color: GOLD, portrait: "surasi" },
    { f: T.prince, tag: "พร้อมพระราชโอรส", head: "จะให้ไปครองกัมพูชา", color: GOLD },
    { f: T.far, tag: "ทัพหลักอยู่ไกล", head: "ห่างเมืองหลวง", color: RED },
    { f: T.dist, tag: "ทัพหลักอยู่ไกล", head: "ห่างเมืองหลวงราว", stat: "400 กม.", color: RED },
    { f: T.quiz, tag: "ทายดู", head: "อะไรจุดชนวนกบฏ?", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const zs = interpolate(frame, [T.expel, T.expel + 20, T.sota + 20, T.sota + 40, T.china, T.china + 20], [0, 0.7, 0.7, 0, 0, 0.7], clamp);
    const zk = interpolate(frame, [T.kh, T.kh + 20, T.pro, T.pro + 20], [0, 0.9, 0.9, 0], clamp);
    const zv = interpolate(frame, [T.kh, T.kh + 20], [0, 0.6], clamp);
    const zkv = interpolate(frame, [T.pro, T.pro + 20], [0, 0.9], clamp);
    return (
      <>
        <Zones k={{ siam: zs, viet: zv }} />
        <Zones k={{ khmer: zk }} colors={{ khmer: KHMER_C }} />
        <Zones k={{ khmer: zkv }} colors={{ khmer: VIET_C }} />
        <Show from={T.warn} to={T.wat}>
          <PointLabel at={PL.thon} text="พระราชวังเดิม" start={T.warn} color={GOLD} size={0.85} />
        </Show>
        <Show from={T.wat - 10} to={T.fly + 30}>
          <Arrow points={[PL.thon, [100.48, 13.733], PL.bangYiRuea]} start={T.wat - 10} end={T.wat + 20} color={GOLD} width={8} variant="dashed" />
          <PointLabel at={PL.bangYiRuea} text="วัดบางยี่เรือ" start={T.wat} color={GOLD} size={0.85} />
        </Show>
        <Show from={T.fly + 20} to={T.expel}>
          <PointLabel at={PL.thon} text="กรุงธนบุรี" start={T.fly + 20} color={GOLD} size={0.85} />
        </Show>
        <Show from={T.expel} to={T.sota + 30}>
          <Arrow points={OUT_TO_SEA} start={T.expel} end={T.expel + 40} color={RED} width={10} variant="dashed" />
        </Show>
        <Show from={T.sota + 30} to={T.rice + 30}>
          <PointLabel at={PL.thon} text="พระราชวังเดิม" start={T.sota + 40} color={GOLD} size={0.85} />
          <Ring at={PL.thon} r={0.002} color={RED} start={T.monks} end={T.rice} />
        </Show>
        <Show from={T.imp} to={T.treasure + 20}>
          <Arrow points={RICE_IN} start={T.imp} end={T.imp + 40} color={CHINA_C} width={10} variant="dashed" />
        </Show>
        <CityDot at={PL.thon} color={GOLD} r={12} start={T.rice + 30} end={T.china + 40} />
        <CityDot at={PL.ayut} color={RED} r={14} start={T.old} end={T.china + 30} />
        <Show from={T.old} to={T.china + 30}>
          <PointLabel at={PL.ayut} text="อยุธยา (กรุงเก่า)" start={T.old} color={RED} size={0.85} />
        </Show>
        <Ring at={PL.ayut} r={0.08} color={RED} start={T.squeeze} end={T.china} />
        <Show from={T.sendC} to={T.kh + 20}>
          <Arrow points={R.china} start={T.sendC} end={T.peking} color={CHINA_C} width={12} variant="dashed" />
          <CityDot at={PL.beijing} color={CHINA_C} r={14} start={T.peking - 10} />
          <PointLabel at={PL.beijing} text="ปักกิ่ง" start={T.peking} color={CHINA_C} size={0.85} />
        </Show>
        <CityDot at={PL.phnompenh} color={VIET_C} r={14} start={T.kh} end={T.quiz} />
        <Show from={T.kh} to={T.quiz}>
          <PointLabel at={PL.phnompenh} text="พนมเปญ" start={T.kh + 6} color={VIET_C} size={0.8} />
        </Show>
        <CityDot at={PL.thon} color={GOLD} r={14} start={T.kh + 20} end={T.dist} />
        <CityDot at={PL.thon} color={RED} r={16} start={T.dist} end={T.end} />
        <Show from={T.march} to={T.quiz + 20}>
          <Arrow points={R.cambodia} start={T.march} end={T.march + 60} color={GOLD} width={22} opacity={interpolate(frame, [T.quiz, T.quiz + 20], [1, 0], clamp)} />
          <PointLabel at={PL.siemreap} text="เสียมราฐ" start={T.siem} color={GOLD} size={0.8} />
        </Show>
        <Show from={T.dist} to={T.quiz + 10}>
          <Measure a={PL.siemreap} b={PL.thon} text="ราว 400 กม." start={T.dist} color={GOLD} />
        </Show>
      </>
    );
  },
  Panels: () => (
    <>
      <ScribeScene id="e4c2scribe" start={T.warn} end={T.src + 14} />
      <CopyHallScene id="e4c2copy" start={T.src} end={T.meditate + 14} />
      <WatCanalScene id="e4c2wat" start={T.meditate} end={T.med + 14} />
      <MeditationScene id="e4c2med" start={T.med} end={T.fly + 14} />
      <PriestScene id="e4c2priest" start={T.fly} end={T.rec + 14} />
      <LetterScene id="e4c2letter" start={T.rec} end={T.foreign + 14} />
      <ChapelScene id="e4c2chapel" start={T.foreign} end={T.butF + 14} />
      <ShipScene id="e4c2ship" start={T.butF} end={T.sota + 14} />
      <DeclareScene id="e4c2declare" start={T.sota} end={T.ask + 14} />
      <AssemblyScene id="e4c2assembly" start={T.ask} end={T.monks + 14} />
      <ElderScene id="e4c2elders" start={T.monks} end={T.per + 14} />
      <CourtyardScene id="e4c2court" start={T.per} end={T.informers + 14} />
      <WhisperScene id="e4c2whisper" start={T.informers} end={T.nobles2 + 14} />
      <FinesScene id="e4c2fines" start={T.nobles2} end={T.rice + 14} />
      <RiceScene id="e4c2rice" start={T.rice} end={T.treasure + 14} />
      <TreasureShadow id="e4c2treasure" start={T.treasure} end={T.china + 14} />
      <TributeScene id="e4c2tribute" start={T.china} end={T.cambodia + 14} />
      <VietScene id="e4c2viet" start={T.cambodia} end={T.send + 14} />
      <MarchScene id="e4c2march" anchor={PL.kabin} start={T.send} end={T.prince + 14} sky={["#d88a50", "#f6dca8"]} light={[0.9, 0.3]} trumpet={T.march} mid="#5f6a40" far="#9a8a7a" />
      <PalanquinScene id="e4c2prince" start={T.prince} end={T.far + 14} />
      <EmptyCapitalScene id="e4c2empty" start={T.far} end={T.quiz + 14} />
    </>
  ),
  Screen: () => (
    <AbsoluteFill style={{ transform: `translateY(-12%)` }}>
      <QuizNews title="ทายกันหน่อย" question="เรื่องไหนจุดชนวนกบฏ?" options={["ลงโทษพระสงฆ์", "ข้าวยากหมากแพง", "ขุดสมบัติกรุงเก่า"]} answer={2} start={T.quiz} reveal={REVEAL} end={T.end + 26} />
    </AbsoluteFill>
  ),
  sfx: [
    [T.warn, SFX.swell, 0.25],
    [T.written, SFX.pop, 0.3],
    [T.wat, SFX.pop, 0.3],
    [T.outsider, SFX.pop, 0.3],
    [T.expel, SFX.pop, 0.3],
    [T.expel - 6, SFX.whoosh, 0.3],
    [T.sota + 34, SFX.whoosh, 0.3],
    [T.whip, SFX.tick, 0.3],
    [T.rice + 30, SFX.whoosh, 0.3],
    [T.old, SFX.pop, 0.3],
    [T.china + 34, SFX.whoosh, 0.3],
    [T.peking, SFX.pop, 0.3],
    [T.kh + 28, SFX.whoosh, 0.3],
    [T.kh + 6, SFX.pop, 0.3],
    [T.pro, SFX.hit, 0.3],
    [T.men, SFX.tick, 0.3],
    [T.siem, SFX.pop, 0.3],
    [T.dist, SFX.whoosh, 0.25],
    [T.dist + 20, SFX.hit, 0.3],
    [T.quiz, SFX.swell, 0.3],
    [REVEAL - 90, SFX.tick, 0.3],
    [REVEAL - 60, SFX.tick, 0.3],
    [REVEAL - 30, SFX.tick, 0.3],
    [REVEAL, SFX.hit, 0.45],
  ],
  Audio: () => (
    <>
      <Bed id="rain_light" from={T.warn - 10} to={T.meditate + 10} volume={0.14} voice={VOICE} />
      <Bed id="wind" from={T.meditate - 10} to={T.fly + 10} volume={0.12} voice={VOICE} />
      <Bed id="rain_light" from={T.fly - 10} to={T.foreign + 10} volume={0.14} voice={VOICE} />
      <Hit id="wood_hit" at={T.hover} volume={0.35} />
      <Bed id="city_crowd" from={T.foreign - 10} to={T.butF + 10} volume={0.12} voice={VOICE} />
      <Bed id="sea_rough" from={T.butF - 10} to={T.sota + 10} volume={0.15} voice={VOICE} />
      <Hit id="ship_bell" at={T.expel} volume={0.35} />
      <Bed id="fire_crackle" from={T.sota - 10} to={T.monks + 10} volume={0.1} voice={VOICE} />
      <Hit id="gong" at={T.ask} volume={0.3} />
      <Bed id="wind" from={T.monks - 10} to={T.informers + 10} volume={0.18} voice={VOICE} />
      <Bed id="city_crowd" from={T.informers - 10} to={T.rice + 10} volume={0.1} voice={VOICE} />
      <Bed id="ship_creak" from={T.rice - 10} to={T.treasure + 10} volume={0.15} voice={VOICE} />
      <Bed id="wind" from={T.treasure - 10} to={T.china + 10} volume={0.15} voice={VOICE} />
      {DIGS.map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.25} />)}
      {DIGS.map((f) => <Hit key={`b${f}`} id="wood_hit" at={f + 11} volume={0.2} />)}
      <Hit id="sword_swish" at={T.squeeze} volume={0.3} />
      <Bed id="ship_sailing" from={T.china - 10} to={T.cambodia + 10} volume={0.2} voice={VOICE} />
      <Hit id="ship_bell" at={T.sendC} volume={0.3} />
      <Bed id="war_drums" from={T.cambodia - 10} to={T.send + 10} volume={0.2} voice={VOICE} />
      <Hit id="sword_draw" at={T.pro} volume={0.35} />
      <Bed id="army_marching" from={T.send - 10} to={T.far + 10} volume={0.22} voice={VOICE} />
      <Hit id="elephant" at={T.march} volume={0.35} />
      <Hit id="gong" at={T.prince} volume={0.3} />
      <Bed id="wind" from={T.far - 10} to={T.quiz + 14} volume={0.2} voice={VOICE} />
    </>
  ),
};
