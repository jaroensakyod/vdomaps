import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Banner, COSTUME, Depth, Fighter, Glow, Grass, PAL, type Costume } from "../../../components/Scene";
import { clamp, GOLD, Panel, RED } from "../news/kit";
import { Moon, RuinedPrang, SiegeCamp } from "../news/Period";
import { Backdrop, Boat, C, Candle, Fire, Hall, Manuscript, Noble, Palisade, PalaceWall, Prang, River, Smoke, Tree, type G } from "../ep04/v2";
import { Cannon, Cloud, Elephant, muzzle, Parasol, Sack } from "../ep04/ch1_kit";
import { Birds, Horse, Reeds, Stars, Tent, Torch } from "../ep04/ch3_kit";
import { BackFigure, Lamp } from "../ep05/ch1_kit5";
import { Splash } from "../ep05/ch3_kit5";
import { Sea } from "../ep05/kit5";
import { flashOf, softImpact } from "./beatsKit";

// Episode 6 illustration panels (house style v2: depth layers, light, jointed figures, soft impact).
// Phraya Tak is never drawn with a face: always small, from the side or behind.

export const K: Record<string, Costume> = {
  siam: COSTUME.siam,
  tak: { jacket: "#7a1f1a", sash: PAL.gilt, pants: "#2a2420", head: "short" },
  chinese: { jacket: "#2a2f3a", sash: "#c9302c", pants: "#1a1a1a", head: "wrap", headColor: "#1a1a1a" },
  burma: COSTUME.burma,
  villager: C.villager,
  rebel: C.rebel,
  official: { jacket: "#efe6d0", sash: PAL.gilt, pants: "#2b3a67", head: "short" },
  fisher: { jacket: "#6a5a3a", sash: "#3a5a6a", pants: "#3a2f26", head: "wrap", headColor: "#c9b48a" },
};

type P = { id: string; anchor: [number, number]; start: number; end: number };

// One panel: Panel (leader line, label) + Depth (push-in, pan, soft shake on `hits`, warm light, grain).
export const V6 = ({ id, anchor, start, end, sky, accent = GOLD, hits = [], warm = 0.08, children }: P & { sky: [string, string]; accent?: string; hits?: number[]; warm?: number; children: (g: G, pan: number, lt: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={sky} accent={accent}>
      {(g) => (
        <Depth g={g} id={id} start={start} end={end} impact={softImpact(frame, hits)} warm={warm}>
          {(pan) => children(g, pan, frame - start)}
        </Depth>
      )}
    </Panel>
  );
};

// Ayutthaya skyline far away: wall + prangs (h in unscaled px).
const City = ({ g, x, y, w, k = 1, color = "#4a4458" }: { g: G; x: number; y: number; w: number; k?: number; color?: string }) => (
  <g>
    <Prang x={x + w * 0.2} y={y - 30 * g.s * k} h={120 * g.s * k} s={g.s * k} color={color} />
    <Prang x={x + w * 0.5} y={y - 30 * g.s * k} h={170 * g.s * k} s={g.s * k} color={color} />
    <Prang x={x + w * 0.8} y={y - 30 * g.s * k} h={110 * g.s * k} s={g.s * k} color={color} />
    <PalaceWall x={x} y={y} w={w} h={34 * g.s * k} s={g.s * k} color={color} />
  </g>
);

// Night ground with a mist band.
const NightGround = ({ g, pan, ground = "#1c1a16", mist = "#7a8aa8" }: { g: G; pan: number; ground?: string; mist?: string }) => (
  <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground={ground} mist={mist} />
);

// A file of soldiers (Fighter) along the ground; dx in panel fractions.
const File = ({ g, pan, x0, dx, n, y = 0, mode = "walk", costume = K.siam, flip = false, scale = 0.6, weapon = "spear", speed = 0, lt = 0, mix, layer = 0.7 }: { g: G; pan: number; x0: number; dx: number; n: number; y?: number; mode?: "walk" | "run" | "attack" | "aim" | "stand"; costume?: Costume; flip?: boolean; scale?: number; weapon?: "spear" | "rifle" | "none"; speed?: number; lt?: number; mix?: Costume; layer?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Fighter key={i} x={g.x + g.W * (x0 + i * dx) + speed * lt * g.s + pan * layer} y={g.ground + y * g.s} scale={g.sc * scale} mode={mode} costume={mix && i % 3 === 1 ? mix : costume} flip={flip} weapon={weapon} phase={i * 1.1} />
    ))}
  </g>
);

// ---------------- opening ----------------

// The siege at night: Ayutthaya's prangs on the horizon, Burmese camps and fires all around, sentries walking.
export const SiegeNightScene = (p: P) => (
  <V6 {...p} sky={["#0b1026", "#3a2440"]} accent={RED} warm={0.05}>
    {(g, pan, lt) => (
      <g>
        <Stars g={g} n={20} />
        <Moon x={g.x + g.W * 0.82 + pan * 0.1} y={g.y + g.H * 0.2} r={18 * g.s} />
        <NightGround g={g} pan={pan} />
        <City g={g} x={g.x + g.W * 0.25 + pan * 0.3} y={g.ground - 50 * g.s} w={g.W * 0.5} k={0.7} color="#3a3448" />
        <SiegeCamp x={g.x + g.W * 0.18 + pan * 0.6} y={g.ground - 6 * g.s} s={g.s * 0.8} w={200} phase={1} />
        <SiegeCamp x={g.x + g.W * 0.8 + pan * 0.6} y={g.ground - 6 * g.s} s={g.s * 0.8} w={180} phase={3} />
        <File g={g} pan={pan} x0={0.3} dx={0.1} n={3} y={14} costume={K.burma} lt={lt} speed={0.4} scale={0.62} layer={1.1} />
        <Grass g={g} shift={pan * 1.6} color="#0e0e0a" />
      </g>
    )}
  </V6>
);

