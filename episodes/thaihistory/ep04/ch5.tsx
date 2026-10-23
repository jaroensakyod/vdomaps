import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "./mix";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { B, CityDot, Ring, VOICE, wf, type Chapter4 } from "./beatsKit";
import { PL, VW } from "./places";
import { Backdrop, Banner, Boat, C, Candle, Fighter, Grass, Hall, Manuscript, Monk, Noble, PAL, PalaceWall, Prang, River, V2, type G } from "./v2";
import { Glow } from "../../../components/Scene";

// Chapter 5 · 6 เมษายน 2325 (beats dawn → bangkok): Chakri's army reaches Wat Pho, the trial, the chronicle's account
// of King Taksin's end (attributed on every card, never shown), the new reign and the move across the river.

// A word cue clamped inside its beat (the voice timing is swapped while chapters are built).
const cue = (id: string, word: string, k: number, lo = 0.08, hi = 0.9, n = 0) => {
  const b = B[id];
  return Math.min(Math.max(wf(id, word, k, n), Math.round(b.start + b.len * lo)), Math.round(b.start + b.len * hi));
};

const T = {
  dawn: B.dawn.start,
  pho: cue("dawn", "วัด", 0.9, 0.3, 0.92),
  army: cue("dawn", "ทัพ", 0.65, 0.4, 0.8),
  enter: B.enter.start,
  cross: cue("enter", "ข้าม", 0.25, 0.05, 0.4),
  nobles: cue("enter", "ขุนนาง", 0.6, 0.35, 0.8),
  q2: B.question2.start,
  qSan: cue("question2", "สรรค์", 0.55, 0.3, 0.7),
  qTaksin: cue("question2", "ตาก", 0.95, 0.75, 0.97),
  trial: B.trial.start,
  punish: cue("trial", "ลงโทษ", 0.9, 0.7, 0.95),
  decide: B.decide.start,
  council: cue("decide", "ขุนนาง", 0.33, 0.2, 0.5),
  agree: cue("decide", "ชอบ", 0.95, 0.75, 0.97),
  ask: B.ask.start,
  meet: cue("ask", "ขอ", 0.5, 0.35, 0.65),
  comrade: cue("ask", "สหาย", 0.7, 0.55, 0.8),
  wave: B.wave.start,
  waveHand: cue("wave", "โบก", 0.4, 0.2, 0.55),
  fort: B.fort.start,
  fortPin: cue("fort", "ป้อม", 0.3, 0.15, 0.5),
  age: B.age.start,
  n47: cue("age", "ชนมายุ", 0.08, 0.02, 0.3),
  n48: cue("age", "แปด", 0.65, 0.5, 0.8),
  dyn: B.dynasty.start,
  reign: cue("dynasty", "ครอง", 0.33, 0.2, 0.45),
  first: cue("dynasty", "ปฐม", 0.48, 0.35, 0.6),
  chakriDay: cue("dynasty", "จักรี", 0.95, 0.85, 0.97, 2),
  bkk: B.bangkok.start,
  pillar: cue("bangkok", "เสา", 0.3, 0.2, 0.42),
  move: cue("bangkok", "ย้าย", 0.45, 0.43, 0.6),
  east: cue("bangkok", "ฝั่ง", 0.65, 0.62, 0.8),
  city: cue("bangkok", "กรุงเทพฯ", 0.92, 0.82, 0.96),
};
const END = B.dates.start;

// One schedule for picture and sound.
const DOCK = T.nobles - 6; // the barge touches the landing
const GONGS = [T.first + 10, T.first + 50, T.first + 90];
const PILLAR_UP = Math.min(T.pillar + 30, T.move - 20); // the pillar settles upright

const PALE = "#b8b2a6";
const VW_FORT = bbox([[100.4795, 13.7258], [100.5015, 13.7578]]);
const VW_BKK = bbox([[100.478, 13.732], [100.508, 13.768]]);
const R_CROSS: [number, number][] = [[100.4935, 13.7462], [100.4912, 13.7452], [100.4896, 13.7436]];
const R_BKK: [number, number][] = [[100.4893, 13.7432], [100.4912, 13.7478], [100.4938, 13.7522]];

// ---------- local scene parts ----------

// Slanting sun rays from (fx, fy) (fractions of the panel) at the given angles (radians).
const Rays = ({ g, fx, fy, angles, color = "#fff1c9", o = 0.13 }: { g: G; fx: number; fy: number; angles: number[]; color?: string; o?: number }) => {
  const frame = useCurrentFrame();
  const sx = g.x + g.W * fx;
  const sy = g.y + g.H * fy;
  const L = g.W * 1.3;
  return (
    <g>
      {angles.map((a, i) => {
        const w = 0.035 + (i % 2) * 0.02;
        const f = 0.7 + 0.3 * Math.sin(frame * 0.05 + i * 1.3);
        return <path key={i} d={`M${sx} ${sy} L${sx + Math.cos(a - w) * L} ${sy + Math.sin(a - w) * L} L${sx + Math.cos(a + w) * L} ${sy + Math.sin(a + w) * L} Z`} fill={color} opacity={o * f} />;
      })}
    </g>
  );
};

// Drifting mist strips (moving slowly with time).
const MistBands = ({ g, y, color = "#fff6e6", o = 0.35 }: { g: G; y: number; color?: string; o?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={g.x + ((i * 0.37 * g.W + frame * (0.6 + i * 0.25) * g.s) % (g.W * 1.4)) - g.W * 0.2} cy={y + i * 12 * g.s} rx={g.W * 0.32} ry={10 * g.s} fill={color} opacity={o * (1 - i * 0.2)} />
      ))}
    </g>
  );
};

// Bell-shaped chedi with a tall ringed spire (Wat Pho style), base centre (x, y), height h.
const Chedi = ({ x, y, h, s, color = PAL.chalk }: { x: number; y: number; h: number; s: number; color?: string }) => {
  const w = h * 0.34;
  return (
    <g>
      <rect x={x - w * 0.62} y={y - h * 0.12} width={w * 1.24} height={h * 0.12} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
      <rect x={x - w * 0.5} y={y - h * 0.2} width={w} height={h * 0.08} fill="#e6dcc4" stroke={PAL.ink} strokeWidth={1.4 * s} />
      <path d={`M${x - w * 0.44} ${y - h * 0.2} Q${x - w * 0.48} ${y - h * 0.5} ${x} ${y - h * 0.57} Q${x + w * 0.48} ${y - h * 0.5} ${x + w * 0.44} ${y - h * 0.2} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
      <rect x={x - w * 0.13} y={y - h * 0.63} width={w * 0.26} height={h * 0.06} fill="#e6dcc4" stroke={PAL.ink} strokeWidth={1.2 * s} />
      <path d={`M${x - w * 0.1} ${y - h * 0.63} L${x} ${y - h} L${x + w * 0.1} ${y - h * 0.63} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.4 * s} />
      {[0.68, 0.74, 0.8].map((f) => <line key={f} x1={x - w * 0.08 * (1 - (f - 0.63) * 2)} y1={y - h * f} x2={x + w * 0.08 * (1 - (f - 0.63) * 2)} y2={y - h * f} stroke={PAL.ink} strokeWidth={1 * s} />)}
    </g>
  );
};

// Reeds at the water's edge (foreground layer).
const Reeds = ({ g, shift, color = "#3a4a2a" }: { g: G; shift: number; color?: string }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: 24 }, (_, i) => {
        const x = g.x + i * 46 * g.s + shift + (i % 3) * 9 * g.s;
        const h = (40 + ((i * 37) % 30)) * g.s;
        const sw = Math.sin(frame * 0.06 + i) * 5 * g.s;
        return <path key={i} d={`M${x} ${g.y + g.H} q${2 * g.s} ${-h * 0.6} ${sw + 6 * g.s} ${-h} q${-2 * g.s} ${h * 0.5} ${4 * g.s} ${h}`} fill={color} stroke={PAL.ink} strokeWidth={0.8 * g.s} />;
      })}
    </g>
  );
};

