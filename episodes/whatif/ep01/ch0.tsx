import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { Depth, Glow, PAL, Ridge } from "../../../components/Scene";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { useJson } from "../../../components/useJson";
import { clamp, display, GOLD, Panel, Pin, view } from "../../worldhistory/kit/news";
import { alaska, BORDER, Flag, moveTrueSize, REAL, RU_FLAG, russia, RUSSIA, US_FLAG, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, Ring, Shape } from "./mapkit";
import { P, V } from "./places";
import { BorderPanel, OutpostPanel, SiloPanel, SitkaPanel } from "./scenes0";
import { B, span, VOICE, wf } from "./time";

// Opening (hook → question): the what-if hook in the graded world, the split back to 1867, the sale,
// Alaska vs Texas + California + Montana, and the question.
const [from, to] = span("ch0");

const T = {
  close: B.close.start,
  stand: wf("close", "guarding", 0.2),
  missile: wf("close", "missiles", 0.62),
  real: B.real.start,
  y1867: wf("real", "eighteen-", 0.2),
  sell: wf("real", "sold", 0.45),
  price: wf("real", "seven-", 0.75),
  size: B.size.start,
  states: [wf("size", "Texas,", 0.3), wf("size", "California", 0.45), wf("size", "Montana", 0.7)],
  q: B.question.start,
  why: wf("question", "why", 0.1),
  world: wf("question", "world", 0.6),
};
const SALUTE = [T.sell + 56, T.sell + 74];

const STATES: [string, [number, number], number, string][] = [
  ["Texas", [-151.5, 63.6], 0, GOLD],
  ["California", [-159.5, 59.4], 75, "#ff9f43"],
  ["Montana", [-152.5, 68.6], 0, "#7bed9f"],
];

const States = () => {
  const frame = useCurrentFrame();
  const data = useJson<FeatureCollection<Polygon | MultiPolygon, { name: string }>>("data/us-3states.json");
  const out = interpolate(frame, [T.q + 20, T.q + 40], [1, 0], clamp);
  return (
    <g opacity={out}>
      {STATES.map(([name, at, rot, color], i) => {
        const f = data?.features.find((x) => x.properties.name === name);
        if (!f || frame < T.states[i]) return null;
        const k = interpolate(frame, [T.states[i], T.states[i] + 10], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
        return <Shape key={name} f={moveTrueSize(f, at, rot)} color={color} k={k} label={name.toUpperCase()} />;
      })}
    </g>
  );
};

const BorderGlow = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  if (frame < T.close + 10 || frame >= T.real) return null;
  const k = interpolate(frame, [T.close + 10, T.close + 40], [0, 1], clamp);
  const d = path({ type: "LineString", coordinates: BORDER }) ?? "";
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={RUSSIA} strokeWidth={18 * s} strokeOpacity={0.35 * k} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} stroke="#ffd0dc" strokeWidth={4 * s} strokeDasharray={`${16 * s} ${10 * s}`} strokeDashoffset={-frame * 1.2 * s} opacity={k} />
    </g>
  );
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.12, opacity: o, fontFamily: display, fontWeight: 700, textTransform: "uppercase", color: "#fff", textAlign: "center", lineHeight: 1.1 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 124 * s }}>What if <span style={{ color: "#ff6b6f" }}>Russia</span></div>
        <div style={{ fontSize: 104 * s }}>never sold Alaska?</div>
      </div>
    </div>
  );
};

// "?" badge on the question.
const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [T.why - 4, T.why + 8, to - 10, to], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", top: height * 0.29, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, k) }}>
      <div style={{ width: 170 * s, height: 170 * s, borderRadius: "50%", background: WHATIF, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: 130 * s, lineHeight: `${170 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${50 * s}px rgba(224,64,154,0.6)` }}>?</div>
    </div>
  );
};

