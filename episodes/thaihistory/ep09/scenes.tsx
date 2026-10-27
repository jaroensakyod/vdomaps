import { interpolate, useCurrentFrame } from "remotion";
import { Banner, Fighter, Glow, Grass, PAL, type Costume } from "../../../components/Scene";
import { clamp, GOLD, RED } from "../news/kit";
import { Moon } from "../news/Period";
import { Backdrop, Boat, Monk, PalaceWall, Prang, River, Smoke, Tree } from "../ep04/v2";
import { Reeds, Stars, Torch, Rain } from "../ep04/ch3_kit";
import { BackFigure } from "../ep05/ch1_kit5";
import { K, V6 } from "../ep06/scenes";
import { flashOf } from "./beatsKit";

// Episode 9 illustration panels (house style v2 via episode 6's V6). No faces of real people.

type P = { id: string; anchor: [number, number]; start: number; end: number };
const NORTH: Costume = { jacket: "#3a4a2a", sash: "#c9a060", pants: "#2a2420", head: "wrap", headColor: "#5a4a3a" };
const MONK_ARMY: Costume = { jacket: "#d9822b", sash: "#a85a1a", pants: "#d9822b", head: "short" };

// A slim boat: one or two paddlers low in the water.
const SlimBoat = ({ x, y, s, dir = 1, paddlers = 2, costume = NORTH }: { x: number; y: number; s: number; dir?: 1 | -1; paddlers?: number; costume?: Costume }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <path d={`M${-70 * s} ${-6 * s} Q0 ${10 * s} ${80 * s} ${-12 * s} L${70 * s} ${-2 * s} Q0 ${14 * s} ${-64 * s} ${2 * s} Z`} fill="#4a2e18" stroke={PAL.ink} strokeWidth={1.4 * s} />
      {Array.from({ length: paddlers }, (_, i) => (
        <g key={i}>
          <line x1={(-30 + i * 50) * s} y1={-20 * s} x2={(-44 + i * 50 + Math.sin(frame * 0.4 + i) * 10) * s} y2={14 * s} stroke="#4a2f18" strokeWidth={2.5 * s} />
          <Fighter x={(-30 + i * 50) * s} y={-4 * s} scale={s * 0.5} mode="stand" costume={costume} weapon={i === 0 ? "rifle" : "none"} phase={i} />
        </g>
      ))}
    </g>
  );
};

// Ambush on the flooded river: the big war boats in midstream, slim boats dart out of the grass and fire.
export const AmbushScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#5a6a8a", "#c8a880"]} accent={RED} hits={shots} warm={0.06}>
      {(g, pan, lt) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.3]} far="#5a6070" mid="#4a5a40" ground="#4a5a3a" mist="#d8d0c0" ridges={false} />
          <River g={g} y={g.ground - 40 * g.s} pan={pan} color="#4a6a80" />
          <Boat x={g.x + g.W * 0.55 + pan * 0.6} y={g.ground + 4 * g.s} w={240 * g.s} s={g.s} n={6} canopy gilt />
          <Boat x={g.x + g.W * 0.88 + pan * 0.6} y={g.ground - 6 * g.s} w={170 * g.s} s={g.s} n={4} />
          <Reeds g={g} y={g.ground + 30 * g.s} wind={0.15} shift={pan * 1.0} color="#3a5a2a" n={14} h={70} />
          {[0, 1].map((i) => <SlimBoat key={i} x={g.x + g.W * (0.06 + i * 0.16) + Math.min(lt, 80) * 0.8 * g.s + pan * 1.2} y={g.ground + (40 + i * 16) * g.s} s={g.s * 1.1} />)}
          {shots.map((f, i) => {
            const k = flashOf(frame, f);
            const fx = g.x + g.W * (0.14 + (i % 2) * 0.16) + Math.min(Math.max(0, f - p.start), 80) * 0.8 * g.s + pan * 1.2;
            return (
              <g key={f}>
                {k > 0 && <circle cx={fx + 30 * g.s} cy={g.ground + 10 * g.s} r={24 * g.s * k} fill="#ffd25a" opacity={0.75 * k} />}
                {frame >= f && frame < f + 80 && <Smoke x={fx + 30 * g.s} y={g.ground + 10 * g.s} s={g.s} n={3} />}
              </g>
            );
          })}
          <Reeds g={g} y={g.y + g.H + 8 * g.s} wind={0.2} shift={pan * 1.6} color="#2a4a1a" n={22} h={60} />
        </g>
      )}
    </V6>
  );
};

