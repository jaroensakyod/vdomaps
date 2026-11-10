// "อยุธยาไม่มีนาฬิกา ไม่มีตู้เย็น อยู่กันยังไง?" — vertical short (1080 x 1920, 30 fps). Painted AI backgrounds
// (public/oldsiam/bg, labelled ภาพประกอบ) with our SVG cast on top, a slow camera per scene, a new picture on the spoken
// word every few seconds, word-timed captions from timing.json (voice beats laid out by subs.mjs buildBeats).
// Frame numbers below come from the aligned words (print them with the snippet in episodes/oldsiam/NOTES.md).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/Kanit";
import { NaiMan, Cat, Mouse, Fish, Cowrie, INK } from "./cast";
import { Envoy, Stick, Quill, Pot, Rings, Burst, NoClock, NoFridge, Sun, Moon, Question, Stink, Mustard, Flag } from "./props";
import { Caption } from "../../components/Caption";
import { buildBeats, LAYOUT } from "../../components/subs.mjs";
import timing from "./timing.json";
import beatsJson from "./beats.json";

const { fontFamily } = loadFont("normal", { weights: ["600", "700"], subsets: ["thai", "latin"] });
const BEATS = buildBeats(timing, beatsJson);
export const OLDSIAM_FRAMES = BEATS[BEATS.length - 1].end + LAYOUT.tail;

// ---------------- helpers ----------------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => { const u = clamp(x); return u * u * (3 - 2 * u); };
/** 0 before t0, overshoot pop over 8 frames, 1 after */
const pop = (f: number, t0: number) => { const n = f - t0; return n < 0 ? 0 : n >= 8 ? 1 : [0.25, 0.6, 0.95, 1.15, 1.18, 1.1, 1.03, 1.0][n]; };
/** eyelid: a 4-frame blink every 70-120 frames, seeded */
const lid = (f: number, seed: number) => { const p = 70 + ((seed * 37) % 50), k = (f + seed * 13) % p; return k < 4 ? [0.5, 1, 1, 0.5][k] : 0; };
/** 0..1 progress of a strike's rings over 18 frames */
const ring = (f: number, t0: number, len = 18) => (f >= t0 && f < t0 + len ? (f - t0) / len : -1);
const At: React.FC<{ x: number; y: number; s?: number; r?: number; children: React.ReactNode }> = ({ x, y, s = 1, r = 0, children }) =>
  s <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>{children}</g>;
const Shadow: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <ellipse cx={x} cy={y} rx={r} ry={r * 0.18} fill="#2a1a12" opacity={0.28} />;
const BigWord: React.FC<{ f: number; t0: number; text: string; x: number; y: number }> = ({ f, t0, text, x, y }) => {
  const s = pop(f, t0), fade = clamp(1 - (f - t0 - 50) / 12);
  return s > 0 && fade > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={fade}>
      <text textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={190} fill="#ffe08a" stroke={INK} strokeWidth={22} paintOrder="stroke">{text}</text>
    </g>
  ) : null;
};
/** a drum on a low stand (for scenes whose painting has no drum near the drummer) */
const SmallDrum: React.FC<{ x: number; y: number; hit: number }> = ({ x, y, hit }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-90,0 L-60,-150 M90,0 L60,-150" stroke={INK} strokeWidth={12} />
    <g transform={`translate(0 ${hit > 0 && hit < 0.2 ? 5 : 0})`}>
      <path d="M-120,-330 Q-150,-230 -120,-130 L120,-130 Q150,-230 120,-330 Z" fill="#b5352e" stroke={INK} strokeWidth={9} />
      <path d="M-128,-300 L128,-300 M-128,-160 L128,-160" stroke="#7a2420" strokeWidth={8} />
      <ellipse cx={-122} cy={-230} rx={30} ry={102} fill="#ecdcbc" stroke={INK} strokeWidth={9} />
    </g>
  </g>
);

