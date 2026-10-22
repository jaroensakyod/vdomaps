import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { QingSoldier } from "../news/ch5";
import { clamp, font, GOLD, Panel, RED, Skyline } from "../news/kit";
import { BellChedi, BurmeseSoldier, CityWall, Dust, Fire, Moon, SiegeCamp, Smoke } from "../news/Period";
import { Junk, Rain, Sampan, SiamSoldier, Townsperson, WallCannon, WarElephant, WaterBand } from "../news/Period2";
import { Parasol, Royal, ThaiPalace } from "../news/Period3";
import { HorseGeneral, Mountains, Palisade, StiltHouse } from "../news/Period4";
import { Villager } from "../news/Period5";

// Reusable illustration panels for episode 2, all parameterised by start / end (and a few by a cue frame),
// so chapters can place them on any spoken word. Panel overlap rule: pass the next panel's start + 14 as end.
const INK = "#1b1d24";
type S = { id: string; anchor: [number, number]; start: number; end: number };
const DAY: [string, string] = ["#3a6ea5", "#bfe0f2"];
const DUSK: [string, string] = ["#7a3a1a", "#f2b35e"];
const NIGHT: [string, string] = ["#0b1230", "#2a3a6a"];
export const TAK = "#ffc94a";

// Khmer stone sanctuary (Prasat Phimai): central tower on stepped bases + side towers.
const StoneCastle = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const tower = (cx: number, h: number) => (
    <g>
      <rect x={cx - h * 0.28} y={y - h * 0.35} width={h * 0.56} height={h * 0.35} fill="#b9ab92" stroke={INK} strokeWidth={1.4 * s} />
      <path d={`M${cx - h * 0.24} ${y - h * 0.35} Q${cx - h * 0.26} ${y - h * 0.82} ${cx} ${y - h} Q${cx + h * 0.26} ${y - h * 0.82} ${cx + h * 0.24} ${y - h * 0.35} Z`} fill="#c8bba2" stroke={INK} strokeWidth={1.4 * s} />
      {[0.5, 0.62, 0.74, 0.86].map((f) => <line key={f} x1={cx - h * 0.2} y1={y - h * f} x2={cx + h * 0.2} y2={y - h * f} stroke="#8a7d66" strokeWidth={1.2 * s} />)}
      <rect x={cx - h * 0.07} y={y - h * 0.3} width={h * 0.14} height={h * 0.3} fill="#4a3f30" />
    </g>
  );
  return (
    <g>
      <rect x={x - 230 * s} y={y - 40 * s} width={460 * s} height={40 * s} fill="#a89a80" stroke={INK} strokeWidth={1.4 * s} />
      {tower(x - 140 * s, 150 * s)}
      {tower(x + 140 * s, 150 * s)}
      {tower(x, 230 * s)}
    </g>
  );
};

// Lord on a war elephant before a city wall (Phitsanulok).
export const LordScene = ({ id, anchor, start, end, banner = "#4fa3ff" }: S & { banner?: string }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={banner}>
    {(g) => (
      <g>
        <Skyline g={g} color="#7a5a40" base={150} />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 50 * g.s} h={70 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#a8905e" />
        <WarElephant x={g.x + g.W * 0.45} y={g.ground + 6 * g.s} scale={g.sc * 0.62} side={banner} walk={false} />
        {[0.12, 0.78, 0.9].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} jacket={banner} hold="spear" phase={i} flip={fx > 0.5} />)}
      </g>
    )}
  </Panel>
);

// A monk leader before (or among) armed followers in saffron.
export const MonkArmyScene = ({ id, anchor, start, end, stamp }: S & { stamp?: string }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={["#8a5a2a", "#f2c27a"]} accent="#b45ad9">
    {(g) => (
      <g>
        <Mountains x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} h={130} seed="fang" />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a7a4a" />
        {[0.08, 0.2, 0.32, 0.68, 0.8, 0.92].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "sword" : "spear"} cloth="#e0861f" band="#e0861f" skin="#b97c53" flip={fx > 0.5} phase={i} />)}
        <g transform={`translate(${g.cx},${g.ground + 6 * g.s})`}>
          <path d={`M${-16 * g.sc} 0 L${-17 * g.sc} ${-80 * g.sc} Q0 ${-90 * g.sc} ${17 * g.sc} ${-80 * g.sc} L${16 * g.sc} 0 Z`} fill="#e0861f" stroke={INK} strokeWidth={1.5 * g.s} />
          <circle cx={0} cy={-96 * g.sc} r={11 * g.sc} fill="#c98f62" stroke={INK} strokeWidth={1.4 * g.s} />
        </g>
        {stamp && <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>{stamp}</text>}
      </g>
    )}
  </Panel>
);

