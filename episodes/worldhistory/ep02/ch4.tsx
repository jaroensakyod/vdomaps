import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, GAUL, IBERIAN, LIBYAN, Mountains, Warrior } from "../kit/Ancient";
import { Boulder, Column, Moon, PackLoad, Roundhouse, Slope, Tree } from "../kit/AncientB";
import { clamp, display, font, GOLD, NightGrade, Panel, Pin, RED, view, type Chapter } from "../kit/news";
import { AreaName, Sack } from "../kit/PeriodA";
import { CampTent } from "../kit/PeriodB";
import { MapChip } from "../kit/PeriodC";
import { Horse } from "../kit/PeriodD";
import { Snow } from "../kit/Period";
import { PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 4 "Into the Alps" (climb → downhill), Oct–Nov 218 BC. The global March band climbs from the Rhône to the
// summit (the band uses the Col de la Traversette only as a stand-in: the pass is unknown). Pass heights on a ruler,
// the Allobroges on the ridges, their town, the night move, the gorges, the elephants as a shield, snow at the top
// after nine days, two days' rest, and a descent worse than the climb.
const [from, to] = span("ch4");

const T = {
  climb: B.climb.start,
  thirty: wf("climb", "thirty-", 0.12),
  left: wf("climb", "left", 0.55),
  ahead: wf("climb", "Ahead", 0.7),
  alps: wf("climb", "Alps,", 0.9),
  height: B.height.start,
  passes: wf("height", "passes", 0.04),
  two: wf("height", "two-", 0.38),
  almost: wf("height", "almost", 0.8),
  three: wf("height", "three-", 0.85),
  allob: B.allobroges.start,
  allobW: wf("allobroges", "Allobroges,", 0.23),
  heights: wf("allobroges", "heights", 0.41),
  roll: wf("allobroges", "roll", 0.73),
  rocks: wf("allobroges", "rocks", 0.77),
  town: B.town.start,
  captured: wf("town", "captured", 0.13),
  townW: wf("town", "town,", 0.48),
  fed: wf("town", "fed", 0.55),
  night: B.night.start,
  nightW: wf("night", "night,", 0.28),
  went: wf("night", "went", 0.42),
  sleep: wf("night", "sleep,", 0.55),
  quietly: wf("night", "quietly", 0.71),
  took: wf("night", "took", 0.8),
  heightsN: wf("night", "heights", 0.85),
  gorge: B.gorge.start,
  attacks: wf("gorge", "attacks", 0.12),
  narrow: wf("gorge", "narrow", 0.34),
  horses: wf("gorge", "horses", 0.49),
  fell: wf("gorge", "fell", 0.73),
  shield: B.elephantshield.start,
  terrified: wf("elephantshield", "terrified", 0.2),
  wherever: wf("elephantshield", "Wherever", 0.55),
  nobody: wf("elephantshield", "nobody", 0.8),
  snow: B.snow.start,
  top: wf("snow", "top.", 0.29),
  snowW: wf("snow", "Snow", 0.42),
  late: wf("snow", "late", 0.7),
  rest: B.rest.start,
  rested: wf("rest", "rested", 0.07),
  twoD: wf("rest", "two", 0.33),
  africa: wf("rest", "Africa", 0.4),
  never: wf("rest", "never", 0.65),
  snowR: wf("rest", "snow,", 0.74),
  roof: wf("rest", "roof", 0.9),
  down: B.downhill.start,
  downW: wf("downhill", "down", 0.4),
  worse: wf("downhill", "worse", 0.65),
};

const V4 = {
  alps: bbox([[4.4, 44.4], [8.2, 45.9]]),
  allob: bbox([[5.2, 44.75], [7.3, 45.55]]),
  gorge: bbox([[5.55, 44.7], [7.45, 45.4]]),
  pass: bbox([[6.4, 44.55], [7.85, 45.1]]),
};

const AUTUMN: [string, string] = ["#8fb0cc", "#f0dcb0"];
const COLD: [string, string] = ["#7f9bb8", "#e3ebf1"];
const NIGHT: [string, string] = ["#0c1430", "#2c3a64"];
const GREY: [string, string] = ["#8a96a4", "#d4d8dc"];
const LARCH = "#d9a23a";
const pop = { ...clamp, easing: Easing.out(Easing.back(2)) };

// --- Map ------------------------------------------------------------------------------------------------------

// Pass heights: a ruler at the right edge of the map band (screen space), 0–3,000 m.
const Ruler = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  const o = interpolate(frame, [T.passes - 6, T.passes + 8, T.allob + 10, T.allob + 26], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const x = width - 120 * s;
  const y0 = height * 0.535;
  const y1 = height * 0.32;
  const yOf = (m: number) => y0 - ((y1 - y0) * -m) / 3000;
  const a = interpolate(frame, [T.two - 8, T.two + 14], [0, 2000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const b = interpolate(frame, [T.three - 6, T.three + 14], [a, 2950], { ...clamp, easing: Easing.out(Easing.cubic) });
  const top = frame >= T.three - 6 ? b : a;
  return (
    <g opacity={o}>
      <rect x={x - 70 * s} y={y1 - 70 * s} width={170 * s} height={y0 - y1 + 100 * s} rx={14 * s} fill="rgba(8,14,26,0.82)" stroke="rgba(255,255,255,0.25)" strokeWidth={2 * s} />
      <text x={x + 15 * s} y={y1 - 34 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24 * s} fill="#fff">Height</text>
      <rect x={x + 10 * s} y={yOf(top)} width={28 * s} height={y0 - yOf(top)} fill={GOLD} rx={4 * s} />
      <line x1={x + 10 * s} y1={y0} x2={x + 10 * s} y2={y1} stroke="#fff" strokeWidth={3 * s} />
      {[0, 1000, 2000, 3000].map((m) => (
        <g key={m}>
          <line x1={x} y1={yOf(m)} x2={x + 10 * s} y2={yOf(m)} stroke="#fff" strokeWidth={3 * s} />
          <text x={x - 6 * s} y={yOf(m) + 8 * s} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={22 * s} fill="#fff">{m ? `${m / 1000}k` : "0"}</text>
        </g>
      ))}
      <text x={x + 24 * s} y={y0 + 22 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={20 * s} fill="#fff" opacity={0.8}>metres</text>
      {frame >= T.two && <text x={x + 46 * s} y={yOf(2000) + 8 * s} fontFamily={display} fontWeight={700} fontSize={26 * s} fill={GOLD} opacity={interpolate(frame, [T.two, T.two + 8], [0, 1], clamp)}>2,000+</text>}
      {frame >= T.three && <text x={x + 46 * s} y={yOf(2950) + 8 * s} fontFamily={display} fontWeight={700} fontSize={26 * s} fill={GOLD} opacity={interpolate(frame, [T.three, T.three + 8], [0, 1], clamp)}>~3,000</text>}
    </g>
  );
};

// Allobroges on the ridge tops above the track (approx.). Red marks; gold at night when Hannibal takes the heights;
// red again for the attacks in the gorges; they back off from the route when the elephants pass.
const RIDGES: [number, number, number][] = [[6.0, 45.25, 1], [6.15, 44.96, -1], [6.3, 45.15, 1], [6.45, 44.84, -1], [6.58, 45.04, 1]];
const Ridges = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const red = interpolate(frame, [T.heights - 20, T.heights, T.went, T.sleep, T.attacks - 6, T.attacks + 6, T.snow - 20, T.snow], [0, 1, 1, 0, 0, 1, 1, 0], clamp);
  const gold = interpolate(frame, [T.took - 4, T.heightsN + 6, T.gorge - 6, T.attacks], [0, 1, 1, 0], clamp);
  const back = interpolate(frame, [T.wherever - 6, T.wherever + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const climb = interpolate(frame, [T.quietly - 6, T.heightsN + 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const dots = interpolate(frame, [T.quietly - 8, T.quietly, T.heightsN + 8, T.heightsN + 20], [0, 1, 1, 0], clamp);
  const burst = (f: number) => interpolate(frame, [f, f + 16], [0, 1], clamp);
  return (
    <g>
      {RIDGES.map(([lon, lat, side], i) => {
        const ll: [number, number] = [lon, lat + side * 0.09 * back];
        const p = projection(ll);
        if (!p) return null;
        const k = interpolate(frame, [T.heights - 24 + i * 5, T.heights - 12 + i * 5], [0, 1], pop);
        const mark = (color: string, o: number) =>
          o > 0 && <path d={`M${p[0]} ${p[1] - 22 * s} L${p[0] + 19 * s} ${p[1] + 12 * s} L${p[0] - 19 * s} ${p[1] + 12 * s} Z`} fill={color} stroke="#fff" strokeWidth={3 * s} strokeLinejoin="round" opacity={o} transform={`translate(${p[0] * (1 - k)},${p[1] * (1 - k)}) scale(${k})`} />;
        // gold dot climbing from the track up to the ridge
        const q = projection([lon, lat - side * 0.13]);
        const dot = q && dots > 0 ? [q[0] + (p[0] - q[0]) * climb, q[1] + (p[1] - q[1]) * climb] : null;
        const b = i % 2 ? burst(T.attacks + i * 3) : burst(T.horses + i * 3);
        return (
          <g key={i}>
            {mark(RED, red)}
            {mark(GOLD, gold)}
            {dot && <circle cx={dot[0]} cy={dot[1]} r={9 * s} fill={GOLD} stroke="#fff" strokeWidth={2.5 * s} opacity={dots} />}
            {b > 0 && b < 1 && <circle cx={p[0]} cy={p[1]} r={(14 + b * 46) * s} fill="none" stroke={RED} strokeWidth={5 * s} opacity={1 - b} />}
          </g>
        );
      })}
    </g>
  );
};

// Snow over the whole map from "Snow had already fallen" to the end of the chapter.
const MapSnow = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  const k = interpolate(frame, [T.snowW - 10, T.snowW + 20, to - 15, to], [0, 1, 1, 0], clamp);
  if (k <= 0) return null;
  return (
    <g>
      <rect width={width} height={height} fill="#dfe8f0" opacity={0.18 * k} />
      <Snow x={0} y={0} W={width} H={height} s={s * 1.6} k={k} n={110} />
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <AreaName at={[6.9, 45.62]} text="The Alps" k={show(T.alps - 6, T.allob + 10)} color={GOLD} size={0.9} />
      <AreaName at={[6.2, 45.5]} text="Allobroges" k={show(T.allobW - 6, T.town + 10)} color="#ff8a80" size={0.65} />
      <Pin at={[5.72, 44.98]} text="Their town (approx.)" k={show(T.townW - 10, T.night + 20)} color={GOLD} size={0.7} dy={62} />
      <MapChip at={[6.3, 45.42]} text="Ambushes in the gorges" k={show(T.narrow, T.shield + 6)} color={RED} size={0.7} />
      <MapChip at={[6.3, 45.42]} text="Nobody attacked the elephants" k={show(T.nobody - 6, T.snow + 6)} color={GOLD} size={0.65} />
      <Pin at={PLACE.traversette} text="Summit · pass unknown" k={show(T.top - 6, to + 10)} color={GOLD} size={0.7} dy={62} />
      <MapChip at={PLACE.traversette} text="2 days’ rest" k={show(T.twoD - 4, T.down)} color={GOLD} size={0.7} dx={200} dy={0} />
      <AreaName at={[7.25, 44.98]} text="Roof of Europe" k={show(T.roof - 6, T.down + 6)} color="#ffffff" size={0.6} />
      <Arrow points={[[7.08, 44.72], [7.3, 44.86], [7.6, 45.0]]} start={T.downW - 6} end={T.worse} color={GOLD} width={18} variant="dashed" />
      <MapChip at={[7.4, 45.05]} text="Worse than the climb" k={interpolate(frame, [T.worse - 4, T.worse + 8], [0, 1], pop)} color={RED} size={0.7} dy={-50} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

// Up the valley in autumn: the column with its elephants.
const ValleyScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4valley" anchor={[5.4, 45.0]} start={start} end={end} sky={AUTUMN} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} snow={0.6} far="#7a8aa0" near="#5a6a5a" />
        {[0.05, 0.16, 0.3, 0.7, 0.84, 0.95].map((tx, i) => <Tree key={i} x={g.x + g.W * tx} y={g.ground - 36 * g.s} scale={g.s * (0.6 + (i % 2) * 0.15)} color={i % 3 ? LARCH : "#2f4a34"} phase={i} />)}
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8a8058" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwewwhwe" speed={1} t0={start} />
      </g>
    )}
  </Panel>
);

// Ahead: the Alps, gold larches below the snow line.
const AheadScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4ahead" anchor={[6.6, 45.1]} start={start} end={end} sky={AUTUMN} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x - 40 * g.s} W={g.W + 80 * g.s} ground={g.ground - 10 * g.s} s={g.s * 1.35} snow={1} />
        {Array.from({ length: 9 }, (_, i) => <Tree key={i} x={g.x + g.W * (0.04 + i * 0.12)} y={g.ground - 6 * g.s} scale={g.s * 0.5} color={i % 2 ? LARCH : "#c98a2a"} phase={i} />)}
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a7050" />
        <Column x={g.x} y={g.ground + 10 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwewwwew" speed={0.8} t0={start} size={0.6} />
      </g>
    )}
  </Panel>
);

// How high: dashed lines at 2,000 m and ~3,000 m over the peaks.
const AltitudeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4alt" anchor={[6.9, 44.9]} start={start} end={end} sky={COLD} accent={GOLD}>
      {(g) => {
        const line = (y: number, text: string, f: number) => {
          const k = interpolate(frame, [f - 4, f + 14], [0, 1], clamp);
          if (k <= 0) return null;
          return (
            <g opacity={Math.min(1, k * 1.5)}>
              <line x1={g.x} y1={y} x2={g.x + g.W * k} y2={y} stroke={GOLD} strokeWidth={4 * g.s} strokeDasharray={`${14 * g.s} ${10 * g.s}`} />
              <rect x={g.x + g.W - 190 * g.s} y={y - 24 * g.s} width={170 * g.s} height={44 * g.s} rx={22 * g.s} fill="rgba(8,14,26,0.85)" stroke={GOLD} strokeWidth={2 * g.s} />
              <text x={g.x + g.W - 105 * g.s} y={y + 8 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={26 * g.s} fill="#fff">{text}</text>
            </g>
          );
        };
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground} s={g.s * 1.25} snow={1} />
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#6a6a5a" />
            {line(g.ground - 120 * g.s, "2,000 m", T.two)}
            {line(g.ground - 250 * g.s, "~3,000 m", T.three)}
          </g>
        );
      }}
    </Panel>
  );
};

