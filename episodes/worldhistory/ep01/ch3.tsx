import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { useMap } from "../../../components/Map";
import { bbox, region } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { clamp, font, GOLD, Panel, Pin, RED, TAN, view, type Chapter } from "../kit/news";
import { AUSTRIAN, BAVARIAN, FRENCH, ITALIAN, Napoleon, POLISH, PRUSSIAN, Soldier, SWISS, Treeline, type Uniform } from "../kit/Period";
import { CampTent, FoodPile, Gauge, GunTeam, Horse, Mud, Rider, Standard, Wagon } from "../kit/PeriodB";
import { CITY } from "./minard";
import { B, span, wf } from "./time";

// Chapter 3 "The Grande Armée" (gather → plan): spring 1812. Arrows from all of Europe converge on the Duchy of
// Warsaw and the Neman; the numbers, the nations, the Poles, horses and guns, and the supply problem.
const [from, to] = span("ch3");

const T = {
  gather: B.gather.start,
  gathered: wf("gather", "gathered", 0.2),
  largest: wf("gather", "largest", 0.3),
  europe: wf("gather", "Europe", 0.45),
  grande: wf("gather", "Grande", 0.8),
  numbers: B.numbers.start,
  n450: wf("numbers", "four-", 0.06),
  men: wf("numbers", "men", 0.3),
  n600: wf("numbers", "six-", 0.52),
  reinf: wf("numbers", "reinforcements", 0.82),
  nations: B.nations.start,
  half: wf("nations", "half", 0.07),
  french: wf("nations", "French", 0.15),
  poles: wf("nations", "Poles", 0.25),
  germans: wf("nations", "Germans", 0.31),
  italians: wf("nations", "Italians", 0.4),
  austrians: wf("nations", "Austrians", 0.5),
  prussians: wf("nations", "Prussians", 0.58),
  swiss: wf("nations", "Swiss", 0.67),
  continent: wf("nations", "continent", 0.82),
  polesB: B.poles.start,
  alone: wf("poles", "alone", 0.12),
  p100: wf("poles", "one-", 0.3),
  hoped: wf("poles", "hoped", 0.6),
  horses: B.horses.start,
  h200: wf("horses", "two-", 0.12),
  cannon: wf("horses", "one-", 0.6),
  supply: B.supply.start,
  food: wf("supply", "food", 0.22),
  mountain: wf("supply", "mountain", 0.5),
  russias: wf("supply", "Russia's", 0.74),
  dirt: wf("supply", "dirt", 0.88),
  plan: B.plan.start,
  brought: wf("plan", "brought", 0.12),
  weeks: wf("plan", "weeks", 0.55),
  sure: wf("plan", "sure", 0.65),
};

const V3 = {
  handoff: bbox([[19, 52], [39, 57.5]]), // ch2 ends here
  europe: bbox([[1, 44.5], [27, 56.5]]),
  duchy: bbox([[14.8, 49.6], [25.8, 55.6]]),
  road: bbox([[21.5, 53.4], [33, 56.3]]),
};

// Rough 1812 outline of the Duchy of Warsaw (approximate).
const DUCHY = region([
  [15.9, 52.6], [16.8, 53.3], [18.6, 53.2], [19.6, 53.4], [20.6, 53.3], [21.9, 53.4], [22.6, 53.1], [23.1, 52.5],
  [23.6, 52.0], [24.0, 51.3], [23.6, 50.5], [22.6, 50.3], [21.7, 50.3], [20.6, 50.2], [19.6, 50.0], [19.0, 50.3],
  [18.5, 50.9], [17.6, 51.3], [16.8, 51.6], [16.1, 52.0],
]);

