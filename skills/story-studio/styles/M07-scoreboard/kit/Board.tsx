import { loadFont } from "@remotion/google-fonts/Mitr";
import { geoContains, geoOrthographic } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { useMemo, type ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";
import { projectionFor, type Cam } from "../../../components/camera";
import { region } from "../../../components/Region";

// M07 board game: the territory map printed as a game board of square tiles (each tile takes the colour of the
// side that holds it), wooden pawns standing on the cities, a score track where each side's marker counts its
// cities, an era card and a die. Top-down light with soft shadows; the whole board tilts gently on the table.

export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  table: "#2a1a10", // walnut table
  board: "#fbf3df", // printed board card
  edge: "#1d3557", // board edge print
  sea: "#74d3e6",
  seaDark: "#3aa6bf",
  sand: "#f1dfb0", // unheld land tile
  ink: "#1d2433",
  // sides — bright printed / plastic colours, kept for the whole video
  wei: "#2b47c9",
  shu: "#2fae5a",
  wu: "#e2452f",
  han: "#f2b632",
  dong: "#8e52c8",
  yuan: "#f08a24",
  jin: "#7a7f8c",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (f: number, a: number, b: number, c?: number, d?: number) => (c === undefined ? interpolate(f, [a, b], [0, 1], clamp) : interpolate(f, [a, b, c, d!], [0, 1, 1, 0], clamp));

const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

type Box = [number, number, number, number];
// Layout per format (px). `board` = outer board, `track` = score track, `card` = era card.
export const useBoardLayout = () => {
  const { width, height, fps } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  return vertical
    ? { width, height, fps, vertical, s, board: [40, 520, 1000, 1000] as Box, track: [40, 1650, 1000, 96] as Box, card: [60, 290, 600, 200] as Box, die: [770, 320, 140, 140] as Box, title: [0, 70] }
    : { width, height, fps, vertical, s, board: [500, 40, 1000, 1000] as Box, track: [1580, 70, 110, 940] as Box, card: [50, 330, 410, 260] as Box, die: [180, 640, 140, 140] as Box, title: [50, 60] };
};

// Fixed camera of the printed map: fit [w, s, e, n] into the inner board.
export const useBoardProjection = (bb: [number, number, number, number], centre?: [number, number]) => {
  const { width, height, board } = useBoardLayout();
  return useMemo(() => {
    const inner: Box = [board[0] + 56, board[1] + 56, board[2] - 112, board[3] - 112];
    const [w, so, e, n] = bb;
    const lon = centre?.[0] ?? (w + e) / 2;
    const lat = centre?.[1] ?? (so + n) / 2;
    const p0 = geoOrthographic().rotate([-lon, -lat]).fitSize([inner[2], inner[3]], region([[w, so], [w, n], [e, n], [e, so]]));
    const cam: Cam = { lon, lat, scale: p0.scale() };
    const proj = projectionFor(cam, width, height, (inner[1] + inner[3] / 2) / height, (inner[0] + inner[2] / 2) / width);
    return { proj, inner };
  }, [bb, centre, width, height, board]);
};

import type { Era } from "./eras";
export type { Era, Side } from "./eras";
export type Step = { year: number; at: number };
export const stepAt = (steps: Step[], frame: number) => steps.reduce((cur, st, i) => (frame >= st.at ? i : cur), 0);

// Walnut table under a soft top light.
export const Table = () => {
  const { width, height } = useBoardLayout();
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="m07-wood" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.003 0.09" numOctaves={3} seed={2} />
          <feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 1.3 -0.5" />
        </filter>
        <radialGradient id="m07-light" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#fff2dc" stopOpacity={0.16} />
          <stop offset="0.7" stopColor="#000" stopOpacity={0.1} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={C.table} />
      <rect width={width} height={height} filter="url(#m07-wood)" />
      <rect width={width} height={height} fill="url(#m07-light)" />
    </svg>
  );
};

type Cell = { x: number; y: number; land: boolean; hold: Record<number, string | undefined> };

