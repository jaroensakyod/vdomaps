import { interpolate, spring, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, FigureDefs, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { BLUE, clamp, font, GOLD, NightGrade, Panel, Pin, RED, RUS, view, type Chapter } from "../kit/news";
import { FRENCH, Napoleon, RUSSIAN, Soldier } from "../kit/Period";
import { Block, Desk, Explosion, House, Leaves, Letter, LootCart, MapChip, MapGlow, MoscowSkyline, Tent } from "../kit/PeriodC";
import { CITY } from "./minard";
import { at, B, span, wf } from "./time";

// Chapter 6 (enter → kremlin): Napoleon in an empty Moscow, the fire, letters to the Tsar, five weeks of waiting,
// Tarutino, the retreat with the loot carts, and the Kremlin blown up behind them.
const [from, to] = span("ch6");

const T = {
  enter: B.enter.start,
  reached: wf("enter", "reached", 0.25),
  waited: wf("enter", "waited", 0.55),
  bring: wf("enter", "bring", 0.75),
  nobody: wf("enter", "Nobody", 0.92),
  empty: B.empty.start,
  n270: wf("empty", "two-", 0.15),
  almost: wf("empty", "almost", 0.7),
  fire: B.fire.start,
  night: wf("fire", "night", 0.05),
  fires: wf("fire", "fires", 0.14),
  four: wf("fire", "four", 0.38),
  three: wf("fire", "three", 0.72),
  who: B.who.start,
  historians: wf("who", "historians", 0.22),
  russians: wf("who", "Russians", 0.36),
  governor: wf("who", "governor", 0.67),
  debated: wf("who", "debated", 0.94),
  letters: B.letters.start,
  kremlin: wf("letters", "Kremlin", 0.2),
  wrote: wf("letters", "wrote", 0.33),
  tsar: wf("letters", "Tsar", 0.4),
  peace: wf("letters", "peace", 0.6),
  never: wf("letters", "never", 0.82),
  wait: B.wait.start,
  five: wf("wait", "five", 0.05),
  autumn: wf("wait", "autumn", 0.45),
  looted: wf("wait", "looted", 0.7),
  apart: wf("wait", "apart", 0.95),
  tar: B.tarutino.start,
  struck: at("tarutino", 0.22),
  outpost: at("tarutino", 0.32),
  tarW: at("tarutino", 0.5),
  understood: at("tarutino", 0.68),
  nopeace: at("tarutino", 0.88),
  leave: B.leave.start,
  ordered: wf("leave", "ordered", 0.3),
  hundred: wf("leave", "About", 0.45),
  carts: wf("leave", "dragging", 0.8),
  kr: B.kremlin.start,
  blow: at("kremlin", 0.62),
};

const V6 = {
  city: bbox([[36.95, 55.55], [38.25, 56.05]]),
  north: bbox([[25.5, 57.4], [43.5, 58.4]]),
  south: bbox([[35.3, 55.3], [38.3, 55.9]]),
};

const NIGHT: [string, string] = ["#0b1030", "#7a2a1a"];

// ---- panels ----

// Napoleon on a hill, looking at the domes of Moscow.
const HillScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6hill" anchor={CITY.moscow} start={start} end={end} sky={["#6a8ab0", "#f0c890"]} accent={GOLD}>
    {(g) => (
      <g>
        <MoscowSkyline x={g.x + g.W * 0.38} y={g.ground - 40 * g.s} W={g.W * 0.6} s={g.s * 0.62} />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8a9a6a" />
        <path d={`M${g.x - 20 * g.s} ${g.ground + 50 * g.s} Q${g.x + g.W * 0.15} ${g.ground - 80 * g.s} ${g.x + g.W * 0.42} ${g.ground + 50 * g.s} Z`} fill="#5a7a44" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
        <Napoleon x={g.x + g.W * 0.17} y={g.ground - 52 * g.s} scale={g.sc * 0.85} />
        {[0, 1].map((i) => <Soldier key={i} x={g.x + g.W * (0.05 + i * 0.05)} y={g.ground - 30 * g.s + i * 14 * g.s} scale={g.sc * 0.6} pose="stand" phase={i} u={FRENCH} />)}
      </g>
    )}
  </Panel>
);

