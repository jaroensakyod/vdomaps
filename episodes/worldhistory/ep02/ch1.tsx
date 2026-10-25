import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, IBERIAN, LIBYAN, ROMAN, Warrior } from "../kit/Ancient";
import { Altar, Banner, Chest, CityWall, Coin, Columns, CrossOut, Galley, General, Horseman, Houses, Ladder, MedArea, MedLandClip, MineMouth, PanelTag, PURPLE, Robed, SiegeRing, SilverPile } from "../kit/AncientA";
import { clamp, display, font, GOLD, Panel, Pin, RED, view, type Chapter } from "../kit/news";
import { Water } from "../kit/Period";
import { Hills } from "../kit/PeriodA";
import { MapChip } from "../kit/PeriodC";
import { PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 1 "A score to settle" (punic → war), 264 → 218 BC: Rome and Carthage, the First Punic War, the price
// of defeat, the Barcid empire in Spain, the oath, Hannibal in command, Saguntum, and Rome declares war.
const [from, to] = span("ch1");

const T = {
  punic: B.punic.start,
  rome: wf("punic", "Rome", 0.36),
  carthage: wf("punic", "Carthage", 0.46),
  firstwar: B.firstwar.start,
  from264: wf("firstwar", "From", 0.02),
  bc241: wf("firstwar", "BC", 0.3),
  fought: wf("firstwar", "fought", 0.33),
  first: wf("firstwar", "First", 0.39),
  sea: wf("firstwar", "sea.", 0.61),
  won: wf("firstwar", "won,", 0.76),
  lost: wf("firstwar", "lost", 0.9),
  sicily: wf("firstwar", "Sicily.", 0.92),
  indemnity: B.indemnity.start,
  pay: wf("indemnity", "pay", 0.13),
  n3200: wf("indemnity", "three-", 0.16),
  talents: wf("indemnity", "talents", 0.3),
  silver: wf("indemnity", "silver.", 0.5),
  then: wf("indemnity", "Then", 0.5),
  sardinia: wf("indemnity", "Sardinia", 0.64),
  corsica: wf("indemnity", "Corsica", 0.74),
  demanded: wf("indemnity", "demanded", 0.9),
  more: wf("indemnity", "more.", 0.97),
  unjust: B.unjust.start,
  polybius: wf("unjust", "Polybius,", 0.06),
  greek: wf("unjust", "Greek", 0.18),
  admired: wf("unjust", "admired", 0.4),
  grab: wf("unjust", "grab", 0.7),
  unjustW: wf("unjust", "unjust.", 0.88),
  hamilcar: B.hamilcar.start,
  general: wf("hamilcar", "general,", 0.15),
  barca: wf("hamilcar", "Hamilcar", 0.25),
  west: wf("hamilcar", "west", 0.46),
  spain: wf("hamilcar", "Spain", 0.51),
  empire: wf("hamilcar", "empire,", 0.66),
  rich: wf("hamilcar", "rich", 0.79),
  silverH: wf("hamilcar", "silver", 0.88),
  soldiers: wf("hamilcar", "soldiers.", 0.93),
  newcarthage: B.newcarthage.start,
  founded: wf("newcarthage", "founded", 0.14),
  nc: wf("newcarthage", "New", 0.55),
  cartagena: wf("newcarthage", "Cartagena.", 0.9),
  oath: B.oath.start,
  story: wf("oath", "story", 0.03),
  nine: wf("oath", "nine-", 0.17),
  swear: wf("oath", "swear", 0.32),
  never: wf("oath", "never", 0.41),
  hannibal: wf("oath", "Hannibal.", 0.94),
  command: B.command.start,
  n221: wf("command", "two-", 0.1),
  hannibalC: wf("command", "Hannibal", 0.25),
  took: wf("command", "took", 0.39),
  n26: wf("command", "about", 0.87),
  saguntum: B.saguntum.start,
  later: wf("saguntum", "later", 0.12),
  besieged: wf("saguntum", "besieged", 0.2),
  sagW: wf("saguntum", "Saguntum,", 0.29),
  allied: wf("saguntum", "allied", 0.54),
  fell: wf("saguntum", "fell", 0.8),
  eight: wf("saguntum", "eight", 0.87),
  war: B.war.start,
  declared: wf("war", "declared", 0.12),
  warW: wf("war", "war.", 0.5),
  second: wf("war", "Second", 0.55),
  next: wf("seapower", "expected", 0.1), // ch2's first panel
};

const V1 = {
  centre: bbox([[5, 35.8], [19, 43]]),
  sicily: bbox([[8, 35.8], [18, 42.4]]),
  west: bbox([[-8, 34.5], [12, 41.5]]),
  spain: bbox([[-5, 36.4], [2, 40.8]]),
};

// Approximate areas (hand-drawn, loose at sea, clipped to land). Always shown with "approx.".
const AREA: Record<string, [number, number][]> = {
  rome: [[10.1, 44.0], [12.6, 44.15], [13.8, 43.4], [15.0, 42.1], [16.4, 41.9], [18.7, 40.4], [18.6, 39.6], [17.0, 38.6], [16.4, 37.75], [15.66, 37.85], [15.72, 38.45], [15.9, 39.1], [15.5, 40.1], [14.2, 40.7], [12.5, 41.5], [11.0, 42.3], [10.0, 43.2]],
  africa: [[-2.2, 35.4], [0.2, 36.4], [3.2, 37.2], [8.0, 37.4], [9.8, 37.7], [11.3, 37.2], [11.6, 36.0], [11.4, 34.5], [10.6, 33.2], [12.2, 32.8], [15.6, 31.9], [15.2, 30.9], [11.0, 31.7], [9.2, 33.0], [8.0, 34.0], [3.0, 34.6], [-2.2, 34.6]],
  sicilyW: [[12.1, 37.3], [12.1, 38.4], [13.4, 38.4], [13.9, 37.9], [13.7, 37.0], [12.4, 37.3]],
  sicily: [[12.1, 37.3], [12.1, 38.4], [15.75, 38.4], [15.75, 36.5], [14.6, 36.55], [12.4, 37.3]],
  sardinia: [[7.9, 38.75], [7.9, 41.3], [10.0, 41.3], [10.0, 38.75]],
  corsica: [[8.3, 41.33], [8.3, 43.1], [9.8, 43.1], [9.8, 41.33]],
  barcid: [[-7.6, 37.2], [-6.2, 36.0], [-5.4, 35.9], [-2.0, 36.6], [-0.6, 37.5], [0.4, 38.7], [-0.4, 39.45], [-1.6, 40.2], [-3.8, 40.4], [-6.0, 39.4], [-7.5, 38.4]],
};
const GADES: [number, number] = [-6.29, 36.53];

const show = (frame: number, f0: number, f1: number, fade = 10) => interpolate(frame, [f0, f0 + fade, f1 - fade, f1], [0, 1, 1, 0], clamp);
const ramp = (frame: number, f0: number, f1: number) => interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const pop = (frame: number, f: number) => (frame < f ? 0 : spring({ frame: frame - f, fps: 30, config: { damping: 12 } }));

// Rome (red) and Carthage (purple, gold edge); Sicily, then Sardinia and Corsica, flip to Rome; the Barcid area grows in Spain.
const Areas = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [T.war + 20, to + 24], [1, 0], clamp);
  const rome = ramp(frame, T.rome + 4, T.rome + 24);
  const carth = ramp(frame, T.carthage + 4, T.carthage + 24);
  const sic = ramp(frame, T.sicily - 4, T.sicily + 14);
  const sar = ramp(frame, T.sardinia, T.sardinia + 14);
  const cor = ramp(frame, T.corsica, T.corsica + 14);
  const grow = interpolate(frame, [T.empire - 10, T.soldiers + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <g opacity={out}>
      <MedLandClip id="c1land" />
      <MedArea ring={AREA.rome} color={RED} k={rome} clip="c1land" />
      <MedArea ring={AREA.africa} color={PURPLE} edge={GOLD} k={carth} clip="c1land" />
      <MedArea ring={AREA.sicilyW} color={PURPLE} edge={GOLD} k={carth * (1 - sic)} clip="c1land" />
      <MedArea ring={AREA.sicily} color={RED} k={sic} clip="c1land" />
      <MedArea ring={AREA.sardinia} color={PURPLE} edge={GOLD} k={carth * (1 - sar)} clip="c1land" />
      <MedArea ring={AREA.sardinia} color={RED} k={sar} clip="c1land" />
      <MedArea ring={AREA.corsica} color={PURPLE} edge={GOLD} k={carth * (1 - cor)} clip="c1land" />
      <MedArea ring={AREA.corsica} color={RED} k={cor} clip="c1land" />
      <MedArea ring={AREA.barcid} color={PURPLE} edge={GOLD} fill={0.3} k={grow > 0 ? 1 : 0} grow={grow} from={GADES} clip="c1land" />
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const s1 = (f0: number, f1: number) => show(frame, f0, f1);
  return (
    <g>
      <Pin at={PLACE.rome} text="Rome" k={s1(T.rome - 4, T.first)} size={0.95} />
      <Pin at={PLACE.rome} text="Rome" k={s1(T.sardinia, T.west + 30)} size={0.95} />
      <Pin at={PLACE.carthage} text="Carthage" k={s1(T.carthage - 4, T.nc)} color={PURPLE} size={0.95} />
      <MapChip at={[12.4, 39.4]} text="War at sea" k={pop(frame, T.sea - 6) * show(frame, T.sea - 6, T.lost + 10)} color={GOLD} textColor="#1b1d24" size={0.8} />
      <Pin at={PLACE.sicily} text="Sicily" k={s1(T.sicily - 6, T.indemnity + 40)} size={0.8} dy={58} />
      <Pin at={PLACE.sardinia} text="Sardinia" k={s1(T.sardinia - 4, T.unjust + 20)} size={0.8} dy={-28} />
      <Pin at={PLACE.sardinia} text="Sardinia" k={s1(T.grab - 6, T.hamilcar + 10)} size={0.8} dy={-28} />
      <Pin at={PLACE.corsica} text="Corsica" k={s1(T.corsica - 4, T.unjust + 20)} size={0.8} dy={-28} />
      <Pin at={PLACE.newcarthage} text="New Carthage" k={s1(T.nc - 4, T.war + 40)} color={GOLD} size={0.9} />
      <MapChip at={PLACE.newcarthage} text="today: Cartagena" k={pop(frame, T.cartagena) * show(frame, T.cartagena, T.command + 10)} color={GOLD} textColor="#1b1d24" dy={-110} size={0.8} />
      <MapChip at={PLACE.newcarthage} text="Hannibal" k={pop(frame, T.took) * show(frame, T.took, T.saguntum + 20)} color={GOLD} textColor="#1b1d24" dy={-110} size={0.8} />
      <Pin at={PLACE.saguntum} text="Saguntum" k={s1(T.sagW - 6, T.war + 40)} size={0.9} />
      <MapChip at={PLACE.saguntum} text="ally of Rome" k={pop(frame, T.allied) * show(frame, T.allied, T.war + 10)} color={RED} dx={190} size={0.75} />
      <SiegeRing at={PLACE.saguntum} k={interpolate(frame, [T.besieged, T.sagW + 20], [0, 1], clamp) * show(frame, T.besieged - 2, T.war + 10, 6)} color={GOLD} />
      <CrossOut at={PLACE.saguntum} k={interpolate(frame, [T.fell, T.fell + 10], [0, 1], clamp) * show(frame, T.fell - 1, T.war + 10, 2)} size={30} color={GOLD} />
      <Pin at={PLACE.rome} text="Rome" k={s1(T.war + 30, to + 20)} size={0.9} />
      <Pin at={PLACE.carthage} text="Carthage" k={s1(T.war + 30, to + 20)} color={PURPLE} size={0.9} />
    </g>
  );
};

// Hamilcar's move west, and the war arrows at the end.
const Arrows = () => {
  const frame = useCurrentFrame();
  const o = show(frame, T.west - 4, T.newcarthage + 20);
  const w = show(frame, T.declared - 4, to + 20);
  return (
    <g>
      <Arrow points={[PLACE.carthage, [6, 37.6], [1.5, 36.7], [-3, 36.3], [-5.6, 36.45]]} start={T.west - 2} end={T.spain + 30} color={GOLD} width={24} opacity={o} />
      <Arrow points={[PLACE.rome, [10.5, 40.6], [6, 39.7], [2.6, 39.4]]} start={T.declared} end={T.warW + 6} color={RED} width={24} opacity={w} outline="#3a0d0a" />
      <Arrow points={[PLACE.newcarthage, [2, 38.4], [6, 39.0]]} start={T.warW - 4} end={T.second + 10} color={GOLD} width={24} opacity={w} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

const DAY: [string, string] = ["#6fa3d6", "#f0e6c4"];
const SEA: [string, string] = ["#5f93c4", "#dfe9ee"];

// Rome vs Carthage: a legionary and a Carthaginian, each under a banner.
const PowersScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const r = ramp(frame, T.rome - 4, T.rome + 10);
  const c = ramp(frame, T.carthage - 4, T.carthage + 10);
  return (
    <Panel id="c1powers" anchor={[11.4, 39.5]} start={start} end={end} sky={DAY} accent={GOLD}>
      {(g) => (
        <g>
          <Water x={g.x} y={g.ground - 70 * g.s} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
          <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.25} ${g.ground - 60 * g.s} ${g.x + g.W * 0.42} ${g.ground - 10 * g.s} L${g.x + g.W * 0.42} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#b9a46a" />
          <path d={`M${g.x + g.W} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.75} ${g.ground - 60 * g.s} ${g.x + g.W * 0.58} ${g.ground - 10 * g.s} L${g.x + g.W * 0.58} ${g.y + g.H} L${g.x + g.W} ${g.y + g.H} Z`} fill="#d4b47a" />
          <Warrior x={g.x + g.W * 0.3} y={g.ground + 6 * g.s} scale={g.sc * 0.9} kit={ROMAN} roman pose="stand" />
          <Warrior x={g.x + g.W * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.9} kit={LIBYAN} pose="stand" flip />
          <g opacity={r}>
            <Banner x={g.x + g.W * 0.1} y={g.ground + 4 * g.s} s={g.s} color={RED} />
            <text x={g.x + g.W * 0.32} y={g.y + 80 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={46 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke">ROME</text>
          </g>
          <g opacity={c}>
            <Banner x={g.x + g.W * 0.82} y={g.ground + 4 * g.s} s={g.s} color={PURPLE} phase={2} />
            <text x={g.x + g.W * 0.78} y={g.y + 80 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={46 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke">CARTHAGE</text>
          </g>
          <text x={g.cx} y={g.ground - 100 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={64 * g.s} fill={GOLD} stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke" opacity={ramp(frame, T.carthage, T.carthage + 10)}>VS</text>
        </g>
      )}
    </Panel>
  );
};

// Lines of legionaries and Carthaginians close in (the war on land).
const LandFightScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const m = Math.min(1, Math.max(0, frame - start) / 90) * 130;
  return (
    <Panel id="c1fight" anchor={PLACE.sicily} start={start} end={end} sky={["#8fb2d0", "#efe2c0"]} accent={RED}>
      {(g) => (
        <g>
          <Hills x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#8a9a5a" />
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#c2ad78" />
          {[0, 1, 2, 3].map((i) => <Warrior key={`r${i}`} x={g.x + g.W * 0.04 + i * 62 * g.s + m * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.7} kit={ROMAN} roman pose="charge" phase={i} />)}
          {[0, 1, 2, 3].map((i) => <Warrior key={`c${i}`} x={g.x + g.W * 0.96 - i * 62 * g.s - m * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.7} kit={i % 2 ? IBERIAN : LIBYAN} pose="charge" flip phase={i * 1.4} />)}
          <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="264 – 241 BC" k={pop(frame, start + 6)} />
        </g>
      )}
    </Panel>
  );
};

// Galleys ramming: a Roman galley drives its ram into a Carthaginian one.
const RamScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const hit = start + 30;
  const t = interpolate(frame, [start, hit], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const crash = interpolate(frame, [hit, hit + 12], [0, 1], clamp);
  return (
    <Panel id="c1ram" anchor={[12.4, 39.0]} start={start} end={end} sky={SEA} accent={GOLD}>
      {(g) => {
        const sea = g.ground - 70 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f6a92" />
            <Galley x={g.x + g.W * 0.95} y={sea + 14 * g.s} scale={g.sc * 0.45} sail={RED} flip phase={3} />
            <Galley x={g.x + g.W * 0.7} y={sea + 44 * g.s} scale={g.sc * 0.95} sail={PURPLE} flip crash={crash} row={crash < 0.5} phase={1} />
            <Galley x={g.x + g.W * (0.08 + 0.24 * t)} y={sea + 56 * g.s} scale={g.sc * 1.0} sail={RED} />
            {crash > 0 && crash < 1 && <circle cx={g.x + g.W * 0.55} cy={sea + 30 * g.s} r={70 * g.s * crash} fill="#fff" opacity={0.6 * (1 - crash)} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Sicily goes to Rome: a red banner on the shore; a Carthaginian galley rows away.
const SicilyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const away = Math.max(0, frame - start) * 1.2;
  const up = ramp(frame, start + 6, start + 26);
  return (
    <Panel id="c1sicily" anchor={PLACE.sicily} start={start} end={end} sky={DAY} accent={RED}>
      {(g) => {
        const sea = g.ground - 60 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
            <Galley x={g.x + g.W * 0.72 + away * g.s} y={sea + 30 * g.s} scale={g.sc * 0.6} sail={PURPLE} phase={2} />
            <path d={`M${g.x} ${g.ground - 30 * g.s} Q${g.x + g.W * 0.3} ${g.ground - 80 * g.s} ${g.x + g.W * 0.55} ${g.ground} L${g.x + g.W * 0.55} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#c9b07a" />
            <g transform={`translate(0,${(1 - up) * 140 * g.s})`}>
              <Banner x={g.x + g.W * 0.3} y={g.ground - 46 * g.s} s={g.s} color={RED} />
            </g>
            {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.08 + i * 0.13)} y={g.ground - (i === 1 ? 34 : 14) * g.s} scale={g.sc * 0.7} kit={ROMAN} roman pose="stand" phase={i} />)}
            <PanelTag x={g.x + g.W * 0.72} y={g.y + 50 * g.s} s={g.s} text="SICILY → ROME" color={RED} k={pop(frame, T.sicily)} />
          </g>
        );
      }}
    </Panel>
  );
};

// The price of defeat: chests of silver; the pile grows with the counter.
const SilverScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [T.n3200, T.silver + 10], [0.15, 1], clamp);
  return (
    <Panel id="c1silver" anchor={PLACE.carthage} start={start} end={end} sky={["#4a3a5a", "#c9a46a"]} accent={GOLD}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.05} W={g.W * 0.9} ground={g.ground - 20 * g.s} s={g.s} n={7} h={200} color="#cbbfa4" />
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a7458" />
          <Chest x={g.x + g.W * 0.2} y={g.ground + 4 * g.s} s={g.s * 1.1} open={ramp(frame, start + 10, start + 30)} />
          <Chest x={g.x + g.W * 0.8} y={g.ground + 4 * g.s} s={g.s * 1.1} open={ramp(frame, T.talents, T.talents + 20)} />
          <SilverPile x={g.cx} y={g.ground + 4 * g.s} s={g.s * 2.4} k={k} />
          {[0, 1, 2].map((i) => {
            const cyc = (((frame - start + i * 20) % 60) + 60) % 60 / 60;
            return <Coin key={i} x={g.cx + (i - 1) * 120 * g.s} y={g.y + 70 * g.s + cyc * 140 * g.s} r={26 * g.s} turn={cyc * 2} />;
          })}
        </g>
      )}
    </Panel>
  );
};

// "...and demanded more": a Roman envoy with a scroll; Carthaginians carry another chest.
const DemandScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const more = ramp(frame, T.demanded - 4, T.more + 6);
  return (
    <Panel id="c1demand" anchor={PLACE.sardinia} start={start} end={end} sky={["#7aa0c8", "#efe2c0"]} accent={RED}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.55} W={g.W * 0.42} ground={g.ground - 20 * g.s} s={g.s} n={4} h={210} />
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#b9a47a" />
          <Robed x={g.x + g.W * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.95} flip robe="#f1ece0" cloak={RED} hold="scroll" skin="#e2b48e" />
          <Robed x={g.x + g.W * 0.86} y={g.ground + 6 * g.s} scale={g.sc * 0.85} flip robe="#f1ece0" cloak={RED} skin="#e2b48e" phase={2} />
          <Chest x={g.x + g.W * 0.5} y={g.ground + 4 * g.s} s={g.s} open={1} />
          <g transform={`translate(${(1 - more) * -260 * g.s},0)`} opacity={more}>
            <Chest x={g.x + g.W * 0.32} y={g.ground + 4 * g.s} s={g.s} />
            <Robed x={g.x + g.W * 0.18} y={g.ground + 6 * g.s} scale={g.sc * 0.85} robe="#b9a6d6" shade="#9a86b8" hold="point" />
          </g>
          <PanelTag x={g.x + g.W * 0.3} y={g.y + 100 * g.s} s={g.s} text="SARDINIA + CORSICA" color={RED} k={pop(frame, T.corsica)} size={28} />
          <PanelTag x={g.x + g.W * 0.75} y={g.y + 50 * g.s} s={g.s} text="MORE!" color={RED} size={34} k={pop(frame, T.more - 4)} />
        </g>
      )}
    </Panel>
  );
};

// Polybius, a Greek historian, writing; "UNJUST" stamps onto the scroll.
const PolybiusScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const stamp = interpolate(frame, [T.unjustW, T.unjustW + 8], [2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <Panel id="c1polybius" anchor={PLACE.sardinia} start={start} end={end} sky={["#3a3226", "#9a8460"]} accent={GOLD}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.04} W={g.W * 0.4} ground={g.ground - 10 * g.s} s={g.s} n={3} h={230} color="#cfc4aa" />
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#6b5a40" />
          <Robed x={g.x + g.W * 0.26} y={g.ground + 6 * g.s} scale={g.sc * 1.05} robe="#eef0f2" shade="#c9ced6" beard hold="scroll" skin="#e2b48e" />
          <g transform={`translate(${g.x + g.W * 0.68},${g.y + g.H * 0.55})`}>
            <rect x={-150 * g.s} y={-90 * g.s} width={300 * g.s} height={180 * g.s} fill="#efe3c2" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            <rect x={-162 * g.s} y={-96 * g.s} width={20 * g.s} height={192 * g.s} rx={10 * g.s} fill="#c9a46a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            <rect x={142 * g.s} y={-96 * g.s} width={20 * g.s} height={192 * g.s} rx={10 * g.s} fill="#c9a46a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-120 * g.s} ${(-60 + i * 28) * g.s} h${(200 + (i % 2) * 40) * Math.min(1, Math.max(0, frame - start) / (20 + i * 12)) * g.s}`} stroke="#7a5a3a" strokeWidth={4 * g.s} />)}
            {frame >= T.unjustW && (
              <g transform={`scale(${stamp}) rotate(-8)`} opacity={Math.min(1, 3 - stamp)}>
                <rect x={-120 * g.s} y={-36 * g.s} width={240 * g.s} height={72 * g.s} rx={8 * g.s} fill="rgba(239,227,194,0.85)" stroke={RED} strokeWidth={7 * g.s} />
                <text y={18 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={52 * g.s} fill={RED}>UNJUST</text>
              </g>
            )}
          </g>
          <PanelTag x={g.x + g.W * 0.27} y={g.y + 100 * g.s} s={g.s} text="POLYBIUS · GREEK" k={pop(frame, T.greek)} size={26} />
        </g>
      )}
    </Panel>
  );
};

// Hamilcar Barca points west from the beach; purple-sailed galleys put out.
const HamilcarScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const sail = Math.max(0, frame - T.west) * 1.3;
  return (
    <Panel id="c1hamilcar" anchor={PLACE.carthage} start={start} end={end} sky={["#e8a060", "#f6e2b6"]} accent={GOLD}>
      {(g) => {
        const sea = g.ground - 80 * g.s;
        return (
          <g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
            <Galley x={g.x + g.W * 0.3 - sail * g.s} y={sea + 30 * g.s} scale={g.sc * 0.6} sail={PURPLE} flip />
            <Galley x={g.x + g.W * 0.54 - sail * g.s} y={sea + 56 * g.s} scale={g.sc * 0.7} sail={PURPLE} flip phase={2} />
            <path d={`M${g.x + g.W * 0.6} ${g.y + g.H} L${g.x + g.W * 0.66} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.85} ${g.ground - 50 * g.s} ${g.x + g.W} ${g.ground - 40 * g.s} L${g.x + g.W} ${g.y + g.H} Z`} fill="#d4b47a" />
            <General x={g.x + g.W * 0.8} y={g.ground - 26 * g.s} scale={g.sc * 1.0} flip raise={0.55} cloak="#5a2a7a" />
            <Warrior x={g.x + g.W * 0.92} y={g.ground - 22 * g.s} scale={g.sc * 0.8} kit={LIBYAN} pose="stand" flip phase={1} />
            <PanelTag x={g.x + g.W * 0.25} y={g.y + 100 * g.s} s={g.s} text="← TO SPAIN" k={pop(frame, T.west)} />
            <PanelTag x={g.x + g.W * 0.72} y={g.y + 46 * g.s} s={g.s} text="HAMILCAR BARCA" k={pop(frame, T.barca)} size={26} />
          </g>
        );
      }}
    </Panel>
  );
};

// Spain: a silver mine, then Iberian soldiers arrive.
const MineScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const m = Math.max(0, frame - T.soldiers + 10) * 1.6;
  return (
    <Panel id="c1mine" anchor={[-3.5, 37.6]} start={start} end={end} sky={["#7fa6c8", "#f2dcae"]} accent={GOLD}>
      {(g) => (
        <g>
          <MineMouth x={g.x + g.W * 0.32} y={g.ground - 10 * g.s} s={g.s} glint={ramp(frame, T.silverH - 6, T.silverH + 6)} />
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#a88a5a" />
          <Robed x={g.x + g.W * 0.08} y={g.ground + 6 * g.s} scale={g.sc * 0.75} robe="#cfc0a0" shade="#a8987a" hold="scroll" phase={1} />
          {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W + 40 * g.s - m * g.s + i * 80 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.72} kit={i % 2 ? LIBYAN : IBERIAN} flip phase={i} />)}
          <PanelTag x={g.x + g.W * 0.78} y={g.y + 46 * g.s} s={g.s} text="SILVER" k={pop(frame, T.silverH)} />
          <PanelTag x={g.x + g.W * 0.78} y={g.y + 104 * g.s} s={g.s} text="SOLDIERS" k={pop(frame, T.soldiers)} />
        </g>
      )}
    </Panel>
  );
};

// New Carthage: a walled harbour town on hills above the bay.
const HarbourScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const build = ramp(frame, start + 4, T.nc + 10);
  return (
    <Panel id="c1harbour" anchor={PLACE.newcarthage} start={start} end={end} sky={["#6fa3d6", "#f4e6c8"]} accent={GOLD}>
      {(g) => {
        const sea = g.ground - 40 * g.s;
        return (
          <g>
            <path d={`M${g.x} ${sea} Q${g.x + g.W * 0.4} ${g.y + 90 * g.s} ${g.x + g.W} ${sea - 30 * g.s} L${g.x + g.W} ${sea} Z`} fill="#b9a06a" />
            <g transform={`translate(0,${(1 - build) * 60 * g.s})`} opacity={build}>
              <Houses x={g.x + g.W * 0.2} y={sea - 70 * g.s} W={g.W * 0.6} s={g.s * 0.9} n={8} />
              <CityWall x={g.x + g.W * 0.12} y={sea} W={g.W * 0.76} s={g.s * 0.7} h={90} towers={4} />
            </g>
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f78a0" />
            <Galley x={g.x + g.W * 0.2} y={sea + 50 * g.s} scale={g.sc * 0.55} sail={PURPLE} row={false} furl={1} />
            <Galley x={g.x + g.W * 0.78} y={sea + 60 * g.s} scale={g.sc * 0.6} sail={PURPLE} flip phase={2} />
            <PanelTag x={g.cx} y={g.y + 44 * g.s} s={g.s} text="NEW CARTHAGE" k={pop(frame, T.nc)} />
            <PanelTag x={g.cx} y={g.y + 102 * g.s} s={g.s} text="today: Cartagena" size={26} k={pop(frame, T.cartagena)} />
          </g>
        );
      }}
    </Panel>
  );
};

// The oath: father and nine-year-old son at an altar.
const OathScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const flare = 1 + ramp(frame, T.swear - 4, T.swear + 10) * 0.5;
  return (
    <Panel id="c1oath" anchor={PLACE.newcarthage} start={start} end={end} sky={["#2a2238", "#8a5a48"]} accent={GOLD}>
      {(g) => (
        <g>
          <Columns x={g.x + g.W * 0.12} W={g.W * 0.76} ground={g.ground - 10 * g.s} s={g.s} n={6} h={240} color="#a8987e" />
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a4a3a" />
          <circle cx={g.cx} cy={g.ground - 120 * g.s} r={140 * g.s * flare} fill="#ff9a3a" opacity={0.22} style={{ filter: `blur(${20 * g.s}px)` }} />
          <Altar x={g.cx} y={g.ground + 4 * g.s} s={g.s * 1.1} fire={flare} />
          <Robed x={g.cx - 170 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 1.1} robe="#6a3a7a" shade="#4f2a5c" beard hold="raise" />
          <Robed x={g.cx + 110 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 1.1} flip child robe="#efe6d2" hold={frame >= T.swear ? "point" : "none"} phase={1} />
          <PanelTag x={g.cx + 112 * g.s} y={g.ground - 140 * g.s} s={g.s} text="AGE 9" size={26} k={pop(frame, T.nine)} />
          <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="“NEVER A FRIEND OF ROME”" size={28} color={RED} k={frame < T.hannibal - 4 ? pop(frame, T.never) : 0} />
          <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text="HANNIBAL" size={40} k={pop(frame, T.hannibal - 4)} />
        </g>
      )}
    </Panel>
  );
};

// Hannibal in command: the young general raises his sword before his troops.
const CommandScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const raise = ramp(frame, T.took, T.took + 20);
  return (
    <Panel id="c1command" anchor={PLACE.newcarthage} start={start} end={end} sky={["#7fa6c8", "#f2dcae"]} accent={GOLD}>
      {(g) => (
        <g>
          <Hills x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#a08a5a" />
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#c2a46e" />
          <Elephant x={g.x + g.W * 0.12} y={g.ground - 22 * g.s} scale={g.sc * 0.42} walk={false} phase={1} />
          <Horseman x={g.x + g.W * 0.3} y={g.ground - 16 * g.s} scale={g.sc * 0.55} gait="stand" phase={2} />
          {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W * (0.42 + i * 0.07)} y={g.ground + (i % 2 ? 2 : 8) * g.s} scale={g.sc * 0.65} kit={i % 2 ? IBERIAN : LIBYAN} pose="stand" phase={i} />)}
          <General x={g.x + g.W * 0.84} y={g.ground + 8 * g.s} scale={g.sc * 1.05} flip raise={raise} />
          <PanelTag x={g.x + g.W * 0.8} y={g.y + 46 * g.s} s={g.s} text="HANNIBAL · ~26" size={28} k={pop(frame, T.n26)} />
        </g>
      )}
    </Panel>
  );
};

