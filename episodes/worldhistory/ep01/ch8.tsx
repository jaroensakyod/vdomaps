import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import countries50 from "world-atlas/countries-50m.json";
import { Arrow } from "../../../components/Arrow";
import { LOOKS, Person, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { ArmyBand, type ArmyPt } from "../kit/Army";
import { BLACK, BLUE, clamp, display, font, GOLD, Panel, PANEL_TOP, Pin, RED, RUS, TAN, view, type Chapter } from "../kit/news";
import { AUSTRIAN, FRENCH, Napoleon, POLISH, PRUSSIAN, RUSSIAN, Snow, Soldier, Treeline, Water } from "../kit/Period";
import { Cannon, Church, Isba, SnowGround, Wagon } from "../kit/PeriodD";
import { kAt } from "./campaign";
import { fade, ICE, Label, TempChart, V7 } from "./ch7";
import { ADVANCE, CITY, RETREAT, TEMPS } from "./minard";
import { at, B, span, wf } from "./time";

// Chapter 8 "The answer" (beats answer → close): mostly not the winter (the band was gone before the first snow),
// the real causes, the cost to Russia, prisoners, Tauroggen, Leipzig, 1814 and Elba, Minard's 1869 figure, and
// the viewer's turn: a poll that stays to the end.
const [from, to] = span("ch8");
const INK = "#1b1d24";

const T = {
  an: B.answer.start,
  nw: B.notwinter.start,
  mostly: wf("notwinter", "not", 0.1),
  look: wf("notwinter", "line", 0.45),
  vanished: wf("notwinter", "vanished", 0.68),
  snowF: wf("notwinter", "snow", 0.85),
  ca: B.causes.start,
  dist: wf("causes", "distance", 0.04),
  sup: wf("causes", "Supply", 0.13),
  dis: wf("causes", "Disease", 0.25),
  heat: wf("causes", "Heat", 0.36),
  refused: wf("causes", "refused", 0.58),
  burn: wf("causes", "burn", 0.9),
  ru: B.russia.start,
  hundreds: wf("russia", "Hundreds", 0.45),
  pr: B.prisoners.start,
  prN: at("prisoners", 0.35),
  ta: B.tauroggen.start,
  allies: at("tauroggen", 0.12),
  dec30: at("tauroggen", 0.45),
  deal: at("tauroggen", 0.8),
  le: B.leipzig.start,
  lePin: at("leipzig", 0.2),
  half: at("leipzig", 0.45),
  lost: at("leipzig", 0.92),
  af: B.after.start,
  two: wf("after", "two", 0.45),
  paris: wf("after", "Paris", 0.64),
  exile: wf("after", "exile", 0.83),
  elba: wf("after", "Elba", 0.9),
  mi: B.minard2.start,
  engineer: at("minard2", 0.38),
  best: at("minard2", 0.68),
  cl: B.close.start,
  poll: wf("close", "If", 0.2),
  turned: wf("close", "turned", 0.8),
  comments: wf("close", "comments", 0.95),
};

const V8 = {
  route: V7.route,
  russia: bbox([[17, 45], [47, 62]]),
  tauroggen: bbox([[19.5, 53.8], [26.5, 56.6]]),
  leipzig: bbox([[7, 48.5], [19.5, 55]]),
  france: bbox([[-2, 40.5], [16, 52]]),
  east: bbox([[30.5, 54.2], [38.3, 56.2]]),
};

// The Russian Empire's side today: Russia, Belarus, Lithuania (approximate tint, not 1812 borders).
const world = countries50 as unknown as Topology<{ countries: GeometryCollection }>;
const CF = feature(world, world.objects.countries).features;
const RUSSIA_SIDE = CF.filter((f) => ["643", "112", "440"].includes(String(f.id)));

// ---------------------------------------------------------------- map pieces

// Lost before the first snow: a full-width ghost of the band in red, with the real band redrawn on top.
const SNOW_LON = 34.3;
const LostBeforeSnow = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const full = ADVANCE.map(([x, y]) => [x, y, ADVANCE[0][2]] as ArmyPt);
  const kr = kAt(RETREAT, SNOW_LON);
  const fullR = RETREAT.map(([x, y]) => [x, y, RETREAT[0][2]] as ArmyPt);
  const p = projection([SNOW_LON, 55.25]);
  return (
    <g>
      <g opacity={k}>
        <ArmyBand pts={full} k={1} color={RED} edge="#ffb0a8" opacity={0.75} />
        <ArmyBand pts={fullR} k={kr} color={RED} edge="#ffb0a8" opacity={0.75} />
        <ArmyBand pts={ADVANCE} k={1} color={TAN} />
        <ArmyBand pts={RETREAT} k={kr} color={BLACK} edge="#f2f2f2" />
      </g>
      {p && (
        <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
          <line x1={0} y1={-70 * s} x2={0} y2={60 * s} stroke="#fff" strokeWidth={4 * s} strokeDasharray={`${8 * s} ${6 * s}`} />
          <circle cy={-96 * s} r={26 * s} fill="#fff" stroke={ICE} strokeWidth={4 * s} />
          <text y={-84 * s} textAnchor="middle" fontSize={34 * s} fill={ICE} fontWeight={900}>❄</text>
          <text y={96 * s} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30 * s} fill="#fff" stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke">first snow</text>
        </g>
      )}
    </g>
  );
};

