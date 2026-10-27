import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { type Costume, Depth, Fighter, Glow, Grass, PAL, Ridge } from "../../../components/Scene";
import { clamp, GOLD, Panel } from "../../worldhistory/kit/news";
import { COSTUME_W, Flag, LogHouse, OnionChurch, Pine, REAL, RU_FLAG, RUSSIA, Snow, SnowGround, US_FLAG, WHATIF } from "../kit/WhatIf";
import { P } from "./places";
import { Aurora } from "./scenes0";

// Style-v2 panels for chapters 7 (what it means for you) and 8 (the answer). One scene per idea, each used once.

type PP = { start: number; end: number };
const civ = (jacket: string, pants = "#2f3a4a", skin = "#e0b08a"): Costume => ({ jacket, sash: "#3a2a22", pants, head: "short", skin });
const CIV = [civ("#a8442e"), civ("#2f6f8f", "#3a3a3a", "#8d5a3b"), civ("#c9a23a", "#44506a"), civ("#4f7a46", "#2a2a2a", "#c48a62"), civ("#6a4a8a")];

// ---- small props ----

// Animated sea band from y down, `n` wave rows, colour pair.
const Sea = ({ g, y, shift = 0, color = "#2f5a74", crest = "#9cc4d8", amp = 6, speed = 0.08 }: { g: InsetGeom; y: number; shift?: number; color?: string; crest?: string; amp?: number; speed?: number }) => {
  const frame = useCurrentFrame();
  const rows = 4;
  return (
    <g>
      <rect x={g.x} y={y} width={g.W} height={g.y + g.H - y} fill={color} />
      {Array.from({ length: rows }, (_, r) => {
        const yy = y + ((r + 0.5) * (g.y + g.H - y)) / rows;
        const pts = Array.from({ length: 24 }, (_, i) => `${g.x - 60 * g.s + i * ((g.W + 120 * g.s) / 23) + shift * (0.5 + r * 0.3)},${yy + Math.sin(i * 1.3 + frame * speed + r) * amp * g.s * (1 + r * 0.4)}`).join(" L");
        return <path key={r} d={`M${pts}`} fill="none" stroke={crest} strokeWidth={(1.4 + r * 0.6) * g.s} opacity={0.35 + r * 0.12} />;
      })}
    </g>
  );
};

// A fishing trawler, bobbing. x = bow-to-stern centre.
const Trawler = ({ x, y, s, tilt = 0 }: { x: number; y: number; s: number; tilt?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt})`} stroke={PAL.ink} strokeWidth={1.8 * s}>
    <path d={`M${-120 * s} ${-30 * s} L${110 * s} ${-36 * s} L${90 * s} ${8 * s} L${-100 * s} ${8 * s} Z`} fill="#b8322a" />
    <rect x={-120 * s} y={-38 * s} width={232 * s} height={8 * s} fill="#efe6d0" />
    <rect x={-70 * s} y={-82 * s} width={70 * s} height={44 * s} fill="#efe6d0" />
    {[0, 1, 2].map((i) => <rect key={i} x={(-62 + i * 22) * s} y={-74 * s} width={14 * s} height={12 * s} fill="#ffcf7a" strokeWidth={1 * s} />)}
    <line x1={40 * s} y1={-38 * s} x2={40 * s} y2={-130 * s} strokeWidth={4 * s} />
    <line x1={40 * s} y1={-120 * s} x2={100 * s} y2={-40 * s} strokeWidth={1.6 * s} />
    <line x1={40 * s} y1={-120 * s} x2={-10 * s} y2={-82 * s} strokeWidth={1.6 * s} />
  </g>
);

// A tall-masted sailing ship (1860s), heeling a little.
const SailShip = ({ x, y, s, tilt = 0 }: { x: number; y: number; s: number; tilt?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt})`} stroke={PAL.ink} strokeWidth={1.6 * s}>
    <path d={`M${-90 * s} ${-20 * s} L${100 * s} ${-24 * s} L${76 * s} ${6 * s} L${-74 * s} ${6 * s} Z`} fill="#4a3322" />
    {[-40, 10, 56].map((mx, i) => (
      <g key={i}>
        <line x1={mx * s} y1={-22 * s} x2={mx * s} y2={(-150 + i * 10) * s} strokeWidth={3 * s} />
        <path d={`M${(mx - 30) * s} ${(-130 + i * 10) * s} Q${(mx + 4) * s} ${(-118 + i * 10) * s} ${(mx + 30) * s} ${(-130 + i * 10) * s} L${(mx + 26) * s} ${(-90 + i * 8) * s} Q${mx * s} ${(-80 + i * 8) * s} ${(mx - 26) * s} ${(-90 + i * 8) * s} Z`} fill="#efe6d0" />
        <path d={`M${(mx - 24) * s} ${(-84 + i * 8) * s} Q${(mx + 2) * s} ${(-72 + i * 8) * s} ${(mx + 24) * s} ${(-84 + i * 8) * s} L${(mx + 20) * s} ${-40 * s} Q${mx * s} ${-32 * s} ${(mx - 20) * s} ${-40 * s} Z`} fill="#e4d8bc" />
      </g>
    ))}
  </g>
);

// Seagulls drifting across.
const Gulls = ({ g, n = 4, y0 = 0.2 }: { g: InsetGeom; n?: number; y0?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g fill="none" stroke="#f4f4f4" strokeWidth={2.2 * g.s} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const x = g.x + ((i * 230 * g.s + frame * (1.2 + i * 0.3) * g.s) % (g.W + 100 * g.s)) - 50 * g.s;
        const y = g.y + g.H * (y0 + i * 0.05) + Math.sin(frame * 0.07 + i) * 6 * g.s;
        const w = Math.sin(frame * 0.35 + i * 2) * 5 * g.s;
        return <path key={i} d={`M${x - 12 * g.s} ${y + w} Q${x - 6 * g.s} ${y - 6 * g.s} ${x} ${y} Q${x + 6 * g.s} ${y - 6 * g.s} ${x + 12 * g.s} ${y + w}`} />;
      })}
    </g>
  );
};

