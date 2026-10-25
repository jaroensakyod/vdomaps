import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { useJson } from "../../../components/useJson";
import { SFX } from "../../../components/Sound";
import { Elephant, IBERIAN, LIBYAN, Mountains, ROMAN, Warrior } from "../kit/Ancient";
import { Banner, Columns, CrossOut, FleetIcon, Galley, General, Horseman, PanelTag, PURPLE, Robed, RunnerDot } from "../kit/AncientA";
import { clamp, display, font, GOLD, Panel, Pin, QuizNews, RED, view, type Chapter } from "../kit/news";
import { Napoleon, Snow, Water } from "../kit/Period";
import { AreaName, Hills, MapLine } from "../kit/PeriodA";
import { MapChip, Signpost } from "../kit/PeriodC";
import { LegionScene } from "./ch1";
import { MARCH, PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 2 "The impossible road" (seapower → elephants), 218 BC: Rome rules the sea and plans to fight in Spain
// and Africa; Hannibal goes by land instead: ~1,600 km in ~5 months. The global army band appears at New Carthage.
const [from, to] = span("ch2");

const T = {
  seapower: B.seapower.start,
  expected: wf("seapower", "expected", 0.1),
  spain: wf("seapower", "Spain", 0.3),
  africa: wf("seapower", "Africa.", 0.45),
  after: wf("seapower", "After", 0.66),
  ruled: wf("seapower", "ruled", 0.87),
  consuls: B.consuls.start,
  army1: wf("consuls", "army", 0.12),
  headed: wf("consuls", "headed", 0.17),
  spainC: wf("consuls", "Spain.", 0.4),
  gathered: wf("consuls", "gathered", 0.5),
  sicily: wf("consuls", "Sicily,", 0.7),
  sail: wf("consuls", "sail", 0.78),
  carthage: wf("consuls", "Carthage", 0.85),
  landroute: B.landroute.start,
  hannibal: wf("landroute", "Hannibal", 0.05),
  nobody: wf("landroute", "nobody", 0.33),
  left: wf("landroute", "left", 0.6),
  sea: wf("landroute", "sea", 0.69),
  went: wf("landroute", "went", 0.85),
  land: wf("landroute", "land.", 0.93),
  distance: B.distance.start,
  polybius: wf("distance", "Polybius", 0.04),
  n1600: wf("distance", "one-", 0.24),
  km: wf("distance", "kilometres.", 0.38),
  through: wf("distance", "Through", 0.52),
  spainD: wf("distance", "Spain,", 0.54),
  pyrenees: wf("distance", "Pyrenees,", 0.66),
  gaul: wf("distance", "Gaul,", 0.82),
  alps: wf("distance", "Alps.", 0.94),
  quiz: B.quiz1.start,
  reveal: B.quizans1.start,
  napoleon: wf("quizans1", "Napoleon", 0.47),
  moscow: wf("quizans1", "Moscow", 0.79),
  army: B.army.start,
  polyA: wf("army", "Polybius", 0.03),
  crossed: wf("army", "crossed", 0.13),
  ebro: wf("army", "Ebro", 0.22),
  n90: wf("army", "ninety-", 0.29),
  n12: wf("army", "twelve-", 0.52),
  modern: wf("army", "Modern", 0.79),
  too: wf("army", "too", 0.94),
  elephants: B.elephants.start,
  n37: wf("elephants", "thirty-", 0.3),
};
const QUIZ_IN = T.quiz + 6;
const QUIZ_OUT = T.reveal + 50;

const V2 = {
  road: bbox([[-7, 36.2], [14, 46]]),
};

const show = (frame: number, f0: number, f1: number, fade = 10) => interpolate(frame, [f0, f0 + fade, f1 - fade, f1], [0, 1, 1, 0], clamp);
const ramp = (frame: number, f0: number, f1: number) => interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const pop = (frame: number, f: number) => (frame < f ? 0 : spring({ frame: frame - f, fps: 30, config: { damping: 12 } }));
const ROUTE = MARCH.map(([lon, lat]) => [lon, lat] as [number, number]);

// Roman galleys on the sea lanes: Rome rules the sea.
const LANES: [number, number][] = [[11.6, 40.3], [8.2, 38.3], [12.2, 37.6], [4.6, 40.0], [1.8, 38.4], [6.6, 42.4], [14.6, 39.3]];
const Fleet = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [T.distance, T.distance + 20], [1, 0], clamp);
  return (
    <g opacity={out}>
      {LANES.map((p, i) => <FleetIcon key={i} at={p} k={pop(frame, T.after + 14 + i * 5)} color={RED} size={0.8} phase={i} flip={i % 2 === 1} />)}
    </g>
  );
};