// A ruler along the route, Kovno → Moscow, for "distance".
const Ruler = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const a = projection([24, 54.0]);
  const b = projection([37.6, 54.0]);
  if (!a || !b) return null;
  const x = a[0] + (b[0] - a[0]) * Math.min(1, k * 1.4);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <line x1={a[0]} y1={a[1]} x2={x} y2={b[1]} stroke="#fff" strokeWidth={5 * s} />
      {Array.from({ length: 15 }, (_, i) => {
        const tx = a[0] + ((b[0] - a[0]) * i) / 14;
        return tx <= x ? <line key={i} x1={tx} x2={tx} y1={a[1] - (i % 7 === 0 ? 18 : 10) * s} y2={a[1] + (i % 7 === 0 ? 18 : 10) * s} stroke="#fff" strokeWidth={3 * s} /> : null;
      })}
      <text x={(a[0] + b[0]) / 2} y={a[1] + 52 * s} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34 * s} fill="#fff" stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke">distance</text>
    </g>
  );
};

const RussiaTint = ({ k }: { k: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {RUSSIA_SIDE.map((f, i) => <path key={i} d={path(f) ?? ""} fill={RUS} fillOpacity={0.25} stroke={RUS} strokeWidth={3 * s} strokeOpacity={0.8} />)}
    </g>
  );
};

// The Prussian corps as a block that flips from Napoleon's blue to the coalition's green.
const PrussianBlock = ({ k, flip }: { k: number; flip: number }) => {
  const { projection, s } = useMap();
  const p = projection([21.27, 55.25]);
  if (!p || k <= 0) return null;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const on = flip >= 0.5;
  return (
    <g transform={`translate(${p[0] + 170 * s},${p[1] + 70 * s})`} opacity={k}>
      <g transform={`scale(${Math.max(0.02, sx)},1)`}>
        <rect x={-120 * s} y={-36 * s} width={240 * s} height={72 * s} rx={10 * s} fill={on ? RUS : FRENCH.coat} stroke="#fff" strokeWidth={3 * s} />
        <text y={-4 * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28 * s} fill="#fff">Prussian corps</text>
        <text y={26 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={22 * s} fill="#fff" opacity={0.9}>{on ? "deal with Russia" : "in Napoleon's army"}</text>
      </g>
    </g>
  );
};

const Map8 = () => {
  const frame = useCurrentFrame();
  const chartK = interpolate(frame, [T.nw, T.nw + 15, T.ca, T.ca + 15], [0, 1, 1, 0], clamp);
  return (
    <g>
      <TempChart k={chartK} upto={25.3} />
      <LostBeforeSnow k={interpolate(frame, [T.look - 6, T.look + 14, T.ca + 30, T.ca + 50], [0, 1, 1, 0], clamp)} />
      <Ruler k={interpolate(frame, [T.dist - 4, T.dist + 30, T.ru, T.ru + 15], [0, 1, 1, 0], clamp)} />
      <Label at={[37.6, 56.25]} text="Moscow" k={fade(frame, T.dist, T.ru + 10)} size={30} />
      <Label at={[24.0, 55.45]} text="Kovno" k={fade(frame, T.dist, T.ru + 10)} size={30} />
      <RussiaTint k={interpolate(frame, [T.ru + 10, T.ru + 35, T.ta, T.ta + 20], [0, 1, 1, 0], clamp)} />
      <Label at={[36, 57.5]} text="Russia" k={fade(frame, T.ru + 20, T.ta + 10)} color="#bff0cf" size={46} />
      {/* Tauroggen */}
      <Pin at={[21.27, 55.25]} text="Tauroggen" k={fade(frame, T.dec30 - 6, T.le + 10)} />
      <PrussianBlock k={fade(frame, T.allies, T.le + 10)} flip={interpolate(frame, [T.deal - 8, T.deal + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })} />
      {/* Leipzig */}
      <Pin at={[12.37, 51.34]} text="Leipzig" k={fade(frame, T.lePin - 4, T.af + 10)} dy={58} />
      {frame >= T.lePin && frame < T.af + 20 && (
        <g opacity={interpolate(frame, [T.af, T.af + 20], [1, 0], clamp)}>
          <Arrow points={[[10.6, 53.4], [11.6, 52.4], [12.2, 51.55]]} start={T.lePin + 4} end={T.lePin + 34} color={RUS} width={24} />
          <Arrow points={[[17.5, 51.5], [15, 51.5], [12.7, 51.36]]} start={T.lePin + 10} end={T.lePin + 40} color={RUS} width={24} />
          <Arrow points={[[14.8, 49.7], [13.5, 50.6], [12.6, 51.2]]} start={T.lePin + 16} end={T.lePin + 46} color={RUS} width={24} />
          <Arrow points={[[12.1, 51.3], [10.3, 50.9], [8.4, 50.2]]} start={T.lost - 4} end={T.lost + 26} color={BLACK} outline="#f2f2f2" width={20} variant="dashed" />
        </g>
      )}
      <Label at={[15.6, 50.25]} text="500,000+" k={fade(frame, T.half, T.af + 10)} color={GOLD} size={56} />
      {/* 1814: into France, Elba */}
      {frame >= T.af && (
        <g opacity={interpolate(frame, [T.mi, T.mi + 20], [1, 0], clamp)}>
          <Arrow points={[[9.5, 50.2], [6, 49.4], [2.8, 48.95]]} start={T.af + 10} end={T.paris + 4} color={RUS} width={24} />
          <Arrow points={[[9, 47.6], [5.5, 48.0], [2.9, 48.7]]} start={T.af + 20} end={T.paris + 10} color={RUS} width={24} />
          <Arrow points={[CITY.paris, [5, 45.5], [8.5, 43.6], CITY.elba]} start={T.exile - 4} end={T.elba + 10} color={GOLD} width={18} variant="dashed" />
        </g>
      )}
      <Pin at={CITY.paris} text="Paris" k={fade(frame, T.paris - 4, T.mi + 10)} color={GOLD} />
      <Pin at={CITY.elba} text="Elba" k={fade(frame, T.elba - 4, T.mi + 10)} color={GOLD} dy={56} />
      {/* The poll: the three places on the map */}
      <Pin at={CITY.smolensk} text="Smolensk" k={fade(frame, T.turned - 10, to + 30)} size={0.8} color={GOLD} />
      <Pin at={CITY.borodino} text="Borodino" k={fade(frame, T.turned - 2, to + 30)} size={0.8} color={GOLD} dy={56} />
      <Pin at={CITY.moscow} text="Moscow" k={fade(frame, T.turned + 6, to + 30)} size={0.8} color={GOLD} />
    </g>
  );
};

// ---------------------------------------------------------------- screen overlays

// "Not the winter" stamp.
const Stamp = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.mostly || frame > T.look + 12) return null;
  const k = interpolate(frame, [T.mostly, T.mostly + 8], [2.2, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ alignItems: "center", top: height * 0.4, bottom: "auto", opacity: interpolate(frame, [T.look - 4, T.look + 12], [1, 0], clamp) }}>
      <div style={{ transform: `scale(${k}) rotate(-6deg)`, border: `${10 * s}px solid ${GOLD}`, color: GOLD, borderRadius: 18 * s, padding: `${8 * s}px ${36 * s}px`, fontFamily: display, fontWeight: 700, fontSize: 96 * s, lineHeight: 1.2, textAlign: "center", background: "rgba(8,14,26,0.75)", textTransform: "uppercase" }}>Not the winter</div>
    </AbsoluteFill>
  );
};

