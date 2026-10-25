import type { ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, GAUL, IBERIAN, LIBYAN, Mountains, ROMAN, Warrior } from "../kit/Ancient";
import { ArmyTent, Citizen, CityWall, CupTable, Galley, General, SiegeTower, Signum, Temple } from "../kit/AncientD";
import { BLUE, clamp, display, font, GOLD, Panel, Pin, RED, view, type Chapter } from "../kit/news";
import { Snow, Water } from "../kit/Period";
import { MapLine } from "../kit/PeriodA";
import { Block, Leaves, MapChip } from "../kit/PeriodC";
import { fade, Label } from "./ch7";
import { GhostMarch } from "./march";
import { MARCH, PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 8 "The answer" (beats answer → closeq): did the hardest road work? Yes as a surprise, but at a price;
// Rome never fell, Zama, exile and poison, the legacy, and the viewer's turn: a poll that stays to the end.
const [from, to] = span("ch8");
const INK = "#1b1d24";

const T = {
  an: B.answer.start,
  hardest: wf("answer", "hardest", 0.4),
  wk: B.worked.start,
  yes: wf("worked", "yes.", 0.2),
  alps: wf("worked", "Alps", 0.32),
  let: wf("worked", "let", 0.35),
  skip: wf("worked", "skip", 0.45),
  navy: wf("worked", "navy", 0.55),
  land: wf("worked", "land", 0.64),
  italy: wf("worked", "Italy", 0.75),
  nobody: wf("worked", "nobody", 0.85),
  bn: B.butnot.start,
  half: wf("butnot", "Half", 0.22),
  all: wf("butnot", "all", 0.45),
  siege: wf("butnot", "siege", 0.68),
  walls: wf("butnot", "walls.", 0.9),
  nv: B.never.start,
  never: wf("never", "never", 0.08),
  besieged: wf("never", "besieged", 0.15),
  surrender: wf("never", "surrender,", 0.4),
  raised: wf("never", "raised", 0.5),
  kept: wf("never", "kept", 0.68),
  fifteen: wf("never", "fifteen", 0.88),
  wy: B.why.start,
  siegeW: wf("why", "siege", 0.08),
  few: wf("why", "few", 0.24),
  allies: wf("why", "allies", 0.67),
  central: wf("why", "central", 0.75),
  loyal: wf("why", "loyal.", 0.95),
  zm: B.zama.start,
  bc: wf("zama", "BC", 0.1),
  called: wf("zama", "called", 0.2),
  home: wf("zama", "home.", 0.3),
  year: wf("zama", "year", 0.33),
  at: wf("zama", "at", 0.43),
  zama: wf("zama", "Zama,", 0.5),
  scipio: wf("zama", "Scipio,", 0.66),
  son: wf("zama", "son", 0.75),
  beat: wf("zama", "beat", 0.95),
  dt: B.death.start,
  exile: wf("death", "exile", 0.25),
  handed: wf("death", "handed", 0.5),
  hannibal: wf("death", "Hannibal", 0.78),
  lg: B.legacy.start,
  generals: wf("legacy", "generals", 0.25),
  study: wf("legacy", "study", 0.38),
  road: wf("legacy", "road", 0.6),
  famous: wf("legacy", "famous", 0.82),
  cq: B.closeq.start,
  after: wf("closeq", "After", 0.2),
  marched: wf("closeq", "marched", 0.55),
  rome: wf("closeq", "Rome?", 0.8),
  comments: wf("closeq", "comments.", 0.95),
};

const V8 = {
  south: bbox([[11.2, 38.6], [18.2, 43.2]]),
  why: bbox([[9.4, 35.6], [17.6, 43.2]]),
  zama: bbox([[8.4, 34.6], [17.8, 40.6]]),
  east: bbox([[8.5, 34.2], [31.2, 43.2]]),
  italy: bbox([[10.6, 40.2], [17.2, 43.6]]),
};

const BITHYNIA: [number, number] = [29.9, 40.75];
const HADRUMETUM: [number, number] = [10.64, 35.83];
const CROTON: [number, number] = [17.12, 39.08];
const ROUTE_PTS = MARCH.map(([x, y]) => [x, y] as [number, number]);

// Hannibal in southern Italy, 216–203 BC: a loose loop (approx.).
const LOOPS: [number, number][] = [PLACE.cannae, [15.4, 41.0], [14.25, 41.08], [14.9, 40.7], [16.0, 40.75], [17.24, 40.47], [16.7, 39.8], [16.3, 39.1], CROTON, [16.9, 39.7], [16.0, 40.3], [15.3, 40.6], [16.4, 40.9], [17.0, 40.0], [16.6, 39.3]];

// Rome's allies in central Italy (approximate area, not borders).
const ALLIES: [number, number][] = [[10.6, 43.6], [11.8, 44.0], [12.9, 43.7], [13.9, 42.9], [14.8, 42.0], [15.1, 41.4], [14.4, 40.95], [13.4, 41.2], [12.4, 41.5], [11.2, 42.4], [10.6, 43.0]];

const AreaGlow = ({ pts, k, color }: { pts: [number, number][]; k: number; color: string }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = pts.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
  const d = xy.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") + " Z";
  return (
    <g opacity={k}>
      <path d={d} fill={color} fillOpacity={0.28} stroke={color} strokeWidth={4 * s} strokeDasharray={`${10 * s} ${7 * s}`} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${10 * s}px ${color})` }} />
    </g>
  );
};

// A red cross over a map point.
const CrossOut = ({ at, k, size = 34 }: { at: [number, number]; k: number; size?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  const r = size * s;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${0.6 + 0.4 * Math.min(1, k)})`} opacity={Math.min(1, k)}>
      <line x1={-r} y1={-r} x2={r} y2={r} stroke="#fff" strokeWidth={18 * s} strokeLinecap="round" />
      <line x1={r} y1={-r} x2={-r} y2={r} stroke="#fff" strokeWidth={18 * s} strokeLinecap="round" />
      <line x1={-r} y1={-r} x2={r} y2={r} stroke={RED} strokeWidth={12 * s} strokeLinecap="round" />
      <line x1={r} y1={-r} x2={-r} y2={r} stroke={RED} strokeWidth={12 * s} strokeLinecap="round" />
    </g>
  );
};

