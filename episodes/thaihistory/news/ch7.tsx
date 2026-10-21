import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { SFX } from "../../../components/Sound";
import { RuinScene, StormScene } from "./ch0";
import { B, CityRing, clamp, font, GOLD, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BellChedi, BurmeseSoldier, CityWall, Dust, Embers, Fire, Smoke } from "./Period";
import { Townsperson, WallCannon, WaterBand } from "./Period2";
import { MapTable, Parasol, Royal, ThaiPalace } from "./Period3";
import { Shovel, Firewood } from "./Period6";

// Chapter 7 "คืนกรุงแตก" (beats huaro → end417): Hua Ro, the siege forts and guns, the tunnel (cross-section ③),
// the wall falls on 7 April 1767, the city burns, the captives, two versions of the king's end, 417 years.
const INK = "#1b1d24";
const T = {
  huaro: B.huaro.start,
  corner: wf("huaro", "มุม", 0.15),
  name: wf("huaro", "หัวรอ", 0.5),
  narrow: wf("huaro", "แคบ", 0.85),
  forts: B.forts.start,
  guns: wf("forts", "ยิง", 0.5),
  d3: B.diagram3.start,
  dig: wf("diagram3", "ขุด", 0.35),
  wood: wf("diagram3", "ฟืน", 0.67),
  light: wf("diagram3", "ไฟ", 0.79),
  sink: wf("diagram3", "ทรุด", 0.97),
  col: B.collapse.start,
  fall: wf("collapse", "พัง", 0.82),
  breach: B.breach.start,
  fell: wf("breach", "แตก", 0.68),
  months: wf("breach", "หลัง", 0.77),
  fire: B.fire.start,
  wat: wf("fire", "วัด", 0.37),
  wang: wf("fire", "วัง", 0.49),
  houses: wf("fire", "เรือน", 0.6),
  cap: B.captives.start,
  who: wf("captives", "มี", 0.42),
  king: B.king.start,
  thai: wf("king", "ไทย", 0.28),
  wat2: wf("king", "สังฆาวาส", 0.54),
  bur: wf("king", "พม่า", 0.76),
  unsure: wf("king", "จน", 0.91),
  end: B.end417.start,
  close: wf("end417", "ปิดฉาก", 0.67),
};
const END = B.answer.start;
const AVA: [number, number] = [96.08, 21.9];
const NIGHT: [string, string] = ["#0b1230", "#2a3a6a"];

// Burmese commanders at the map table, pointing at the corner.
const PickScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c7pick" anchor={P.huaro} start={start} end={end} sky={["#3a1a14", "#6b2a20"]}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2a1a14" />
        <MapTable x={g.cx} y={g.ground} s={g.s * 1.4} />
        <Royal x={g.cx - 210 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.9} pose="point" robe="#8e2a22" side="#2f4f6b" />
        <BurmeseSoldier x={g.cx + 210 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.9} pose="stand" hold="sword" flip />
      </g>
    )}
  </Panel>
);

// The narrow, low dry-season river at Hua Ro with the wall beyond.
const NarrowScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c7narrow" anchor={P.huaro} start={start} end={end} sky={["#e9b46a", "#fbe7c2"]}>
    {(g) => (
      <g>
        <Skyline g={g} color="#7a5a40" base={160} />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 70 * g.s} h={90 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={g.H} fill="#b49a6a" />
        <WaterBand x={g.x} y={g.ground - 40 * g.s} W={g.W} H={30 * g.s} s={g.s} />
        <rect x={g.x} y={g.ground - 12 * g.s} width={g.W} height={g.H} fill="#b49a6a" />
        <text x={g.cx} y={g.ground - 48 * g.s} textAnchor="middle" fill="#0d3b5a" fontFamily={font} fontWeight={900} fontSize={26 * g.s}>แม่น้ำแคบ · หน้าแล้งน้ำลด</text>
      </g>
    )}
  </Panel>
);