// Main column at the first snow: the share already gone vs. lost after (from Minard's numbers).
const atSnow = (() => {
  const i = RETREAT.findIndex((p) => p[0] <= SNOW_LON);
  return RETREAT[i][2];
})();
const ShareBar = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.look;
  const end = T.dist + 10;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 10, end], [1, 0], clamp);
  const total = ADVANCE[0][2];
  const before = (total - atSnow) / total;
  const out = RETREAT[RETREAT.length - 1][2] / total;
  const grow = interpolate(frame, [start + 6, T.vanished + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * PANEL_TOP, height: 350 * s, opacity: o * Math.min(1, k), transform: `translateY(${(1 - k) * 30 * s}px)`, background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${RED}`, borderRadius: 18 * s, padding: `${26 * s}px ${34 * s}px`, boxSizing: "border-box", fontFamily: font, color: "#fff" }}>
      <div style={{ fontSize: 30 * s, fontWeight: 700, color: TAN }}>Main column, on Minard's map</div>
      <div style={{ display: "flex", height: 90 * s, marginTop: 26 * s, borderRadius: 10 * s, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${before * 100 * grow}%`, background: RED }} />
        <div style={{ width: `${(1 - before - out) * 100 * grow}%`, background: "#9fb6c8" }} />
        <div style={{ width: `${out * 100 * grow}%`, background: "#fff" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 * s, fontSize: 32 * s, fontWeight: 700 }}>
        <span style={{ color: "#ff6b5f" }}>■ gone before the first snow</span>
        <span style={{ color: "#c9dbe8", opacity: interpolate(frame, [T.snowF, T.snowF + 10], [0, 1], clamp) }}>■ after</span>
      </div>
    </div>
  );
};

