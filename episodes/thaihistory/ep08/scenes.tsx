import { useCurrentFrame } from "remotion";
import { Banner, Fighter, Glow, Grass, PAL } from "../../../components/Scene";
import { GOLD, RED } from "../news/kit";
import { Moon, RuinedPrang, SiegeCamp } from "../news/Period";
import { Backdrop, Boat, Fire, Hall, Monk, Noble, Palisade, Prang, River, Smoke, Tree } from "../ep04/v2";
import { Elephant, Parasol } from "../ep04/ch1_kit";
import { Ladder, Reeds, Stars, Tent, Torch } from "../ep04/ch3_kit";
import { BackFigure, Mangroves } from "../ep05/ch1_kit5";
import { PalaceRoof } from "../ep05/kit5";
import { K, V6 } from "../ep06/scenes";
import { flashOf } from "./beatsKit";

// Episode 8 illustration panels (house style v2, episode 6's V6 wrapper and costumes). No faces of real people.

type P = { id: string; anchor: [number, number]; start: number; end: number };

// The Burmese main army marches home north: elephants, banners, a long dusty column.
export const MarchHomeScene = (p: P) => (
  <V6 {...p} sky={["#8a9ab8", "#f0c890"]} accent={RED} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.3]} far="#6a6a8a" mid="#5a5a48" ground="#9a8050" mist="#ffe0b0" />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.1 + i * 0.16) - lt * 0.3 * g.s + pan * 0.4} cy={g.ground - 20 * g.s} r={(30 + (i % 3) * 10) * g.s} fill="#c8a878" opacity={0.35} />)}
        <Elephant x={g.x + g.W * 0.6 - lt * 0.5 * g.s + pan * 0.6} y={g.ground + 2 * g.s} scale={g.sc * 0.48} rider="#a8322a" flip />
        {[0, 1].map((i) => <Banner key={i} x={g.x + g.W * (0.3 + i * 0.4) - lt * 0.55 * g.s + pan * 0.8} y={g.ground + 14 * g.s} s={g.s} color={RED} />)}
        {Array.from({ length: 9 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.05 + i * 0.12) - lt * 0.6 * g.s + pan * 0.9} y={g.ground + 22 * g.s} scale={g.sc * 0.58} mode="walk" costume={K.burma} flip phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#6a5a2a" />
      </g>
    )}
  </V6>
);

// Pho Sam Ton: a Burmese stockade by the river, the ruins of the old capital on the skyline.
export const SukiCampScene = (p: P) => (
  <V6 {...p} sky={["#6a7a9a", "#e8b880"]} accent={RED} warm={0.1}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.35]} lightColor={["#ffb070", "#ffe8c0"]} far="#6a6070" mid="#5a5040" ground="#7a6040" mist="#ffd8a0" />
        <RuinedPrang x={g.x + g.W * 0.18 + pan * 0.3} y={g.ground - 30 * g.s} h={150 * g.s} s={g.s} />
        <RuinedPrang x={g.x + g.W * 0.32 + pan * 0.3} y={g.ground - 30 * g.s} h={110 * g.s} s={g.s} />
        <SiegeCamp x={g.x + g.W * 0.66 + pan * 0.6} y={g.ground - 4 * g.s} s={g.s * 0.8} w={260} phase={2} />
        <River g={g} y={g.ground + 4 * g.s} pan={pan} color="#4a6a80" />
        <Fighter x={g.x + g.W * 0.5 + pan * 0.8} y={g.ground + 2 * g.s} scale={g.sc * 0.5} mode="stand" costume={K.burma} flip />
      </g>
    )}
  </V6>
);

// Thonburi under the Burmese: a local governor in a hall, Burmese soldiers at the door.
export const ThonginScene = (p: P) => (
  <V6 {...p} sky={["#3a2a1a", "#7a4a2a"]} accent={RED} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2414" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 40 * g.s} w={g.W * 0.9} s={g.s} glow={0.4} />
        <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#4a2e1a" />
        <Noble x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="sit" jacket="#c9b48a" />
        {[0.12, 0.86].map((f, i) => <Fighter key={f} x={g.x + g.W * f + pan * 1.1} y={g.ground + 26 * g.s} scale={g.sc * 0.74} mode="stand" costume={K.burma} flip={i === 1} />)}
      </g>
    )}
  </V6>
);