// Breakout: a gold-banner column runs right through a gap between burning camps.
export const BreakoutScene = (p: P) => (
  <V6 {...p} sky={["#0e1020", "#5a2a2a"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <NightGround g={g} pan={pan} ground="#201a14" mist="#c08060" />
        <SiegeCamp x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 8 * g.s} s={g.s * 0.75} w={180} phase={2} />
        <SiegeCamp x={g.x + g.W * 0.88 + pan * 0.5} y={g.ground - 8 * g.s} s={g.s * 0.75} w={180} phase={5} />
        <Banner x={g.x + g.W * 0.3 + lt * 1.4 * g.s + pan * 0.8} y={g.ground + 4 * g.s} s={g.s} color={GOLD} />
        <File g={g} pan={pan} x0={0.05} dx={0.09} n={6} y={8} mode="run" mix={K.chinese} lt={lt} speed={1.4} scale={0.62} layer={0.8} />
        <Torch x={g.x + g.W * 0.5 + pan * 1.6} y={g.y + g.H + 10 * g.s} s={g.s * 1.2} h={110} seed={2} />
        <Grass g={g} shift={pan * 1.6} color="#120e0a" />
      </g>
    )}
  </V6>
);

// A lone officer on the wall at dusk, back to us, looking out over the enemy camps.
export const WallLookoutScene = ({ dusk = true, ...p }: P & { dusk?: boolean }) => (
  <V6 {...p} sky={dusk ? ["#2a2440", "#e08a50"] : ["#0b1026", "#2a2a48"]} accent={GOLD} warm={dusk ? 0.12 : 0.04}>
    {(g, pan) => (
      <g>
        {dusk ? <Glow x={g.x + g.W * 0.7 + pan * 0.1} y={g.ground - 60 * g.s} s={g.s * 1.2} color="#ff9a4a" core="#ffe0a0" /> : <Moon x={g.x + g.W * 0.75} y={g.y + g.H * 0.22} r={16 * g.s} />}
        <Backdrop g={g} pan={pan} light={null} far={dusk ? "#5a4a6a" : "#1c2238"} mid={dusk ? "#3a3440" : "#161a26"} ground="#2a2418" mist={dusk ? "#f3b080" : "#6a7a9a"} />
        <SiegeCamp x={g.x + g.W * 0.35 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 0.6} w={160} phase={1} />
        <SiegeCamp x={g.x + g.W * 0.75 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 0.6} w={160} phase={4} />
        <PalaceWall x={g.x - 60 * g.s + pan * 1.3} y={g.y + g.H + 4 * g.s} w={g.W + 120 * g.s} h={70 * g.s} s={g.s * 1.3} color="#b8ad94" />
        <Fighter x={g.x + g.W * 0.3 + pan * 1.3} y={g.y + g.H - 82 * g.s} scale={g.sc * 0.8} mode="stand" costume={K.tak} weapon="none" />
        <Banner x={g.x + g.W * 0.15 + pan * 1.3} y={g.y + g.H - 82 * g.s} s={g.s} color={GOLD} />
      </g>
    )}
  </V6>
);

// ---------------- chapter 1: why leave ----------------

// A noble rides in through the city gate, guards on the wall.
export const GateRideScene = (p: P) => (
  <V6 {...p} sky={["#6a90b8", "#f0d0a0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#7a7a8a" mid="#5a6a4a" ground="#7a6040" mist="#fff0d0" />
        <Prang x={g.x + g.W * 0.7 + pan * 0.4} y={g.ground - 60 * g.s} h={180 * g.s} s={g.s} />
        <PalaceWall x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground - 4 * g.s} w={g.W * 0.75} h={70 * g.s} s={g.s} gateAt={0.3} gateOpen={1} />
        <File g={g} pan={pan} x0={0.45} dx={0.14} n={3} y={-76} mode="stand" scale={0.42} layer={0.6} />
        <Horse x={g.x + g.W * (0.05 + Math.min(lt, 120) * 0.0016) + pan * 0.9} y={g.ground + 14 * g.s} scale={g.sc * 0.62} rider={K.tak} phase={0} />
        <File g={g} pan={pan} x0={-0.05} dx={0.08} n={3} y={18} lt={lt} speed={0.55} scale={0.66} layer={1.2} />
        <Grass g={g} shift={pan * 1.6} color="#4a4a2a" />
      </g>
    )}
  </V6>
);

