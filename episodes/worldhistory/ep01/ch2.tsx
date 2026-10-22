import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { useMap } from "../../../components/Map";
import { bbox, region } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { BLUE, clamp, display, GOLD, Panel, Pin, RED, Rivers, RUS, view, type Chapter } from "../kit/news";
import { FRENCH, Napoleon, POLISH, RUSSIAN, Soldier } from "../kit/Period";
import { AREA_1810, AreaName, BattleMark, BritainGlow, Cannon, Crate, Dagger, Desk, Flag, LandClip, Logs, MapLine, MapNote, MapTable, Quay, Bale, RaftPavilion, Sack, Scroll, Sea, Ship, SoftArea, Tsar, type ShipFlag } from "../kit/PeriodA";
import { CITY } from "./minard";
import { B, span, wf } from "./time";

// Chapter 2 "Why invade Russia?" (beats blockade → decide): the Continental System, Tilsit, Russia's trade,
// the 1810 ukase, the Duchy of Warsaw, and the plan: a dashed arrow Neman → Moscow (handed to ch3).
const [from, to] = span("ch2");

type LL = [number, number];
const P = {
  london: [-0.13, 51.5] as LL,
  hamburg: [9.99, 53.55] as LL,
  friedland: [21.02, 54.45] as LL,
  tilsit: CITY.tilsit,
  riga: [24.1, 56.95] as LL,
  petersburg: CITY.petersburg,
  warsaw: CITY.warsaw,
  kovno: CITY.kovno,
  moscow: CITY.moscow,
};

const V = {
  east: bbox([[-8, 42], [44, 62]]), // where ch1 ends
  blockade: bbox([[-10, 40], [32, 60]]),
  tilsit: bbox([[16, 52.5], [28, 57.5]]),
  trade: bbox([[-6, 50], [34, 62]]),
  poland: bbox([[13, 49], [31, 57]]),
  plan: bbox([[19, 52], [39, 57.5]]),
};

const T = {
  napoleon: wf("blockade", "Napoleon", 0.13),
  britain: wf("blockade", "Britain", 0.34),
  money: wf("blockade", "money", 0.43),
  banned: wf("blockade", "banned", 0.75),
  tilsit: B.tilsit.start,
  defeat: wf("tilsit", "defeat", 0.2),
  friedland: wf("tilsit", "Friedland,", 0.28),
  tsar: wf("tilsit", "Tsar", 0.37),
  peace: wf("tilsit", "peace", 0.54),
  raft: wf("tilsit", "raft", 0.6),
  river: wf("tilsit", "river,", 0.75),
  agreed: wf("tilsit", "agreed", 0.84),
  hurt: B.hurt.start,
  selling: wf("hurt", "selling", 0.2),
  grain: wf("hurt", "grain,", 0.29),
  timber: wf("hurt", "timber", 0.42),
  hemp: wf("hurt", "hemp", 0.54),
  ban: wf("hurt", "ban", 0.76),
  ukase: B.ukase.start,
  last: wf("ukase", "last", 0.05),
  alexander: wf("ukase", "Alexander", 0.25),
  ports: wf("ukase", "ports", 0.38),
  neutral: wf("ukase", "neutral", 0.43),
  taxes: wf("ukase", "taxes", 0.65),
  practice: wf("ukase", "practice,", 0.83),
  walked: wf("ukase", "walked", 0.94),
  poland: B.poland.start,
  pol: wf("poland", "Poland.", 0.2),
  polish: wf("poland", "Polish", 0.37),
  border: wf("poland", "border.", 0.62),
  ptsar: wf("poland", "Tsar", 0.77),
  knife: wf("poland", "knife", 0.83),
  decide: B.decide.start,
  dnap: wf("decide", "Napoleon", 0.09),
  march: wf("decide", "March", 0.37),
  russia: wf("decide", "Russia,", 0.47),
  battle: wf("decide", "battle,", 0.55),
  force: wf("decide", "force", 0.68),
  short: wf("decide", "short", 0.9),
};
const END = to;

const EMPIRE = region(AREA_1810.empire);
const ILLYRIA = region(AREA_1810.illyria);
const SATS = [AREA_1810.spain, AREA_1810.rhine, AREA_1810.swiss, AREA_1810.italy, AREA_1810.naples].map(region);
const WARSAW = region(AREA_1810.warsaw);
const RUSSIA = region(AREA_1810.russia);
const LIGHT = "#9fd0ff";

