import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { bbox } from "../../components/Region";
import { Depth, Fighter, Glow, Ridge } from "../../components/Scene";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { style } from "../../components/style";
import type { StyleDemo } from "../types";
import { CARTHAGE, Elephant, IBERIAN, Raft, Snow, Water } from "./kit/Art";
import { CAPTION_TOP, clamp, font, GOLD, HeadCard, MarchLine, Panel, Pin, QuizNews, Rivers, TopBar, view, type Head } from "./kit/news";

// M09 English news look: Hannibal's march from Spain over the Alps (218 BC) as an English history short.
// Satellite Europe + glowing rivers, a gold march line drawn live, pulsing pins, one head card whose Oswald
// headline swaps per shot (with counters), "Illustration" panels low on screen, and a 3-2-1 quiz to finish. 15 s.
export const demo: StyleDemo = { id: "M09", name: "สารคดีภาษาอังกฤษ", frames: 450, cover: 268, sizes: ["9x16"] };

type LL = [number, number];
const C = { nova: [-0.98, 37.6] as LL, ebro: [0.6, 40.8] as LL, pyr: [2.8, 42.4] as LL, rhone: [4.7, 43.95] as LL, isere: [5.7, 45.15] as LL, col: [6.9, 45.25] as LL, turin: [7.68, 45.07] as LL };
const ROUTE: LL[] = [C.nova, C.ebro, C.pyr, C.rhone, C.isere, C.col, C.turin];
const V = { spain: bbox([[-6, 36.5], [4, 43.5]]), wide: bbox([[-4, 37], [12, 47]]), alps: bbox([[3.6, 43.2], [9.2, 46.6]]) };
const T = { leave: 40, rhone: 150, alps: 230, turin: 300, quiz: 330, reveal: 398 };
// head of the march: share of the route reached (by screen length)
const MARCH: [number, number][] = [[T.leave, 0], [T.rhone, 0.62], [T.alps, 0.75], [T.turin, 1]];