// Timber siege forts against the wall, guns firing day into night.
const FortScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const night = interpolate(frame, [T.guns, end], [0, 1], clamp);
  return (
    <Panel id="c7forts" anchor={P.huaro} start={start} end={end} sky={night > 0.5 ? NIGHT : ["#8a6a5a", "#e0b68a"]}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#4a3a2a" />
          <CityWall x0={g.x + g.W * 0.62} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={120 * g.s} s={g.s} />
          {[0.12, 0.38].map((fx, i) => (
            <g key={i}>
              <path d={`M${g.x + g.W * fx - 50 * g.s} ${g.ground} L${g.x + g.W * fx - 36 * g.s} ${g.ground - 170 * g.s} L${g.x + g.W * fx + 36 * g.s} ${g.ground - 170 * g.s} L${g.x + g.W * fx + 50 * g.s} ${g.ground} Z`} fill="#7a5532" stroke={INK} strokeWidth={1.5 * g.s} />
              {[0.25, 0.5, 0.75].map((r) => <line key={r} x1={g.x + g.W * fx - 46 * g.s} y1={g.ground - 170 * g.s * r} x2={g.x + g.W * fx + 46 * g.s} y2={g.ground - 170 * g.s * r} stroke="#5a3a22" strokeWidth={3 * g.s} />)}
              <WallCannon x={g.x + g.W * fx + 20 * g.s} y={g.ground - 172 * g.s} s={g.sc * 0.9} fire={frame >= T.guns ? ((frame - T.guns + i * 20) % 40) / 13 : 0} />
            </g>
          ))}
          {frame >= T.guns && <Smoke x={g.x + g.W * 0.75} y={g.ground - 140 * g.s} size={160 * g.s} />}
        </g>
      )}
    </Panel>
  );
};

