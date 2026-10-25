import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { ArmyBand, ArmyCounter, type ArmyPt } from "../kit/Army";
import { clamp, font, GOLD, TAN } from "../kit/news";
import { MARCH } from "./route";
import { B } from "./time";

// The army band for chapters 3–6: Hannibal's march from New Carthage to the Po, thinning at Polybius's counts.
// Progress is keyed to beats by longitude (the route runs west → east the whole way).
const lens = (pts: ArmyPt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
export const kAt = (pts: ArmyPt[], lon: number) => {
  const l = lens(pts);
  const total = l.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < l.length; i++) {
    const [a, b] = [pts[i][0], pts[i + 1][0]];
    if (lon <= b) return (acc + l[i] * Math.max(0, Math.min(1, (lon - a) / (b - a || 1)))) / total;
    acc += l[i];
  }
  return 1;
};

const keys = (): [number, number][] => [
  [B.army.start, -0.98],
  [B.ebro.start, 0.2],
  [B.ebro.end, 1.9],
  [B.pyrenees.start + 20, 2.86],
  [B.pyrenees.end, 3.0],
  [B.rhone.start, 3.6],
  [B.rhone.end, 4.81],
  [B.turn.end, 5.2],
  [B.climb.end, 5.6],
  [B.allobroges.start, 5.9],
  [B.gorge.end, 6.6],
  [B.snow.start, 7.07],
  [B.arrive.start, 7.07],
  [B.arrive.end, 7.69],
];

export const marchK = (frame: number) => {
  const k = keys();
  if (frame < k[0][0]) return 0;
  return kAt(MARCH, interpolate(frame, k.map((x) => x[0]), k.map((x) => x[1]), clamp));
};

// Shown from the "army" beat to the end of ch6; fades to a faint trace afterwards.
export const March = () => {
  const frame = useCurrentFrame();
  const from = B.army.start - 10;
  if (frame < from) return null;
  const k = marchK(frame);
  const o = interpolate(frame, [from, from + 12, B.fabius.start, B.fabius.start + 20], [0, 1, 1, 0.35], clamp);
  const counter = frame < B.ticinus.start;
  return (
    <g opacity={o}>
      <ArmyBand pts={MARCH} k={Math.max(k, 0.002)} color={TAN} glow perMan={1 / 1500} />
      {counter && <ArmyCounter pts={MARCH} k={Math.max(k, 0.002)} color={GOLD} font={font} />}
    </g>
  );
};

// Ghost of the band at full strength (for "half the army" comparisons).
export const GhostMarch = ({ k }: { k: number }) => {
  const { s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={0.6 * k} style={{ filter: `drop-shadow(0 0 ${6 * s}px #fff)` }}>
      <ArmyBand pts={MARCH.map(([x, y]) => [x, y, MARCH[0][2]] as ArmyPt)} k={1} color="none" edge="#ffffff" perMan={1 / 1500} />
    </g>
  );
};
