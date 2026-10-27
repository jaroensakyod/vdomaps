import { interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, Pin, view } from "../../worldhistory/kit/news";
import { alaska, REAL, RUSSIA, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Route, show } from "./mapkit";
import { P, V } from "./places";
import { CivilWarPanel, CrossroadsPanel, EmptyChairPanel, PalacePanel, TearPanel } from "./scenes34";
import { B, span, VOICE, wf } from "./time";

// Chapter 4 "The fork" (beats fork → twoways): three ways the deal could have died, the treaty torn up (the
// what-if grade starts on "tear"), and the two paths: A toward Canada, B toward the Bering Strait.
const [from, to] = span("ch4");
const pt = (k: keyof typeof P) => P[k] as [number, number];
const PINK = "#ff8fc8";
const RED = "#ff4d4d";

const T = {
  fork: B.fork.start,
  seward: wf("fork", "Seward", 0.3),
  civil: wf("fork", "Civil", 0.55),
  tsar: wf("fork", "Tsar", 0.82),
  split: B.split.start,
  tear: wf("split", "tear", 0.6),
  two: B.twoways.start,
  likely: wf("twoways", "likely", 0.45),
  scary: wf("twoways", "scariest", 0.8),
};

export const ch4: Chapter = {
  name: "The fork",
  from,
  to,
  cams: (w, h) => [
    { frame: T.fork, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.fork + 36, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.tsar - 8, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.tsar + 30, cam: view(V.europe, w, h, 1.0, 0.1) },
    { frame: T.split, cam: view(V.europe, w, h, 1.0, 0.1) },
    { frame: T.split + 40, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.two, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.two + 40, cam: view(V.reach, w, h, 1.0, 0.1) },
  ],
  years: [[T.fork, "1867"], [T.tear, "1867"]],
  heads: [
    {
      f: T.fork,
      tag: "It almost didn't happen",
      head: "Three ifs",
      color: REAL,
      chips: [
        { text: "Seward", f: T.seward },
        { text: "The war", f: T.civil },
        { text: "The Tsar", f: T.tsar },
      ],
    },
    { f: T.split, tag: "1867", head: "Tear up the treaty", color: REAL },
    { f: T.tear, tag: "What if", head: "Enter the what-if world", color: WHATIF },
    {
      f: T.two,
      tag: "Two paths",
      head: "Likely · Scary",
      color: WHATIF,
      chips: [
        { text: "A · likely", f: T.likely },
        { text: "B · scary", f: T.scary },
      ],
    },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const red = interpolate(frame, [T.tear, T.tear + 16], [0, 1], clamp);
    const on = show(frame, from - 10, to + 20);
    return (
      <g>
        <AreaTint f={alaska} color={REAL} k={(1 - red) * on} />
        <AreaTint f={alaska} color={RUSSIA} k={red * on} />
        <Pin at={pt("washington")} text="Washington" k={show(frame, T.seward - 4, T.tsar)} color={REAL} size={0.8} />
        <MapText at={[-82, 36.5]} text="CIVIL WAR" k={show(frame, T.civil - 4, T.tsar)} size={0.9} color="#d8dde6" />
        <Pin at={pt("stPetersburg")} text="St. Petersburg" k={show(frame, T.tsar + 10, T.split + 30)} color={RUSSIA} size={0.8} />
        <Route pts={[pt("sitka"), [-128, 58.5], [-112, 59]]} start={T.likely - 4} len={40} end={to + 30} color={PINK} width={9} />
        <Route pts={[pt("fairbanks"), pt("nome"), pt("uelkal")]} start={T.scary - 4} len={40} end={to + 30} color={RED} width={9} />
        <MapText at={[-114, 61.4]} text="PATH A" k={show(frame, T.likely + 20, to + 20)} size={0.9} color={PINK} />
        <MapText at={[-176, 67.6]} text="PATH B" k={show(frame, T.scary + 20, to + 20)} size={0.9} color={RED} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <EmptyChairPanel start={T.fork} end={T.civil + 14} />
      <CivilWarPanel start={T.civil} end={T.tsar + 14} />
      <PalacePanel start={T.tsar} end={T.split + 14} />
      <TearPanel start={T.split} end={T.two + 14} tear={T.tear} />
      <CrossroadsPanel start={T.two} end={to + 14} a={T.likely} b={T.scary} />
    </g>
  ),
  sfx: [
    [T.fork - 6, SFX.whoosh, 0.3],
    [T.seward, SFX.pop, 0.3],
    [T.civil, SFX.pop, 0.3],
    [T.tsar, SFX.pop, 0.3],
    [T.tsar + 2, SFX.whoosh, 0.3],
    [T.tear - 30, SFX.riser, 0.22],
    [T.tear, SFX.hit, 0.55],
    [T.tear - 2, SFX.whoosh, 0.35],
    [T.likely, SFX.pop, 0.3],
    [T.scary, SFX.hit, 0.35],
  ],
  Sound: () => (
    <>
      <Bed id="firefight" from={T.civil} to={T.tsar + 14} volume={0.08} voice={VOICE} />
      {[T.civil + 16, T.civil + 46, T.civil + 76].filter((f) => f < T.tsar + 10).map((f) => <Hit key={f} id="cannon_old" at={f} volume={0.25} />)}
      <Bed id="wind" from={T.tsar} to={T.split + 10} volume={0.14} voice={VOICE} />
      <Hit id="church_bell" at={T.tsar + 12} volume={0.16} />
      <Bed id="fire_crackle" from={T.split} to={T.two + 10} volume={0.12} voice={VOICE} />
      <Hit id="wood_break" at={T.tear} volume={0.2} />
      <Bed id="wind_storm" from={T.two} to={to + 10} volume={0.12} voice={VOICE} />
    </>
  ),
};
