import { interpolate, useCurrentFrame } from "remotion";
import { Banner, Fighter, Glow, Grass, PAL } from "../../../components/Scene";
import { clamp, GOLD, RED } from "../news/kit";
import { Moon } from "../news/Period";
import { Backdrop, Boat, Fire, Hall, Monk, Palisade, PalaceWall, River, Smoke, Tree } from "../ep04/v2";
import { Cannon, Cloud, Elephant, Junk, muzzle } from "../ep04/ch1_kit";
import { Reeds, Stars, Tent, Torch } from "../ep04/ch3_kit";
import { Lamp } from "../ep05/ch1_kit5";
import { Sea } from "../ep05/kit5";
import { K, V6 } from "../ep06/scenes";
import { flashOf } from "./beatsKit";

// Episode 7 illustration panels (house style v2, built on episode 6's V6 wrapper and costumes).
// Phraya Tak is never drawn with a face: small, from the side or behind.

type P = { id: string; anchor: [number, number]; start: number; end: number };

// Clay rice pot; `broken` (frame) shatters it into shards that fly and fall over 20 frames.
const Pot = ({ x, y, s, broken }: { x: number; y: number; s: number; broken?: number }) => {
  const frame = useCurrentFrame();
  const t = broken === undefined ? -1 : frame - broken;
  if (t < 0)
    return (
      <g transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={0} rx={22 * s} ry={6 * s} fill="#000" opacity={0.25} />
        <path d={`M${-20 * s} ${-4 * s} Q${-26 * s} ${-30 * s} ${-14 * s} ${-40 * s} L${14 * s} ${-40 * s} Q${26 * s} ${-30 * s} ${20 * s} ${-4 * s} Z`} fill="#8a4a2a" stroke={PAL.ink} strokeWidth={1.6 * s} />
        <ellipse cx={0} cy={-40 * s} rx={15 * s} ry={4 * s} fill="#5a2e1a" stroke={PAL.ink} strokeWidth={1.2 * s} />
        <ellipse cx={0} cy={-41 * s} rx={10 * s} ry={2.6 * s} fill="#efe6d0" />
      </g>
    );
  const k = Math.min(1, t / 20);
  return (
    <g transform={`translate(${x},${y})`}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = -Math.PI * (0.15 + (i / 6) * 0.7);
        const d = 34 * s * k;
        const up = Math.sin(k * Math.PI) * 26 * s;
        return <path key={i} d={`M0 0 l${8 * s} ${-4 * s} l${-2 * s} ${9 * s} Z`} fill="#8a4a2a" stroke={PAL.ink} strokeWidth={1 * s} transform={`translate(${Math.cos(a) * d},${-20 * s + Math.sin(a) * d * 0.4 - up + k * 20 * s}) rotate(${i * 50 + t * 12})`} />;
      })}
      {Array.from({ length: 9 }, (_, i) => <circle key={`r${i}`} cx={(i - 4) * 5 * s * (0.5 + k)} cy={-2 * s} r={1.6 * s} fill="#efe6d0" opacity={1 - k * 0.3} />)}
    </g>
  );
};

// Soldiers by the camp fire smash their rice pots one after another (each pot on its own hit frame).
export const PotsScene = ({ hits, ...p }: P & { hits: number[] }) => (
  <V6 {...p} sky={["#2a2440", "#c8703a"]} accent={RED} hits={hits} warm={0.14}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.45]} lightColor={["#ff8a40", "#ffd8a0"]} far="#4a3a5a" mid="#3a3030" ground="#3a2a1a" mist="#f0a070" />
        <Tent x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 8 * g.s} w={130 * g.s} s={g.s} glow={0.5} />
        <Fire x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 6 * g.s} h={44 * g.s} seed={1} />
        {hits.map((h, i) => <Pot key={h} x={g.x + g.W * (0.22 + i * 0.16) + pan * 0.9} y={g.ground + 26 * g.s} s={g.s * 1.1} broken={h} />)}
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.18 + i * 0.2) + pan * 1.0} y={g.ground + 24 * g.s} scale={g.sc * 0.74} mode={i % 2 ? "attack" : "stand"} costume={i === 2 ? K.chinese : K.siam} weapon={i % 2 ? "spear" : "none"} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#1a140c" />
      </g>
    )}
  </V6>
);