// River mouth at dawn: the war boats glide in between the mangroves.
export const RiverMouthScene = (p: P) => (
  <V6 {...p} sky={["#3a4a7a", "#f0a868"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.8 + pan * 0.1} y={g.ground - 60 * g.s} s={g.s * 1.2} color="#ffa860" core="#ffe8c0" />
        <Mangroves g={g} pan={pan * 0.5} color="#1e2a1a" />
        <River g={g} y={g.ground - 10 * g.s} pan={pan} color="#4a6a8a" />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.1 + i * 0.28) + lt * 0.6 * g.s + pan * 0.9} y={g.ground + (16 + (i % 2) * 18) * g.s} w={180 * g.s} s={g.s} n={5} />)}
        <Banner x={g.x + g.W * 0.38 + lt * 0.6 * g.s + pan * 0.9} y={g.ground + 4 * g.s} s={g.s * 0.8} color={GOLD} />
      </g>
    )}
  </V6>
);

// A European-style bastion on the river bank (Thonburi fort), river in front.
const Fort = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    <path d={`M${x} ${y} L${x + w * 0.08} ${y - 60 * s} L${x + w * 0.92} ${y - 60 * s} L${x + w} ${y} Z`} fill="#c8b898" stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x + w * (0.1 + i * 0.1)} y={y - 72 * s} width={w * 0.06} height={12 * s} fill="#c8b898" stroke={PAL.ink} strokeWidth={1.4 * s} />)}
    {[0.3, 0.55, 0.8].map((f) => <rect key={f} x={x + w * f} y={y - 40 * s} width={14 * s} height={8 * s} fill="#2a2018" />)}
  </g>
);
export const FortScene = (p: P) => (
  <V6 {...p} sky={["#7aa0c8", "#f0d8a8"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.15, 0.25]} far="#7a8a9a" mid="#5a6a48" ground="#7a6040" mist="#fff0d0" ridges={false} />
        <Tree x={g.x + g.W * 0.08 + pan * 0.4} y={g.ground - 30 * g.s} s={g.s} kind="palm" />
        <Fort x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.55} s={g.s} />
        <River g={g} y={g.ground - 16 * g.s} pan={pan} color="#4a7a90" />
        <Boat x={g.x + g.W * 0.25 + pan * 1.0} y={g.ground + 34 * g.s} w={160 * g.s} s={g.s} n={4} />
      </g>
    )}
  </V6>
);

// Boats storm the fort: muskets flash from both sides (rise 3 frames, fade 14), men climb the bank.
export const FortAssaultScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#6a8ab0", "#e8c890"]} accent={RED} hits={shots} warm={0.08}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.85, 0.25]} far="#7a8a9a" mid="#5a6a48" ground="#7a6040" mist="#fff0d0" ridges={false} />
          <Fort x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 20 * g.s} w={g.W * 0.5} s={g.s} />
          {shots.map((f, i) => {
            const k = flashOf(frame, f);
            return (
              <g key={f}>
                {k > 0 && <circle cx={g.x + g.W * (0.6 + (i % 3) * 0.1) + pan * 0.5} cy={g.ground - 60 * g.s} r={22 * g.s * k} fill="#ffd25a" opacity={0.75 * k} />}
                {frame >= f && frame < f + 90 && <Smoke x={g.x + g.W * (0.6 + (i % 3) * 0.1) + pan * 0.5} y={g.ground - 60 * g.s} s={g.s} n={3} />}
              </g>
            );
          })}
          <River g={g} y={g.ground - 10 * g.s} pan={pan} color="#4a7a90" />
          {[0, 1].map((i) => <Boat key={i} x={g.x + g.W * (0.12 + i * 0.22) + pan * 0.9} y={g.ground + (22 + i * 14) * g.s} w={170 * g.s} s={g.s} n={5} />)}
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.38 + i * 0.06) + pan * 0.8} y={g.ground - 14 * g.s} scale={g.sc * 0.5} mode="run" costume={i === 1 ? K.chinese : K.siam} phase={i} />)}
        </g>
      )}
    </V6>
  );
};

// Rowing upriver at dusk past the ruined temples of the old capital.
export const UpriverScene = (p: P) => (
  <V6 {...p} sky={["#3a3a6a", "#f09060"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.ground - 50 * g.s} s={g.s * 1.2} color="#ff9a50" core="#ffe0b0" />
        <Backdrop g={g} pan={pan} light={null} far="#4a4060" mid="#3a3440" ground="#3a3020" mist="#f0a070" ridges={false} />
        <RuinedPrang x={g.x + g.W * 0.7 + pan * 0.4} y={g.ground - 24 * g.s} h={140 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.9 + pan * 0.4} y={g.ground - 24 * g.s} s={g.s} />
        <River g={g} y={g.ground - 14 * g.s} pan={pan} color="#3a4a6a" />
        {[0, 1, 2].map((i) => <Boat key={i} x={g.x + g.W * (0.05 + i * 0.25) + lt * 0.5 * g.s + pan * 0.9} y={g.ground + (20 + (i % 2) * 16) * g.s} w={170 * g.s} s={g.s} n={5} />)}
        <Reeds g={g} y={g.y + g.H + 6 * g.s} wind={0.15} shift={pan * 1.6} color="#2a3a1a" n={20} h={50} />
      </g>
    )}
  </V6>
);