// A ring of walls around Rome (an icon, not the real circuit).
const WallRing = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  const p = projection(PLACE.rome);
  if (!p || k <= 0) return null;
  const r = 46 * s;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${0.7 + 0.3 * k})`} opacity={k}>
      <circle r={r} fill="none" stroke="#0b1020" strokeWidth={16 * s} />
      <circle r={r} fill="none" stroke="#e8dcc0" strokeWidth={10 * s} strokeDasharray={`${9 * s} ${5 * s}`} />
    </g>
  );
};

const Map8 = () => {
  const frame = useCurrentFrame();
  const on = (a: number, b: number) => fade(frame, a, b);
  // pins that ch7 hands over are on from the first frame
  const handed = (b: number) => (frame >= from ? interpolate(frame, [b - 10, b], [1, 0], clamp) : 0);
  const routeK = interpolate(frame, [from, from + 26], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const routeO = interpolate(frame, [T.half - 10, T.half + 6], [1, 0], clamp);
  const glowUp = interpolate(frame, [T.alps - 4, T.alps + 10], [0, 1], clamp);
  const yearsK = (frame - T.kept) / (T.fifteen + 12 - T.kept);
  return (
    <g>
      {/* answer: the whole route and the three battles */}
      {frame < T.half + 10 && <MapLine pts={ROUTE_PTS} k={routeK} color={GOLD} width={5 + 4 * glowUp} opacity={routeO} />}
      <Label at={[6.9, 45.6]} text="the Alps" k={on(T.alps - 4, T.half)} color="#fff3c2" size={36} />
      <Pin at={PLACE.trebia} text="Trebia" k={handed(T.wk + 10)} />
      <Pin at={PLACE.trasimene} text="Trasimene" k={handed(T.wk + 10)} />
      <Pin at={PLACE.cannae} text="Cannae" k={handed(T.nv + 20)} />
      <Pin at={PLACE.rome} text="Rome" k={handed(T.zm + 20)} dy={frame < T.besieged - 10 ? 58 : 92} />
      {/* worked: the sea route crossed out */}
      <Arrow points={[PLACE.newcarthage, [3, 38.5], [9.5, 39.6], [12.2, 41.6]]} start={T.yes} end={T.yes + 22} color={BLUE} width={16} variant="dashed" opacity={interpolate(frame, [T.half - 10, T.half + 6], [1, 0], clamp)} />
      <CrossOut at={[6.2, 39.1]} k={frame < T.half + 6 ? interpolate(frame, [T.skip - 4, T.skip + 8, T.half - 10, T.half + 6], [0, 1, 1, 0], clamp) : 0} />
      <MapChip at={[6.2, 39.1]} text="Rome's navy" k={on(T.navy - 4, T.half + 6)} dy={80} size={0.8} />
      {/* butnot: the army at full strength vs what reached Italy; elephants; no siege engines */}
      <GhostMarch k={interpolate(frame, [T.half - 4, T.half + 14, T.nv, T.nv + 16], [0, 1, 1, 0], clamp)} />
      <MapChip at={PLACE.turin} text="half the army" k={on(T.half + 10, T.nv + 10)} dy={-80} color={GOLD} textColor={INK} size={0.8} />
      <MapChip at={PLACE.turin} text="elephants 37 → 1" k={on(T.all - 4, T.nv + 10)} dy={70} color={GOLD} textColor={INK} size={0.8} />
      <MapChip at={PLACE.rome} text="no siege engines" k={on(T.siege - 4, T.nv + 10)} dy={-100} size={0.8} />
      {/* never: walls of Rome, new Roman armies, Hannibal kept busy in the south */}
      <WallRing k={on(T.besieged - 6, T.zm + 20)} />
      {[[12.9, 42.5], [14.6, 41.75], [11.7, 43.2], [15.6, 40.6]].map((p, i) => (
        <Block key={i} at={p as [number, number]} k={on(T.raised - 4 + i * 6, T.wy + 10)} color={RED} w={56} h={22} />
      ))}
      {frame >= T.kept - 4 && frame < T.zm + 20 && <MapLine pts={LOOPS} k={Math.max(0.001, Math.min(1, yearsK))} color={GOLD} width={5} dash="12 8" opacity={interpolate(frame, [T.zm, T.zm + 20], [0.9, 0], clamp)} />}
      <MapChip at={[16.7, 39.5]} text="15 years" k={on(T.fifteen - 2, T.wy + 10)} dx={110} color={GOLD} textColor={INK} size={0.85} />
      <MapChip at={[15.3, 40.3]} text="approx." k={on(T.fifteen + 4, T.wy + 10)} dy={90} dx={-40} color="rgba(8,14,26,0.85)" size={0.6} />
      {/* why: few reinforcements, loyal allies */}
      <Pin at={PLACE.carthage} text="Carthage" k={on(T.few - 6, T.zm + 20)} color={GOLD} />
      <Arrow points={[PLACE.carthage, [13.2, 37.6], [16.2, 38.8]]} start={T.few} end={T.few + 30} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.zm - 10, T.zm + 10], [1, 0], clamp)} />
      <MapChip at={[13.2, 37.6]} text="few" k={on(T.few + 10, T.zm + 10)} dy={-50} color={GOLD} textColor={INK} size={0.8} />
      <AreaGlow pts={ALLIES} k={on(T.central - 10, T.zm + 10)} color={RED} />
      <Label at={[12.7, 42.9]} text="Rome's allies" k={on(T.allies - 4, T.zm + 10)} color="#ffd0cc" size={34} />
      {/* zama: called home, the battle */}
      <Arrow points={[CROTON, [14.2, 37.6], [11.2, 36.2], HADRUMETUM]} start={T.called} end={T.home + 10} color={GOLD} width={20} opacity={interpolate(frame, [T.dt + 10, T.dt + 30], [1, 0], clamp)} />
      <Pin at={PLACE.zama} text="Zama" k={on(T.zama - 6, T.lg + 10)} color={RED} />
      <Block at={[10.45, 36.55]} k={on(T.zama, T.dt + 10)} color={RED} w={56} h={22} />
      <Block at={[9.3, 35.85]} k={on(T.zama + 6, T.beat + 18)} color={GOLD} w={56} h={22} />
      <Arrow points={[[10.45, 36.55], [9.9, 36.1], [9.4, 35.9]]} start={T.beat - 6} end={T.beat + 12} color={RED} width={20} opacity={interpolate(frame, [T.dt + 10, T.dt + 25], [1, 0], clamp)} />
      <MapChip at={[10.45, 36.55]} text="Scipio" k={on(T.scipio - 4, T.dt + 10)} dx={120} dy={-10} size={0.8} />
      {/* death: exile, Bithynia */}
      <Arrow points={[PLACE.carthage, [18, 35.6], [25.5, 36.6], [28.6, 39.2], BITHYNIA]} start={T.dt + 4} end={T.exile + 20} color={GOLD} width={12} variant="dashed" opacity={interpolate(frame, [T.lg + 10, T.lg + 30], [1, 0], clamp)} />
      <Pin at={BITHYNIA} text="Bithynia" k={on(T.exile - 4, T.lg + 20)} color={GOLD} />
      <MapChip at={BITHYNIA} text="exile · approx." k={on(T.exile + 6, T.lg + 20)} dy={70} color="rgba(8,14,26,0.85)" size={0.7} />
      {/* legacy: Rome won; the road over the Alps */}
      <Pin at={PLACE.rome} text="Rome" k={on(T.lg - 4, T.cq + 4)} />
      {frame >= T.road - 6 && frame < T.cq + 20 && <MapLine pts={ROUTE_PTS} k={interpolate(frame, [T.road - 6, T.famous], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })} color={GOLD} width={8} opacity={interpolate(frame, [T.cq, T.cq + 20], [1, 0], clamp)} />}
      <Label at={[6.9, 45.6]} text="over the Alps" k={on(T.road + 6, T.cq + 10)} color="#fff3c2" size={38} />
      {/* closeq: Cannae → Rome? */}
      <Pin at={PLACE.rome} text="Rome" k={on(T.cq, to + 30)} />
      <Pin at={PLACE.cannae} text="Cannae" k={on(T.cq + 8, to + 30)} color={GOLD} />
      <Arrow points={[PLACE.cannae, [14.6, 41.9], [13.4, 42.05], [12.7, 41.95]]} start={T.marched - 6} end={T.marched + 30} color={GOLD} width={20} variant="dashed" />
      <Label at={[14.4, 42.4]} text="?" k={on(T.marched + 20, to + 30)} color={GOLD} size={110} weight={900} />
    </g>
  );
};

// ---------------------------------------------------------------- screen overlays

// Cannae diagram redrawn on a parchment card.
const CannaeCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.generals - 6;
  const end = T.road + 6;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 12, end], [1, 0], clamp);
  const a = interpolate(frame, [start + 10, T.study + 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ink = "#3a2a1a";
  const len = 600;
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: height * 0.3, height: height * 0.44, opacity: o * Math.min(1, k), transform: `scale(${0.92 + 0.08 * k}) rotate(${(1 - k) * -3}deg)`, background: "linear-gradient(160deg, #f3e6c4, #e2cf9f)", borderRadius: 14 * s, boxShadow: `0 ${14 * s}px ${40 * s}px rgba(0,0,0,0.6), inset 0 0 ${60 * s}px rgba(120,80,30,0.35)`, border: `${3 * s}px solid #b89a5a`, overflow: "hidden" }}>
      <svg viewBox="0 0 980 760" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <defs>
          <pattern id="c8hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#b8473a" />
            <line x1="0" y1="0" x2="0" y2="12" stroke="#7a2a1a" strokeWidth="5" />
          </pattern>
          <marker id="c8head" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill={ink} />
          </marker>
        </defs>
        <text x={490} y={70} textAnchor="middle" fontSize={46} fontStyle="italic" fill={ink}>Cannae, 216 BC</text>
        <text x={490} y={112} textAnchor="middle" fontSize={26} fill={ink} opacity={0.75}>the double envelopment</text>
        {/* Romans hemmed in */}
        <rect x={330} y={230} width={320} height={210} fill="url(#c8hatch)" stroke={ink} strokeWidth={3} />
        <text x={490} y={345} textAnchor="middle" fontSize={34} fontWeight={700} fill="#fbf2dc">ROMANS</text>
        {/* Hannibal's centre, bent back */}
        <path d="M300 470 Q490 560 680 470" fill="none" stroke="#8a6a2a" strokeWidth={26} strokeLinecap="round" />
        <path d="M300 470 Q490 560 680 470" fill="none" stroke="#d9b45a" strokeWidth={20} strokeLinecap="round" />
        {/* African wings on the flanks */}
        <rect x={262} y={250} width={50} height={190} fill="#d9b45a" stroke={ink} strokeWidth={3} />
        <rect x={668} y={250} width={50} height={190} fill="#d9b45a" stroke={ink} strokeWidth={3} />
        {/* cavalry behind */}
        <rect x={330} y={178} width={320} height={34} fill="#e8c86a" stroke={ink} strokeWidth={3} />
        {/* the moves */}
        <path d="M200 520 Q140 380 200 240 Q240 170 320 190" fill="none" stroke={ink} strokeWidth={5} strokeDasharray={`${len * a} ${len}`} markerEnd={a > 0.98 ? "url(#c8head)" : undefined} />
        <path d="M780 520 Q840 380 780 240 Q740 170 660 190" fill="none" stroke={ink} strokeWidth={5} strokeDasharray={`${len * a} ${len}`} markerEnd={a > 0.98 ? "url(#c8head)" : undefined} />
        <path d="M245 470 Q240 410 256 360" fill="none" stroke={ink} strokeWidth={4} strokeDasharray={`${200 * a} 200`} markerEnd={a > 0.98 ? "url(#c8head)" : undefined} />
        <path d="M735 470 Q740 410 724 360" fill="none" stroke={ink} strokeWidth={4} strokeDasharray={`${200 * a} 200`} markerEnd={a > 0.98 ? "url(#c8head)" : undefined} />
        <text x={490} y={612} textAnchor="middle" fontSize={26} fill={ink}>Hannibal's line</text>
        <text x={150} y={560} textAnchor="middle" fontSize={24} fill={ink}>cavalry</text>
        <text x={830} y={560} textAnchor="middle" fontSize={24} fill={ink}>cavalry</text>
        <text x={490} y={705} textAnchor="middle" fontSize={34} fontStyle="italic" fill="#7a2a1a">still studied by generals today</text>
        <text x={40} y={745} fontSize={18} fill={ink} opacity={0.6}>diagram, positions approximate</text>
      </svg>
    </div>
  );
};