// The Continental System's coast, Spain → the Prussian Baltic (approximate), and Russia's coast added at Tilsit.
const COAST: LL[] = [[-6.3, 36.6], [-9.6, 38.8], [-9.6, 43.2], [-1.9, 43.7], [-1.6, 46.2], [-4.9, 48.2], [-1.6, 49.9], [1.6, 51.1], [4.0, 51.9], [4.7, 53.2], [8.4, 54.0], [8.0, 56.5], [10.4, 57.9], [12.4, 56.0], [12.6, 54.6], [14.2, 54.3], [18.6, 54.8], [21.0, 55.6]];
const COAST_RU: LL[] = [[21.0, 55.6], [20.9, 57.2], [22.2, 57.8], [23.9, 57.3], [23.2, 59.1], [27.5, 59.8], [30.0, 60.0]];
// Sea lanes Russia → Britain (approximate).
const LANE_SPB: LL[] = [[30.0, 59.95], [26.5, 59.9], [22.5, 59.3], [19.8, 57.6], [18.4, 55.8], [13.6, 55.1], [12.7, 55.9], [11.4, 57.5], [8.8, 57.9], [4.5, 56.2], [1.6, 52.8], [0.6, 51.6]];
const LANE_RIGA: LL[] = [[23.9, 57.1], [21.6, 57.6], [19.6, 57.0], [18.4, 55.8], [13.6, 55.1], [12.7, 55.9], [11.4, 57.5], [8.8, 57.9], [4.5, 56.3], [1.6, 52.9], [0.6, 51.7]];
const PLAN: LL[] = [P.kovno, [25.3, 54.7], [28.3, 55.0], [30.2, 55.2], [32, 54.8], [35.0, 55.4], P.moscow];

const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

// Ships sailing from the open sea toward the coast and turned back at the barrier.
const TURNED: [LL, LL][] = [[[-7.5, 47.2], [-2.6, 46.4]], [[1.5, 54.6], [4.3, 52.9]], [[5.0, 56.6], [7.8, 55.0]]];
const TurnedShips = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const k = fade(frame, T.money, T.tilsit + 10);
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {TURNED.map(([a, b], i) => {
        const go = interpolate(frame, [T.money + i * 6, T.banned + 12], [0, 0.9], clamp);
        const back = interpolate(frame, [T.banned + 16, T.banned + 70], [0, 0.9], clamp);
        const t = go - back;
        const pa = projection(a);
        const pb = projection(b);
        if (!pa || !pb) return null;
        const x = pa[0] + (pb[0] - pa[0]) * t;
        const y = pa[1] + (pb[1] - pa[1]) * t;
        const toward = pb[0] > pa[0];
        const flip = back > 0 ? toward : !toward;
        return (
          <g key={i}>
            <Ship x={x} y={y + 8 * s} scale={0.2 * s} kind="merchant" flag="british" flip={flip} phase={i} />
            {frame > T.banned + 10 && frame < T.banned + 70 && (
              <text x={x} y={y - 40 * s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={44 * s} fill={RED} stroke="#0b1020" strokeWidth={7 * s} paintOrder="stroke">✕</text>
            )}
          </g>
        );
      })}
    </g>
  );
};

// Small ships riding a sea lane (for the neutral-flag trade).
const LaneShips = ({ lane, k, flag, n = 2, f0 }: { lane: LL[]; k: number; flag: ShipFlag; n?: number; f0: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = lane.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = (u: number) => {
    let d = u * total;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i]) {
        const t = d / (seg[i] || 1);
        return [xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t, xy[i + 1][0] - xy[i][0]];
      }
      d -= seg[i];
    }
    return [xy[xy.length - 1][0], xy[xy.length - 1][1], -1];
  };
  return (
    <g opacity={Math.min(1, k)}>
      {Array.from({ length: n }, (_, i) => {
        const u = (((frame - f0) / 150 + i / n) % 1 + 1) % 1;
        const [x, y, dx] = at(u);
        return <Ship key={i} x={x} y={y + 8 * s} scale={0.18 * s} kind="merchant" flag={flag} flip={dx < 0} phase={i} />;
      })}
    </g>
  );
};