// Powder store running low: two kegs left, an official writes each shot into the book.
export const PowderStoreScene = (p: P) => (
  <V6 {...p} sky={["#2a1a10", "#5a3a20"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2414" />
        {[0.08, 0.3, 0.7, 0.92].map((f) => <rect key={f} x={g.x + g.W * f - 12 * g.s + pan * 0.2} y={g.y} width={24 * g.s} height={g.H} fill="#4a2e1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x - 40 * g.s} y={g.ground - 20 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a1a10" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${g.x + g.W * (0.2 + i * 0.1) + pan * 0.7},${g.ground - 16 * g.s})`}>
            <ellipse cx={0} cy={0} rx={26 * g.s} ry={8 * g.s} fill="#5a3a1f" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <path d={`M${-26 * g.s} 0 Q${-32 * g.s} ${-36 * g.s} ${-24 * g.s} ${-70 * g.s} L${24 * g.s} ${-70 * g.s} Q${32 * g.s} ${-36 * g.s} ${26 * g.s} 0 Z`} fill="#7a4a24" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[-20, -50].map((y) => <line key={y} x1={-28 * g.s} y1={y * g.s} x2={28 * g.s} y2={y * g.s} stroke="#3a2a1a" strokeWidth={3 * g.s} />)}
          </g>
        ))}
        {[0, 1, 2].map((i) => <ellipse key={i} cx={g.x + g.W * (0.42 + i * 0.07) + pan * 0.7} cy={g.ground - 18 * g.s} rx={22 * g.s} ry={6 * g.s} fill="#2a1a10" stroke="#5a3a20" strokeWidth={1.4 * g.s} strokeDasharray={`${5 * g.s} ${4 * g.s}`} />)}
        <Candle x={g.x + g.W * 0.66 + pan * 0.8} y={g.ground - 30 * g.s} s={g.s} />
        <Manuscript x={g.x + g.W * 0.7 + pan * 0.8} y={g.ground - 32 * g.s} w={120 * g.s} s={g.s} lines={4} />
        <Noble x={g.x + g.W * 0.86 + pan * 1.2} y={g.ground + 12 * g.s} scale={g.sc * 0.7} mode="sit" jacket="#efe6d0" flip />
      </g>
    )}
  </V6>
);

// A bronze gun on the rampart fires at the camps across the field (one shot, soft flash and shake).
export const RampartGunScene = ({ fire, ...p }: P & { fire: number }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#7a8aa8", "#e8c890"]} accent={RED} hits={[fire]} warm={0.1}>
      {(g, pan) => {
        const cx = g.x + g.W * 0.24 + pan * 1.1;
        const cy = g.y + g.H - 70 * g.s;
        const [mx, my] = muzzle(cx, cy, g.s * 1.1);
        const fl = flashOf(frame, fire);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.8, 0.3]} far="#8a8a9a" mid="#6a7058" ground="#8a7048" mist="#fff0d0" />
            <SiegeCamp x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 8 * g.s} s={g.s * 0.65} w={180} phase={2} />
            {frame >= fire && <Smoke x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} n={5} />}
            <PalaceWall x={g.x - 60 * g.s + pan * 1.1} y={g.y + g.H + 4 * g.s} w={g.W * 0.7} h={64 * g.s} s={g.s * 1.2} color="#b8ad94" />
            <Cannon x={cx} y={cy} s={g.s * 1.1} fire={[fire]} />
            <circle cx={mx} cy={my} r={34 * g.s * fl} fill="#ffd25a" opacity={0.85 * fl} />
            {frame >= fire && <Smoke x={mx + 10 * g.s} y={my} s={g.s} n={4} />}
            <Fighter x={cx - 70 * g.s} y={cy + 2 * g.s} scale={g.sc * 0.66} mode="stand" costume={K.tak} weapon="none" />
          </g>
        );
      }}
    </V6>
  );
};

// Inquiry in the hall: an officer prostrate before seated judges, a scribe reads the charge.
export const InquiryScene = (p: P) => (
  <V6 {...p} sky={["#2a1a10", "#6a3a1a"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2214" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 40 * g.s} w={g.W * 0.9} s={g.s} glow={0.4} />
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#4a2e1a" />
        {[0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.62 + i * 0.12) + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="sit" jacket={i === 1 ? "#d9c08a" : "#efe6d0"} flip phase={i} />)}
        <Manuscript x={g.x + g.W * 0.5 + pan * 0.8} y={g.ground - 4 * g.s} w={110 * g.s} s={g.s} lines={3} />
        <Noble x={g.x + g.W * 0.24 + pan * 1.5} y={g.ground + 34 * g.s} scale={g.sc * 0.8} mode="prostrate" jacket="#7a1f1a" />
      </g>
    )}
  </V6>
);

// Boats fighting in the flooded fields outside the wall: smoke, Burmese on the bank.
export const FloodFightScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#4a5a78", "#c89a70"]} accent={RED} hits={shots} warm={0.06}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.3]} far="#5a6070" mid="#4a5040" ground="#5a4a30" mist="#d0c0a0" />
          <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#4a6a80" />
          <Smoke x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s * 1.2} n={6} dark />
          <Boat x={g.x + g.W * (0.3 + lt * 0.0006) + pan * 0.7} y={g.ground + 4 * g.s} w={200 * g.s} s={g.s} n={5} />
          <Boat x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground + 20 * g.s} w={160 * g.s} s={g.s} n={4} />
          <File g={g} pan={pan} x0={0.8} dx={0.06} n={3} y={-36} mode="aim" costume={K.burma} flip weapon="rifle" scale={0.5} layer={0.5} />
          {shots.map((f) => {
            const k = flashOf(frame, f);
            return k > 0 ? <circle key={f} cx={g.x + g.W * 0.78 + pan * 0.5} cy={g.ground - 90 * g.s} r={18 * g.s * k} fill="#ffd25a" opacity={0.8 * k} /> : null;
          })}
          <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.2} shift={pan * 1.6} color="#3a4a2a" n={20} h={60} />
        </g>
      )}
    </V6>
  );
};

// Two palm-leaf chronicles on a low table by a candle — two readings of the same night.
export const ChroniclesScene = (p: P) => (
  <V6 {...p} sky={["#1e1a20", "#3a2a24"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#241c1a" />
        <Lamp x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 46 * g.s} s={g.s * 1.2} />
        <rect x={g.x - 40 * g.s} y={g.ground - 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Manuscript x={g.x + g.W * 0.12 + pan * 0.8} y={g.ground - 44 * g.s} w={g.W * 0.3} s={g.s} lines={5} dark={false} />
        <Manuscript x={g.x + g.W * 0.58 + pan * 0.8} y={g.ground - 44 * g.s} w={g.W * 0.3} s={g.s} lines={5} />
        <text x={g.x + g.W * 0.27 + pan * 0.8} y={g.ground - 70 * g.s} fill="#efe6d0" fontSize={30 * g.s} fontWeight={900} textAnchor="middle">หนี?</text>
        <text x={g.x + g.W * 0.73 + pan * 0.8} y={g.ground - 70 * g.s} fill={GOLD} fontSize={30 * g.s} fontWeight={900} textAnchor="middle">รับสั่ง?</text>
      </g>
    )}
  </V6>
);

// ---------------- chapter 2: the night ----------------

// Wat Phichai camp: a stockade before a prang, Thai and Chinese soldiers sharpening blades by torchlight.
export const PhichaiCampScene = (p: P) => (
  <V6 {...p} sky={["#141830", "#4a3040"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Stars g={g} n={16} />
        <NightGround g={g} pan={pan} ground="#2a2218" mist="#a08070" />
        <Prang x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 30 * g.s} h={190 * g.s} s={g.s} color="#8a7a6a" />
        <Palisade x={g.x - 20 * g.s + pan * 0.6} y={g.ground - 18 * g.s} w={g.W + 40 * g.s} s={g.s} color="#6a4a2a" />
        <Torch x={g.x + g.W * 0.2 + pan * 0.8} y={g.ground + 6 * g.s} s={g.s} seed={1} />
        <Torch x={g.x + g.W * 0.78 + pan * 0.8} y={g.ground + 6 * g.s} s={g.s} seed={3} />
        <File g={g} pan={pan} x0={0.1} dx={0.15} n={6} y={22} mode="attack" mix={K.chinese} scale={0.64} layer={1.0} />
        <Grass g={g} shift={pan * 1.6} color="#14100a" />
      </g>
    )}
  </V6>
);

// Three officers stand by their horses under a gold banner, seen from the side.
export const OfficersScene = (p: P) => (
  <V6 {...p} sky={["#1a1e38", "#5a3a48"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Stars g={g} n={14} />
        <NightGround g={g} pan={pan} ground="#2a2218" mist="#8a7a8a" />
        <Tent x={g.x + g.W * 0.62 + pan * 0.5} y={g.ground - 10 * g.s} w={150 * g.s} s={g.s} glow={0.6} />
        <Banner x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 8 * g.s} s={g.s * 1.1} color={GOLD} />
        <Horse x={g.x + g.W * 0.16 + pan * 0.8} y={g.ground + 16 * g.s} scale={g.sc * 0.58} phase={9} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.36 + i * 0.12) + pan * 0.9} y={g.ground + 20 * g.s} scale={g.sc * 0.7} mode="stand" costume={i === 2 ? K.chinese : K.siam} weapon={i === 1 ? "spear" : "none"} phase={i} />)}
        <Torch x={g.x + g.W * 0.9 + pan * 1.6} y={g.y + g.H + 10 * g.s} s={g.s * 1.1} seed={4} />
        <Grass g={g} shift={pan * 1.6} color="#14100a" />
      </g>
    )}
  </V6>
);

// The column files out of the camp gate under the moon, low mist over the paddies.
export const MarchOutScene = (p: P) => (
  <V6 {...p} sky={["#0b1230", "#2a3050"]} accent={GOLD} warm={0.04}>
    {(g, pan, lt) => (
      <g>
        <Stars g={g} n={22} />
        <Moon x={g.x + g.W * 0.2 + pan * 0.1} y={g.y + g.H * 0.22} r={20 * g.s} />
        <NightGround g={g} pan={pan} ground="#1a1c1e" mist="#9aa8c8" />
        <Palisade x={g.x - 20 * g.s + pan * 0.6} y={g.ground - 16 * g.s} w={g.W * 0.3} s={g.s} color="#4a3a2a" />
        <File g={g} pan={pan} x0={0.22} dx={0.1} n={7} y={10} mix={K.chinese} lt={lt} speed={0.7} scale={0.6} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={40 * g.s} fill="#c8d4f0" opacity={0.12} />
        <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.1} shift={pan * 1.6} color="#1a2418" n={22} h={56} />
      </g>
    )}
  </V6>
);

// Night clash at Ban Hantra: spears and muskets in the dark, flashes rise and fade (no strobe).
export const NightClashScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#0e1020", "#2a2034"]} accent={RED} hits={shots} warm={0.05}>
      {(g, pan) => (
        <g>
          <NightGround g={g} pan={pan} ground="#1e1a16" mist="#6a6a8a" />
          <Torch x={g.x + g.W * 0.12 + pan * 0.6} y={g.ground + 4 * g.s} s={g.s} seed={2} />
          <File g={g} pan={pan} x0={0.12} dx={0.1} n={4} y={14} mode="attack" mix={K.chinese} scale={0.64} layer={0.9} />
          <File g={g} pan={pan} x0={0.6} dx={0.1} n={4} y={14} mode="attack" costume={K.burma} flip scale={0.62} layer={0.9} />
          {shots.map((f, i) => {
            const k = flashOf(frame, f);
            return k > 0 ? <circle key={f} cx={g.x + g.W * (0.45 + (i % 2) * 0.12) + pan * 0.9} cy={g.ground - 70 * g.s} r={40 * g.s * k} fill="#ffd25a" opacity={0.55 * k} /> : null;
          })}
          <Grass g={g} shift={pan * 1.6} color="#0c0a08" />
        </g>
      )}
    </V6>
  );
};

// Midnight: soldiers on a paddy dyke look back; the sky over Ayutthaya glows orange (slow sine, never blinks).
export const CityGlowScene = ({ ruin = false, ...p }: P & { ruin?: boolean }) => (
  <V6 {...p} sky={["#0b0e22", "#3a1a1a"]} accent={RED} warm={0.05}>
    {(g, pan, lt) => {
      const glow = 0.6 + 0.12 * Math.sin(lt * 0.06) + 0.06 * Math.sin(lt * 0.17);
      return (
        <g>
          <Stars g={g} n={12} />
          <ellipse cx={g.x + g.W * 0.55 + pan * 0.15} cy={g.ground - 50 * g.s} rx={g.W * 0.5} ry={110 * g.s} fill="#ff6a2a" opacity={0.45 * glow} />
          <ellipse cx={g.x + g.W * 0.55 + pan * 0.15} cy={g.ground - 50 * g.s} rx={g.W * 0.25} ry={60 * g.s} fill="#ffb04a" opacity={0.5 * glow} />
          <City g={g} x={g.x + g.W * 0.3 + pan * 0.2} y={g.ground - 40 * g.s} w={g.W * 0.5} k={0.55} color="#1a1418" />
          {[0.38, 0.55, 0.7].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.2} y={g.ground - 50 * g.s} h={(30 + i * 8) * g.s} seed={i * 3} />)}
          <Smoke x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 90 * g.s} s={g.s * 1.4} n={7} dark />
          {ruin && <RuinedPrang x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground} h={160 * g.s} s={g.s} />}
          <rect x={g.x - 60 * g.s} y={g.ground - 6 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#120e0c" />
          {!ruin && <File g={g} pan={pan} x0={0.1} dx={0.14} n={4} y={30} mode="stand" mix={K.chinese} flip={false} scale={0.8} layer={1.4} />}
          <Grass g={g} shift={pan * 1.6} color="#080606" />
        </g>
      );
    }}
  </V6>
);

// Dawn march through dry paddies: the column keeps walking east, birds lift off.
export const DawnMarchScene = (p: P) => (
  <V6 {...p} sky={["#4a5a8a", "#f0b878"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.42]} lightColor={["#ffb070", "#ffe8c0"]} far="#7a6a8a" mid="#6a6a50" ground="#a08a50" mist="#ffd8a0" />
        <Birds g={g} lt={lt} />
        <Tree x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} kind="palm" />
        <File g={g} pan={pan} x0={0.02} dx={0.09} n={8} y={12} mix={K.chinese} lt={lt} speed={0.6} scale={0.6} />
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// ---------------- chapter 3: the chase ----------------

// The rear guard turns and stands; the Burmese pursuit runs into the line.
export const TurnFightScene = ({ hits, ...p }: P & { hits: number[] }) => (
  <V6 {...p} sky={["#7a9ac0", "#f0d8a8"]} accent={GOLD} hits={hits} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#8a8a9a" mid="#6a7a50" ground="#9a8050" mist="#fff0d0" />
        <File g={g} pan={pan} x0={0.04} dx={0.1} n={4} y={14} mode="run" costume={K.burma} lt={Math.min(lt, 60)} speed={1.2} scale={0.6} layer={0.8} />
        <File g={g} pan={pan} x0={0.58} dx={0.1} n={4} y={14} mode="attack" flip mix={K.chinese} scale={0.64} layer={0.8} />
        <Banner x={g.x + g.W * 0.92 + pan * 0.8} y={g.ground + 10 * g.s} s={g.s} color={GOLD} />
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// Foragers with rice sacks look up: a dust cloud on the horizon — the Burmese column.
export const ForagersScene = (p: P) => (
  <V6 {...p} sky={["#8a7a9a", "#f0b878"]} accent={RED} warm={0.12}>
    {(g, pan, lt) => {
      const dust = interpolate(lt, [0, 80], [0.3, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.2, 0.35]} lightColor={["#ff9a50", "#ffe0b0"]} far="#7a6a7a" mid="#6a6a4a" ground="#9a8050" mist="#f8c890" />
          {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.6 + i * 0.06) + pan * 0.3} cy={g.ground - (40 + (i % 3) * 14) * g.s} r={(26 + i * 4) * g.s * dust} fill="#c8a878" opacity={0.6 * dust} />)}
          <File g={g} pan={pan} x0={0.62} dx={0.05} n={6} y={-40} costume={K.burma} flip lt={lt} speed={-0.4} scale={0.36} layer={0.3} />
          {[0.12, 0.3].map((f) => <Sack key={f} x={g.x + g.W * f + pan * 1.0} y={g.ground + 20 * g.s} s={g.s} />)}
          <File g={g} pan={pan} x0={0.2} dx={0.16} n={3} y={22} mode="stand" scale={0.7} weapon="none" layer={1.0} />
          <Grass g={g} shift={pan * 1.6} color="#7a6a2a" />
        </g>
      );
    }}
  </V6>
);

// Five riders gallop at the Burmese line, dust flying, foot soldiers running behind.
export const FiveRidersScene = ({ hits, ...p }: P & { hits: number[] }) => (
  <V6 {...p} sky={["#9a8a7a", "#f0c888"]} accent={GOLD} hits={hits} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} far="#8a7a7a" mid="#7a6a4a" ground="#a08050" mist="#ffd8a0" />
        <File g={g} pan={pan} x0={0.78} dx={0.06} n={4} y={-6} mode="stand" costume={K.burma} flip scale={0.5} layer={0.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Horse key={i} x={g.x + g.W * (0.08 + i * 0.1) + Math.min(lt, 140) * 1.0 * g.s + pan * 0.9} y={g.ground + (6 + (i % 2) * 14) * g.s} scale={g.sc * (i === 2 ? 0.62 : 0.56)} rider={i === 2 ? K.tak : K.siam} phase={i * 1.7} />
        ))}
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.05 + i * 0.08) + Math.min(lt, 140) * 0.8 * g.s + pan * 0.9} cy={g.ground + 10 * g.s} r={(18 + (i % 3) * 8) * g.s} fill="#c8a878" opacity={0.45} />)}
        <File g={g} pan={pan} x0={-0.1} dx={0.08} n={4} y={30} mode="run" lt={lt} speed={0.9} scale={0.72} layer={1.5} />
      </g>
    )}
  </V6>
);

// The Burmese scatter; villagers peer out from behind a bamboo thicket.
export const ScatterScene = (p: P) => (
  <V6 {...p} sky={["#7a9ac0", "#f0d8a8"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.25]} far="#8a8a9a" mid="#5a6a40" ground="#9a8050" mist="#fff0d0" />
        <File g={g} pan={pan} x0={0.4} dx={0.1} n={4} y={-10} mode="run" costume={K.burma} lt={lt} speed={1.5} scale={0.5} layer={0.5} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${g.x + g.W * (0.02 + i * 0.03) + pan * 1.2} ${g.y + g.H} Q${g.x + g.W * (0.04 + i * 0.03) + pan * 1.2} ${g.ground - 90 * g.s} ${g.x + g.W * (0.06 + i * 0.035) + Math.sin(lt * 0.04 + i) * 4 * g.s + pan * 1.2} ${g.ground - (150 + (i % 3) * 20) * g.s}`} stroke="#4a6a3a" strokeWidth={7 * g.s} fill="none" strokeLinecap="round" />)}
        <File g={g} pan={pan} x0={0.2} dx={0.09} n={3} y={26} mode="stand" costume={K.villager} weapon="none" scale={0.72} layer={1.2} />
        <Grass g={g} shift={pan * 1.6} color="#5a6a2a" />
      </g>
    )}
  </V6>
);