// Poll card: replaces the head card from "After Cannae…" to the end.
const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.after) return null;
  const k = spring({ frame: frame - T.after, fps, config: { damping: 14 } });
  const opts: [string, string, number][] = [["A", "Yes, march on Rome", T.marched], ["B", "No, he was right to wait", T.marched + 14]];
  const cta = spring({ frame: frame - T.comments, fps, config: { damping: 9 } });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${22 * s}px ${30 * s}px`, lineHeight: 1.3 }}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: GOLD }}>Your turn</div>
      <div style={{ fontFamily: display, fontSize: 54 * s, fontWeight: 700, margin: `${6 * s}px 0 ${16 * s}px`, textTransform: "uppercase" }}>After Cannae, should Hannibal have marched on Rome?</div>
      {opts.map(([l, t, f]) => {
        const ok = spring({ frame: frame - f, fps, config: { damping: 11 } });
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 14 * s, margin: `${10 * s}px 0`, padding: `${10 * s}px ${18 * s}px`, borderRadius: 12 * s, border: `${2 * s}px solid rgba(255,255,255,0.35)`, background: frame >= f ? "rgba(255,201,74,0.16)" : "rgba(255,255,255,0.06)", transform: `scale(${frame >= f ? 0.94 + 0.06 * ok : 0.94})`, opacity: frame >= f ? 1 : 0.35 }}>
            <div style={{ width: 46 * s, height: 46 * s, borderRadius: "50%", background: GOLD, color: INK, fontSize: 30 * s, fontWeight: 900, lineHeight: `${46 * s}px`, textAlign: "center" }}>{l}</div>
            <div style={{ fontSize: 40 * s, fontWeight: 700 }}>{t}</div>
          </div>
        );
      })}
      <div style={{ textAlign: "center", marginTop: 12 * s, fontSize: 32 * s, fontWeight: 700, transform: `scale(${frame >= T.comments ? cta : 1})`, color: frame >= T.comments ? GOLD : "#fff", opacity: frame >= T.comments ? 1 : 0.8 }}>Tell me in the comments ↓</div>
    </div>
  );
};

// ---------------------------------------------------------------- panels

type S = { start: number; end: number };
type GG = { x: number; W: number; H: number; ground: number; s: number };
const field = (g: GG, c = "#b8a66a") => <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill={c} />;
const CARTH = { cloak: "#5a2a6a", crest: "#f2ead8", armor: "#b9a46a", skin: "#c58e64" };

// The hardest road: Hannibal looks up at the Alps.
const AnswerScene = ({ start, end }: S) => (
  <Panel id="c8answer" anchor={PLACE.traversette} start={start} end={end} sky={["#6f8fb0", "#e3ebf1"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
        <path d={`M${g.x} ${g.ground + 10 * g.s} Q${g.x + g.W * 0.15} ${g.ground - 50 * g.s} ${g.x + g.W * 0.32} ${g.ground + 10 * g.s} L${g.x + g.W * 0.32} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#8a7a62" stroke={INK} strokeWidth={1.5 * g.s} />
        <General x={g.x + g.W * 0.16} y={g.ground - 26 * g.s} scale={g.sc * 0.78} {...CARTH} />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
      </g>
    )}
  </Panel>
);