const MapLayer = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  // Europe of 1810 carried over from ch1, fading back as the story moves east
  const eu = interpolate(frame, [T.hurt, T.hurt + 20, T.poland, T.poland + 20, T.decide, T.decide + 20], [0.75, 0.4, 0.4, 0.55, 0.55, 0.25], clamp);
  const war = interpolate(frame, [T.pol - 6, T.pol + 12, T.decide, T.decide + 20], [0, 1, 1, 0.5], clamp);
  const lanesOn = interpolate(frame, [T.selling, T.selling + 10], [0, 1], clamp);
  const grey = interpolate(frame, [T.ban, T.ban + 16, T.neutral, T.neutral + 12], [0, 1, 1, 0], clamp);
  const lanesOff = interpolate(frame, [T.walked + 30, T.poland + 10], [1, 0], clamp);
  const ruBarrier = interpolate(frame, [T.walked - 4, T.walked + 14], [1, 0.25], clamp);
  const barrier = interpolate(frame, [T.poland, T.poland + 20], [1, 0], clamp);
  const dag = projection([24.6, 52.4]);
  const dagK = interpolate(frame, [T.knife - 4, T.knife + 8, T.decide, T.decide + 12], [0, 1, 1, 0], clamp);
  return (
    <g>
      <LandClip id="a2land" />
      <g opacity={eu}>
        {SATS.map((f, i) => <SoftArea key={i} feature={f} color={LIGHT} k={1} clip="a2land" fill={0.32} />)}
        <SoftArea feature={EMPIRE} color={BLUE} k={1} clip="a2land" fill={0.55} edge="#d6ecff" />
        <SoftArea feature={ILLYRIA} color={BLUE} k={1} clip="a2land" fill={0.55} edge="#d6ecff" />
      </g>
      <SoftArea feature={WARSAW} color={LIGHT} k={eu * (1 - war)} clip="a2land" fill={0.32} />
      <SoftArea feature={WARSAW} color={BLUE} k={war} clip="a2land" fill={0.6} edge="#ffffff" />
      <SoftArea feature={RUSSIA} color={RUS} k={interpolate(frame, [T.decide, T.decide + 20], [1, 0.6], clamp)} clip="a2land" fill={0.35} />
      <BritainGlow k={interpolate(frame, [T.poland, T.poland + 20], [1, 0], clamp)} />
      <MapNote text="Borders approximate" k={fade(frame, from, T.tilsit + 10) + fade(frame, T.pol, T.decide + 10)} y={0.535} x={0.94} anchor="end" />

      {/* the ban: a red barrier along the coast, ships turned back */}
      <MapLine pts={COAST} k={interpolate(frame, [T.banned - 4, T.banned + 26], [0, 1], clamp)} color={RED} width={6} opacity={barrier} />
      <MapLine pts={COAST_RU} k={interpolate(frame, [T.agreed - 4, T.agreed + 24], [0, 1], clamp)} color={RED} width={6} opacity={barrier * ruBarrier} dash={frame >= T.walked ? `${10 * s} ${14 * s}` : undefined} />
      <TurnedShips />

      {/* Tilsit */}
      <Pin at={P.friedland} text="Friedland" k={fade(frame, T.friedland - 4, T.hurt + 10)} color={BLUE} dy={78} size={0.85} />
      <BattleMark at={P.friedland} start={T.friedland - 4} end={T.raft} size={40} />
      <Pin at={P.tilsit} text="Tilsit" k={fade(frame, T.raft - 4, T.hurt + 10)} color={GOLD} />
      <Rivers hi={{ Neman: fade(frame, T.river - 6, T.hurt) + fade(frame, T.march - 10, END + 30) }} />

      {/* Russia's trade with Britain */}
      <g opacity={lanesOn * (1 - grey) * lanesOff}>
        <Arrow points={LANE_SPB} start={T.selling} end={T.grain + 20} color={GOLD} width={14} />
        <Arrow points={LANE_RIGA} start={T.selling + 8} end={T.grain + 28} color={GOLD} width={12} />
      </g>
      <g opacity={grey * lanesOff}>
        <Arrow points={LANE_SPB} start={T.selling} end={T.selling + 1} color="#8a8f96" width={14} outline="#2a2c30" />
        <Arrow points={LANE_RIGA} start={T.selling} end={T.selling + 1} color="#8a8f96" width={12} outline="#2a2c30" />
      </g>
      <LaneShips lane={LANE_SPB} k={fade(frame, T.neutral, T.poland + 10)} flag="neutral" f0={T.neutral} />
      <LaneShips lane={LANE_RIGA} k={fade(frame, T.neutral + 8, T.poland + 10)} flag="neutral" n={1} f0={T.neutral} />
      <Pin at={P.petersburg} text="St Petersburg" k={fade(frame, T.hurt + 4, T.poland + 10)} color={RUS} size={0.8} />
      <Pin at={P.riga} text="Riga" k={fade(frame, T.hurt + 10, T.poland + 10)} color={RUS} size={0.8} />
      <Pin at={P.london} text="London" k={fade(frame, T.hurt + 16, T.poland + 10)} color={RED} size={0.8} />

      {/* Poland */}
      <AreaName at={[19.6, 51.6]} text="Duchy of Warsaw" k={fade(frame, T.polish - 4, T.decide + 10)} size={0.62} />
      <AreaName at={[28.5, 55.6]} text="Russia" k={fade(frame, T.pol, T.decide + 10)} color="#bff0cf" size={0.8} />
      <MapLine pts={AREA_1810.border} k={interpolate(frame, [T.border - 6, T.border + 16], [0, 1], clamp)} color={RED} width={7} opacity={interpolate(frame, [T.decide, T.decide + 12], [1, 0], clamp)} />
      {dag && <Dagger x={dag[0]} y={dag[1]} size={80 * s} rot={-10} k={dagK} />}

      {/* the plan */}
      <Pin at={P.kovno} text="Neman" k={fade(frame, T.dnap, END + 30)} color={GOLD} size={0.8} />
      <Pin at={P.moscow} text="Moscow" k={fade(frame, T.russia - 4, END + 30)} color={RED} size={0.9} />
      <Arrow points={PLAN} start={T.march} end={T.russia + 14} color={GOLD} width={20} variant="dashed" opacity={interpolate(frame, [END, END + 20], [1, 0], clamp)} />
      <BattleMark at={[33.6, 55.2]} start={T.battle - 4} end={END + 20} size={44} />
    </g>
  );
};

