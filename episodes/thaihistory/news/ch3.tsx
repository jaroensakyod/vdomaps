import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { B, CityRing, clamp, font, GOLD, P, Panel, RED, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, Fire, SiegeCamp, Smoke } from "./Period";
import { DryField, Rain, Townsperson, WaterBand, WarElephant } from "./Period2";
import { BurmesePalace, Royal } from "./Period3";
import { HorseGeneral, LannaGate, Mountains, Palisade, Pincer, RiceCart, StiltHouse } from "./Period4";

// Chapter 3 "คีมสองขา" (beats plan → butfirst): the two-pronged invasion, slow conquest, the ring closes,
// and the cut to Bang Rachan.
const T = {
  plan: B.plan.start,
  send: wf("plan", "ส่ง", 0.35),
  pincer: wf("plan", "คีม", 0.55),
  legN: wf("plan", "หนึ่ง", 0.7),
  legW: wf("plan", "อีก", 0.86),
  north: B.north.start,
  nameLong: wf("north", "ยาว", 0.3),
  nameShort: wf("north", "ว่า", 0.44),
  lanna: wf("north", "ล้าน", 0.65),
  lp: wf("north", "หลวง", 0.72),
  cut: wf("north", "ตัด", 0.83),
  west: B.west.start,
  tavoy: wf("west", "ทวาย", 0.5),
  hills: wf("west", "ข้าม", 0.56),
  kan: wf("west", "กาญจนบุรี", 0.82),
  rat: wf("west", "ราชบุรี", 0.92),
  slow: B.slow.start,
  noRush: wf("slow", "ไม่", 0.23),
  oneByOne: wf("slow", "ตี", 0.47),
  rice: wf("slow", "เก็บ", 0.6),
  men: wf("slow", "เกณฑ์", 0.68),
  store: wf("slow", "เตรียม", 0.85),
  why: B.why_slow.start,
  close: B.close.start,
  meet: wf("close", "คีม", 0.5),
  ring: wf("close", "รอบ", 0.72),
  but: B.butfirst.start,
  village: wf("butfirst", "หมู่บ้าน", 0.65),
};
const END = B.village.start;

const AVA: [number, number] = [96.08, 21.9];
const CM: [number, number] = [98.98, 18.79];
const LP: [number, number] = [102.13, 19.89];
const TAVOY: [number, number] = [98.19, 14.08];
const KAN: [number, number] = [99.53, 14.02];
const RAT: [number, number] = [99.81, 13.54];
const BANG: [number, number] = [100.33, 14.9]; // approximate
const NORTH: [number, number][] = [AVA, [97.6, 20.4], CM, [99.13, 16.88], [99.52, 16.48], [100.12, 15.7], [100.45, 14.6]];
const WEST: [number, number][] = [TAVOY, [98.9, 14.3], KAN, RAT, [100.12, 14.47], [100.42, 14.35]];
// Towns taken one by one (north and west armies), in the order the VO walks through them.
const TOWNS: [number, number][] = [[99.13, 16.88], [99.52, 16.48], [100.12, 15.7], [100.03, 15.38], KAN, RAT, [100.12, 14.47], [99.95, 13.11]];
const V3 = {
  region: bbox([[94.5, 12.5], [104.5, 23]]),
  west: bbox([[97.4, 12.8], [101.2, 15.6]]),
  wide: bbox([[98.3, 12.8], [101.7, 17.6]]),
  bang: bbox([[100.14, 14.66], [100.72, 15.14]]),
};

const SUN: [string, string] = ["#e98b3a", "#f8d9a0"];