// Tribesmen on the heights above the track; the column passes below.
const HeightsScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4heights" anchor={[6.0, 45.25]} start={start} end={end} sky={COLD} accent={RED}>
    {(g) => {
      const ridge = g.y + 110 * g.s;
      return (
        <g>
          <path d={`M${g.x} ${g.ground - 20 * g.s} L${g.x + g.W * 0.35} ${ridge + 30 * g.s} L${g.x + g.W * 0.55} ${ridge} L${g.x + g.W} ${ridge + 10 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#6a6a60" />
          <path d={`M${g.x + g.W * 0.35} ${ridge + 30 * g.s} L${g.x + g.W * 0.55} ${ridge} L${g.x + g.W} ${ridge + 10 * g.s} L${g.x + g.W} ${ridge + 22 * g.s} L${g.x + g.W * 0.55} ${ridge + 12 * g.s} Z`} fill="#8a8878" />
          {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W * (0.58 + i * 0.1)} y={ridge + 4 * g.s + i * 2 * g.s} scale={g.sc * 0.36} kit={GAUL} flip pose="stand" phase={i} />)}
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a7458" />
          <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwhwwe" speed={0.9} t0={start} size={0.85} />
        </g>
      );
    }}
  </Panel>
);

// Ready to roll rocks down: boulders at the cliff edge.
const RocksScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4rocks" anchor={[6.3, 45.15]} start={start} end={end} sky={COLD} accent={RED}>
      {(g) => {
        const edge = g.ground - 130 * g.s;
        const rock = Math.sin(frame * 0.3) * 2;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={edge} s={g.s * 0.7} snow={1} />
            <path d={`M${g.x} ${edge} L${g.x + g.W * 0.72} ${edge} L${g.x + g.W * 0.82} ${g.ground + 50 * g.s} L${g.x} ${g.ground + 50 * g.s} Z`} fill="#6a665c" />
            <rect x={g.x + g.W * 0.72} y={g.ground} width={g.W * 0.28} height={g.H} fill="#7a7458" />
            {[0.2, 0.42, 0.62].map((bx, i) => <Boulder key={i} x={g.x + g.W * bx} y={edge - 30 * g.s} r={(32 + i * 6) * g.s} rot={rock * (i + 1)} seed={i} />)}
            {[0, 1].map((i) => <Warrior key={i} x={g.x + g.W * (0.3 + i * 0.22)} y={edge + 2 * g.s} scale={g.sc * 0.55} kit={GAUL} pose="stand" phase={i} />)}
            <Column x={g.x + g.W * 0.74} y={g.ground + 8 * g.s} W={g.W * 0.26} s={g.s} sc={g.sc} order="www" speed={0.8} t0={start} size={0.5} />
          </g>
        );
      }}
    </Panel>
  );
};

// The captured town: men carry out the grain.
const TownScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4town" anchor={[5.72, 44.98]} start={start} end={end} sky={AUTUMN} accent={GOLD}>
      {(g) => {
        const m = (frame - start) * 1.2 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 60 * g.s} s={g.s * 0.6} snow={0.8} />
            {[0.1, 0.28, 0.46].map((hx, i) => <Roundhouse key={i} x={g.x + g.W * hx} y={g.ground - 40 * g.s} scale={g.s * (0.9 - i * 0.1)} />)}
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#9a8a5e" />
            {[0, 1, 2, 3, 4].map((i) => <Sack key={i} x={g.x + g.W * (0.78 + (i % 3) * 0.06)} y={g.ground + 4 * g.s - Math.floor(i / 3) * 34 * g.s} s={g.s * 1.1} rot={(i - 2) * 6} />)}
            {[0, 1, 2].map((i) => {
              const px = g.x + g.W * 0.3 + ((i * 160 * g.s + m) % (g.W * 0.45));
              return (
                <g key={i}>
                  <Warrior x={px} y={g.ground + 8 * g.s} scale={g.sc * 0.6} kit={i % 2 ? IBERIAN : LIBYAN} phase={i} />
                  <Sack x={px - 4 * g.s} y={g.ground + 8 * g.s - 95 * g.sc * 0.6} s={g.s * 0.9} rot={-10} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Night: the tribesmen leave the heights and go home to sleep.
const GoHomeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4gohome" anchor={[6.3, 45.15]} start={start} end={end} sky={NIGHT} accent={GOLD}>
      {(g) => {
        const m = (frame - start) * 1.1 * g.s;
        return (
          <g>
            <Moon x={g.x + g.W * 0.15} y={g.y + 80 * g.s} r={26 * g.s} />
            <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s * 0.9} snow={0.7} far="#2a3448" near="#1c2434" />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#2a2e2a" />
            {[0.72, 0.9].map((hx, i) => <Roundhouse key={i} x={g.x + g.W * hx} y={g.ground - 26 * g.s} scale={g.s * 0.8} glow={1} />)}
            {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.25 + i * 0.1) + m} y={g.ground + 6 * g.s} scale={g.sc * 0.55} kit={GAUL} pose="trudge" phase={i} />)}
            <Fire x={g.x + g.W * 0.82} y={g.ground + 4 * g.s} size={26 * g.s} seed={3} />
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0a1430" opacity={0.25} />
          </g>
        );
      }}
    </Panel>
  );
};

// By moonlight, Hannibal's men climb to the empty heights.
const MoonClimbScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4moonclimb" anchor={[6.15, 44.96]} start={start} end={end} sky={NIGHT} accent={GOLD}>
      {(g) => {
        const x0 = g.x;
        const y0 = g.ground + 20 * g.s;
        const x1 = g.x + g.W * 0.85;
        const y1 = g.y + 120 * g.s;
        const at = (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
        const prog = (frame - start) * 0.0022;
        return (
          <g>
            <Moon x={g.x + g.W * 0.86} y={g.y + 70 * g.s} r={30 * g.s} />
            <path d={`M${x0} ${y0} L${x1} ${y1} L${g.x + g.W} ${y1 + 10 * g.s} L${g.x + g.W} ${g.ground + 60 * g.s} L${x0} ${g.ground + 60 * g.s} Z`} fill="#2a3040" />
            <path d={`M${x0} ${y0} L${x1} ${y1}`} stroke="#5a6a88" strokeWidth={4 * g.s} />
            {[0, 1, 2, 3, 4].map((i) => {
              const [px, py] = at(Math.min(0.92, 0.12 + i * 0.16 + prog));
              return <Warrior key={i} x={px} y={py + 4 * g.s} scale={g.sc * 0.5} kit={i % 2 ? IBERIAN : LIBYAN} pose="trudge" phase={i} />;
            })}
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0a1430" opacity={0.3} />
          </g>
        );
      }}
    </Panel>
  );
};

// Still, the attacks came: rocks bounce down the slope onto the track.
const AttackScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4attack" anchor={[6.45, 44.84]} start={start} end={end} sky={GREY} accent={RED}>
      {(g) => {
        const top = g.y + 70 * g.s;
        return (
          <g>
            <path d={`M${g.x} ${top} L${g.x + g.W} ${g.ground - 60 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#6a665c" />
            {[0, 1].map((i) => <Warrior key={i} x={g.x + g.W * (0.05 + i * 0.08)} y={top + 10 * g.s + i * 12 * g.s} scale={g.sc * 0.4} kit={GAUL} pose="stand" phase={i} />)}
            {[0, 1, 2].map((i) => {
              const t = (((frame - start) * 0.012 + i * 0.33) % 1);
              const bx = g.x + g.W * (0.18 + t * 0.7);
              const by = top + (g.ground - 60 * g.s - top) * (0.18 + t * 0.7) - Math.abs(Math.sin(t * 12)) * 24 * g.s;
              return <Boulder key={i} x={bx} y={by - 20 * g.s} r={(20 + i * 5) * g.s} rot={t * 720} seed={i + 3} />;
            })}
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a7458" />
            <Column x={g.x} y={g.ground + 8 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwpwwp" speed={1.4} t0={start} size={0.8} />
          </g>
        );
      }}
    </Panel>
  );
};

// A narrow gorge: pack horses on a ledge; a load and loose rocks tumble into the drop.
const GorgeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4gorge" anchor={[6.3, 45.0]} start={start} end={end} sky={GREY} accent={RED}>
      {(g) => {
        const ledge = g.y + g.H * 0.5;
        const fall = interpolate(frame, [T.fell - 4, T.fell + 36], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const m = (frame - start) * 0.8 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a3a40" />
            <path d={`M${g.x + g.W * 0.62} ${g.y} L${g.x + g.W * 0.7} ${g.y + g.H}  L${g.x + g.W} ${g.y + g.H} L${g.x + g.W} ${g.y} Z`} fill="#5a564e" />
            <path d={`M${g.x} ${g.y} L${g.x + g.W * 0.5} ${g.y} L${g.x + g.W * 0.56} ${ledge} L${g.x} ${ledge} Z`} fill="#6a665c" />
            <rect x={g.x} y={ledge} width={g.W * 0.56} height={10 * g.s} fill="#8a8470" />
            <path d={`M${g.x} ${ledge + 10 * g.s} L${g.x + g.W * 0.56} ${ledge + 10 * g.s} L${g.x + g.W * 0.48} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#4a463e" />
            {[0, 1].map((i) => {
              const hx = g.x + g.W * (0.06 + i * 0.22) + m;
              return (
                <g key={i}>
                  <Horse x={hx} y={ledge + 2 * g.s} scale={g.sc * 0.5} phase={i} coat={i ? "#6b4a2e" : "#8a6a48"} />
                  {!(i === 1 && fall > 0) && <PackLoad x={hx} y={ledge + 2 * g.s} scale={g.sc * 0.5} />}
                </g>
              );
            })}
            {fall > 0 && (
              <g opacity={1 - fall * 0.7}>
                <g transform={`translate(${fall * 40 * g.s},${fall * 220 * g.s}) rotate(${fall * 200},${g.x + g.W * 0.28 + m},${ledge - 50 * g.s})`}>
                  <PackLoad x={g.x + g.W * 0.28 + m} y={ledge + 2 * g.s} scale={g.sc * 0.5} />
                </g>
                {[0, 1, 2].map((i) => <Boulder key={i} x={g.x + g.W * (0.54 + i * 0.03)} y={ledge + fall * (160 + i * 40) * g.s} r={(10 + i * 4) * g.s} rot={fall * 300} seed={i + 7} />)}
              </g>
            )}
            <Warrior x={g.x + g.W * 0.02 + m} y={ledge + 4 * g.s} scale={g.sc * 0.5} kit={LIBYAN} pose="trudge" />
          </g>
        );
      }}
    </Panel>
  );
};

// Wherever the elephants walked, the tribesmen kept away.
const ShieldScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4shield" anchor={[6.45, 44.88]} start={start} end={end} sky={COLD} accent={GOLD}>
      {(g) => {
        const back = interpolate(frame, [T.terrified - 10, T.wherever + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const slope = g.y + 120 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={slope + 40 * g.s} s={g.s * 0.7} snow={1} />
            <path d={`M${g.x + g.W * 0.4} ${g.ground - 30 * g.s} L${g.x + g.W} ${slope} L${g.x + g.W} ${g.ground} L${g.x + g.W * 0.4} ${g.ground} Z`} fill="#6a665c" />
            {[0, 1, 2].map((i) => (
              <Warrior key={i} x={g.x + g.W * (0.72 + i * 0.08) + back * 90 * g.s} y={slope + (90 - i * 26) * g.s - back * 40 * g.s} scale={g.sc * 0.42} kit={GAUL} flip={back < 0.15} pose={back > 0.05 && back < 1 ? "walk" : "stand"} phase={i} />
            ))}
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a7458" />
            <Column x={g.x} y={g.ground + 8 * g.s} W={g.W} s={g.s} sc={g.sc} order="ewewwe" speed={0.9} t0={start} />
          </g>
        );
      }}
    </Panel>
  );
};

// The top: the column reaches the summit.
const SummitScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4summit" anchor={PLACE.traversette} start={start} end={end} sky={["#6f92c0", "#e8f0f6"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 70 * g.s} s={g.s * 0.6} snow={1} far="#8a9ab0" near="#6a7a90" />
        <path d={`M${g.x} ${g.ground + 10 * g.s} Q${g.x + g.W * 0.5} ${g.ground - 70 * g.s} ${g.x + g.W} ${g.ground + 10 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#eef3f7" />
        <Column x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} sc={g.sc} order="wwewwhw" speed={0.7} t0={start} cloak={1} snow={0.4} pose="trudge" size={0.85} />
      </g>
    )}
  </Panel>
);

// Snow had already fallen: a snowbound column.
const SnowScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4snow" anchor={PLACE.traversette} start={start} end={end} sky={["#8a9aac", "#dfe6ec"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} snow={1} far="#9aa6b6" near="#7a8698" />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
        <Column x={g.x} y={g.ground + 6 * g.s} W={g.W} s={g.s} sc={g.sc} order="wweww" speed={0.6} t0={start} cloak={1} snow={1} pose="trudge" />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={110} />
      </g>
    )}
  </Panel>
);