// The flooded central plain in the rainy season: water to the horizon, treetops, a line of boats.
export const FloodPlainScene = (p: P) => (
  <V6 {...p} sky={["#6a7a9a", "#c8c0b0"]} accent={GOLD} warm={0.04}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={null} far="#6a7080" mid="#5a6050" ground="#4a6a80" mist="#d8d8d0" ridges={false} />
        <River g={g} y={g.ground - 30 * g.s} pan={pan} color="#5a7a90" />
        {[0.1, 0.32, 0.7, 0.9].map((f) => <Tree key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 0.8} />)}
        {[0, 1, 2, 3].map((i) => <Boat key={i} x={g.x + g.W * (0.08 + i * 0.24) + lt * 0.5 * g.s + pan * 0.9} y={g.ground + (24 + (i % 2) * 14) * g.s} w={150 * g.s} s={g.s} n={4} />)}
        <Rain g={g} n={50} opacity={0.35} />
      </g>
    )}
  </V6>
);

// Pak Nam Pho: two rivers meeting, the fleet waiting at the junction.
export const JunctionScene = (p: P) => (
  <V6 {...p} sky={["#7a9ac0", "#f0d8a8"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#7a8a9a" mid="#5a6a48" ground="#6a5a38" mist="#fff0d0" />
        <path d={`M${g.x - 40 * g.s} ${g.ground - 10 * g.s} Q${g.x + g.W * 0.5} ${g.ground - 70 * g.s} ${g.x + g.W + 40 * g.s} ${g.ground - 30 * g.s} L${g.x + g.W + 40 * g.s} ${g.y + g.H + 10} L${g.x - 40 * g.s} ${g.y + g.H + 10} Z`} fill="#4a7a90" transform={`translate(${pan * 0.6},0)`} />
        <path d={`M${g.x + g.W * 0.35 + pan * 0.4} ${g.ground - 60 * g.s} L${g.x + g.W * 0.55 + pan * 0.4} ${g.ground - 120 * g.s} L${g.x + g.W * 0.62 + pan * 0.4} ${g.ground - 118 * g.s} L${g.x + g.W * 0.5 + pan * 0.4} ${g.ground - 50 * g.s} Z`} fill="#5a8aa0" />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.15 + i * 0.3) + pan * 0.9} y={g.ground + (20 + (i % 2) * 18) * g.s} w={170 * g.s} s={g.s} n={5} />)}
        <Banner x={g.x + g.W * 0.2 + pan * 0.9} y={g.ground + 8 * g.s} s={g.s * 0.8} color={GOLD} />
      </g>
    )}
  </V6>
);

// A northern officer in a slim boat at dawn, reading the river; the reeds hide the rest.
export const ScoutScene = (p: P) => (
  <V6 {...p} sky={["#3a4a7a", "#f0a868"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <Glow x={g.x + g.W * 0.8 + pan * 0.1} y={g.ground - 60 * g.s} s={g.s * 1.2} color="#ffa860" core="#ffe8c0" />
        <Backdrop g={g} pan={pan} light={null} far="#4a4a6a" mid="#3a4a3a" ground="#3a4a5a" mist="#f0b080" ridges={false} />
        <River g={g} y={g.ground - 20 * g.s} pan={pan} color="#3a5a7a" />
        <Reeds g={g} y={g.ground - 10 * g.s} wind={0.1} shift={pan * 0.5} color="#2a3a1a" n={24} h={80} />
        <SlimBoat x={g.x + g.W * 0.5 + pan * 0.9} y={g.ground + 30 * g.s} s={g.s * 1.3} paddlers={1} />
        <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.15} shift={pan * 1.6} color="#1a2a10" n={20} h={50} />
      </g>
    )}
  </V6>
);

// The king is hit: on the royal boat, attendants rush to a figure seen from behind; the banner dips.
export const WoundScene = ({ hit, ...p }: P & { hit: number }) => {
  const frame = useCurrentFrame();
  const dip = interpolate(frame, [hit + 10, hit + 40], [0, 1], clamp);
  return (
    <V6 {...p} sky={["#5a5a7a", "#c89070"]} accent={RED} hits={[hit]} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#5a5060" mid="#4a4a40" ground="#4a5a6a" mist="#e0c0a0" ridges={false} />
          <River g={g} y={g.ground - 20 * g.s} pan={pan} color="#4a6a80" />
          <path d={`M${g.x + g.W * 0.1 + pan * 0.8} ${g.ground} L${g.x + g.W * 0.9 + pan * 0.8} ${g.ground - 4 * g.s} Q${g.x + g.W * 0.85 + pan * 0.8} ${g.ground + 30 * g.s} ${g.x + g.W * 0.75 + pan * 0.8} ${g.ground + 30 * g.s} L${g.x + g.W * 0.2 + pan * 0.8} ${g.ground + 30 * g.s} Z`} fill="#b8862a" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <BackFigure x={g.x + g.W * 0.5 + pan * 0.8} y={g.ground} scale={g.sc * 0.4} robe="#7a1f1a" />
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.3 + i * 0.2) + (frame > hit ? (i - 1) * -0.03 * g.W : 0) + pan * 0.8} y={g.ground + 2 * g.s} scale={g.sc * 0.6} mode={frame > hit ? "run" : "stand"} costume={K.siam} flip={i === 2} phase={i} />)}
          <g transform={`rotate(${dip * 35},${g.x + g.W * 0.82 + pan * 0.8},${g.ground})`}>
            <Banner x={g.x + g.W * 0.82 + pan * 0.8} y={g.ground} s={g.s} color={GOLD} />
          </g>
        </g>
      )}
    </V6>
  );
};

