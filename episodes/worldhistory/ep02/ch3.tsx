import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { FigureDefs, Fire, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, GAUL, IBERIAN, LIBYAN, Mountains, ROMAN, Warrior, type Kit } from "../kit/Ancient";
import { Boat, Column, Consul, Galley, Moon, Raft, Roundhouse, SwimElephant, Tree } from "../kit/AncientB";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { useJson } from "../../../components/useJson";
import { clamp, GOLD, Panel, Pin, RED, TAN, view, type Chapter } from "../kit/news";
import { AreaName, Hills, Sea } from "../kit/PeriodA";
import { CampTent } from "../kit/PeriodB";
import { Block, MapChip } from "../kit/PeriodC";
import { Water } from "../kit/Period";
import { PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 3 "Spain to the Rhône" (ebro → turn), 218 BC. The global March band thins north of the Ebro and over the
// Pyrenees, then reaches the Rhône: the Volcae on the far bank, Hanno's flank march, the smoke signal, the elephant
// rafts. Scipio lands at Massilia, arrives three days late, splits his army, and Hannibal turns east into the Alps.
const [from, to] = span("ch3");

const T = {
  ebro: B.ebro.start,
  tribes: wf("ebro", "tribes", 0.18),
  left: wf("ebro", "left", 0.47),
  behind: wf("ebro", "behind", 0.65),
  sent: wf("ebro", "sent", 0.85),
  home: wf("ebro", "home.", 0.95),
  pyr: B.pyrenees.start,
  pyrW: wf("pyrenees", "Pyrenees,", 0.25),
  polybius: wf("pyrenees", "Polybius", 0.35),
  fifty: wf("pyrenees", "fifty-", 0.5),
  nine: wf("pyrenees", "nine-", 0.8),
  rhone: B.rhone.start,
  september: wf("rhone", "September", 0.05),
  rhoneW: wf("rhone", "Rhône,", 0.22),
  fast: wf("rhone", "fast,", 0.33),
  far: wf("rhone", "far", 0.58),
  gaulish: wf("rhone", "Gaulish", 0.65),
  volcae: wf("rhone", "Volcae,", 0.85),
  hanno: B.hanno.start,
  upstream: wf("hanno", "upstream", 0.17),
  hannoW: wf("hanno", "Hanno.", 0.4),
  crossed: wf("hanno", "crossed", 0.6),
  night: wf("hanno", "night", 0.68),
  down: wf("hanno", "down", 0.85),
  behindG: wf("hanno", "behind", 0.88),
  smoke: B.smoke.start,
  smokeW: wf("smoke", "smoke", 0.03),
  main: wf("smoke", "main", 0.2),
  crossedM: wf("smoke", "crossed.", 0.45),
  both: wf("smoke", "both", 0.5),
  broke: wf("smoke", "broke", 0.74),
  rafts: B.rafts.start,
  elephants: wf("rafts", "elephants.", 0.05),
  built: wf("rafts", "built", 0.35),
  covered: wf("rafts", "covered", 0.49),
  earth: wf("rafts", "earth,", 0.7),
  land: wf("rafts", "land.", 0.95),
  panic: B.panic.start,
  panicked: wf("panic", "panicked", 0.23),
  fell: wf("panic", "fell", 0.32),
  drivers: wf("panic", "drivers", 0.6),
  swam: wf("panic", "swam", 0.9),
  scipio: B.scipio.start,
  roman: wf("scipio", "Roman", 0.1),
  massilia: wf("scipio", "Massilia", 0.47),
  reached: wf("scipio", "reached", 0.7),
  camp: wf("scipio", "camp", 0.8),
  late: wf("scipio", "late.", 0.95),
  brother: B.brother.start,
  bold: wf("brother", "bold", 0.17),
  sentA: wf("brother", "sent", 0.33),
  spain: wf("brother", "Spain", 0.47),
  hurried: wf("brother", "hurried", 0.72),
  italy: wf("brother", "Italy", 0.86),
  turn: B.turn.start,
  believe: wf("turn", "believe", 0.14),
  spainT: wf("turn", "Spain", 0.58),
  coast: wf("turn", "coast.", 0.65),
  he: wf("turn", "He", 0.78),
  alps: wf("turn", "Alps.", 0.93),
};

const V3 = {
  ebro: bbox([[-1.3, 40.5], [3.7, 42.3]]),
  pyr: bbox([[0.8, 41.75], [4.4, 43.05]]),
  rhone: bbox([[2.7, 43.25], [6.1, 44.45]]),
  cross: bbox([[3.65, 43.9], [5.95, 44.7]]),
  massilia: bbox([[2.9, 43.2], [7.1, 44.7]]),
  sea: bbox([[2.2, 42.0], [10.8, 45.0]]),
};

const GREEN = "#5cb85c";
const HILL: Kit = { tunic: "#7a5a3a", shade: "#5e442c", shield: "#c9b48a", helmet: "#3a2a1e" }; // hill tribes north of the Ebro
const SKY: [string, string] = ["#8fb3d1", "#efe2c0"];
const DUSK: [string, string] = ["#3a4a78", "#e8a070"];
const NIGHT: [string, string] = ["#0c1430", "#2c3a64"];
const ease = Easing.inOut(Easing.cubic);
const pop = { ...clamp, easing: Easing.out(Easing.back(2)) };

// One river lit up (thin glow; the global layer draws all rivers).
const HiRiver = ({ name, k }: { name: string; k: number }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string }> }>("data/medw-rivers.json");
  if (k <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.004, 1.6 * s), 5 * s);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {(data?.rivers?.features ?? []).filter((f) => f.properties.name === name).map((f, i) => (
        <path key={i} d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 1.6} strokeOpacity={k * 0.9} style={{ filter: `drop-shadow(0 0 ${5 * s}px #ffd84a)` }} />
      ))}
    </g>
  );
};