// The printed board: thick edge with a checker border, sea and land tiles coloured by holder, side names.
// Tiles flip in a wave from west to east at every step (only the ones that change hands).
export const GameBoard = ({ steps, eras, bb, centre, children, start = 0, cellPx = 34 }: { steps: Step[]; eras: Record<number, Era>; bb: [number, number, number, number]; centre?: [number, number]; children?: ReactNode; start?: number; cellPx?: number }) => {
  const frame = useCurrentFrame();
  const { width, height, board, s } = useBoardLayout();
  const { proj, inner } = useBoardProjection(bb, centre);
  const cells = useMemo(() => {
    const out: Cell[] = [];
    const nx = Math.floor(inner[2] / cellPx);
    const ny = Math.floor(inner[3] / cellPx);
    const ox = inner[0] + (inner[2] - nx * cellPx) / 2;
    const oy = inner[1] + (inner[3] - ny * cellPx) / 2;
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const x = ox + i * cellPx;
        const y = oy + j * cellPx;
        const ll = proj.invert!([x + cellPx / 2, y + cellPx / 2]);
        if (!ll) continue;
        const land = geoContains(LAND, ll);
        const hold: Record<number, string | undefined> = {};
        if (land) for (const st of steps) hold[st.year] = eras[st.year].sides.find((sd) => geoContains(sd.area, ll))?.key;
        out.push({ x, y, land, hold });
      }
    return out;
  }, [proj, inner, steps, eras, cellPx]);
  const cur = stepAt(steps, frame);
  const colorOf = (year: number, key?: string) => (key ? eras[year].sides.find((sd) => sd.key === key)?.color ?? C.sand : C.sand);
  const [bx, by, bw, bh] = board;
  const g = 5 * s;
  // checker border round the board, like a printed edge track
  const border: ReactNode[] = [];
  const sq = 28;
  const nX = Math.floor((bw - 24) / sq);
  const nY = Math.floor((bh - 24) / sq);
  for (let i = 0; i < nX; i++) {
    border.push(<rect key={`t${i}`} x={bx + 12 + i * sq} y={by + 12} width={sq} height={sq} fill={i % 2 ? C.edge : "#f4c430"} />);
    border.push(<rect key={`b${i}`} x={bx + 12 + i * sq} y={by + 12 + (nY - 1) * sq} width={sq} height={sq} fill={i % 2 ? "#f4c430" : C.edge} />);
  }
  for (let j = 1; j < nY - 1; j++) {
    border.push(<rect key={`l${j}`} x={bx + 12} y={by + 12 + j * sq} width={sq} height={sq} fill={j % 2 ? C.edge : "#f4c430"} />);
    border.push(<rect key={`r${j}`} x={bx + 12 + (nX - 1) * sq} y={by + 12 + j * sq} width={sq} height={sq} fill={j % 2 ? "#f4c430" : C.edge} />);
  }
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <filter id="m07-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={14 * s} />
        </filter>
        <linearGradient id="m07-gloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.22} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      {/* board slab: shadow, thick edge, printed face */}
      <rect x={bx + 14 * s} y={by + 26 * s} width={bw} height={bh} rx={18} fill="#000" opacity={0.55} filter="url(#m07-soft)" />
      <rect x={bx} y={by + 12} width={bw} height={bh} rx={18} fill="#0f1d33" />
      <rect x={bx} y={by} width={bw} height={bh} rx={18} fill={C.board} />
      {border}
      <rect x={inner[0] - 6} y={inner[1] - 6} width={inner[2] + 12} height={inner[3] + 12} rx={6} fill={C.seaDark} stroke={C.ink} strokeWidth={3} />
      {cells.map((c, n) => {
        const delay = ((c.x - inner[0]) / inner[2]) * 28 + ((c.y - inner[1]) / inner[3]) * 6;
        const deal = spring({ frame: frame - start - delay * 0.6, fps: 30, config: { damping: 14 } });
        if (deal <= 0.01) return null;
        if (!c.land) {
          return (
            <g key={n} opacity={Math.min(1, deal)}>
              <rect x={c.x + 1.5} y={c.y + 1.5} width={cellPx - 3} height={cellPx - 3} rx={4} fill={C.sea} />
              {n % 7 === 0 && <path d={`M${c.x + 8} ${c.y + cellPx / 2} q4 -5 8 0 t8 0`} stroke="#bfe6fb" strokeWidth={2} fill="none" />}
            </g>
          );
        }
        // flip: if the holder changed at the current step, the tile turns over at its wave time
        const st = steps[cur];
        const prev = cur > 0 ? steps[cur - 1] : undefined;
        const changed = prev && prev.year !== st.year && c.hold[prev.year] !== c.hold[st.year];
        const tf = changed ? interpolate(frame, [st.at + delay, st.at + delay + 8], [0, 1], clamp) : 1;
        const year = changed && tf < 0.5 ? prev!.year : st.year;
        const sy = changed ? Math.abs(Math.cos(tf * Math.PI)) : 1;
        const lift = changed ? Math.sin(tf * Math.PI) * 6 : 0;
        const fill = colorOf(year, c.hold[year]);
        const cx = c.x + cellPx / 2;
        const cy = c.y + cellPx / 2;
        return (
          <g key={n} transform={`translate(${cx},${cy - lift}) scale(${Math.min(1, deal)},${Math.min(1, deal) * Math.max(0.08, sy)})`}>
            <rect x={-cellPx / 2 + 2.5} y={-cellPx / 2 + 4} width={cellPx - 3} height={cellPx - 3} rx={5} fill="#000" opacity={0.28} />
            <rect x={-cellPx / 2 + 1.5} y={-cellPx / 2 + 1.5} width={cellPx - 3} height={cellPx - 3} rx={5} fill={fill} />
            <rect x={-cellPx / 2 + 4} y={-cellPx / 2 + 3.5} width={cellPx - 8} height={(cellPx - 3) * 0.32} rx={3} fill="#fff" opacity={0.22} />
          </g>
        );
      })}
      {/* side names printed on the board */}
      {steps.map((st, i) => {
        const o = i === cur ? fade(frame, (i ? st.at + 22 : start + 30), (i ? st.at + 32 : start + 40)) : 0;
        if (o <= 0) return null;
        return eras[st.year].sides.map((sd) => {
          const p = proj(sd.label);
          if (!p) return null;
          return (
            <text key={`${st.year}${sd.key}`} x={p[0]} y={p[1]} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={64 * s} fill="#fff" stroke={C.ink} strokeWidth={10 * s} paintOrder="stroke" strokeLinejoin="round" opacity={o}>
              {sd.name}
            </text>
          );
        });
      })}
      <rect x={bx} y={by} width={bw} height={bh} rx={18} fill="url(#m07-gloss)" pointerEvents="none" />
      {children}
    </svg>
  );
};

