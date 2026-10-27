import { interpolate, useCurrentFrame } from "remotion";
import { Banner, Fighter, Glow, Grass, PAL } from "../../../components/Scene";
import { clamp, GOLD, RED } from "../news/kit";
import { Backdrop, Noble, Smoke } from "../ep04/v2";
import { Elephant, Parasol } from "../ep04/ch1_kit";
import { K, V6 } from "../ep06/scenes";
import { flashOf } from "./beatsKit";

// Episode 10 illustration panels (house style v2 via episode 6's V6). No faces of real people.

type P = { id: string; anchor: [number, number]; start: number; end: number };

// A war elephant: caparison, parasol, rider with a long-handled glaive. `swing` 0 = raised, 1 = struck down.
const WarElephant = ({ x, y, sc, flip = false, rider, swing = 0, tilt = 0, phase = 0, walk = true, trumpet = -99 }: { x: number; y: number; sc: number; flip?: boolean; rider: string; swing?: number; tilt?: number; phase?: number; walk?: boolean; trumpet?: number }) => {
  const dir = flip ? -1 : 1;
  const hx = x + 6 * sc * dir;
  const hy = y - 150 * sc;
  const a = ((-70 + swing * 105) * Math.PI) / 180;
  const L = 120 * sc;
  const tx = hx + Math.cos(a) * L * dir;
  const ty = hy + Math.sin(a) * L;
  return (
    <g transform={`rotate(${tilt * dir},${x - 40 * sc * dir},${y})`}>
      <Parasol x={x - 22 * sc * dir} y={y - 128 * sc} s={sc * 0.55} h={150} />
      <Elephant x={x} y={y} scale={sc} flip={flip} rider={rider} phase={phase} walk={walk} trumpet={trumpet} />
      <path d={`M${x - 52 * sc} ${y - 104 * sc} L${x + 44 * sc} ${y - 104 * sc} L${x + 38 * sc} ${y - 64 * sc} L${x - 46 * sc} ${y - 64 * sc} Z`} fill={rider === GOLD ? "#b8862a" : "#7a2a24"} stroke={PAL.ink} strokeWidth={1.6 * sc} opacity={0.9} />
      <line x1={hx} y1={hy} x2={tx} y2={ty} stroke="#4a2f18" strokeWidth={4 * sc} strokeLinecap="round" />
      <path d={`M${tx} ${ty} l${Math.cos(a + 0.5) * 26 * sc * dir} ${Math.sin(a + 0.5) * 26 * sc} l${Math.cos(a) * 18 * sc * dir} ${Math.sin(a) * 18 * sc} Z`} fill="#d8dde0" stroke={PAL.ink} strokeWidth={1.2 * sc} />
    </g>
  );
};

// The duel: two royal elephants charge, clash tusk to tusk, the gold side drives under and the glaive comes down.
// clash / strike are absolute frames (SFX hits go on the same frames).
export const DuelScene = ({ clash, strike, ...p }: P & { clash: number; strike: number }) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#b0622e", "#f2c98a"]} accent={RED} hits={[clash, strike]} warm={0.12}>
      {(g, pan) => {
        const sc = g.sc * 0.78;
        const mid = g.x + g.W * 0.5 + pan * 0.7;
        const gap = interpolate(frame, [p.start, clash], [g.W * 0.36, 118 * sc], clamp);
        const push = interpolate(frame, [clash, clash + 45], [0, 34 * sc], clamp);
        const tilt = interpolate(frame, [clash + 8, strike, strike + 30], [0, 9, 16], clamp);
        const swing = interpolate(frame, [strike - 10, strike], [0, 1], clamp);
        const charging = frame < clash;
        const k = flashOf(frame, strike);
        const y = g.ground + 22 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.5, 0.32]} far="#8a5a48" mid="#6a5a3a" ground="#8a6a40" mist="#f6d9a8" />
            <Glow x={g.x + g.W * 0.5 + pan * 0.15} y={g.y + g.H * 0.3} s={g.s * 1.3} color="#ffc070" core="#fff0c8" />
            {[0.12, 0.3, 0.7, 0.88].map((u, i) => <Banner key={u} x={g.x + g.W * u + pan * 0.5} y={g.ground - 30 * g.s} s={g.s * 0.8} color={i < 2 ? GOLD : RED} />)}
            {frame >= clash - 4 && <Smoke x={mid} y={y - 10 * g.s} s={g.s * 1.4} n={6} />}
            <WarElephant x={mid + gap - push} y={y} sc={sc} flip rider={RED} tilt={tilt} phase={2} walk={charging} trumpet={clash - 6} />
            <WarElephant x={mid - gap + push} y={y + 4 * g.s} sc={sc} rider={GOLD} swing={swing} walk={charging} trumpet={clash + 2} />
            {k > 0 && <circle cx={mid + 40 * sc} cy={y - 150 * sc} r={46 * sc * k} fill="#fff4d0" opacity={0.7 * k} />}
            <Grass g={g} shift={pan * 1.6} color="#5a4a26" />
            {[0, 1, 2].map((i) => <Fighter key={`s${i}`} x={g.x + g.W * (0.02 + i * 0.1) + pan * 1.6} y={g.y + g.H - 6 * g.s} scale={g.sc * 0.62} mode="run" flip costume={K.siam} phase={i * 1.3} />)}
            {[0, 1, 2].map((i) => <Fighter key={`b${i}`} x={g.x + g.W * (0.98 - i * 0.1) + pan * 1.6} y={g.y + g.H - 2 * g.s} scale={g.sc * 0.62} mode="attack" costume={K.burma} phase={i * 1.7} />)}
          </g>
        );
      }}
    </V6>
  );
};