// Open pavilion (sala): platform, posts and a two-tier roof; base-left (x, y), width w.
const Sala = ({ x, y, w, s, roof = PAL.ochre }: { x: number; y: number; w: number; s: number; roof?: string }) => {
  const ph = w * 0.34;
  const t = y - 16 * s - ph;
  return (
    <g>
      <rect x={x - 6 * s} y={y - 16 * s} width={w + 12 * s} height={16 * s} fill="#8a6a45" stroke={PAL.ink} strokeWidth={1.8 * s} />
      {[0.04, 0.36, 0.64, 0.96].map((f) => <rect key={f} x={x + w * f - 4 * s} y={t} width={8 * s} height={ph} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.2 * s} />)}
      <path d={`M${x - w * 0.1} ${t} L${x + w * 0.18} ${t - w * 0.16} L${x + w * 0.82} ${t - w * 0.16} L${x + w * 1.1} ${t} Z`} fill={roof} stroke={PAL.ink} strokeWidth={1.8 * s} />
      <path d={`M${x + w * 0.08} ${t - w * 0.14} L${x + w * 0.3} ${t - w * 0.3} L${x + w * 0.7} ${t - w * 0.3} L${x + w * 0.92} ${t - w * 0.14} Z`} fill={roof} stroke={PAL.ink} strokeWidth={1.6 * s} />
      <path d={`M${x + w * 0.3} ${t - w * 0.3} q${-6 * s} ${-12 * s} ${4 * s} ${-16 * s} M${x + w * 0.7} ${t - w * 0.3} q${6 * s} ${-12 * s} ${-4 * s} ${-16 * s}`} stroke={PAL.gilt} strokeWidth={3 * s} fill="none" />
    </g>
  );
};

// Tiered royal umbrella (chat) on a pole, foot at (x, y).
const Chat = ({ x, y, h, s }: { x: number; y: number; h: number; s: number }) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y - h} stroke={PAL.gilt} strokeWidth={4 * s} />
    {Array.from({ length: 5 }, (_, i) => {
      const ty = y - h * 0.4 - i * h * 0.12;
      const tw = (34 - i * 5) * s;
      return (
        <g key={i}>
          <path d={`M${x - tw} ${ty} L${x - tw * 0.8} ${ty - h * 0.06} L${x + tw * 0.8} ${ty - h * 0.06} L${x + tw} ${ty} Z`} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.2 * s} />
          <line x1={x - tw} y1={ty} x2={x + tw} y2={ty} stroke={PAL.gilt} strokeWidth={2.4 * s} />
        </g>
      );
    })}
  </g>
);

// A horse at rest, grazing (facing right), foot line at (x, y).
const Horse = ({ x, y, scale, coat = "#6b4a2a", blanket = RED, phase = 0, flip = false }: { x: number; y: number; scale: number; coat?: string; blanket?: string; phase?: number; flip?: boolean }) => {
  const frame = useCurrentFrame();
  const graze = Math.sin(frame * 0.05 + phase) * 5;
  const tail = Math.sin(frame * 0.12 + phase) * 6;
  const breathe = Math.sin(frame * 0.08 + phase) * 1;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={52} ry={5} fill="#000" opacity={0.25} />
      {[-34, -24, 26, 36].map((lx, i) => (
        <g key={i}>
          <path d={`M${lx} -54 L${lx + (i % 2 ? 2 : -2)} -26 L${lx} 0`} stroke={PAL.ink} strokeWidth={9} strokeLinecap="round" fill="none" />
          <path d={`M${lx} -54 L${lx + (i % 2 ? 2 : -2)} -26 L${lx} 0`} stroke={coat} strokeWidth={6} strokeLinecap="round" fill="none" />
        </g>
      ))}
      <path d={`M-44 -68 q-14 10 ${-12 + tail} 42`} stroke="#2a1a10" strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-62 + breathe} rx={47} ry={20} fill={coat} stroke={PAL.ink} strokeWidth={2.2} />
      <path d={`M-16 ${-81 + breathe} L18 ${-81 + breathe} L22 ${-50 + breathe} L-20 ${-50 + breathe} Z`} fill={blanket} stroke={PAL.ink} strokeWidth={1.6} />
      <rect x={-8} y={-86 + breathe} width={16} height={8} rx={3} fill="#3a2414" />
      <g transform={`rotate(${graze},34,-72)`}>
        <path d="M30 -76 Q52 -72 62 -42 L78 -16 Q82 -6 72 -6 L60 -10 L46 -40 Q40 -52 28 -50 Z" fill={coat} stroke={PAL.ink} strokeWidth={2.2} />
        <path d="M32 -78 Q50 -76 58 -50" stroke="#2a1a10" strokeWidth={5} fill="none" />
        <path d="M58 -46 l3 -11 l4 10 Z" fill={coat} stroke={PAL.ink} strokeWidth={1.4} />
        <circle cx={66} cy={-28} r={1.6} fill={PAL.ink} />
      </g>
    </g>
  );
};

// Birds flying home (small ink V shapes), drifting with time.
const Birds = ({ g, n = 5 }: { g: G; n?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = g.x + ((g.W * (0.15 + i * 0.09) + frame * 0.5 * g.s) % g.W);
        const y = g.y + g.H * (0.22 + (i % 3) * 0.05) + Math.sin(frame * 0.1 + i) * 3 * g.s;
        const flap = Math.sin(frame * 0.5 + i) * 4 * g.s;
        return <path key={i} d={`M${x - 8 * g.s} ${y - flap} Q${x - 3 * g.s} ${y - 2 * g.s} ${x} ${y} Q${x + 3 * g.s} ${y - 2 * g.s} ${x + 8 * g.s} ${y - flap}`} stroke="#2a1a14" strokeWidth={1.8 * g.s} fill="none" />;
      })}
    </g>
  );
};

// ---------- scenes (each used at most twice in the episode) ----------

// 1. Morning on the river: Wat Pho's chedis through the mist, slanting sun, a moored boat.
const DawnRiverScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.watPho} start={start} end={end} sky={["#8fb6d6", "#f6d6a2"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.84, 0.3]} lightColor={["#ffd38a", "#fff4d6"]} far="#9aa6b8" mid="#7f8a78" ground="#5a5038" mist="#fff1dc" />
        <Rays g={g} fx={0.84} fy={0.3} angles={[2.55, 2.75, 2.95, 3.15]} />
        <g opacity={0.92}>
          {([[0.16, 130, "#7fa889"], [0.25, 150, "#efe6d0"], [0.34, 135, "#d9b860"], [0.43, 145, "#8aa6c9"]] as [number, number, string][]).map(([f, h, c]) => (
            <Chedi key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 46 * g.s} h={h * g.s} s={g.s} color={c} />
          ))}
          <Hall x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 46 * g.s} w={200 * g.s} s={g.s} />
        </g>
        <MistBands g={g} y={g.ground - 70 * g.s} />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#5f8aa6" />
        <Boat x={g.x + g.W * 0.74 + pan * 0.7} y={g.ground + 2 * g.s} w={130 * g.s} s={g.s} n={2} costume={C.villager} />
        <Reeds g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// 2. Chakri's army arrives before Wat Pho: columns with banners marching in the low morning sun.
const ArmyArriveScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.watPho} start={start} end={end} sky={["#a9c4dc", "#f4cf96"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const march = lt * 0.9 * g.s;
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.12, 0.28]} lightColor={["#ffd38a", "#fff4d6"]} far="#9aa0b0" mid="#86866a" ground="#7a6440" mist="#fff1dc" />
          <Chedi x={g.x + g.W * 0.7 + pan * 0.2} y={g.ground - 40 * g.s} h={150 * g.s} s={g.s} color="#7fa889" />
          <Chedi x={g.x + g.W * 0.8 + pan * 0.2} y={g.ground - 40 * g.s} h={160 * g.s} s={g.s} color="#efe6d0" />
          <Hall x={g.x + g.W * 0.84 + pan * 0.2} y={g.ground - 40 * g.s} w={170 * g.s} s={g.s} />
          <Rays g={g} fx={0.12} fy={0.28} angles={[0.12, 0.3, 0.5, 0.7]} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Fighter key={`b${i}`} x={g.x - 80 * g.s + i * 74 * g.s + march + pan * 0.5} y={g.ground - 18 * g.s} scale={g.sc * 0.5} mode="walk" costume={C.siam} phase={i * 0.8} />
          ))}
          {[0, 1].map((i) => <Banner key={i} x={g.x - 40 * g.s + i * 220 * g.s + march + pan * 0.7} y={g.ground + 4 * g.s} s={g.s} color={i ? RED : GOLD} />)}
          {[0, 1, 2, 3, 4].map((i) => (
            <Fighter key={`f${i}`} x={g.x - 60 * g.s + i * 92 * g.s + march + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.66} mode="walk" costume={C.siam} phase={i * 1.1 + 0.4} />
          ))}
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={40 * g.s} fill="#e8c890" opacity={0.18} />
          <Grass g={g} shift={pan * 1.6} color="#3a3a22" />
        </g>
      );
    }}
  </V2>
);

