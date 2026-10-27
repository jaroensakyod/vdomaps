import type { Feature, MultiPolygon } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { country } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, GOLD, Pin, view } from "../../worldhistory/kit/news";
import { alaska, BORDER, canada, REAL, russia, RUSSIA, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Ring, Route, show } from "./mapkit";
import { P, PIPELINE, V } from "./places";
import { BorderPanel, SiloPanel } from "./scenes0";
import { ConvoyPanel, CubaPanel, GunboatPanel, PetrogradPanel, RedFlagPanel, RigRedPanel, SeattlePanel, SOVIET, star, SteppePanel, Town1910Panel, VladPanel, WatchtowerPanel } from "./scenes56";
import { B, span, VOICE, wf } from "./time";

// Chapter 6 "Path B: Soviet Alaska" (beats b1 → b10): Russia keeps Alaska to 1917, the revolution and civil war
// (real), US troops in Siberia (real), a failed grab and Soviet Alaska, a 1,538-mile Soviet border with Canada,
// Cuba 1962 (real) vs missiles already on Soviet soil, Prudhoe oil for the Red Army, Canada as the front line,
// and America guarding its own continent.
const [from, to] = span("ch6");
const pt = (p: readonly number[]) => p as [number, number];

const T = {
  b1: B.b1.start,
  y1917: wf("b1", "nineteen-", 0.85),
  b2: B.b2.start,
  revolution: wf("b2", "revolution.", 0.2),
  civil: wf("b2", "civil", 0.75),
  b3: B.b3.start,
  troops: wf("b3", "eight-", 0.45),
  vlad: wf("b3", "Vladivostok.", 0.9),
  b4: B.b4.start,
  grab: wf("b4", "grab", 0.3),
  fails: wf("b4", "fails,", 0.8),
  reds: wf("b4", "Reds", 0.9),
  b5: B.b5.start,
  border: wf("b5", "border", 0.5),
  miles: wf("b5", "miles", 0.9),
  b6: B.b6.start,
  cubaMissiles: wf("b6", "missiles", 0.3),
  florida: wf("b6", "Florida,", 0.6),
  b7: B.b7.start,
  missiles: wf("b7", "missiles", 0.4),
  less: wf("b7", "less", 0.8),
  seattle: wf("b7", "Seattle.", 0.95),
  b8: B.b8.start,
  red: wf("b8", "Red", 0.5),
  b9: B.b9.start,
  front: wf("b9", "front", 0.3),
  b10: B.b10.start,
  troops2: wf("b10", "troops", 0.35),
};

const VB = {
  russia: bbox([[25, 42], [180, 74]]),
  grab: bbox([[-160, 44], [-118, 64]]),
  border: bbox([[-152, 53], [-124, 71]]),
  cuba: bbox([[-100, 14], [-66, 40]]),
  continent: bbox([[-150, 5], [15, 66]]),
};

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

