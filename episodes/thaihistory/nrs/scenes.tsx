import { interpolate, useCurrentFrame } from "remotion";
import { Shot } from "../../../components/Scene";
import { clamp, GOLD, RED } from "../news/kit";
import { Backdrop, Banner, Boat, Candle, Fighter, Fire, Grass, Hall, House, King, Manuscript, Monk, Noble, PAL, PalaceWall, Palisade, Prang, River, Smoke, Tree, V2 } from "../ep04/v2";
import { C, Campfire, Chedi, Dust, Elephant, Ewer, GoldStupa, Ladder, Lady, Letter, Parabaik, Pyatthat, RoyalGun, Tent, Volley } from "./kit";
import { PL } from "./places";

// Illustration panels for the Naresuan episodes (house style v2: depth layers, light, living figures, impact).
// Every scene takes { id, start, end } plus `at` (map anchor) and a few variant props, so one scene can serve
// two different story beats without looking the same (max two uses per episode).
type LL = [number, number];
export type Sc = { id: string; start: number; end: number; at?: LL };

const DAY: [string, string] = ["#6f8fb8", "#f2c98a"];
const DUSK: [string, string] = ["#3a2a5a", "#e0875a"];
const NIGHT: [string, string] = ["#0b1026", "#2a2a4a"];
const DAWN: [string, string] = ["#4a5a8a", "#f6b880"];

// ---------- Pegu, Burmese court ----------

// Hongsawadi skyline: the gold stupa, palace roofs, banners; burn = the city in flames (1599).
export const PeguScene = ({ id, start, end, at = PL.pegu, burn = 0, night = false }: Sc & { burn?: number; night?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={night || burn ? NIGHT : DAY} accent={burn ? RED : GOLD} warm={burn ? 0.12 : 0.06}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={night || burn ? [0.85, 0.2] : [0.82, 0.24]} lightColor={burn ? ["#ff8a2a", "#ffd25a"] : night ? ["#cfd8ff", "#f4f6ff"] : undefined} far={night || burn ? "#2a2440" : "#8a7a9a"} mid={night || burn ? "#2a2a30" : "#6a7a5a"} ground={night || burn ? "#2a2018" : PAL.earth} />
        <GoldStupa x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 40 * g.s} h={250 * g.s} s={g.s} glow={burn ? 0 : 1} />
        <Pyatthat x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 20 * g.s} w={200 * g.s} s={g.s} glow={night ? 0.6 : 0} />
        <Pyatthat x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 20 * g.s} w={170 * g.s} s={g.s} n={4} />
        <PalaceWall x={g.x - 20 * g.s + pan * 0.7} y={g.ground + 4 * g.s} w={g.W + 40 * g.s} h={34 * g.s} s={g.s} color="#c9a46a" />
        {[0.05, 0.3, 0.62, 0.9].map((f, i) => <Banner key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground - 30 * g.s} s={g.s * 0.8} color={i % 2 ? "#7a2a22" : PAL.chalk} />)}
        {burn > 0 && [0.16, 0.36, 0.74, 0.86].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 60 * g.s} h={(70 + i * 14) * g.s * burn} seed={i * 3} />)}
        {burn > 0 && <Smoke x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 140 * g.s} s={g.s} dark />}
        {!burn && [0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.2 + i * 0.25) + ((lt * 0.6) % 60) * g.s + pan * 1.1} y={g.ground + 30 * g.s} scale={g.sc * 0.5} mode="walk" costume={C.burma} phase={i} weapon={i === 1 ? "none" : "spear"} />)}
        <Grass g={g} shift={pan * 1.6} color={night || burn ? "#141a10" : "#2f3a24"} />
      </g>
    )}
  </V2>
);

