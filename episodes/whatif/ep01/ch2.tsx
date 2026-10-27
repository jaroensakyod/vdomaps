import { geoInterpolate } from "d3-geo";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cam } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, display, font, GOLD, Pin, view } from "../../worldhistory/kit/news";
import { alaska, canada, REAL, RUSSIA } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { AreaTint, MapText, Route, show } from "./mapkit";
import { P, V } from "./places";
import { BombardPanel, CivilWarPanel, CouncilPanel, CrimeaPanel, DryPanel, EmptySeaPanel, HandshakePanel, LookoutPanel, MarchPanel, RedcoatPanel, ScalePanel, SiberiaPanel, SquadronPanel, StormSeaPanel, VaultPanel } from "./scenes12";
import { B, CARD, span, VOICE, wf } from "./time";

// Chapter 2 "Why sell?" (why → civil): three reasons (otters gone, too far, Britain), the Crimean War and the raid on
// Kamchatka, the fear of losing Alaska for nothing, an empty treasury, the US as the enemy of Russia's enemy, and
// the Civil War that put the deal on hold.
const [from, to] = span("ch2");
const XY = (p: number[]) => p as [number, number];
const PINK = "#ff8fb3"; // Britain

const T = {
  why: B.why.start,
  three: wf("why", "Three", 0.7),
  r1: B.r1.start,
  money: wf("r1", "money", 0.6),
  r2: B.r2.start,
  pete: wf("r2", "Petersburg,", 0.42),
  siberia: wf("r2", "Siberia,", 0.6),
  alaska: wf("r2", "Alaska", 0.73),
  months: wf("r2", "months.", 0.9),
  r3: B.r3.start,
  britain: wf("r3", "Britain.", 0.8),
  crimea: B.crimea.start,
  war: wf("crimea", "war", 0.37),
  france: wf("crimea", "France", 0.58),
  crim: wf("crimea", "Crimea.", 0.65),
  lost: wf("crimea", "lost.", 0.83),
  petro: B.petro.start,
  fleet: wf("petro", "fleet", 0.28),
  kamchatka: wf("petro", "Kamchatka", 0.75),
  attacked: wf("petro", "attacked", 0.9),
  fear: B.fear.start,
  march: wf("fear", "march", 0.45),
  take: wf("fear", "take", 0.63),
  stop: wf("fear", "stop", 0.93),
  broke: B.money.start,
  might: wf("money", "might", 0.78),
  paid: wf("money", "paid.", 0.92),
  enemy: B.enemy.start,
  ofyour: wf("enemy", "enemy", 0.23),
  us: wf("enemy", "United", 0.56),
  grudges: wf("enemy", "grudges", 0.8),
  civil: B.civil.start,
  busy: wf("civil", "busy", 0.53),
  cwar: wf("civil", "Civil", 0.86),
};
const CRIMEA_SHOTS = [T.war, T.crim, T.lost - 6];
// Halfway point of a long camera move, zoomed out: flying across half the globe at regional zoom makes the
// satellite ground strobe (brightness jumps every frame), so long moves rise, cross, and come back down.
const mid = (a: Cam, b: Cam, k = 0.3): Cam => {
  const [lon, lat] = geoInterpolate([a.lon, a.lat], [b.lon, b.lat])(0.5);
  return { lon, lat, scale: Math.min(a.scale, b.scale) * k };
};

const PETRO_SHOTS = [T.attacked - 4, T.attacked + 14, T.attacked + 30, T.attacked + 48];
const CIVIL_SHOTS = [T.civil + 20, T.busy + 6, T.cwar];

// Three reason chips under the card: each lights up on its number, earlier ones dim.
const Reasons = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const items = [
    { at: T.r1, text: "Otters gone" },
    { at: T.r2, text: "Too far" },
    { at: T.r3, text: "Britain" },
  ];
  const o = interpolate(frame, [T.three - 6, T.three + 4, T.crimea - 10, T.crimea], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const active = items.reduce((k, it, i) => (frame >= it.at ? i : k), -1);
  return (
    <div style={{ position: "absolute", top: height * 0.29, left: 50 * s, right: 50 * s, display: "flex", gap: 16 * s, opacity: o, fontFamily: font }}>
      {items.map((it, i) => {
        const k = spring({ frame: frame - it.at, fps, config: { damping: 12 } });
        const on = frame >= it.at;
        return (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 * s, padding: `${10 * s}px ${16 * s}px`, borderRadius: 14 * s, background: on ? (i === active ? (i === 2 ? PINK : GOLD) : "rgba(8,14,26,0.7)") : "rgba(8,14,26,0.55)", border: `${2 * s}px solid rgba(255,255,255,0.3)`, color: on && i === active ? "#1b1d24" : "#fff", transform: `scale(${on ? 0.92 + 0.08 * k : 0.92})`, opacity: on ? 1 : 0.6 }}>
            <span style={{ fontFamily: display, fontSize: 52 * s, fontWeight: 700, lineHeight: 1 }}>{i + 1}</span>
            <span style={{ fontSize: 28 * s, fontWeight: 700, lineHeight: 1.1 }}>{on ? it.text : "?"}</span>
          </div>
        );
      })}
    </div>
  );
};