// A gold star on the map (Soviet Alaska; never a hammer and sickle).
const MapStar = ({ at, k, r = 34 }: { at: [number, number]; k: number; r?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${p[0]},${p[1]}) scale(${0.6 + 0.4 * k}) translate(${-p[0]},${-p[1]})`}>
      <path d={star(p[0], p[1], r * s)} fill={GOLD} stroke="#5a1010" strokeWidth={3 * s} style={{ filter: `drop-shadow(0 0 ${10 * s}px ${SOVIET})` }} />
    </g>
  );
};

const BorderRed = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const k = show(frame, T.border, T.b6 + 10);
  if (k <= 0) return null;
  const d = path({ type: "LineString", coordinates: BORDER }) ?? "";
  return (
    <g opacity={k} fill="none" strokeLinecap="round">
      <path d={d} stroke={SOVIET} strokeWidth={22 * s} strokeOpacity={0.45} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} stroke="#ffd0d0" strokeWidth={4 * s} strokeDasharray={`${16 * s} ${10 * s}`} strokeDashoffset={-frame * 1.2 * s} />
    </g>
  );
};

export const ch6: Chapter = {
  name: "Path B: Soviet Alaska",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.b2 - 6, cam: view(V.alaska, w, h, 1.03, 0.1) },
    { frame: T.b2 + 40, cam: view(VB.russia, w, h, 1.0, 0.1) },
    { frame: T.b3 - 6, cam: view(VB.russia, w, h, 1.03, 0.1) },
    { frame: T.b3 + 36, cam: view(V.vlad, w, h, 1.0, 0.1) },
    { frame: T.b4 - 6, cam: view(V.vlad, w, h, 1.03, 0.1) },
    { frame: T.b4 + 40, cam: view(VB.grab, w, h, 1.0, 0.1) },
    { frame: T.reds - 6, cam: view(VB.grab, w, h, 1.0, 0.1) },
    { frame: T.reds + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.b5 + 6, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.border + 10, cam: view(VB.border, w, h, 1.0, 0.1) },
    { frame: T.b6 - 6, cam: view(VB.border, w, h, 1.03, 0.1) },
    { frame: T.b6 + 40, cam: view(VB.cuba, w, h, 1.0, 0.1) },
    { frame: T.b7 - 6, cam: view(VB.cuba, w, h, 1.03, 0.1) },
    { frame: T.b7 + 40, cam: view(V.reach, w, h, 1.0, 0.1) },
    { frame: T.b8 - 6, cam: view(V.reach, w, h, 1.0, 0.1) },
    { frame: T.b8 + 30, cam: view(V.north, w, h, 1.0, 0.1) },
    { frame: T.b9 - 6, cam: view(V.north, w, h, 1.0, 0.1) },
    { frame: T.b9 + 30, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.b10 - 4, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.b10 + 30, cam: view(VB.continent, w, h, 1.0, 0.1) },
    { frame: to - 1, cam: view(VB.continent, w, h, 1.03, 0.1) },
  ],
  years: [[from, "1867"], [T.b2, "1917"], [T.b3, "1918"], [T.b4, "1920s"], [T.b6, "1962"], [T.b7, "1960s"]],
  heads: [
    { f: T.b1, tag: "Path B", head: "Russia holds on", color: WHATIF, stat: (f) => String(Math.round(interpolate(f, [T.b1 + 10, T.y1917], [1867, 1917], clamp))), label: "still Russian" },
    { f: T.b2, tag: "Real world · 1917", head: "The Russian Revolution", color: GOLD },
    { f: T.b3, tag: "Real world · 1918–1920", head: "US troops in Siberia", color: REAL, stat: (f) => (f >= T.troops ? "≈ 8,000" : ""), label: "landed at Vladivostok" },
    { f: T.b4, tag: "What if", head: "America tries to grab Alaska", color: WHATIF },
    { f: T.reds, tag: "Path B", head: "Soviet Alaska", color: SOVIET },
    { f: T.b5, tag: "Soviet border", head: "Next door to Canada", color: SOVIET, stat: (f) => (f >= T.border ? `${Math.round(interpolate(f, [T.border, T.miles], [0, 1538], clamp)).toLocaleString("en-US")} mi` : "") },
    { f: T.b6, tag: "Real world · October 1962", head: "The Cuban Missile Crisis", color: GOLD, stat: (f) => (f >= T.florida ? "90 mi" : ""), label: "from Florida" },
    { f: T.b7, tag: "Path B", head: "Nothing to smuggle", color: WHATIF, stat: (f) => (f >= T.less ? "< 1,000 mi" : ""), label: "to Seattle" },
    { f: T.b8, tag: "Prudhoe Bay oil", head: "Paying for the Red Army", color: SOVIET },
    { f: T.b9, tag: "Canada", head: "The front line", color: WHATIF },
    { f: T.b10, tag: "America", head: "Guarding its own backyard", color: REAL },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const soviet = interpolate(frame, [T.reds, T.reds + 20], [0, 1], clamp);
    return (
      <g>
        <AreaTint f={russia} color={RUSSIA} k={0.3 + 0.3 * show(frame, T.revolution, T.b3)} line={1.2} />
        <AreaTint f={alaska} color={RUSSIA} k={1 - soviet} />
        <AreaTint f={alaska} color={SOVIET} k={soviet} fill={0.5} />
        <AreaTint f={canada} color="#ff6a3a" k={show(frame, T.b9, to + 20) * (0.45 + 0.15 * Math.sin(frame * 0.08))} line={1.4} />
        <AreaTint f={LOWER48} color={REAL} k={show(frame, T.b10, to + 30)} line={1.4} />
        <MapStar at={[-152, 64.5]} k={interpolate(frame, [T.reds + 6, T.reds + 22], [0, 1], clamp)} />
        <BorderRed />
        <Route pts={[[138, 40], [134, 42.2], pt(P.vladivostok)]} start={T.b3 + 10} len={40} end={T.b4 - 6} color={REAL} />
        <Route pts={[pt(P.seattle), [-131, 52], pt(P.sitka)]} start={T.grab} len={30} end={T.fails} color={REAL} dash />
        {frame >= T.b6 - 10 && frame < T.b7 + 10 && <Ring at={pt(P.havana)} radius={16} start={T.cubaMissiles} color={GOLD} end={T.b7} />}
        {frame >= T.b7 - 10 && frame < T.b8 + 10 && <Ring at={pt(P.silo)} radius={22.5} start={T.missiles} color={SOVIET} end={T.b8} />}
        <Route pts={PIPELINE} start={T.b8} len={30} end={to} color={SOVIET} />
        <Route pts={[pt(P.prudhoe), [-158, 70.6], [-166, 68.5], [-169.5, 66.2]]} start={T.red} len={36} end={to} color={SOVIET} dash />
        <Route pts={[[10, 51], [-40, 50], pt([-87.6, 41.9])]} start={T.troops2} len={40} end={to + 30} color={REAL} />
        <Route pts={[[-157.8, 21.3], pt(P.seattle)]} start={T.troops2 + 8} len={40} end={to + 30} color={REAL} />
        <Route pts={[[-79.5, 9], [-97, 31]]} start={T.troops2 + 14} len={40} end={to + 30} color={REAL} />
        <MapText at={[-82.2, 24.1]} text="90 mi" k={show(frame, T.florida, T.b7)} size={0.7} />
        <MapText at={[-135, 55.5]} text="< 1,000 mi" k={show(frame, T.less, T.b8)} size={0.8} color="#ffd0d0" />
        <MapText at={[-105, 57]} text="FRONT LINE" k={show(frame, T.front, T.b10 + 10)} size={1.2} color="#ffd6c8" />
        <Pin at={pt(P.stPetersburg)} text="Petrograd" k={show(frame, T.b2 + 20, T.b3 + 6)} color={GOLD} size={0.8} />
        <Pin at={pt(P.vladivostok)} text="Vladivostok" k={show(frame, T.vlad - 10, T.b4 + 6)} color={REAL} size={0.8} />
        <Pin at={pt(P.havana)} text="Havana" k={show(frame, T.b6 + 30, T.b7 + 6)} color={GOLD} size={0.8} dy={40} />
        <Pin at={pt(P.keyWest)} text="Florida" k={show(frame, T.florida, T.b7 + 6)} color="#ffffff" size={0.75} />
        <Pin at={pt(P.silo)} text="Missile base" k={show(frame, T.b7 + 30, T.b8 + 6)} color={SOVIET} size={0.8} />
        <Pin at={pt(P.seattle)} text="Seattle" k={show(frame, T.seattle - 10, T.b8 + 6)} color="#ffffff" size={0.75} />
        <Pin at={pt(P.prudhoe)} text="Prudhoe Bay" k={show(frame, T.b8 + 20, T.b9 + 6)} color={SOVIET} size={0.8} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <Town1910Panel start={from} end={T.b2 + 14} />
      <PetrogradPanel start={T.b2} end={T.civil + 14} />
      <SteppePanel start={T.civil} end={T.b3 + 14} />
      <VladPanel start={T.b3} end={T.b4 + 14} />
      <GunboatPanel start={T.b4} end={T.reds + 14} />
      <RedFlagPanel start={T.reds} end={T.border + 14} raise={T.reds + 16} />
      <WatchtowerPanel start={T.border} end={T.b6 + 14} />
      <CubaPanel start={T.b6} end={T.b7 + 14} />
      <SiloPanel start={T.b7} end={T.less + 14} />
      <SeattlePanel start={T.less} end={T.b8 + 14} />
      <RigRedPanel start={T.b8} end={T.b9 + 14} />
      <BorderPanel start={T.b9} end={T.b10 + 14} />
      <ConvoyPanel start={T.b10} end={to + 14} />
    </g>
  ),
  sfx: [
    [T.b2 - 6, SFX.whoosh, 0.3],
    [T.b3 - 6, SFX.whoosh, 0.3],
    [T.troops, SFX.tick, 0.28],
    [T.b4 - 6, SFX.whoosh, 0.3],
    [T.reds, SFX.hit, 0.45],
    [T.border, SFX.tick, 0.28],
    [T.b6 - 6, SFX.whoosh, 0.3],
    [T.cubaMissiles, SFX.pop, 0.3],
    [T.b7 - 6, SFX.whoosh, 0.3],
    [T.missiles, SFX.pop, 0.3],
    [T.b8 - 6, SFX.whoosh, 0.3],
    [T.b9 - 6, SFX.whoosh, 0.3],
    [T.b10 - 4, SFX.whoosh, 0.3],
  ],
  Sound: () => (
    <>
      <Bed id="wind" from={from} to={T.b2 + 10} volume={0.22} voice={VOICE} />
      <Bed id="crowd_protest_march" from={T.b2} to={T.civil + 14} volume={0.14} voice={VOICE} />
      <Bed id="army_marching" from={T.civil} to={T.b3 + 10} volume={0.14} voice={VOICE} />
      <Bed id="ship_creak" from={T.b3} to={T.b4 + 10} volume={0.12} voice={VOICE} />
      <Hit id="ship_bell" at={T.b3 + 20} volume={0.22} />
      <Bed id="sea_rough" from={T.b4} to={T.reds + 14} volume={0.14} voice={VOICE} />
      <Bed id="war_drums" from={T.reds} to={T.border + 14} volume={0.12} voice={VOICE} />
      <Bed id="wind" from={T.border} to={T.b6 + 10} volume={0.2} voice={VOICE} />
      <Hit id="jet_flyover" at={T.cubaMissiles} volume={0.2} />
      <Bed id="server_hum" from={T.b7} to={T.less + 14} volume={0.2} voice={VOICE} />
      <Bed id="wind" from={T.less} to={T.b8 + 10} volume={0.14} voice={VOICE} />
      <Bed id="fire_big" from={T.b8} to={T.b9 + 10} volume={0.12} voice={VOICE} />
      <Bed id="wind_storm" from={T.b9} to={T.b10 + 10} volume={0.14} voice={VOICE} />
      <Bed id="tank_move" from={T.b10} to={to + 10} volume={0.12} voice={VOICE} />
    </>
  ),
};
