import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { Shot } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, GOLD, RED, view } from "../news/kit";
import { B, CityDot, Ring, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { Birds, Ladder, Reeds, RobeTray, Stars, Tent, Torch, WindStreaks, Win } from "./ch3_kit";
import { PL, R, VW } from "./places";
import { Backdrop, Banner, Boat, C, Candle, Fighter, Fire, Grass, Hall, House, King, Manuscript, Monk, Noble, PAL, PalaceWall, Palisade, Prang, River, Smoke, Tree, V2 } from "./v2";

// Chapter 3 of episode 4 (beats spark → sanrules): the Ayutthaya riot, Phraya San changes sides, the night attack
// on the palace, Taksin ordains at Wat Chaeng and Phraya San takes over.

const T = {
  spark: B.spark.start,
  p1: B.spark.start + 40, // chapter 2's quiz reveal holds the panel area until here
  rise: wf("spark", "รวม", 0.55),
  fight: wf("spark", "สู้", 0.68),
  kill: wf("spark", "ฆ่า", 0.95),
  ps: B.phrayasan.start,
  sanb: wf("phrayasan", "สรรค์", 0.37, 1),
  go: wf("phrayasan", "ปราบ", 0.5),
  but: wf("phrayasan", "แต่", 0.55),
  turn: wf("phrayasan", "กลับ", 0.78),
  bro: B.brother.start,
  r5: wf("brother", "รัชกาล", 0.42),
  march: B.march.start,
  ramanya: wf("march", "คลอง", 0.62),
  night: B.night.start,
  army: wf("night", "ทัพ", 0.76),
  storm: wf("night", "บุก", 0.84),
  loyal: B.loyal.start,
  oath: wf("loyal", "บันทึก", 0.52),
  swear: wf("loyal", "สาบาน", 0.8),
  surr: B.surrender.start,
  morning: wf("surrender", "เช้า", 0.15),
  ask: wf("surrender", "ขอ", 0.8),
  ord: B.ordain.start,
  monk: wf("ordain", "พระเจ้า", 0.48),
  robe: wf("ordain", "ผนวช", 0.6),
  chaeng: wf("ordain", "แจ้ง", 0.68),
  reign: wf("ordain", "สิบ", 0.83),
  san: B.sanrules.start,
  guard: wf("sanrules", "ให้", 0.5),
  watch: wf("sanrules", "เฝ้า", 0.57),
};
const END = B.chaos.start;
const AYUT_V = bbox([[100.25, 14.05], [100.9, 14.65]]);
// Sankhaburi → Ayutthaya → Thonburi framed between the top card and the panel (wide box so the width sets the zoom).
const RIVER_V = bbox([[99.0, 14.4], [102.0, 14.6]]);

// One schedule per action: picture (shake/flash) and sound share these frames.
const DIG = [T.p1 + 26, T.p1 + 56, T.p1 + 86].filter((f) => f < T.rise + 10);
const RIOT = [T.fight, T.kill];
const SHOTS = [T.storm, T.storm + 18, T.storm + 38];
const CLASH = [T.loyal + 26, T.loyal + 50, T.loyal + 78].filter((f) => f < T.oath + 10);
const GATE = T.ask;

// The rebels' approach: from Khlong Ramanya across the river to the palace (approximate).
const CROSS: [number, number][] = [[100.492, 13.772], [100.4955, 13.762], [100.494, 13.752], [100.4895, 13.7438]];

const sk = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

// --- spark: villagers dig in the ruins of the old capital by torchlight ---
const RuinDigScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#141026", "#4a2a2a"]} accent={GOLD} warm={0.06} hits={DIG}>
      {(g, pan) => (
        <g>
          <Stars g={g} />
          <Backdrop g={g} pan={pan} light={[0.18, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#2a2440" mid="#33302c" ground="#2e261c" mist="#8a90b0" />
          {[[0.3, 150], [0.52, 210], [0.74, 120]].map(([f, h], i) => (
            <g key={i} opacity={0.85}>
              <Prang x={g.x + g.W * f + pan * 0.2} y={g.ground - 50 * g.s} h={h * g.s} s={g.s} color="#8a8070" />
              <path d={`M${g.x + g.W * f + pan * 0.2 - 30 * g.s} ${g.ground - 50 * g.s - h * g.s * 0.62} l${20 * g.s} ${-14 * g.s} l${18 * g.s} ${10 * g.s} l${24 * g.s} ${-6 * g.s}`} stroke={PAL.ink} strokeWidth={2 * g.s} fill="none" />
            </g>
          ))}
          <path d={`M${g.x + g.W * 0.36 + pan * 0.7} ${g.ground} q${70 * g.s} ${-46 * g.s} ${150 * g.s} 0 Z`} fill="#4a3a28" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <g transform={`translate(${g.x + g.W * 0.44 + pan * 0.7},${g.ground - 12 * g.s})`}>
            <rect x={-26 * g.s} y={-22 * g.s} width={52 * g.s} height={26 * g.s} fill="#6b3a1a" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={(-14 + i * 9) * g.s} cy={-24 * g.s} r={5 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={0.8 * g.s} opacity={0.6 + 0.4 * Math.abs(Math.sin(frame * 0.2 + i))} />)}
          </g>
          {[0, 1, 2].map((i) => {
            const dig = DIG.some((h) => frame >= h - 10 && frame < h + 4) ? 1 : 0;
            const x = g.x + g.W * (0.24 + i * 0.22) + pan * 0.7;
            const swing = Math.sin(frame * 0.18 + i * 2) * 0.5 + 0.5;
            const d = i === 2 ? -1 : 1;
            return (
              <g key={i}>
                <Fighter x={x} y={g.ground + 2 * g.s} scale={g.sc * 0.6} mode={dig ? "attack" : "stand"} costume={C.villager} weapon="none" flip={i === 2} phase={i} />
                <line x1={x + d * 14 * g.s} y1={g.ground - 90 * g.s} x2={x + d * (30 + swing * 14) * g.s} y2={g.ground - (8 + swing * 20) * g.s} stroke="#5a3a1f" strokeWidth={4 * g.s} />
              </g>
            );
          })}
          <Torch x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground} s={g.s} seed={2} />
          <Torch x={g.x + g.W * 0.88 + pan * 0.7} y={g.ground} s={g.s} seed={5} />
          <Grass g={g} shift={pan * 1.6} color="#151a10" />
        </g>
      )}
    </V2>
  );
};

