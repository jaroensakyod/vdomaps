import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, FigureDefs, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { useJson } from "../../../components/useJson";
import { clamp, font, GOLD, Panel, Pin, RED, RUS, view, type Chapter } from "../kit/news";
import { BAVARIAN, FRENCH, ITALIAN, Napoleon, POLISH, PontoonBridge, RUSSIAN, Soldier, Treeline, Water, type Uniform } from "../kit/Period";
import { CampTent, Cannon, Calendar, Dust, EngineerDesk, FieldTent, GrainField, HotSun, Horse, Hut, Mud, Rider, Standard, Storm, Town, Wagon, WaterBarrel } from "../kit/PeriodB";
import { GhostBand } from "./campaign";
import { ADVANCE, CITY } from "./minard";
import { B, span, wf } from "./time";

// Chapter 4 "Crossing the Neman" (cross → thin): June–July 1812. The global Minard band starts marching at Kovno;
// the camera follows its head to Vilna and Vitebsk while the Russians pull back, burn the land, and summer,
// disease and desertion thin the line before any big battle.
const [from, to] = span("ch4");

const T = {
  cross: B.cross.start,
  june: wf("cross", "June", 0.2),
  crossed: wf("cross", "crossed", 0.45),
  neman: wf("cross", "Neman", 0.52),
  kovno: wf("cross", "Kovno", 0.64),
  kaunas: wf("cross", "Kaunas", 0.8),
  minard: B.minard.start,
  watch: wf("minard", "watch", 0.04),
  width: wf("minard", "width", 0.22),
  number: wf("minard", "number", 0.3),
  french: wf("minard", "French", 0.48),
  minardName: wf("minard", "Minard", 0.69),
  refuse: B.refuse.start,
  battle: wf("refuse", "battle", 0.18),
  refused: wf("refuse", "refused", 0.4),
  two: wf("refuse", "two", 0.67),
  deeper: wf("refuse", "deeper", 0.88),
  vilna: B.vilna.start,
  took: wf("vilna", "took", 0.3),
  left: wf("vilna", "left", 0.88),
  already: wf("vilna", "already", 0.78),
  scorch: B.scorch.start,
  burned: wf("scorch", "burned", 0.25),
  crops: wf("scorch", "crops", 0.38),
  villages: wf("scorch", "villages", 0.5),
  anything: wf("scorch", "anything", 0.7),
  heat: B.heat.start,
  weather: wf("heat", "weather", 0.2),
  summer: wf("heat", "Summer", 0.24),
  storms: wf("heat", "storms", 0.32),
  mud: wf("heat", "mud", 0.65),
  scorching: wf("heat", "scorching", 0.7),
  dust: wf("heat", "dust", 0.83),
  bad: wf("heat", "bad", 0.92),
  disease: B.disease.start,
  typhus: wf("disease", "Typhus", 0.02),
  dysentery: wf("disease", "dysentery", 0.13),
  horses: wf("disease", "Horses", 0.56),
  melt: B.melt.start,
  deserted: wf("melt", "deserted", 0.04),
  fell: wf("melt", "fell", 0.17),
  dropped: wf("melt", "dropped", 0.5),
  month: wf("melt", "month", 0.62),
  n100: wf("melt", "one-", 0.75),
  gone: wf("melt", "gone", 0.94),
  vitebsk: B.vitebsk.start,
  stopped: wf("vitebsk", "stopped", 0.3),
  weeks: wf("vitebsk", "weeks", 0.42),
  fight: wf("vitebsk", "fight", 0.75),
  never: wf("vitebsk", "never", 0.9),
  thin: B.thin.start,
  line: wf("thin", "line", 0.2),
  third: wf("thin", "third", 0.47),
  fighting: wf("thin", "fighting", 0.75),
};

const V4 = {
  road: bbox([[21.5, 53.4], [33, 56.3]]),
  neman: bbox([[23.4, 54.65], [24.6, 55.2]]),
  start: bbox([[23.6, 54.35], [26.2, 55.3]]),
  wide: bbox([[23.2, 53.3], [31.2, 56]]),
  vilna: bbox([[24.3, 54.3], [26.5, 55.2]]),
  ahead: bbox([[24.8, 53.6], [30.6, 55.9]]),
  east: bbox([[26.6, 54.2], [31.2, 55.9]]),
  vitebsk: bbox([[28.6, 54.6], [32.3, 55.8]]),
  route: bbox([[23.7, 54.1], [32.2, 55.9]]),
};