// Cross-section ③: dig the tunnel, stack firewood, light it, the wall sinks.
const TunnelSection = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7tunnel" anchor={P.huaro} start={start} end={end} sky={["#7d8c99", "#cfdde6"]} accent={GOLD}>
      {(g) => {
        const dig = interpolate(frame, [T.dig, T.wood], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const burn = interpolate(frame, [T.light, T.light + 20], [0, 1], clamp);
        const sink = interpolate(frame, [T.sink - 20, T.sink + 15], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const ground = g.ground - 110 * g.s;
        const wx = g.x + g.W * 0.62;
        const tY = ground + 70 * g.s;
        return (
          <g>
            <text x={g.x + 24 * g.s} y={g.y + 90 * g.s} fill="#1b1d24" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>ภาพตัดขวาง ③</text>
            <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#8a6a42" />
            <rect x={g.x} y={ground} width={g.W} height={8 * g.s} fill="#6f8a4a" />
            <path d={`M${g.x + 40 * g.s} ${ground} Q${g.x + 80 * g.s} ${tY} ${g.x + 140 * g.s} ${tY} L${g.x + 140 * g.s + (wx - g.x - 100 * g.s) * dig} ${tY}`} fill="none" stroke="#3a2618" strokeWidth={46 * g.s} strokeLinecap="round" />
            {dig > 0 && dig < 1 && <Shovel x={g.x + 140 * g.s + (wx - g.x - 100 * g.s) * dig} y={tY + 18 * g.s} s={g.s} />}
            {frame >= T.wood && <Firewood x={wx} y={tY + 14 * g.s} s={g.s} />}
            {burn > 0 && <Fire x={wx} y={tY + 10 * g.s} size={40 * g.s * burn} seed={2} />}
            <g transform={`translate(${sink * 20 * g.s},${sink * 60 * g.s}) rotate(${sink * 14},${wx},${ground})`}>
              <rect x={wx - 60 * g.s} y={ground - 170 * g.s} width={120 * g.s} height={170 * g.s} fill={burn > 0.5 ? "#a0583a" : "#e9e1cf"} stroke={INK} strokeWidth={2 * g.s} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${wx - 56 * g.s + i * 30 * g.s} ${ground - 170 * g.s} l0 ${-14 * g.s} q${10 * g.s} ${-14 * g.s} ${20 * g.s} 0 l0 ${14 * g.s} Z`} fill="#efe8d8" stroke={INK} strokeWidth={1.5 * g.s} />)}
              {sink > 0.2 && <path d={`M${wx} ${ground - 170 * g.s} l${-14 * g.s} ${40 * g.s} l${18 * g.s} ${40 * g.s} l${-12 * g.s} ${60 * g.s}`} stroke={INK} strokeWidth={4 * g.s} fill="none" />}
            </g>
            <BurmeseSoldier x={g.x + 70 * g.s} y={ground + 4 * g.s} scale={g.sc * 0.8} pose="stand" hold="spear" />
            <text x={wx + 100 * g.s} y={ground - 120 * g.s} fill="#1b1d24" fontFamily={font} fontWeight={900} fontSize={24 * g.s}>ในเมือง</text>
          </g>
        );
      }}
    </Panel>
  );
};

// The wall falls on "พัง" (7 April 1767).
const FallScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const breach = interpolate(frame, [T.fall - 4, T.fall + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const shake = frame > T.fall - 4 && frame < T.fall + 12 ? Math.sin(frame * 3) * 5 : 0;
  return (
    <Panel id="c7fall" anchor={P.huaro} start={start} end={end} sky={["#3a1a1a", "#c8461f"]}>
      {(g) => (
        <g transform={`translate(${shake * g.s},0)`}>
          <Skyline g={g} color="#2a1a1f" burn={0.4} />
          <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
          <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={95 * g.s} s={g.s} breach={breach} bx={g.x + g.W * 0.5} />
          <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s} k={interpolate(frame, [T.fall, T.fall + 30], [0, 1], clamp)} />
          {[0.12, 0.84].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc} pose="stand" hold="spear" phase={i} flip={fx > 0.5} />)}
        </g>
      )}
    </Panel>
  );
};

// Fire everywhere: temple, palace, houses — each catches on its word.
const BurnScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7burn" anchor={P.ayut} start={start} end={end} sky={["#1a0a0a", "#c8461f"]}>
      {(g) => {
        const on = (f: number) => interpolate(frame, [f, f + 12], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#2b2016" />
            <BellChedi x={g.x + g.W * 0.18} y={g.ground - 6 * g.s} h={190 * g.s} color="#3a2a2a" />
            <ThaiPalace x={g.x + g.W * 0.52} y={g.ground - 6 * g.s} s={g.s * 0.5} />
            {[0.8, 0.92].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 40 * g.s} ${g.ground} L${g.x + g.W * fx - 40 * g.s} ${g.ground - 60 * g.s} L${g.x + g.W * fx} ${g.ground - 100 * g.s} L${g.x + g.W * fx + 40 * g.s} ${g.ground - 60 * g.s} L${g.x + g.W * fx + 40 * g.s} ${g.ground} Z`} fill="#5a3a22" stroke={INK} strokeWidth={1.4 * g.s} />)}
            <Fire x={g.x + g.W * 0.18} y={g.ground - 40 * g.s} size={120 * g.s * on(T.wat)} seed={1} />
            <Fire x={g.x + g.W * 0.52} y={g.ground - 90 * g.s} size={140 * g.s * on(T.wang)} seed={2} />
            <Fire x={g.x + g.W * 0.86} y={g.ground - 60 * g.s} size={110 * g.s * on(T.houses)} seed={3} />
            <Embers x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// A column of captives walking west, escorted.
const CaptiveScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7cap" anchor={P.ayut} start={start} end={end} sky={["#6b5a73", "#d9a87a"]}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#8a7a5a" />
            {Array.from({ length: 7 }, (_, i) => <Townsperson key={i} x={g.x + g.W * (0.95 - i * 0.12 - m * 0.15)} y={g.ground + 8 * g.s} scale={g.sc * 0.75} flip woman={i % 3 === 1} cloth={["#6b5a44", "#7a2f4a", "#2f4f6b"][i % 3]} load={i === 4} phase={i} />)}
            {[0.03, 0.55].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * (fx - m * 0.15) + 30 * g.s} y={g.ground + 8 * g.s} scale={g.sc * 0.85} hold="spear" flip phase={i} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Two versions of the king's end: Wat Sangkhawat at dawn (Thai) / the city gate in smoke (Burmese). No figures.
const KingScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7king" anchor={P.ayut} start={start} end={end} sky={frame >= T.bur ? ["#2a2a3a", "#8a6a6a"] : ["#6b5a73", "#f0a35e"]} accent={GOLD}>
      {(g) => (
        <g>
          {frame < T.thai ? (
            <>
              <ThaiPalace x={g.cx} y={g.ground - 6 * g.s} s={g.s * 0.7} />
              <Fire x={g.cx} y={g.ground - 160 * g.s} size={90 * g.s} seed={4} />
              <Smoke x={g.cx} y={g.ground - 220 * g.s} size={180 * g.s} />
            </>
          ) : frame < T.bur ? (
            <>
              <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#7a6a4a" />
              <BellChedi x={g.x + g.W * 0.35} y={g.ground - 6 * g.s} h={200 * g.s} color="#a0583a" />
              <rect x={g.x + g.W * 0.55} y={g.ground - 90 * g.s} width={160 * g.s} height={84 * g.s} fill="#e9e1cf" stroke={INK} strokeWidth={1.4 * g.s} />
              <path d={`M${g.x + g.W * 0.55 - 14 * g.s} ${g.ground - 90 * g.s} L${g.x + g.W * 0.55 + 80 * g.s} ${g.ground - 150 * g.s} L${g.x + g.W * 0.55 + 174 * g.s} ${g.ground - 90 * g.s} Z`} fill="#a8322a" stroke={INK} strokeWidth={1.4 * g.s} />
              <Parasol x={g.x + g.W * 0.18} y={g.ground + 4 * g.s} s={g.s * 0.8} tilt={70} />
              <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>ฉบับไทย: ใกล้วัดสังฆาวาส</text>
            </>
          ) : (
            <>
              <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#3a3020" />
              <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={120 * g.s} s={g.s} />
              <path d={`M${g.cx - 50 * g.s} ${g.ground} L${g.cx - 50 * g.s} ${g.ground - 80 * g.s} Q${g.cx} ${g.ground - 120 * g.s} ${g.cx + 50 * g.s} ${g.ground - 80 * g.s} L${g.cx + 50 * g.s} ${g.ground} Z`} fill="#1a1010" />
              <Smoke x={g.cx + 80 * g.s} y={g.ground - 60 * g.s} size={140 * g.s} />
              <text x={g.x + 24 * g.s} y={g.y + 92 * g.s} fill="#fff" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>ฉบับพม่า: ถูกยิงระหว่างหนี</text>
            </>
          )}
          {frame >= T.unsure && <text x={g.x + g.W - 60 * g.s} y={g.y + 130 * g.s} textAnchor="middle" fill={GOLD} fontFamily={font} fontWeight={900} fontSize={110 * g.s}>?</text>}
        </g>
      )}
    </Panel>
  );
};