// Khun Chamnan's mahouts bring six elephants to the camp.
export const ElephantGiftScene = (p: P) => (
  <V6 {...p} sky={["#7aa0c8", "#f0dcb0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} far="#6a7a8a" mid="#4a6a40" ground="#8a7048" mist="#fff0d0" />
        <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        {[0, 1, 2].map((i) => <Elephant key={i} x={g.x + g.W * (0.05 + i * 0.2) + Math.min(lt, 150) * 0.5 * g.s + pan * (0.6 + i * 0.1)} y={g.ground + (4 + i * 6) * g.s} scale={g.sc * (0.5 + i * 0.04)} phase={i * 2} rider={i === 1 ? "#c9b48a" : null} />)}
        <File g={g} pan={pan} x0={0.78} dx={0.08} n={2} y={24} mode="stand" flip scale={0.7} weapon="spear" layer={1.2} />
        <Grass g={g} shift={pan * 1.6} color="#5a6a2a" />
      </g>
    )}
  </V6>
);

// Ban Dong's bamboo stockade bristling with spears; an envoy waits at the gate.
export const StockadeScene = (p: P) => (
  <V6 {...p} sky={["#8aa0b8", "#e8d0a0"]} accent={RED} warm={0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.25]} far="#7a8a8a" mid="#4a6040" ground="#7a6440" mist="#fff0d0" />
        <File g={g} pan={pan} x0={0.38} dx={0.07} n={7} y={-40} mode="stand" costume={K.villager} flip scale={0.5} layer={0.55} />
        <Palisade x={g.x + g.W * 0.32 + pan * 0.6} y={g.ground - 6 * g.s} w={g.W * 0.7} s={g.s * 1.1} color="#9a8a4a" />
        <Fighter x={g.x + g.W * 0.2 + pan * 0.9} y={g.ground + 20 * g.s} scale={g.sc * 0.7} mode="stand" costume={K.official} weapon="none" />
        <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
      </g>
    )}
  </V6>
);