// Retreat: the fleet turns downstream at dusk, oars dipping, smoke behind.
export const RetreatScene = (p: P) => (
  <V6 {...p} sky={["#3a3a5a", "#d8805a"]} accent={RED} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.ground - 50 * g.s} s={g.s * 1.2} color="#ff8a50" core="#ffd8a0" />
        <Backdrop g={g} pan={pan} light={null} far="#4a3a50" mid="#3a3438" ground="#3a3a40" mist="#e09070" ridges={false} />
        <Smoke x={g.x + g.W * 0.85 + pan * 0.4} y={g.ground - 30 * g.s} s={g.s} n={5} dark />
        <River g={g} y={g.ground - 14 * g.s} pan={pan} color="#3a4a6a" />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.75 - i * 0.25) - lt * 0.6 * g.s + pan * 0.9} y={g.ground + (18 + (i % 2) * 16) * g.s} w={170 * g.s} s={g.s} n={5} dir={-1} canopy={i === 0} gilt={i === 0} />)}
        <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.1} shift={pan * 1.6} color="#1a2018" n={20} h={50} />
      </g>
    )}
  </V6>
);

// Phitsanulok: the city wall on the Nan river, the great prang of the main temple behind.
export const PhitsanulokScene = ({ dusk = false, ...p }: P & { dusk?: boolean }) => (
  <V6 {...p} sky={dusk ? ["#3a3a5a", "#d8905a"] : ["#7aa0c8", "#f0d8a8"]} accent={GOLD} warm={dusk ? 0.12 : 0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={dusk ? [0.2, 0.4] : [0.85, 0.22]} far="#6a7a8a" mid="#4a5a40" ground="#6a5a38" mist="#fff0d0" />
        <Prang x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 40 * g.s} h={200 * g.s} s={g.s} gold />
        <PalaceWall x={g.x + g.W * 0.12 + pan * 0.6} y={g.ground - 10 * g.s} w={g.W * 0.76} h={50 * g.s} s={g.s} gateAt={0.5} color="#b8ad94" />
        <River g={g} y={g.ground - 4 * g.s} pan={pan} color="#4a7a90" />
        <SlimBoat x={g.x + g.W * 0.3 + pan * 1.2} y={g.ground + 34 * g.s} s={g.s} />
      </g>
    )}
  </V6>
);

// Fang's army of monks and followers surrounds the walls; the city starves.
export const MonkSiegeScene = (p: P) => (
  <V6 {...p} sky={["#8a8a9a", "#e0c8a0"]} accent={RED} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} far="#7a7a8a" mid="#5a5a48" ground="#8a7048" mist="#f0e0c0" />
        <Prang x={g.x + g.W * 0.7 + pan * 0.4} y={g.ground - 40 * g.s} h={150 * g.s} s={g.s} />
        <PalaceWall x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 10 * g.s} w={g.W * 0.5} h={46 * g.s} s={g.s} color="#a89a80" />
        {[0, 1, 2].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.1) + Math.min(lt, 120) * 0.5 * g.s + pan * 0.9} y={g.ground + 20 * g.s} scale={g.sc * 0.66} mode="walk" phase={i * 1.3} />)}
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.18 + i * 0.12) + Math.min(lt, 120) * 0.5 * g.s + pan * 1.1} y={g.ground + 32 * g.s} scale={g.sc * 0.68} mode="walk" costume={MONK_ARMY} phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// Night: a lone figure with a lantern opens the city gate from inside.
export const TraitorGateScene = ({ open, ...p }: P & { open: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [open, open + 40], [0, 1], clamp);
  return (
    <V6 {...p} sky={["#0b1026", "#2a2440"]} accent={RED} warm={0.04}>
      {(g, pan) => (
        <g>
          <Stars g={g} n={18} />
          <Moon x={g.x + g.W * 0.2} y={g.y + g.H * 0.2} r={14 * g.s} />
          <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1814" mist="#5a6a8a" ridges={false} />
          <PalaceWall x={g.x + g.W * 0.1 + pan * 0.6} y={g.ground + 8 * g.s} w={g.W * 0.8} h={90 * g.s} s={g.s} gateAt={0.5} gateOpen={k} color="#7a7468" />
          <Torch x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground + 8 * g.s} s={g.s * 0.8} h={50} seed={2} />
          <Fighter x={g.x + g.W * 0.44 + pan * 0.6} y={g.ground + 8 * g.s} scale={g.sc * 0.5} mode="stand" costume={K.villager} weapon="none" />
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.1) + k * g.W * 0.2 + pan * 1.1} y={g.ground + 36 * g.s} scale={g.sc * 0.66} mode={k > 0.2 ? "run" : "stand"} costume={MONK_ARMY} phase={i} />)}
        </g>
      )}
    </V6>
  );
};