// The Burmese king on his throne under a tiered roof; envoys of many lands kneel with tribute.
export const BurmeseThroneScene = ({ id, start, end, at = PL.pegu, envoys = ["siam", "lanna", "mon", "khmer"], angry = false }: Sc & { envoys?: string[]; angry?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={angry ? RED : GOLD} warm={0.12} hits={angry ? [start + 30] : []}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2418" />
          {[0.1, 0.3, 0.7, 0.9].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#8a3a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
          {[0.1, 0.3, 0.7, 0.9].map((f) => <rect key={`b${f}`} x={g.x + g.W * f - 16 * g.s + pan * 0.2} y={g.y + 30 * g.s} width={32 * g.s} height={10 * g.s} fill={PAL.gilt} />)}
          <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
          <g transform={`translate(${g.x + g.W * 0.8 + pan * 0.5},${g.ground - 14 * g.s})`}>
            <path d={`M${-80 * g.s} 0 L${-70 * g.s} ${-60 * g.s} L${70 * g.s} ${-60 * g.s} L${80 * g.s} 0 Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
            <path d={`M${-90 * g.s} ${-60 * g.s} L${-90 * g.s} ${-230 * g.s} Q0 ${-290 * g.s} ${90 * g.s} ${-230 * g.s} L${90 * g.s} ${-60 * g.s}`} fill="#7a2a18" stroke={PAL.ink} strokeWidth={2 * g.s} />
          </g>
          {angry ? (
            <Fighter x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 74 * g.s} scale={g.sc * 0.62} flip mode="attack" costume={C.burmaPrince} weapon="none" />
          ) : (
            <King x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 74 * g.s} scale={g.sc * 0.75} light={0.5} />
          )}
          {envoys.map((e, i) => <Noble key={e + i} x={g.x + g.W * (0.1 + i * 0.13) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.6} mode={angry ? "prostrate" : "kneel"} bow={0.5 + 0.3 * Math.sin(frame * 0.05 + i)} phase={i} jacket={C[e]?.jacket ?? "#efe6d0"} />)}
          {!angry && envoys.map((e, i) => <rect key={`t${i}`} x={g.x + g.W * (0.14 + i * 0.13) + pan * 0.7} y={g.ground - 18 * g.s} width={18 * g.s} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
        </g>
      )}
    </V2>
  );
};

// A white elephant led through a courtyard under a tiered umbrella; attendants and a palace behind.
export const WhiteElephantScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} />
        <Hall x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 20 * g.s} w={260 * g.s} s={g.s} />
        <Prang x={g.x + g.W * 0.2 + pan * 0.3} y={g.ground - 20 * g.s} h={180 * g.s} s={g.s} />
        <Elephant x={g.x + g.W * 0.38 + lt * 0.25 * g.s + pan * 0.7} y={g.ground + 10 * g.s} s={g.s * 0.5} walk={1} white rider="none" umbrella />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.08) + lt * 0.25 * g.s + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.5} mode="walk" costume={C.siamRed} weapon="none" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// ---------- armies, marches, battles ----------

// A column of soldiers and elephants marching across the panel. dir 1 = to the right.
export const MarchScene = ({ id, start, end, at = PL.ayut, side = "burma", dir = 1, light = "day", elephants = 2, banner }: Sc & { side?: string; dir?: 1 | -1; light?: "day" | "dusk" | "night" | "dawn"; elephants?: number; banner?: string }) => {
  const sky = light === "day" ? DAY : light === "dusk" ? DUSK : light === "night" ? NIGHT : DAWN;
  const cos = C[side] ?? C.siam;
  const burmese = side.startsWith("burma") || side === "mon";
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={sky} accent={burmese ? RED : GOLD}>
      {(g, pan, lt) => {
        const move = ((lt * 1.2 * dir) % (g.W * 0.5)) * g.s * 0.6;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={light === "night" ? [0.2, 0.2] : light === "dusk" ? [0.85, 0.5] : [0.8, 0.25]} lightColor={light === "night" ? ["#cfd8ff", "#f4f6ff"] : undefined} far={light === "night" ? "#1f2440" : "#7a6a8a"} mid={light === "night" ? "#22282a" : "#4f5a48"} ground={light === "night" ? "#1a1712" : PAL.earth} />
            <Dust x={g.x + g.W * (dir > 0 ? 0.25 : 0.75)} y={g.ground} s={g.s} k={0.6} />
            {Array.from({ length: elephants }, (_, i) => (
              <Elephant key={i} x={g.x + g.W * (0.25 + i * 0.4) + move + pan * 0.5} y={g.ground - 16 * g.s} s={g.s * 0.36} flip={dir < 0} walk={1} cloth={cos.jacket} trim={cos.sash} rider={i === 0 ? "king" : "rider"} phase={i * 1.7} riderCostume={cos} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.11) + move * 1.2 + pan * 0.7} y={g.ground + 14 * g.s + (i % 2) * 8 * g.s} scale={g.sc * 0.55} flip={dir < 0} mode="walk" costume={cos} phase={i * 0.8} />
            ))}
            {[0.15, 0.55, 0.85].map((f) => <Banner key={f} x={g.x + g.W * f + move * 1.2 + pan * 0.7} y={g.ground + 10 * g.s} s={g.s * 0.8} color={banner ?? (burmese ? PAL.chalk : RED)} />)}
            <Grass g={g} shift={pan * 1.6} color={light === "night" ? "#141a10" : "#2f3a24"} />
          </g>
        );
      }}
    </V2>
  );
};

// Two armies clash: infantry, elephants, arrows, dust; hits shake the panel.
export const BattleScene = ({ id, start, end, at = PL.ayut, left = "siam", right = "burma", hits = [], winner = "left", light = "day" }: Sc & { left?: string; right?: string; hits?: number[]; winner?: "left" | "right"; light?: "day" | "dusk" | "dawn" }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={light === "day" ? DAY : light === "dusk" ? DUSK : DAWN} accent={RED} hits={hits}>
      {(g, pan, lt) => {
        const push = interpolate(lt, [20, end - start], [0, 80], clamp) * g.s * (winner === "left" ? 1 : -1);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.88, 0.2]} />
            <Dust x={g.x + g.W * 0.5 + push} y={g.ground} s={g.s} k={0.45} n={9} />
            <Volley at={start + 10} x0={g.x + g.W * 0.15} x1={g.x + g.W * 0.75} y={g.ground - 60 * g.s} s={g.s} seed={3} />
            <Volley at={start + 16} x0={g.x + g.W * 0.85} x1={g.x + g.W * 0.25} y={g.ground - 60 * g.s} s={g.s} seed={8} />
            <Elephant x={g.x + g.W * 0.3 + push + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 0.38} walk={0.4} cloth={C[left].jacket} trim={C[left].sash} riderCostume={C[left]} swing={Math.max(0, Math.sin(frame * 0.2))} />
            <Elephant x={g.x + g.W * 0.72 + push + pan * 0.5} y={g.ground - 10 * g.s} s={g.s * 0.38} flip walk={0.4} cloth={C[right].jacket} trim={C[right].sash} riderCostume={C[right]} rider="rider" />
            {Array.from({ length: 6 }, (_, i) => <Fighter key={`l${i}`} x={g.x + g.W * (0.05 + i * 0.07) + push + pan * 0.8} y={g.ground + 18 * g.s + (i % 2) * 8 * g.s} scale={g.sc * 0.56} mode={i % 2 ? "attack" : "run"} costume={C[left]} phase={i} />)}
            {Array.from({ length: 6 }, (_, i) => <Fighter key={`r${i}`} x={g.x + g.W * (0.6 + i * 0.07) + push + pan * 0.8} y={g.ground + 18 * g.s + (i % 2) * 8 * g.s} scale={g.sc * 0.56} flip mode={i % 2 ? "attack" : "stand"} costume={C[right]} phase={i + 0.5} />)}
            {hits.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.5 + push} cy={g.ground - 40 * g.s} r={28 * g.s} fill="#fff2b0" opacity={0.8} /> : null))}
            <Grass g={g} shift={pan * 1.6} />
          </g>
        );
      }}
    </V2>
  );
};

// A walled city under attack: defenders on the wall, attackers with ladders, smoke and fire.
export const CitySiegeScene = ({ id, start, end, at = PL.ayut, attacker = "burma", burn = 0, night = false, hits = [] }: Sc & { attacker?: string; burn?: number; night?: boolean; hits?: number[] }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={night ? NIGHT : DUSK} accent={RED} hits={hits}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.3]} lightColor={["#ff8a2a", "#ffd25a"]} far="#3a2a3a" mid="#3a3428" ground="#3a2a1a" mist="#ff9a5a" />
        <Prang x={g.x + g.W * 0.7 + pan * 0.3} y={g.ground - 100 * g.s} h={150 * g.s} s={g.s} color="#cfc6b0" />
        <PalaceWall x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={120 * g.s} s={g.s} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.55 + i * 0.12) + pan * 0.5} y={g.ground - 124 * g.s} scale={g.sc * 0.45} flip mode={i % 2 ? "attack" : "stand"} costume={C.siam} phase={i} />)}
        <Ladder x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground + 4 * g.s} h={124 * g.s} s={g.s} lean={26} />
        <Fighter x={g.x + g.W * 0.43 + pan * 0.6} y={g.ground - 60 * g.s - Math.min(40, lt * 0.4) * g.s} scale={g.sc * 0.5} mode="walk" costume={C[attacker]} phase={1} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={`a${i}`} x={g.x + g.W * (0.04 + i * 0.07) + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.58} mode={i % 2 ? "run" : "attack"} costume={C[attacker]} phase={i * 1.3} />)}
        {burn > 0 && [0.6, 0.8].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 120 * g.s} h={60 * g.s * burn} seed={i * 2} />)}
        <Smoke x={g.x + g.W * 0.65 + pan * 0.5} y={g.ground - 150 * g.s} s={g.s} dark />
        <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
      </g>
    )}
  </V2>
);

// Night: the city burns; townspeople flee with bundles past the gate.
export const BurningCityScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#120b1e", "#6a2a1a"]} accent={RED} warm={0.14}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.6, 0.35]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1f2a" mid="#2a2420" ground="#2a2018" mist="#ff9a5a" />
        {[0.1, 0.45, 0.8].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 40 * g.s} h={(120 + i * 30) * g.s} s={g.s} color="#8a7a6a" />)}
        {[0.2, 0.4, 0.62, 0.86].map((f, i) => <House key={f} x={g.x + g.W * f - 40 * g.s + pan * 0.6} y={g.ground} w={80 * g.s} s={g.s} burn={1} />)}
        <Smoke x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 150 * g.s} s={g.s} dark n={8} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.9 - i * 0.12) - lt * 0.8 * g.s + pan * 1.1} y={g.ground + 26 * g.s} scale={g.sc * 0.5} flip mode="run" costume={i % 2 ? C.villagerW : C.villager} weapon="none" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#140f0c" />
      </g>
    )}
  </V2>
);

// A small Siamese force springs from the trees and hits a passing column (ambush).
export const AmbushScene = ({ id, start, end, at = PL.ayut, foe = "khmer", hits = [], night = false }: Sc & { foe?: string; hits?: number[]; night?: boolean }) => {
  const frame = useCurrentFrame();
  const spring = hits[0] ?? start + 30;
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={night ? NIGHT : DAWN} accent={GOLD} hits={hits}>
      {(g, pan, lt) => {
        const out = interpolate(frame, [spring - 6, spring + 14], [0, 1], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={night ? [0.85, 0.2] : [0.2, 0.3]} lightColor={night ? ["#cfd8ff", "#f4f6ff"] : undefined} far={night ? "#1f2440" : "#7a6a8a"} />
            {Array.from({ length: 4 }, (_, i) => <Fighter key={`f${i}`} x={g.x + g.W * (0.42 + i * 0.12) - lt * 0.5 * g.s + pan * 0.6} y={g.ground + 10 * g.s} scale={g.sc * 0.52} flip mode={out > 0.5 ? "stand" : "walk"} costume={C[foe]} phase={i} />)}
            {Array.from({ length: 4 }, (_, i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.05 + i * 0.09) + out * 120 * g.s + pan * 0.9} y={g.ground + 24 * g.s} scale={g.sc * 0.6} mode={out > 0 ? "attack" : "stand"} costume={i === 0 ? C.prince : C.siam} phase={i} />)}
            {[0.06, 0.2, 0.34].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 1.2} y={g.ground + 30 * g.s} s={g.s * 1.3} />)}
            <Grass g={g} shift={pan * 1.6} color="#1f2a18" />
          </g>
        );
      }}
    </V2>
  );
};

// Raiders on boats along a river, a village burning on the bank.
export const RiverRaidScene = ({ id, start, end, at = PL.ayut, raiders = "khmer" }: Sc & { raiders?: string }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DUSK} accent={RED}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.45]} />
        {[0.15, 0.32].map((f) => <House key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 40 * g.s} w={70 * g.s} s={g.s} burn={0.8} />)}
        <Tree x={g.x + g.W * 0.05 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="palm" />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.45 + i * 0.22) - lt * 0.6 * g.s + pan * 0.7} y={g.ground + (6 + i * 8) * g.s} w={150 * g.s} s={g.s} n={4} dir={-1} costume={C[raiders]} />)}
        <Smoke x={g.x + g.W * 0.22 + pan * 0.5} y={g.ground - 100 * g.s} s={g.s} dark />
      </g>
    )}
  </V2>
);

// The prince leads from the front: rides ahead of a small fast force, banner flying.
export const LeadChargeScene = ({ id, start, end, at = PL.plok, light = "dawn", cos = "prince" }: Sc & { light?: "dawn" | "day"; cos?: string }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={light === "dawn" ? DAWN : DAY} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.35]} />
        <Dust x={g.x + g.W * 0.2 + lt * 0.6 * g.s} y={g.ground} s={g.s} k={0.7} />
        <Elephant x={g.x + g.W * 0.55 + lt * 0.7 * g.s + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.44} walk={1.3} cloth={RED} trim={PAL.gilt} riderCostume={C[cos]} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.08) + lt * 0.9 * g.s + pan * 0.8} y={g.ground + 24 * g.s} scale={g.sc * 0.56} mode="run" costume={C.siam} phase={i} />)}
        <Banner x={g.x + g.W * 0.36 + lt * 0.9 * g.s + pan * 0.8} y={g.ground + 20 * g.s} s={g.s} color={RED} />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// ---------- people, court, ceremony ----------

// A boy is led away by Burmese escorts; his father watches from the gate.
export const HostageScene = ({ id, start, end, at = PL.plok, light = "dusk" }: Sc & { light?: "dusk" | "dawn" }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={light === "dusk" ? DUSK : DAWN} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.88, 0.5]} />
        <PalaceWall x={g.x - 20 * g.s + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.32} h={90 * g.s} s={g.s} gateAt={0.6} gateOpen={0.8} />
        <Fighter x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground + 4 * g.s} scale={g.sc * 0.6} mode="stand" costume={{ ...C.prince, jacket: "#3a5a3a" }} weapon="none" />
        <Fighter x={g.x + g.W * 0.45 + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.38} mode="walk" costume={C.child} weapon="none" />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.52 + i * 0.1) + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.55} mode="walk" costume={C.burma} phase={i} />)}
        <Elephant x={g.x + g.W * 0.86 + lt * 0.5 * g.s + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.34} walk={1} cloth={C.burma.jacket} rider="rider" riderCostume={C.burma} />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A lady of the court sits by a lamp in a palace room (the princess, as later told).
export const PrincessScene = ({ id, start, end, at = PL.pegu }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2014" />
        <rect x={g.x + g.W * 0.55 + pan * 0.2} y={g.y + 40 * g.s} width={g.W * 0.3} height={g.H * 0.55} fill="#0e1430" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <GoldStupa x={g.x + g.W * 0.7 + pan * 0.1} y={g.y + 40 * g.s + g.H * 0.55} h={150 * g.s} s={g.s} glow={0.5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={g.x + g.W * 0.55 + (i + 1) * g.W * 0.043 + pan * 0.2} y1={g.y + 40 * g.s} x2={g.x + g.W * 0.55 + (i + 1) * g.W * 0.043 + pan * 0.2} y2={g.y + 40 * g.s + g.H * 0.55} stroke="#5a2a18" strokeWidth={5 * g.s} />)}
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#2a1a10" />
        <Lady x={g.x + g.W * 0.36 + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 1.05} />
        <Candle x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s * 1.3} />
      </g>
    )}
  </V2>
);

// Youths drill with spears in a Burmese yard, the gold stupa behind; the Siamese prince among them.
export const TrainingScene = ({ id, start, end, at = PL.pegu }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} />
        <GoldStupa x={g.x + g.W * 0.78 + pan * 0.2} y={g.ground - 30 * g.s} h={200 * g.s} s={g.s} />
        <Pyatthat x={g.x + g.W * 0.05 + pan * 0.3} y={g.ground - 20 * g.s} w={180 * g.s} s={g.s} n={3} />
        {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.2 + i * 0.13) + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.5} mode="attack" costume={i === 1 ? C.prince : C.burma} phase={i * 1.4} />)}
        <Fighter x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C.burmaRed} weapon="none" />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A Siamese king kneels before a Burmese envoy holding a decree (vassal oath / surrender).
export const SubmitScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2a18" />
        <Hall x={g.x + g.W * 0.12 + pan * 0.2} y={g.ground - 14 * g.s} w={g.W * 0.76} s={g.s} wall="#5a3420" roof="#6a2a1a" />
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#2a1a10" />
        <Fighter x={g.x + g.W * 0.68 + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={C.burmaRed} weapon="none" />
        <g transform={`translate(${g.x + g.W * 0.62 + pan * 0.6},${g.ground - 70 * g.s})`}>
          <rect x={-22 * g.s} y={-14 * g.s} width={44 * g.s} height={28 * g.s} fill="#efe2c0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          <circle cx={0} cy={0} r={6 * g.s} fill="#a8322a" />
        </g>
        <Noble x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground - 6 * g.s} scale={g.sc * 0.66} mode="kneel" bow={0.7} jacket="#3a5a3a" />
        {[0, 1].map((i) => <Noble key={i} x={g.x + g.W * (0.14 + i * 0.1) + pan * 0.6} y={g.ground - 6 * g.s} scale={g.sc * 0.56} mode="prostrate" phase={i} />)}
      </g>
    )}
  </V2>
);

// The young viceroy arrives at Phitsanulok: Wat Mahathat's prang, people bowing along the road.
export const ArriveScene = ({ id, start, end, at = PL.plok }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAWN} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.3, 0.32]} />
        <Prang x={g.x + g.W * 0.72 + pan * 0.3} y={g.ground - 30 * g.s} h={230 * g.s} s={g.s} gold />
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.5} h={60 * g.s} s={g.s} gateAt={0.2} gateOpen={0.9} />
        <Elephant x={g.x + g.W * 0.25 + lt * 0.4 * g.s + pan * 0.6} y={g.ground + 8 * g.s} s={g.s * 0.42} walk={1} cloth={RED} riderCostume={C.prince} umbrella />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.52 + i * 0.1) + pan * 0.8} y={g.ground + 20 * g.s} scale={g.sc * 0.5} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A royal cremation pyre (meru) with smoke rising, mourners kneeling (Bayinnaung's death).
export const PyreScene = ({ id, start, end, at = PL.pegu, burn = 1 }: Sc & { burn?: number }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DUSK} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.5]} ridges={false} />
        <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.4},${g.ground - 10 * g.s})`}>
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${(-80 + i * 14) * g.s} ${-i * 34 * g.s} L${(80 - i * 14) * g.s} ${-i * 34 * g.s} L${(70 - i * 14) * g.s} ${(-i * 34 - 30) * g.s} L${(-70 + i * 14) * g.s} ${(-i * 34 - 30) * g.s} Z`} fill={i % 2 ? PAL.chalk : PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />)}
          <path d={`M${-10 * g.s} ${-170 * g.s} L0 ${-230 * g.s} L${10 * g.s} ${-170 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
        </g>
        {burn > 0 && <Fire x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} h={110 * g.s * burn} seed={2} />}
        <Smoke x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 200 * g.s} s={g.s} n={7} />
        {[0, 1, 2, 3, 4].map((i) => <Noble key={i} x={g.x + g.W * (0.06 + i * 0.08) + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.5} mode="prostrate" phase={i} jacket={C.burma.jacket} />)}
        {[0, 1, 2].map((i) => <Monk key={i} x={g.x + g.W * (0.76 + i * 0.08) + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.5} mode="sit" phase={i} />)}
      </g>
    )}
  </V2>
);