// The question: a map table by candlelight, the two flags on little stands, papers stirring.
const TablePanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="table" anchor={P.capePrince as [number, number]} start={start} end={end} sky={["#1c140e", "#3a281a"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="table" start={start} end={end} warm={0.1}>
          {(pan) => {
            const top = g.y + g.H * 0.58;
            const flick = 1 + Math.sin(frame * 0.5) * 0.04 + Math.sin(frame * 1.3) * 0.03;
            return (
              <g>
                {/* back wall: shelves of books, slow parallax */}
                <g transform={`translate(${pan * 0.2},0)`}>
                  {Array.from({ length: 3 }, (_, r) => (
                    <g key={r}>
                      <rect x={g.x - 40 * g.s} y={g.y + (40 + r * 62) * g.s} width={g.W + 80 * g.s} height={6 * g.s} fill="#2a1c12" />
                      {Array.from({ length: 30 }, (_, i) => (
                        <rect key={i} x={g.x - 30 * g.s + i * 38 * g.s} y={g.y + (6 + r * 62) * g.s + (i % 3) * 4 * g.s} width={(16 + (i % 4) * 5) * g.s} height={(34 - (i % 3) * 4) * g.s} fill={["#5a2a22", "#2b3a57", "#4a4a2a", "#6b4a2a"][i % 4]} stroke={PAL.ink} strokeWidth={0.8 * g.s} />
                      ))}
                    </g>
                  ))}
                </g>
                {/* table with a map */}
                <g transform={`translate(${pan * 0.6},0)`}>
                  <path d={`M${g.x - 30 * g.s} ${top} L${g.x + g.W + 30 * g.s} ${top} L${g.x + g.W + 80 * g.s} ${g.y + g.H} L${g.x - 80 * g.s} ${g.y + g.H} Z`} fill="#5a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <path d={`M${g.x + g.W * 0.18} ${top + 10 * g.s} L${g.x + g.W * 0.8} ${top + 8 * g.s} L${g.x + g.W * 0.86} ${g.y + g.H - 14 * g.s} L${g.x + g.W * 0.12} ${g.y + g.H - 10 * g.s} Z`} fill="#e8d9b4" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  {/* sketch of the strait on the map */}
                  <path d={`M${g.x + g.W * 0.25} ${top + 30 * g.s} q${60 * g.s} ${20 * g.s} ${90 * g.s} ${70 * g.s} M${g.x + g.W * 0.55} ${top + 24 * g.s} q${-40 * g.s} ${40 * g.s} ${-20 * g.s} ${80 * g.s} q${80 * g.s} ${-10 * g.s} ${160 * g.s} ${10 * g.s}`} fill="none" stroke="#6b5236" strokeWidth={2.4 * g.s} />
                  <Flag x={g.x + g.W * 0.3} y={top + 40 * g.s} s={g.s * 0.8} h={110} stripes={RU_FLAG} w={56} />
                  <Flag x={g.x + g.W * 0.62} y={top + 40 * g.s} s={g.s * 0.8} h={110} stripes={US_FLAG} canton w={56} />
                </g>
                {/* candle */}
                <g transform={`translate(${pan * 1.2},0)`}>
                  <rect x={g.x + g.W * 0.84} y={top - 30 * g.s} width={14 * g.s} height={50 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  <ellipse cx={g.x + g.W * 0.84 + 7 * g.s} cy={top - 40 * g.s} rx={5 * g.s * flick} ry={11 * g.s * flick} fill="#ffcf5a" />
                  <Glow x={g.x + g.W * 0.84 + 7 * g.s} y={top - 40 * g.s} s={g.s * 0.7 * flick} color="#ffb35a" core="#fff1c8" />
                </g>
                {/* a page stirring in the foreground (fastest layer) */}
                <g transform={`translate(${pan * 1.6},0)`}>
                  <path d={`M${g.x + g.W * 0.02} ${g.y + g.H} l${70 * g.s} ${-40 * g.s - Math.sin(frame * 0.12) * 6 * g.s} l${90 * g.s} ${16 * g.s} l${-40 * g.s} ${30 * g.s} Z`} fill="#f2e8cf" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                </g>
                <Ridge g={g} base={g.y + g.H + 30 * g.s} amp={4 * g.s} seed={1} color="#2a1c12" />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

export const ch0: Chapter = {
  name: "",
  from,
  to,
  cams: (w, h) => [
    { frame: 0, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.close, cam: view(V.alaska, w, h, 1.05, 0.1) },
    { frame: T.close + 40, cam: view(V.border, w, h, 1.0, 0.1) },
    { frame: T.missile, cam: view(V.border, w, h, 1.0, 0.1) },
    { frame: T.missile + 40, cam: view(V.reach, w, h, 1.0, 0.1) },
    { frame: T.real, cam: view(V.reach, w, h, 1.0, 0.1) },
    { frame: T.real + 36, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.size, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.size + 30, cam: view(V.alaska, w, h, 0.95, -0.08) },
    { frame: T.q + 10, cam: view(V.alaska, w, h, 0.95, -0.08) },
    { frame: T.q + 60, cam: view(V.bering, w, h, 1.0, 0.1) },
  ],
  years: [[0, "2026"], [T.real, "1867"], [T.q, "1867"]],
  heads: [
    { f: T.close, tag: "What if · 2026", head: "Russian troops on the Canadian border", color: WHATIF },
    { f: T.missile, tag: "What if", head: "Soviet missiles in North America", color: WHATIF },
    { f: T.real, tag: "Real world · March 30, 1867", head: "Russia sells Alaska to the US", color: REAL, stat: (f) => (f >= T.price ? `$${interpolate(f, [T.price, T.price + 24], [0, 7.2], clamp).toFixed(1)} million` : ""), label: "for all of it" },
    { f: T.size, tag: "Alaska · 663,000 sq mi", head: "Bigger than TX + CA + MT", color: GOLD, stat: (f) => (f >= T.states[2] ? "579,000" : ""), label: "sq mi for all three" },
    { f: T.q, tag: "Today's question", head: "Why sell? And what if they hadn't?", color: WHATIF },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const blue = interpolate(frame, [T.sell, T.sell + 18], [0, 1], clamp);
    return (
      <g>
        <AreaTint f={russia} color={RUSSIA} k={interpolate(frame, [T.real, T.real + 20], [0.6, 0.25], clamp)} line={1.2} />
        <AreaTint f={alaska} color={RUSSIA} k={1 - blue} />
        <AreaTint f={alaska} color={REAL} k={blue} />
        <BorderGlow />
        {frame < T.real && <Ring at={P.silo as [number, number]} radius={22.5} start={T.missile + 6} color={WHATIF} end={T.real - 12} />}
        {frame >= T.size && <States />}
        <Pin at={P.silo as [number, number]} text="Missile base" k={interpolate(frame, [T.missile + 6, T.missile + 16, T.real - 8, T.real], [0, 1, 1, 0], clamp)} color={WHATIF} size={0.8} />
        <Pin at={P.seattle as [number, number]} text="Seattle" k={interpolate(frame, [T.missile + 26, T.missile + 36, T.real - 8, T.real], [0, 1, 1, 0], clamp)} color="#ffffff" size={0.75} />
        <Pin at={P.sitka as [number, number]} text="Sitka" k={interpolate(frame, [T.sell + 4, T.sell + 14, T.size - 6, T.size + 4], [0, 1, 1, 0], clamp)} color={REAL} size={0.8} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <OutpostPanel start={-12} end={T.stand + 14} />
      <BorderPanel start={T.stand} end={T.missile + 14} />
      <SiloPanel start={T.missile} end={T.real + 14} />
      <SitkaPanel start={T.real} end={T.size + 14} down={T.real + 20} up={T.sell} salute={SALUTE} />
      <TablePanel start={T.q} end={to + 14} />
    </g>
  ),
  Screen: () => (
    <>
      <HookTitle />
      <QuestionMark />
    </>
  ),
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    [T.close - 6, SFX.whoosh, 0.3],
    [T.missile - 4, SFX.whoosh, 0.3],
    [T.missile + 6, SFX.pop, 0.3],
    [T.real - 60, SFX.riser, 0.25],
    [T.real, SFX.hit, 0.55],
    [T.real - 2, SFX.whoosh, 0.35],
    [T.sell, SFX.pop, 0.3],
    [T.price, SFX.tick, 0.3],
    ...T.states.map((f) => [f, SFX.pop, 0.32] as [number, string, number]),
    [T.why - 4, SFX.hit, 0.4],
    [T.q + 8, SFX.whoosh, 0.3],
  ],
  Sound: () => (
    <>
      <Bed id="wind" from={0} to={T.real + 12} volume={0.32} voice={VOICE} />
      <Bed id="army_marching" from={T.stand} to={T.missile + 14} volume={0.1} voice={VOICE} />
      <Bed id="server_hum" from={T.missile} to={T.real + 8} volume={0.22} voice={VOICE} />
      <Bed id="sea_rough" from={T.real} to={T.size + 24} volume={0.14} voice={VOICE} />
      <Bed id="fire_crackle" from={T.q} to={to + 10} volume={0.12} voice={VOICE} />
      {SALUTE.map((f) => <Hit key={f} id="cannon_far" at={f} volume={0.35} />)}
    </>
  ),
};