// ---- Panels ----

// A British merchantman unloads at a continental quay.
const TradeScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a2trade" anchor={P.hamburg} start={start} end={end} sky={["#6a90b8", "#e8e0c8"]} accent={GOLD}>
    {(g) => {
      const quay = g.ground - 30 * g.s;
      return (
        <g>
          <Sea x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} color="#3a6a8a" />
          <Ship x={g.x + g.W * 0.72} y={g.ground - 40 * g.s} scale={g.sc * 0.55} kind="merchant" flag="british" />
          <Quay x={g.x} y={quay} W={g.W * 0.45} s={g.s} />
          {[[0.06, "#a87d4a"], [0.16, "#8a6440"], [0.11, "#b8905a"]].map(([fx, c], i) => (
            <Crate key={i} x={g.x + g.W * (fx as number)} y={quay - (i === 2 ? 44 * g.sc * 0.7 : 0)} s={g.sc * 0.7} color={c as string} />
          ))}
          <Sack x={g.x + g.W * 0.27} y={quay} s={g.sc * 0.7} />
          <Sack x={g.x + g.W * 0.33} y={quay} s={g.sc * 0.7} rot={6} />
        </g>
      );
    }}
  </Panel>
);

// The ban: a barrier on the quay, a French sentry, the merchantman sails away.
const BannedScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2banned" anchor={P.hamburg} start={start} end={end} sky={["#6a7a8a", "#d8d0c0"]} accent={RED}>
      {(g) => {
        const quay = g.ground - 30 * g.s;
        const away = interpolate(frame, [start, end], [0, 1], clamp);
        const bar = interpolate(frame, [start + 4, start + 16], [-80, 0], clamp);
        return (
          <g>
            <Sea x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} color="#3a6a8a" />
            <Ship x={g.x + g.W * (0.72 + away * 0.25)} y={g.ground - 40 * g.s} scale={g.sc * 0.5} kind="merchant" flag="british" />
            <Quay x={g.x} y={quay} W={g.W * 0.45} s={g.s} />
            <rect x={g.x + g.W * 0.4} y={quay - 70 * g.s} width={12 * g.s} height={70 * g.s} fill="#4a3424" />
            <g transform={`translate(${g.x + g.W * 0.4 + 6 * g.s},${quay - 60 * g.s}) rotate(${bar})`}>
              {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-i * 30 * g.s - 30 * g.s} y={-6 * g.s} width={30 * g.s} height={12 * g.s} fill={i % 2 ? "#f4f2ea" : RED} stroke="#1b1d24" strokeWidth={1.2 * g.s} />)}
            </g>
            <Soldier x={g.x + g.W * 0.12} y={quay} scale={g.sc * 0.7} pose="stand" u={FRENCH} />
            <Flag x={g.x + g.W * 0.24} y={quay} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// Friedland 1807: French guns, the Russians withdraw through the smoke.
const FriedlandScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2friedland" anchor={P.friedland} start={start} end={end} sky={["#7a7a8a", "#e0c8a0"]} accent={BLUE}>
      {(g) => (
        <g>
          {[0.45, 0.7].map((fx, i) => (
            <g key={i} opacity={0.5}>
              {[[-40, 10, 34], [0, 0, 46], [44, 12, 30]].map(([dx, dy, r], j) => <circle key={j} cx={g.x + g.W * fx + (dx + Math.sin(frame * 0.02 + i + j) * 12) * g.s} cy={g.ground - (120 - dy) * g.s} r={r * g.s} fill="#ece8de" />)}
            </g>
          ))}
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a8a52" />
          <Cannon x={g.x + g.W * 0.12} y={g.ground + 4 * g.s} scale={g.sc * 0.65} fire={((frame - start) % 40) / 40} />
          <Cannon x={g.x + g.W * 0.3} y={g.ground + 12 * g.s} scale={g.sc * 0.65} fire={((frame - start + 20) % 40) / 40} />
          {[0, 1, 2, 3].map((i) => (
            <Soldier key={i} x={g.x + g.W * (0.6 + i * 0.1) + (frame - start) * 0.9 * g.s} y={g.ground + (i % 2 ? 8 : 18) * g.s} scale={g.sc * 0.62} u={RUSSIAN} phase={i} />
          ))}
        </g>
      )}
    </Panel>
  );
};

