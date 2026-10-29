import { interpolate, useCurrentFrame } from "remotion";
import { clamp, GOLD, RED } from "../news/kit";
import { Backdrop, Fire, River, Smoke } from "../ep04/v2";
import { V6 } from "../ep06/scenes";

// × Mumate EP.1 illustration panels (house style v2 via episode 6's V6): the "sword" pictures behind the BaZi
// reading — a blade in the forge, several blades in one sheath, a blade cooling in water. No people.

type P = { id: string; anchor: [number, number]; start: number; end: number };

// One straight blade (Thai daab) lying at angle `a`, with a glow from 0 (cold steel) to 1 (white-hot).
const Blade = ({ x, y, s, a = -12, heat = 0, len = 260 }: { x: number; y: number; s: number; a?: number; heat?: number; len?: number }) => {
  const steel = heat > 0 ? `rgb(${Math.round(190 + 65 * heat)},${Math.round(196 - 40 * heat)},${Math.round(206 - 150 * heat)})` : "#c9d2dc";
  return (
    <g transform={`translate(${x},${y}) rotate(${a})`}>
      {heat > 0.2 && <ellipse cx={len * 0.3 * s} cy={0} rx={len * 0.45 * s} ry={22 * s} fill="#ff8a2a" opacity={0.35 * heat} />}
      <path d={`M0 ${-9 * s} L${len * 0.82 * s} ${-12 * s} Q${len * s} ${-6 * s} ${len * s} ${2 * s} L0 ${8 * s} Z`} fill={steel} stroke="#3a2a1a" strokeWidth={2 * s} />
      <rect x={-16 * s} y={-14 * s} width={8 * s} height={28 * s} rx={2 * s} fill="#c9a060" stroke="#3a2a1a" strokeWidth={1.5 * s} />
      <rect x={-80 * s} y={-7 * s} width={64 * s} height={14 * s} rx={5 * s} fill="#5a3418" stroke="#2a1a0a" strokeWidth={1.5 * s} />
    </g>
  );
};

// A blade on the anvil in a forge: fire behind, sparks on every hammer beat.
export const ForgeScene = ({ heatAt = 0, ...p }: P & { heatAt?: number }) => {
  const frame = useCurrentFrame();
  const heat = interpolate(frame, [heatAt, heatAt + 60], [0.3, 1], clamp);
  return (
    <V6 {...p} sky={["#1a0d08", "#4a1e0e"]} accent={RED} warm={0.14}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#2a1810" mid="#3a2214" ground="#2a1a10" mist="#5a2a14" ridges={false} />
          {[0.2, 0.42, 0.62].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.4} y={g.ground - 30 * g.s} h={(90 + 30 * i) * g.s} seed={i} />)}
          <rect x={g.x + g.W * 0.36 + pan} y={g.ground - 6 * g.s} width={150 * g.s} height={40 * g.s} rx={6 * g.s} fill="#2a2a30" stroke="#0a0a10" strokeWidth={2 * g.s} />
          <Blade x={g.x + g.W * 0.3 + pan} y={g.ground - 14 * g.s} s={g.s} a={-4} heat={heat} />
          {Array.from({ length: 10 }, (_, i) => {
            const t = (frame * 1.6 + i * 23) % 60;
            return <circle key={i} cx={g.x + g.W * 0.48 + pan + Math.sin(i * 2.1) * t * 2.2 * g.s} cy={g.ground - 20 * g.s - t * 1.6 * g.s + t * t * 0.02 * g.s} r={2.4 * g.s} fill="#ffd27a" opacity={1 - t / 60} />;
          })}
          <Smoke x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 80 * g.s} s={g.s} n={3} dark />
        </g>
      )}
    </V6>
  );
};

// Several blades in one sheath rack — "sharp, but the sheath is getting tight". `crack` = frame the sheath splits.
export const SheathScene = ({ crack = 1e9, ...p }: P & { crack?: number }) => {
  const frame = useCurrentFrame();
  const c = interpolate(frame, [crack, crack + 20], [0, 1], clamp);
  return (
    <V6 {...p} sky={["#20242e", "#5a4a3a"]} accent={GOLD} warm={0.08} hits={crack < 1e8 ? [crack] : []}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={[0.75, 0.3]} far="#4a4a5a" mid="#3a3a40" ground="#2e2620" mist="#8a7a6a" ridges={false} />
          {[0, 1, 2, 3, 4].map((i) => <Blade key={i} x={g.x + g.W * 0.2 + pan} y={g.ground - (90 - i * 16) * g.s} s={g.s} a={-8 + i * 4} len={300} />)}
          <rect x={g.x + g.W * 0.2 + 120 * g.s + pan} y={g.ground - 110 * g.s} width={180 * g.s} height={110 * g.s} rx={18 * g.s} fill="#6a3a1a" stroke="#2a160a" strokeWidth={3 * g.s} />
          {c > 0 && <path d={`M${g.x + g.W * 0.2 + 200 * g.s + pan} ${g.ground - 110 * g.s} l${14 * g.s * c} ${40 * g.s * c} l${-18 * g.s * c} ${30 * g.s * c} l${10 * g.s * c} ${40 * g.s * c}`} stroke="#ffd25a" strokeWidth={4 * g.s} fill="none" />}
        </g>
      )}
    </V6>
  );
};

// A hot blade lowered into water: steam rises — "water draws the strength out of metal". `deep` 0..1 sinks it.
export const QuenchScene = ({ dip = 0, deep = 0, ...p }: P & { dip?: number; deep?: number }) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [dip, dip + 40], [0, 1], clamp) * (0.6 + 0.4 * deep);
  return (
    <V6 {...p} sky={["#0e1a2a", "#2a4a6a"]} accent="#4a8df0" warm={0.02}>
      {(g, pan) => (
        <g>
          <Backdrop g={g} pan={pan} light={null} far="#1a2a3a" mid="#1a3040" ground="#10202c" mist="#4a6a8a" ridges={false} />
          <River g={g} y={g.ground - 20 * g.s} pan={pan} color="#2a5a80" />
          <Blade x={g.x + g.W * 0.35 + pan} y={g.ground - 70 * g.s + d * 70 * g.s} s={g.s} a={-18 + d * 10} heat={Math.max(0, 0.8 - d)} />
          <Smoke x={g.x + g.W * 0.48 + pan} y={g.ground - 30 * g.s} s={g.s * (0.6 + d)} n={2 + Math.round(d * 4)} />
        </g>
      )}
    </V6>
  );
};