// Point on Minard's advance at a longitude: [lon, lat, men].
const onRoute = (lon: number): [number, number, number] => {
  for (let i = 0; i < ADVANCE.length - 1; i++) {
    const [a, b] = [ADVANCE[i], ADVANCE[i + 1]];
    if (lon >= a[0] && lon <= b[0]) {
      const t = (lon - a[0]) / (b[0] - a[0] || 1);
      return [lon, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
  }
  return ADVANCE[ADVANCE.length - 1];
};

// One river lit up (the global layer draws all rivers; this only adds the glow).
const HiRiver = ({ name, k }: { name: string; k: number }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string }> }>("data/eu-rivers.json");
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

// A measuring brace across the band at a longitude, with a label chip above it.
const Brace = ({ lon, label, sub, k, color = GOLD, men }: { lon: number; label: string; sub?: string; k: number; color?: string; men?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const [, lat, m] = onRoute(lon);
  const p = projection([lon, lat]);
  const a = projection(onRoute(lon - 0.08).slice(0, 2) as [number, number]);
  const b = projection(onRoute(lon + 0.08).slice(0, 2) as [number, number]);
  if (!p || !a || !b) return null;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const n = [dy / l, -dx / l]; // points "up" for an eastward band
  const half = (((men ?? m) / 4200) * s) / 2 + 6 * s;
  const p0 = [p[0] - n[0] * half, p[1] - n[1] * half];
  const p1 = [p[0] + n[0] * half, p[1] + n[1] * half];
  const tick = (q: number[]) => <line x1={q[0] - (dx / l) * 12 * s} y1={q[1] - (dy / l) * 12 * s} x2={q[0] + (dx / l) * 12 * s} y2={q[1] + (dy / l) * 12 * s} stroke={color} strokeWidth={4 * s} strokeLinecap="round" />;
  const lw = Math.max(label.length, (sub ?? "").length * 0.8) * 21 * s + 40 * s;
  const lh = (sub ? 92 : 56) * s;
  const cx = p1[0];
  const cy = p1[1] - 30 * s - lh / 2;
  return (
    <g opacity={Math.min(1, k)}>
      <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#0b1020" strokeWidth={8 * s} strokeLinecap="round" />
      <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={color} strokeWidth={4 * s} strokeLinecap="round" />
      {tick(p0)}
      {tick(p1)}
      <line x1={p1[0]} y1={p1[1]} x2={cx} y2={cy + lh / 2} stroke={color} strokeWidth={3 * s} />
      <g transform={`translate(${cx},${cy}) scale(${Math.min(1, k)})`}>
        <rect x={-lw / 2} y={-lh / 2} width={lw} height={lh} rx={14 * s} fill="rgba(8,14,26,0.92)" stroke={color} strokeWidth={3 * s} />
        <text x={0} y={(sub ? -8 : 14) * s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={38 * s} fill="#fff">{label}</text>
        {sub && <text x={0} y={30 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={30 * s} fill={color}>{sub}</text>}
      </g>
    </g>
  );
};

// The Russian armies pulling back ahead of the band, then out of reach beyond Vitebsk.
const RussianArmies = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [T.vilna + 40, T.vilna + 70, T.vitebsk, T.vitebsk + 20, to - 20, to], [1, 0.55, 0.55, 1, 1, 0], clamp);
  const lab = interpolate(frame, [T.two, T.two + 10, T.vilna + 30, T.vilna + 50], [0, 1, 1, 0], clamp);
  const lab2 = interpolate(frame, [T.fight - 10, T.fight, T.thin - 10, T.thin], [0, 1, 1, 0], clamp);
  return (
    <g opacity={o}>
      <Arrow points={[[25.4, 54.95], [26.8, 55.4], [28.4, 55.6], [29.9, 55.45]]} start={T.refused} end={T.deeper} color={RUS} width={22} outline="#0f2a18" />
      <Arrow points={[[24.6, 53.5], [26, 53.7], [27.6, 53.9], [29.4, 53.95], [30.2, 54.3]]} start={T.two} end={T.deeper + 10} color={RUS} width={22} outline="#0f2a18" />
      <Arrow points={[[30.3, 55.35], [31.2, 55.1], [32, 54.85]]} start={T.fight - 20} end={T.fight + 30} color={RUS} width={18} variant="dashed" outline="#0f2a18" />
      <Arrow points={[[30.3, 54.35], [31.2, 54.55], [31.9, 54.75]]} start={T.fight - 14} end={T.fight + 36} color={RUS} width={18} variant="dashed" outline="#0f2a18" />
      <Pin at={[28.6, 55.62]} text="Russian army" k={lab} color={RUS} size={0.7} />
      <Pin at={[27.6, 53.9]} text="Russian army" k={lab} color={RUS} size={0.7} dy={52} />
      <Pin at={[31.6, 54.9]} text="Out of reach" k={lab2} color={RUS} size={0.7} />
    </g>
  );
};

// Fires along the road on "scorched earth", smouldering afterwards.
const FIRES: [number, number, keyof typeof T][] = [
  [26.0, 54.55, "crops"], [25.7, 54.95, "crops"], [26.9, 54.75, "villages"], [26.5, 54.3, "villages"], [27.6, 55.05, "villages"],
  [28.3, 54.85, "anything"], [29.1, 55.25, "anything"], [27.2, 53.95, "anything"], [29.6, 54.7, "anything"],
];
const MapFires = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const out = interpolate(frame, [T.heat, T.heat + 30, T.melt, T.melt + 20], [1, 0.55, 0.55, 0], clamp);
  if (frame < T.burned - 4 || out <= 0) return null;
  return (
    <g opacity={out}>
      <FigureDefs />
      {FIRES.map(([lon, lat, key], i) => {
        const f0 = T[key] + (i % 3) * 5;
        const k = interpolate(frame, [f0 - 2, f0 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
        const p = projection([lon, lat]);
        if (!p || k <= 0) return null;
        return (
          <g key={i}>
            <Smoke x={p[0]} y={p[1] - 10 * s} size={20 * s} seed={i} k={k * 0.8} />
            <Fire x={p[0]} y={p[1]} size={40 * s} seed={i} k={k} />
          </g>
        );
      })}
    </g>
  );
};

// Summer weather over the whole map: storm (dark + rain), then heat (warm haze).
const Weather = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  const storm = interpolate(frame, [T.storms - 8, T.storms + 8, T.scorching - 6, T.scorching + 8], [0, 1, 1, 0], clamp);
  const heat = interpolate(frame, [T.scorching - 4, T.scorching + 14, T.disease, T.disease + 20], [0, 1, 1, 0], clamp);
  if (storm <= 0 && heat <= 0) return null;
  return (
    <g>
      {storm > 0 && <rect width={width} height={height} fill="#0b1626" opacity={0.4 * storm} />}
      <Storm x={0} y={0} W={width} H={height} s={s * 1.3} k={storm} n={120} lightning={false} />
      {heat > 0 && (
        <g opacity={heat}>
          <defs>
            <radialGradient id="c4heat" cx="0.5" cy="0.15" r="0.9">
              <stop offset="0" stopColor="#ffb347" stopOpacity={0.55} />
              <stop offset="1" stopColor="#ff7a1a" stopOpacity={0.12} />
            </radialGradient>
          </defs>
          <rect width={width} height={height} fill="url(#c4heat)" style={{ mixBlendMode: "screen" }} />
          <Dust x={0} y={height * 0.5} W={width} s={s * 1.6} n={18} k={frame >= T.dust ? 0.9 : 0.4} />
        </g>
      )}
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <Pin at={CITY.kovno} text="Kovno" k={show(T.kovno, T.kaunas + 2)} size={0.9} dy={64} />
      <Pin at={CITY.kovno} text="Kovno · Kaunas" k={show(T.kaunas - 8, T.refuse + 10)} size={0.9} dy={64} />
      <Pin at={CITY.kovno} text="Kovno" k={show(T.thin, to)} size={0.8} dy={60} />
      <Pin at={CITY.vilna} text="Vilna" k={show(T.vilna + 8, T.heat)} size={0.9} dy={-120} />
      <Pin at={CITY.vilna} text="Vilna" k={show(T.thin, to)} size={0.8} dy={58} />
      <Pin at={CITY.vitebsk} text="Vitebsk" k={show(T.vitebsk + 6, to)} size={0.9} dy={58} />
    </g>
  );
};

const Measures = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const ghost = interpolate(frame, [T.line - 6, T.line + 14, to - 10, to + 10], [0, 1, 1, 0], clamp);
  return (
    <g>
      <Brace lon={24.3} label="Width = men" sub={frame >= T.number ? "1 mm = 10,000 men" : undefined} k={show(T.width, T.refuse + 6)} />
      <GhostBand k={ghost} />
      <Brace lon={24.4} label="Start" k={show(T.third, to)} color="#ffffff" />
      <Brace lon={28.7} label="A third thinner" k={show(T.third + 10, to)} color={RED} />
    </g>
  );
};

// --- Panels ---------------------------------------------------------------------------------------------------

const DAWN: [string, string] = ["#2c4a7a", "#f2b47a"];
const SUMMER: [string, string] = ["#6fa3d6", "#f0e6c4"];
const MIX: Uniform[] = [FRENCH, POLISH, BAVARIAN, FRENCH, ITALIAN, FRENCH];

// Three pontoon bridges seen from the bank: cavalry and infantry cross.
const CrossScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4cross" anchor={CITY.kovno} start={start} end={end} sky={DAWN} accent={GOLD}>
      {(g) => {
        const water = g.ground - 60 * g.s;
        const deck = water - 16 * g.s;
        const lane = g.W + 240 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={water - 40 * g.s} s={g.s} color="#2a3a3a" />
            <rect x={g.x} y={water - 40 * g.s} width={g.W} height={40 * g.s} fill="#3e5a3a" />
            <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#4d7591" />
            <PontoonBridge x0={g.x - 20 * g.s} x1={g.x + g.W + 20 * g.s} deck={deck} water={water + 4 * g.s} s={g.s} />
            {Array.from({ length: 7 }, (_, i) => {
              const sx = g.x - 120 * g.s + (((frame - start) * 1.7 * g.s + i * (lane / 7)) % lane);
              return i % 3 === 2 ? (
                <Horse key={i} x={sx} y={deck - 6 * g.s} scale={g.sc * 0.45} phase={i}>
                  <Rider u={POLISH} lance czapka />
                </Horse>
              ) : (
                <Soldier key={i} x={sx} y={deck - 6 * g.s} scale={g.sc * 0.55} phase={i * 0.9} u={MIX[i % MIX.length]} />
              );
            })}
            <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#5a6a3a" />
            <Napoleon x={g.x + g.W * 0.86} y={g.ground + 10 * g.s} scale={g.sc * 0.8} flip />
            <Standard x={g.x + g.W * 0.76} y={g.ground + 12 * g.s} scale={g.s * 0.9} />
          </g>
        );
      }}
    </Panel>
  );
};