// --- spark: the villagers rise; torches and clubs against the collectors' house ---
const UprisingScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#1a0f1a", "#6a2a1a"]} accent={RED} hits={RIOT}>
      {(g, pan, lt) => {
        const rush = interpolate(lt, [0, end - start], [0, 150], clamp) * g.s;
        const burn = sk(frame, T.fight, T.kill + 10);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.7, 0.35]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1a24" mid="#3a2420" ground="#2a2018" mist="#ff9a5a" />
            <Tree x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} kind="palm" />
            <House x={g.x + g.W * 0.66 + pan * 0.5} y={g.ground - 8 * g.s} w={190 * g.s} s={g.s} burn={burn} />
            {burn > 0.3 && <Smoke x={g.x + g.W * 0.75 + pan * 0.5} y={g.ground - 180 * g.s} s={g.s} dark />}
            {[0, 1, 2, 3, 4].map((i) => {
              const x = g.x + g.W * (0.02 + i * 0.085) + rush + pan * 0.7;
              return (
                <g key={i}>
                  <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode={i % 2 ? "run" : "attack"} costume={i % 2 ? C.villager : C.rebel} weapon={i === 2 ? "none" : "spear"} phase={i * 1.3} />
                  {i === 2 && <Torch x={x + 16 * g.s} y={g.ground - 70 * g.s} s={g.s} h={60} seed={i} />}
                </g>
              );
            })}
            {RIOT.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.6 + pan * 0.7} cy={g.ground - 70 * g.s} r={34 * g.s} fill="#fff2b0" opacity={0.75} /> : null))}
            <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
          </g>
        );
      }}
    </V2>
  );
};

// --- phrayasan: the Sankhaburi column marches out under gold banners ---
const SanMarchScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.sanburi} start={start} end={end} sky={["#7aa6c9", "#f3d9b0"]} accent={GOLD}>
    {(g, pan, lt) => {
      const walk = lt * 0.9 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.82, 0.22]} far="#8a8aa0" mid="#6b7a58" ground="#8a7048" />
          <PalaceWall x={g.x + g.W * 0.62 + pan * 0.2} y={g.ground - 40 * g.s} w={g.W * 0.4} h={46 * g.s} s={g.s * 0.7} color="#d8ccb0" gateAt={0.3} gateOpen={1} />
          <Tree x={g.x + g.W * 0.1 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 0.8} />
          <Tree x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 0.7} kind="palm" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = g.x + g.W * (0.86 - i * 0.12) - walk + pan * 0.7;
            return (
              <g key={i}>
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.58} mode="walk" flip costume={C.siam} phase={i * 0.9} />
                {i % 2 === 0 && <Banner x={x + 4 * g.s} y={g.ground - 4 * g.s} s={g.s * 0.9} color={GOLD} />}
              </g>
            );
          })}
          <Grass g={g} shift={pan * 1.6} />
        </g>
      );
    }}
  </V2>
);

// --- phrayasan: at Ayutthaya the two sides face each other — then Phraya San's banners turn red ---
const TurnCoatScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const k = sk(frame, T.turn, T.turn + 12);
  const flag = interpolateColors(k, [0, 1], [GOLD, RED]);
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#c96a3a", "#f3c98a"]} accent={RED} hits={[T.turn]}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.3]} lightColor={["#ffb070", "#ffe0b0"]} far="#7a5a6a" mid="#6a5a40" ground="#7a5a36" />
          {[0.2, 0.5, 0.8].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.2} y={g.ground - 60 * g.s} h={(110 + i * 30) * g.s} s={g.s} color="#a89a80" />)}
          {[0, 1, 2].map((i) => {
            const x = g.x + g.W * (0.1 + i * 0.1) + pan * 0.7;
            return (
              <g key={`s${i}`}>
                <Banner x={x - 10 * g.s} y={g.ground - 2 * g.s} s={g.s} color={flag} />
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode={k > 0.5 ? "stand" : "aim"} costume={C.siam} phase={i} />
              </g>
            );
          })}
          {[0, 1, 2].map((i) => {
            const x = g.x + g.W * (0.68 + i * 0.1) + pan * 0.7;
            return (
              <g key={`r${i}`}>
                <Banner x={x + 6 * g.s} y={g.ground - 2 * g.s} s={g.s} color={RED} />
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode={k > 0.5 ? "stand" : "aim"} flip costume={C.rebel} phase={i + 2} />
              </g>
            );
          })}
          <Grass g={g} shift={pan * 1.6} color="#4a4a24" />
        </g>
      )}
    </V2>
  );
};

