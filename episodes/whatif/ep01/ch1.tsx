import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, GOLD, Pin, view } from "../../worldhistory/kit/news";
import { alaska, REAL, russia, RUSSIA } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Route, show } from "./mapkit";
import { BERING_1741, P, V } from "./places";
import {
  AleutianPanel,
  DiomedePanel,
  EmptyPanel,
  FleetPanel,
  FogShipPanel,
  ForcedPanel,
  FortRossPanel,
  LandfallPanel,
  MarketPanel,
  OtterPanel,
  QuayPanel,
  ShipyardPanel,
  SitkaTownPanel,
  StandoffPanel,
  StraitPanel,
  UmiakPanel,
  VillagePanel,
  WarehousePanel,
} from "./scenes12";
import { B, CARD, span, VOICE, wf } from "./time";

// Chapter 1 "Russian America" (strait → few): the Bering Strait and the Diomedes, Bering's 1741 voyage, the sea
// otter fur trade, the Aleutians and their people, the company, Sitka, Fort Ross, and how few Russians there were.
const [from, to] = span("ch1");
const XY = (p: number[]) => p as [number, number];

const T = {
  strait: B.strait.start,
  russia: wf("strait", "Russia", 0.27),
  narrow: wf("strait", "narrowest,", 0.55),
  bering: wf("strait", "Bering", 0.68),
  fifty: wf("strait", "fifty", 0.85),
  diomede: B.diomede.start,
  rus: wf("diomede", "Russian,", 0.35),
  am: wf("diomede", "American.", 0.52),
  apart: wf("diomede", "They're", 0.73),
  three: wf("diomede", "three", 0.8),
  y1741: B.bering.start,
  sailed: wf("bering", "sailed", 0.63),
  reached: wf("bering", "reached", 0.76),
  otter: B.otter.start,
  china: wf("otter", "China", 0.73),
  rush: B.rush.start,
  poured: wf("rush", "poured", 0.33),
  hunted: wf("rush", "hunted", 0.47),
  aleutian: wf("rush", "Aleutian", 0.58),
  natives: B.natives.start,
  aleut: wf("natives", "Aleut", 0.36),
  tlingit: wf("natives", "Tlingit,", 0.45),
  forced: wf("natives", "forced", 0.6),
  fought: wf("natives", "fought", 0.89),
  company: B.company.start,
  monopoly: wf("company", "monopoly", 0.61),
  sitka: B.sitka.start,
  shipyard: wf("sitka", "shipyard.", 0.4),
  thousand: wf("sitka", "one-", 0.74),
  ross: B.ross.start,
  california: wf("ross", "California.", 0.27),
  fort: wf("ross", "Fort", 0.43),
  ninety: wf("ross", "ninety", 0.63),
  few: B.few.start,
  eight: wf("few", "eight-", 0.62),
};
const BLOWS = [T.shipyard + 12, T.shipyard + 34, T.shipyard + 56, T.shipyard + 78, T.shipyard + 100];

// The Diomedes: approximate outlines drawn at their real positions (HLS imagery was cloudy).
const ISLAND = (c: [number, number], rx: number, ry: number) => ({
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      Array.from({ length: 25 }, (_, i) => {
        const a = (-i / 24) * Math.PI * 2; // clockwise for d3
        const w = 1 + 0.12 * Math.sin(i * 1.7) + 0.08 * Math.cos(i * 2.9);
        return [c[0] + Math.cos(a) * rx * w, c[1] + Math.sin(a) * ry * w];
      }),
    ],
  },
});
const BIG = ISLAND(XY(P.bigDiomede), 0.11, 0.03);
const LITTLE = ISLAND(XY(P.littleDiomede), 0.045, 0.016);

const Diomedes = () => {
  const frame = useCurrentFrame();
  const { path, s, projection } = useMap();
  const k = show(frame, T.diomede - 30, T.y1741 + 10, 14);
  if (k <= 0) return null;
  const top = projection([-168.98, 65.95]);
  const bot = projection([-168.98, 65.6]);
  const ru = interpolate(frame, [T.rus - 4, T.rus + 8], [0, 1], clamp);
  const us = interpolate(frame, [T.am - 4, T.am + 8], [0, 1], clamp);
  return (
    <g opacity={k}>
      <path d={path(BIG) ?? ""} fill="#6f6a5a" stroke="#fff" strokeWidth={2.4 * s} />
      <path d={path(LITTLE) ?? ""} fill="#6f6a5a" stroke="#fff" strokeWidth={2.4 * s} />
      <path d={path(BIG) ?? ""} fill={RUSSIA} fillOpacity={0.55 * ru} />
      <path d={path(LITTLE) ?? ""} fill={REAL} fillOpacity={0.55 * us} />
      {top && bot && <line x1={top[0]} y1={top[1]} x2={bot[0]} y2={bot[1]} stroke="#fff" strokeWidth={3 * s} strokeDasharray={`${14 * s} ${10 * s}`} opacity={0.8} />}
      <MapText at={[-168.98, 65.93]} text="DATE LINE · BORDER" k={k} size={0.6} />
      <MapText at={[-169.06, 65.83]} text="RUSSIA" k={ru} size={0.8} color="#ffb3b5" />
      <MapText at={[-168.9, 65.715]} text="USA" k={us} size={0.8} color="#b8dcff" />
      <MapText at={[-168.99, 65.77]} text="2.4 mi" k={interpolate(frame, [T.three - 4, T.three + 8], [0, 1], clamp)} size={0.9} color={GOLD} />
    </g>
  );
};

