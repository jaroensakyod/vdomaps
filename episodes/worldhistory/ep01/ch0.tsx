import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { ArmyBand } from "../kit/Army";
import { BLACK, clamp, display, GOLD, Panel, Pin, RED, Rivers, TAN, view, type Chapter } from "../kit/news";
import { AUSTRIAN, BAVARIAN, FRENCH, Napoleon, PontoonBridge, POLISH, Snow, Soldier, Treeline, Water } from "../kit/Period";
import { ADVANCE, CITY, FAR_A, FAR_R, NORTH_A, NORTH_R, RETREAT } from "./minard";
import { at, B, wf } from "./time";

// Opening: "400,000 in, 10,000 out" on Minard's band, the Neman in June and December, the question.
export const V = {
  route: bbox([[23, 53.6], [38.5, 56.4]]),
  neman: bbox([[23.4, 54.65], [24.5, 55.15]]),
};

const T = {
  march: 0,
  russia: wf("hook", "Russia.", 0.45),
  back: wf("hook", "Barely", 0.55),
  end: B.hook.end,
  june: B.june.start,
  river: wf("june", "river", 0.75),
  dec: B.dec.start,
  same: wf("dec", "same", 0.5),
  q: B.question.start,
  where: wf("question", "Where", 0.4),
  winter: wf("question", "winter.", 0.85),
  go: B.go.start,
};
const END = B.toulon.start;

const ease = Easing.inOut(Easing.cubic);
const advance = (f: number) => interpolate(f, [T.march + 4, T.russia + 6], [0, 1], { ...clamp, easing: ease });
const retreat = (f: number) => interpolate(f, [T.back - 6, T.end], [0, 1], { ...clamp, easing: ease });

const Bands = () => {
  const frame = useCurrentFrame();
  const a = advance(frame);
  const r = retreat(frame);
  const fade = interpolate(frame, [T.june - 10, T.june + 10, T.q, T.q + 20], [1, 0.25, 0.25, 1], clamp);
  return (
    <g opacity={fade}>
      <ArmyBand pts={FAR_A} k={a} color={TAN} />
      <ArmyBand pts={NORTH_A} k={a} color={TAN} />
      <ArmyBand pts={ADVANCE} k={a} color={TAN} glow />
      <ArmyBand pts={NORTH_R} k={r} color={BLACK} edge="#f2f2f2" />
      <ArmyBand pts={FAR_R} k={r} color={BLACK} edge="#f2f2f2" />
      <ArmyBand pts={RETREAT} k={r} color={BLACK} edge="#f2f2f2" />
    </g>
  );
};

const Labels = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  return (
    <g>
      <Pin at={CITY.kovno} text="Kovno" k={show(T.march + 6, T.june + 200)} />
      <Pin at={CITY.moscow} text="Moscow" k={show(T.russia - 10, T.june)} />
      <Pin at={CITY.moscow} text="Moscow" k={show(T.q, END)} />
    </g>
  );
};

// Screen-wide snow over the map in December.
const MapSnow = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useMap();
  const k = interpolate(frame, [T.dec, T.dec + 20, T.q, T.q + 15], [0, 1, 1, 0], clamp);
  return <Snow x={0} y={0} W={width} H={height} s={s * 1.4} k={k} n={110} />;
};

const UNIFORMS = [FRENCH, POLISH, BAVARIAN, FRENCH, AUSTRIAN, FRENCH];

// June 1812: columns crossing pontoon bridges over the Neman at dawn.
const CrossingScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="crossing" anchor={CITY.kovno} start={start} end={end} sky={["#22365f", "#f0a96a"]} accent={GOLD}>
      {(g) => {
        const water = g.ground - 40 * g.s;
        const deck = water - 18 * g.s;
        const span = g.W + 160 * g.s;
        return (
          <g>
            <circle cx={g.x + g.W * 0.78} cy={g.ground - 150 * g.s} r={40 * g.s} fill="#ffd38a" opacity={0.85} />
            <Treeline x={g.x} W={g.W} ground={water - 30 * g.s} s={g.s} color="#2a3a3a" />
            <rect x={g.x} y={water - 30 * g.s} width={g.W} height={30 * g.s} fill="#3e5a3a" />
            <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#4d7591" />
            <PontoonBridge x0={g.x - 20 * g.s} x1={g.x + g.W + 20 * g.s} deck={deck} water={water + 4 * g.s} s={g.s} />
            {Array.from({ length: 9 }, (_, i) => {
              const sx = g.x - 80 * g.s + ((frame - start) * 1.6 * g.s + i * (span / 9)) % span;
              return <Soldier key={i} x={sx} y={deck - 7 * g.s} scale={g.sc * 0.62} phase={i * 0.9} u={UNIFORMS[i % UNIFORMS.length]} />;
            })}
            <Napoleon x={g.x + g.W * 0.12} y={water - 30 * g.s} scale={g.sc * 0.7} />
          </g>
        );
      }}
    </Panel>
  );
};