// Tsar Alexander I with his guards.
const TsarScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a2tsar" anchor={P.tilsit} start={start} end={end} sky={["#4a6a5a", "#d8e0c8"]} accent={RUS}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#6f7f4a" />
        <Flag x={g.cx + 90 * g.s} y={g.ground + 10 * g.s} s={g.s * 1.1} colors={["#f4f2ea", "#2f6fb3", "#c8312b"]} />
        <Soldier x={g.x + g.W * 0.2} y={g.ground + 20 * g.s} scale={g.sc * 0.72} pose="stand" u={RUSSIAN} />
        <Soldier x={g.x + g.W * 0.8} y={g.ground + 20 * g.s} scale={g.sc * 0.72} pose="stand" u={RUSSIAN} flip phase={2} />
        <Tsar x={g.cx} y={g.ground + 24 * g.s} scale={g.sc * 0.9} />
      </g>
    )}
  </Panel>
);

// The raft on the Neman: two emperors meet in front of the pavilion.
const RaftScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2raft" anchor={P.tilsit} start={start} end={end} sky={["#5d8fc4", "#f2e0b8"]} accent={GOLD}>
      {(g) => {
        const water = g.ground - 40 * g.s;
        const meet = interpolate(frame, [start + 6, start + 40], [60, 0], clamp) * g.s;
        return (
          <g>
            <rect x={g.x} y={water - 30 * g.s} width={g.W} height={30 * g.s} fill="#6f8a52" />
            <Sea x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#4d7591" />
            <RaftPavilion x={g.cx} y={water + 14 * g.s} s={g.s * 0.95} />
            <Napoleon x={g.cx - 60 * g.s - meet} y={water + 2 * g.s} scale={g.sc * 0.62} />
            <Tsar x={g.cx + 60 * g.s + meet} y={water + 2 * g.s} scale={g.sc * 0.62} flip />
          </g>
        );
      }}
    </Panel>
  );
};

// Russia's export port: a ship loading grain, timber and hemp, one cargo per word.
const PortScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2port" anchor={P.petersburg} start={start} end={end} sky={["#6a90b8", "#f0e2c0"]} accent={GOLD}>
      {(g) => {
        const quay = g.ground - 30 * g.s;
        const on = (f: number) => interpolate(frame, [f - 4, f + 6], [0, 1], clamp);
        return (
          <g>
            <Sea x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} color="#3a6a8a" />
            <Ship x={g.x + g.W * 0.75} y={g.ground - 40 * g.s} scale={g.sc * 0.55} kind="merchant" flag="british" />
            <Quay x={g.x} y={quay} W={g.W * 0.5} s={g.s} />
            <g opacity={on(T.grain)}>
              {[0.05, 0.1, 0.075].map((fx, i) => <Sack key={i} x={g.x + g.W * fx} y={quay - (i === 2 ? 36 * g.sc * 0.7 : 0)} s={g.sc * 0.7} rot={i * 4} />)}
            </g>
            <g opacity={on(T.timber)}>
              <Logs x={g.x + g.W * 0.3} y={quay} s={g.sc * 0.7} />
            </g>
            <g opacity={on(T.hemp)}>
              <Bale x={g.x + g.W * 0.4} y={quay} s={g.sc * 0.7} />
              <Bale x={g.x + g.W * 0.46} y={quay} s={g.sc * 0.62} />
            </g>
            {[[T.grain, "GRAIN", 0.08], [T.timber, "TIMBER", 0.26], [T.hemp, "HEMP", 0.43]].map(([f, t, fx]) => (
              <text key={t as string} x={g.x + g.W * (fx as number)} y={g.y + 130 * g.s} textAnchor="middle" opacity={on(f as number)} fontFamily={display} fontWeight={700} fontSize={34 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke">{t as string}</text>
            ))}
          </g>
        );
      }}
    </Panel>
  );
};

// The ban bites: an empty quay, sacks rotting, no ships.
const IdleScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a2idle" anchor={P.riga} start={start} end={end} sky={["#5a636e", "#a8b0b6"]} accent="#9aa4ad">
    {(g) => {
      const quay = g.ground - 30 * g.s;
      return (
        <g>
          <Sea x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} color="#45606f" />
          <Quay x={g.x} y={quay} W={g.W * 0.62} s={g.s} />
          {[0.06, 0.12, 0.18, 0.09, 0.15, 0.24, 0.3].map((fx, i) => <Sack key={i} x={g.x + g.W * fx} y={quay - (i >= 3 && i < 5 ? 34 * g.sc * 0.7 : 0)} s={g.sc * 0.7} rot={(i % 3) * 8 - 6} rotten={1} />)}
          <Logs x={g.x + g.W * 0.5} y={quay} s={g.sc * 0.6} />
          <line x1={g.x + g.W * 0.62} y1={quay} x2={g.x + g.W * 0.62} y2={quay - 40 * g.s} stroke="#3a2a1c" strokeWidth={8 * g.s} />
        </g>
      );
    }}
  </Panel>
);