const V2 = {
  north: bbox([[100, 45], [-130, 72]]),
  pete: bbox([[22, 52], [42, 64]]),
  siberia: bbox([[40, 42], [160, 72]]),
  far: bbox([[140, 45], [-130, 70]]),
  canada: bbox([[-170, 45], [-100, 72]]),
  europe: bbox([[-10, 34], [42, 58]]),
  russiaW: bbox([[18, 46], [60, 66]]),
};
const head = (id: string, f: number, extra: { stat?: string; label?: string; color?: string } = {}) => ({ f, tag: CARD[id][0], head: CARD[id][1], color: REAL, ...extra });

// Union / Confederacy split line, very approximate (state borders along 36.5°N and the Ohio).
const SPLIT: [number, number][] = [[-106.5, 36.5], [-94.6, 36.5], [-89.5, 36.5], [-88.0, 37.0], [-84.8, 39.1], [-82.6, 38.4], [-80.5, 39.7], [-75.8, 39.7]];

export const ch2: Chapter = {
  name: "Why sell?",
  from,
  to,
  cams: (w, h) => [
    { frame: T.why + 10, cam: view(V2.north, w, h, 1.0, 0.1) },
    { frame: T.r1, cam: view(V2.north, w, h, 1.0, 0.1) },
    { frame: T.r1 + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.pete - 20, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.pete + 4, cam: view(V2.pete, w, h, 1.0, 0.1) },
    { frame: T.siberia + 10, cam: view(V2.siberia, w, h, 1.0, 0.1) },
    { frame: T.alaska + 10, cam: view(V2.far, w, h, 1.0, 0.1) },
    { frame: T.r3, cam: view(V2.far, w, h, 1.0, 0.1) },
    { frame: T.r3 + 30, cam: view(V2.canada, w, h, 1.0, 0.1) },
    { frame: T.crimea, cam: view(V2.canada, w, h, 1.0, 0.1) },
    { frame: T.crimea + 30, cam: view(V2.europe, w, h, 1.0, 0.1) },
    { frame: T.crim, cam: view(V2.europe, w, h, 1.0, 0.1) },
    { frame: T.crim + 30, cam: view(V.crimea, w, h, 1.0, 0.1) },
    { frame: T.petro, cam: view(V.crimea, w, h, 1.0, 0.1) },
    { frame: T.petro + 22, cam: mid(view(V.crimea, w, h, 1.0, 0.1), view(V.kamchatka, w, h, 1.0, 0.1)) },
    { frame: T.petro + 46, cam: view(V.kamchatka, w, h, 1.0, 0.1) },
    { frame: T.fear, cam: view(V.kamchatka, w, h, 1.0, 0.1) },
    { frame: T.fear + 20, cam: mid(view(V.kamchatka, w, h, 1.0, 0.1), view(V2.canada, w, h, 1.0, 0.1)) },
    { frame: T.fear + 42, cam: view(V2.canada, w, h, 1.0, 0.1) },
    { frame: T.broke, cam: view(V2.canada, w, h, 1.0, 0.1) },
    { frame: T.broke + 30, cam: view(V2.russiaW, w, h, 1.0, 0.1) },
    { frame: T.enemy, cam: view(V2.russiaW, w, h, 1.0, 0.1) },
    { frame: T.enemy + 34, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.civil, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.civil + 30, cam: view(V.usa, w, h, 1.0, 0.1) },
  ],
  years: [[T.why, "1850s"], [T.crimea, "1853"], [T.petro, "1854"], [T.fear, "1856"], [T.enemy, "1860"], [T.civil, "1861"]],
  heads: [
    head("why", T.why, { color: GOLD }),
    head("r1", T.r1, { color: GOLD }),
    head("r2", T.r2, { color: GOLD }),
    head("r3", T.r3, { color: PINK }),
    head("crimea", T.crimea, { color: PINK }),
    head("petro", T.petro, { color: PINK }),
    head("fear", T.fear, { color: RUSSIA }),
    head("money", T.broke, { color: GOLD }),
    head("enemy", T.enemy),
    head("civil", T.civil),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const pulse = frame >= T.take && frame < T.broke ? 0.65 + 0.25 * Math.sin((frame - T.take) * 0.12) : 0.7;
    const uk = Math.max(show(frame, T.britain - 4, T.crimea + 20), show(frame, T.fear + 20, T.broke + 20));
    return (
      <g>
        <AreaTint f={alaska} color={RUSSIA} k={show(frame, from - 10, to + 20, 20) * pulse} />
        <AreaTint f={canada} color={PINK} k={uk * 0.75} />
        <MapText at={[-105, 60]} text="BRITISH NORTH AMERICA" k={uk} size={0.8} color="#ffd6e4" />
        <Route pts={[XY(P.stPetersburg), XY(P.moscow), [60, 57], [90, 56], XY(P.yakutsk), XY(P.okhotsk), [160, 57], [-170, 57], XY(P.sitka)]} start={T.pete - 4} len={T.months - T.pete + 6} end={T.r3 + 10} color={GOLD} width={6} />
        <Pin at={XY(P.stPetersburg)} text="St. Petersburg" k={show(frame, T.pete - 4, T.siberia + 10)} color={GOLD} size={0.8} />
        <Pin at={XY(P.sitka)} text="Sitka" k={show(frame, T.alaska, T.r3 + 10)} color={RUSSIA} size={0.8} />
        <Route pts={[XY(P.london), [-9.5, 43], [-5.6, 36], [14.5, 35.9], [26.4, 40.2], [29, 41.2], XY(P.sevastopol)]} start={T.war - 6} len={40} end={T.petro} color={PINK} width={6} />
        <Route pts={[XY(P.paris), [5.4, 43.3], [14.5, 35.9], [26.4, 40.2], [29, 41.2], XY(P.sevastopol)]} start={T.france - 6} len={36} end={T.petro} color="#8fb0ff" width={6} />
        <Pin at={XY(P.london)} text="Britain" k={show(frame, T.war - 2, T.crim + 20)} color={PINK} size={0.8} />
        <Pin at={XY(P.paris)} text="France" k={show(frame, T.france - 2, T.crim + 20)} color="#8fb0ff" size={0.8} dy={40} />
        <Pin at={XY(P.sevastopol)} text="Crimea" k={show(frame, T.crim - 2, T.petro)} color={RUSSIA} size={0.9} />
        <Route pts={[[166, 40], [163, 47], [159.6, 52.4], XY(P.petropavlovsk)]} start={T.fleet} len={40} end={T.fear} color={PINK} width={6} />
        <Pin at={XY(P.petropavlovsk)} text="Petropavlovsk" k={show(frame, T.kamchatka - 4, T.fear + 10)} color={RUSSIA} size={0.8} />
        <Route pts={[XY(P.victoria), [-128, 52], [-132, 55], XY(P.sitka)]} start={T.march - 4} len={30} end={T.broke + 10} color={PINK} width={6} dash />
        <MapText at={[-150, 64]} text="?" k={show(frame, T.stop - 4, T.broke + 10)} size={2.4} color={RUSSIA} />
        <Pin at={XY(P.stPetersburg)} text="St. Petersburg" k={show(frame, T.broke + 26, T.enemy + 20)} color={GOLD} size={0.8} />
        <Route pts={[XY(P.washington), [-100, 52], [-125, 57], XY(P.sitka)]} start={T.us - 4} len={34} end={T.civil + 10} color={REAL} width={6} />
        <Pin at={XY(P.washington)} text="Washington" k={show(frame, T.us - 4, T.civil + 20)} color={REAL} size={0.8} />
        <Route pts={SPLIT} start={T.civil + 26} len={24} end={to + 10} color="#e6e6e6" width={4} dash head={false} />
        <MapText at={[-92, 43]} text="UNION" k={show(frame, T.busy - 4, to + 10)} size={1} color="#9cc4ff" />
        <MapText at={[-88, 32.5]} text="CONFEDERACY" k={show(frame, T.busy + 4, to + 10)} size={0.9} color="#c8c8c8" />
      </g>
    );
  },
  Panels: () => (
    <g>
      <CouncilPanel start={T.why} end={T.r1 + 14} anchor={P.stPetersburg} />
      <EmptySeaPanel start={T.r1} end={T.money + 14} anchor={P.kodiak} />
      <DryPanel start={T.money} end={T.r2 + 14} anchor={P.sitka} />
      <SiberiaPanel start={T.r2} end={T.alaska + 14} anchor={P.yakutsk} />
      <StormSeaPanel start={T.alaska} end={T.r3 + 14} anchor={P.okhotsk} />
      <RedcoatPanel start={T.r3} end={T.crimea + 14} anchor={P.victoria} />
      <CrimeaPanel start={T.crimea} end={T.petro + 14} anchor={P.sevastopol} shots={CRIMEA_SHOTS} />
      <SquadronPanel start={T.petro} end={T.attacked + 14} anchor={P.petropavlovsk} />
      <BombardPanel start={T.attacked} end={T.fear + 14} anchor={P.petropavlovsk} shots={PETRO_SHOTS} />
      <LookoutPanel start={T.fear} end={T.march + 14} anchor={P.sitka} />
      <MarchPanel start={T.march} end={T.broke + 14} anchor={P.victoria} />
      <VaultPanel start={T.broke} end={T.might + 14} anchor={P.stPetersburg} />
      <ScalePanel start={T.might} end={T.enemy + 14} anchor={P.stPetersburg} />
      <HandshakePanel start={T.enemy} end={T.civil + 14} anchor={P.washington} />
      <CivilWarPanel start={T.civil} end={to + 14} anchor={P.washington} shots={CIVIL_SHOTS} />
    </g>
  ),
  Screen: () => <Reasons />,
  sfx: [
    [T.three, SFX.pop, 0.3],
    [T.r1, SFX.pop, 0.3],
    [T.r2, SFX.pop, 0.3],
    [T.pete - 6, SFX.whoosh, 0.3],
    [T.alaska, SFX.whoosh, 0.3],
    [T.r3, SFX.pop, 0.3],
    [T.britain, SFX.hit, 0.4],
    [T.crimea + 24, SFX.whoosh, 0.3],
    [T.petro + 28, SFX.whoosh, 0.3],
    [T.fear + 28, SFX.whoosh, 0.3],
    [T.months, SFX.tick, 0.25],
    [T.broke + 24, SFX.whoosh, 0.25],
    [T.paid, SFX.tick, 0.3],
    [T.us, SFX.pop, 0.3],
    [T.enemy + 28, SFX.whoosh, 0.3],
    [T.civil + 24, SFX.whoosh, 0.3],
  ],
  Sound: () => (
    <>
      <Bed id="fire_crackle" from={T.why} to={T.r1 + 10} volume={0.12} voice={VOICE} />
      <Bed id="sea_rough" from={T.r1} to={T.money + 10} volume={0.14} voice={VOICE} />
      <Bed id="wind_storm" from={T.r2} to={T.alaska + 10} volume={0.14} voice={VOICE} />
      <Bed id="storm" from={T.alaska} to={T.r3 + 10} volume={0.16} voice={VOICE} />
      <Hit id="war_drums" at={T.britain} volume={0.25} />
      {CRIMEA_SHOTS.map((f) => <Hit key={f} id="cannon_far" at={f + 2} volume={0.32} />)}
      <Bed id="ship_sailing" from={T.petro} to={T.attacked + 10} volume={0.16} voice={VOICE} />
      {PETRO_SHOTS.map((f) => <Hit key={f} id="cannon_old" at={f + 2} volume={0.3} />)}
      <Bed id="wind" from={T.fear} to={T.march + 10} volume={0.18} voice={VOICE} />
      <Bed id="army_marching" from={T.march} to={T.broke + 10} volume={0.18} voice={VOICE} />
      <Bed id="fire_crackle" from={T.broke} to={T.enemy + 10} volume={0.1} voice={VOICE} />
      <Bed id="city_crowd" from={T.enemy} to={T.civil + 10} volume={0.08} voice={VOICE} />
      <Bed id="explosions_distant" from={T.civil} to={to + 10} volume={0.12} voice={VOICE} />
      {CIVIL_SHOTS.map((f) => <Hit key={f} id="cannon_far" at={f + 2} volume={0.28} />)}
    </>
  ),
};