// "กรุงแตก" stamp.
const FellStamp = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.fell || frame > T.fire + 6) return null;
  const k = interpolate(frame, [T.fell, T.fell + 8], [2.4, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [T.fire - 6, T.fire + 6], [1, 0], clamp) }}>
      <div style={{ transform: `scale(${k}) rotate(-8deg)`, border: `${10 * s}px solid ${RED}`, color: RED, borderRadius: 18 * s, padding: `${6 * s}px ${40 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 130 * s, lineHeight: 1.2, background: "rgba(8,14,26,0.65)" }}>กรุงแตก</div>
    </AbsoluteFill>
  );
};

// Captive columns as moving dots along the road to Ava.
const CaptiveDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const path: [number, number][] = [P.ayut, [99.7, 15.6], [98.6, 17.6], [97.4, 19.8], AVA];
  return (
    <g>
      {Array.from({ length: 24 }, (_, i) => {
        const k = ((frame - T.cap) * 0.004 + i / 24) % 1;
        const seg = Math.min(path.length - 2, Math.floor(k * (path.length - 1)));
        const t = k * (path.length - 1) - seg;
        const pt: [number, number] = [path[seg][0] + (path[seg + 1][0] - path[seg][0]) * t, path[seg][1] + (path[seg + 1][1] - path[seg][1]) * t];
        const p = projection(pt);
        return p ? <circle key={i} cx={p[0]} cy={p[1]} r={6 * s} fill="#ffd38a" stroke="#1b1d24" strokeWidth={1.5 * s} /> : null;
      })}
    </g>
  );
};

export const ch7: Chapter = {
  name: "คืนกรุงแตก",
  from: B.huaro.start,
  to: END,
  cams: (w, h) => [
    { frame: T.huaro, cam: view(V.island, w, h, 0.9) },
    { frame: T.corner + 30, cam: view(V.island, w, h, 1.6) },
    { frame: T.fire, cam: view(V.island, w, h, 1.4) },
    { frame: T.cap, cam: view(V.island, w, h, 1.4) },
    { frame: T.cap + 40, cam: view(V.central, w, h, 0.45, 0.04) },
    { frame: T.king, cam: view(V.central, w, h, 0.45, 0.04) },
    { frame: T.king + 35, cam: view(V.island, w, h, 1.1) },
    { frame: T.end, cam: view(V.island, w, h, 1.1) },
    { frame: T.end + 60, cam: view(V.island, w, h, 0.6) },
  ],
  years: [[T.huaro, "2310 · เมษายน"], [T.col, "2310 · 7 เมษายน"], [T.end, "1893 – 2310"]],
  heads: [
    { f: T.huaro, tag: "พม่าเลือกจุดบุก", head: "มุมตะวันออกเฉียงเหนือ", color: RED },
    { f: T.name, tag: "จุดบุก", head: "หัวรอ", color: RED, chips: [{ text: "แม่น้ำแคบ", f: T.narrow - 15 }, { text: "หน้าแล้งน้ำลด", f: T.narrow + 10 }] },
    { f: T.forts, tag: "สร้างป้อมสูงประชิดกำแพง", head: "ยิงทั้งวันทั้งคืน", color: RED },
    { f: T.d3, tag: "ภาพตัดขวาง ③", head: "ไม้ตายอยู่ใต้ดิน", color: GOLD, chips: [{ text: "ขุดอุโมงค์", f: T.dig }, { text: "สุมฟืน", f: T.wood }, { text: "จุดไฟ", f: T.light }, { text: "ฐานทรุด", f: T.sink }] },
    { f: T.col, tag: "7 เมษายน 2310", head: "กำแพงพัง", color: RED },
    { f: T.breach, tag: "ตกค่ำ", head: "ทหารพม่าบุกเข้าเมือง", color: RED },
    { f: T.months, tag: "กรุงศรีอยุธยาแตก", head: "หลังถูกล้อม", stat: "14 เดือน", color: RED },
    { f: T.fire, tag: "ไฟไหม้หลายวัน", head: "ทั่วทั้งเมือง", color: RED, chips: [{ text: "วัด", f: T.wat }, { text: "วัง", f: T.wang }, { text: "บ้านเรือน", f: T.houses }] },
    { f: T.cap, tag: "ถูกต้อนไปพม่า", head: "เชลยหลายหมื่นคน", color: RED, chips: [{ text: "เจ้านาย", f: T.who + 8 }, { text: "ขุนนาง", f: T.who + 22 }, { text: "ช่างฝีมือ", f: T.who + 45 }, { text: "ชาวบ้าน", f: T.who + 70 }] },
    { f: T.king, tag: "พระเจ้าเอกทัศ", head: "มีสองฉบับอีกแล้ว", color: GOLD },
    { f: T.unsure, tag: "จนวันนี้", head: "ยังไม่มีใครรู้แน่", color: GOLD },
    { f: T.end, tag: "ราชธานี", head: "ปิดฉากในคืนนั้น", stat: (f) => `${Math.round(interpolate(f, [T.end + 6, T.end + 50], [0, 417], clamp))} ปี`, color: RED },
  ],
  night: (f) => (f < T.forts ? 0.3 : f < T.d3 ? interpolate(f, [T.forts, T.d3], [0.3, 0.8], clamp) : f < T.col ? 0.6 : f < T.end + 60 ? 1 : interpolate(f, [T.end + 60, END], [1, 0.4], clamp)),
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <CityRing k={interpolate(frame, [T.huaro, T.huaro + 15, T.cap, T.cap + 15], [0, 1, 1, 0], clamp)} color={RED} />
        {frame >= T.corner && frame < T.cap && <PointLabel at={P.huaro} text="หัวรอ" start={T.corner} color={RED} size={0.85} />}
        {frame >= T.breach && frame < T.fire + 10 && (
          <>
            <Arrow points={[[100.6, 14.4], [100.585, 14.375], [100.572, 14.362]]} start={T.breach + 20} end={T.breach + 45} color={RED} width={20} />
            <Arrow points={[[100.61, 14.37], [100.59, 14.364], [100.575, 14.358]]} start={T.breach + 28} end={T.breach + 53} color={RED} width={16} />
          </>
        )}
        {frame >= T.cap && frame < T.king + 20 && (
          <>
            <Arrow points={[P.ayut, [99.7, 15.6], [98.6, 17.6], [97.4, 19.8], AVA]} start={T.cap} end={T.cap + 40} color={RED} width={10} variant="dashed" />
            <CaptiveDots />
            <PointLabel at={AVA} text="อังวะ" start={T.cap + 30} color={RED} size={0.7} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <PickScene start={T.huaro} end={T.name + 14} />
      <NarrowScene start={T.name} end={T.forts + 14} />
      <FortScene start={T.forts} end={T.d3 + 14} />
      <TunnelSection start={T.d3} end={T.col + 14} />
      <FallScene start={T.col} end={T.breach + 14} />
      <StormScene id="c7storm" start={T.breach} end={T.fire + 14} />
      <BurnScene start={T.fire} end={T.cap + 14} />
      <CaptiveScene start={T.cap} end={T.king + 14} />
      <KingScene start={T.king} end={T.end + 14} />
      <RuinScene start={T.end} end={END + 14} />
    </>
  ),
  Screen: () => <FellStamp />,
  sfx: [
    [T.huaro, SFX.whoosh, 0.35],
    [T.name, SFX.pop, 0.35],
    [T.guns, SFX.hit, 0.35],
    [T.guns + 20, SFX.hit, 0.3],
    [T.guns + 40, SFX.hit, 0.3],
    [T.d3, SFX.riser, 0.25],
    [T.dig, SFX.tick, 0.3],
    [T.light, SFX.swell, 0.3],
    [T.sink, SFX.hit, 0.45],
    [T.fall, SFX.hit, 0.7],
    [T.breach, SFX.whoosh, 0.35],
    [T.fell, SFX.hit, 0.7],
    [T.wat, SFX.pop, 0.3],
    [T.wang, SFX.pop, 0.3],
    [T.houses, SFX.pop, 0.3],
    [T.cap, SFX.whoosh, 0.35],
    [T.unsure, SFX.tick, 0.35],
    [T.close, SFX.hit, 0.55],
  ],
};