// December 1812: a few men in blankets cross back over the frozen river.
const ReturnScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="return" anchor={CITY.kovno} start={start} end={end} sky={["#56616e", "#c3ccd4"]} accent="#9fb6c8">
      {(g) => {
        const ice = g.ground - 40 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={ice - 26 * g.s} s={g.s} color="#38443f" snow={1} />
            <rect x={g.x} y={ice - 26 * g.s} width={g.W} height={26 * g.s} fill="#e9eef1" />
            <Water x={g.x} y={ice} W={g.W} H={g.H} s={g.s} color="#8ea6b6" ice={1} />
            {[0, 1, 2].map((i) => {
              const sx = g.x + g.W * 0.85 - ((frame - start) * 0.9 * g.s + i * 120 * g.s);
              return <Soldier key={i} x={sx} y={ice + 22 * g.s} scale={g.sc * 0.7} phase={i * 1.7} u={FRENCH} pose="trudge" wrap={1} flip />;
            })}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} />
          </g>
        );
      }}
    </Panel>
  );
};

// Big "?" for the question.
const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [T.where - 4, T.where + 8, END - 10, END], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const cross = interpolate(frame, [T.winter - 4, T.winter + 8], [0, 1], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", top: height * 0.58, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60 * s, alignItems: "center", opacity: Math.min(1, k) }}>
      <div style={{ width: 220 * s, height: 220 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: 170 * s, lineHeight: `${220 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${50 * s}px rgba(255,59,48,0.6)` }}>?</div>
      <div style={{ position: "relative", fontSize: 130 * s, opacity: cross }}>
        ❄️
        <div style={{ position: "absolute", left: -10 * s, right: -10 * s, top: "50%", height: 14 * s, background: RED, transform: `rotate(-30deg) scaleX(${cross})`, borderRadius: 8 * s }} />
      </div>
    </div>
  );
};

const stat = (frame: number) => {
  const r = retreat(frame);
  const n = r > 0 ? 422000 + (10000 - 422000) * r : 422000 * Math.min(1, advance(frame) * 3);
  return (Math.round(n / 1000) * 1000).toLocaleString("en-US");
};

export const ch0: Chapter = {
  name: "",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(V.route, w, h, 1, 0.02) },
    { frame: T.june - 6, cam: view(V.route, w, h, 1, 0.02) },
    { frame: T.june + 40, cam: view(V.neman, w, h, 1, 0.1) },
    { frame: T.q - 10, cam: view(V.neman, w, h, 0.9, 0.1) },
    { frame: T.q + 30, cam: view(V.route, w, h, 1, 0.02) },
  ],
  years: [[0, "1812"], [T.june, "June 1812"], [T.dec, "Dec 1812"], [T.q, "1812"]],
  heads: [
    { f: 0, tag: "Russia · 1812", head: "The Grande Armée", stat, label: "men", color: GOLD },
    { f: T.june, tag: "24 June 1812", head: "Crossing the Neman", color: GOLD },
    { f: T.dec, tag: "December 1812", head: "The survivors return", color: "#9fb6c8" },
    { f: T.q, tag: "Today's question", head: "Where did the army go?", color: RED },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <g>
        <Rivers hi={{ Neman: interpolate(frame, [T.river - 6, T.river + 10, T.q, T.q + 15], [0, 1, 1, 0], clamp) }} />
        <Bands />
        <Labels />
        <MapSnow />
      </g>
    );
  },
  Panels: () => (
    <g>
      <CrossingScene start={at("june", 0.05)} end={T.dec + 14} />
      <ReturnScene start={T.dec} end={T.q + 10} />
    </g>
  ),
  Screen: () => <QuestionMark />,
  sfx: [
    [0, SFX.whoosh, 0.45],
    [T.back - 4, SFX.hit, 0.5],
    [T.june + 2, SFX.whoosh, 0.35],
    [T.where - 4, SFX.hit, 0.45],
  ],
};
