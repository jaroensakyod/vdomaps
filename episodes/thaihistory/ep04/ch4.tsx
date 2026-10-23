import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { Shot } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { B, CityDot, Measure, Ring, VIET_C, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { Bars, Chain, Horse, Makruk, Rain, Stars, Tent, Torch, Win } from "./ch3_kit";
import { PL, R, VW } from "./places";
import { Backdrop, Banner, Boat, C, Candle, Fighter, Fire, Grass, House, Monk, Noble, PAL, PalaceWall, Palisade, Prang, River, Smoke, Tree, V2 } from "./v2";

// Chapter 4 of episode 4 (beats chaos → quiz2): Thonburi without a ruler — fires and looting, Prince Anurak
// Songkhram armed, Phraya San wavers, news reaches Chao Phraya Chakri in Cambodia, truce, the Bang Kok Noi battle.

const T = {
  chaos: B.chaos.start,
  fire: wf("chaos", "ไฟ", 0.66),
  anurak: B.anurak.start,
  free: wf("anurak", "ปล่อย", 0.12),
  nephew: wf("anurak", "หลาน", 0.43),
  arm: wf("anurak", "ถือ", 0.9),
  waver: B.waver.start,
  but: wf("waver", "แต่", 0.48),
  hesit: wf("waver", "ลังเล", 0.68),
  game: wf("waver", "เกม", 0.89),
  news: B.news.start,
  khmer: wf("news", "กัมพูชา", 0.32),
  rec: wf("news", "บันทึก", 0.4),
  truce: B.truce.start,
  talk: wf("truce", "เจรจา", 0.52),
  back: wf("truce", "ถอยทัพ", 0.88),
  bkn: B.bangkoknoi.start,
  korat: wf("bangkoknoi", "โคราช", 0.59),
  fight: wf("bangkoknoi", "แล้ว", 0.69),
  battle: wf("bangkoknoi", "รบ", 0.74),
  win: B.win.start,
  won: wf("win", "ชนะ", 0.18),
  before: wf("win", "ใหญ่", 0.4),
  quiz: B.quiz2.start,
  king: wf("quiz2", "เจอ", 0.45),
  what: wf("quiz2", "อะไร", 0.92),
};
const END = B.dawn.start;

// Views framed between the top card and the panel (wide boxes: the width sets the zoom).
const EAST_V = bbox([[99.6, 12.6], [106.0, 13.4]]);
const KORAT_V = bbox([[99.6, 14.2], [102.8, 14.6]]);

// One schedule per action.
const BURN = [T.fire, T.fire + 40];
const BREAK = T.free;
const THUNDER = T.news + 30;
const GUNS = [T.battle, T.battle + 16, T.battle + 34, T.battle + 54].filter((f) => f < T.win + 8);
const CLASH = [T.fight + 8, T.battle + 26, T.battle + 44].filter((f) => f < T.win + 8);
const TWO_WAY_A: [number, number][] = [[100.4893, 13.7432], [100.505, 13.749], [100.522, 13.758]];
const TWO_WAY_B: [number, number][] = [[100.4893, 13.7432], [100.473, 13.737], [100.457, 13.727]];
const SCATTER: [number, number][][] = [
  [[100.4893, 13.758], [100.476, 13.772]],
  [[100.4893, 13.758], [100.47, 13.752]],
  [[100.4893, 13.758], [100.482, 13.742]],
];
const FIRES: [number, number][] = [[100.482, 13.738], [100.495, 13.733], [100.476, 13.75], [100.5, 13.755]];

const sk = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);

// Flickering fire spots on the map (looting and arson in the city).
const FireDots = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < start || frame > end + 15) return null;
  return (
    <g>
      {FIRES.map((p, i) => {
        const q = projection(p);
        const k = sk(frame, start + i * 8, start + i * 8 + 10) * interpolate(frame, [end, end + 15], [1, 0], clamp);
        if (!q || k <= 0) return null;
        const f = 1 + 0.2 * Math.sin(frame * 0.5 + i * 2);
        return (
          <g key={i} opacity={k}>
            <circle cx={q[0]} cy={q[1]} r={46 * s * f} fill="#ff6a1a" opacity={0.3} />
            <path d={`M${q[0] - 12 * s} ${q[1]} Q${q[0]} ${q[1] - 40 * s * f} ${q[0] + 12 * s} ${q[1]} Z`} fill="#ffb02a" stroke="#c9302c" strokeWidth={2 * s} />
          </g>
        );
      })}
    </g>
  );
};

