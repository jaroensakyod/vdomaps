import { interpolate, useCurrentFrame } from "remotion";
import type { Costume } from "../../../components/Scene";
import { Depth, Fighter, Glow, Grass, PAL, Ridge, Shot, impactAt } from "../../../components/Scene";
import { clamp, display, GOLD, Panel } from "../../worldhistory/kit/news";
import { COSTUME_W, Flag, Pine, REAL, RU_FLAG, Snow, SnowGround, WHATIF } from "../kit/WhatIf";
import { P } from "./places";

// Style-v2 panels for chapter 3 (the midnight deal) and chapter 4 (the fork). One distinct scene per story beat.

const pt = (k: keyof typeof P) => P[k] as [number, number];
const CIVIL: Costume = { jacket: "#1e1f26", sash: "#efe6d0", pants: "#2a2a30", head: "short", skin: "#e0b08a" };
const CLERK: Costume = { jacket: "#3a3226", sash: "#c9b994", pants: "#2a2420", head: "short", skin: "#e0b08a" };
const GREY: Costume = { jacket: "#7a7d80", sash: "#4a4a4a", pants: "#6a6d70", head: "helmet", headColor: "#5a5d60", skin: "#e0b08a" };
const GUARD: Costume = { jacket: "#2f4a32", sash: "#d9a93a", pants: "#efe6d0", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" };
const MINER: Costume = { jacket: "#6b3a2a", sash: "#3a2a1c", pants: "#3a3a4a", head: "short", skin: "#e0b08a" };

// A row of lit or dark windows; `lit(i)` 0..1 per window (fades, never blinks).
const Windows = ({ x, y, n, w, h, gap, s, lit }: { x: number; y: number; n: number; w: number; h: number; gap: number; s: number; lit: (i: number) => number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect x={x + i * (w + gap)} y={y} width={w} height={h} fill="#1b1f2c" stroke={PAL.ink} strokeWidth={1.2 * s} />
        <rect x={x + i * (w + gap)} y={y} width={w} height={h} fill="#ffcf7a" opacity={lit(i)} />
      </g>
    ))}
  </g>
);

const GasLamp = ({ x, y, s, on = 1 }: { x: number; y: number; s: number; on?: number }) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y - 110 * s} stroke="#1b1d24" strokeWidth={4 * s} />
    <rect x={x - 8 * s} y={y - 128 * s} width={16 * s} height={20 * s} fill="#ffd98a" stroke={PAL.ink} strokeWidth={1.4 * s} opacity={0.4 + 0.6 * on} />
    <g opacity={on}><Glow x={x} y={y - 118 * s} s={s * 0.35} color="#ffb85a" core="#fff1c8" /></g>
  </g>
);