// Two days' rest at the pass: cloaks, a fire, a snowy elephant.
const RestScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4rest" anchor={PLACE.traversette} start={start} end={end} sky={["#7a8aa0", "#dfe6ec"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} snow={1} far="#9aa6b6" near="#7a8698" />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
        <CampTent x={g.x + g.W * 0.12} y={g.ground - 30 * g.s} scale={g.s * 1.2} color="#d8d0b8" />
        <CampTent x={g.x + g.W * 0.27} y={g.ground - 36 * g.s} scale={g.s * 0.9} color="#d8d0b8" />
        <Fire x={g.x + g.W * 0.48} y={g.ground + 2 * g.s} size={34 * g.s} seed={5} />
        {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.38 + (i === 2 ? 0.22 : i * 0.06))} y={g.ground + 8 * g.s} scale={g.sc * 0.6} kit={i % 2 ? IBERIAN : LIBYAN} pose="stand" cloak={1} flip={i === 2} phase={i} />)}
        <Elephant x={g.x + g.W * 0.82} y={g.ground + 8 * g.s} scale={g.sc * 0.55} walk={false} snow={1} flip />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
      </g>
    )}
  </Panel>
);

// Men from Africa and Spain who had never seen snow.
const NeverSnowScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4neversnow" anchor={PLACE.traversette} start={start} end={end} sky={["#8a9aac", "#e6ecf0"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
        <Warrior x={g.x + g.W * 0.32} y={g.ground + 20 * g.s} scale={g.sc * 0.95} kit={LIBYAN} pose="stand" cloak={1} />
        <Warrior x={g.x + g.W * 0.62} y={g.ground + 20 * g.s} scale={g.sc * 0.95} kit={IBERIAN} pose="stand" cloak={1} flip phase={2} />
        <text x={g.x + g.W * 0.32} y={g.y + 70 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * g.s} fill="#1b1d24" opacity={0.75}>AFRICA</text>
        <text x={g.x + g.W * 0.62} y={g.y + 70 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * g.s} fill="#1b1d24" opacity={0.75}>SPAIN</text>
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.3} n={90} />
      </g>
    )}
  </Panel>
);