// Minard's figure redrawn on a parchment card.
const CX = (lon: number) => 40 + ((lon - 23.6) / (38 - 23.6)) * 900;
const CY = (lat: number) => 420 - ((lat - 54.0) / (56.0 - 54.0)) * 330;
const ribbon = (pts: ArmyPt[], k: number, per = 60 / 340000) => {
  const xy = pts.map((p) => [CX(p[0]), CY(p[1]), p[2]] as [number, number, number]);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, k));
  const line: [number, number, number][] = [xy[0]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / (seg[i] || 1));
    line.push([xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t, xy[i][2] + (xy[i + 1][2] - xy[i][2]) * t]);
    left -= seg[i];
  }
  if (line.length < 2) return "";
  const side = (sg: number) =>
    line.map((p, i) => {
      const a = line[Math.max(0, i - 1)];
      const b = line[Math.min(line.length - 1, i + 1)];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const half = Math.max(p[2] * per, 1.5) / 2;
      return `${p[0] + (-dy / len) * half * sg},${p[1] + (dx / len) * half * sg}`;
    });
  return `M${side(1).join(" L")} L${side(-1).reverse().join(" L")} Z`;
};
const MinardCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.mi + 6;
  const end = T.cl + 12;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 12, end], [1, 0], clamp);
  const a = interpolate(frame, [start + 10, T.engineer], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const r = interpolate(frame, [T.engineer, T.best - 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tk = interpolate(frame, [T.engineer + 20, T.best + 10], [0, 1], clamp);
  const TY = (t: number) => 520 + (-t / 40) * 200;
  const temps = TEMPS.filter((_, i) => i <= Math.floor(tk * (TEMPS.length - 1) + 0.001));
  const ink = "#3a2a1a";
  const best = spring({ frame: frame - T.best, fps, config: { damping: 11 } });
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: height * 0.3, height: height * 0.44, opacity: o * Math.min(1, k), transform: `scale(${0.92 + 0.08 * k}) rotate(${(1 - k) * -3}deg)`, background: "linear-gradient(160deg, #f3e6c4, #e2cf9f)", borderRadius: 14 * s, boxShadow: `0 ${14 * s}px ${40 * s}px rgba(0,0,0,0.6), inset 0 0 ${60 * s}px rgba(120,80,30,0.35)`, border: `${3 * s}px solid #b89a5a`, overflow: "hidden" }}>
      <svg viewBox="0 0 980 760" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <text x={490} y={52} textAnchor="middle" fontSize={30} fontStyle="italic" fill={ink} opacity={frame < T.best ? 1 : 0}>Losses of men in the Russian campaign, 1812–1813</text>
        <path d={ribbon(ADVANCE, a)} fill="#d9b48a" stroke={ink} strokeWidth={1.5} />
        <path d={ribbon(RETREAT, r)} fill="#1c1a18" stroke={ink} strokeWidth={1} />
        {[["Kovno", 24, 55.2], ["Vilna", 25.3, 54.95], ["Smolensk", 32, 55.15], ["Moscow", 37.6, 56.05], ["Berezina", 28.5, 54.0]].map(([t, lo, la]) => (
          <text key={t as string} x={CX(lo as number)} y={CY(la as number)} textAnchor="middle" fontSize={24} fontStyle="italic" fill={ink} opacity={0.85}>{t as string}</text>
        ))}
        <text x={CX(24.2)} y={CY(55.7)} fontSize={28} fill={ink} opacity={a}>422,000</text>
        <text x={CX(24.2)} y={CY(54.1)} fontSize={28} fill={ink} opacity={r > 0.98 ? 1 : 0}>10,000</text>
        {temps.map((p) => <line key={`v${p[0]}`} x1={CX(p[0])} x2={CX(p[0])} y1={CY(54.3)} y2={TY(p[1])} stroke={ink} strokeWidth={0.8} opacity={0.4} />)}
        {temps.length > 1 && <path d={temps.map((p, i) => `${i ? "L" : "M"}${CX(p[0])},${TY(p[1])}`).join(" ")} fill="none" stroke={ink} strokeWidth={3} />}
        {temps.filter((p) => p[2] && p[0] !== 25.3 && p[0] !== 27.2).map((p) => <text key={`t${p[0]}`} x={CX(p[0])} y={TY(p[1]) + 26} textAnchor="middle" fontSize={20} fill={ink}>{p[1] === 0 ? "0°" : `−${-p[1]}°`}</text>)}
        <line x1={40} x2={940} y1={TY(0)} y2={TY(0)} stroke={ink} strokeWidth={0.8} opacity={0.35} />
        <text x={940} y={735} textAnchor="end" fontSize={40} fontStyle="italic" fill="#7a2a1a">Minard, 1869</text>
        <text x={40} y={735} fontSize={20} fill={ink} opacity={0.7}>redrawn after Charles Joseph Minard</text>
      </svg>
      {frame >= T.best && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 70 * s, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${best}) rotate(-3deg)`, background: RED, color: "#fff", borderRadius: 40 * s, padding: `${8 * s}px ${30 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 34 * s, boxShadow: `0 ${6 * s}px ${20 * s}px rgba(0,0,0,0.4)` }}>Some call it the best statistical graphic ever made</div>
        </div>
      )}
    </div>
  );
};