type Route = { pts: [number, number][]; from: [number, number]; name: string; f: number; dy?: number };
const PLACE = { milan: [9.19, 45.46], munich: [11.58, 48.14], vienna: [16.37, 48.21], berlin: [13.4, 52.52], bern: [7.45, 46.95] } satisfies Record<string, [number, number]>;
const ROUTES = (): Route[] => [
  { name: "France", from: CITY.paris, f: T.french, pts: [CITY.paris, [8, 50.6], [13.5, 52.1], [19, 53.2], [22.6, 54.3]] },
  { name: "Poland", from: CITY.warsaw, f: T.poles, pts: [CITY.warsaw, [22.3, 53.3], [23.4, 54.1]], dy: 54 },
  { name: "Germany", from: PLACE.munich, f: T.germans, pts: [PLACE.munich, [14.5, 50.6], [19.5, 52.6], [22.6, 53.6]] },
  { name: "Italy", from: PLACE.milan, f: T.italians, pts: [PLACE.milan, [12, 47.6], [15.6, 50.1], [20.5, 52.2], [22.4, 53]] },
  { name: "Austria", from: PLACE.vienna, f: T.austrians, pts: [PLACE.vienna, [19.5, 49.9], [22.6, 51.2], [23.8, 51.6]] },
  { name: "Prussia", from: PLACE.berlin, f: T.prussians, pts: [PLACE.berlin, [17, 53.8], [20.4, 54.6], [22.6, 55.1]] },
  { name: "Switzerland", from: PLACE.bern, f: T.swiss, pts: [PLACE.bern, [10.5, 49], [15.5, 51.4], [19.6, 52.9]], dy: 54 },
];

// Converging arrows (Minard's advance colour) and the nation pins that pop on each spoken name.
const Converge = () => {
  const frame = useCurrentFrame();
  const routes = ROUTES();
  const fade = interpolate(frame, [T.polesB - 10, T.polesB + 20, T.russias - 10, T.russias + 20], [1, 0.35, 0.35, 0], clamp);
  const pulse = frame >= T.continent && frame < T.continent + 40 ? 1 + 0.25 * Math.sin(((frame - T.continent) / 40) * Math.PI) : 1;
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 8, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <g opacity={fade}>
        {routes.map((r, i) => (
          <Arrow key={r.name} points={r.pts} start={T.gathered + i * 6} end={T.gathered + i * 6 + 60} color={TAN} width={20 * pulse} outline="#3a2610" />
        ))}
        {/* second wave: reinforcements from the far west */}
        <Arrow points={[CITY.paris, [9, 51.4], [15, 52.9], [20.5, 54]]} start={T.reinf} end={T.reinf + 40} color={GOLD} width={12} variant="dashed" outline="#3a2610" />
        <Arrow points={[PLACE.milan, [11, 48.6], [16.5, 51], [20.6, 52.6]]} start={T.reinf + 6} end={T.reinf + 46} color={GOLD} width={12} variant="dashed" outline="#3a2610" />
      </g>
      {routes.map((r) => <Pin key={r.name} at={r.from} text={r.name} k={show(r.f, T.polesB)} size={0.72} color={GOLD} dy={r.dy ?? -30} />)}
    </g>
  );
};

// The Duchy of Warsaw lights up for the Poles.
const Duchy = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = interpolate(frame, [T.gathered + 30, T.gathered + 50, T.polesB, T.polesB + 15, T.horses, T.horses + 20, T.russias - 10, T.russias + 20], [0, 0.45, 0.45, 1, 1, 0.5, 0.5, 0], clamp);
  if (k <= 0) return null;
  const glow = frame >= T.hoped ? 0.5 + 0.2 * Math.sin(frame * 0.15) : 0.35;
  return (
    <g opacity={k}>
      <path d={path(DUCHY) ?? ""} fill="#e2c14a" fillOpacity={glow * 0.6} stroke="#fff3a6" strokeWidth={3 * s} strokeDasharray={`${10 * s} ${6 * s}`} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} />
    </g>
  );
};

