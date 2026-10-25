import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { Elephant, IBERIAN, LIBYAN, Mountains, Warrior } from "../kit/Ancient";
import { ArmyBand } from "../kit/Army";
import { clamp, display, GOLD, Panel, Pin, RED, TAN, view, type Chapter } from "../kit/news";
import { Snow } from "../kit/Period";
import { MARCH, PLACE } from "./route";
import { B, wf } from "./time";
import { H } from "./views";

// Opening: "37 war elephants. Over the Alps. In winter." → the whole march → Rome nearly destroyed → the question.
export const V = {
  alps: bbox([[5.2, 44.2], [8.2, 45.6]]),
  west: bbox([[-2.5, 36.2], [17, 46.4]]),
  wide: bbox([[-6, 33.5], [19, 47]]),
};

const T = {
  hook: B.hook.start,
  alpsWord: wf("hook", "Alps.", 0.5),
  winter: wf("hook", "winter.", 0.85),
  march: B.march.start,
  spain: wf("march", "Spain", 0.45),
  italy: wf("march", "Italy,", 0.55),
  mountains: wf("march", "mountains", 0.9),
  nearly: B.nearly.start,
  rome: wf("nearly", "Rome.", 0.8),
  q: B.question.start,
  why: wf("question", "Why", 0.3),
  road: wf("question", "road", 0.65),
  work: wf("question", "work?", 0.9),
  go: B.go.start,
};
const END = B.punic.start;

const ease = Easing.inOut(Easing.cubic);
const drawK = (f: number) => interpolate(f, [T.march + 6, T.mountains + 10], [0, 1], { ...clamp, easing: ease });

// The whole route, drawn once in the opening.
const Route = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [T.march - 4, T.march + 8, END - 20, END], [0, 1, 1, 0], clamp);
  return (
    <g opacity={o}>
      <ArmyBand pts={MARCH} k={drawK(frame)} color={TAN} glow perMan={1 / 1500} />
    </g>
  );
};

// Battle bursts in Italy on "Rome".
const Burst = ({ at, f }: { at: [number, number]; f: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < f) return null;
  const k = interpolate(frame, [f, f + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const o = interpolate(frame, [END - 15, END], [1, 0], clamp);
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r = (i % 2 ? 14 : 30) * s * k;
    return `${p[0] + Math.cos(a) * r},${p[1] + Math.sin(a) * r}`;
  });
  return <path d={`M${pts.join(" L")} Z`} fill="#ffcf4a" stroke={RED} strokeWidth={3 * s} opacity={o} />;
};

// Snowy ridge with the column: elephants among Libyan and Iberian infantry.
const RidgeScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="ridge" anchor={PLACE.traversette} start={start} end={end} sky={["#7f9bb8", "#e3ebf1"]} accent="#9fb6c8">
      {(g) => {
        const span = g.W + 300 * g.s;
        const order = ["e", "w", "w", "e", "w", "w"];
        return (
          <g>
            <Mountains x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#eef3f7" />
            {order.map((t, i) => {
              const px = g.x - 150 * g.s + ((frame - start) * 1.1 * g.s + i * (span / order.length)) % span;
              return t === "e" ? (
                <Elephant key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.55} phase={i} snow={0.8} />
              ) : (
                <Warrior key={i} x={px} y={g.ground + 4 * g.s} scale={g.sc * 0.62} phase={i * 1.3} kit={i % 3 ? LIBYAN : IBERIAN} pose="trudge" cloak={1} />
              );
            })}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={70} />
          </g>
        );
      }}
    </Panel>
  );
};

// Two roads to Rome on the question: the sea (crossed out) and the long land route (glowing).
const Roads = () => {
  const frame = useCurrentFrame();
  const cross = interpolate(frame, [T.road - 4, T.road + 8], [0, 1], clamp);
  const { projection, s } = useMap();
  const mid = projection([9.5, 39.6]);
  return (
    <g>
      <Arrow points={[PLACE.newcarthage, [3, 38.5], [9.5, 39.6], [12.2, 41.6]]} start={T.why} end={T.why + 20} color="#7fb4ff" width={16} variant="dashed" />
      {mid && cross > 0 && (
        <g transform={`translate(${mid[0]},${mid[1]})`} opacity={cross}>
          <line x1={-34 * s} y1={-34 * s} x2={34 * s} y2={34 * s} stroke={RED} strokeWidth={12 * s} strokeLinecap="round" />
          <line x1={34 * s} y1={-34 * s} x2={-34 * s} y2={34 * s} stroke={RED} strokeWidth={12 * s} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = interpolate(frame, [T.why - 4, T.why + 8, END - 10, END], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2)) });
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", top: height * 0.58, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: Math.min(1, k) }}>
      <div style={{ width: 220 * s, height: 220 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: display, fontWeight: 700, fontSize: 170 * s, lineHeight: `${220 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${50 * s}px rgba(255,59,48,0.6)` }}>?</div>
    </div>
  );
};

export const ch0: Chapter = {
  name: "",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(V.alps, w, h, 1.05, 0.06) },
    { frame: T.march - 4, cam: view(V.alps, w, h, 1, 0.06) },
    { frame: T.spain + 10, cam: view(V.west, w, h, 1, 0.13) },
    { frame: T.q, cam: view(V.west, w, h, 1, 0.13) },
    { frame: END - 1, cam: H(1, w, h) },
  ],
  years: [[0, "218 BC"], [T.go, "264 BC"]],
  heads: [
    { f: 0, tag: "218 BC", head: "Over the Alps?", stat: "37", label: "war elephants", color: GOLD },
    { f: T.march, tag: "218 BC", head: "Spain → Italy", color: GOLD, chips: [{ text: "Over the Alps", f: T.mountains }] },
    { f: T.nearly, tag: "Rome", head: "Almost destroyed", color: RED },
    { f: T.q, tag: "Today's question", head: "Why the hardest road?", color: RED, chips: [{ text: "Did it work?", f: T.work }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
    return (
      <g>
        <Route />
        <Pin at={PLACE.newcarthage} text="Spain" k={show(T.spain - 4, END)} color={GOLD} />
        <Pin at={PLACE.turin} text="Italy" k={show(T.italy, END)} color={GOLD} />
        <Pin at={PLACE.rome} text="Rome" k={show(T.nearly, END)} />
        <Burst at={PLACE.trebia} f={T.rome - 12} />
        <Burst at={PLACE.trasimene} f={T.rome - 4} />
        <Burst at={PLACE.cannae} f={T.rome + 4} />
        <Roads />
      </g>
    );
  },
  Panels: () => <RidgeScene start={2} end={T.spain + 14} />,
  Screen: () => <QuestionMark />,
  sfx: [
    [0, SFX.whoosh, 0.4],
    [T.alpsWord, SFX.pop, 0.35],
    [T.march + 4, SFX.whoosh, 0.4],
    [T.rome - 12, SFX.hit, 0.45],
    [T.why - 4, SFX.hit, 0.45],
  ],
};