// --- chaos: canal-side houses burn, people flee, black smoke ---
const CanalFireScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1a0e10", "#7a3218"]} accent={RED} hits={BURN}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.45]} lightColor={["#ff6a1a", "#ffb04a"]} far="#3a1e1e" mid="#2e2018" ground="#2a1c12" mist="#ff8a4a" ridges={false} />
          <Smoke x={g.x + g.W * 0.25 + pan * 0.2} y={g.ground - 170 * g.s} s={g.s} dark />
          <Smoke x={g.x + g.W * 0.62 + pan * 0.2} y={g.ground - 170 * g.s} s={g.s} dark n={7} />
          {[0.08, 0.36, 0.6].map((f, i) => (
            <House key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 60 * g.s} w={(150 - i * 10) * g.s} s={g.s} burn={i === 1 ? sk(frame, BURN[0], BURN[0] + 20) : 0.6 + i * 0.1} />
          ))}
          <River g={g} y={g.ground - 54 * g.s} pan={pan} color="#3a2a2a" night />
          <Boat x={g.x + g.W * 0.82 + pan * 0.5 - lt * 0.6 * g.s} y={g.ground - 40 * g.s} w={120 * g.s} s={g.s * 0.7} n={2} dir={-1} costume={C.villager} />
          {[0, 1, 2, 3].map((i) => (
            <Fighter key={i} x={g.x + g.W * (0.2 + i * 0.18) + pan * 0.7 + Math.sin(lt * 0.05 + i) * 20 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode="run" flip={i % 2 === 1} costume={i % 2 ? C.villager : C.rebel} weapon={i === 3 ? "spear" : "none"} phase={i * 1.7} />
          ))}
          <Grass g={g} shift={pan * 1.6} color="#140e0a" />
        </g>
      )}
    </V2>
  );
};

// --- anurak: the cell door swings open, the chains fall ---
const JailScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const open = sk(frame, BREAK, BREAK + 14);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1a1612", "#3a2e22"]} accent={GOLD} hits={[BREAK]} warm={0.06}>
      {(g, pan) => {
        const px = g.x + g.W * 0.42 + pan * 0.7;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a241e" />
            {Array.from({ length: 7 }, (_, r) => Array.from({ length: 9 }, (_, c) => <rect key={`${r}${c}`} x={g.x + c * 120 * g.s + (r % 2) * 60 * g.s + pan * 0.2} y={g.y + r * 46 * g.s} width={116 * g.s} height={42 * g.s} fill="#3a3028" stroke="#1a140f" strokeWidth={1.5 * g.s} />))}
            <path d={`M${g.x + g.W * 0.7 + pan * 0.5} ${g.y + 40 * g.s} l${80 * g.s} 0 l${120 * g.s} ${g.H} l${-200 * g.s} 0 Z`} fill="#ffe0a0" opacity={0.12 + open * 0.25} />
            <rect x={g.x - 50 * g.s} y={g.ground - 14 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#1e1a14" />
            <Fighter x={px} y={g.ground + 2 * g.s} scale={g.sc * 0.68} mode={open > 0.5 ? "walk" : "stand"} costume={{ ...C.siam, jacket: "#5a5a6a" }} weapon="none" phase={1} />
            <Chain a={[px - 20 * g.s, g.ground - 70 * g.s]} b={[px + 30 * g.s, g.ground - 70 * g.s]} s={g.s} broken={open} />
            <Bars x={g.x + g.W * 0.6 + pan * 0.7} y={g.ground} w={170 * g.s} h={200 * g.s} s={g.s} open={open} />
            <Fighter x={g.x + g.W * 0.84 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.66} flip mode="stand" costume={C.rebel} phase={2} />
            <Torch x={g.x + g.W * 0.95 + pan * 0.7} y={g.ground - 50 * g.s} s={g.s} h={60} seed={3} />
          </g>
        );
      }}
    </V2>
  );
};

// --- anurak: the prince takes up arms in the courtyard ---
const ArmedScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const raise = sk(frame, T.arm, T.arm + 10);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#5a3a3a", "#d89a6a"]} accent={RED} hits={[T.arm]}>
      {(g, pan) => {
        const px = g.x + g.W * 0.46 + pan * 0.7;
        const hx = px + 22 * g.sc * 0.72;
        const hy = g.ground - 96 * g.sc * 0.72;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.8, 0.3]} lightColor={["#ffb07a", "#ffe8c8"]} far="#8a6a6a" mid="#6a5a48" ground="#6a5236" mist="#f8c8a0" />
            <PalaceWall x={g.x + pan * 0.5} y={g.ground - 30 * g.s} w={g.W * 1.05} h={70 * g.s} s={g.s * 0.8} color="#d8ccb0" />
            <g transform={`translate(${g.x + g.W * 0.18 + pan * 0.7},0)`}>
              <rect x={-60 * g.s} y={g.ground - 30 * g.s} width={120 * g.s} height={10 * g.s} fill="#5a3a1f" />
              {Array.from({ length: 6 }, (_, i) => <line key={i} x1={(-50 + i * 20) * g.s} y1={g.ground - 20 * g.s} x2={(-46 + i * 20) * g.s} y2={g.ground - 150 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />)}
            </g>
            <Fighter x={px} y={g.ground + 2 * g.s} scale={g.sc * 0.72} mode="stand" costume={{ ...C.siam, head: "topknot" }} weapon="none" phase={0} />
            <line x1={hx} y1={hy} x2={hx + (20 + raise * 10) * g.s} y2={hy - (40 + raise * 60) * g.s} stroke={PAL.ink} strokeWidth={7 * g.s} strokeLinecap="round" />
            <line x1={hx} y1={hy} x2={hx + (20 + raise * 10) * g.s} y2={hy - (40 + raise * 60) * g.s} stroke="#dfe3e6" strokeWidth={4 * g.s} strokeLinecap="round" />
            {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.64 + i * 0.11) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode={raise > 0.5 ? "walk" : "stand"} costume={C.siam} phase={i} />)}
            <Banner x={g.x + g.W * 0.94 + pan * 0.7} y={g.ground} s={g.s} color={GOLD} />
            <Grass g={g} shift={pan * 1.6} color="#3a3a20" />
          </g>
        );
      }}
    </V2>
  );
};