// --- Map ------------------------------------------------------------------------------------------------------

// The Volcae on the east bank: one block, then scattering on "broke".
const VOLCAE: [number, number] = [4.93, 44.2];
const Volcae = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [T.far - 4, T.far + 8], [0, 1], pop);
  const run = interpolate(frame, [T.broke - 2, T.broke + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [T.rafts - 10, T.rafts + 10], [1, 0], clamp);
  if (k <= 0 || out <= 0) return null;
  const bits: [number, number][] = [[0.42, 0.1], [0.38, -0.2], [0.2, -0.32], [0.5, 0.32]];
  return (
    <g opacity={out}>
      {run < 0.05 ? (
        <Block at={VOLCAE} k={k} color={GREEN} w={34} h={120} text="Volcae" dy={-82} />
      ) : (
        bits.map(([dx, dy], i) => (
          <Block key={i} at={[VOLCAE[0] + dx * run, VOLCAE[1] + dy * run]} k={1 - run * 0.6} color={GREEN} w={22} h={34} rot={i * 25} />
        ))
      )}
      <MapChip at={[VOLCAE[0] + 0.05, VOLCAE[1] - 0.17]} text="Gauls flee" k={interpolate(frame, [T.broke + 6, T.broke + 16, T.rafts - 10, T.rafts], [0, 1, 1, 0], clamp)} color={GREEN} size={0.8} dy={40} />
    </g>
  );
};

// Hanno upstream (~40 km), across at night, and back down behind the Volcae; the smoke signal; the main army crosses.
const Flank = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = interpolate(frame, [T.rafts - 10, T.rafts + 10], [1, 0], clamp);
  const sm = interpolate(frame, [T.smokeW - 4, T.smokeW + 8, T.broke + 20, T.rafts], [0, 1, 1, 0], clamp);
  const sp = projection([5.06, 44.27]);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Arrow points={[[4.6, 44.08], [4.57, 44.28], [4.6, 44.46], [4.8, 44.5], [5.0, 44.42], [5.07, 44.28]]} start={T.upstream} end={T.behindG + 10} color={GOLD} width={18} variant="dashed" />
      <AreaName at={[4.46, 44.36]} text="Hanno" k={interpolate(frame, [T.hannoW - 4, T.hannoW + 8], [0, 1], clamp)} color={GOLD} size={0.7} />
      {sp && sm > 0 && (
        <g>
          <FigureDefs />
          <Smoke x={sp[0]} y={sp[1]} size={60 * s} seed={3} wind={0.2} k={sm} />
          <Smoke x={sp[0] + 8 * s} y={sp[1]} size={46 * s} seed={7} wind={0.3} k={sm} />
          <Fire x={sp[0]} y={sp[1]} size={40 * s} seed={2} k={sm} />
        </g>
      )}
      <Arrow points={[[4.5, 44.1], [4.68, 44.13], [4.86, 44.17]]} start={T.main} end={T.crossedM} color={TAN} width={24} />
    </g>
  );
};

// Scipio: Massilia → the empty camp (3 days late) → his army to Spain, Scipio by sea toward Italy (Pisa).
const CAMP: [number, number] = [4.86, 44.08];
const Scipio = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const fade = interpolate(frame, [T.turn - 10, T.turn + 20], [1, 0], clamp);
  return (
    <g opacity={fade}>
      <Pin at={PLACE.massilia} text="Massilia" k={show(T.massilia - 6, to)} color={RED} size={0.85} dy={58} />
      <Arrow points={[[5.37, 43.33], [5.15, 43.7], [4.9, 44.02]]} start={T.reached - 6} end={T.camp + 6} color={RED} width={20} outline="#3a0d0a" />
      <Pin at={CAMP} text="Empty camp" k={show(T.camp, T.brother + 10)} color={GOLD} size={0.75} dy={-34} />
      <MapChip at={CAMP} text="3 days late" k={interpolate(frame, [T.late - 4, T.late + 8, T.brother + 10, T.brother + 20], [0, 1, 1, 0], pop)} color={RED} size={0.85} dy={56} />
      <Arrow points={[[5.3, 43.2], [4.4, 42.85], [3.6, 42.45], [3.25, 42.15]]} start={T.sentA} end={T.spain + 10} color={RED} width={18} variant="dashed" outline="#3a0d0a" />
      <Arrow points={[[5.5, 43.15], [7.2, 43.35], [9.0, 43.55], [10.2, 43.7]]} start={T.hurried - 6} end={T.italy + 14} color={RED} width={18} variant="dashed" outline="#3a0d0a" />
      <MapChip at={[3.5, 42.1]} text="Army → Spain" k={show(T.spain, to)} color={RED} size={0.8} dy={50} />
      <Pin at={PLACE.pisa} text="Pisa" k={show(T.italy - 4, to)} color={RED} size={0.8} dy={58} />
      <MapChip at={[8.2, 43.4]} text="Scipio → Italy" k={show(T.italy, to)} color={RED} size={0.8} dy={60} />
    </g>
  );
};

