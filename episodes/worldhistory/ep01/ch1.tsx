import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { bbox, region } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { BLUE, clamp, GOLD, Panel, Pin, QuizNews, RED, RUS, view, type Chapter } from "../kit/news";
import { FRENCH, Napoleon, Soldier } from "../kit/Period";
import { AREA_1810, AreaName, BattleMark, BritainGlow, Cannon, Emperor, Flag, Hills, LandClip, MapNote, Palace, Sea, Ship, SoftArea } from "../kit/PeriodA";
import { V as V0 } from "./ch0";
import { CITY } from "./minard";
import { B, span, wf } from "./time";

// Chapter 1 "Who was Napoleon?" (beats toulon → quizans1): Toulon 1793, power and the crown, the big wins,
// Europe in 1810, the quiz (Britain), and the turn east to Russia.
const [from, to] = span("ch1");

const P = {
  toulon: CITY.toulon,
  paris: CITY.paris,
  austerlitz: [16.76, 49.13] as [number, number],
  jena: [11.59, 50.93] as [number, number],
  friedland: [21.02, 54.45] as [number, number],
  vienna: [16.37, 48.21] as [number, number],
  berlin: [13.4, 52.52] as [number, number],
  london: [-0.13, 51.5] as [number, number],
};

const V = {
  europe: bbox([[-8, 38], [40, 60]]),
  toulon: bbox([[0, 40.5], [12, 46]]),
  paris: bbox([[-4, 46], [9, 51.5]]),
  wins: bbox([[-1, 44], [25, 58]]),
  empire: bbox([[-10, 36], [26, 58]]),
  quiz: bbox([[-9, 44], [24, 59]]),
  east: bbox([[-8, 42], [44, 62]]),
};

const T = {
  y93: wf("toulon", "seventeen-", 0.2),
  art: wf("toulon", "artillery", 0.42),
  take: wf("toulon", "take", 0.78),
  toulon: wf("toulon", "Toulon", 0.84),
  rise: B.rise.start,
  seized: wf("rise", "seized", 0.2),
  paris: wf("rise", "Paris.", 0.37),
  y04: wf("rise", "eighteen-", 0.47),
  crowned: wf("rise", "crowned", 0.62),
  emperor: wf("rise", "Emperor", 0.79),
  wins: B.wins.start,
  beat: wf("wins", "beat", 0.08),
  austria: wf("wins", "Austria", 0.33),
  austerlitz: wf("wins", "Austerlitz.", 0.38),
  prussia: wf("wins", "Prussia", 0.6),
  jena: wf("wins", "Jena.", 0.74),
  russia: wf("wins", "Russia", 0.81),
  friedland: wf("wins", "Friedland.", 0.9),
  empire: B.empire.start,
  france: wf("empire", "France", 0.18),
  spain: wf("empire", "Spain", 0.36),
  baltic: wf("empire", "Baltic,", 0.48),
  europe: wf("empire", "Europe", 0.74),
  ally: wf("empire", "ally", 0.82),
  quiz: B.quiz1.start,
  quick: wf("quiz1", "Quick", 0.05),
  qa: wf("quiz1", "Austria,", 0.68),
  qp: wf("quiz1", "Prussia,", 0.8),
  qb: wf("quiz1", "Britain?", 0.95),
  ans: B.quizans1.start,
  royal: wf("quizans1", "Royal", 0.25),
  reach: wf("quizans1", "reach.", 0.52),
  and: wf("quizans1", "And", 0.66),
  rus: wf("quizans1", "Russia", 0.77),
};
const END = to;

const EMPIRE = region(AREA_1810.empire);
const ILLYRIA = region(AREA_1810.illyria);
const SATS = [AREA_1810.spain, AREA_1810.rhine, AREA_1810.swiss, AREA_1810.italy, AREA_1810.naples, AREA_1810.warsaw].map(region);
const RUSSIA = region(AREA_1810.russia);
const LIGHT = "#9fd0ff";

const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