// 3. The landing: nobles prostrate in a row as a canopied barge comes in to the steps; townspeople behind.
const LandingScene = ({ id, start, end, dock }: { id: string; start: number; end: number; dock: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#9cc0da", "#f2dcb0"]} accent={GOLD} warm={0.08}>
      {(g, pan) => {
        const bx = interpolate(frame, [start, dock], [g.W * 1.1, g.W * 0.78], { ...clamp, easing: (t) => 1 - (1 - t) * (1 - t) });
        const bob = Math.sin(frame * 0.12) * 2 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.7, 0.24]} lightColor={["#ffe1a8", "#fff6e0"]} far="#a4aebb" mid="#8a8f78" ground="#7a6a48" mist="#fff4e2" />
            <PalaceWall x={g.x + g.W * 0.02 + pan * 0.2} y={g.ground - 50 * g.s} w={g.W * 0.5} h={46 * g.s} s={g.s} color="#e3d9c2" />
            <Prang x={g.x + g.W * 0.3 + pan * 0.2} y={g.ground - 90 * g.s} h={110 * g.s} s={g.s} color="#cfc6b0" />
            <River g={g} y={g.ground - 16 * g.s} pan={pan} color="#5f8aa6" />
            <rect x={g.x - 40 * g.s + pan * 0.5} y={g.ground - 20 * g.s} width={g.W * 0.64} height={22 * g.s} fill="#8a6a45" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[0.08, 0.22, 0.36, 0.5].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground} width={7 * g.s} height={40 * g.s} fill="#4a2f18" />)}
            {[0, 1, 2].map((i) => (
              <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.06) + pan * 0.5} y={g.ground - 22 * g.s} scale={g.sc * 0.45} mode="stand" costume={C.villager} weapon="none" phase={i} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <Noble key={i} x={g.x + g.W * (0.16 + i * 0.085) + pan * 0.7} y={g.ground - 18 * g.s} scale={g.sc * 0.5} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />
            ))}
            <Boat x={g.x + bx + pan * 0.7} y={g.ground + 22 * g.s + bob} w={210 * g.s} s={g.s} n={4} dir={-1} canopy gilt costume={C.siam} />
            <Banner x={g.x + g.W * 0.6 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s * 0.9} color={GOLD} />
            <Reeds g={g} shift={pan * 1.6} color="#24301c" />
          </g>
        );
      }}
    </V2>
  );
};

// 4. Waiting: the old palace gate shut, guards still, banners slack under a pale morning sky.
const GateWaitScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#b9c3cc", "#e8dcc4"]} accent={RED} warm={0.04}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.2]} lightColor={["#f4ecd8", "#ffffff"]} far="#a8acb2" mid="#8a8a80" ground="#7a6a50" mist="#f4efe6" />
        <Prang x={g.x + g.W * 0.22 + pan * 0.2} y={g.ground - 110 * g.s} h={120 * g.s} s={g.s} color="#cfc8b8" />
        <Hall x={g.x + g.W * 0.58 + pan * 0.2} y={g.ground - 110 * g.s} w={180 * g.s} s={g.s} />
        <PalaceWall x={g.x - 20 * g.s + pan * 0.5} y={g.ground - 12 * g.s} w={g.W + 40 * g.s} h={100 * g.s} s={g.s} gateAt={0.5} gateOpen={0} />
        <Fighter x={g.x + g.W * 0.4 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.62} mode="stand" costume={C.guard} phase={0.3} />
        <Fighter x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.62} mode="stand" flip costume={C.guard} phase={1.7} />
        <Banner x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground + 2 * g.s} s={g.s} color={RED} />
        <Banner x={g.x + g.W * 0.7 + pan * 0.7} y={g.ground + 2 * g.s} s={g.s} color={RED} />
        <Noble x={g.x + g.W * 0.16 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.55} mode="kneel" phase={1} jacket="#efe6d0" />
        <Grass g={g} shift={pan * 1.6} color="#3a3a28" />
      </g>
    )}
  </V2>
);

// 5. The trial: officials seated under a pavilion; the accused prostrate in the yard; at the sentence a sword's
// shadow falls across the ground (no blow is shown).
const TrialScene = ({ id, start, end, sentence }: { id: string; start: number; end: number; sentence: number }) => {
  const frame = useCurrentFrame();
  const sh = interpolate(frame, [sentence, sentence + 14], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#c9b48a", "#f0dcb2"]} accent={RED} warm={0.06}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.88, 0.2]} lightColor={["#ffe1a8", "#fff6e0"]} far="#a89a80" mid="#8a7a5a" ground="#b09a70" mist="#fff0d6" />
          <PalaceWall x={g.x - 20 * g.s + pan * 0.2} y={g.ground - 60 * g.s} w={g.W + 40 * g.s} h={44 * g.s} s={g.s} color="#e3d9c2" />
          <Sala x={g.x + g.W * 0.03 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.42} s={g.s} />
          {[0, 1, 2, 3].map((i) => (
            <Noble key={i} x={g.x + g.W * (0.08 + i * 0.1) + pan * 0.5} y={g.ground - 22 * g.s} scale={g.sc * 0.48} mode="sit" phase={i} jacket={i === 1 ? "#efe6d0" : "#c9b48a"} />
          ))}
          <Banner x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 4 * g.s} s={g.s} color={RED} />
          <Noble x={g.x + g.W * 0.66 + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.56} mode="prostrate" flip phase={2} jacket="#8a6a3a" />
          <Noble x={g.x + g.W * 0.76 + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.56} mode="prostrate" flip phase={3} jacket="#7a5a3a" />
          <Fighter x={g.x + g.W * 0.9 + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.64} flip mode="stand" costume={C.guard} phase={1} />
          <Fighter x={g.x + g.W * 0.56 + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.64} mode="stand" costume={C.guard} phase={2} />
<Grass g={g} shift={pan * 1.6} color="#5a4a2a" />
          {sh > 0 && (
            <g opacity={0.75 * sh}>
              <path d={`M${g.x + g.W * 1.02} ${g.ground + 8 * g.s} L${g.x + g.W * (1.02 - 0.5 * sh)} ${g.ground + 22 * g.s} L${g.x + g.W * (1.0 - 0.52 * sh)} ${g.ground + 34 * g.s} L${g.x + g.W * 1.02} ${g.ground + 26 * g.s} Z`} fill="#140c08" />
              <rect x={g.x + g.W * 0.97} y={g.ground + 2 * g.s} width={14 * g.s} height={34 * g.s} fill="#140c08" transform={`rotate(-16,${g.x + g.W * 0.97},${g.ground + 20 * g.s})`} />
            </g>
          )}

        </g>
      )}
    </V2>
  );
};

