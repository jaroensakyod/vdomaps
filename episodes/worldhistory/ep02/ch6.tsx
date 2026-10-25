import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, GAUL, IBERIAN, LIBYAN, Mountains, ROMAN, Warrior } from "../kit/Ancient";
import { BronzeTablet, FogBank, HannibalBust, HannibalOnElephant, Horseman, Reeds, Senator, WoodedHills } from "../kit/AncientC";
import { clamp, font, GOLD, Panel, Pin, RED, Rivers, view, type Chapter } from "../kit/news";
import { Snow, Water } from "../kit/Period";
import { MapLine } from "../kit/PeriodA";
import { Calendar, CampTent, Storm } from "../kit/PeriodB";
import { Block, MapChip } from "../kit/PeriodC";
import { GhostMarch } from "./march";
import { PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 6 "Italy" (arrive → trap): the band reaches the Po with Hannibal's own bronze-tablet numbers, half the
// army lost in the Alps, the cavalry win at the Ticinus, the ambush at the Trebia (Mago in the stream bed), the
// winter that kills all elephants but one, the marshes and Hannibal's eye, and the trap at Lake Trasimene.
const [from, to] = span("ch6");

const T = {
  arrive: B.arrive.start,
  plains: wf("arrive", "plains", 0.04),
  italy: wf("arrive", "Italy", 0.07),
  twenty: wf("arrive", "twenty-", 0.12),
  thou1: wf("arrive", "thousand", 0.3),
  foot: wf("arrive", "foot", 0.5),
  six: wf("arrive", "six-", 0.6),
  thou2: wf("arrive", "thousand", 0.68, 1),
  horse: wf("arrive", "horse", 0.9),
  we: wf("arrive", "We", 0.92),
  carved: wf("arrive", "carved", 0.94),
  half: B.half.start,
  fifteen: wf("half", "fifteen", 0.05),
  lost: wf("half", "lost", 0.33),
  halfW: wf("half", "half", 0.42),
  rhone: wf("half", "Rhône", 0.7),
  deserted: wf("half", "deserted", 0.8),
  died: wf("half", "died", 0.95),
  tic: B.ticinus.start,
  rome: wf("ticinus", "Rome", 0.04),
  nov: wf("ticinus", "November", 0.25),
  ticinus: wf("ticinus", "Ticinus", 0.36),
  cavalry: wf("ticinus", "cavalry", 0.52),
  routed: wf("ticinus", "routed", 0.6),
  consul: wf("ticinus", "consul", 0.78),
  scipio: wf("ticinus", "Scipio", 0.82),
  treb: B.trebia.start,
  trebia: wf("trebia", "Trebia", 0.15),
  lured: wf("trebia", "lured", 0.25),
  forty: wf("trebia", "forty-", 0.3),
  across: wf("trebia", "across", 0.47),
  ambushed: wf("trebia", "ambushed", 0.7),
  ten: wf("trebia", "ten-", 0.87),
  mago: B.mago.start,
  magoW: wf("mago", "Mago", 0.13),
  hidden: wf("mago", "hidden", 0.23),
  stream: wf("mago", "stream", 0.46),
  crossed: wf("mago", "crossed", 0.75),
  struck: wf("mago", "struck", 0.86),
  last: B.lastelephant.start,
  winter: wf("lastelephant", "winter", 0.1),
  killed: wf("lastelephant", "killed", 0.5),
  one: wf("lastelephant", "one", 0.9),
  eye: B.eye.start,
  spring: wf("eye", "spring", 0.05),
  rode: wf("eye", "rode", 0.2),
  marshes: wf("eye", "marshes", 0.5),
  infection: wf("eye", "infection", 0.7),
  lostEye: wf("eye", "lost", 0.83),
  tras: B.trasimene.start,
  june: wf("trasimene", "June", 0.03),
  lake: wf("trasimene", "Lake", 0.25),
  hid: wf("trasimene", "hid", 0.4),
  marched: wf("trasimene", "marched", 0.7),
  fog: wf("trasimene", "fog", 0.95),
  trap: B.trap.start,
  fifteenK: wf("trap", "fifteen-", 0.1),
  hours: wf("trap", "hours", 0.6),
  flaminius: wf("trap", "Flaminius", 0.9),
};

const V = {
  po: bbox([[6.2, 44.3], [9.0, 45.6]]), // out of the Alps onto the plain of the Po
  half: bbox([[4.2, 43.5], [8.4, 45.9]]), // Rhône to the Po
  bat: bbox([[7.8, 44.3], [10.3, 45.6]]), // Ticinus and Trebia
  treb: bbox([[9.25, 44.75], [9.95, 45.15]]), // the Trebia
  arno: bbox([[9.0, 42.9], [12.8, 45.1]]), // over the Apennines to the Arno marshes
  lake: bbox([[11.7, 42.95], [12.5, 43.42]]), // Lake Trasimene
};

const ease = Easing.inOut(Easing.cubic);
const CARTH = GOLD;
const ROME = RED;

// The Trebia, drawn by hand (approx.): from the Apennines north to the Po near Placentia.
const TREBIA: [number, number][] = [[9.33, 44.7], [9.4, 44.79], [9.46, 44.86], [9.52, 44.93], [9.57, 44.99], [9.62, 45.04], [9.66, 45.075]];
const CREEK: [number, number][] = [[9.48, 44.84], [9.52, 44.865], [9.56, 44.89], [9.6, 44.905]];
const MAGO: [number, number] = [9.555, 44.888];
const ROMANS_E: [number, number][] = [[9.68, 44.98], [9.69, 44.93], [9.67, 45.03]];
const SHIFT = -0.15; // the Romans wade west across the river
const CARTH_LINE: [number, number][] = [[9.4, 44.98], [9.42, 44.93], [9.39, 45.03]];

// Lake Trasimene: the hills north of the shore and the shore road (approx.).
const HILLS: [number, number][] = [[11.99, 43.232], [12.04, 43.243], [12.09, 43.24], [12.14, 43.228]];
const SHORE: [number, number][] = [[11.95, 43.19], [12.0, 43.198], [12.05, 43.205], [12.1, 43.203], [12.14, 43.196]];

// ---- panels ----

// Out of the mountains: a thin column comes down onto the green plain.
const ArriveScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6arrive" anchor={PLACE.turin} start={start} end={end} sky={["#7aa0c4", "#eef0d8"]} accent={CARTH}>
      {(g) => {
        const span = g.W + 300 * g.s;
        const order = ["w", "w", "e", "w", "w"];
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
            <path d={`M${g.x + g.W * 0.4} ${g.ground - 30 * g.s} Q${g.x + g.W * 0.55} ${g.ground - 110 * g.s} ${g.x + g.W * 0.75} ${g.ground - 80 * g.s} Q${g.x + g.W * 0.9} ${g.ground - 60 * g.s} ${g.x + g.W} ${g.ground - 70 * g.s} L${g.x + g.W} ${g.ground} L${g.x + g.W * 0.4} ${g.ground} Z`} fill="#6f8a48" />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
            {order.map((t, i) => {
              const px = g.x - 150 * g.s + (((frame - start) * 1.1 * g.s + i * (span / order.length)) % span);
              return t === "e" ? (
                <Elephant key={i} x={px} y={g.ground + 6 * g.s} scale={g.sc * 0.5} phase={i} thin={0.6} />
              ) : (
                <Warrior key={i} x={px} y={g.ground + 6 * g.s} scale={g.sc * 0.62} phase={i * 1.3} kit={i % 2 ? LIBYAN : IBERIAN} pose="trudge" cloak={0.7} />
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Infantry on the plain: Libyans and Iberians, ragged after the Alps.
const FootScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6foot" anchor={PLACE.turin} start={start} end={end} sky={["#7aa0c4", "#eef0d8"]} accent={CARTH}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
          {Array.from({ length: 2 }, (_, r) =>
            Array.from({ length: 7 }, (_, i) => (
              <Warrior key={`${r}${i}`} x={g.x + (((frame - start) * 1.2 * g.s + i * 150 * g.s + r * 70 * g.s) % (g.W + 120 * g.s)) - 60 * g.s} y={g.ground - (r ? 26 : -12) * g.s} scale={g.sc * (r ? 0.55 : 0.68)} phase={i + r} kit={(i + r) % 2 ? LIBYAN : IBERIAN} pose="trudge" />
            )),
          )}
        </g>
      )}
    </Panel>
  );
};

// Camp on the plain: tents and fires, men resting.
const CampScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6camp" anchor={PLACE.turin} start={start} end={end} sky={["#5a6a8a", "#e8c890"]} accent={CARTH}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#7a9050" />
        {[0.12, 0.42, 0.78].map((k, i) => <CampTent key={i} x={g.x + g.W * k} y={g.ground - 30 * g.s} scale={g.sc * 0.7} color="#d8ccb0" />)}
        <Fire x={g.x + g.W * 0.27} y={g.ground + 10 * g.s} size={50 * g.s} seed={2} />
        <Fire x={g.x + g.W * 0.62} y={g.ground + 10 * g.s} size={44 * g.s} seed={6} />
        <Smoke x={g.x + g.W * 0.27} y={g.ground - 30 * g.s} size={36 * g.s} seed={1} />
        {[0.2, 0.34, 0.56, 0.7].map((k, i) => <Warrior key={i} x={g.x + g.W * k} y={g.ground + 24 * g.s} scale={g.sc * 0.6} phase={i} kit={i % 2 ? LIBYAN : GAUL} pose="stand" cloak={0.6} flip={i % 2 === 1} />)}
      </g>
    )}
  </Panel>
);