// Rome's navy: war galleys at sea.
const NavyScene = ({ start, end }: S) => (
  <Panel id="c8navy" anchor={[9.5, 39.6]} start={start} end={end} sky={["#6fa0d0", "#e9e2c8"]} accent={BLUE}>
    {(g) => {
      const sea = g.ground - 80 * g.s;
      return (
        <g>
          <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f6f9a" />
          <Galley x={g.x + g.W * 0.28} y={sea + 70 * g.s} scale={g.sc * 0.55} />
          <Galley x={g.x + g.W * 0.72} y={sea + 40 * g.s} scale={g.sc * 0.4} phase={2} />
          <Galley x={g.x + g.W * 0.92} y={sea + 20 * g.s} scale={g.sc * 0.25} phase={4} />
        </g>
      );
    }}
  </Panel>
);

// An army in Italy that nobody was ready for: the column comes down onto the plain.
const ArrivalScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8arrive" anchor={PLACE.turin} start={start} end={end} sky={["#7fa8d0", "#f0e2b8"]} accent={GOLD}>
      {(g) => {
        const dx = (frame - start) * 0.9 * g.s;
        return (
          <g>
            <Mountains x={g.x} W={g.W * 0.55} ground={g.ground - 30 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8fa05a" />
            <Elephant x={g.x + g.W * 0.1 + dx} y={g.ground + 6 * g.s} scale={g.sc * 0.42} phase={1} />
            {[0, 1, 2, 3].map((i) => <Warrior key={i} x={g.x + g.W * (0.24 + i * 0.08) + dx} y={g.ground + 8 * g.s} scale={g.sc * 0.56} kit={[LIBYAN, IBERIAN, GAUL, LIBYAN][i]} phase={i * 1.3} />)}
            <Citizen x={g.x + g.W * 0.86} y={g.ground + 8 * g.s} scale={g.sc * 0.6} raise={0.6} flip toga="#d9cfb8" tunic="#8a6a4a" />
          </g>
        );
      }}
    </Panel>
  );
};