// King sends two armies off in opposite directions.
const SendScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3send" anchor={AVA} start={start} end={end} sky={SUN}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#b79a6e" />
            <BurmesePalace x={g.cx} y={g.ground - 30 * g.s} s={g.s * 0.6} w={360} />
            <Royal x={g.cx} y={g.ground - 4 * g.s} scale={g.sc * 0.9} pose="point" robe="#e2b84a" />
            {[0, 1, 2].map((i) => <BurmeseSoldier key={`l${i}`} x={g.cx - (120 + i * 70 + m * 160) * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.8} flip hold="spear" phase={i} />)}
            {[0, 1, 2].map((i) => <BurmeseSoldier key={`r${i}`} x={g.cx + (120 + i * 70 + m * 160) * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.8} hold="spear" phase={i + 3} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// A general's "name card" panel: the commander on horseback.
const GeneralScene = ({ id, start, end, banner, coat, flip = false, anchor }: { id: string; start: number; end: number; banner: string; coat: string; flip?: boolean; anchor: [number, number] }) => (
  <Panel id={id} anchor={anchor} start={start} end={end} sky={SUN}>
    {(g) => (
      <g>
        <DryField x={g.x} y={g.ground - 20 * g.s} W={g.W} H={g.H} s={g.s} />
        {[0, 1, 2, 3].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (flip ? 0.6 + i * 0.1 : 0.06 + i * 0.1)} y={g.ground + 4 * g.s} scale={g.sc * 0.7} pose="stand" hold="spear" phase={i} flip={flip} />)}
        <HorseGeneral x={g.x + g.W * (flip ? 0.32 : 0.68)} y={g.ground + 6 * g.s} scale={g.sc * 0.85} banner={banner} coat={coat} flip={flip} />
      </g>
    )}
  </Panel>
);