// Minard (1869) at his drafting table.
const EngineerScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4minard" anchor={CITY.kovno} start={start} end={end} sky={["#3a3226", "#8a7458"]} accent={GOLD}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a4a36" />
          <rect x={g.x + g.W * 0.06} y={g.y + 60 * g.s} width={150 * g.s} height={110 * g.s} fill="#2c3a4a" stroke="#1b1d24" strokeWidth={3 * g.s} />
          <rect x={g.x + g.W * 0.06 + 8 * g.s} y={g.y + 68 * g.s} width={134 * g.s} height={94 * g.s} fill="#8fb0c8" opacity={0.6} />
          <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#6b4a2e" />
          <EngineerDesk x={g.x + g.W * 0.36} y={g.ground + 6 * g.s} scale={g.sc * 1.05} k={interpolate(frame, [start + 5, end - 20], [0.15, 1], clamp)} />
          <g transform={`translate(${g.x + g.W * 0.84},${g.y + 90 * g.s})`}>
            <rect x={-80 * g.s} y={-28 * g.s} width={160 * g.s} height={56 * g.s} rx={10 * g.s} fill="#f2ead6" stroke="#1b1d24" strokeWidth={2 * g.s} />
            <text x={0} y={-2 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22 * g.s} fill="#1b1d24">C. MINARD</text>
            <text x={0} y={20 * g.s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={18 * g.s} fill="#7a4a28">Paris, 1869</text>
          </g>
        </g>
      )}
    </Panel>
  );
};