// Phimai: the stone sanctuary, a prince under a parasol, elephants passing.
export const CastleScene = ({ id, anchor, start, end, battle = 0 }: S & { battle?: number }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={battle ? ["#5a2a1a", "#d98a4a"] : DUSK} accent="#3fbf6a">
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#9a8a5a" />
        <StoneCastle x={g.x + g.W * 0.62} y={g.ground - 26 * g.s} s={g.s * 0.8} />
        {battle ? (
          <>
            {[0, 1, 2].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.08 + i * 0.1)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "gun" : "spear"} walk phase={i} />)}
            <HorseGeneral x={g.x + g.W * 0.38} y={g.ground + 6 * g.s} scale={g.sc * 0.7} banner={TAK} coat="#a8322a" gallop />
            <Smoke x={g.x + g.W * 0.62} y={g.ground - 140 * g.s} size={150 * g.s} />
          </>
        ) : (
          <>
            <Royal x={g.x + g.W * 0.22} y={g.ground + 6 * g.s} scale={g.sc * 0.85} robe="#2f4f86" side="#7a2f4a" />
            <Parasol x={g.x + g.W * 0.27} y={g.ground + 4 * g.s} s={g.s * 0.8} tiers={3} />
            <WarElephant x={g.x + g.W * 0.92} y={g.ground + 6 * g.s} scale={g.sc * 0.5} flip />
          </>
        )}
      </g>
    )}
  </Panel>
);

// Nakhon Si Thammarat: the great white reliquary and the harbour.
export const NakhonScene = ({ id, anchor, start, end, captured = false }: S & { captured?: boolean }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={captured ? DUSK : DAY} accent="#ff8a2a">
    {(g) => (
      <g>
        <BellChedi x={g.x + g.W * 0.3} y={g.ground - 30 * g.s} h={250 * g.s} color="#f4efe2" />
        <path d={`M${g.x + g.W * 0.3 - 5 * g.s} ${g.ground - 30 * g.s - 250 * g.s * 0.5} L${g.x + g.W * 0.3} ${g.ground - 30 * g.s - 250 * g.s} L${g.x + g.W * 0.3 + 5 * g.s} ${g.ground - 30 * g.s - 250 * g.s * 0.5} Z`} fill="#e2b84a" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W * 0.55} height={g.H} fill="#b49a6a" />
        <WaterBand x={g.x + g.W * 0.55} y={g.ground - 30 * g.s} W={g.W * 0.45} H={g.H} s={g.s} color="#3d8fc4" />
        {captured ? (
          [0, 1, 2].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.12 + i * 0.12)} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="spear" jacket="#a8322a" phase={i} />)
        ) : (
          <Townsperson x={g.x + g.W * 0.45} y={g.ground + 6 * g.s} scale={g.sc * 0.8} cloth="#b5532e" walk={false} />
        )}
        <Sampan x={g.x + g.W * 0.78} y={g.ground + 4 * g.s} scale={g.sc * 0.7} people={2} cargo />
      </g>
    )}
  </Panel>
);