// Poll card: replaces the head card from "If you were Napoleon…" to the end.
const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.poll) return null;
  const k = spring({ frame: frame - T.poll, fps, config: { damping: 14 } });
  const opts: [string, string, number][] = [["A", "Smolensk", T.turned - 10], ["B", "Borodino", T.turned - 2], ["C", "Moscow", T.turned + 6], ["D", "Never", T.turned + 14]];
  const cta = spring({ frame: frame - T.comments, fps, config: { damping: 9 } });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${22 * s}px ${30 * s}px`, lineHeight: 1.3 }}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: GOLD }}>Your turn</div>
      <div style={{ fontFamily: display, fontSize: 54 * s, fontWeight: 700, margin: `${6 * s}px 0 ${16 * s}px`, textTransform: "uppercase" }}>If you were Napoleon, when would you have turned back?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 * s }}>
        {opts.map(([l, t, f]) => {
          const ok = spring({ frame: frame - f, fps, config: { damping: 11 } });
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14 * s, padding: `${10 * s}px ${18 * s}px`, borderRadius: 12 * s, border: `${2 * s}px solid rgba(255,255,255,0.35)`, background: frame >= f ? "rgba(255,201,74,0.16)" : "rgba(255,255,255,0.06)", transform: `scale(${frame >= f ? 0.9 + 0.1 * ok : 0.9})`, opacity: frame >= f ? 1 : 0.35 }}>
              <div style={{ width: 46 * s, height: 46 * s, borderRadius: "50%", background: GOLD, color: "#1b1d24", fontSize: 30 * s, fontWeight: 900, lineHeight: `${46 * s}px`, textAlign: "center" }}>{l}</div>
              <div style={{ fontSize: 40 * s, fontWeight: 700 }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 16 * s, fontSize: 32 * s, fontWeight: 700, transform: `scale(${frame >= T.comments ? cta : 1})`, color: frame >= T.comments ? GOLD : "#fff", opacity: frame >= T.comments ? 1 : 0.8 }}>Tell me in the comments ↓</div>
    </div>
  );
};

// ---------------------------------------------------------------- panels

type S = { start: number; end: number };

// Distance, supply, disease, heat: a dusty summer road, an empty supply wagon, the column dragging on.
const HeatScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8heat" anchor={[28.5, 55]} start={start} end={end} sky={["#e9a85a", "#f6e2a8"]} accent={GOLD}>
      {(g) => (
        <g>
          <circle cx={g.x + g.W * 0.82} cy={g.y + 90 * g.s} r={46 * g.s} fill="#fff3c2" />
          <circle cx={g.x + g.W * 0.82} cy={g.y + 90 * g.s} r={80 * g.s} fill="#fff3c2" opacity={0.25} />
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#cfa86a" />
          <Wagon x={g.x + g.W * 0.2} y={g.ground - 6 * g.s} scale={g.sc * 0.7} broken={false} />
          {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.4 + ((frame - start) * 0.6 * g.s + i * 100 * g.s) % (g.W * 0.6)} y={g.ground + 12 * g.s} scale={g.sc * 0.6} phase={i * 1.5} u={i % 2 ? POLISH : FRENCH} pose="trudge" />)}
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.4 + i * 0.1) + Math.sin(frame * 0.05 + i) * 10 * g.s} cy={g.ground - 10 * g.s} r={(22 + i * 3) * g.s} fill="#e2c48a" opacity={0.45} />)}
        </g>
      )}
    </Panel>
  );
};

// A Russian army that refused to fight on Napoleon's terms: it marches away over the horizon.
const RefuseScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8refuse" anchor={[34, 55.3]} start={start} end={end} sky={["#7a9ac0", "#e8d6a8"]} accent={RUS}>
      {(g) => (
        <g>
          <path d={`M${g.x} ${g.ground - 80 * g.s} Q${g.x + g.W * 0.6} ${g.ground - 120 * g.s} ${g.x + g.W} ${g.ground - 90 * g.s} L${g.x + g.W} ${g.ground + 60 * g.s} L${g.x} ${g.ground + 60 * g.s} Z`} fill="#9aaa62" />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.62 + i * 40 * g.s + (frame - start) * 0.5 * g.s} y={g.ground - 92 * g.s} scale={g.sc * 0.32} phase={i} u={RUSSIAN} />)}
          {[0, 1, 2].map((i) => <Soldier key={`f${i}`} x={g.x + g.W * (0.1 + i * 0.1)} y={g.ground + 14 * g.s} scale={g.sc * 0.66} phase={i * 2} u={FRENCH} pose="stand" />)}
        </g>
      )}
    </Panel>
  );
};

// A country willing to burn its own land: villages and fields on fire, nobody there.
const ScorchScene = ({ start, end }: S) => (
  <Panel id="c8scorch" anchor={[32, 54.8]} start={start} end={end} sky={["#3a2a2a", "#e08a4a"]} accent={RED}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#5a4a2a" />
        <Isba x={g.x + g.W * 0.2} y={g.ground - 6 * g.s} scale={g.sc * 0.7} fire={1} seed={1} />
        <Isba x={g.x + g.W * 0.52} y={g.ground - 20 * g.s} scale={g.sc * 0.55} fire={1} seed={4} />
        <Isba x={g.x + g.W * 0.82} y={g.ground - 10 * g.s} scale={g.sc * 0.62} burnt fire={0.7} seed={8} />
      </g>
    )}
  </Panel>
);

// Russia's losses: a village church in the snow, people standing in silence.
const ChurchScene = ({ start, end }: S) => (
  <Panel id="c8church" anchor={[37.6, 55.8]} start={start} end={end} sky={["#4a5568", "#c9d2da"]} accent={RUS}>
    {(g) => (
      <g>
        <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#38443f" snow={1} />
        <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={21} />
        <Church x={g.x + g.W * 0.3} y={g.ground - 14 * g.s} scale={g.sc * 0.75} snow={1} />
        <Person x={g.x + g.W * 0.58} y={g.ground + 10 * g.s} scale={g.sc * 0.7} look={LOOKS[3]} outfit="coat" hat="beanie" facing={-1} />
        <Person x={g.x + g.W * 0.66} y={g.ground + 12 * g.s} scale={g.sc * 0.62} look={LOOKS[0]} outfit="coat" facing={-1} phase={2} />
        <Soldier x={g.x + g.W * 0.78} y={g.ground + 12 * g.s} scale={g.sc * 0.66} u={RUSSIAN} pose="stand" flip phase={1} />
        <Person x={g.x + g.W * 0.88} y={g.ground + 10 * g.s} scale={g.sc * 0.68} look={LOOKS[5]} outfit="coat" hat="cap" facing={-1} phase={4} />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
      </g>
    )}
  </Panel>
);

// Prisoners: a French column walking under Russian escort.
const PrisonerScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const dx = (frame - start) * 0.7;
  return (
    <Panel id="c8prisoners" anchor={[30, 55]} start={start} end={end} sky={["#56616e", "#c3ccd4"]} accent={BLUE}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#38443f" snow={1} />
          <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={23} />
          <Soldier x={g.x + g.W * 0.12 + dx * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.68} u={RUSSIAN} phase={0.5} />
          {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={g.x + g.W * (0.25 + i * 0.12) + dx * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.62} phase={i * 1.3} u={i % 2 ? POLISH : FRENCH} pose="trudge" wrap={1} />)}
          <Soldier x={g.x + g.W * 0.88 + dx * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.68} u={RUSSIAN} phase={1.5} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
        </g>
      )}
    </Panel>
  );
};

// Tauroggen: a Prussian and a Russian officer face each other over a signed paper.
const TauroggenScene = ({ start, end }: S) => (
  <Panel id="c8tauroggen" anchor={[21.27, 55.25]} start={start} end={end} sky={["#4a5568", "#c9d2da"]} accent={RUS}>
    {(g) => (
      <g>
        <Isba x={g.x + g.W * 0.15} y={g.ground - 40 * g.s} scale={g.sc * 0.55} snow={1} />
        <Isba x={g.x + g.W * 0.88} y={g.ground - 46 * g.s} scale={g.sc * 0.45} snow={1} />
        <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={25} />
        <rect x={g.cx - 46 * g.s} y={g.ground - 48 * g.s} width={92 * g.s} height={10 * g.s} fill="#7a5a3a" stroke={INK} strokeWidth={1.3 * g.s} />
        <rect x={g.cx - 40 * g.s} y={g.ground - 38 * g.s} width={8 * g.s} height={50 * g.s} fill="#5a4030" />
        <rect x={g.cx + 32 * g.s} y={g.ground - 38 * g.s} width={8 * g.s} height={50 * g.s} fill="#5a4030" />
        <g transform={`translate(${g.cx},${g.ground - 52 * g.s}) rotate(-6)`}>
          <rect x={-22 * g.s} y={-8 * g.s} width={44 * g.s} height={10 * g.s} fill="#fbf7ee" stroke={INK} strokeWidth={1 * g.s} />
          <path d={`M${-14 * g.s} ${-4 * g.s} L${10 * g.s} ${-4 * g.s}`} stroke="#555" strokeWidth={1.4 * g.s} />
        </g>
        <Soldier x={g.cx - 110 * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.72} u={PRUSSIAN} pose="stand" />
        <Soldier x={g.cx + 110 * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.72} u={RUSSIAN} pose="stand" flip phase={2} />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
      </g>
    )}
  </Panel>
);

// Leipzig 1813: lines of many armies in the smoke, Napoleon watching from a rise.
const LeipzigScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const puff = (i: number) => ((frame - start + i * 11) % 44) / 44;
  return (
    <Panel id="c8leipzig" anchor={[12.37, 51.34]} start={start} end={end} sky={["#5a5a6a", "#d9c09a"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#8a8a5a" />
          <path d={`M${g.x} ${g.ground - 30 * g.s} Q${g.x + g.W * 0.12} ${g.ground - 90 * g.s} ${g.x + g.W * 0.26} ${g.ground - 30 * g.s} Z`} fill="#6e7a4a" />
          <Napoleon x={g.x + g.W * 0.12} y={g.ground - 72 * g.s} scale={g.sc * 0.5} />
          {[0, 1, 2].map((i) => <Soldier key={`f${i}`} x={g.x + g.W * (0.3 + i * 0.07)} y={g.ground + 12 * g.s} scale={g.sc * 0.6} phase={i} u={FRENCH} pose="stand" />)}
          {[RUSSIAN, PRUSSIAN, AUSTRIAN, RUSSIAN, PRUSSIAN].map((u, i) => <Soldier key={`c${i}`} x={g.x + g.W * (0.66 + i * 0.07) - (frame - start) * 0.25 * g.s} y={g.ground + 12 * g.s} scale={g.sc * 0.6} phase={i * 1.2} u={u} flip />)}
          <Cannon x={g.x + g.W * 0.92} y={g.ground - 40 * g.s} scale={g.sc * 0.4} flip />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={g.x + g.W * (0.48 + i * 0.04)} cy={g.ground - 60 * g.s - puff(i) * 40 * g.s} r={(20 + puff(i) * 44) * g.s} fill="#ece6da" opacity={0.6 * (1 - puff(i))} />)}
          <Smoke x={g.x + g.W * 0.55} y={g.ground - 40 * g.s} size={40 * g.s} seed={6} wind={0.1} />
        </g>
      )}
    </Panel>
  );
};

// 1814: the coalition armies march on Paris.
const ParisScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c8paris" anchor={CITY.paris} start={start} end={end} sky={["#6f8fb0", "#e9d6b0"]} accent={RUS}>
      {(g) => {
        const sky = g.ground - 60 * g.s;
        return (
          <g>
            {/* Paris skyline: towers of Notre-Dame, a dome, roofs */}
            <g fill="#7a7f8a" stroke={INK} strokeWidth={1.2 * g.s}>
              <rect x={g.x + g.W * 0.55} y={sky - 110 * g.s} width={30 * g.s} height={110 * g.s} />
              <rect x={g.x + g.W * 0.55 + 60 * g.s} y={sky - 110 * g.s} width={30 * g.s} height={110 * g.s} />
              <rect x={g.x + g.W * 0.55} y={sky - 70 * g.s} width={90 * g.s} height={70 * g.s} />
              <path d={`M${g.x + g.W * 0.3} ${sky - 50 * g.s} Q${g.x + g.W * 0.3 + 40 * g.s} ${sky - 130 * g.s} ${g.x + g.W * 0.3 + 80 * g.s} ${sky - 50 * g.s} Z`} />
              <rect x={g.x + g.W * 0.3} y={sky - 50 * g.s} width={80 * g.s} height={50 * g.s} />
              {Array.from({ length: 10 }, (_, i) => <rect key={i} x={g.x + i * 110 * g.s} y={sky - (24 + (i % 3) * 10) * g.s} width={90 * g.s} height={(24 + (i % 3) * 10) * g.s} />)}
            </g>
            <rect x={g.x} y={sky} width={g.W} height={g.H} fill="#9a8a62" />
            {[RUSSIAN, PRUSSIAN, AUSTRIAN, RUSSIAN, PRUSSIAN, AUSTRIAN].map((u, i) => <Soldier key={i} x={g.x - 40 * g.s + ((frame - start) * 1.2 * g.s + i * 110 * g.s) % (g.W + 80 * g.s)} y={g.ground + 12 * g.s} scale={g.sc * 0.62} phase={i} u={u} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Exile on Elba: Napoleon alone on a rocky shore.
const ElbaScene = ({ start, end }: S) => (
  <Panel id="c8elba" anchor={CITY.elba} start={start} end={end} sky={["#4f8fc0", "#f2d9a8"]} accent={GOLD}>
    {(g) => {
      const sea = g.ground - 60 * g.s;
      return (
        <g>
          <path d={`M${g.x + g.W * 0.55} ${sea} Q${g.x + g.W * 0.7} ${sea - 90 * g.s} ${g.x + g.W * 0.85} ${sea - 40 * g.s} Q${g.x + g.W * 0.95} ${sea - 70 * g.s} ${g.x + g.W} ${sea - 30 * g.s} L${g.x + g.W} ${sea} Z`} fill="#6a7a5a" opacity={0.7} />
          <Water x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3c7fa8" />
          <path d={`M${g.x} ${g.ground - 30 * g.s} Q${g.x + g.W * 0.2} ${g.ground - 70 * g.s} ${g.x + g.W * 0.42} ${g.ground - 20 * g.s} L${g.x + g.W * 0.45} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#8a7a62" stroke={INK} strokeWidth={1.5 * g.s} />
          <Napoleon x={g.x + g.W * 0.24} y={g.ground - 56 * g.s} scale={g.sc * 0.8} />
        </g>
      );
    }}
  </Panel>
);