// Napoleon looks for the enemy across an empty plain.
const WaitBattleScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4nobattle" anchor={CITY.vilna} start={start} end={end} sky={SUMMER} accent={GOLD}>
    {(g) => (
      <g>
        <Treeline x={g.x + g.W * 0.5} W={g.W * 0.5} ground={g.ground - 90 * g.s} s={g.s * 0.6} color="#5a7a5a" />
        <rect x={g.x} y={g.ground - 90 * g.s} width={g.W} height={g.H} fill="#a7b46e" />
        <path d={`M${g.x} ${g.ground + 10 * g.s} Q${g.x + g.W * 0.25} ${g.ground - 70 * g.s} ${g.x + g.W * 0.5} ${g.ground + 10 * g.s} Z`} fill="#8a9a58" />
        {[0, 1, 2].map((i) => <Soldier key={i} x={g.x + g.W * (0.05 + i * 0.07)} y={g.ground + 8 * g.s} scale={g.sc * 0.6} pose="stand" u={FRENCH} phase={i} />)}
        <Napoleon x={g.x + g.W * 0.27} y={g.ground - 52 * g.s} scale={g.sc * 0.8} />
        <text x={g.x + g.W * 0.75} y={g.ground - 30 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={60 * g.s} fill="#fff" stroke="#1b1d24" strokeWidth={6 * g.s} paintOrder="stroke" opacity={0.9}>?</text>
      </g>
    )}
  </Panel>
);

