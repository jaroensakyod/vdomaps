import type { Feature, MultiPolygon } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { country } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { bbox, region } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, GOLD, Pin, view } from "../../worldhistory/kit/news";
import { alaska, canada, REAL, russia, RUSSIA, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Route, show } from "./mapkit";
import { ALSIB, P, V } from "./places";
import { AirfieldPanel, ArcticShorePanel, CANADA, CanadaShorePanel, FogLandingPanel, FrigatePanel, KlondikePanel, MainStreetPanel, MountiePanel, OttawaPanel, RigCanadaPanel, StraitPanel, WatchPanel } from "./scenes56";
import { B, span, VOICE, wf } from "./time";

// Chapter 5 "Path A: Alaska becomes Canada" (beats a1 → a8): Russia's fear, Canada born in 1867 (real), Britain
// takes Alaska, it joins Canada, Canada grows by a sixth, no Arctic coast and no Alaska–Siberia air route, the
// Aleutians in 1942 (real, then Canada's fight), and the US no longer Russia's neighbour.
const [from, to] = span("ch5");
const pt = (p: readonly number[]) => p as [number, number];

const T = {
  a1: B.a1.start,
  a2: B.a2.start,
  canada67: wf("a2", "Canada", 0.55),
  a3: B.a3.start,
  britain: wf("a3", "Britain,", 0.45),
  british: wf("a3", "British", 0.8),
  a4: B.a4.start,
  joins: wf("a4", "Canada.", 0.85),
  a5: B.a5.start,
  klondike: wf("a5", "Klondike", 0.6),
  prudhoe: wf("a5", "Prudhoe", 0.85),
  a6: B.a6.start,
  arctic: wf("a6", "Arctic", 0.15),
  war: wf("a6", "World", 0.4),
  planes: wf("a6", "eight-", 0.75),
  soviets: wf("a6", "Soviets.", 0.95),
  a7: B.a7.start,
  attu: wf("a7", "Attu", 0.35),
  kiska: wf("a7", "Kiska", 0.45),
  path: wf("a7", "Path", 0.75),
  a8: B.a8.start,
  america: wf("a8", "America", 0.65),
};

const VA = {
  north: bbox([[-172, 46], [-112, 72]]),
  east: bbox([[-100, 38], [-55, 56]]),
  bc: bbox([[-152, 46], [-118, 62]]),
  canada: bbox([[-172, 40], [-55, 75]]),
  gold: bbox([[-166, 57], [-128, 72]]),
  alsib: { type: "LineString" as const, coordinates: ALSIB }, // a dateline-crossing bbox would fit the wrong side
  lower48: bbox([[-178, 24], [-62, 72]]),
};

// Canada at Confederation (Ontario, Quebec, Nova Scotia, New Brunswick), a rough outline.
const CANADA_1867 = region([[-95, 49], [-90, 48.3], [-84.5, 46.5], [-82.5, 42], [-79, 42.8], [-75, 44.9], [-71, 45], [-67.8, 45.2], [-67, 44.8], [-64, 45.4], [-61, 45.6], [-60, 46.2], [-61.5, 47.2], [-64.5, 48.2], [-66, 50], [-70, 52], [-78, 52], [-80, 51], [-90, 51.5]]);
// Alaska's Arctic coast, approximate.
const ARCTIC_COAST: [number, number][] = [[-166.2, 68.9], [-163, 69.9], [-160, 70.6], [-156.8, 71.3], [-152, 70.9], [-148.3, 70.3], [-144, 70.1], [-141, 69.65]];
// The Lower 48 (US polygons south of 50°N, east of 130°W).
const us = country("840") as Feature<MultiPolygon>;
const LOWER48: Feature<MultiPolygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "MultiPolygon",
    coordinates: us.geometry.coordinates.filter((poly) => {
      const r = poly[0];
      const lon = r.reduce((a, p) => a + p[0], 0) / r.length;
      const lat = r.reduce((a, p) => a + p[1], 0) / r.length;
      return lat < 50 && lon > -130;
    }),
  },
};

const ArcticCoast = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = show(frame, T.arctic, T.war + 20);
  if (k <= 0) return null;
  const d = path({ type: "LineString", coordinates: ARCTIC_COAST }) ?? "";
  return (
    <g opacity={k} fill="none" strokeLinecap="round">
      <path d={d} stroke={CANADA} strokeWidth={22 * s} strokeOpacity={0.4} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} stroke="#fff" strokeWidth={4 * s} strokeDasharray={`${14 * s} ${9 * s}`} strokeDashoffset={-frame * s} />
    </g>
  );
};