// --- waver: rebels on the palisade look east, waiting for Chakri's army ---
const WaitScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e8b080", "#a8c0d8"]} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.9, 0.5]} lightColor={["#ffc890", "#fff0d0"]} far="#8a8aa8" mid="#6a7a5a" ground="#6a5236" mist="#ffe0c0" />
        <Tree x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s} kind="palm" />
        <Tree x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 0.8} />
        <g transform={`translate(${g.x + g.W * 0.3 + pan * 0.7},${g.ground})`}>
          {[-50, 50].map((d) => <line key={d} x1={d * g.s} y1={0} x2={d * 0.6 * g.s} y2={-150 * g.s} stroke="#5a3a1f" strokeWidth={6 * g.s} />)}
          <rect x={-50 * g.s} y={-160 * g.s} width={100 * g.s} height={14 * g.s} fill="#7a4a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
        </g>
        <Fighter x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 158 * g.s} scale={g.sc * 0.5} mode="stand" costume={C.rebel} weapon="none" phase={0} />
        <Banner x={g.x + g.W * 0.25 + pan * 0.7} y={g.ground - 158 * g.s} s={g.s * 0.7} color={RED} />
        <Palisade x={g.x - 10 * g.s + pan * 0.7} y={g.ground} w={g.W * 0.22} s={g.s} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.42 + i * 0.1) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" costume={C.rebel} phase={i * 1.2} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a4a24" />
      </g>
    )}
  </V2>
);

// --- waver: "his own game" — Phraya San alone over a makruk board by lamplight ---
const MakrukScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1e140c", "#3a2414"]} accent={RED} warm={0.12} hits={[T.game]}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1a10" />
          {[0.1, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#4a2a14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#4a2e18" />
          <Makruk x={g.x + g.W * 0.36 + pan * 0.5} y={g.ground - 40 * g.s} w={300 * g.s} s={g.s} move={sk(frame, T.game - 8, T.game)} />
          <Noble x={g.x + g.W * 0.24 + pan * 0.7} y={g.ground - 10 * g.s} scale={g.sc * 0.8} mode="sit" jacket="#8a2a22" phase={1} />
          <Candle x={g.x + g.W * 0.78 + pan * 0.7} y={g.ground - 30 * g.s} s={g.s * 1.4} />
        </g>
      )}
    </V2>
  );
};

// --- news: a rider gallops through the rain towards Cambodia ---
const CourierScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const flash = frame >= THUNDER && frame < THUNDER + 8 ? 1 - (frame - THUNDER) / 8 : 0;
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1e2632", "#4a5a6a"]} accent={GOLD} hits={[THUNDER]} warm={0.02}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#3a4252" mid="#34402e" ground="#3a3020" mist="#9aa8b8" />
          {flash > 0 && <path d={`M${g.x + g.W * 0.7} ${g.y} l${-20 * g.s} ${60 * g.s} l${24 * g.s} 0 l${-30 * g.s} ${80 * g.s}`} stroke="#f4f8ff" strokeWidth={4 * g.s} fill="none" opacity={flash} />}
          <Tree x={g.x + g.W * 0.15 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s} />
          <Tree x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 0.9} kind="palm" />
          <Horse x={g.x + g.W * 0.48 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.8} rider={C.siam} />
          {[0, 1, 2].map((i) => <circle key={i} cx={g.x + g.W * 0.36 - i * 24 * g.s + pan * 0.7} cy={g.ground - 6 * g.s} r={(10 + i * 4) * g.s} fill="#6a5a40" opacity={0.4 - i * 0.1} />)}
          <Rain g={g} />
          <Grass g={g} shift={pan * 1.6} color="#1e2a18" />
          {flash > 0 && <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e8f0ff" opacity={flash * 0.35} />}
        </g>
      )}
    </V2>
  );
};