// Your turn: Napoleon on a snowy rise, Moscow's domes far away.
const TurnScene = ({ start, end }: S) => (
  <Panel id="c8turn" anchor={CITY.moscow} start={start} end={end} sky={["#2a3550", "#c9a87a"]} accent={GOLD}>
    {(g) => {
      const hz = g.ground - 70 * g.s;
      return (
        <g>
          {[0.62, 0.7, 0.78, 0.86].map((fx, i) => (
            <g key={fx} fill="#5a5560" opacity={0.85}>
              <rect x={g.x + g.W * fx} y={hz - (40 + (i % 2) * 20) * g.s} width={24 * g.s} height={(40 + (i % 2) * 20) * g.s} />
              <path d={`M${g.x + g.W * fx - 6 * g.s} ${hz - (40 + (i % 2) * 20) * g.s} Q${g.x + g.W * fx + 12 * g.s} ${hz - (80 + (i % 2) * 20) * g.s} ${g.x + g.W * fx + 30 * g.s} ${hz - (40 + (i % 2) * 20) * g.s} Z`} fill={i % 2 ? "#c9a24a" : "#5a7a6a"} />
            </g>
          ))}
          <SnowGround x={g.x} W={g.W} ground={hz} H={g.H} s={g.s} seed={31} />
          <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.x + g.W * 0.25} ${g.ground - 60 * g.s} ${g.x + g.W * 0.5} ${g.ground} L${g.x + g.W * 0.5} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#f2f6f8" />
          <Napoleon x={g.x + g.W * 0.25} y={g.ground - 40 * g.s} scale={g.sc * 0.8} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
        </g>
      );
    }}
  </Panel>
);