// Along the Po: the column on the river bank.
const PoScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6po" anchor={PLACE.turin} start={start} end={end} sky={["#7aa0c4", "#eef0d8"]} accent={CARTH}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
          <Water x={g.x} y={g.ground + 16 * g.s} W={g.W} H={60 * g.s} s={g.s} />
          {Array.from({ length: 6 }, (_, i) => (
            <Warrior key={i} x={g.x + (((frame - start) * 1.2 * g.s + i * 170 * g.s) % (g.W + 120 * g.s)) - 60 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.6} phase={i} kit={i % 3 ? LIBYAN : IBERIAN} />
          ))}
        </g>
      )}
    </Panel>
  );
};

// Cavalry: Numidian horsemen.
const CavalryScene = ({ start, end, id = "c6horse", roman = false }: { start: number; end: number; id?: string; roman?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={PLACE.turin} start={start} end={end} sky={["#7aa0c4", "#eef0d8"]} accent={CARTH}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8aa05a" />
          {Array.from({ length: 4 }, (_, i) => (
            <Horseman key={i} x={roman ? g.x + g.W + 100 * g.s - (((frame - start) * 2.4 * g.s + i * 260 * g.s) % (g.W + 200 * g.s)) : g.x + (((frame - start) * 2.4 * g.s + i * 260 * g.s) % (g.W + 200 * g.s)) - 100 * g.s} y={g.ground + (i % 2 ? -14 : 14) * g.s} scale={g.sc * 0.62} phase={i * 1.4} roman={roman} flip={roman} />
          ))}
        </g>
      )}
    </Panel>
  );
};