// --- brother: Phraya San and his brother Khun Kaeo clasp hands in a riverside camp at dusk ---
const BrothersScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#3a2a4a", "#d0804a"]} accent={RED} warm={0.1}>
    {(g, pan) => {
      const cx = g.x + g.W * 0.5 + pan * 0.7;
      const sc = g.sc * 0.7;
      const clasp: [number, number] = [cx, g.ground - 70 * sc];
      const arm = (sx: number, color: string) => {
        const d = `M${sx} ${g.ground - 98 * sc} Q${(sx + clasp[0]) / 2} ${g.ground - 70 * sc} ${clasp[0]} ${clasp[1]}`;
        return (
          <g>
            <path d={d} stroke={PAL.ink} strokeWidth={10 * sc} fill="none" strokeLinecap="round" />
            <path d={d} stroke={color} strokeWidth={7 * sc} fill="none" strokeLinecap="round" />
          </g>
        );
      };
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.42]} lightColor={["#ff9a5a", "#ffd8a0"]} far="#5a4a6a" mid="#4a4a3a" ground="#4a3a28" mist="#f0b080" />
          <River g={g} y={g.ground - 60 * g.s} pan={pan} color="#5a5a7a" />
          <rect x={g.x - 50 * g.s} y={g.ground - 22 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#4a3a28" />
          <Palisade x={g.x + g.W * 0.02 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.22} s={g.s * 0.9} />
          <Tent x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 18 * g.s} w={130 * g.s} s={g.s} glow={0.5} />
          <Banner x={g.x + g.W * 0.27 + pan * 0.5} y={g.ground - 18 * g.s} s={g.s} color={RED} />
          <Fire x={g.x + g.W * 0.66 + pan * 0.7} y={g.ground} h={40 * g.s} seed={4} />
          <Fighter x={cx - 44 * sc} y={g.ground + 2 * g.s} scale={sc} mode="stand" costume={C.siam} weapon="none" phase={0} />
          <Fighter x={cx + 44 * sc} y={g.ground + 2 * g.s} scale={sc} mode="stand" flip costume={C.rebel} weapon="none" phase={1.5} />
          {arm(cx - 38 * sc, C.siam.jacket)}
          {arm(cx + 38 * sc, C.rebel.jacket)}
          <circle cx={clasp[0]} cy={clasp[1]} r={7 * sc} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Grass g={g} shift={pan * 1.6} color="#2a2a18" />
        </g>
      );
    }}
  </V2>
);

// --- brother: the ร.5 remark, pictured — an oarless boat in the reeds, turned whichever way the wind blows ---
const DriftScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const wind = Math.sin((frame - start) * 0.045);
  return (
    <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#6a7a9a", "#d8c8a8"]} accent={GOLD}>
      {(g, pan) => {
        const bx = g.cx + wind * 110 * g.s + pan * 0.7;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.3, 0.25]} lightColor={["#fff0c8", "#fffaf0"]} far="#8a8aa0" mid="#7a8a68" ground="#5a6a48" mist="#e8e0d0" />
            <River g={g} y={g.ground - 70 * g.s} pan={pan} color="#6a8aa0" />
            <Reeds g={g} y={g.ground - 66 * g.s} wind={wind} shift={pan * 0.5} color="#7a8a4a" n={18} h={60} />
            <g transform={`rotate(${wind * 8},${bx},${g.ground - 20 * g.s})`}>
              <Boat x={bx} y={g.ground - 14 * g.s} w={170 * g.s} s={g.s} n={0} dir={wind > 0 ? 1 : -1} />
              <Noble x={bx} y={g.ground - 28 * g.s} scale={g.sc * 0.6} mode="sit" jacket="#8a2a22" flip={wind < 0} />
            </g>
            <WindStreaks g={g} dir={wind > 0 ? 1 : -1} opacity={0.35 + 0.3 * Math.abs(wind)} />
            <Reeds g={g} y={g.y + g.H} wind={wind} shift={pan * 1.6} color="#3a4a24" n={14} h={70} />
          </g>
        );
      }}
    </V2>
  );
};