// Saguntum under siege: ladders against the walls; when it falls, a Carthaginian banner goes up.
const SiegeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const dmg = interpolate(frame, [start, T.fell], [0, 1], clamp);
  const up = ramp(frame, T.fell, T.fell + 18);
  return (
    <Panel id="c1siege" anchor={PLACE.saguntum} start={start} end={end} sky={["#8a7a6a", "#e8cfa0"]} accent={RED}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#a88a5a" />
          <CityWall x={g.x + g.W * 0.45} y={g.ground - 10 * g.s} W={g.W * 0.6} s={g.s} h={130} towers={2} gate={false} damage={dmg} />
          <Ladder x={g.x + g.W * 0.4} y={g.ground} s={g.s} h={140} lean={50} />
          <Ladder x={g.x + g.W * 0.66} y={g.ground} s={g.s} h={140} lean={-30} />
          {frame < T.fell && <Banner x={g.x + g.W * 0.82} y={g.ground - 196 * g.s} s={g.s * 0.6} color={RED} />}
          <g transform={`translate(0,${(1 - up) * 80 * g.s})`} opacity={up}>
            <Banner x={g.x + g.W * 0.82} y={g.ground - 196 * g.s} s={g.s * 0.6} color={PURPLE} phase={1} />
          </g>
          {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W * (0.06 + i * 0.08)} y={g.ground + 6 * g.s} scale={g.sc * 0.66} kit={i % 2 ? IBERIAN : LIBYAN} pose={frame < T.fell ? "charge" : "stand"} phase={i * 1.2} />)}
          <PanelTag x={g.x + g.W * 0.24} y={g.y + 100 * g.s} s={g.s} text={frame < T.fell ? "SIEGE" : "FALLEN · 8 MONTHS"} k={pop(frame, start + 8)} />
        </g>
      )}
    </Panel>
  );
};