// 6. The chronicle: a folding-book manuscript open by a candle. Used twice (decide, ask); `royal` adds a gilt frame
// and the tag of the royal-autograph recension.
const ChronicleScene = ({ id, start, end, royal = false }: { id: string; start: number; end: number; royal?: boolean }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={PALE} warm={0.1}>
    {(g, pan, lt) => {
      const mw = 360 * g.s;
      const mh = mw * 0.36;
      return (
        <g>
          <Glow x={g.x + g.W * 0.82 + pan * 0.1} y={g.y + g.H * 0.4} s={g.s} color="#ff9a3a" core="#ffd28a" />
          {[0.06, 0.28, 0.5].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y + 30 * g.s} width={150 * g.s} height={g.H * 0.45} fill="#2e2014" stroke={PAL.ink} strokeWidth={1.6 * g.s} />)}
          {[0.06, 0.28, 0.5].map((f) => [0, 1, 2].map((r) => <rect key={`${f}${r}`} x={g.x + g.W * f + 12 * g.s + pan * 0.2} y={g.y + (48 + r * 40) * g.s} width={126 * g.s} height={22 * g.s} fill={r % 2 ? "#4a3420" : "#5a3a22"} />))}
          <rect x={g.x - 50 * g.s} y={g.ground - 40 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <g transform={`translate(${pan * 0.5},0)`}>
            {royal && <rect x={g.x + g.W * 0.16 - 12 * g.s} y={g.ground - 44 * g.s - mh - 22 * g.s} width={mw + 24 * g.s} height={mh + 32 * g.s} rx={6 * g.s} fill="none" stroke={PAL.gilt} strokeWidth={4 * g.s} />}
            <Manuscript x={g.x + g.W * 0.16} y={g.ground - 44 * g.s} w={mw} s={g.s} lines={7} fade={interpolate(lt, [0, 30], [0.3, 1], clamp)} dark={!royal} />
          </g>
          <Candle x={g.x + g.W * 0.82 + pan * 0.7} y={g.ground - 40 * g.s} s={g.s * 1.5} />
          <g transform={`translate(${g.x + g.W * 0.06 + pan * 1.6},${g.ground + 20 * g.s})`}>
            <rect x={-40 * g.s} y={-30 * g.s} width={80 * g.s} height={60 * g.s} rx={10 * g.s} fill="#140c06" opacity={0.85} />
            <line x1={10 * g.s} y1={-30 * g.s} x2={60 * g.s} y2={-110 * g.s} stroke="#140c06" strokeWidth={6 * g.s} strokeLinecap="round" />
          </g>
          <g transform={`translate(${g.x + g.W - 30 * g.s},${g.y + 40 * g.s})`}>
            <rect x={-270 * g.s} y={-24 * g.s} width={270 * g.s} height={40 * g.s} rx={8 * g.s} fill="rgba(8,14,26,0.8)" stroke={royal ? PAL.gilt : PALE} strokeWidth={2 * g.s} />
            <text x={-135 * g.s} y={4 * g.s} textAnchor="middle" fontSize={24 * g.s} fontWeight={700} fill="#fff" fontFamily={font}>{royal ? "ฉบับพระราชหัตถเลขา" : "ตามพงศาวดาร"}</text>
          </g>
        </g>
      );
    }}
  </V2>
);

// 7. The council: nobles in rows bowing toward a closed curtain at the head of the hall (no figure shown).
const CouncilScene = ({ id, start, end, agree }: { id: string; start: number; end: number; agree: number }) => {
  const frame = useCurrentFrame();
  const bow = interpolate(frame, [agree - 4, agree + 16], [0, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a1e12", "#7a4422"]} accent={PALE} warm={0.1}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2616" />
          {[0.08, 0.26, 0.44, 0.62].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#6a3418" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          <Glow x={g.x + g.W * 0.86 + pan * 0.2} y={g.y + g.H * 0.36} s={g.s} color="#ffb060" core="#ffe0a8" />
          <g transform={`translate(${pan * 0.5},0)`}>
            <rect x={g.x + g.W * 0.76} y={g.y + 30 * g.s} width={g.W * 0.2} height={g.ground - g.y - 40 * g.s} fill="#7a1f1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {Array.from({ length: 6 }, (_, i) => <line key={i} x1={g.x + g.W * (0.78 + i * 0.03)} y1={g.y + 34 * g.s} x2={g.x + g.W * (0.78 + i * 0.03)} y2={g.ground - 12 * g.s} stroke="#4a120e" strokeWidth={3 * g.s} />)}
            <rect x={g.x + g.W * 0.74} y={g.y + 22 * g.s} width={g.W * 0.24} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
          <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
          {[0, 1, 2, 3, 4].map((i) => <Noble key={`a${i}`} x={g.x + g.W * (0.12 + i * 0.12) + pan * 0.5} y={g.ground - 22 * g.s} scale={g.sc * 0.46} mode="kneel" bow={bow} phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
          {[0, 1, 2, 3].map((i) => <Noble key={`b${i}`} x={g.x + g.W * (0.06 + i * 0.15) + pan * 0.7} y={g.ground + 8 * g.s} scale={g.sc * 0.56} mode="kneel" bow={bow} phase={i + 3} jacket={i % 2 ? "#c9b48a" : "#efe6d0"} />)}
          <Candle x={g.x + g.W * 0.7 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s} />
          <rect x={g.x + g.W * 0.92 + pan * 1.6} y={g.y} width={60 * g.s} height={g.H} fill="#1a0c06" opacity={0.9} />
        </g>
      )}
    </V2>
  );
};

// 8. Memory: two banners planted side by side on an old campaign field at dusk, two horses grazing (sepia).
const MemoryFieldScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#c9925a", "#f2d39a"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.46, 0.42]} lightColor={["#ffc070", "#fff0c8"]} far="#a07a5a" mid="#7a6440" ground="#8a7040" mist="#ffe6b8" />
        <Banner x={g.x + g.W * 0.42 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 1.3} color={GOLD} />
        <Banner x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 1.3} color={RED} />
        <Horse x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground + 14 * g.s} scale={g.sc * 0.74} coat="#6b4a2a" blanket={GOLD} phase={0} />
        <Horse x={g.x + g.W * 0.8 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.74} coat="#8a6a4a" blanket={RED} phase={2} flip />
        <Grass g={g} shift={pan * 1.6} color="#5a4626" />
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#c8a060" opacity={0.16} />
      </g>
    )}
  </V2>
);