// Two camps across a canal: Burmese stockade on the west bank, gold banners already on the east bank.
export const TwoCampsScene = (p: P) => (
  <V6 {...p} sky={["#7a9ac0", "#f0d8a8"]} accent={GOLD} warm={0.08}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#7a8a9a" mid="#5a6a48" ground="#7a6040" mist="#fff0d0" ridges={false} />
        <SiegeCamp x={g.x + g.W * 0.22 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 0.7} w={220} phase={1} />
        <rect x={g.x + g.W * 0.44 + pan * 0.5} y={g.ground - 14 * g.s} width={g.W * 0.12} height={g.H} fill="#4a7a90" />
        <Palisade x={g.x + g.W * 0.6 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.36} s={g.s * 0.8} color="#8a6a3a" />
        {[0.66, 0.8, 0.94].map((f) => <Banner key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 4 * g.s} s={g.s} color={GOLD} />)}
        <Grass g={g} shift={pan * 1.6} color="#5a5a2a" />
      </g>
    )}
  </V6>
);

// The Chinese vanguard storms the west stockade with ladders; defenders fire from the posts (soft flashes).
export const VanguardScene = ({ shots, ...p }: P & { shots: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#8a9ab8", "#f0d0a0"]} accent={RED} hits={shots} warm={0.1}>
      {(g, pan) => {
        const wx = g.x + g.W * 0.55 + pan * 0.6;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.8, 0.22]} far="#7a7a8a" mid="#5a5a48" ground="#8a7048" mist="#fff0d0" />
            <Palisade x={wx} y={g.ground + 4 * g.s} w={g.W * 0.5} s={g.s * 1.4} color="#7a5a32" />
            {[0, 1, 2].map((i) => <Fighter key={i} x={wx + (40 + i * 80) * g.s} y={g.ground - 74 * g.s} scale={g.sc * 0.44} mode="aim" costume={K.burma} weapon="rifle" flip flash={Math.max(...shots.map((f, j) => (j % 3 === i ? flashOf(frame, f) : 0)))} phase={i} />)}
            <Ladder x={wx - 40 * g.s} y={g.ground + 30 * g.s} x2={wx + 10 * g.s} y2={g.ground - 70 * g.s} s={g.s} />
            {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.1) + pan * 1.0} y={g.ground + 30 * g.s} scale={g.sc * 0.66} mode={i % 2 ? "attack" : "run"} costume={i === 4 ? K.siam : K.chinese} phase={i} />)}
            <Banner x={g.x + g.W * 0.06 + pan * 1.0} y={g.ground + 28 * g.s} s={g.s} color={GOLD} />
            <Grass g={g} shift={pan * 1.6} color="#5a5a2a" />
          </g>
        );
      }}
    </V6>
  );
};

// Noon: the stockade burns, the last defenders run; the gold banner goes up over the gate.
export const CampFallsScene = (p: P) => (
  <V6 {...p} sky={["#8aa0c0", "#f4dcb0"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.5, 0.12]} far="#7a7a8a" mid="#5a5a48" ground="#8a7048" mist="#fff0d0" />
        <Palisade x={g.x + g.W * 0.3 + pan * 0.6} y={g.ground + 2 * g.s} w={g.W * 0.6} s={g.s * 1.2} color="#6a4a2a" />
        {[0.4, 0.6, 0.8].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground - 60 * g.s} h={(34 + i * 6) * g.s} seed={i * 2} />)}
        <Smoke x={g.x + g.W * 0.6 + pan * 0.6} y={g.ground - 90 * g.s} s={g.s * 1.3} n={7} dark />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.7 + i * 0.08) + lt * 1.2 * g.s + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.5} mode="run" costume={K.burma} phase={i} />)}
        <Banner x={g.x + g.W * 0.45 + pan * 0.6} y={g.ground - 66 * g.s} s={g.s * 1.2} color={GOLD} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.12) + pan * 1.1} y={g.ground + 32 * g.s} scale={g.sc * 0.7} mode="stand" costume={i === 1 ? K.siam : K.chinese} phase={i} />)}
      </g>
    )}
  </V6>
);