const HEADS: Head[] = [
  { f: 8, tag: "Second Punic War", head: "Hannibal leaves Spain", stat: (f) => String(Math.round(interpolate(f, [T.leave, T.leave + 40], [0, 37], clamp))), label: "war elephants" },
  { f: T.rhone, tag: "Autumn, 218 BC", head: "Crossing the Rhône", chips: [{ text: "Elephants on rafts", f: T.rhone + 24 }] },
  { f: T.alps, tag: "The Alps", head: "Snow, cliffs, ambush", stat: (f) => Math.round(interpolate(f, [T.alps + 10, T.turin], [46000, 26000], clamp)).toLocaleString("en-US"), label: "men left (approx.)", color: GOLD },
  { f: T.quiz, tag: "Quiz", head: "" },
];
const LINES = [
  { text: "In 218 BC, Hannibal marched out of Spain with thirty-seven war elephants.", start: 8, len: 136 },
  { text: "He floated them across the Rhône on rafts,", start: 148, len: 80 },
  { text: "then climbed the Alps in the first snow, losing almost half his men.", start: 232, len: 96 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const cam = camAt(
    [
      { frame: 0, cam: view(V.spain, width, height, 1, 0.16) },
      { frame: T.leave + 20, cam: view(V.spain, width, height, 1.05, 0.16) },
      { frame: T.rhone - 10, cam: view(V.wide, width, height, 1, 0.16) },
      { frame: T.alps - 10, cam: view(V.wide, width, height, 1.04, 0.16) },
      { frame: T.alps + 30, cam: view(V.alps, width, height, 1, 0.16) },
      { frame: demo.frames, cam: view(V.alps, width, height, 1.06, 0.16), easing: (t) => t },
    ],
    frame,
  );
  const k = interpolate(frame, MARCH.map((m) => m[0]), MARCH.map((m) => m[1]), clamp);
  const fade = (a: number, b: number) => interpolate(frame, [a, a + 10, b - 10, b], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Sfx src={SFX.swell} at={4} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.rhone - 16} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.alps - 16} volume={0.3} />
      {[T.leave, T.rhone, T.alps, T.turin].map((f) => <Sfx key={f} src={SFX.pop} at={f + 6} volume={0.3} />)}
      <Bed id="army_marching" from={T.leave} to={T.rhone + 10} volume={0.14} />
      <Bed id="wind_storm" from={T.alps} to={T.quiz} volume={0.14} />
      <Hit id="elephant" at={T.rhone + 30} volume={0.3} />
      <Sfx src={SFX.tick} at={T.reveal - 60} volume={0.25} />
      <Sfx src={SFX.tick} at={T.reveal - 30} volume={0.25} />
      <Sfx src={SFX.hit} at={T.reveal} volume={0.4} />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "europe" }]} />
        <Rivers hi={{ Rhône: fade(T.rhone, T.alps + 10), Po: fade(T.turin - 10, demo.frames + 20), Ebro: fade(T.leave + 20, T.rhone) }} />
        <MarchLine pts={ROUTE} k={k} />
        <Pin at={C.nova} text="Carthago Nova" k={fade(10, T.rhone)} dy={-32} />
        <Pin at={C.rhone} text="Rhône" k={fade(T.rhone, T.alps + 20)} size={0.9} dy={-32} />
        <Pin at={C.col} text="Alpine pass" k={fade(T.alps + 20, demo.frames + 20)} size={0.85} dy={-34} color={GOLD} />
        <Pin at={C.turin} text="Taurini" k={fade(T.turin, demo.frames + 20)} size={0.85} dy={58} />
        <Panel id="leave" anchor={C.nova} start={T.leave} end={T.rhone + 14} sky={["#e9b872", "#f6e3c0"]}>
          {(g) => (
            <Depth g={g} id="leave" start={T.leave} end={T.rhone + 14}>
              {(pan) => (
                <>
                  <Glow x={g.x + g.W * 0.8} y={g.y + 90 * g.s} s={g.s} />
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={40 * g.s} seed={2} color="#b98a5a" shift={pan * 0.2} />
                  <Ridge g={g} base={g.ground - 10 * g.s} amp={22 * g.s} seed={5} color="#9a7346" shift={pan * 0.5} />
                  <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={g.H} fill="#c9a06a" />
                  <Elephant x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground + 10 * g.s} scale={g.sc * 0.62} />
                  <Elephant x={g.x + g.W * 0.32 + pan * 0.7} y={g.ground + 6 * g.s} scale={g.sc * 0.55} phase={1.7} />
                  {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + 80 * g.s + i * 70 * g.s + pan * 1.6} y={g.ground + 40 * g.s} scale={g.sc * 0.6} costume={i % 2 ? IBERIAN : CARTHAGE} phase={i * 1.3} />)}
                </>
              )}
            </Depth>
          )}
        </Panel>
        <Panel id="rhone" anchor={C.rhone} start={T.rhone} end={T.alps + 14} sky={["#7fa9c9", "#dfe9ee"]}>
          {(g) => (
            <Depth g={g} id="rhone" start={T.rhone} end={T.alps + 14}>
              {(pan) => {
                const drift = interpolate(g.frame, [T.rhone, T.alps + 14], [0, 120], clamp) * g.s;
                return (
                  <>
                    <Ridge g={g} base={g.ground - 120 * g.s} amp={30 * g.s} seed={8} color="#6f8a5a" shift={pan * 0.2} />
                    <Water x={g.x} y={g.ground - 110 * g.s} W={g.W} H={g.H} s={g.s} />
                    <g transform={`translate(${drift},${Math.sin(g.frame * 0.12) * 3 * g.s})`}>
                      <Raft x={g.x + 180 * g.s} y={g.ground - 30 * g.s} w={360 * g.s} s={g.s} />
                      <Elephant x={g.x + 360 * g.s} y={g.ground - 40 * g.s} scale={g.sc * 0.55} walk={0} />
                      <Fighter x={g.x + 220 * g.s} y={g.ground - 40 * g.s} scale={g.sc * 0.55} costume={CARTHAGE} mode="stand" weapon="spear" />
                    </g>
                    <rect x={g.x} y={g.ground + 20 * g.s} width={g.W} height={g.H} fill="#5b7a4a" />
                  </>
                );
              }}
            </Depth>
          )}
        </Panel>
        <Panel id="alps" anchor={C.col} start={T.alps} end={T.quiz + 14} sky={["#8ea4b8", "#e6edf2"]} accent={GOLD}>
          {(g) => (
            <Depth g={g} id="alps" start={T.alps} end={T.quiz + 14} warm={0}>
              {(pan) => (
                <>
                  <Ridge g={g} base={g.ground - 110 * g.s} amp={90 * g.s} seed={3} color="#e9eff4" shift={pan * 0.2} />
                  <Ridge g={g} base={g.ground - 40 * g.s} amp={55 * g.s} seed={7} color="#9aa7b2" shift={pan * 0.5} />
                  <rect x={g.x} y={g.ground - 4 * g.s} width={g.W} height={g.H} fill="#f2f5f7" />
                  {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + 120 * g.s + i * 80 * g.s + pan * 1.6} y={g.ground + 40 * g.s} scale={g.sc * 0.6} costume={CARTHAGE} phase={i * 1.1} />)}
                  <Elephant x={g.x + g.W * 0.66 + pan * 0.7} y={g.ground + 12 * g.s} scale={g.sc * 0.6} phase={0.6} />
                  <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={90} />
                </>
              )}
            </Depth>
          )}
        </Panel>
      </MapFrame>
      <TopBar chapter="Hannibal's March" year="218 BC" />
      <HeadCard heads={HEADS} from={8} to={demo.frames} />
      <QuizNews title="QUIZ · 3 seconds" question="How many elephants left Spain?" options={["12", "37", "100"]} answer={1} start={T.quiz} reveal={T.reveal} end={demo.frames} />
      {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={font} top={CAPTION_TOP} />)}
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, textAlign: "center", fontFamily: style.font, fontSize: 30 * s, fontWeight: 700, color: "#fff", opacity: 0.8 }}>M09 · สารคดีภาษาอังกฤษ</div>
    </AbsoluteFill>
  );
};