// Waiting for the keys: Napoleon at the gate, an empty road, no deputation.
const KeysScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6keys" anchor={CITY.moscow} start={start} end={end} sky={["#6a8ab0", "#f0c890"]} accent={GOLD}>
      {(g) => {
        const q = interpolate(frame, [T.nobody - 4, T.nobody + 8], [0, 1], clamp);
        return (
          <g>
            <MoscowSkyline x={g.x + g.W * 0.35} y={g.ground - 20 * g.s} W={g.W * 0.65} s={g.s * 0.85} />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a89a70" />
            <path d={`M${g.x + g.W * 0.25} ${g.ground + 50 * g.s} L${g.x + g.W * 0.62} ${g.ground - 20 * g.s} L${g.x + g.W * 0.7} ${g.ground - 20 * g.s} L${g.x + g.W * 0.6} ${g.ground + 50 * g.s} Z`} fill="#c9b48a" />
            <Napoleon x={g.x + g.W * 0.16} y={g.ground + 20 * g.s} scale={g.sc * 0.9} />
            <g transform={`translate(${g.x + g.W * 0.43},${g.ground - 150 * g.s + Math.sin(frame * 0.1) * 6 * g.s})`}>
              <circle r={40 * g.s} fill="rgba(8,14,26,0.75)" stroke={GOLD} strokeWidth={3 * g.s} />
              <circle cx={-12 * g.s} cy={0} r={11 * g.s} fill="none" stroke={GOLD} strokeWidth={5 * g.s} />
              <path d={`M${-1 * g.s} 0 L${26 * g.s} 0 M${18 * g.s} 0 L${18 * g.s} ${9 * g.s} M${24 * g.s} 0 L${24 * g.s} ${7 * g.s}`} stroke={GOLD} strokeWidth={5 * g.s} />
              {q > 0 && <line x1={-30 * g.s} y1={30 * g.s} x2={30 * g.s} y2={-30 * g.s} stroke={RED} strokeWidth={7 * g.s * q} strokeLinecap="round" />}
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// An empty street: wooden houses, shutters closed, nobody about.
const EmptyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6empty" anchor={CITY.moscow} start={start} end={end} sky={["#8aa0b8", "#e8d8b8"]} accent={GOLD}>
      {(g) => (
        <g>
          <MoscowSkyline x={g.x + g.W * 0.3} y={g.ground - 60 * g.s} W={g.W * 0.4} s={g.s * 0.5} wall={false} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#9a8a6a" />
          <House x={g.x - 10 * g.s} y={g.ground - 20 * g.s} s={g.s * 1.1} w={150} h={100} />
          <House x={g.x + g.W * 0.2} y={g.ground - 26 * g.s} s={g.s * 0.8} w={130} color="#8a5a3a" flip />
          <House x={g.x + g.W * 0.62} y={g.ground - 26 * g.s} s={g.s * 0.8} w={130} color="#a07a52" />
          <House x={g.x + g.W * 0.82} y={g.ground - 20 * g.s} s={g.s * 1.1} w={150} h={100} color="#8a5a3a" flip />
          {[0, 1, 2].map((i) => {
            const dx = ((frame - start) * (2 + i) * g.s + i * 300 * g.s) % g.W;
            return <ellipse key={i} cx={g.x + dx} cy={g.ground + 20 * g.s + Math.sin(frame * 0.2 + i) * 4 * g.s} rx={14 * g.s} ry={4 * g.s} fill="#c9b48a" opacity={0.7} />;
          })}
          <Leaves x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={8} />
        </g>
      )}
    </Panel>
  );
};

// Moscow burning at night (no people).
const BurnScene = ({ start, end, id = "c6burn", q = false }: { start: number; end: number; id?: string; q?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={CITY.moscow} start={start} end={end} sky={NIGHT}>
      {(g) => {
        const burn = interpolate(frame, [start, start + 40], [0.2, 1], clamp);
        return (
          <g>
            <MoscowSkyline x={g.x + 20 * g.s} y={g.ground - 10 * g.s} W={g.W - 40 * g.s} s={g.s * 0.95} night={1} burn={burn} />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a1a14" />
            {[0.08, 0.22, 0.36, 0.58, 0.7, 0.86].map((k, i) => <Smoke key={`s${i}`} x={g.x + g.W * k} y={g.ground - 140 * g.s} size={80 * g.s} seed={i + 40} k={burn} />)}
            {[0.08, 0.22, 0.36, 0.58, 0.7, 0.86].map((k, i) => <Fire key={i} x={g.x + g.W * k} y={g.ground - (30 + (i % 3) * 30) * g.s} size={(70 + (i % 2) * 40) * g.s * burn} seed={i + 9} />)}
            {q && (
              <text x={g.cx} y={g.ground - 60 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={200 * g.s} fill="#fff" stroke="#0b1020" strokeWidth={10 * g.s} paintOrder="stroke" opacity={interpolate(frame, [start, start + 10], [0, 0.95], clamp)}>?</text>
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// The governor's order: a sealed paper on a desk by candlelight, the burning city in the window.
const OrderScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6order" anchor={CITY.moscow} start={start} end={end} sky={["#2a1a24", "#4a2a24"]}>
    {(g) => (
      <g>
        <rect x={g.x + g.W * 0.58} y={g.y + 40 * g.s} width={g.W * 0.34} height={g.H * 0.55} fill="#b0401a" stroke="#1b1d24" strokeWidth={4 * g.s} />
        <rect x={g.x + g.W * 0.58} y={g.y + 40 * g.s} width={g.W * 0.34} height={g.H * 0.55} fill="url(#fig-glow)" />
        <line x1={g.x + g.W * 0.75} y1={g.y + 40 * g.s} x2={g.x + g.W * 0.75} y2={g.y + 40 * g.s + g.H * 0.55} stroke="#1b1d24" strokeWidth={5 * g.s} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a20" />
        <Desk x={g.x + g.W * 0.3} y={g.ground + 30 * g.s} s={g.s * 1.3} />
        <g transform={`translate(${g.x + g.W * 0.3},${g.ground - 68 * g.s}) rotate(-6)`}>
          <rect x={-70 * g.s} y={-50 * g.s} width={120 * g.s} height={56 * g.s} fill="#f1e7cf" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
          <text x={-10 * g.s} y={-26 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20 * g.s} fill="#3a2a20">ORDER</text>
          {[0, 1].map((i) => <line key={i} x1={-58 * g.s} y1={(-14 + i * 9) * g.s} x2={38 * g.s} y2={(-14 + i * 9) * g.s} stroke="#7a6a5a" strokeWidth={2 * g.s} />)}
          <circle cx={36 * g.s} cy={-2 * g.s} r={11 * g.s} fill="#b8322a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
        </g>
      </g>
    )}
  </Panel>
);

// Napoleon in the Kremlin, writing to the Tsar.
const WriteScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6write" anchor={CITY.moscow} start={start} end={end} sky={["#4a3a3a", "#8a6a5a"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x + g.W * 0.62} y={g.y + 40 * g.s} width={g.W * 0.28} height={g.H * 0.52} fill="#8aa0b8" stroke="#1b1d24" strokeWidth={4 * g.s} />
        <clipPath id="c6writewin">
          <rect x={g.x + g.W * 0.62} y={g.y + 40 * g.s} width={g.W * 0.28} height={g.H * 0.52} />
        </clipPath>
        <g clipPath="url(#c6writewin)">
          <MoscowSkyline x={g.x + g.W * 0.62} y={g.y + 40 * g.s + g.H * 0.52} W={g.W * 0.28} s={g.s * 0.4} burn={0.8} />
        </g>
        <line x1={g.x + g.W * 0.76} y1={g.y + 40 * g.s} x2={g.x + g.W * 0.76} y2={g.y + 40 * g.s + g.H * 0.52} stroke="#1b1d24" strokeWidth={5 * g.s} />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a3a2a" />
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={10 * g.s} fill="#7a4a2a" />
        <Napoleon x={g.x + g.W * 0.22} y={g.ground + 16 * g.s} scale={g.sc * 0.95} />
        <Desk x={g.x + g.W * 0.4} y={g.ground + 16 * g.s} s={g.s * 1.3} />
        <Letter x={g.x + g.W * 0.36} y={g.ground - 100 * g.s} scale={g.s * 0.7} rot={-8} open={1} />
      </g>
    )}
  </Panel>
);

// The letter goes unanswered: the sealed reply never comes.
const NoReplyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6noreply" anchor={CITY.petersburg} start={start} end={end} sky={["#3a4050", "#7a8090"]} accent="#8a8d93">
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#4a3a30" />
          {[0, 1, 2].map((i) => <Letter key={i} x={g.x + g.W * (0.25 + i * 0.25)} y={g.ground - 110 * g.s + Math.sin(frame * 0.05 + i) * 4 * g.s} scale={g.s * 1.3} rot={-8 + i * 7} />)}
          <text x={g.cx} y={g.ground + 28 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40 * g.s} fill="#fff" opacity={interpolate(frame, [start + 10, start + 20], [0, 0.9], clamp)}>No reply</text>
        </g>
      )}
    </Panel>
  );
};

// Napoleon at the window of the burned city as autumn turns cold.
const WindowScene = ({ start, end, away = false, id = "c6window" }: { start: number; end: number; away?: boolean; id?: string }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={CITY.moscow} start={start} end={end} sky={["#3a3a40", "#6a5a50"]} accent={away ? RED : "#c8692a"}>
      {(g) => {
        const wx = g.x + g.W * 0.5;
        const wy = g.y + 30 * g.s;
        const ww = g.W * 0.42;
        const wh = g.H * 0.6;
        return (
          <g>
            <rect x={wx} y={wy} width={ww} height={wh} fill="#9aa0a8" />
            <clipPath id={`${id}-win`}>
              <rect x={wx} y={wy} width={ww} height={wh} />
            </clipPath>
            <g clipPath={`url(#${id}-win)`}>
              <MoscowSkyline x={wx + 10 * g.s} y={wy + wh} W={ww - 20 * g.s} s={g.s * 0.5} burn={1} wall={false} />
              <Leaves x={wx} y={wy} W={ww} H={wh} s={g.s} n={12} />
            </g>
            <rect x={wx} y={wy} width={ww} height={wh} fill="none" stroke="#3a2a20" strokeWidth={10 * g.s} />
            <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#3a2a20" strokeWidth={6 * g.s} />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a3a2a" />
            <Napoleon x={g.x + g.W * (away ? 0.3 - interpolate(frame, [start, start + 40], [0, 0.08], clamp) : 0.36)} y={g.ground + 16 * g.s} scale={g.sc * 0.95} flip={away} />
          </g>
        );
      }}
    </Panel>
  );
};

