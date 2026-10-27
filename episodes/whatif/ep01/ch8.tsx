import { geoMercator, geoPath } from "d3-geo";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bbox } from "../../../components/Region";
import { Bed, Hit, SFX } from "../../../components/Sound";
import { clamp, display, font, GOLD, PANEL_TOP, Pin, view } from "../../worldhistory/kit/news";
import { alaska, canada, REAL, RUSSIA, WHATIF } from "../kit/WhatIf";
import type { Chapter } from "./chapter";
import { wound } from "./geo78";
import { AreaTint, Route, show } from "./mapkit";
import { P, V } from "./places";
import { LeavingPanel, LighthousePanel, NewOrleansPanel, PalacePanel, PanningPanel, ScalePanel } from "./scenes78";
import { B, BEATS, span, VOICE, wf } from "./time";

// Chapter 8 "The answer" (back → next): back to the real world, why Russia sold, what America got, the two
// endings side by side, the comment question, and the next episode (Louisiana). Ends on a 1.5 s hold.
const [from, to] = span("ch8");

const T = {
  back: B.back.start,
  ans1: B.ans1.start,
  keep: wf("ans1", "keep", 0.25),
  better: wf("ans1", "Better", 0.42),
  britain: wf("ans1", "Britain", 0.55),
  time: wf("ans1", "time,", 0.8),
  ans2: B.ans2.start,
  gold: wf("ans2", "gold", 0.2),
  oil: wf("ans2", "oil.", 0.3),
  door: wf("ans2", "door", 0.5),
  pacific: wf("ans2", "Pacific", 0.7),
  arctic: wf("ans2", "Arctic.", 0.95),
  ans3: B.ans3.start,
  likely: wf("ans3", "likely", 0.15),
  scary: wf("ans3", "scary", 0.6),
  comment: B.comment.start,
  tell: wf("comment", "Tell", 0.86),
  next: B.next.start,
  napoleon: wf("next", "Napoleon", 0.2),
  louisiana: wf("next", "Louisiana,", 0.45),
  half: wf("next", "half", 0.7),
};
const LAST = BEATS[BEATS.length - 1].end;

const FRENCH = "#3f6fd8";
const PINK = "#ff8fc8";
const pt = (p: readonly number[]) => p as [number, number];

// The Louisiana Purchase (1803), approximate: the Mississippi on the east, the 49th parallel on the north,
// the Rockies' divide on the west, the Red and Arkansas rivers on the south.
const LOUISIANA = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      wound([
        [-89.6, 29.2], [-91.2, 31.0], [-91.1, 33.0], [-90.2, 35.0], [-89.5, 36.5], [-90.2, 38.6], [-91.4, 40.4], [-91.2, 43.0], [-92.8, 45.0], [-93.3, 46.5], [-95.2, 47.2],
        [-95.2, 49.0], [-104, 49.0], [-113, 49.0], [-112, 46.0], [-110.5, 44.5], [-109, 42.5], [-106.5, 40.5], [-105.5, 38.0], [-103, 37.0],
        [-100, 36.5], [-100, 34.5], [-94, 33.5], [-94, 31.0], [-93.7, 29.7], [-91, 29.2], [-89.6, 29.2],
      ]),
    ],
  },
};

const VP = {
  pacific: bbox([[-178, 30], [-120, 76]]),
};