// Hannibal's own record: a bronze tablet with the numbers.
const TabletScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6tablet" anchor={PLACE.turin} start={start} end={end} sky={["#2a2a3a", "#6a5a4a"]} accent={CARTH}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#4a4038" />
          <BronzeTablet x={g.cx} y={g.ground + 24 * g.s} s={g.s * 1.25} font={font} lines={["HANNIBAL", "20,000 FOOT", "6,000 HORSE"]} k={interpolate(frame, [start + 4, T.carved + 16], [0.34, 1], clamp)} />
        </g>
      )}
    </Panel>
  );
};

// Fifteen days in the Alps.
const DaysScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const day = Math.round(interpolate(frame, [start, start + 40], [1, 15], clamp));
  return (
    <Panel id="c6days" anchor={PLACE.traversette} start={start} end={end} sky={["#6a7c92", "#d8e2ea"]} accent={RED}>
      {(g) => (
        <g>
          <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
          {[0.12, 0.3, 0.46].map((k, i) => <Warrior key={i} x={g.x + g.W * k + (frame - start) * 0.6 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.6} phase={i} kit={i % 2 ? IBERIAN : LIBYAN} pose="trudge" cloak={1} />)}
          <Calendar x={g.x + g.W - 110 * g.s} y={g.ground - 130 * g.s} s={g.s * 1.1} day={day} font={font} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={70} />
        </g>
      )}
    </Panel>
  );
};

// Deserters: a few men turn back into the mountains.
const DesertScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6desert" anchor={PLACE.traversette} start={start} end={end} sky={["#5a6a80", "#cfd8e0"]} accent={RED}>
      {(g) => (
        <g>
          <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#e4ebf0" />
          {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.7 + i * 0.1) - (frame - start) * 0.9 * g.s} y={g.ground + (i % 2 ? -8 : 12) * g.s} scale={g.sc * 0.58} phase={i} kit={GAUL} pose="trudge" cloak={1} flip />)}
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={90} />
        </g>
      )}
    </Panel>
  );
};

// Rome is stunned: senators in alarm.
const RomeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const alarm = interpolate(frame, [start + 4, start + 20], [0, 1], clamp);
  return (
    <Panel id="c6rome" anchor={PLACE.ticinus} start={start} end={end} sky={["#8aa0c0", "#f0e0c0"]} accent={ROME}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#d8ccb4" />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i}>
              <rect x={g.x + (40 + i * 140) * g.s} y={g.y + 50 * g.s} width={30 * g.s} height={g.ground - g.y - 110 * g.s} fill="#efe8d8" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            </g>
          ))}
          <rect x={g.x} y={g.y + 30 * g.s} width={g.W} height={24 * g.s} fill="#efe8d8" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
          {[0.22, 0.42, 0.6, 0.8].map((k, i) => <Senator key={i} x={g.x + g.W * k} y={g.ground + 10 * g.s} scale={g.sc * 0.68} phase={i} alarm={alarm * (i % 2 ? 1 : 0.7)} flip={i % 2 === 0} />)}
        </g>
      )}
    </Panel>
  );
};

// The Ticinus: Numidian horsemen charge, Roman horsemen turn back with the consul.
const TicinusScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6tic" anchor={PLACE.ticinus} start={start} end={end} sky={["#8aa0b8", "#e8e0c8"]} accent={CARTH}>
      {(g) => {
        const t = frame - start;
        return (
          <g>
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8a9a5a" />
            {[0, 1, 2].map((i) => <Horseman key={`c${i}`} x={g.x + g.W * (0.05 + i * 0.12) + t * 2.2 * g.s} y={g.ground + (i % 2 ? -12 : 14) * g.s} scale={g.sc * 0.6} phase={i} />)}
            {[0, 1].map((i) => <Horseman key={`r${i}`} x={g.x + g.W * (0.72 + i * 0.14) + t * 1.4 * g.s} y={g.ground + (i % 2 ? -12 : 14) * g.s} scale={g.sc * 0.6} phase={i + 2} roman />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Romans wade the icy Trebia (westward).
const WadeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6wade" anchor={PLACE.trebia} start={start} end={end} sky={["#6a7a90", "#d0dae2"]} accent={ROME}>
      {(g) => {
        const water = g.ground - 50 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y + g.H * 0.4} width={g.W} height={g.H} fill="#8a9070" />
            {Array.from({ length: 6 }, (_, i) => <Warrior key={i} x={g.x + g.W * (0.2 + i * 0.13) - (frame - start) * 0.7 * g.s} y={g.ground + (i % 2 ? -10 : 14) * g.s} scale={g.sc * 0.66} phase={i} kit={ROMAN} roman pose="trudge" flip />)}
            <Water x={g.x} y={water} W={g.W} H={g.y + g.H - water} s={g.s} color="#5a7f98" ice={1} />
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
          </g>
        );
      }}
    </Panel>
  );
};

// Hannibal's line waits on the west bank, elephants among them.
const LineScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6line" anchor={CARTH_LINE[0]} start={start} end={end} sky={["#6a7a90", "#d0dae2"]} accent={CARTH}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8a9070" />
        <Elephant x={g.x + g.W * 0.15} y={g.ground - 10 * g.s} scale={g.sc * 0.55} walk={false} />
        <Elephant x={g.x + g.W * 0.82} y={g.ground - 10 * g.s} scale={g.sc * 0.55} walk={false} phase={2} />
        {Array.from({ length: 6 }, (_, i) => <Warrior key={i} x={g.x + g.W * (0.3 + i * 0.08)} y={g.ground + 14 * g.s} scale={g.sc * 0.62} phase={i} kit={[LIBYAN, IBERIAN, GAUL][i % 3]} pose="stand" />)}
      </g>
    )}
  </Panel>
);