// The army loots and drinks: sacks, barrels, a cart of plunder, a soldier staggering.
const LootScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6loot" anchor={CITY.moscow} start={start} end={end} sky={["#4a4a50", "#9a8a70"]} accent="#c8692a">
      {(g) => (
        <g>
          <MoscowSkyline x={g.x + 20 * g.s} y={g.ground - 30 * g.s} W={g.W - 40 * g.s} s={g.s * 0.7} burn={1} wall={false} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#5a4a3a" />
          <LootCart x={g.x + g.W * 0.3} y={g.ground + 10 * g.s} scale={g.sc * 0.8} />
          {[0, 1].map((i) => (
            <g key={i}>
              <ellipse cx={g.x + g.W * (0.62 + i * 0.07)} cy={g.ground - 10 * g.s} rx={24 * g.s} ry={32 * g.s} fill="#7a5a3a" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
              <line x1={g.x + g.W * (0.62 + i * 0.07) - 24 * g.s} y1={g.ground - 18 * g.s} x2={g.x + g.W * (0.62 + i * 0.07) + 24 * g.s} y2={g.ground - 18 * g.s} stroke="#3a2a1a" strokeWidth={3 * g.s} />
            </g>
          ))}
          <g transform={`rotate(${Math.sin(frame * 0.08) * 8},${g.x + g.W * 0.82},${g.ground + 20 * g.s})`}>
            <Soldier x={g.x + g.W * 0.82} y={g.ground + 20 * g.s} scale={g.sc * 0.7} pose="stand" u={FRENCH} flip />
          </g>
          <Soldier x={g.x + g.W * 0.08 + ((frame - start) * 1.2 * g.s) % (g.W * 0.15)} y={g.ground + 20 * g.s} scale={g.sc * 0.7} u={FRENCH} />
          <ellipse cx={g.x + g.W * 0.08 + ((frame - start) * 1.2 * g.s) % (g.W * 0.15) - 24 * g.s} cy={g.ground - 92 * g.s} rx={20 * g.s} ry={24 * g.s} fill="#c9b48a" stroke="#1b1d24" strokeWidth={1.3 * g.s} />
        </g>
      )}
    </Panel>
  );
};