// ans3: the two endings side by side, each a small map card (A: Canadian Alaska, B: Soviet Alaska).
const MINI = bbox([[-172, 51], [-118, 72]]);
const EndingCard = ({ x, w, h, s, k, title, sub, color, mode }: { x: number; w: number; h: number; s: number; k: number; title: string; sub: string; color: string; mode: "A" | "B" }) => {
  const proj = geoMercator().fitExtent([[10 * s, 60 * s], [w - 10 * s, h - 70 * s]], MINI);
  const path = geoPath(proj);
  return (
    <div style={{ position: "absolute", left: x, width: w, height: h, transform: `scale(${0.85 + 0.15 * k})`, opacity: k, background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${color}`, borderRadius: 18 * s, overflow: "hidden", fontFamily: font, color: "#fff" }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id={`mini${mode}`}><rect x={6 * s} y={56 * s} width={w - 12 * s} height={h - 120 * s} rx={10 * s} /></clipPath>
        </defs>
        <g clipPath={`url(#mini${mode})`}>
          <rect x={0} y={0} width={w} height={h} fill="#0d1b2a" />
          <path d={path(canada) ?? ""} fill={mode === "A" ? PINK : "#3a4250"} fillOpacity={mode === "A" ? 0.55 : 0.8} stroke="#fff" strokeOpacity={0.5} strokeWidth={1 * s} />
          <path d={path(alaska) ?? ""} fill={mode === "A" ? PINK : RUSSIA} fillOpacity={0.85} stroke="#fff" strokeWidth={1.4 * s} />
          {mode === "B" && (() => {
            const c = proj([-152, 64]);
            if (!c) return null;
            const r = 22 * s;
            const star = Array.from({ length: 10 }, (_, i) => {
              const a = -Math.PI / 2 + (i * Math.PI) / 5;
              const rr = i % 2 ? r * 0.42 : r;
              return `${c[0] + Math.cos(a) * rr},${c[1] + Math.sin(a) * rr}`;
            }).join(" L");
            return <path d={`M${star} Z`} fill={GOLD} stroke="#111" strokeWidth={1 * s} />;
          })()}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 18 * s, top: 10 * s, fontFamily: display, fontWeight: 700, fontSize: 34 * s, color }}>{title}</div>
      <div style={{ position: "absolute", left: 18 * s, bottom: 12 * s, fontFamily: display, fontWeight: 700, fontSize: 36 * s, textTransform: "uppercase" }}>{sub}</div>
    </div>
  );
};

const Endings = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.likely - 2 || frame > T.comment + 14) return null;
  const out = interpolate(frame, [T.comment, T.comment + 14], [1, 0], clamp);
  const a = spring({ frame: frame - T.likely, fps, config: { damping: 14 } }) * out;
  const b = frame < T.scary ? 0 : spring({ frame: frame - T.scary, fps, config: { damping: 14 } }) * out;
  const w = (width - 130 * s) / 2;
  const h = 350 * s;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * PANEL_TOP, height: h }}>
      <EndingCard x={50 * s} w={w} h={h} s={s} k={a} title="PATH A · LIKELY" sub="Canadian Alaska" color={PINK} mode="A" />
      <EndingCard x={80 * s + w} w={w} h={h} s={s} k={b} title="PATH B · SCARY" sub="Soviet Alaska" color={RUSSIA} mode="B" />
    </div>
  );
};

