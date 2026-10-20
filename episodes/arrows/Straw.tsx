import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../components/Map";
import { onRiver } from "../redcliffs/geo";
import { C } from "../redcliffs/Parchment";

// Straw boats, Cao's camp, the arrow storm and the fog for "ขงเบ้งยืมธนูแสนดอก".
// Positions come from river(u, off): u runs along the river (0 → 1), off > 0 is towards the north (Cao) bank.

// River centre (d) at each u, measured from china-water.json: the line onRiver() draws is straight, the river is not.
const CENTRE: [number, number][] = [[0, -0.009], [0.1, -0.0045], [0.25, -0.008], [0.4, -0.01], [0.5, -0.0125], [0.6, -0.0135], [0.75, -0.0105], [0.9, -0.0035], [1, 0.006]];
const centreD = (u: number) => {
  const i = Math.max(1, CENTRE.findIndex(([x]) => x >= u));
  const [[u0, d0], [u1, d1]] = [CENTRE[i - 1], CENTRE[i]];
  return d0 + ((d1 - d0) * (u - u0)) / (u1 - u0);
};
// Point at u along the river, `off` degrees north (+) or south (−) of its centre.
export const river = (u: number, off: number) => onRiver(u, centreD(u) + off);

const BOATS = [0, 1].flatMap((row) => Array.from({ length: 10 }, (_, i) => ({ u: 0.06 + i * 0.095 + row * 0.04, row })));
const START_D = [-0.004, -0.009]; // south half of the river, off the allied bank
const TARGET_D = [0.009, 0.004]; // north half, facing Cao's camp
const CAMP_D = 0.022; // Cao's tents and archers on the north bank

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Side-view junk, with straw bundles along the deck unless straw={false}; `arrows` = how many arrows stuck in the visible side.
export const StrawBoat = ({ size, flip = 1, arrows = 0, seed = 0, tilt = 0, straw = true }: { size: number; flip?: number; arrows?: number; seed?: number; tilt?: number; straw?: boolean }) => (
  <g transform={`rotate(${tilt}) scale(${(flip * size) / 40},${size / 40})`}>
    <path d="M-22 0 L22 0 L16 9 L-17 9 Z" fill="#6b4524" stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
    <line x1={0} y1={0} x2={0} y2={-26} stroke={C.ink} strokeWidth={2.2} />
    <path d="M1 -25 L12 -23 L11 -12 L1 -12 Z" fill="#d9c9a0" stroke={C.ink} strokeWidth={1.5} />
    {/* straw bundles */}
    {straw && Array.from({ length: 6 }, (_, i) => (
      <ellipse key={i} cx={-17 + i * 6.8} cy={-4} rx={4.2} ry={5.2} fill="#d6b04a" stroke="#8a6a1f" strokeWidth={1.2} />
    ))}
    {Array.from({ length: Math.min(arrows, 40) }, (_, i) => {
      const x = -19 + random(`ax${seed}-${i}`) * 38;
      const y = -8 + random(`ay${seed}-${i}`) * 7;
      const a = -60 + random(`aa${seed}-${i}`) * 40;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${a})`}>
          <line x1={0} y1={0} x2={0} y2={-9} stroke={C.ink} strokeWidth={1} />
          <path d="M-1.6 -9 L0 -12 L1.6 -9 Z" fill="#fff6dd" stroke={C.ink} strokeWidth={0.6} />
        </g>
      );
    })}
  </g>
);

const Tent = ({ size }: { size: number }) => (
  <g transform={`scale(${size / 40})`}>
    <path d="M-14 0 L0 -18 L14 0 Z" fill={C.wei} stroke={C.ink} strokeWidth={1.8} strokeLinejoin="round" />
    <line x1={0} y1={-18} x2={0} y2={-26} stroke={C.ink} strokeWidth={1.5} />
    <path d="M0 -26 L8 -23 L0 -20 Z" fill={C.wei} />
  </g>
);

// Arrow flights: each has a launch frame, a target boat and the side it lands on (0 before the turn, 1 after).
type Flight = { t: number; boat: number; side: number; from: number };
const flights = (shootStart: number, flipAt: number, shootEnd: number): Flight[] =>
  Array.from({ length: 220 }, (_, i) => {
    const t = Math.round(lerp(shootStart, shootEnd, Math.pow(random(`t${i}`), 0.8)));
    return { t, boat: Math.floor(random(`b${i}`) * BOATS.length), side: t + 10 < flipAt ? 0 : 1, from: random(`f${i}`) };
  });
const FLY = 10;

export const StrawFleet = ({
  appear,
  sailStart,
  sailEnd,
  shootStart,
  flipAt,
  shootEnd,
  returnStart,
  returnEnd,
  until,
}: {
  appear: number; // boats fade in at the allied bank
  sailStart: number;
  sailEnd: number; // boats reach Cao's side
  shootStart: number;
  flipAt: number; // boats turn so the other side takes arrows
  shootEnd: number;
  returnStart: number;
  returnEnd: number;
  until: number; // layer fades out
}) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < appear) return null;
  const o = interpolate(frame, [appear, appear + 12, until, until + 15], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const size = 44 * s;
  const go = interpolate(frame, [sailStart, sailEnd], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const back = interpolate(frame, [returnStart, returnEnd], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const flip = interpolate(frame, [flipAt - 8, flipAt + 8], [1, -1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const all = flights(shootStart, flipAt, shootEnd);
  const pos = (b: (typeof BOATS)[number]) => {
    const d = lerp(lerp(START_D[b.row], TARGET_D[b.row], go), START_D[b.row], back);
    return projection(river(b.u, d)) ?? [0, 0];
  };
  const archer = (k: number) => projection(river(0.04 + k * 0.92, CAMP_D)) ?? [0, 0];

  return (
    <g opacity={o}>
      {BOATS.map((b, i) => {
        const [x, y] = pos(b);
        const side = frame < flipAt ? 0 : 1;
        const stuck = all.filter((f) => f.boat === i && f.side === side && f.t + FLY <= frame).length;
        const bob = Math.sin(frame * 0.12 + i) * 1.5 * s;
        return (
          <g key={i} transform={`translate(${x},${y + bob})`}>
            <StrawBoat size={size} flip={flip} arrows={stuck} seed={i * 2 + side} />
          </g>
        );
      })}
      {all.map((f, i) => {
        const p = (frame - f.t) / FLY;
        if (p < 0 || p >= 1) return null;
        const [x0, y0] = archer(f.from);
        const [x1, y1] = pos(BOATS[f.boat]);
        const x = lerp(x0, x1, p);
        const y = lerp(y0, y1 - 10 * s, p) - Math.sin(p * Math.PI) * 40 * s;
        const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${ang})`}>
            <line x1={-16 * s} y1={0} x2={0} y2={0} stroke={C.ink} strokeWidth={2 * s} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

// Cao's camp: a row of tents on the north bank.
export const CaoCamp = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = interpolate(frame, [start, start + 15, end, end + 15], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {Array.from({ length: 11 }, (_, i) => {
        const [x, y] = projection(river(0.02 + i * 0.095, CAMP_D + (i % 2) * 0.004)) ?? [0, 0];
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <Tent size={34 * s} />
          </g>
        );
      })}
    </g>
  );
};