// 31 December 1810: the Tsar signs at his desk.
const DecreeScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a2decree" anchor={P.petersburg} start={start} end={end} sky={["#2f4a3a", "#5a7a62"]} accent={RUS}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a3a2a" />
        <rect x={g.x + g.W * 0.66} y={g.y + 60 * g.s} width={160 * g.s} height={150 * g.s} fill="#efe3c0" stroke="#1b1d24" strokeWidth={2 * g.s} />
        <text x={g.x + g.W * 0.66 + 80 * g.s} y={g.y + 110 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={64 * g.s} fill={RED}>31</text>
        <text x={g.x + g.W * 0.66 + 80 * g.s} y={g.y + 150 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={30 * g.s} fill="#3a2a1c">DEC 1810</text>
        <Desk x={g.x + g.W * 0.36} y={g.ground + 6 * g.s} s={g.sc * 0.9} />
        <Tsar x={g.x + g.W * 0.2} y={g.ground + 16 * g.s} scale={g.sc * 0.85} />
      </g>
    )}
  </Panel>
);

// Ports reopen: merchantmen under neutral flags load at the quay.
const NeutralScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2neutral" anchor={P.riga} start={start} end={end} sky={["#6a90b8", "#f0e2c0"]} accent={GOLD}>
      {(g) => {
        const quay = g.ground - 30 * g.s;
        const m = interpolate(frame, [start, start + 40], [200, 0], clamp) * g.s;
        return (
          <g>
            <Sea x={g.x} y={g.ground - 90 * g.s} W={g.W} H={g.H} s={g.s} color="#3a6a8a" />
            <Ship x={g.x + g.W * 0.58 + m} y={g.ground - 40 * g.s} scale={g.sc * 0.5} kind="merchant" flag="neutral" />
            <Ship x={g.x + g.W * 0.88 + m * 1.4} y={g.ground - 52 * g.s} scale={g.sc * 0.4} kind="merchant" flag="neutral" phase={2} />
            <Quay x={g.x} y={quay} W={g.W * 0.4} s={g.s} />
            {[0.05, 0.11, 0.08].map((fx, i) => <Sack key={i} x={g.x + g.W * fx} y={quay - (i === 2 ? 36 * g.sc * 0.7 : 0)} s={g.sc * 0.7} rot={i * 4} />)}
            <Bale x={g.x + g.W * 0.2} y={quay} s={g.sc * 0.7} />
            <Logs x={g.x + g.W * 0.36} y={quay} s={g.sc * 0.6} />
          </g>
        );
      }}
    </Panel>
  );
};

// Taxes on French goods: crates stamped TAX.
const TaxScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2tax" anchor={P.petersburg} start={start} end={end} sky={["#6a7a8a", "#d8d0c0"]} accent={RED}>
      {(g) => {
        const k = interpolate(frame, [T.taxes + 8, T.taxes + 16], [2.2, 1], clamp);
        const o = interpolate(frame, [T.taxes + 8, T.taxes + 12], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a7a5a" />
            {[0.25, 0.4, 0.55, 0.325, 0.475].map((fx, i) => (
              <Crate key={i} x={g.x + g.W * fx} y={g.ground + 10 * g.s - (i >= 3 ? 44 * g.sc * 0.9 : 0)} s={g.sc * 0.9} label="FRENCH GOODS" color="#4f6a9a" />
            ))}
            <Flag x={g.x + g.W * 0.1} y={g.ground + 10 * g.s} s={g.s} />
            <g transform={`translate(${g.x + g.W * 0.78},${g.y + g.H * 0.48}) rotate(-12) scale(${k})`} opacity={o}>
              <rect x={-90 * g.s} y={-40 * g.s} width={180 * g.s} height={80 * g.s} rx={10 * g.s} fill="none" stroke={RED} strokeWidth={8 * g.s} />
              <text x={0} y={24 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={66 * g.s} fill={RED}>TAX</text>
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// "He had walked out": the Tilsit treaty tears in two.
const TornScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2torn" anchor={P.petersburg} start={start} end={end} sky={["#3a2a3a", "#8a5a5a"]} accent={RED}>
      {(g) => (
        <g>
          <Scroll x={g.cx} y={g.y + g.H * 0.55} s={g.s * 1.3} tear={interpolate(frame, [T.walked + 2, T.walked + 22], [0, 1], clamp)} title="TILSIT" sub="1807" />
        </g>
      )}
    </Panel>
  );
};

// The Duchy of Warsaw: Polish soldiers under the white and red flag.
const PolesScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a2poles" anchor={P.warsaw} start={start} end={end} sky={["#7a9ac0", "#efe2c8"]} accent={BLUE}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a8a52" />
        <Flag x={g.cx} y={g.ground + 10 * g.s} s={g.s * 1.2} colors={["#f4f2ea", "#c8312b"]} horizontal />
        {[0.12, 0.24, 0.36, 0.64, 0.76, 0.88].map((fx, i) => <Soldier key={i} x={g.x + g.W * fx} y={g.ground + 20 * g.s} scale={g.sc * 0.7} pose="stand" u={POLISH} flip={fx > 0.5} phase={i} />)}
      </g>
    )}
  </Panel>
);