// The turn: not Spain, not the coast (crossed out) but the Alps.
const Turn = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const o = interpolate(frame, [to - 16, to], [1, 0], clamp);
  const X = ({ at, f }: { at: [number, number]; f: number }) => {
    const p = projection(at);
    const k = interpolate(frame, [f, f + 8], [0, 1], pop);
    if (!p || k <= 0) return null;
    return (
      <g transform={`translate(${p[0]},${p[1]}) scale(${k})`}>
        {[1, -1].map((d) => <line key={d} x1={-22 * s} y1={-22 * s * d} x2={22 * s} y2={22 * s * d} stroke={RED} strokeWidth={9 * s} strokeLinecap="round" />)}
      </g>
    );
  };
  return (
    <g opacity={o}>
      <Arrow points={[[5.0, 44.6], [4.2, 43.9], [3.4, 43.3]]} start={T.spainT - 10} end={T.spainT + 4} color="#c8ccd4" width={14} variant="dashed" opacity={0.8} />
      <Arrow points={[[5.1, 44.6], [5.3, 44.0], [5.6, 43.4]]} start={T.coast - 10} end={T.coast + 4} color="#c8ccd4" width={14} variant="dashed" opacity={0.8} />
      <X at={[3.9, 43.65]} f={T.spainT + 4} />
      <X at={[5.42, 43.8]} f={T.coast + 4} />
      <Arrow points={[[5.25, 44.95], [5.9, 45.2], [6.6, 44.95], [7.05, 44.75]]} start={T.he} end={T.alps + 10} color={GOLD} width={20} variant="dashed" />
      <AreaName at={[6.6, 45.55]} text="The Alps" k={interpolate(frame, [T.alps - 6, T.alps + 6], [0, 1], clamp)} color={GOLD} size={0.9} />
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <AreaName at={[-0.5, 40.9]} text="Ebro" k={show(T.left, T.pyr + 10)} color="#fff3a6" size={0.75} />
      <Block at={[0.75, 42.25]} k={show(T.left, T.pyr + 20)} color={GOLD} w={44} h={44} text="Left behind" dy={52} size={0.8} />
      <Arrow points={[[1.7, 41.5], [1.0, 41.0], [0.3, 40.4]]} start={T.sent} end={T.home + 10} color={TAN} width={14} variant="dashed" opacity={show(T.sent, T.pyr + 20)} />
      <Pin at={PLACE.pyrenees} text="Pyrenees" k={show(T.pyrW - 6, T.rhone + 6)} color={GOLD} size={0.85} dy={-40} />
      <MapChip at={[4.68, 44.0]} text="crossing site approx." k={show(T.rhoneW + 6, T.scipio)} color="rgba(8,14,26,0.85)" size={0.7} dy={36} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

// North of the Ebro: hill tribesmen block the column.
const FightScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3fight" anchor={[1.4, 41.4]} start={start} end={end} sky={SKY} accent={GOLD}>
      {(g) => {
        const adv = interpolate(frame, [start, start + 40], [0, 1], { ...clamp, easing: ease });
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s * 1.3} color="#9a8a5a" />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#b59b68" />
            {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W * 0.06 + i * 80 * g.s + adv * 60 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.62} phase={i} kit={i % 2 ? IBERIAN : LIBYAN} pose={adv < 1 ? "walk" : "stand"} />)}
            {[0, 1, 2].map((i) => <Warrior key={`t${i}`} x={g.x + g.W * (0.98 - i * 0.1) - adv * 120 * g.s} y={g.ground + 6 * g.s - i * 10 * g.s} scale={g.sc * 0.62} phase={i * 2} kit={HILL} flip pose={adv < 1 ? "charge" : "stand"} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// A garrison stays behind at a palisade; the column marches on.
const GarrisonScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3garrison" anchor={[0.75, 42.25]} start={start} end={end} sky={SKY} accent={GOLD}>
    {(g) => (
      <g>
        <Hills x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} color="#9a8a5a" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#b59b68" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${g.x + g.W * 0.04 + i * 22 * g.s} ${g.ground - 30 * g.s} l0 ${-70 * g.s} l${9 * g.s} ${-12 * g.s} l${9 * g.s} ${12 * g.s} l0 ${70 * g.s} Z`} fill="#8a6440" stroke="#1b1d24" strokeWidth={1.3 * g.s} />
        ))}
        <CampTent x={g.x + g.W * 0.2} y={g.ground - 30 * g.s} scale={g.s * 1.1} />
        {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.08 + i * 0.12)} y={g.ground + 8 * g.s} scale={g.sc * 0.62} phase={i} kit={i % 2 ? LIBYAN : IBERIAN} pose="stand" />)}
        <Column x={g.x + g.W * 0.45} y={g.ground + 8 * g.s} W={g.W * 0.55} s={g.s} sc={g.sc} order="wwew" speed={1.2} t0={start} loop={false} gap={95 * g.s} />
      </g>
    )}
  </Panel>
);

