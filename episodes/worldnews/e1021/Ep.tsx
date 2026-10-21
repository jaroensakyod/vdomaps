import { geoInterpolate } from "d3-geo";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, globeCam, type Cam, type CamKey } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { countries, country } from "../../../components/data";
import { LOOKS, Person } from "../../../components/Figures";
import { Street, type InsetGeom } from "../../../components/Inset";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, Sphere, useMap } from "../../../components/Map";
import { Airliner, Fire, InfoChip, Smoke } from "../../../components/Props";
import { Raster } from "../../../components/Raster";
import { Route } from "../../../components/Route";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, FloodLayer, font, GOLD, HeadCard, Panel, RED, type Head } from "../../thaihistory/news/kit";
import {
  age, BlackoutCity, Car, clamp, Courthouse, Ferry, Fighter, Forest, Helicopter, Hemicycle, Lectern, MineHill, OfficeFront, Palm,
  PoliceCar, PowerPlant, Pylon, Rain, ramp, RescueBoat, Rescuer, Searcher, Spiral, Suv, Table, Tug, Waves,
} from "./Art";
import beatsText from "./beats.json";
import timing from "./timing.json";

// แผนที่ข่าวโลก · พุธ 21 ต.ค. 2569 — house standard: satellite base, a new picture every 3–4 s on the spoken word,
// panels overlap 14 frames, hook shock line at frame 0. All insets are labelled "ภาพประกอบ" (illustration).
const LAYOUT = { lead: 0, gap: 10, tail: 30 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const E1021_FRAMES = totalFrames(BEATS, LAYOUT);
const EDITION = { title: "แผนที่ข่าวโลก", date: "พุธ 21 ต.ค. 2569" };

// Frame where `word` is spoken in beat `id` (n-th match; Whisper splits Thai words, so tokens are joined). Fallback: share k.
const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const ws = (b.words ?? []) as { w: string; s: number }[];
  let seen = 0;
  for (let i = 0; i < ws.length; i++) {
    let acc = "";
    for (let j = i; j < ws.length && acc.length < word.length; j++) acc += ws[j].w;
    if (acc.startsWith(word) && seen++ === n) return Math.round(b.start + ws[i].s * 30);
  }
  return Math.round(b.start + b.len * k);
};
const endOf = (id: string) => B[id].end + LAYOUT.gap;
const O = 14; // panel overlap

type LL = [number, number];
const PL = {
  wang: [146.3125, -36.358] as LL,
  kyiv: [30.5234, 50.4501] as LL,
  spb: [30.3351, 59.9343] as LL,
  oslo: [10.7522, 59.9139] as LL,
  taipei: [121.565, 25.033] as LL,
  ishigaki: [124.156, 24.344] as LL,
  valencia: [-0.3763, 39.4699] as LL,
  oliva: [-0.1197, 38.9196] as LL,
  nancy: [6.1844, 48.6921] as LL,
  merak: [105.997, -5.93] as LL,
  bucharest: [26.1025, 44.4268] as LL,
  narino: [-77.68, 2.45] as LL,
};
// Regions Ukrenergo listed with new outages on 20 Oct (regional centres).
const OUTAGES: LL[] = [[24.03, 49.84], [26.25, 50.62], [25.59, 49.55], [26.99, 49.42], [28.66, 50.25], [31.29, 51.49], [34.8, 50.91], [36.23, 49.99], [37.56, 48.72], [35.14, 47.84], [32.26, 48.51], [30.72, 46.48]];
// Champi forecast track — approximate, from JMA/CWA descriptions (past Sakishima, then north-east).
const TRACK: LL[] = [[131, 18.5], [127.5, 21.5], [124.6, 24.2], [125.5, 27], [128, 29.5]];

type Story = { id: string; ids: string[]; name: string; focus: LL; zoom: number; pins: { at: LL; label: string; word: string }[] };
const STORIES: Story[] = [
  { id: "australia", ids: ["036"], name: "ออสเตรเลีย", focus: [145.5, -36.5], zoom: 6, pins: [{ at: PL.wang, label: "วังการัตตา", word: "หน้า" }] },
  { id: "ukraine", ids: ["804"], name: "ยูเครน", focus: [24, 53.5], zoom: 2.5, pins: [{ at: PL.spb, label: "เซนต์ปีเตอร์สเบิร์ก", word: "เซนต์" }, { at: PL.oslo, label: "ออสโล", word: "ออสโล" }] },
  { id: "typhoon", ids: ["158", "392"], name: "ไต้หวัน · ญี่ปุ่น", focus: [126, 24], zoom: 3.6, pins: [{ at: PL.ishigaki, label: "ซากิชิมะ", word: "หมู่" }] },
  { id: "spain", ids: ["724"], name: "สเปน", focus: [-1.5, 39.5], zoom: 6, pins: [{ at: PL.valencia, label: "บาเลนเซีย", word: "ฝั่ง" }] },
  { id: "france", ids: ["250"], name: "ฝรั่งเศส", focus: [4.5, 47.5], zoom: 6, pins: [{ at: PL.nancy, label: "น็องซี", word: "ใกล้" }] },
  { id: "indonesia", ids: ["360"], name: "อินโดนีเซีย", focus: [108, -6.5], zoom: 6, pins: [{ at: PL.merak, label: "ท่าเรือเมรัก", word: "ใกล้" }] },
  { id: "romania", ids: ["642"], name: "โรมาเนีย", focus: [25, 45.8], zoom: 7, pins: [{ at: PL.bucharest, label: "บูคาเรสต์", word: "สภา" }] },
  { id: "colombia", ids: ["170"], name: "โคลอมเบีย", focus: [-75, 4], zoom: 4.5, pins: [{ at: PL.narino, label: "นาริโญ (โดยประมาณ)", word: "นา" }] },
];