// Rebel banners go up on a city wall; a messenger gallops off with the news (Ava's revolt, vassals breaking away).
export const RevoltScene = ({ id, start, end, at = PL.ava }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DUSK} accent={RED}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.4]} />
        <Pyatthat x={g.x + g.W * 0.55 + pan * 0.3} y={g.ground - 60 * g.s} w={180 * g.s} s={g.s} n={4} />
        <PalaceWall x={g.x + g.W * 0.4 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={70 * g.s} s={g.s} color="#c9a46a" />
        {[0.5, 0.66, 0.82].map((f, i) => {
          const up = interpolate(lt, [10 + i * 12, 30 + i * 12], [0, 1], clamp);
          return <g key={f} transform={`translate(0,${(1 - up) * 40 * g.s})`} opacity={up}><Banner x={g.x + g.W * f + pan * 0.5} y={g.ground - 74 * g.s} s={g.s * 0.9} color="#2a3a6a" /></g>;
        })}
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.56 + i * 0.14) + pan * 0.5} y={g.ground - 76 * g.s} scale={g.sc * 0.42} flip mode="attack" costume={{ ...C.burma, jacket: "#2a3a6a" }} phase={i} />)}
        <Fighter x={g.x + g.W * 0.3 - lt * 1.2 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.55} flip mode="run" costume={C.burmaRed} weapon="none" />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A royal messenger beats a war drum and reads the levy order before kneeling nobles.
export const SummonScene = ({ id, start, end, at = PL.ayut, hits = [] }: Sc & { hits?: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={RED} hits={hits}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} />
          <Hall x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 20 * g.s} w={280 * g.s} s={g.s} />
          <g transform={`translate(${g.x + g.W * 0.18 + pan * 0.6},${g.ground})`}>
            <ellipse cx={0} cy={-40 * g.s} rx={34 * g.s} ry={40 * g.s} fill="#7a2a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <ellipse cx={0} cy={-80 * g.s} rx={34 * g.s} ry={8 * g.s} fill="#e9dcc0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          </g>
          <Fighter x={g.x + g.W * 0.26 + pan * 0.6} y={g.ground + 6 * g.s} scale={g.sc * 0.58} flip mode={hits.some((h) => frame >= h - 4 && frame < h + 6) ? "attack" : "stand"} costume={C.burmaRed} weapon="none" />
          <Fighter x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground + 6 * g.s} scale={g.sc * 0.6} mode="stand" costume={C.burma} weapon="none" />
          <g transform={`translate(${g.x + g.W * 0.44 + pan * 0.6},${g.ground - 72 * g.s})`}>
            <rect x={-26 * g.s} y={-10 * g.s} width={52 * g.s} height={20 * g.s} fill="#efe2c0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
          {[0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.58 + i * 0.12) + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.56} mode="kneel" bow={0.5} flip phase={i} />)}
          <Grass g={g} shift={pan * 1.6} />
        </g>
      )}
    </V2>
  );
};

// A camp at night: tents, campfires, sentries; the gold stupa far off on the horizon.
export const CampNightScene = ({ id, start, end, at = PL.pegu, side = "siam", stupa = true }: Sc & { side?: string; stupa?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={NIGHT} accent={GOLD} warm={0.05}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#22282a" ground="#1a1712" mist="#8a90b0" />
        {stupa && <GoldStupa x={g.x + g.W * 0.82 + pan * 0.1} y={g.ground - 70 * g.s} h={90 * g.s} s={g.s} glow={0.8} />}
        {[0.08, 0.26, 0.46, 0.64].map((f, i) => <Tent key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 4 * g.s} w={(110 - i * 8) * g.s} s={g.s} lit={0.8} stripe={side === "siam" ? RED : "#2a3a6a"} />)}
        {[0.17, 0.55].map((f, i) => <Campfire key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground + 14 * g.s} s={g.s} seed={i} />)}
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.36 + i * 0.36) + pan * 0.7} y={g.ground + 20 * g.s} scale={g.sc * 0.52} mode="stand" costume={C[side]} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#10160e" />
      </g>
    )}
  </V2>
);

// Two Mon nobles whisper in the dark at the edge of a camp; one points toward the prince's tent.
export const PlotScene = ({ id, start, end, at = PL.khraeng }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#05081a", "#1a1a34"]} accent={RED} warm={0.03}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.9, 0.18]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#151a30" mid="#1a1e22" ground="#12100c" mist="#6a7090" />
        <Tent x={g.x + g.W * 0.75 + pan * 0.4} y={g.ground - 6 * g.s} w={130 * g.s} s={g.s} lit={1} stripe={RED} />
        <Campfire x={g.x + g.W * 0.6 + pan * 0.5} y={g.ground + 4 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.12 + pan * 0.6} y={g.ground + 10 * g.s} s={g.s * 1.2} />
        <Fighter x={g.x + g.W * 0.24 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.6} mode="stand" costume={C.mon} weapon="none" />
        <Fighter x={g.x + g.W * 0.34 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.6} flip mode="aim" costume={{ ...C.mon, jacket: "#4a3a5a" }} weapon="spear" />
        <Grass g={g} shift={pan * 1.6} color="#0a0e08" />
      </g>
    )}
  </V2>
);

// A senior monk speaks to the prince by lamplight; two nobles kneel behind.
export const MonkCouncilScene = ({ id, start, end, at = PL.khraeng }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1a10" />
        <path d={`M${g.x} ${g.y + 20 * g.s} L${g.x + g.W / 2} ${g.y - 60 * g.s} L${g.x + g.W} ${g.y + 20 * g.s}`} fill="#4a2a18" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
        <Monk x={g.x + g.W * 0.25 + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 0.9} mode="sit" robe="#9a5a2a" />
        <Candle x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground - 10 * g.s} s={g.s * 1.3} />
        <Noble x={g.x + g.W * 0.56 + pan * 0.6} y={g.ground - 6 * g.s} scale={g.sc * 0.85} mode="sit" flip jacket={C.prince.jacket} />
        {[0, 1].map((i) => <Noble key={i} x={g.x + g.W * (0.74 + i * 0.12) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.58} mode="kneel" bow={0.6} flip phase={i} jacket={C.mon.jacket} />)}
      </g>
    )}
  </V2>
);