// The column grows: elephants loaded with sacks, more men, more banners.
export const GrowingColumnScene = (p: P) => (
  <V6 {...p} sky={["#7aa0c8", "#f4dcb0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#7a8a9a" mid="#5a6a48" ground="#9a8050" mist="#fff0d0" />
        {[0, 1].map((i) => <Elephant key={i} x={g.x + g.W * (0.25 + i * 0.35) + lt * 0.5 * g.s + pan * 0.6} y={g.ground - 2 * g.s} scale={g.sc * 0.48} phase={i * 3} rider={null} />)}
        {[0.12, 0.5, 0.82].map((f, i) => <Banner key={f} x={g.x + g.W * f + lt * 0.6 * g.s + pan * 0.8} y={g.ground + 8 * g.s} s={g.s} color={i === 1 ? RED : GOLD} />)}
        <File g={g} pan={pan} x0={-0.02} dx={0.08} n={11} y={18} mix={K.villager} lt={lt} speed={0.6} scale={0.6} layer={0.9} />
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// ---------------- chapter 4: Pak Nam Jo Lo ----------------

// Wading across the river at Dan Kob Jae, an elephant carrying the baggage.
export const FordScene = (p: P) => (
  <V6 {...p} sky={["#7aa8c8", "#f0dcb0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#6a7a8a" mid="#4a6a40" ground="#6a5a38" mist="#fff0d0" />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#4a7a90" />
        <Elephant x={g.x + g.W * 0.62 + lt * 0.4 * g.s + pan * 0.6} y={g.ground + 10 * g.s} scale={g.sc * 0.5} phase={1} rider={null} />
        <File g={g} pan={pan} x0={0.06} dx={0.1} n={5} y={18} lt={lt} speed={0.5} scale={0.62} layer={0.8} />
        <rect x={g.x - 60 * g.s} y={g.ground + 6 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#3d6f8f" opacity={0.75} />
        <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.15} shift={pan * 1.6} color="#3a5a2a" n={18} h={50} />
      </g>
    )}
  </V6>
);

// Camp by the river at dusk; a sentry looks back down the road for the stragglers.
export const WaitCampScene = (p: P) => (
  <V6 {...p} sky={["#3a3a5a", "#e8905a"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.75, 0.4]} lightColor={["#ff9a50", "#ffe0b0"]} far="#5a4a6a" mid="#3a3a3a" ground="#3a3020" mist="#f0b080" />
        <Tent x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 6 * g.s} w={140 * g.s} s={g.s} glow={0.5} />
        <Tent x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 6 * g.s} w={110 * g.s} s={g.s} />
        <Fire x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 4 * g.s} h={36 * g.s} seed={2} />
        <File g={g} pan={pan} x0={0.44} dx={0.12} n={2} y={16} mode="stand" scale={0.6} weapon="none" layer={0.8} />
        <Fighter x={g.x + g.W * 0.85 + pan * 1.3} y={g.ground + 34 * g.s} scale={g.sc * 0.8} mode="stand" costume={K.siam} flip />
        <Grass g={g} shift={pan * 1.6} color="#1a1a12" />
      </g>
    )}
  </V6>
);