// Kovno → Smolensk: the dirt road into Russia (approximate).
const DirtRoad = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const k = interpolate(frame, [T.russias - 6, T.dirt + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const o = interpolate(frame, [to - 30, to + 20], [1, 0], clamp);
  if (k <= 0 || o <= 0) return null;
  const pts = [CITY.kovno, CITY.vilna, [27.2, 54.9], CITY.vitebsk, CITY.smolensk].map((p) => projection(p as [number, number]) ?? [0, 0]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke="#2a1a0c" strokeWidth={10 * s} strokeLinecap="round" strokeDasharray={`${len * k} ${len}`} opacity={0.6} />
      <path d={d} fill="none" stroke="#b98a52" strokeWidth={5 * s} strokeLinecap="round" strokeDasharray={`${len * k} ${len}`} />
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <Pin at={[23.9, 54.95]} text="Neman" k={show(T.grande, T.numbers + 40)} size={0.8} color={GOLD} />
      <Pin at={[20.6, 52.0]} text="Duchy of Warsaw" k={show(T.alone, T.horses + 10)} size={0.85} color={GOLD} dy={56} />
      <Pin at={[22.6, 53.6]} text="Grande Armée" k={show(T.horses, T.russias)} size={0.9} color={GOLD} />
      <Pin at={CITY.kovno} text="Kovno" k={show(T.russias, to + 5)} size={0.8} />
      <Pin at={CITY.smolensk} text="Smolensk" k={show(T.dirt + 4, to + 5)} size={0.8} dy={54} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

const SPRING: [string, string] = ["#6fa3d6", "#e8f0d0"];
const MIX: Uniform[] = [FRENCH, POLISH, BAVARIAN, ITALIAN, FRENCH, AUSTRIAN, PRUSSIAN, FRENCH, SWISS];

// A camp of tents and standards, columns marching in.
const GatherScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3gather" anchor={[21, 52.6]} start={start} end={end} sky={SPRING} accent={GOLD}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 70 * g.s} s={g.s * 0.8} color="#4c6a4a" />
          <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
          {Array.from({ length: 9 }, (_, i) => <CampTent key={i} x={g.x + (40 + i * 110) * g.s} y={g.ground - 50 * g.s} scale={g.s * 0.8} />)}
          <Standard x={g.x + g.W * 0.82} y={g.ground + 6 * g.s} scale={g.s} />
          {Array.from({ length: 7 }, (_, i) => {
            const sx = g.x - 60 * g.s + (((frame - start) * 1.4 * g.s + i * 105 * g.s) % (g.W + 120 * g.s));
            return <Soldier key={i} x={sx} y={g.ground + 8 * g.s} scale={g.sc * 0.62} phase={i * 0.8} u={MIX[i % MIX.length]} />;
          })}
        </g>
      )}
    </Panel>
  );
};

// Columns to the horizon: rows of soldiers, larger in front.
const ColumnsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3columns" anchor={[21, 52.6]} start={start} end={end} sky={["#89b4e0", "#f2ecd4"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 150 * g.s} width={g.W} height={g.H} fill="#9cae68" />
          <path d={`M${g.cx - 20 * g.s} ${g.ground - 150 * g.s} L${g.cx + 20 * g.s} ${g.ground - 150 * g.s} L${g.x + g.W * 0.95} ${g.ground + 50 * g.s} L${g.x + g.W * 0.05} ${g.ground + 50 * g.s} Z`} fill="#c2a46e" />
          {[0.22, 0.32, 0.45, 0.62, 0.85].map((depth, row) => {
            const sc = g.sc * 0.18 * (1 + depth * 2.2);
            const y = g.ground - 150 * g.s + 200 * g.s * depth;
            const half = (30 + depth * 380) * g.s;
            const n = 4 + row * 2;
            return Array.from({ length: n }, (_, i) => (
              <Soldier key={`${row}-${i}`} x={g.cx - half + (i / (n - 1)) * half * 2} y={y + Math.sin(frame * 0.1 + i) * 0.5} scale={sc} phase={i + row} u={MIX[(i + row) % MIX.length]} />
            ));
          })}
        </g>
      )}
    </Panel>
  );
};