// --- news: in the camp in Cambodia, a kneeling messenger hands Chakri the letter ---
const LetterScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.siemreap} start={start} end={end} sky={["#1e1a24", "#3a2e2a"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={null} far="#2e2a36" mid="#2a2a22" ground="#2a2218" mist="#8a7a6a" />
        <Tent x={g.x + g.W * 0.02 + pan * 0.2} y={g.ground - 40 * g.s} w={140 * g.s} s={g.s} glow={0.6} />
        <Tent x={g.x + g.W * 0.8 + pan * 0.2} y={g.ground - 40 * g.s} w={120 * g.s} s={g.s} glow={0.3} />
        <path d={`M${g.x + g.W * 0.25 + pan * 0.5} ${g.ground} L${g.x + g.W * 0.25 + pan * 0.5} ${g.ground - 200 * g.s} L${g.x + g.W * 0.75 + pan * 0.5} ${g.ground - 200 * g.s} L${g.x + g.W * 0.75 + pan * 0.5} ${g.ground}`} fill="#5a4630" stroke={PAL.ink} strokeWidth={2 * g.s} opacity={0.9} />
        <Candle x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s * 1.3} />
        <Fighter x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.74} flip mode="stand" costume={{ ...C.siam, sash: PAL.gilt }} weapon="none" phase={0} />
        <Noble x={g.x + g.W * 0.38 + pan * 0.7} y={g.ground - 2 * g.s} scale={g.sc * 0.66} mode="kneel" bow={0.3} jacket="#5a5a4a" />
        <rect x={g.x + g.W * 0.45 + pan * 0.7} y={g.ground - 70 * g.s} width={30 * g.s} height={18 * g.s} fill="#efe2c0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
        <Rain g={g} n={30} opacity={0.25} />
        <Grass g={g} shift={pan * 1.6} color="#1a1e12" />
      </g>
    )}
  </V2>
);

// --- truce: two commanders meet under a white flag; the Siamese army turns for home ---
const TruceScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const turn = frame >= T.back;
  return (
    <V2 id={id} anchor={PL.phnompenh} start={start} end={end} sky={["#8ab0d0", "#f0dcb0"]} accent={GOLD}>
      {(g, pan, lt) => {
        const leave = Math.max(0, frame - T.back) * 1.6 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.2]} far="#8a9ab0" mid="#7a8a58" ground="#8a7a48" />
            <Tree x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 0.8} kind="palm" />
            <Banner x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground} s={g.s * 1.1} color="#f4f4f0" />
            <Fighter x={g.x + g.W * 0.44 + pan * 0.7 - (turn ? leave : 0)} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode={turn ? "walk" : "stand"} flip={turn} costume={{ ...C.siam, sash: PAL.gilt }} weapon="none" />
            <Fighter x={g.x + g.W * 0.57 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="stand" flip costume={C.viet} weapon="none" phase={1} />
            {[0, 1].map((i) => (
              <g key={`s${i}`}>
                <Fighter x={g.x + g.W * (0.08 + i * 0.12) + pan * 0.7 - (turn ? leave : 0)} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode={turn ? "walk" : "stand"} flip={turn} costume={C.siam} phase={i} />
                <Banner x={g.x + g.W * (0.04 + i * 0.12) + pan * 0.7 - (turn ? leave : 0)} y={g.ground} s={g.s} color={GOLD} />
              </g>
            ))}
            {[0, 1].map((i) => (
              <g key={`v${i}`}>
                <Fighter x={g.x + g.W * (0.8 + i * 0.12) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode="stand" flip costume={C.viet} phase={i + 2} />
                <Banner x={g.x + g.W * (0.82 + i * 0.12) + pan * 0.7} y={g.ground} s={g.s} color={VIET_C} />
              </g>
            ))}
            <Grass g={g} shift={pan * 1.6} color="#5a6a30" />
          </g>
        );
      }}
    </V2>
  );
};

// --- bangkoknoi: the column from Khorat comes down off the plateau ---
const KoratMarchScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.korat} start={start} end={end} sky={["#9ab8d0", "#f0e0c0"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} far="#7a8aa0" mid="#5a6a48" ground="#8a6a42" mist="#f8ead0" />
        <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = g.x + g.W * (0.04 + i * 0.13) + lt * 0.9 * g.s + pan * 0.7;
          return (
            <g key={i}>
              <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode="walk" costume={C.siam} phase={i * 0.8} />
              {i % 2 === 1 && <Banner x={x - 8 * g.s} y={g.ground} s={g.s} color={GOLD} />}
            </g>
          );
        })}
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={g.x + g.W * (0.08 + i * 0.16) + pan * 0.7} cy={g.ground - 4 * g.s} r={18 * g.s} fill="#c8a878" opacity={0.25} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// --- bangkoknoi: clash on the canal bank, muskets firing (Shot + impact on GUNS) ---
const CanalBattleScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bangkokNoi} start={start} end={end} sky={["#6a5a6a", "#d8a878"]} accent={RED} hits={[...GUNS, ...CLASH]}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.3]} lightColor={["#ffb070", "#ffe0b0"]} far="#7a6a7a" mid="#5a5a44" ground="#5a4630" mist="#f0c8a0" ridges={false} />
          <House x={g.x + g.W * 0.72 + pan * 0.2} y={g.ground - 70 * g.s} w={120 * g.s} s={g.s * 0.8} />
          <River g={g} y={g.ground - 66 * g.s} pan={pan} color="#5a6a7a" />
          <rect x={g.x - 50 * g.s} y={g.ground - 26 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a4630" />
          {[0, 1].map((j) => {
            const x = g.x + g.W * (0.1 + j * 0.12) + pan * 0.7;
            const mine = GUNS.filter((_, i) => i % 2 === j);
            const h = [...mine].reverse().find((f) => frame >= f) ?? -100;
            const flash = frame >= h && frame < h + 5 ? 1 - (frame - h) / 5 : 0;
            return (
              <g key={j}>
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="aim" weapon="rifle" costume={C.siam} phase={j} flash={flash} />
                {mine.map((f, k) => <Shot key={f} from={[x + 64 * g.s, g.ground - 88 * g.s]} to={[g.x + g.W * (0.76 + j * 0.06 + k * 0.04) + pan * 0.7, g.ground - 6 * g.s]} t={frame - f} s={g.s} flight={12} />)}
              </g>
            );
          })}
          <Fighter x={g.x + g.W * 0.44 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="attack" costume={C.siam} phase={0.5} />
          <Banner x={g.x + g.W * 0.34 + pan * 0.7} y={g.ground} s={g.s} color={GOLD} />
          <Fighter x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="attack" flip costume={C.rebel} phase={1.5} />
          <Fighter x={g.x + g.W * 0.7 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" flip costume={C.rebel} phase={2} />
          <Banner x={g.x + g.W * 0.76 + pan * 0.7} y={g.ground} s={g.s} color={RED} />
          {CLASH.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.5 + pan * 0.7} cy={g.ground - 90 * g.s} r={22 * g.s} fill="#fff6c8" opacity={0.85} /> : null))}
          <Grass g={g} shift={pan * 1.6} color="#2a3a1a" />
        </g>
      )}
    </V2>
  );
};