// Mago's men lie hidden in a stream bed among the reeds.
const HiddenScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6hidden" anchor={MAGO} start={start} end={end} sky={["#7a8aa0", "#dfe4e8"]} accent={CARTH}>
    {(g) => {
      const bed = g.ground - 20 * g.s;
      return (
        <g>
          <rect x={g.x} y={g.y + g.H * 0.45} width={g.W} height={g.H} fill="#8a9070" />
          <path d={`M${g.x} ${bed - 40 * g.s} Q${g.cx} ${bed + 30 * g.s} ${g.x + g.W} ${bed - 40 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#6a6a4a" />
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${g.x + g.W * (0.1 + i * 0.13)},${bed + 20 * g.s})`}>
              <ellipse cx={0} cy={-10 * g.s} rx={26 * g.s} ry={14 * g.s} fill={i % 2 ? "#c9b48a" : "#4f7a3a"} stroke="#1b1d24" strokeWidth={1.2 * g.s} />
              <path d={`M${-10 * g.s} ${-18 * g.s} Q0 ${-36 * g.s} ${12 * g.s} ${-18 * g.s} Z`} fill="#b9a46a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            </g>
          ))}
          <Reeds x={g.x} W={g.W} ground={bed + 40 * g.s} s={g.s} n={34} h={90} />
        </g>
      );
    }}
  </Panel>
);

// They strike from behind: Mago's men run out of the reeds.
const StrikeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6strike" anchor={MAGO} start={start} end={end} sky={["#7a8aa0", "#dfe4e8"]} accent={CARTH}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#8a9070" />
          {[0, 1, 2].map((i) => <Warrior key={`r${i}`} x={g.x + g.W * (0.68 + i * 0.1)} y={g.ground - 30 * g.s} scale={g.sc * 0.55} phase={i} kit={ROMAN} roman pose="walk" />)}
          {Array.from({ length: 5 }, (_, i) => <Warrior key={i} x={g.x + g.W * (0.04 + i * 0.1) + (frame - start) * 2.4 * g.s} y={g.ground + (i % 2 ? 0 : 18) * g.s} scale={g.sc * 0.64} phase={i} kit={i % 2 ? LIBYAN : GAUL} pose="charge" />)}
          <Reeds x={g.x} W={g.W * 0.45} ground={g.y + g.H} s={g.s} n={16} h={80} />
        </g>
      )}
    </Panel>
  );
};

// The winter: one elephant left, in sleet.
const LoneScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c6lone" anchor={PLACE.trebia} start={start} end={end} sky={["#4a5464", "#a8b2bc"]} accent="#9aa3ab">
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#a8b0a8" />
        <Elephant x={g.cx} y={g.ground + 10 * g.s} scale={g.sc * 0.75} walk={false} thin={0.8} snow={1} />
        <Storm x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={70} lightning={false} />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
      </g>
    )}
  </Panel>
);

// Spring: Hannibal on the last elephant through the flooded marshes.
const MarshScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6marsh" anchor={PLACE.arno} start={start} end={end} sky={["#6a7a88", "#c8d0c8"]} accent={CARTH}>
      {(g) => {
        const water = g.ground - 26 * g.s;
        const ex = g.x + g.W * 0.25 + (frame - start) * 1.0 * g.s;
        return (
          <g>
            <rect x={g.x} y={g.y + g.H * 0.45} width={g.W} height={g.H} fill="#6a7a5a" />
            <Reeds x={g.x} W={g.W} ground={water} s={g.s} n={30} h={60} color="#5a6a3a" />
            <HannibalOnElephant x={ex} y={g.ground + 10 * g.s} scale={g.sc * 0.8} />
            <Water x={g.x} y={water} W={g.W} H={g.y + g.H - water} s={g.s} color="#5a6a62" />
            {[0, 1].map((i) => <Warrior key={i} x={ex - (150 + i * 90) * g.s} y={g.ground + 22 * g.s} scale={g.sc * 0.6} phase={i} kit={LIBYAN} pose="trudge" />)}
            <Storm x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} lightning={false} />
          </g>
        );
      }}
    </Panel>
  );
};

// The infection: Hannibal loses the sight of one eye.
const EyeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6eye" anchor={PLACE.arno} start={start} end={end} sky={["#3a3a4a", "#8a7a6a"]} accent={CARTH}>
      {(g) => (
        <g>
          <HannibalBust x={g.cx} y={g.y + g.H + 10 * g.s} scale={g.sc * 1.25} patch={interpolate(frame, [T.lostEye - 6, T.lostEye + 10], [0, 1], clamp)} />
          <Storm x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={30} lightning={false} />
        </g>
      )}
    </Panel>
  );
};

