import { interpolate, useCurrentFrame } from "remotion";
import { QingSoldier } from "../news/ch5";
import { clamp, font, GOLD, Panel, RED, Skyline } from "../news/kit";
import { BurmeseSoldier, CityWall, Dust, Fire, Moon, SiegeCamp, Smoke } from "../news/Period";
import { Sampan, SiamSoldier, Townsperson, WallCannon, WarElephant, WaterBand } from "../news/Period2";
import { BigTent, BurmesePalace, Parasol, Royal } from "../news/Period3";
import { HorseGeneral, LannaGate, Mountains, Palisade } from "../news/Period4";
import { PalmLeaf, SamutKhoi, Villager } from "../news/Period5";
import { LANNA_C, MON_C, QING_C } from "./beatsKit";

// Illustration panels for episode 3, parameterised by start / end (and a few by a cue frame).
// Panel overlap rule: pass the next panel's start + 14 as end.
const INK = "#1b1d24";
type S = { id: string; anchor: [number, number]; start: number; end: number };
const DAY: [string, string] = ["#3a6ea5", "#bfe0f2"];
const DUSK: [string, string] = ["#7a3a1a", "#f2b35e"];
const NIGHT: [string, string] = ["#0b1230", "#2a3a6a"];
const GREY: [string, string] = ["#5a6270", "#c9c4b8"];
export const TAK = GOLD;
const BURMA_JACKET = "#8e2a22";