// --- win: Khorat banners raised on the bank; the rebels flee by boat ---
const VictoryScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  const up = sk(frame, T.won, T.won + 12);
  return (
    <V2 id={id} anchor={PL.bangkokNoi} start={start} end={end} sky={["#d88a5a", "#f8d8a8"]} accent={GOLD}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.4]} lightColor={["#ffb070", "#fff0c8"]} far="#9a7a7a" mid="#7a6a48" ground="#6a5236" mist="#ffe0c0" ridges={false} />
          <Smoke x={g.x + g.W * 0.8 + pan * 0.2} y={g.ground - 130 * g.s} s={g.s} n={4} />
          <River g={g} y={g.ground - 70 * g.s} pan={pan} color="#6a7a8a" />
          <Boat x={g.x + g.W * 0.72 + lt * 1.4 * g.s + pan * 0.5} y={g.ground - 46 * g.s} w={150 * g.s} s={g.s * 0.8} n={3} costume={C.rebel} />
          <rect x={g.x - 50 * g.s} y={g.ground - 30 * g.s} width={g.W * 0.62} height={g.H} fill="#6a5236" />
          {[0, 1, 2, 3].map((i) => {
            const x = g.x + g.W * (0.06 + i * 0.12) + pan * 0.7;
            return (
              <g key={i}>
                <Fighter x={x} y={g.ground + 4 * g.s} scale={g.sc * 0.64} mode={up > 0.5 && i % 2 ? "attack" : "stand"} costume={C.siam} phase={i} />
                {i % 2 === 0 && <Banner x={x + 12 * g.s} y={g.ground - up * 30 * g.s} s={g.s} color={GOLD} />}
              </g>
            );
          })}
          <Grass g={g} shift={pan * 1.6} color="#3a4a24" />
        </g>
      )}
    </V2>
  );
};

// --- quiz2: Chakri on the bank at dusk, looking across the river towards the capital ---
const GazeScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#2a2a5a", "#e09a6a"]} accent={GOLD} warm={0.06}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.75, 0.45]} lightColor={["#ff9a5a", "#ffd8a8"]} far="#4a4a6a" mid="#3a3a3a" ground="#2a2418" mist="#e0a080" ridges={false} />
        <Prang x={g.x + g.W * 0.72 + pan * 0.2} y={g.ground - 90 * g.s} h={170 * g.s} s={g.s} color="#a89a90" gold />
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 90 * g.s} w={g.W * 0.5} h={34 * g.s} s={g.s * 0.6} color="#a89a90" />
        <Smoke x={g.x + g.W * 0.86 + pan * 0.2} y={g.ground - 130 * g.s} s={g.s * 0.8} n={4} dark />
        <River g={g} y={g.ground - 84 * g.s} pan={pan} color="#4a4a6a" />
        <path d={`M${g.x - 50 * g.s} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.3} ${g.ground - 50 * g.s} ${g.x + g.W * 0.48} ${g.ground - 10 * g.s} L${g.x + g.W * 0.48} ${g.y + g.H} L${g.x - 50 * g.s} ${g.y + g.H} Z`} fill="#2a2418" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        <Fighter x={g.x + g.W * 0.28 + pan * 0.7} y={g.ground - 38 * g.s} scale={g.sc * 0.8} mode="stand" costume={{ ...C.siam, sash: PAL.gilt }} weapon="none" />
        <Banner x={g.x + g.W * 0.16 + pan * 0.7} y={g.ground - 34 * g.s} s={g.s} color={GOLD} />
        <Grass g={g} shift={pan * 1.6} color="#14140c" />
      </g>
    )}
  </V2>
);