// Men sent home walk back the other way.
const HomeScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3home" anchor={[0.6, 40.7]} start={start} end={end} sky={DUSK} accent={TAN}>
    {(g) => (
      <g>
        <Hills x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s * 1.2} color="#6a5a48" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#a08a60" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwwww" kits={[IBERIAN, HILL]} speed={1.1} t0={start} flip pose="walk" />
      </g>
    )}
  </Panel>
);

// Over the Pyrenees: the column on a mountain road.
const PyreneesScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3pyr" anchor={PLACE.pyrenees} start={start} end={end} sky={["#7fa6c8", "#e6eef2"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 20 * g.s} s={g.s} snow={0.35} far="#6f8a78" near="#4a6650" />
        {[0.08, 0.2, 0.82, 0.93].map((tx, i) => <Tree key={i} x={g.x + g.W * tx} y={g.ground - 18 * g.s} scale={g.s * 0.7} phase={i} />)}
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a7a58" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwhwwew" speed={1} t0={start} pose="trudge" />
      </g>
    )}
  </Panel>
);

// The Rhône: a fast, wide river; the column reaches the west bank.
const RiverScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3river" anchor={[4.6, 44.1]} start={start} end={end} sky={SKY} accent={GOLD}>
    {(g) => {
      const bank = g.ground - 110 * g.s;
      return (
        <g>
          <rect x={g.x} y={bank - 40 * g.s} width={g.W} height={40 * g.s} fill="#5f7a48" />
          {[0.1, 0.3, 0.55, 0.75, 0.92].map((tx, i) => <Tree key={i} x={g.x + g.W * tx} y={bank - 30 * g.s} scale={g.s * 0.55} color="#3e5a3a" phase={i} />)}
          <Water x={g.x} y={bank} W={g.W} H={110 * g.s} s={g.s * 1.4} color="#3c6f8f" />
          <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#a8945e" />
          <Column x={g.x - 40 * g.s} y={g.ground + 8 * g.s} W={g.W * 0.75} s={g.s} sc={g.sc} order="ewwwe" speed={0.9} t0={start} loop={false} gap={110 * g.s} />
        </g>
      );
    }}
  </Panel>
);

// The far bank: the Volcae wait, shields up.
const FarBankScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3volcae" anchor={VOLCAE} start={start} end={end} sky={SKY} accent={GREEN}>
    {(g) => {
      const bank = g.ground - 130 * g.s;
      return (
        <g>
          <Roundhouse x={g.x + g.W * 0.85} y={bank - 52 * g.s} scale={g.s * 0.55} />
          <rect x={g.x} y={bank - 56 * g.s} width={g.W} height={56 * g.s} fill="#5f7a48" />
          {Array.from({ length: 7 }, (_, i) => <Warrior key={i} x={g.x + g.W * (0.08 + i * 0.11)} y={bank - 8 * g.s} scale={g.sc * 0.42} phase={i} kit={GAUL} flip pose="stand" />)}
          <Water x={g.x} y={bank} W={g.W} H={g.H} s={g.s * 1.4} color="#3c6f8f" />
          <rect x={g.x} y={g.ground + 10 * g.s} width={g.W} height={g.H} fill="#a8945e" />
        </g>
      );
    }}
  </Panel>
);

// Hanno's force marches upstream along the bank at dusk.
const UpstreamScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3upstream" anchor={[4.58, 44.35]} start={start} end={end} sky={DUSK} accent={GOLD}>
    {(g) => {
      const bank = g.ground - 70 * g.s;
      return (
        <g>
          <rect x={g.x} y={bank - 30 * g.s} width={g.W} height={30 * g.s} fill="#3e4a3a" />
          <Water x={g.x} y={bank} W={g.W} H={70 * g.s} s={g.s * 1.2} color="#3a5a78" />
          <rect x={g.x} y={g.ground - 4 * g.s} width={g.W} height={g.H} fill="#6a6a48" />
          {[0.15, 0.6].map((tx, i) => <Tree key={i} x={g.x + g.W * tx} y={g.ground + 40 * g.s} scale={g.s * 0.8} color="#24382a" phase={i} />)}
          <Column x={g.x} y={g.ground + 8 * g.s} W={g.W} s={g.s} sc={g.sc} order="whwwhw" kits={[IBERIAN, LIBYAN]} speed={1.6} t0={start} />
        </g>
      );
    }}
  </Panel>
);

// At night, on rafts, across the river.
const NightRaftScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3nightraft" anchor={[4.72, 44.48]} start={start} end={end} sky={NIGHT} accent={GOLD}>
      {(g) => {
        const water = g.ground - 120 * g.s;
        const rx = g.x + g.W * 0.12 + (frame - start) * 1.1 * g.s;
        return (
          <g>
            <Moon x={g.x + g.W * 0.82} y={g.y + 80 * g.s} r={28 * g.s} />
            <rect x={g.x} y={water - 30 * g.s} width={g.W} height={30 * g.s} fill="#1c2a24" />
            <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s * 1.3} color="#1e3550" />
            {[0, 1, 2].map((i) => <Warrior key={i} x={rx + (40 + i * 70) * g.s} y={water + 50 * g.s} scale={g.sc * 0.56} phase={i} kit={i % 2 ? LIBYAN : IBERIAN} pose="stand" />)}
            <Raft x={rx} y={water + 64 * g.s} W={260 * g.s} s={g.s} earth={0} />
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0a1430" opacity={0.25} />
          </g>
        );
      }}
    </Panel>
  );
};