// A Qing banner on a pole (dragon-yellow field, red border); `tilt` lowers it.
const QingBanner = ({ x, y, s, tilt = 0 }: { x: number; y: number; s: number; tilt?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt * 70})`}>
    <line x1={0} y1={0} x2={0} y2={-150 * s} stroke="#5a3a1a" strokeWidth={4 * s} />
    <path d={`M0 ${-150 * s} L${70 * s} ${-140 * s} L${60 * s} ${-95 * s} L0 ${-100 * s} Z`} fill="#e8c23a" stroke={QING_C} strokeWidth={4 * s} />
    <path d={`M${14 * s} ${-118 * s} q${10 * s} ${-14 * s} ${20 * s} 0 t${20 * s} 0`} fill="none" stroke={QING_C} strokeWidth={3 * s} />
  </g>
);

// Qing army marching (or breaking: `fallAt` frame, banners drop and men turn back).
export const QingArmyScene = ({ id, anchor, start, end, fallAt }: S & { fallAt?: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={fallAt ? ["#4a2a2a", "#c87a4a"] : ["#6a7a8a", "#d8d2c0"]} accent={QING_C}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        const f = fallAt ? interpolate(frame, [fallAt, fallAt + 18], [0, 1], clamp) : 0;
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 10 * g.s} W={g.W} s={g.s} h={140} seed="yunnan" />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a7a5a" />
            <QingBanner x={g.x + g.W * 0.18} y={g.ground} s={g.s} tilt={f} />
            <QingBanner x={g.x + g.W * 0.52} y={g.ground} s={g.s} tilt={f * 0.8} />
            {[0, 1, 2, 3, 4].map((i) => <QingSoldier key={i} x={g.x + g.W * (0.08 + i * 0.16 + (f > 0 ? -f * 0.1 : m * 0.1))} y={g.ground + 6 * g.s} scale={g.sc * 0.72} phase={i} flip={f > 0.5} />)}
            {f > 0 && <Smoke x={g.x + g.W * 0.8} y={g.ground - 90 * g.s} size={150 * g.s * f} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Kaungton: the Qing camp in the mist, sick men lying down, Burmese posts around it.
export const KaungtonScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={GREY} accent={RED}>
    {(g) => (
      <g>
        <WaterBand x={g.x} y={g.ground - 60 * g.s} W={g.W * 0.3} H={g.H} s={g.s} color="#4a7a90" />
        <rect x={g.x + g.W * 0.3} y={g.ground - 20 * g.s} width={g.W * 0.7} height={g.H} fill="#6a6a4a" />
        <Palisade x0={g.x + g.W * 0.36} x1={g.x + g.W * 0.72} y={g.ground} s={g.s} />
        <QingBanner x={g.x + g.W * 0.5} y={g.ground - 40 * g.s} s={g.s * 0.8} tilt={0.15} />
        {[0.42, 0.56].map((fx, i) => <QingSoldier key={i} x={g.x + g.W * fx} y={g.ground - 50 * g.s} scale={g.sc * 0.55} phase={i} />)}
        {[0.4, 0.52, 0.64].map((fx, i) => <rect key={i} x={g.x + g.W * fx} y={g.ground - 12 * g.s} width={44 * g.s} height={12 * g.s} rx={6 * g.s} fill="#c8b48a" stroke={INK} strokeWidth={g.s} />)}
        {[0.8, 0.9].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" pose="stand" flip phase={i} />)}
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e8ecec" opacity={0.32} />
      </g>
    )}
  </Panel>
);

// Two delegations meet under a white flag; the two leaders step forward and bow at `bowAt`.
// left = "qing" (peace talks of 1769) or "thai" (Phitsanulok truce).
export const TruceScene = ({ id, anchor, start, end, bowAt, left = "thai" }: S & { bowAt: number; left?: "thai" | "qing" }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={DUSK} accent={GOLD}>
      {(g) => {
        const step = interpolate(frame, [start + 10, bowAt], [0, 1], clamp);
        const bow = interpolate(frame, [bowAt, bowAt + 12], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#9a8a5a" />
            <line x1={g.cx} y1={g.ground} x2={g.cx} y2={g.ground - 170 * g.s} stroke="#5a3a1a" strokeWidth={4 * g.s} />
            <path d={`M${g.cx} ${g.ground - 170 * g.s} q${40 * g.s} ${-8 * g.s} ${70 * g.s} ${6 * g.s} l0 ${50 * g.s} q${-30 * g.s} ${-14 * g.s} ${-70 * g.s} ${-6 * g.s} Z`} fill="#f4f1e8" stroke={INK} strokeWidth={1.4 * g.s} />
            {left === "qing"
              ? [0.06, 0.14].map((fx, i) => <QingSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.7} phase={i} />)
              : [0.06, 0.14].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.7} hold="spear" phase={i} />)}
            {[0.86, 0.94].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.7} hold="spear" pose="stand" flip phase={i} />)}
            <g transform={`translate(${g.x + g.W * (0.24 + step * 0.12)},${g.ground + 6 * g.s}) rotate(${bow * 14})`}>
              {left === "qing" ? <QingSoldier x={0} y={0} scale={g.sc * 0.8} /> : <SiamSoldier x={0} y={0} scale={g.sc * 0.8} hold="none" jacket="#2f4f86" />}
            </g>
            <g transform={`translate(${g.x + g.W * (0.76 - step * 0.12)},${g.ground + 6 * g.s}) rotate(${-bow * 14})`}>
              <BurmeseSoldier x={0} y={0} scale={g.sc * 0.8} hold="sword" pose="stand" flip jacket="#5a1a1a" />
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// The Burmese court at Ava: palace, king under a white parasol; `mourning` greys it and lowers the parasol.
export const BurmaCourtScene = ({ id, anchor, start, end, mourning = false }: S & { mourning?: boolean }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={mourning ? GREY : ["#c98a2a", "#fbe3a0"]} accent={RED}>
    {(g) => (
      <g opacity={mourning ? 0.85 : 1}>
        <BurmesePalace x={g.cx} y={g.ground - 30 * g.s} s={g.s * 0.6} />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill={mourning ? "#4a4a4a" : "#7a2a1a"} />
        {!mourning && <Royal x={g.cx} y={g.ground - 4 * g.s} scale={g.sc * 0.8} pose="sit" robe="#e2b84a" side={BURMA_JACKET} />}
        {!mourning && <Parasol x={g.cx + 70 * g.s} y={g.ground} s={g.s * 0.9} tiers={5} />}
        {[0.12, 0.24, 0.76, 0.88].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.6} hold="none" pose="dig" cloth={mourning ? "#e8e4da" : BURMA_JACKET} band={mourning ? "#e8e4da" : BURMA_JACKET} flip={fx > 0.5} phase={i} />)}
      </g>
    )}
  </Panel>
);

// Chiang Mai gate; `taken` puts Lanna and Siamese men with gold banners before it.
export const LannaScene = ({ id, anchor, start, end, taken = false }: S & { taken?: boolean }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={taken ? GOLD : LANNA_C}>
    {(g) => (
      <g>
        <Mountains x={g.x} y={g.ground - 30 * g.s} W={g.W} s={g.s} h={150} seed="lanna" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a7a4a" />
        <LannaGate x={g.x + g.W * 0.7} y={g.ground - 26 * g.s} s={g.s * 0.8} />
        {taken ? (
          <>
            <HorseGeneral x={g.x + g.W * 0.3} y={g.ground + 6 * g.s} scale={g.sc * 0.7} banner={GOLD} coat="#2f4f86" />
            {[0.08, 0.16, 0.44].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" pose={i === 2 ? "cheer" : "stand"} band={LANNA_C} cloth="#2a3a2a" phase={i} />)}
          </>
        ) : (
          [0.12, 0.24, 0.36].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="none" pose="stand" band={LANNA_C} cloth="#2a3a2a" mustache={i === 1} phase={i} />)
        )}
      </g>
    )}
  </Panel>
);

// Families crossing the hills (Mon refugees; people fleeing into the forest).
export const RefugeeScene = ({ id, anchor, start, end, cloth = MON_C }: S & { cloth?: string }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={DUSK} accent={cloth}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 6 * g.s} W={g.W} s={g.s} h={190} seed="hills" />
            <path d={`M${g.x} ${g.ground - 30 * g.s} Q${g.cx} ${g.ground - 60 * g.s} ${g.x + g.W} ${g.ground - 10 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#8a6a4a" />
            {[0, 1, 2, 3, 4].map((i) => (
              <Townsperson key={i} x={g.x + g.W * (0.06 + i * 0.13 + m * 0.18)} y={g.ground + 4 * g.s - i * 4 * g.s} scale={g.sc * 0.7} walk woman={i % 2 === 1} load={i % 2 === 0} cloth={[cloth, "#6b5a44", "#7a2f4a", "#4a5a3a", cloth][i]} phase={i} />
            ))}
          </g>
        );
      }}
    </Panel>
  );
};