// Chanthaburi: a walled river port, junks at the quay, rice barns behind the wall.
export const PortCityScene = (p: P) => (
  <V6 {...p} sky={["#6aa0d0", "#f4dcb0"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#5a7a6a" mid="#4a6a40" ground="#7a6040" mist="#fff0d0" />
        <Hall x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 46 * g.s} w={g.W * 0.32} s={g.s * 0.8} />
        <PalaceWall x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 30 * g.s} w={g.W * 0.6} h={44 * g.s} s={g.s * 0.9} gateAt={0.5} color="#b8ad94" />
        <River g={g} y={g.ground - 20 * g.s} pan={pan} color="#3d6f8f" />
        <Junk x={g.x + g.W * 0.18 + pan * 0.8} y={g.ground + 14 * g.s} s={g.s * 0.42} cargo={0.6} />
        <Junk x={g.x + g.W * 0.72 + pan * 0.8} y={g.ground + 24 * g.s} s={g.s * 0.38} sail="#c9a060" cargo={0.4} />
        <Boat x={g.x + g.W * 0.45 + pan * 1.2} y={g.ground + 40 * g.s} w={140 * g.s} s={g.s} n={2} />
      </g>
    )}
  </V6>
);

// Klaeng rebels charge again and are thrown back; they run off toward Chanthaburi.
export const RebelRoutScene = ({ hits, ...p }: P & { hits: number[] }) => (
  <V6 {...p} sky={["#7a9ac0", "#f0d8a8"]} accent={GOLD} hits={hits} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#8a8a9a" mid="#5a6a40" ground="#8a7048" mist="#fff0d0" />
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.55 + i * 0.1) + Math.max(0, lt - 40) * 1.4 * g.s + pan * 0.8} y={g.ground + 14 * g.s} scale={g.sc * 0.6} mode={lt > 40 ? "run" : "attack"} costume={K.rebel} flip={lt <= 40} phase={i} />)}
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.06 + i * 0.11) + pan * 0.9} y={g.ground + 18 * g.s} scale={g.sc * 0.64} mode="attack" costume={i === 1 ? K.chinese : K.siam} phase={i} />)}
        <Banner x={g.x + g.W * 0.04 + pan * 0.9} y={g.ground + 14 * g.s} s={g.s} color={GOLD} />
        <Grass g={g} shift={pan * 1.6} color="#5a5a2a" />
      </g>
    )}
  </V6>
);