// A noble kneels before a plain pavilion; another figure, seen from behind, receives him.
export const SubmitScene = ({ pale = false, ...p }: P & { pale?: boolean }) => (
  <V6 {...p} sky={pale ? ["#5a5a6a", "#a8a090"] : ["#2a1a18", "#6a3a2a"]} accent={GOLD} warm={pale ? 0.04 : 0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill={pale ? "#4a4642" : "#3a2418"} />
        <Hall x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 30 * g.s} w={g.W * 0.55} s={g.s} roof="#5a3a20" wall={pale ? "#8a8478" : "#8a6a4a"} glow={pale ? 0 : 0.5} />
        {!pale && <BackFigure x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 0.36} robe="#7a1f1a" crown={false} />}
        <rect x={g.x - 40 * g.s} y={g.ground - 4 * g.s} width={g.W + 80 * g.s} height={g.H} fill={pale ? "#3a3632" : "#2a1a10"} />
        {(pale ? [0, 1, 2, 3] : [0, 1]).map((i) => <Noble key={i} x={g.x + g.W * (pale ? 0.12 + i * 0.24 : 0.3 + i * 0.4) + pan * 1.4} y={g.ground + 26 * g.s} scale={g.sc * 0.66} mode={pale ? "sit" : "prostrate"} jacket={pale ? "#b8b0a0" : "#efe6d0"} phase={i} />)}
      </g>
    )}
  </V6>
);

// Royal cremation: a pyre under a tiered roof, monks seated in a row, smoke rising (fire is a slow sine).
export const CremationScene = (p: P) => (
  <V6 {...p} sky={["#4a4a6a", "#e8a070"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.4]} lightColor={["#ffa060", "#ffe0b0"]} far="#5a5070" mid="#4a4440" ground="#5a4a34" mist="#f0b080" ridges={false} />
        <Smoke x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 140 * g.s} s={g.s * 1.4} n={7} />
        <PalaceRoof x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.26} s={g.s * 0.7} color={PAL.gilt} wall="#e8dcc0" />
        <Fire x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 20 * g.s} h={46 * g.s} seed={3} />
        {[0, 1, 2, 3, 4].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.21) + pan * 1.2} y={g.ground + 30 * g.s} scale={g.sc * 0.62} mode="sit" phase={i} />)}
      </g>
    )}
  </V6>
);

// Riding through the ruins: an elephant among broken prangs, scattered white bones in the grass.
export const RuinsScene = ({ night = false, ...p }: P & { night?: boolean }) => (
  <V6 {...p} sky={night ? ["#0b1026", "#2a2a48"] : ["#9a9aa8", "#e8d8b0"]} accent={RED} warm={night ? 0.04 : 0.06}>
    {(g, pan, lt) => (
      <g>
        {night && <Stars g={g} n={18} />}
        {night && <Moon x={g.x + g.W * 0.8} y={g.y + g.H * 0.2} r={16 * g.s} />}
        <Backdrop g={g} pan={pan} light={null} far={night ? "#1c2238" : "#8a8a90"} mid={night ? "#161a26" : "#6a6a58"} ground={night ? "#1a1a14" : "#7a7050"} mist={night ? "#5a6a8a" : "#f0e8d0"} ridges={false} />
        {[0.12, 0.34, 0.6, 0.86].map((f, i) => <RuinedPrang key={f} x={g.x + g.W * f + pan * 0.4} y={g.ground - 10 * g.s} h={(120 + (i % 2) * 50) * g.s} s={g.s} />)}
        <Elephant x={g.x + g.W * 0.2 + Math.min(lt, 200) * 0.6 * g.s + pan * 0.8} y={g.ground + 20 * g.s} scale={g.sc * 0.5} rider="#7a1f1a" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x + g.W * (0.05 + i * 0.1) + pan * 1.3} y={g.ground + (34 + (i % 3) * 6) * g.s} width={12 * g.s} height={3 * g.s} fill="#e8e0cc" transform={`rotate(${i * 37},${g.x + g.W * (0.05 + i * 0.1) + pan * 1.3},${g.ground + 34 * g.s})`} opacity={0.8} />)}
        <Grass g={g} shift={pan * 1.6} color={night ? "#0e0e0a" : "#5a5a2a"} />
      </g>
    )}
  </V6>
);