// One soldier per nation, each popping in with its name as it is spoken.
const NATIONS: { u: Uniform; name: string; f: () => number }[] = [
  { u: FRENCH, name: "FRENCH", f: () => T.half },
  { u: POLISH, name: "POLISH", f: () => T.poles },
  { u: BAVARIAN, name: "GERMAN", f: () => T.germans },
  { u: ITALIAN, name: "ITALIAN", f: () => T.italians },
  { u: AUSTRIAN, name: "AUSTRIAN", f: () => T.austrians },
  { u: PRUSSIAN, name: "PRUSSIAN", f: () => T.prussians },
  { u: SWISS, name: "SWISS", f: () => T.swiss },
];
const NationsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3nations" anchor={[18, 51.5]} start={start} end={end} sky={["#7aa6d8", "#eef0dc"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a7b46e" />
          {NATIONS.map((n, i) => {
            const f = n.f();
            const k = interpolate(frame, [f - 2, f + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
            const hl = frame >= T.continent;
            if (k <= 0) return null;
            const x = g.x + g.W * (0.08 + i * 0.14);
            const lit = i === 0 || hl;
            return (
              <g key={n.name} opacity={Math.min(1, k)}>
                <Soldier x={x} y={g.ground - (1 - k) * 30 * g.s} scale={g.sc * 0.75} pose="stand" phase={i} u={n.u} />
                <rect x={x - 58 * g.s} y={g.ground + 6 * g.s} width={116 * g.s} height={30 * g.s} rx={15 * g.s} fill={lit ? GOLD : "rgba(8,14,26,0.85)"} stroke={GOLD} strokeWidth={2 * g.s} />
                <text x={x} y={g.ground + 28 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={19 * g.s} fill={lit ? "#1b1d24" : "#fff"}>{n.name}</text>
              </g>
            );
          })}
        </g>
      )}
    </Panel>
  );
};