// War elephants at a burning Lanna gate.
const LannaScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3lanna" anchor={CM} start={start} end={end} sky={["#5a6b4a", "#c9d6a8"]}>
      {(g) => {
        const burn = interpolate(frame, [start + 20, start + 60], [0, 1], clamp);
        return (
          <g>
            <Mountains x={g.x} y={g.ground - 60 * g.s} W={g.W} s={g.s} h={160} seed="lanna" />
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a6a4a" />
            <LannaGate x={g.x + g.W * 0.68} y={g.ground} s={g.s * 0.75} />
            {burn > 0 && <Fire x={g.x + g.W * 0.68} y={g.ground - 140 * g.s} size={90 * g.s * burn} seed={3} />}
            {burn > 0.4 && <Smoke x={g.x + g.W * 0.68} y={g.ground - 200 * g.s} size={160 * g.s} />}
            <WarElephant x={g.x + g.W * 0.3} y={g.ground + 6 * g.s} scale={g.sc * 0.7} />
            {[0, 1].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.08 + i * 0.08)} y={g.ground + 6 * g.s} scale={g.sc * 0.8} hold="spear" phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Columns climbing over the Tenasserim range.
const PassScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3pass" anchor={TAVOY} start={start} end={end} sky={["#7aa0c4", "#dbeef2"]}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        const trail = (k: number) => [g.x + g.W * k, g.ground - 20 * g.s - Math.sin(k * Math.PI) * 120 * g.s] as const;
        return (
          <g>
            <Mountains x={g.x} y={g.ground} W={g.W} s={g.s} h={260} seed="tenas" />
            <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.cx} ${g.ground - 260 * g.s} ${g.x + g.W} ${g.ground - 20 * g.s}`} fill="none" stroke="#c9a66b" strokeWidth={8 * g.s} strokeDasharray={`${10 * g.s} ${6 * g.s}`} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const k = (m * 0.6 + i * 0.12) % 1;
              const [px, py] = trail(k);
              return <BurmeseSoldier key={i} x={px} y={py} scale={g.sc * 0.55} hold="spear" phase={i} />;
            })}
            <WarElephant x={trail((m * 0.6 + 0.8) % 1)[0]} y={trail((m * 0.6 + 0.8) % 1)[1]} scale={g.sc * 0.45} />
          </g>
        );
      }}
    </Panel>
  );
};

// "ไม่รีบเลย": soldiers resting and cooking at a camp.
const RestScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3rest" anchor={P.ayut} start={start} end={end} sky={SUN}>
    {(g) => (
      <g>
        <DryField x={g.x} y={g.ground - 20 * g.s} W={g.W} H={g.H} s={g.s} />
        <SiegeCamp x={g.x + g.W * 0.3} y={g.ground} s={g.s} w={260} />
        <BurmeseSoldier x={g.x + g.W * 0.62} y={g.ground + 4 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" />
        <BurmeseSoldier x={g.x + g.W * 0.75} y={g.ground + 4 * g.s} scale={g.sc * 0.85} pose="stand" hold="sword" flip phase={2} />
        <WarElephant x={g.x + g.W * 0.9} y={g.ground + 4 * g.s} scale={g.sc * 0.5} walk={false} flip />
      </g>
    )}
  </Panel>
);

// "เก็บข้าว เกณฑ์คน": carts of rice and villagers marched off.
const SupplyScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3supply" anchor={P.ayut} start={start} end={end} sky={SUN}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
            <StiltHouse x={g.x + g.W * 0.9} y={g.ground - 14 * g.s} s={g.s * 0.9} />
            <RiceCart x={g.x + g.W * (0.1 + m * 0.2)} y={g.ground + 2 * g.s} s={g.sc * 0.8} />
            {frame >= T.men &&
              [0, 1, 2].map((i) => <Townsperson key={i} x={g.x + g.W * (0.58 + i * 0.08 - m * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.8} flip phase={i} cloth="#6b5a44" />)}
            {frame >= T.men && <BurmeseSoldier x={g.x + g.W * (0.86 - m * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.85} hold="spear" flip />}
          </g>
        );
      }}
    </Panel>
  );
};

// Store of rice sacks piled at camp — supplies for a long stay; rain clouds coming (lesson ②).
const StoreScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c3store" anchor={P.ayut} start={start} end={end} sky={frame > T.why + 20 ? ["#4a5866", "#9aa8b4"] : SUN}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#a8905e" />
          {Array.from({ length: 15 }, (_, i) => {
            const row = i < 6 ? 0 : i < 11 ? 1 : i < 14 ? 2 : 3;
            const col = [i, i - 6, i - 11, i - 14][row];
            return <ellipse key={i} cx={g.x + g.W * 0.32 + (col * 46 + row * 23) * g.s} cy={g.ground - (12 + row * 30) * g.s} rx={24 * g.s} ry={17 * g.s} fill="#e3cf9e" stroke="#1b1d24" strokeWidth={1.4 * g.s} />;
          })}
          <BurmeseSoldier x={g.x + g.W * 0.15} y={g.ground + 6 * g.s} scale={g.sc * 0.85} pose="stand" hold="spear" />
          <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={interpolate(frame, [T.why + 20, T.why + 40], [0, 1], clamp)} />
        </g>
      )}
    </Panel>
  );
};

// The ring closes: camp fires on the horizon seen from the city wall at dusk.
export const RingScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3ring" anchor={P.ayut} start={start} end={end} sky={["#2a2f4a", "#c8461f"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#3a3a2a" />
        {Array.from({ length: 9 }, (_, i) => <Fire key={i} x={g.x + g.W * (0.05 + i * 0.11)} y={g.ground - 58 * g.s} size={(18 + (i % 3) * 6) * g.s} seed={i} />)}
        {Array.from({ length: 9 }, (_, i) => <path key={`t${i}`} d={`M${g.x + g.W * (0.08 + i * 0.11) - 12 * g.s} ${g.ground - 60 * g.s} l${12 * g.s} ${-20 * g.s} l${12 * g.s} ${20 * g.s} Z`} fill="#8e2a22" />)}
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#cfc6b0" />
        {Array.from({ length: 16 }, (_, i) => <path key={`m${i}`} d={`M${g.x + i * g.W / 15} ${g.ground - 30 * g.s} l0 ${-14 * g.s} q${10 * g.s} ${-14 * g.s} ${20 * g.s} 0 l0 ${14 * g.s} Z`} fill="#e9e1cf" stroke="#1b1d24" strokeWidth={g.s} />)}
      </g>
    )}
  </Panel>
);

// Bang Rachan: a palisaded village, villagers at the gate with spears and farm tools.
const VillageScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c3village" anchor={BANG} start={start} end={end} sky={["#6fa3c9", "#e6f0d0"]} accent="#3f8f4a">
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#6f8a4a" />
        <StiltHouse x={g.x + g.W * 0.2} y={g.ground - 40 * g.s} s={g.s * 0.8} />
        <StiltHouse x={g.x + g.W * 0.78} y={g.ground - 44 * g.s} s={g.s * 0.75} flip />
        <Palisade x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} y={g.ground - 8 * g.s} s={g.s} gateAt={g.cx} />
        {[-1, 0, 1].map((i) => <Townsperson key={i} x={g.cx + i * 40 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.85} walk={false} cloth="#3f6a3a" phase={i} />)}
      </g>
    )}
  </Panel>
);

// "ลองนึกภาพคีมยักษ์": a giant pincer drawn over the map.
const PincerOverlay = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.pincer || frame > T.legN + 20) return null;
  const k = interpolate(frame, [T.pincer, T.pincer + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const o = interpolate(frame, [T.legN, T.legN + 20], [1, 0], clamp);
  const open = interpolate(frame, [T.pincer + 10, T.legN], [1, 0.25], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={width} height={height}>
        <g transform={`translate(${width / 2},${height * 0.33}) scale(${k}) translate(${-width / 2},${-height * 0.33})`}>
          <Pincer x={width / 2} y={height * 0.33} s={s * 1.2} open={open} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// "แต่เดี๋ยวก่อนครับ": a pause badge.
const PauseBadge = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.but || frame > T.but + 45) return null;
  const k = interpolate(frame, [T.but, T.but + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [T.but + 35, T.but + 45], [1, 0], clamp) }}>
      <div style={{ transform: `scale(${k})`, width: 220 * s, height: 220 * s, borderRadius: "50%", background: "rgba(8,14,26,0.8)", border: `${8 * s}px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 * s }}>
        <div style={{ width: 34 * s, height: 100 * s, background: GOLD, borderRadius: 6 * s }} />
        <div style={{ width: 34 * s, height: 100 * s, background: GOLD, borderRadius: 6 * s }} />
      </div>
    </AbsoluteFill>
  );
};