// The smoke signal rises from a hill behind the Gauls.
const SmokeScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3smoke" anchor={[5.06, 44.27]} start={start} end={end} sky={["#9ab6cc", "#f0e4c8"]} accent={GOLD}>
    {(g) => (
      <g>
        <Hills x={g.x} W={g.W} ground={g.ground - 20 * g.s} s={g.s * 1.5} color="#6f7f58" />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a9a64" />
        <Smoke x={g.x + g.W * 0.4} y={g.ground - 110 * g.s} size={70 * g.s} seed={1} wind={0.25} />
        <Smoke x={g.x + g.W * 0.42} y={g.ground - 110 * g.s} size={55 * g.s} seed={5} wind={0.35} />
        <Fire x={g.x + g.W * 0.4} y={g.ground - 100 * g.s} size={36 * g.s} seed={4} />
        {[0, 1].map((i) => <Warrior key={i} x={g.x + g.W * (0.52 + i * 0.08)} y={g.ground - 70 * g.s + i * 30 * g.s} scale={g.sc * 0.5} phase={i} kit={LIBYAN} pose="stand" />)}
      </g>
    )}
  </Panel>
);

// The main army crosses in boats.
const BoatsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3boats" anchor={[4.72, 44.13]} start={start} end={end} sky={SKY} accent={GOLD}>
      {(g) => {
        const water = g.ground - 140 * g.s;
        const m = (frame - start) * 1.4 * g.s;
        return (
          <g>
            <rect x={g.x} y={water - 30 * g.s} width={g.W} height={30 * g.s} fill="#5f7a48" />
            <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s * 1.4} color="#3c6f8f" />
            {[0, 1, 2].map((b) => {
              const bx = g.x + g.W * (0.1 + b * 0.32) + m;
              const by = water + (60 + (b % 2) * 50) * g.s;
              return (
                <g key={b}>
                  <Warrior x={bx - 30 * g.s} y={by - 10 * g.s} scale={g.sc * 0.5} kit={b % 2 ? IBERIAN : LIBYAN} pose="stand" phase={b} />
                  <Warrior x={bx + 20 * g.s} y={by - 10 * g.s} scale={g.sc * 0.5} kit={LIBYAN} pose="stand" phase={b + 1} />
                  <Boat x={bx} y={by} scale={g.sc * 0.62} phase={b} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Caught from both sides, the Gauls break and run.
const FleeScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3flee" anchor={VOLCAE} start={start} end={end} sky={SKY} accent={GREEN}>
    {(g) => (
      <g>
        <Hills x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} color="#6f7f58" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a9a64" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwwwww" kits={[GAUL]} speed={4.2} t0={start} pose="charge" />
      </g>
    )}
  </Panel>
);

// Building huge rafts on the bank; an elephant waits.
const BuildScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3build" anchor={[4.66, 44.1]} start={start} end={end} sky={SKY} accent={GOLD}>
      {(g) => {
        const water = g.ground - 60 * g.s;
        const w = interpolate(frame, [start, T.covered], [0.35, 1], clamp);
        return (
          <g>
            <Water x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.4} color="#3c6f8f" />
            <rect x={g.x + g.W * 0.5} y={water} width={g.W * 0.5} height={g.H} fill="#a8945e" />
            <Raft x={g.x + 20 * g.s} y={water + 40 * g.s} W={(g.W * 0.5 - 20 * g.s) * w} s={g.s} earth={0} />
            {[0, 1].map((i) => <Warrior key={i} x={g.x + g.W * (0.18 + i * 0.16)} y={water + 26 * g.s} scale={g.sc * 0.55} kit={i ? IBERIAN : LIBYAN} pose={(frame + i * 10) % 40 < 20 ? "walk" : "stand"} phase={i} />)}
            <Elephant x={g.x + g.W * 0.78} y={g.ground + 8 * g.s} scale={g.sc * 0.58} flip walk={false} />
          </g>
        );
      }}
    </Panel>
  );
};

// The raft covered with earth: the elephant walks on as if on land.
const EarthRaftScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3earth" anchor={[4.7, 44.12]} start={start} end={end} sky={SKY} accent={GOLD}>
      {(g) => {
        const water = g.ground - 60 * g.s;
        const earth = interpolate(frame, [start, T.earth], [0.2, 1], clamp);
        const ex = interpolate(frame, [T.earth - 10, end], [g.x + g.W * 0.82, g.x + g.W * 0.32], clamp);
        return (
          <g>
            <Water x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.4} color="#3c6f8f" />
            <rect x={g.x + g.W * 0.62} y={water} width={g.W * 0.38} height={g.H} fill="#a8945e" />
            <Raft x={g.x + 20 * g.s} y={water + 30 * g.s} W={g.W * 0.62} s={g.s} earth={earth} />
            <Elephant x={ex} y={water + 14 * g.s} scale={g.sc * 0.58} flip walk={frame < end - 10} />
            <Warrior x={ex - 120 * g.s} y={water + 14 * g.s} scale={g.sc * 0.55} kit={LIBYAN} flip pose="walk" />
          </g>
        );
      }}
    </Panel>
  );
};