// Polish lancers riding past, red-topped czapkas and pennants.
const LancerScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3lancers" anchor={CITY.warsaw} start={start} end={end} sky={["#5d8fc8", "#f0dcae"]} accent={GOLD}>
      {(g) => {
        const lane = g.W + 300 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.9} color="#3e5a40" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#93a35c" />
            <Standard x={g.x + g.W * 0.9} y={g.ground - 20 * g.s} scale={g.s * 0.9} colors={["#ffffff", "#c8312b"]} />
            {[0, 1, 2, 3].map((i) => {
              const hx = g.x - 140 * g.s + (((frame - start) * 1.8 * g.s + i * (lane / 4)) % lane);
              return (
                <Horse key={i} x={hx} y={g.ground + 4 * g.s} scale={g.sc * 0.62} phase={i * 1.3} coat={["#7a4a28", "#3a2a20", "#8e6a48", "#5a3a26"][i]}>
                  <Rider u={POLISH} lance czapka />
                </Horse>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Horse lines: many horses at pickets.
const HorseScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3horses" anchor={[21, 52.6]} start={start} end={end} sky={SPRING} accent={GOLD}>
    {(g) => (
      <g>
        <Treeline x={g.x} W={g.W} ground={g.ground - 60 * g.s} s={g.s * 0.8} color="#4c6a4a" />
        <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
        <line x1={g.x} y1={g.ground - 66 * g.s} x2={g.x + g.W} y2={g.ground - 66 * g.s} stroke="#5a3a22" strokeWidth={2 * g.s} />
        {Array.from({ length: 8 }, (_, i) => <Horse key={`b${i}`} x={g.x + (60 + i * 120) * g.s} y={g.ground - 40 * g.s} scale={g.sc * 0.36} walk={false} phase={i} coat={["#7a4a28", "#3a2a20", "#8e6a48"][i % 3]} />)}
        {Array.from({ length: 5 }, (_, i) => <Horse key={`f${i}`} x={g.x + (110 + i * 190) * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.55} walk={false} phase={i * 2} flip={i % 2 === 1} coat={["#5a3a26", "#8e6a48", "#3a2a20", "#7a4a28", "#a07850"][i]} />)}
      </g>
    )}
  </Panel>
);

// Gun teams on the road.
const GunScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3guns" anchor={[21, 52.6]} start={start} end={end} sky={SPRING} accent={GOLD}>
      {(g) => {
        const m = (frame - start) * 1.3 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} color="#4c6a4a" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#b49a68" />
            {[0, 1].map((i) => <GunTeam key={i} x={g.x + g.W * (0.3 + i * 0.62) - 180 * g.s + m} y={g.ground + 4 * g.s} scale={g.sc * 0.55} phase={i * 2} u={FRENCH} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// "Eats a mountain every day": a heap of food that piles up.
const FoodScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3food" anchor={[21, 52.6]} start={start} end={end} sky={["#e9a85a", "#f8e3b4"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
          <FoodPile x={g.cx + 60 * g.s} y={g.ground + 4 * g.s} s={g.s * 0.95} k={interpolate(frame, [T.food - 4, T.mountain + 30], [0.08, 1], clamp)} />
          <Soldier x={g.x + g.W * 0.1} y={g.ground + 6 * g.s} scale={g.sc * 0.75} pose="stand" u={FRENCH} />
          <Wagon x={g.x + g.W * 0.86} y={g.ground + 4 * g.s} scale={g.sc * 0.55} flip />
        </g>
      )}
    </Panel>
  );
};

// Wagons bogged on a dirt road.
const MudScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3mud" anchor={CITY.kovno} start={start} end={end} sky={["#6e7c86", "#c9cdb8"]} accent={GOLD}>
      {(g) => {
        const sink = interpolate(frame, [start + 10, start + 70], [0, 1], clamp);
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s * 0.9} color="#34463a" />
            <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#6f7a4a" />
            <Mud x={g.x} y={g.ground - 26 * g.s} W={g.W} H={g.H} s={g.s} />
            <Wagon x={g.x + g.W * 0.32} y={g.ground + 4 * g.s} scale={g.sc * 0.7} sink={sink} roll={Math.sin(frame * 0.3) * 8} />
            <Wagon x={g.x + g.W * 0.75} y={g.ground + 2 * g.s} scale={g.sc * 0.6} sink={sink * 0.7} canvas="#d6cdb4" />
            <Soldier x={g.x + g.W * 0.12} y={g.ground + 10 * g.s} scale={g.sc * 0.7} pose="trudge" u={FRENCH} phase={1} />
            <Soldier x={g.x + g.W * 0.55} y={g.ground + 10 * g.s} scale={g.sc * 0.7} pose="trudge" u={BAVARIAN} phase={2.4} />
          </g>
        );
      }}
    </Panel>
  );
};

// Napoleon and the supply gauge: enough for a few weeks.
const PlanScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3plan" anchor={CITY.kovno} start={start} end={end} sky={["#5d8fc8", "#f0dcae"]} accent={GOLD}>
      {(g) => {
        const level = interpolate(frame, [T.brought, T.weeks + 25], [1, 0.25], { ...clamp, easing: Easing.inOut(Easing.quad) });
        return (
          <g>
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#93a35c" />
            <Wagon x={g.x + g.W * 0.32} y={g.ground + 2 * g.s} scale={g.sc * 0.5} roll={(frame - start) * 3} />
            <Napoleon x={g.x + g.W * 0.1} y={g.ground + 4 * g.s} scale={g.sc * 0.8} />
            <Gauge x={g.x + g.W * 0.72} y={g.ground - 50 * g.s} s={g.s * 1.05} level={level} font={font} />
            {frame >= T.weeks - 4 && (
              <g opacity={interpolate(frame, [T.weeks - 4, T.weeks + 6], [0, 1], clamp)}>
                <rect x={g.x + g.W * 0.72 - 120 * g.s} y={g.ground - 8 * g.s} width={240 * g.s} height={40 * g.s} rx={20 * g.s} fill={GOLD} />
                <text x={g.x + g.W * 0.72} y={g.ground + 20 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={24 * g.s} fill="#1b1d24">A FEW WEEKS</text>
              </g>
            )}
          </g>
        );
      }}
    </Panel>
  );
};