// Burmese war boats coming up the Bang Pakong, troops marching on the bank beside them.
export const BurmeseBoatsScene = (p: P) => (
  <V6 {...p} sky={["#6a7a9a", "#e8c090"]} accent={RED} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#7a7a8a" mid="#4a5a40" ground="#6a5a38" mist="#fff0d0" />
        <File g={g} pan={pan} x0={0.0} dx={0.08} n={8} y={-30} costume={K.burma} lt={lt} speed={0.5} scale={0.44} layer={0.5} />
        <River g={g} y={g.ground - 6 * g.s} pan={pan} color="#5a7a8a" />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.08 + i * 0.32) + lt * 0.7 * g.s + pan * 0.9} y={g.ground + (24 + (i % 2) * 14) * g.s} w={190 * g.s} s={g.s} n={5} costume={K.burma} />)}
        {[0, 1].map((i) => <Banner key={i} x={g.x + g.W * (0.2 + i * 0.32) + lt * 0.7 * g.s + pan * 0.9} y={g.ground + 10 * g.s} s={g.s * 0.8} color={RED} />)}
      </g>
    )}
  </V6>
);

// Behind the earth bank: muskets levelled, nobody fires yet; the enemy is still small in the distance.
// `volleys` = frames of the three volleys (flashes rise 3 frames, fade 14; the panel shakes softly).
export const TrenchScene = ({ volleys = [], close = 0, ...p }: P & { volleys?: number[]; close?: number }) => {
  const frame = useCurrentFrame();
  const fired = volleys.filter((v) => frame >= v).length;
  return (
    <V6 {...p} sky={["#7a8aa8", "#e8d0a0"]} accent={volleys.length ? RED : GOLD} hits={volleys} warm={0.08}>
      {(g, pan, lt) => {
        const near = interpolate(lt, [0, 160], [0, 1], clamp) * close;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#8a8a9a" mid="#6a7058" ground="#8a7048" mist="#fff0d0" />
            <File g={g} pan={pan} x0={0.55 - near * 0.1} dx={0.07} n={6} y={-20 + near * 10} mode={fired ? "run" : "walk"} costume={K.burma} flip scale={0.4 + near * 0.12} layer={0.5} />
            {volleys.map((v) => (frame >= v ? <Smoke key={v} x={g.x + g.W * 0.4 + pan * 1.0} y={g.ground + 10 * g.s} s={g.s * 1.3} n={6} /> : null))}
            <path d={`M${g.x - 60 * g.s} ${g.ground + 50 * g.s} Q${g.x + g.W * 0.5} ${g.ground + 6 * g.s} ${g.x + g.W + 60 * g.s} ${g.ground + 50 * g.s} L${g.x + g.W + 60 * g.s} ${g.y + g.H + 10} L${g.x - 60 * g.s} ${g.y + g.H + 10} Z`} fill="#6a5034" stroke={PAL.ink} strokeWidth={2 * g.s} transform={`translate(${pan * 1.4},0)`} />
            {[0, 1, 2, 3, 4].map((i) => {
              const fl = volleys.reduce((m, v, j) => Math.max(m, j % 2 === i % 2 || volleys.length === 1 ? flashOf(frame, v + (i % 2) * 2) : 0), 0);
              return <Fighter key={i} x={g.x + g.W * (0.06 + i * 0.18) + pan * 1.4} y={g.ground + 44 * g.s} scale={g.sc * 0.74} mode="aim" costume={i === 2 ? K.chinese : K.siam} weapon="rifle" flash={fl} phase={i} />;
            })}
          </g>
        );
      }}
    </V6>
  );
};