// 9. A curtain lit from behind by a flickering candle; the shadow of a hand waves "no". Quiet.
const CurtainScene = ({ id, start, end, waveAt }: { id: string; start: number; end: number; waveAt: number }) => {
  const frame = useCurrentFrame();
  const flick = 1 + Math.sin(frame * 0.9) * 0.05 + Math.sin(frame * 2.1) * 0.03;
  const up = interpolate(frame, [waveAt - 18, waveAt], [0, 1], clamp);
  const swing = Math.sin((frame - waveAt) * 0.26) * 16 * interpolate(frame, [waveAt, waveAt + 6, waveAt + 70, waveAt + 90], [0, 1, 1, 0], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#0e0805", "#1a0f08"]} accent={PALE} warm={0.05}>
      {(g, pan) => {
        const cx = g.x + g.W * 0.5 + pan * 0.5;
        const cy = g.ground - 10 * g.s;
        return (
          <g>
            <defs>
              <radialGradient id={`${id}-cloth`} cx="0.5" cy="0.85" r="0.75">
                <stop offset="0" stopColor="#ffe2a8" />
                <stop offset="0.45" stopColor="#c98a42" />
                <stop offset="1" stopColor="#2a160a" />
              </radialGradient>
              <filter id={`${id}-soft`}><feGaussianBlur stdDeviation={3 * g.s} /></filter>
            </defs>
            {[0.04, 0.9].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={50 * g.s} height={g.H} fill="#24140a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            <g transform={`translate(${pan * 0.5},0)`}>
              <rect x={g.x + g.W * 0.12} y={g.y + 10 * g.s} width={g.W * 0.76} height={g.ground - g.y} fill={`url(#${id}-cloth)`} opacity={0.94 * flick} />
              {Array.from({ length: 14 }, (_, i) => (
                <line key={i} x1={g.x + g.W * (0.14 + i * 0.053)} y1={g.y + 12 * g.s} x2={g.x + g.W * (0.14 + i * 0.053) + Math.sin(frame * 0.02 + i) * 3 * g.s} y2={g.ground} stroke="#5a3418" strokeWidth={(i % 2 ? 6 : 3) * g.s} opacity={0.35} />
              ))}
              <rect x={g.x + g.W * 0.1} y={g.y + 4 * g.s} width={g.W * 0.8} height={10 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            </g>
            <g filter={`url(#${id}-soft)`} opacity={0.82} transform={`translate(${cx},${cy + (1 - up) * 160 * g.s}) scale(${g.s * 1.25 * flick}) rotate(${swing})`}>
              <path d="M-16 120 L-14 0 L14 0 L16 120 Z" fill="#1a0c05" />
              <path d="M-24 2 Q-26 -30 -22 -52 L22 -52 Q26 -30 24 2 Z" fill="#1a0c05" />
              {[[-20, 40], [-8, 48], [4, 46], [16, 38]].map(([fx, fh]) => <rect key={fx} x={fx - 1} y={-50 - fh} width={10} height={fh + 6} rx={5} fill="#1a0c05" />)}
              <path d="M-22 -20 Q-40 -30 -44 -50 Q-40 -56 -34 -50 Q-30 -38 -20 -36 Z" fill="#1a0c05" />
            </g>
            <circle cx={cx} cy={g.ground - 4 * g.s} r={46 * g.s * flick} fill="#ffd28a" opacity={0.35} />
            <rect x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 10 * g.s} width={g.W * 0.4} height={g.H} fill="#1a0e06" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={g.x - 10 * g.s + pan * 1.6} y={g.y} width={70 * g.s} height={g.H} fill="#0e0704" />
            <rect x={g.x + g.W - 60 * g.s + pan * 1.6} y={g.y} width={90 * g.s} height={g.H} fill="#0e0704" />
          </g>
        );
      }}
    </V2>
  );
};

// 10. The riverside fort (Wichai Prasit) in afternoon light; the flag comes down to half-mast; the landing is empty.
const FortScene = ({ id, start, end, lower }: { id: string; start: number; end: number; lower: number }) => {
  const frame = useCurrentFrame();
  const half = interpolate(frame, [lower, lower + 60], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <V2 id={id} anchor={PL.fort} start={start} end={end} sky={["#d9a46a", "#f4dcb0"]} accent={PALE} warm={0.12}>
      {(g, pan) => {
        const fx = g.x + g.W * 0.56 + pan * 0.5;
        const fy = g.ground - 26 * g.s;
        const top = fy - 210 * g.s;
        const flagY = top + half * 70 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.18, 0.3]} lightColor={["#ffc878", "#fff0cc"]} far="#a89a8a" mid="#8a8068" ground="#6a5a40" mist="#ffe8c4" />
            <g opacity={0.55}>
              <Chedi x={g.x + g.W * 0.1 + pan * 0.2} y={g.ground - 60 * g.s} h={90 * g.s} s={g.s} color="#c9c2b0" />
              <Chedi x={g.x + g.W * 0.16 + pan * 0.2} y={g.ground - 60 * g.s} h={100 * g.s} s={g.s} color="#c9c2b0" />
            </g>
            <PalaceWall x={g.x + g.W * 0.62 + pan * 0.5} y={fy} w={g.W * 0.5} h={60 * g.s} s={g.s} color="#efe7d6" />
            <path d={`M${fx - 120 * g.s} ${fy} L${fx - 100 * g.s} ${fy - 100 * g.s} L${fx + 100 * g.s} ${fy - 100 * g.s} L${fx + 120 * g.s} ${fy} Z`} fill="#f2ebdc" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={`M${fx - 98 * g.s + i * 25 * g.s} ${fy - 100 * g.s} l0 ${-10 * g.s} q${9 * g.s} ${-14 * g.s} ${18 * g.s} 0 l0 ${10 * g.s} Z`} fill="#f2ebdc" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            ))}
            {[-60, 0, 60].map((d) => <rect key={d} x={fx + d * g.s - 9 * g.s} y={fy - 62 * g.s} width={18 * g.s} height={14 * g.s} rx={3 * g.s} fill="#2a1a10" />)}
            <rect x={fx - 112 * g.s} y={fy - 34 * g.s} width={224 * g.s} height={34 * g.s} fill="#000" opacity={0.08} />
            <line x1={fx} y1={fy - 110 * g.s} x2={fx} y2={top - 6 * g.s} stroke="#4a2f18" strokeWidth={4 * g.s} />
            <circle cx={fx} cy={top - 8 * g.s} r={4 * g.s} fill={PAL.gilt} />
            <path d={`M${fx} ${flagY} L${fx + 56 * g.s} ${flagY + 4 * g.s + Math.sin(frame * 0.12) * 2 * g.s} L${fx + 54 * g.s} ${flagY + 36 * g.s} L${fx} ${flagY + 34 * g.s} Z`} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Fighter x={fx - 70 * g.s} y={fy - 108 * g.s} scale={g.sc * 0.3} mode="stand" costume={C.guard} phase={1} />
            <River g={g} y={g.ground - 18 * g.s} pan={pan} color="#6a8aa0" />
            <rect x={fx - 40 * g.s + pan * 0.2} y={g.ground - 14 * g.s} width={80 * g.s} height={40 * g.s} fill="#fff0c8" opacity={0.2} />
            <g transform={`translate(${pan * 0.7},0)`}>
              <rect x={g.x + g.W * 0.2} y={g.ground - 22 * g.s} width={g.W * 0.2} height={12 * g.s} fill="#8a6a45" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              {[0.21, 0.29, 0.38].map((f) => <rect key={f} x={g.x + g.W * f} y={g.ground - 10 * g.s} width={6 * g.s} height={40 * g.s} fill="#4a2f18" />)}
              <g transform={`translate(${g.x + g.W * 0.3},${g.ground + 16 * g.s + Math.sin(frame * 0.08) * 2 * g.s}) rotate(${Math.sin(frame * 0.05) * 1.5})`}>
                <path d={`M${-60 * g.s} ${-8 * g.s} L${60 * g.s} ${-10 * g.s} Q${54 * g.s} ${6 * g.s} ${40 * g.s} ${6 * g.s} L${-48 * g.s} ${6 * g.s} Z`} fill="#6b4a2a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              </g>
            </g>
            <Reeds g={g} shift={pan * 1.6} color="#2a3020" />
          </g>
        );
      }}
    </V2>
  );
};

// 11. Dusk on the river: Wat Arun's prang against the sunset, birds going home, an empty boat rocking.
const DuskRiverScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#4a3a6a", "#e88a5a"]} accent={PALE} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.3, 0.55]} lightColor={["#ff9a5a", "#ffe0b0"]} far="#5a4a6a" mid="#4a3a48" ground="#2a2028" mist="#ffb880" />
          <g transform={`translate(${pan * 0.5},0)`}>
            <Prang x={g.x + g.W * 0.62} y={g.ground - 30 * g.s} h={220 * g.s} s={g.s} color="#8a7a7a" gold />
            <Prang x={g.x + g.W * 0.46} y={g.ground - 30 * g.s} h={110 * g.s} s={g.s} color="#7a6a6a" />
            <Prang x={g.x + g.W * 0.78} y={g.ground - 30 * g.s} h={110 * g.s} s={g.s} color="#7a6a6a" />
          </g>
          <Birds g={g} />
          <River g={g} y={g.ground - 24 * g.s} pan={pan} color="#5a4a64" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={g.x + g.W * 0.3 - (20 - i * 3) * g.s + Math.sin(frame * 0.1 + i) * 4 * g.s + pan * 0.2} y={g.ground - 14 * g.s + i * 9 * g.s} width={(40 - i * 6) * g.s} height={3 * g.s} fill="#ffd8a0" opacity={0.6} />
          ))}
          <g transform={`translate(${g.x + g.W * 0.16 + pan * 0.7},${g.ground + 20 * g.s + Math.sin(frame * 0.07) * 2 * g.s}) rotate(${Math.sin(frame * 0.05) * 2})`}>
            <path d={`M${-70 * g.s} ${-8 * g.s} L${70 * g.s} ${-12 * g.s} Q${62 * g.s} ${6 * g.s} ${46 * g.s} ${6 * g.s} L${-54 * g.s} ${6 * g.s} Z`} fill="#3a2418" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          </g>
          <Reeds g={g} shift={pan * 1.6} color="#1a141a" />
        </g>
      )}
    </V2>
  );
};