// The declaration: at dawn the prince pours water from a golden ewer onto the earth before his army.
// close = tight on the ewer and hands; otherwise the wide view with the army and banners.
export const DeclareScene = ({ id, start, end, at = PL.khraeng, close = false }: Sc & { close?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAWN} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => {
      const pour = interpolate(lt, [12, 50], [0, 1], clamp);
      return close ? (
        <g>
          <Backdrop g={g} pan={pan} light={[0.7, 0.4]} lightColor={["#ffd38a", "#fff1cc"]} ridges={false} />
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6b5236" />
          <path d={`M${g.x + g.W * 0.28} ${g.y + g.H * 0.62} Q${g.x + g.W * 0.36} ${g.y + g.H * 0.5} ${g.x + g.W * 0.44} ${g.y + g.H * 0.44}`} stroke={PAL.skin} strokeWidth={26 * g.s} fill="none" strokeLinecap="round" />
          <path d={`M${g.x + g.W * 0.18} ${g.y + g.H * 0.75} Q${g.x + g.W * 0.26} ${g.y + g.H * 0.62} ${g.x + g.W * 0.3} ${g.y + g.H * 0.6}`} stroke="#9a2a1e" strokeWidth={44 * g.s} fill="none" strokeLinecap="round" />
          <Ewer x={g.x + g.W * 0.5 + pan * 0.3} y={g.y + g.H * 0.42} s={g.s * 1.8} pour={pour} />
          <ellipse cx={g.x + g.W * 0.62} cy={g.ground - 10 * g.s} rx={70 * g.s * pour} ry={10 * g.s * pour} fill="#9fd0f0" opacity={0.6} />
        </g>
      ) : (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.4]} lightColor={["#ffd38a", "#fff1cc"]} />
          {[0.6, 0.72, 0.84, 0.96].map((f) => <Banner key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} color={RED} />)}
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.56 + i * 0.07) + pan * 0.6} y={g.ground + 6 * g.s} scale={g.sc * 0.5} flip mode="stand" costume={C.siam} phase={i} />)}
          <Monk x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.55} mode="stand" robe="#9a5a2a" />
          <Fighter x={g.x + g.W * 0.34 + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.68} mode="stand" costume={C.prince} weapon="none" />
          <Ewer x={g.x + g.W * 0.38 + pan * 0.7} y={g.ground - 66 * g.s} s={g.s * 0.8} pour={pour} />
          <Grass g={g} shift={pan * 1.6} />
        </g>
      );
    }}
  </V2>
);

// A Burmese scribe writes in a black parabaik by lamplight (Burmese records).
export const ScribeScene = ({ id, start, end, at = PL.pegu, book = "parabaik" }: Sc & { book?: "parabaik" | "khoi" | "letter" }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={g.x + g.W * 0.62 + pan * 0.2} y={g.y + (30 + i * 46) * g.s} width={g.W * 0.32} height={8 * g.s} fill="#5a3a20" />)}
        {Array.from({ length: 12 }, (_, i) => <rect key={`b${i}`} x={g.x + g.W * 0.63 + (i % 6) * 26 * g.s + pan * 0.2} y={g.y + (8 + Math.floor(i / 6) * 46) * g.s} width={20 * g.s} height={22 * g.s} fill={i % 3 ? "#16130f" : "#c9b48a"} />)}
        <rect x={g.x - 50 * g.s} y={g.ground - 40 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
        {book === "parabaik" && <Parabaik x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 44 * g.s} w={230 * g.s} s={g.s} />}
        {book === "khoi" && <Manuscript x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 44 * g.s} w={250 * g.s} s={g.s} dark={false} />}
        {book === "letter" && <Letter x={g.x + g.W * 0.32 + pan * 0.5} y={g.ground - 44 * g.s} w={150 * g.s} s={g.s} />}
        <Fighter x={g.x + g.W * 0.16 + pan * 0.6} y={g.ground - 30 * g.s} scale={g.sc * 0.62} mode="stand" costume={book === "letter" ? C.dutch : book === "khoi" ? C.siam : C.burma} weapon="none" />
        <Candle x={g.x + g.W * 0.56 + pan * 0.6} y={g.ground - 40 * g.s} s={g.s * 1.4} />
      </g>
    )}
  </V2>
);

// Families walk home with bundles and carts, escorted by soldiers.
export const FamiliesScene = ({ id, start, end, at = PL.sittaung, light = "dawn" }: Sc & { light?: "dawn" | "dusk" }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={light === "dawn" ? DAWN : DUSK} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.42]} />
        {Array.from({ length: 8 }, (_, i) => {
          const cos = i % 3 === 0 ? C.siam : i % 3 === 1 ? C.villagerW : C.villager;
          return <Fighter key={i} x={g.x + g.W * (0.05 + i * 0.11) + lt * 0.5 * g.s + pan * 0.7} y={g.ground + 14 * g.s + (i % 2) * 8 * g.s} scale={g.sc * (i % 4 === 3 ? 0.38 : 0.52)} mode="walk" costume={cos} weapon={i % 3 === 0 ? "spear" : "none"} phase={i * 0.7} />;
        })}
        {[0.3, 0.7].map((f) => (
          <g key={f} transform={`translate(${g.x + g.W * f + lt * 0.5 * g.s + pan * 0.7},${g.ground + 10 * g.s})`}>
            <rect x={-30 * g.s} y={-40 * g.s} width={60 * g.s} height={26 * g.s} fill="#8a5a32" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <circle cx={-18 * g.s} cy={-10 * g.s} r={12 * g.s} fill="none" stroke="#4a2f18" strokeWidth={4 * g.s} />
            <circle cx={18 * g.s} cy={-10 * g.s} r={12 * g.s} fill="none" stroke="#4a2f18" strokeWidth={4 * g.s} />
            <ellipse cx={0} cy={-46 * g.s} rx={24 * g.s} ry={10 * g.s} fill="#c9b48a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
          </g>
        ))}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// The Sittaung: the Siamese on the far bank; a Burmese general on an elephant reaches the near bank.
// shot = frame of the gunshot (the general falls), otherwise the chase.
export const RiverShotScene = ({ id, start, end, at = PL.sittaung, shot }: Sc & { shot?: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={DUSK} accent={RED} hits={shot ? [shot] : []}>
      {(g, pan, lt) => {
        const fall = shot ? interpolate(frame, [shot + 14, shot + 34], [0, 1], clamp) : 0;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.4]} />
            <rect x={g.x - 100 * g.s} y={g.ground - 64 * g.s} width={g.W + 200 * g.s} height={22 * g.s} fill="#5a6a3a" />
            {[0.06, 0.14, 0.22].map((f) => <Fighter key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 60 * g.s} scale={g.sc * 0.36} mode="stand" costume={C.siam} phase={f * 9} />)}
            <Fighter x={g.x + g.W * 0.3 + pan * 0.3} y={g.ground - 60 * g.s} scale={g.sc * 0.42} mode={shot ? "aim" : "stand"} costume={C.prince} weapon="rifle" flash={shot && frame >= shot && frame < shot + 5 ? 1 : 0} />
            <River g={g} y={g.ground - 44 * g.s} pan={pan} color="#6a7a6a" />
            {shot && <Shot from={[g.x + g.W * 0.33, g.ground - 90 * g.s]} to={[g.x + g.W * 0.72, g.ground - 150 * g.s]} t={frame - shot} s={g.s} flight={12} />}
            <Elephant x={g.x + g.W * 0.75 + (shot ? 0 : -lt * 0.3 * g.s) + pan * 0.7} y={g.ground + 30 * g.s} s={g.s * 0.46} flip walk={shot ? 0 : 1} trumpet={fall} cloth={C.burma.jacket} trim={PAL.chalk} riderCostume={C.burmaRed} rider={fall > 0.6 ? "none" : "king"} />
            {fall > 0.3 && <g transform={`translate(${g.x + g.W * 0.72 + pan * 0.7},${g.ground - 40 * g.s + fall * 60 * g.s}) rotate(${fall * 80})`}><Fighter x={0} y={0} scale={g.sc * 0.4} mode="stand" costume={C.burmaRed} weapon="none" /></g>}
            {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.86 + i * 0.06) + pan * 0.8} y={g.ground + 36 * g.s} scale={g.sc * 0.5} flip mode={fall > 0.5 ? "run" : "walk"} costume={C.burma} phase={i} />)}
          </g>
        );
      }}
    </V2>
  );
};

// The long royal gun displayed on a lacquered stand under a spotlight.
export const GunRelicScene = ({ id, start, end, at = PL.sittaung }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#120c08", "#2a1a10"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1a1008" />
        <path d={`M${g.x + g.W * 0.35} ${g.y} L${g.x + g.W * 0.2} ${g.ground} L${g.x + g.W * 0.8} ${g.ground} L${g.x + g.W * 0.65} ${g.y} Z`} fill="#ffe2a0" opacity={0.08} />
        <rect x={g.x + g.W * 0.15} y={g.ground - 20 * g.s} width={g.W * 0.7} height={30 * g.s} fill="#5a1a12" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <rect x={g.x + g.W * 0.15} y={g.ground - 24 * g.s} width={g.W * 0.7} height={6 * g.s} fill={PAL.gilt} />
        <RoyalGun x={g.x + g.W * 0.18 + pan * 0.4} y={g.ground - 24 * g.s} w={g.W * 0.64} s={g.s * 2.2} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={g.x + g.W * 0.18 + i * g.W * 0.08} y1={g.ground + 22 * g.s} x2={g.x + g.W * 0.18 + i * g.W * 0.08} y2={g.ground + 32 * g.s} stroke={PAL.gilt} strokeWidth={2 * g.s} />)}
      </g>
    )}
  </V2>
);

// Nobles drink oath water from bowls before a chedi (Sukhothai).
export const OathScene = ({ id, start, end, at = PL.sukhothai }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} />
        <Chedi x={g.x + g.W * 0.7 + pan * 0.3} y={g.ground - 20 * g.s} h={220 * g.s} s={g.s} />
        <Chedi x={g.x + g.W * 0.9 + pan * 0.3} y={g.ground - 20 * g.s} h={140 * g.s} s={g.s} />
        <ellipse cx={g.x + g.W * 0.3 + pan * 0.5} cy={g.ground - 6 * g.s} rx={120 * g.s} ry={14 * g.s} fill="#4a8ab0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.14 + i * 0.12) + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.56} mode="kneel" bow={0.3} phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        {[0, 1, 2, 3].map((i) => <ellipse key={`b${i}`} cx={g.x + g.W * (0.17 + i * 0.12) + pan * 0.7} cy={g.ground - 30 * g.s} rx={9 * g.s} ry={4 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1 * g.s} />)}
        <Fighter x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={C.prince} weapon="none" />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// People stream through a city gate with their goods; the island city's prangs behind (gathering at Ayutthaya).