// A Burmese column on the march through the mountains, with a war elephant.
export const MarchScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#5a4a3a", "#e0a868"]} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 10 * g.s} W={g.W} s={g.s} h={220} seed="dawna" />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#6a5a3a" />
            <WarElephant x={g.x + g.W * (0.6 + m * 0.12)} y={g.ground + 6 * g.s} scale={g.sc * 0.55} side={RED} />
            {[0, 1, 2, 3].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.06 + i * 0.12 + m * 0.12)} y={g.ground + 6 * g.s} scale={g.sc * 0.78} hold={i === 3 ? "sword" : "spear"} phase={i} />)}
            <Dust x={g.x + g.W * 0.3} y={g.ground} s={g.s} k={0.6} />
          </g>
        );
      }}
    </Panel>
  );
};

// Phitsanulok's defenders: the wall with two commanders before it (gold and red banners).
export const DefendersScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g) => (
      <g>
        <Skyline g={g} color="#7a5a40" base={150} />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 50 * g.s} h={70 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#a8905e" />
        <HorseGeneral x={g.x + g.W * 0.36} y={g.ground + 6 * g.s} scale={g.sc * 0.66} banner={GOLD} coat="#2f4f86" />
        <HorseGeneral x={g.x + g.W * 0.64} y={g.ground + 6 * g.s} scale={g.sc * 0.66} banner="#c7322a" coat="#a8322a" flip />
        {[0.1, 0.9].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.78} hold={i ? "gun" : "spear"} flip={fx > 0.5} phase={i} />)}
      </g>
    )}
  </Panel>
);

// The siege: Burmese stockades creeping toward the city wall (right).
export const SiegeScene = ({ id, anchor, start, end, night = false }: S & { night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={night ? NIGHT : DUSK} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            {night && <Moon x={g.x + g.W * 0.12} y={g.y + 70 * g.s} r={22 * g.s} />}
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4a32" />
            <CityWall x0={g.x + g.W * 0.72} x1={g.x + g.W + 10 * g.s} ground={g.ground - 6 * g.s} h={110 * g.s} s={g.s} />
            <SiegeCamp x={g.x + g.W * (0.18 + m * 0.14)} y={g.ground} s={g.s * 0.9} w={200} phase={1} />
            <Palisade x0={g.x + g.W * (0.36 + m * 0.14)} x1={g.x + g.W * (0.5 + m * 0.14)} y={g.ground} s={g.s * 0.8} />
            {[0, 1].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.42 + i * 0.08 + m * 0.14)} y={g.ground + 6 * g.s} scale={g.sc * 0.7} hold={i ? "torch" : "spear"} pose="stand" phase={i} />)}
            <WallCannon x={g.x + g.W * 0.76} y={g.ground - 90 * g.s} s={g.sc * 0.8} flip fire={((frame - start) % 70) / 20} />
          </g>
        );
      }}
    </Panel>
  );
};

