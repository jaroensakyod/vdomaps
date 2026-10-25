import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { bbox } from "../../components/Region";
import { Fighter, Ridge } from "../../components/Scene";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { CARTHAGE, Elephant, Raft, Water } from "./kit/Art";
import { BoldArrow, BWMap, clamp, Film, Kicker, Place, Quiz, Rivers, serif, Shot, Super, TitleCard, view } from "./kit/Newsreel";

// M09 cinema newsreel: Hannibal's march from Spain over the Alps (218 BC) as a 1940s newsreel in English. A deco
// title card opens; the b/w animated map shows a bold white arrow leaving Spain with a superimposed "37 war
// elephants"; a title card cuts to a full-frame re-enactment of the Rhône crossing; another card cuts to the Alps,
// where the arrow climbs the pass and the men-left count drops; a "quiz of the week" card closes. Film grain,
// scratches, flicker and gate weave on every frame. 15 s, 9:16.
export const demo: StyleDemo = { id: "M09", name: "ข่าวภาพยนตร์ยุค 40", frames: 450, cover: 200, sizes: ["9x16"] };

type LL = [number, number];
const C = { nova: [-0.98, 37.6] as LL, ebro: [0.6, 40.8] as LL, pyr: [2.8, 42.4] as LL, rhone: [4.7, 43.95] as LL, isere: [5.7, 45.15] as LL, col: [6.9, 45.25] as LL, turin: [7.68, 45.07] as LL };
const ROUTE: LL[] = [C.nova, C.ebro, C.pyr, C.rhone, C.isere, C.col, C.turin];
const V = { spain: bbox([[-6, 36.5], [6, 45]]), wide: bbox([[-4, 37], [12, 47]]), alps: bbox([[3.6, 43.2], [9.2, 46.6]]) };
const T = { open: 0, map1: 44, card2: 150, rhone: 174, card3: 236, alps: 258, quiz: 336, reveal: 404, end: 450 };
const MARCH: [number, number][] = [[T.map1 + 10, 0], [T.card2, 0.55], [T.alps, 0.62], [T.alps + 60, 1]];