// Trasimene: the army hidden on the wooded hills above the lake.
const HillsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6hills" anchor={HILLS[1]} start={start} end={end} sky={["#8aa0c0", "#f0e6d0"]} accent={CARTH}>
      {(g) => (
        <g>
          <WoodedHills x={g.x} W={g.W} ground={g.ground + 10 * g.s} s={g.s} peek={interpolate(frame, [start + 10, start + 30], [0, 1], clamp)} />
          <rect x={g.x} y={g.ground + 10 * g.s} width={g.W} height={14 * g.s} fill="#c9b48a" />
          <Water x={g.x} y={g.ground + 24 * g.s} W={g.W} H={g.H} s={g.s} color="#4a7a9a" />
        </g>
      )}
    </Panel>
  );
};

// The Roman column marches along the shore into the morning fog.
const FogScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6fog" anchor={SHORE[2]} start={start} end={end} sky={["#a0aab4", "#e8eaea"]} accent={ROME}>
      {(g) => {
        const road = g.ground;
        return (
          <g>
            <WoodedHills x={g.x} W={g.W} ground={road - 20 * g.s} s={g.s} peek={1} />
            <rect x={g.x} y={road - 20 * g.s} width={g.W} height={34 * g.s} fill="#c9b48a" />
            <Water x={g.x} y={road + 14 * g.s} W={g.W} H={g.H} s={g.s} color="#5a7a90" />
            {Array.from({ length: 7 }, (_, i) => <Warrior key={i} x={g.x + (((frame - start) * 1.2 * g.s + i * 130 * g.s) % (g.W + 100 * g.s)) - 50 * g.s} y={road + 4 * g.s} scale={g.sc * 0.55} phase={i} kit={ROMAN} roman />)}
            <FogBank x={g.x} y={g.y + g.H * 0.35} W={g.W} H={g.H * 0.6} s={g.s} k={interpolate(frame, [T.fog - 40, T.fog + 10], [0.3, 1], clamp)} n={10} />
          </g>
        );
      }}
    </Panel>
  );
};