export const ch8: Chapter = {
  name: "The answer",
  from,
  to,
  cams: (w, h) => [
    { frame: T.back, cam: view(V.america, w, h, 1.0, 0.1) },
    { frame: T.back + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.britain - 6, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.britain + 30, cam: view(V.canada1860, w, h, 0.9, 0.1) },
    { frame: T.ans2, cam: view(V.canada1860, w, h, 0.9, 0.1) },
    { frame: T.ans2 + 30, cam: view(VP.pacific, w, h, 1.0, 0.1) },
    { frame: T.ans3, cam: view(VP.pacific, w, h, 1.0, 0.1) },
    { frame: T.ans3 + 30, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.next - 6, cam: view(V.alaska, w, h, 1.0, 0.1) },
    { frame: T.next + 36, cam: view(V.usa, w, h, 1.0, 0.1) },
    { frame: to, cam: view(V.usa, w, h, 0.97, 0.1) },
  ],
  years: [[T.back, "2026"], [T.ans1, "1867"], [T.ans2, "Today"], [T.comment, "1867"], [T.next, "1803"]],
  heads: [
    { f: T.back, tag: "Back to reality", head: "The real world", color: REAL },
    { f: T.ans1, tag: "Why sell?", head: "Better paid than lost", color: REAL, portrait: "whatif/alexander2", chips: [{ text: "Otters gone", f: T.keep }, { text: "Months away", f: T.better }, { text: "Britain next door", f: T.britain }] },
    { f: T.ans2, tag: "What America got", head: "Pacific + Arctic", color: GOLD, chips: [{ text: "Gold", f: T.gold }, { text: "Oil", f: T.oil }, { text: "Pacific", f: T.pacific }, { text: "Arctic", f: T.arctic }] },
    { f: T.ans3, tag: "Without the deal", head: "Canada or the Soviets", color: WHATIF },
    { f: T.comment, tag: "You're the Tsar", head: "Sell or keep?", color: GOLD, portrait: "whatif/alexander2", chips: [{ text: "Tell us in the comments", f: T.tell }] },
    { f: T.next, tag: "Next episode", head: "What if Louisiana stayed French?", color: FRENCH, chips: [{ text: "NEXT", f: T.next + 6 }] },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    if (frame < from) return null;
    const pink = show(frame, T.likely, T.scary + 4);
    const red = show(frame, T.scary, T.comment + 6);
    return (
      <g>
        <AreaTint f={alaska} color={REAL} k={show(frame, from, to + 40) * (1 - Math.max(pink, red))} />
        <AreaTint f={alaska} color={PINK} k={pink} />
        <AreaTint f={alaska} color={RUSSIA} k={red} />
        {/* ans1: British Canada next door */}
        <AreaTint f={canada} color={PINK} k={show(frame, T.britain, T.ans2 + 10) * 0.8} line={1.2} fill={0.25} />
        {/* ans2: gold, then the two doors */}
        <Pin at={pt(P.dawson)} text="Klondike" k={show(frame, T.gold, T.door)} color={GOLD} size={0.75} />
        <Pin at={pt(P.prudhoe)} text="Prudhoe Bay" k={show(frame, T.oil, T.door)} color={GOLD} size={0.75} />
        <Route pts={[[-152, 57], [-162, 46], [-170, 34]]} start={T.pacific - 4} len={26} end={T.ans3 + 10} color={REAL} width={8} />
        <Route pts={[[-150, 70.5], [-150, 78], [-150, 86]]} start={T.arctic - 6} len={22} end={T.ans3 + 10} color="#bfe6ff" width={8} />
        {/* next: the Louisiana Purchase, approximate */}
        <AreaTint f={LOUISIANA} color={FRENCH} k={show(frame, T.louisiana, to + 40)} fill={0.45} />
        <Pin at={pt(P.newOrleans)} text="New Orleans" k={show(frame, T.napoleon, to + 40)} color={FRENCH} size={0.8} />
      </g>
    );
  },
  Panels: () => (
    <g>
      <PalacePanel start={T.back} end={T.time + 14} />
      <LeavingPanel start={T.time} end={T.ans2 + 14} />
      <PanningPanel start={T.ans2} end={T.door + 14} />
      <LighthousePanel start={T.door} end={T.likely + 14} />
      <ScalePanel start={T.comment} end={T.next + 14} />
      <NewOrleansPanel start={T.next} end={to + 40} />
    </g>
  ),
  Screen: () => <Endings />,
  sfx: [
    [T.back - 2, SFX.whoosh, 0.3],
    [T.keep, SFX.pop, 0.25],
    [T.better, SFX.pop, 0.25],
    [T.britain, SFX.pop, 0.25],
    [T.ans2 + 2, SFX.whoosh, 0.3],
    [T.pacific - 4, SFX.whoosh, 0.25],
    [T.arctic - 6, SFX.whoosh, 0.25],
    [T.likely, SFX.pop, 0.3],
    [T.scary, SFX.hit, 0.4],
    [T.tell, SFX.pop, 0.3],
    [T.next - 4, SFX.whoosh, 0.3],
    [T.louisiana, SFX.hit, 0.35],
    [LAST + 6, SFX.swell, 0.25],
  ],
  Sound: () => (
    <>
      <Bed id="wind" from={T.back} to={T.time + 10} volume={0.16} voice={VOICE} />
      <Hit id="church_bell" at={T.ans1 + 4} volume={0.22} />
      <Bed id="sea_rough" from={T.time} to={T.ans2 + 10} volume={0.14} voice={VOICE} />
      <Hit id="ship_bell" at={T.time + 10} volume={0.22} />
      <Bed id="wind" from={T.ans2} to={T.door + 10} volume={0.12} voice={VOICE} />
      <Bed id="ship_creak" from={T.door} to={T.ans3 + 20} volume={0.12} voice={VOICE} />
      <Bed id="fire_crackle" from={T.comment} to={T.next + 10} volume={0.12} voice={VOICE} />
      <Bed id="city_crowd" from={T.next} to={to + 20} volume={0.1} voice={VOICE} />
    </>
  ),
};
