import { interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, GOLD, Pin, QuizNews, view } from "../../worldhistory/kit/news";
import { alaska, REAL, RUSSIA } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Route, show } from "./mapkit";
import { bbox } from "../../../components/Region";
import { P, PIPELINE, V } from "./places";
import { SitkaPanel } from "./scenes0";
import { DoorPanel, NewsPanel, OfficePanel, PassPanel, PipelinePanel, RigPanel, ScalePanel, SigningPanel, WashingtonPanel } from "./scenes34";
import { B, span, VOICE, wf } from "./time";

// Chapter 3 "The midnight deal" (beats seward → oil): Seward, the night visit, the signing, the price, the
// "Icebox" myth, the Senate quiz, the flag at Sitka, the Klondike and Prudhoe Bay.
const [from, to] = span("ch3");
const pt = (k: keyof typeof P) => P[k] as [number, number];

const T = {
  seward: B.seward.start,
  night: B.night.start,
  he: wf("night", "He", 0.7),
  sign: B.sign.start,
  signed: wf("sign", "signed.", 0.9),
  price: B.price.start,
  cents: wf("price", "cents", 0.7),
  folly: B.folly.start,
  most: wf("folly", "most", 0.55),
  quiz: B.quiz1.start,
  ans: B.quizans1.start,
  flag: B.flag.start,
  sitka: wf("flag", "Sitka,", 0.35),
  russian: wf("flag", "Russian", 0.5),
  american: wf("flag", "American", 0.8),
  gold: B.gold.start,
  found: wf("gold", "found", 0.2),
  oil: B.oil.start,
  strike: wf("oil", "oil", 0.15),
  prudhoe: wf("oil", "Prudhoe", 0.25),
  biggest: wf("oil", "biggest", 0.4),
};
const SALUTE = [T.american + 30, T.american + 46];
const SITKA = bbox([[-142, 54.5], [-128, 61.5]]);