// Towns turning red one by one + a counter in the card.
const Towns = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  return (
    <g>
      {TOWNS.map((pt, i) => {
        const p = projection(pt);
        if (!p) return null;
        const f = T.oneByOne + i * 8;
        const taken = frame >= f;
        const k = interpolate(frame, [f, f + 8], [0, 1], clamp);
        return (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={(12 + k * 10) * s} fill={taken ? RED : "#fff"} opacity={taken ? 0.9 : 0.8} stroke="#fff" strokeWidth={3 * s} />
            {taken && <circle cx={p[0]} cy={p[1]} r={(12 + k * 40) * s} fill="none" stroke={RED} strokeWidth={3 * s} opacity={1 - k} />}
          </g>
        );
      })}
    </g>
  );
};

// Ring of siege camp markers around the city.
const SiegeRing = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  const c = projection(P.ayut);
  if (!c || k <= 0) return null;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const p = projection([P.ayut[0] + Math.cos(a) * 0.16, P.ayut[1] + Math.sin(a) * 0.13]);
        const kk = interpolate(k, [i / 14, i / 14 + 0.2], [0, 1], clamp);
        return p && kk > 0 ? <path key={i} d={`M${p[0] - 14 * s * kk} ${p[1] + 8 * s} L${p[0]} ${p[1] - 18 * s * kk} L${p[0] + 14 * s * kk} ${p[1] + 8 * s} Z`} fill={RED} stroke="#fff" strokeWidth={2 * s} /> : null;
      })}
    </g>
  );
};

