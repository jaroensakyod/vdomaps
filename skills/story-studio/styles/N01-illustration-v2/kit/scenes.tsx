import { interpolate, useCurrentFrame } from "remotion";
import { Banner, Fighter, Grass, PAL, Shot } from "../../../components/Scene";
import { Backdrop, C, clamp, Clouds, DAWN, DAY, DUSK, Dust, Elephant, Fire, GOLD, House, Ladder, PalaceWall, Palisade, Prang, RED, Smoke, Volley } from "./props";
import { Stage } from "./Stage";

// Ready scenes in house illustration style v2. Each takes { id, start, end } plus the frames of its events, so the
// demo (or an episode) can put the matching sound on the same frames. Every scene has a sky, a light (Glow), far
// and mid ridges, a foreground grass layer at ×1.6 parallax, jointed Fighters with ground shadows, and impacts that
// shake and flash the panel through <Stage hits>.
export type Sc = { id: string; start: number; end: number; fadeOut?: boolean };
export const SHOT_FLIGHT = 16; // frames from a cannon's muzzle flash to the ball landing (Shot default)

// A walled city under siege at dusk: a cannon on the wall fires at the attackers' stockade line (`shots` = firing
// frames; each lands SHOT_FLIGHT + 2 frames later and shakes the panel), defenders on the wall, attackers marching.
export const SiegeScene = ({ id, start, end, fadeOut, shots = [] }: Sc & { shots?: number[] }) => {
  const frame = useCurrentFrame();
  const hits = shots.map((f) => f + SHOT_FLIGHT + 2);
  return (
    <Stage id={id} start={start} end={end} sky={["#2b1f3a", "#e8a25a"]} accent={GOLD} hits={hits} fadeOut={fadeOut}>
      {(g, pan, lt) => {
        const last = shots.filter((f) => f <= frame).pop();
        const fired = shots.filter((f) => f <= frame).length - 1;
        const wallX = g.x + g.W * 0.62;
        const muzzle: [number, number] = [wallX + 10 * g.s, g.ground - 108 * g.s];
        const target: [number, number] = [g.x + g.W * (0.18 + (Math.max(0, fired) % 3) * 0.1), g.ground - 6 * g.s];
        const march = interpolate(lt, [0, end - start], [0, 70], clamp) * g.s;
        return (
          <g>
            <Clouds g={g} pan={pan} color="#f6c8a0" opacity={0.16} />
            <Backdrop g={g} pan={pan} light={[0.2, 0.62]} far="#7a6a8a" mid="#4f5a48" />
            <Palisade x={g.x + g.W * 0.02 + pan * 0.7} y={g.ground - 10 * g.s} w={190 * g.s} s={g.s} />
            <Banner x={g.x + g.W * 0.1 + pan * 0.7} y={g.ground - 70 * g.s} s={g.s} color={PAL.ochre} />
            <Prang x={wallX + g.W * 0.24 + pan * 0.5} y={g.ground - 100 * g.s} h={170 * g.s} s={g.s} />
            <PalaceWall x={wallX + pan * 0.7} y={g.ground - 10 * g.s} w={g.W * 0.5} h={90 * g.s} s={g.s} />
            <Banner x={wallX + g.W * 0.3 + pan * 0.7} y={g.ground - 112 * g.s} s={g.s} color={PAL.gilt} />
            <Fighter x={wallX + 70 * g.s + pan * 0.7} y={g.ground - 110 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={C.siam} phase={1} />
            <Fighter x={wallX + 150 * g.s + pan * 0.7} y={g.ground - 110 * g.s} scale={g.sc * 0.62} flip mode="attack" costume={C.siam} phase={2} />
            <rect x={muzzle[0] - 6 * g.s + pan * 0.7} y={muzzle[1] - 6 * g.s} width={44 * g.s} height={12 * g.s} rx={5 * g.s} fill="#2a2a2a" transform={`rotate(-12,${muzzle[0] + 16 * g.s + pan * 0.7},${muzzle[1]})`} />
            {last !== undefined && <Shot from={[muzzle[0] + pan * 0.7, muzzle[1]]} to={[target[0] + pan * 0.7, target[1]]} t={frame - last} s={g.s} />}
            {[0, 1, 2, 3].map((i) => (
              <Fighter key={i} x={g.x + g.W * (0.16 + i * 0.1) + march + pan * 0.8} y={g.ground + 6 * g.s + (i % 2) * 8 * g.s} scale={g.sc * 0.8} mode={i === 3 ? "attack" : "walk"} costume={C.burma} phase={i * 1.3} />
            ))}
            <Grass g={g} shift={pan * 1.6} />
          </g>
        );
      }}
    </Stage>
  );
};

// Two armies clash in open country: war elephants with riders, infantry, arrow volleys both ways, dust.
// `volleys` = the frames each side looses arrows; `hits` = clash frames (shake + flash at the centre).
export const BattleScene = ({ id, start, end, fadeOut, left = "siam", right = "burma", volleys = [], hits = [], winner = "left", light = "day" }: Sc & { left?: string; right?: string; volleys?: number[]; hits?: number[]; winner?: "left" | "right"; light?: "day" | "dusk" | "dawn" }) => {
  const frame = useCurrentFrame();
  return (
    <Stage id={id} start={start} end={end} sky={light === "day" ? DAY : light === "dusk" ? DUSK : DAWN} accent={RED} hits={hits} fadeOut={fadeOut}>
      {(g, pan, lt) => {
        const push = interpolate(lt, [20, end - start], [0, 80], clamp) * g.s * (winner === "left" ? 1 : -1);
        const swing = Math.max(0, ...hits.map((h) => (frame >= h - 10 && frame < h + 8 ? Math.sin(((frame - h + 10) / 18) * Math.PI) : 0)));
        return (
          <g>
            <Clouds g={g} pan={pan} />
            <Backdrop g={g} pan={pan} light={[0.84, 0.2]} />
            <Dust x={g.x + g.W * 0.5 + push} y={g.ground} s={g.s} k={0.45} n={9} />
            {volleys.map((v, i) => <Volley key={v} at={v} x0={g.x + g.W * (i % 2 ? 0.85 : 0.15)} x1={g.x + g.W * (i % 2 ? 0.25 : 0.75)} y={g.ground - 60 * g.s} s={g.s} seed={3 + i * 5} h={160} />)}
            {[0.04, 0.2, 0.8, 0.95].map((f, i) => <Banner key={f} x={g.x + g.W * f + pan * 0.6} y={g.ground + 4 * g.s} s={g.s * 0.9} color={i < 2 ? RED : PAL.chalk} />)}
            <Elephant x={g.x + g.W * 0.3 + push + pan * 0.5} y={g.ground - 2 * g.s} s={g.s * 0.5} walk={0.4} cloth={C[left].jacket} trim={C[left].sash} riderCostume={C[left]} swing={swing} />
            <Elephant x={g.x + g.W * 0.72 + push + pan * 0.5} y={g.ground - 2 * g.s} s={g.s * 0.5} flip walk={0.4} cloth={C[right].jacket} trim={C[right].sash} riderCostume={C[right]} rider="rider" phase={1.4} />
            {Array.from({ length: 5 }, (_, i) => <Fighter key={`l${i}`} x={g.x + g.W * (0.04 + i * 0.085) + push + pan * 0.8} y={g.ground + 40 * g.s + (i % 2) * 12 * g.s} scale={g.sc * 0.54} mode={i % 2 ? "attack" : "run"} costume={C[left]} phase={i} />)}
            {Array.from({ length: 5 }, (_, i) => <Fighter key={`r${i}`} x={g.x + g.W * (0.6 + i * 0.085) + push + pan * 0.8} y={g.ground + 40 * g.s + (i % 2) * 12 * g.s} scale={g.sc * 0.54} flip mode={i % 2 ? "attack" : "stand"} costume={C[right]} phase={i + 0.5} />)}
            {hits.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.5 + push} cy={g.ground - 90 * g.s} r={34 * g.s} fill="#fff2b0" opacity={0.8} /> : null))}
            <Grass g={g} shift={pan * 1.6} />
          </g>
        );
      }}
    </Stage>
  );
};