// France fills outward from Paris (a growing circle mask), then the satellites in lighter blue.
const Empire = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const c = projection(P.paris);
  const r = interpolate(frame, [T.france - 6, T.baltic + 10], [0, 1500], { ...clamp, easing: (t) => 1 - (1 - t) * (1 - t) }) * s;
  // dims a little under the quiz, gone when the chapter hands over (ch2 redraws the same areas)
  const dim = frame >= END ? 0 : interpolate(frame, [T.quiz, T.quiz + 20], [1, 0.75], clamp);
  if (frame < T.france - 6 || dim <= 0 || !c) return null;
  const sat = (i: number) => {
    const f0 = i === 0 ? T.spain : T.europe + i * 4;
    return interpolate(frame, [f0, f0 + 14], [0, 1], clamp);
  };
  return (
    <g opacity={dim}>
      <defs>
        <clipPath id="a1grow">
          <circle cx={c[0]} cy={c[1]} r={r} />
        </clipPath>
      </defs>
      {SATS.map((f, i) => <SoftArea key={i} feature={f} color={LIGHT} k={sat(i)} clip="a1land" fill={0.32} />)}
      <g clipPath="url(#a1grow)">
        <SoftArea feature={EMPIRE} color={BLUE} k={1} clip="a1land" fill={0.55} edge="#d6ecff" />
        <SoftArea feature={ILLYRIA} color={BLUE} k={1} clip="a1land" fill={0.55} edge="#d6ecff" />
      </g>
    </g>
  );
};

const MapLayer = () => {
  const frame = useCurrentFrame();
  const battle = (at: [number, number], text: string, f0: number) => (
    <g key={text}>
      <Pin at={at} text={text} k={fade(frame, f0, T.empire + 20)} color={BLUE} dy={-52} size={0.85} />
      <BattleMark at={at} start={f0} end={T.empire + 20} size={40} />
    </g>
  );
  return (
    <g>
      <LandClip id="a1land" />
      <Empire />
      <AreaName at={[2.6, 46.6]} text="French Empire" k={fade(frame, T.france + 20, T.quiz + 10)} size={0.8} />
      <AreaName at={[-3.8, 40]} text="Spain" k={fade(frame, T.spain + 10, T.quiz + 10)} color="#d6ecff" size={0.6} />
      <MapNote text="Borders approximate" k={fade(frame, T.france, T.quiz + 10)} y={0.735} x={0.94} anchor="end" />
      <Pin at={P.toulon} text="Toulon" k={fade(frame, T.y93 + 30, T.rise + 30)} color={BLUE} />
      <Pin at={P.paris} text="Paris" k={fade(frame, T.paris - 4, T.empire + 20)} color={BLUE} />
      {battle(P.austerlitz, "Austerlitz", T.austerlitz - 4)}
      {battle(P.jena, "Jena", T.jena - 4)}
      {battle(P.friedland, "Friedland", T.friedland - 4)}
      <Pin at={P.vienna} text="Austria?" k={fade(frame, T.qa - 4, T.ans + 20)} color={GOLD} size={0.8} />
      <Pin at={P.berlin} text="Prussia?" k={fade(frame, T.qp - 4, T.ans + 20)} color={GOLD} size={0.8} />
      <BritainGlow k={frame < END ? interpolate(frame, [T.ans - 2, T.ans + 10], [0, 1], clamp) : 0} />
      <Pin at={P.london} text={frame < T.ans ? "Britain?" : "Britain"} k={fade(frame, T.qb - 4, END)} color={frame < T.ans ? GOLD : RED} size={0.8} />
      <SoftArea feature={RUSSIA} color={RUS} k={frame < END ? interpolate(frame, [T.rus - 4, T.rus + 16], [0, 1], clamp) : 0} clip="a1land" fill={0.35} />
      <AreaName at={[38, 57.5]} text="Russia" k={fade(frame, T.rus + 8, END)} color="#bff0cf" />
    </g>
  );
};

// ---- Panels ----