export const GateScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} />
        {[0.55, 0.72, 0.88].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.2} y={g.ground - 70 * g.s} h={(150 + i * 30) * g.s} s={g.s} />)}
        <PalaceWall x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={90 * g.s} s={g.s} gateAt={0.15} gateOpen={1} />
        {Array.from({ length: 7 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.07) + ((lt * 0.8) % 80) * g.s + pan * 0.8} y={g.ground + 18 * g.s + (i % 2) * 6 * g.s} scale={g.sc * 0.5} mode="walk" costume={i % 2 ? C.villagerW : C.villager} weapon="none" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// Captured war elephants, horses and boats lined up after a victory.
export const LootScene = ({ id, start, end, at = PL.saket }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} />
        <River g={g} y={g.ground - 50 * g.s} pan={pan} />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.2 + i * 0.3) + pan * 0.3} y={g.ground - 40 * g.s} w={120 * g.s} s={g.s} n={0} />)}
        <rect x={g.x - 100 * g.s} y={g.ground - 30 * g.s} width={g.W + 200 * g.s} height={g.H} fill={PAL.earth} />
        {[0, 1, 2].map((i) => <Elephant key={i} x={g.x + g.W * (0.18 + i * 0.3) + pan * 0.6} y={g.ground + 10 * g.s} s={g.s * 0.34} cloth={C.lanna.jacket} trim={C.lanna.sash} rider="none" phase={i} />)}
        {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.34 + i * 0.3) + pan * 0.8} y={g.ground + 26 * g.s} scale={g.sc * 0.55} mode="stand" costume={C.siam} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A ring of enemy camps round the island city: palisades, tents, river, smoke.
export const SiegeCampScene = ({ id, start, end, at = PL.ayut, night = false, sick = false }: Sc & { night?: boolean; sick?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={night ? NIGHT : sick ? ["#5a5a5a", "#c9b48a"] : DAY} accent={RED} warm={sick ? 0.02 : 0.06}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={night ? [0.85, 0.18] : [0.8, 0.25]} lightColor={night ? ["#cfd8ff", "#f4f6ff"] : undefined} far={night ? "#1f2440" : "#8a8a8a"} mid={night ? "#22282a" : "#6a6a5a"} ground={night ? "#1a1712" : "#7a6242"} />
        {[0.62, 0.78, 0.92].map((f) => <Prang key={f} x={g.x + g.W * f + pan * 0.2} y={g.ground - 70 * g.s} h={120 * g.s} s={g.s} color="#c9c0a8" />)}
        <PalaceWall x={g.x + g.W * 0.56 + pan * 0.3} y={g.ground - 54 * g.s} w={g.W * 0.5} h={50 * g.s} s={g.s * 0.8} />
        <River g={g} y={g.ground - 54 * g.s} pan={pan} color={night ? "#16263a" : "#4a7a8a"} night={night} />
        <rect x={g.x - 100 * g.s} y={g.ground - 20 * g.s} width={g.W + 200 * g.s} height={g.H} fill={night ? "#1a1712" : "#7a6242"} />
        <Palisade x={g.x + g.W * 0.02 + pan * 0.6} y={g.ground + 4 * g.s} w={g.W * 0.5} s={g.s * 0.8} />
        {[0.08, 0.22, 0.38].map((f, i) => <Tent key={f} x={g.x + g.W * f + pan * 0.7} y={g.ground - 30 * g.s} w={90 * g.s} s={g.s} lit={night ? 1 : 0} stripe="#2a3a6a" />)}
        {sick && [0, 1, 2].map((i) => <Noble key={i} x={g.x + g.W * (0.12 + i * 0.14) + pan * 0.9} y={g.ground + 34 * g.s} scale={g.sc * 0.5} mode="prostrate" phase={i} jacket={C.burma.jacket} />)}
        {!sick && [0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.16 + i * 0.2) + pan * 0.9} y={g.ground + 34 * g.s} scale={g.sc * 0.55} mode="stand" costume={C.burma} phase={i} />)}
        {sick && [0, 1].map((i) => <path key={`v${i}`} d={`M${g.x + g.W * (0.3 + i * 0.2) + Math.sin(lt * 0.05 + i) * 30 * g.s} ${g.y + 50 * g.s} q${10 * g.s} ${-8 * g.s} ${20 * g.s} 0 q${10 * g.s} ${-8 * g.s} ${20 * g.s} 0`} stroke={PAL.ink} strokeWidth={2.5 * g.s} fill="none" />)}
        <Smoke x={g.x + g.W * 0.3 + pan * 0.6} y={g.ground - 60 * g.s} s={g.s} n={5} />
      </g>
    )}
  </V2>
);

// Ayutthaya as an island: three rivers round the walls, prangs and halls, boats on the water.
export const IslandScene = ({ id, start, end, at = PL.ayut, flood = 0 }: Sc & { flood?: number }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={flood ? ["#5a6a8a", "#a8b8c8"] : DAY} accent={GOLD}>
    {(g, pan, lt) => {
      const lvl = flood * interpolate(lt, [0, 60], [0.4, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} ridges={false} />
          {[0.2, 0.4, 0.6, 0.8].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 80 * g.s} h={(140 + (i % 2) * 50) * g.s} s={g.s} gold={i === 1} />)}
          <Hall x={g.x + g.W * 0.45 + pan * 0.4} y={g.ground - 74 * g.s} w={160 * g.s} s={g.s} />
          <PalaceWall x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 52 * g.s} w={g.W * 0.84} h={44 * g.s} s={g.s * 0.8} />
          <River g={g} y={g.ground - 52 * g.s + (flood ? -lvl * 20 * g.s : 0)} pan={pan} />
          {[0, 1].map((i) => <Boat key={i} x={g.x + g.W * (0.25 + i * 0.4) + lt * 0.4 * g.s + pan * 0.7} y={g.ground - 10 * g.s} w={130 * g.s} s={g.s} n={3} />)}
          {flood > 0 && [0.1, 0.3].map((f, i) => <g key={f} opacity={1 - lvl * 0.5}><Tent x={g.x + g.W * f + pan * 0.8} y={g.ground + 30 * g.s} w={80 * g.s} s={g.s} stripe="#2a3a6a" /></g>)}
          {flood > 0 && <rect x={g.x - 100 * g.s} y={g.ground + 30 * g.s - lvl * 50 * g.s} width={g.W + 200 * g.s} height={g.H} fill="#4a7a9a" opacity={0.75} />}
        </g>
      );
    }}
  </V2>
);

// Night raid: the prince climbs a camp palisade, a sword in his mouth; spears thrust down from the top.
// fall = frame where he is thrust off (drops, then climbs again).
export const SwordClimbScene = ({ id, start, end, at = PL.pakkhu, falls = [] }: Sc & { falls?: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={NIGHT} accent={GOLD} hits={falls} warm={0.06}>
      {(g, pan, lt) => {
        const last = falls.filter((f) => frame >= f).pop();
        const since = last === undefined ? lt : frame - last;
        const climb = last !== undefined && since < 18 ? Math.max(0, 1 - since / 8) * 0.8 : Math.min(1, since / 70);
        const px = g.x + g.W * 0.48 + pan * 0.6;
        const py = g.ground - climb * 120 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.16]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#22282a" ground="#1a1712" mist="#8a90b0" />
            <Campfire x={g.x + g.W * 0.82 + pan * 0.4} y={g.ground - 150 * g.s} s={g.s} />
            <g transform={`translate(0,${-70 * g.s})`}>
              <Palisade x={g.x + g.W * 0.42 + pan * 0.5} y={g.ground + 70 * g.s} w={g.W * 0.6} s={g.s * 2.4} />
            </g>
            {[0, 1].map((i) => {
              const thrust = falls.some((f) => frame >= f - 8 && frame < f + 4) ? 1 : 0;
              return <Fighter key={i} x={g.x + g.W * (0.6 + i * 0.12) + pan * 0.5} y={g.ground - 140 * g.s} scale={g.sc * 0.46} flip mode={thrust ? "attack" : "stand"} costume={C.burma} phase={i} />;
            })}
            <g transform={`translate(${px},${py})`}>
              <Fighter x={0} y={0} scale={g.sc * 0.6} mode="walk" costume={C.prince} weapon="none" phase={1.3} />
              <line x1={-26 * g.s} y1={-90 * g.s * 1} x2={30 * g.s} y2={-92 * g.s} stroke="#d7dbde" strokeWidth={3.5 * g.s} strokeLinecap="round" />
            </g>
            {[0, 1, 2].map((i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.08 + i * 0.1) + pan * 0.9} y={g.ground + 30 * g.s} scale={g.sc * 0.56} mode="stand" costume={C.siam} phase={i} />)}
            <Grass g={g} shift={pan * 1.6} color="#0e140c" />
          </g>
        );
      }}
    </V2>
  );
};

// An army in retreat: tired columns trudge away under rain, pursuers behind.
export const RetreatScene = ({ id, start, end, at = PL.ayut, side = "burma", pursuer = "siam" }: Sc & { side?: string; pursuer?: string }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#4a5060", "#9a9a8a"]} accent={GOLD} warm={0.02}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#5a5a6a" mid="#4a4e44" />
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.45 + i * 0.09) + lt * 0.7 * g.s + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.52} mode="walk" costume={C[side]} weapon={i % 2 ? "none" : "spear"} phase={i * 0.9} />)}
          <Elephant x={g.x + g.W * 0.9 + lt * 0.7 * g.s + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.34} walk={0.8} cloth={C[side].jacket} rider="rider" riderCostume={C[side]} />
          {Array.from({ length: 3 }, (_, i) => <Fighter key={`p${i}`} x={g.x + g.W * (0.04 + i * 0.09) + lt * 1.1 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.58} mode="run" costume={C[pursuer]} phase={i} />)}
          {Array.from({ length: 30 }, (_, i) => {
            const rx = g.x + ((i * 47 + frame * 3) % g.W);
            const ry = g.y + ((i * 31 + frame * 9) % g.H);
            return <line key={`r${i}`} x1={rx} y1={ry} x2={rx - 4 * g.s} y2={ry + 14 * g.s} stroke="#c9d6e0" strokeWidth={1.2 * g.s} opacity={0.5} />;
          })}
          <Grass g={g} shift={pan * 1.6} color="#2a3024" />
        </g>
      )}
    </V2>
  );
};