// The roof of Europe: tiny figures on the summit above a sea of peaks.
const RoofScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4roof" anchor={PLACE.traversette} start={start} end={end} sky={["#5a7aa8", "#dfe8f2"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground + 40 * g.s} s={g.s * 0.55} snow={1} far="#9aaac0" near="#7a8aa4" />
        {[0.15, 0.5, 0.8].map((cx, i) => <ellipse key={i} cx={g.x + g.W * cx} cy={g.ground - 10 * g.s + i * 8 * g.s} rx={140 * g.s} ry={20 * g.s} fill="#f4f7fa" opacity={0.8} />)}
        <path d={`M${g.x + g.W * 0.3} ${g.ground + 50 * g.s} L${g.x + g.W * 0.55} ${g.y + 120 * g.s} L${g.x + g.W * 0.8} ${g.ground + 50 * g.s} Z`} fill="#eef3f7" stroke="#9aa6b6" strokeWidth={2 * g.s} />
        {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.52 + i * 0.03)} y={g.y + 124 * g.s} scale={g.sc * 0.22} kit={i % 2 ? IBERIAN : LIBYAN} pose="stand" cloak={1} phase={i} />)}
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
      </g>
    )}
  </Panel>
);

// The way down: a steep, icy slope; a red warning.
const DownScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4down" anchor={[7.3, 44.86]} start={start} end={end} sky={["#7a8aa0", "#d8e0e8"]} accent={RED}>
      {(g) => {
        const k = interpolate(frame, [T.worse - 4, T.worse + 8], [0, 1], pop);
        const wx = g.x + g.W * 0.8;
        const wy = g.y + 110 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground + 60 * g.s} s={g.s * 0.6} snow={1} />
            <Slope x0={g.x} y0={g.y + 130 * g.s} x1={g.x + g.W * 0.7} y1={g.ground + 60 * g.s} bottom={g.ground + 60 * g.s} color="#8a8a86" snow={1} s={g.s} />
            {[0, 1].map((i) => <Warrior key={i} x={g.x + g.W * (0.04 + i * 0.08)} y={g.y + 134 * g.s} scale={g.sc * 0.5} kit={i ? IBERIAN : LIBYAN} pose="stand" cloak={1} phase={i} />)}
            {k > 0 && (
              <g transform={`translate(${wx},${wy}) scale(${k})`}>
                <path d={`M0 ${-60 * g.s} L${56 * g.s} ${40 * g.s} L${-56 * g.s} ${40 * g.s} Z`} fill={RED} stroke="#fff" strokeWidth={5 * g.s} strokeLinejoin="round" />
                <text y={30 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70 * g.s} fill="#fff">!</text>
              </g>
            )}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
          </g>
        );
      }}
    </Panel>
  );
};