// --- march: the rebel boats come down the Chao Phraya at sunset ---
const RebelFleetScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.ramanya} start={start} end={end} sky={["#4a2a3a", "#e08a4a"]} accent={RED}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.4]} lightColor={["#ff9a4a", "#ffe0a0"]} far="#5a4a5a" mid="#4a4a34" ground="#3a3424" mist="#f0a070" />
        <River g={g} y={g.ground - 80 * g.s} pan={pan} color="#5a5070" />
        <Boat x={g.x + g.W * 0.3 + lt * 0.8 * g.s + pan * 0.5} y={g.ground - 60 * g.s} w={120 * g.s} s={g.s * 0.7} n={3} costume={C.rebel} />
        <Banner x={g.x + g.W * 0.26 + lt * 0.8 * g.s + pan * 0.5} y={g.ground - 70 * g.s} s={g.s * 0.6} color={RED} />
        {[0, 1].map((i) => {
          const bx = g.x + g.W * (0.1 + i * 0.45) + lt * 1.3 * g.s + pan * 0.7;
          return (
            <g key={i}>
              <Boat x={bx} y={g.ground - 6 * g.s} w={200 * g.s} s={g.s} n={4} costume={C.rebel} />
              <Banner x={bx - 70 * g.s} y={g.ground - 20 * g.s} s={g.s} color={RED} />
            </g>
          );
        })}
        <Reeds g={g} y={g.y + g.H} wind={0.2} shift={pan * 1.6} color="#2a2a1a" n={10} h={50} />
      </g>
    )}
  </V2>
);

// --- night: boats slip across the dark river towards the palace wall ---
const NightCrossScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#060a1c", "#1c1f3a"]} accent={RED} warm={0.02}>
    {(g, pan, lt) => (
      <g>
        <Stars g={g} />
        <Backdrop g={g} pan={pan} light={[0.12, 0.18]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#151a30" mid="#1a1c26" ground="#12100c" mist="#5a6080" ridges={false} />
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 110 * g.s} w={g.W * 0.55} h={50 * g.s} s={g.s * 0.7} color="#8a8478" />
        {[0.58, 0.72, 0.88].map((f) => <circle key={f} cx={g.x + g.W * f + pan * 0.2} cy={g.ground - 140 * g.s} r={5 * g.s} fill="#ffcf7a" opacity={0.8} />)}
        <River g={g} y={g.ground - 104 * g.s} pan={pan} color="#0e1a2e" night />
        {[0, 1].map((i) => {
          const bx = g.x + g.W * (0.08 + i * 0.3) + lt * 1.1 * g.s + pan * 0.7;
          const by = g.ground - (20 + i * 44) * g.s;
          return (
            <g key={i}>
              <Boat x={bx} y={by} w={(190 - i * 40) * g.s} s={g.s * (1 - i * 0.2)} n={3} costume={C.rebel} />
              <Torch x={bx + 60 * g.s} y={by - 20 * g.s} s={g.s * 0.8} h={50} seed={i} />
            </g>
          );
        })}
        <Grass g={g} shift={pan * 1.6} color="#0a0e0a" />
      </g>
    )}
  </V2>
);

// --- night: ladders on the palace wall; defenders fire down (Shot + impact on SHOTS) ---
const WallAssaultScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#0c0818", "#4a1e1a"]} accent={RED} hits={SHOTS}>
      {(g, pan, lt) => {
        const wx = g.x + g.W * 0.38 + pan * 0.5;
        const top = g.ground - 150 * g.s;
        const climb = interpolate(lt, [0, end - start], [0, 1], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.75, 0.3]} lightColor={["#ff7a2a", "#ffc25a"]} far="#2a1a24" mid="#241c1c" ground="#1e1810" mist="#ff8a4a" ridges={false} />
            <Fire x={g.x + g.W * 0.7 + pan * 0.2} y={top - 6 * g.s} h={70 * g.s} seed={2} />
            <Smoke x={g.x + g.W * 0.72 + pan * 0.2} y={top - 60 * g.s} s={g.s} dark />
            <PalaceWall x={wx} y={g.ground - 4 * g.s} w={g.W * 0.7} h={146 * g.s} s={g.s} color="#bdb39c" />
            {[0.06, 0.22].map((f, i) => {
              const fx = wx + g.W * f;
              const k = Math.min(1, climb * (1.2 - i * 0.3));
              return (
                <g key={i}>
                  <Ladder x={fx - 60 * g.s} y={g.ground} x2={fx} y2={top} s={g.s} />
                  <Fighter x={fx - 60 * g.s + 60 * g.s * k * 0.8} y={g.ground - 150 * k * 0.8 * g.s} scale={g.sc * 0.55} mode="walk" costume={C.rebel} phase={i} />
                </g>
              );
            })}
            {SHOTS.map((h, i) => {
              const dx = wx + g.W * (0.32 + i * 0.12);
              const flash = frame >= h && frame < h + 5 ? 1 - (frame - h) / 5 : 0;
              return (
                <g key={h}>
                  <Fighter x={dx} y={top - 2 * g.s} scale={g.sc * 0.48} flip mode="aim" weapon="rifle" costume={C.guard} phase={i} flash={flash} />
                  <Shot from={[dx - 44 * g.s, top - 74 * g.s]} to={[g.x + g.W * (0.08 + i * 0.08) + pan * 0.7, g.ground - 4 * g.s]} t={frame - h} s={g.s} flight={10} />
                </g>
              );
            })}
            {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.09) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.7} mode={i === 1 ? "attack" : "run"} costume={C.rebel} phase={i * 1.4} />)}
            <Grass g={g} shift={pan * 1.6} color="#14180e" />
          </g>
        );
      }}
    </V2>
  );
};