// Four monks walk up the road to the Rayong camp under parasol shade; guards watch.
export const MonksScene = (p: P) => (
  <V6 {...p} sky={["#8ab8d8", "#f4e0b0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#7a8a9a" mid="#5a6a48" ground="#9a8050" mist="#fff0d0" />
        <Tree x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s} kind="palm" />
        <Palisade x={g.x + g.W * 0.72 + pan * 0.6} y={g.ground - 4 * g.s} w={g.W * 0.3} s={g.s} />
        {[0, 1, 2, 3].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.1) + Math.min(lt, 150) * 0.8 * g.s + pan * 0.8} y={g.ground + 18 * g.s} scale={g.sc * 0.66} mode="walk" phase={i * 1.4} />)}
        <Fighter x={g.x + g.W * 0.78 + pan * 1.2} y={g.ground + 30 * g.s} scale={g.sc * 0.74} mode="stand" costume={K.siam} flip />
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// Two months of preparation: spear drill in the camp yard, an elephant being harnessed.
export const DrillScene = (p: P) => (
  <V6 {...p} sky={["#8ab0d0", "#f0dcb0"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.22]} far="#7a8a9a" mid="#5a6a48" ground="#9a8050" mist="#fff0d0" />
        <Tent x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 6 * g.s} w={150 * g.s} s={g.s} />
        <Elephant x={g.x + g.W * 0.12 + pan * 0.6} y={g.ground + 6 * g.s} scale={g.sc * 0.48} walk={false} rider={null} />
        {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.36 + i * 0.1) + pan * 0.9} y={g.ground + 22 * g.s} scale={g.sc * 0.62} mode="attack" costume={i === 3 ? K.chinese : K.siam} phase={0.2} />)}
        <Banner x={g.x + g.W * 0.92 + pan * 1.0} y={g.ground + 20 * g.s} s={g.s} color={GOLD} />
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// The column on the forest road toward Chanthaburi, elephants in the line.
export const ForestMarchScene = (p: P) => (
  <V6 {...p} sky={["#6a90b0", "#e8d0a0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} far="#4a6a5a" mid="#3a5a3a" ground="#6a5a38" mist="#e0e8d0" />
        {[0.05, 0.3, 0.62, 0.9].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 8 * g.s} s={g.s * 1.1} />)}
        <Elephant x={g.x + g.W * 0.3 + lt * 0.45 * g.s + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.48} rider="#7a1f1a" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Fighter key={i} x={g.x + g.W * (-0.05 + i * 0.12) + lt * 0.5 * g.s + pan * 0.9} y={g.ground + 22 * g.s} scale={g.sc * 0.6} mode="walk" costume={i % 3 === 1 ? K.chinese : K.siam} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#2a3a1a" />
      </g>
    )}
  </V6>
);

// The guides point across the river; spear tips glint in the reeds on the far bank.
export const AmbushRiverScene = (p: P) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#7a9ab0", "#e8d0a0"]} accent={RED} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.25]} far="#6a7a7a" mid="#3a5a3a" ground="#5a5030" mist="#e8e0c0" />
          <Reeds g={g} y={g.ground - 20 * g.s} wind={0.2} shift={pan * 0.5} color="#4a5a2a" n={30} h={70} />
          {[0.5, 0.62, 0.74, 0.86].map((f, i) => {
            const glint = 0.5 + 0.5 * Math.sin(frame * 0.07 + i * 1.7);
            return <g key={f}><line x1={g.x + g.W * f + pan * 0.5} y1={g.ground - 30 * g.s} x2={g.x + g.W * f + pan * 0.5} y2={g.ground - 100 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} /><circle cx={g.x + g.W * f + pan * 0.5} cy={g.ground - 102 * g.s} r={4 * g.s} fill="#fff8d0" opacity={glint} /></g>;
          })}
          <River g={g} y={g.ground - 10 * g.s} pan={pan} color="#4a7a90" />
          <Fighter x={g.x + g.W * 0.2 + pan * 1.2} y={g.y + g.H - 10 * g.s} scale={g.sc * 0.8} mode="stand" costume={K.villager} weapon="none" />
          <Fighter x={g.x + g.W * 0.08 + pan * 1.3} y={g.y + g.H - 6 * g.s} scale={g.sc * 0.84} mode="stand" costume={K.tak} weapon="none" />
        </g>
      )}
    </V6>
  );
};

// Camp at Wat Kaew: the temple hall, a stockade going up, tents, the gold banner.
export const WatKaewScene = (p: P) => (
  <V6 {...p} sky={["#4a5a8a", "#f0b070"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.45]} lightColor={["#ff9a50", "#ffe0b0"]} far="#5a5a7a" mid="#4a5040" ground="#6a5236" mist="#f8c890" />
        <Hall x={g.x + g.W * 0.36 + pan * 0.4} y={g.ground - 30 * g.s} w={g.W * 0.36} s={g.s} />
        <Tent x={g.x + g.W * 0.68 + pan * 0.5} y={g.ground - 6 * g.s} w={120 * g.s} s={g.s} glow={0.4} />
        <Palisade x={g.x - 20 * g.s + pan * 0.9} y={g.ground + 20 * g.s} w={g.W * 0.5} s={g.s} />
        <Banner x={g.x + g.W * 0.6 + pan * 0.9} y={g.ground + 22 * g.s} s={g.s * 1.2} color={GOLD} />
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.72 + i * 0.12) + pan * 1.1} y={g.ground + 30 * g.s} scale={g.sc * 0.7} mode="walk" costume={K.siam} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#3a3a1a" />
      </g>
    )}
  </V6>
);