// Caribou walking (simple jointed legs).
const Caribou = ({ x, y, s, phase = 0 }: { x: number; y: number; s: number; phase?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.25 + phase;
  return (
    <g transform={`translate(${x},${y})`} stroke={PAL.ink} strokeWidth={1.4 * s}>
      <ellipse cx={0} cy={2 * s} rx={22 * s} ry={3 * s} fill="#000" opacity={0.25} stroke="none" />
      {[-14, -8, 10, 16].map((lx, i) => (
        <line key={i} x1={lx * s} y1={-20 * s} x2={(lx + Math.sin(t + i * 1.6) * 6) * s} y2={0} strokeWidth={3 * s} stroke="#4a3a2a" />
      ))}
      <ellipse cx={0} cy={-26 * s} rx={22 * s} ry={10 * s} fill="#8a6a4a" />
      <path d={`M${16 * s} ${-30 * s} L${26 * s} ${-44 * s} L${32 * s} ${-42 * s} L${26 * s} ${-26 * s} Z`} fill="#8a6a4a" />
      <path d={`M${26 * s} ${-44 * s} q${-6 * s} ${-14 * s} ${2 * s} ${-22 * s} M${28 * s} ${-44 * s} q${10 * s} ${-12 * s} ${4 * s} ${-24 * s}`} fill="none" stroke="#e8dcc0" strokeWidth={2.4 * s} />
      <ellipse cx={-4 * s} cy={-20 * s} rx={10 * s} ry={4 * s} fill="#efe6d0" stroke="none" />
    </g>
  );
};

// The pipeline: a zig-zag on stilts across the panel.
const Pipe = ({ g, y, shift = 0, color = "#c9ccd2" }: { g: InsetGeom; y: number; shift?: number; color?: string }) => {
  const pts = Array.from({ length: 9 }, (_, i) => [g.x - 80 * g.s + i * ((g.W + 160 * g.s) / 8) + shift, y + (i % 2 ? -8 : 8) * g.s]);
  return (
    <g>
      {pts.map(([px, py], i) => <line key={i} x1={px} y1={py} x2={px} y2={py + 26 * g.s} stroke="#5a5a5a" strokeWidth={3 * g.s} />)}
      <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} fill="none" stroke={PAL.ink} strokeWidth={13 * g.s} strokeLinejoin="round" />
      <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} fill="none" stroke={color} strokeWidth={9 * g.s} strokeLinejoin="round" />
    </g>
  );
};

// Suburban house with a lit window.
const House = ({ x, y, w, h, s, wall = "#d8cbb0", roof = "#5a3a32", lit = 1 }: { x: number; y: number; w: number; h: number; s: number; wall?: string; roof?: string; lit?: number }) => (
  <g stroke={PAL.ink} strokeWidth={1.6 * s}>
    <rect x={x} y={y - h} width={w} height={h} fill={wall} />
    <path d={`M${x - 8 * s} ${y - h} L${x + w / 2} ${y - h - h * 0.55} L${x + w + 8 * s} ${y - h} Z`} fill={roof} />
    <rect x={x + w * 0.15} y={y - h * 0.7} width={w * 0.24} height={h * 0.3} fill="#ffcf7a" opacity={0.35 + 0.6 * lit} />
    <rect x={x + w * 0.6} y={y - h * 0.7} width={w * 0.24} height={h * 0.3} fill="#ffcf7a" opacity={0.25 + 0.6 * lit} />
    <rect x={x + w * 0.42} y={y - h * 0.45} width={w * 0.14} height={h * 0.45} fill="#4a3322" />
  </g>
);

// Vertical tricolour flag (France), waving.
const FlagV = ({ x, y, s, h = 150, colors, w = 66 }: { x: number; y: number; s: number; h?: number; colors: string[]; w?: number }) => {
  const frame = useCurrentFrame();
  const fh = w * 0.66 * s;
  const fw = w * s;
  const top = y - h * s;
  const col = (i: number) => {
    const x0 = x + (i * fw) / colors.length;
    const x1 = x + ((i + 1) * fw) / colors.length;
    const d0 = Math.sin(frame * 0.22 - i * 1.4) * 4 * s * (i / colors.length);
    const d1 = Math.sin(frame * 0.22 - (i + 1) * 1.4) * 4 * s * ((i + 1) / colors.length);
    return `M${x0} ${top + d0} L${x1} ${top + d1} L${x1} ${top + fh + d1} L${x0} ${top + fh + d0} Z`;
  };
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={top - 6 * s} stroke="#3a2a1c" strokeWidth={4 * s} />
      {colors.map((c, i) => <path key={i} d={col(i)} fill={c} stroke={PAL.ink} strokeWidth={1 * s} />)}
    </g>
  );
};

// ---- chapter 7 panels ----