// Half the army: a thin column in the snow.
const HalfScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8half" anchor={PLACE.traversette} start={start} end={end} sky={["#7f9bb8", "#e3ebf1"]} accent="#9fb6c8">
      {(g) => (
        <g>
          <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
          {[0, 1, 4].map((i) => <Warrior key={i} x={g.x + g.W * (0.12 + i * 0.16) + (frame - start) * 0.6 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.6} kit={i % 2 ? IBERIAN : LIBYAN} pose="trudge" cloak={1} phase={i} />)}
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} />
        </g>
      )}
    </Panel>
  );
};

// Almost all the elephants: one left, thin, in the sleet.
const ElephantScene = ({ start, end }: S) => (
  <Panel id="c8eleph" anchor={PLACE.turin} start={start} end={end} sky={["#5a6a7a", "#c9d2da"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#7d8a72" />
        <Elephant x={g.x + g.W * 0.45} y={g.ground + 6 * g.s} scale={g.sc * 0.62} thin={1} walk={false} />
        <text x={g.x + g.W - 30 * g.s} y={g.y + 70 * g.s} textAnchor="end" fontFamily={display} fontWeight={700} fontSize={56 * g.s} fill="#fff" stroke={INK} strokeWidth={6 * g.s} paintOrder="stroke">37 → 1</text>
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
      </g>
    )}
  </Panel>
);