// A wooden pawn standing on a city, in the holder's colour; hops and changes colour when the city changes hands.
export const Pawn = ({ x, y, color, from, hop = 0, label, k = 1 }: { x: number; y: number; color: string; from?: string; hop?: number; label?: string; k?: number }) => {
  const { s } = useBoardLayout();
  const up = Math.sin(hop * Math.PI) * 46 * s;
  const fill = hop > 0 && hop < 0.5 && from ? from : color;
  const r = 15 * s * k;
  const h = 40 * s * k;
  return (
    <g>
      <ellipse cx={x + 9 * s} cy={y + 8 * s} rx={r * 1.5 * (1 - hop * 0.3)} ry={r * 0.75 * (1 - hop * 0.3)} fill="#000" opacity={0.35 - hop * 0.15} style={{ filter: `blur(${4 * s}px)` }} />
      <g transform={`translate(${x},${y - up})`}>
        <ellipse cx={0} cy={0} rx={r * 1.35} ry={r * 0.6} fill={fill} stroke={C.ink} strokeWidth={2.4 * s} />
        <path d={`M${-r * 0.95} 0 C${-r * 0.7} ${-h * 0.45} ${-r * 0.35} ${-h * 0.6} ${-r * 0.35} ${-h * 0.72} L${r * 0.35} ${-h * 0.72} C${r * 0.35} ${-h * 0.6} ${r * 0.7} ${-h * 0.45} ${r * 0.95} 0 Z`} fill={fill} stroke={C.ink} strokeWidth={2.4 * s} />
        <circle cx={0} cy={-h * 0.86} r={r * 0.68} fill={fill} stroke={C.ink} strokeWidth={2.4 * s} />
        <path d={`M${-r * 0.55} ${-h * 0.15} C${-r * 0.4} ${-h * 0.45} ${-r * 0.2} ${-h * 0.55} ${-r * 0.15} ${-h * 0.68}`} stroke="#fff" strokeWidth={3 * s} fill="none" opacity={0.45} strokeLinecap="round" />
        <circle cx={-r * 0.25} cy={-h * 0.92} r={r * 0.2} fill="#fff" opacity={0.55} />
      </g>
      {label && (
        <g>
          <rect x={x - (label.length * 8 + 10) * s} y={y + 12 * s} width={(label.length * 16 + 20) * s} height={30 * s} rx={15 * s} fill="#fff" stroke={C.ink} strokeWidth={2 * s} />
          <text x={x} y={y + 34 * s} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={19 * s} fill={C.ink}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

// Score track: squares 0 … n, one marker per side sitting on its count; markers hop to a new square.
export const ScoreTrack = ({ n, sides, start = 0, title = "เมืองในมือ" }: { n: number; sides: { key: string; color: string; name: string; count: number; at: number }[]; start?: number; title?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, track, vertical, s, fps } = useBoardLayout();
  const o = fade(frame, start, start + 12);
  if (o <= 0) return null;
  const [tx, ty, tw, th] = track;
  const step = (vertical ? tw : th) / (n + 1);
  const pos = (v: number) => (vertical ? [tx + step * (v + 0.5), ty + th / 2] : [tx + tw / 2, ty + th - step * (v + 0.5)]);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: o, overflow: "visible" }}>
      <rect x={tx + 8} y={ty + 14} width={tw} height={th} rx={14} fill="#000" opacity={0.4} style={{ filter: `blur(${8 * s}px)` }} />
      <rect x={tx} y={ty} width={tw} height={th} rx={14} fill={C.board} stroke={C.ink} strokeWidth={3} />
      {Array.from({ length: n + 1 }, (_, v) => {
        const [cx, cy] = pos(v);
        const a = step * 0.86;
        return (
          <g key={v}>
            <rect x={cx - a / 2} y={cy - a / 2} width={a} height={a} rx={8} fill={v % 2 ? "#f4c430" : "#ffffff"} stroke={C.ink} strokeWidth={2} />
            <text x={cx} y={cy + (vertical ? a * 0.42 : a * 0.12)} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={(vertical ? 18 : 24) * s} fill={C.ink} opacity={vertical ? 0.55 : 0.4}>
              {v}
            </text>
          </g>
        );
      })}
      <text x={vertical ? tx : tx + tw / 2} y={vertical ? ty - 16 : ty - 14} textAnchor={vertical ? "start" : "middle"} fontFamily={font} fontWeight={600} fontSize={28 * s} fill="#fff">
        {title}
      </text>
      {sides.map((sd, i) => {
        const k = spring({ frame: frame - sd.at, fps, config: { damping: 15 } });
        const hop = Math.sin(Math.min(1, Math.max(0, (frame - sd.at) / 14)) * Math.PI);
        const [cx, cy] = pos(sd.count);
        const off = (i - (sides.length - 1) / 2) * 22 * s;
        const x = cx + off * (vertical ? 1.1 : 1);
        const y = cy + (vertical ? -4 * s : 0) - hop * 30 * s;
        const r = 17 * s;
        return (
          <g key={sd.key} opacity={Math.min(1, k * 2)}>
            <ellipse cx={x + 5} cy={y + 9 + hop * 24 * s} rx={r} ry={r * 0.5} fill="#000" opacity={0.3} />
            <rect x={x - r} y={y - r * 0.6} width={r * 2} height={r * 1.1} fill={sd.color} stroke={C.ink} strokeWidth={2} />
            <ellipse cx={x} cy={y + r * 0.5} rx={r} ry={r * 0.45} fill={sd.color} stroke={C.ink} strokeWidth={2} />
            <rect x={x - r + 1} y={y - r * 0.2} width={r * 2 - 2} height={r * 0.7} fill={sd.color} />
            <ellipse cx={x} cy={y - r * 0.6} rx={r} ry={r * 0.45} fill={sd.color} stroke={C.ink} strokeWidth={2} />
            <ellipse cx={x - r * 0.3} cy={y - r * 0.7} rx={r * 0.35} ry={r * 0.12} fill="#fff" opacity={0.5} />
          </g>
        );
      })}
    </svg>
  );
};

// Era card dealt from a deck: year big, era title, a coloured stripe per side. A new card flips in at each step.
export const EraCard = ({ steps, eras, start = 0 }: { steps: Step[]; eras: Record<number, Era>; start?: number }) => {
  const frame = useCurrentFrame();
  const { card, s, fps } = useBoardLayout();
  const [x, y, w, h] = card;
  const cur = stepAt(steps, frame);
  const st = steps[cur];
  const t0 = cur === 0 ? start : st.at;
  const k = spring({ frame: frame - t0, fps, config: { damping: 13 } });
  const rot = (1 - k) * 90;
  const era = eras[st.year];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, perspective: 1400 * s }}>
      {[2, 1].map((d) => (
        <div key={d} style={{ position: "absolute", inset: 0, transform: `translate(${d * 6 * s}px,${d * 6 * s}px)`, background: "#e9dcbc", border: `${3 * s}px solid ${C.ink}`, borderRadius: 18 * s, boxShadow: `0 ${8 * s}px ${18 * s}px rgba(0,0,0,0.35)` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, transform: `rotateY(${rot}deg) rotate(-2deg)`, transformOrigin: "left center", background: C.board, border: `${3 * s}px solid ${C.ink}`, borderRadius: 18 * s, boxShadow: `0 ${12 * s}px ${24 * s}px rgba(0,0,0,0.45)`, overflow: "hidden", fontFamily: font, color: C.ink }}>
        <div style={{ display: "flex", height: 14 * s }}>
          {era.sides.map((sd) => <div key={sd.key} style={{ flex: 1, background: sd.color }} />)}
        </div>
        <div style={{ padding: `${8 * s}px ${24 * s}px` }}>
          <div style={{ fontSize: 24 * s, fontWeight: 500, opacity: 0.7 }}>การ์ดยุค · ตาที่ {cur + 1}</div>
          <div style={{ fontSize: 76 * s, fontWeight: 700, lineHeight: 1.12 }}>ค.ศ. {st.year}</div>
          <div style={{ fontSize: 32 * s, fontWeight: 600 }}>{era.title}</div>
        </div>
      </div>
    </div>
  );
};

// A die that tumbles at every step and lands on the number of sides in play.
export const Die = ({ steps, eras }: { steps: Step[]; eras: Record<number, Era> }) => {
  const frame = useCurrentFrame();
  const { die, s } = useBoardLayout();
  const [x, y, w] = die;
  const cur = stepAt(steps, frame);
  const t = Math.min(1, Math.max(0, (frame - steps[cur].at) / 18));
  const roll = cur === 0 ? 0 : (1 - t) * 1;
  const faces = [1, 2, 3, 4, 5, 6];
  const n = roll > 0.05 ? faces[Math.floor(frame / 2) % 6] : Math.min(6, eras[steps[cur].year].sides.length);
  const pips: Record<number, [number, number][]> = { 1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]], 4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], 5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]], 6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]] };
  const ang = 14 + roll * 400;
  const jump = Math.sin(t * Math.PI) * (cur ? 40 * s : 0);
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div style={{ position: "absolute", left: 14 * s, top: 20 * s, width: w, height: w, borderRadius: 22 * s, background: "rgba(0,0,0,0.45)", filter: `blur(${8 * s}px)` }} />
      <div style={{ position: "absolute", width: w, height: w, transform: `translateY(${-jump}px) rotate(${ang}deg)`, borderRadius: 24 * s, background: "linear-gradient(145deg,#ffffff,#e6e1d6)", border: `${3 * s}px solid ${C.ink}`, boxShadow: `inset ${-6 * s}px ${-8 * s}px 0 rgba(0,0,0,0.08)` }}>
        {pips[n].map(([px, py], i) => (
          <div key={i} style={{ position: "absolute", left: px * w - 11 * s, top: py * w - 11 * s, width: 22 * s, height: 22 * s, borderRadius: "50%", background: n === 1 ? C.wu : C.ink }} />
        ))}
      </div>
    </div>
  );
};