// Standoff: the city wall lined with defenders on one side, the camp's banners on the other, dusk.
export const StandoffScene = (p: P) => (
  <V6 {...p} sky={["#3a3a5a", "#d8804a"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.ground - 60 * g.s} s={g.s} color="#ff8a40" core="#ffd8a0" />
        <Backdrop g={g} pan={pan} light={null} far="#4a3a4a" mid="#3a3030" ground="#3a2a1a" mist="#f0a070" />
        <PalaceWall x={g.x + g.W * 0.52 + pan * 0.5} y={g.ground - 2 * g.s} w={g.W * 0.5} h={60 * g.s} s={g.s} color="#a89a80" />
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.58 + i * 0.1) + pan * 0.5} y={g.ground - 64 * g.s} scale={g.sc * 0.44} mode="aim" costume={K.official} weapon="rifle" flip phase={i} />)}
        {[0.08, 0.22, 0.36].map((f, i) => <Banner key={f} x={g.x + g.W * f + pan * 0.9} y={g.ground + 24 * g.s} s={g.s} color={GOLD} />)}
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.13) + pan * 1.1} y={g.ground + 30 * g.s} scale={g.sc * 0.7} mode="stand" costume={i === 1 ? K.chinese : K.siam} phase={i} />)}
      </g>
    )}
  </V6>
);

// The last meal: soldiers sit around the fires eating the rice that is left, pots in a row.
export const LastMealScene = (p: P) => (
  <V6 {...p} sky={["#1e1a34", "#7a3a3a"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Stars g={g} n={14} />
        <Backdrop g={g} pan={pan} light={null} far="#2a2438" mid="#221c24" ground="#2a2018" mist="#a06050" />
        <Fire x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground + 10 * g.s} h={40 * g.s} seed={2} />
        <Fire x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground + 10 * g.s} h={36 * g.s} seed={5} />
        {[0, 1, 2].map((i) => <Pot key={i} x={g.x + g.W * (0.42 + i * 0.07) + pan * 0.8} y={g.ground + 18 * g.s} s={g.s} />)}
        {[0.14, 0.22, 0.58, 0.86].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 1.0} y={g.ground + 30 * g.s} scale={g.sc * 0.7} mode="stand" costume={i === 2 ? K.chinese : K.siam} weapon="none" flip={f > 0.5} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#120e0a" />
      </g>
    )}
  </V6>
);

// Night assault: ladders and spears at the wall, muskets flashing from the parapet (soft flashes, no strobe).
export const AssaultScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#0b1026", "#3a2030"]} accent={RED} hits={shots} warm={0.06}>
      {(g, pan) => (
        <g>
          <Stars g={g} n={14} />
          <Moon x={g.x + g.W * 0.85} y={g.y + g.H * 0.2} r={14 * g.s} />
          <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1814" mist="#5a6a8a" />
          <PalaceWall x={g.x + g.W * 0.35 + pan * 0.6} y={g.ground + 4 * g.s} w={g.W * 0.7} h={80 * g.s} s={g.s} color="#8a8070" />
          {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.45 + i * 0.13) + pan * 0.6} y={g.ground - 82 * g.s} scale={g.sc * 0.46} mode="aim" costume={K.official} weapon="rifle" flip flash={Math.max(...shots.map((f, j) => (j % 4 === i ? flashOf(frame, f) : 0)))} phase={i} />)}
          <Torch x={g.x + g.W * 0.3 + pan * 0.9} y={g.ground + 30 * g.s} s={g.s} seed={1} />
          {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.09) + pan * 1.1} y={g.ground + 34 * g.s} scale={g.sc * 0.66} mode="run" costume={i === 2 ? K.chinese : K.siam} phase={i} />)}
          <Grass g={g} shift={pan * 1.6} color="#0a0806" />
        </g>
      )}
    </V6>
  );
};