// Shipyard on the beach (hull on frames, Thai and Chinese carpenters, timber pile).
export const ShipyardScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={["#4fa3d4", "#d8eef6"]} accent={TAK}>
    {(g) => (
      <g>
        <WaterBand x={g.x} y={g.ground - 70 * g.s} W={g.W} H={g.H} s={g.s} color="#3d8fc4" />
        <path d={`M${g.x} ${g.ground - 24 * g.s} L${g.x + g.W} ${g.ground - 14 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#e9d8a6" />
        <path d={`M${g.cx - 150 * g.s} ${g.ground - 46 * g.s} Q${g.cx} ${g.ground + 12 * g.s} ${g.cx + 160 * g.s} ${g.ground - 52 * g.s}`} fill="none" stroke="#7a4a28" strokeWidth={16 * g.s} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={g.cx - 126 * g.s + i * 30 * g.s} y1={g.ground - 38 * g.s} x2={g.cx - 130 * g.s + i * 30 * g.s} y2={g.ground - 92 * g.s} stroke="#7a4a28" strokeWidth={4 * g.s} />)}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={g.x + g.W * 0.82} y={g.ground - (20 + i * 14) * g.s} width={130 * g.s} height={12 * g.s} rx={6 * g.s} fill="#9a6a3c" stroke={INK} strokeWidth={g.s} />)}
        <Townsperson x={g.x + g.W * 0.14} y={g.ground - 14 * g.s} scale={g.sc * 0.75} walk={false} cloth="#5a4a2a" />
        <g transform={`translate(${g.x + g.W * 0.72},${g.ground - 12 * g.s})`}><Townsperson x={0} y={0} scale={g.sc * 0.75} walk={false} flip shirt="#2f5aa8" cloth="#1b1d24" /></g>
      </g>
    )}
  </Panel>
);

// A fleet under way (n boats, optional junk), moving left → right.
export const FleetScene = ({ id, anchor, start, end, n = 4, junk = false, sky = ["#4fa3d4", "#d8eef6"] as [string, string], night = false }: S & { n?: number; junk?: boolean; sky?: [string, string]; night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={night ? NIGHT : sky} accent={TAK}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            {night && <Moon x={g.x + g.W * 0.85} y={g.y + 80 * g.s} r={24 * g.s} />}
            <WaterBand x={g.x} y={g.ground - 70 * g.s} W={g.W} H={g.H} s={g.s} color={night ? "#1d3d5a" : "#3d8fc4"} />
            {junk && <Junk x={g.x + g.W * (0.7 + m * 0.1)} y={g.ground - 30 * g.s} scale={g.sc * 0.55} />}
            {Array.from({ length: n }, (_, i) => (
              <Sampan key={i} x={g.x + g.W * (0.06 + i * (0.8 / n) + m * 0.12)} y={g.ground - 40 * g.s + (i % 2) * 26 * g.s} scale={g.sc * 0.75} people={2} phase={i} flip />
            ))}
          </g>
        );
      }}
    </Panel>
  );
};

// Soldiers storming a gate; the wall breaks at `breakAt` (frame).
export const AssaultScene = ({ id, anchor, start, end, breakAt, attackers = "thai", wood = false, night = false }: S & { breakAt: number; attackers?: "thai" | "burma"; wood?: boolean; night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={night ? ["#1a1030", "#8a2f1a"] : DUSK} accent={attackers === "thai" ? TAK : RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        const br = interpolate(frame, [breakAt, breakAt + 14], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4a32" />
            {wood ? <Palisade x0={g.x + g.W * 0.58} x1={g.x + g.W + 10 * g.s} y={g.ground} s={g.s} gateAt={br > 0.5 ? g.x + g.W * 0.72 : undefined} /> : <CityWall x0={g.x + g.W * 0.58} x1={g.x + g.W + 10 * g.s} ground={g.ground - 6 * g.s} h={110 * g.s} s={g.s} breach={br} bx={g.x + g.W * 0.72} />}
            <Dust x={g.x + g.W * 0.72} y={g.ground} s={g.s} k={interpolate(frame, [breakAt, breakAt + 25], [0, 1], clamp)} />
            {[0, 1, 2, 3].map((i) =>
              attackers === "thai" ? (
                <SiamSoldier key={i} x={g.x + g.W * (0.05 + i * 0.1 + m * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "gun" : "spear"} walk phase={i} />
              ) : (
                <BurmeseSoldier key={i} x={g.x + g.W * (0.05 + i * 0.1 + m * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "torch" : "spear"} phase={i} />
              ),
            )}
            {attackers === "thai" && <HorseGeneral x={g.x + g.W * (0.02 + m * 0.3)} y={g.ground + 8 * g.s} scale={g.sc * 0.7} banner={TAK} coat="#a8322a" gallop />}
            {br > 0 && <Fire x={g.x + g.W * 0.86} y={g.ground - 60 * g.s} size={70 * g.s * br} seed={3} />}
          </g>
        );
      }}
    </Panel>
  );
};

// A camp on fire (Pho Sam Ton, Bang Kung siege lines).
export const CampFireScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={["#2a1a1a", "#c8461f"]} accent={TAK}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a1a" />
        <SiegeCamp x={g.x + g.W * 0.45} y={g.ground} s={g.s * 1.1} w={300} />
        {[0.25, 0.45, 0.65].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - 30 * g.s} size={90 * g.s} seed={i} />)}
        <Smoke x={g.x + g.W * 0.45} y={g.ground - 120 * g.s} size={180 * g.s} />
        <HorseGeneral x={g.x + g.W * 0.85} y={g.ground + 6 * g.s} scale={g.sc * 0.7} banner={TAK} coat="#a8322a" flip />
      </g>
    )}
  </Panel>
);

// People: "hunger" (empty jars, queue with bowls), "rice" (sacks from a junk handed out), "cheer", "walk" (refugees).
export const PeopleScene = ({ id, anchor, start, end, mode }: S & { mode: "hunger" | "rice" | "cheer" | "walk" }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={mode === "hunger" ? ["#8a8a7a", "#d9d2bc"] : DAY} accent={TAK}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            {mode === "rice" && <WaterBand x={g.x} y={g.ground - 80 * g.s} W={g.W} H={g.H} s={g.s} color="#3d8fc4" />}
            {mode === "rice" && <Junk x={g.x + g.W * 0.2} y={g.ground - 50 * g.s} scale={g.sc * 0.6} />}
            <rect x={g.x} y={g.ground - (mode === "rice" ? 40 : 20) * g.s} width={g.W} height={g.H} fill="#a08a6a" />
            {mode === "hunger" && [0.1, 0.18, 0.26].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 18 * g.s} ${g.ground} q${-6 * g.s} ${-40 * g.s} ${18 * g.s} ${-46 * g.s} q${24 * g.s} ${6 * g.s} ${18 * g.s} ${46 * g.s} Z`} fill="#8a5a32" stroke={INK} strokeWidth={1.2 * g.s} />)}
            {mode === "rice" && Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={g.x + g.W * (0.42 + (i % 4) * 0.05)} cy={g.ground - (12 + Math.floor(i / 4) * 24) * g.s} rx={22 * g.s} ry={15 * g.s} fill="#e3cf9e" stroke={INK} strokeWidth={1.2 * g.s} />)}
            {[0, 1, 2, 3].map((i) => (
              <Townsperson key={i} x={g.x + g.W * (mode === "walk" ? 0.1 + i * 0.14 + m * 0.2 : 0.62 + i * 0.09)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} walk={mode === "walk"} flip={mode !== "walk"} woman={i % 2 === 1} load={mode === "rice" && i === 0} cloth={["#6b5a44", "#7a2f4a", "#2f4f6b", "#b5532e"][i]} phase={i} />
            ))}
            {mode === "cheer" && [0.1, 0.25, 0.4].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="none" pose="cheer" phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// River fort (Wichai Prasit): bastion wall on the bank with guns facing the water.
export const RiverFortScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={DAY} accent={TAK}>
      {(g) => (
        <g>
          <WaterBand x={g.x} y={g.ground - 30 * g.s} W={g.W} H={g.H} s={g.s} />
          <path d={`M${g.x + g.W * 0.45} ${g.ground - 30 * g.s} L${g.x + g.W * 0.5} ${g.ground - 140 * g.s} L${g.x + g.W + 10 * g.s} ${g.ground - 140 * g.s} L${g.x + g.W + 10 * g.s} ${g.ground - 30 * g.s} Z`} fill="#e9e1cf" stroke={INK} strokeWidth={1.6 * g.s} />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${g.x + g.W * 0.5 + i * 32 * g.s} ${g.ground - 140 * g.s} l0 ${-14 * g.s} q${10 * g.s} ${-14 * g.s} ${20 * g.s} 0 l0 ${14 * g.s} Z`} fill="#efe8d8" stroke={INK} strokeWidth={1.3 * g.s} />)}
          {[0.55, 0.72].map((fx, i) => <WallCannon key={i} x={g.x + g.W * fx} y={g.ground - 98 * g.s} s={g.sc * 0.9} flip fire={((frame - start + i * 25) % 60) / 18} />)}
          <SiamSoldier x={g.x + g.W * 0.88} y={g.ground - 140 * g.s} scale={g.sc * 0.7} hold="gun" flip />
          <Sampan x={g.x + g.W * 0.2} y={g.ground - 10 * g.s} scale={g.sc * 0.7} people={2} phase={2} />
        </g>
      )}
    </Panel>
  );
};

// Coronation, seen from a distance: throne under tiered parasols, courtiers kneeling.
export const CrownScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={["#c98a2a", "#fbe3a0"]} accent={TAK}>
    {(g) => (
      <g>
        <ThaiPalace x={g.cx} y={g.ground - 30 * g.s} s={g.s * 0.55} />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a3324" />
        <Royal x={g.cx} y={g.ground - 4 * g.s} scale={g.sc * 0.8} pose="sit" robe="#e2b84a" />
        <Parasol x={g.cx - 80 * g.s} y={g.ground} s={g.s * 0.9} tiers={7} />
        <Parasol x={g.cx + 80 * g.s} y={g.ground} s={g.s * 0.9} tiers={7} />
        {[0.12, 0.24, 0.76, 0.88].map((fx, i) => <Villager key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.6} hold="none" pose="dig" cloth="#2f4f86" band="#2f4f86" flip={fx > 0.5} phase={i} />)}
      </g>
    )}
  </Panel>
);

// Chinese defenders on a timber palisade, Burmese below.
export const ChineseCampScene = ({ id, anchor, start, end, relieved = 0 }: S & { relieved?: number }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={DUSK} accent={TAK}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#6a5a3a" />
        <Palisade x0={g.x + g.W * 0.5} x1={g.x + g.W + 10 * g.s} y={g.ground} s={g.s} />
        {[0.58, 0.72, 0.86].map((fx, i) => <QingSoldier key={i} x={g.x + g.W * fx} y={g.ground - 60 * g.s} scale={g.sc * 0.65} phase={i} flip />)}
        {relieved < 1 && [0.1, 0.22, 0.34].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * (fx - relieved * 0.3)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "torch" : "spear"} flip={relieved > 0} phase={i} />)}
        {relieved > 0 && <HorseGeneral x={g.x + g.W * (0.05 + relieved * 0.25)} y={g.ground + 8 * g.s} scale={g.sc * 0.7} banner={TAK} coat="#a8322a" gallop />}
      </g>
    )}
  </Panel>
);

// Retreat to the boats (the defeat at Koei Chai), no wounds shown.
export const RetreatBoatsScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#5a6676", "#c8a888"]} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <WaterBand x={g.x} y={g.ground - 40 * g.s} W={g.W * 0.45} H={g.H} s={g.s} />
            <rect x={g.x + g.W * 0.45} y={g.ground - 20 * g.s} width={g.W * 0.55} height={g.H} fill="#8a7a4a" />
            {[0, 1].map((i) => <Sampan key={i} x={g.x + g.W * (0.12 + i * 0.18)} y={g.ground - 20 * g.s + i * 18 * g.s} scale={g.sc * 0.75} people={2} phase={i} />)}
            {[0, 1, 2].map((i) => <SiamSoldier key={i} x={g.x + g.W * (0.6 + i * 0.1 - m * 0.12)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" flip walk phase={i} />)}
            <Smoke x={g.x + g.W * 0.92} y={g.ground - 60 * g.s} size={140 * g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// Misty forest path, a robed figure fading out — "no one knows where he ended".
export const VanishScene = ({ id, anchor, start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#6a7a80", "#c8d0d0"]} accent="#b45ad9">
      {(g) => {
        const fade = interpolate(frame, [start + 20, end - 10], [1, 0], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground} W={g.W} s={g.s} h={200} seed="mist" />
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#dfe6e6" opacity={0.45} />
            <g opacity={fade} transform={`translate(${g.cx + (1 - fade) * 60 * g.s},${g.ground})`}>
              <path d={`M${-14 * g.sc} 0 L${-15 * g.sc} ${-76 * g.sc} Q0 ${-86 * g.sc} ${15 * g.sc} ${-76 * g.sc} L${14 * g.sc} 0 Z`} fill="#e0861f" />
              <circle cx={0} cy={-92 * g.sc} r={10 * g.sc} fill="#c98f62" />
            </g>
            <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={60 * g.s} fill="#eef2f2" opacity={0.6} />
            <text x={g.x + g.W - 70 * g.s} y={g.y + 130 * g.s} textAnchor="middle" fill={GOLD} fontFamily={font} fontWeight={900} fontSize={110 * g.s}>?</text>
          </g>
        );
      }}
    </Panel>
  );
};

// An audience: a ruler kneels before the throne (seen from far, small figures).
export const AudienceScene = ({ id, anchor, start, end }: S) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={["#c98a2a", "#fbe3a0"]} accent={TAK}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a3324" />
        <Royal x={g.x + g.W * 0.72} y={g.ground - 4 * g.s} scale={g.sc * 0.7} pose="sit" robe="#e2b84a" />
        <Parasol x={g.x + g.W * 0.82} y={g.ground} s={g.s * 0.8} tiers={7} />
        <Villager x={g.x + g.W * 0.4} y={g.ground + 6 * g.s} scale={g.sc * 0.75} hold="none" pose="dig" cloth="#b5532e" band="#ff8a2a" />
        {[0.12, 0.22].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc * 0.7} hold="spear" phase={i} />)}
      </g>
    )}
  </Panel>
);

void Rain;
void StiltHouse;
export type { InsetGeom };