// The Tsar studies the map: a blade at Russia's border.
const ThreatScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2threat" anchor={[25.5, 53.5]} start={start} end={end} sky={["#2f4a3a", "#4a6a52"]} accent={RED}>
      {(g) => {
        const bx = g.x + g.W * 0.45;
        const by = g.y + 60 * g.s;
        const k = interpolate(frame, [T.knife - 2, T.knife + 10], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#5a3a2a" />
            <rect x={bx} y={by} width={360 * g.s} height={200 * g.s} fill="#e8dcb8" stroke="#1b1d24" strokeWidth={2 * g.s} />
            <path d={`M${bx + 30 * g.s} ${by + 70 * g.s} L${bx + 150 * g.s} ${by + 60 * g.s} L${bx + 170 * g.s} ${by + 150 * g.s} L${bx + 40 * g.s} ${by + 160 * g.s} Z`} fill={BLUE} opacity={0.75} />
            <path d={`M${bx + 170 * g.s} ${by} L${bx + 360 * g.s} ${by} L${bx + 360 * g.s} ${by + 200 * g.s} L${bx + 175 * g.s} ${by + 200 * g.s} L${bx + 170 * g.s} ${by + 150 * g.s} L${bx + 150 * g.s} ${by + 60 * g.s} Z`} fill={RUS} opacity={0.6} />
            <path d={`M${bx + 150 * g.s} ${by + 60 * g.s} L${bx + 170 * g.s} ${by + 150 * g.s}`} stroke={RED} strokeWidth={5 * g.s} />
            <Dagger x={bx + 110 * g.s} y={by + 110 * g.s} size={110 * g.s} rot={-8} k={k} />
            <Tsar x={g.x + g.W * 0.24} y={g.ground + 16 * g.s} scale={g.sc * 0.9} />
          </g>
        );
      }}
    </Panel>
  );
};

// The decision: Napoleon over the map table.
const DecisionScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2decision" anchor={P.kovno} start={start} end={end} sky={["#2a2440", "#5a4a5a"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a20" />
          <MapTable x={g.cx + 60 * g.s} y={g.ground + 10 * g.s} s={g.sc * 0.95} arrow={interpolate(frame, [start + 10, start + 50], [0, 1], clamp)} />
          <Napoleon x={g.cx - 230 * g.s} y={g.ground + 16 * g.s} scale={g.sc * 0.9} />
        </g>
      )}
    </Panel>
  );
};

// Columns march east behind the eagle.
const MarchScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a2march" anchor={P.kovno} start={start} end={end} sky={["#e0905a", "#f8dcb0"]} accent={GOLD}>
      {(g) => {
        const m = (frame - start) * 0.9 * g.s;
        return (
          <g>
            <circle cx={g.x + g.W * 0.84} cy={g.ground - 140 * g.s} r={36 * g.s} fill="#ffe2a0" opacity={0.85} />
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#8a8a52" />
            {Array.from({ length: 9 }, (_, i) => (
              <Soldier key={i} x={g.x - 40 * g.s + i * 68 * g.s + m} y={g.ground + (i % 2 ? 10 : 22) * g.s} scale={g.sc * 0.64} phase={i * 0.8} u={i % 4 === 2 ? POLISH : FRENCH} />
            ))}
            <Flag x={g.x - 40 * g.s + 8.4 * 68 * g.s + m} y={g.ground + 18 * g.s} s={g.s} eagle />
          </g>
        );
      }}
    </Panel>
  );
};