// The elephant with Phraya Tak on its back charges the gate; at `hit` the gate gives way, splinters fly.
export const GateChargeScene = ({ hit, ...p }: P & { hit: number }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#0b1026", "#4a2030"]} accent={GOLD} hits={[hit]} warm={0.08}>
      {(g, pan, lt) => {
        const gx = g.x + g.W * 0.72 + pan * 0.6;
        const run = interpolate(frame, [p.start, hit], [0, 1], clamp);
        const open = interpolate(frame, [hit, hit + 10], [0, 1], clamp);
        const after = Math.max(0, frame - hit);
        return (
          <g>
            <Stars g={g} n={12} />
            <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1814" mist="#6a5a7a" />
            <Torch x={gx - 80 * g.s} y={g.ground} s={g.s} seed={2} />
            <Torch x={gx + 80 * g.s} y={g.ground} s={g.s} seed={4} />
            <PalaceWall x={g.x + g.W * 0.45 + pan * 0.6} y={g.ground + 6 * g.s} w={g.W * 0.6} h={90 * g.s} s={g.s} gateAt={(gx - (g.x + g.W * 0.45 + pan * 0.6)) / (g.W * 0.6)} gateOpen={open} color="#8a8070" />
            {after > 0 && after < 30 && Array.from({ length: 8 }, (_, i) => <rect key={i} x={gx + Math.cos(i) * after * 3 * g.s} y={g.ground - 40 * g.s - Math.sin(i * 1.3) * after * 2 * g.s + after * after * 0.08 * g.s} width={10 * g.s} height={4 * g.s} fill="#7a4a22" transform={`rotate(${i * 40 + after * 10},${gx},${g.ground - 40 * g.s})`} opacity={1 - after / 30} />)}
            <Elephant x={g.x + g.W * (0.08 + run * 0.42) + Math.min(after, 30) * 1.5 * g.s + pan * 0.9} y={g.ground + 16 * g.s} scale={g.sc * 0.6} rider="#7a1f1a" phase={lt * 0.1} />
            {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.0 + i * 0.08) + run * g.W * 0.3 + pan * 1.2} y={g.ground + 36 * g.s} scale={g.sc * 0.66} mode="run" costume={K.siam} phase={i} />)}
          </g>
        );
      }}
    </V6>
  );
};

// Dawn over the taken town: gold banners on the gatehouse, smoke thinning.
export const DawnTakenScene = (p: P) => (
  <V6 {...p} sky={["#4a5a8a", "#f0b878"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.8, 0.45]} lightColor={["#ffb070", "#ffe8c0"]} far="#6a6a8a" mid="#5a5a48" ground="#6a5038" mist="#ffd8a0" />
        <Smoke x={g.x + g.W * 0.3 + pan * 0.4} y={g.ground - 40 * g.s} s={g.s} n={5} />
        <PalaceWall x={g.x + g.W * 0.15 + pan * 0.6} y={g.ground + 4 * g.s} w={g.W * 0.7} h={70 * g.s} s={g.s} gateAt={0.5} gateOpen={1} color="#a89a80" />
        {[0.25, 0.5, 0.75].map((f) => <Banner key={f} x={g.x + g.W * (0.15 + 0.7 * f) + pan * 0.6} y={g.ground - 66 * g.s} s={g.s} color={GOLD} />)}
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.35) + pan * 1.2} y={g.ground + 34 * g.s} scale={g.sc * 0.72} mode="stand" costume={i === 1 ? K.chinese : K.siam} phase={i} />)}
      </g>
    )}
  </V6>
);