// The trap: Hannibal's men rush down the hills out of the fog.
const TrapScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c6trap" anchor={HILLS[2]} start={start} end={end} sky={["#a0aab4", "#e8eaea"]} accent={RED}>
      {(g) => {
        const slope = (px: number) => g.y + 120 * g.s + ((px - g.x) / g.W) * (g.H - 160 * g.s);
        return (
          <g>
            <path d={`M${g.x} ${g.y + 120 * g.s} L${g.x + g.W} ${g.y + g.H - 40 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#4a6a3a" stroke="#1b1d24" strokeWidth={1.2 * g.s} />
            {Array.from({ length: 6 }, (_, i) => {
              const px = g.x + ((((frame - start) * 2.6 + i * 150) * g.s) % (g.W + 100 * g.s)) - 50 * g.s;
              return <Warrior key={i} x={px} y={slope(px) + 6 * g.s} scale={g.sc * 0.6} phase={i} kit={[LIBYAN, GAUL, IBERIAN][i % 3]} pose="charge" />;
            })}
            <FogBank x={g.x} y={g.y + g.H * 0.5} W={g.W} H={g.H * 0.5} s={g.s} n={8} />
          </g>
        );
      }}
    </Panel>
  );
};

// ---- map overlays ----

const Map6 = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const pop = (f0: number, f1: number) => (frame < f0 || frame > f1 ? 0 : spring({ frame: frame - f0, fps: 30, config: { damping: 12 } }) * interpolate(frame, [f1 - 10, f1], [1, 0], clamp));
  const ghost = interpolate(frame, [T.fifteen, T.lost, T.tic - 10, T.tic + 10], [0, 1, 1, 0], clamp);
  const wade = interpolate(frame, [T.lured, T.ambushed - 10], [0, 1], { ...clamp, easing: ease });
  const fade = interpolate(frame, [T.struck + 10, T.last], [1, 0.45], clamp);
  const trebOn = frame >= T.trebia - 10 && frame < T.eye + 20;
  const lakeOn = frame >= T.lake - 10;
  const fog = interpolate(frame, [T.fog - 30, T.fog + 10, T.flaminius, to - 30], [0, 1, 1, 0], clamp);
  const sweep = interpolate(frame, [T.trap, T.hours], [0, 1], clamp);
  return (
    <g>
      {/* out of the Alps onto the plain of the Po */}
      {frame >= T.plains - 10 && frame < T.half + 10 && <g opacity={show(T.plains - 10, T.half + 10)}><Rivers file="data/medw-rivers.json" hi={{ Po: interpolate(frame, [T.plains, T.plains + 20], [0, 1], clamp) }} /></g>}
      <MapChip at={[8.6, 44.75]} text="Plain of the Po" k={pop(T.italy, T.twenty)} color="#2a3446" size={0.85} />
      <MapChip at={PLACE.turin} text="20,000 foot" k={pop(T.foot, T.half + 6)} color={CARTH} textColor="#1b1d24" dx={220} dy={40} size={0.85} />
      <MapChip at={PLACE.turin} text="6,000 horse" k={pop(T.thou2, T.half + 6)} color={CARTH} textColor="#1b1d24" dx={220} dy={100} size={0.85} />
      {/* half the army lost in the Alps */}
      <GhostMarch k={ghost} />
      <MapChip at={PLACE.rhone} text="46,000 at the Rhône" k={pop(T.rhone - 20, T.tic + 6)} color="#5a6a80" dy={60} size={0.8} />
      <MapChip at={PLACE.turin} text="26,000 in Italy" k={pop(T.halfW, T.tic + 6)} color={CARTH} textColor="#1b1d24" dy={70} size={0.8} />
      {/* the Ticinus: a cavalry battle (approx.) */}
      <Pin at={PLACE.ticinus} text="Ticinus" k={show(T.ticinus - 4, T.treb + 20)} color={ROME} dy={-44} />
      {frame >= T.ticinus && frame < T.treb + 10 && <g opacity={show(T.ticinus, T.treb + 10)}><Rivers file="data/medw-rivers.json" hi={{ Ticino: interpolate(frame, [T.ticinus, T.ticinus + 20], [0, 1], clamp) }} /></g>}
      <Block at={[9.12, 45.17]} k={pop(T.ticinus + 6, T.treb + 10)} color={ROME} w={60} h={22} />
      {frame >= T.cavalry && frame < T.treb + 10 && (
        <g opacity={show(T.cavalry, T.treb + 10)}>
          <Arrow points={[[8.55, 45.32], [8.85, 45.3], [9.06, 45.2]]} start={T.cavalry} end={T.cavalry + 22} color={CARTH} width={16} outline="#0b1020" />
          <Arrow points={[[8.6, 45.0], [8.9, 45.06], [9.08, 45.13]]} start={T.cavalry + 6} end={T.cavalry + 28} color={CARTH} width={16} outline="#0b1020" />
        </g>
      )}
      {frame >= T.routed && frame < T.treb + 10 && <Arrow points={[[9.18, 45.15], [9.4, 45.08], [9.62, 45.05]]} start={T.routed} end={T.routed + 30} color={ROME} width={14} variant="dashed" outline="#0b1020" opacity={show(T.routed, T.treb + 10)} />}
      <MapChip at={PLACE.ticinus} text="approx." k={pop(T.ticinus + 10, T.treb + 10)} color="#2a3446" dx={-150} dy={60} size={0.7} />
      {/* the Trebia (drawn by hand, approx.) */}
      {trebOn && <MapLine pts={TREBIA} k={interpolate(frame, [T.trebia - 10, T.trebia + 20], [0, 1], clamp)} color="#9fe0ff" width={7} opacity={show(T.trebia - 10, T.eye + 20)} />}
      {trebOn && <MapLine pts={CREEK} k={interpolate(frame, [T.stream - 10, T.stream + 10], [0, 1], clamp)} color="#9fe0ff" width={4} opacity={show(T.stream - 10, T.eye + 20)} />}
      <Pin at={PLACE.trebia} text="Trebia" k={show(T.trebia - 4, T.lured + 16)} color={ROME} dy={-50} />
      {ROMANS_E.map((p, i) => <Block key={`r${i}`} at={[p[0] + SHIFT * wade, p[1]]} k={pop(T.lured - 10 + i * 4, T.eye + 10) * fade} color={ROME} rot={90} w={56} h={22} text={i === 0 && frame < T.mago ? "Romans" : undefined} dy={-50} />)}
      {CARTH_LINE.map((p, i) => <Block key={`c${i}`} at={p} k={pop(T.across + i * 4, T.eye + 10)} color={CARTH} rot={90} w={56} h={22} text={i === 0 && frame < T.mago ? "Hannibal" : undefined} dy={-50} />)}
      {frame >= T.ambushed && frame < T.last + 10 && (
        <g opacity={show(T.ambushed, T.last + 10)}>
          <Arrow points={[[9.43, 45.0], [9.47, 44.99], [9.5, 44.985]]} start={T.ambushed} end={T.ambushed + 14} color={CARTH} width={12} outline="#0b1020" />
          <Arrow points={[[9.45, 44.94], [9.48, 44.935], [9.51, 44.935]]} start={T.ambushed + 4} end={T.ambushed + 18} color={CARTH} width={12} outline="#0b1020" />
        </g>
      )}
      <MapChip at={[9.38, 44.84]} text="approx." k={pop(T.trebia + 10, T.last + 10)} color="#2a3446" size={0.7} />
      {/* Mago in the stream bed, then into the Roman rear */}
      <Block at={MAGO} k={pop(T.hidden, T.eye + 10) * (frame < T.struck ? 0.6 : 1)} color={CARTH} w={60} h={24} rot={-25} />
      <MapChip at={MAGO} text="Mago · 2,000" k={pop(T.magoW, T.last + 10)} color={CARTH} textColor="#1b1d24" dy={56} size={0.8} />
      {frame >= T.struck && frame < T.last + 10 && <Arrow points={[MAGO, [9.56, 44.93], [9.555, 44.965]]} start={T.struck} end={T.struck + 16} color={CARTH} width={16} outline="#0b1020" opacity={show(T.struck, T.last + 10)} />}
      {frame >= T.struck + 16 && frame < T.last + 10 && <Arrow points={[[9.54, 45.01], [9.6, 45.05], [9.68, 45.07]]} start={T.struck + 16} end={T.struck + 40} color={ROME} width={10} variant="dashed" outline="#0b1020" opacity={show(T.struck + 16, T.last + 10)} />}
      {/* over the Apennines into the Arno marshes (approx.) */}
      {frame >= T.rode && frame < T.tras + 20 && <Arrow points={[PLACE.trebia, [10.0, 44.4], [10.5, 44.0], PLACE.arno]} start={T.rode} end={T.marshes} color={CARTH} width={14} variant="dashed" outline="#0b1020" opacity={show(T.rode, T.tras + 20)} />}
      {frame >= T.marshes - 10 && frame < T.tras + 20 && (() => {
        const p = projection(PLACE.arno);
        return p ? <ellipse cx={p[0]} cy={p[1]} rx={110 * s} ry={50 * s} fill="#7fb4d8" opacity={0.4 * show(T.marshes - 10, T.tras + 20)} style={{ filter: `blur(${8 * s}px)` }} /> : null;
      })()}
      <Pin at={PLACE.arno} text="Arno marshes" k={show(T.marshes - 4, T.tras + 20)} color={CARTH} dy={-46} />
      {frame >= T.marshes && frame < T.tras + 30 && <Arrow points={[PLACE.arno, [11.3, 43.55], [11.8, 43.3], [12.0, 43.22]]} start={T.tras} end={T.lake} color={CARTH} width={14} variant="dashed" outline="#0b1020" opacity={show(T.marshes, T.tras + 30)} />}
      {/* Lake Trasimene (positions approx.) */}
      <Pin at={[12.09, 43.14]} text="Lake Trasimene" k={show(T.lake - 4, T.hid + 10)} color={CARTH} dy={-46} />
      {lakeOn && HILLS.map((p, i) => <Block key={`h${i}`} at={p} k={pop(T.hid + i * 5, to + 10)} color={CARTH} w={48} h={20} rot={-6} text={i === 1 && frame < T.trap ? "Hannibal (hidden)" : undefined} dy={-40} size={0.75} />)}
      {lakeOn && frame >= T.marched && <MapLine pts={SHORE} k={interpolate(frame, [T.marched, T.fog + 10], [0, 1], clamp)} color={ROME} width={12} glow={false} opacity={interpolate(frame, [T.hours, T.flaminius], [1, 0.35], clamp)} />}
      <MapChip at={SHORE[0]} text="Romans" k={pop(T.marched, T.trap + 10)} color={ROME} dx={30} dy={60} size={0.8} />
      {lakeOn && fog > 0 && SHORE.map((p, i) => {
        const q = projection(p);
        return q ? <ellipse key={`f${i}`} cx={q[0] + Math.sin(frame * 0.03 + i) * 10 * s} cy={q[1] + 6 * s} rx={110 * s} ry={34 * s} fill="#eef2f4" opacity={0.6 * fog} style={{ filter: `blur(${14 * s}px)` }} /> : null;
      })}
      {lakeOn && sweep > 0 && HILLS.map((p, i) => <Arrow key={`a${i}`} points={[p, [p[0] + 0.005, (p[1] + SHORE[Math.min(i + 1, 4)][1]) / 2], [SHORE[Math.min(i + 1, 4)][0], SHORE[Math.min(i + 1, 4)][1] + 0.004]]} start={T.trap + i * 4} end={T.trap + 22 + i * 4} color={CARTH} width={14} outline="#0b1020" opacity={interpolate(frame, [to - 30, to - 10], [1, 0], clamp)} />)}
      <MapChip at={[12.1, 43.06]} text="positions approx." k={pop(T.hid + 20, to - 30)} color="#2a3446" size={0.7} />
    </g>
  );
};

// ---- the chapter ----

const fmt = (n: number) => (Math.round(n / 1000) * 1000).toLocaleString("en-US");

export const ch6: Chapter = {
  name: "Italy",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(6, w, h) },
    { frame: T.plains - 4, cam: H(6, w, h) },
    { frame: T.plains + 50, cam: view(V.po, w, h, 1, 0.1) },
    { frame: T.half - 6, cam: view(V.po, w, h, 1, 0.1) },
    { frame: T.half + 40, cam: view(V.half, w, h, 1, 0.1) },
    { frame: T.rome, cam: view(V.half, w, h, 1, 0.1) },
    { frame: T.rome + 50, cam: view(V.bat, w, h, 1, 0.1) },
    { frame: T.trebia - 10, cam: view(V.bat, w, h, 1, 0.1) },
    { frame: T.trebia + 30, cam: view(V.treb, w, h, 1, 0.1) },
    { frame: T.last + 4, cam: view(V.treb, w, h, 1, 0.1) },
    { frame: T.last + 50, cam: view(V.bat, w, h, 0.9, 0.1) },
    { frame: T.rode - 10, cam: view(V.bat, w, h, 0.9, 0.1) },
    { frame: T.rode + 40, cam: view(V.arno, w, h, 1, 0.1) },
    { frame: T.lake - 30, cam: view(V.arno, w, h, 1, 0.1) },
    { frame: T.lake + 20, cam: view(V.lake, w, h, 1, 0.1) },
    { frame: to - 56, cam: view(V.lake, w, h, 1, 0.1) },
    { frame: to - 1, cam: H(7, w, h) },
  ],
  years: [[from, "218 BC"], [T.nov, "Nov 218 BC"], [T.treb, "Dec 218 BC"], [T.winter, "Winter 218 BC"], [T.spring, "Spring 217 BC"], [T.june, "June 217 BC"]],
  heads: [
    { f: from, tag: "Out of the Alps", head: "Italy", color: CARTH },
    { f: T.twenty, tag: "Hannibal's own count", head: "Infantry", stat: "20,000", label: "foot", color: CARTH },
    { f: T.six, tag: "Hannibal's own count", head: "Cavalry", stat: "6,000", label: "horse", color: CARTH },
    { f: T.horse - 20, tag: "In Italy", head: "The whole army", stat: "~26,000", label: "men", color: CARTH },
    { f: T.we, tag: "Carved in bronze", head: "His own numbers", color: CARTH, chips: [{ text: "By Hannibal himself", f: T.carved }] },
    { f: T.half, tag: "15 days in the Alps", head: "Half the army", color: RED },
    { f: T.halfW, tag: "Since the Rhône", head: "Gone in the Alps", stat: "−20,000", label: "men", color: RED, chips: [{ text: "Many deserted", f: T.deserted }, { text: "Many died", f: T.died }] },
    { f: T.tic, tag: "Rome", head: "Stunned", color: ROME },
    { f: T.nov, tag: "November 218 BC · approx.", head: "Ticinus", color: ROME, chips: [{ text: "Cavalry win", f: T.routed }, { text: "Scipio wounded", f: T.scipio }] },
    { f: T.treb, tag: "December 218 BC · approx.", head: "Trebia", color: ROME },
    { f: T.forty, tag: "Across an icy river", head: "The lure", stat: "~40,000", label: "Romans", color: ROME, chips: [{ text: "Ambushed", f: T.ambushed }, { text: "~10,000 broke out", f: T.ten }] },
    { f: T.mago, tag: "His brother Mago", head: "The ambush", stat: (f) => fmt(interpolate(f, [T.struck, T.struck + 30], [40000, 10000], { ...clamp, easing: Easing.out(Easing.cubic) })), label: "Romans", color: CARTH, chips: [{ text: "2,000 hidden", f: T.hidden }, { text: "From behind", f: T.struck }] },
    { f: T.last, tag: "Winter 218–217 BC · Polybius", head: "One elephant left", stat: (f) => String(Math.round(interpolate(f, [T.killed - 6, T.one], [37, 1], { ...clamp, easing: Easing.in(Easing.quad) }))), label: "elephants", color: "#9aa3ab" },
    { f: T.eye, tag: "Spring 217 BC", head: "The marshes", color: CARTH, chips: [{ text: "On the last elephant", f: T.rode + 6 }] },
    { f: T.infection, tag: "An infection", head: "He loses an eye", color: RED },
    { f: T.tras, tag: "June 217 BC · approx.", head: "Lake Trasimene", color: CARTH, chips: [{ text: "Hidden in the hills", f: T.hid }, { text: "Morning fog", f: T.fog }] },
    { f: T.trap, tag: "A few hours", head: "The trap", stat: (f) => fmt(interpolate(f, [T.fifteenK - 4, T.fifteenK + 30], [0, 15000], { ...clamp, easing: Easing.out(Easing.cubic) })), label: "Romans killed", color: RED, chips: [{ text: "Consul Flaminius killed", f: T.flaminius }] },
  ],
  Map: () => <Map6 />,
  Panels: () => (
    <g>
      <ArriveScene start={from} end={T.twenty + 14} />
      <FootScene start={T.twenty} end={T.six + 14} />
      <CavalryScene start={T.six} end={T.we + 14} />
      <TabletScene start={T.we} end={T.fifteen + 14} />
      <DaysScene start={T.fifteen} end={T.deserted + 14} />
      <DesertScene start={T.deserted} end={T.rome + 14} />
      <RomeScene start={T.rome} end={T.cavalry + 14} />
      <TicinusScene start={T.cavalry} end={T.consul + 14} />
      <CavalryScene id="c6scipio" roman start={T.consul} end={T.trebia + 14} />
      <WadeScene start={T.trebia} end={T.across + 30 + 14} />
      <LineScene start={T.across + 30} end={T.magoW + 14} />
      <HiddenScene start={T.magoW} end={T.struck + 14} />
      <StrikeScene start={T.struck} end={T.winter + 14} />
      <LoneScene start={T.winter} end={T.rode + 14} />
      <MarshScene start={T.rode} end={T.infection + 14} />
      <EyeScene start={T.infection} end={T.hid + 14} />
      <HillsScene start={T.hid} end={T.marched + 14} />
      <FogScene start={T.marched} end={T.fifteenK + 14} />
      <TrapScene start={T.fifteenK} end={to + 14} />
    </g>
  ),
  sfx: [
    [T.plains - 4, SFX.whoosh, 0.35],
    [T.italy, SFX.pop, 0.35],
    [T.twenty, SFX.hit, 0.35],
    [T.foot, SFX.pop, 0.35],
    [T.six, SFX.hit, 0.35],
    [T.thou2, SFX.pop, 0.35],
    [T.horse - 20, SFX.hit, 0.4],
    [T.carved, SFX.pop, 0.35],
    [T.half - 6, SFX.whoosh, 0.4],
    [T.halfW, SFX.hit, 0.45],
    [T.deserted, SFX.pop, 0.3],
    [T.rome - 6, SFX.whoosh, 0.4],
    [T.ticinus, SFX.pop, 0.4],
    [T.cavalry, SFX.whoosh, 0.3],
    [T.scipio, SFX.pop, 0.35],
    [T.trebia, SFX.pop, 0.4],
    [T.forty, SFX.hit, 0.4],
    [T.ambushed, SFX.hit, 0.35],
    [T.trebia - 16, SFX.whoosh, 0.4],
    [T.magoW, SFX.pop, 0.35],
    [T.struck, SFX.hit, 0.45],
    [T.last, SFX.whoosh, 0.3],
    [T.killed, SFX.tick, 0.3],
    [T.one, SFX.hit, 0.4],
    [T.rode - 10, SFX.whoosh, 0.4],
    [T.marshes, SFX.pop, 0.35],
    [T.lostEye, SFX.hit, 0.35],
    [T.lake - 30, SFX.whoosh, 0.4],
    [T.lake, SFX.pop, 0.35],
    [T.hid, SFX.pop, 0.35],
    [T.fog, SFX.swell, 0.3],
    [T.trap, SFX.hit, 0.45],
    [T.flaminius, SFX.pop, 0.4],
    [to - 60, SFX.whoosh, 0.4],
  ],
};