// Tarutino: Russian infantry storm the French outpost's tents.
const TarutinoScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6tar" anchor={CITY.tarutino} start={start} end={end} sky={["#6a7a8a", "#d8b890"]} accent={RUS}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#7a7a50" />
          {[0.1, 0.24, 0.38].map((k, i) => <Tent key={i} x={g.x + g.W * k} y={g.ground - 10 * g.s} s={g.s * 1.1} />)}
          <Smoke x={g.x + g.W * 0.3} y={g.ground - 60 * g.s} size={70 * g.s} seed={21} />
          <Explosion x={g.x + g.W * 0.24} y={g.ground - 40 * g.s} size={50 * g.s} k={((frame - start) % 45) / 45} />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * (0.6 + i * 0.08) - (frame - start) * 1.6 * g.s} y={g.ground + 20 * g.s - (i % 2) * 18 * g.s} scale={g.sc * 0.66} phase={i} u={RUSSIAN} flip />)}
        </g>
      )}
    </Panel>
  );
};

// The retreat marches out of Moscow, west (left), the burned city behind.
const MarchOutScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6out" anchor={CITY.moscow} start={start} end={end} sky={["#5a5a60", "#b09a80"]} accent="#e8edf2">
      {(g) => (
        <g>
          <MoscowSkyline x={g.x + g.W * 0.45} y={g.ground - 30 * g.s} W={g.W * 0.55} s={g.s * 0.75} burn={1} />
          <Smoke x={g.x + g.W * 0.7} y={g.ground - 140 * g.s} size={70 * g.s} seed={51} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#7a6a54" />
          {Array.from({ length: 8 }, (_, i) => <Soldier key={i} x={g.x + g.W - ((frame - start) * 1.3 * g.s + i * 120 * g.s) % (g.W + 100 * g.s) + 50 * g.s} y={g.ground + 20 * g.s} scale={g.sc * 0.64} phase={i} u={FRENCH} flip />)}
        </g>
      )}
    </Panel>
  );
};