// A boat slips out of the river mouth at night with the governor's household, heading south.
export const FleeBoatScene = (p: P) => (
  <V6 {...p} sky={["#0b1230", "#2a3050"]} accent={RED} warm={0.04}>
    {(g, pan, lt) => (
      <g>
        <Stars g={g} n={22} />
        <Moon x={g.x + g.W * 0.25} y={g.y + g.H * 0.22} r={18 * g.s} />
        <Sea g={g} y={g.ground - 40 * g.s} pan={pan} near color="#1e3048" deep="#0e1828" />
        <Junk x={g.x + g.W * (0.3 + lt * 0.0016) + pan * 0.7} y={g.ground + 4 * g.s} s={g.s * 0.5} sail="#5a4a3a" />
      </g>
    )}
  </V6>
);

// Trat river mouth: Chinese junks fire their guns, Siamese boats close in (soft flashes).
export const TratJunksScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#7aa0c8", "#f0d8a8"]} accent={RED} hits={shots} warm={0.08}>
      {(g, pan, lt) => (
        <g>
          <Cloud x={g.x + g.W * 0.4 + pan * 0.2} y={g.y + g.H * 0.2} s={g.s} />
          <Sea g={g} y={g.ground - 50 * g.s} pan={pan} near={false} color="#3a7aa0" deep="#1f4a6a" />
          <Junk x={g.x + g.W * 0.7 + pan * 0.6} y={g.ground - 6 * g.s} s={g.s * 0.5} />
          <Junk x={g.x + g.W * 0.9 + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.42} sail="#c9a060" />
          {shots.map((f, i) => {
            const k = flashOf(frame, f);
            const fx = g.x + g.W * (i % 2 ? 0.86 : 0.64) + pan * 0.6;
            return (
              <g key={f}>
                {k > 0 && <circle cx={fx} cy={g.ground - 30 * g.s} r={26 * g.s * k} fill="#ffd25a" opacity={0.7 * k} />}
                {frame >= f && frame < f + 90 && <Smoke x={fx} y={g.ground - 30 * g.s} s={g.s} n={4} />}
              </g>
            );
          })}
          {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.08 + i * 0.16) + Math.min(lt, 160) * 0.4 * g.s + pan * 1.0} y={g.ground + (26 + (i % 2) * 18) * g.s} w={170 * g.s} s={g.s} n={5} />)}
        </g>
      )}
    </V6>
  );
};