// A Roman legion marches under its banner (also used in ch2). flip = marching left (west).
export const LegionScene = ({ id, start, end, anchor = PLACE.rome as [number, number], flip = false, tag, tagAt = 0 }: { id: string; start: number; end: number; anchor?: [number, number]; flip?: boolean; tag?: string; tagAt?: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#8fb2d0", "#efe2c0"]} accent={RED}>
      {(g) => {
        const m = (((frame - start) * 1.4) % 130) * g.s;
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#7a8a5a" />
            <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#b9a47a" />
            <g transform={flip ? `translate(${2 * g.cx},0) scale(-1,1)` : undefined}>
              {Array.from({ length: 8 }, (_, i) => <Warrior key={i} x={g.x - 100 * g.s + i * 130 * g.s + m} y={g.ground + (i % 2 ? 0 : 8) * g.s} scale={g.sc * 0.68} kit={ROMAN} roman phase={i} />)}
              <g transform={`translate(${m},0)`}>
                <Banner x={g.x + g.W * 0.5} y={g.ground + 4 * g.s} s={g.s * 0.8} color={RED} />
              </g>
            </g>
            {tag && <PanelTag x={g.cx} y={g.y + 46 * g.s} s={g.s} text={tag} color={RED} k={pop(frame, tagAt || start + 8)} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Quote card in the top slot: Polybius on the Sardinia grab.
const QuoteCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.unjust;
  const end = T.hamilcar + 2;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const hit = frame >= T.unjustW;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, opacity: k * o, transform: `translateY(${(1 - k) * -30 * s}px)`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.9)", borderLeft: `${8 * s}px solid ${GOLD}`, borderRadius: 14 * s, padding: `${20 * s}px ${30 * s}px`, lineHeight: 1.3 }}>
      <div style={{ fontFamily: display, fontSize: 120 * s, lineHeight: 0.6, color: GOLD, height: 50 * s }}>“</div>
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: 56 * s, textTransform: "uppercase" }}>
        Rome's grab of Sardinia was <span style={{ color: hit ? "#ff6b5f" : "#fff" }}>unjust</span>
      </div>
      <div style={{ marginTop: 12 * s, fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>
        Polybius, Histories 3.28 <span style={{ opacity: 0.7, fontWeight: 400 }}>(in short)</span>
      </div>
      <div style={{ marginTop: 6 * s, fontSize: 26 * s, opacity: interpolate(frame, [T.admired, T.admired + 10], [0, 0.85], clamp) }}>a Greek historian who admired Rome</div>
    </div>
  );
};

// "WAR" stamp on "declared war".
const WarStamp = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.warW - 4;
  const end = to + 4;
  if (frame < start || frame > end) return null;
  const k = interpolate(frame, [start, start + 8], [2.4, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const o = interpolate(frame, [end - 12, end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.36, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${k}) rotate(-7deg)`, border: `${12 * s}px solid ${RED}`, color: RED, borderRadius: 18 * s, padding: `${4 * s}px ${50 * s}px`, fontFamily: display, fontWeight: 700, fontSize: 150 * s, lineHeight: 1.15, background: "rgba(8,14,26,0.75)", letterSpacing: 8 * s }}>WAR</div>
    </div>
  );
};

const count = (f0: number, f1: number, n: number, step = 1) => (frame: number) =>
  (Math.round((n * interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })) / step) * step).toLocaleString("en-US");

export const ch1: Chapter = {
  name: "A score to settle",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(1, w, h) },
    { frame: T.rome - 16, cam: H(1, w, h) },
    { frame: T.carthage + 26, cam: view(V1.centre, w, h, 1, 0.085) },
    { frame: T.first - 10, cam: view(V1.centre, w, h, 1, 0.085) },
    { frame: T.sea + 10, cam: view(V1.sicily, w, h, 1, 0.12) },
    { frame: T.then - 12, cam: view(V1.sicily, w, h, 1, 0.12) },
    { frame: T.sardinia + 4, cam: view(V1.centre, w, h, 1, 0.085) },
    { frame: T.west - 12, cam: view(V1.centre, w, h, 1, 0.085) },
    { frame: T.spain + 30, cam: view(V1.west, w, h, 1, 0.1) },
    { frame: T.founded - 6, cam: view(V1.west, w, h, 1, 0.1) },
    { frame: T.nc, cam: view(V1.spain, w, h, 1, 0.1) },
    { frame: T.war - 4, cam: view(V1.spain, w, h, 1, 0.1) },
    { frame: T.warW + 10, cam: H(2, w, h) },
    { frame: to - 1, cam: H(2, w, h) },
  ],
  years: [[from, "264 BC"], [T.bc241, "241 BC"], [T.then, "After 241 BC"], [T.n221, "221 BC"], [T.later, "219 BC"], [T.war, "218 BC"]],
  heads: [
    { f: T.punic, tag: "Rome vs Carthage", head: "Two superpowers", color: RED, chips: [{ text: "Areas approx.", f: T.carthage + 20 }] },
    { f: T.firstwar, tag: "264–241 BC", head: "First Punic War", color: RED, chips: [{ text: "Mostly at sea", f: T.sea - 6 }, { text: "Rome won", f: T.won }, { text: "Sicily → Rome", f: T.sicily }] },
    { f: T.indemnity, tag: "The price of defeat", head: "Silver for Rome", stat: (f: number) => (f < T.n3200 ? "" : count(T.n3200, T.talents + 10, 3200, 50)(f)), label: "talents of silver", color: GOLD },
    { f: T.then, tag: "Then", head: "Rome grabs two islands", color: RED, chips: [{ text: "Sardinia", f: T.sardinia }, { text: "Corsica", f: T.corsica }, { text: "…and more", f: T.more - 6 }] },
    { f: T.unjust, tag: "", head: "" },
    { f: T.hamilcar, tag: "Hamilcar Barca", head: "A new empire in Spain", color: GOLD, chips: [{ text: "Area approx.", f: T.empire }, { text: "Silver", f: T.silverH }, { text: "Soldiers", f: T.soldiers }] },
    { f: T.newcarthage, tag: "New Carthage", head: "A new capital", color: GOLD, chips: [{ text: "Founded by his son-in-law", f: T.founded }, { text: "Today: Cartagena", f: T.cartagena }] },
    { f: T.oath, tag: "The oath", head: "Never a friend of Rome", color: GOLD, chips: [{ text: "the story goes", f: T.story }, { text: "Age 9", f: T.nine }] },
    { f: T.hannibal, tag: "The boy's name", head: "Hannibal", color: GOLD, chips: [{ text: "the story goes", f: T.hannibal }] },
    { f: T.command, tag: "221 BC", head: "Hannibal in command", stat: (f: number) => (f < T.n26 ? "" : "~26"), label: "years old", color: GOLD },
    { f: T.saguntum, tag: "219 BC", head: "Siege of Saguntum", stat: (f: number) => (f < T.fell ? "" : count(T.fell, T.eight + 12, 8)(f)), label: "months", color: RED, chips: [{ text: "Ally of Rome", f: T.allied }] },
    { f: T.war, tag: "218 BC", head: "Rome declares war", color: RED, chips: [{ text: "Second Punic War", f: T.second }] },
  ],
  Map: () => (
    <g>
      <Areas />
      <Arrows />
      <Labels />
    </g>
  ),
  Panels: () => (
    <g>
      <PowersScene start={T.punic + 10} end={T.from264 + 14} />
      <LandFightScene start={T.from264} end={T.sea - 8 + 14} />
      <RamScene start={T.sea - 8} end={T.lost + 14} />
      <SicilyScene start={T.lost} end={T.pay + 14} />
      <SilverScene start={T.pay} end={T.sardinia + 14} />
      <DemandScene start={T.sardinia} end={T.polybius + 14} />
      <PolybiusScene start={T.polybius} end={T.general + 14} />
      <HamilcarScene start={T.general} end={T.rich + 14} />
      <MineScene start={T.rich} end={T.founded + 14} />
      <HarbourScene start={T.founded} end={T.story + 14} />
      <OathScene start={T.story} end={T.hannibalC + 14} />
      <CommandScene start={T.hannibalC} end={T.besieged + 14} />
      <SiegeScene start={T.besieged} end={T.declared + 14} />
      <LegionScene id="c1legion" start={T.declared} end={T.next + 14} tag="ROME GOES TO WAR" tagAt={T.warW} />
    </g>
  ),
  Screen: () => (
    <>
      <QuoteCard />
      <WarStamp />
    </>
  ),
  sfx: [
    [T.rome - 16, SFX.whoosh, 0.35],
    [T.rome, SFX.pop, 0.35],
    [T.carthage, SFX.pop, 0.35],
    [T.first - 10, SFX.whoosh, 0.3],
    [T.sea + 22, SFX.hit, 0.4],
    [T.sicily, SFX.pop, 0.4],
    [T.n3200, SFX.hit, 0.45],
    [T.then - 12, SFX.whoosh, 0.3],
    [T.sardinia, SFX.pop, 0.35],
    [T.corsica, SFX.pop, 0.35],
    [T.unjust, SFX.whoosh, 0.3],
    [T.unjustW, SFX.hit, 0.4],
    [T.west - 12, SFX.whoosh, 0.35],
    [T.founded - 6, SFX.whoosh, 0.3],
    [T.nc, SFX.pop, 0.35],
    [T.cartagena, SFX.pop, 0.35],
    [T.swear, SFX.pop, 0.3],
    [T.hannibal, SFX.hit, 0.45],
    [T.took, SFX.pop, 0.35],
    [T.sagW, SFX.pop, 0.35],
    [T.fell, SFX.hit, 0.4],
    [T.war - 4, SFX.whoosh, 0.35],
    [T.warW - 4, SFX.hit, 0.5],
  ],
};