export const ch3: Chapter = {
  name: "The midnight deal",
  from,
  to,
  cams: (w, h) => [
    { frame: T.seward, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.seward + 40, cam: view(V.usa, w, h, 1.0, 0.1) },
    { frame: T.night, cam: view(V.usa, w, h, 1.3, 0.1) },
    { frame: T.price - 10, cam: view(V.usa, w, h, 1.3, 0.1) },
    { frame: T.price + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.folly, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.folly + 36, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.quiz, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.quiz + 36, cam: view(V.usa, w, h, 1.1, 0.0) },
    { frame: T.flag, cam: view(V.usa, w, h, 1.1, 0.0) },
    { frame: T.flag + 36, cam: view(SITKA, w, h, 1.0, 0.1) },
    { frame: T.gold, cam: view(SITKA, w, h, 1.0, 0.1) },
    { frame: T.gold + 40, cam: view(V.klondike, w, h, 1.0, 0.1) },
    { frame: T.oil - 6, cam: view(V.klondike, w, h, 1.0, 0.1) },
    { frame: T.oil + 30, cam: view(V.north, w, h, 1.0, 0.1) },
    { frame: T.biggest, cam: view(V.north, w, h, 1.0, 0.1) },
    { frame: T.biggest + 40, cam: view(V.alaska, w, h, 1.0, 0.1) },
  ],
  years: [[T.seward, "1865"], [T.night, "March 1867"], [T.flag, "Oct 1867"], [T.gold, "1896"], [T.oil, "1968"]],
  heads: [
    { f: T.seward, tag: "William Seward", head: "Secretary of State", color: REAL, portrait: "whatif/seward" },
    { f: T.night, tag: "A late-night visit", head: "Russia's minister calls", color: REAL, portrait: "whatif/stoeckl" },
    { f: T.he, tag: "The same night", head: "The office opens at night", color: REAL },
    { f: T.sign, tag: "March 30, 1867", head: "Signed before dawn", color: REAL },
    { f: T.price, tag: "The price", head: "About 2¢ an acre", color: GOLD, stat: (f) => `$${interpolate(f, [T.price + 10, T.price + 34], [0, 7.2], clamp).toFixed(1)} million` },
    { f: T.folly, tag: "\"Seward's Folly\"?", head: "Most papers approved", color: REAL },
    { f: T.quiz, tag: "Quiz", head: "How many voted no?", color: GOLD },
    { f: T.ans, tag: "Answer · April 9, 1867", head: "The Senate says yes", color: GOLD, stat: "37 : 2", label: "for : against" },
    { f: T.flag, tag: "October 18, 1867", head: "New flag over Sitka", color: REAL },
    { f: T.gold, tag: "30 years later", head: "The Klondike Gold Rush", color: GOLD },
    { f: T.oil, tag: "1968", head: "Oil at Prudhoe Bay", color: GOLD, chips: [{ text: "Biggest oil field in North America", f: T.biggest }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const blue = interpolate(frame, [T.american, T.american + 18], [0, 1], clamp);
    const acre = show(frame, T.cents - 4, T.folly + 10);
    const on = show(frame, from - 10, to + 20);
    return (
      <g>
        <AreaTint f={alaska} color={RUSSIA} k={(1 - blue) * on} />
        <AreaTint f={alaska} color={REAL} k={blue * on} />
        <AreaTint f={alaska} color={GOLD} k={acre * 0.8} fill={0.25} />
        <MapText at={[-152, 64.5]} text="≈ 2¢ PER ACRE" k={acre} size={1.2} color="#ffe08a" />
        <Pin at={pt("washington")} text="Washington" k={show(frame, T.seward + 30, T.price + 20)} color={REAL} size={0.8} />
        <Pin at={pt("washington")} text="US Senate" k={show(frame, T.quiz + 30, T.flag + 10)} color={GOLD} size={0.8} />
        <Pin at={pt("sitka")} text="Sitka" k={show(frame, T.sitka - 4, T.gold + 20)} color={REAL} size={0.8} />
        <Route pts={[pt("seattle"), pt("skagway"), pt("dawson")]} start={T.found} len={70} end={T.oil + 10} color={GOLD} width={6} />
        <Pin at={pt("skagway")} text="Skagway" k={show(frame, T.found + 30, T.oil + 10)} color={GOLD} size={0.7} dy={30} />
        <Pin at={pt("dawson")} text="Klondike" k={show(frame, T.found + 60, T.oil + 10)} color={GOLD} size={0.8} />
        <Pin at={pt("prudhoe")} text="Prudhoe Bay" k={show(frame, T.prudhoe - 4, to + 10)} color={GOLD} size={0.8} />
        <Route pts={PIPELINE} start={T.biggest} len={60} end={to} color="#e8eef4" width={5} />
        <Pin at={pt("valdez")} text="Valdez" k={show(frame, T.biggest + 54, to + 10)} color="#e8eef4" size={0.7} />
        <MapText at={[-151.6, 66.8]} text="PIPELINE (APPROX.)" k={show(frame, T.biggest + 30, to) * 0.9} size={0.6} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <WashingtonPanel start={T.seward} end={T.night + 14} />
      <DoorPanel start={T.night} end={T.he + 14} />
      <OfficePanel start={T.he} end={T.sign + 14} />
      <SigningPanel start={T.sign} end={T.price + 14} signAt={T.signed} />
      <ScalePanel start={T.price} end={T.folly + 14} />
      <NewsPanel start={T.folly} end={T.quiz + 14} flip={T.most} />
      <SitkaPanel start={T.flag} end={T.gold + 14} down={T.russian} up={T.american} salute={SALUTE} />
      <PassPanel start={T.gold} end={T.oil + 14} />
      <RigPanel start={T.oil} end={T.biggest + 14} strike={T.strike} />
      <PipelinePanel start={T.biggest} end={to + 14} />
    </g>
  ),
  Screen: () => <QuizNews title="QUICK QUIZ" question="How many senators voted no?" options={["2", "12", "20"]} answer={0} start={T.quiz} reveal={T.ans} end={T.flag} />,
  sfx: [
    [T.seward - 6, SFX.whoosh, 0.3],
    [T.night - 4, SFX.whoosh, 0.25],
    [T.signed, SFX.pop, 0.3],
    [T.price + 10, SFX.tick, 0.3],
    [T.cents, SFX.pop, 0.3],
    [T.most, SFX.whoosh, 0.25],
    [T.quiz, SFX.swell, 0.3],
    [T.ans, SFX.hit, 0.45],
    [T.flag - 6, SFX.whoosh, 0.3],
    [T.found, SFX.pop, 0.3],
    [T.oil + 6, SFX.whoosh, 0.3],
    [T.biggest, SFX.pop, 0.3],
  ],
  Sound: () => (
    <>
      <Bed id="city_crowd" from={T.seward} to={T.night + 10} volume={0.12} voice={VOICE} />
      <Hit id="wood_hit" at={T.night + 22} volume={0.35} />
      <Hit id="wood_hit" at={T.night + 30} volume={0.3} />
      <Bed id="fire_crackle" from={T.sign} to={T.price + 10} volume={0.14} voice={VOICE} />
      <Hit id="church_bell" at={T.sign + 10} volume={0.18} />
      <Bed id="city_crowd" from={T.folly} to={T.quiz + 10} volume={0.14} voice={VOICE} />
      <Bed id="sea_rough" from={T.flag} to={T.gold + 14} volume={0.13} voice={VOICE} />
      <Bed id="war_drums" from={T.russian - 10} to={T.american + 40} volume={0.1} voice={VOICE} />
      {SALUTE.map((f) => <Hit key={f} id="cannon_far" at={f} volume={0.35} />)}
      <Bed id="wind_storm" from={T.gold} to={T.oil + 14} volume={0.12} voice={VOICE} />
      <Bed id="army_marching" from={T.gold + 10} to={T.oil + 10} volume={0.08} voice={VOICE} />
      <Bed id="wind" from={T.oil} to={to + 10} volume={0.14} voice={VOICE} />
      <Hit id="explosion_far" at={T.strike} volume={0.25} />
    </>
  ),
};