// --- loyal: the palace guard holds the gate by torchlight ---
const GateGuardScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#120c20", "#5a2a1a"]} accent={GOLD} hits={CLASH}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.55, 0.3]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1e2a" mid="#2a2420" ground="#2a2018" mist="#ff9a5a" ridges={false} />
          <PalaceWall x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 10 * g.s} w={g.W * 0.72} h={120 * g.s} s={g.s} color="#cfc6b0" gateAt={0.42} />
          <Banner x={g.x + g.W * 0.48 + pan * 0.5} y={g.ground - 130 * g.s} s={g.s} color={GOLD} />
          <Banner x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground - 130 * g.s} s={g.s} color={PAL.ochre} />
          {[0, 1, 2, 3].map((i) => {
            const x = g.x + g.W * (0.46 + i * 0.12) + pan * 0.7;
            return (
              <g key={i}>
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.66} flip mode={i === 0 ? "attack" : "stand"} costume={C.guard} phase={i} />
                {i % 2 === 1 && <Torch x={x - 22 * g.s} y={g.ground - 40 * g.s} s={g.s} h={70} seed={i * 3} />}
              </g>
            );
          })}
          {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.2 + i * 0.12) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="attack" costume={C.rebel} phase={i * 2} />)}
          {CLASH.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.4 + pan * 0.7} cy={g.ground - 90 * g.s} r={22 * g.s} fill="#fff6c8" opacity={0.85} /> : null))}
          <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
        </g>
      )}
    </V2>
  );
};

// --- loyal: the oath — kneeling nobles raise their swords before the king ---
const OathScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const up = sk(frame, T.swear, T.swear + 12);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a1410", "#6a3418"]} accent={GOLD} warm={0.12}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a1c10" />
          {[0.08, 0.3, 0.6, 0.86].map((f) => <rect key={f} x={g.x + g.W * f - 12 * g.s + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#6a2e14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
          <King x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 14 * g.s} scale={g.sc * 0.66} light={0.5} />
          <Candle x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} />
          {[0, 1, 2, 3].map((i) => {
            const x = g.x + g.W * (0.1 + i * 0.14) + pan * 0.7;
            const sc = g.sc * 0.62;
            const a = ((20 + up * 50) * Math.PI) / 180;
            const hx = x + 24 * sc;
            const hy = g.ground - 6 * g.s - 46 * sc;
            const tx = hx + Math.sin(a) * 70 * sc;
            const ty = hy - Math.cos(a) * 70 * sc;
            return (
              <g key={i}>
                <Noble x={x} y={g.ground - 6 * g.s} scale={sc} mode="kneel" bow={0.1} phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />
                <line x1={hx} y1={hy} x2={tx} y2={ty} stroke={PAL.ink} strokeWidth={6 * g.s} strokeLinecap="round" />
                <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="#d8dcde" strokeWidth={3.5 * g.s} strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      )}
    </V2>
  );
};

// --- surrender: morning over the smoking wall; the palace gate opens ---
const MorningGateScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e8a87a", "#f8e0b8"]} accent={GOLD} hits={[GATE]}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.4]} lightColor={["#ffc07a", "#fff0c8"]} far="#b08a8a" mid="#8a7a5a" ground="#7a6040" mist="#fff0d8" />
          <Birds g={g} lt={lt} />
          <Smoke x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 140 * g.s} s={g.s} />
          <Smoke x={g.x + g.W * 0.78 + pan * 0.5} y={g.ground - 140 * g.s} s={g.s} n={4} />
          <PalaceWall x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.8} h={120 * g.s} s={g.s} gateAt={0.5} gateOpen={sk(frame, GATE, GATE + 20) * 0.9} />
          <Fighter x={g.x + g.W * 0.36 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" costume={C.guard} phase={1} />
          <Fighter x={g.x + g.W * 0.66 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={C.guard} phase={2} />
          <Grass g={g} shift={pan * 1.6} color="#4a5a30" />
        </g>
      )}
    </V2>
  );
};

