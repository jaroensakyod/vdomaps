import { interpolate, useCurrentFrame } from "remotion";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, GOLD, Pin, view } from "../../worldhistory/kit/news";
import { alaska, REAL, RUSSIA, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { wound } from "./geo78";
import { AreaTint, Ring, Route, show } from "./mapkit";
import { P, PIPELINE, V } from "./places";
import { DockPanel, InterceptorPanel, MailboxPanel, MainStreetPanel, PorchPanel, RadarPanel, RedHorizonPanel, SovietPipePanel, TankerPanel, TrawlerPanel, TundraPipePanel } from "./scenes78";
import { B, span, VOICE, wf } from "./time";

// Chapter 7 "What it means for you" (you1 → you6): North Slope oil, the oil check, the seafood, the missile
// shield (real world), then Path B flips every one of them (what-if, graded by Ep).
const [from, to] = span("ch7");

const T = {
  you1: B.you1.start,
  you2: B.you2.start,
  alaska2: wf("you2", "Alaska's", 0.25),
  quarter: wf("you2", "quarter", 0.55),
  oil2: wf("you2", "oil", 0.75),
  you3: B.you3.start,
  check: wf("you3", "check", 0.5),
  you4: B.you4.start,
  six: wf("you4", "six", 0.1),
  seafood: wf("you4", "seafood", 0.5),
  you5: B.you5.start,
  fort: wf("you5", "Fort", 0.74),
  guarding: wf("you5", "guarding", 0.85),
  you6: B.you6.start,
  flips: wf("you6", "flips.", 0.22),
  oil6: wf("you6", "oil,", 0.34),
  fish: wf("you6", "fish,", 0.44),
  shield: wf("you6", "shield.", 0.52),
  protecting: wf("you6", "protecting", 0.64),
  aimed: wf("you6", "aimed", 0.88),
};

const VP = {
  pipe: bbox([[-158, 59.5], [-138, 71]]),
  sea: bbox([[-180, 51], [-155, 64]]),
};

// Bering Sea fishing grounds, approximate outline of the eastern shelf.
const GROUNDS = {
  type: "Feature" as const,
  properties: {},
  geometry: { type: "Polygon" as const, coordinates: [wound([[-178.5, 60.5], [-170, 62.5], [-163, 61], [-160, 58.5], [-162, 55.3], [-166.5, 53.6], [-172, 53.2], [-178.5, 55.5], [-178.5, 60.5]])] },
};
const CHICAGO: [number, number] = [-87.63, 41.88];
const pt = (p: readonly number[]) => p as [number, number];

// A pin that turns from blue to red at `flip`.
const FlipPin = ({ at, text, k, flip }: { at: [number, number]; text: string; k: number; flip: number }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [flip, flip + 10], [0, 1], clamp);
  return (
    <g>
      <Pin at={at} text={text} k={k * (1 - r)} color={REAL} size={0.8} />
      <Pin at={at} text={text} k={k * r} color={RUSSIA} size={0.8} />
    </g>
  );
};