// Smoke drifts off; the Burmese are gone, a soldier plants the gold banner on the bank.
export const AfterSmokeScene = (p: P) => (
  <V6 {...p} sky={["#8a9ab0", "#f0d8a8"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.25]} far="#8a8a9a" mid="#6a7058" ground="#8a7048" mist="#fff0d0" />
        <g opacity={interpolate(lt, [0, 90], [0.8, 0.2], clamp)}>
          <Smoke x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground} s={g.s * 1.5} n={8} />
          <Smoke x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground} s={g.s * 1.5} n={8} />
        </g>
        <Banner x={g.x + g.W * 0.5 + pan * 1.0} y={g.ground + 20 * g.s} s={g.s * 1.3} color={GOLD} />
        <File g={g} pan={pan} x0={0.2} dx={0.14} n={5} y={30} mode="stand" mix={K.chinese} weapon="rifle" scale={0.72} layer={1.3} />
        <Grass g={g} shift={pan * 1.6} color="#5a4a2a" />
      </g>
    )}
  </V6>
);

// ---------------- chapter 5: to the sea ----------------

// Along the beach: sea on one side, palms on the other, the column walking south.
export const CoastMarchScene = ({ evening = false, ...p }: P & { evening?: boolean }) => (
  <V6 {...p} sky={evening ? ["#3a3a6a", "#f0a060"] : ["#6aa8d8", "#f4e0b0"]} accent={GOLD} warm={evening ? 0.14 : 0.08}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * (evening ? 0.2 : 0.8) + pan * 0.1} y={g.y + g.H * (evening ? 0.45 : 0.22)} s={g.s} color={evening ? "#ff9a50" : "#ffe0a0"} />
        <Cloud x={g.x + g.W * 0.5 + pan * 0.2} y={g.y + g.H * 0.2} s={g.s} />
        <Sea g={g} y={g.ground - 60 * g.s} pan={pan} near={false} color={evening ? "#4a5a7a" : "#3a8ab0"} deep={evening ? "#2a3048" : "#1f5a7a"} />
        <rect x={g.x - 60 * g.s} y={g.ground - 14 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#d8c08a" />
        {[0.1, 0.45, 0.85].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground - 6 * g.s} s={g.s} kind="palm" />)}
        <File g={g} pan={pan} x0={0.0} dx={0.09} n={9} y={20} mix={K.villager} lt={lt} speed={0.55} scale={0.6} layer={0.9} />
        <path d={`M${g.x - 60 * g.s} ${g.y + g.H + 4} Q${g.x + g.W * 0.4} ${g.ground + 40 * g.s} ${g.x + g.W + 60 * g.s} ${g.y + g.H + 4} Z`} fill="#c8ac74" transform={`translate(${pan * 1.6},0)`} />
      </g>
    )}
  </V6>
);

// Na Kluea: fishermen with poles on the beach lay them down as the army arrives.
export const FishersScene = (p: P) => (
  <V6 {...p} sky={["#7ab0d8", "#f4e0b0"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => {
      const down = interpolate(lt, [40, 80], [0, 1], clamp);
      return (
        <g>
          <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.y + g.H * 0.22} s={g.s} />
          <Sea g={g} y={g.ground - 50 * g.s} pan={pan} near={false} color="#3a8ab0" deep="#1f5a7a" />
          <rect x={g.x - 60 * g.s} y={g.ground - 10 * g.s} width={g.W + 120 * g.s} height={g.H} fill="#d8c08a" />
          <Boat x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground - 6 * g.s} w={150 * g.s} s={g.s} n={0} />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <Fighter x={g.x + g.W * (0.45 + i * 0.1) + pan * 0.9} y={g.ground + 18 * g.s} scale={g.sc * 0.64} mode="stand" costume={K.fisher} weapon="none" flip phase={i} />
              <line x1={g.x + g.W * (0.45 + i * 0.1) - 30 * g.s + pan * 0.9} y1={g.ground + (18 - 80 * (1 - down)) * g.s} x2={g.x + g.W * (0.45 + i * 0.1) + 30 * g.s + pan * 0.9} y2={g.ground + (18 - 10 * (1 - down)) * g.s} stroke="#5a3a1f" strokeWidth={4 * g.s} />
            </g>
          ))}
          <File g={g} pan={pan} x0={0.8} dx={0.08} n={3} y={22} mode="stand" costume={K.siam} scale={0.66} layer={1.0} flip />
          <Grass g={g} shift={pan * 1.6} color="#a89a5a" />
        </g>
      );
    }}
  </V6>
);

// Rayong: the governor's men bring a betel tray; soldiers rest under trees by the temple.
export const WelcomeScene = (p: P) => (
  <V6 {...p} sky={["#7aa8d0", "#f4e0b0"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#7a8a9a" mid="#5a6a48" ground="#8a7048" mist="#fff0d0" />
        <Hall x={g.x + g.W * 0.62 + pan * 0.4} y={g.ground - 30 * g.s} w={g.W * 0.4} s={g.s} />
        <Tree x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        <Parasol x={g.x + g.W * 0.36 + pan * 0.8} y={g.ground + 20 * g.s} s={g.s * 0.8} h={150} />
        <Fighter x={g.x + g.W * 0.4 + pan * 0.9} y={g.ground + 22 * g.s} scale={g.sc * 0.68} mode="stand" costume={K.official} weapon="none" />
        <rect x={g.x + g.W * 0.46 + pan * 0.9} y={g.ground - 56 * g.s} width={30 * g.s} height={10 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * g.s} />
        <Fighter x={g.x + g.W * 0.58 + pan * 0.9} y={g.ground + 22 * g.s} scale={g.sc * 0.7} mode="stand" costume={K.tak} weapon="none" flip />
        <File g={g} pan={pan} x0={0.72} dx={0.1} n={3} y={34} mode="stand" scale={0.66} weapon="spear" layer={1.3} />
        <Grass g={g} shift={pan * 1.6} color="#5a6a2a" />
      </g>
    )}
  </V6>
);