// Toulon 1793: the young artillery officer by his gun on the heights, British ships in the harbour.
const OfficerScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a1officer" anchor={P.toulon} start={start} end={end} sky={["#5d8fc4", "#f2d6a8"]} accent={BLUE}>
    {(g) => {
      const sea = g.ground - 70 * g.s;
      return (
        <g>
          <Hills x={g.x} W={g.W} ground={sea} s={g.s} color="#8a9a72" />
          <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3f7aa3" />
          <Ship x={g.x + g.W * 0.72} y={sea + 22 * g.s} scale={g.sc * 0.42} flag="british" />
          <Ship x={g.x + g.W * 0.92} y={sea + 14 * g.s} scale={g.sc * 0.32} flag="british" phase={2} />
          <path d={`M${g.x} ${g.ground - 20 * g.s} L${g.x + g.W * 0.5} ${g.ground - 30 * g.s} L${g.x + g.W * 0.56} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#a88a5a" />
          <Cannon x={g.x + g.W * 0.3} y={g.ground - 22 * g.s} scale={g.sc * 0.8} />
          <Napoleon x={g.x + g.W * 0.12} y={g.ground - 18 * g.s} scale={g.sc * 0.8} />
          <Flag x={g.x + g.W * 0.45} y={g.ground - 28 * g.s} s={g.s * 0.9} />
        </g>
      );
    }}
  </Panel>
);

// The guns fire; the British ships turn and sail away.
const HarbourScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a1harbour" anchor={P.toulon} start={start} end={end} sky={["#7a5a6a", "#f0b07a"]} accent={BLUE}>
      {(g) => {
        const sea = g.ground - 70 * g.s;
        const fire = (o: number) => ((frame - start + o) % 40) / 40;
        const away = interpolate(frame, [T.toulon, end], [0, 1], clamp);
        return (
          <g>
            <Hills x={g.x} W={g.W} ground={sea} s={g.s} color="#7a7a62" />
            <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#3a6a8a" />
            {[0, 1, 2].map((i) => (
              <Ship key={i} x={g.x + g.W * (0.6 + i * 0.16) + away * 160 * g.s} y={sea + (16 + i * 6) * g.s} scale={g.sc * (0.38 - i * 0.05)} flag="british" phase={i} />
            ))}
            <path d={`M${g.x} ${g.ground - 14 * g.s} L${g.x + g.W * 0.45} ${g.ground - 24 * g.s} L${g.x + g.W * 0.5} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#9a7a4a" />
            <Cannon x={g.x + g.W * 0.16} y={g.ground - 14 * g.s} scale={g.sc * 0.7} fire={fire(0)} />
            <Cannon x={g.x + g.W * 0.34} y={g.ground - 20 * g.s} scale={g.sc * 0.7} fire={fire(20)} />
            <Soldier x={g.x + g.W * 0.06} y={g.ground - 10 * g.s} scale={g.sc * 0.62} pose="stand" u={FRENCH} />
            <Soldier x={g.x + g.W * 0.25} y={g.ground - 16 * g.s} scale={g.sc * 0.62} pose="stand" u={FRENCH} phase={2} />
          </g>
        );
      }}
    </Panel>
  );
};

// Paris 1799: Napoleon in front of the palace, grenadiers and flags.
const PowerScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="a1power" anchor={P.paris} start={start} end={end} sky={["#41689a", "#cfe0ee"]} accent={BLUE}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#b8ad96" />
        <Palace x={g.cx} y={g.ground - 4 * g.s} s={g.s * 1.05} W={700} />
        <Flag x={g.cx - 260 * g.s} y={g.ground - 4 * g.s} s={g.s * 1.1} />
        <Flag x={g.cx + 260 * g.s} y={g.ground - 4 * g.s} s={g.s * 1.1} phase={1.5} />
        {[0.08, 0.18, 0.82, 0.92].map((fx, i) => <Soldier key={i} x={g.x + g.W * fx} y={g.ground + 22 * g.s} scale={g.sc * 0.7} pose="stand" u={FRENCH} flip={fx > 0.5} phase={i} />)}
        <Napoleon x={g.cx} y={g.ground + 26 * g.s} scale={g.sc * 0.85} />
      </g>
    )}
  </Panel>
);