// Fog: soft radial blobs drifting slowly across the frame (no blur filters, so it stays fast to render).
export const Fog = ({ start, peak, clear, end }: { start: number; peak: number; clear: number; end: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const o = interpolate(frame, [start, peak, clear, end], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o * 0.78 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const w = (0.45 + random(`fw${i}`) * 0.5) * width;
        const h = w * (0.35 + random(`fh${i}`) * 0.2);
        const x = ((random(`fx${i}`) * 1.4 - 0.2) * width + (frame - start) * (0.6 + random(`fv${i}`)) * (width / 1920)) % (width * 1.3) - w * 0.3;
        const y = (random(`fy${i}`) * 1.1 - 0.05) * height - h / 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(250,246,236,0.85), rgba(250,246,236,0))",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// One boat at Ruxu that leans under arrows on one side, turns, and rights itself (the recorded version).
export const SunQuanBoat = ({ at, appear, leanStart, turnAt, until }: { at: [number, number]; appear: number; leanStart: number; turnAt: number; until: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = interpolate(frame, [appear, appear + 12, until, until + 12], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const xy = projection(at);
  if (!xy) return null;
  const lean = interpolate(frame, [leanStart, turnAt - 10], [0, 14], clamp);
  const right = interpolate(frame, [turnAt + 6, turnAt + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const flip = interpolate(frame, [turnAt - 8, turnAt + 8], [1, -1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const arrowsA = Math.round(interpolate(frame, [leanStart, turnAt], [0, 38], clamp));
  const arrowsB = Math.round(interpolate(frame, [turnAt + 6, turnAt + 40], [0, 38], clamp));
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={o}>
      <ellipse cx={0} cy={12 * s} rx={120 * s} ry={14 * s} fill={C.river} opacity={0.25} />
      <StrawBoat size={150 * s} flip={flip} tilt={lean * (1 - right)} arrows={frame < turnAt ? arrowsA : arrowsB} seed={frame < turnAt ? 91 : 92} straw={false} />
    </g>
  );
};