const count = (f0: number, f1: number, n: number, step = 1000) => (frame: number) =>
  (Math.round((n * interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })) / step) * step).toLocaleString("en-US");

export const ch3: Chapter = {
  name: "The Grande Armée",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V3.handoff, w, h, 1, 0.08) },
    { frame: T.gathered + 10, cam: view(V3.europe, w, h, 1, 0.15) },
    { frame: T.polesB - 6, cam: view(V3.europe, w, h, 1, 0.15) },
    { frame: T.polesB + 40, cam: view(V3.duchy, w, h, 1, 0.1) },
    { frame: T.russias - 12, cam: view(V3.duchy, w, h, 1, 0.1) },
    { frame: T.russias + 30, cam: view(V3.road, w, h, 1, 0.1) },
  ],
  years: [[from, "Spring 1812"]],
  heads: [
    { f: T.gather, tag: "Spring 1812", head: "The Grande Armée", color: GOLD, chips: [{ text: "Largest army in Europe", f: T.largest }] },
    { f: T.numbers, tag: "First wave", head: "The Grande Armée", stat: count(T.n450, T.n450 + 40, 450000), label: "men", color: GOLD, chips: [{ text: "+ reinforcements: ~600,000", f: T.n600 }] },
    { f: T.nations, tag: "A whole continent", head: "Only half were French", color: GOLD },
    { f: T.polesB, tag: "The Poles", head: "Hoping for their country", stat: count(T.alone, T.p100 + 10, 100000), label: "men (approx.)", color: GOLD },
    { f: T.horses, tag: "Up to", head: "Horses and guns", stat: count(T.h200, T.h200 + 35, 200000), label: "horses", color: GOLD },
    { f: T.cannon, tag: "About", head: "Horses and guns", stat: count(T.cannon, T.cannon + 30, 1300, 10), label: "cannon", color: GOLD },
    { f: T.supply, tag: "The real problem", head: "Feeding 450,000 men", color: RED, chips: [{ text: "Food", f: T.food }, { text: "Dirt roads", f: T.dirt }] },
    { f: T.plan, tag: "Supplies", head: "For a few weeks", color: RED, chips: [{ text: "A short war?", f: T.sure }] },
  ],
  Map: () => (
    <g>
      <Duchy />
      <Converge />
      <DirtRoad />
      <Labels />
    </g>
  ),
  Panels: () => (
    <g>
      <GatherScene start={T.largest} end={T.men + 14} />
      <ColumnsScene start={T.men} end={T.half + 14} />
      <NationsScene start={T.half} end={T.polesB + 14} />
      <LancerScene start={T.polesB} end={T.horses + 4 + 14} />
      <HorseScene start={T.horses + 4} end={T.cannon - 6 + 14} />
      <GunScene start={T.cannon - 6} end={T.supply + 6 + 14} />
      <FoodScene start={T.supply + 6} end={T.dirt - 8 + 14} />
      <MudScene start={T.dirt - 8} end={T.plan + 14} />
      <PlanScene start={T.plan} end={to + 10} />
    </g>
  ),
  sfx: [
    [from, SFX.whoosh, 0.35],
    [T.gathered, SFX.whoosh, 0.3],
    [T.n450, SFX.hit, 0.45],
    [T.n600, SFX.pop, 0.4],
    [T.reinf, SFX.whoosh, 0.3],
    [T.french, SFX.pop, 0.3],
    [T.poles, SFX.pop, 0.3],
    [T.germans, SFX.pop, 0.3],
    [T.italians, SFX.pop, 0.3],
    [T.austrians, SFX.pop, 0.3],
    [T.prussians, SFX.pop, 0.3],
    [T.swiss, SFX.pop, 0.3],
    [T.polesB - 6, SFX.whoosh, 0.35],
    [T.p100, SFX.hit, 0.4],
    [T.h200, SFX.hit, 0.4],
    [T.cannon, SFX.hit, 0.4],
    [T.food, SFX.pop, 0.35],
    [T.russias - 12, SFX.whoosh, 0.35],
    [T.weeks, SFX.pop, 0.4],
  ],
};