// 1804: he lifts the crown onto his own head.
const CrownScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a1crown" anchor={P.paris} start={start} end={end} sky={["#3a2440", "#8a5a6a"]} accent={GOLD}>
      {(g) => {
        const k = interpolate(frame, [T.crowned + 6, T.emperor + 10], [0, 1], clamp);
        return (
          <g>
            {[0.12, 0.3, 0.7, 0.88].map((fx) => <rect key={fx} x={g.x + g.W * fx - 18 * g.s} y={g.y} width={36 * g.s} height={g.H} fill="#cbb98e" opacity={0.85} />)}
            {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.2 + i * 0.1)} cy={g.y + 70 * g.s} r={5 * g.s} fill="#ffe08a" opacity={0.6 + 0.4 * Math.sin(frame * 0.2 + i)} />)}
            <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#7a2a2a" />
            <rect x={g.cx - 120 * g.s} y={g.ground - 20 * g.s} width={240 * g.s} height={16 * g.s} fill="#c9a03c" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            <Emperor x={g.cx} y={g.ground - 18 * g.s} scale={g.sc * 0.95} k={k} />
          </g>
        );
      }}
    </Panel>
  );
};

// The victories: columns advance behind the eagle, smoke over the field.
const AdvanceScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a1advance" anchor={P.austerlitz} start={start} end={end} sky={["#8a9aa8", "#e8d9b8"]} accent={BLUE}>
      {(g) => {
        const m = (frame - start) * 0.8 * g.s;
        return (
          <g>
            {[0.2, 0.5, 0.8].map((fx, i) => (
              <g key={i} opacity={0.5}>
                {[[-40, 10, 34], [0, 0, 46], [44, 12, 30], [10, 26, 30]].map(([dx, dy, r], j) => (
                  <circle key={j} cx={g.x + g.W * fx + (dx + Math.sin(frame * 0.02 + i + j) * 12) * g.s} cy={g.ground - (130 - dy) * g.s} r={r * g.s} fill="#ece8de" />
                ))}
              </g>
            ))}
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#7a8a52" />
            {Array.from({ length: 8 }, (_, i) => (
              <Soldier key={i} x={g.x + g.W * 0.04 + i * 70 * g.s + m} y={g.ground + (i % 2 ? 10 : 22) * g.s} scale={g.sc * 0.66} phase={i * 0.8} u={FRENCH} />
            ))}
            <Flag x={g.x + g.W * 0.04 + 7.5 * 70 * g.s + m} y={g.ground + 18 * g.s} s={g.s} eagle />
          </g>
        );
      }}
    </Panel>
  );
};

// A battery fires in line.
const BatteryScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a1battery" anchor={P.jena} start={start} end={end} sky={["#6a7a8a", "#d8c8a8"]} accent={BLUE}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f7f4a" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <Cannon x={g.x + g.W * (0.14 + i * 0.22)} y={g.ground + 4 * g.s} scale={g.sc * 0.7} fire={((frame - start + i * 11) % 44) / 44} />
              <Soldier x={g.x + g.W * (0.06 + i * 0.22)} y={g.ground + 14 * g.s} scale={g.sc * 0.58} pose="stand" u={FRENCH} phase={i} />
            </g>
          ))}
        </g>
      )}
    </Panel>
  );
};

// The Royal Navy: warships in a line of battle.
const NavyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="a1navy" anchor={P.london} start={start} end={end} sky={["#4a6a8a", "#d8e4ea"]} accent={RED}>
      {(g) => {
        const sea = g.ground - 80 * g.s;
        const m = (frame - start) * 0.5 * g.s;
        return (
          <g>
            <Sea x={g.x} y={sea} W={g.W} H={g.H} s={g.s} color="#2f5a7a" />
            {[0, 1, 2, 3].map((i) => (
              <Ship key={i} x={g.x + g.W * (0.1 + i * 0.28) + m} y={sea + (22 + (i % 2) * 18) * g.s} scale={g.sc * 0.5} flag="british" phase={i * 1.3} />
            ))}
          </g>
        );
      }}
    </Panel>
  );
};