export const ch2: Chapter = {
  name: "Why invade Russia?",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V.east, w, h, 1, 0.05) },
    { frame: from + 10, cam: view(V.east, w, h, 1, 0.05) },
    { frame: from + 45, cam: view(V.blockade, w, h, 1, 0.05) },
    { frame: T.tilsit, cam: view(V.blockade, w, h, 1, 0.05) },
    { frame: T.tilsit + 40, cam: view(V.tilsit, w, h, 1, 0.08) },
    { frame: T.agreed - 6, cam: view(V.tilsit, w, h, 1, 0.08) },
    { frame: T.agreed + 30, cam: view(V.trade, w, h, 1, 0.08) },
    { frame: T.poland, cam: view(V.trade, w, h, 1, 0.08) },
    { frame: T.poland + 40, cam: view(V.poland, w, h, 1, 0.08) },
    { frame: T.decide, cam: view(V.poland, w, h, 1, 0.08) },
    { frame: T.decide + 40, cam: view(V.plan, w, h, 1, 0.08) },
    { frame: END - 1, cam: view(V.plan, w, h, 1, 0.08) },
  ],
  years: [[from, "1806"], [T.tilsit, "1807"], [T.hurt, "1807–1810"], [T.last, "Dec 1810"], [T.decide, "1812"]],
  heads: [
    { f: from, tag: "1806", head: "Beat Britain with money", color: GOLD },
    { f: T.banned, tag: "The Continental System", head: "No trade with Britain", color: RED },
    { f: T.tilsit, tag: "1807", head: "Defeat at Friedland", color: RUS },
    { f: T.tsar, tag: "Tsar Alexander I", head: "Peace on a raft", color: RUS },
    { f: T.agreed, tag: "Treaty of Tilsit, 1807", head: "Russia joins the ban", color: RED },
    { f: T.hurt, tag: "Russia's trade", head: "Selling to Britain", color: GOLD, chips: [{ text: "grain", f: T.grain }, { text: "timber", f: T.timber }, { text: "hemp", f: T.hemp }] },
    { f: T.ban, tag: "The ban", head: "Strangling the economy", color: RED },
    { f: T.ukase, tag: "31 December 1810", head: "Ports reopened", color: RUS, chips: [{ text: "neutral ships in", f: T.neutral }, { text: "taxes on French goods", f: T.taxes }] },
    { f: T.practice, tag: "In practice", head: "Russia breaks the ban", color: RED },
    { f: T.poland, tag: "And then there was Poland", head: "Duchy of Warsaw", color: BLUE },
    { f: T.border, tag: "On Russia's border", head: "A knife at the throat", color: RED },
    { f: T.decide, tag: "1812", head: "Napoleon decides", color: GOLD },
    { f: T.march, tag: "The plan", head: "March into Russia", color: GOLD, chips: [{ text: "one big battle", f: T.battle }, { text: "Tsar back in line", f: T.force }, { text: "a short war", f: T.short }] },
  ],
  Map: () => <MapLayer />,
  Panels: () => (
    <g>
      <TradeScene start={T.britain} end={T.banned + 14} />
      <BannedScene start={T.banned} end={T.defeat + 14} />
      <FriedlandScene start={T.defeat} end={T.tsar + 14} />
      <TsarScene start={T.tsar} end={T.peace + 14} />
      <RaftScene start={T.peace} end={T.selling + 14} />
      <PortScene start={T.selling} end={T.ban + 14} />
      <IdleScene start={T.ban} end={T.last + 14} />
      <DecreeScene start={T.last} end={T.ports + 14} />
      <NeutralScene start={T.ports} end={T.taxes + 14} />
      <TaxScene start={T.taxes} end={T.practice + 14} />
      <TornScene start={T.practice} end={T.polish + 14} />
      <PolesScene start={T.polish} end={T.ptsar + 14} />
      <ThreatScene start={T.ptsar} end={T.dnap + 14} />
      <DecisionScene start={T.dnap} end={T.battle + 14} />
      <MarchScene start={T.battle} end={END + 10} />
    </g>
  ),
  sfx: [
    [from + 6, SFX.whoosh, 0.35],
    [T.britain, SFX.pop, 0.3],
    [T.banned - 4, SFX.hit, 0.4],
    [T.tilsit + 2, SFX.whoosh, 0.35],
    [T.friedland - 4, SFX.pop, 0.4],
    [T.raft - 4, SFX.pop, 0.35],
    [T.agreed, SFX.hit, 0.35],
    [T.agreed + 2, SFX.whoosh, 0.3],
    [T.grain - 4, SFX.pop, 0.3],
    [T.timber - 4, SFX.pop, 0.3],
    [T.hemp - 4, SFX.pop, 0.3],
    [T.ban, SFX.hit, 0.35],
    [T.last, SFX.swell, 0.3],
    [T.neutral, SFX.pop, 0.3],
    [T.taxes + 8, SFX.hit, 0.4],
    [T.walked, SFX.hit, 0.4],
    [T.poland + 4, SFX.whoosh, 0.35],
    [T.border - 4, SFX.pop, 0.35],
    [T.knife - 4, SFX.hit, 0.45],
    [T.decide + 4, SFX.whoosh, 0.35],
    [T.march, SFX.whoosh, 0.3],
    [T.battle - 4, SFX.pop, 0.35],
    [T.short, SFX.hit, 0.4],
  ],
};