// A city wall stormed at dusk: defenders on the wall, an attacker climbing a ladder, a charge, fire and smoke.
export const StormScene = ({ id, start, end, fadeOut, attacker = "burma", burn = 1, hits = [] }: Sc & { attacker?: string; burn?: number; hits?: number[] }) => (
  <Stage id={id} start={start} end={end} sky={DUSK} accent={RED} hits={hits} fadeOut={fadeOut}>
    {(g, pan, lt) => (
      <g>
        <Clouds g={g} pan={pan} color="#ff9a5a" opacity={0.14} />
        <Backdrop g={g} pan={pan} light={[0.2, 0.3]} lightColor={["#ff8a2a", "#ffd25a"]} far="#3a2a3a" mid="#3a3428" ground="#3a2a1a" mist="#ff9a5a" />
        <Prang x={g.x + g.W * 0.72 + pan * 0.3} y={g.ground - 100 * g.s} h={160 * g.s} s={g.s} color="#cfc6b0" />
        <PalaceWall x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 4 * g.s} w={g.W * 0.6} h={120 * g.s} s={g.s} />
        {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.56 + i * 0.12) + pan * 0.5} y={g.ground - 124 * g.s} scale={g.sc * 0.5} flip mode={i % 2 ? "attack" : "stand"} costume={C.siam} phase={i} />)}
        <Ladder x={g.x + g.W * 0.38 + pan * 0.6} y={g.ground + 4 * g.s} h={124 * g.s} s={g.s} lean={26} />
        <Fighter x={g.x + g.W * 0.42 + pan * 0.6} y={g.ground - 50 * g.s - Math.min(50, lt * 0.4) * g.s} scale={g.sc * 0.52} mode="walk" costume={C[attacker]} phase={1} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={`a${i}`} x={g.x + g.W * (0.03 + i * 0.075) + pan * 0.8} y={g.ground + 24 * g.s + (i % 2) * 10 * g.s} scale={g.sc * 0.62} mode={i % 2 ? "run" : "attack"} costume={C[attacker]} phase={i * 1.3} />)}
        {burn > 0 && [0.62, 0.84].map((f, i) => <Fire key={f} x={g.x + g.W * f + pan * 0.5} y={g.ground - 124 * g.s} h={64 * g.s * burn} seed={i * 2} />)}
        <Smoke x={g.x + g.W * 0.66 + pan * 0.5} y={g.ground - 160 * g.s} s={g.s} dark />
        <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
      </g>
    )}
  </Stage>
);

