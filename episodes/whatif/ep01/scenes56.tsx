import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { type Costume, Depth, Fighter, Glow, Grass, PAL, Ridge } from "../../../components/Scene";
import { clamp, GOLD, Panel } from "../../worldhistory/kit/news";
import { COSTUME_W, LogHouse, OnionChurch, Pine, REAL, RU_FLAG, Snow, SnowGround, US_FLAG, WHATIF } from "../kit/WhatIf";
import { P } from "./places";

// Style-v2 panels for chapters 5 (Path A: Alaska becomes Canada) and 6 (Path B: Soviet Alaska), plus the
// pieces they need: ships, sea, flags (Union Jack, Red Ensign, red-with-star), towers, rigs, trucks.
type G = InsetGeom;
type Span = { start: number; end: number };
const pt = (p: readonly number[]) => p as [number, number];

export const CANADA = "#ff8fc8";
export const SOVIET = "#d8232a";

export const COSTUME_X: Record<string, Costume> = {
  mountie: { jacket: "#b3262a", sash: "#d9a93a", pants: "#1f2a44", head: "brodie", headColor: "#7a5a36", skin: "#e0b08a" },
  redcoat: { jacket: "#b3262a", sash: "#efe6d0", pants: "#2a2a34", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" },
  canada44: { jacket: "#6e6a45", sash: "#4a4630", pants: "#5e5a3c", head: "brodie", headColor: "#55553a", skin: "#e0b08a" },
  usa1918: { jacket: "#7a6a40", sash: "#4a3e24", pants: "#6e5f3a", head: "brodie", headColor: "#6a5f3c", skin: "#e0b08a" },
  usa1950: { jacket: "#56603e", sash: "#3a4028", pants: "#4e5638", head: "helmet", headColor: "#4a5234", skin: "#e0b08a" },
  prospector: { jacket: "#7a4a2a", sash: "#3a2a1c", pants: "#3a3a44", head: "brodie", headColor: "#4a3a2a", skin: "#e0b08a" },
  worker: { jacket: "#c96a1e", sash: "#2a2a2a", pants: "#2a3346", head: "helmet", headColor: "#e8c23a", skin: "#e0b08a" },
  civilA: { jacket: "#3a2e2a", sash: "#6b5236", pants: "#2a2420", head: "short", skin: "#e0b08a" },
  civilB: { jacket: "#2e3a4a", sash: "#8a6a3a", pants: "#2a2a30", head: "short", skin: "#e0b08a" },
  fogGrey: { jacket: "#6a6e72", sash: "#4a4e52", pants: "#5a5e62", head: "helmet", headColor: "#55595d", skin: "#9a9a9a" },
};

// ---- pieces ----

export const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    return `${i ? "L" : "M"}${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
  }).join(" ") + " Z";

// Flag contents drawn in a fw × fh box at the origin.
const UnionJack = ({ w, h }: { w: number; h: number }) => (
  <g>
    <rect width={w} height={h} fill="#1f3f8f" />
    <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#f4f1ea" strokeWidth={h * 0.2} />
    <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#c8102e" strokeWidth={h * 0.07} />
    <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#f4f1ea" strokeWidth={h * 0.32} />
    <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#c8102e" strokeWidth={h * 0.19} />
  </g>
);
const RedEnsign = ({ w, h }: { w: number; h: number }) => (
  <g>
    <rect width={w} height={h} fill="#c8202e" />
    <UnionJack w={w * 0.5} h={h * 0.5} />
    <circle cx={w * 0.74} cy={h * 0.55} r={h * 0.13} fill="#efe6d0" opacity={0.9} />
  </g>
);
const RedStar = ({ w, h }: { w: number; h: number }) => (
  <g>
    <rect width={w} height={h} fill={SOVIET} />
    <path d={star(w * 0.2, h * 0.25, h * 0.14)} fill={GOLD} />
  </g>
);
const Stripes = ({ w, h, stripes, canton }: { w: number; h: number; stripes: string[]; canton?: boolean }) => (
  <g>
    {stripes.map((c, i) => <rect key={i} y={(i * h) / stripes.length} width={w} height={h / stripes.length + 0.5} fill={c} />)}
    {canton && <rect width={w * 0.43} height={(h * 7) / 13} fill="#2a3f86" />}
  </g>
);
export type FlagKind = "uk" | "ensign" | "redstar" | "ru" | "us";
// A flag on a pole with a slow wave (skew + stretch). raise 0 = foot of the pole, 1 = top.
export const PoleFlag = ({ x, y, s, kind, h = 160, w = 64, raise = 1 }: { x: number; y: number; s: number; kind: FlagKind; h?: number; w?: number; raise?: number }) => {
  const frame = useCurrentFrame();
  const fw = w * s;
  const fh = w * 0.6 * s;
  const top = y - h * s + (1 - raise) * (h * s - fh - 16 * s);
  const sk = Math.sin(frame * 0.18) * 5;
  const sc = 1 + Math.sin(frame * 0.18 + 1) * 0.04;
  const body = kind === "uk" ? <UnionJack w={fw} h={fh} /> : kind === "ensign" ? <RedEnsign w={fw} h={fh} /> : kind === "redstar" ? <RedStar w={fw} h={fh} /> : kind === "ru" ? <Stripes w={fw} h={fh} stripes={RU_FLAG} /> : <Stripes w={fw} h={fh} stripes={US_FLAG} canton />;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - h * s - 6 * s} stroke="#3a2a1c" strokeWidth={4 * s} />
      <circle cx={x} cy={y - h * s - 8 * s} r={4 * s} fill={PAL.gilt} />
      <g transform={`translate(${x},${top}) skewY(${sk}) scale(${sc},1)`}>
        {body}
        <rect width={fw} height={fh} fill="none" stroke={PAL.ink} strokeWidth={1.4 * s} />
      </g>
    </g>
  );
};

// Moving sea band from y down to the panel bottom; waves drift with `pan`.
export const Sea = ({ g, y, pan = 0, color = "#3b5a6e", deep = "#22394a" }: { g: G; y: number; pan?: number; color?: string; deep?: string }) => {
  const frame = useCurrentFrame();
  const wave = (yy: number, amp: number, k: number, sp: number) =>
    `M${g.x - 60 * g.s} ${yy} ` + Array.from({ length: 26 }, (_, i) => `L${g.x - 60 * g.s + i * ((g.W + 120 * g.s) / 25) + pan * k} ${yy + Math.sin(i * 1.3 + frame * sp) * amp * g.s}`).join(" ");
  return (
    <g>
      <rect x={g.x} y={y} width={g.W} height={g.y + g.H - y} fill={color} />
      <rect x={g.x} y={y + (g.y + g.H - y) * 0.45} width={g.W} height={g.y + g.H - y} fill={deep} opacity={0.6} />
      {[0.15, 0.4, 0.75].map((f, i) => <path key={i} d={wave(y + (g.y + g.H - y) * f, 2 + i * 1.6, 0.4 + i * 0.5, 0.06 + i * 0.03)} fill="none" stroke="#e8f0f4" strokeWidth={(1.2 + i * 0.6) * g.s} opacity={0.35 + i * 0.1} />)}
    </g>
  );
};

// Smoke puffs rising from a point (deterministic loop).
export const Smoke = ({ x, y, s, n = 6, color = "#d8d4cc", rate = 1 }: { x: number; y: number; s: number; n?: number; color?: string; rate?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const age = ((frame * rate + i * (60 / n)) % 60) / 60;
        return <circle key={i} cx={x - age * 50 * s + Math.sin(i * 2 + frame * 0.05) * 4 * s} cy={y - age * 70 * s} r={(6 + age * 20) * s} fill={color} opacity={0.55 * (1 - age)} />;
      })}
    </g>
  );
};

// Steam-and-sail warship of the 1860s–1900s, facing right. `flag` = the stern ensign.
export const Warship = ({ x, y, s, flag, smoke = true }: { x: number; y: number; s: number; flag?: FlagKind; smoke?: boolean }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.08) * 2 * s;
  return (
    <g transform={`translate(0,${bob})`}>
      <path d={`M${x - 150 * s} ${y - 30 * s} L${x + 150 * s} ${y - 30 * s} L${x + 125 * s} ${y + 6 * s} L${x - 135 * s} ${y + 6 * s} Z`} fill="#1c1d22" stroke={PAL.ink} strokeWidth={2 * s} />
      <rect x={x - 140 * s} y={y - 22 * s} width={270 * s} height={5 * s} fill="#efe6d0" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x - 110 * s + i * 30 * s} y={y - 21 * s} width={8 * s} height={4 * s} fill="#1c1d22" />)}
      {[-80, 10, 90].map((mx, i) => (
        <g key={i}>
          <line x1={x + mx * s} y1={y - 30 * s} x2={x + mx * s} y2={y - (150 - i * 10) * s} stroke="#3a2a1c" strokeWidth={4 * s} />
          {[0, 1].map((r) => <path key={r} d={`M${x + (mx - 30) * s} ${y - (130 - i * 10 - r * 40) * s} L${x + (mx + 30) * s} ${y - (130 - i * 10 - r * 40) * s} L${x + (mx + 24) * s} ${y - (104 - i * 10 - r * 40) * s} L${x + (mx - 24) * s} ${y - (104 - i * 10 - r * 40) * s} Z`} fill="#e4dccb" stroke={PAL.ink} strokeWidth={1.2 * s} />)}
        </g>
      ))}
      <rect x={x + 40 * s} y={y - 70 * s} width={18 * s} height={40 * s} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={1.4 * s} />
      {smoke && <Smoke x={x + 49 * s} y={y - 74 * s} s={s} color="#8a8a8a" />}
      {flag && <PoleFlag x={x - 145 * s} y={y - 30 * s} s={s * 0.7} kind={flag} h={80} w={54} />}
    </g>
  );
};

// Small steamer / transport ship, facing right.
export const Steamer = ({ x, y, s, flag }: { x: number; y: number; s: number; flag?: FlagKind }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + 1) * 2 * s;
  return (
    <g transform={`translate(0,${bob})`}>
      <path d={`M${x - 170 * s} ${y - 36 * s} L${x + 160 * s} ${y - 36 * s} L${x + 140 * s} ${y + 6 * s} L${x - 160 * s} ${y + 6 * s} Z`} fill="#3a3e44" stroke={PAL.ink} strokeWidth={2 * s} />
      <rect x={x - 90 * s} y={y - 66 * s} width={150 * s} height={30 * s} fill="#d9d2c0" stroke={PAL.ink} strokeWidth={1.4 * s} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={x - 74 * s + i * 24 * s} cy={y - 51 * s} r={4 * s} fill="#3a3e44" />)}
      <rect x={x - 20 * s} y={y - 104 * s} width={24 * s} height={38 * s} fill="#1f1f22" stroke={PAL.ink} strokeWidth={1.4 * s} />
      <rect x={x - 20 * s} y={y - 96 * s} width={24 * s} height={6 * s} fill="#b3262a" />
      <Smoke x={x - 8 * s} y={y - 108 * s} s={s} color="#6e6e70" />
      {flag && <PoleFlag x={x - 165 * s} y={y - 36 * s} s={s * 0.7} kind={flag} h={70} w={50} />}
    </g>
  );
};

// Gothic government building with a central clock tower (Ottawa's Parliament, simplified).
const Parliament = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g stroke={PAL.ink} strokeWidth={1.4 * s}>
    <rect x={x - 220 * s} y={y - 70 * s} width={440 * s} height={70 * s} fill="#c9b994" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={x - 205 * s + i * 30 * s} y={y - 56 * s} width={12 * s} height={26 * s} fill="#4a5a6e" />)}
    <path d={`M${x - 228 * s} ${y - 70 * s} L${x + 228 * s} ${y - 70 * s} L${x + 210 * s} ${y - 90 * s} L${x - 210 * s} ${y - 90 * s} Z`} fill="#4f7a64" />
    <rect x={x - 30 * s} y={y - 170 * s} width={60 * s} height={170 * s} fill="#cbbb96" />
    <circle cx={x} cy={y - 140 * s} r={14 * s} fill="#efe6d0" />
    <path d={`M${x - 36 * s} ${y - 170 * s} L${x} ${y - 230 * s} L${x + 36 * s} ${y - 170 * s} Z`} fill="#4f7a64" />
    {[-180, 180].map((dx) => <path key={dx} d={`M${x + dx * s - 14 * s} ${y - 90 * s} L${x + dx * s} ${y - 124 * s} L${x + dx * s + 14 * s} ${y - 90 * s} Z`} fill="#4f7a64" />)}
  </g>
);

// Wooden watchtower with a searchlight that sweeps slowly (beam fades, never blinks).
const Watchtower = ({ x, y, s, beam }: { x: number; y: number; s: number; beam: number }) => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame * 0.03) * 28;
  return (
    <g>
      <g transform={`rotate(${a},${x},${y - 200 * s})`} opacity={0.2 * beam}>
        <path d={`M${x} ${y - 200 * s} L${x + 260 * s} ${y - 40 * s} L${x + 180 * s} ${y + 10 * s} Z`} fill="#eef3ff" />
      </g>
      <g stroke={PAL.ink} strokeWidth={1.6 * s} fill="none">
        <path d={`M${x - 34 * s} ${y} L${x - 20 * s} ${y - 190 * s} M${x + 34 * s} ${y} L${x + 20 * s} ${y - 190 * s}`} stroke="#4a3322" strokeWidth={6 * s} />
        {[0.25, 0.5, 0.75].map((k) => <line key={k} x1={x - 34 * s + 14 * s * k} y1={y - 190 * s * k} x2={x + 34 * s - 14 * s * k} y2={y - 190 * s * k} stroke="#4a3322" strokeWidth={3 * s} />)}
      </g>
      <rect x={x - 32 * s} y={y - 226 * s} width={64 * s} height={38 * s} fill="#5a4a36" stroke={PAL.ink} strokeWidth={1.6 * s} />
      <path d={`M${x - 40 * s} ${y - 226 * s} L${x} ${y - 250 * s} L${x + 40 * s} ${y - 226 * s} Z`} fill="#3a2e22" stroke={PAL.ink} strokeWidth={1.6 * s} />
      <circle cx={x + 24 * s} cy={y - 208 * s} r={7 * s} fill="#fff7d8" opacity={0.6 + 0.4 * beam} />
    </g>
  );
};

// Oil derrick (lattice tower) with an optional gas flare that flickers softly.
const Derrick = ({ x, y, s, flare = 0 }: { x: number; y: number; s: number; flare?: number }) => {
  const frame = useCurrentFrame();
  const f = 1 + Math.sin(frame * 0.6) * 0.06 + Math.sin(frame * 1.7) * 0.04;
  return (
    <g>
      <g stroke="#2a2a2e" strokeWidth={3 * s} fill="none">
        <path d={`M${x - 40 * s} ${y} L${x} ${y - 200 * s} L${x + 40 * s} ${y}`} />
        {Array.from({ length: 6 }, (_, i) => {
          const k = (i + 1) / 7;
          return <path key={i} d={`M${x - 40 * s * (1 - k)} ${y - 200 * s * k} L${x + 40 * s * (1 - k)} ${y - 200 * s * k}`} />;
        })}
        <path d={`M${x - 34 * s} ${y - 30 * s} L${x + 28 * s} ${y - 60 * s} M${x + 34 * s} ${y - 30 * s} L${x - 28 * s} ${y - 60 * s}`} />
      </g>
      <rect x={x - 70 * s} y={y - 24 * s} width={50 * s} height={24 * s} fill="#6a6e74" stroke={PAL.ink} strokeWidth={1.4 * s} />
      {flare > 0 && (
        <g opacity={flare}>
          <line x1={x + 90 * s} y1={y} x2={x + 90 * s} y2={y - 120 * s} stroke="#3a3a3e" strokeWidth={5 * s} />
          <ellipse cx={x + 90 * s} cy={y - 140 * s} rx={12 * s * f} ry={26 * s * f} fill="#ff9a2a" />
          <ellipse cx={x + 90 * s} cy={y - 134 * s} rx={6 * s * f} ry={14 * s * f} fill="#ffe28a" />
          <Glow x={x + 90 * s} y={y - 140 * s} s={s * 0.6 * f} color="#ff8a2a" core="#ffe8b0" />
        </g>
      )}
    </g>
  );
};

// Army truck (canvas back), facing right.
const Truck = ({ x, y, s, color = "#56603e", star: withStar = false }: { x: number; y: number; s: number; color?: string; star?: boolean }) => (
  <g stroke={PAL.ink} strokeWidth={1.6 * s}>
    <path d={`M${x - 90 * s} ${y - 70 * s} Q${x - 30 * s} ${y - 92 * s} ${x + 30 * s} ${y - 70 * s} L${x + 30 * s} ${y - 24 * s} L${x - 90 * s} ${y - 24 * s} Z`} fill="#7a7a5a" />
    <rect x={x + 30 * s} y={y - 60 * s} width={46 * s} height={36 * s} fill={color} />
    <rect x={x + 50 * s} y={y - 54 * s} width={20 * s} height={14 * s} fill="#9fb6c8" />
    <rect x={x - 96 * s} y={y - 28 * s} width={176 * s} height={12 * s} fill="#2a2a2a" />
    {[-60, 40].map((dx) => <circle key={dx} cx={x + dx * s} cy={y - 10 * s} r={13 * s} fill="#1a1a1a" />)}
    {withStar && <path d={star(x + 50 * s, y - 32 * s, 6 * s)} fill="#efe6d0" stroke="none" />}
  </g>
);

const Palm = ({ x, y, h, s }: { x: number; y: number; h: number; s: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.05 + x * 0.01) * 4;
  return (
    <g transform={`rotate(${sway},${x},${y})`}>
      <path d={`M${x} ${y} Q${x + 10 * s} ${y - h * 0.5} ${x + 4 * s} ${y - h}`} stroke="#6b4a2e" strokeWidth={7 * s} fill="none" />
      {[-150, -110, -60, -20, 20].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <path key={i} d={`M${x + 4 * s} ${y - h} q${Math.cos(r) * 40 * s} ${Math.sin(r) * 30 * s - 10 * s} ${Math.cos(r) * 70 * s} ${Math.sin(r) * 20 * s + 26 * s}`} stroke="#3f7a3a" strokeWidth={8 * s} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Fighter row helper.
const Row = ({ xs, y, sc, costume, flip = false, mode = "stand", weapon = "rifle", phase = 0 }: { xs: number[]; y: number; sc: number; costume: Costume; flip?: boolean; mode?: "walk" | "run" | "stand" | "aim"; weapon?: "rifle" | "spear" | "none"; phase?: number }) => (
  <g>{xs.map((x, i) => <Fighter key={i} x={x} y={y - (i % 2) * 4 * (sc / 1.5)} scale={sc} flip={flip} mode={mode} costume={costume} weapon={weapon} phase={phase + i * 1.3} />)}</g>
);

// A walker crossing the panel over its life (x from a→b as fractions of W).
const walkX = (g: G, s: Span, a: number, b: number) => g.x + g.W * interpolate(g.frame, [s.start, s.end], [a, b], clamp);

// ---- chapter 5 panels: Path A ----

// a1: dusk on the palisade at Sitka; a sentry watches a British warship on the horizon.
export const WatchPanel = (sp: Span) => (
  <Panel id="c5watch" anchor={pt(P.sitka)} start={sp.start} end={sp.end} sky={["#2a2440", "#e08a5a"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5watch" start={sp.start} end={sp.end} warm={0.08}>
        {(pan) => {
          const sea = g.y + g.H * 0.52;
          const ship = interpolate(g.frame, [sp.start, sp.end], [0.7, 0.62], clamp);
          return (
            <g>
              <Glow x={g.x + g.W * 0.2} y={sea - 20 * g.s} s={g.s * 0.8} color="#ffb070" core="#ffe0b0" />
              <Ridge g={g} base={sea - 4 * g.s} amp={40 * g.s} seed={4} color="#5a4a6a" shift={pan * 0.2} />
              <Sea g={g} y={sea} pan={pan} color="#4a4a6a" deep="#2a2a44" />
              <g transform={`translate(${pan * 0.4},0)`}>
                <Warship x={g.x + g.W * ship} y={sea + 22 * g.s} s={g.s * 0.45} flag="uk" />
              </g>
              {/* palisade + walkway */}
              <g transform={`translate(${pan * 0.8},0)`}>
                <rect x={g.x - 40 * g.s} y={g.y + g.H * 0.72} width={g.W + 80 * g.s} height={g.H} fill="#5a3e26" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${g.x - 30 * g.s + i * 32 * g.s} ${g.y + g.H} l0 ${-g.H * 0.36} l${7 * g.s} ${-9 * g.s} l${7 * g.s} ${9 * g.s} l0 ${g.H * 0.36} Z`} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                <PoleFlag x={g.x + g.W * 0.12} y={g.y + g.H * 0.72} s={g.s} kind="ru" h={150} />
              </g>
              <Fighter x={g.x + g.W * 0.42} y={g.y + g.H * 0.72} scale={g.sc * 0.85} mode="stand" flip costume={COSTUME_W.russia1860} weapon="rifle" />
              <Fighter x={g.x + g.W * 0.52} y={g.y + g.H * 0.72} scale={g.sc * 0.85} mode="stand" costume={COSTUME_W.russia1860} weapon="none" phase={2} />
              <Snow g={g} n={14} depth={0.3} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a2 (real): Ottawa, 1 July 1867 — Parliament, bunting, a crowd in top hats, the Union Jack.