// Russian outposts spreading along the Aleutians on "poured" (positions approximate).
const OUTPOSTS: [number, number][] = [[173.2, 52.9], [178, 51.8], [-177, 51.8], [-172.3, 52.3], [-168, 53], [-166.5, 53.9], [-162, 55], [-156, 56.5], [-152.4, 57.8], [-150, 59.3], [-145.8, 60.5], [-135.3, 57.05]];
const Outposts = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const out = interpolate(frame, [T.company - 10, T.company + 10], [1, 0], clamp);
  if (frame < T.poured || out <= 0) return null;
  return (
    <g opacity={out}>
      {OUTPOSTS.map((p, i) => {
        const q = projection(p);
        const k = interpolate(frame, [T.poured + i * 6, T.poured + i * 6 + 8], [0, 1], clamp);
        return q && k > 0 ? <circle key={i} cx={q[0]} cy={q[1]} r={9 * s * k} fill={RUSSIA} stroke="#fff" strokeWidth={2.5 * s} /> : null;
      })}
    </g>
  );
};

// "Never more than ~800": a handful of tiny red dots on the whole of Alaska.
const FewDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const k = show(frame, T.few + 6, to + 10);
  if (k <= 0) return null;
  const pts: [number, number][] = [[-135.33, 57.05], [-152.4, 57.79], [-166.54, 53.89], [-145.8, 60.5], [-157, 58.7], [-151.5, 59.6]];
  return (
    <g opacity={k}>
      {pts.map((p, i) => {
        const q = projection(p);
        return q ? <circle key={i} cx={q[0]} cy={q[1]} r={5 * s} fill={RUSSIA} stroke="#fff" strokeWidth={1.6 * s} /> : null;
      })}
    </g>
  );
};

const V1 = {
  kyakhta: bbox([[100, 36], [-140, 66]]),
  voyage: bbox([[152, 48], [-140, 64]]),
  sitka: bbox([[-142, 54.5], [-128, 61]]),
  coast: bbox([[-170, 51], [-130, 64]]),
  toCal: bbox([[-150, 34], [-116, 62]]),
};
const head = (id: string, f: number, extra: { stat?: string; label?: string; color?: string } = {}) => ({ f, tag: CARD[id][0], head: CARD[id][1], color: REAL, ...extra });

