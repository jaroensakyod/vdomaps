import { interpolate, random, useCurrentFrame, Easing } from "remotion";
import { useMap } from "../../components/Map";
import { onRiver } from "./geo";
import { C } from "./Parchment";

type Boat = { u: number; d: number; row: number };

// Cao Cao's fleet: two chained rows on the north side of the river. Allies: a few boats on the south side.
const CAO: Boat[] = [0, 1].flatMap((row) =>
  Array.from({ length: 8 }, (_, i) => ({ u: 0.08 + i * 0.12 + row * 0.05, d: 0.003 + row * 0.0075, row })),
);
const ALLY: Boat[] = Array.from({ length: 5 }, (_, i) => ({ u: 0.3 + i * 0.1, d: -0.0085, row: 0 }));
const FIRE_SHIPS = Array.from({ length: 5 }, (_, i) => 0.18 + i * 0.16);

// Side-view junk, centred on its waterline, ~1 unit = 1 px before scaling.
const Junk = ({ sail, size, flip = false }: { sail: string; size: number; flip?: boolean }) => (
  <g transform={`scale(${(flip ? -1 : 1) * size / 40},${size / 40})`}>
    <path d="M-22 0 L22 0 L16 9 L-17 9 Z" fill="#6b4524" stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
    <line x1={0} y1={0} x2={0} y2={-30} stroke={C.ink} strokeWidth={2.5} />
    <path d="M1 -29 L15 -26 L13 -4 L1 -4 Z" fill={sail} stroke={C.ink} strokeWidth={1.8} />
    <path d="M-1 -24 L-12 -21 L-11 -6 L-1 -6 Z" fill={sail} stroke={C.ink} strokeWidth={1.8} opacity={0.9} />
  </g>
);

export const Flame = ({ size, seed, frame, k }: { size: number; seed: number; frame: number; k: number }) => {
  const f = (n: number) => 1 + 0.18 * Math.sin(frame * (0.7 + random(seed + n) * 0.6) + random(seed + n + 9) * 6);
  const tongue = (w: number, h: number, color: string, n: number) => (
    <path
      d={`M${-w} 0 C${-w} ${-h * 0.5} ${-w * 0.2} ${-h * 0.7} 0 ${-h} C${w * 0.2} ${-h * 0.7} ${w} ${-h * 0.5} ${w} 0 Z`}
      fill={color}
      transform={`scale(${f(n) * 0.9},${f(n + 3)})`}
    />
  );
  return (
    <g transform={`scale(${(size / 40) * k})`}>
      <circle r={30} cy={-14} fill={C.fire} opacity={0.35} style={{ filter: "blur(10px)" }} />
      {tongue(18, 50, "#c62d14", 1)}
      {tongue(13, 38, C.fire, 2)}
      {tongue(7, 24, "#ffd04a", 3)}
    </g>
  );
};

// Smoke puffs drift north-west with the south-east wind.
const Smoke = ({ size, seed, frame, since }: { size: number; seed: number; frame: number; since: number }) => (
  <g>
    {Array.from({ length: 4 }, (_, i) => {
      const age = (since + i * 11 + Math.floor(random(seed + i) * 10)) % 44;
      const t = age / 44;
      return (
        <circle
          key={i}
          cx={-t * size * 2.4}
          cy={-size * 0.9 - t * size * 2.2}
          r={size * (0.25 + t * 0.7)}
          fill="#3a2f28"
          opacity={(1 - t) * 0.35}
        />
      );
    })}
  </g>
);

export const Fleet = ({
  appear,
  fireStart,
  fireEnd,
  burnUntil,
}: {
  appear: number; // fleets fade in
  fireStart: number; // fire ships set off
  fireEnd: number; // fire ships reach Cao's fleet
  burnUntil: number; // layer fades out after this
}) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < appear) return null;
  const o = interpolate(frame, [appear, appear + 12, burnUntil, burnUntil + 20], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0) return null;
  const size = 46 * s;
  const xy = (u: number, d: number) => projection(onRiver(u, d)) ?? [0, 0];

  // Fire spreads from each impact point along the chain.
  const burnAt = (b: Boat) =>
    fireEnd + Math.min(...FIRE_SHIPS.map((u) => Math.abs(u - b.u))) * 140 + b.row * 10;

  const chain = (row: number) =>
    CAO.filter((b) => b.row === row)
      .map((b, i) => {
        const [x, y] = xy(b.u, b.d);
        return `${i ? "L" : "M"}${x},${y + 4 * s}`;
      })
      .join(" ");

  const p = interpolate(frame, [fireStart, fireEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return (
    <g opacity={o}>
      {[0, 1].map((row) => (
        <path key={row} d={chain(row)} fill="none" stroke={C.ink} strokeWidth={2.5 * s} strokeDasharray={`${5 * s} ${4 * s}`} />
      ))}
      {[...CAO].sort((a, b) => b.d - a.d).map((b, i) => {
        const [x, y] = xy(b.u, b.d);
        const t = burnAt(b);
        const burning = frame >= t;
        const k = interpolate(frame, [t, t + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <g key={`c${i}`} transform={`translate(${x},${y})`}>
            {burning && <Smoke size={size} seed={i * 7} frame={frame} since={frame - t} />}
            <g opacity={burning ? 1 - k * 0.5 : 1}>
              <Junk sail={C.wei} size={size} />
            </g>
            {burning && <Flame size={size * 1.1} seed={i * 13} frame={frame} k={k} />}
          </g>
        );
      })}
      {ALLY.map((b, i) => {
        const [x, y] = xy(b.u, b.d);
        return (
          <g key={`a${i}`} transform={`translate(${x},${y})`}>
            <Junk sail={C.wu} size={size} flip />
          </g>
        );
      })}
      {frame >= fireStart &&
        FIRE_SHIPS.map((u, i) => {
          const d = -0.04 + (0.004 + 0.04) * p;
          const [x, y] = xy(u - 0.04 * (1 - p), d);
          const lit = interpolate(frame, [fireEnd - 18, fireEnd], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={`f${i}`} transform={`translate(${x},${y})`}>
              <Smoke size={size * 0.8} seed={100 + i} frame={frame} since={frame - fireStart} />
              <Junk sail={C.wu} size={size} flip />
              <Flame size={size * 0.9} seed={200 + i} frame={frame} k={lit} />
            </g>
          );
        })}
    </g>
  );
};

// Wind streaks blowing from the south-east (towards the north-west), in screen space.
export const Wind = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  if (frame < start || frame > end) return null;
  const o = interpolate(frame, [start, start + 15, end - 15, end], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dir = [-0.8, -0.6];
  return (
    <g opacity={o * 0.7}>
      {Array.from({ length: 18 }, (_, i) => {
        const speed = 9 + random(`w${i}`) * 6;
        const travel = ((frame - start) * speed * s + random(`o${i}`) * 2000) % (width + height);
        const x0 = random(`x${i}`) * width + width * 0.4 + travel * dir[0];
        const y0 = random(`y${i}`) * height + height * 0.4 + travel * dir[1];
        const L = (120 + random(`l${i}`) * 120) * s;
        return (
          <path
            key={i}
            d={`M${x0},${y0} q${(dir[0] * L) / 2 + 12 * s},${(dir[1] * L) / 2 - 12 * s} ${dir[0] * L},${dir[1] * L}`}
            fill="none"
            stroke="#fff8e6"
            strokeWidth={3 * s}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};
