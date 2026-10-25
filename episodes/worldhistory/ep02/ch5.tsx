import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, IBERIAN, LIBYAN, Mountains, Warrior } from "../kit/Ancient";
import { Bucket, Chips, Digger, RockFace, Scientist, SoilLayers } from "../kit/AncientC";
import { BLUE, clamp, display, font, GOLD, Panel, PANEL_H, PANEL_TOP, QuizNews, RED, TAN, view, type Chapter } from "../kit/news";
import { Snow } from "../kit/Period";
import { MapLine } from "../kit/PeriodA";
import { Calendar, Gauge } from "../kit/PeriodB";
import { MapChip, MapGlow } from "../kit/PeriodC";
import { Horse } from "../kit/PeriodD";
import { PASSES, PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 5 "The landslide" (landslide → quizans2): the broken track on the Italian side, the road dug for the
// horses and the half-starved elephants, Livy's fire and vinegar, which pass (nobody knows), the 2016 dung layer at
// the Traversette and its caveats, the 2026 energy study, and the quiz: most elephants survived the Alps.
const [from, to] = span("ch5");

const T = {
  slide: B.landslide.start,
  landslide: wf("landslide", "landslide", 0.15),
  nopath: wf("landslide", "path", 0.55),
  just: wf("landslide", "Just", 0.6),
  dig: B.dig.start,
  dug: wf("dig", "dug", 0.1),
  horses: wf("dig", "horses", 0.6),
  oneday: wf("dig", "day", 0.95),
  starv: B.starving.start,
  eleph: wf("starving", "elephants", 0.05),
  waited: wf("starving", "waited", 0.2),
  three: wf("starving", "three", 0.3),
  half: wf("starving", "half-", 0.5),
  vin: B.vinegar.start,
  livy: wf("vinegar", "Livy", 0.02),
  fire: wf("vinegar", "fire", 0.5),
  vinegar: wf("vinegar", "vinegar", 0.58),
  polyb: wf("vinegar", "Polybius", 0.72),
  never: wf("vinegar", "never", 0.9),
  which: B.whichpass.start,
  pass: wf("whichpass", "pass", 0.1),
  nobody: wf("whichpass", "Nobody", 0.45),
  five: wf("whichpass", "five", 0.68),
  dung: B.dung.start,
  scientists: wf("dung", "scientists", 0.12),
  dungW: wf("dung", "dung", 0.4),
  col: wf("dung", "Col", 0.5),
  dated: wf("dung", "dated", 0.68),
  bc: wf("dung", "BC", 0.83),
  notproof: wf("dung", "not", 0.95),
  cav: B.caveat.start,
  sixty: wf("caveat", "sixty", 0.2),
  carth: wf("caveat", "Carthaginian", 0.4),
  mystery: wf("caveat", "mystery", 0.82),
  energy: B.energy.start,
  study: wf("energy", "study", 0.1),
  energyW: wf("energy", "energy", 0.25),
  picked: wf("energy", "picked", 0.5),
  trav: wf("energy", "Traversette", 0.55),
  other: wf("energy", "Other", 0.7),
  quiz: B.quiz2.start,
  ans: B.quizans2.start,
  legend: wf("quizans2", "legend", 0.35),
  next: wf("quizans2", "next", 0.8),
};

const V = {
  near: bbox([[6.5, 44.35], [7.7, 45.05]]), // the Italian side of the pass (stand-in: Traversette)
  pass: bbox([[5.4, 44.62], [8.6, 45.76]]), // all five candidate passes
  col: bbox([[6.7, 44.5], [7.45, 44.95]]), // Col de la Traversette
};

const SLIDE: [number, number] = [7.16, 44.67]; // the broken track below the pass, Italian side (approx.)
const DUNG: [number, number] = [7.04, 44.725]; // the mire below the col (approx.)
const ease = Easing.inOut(Easing.cubic);
const ELEPHANTS = "#9aa3ab";

// ---- panels ----

// The track on the Italian side: it breaks on "landslide" and slides into the drop.
const LandslideScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5slide" anchor={SLIDE} start={start} end={end} sky={["#7f93aa", "#dfe7ee"]} accent="#9fb6c8">
      {(g) => {
        const brk = interpolate(frame, [T.landslide - 4, T.landslide + 26], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const ledge = g.ground - 70 * g.s;
        const a = g.x + g.W * 0.36;
        const b = g.x + g.W * 0.66;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={ledge - 30 * g.s} s={g.s * 0.8} />
            {/* rock mass under the track */}
            <rect x={g.x} y={ledge} width={g.W} height={g.H} fill="#5d5a57" />
            {/* the chasm: a sheer slope of old snow over new ice */}
            <path d={`M${a} ${ledge} L${b} ${ledge} L${b - 50 * g.s} ${g.y + g.H} L${a + 40 * g.s} ${g.y + g.H} Z`} fill="#b9d3e2" opacity={brk} />
            <path d={`M${a} ${ledge} L${b} ${ledge} L${b - 20 * g.s} ${ledge + 30 * g.s} L${a + 16 * g.s} ${ledge + 34 * g.s} Z`} fill="#f4f8fb" opacity={brk} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={a + (40 + i * 50) * g.s} y1={ledge + 60 * g.s} x2={a + (20 + i * 50) * g.s} y2={g.y + g.H} stroke="#fff" strokeWidth={3 * g.s} opacity={0.6 * brk} />)}
            {/* track on both sides */}
            <rect x={g.x} y={ledge - 14 * g.s} width={a - g.x} height={16 * g.s} fill="#b8a27a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            <rect x={b} y={ledge - 14 * g.s} width={g.x + g.W - b} height={16 * g.s} fill="#b8a27a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            {/* the middle section slides away */}
            <g transform={`translate(${brk * 30 * g.s},${brk * brk * 260 * g.s}) rotate(${brk * 18},${(a + b) / 2},${ledge})`} opacity={1 - brk}>
              <rect x={a} y={ledge - 14 * g.s} width={b - a} height={16 * g.s} fill="#b8a27a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
              <rect x={a} y={ledge} width={b - a} height={80 * g.s} fill="#5d5a57" />
            </g>
            {brk > 0 &&
              brk < 1 &&
              [0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} cx={a + (b - a) * (0.1 + i * 0.16)} cy={ledge + brk * (120 + i * 30) * g.s} r={(8 + (i % 3) * 5) * g.s} fill="#6e6b68" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
              ))}
            <Elephant x={g.x + 70 * g.s} y={ledge - 12 * g.s} scale={g.sc * 0.6} walk={false} snow={0.8} />
            <Warrior x={g.x + 190 * g.s} y={ledge - 12 * g.s} scale={g.sc * 0.68} kit={LIBYAN} pose="stand" cloak={1} />
            <Warrior x={g.x + 255 * g.s} y={ledge - 12 * g.s} scale={g.sc * 0.68} kit={IBERIAN} pose="stand" cloak={1} phase={2} />
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
          </g>
        );
      }}
    </Panel>
  );
};