// A tall white Lanka-style chedi on a stepped base (h = full height in px).
const Chedi = ({ x, y, h, s }: { x: number; y: number; h: number; s: number }) => {
  const r = h * 0.2;
  const yb = y - h * 0.22;
  const top = yb - r * 1.3;
  return (
    <g stroke={PAL.ink} strokeWidth={1.8 * s}>
      {[0, 1, 2].map((i) => <rect key={i} x={x - r * (1.5 - i * 0.22)} y={y - h * 0.075 * (i + 1)} width={r * (3 - i * 0.44)} height={h * 0.075} fill={i % 2 ? "#e6dfcc" : "#f1ecdf"} />)}
      <path d={`M${x - r} ${yb} Q${x - r * 1.02} ${top} ${x} ${top - r * 0.05} Q${x + r * 1.02} ${top} ${x + r} ${yb} Z`} fill="#f4efe2" />
      <path d={`M${x + r * 0.35} ${yb} Q${x + r * 0.7} ${top + r * 0.3} ${x + r * 0.1} ${top + 2}`} fill="none" stroke="#c9bfa6" strokeWidth={6 * s} opacity={0.6} />
      <rect x={x - r * 0.28} y={top - r * 0.32} width={r * 0.56} height={r * 0.3} fill="#ece5d2" />
      <path d={`M${x - r * 0.2} ${top - r * 0.32} L${x} ${y - h} L${x + r * 0.2} ${top - r * 0.32} Z`} fill="#efe8d6" />
      {[0.2, 0.4, 0.6].map((u) => <line key={u} x1={x - r * 0.2 * (1 - u)} x2={x + r * 0.2 * (1 - u)} y1={top - r * 0.32 - (top - r * 0.32 - (y - h)) * u} y2={top - r * 0.32 - (top - r * 0.32 - (y - h)) * u} strokeWidth={1.2 * s} />)}
      <circle cx={x} cy={y - h} r={4 * s} fill={PAL.gilt} />
    </g>
  );
};

// The monument people know: a tall white chedi, a royal statue on an elephant in front, people paying respect.
export const MonumentScene = (p: P) => {
  const frame = useCurrentFrame();
  return (
    <V6 {...p} sky={["#7a9ac0", "#f3dcb0"]} accent={GOLD} warm={0.08}>
      {(g, pan, lt) => {
        const rise = interpolate(lt, [0, 40], [30 * g.s, 0], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.78, 0.26]} far="#8a8aa0" mid="#5a6a48" ground="#7a7a50" mist="#f6e6c8" />
            <Chedi x={g.x + g.W * 0.64 + pan * 0.5} y={g.ground - 4 * g.s + rise} h={g.H * 0.9} s={g.s} />
            <g transform={`translate(0,${rise * 0.5})`}>
              <rect x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground - 4 * g.s} width={g.W * 0.2} height={22 * g.s} fill="#b8b0a0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <Parasol x={g.x + g.W * 0.28 + pan * 0.7} y={g.ground - 4 * g.s - 128 * g.sc * 0.5} s={g.sc * 0.3} h={150} />
              <Elephant x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 0.5} rider={PAL.gilt} walk={false} phase={Math.min(frame, 0)} />
            </g>
            <Grass g={g} shift={pan * 1.6} color="#4a5a2a" />
            {[0, 1, 2, 3, 4].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.21) + pan * 1.5} y={g.y + g.H - 4 * g.s} scale={g.sc * 0.55} mode="kneel" bow={0.5 + 0.5 * Math.sin(lt * 0.05 + i)} phase={i} jacket={i % 2 ? "#efe6d0" : "#d9c9a0"} />)}
          </g>
        );
      }}
    </V6>
  );
};