// Seward beat: Washington at dusk, the Capitol dome far off, gas lamps, a frock-coated man walking.
export const WashingtonPanel = ({ start, end }: { start: number; end: number }) => (
  <Panel id="wash" anchor={pt("washington")} start={start} end={end} sky={["#2b3557", "#e7a46a"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="wash" start={start} end={end} warm={0.1}>
        {(pan) => {
          const ground = g.y + g.H * 0.68;
          const cx = g.x + g.W * 0.62 + pan * 0.2;
          return (
            <g>
              <Glow x={g.x + g.W * 0.15} y={ground - 40 * g.s} s={g.s * 0.8} color="#ffb070" core="#ffe0b0" />
              {/* Capitol: far layer */}
              <g transform={`translate(${pan * 0.2},0)`} opacity={0.85}>
                <rect x={cx - 150 * g.s} y={ground - 60 * g.s} width={300 * g.s} height={60 * g.s} fill="#b8b2c4" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <rect x={cx - 40 * g.s} y={ground - 100 * g.s} width={80 * g.s} height={40 * g.s} fill="#c4bed0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <path d={`M${cx - 44 * g.s} ${ground - 100 * g.s} Q${cx} ${ground - 170 * g.s} ${cx + 44 * g.s} ${ground - 100 * g.s} Z`} fill="#d2ccdc" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <line x1={cx} y1={ground - 152 * g.s} x2={cx} y2={ground - 172 * g.s} stroke={PAL.ink} strokeWidth={2 * g.s} />
              </g>
              <Ridge g={g} base={ground + 4 * g.s} amp={10 * g.s} seed={4} color="#4a5a3a" shift={pan * 0.4} />
              {/* street with townhouses: mid layer */}
              <g transform={`translate(${pan * 0.7},0)`}>
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <rect x={g.x + (i * 0.16 - 0.04) * g.W} y={ground - 80 * g.s} width={0.15 * g.W} height={120 * g.s} fill={["#7a4a3a", "#6a5a4a", "#8a5a42"][i]} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    <Windows x={g.x + (i * 0.16 - 0.03) * g.W} y={ground - 66 * g.s} n={3} w={18 * g.s} h={24 * g.s} gap={16 * g.s} s={g.s} lit={(j) => ((i + j) % 2 ? 0.8 : 0.2)} />
                  </g>
                ))}
                <GasLamp x={g.x + g.W * 0.5} y={ground + 50 * g.s} s={g.s} />
              </g>
              <rect x={g.x} y={ground + 40 * g.s} width={g.W} height={g.H} fill="#5a5048" />
              <Fighter x={g.x + interpolate(g.frame, [start, end], [0.38, 0.5], clamp) * g.W} y={g.ground} scale={g.sc} mode="walk" costume={CIVIL} weapon="none" />
              <Fighter x={g.x + g.W * 0.78} y={g.ground + 4 * g.s} scale={g.sc * 0.9} mode="stand" flip costume={CLERK} weapon="none" phase={2} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <GasLamp x={g.x + g.W * 0.08} y={g.y + g.H + 20 * g.s} s={g.s * 1.5} />
                <rect x={g.x + g.W * 0.86} y={g.y + g.H - 40 * g.s} width={g.W * 0.2} height={40 * g.s} fill="#2a2420" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// Night beat, shot 1: the Russian minister's carriage at Seward's door, one window lit.
export const DoorPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [start + 30, start + 50], [0, 1], clamp);
  return (
    <Panel id="door" anchor={pt("washington")} start={start} end={end} sky={["#050a1e", "#1c2d5a"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="door" start={start} end={end} warm={0.04}>
          {(pan) => {
            const ground = g.y + g.H * 0.68;
            const hx = g.x + g.W * 0.55;
            return (
              <g>
                <circle cx={g.x + g.W * 0.15} cy={g.y + 60 * g.s} r={26 * g.s} fill="#f2ecd8" opacity={0.9} />
                {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={g.x + ((i * 0.618) % 1) * g.W} cy={g.y + ((i * 0.37) % 1) * 100 * g.s} r={1.3 * g.s} fill="#fff" opacity={0.5} />)}
                <Ridge g={g} base={ground - 30 * g.s} amp={30 * g.s} seed={7} color="#1a2238" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.6},0)`}>
                  <rect x={hx - 110 * g.s} y={ground - 150 * g.s} width={300 * g.s} height={190 * g.s} fill="#4a3a32" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <Windows x={hx - 90 * g.s} y={ground - 130 * g.s} n={4} w={34 * g.s} h={44 * g.s} gap={34 * g.s} s={g.s} lit={(i) => (i === 2 ? 0.9 : 0.08)} />
                  <rect x={hx} y={ground - 40 * g.s} width={40 * g.s} height={80 * g.s} fill="#2a1c14" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <rect x={hx} y={ground - 40 * g.s} width={40 * g.s * open} height={80 * g.s} fill="#ffcf7a" opacity={0.85} />
                </g>
                <rect x={g.x} y={ground + 40 * g.s} width={g.W} height={g.H} fill="#2a2a32" />
                {/* carriage */}
                <g transform={`translate(${pan * 0.9},0)`}>
                  <rect x={g.x + g.W * 0.1} y={g.ground - 70 * g.s} width={120 * g.s} height={56 * g.s} rx={10 * g.s} fill="#1b1d24" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0, 1].map((i) => <circle key={i} cx={g.x + g.W * 0.1 + (20 + i * 80) * g.s} cy={g.ground - 10 * g.s} r={18 * g.s} fill="none" stroke="#3a2a1c" strokeWidth={4 * g.s} />)}
                  <GasLamp x={g.x + g.W * 0.36} y={g.ground} s={g.s * 0.8} />
                </g>
                <Fighter x={hx - 20 * g.s} y={g.ground} scale={g.sc} mode="stand" costume={{ ...CIVIL, jacket: "#22283a" }} weapon="none" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <path d={`M${g.x + g.W * 0.82} ${g.y + g.H} l0 ${-90 * g.s} l${80 * g.s} 0 l0 ${90 * g.s} Z`} fill="#14161c" />
                  {Array.from({ length: 9 }, (_, i) => <line key={i} x1={g.x + g.W * 0.8 + i * 14 * g.s} y1={g.y + g.H} x2={g.x + g.W * 0.8 + i * 14 * g.s} y2={g.y + g.H - 60 * g.s} stroke="#0e1014" strokeWidth={4 * g.s} />)}
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Night beat, shot 2: the State Department opens up — windows light one by one, clerks hurry in with lanterns.
export const OfficePanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="office" anchor={pt("washington")} start={start} end={end} sky={["#060b1f", "#202c52"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="office" start={start} end={end} warm={0.05}>
          {(pan) => {
            const ground = g.y + g.H * 0.7;
            const lit = (i: number) => interpolate(frame, [start + 8 + i * 9, start + 22 + i * 9], [0, 0.9], clamp);
            return (
              <g>
                <Ridge g={g} base={ground - 60 * g.s} amp={20 * g.s} seed={9} color="#141a30" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  <rect x={g.x + g.W * 0.1} y={ground - 160 * g.s} width={g.W * 0.8} height={180 * g.s} fill="#8a8578" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <path d={`M${g.x + g.W * 0.08} ${ground - 160 * g.s} L${g.x + g.W * 0.5} ${ground - 210 * g.s} L${g.x + g.W * 0.92} ${ground - 160 * g.s} Z`} fill="#6e6a60" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  {Array.from({ length: 8 }, (_, i) => <rect key={i} x={g.x + g.W * (0.16 + i * 0.095)} y={ground - 70 * g.s} width={10 * g.s} height={90 * g.s} fill="#cfc8b8" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                  <Windows x={g.x + g.W * 0.15} y={ground - 140 * g.s} n={10} w={30 * g.s} h={40 * g.s} gap={g.W * 0.072 - 30 * g.s} s={g.s} lit={lit} />
                </g>
                <rect x={g.x} y={ground + 20 * g.s} width={g.W} height={g.H} fill="#2a2a30" />
                {[0, 1, 2].map((i) => {
                  const x = g.x + g.W * interpolate(frame, [start + i * 14, end], [0.05 + i * 0.07, 0.42 + i * 0.07], clamp);
                  return (
                    <g key={i}>
                      <Fighter x={x} y={g.ground + i * 4 * g.s} scale={g.sc * 0.9} mode="walk" costume={CLERK} weapon="none" phase={i * 1.4} />
                      <Glow x={x + 18 * g.s} y={g.ground - 80 * g.s} s={g.s * 0.22} color="#ffb85a" core="#fff1c8" />
                    </g>
                  );
                })}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <GasLamp x={g.x + g.W * 0.92} y={g.y + g.H + 30 * g.s} s={g.s * 1.6} />
                  <path d={`M${g.x - 40 * g.s} ${g.y + g.H} q${g.W * 0.2} ${-30 * g.s} ${g.W * 0.4} 0 Z`} fill="#16181e" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Sign beat: two men at a desk by candlelight, a quill finishing the signature, the window going pale with dawn.
export const SigningPanel = ({ start, end, signAt }: { start: number; end: number; signAt: number }) => {
  const frame = useCurrentFrame();
  const dawn = interpolate(frame, [start, end], [0, 1], clamp);
  const ink = interpolate(frame, [signAt - 20, signAt + 10], [0, 1], clamp);
  return (
    <Panel id="signing" anchor={pt("washington")} start={start} end={end} sky={["#2a1f18", "#3e2c1e"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="signing" start={start} end={end} warm={0.12}>
          {(pan) => {
            const desk = g.y + g.H * 0.66;
            const wx = g.x + g.W * 0.38 + pan * 0.2;
            const qx = g.x + g.W * 0.45 + ink * 120 * g.s;
            return (
              <g>
                {/* window with the dawn sky */}
                <rect x={wx} y={g.y + 24 * g.s} width={180 * g.s} height={150 * g.s} fill={`rgb(${30 + dawn * 150},${40 + dawn * 110},${80 + dawn * 60})`} stroke={PAL.ink} strokeWidth={4 * g.s} />
                <line x1={wx + 90 * g.s} y1={g.y + 24 * g.s} x2={wx + 90 * g.s} y2={g.y + 174 * g.s} stroke={PAL.ink} strokeWidth={4 * g.s} />
                <line x1={wx} y1={g.y + 99 * g.s} x2={wx + 180 * g.s} y2={g.y + 99 * g.s} stroke={PAL.ink} strokeWidth={4 * g.s} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  <Fighter x={g.x + g.W * 0.2} y={desk + 10 * g.s} scale={g.sc * 1.05} mode="stand" costume={CIVIL} weapon="none" />
                  <Fighter x={g.x + g.W * 0.8} y={desk + 10 * g.s} scale={g.sc * 1.05} mode="stand" flip costume={{ ...CIVIL, jacket: "#2a2232" }} weapon="none" phase={3} />
                </g>
                {/* desk, paper, signature */}
                <g transform={`translate(${pan * 0.8},0)`}>
                  <rect x={g.x - 20 * g.s} y={desk} width={g.W + 40 * g.s} height={g.H} fill="#5a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <path d={`M${g.x + g.W * 0.32} ${desk + 14 * g.s} L${g.x + g.W * 0.68} ${desk + 10 * g.s} L${g.x + g.W * 0.7} ${desk + 80 * g.s} L${g.x + g.W * 0.3} ${desk + 84 * g.s} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0, 1, 2, 3].map((i) => <line key={i} x1={g.x + g.W * 0.35} y1={desk + (26 + i * 10) * g.s} x2={g.x + g.W * 0.64} y2={desk + (24 + i * 10) * g.s} stroke="#8a7a60" strokeWidth={1.5 * g.s} />)}
                  <path d={`M${g.x + g.W * 0.45} ${desk + 70 * g.s} ${Array.from({ length: 12 }, (_, i) => `l${10 * g.s * ink} ${(i % 2 ? -6 : 6) * g.s}`).join(" ")}`} fill="none" stroke="#1a1a40" strokeWidth={2 * g.s} />
                  <path d={`M${qx} ${desk + 66 * g.s} l${40 * g.s} ${-70 * g.s} q${10 * g.s} ${-10 * g.s} ${6 * g.s} ${4 * g.s} Z`} fill="#f4f1ea" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                </g>
                {/* candle, nearest */}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <rect x={g.x + g.W * 0.86} y={desk - 40 * g.s} width={16 * g.s} height={60 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <ellipse cx={g.x + g.W * 0.86 + 8 * g.s} cy={desk - 50 * g.s} rx={5 * g.s} ry={11 * g.s} fill="#ffcf5a" />
                  <g opacity={1 - dawn * 0.5}><Glow x={g.x + g.W * 0.86 + 8 * g.s} y={desk - 50 * g.s} s={g.s * 0.8} color="#ffb35a" core="#fff1c8" /></g>
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Price beat: a brass balance in a vault — gold coins drop onto one pan, a small turf square with "1 acre" on the other.
export const ScalePanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const coins = Math.floor(interpolate(frame, [start + 6, start + 70], [0, 9], clamp));
  const tilt = interpolate(frame, [start + 6, start + 70], [-8, 2], clamp);
  return (
    <Panel id="scale" anchor={pt("washington")} start={start} end={end} sky={["#1c1a16", "#3a3428"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="scale" start={start} end={end} warm={0.1}>
          {(pan) => {
            const floor = g.y + g.H * 0.74;
            const cx = g.cx + pan * 0.6;
            const r = (tilt * Math.PI) / 180;
            const lx = cx - Math.cos(r) * 150 * g.s;
            const ly = floor - 150 * g.s - Math.sin(r) * 150 * g.s;
            const rx = cx + Math.cos(r) * 150 * g.s;
            const ry = floor - 150 * g.s + Math.sin(r) * 150 * g.s;
            return (
              <g>
                {/* vault wall with rivets */}
                <g transform={`translate(${pan * 0.2},0)`}>
                  {Array.from({ length: 6 }, (_, i) => <rect key={i} x={g.x - 30 * g.s + i * 190 * g.s} y={g.y} width={180 * g.s} height={g.H} fill="#2e2a22" stroke="#1a1712" strokeWidth={3 * g.s} />)}
                  <circle cx={g.x + g.W * 0.85} cy={g.y + 90 * g.s} r={60 * g.s} fill="#4a4436" stroke={PAL.ink} strokeWidth={3 * g.s} />
                </g>
                <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#3a3024" />
                <g>
                  <line x1={cx} y1={floor} x2={cx} y2={floor - 150 * g.s} stroke={PAL.gilt} strokeWidth={8 * g.s} />
                  <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={PAL.gilt} strokeWidth={6 * g.s} />
                  <path d={`M${lx - 60 * g.s} ${ly + 60 * g.s} L${lx + 60 * g.s} ${ly + 60 * g.s} Q${lx} ${ly + 90 * g.s} ${lx - 60 * g.s} ${ly + 60 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <line x1={lx} y1={ly} x2={lx - 56 * g.s} y2={ly + 60 * g.s} stroke="#8a6a20" strokeWidth={1.5 * g.s} />
                  <line x1={lx} y1={ly} x2={lx + 56 * g.s} y2={ly + 60 * g.s} stroke="#8a6a20" strokeWidth={1.5 * g.s} />
                  {Array.from({ length: coins }, (_, i) => <ellipse key={i} cx={lx - 30 * g.s + (i % 3) * 30 * g.s} cy={ly + 54 * g.s - Math.floor(i / 3) * 8 * g.s} rx={13 * g.s} ry={5 * g.s} fill="#f0c040" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                  <path d={`M${rx - 60 * g.s} ${ry + 60 * g.s} L${rx + 60 * g.s} ${ry + 60 * g.s} Q${rx} ${ry + 90 * g.s} ${rx - 60 * g.s} ${ry + 60 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <line x1={rx} y1={ry} x2={rx - 56 * g.s} y2={ry + 60 * g.s} stroke="#8a6a20" strokeWidth={1.5 * g.s} />
                  <line x1={rx} y1={ry} x2={rx + 56 * g.s} y2={ry + 60 * g.s} stroke="#8a6a20" strokeWidth={1.5 * g.s} />
                  <rect x={rx - 34 * g.s} y={ry + 34 * g.s} width={68 * g.s} height={22 * g.s} fill="#5b6e4a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <text x={rx} y={ry + 26 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={22 * g.s} fill="#fff">1 ACRE</text>
                  {/* falling coin */}
                  {coins < 9 && frame >= start + 6 && <ellipse cx={lx} cy={ly + 54 * g.s - (1 - ((frame - start - 6) % 7) / 7) * 80 * g.s} rx={13 * g.s} ry={5 * g.s} fill="#f0c040" stroke={PAL.ink} strokeWidth={1 * g.s} />}
                </g>
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={g.x + 40 * g.s + i * 26 * g.s} cy={g.y + g.H - 14 * g.s - (i % 2) * 6 * g.s} rx={20 * g.s} ry={8 * g.s} fill="#d9a93a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                  <rect x={g.x + g.W * 0.8} y={g.y + g.H - 60 * g.s} width={g.W * 0.25} height={60 * g.s} fill="#4a3a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Folly beat: a newsboy on a street corner; the critics' paper ("SEWARD'S ICEBOX") swaps on `flip` for several
// approving front pages. All headline text is our own.
export const NewsPanel = ({ start, end, flip }: { start: number; end: number; flip: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [flip, flip + 12], [0, 1], clamp);
  const Paper = ({ x, y, w, head, sub, rot = 0 }: { x: number; y: number; w: number; head: string; sub: string; rot?: number }) => (
    <g transform={`rotate(${rot},${x + w / 2},${y})`}>
      <rect x={x} y={y} width={w} height={w * 1.2} fill="#efe8d6" stroke={PAL.ink} strokeWidth={1.6} />
      <rect x={x + w * 0.06} y={y + w * 0.05} width={w * 0.88} height={w * 0.1} fill="#2a2420" />
      <text x={x + w / 2} y={y + w * 0.3} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={w * 0.12} fill="#1a1512">{head}</text>
      <text x={x + w / 2} y={y + w * 0.44} textAnchor="middle" fontFamily={display} fontWeight={500} fontSize={w * 0.075} fill="#3a3028">{sub}</text>
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={x + w * 0.08} y1={y + w * (0.56 + i * 0.11)} x2={x + w * 0.92} y2={y + w * (0.56 + i * 0.11)} stroke="#9a8e78" strokeWidth={w * 0.025} />)}
    </g>
  );
  return (
    <Panel id="news" anchor={pt("washington")} start={start} end={end} sky={["#8a96a8", "#dcd6c8"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="news" start={start} end={end} warm={0.06}>
          {(pan) => {
            const ground = g.y + g.H * 0.7;
            const w = 150 * g.s;
            return (
              <g>
                <g transform={`translate(${pan * 0.2},0)`}>
                  {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={g.x + (i * 0.22 - 0.05) * g.W} y={ground - (130 + (i % 2) * 30) * g.s} width={g.W * 0.2} height={200 * g.s} fill={["#8a6a5a", "#7a7a6a", "#9a7a62", "#6a6a7a", "#8a7058"][i]} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                </g>
                <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#6a6258" />
                <g transform={`translate(${pan * 0.7},0)`}>
                  <g opacity={1 - k}>
                    <Paper x={g.x + g.W * 0.32} y={g.y + 30 * g.s} w={w * 1.25} head="SEWARD'S ICEBOX" sub="$7 MILLION FOR SNOW?" rot={-3} />
                  </g>
                  <g opacity={k}>
                    <Paper x={g.x + g.W * 0.1} y={g.y + 40 * g.s} w={w} head="A WISE BARGAIN" sub="FISH, FURS, TIMBER" rot={-6} />
                    <Paper x={g.x + g.W * 0.38} y={g.y + 26 * g.s} w={w} head="WELL BOUGHT" sub="THE PACIFIC DOOR" rot={2} />
                    <Paper x={g.x + g.W * 0.66} y={g.y + 44 * g.s} w={w} head="TREATY HAILED" sub="A NATION GROWS" rot={5} />
                  </g>
                </g>
                <Fighter x={g.x + g.W * 0.14} y={g.ground} scale={g.sc} mode="stand" costume={{ ...CLERK, jacket: "#5a4a3a" }} weapon="none" />
                <Fighter x={g.x + g.W * 0.84} y={g.ground + 2 * g.s} scale={g.sc} mode="walk" flip costume={CIVIL} weapon="none" phase={1} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <rect x={g.x + g.W * 0.02} y={g.y + g.H - 50 * g.s} width={110 * g.s} height={50 * g.s} fill="#3a2a1c" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  {[0, 1, 2].map((i) => <rect key={i} x={g.x + g.W * 0.02 + (8 + i * 32) * g.s} y={g.y + g.H - 62 * g.s} width={28 * g.s} height={14 * g.s} fill="#efe8d6" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                  <GasLamp x={g.x + g.W * 0.95} y={g.y + g.H + 30 * g.s} s={g.s * 1.5} on={0} />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Gold beat: a line of stampeders hauling packs up the snowy Chilkoot Pass.
export const PassPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="pass" anchor={pt("skagway")} start={start} end={end} sky={["#8ea4c4", "#e8eef4"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="pass" start={start} end={end} warm={0.05}>
          {(pan) => {
            const base = g.y + g.H * 0.85;
            const top = g.y + g.H * 0.22;
            const slope = (t: number) => [g.x + g.W * (0.05 + t * 0.85), base - (base - top) * t] as [number, number];
            return (
              <g>
                <Ridge g={g} base={g.y + g.H * 0.45} amp={70 * g.s} seed={12} color="#c9d4e4" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  <path d={`M${g.x - 60 * g.s} ${g.y + g.H} L${slope(0)[0]} ${base} L${slope(1)[0]} ${top} L${g.x + g.W + 60 * g.s} ${top + 30 * g.s} L${g.x + g.W + 60 * g.s} ${g.y + g.H} Z`} fill="#eef3f8" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.5} />
                  {Array.from({ length: 11 }, (_, i) => {
                    const t = (((frame - start) * 0.0025 + i / 11) % 1);
                    const [x, y] = slope(t);
                    return (
                      <g key={i}>
                        <rect x={x - 14 * g.s} y={y - 74 * g.s} width={20 * g.s} height={26 * g.s} rx={4 * g.s} fill="#7a5a3a" stroke={PAL.ink} strokeWidth={1 * g.s} />
                        <Fighter x={x} y={y} scale={g.sc * 0.55} mode="walk" costume={MINER} weapon="none" phase={i * 0.8} />
                      </g>
                    );
                  })}
                </g>
                <g transform={`translate(${pan * 1.6},0)`}>
                  <Pine x={g.x + g.W * 0.92} y={g.y + g.H + 16 * g.s} h={200 * g.s} color="#1f3a2e" />
                  <rect x={g.x + g.W * 0.02} y={g.y + g.H - 40 * g.s} width={90 * g.s} height={40 * g.s} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <path d={`M${g.x + g.W * 0.02 + 20 * g.s} ${g.y + g.H - 40 * g.s} l${14 * g.s} ${-26 * g.s} l${14 * g.s} ${26 * g.s} Z`} fill="#c9a24a" stroke={PAL.ink} strokeWidth={1 * g.s} />
                </g>
                <Snow g={g} n={26} depth={0.3} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Oil beat, shot 1: a drilling rig on the frozen Arctic coast, the flare burning steadily, a gusher on `strike`.
export const RigPanel = ({ start, end, strike }: { start: number; end: number; strike: number }) => {
  const frame = useCurrentFrame();
  const gush = interpolate(frame, [strike, strike + 20], [0, 1], clamp);
  const impact = impactAt(frame, [strike], 10) * 0.5;
  return (
    <Panel id="rig" anchor={pt("prudhoe")} start={start} end={end} sky={["#304a6a", "#f2b880"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="rig" start={start} end={end} impact={impact} warm={0.08}>
          {(pan) => {
            const ground = g.y + g.H * 0.68;
            const rx = g.cx + pan * 0.6;
            return (
              <g>
                <Glow x={g.x + g.W * 0.82} y={ground - 20 * g.s} s={g.s * 0.8} color="#ffb070" core="#ffe0b0" />
                <rect x={g.x} y={ground - 14 * g.s} width={g.W} height={20 * g.s} fill="#c8d6e4" />
                <Ridge g={g} base={ground} amp={6 * g.s} seed={3} color="#e4ecf2" shift={pan * 0.2} />
                {/* derrick */}
                <g>
                  <path d={`M${rx - 50 * g.s} ${ground + 30 * g.s} L${rx - 8 * g.s} ${ground - 190 * g.s} L${rx + 8 * g.s} ${ground - 190 * g.s} L${rx + 50 * g.s} ${ground + 30 * g.s}`} fill="none" stroke="#2a2d36" strokeWidth={5 * g.s} />
                  {Array.from({ length: 6 }, (_, i) => {
                    const y = ground + 30 * g.s - i * 36 * g.s;
                    const w = 50 - i * 7;
                    return <line key={i} x1={rx - w * g.s} y1={y} x2={rx + (w - 7) * g.s} y2={y - 36 * g.s} stroke="#2a2d36" strokeWidth={2.4 * g.s} />;
                  })}
                  <rect x={rx - 70 * g.s} y={ground + 10 * g.s} width={140 * g.s} height={26 * g.s} fill="#5a5e6a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  {gush > 0 && (
                    <g opacity={gush}>
                      <path d={`M${rx - 6 * g.s} ${ground - 190 * g.s} Q${rx - 40 * g.s} ${ground - 260 * g.s * gush} ${rx - 90 * g.s} ${ground - 120 * g.s} L${rx + 90 * g.s} ${ground - 120 * g.s} Q${rx + 40 * g.s} ${ground - 260 * g.s * gush} ${rx + 6 * g.s} ${ground - 190 * g.s} Z`} fill="#141210" opacity={0.85} />
                    </g>
                  )}
                </g>
                {/* flare stack, steady flame */}
                <g transform={`translate(${pan * 0.7},0)`}>
                  <line x1={g.x + g.W * 0.18} y1={ground + 30 * g.s} x2={g.x + g.W * 0.18} y2={ground - 110 * g.s} stroke="#3a3d46" strokeWidth={6 * g.s} />
                  <ellipse cx={g.x + g.W * 0.18} cy={ground - 124 * g.s} rx={(9 + Math.sin(frame * 0.3) * 1.5) * g.s} ry={(18 + Math.sin(frame * 0.4) * 3) * g.s} fill="#ff9a3a" />
                  <Glow x={g.x + g.W * 0.18} y={ground - 124 * g.s} s={g.s * 0.4} color="#ff9a3a" core="#ffe0a0" />
                </g>
                <rect x={g.x} y={ground + 30 * g.s} width={g.W} height={g.H} fill="#e8eef4" />
                <Fighter x={rx - 140 * g.s} y={g.ground} scale={g.sc * 0.9} mode="stand" costume={{ ...MINER, jacket: "#c9302c" }} weapon="none" />
                <Fighter x={rx + 140 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.9} mode="walk" flip costume={{ ...MINER, jacket: "#e0a020" }} weapon="none" phase={2} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 5 }, (_, i) => <rect key={i} x={g.x + g.W * 0.7 + i * 46 * g.s} y={g.y + g.H - 54 * g.s} width={40 * g.s} height={54 * g.s} fill="#3a4a5a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                  <path d={`M${g.x - 30 * g.s} ${g.y + g.H} q${g.W * 0.2} ${-36 * g.s} ${g.W * 0.4} 0 Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1 * g.s} strokeOpacity={0.4} />
                </g>
                <Snow g={g} n={14} depth={0.2} wind={2} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Oil beat, shot 2: the pipeline zigzagging south across the tundra on its stilts, caribou passing underneath.
export const PipelinePanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="pipeline" anchor={pt("fairbanks")} start={start} end={end} sky={["#7aa0c8", "#e6ecd8"]} accent={GOLD}>
      {(g) => (
        <Depth g={g} id="pipeline" start={start} end={end} warm={0.06}>
          {(pan) => {
            const ground = g.y + g.H * 0.6;
            const zig = (t: number) => [g.x - 60 * g.s + t * (g.W + 120 * g.s), ground + 10 * g.s + t * 90 * g.s + Math.sin(t * 9) * 14 * g.s] as [number, number];
            const pts = Array.from({ length: 20 }, (_, i) => zig(i / 19));
            return (
              <g>
                <Ridge g={g} base={ground - 10 * g.s} amp={60 * g.s} seed={21} color="#a8b8d0" shift={pan * 0.2} />
                <Ridge g={g} base={ground + 4 * g.s} amp={18 * g.s} seed={14} color="#7a8a5a" shift={pan * 0.4} />
                <rect x={g.x} y={ground + 4 * g.s} width={g.W} height={g.H} fill="#8a9a5a" />
                <g transform={`translate(${pan * 0.7},0)`}>
                  {pts.map(([x, y], i) => <line key={i} x1={x} y1={y + 26 * g.s} x2={x} y2={y} stroke="#4a4d56" strokeWidth={3 * g.s} />)}
                  <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} fill="none" stroke={PAL.ink} strokeWidth={14 * g.s} strokeLinecap="round" />
                  <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} fill="none" stroke="#c9ccd2" strokeWidth={10 * g.s} strokeLinecap="round" />
                </g>
                {[0, 1, 2].map((i) => {
                  const x = g.x + g.W * (0.3 + i * 0.08) + ((frame - start) * 1.0 * g.s) % (g.W * 0.4);
                  const y = g.ground - 30 * g.s + i * 8 * g.s;
                  return (
                    <g key={i} transform={`translate(${x},${y}) scale(${g.s * 1.1})`}>
                      <ellipse cx={0} cy={0} rx={26} ry={12} fill="#7a5a3a" stroke={PAL.ink} strokeWidth={1.4} />
                      <circle cx={26} cy={-8} r={7} fill="#7a5a3a" stroke={PAL.ink} strokeWidth={1.4} />
                      <path d="M28 -14 l-4 -16 m4 16 l8 -14" stroke="#e8dcc0" strokeWidth={2} />
                      {[-16, -6, 10, 18].map((lx, j) => <line key={j} x1={lx} y1={8} x2={lx + Math.sin(frame * 0.3 + j) * 3} y2={26} stroke="#4a3422" strokeWidth={3} />)}
                    </g>
                  );
                })}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <Grass g={g} color="#5a6a3a" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// ---- chapter 4 ----

// Fork shot 1: Seward's office with the chair empty and the lamp out — "if Seward hadn't been in office".
export const EmptyChairPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [start + 10, start + 50], [1, 0.25], clamp);
  return (
    <Panel id="chair" anchor={pt("washington")} start={start} end={end} sky={["#2a221a", "#4a3a2a"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="chair" start={start} end={end} warm={0.08}>
          {(pan) => {
            const floor = g.y + g.H * 0.78;
            return (
              <g>
                <g transform={`translate(${pan * 0.2},0)`}>
                  <rect x={g.x - 40 * g.s} y={g.y} width={g.W + 80 * g.s} height={g.H} fill="#3e3024" />
                  {Array.from({ length: 8 }, (_, i) => <rect key={i} x={g.x + i * 130 * g.s} y={g.y + 30 * g.s} width={110 * g.s} height={150 * g.s} fill="none" stroke="#2a2018" strokeWidth={4 * g.s} />)}
                  <rect x={g.x + g.W * 0.6} y={g.y + 40 * g.s} width={130 * g.s} height={100 * g.s} fill="#c9b994" stroke="#6b4a2e" strokeWidth={6 * g.s} />
                  <path d={`M${g.x + g.W * 0.6 + 20 * g.s} ${g.y + 100 * g.s} q${40 * g.s} ${-40 * g.s} ${90 * g.s} ${-10 * g.s}`} stroke="#6b5236" strokeWidth={2 * g.s} fill="none" />
                </g>
                <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#4a3424" />
                <g transform={`translate(${pan * 0.6},0)`}>
                  {/* desk */}
                  <rect x={g.x + g.W * 0.3} y={floor - 70 * g.s} width={g.W * 0.4} height={18 * g.s} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <rect x={g.x + g.W * 0.32} y={floor - 52 * g.s} width={14 * g.s} height={52 * g.s} fill="#4a2e1a" />
                  <rect x={g.x + g.W * 0.66} y={floor - 52 * g.s} width={14 * g.s} height={52 * g.s} fill="#4a2e1a" />
                  <rect x={g.x + g.W * 0.4} y={floor - 78 * g.s} width={90 * g.s} height={8 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />
                  {/* lamp going out */}
                  <rect x={g.x + g.W * 0.62} y={floor - 110 * g.s} width={14 * g.s} height={40 * g.s} fill="#b88a3a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <g opacity={dim}><Glow x={g.x + g.W * 0.62 + 7 * g.s} y={floor - 116 * g.s} s={g.s * 0.6} color="#ffb35a" core="#fff1c8" /></g>
                </g>
                {/* empty chair */}
                <g transform={`translate(${pan * 0.9},0)`}>
                  <rect x={g.x + g.W * 0.46} y={floor - 130 * g.s} width={70 * g.s} height={80 * g.s} rx={8 * g.s} fill="#6a2a22" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
                  <rect x={g.x + g.W * 0.45} y={floor - 50 * g.s} width={80 * g.s} height={14 * g.s} fill="#6a2a22" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
                  {[0, 1].map((i) => <line key={i} x1={g.x + g.W * 0.455 + i * 72 * g.s} y1={floor - 36 * g.s} x2={g.x + g.W * 0.455 + i * 72 * g.s} y2={floor} stroke="#3a2a1c" strokeWidth={5 * g.s} />)}
                </g>
                <g transform={`translate(${pan * 1.6},0)`}>
                  <rect x={g.x + g.W * 0.82} y={g.y + g.H - 120 * g.s} width={60 * g.s} height={120 * g.s} fill="#2a1c12" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <path d={`M${g.x - 20 * g.s} ${g.y + g.H} l${g.W * 0.18} ${-30 * g.s} l${g.W * 0.1} ${30 * g.s} Z`} fill="#2a1c12" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Fork shot 2: the Civil War drags on — blue and grey lines (no flags) trade cannon fire across a field.
export const CivilWarPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const shots = [start + 16, start + 46, start + 76];
  const impact = impactAt(frame, shots.map((f) => f + 18), 8) * 0.55;
  return (
    <Panel id="civilwar" anchor={pt("washington")} start={start} end={end} sky={["#7d8090", "#d8c8a8"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="civilwar" start={start} end={end} impact={impact} warm={0.06}>
          {(pan) => {
            const ground = g.y + g.H * 0.66;
            return (
              <g>
                <Ridge g={g} base={ground - 10 * g.s} amp={40 * g.s} seed={6} color="#8a9a8a" shift={pan * 0.2} />
                <Ridge g={g} base={ground + 4 * g.s} amp={16 * g.s} seed={2} color="#6a7a4a" shift={pan * 0.5} />
                <rect x={g.x} y={ground + 4 * g.s} width={g.W} height={g.H} fill="#7a8a4a" />
                {[0, 1, 2].map((i) => <Fighter key={`b${i}`} x={g.x + g.W * (0.12 + i * 0.07)} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.8} mode="aim" costume={COSTUME_W.usa1860} weapon="rifle" phase={i} />)}
                {[0, 1, 2].map((i) => <Fighter key={`g${i}`} x={g.x + g.W * (0.88 - i * 0.07)} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.8} mode="aim" flip costume={GREY} weapon="rifle" phase={i + 3} />)}
                {/* cannon on the left */}
                <g>
                  <circle cx={g.x + g.W * 0.36} cy={g.ground - 12 * g.s} r={16 * g.s} fill="none" stroke="#3a2a1c" strokeWidth={4 * g.s} />
                  <rect x={g.x + g.W * 0.36} y={g.ground - 30 * g.s} width={60 * g.s} height={12 * g.s} fill="#2a2a2a" transform={`rotate(-8,${g.x + g.W * 0.36},${g.ground - 24 * g.s})`} />
                </g>
                {shots.map((f, i) => <Shot key={i} from={[g.x + g.W * 0.36 + 60 * g.s, g.ground - 34 * g.s]} to={[g.x + g.W * 0.72, g.ground - 4 * g.s]} t={frame - f} s={g.s} flight={18} />)}
                <rect x={g.x} y={ground - 30 * g.s} width={g.W} height={40 * g.s} fill="#e9e2d6" opacity={0.14} style={{ filter: `blur(${10 * g.s}px)` }} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <Grass g={g} color="#3a4a24" />
                  <path d={`M${g.x + g.W * 0.4} ${g.y + g.H} l${20 * g.s} ${-30 * g.s} l${120 * g.s} 0 l${20 * g.s} ${30 * g.s} Z`} fill="#6b5236" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Fork shot 3: the Winter Palace in snow, guards at the gate — "if the Tsar had changed his mind".
export const PalacePanel = ({ start, end }: { start: number; end: number }) => (
  <Panel id="palace" anchor={pt("stPetersburg")} start={start} end={end} sky={["#5a6a8a", "#d8dde6"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="palace" start={start} end={end} warm={0.04}>
        {(pan) => {
          const ground = g.y + g.H * 0.66;
          return (
            <g>
              <Ridge g={g} base={ground - 70 * g.s} amp={10 * g.s} seed={1} color="#b8c2d4" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                <rect x={g.x + g.W * 0.05} y={ground - 120 * g.s} width={g.W * 0.9} height={130 * g.s} fill="#5f9a7a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={g.x + g.W * 0.05} y={ground - 128 * g.s} width={g.W * 0.9} height={10 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                {Array.from({ length: 22 }, (_, i) => <rect key={i} x={g.x + g.W * (0.07 + i * 0.04)} y={ground - 116 * g.s} width={6 * g.s} height={120 * g.s} fill="#efe6d0" />)}
                {Array.from({ length: 11 }, (_, i) => <rect key={`w${i}`} x={g.x + g.W * (0.09 + i * 0.08)} y={ground - 96 * g.s} width={14 * g.s} height={26 * g.s} fill="#2a3040" />)}
                {Array.from({ length: 11 }, (_, i) => <rect key={`v${i}`} x={g.x + g.W * (0.09 + i * 0.08)} y={ground - 50 * g.s} width={14 * g.s} height={26 * g.s} fill="#2a3040" />)}
                {Array.from({ length: 9 }, (_, i) => <circle key={`s${i}`} cx={g.x + g.W * (0.1 + i * 0.1)} cy={ground - 136 * g.s} r={5 * g.s} fill={PAL.gilt} />)}
                <Flag x={g.cx} y={ground - 128 * g.s} s={g.s * 0.7} h={70} stripes={RU_FLAG} />
              </g>
              <SnowGround g={g} y={ground + 10 * g.s} shift={pan * 0.7} />
              <Fighter x={g.cx - 80 * g.s} y={g.ground} scale={g.sc * 0.9} mode="stand" costume={GUARD} weapon="rifle" />
              <Fighter x={g.cx + 80 * g.s} y={g.ground} scale={g.sc * 0.9} mode="stand" flip costume={GUARD} weapon="rifle" phase={2} />
              <g transform={`translate(${pan * 1.6},0)`}>
                {/* sentry box, nearest */}
                {Array.from({ length: 4 }, (_, i) => <rect key={i} x={g.x + g.W * 0.03} y={g.y + g.H - (i + 1) * 30 * g.s} width={60 * g.s} height={30 * g.s} fill={i % 2 ? "#f4f1ea" : "#1b1d24"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                <path d={`M${g.x + g.W * 0.6} ${g.y + g.H} q${g.W * 0.2} ${-40 * g.s} ${g.W * 0.45} 0 Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1 * g.s} strokeOpacity={0.4} />
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

// Split beat: the treaty on the desk is torn in two on `tear`, the halves pulling apart, scraps drifting.
export const TearPanel = ({ start, end, tear }: { start: number; end: number; tear: number }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [tear - 4, tear + 16], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 });
  const impact = impactAt(frame, [tear], 8) * 0.5;
  return (
    <Panel id="tear" anchor={pt("sitka")} start={start} end={end} sky={["#1c140e", "#3a281a"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="tear" start={start} end={end} impact={impact} warm={0.1}>
          {(pan) => {
            const desk = g.y + g.H * 0.72;
            const cx = g.cx + pan * 0.6;
            const py = g.y + 40 * g.s;
            const pw = 300 * g.s;
            const ph = 230 * g.s;
            const jag = Array.from({ length: 9 }, (_, i) => `${cx + (i % 2 ? 8 : -8) * g.s},${py + (i * ph) / 8}`).join(" L");
            const half = (side: -1 | 1) => (
              <g transform={`translate(${side * t * 90 * g.s},${t * 20 * g.s}) rotate(${side * t * 8},${cx},${py + ph})`}>
                <path d={side < 0 ? `M${cx - pw / 2} ${py} L${jag} L${cx - pw / 2} ${py + ph} Z` : `M${cx + pw / 2} ${py} L${jag} L${cx + pw / 2} ${py + ph} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={cx + side * 20 * g.s} y1={py + (40 + i * 26) * g.s} x2={cx + side * (pw / 2 - 20 * g.s)} y2={py + (40 + i * 26) * g.s} stroke="#8a7a60" strokeWidth={1.6 * g.s} />)}
              </g>
            );
            return (
              <g>
                <g transform={`translate(${pan * 0.2},0)`}>
                  {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x - 30 * g.s + i * 110 * g.s} y={g.y} width={100 * g.s} height={g.H} fill={i % 2 ? "#2a1e14" : "#30231a"} />)}
                </g>
                <rect x={g.x} y={desk} width={g.W} height={g.H} fill="#5a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <text x={cx} y={py - 8 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={26 * g.s} fill="#efe6d0" opacity={1 - t}>TREATY · 1867</text>
                {half(-1)}
                {half(1)}
                {t > 0 &&
                  Array.from({ length: 6 }, (_, i) => (
                    <rect key={i} x={cx + (i - 3) * 14 * g.s} y={py + ph * 0.5 + t * (60 + i * 20) * g.s} width={10 * g.s} height={8 * g.s} fill="#efe6d0" opacity={1 - t * 0.6} transform={`rotate(${i * 40 + frame * 4},${cx + (i - 3) * 14 * g.s},${py + ph * 0.5})`} />
                  ))}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <rect x={g.x + g.W * 0.84} y={desk - 40 * g.s} width={16 * g.s} height={60 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <Glow x={g.x + g.W * 0.84 + 8 * g.s} y={desk - 50 * g.s} s={g.s * 0.7} color="#ffb35a" core="#fff1c8" />
                  <path d={`M${g.x + 10 * g.s} ${g.y + g.H} l${60 * g.s} ${-46 * g.s} l${80 * g.s} ${10 * g.s} l${-30 * g.s} ${36 * g.s} Z`} fill="#3a2a1c" />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Twoways beat: a lone traveller at a fork in a snowy road under the aurora; signposts A (pink) and B (red).
export const CrossroadsPanel = ({ start, end, a, b }: { start: number; end: number; a: number; b: number }) => {
  const frame = useCurrentFrame();
  const ka = interpolate(frame, [a, a + 10], [0, 1], clamp);
  const kb = interpolate(frame, [b, b + 10], [0, 1], clamp);
  return (
    <Panel id="crossroads" anchor={pt("fairbanks")} start={start} end={end} sky={["#0a0f2e", "#3a2c62"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="crossroads" start={start} end={end} warm={0.02}>
          {(pan) => {
            const horizon = g.y + g.H * 0.5;
            const fx = g.cx + pan * 0.6;
            const fy = g.y + g.H * 0.78;
            return (
              <g>
                <g style={{ filter: `blur(${10 * g.s}px)` }}>
                  {[0, 1].map((i) => <path key={i} d={`M${g.x} ${g.y + (50 + i * 30) * g.s + Math.sin(frame * 0.03 + i) * 14 * g.s} Q${g.cx} ${g.y + (10 + i * 30) * g.s} ${g.x + g.W} ${g.y + (60 + i * 30) * g.s}`} fill="none" stroke="#7affc4" strokeWidth={22 * g.s} opacity={0.3} />)}
                </g>
                <Ridge g={g} base={horizon} amp={40 * g.s} seed={17} color="#b8c3dc" shift={pan * 0.2} />
                <SnowGround g={g} y={horizon + 6 * g.s} shift={pan * 0.4} color="#d6dfea" />
                {/* the road splitting */}
                <g transform={`translate(${pan * 0.6},0)`}>
                  <path d={`M${fx - 70 * g.s} ${g.y + g.H} L${fx - 12 * g.s} ${fy} L${fx + 12 * g.s} ${fy} L${fx + 70 * g.s} ${g.y + g.H} Z`} fill="#8a96a8" />
                  <path d={`M${fx - 12 * g.s} ${fy} L${g.x + g.W * 0.12} ${horizon + 14 * g.s} L${g.x + g.W * 0.18} ${horizon + 14 * g.s} L${fx} ${fy} Z`} fill="#ff8fc8" opacity={0.25 + 0.55 * ka} />
                  <path d={`M${fx} ${fy} L${g.x + g.W * 0.82} ${horizon + 14 * g.s} L${g.x + g.W * 0.88} ${horizon + 14 * g.s} L${fx + 12 * g.s} ${fy} Z`} fill="#ff4d4d" opacity={0.25 + 0.55 * kb} />
                  {/* signpost */}
                  <line x1={fx} y1={fy + 4 * g.s} x2={fx} y2={fy - 130 * g.s} stroke="#4a3322" strokeWidth={6 * g.s} />
                  <g opacity={0.35 + 0.65 * ka}>
                    <path d={`M${fx} ${fy - 120 * g.s} l${-150 * g.s} 0 l${-18 * g.s} ${17 * g.s} l${18 * g.s} ${17 * g.s} l${150 * g.s} 0 Z`} fill="#ff8fc8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <text x={fx - 80 * g.s} y={fy - 94 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={30 * g.s} fill="#1b1d24">PATH A</text>
                  </g>
                  <g opacity={0.35 + 0.65 * kb}>
                    <path d={`M${fx} ${fy - 84 * g.s} l${150 * g.s} 0 l${18 * g.s} ${17 * g.s} l${-18 * g.s} ${17 * g.s} l${-150 * g.s} 0 Z`} fill="#ff4d4d" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <text x={fx + 80 * g.s} y={fy - 58 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={30 * g.s} fill="#fff">PATH B</text>
                  </g>
                </g>
                <Fighter x={fx - 30 * g.s} y={g.ground + 10 * g.s} scale={g.sc} mode="stand" costume={{ ...CIVIL, jacket: "#3a2a4a" }} weapon="none" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <Pine x={g.x + g.W * 0.04} y={g.y + g.H + 14 * g.s} h={210 * g.s} color="#16281f" />
                  <Pine x={g.x + g.W * 0.96} y={g.y + g.H + 16 * g.s} h={230 * g.s} color="#16281f" />
                </g>
                <Snow g={g} n={26} depth={0.25} />
                <Snow g={g} n={10} depth={0.9} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