// 12. The new reign: a palace hall at dawn, banners and royal umbrellas, nobles kneeling toward an empty gilded throne.
const EmptyThroneScene = ({ id, start, end, rise }: { id: string; start: number; end: number; rise: number }) => {
  const frame = useCurrentFrame();
  const light = interpolate(frame, [rise - 10, rise + 30], [0.3, 1], clamp);
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#5a2a18", "#d89a5a"]} accent={GOLD} warm={0.12}>
      {(g, pan) => {
        const tx = g.x + g.W * 0.62 + pan * 0.5;
        const ty = g.ground - 18 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6a3418" />
            {[0.06, 0.22, 0.86].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y} width={30 * g.s} height={g.H} fill="#8a4420" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            {[0.34, 0.46].map((f) => <rect key={f} x={g.x + g.W * f + pan * 0.2} y={g.y + 30 * g.s} width={40 * g.s} height={90 * g.s} fill="#ffd28a" opacity={0.35 + 0.4 * light} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            <Rays g={g} fx={0.4} fy={0.1} angles={[0.9, 1.1, 1.3]} color="#fff0c8" o={0.12 * light} />
            <g opacity={0.5 + 0.5 * light}>
              <Glow x={tx} y={ty - 120 * g.s} s={g.s * 0.9} color="#ffd38a" core="#fff0c8" />
            </g>
            <path d={`M${tx - 90 * g.s} ${ty} L${tx - 76 * g.s} ${ty - 26 * g.s} L${tx + 76 * g.s} ${ty - 26 * g.s} L${tx + 90 * g.s} ${ty} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
            <path d={`M${tx - 64 * g.s} ${ty - 26 * g.s} L${tx - 54 * g.s} ${ty - 50 * g.s} L${tx + 54 * g.s} ${ty - 50 * g.s} L${tx + 64 * g.s} ${ty - 26 * g.s} Z`} fill="#c9962e" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
            <rect x={tx - 40 * g.s} y={ty - 74 * g.s} width={80 * g.s} height={24 * g.s} fill="#8a2a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[-36, 36].map((d) => <rect key={d} x={tx + d * g.s - 4 * g.s} y={ty - 150 * g.s} width={8 * g.s} height={100 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
            <Prang x={tx} y={ty - 140 * g.s} h={100 * g.s} s={g.s} color={PAL.gilt} gold />
            <Chat x={tx - 130 * g.s} y={ty} h={180 * g.s} s={g.s} />
            <Chat x={tx + 130 * g.s} y={ty} h={180 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 18 * g.s} width={g.W} height={g.H} fill="#4a2814" />
            {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.06 + i * 0.1) + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.5} mode="kneel" bow={0.6 + 0.2 * light} phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
            <Banner x={g.x + g.W * 0.44 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} color={GOLD} />
            <Banner x={g.x + g.W * 0.9 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} color={GOLD} />
            <rect x={g.x - 20 * g.s + pan * 1.6} y={g.y} width={50 * g.s} height={g.H} fill="#2a1408" opacity={0.9} />
          </g>
        );
      }}
    </V2>
  );
};

// 13. The gong is struck in the palace courtyard at morning (one strike per entry in `hits`).
const GongScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  const last = hits.filter((h) => frame >= h).pop();
  const since = last === undefined ? 99 : frame - last;
  const next = hits.find((h) => h > frame);
  const toNext = next === undefined ? 99 : next - frame;
  const swing = toNext <= 3 ? -50 * (toNext / 3) : toNext <= 14 ? -50 * (1 - (toNext - 3) / 11) : 0;
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e8b07a", "#fbe6c2"]} accent={GOLD} hits={hits} warm={0.1}>
      {(g, pan) => {
        const gx = g.x + g.W * 0.55 + pan * 0.5;
        const gy = g.ground - 110 * g.s;
        const sway = since < 40 ? Math.sin(since * 0.6) * 3 * (1 - since / 40) : 0;
        const sx = gx - 150 * g.s + pan * 0.2;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.24]} lightColor={["#ffd38a", "#fff4d6"]} far="#b49a82" mid="#9a8a6a" ground="#b8a078" mist="#fff1dc" ridges={false} />
            <Hall x={g.x + g.W * 0.0 + pan * 0.2} y={g.ground - 40 * g.s} w={240 * g.s} s={g.s} />
            <Hall x={g.x + g.W * 0.76 + pan * 0.2} y={g.ground - 40 * g.s} w={220 * g.s} s={g.s} />
            <rect x={gx - 90 * g.s} y={gy - 90 * g.s} width={10 * g.s} height={200 * g.s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <rect x={gx + 80 * g.s} y={gy - 90 * g.s} width={10 * g.s} height={200 * g.s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <path d={`M${gx - 110 * g.s} ${gy - 86 * g.s} L${gx + 110 * g.s} ${gy - 86 * g.s} L${gx + 100 * g.s} ${gy - 100 * g.s} L${gx - 100 * g.s} ${gy - 100 * g.s} Z`} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <line x1={gx} y1={gy - 86 * g.s} x2={gx + sway * g.s} y2={gy - 56 * g.s} stroke="#3a2414" strokeWidth={2 * g.s} />
            <g transform={`translate(${gx + sway * g.s},${gy})`}>
              {since < 30 && [0, 1].map((r) => <circle key={r} r={(56 + since * (3 + r * 2)) * g.s} fill="none" stroke="#fff4c8" strokeWidth={3 * g.s} opacity={0.6 * (1 - since / 30)} />)}
              <circle r={56 * g.s} fill="#b8862a" stroke={PAL.ink} strokeWidth={2.4 * g.s} />
              <circle r={40 * g.s} fill="none" stroke="#8a5a1a" strokeWidth={3 * g.s} />
              <circle r={14 * g.s} fill="#d9a93a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            </g>
            <Fighter x={sx} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="stand" costume={C.siam} weapon="none" phase={0.5} />
            <g transform={`rotate(${swing},${sx + 10 * g.s},${g.ground - 84 * g.s})`}>
              <line x1={sx + 10 * g.s} y1={g.ground - 84 * g.s} x2={gx - 70 * g.s} y2={gy + 4 * g.s} stroke="#5a3a1f" strokeWidth={5 * g.s} strokeLinecap="round" />
              <circle cx={gx - 66 * g.s} cy={gy + 4 * g.s} r={10 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            </g>
            <Banner x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} color={GOLD} />
            <Banner x={g.x + g.W * 0.86 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} color={GOLD} />
            {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.02 + i * 0.17) + pan * 1.6} y={g.y + g.H + 30 * g.s} scale={g.sc * 0.7} mode="kneel" bow={0.7} phase={i} jacket="#2a1a10" />)}
          </g>
        );
      }}
    </V2>
  );
};

// 14. The city pillar is hauled upright with ropes on an auspicious morning; monks chant beside it.
const PillarScene = ({ id, start, end, up }: { id: string; start: number; end: number; up: number }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [start + 10, up], [58, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const settle = frame >= up && frame < up + 8 ? 1 - (frame - up) / 8 : 0;
  return (
    <V2 id={id} anchor={PL.pillar} start={start} end={end} sky={["#f0a88a", "#fbe2b8"]} accent={GOLD} hits={[up]} warm={0.1}>
      {(g, pan) => {
        const px = g.x + g.W * 0.5 + pan * 0.5;
        const py = g.ground - 6 * g.s;
        const L = 220 * g.s;
        const r = (a * Math.PI) / 180;
        const tip: [number, number] = [px + Math.sin(r) * L, py - Math.cos(r) * L];
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.3]} lightColor={["#ffc890", "#fff2dc"]} far="#c49a8a" mid="#9a8a6a" ground="#9a8058" mist="#ffeedd" />
            <Rays g={g} fx={0.2} fy={0.3} angles={[0.15, 0.35, 0.55]} color="#fff4dc" o={0.12} />
            <Hall x={g.x + g.W * 0.74 + pan * 0.2} y={g.ground - 46 * g.s} w={200 * g.s} s={g.s} />
            <line x1={px - 70 * g.s} y1={py} x2={px - 6 * g.s} y2={py - 250 * g.s} stroke="#5a3a1f" strokeWidth={5 * g.s} />
            <line x1={px + 70 * g.s} y1={py} x2={px + 6 * g.s} y2={py - 250 * g.s} stroke="#5a3a1f" strokeWidth={5 * g.s} />
            <g transform={`rotate(${a},${px},${py})`}>
              <rect x={px - 12 * g.s} y={py - L} width={24 * g.s} height={L} fill="#b8803a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <path d={`M${px - 14 * g.s} ${py - L} Q${px} ${py - L - 40 * g.s} ${px + 14 * g.s} ${py - L} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              {[0.3, 0.6].map((f) => <rect key={f} x={px - 13 * g.s} y={py - L * f} width={26 * g.s} height={6 * g.s} fill={RED} />)}
            </g>
            <g transform={`translate(0,${settle * 3 * g.s})`}>
              {[0, 1, 2].map((i) => {
                const wx = px - (130 + i * 60) * g.s + pan * 0.2;
                return (
                  <g key={i}>
                    <line x1={tip[0]} y1={tip[1]} x2={wx - 14 * g.s} y2={g.ground - 74 * g.s} stroke="#d8c8a0" strokeWidth={2 * g.s} />
                    <Fighter x={wx} y={g.ground + 4 * g.s} scale={g.sc * 0.52} mode={a > 2 ? "walk" : "stand"} flip costume={C.villager} weapon="none" phase={i * 0.9} />
                  </g>
                );
              })}
            </g>
            {[0, 1, 2].map((i) => <Monk key={i} x={px + (90 + i * 60) * g.s + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.5} mode="sit" phase={i} flip />)}
            <Banner x={g.x + g.W * 0.9 + pan * 0.7} y={g.ground + 6 * g.s} s={g.s} color={GOLD} />
            <Grass g={g} shift={pan * 1.6} color="#5a5a32" />
          </g>
        );
      }}
    </V2>
  );
};

// 15. Moving east: boats loaded with goods cross the river toward the new city's rising walls.
const CrossingScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.pillar} start={start} end={end} sky={["#8fbad8", "#f6dcb0"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} lightColor={["#ffe1a8", "#fff6e0"]} far="#a0aab6" mid="#8a907a" ground="#7a6a48" mist="#fff4e2" />
        <g transform={`translate(${pan * 0.5},0)`}>
          <PalaceWall x={g.x + g.W * 0.56} y={g.ground - 40 * g.s} w={g.W * 0.4} h={56 * g.s} s={g.s} color="#efe7d6" />
          {[0.6, 0.7, 0.8, 0.9].map((f) => <line key={f} x1={g.x + g.W * f} y1={g.ground - 40 * g.s} x2={g.x + g.W * f} y2={g.ground - 140 * g.s} stroke="#7a5a32" strokeWidth={3 * g.s} />)}
          <line x1={g.x + g.W * 0.58} y1={g.ground - 120 * g.s} x2={g.x + g.W * 0.94} y2={g.ground - 120 * g.s} stroke="#7a5a32" strokeWidth={3 * g.s} />
          <Hall x={g.x + g.W * 0.66} y={g.ground - 96 * g.s} w={150 * g.s} s={g.s} roof="#b8862a" />
          {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.6 + i * 0.2) + ((lt * 0.6 * g.s) % (60 * g.s))} y={g.ground - 40 * g.s} scale={g.sc * 0.36} mode="walk" costume={C.villager} weapon="none" phase={i} />)}
        </g>
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#5f8aa6" />
        {[0, 1].map((i) => {
          const bx = g.x + g.W * (0.08 + i * 0.26) + lt * 0.7 * g.s;
          const by = g.ground + (i ? 30 : 6) * g.s;
          return (
            <g key={i} transform={`translate(${pan * 0.7},0)`}>
              <Boat x={bx} y={by} w={170 * g.s} s={g.s} n={3} costume={C.villager} />
              {[0, 1, 2].map((k) => <rect key={k} x={bx + (10 + k * 22) * g.s} y={by - 34 * g.s} width={20 * g.s} height={16 * g.s} fill={k % 2 ? "#a07a4a" : "#c89a5a"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
            </g>
          );
        })}
        <Reeds g={g} shift={pan * 1.6} color="#24301c" />
      </g>
    )}
  </V2>
);