// ---------------------------------------------------------------- chapter

export const ch8: Chapter = {
  name: "The answer",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V7.wide, w, h, 1, 0.1) },
    { frame: from + 34, cam: view(V8.route, w, h, 1, 0.13) },
    { frame: T.ru, cam: view(V8.route, w, h, 1, 0.13) },
    { frame: T.ru + 34, cam: view(V8.russia, w, h, 1, 0.08) },
    { frame: T.ta - 4, cam: view(V8.russia, w, h, 1, 0.08) },
    { frame: T.ta + 34, cam: view(V8.tauroggen, w, h, 1, 0.08) },
    { frame: T.le - 4, cam: view(V8.tauroggen, w, h, 1, 0.08) },
    { frame: T.le + 34, cam: view(V8.leipzig, w, h, 1, 0.08) },
    { frame: T.af - 4, cam: view(V8.leipzig, w, h, 1, 0.08) },
    { frame: T.af + 34, cam: view(V8.france, w, h, 1, 0.08) },
    { frame: T.mi - 4, cam: view(V8.france, w, h, 1, 0.08) },
    { frame: T.mi + 34, cam: view(V8.route, w, h, 1, 0.13) },
    { frame: T.cl, cam: view(V8.route, w, h, 1, 0.13) },
    { frame: T.poll + 30, cam: view(V8.east, w, h, 1, -0.02) },
  ],
  years: [[from, "1812"], [T.ta, "Dec 1812"], [T.le, "Oct 1813"], [T.af, "1814"], [T.mi, "1869"], [T.cl, "1812"]],
  heads: [
    { f: from, tag: "The answer", head: "Where did the army go?", color: GOLD },
    { f: T.nw, tag: "The answer", head: "Mostly not to the winter", color: GOLD },
    { f: T.vanished, tag: "Look at the line", head: "Gone before the first snow", color: RED },
    {
      f: T.ca,
      tag: "What really destroyed it",
      head: "Many causes",
      color: GOLD,
      chips: [
        { text: "Distance", f: T.dist },
        { text: "Supply", f: T.sup },
        { text: "Disease", f: T.dis },
        { text: "Heat", f: T.heat },
        { text: "Refused battle", f: T.refused },
        { text: "Burned land", f: T.burn },
      ],
    },
    { f: T.ru, tag: "Russia's losses", head: "A terrible price too", color: RUS },
    { f: T.hundreds, tag: "Russia's losses", head: "Soldiers and civilians", color: RUS, chips: [{ text: "Hundreds of thousands died", f: T.hundreds }] },
    { f: T.pr, tag: "French side", head: "Taken prisoner", stat: "~100,000", label: "men", color: BLUE },
    { f: T.ta, tag: "Within weeks", head: "His allies begin to turn", color: RED },
    { f: T.deal, tag: "Tauroggen · 30 December 1812", head: "Prussia makes its own deal", color: RUS },
    { f: T.le, tag: "Leipzig · October 1813", head: "Battle of the Nations", color: GOLD },
    { f: T.half, tag: "Leipzig · October 1813", head: "Largest battle of the wars", stat: "500,000+", label: "soldiers", color: GOLD },
    { f: T.lost, tag: "Leipzig · October 1813", head: "Napoleon lost", color: RED },
    { f: T.af, tag: "For Napoleon", head: "The beginning of the end", color: RED, chips: [{ text: "less than 2 years", f: T.two }] },
    { f: T.paris, tag: "1814", head: "His enemies in Paris", color: RUS },
    { f: T.exile, tag: "1814", head: "Exile on Elba", color: GOLD },
    { f: T.mi, tag: "Minard, 1869", head: "The best picture of the disaster", color: TAN },
    { f: T.engineer, tag: "Minard, 1869", head: "By a retired French engineer", color: TAN },
    { f: T.cl, tag: "Now", head: "Your turn", color: GOLD },
    { f: T.poll, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    if (frame < from) return null;
    return <Map8 />;
  },
  Panels: () => (
    <g>
      <HeatScene start={T.dist} end={T.refused + 14} />
      <RefuseScene start={T.refused} end={T.burn + 14} />
      <ScorchScene start={T.burn} end={T.ru + 14} />
      <ChurchScene start={T.ru} end={T.pr + 14} />
      <PrisonerScene start={T.pr} end={T.allies + 14} />
      <TauroggenScene start={T.allies} end={T.le + 14} />
      <LeipzigScene start={T.le} end={T.af + 14} />
      <ParisScene start={T.af} end={T.exile + 14} />
      <ElbaScene start={T.exile} end={T.mi + 20} />
      <TurnScene start={T.cl} end={to + 30} />
    </g>
  ),
  Screen: () => (
    <>
      <Stamp />
      <ShareBar />
      <MinardCard />
      <Poll />
    </>
  ),
  sfx: [
    [from, SFX.whoosh, 0.35],
    [T.mostly, SFX.hit, 0.5],
    [T.look, SFX.whoosh, 0.3],
    [T.vanished, SFX.hit, 0.4],
    [T.dist, SFX.pop, 0.35],
    [T.sup, SFX.pop, 0.35],
    [T.dis, SFX.pop, 0.35],
    [T.heat, SFX.pop, 0.35],
    [T.refused, SFX.pop, 0.35],
    [T.burn, SFX.pop, 0.35],
    [T.ru + 2, SFX.whoosh, 0.35],
    [T.hundreds, SFX.hit, 0.4],
    [T.prN, SFX.hit, 0.4],
    [T.ta + 2, SFX.whoosh, 0.35],
    [T.deal - 4, SFX.pop, 0.4],
    [T.le + 2, SFX.whoosh, 0.35],
    [T.half, SFX.hit, 0.45],
    [T.af + 2, SFX.whoosh, 0.35],
    [T.paris, SFX.pop, 0.35],
    [T.elba, SFX.pop, 0.35],
    [T.mi, SFX.swell, 0.35],
    [T.best, SFX.hit, 0.4],
    [T.poll, SFX.pop, 0.4],
    [T.turned - 10, SFX.tick, 0.3],
    [T.turned - 2, SFX.tick, 0.3],
    [T.turned + 6, SFX.tick, 0.3],
    [T.turned + 14, SFX.tick, 0.3],
    [T.comments, SFX.hit, 0.45],
  ],
};