// ---------------- scenes ----------------
type Key = { f: number; z: number; x: number; y: number };
type Scene = { a: number; bg: string; keys: Key[]; tint?: (f: number) => [string, number]; draw: (f: number) => React.ReactNode };
const SCENES: Scene[] = [
  { // hook: the city at dusk; no clock, no fridge
    a: 0, bg: "city", keys: [{ f: 0, z: 1.0, x: 0.5, y: 0.55 }, { f: 175, z: 1.16, x: 0.5, y: 0.5 }],
    draw: (f) => <>
      <Shadow x={640} y={1700} r={150} /><NaiMan x={640} y={1700} h={760} look={f < 120 ? -1 : 0} brows={0.4} mouth={f > 150 ? "o" : "smile"} blink={lid(f, 1)} />
      <At x={290} y={760} s={pop(f, 40)}><NoClock /></At>
      <At x={800} y={900} s={pop(f, 94)}><NoFridge /></At>
    </>,
  },
  { // ...because of a cat guarding the drum
    a: 160, bg: "tower3", keys: [{ f: 160, z: 1.18, x: 0.5, y: 0.7 }, { f: 260, z: 1.0, x: 0.5, y: 0.6 }],
    draw: (f) => <>
      <Shadow x={720} y={1420} r={110} />
      <Cat x={720} y={1424} h={250 * Math.min(1, pop(f, 180))} flip look={-1} tail={Math.sin(f / 9) * 0.6} blink={lid(f, 2)} head={f > 199 ? -6 : 0} />
    </>,
  },
  { // three storeys, painted red: tilt up the tower
    a: 261, bg: "tower3", keys: [{ f: 261, z: 1.25, x: 0.6, y: 0.66 }, { f: 300, z: 1.25, x: 0.6, y: 0.62 }, { f: 345, z: 1.6, x: 0.6, y: 0.3 }],
    tint: (f) => ["#c8302a", 0.18 * clamp(1 - Math.abs(f - 378) / 14)],
    draw: (f) => <>{[[0.6, 0.64, 318], [0.6, 0.46, 325], [0.6, 0.28, 332]].map(([x, y, t0]) => (
      <At key={t0} x={x * 1080} y={y * 1920} s={pop(f, t0)}><circle r={120} fill="none" stroke="#ffe08a" strokeWidth={14} opacity={clamp(1 - (f - t0) / 40)} /></At>))}</>,
  },
  { // top storey: watching for enemies
    a: 396, bg: "tower_top", keys: [{ f: 396, z: 1.0, x: 0.5, y: 0.5 }, { f: 440, z: 1.1, x: 0.6, y: 0.35 }],
    draw: (f) => <>
      {[0, 1, 2, 3, 4].map((k) => <At key={k} x={640 + k * 46} y={560 + (k % 2) * 8} s={0.55 * pop(f, 404 + k * 2)}><Flag /></At>)}
      <NaiMan x={300} y={1800} h={720} look={1} brows={-0.7} mouth="o" armR={150} elbowR={70} blink={lid(f, 3)} />
    </>,
  },
  { // middle storey: fire. outside the walls 3 strikes, inside the walls until it is out
    a: 426, bg: "fire_night", keys: [{ f: 426, z: 1.0, x: 0.45, y: 0.45 }, { f: 600, z: 1.15, x: 0.45, y: 0.5 }],
    draw: (f) => {
      const hits = [551, 563, 571, ...Array.from({ length: 7 }, (_, k) => 612 + k * 7)];
      const last = hits.filter((h) => f >= h).pop() ?? -99, swing = f - last < 4 ? 1 : 0;
      const glow = (f < 479 ? 0.5 : 0.9 + 0.1 * Math.sin(f / 2)) * (f > 656 ? clamp(1 - (f - 656) / 20) : 1);
      return <>
        <defs><radialGradient id="fireGlow"><stop offset="0" stopColor="#ffb04a" stopOpacity={0.55 * glow} /><stop offset="1" stopColor="#ff7a2a" stopOpacity={0} /></radialGradient></defs><circle cx={500} cy={820} r={340} fill="url(#fireGlow)" />
        <SmallDrum x={620} y={1770} hit={(f - last) / 8} />
        {hits.map((h) => ring(f, h) >= 0 ? <At key={h} x={498} y={1540}><Rings u={ring(f, h)} r={150} /></At> : null)}
        <NaiMan x={300} y={1780} h={700} look={1} brows={-0.6} mouth={f > 600 ? "wow" : "o"} armR={swing ? 120 : 70} elbowR={swing ? 40 : -10} hold={<Stick rot={swing ? 40 : -10} />} blink={lid(f, 4)} />
      </>;
    },
  },
  { // bottom storey: the big drum tells the time — noon, evening, night
    a: 691, bg: "drum_close", keys: [{ f: 691, z: 1.0, x: 0.5, y: 0.45 }, { f: 935, z: 1.1, x: 0.56, y: 0.4 }],
    tint: (f) => (f >= 863 ? ["#1d2a5a", 0.4] : f >= 825 ? ["#e0782a", 0.2] : ["#000000", 0]),
    draw: (f) => {
      const hits = [756, 798, 825, 863], last = hits.filter((h) => f >= h).pop() ?? -99, swing = f - last < 4;
      return <>
        {hits.map((h) => ring(f, h, 22) >= 0 ? <At key={h} x={640} y={580}><Rings u={ring(f, h, 22)} r={220} /></At> : null)}
        <At x={200} y={560} s={f >= 798 && f < 825 ? pop(f, 798) : 0}><Sun /></At>
        <At x={200} y={560} s={f >= 825 && f < 863 ? pop(f, 825) : 0}><Sun low /></At>
        <At x={200} y={560} s={f >= 863 ? pop(f, 863) : 0}><Moon /></At>
        <Shadow x={470} y={1720} r={150} />
        <NaiMan x={470} y={1720} h={760} look={1} brows={0.3} mouth="smile" armR={swing ? 165 : 140} elbowR={swing ? 10 : 40} hold={<Stick rot={swing ? 60 : 20} />} blink={lid(f, 5)} />
      </>;
    },
  },
  { // the problem: mice chew the drum
    a: 925, bg: "drum_close", keys: [{ f: 925, z: 1.2, x: 0.68, y: 0.32 }, { f: 1030, z: 1.3, x: 0.68, y: 0.32 }],
    draw: (f) => <>
      {[0, 1].map((k) => {
        const x = interpolate(f, [961 + k * 6, 990 + k * 6], [1180, 860 + k * 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return f >= 961 ? <Mouse key={k} x={x} y={560 + k * 70} h={95} flip step={f < 995 ? (f / 6) % 1 : 0} /> : null;
      })}
      {f >= 1004 ? <At x={790} y={560}><Burst u={((f - 1004) % 12) / 12} r={40} col="#e9d9b8" /></At> : null}
    </>,
  },
  { // so the keeper raised a cat
    a: 1032, bg: "drum_close", keys: [{ f: 1032, z: 1.0, x: 0.5, y: 0.5 }, { f: 1100, z: 1.05, x: 0.5, y: 0.55 }],
    draw: (f) => <>
      {[0, 1].map((k) => {
        const x = f < 1081 ? 700 + k * 90 : 700 + k * 90 + (f - 1081) * 38;
        return x < 1200 ? <Mouse key={k} x={x} y={588 - k * 4} h={56} step={f >= 1081 ? (f / 4) % 1 : 0} /> : null;
      })}
      <Shadow x={420} y={1720} r={130} />
      <Cat x={420} y={1724} h={320 * pop(f, 1053)} look={1} head={-8} tail={Math.sin(f / 7) * 0.7} mouth={f > 1078 && f < 1095 ? "open" : "closed"} blink={lid(f, 6)} />
    </>,
  },
  { // collecting five cowries from each stall, fish for the cat
    a: 1092, bg: "market", keys: [{ f: 1092, z: 1.0, x: 0.45, y: 0.55 }, { f: 1250, z: 1.1, x: 0.55, y: 0.6 }],
    draw: (f) => {
      const x = interpolate(f, [1100, 1205], [180, 620], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const walking = f > 1100 && f < 1205;
      const drops = [1160, 1175, 1187];
      const coins = drops.filter((d) => f >= d + 10).length;
      return <>
        {drops.map((d, k) => {
          const u = (f - d) / 10;
          if (u < 0 || u > 1) return null;
          const sx = 180 + k * 150, sy = 1180, ex = x + 60, ey = 1420;
          return <Cowrie key={d} x={sx + (ex - sx) * u} y={sy + (ey - sy) * u - 160 * Math.sin(Math.PI * u)} w={60} rot={u * 300} />;
        })}
        <Shadow x={x} y={1760} r={140} />
        <NaiMan x={x} y={1760} h={700} step={walking ? ((f - 1100) / 22) % 1 : 0} mouth="smile" look={-1} brows={0.4} armR={40} elbowR={-50} hold={<At x={20} y={20}><Pot coins={coins} /></At>} blink={lid(f, 7)} />
        <Shadow x={900} y={1780} r={110} />
        <Cat x={900} y={1784} h={260 * pop(f, 1217)} flip look={-1} mouth={f > 1233 ? (Math.floor(f / 5) % 2 ? "open" : "chew") : "closed"} blink={lid(f, 8)} tail={Math.sin(f / 8) * 0.5} />
        {f >= 1221 ? <Fish x={820} y={1772} w={130 * pop(f, 1221)} rot={10} /> : null}
      </>;
    },
  },
  { // โมง: the gong by day
    a: 1265, bg: "gong", keys: [{ f: 1265, z: 1.0, x: 0.45, y: 0.55 }, { f: 1470, z: 1.15, x: 0.42, y: 0.55 }],
    draw: (f) => {
      const hit = 1385, sw = f >= hit - 3 && f < hit + 2;
      return <>
        {ring(f, hit, 26) >= 0 ? <At x={420} y={1060}><Rings u={ring(f, hit, 26)} r={260} col="#ffe7a0" /></At> : null}
        <BigWord f={f} t0={hit} text="โมง" x={540} y={560} />
        <NaiMan x={770} y={1780} h={720} look={-1} brows={0.3} mouth={f > hit ? "grin" : "smile"} armR={sw ? 120 : 70} elbowR={sw ? 20 : -20} flip hold={<Stick rot={sw ? -70 : -20} />} blink={lid(f, 9)} />
      </>;
    },
  },
  { // ทุ่ม: the drum by night
    a: 1476, bg: "drum_close", keys: [{ f: 1476, z: 1.08, x: 0.55, y: 0.4 }, { f: 1563, z: 1.15, x: 0.58, y: 0.38 }],
    tint: () => ["#1d2a5a", 0.42],
    draw: (f) => {
      const hit = 1484, sw = f >= hit - 3 && f < hit + 3;
      return <>
        {ring(f, hit, 26) >= 0 ? <At x={640} y={580}><Rings u={ring(f, hit, 26)} r={260} /></At> : null}
        <At x={200} y={560}><Moon /></At>
        <BigWord f={f} t0={hit} text="ทุ่ม" x={720} y={900} />
        <NaiMan x={470} y={1720} h={760} look={1} mouth="smile" armR={sw ? 165 : 140} elbowR={sw ? 10 : 40} hold={<Stick rot={sw ? 60 : 20} />} blink={lid(f, 10)} />
      </>;
    },
  },
  { // and with no fridge?
    a: 1563, bg: "kitchen", keys: [{ f: 1563, z: 1.0, x: 0.5, y: 0.55 }, { f: 1640, z: 1.08, x: 0.45, y: 0.6 }],
    draw: (f) => <>
      <Shadow x={380} y={1770} r={140} />
      <NaiMan x={380} y={1770} h={720} brows={-0.8} mouth="o" look={1} tilt={-3} armR={150} elbowR={110} blink={lid(f, 11)} />
      <At x={420} y={940} s={pop(f, 1591)} r={Math.sin(f / 6) * 6}><Question /></At>
    </>,
  },
  { // La Loubère, French envoy of King Narai, wrote it down
    a: 1628, bg: "loubere", keys: [{ f: 1628, z: 1.0, x: 0.5, y: 0.55 }, { f: 1767, z: 1.12, x: 0.45, y: 0.62 }],
    draw: (f) => {
      const writing = f >= 1716;
      return <>
        <Shadow x={760} y={1780} r={140} />
        <Envoy x={760} y={1780} h={760} flip armR={writing ? 60 + 6 * Math.sin(f / 2) : 25} elbowR={writing ? 70 : 30} hold={writing ? <Quill /> : undefined}
          mouth={f < 1716 ? "smile" : "flat"} look={writing ? -1 : 0} blink={lid(f, 12)} />
      </>;
    },
  },
  { // rice and fish — not fresh: fermented or dried
    a: 1767, bg: "kitchen", keys: [{ f: 1767, z: 1.0, x: 0.5, y: 0.6 }, { f: 1860, z: 1.07, x: 0.5, y: 0.6 }, { f: 1876, z: 1.5, x: 0.2, y: 0.42 }, { f: 1894, z: 1.5, x: 0.5, y: 0.38 }, { f: 1965, z: 1.58, x: 0.5, y: 0.37 }],
    draw: (f) => <>
      <Shadow x={620} y={1770} r={140} />
      <NaiMan x={620} y={1770} h={720} flip brows={f > 1823 ? -0.5 : 0.5} mouth={f > 1823 ? "flat" : "grin"} armR={70} elbowR={-40}
        hold={f >= 1800 ? <g><Fish x={0} y={-10} w={170 * pop(f, 1800)} rot={-20} />{f >= 1824 ? <path d="M-60,-70 L60,50 M60,-70 L-60,50" stroke="#d63a2f" strokeWidth={14} strokeLinecap="round" /> : null}</g> : undefined} blink={lid(f, 13)} />
    </>,
  },
  { // pla ra = "rotten fish", kapi = like mustard
    a: 1949, bg: "jars", keys: [{ f: 1949, z: 1.15, x: 0.36, y: 0.48 }, { f: 1984, z: 1.17, x: 0.36, y: 0.48 }, { f: 2004, z: 1.25, x: 0.52, y: 0.55 }, { f: 2080, z: 1.3, x: 0.55, y: 0.55 }],
    draw: (f) => <>
      {f >= 1960 ? <At x={360} y={850}><Stink t={f / 30} /></At> : null}
      {f >= 1991 ? <circle cx={575} cy={1060} r={120} fill="none" stroke="#ffe08a" strokeWidth={12} opacity={clamp(1 - (f - 1991) / 30)} /> : null}
      <At x={780} y={960} s={pop(f, 2047)}><Mustard /></At>
      <Envoy x={900} y={1960} h={640} flip pinch={f >= 1969 && f < 2030} brows={f >= 2040 ? 0.6 : -0.6} mouth={f >= 2040 ? "smile" : "flat"} look={-1} blink={lid(f, 14)} />
    </>,
  },
  { // so: people ate fermented fish, the cat ate fish paid for by the market
    a: 2084, bg: "tower3", keys: [{ f: 2084, z: 1.15, x: 0.5, y: 0.66 }, { f: 2260, z: 1.0, x: 0.5, y: 0.6 }],
    draw: (f) => <>
      <Shadow x={260} y={1720} r={130} />
      <NaiMan x={260} y={1720} h={640} mouth={f > 2112 ? "grin" : "smile"} brows={0.5} armR={70} elbowR={-50} hold={<Fish x={0} y={-10} w={150} rot={-25} dried />} blink={lid(f, 15)} />
      <Shadow x={790} y={1724} r={110} />
      <Cat x={790} y={1726} h={290} flip look={-1} mouth={f > 2166 ? (Math.floor(f / 5) % 2 ? "open" : "chew") : "closed"} tail={Math.sin(f / 8) * 0.6} blink={lid(f, 16)} />
      {f >= 2166 ? <Fish x={700} y={1716} w={130} rot={8} /> : null}
      {[0, 1, 2, 3, 4].map((k) => <At key={k} x={700 + k * 45} y={1380 - (k % 2) * 30} s={pop(f, 2205 + k * 3)} r={k * 30}><Cowrie x={0} y={0} w={64} /></At>)}
    </>,
  },
];

const camAt = (keys: Key[], f: number) => {
  let c = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i], p = keys[i - 1];
    if (f <= p.f) break;
    const u = ease((f - p.f) / Math.max(1, k.f - p.f));
    c = { f, z: p.z + (k.z - p.z) * u, x: p.x + (k.x - p.x) * u, y: p.y + (k.y - p.y) * u };
    if (f < k.f) break;
  }
  return c;
};

const SceneView: React.FC<{ s: Scene; f: number; alpha: number }> = ({ s, f, alpha }) => {
  const c = camAt(s.keys, f);
  const [tc, ta] = s.tint ? s.tint(f) : ["#000", 0];
  return (
    <AbsoluteFill style={{ opacity: alpha, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: `${c.x * 100}% ${c.y * 100}%`, transform: `scale(${c.z})` }}>
        <Img src={staticFile(`oldsiam/bg/${s.bg}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {ta > 0 ? <AbsoluteFill style={{ background: tc, opacity: ta, mixBlendMode: "multiply" }} /> : null}
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>{s.draw(f)}</svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const XF = 14; // crossfade frames between scenes
export const OldSiamShort: React.FC = () => {
  const f = useCurrentFrame();
  const i = SCENES.reduce((acc, s, k) => (f >= s.a ? k : acc), 0);
  const cur = SCENES[i], next = SCENES[i + 1];
  // the next scene fades in over the XF frames before its start (the outgoing one stays fully drawn underneath)
  const fadeNext = next && f >= next.a - XF ? (f - (next.a - XF)) / XF : 0;
  return (
    <AbsoluteFill style={{ background: "#21160f" }}>
      <SceneView s={cur} f={f} alpha={1} />
      {fadeNext > 0 && next.bg !== cur.bg ? <SceneView s={next} f={f} alpha={fadeNext} /> : null}
      {BEATS.map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} start={b.start} len={b.len} words={b.words} font={fontFamily} top={0.11} />
      ))}
      <div style={{ position: "absolute", right: 30, top: 34, padding: "4px 14px", borderRadius: 10, background: "rgba(20,14,10,0.45)",
        color: "#f6ecd8", fontFamily, fontSize: 26 }}>ภาพประกอบ</div>
    </AbsoluteFill>
  );
};