// Russian columns marching away into the distance.
const PullBackScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4pullback" anchor={[28.4, 55.6]} start={start} end={end} sky={SUMMER} accent={RUS}>
      {(g) => {
        const m = (frame - start) * 1.2 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 60 * g.s} s={g.s * 0.8} color="#3e5a40" />
            <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#b49a68" />
            <Dust x={g.x} y={g.ground} W={g.W} s={g.s} k={0.7} n={10} />
            {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.2 + i * 110 * g.s + m} y={g.ground + 6 * g.s} scale={g.sc * 0.62} phase={i} u={RUSSIAN} />)}
            <Wagon x={g.x + g.W * 0.08 + m} y={g.ground + 4 * g.s} scale={g.sc * 0.5} roll={(frame - start) * 4} />
          </g>
        );
      }}
    </Panel>
  );
};

// Vilna: the French march into an empty town.
const VilnaScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4vilna" anchor={CITY.vilna} start={start} end={end} sky={SUMMER} accent={GOLD}>
      {(g) => {
        const m = (frame - start) * 1.3 * g.s;
        return (
          <g>
            <Town x={g.cx + 40 * g.s} y={g.ground - 30 * g.s} scale={g.s * 0.95} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#9a8a70" />
            {[0, 1, 2, 3].map((i) => <Soldier key={i} x={g.x - 40 * g.s + i * 90 * g.s + m} y={g.ground + 8 * g.s} scale={g.sc * 0.62} phase={i} u={MIX[i]} />)}
            <Horse x={g.x - 160 * g.s + m} y={g.ground + 8 * g.s} scale={g.sc * 0.5} phase={1}>
              <Rider u={FRENCH} />
            </Horse>
          </g>
        );
      }}
    </Panel>
  );
};

// Scorched earth: the grain burns, then the huts. No people.
const ScorchScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4scorch" anchor={[26.9, 54.75]} start={start} end={end} sky={["#6a4a3a", "#e8a060"]} accent={RED}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 80 * g.s} s={g.s * 0.8} color="#3a3a2a" />
          <rect x={g.x} y={g.ground - 80 * g.s} width={g.W} height={g.H} fill="#7a7040" />
          <Hut x={g.x + g.W * 0.2} y={g.ground - 40 * g.s} scale={g.s * 1.1} burn={interpolate(frame, [T.villages, T.villages + 15], [0, 1], clamp)} seed={1} />
          <Hut x={g.x + g.W * 0.62} y={g.ground - 46 * g.s} scale={g.s * 0.9} burn={interpolate(frame, [T.villages + 12, T.villages + 27], [0, 1], clamp)} seed={4} />
          <Hut x={g.x + g.W * 0.86} y={g.ground - 40 * g.s} scale={g.s * 1.0} burn={interpolate(frame, [T.anything, T.anything + 15], [0, 1], clamp)} seed={7} />
          <GrainField x={g.x} y={g.ground + 20 * g.s} W={g.W} s={g.s} burn={interpolate(frame, [T.burned, T.villages + 30], [0, 1], clamp)} />
        </g>
      )}
    </Panel>
  );
};

// Summer storm: rain, mud, wagons stuck.
const StormScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4storm" anchor={[27.6, 54.9]} start={start} end={end} sky={["#2a3440", "#6a7680"]} accent={GOLD}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s * 0.9} color="#24302a" />
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#4a5a3a" />
          <Mud x={g.x} y={g.ground - 26 * g.s} W={g.W} H={g.H} s={g.s} />
          <Wagon x={g.x + g.W * 0.62} y={g.ground + 4 * g.s} scale={g.sc * 0.7} sink={interpolate(frame, [start, T.mud], [0.2, 1], clamp)} roll={Math.sin(frame * 0.35) * 6} />
          {[0, 1, 2].map((i) => <Soldier key={i} x={g.x + g.W * (0.08 + i * 0.13)} y={g.ground + 10 * g.s} scale={g.sc * 0.66} pose="trudge" u={MIX[i]} phase={i * 1.4} />)}
          <Storm x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
        </g>
      )}
    </Panel>
  );
};