// ---------- screen overlays ----------

const useS = () => {
  const { width, height } = useVideoConfig();
  return { s: Math.min(width, height) / 1080, height };
};

// Two question cards (question2): Phraya San? · King Taksin?
const QuestionCards = () => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  if (frame < T.qSan - 4 || frame > T.trial + 8) return null;
  const out = interpolate(frame, [T.trial - 4, T.trial + 8], [1, 0], clamp);
  const card = (f: number, portrait: string, text: string, x: number) => {
    const k = interpolate(frame, [f, f + 10], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: x * s, top: height * 0.3, width: 440 * s, opacity: k * out, transform: `translateY(${(1 - k) * 30 * s}px)`, background: "rgba(8,14,26,0.86)", border: `${3 * s}px solid ${RED}`, borderRadius: 16 * s, padding: 18 * s, textAlign: "center", fontFamily: font, color: "#fff" }}>
        <div style={{ position: "relative", width: 230 * s, height: 230 * s, margin: "0 auto" }}>
          <Img src={staticFile(`portraits/thaihistory/${portrait}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 * s }} />
          <span style={{ position: "absolute", left: 6 * s, bottom: 6 * s, background: "rgba(8,14,26,0.75)", fontSize: 16 * s, padding: `0 ${8 * s}px`, borderRadius: 6 * s }}>ภาพประกอบ</span>
        </div>
        <div style={{ fontSize: 52 * s, fontWeight: 900, marginTop: 8 * s, lineHeight: 1.3 }}>{text}</div>
      </div>
    );
  };
  return (
    <>
      {card(T.qSan, "phraya_san", "พระยาสรรค์?", 80)}
      {card(T.qTaksin, "taksin_king", "พระเจ้าตาก?", 560)}
    </>
  );
};

// Two old comrades side by side (ask): King Taksin and Chao Phraya Chakri, joined by a gold line.
const ComradesPair = () => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  const a = T.meet - 6;
  const z = T.wave + 10;
  if (frame < a || frame > z + 10) return null;
  const o = interpolate(frame, [z - 6, z + 6], [1, 0], clamp);
  const k1 = interpolate(frame, [a, a + 10], [0, 1], clamp);
  const k2 = interpolate(frame, [a + 8, a + 18], [0, 1], clamp);
  const line = interpolate(frame, [a + 14, a + 34], [0, 1], clamp);
  const pic = (portrait: string, name: string, k: number, x: number) => (
    <div style={{ position: "absolute", left: x * s, top: height * 0.3, width: 320 * s, opacity: k * o, transform: `scale(${0.9 + 0.1 * k})`, textAlign: "center", fontFamily: font, color: "#fff" }}>
      <div style={{ position: "relative", width: 300 * s, height: 300 * s, margin: "0 auto" }}>
        <Img src={staticFile(`portraits/thaihistory/${portrait}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 * s, border: `${4 * s}px solid ${GOLD}`, filter: "sepia(0.25)" }} />
        <span style={{ position: "absolute", left: 8 * s, bottom: 8 * s, background: "rgba(8,14,26,0.75)", fontSize: 16 * s, padding: `0 ${8 * s}px`, borderRadius: 6 * s }}>ภาพประกอบ</span>
      </div>
      <div style={{ display: "inline-block", marginTop: 8 * s, background: "rgba(8,14,26,0.86)", padding: `${2 * s}px ${16 * s}px`, borderRadius: 10 * s, fontSize: 36 * s, fontWeight: 900 }}>{name}</div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 390 * s, width: 300 * s * line, top: height * 0.3 + 150 * s, height: 6 * s, background: GOLD, opacity: o, boxShadow: `0 0 ${16 * s}px ${GOLD}` }} />
      {pic("taksin_king", "พระเจ้าตาก", k1, 80)}
      {pic("chakri", "เจ้าพระยาจักรี", k2, 680)}
    </>
  );
};