// Panic: the raft rocks, an elephant topples into the river.
const PanicScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3panic" anchor={[4.72, 44.12]} start={start} end={end} sky={["#7a90a8", "#d8dce0"]} accent={RED}>
      {(g) => {
        const water = g.ground - 80 * g.s;
        const tilt = Math.sin((frame - start) * 0.25) * 6;
        const fall = interpolate(frame, [T.fell, T.fell + 25], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const cx = g.x + g.W * 0.45;
        return (
          <g>
            <Water x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.6} color="#36607e" />
            <Raft x={cx - 170 * g.s} y={water} W={340 * g.s} s={g.s} earth={1} tilt={tilt} />
            <g transform={`rotate(${tilt},${cx},${water})`}>
              <Elephant x={cx - 40 * g.s} y={water - 18 * g.s} scale={g.sc * 0.55} phase={1} walk={false} />
            </g>
            {fall < 1 && (
              <g transform={`rotate(${-30 * fall},${cx + 170 * g.s},${water}) translate(${fall * 60 * g.s},${fall * 70 * g.s})`} opacity={1 - fall * 0.2}>
                <Elephant x={cx + 120 * g.s} y={water - 18 * g.s} scale={g.sc * 0.55} phase={3} walk={false} rider={false} />
              </g>
            )}
            {fall > 0.6 && <SwimElephant x={cx + 240 * g.s} y={water + 50 * g.s} scale={g.sc * 0.5} phase={2} />}
            {fall > 0.5 &&
              [0, 1, 2, 3].map((i) => {
                const a = interpolate(frame, [T.fell + 18 + i * 2, T.fell + 40 + i * 2], [0, 1], clamp);
                return a > 0 && a < 1 ? <circle key={i} cx={cx + (200 + i * 20) * g.s} cy={water + 20 * g.s - Math.sin(a * Math.PI) * (40 + i * 10) * g.s} r={(5 + i) * g.s} fill="#e3f1f8" opacity={1 - a} /> : null;
              })}
          </g>
        );
      }}
    </Panel>
  );
};

// The elephants swim across, trunks up.
const SwimScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3swim" anchor={[4.78, 44.14]} start={start} end={end} sky={SKY} accent={GOLD}>
      {(g) => {
        const water = g.ground - 40 * g.s;
        const m = (frame - start) * 0.9 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.ground - 200 * g.s} width={g.W} height={40 * g.s} fill="#5f7a48" />
            <Water x={g.x} y={g.ground - 160 * g.s} W={g.W} H={g.H} s={g.s * 1.4} color="#3c6f8f" />
            <SwimElephant x={g.x + g.W * 0.3 + m} y={water - 60 * g.s} scale={g.sc * 0.48} phase={1} />
            <SwimElephant x={g.x + g.W * 0.12 + m} y={water} scale={g.sc * 0.62} phase={0} />
          </g>
        );
      }}
    </Panel>
  );
};

// Roman galleys land at Massilia; legionaries come ashore.
const LandingScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3landing" anchor={PLACE.massilia} start={start} end={end} sky={SKY} accent={RED}>
    {(g) => {
      const sea = g.ground - 110 * g.s;
      return (
        <g>
          <Hills x={g.x} W={g.W} ground={sea} s={g.s} color="#8a9a70" />
          <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} />
          <Galley x={g.x + g.W * 0.22} y={sea + 60 * g.s} scale={g.sc * 0.48} row={false} />
          <Galley x={g.x + g.W * 0.6} y={sea + 30 * g.s} scale={g.sc * 0.34} phase={2} row={false} />
          <rect x={g.x + g.W * 0.62} y={g.ground - 10 * g.s} width={g.W * 0.38} height={g.H} fill="#c8b48a" />
          <Column x={g.x + g.W * 0.62} y={g.ground + 6 * g.s} W={g.W * 0.38} s={g.s} sc={g.sc} order="wwww" kits={[ROMAN]} speed={1.3} t0={start} />
        </g>
      );
    }}
  </Panel>
);

// The empty camp: cold fires, flattened ground; the Romans arrive.
const EmptyCampScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3camp" anchor={CAMP} start={start} end={end} sky={["#9ab0c2", "#e8e0cc"]} accent={RED}>
      {(g) => {
        const m = interpolate(frame, [start, start + 50], [0, 1], { ...clamp, easing: ease });
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#7a8a64" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#a49460" />
            {[0.45, 0.62, 0.8].map((fx, i) => (
              <g key={i}>
                <ellipse cx={g.x + g.W * fx} cy={g.ground - 10 * g.s + i * 8 * g.s} rx={30 * g.s} ry={8 * g.s} fill="#3a3028" />
                <Smoke x={g.x + g.W * fx} y={g.ground - 10 * g.s + i * 8 * g.s} size={20 * g.s} seed={i} wind={0.4} k={0.7} />
              </g>
            ))}
            {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.04 + i * 0.08) + m * 80 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.6} kit={ROMAN} roman pose={m < 1 ? "walk" : "stand"} phase={i} />)}
            <Consul x={g.x + g.W * 0.3 + m * 80 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.66} point={m} />
          </g>
        );
      }}
    </Panel>
  );
};