// Scorching heat: sun, dust, a column trudging; then a barrel of bad water.
const HeatScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4heat" anchor={[28.4, 55]} start={start} end={end} sky={["#f0a040", "#fbe6b0"]} accent={RED}>
      {(g) => {
        const m = (frame - start) * 0.7 * g.s;
        return (
          <g>
            <HotSun x={g.x + g.W * 0.8} y={g.y + 80 * g.s} r={44 * g.s} />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#d4b47a" />
            {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.04 + i * 105 * g.s + m} y={g.ground + 8 * g.s} scale={g.sc * 0.62} pose="trudge" u={MIX[i % MIX.length]} phase={i * 1.1} />)}
            <Dust x={g.x} y={g.ground + 10 * g.s} W={g.W} s={g.s} k={frame >= T.dust ? 1 : 0.5} />
            {frame >= T.bad - 3 && <WaterBarrel x={g.x + g.W * 0.86} y={g.ground + 6 * g.s} scale={g.sc * interpolate(frame, [T.bad - 3, T.bad + 8], [0, 0.9], { ...clamp, easing: Easing.out(Easing.back(2)) })} />}
          </g>
        );
      }}
    </Panel>
  );
};

// Field hospital tents (no wounded shown).
const TentScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c4tent" anchor={[28.6, 55]} start={start} end={end} sky={["#7a8a94", "#d8d4c0"]} accent={RED}>
    {(g) => (
      <g>
        <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s * 0.8} color="#3e5040" />
        <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#8a9a68" />
        <CampTent x={g.x + g.W * 0.1} y={g.ground - 20 * g.s} scale={g.s * 0.9} />
        <FieldTent x={g.x + g.W * 0.45} y={g.ground + 4 * g.s} scale={g.s * 1.2} flag="#e2c14a" />
        <FieldTent x={g.x + g.W * 0.84} y={g.ground - 10 * g.s} scale={g.s * 0.8} flag="#e2c14a" />
        <WaterBarrel x={g.x + g.W * 0.2} y={g.ground + 8 * g.s} scale={g.sc * 0.6} />
      </g>
    )}
  </Panel>
);