// A warning whispered by lamplight: two figures lean in, shadows on the wall.
export const WhisperScene = (p: P) => (
  <V6 {...p} sky={["#14121e", "#2a2430"]} accent={RED} warm={0.08}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1e1a20" />
        <ellipse cx={g.x + g.W * 0.5 + pan * 0.2} cy={g.ground - 90 * g.s} rx={g.W * 0.3} ry={80 * g.s} fill="#000" opacity={0.35} />
        <Lamp x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground - 4 * g.s} s={g.s * 1.1} />
        <Fighter x={g.x + g.W * 0.38 + pan * 0.8} y={g.ground + 12 * g.s} scale={g.sc * 0.8} mode="stand" costume={K.villager} weapon="none" />
        <Fighter x={g.x + g.W * 0.62 + pan * 0.8} y={g.ground + 12 * g.s} scale={g.sc * 0.8} mode="stand" costume={K.tak} weapon="none" flip />
        <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 16 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#120e10" />
      </g>
    )}
  </V6>
);

// Night fight at the bridge: torches, attackers pushed off the planks, splashes on the hit frames.
export const BridgeScene = ({ hits, ...p }: P & { hits: number[] }) => {
  return (
    <V6 {...p} sky={["#0b1026", "#2a2440"]} accent={RED} hits={hits} warm={0.06}>
      {(g, pan) => {
        const by = g.ground - 20 * g.s;
        return (
          <g>
            <Stars g={g} n={16} />
            <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1a1a" mist="#5a6a8a" ridges />
            <River g={g} y={g.ground - 8 * g.s} pan={pan} color="#1e3048" night />
            <rect x={g.x - 40 * g.s + pan * 0.9} y={by} width={g.W + 80 * g.s} height={12 * g.s} fill="#6a4a2a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 4 * g.s + pan * 0.9} y={by} width={8 * g.s} height={80 * g.s} fill="#4a3018" />)}
            <Torch x={g.x + g.W * 0.12 + pan * 0.9} y={by} s={g.s} seed={1} />
            <Torch x={g.x + g.W * 0.88 + pan * 0.9} y={by} s={g.s} seed={3} />
            <File g={g} pan={pan} x0={0.18} dx={0.1} n={3} y={-20} mode="attack" scale={0.6} layer={0.9} />
            <File g={g} pan={pan} x0={0.56} dx={0.1} n={3} y={-20} mode="attack" costume={K.rebel} flip scale={0.58} layer={0.9} />
            {hits.map((f, i) => <Splash key={f} x={g.x + g.W * (0.6 + i * 0.12) + pan * 0.9} y={g.ground + 30 * g.s} s={g.s} at={f} />)}
            <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.1} shift={pan * 1.6} color="#0e140e" n={20} h={50} />
          </g>
        );
      }}
    </V6>
  );
};

// Dawn: the gold banner over Rayong, the plotters' dust trail far off toward Klaeng.
export const BannerDawnScene = (p: P) => (
  <V6 {...p} sky={["#4a5a8a", "#f0b878"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.42]} lightColor={["#ffb070", "#ffe8c0"]} far="#6a6a8a" mid="#5a5a48" ground="#7a6040" mist="#ffd8a0" />
        <File g={g} pan={pan} x0={0.7} dx={0.04} n={3} y={-36} mode="run" costume={K.rebel} lt={lt} speed={0.6} scale={0.3} layer={0.3} />
        <Tree x={g.x + g.W * 0.12 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s} />
        <Banner x={g.x + g.W * 0.4 + pan * 0.9} y={g.ground + 20 * g.s} s={g.s * 1.4} color={GOLD} />
        <File g={g} pan={pan} x0={0.1} dx={0.12} n={3} y={30} mode="stand" scale={0.72} layer={1.2} />
        <Grass g={g} shift={pan * 1.6} color="#4a4a2a" />
      </g>
    )}
  </V6>
);

// ---------------- closing ----------------

// Proclamation: officers prostrate before a plain wooden pavilion, a figure seen from behind, candles.
export const ProclaimScene = (p: P) => (
  <V6 {...p} sky={["#1a1030", "#5a2a3a"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1a18" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 30 * g.s} w={g.W * 0.55} s={g.s} roof="#5a3a20" wall="#8a6a4a" glow={0.7} />
        <Candle x={g.x + g.W * 0.32 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 1.2} />
        <Candle x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 1.2} />
        <BackFigure x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 0.38} robe="#7a1f1a" crown={false} />
        <rect x={g.x - 40 * g.s} y={g.ground - 4 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a1a10" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.04 + i * 0.18) + pan * 1.5} y={g.ground + 28 * g.s} scale={g.sc * 0.68} mode="prostrate" jacket={i % 2 ? "#2b3a67" : "#4a3a5a"} phase={i} />)}
      </g>
    )}
  </V6>
);

// Chanthaburi ahead: the walled town at dawn across the plain, the army's banners coming over the rise.
export const ChanthaburiScene = (p: P) => (
  <V6 {...p} sky={["#3a4a7a", "#f0a868"]} accent={GOLD} warm={0.14}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.7, 0.42]} lightColor={["#ffa860", "#ffe8c0"]} far="#5a5a7a" mid="#4a5a40" ground="#5a4a30" mist="#ffd0a0" />
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} w={g.W * 0.45} h={40 * g.s} s={g.s * 0.8} gateAt={0.5} color="#a89a80" />
        {[0.1, 0.24, 0.38].map((f, i) => <Banner key={f} x={g.x + g.W * f + lt * 0.4 * g.s + pan * 1.0} y={g.ground + 24 * g.s} s={g.s * 1.1} color={GOLD} />)}
        <File g={g} pan={pan} x0={0.0} dx={0.08} n={6} y={34} mix={K.chinese} lt={lt} speed={0.4} scale={0.72} layer={1.3} />
      </g>
    )}
  </V6>
);