// Shipyard at Ban Samet Ngam: ribs of new hulls on the slips, carpenters, lamps burning into the night.
export const ShipyardScene = ({ night = false, ...p }: P & { night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={night ? ["#141830", "#3a2a40"] : ["#7aa8d0", "#f4dcb0"]} accent={GOLD} warm={night ? 0.12 : 0.08}>
      {(g, pan) => (
        <g>
          {night && <Stars g={g} n={14} />}
          <Backdrop g={g} pan={pan} light={night ? null : [0.85, 0.22]} far={night ? "#1c2238" : "#6a8a8a"} mid={night ? "#161a26" : "#4a6a48"} ground={night ? "#2a2018" : "#8a7048"} mist={night ? "#6a6a8a" : "#fff0d0"} />
          {[0.25, 0.65].map((f, h) => (
            <g key={f} transform={`translate(${g.x + g.W * f + pan * 0.7},${g.ground + 6 * g.s})`}>
              <path d={`M${-110 * g.s} ${-30 * g.s} Q0 ${20 * g.s} ${110 * g.s} ${-30 * g.s}`} stroke="#6b3a1a" strokeWidth={8 * g.s} fill="none" />
              {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${(-90 + i * 22) * g.s} ${(-10 + Math.abs(i - 4) * -4) * g.s} q${4 * g.s} ${-40 * g.s} ${0} ${-70 * g.s}`} stroke="#8a5a32" strokeWidth={5 * g.s} fill="none" opacity={h === 0 || i < 6 ? 1 : 0.4} />)}
            </g>
          ))}
          {night && <Lamp x={g.x + g.W * 0.45 + pan * 0.8} y={g.ground + 4 * g.s} s={g.s} />}
          {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.22) + pan * 1.1} y={g.ground + 30 * g.s} scale={g.sc * 0.66} mode="attack" costume={i % 2 ? K.chinese : K.villager} weapon="none" phase={i * 0.8 + Math.floor(frame / 999)} />)}
          <Grass g={g} shift={pan * 1.6} color={night ? "#120e0a" : "#5a5a2a"} />
        </g>
      )}
    </V6>
  );
};

// The fleet sails at sunrise: war boats and junks with gold banners heading west along the coast.
export const FleetScene = ({ dusk = false, ...p }: P & { dusk?: boolean }) => (
  <V6 {...p} sky={dusk ? ["#3a3a6a", "#f09060"] : ["#4a6a9a", "#f4c890"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * (dusk ? 0.2 : 0.85) + pan * 0.1} y={g.ground - 70 * g.s} s={g.s * 1.2} color="#ffa860" core="#ffe8c0" />
        <Sea g={g} y={g.ground - 50 * g.s} pan={pan} near color={dusk ? "#4a5a7a" : "#3a6a90"} deep={dusk ? "#2a3048" : "#1f4060"} />
        <Junk x={g.x + g.W * 0.75 - lt * 0.3 * g.s + pan * 0.5} y={g.ground - 20 * g.s} s={g.s * 0.36} sail="#c9a060" />
        {[0, 1, 2, 3].map((i) => <Boat key={i} x={g.x + g.W * (0.15 + i * 0.22) - lt * 0.5 * g.s + pan * 0.9} y={g.ground + (10 + (i % 2) * 22) * g.s} w={180 * g.s} s={g.s} n={5} dir={-1} />)}
        {[0, 1].map((i) => <Banner key={i} x={g.x + g.W * (0.2 + i * 0.44) - lt * 0.5 * g.s + pan * 0.9} y={g.ground + (-6 + i * 22) * g.s} s={g.s * 0.8} color={GOLD} />)}
      </g>
    )}
  </V6>
);

// A bronze gun on the parapet (used for the bullet that "grazes" Phraya Tak: muzzle flash toward the left).
export const WallGunScene = ({ fire, ...p }: P & { fire: number }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#0b1026", "#3a2030"]} accent={RED} hits={[fire]} warm={0.06}>
      {(g, pan) => {
        const cx = g.x + g.W * 0.7 + pan * 1.0;
        const cy = g.y + g.H - 66 * g.s;
        const fl = flashOf(frame, fire);
        const [mx, my] = muzzle(cx, cy, -g.s);
        return (
          <g>
            <Stars g={g} n={10} />
            <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1814" mist="#5a6a8a" />
            <Elephant x={g.x + g.W * 0.18 + pan * 0.5} y={g.ground - 10 * g.s} scale={g.sc * 0.36} rider="#7a1f1a" walk={false} />
            <PalaceWall x={g.x + g.W * 0.45 + pan * 1.0} y={g.y + g.H + 4 * g.s} w={g.W * 0.7} h={60 * g.s} s={g.s * 1.2} color="#8a8070" />
            <g transform={`translate(${cx},${cy}) scale(-1,1) translate(${-cx},${-cy})`}>
              <Cannon x={cx} y={cy} s={g.s} fire={[fire]} />
            </g>
            <circle cx={mx} cy={my} r={30 * g.s * fl} fill="#ffd25a" opacity={0.8 * fl} />
            {frame >= fire && <Smoke x={mx} y={my} s={g.s} n={4} dark />}
          </g>
        );
      }}
    </V6>
  );
};