const LINES = [
  { text: "In 218 BC, Hannibal marched out of Spain with thirty-seven war elephants.", start: T.map1, len: 104 },
  { text: "He floated them across the Rhône on rafts,", start: T.rhone, len: 62 },
  { text: "then climbed the Alps in the first snow, losing almost half his men.", start: T.alps, len: 78 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: T.map1, cam: view(V.spain, width, height, 1, 0.06) },
      { frame: T.card2, cam: view(V.wide, width, height, 1.02, 0.06) },
      { frame: T.alps, cam: view(V.wide, width, height, 1.15, 0.04) },
      { frame: T.alps + 50, cam: view(V.alps, width, height, 1, 0.04) },
      { frame: T.quiz, cam: view(V.alps, width, height, 1.06, 0.04), easing: (t) => t },
    ],
    frame,
  );
  const k = interpolate(frame, MARCH.map((m) => m[0]), MARCH.map((m) => m[1]), clamp);
  const fade = (a: number, b: number) => interpolate(frame, [a, a + 8, b - 8, b], [0, 1, 1, 0], clamp);
  const onMap = (frame >= T.map1 && frame < T.card2) || (frame >= T.alps && frame < T.quiz);
  const men = Math.round(interpolate(frame, [T.alps + 20, T.quiz - 10], [46000, 26000], clamp)).toLocaleString("en-US");
  const elephants = Math.round(interpolate(frame, [T.map1 + 16, T.map1 + 56], [0, 37], clamp));
  return (
    <AbsoluteFill style={{ background: "#0e0e0e" }}>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      {[T.map1, T.card2, T.rhone, T.card3, T.alps, T.quiz].map((f) => <Sfx key={f} src={SFX.hit} at={f} volume={0.18} />)}
      <Bed id="army_marching" from={T.map1} to={T.card2 + 10} volume={0.12} />
      <Hit id="elephant" at={T.rhone + 20} volume={0.25} />
      <Bed id="wind_storm" from={T.alps} to={T.quiz} volume={0.12} />
      <Sfx src={SFX.tick} at={T.reveal - 60} volume={0.22} />
      <Sfx src={SFX.tick} at={T.reveal - 30} volume={0.22} />
      <Sfx src={SFX.hit} at={T.reveal} volume={0.35} />
      <Film>
        {onMap && (
          <MapFrame cam={cam}>
            <BWMap />
            <Rivers hi={{ Rhône: fade(T.card2 - 40, T.card2 + 1), Po: fade(T.alps + 40, T.quiz + 1), Ebro: fade(T.map1 + 20, T.card2 - 30) }} />
            <BoldArrow pts={ROUTE} k={k} />
            <Place at={C.nova} text="Carthago Nova" k={fade(T.map1, T.card2 + 1)} dy={-36} />
            <Place at={C.rhone} text="Rhône" k={fade(T.card2 - 40, T.card2 + 1)} size={0.9} />
            <Place at={C.col} text="Alpine pass" k={fade(T.alps + 30, T.quiz + 1)} size={0.85} dy={-40} />
            <Place at={C.turin} text="Taurini" k={fade(T.alps + 50, T.quiz + 1)} size={0.85} dy={64} />
          </MapFrame>
        )}
        <Shot from={T.rhone} to={T.card3} sky={["#9a9a96", "#e4e2dc"]}>
          {(g) => {
            const drift = interpolate(g.frame, [T.rhone, T.card3], [0, 140], clamp) * g.s;
            return (
              <>
                {[[0.22, 0.42, 0.7], [0.75, 0.36, 0.55], [0.5, 0.5, 0.45]].map(([cx, cy, k2], i) => (
                  <g key={i} transform={`translate(${g.W * cx + drift * (0.3 + i * 0.1)},${height * cy}) scale(${k2})`} fill="#d9d6cd" opacity={0.9}>
                    <ellipse rx={150 * g.s} ry={44 * g.s} />
                    <ellipse cx={-70 * g.s} cy={-28 * g.s} rx={80 * g.s} ry={50 * g.s} />
                    <ellipse cx={50 * g.s} cy={-40 * g.s} rx={90 * g.s} ry={60 * g.s} />
                  </g>
                ))}
                <Ridge g={g} base={g.ground - 180 * g.s} amp={90 * g.s} seed={3} color="#a3a29b" />
                <Ridge g={g} base={g.ground - 150 * g.s} amp={50 * g.s} seed={8} color="#6d6c66" />
                <Water x={g.x} y={g.ground - 120 * g.s} W={g.W} H={height} s={g.s} color="#5a5a58" />
                <g transform={`translate(${drift},${Math.sin(g.frame * 0.12) * 4 * g.s})`}>
                  <Raft x={g.x + 120 * g.s} y={g.ground - 30 * g.s} w={460 * g.s} s={g.s} />
                  <Elephant x={g.x + 380 * g.s} y={g.ground - 40 * g.s} scale={g.sc * 0.75} walk={0} />
                  <Elephant x={g.x + 520 * g.s} y={g.ground - 36 * g.s} scale={g.sc * 0.62} walk={0} phase={1.3} />
                  <Fighter x={g.x + 200 * g.s} y={g.ground - 40 * g.s} scale={g.sc * 0.7} costume={CARTHAGE} mode="stand" weapon="spear" />
                </g>
                <rect x={g.x} y={g.ground + 60 * g.s} width={g.W} height={height} fill="#4b4a46" />
              </>
            );
          }}
        </Shot>
        <Super from={T.map1 + 12} to={T.card2} value={String(elephants)} label="war elephants" />
        <Super from={T.alps + 16} to={T.quiz} value={men} label="men left (approx.)" />
        <Super from={T.rhone + 6} to={T.card3} value="RHÔNE" label="autumn · 218 B.C." />
        <TitleCard from={T.open} to={T.map1} over="The March of" title="HANNIBAL" sub="218 B.C." />
        <TitleCard from={T.card2} to={T.rhone} over="Autumn" title="ACROSS THE RHÔNE" />
        <TitleCard from={T.card3} to={T.alps} over="Snow, cliffs, ambush" title="THE ALPS" />
        <Quiz from={T.quiz} to={T.end} reveal={T.reveal} question="How many elephants left Spain?" options={["12", "37", "100"]} answer={1} />
        {LINES.map((l) => <Caption key={l.start} text={l.text} start={l.start} len={l.len} font={serif} color="#f2efe6" stroke="#000000" top={0.78} />)}
        <Kicker text="M09 · ข่าวภาพยนตร์ยุค 40" />
      </Film>
    </AbsoluteFill>
  );
};