// No siege engines: Rome's walls, and the tower he did not have.
const SiegeScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start + 8, start + 20], [0, 1], clamp);
  return (
    <Panel id="c8siege" anchor={PLACE.rome} start={start} end={end} sky={["#8fb0cf", "#efe2c0"]}>
      {(g) => {
        const tx = g.x + g.W * 0.2;
        const ty = g.ground + 4 * g.s;
        return (
          <g>
            <CityWall x={g.x + g.W * 0.42} W={g.W * 0.58} ground={g.ground - 10 * g.s} s={g.s} h={170} />
            {field(g, "#b8a66a")}
            <g opacity={0.55}>
              <SiegeTower x={tx} y={ty} scale={g.sc * 0.7} />
            </g>
            <g opacity={x}>
              <line x1={tx - 90 * g.s} y1={ty - 240 * g.s} x2={tx + 90 * g.s} y2={ty} stroke={RED} strokeWidth={14 * g.s} strokeLinecap="round" />
              <line x1={tx + 90 * g.s} y1={ty - 240 * g.s} x2={tx - 90 * g.s} y2={ty} stroke={RED} strokeWidth={14 * g.s} strokeLinecap="round" />
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// Rome's walls, gate shut, guards on top.
const WallsScene = ({ start, end }: S) => (
  <Panel id="c8walls" anchor={PLACE.rome} start={start} end={end} sky={["#7fa3c8", "#efe2c0"]}>
    {(g) => {
      const top = g.ground - 10 * g.s - 170 * g.s;
      return (
        <g>
          <CityWall x={g.x} W={g.W} ground={g.ground - 10 * g.s} s={g.s} h={170} />
          {[0.22, 0.38, 0.64, 0.74].map((f, i) => <Warrior key={i} x={g.x + g.W * f} y={top + 2 * g.s} scale={g.sc * 0.38} kit={ROMAN} roman pose="stand" phase={i} />)}
          {field(g, "#b8a66a")}
        </g>
      );
    }}
  </Panel>
);

// New Roman armies: recruits march out under their standards.
const NewArmyScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8newarmy" anchor={PLACE.rome} start={start} end={end} sky={["#8fb0cf", "#f2dfb0"]}>
      {(g) => {
        const span = g.W + 160 * g.s;
        const dx = (frame - start) * 1.0 * g.s;
        return (
          <g>
            <CityWall x={g.x} W={g.W * 0.3} ground={g.ground - 30 * g.s} s={g.s} h={110} gate={false} />
            {field(g, "#c2ad6e")}
            {Array.from({ length: 2 }, (_, i) => <Signum key={`s${i}`} x={g.x - 80 * g.s + ((dx + 80 * g.s + i * 520 * g.s) % span)} y={g.ground - 4 * g.s} scale={g.sc * 0.56} phase={i} />)}
            {Array.from({ length: 7 }, (_, i) => <Warrior key={`f${i}`} x={g.x - 80 * g.s + ((dx + 30 * g.s + i * 130 * g.s) % span)} y={g.ground + 10 * g.s} scale={g.sc * 0.6} kit={ROMAN} roman phase={i * 1.4} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Fifteen years in Italy: Hannibal's camp in the south as the seasons turn.
const CampScene = ({ start, end }: S) => (
  <Panel id="c8camp" anchor={[16.3, 40.2]} start={start} end={end} sky={["#c88a50", "#f2d8a2"]} accent={GOLD}>
    {(g) => (
      <g>
        <path d={`M${g.x} ${g.ground - 70 * g.s} Q${g.x + g.W * 0.4} ${g.ground - 130 * g.s} ${g.x + g.W} ${g.ground - 80 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#8a8a52" />
        <ArmyTent x={g.x + g.W * 0.2} y={g.ground - 30 * g.s} scale={g.sc * 0.55} />
        <ArmyTent x={g.x + g.W * 0.42} y={g.ground - 44 * g.s} scale={g.sc * 0.45} color="#a88a5a" />
        <ArmyTent x={g.x + g.W * 0.8} y={g.ground - 36 * g.s} scale={g.sc * 0.5} />
        {field(g, "#a89a5a")}
        {[0, 1, 2].map((i) => <Warrior key={i} x={g.x + g.W * (0.3 + i * 0.18)} y={g.ground + 8 * g.s} scale={g.sc * 0.58} kit={[LIBYAN, IBERIAN, GAUL][i]} pose="stand" phase={i * 2} flip={i === 1} />)}
        <Leaves x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={22} />
      </g>
    )}
  </Panel>
);

// Few reinforcements from home: Carthage's harbour, almost empty.
const HarbourScene = ({ start, end }: S) => (
  <Panel id="c8harbour" anchor={PLACE.carthage} start={start} end={end} sky={["#7fa8d0", "#f0e0b8"]} accent={GOLD}>
    {(g) => {
      const sea = g.ground - 70 * g.s;
      return (
        <g>
          <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f7aa0" />
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W * 0.45} height={g.H} fill="#cbbf9f" stroke={INK} strokeWidth={1.5 * g.s} />
          <Temple x={g.x + g.W * 0.05} W={g.W * 0.26} ground={g.ground - 20 * g.s} s={g.s * 0.8} color="#e8dcc0" />
          <Galley x={g.x + g.W * 0.78} y={sea + 30 * g.s} scale={g.sc * 0.28} sail="#e9dcc0" stripe="#5a2a6a" />
        </g>
      );
    }}
  </Panel>
);

// Rome's allies stayed loyal: Italian townsmen beside a Roman standard.
const AlliesScene = ({ start, end }: S) => (
  <Panel id="c8allies" anchor={[13.2, 42.4]} start={start} end={end} sky={["#86a8c8", "#f1e4c4"]}>
    {(g) => (
      <g>
        <CityWall x={g.x + g.W * 0.45} W={g.W * 0.55} ground={g.ground - 24 * g.s} s={g.s} h={120} />
        <rect x={g.x} y={g.ground - 24 * g.s} width={g.W} height={g.H} fill="#cdbf9e" />
        <Signum x={g.x + g.W * 0.5} y={g.ground + 6 * g.s} scale={g.sc * 0.6} />
        <Warrior x={g.x + g.W * 0.38} y={g.ground + 8 * g.s} scale={g.sc * 0.62} kit={ROMAN} roman pose="stand" />
        {[0, 1, 2].map((i) => <Citizen key={i} x={g.x + g.W * (0.6 + i * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.62} phase={i * 2} flip tunic={["#7a8a9a", "#a8946c", "#8a6a4a"][i]} />)}
        <Warrior x={g.x + g.W * 0.18} y={g.ground + 8 * g.s} scale={g.sc * 0.62} kit={{ ...ROMAN, tunic: "#5a7a9a", shade: "#476280", shield: "#3a5a7a" }} roman pose="stand" phase={2} />
      </g>
    )}
  </Panel>
);

// Called home: a galley leaves the coast of Italy.
const SailScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8sail" anchor={CROTON} start={start} end={end} sky={["#6fa0d0", "#f2d9a8"]} accent={GOLD}>
      {(g) => {
        const sea = g.ground - 80 * g.s;
        return (
          <g>
            <path d={`M${g.x} ${sea} L${g.x} ${sea - 70 * g.s} Q${g.x + g.W * 0.15} ${sea - 110 * g.s} ${g.x + g.W * 0.3} ${sea - 30 * g.s} L${g.x + g.W * 0.34} ${sea} Z`} fill="#7d8a5a" />
            <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f6f9a" />
            <Galley x={g.x + g.W * 0.45 + (frame - start) * 1.2 * g.s} y={sea + 60 * g.s} scale={g.sc * 0.5} sail="#e9dcc0" stripe="#5a2a6a" />
          </g>
        );
      }}
    </Panel>
  );
};

// Zama: Scipio's army against Hannibal's; on "beat", Hannibal's line falls back.
const ZamaScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const back = interpolate(frame, [T.beat - 6, T.beat + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const point = interpolate(frame, [T.scipio - 6, T.scipio + 10], [0, 1], clamp);
  return (
    <Panel id="c8zama" anchor={PLACE.zama} start={start} end={end} sky={["#d8a060", "#f6e4b0"]}>
      {(g) => (
        <g>
          {field(g, "#c9a862")}
          {[0, 1, 2, 3].map((i) => <Warrior key={`r${i}`} x={g.x + g.W * (0.06 + i * 0.07)} y={g.ground + (i % 2 ? -16 : 10) * g.s} scale={g.sc * (i % 2 ? 0.5 : 0.6)} kit={ROMAN} roman pose="stand" phase={i} />)}
          <General x={g.x + g.W * 0.38} y={g.ground + 10 * g.s} scale={g.sc * 0.74} point={point} />
          {[0, 1, 2, 3].map((i) => <Warrior key={`c${i}`} x={g.x + g.W * (0.66 + i * 0.08) + back * 120 * g.s} y={g.ground + (i % 2 ? -16 : 10) * g.s} scale={g.sc * (i % 2 ? 0.5 : 0.6)} kit={[LIBYAN, IBERIAN, LIBYAN, GAUL][i]} pose={back > 0 ? "walk" : "stand"} flip phase={i * 1.5} />)}
          <text x={g.x + g.W * 0.38} y={g.y + 80 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={32 * g.s} fill="#7a1f1a" opacity={point}>Scipio</text>
        </g>
      )}
    </Panel>
  );
};

// Exile: a quiet room, a cup on a table. No figure.
const CupScene = ({ start, end }: S) => (
  <Panel id="c8cup" anchor={BITHYNIA} start={start} end={end} sky={["#2a2420", "#4a3a2e"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x + g.W * 0.62} y={g.y + 60 * g.s} width={150 * g.s} height={150 * g.s} fill="#1a2440" stroke="#6a5038" strokeWidth={8 * g.s} />
        <circle cx={g.x + g.W * 0.62 + 100 * g.s} cy={g.y + 110 * g.s} r={18 * g.s} fill="#efe6c8" />
        <line x1={g.x + g.W * 0.62 + 75 * g.s} x2={g.x + g.W * 0.62 + 75 * g.s} y1={g.y + 60 * g.s} y2={g.y + 210 * g.s} stroke="#6a5038" strokeWidth={6 * g.s} />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#3a2c22" />
        <CupTable x={g.x + g.W * 0.36} y={g.ground + 10 * g.s} scale={g.sc * 0.9} />
      </g>
    )}
  </Panel>
);

// Rome won the war: a legion with its standards raised.
const WonScene = ({ start, end }: S) => (
  <Panel id="c8won" anchor={PLACE.rome} start={start} end={end} sky={["#7fa3c8", "#f2e2b8"]}>
    {(g) => (
      <g>
        <Temple x={g.x + g.W * 0.6} W={g.W * 0.32} ground={g.ground - 24 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 24 * g.s} width={g.W} height={g.H} fill="#cdbf9e" />
        {[0.12, 0.42].map((f, i) => <Signum key={f} x={g.x + g.W * f} y={g.ground + 2 * g.s} scale={g.sc * 0.6} phase={i} />)}
        {[0, 1, 2, 3, 4].map((i) => <Warrior key={i} x={g.x + g.W * (0.06 + i * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.6} kit={ROMAN} roman pose="stand" phase={i * 1.3} />)}
      </g>
    )}
  </Panel>
);

// The most famous march in history: the column on a snowy ridge.
const AlpsScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8alps" anchor={PLACE.traversette} start={start} end={end} sky={["#6f9fd0", "#eef3f7"]} accent={GOLD}>
      {(g) => {
        const span = g.W + 300 * g.s;
        const order = ["w", "e", "w", "w", "e", "w"];
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
            {order.map((t, i) => {
              const px = g.x - 150 * g.s + ((frame - start) * 1.1 * g.s + i * (span / order.length)) % span;
              return t === "e" ? (
                <Elephant key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.55} phase={i} snow={0.6} />
              ) : (
                <Warrior key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.62} phase={i * 1.3} kit={i % 3 ? LIBYAN : IBERIAN} pose="trudge" cloak={1} />
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// Your turn: Hannibal on a rise, Rome's walls far away.
const TurnScene = ({ start, end }: S) => (
  <Panel id="c8turn" anchor={PLACE.cannae} start={start} end={end} sky={["#2a3550", "#d0a070"]} accent={GOLD}>
    {(g) => {
      const hz = g.ground - 70 * g.s;
      return (
        <g>
          <g transform={`translate(${g.x + g.W * 0.62},${hz}) scale(0.35) translate(${-(g.x + g.W * 0.62)},${-hz})`}>
            <CityWall x={g.x + g.W * 0.62} W={g.W * 0.9} ground={hz} s={g.s} h={150} />
          </g>
          <rect x={g.x} y={hz} width={g.W} height={g.H} fill="#8a7a52" />
          <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.25} ${g.ground - 60 * g.s} ${g.x + g.W * 0.5} ${g.ground} L${g.x + g.W * 0.5} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#6a5a3a" />
          <General x={g.x + g.W * 0.25} y={g.ground - 40 * g.s} scale={g.sc * 0.8} {...CARTH} />
          <text x={g.x + g.W * 0.8} y={hz - 70 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#fff" stroke={INK} strokeWidth={5 * g.s} paintOrder="stroke">Rome</text>
        </g>
      );
    }}
  </Panel>
);

// ---------------------------------------------------------------- chapter

const PANELS: [(p: S) => ReactNode, number][] = [
  [AnswerScene, from],
  [NavyScene, T.let],
  [ArrivalScene, T.italy - 6],
  [HalfScene, T.half],
  [ElephantScene, T.all],
  [SiegeScene, T.siege],
  [WallsScene, T.besieged],
  [NewArmyScene, T.raised],
  [CampScene, T.fifteen - 10],
  [HarbourScene, T.few],
  [AlliesScene, T.allies],
  [SailScene, T.called],
  [ZamaScene, T.at],
  [CupScene, T.handed - 10],
  [WonScene, T.lg],
  [AlpsScene, T.road - 4],
  [TurnScene, T.cq],
];

export const ch8: Chapter = {
  name: "The answer",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(8, w, h) },
    { frame: T.nv, cam: H(8, w, h) },
    { frame: T.nv + 40, cam: view(V8.south, w, h, 1, 0.1) },
    { frame: T.wy - 6, cam: view(V8.south, w, h, 1, 0.1) },
    { frame: T.wy + 30, cam: view(V8.why, w, h, 0.5, 0.08) },
    { frame: T.zm - 4, cam: view(V8.why, w, h, 0.5, 0.08) },
    { frame: T.zm + 34, cam: view(V8.zama, w, h, 1, 0.1) },
    { frame: T.dt - 4, cam: view(V8.zama, w, h, 1, 0.1) },
    { frame: T.dt + 34, cam: view(V8.east, w, h, 1, 0.1) },
    { frame: T.lg - 4, cam: view(V8.east, w, h, 1, 0.1) },
    { frame: T.lg + 34, cam: H(8, w, h) },
    { frame: T.cq, cam: H(8, w, h) },
    { frame: T.after + 30, cam: view(V8.italy, w, h, 1, 0.02) },
  ],
  years: [
    [from, "216 BC"],
    ...Array.from({ length: 14 }, (_, i) => [Math.round(T.kept + ((T.fifteen + 12 - T.kept) * i) / 13), `${216 - i} BC`] as [number, string]),
    [T.bc - 4, "203 BC"],
    [T.year, "202 BC"],
    [T.dt, "c. 183 BC"],
    [T.cq, "216 BC"],
  ],
  heads: [
    { f: from, tag: "The answer", head: "Did the hardest road work?", color: GOLD },
    { f: T.yes, tag: "As a surprise", head: "Yes", color: GOLD, chips: [{ text: "Past Rome's navy", f: T.navy }, { text: "Nobody was ready", f: T.nobody }] },
    { f: T.bn, tag: "But", head: "It came at a price", color: RED, chips: [{ text: "Half the army", f: T.half }, { text: "36 elephants lost", f: T.all }, { text: "No siege engines", f: T.siege }] },
    { f: T.nv, tag: "216–203 BC", head: "Never besieged Rome", color: RED, chips: [{ text: "Rome never surrendered", f: T.surrender }, { text: "New armies", f: T.raised }] },
    { f: T.fifteen, tag: "216–203 BC", head: "Kept busy in Italy", stat: "15", label: "years", color: GOLD },
    { f: T.wy, tag: "Why not Rome?", head: "Three reasons", color: RED, chips: [{ text: "No siege engines", f: T.siegeW }, { text: "Few reinforcements", f: T.few }, { text: "Allies stayed loyal", f: T.loyal - 10 }] },
    { f: T.zm, tag: "203 BC", head: "Called home", color: GOLD },
    { f: T.zama, tag: "Zama · 202 BC", head: "Zama", color: RED },
    { f: T.scipio, tag: "Zama · 202 BC", head: "Scipio", color: RED, chips: [{ text: "son of the consul at the Rhône", f: T.son }, { text: "beats Hannibal", f: T.beat }] },
    { f: T.dt, tag: "c. 183 BC", head: "In exile", color: GOLD },
    { f: T.hannibal, tag: "c. 183 BC", head: "Hannibal took poison", color: GOLD },
    { f: T.lg, tag: "The legacy", head: "Rome won the war", color: RED },
    { f: T.generals, tag: "The legacy", head: "Generals still study Cannae", color: GOLD },
    { f: T.road, tag: "The legacy", head: "The most famous march in history", color: GOLD },
    { f: T.cq, tag: "Now", head: "Your turn", color: GOLD },
    { f: T.after, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    if (frame < from - 30) return null;
    return <Map8 />;
  },
  Panels: () => (
    <g>
      {PANELS.map(([P, start], i) => (
        <P key={i} start={start} end={i < PANELS.length - 1 ? PANELS[i + 1][1] + 14 : to + 30} />
      ))}
    </g>
  ),
  Screen: () => (
    <>
      <CannaeCard />
      <Poll />
    </>
  ),
  sfx: [
    [from, SFX.pop, 0.35],
    [T.yes, SFX.hit, 0.4],
    [T.skip - 4, SFX.pop, 0.4],
    [T.half, SFX.hit, 0.4],
    [T.all, SFX.pop, 0.35],
    [T.siege, SFX.pop, 0.35],
    [T.nv + 2, SFX.whoosh, 0.35],
    [T.besieged, SFX.pop, 0.35],
    [T.raised, SFX.pop, 0.35],
    [T.kept, SFX.tick, 0.3],
    [T.fifteen, SFX.hit, 0.4],
    [T.wy + 2, SFX.whoosh, 0.3],
    [T.siegeW, SFX.pop, 0.35],
    [T.few, SFX.pop, 0.35],
    [T.central - 6, SFX.pop, 0.35],
    [T.zm + 2, SFX.whoosh, 0.35],
    [T.called, SFX.whoosh, 0.3],
    [T.zama, SFX.pop, 0.4],
    [T.beat, SFX.hit, 0.45],
    [T.dt + 2, SFX.whoosh, 0.35],
    [T.exile, SFX.pop, 0.35],
    [T.lg + 2, SFX.whoosh, 0.35],
    [T.generals - 6, SFX.swell, 0.35],
    [T.road, SFX.whoosh, 0.3],
    [T.after, SFX.pop, 0.4],
    [T.marched, SFX.tick, 0.3],
    [T.marched + 14, SFX.tick, 0.3],
    [T.comments, SFX.hit, 0.45],
  ],
};