// Evidence desk: two manuscripts side by side on a table, a balance between them (comparing sources).
export const CompareScene = ({ id, start, end, at = PL.ayut, left = "khoi", right = "parabaik", tilt = 0 }: Sc & { left?: "khoi" | "parabaik" | "letter"; right?: "khoi" | "parabaik" | "letter"; tilt?: number }) => {
  const frame = useCurrentFrame();
  const t = tilt * Math.sin(Math.min(1, (frame - start) / 40) * Math.PI * 0.5) * 12;
  const book = (k: string, x: number, y: number, g: { s: number }) =>
    k === "khoi" ? <Manuscript x={x - 90 * g.s} y={y} w={180 * g.s} s={g.s} dark={false} lines={4} /> : k === "parabaik" ? <Parabaik x={x - 80 * g.s} y={y} w={160 * g.s} s={g.s} /> : <Letter x={x - 60 * g.s} y={y} w={120 * g.s} s={g.s} rot={0} />;
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.1}>
      {(g, pan) => {
        const cx = g.x + g.W / 2 + pan * 0.5;
        const top = g.ground - 200 * g.s;
        const r = (t * Math.PI) / 180;
        const lx = cx - Math.cos(r) * 230 * g.s;
        const ly = top - Math.sin(r) * 230 * g.s;
        const rx = cx + Math.cos(r) * 230 * g.s;
        const ry = top + Math.sin(r) * 230 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
            <rect x={g.x - 50 * g.s} y={g.ground - 20 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <line x1={cx} y1={g.ground - 20 * g.s} x2={cx} y2={top} stroke={PAL.gilt} strokeWidth={8 * g.s} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={PAL.gilt} strokeWidth={6 * g.s} />
            {[[lx, ly], [rx, ry]].map(([x, y], i) => (
              <g key={i}>
                <line x1={x} y1={y} x2={x - 70 * g.s} y2={y + 80 * g.s} stroke={PAL.gilt} strokeWidth={2 * g.s} />
                <line x1={x} y1={y} x2={x + 70 * g.s} y2={y + 80 * g.s} stroke={PAL.gilt} strokeWidth={2 * g.s} />
                <path d={`M${x - 90 * g.s} ${y + 80 * g.s} Q${x} ${y + 110 * g.s} ${x + 90 * g.s} ${y + 80 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                {book(i ? right : left, x, y + 80 * g.s, g)}
              </g>
            ))}
            <Candle x={g.x + g.W * 0.08 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s * 1.4} />
          </g>
        );
      }}
    </V2>
  );
};

// An empty throne under a royal umbrella, lit from above (what kingship meant then).
export const ThroneLightScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#1a0c08", "#4a2414"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a140c" />
        <path d={`M${g.x + g.W * 0.4} ${g.y} L${g.x + g.W * 0.3} ${g.ground} L${g.x + g.W * 0.7} ${g.ground} L${g.x + g.W * 0.6} ${g.y} Z`} fill="#ffe2a0" opacity={0.1 + 0.04 * Math.sin(lt * 0.1)} />
        <g transform={`translate(${g.x + g.W / 2 + pan * 0.4},${g.ground - 10 * g.s})`}>
          <path d={`M${-90 * g.s} 0 L${-80 * g.s} ${-50 * g.s} L${80 * g.s} ${-50 * g.s} L${90 * g.s} 0 Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * g.s} />
          <path d={`M${-50 * g.s} ${-50 * g.s} L${-50 * g.s} ${-150 * g.s} Q0 ${-180 * g.s} ${50 * g.s} ${-150 * g.s} L${50 * g.s} ${-50 * g.s} Z`} fill="#8a2a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <line x1={0} y1={-180 * g.s} x2={0} y2={-300 * g.s} stroke={PAL.gilt} strokeWidth={4 * g.s} />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${(-80 + i * 12) * g.s} ${(-200 - i * 22) * g.s} Q0 ${(-224 - i * 22) * g.s} ${(80 - i * 12) * g.s} ${(-200 - i * 22) * g.s} Z`} fill={i % 2 ? PAL.gilt : PAL.chalk} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        </g>
        {[0.15, 0.85].map((f) => <Candle key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground - 10 * g.s} s={g.s * 1.4} />)}
      </g>
    )}
  </V2>
);

// Two war elephants face each other in silhouette against a red sky (the teaser for the elephant duel).
export const DuelSilhouetteScene = ({ id, start, end, at = PL.nongsarai }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#2a0e0e", "#e0603a"]} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.45]} lightColor={["#ff9a5a", "#ffe0a0"]} far="#4a1a14" mid="#2a100c" ground="#1a0a08" mist="#ff8a5a" />
        <g opacity={0.95} style={{ filter: "brightness(0.12)" }}>
          <Elephant x={g.x + g.W * 0.3 + Math.min(40, lt * 0.3) * g.s + pan * 0.6} y={g.ground + 10 * g.s} s={g.s * 0.5} walk={lt < 130 ? 1 : 0} trumpet={interpolate(lt, [60, 75, 110], [0, 1, 0], clamp)} />
          <Elephant x={g.x + g.W * 0.7 - Math.min(40, lt * 0.3) * g.s + pan * 0.6} y={g.ground + 10 * g.s} s={g.s * 0.5} flip walk={lt < 130 ? 1 : 0} />
        </g>
        <Grass g={g} shift={pan * 1.6} color="#0a0404" />
      </g>
    )}
  </V2>
);

// ---------- elephant duel (episode 6) ----------

// The two elephants locked together; phase: "charge" (closing), "clash" (strikes on `hits`), "fall" (the
// Burmese rider is struck down at hits[last]). push = who has the upper hand: 1 Siam, -1 Burma.
export const DuelScene = ({ id, start, end, at = PL.nongsarai, phase = "clash", hits = [], push = 0, dust = 0.8, ekat = false }: Sc & { phase?: "charge" | "clash" | "fall"; hits?: number[]; push?: number; dust?: number; ekat?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#8a6a4a", "#f2c98a"]} accent={RED} hits={hits}>
      {(g, pan, lt) => {
        const close = phase === "charge" ? interpolate(lt, [0, 70], [0, 1], clamp) : 1;
        const recoil = hits.reduce((r, f) => r + (frame >= f && frame < f + 12 ? Math.sin(((frame - f) / 12) * Math.PI) * 16 : 0), 0) * g.s;
        const swingS = Math.max(0, ...hits.map((f) => (frame >= f - 10 && frame < f + 8 ? Math.sin(((frame - f + 10) / 18) * Math.PI) : 0)));
        const lastHit = hits[hits.length - 1] ?? 1e9;
        const fallen = phase === "fall" ? interpolate(frame, [lastHit + 4, lastHit + 26], [0, 1], clamp) : 0;
        const sx = g.x + g.W * (0.18 + close * 0.17) + push * 20 * g.s - recoil + pan * 0.6;
        const bx = g.x + g.W * (0.82 - close * 0.17) + push * 20 * g.s + recoil + pan * 0.6;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.2]} lightColor={["#ffe2a0", "#fff1cc"]} mist="#e8c890" />
            <Tree x={g.x + g.W * 0.9 + pan * 0.3} y={g.ground - 20 * g.s} s={g.s * 1.6} />
            <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s} k={dust} n={11} />
            <Elephant x={bx} y={g.ground + 16 * g.s} s={g.s * 0.5} flip walk={phase === "charge" ? 1 : 0.2} trumpet={interpolate(lt, [6, 16, 40], [0, 1, 0], clamp)} swing={swingS * 0.6} cloth={ekat ? "#3a3a46" : PAL.chalk} trim="#7a2a22" riderCostume={ekat ? C.burmaRed : C.burmaPrince} rider={fallen > 0.5 ? "rider" : "king"} hurt={fallen * 0.4} umbrella={!ekat} />
            <Elephant x={sx} y={g.ground + 20 * g.s} s={g.s * 0.52} walk={phase === "charge" ? 1.2 : 0.2} trumpet={interpolate(lt, [20, 30, 60], [0, 1, 0], clamp)} swing={swingS} cloth={ekat ? PAL.indigo : RED} trim={PAL.gilt} riderCostume={ekat ? { ...C.prince, jacket: PAL.indigo } : C.prince} />
            {hits.map((f) => {
              const k = frame - f;
              if (k < 0 || k > 10) return null;
              const cx = (sx + bx) / 2;
              return (
                <g key={f} transform={`translate(${cx},${g.ground - 170 * g.s})`} opacity={1 - k / 10}>
                  {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i * 0.63) * (10 + k * 5) * g.s} y2={Math.sin(i * 0.63) * (10 + k * 5) * g.s} stroke="#ffe48a" strokeWidth={2.5 * g.s} strokeLinecap="round" />)}
                  <circle r={(10 - k) * g.s} fill="#fff6d0" />
                </g>
              );
            })}
            <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
          </g>
        );
      }}
    </V2>
  );
};

// Close-up on the riders: the ngao sweeps; `hatCut` = frame the hat is knocked askew (พระมาลาเบี่ยง), `strike` =
// frame of the decisive blow (the Burmese rider slumps).
export const NgaoCloseScene = ({ id, start, end, at = PL.nongsarai, hatCut, strike }: Sc & { hatCut?: number; strike?: number }) => {
  const frame = useCurrentFrame();
  const hits = [hatCut, strike].filter((x): x is number => x !== undefined);
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#8a5a3a", "#f2b880"]} accent={RED} hits={hits}>
      {(g, pan) => {
        const swingB = hatCut ? interpolate(frame, [hatCut - 14, hatCut, hatCut + 20], [0, 1, 0.2], clamp) : 0;
        const swingS = strike ? interpolate(frame, [strike - 12, strike, strike + 24], [0, 1, 0.4], clamp) : 0;
        const hat = hatCut ? interpolate(frame, [hatCut, hatCut + 10], [0, 1], clamp) : 0;
        const slump = strike ? interpolate(frame, [strike + 2, strike + 24], [0, 1], clamp) : 0;
        const push = hatCut && !strike ? -interpolate(frame, [hatCut - 20, hatCut], [0, 30], clamp) : strike ? interpolate(frame, [strike - 30, strike], [0, 30], clamp) : 0;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.18]} mist="#e8c890" />
            <Dust x={g.x + g.W * 0.5} y={g.ground + 30 * g.s} s={g.s} k={0.6} n={12} />
            <Elephant x={g.x + g.W * 0.8 + push * g.s + pan * 0.6} y={g.ground + 210 * g.s} s={g.s * 1.05} flip trumpet={0.6} swing={swingB} cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} slump={slump} />
            <Elephant x={g.x + g.W * 0.2 + push * g.s + pan * 0.6} y={g.ground + 220 * g.s} s={g.s * 1.1} trumpet={0.3} swing={swingS} cloth={RED} trim={PAL.gilt} riderCostume={C.prince} hat={hat} />
            {hits.map((f) => (frame >= f && frame < f + 7 ? <circle key={f} cx={g.x + g.W * 0.5} cy={g.y + g.H * 0.3} r={60 * g.s} fill="#fff4dc" opacity={0.7 * (1 - (frame - f) / 7)} /> : null))}
          </g>
        );
      }}
    </V2>
  );
};