// --- quiz2: the dilemma — a king in robes at Wat Chaeng, and rebels holding the city ---
const DilemmaScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  return (
    <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#1a1a3a", "#6a4a5a"]} accent={GOLD} warm={0.05}>
      {(g, pan) => (
        <g>
          <Stars g={g} n={18} />
          <Backdrop g={g} pan={pan} light={[0.5, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#2a2a4a" mid="#2a2a30" ground="#221c16" mist="#8a8ab0" ridges={false} />
          <Prang x={g.x + g.W * 0.22 + pan * 0.2} y={g.ground - 30 * g.s} h={210 * g.s} s={g.s} color="#c9c2b0" gold />
          <Monk x={g.x + g.W * 0.22 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.78} mode="sit" />
          <Candle x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground} s={g.s} />
          <line x1={g.cx} y1={g.y + 30 * g.s} x2={g.cx} y2={g.y + g.H - 20 * g.s} stroke={GOLD} strokeWidth={3 * g.s} strokeDasharray={`${10 * g.s} ${8 * g.s}`} opacity={0.7} />
          <PalaceWall x={g.x + g.W * 0.56 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.44} h={90 * g.s} s={g.s * 0.8} color="#a8a090" />
          <Fire x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 110 * g.s} h={40 * g.s} seed={2} />
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.62 + i * 0.12) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" flip costume={C.rebel} phase={i} />)}
          <Banner x={g.x + g.W * 0.93 + pan * 0.7} y={g.ground} s={g.s} color={RED} />
          <Grass g={g} shift={pan * 1.6} color="#10120c" />
        </g>
      )}
    </V2>
  );
};

// Gold "?" for the open question (no options).
const QuestionGold = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.quiz + 6 || frame > END + 10) return null;
  const k = interpolate(frame, [T.quiz + 6, T.quiz + 16], [0, 1], clamp) * interpolate(frame, [END, END + 10], [1, 0], clamp);
  const pulse = 1 + 0.05 * Math.sin(frame * 0.2);
  return (
    <div style={{ position: "absolute", right: 70 * s, top: height * 0.36, width: 150 * s, height: 150 * s, borderRadius: "50%", background: GOLD, color: "#1a140f", fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: `${150 * s}px`, textAlign: "center", transform: `scale(${k * pulse})`, boxShadow: `0 0 ${40 * s}px rgba(255,201,74,0.7)` }}>?</div>
  );
};