// --- ordain: a court lady writes her memoir by the morning window ---
const MemoirScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a2414", "#5a3a20"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2e18" />
        <g transform={`translate(${pan * 0.2},0)`}>
          <rect x={g.x + g.W * 0.58} y={g.y + 40 * g.s} width={g.W * 0.3} height={170 * g.s} fill="#f8d8a0" stroke={PAL.ink} strokeWidth={3 * g.s} />
          <circle cx={g.x + g.W * 0.7} cy={g.y + (150 - lt * 0.15) * g.s} r={30 * g.s} fill="#fff0c8" />
          <rect x={g.x + g.W * 0.58} y={g.y + 160 * g.s} width={g.W * 0.3} height={50 * g.s} fill="#8a9a6a" />
          <line x1={g.x + g.W * 0.73} y1={g.y + 40 * g.s} x2={g.x + g.W * 0.73} y2={g.y + 210 * g.s} stroke="#4a2e18" strokeWidth={8 * g.s} />
        </g>
        <path d={`M${g.x + g.W * 0.58 + pan * 0.2} ${g.y + 210 * g.s} L${g.x + g.W * 0.4} ${g.ground} L${g.x + g.W * 0.98} ${g.ground} L${g.x + g.W * 0.88 + pan * 0.2} ${g.y + 210 * g.s} Z`} fill="#ffe0a0" opacity={0.18} />
        <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#6a4426" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Manuscript x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 34 * g.s} w={220 * g.s} s={g.s} fade={interpolate(lt, [0, 80], [0.3, 1], clamp)} dark={false} />
        <Noble x={g.x + g.W * 0.18 + pan * 0.7} y={g.ground - 26 * g.s} scale={g.sc * 0.68} mode="kneel" bow={0.25} jacket="#b0586a" />
        <line x1={g.x + g.W * 0.24 + pan * 0.7} y1={g.ground - 70 * g.s} x2={g.x + g.W * 0.31 + pan * 0.7} y2={g.ground - 52 * g.s} stroke={PAL.ink} strokeWidth={2.4 * g.s} />
      </g>
    )}
  </V2>
);

// --- ordain: Taksin as a monk at Wat Chaeng, calm morning light ---
const OrdainScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#f0b880", "#fbe9c8"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.35]} lightColor={["#ffd08a", "#fff4d8"]} far="#c8a888" mid="#9a8a68" ground="#8a7048" mist="#fff4e0" ridges={false} />
        <Prang x={g.x + g.W * 0.72 + pan * 0.2} y={g.ground - 40 * g.s} h={250 * g.s} s={g.s} color="#e0d4b8" gold />
        <Prang x={g.x + g.W * 0.9 + pan * 0.2} y={g.ground - 40 * g.s} h={120 * g.s} s={g.s} color="#d0c4a8" />
        <Hall x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 20 * g.s} w={230 * g.s} s={g.s} glow={0.4} />
        <Monk x={g.x + g.W * 0.44 + pan * 0.7} y={g.ground} scale={g.sc * 0.95} mode="sit" />
        <Monk x={g.x + g.W * 0.6 + pan * 0.7} y={g.ground} scale={g.sc * 0.78} mode="stand" flip phase={1} />
        <Monk x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground} scale={g.sc * 0.78} mode="stand" phase={2} />
        <RobeTray x={g.x + g.W * 0.52 + pan * 0.7} y={g.ground} s={g.s * 1.3} />
        <Grass g={g} shift={pan * 1.6} color="#5a6a38" />
      </g>
    )}
  </V2>
);

// --- sanrules: Phraya San presides from a raised dais; officials prostrate ---
const SanCourtScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#4a2418", "#8a4a22"]} accent={RED} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2214" />
        {[0.15, 0.4, 0.65, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#7a2a18" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#33200f" />
        <rect x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 60 * g.s} width={200 * g.s} height={46 * g.s} fill="#6a3a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Noble x={g.x + g.W * 0.77 + pan * 0.5} y={g.ground - 60 * g.s} scale={g.sc * 0.85} mode="sit" flip jacket="#8a2a22" />
        <Banner x={g.x + g.W * 0.92 + pan * 0.5} y={g.ground - 60 * g.s} s={g.s * 0.8} color={RED} />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.13) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.6} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Candle x={g.x + g.W * 0.64 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s} />
      </g>
    )}
  </V2>
);

// --- sanrules: spearmen keep watch at Wat Chaeng; the monk sits within ---
const WatGuardScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#7a5a7a", "#e8b088"]} accent={RED}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.35]} lightColor={["#ffb07a", "#ffe8c8"]} far="#9a7a8a" mid="#7a6a58" ground="#6a5236" mist="#f8d0b0" ridges={false} />
        <Prang x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 60 * g.s} h={230 * g.s} s={g.s} color="#d8ccb0" gold />
        <PalaceWall x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 40 * g.s} w={g.W * 0.64} h={40 * g.s} s={g.s * 0.8} color="#efe6d0" />
        <Monk x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground} scale={g.sc * 0.8} mode="sit" />
        {[0.1, 0.28, 0.72, 0.9].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" flip={i >= 2} costume={C.rebel} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
      </g>
    )}
  </V2>
);

const WALL = T.army - 12;