export const ch1: Chapter = {
  name: "Who was Napoleon?",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V0.route, w, h, 1, 0.02) },
    { frame: from + 40, cam: view(V.europe, w, h, 1, 0.05) },
    { frame: T.y93 + 10, cam: view(V.europe, w, h, 1, 0.05) },
    { frame: T.art - 4, cam: view(V.toulon, w, h, 1, 0.08) },
    { frame: T.rise, cam: view(V.toulon, w, h, 1, 0.08) },
    { frame: T.rise + 34, cam: view(V.paris, w, h, 1, 0.08) },
    { frame: T.wins, cam: view(V.paris, w, h, 1, 0.08) },
    { frame: T.wins + 40, cam: view(V.wins, w, h, 1, 0.08) },
    { frame: T.empire, cam: view(V.wins, w, h, 1, 0.08) },
    { frame: T.empire + 34, cam: view(V.empire, w, h, 1, 0) },
    { frame: T.quiz, cam: view(V.empire, w, h, 1, 0) },
    { frame: T.quiz + 34, cam: view(V.quiz, w, h, 1, 0.08) },
    { frame: T.and, cam: view(V.quiz, w, h, 1, 0.08) },
    { frame: T.and + 50, cam: view(V.east, w, h, 1, 0.05) },
  ],
  years: [[from, "1793"], [T.seized - 8, "1799"], [T.y04, "1804"], [T.austria, "1805"], [T.prussia, "1806"], [T.russia, "1807"], [T.empire, "1810"]],
  heads: [
    { f: from, tag: "1793", head: "First, the man", color: BLUE },
    { f: T.art, tag: "Artillery officer · age 24", head: "Napoleon Bonaparte", color: BLUE },
    { f: T.take, tag: "Toulon · 1793", head: "Port retaken from the British", color: BLUE },
    { f: T.rise, tag: "1799", head: "Seizes power in Paris", color: BLUE },
    { f: T.crowned, tag: "1804", head: "Emperor of the French", color: GOLD },
    { f: T.wins, tag: "1805 → 1807", head: "He beats almost everyone", color: BLUE, chips: [{ text: "Austerlitz 1805", f: T.austerlitz }, { text: "Jena 1806", f: T.jena }, { text: "Friedland 1807", f: T.friedland }] },
    { f: T.empire, tag: "Europe, 1810", head: "France and its satellites", color: BLUE, chips: [{ text: "Spain", f: T.spain }, { text: "to the Baltic", f: T.baltic }, { text: "allies & puppets", f: T.ally }] },
    { f: T.quiz, tag: "Quick quiz", head: "Never conquered?", color: GOLD },
    { f: T.ans, tag: "Answer", head: "Britain", color: RED, chips: [{ text: "Royal Navy", f: T.royal }, { text: "Out of reach", f: T.reach }] },
    { f: T.rus, tag: "Next", head: "Russia gets dragged in", color: RUS },
  ],
  Map: () => <MapLayer />,
  Panels: () => (
    <g>
      <OfficerScene start={T.art} end={T.take + 14} />
      <HarbourScene start={T.take} end={T.seized + 14} />
      <PowerScene start={T.seized} end={T.crowned + 14} />
      <CrownScene start={T.crowned} end={T.beat + 14} />
      <AdvanceScene start={T.beat} end={T.prussia + 14} />
      <BatteryScene start={T.prussia} end={T.empire + 24} />
      <NavyScene start={T.royal} end={T.rus + 20} />
    </g>
  ),
  Screen: () => <QuizNews title="QUICK QUIZ" question="Which did Napoleon never conquer?" options={["Austria", "Prussia", "Britain"]} answer={2} start={T.quick} reveal={T.ans} end={T.royal + 14} />,
  sfx: [
    [from - 4, SFX.whoosh, 0.4],
    [T.art - 8, SFX.whoosh, 0.35],
    [T.y93 + 30, SFX.pop, 0.3],
    [T.take + 6, SFX.hit, 0.35],
    [T.rise + 2, SFX.whoosh, 0.35],
    [T.paris - 4, SFX.pop, 0.3],
    [T.emperor, SFX.swell, 0.35],
    [T.wins + 4, SFX.whoosh, 0.35],
    [T.austerlitz - 4, SFX.pop, 0.4],
    [T.jena - 4, SFX.pop, 0.4],
    [T.friedland - 4, SFX.pop, 0.4],
    [T.empire + 4, SFX.whoosh, 0.35],
    [T.france - 4, SFX.swell, 0.3],
    [T.quick, SFX.pop, 0.4],
    [T.ans - 60, SFX.tick, 0.3],
    [T.ans - 30, SFX.tick, 0.3],
    [T.ans, SFX.hit, 0.5],
    [T.and + 4, SFX.whoosh, 0.4],
    [T.rus - 2, SFX.pop, 0.3],
  ],
};