export const e4c4: Chapter4 = {
  name: "เมืองหลวงไร้เจ้า",
  from: T.chaos,
  to: END,
  cams: (w, h) => [
    { frame: T.chaos + 10, cam: view(VW.thonWide, w, h, 1.1, 0.05) },
    { frame: T.anurak, cam: view(VW.thonWide, w, h, 1.1, 0.05) },
    { frame: T.anurak + 30, cam: view(VW.thonWide, w, h, 1.35, 0.08) },
    { frame: T.waver, cam: view(VW.thonWide, w, h, 1.35, 0.08) },
    { frame: T.waver + 30, cam: view(VW.thonWide, w, h, 1.1, 0.06) },
    { frame: T.news, cam: view(VW.thonWide, w, h, 1.1, 0.06) },
    { frame: T.news + 40, cam: view(EAST_V, w, h, 1, 0.09) },
    { frame: T.bkn, cam: view(EAST_V, w, h, 1, 0.09) },
    { frame: T.bkn + 30, cam: view(KORAT_V, w, h, 1, 0.09) },
    { frame: T.battle - 6, cam: view(KORAT_V, w, h, 1, 0.09) },
    { frame: T.battle + 30, cam: view(VW.thonWide, w, h, 1.1, 0.04) },
    { frame: T.before, cam: view(VW.thonWide, w, h, 1.1, 0.04) },
    { frame: T.before + 30, cam: view(EAST_V, w, h, 1, 0.09) },
    { frame: T.quiz, cam: view(EAST_V, w, h, 1, 0.09) },
    { frame: T.quiz + 35, cam: view(VW.thonWide, w, h, 1.2, 0.06) },
  ],
  years: [[T.chaos, "2325"]],
  heads: [
    { f: T.chaos, tag: "ราวสองสัปดาห์ต่อมา", head: "เมืองวุ่นวาย", color: RED },
    { f: T.fire, tag: "นักโทษถูกปล่อย", head: "ไฟไหม้ ปล้นสะดม", color: RED },
    { f: T.anurak, tag: "กรมขุนอนุรักษ์สงคราม", head: "หลานพระเจ้าตาก", color: GOLD, portrait: "anurak" },
    { f: T.arm, tag: "พระยาสรรค์ปล่อยตัว", head: "ได้ถืออาวุธ", color: RED, portrait: "anurak" },
    { f: T.waver, tag: "พงศาวดารเล่า", head: "ตอนแรกจะรอเจ้าพระยาจักรี", color: GOLD },
    { f: T.hesit, tag: "พงศาวดารเล่า", head: "พระยาสรรค์ลังเล", color: RED, portrait: "phraya_san" },
    { f: T.news, tag: "ข่าวถึงกัมพูชา", head: "ถึงเจ้าพระยาจักรี", color: GOLD, portrait: "chakri" },
    { f: T.rec, tag: "บันทึกเล่าว่า", head: "“ศึกกลางเมือง 2 ครั้ง”", color: RED },
    { f: T.truce, tag: "ฝั่งเวียดนามเล่า", head: "สงบศึกแล้วถอย", color: VIET_C },
    { f: T.bkn, tag: "ต้นเมษายน 2325", head: "ศึกบางกอกน้อย", color: RED },
    { f: T.korat, tag: "หลานชายเจ้าพระยาจักรี", head: "ยกทัพจากโคราช", color: GOLD },
    { f: T.battle, tag: "ศึกบางกอกน้อย", head: "ปะทะกรมขุนอนุรักษ์ฯ", color: RED, portrait: "anurak" },
    { f: T.won, tag: "ศึกบางกอกน้อย", head: "ทัพโคราชชนะ", color: GOLD },
    { f: T.before, tag: "ทัพใหญ่จากกัมพูชา", head: "ใกล้ถึงแล้ว", stat: "อีกไม่กี่วัน", color: GOLD },
    { f: T.quiz, tag: "ถ้าคุณเป็นเจ้าพระยาจักรี", head: "จะทำอะไรก่อน?", color: GOLD, portrait: "chakri" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const blink = (o: number) => 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.12 + o));
    const eastK = interpolate(frame, [T.news + 20, T.news + 50, T.bkn + 10, T.bkn + 30], [0, 1, 1, 0], clamp);
    const backOut = interpolate(frame, [T.quiz + 20, T.quiz + 40], [1, 0], clamp);
    return (
      <>
        <FireDots start={T.chaos + 10} end={T.waver} />
        <Win a={T.chaos} b={T.news + 40}>
          <PointLabel at={PL.thon} text="ธนบุรี" start={T.chaos + 6} color={RED} size={0.85} />
        </Win>
        <Win a={T.but} b={T.news + 10}>
          <Arrow points={TWO_WAY_A} start={T.but} end={T.but + 20} color={GOLD} width={14} variant="dashed" opacity={blink(0)} />
          <Arrow points={TWO_WAY_B} start={T.hesit} end={T.hesit + 20} color={RED} width={14} variant="dashed" opacity={blink(1.6)} />
        </Win>
        <Zones k={{ siam: eastK * 0.5, khmer: eastK, viet: eastK }} />
        <Win a={T.news + 20} b={T.bkn + 30}>
          <CityDot at={PL.thon} color={RED} r={12} start={T.news + 20} end={T.bkn + 20} />
          <PointLabel at={PL.siemreap} text="เสียมราฐ" start={T.khmer} color={GOLD} size={0.8} />
          <Arrow points={R.cambodia} start={T.news + 40} end={T.khmer + 10} color={GOLD} width={12} variant="dashed" opacity={interpolate(frame, [T.truce, T.truce + 15], [1, 0], clamp)} />
          {frame < T.truce && <Measure a={PL.thon} b={PL.siemreap} text="ราว 400 กม." start={T.rec} />}
        </Win>
        <Win a={T.truce} b={T.bkn + 30}>
          <CityDot at={PL.phnompenh} color={VIET_C} r={14} start={T.truce + 10} end={T.bkn + 20} />
          <PointLabel at={PL.phnompenh} text="ทัพเวียดนาม" start={T.truce + 12} color={VIET_C} size={0.75} />
        </Win>
        <Arrow points={R.cambodiaBack} start={T.back} end={T.back + 40} color={GOLD} width={18} opacity={interpolate(frame, [T.bkn, T.bkn + 15, T.before + 20, T.before + 35], [1, 0, 0, 1], clamp) * backOut} />
        <Win a={T.bkn} b={T.battle + 30}>
          <PointLabel at={PL.korat} text="โคราช" start={T.bkn + 20} color={GOLD} size={0.8} />
          <PointLabel at={PL.bangkokNoi} text="บางกอกน้อย" start={T.bkn + 24} color={RED} size={0.75} />
          <Arrow points={R.koratDown} start={T.korat} end={T.korat + 40} color={GOLD} width={18} />
        </Win>
        <Win a={T.battle} b={T.before + 30}>
          <PointLabel at={PL.bangkokNoi} text="บางกอกน้อย" start={T.battle + 20} color={GOLD} size={0.85} />
          <Ring at={PL.bangkokNoi} r={0.004} start={T.battle + 20} end={T.won} />
          {SCATTER.map((p, i) => <Arrow key={i} points={p} start={T.won + i * 4} end={T.won + 20 + i * 4} color={RED} width={10} variant="dashed" />)}
        </Win>
        <Win a={T.before + 20} b={T.quiz + 40}>
          <CityDot at={PL.kabin} color={GOLD} r={12} start={T.before + 30} end={T.quiz + 20} />
          <PointLabel at={PL.kabin} text="ทัพใหญ่" start={T.before + 32} color={GOLD} size={0.75} />
          <PointLabel at={PL.thon} text="ธนบุรี" start={T.before + 30} color={RED} size={0.8} />
        </Win>
        <Win a={T.quiz + 30} b={END + 30}>
          <PointLabel at={PL.watArun} text="วัดแจ้ง" start={T.quiz + 36} color={GOLD} size={0.8} />
          <Ring at={PL.watArun} r={0.0035} color={GOLD} start={T.quiz + 36} />
        </Win>
      </>
    );
  },
  Panels: () => (
    <>
      <CanalFireScene id="e4c4fire" start={T.chaos} end={T.anurak + 14} />
      <JailScene id="e4c4jail" start={T.anurak} end={T.nephew + 14} />
      <ArmedScene id="e4c4armed" start={T.nephew} end={T.waver + 14} />
      <WaitScene id="e4c4wait" start={T.waver} end={T.but + 14} />
      <MakrukScene id="e4c4makruk" start={T.but} end={T.news + 14} />
      <CourierScene id="e4c4courier" start={T.news} end={T.rec + 14} />
      <LetterScene id="e4c4letter" start={T.rec} end={T.truce + 14} />
      <TruceScene id="e4c4truce" start={T.truce} end={T.bkn + 14} />
      <KoratMarchScene id="e4c4korat" start={T.bkn} end={T.fight + 14} />
      <CanalBattleScene id="e4c4battle" start={T.fight} end={T.win + 14} />
      <VictoryScene id="e4c4victory" start={T.win} end={T.quiz + 14} />
      <GazeScene id="e4c4gaze" start={T.quiz} end={T.king + 14} />
      <DilemmaScene id="e4c4dilemma" start={T.king} end={END + 14} />
    </>
  ),
  Screen: () => <QuestionGold />,
  sfx: [
    [T.fire, SFX.pop, 0.25],
    [T.anurak + 24, SFX.whoosh, 0.25],
    [T.but, SFX.pop, 0.3],
    [T.hesit, SFX.pop, 0.3],
    [T.news + 34, SFX.whoosh, 0.3],
    [T.khmer, SFX.pop, 0.3],
    [T.rec + 20, SFX.pop, 0.3],
    [T.truce + 12, SFX.pop, 0.3],
    [T.bkn + 24, SFX.whoosh, 0.3],
    [T.battle + 24, SFX.whoosh, 0.3],
    [T.before + 24, SFX.whoosh, 0.3],
    [T.before + 32, SFX.pop, 0.3],
    [T.quiz + 6, SFX.hit, 0.35],
    [T.quiz + 29, SFX.whoosh, 0.25],
  ],
  Audio: () => (
    <>
      <Bed id="fire_big" from={T.chaos - 6} to={T.anurak + 14} volume={0.28} voice={VOICE} />
      <Bed id="crowd_panic" from={T.chaos - 6} to={T.anurak + 14} volume={0.26} voice={VOICE} />
      {BURN.map((f) => <Hit key={f} id="wood_break" at={f} volume={0.4} />)}
      <Bed id="wind" from={T.anurak - 6} to={T.waver + 14} volume={0.16} voice={VOICE} />
      <Hit id="sword_clash" at={BREAK} volume={0.4} />
      <Hit id="sword_draw" at={T.arm} volume={0.45} />
      <Bed id="wind" from={T.waver - 6} to={T.but + 14} volume={0.22} voice={VOICE} />
      <Bed id="fire_crackle" from={T.but - 6} to={T.news + 14} volume={0.18} voice={VOICE} />
      <Hit id="wood_hit" at={T.game} volume={0.45} />
      <Bed id="rain_heavy" from={T.news - 6} to={T.truce + 14} volume={0.28} voice={VOICE} />
      <Bed id="horse_gallop" from={T.news - 6} to={T.rec + 14} volume={0.3} voice={VOICE} />
      <Hit id="thunder_close" at={THUNDER} volume={0.45} />
      <Bed id="wind" from={T.truce - 6} to={T.bkn + 14} volume={0.22} voice={VOICE} />
      <Hit id="war_horn" at={T.talk} volume={0.35} />
      <Hit id="war_drums" at={T.back} volume={0.35} />
      <Bed id="army_marching" from={T.bkn - 6} to={T.fight + 14} volume={0.28} voice={VOICE} />
      <Bed id="crowd_angry" from={T.fight - 6} to={T.win + 14} volume={0.26} voice={VOICE} />
      {GUNS.map((f, i) => <Hit key={f} id={i % 2 ? "cannon_old" : "rifle_echo"} at={f} volume={0.45} />)}
      {CLASH.map((f, i) => <Hit key={f} id={i % 2 ? "sword_battle" : "sword_clash"} at={f} volume={0.4} />)}
      <Bed id="wind" from={T.win - 6} to={T.quiz + 14} volume={0.18} voice={VOICE} />
      <Hit id="crowd_cheer" at={T.won} volume={0.4} />
      <Bed id="wind" from={T.quiz - 6} to={END + 14} volume={0.2} voice={VOICE} />
      <Bed id="fire_crackle" from={T.king - 6} to={END + 14} volume={0.14} voice={VOICE} />
    </>
  ),
};