// Scipio's bold call: his army to the ships for Spain.
const SplitScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3split" anchor={PLACE.massilia} start={start} end={end} sky={SKY} accent={RED}>
    {(g) => {
      const sea = g.ground - 110 * g.s;
      return (
        <g>
          <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} />
          <rect x={g.x + g.W * 0.55} y={sea - 20 * g.s} width={g.W * 0.45} height={g.H} fill="#c8b48a" />
          <Galley x={g.x + g.W * 0.25} y={sea + 70 * g.s} scale={g.sc * 0.46} flip />
          <Column x={g.x + g.W * 0.55} y={g.ground + 6 * g.s} W={g.W * 0.45} s={g.s} sc={g.sc} order="wwww" kits={[ROMAN]} speed={1.2} t0={start} flip />
          <Consul x={g.x + g.W * 0.9} y={g.ground - 30 * g.s} scale={g.sc * 0.66} flip point={1} />
        </g>
      );
    }}
  </Panel>
);

// Galleys for Spain head west; Scipio's ship heads east for Italy.
const SailScene = ({ start, end, east }: { start: number; end: number; east: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={east ? "c3saileast" : "c3sailwest"} anchor={east ? [8.2, 43.5] : [3.6, 42.5]} start={start} end={end} sky={east ? ["#e0a870", "#f2e2c4"] : SKY} accent={RED}>
      {(g) => {
        const sea = g.ground - 150 * g.s;
        const m = (frame - start) * 1.3 * g.s * (east ? 1 : -1);
        return (
          <g>
            <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} />
            {east ? (
              <g>
                <Galley x={g.x + g.W * 0.35 + m} y={sea + 110 * g.s} scale={g.sc * 0.55} />
                <Consul x={g.x + g.W * 0.35 + m - 60 * g.s} y={sea + 110 * g.s - 30 * g.sc * 0.55} scale={g.sc * 0.5} />
              </g>
            ) : (
              [0, 1, 2].map((i) => <Galley key={i} x={g.x + g.W * (0.3 + i * 0.28) + m} y={sea + (60 + (i % 2) * 60) * g.s} scale={g.sc * (0.36 + (i % 2) * 0.1)} flip phase={i} />)
            )}
          </g>
        );
      }}
    </Panel>
  );
};

// Scipio can't believe it: the tracks lead to the mountains.
const DisbeliefScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3disbelief" anchor={[5.1, 44.6]} start={start} end={end} sky={["#9ab0c2", "#e8e0cc"]} accent={RED}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} snow={0.9} />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#a49460" />
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={g.x + g.W * (0.3 + i * 0.07)} cy={g.ground - 10 * g.s - i * 3 * g.s} rx={8 * g.s} ry={4 * g.s} fill="#6a5a3a" />)}
        <Consul x={g.x + g.W * 0.18} y={g.ground + 8 * g.s} scale={g.sc * 0.7} point={0.6} />
        <text x={g.x + g.W * 0.3} y={g.ground - 140 * g.s} textAnchor="middle" fontFamily="sans-serif" fontWeight={900} fontSize={64 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke">?!</text>
      </g>
    )}
  </Panel>
);

// The column turns into the Alps.
const IntoAlpsScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3intoalps" anchor={[5.9, 45.2]} start={start} end={end} sky={["#7f9bb8", "#e3ebf1"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 20 * g.s} s={g.s * 1.1} snow={1} />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a7a5a" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwewwhwe" speed={1.1} t0={start} />
      </g>
    )}
  </Panel>
);