// Rice store: sacks run out between `from` and `to`.
export const GranaryScene = ({ id, anchor, start, end, from, to, hungry = false }: S & { from: number; to: number; hungry?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={hungry ? GREY : DAY} accent={GOLD}>
      {(g) => {
        const left = Math.round(interpolate(frame, [from, to], [12, hungry ? 0 : 5], clamp));
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a08a6a" />
            <path d={`M${g.x + g.W * 0.08} ${g.ground - 20 * g.s} l0 ${-150 * g.s} l${120 * g.s} ${-50 * g.s} l${120 * g.s} ${50 * g.s} l0 ${150 * g.s} Z`} fill="#7a5a3a" stroke={INK} strokeWidth={1.5 * g.s} />
            {Array.from({ length: left }, (_, i) => <ellipse key={i} cx={g.x + g.W * 0.12 + (i % 4) * 46 * g.s} cy={g.ground - (34 + Math.floor(i / 4) * 30) * g.s} rx={24 * g.s} ry={16 * g.s} fill="#e3cf9e" stroke={INK} strokeWidth={1.2 * g.s} />)}
            {[0, 1, 2].map((i) => <Townsperson key={i} x={g.x + g.W * (0.62 + i * 0.12)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} walk={false} flip woman={i === 1} cloth={["#6b5a44", "#7a2f4a", "#2f4f6b"][i]} />)}
            {hungry && [0.56, 0.68].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 16 * g.s} ${g.ground} q${-6 * g.s} ${-36 * g.s} ${16 * g.s} ${-42 * g.s} q${22 * g.s} ${6 * g.s} ${16 * g.s} ${42 * g.s} Z`} fill="#8a5a32" stroke={INK} strokeWidth={1.2 * g.s} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The river war: Siamese boats on the Nan, a Burmese stockade on the bank, guns firing.
export const RiverWarScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={DUSK} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <WaterBand x={g.x} y={g.ground - 60 * g.s} W={g.W * 0.6} H={g.H} s={g.s} color="#3d7fa4" />
            <rect x={g.x + g.W * 0.6} y={g.ground - 30 * g.s} width={g.W * 0.4} height={g.H} fill="#6a5a3a" />
            <Palisade x0={g.x + g.W * 0.66} x1={g.x + g.W + 10 * g.s} y={g.ground - 26 * g.s} s={g.s * 0.8} />
            {[0, 1, 2].map((i) => <Sampan key={i} x={g.x + g.W * (0.06 + i * 0.16 + m * 0.08)} y={g.ground - 30 * g.s + (i % 2) * 22 * g.s} scale={g.sc * 0.7} people={2} phase={i} flip />)}
            <WallCannon x={g.x + g.W * 0.7} y={g.ground - 60 * g.s} s={g.sc * 0.8} flip fire={((frame - start) % 50) / 15} />
            <Smoke x={g.x + g.W * 0.55} y={g.ground - 90 * g.s} size={120 * g.s} />
            {[0.8, 0.92].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground - 20 * g.s} scale={g.sc * 0.65} hold="spear" pose="stand" flip phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The royal camp: tent, parasol, the king's horse and banner.
export const RoyalCampScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={GOLD}>
    {(g) => (
      <g>
        <WaterBand x={g.x} y={g.ground - 70 * g.s} W={g.W} H={g.H} s={g.s} color="#3d8fc4" />
        <rect x={g.x} y={g.ground - 36 * g.s} width={g.W} height={g.H} fill="#a08a5a" />
        <BigTent x={g.x + g.W * 0.4} y={g.ground - 30 * g.s} s={g.s * 0.9} w={240} color="#c9a03c" />
        <Parasol x={g.x + g.W * 0.62} y={g.ground} s={g.s * 0.8} tiers={5} />
        <HorseGeneral x={g.x + g.W * 0.8} y={g.ground + 6 * g.s} scale={g.sc * 0.66} banner={GOLD} coat="#a8322a" flip />
        {[0.08, 0.18].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.72} hold={i ? "gun" : "spear"} phase={i} />)}
      </g>
    )}
  </Panel>
);

// Night breakout: the stockade is broken through, soldiers and townspeople run east (right) with torches.
export const BreakoutScene = ({ id, anchor, start, end, breakAt }: S & { breakAt: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={NIGHT} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [breakAt, end], [0, 1], clamp);
        const br = interpolate(frame, [breakAt, breakAt + 12], [0, 1], clamp);
        return (
          <g>
            <Moon x={g.x + g.W * 0.85} y={g.y + 70 * g.s} r={22 * g.s} />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2a3a" />
            <Palisade x0={g.x + g.W * 0.44} x1={g.x + g.W * 0.62} y={g.ground} s={g.s} gateAt={br > 0.5 ? g.x + g.W * 0.53 : undefined} />
            <Dust x={g.x + g.W * 0.53} y={g.ground} s={g.s} k={br} />
            <HorseGeneral x={g.x + g.W * (0.3 + m * 0.5)} y={g.ground + 8 * g.s} scale={g.sc * 0.66} banner={GOLD} coat="#2f4f86" gallop />
            {[0, 1, 2].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.06 + i * 0.09 + m * 0.5)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold={i % 2 ? "gun" : "spear"} walk phase={i} />)}
            {[0, 1].map((i) => <Townsperson key={i} x={g.x + g.W * (0.02 + i * 0.07 + m * 0.4)} y={g.ground + 8 * g.s} scale={g.sc * 0.7} walk woman={i === 1} load cloth="#5a4a3a" phase={i} />)}
            {[0.7, 0.86].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - 30 * g.s} size={40 * g.s} seed={i + 7} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The city taken: Burmese walk into an empty town (`burn` sets it alight).
export const TakenCityScene = ({ id, anchor, start, end, burn = 0 }: S & { burn?: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={burn ? ["#2a1a1a", "#c8461f"] : GREY} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Skyline g={g} color={burn ? "#3a2a2a" : "#6a5a50"} base={60} burn={burn} />
            <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill={burn ? "#3a2a1a" : "#8a7a6a"} />
            {burn > 0 && <Smoke x={g.cx} y={g.ground - 200 * g.s} size={240 * g.s} />}
            {[0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.05 + i * 0.1 + m * 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold={burn ? "torch" : "spear"} phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// A hungry, worn-out Burmese camp in the forest: soldiers sitting by empty pots.
export const HungryCampScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={GREY} accent={RED}>
    {(g) => (
      <g>
        <Mountains x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} h={160} seed="forest" />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#5a5a3a" />
        <SiegeCamp x={g.x + g.W * 0.7} y={g.ground} s={g.s * 0.8} w={200} phase={2} />
        {[0.2, 0.32].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 18 * g.s} ${g.ground} q${-6 * g.s} ${-36 * g.s} ${18 * g.s} ${-42 * g.s} q${24 * g.s} ${6 * g.s} ${18 * g.s} ${42 * g.s} Z`} fill="#6a4a2a" stroke={INK} strokeWidth={1.2 * g.s} />)}
        {[0.1, 0.44, 0.54].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.7} hold="none" pose="dig" cloth={BURMA_JACKET} band={BURMA_JACKET} phase={i} />)}
      </g>
    )}
  </Panel>
);