/* ---------------- map layers ---------------- */
const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.9 * s} />;
};

const Highlight = ({ ids, opacity }: { ids: string[]; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {ids.map((id) => {
        const d = path(country(id)) ?? "";
        return (
          <g key={id}>
            <path d={d} fill={RED} fillOpacity={0.28} />
            <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
            <path d={d} fill="none" stroke="#ff8a80" strokeWidth={2.5 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Ukraine: 12 regional centres, lit, then going dark one by one.
const Outages = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const on = B.ukraine.start + 20;
  const dark = wf("ukraine", "ไฟดับ");
  if (frame < on || frame > endOf("ukraine")) return null;
  return (
    <g>
      {OUTAGES.map((c, i) => {
        const p = projection(c);
        if (!p) return null;
        const off = frame >= dark + i * 3;
        return (
          <g key={i}>
            {!off && <circle cx={p[0]} cy={p[1]} r={20 * s} fill="#ffd56b" opacity={0.35} />}
            <circle cx={p[0]} cy={p[1]} r={8 * s} fill={off ? "#1b1f27" : "#ffd56b"} stroke={off ? "#ff6b5f" : "#fff"} strokeWidth={2.4 * s} />
          </g>
        );
      })}
    </g>
  );
};

// Typhoon spiral riding the (approximate) forecast track, with a dashed track line.
const Typhoon = () => {
  const frame = useCurrentFrame();
  const { projection, path, s } = useMap();
  const a = B.typhoon.start + 10;
  const z = endOf("typhoon");
  if (frame < a || frame > z + 10) return null;
  const k = ramp(frame, a, a + 20) * interpolate(frame, [z - 6, z + 10], [1, 0], clamp);
  const t = ramp(frame, wf("typhoon", "คาด"), z, Easing.inOut(Easing.quad)) * 0.5;
  const seg = t * (TRACK.length - 1);
  const i = Math.min(TRACK.length - 2, Math.floor(seg));
  const pos = geoInterpolate(TRACK[i], TRACK[i + 1])(seg - i) as LL;
  const p = projection(pos);
  const trackK = ramp(frame, wf("typhoon", "คาด"), wf("typhoon", "คาด") + 30);
  const label = projection(TRACK[3]);
  return (
    <g opacity={k}>
      {trackK > 0 && (
        <>
          <path d={path({ type: "LineString", coordinates: TRACK }) ?? ""} fill="none" stroke={GOLD} strokeWidth={4 * s} strokeDasharray={`${14 * s} ${10 * s}`} opacity={trackK} />
          {label && (
            <text x={label[0] + 18 * s} y={label[1]} fontSize={30 * s} fontWeight={700} fill="#fff" stroke="#0b1426" strokeWidth={6 * s} paintOrder="stroke" fontFamily={font} opacity={trackK}>
              เส้นทางคาดการณ์ (โดยประมาณ)
            </text>
          )}
        </>
      )}
      {p && <Spiral x={p[0]} y={p[1]} r={110 * s} k={1} frame={frame} />}
    </g>
  );
};

// Intro: one pulsing dot per story on the globe, popping in on "แปด".
const StoryDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = wf("intro", "แปด");
  if (frame < a || frame > B.australia.start + 20) return null;
  return (
    <g>
      {STORIES.map((st, i) => {
        const p = projection(st.pins[0].at);
        const k = age(frame, a + i * 3, 8);
        if (!p || k <= 0) return null;
        const pulse = ((frame - a) % 30) / 30;
        return (
          <g key={st.id}>
            <circle cx={p[0]} cy={p[1]} r={(10 + pulse * 24) * s} fill="none" stroke={RED} strokeWidth={3 * s} opacity={1 - pulse} />
            <circle cx={p[0]} cy={p[1]} r={9 * s * k} fill={RED} stroke="#fff" strokeWidth={2.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------------- illustration panels ---------------- */
// Chain of panels: cue frames → [start, end] with the 14-frame overlap.
const chain = (cues: number[], end: number) => cues.map((c, i) => [c, i + 1 < cues.length ? cues[i + 1] + O : end] as const);
// Info chip in the top-right corner of a panel (the top-left holds the "ภาพประกอบ" tag).
const Chip = ({ g, label: l, value, color }: { g: InsetGeom; label: string; value: string; font?: string; color?: string }) => {
  const sc = g.sc * 0.9;
  const w = Math.max(150, value.length * 17 + 30) * sc;
  return <InfoChip x={g.x + g.W - w - 20 * g.s} y={g.y + 20 * g.s + 56 * sc} scale={sc} label={l} value={value} font={font} color={color} />;
};
const label = (g: InsetGeom, text: string, y = 76) => (
  <text x={g.cx} y={g.y + y * g.s} textAnchor="middle" fontSize={28 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>
    {text}
  </text>
);
const Flash = ({ g, at }: { g: InsetGeom; at: number }) => {
  const k = age(g.frame, at, 8);
  return k > 0 && k < 1 ? <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#fff" opacity={0.6 * (1 - k)} /> : null;
};

// Hook + Australia: the 4WD rams the office front (the MP is not drawn), reverses, rams again.
const Ram = ({ g, hits }: { g: InsetGeom; hits: number[] }) => {
  const office = g.x + 40 * g.s;
  const stop = office + 330 * g.s;
  let carX = g.x + g.W + 120 * g.s;
  const f = g.frame;
  // drive in to the first hit, back off, second hit
  if (f < hits[0]) carX = stop + (g.x + g.W + 120 * g.s - stop) * (1 - ramp(f, hits[0] < 60 ? -40 : hits[0] - 22, hits[0], Easing.in(Easing.quad)));
  else if (hits[1] === undefined || f < hits[1] - 26) carX = stop + 140 * g.s * ramp(f, hits[0] + 4, hits[0] + 22);
  else carX = stop + 140 * g.s * (1 - ramp(f, hits[1] - 14, hits[1], Easing.in(Easing.quad)));
  return (
    <>
      <Street g={g} />
      <OfficeFront x={office} y={g.ground - 10 * g.s} w={300 * g.s} s={g.s} sign="สำนักงาน ส.ส." font={font} />
      <Car x={office + 400 * g.s} y={g.ground + 40 * g.s} scale={g.sc * 0.9} color="#5b7fb5" />
      <Suv x={carX} y={g.ground + 44 * g.s} scale={g.sc} color="#e8e4dc" lights={1} />
      {hits.map((h) => (
        <Flash key={h} g={g} at={h} />
      ))}
    </>
  );
};

const AustraliaPanels = () => {
  const ram2 = wf("australia", "ซ้ำ");
  const [a, b, c] = chain([B.australia.start + 24, wf("australia", "ตำรวจ"), wf("australia", "นายก")], endOf("australia"));
  return (
    <>
      <Panel id="au-hook" anchor={PL.wang} start={-12} end={B.hook.end + O} sky={["#0d1b2a", "#415a77"]}>
        {(g) => <Ram g={g} hits={[wf("hook", "ชน")]} />}
      </Panel>
      <Panel id="au-ram" anchor={PL.wang} start={a[0]} end={a[1]} sky={["#7fb7d9", "#f4e9d8"]}>
        {(g) => (
          <>
            <Ram g={g} hits={[a[0] + 26, ram2]} />
            {g.frame > ram2 && <Chip g={g} label="วังการัตตา รัฐวิกตอเรีย" value="ชนซ้ำ 2 ครั้ง" font={font} />}
          </>
        )}
      </Panel>
      <Panel id="au-court" anchor={PL.wang} start={b[0]} end={b[1]} sky={["#9cc5e0", "#eef3f6"]}>
        {(g) => (
          <>
            <Street g={g} color="#6b6f76" marks={false} />
            <Courthouse x={g.x + g.W * 0.68} y={g.ground - 10 * g.s} s={g.s} font={font} label="ศาล" />
            <PoliceCar x={g.x + g.W * 0.22} y={g.ground + 40 * g.s} scale={g.sc} frame={g.frame} />
            {g.frame > wf("australia", "ชาย") && <Chip g={g} label="ผู้ต้องหา" value="ชายวัย 43 ปี · 5 ข้อหา" font={font} />}
          </>
        )}
      </Panel>
      <Panel id="au-pm" anchor={PL.wang} start={c[0]} end={c[1]} sky={["#2b3a55", "#5c6f91"]}>
        {(g) => (
          <>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a22" />
            <Person x={g.cx} y={g.ground - 30 * g.s} scale={g.sc * 1.1} look={LOOKS[3]} outfit="suit" pose="stand" />
            <Lectern x={g.cx} y={g.ground} scale={g.sc} />
            {g.frame > wf("australia", "ระบุ") && label(g, "นายกฯ อัลบานีซี: “เป็นการจงใจ”")}
          </>
        )}
      </Panel>
    </>
  );
};

const UkrainePanels = () => {
  const blast = wf("ukraine", "ถล่ม");
  const dark = wf("ukraine", "ไฟดับ");
  const [a, b, c, d] = chain([B.ukraine.start + 20, wf("ukraine", "บิน"), wf("ukraine", "พร้อม"), wf("ukraine", "หลัง")], endOf("ukraine"));
  return (
    <>
      <Panel id="ua-power" anchor={PL.kyiv} start={a[0]} end={a[1]} sky={["#070d1f", "#1c2541"]}>
        {(g) => {
          const darkK = ramp(g.frame, dark, dark + 40, Easing.linear);
          return (
            <>
              <BlackoutCity g={{ ...g, x: g.x + g.W * 0.38, W: g.W * 0.62 }} dark={darkK} />
              <PowerPlant x={g.x + 30 * g.s} y={g.ground} s={g.s} />
              <Pylon x={g.x + 330 * g.s} y={g.ground} s={g.s} />
              <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#1b1f27" />
              {g.frame > blast && (
                <>
                  <Fire x={g.x + 160 * g.s} y={g.ground - 110 * g.s} size={70 * g.s} seed={3} k={ramp(g.frame, blast, blast + 10)} />
                  <Smoke x={g.x + 140 * g.s} y={g.ground - 170 * g.s} size={60 * g.s} seed={4} k={ramp(g.frame, blast, blast + 20)} />
                </>
              )}
              <Flash g={g} at={blast} />
              {g.frame > dark && <Chip g={g} label="Ukrenergo · 20 ต.ค." value="ไฟดับ 12 แคว้น" font={font} />}
            </>
          );
        }}
      </Panel>
      <Panel id="ua-fly" anchor={PL.spb} start={b[0]} end={b[1]} sky={["#4a6fa5", "#c9d6e8"]}>
        {(g) => {
          const p = ramp(g.frame, b[0], b[1], Easing.linear);
          return (
            <>
              {[0.15, 0.55, 0.85].map((fx, i) => (
                <ellipse key={i} cx={g.x + g.W * fx - p * 120 * g.s} cy={g.y + (110 + i * 50) * g.s} rx={90 * g.s} ry={24 * g.s} fill="#fff" opacity={0.5} />
              ))}
              <Airliner x={g.x + g.W * (0.15 + 0.6 * p)} y={g.y + g.H * 0.6} scale={g.sc * 1.3} tail="#1d3557" />
              {label(g, "ทูตสหรัฐฯ วิทคอฟ → เซนต์ปีเตอร์สเบิร์ก", g.H - 30)}
            </>
          );
        }}
      </Panel>
      <Panel id="ua-plan" anchor={PL.spb} start={c[0]} end={c[1]} sky={["#3d2b1f", "#6b4a2f"]}>
        {(g) => (
          <>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e9dcc3" opacity={0.15} />
            <Table x={g.cx} y={g.ground + 30 * g.s} s={g.s * 1.2} font={font} title="แผนสันติภาพ ฉบับใหม่" />
          </>
        )}
      </Panel>
      <Panel id="ua-oslo" anchor={PL.oslo} start={d[0]} end={d[1]} sky={["#1d3557", "#457b9d"]}>
        {(g) => (
          <>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a2f3a" />
            {[0.2, 0.4, 0.6, 0.8].map((fx, i) => (
              <Person key={i} x={g.x + g.W * fx} y={g.ground} scale={g.sc} look={LOOKS[(i + 2) % LOOKS.length]} outfit={i === 1 ? "casual" : "suit"} pose="stand" facing={fx < 0.5 ? 1 : -1} />
            ))}
            {label(g, "ออสโล: เซเลนสกี + ผู้นำยุโรป")}
          </>
        )}
      </Panel>
    </>
  );
};

const TyphoonPanels = () => {
  const wind = wf("typhoon", "ลม");
  const [a, b] = chain([B.typhoon.start + 20, wf("typhoon", "คาด")], endOf("typhoon"));
  return (
    <>
      <Panel id="ty-wind" anchor={PL.taipei} start={a[0]} end={a[1]} sky={["#2f3e4e", "#6c7f8f"]}>
        {(g) => {
          const w = 0.3 + 0.7 * ramp(g.frame, wind, wind + 30);
          return (
            <>
              <Waves g={g} level={g.ground - 20 * g.s} frame={g.frame} amp={6 + 10 * w} />
              {[0.15, 0.35, 0.62, 0.85].map((fx, i) => (
                <Palm key={i} x={g.x + g.W * fx} y={g.ground - 10 * g.s} scale={g.sc * (0.95 + (i % 2) * 0.15)} wind={w} frame={g.frame} seed={i} />
              ))}
              <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#c2b280" />
              <Rain g={g} k={w} frame={g.frame} slant={0.6 * w} />
              {g.frame > wind && <Chip g={g} label="ลมใกล้ศูนย์กลาง (CWA)" value="~198 กม./ชม." font={font} color={GOLD} />}
            </>
          );
        }}
      </Panel>
      <Panel id="ty-isle" anchor={PL.ishigaki} start={b[0]} end={b[1]} sky={["#394b59", "#8796a3"]} accent={GOLD}>
        {(g) => (
          <>
            <Waves g={g} level={g.ground - 30 * g.s} frame={g.frame} amp={12} />
            <path d={`M${g.x + 120 * g.s} ${g.ground - 28 * g.s} Q${g.cx} ${g.ground - 170 * g.s} ${g.x + g.W - 160 * g.s} ${g.ground - 28 * g.s} Z`} fill="#4f7a43" stroke="#1b1d24" strokeWidth={1.6 * g.s} />
            <line x1={g.cx + 60 * g.s} y1={g.ground - 120 * g.s} x2={g.cx + 60 * g.s} y2={g.ground - 250 * g.s} stroke="#ddd" strokeWidth={4 * g.s} />
            <path d={`M${g.cx + 62 * g.s} ${g.ground - 250 * g.s} l${60 * g.s + Math.sin(g.frame * 0.5) * 6 * g.s} ${14 * g.s} l${-60 * g.s} ${14 * g.s} Z`} fill="#ff3b30" />
            <Rain g={g} k={1} frame={g.frame} slant={0.5} />
            <Chip g={g} label="คาดผ่านหมู่เกาะซากิชิมะ" value="23–24 ต.ค." font={font} color={GOLD} />
          </>
        )}
      </Panel>
    </>
  );
};

const SpainPanels = () => {
  const rain = wf("spain", "ฝน");
  const [a, b] = chain([B.spain.start + 20, wf("spain", "กู้ภัย")], endOf("spain"));
  const Town = ({ g }: { g: InsetGeom }) => (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={g.x + i * (g.W / 6) + 6 * g.s} y={g.ground - (150 + (i % 3) * 30) * g.s} width={g.W / 6 - 12 * g.s} height={(150 + (i % 3) * 30) * g.s} fill={["#e9c46a", "#f4a261", "#e5d3b3", "#d4a373"][i % 4]} stroke="#1b1d24" strokeWidth={1.4 * g.s} />
          {[0, 1].map((r) => (
            <rect key={r} x={g.x + i * (g.W / 6) + 40 * g.s} y={g.ground - (130 - r * 50) * g.s} width={28 * g.s} height={30 * g.s} fill="#5b6b7a" />
          ))}
        </g>
      ))}
    </>
  );
  return (
    <>
      <Panel id="es-flood" anchor={PL.oliva} start={a[0]} end={a[1]} sky={["#3c4a57", "#7d8b96"]} accent={RED}>
        {(g) => {
          const lvl = ramp(g.frame, rain, rain + 90, Easing.out(Easing.quad));
          return (
            <>
              <Town g={g} />
              <Street g={g} />
              <Car x={g.x + 220 * g.s} y={g.ground + 40 * g.s} scale={g.sc} color="#c0392b" />
              <Car x={g.x + 640 * g.s} y={g.ground + 40 * g.s} scale={g.sc} color="#f1faee" />
              <Waves g={g} level={g.ground + 30 * g.s - lvl * 110 * g.s} frame={g.frame} color="#7a6a4f" amp={5} />
              <Rain g={g} k={1} frame={g.frame} slant={0.2} n={90} />
              {g.frame > wf("spain", "หนัก") && <Chip g={g} label="AEMET" value="หนักสุดในรอบ ~40 ปี" font={font} />}
            </>
          );
        }}
      </Panel>
      <Panel id="es-rescue" anchor={PL.valencia} start={b[0]} end={b[1]} sky={["#4b5d6b", "#9aa8b3"]}>
        {(g) => (
          <>
            <Town g={g} />
            <Waves g={g} level={g.ground - 70 * g.s} frame={g.frame} color="#7a6a4f" amp={5} />
            <RescueBoat x={g.x + g.W * (0.2 + 0.25 * ramp(g.frame, b[0], b[1], Easing.linear))} y={g.ground - 66 * g.s} scale={g.sc} />
            <Helicopter x={g.x + g.W * (0.85 - 0.15 * ramp(g.frame, b[0], b[1], Easing.linear))} y={g.y + 190 * g.s} scale={g.sc * 1.1} frame={g.frame} />
            <Chip g={g} label="ได้รับการช่วยเหลือ" value="450+ คน" font={font} color="#3fb950" />
          </>
        )}
      </Panel>
    </>
  );
};

const FrancePanels = () => {
  const fall = wf("france", "ตก");
  const crash = fall + 40;
  const [a, b] = chain([B.france.start + 20, wf("france", "ลูก")], endOf("france"));
  return (
    <>
      <Panel id="fr-jet" anchor={PL.nancy} start={a[0]} end={a[1]} sky={["#050914", "#16213e"]}>
        {(g) => {
          const fly = ramp(g.frame, a[0], fall, Easing.linear);
          const drop = ramp(g.frame, fall, crash, Easing.in(Easing.quad));
          const x = g.x + g.W * (0.05 + 0.45 * fly + 0.25 * drop);
          const y = g.y + 100 * g.s + drop * (g.ground - g.y - 120 * g.s);
          return (
            <>
              {Array.from({ length: 30 }, (_, i) => (
                <circle key={i} cx={g.x + ((i * 97) % 1000) * g.s} cy={g.y + ((i * 53) % 200) * g.s} r={1.6 * g.s} fill="#fff" opacity={0.7} />
              ))}
              <Forest g={g} />
              {g.frame < crash && <Fighter x={x} y={y} scale={g.sc * 1.2} angle={drop * 35} burner={1 - drop} />}
              {g.frame >= crash && (
                <>
                  <ellipse cx={g.x + g.W * 0.75} cy={g.ground - 20 * g.s} rx={160 * g.s} ry={60 * g.s} fill="#ff8a2a" opacity={0.25} />
                  <Fire x={g.x + g.W * 0.75} y={g.ground - 10 * g.s} size={60 * g.s} seed={8} k={ramp(g.frame, crash, crash + 10)} />
                  <Smoke x={g.x + g.W * 0.75} y={g.ground - 60 * g.s} size={60 * g.s} seed={9} k={ramp(g.frame, crash, crash + 20)} />
                </>
              )}
              <Flash g={g} at={crash} />
              {label(g, "Mirage 2000D · ฝึกบินกลางคืน")}
            </>
          );
        }}
      </Panel>
      <Panel id="fr-search" anchor={PL.nancy} start={b[0]} end={b[1]} sky={["#050914", "#111a33"]}>
        {(g) => (
          <>
            <Forest g={g} />
            {[0.2, 0.45, 0.7].map((fx, i) => (
              <Searcher key={i} x={g.x + g.W * fx} y={g.ground + 10 * g.s} scale={g.sc * 1.1} beam={i === 2 ? 200 : -15} frame={g.frame} seed={i * 2} />
            ))}
            <Chip g={g} label="ลูกเรือ 2 นาย" value="เสียชีวิต 1 · สูญหาย 1" font={font} />
          </>
        )}
      </Panel>
    </>
  );
};

const IndonesiaPanels = () => {
  const [a, b] = chain([B.indonesia.start + 20, wf("indonesia", "อพยพ")], endOf("indonesia"));
  return (
    <>
      <Panel id="id-fire" anchor={PL.merak} start={a[0]} end={a[1]} sky={["#5b4a3f", "#d9a77a"]}>
        {(g) => (
          <>
            <Waves g={g} level={g.ground - 40 * g.s} frame={g.frame} color="#2f6690" amp={5} />
            <Ferry x={g.cx} y={g.ground - 36 * g.s} scale={g.sc * 1.05} />
            <Fire x={g.cx - 60 * g.s} y={g.ground - 110 * g.s} size={70 * g.s} seed={11} k={1} />
            <Fire x={g.cx + 70 * g.s} y={g.ground - 100 * g.s} size={55 * g.s} seed={12} k={ramp(g.frame, a[0] + 20, a[0] + 40)} />
            <Smoke x={g.cx - 40 * g.s} y={g.ground - 170 * g.s} size={90 * g.s} seed={13} k={1} />
            {label(g, "KMP Batumandi · ใกล้ท่าเรือเมรัก")}
          </>
        )}
      </Panel>
      <Panel id="id-evac" anchor={PL.merak} start={b[0]} end={b[1]} sky={["#6b5a4f", "#e0b48a"]}>
        {(g) => {
          const p = ramp(g.frame, b[0], b[0] + 60);
          return (
            <>
              <Waves g={g} level={g.ground - 40 * g.s} frame={g.frame} color="#2f6690" amp={5} />
              <Ferry x={g.cx - 120 * g.s} y={g.ground - 36 * g.s} scale={g.sc * 0.8} />
              <Smoke x={g.cx - 140 * g.s} y={g.ground - 150 * g.s} size={70 * g.s} seed={14} k={1} />
              <Tug x={g.x + g.W - 60 * g.s - p * 160 * g.s} y={g.ground - 36 * g.s} scale={g.sc} />
              <Tug x={g.x + g.W + 80 * g.s - p * 200 * g.s} y={g.ground - 20 * g.s} scale={g.sc * 0.9} color="#e63946" />
              <Chip g={g} label="อพยพครบ" value="460 คน" font={font} color="#3fb950" />
            </>
          );
        }}
      </Panel>
    </>
  );
};

const RomaniaPanels = () => {
  const vote = wf("romania", "ด้วย");
  const [a, b] = chain([B.romania.start + 20, vote], endOf("romania"));
  return (
    <>
      <Panel id="ro-pm" anchor={PL.bucharest} start={a[0]} end={a[1]} sky={["#1d3557", "#457b9d"]}>
        {(g) => (
          <>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a2a22" />
            {[["#002b7f", 0], ["#fcd116", 1], ["#ce1126", 2]].map(([c, i]) => (
              <rect key={i as number} x={g.x + g.W * 0.7 + (i as number) * 40 * g.s} y={g.y + 70 * g.s} width={40 * g.s} height={110 * g.s} fill={c as string} />
            ))}
            <Person x={g.x + g.W * 0.4} y={g.ground - 30 * g.s} scale={g.sc * 1.1} look={LOOKS[0]} outfit="suit" pose="wave" />
            <Lectern x={g.x + g.W * 0.4} y={g.ground} scale={g.sc} color="#2f3e46" />
            {label(g, "ลูกา นิคูเลสคู · อดีตนักการทูต")}
          </>
        )}
      </Panel>
      <Panel id="ro-vote" anchor={PL.bucharest} start={b[0]} end={b[1]} sky={["#2b2d42", "#4a4e69"]}>
        {(g) => {
          const k = ramp(g.frame, vote, vote + 45, Easing.out(Easing.quad));
          return (
            <>
              <Hemicycle x={g.cx} y={g.ground - 10 * g.s} r={250 * g.s} s={g.s} yes={280} no={58} k={k} />
              <text x={g.cx} y={g.ground - 30 * g.s} textAnchor="middle" fontSize={54 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>
                {Math.round(280 * k)} : {Math.round(58 * k)}
              </text>
              {g.frame > wf("romania", "ยุติ") && <Chip g={g} label="ทางตันการเมือง" value="เกือบ 6 เดือน" font={font} color={GOLD} />}
            </>
          );
        }}
      </Panel>
    </>
  );
};

const ColombiaPanels = () => {
  const fall = wf("colombia", "ถล่ม");
  const [a, b] = chain([B.colombia.start + 16, wf("colombia", "เสีย")], endOf("colombia"));
  return (
    <>
      <Panel id="co-mine" anchor={PL.narino} start={a[0]} end={a[1]} sky={["#6c8ea0", "#c9d6c2"]}>
        {(g) => (
          <>
            <MineHill g={g} x={g.cx} collapse={ramp(g.frame, fall, fall + 40, Easing.in(Easing.quad))} frame={g.frame} />
            {label(g, "เหมืองทองเถื่อน · นาริโญ")}
          </>
        )}
      </Panel>
      <Panel id="co-rescue" anchor={PL.narino} start={b[0]} end={b[1]} sky={["#6c8ea0", "#c9d6c2"]}>
        {(g) => (
          <>
            <MineHill g={g} x={g.cx} collapse={1} frame={g.frame} />
            {[0.28, 0.4, 0.6, 0.72].map((fx, i) => (
              <Rescuer key={i} x={g.x + g.W * fx} y={g.ground} scale={g.sc * 1.1} shovel={(Math.sin(g.frame * 0.25 + i) + 1) / 2} />
            ))}
            <Chip g={g} label="ทางการท้องถิ่น" value="เสียชีวิต 14 · เจ็บ 7" font={font} />
          </>
        )}
      </Panel>
    </>
  );
};

/* ---------------- cards ---------------- */
const HEADS: Record<string, Head[]> = {
  australia: [
    { f: B.australia.start + 6, tag: "1/8 · ออสเตรเลีย", head: "ส.ส.เฮเลน เฮนส์ ถูกรถชน", stat: "2 ครั้ง", label: "ถูกพุ่งชนซ้ำ" },
    { f: wf("australia", "ตำรวจ"), tag: "1/8 · ออสเตรเลีย", head: "ตั้ง 5 ข้อหา ผู้ต้องหาขึ้นศาล", stat: "43 ปี", label: "อายุผู้ต้องหา" },
    { f: wf("australia", "นายก"), tag: "1/8 · ออสเตรเลีย", head: "นายกฯ: “เป็นการจงใจ”" },
  ],
  ukraine: [
    { f: B.ukraine.start + 6, tag: "2/8 · ยูเครน", head: "รัสเซียถล่มระบบไฟฟ้า", stat: (f) => String(Math.round(interpolate(f, [wf("ukraine", "ไฟดับ"), wf("ukraine", "ไฟดับ") + 36], [0, 12], clamp))), label: "แคว้นไฟดับ" },
    { f: wf("ukraine", "ทูต"), tag: "2/8 · การทูต", head: "วิทคอฟพบปูติน พร้อมแผนใหม่", chips: [{ text: "เซนต์ปีเตอร์สเบิร์ก", f: wf("ukraine", "เซนต์") }] },
    { f: wf("ukraine", "หลัง"), tag: "2/8 · การทูต", head: "หลังหารือกับเซเลนสกีที่ออสโล" },
  ],
  typhoon: [
    { f: B.typhoon.start + 6, tag: "3/8 · ไต้หวัน · ญี่ปุ่น", head: "ซูเปอร์ไต้ฝุ่นจำปี", stat: "~198", label: "กม./ชม.", color: GOLD },
    { f: wf("typhoon", "คาด"), tag: "3/8 · ไต้หวัน · ญี่ปุ่น", head: "คาดผ่านหมู่เกาะซากิชิมะ", stat: "23–24 ต.ค.", color: GOLD },
  ],
  spain: [
    { f: B.spain.start + 6, tag: "4/8 · สเปน", head: "พายุอาดัม ฝนถล่มฝั่งตะวันออก", stat: "4", label: "คนเสียชีวิต" },
    { f: wf("spain", "กู้ภัย"), tag: "4/8 · สเปน", head: "กู้ภัยช่วยคนติดน้ำท่วม", stat: "450+", label: "คน", color: "#3fb950" },
  ],
  france: [
    { f: B.france.start + 6, tag: "5/8 · ฝรั่งเศส", head: "เครื่องบินขับไล่ตกใกล้น็องซี" },
    { f: wf("france", "ลูก"), tag: "5/8 · ฝรั่งเศส", head: "ลูกเรือ 2 นาย", stat: "1 · 1", label: "เสียชีวิต · สูญหาย" },
  ],
  indonesia: [
    { f: B.indonesia.start + 6, tag: "6/8 · อินโดนีเซีย", head: "เรือเฟอร์รีไฟไหม้ใกล้เกาะชวา" },
    { f: wf("indonesia", "อพยพ"), tag: "6/8 · อินโดนีเซีย", head: "อพยพได้ครบทุกคน", stat: "460", label: "คนปลอดภัย", color: "#3fb950" },
  ],
  romania: [
    { f: B.romania.start + 6, tag: "7/8 · โรมาเนีย", head: "ได้นายกฯ คนใหม่ ลูกา นิคูเลสคู", color: "#4fa3ff" },
    { f: wf("romania", "ด้วย"), tag: "7/8 · โรมาเนีย", head: "สภารับรองท่วมท้น", stat: "280–58", label: "เสียง", color: "#4fa3ff" },
  ],
  colombia: [
    { f: B.colombia.start + 6, tag: "8/8 · โคลอมเบีย", head: "เหมืองทองเถื่อนถล่ม" },
    { f: wf("colombia", "เสีย"), tag: "8/8 · โคลอมเบีย", head: "จังหวัดนาริโญ", stat: "14", label: "เสียชีวิต · เจ็บ 7" },
  ],
  intro: [{ f: B.intro.start + 4, tag: EDITION.date, head: "8 ข่าวใหญ่ใน 24 ชั่วโมง", stat: "90", label: "วินาที" }],
};

const TopBar = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < B.intro.start - 4) return null;
  const current = STORIES.findIndex((st) => frame >= B[st.id].start - 10 && frame < endOf(st.id));
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{EDITION.title}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{EDITION.date}</div>
      </div>
      <div style={{ display: "flex", gap: 8 * s }}>
        {STORIES.map((st, i) => (
          <div key={st.id} style={{ width: 30 * s, height: 10 * s, borderRadius: 5 * s, background: i === current ? RED : i < current || frame > B.outro.start ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
};

// Frame 0: the shock line, big, in the card slot.
const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end, B.hook.end + 8], [1, 0], clamp);
  if (o <= 0) return null;
  const k = spring({ frame, fps, config: { damping: 12 }, from: 0.85, to: 1 });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.09, opacity: o, transform: `scale(${k})`, fontFamily: font, color: "#fff", lineHeight: 1.25, textAlign: "center" }}>
      <span style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontSize: 34 * s, fontWeight: 900 }}>ด่วน · ออสเตรเลีย</span>
      <div style={{ fontSize: 100 * s, fontWeight: 900, marginTop: 18 * s, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>ส.ส.ถูกรถพุ่งชน</div>
      <div style={{ fontSize: 76 * s, fontWeight: 900, color: "#ff6b5f", textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>จนเสียขาทั้งสองข้าง</div>
    </div>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.outro.start, B.outro.start + 12], [0, 1], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
      <div style={{ background: "rgba(8,14,26,0.86)", padding: `${24 * s}px ${50 * s}px`, borderRadius: 18 * s, border: `${3 * s}px solid ${RED}` }}>
        <div style={{ fontSize: 76 * s, fontWeight: 900 }}>{EDITION.title}</div>
        <div style={{ fontSize: 36 * s, opacity: 0.85 }}>ทุกวัน · กดติดตามไว้ แล้วพบกันพรุ่งนี้</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- composition ---------------- */
const Layered = ({ children }: { children: ReactNode }) => <>{children}</>;

export const WorldNews1021 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.min(width, height) * 0.42;
  const lift = height > width ? 0.085 : 0;
  const target = (st: { focus: LL; zoom: number }): Cam => {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    return { lon: st.focus[0], lat: st.focus[1] - (height * lift) / pxPerDeg, scale: R * st.zoom };
  };
  const hookCam = target({ focus: [146.0, -36.6], zoom: 9 });
  const keys: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: B.hook.end, cam: { ...hookCam, scale: hookCam.scale * 1.08 }, easing: (t) => t },
    { frame: B.intro.start + 30, cam: globeCam(130, 5, width, height, 0.42), easing: Easing.inOut(Easing.cubic) },
    { frame: B.intro.end, cam: globeCam(100, 15, width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = keys[keys.length - 1].cam;
  for (const st of STORIES) {
    const b = B[st.id];
    const t = target(st);
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat])(0.5);
    const d = (geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat]) as unknown as { distance: number }).distance;
    const far = d > 0.6 ? 1.05 : Math.max(1.05, (t.scale / R) * 0.45);
    keys.push({ frame: b.start - 12, cam: prev });
    keys.push({ frame: b.start + 6, cam: { lon: mlon, lat: mlat, scale: R * far }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: b.start + 26, cam: t, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: b.end, cam: { ...t, scale: t.scale * 1.06 }, easing: (x) => x });
    prev = { ...t, scale: t.scale * 1.06 };
  }
  keys.push({ frame: B.outro.start, cam: prev });
  keys.push({ frame: B.outro.start + 30, cam: globeCam(prev.lon, 10, width, height, 0.42), easing: Easing.inOut(Easing.cubic) });
  keys.push({ frame: E1021_FRAMES, cam: globeCam(prev.lon + 20, 10, width, height, 0.42), easing: (x) => x });
  const cam = camAt(keys, frame);

  const active = STORIES.find((st) => frame >= B[st.id].start - 4 && frame < endOf(st.id));
  const panelStarts = [
    B.australia.start + 24, wf("australia", "ตำรวจ"), wf("australia", "นายก"),
    B.ukraine.start + 20, wf("ukraine", "บิน"), wf("ukraine", "พร้อม"), wf("ukraine", "หลัง"),
    B.typhoon.start + 20, wf("typhoon", "คาด"), B.spain.start + 20, wf("spain", "กู้ภัย"),
    B.france.start + 20, wf("france", "ลูก"), B.indonesia.start + 20, wf("indonesia", "อพยพ"),
    B.romania.start + 20, wf("romania", "ด้วย"), B.colombia.start + 16, wf("colombia", "เสีย"),
  ];
  const hits = [wf("hook", "ชน"), wf("ukraine", "ถล่ม"), wf("france", "ตก") + 40, wf("colombia", "ถล่ม") + 10];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sfx src={SFX.hit} at={0} volume={0.5} />
      <Sfx src={SFX.swell} at={B.intro.start} volume={0.3} />
      {STORIES.map((st) => (
        <Sfx key={st.id} src={SFX.whoosh} at={B[st.id].start - 12} volume={0.3} />
      ))}
      {panelStarts.map((f, i) => (
        <Sfx key={`p${i}`} src={SFX.pop} at={f} volume={0.25} />
      ))}
      {hits.map((f, i) => (
        <Sfx key={`h${i}`} src={SFX.hit} at={f} volume={0.35} />
      ))}
      <Sfx src={SFX.tick} at={wf("romania", "ด้วย")} volume={0.3} />
      <MapFrame cam={cam}>
        <Sphere />
        <Raster layers={[{ name: "world", opacity: 0.9 }]} />
        <Borders />
        <Layered>
          {STORIES.map((st) => {
            const b = B[st.id];
            const o = interpolate(frame, [b.start + 14, b.start + 28, endOf(st.id) - 6, endOf(st.id) + 6], [0, 1, 1, 0], clamp);
            return <Highlight key={st.id} ids={st.ids} opacity={o} />;
          })}
          <Highlight ids={["036"]} opacity={interpolate(frame, [0, 1, B.hook.end, B.hook.end + 10], [1, 1, 1, 0], clamp)} />
          <FloodLayer at={[-0.25, 39.15]} radius={0.45} k={frame > B.spain.start && frame < endOf("spain") ? ramp(frame, wf("spain", "ฝน"), wf("spain", "ฝน") + 50) : 0} />
          <Outages />
          <Typhoon />
          <StoryDots />
          {frame >= wf("ukraine", "บิน") && frame < endOf("ukraine") && <Route from={PL.oslo} to={PL.spb} start={wf("ukraine", "บิน")} end={wf("ukraine", "บิน") + 40} color={GOLD} />}
          {frame < B.hook.end + 10 && <PointLabel at={PL.wang} text="วังการัตตา" start={6} color={RED} size={0.9} />}
          {active?.pins.map((p) => (
            <PointLabel key={p.label} at={p.at} text={p.label} start={Math.max(B[active.id].start + 26, wf(active.id, p.word, 0.3))} color={RED} size={0.9} />
          ))}
        </Layered>
        <AustraliaPanels />
        <UkrainePanels />
        <TyphoonPanels />
        <SpainPanels />
        <FrancePanels />
        <IndonesiaPanels />
        <RomaniaPanels />
        <ColombiaPanels />
      </MapFrame>
      <TopBar />
      <HookTitle />
      {Object.entries(HEADS).map(([id, heads]) => (
        <HeadCard key={id} heads={heads} from={heads[0].f} to={id === "intro" ? B.intro.end + 6 : endOf(id)} />
      ))}
      <Outro />
      {BEATS.filter((b) => b.id !== "hook" && b.id !== "outro").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
      ))}
    </AbsoluteFill>
  );
};