export const ch5: Chapter = {
  name: "Path A: Canada",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(VA.north, w, h, 1.0, 0.1) },
    { frame: T.a2 - 6, cam: view(VA.north, w, h, 1.0, 0.1) },
    { frame: T.a2 + 34, cam: view(VA.east, w, h, 1.0, 0.1) },
    { frame: T.a3 - 6, cam: view(VA.east, w, h, 1.05, 0.1) },
    { frame: T.a3 + 34, cam: view(VA.bc, w, h, 1.0, 0.1) },
    { frame: T.a4 - 6, cam: view(VA.bc, w, h, 1.0, 0.1) },
    { frame: T.a4 + 30, cam: view(VA.canada, w, h, 1.0, 0.1) },
    { frame: T.a5 - 4, cam: view(VA.canada, w, h, 1.0, 0.1) },
    { frame: T.a5 + 30, cam: view(VA.gold, w, h, 1.0, 0.1) },
    { frame: T.war - 8, cam: view(VA.gold, w, h, 1.0, 0.1) },
    { frame: T.war + 40, cam: view(VA.alsib, w, h, 0.9, 0.1) },
    { frame: T.a7 - 6, cam: view(VA.alsib, w, h, 0.92, 0.1) },
    { frame: T.a7 + 36, cam: view(V.aleutians, w, h, 1.0, 0.1) },
    { frame: T.a8 - 6, cam: view(V.aleutians, w, h, 1.0, 0.1) },
    { frame: T.a8 + 36, cam: view(V.bering, w, h, 1.0, 0.1) },
    { frame: T.america - 4, cam: view(V.bering, w, h, 1.0, 0.1) },
    { frame: T.america + 40, cam: view(VA.lower48, w, h, 1.0, 0.1) },
    { frame: to - 1, cam: view(VA.lower48, w, h, 1.03, 0.1) },
  ],
  years: [[from, "1867"], [T.a2, "1867"], [T.a6, "1942"], [T.a8, "Today"]],
  heads: [
    { f: T.a1, tag: "Path A", head: "Russia's worst fear", color: WHATIF },
    { f: T.a2, tag: "Real world · July 1, 1867", head: "Canada is born", color: GOLD },
    { f: T.a3, tag: "What if · the next war", head: "Britain takes Alaska", color: WHATIF },
    { f: T.a4, tag: "What if", head: "Alaska becomes Canada", color: CANADA },
    { f: T.a5, tag: "A bigger Canada", head: "Gold + oil", color: CANADA, stat: "+17%", label: "about a sixth more land", chips: [{ text: "Klondike gold", f: T.klondike }, { text: "Prudhoe Bay oil", f: T.prudhoe }] },
    { f: T.a6, tag: "What if", head: "No Arctic coast for the US", color: WHATIF },
    { f: T.war, tag: "World War II · real route", head: "The northern air route, gone", color: WHATIF, stat: (f) => (f >= T.planes ? "≈ 8,000" : ""), label: "warplanes via Alaska" },
    { f: T.a7, tag: "Real world · June 1942", head: "Japan takes Attu and Kiska", color: GOLD },
    { f: T.path, tag: "Path A", head: "Canada's fight", color: CANADA },
    { f: T.a8, tag: "Path A", head: "No Russian neighbor", color: WHATIF },
    { f: T.america, tag: "Changed forever", head: "The US, far from Russia", color: WHATIF },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const pink = interpolate(frame, [T.joins, T.joins + 20], [0, 1], clamp);
    return (
      <g>
        <AreaTint f={russia} color={RUSSIA} k={0.3} line={1.2} />
        <AreaTint f={canada} color={CANADA} k={interpolate(frame, [from, from + 15, T.a2 - 5, T.a2 + 5, T.a4, T.a4 + 15], [0, 0.35, 0.35, 0, 0, 0.5], clamp)} line={1.4} />
        <AreaTint f={CANADA_1867} color={CANADA} k={show(frame, T.canada67, T.a3 + 10)} />
        <AreaTint f={alaska} color={RUSSIA} k={1 - pink} />
        <AreaTint f={alaska} color={CANADA} k={pink} />
        <AreaTint f={LOWER48} color={REAL} k={show(frame, T.america, to + 30)} line={1.4} />
        <ArcticCoast />
        <Route pts={[pt(P.victoria), [-131, 52.5], pt(P.sitka)]} start={T.britain} len={36} end={T.a4 + 10} color={CANADA} dash />
        <Route pts={ALSIB} start={T.war} len={50} end={T.soviets} color={GOLD} width={5} />
        <MapText at={[-153, 64.5]} text="RUSSIAN AMERICA" k={show(frame, from + 8, T.a2)} size={0.8} color="#ffd0d0" />
        <MapText at={[-112, 60]} text="BRITISH NORTH AMERICA" k={show(frame, from + 14, T.a2)} size={0.7} color="#ffd6ec" />
        <MapText at={[-80, 49.5]} text="CANADA, 1867 (approx.)" k={show(frame, T.canada67 + 6, T.a3 + 10)} size={0.75} color="#ffd6ec" />
        <MapText at={[-112, 62]} text="CANADA" k={show(frame, T.joins, T.a5 + 20)} size={1.3} color="#ffd6ec" />
        <MapText at={[-174.5, 66.4]} text="RUSSIA" k={show(frame, T.a8 + 20, T.america + 16)} size={0.9} color="#ffd0d0" />
        <MapText at={[-164.5, 66.6]} text="CANADA" k={show(frame, T.a8 + 26, T.america + 16)} size={0.9} color="#ffd6ec" />
        <MapText at={[-100, 39]} text="USA" k={show(frame, T.america + 20, to + 30)} size={1.2} color="#cfe4ff" />
        <Pin at={pt(P.ottawa)} text="Ottawa" k={show(frame, T.canada67, T.a3 + 6)} color={GOLD} size={0.8} />
        <Pin at={pt(P.sitka)} text="Sitka" k={show(frame, T.a3 + 20, T.a4 + 10)} color={WHATIF} size={0.8} />
        <Pin at={pt(P.dawson)} text="Klondike" k={show(frame, T.klondike, T.a6 + 10)} color={GOLD} size={0.8} />
        <Pin at={pt(P.prudhoe)} text="Prudhoe Bay" k={show(frame, T.prudhoe, T.a6 + 10)} color={CANADA} size={0.8} />
        <Pin at={pt(P.fairbanks)} text="Fairbanks" k={show(frame, T.war + 10, T.soviets + 10)} color={GOLD} size={0.7} />
        <Pin at={pt(P.attu)} text="Attu" k={show(frame, T.attu, T.a8 + 10)} color={frame >= T.path ? CANADA : GOLD} size={0.8} />
        <Pin at={pt(P.kiska)} text="Kiska" k={show(frame, T.kiska, T.a8 + 10)} color={frame >= T.path ? CANADA : GOLD} size={0.8} dy={40} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <WatchPanel start={from} end={T.a2 + 14} />
      <OttawaPanel start={T.a2} end={T.a3 + 14} />
      <FrigatePanel start={T.a3} end={T.a4 + 14} raise={T.british} />
      <MountiePanel start={T.a4} end={T.a5 + 14} />
      <KlondikePanel start={T.a5} end={T.prudhoe + 14} />
      <RigCanadaPanel start={T.prudhoe} end={T.a6 + 14} />
      <ArcticShorePanel start={T.a6} end={T.war + 14} />
      <AirfieldPanel start={T.war} end={T.a7 + 14} ghost={T.soviets - 20} />
      <FogLandingPanel start={T.a7} end={T.path + 14} />
      <CanadaShorePanel start={T.path} end={T.a8 + 14} />
      <StraitPanel start={T.a8} end={T.america + 14} />
      <MainStreetPanel start={T.america} end={to + 14} />
    </g>
  ),
  sfx: [
    [T.a2 - 6, SFX.whoosh, 0.3],
    [T.canada67, SFX.pop, 0.3],
    [T.a3 - 6, SFX.whoosh, 0.3],
    [T.a4 - 6, SFX.whoosh, 0.3],
    [T.joins, SFX.hit, 0.4],
    [T.a5 - 4, SFX.whoosh, 0.3],
    [T.klondike, SFX.pop, 0.3],
    [T.prudhoe, SFX.pop, 0.3],
    [T.war - 8, SFX.whoosh, 0.3],
    [T.planes, SFX.tick, 0.3],
    [T.a7 - 6, SFX.whoosh, 0.3],
    [T.attu, SFX.pop, 0.28],
    [T.kiska, SFX.pop, 0.28],
    [T.a8 - 6, SFX.whoosh, 0.3],
    [T.america - 4, SFX.whoosh, 0.3],
  ],
  Sound: () => (
    <>
      <Bed id="wind" from={from} to={T.a2 + 10} volume={0.22} voice={VOICE} />
      <Bed id="sea_rough" from={from} to={T.a2 + 10} volume={0.1} voice={VOICE} />
      <Bed id="city_crowd" from={T.a2} to={T.a3 + 10} volume={0.12} voice={VOICE} />
      <Hit id="church_bell" at={T.canada67} volume={0.22} />
      <Bed id="sea_rough" from={T.a3} to={T.a4 + 10} volume={0.16} voice={VOICE} />
      <Hit id="ship_bell" at={T.british} volume={0.25} />
      <Bed id="wind" from={T.a4} to={T.a6 + 10} volume={0.22} voice={VOICE} />
      <Bed id="fire_crackle" from={T.prudhoe} to={T.a6 + 10} volume={0.12} voice={VOICE} />
      <Bed id="wind_storm" from={T.a6} to={T.war + 10} volume={0.14} voice={VOICE} />
      <Bed id="plane_prop_loop" from={T.war} to={T.a7 + 10} volume={0.16} voice={VOICE} />
      <Bed id="sea_rough" from={T.a7} to={to + 10} volume={0.14} voice={VOICE} />
      <Bed id="city_crowd" from={T.america} to={to + 10} volume={0.1} voice={VOICE} />
    </>
  ),
};