// A messenger galloping in with news (red banner), dust behind.
export const MessengerScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#5a4a3a", "#e0a868"]} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 10 * g.s} W={g.W} s={g.s} h={120} seed="ava" />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a6a3a" />
            <Dust x={g.x + g.W * (0.2 + m * 0.5)} y={g.ground} s={g.s} k={0.8} />
            <HorseGeneral x={g.x + g.W * (0.3 + m * 0.5)} y={g.ground + 8 * g.s} scale={g.sc * 0.7} banner={RED} coat={BURMA_JACKET} gallop />
            <text x={g.x + g.W - 70 * g.s} y={g.y + 130 * g.s} textAnchor="middle" fill={RED} fontFamily={font} fontWeight={900} fontSize={100 * g.s}>!</text>
          </g>
        );
      }}
    </Panel>
  );
};

// The pursuit: a Siamese general rides after Burmese soldiers fleeing left.
export const ChaseScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} h={150} seed="west" />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a7a4a" />
            {[0, 1, 2].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.3 + i * 0.1 - m * 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" flip phase={i} />)}
            <HorseGeneral x={g.x + g.W * (0.78 - m * 0.25)} y={g.ground + 8 * g.s} scale={g.sc * 0.7} banner={GOLD} coat="#a8322a" gallop flip />
            {[0, 1].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.9 + i * 0.08 - m * 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.72} hold="spear" walk flip phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The chronicle: a samut khoi folding book being written, a palm-leaf bundle beside it; optional stamp text.
export const ChronicleScene = ({ id, anchor, start, end, stamp }: S & { stamp?: string }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#3a2a1a", "#8a6a3a"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#5a3a22" />
          <SamutKhoi x={g.cx - 60 * g.s} y={g.ground - 30 * g.s} s={g.s} k={interpolate(frame, [start, start + 60], [0, 1], clamp)} />
          <PalmLeaf x={g.cx + 250 * g.s} y={g.ground - 20 * g.s} s={g.s * 0.6} />
          {stamp && <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>{stamp}</text>}
        </g>
      )}
    </Panel>
  );
};