// Musketeers fire a volley from behind (guns on the battlefield; Portuguese mercenaries).
export const MusketScene = ({ id, start, end, at = PL.nongsarai, shots = [], who = "porto" }: Sc & { shots?: number[]; who?: string }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#8a7a6a", "#e8c890"]} accent={RED} hits={shots}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.22]} mist="#e8d0a0" />
          {Array.from({ length: 4 }, (_, i) => {
            const fl = shots.some((f) => frame >= f + i * 3 && frame < f + i * 3 + 5) ? 1 : 0;
            return <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.11) + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.62} mode="aim" costume={C[who]} weapon="rifle" flash={fl} phase={i} />;
          })}
          {shots.map((f) => [0, 1, 2, 3].map((i) => <Shot key={`${f}${i}`} from={[g.x + g.W * (0.2 + i * 0.11) + pan * 0.7, g.ground - 70 * g.s]} to={[g.x + g.W * (0.78 + i * 0.03), g.ground - 30 * g.s]} t={frame - f - i * 3} s={g.s} flight={10} />))}
          <Elephant x={g.x + g.W * 0.82 + pan * 0.5} y={g.ground + 8 * g.s} s={g.s * 0.4} flip cloth={PAL.chalk} trim="#7a2a22" riderCostume={C.burmaPrince} />
          <Grass g={g} shift={pan * 1.6} color="#4a3a20" />
        </g>
      )}
    </V2>
  );
};

// Generals kneel in chains before the king; a senior monk approaches to plead (or the scene without the monk).
export const JudgementScene = ({ id, start, end, at = PL.ayut, monks = false }: Sc & { monks?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={monks ? GOLD : RED} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a2414" />
        {[0.08, 0.92].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#7a3a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#2a1a10" />
        <King x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 14 * g.s} scale={g.sc * 0.6} light={0.4} />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.3 + i * 0.1) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.56} mode="prostrate" phase={i} jacket={["#efe6d0", "#c9b48a", "#3a5a8a", "#efe6d0"][i]} />)}
        {[0, 1, 2, 3].map((i) => <path key={`c${i}`} d={`M${g.x + g.W * (0.28 + i * 0.1) + pan * 0.7} ${g.ground - 4 * g.s} q${10 * g.s} ${6 * g.s} ${20 * g.s} 0`} stroke="#9aa0a8" strokeWidth={3 * g.s} fill="none" strokeDasharray={`${4 * g.s} ${2 * g.s}`} />)}
        {monks ? (
          [0, 1, 2].map((i) => <Monk key={`m${i}`} x={g.x + g.W * (0.06 + i * 0.08) + Math.min(50, lt * 0.4) * g.s + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.6} mode={lt > 120 ? "kneel" : "walk"} bow={0.5} phase={i} />)
        ) : (
          [0, 1].map((i) => <Fighter key={`g${i}`} x={g.x + g.W * (0.1 + i * 0.1) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.6} mode="stand" costume={C.guard ?? C.siamRed} />)
        )}
      </g>
    )}
  </V2>
);

// A port on the Andaman coast: fortified harbour, ships, the Siamese flag rising (Tavoy, Tenasserim).
export const PortScene = ({ id, start, end, at = PL.tavoy, taken = true }: Sc & { taken?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} />
        <rect x={g.x - 100 * g.s} y={g.ground - 60 * g.s} width={g.W + 200 * g.s} height={g.H} fill="#2f6f8f" />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${g.x + ((i * 97 + lt) % g.W)} ${g.ground - (40 - (i % 3) * 12) * g.s} q${10 * g.s} ${-4 * g.s} ${20 * g.s} 0`} stroke="#e8f4f8" strokeWidth={1.6 * g.s} fill="none" opacity={0.5} />)}
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 60 * g.s} w={g.W * 0.5} h={60 * g.s} s={g.s} color="#c9b48a" />
        <Pyatthat x={g.x + g.W * 0.64 + pan * 0.3} y={g.ground - 120 * g.s} w={120 * g.s} s={g.s} n={3} />
        <Banner x={g.x + g.W * 0.9 + pan * 0.4} y={g.ground - 120 * g.s - (taken ? Math.min(40, lt * 0.4) : 0) * g.s} s={g.s} color={taken ? RED : PAL.chalk} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${g.x + g.W * (0.12 + i * 0.22) + Math.sin(lt * 0.03 + i) * 6 * g.s + pan * 0.6},${g.ground - 30 * g.s})`}>
            <path d={`M${-60 * g.s} 0 L${60 * g.s} 0 L${44 * g.s} ${24 * g.s} L${-44 * g.s} ${24 * g.s} Z`} fill="#6a4524" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <line x1={0} y1={0} x2={0} y2={-110 * g.s} stroke="#4a2f18" strokeWidth={4 * g.s} />
            <path d={`M${2 * g.s} ${-104 * g.s} Q${50 * g.s} ${-70 * g.s} ${2 * g.s} ${-20 * g.s} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          </g>
        ))}
      </g>
    )}
  </V2>
);

// A Dutch merchant in his trading house writes a report; a ship's mast through the window (van Vliet).
export const DutchScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#2a2a3a", "#6a6a7a"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2a1e" />
        <rect x={g.x + g.W * 0.6 + pan * 0.2} y={g.y + 30 * g.s} width={g.W * 0.28} height={g.H * 0.5} fill="#8ab0c8" stroke={PAL.ink} strokeWidth={3 * g.s} />
        <line x1={g.x + g.W * 0.74 + pan * 0.2} y1={g.y + 30 * g.s} x2={g.x + g.W * 0.74 + pan * 0.2} y2={g.y + 30 * g.s + g.H * 0.5} stroke={PAL.ink} strokeWidth={3 * g.s} />
        <line x1={g.x + g.W * 0.68 + pan * 0.1} y1={g.y + 40 * g.s} x2={g.x + g.W * 0.68 + pan * 0.1} y2={g.y + 30 * g.s + g.H * 0.5} stroke="#4a2f18" strokeWidth={3 * g.s} />
        <rect x={g.x - 50 * g.s} y={g.ground - 40 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#6a4524" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Letter x={g.x + g.W * 0.32 + pan * 0.5} y={g.ground - 44 * g.s} w={150 * g.s} s={g.s} />
        <line x1={g.x + g.W * 0.44 + pan * 0.5} y1={g.ground - 80 * g.s} x2={g.x + g.W * 0.48 + Math.sin(lt * 0.5) * 6 * g.s + pan * 0.5} y2={g.ground - 140 * g.s} stroke="#efe6d0" strokeWidth={2.5 * g.s} />
        <Fighter x={g.x + g.W * 0.18 + pan * 0.6} y={g.ground - 30 * g.s} scale={g.sc * 0.66} mode="stand" costume={C.dutch} weapon="none" />
        <Candle x={g.x + g.W * 0.56 + pan * 0.6} y={g.ground - 40 * g.s} s={g.s * 1.4} />
      </g>
    )}
  </V2>
);

// The ruined chedi in the fields (Don Chedi, as found in 1913), or a modern memorial pair.
export const RuinScene = ({ id, start, end, at = PL.nongsarai, explorers = true }: Sc & { explorers?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} ground="#7a6a3a" />
        <Chedi x={g.x + g.W * 0.55 + pan * 0.4} y={g.ground - 6 * g.s} h={200 * g.s} s={g.s} ruin />
        {[0.15, 0.85].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 1.2} kind={f < 0.5 ? "palm" : "round"} />)}
        {explorers && [0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.25 + i * 0.07) + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.55} mode="stand" costume={i === 0 ? { jacket: "#efe6d0", sash: "#efe6d0", pants: "#efe6d0", head: "short" } : C.villager} weapon="none" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
      </g>
    )}
  </V2>
);

// Old documents burn in a fire (records lost when Ayutthaya fell in 1767).
export const LostRecordsScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#120b1e", "#4a1a10"]} accent={RED} warm={0.14}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1a0e08" />
        <rect x={g.x - 50 * g.s} y={g.ground - 20 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#2a1a10" />
        {[0, 1, 2].map((i) => <Manuscript key={i} x={g.x + g.W * (0.2 + i * 0.22) + pan * 0.5} y={g.ground - 20 * g.s - i * 6 * g.s} w={200 * g.s} s={g.s} dark={i % 2 === 0} fade={1 - Math.min(1, lt / 120)} />)}
        {[0.3, 0.5, 0.7].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 30 * g.s} h={(80 + i * 20) * g.s} seed={i} />)}
        {Array.from({ length: 12 }, (_, i) => {
          const age = (lt * 1.5 + i * 23) % 120;
          return <circle key={i} cx={g.x + g.W * (0.25 + (i % 6) * 0.1) + Math.sin(age * 0.1 + i) * 20 * g.s} cy={g.ground - 60 * g.s - age * 1.6 * g.s} r={3 * g.s} fill="#ffb03a" opacity={1 - age / 120} />;
        })}
      </g>
    )}
  </V2>
);

// A royal tent in the hills at night: the king lies ill; physicians and monks attend (Mueang Hang).
export const SickTentScene = ({ id, start, end, at = PL.wianghaeng, arrive = false }: Sc & { arrive?: boolean }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#0a1022", "#2a2a44"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.18]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#22282a" ground="#1a1712" mist="#8a90b0" />
        <path d={`M${g.x + g.W * 0.25 + pan * 0.5} ${g.ground} L${g.x + g.W * 0.5 + pan * 0.5} ${g.y + 40 * g.s} L${g.x + g.W * 0.75 + pan * 0.5} ${g.ground} Z`} fill="#8a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <path d={`M${g.x + g.W * 0.36 + pan * 0.5} ${g.ground} L${g.x + g.W * 0.5 + pan * 0.5} ${g.y + 110 * g.s} L${g.x + g.W * 0.64 + pan * 0.5} ${g.ground} Z`} fill="#ffcf7a" opacity={0.5} />
        <rect x={g.x + g.W * 0.42 + pan * 0.5} y={g.ground - 26 * g.s} width={g.W * 0.16} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
        <Monk x={g.x + g.W * 0.4 + pan * 0.55} y={g.ground - 4 * g.s} scale={g.sc * 0.46} mode="sit" />
        <Noble x={g.x + g.W * 0.6 + pan * 0.55} y={g.ground - 4 * g.s} scale={g.sc * 0.48} mode="kneel" bow={0.6} flip />
        <Candle x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 26 * g.s} s={g.s} />
        {[0.1, 0.86].map((f) => <Tent key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground + 6 * g.s} w={90 * g.s} s={g.s} lit={0.6} stripe={RED} />)}
        {arrive && <Elephant x={g.x + g.W * 0.08 + Math.min(80, lt * 0.5) * g.s + pan * 0.8} y={g.ground + 30 * g.s} s={g.s * 0.34} walk={lt < 160 ? 1 : 0} cloth={PAL.indigo} riderCostume={{ ...C.prince, jacket: PAL.indigo }} />}
        <Grass g={g} shift={pan * 1.6} color="#10160e" />
      </g>
    )}
  </V2>
);

// Shan hill country: mist, terraces, a hill-top stupa (Shan states, Mueang Hang candidates).
export const HillsScene = ({ id, start, end, at = PL.mongton, army = false, side = "burma" }: Sc & { army?: boolean; side?: string }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#7a8aa8", "#e0d0b0"]} accent={GOLD}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.2, 0.25]} far="#6a7a8a" mid="#4a6a4a" ground="#4a5a3a" mist="#f0f0f0" />
        <GoldStupa x={g.x + g.W * 0.72 + pan * 0.3} y={g.ground - 110 * g.s} h={90 * g.s} s={g.s} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${g.x - 50 * g.s} ${g.ground - (20 + i * 22) * g.s} Q${g.x + g.W * 0.5} ${g.ground - (40 + i * 22) * g.s} ${g.x + g.W + 50 * g.s} ${g.ground - (16 + i * 22) * g.s}`} stroke="#6a8a4a" strokeWidth={4 * g.s} fill="none" />)}
        {army && Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.05 + i * 0.1) + lt * 0.6 * g.s + pan * 0.7} y={g.ground + 16 * g.s} scale={g.sc * 0.5} mode="walk" costume={C[side]} phase={i} />)}
        <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={40 * g.s} fill="#ffffff" opacity={0.25} />
        <Grass g={g} shift={pan * 1.6} color="#3a4a2a" />
      </g>
    )}
  </V2>
);