// Night: the city burns; townspeople flee with bundles past burning houses under the prangs.
export const BurningCityScene = ({ id, start, end, fadeOut }: Sc) => (
  <Stage id={id} start={start} end={end} sky={["#120b1e", "#6a2a1a"]} accent={RED} warm={0.14} fadeOut={fadeOut}>
    {(g, pan, lt) => (
      <g>
        <Clouds g={g} pan={pan} color="#3a2030" opacity={0.5} />
        <Backdrop g={g} pan={pan} light={[0.6, 0.45]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1f2a" mid="#2a2420" ground="#2a2018" mist="#ff9a5a" />
        {[0.12, 0.5, 0.86].map((f, i) => <Prang key={f} x={g.x + g.W * f + pan * 0.3} y={g.ground - 40 * g.s} h={(140 + i * 30) * g.s} s={g.s} color="#8a7a6a" />)}
        {[0.06, 0.32, 0.6, 0.84].map((f) => <House key={f} x={g.x + g.W * f - 10 * g.s + pan * 0.6} y={g.ground} w={90 * g.s} s={g.s} burn={1} />)}
        <Smoke x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 170 * g.s} s={g.s} dark n={8} />
        {Array.from({ length: 5 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.95 - i * 0.14) - lt * 0.8 * g.s + pan * 1.1} y={g.ground + 30 * g.s + (i % 2) * 10 * g.s} scale={g.sc * 0.56} flip mode="run" costume={i % 2 ? C.villagerW : C.villager} weapon="none" phase={i} />)}
        <Grass g={g} shift={pan * 1.6} color="#140f0c" />
      </g>
    )}
  </Stage>
);

// An army column marching across the panel (dir 1 = to the right), elephants among the infantry.
export const MarchScene = ({ id, start, end, fadeOut, side = "siam", dir = 1, light = "dawn", elephants = 1 }: Sc & { side?: string; dir?: 1 | -1; light?: "day" | "dusk" | "dawn"; elephants?: number }) => {
  const cos = C[side] ?? C.siam;
  return (
    <Stage id={id} start={start} end={end} sky={light === "day" ? DAY : light === "dusk" ? DUSK : DAWN} accent={GOLD} fadeOut={fadeOut}>
      {(g, pan, lt) => {
        const move = lt * 1.1 * dir * g.s;
        return (
          <g>
            <Clouds g={g} pan={pan} />
            <Backdrop g={g} pan={pan} light={light === "dusk" ? [0.85, 0.5] : [0.8, 0.3]} />
            <Dust x={g.x + g.W * (dir > 0 ? 0.25 : 0.75) + move} y={g.ground} s={g.s} k={0.5} />
            {Array.from({ length: elephants }, (_, i) => <Elephant key={i} x={g.x + g.W * (0.45 + i * 0.4) + move + pan * 0.5} y={g.ground - 4 * g.s} s={g.s * 0.5} flip={dir < 0} walk={1} cloth={cos.jacket} trim={cos.sash} riderCostume={cos} phase={i * 1.7} />)}
            {Array.from({ length: 8 }, (_, i) => <Fighter key={i} x={g.x + g.W * (-0.05 + i * 0.13) + move * 1.2 + pan * 0.7} y={g.ground + 40 * g.s + (i % 2) * 10 * g.s} scale={g.sc * 0.54} flip={dir < 0} mode="walk" costume={cos} phase={i * 0.8} />)}
            {[0.1, 0.5, 0.85].map((f) => <Banner key={f} x={g.x + g.W * f + move * 1.2 + pan * 0.7} y={g.ground + 18 * g.s} s={g.s * 0.85} color={RED} />)}
            <Grass g={g} shift={pan * 1.6} />
          </g>
        );
      }}
    </Stage>
  );
};