const day = (frame: number) => `Day ${Math.max(1, Math.round(interpolate(frame, [T.snow, T.top], [1, 9], clamp)))}`;

export const ch4: Chapter = {
  name: "Into the Alps",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(4, w, h) },
    { frame: T.alps - 20, cam: H(4, w, h) },
    { frame: T.alps + 20, cam: view(V4.alps, w, h, 1, 0.1) },
    { frame: T.allob - 6, cam: view(V4.alps, w, h, 1, 0.1) },
    { frame: T.allobW + 20, cam: view(V4.allob, w, h, 1, 0.1) },
    { frame: T.attacks - 10, cam: view(V4.allob, w, h, 1, 0.1) },
    { frame: T.narrow + 10, cam: view(V4.gorge, w, h, 1, 0.1) },
    { frame: T.snow, cam: view(V4.gorge, w, h, 1, 0.1) },
    { frame: T.top + 14, cam: view(V4.pass, w, h, 1, 0.1) },
    { frame: T.rest, cam: view(V4.pass, w, h, 1, 0.1) },
    { frame: T.rested + 40, cam: view(V4.pass, w, h, 1.25, 0.1) },
    { frame: T.down - 4, cam: view(V4.pass, w, h, 1.25, 0.1) },
    { frame: to - 1, cam: H(5, w, h) },
  ],
  years: [[from, "Oct 218 BC"], [T.late, "Oct–Nov 218 BC"]],
  heads: [
    { f: T.climb, tag: "Polybius", head: "Left the Rhône", stat: (f: number) => (f < T.thirty ? "" : "~46,000"), label: "38,000 foot + 8,000 horse", color: GOLD },
    { f: T.ahead, tag: "Autumn 218 BC", head: "Ahead: the Alps", color: GOLD },
    { f: T.height, tag: "The passes", head: "How high?", color: GOLD, chips: [{ text: "Well over 2,000 m", f: T.two }, { text: "One almost 3,000 m", f: T.three }] },
    { f: T.allob, tag: "Mountain tribes · approx.", head: "The Allobroges", color: RED, chips: [{ text: "Holding the heights", f: T.heights }, { text: "Rocks ready", f: T.rocks }] },
    { f: T.town, tag: "Their town", head: "Captured", color: GOLD, chips: [{ text: "Food for the army", f: T.fed }] },
    { f: T.night, tag: "Night move", head: "He takes the heights", color: GOLD, chips: [{ text: "Tribesmen asleep", f: T.sleep }] },
    { f: T.gorge, tag: "The gorges", head: "Still attacked", color: RED, chips: [{ text: "Animals and loads lost", f: T.fell }] },
    { f: T.shield, tag: "The elephants", head: "Nobody dared", stat: "37", label: "elephants", color: GOLD, chips: [{ text: "The tribes kept away", f: T.wherever }] },
    { f: T.snow, tag: "The summit", head: "After nine days", stat: day, label: "in the Alps", color: GOLD, chips: [{ text: "Snow already", f: T.snowW }, { text: "Late Oct – early Nov", f: T.late }] },
    { f: T.rest, tag: "Two days' rest", head: "On the roof of Europe", color: GOLD, chips: [{ text: "From Africa and Spain", f: T.africa }, { text: "Never seen snow", f: T.never }] },
    { f: T.down, tag: "The descent", head: "Worse than the climb", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const night = interpolate(frame, [T.nightW - 20, T.nightW + 10, T.heightsN + 20, T.gorge + 10], [0, 1, 1, 0], clamp);
    return (
      <g>
        <NightGrade k={night} fireAt={[6.05, 45.08]} />
        <Labels />
        <Ridges />
        <Ruler />
        <MapSnow />
      </g>
    );
  },
  Panels: () => (
    <g>
      <ValleyScene start={from + 2} end={T.ahead + 14} />
      <AheadScene start={T.ahead} end={T.height + 4 + 14} />
      <AltitudeScene start={T.height + 4} end={T.allob + 14} />
      <HeightsScene start={T.allob} end={T.roll - 12 + 14} />
      <RocksScene start={T.roll - 12} end={T.town + 14} />
      <TownScene start={T.town} end={T.night + 14} />
      <GoHomeScene start={T.night} end={T.sleep + 14} />
      <MoonClimbScene start={T.sleep} end={T.gorge + 14} />
      <AttackScene start={T.gorge} end={T.horses + 14} />
      <GorgeScene start={T.horses} end={T.shield + 14} />
      <ShieldScene start={T.shield} end={T.snow + 14} />
      <SummitScene start={T.snow} end={T.snowW + 14} />
      <SnowScene start={T.snowW} end={T.rest + 14} />
      <RestScene start={T.rest} end={T.twoD + 14} />
      <NeverSnowScene start={T.twoD} end={T.snowR + 14} />
      <RoofScene start={T.snowR} end={T.down + 14} />
      <DownScene start={T.down} end={to + 14} />
    </g>
  ),
  sfx: [
    [T.thirty, SFX.hit, 0.4],
    [T.alps - 20, SFX.whoosh, 0.35],
    [T.two, SFX.pop, 0.35],
    [T.three, SFX.hit, 0.4],
    [T.allobW, SFX.whoosh, 0.35],
    [T.heights - 20, SFX.pop, 0.35],
    [T.townW - 10, SFX.pop, 0.35],
    [T.nightW - 20, SFX.whoosh, 0.3],
    [T.heightsN, SFX.pop, 0.35],
    [T.attacks, SFX.hit, 0.35],
    [T.narrow, SFX.whoosh, 0.3],
    [T.fell, SFX.hit, 0.35],
    [T.wherever, SFX.pop, 0.3],
    [T.snow, SFX.whoosh, 0.35],
    [T.top, SFX.hit, 0.45],
    [T.rest, SFX.pop, 0.3],
    [T.down, SFX.whoosh, 0.35],
    [T.worse, SFX.hit, 0.45],
  ],
};