export const ch3: Chapter = {
  name: "คีมสองขา",
  from: B.plan.start,
  to: END,
  cams: (w, h) => [
    { frame: T.plan, cam: view(V.island, w, h, 0.7) },
    { frame: T.plan + 40, cam: view(V3.region, w, h, 0.95, 0.03) },
    { frame: T.west, cam: view(V3.region, w, h, 0.95, 0.03) },
    { frame: T.west + 35, cam: view(V3.west, w, h, 1, 0.1) },
    { frame: T.slow, cam: view(V3.west, w, h, 1, 0.1) },
    { frame: T.slow + 35, cam: view(V3.wide, w, h, 1, 0.1) },
    { frame: T.close, cam: view(V3.wide, w, h, 1, 0.1) },
    { frame: T.close + 35, cam: view(V.central, w, h, 1.4) },
    { frame: T.but + 30, cam: view(V.central, w, h, 1.4) },
    { frame: T.village - 10, cam: view(V3.bang, w, h, 1) },
  ],
  years: [[T.plan, "2308"], [T.close, "2309"]],
  heads: [
    { f: T.plan, tag: "พ.ศ. 2308", head: "พระเจ้ามังระส่งทัพ", stat: "2 ทาง", color: RED },
    { f: T.pincer, tag: "ลองนึกภาพ", head: "คีมยักษ์สองขา", color: RED, chips: [{ text: "ขาเหนือ", f: T.legN }, { text: "ขาตะวันตก", f: T.legW }] },
    { f: T.north, tag: "ทัพเหนือ", head: "เนเมียวสีหบดี", color: RED },
    { f: T.nameShort, tag: "ทัพเหนือ · ขอเรียกสั้น ๆ", head: "เนเมียว", color: RED },
    { f: T.lanna, tag: "ตีก่อน", head: "ล้านนา · หลวงพระบาง", color: RED, chips: [{ text: "ตัดทางช่วยอยุธยา", f: T.cut }] },
    { f: T.west, tag: "ทัพตะวันตก", head: "มังมหานรธา", color: RED },
    { f: T.tavoy, tag: "ออกจากเมืองทวาย", head: "ข้ามเทือกเขาตะนาวศรี", color: RED, chips: [{ text: "กาญจนบุรี", f: T.kan }, { text: "ราชบุรี", f: T.rat }] },
    { f: T.slow, tag: "สังเกตไหม", head: "สองทัพไม่รีบเลย", color: GOLD },
    { f: T.oneByOne, tag: "ตีทีละเมือง", head: "เมืองที่เสีย", stat: (f) => `${Math.min(TOWNS.length, Math.max(0, Math.floor((f - T.oneByOne) / 8) + 1))} เมือง`, color: RED, chips: [{ text: "เก็บข้าว", f: T.rice }, { text: "เกณฑ์คน", f: T.men }] },
    { f: T.why, tag: "เพราะบทเรียนข้อ ②", head: "ต้องอยู่ให้ได้ข้ามหน้าฝน", color: GOLD },
    { f: T.close, tag: "ต้นปี 2309", head: "คีมปิด ล้อมกรุงศรีอยุธยา", color: RED },
    { f: T.but, tag: "แต่เดี๋ยวก่อน", head: "หมู่บ้านที่ไม่ยอมให้ผ่าน", color: "#3f8f4a" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const fadeOut = (a: number) => interpolate(frame, [a, a + 15], [1, 0], clamp);
    return (
      <>
        {frame >= T.legN && frame < T.north && (
          <g opacity={0.6}>
            <Arrow points={NORTH} start={T.legN} end={T.legN + 30} color={RED} width={22} variant="dashed" />
            <Arrow points={WEST} start={T.legW} end={T.legW + 25} color={RED} width={22} variant="dashed" />
          </g>
        )}
        {frame >= T.north && frame < T.but && (
          <>
            <Arrow points={NORTH.slice(0, 3)} start={T.north + 10} end={T.lanna} color={RED} width={24} />
            <Arrow points={[CM, [100.6, 19.6], LP]} start={T.lp - 5} end={T.lp + 25} color={RED} width={14} variant="dashed" />
            <PointLabel at={AVA} text="อังวะ" start={T.north + 10} color={RED} size={0.7} />
            <PointLabel at={CM} text="เชียงใหม่" start={T.lanna} color={RED} size={0.7} />
            <PointLabel at={LP} text="หลวงพระบาง" start={T.lp} color={RED} size={0.7} />
            {frame >= T.cut && frame < T.west + 10 && <g opacity={fadeOut(T.west)}><Arrow points={[[100.6, 16.9], [100.6, 15.2]]} start={T.cut} end={T.cut + 15} color={GOLD} width={10} variant="dashed" /><PointLabel at={[100.6, 16.0]} text="✕" start={T.cut + 10} color={GOLD} size={1.1} /></g>}
          </>
        )}
        {frame >= T.west && frame < T.but && (
          <>
            <Arrow points={WEST.slice(0, 4)} start={T.tavoy} end={T.rat + 10} color={RED} width={24} />
            <PointLabel at={TAVOY} text="ทวาย" start={T.tavoy} color={RED} size={0.7} />
            <PointLabel at={KAN} text="กาญจนบุรี" start={T.kan} color={RED} size={0.7} />
            <PointLabel at={RAT} text="ราชบุรี" start={T.rat} color={RED} size={0.7} />
          </>
        )}
        {frame >= T.oneByOne && frame < T.close + 10 && <Towns />}
        {frame >= T.close && frame < T.but + 30 && (
          <>
            <Arrow points={NORTH.slice(3)} start={T.close} end={T.meet + 10} color={RED} width={24} />
            <Arrow points={WEST.slice(3)} start={T.close} end={T.meet + 10} color={RED} width={24} />
          </>
        )}
        <SiegeRing k={interpolate(frame, [T.ring - 10, T.ring + 30], [0, 1], clamp) * (frame < END + 20 ? 1 : 0)} />
        <CityRing k={interpolate(frame, [T.ring, T.ring + 10, T.but + 20, T.but + 40], [0, 1, 1, 0], clamp)} color={RED} />
        {frame >= T.but + 30 && <PointLabel at={BANG} text="บ้านบางระจัน" start={T.village - 10} color="#3f8f4a" size={0.85} />}
      </>
    );
  },
  Panels: () => (
    <>
      <SendScene start={T.plan + 10} end={T.pincer + 14} />
      <GeneralScene id="c3ne" start={T.north} end={T.lanna + 14} banner="#c7322a" coat="#8e2a22" anchor={AVA} />
      <LannaScene start={T.lanna} end={T.west + 14} />
      <GeneralScene id="c3maha" start={T.west} end={T.hills + 14} banner="#d9a93a" coat="#2f4f6b" flip anchor={TAVOY} />
      <PassScene start={T.hills} end={T.slow + 14} />
      <RestScene start={T.slow} end={T.rice + 14} />
      <SupplyScene start={T.rice} end={T.store + 14} />
      <StoreScene start={T.store} end={T.close + 14} />
      <RingScene start={T.close} end={T.but + 14} />
      <VillageScene start={T.village} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <PincerOverlay />
      <PauseBadge />
    </>
  ),
  sfx: [
    [T.plan, SFX.whoosh, 0.4],
    [T.send, SFX.swell, 0.3],
    [T.pincer, SFX.hit, 0.5],
    [T.legN, SFX.whoosh, 0.3],
    [T.legW, SFX.whoosh, 0.3],
    [T.nameShort, SFX.pop, 0.4],
    [T.lanna, SFX.hit, 0.35],
    [T.west, SFX.pop, 0.3],
    [T.hills, SFX.whoosh, 0.3],
    ...TOWNS.map((_, i) => [T.oneByOne + i * 8, SFX.tick, 0.25] as [number, string, number]),
    [T.rice, SFX.pop, 0.3],
    [T.meet, SFX.hit, 0.55],
    [T.but, SFX.riser, 0.25],
    [T.village, SFX.pop, 0.4],
  ],
};
void WaterBand;
void Townsperson;
void Smoke;