export const ch3: Chapter = {
  name: "Spain to the Rhône",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(3, w, h) },
    { frame: T.tribes, cam: H(3, w, h) },
    { frame: T.left + 20, cam: view(V3.ebro, w, h, 1, 0.1) },
    { frame: T.pyr + 6, cam: view(V3.ebro, w, h, 1, 0.1) },
    { frame: T.pyrW + 20, cam: view(V3.pyr, w, h, 1, 0.1) },
    { frame: B.pyrenees.end - 6, cam: view(V3.pyr, w, h, 1, 0.1) },
    { frame: T.september + 20, cam: view(V3.rhone, w, h, 1, 0.1) },
    { frame: T.hanno, cam: view(V3.rhone, w, h, 1, 0.1) },
    { frame: T.upstream + 24, cam: view(V3.cross, w, h, 1, 0.1) },
    { frame: T.scipio, cam: view(V3.cross, w, h, 1, 0.1) },
    { frame: T.massilia + 10, cam: view(V3.massilia, w, h, 1, 0.1) },
    { frame: T.brother + 30, cam: view(V3.massilia, w, h, 1, 0.1) },
    { frame: T.sentA + 20, cam: view(V3.sea, w, h, 1, 0.1) },
    { frame: T.believe, cam: view(V3.sea, w, h, 1, 0.1) },
    { frame: to - 1, cam: H(4, w, h) },
  ],
  years: [[from, "218 BC"], [T.september, "Sept 218 BC"]],
  heads: [
    { f: T.ebro, tag: "North of the Ebro", head: "Fought all the way", color: GOLD },
    { f: T.left, tag: "North of the Ebro", head: "Men left behind", color: GOLD, chips: [{ text: "10,000 + 1,000 left", f: T.left + 8 }, { text: "~11,000 sent home", f: T.home }] },
    { f: T.pyr, tag: "The Pyrenees", head: "Over the mountains", stat: (f: number) => (f < T.fifty ? "" : "~59,000"), label: "50,000 foot + 9,000 horse", color: GOLD, chips: [{ text: "Polybius", f: T.polybius }] },
    { f: T.rhone, tag: "Late September", head: "The Rhône", color: GOLD, chips: [{ text: "Fast and wide", f: T.fast }] },
    { f: T.far, tag: "The far bank · approx.", head: "The Volcae wait", color: GREEN, chips: [{ text: "A Gaulish tribe", f: T.gaulish }] },
    { f: T.hanno, tag: "The flank", head: "Hanno goes upstream", color: GOLD, chips: [{ text: "Night · rafts", f: T.night }, { text: "Behind the Gauls", f: T.behindG }] },
    { f: T.smoke, tag: "Smoke signal", head: "Attack from both sides", color: GOLD, chips: [{ text: "The Gauls run", f: T.broke }] },
    { f: T.rafts, tag: "The elephants", head: "Rafts covered with earth", stat: "37", label: "elephants to cross", color: GOLD, chips: [{ text: "Looks like land", f: T.earth }] },
    { f: T.panic, tag: "On the river", head: "Panic", color: RED, chips: [{ text: "Drivers drowned", f: T.drivers }, { text: "The elephants swam", f: T.swam }] },
    { f: T.scipio, tag: "Rome reacts", head: "Scipio lands at Massilia", color: RED, chips: [{ text: "3 days late", f: T.late }] },
    { f: T.brother, tag: "A bold call", head: "Scipio splits his army", color: RED, chips: [{ text: "Army → Spain", f: T.spain }, { text: "Scipio → Italy", f: T.italy }] },
    { f: T.turn, tag: "Scipio can't believe it", head: "Not Spain. Not the coast.", color: RED },
    { f: T.he, tag: "Hannibal's road", head: "Into the Alps", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ebro = interpolate(frame, [T.ebro, T.ebro + 14, T.pyr, T.pyr + 20], [0, 1, 1, 0], clamp);
    const rhone = interpolate(frame, [T.rhoneW - 8, T.rhoneW + 8, T.scipio, T.scipio + 30], [0, 1, 1, 0.3], clamp) * interpolate(frame, [T.brother, T.brother + 20], [1, 0], clamp);
    return (
      <g>
        <HiRiver name="Ebro" k={ebro} />
        <HiRiver name="Rhône" k={rhone} />
        <Labels />
        <Volcae />
        <Flank />
        <Scipio />
        <Turn />
      </g>
    );
  },
  Panels: () => (
    <g>
      <FightScene start={T.ebro + 10} end={T.left + 14} />
      <GarrisonScene start={T.left} end={T.sent + 14} />
      <HomeScene start={T.sent} end={T.pyr + 14 + 14} />
      <PyreneesScene start={T.pyr + 14} end={T.rhone + 12 + 14} />
      <RiverScene start={T.rhone + 12} end={T.far + 14} />
      <FarBankScene start={T.far} end={T.hanno + 14} />
      <UpstreamScene start={T.hanno} end={T.crossed + 14} />
      <NightRaftScene start={T.crossed} end={T.smokeW - 4 + 14} />
      <SmokeScene start={T.smokeW - 4} end={T.main + 14} />
      <BoatsScene start={T.main} end={T.both + 20 + 14} />
      <FleeScene start={T.both + 20} end={T.elephants + 14} />
      <BuildScene start={T.elephants} end={T.covered + 14} />
      <EarthRaftScene start={T.covered} end={T.panic + 8 + 14} />
      <PanicScene start={T.panic + 8} end={T.drivers + 14} />
      <SwimScene start={T.drivers} end={T.scipio + 6 + 14} />
      <LandingScene start={T.scipio + 6} end={T.reached + 14} />
      <EmptyCampScene start={T.reached} end={T.brother + 14} />
      <SplitScene start={T.brother} end={T.sentA + 14} />
      <SailScene start={T.sentA} end={T.hurried + 14} east={false} />
      <SailScene start={T.hurried} end={T.turn + 14} east />
      <DisbeliefScene start={T.turn} end={T.he + 14} />
      <IntoAlpsScene start={T.he} end={to + 16} />
    </g>
  ),
  sfx: [
    [T.left, SFX.pop, 0.35],
    [T.home, SFX.pop, 0.3],
    [T.pyrW, SFX.whoosh, 0.35],
    [T.fifty, SFX.hit, 0.4],
    [T.september, SFX.whoosh, 0.4],
    [T.far, SFX.pop, 0.35],
    [T.upstream, SFX.whoosh, 0.3],
    [T.smokeW, SFX.pop, 0.35],
    [T.main, SFX.whoosh, 0.35],
    [T.broke, SFX.hit, 0.4],
    [T.elephants, SFX.pop, 0.35],
    [T.fell, SFX.hit, 0.35],
    [T.massilia, SFX.whoosh, 0.35],
    [T.late, SFX.hit, 0.4],
    [T.sentA + 4, SFX.whoosh, 0.35],
    [T.spainT + 4, SFX.pop, 0.3],
    [T.coast + 4, SFX.pop, 0.3],
    [T.alps, SFX.hit, 0.45],
  ],
};