// Rome's two armies: Spain via Massilia, and Sicily → Carthage.
const Consuls = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [T.left - 10, T.left + 10], [1, 0.35], clamp) * interpolate(frame, [T.distance, T.distance + 20], [1, 0], clamp);
  return (
    <g>
      <Arrow points={[PLACE.rome, [10.6, 42.7], [8.6, 43.8], [6.4, 43.2], PLACE.massilia, [3.6, 42.7], [2.2, 41.6]]} start={T.army1} end={T.spainC + 6} color={RED} width={22} outline="#3a0d0a" opacity={o} />
      <Arrow points={[PLACE.rome, [14.0, 40.4], [15.4, 38.9], [14.6, 37.9]]} start={T.gathered - 6} end={T.sicily + 6} color={RED} width={22} outline="#3a0d0a" opacity={o} />
      <Arrow points={[[13.4, 37.7], [11.9, 37.4], [10.6, 37.0]]} start={T.sail} end={T.carthage + 14} color={RED} width={20} variant="dashed" outline="#3a0d0a" opacity={o} />
    </g>
  );
};

// The obvious sea route (crossed out) and the long land route (lit, dashed).
const Roads = () => {
  const frame = useCurrentFrame();
  const sea = interpolate(frame, [T.went + 20, T.distance + 10], [1, 0], clamp);
  const land = interpolate(frame, [T.went, T.distance + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const lo = interpolate(frame, [T.army - 10, T.army + 20, to - 10, to + 20], [1, 0.55, 0.55, 0], clamp);
  return (
    <g>
      <g opacity={sea}>
        <Arrow points={[PLACE.newcarthage, [3, 38.5], [9.5, 39.6], [12.2, 41.6]]} start={T.hannibal} end={T.hannibal + 26} color="#7fb4ff" width={16} variant="dashed" />
        <MapChip at={[3.2, 38.5]} text="by sea?" k={pop(frame, T.hannibal + 20) * show(frame, T.hannibal + 20, T.distance + 10)} color="#2f6fb3" dy={-60} size={0.75} />
        <CrossOut at={[6.4, 39.1]} k={interpolate(frame, [T.sea - 4, T.sea + 10], [0, 1], clamp)} size={44} />
      </g>
      <MapLine pts={ROUTE} k={land} color={GOLD} width={7} dash="14 10" opacity={lo} />
    </g>
  );
};

// One river lit up (Ep.tsx draws all rivers; this only adds the glow).
const HiRiver = ({ name, k }: { name: string; k: number }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string }> }>("data/medw-rivers.json");
  if (k <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.004, 1.6 * s), 7 * s);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {(data?.rivers?.features ?? []).filter((f) => f.properties.name === name).map((f, i) => (
        <path key={i} d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 3} strokeOpacity={k} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} />
      ))}
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const s1 = (f0: number, f1: number) => show(frame, f0, f1);
  const quiz = interpolate(frame, [QUIZ_IN - 6, QUIZ_IN + 4], [1, 0], clamp);
  return (
    <g>
      <Pin at={PLACE.rome} text="Rome" k={s1(from - 4, T.distance + 20)} size={0.9} />
      <Pin at={PLACE.carthage} text="Carthage" k={s1(from - 4, T.landroute + 20)} color={PURPLE} size={0.9} />
      <MapChip at={[-3.6, 39.6]} text="Spain" k={pop(frame, T.spain) * show(frame, T.spain, T.landroute + 10)} color={RED} size={0.9} />
      <MapChip at={PLACE.carthage} text="Africa" k={pop(frame, T.africa) * show(frame, T.africa, T.landroute + 10)} color={RED} size={0.9} dx={-150} dy={14} />
      <Pin at={PLACE.massilia} text="Massilia" k={s1(T.headed + 10, T.landroute + 20)} size={0.75} />
      <Pin at={PLACE.sicily} text="Sicily" k={s1(T.sicily - 4, T.landroute + 20)} size={0.75} dy={56} />
      <Pin at={PLACE.newcarthage} text="New Carthage" k={s1(T.hannibal - 6, to + 20)} color={GOLD} size={0.85} dy={60} />
      <Pin at={PLACE.turin} text="Italy" k={s1(T.distance + 20, QUIZ_IN + 4)} color={GOLD} size={0.85} />
      <g opacity={quiz}>
        <AreaName at={[-2.4, 38.9]} text="Spain" k={pop(frame, T.spainD)} size={0.9} />
        <AreaName at={[1.3, 42.95]} text="Pyrenees" k={pop(frame, T.pyrenees)} size={0.75} />
        <AreaName at={[3.0, 44.9]} text="Gaul" k={pop(frame, T.gaul)} size={0.9} />
        <AreaName at={[6.5, 44.15]} text="Alps" k={pop(frame, T.alps)} size={0.9} />
        <RunnerDot pts={ROUTE} k={interpolate(frame, [T.through - 4, T.alps + 10], [0, 1], clamp)} />
      </g>
      <HiRiver name="Ebro" k={show(frame, T.ebro - 6, T.elephants + 10)} />
      <Pin at={PLACE.ebro} text="Ebro" k={s1(T.ebro - 2, T.modern)} size={0.8} dy={-34} color={GOLD} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

const DAY: [string, string] = ["#6fa3d6", "#f0e6c4"];

// Rome's plan: an officer at a signpost, SPAIN or AFRICA.
const PlanScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const k = ramp(frame, T.africa - 6, T.africa + 6);
  return (
    <Panel id="c2plan" anchor={PLACE.rome} start={start} end={end} sky={DAY} accent={RED}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.04} W={g.W * 0.3} ground={g.ground - 30 * g.s} s={g.s} n={3} h={200} />
          <Hills x={g.x + g.W * 0.3} W={g.W * 0.7} ground={g.ground - 30 * g.s} s={g.s} color="#8a9a5a" />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#b9a47a" />
          <Signpost x={g.x + g.W * 0.62} y={g.ground - 200 * g.s} s={g.s * 1.3} left="SPAIN" right="AFRICA" k={k} />
          <Robed x={g.x + g.W * 0.38} y={g.ground + 6 * g.s} scale={g.sc * 1.0} robe="#f1ece0" cloak={RED} hold="point" skin="#e2b48e" />
          <Warrior x={g.x + g.W * 0.24} y={g.ground + 6 * g.s} scale={g.sc * 0.8} kit={ROMAN} roman pose="stand" />
          <PanelTag x={g.x + g.W * 0.25} y={g.y + 100 * g.s} s={g.s} text="ROME'S PLAN" color={RED} k={pop(frame, start + 6)} />
        </g>
      )}
    </Panel>
  );
};