// The dream in the old palace: gilt silhouettes of former kings glow and fade in the dark hall (slow sine).
export const DreamScene = (p: P) => (
  <V6 {...p} sky={["#0e0c1a", "#2a2238"]} accent={GOLD} warm={0.06}>
    {(g, pan, lt) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#14101c" />
        {[0.25, 0.5, 0.75].map((f, i) => {
          const o = 0.25 + 0.2 * Math.sin(lt * 0.04 + i * 1.6);
          return <g key={f} opacity={o}><BackFigure x={g.x + g.W * f + pan * 0.3} y={g.ground - 20 * g.s} scale={g.sc * 0.42} robe="#d9a93a" /></g>;
        })}
        <rect x={g.x - 40 * g.s} y={g.ground - 10 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#0e0a10" />
        <Noble x={g.x + g.W * 0.5 + pan * 1.4} y={g.ground + 26 * g.s} scale={g.sc * 0.7} mode="sit" jacket="#7a1f1a" />
      </g>
    )}
  </V6>
);

// Thonburi as a port: junks and boats on the river, the fort and a new palace roof on the bank.
export const PortThonburiScene = (p: P) => (
  <V6 {...p} sky={["#6aa0d0", "#f4dcb0"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.85, 0.22]} far="#7a8a9a" mid="#5a6a48" ground="#7a6040" mist="#fff0d0" ridges={false} />
        <PalaceRoof x={g.x + g.W * 0.32 + pan * 0.4} y={g.ground - 24 * g.s} w={g.W * 0.24} s={g.s * 0.6} />
        <Prang x={g.x + g.W * 0.7 + pan * 0.4} y={g.ground - 24 * g.s} h={160 * g.s} s={g.s} />
        <River g={g} y={g.ground - 18 * g.s} pan={pan} color="#4a7a90" />
        {[0, 1].map((i) => <Boat key={i} x={g.x + g.W * (0.15 + i * 0.45) + lt * 0.3 * g.s + pan * 0.9} y={g.ground + (24 + i * 16) * g.s} w={160 * g.s} s={g.s} n={3} />)}
      </g>
    )}
  </V6>
);

// Coronation in a modest wooden hall: parasols, candles, nobles prostrate, the king seen from behind.
export const CrownScene = (p: P) => (
  <V6 {...p} sky={["#1a1030", "#5a2a3a"]} accent={GOLD} warm={0.14}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#2a1818" />
        <Hall x={g.x + g.W * 0.5 + pan * 0.3} y={g.ground - 30 * g.s} w={g.W * 0.6} s={g.s} glow={1} />
        <Parasol x={g.x + g.W * 0.26 + pan * 0.6} y={g.ground} s={g.s} />
        <Parasol x={g.x + g.W * 0.74 + pan * 0.6} y={g.ground} s={g.s} />
        <BackFigure x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 0.38} />
        <rect x={g.x - 40 * g.s} y={g.ground - 4 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#3a2414" />
        {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.04 + i * 0.18) + pan * 1.5} y={g.ground + 28 * g.s} scale={g.sc * 0.68} mode="prostrate" jacket={i % 2 ? "#efe6d0" : "#d9c08a"} phase={i} />)}
      </g>
    )}
  </V6>
);

// Night watch over the river camp (used for the closing poll): torches, tents, a sentry.
export const RiverCampNightScene = (p: P) => (
  <V6 {...p} sky={["#0b1230", "#2a3050"]} accent={GOLD} warm={0.05}>
    {(g, pan) => (
      <g>
        <Stars g={g} n={20} />
        <Moon x={g.x + g.W * 0.2} y={g.y + g.H * 0.2} r={16 * g.s} />
        <Backdrop g={g} pan={pan} light={null} far="#1c2238" mid="#161a26" ground="#1a1a16" mist="#7a8aa8" ridges={false} />
        <Tent x={g.x + g.W * 0.55 + pan * 0.5} y={g.ground - 10 * g.s} w={140 * g.s} s={g.s} glow={0.6} />
        <Torch x={g.x + g.W * 0.45 + pan * 0.7} y={g.ground + 4 * g.s} s={g.s} seed={2} />
        <River g={g} y={g.ground + 8 * g.s} pan={pan} color="#1e3048" night />
        <Boat x={g.x + g.W * 0.2 + pan * 0.9} y={g.ground + 40 * g.s} w={160 * g.s} s={g.s} n={0} />
        <Fighter x={g.x + g.W * 0.82 + pan * 1.2} y={g.ground + 4 * g.s} scale={g.sc * 0.7} mode="stand" costume={K.siam} flip />
      </g>
    )}
  </V6>
);