// Overloaded loot carts dragged along the road.
const CartsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6carts" anchor={CITY.moscow} start={start} end={end} sky={["#5a5a60", "#b09a80"]} accent="#e8edf2">
      {(g) => {
        const m = (frame - start) * 1.1 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#7a6a54" />
            {[0, 1].map((i) => {
              const cx = g.x + g.W * (0.45 + i * 0.5) - m;
              return (
                <g key={i}>
                  <LootCart x={cx} y={g.ground + 20 * g.s} scale={g.sc * 0.85} roll={-(frame - start) * 4} flip />
                  <Soldier x={cx - 130 * g.sc * 0.85} y={g.ground + 22 * g.s} scale={g.sc * 0.62} pose="trudge" phase={i} u={FRENCH} flip />
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// The Kremlin walls, blown up behind the army (no people).
const KremlinScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6kremlin" anchor={CITY.moscow} start={start} end={end} sky={["#1a1a30", "#6a3a2a"]}>
      {(g) => (
        <g>
          <MoscowSkyline x={g.x + 20 * g.s} y={g.ground - 10 * g.s} W={g.W - 40 * g.s} s={g.s} night={0.6} burn={0.5} />
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2420" />
          <Explosion x={g.x + g.W * 0.3} y={g.ground - 80 * g.s} size={70 * g.s} k={interpolate(frame, [T.blow - 6, T.blow + 40], [0, 1], clamp)} />
          <Explosion x={g.x + g.W * 0.7} y={g.ground - 60 * g.s} size={55 * g.s} k={interpolate(frame, [T.blow + 12, T.blow + 52], [0, 1], clamp)} />
          {frame > T.blow + 10 && <Smoke x={g.x + g.W * 0.3} y={g.ground - 100 * g.s} size={90 * g.s} seed={61} />}
        </g>
      )}
    </Panel>
  );
};

// ---- map overlays ----

// Calendar chip next to Moscow, counting the days of waiting.
const Calendar = ({ k, day }: { k: number; day: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(CITY.moscow);
  if (!p) return null;
  const x = p[0] + 215 * s;
  const y = p[1] - 70 * s;
  return (
    <g transform={`translate(${x},${y}) scale(${Math.min(1, k)})`} opacity={Math.min(1, k * 1.5)}>
      <rect x={-75 * s} y={-70 * s} width={150 * s} height={150 * s} rx={14 * s} fill="#f4f1ea" stroke="#0b1020" strokeWidth={4 * s} />
      <path d={`M${-75 * s} ${-56 * s} Q${-75 * s} ${-70 * s} ${-61 * s} ${-70 * s} L${61 * s} ${-70 * s} Q${75 * s} ${-70 * s} ${75 * s} ${-56 * s} L${75 * s} ${-30 * s} L${-75 * s} ${-30 * s} Z`} fill={RED} />
      <text y={-41 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26 * s} fill="#fff">DAY</text>
      <text y={50 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={76 * s} fill="#1b1d24">{day}</text>
      <rect x={-75 * s} y={88 * s} width={150 * s} height={44 * s} rx={22 * s} fill="#c8692a" stroke="#fff" strokeWidth={2.5 * s} />
      <text y={119 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * s} fill="#fff">Week {Math.min(5, Math.ceil(day / 7))}</text>
    </g>
  );
};

// People streaming out of Moscow.
const Leaving = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  const p = projection(CITY.moscow);
  if (!p || k <= 0 || k >= 1) return null;
  return (
    <g opacity={Math.sin(k * Math.PI)}>
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r = (20 + k * (150 + (i % 3) * 40)) * s;
        return <circle key={i} cx={p[0] + Math.cos(a) * r} cy={p[1] + Math.sin(a) * r * 0.8} r={6 * s} fill="#fff" stroke="#0b1020" strokeWidth={2 * s} />;
      })}
    </g>
  );
};

// "About three quarters destroyed": a 3/4 pie over Moscow.
const Pie = ({ k, sweep }: { k: number; sweep: number }) => {
  const { projection, s } = useMap();
  const p = projection(CITY.moscow);
  if (!p || k <= 0) return null;
  const r = 110 * s;
  const a = -Math.PI / 2 + sweep * Math.PI * 2 * 0.75;
  const large = sweep * 0.75 > 0.5 ? 1 : 0;
  const d = `M${p[0]} ${p[1]} L${p[0]} ${p[1] - r} A${r} ${r} 0 ${large} 1 ${p[0] + Math.cos(a) * r} ${p[1] + Math.sin(a) * r} Z`;
  return (
    <g opacity={k}>
      <circle cx={p[0]} cy={p[1]} r={r} fill="rgba(8,14,26,0.35)" stroke="#fff" strokeWidth={3 * s} strokeDasharray={`${8 * s} ${6 * s}`} />
      {sweep > 0 && <path d={d} fill="#ff5a1a" fillOpacity={0.55} stroke="#ffd64a" strokeWidth={4 * s} strokeLinejoin="round" />}
    </g>
  );
};

const FIRES: [number, number][] = [[37.6, 55.78], [37.54, 55.81], [37.66, 55.83], [37.63, 55.74], [37.52, 55.75], [37.7, 55.78], [37.57, 55.85]];

const Map6 = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const pop = (f0: number, f1: number) => (frame < f0 || frame > f1 ? 0 : spring({ frame: frame - f0, fps: 30, config: { damping: 12 } }) * interpolate(frame, [f1 - 10, f1], [1, 0], clamp));
  const night = interpolate(frame, [T.night - 6, T.night + 14, T.letters - 6, T.letters + 14], [0, 1, 1, 0], clamp);
  const fade = interpolate(frame, [T.never - 6, T.never + 12], [1, 0.3], clamp);
  const day = 1 + Math.floor(interpolate(frame, [T.five, T.looted + 20], [0, 34], clamp));
  return (
    <g>
      <FigureDefs />
      <Pin at={CITY.moscow} text="Moscow" k={show(from - 5, to + 20)} color={GOLD} dy={64} />
      <MapChip at={CITY.moscow} text="🔑 ?" k={pop(T.bring - 4, T.empty + 10)} color="rgba(8,14,26,0.85)" dx={170} dy={-40} />
      <MapChip at={CITY.moscow} text="Nobody came" k={pop(T.nobody, T.empty + 10)} color={RED} dx={170} dy={20} size={0.8} />
      <Leaving k={interpolate(frame, [T.almost - 16, T.almost + 50], [0, 1], clamp)} />
      {/* the fire */}
      <NightGrade k={night} fireAt={CITY.moscow} />
      {FIRES.map((p, i) => {
        const q = projection(p);
        const k = interpolate(frame, [T.fires + i * 5, T.fires + i * 5 + 12, T.letters - 6, T.letters + 14], [0, 1, 1, 0], clamp);
        return q && k > 0 ? <Fire key={i} x={q[0]} y={q[1]} size={44 * s} seed={i + 3} k={k} /> : null;
      })}
      <Pie k={show(T.three - 4, T.who + 30)} sweep={interpolate(frame, [T.three, T.three + 24], [0, 1], clamp)} />
      <MapChip at={CITY.moscow} text="~3/4 destroyed" k={pop(T.three + 20, T.who + 30)} color={RED} dy={-150} size={0.85} />
      {/* letters to St Petersburg */}
      <Pin at={CITY.petersburg} text="St Petersburg" k={show(T.tsar - 14, T.wait + 20)} color="#e8edf2" />
      {frame >= T.tsar - 6 && frame < T.wait + 20 && <Arrow points={[[37.5, 55.95], [34.5, 58.2], [30.6, 59.8]]} start={T.tsar - 6} end={T.peace + 6} color={GOLD} width={20} variant="dashed" outline="#0b1020" opacity={fade * show(T.tsar - 6, T.wait + 20)} />}
      <MapChip at={[34.4, 58.2]} text="✉ Peace?" k={pop(T.peace - 4, T.wait + 20) * fade} color={GOLD} textColor="#1b1d24" dx={-10} dy={-50} size={0.9} />
      <MapChip at={CITY.petersburg} text="No answer" k={pop(T.never, T.wait + 20)} color="#5a5d63" dy={56} size={0.9} />
      {/* five weeks */}
      <Calendar k={pop(T.five - 6, T.tar + 10)} day={day} />
      {/* Tarutino */}
      <Block at={CITY.tarutino} k={pop(T.outpost - 20, T.leave + 20)} color={BLUE} text="French outpost" dy={-44} size={0.8} />
      {frame >= T.struck && frame < T.leave + 20 && <Arrow points={[[37.25, 55.05], [36.95, 55.18], [36.66, 55.29]]} start={T.struck} end={T.struck + 25} color={RUS} width={24} outline="#0b1020" opacity={show(T.struck, T.leave + 20)} />}
      <MapGlow at={CITY.tarutino} k={show(T.struck + 22, T.struck + 70)} r={70} />
      <Pin at={CITY.tarutino} text="Tarutino" k={show(T.tarW - 6, T.leave + 20)} color={RUS} dy={70} />
      <MapChip at={CITY.moscow} text="No peace" k={pop(T.nopeace, T.leave + 10)} color={RED} dx={-170} dy={-30} />
      {/* the Kremlin blown up */}
      {(() => {
        const q = projection(CITY.moscow);
        const k = interpolate(frame, [T.blow - 4, T.blow + 36], [0, 1], clamp);
        return q ? <Explosion x={q[0]} y={q[1]} size={60 * s} k={k} /> : null;
      })()}
      <MapGlow at={CITY.moscow} k={show(T.blow - 4, T.blow + 40)} r={90} color="#ffb02e" />
    </g>
  );
};

export const ch6: Chapter = {
  name: "Empty Moscow",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V6.south, w, h, 1, 0.1) },
    { frame: T.reached - 20, cam: view(V6.city, w, h, 1, 0.1) },
    { frame: T.wrote - 6, cam: view(V6.city, w, h, 1, 0.1) },
    { frame: T.tsar + 14, cam: view(V6.north, w, h, 0.85, 0.12) },
    { frame: T.wait, cam: view(V6.north, w, h, 0.85, 0.12) },
    { frame: T.wait + 36, cam: view(V6.city, w, h, 1, 0.1) },
    { frame: T.tar - 4, cam: view(V6.city, w, h, 1, 0.1) },
    { frame: T.tar + 30, cam: view(V6.south, w, h, 1, 0.1) },
    { frame: T.kr - 4, cam: view(V6.south, w, h, 1, 0.1) },
    { frame: T.kr + 26, cam: view(V6.city, w, h, 1, 0.1) },
  ],
  years: [[from, "Sep 1812"], [T.tar, "Oct 1812"]],
  heads: [
    { f: from, tag: "14 September 1812", head: "Napoleon reaches Moscow", color: GOLD },
    { f: T.waited, tag: "Moscow", head: "Waiting for the keys", color: GOLD, chips: [{ text: "Nobody came", f: T.nobody }] },
    { f: T.empty, tag: "An empty city", head: "Almost everyone left", stat: (f) => (f >= T.n270 - 4 ? "270,000" : ""), label: "people lived here", color: GOLD },
    { f: T.fire, tag: "That night", head: "Moscow burns", color: RED, chips: [{ text: "4 days", f: T.four }, { text: "~3/4 of the city destroyed", f: T.three }] },
    { f: T.who, tag: "Moscow fire", head: "Who lit the fires?", color: RED, chips: [{ text: "The Russians themselves?", f: T.russians }, { text: "Gov. Rostopchin?", f: T.governor }, { text: "Still debated", f: T.debated }] },
    { f: T.letters, tag: "From the Kremlin", head: "Letters to the Tsar", color: GOLD, chips: [{ text: "Offering peace", f: T.peace }, { text: "No answer", f: T.never }] },
    { f: T.wait, tag: "Waiting in the ashes", head: "Five weeks", color: "#c8692a", chips: [{ text: "Looting", f: T.looted }, { text: "Falling apart", f: T.apart }] },
    { f: T.tar, tag: "18 October", head: "Tarutino", color: RUS, chips: [{ text: "Kutuzov strikes", f: T.struck }, { text: "No peace", f: T.nopeace }] },
    { f: T.leave, tag: "19 October", head: "The retreat begins", stat: (f) => (f >= T.hundred - 4 ? "~100,000" : ""), label: "men march out", color: "#e8edf2" },
    { f: T.kr, tag: "On Napoleon's orders", head: "The Kremlin blown up", color: RED },
  ],
  Map: () => <Map6 />,
  Panels: () => (
    <g>
      <HillScene start={from + 4} end={T.bring + 14} />
      <KeysScene start={T.bring} end={T.n270 + 14} />
      <EmptyScene start={T.n270} end={T.fires + 14} />
      <BurnScene start={T.fires} end={T.historians + 14} />
      <BurnScene id="c6who" q start={T.historians} end={T.governor + 14} />
      <OrderScene start={T.governor} end={T.kremlin + 14} />
      <WriteScene start={T.kremlin} end={T.never + 14} />
      <NoReplyScene start={T.never} end={T.autumn + 14} />
      <WindowScene start={T.autumn} end={T.looted + 14} />
      <LootScene start={T.looted} end={T.struck + 14} />
      <TarutinoScene start={T.struck} end={T.understood + 14} />
      <WindowScene id="c6away" away start={T.understood} end={T.ordered + 14} />
      <MarchOutScene start={T.ordered} end={T.carts + 14} />
      <CartsScene start={T.carts} end={T.kr + 14} />
      <KremlinScene start={T.kr} end={to + 14} />
    </g>
  ),
  sfx: [
    [from, SFX.whoosh, 0.35],
    [T.reached - 26, SFX.whoosh, 0.35],
    [T.nobody, SFX.pop, 0.4],
    [T.n270, SFX.hit, 0.4],
    [T.fires, SFX.hit, 0.4],
    [T.three, SFX.pop, 0.4],
    [T.debated, SFX.pop, 0.35],
    [T.wrote - 6, SFX.whoosh, 0.4],
    [T.never, SFX.pop, 0.35],
    [T.wait + 4, SFX.whoosh, 0.35],
    [T.five, SFX.tick, 0.3],
    [T.tar + 2, SFX.whoosh, 0.35],
    [T.struck, SFX.hit, 0.45],
    [T.tarW, SFX.pop, 0.35],
    [T.nopeace, SFX.pop, 0.35],
    [T.hundred, SFX.hit, 0.35],
    [T.kr, SFX.whoosh, 0.35],
    [T.blow, SFX.hit, 0.5],
  ],
};