// Horses gone: men haul a gun by hand; an unhitched wagon left behind.
const HaulScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4haul" anchor={[29, 55.1]} start={start} end={end} sky={["#c88a4a", "#f2dcae"]} accent={RED}>
      {(g) => {
        const m = (frame - start) * 0.45 * g.s;
        const gx = g.x + g.W * 0.4 + m;
        return (
          <g>
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#c2a46e" />
            <Wagon x={g.x + g.W * 0.12} y={g.ground + 4 * g.s} scale={g.sc * 0.55} sink={0.3} />
            <Cannon x={gx} y={g.ground + 4 * g.s} scale={g.sc * 0.6} flip roll={(frame - start) * 1.5} />
            <line x1={gx + 20 * g.s} y1={g.ground - 30 * g.s} x2={gx + 250 * g.s} y2={g.ground - 60 * g.s} stroke="#8a6a46" strokeWidth={3 * g.s} />
            {[0, 1, 2].map((i) => <Soldier key={i} x={gx + (110 + i * 70) * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.62} pose="trudge" u={FRENCH} phase={i * 1.3} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The column melts: a deserter walks off, stragglers fall behind and fade.
const MeltScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4melt" anchor={[29.4, 55.15]} start={start} end={end} sky={["#b8a07a", "#efe0bc"]} accent={RED}>
      {(g) => {
        const m = (frame - start) * 0.9 * g.s;
        const lag = interpolate(frame, [T.fell, T.fell + 60], [0, 1], clamp);
        const drop = interpolate(frame, [T.dropped, T.dropped + 30], [1, 0], clamp);
        const desert = interpolate(frame, [T.deserted, T.deserted + 90], [0, 1], clamp);
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 60 * g.s} s={g.s * 0.8} color="#4a5a40" />
            <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#b8a070" />
            {[0, 1, 2, 3].map((i) => <Soldier key={i} x={g.x + g.W * 0.5 + i * 90 * g.s + m} y={g.ground + 6 * g.s} scale={g.sc * 0.6} u={MIX[i]} phase={i} />)}
            {/* stragglers */}
            <Soldier x={g.x + g.W * 0.36 + m * (1 - lag * 0.8)} y={g.ground + 6 * g.s} scale={g.sc * 0.6} pose="trudge" u={BAVARIAN} phase={2} />
            <g opacity={drop}>
              <Soldier x={g.x + g.W * 0.22 + m * (1 - lag)} y={g.ground + 6 * g.s} scale={g.sc * 0.6} pose={lag > 0.6 ? "stand" : "trudge"} u={ITALIAN} phase={3} />
            </g>
            {/* deserter heading off the other way, into the trees */}
            <g opacity={1 - desert * 0.7}>
              <Soldier x={g.x + g.W * (0.3 - desert * 0.25)} y={g.ground - 30 * g.s * desert + 6 * g.s} scale={g.sc * 0.6 * (1 - desert * 0.35)} flip u={FRENCH} phase={1} />
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// Vitebsk: Napoleon waits by his tent; the days pile up.
const VitebskScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c4vitebsk" anchor={CITY.vitebsk} start={start} end={end} sky={SUMMER} accent={GOLD}>
      {(g) => {
        const day = Math.max(1, Math.round(interpolate(frame, [start + 20, T.never - 10], [1, 14], clamp)));
        return (
          <g>
            <Town x={g.x + g.W * 0.32} y={g.ground - 60 * g.s} scale={g.s * 0.55} />
            <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#a7b46e" />
            <CampTent x={g.x + g.W * 0.12} y={g.ground - 10 * g.s} scale={g.s * 1.4} color="#e8e2cc" />
            <Standard x={g.x + g.W * 0.24} y={g.ground + 4 * g.s} scale={g.s * 0.8} />
            <Napoleon x={g.x + g.W * 0.4 + Math.sin((frame - start) * 0.03) * 60 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.8} flip={Math.cos((frame - start) * 0.03) < 0} />
            <Calendar x={g.x + g.W * 0.8} y={g.y + g.H * 0.48} s={g.s * 1.1} day={day} font={font} head="DAY" />
          </g>
        );
      }}
    </Panel>
  );
};

const count = (f0: number, f1: number, n: number, pre = "") => (frame: number) =>
  pre + (Math.round((n * interpolate(frame, [f0, f1], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })) / 1000) * 1000).toLocaleString("en-US");

export const ch4: Chapter = {
  name: "Crossing the Neman",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V4.road, w, h, 1, 0.1) },
    { frame: T.june - 10, cam: view(V4.road, w, h, 1, 0.1) },
    { frame: T.june + 40, cam: view(V4.neman, w, h, 1, 0.1) },
    { frame: T.watch - 8, cam: view(V4.neman, w, h, 1, 0.1) },
    { frame: T.watch + 30, cam: view(V4.start, w, h, 1, 0.1) },
    { frame: T.two - 10, cam: view(V4.start, w, h, 1, 0.1) },
    { frame: T.two + 30, cam: view(V4.wide, w, h, 1, 0.1) },
    { frame: T.vilna - 6, cam: view(V4.wide, w, h, 1, 0.1) },
    { frame: T.vilna + 30, cam: view(V4.vilna, w, h, 1, 0.1) },
    { frame: T.scorch - 6, cam: view(V4.vilna, w, h, 1, 0.1) },
    { frame: T.scorch + 30, cam: view(V4.ahead, w, h, 1, 0.1) },
    { frame: T.disease, cam: view(V4.ahead, w, h, 1, 0.1) },
    { frame: T.melt + 20, cam: view(V4.east, w, h, 1, 0.1) },
    { frame: T.vitebsk - 6, cam: view(V4.east, w, h, 1, 0.1) },
    { frame: T.vitebsk + 30, cam: view(V4.vitebsk, w, h, 1, 0.1) },
    { frame: T.thin - 6, cam: view(V4.vitebsk, w, h, 1, 0.1) },
    { frame: T.thin + 30, cam: view(V4.route, w, h, 0.92, 0.1) },
    { frame: to - 1, cam: view(V4.route, w, h, 0.92, 0.1) }, // hand-off: ch5 should start from this view
  ],
  years: [[from, "June 1812"], [T.heat, "Summer 1812"], [T.vitebsk, "July 1812"]],
  heads: [
    { f: T.cross, tag: "24 June 1812", head: "Crossing the Neman", color: GOLD, chips: [{ text: "Kovno = Kaunas, Lithuania", f: T.kaunas }] },
    { f: T.minard, tag: "Minard's line", head: "Width = number of men", color: GOLD, chips: [{ text: "1 mm = 10,000 men", f: T.number }, { text: "Charles Minard, 1869", f: T.minardName }] },
    { f: T.refuse, tag: "No battle", head: "The Russians pull back", color: RUS, chips: [{ text: "Deeper and deeper", f: T.deeper }] },
    { f: T.vilna, tag: "28 June 1812", head: "Vilna, without a fight", color: GOLD, chips: [{ text: "Russians already gone", f: T.already }] },
    { f: T.scorch, tag: "Scorched earth", head: "Nothing left to eat", color: RED, chips: [{ text: "Crops", f: T.crops }, { text: "Villages", f: T.villages }] },
    { f: T.heat, tag: "Summer, not winter", head: "The weather", color: RED, chips: [{ text: "Storms", f: T.storms }, { text: "Mud", f: T.mud }, { text: "Heat", f: T.scorching }, { text: "Dust", f: T.dust }, { text: "Bad water", f: T.bad }] },
    { f: T.disease, tag: "Disease", head: "Typhus · dysentery", color: RED, chips: [{ text: "Horses dying by the thousands", f: T.horses }] },
    { f: T.melt, tag: "First month", head: "Without a major battle", stat: (f: number) => (f < T.n100 - 2 ? "" : count(T.n100, T.n100 + 30, 100000, "−")(f)), label: "men gone", color: RED },
    { f: T.vitebsk, tag: "Vitebsk · late July", head: "Two weeks of waiting", color: GOLD, chips: [{ text: "They never came", f: T.never }] },
    { f: T.thin, tag: "Look at the line", head: "Already a third gone", color: RED, chips: [{ text: "Before any big battle", f: T.fighting }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <g>
        <HiRiver name="Neman" k={interpolate(frame, [T.neman - 6, T.neman + 10, T.minard, T.minard + 20], [0, 1, 1, 0], clamp)} />
        <Weather />
        <MapFires />
        <RussianArmies />
        <Measures />
        <Labels />
      </g>
    );
  },
  Panels: () => (
    <g>
      <CrossScene start={T.cross + 8} end={T.watch + 20} />
      <EngineerScene start={T.french} end={T.battle + 14} />
      <WaitBattleScene start={T.battle} end={T.two + 14} />
      <PullBackScene start={T.two} end={T.took + 14} />
      <VilnaScene start={T.took} end={T.scorch + 6 + 14} />
      <ScorchScene start={T.scorch + 6} end={T.summer + 14} />
      <StormScene start={T.summer} end={T.scorching + 14} />
      <HeatScene start={T.scorching} end={T.typhus + 14} />
      <TentScene start={T.typhus} end={T.horses + 14} />
      <HaulScene start={T.horses} end={T.melt + 14} />
      <MeltScene start={T.melt} end={T.vitebsk + 14} />
      <VitebskScene start={T.vitebsk} end={T.line + 10} />
    </g>
  ),
  sfx: [
    [T.june - 10, SFX.whoosh, 0.35],
    [T.neman, SFX.pop, 0.3],
    [T.kovno, SFX.pop, 0.35],
    [T.watch - 8, SFX.whoosh, 0.3],
    [T.width, SFX.pop, 0.4],
    [T.number, SFX.pop, 0.35],
    [T.refused, SFX.whoosh, 0.3],
    [T.two - 10, SFX.whoosh, 0.35],
    [T.vilna - 6, SFX.whoosh, 0.35],
    [T.vilna + 8, SFX.pop, 0.35],
    [T.burned, SFX.pop, 0.35],
    [T.villages, SFX.pop, 0.3],
    [T.scorch - 6, SFX.whoosh, 0.3],
    [T.storms, SFX.whoosh, 0.3],
    [T.typhus, SFX.pop, 0.35],
    [T.melt, SFX.whoosh, 0.3],
    [T.n100, SFX.hit, 0.45],
    [T.vitebsk - 6, SFX.whoosh, 0.35],
    [T.vitebsk + 6, SFX.pop, 0.35],
    [T.never, SFX.hit, 0.35],
    [T.thin - 6, SFX.whoosh, 0.35],
    [T.third, SFX.hit, 0.45],
  ],
};
