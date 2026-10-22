import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { ArmyBand, ArmyCounter, type ArmyPt } from "../kit/Army";
import { BLACK, clamp, font, GOLD, TAN } from "../kit/news";
import { ADVANCE, FAR_A, FAR_R, NORTH_A, NORTH_R, RETREAT } from "./minard";
import { B, wf } from "./time";

// The Minard band for chapters 4–8: it marches with the story. Progress is keyed to beats, by longitude along
// the route, so the head is where the narrator is. Chapters only add pins, arrows and panels around it.

// Share of the route's length (in degrees) at which the route first reaches `lon` (advance: going east; retreat: west).
const lens = (pts: ArmyPt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
export const kAt = (pts: ArmyPt[], lon: number) => {
  const l = lens(pts);
  const total = l.reduce((a, b) => a + b, 0);
  const east = pts[pts.length - 1][0] > pts[0][0];
  let acc = 0;
  for (let i = 0; i < l.length; i++) {
    const [a, b] = [pts[i][0], pts[i + 1][0]];
    if (east ? lon <= b : lon >= b) return (acc + l[i] * Math.max(0, Math.min(1, (lon - a) / (b - a || 1)))) / total;
    acc += l[i];
  }
  return 1;
};

// [frame, lon] keys: where the head of each band is when.
const advanceKeys = (): [number, number][] => [
  [B.cross.start, 24],
  [wf("minard", "width", 0.4), 24.6],
  [B.vilna.start, 25.2],
  [B.vilna.end, 25.6],
  [B.melt.start, 28.5],
  [B.vitebsk.start, 30.2],
  [B.thin.end, 30.3],
  [B.smolensk.start, 32],
  [B.stand.start, 35.6],
  [B.enter.start, 37],
  [B.enter.end, 37.6],
];
const retreatKeys = (): [number, number][] => [
  [B.leave.start, 37.7],
  [B.malo.end, 36.9],
  [B.vyazma.start, 35.4],
  [B.vyazma.end, 34.3],
  [B.smolensk2.start, 32.6],
  [B.smolensk2.end, 32],
  [B.krasnoi.start, 30.4],
  [B.berezina.start, 28.6],
  [B.crossing.end, 28.2],
  [B.napleave.end, 26.4],
  [B.back.start, 25],
  [wf("back", "10,000", 0.9), 24.1],
];

const headAt = (keys: [number, number][], pts: ArmyPt[], frame: number) => {
  const lon = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);
  return frame < keys[0][0] ? 0 : kAt(pts, lon);
};

export const Campaign = () => {
  const frame = useCurrentFrame();
  const from = B.cross.start - 20;
  if (frame < from) return null;
  const a = headAt(advanceKeys(), ADVANCE, frame);
  const r = headAt(retreatKeys(), RETREAT, frame);
  // northern detachments march with the main band, at the same share of their own route
  const side = (pts: ArmyPt[], k: number) => Math.min(1, k * 2.2);
  // hidden where a chapter shows its own number (Smolensk "60,000 fit to fight", the Neman "10,000" incl. detachments)
  const showCounter = frame < B.back.start && !(frame >= B.smolensk2.start && frame < B.smolensk2.end + 10);
  const fadeIn = interpolate(frame, [from, from + 15], [0, 1], clamp);
  return (
    <g opacity={fadeIn}>
      <ArmyBand pts={FAR_A} k={side(FAR_A, a)} color={TAN} />
      <ArmyBand pts={NORTH_A} k={side(NORTH_A, a)} color={TAN} />
      <ArmyBand pts={ADVANCE} k={a} color={TAN} glow />
      <ArmyBand pts={NORTH_R} k={side(NORTH_R, r)} color={BLACK} edge="#f2f2f2" />
      <ArmyBand pts={FAR_R} k={side(FAR_R, r)} color={BLACK} edge="#f2f2f2" />
      <ArmyBand pts={RETREAT} k={r} color={BLACK} edge="#f2f2f2" />
      {showCounter && (r > 0 ? <ArmyCounter pts={RETREAT} k={r} color="#e8edf2" font={font} /> : <ArmyCounter pts={ADVANCE} k={Math.max(a, 0.0001)} color={GOLD} font={font} />)}
    </g>
  );
};

// Ghost of the full-width band, to compare (used on "a third thinner" and in the answer).
export const GhostBand = ({ k }: { k: number }) => {
  const { s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={0.6 * k} style={{ filter: `drop-shadow(0 0 ${6 * s}px #fff)` }}>
      <ArmyBand pts={ADVANCE.map(([x, y]) => [x, y, ADVANCE[0][2]] as ArmyPt)} k={1} color="none" edge="#ffffff" />
    </g>
  );
};