// The Khmer royal city (Longvek) with its towers; Siamese banners over the gate.
export const LawaekScene = ({ id, start, end, at = PL.lawaek, taken = true, hits = [] }: Sc & { taken?: boolean; hits?: number[] }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={DUSK} accent={taken ? GOLD : RED} hits={hits}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.45]} />
        {[0.55, 0.7, 0.85].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 60 * g.s} h={(130 + i * 20) * g.s} s={g.s} color="#a89a7a" />)}
        <PalaceWall x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={70 * g.s} s={g.s} gateAt={0.2} gateOpen={taken ? 1 : 0} color="#b8a888" />
        {taken && <Banner x={g.x + g.W * 0.57 + pan * 0.5} y={g.ground - 80 * g.s - Math.min(30, lt * 0.3) * g.s} s={g.s} color={RED} />}
        {Array.from({ length: 5 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.05 + i * 0.08) + lt * 0.4 * g.s + pan * 0.8} y={g.ground + 22 * g.s} scale={g.sc * 0.56} mode="run" costume={C.siam} phase={i} />)}
        <Tree x={g.x + g.W * 0.4 + pan * 1.2} y={g.ground + 30 * g.s} s={g.s * 1.2} kind="palm" />
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

// A king's coronation: the new king seated on the throne, a brother beside him, nobles prostrate, gold light.
export const CoronationScene = ({ id, start, end, at = PL.ayut }: Sc) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={["#3a1a10", "#a86a2a"]} accent={GOLD} warm={0.14}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2a18" />
        {[0.12, 0.32, 0.68, 0.88].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#8a4a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
        <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
        <King x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 14 * g.s} scale={g.sc * 0.85} light={0.6 + 0.4 * Math.sin(lt * 0.05)} />
        <Noble x={g.x + g.W * 0.64 + pan * 0.5} y={g.ground - 10 * g.s} scale={g.sc * 0.75} mode="sit" jacket={PAL.indigo} />
        {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.12) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.58} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
        {Array.from({ length: 10 }, (_, i) => {
          const age = (lt * 0.8 + i * 17) % 100;
          return <circle key={`p${i}`} cx={g.x + g.W * (0.6 + (i % 5) * 0.08)} cy={g.y + age * 3 * g.s} r={2.5 * g.s} fill={PAL.gilt} opacity={0.7 * (1 - age / 100)} />;
        })}
      </g>
    )}
  </V2>
);

// A Burmese prince bows before an angry king who flings a woman's skirt-cloth at him (later Thai chronicles).
export const SkirtScene = ({ id, start, end, at = PL.pegu, throw: t }: Sc & { throw?: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={at} start={start} end={end} sky={["#3a1a10", "#8a4a22"]} accent={RED} warm={0.12}>
      {(g, pan) => {
        const k = t ? interpolate(frame, [t, t + 16], [0, 1], clamp) : 0;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2418" />
            <Pyatthat x={g.x + g.W * 0.62 + pan * 0.2} y={g.ground - 40 * g.s} w={260 * g.s} s={g.s} n={4} wall="#7a3a1a" />
            <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
            <Fighter x={g.x + g.W * 0.76 + pan * 0.5} y={g.ground - 10 * g.s} scale={g.sc * 0.64} flip mode={k > 0 && k < 1 ? "attack" : "stand"} costume={{ ...C.burmaPrince, jacket: "#7a1a14" }} weapon="none" />
            <Noble x={g.x + g.W * 0.36 + pan * 0.6} y={g.ground - 6 * g.s} scale={g.sc * 0.64} mode="kneel" bow={0.8} jacket={PAL.chalk} />
            {k > 0 && (
              <path d={`M${g.x + g.W * (0.7 - k * 0.3) + pan * 0.55} ${g.ground - (110 - Math.sin(k * Math.PI) * 50 + k * 30) * g.s} q${20 * g.s} ${-10 * g.s} ${40 * g.s} ${4 * g.s} l${-6 * g.s} ${30 * g.s} q${-18 * g.s} ${-8 * g.s} ${-38 * g.s} ${0} Z`} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            )}
            {[0, 1].map((i) => <Noble key={i} x={g.x + g.W * (0.1 + i * 0.1) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.52} mode="prostrate" phase={i} jacket={C.burma.jacket} />)}
          </g>
        );
      }}
    </V2>
  );
};

// A pass through jungle mountains (Three Pagodas Pass): three small stupas, the army filing through.
export const PassScene = ({ id, start, end, at = PL.threePagodas, side = "burma", light = "day" }: Sc & { side?: string; light?: "day" | "dawn" | "dusk" }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={light === "day" ? DAY : light === "dawn" ? DAWN : DUSK} accent={RED}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} far="#4a5a6a" mid="#2f4a2f" ground="#4a4a2a" mist="#e8e8d8" />
        {[0.62, 0.7, 0.78].map((f) => <Chedi key={f} x={g.x + g.W * f + pan * 0.4} y={g.ground - 10 * g.s} h={70 * g.s} s={g.s} />)}
        {Array.from({ length: 7 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.02 + i * 0.08) + lt * 0.6 * g.s + pan * 0.7} y={g.ground + 18 * g.s} scale={g.sc * 0.5} mode="walk" costume={C[side]} phase={i} />)}
        <Elephant x={g.x + g.W * 0.4 + lt * 0.6 * g.s + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.34} walk={1} cloth={C[side].jacket} riderCostume={C[side]} rider="rider" />
        {[0.08, 0.92].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 1.3} y={g.ground + 40 * g.s} s={g.s * 1.5} />)}
        <Grass g={g} shift={pan * 1.6} color="#1f2a18" />
      </g>
    )}
  </V2>
);

// A river camp: the royal pavilion by the water, elephants tethered, soldiers drilling (Nong Sarai, by the Tha Khoi).
export const RiverCampScene = ({ id, start, end, at = PL.nongsarai, light = "dusk" }: Sc & { light?: "dusk" | "dawn" }) => (
  <V2 id={id} anchor={at} start={start} end={end} sky={light === "dusk" ? DUSK : DAWN} accent={GOLD}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.42]} />
        <River g={g} y={g.ground - 46 * g.s} pan={pan} />
        <rect x={g.x - 100 * g.s} y={g.ground - 16 * g.s} width={g.W + 200 * g.s} height={g.H} fill={PAL.earth} />
        <Hall x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 10 * g.s} w={180 * g.s} s={g.s} roof={RED} />
        {[0, 1].map((i) => <Elephant key={i} x={g.x + g.W * (0.52 + i * 0.26) + pan * 0.6} y={g.ground + 12 * g.s} s={g.s * 0.36} cloth={i ? PAL.indigo : RED} rider="none" phase={i * 2} trumpet={0} />)}
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.38 + i * 0.06) + pan * 0.8} y={g.ground + 26 * g.s} scale={g.sc * 0.5} mode="attack" costume={C.siam} phase={i * 1.4} />)}
        <Grass g={g} shift={pan * 1.6} />
      </g>
    )}
  </V2>
);

export { Backdrop, Banner, Boat, Candle, Fighter, Fire, Grass, Hall, House, King, Manuscript, Monk, Noble, PAL, PalaceWall, Palisade, Prang, River, Smoke, Tree, V2 };