export const e4c3: Chapter4 = {
  name: "กบฏกรุงเก่า",
  from: T.spark,
  to: END,
  cams: (w, h) => [
    { frame: T.spark + 4, cam: view(AYUT_V, w, h, 1, 0.08) },
    { frame: T.ps, cam: view(AYUT_V, w, h, 1, 0.08) },
    { frame: T.ps + 30, cam: view(RIVER_V, w, h, 1, 0.09) },
    { frame: T.ramanya - 6, cam: view(RIVER_V, w, h, 1, 0.09) },
    { frame: T.ramanya + 30, cam: view(VW.thonWide, w, h, 1, 0.03) },
    { frame: T.night, cam: view(VW.thonWide, w, h, 1, 0.03) },
    { frame: T.night + 35, cam: view(VW.thonWide, w, h, 1.35, 0.08) },
    { frame: T.chaeng, cam: view(VW.thonWide, w, h, 1.4, 0.08) },
  ],
  years: [[T.spark, "2325"]],
  night: (f) => interpolate(f, [T.night - 20, T.night + 20, T.surr, T.morning + 30], [0, 1, 1, 0], clamp),
  heads: [
    { f: T.spark, tag: "เฉลย: ขุดสมบัติ", head: "กรุงเก่าลุกฮือ", color: GOLD },
    { f: T.rise, tag: "นายบุนนาค ชาวบ้านแม่ลา", head: "รวมคนลุกขึ้นสู้", color: RED },
    { f: T.ps, tag: "พระยาสรรค์ เจ้าเมืองสรรค์บุรี", head: "ไปปราบกบฏ", color: GOLD, portrait: "phraya_san" },
    { f: T.turn, tag: "พระยาสรรค์", head: "แต่เข้ากับกบฏ", color: RED, portrait: "phraya_san" },
    { f: T.bro, tag: "ขุนแก้ว น้องชาย", head: "อยู่ฝ่ายกบฏอยู่ก่อนแล้ว", color: RED },
    { f: T.r5, tag: "ร.5 ทรงวิจารณ์ (ถอดความ)", head: "“ใครผลักไปทางไหน ก็ไปทางนั้น”", color: GOLD },
    { f: T.march, tag: "ทัพกบฏ", head: "ล่องลงธนบุรี", color: RED },
    { f: T.ramanya, tag: "คลองรามัญ", head: "ตรงข้ามพระราชวัง", color: RED },
    { f: T.night, tag: "ตีสี่ ต้นมีนาคม 2325", head: "บุกพระราชวัง", color: RED },
    { f: T.loyal, tag: "ขุนนางผู้จงรักภักดี", head: "สู้ทั้งคืน", color: GOLD },
    { f: T.oath, tag: "บันทึกเล่าว่า", head: "“ตายด้วยเจ้า”", color: GOLD },
    { f: T.surr, tag: "รุ่งเช้า", head: "ทรงขอผนวช", color: GOLD, portrait: "taksin_king" },
    { f: T.ord, tag: "บันทึกกรมหลวงนรินทรเทวี", head: "ผนวชที่วัดแจ้ง", stat: "9 โมงเช้า", color: GOLD },
    { f: T.reign, tag: "ผนวชที่วัดแจ้ง", head: "ครองราชย์", stat: (f) => `${Math.round(interpolate(f, [T.reign, T.reign + 20], [0, 14], clamp))} ปี`, label: "กับ 4 เดือน", color: GOLD, portrait: "taksin_king" },
    { f: T.san, tag: "พระยาสรรค์", head: "ว่าราชการแทน", color: RED, portrait: "phraya_san" },
    { f: T.watch, tag: "วัดแจ้ง", head: "ให้คนเฝ้าพระเจ้าตาก", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const toRed = sk(frame, T.turn, T.turn + 12);
    const out = interpolate(frame, [T.march, T.march + 15], [1, 0], clamp);
    return (
      <>
        <Zones k={{ siam: interpolate(frame, [T.spark, T.spark + 15, T.ramanya, T.ramanya + 20], [0, 0.25, 0.25, 0], clamp) }} />
        <Win a={T.spark} b={T.ramanya + 30}>
          <CityDot at={PL.ayut} color={RED} r={14} start={T.spark} end={T.ramanya + 20} />
          <PointLabel at={PL.ayut} text="กรุงเก่า" start={T.spark + 6} color={RED} size={0.85} />
          <Ring at={PL.ayut} r={0.05} start={T.rise} end={T.ps + 20} />
        </Win>
        <Win a={T.sanb} b={T.ramanya + 20}>
          <PointLabel at={PL.sanburi} text="สรรค์บุรี" start={T.sanb} color={GOLD} size={0.8} />
        </Win>
        <Arrow points={R.sanToAyut} start={T.go} end={T.go + 35} color={GOLD} width={16} opacity={(1 - toRed) * out} />
        <Arrow points={R.sanToAyut} start={T.go} end={T.go + 35} color={RED} width={16} opacity={toRed * out} />
        <Ring at={PL.ayut} r={0.06} start={T.turn} end={T.march} />
        <Win a={T.march} b={T.night + 40}>
          <Arrow points={R.rebelsDown} start={T.march + 8} end={T.ramanya} color={RED} width={18} opacity={interpolate(frame, [T.night, T.night + 30], [1, 0], clamp)} />
          <PointLabel at={PL.thon} text="ธนบุรี" start={T.march + 10} color={GOLD} size={0.85} />
        </Win>
        <Win a={T.ramanya} b={T.storm + 40}>
          <PointLabel at={PL.ramanya} text="คลองรามัญ" start={T.ramanya + 8} color={RED} size={0.75} />
        </Win>
        <Arrow points={CROSS} start={T.storm - 26} end={T.storm + 8} color={RED} width={14} opacity={interpolate(frame, [T.surr, T.surr + 20], [1, 0], clamp)} />
        <Win a={T.night + 30} b={T.chaeng}>
          <PointLabel at={PL.thon} text="พระราชวัง" start={T.night + 30} color={GOLD} size={0.8} />
        </Win>
        <Ring at={PL.thon} r={0.002} color={GOLD} start={T.loyal} end={T.surr} />
        <Win a={T.chaeng} b={END + 4}>
          <PointLabel at={PL.watArun} text="วัดแจ้ง" start={T.chaeng} color={GOLD} size={0.85} />
        </Win>
        <Ring at={PL.watArun} r={0.0025} color={RED} start={T.watch} end={END + 200} />
      </>
    );
  },
  Panels: () => (
    <>
      <RuinDigScene id="e4c3dig" start={T.p1} end={T.rise + 14} />
      <UprisingScene id="e4c3rise" start={T.rise} end={T.ps + 14} />
      <SanMarchScene id="e4c3sanmarch" start={T.ps} end={T.but + 14} />
      <TurnCoatScene id="e4c3turn" start={T.but} end={T.bro + 14} />
      <BrothersScene id="e4c3bro" start={T.bro} end={T.r5 + 14} />
      <DriftScene id="e4c3drift" start={T.r5} end={T.march + 14} />
      <RebelFleetScene id="e4c3fleet" start={T.march} end={T.night + 14} />
      <NightCrossScene id="e4c3cross" start={T.night} end={WALL + 14} />
      <WallAssaultScene id="e4c3wall" start={WALL} end={T.loyal + 14} />
      <GateGuardScene id="e4c3gate" start={T.loyal} end={T.oath + 14} />
      <OathScene id="e4c3oath" start={T.oath} end={T.surr + 14} />
      <MorningGateScene id="e4c3morning" start={T.surr} end={T.ord + 14} />
      <MemoirScene id="e4c3memoir" start={T.ord} end={T.monk + 14} />
      <OrdainScene id="e4c3ordain" start={T.monk} end={T.san + 14} />
      <SanCourtScene id="e4c3court" start={T.san} end={T.guard + 14} />
      <WatGuardScene id="e4c3watguard" start={T.guard} end={END + 14} />
    </>
  ),
  sfx: [
    [T.rise, SFX.pop, 0.3],
    [T.sanb, SFX.pop, 0.3],
    [T.ps + 24, SFX.whoosh, 0.3],
    [T.turn, SFX.hit, 0.35],
    [T.r5, SFX.pop, 0.3],
    [T.ramanya - 6, SFX.whoosh, 0.3],
    [T.ramanya + 8, SFX.pop, 0.3],
    [T.night + 29, SFX.whoosh, 0.3],
    [T.chaeng, SFX.pop, 0.3],
    [T.reign, SFX.tick, 0.3],
    [T.reign + 10, SFX.tick, 0.3],
    [T.reign + 20, SFX.hit, 0.3],
    [T.watch, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="fire_crackle" from={T.p1 - 6} to={T.ps + 14} volume={0.25} voice={VOICE} />
      <Bed id="wind" from={T.p1 - 6} to={T.rise + 14} volume={0.18} voice={VOICE} />
      {DIG.map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.3} />)}
      <Bed id="crowd_angry" from={T.rise - 6} to={T.ps + 14} volume={0.3} voice={VOICE} />
      <Hit id="wood_hit" at={RIOT[0]} volume={0.45} />
      <Hit id="sword_clash" at={RIOT[1]} volume={0.45} />
      <Bed id="army_marching" from={T.ps - 6} to={T.bro + 14} volume={0.25} voice={VOICE} />
      <Hit id="war_drums" at={T.turn} volume={0.4} />
      <Bed id="fire_crackle" from={T.bro - 6} to={T.r5 + 14} volume={0.22} voice={VOICE} />
      <Bed id="wind" from={T.r5 - 6} to={T.march + 14} volume={0.25} voice={VOICE} />
      <Bed id="ship_creak" from={T.march - 6} to={WALL + 14} volume={0.22} voice={VOICE} />
      <Bed id="wind" from={T.night - 6} to={WALL + 14} volume={0.15} voice={VOICE} />
      <Bed id="crowd_riot" from={WALL - 6} to={T.oath + 14} volume={0.28} voice={VOICE} />
      <Bed id="fire_crackle" from={WALL - 6} to={T.surr + 14} volume={0.25} voice={VOICE} />
      {SHOTS.map((f, i) => <Hit key={f} id={i % 2 ? "cannon_old" : "rifle_echo"} at={f} volume={0.45} />)}
      {CLASH.map((f, i) => <Hit key={f} id={i % 2 ? "sword_battle" : "sword_clash"} at={f} volume={0.42} />)}
      <Hit id="sword_draw" at={T.swear} volume={0.4} />
      <Bed id="wind" from={T.surr - 6} to={T.monk + 14} volume={0.2} voice={VOICE} />
      <Hit id="wood_hit" at={GATE} volume={0.4} />
      <Hit id="gong" at={T.robe} volume={0.4} />
      <Bed id="wind" from={T.monk - 6} to={T.san + 14} volume={0.16} voice={VOICE} />
      <Bed id="city_crowd" from={T.san - 6} to={T.guard + 14} volume={0.16} voice={VOICE} />
      <Bed id="wind" from={T.guard - 6} to={END + 14} volume={0.2} voice={VOICE} />
    </>
  ),
};