// Rome rules the sea: a line of Roman galleys.
const FleetScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const m = (frame - start) * 1.1;
  return (
    <Panel id="c2fleet" anchor={[11.6, 40.3]} start={start} end={end} sky={["#5f93c4", "#e6eef0"]} accent={RED}>
      {(g) => {
        const sea = g.ground - 90 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f6a92" />
            {[0, 1, 2, 3].map((i) => <Galley key={i} x={g.x + g.W * (-0.05 + i * 0.3) + m * g.s} y={sea + (20 + (i % 2) * 40) * g.s} scale={g.sc * (0.55 + (i % 2) * 0.15)} sail={RED} phase={i * 1.3} />)}
            <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="ROME RULES THE SEA" color={RED} k={pop(frame, T.ruled - 6)} />
          </g>
        );
      }}
    </Panel>
  );
};

// Army 2 gathers on a Sicilian beach; at "sail" the sails go up.
const MusterScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const furl = 1 - ramp(frame, T.sail - 4, T.sail + 12);
  return (
    <Panel id="c2muster" anchor={PLACE.sicily} start={start} end={end} sky={DAY} accent={RED}>
      {(g) => {
        const sea = g.ground - 70 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
            <Galley x={g.x + g.W * 0.62} y={sea + 34 * g.s} scale={g.sc * 0.7} sail={RED} furl={furl} row={furl < 0.5} />
            <Galley x={g.x + g.W * 0.88} y={sea + 20 * g.s} scale={g.sc * 0.5} sail={RED} furl={furl} row={furl < 0.5} phase={2} />
            <path d={`M${g.x} ${g.ground - 34 * g.s} Q${g.x + g.W * 0.25} ${g.ground - 60 * g.s} ${g.x + g.W * 0.48} ${g.ground + 6 * g.s} L${g.x + g.W * 0.48} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#d4b47a" />
            {Array.from({ length: 5 }, (_, i) => <Warrior key={i} x={g.x + g.W * (0.04 + i * 0.075)} y={g.ground - (i % 2 ? 16 : 6) * g.s} scale={g.sc * 0.62} kit={ROMAN} roman pose="stand" phase={i} />)}
            <Banner x={g.x + g.W * 0.4} y={g.ground} s={g.s * 0.8} color={RED} />
            <PanelTag x={g.x + g.W * 0.3} y={g.y + 100 * g.s} s={g.s} text="ARMY 2 · SICILY" color={RED} k={pop(frame, T.sicily - 4)} />
            <PanelTag x={g.x + g.W * 0.75} y={g.y + 46 * g.s} s={g.s} text="→ CARTHAGE" color={RED} k={pop(frame, T.carthage)} />
          </g>
        );
      }}
    </Panel>
  );
};

// Nobody expected it: a Roman lookout watches an empty sea.
const LookoutScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2lookout" anchor={[6.4, 39.1]} start={start} end={end} sky={["#7fa6c8", "#eef0e6"]} accent={GOLD}>
      {(g) => {
        const sea = g.ground - 110 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
            <path d={`M${g.x} ${g.y + g.H} L${g.x} ${g.ground - 120 * g.s} L${g.x + g.W * 0.28} ${g.ground - 110 * g.s} L${g.x + g.W * 0.34} ${g.y + g.H} Z`} fill="#8a7a5a" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            <Warrior x={g.x + g.W * 0.18} y={g.ground - 112 * g.s} scale={g.sc * 0.75} kit={ROMAN} roman pose="stand" />
            <Galley x={g.x + g.W * 0.45} y={sea + 50 * g.s} scale={g.sc * 0.5} sail={RED} phase={1} />
            <text x={g.x + g.W * 0.72} y={sea + 30 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={110 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke" opacity={pop(frame, T.nobody)}>?</text>
            <PanelTag x={g.x + g.W * 0.66} y={g.y + 46 * g.s} s={g.s} text="NOBODY EXPECTED IT" k={pop(frame, T.nobody)} />
          </g>
        );
      }}
    </Panel>
  );
};

// Hannibal turns his back on the sea: the column heads inland into the hills.
const InlandScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const m = (frame - start) * 1.2;
  return (
    <Panel id="c2inland" anchor={PLACE.newcarthage} start={start} end={end} sky={["#7fa6c8", "#f2dcae"]} accent={GOLD}>
      {(g) => (
        <g>
          <Water x={g.x} y={g.ground - 60 * g.s} W={g.W * 0.3} H={g.H} s={g.s} color="#3f78a0" />
          <Hills x={g.x + g.W * 0.3} W={g.W * 0.7} ground={g.ground - 30 * g.s} s={g.s * 1.3} color="#9a8a5a" />
          <path d={`M${g.x + g.W * 0.24} ${g.y + g.H} L${g.x + g.W * 0.3} ${g.ground - 40 * g.s} L${g.x + g.W} ${g.ground - 30 * g.s} L${g.x + g.W} ${g.y + g.H} Z`} fill="#c2a46e" />
          <Galley x={g.x + g.W * 0.12} y={g.ground - 30 * g.s} scale={g.sc * 0.45} sail={PURPLE} row={false} furl={1} />
          <General x={g.x + g.W * 0.36 + m * 0.6 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.85} />
          {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * 0.3 - i * 70 * g.s + m * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.66} kit={i % 2 ? IBERIAN : LIBYAN} phase={i} />)}
          <Elephant x={g.x + g.W * 0.08 + m * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.45} phase={2} />
          <PanelTag x={g.x + g.W * 0.72} y={g.y + 46 * g.s} s={g.s} text="BY LAND →" k={pop(frame, T.land - 4)} />
        </g>
      )}
    </Panel>
  );
};

// Polybius measures the route.
const PolybiusScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2polybius" anchor={PLACE.newcarthage} start={start} end={end} sky={["#3a3226", "#9a8460"]} accent={GOLD}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.04} W={g.W * 0.4} ground={g.ground - 10 * g.s} s={g.s} n={3} h={230} color="#cfc4aa" />
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#6b5a40" />
          <Robed x={g.x + g.W * 0.26} y={g.ground + 6 * g.s} scale={g.sc * 1.05} robe="#eef0f2" shade="#c9ced6" beard hold="scroll" skin="#e2b48e" />
          {/* a route drawn on a scroll */}
          <g transform={`translate(${g.x + g.W * 0.68},${g.y + g.H * 0.55})`}>
            <rect x={-160 * g.s} y={-90 * g.s} width={320 * g.s} height={180 * g.s} fill="#efe3c2" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            <path d={`M${-130 * g.s} ${60 * g.s} Q${-80 * g.s} ${-40 * g.s} ${-20 * g.s} ${10 * g.s} T${80 * g.s} ${-30 * g.s} T${130 * g.s} ${-60 * g.s}`} fill="none" stroke="#8e2620" strokeWidth={5 * g.s} strokeDasharray={`${12 * g.s} ${8 * g.s}`} strokeDashoffset={0} opacity={ramp(frame, start, T.km)} />
            <circle cx={-130 * g.s} cy={60 * g.s} r={8 * g.s} fill="#8e2620" />
            <text x={0} y={70 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={48 * g.s} fill="#1b1d24" opacity={pop(frame, T.km - 6)}>~1,600 KM</text>
          </g>
          <PanelTag x={g.x + g.W * 0.27} y={g.y + 100 * g.s} s={g.s} text="POLYBIUS" k={pop(frame, T.polybius)} size={26} />
        </g>
      )}
    </Panel>
  );
};

// The road: the column walks on while the land changes: Spain → the Pyrenees → Gaul → the Alps.
const RoadScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const pyr = ramp(frame, T.pyrenees - 6, T.pyrenees + 10);
  const gaul = ramp(frame, T.gaul - 6, T.gaul + 10);
  const alps = ramp(frame, T.alps - 6, T.alps + 10);
  const stage = frame >= T.alps - 4 ? "ALPS" : frame >= T.gaul - 4 ? "GAUL" : frame >= T.pyrenees - 4 ? "PYRENEES" : "SPAIN";
  return (
    <Panel id="c2road" anchor={[3.0, 43.6]} start={start} end={end} sky={["#7fa6c8", "#f2dcae"]} accent={GOLD}>
      {(g) => {
        const ground = g.ground - 20 * g.s;
        return (
          <g>
            <g opacity={1 - Math.max(pyr * (1 - gaul), alps)}>
              <Hills x={g.x} W={g.W} ground={ground} s={g.s} color={gaul > 0.5 ? "#5a7a4a" : "#a08a5a"} />
            </g>
            <g opacity={pyr * (1 - gaul)}>
              <Mountains x={g.x} W={g.W} ground={ground} s={g.s * 0.8} snow={0.2} far="#7a7a6a" near="#5a5a4a" />
            </g>
            <g opacity={alps}>
              <Mountains x={g.x} W={g.W} ground={ground} s={g.s * 1.1} />
            </g>
            <rect x={g.x} y={ground} width={g.W} height={g.H} fill={alps > 0.5 ? "#dfe6ea" : gaul > 0.5 ? "#7a9a5a" : "#c2a46e"} />
            {Array.from({ length: 6 }, (_, i) => {
              const lane = g.W + 260 * g.s;
              const px = g.x - 130 * g.s + (((frame - start) * 1.3 * g.s + i * (lane / 6)) % lane);
              return i === 2 ? (
                <Elephant key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.5} phase={i} snow={alps * 0.6} />
              ) : i === 4 ? (
                <Horseman key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.55} phase={i} />
              ) : (
                <Warrior key={i} x={px} y={g.ground + 6 * g.s} scale={g.sc * 0.62} kit={i % 2 ? IBERIAN : LIBYAN} phase={i * 1.2} pose={alps > 0.5 ? "trudge" : "walk"} cloak={alps} />
              );
            })}
            {alps > 0 && <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={alps} n={40} />}
            <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text={stage} k={1} />
          </g>
        );
      }}
    </Panel>
  );
};

// Five months: a nod to Ep 1 — Hannibal's elephant and Napoleon, side by side.
const NodScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2nod" anchor={PLACE.newcarthage} start={start} end={end} sky={["#8fa8c0", "#efe6d0"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W / 2} height={g.H} fill="#c2a46e" />
          <rect x={g.x + g.W / 2} y={g.y} width={g.W / 2} height={g.H} fill="#9aaabb" />
          <rect x={g.x + g.W / 2} y={g.ground - 30 * g.s} width={g.W / 2} height={g.H} fill="#eef3f6" />
          <line x1={g.cx} y1={g.y} x2={g.cx} y2={g.y + g.H} stroke="#1b1d24" strokeWidth={4 * g.s} />
          <Elephant x={g.x + g.W * 0.2} y={g.ground + 4 * g.s} scale={g.sc * 0.6} phase={1} />
          <General x={g.x + g.W * 0.38} y={g.ground + 6 * g.s} scale={g.sc * 0.85} phase={2} />
          <g opacity={ramp(frame, T.napoleon - 6, T.napoleon + 6)}>
            <Napoleon x={g.x + g.W * 0.72} y={g.ground + 6 * g.s} scale={g.sc * 0.85} />
            <Snow x={g.x + g.W / 2} y={g.y} W={g.W / 2} H={g.H} s={g.s} n={30} />
          </g>
          <PanelTag x={g.x + g.W * 0.25} y={g.y + 100 * g.s} s={g.s} text="218 BC · ~5 MONTHS" size={26} k={pop(frame, start + 4)} />
          <PanelTag x={g.x + g.W * 0.75} y={g.y + 46 * g.s} s={g.s} text="1812 · EP 1" size={26} k={pop(frame, T.napoleon)} />
        </g>
      )}
    </Panel>
  );
};

// Polybius's army: infantry, then cavalry, then "too many?".
const InfantryScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2foot" anchor={PLACE.ebro} start={start} end={end} sky={DAY} accent={GOLD}>
      {(g) => {
        const lane = g.W + 200 * g.s;
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#a08a5a" />
            <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#c2a46e" />
            {[0, 1].map((row) =>
              Array.from({ length: 9 }, (_, i) => {
                const px = g.x - 100 * g.s + (((frame - start) * 1.2 * g.s + i * (lane / 9) + row * 50 * g.s) % lane);
                return <Warrior key={`${row}-${i}`} x={px} y={g.ground - (row ? 30 : -6) * g.s} scale={g.sc * (row ? 0.5 : 0.62)} kit={(i + row) % 3 ? LIBYAN : IBERIAN} phase={i + row} />;
              }),
            )}
            <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="90,000 FOOT" k={pop(frame, T.n90)} />
          </g>
        );
      }}
    </Panel>
  );
};

const CavalryScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2horse" anchor={PLACE.ebro} start={start} end={end} sky={DAY} accent={GOLD}>
      {(g) => {
        const lane = g.W + 260 * g.s;
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#a08a5a" />
            <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#c2a46e" />
            {Array.from({ length: 5 }, (_, i) => {
              const px = g.x - 130 * g.s + (((frame - start) * 2.2 * g.s + i * (lane / 5)) % lane);
              return <Horseman key={i} x={px} y={g.ground + (i % 2 ? -14 : 4) * g.s} scale={g.sc * 0.6} phase={i * 1.3} gait="gallop" />;
            })}
            <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="12,000 HORSE" k={pop(frame, T.n12)} />
          </g>
        );
      }}
    </Panel>
  );
};

const TooManyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const q = pop(frame, T.too - 6);
  return (
    <Panel id="c2toomany" anchor={PLACE.ebro} start={start} end={end} sky={["#8a9aaa", "#e8e2d0"]} accent={RED}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#b9a47a" />
          {Array.from({ length: 12 }, (_, i) => (
            <Warrior key={i} x={g.x + g.W * (0.04 + (i % 6) * 0.075) + (i >= 6 ? 30 * g.s : 0)} y={g.ground - (i >= 6 ? 36 : -6) * g.s} scale={g.sc * (i >= 6 ? 0.5 : 0.6)} kit={i % 3 ? LIBYAN : IBERIAN} pose="stand" phase={i} />
          ))}
          <Robed x={g.x + g.W * 0.78} y={g.ground + 6 * g.s} scale={g.sc * 1.0} flip robe="#3a4a6a" shade="#2a3650" hold="scroll" skin="#e2b48e" />
          <text x={g.x + g.W * 0.62} y={g.ground - 120 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={120 * g.s} fill={RED} stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke" opacity={q}>?</text>
          <PanelTag x={g.x + g.W * 0.72} y={g.y + 46 * g.s} s={g.s} text="MODERN HISTORIANS" size={26} k={pop(frame, T.modern)} />
          <PanelTag x={g.x + g.W * 0.3} y={g.y + 100 * g.s} s={g.s} text="TOO MANY?" color={RED} k={q} />
        </g>
      )}
    </Panel>
  );
};

// 37 war elephants with their mahouts.
const ElephantScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c2elephants" anchor={PLACE.newcarthage} start={start} end={end} sky={["#e8a060", "#f6e2b6"]} accent={GOLD}>
      {(g) => {
        const lane = g.W + 320 * g.s;
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#a08a5a" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#c2a46e" />
            {Array.from({ length: 4 }, (_, i) => {
              const px = g.x - 160 * g.s + (((frame - start) * 1.0 * g.s + i * (lane / 4)) % lane);
              return <Elephant key={i} x={px} y={g.ground + (i % 2 ? -16 : 6) * g.s} scale={g.sc * (i % 2 ? 0.52 : 0.62)} phase={i * 1.7} />;
            })}
            <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="37 WAR ELEPHANTS" k={pop(frame, T.n37)} />
          </g>
        );
      }}
    </Panel>
  );
};

// "Spring → November": a month bar after the quiz answer.
const MonthBar = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = QUIZ_OUT - 8;
  const end = T.army + 6;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 10, end], [1, 0], clamp);
  const fill = interpolate(frame, [start + 6, T.moscow + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const months = ["Spring", "", "", "", "", "Nov"];
  return (
    <div style={{ position: "absolute", left: 70 * s, right: 70 * s, top: height * 0.34, opacity: k * o, transform: `scale(${0.9 + 0.1 * k})`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.88)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 16 * s, padding: `${16 * s}px ${26 * s}px`, lineHeight: 1.3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: display, fontWeight: 700, fontSize: 40 * s }}>SPRING</span>
        <span style={{ fontFamily: display, fontWeight: 700, fontSize: 52 * s, color: GOLD }}>~5 MONTHS</span>
        <span style={{ fontFamily: display, fontWeight: 700, fontSize: 40 * s }}>NOVEMBER</span>
      </div>
      <div style={{ position: "relative", height: 34 * s, marginTop: 10 * s, borderRadius: 17 * s, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: `linear-gradient(90deg, #8fd16a, ${GOLD} 60%, #e8f2f7)` }} />
        {months.map((_, i) => (i > 0 ? <div key={i} style={{ position: "absolute", left: `${(i / months.length) * 100}%`, top: 0, bottom: 0, width: 2 * s, background: "rgba(8,14,26,0.6)" }} /> : null))}
      </div>
      <div style={{ marginTop: 8 * s, fontSize: 26 * s, opacity: 0.85 }}>New Carthage → Italy, 218 BC</div>
    </div>
  );
};

const count = (f0: number, f1: number, n: number, step = 1, pre = "") => (frame: number) =>
  pre + (Math.round((n * interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })) / step) * step).toLocaleString("en-US");

export const ch2: Chapter = {
  name: "The impossible road",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(2, w, h) },
    { frame: T.distance - 6, cam: H(2, w, h) },
    { frame: T.n1600, cam: view(V2.road, w, h, 1, 0.07) },
    { frame: T.army + 6, cam: view(V2.road, w, h, 1, 0.07) },
    { frame: T.n90, cam: H(3, w, h) },
    { frame: to - 1, cam: H(3, w, h) },
  ],
  years: [[from, "218 BC"], [T.army, "Spring 218 BC"]],
  heads: [
    { f: T.seapower, tag: "Rome's plan", head: "Spain and Africa", color: RED, chips: [{ text: "Spain", f: T.spain }, { text: "Africa", f: T.africa }, { text: "Rome rules the sea", f: T.ruled - 6 }] },
    { f: T.consuls, tag: "Two consuls", head: "Two Roman armies", color: RED, chips: [{ text: "1 → Spain", f: T.headed }, { text: "2 → Sicily → Africa", f: T.sicily }] },
    { f: T.landroute, tag: "The surprise", head: "Go by land", color: GOLD, chips: [{ text: "Not by sea", f: T.sea }, { text: "By land", f: T.land - 4 }] },
    { f: T.distance, tag: "The road · Polybius", head: "Spain → Italy", stat: (f: number) => (f < T.n1600 ? "" : count(T.n1600, T.km + 6, 1600, 50, "~")(f)), label: "km", color: GOLD, chips: [{ text: "Spain", f: T.spainD }, { text: "Pyrenees", f: T.pyrenees }, { text: "Gaul", f: T.gaul }, { text: "Alps", f: T.alps }] },
    { f: T.quiz, tag: "Quick quiz", head: "How long did it take?", color: GOLD },
    { f: T.reveal, tag: "About 5 months", head: "Spring to late autumn", color: GOLD, chips: [{ text: "Like Napoleon, 1812", f: T.napoleon }] },
    { f: T.army, tag: "The army", head: "Crossing the Ebro", stat: (f: number) => (f < T.n90 ? "" : f < T.n12 ? "90,000" : "90,000 + 12,000"), label: "(Polybius)", color: GOLD, chips: [{ text: "ancient figure", f: T.polyA + 6 }, { text: "Modern view: too many", f: T.too - 4 }] },
    { f: T.elephants, tag: "The elephants", head: "War elephants", stat: (f: number) => (f < T.n37 ? "" : count(T.n37, T.n37 + 20, 37)(f)), label: "elephants", color: GOLD },
  ],
  Map: () => (
    <g>
      <Fleet />
      <Consuls />
      <Roads />
      <Labels />
    </g>
  ),
  Panels: () => (
    <g>
      <PlanScene start={T.expected} end={T.after + 14} />
      <FleetScene start={T.after} end={T.army1 + 14} />
      <LegionScene id="c2legion" start={T.army1} end={T.gathered + 14} anchor={PLACE.massilia} flip tag="ARMY 1 → SPAIN" tagAt={T.headed} />
      <MusterScene start={T.gathered} end={T.nobody - 10 + 14} />
      <LookoutScene start={T.nobody - 10} end={T.left + 14} />
      <InlandScene start={T.left} end={T.polybius + 14} />
      <PolybiusScene start={T.polybius} end={T.through - 4 + 14} />
      <RoadScene start={T.through - 4} end={QUIZ_IN + 6} />
      <NodScene start={QUIZ_OUT - 4} end={T.n90 + 14} />
      <InfantryScene start={T.n90} end={T.n12 + 14} />
      <CavalryScene start={T.n12} end={T.modern + 14} />
      <TooManyScene start={T.modern} end={T.elephants + 14} />
      <ElephantScene start={T.elephants} end={to + 14} />
    </g>
  ),
  Screen: () => (
    <>
      <QuizNews title="QUICK QUIZ" question="New Carthage → Italy: how long?" options={["Five weeks", "Five months", "A year"]} answer={1} start={QUIZ_IN} reveal={T.reveal} end={QUIZ_OUT} />
      <MonthBar />
    </>
  ),
  sfx: [
    [T.spain, SFX.pop, 0.35],
    [T.africa, SFX.pop, 0.35],
    [T.after + 14, SFX.pop, 0.3],
    [T.army1, SFX.whoosh, 0.35],
    [T.gathered - 6, SFX.whoosh, 0.3],
    [T.hannibal, SFX.whoosh, 0.3],
    [T.sea - 4, SFX.hit, 0.4],
    [T.went, SFX.whoosh, 0.35],
    [T.distance - 6, SFX.whoosh, 0.35],
    [T.km - 4, SFX.hit, 0.45],
    [T.spainD, SFX.pop, 0.3],
    [T.pyrenees, SFX.pop, 0.3],
    [T.gaul, SFX.pop, 0.3],
    [T.alps, SFX.pop, 0.3],
    [QUIZ_IN, SFX.pop, 0.4],
    [T.reveal, SFX.hit, 0.45],
    [T.army + 6, SFX.whoosh, 0.35],
    [T.n90, SFX.hit, 0.4],
    [T.n12, SFX.pop, 0.35],
    [T.too - 4, SFX.pop, 0.35],
    [T.n37, SFX.hit, 0.45],
  ],
};