export const OttawaPanel = (sp: Span) => (
  <Panel id="c5ottawa" anchor={pt(P.ottawa)} start={sp.start} end={sp.end} sky={["#6a9ad0", "#e8eef2"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="c5ottawa" start={sp.start} end={sp.end} warm={0.06}>
        {(pan) => {
          const ground = g.y + g.H * 0.66;
          return (
            <g>
              <Glow x={g.x + g.W * 0.85} y={g.y + 60 * g.s} s={g.s * 0.7} />
              <Ridge g={g} base={ground - 30 * g.s} amp={18 * g.s} seed={6} color="#7a9a7a" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                <Parliament x={g.cx} y={ground} s={g.s * 0.95} />
                <PoleFlag x={g.cx} y={ground - 220 * g.s} s={g.s * 0.7} kind="uk" h={60} w={56} />
                {/* bunting */}
                <path d={`M${g.x} ${ground - 96 * g.s} Q${g.cx} ${ground - 50 * g.s} ${g.x + g.W} ${ground - 96 * g.s}`} fill="none" stroke="#3a2a1c" strokeWidth={1.4 * g.s} />
                {Array.from({ length: 18 }, (_, i) => {
                  const t = (i + 0.5) / 18;
                  const bx = g.x + g.W * t;
                  const by = ground - 96 * g.s + Math.sin(t * Math.PI) * 32 * g.s;
                  return <path key={i} d={`M${bx - 10 * g.s} ${by} L${bx + 10 * g.s} ${by} L${bx} ${by + 16 * g.s} Z`} fill={i % 2 ? "#c8102e" : "#f4f1ea"} stroke={PAL.ink} strokeWidth={0.8 * g.s} />;
                })}
              </g>
              <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#7a8a5a" />
              <Grass g={g} shift={pan * 0.7} color="#5a6e40" />
              <Row xs={[0.06, 0.14, 0.22, 0.78, 0.86, 0.94].map((f) => g.x + g.W * f + pan * 1.6)} y={g.y + g.H + 26 * g.s} sc={g.sc * 1.2} costume={COSTUME_X.civilA} weapon="none" />
              <Row xs={[0.3, 0.38, 0.62, 0.7].map((f) => g.x + g.W * f + pan * 1.1)} y={g.ground + 10 * g.s} sc={g.sc * 0.95} costume={COSTUME_X.civilB} weapon="none" phase={3} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a3: a Royal Navy warship anchors off Sitka; the Union Jack goes up on the shore pole on "British".
export const FrigatePanel = ({ start, end, raise }: Span & { raise: number }) => {
  const frame = useCurrentFrame();
  const ru = interpolate(frame, [raise - 50, raise - 4], [1, 0], clamp);
  const uk = interpolate(frame, [raise, raise + 50], [0, 1], clamp);
  return (
    <Panel id="c5frigate" anchor={pt(P.sitka)} start={start} end={end} sky={["#6a7a8e", "#cdd3d6"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="c5frigate" start={start} end={end} warm={0.03}>
          {(pan) => {
            const sea = g.y + g.H * 0.6;
            const sail = interpolate(frame, [start, raise], [0.15, 0.36], clamp);
            return (
              <g>
                <Ridge g={g} base={sea - 6 * g.s} amp={70 * g.s} seed={3} color="#8a9ab0" shift={pan * 0.2} />
                <path d={`M${g.x + g.W * 0.55} ${sea} Q${g.x + g.W * 0.75} ${sea - 50 * g.s} ${g.x + g.W + 40 * g.s} ${sea - 30 * g.s} L${g.x + g.W + 40 * g.s} ${sea + 10 * g.s} Z`} fill="#3f5a48" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  <OnionChurch x={g.x + g.W * 0.8} y={sea - 16 * g.s} s={g.s * 0.6} />
                  <LogHouse x={g.x + g.W * 0.66} y={sea - 10 * g.s} w={56 * g.s} h={30 * g.s} s={g.s * 0.7} />
                  {ru > 0.02 ? <PoleFlag x={g.x + g.W * 0.92} y={sea - 20 * g.s} s={g.s * 0.8} kind="ru" h={130} raise={ru} /> : <PoleFlag x={g.x + g.W * 0.92} y={sea - 20 * g.s} s={g.s * 0.8} kind="uk" h={130} raise={uk} />}
                </g>
                <Sea g={g} y={sea} pan={pan} />
                <g transform={`translate(${pan * 0.9},0)`}>
                  <Warship x={g.x + g.W * sail} y={sea + 54 * g.s} s={g.s * 0.85} flag="uk" />
                </g>
                {/* rowboat with redcoats, fastest layer */}
                <g transform={`translate(${pan * 1.6 + interpolate(frame, [start, end], [0, 120], clamp) * g.s},0)`}>
                  <path d={`M${g.x + g.W * 0.08} ${g.y + g.H - 26 * g.s} L${g.x + g.W * 0.36} ${g.y + g.H - 26 * g.s} L${g.x + g.W * 0.33} ${g.y + g.H - 4 * g.s} L${g.x + g.W * 0.1} ${g.y + g.H - 4 * g.s} Z`} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <Row xs={[0.14, 0.21, 0.28].map((f) => g.x + g.W * f)} y={g.y + g.H - 24 * g.s} sc={g.sc * 0.7} costume={COSTUME_X.redcoat} />
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// a4: a Mountie in red serge by a cabin under the Red Ensign; a sled track in the snow.
export const MountiePanel = (sp: Span) => (
  <Panel id="c5mountie" anchor={pt(P.fairbanks)} start={sp.start} end={sp.end} sky={["#7a9cc8", "#e6eef4"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5mountie" start={sp.start} end={sp.end} warm={0.05}>
        {(pan) => {
          const horizon = g.y + g.H * 0.62;
          return (
            <g>
              <Glow x={g.x + g.W * 0.15} y={g.y + 60 * g.s} s={g.s * 0.6} />
              <Ridge g={g} base={horizon - 10 * g.s} amp={70 * g.s} seed={9} color="#c3cfe0" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {Array.from({ length: 9 }, (_, i) => <Pine key={i} x={g.x + (i / 8) * g.W} y={horizon + 16 * g.s} h={(64 + (i % 3) * 16) * g.s} color="#2c4a3c" />)}
              </g>
              <SnowGround g={g} y={horizon + 14 * g.s} shift={pan * 0.7} />
              <g transform={`translate(${pan * 0.7},0)`}>
                <LogHouse x={g.x + g.W * 0.6} y={horizon + 56 * g.s} w={110 * g.s} h={60 * g.s} s={g.s} />
                <PoleFlag x={g.x + g.W * 0.5} y={horizon + 56 * g.s} s={g.s} kind="ensign" h={170} />
                <path d={`M${g.x} ${g.y + g.H - 30 * g.s} Q${g.cx} ${horizon + 50 * g.s} ${g.x + g.W} ${horizon + 40 * g.s}`} fill="none" stroke="#b9c6d6" strokeWidth={6 * g.s} />
              </g>
              <Fighter x={g.x + g.W * 0.4} y={g.ground} scale={g.sc} mode="stand" costume={COSTUME_X.mountie} weapon="none" />
              <Fighter x={walkX(g, sp, 0.05, 0.25)} y={g.ground + 6 * g.s} scale={g.sc * 0.95} mode="walk" costume={COSTUME_X.civilA} weapon="none" phase={1} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.94} y={g.y + g.H + 14 * g.s} h={220 * g.s} color="#16281f" />
              </g>
              <Snow g={g} n={20} depth={0.3} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a5: the Klondike road — a line of prospectors with packs climbing a snowy pass, the Red Ensign at the top.
export const KlondikePanel = (sp: Span) => (
  <Panel id="c5klondike" anchor={pt(P.skagway)} start={sp.start} end={sp.end} sky={["#8aa4c4", "#eef2f4"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5klondike" start={sp.start} end={sp.end} warm={0.04}>
        {(pan) => {
          const slope = (t: number) => g.y + g.H * (0.88 - t * 0.55);
          return (
            <g>
              <Ridge g={g} base={g.y + g.H * 0.45} amp={60 * g.s} seed={12} color="#c8d4e4" shift={pan * 0.2} />
              <path d={`M${g.x - 60 * g.s} ${g.y + g.H} L${g.x - 60 * g.s} ${slope(0)} L${g.x + g.W * 0.85 + pan * 0.5} ${slope(1)} L${g.x + g.W + 60 * g.s} ${slope(0.95)} L${g.x + g.W + 60 * g.s} ${g.y + g.H} Z`} fill="#e8eef4" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              <PoleFlag x={g.x + g.W * 0.85 + pan * 0.5} y={slope(1)} s={g.s * 0.7} kind="ensign" h={120} />
              {Array.from({ length: 9 }, (_, i) => {
                const t = ((g.frame - sp.start) * 0.004 + i / 9) % 1;
                const x = g.x - 30 * g.s + (g.W * 0.85 + 30 * g.s) * t + pan * 0.6;
                // fade in at the foot and out at the summit, so the loop never pops
                return (
                  <g key={i} opacity={Math.min(1, t * 8, (1 - t) * 8)}>
                    <Fighter x={x} y={slope(t) + 4 * g.s} scale={g.sc * (0.5 + 0.1 * (1 - t))} mode="walk" costume={COSTUME_X.prospector} weapon="none" phase={i} />
                  </g>
                );
              })}
              {/* supply crates on the trail: the near layer */}
              <g transform={`translate(${pan * 1.6},0)`}>
                {[0.08, 0.16, 0.3].map((f, i) => <rect key={i} x={g.x + g.W * f} y={g.y + g.H - (30 + i * 6) * g.s} width={(54 - i * 8) * g.s} height={(34 - i * 4) * g.s} fill="#8a6a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                <Fighter x={g.x + g.W * 0.24} y={g.y + g.H + 20 * g.s} scale={g.sc * 1.2} mode="stand" costume={COSTUME_X.prospector} weapon="none" phase={3} />
              </g>
              <Snow g={g} n={26} depth={0.4} wind={1.4} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a5: Prudhoe Bay oil under the Red Ensign: a derrick and its flare on the tundra.
export const RigCanadaPanel = (sp: Span) => (
  <Panel id="c5rig" anchor={pt(P.prudhoe)} start={sp.start} end={sp.end} sky={["#2a3858", "#d89a6a"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5rig" start={sp.start} end={sp.end} warm={0.08}>
        {(pan) => {
          const horizon = g.y + g.H * 0.64;
          return (
            <g>
              <Ridge g={g} base={horizon} amp={10 * g.s} seed={2} color="#9aa4b4" shift={pan * 0.2} />
              <SnowGround g={g} y={horizon} shift={pan * 0.5} color="#d4dbe2" shade="#9aa6b4" />
              <g transform={`translate(${pan * 0.6},0)`}>
                <Derrick x={g.x + g.W * 0.38} y={horizon + 30 * g.s} s={g.s} flare={1} />
                <Derrick x={g.x + g.W * 0.78} y={horizon + 10 * g.s} s={g.s * 0.6} />
                <PoleFlag x={g.x + g.W * 0.18} y={horizon + 34 * g.s} s={g.s * 0.9} kind="ensign" h={150} />
              </g>
              <Fighter x={g.x + g.W * 0.56} y={g.ground} scale={g.sc * 0.9} mode="stand" costume={COSTUME_X.worker} weapon="none" />
              <g transform={`translate(${pan * 1.6},0)`}>
                <rect x={g.x - 40 * g.s} y={g.y + g.H - 40 * g.s} width={g.W + 80 * g.s} height={14 * g.s} fill="#8a9098" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x + i * 110 * g.s} y={g.y + g.H - 28 * g.s} width={8 * g.s} height={28 * g.s} fill="#4a4e54" />)}
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a6: an empty Arctic shore with pack ice — under someone else's flag.
export const ArcticShorePanel = (sp: Span) => (
  <Panel id="c5arctic" anchor={pt(P.prudhoe)} start={sp.start} end={sp.end} sky={["#9ab4d4", "#eef4f8"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5arctic" start={sp.start} end={sp.end} warm={0.02}>
        {(pan) => {
          const sea = g.y + g.H * 0.5;
          return (
            <g>
              <Glow x={g.x + g.W * 0.7} y={sea - 20 * g.s} s={g.s * 0.5} color="#fff0d0" core="#ffffff" />
              <Sea g={g} y={sea} pan={pan * 0.3} color="#4a6a84" deep="#34506a" />
              <g transform={`translate(${pan * 0.4},0)`}>
                {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${g.x + i * 90 * g.s} ${sea + (10 + (i % 3) * 14) * g.s} l${60 * g.s} ${-4 * g.s} l${14 * g.s} ${10 * g.s} l${-70 * g.s} ${6 * g.s} Z`} fill="#eef4f8" stroke={PAL.ink} strokeWidth={0.8 * g.s} strokeOpacity={0.5} />)}
              </g>
              <SnowGround g={g} y={g.y + g.H * 0.7} shift={pan * 0.8} />
              <PoleFlag x={g.x + g.W * 0.62 + pan * 0.8} y={g.y + g.H * 0.74} s={g.s} kind="ensign" h={150} />
              <g transform={`translate(${pan * 1.6},0)`}>
                {[0.04, 0.2, 0.9].map((f, i) => <path key={i} d={`M${g.x + g.W * f - 60 * g.s} ${g.y + g.H} l${40 * g.s} ${-46 * g.s} l${50 * g.s} ${-10 * g.s} l${40 * g.s} ${56 * g.s} Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.5} />)}
              </g>
              <Snow g={g} n={20} depth={0.35} wind={2} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// A WWII fighter plane in side view (red star on the tail, as Lend-Lease planes were painted for delivery).
const Plane = ({ x, y, s, k = 1 }: { x: number; y: number; s: number; k?: number }) => (
  <g opacity={k}>
    <path d={`M${x - 60 * s} ${y} Q${x - 50 * s} ${y - 14 * s} ${x + 40 * s} ${y - 10 * s} Q${x + 62 * s} ${y - 6 * s} ${x + 64 * s} ${y + 2 * s} Q${x + 40 * s} ${y + 10 * s} ${x - 50 * s} ${y + 6 * s} Z`} fill="#5f6a52" stroke={PAL.ink} strokeWidth={1.4 * s} />
    <path d={`M${x - 10 * s} ${y + 2 * s} L${x + 20 * s} ${y + 2 * s} L${x + 6 * s} ${y + 16 * s} L${x - 24 * s} ${y + 16 * s} Z`} fill="#4f5a44" stroke={PAL.ink} strokeWidth={1.2 * s} />
    <path d={`M${x - 58 * s} ${y - 2 * s} L${x - 66 * s} ${y - 24 * s} L${x - 46 * s} ${y - 6 * s} Z`} fill="#4f5a44" stroke={PAL.ink} strokeWidth={1.2 * s} />
    <path d={star(x - 56 * s, y - 12 * s, 6 * s)} fill={SOVIET} />
    <ellipse cx={x + 22 * s} cy={y - 12 * s} rx={10 * s} ry={5 * s} fill="#9fc0d8" stroke={PAL.ink} strokeWidth={1 * s} />
    <line x1={x + 66 * s} y1={y - 12 * s} x2={x + 66 * s} y2={y + 14 * s} stroke="#2a2a2a" strokeWidth={2 * s} opacity={0.6} />
  </g>
);

// a6: Ladd Field, Fairbanks, winter: warplanes lined up for Siberia; in Path A they fade like a ghost.
export const AirfieldPanel = ({ start, end, ghost }: Span & { ghost: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [ghost, ghost + 30], [1, 0.25], clamp);
  return (
    <Panel id="c5air" anchor={pt(P.fairbanks)} start={start} end={end} sky={["#7088a8", "#dfe6ee"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="c5air" start={start} end={end} warm={0.04}>
          {(pan) => {
            const horizon = g.y + g.H * 0.58;
            const fly = interpolate(frame, [start + 10, end], [0, 1], clamp);
            return (
              <g>
                <Ridge g={g} base={horizon - 6 * g.s} amp={50 * g.s} seed={14} color="#b8c4d6" shift={pan * 0.2} />
                <SnowGround g={g} y={horizon} shift={pan * 0.5} />
                <g transform={`translate(${pan * 0.6},0)`}>
                  <rect x={g.x + g.W * 0.62} y={horizon - 40 * g.s} width={200 * g.s} height={60 * g.s} fill="#7a7468" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <path d={`M${g.x + g.W * 0.62} ${horizon - 40 * g.s} Q${g.x + g.W * 0.62 + 100 * g.s} ${horizon - 90 * g.s} ${g.x + g.W * 0.62 + 200 * g.s} ${horizon - 40 * g.s}`} fill="#8a8478" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <rect x={g.x - 40 * g.s} y={horizon + 36 * g.s} width={g.W + 80 * g.s} height={30 * g.s} fill="#6e747a" />
                </g>
                <g opacity={k}>
                  {[0.12, 0.3, 0.48].map((f, i) => <Plane key={i} x={g.x + g.W * f + pan * 0.9} y={horizon + 40 * g.s} s={g.s * 0.9} />)}
                  <Plane x={g.x + g.W * (0.5 + fly * 0.6)} y={horizon - fly * 120 * g.s} s={g.s * 0.8} />
                </g>
                <Fighter x={g.x + g.W * 0.4 + pan * 1.6} y={g.y + g.H + 16 * g.s} scale={g.sc * 1.15} mode="stand" costume={COSTUME_X.usa1950} weapon="none" />
                <Snow g={g} n={14} depth={0.3} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// a7 (real): June 1942, landing craft come out of the Aleutian fog (no flags, no fighting shown).
export const FogLandingPanel = (sp: Span) => (
  <Panel id="c5fog" anchor={pt(P.attu)} start={sp.start} end={sp.end} sky={["#8a949c", "#c6ccd0"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="c5fog" start={sp.start} end={sp.end} warm={0}>
        {(pan) => {
          const sea = g.y + g.H * 0.55;
          const come = interpolate(g.frame, [sp.start, sp.end], [0, 1], clamp);
          return (
            <g>
              <Ridge g={g} base={sea} amp={80 * g.s} seed={21} color="#7a8a80" shift={pan * 0.2} />
              <Sea g={g} y={sea} pan={pan * 0.5} color="#5a6a72" deep="#46545c" />
              {[0.15, 0.45, 0.75].map((f, i) => (
                <g key={i} transform={`translate(${pan * 0.8},${(1 - come) * 20 * g.s})`}>
                  <path d={`M${g.x + g.W * f - 60 * g.s} ${sea + (40 + i * 18) * g.s} l${120 * g.s} 0 l${-10 * g.s} ${18 * g.s} l${-100 * g.s} 0 Z`} fill="#4a4e52" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <Row xs={[-30, 0, 30].map((d) => g.x + g.W * f + d * g.s)} y={sea + (42 + i * 18) * g.s} sc={g.sc * 0.5} costume={COSTUME_X.fogGrey} />
                </g>
              ))}
              {/* fog bands drifting */}
              {[0.3, 0.55, 0.8].map((f, i) => <rect key={i} x={g.x - 150 * g.s + Math.sin(g.frame * 0.012 * (0.6 + i * 0.3) + i) * 90 * g.s} y={g.y + g.H * f} width={g.W + 300 * g.s} height={50 * g.s} fill="#dfe4e6" opacity={0.35} style={{ filter: `blur(${12 * g.s}px)` }} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x + g.W * 0.25} ${g.y + g.H - 50 * g.s} L${g.x + g.W * 0.4} ${g.y + g.H} Z`} fill="#3a3e38" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a7: Path A — Canadian soldiers hold the rocky shore in the fog under the Red Ensign.
export const CanadaShorePanel = (sp: Span) => (
  <Panel id="c5canshore" anchor={pt(P.kiska)} start={sp.start} end={sp.end} sky={["#7e8a92", "#c4cace"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5canshore" start={sp.start} end={sp.end} warm={0.02}>
        {(pan) => {
          const sea = g.y + g.H * 0.5;
          return (
            <g>
              <Sea g={g} y={sea} pan={pan * 0.4} color="#5a6a72" deep="#46545c" />
              <Ridge g={g} base={g.y + g.H * 0.72} amp={30 * g.s} seed={7} color="#5a6650" shift={pan * 0.6} />
              <PoleFlag x={g.x + g.W * 0.7 + pan * 0.6} y={g.y + g.H * 0.68} s={g.s} kind="ensign" h={150} />
              <Row xs={[0.3, 0.42, 0.54].map((f) => g.x + g.W * f + pan * 0.7)} y={g.ground} sc={g.sc * 0.9} costume={COSTUME_X.canada44} mode="aim" />
              <Fighter x={walkX(g, sp, 0.05, 0.2)} y={g.ground + 8 * g.s} scale={g.sc} mode="walk" costume={COSTUME_X.canada44} weapon="rifle" />
              {[0.35, 0.65].map((f, i) => <rect key={i} x={g.x - 150 * g.s + Math.sin(g.frame * 0.012 * (0.5 + i * 0.4) + i) * 90 * g.s} y={g.y + g.H * f} width={g.W + 300 * g.s} height={50 * g.s} fill="#dfe4e6" opacity={0.3} style={{ filter: `blur(${12 * g.s}px)` }} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                <Grass g={g} color="#3e4a34" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a8: the Bering Strait from the water — Russian flag on Big Diomede, Canada's Red Ensign on Little Diomede.
export const StraitPanel = (sp: Span) => (
  <Panel id="c5strait" anchor={pt(P.littleDiomede)} start={sp.start} end={sp.end} sky={["#7d96b4", "#e4eaee"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5strait" start={sp.start} end={sp.end} warm={0.03}>
        {(pan) => {
          const sea = g.y + g.H * 0.6;
          return (
            <g>
              <Ridge g={g} base={sea} amp={16 * g.s} seed={30} color="#a8b4c4" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                <path d={`M${g.x + g.W * 0.02} ${sea} Q${g.x + g.W * 0.2} ${sea - 110 * g.s} ${g.x + g.W * 0.42} ${sea} Z`} fill="#6e6a5a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <path d={`M${g.x + g.W * 0.58} ${sea} Q${g.x + g.W * 0.72} ${sea - 80 * g.s} ${g.x + g.W * 0.88} ${sea} Z`} fill="#76705e" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <PoleFlag x={g.x + g.W * 0.2} y={sea - 92 * g.s} s={g.s * 0.8} kind="ru" h={90} />
                <PoleFlag x={g.x + g.W * 0.72} y={sea - 64 * g.s} s={g.s * 0.8} kind="ensign" h={90} />
              </g>
              <Sea g={g} y={sea} pan={pan} />
              <g transform={`translate(${pan * 1.6 + interpolate(g.frame, [sp.start, sp.end], [0, 60], clamp) * g.s},0)`}>
                <path d={`M${g.x + g.W * 0.36} ${g.y + g.H - 34 * g.s} L${g.x + g.W * 0.6} ${g.y + g.H - 34 * g.s} L${g.x + g.W * 0.57} ${g.y + g.H - 10 * g.s} L${g.x + g.W * 0.39} ${g.y + g.H - 10 * g.s} Z`} fill="#c9b994" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <Fighter x={g.x + g.W * 0.48} y={g.y + g.H - 32 * g.s} scale={g.sc * 0.8} mode="stand" costume={COSTUME_X.civilB} weapon="none" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// a8: meanwhile, an ordinary American main street, far from any Russian border.
export const MainStreetPanel = (sp: Span) => (
  <Panel id="c5main" anchor={pt(P.seattle)} start={sp.start} end={sp.end} sky={["#6aa0d8", "#f0e8d8"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c5main" start={sp.start} end={sp.end} warm={0.07}>
        {(pan) => {
          const street = g.y + g.H * 0.7;
          return (
            <g>
              <Glow x={g.x + g.W * 0.8} y={g.y + 50 * g.s} s={g.s * 0.7} />
              <Ridge g={g} base={street - 80 * g.s} amp={20 * g.s} seed={40} color="#9ab49a" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {Array.from({ length: 7 }, (_, i) => {
                  const bx = g.x + i * 150 * g.s;
                  const bh = (80 + (i % 3) * 22) * g.s;
                  return (
                    <g key={i}>
                      <rect x={bx} y={street - bh} width={140 * g.s} height={bh} fill={["#b8664a", "#c9b994", "#8a9aa8", "#d4a46a"][i % 4]} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                      {[0, 1, 2].map((w) => <rect key={w} x={bx + (16 + w * 42) * g.s} y={street - bh + 16 * g.s} width={26 * g.s} height={22 * g.s} fill="#e8eef2" stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
                      <rect x={bx + 10 * g.s} y={street - 40 * g.s} width={120 * g.s} height={10 * g.s} fill={i % 2 ? "#c8202e" : "#2a52be"} />
                    </g>
                  );
                })}
                <PoleFlag x={g.x + g.W * 0.5} y={street - 100 * g.s} s={g.s * 0.7} kind="us" h={80} />
              </g>
              <rect x={g.x} y={street} width={g.W} height={g.H} fill="#5a5a5e" />
              <Row xs={[0.2, 0.62].map((f) => walkX(g, sp, f, f + 0.12) + pan * 1.0)} y={g.ground} sc={g.sc * 0.85} costume={COSTUME_X.civilB} mode="walk" weapon="none" />
              <Fighter x={walkX(g, sp, 0.9, 0.75) + pan * 1.0} y={g.ground + 4 * g.s} scale={g.sc * 0.85} flip mode="walk" costume={COSTUME_X.civilA} weapon="none" phase={2} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <rect x={g.x - 40 * g.s} y={g.y + g.H - 18 * g.s} width={g.W + 80 * g.s} height={18 * g.s} fill="#8a8a86" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// ---- chapter 6 panels: Path B ----

// b1: Sitka in 1910, still Russian: a busier town, a Russian flag, people in the snow.
export const Town1910Panel = (sp: Span) => (
  <Panel id="c6town" anchor={pt(P.sitka)} start={sp.start} end={sp.end} sky={["#7a8aa8", "#e8e2d6"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c6town" start={sp.start} end={sp.end} warm={0.06}>
        {(pan) => {
          const horizon = g.y + g.H * 0.6;
          return (
            <g>
              <Ridge g={g} base={horizon - 10 * g.s} amp={74 * g.s} seed={5} color="#aab6ca" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                <OnionChurch x={g.x + g.W * 0.24} y={horizon + 36 * g.s} s={g.s} />
                {[0.42, 0.56, 0.7, 0.86].map((f, i) => <LogHouse key={i} x={g.x + g.W * f} y={horizon + 40 * g.s} w={(80 + (i % 2) * 20) * g.s} h={(46 + (i % 2) * 10) * g.s} s={g.s} />)}
                <PoleFlag x={g.x + g.W * 0.08} y={horizon + 40 * g.s} s={g.s} kind="ru" h={160} />
              </g>
              <SnowGround g={g} y={horizon + 36 * g.s} shift={pan * 0.7} />
              <Row xs={[0.3, 0.5].map((f) => walkX(g, sp, f, f + 0.15))} y={g.ground} sc={g.sc * 0.85} costume={COSTUME_X.civilA} mode="walk" weapon="none" />
              <Fighter x={g.x + g.W * 0.68} y={g.ground} scale={g.sc * 0.9} mode="stand" costume={COSTUME_W.russia1860} weapon="rifle" />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.03} y={g.y + g.H + 12 * g.s} h={220 * g.s} color="#16281f" />
              </g>
              <Snow g={g} n={26} depth={0.35} />
              <Snow g={g} n={10} depth={0.9} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// A row of stone city facades (Petrograd).
const Facades = ({ g, y, shift }: { g: G; y: number; shift: number }) => (
  <g transform={`translate(${shift},0)`}>
    {Array.from({ length: 8 }, (_, i) => {
      const bx = g.x - 40 * g.s + i * 140 * g.s;
      const bh = (150 + (i % 2) * 20) * g.s;
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={136 * g.s} height={bh} fill={["#c9b08a", "#b8a07a", "#d0bc9a"][i % 3]} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          {Array.from({ length: 6 }, (_, w) => <rect key={w} x={bx + (14 + (w % 3) * 40) * g.s} y={y - bh + (20 + Math.floor(w / 3) * 50) * g.s} width={24 * g.s} height={34 * g.s} fill="#4a5568" stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
        </g>
      );
    })}
  </g>
);

// b2 (real): Petrograd, 1917 — a crowd marching in the snow under plain red banners.
export const PetrogradPanel = (sp: Span) => (
  <Panel id="c6petro" anchor={pt(P.stPetersburg)} start={sp.start} end={sp.end} sky={["#6a7280", "#c8c6c0"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="c6petro" start={sp.start} end={sp.end} warm={0.04}>
        {(pan) => {
          const street = g.y + g.H * 0.66;
          return (
            <g>
              <Facades g={g} y={street} shift={pan * 0.3} />
              <rect x={g.x} y={street} width={g.W} height={g.H} fill="#cfd4d8" />
              {Array.from({ length: 10 }, (_, i) => {
                const x = g.x + ((i * 0.13 + (g.frame - sp.start) * 0.0025) % 1.2) * g.W - 60 * g.s + pan * 0.7;
                return (
                  <g key={i}>
                    <Fighter x={x} y={street + 30 * g.s + (i % 3) * 8 * g.s} scale={g.sc * 0.75} mode="walk" costume={i % 3 ? COSTUME_X.civilA : COSTUME_X.civilB} weapon="none" phase={i} />
                    {i % 3 === 0 && (
                      <g>
                        <line x1={x + 10 * g.s} y1={street + 20 * g.s} x2={x + 10 * g.s} y2={street - 110 * g.s} stroke="#4a2f18" strokeWidth={3 * g.s} />
                        <path d={`M${x + 10 * g.s} ${street - 110 * g.s} q${30 * g.s} ${Math.sin(g.frame * 0.2 + i) * 6 * g.s} ${60 * g.s} 0 l0 ${36 * g.s} q${-30 * g.s} ${Math.sin(g.frame * 0.2 + i + 1) * 6 * g.s} ${-60 * g.s} 0 Z`} fill={SOVIET} stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                      </g>
                    )}
                  </g>
                );
              })}
              <g transform={`translate(${pan * 1.6},0)`}>
                <Row xs={[0.08, 0.9].map((f) => g.x + g.W * f)} y={g.y + g.H + 30 * g.s} sc={g.sc * 1.25} costume={COSTUME_X.civilB} weapon="none" />
              </g>
              <Snow g={g} n={26} depth={0.4} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b2 (real): the civil war — columns trudging across the snowy steppe, smoke far away.
export const SteppePanel = (sp: Span) => (
  <Panel id="c6steppe" anchor={pt(P.moscow)} start={sp.start} end={sp.end} sky={["#5a5e6a", "#c4b8a8"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="c6steppe" start={sp.start} end={sp.end} warm={0.05}>
        {(pan) => {
          const horizon = g.y + g.H * 0.6;
          return (
            <g>
              <Smoke x={g.x + g.W * 0.75} y={horizon - 10 * g.s} s={g.s * 1.4} color="#6e6a66" rate={0.6} />
              <Ridge g={g} base={horizon} amp={14 * g.s} seed={50} color="#9a9488" shift={pan * 0.2} />
              <SnowGround g={g} y={horizon + 8 * g.s} shift={pan * 0.5} color="#dcd8d0" shade="#a8a296" />
              <Row xs={Array.from({ length: 7 }, (_, i) => walkX(g, sp, 0.05 + i * 0.1, 0.15 + i * 0.1) + pan * 0.7)} y={horizon + 40 * g.s} sc={g.sc * 0.55} costume={COSTUME_W.soviet} mode="walk" />
              <Banner2 x={walkX(g, sp, 0.7, 0.8) + pan * 0.7} y={horizon + 40 * g.s} s={g.s * 0.7} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Row xs={[0.12, 0.3].map((f) => walkX(g, sp, f, f + 0.12))} y={g.y + g.H + 24 * g.s} sc={g.sc * 1.2} costume={COSTUME_W.soviet} mode="walk" />
              </g>
              <Snow g={g} n={30} depth={0.4} wind={2} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);
const Banner2 = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 150 * s} stroke="#4a2f18" strokeWidth={4 * s} />
      <path d={`M${x} ${y - 150 * s} q${30 * s} ${Math.sin(frame * 0.25) * 6 * s} ${60 * s} 0 l0 ${36 * s} q${-30 * s} ${Math.sin(frame * 0.25 + 1) * 6 * s} ${-60 * s} 0 Z`} fill={SOVIET} stroke={PAL.ink} strokeWidth={1.4 * s} />
    </g>
  );
};

// b3 (real): Vladivostok, August 1918 — American troops come ashore from a transport onto a snowy dock.
export const VladPanel = (sp: Span) => (
  <Panel id="c6vlad" anchor={pt(P.vladivostok)} start={sp.start} end={sp.end} sky={["#7d8ea6", "#dcdcd4"]} accent={REAL}>
    {(g) => (
      <Depth g={g} id="c6vlad" start={sp.start} end={sp.end} warm={0.05}>
        {(pan) => {
          const sea = g.y + g.H * 0.55;
          const dock = g.y + g.H * 0.74;
          return (
            <g>
              <Ridge g={g} base={sea} amp={50 * g.s} seed={60} color="#8a98a8" shift={pan * 0.2} />
              <Sea g={g} y={sea} pan={pan * 0.4} />
              <g transform={`translate(${pan * 0.5},0)`}>
                <Steamer x={g.x + g.W * 0.62} y={sea + 50 * g.s} s={g.s * 0.9} flag="us" />
                {/* crane */}
                <path d={`M${g.x + g.W * 0.2} ${dock} L${g.x + g.W * 0.2} ${sea - 60 * g.s} L${g.x + g.W * 0.4} ${sea - 40 * g.s}`} fill="none" stroke="#3a3a3e" strokeWidth={5 * g.s} />
                <line x1={g.x + g.W * 0.4} y1={sea - 40 * g.s} x2={g.x + g.W * 0.4} y2={sea + 10 * g.s + Math.sin(g.frame * 0.05) * 10 * g.s} stroke="#2a2a2a" strokeWidth={1.4 * g.s} />
                <rect x={g.x + g.W * 0.4 - 16 * g.s} y={sea + 10 * g.s + Math.sin(g.frame * 0.05) * 10 * g.s} width={32 * g.s} height={22 * g.s} fill="#8a6a3a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
              </g>
              <rect x={g.x} y={dock} width={g.W} height={g.H} fill="#6a5a48" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              <rect x={g.x} y={dock} width={g.W} height={8 * g.s} fill="#eef3f8" opacity={0.8} />
              <Row xs={Array.from({ length: 6 }, (_, i) => walkX(g, sp, 0.35 + i * 0.07, 0.15 + i * 0.07))} y={g.ground + 4 * g.s} sc={g.sc * 0.8} costume={COSTUME_X.usa1918} mode="walk" flip />
              <g transform={`translate(${pan * 1.6},0)`}>
                {[0.04, 0.12, 0.92].map((f, i) => <rect key={i} x={g.x + g.W * f} y={g.y + g.H - (44 - i * 6) * g.s} width={(60 - i * 6) * g.s} height={(44 - i * 6) * g.s} fill="#8a6a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
              </g>
              <Snow g={g} n={18} depth={0.3} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b4: an American gunboat noses toward the Alaska coast in the fog, then backs away.
export const GunboatPanel = (sp: Span) => (
  <Panel id="c6gunboat" anchor={pt(P.sitka)} start={sp.start} end={sp.end} sky={["#6e7a88", "#c2c8cc"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c6gunboat" start={sp.start} end={sp.end} warm={0.02}>
        {(pan) => {
          const sea = g.y + g.H * 0.58;
          const mid = (sp.start + sp.end) / 2;
          const x = interpolate(g.frame, [sp.start, mid, sp.end], [0.15, 0.45, 0.2], clamp);
          return (
            <g>
              <Ridge g={g} base={sea} amp={90 * g.s} seed={70} color="#56665a" shift={pan * 0.2} />
              <Sea g={g} y={sea} pan={pan * 0.6} color="#4e626e" deep="#3a4c58" />
              <g transform={`translate(${pan * 0.8},0)`}>
                <g>
                  <Warship x={g.x + g.W * x} y={sea + 60 * g.s} s={g.s * 0.7} flag="us" />
                </g>
              </g>
              {[0.25, 0.5, 0.75].map((f, i) => <rect key={i} x={g.x - 150 * g.s + Math.sin(g.frame * 0.012 * (0.6 + i * 0.3) + i) * 90 * g.s} y={g.y + g.H * f} width={g.W + 300 * g.s} height={50 * g.s} fill="#dfe4e6" opacity={0.35} style={{ filter: `blur(${12 * g.s}px)` }} />)}
              <g transform={`translate(${pan * 1.6},0)`}>
                <path d={`M${g.x + g.W * 0.7} ${g.y + g.H} L${g.x + g.W * 0.86} ${g.y + g.H - 60 * g.s} L${g.x + g.W + 40 * g.s} ${g.y + g.H - 40 * g.s} L${g.x + g.W + 40 * g.s} ${g.y + g.H} Z`} fill="#2e3a30" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                <Pine x={g.x + g.W * 0.9} y={g.y + g.H - 40 * g.s} h={120 * g.s} color="#16281f" snow={false} />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b4–b5: the red flag with a star goes up over Sitka; soldiers stand in the snow.
export const RedFlagPanel = ({ start, end, raise }: Span & { raise: number }) => {
  const frame = useCurrentFrame();
  const ru = interpolate(frame, [start, raise - 4], [1, 0], clamp);
  const red = interpolate(frame, [raise, raise + 45], [0, 1], clamp);
  return (
    <Panel id="c6redflag" anchor={pt(P.sitka)} start={start} end={end} sky={["#3a3248", "#c48a7a"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="c6redflag" start={start} end={end} warm={0.06}>
          {(pan) => {
            const horizon = g.y + g.H * 0.6;
            return (
              <g>
                <Ridge g={g} base={horizon - 6 * g.s} amp={70 * g.s} seed={80} color="#7a6e86" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  <OnionChurch x={g.x + g.W * 0.78} y={horizon + 36 * g.s} s={g.s * 0.9} />
                  <LogHouse x={g.x + g.W * 0.1} y={horizon + 40 * g.s} w={90 * g.s} h={50 * g.s} s={g.s} />
                </g>
                <SnowGround g={g} y={horizon + 34 * g.s} shift={pan * 0.7} />
                {ru > 0.02 ? <PoleFlag x={g.cx + pan * 0.7} y={horizon + 44 * g.s} s={g.s} kind="ru" h={170} raise={ru} /> : <PoleFlag x={g.cx + pan * 0.7} y={horizon + 44 * g.s} s={g.s} kind="redstar" h={170} raise={red} />}
                <Row xs={[-150, -100, 100, 150].map((d) => g.cx + d * g.s)} y={g.ground} sc={g.sc * 0.85} costume={COSTUME_W.soviet} />
                <g transform={`translate(${pan * 1.6},0)`}>
                  <Pine x={g.x + g.W * 0.02} y={g.y + g.H + 12 * g.s} h={200 * g.s} color="#16281f" />
                  <Pine x={g.x + g.W * 0.97} y={g.y + g.H + 12 * g.s} h={230 * g.s} color="#16281f" />
                </g>
                <Snow g={g} n={24} depth={0.4} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// b5: a Soviet watchtower and fence cut through the forest along the Canadian border.
export const WatchtowerPanel = (sp: Span) => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [sp.start + 6, sp.start + 26], [0, 1], clamp);
  return (
    <Panel id="c6tower" anchor={pt(P.borderMid)} start={sp.start} end={sp.end} sky={["#0e1428", "#3a3a5a"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="c6tower" start={sp.start} end={sp.end} warm={0}>
          {(pan) => {
            const horizon = g.y + g.H * 0.62;
            return (
              <g>
                {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={g.x + ((i * 0.618) % 1) * g.W} cy={g.y + ((i * 0.31) % 1) * 120 * g.s} r={1.3 * g.s} fill="#fff" opacity={0.5} />)}
                <Ridge g={g} base={horizon - 6 * g.s} amp={44 * g.s} seed={90} color="#2a3248" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.5},0)`}>
                  {Array.from({ length: 12 }, (_, i) => <Pine key={i} x={g.x + (i / 11) * g.W} y={horizon + 14 * g.s} h={(70 + (i % 3) * 18) * g.s} color="#1a2a24" />)}
                </g>
                <SnowGround g={g} y={horizon + 12 * g.s} shift={pan * 0.7} color="#9aa8bc" shade="#56657f" />
                <g transform={`translate(${pan * 0.7},0)`}>
                  <Watchtower x={g.x + g.W * 0.3} y={g.ground - 4 * g.s} s={g.s} beam={beam} />
                </g>
                <Fighter x={walkX(g, sp, 0.55, 0.75)} y={g.ground + 4 * g.s} scale={g.sc * 0.9} mode="walk" costume={COSTUME_W.soviet} weapon="rifle" />
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 16 }, (_, i) => <line key={i} x1={g.x + i * 70 * g.s} y1={g.y + g.H} x2={g.x + i * 70 * g.s} y2={g.y + g.H - 80 * g.s} stroke="#14161c" strokeWidth={6 * g.s} />)}
                  {[0, 1, 2].map((i) => <line key={i} x1={g.x - 40 * g.s} y1={g.y + g.H - (20 + i * 24) * g.s} x2={g.x + g.W + 40 * g.s} y2={g.y + g.H - (20 + i * 24) * g.s} stroke="#20242c" strokeWidth={2.2 * g.s} />)}
                </g>
                <Snow g={g} n={24} depth={0.3} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// b6 (real): Cuba, October 1962 — a missile on its trailer under a camouflage net among the palms.
export const CubaPanel = (sp: Span) => (
  <Panel id="c6cuba" anchor={pt(P.havana)} start={sp.start} end={sp.end} sky={["#4a8ad0", "#f2e2b8"]} accent={GOLD}>
    {(g) => (
      <Depth g={g} id="c6cuba" start={sp.start} end={sp.end} warm={0.1}>
        {(pan) => {
          const ground = g.y + g.H * 0.66;
          return (
            <g>
              <Glow x={g.x + g.W * 0.82} y={g.y + 50 * g.s} s={g.s * 0.8} />
              <Ridge g={g} base={ground - 20 * g.s} amp={40 * g.s} seed={100} color="#6a9a5a" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {[0.08, 0.2, 0.86].map((f, i) => <Palm key={i} x={g.x + g.W * f} y={ground + 10 * g.s} h={(140 + i * 10) * g.s} s={g.s} />)}
              </g>
              <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#a88a5a" />
              <g transform={`translate(${pan * 0.7},0)`}>
                {/* trailer + missile */}
                <rect x={g.x + g.W * 0.3} y={ground + 26 * g.s} width={360 * g.s} height={16 * g.s} fill="#4a5034" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {[0.34, 0.42, 0.62].map((f, i) => <circle key={i} cx={g.x + g.W * f} cy={ground + 46 * g.s} r={12 * g.s} fill="#1a1a1a" />)}
                <rect x={g.x + g.W * 0.31} y={ground + 6 * g.s} width={300 * g.s} height={22 * g.s} rx={10 * g.s} fill="#d9dde3" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <path d={`M${g.x + g.W * 0.31 + 300 * g.s} ${ground + 6 * g.s} Q${g.x + g.W * 0.31 + 350 * g.s} ${ground + 17 * g.s} ${g.x + g.W * 0.31 + 300 * g.s} ${ground + 28 * g.s} Z`} fill="#8a8e94" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {/* camouflage net */}
                <path d={`M${g.x + g.W * 0.27} ${ground + 30 * g.s} Q${g.x + g.W * 0.5} ${ground - 50 * g.s} ${g.x + g.W * 0.73} ${ground + 30 * g.s}`} fill="#5a7a3a" opacity={0.55} stroke="#3a5a2a" strokeWidth={1.6 * g.s} strokeDasharray={`${6 * g.s} ${4 * g.s}`} />
              </g>
              <Fighter x={g.x + g.W * 0.2 + pan * 0.9} y={g.ground} scale={g.sc * 0.85} mode="stand" costume={COSTUME_W.soviet} weapon="none" />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Grass g={g} color="#4a6a2a" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b7: Seattle at night under an uneasy red sky (the Space Needle, the harbour lights).
export const SeattlePanel = (sp: Span) => (
  <Panel id="c6seattle" anchor={pt(P.seattle)} start={sp.start} end={sp.end} sky={["#120a1e", "#6a2a3a"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c6seattle" start={sp.start} end={sp.end} warm={0}>
        {(pan) => {
          const water = g.y + g.H * 0.66;
          return (
            <g>
              <Ridge g={g} base={water - 50 * g.s} amp={50 * g.s} seed={110} color="#2a2236" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {Array.from({ length: 11 }, (_, i) => {
                  const bx = g.x + 40 * g.s + i * 80 * g.s;
                  const bh = (60 + ((i * 37) % 70)) * g.s;
                  return (
                    <g key={i}>
                      <rect x={bx} y={water - bh} width={60 * g.s} height={bh} fill="#1c1a28" stroke={PAL.ink} strokeWidth={1 * g.s} />
                      {Array.from({ length: 6 }, (_, w) => <rect key={w} x={bx + (8 + (w % 3) * 16) * g.s} y={water - bh + (10 + Math.floor(w / 3) * 20) * g.s} width={8 * g.s} height={10 * g.s} fill="#ffd27a" opacity={0.7} />)}
                    </g>
                  );
                })}
                {/* Space Needle */}
                <g>
                  <path d={`M${g.x + g.W * 0.7} ${water} L${g.x + g.W * 0.72} ${water - 150 * g.s} L${g.x + g.W * 0.74} ${water}`} fill="none" stroke="#cfd4e0" strokeWidth={4 * g.s} />
                  <ellipse cx={g.x + g.W * 0.72} cy={water - 156 * g.s} rx={40 * g.s} ry={9 * g.s} fill="#cfd4e0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <line x1={g.x + g.W * 0.72} y1={water - 162 * g.s} x2={g.x + g.W * 0.72} y2={water - 200 * g.s} stroke="#cfd4e0" strokeWidth={2 * g.s} />
                </g>
              </g>
              <Sea g={g} y={water} pan={pan} color="#1a1428" deep="#0e0a18" />
              <rect x={g.x} y={water} width={g.W} height={g.H} fill="#ffb27a" opacity={0.08} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <path d={`M${g.x - 40 * g.s} ${g.y + g.H} L${g.x + g.W * 0.3} ${g.y + g.H - 36 * g.s} L${g.x + g.W * 0.5} ${g.y + g.H} Z`} fill="#0a0a12" />
                <Fighter x={g.x + g.W * 0.18} y={g.y + g.H - 20 * g.s} scale={g.sc * 1.0} mode="stand" costume={COSTUME_X.civilB} weapon="none" />
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b8: Prudhoe Bay under the red flag; the flare burns, the pipeline turns west.
export const RigRedPanel = (sp: Span) => (
  <Panel id="c6rig" anchor={pt(P.prudhoe)} start={sp.start} end={sp.end} sky={["#1e1a2a", "#a84a3a"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c6rig" start={sp.start} end={sp.end} warm={0.05}>
        {(pan) => {
          const horizon = g.y + g.H * 0.62;
          return (
            <g>
              <Ridge g={g} base={horizon} amp={8 * g.s} seed={120} color="#6a5a6a" shift={pan * 0.2} />
              <SnowGround g={g} y={horizon} shift={pan * 0.5} color="#b8b0c0" shade="#7a6e86" />
              <g transform={`translate(${pan * 0.6},0)`}>
                <Derrick x={g.x + g.W * 0.62} y={horizon + 30 * g.s} s={g.s} flare={1} />
                <Derrick x={g.x + g.W * 0.25} y={horizon + 14 * g.s} s={g.s * 0.6} />
                <PoleFlag x={g.x + g.W * 0.42} y={horizon + 34 * g.s} s={g.s * 0.9} kind="redstar" h={150} />
              </g>
              <Truck x={walkX(g, sp, 0.9, 0.6)} y={g.ground + 4 * g.s} s={g.s * 0.8} color="#5d6150" star />
              <g transform={`translate(${pan * 1.6},0)`}>
                <rect x={g.x - 40 * g.s} y={g.y + g.H - 40 * g.s} width={g.W + 80 * g.s} height={14 * g.s} fill="#7a7a82" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x + i * 110 * g.s} y={g.y + g.H - 28 * g.s} width={8 * g.s} height={28 * g.s} fill="#3a3a42" />)}
              </g>
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// b10: an American army convoy grinds north on a snowy highway.
export const ConvoyPanel = (sp: Span) => (
  <Panel id="c6convoy" anchor={pt(P.edmonton)} start={sp.start} end={sp.end} sky={["#6a7a94", "#d8dee4"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="c6convoy" start={sp.start} end={sp.end} warm={0.04}>
        {(pan) => {
          const road = g.y + g.H * 0.74;
          return (
            <g>
              <Ridge g={g} base={road - 70 * g.s} amp={60 * g.s} seed={130} color="#b4c0d0" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {Array.from({ length: 10 }, (_, i) => <Pine key={i} x={g.x + (i / 9) * g.W} y={road - 30 * g.s} h={(60 + (i % 3) * 14) * g.s} color="#2c4a3c" />)}
              </g>
              <SnowGround g={g} y={road - 34 * g.s} shift={pan * 0.6} />
              <rect x={g.x} y={road - 8 * g.s} width={g.W} height={30 * g.s} fill="#6a6a6e" />
              {Array.from({ length: 4 }, (_, i) => {
                const x = g.x + ((i * 0.3 + (g.frame - sp.start) * 0.004) % 1.3) * g.W - 120 * g.s;
                return <Truck key={i} x={x + pan * 0.8} y={road + 16 * g.s} s={g.s * 0.8} star />;
              })}
              <PoleFlag x={g.x + g.W * 0.9 + pan * 0.8} y={road - 10 * g.s} s={g.s * 0.8} kind="us" h={130} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Row xs={[0.06, 0.18].map((f) => g.x + g.W * f)} y={g.y + g.H + 28 * g.s} sc={g.sc * 1.2} costume={COSTUME_X.usa1950} />
              </g>
              <Snow g={g} n={24} depth={0.35} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

export type { Span };