export const e4c5: Chapter4 = {
  name: "6 เมษายน 2325",
  from: T.dawn,
  to: END,
  cams: (w, h) => [
    { frame: T.dawn, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.pho - 20, cam: view(VW.thonWide, w, h, 1.0, 0.08) },
    { frame: T.pho + 20, cam: view(VW.thon, w, h, 0.8, 0.08) },
    { frame: T.cross, cam: view(VW.thon, w, h, 0.82, 0.08) },
    { frame: T.trial, cam: view(VW.thon, w, h, 0.85, 0.08) },
    { frame: T.fortPin - 12, cam: view(VW.thon, w, h, 0.85, 0.08) },
    { frame: T.fortPin + 30, cam: view(VW_FORT, w, h, 1.0, 0.08) },
    { frame: T.dyn, cam: view(VW_FORT, w, h, 0.95, 0.08) },
    { frame: T.dyn + 40, cam: view(VW.thon, w, h, 0.82, 0.08) },
    { frame: T.pillar - 16, cam: view(VW.thon, w, h, 0.82, 0.08) },
    { frame: T.pillar + 30, cam: view(VW_BKK, w, h, 1.0, 0.08) },
    { frame: T.city - 24, cam: view(VW_BKK, w, h, 1.0, 0.08) },
    { frame: T.city + 20, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
  ],
  years: [[T.dawn, "2325"]],
  heads: [
    { f: T.dawn, tag: "6 เมษายน 2325", head: "เช้าวันเสาร์ ราว 2 โมงเช้า", color: GOLD },
    { f: T.army, tag: "6 เมษายน 2325", head: "ทัพถึงวัดโพธิ์", color: GOLD, portrait: "chakri" },
    { f: T.enter, tag: "ข้ามเข้าเมือง", head: "ขุนนางมารับ", color: GOLD, portrait: "chakri" },
    { f: T.q2, tag: "สองคำถาม", head: "พระยาสรรค์ · พระเจ้าตาก", color: RED },
    { f: T.trial, tag: "ไต่สวน", head: "กรมขุนอนุรักษ์สงครามให้การ", color: RED, portrait: "anurak" },
    { f: T.punish, tag: "ไต่สวน", head: "พระยาสรรค์ถูกลงโทษ", color: RED, portrait: "phraya_san" },
    { f: T.decide, tag: "พงศาวดารเล่า", head: "ส่วนพระเจ้าตาก", color: PALE, portrait: "taksin_king" },
    { f: T.council, tag: "พงศาวดารเล่า", head: "ขุนนางลงความเห็น", color: PALE, portrait: "taksin_king" },
    { f: T.ask, tag: "ตามพงศาวดารฉบับพระราชหัตถเลขา", head: "ขอพบสหายเก่า", color: GOLD },
    { f: T.comrade, tag: "ตามพงศาวดาร", head: "ขอพบสหายเก่า", color: GOLD, chips: [{ text: "รบเคียงกันมาสิบกว่าปี", f: T.comrade + 6 }] },
    { f: T.wave, tag: "ตามพงศาวดาร", head: "โบกพระหัตถ์ ไม่ให้พบ", color: PALE },
    { f: T.fort, tag: "ตามพงศาวดาร", head: "ป้อมวิไชยประสิทธิ์", color: PALE },
    {
      f: T.age,
      tag: "พระชนมายุ",
      head: "พระเจ้าตาก",
      color: PALE,
      portrait: "taksin_king",
      stat: (f) => `${Math.round(interpolate(f, [T.n47, T.n47 + 24], [0, 47], clamp))}`,
      label: "พรรษา",
      chips: [{ text: "พงศาวดาร: 48 (นับแบบเก่า)", f: T.n48 }],
    },
    { f: T.dyn, tag: "6 เมษายน 2325", head: "ปฐมราชวงศ์จักรี", color: GOLD, portrait: "chakri" },
    { f: T.first, tag: "6 เมษายน 2325", head: "ปฐมราชวงศ์จักรี", color: GOLD, portrait: "chakri", chips: [{ text: "6 เมษายน · วันจักรี", f: T.chakriDay }] },
    { f: T.bkk, tag: "21 เมษายน 2325", head: "ตั้งเสาหลักเมือง", color: GOLD },
    { f: T.move, tag: "21 เมษายน 2325", head: "ตั้งกรุงเทพฯ", color: GOLD, chips: [{ text: "ย้ายไปฝั่งตะวันออก", f: T.east }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityDot at={PL.watPho} color={GOLD} r={10} start={T.pho} end={T.q2} />
        {frame < T.q2 + 10 && <PointLabel at={PL.watPho} text="วัดโพธิ์" start={T.pho} color={GOLD} size={0.8} />}
        <Arrow points={R_CROSS} start={T.cross} end={T.cross + 30} color={GOLD} width={14} opacity={interpolate(frame, [T.trial, T.trial + 15], [1, 0], clamp)} />
        {((frame >= T.cross + 24 && frame < T.fortPin && !(frame >= T.meet - 8 && frame < T.wave + 20)) || (frame >= T.dyn + 20 && frame < T.move)) && <PointLabel at={PL.thon} text="พระราชวังเดิม" start={frame < T.meet ? T.cross + 24 : frame < T.fortPin ? T.wave + 20 : T.dyn + 20} color={GOLD} size={0.75} />}
        <Ring at={PL.thon} r={0.0025} color={RED} start={T.q2} end={T.decide} />
        {frame >= T.fortPin && frame < T.dyn && <PointLabel at={PL.fort} text="ป้อมวิไชยประสิทธิ์" start={T.fortPin} color="#e8e2d6" size={0.72} />}
        {frame >= T.age + 30 && frame < T.dyn && <PointLabel at={PL.watArun} text="วัดอรุณฯ" start={T.age + 30} color={PALE} size={0.7} />}
        <Arrow points={R_BKK} start={T.move} end={T.move + 30} color={GOLD} width={18} />
        {frame >= T.pillar && <PointLabel at={PL.pillar} text="ศาลหลักเมือง" start={T.pillar} color={GOLD} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <DawnRiverScene id="e4c5dawn" start={T.dawn} end={T.army + 14} />
      <ArmyArriveScene id="e4c5army" start={T.army} end={T.enter + 14} />
      <LandingScene id="e4c5landing" start={T.enter} end={T.q2 + 14} dock={DOCK} />
      <GateWaitScene id="e4c5gate" start={T.q2} end={T.trial + 14} />
      <TrialScene id="e4c5trial" start={T.trial} end={T.decide + 14} sentence={T.punish} />
      <ChronicleScene id="e4c5chron" start={T.decide} end={T.council + 14} />
      <CouncilScene id="e4c5council" start={T.council} end={T.ask + 14} agree={T.agree} />
      <ChronicleScene id="e4c5chron2" start={T.ask} end={T.comrade + 14} royal />
      <MemoryFieldScene id="e4c5memory" start={T.comrade} end={T.wave + 14} />
      <CurtainScene id="e4c5curtain" start={T.wave} end={T.fort + 14} waveAt={T.waveHand} />
      <FortScene id="e4c5fort" start={T.fort} end={T.age + 14} lower={T.fortPin + 10} />
      <DuskRiverScene id="e4c5dusk" start={T.age} end={T.dyn + 14} />
      <EmptyThroneScene id="e4c5throne" start={T.dyn} end={T.first + 14} rise={T.reign} />
      <GongScene id="e4c5gong" start={T.first} end={T.bkk + 14} hits={GONGS} />
      <PillarScene id="e4c5pillar" start={T.bkk} end={T.move + 14} up={PILLAR_UP} />
      <CrossingScene id="e4c5cross" start={T.move} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <QuestionCards />
      <ComradesPair />
    </>
  ),
  sfx: [
    [T.dawn, SFX.swell, 0.25],
    [T.pho - 26, SFX.whoosh, 0.22],
    [T.pho, SFX.pop, 0.3],
    [T.cross, SFX.whoosh, 0.22],
    [T.qSan, SFX.pop, 0.35],
    [T.qTaksin, SFX.pop, 0.35],
    [T.meet - 6, SFX.pop, 0.25],
    [T.fortPin, SFX.pop, 0.18],
    [T.chakriDay, SFX.pop, 0.3],
    [T.pillar - 22, SFX.whoosh, 0.25],
    [T.pillar, SFX.pop, 0.3],
    [T.move, SFX.whoosh, 0.22],
    [T.east, SFX.pop, 0.3],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={T.dawn} to={T.army + 10} volume={0.14} voice={VOICE} />
      <Bed id="army_marching" from={T.army - 6} to={T.enter + 12} volume={0.3} voice={VOICE} />
      <Hit id="war_drums" at={T.army} volume={0.35} />
      <Bed id="city_crowd" from={T.enter} to={T.q2 + 10} volume={0.16} voice={VOICE} />
      <Hit id="wood_hit" at={DOCK} volume={0.3} />
      <Bed id="wind" from={T.q2} to={T.comrade + 10} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.trial + 6} volume={0.3} />
      <Hit id="sword_draw" at={T.punish} volume={0.25} />
      <Hit id="gong" at={T.agree} volume={0.2} />
      <Bed id="wind" from={T.comrade - 6} to={T.wave + 10} volume={0.18} voice={VOICE} />
      <Hit id="horse_neigh" at={T.comrade + 24} volume={0.22} />
      <Bed id="wind" from={T.wave} to={T.dyn + 10} volume={0.1} voice={VOICE} />
      <Bed id="city_crowd" from={T.dyn} to={T.first + 10} volume={0.08} voice={VOICE} />
      {GONGS.map((f, i) => <Hit key={f} id="gong" at={f} volume={i === 0 ? 0.45 : 0.35} />)}
      <Bed id="city_crowd" from={T.bkk} to={END + 14} volume={0.16} voice={VOICE} />
      <Hit id="wood_hit" at={PILLAR_UP} volume={0.4} />
      <Hit id="crowd_cheer" at={PILLAR_UP + 4} volume={0.22} />
      <Hit id="splash" at={T.move + 12} volume={0.25} />
    </>
  ),
};