// Close-up: nothing but a steep slope of snow over glassy ice, a soldier at the edge.
const IceScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5ice" anchor={SLIDE} start={start} end={end} sky={["#6f86a0", "#d6e2ea"]} accent="#9fb6c8">
      {(g) => {
        const top = g.y + 60 * g.s;
        const glint = ((frame - start) * 6 * g.s) % (g.W + 200 * g.s);
        return (
          <g>
            <defs>
              <linearGradient id="c5iceg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e9f3f8" />
                <stop offset="1" stopColor="#7fa8c2" />
              </linearGradient>
            </defs>
            <path d={`M${g.x} ${top} L${g.x + g.W * 0.25} ${top} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="url(#c5iceg)" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            <path d={`M${g.x} ${top} L${g.x + g.W * 0.25} ${top} L${g.x + g.W * 0.42} ${top + 60 * g.s} L${g.x} ${top + 70 * g.s} Z`} fill="#f7fafc" />
            {[0.3, 0.5, 0.7].map((k, i) => <path key={i} d={`M${g.x + g.W * k} ${top + g.H * 0.25 * (i + 1) * 0.5} l${-30 * g.s} ${20 * g.s} l${40 * g.s} ${8 * g.s} Z`} fill="#6e6b68" stroke="#1b1d24" strokeWidth={1.2 * g.s} />)}
            <line x1={g.x + glint - 100 * g.s} y1={g.y + g.H} x2={g.x + glint} y2={top + 40 * g.s} stroke="#fff" strokeWidth={10 * g.s} opacity={0.5} />
            <Warrior x={g.x + 150 * g.s} y={top + 4 * g.s} scale={g.sc * 0.62} kit={LIBYAN} pose="stand" cloak={1} />
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} />
          </g>
        );
      }}
    </Panel>
  );
};

// Soldiers with picks cut a new ledge into the rock.
const DigScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5dig" anchor={SLIDE} start={start} end={end} sky={["#7f93aa", "#e6ecf1"]} accent={GOLD}>
      {(g) => {
        const cut = interpolate(frame, [start, end], [0.45, 0.75], clamp);
        const ledge = g.ground - 20 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 90 * g.s} s={g.s * 0.7} />
            <path d={`M${g.x + g.W * 0.55} ${g.y} L${g.x + g.W} ${g.y} L${g.x + g.W} ${g.y + g.H} L${g.x + g.W * 0.8} ${g.y + g.H} Q${g.x + g.W * 0.6} ${g.y + g.H * 0.6} ${g.x + g.W * 0.55} ${g.y} Z`} fill="#6d6a66" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            <rect x={g.x} y={ledge} width={g.W * cut} height={g.H} fill="#8a8478" />
            <rect x={g.x} y={ledge - 6 * g.s} width={g.W * cut} height={10 * g.s} fill="#b8a27a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            {[0, 1, 2].map((i) => {
              const dx = g.x + g.W * cut - (80 + i * 140) * g.s;
              return (
                <g key={i}>
                  <Digger x={dx} y={ledge} scale={g.sc * 0.8} phase={i * 1.7} kit={i === 1 ? IBERIAN : LIBYAN} />
                  <Chips x={dx + 60 * g.s} y={ledge - 40 * g.s} s={g.s} seed={i} />
                </g>
              );
            })}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={30} />
          </g>
        );
      }}
    </Panel>
  );
};

// The horses are led along the new ledge.
const HorsesScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5horses" anchor={SLIDE} start={start} end={end} sky={["#7f93aa", "#e6ecf1"]} accent={GOLD}>
      {(g) => {
        const ledge = g.ground - 10 * g.s;
        const span = g.W + 240 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 100 * g.s} s={g.s * 0.7} />
            <rect x={g.x} y={ledge} width={g.W} height={g.H} fill="#6d6a66" />
            <rect x={g.x} y={ledge - 6 * g.s} width={g.W} height={10 * g.s} fill="#b8a27a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            {[0, 1, 2, 3].map((i) => {
              const px = g.x - 120 * g.s + (((frame - start) * 1.5 * g.s + i * (span / 4)) % span);
              return i % 2 ? (
                <Warrior key={i} x={px} y={ledge} scale={g.sc * 0.72} kit={LIBYAN} pose="trudge" cloak={1} phase={i} />
              ) : (
                <Horse key={i} x={px} y={ledge} scale={g.sc * 0.85} phase={i} gait="walk" coat={i ? "#6b4a2e" : "#8a6a48"} />
              );
            })}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={30} />
          </g>
        );
      }}
    </Panel>
  );
};

const dayAt = (f: number) => (f < T.three - 14 ? 1 : f < T.three ? 2 : 3);

// Thin elephants waiting in the snow; the day counter runs to 3.
const StarvingScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5starve" anchor={PLACE.traversette} start={start} end={end} sky={["#6a7c92", "#d8e2ea"]} accent={ELEPHANTS}>
      {(g) => (
        <g>
          <Mountains x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} />
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
          {[0, 1, 2].map((i) => (
            <Elephant key={i} x={g.x + g.W * (0.15 + i * 0.24)} y={g.ground + (i % 2 ? -12 : 10) * g.s} scale={g.sc * (i % 2 ? 0.5 : 0.58)} walk={false} thin={1} snow={1} phase={i * 2} />
          ))}
          <Calendar x={g.x + g.W - 100 * g.s} y={g.ground - 140 * g.s} s={g.s * 1.1} day={dayAt(frame)} font={font} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={80} />
        </g>
      )}
    </Panel>
  );
};

// Livy's story: a fire against the rock face, then vinegar poured on the hot stone.
const VinegarScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Panel id="c5vinegar" anchor={SLIDE} start={start} end={end} sky={["#56607a", "#c9b8a0"]} accent={GOLD}>
      {(g) => {
        const heat = interpolate(frame, [T.fire - 10, T.fire + 20], [0.2, 1], clamp);
        const pour = interpolate(frame, [T.vinegar - 4, T.vinegar + 16], [0, 1], clamp);
        const chip = frame < T.vinegar ? 0 : spring({ frame: frame - T.vinegar, fps, config: { damping: 12 } });
        const cx = g.x + g.W - 130 * g.s;
        const cy = g.y + 34 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a8478" />
            <RockFace x={g.x + g.W * 0.35} y={g.y + 10 * g.s} W={g.W * 0.65} H={g.ground - g.y - 10 * g.s} s={g.s} heat={heat} crack={pour} steam={pour} />
            <Fire x={g.x + g.W * 0.44} y={g.ground} size={90 * g.s} seed={3} k={1 - pour * 0.6} />
            <Fire x={g.x + g.W * 0.52} y={g.ground} size={70 * g.s} seed={5} k={1 - pour * 0.6} />
            <Smoke x={g.x + g.W * 0.48} y={g.ground - 60 * g.s} size={50 * g.s} seed={2} k={0.8} />
            <Warrior x={g.x + g.W * 0.16} y={g.ground + 10 * g.s} scale={g.sc * 0.8} kit={IBERIAN} pose="stand" />
            <Bucket x={g.x + g.W * 0.24} y={g.ground + 8 * g.s} scale={g.sc * 0.7} />
            <g transform={`translate(${cx},${cy}) scale(${chip})`}>
              <rect x={-110 * g.s} y={-24 * g.s} width={220 * g.s} height={48 * g.s} rx={24 * g.s} fill={GOLD} stroke="#fff" strokeWidth={2.5 * g.s} />
              <text y={11 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#1b1d24">LIVY ONLY</text>
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// Two sources side by side: Livy tells it, Polybius (the older one) does not.
const SourcesScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5sources" anchor={SLIDE} start={start} end={end} sky={["#3a2a22", "#6a4a32"]} accent={GOLD}>
      {(g) => {
        const no = interpolate(frame, [T.never - 4, T.never + 8], [0, 1], clamp);
        const page = (x: number, title: string, sub: string, line: string, ok: boolean, k: number) => (
          <g transform={`translate(${x},${g.y + 70 * g.s})`}>
            <rect x={0} y={0} width={g.W * 0.42} height={g.H - 100 * g.s} rx={8 * g.s} fill="#efe3c0" stroke="#1b1d24" strokeWidth={1.6 * g.s} />
            <text x={g.W * 0.21} y={50 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={44 * g.s} fill="#3a2a1c">{title}</text>
            <text x={g.W * 0.21} y={86 * g.s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24 * g.s} fill="#6a5a3a">{sub}</text>
            {[0, 1].map((i) => <line key={i} x1={30 * g.s} y1={(112 + i * 18) * g.s} x2={g.W * 0.42 - 30 * g.s} y2={(112 + i * 18) * g.s} stroke="#b8a882" strokeWidth={3 * g.s} />)}
            <g opacity={k}>
              <circle cx={50 * g.s} cy={178 * g.s} r={20 * g.s} fill={ok ? "#3f8f4a" : RED} />
              <text x={50 * g.s} y={189 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * g.s} fill="#fff">{ok ? "✓" : "✕"}</text>
              <text x={82 * g.s} y={188 * g.s} fontFamily={font} fontWeight={900} fontSize={28 * g.s} fill="#3a2a1c">{line}</text>
            </g>
          </g>
        );
        return (
          <g>
            {page(g.x + g.W * 0.05, "LIVY", "~200 years later", "Fire + vinegar", true, 1)}
            {page(g.x + g.W * 0.53, "POLYBIUS", "the older source", "Not mentioned", false, no)}
          </g>
        );
      }}
    </Panel>
  );
};

// Five saddles on one ridge, each with a question flag.
const PassesScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Panel id="c5passes" anchor={PLACE.clapier} start={start} end={end} sky={["#5a7aa0", "#e3ebf1"]} accent={GOLD}>
      {(g) => {
        const crest = (t: number) => g.ground - (150 + Math.cos(t * Math.PI * 10) * 60) * g.s;
        const pts = Array.from({ length: 41 }, (_, i) => `${g.x + (i / 40) * g.W},${crest(i / 40)}`).join(" L");
        return (
          <g>
            <path d={`M${g.x} ${g.ground + 50 * g.s} L${pts} L${g.x + g.W} ${g.ground + 50 * g.s} Z`} fill="#4d5c72" stroke="#1b1d24" strokeWidth={1.5 * g.s} />
            {Array.from({ length: 6 }, (_, i) => {
              const px = g.x + (i / 5) * g.W;
              return <path key={i} d={`M${px} ${crest(i / 5)} l${-34 * g.s} ${40 * g.s} l${68 * g.s} 0 Z`} fill="#f4f8fb" />;
            })}
            {PASSES.map(([name], i) => {
              const t = (i + 0.5) / 5;
              const px = g.x + t * g.W;
              const py = crest(t);
              const f0 = start + 6 + i * 8;
              const k = frame < f0 ? 0 : spring({ frame: frame - f0, fps, config: { damping: 11 } });
              return (
                <g key={name} transform={`translate(${px},${py}) scale(${k})`}>
                  <line x1={0} y1={0} x2={0} y2={-70 * g.s} stroke="#3a2a1c" strokeWidth={3 * g.s} />
                  <path d={`M0 ${-70 * g.s} L${44 * g.s} ${-58 * g.s} L0 ${-46 * g.s} Z`} fill="#e8edf2" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
                  <text x={16 * g.s} y={-50 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={20 * g.s} fill="#1b1d24">?</text>
                  <text y={40 * g.s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={22 * g.s} fill="#fff" stroke="#0b1020" strokeWidth={5 * g.s} paintOrder="stroke">{name}</text>
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// 2016: a scientist takes a soil core in the mire below the col.
const CoreScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5core" anchor={DUNG} start={start} end={end} sky={["#6a90c0", "#e8f0f4"]} accent={BLUE}>
      {(g) => {
        const push = 0.5 + Math.sin((frame - start) * 0.12) * 0.5;
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s * 0.8} snow={0.7} far="#7a8aa0" near="#56657a" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#7a8a5a" />
            <ellipse cx={g.x + g.W * 0.62} cy={g.ground + 4 * g.s} rx={150 * g.s} ry={22 * g.s} fill="#5a5a3a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            <Scientist x={g.x + g.W * 0.5} y={g.ground + 10 * g.s} scale={g.sc * 0.75} push={push} />
            <rect x={g.x + g.W * 0.24} y={g.ground - 6 * g.s} width={70 * g.s} height={30 * g.s} rx={4 * g.s} fill="#e8edf2" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            <rect x={g.x + g.W * 0.24} y={g.ground - 6 * g.s} width={70 * g.s} height={8 * g.s} fill="#d23a2a" />
            <Scientist x={g.x + g.W * 0.82} y={g.ground + 14 * g.s} scale={g.sc * 0.6} flip />
          </g>
        );
      }}
    </Panel>
  );
};

// The core: soil layers, with one dark churned layer of ancient horse dung, dated to ~200 BC.
const LayersScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5layers" anchor={DUNG} start={start} end={end} sky={["#2a2420", "#4a3e34"]} accent={BLUE}>
      {(g) => {
        const hi = interpolate(frame, [start + 10, start + 24], [0, 1], clamp);
        const lab = interpolate(frame, [T.dated - 4, T.dated + 8], [0, 1], clamp);
        const top = g.y + 60 * g.s;
        const lh = g.H - 70 * g.s;
        const layer = top + (lh / 5) * 2 + lh / 10;
        return (
          <g>
            <SoilLayers x={g.x + 40 * g.s} y={top} W={g.W * 0.5} H={lh} s={g.s} hi={hi} />
            <line x1={g.x + 40 * g.s + g.W * 0.5} y1={layer} x2={g.x + g.W * 0.62} y2={layer} stroke={GOLD} strokeWidth={4 * g.s} opacity={hi} />
            <text x={g.x + g.W * 0.64} y={layer - 8 * g.s} fontFamily={font} fontWeight={900} fontSize={36 * g.s} fill="#fff" opacity={hi}>Horse dung</text>
            <text x={g.x + g.W * 0.64} y={layer + 38 * g.s} fontFamily={display} fontWeight={700} fontSize={44 * g.s} fill={GOLD} opacity={lab}>~200 BC</text>
          </g>
        );
      }}
    </Panel>
  );
};

// The caveat: the date range is wide, ±60 years.
const RangeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5range" anchor={DUNG} start={start} end={end} sky={["#1c2638", "#2c3a52"]} accent={RED}>
      {(g) => {
        const k = interpolate(frame, [start + 4, start + 26], [0, 1], { ...clamp, easing: ease });
        const cy = g.y + g.H * 0.6;
        const half = g.W * 0.36 * k;
        return (
          <g>
            <line x1={g.x + 40 * g.s} y1={cy} x2={g.x + g.W - 40 * g.s} y2={cy} stroke="#8a94a8" strokeWidth={4 * g.s} />
            <rect x={g.cx - half} y={cy - 26 * g.s} width={half * 2} height={52 * g.s} rx={10 * g.s} fill={RED} opacity={0.45} stroke={RED} strokeWidth={3 * g.s} />
            <line x1={g.cx} y1={cy - 50 * g.s} x2={g.cx} y2={cy + 50 * g.s} stroke="#fff" strokeWidth={5 * g.s} />
            <text x={g.cx} y={cy - 64 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={44 * g.s} fill="#fff">~200 BC</text>
            <text x={g.cx} y={cy + 92 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={46 * g.s} fill="#fff" opacity={k}>± 60 years</text>
          </g>
        );
      }}
    </Panel>
  );
};

// No Carthaginian objects: an empty sieve of soil and stones.
const SieveScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5sieve" anchor={DUNG} start={start} end={end} sky={["#6a90c0", "#e8f0f4"]} accent={RED}>
      {(g) => {
        const x = interpolate(frame, [start + 16, start + 28], [0, 1], clamp);
        const sx = g.x + g.W * 0.36;
        const sy = g.ground - 70 * g.s;
        const shake = Math.sin(frame * 0.8) * 6 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a8a5a" />
            <g transform={`translate(${shake},0)`}>
              <ellipse cx={sx} cy={sy} rx={170 * g.s} ry={50 * g.s} fill="#8a6a42" stroke="#1b1d24" strokeWidth={2 * g.s} />
              <ellipse cx={sx} cy={sy - 6 * g.s} rx={150 * g.s} ry={38 * g.s} fill="#5a4a34" />
              {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={sx + (i - 4) * 30 * g.s} cy={sy - 6 * g.s + (((i * 7) % 5) - 2) * 6 * g.s} rx={10 * g.s} ry={6 * g.s} fill="#9a948a" stroke="#1b1d24" strokeWidth={1 * g.s} />)}
            </g>
            <g opacity={x} transform={`translate(${g.x + g.W * 0.76},${g.ground - 130 * g.s})`}>
              <circle r={70 * g.s} fill={RED} stroke="#fff" strokeWidth={4 * g.s} />
              <text y={30 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={90 * g.s} fill="#fff">✕</text>
              <text y={112 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * g.s} fill="#fff" stroke="#0b1020" strokeWidth={6 * g.s} paintOrder="stroke">no artefacts</text>
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// 2026 study: what each climb costs in energy (an elephant and a soldier on the slope, a gauge).
const EnergyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5energy" anchor={PLACE.traversette} start={start} end={end} sky={["#5a7aa0", "#e3ebf1"]} accent={GOLD}>
      {(g) => {
        const lvl = 0.8 - (((frame - start) % 60) / 60) * 0.5;
        const e = g.x + g.W * 0.12 + (frame - start) * 0.8 * g.s;
        const yAt = (px: number) => g.ground - ((px - g.x) / g.W) * 150 * g.s;
        return (
          <g>
            <path d={`M${g.x} ${g.ground + 50 * g.s} L${g.x} ${g.ground} L${g.x + g.W} ${g.ground - 150 * g.s} L${g.x + g.W} ${g.ground + 50 * g.s} Z`} fill="#eef3f7" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            <Elephant x={e} y={yAt(e) + 4 * g.s} scale={g.sc * 0.45} snow={0.6} />
            <Warrior x={e + 110 * g.s} y={yAt(e + 110 * g.s) + 2 * g.s} scale={g.sc * 0.5} kit={LIBYAN} pose="trudge" cloak={1} />
            <Gauge x={g.x + g.W - 170 * g.s} y={g.y + 190 * g.s} s={g.s * 0.9} level={lvl} font={font} title="ENERGY" />
          </g>
        );
      }}
    </Panel>
  );
};

// After the quiz: elephants coming down out of the snow, alive.
const DescentScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5descent" anchor={PLACE.traversette} start={start} end={end} sky={["#6a90c0", "#eef2e0"]} accent={ELEPHANTS}>
      {(g) => {
        const span = g.W + 300 * g.s;
        const order = ["e", "w", "e", "e", "w", "e"];
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
            <path d={`M${g.x} ${g.ground - 30 * g.s} L${g.x + g.W * 0.35} ${g.ground - 30 * g.s} L${g.x + g.W * 0.25} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#eef3f7" />
            {order.map((t, i) => {
              const px = g.x - 150 * g.s + (((frame - start) * 1.3 * g.s + i * (span / order.length)) % span);
              return t === "e" ? (
                <Elephant key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.5} phase={i} thin={0.6} />
              ) : (
                <Warrior key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.58} phase={i * 1.3} kit={i % 2 ? LIBYAN : IBERIAN} />
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// ---- screen overlays ----

// Energy cost per pass. The bars are illustrative: the only fact shown is the study's pick (Traversette lowest).
const EnergyBars = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.energyW;
  const end = T.quiz + 4;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 10, end], [1, 0], clamp);
  const hi = interpolate(frame, [T.picked - 4, T.picked + 8], [0, 1], clamp);
  const deb = frame < T.other ? 0 : spring({ frame: frame - T.other, fps, config: { damping: 12 } });
  const rows: [string, number][] = [["Traversette", 0.42], ["Montgenèvre", 0.7], ["Mont Cenis", 0.82], ["Clapier", 0.64], ["Little St Bernard", 0.9]];
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * PANEL_TOP, height: PANEL_H * s, opacity: o * Math.min(1, k * 1.5), transform: `scale(${0.94 + 0.06 * k})`, background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${16 * s}px ${28 * s}px`, boxSizing: "border-box", fontFamily: font, color: "#fff", lineHeight: 1.2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 * s, fontWeight: 700, color: GOLD, marginBottom: 8 * s }}>
        <span>Energy cost per route · 2026 study</span>
        <span style={{ fontSize: 22 * s, color: "#aab3c2" }}>illustrative</span>
      </div>
      {rows.map(([name, v], i) => {
        const g = interpolate(frame, [start + i * 5, start + 24 + i * 5], [0, v], { ...clamp, easing: Easing.out(Easing.cubic) });
        const best = i === 0;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 * s, margin: `${7 * s}px 0` }}>
            <div style={{ width: 270 * s, fontSize: 28 * s, fontWeight: 700, textAlign: "right", color: best && hi > 0.5 ? GOLD : "#fff" }}>{name}</div>
            <div style={{ flex: 1, height: 34 * s, background: "rgba(255,255,255,0.08)", borderRadius: 8 * s }}>
              <div style={{ width: `${g * 100}%`, height: "100%", borderRadius: 8 * s, background: best ? `rgba(255,201,74,${0.45 + 0.55 * hi})` : "#6a7488", boxShadow: best && hi > 0 ? `0 0 ${20 * s * hi}px ${GOLD}` : undefined }} />
            </div>
            <div style={{ width: 110 * s, fontSize: 24 * s, fontWeight: 900, color: GOLD, opacity: best ? hi : 0 }}>lowest</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 24 * s, bottom: 14 * s, transform: `scale(${deb})`, background: RED, color: "#fff", borderRadius: 30 * s, padding: `${2 * s}px ${18 * s}px`, fontSize: 28 * s, fontWeight: 900 }}>Debated</div>
    </div>
  );
};

// ---- map overlays ----

// Pin with a side label (the passes sit close together).
const PassPin = ({ at, text, k, color, side }: { at: [number, number]; text: string; k: number; color: string; side: 1 | -1 }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  const cycle = (frame % 36) / 36;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={Math.min(1, k)}>
      <g transform={`scale(${Math.min(1, k)})`}>
        <circle r={(9 + cycle * 26) * s} fill="none" stroke={color} strokeWidth={3 * s} opacity={1 - cycle} />
        <circle r={9 * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
      </g>
      <text x={side * 22 * s} y={(text === "Montgenèvre" ? -28 : 12) * s} textAnchor={side > 0 ? "start" : "end"} fontFamily={font} fontWeight={700} fontSize={36 * s} fill="#fff" stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};
const SIDE: Record<string, 1 | -1> = { Traversette: 1, "Montgenèvre": -1, "Mont Cenis": 1, Clapier: -1, "Little St Bernard": 1 };

const Map5 = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const pop = (f0: number, f1: number) => (frame < f0 || frame > f1 ? 0 : spring({ frame: frame - f0, fps: 30, config: { damping: 12 } }) * interpolate(frame, [f1 - 10, f1], [1, 0], clamp));
  const passesA = frame >= T.pass && frame < T.scientists + 12;
  const passesB = frame >= T.study && frame < T.quiz + 20;
  return (
    <g>
      {/* the broken track, then the new road */}
      <MapChip at={SLIDE} text="Landslide" k={pop(T.landslide, T.dig + 6)} color={RED} dy={56} size={0.9} />
      {frame >= T.landslide && frame < T.dug + 10 && <MapLine pts={[[7.09, 44.705], [7.13, 44.685], [7.2, 44.665], [7.26, 44.64]]} k={1} color={RED} width={7} dash="10 8" opacity={show(T.landslide, T.dug + 10) * 0.9} />}
      {frame >= T.dug && frame < T.vin + 10 && <MapLine pts={[[7.09, 44.705], [7.14, 44.69], [7.2, 44.665], [7.26, 44.64]]} k={interpolate(frame, [T.dug, T.oneday], [0, 1], clamp)} color={GOLD} width={8} opacity={show(T.dug, T.vin + 10)} />}
      <MapChip at={SLIDE} text="New road" k={pop(T.dug + 20, T.horses + 4)} color={GOLD} textColor="#1b1d24" dy={56} size={0.9} />
      <MapChip at={SLIDE} text="Horses: 1 day" k={pop(T.horses, T.starv + 6)} color={GOLD} textColor="#1b1d24" dy={56} size={0.9} />
      <MapChip at={SLIDE} text="37 elephants wait" k={pop(T.eleph, T.vin + 6)} color={ELEPHANTS} textColor="#1b1d24" dy={56} size={0.9} />
      {/* Livy's fire */}
      <MapGlow at={SLIDE} k={show(T.fire - 10, T.which)} r={70} />
      {/* five candidate passes */}
      {passesA && PASSES.map(([name, at], i) => <PassPin key={`a${name}`} at={at} text={name} k={pop(T.pass + 6 + i * 9, T.scientists + 12)} color="#e8edf2" side={SIDE[name]} />)}
      <MapChip at={[6.0, 45.45]} text="approx." k={pop(T.pass + 50, T.scientists + 12)} color="#2a3446" size={0.75} />
      {/* the dung site below the Traversette */}
      {frame >= T.col - 4 && frame < T.energy + 10 && <PassPin at={PLACE.traversette} text="Col de la Traversette" k={show(T.col - 4, T.energy + 10)} color={GOLD} side={-1} />}
      <MapChip at={DUNG} text="Dung layer" k={pop(T.dungW, T.cav + 10)} color="#7a5d3a" dx={-30} dy={64} size={0.8} />
      <MapChip at={PLACE.traversette} text="2,947 m" k={pop(T.col + 10, T.energy + 10)} color={GOLD} textColor="#1b1d24" dx={110} dy={10} size={0.9} />
      <MapChip at={PLACE.traversette} text="?" k={pop(T.mystery, T.energy + 10)} color={RED} dx={0} dy={-80} size={1.4} />
      {/* the energy study's pick */}
      {passesB && PASSES.map(([name, at], i) => <PassPin key={`b${name}`} at={at} text={name} k={pop(T.study + 6 + i * 5, T.quiz + 20)} color={i === 0 && frame >= T.picked ? GOLD : "#8a94a8"} side={SIDE[name]} />)}
      {frame >= T.picked && frame < T.quiz + 20 && <MapGlow at={PLACE.traversette} k={show(T.picked, T.quiz + 20)} r={70} color={GOLD} />}
      {/* the elephants come down into Italy */}
      {frame >= T.legend && <Arrow points={[PLACE.traversette, [7.3, 44.8], [7.6, 44.98]]} start={T.legend} end={T.legend + 40} color={TAN} width={14} outline="#0b1020" opacity={show(T.legend, to + 20)} />}
    </g>
  );
};

export const ch5: Chapter = {
  name: "The landslide",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(5, w, h) },
    { frame: from + 50, cam: view(V.near, w, h, 1, 0.1) },
    { frame: T.which - 4, cam: view(V.near, w, h, 1, 0.1) },
    { frame: T.which + 34, cam: view(V.pass, w, h, 1, 0.085) },
    { frame: T.scientists - 6, cam: view(V.pass, w, h, 1, 0.085) },
    { frame: T.scientists + 40, cam: view(V.col, w, h, 1, 0.08) },
    { frame: T.study - 10, cam: view(V.col, w, h, 1, 0.08) },
    { frame: T.study + 30, cam: view(V.pass, w, h, 1, 0.085) },
    { frame: T.next - 10, cam: view(V.pass, w, h, 1, 0.085) },
    { frame: to - 1, cam: H(6, w, h) },
  ],
  years: [[from, "218 BC"], [T.dung, "2016"], [T.cav, "218 BC"], [T.energy, "2026"], [T.quiz, "218 BC"]],
  heads: [
    { f: from, tag: "The Italian side", head: "The landslide", color: RED, chips: [{ text: "The path is gone", f: T.nopath }] },
    { f: T.just, tag: "The Italian side", head: "Sheer ice and rock", color: RED },
    { f: T.dig, tag: "The fix", head: "Digging a road", color: GOLD },
    { f: T.horses, tag: "Horses through", head: "After one day", stat: "1 day", label: "for the horses", color: GOLD },
    { f: T.starv, tag: "37 elephants", head: "Waiting, half-starved", stat: (f) => `Day ${dayAt(f)}`, label: "of 3", color: ELEPHANTS, chips: [{ text: "Half-starved", f: T.half }] },
    { f: T.vin, tag: "Livy · ~200 years later", head: "Fire and vinegar?", color: GOLD, chips: [{ text: "Livy only", f: T.vinegar }, { text: "Polybius: no mention", f: T.never }] },
    { f: T.which, tag: "Candidates · approx.", head: "Which pass?", color: GOLD, chips: [{ text: "Nobody knows", f: T.nobody }, { text: "At least 5", f: T.five }] },
    { f: T.dung, tag: "2016 · soil study", head: "Ancient horse dung", color: BLUE },
    { f: T.col, tag: "Col de la Traversette", head: "Dung below the pass", stat: "2,947 m", label: "high", color: BLUE, chips: [{ text: "~200 BC", f: T.bc }, { text: "Not proof", f: T.notproof }] },
    { f: T.cav, tag: "The caveats", head: "Not proof", color: RED, chips: [{ text: "±60 years", f: T.sixty }, { text: "No artefacts", f: T.carth }, { text: "Still open", f: T.mystery }] },
    { f: T.energy, tag: "2026 study", head: "Energy cost per pass", color: GOLD, chips: [{ text: "Picks the Traversette", f: T.trav }, { text: "Debated", f: T.other }] },
    { f: T.quiz, tag: "Quiz time", head: "How many made it?", color: GOLD },
    { f: T.ans + 40, tag: "After the Alps", head: "Most survived", stat: "≈37", label: "elephants, still alive", color: ELEPHANTS, chips: [{ text: "Myth busted", f: T.legend + 10 }] },
  ],
  Map: () => <Map5 />,
  Panels: () => (
    <g>
      <LandslideScene start={from} end={T.just + 14} />
      <IceScene start={T.just} end={T.dug + 14} />
      <DigScene start={T.dug} end={T.horses + 14} />
      <HorsesScene start={T.horses} end={T.eleph + 14} />
      <StarvingScene start={T.eleph} end={T.livy + 14} />
      <VinegarScene start={T.livy} end={T.polyb + 14} />
      <SourcesScene start={T.polyb} end={T.nobody + 14} />
      <PassesScene start={T.nobody} end={T.scientists + 14} />
      <CoreScene start={T.scientists} end={T.dungW + 14} />
      <LayersScene start={T.dungW} end={T.sixty + 14} />
      <RangeScene start={T.sixty} end={T.carth + 14} />
      <SieveScene start={T.carth} end={T.energy + 14} />
      <EnergyScene start={T.energy} end={T.energyW + 14} />
      <DescentScene start={T.ans + 40} end={to + 14} />
    </g>
  ),
  Screen: () => (
    <>
      <EnergyBars />
      <QuizNews title="Quiz time" question="How many of the 37 elephants made it over the Alps?" options={["None", "About half", "Most of them"]} answer={2} start={T.quiz + 6} reveal={T.ans} end={T.ans + 44} />
    </>
  ),
  sfx: [
    [from + 2, SFX.whoosh, 0.35],
    [T.landslide, SFX.hit, 0.4],
    [T.nopath, SFX.pop, 0.35],
    [T.dug, SFX.pop, 0.35],
    [T.horses, SFX.pop, 0.35],
    [T.eleph, SFX.pop, 0.35],
    [T.waited, SFX.tick, 0.3],
    [T.three, SFX.tick, 0.3],
    [T.vinegar, SFX.pop, 0.4],
    [T.never, SFX.hit, 0.35],
    [T.which - 6, SFX.whoosh, 0.4],
    [T.pass + 6, SFX.pop, 0.35],
    [T.pass + 24, SFX.pop, 0.35],
    [T.pass + 42, SFX.pop, 0.35],
    [T.nobody, SFX.hit, 0.35],
    [T.scientists - 6, SFX.whoosh, 0.4],
    [T.col, SFX.pop, 0.4],
    [T.notproof, SFX.pop, 0.35],
    [T.sixty, SFX.pop, 0.35],
    [T.carth, SFX.pop, 0.35],
    [T.study - 10, SFX.whoosh, 0.4],
    [T.picked, SFX.hit, 0.35],
    [T.other, SFX.pop, 0.35],
    [T.quiz, SFX.riser, 0.3],
    [T.ans, SFX.hit, 0.45],
    [T.legend + 10, SFX.pop, 0.4],
    [T.next - 16, SFX.whoosh, 0.4],
  ],
};