// you1: dusk in a Lower-48 suburb, a family on the porch.
export const PorchPanel = ({ start, end }: PP) => (
  <Panel id="porch" anchor={P.seattle} start={start} end={end} sky={["#3a3a6e", "#f0a36a"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="porch" start={start} end={end} warm={0.1}>
        {(pan) => {
          const horizon = g.y + g.H * 0.62;
          return (
            <g>
              <Glow x={g.x + g.W * 0.8} y={horizon - 30 * g.s} s={g.s * 0.8} color="#ffb35a" core="#ffe0a8" />
              <Ridge g={g} base={horizon} amp={30 * g.s} seed={4} color="#6a5a7a" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {[0.02, 0.24, 0.62, 0.84].map((fx, i) => <House key={i} x={g.x + g.W * fx} y={horizon + 30 * g.s} w={120 * g.s} h={60 * g.s} s={g.s} wall={["#d8cbb0", "#b8c8d8", "#e0d0a8", "#c8b0a0"][i]} lit={0.8} />)}
                {Array.from({ length: 6 }, (_, i) => <Pine key={i} x={g.x + g.W * (0.18 + i * 0.15)} y={horizon + 32 * g.s} h={70 * g.s} color="#2a4a32" snow={false} />)}
              </g>
              <rect x={g.x} y={horizon + 30 * g.s} width={g.W} height={g.H} fill="#4f6a3a" />
              <rect x={g.x} y={horizon + 54 * g.s} width={g.W} height={14 * g.s} fill="#8a8a82" />
              {/* porch + family, the subject */}
              <g transform={`translate(${pan * 0.75},0)`}>
                <rect x={g.x + g.W * 0.32} y={g.ground - 24 * g.s} width={g.W * 0.4} height={24 * g.s} fill="#7a5a3a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <Fighter x={g.x + g.W * 0.42} y={g.ground - 24 * g.s} scale={g.sc * 0.85} mode="stand" costume={CIV[0]} weapon="none" />
                <Fighter x={g.x + g.W * 0.52} y={g.ground - 24 * g.s} scale={g.sc * 0.82} mode="stand" costume={CIV[1]} weapon="none" phase={2} flip />
                <Fighter x={g.x + g.W * 0.6} y={g.ground - 24 * g.s} scale={g.sc * 0.55} mode="stand" costume={CIV[2]} weapon="none" phase={4} />
              </g>
              <g transform={`translate(${pan * 1.6},0)`}>
                {Array.from({ length: 22 }, (_, i) => <rect key={i} x={g.x - 40 * g.s + i * 50 * g.s} y={g.y + g.H - 50 * g.s} width={10 * g.s} height={50 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                <rect x={g.x - 40 * g.s} y={g.y + g.H - 40 * g.s} width={g.W + 80 * g.s} height={8 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />
                <Grass g={g} shift={0} color="#33502a" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// you2: the pipeline on stilts across the summer tundra, caribou walking under it.
export const TundraPipePanel = ({ start, end }: PP) => (
  <Panel id="tundrapipe" anchor={P.prudhoe} start={start} end={end} sky={["#8fb4d6", "#e8eef0"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="tundrapipe" start={start} end={end} warm={0.05}>
        {(pan) => {
          const horizon = g.y + g.H * 0.55;
          return (
            <g>
              <Glow x={g.x + g.W * 0.15} y={g.y + 60 * g.s} s={g.s * 0.7} color="#fff4d0" core="#ffffff" />
              <Ridge g={g} base={horizon} amp={60 * g.s} seed={6} color="#c6ccd8" shift={pan * 0.2} />
              <Ridge g={g} base={horizon + 20 * g.s} amp={18 * g.s} seed={9} color="#8a9a6a" shift={pan * 0.4} />
              <rect x={g.x} y={horizon + 18 * g.s} width={g.W} height={g.H} fill="#7d8a52" />
              <g transform={`translate(${pan * 0.6},0)`}>
                <Pipe g={g} y={horizon + 46 * g.s} />
              </g>
              {[0, 1, 2, 3].map((i) => <Caribou key={i} x={g.x + interpolate(g.frame, [start, end], [g.W * (0.1 + i * 0.16), g.W * (0.3 + i * 0.16)], clamp)} y={g.ground - (i % 2) * 8 * g.s} s={g.s * (0.9 + (i % 2) * 0.15)} phase={i * 1.7} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                {Array.from({ length: 26 }, (_, i) => <ellipse key={i} cx={g.x + i * 44 * g.s} cy={g.y + g.H - 6 * g.s} rx={24 * g.s} ry={14 * g.s} fill={i % 2 ? "#5a6a3a" : "#6a7a42"} stroke={PAL.ink} strokeWidth={1 * g.s} strokeOpacity={0.4} />)}
                <Grass g={g} color="#4a5a2a" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// you2: Valdez terminal, a tanker loading under the mountains.
export const TankerPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="tanker" anchor={P.valdez} start={start} end={end} sky={["#6f8cae", "#e4e2dc"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="tanker" start={start} end={end} warm={0.05}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const bob = Math.sin(frame * 0.05) * 2 * g.s;
            return (
              <g>
                <Ridge g={g} base={horizon + 10 * g.s} amp={80 * g.s} seed={12} color="#9aa8bc" shift={pan * 0.2} />
                <Ridge g={g} base={horizon + 20 * g.s} amp={40 * g.s} seed={3} color="#4f6a5a" shift={pan * 0.4} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {[0.06, 0.16, 0.26].map((fx, i) => <g key={i}><rect x={g.x + g.W * fx} y={horizon - 10 * g.s} width={56 * g.s} height={32 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4 * g.s} /><ellipse cx={g.x + g.W * fx + 28 * g.s} cy={horizon - 10 * g.s} rx={28 * g.s} ry={6 * g.s} fill="#d8d2c4" stroke={PAL.ink} strokeWidth={1.2 * g.s} /></g>)}
                </g>
                <Sea g={g} y={horizon + 22 * g.s} shift={pan * 0.6} color="#355a6e" crest="#a8c8d8" amp={3} />
                <g transform={`translate(${pan * 0.7},${bob})`}>
                  <path d={`M${g.x + g.W * 0.3} ${g.ground - 70 * g.s} L${g.x + g.W * 0.98} ${g.ground - 74 * g.s} L${g.x + g.W * 0.94} ${g.ground - 20 * g.s} L${g.x + g.W * 0.34} ${g.ground - 20 * g.s} Z`} fill="#2b2f38" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <rect x={g.x + g.W * 0.3} y={g.ground - 46 * g.s} width={g.W * 0.66} height={10 * g.s} fill="#a8322a" />
                  <rect x={g.x + g.W * 0.82} y={g.ground - 118 * g.s} width={70 * g.s} height={46 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <line x1={g.x + g.W * 0.5} y1={g.ground - 72 * g.s} x2={g.x + g.W * 0.44} y2={g.ground - 150 * g.s} stroke="#3a3a3a" strokeWidth={6 * g.s} />
                  <line x1={g.x + g.W * 0.44} y1={g.ground - 150 * g.s} x2={g.x + g.W * 0.36} y2={g.ground - 110 * g.s} stroke="#3a3a3a" strokeWidth={6 * g.s} />
                </g>
                <Fighter x={g.x + g.W * 0.18} y={g.ground + 4 * g.s} scale={g.sc * 0.85} mode="walk" costume={{ ...CIV[4], jacket: "#e07a2a" }} weapon="none" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <rect x={g.x - 40 * g.s} y={g.y + g.H - 30 * g.s} width={g.W + 80 * g.s} height={30 * g.s} fill="#5a5a5a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0.08, 0.5, 0.9].map((fx, i) => <rect key={i} x={g.x + g.W * fx} y={g.y + g.H - 52 * g.s} width={22 * g.s} height={24 * g.s} rx={6 * g.s} fill="#2a2a2a" />)}
                </g>
                <Gulls g={g} n={3} y0={0.15} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// you3: a mail carrier walks an envelope to a roadside mailbox in the snow.
export const MailboxPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const walk = interpolate(frame, [start, end - 20], [0, 1], clamp);
  return (
    <Panel id="mailbox" anchor={P.anchorage} start={start} end={end} sky={["#7d93b4", "#dfe6ee"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="mailbox" start={start} end={end} warm={0.04}>
          {(pan) => {
            const horizon = g.y + g.H * 0.58;
            const mx = g.x + g.W * 0.62;
            const cx = g.x + g.W * (0.18 + walk * 0.36);
            return (
              <g>
                <Ridge g={g} base={horizon} amp={60 * g.s} seed={14} color="#c9d3e2" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {Array.from({ length: 10 }, (_, i) => <Pine key={i} x={g.x + (i / 9) * g.W} y={horizon + 24 * g.s} h={(70 + (i % 3) * 16) * g.s} color="#2c4a3c" />)}
                  <LogHouse x={g.x + g.W * 0.78} y={horizon + 30 * g.s} w={90 * g.s} h={46 * g.s} s={g.s} />
                </g>
                <SnowGround g={g} y={horizon + 24 * g.s} shift={pan * 0.7} />
                {/* mailbox on a post */}
                <g stroke={PAL.ink} strokeWidth={1.6 * g.s}>
                  <rect x={mx - 4 * g.s} y={g.ground - 70 * g.s} width={8 * g.s} height={70 * g.s} fill="#5a3a22" />
                  <path d={`M${mx - 30 * g.s} ${g.ground - 70 * g.s} L${mx - 30 * g.s} ${g.ground - 96 * g.s} Q${mx - 6 * g.s} ${g.ground - 118 * g.s} ${mx + 18 * g.s} ${g.ground - 96 * g.s} L${mx + 18 * g.s} ${g.ground - 70 * g.s} Z`} fill="#3a5a8a" />
                  <path d={`M${mx + 18 * g.s} ${g.ground - 104 * g.s} l${14 * g.s} 0 l0 ${12 * g.s} l${-14 * g.s} 0`} fill="#c9302c" />
                  <path d={`M${mx - 30 * g.s} ${g.ground - 96 * g.s} Q${mx - 6 * g.s} ${g.ground - 120 * g.s} ${mx + 18 * g.s} ${g.ground - 96 * g.s}`} fill="none" stroke="#eef3f8" strokeWidth={5 * g.s} />
                </g>
                <Fighter x={cx} y={g.ground + 4 * g.s} scale={g.sc * 0.9} mode={walk < 1 ? "walk" : "stand"} costume={civ("#2b3f6e", "#2b3f6e")} weapon="none" />
                {/* the envelope in hand */}
                <rect x={cx + 6 * g.s} y={g.ground - 96 * g.s} width={26 * g.s} height={17 * g.s} fill="#f4efe2" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                <path d={`M${cx + 6 * g.s} ${g.ground - 96 * g.s} l${13 * g.s} ${9 * g.s} l${13 * g.s} ${-9 * g.s}`} fill="none" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <path d={`M${g.x - 60 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.15} ${g.y + g.H - 44 * g.s} ${g.x + g.W * 0.4} ${g.y + g.H} Z`} fill="#eef3f8" stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.4} />
                  <Pine x={g.x + g.W * 0.95} y={g.y + g.H + 20 * g.s} h={220 * g.s} color="#16281f" />
                </g>
                <Snow g={g} n={26} depth={0.3} />
                <Snow g={g} n={10} depth={0.9} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// you3: an Alaska main street at dusk, lights on, people walking.
export const MainStreetPanel = ({ start, end }: PP) => (
  <Panel id="mainstreet" anchor={P.juneau} start={start} end={end} sky={["#2c3a66", "#c98a6a"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="mainstreet" start={start} end={end} warm={0.1}>
        {(pan) => {
          const horizon = g.y + g.H * 0.6;
          return (
            <g>
              <Ridge g={g} base={horizon - 20 * g.s} amp={70 * g.s} seed={21} color="#7a86a8" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.55},0)`}>
                {[0.0, 0.17, 0.34, 0.55, 0.72, 0.88].map((fx, i) => (
                  <g key={i} stroke={PAL.ink} strokeWidth={1.4 * g.s}>
                    <rect x={g.x + g.W * fx} y={horizon - (40 + (i % 3) * 14) * g.s} width={g.W * 0.15} height={(76 + (i % 3) * 14) * g.s} fill={["#8a4a3a", "#4a6a7a", "#9a8a5a", "#5a4a6a", "#7a5a3a", "#4a6a4a"][i]} />
                    <rect x={g.x + g.W * (fx + 0.02)} y={horizon + 2 * g.s} width={g.W * 0.11} height={22 * g.s} fill="#ffcf7a" opacity={0.85} />
                    <path d={`M${g.x + g.W * fx} ${horizon - (40 + (i % 3) * 14) * g.s} l${g.W * 0.15} 0`} stroke="#eef3f8" strokeWidth={5 * g.s} />
                  </g>
                ))}
              </g>
              <rect x={g.x} y={horizon + 36 * g.s} width={g.W} height={g.H} fill="#cfd8e2" />
              <rect x={g.x} y={horizon + 52 * g.s} width={g.W} height={30 * g.s} fill="#6a6e78" />
              {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + ((i * 0.27 * g.W + (g.frame - start) * (1 + i * 0.2) * g.s) % (g.W + 60 * g.s)) - 30 * g.s} y={g.ground + (i % 2) * 6 * g.s} scale={g.sc * 0.8} mode="walk" flip={i % 2 === 1} costume={CIV[i]} weapon="none" phase={i * 1.3} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                <line x1={g.x + g.W * 0.08} y1={g.y + g.H} x2={g.x + g.W * 0.08} y2={g.y + 60 * g.s} stroke="#22262e" strokeWidth={7 * g.s} />
                <Glow x={g.x + g.W * 0.08 + 18 * g.s} y={g.y + 64 * g.s} s={g.s * 0.5} color="#ffcf7a" core="#fff1c8" />
                <path d={`M${g.x + g.W * 0.55} ${g.y + g.H} Q${g.x + g.W * 0.8} ${g.y + g.H - 36 * g.s} ${g.x + g.W + 60 * g.s} ${g.y + g.H} Z`} fill="#eef3f8" />
              </g>
              <Snow g={g} n={22} depth={0.3} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// you4: a trawler in heavy Bering Sea swell.
export const TrawlerPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="trawler" anchor={P.dutchHarbor} start={start} end={end} sky={["#3a4a5e", "#8a9aa8"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="trawler" start={start} end={end} warm={0.02}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const roll = Math.sin(frame * 0.06) * 6;
            const heave = Math.sin(frame * 0.06 + 1) * 10 * g.s;
            return (
              <g>
                <Ridge g={g} base={horizon} amp={14 * g.s} seed={2} color="#5a6a7a" shift={pan * 0.2} />
                <Sea g={g} y={horizon} shift={pan * 0.5} color="#2a4456" crest="#c8dae4" amp={9} speed={0.1} />
                <Trawler x={g.cx + 30 * g.s + pan * 0.7} y={g.ground - 30 * g.s + heave} s={g.s * 1.05} tilt={roll} />
                {/* spray at the bow when it dips */}
                <g opacity={Math.max(0, Math.sin(frame * 0.06 + 1))}>
                  {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={g.cx + 140 * g.s + pan * 0.7 + i * 6 * g.s} cy={g.ground - 50 * g.s - i * 7 * g.s + heave} r={(6 + i) * g.s} fill="#eef6fa" opacity={0.6} />)}
                </g>
                <g transform={`translate(${pan * 1.6},0)`}>
                  <path d={`M${g.x - 80 * g.s} ${g.y + g.H} L${g.x - 80 * g.s} ${g.y + g.H - 40 * g.s} ${Array.from({ length: 14 }, (_, i) => `L${g.x + i * (g.W / 12)} ${g.y + g.H - 40 * g.s - Math.sin(i * 0.9 + frame * 0.09) * 26 * g.s}`).join(" ")} L${g.x + g.W + 80 * g.s} ${g.y + g.H} Z`} fill="#1f3646" stroke="#c8dae4" strokeWidth={2 * g.s} />
                </g>
                <Gulls g={g} n={3} y0={0.12} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// you4: Dutch Harbor dock, a crane swinging a net of fish, crab pots stacked, workers.
export const DockPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const swing = Math.sin((frame - start) * 0.04) * 10;
  return (
    <Panel id="dock" anchor={P.dutchHarbor} start={start} end={end} sky={["#6a7e98", "#d8dcd8"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="dock" start={start} end={end} warm={0.04}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const deck = g.y + g.H * 0.66;
            const cx = g.x + g.W * 0.36;
            return (
              <g>
                <Ridge g={g} base={horizon} amp={70 * g.s} seed={31} color="#6f8a7a" shift={pan * 0.2} />
                <Sea g={g} y={horizon} shift={pan * 0.4} color="#36586a" crest="#a8c8d8" amp={3} />
                <g transform={`translate(${pan * 0.6},0)`}>
                  <rect x={g.x - 40 * g.s} y={deck} width={g.W + 80 * g.s} height={g.H} fill="#6a5a4a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  {/* crane */}
                  <line x1={cx} y1={deck} x2={cx} y2={g.y + 30 * g.s} stroke="#d8a02a" strokeWidth={8 * g.s} />
                  <g transform={`rotate(${swing},${cx},${g.y + 34 * g.s})`}>
                    <line x1={cx} y1={g.y + 34 * g.s} x2={cx + 200 * g.s} y2={g.y + 44 * g.s} stroke="#d8a02a" strokeWidth={7 * g.s} />
                    <line x1={cx + 190 * g.s} y1={g.y + 44 * g.s} x2={cx + 190 * g.s} y2={deck - 70 * g.s} stroke="#2a2a2a" strokeWidth={2 * g.s} />
                    <ellipse cx={cx + 190 * g.s} cy={deck - 50 * g.s} rx={34 * g.s} ry={22 * g.s} fill="#8aa0a8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={cx + (172 + (i % 3) * 16) * g.s} cy={deck - (56 - Math.floor(i / 3) * 12) * g.s} rx={8 * g.s} ry={3 * g.s} fill="#c0c8cc" />)}
                  </g>
                  {/* crab pots */}
                  {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={g.x + g.W * 0.66 + (i % 3) * 44 * g.s} y={deck - (Math.floor(i / 3) + 1) * 36 * g.s} width={40 * g.s} height={34 * g.s} fill="none" stroke="#3a3a3a" strokeWidth={2 * g.s} />)}
                </g>
                <Fighter x={g.x + g.W * 0.5} y={g.ground} scale={g.sc * 0.85} mode="stand" costume={{ ...CIV[3], jacket: "#e07a2a" }} weapon="none" />
                <Fighter x={g.x + g.W * 0.2} y={g.ground + 4 * g.s} scale={g.sc * 0.85} mode="walk" costume={{ ...CIV[1], jacket: "#e0b02a" }} weapon="none" phase={2} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 12 }, (_, i) => <rect key={i} x={g.x + i * 100 * g.s} y={g.y + g.H - 36 * g.s} width={60 * g.s} height={36 * g.s} fill="#3a5a8a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                </g>
                <Gulls g={g} n={5} y0={0.1} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// you5: interceptor silos in a spruce clearing, guards, a winter day.
export const InterceptorPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [start + 10, start + 40], [0, 1], clamp);
  return (
    <Panel id="interceptor" anchor={P.fortGreely} start={start} end={end} sky={["#8aa6c8", "#e8eef4"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="interceptor" start={start} end={end} warm={0.03}>
          {(pan) => {
            const horizon = g.y + g.H * 0.56;
            const row = g.ground - 14 * g.s;
            return (
              <g>
                <Glow x={g.x + g.W * 0.85} y={g.y + 60 * g.s} s={g.s * 0.6} color="#fff4d0" core="#ffffff" />
                <Ridge g={g} base={horizon} amp={80 * g.s} seed={41} color="#d8e0ec" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {Array.from({ length: 12 }, (_, i) => <Pine key={i} x={g.x + (i / 11) * g.W} y={horizon + 30 * g.s} h={(60 + (i % 3) * 14) * g.s} color="#2c4a3c" />)}
                </g>
                <SnowGround g={g} y={horizon + 28 * g.s} shift={pan * 0.7} />
                {[0.2, 0.4, 0.6, 0.8].map((fx, i) => {
                  const x = g.x + g.W * fx + pan * 0.7;
                  return (
                    <g key={i} stroke={PAL.ink} strokeWidth={1.6 * g.s}>
                      <ellipse cx={x} cy={row} rx={40 * g.s} ry={10 * g.s} fill="#9aa0a8" />
                      <ellipse cx={x} cy={row} rx={24 * g.s} ry={6 * g.s} fill="#2a2d36" />
                      <path d={`M${x - 10 * g.s} ${row} L${x - 10 * g.s} ${row - 30 * g.s * open} Q${x} ${row - 52 * g.s * open} ${x + 10 * g.s} ${row - 30 * g.s * open} L${x + 10 * g.s} ${row} Z`} fill="#eef0f2" />
                      <rect x={x + 24 * g.s} y={row - 6 * g.s - 20 * g.s * open} width={30 * g.s} height={6 * g.s} fill="#7a808a" />
                    </g>
                  );
                })}
                <Fighter x={g.x + g.W * 0.08} y={g.ground + 6 * g.s} scale={g.sc * 0.9} mode="stand" costume={{ jacket: "#5a6a4a", sash: "#3a3a2a", pants: "#4a5a3a", head: "helmet", headColor: "#4a5a3a", skin: "#c48a62" }} weapon="rifle" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 16 }, (_, i) => <line key={i} x1={g.x + i * 70 * g.s} y1={g.y + g.H} x2={g.x + i * 70 * g.s} y2={g.y + g.H - 80 * g.s} stroke="#3a3e46" strokeWidth={5 * g.s} />)}
                  {[0, 1, 2].map((i) => <line key={i} x1={g.x - 40 * g.s} y1={g.y + g.H - (20 + i * 24) * g.s} x2={g.x + g.W + 40 * g.s} y2={g.y + g.H - (20 + i * 24) * g.s} stroke="#4a4e56" strokeWidth={2 * g.s} />)}
                </g>
                <Snow g={g} n={14} depth={0.3} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// you5: a radar dome on a hill under the aurora, a soldier keeping watch.
export const RadarPanel = ({ start, end }: PP) => (
  <Panel id="radar" anchor={P.fortGreely} start={start} end={end} sky={["#040a1e", "#1c2c4a"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="radar" start={start} end={end} warm={0}>
        {(pan) => {
          const horizon = g.y + g.H * 0.6;
          const dx = g.x + g.W * 0.62 + pan * 0.55;
          return (
            <g>
              <Aurora x={g.x} y={g.y + 30 * g.s} W={g.W} s={g.s} />
              {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={g.x + ((i * 0.618) % 1) * g.W} cy={g.y + ((i * 0.33) % 1) * 140 * g.s} r={1.3 * g.s} fill="#fff" opacity={0.55} />)}
              <Ridge g={g} base={horizon} amp={50 * g.s} seed={51} color="#2a3654" shift={pan * 0.2} />
              <Ridge g={g} base={horizon + 26 * g.s} amp={30 * g.s} seed={52} color="#8c9ab8" shift={pan * 0.5} />
              <g stroke={PAL.ink} strokeWidth={1.8 * g.s}>
                <rect x={dx - 46 * g.s} y={horizon - 6 * g.s} width={92 * g.s} height={30 * g.s} fill="#5a6070" />
                <path d={`M${dx - 54 * g.s} ${horizon - 6 * g.s} A${54 * g.s} ${54 * g.s} 0 0 1 ${dx + 54 * g.s} ${horizon - 6 * g.s} Z`} fill="#e8ecf2" />
                <rect x={dx - 8 * g.s} y={horizon + 6 * g.s} width={16 * g.s} height={12 * g.s} fill="#ffcf7a" />
              </g>
              <Fighter x={g.x + g.W * 0.3} y={g.ground} scale={g.sc} mode="stand" costume={{ jacket: "#5a6a4a", sash: "#3a3a2a", pants: "#4a5a3a", head: "helmet", headColor: "#4a5a3a", skin: "#8d5a3b" }} weapon="rifle" />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.05} y={g.y + g.H + 16 * g.s} h={230 * g.s} color="#0f1c16" />
                <path d={`M${g.x + g.W * 0.45} ${g.y + g.H} Q${g.x + g.W * 0.75} ${g.y + g.H - 40 * g.s} ${g.x + g.W + 60 * g.s} ${g.y + g.H} Z`} fill="#c8d4e4" />
              </g>
              <Snow g={g} n={18} depth={0.4} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// you6 (what-if): Soviet guards patrolling the pipeline under red-star banners at dusk.
export const SovietPipePanel = ({ start, end }: PP) => (
  <Panel id="sovpipe" anchor={P.prudhoe} start={start} end={end} sky={["#2a0a22", "#b0402a"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="sovpipe" start={start} end={end} warm={0.05}>
        {(pan) => {
          const horizon = g.y + g.H * 0.58;
          return (
            <g>
              <Glow x={g.x + g.W * 0.25} y={horizon - 10 * g.s} s={g.s * 0.8} color="#ff6a3a" core="#ffc08a" />
              <Ridge g={g} base={horizon} amp={44 * g.s} seed={61} color="#6a3a4a" shift={pan * 0.2} />
              <SnowGround g={g} y={horizon + 12 * g.s} shift={pan * 0.5} color="#d8c0c8" shade="#8a6a7a" />
              <g transform={`translate(${pan * 0.6},0)`}>
                <Pipe g={g} y={horizon + 40 * g.s} color="#b8b0b8" />
                {[0.2, 0.72].map((fx, i) => (
                  <g key={i}>
                    <line x1={g.x + g.W * fx} y1={horizon + 30 * g.s} x2={g.x + g.W * fx} y2={horizon - 90 * g.s} stroke="#2a2a2a" strokeWidth={4 * g.s} />
                    <Flag x={g.x + g.W * fx} y={horizon + 30 * g.s} s={g.s} h={120} stripes={[RUSSIA]} w={60} />
                    <path d={`M${g.x + g.W * fx + 18 * g.s} ${horizon - 76 * g.s} l${4 * g.s} ${8 * g.s} l${9 * g.s} 0 l${-7 * g.s} ${5 * g.s} l${3 * g.s} ${9 * g.s} l${-9 * g.s} ${-6 * g.s} l${-9 * g.s} ${6 * g.s} l${3 * g.s} ${-9 * g.s} l${-7 * g.s} ${-5 * g.s} l${9 * g.s} 0 Z`} fill={GOLD} />
                  </g>
                ))}
              </g>
              {[0, 1].map((i) => <Fighter key={i} x={g.x + interpolate(g.frame, [start, end], [g.W * (0.3 + i * 0.25), g.W * (0.45 + i * 0.25)], clamp)} y={g.ground + i * 6 * g.s} scale={g.sc * 0.9} mode="walk" costume={COSTUME_W.soviet} weapon="rifle" phase={i * 2} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.93} y={g.y + g.H + 20 * g.s} h={230 * g.s} color="#1a0f16" />
                <path d={`M${g.x - 60 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.2} ${g.y + g.H - 36 * g.s} ${g.x + g.W * 0.45} ${g.y + g.H} Z`} fill="#e0ccd4" />
              </g>
              <Snow g={g} n={24} depth={0.4} wind={1.4} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// you6 (what-if): a suburban street at night; neighbours look north at a red glow on the horizon.
export const RedHorizonPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [start, start + 40], [0.2, 1], clamp);
  return (
    <Panel id="redhorizon" anchor={P.seattle} start={start} end={end} sky={["#0a0618", "#4a1020"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="redhorizon" start={start} end={end} warm={0}>
          {(pan) => {
            const horizon = g.y + g.H * 0.6;
            return (
              <g>
                <g opacity={glow}><Glow x={g.cx} y={horizon + 10 * g.s} s={g.s * 1.6} color="#ff2a3a" core="#ff8a6a" /></g>
                <Ridge g={g} base={horizon} amp={26 * g.s} seed={71} color="#1a0e1e" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {[0.0, 0.2, 0.62, 0.82].map((fx, i) => <House key={i} x={g.x + g.W * fx} y={horizon + 34 * g.s} w={118 * g.s} h={56 * g.s} s={g.s} wall="#3a3448" roof="#1e1826" lit={0.5} />)}
                </g>
                <rect x={g.x} y={horizon + 34 * g.s} width={g.W} height={g.H} fill="#1e1a26" />
                {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.38 + i * 0.1)} y={g.ground + (i % 2) * 5 * g.s} scale={g.sc * 0.85} mode="stand" costume={CIV[i + 1]} weapon="none" phase={i * 1.5} />)}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <line x1={g.x + g.W * 0.9} y1={g.y + g.H} x2={g.x + g.W * 0.9} y2={g.y + 50 * g.s} stroke="#14121a" strokeWidth={7 * g.s} />
                  <Glow x={g.x + g.W * 0.9 - 16 * g.s} y={g.y + 54 * g.s} s={g.s * 0.45} color="#ffcf7a" core="#fff1c8" />
                  <path d={`M${g.x - 60 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.15} ${g.y + g.H - 50 * g.s} ${g.x + g.W * 0.32} ${g.y + g.H} Z`} fill="#0e1612" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// ---- chapter 8 panels ----

// ans1: the Winter Palace at dusk in the snow, guards at the gate.
export const PalacePanel = ({ start, end }: PP) => (
  <Panel id="palace" anchor={P.stPetersburg} start={start} end={end} sky={["#3a3a6a", "#e0a07a"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="palace" start={start} end={end} warm={0.08}>
        {(pan) => {
          const base = g.y + g.H * 0.66;
          return (
            <g>
              <Ridge g={g} base={base - 60 * g.s} amp={10 * g.s} seed={81} color="#8a8aa8" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`} stroke={PAL.ink} strokeWidth={1.4 * g.s}>
                <rect x={g.x - 40 * g.s} y={base - 120 * g.s} width={g.W + 80 * g.s} height={120 * g.s} fill="#6f9a86" />
                <rect x={g.x - 40 * g.s} y={base - 126 * g.s} width={g.W + 80 * g.s} height={8 * g.s} fill="#efe6d0" />
                {Array.from({ length: 22 }, (_, i) => <rect key={i} x={g.x - 30 * g.s + i * 50 * g.s} y={base - 118 * g.s} width={8 * g.s} height={118 * g.s} fill="#efe6d0" />)}
                {Array.from({ length: 21 }, (_, i) => <rect key={`w${i}`} x={g.x - 12 * g.s + i * 50 * g.s} y={base - 96 * g.s} width={16 * g.s} height={30 * g.s} fill="#ffcf7a" opacity={0.75} />)}
                {Array.from({ length: 11 }, (_, i) => <path key={`s${i}`} d={`M${g.x + i * 100 * g.s} ${base - 126 * g.s} l${8 * g.s} ${-22 * g.s} l${8 * g.s} ${22 * g.s} Z`} fill="#d9a93a" />)}
              </g>
              <SnowGround g={g} y={base} shift={pan * 0.7} />
              <Fighter x={g.cx - 60 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" costume={COSTUME_W.russia1860} weapon="rifle" />
              <Fighter x={g.cx + 60 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" flip costume={COSTUME_W.russia1860} weapon="rifle" phase={3} />
              <Flag x={g.cx} y={base} s={g.s} h={190} stripes={RU_FLAG} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <path d={`M${g.x - 60 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.2} ${g.y + g.H - 40 * g.s} ${g.x + g.W * 0.42} ${g.y + g.H} Z`} fill="#eef3f8" />
                <line x1={g.x + g.W * 0.92} y1={g.y + g.H} x2={g.x + g.W * 0.92} y2={g.y + 40 * g.s} stroke="#1a1a1a" strokeWidth={7 * g.s} />
                <Glow x={g.x + g.W * 0.92} y={g.y + 40 * g.s} s={g.s * 0.5} color="#ffcf7a" core="#fff1c8" />
              </g>
              <Snow g={g} n={30} depth={0.3} />
              <Snow g={g} n={10} depth={0.9} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// ans1: a Russian ship sails out of Sitka harbour at sunset, someone waves from the shore.
export const LeavingPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const sail = interpolate(frame, [start, end], [0, 1], clamp);
  return (
    <Panel id="leaving" anchor={P.sitka} start={start} end={end} sky={["#4a3a6a", "#f2a060"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="leaving" start={start} end={end} warm={0.12}>
          {(pan) => {
            const horizon = g.y + g.H * 0.55;
            return (
              <g>
                <Glow x={g.x + g.W * 0.7} y={horizon - 20 * g.s} s={g.s} color="#ffb060" core="#ffe2a8" />
                <Ridge g={g} base={horizon} amp={70 * g.s} seed={91} color="#5a4a6a" shift={pan * 0.2} />
                <Sea g={g} y={horizon} shift={pan * 0.4} color="#5a4a62" crest="#f2b07a" amp={3} speed={0.05} />
                <SailShip x={g.x + g.W * (0.55 + sail * 0.25) + pan * 0.6} y={horizon + 40 * g.s} s={g.s * (0.9 - sail * 0.25)} tilt={Math.sin(frame * 0.04) * 2} />
                <g transform={`translate(${pan * 0.75},0)`}>
                  <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x - 40 * g.s} ${horizon + 60 * g.s} Q${g.x + g.W * 0.2} ${horizon + 40 * g.s} ${g.x + g.W * 0.42} ${horizon + 80 * g.s} L${g.x + g.W * 0.5} ${g.y + g.H} Z`} fill="#3a3040" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <OnionChurch x={g.x + g.W * 0.14} y={horizon + 66 * g.s} s={g.s * 0.75} />
                </g>
                <Fighter x={g.x + g.W * 0.32} y={g.ground - 8 * g.s} scale={g.sc * 0.85} mode="attack" costume={COSTUME_W.russia1860} weapon="none" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={g.x + i * 170 * g.s} cy={g.y + g.H - 4 * g.s} rx={70 * g.s} ry={22 * g.s} fill="#2a2230" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// ans2: Klondike-era miners panning in a creek below the tents.
export const PanningPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="panning" anchor={P.dawson} start={start} end={end} sky={["#7ea2c8", "#efe6d0"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="panning" start={start} end={end} warm={0.1}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const creek = g.y + g.H * 0.72;
            return (
              <g>
                <Glow x={g.x + g.W * 0.2} y={g.y + 50 * g.s} s={g.s * 0.6} color="#fff0c0" core="#ffffff" />
                <Ridge g={g} base={horizon} amp={80 * g.s} seed={101} color="#c8d0dc" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {Array.from({ length: 9 }, (_, i) => <Pine key={i} x={g.x + (i / 8) * g.W} y={horizon + 40 * g.s} h={(70 + (i % 3) * 16) * g.s} color="#2c4a3c" snow={false} />)}
                  {[0.2, 0.36, 0.7].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 34 * g.s} ${horizon + 50 * g.s} L${g.x + g.W * fx} ${horizon + 6 * g.s} L${g.x + g.W * fx + 34 * g.s} ${horizon + 50 * g.s} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />)}
                </g>
                <rect x={g.x} y={horizon + 48 * g.s} width={g.W} height={g.H} fill="#7a6a4a" />
                <rect x={g.x} y={creek} width={g.W} height={34 * g.s} fill="#5a8aa0" />
                {Array.from({ length: 10 }, (_, i) => <line key={i} x1={g.x + ((i * 120 * g.s + frame * 2 * g.s) % g.W)} y1={creek + (8 + (i % 3) * 8) * g.s} x2={g.x + ((i * 120 * g.s + frame * 2 * g.s) % g.W) + 30 * g.s} y2={creek + (8 + (i % 3) * 8) * g.s} stroke="#d0e8f0" strokeWidth={2 * g.s} />)}
                {[0.3, 0.6].map((fx, i) => {
                  const x = g.x + g.W * fx;
                  const sw = Math.sin(frame * 0.2 + i) * 6 * g.s;
                  return (
                    <g key={i}>
                      <Fighter x={x} y={creek + 6 * g.s} scale={g.sc * 0.85} mode="stand" costume={CIV[i + 2]} weapon="none" phase={i} />
                      <ellipse cx={x + 26 * g.s + sw} cy={creek - 40 * g.s} rx={22 * g.s} ry={6 * g.s} fill="#3a3a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                      <circle cx={x + 26 * g.s + sw} cy={creek - 42 * g.s} r={3 * g.s} fill={GOLD} />
                    </g>
                  );
                })}
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={g.x + i * 130 * g.s} cy={g.y + g.H - 6 * g.s} rx={44 * g.s} ry={18 * g.s} fill="#5a5048" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                  <Grass g={g} color="#4a5a2a" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// ans2: a lighthouse on the Alaska coast, its beam sweeping slowly; ships and icebergs pass.
export const LighthousePanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const beam = Math.sin((frame - start) * 0.03) * 30;
  return (
    <Panel id="lighthouse" anchor={P.unalaska} start={start} end={end} sky={["#1a2448", "#7a6a8a"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="lighthouse" start={start} end={end} warm={0.04}>
          {(pan) => {
            const horizon = g.y + g.H * 0.52;
            const lx = g.x + g.W * 0.22 + pan * 0.7;
            const top = g.y + 60 * g.s;
            return (
              <g>
                <Ridge g={g} base={horizon} amp={10 * g.s} seed={111} color="#3a4060" shift={pan * 0.2} />
                <Sea g={g} y={horizon} shift={pan * 0.4} color="#24345a" crest="#8aa0c8" amp={3} speed={0.05} />
                {[0.62, 0.86].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx + pan * 0.3} ${horizon + 6 * g.s} l${20 * g.s} ${-36 * g.s} l${18 * g.s} ${10 * g.s} l${14 * g.s} ${26 * g.s} Z`} fill="#e8f0f8" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                <SailShip x={g.x + g.W * 0.6 + pan * 0.55 + (frame - start) * 0.4 * g.s} y={horizon + 34 * g.s} s={g.s * 0.55} />
                <Trawler x={g.x + g.W * 0.82 + pan * 0.55 - (frame - start) * 0.3 * g.s} y={horizon + 46 * g.s} s={g.s * 0.45} />
                <g transform={`rotate(${beam},${lx},${top + 14 * g.s})`} opacity={0.22}>
                  <path d={`M${lx} ${top + 14 * g.s} L${lx + g.W} ${top - 40 * g.s} L${lx + g.W} ${top + 70 * g.s} Z`} fill="#fff6c8" />
                </g>
                <g transform={`translate(${pan * 0.7},0)`}>
                  <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x - 40 * g.s} ${g.ground - 30 * g.s} Q${g.x + g.W * 0.2} ${g.ground - 60 * g.s} ${g.x + g.W * 0.42} ${g.y + g.H} Z`} fill="#2a3040" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                </g>
                <g stroke={PAL.ink} strokeWidth={1.6 * g.s}>
                  <path d={`M${lx - 22 * g.s} ${g.ground - 40 * g.s} L${lx - 12 * g.s} ${top + 24 * g.s} L${lx + 12 * g.s} ${top + 24 * g.s} L${lx + 22 * g.s} ${g.ground - 40 * g.s} Z`} fill="#efe6d0" />
                  {[0.3, 0.6].map((k, i) => <rect key={i} x={lx - 20 * g.s + k * 6 * g.s} y={top + 24 * g.s + (g.ground - 64 * g.s - top) * k} width={(40 - k * 12) * g.s} height={14 * g.s} fill="#c9302c" />)}
                  <rect x={lx - 14 * g.s} y={top} width={28 * g.s} height={24 * g.s} fill="#ffe8a0" />
                  <path d={`M${lx - 18 * g.s} ${top} L${lx} ${top - 16 * g.s} L${lx + 18 * g.s} ${top} Z`} fill="#2a2a2a" />
                </g>
                <Glow x={lx} y={top + 12 * g.s} s={g.s * 0.5} color="#fff2b0" core="#ffffff" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={g.x + g.W * 0.5 + i * 120 * g.s} cy={g.y + g.H - 2 * g.s} rx={60 * g.s} ry={18 * g.s} fill="#1a2030" />)}
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// comment: a balance scale on a desk, the Russian flag on one pan and the US flag on the other, rocking slowly.
export const ScalePanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  const tilt = Math.sin((frame - start) * 0.05) * 8;
  return (
    <Panel id="scale" anchor={P.sitka} start={start} end={end} sky={["#1c140e", "#4a3220"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="scale" start={start} end={end} warm={0.1}>
          {(pan) => {
            const top = g.y + g.H * 0.66;
            const cx = g.cx + pan * 0.6;
            const py = g.y + 70 * g.s;
            const arm = 190 * g.s;
            const r = (tilt * Math.PI) / 180;
            const L = [cx - Math.cos(r) * arm, py - Math.sin(r) * arm];
            const R = [cx + Math.cos(r) * arm, py + Math.sin(r) * arm];
            return (
              <g>
                <Ridge g={g} base={g.y + g.H * 0.4} amp={6 * g.s} seed={121} color="#2a1c12" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.3},0)`}>
                  {Array.from({ length: 9 }, (_, i) => <rect key={i} x={g.x + i * 120 * g.s} y={g.y + 20 * g.s} width={70 * g.s} height={110 * g.s} fill="#3a2a1c" stroke={PAL.ink} strokeWidth={1 * g.s} opacity={0.6} />)}
                </g>
                <rect x={g.x - 40 * g.s} y={top} width={g.W + 80 * g.s} height={g.H} fill="#5a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <g stroke={PAL.ink} strokeWidth={1.8 * g.s}>
                  <rect x={cx - 6 * g.s} y={py} width={12 * g.s} height={top - py} fill={GOLD} />
                  <rect x={cx - 50 * g.s} y={top - 12 * g.s} width={100 * g.s} height={12 * g.s} fill={GOLD} />
                  <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke={GOLD} strokeWidth={8 * g.s} />
                  {[L, R].map(([x, y], i) => (
                    <g key={i}>
                      <line x1={x} y1={y} x2={x - 50 * g.s} y2={y + 80 * g.s} strokeWidth={1.4 * g.s} />
                      <line x1={x} y1={y} x2={x + 50 * g.s} y2={y + 80 * g.s} strokeWidth={1.4 * g.s} />
                      <path d={`M${x - 60 * g.s} ${y + 80 * g.s} Q${x} ${y + 104 * g.s} ${x + 60 * g.s} ${y + 80 * g.s} Z`} fill={GOLD} />
                      <Flag x={x - 6 * g.s} y={y + 82 * g.s} s={g.s} h={100} stripes={i === 0 ? RU_FLAG : US_FLAG} canton={i === 1} w={74} />
                    </g>
                  ))}
                  <circle cx={cx} cy={py} r={9 * g.s} fill={GOLD} />
                </g>
                <g transform={`translate(${pan * 1.2},0)`}>
                  <rect x={g.x + g.W * 0.88} y={top - 40 * g.s} width={14 * g.s} height={50 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <Glow x={g.x + g.W * 0.88 + 7 * g.s} y={top - 50 * g.s} s={g.s * 0.6} color="#ffb35a" core="#fff1c8" />
                </g>
                <g transform={`translate(${pan * 1.6},0)`}>
                  <path d={`M${g.x + g.W * 0.02} ${g.y + g.H} l${70 * g.s} ${-36 * g.s} l${90 * g.s} ${14 * g.s} l${-40 * g.s} ${30 * g.s} Z`} fill="#f2e8cf" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0, 1, 2].map((i) => <circle key={i} cx={g.x + g.W * 0.7 + i * 22 * g.s} cy={g.y + g.H - 10 * g.s} r={10 * g.s} fill={GOLD} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// next: New Orleans riverfront, 1803 — the French tricolour, ships on the Mississippi, people on the levee.
export const NewOrleansPanel = ({ start, end }: PP) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="neworleans" anchor={P.newOrleans} start={start} end={end} sky={["#6a8ab8", "#f0d8a8"]} accent="#3f6fd8">
      {(g) => (
        <Depth g={g} id="neworleans" start={start} end={end} warm={0.12}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const levee = g.y + g.H * 0.7;
            return (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.y + 60 * g.s} s={g.s * 0.7} color="#fff0c0" core="#ffffff" />
                <Ridge g={g} base={horizon} amp={12 * g.s} seed={131} color="#6a8a5a" shift={pan * 0.2} />
                <Sea g={g} y={horizon} shift={pan * 0.4} color="#7a6a4a" crest="#c8b890" amp={2} speed={0.04} />
                <SailShip x={g.x + g.W * 0.7 + pan * 0.5} y={horizon + 30 * g.s} s={g.s * 0.7} tilt={Math.sin(frame * 0.03) * 1.5} />
                <g transform={`translate(${pan * 0.65},0)`}>
                  <rect x={g.x - 40 * g.s} y={levee} width={g.W + 80 * g.s} height={g.H} fill="#a08a5a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0.04, 0.2].map((fx, i) => <House key={i} x={g.x + g.W * fx} y={levee + 4 * g.s} w={120 * g.s} h={70 * g.s} s={g.s} wall={i ? "#e8c8a0" : "#d8b0a0"} roof="#3a5a4a" lit={0.2} />)}
                  <FlagV x={g.x + g.W * 0.42} y={levee + 4 * g.s} s={g.s} h={180} colors={["#2a4aa8", "#f4f1ea", "#d52b1e"]} />
                </g>
                {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + ((g.W * (0.5 + i * 0.12) + (frame - start) * (0.6 + i * 0.2) * g.s) % (g.W + 40 * g.s))} y={g.ground + (i % 2) * 5 * g.s} scale={g.sc * 0.8} mode={i === 1 ? "stand" : "walk"} costume={i === 2 ? { jacket: "#2a4aa8", sash: "#f4f1ea", pants: "#f4f1ea", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" } : CIV[i]} weapon={i === 2 ? "rifle" : "none"} phase={i * 1.4} />)}
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={g.x + i * 190 * g.s} y={g.y + g.H - 40 * g.s} width={50 * g.s} height={40 * g.s} rx={10 * g.s} fill="#6a4a2a" stroke={PAL.ink} strokeWidth={1.4 * g.s} /><line x1={g.x + i * 190 * g.s} y1={g.y + g.H - 26 * g.s} x2={g.x + i * 190 * g.s + 50 * g.s} y2={g.y + g.H - 26 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} /></g>)}
                  <Grass g={g} color="#4a6a2a" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};