export const ch7: Chapter = {
  name: "What it means for you",
  from,
  to,
  cams: (w, h) => [
    { frame: T.you1, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.alaska2 - 10, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.alaska2 + 30, cam: view(VP.pipe, w, h, 0.62, 0.1) },
    { frame: T.you3, cam: view(VP.pipe, w, h, 0.62, 0.1) },
    { frame: T.you3 + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.you4, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.you4 + 30, cam: view(VP.sea, w, h, 0.8, 0.1) },
    { frame: T.you5, cam: view(VP.sea, w, h, 0.8, 0.1) },
    { frame: T.you5 + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.guarding - 8, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.guarding + 30, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: to - 1, cam: view(V.america, w, h, 1.0, 0.1) },
  ],
  years: [[T.you1, "2026"], [T.you2, "1988"], [T.you3, "Since 1982"], [T.you4, "Today"]],
  heads: [
    { f: T.you1, tag: "What about you?", head: "Closer than you think", color: REAL },
    { f: T.you2, tag: "1988 · North Slope", head: "A quarter of US oil", color: GOLD, stat: (f) => (f >= T.quarter ? "~25%" : ""), label: "of all oil produced in the US" },
    { f: T.you3, tag: "Since 1982", head: "A yearly oil check", color: GOLD, stat: (f) => (f >= T.check ? "$1,000" : ""), label: "the first check, 1982" },
    { f: T.you4, tag: "US wild seafood", head: "~60% from Alaska", color: GOLD, stat: (f) => (f >= T.six ? "6 in 10" : ""), label: "pounds caught in the US" },
    { f: T.you5, tag: "Fort Greely, Alaska", head: "America's missile shield", color: REAL, stat: (f) => (f >= T.fort ? "40 of 44" : ""), label: "long-range interceptors" },
    { f: T.you6, tag: "What if · Path B", head: "Aimed at you", color: WHATIF, chips: [{ text: "Oil", f: T.oil6 }, { text: "Fish", f: T.fish }, { text: "Shield", f: T.shield }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    if (frame < from - 4 || frame >= to) return null;
    const red = interpolate(frame, [T.flips, T.flips + 18], [0, 1], clamp);
    return (
      <g>
        <AreaTint f={alaska} color={REAL} k={show(frame, from - 4, to + 10) * (1 - red)} />
        <AreaTint f={alaska} color={RUSSIA} k={red} />
        {/* you2: the pipeline */}
        <Route pts={PIPELINE} start={T.alaska2} len={46} end={T.you3 + 20} color={GOLD} width={6} />
        <Pin at={pt(P.prudhoe)} text="Prudhoe Bay" k={show(frame, T.alaska2, T.you3 + 20)} color={GOLD} size={0.75} />
        <Pin at={pt(P.valdez)} text="Valdez" k={show(frame, T.oil2, T.you3 + 20)} color={GOLD} size={0.75} />
        {/* you3: where the checks go */}
        <Pin at={pt(P.anchorage)} text="Anchorage" k={show(frame, T.check, T.you4 + 10)} color={GOLD} size={0.75} />
        {/* you4: the fishing grounds (approximate) */}
        <AreaTint f={GROUNDS} color={GOLD} k={show(frame, T.six, T.you5 + 20) * 0.9} fill={0.3} />
        <Pin at={pt(P.dutchHarbor)} text="Dutch Harbor" k={show(frame, T.seafood, T.you5 + 20)} color={GOLD} size={0.75} />
        {/* you5: the shield */}
        <Pin at={pt(P.fortGreely)} text="Fort Greely" k={show(frame, T.fort, T.you6)} color={REAL} size={0.8} />
        {frame >= T.guarding && frame < T.aimed && <Ring at={pt(P.fortGreely)} radius={48} start={T.guarding + 4} color={REAL} grow={40} end={T.aimed - 12} />}
        {/* you6: every one flips */}
        {frame >= T.you6 && (
          <g>
            <FlipPin at={pt(P.prudhoe)} text="Oil" k={show(frame, T.you6 + 6, to + 10)} flip={T.oil6} />
            <FlipPin at={pt(P.dutchHarbor)} text="Fish" k={show(frame, T.you6 + 6, to + 10)} flip={T.fish} />
            <FlipPin at={pt(P.fortGreely)} text="Shield" k={show(frame, T.you6 + 6, to + 10)} flip={T.shield} />
          </g>
        )}
        {frame >= T.aimed && <Ring at={pt(P.fortGreely)} radius={48} start={T.aimed} color={RUSSIA} grow={30} end={to + 20} />}
        <Route pts={[pt(P.fortGreely), pt(P.seattle)]} start={T.aimed + 6} len={20} end={to + 20} color={RUSSIA} width={5} dash />
        <Route pts={[pt(P.fortGreely), CHICAGO]} start={T.aimed + 10} len={24} end={to + 20} color={RUSSIA} width={5} dash />
        <Route pts={[pt(P.fortGreely), pt(P.washington)]} start={T.aimed + 14} len={28} end={to + 20} color={RUSSIA} width={5} dash />
      </g>
    );
  },
  Panels: () => (
    <g>
      <PorchPanel start={T.you1} end={T.alaska2 + 14} />
      <TundraPipePanel start={T.alaska2} end={T.quarter + 14} />
      <TankerPanel start={T.quarter} end={T.you3 + 14} />
      <MailboxPanel start={T.you3} end={T.check + 14} />
      <MainStreetPanel start={T.check} end={T.you4 + 14} />
      <TrawlerPanel start={T.you4} end={T.seafood + 14} />
      <DockPanel start={T.seafood} end={T.you5 + 14} />
      <InterceptorPanel start={T.you5} end={T.guarding + 14} />
      <RadarPanel start={T.guarding} end={T.you6 + 14} />
      <SovietPipePanel start={T.you6} end={T.protecting + 14} />
      <RedHorizonPanel start={T.protecting} end={to + 14} />
    </g>
  ),
  sfx: [
    [T.you1 - 4, SFX.whoosh, 0.3],
    [T.alaska2 - 4, SFX.whoosh, 0.3],
    [T.alaska2, SFX.pop, 0.28],
    [T.quarter, SFX.tick, 0.3],
    [T.you3 + 2, SFX.whoosh, 0.25],
    [T.check, SFX.tick, 0.3],
    [T.you4 + 2, SFX.whoosh, 0.3],
    [T.six, SFX.pop, 0.3],
    [T.seafood, SFX.pop, 0.25],
    [T.fort, SFX.pop, 0.3],
    [T.guarding, SFX.whoosh, 0.3],
    [T.oil6, SFX.hit, 0.3],
    [T.fish, SFX.hit, 0.3],
    [T.shield, SFX.hit, 0.35],
    [T.aimed, SFX.hit, 0.45],
  ],
  Sound: () => (
    <>
      <Bed id="city_crowd" from={T.you1} to={T.alaska2 + 10} volume={0.1} voice={VOICE} />
      <Bed id="wind" from={T.alaska2} to={T.quarter + 10} volume={0.18} voice={VOICE} />
      <Bed id="ship_creak" from={T.quarter} to={T.you3 + 10} volume={0.14} voice={VOICE} />
      <Bed id="wind" from={T.you3} to={T.check + 10} volume={0.2} voice={VOICE} />
      <Bed id="city_crowd" from={T.check} to={T.you4 + 10} volume={0.12} voice={VOICE} />
      <Bed id="sea_rough" from={T.you4} to={T.you5 + 10} volume={0.2} voice={VOICE} />
      <Hit id="ship_bell" at={T.seafood + 4} volume={0.25} />
      <Bed id="wind" from={T.you5} to={T.guarding + 10} volume={0.18} voice={VOICE} />
      <Bed id="server_hum" from={T.guarding} to={T.you6 + 10} volume={0.18} voice={VOICE} />
      <Bed id="army_marching" from={T.you6} to={T.protecting + 10} volume={0.1} voice={VOICE} />
      <Bed id="wind_storm" from={T.you6} to={to + 8} volume={0.12} voice={VOICE} />
    </>
  ),
};