export const ch1: Chapter = {
  name: "Russian America",
  from,
  to,
  cams: (w, h) => [
    { frame: T.strait + 20, cam: view(V.bering, w, h, 1.0, 0.1) },
    { frame: T.narrow, cam: view(V.bering, w, h, 1.15, 0.1) },
    { frame: T.diomede - 10, cam: view(V.bering, w, h, 1.15, 0.1) },
    { frame: T.diomede + 30, cam: view(V.diomede, w, h, 1.0, 0.1) },
    { frame: T.y1741 - 10, cam: view(V.diomede, w, h, 1.0, 0.1) },
    { frame: T.y1741 + 30, cam: view(V1.voyage, w, h, 1.0, 0.1) },
    { frame: T.otter, cam: view(V1.voyage, w, h, 1.0, 0.1) },
    { frame: T.otter + 30, cam: view(V1.coast, w, h, 1.0, 0.1) },
    { frame: T.china - 6, cam: view(V1.coast, w, h, 1.0, 0.1) },
    { frame: T.china + 30, cam: view(V1.kyakhta, w, h, 1.0, 0.1) },
    { frame: T.rush, cam: view(V1.kyakhta, w, h, 1.0, 0.1) },
    { frame: T.rush + 30, cam: view(V.aleutians, w, h, 1.0, 0.1) },
    { frame: T.natives + 10, cam: view(V.aleutians, w, h, 1.0, 0.1) },
    { frame: T.tlingit + 20, cam: view(V1.coast, w, h, 0.9, 0.1) },
    { frame: T.company, cam: view(V1.coast, w, h, 0.9, 0.1) },
    { frame: T.company + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.sitka, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.sitka + 30, cam: view(V1.sitka, w, h, 1.0, 0.1) },
    { frame: T.ross, cam: view(V1.sitka, w, h, 1.0, 0.1) },
    { frame: T.ross + 40, cam: view(V1.toCal, w, h, 1.0, 0.1) },
    { frame: T.fort + 10, cam: view(V1.toCal, w, h, 1.0, 0.1) },
    { frame: T.ninety, cam: view(V.california, w, h, 1.0, 0.1) },
    { frame: T.few, cam: view(V.california, w, h, 1.0, 0.1) },
    { frame: T.few + 36, cam: view(V.alaska, w, h, 1.0, 0.1) },
  ],
  years: [[T.strait, "Today"], [T.y1741, "1741"], [T.rush, "1750s"], [T.company, "1799"], [T.sitka, "1830s"], [T.ross, "1812"], [T.few, "1860"]],
  heads: [
    head("strait", T.strait),
    head("strait", T.fifty, { stat: "~51 mi", label: "at the narrowest" }),
    head("diomede", T.diomede),
    head("bering", T.y1741, { color: GOLD }),
    head("otter", T.otter, { color: GOLD }),
    head("rush", T.rush),
    head("natives", T.natives),
    head("company", T.company, { color: GOLD }),
    head("sitka", T.sitka),
    head("sitka", T.thousand, { stat: "1,000+", label: "people by the 1830s" }),
    head("ross", T.ross),
    head("ross", T.ninety, { stat: "~90 mi", label: "north of San Francisco" }),
    head("few", T.few, { color: RUSSIA }),
    head("few", T.eight, { color: RUSSIA, stat: "~800", label: "Russians, at most" }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const both = show(frame, T.russia - 4, T.diomede + 10);
    const colony = show(frame, T.company - 4, to + 20);
    return (
      <g>
        <AreaTint f={russia} color={RUSSIA} k={both * 0.8} line={1.2} />
        <AreaTint f={alaska} color={REAL} k={both * 0.8} line={1.2} />
        <AreaTint f={alaska} color={RUSSIA} k={colony * 0.7} />
        {frame >= T.narrow && frame < T.diomede + 12 && <Route pts={[XY(P.capeDezhnev), XY(P.capePrince)]} start={T.narrow} len={24} end={T.diomede} color={GOLD} width={5} head={false} />}
        <MapText at={[-168.9, 66.2]} text="~51 mi" k={show(frame, T.fifty - 4, T.diomede + 4)} size={1.1} color={GOLD} />
        <Diomedes />
        <Pin at={XY(P.petropavlovsk)} text="Kamchatka" k={show(frame, T.y1741 + 10, T.otter)} color={GOLD} size={0.8} />
        <Route pts={BERING_1741} start={T.sailed - 6} len={40} end={T.otter + 10} color={GOLD} width={5} dash />
        <Pin at={[-144.4, 59.9]} text="Alaska, 1741" k={show(frame, T.reached, T.otter + 10)} color={GOLD} size={0.8} />
        <Route pts={[[-152, 58], [-170, 56], [170, 55], [150, 58], XY(P.kyakhta), XY(P.beijing)]} start={T.china - 2} len={36} end={T.rush + 10} color={GOLD} width={6} />
        <Pin at={XY(P.kyakhta)} text="Kyakhta" k={show(frame, T.china + 30, T.rush + 10)} color={GOLD} size={0.8} />
        <Pin at={XY(P.beijing)} text="China" k={show(frame, T.china + 34, T.rush + 10)} color={GOLD} size={0.8} />
        <Outposts />
        <MapText at={[-172, 55.2]} text="ALEUTIAN ISLANDS" k={show(frame, T.aleutian - 4, T.natives + 30)} size={0.8} />
        <MapText at={[-170, 54.5]} text="ALEUT" k={show(frame, T.aleut - 4, T.company)} size={0.9} color="#ffe0a8" />
        <MapText at={[-136.5, 58.6]} text="TLINGIT" k={show(frame, T.tlingit - 4, T.company)} size={0.9} color="#ffe0a8" />
        <Pin at={XY(P.sitka)} text="Sitka" k={show(frame, T.sitka - 4, T.ross + 40)} color={RUSSIA} size={0.9} />
        <Route pts={[XY(P.sitka), [-140, 52], [-130, 44], XY(P.fortRoss)]} start={T.california - 10} len={36} end={T.few + 10} color={RUSSIA} width={6} />
        <Pin at={XY(P.fortRoss)} text="Fort Ross" k={show(frame, T.fort - 4, T.few + 20)} color={RUSSIA} size={0.85} />
        <Pin at={XY(P.sanFrancisco)} text="San Francisco" k={show(frame, T.ninety - 4, T.few + 20)} color="#ffffff" size={0.7} dy={40} />
        {frame >= T.ninety && <Route pts={[XY(P.fortRoss), XY(P.sanFrancisco)]} start={T.ninety} len={20} end={T.few + 10} color={GOLD} width={4} dash head={false} />}
        <FewDots />
      </g>
    );
  },
  Panels: () => (
    <g>
      <StraitPanel start={T.strait} end={T.bering + 14} anchor={P.capePrince} />
      <UmiakPanel start={T.bering} end={T.diomede + 14} anchor={P.capePrince} />
      <DiomedePanel start={T.diomede} end={T.apart + 14} anchor={P.littleDiomede} />
      <DiomedePanel start={T.apart} end={T.y1741 + 14} anchor={P.littleDiomede} village />
      <FogShipPanel start={T.y1741} end={T.reached + 14} anchor={P.petropavlovsk} />
      <LandfallPanel start={T.reached} end={T.otter + 14} anchor={[-144.4, 59.9]} />
      <OtterPanel start={T.otter} end={T.china + 14} anchor={P.kodiak} />
      <MarketPanel start={T.china} end={T.rush + 14} anchor={P.kyakhta} />
      <QuayPanel start={T.rush} end={T.hunted + 14} anchor={P.unalaska} />
      <AleutianPanel start={T.hunted} end={T.natives + 14} anchor={P.unalaska} />
      <VillagePanel start={T.natives} end={T.forced + 14} anchor={P.unalaska} />
      <ForcedPanel start={T.forced} end={T.fought + 14} anchor={P.unalaska} />
      <StandoffPanel start={T.fought} end={T.company + 14} anchor={P.sitka} />
      <WarehousePanel start={T.company} end={T.monopoly + 14} anchor={P.sitka} />
      <FleetPanel start={T.monopoly} end={T.sitka + 14} anchor={P.sitka} />
      <SitkaTownPanel start={T.sitka} end={T.shipyard + 14} anchor={P.sitka} />
      <ShipyardPanel start={T.shipyard} end={T.ross + 14} anchor={P.sitka} blows={BLOWS} />
      <FortRossPanel start={T.ross} end={T.few + 14} anchor={P.fortRoss} />
      <EmptyPanel start={T.few} end={to + 14} anchor={P.fairbanks} />
    </g>
  ),
  sfx: [
    [T.strait - 4, SFX.whoosh, 0.3],
    [T.narrow, SFX.tick, 0.25],
    [T.fifty, SFX.pop, 0.3],
    [T.diomede + 4, SFX.whoosh, 0.3],
    [T.rus, SFX.pop, 0.28],
    [T.am, SFX.pop, 0.28],
    [T.three, SFX.pop, 0.3],
    [T.y1741 + 4, SFX.whoosh, 0.3],
    [T.china, SFX.whoosh, 0.3],
    [T.poured, SFX.tick, 0.25],
    [T.company, SFX.pop, 0.3],
    [T.sitka + 4, SFX.whoosh, 0.3],
    [T.thousand, SFX.pop, 0.28],
    [T.ross + 4, SFX.whoosh, 0.3],
    [T.ninety, SFX.pop, 0.28],
    [T.eight, SFX.hit, 0.35],
  ],
  Sound: () => (
    <>
      <Bed id="wind" from={T.strait} to={T.y1741 + 10} volume={0.22} voice={VOICE} />
      <Bed id="sea_rough" from={T.strait} to={T.y1741 + 10} volume={0.14} voice={VOICE} />
      <Bed id="ship_creak" from={T.y1741} to={T.otter + 10} volume={0.2} voice={VOICE} />
      <Bed id="sea_rough" from={T.otter} to={T.china + 8} volume={0.14} voice={VOICE} />
      <Bed id="city_crowd" from={T.china} to={T.rush + 10} volume={0.12} voice={VOICE} />
      <Bed id="ship_sailing" from={T.rush} to={T.natives + 10} volume={0.16} voice={VOICE} />
      <Bed id="wind" from={T.natives} to={T.company + 10} volume={0.18} voice={VOICE} />
      <Bed id="fire_crackle" from={T.company} to={T.monopoly + 10} volume={0.12} voice={VOICE} />
      <Bed id="sea_rough" from={T.monopoly} to={T.shipyard + 10} volume={0.12} voice={VOICE} />
      <Hit id="ship_bell" at={T.sitka + 8} volume={0.3} />
      {BLOWS.map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.22} />)}
      <Bed id="sea_rough" from={T.ross} to={T.few + 10} volume={0.14} voice={VOICE} />
      <Bed id="wind" from={T.few} to={to + 10} volume={0.22} voice={VOICE} />
    </>
  ),
};
