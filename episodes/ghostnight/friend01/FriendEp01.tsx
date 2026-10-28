// เพื่อนรัก ตอน 1 · กลับมาไม่เหมือนเดิม — 9:16. Shared engine (engine.tsx); Flow sets blurred + 2.5D under the Slim cast.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Flow25DScreen, FlowWarm } from "../../../components/Flow25D";
import { Bed, Hit, lib, SFX, Sfx } from "../../../components/Sound";
import { makeEpisode, type Scenes } from "../engine";
import { C, Chip, ClueRing, EndCard, H, Onomato, Stamp, UI, W } from "../kit";
import { Slim, type SlimArm, type SlimLook, type SlimProps, SLIM_FON, SLIM_FON_THIN, SLIM_KID, SLIM_MOM, SLIM_PRAE } from "../slim";
import BEATS from "./beats.json";
import TIMING from "./timing.json";

const EP = makeEpisode(BEATS, TIMING, {
  dialogue: ["m1", "f1", "mf1", "mf2", "mf3", "mf4", "f2", "p25", "p27", "p29", "p30", "f3"],
  hl: ["ฝน", "แพร", "เหล้า", "มีด", "ไม่สบตา", "ห้ามบอกแม่", "18", "400", "อีกคน", "ทหาร"],
  noCaption: ["next", "ask"],
});
export const FRIEND01_FRAMES = EP.frames;
const { at, talkOf } = EP;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Prae's mother and the soldier: variations on the cast looks
const PRAE_MOM: SlimLook = { ...SLIM_MOM, top: "#9cb7d1", topShade: "#7a95b0", pants: "#3e5a4a", pattern: "#2c4436", print: undefined };
const SOLDIER: SlimLook = { skin: "#b8835a", skinShade: "#946240", hair: "#15110f", top: "#4b5a3a", topShade: "#38452a", pants: "#4b5a3a", shoes: "#1c1a18", hairStyle: "short" };
const PRAE_KID: SlimLook = { ...SLIM_PRAE, top: "#e0e6ea", topShade: "#b9c2c8", pants: "#3d3f6b" };

const NIGHT: CSSProperties = { filter: "brightness(0.62) saturate(0.7) contrast(1.05)" };
const PAST: CSSProperties = { filter: "sepia(0.55) saturate(0.75) contrast(1.02) brightness(0.95)" };
const MOON = "#9fc4ff";

const blink = (F: number) => {
  const p = F % 97;
  return p < 4 ? Math.abs(p - 2) / 2 : 1;
};
// background: one Flow set, blurred (depth of field), slow 2.5D drift over the shot
const bg = (name: string, d: number, o: { dark?: boolean; blur?: number; zoom?: [number, number]; pan?: number; light?: number } = {}): ReactNode => (
  <AbsoluteFill style={{ filter: `blur(${o.blur ?? 6}px) brightness(${o.dark ? 0.78 : o.light ?? 0.92})` }}>
    <Flow25DScreen name={name} id={`${name}-${d}`} start={0} end={d} zoom={o.zoom ?? [1.04, 1.1]} pan={o.pan ?? 0.4} parallax={24} dust={false} />
  </AbsoluteFill>
);
// a cast member with shared defaults: blink on the global frame, mouth from the dialogue beats
const P = (who: string | null, F: number, p: Omit<SlimProps, "f">) => <Slim {...p} f={F} eyesOpen={(p.eyesOpen ?? 1) * blink(F + (p.x % 37))} mouth={p.mouth ?? (who ? talkOf(who, F) : 0)} />;
const arm = (sh: number, el: number, wr = 0, hold?: SlimArm["hold"]): SlimArm => ({ sh, el, wr, hold });
const Hammock = ({ x, y, w, color }: { x: number; y: number; w: number; color: string }) => (
  <g>
    <path d={`M${x - w / 2 - 60},${y - 140} L${x - w / 2},${y - 20} M${x + w / 2 + 60},${y - 140} L${x + w / 2},${y - 20}`} stroke="#5a4636" strokeWidth={6} />
    <path d={`M${x - w / 2},${y - 20} Q${x},${y + 130} ${x + w / 2},${y - 20} Q${x},${y + 40} ${x - w / 2},${y - 20} Z`} fill={color} />
    <path d={`M${x - w / 2},${y - 20} Q${x},${y + 130} ${x + w / 2},${y - 20}`} stroke="#000" strokeWidth={4} opacity={0.25} fill="none" />
  </g>
);
const Bench = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <g>
    <rect x={x - w / 2} y={y - 270} width={w} height={26} rx={6} fill="#8a6a46" />
    <rect x={x - w / 2} y={y - 252} width={w} height={8} fill="#5e4630" />
    {[x - w / 2 + 20, x + w / 2 - 34].map((lx) => <rect key={lx} x={lx} y={y - 250} width={14} height={250} fill="#5e4630" />)}
  </g>
);

const SCENES: Scenes = {
  hookMachete: ({ f, d, F }) => ({
    bg: bg("f1-banana-night", d, { dark: true, zoom: [1.1, 1.16] }),
    svg: P(null, F, { id: "hk", x: 560, y: 2000, s: 1.2, look: SLIM_FON_THIN, rim: MOON, gaze: 1, brow: -0.9, mouth: 0.35, front: arm(40 + 70 * Math.max(0, Math.sin(f / 5)), -20, 6, "knife") }),
    svgStyle: NIGHT,
    html: (
      <>
        <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontFamily: UI }}>
          <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.15, color: "#fff", textShadow: "0 0 26px #000, 0 4px 0 #000" }}>เพื่อนกลับมา…</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.15, color: "#ffb4b4", textShadow: `0 0 30px ${C.red}, 0 4px 0 #000` }}>แต่ไม่ใช่คนเดิม</div>
        </div>
        {f > 8 && <Onomato text="ฉับ!" f={f - 8} x={820} y={1020} size={110} hot={0} />}
      </>
    ),
    zoom: [1, 1.05],
    origin: [560, 1200],
    shake: f < 10 ? (10 - f) * 1.2 : 0,
  }),
  title: ({ f, d }) => ({
    bg: bg("f1-banana-night", d, { dark: true, blur: 16 }),
    svg: <rect width={W} height={H} fill="#000" opacity={0.45} />,
    html: (
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", fontFamily: UI, opacity: interpolate(f, [0, 6, d - 6, d], [0, 1, 1, 0.3], clamp) }}>
        <div style={{ fontSize: 170, fontWeight: 800, color: "#fff", textShadow: "0 0 30px #c2185b, 0 0 70px #c2185b" }}>เพื่อนรัก</div>
        <div style={{ marginTop: 24, fontSize: 60, fontWeight: 700, color: "#ffc6d6" }}>EP.1 · กลับมาไม่เหมือนเดิม</div>
      </div>
    ),
  }),
  pastField: ({ f, d, F }) => ({
    bg: bg("f1-ricefield-past", d),
    svg: (
      <>
        {P(null, F, { id: "pk1", x: 300 + f * 2.2, y: 1780, s: 0.62, head: 1.25, look: PRAE_KID, gaze: 1, mouth: 0.4, front: arm(30 * Math.sin(f / 4), 10), back: arm(-30 * Math.sin(f / 4), 10) })}
        {P(null, F, { id: "pk2", x: 470 + f * 2.2, y: 1790, s: 0.6, head: 1.25, look: SLIM_KID, gaze: -1, mouth: 0.3, front: arm(-30 * Math.sin(f / 4), 10), back: arm(30 * Math.sin(f / 4), 10) })}
      </>
    ),
    html: <Chip text="ตอนเด็ก" f={f - 4} y={230} border="#d8c08a" />,
    style: PAST,
  }),
  pastFieldKids: ({ f, d, F }) => ({
    bg: bg("f1-ricefield-past", d, { zoom: [1.12, 1.18] }),
    svg: (
      <>
        {P(null, F, { id: "pq1", x: 360, y: 1900, s: 0.9, head: 1.25, look: PRAE_KID, gaze: 1, brow: -0.3, front: arm(20, 30) })}
        {P(null, F, { id: "pq2", x: 700, y: 1910, s: 0.88, head: 1.25, look: SLIM_KID, flip: true, gaze: 1, tilt: -6 })}
      </>
    ),
    style: PAST,
    zoom: [1, 1.05],
  }),
  pastCity: ({ f, d, F }) => ({
    bg: bg("f1-market", d),
    svg: (
      <>
        {P(null, F, { id: "pc1", x: 380, y: 1800, s: 0.86, look: SLIM_PRAE, gaze: 1, front: arm(10, 20) })}
        {P(null, F, { id: "pc2", x: 680, y: 1810, s: 0.85, look: SLIM_FON, flip: true, gaze: 1, tilt: -4, mouth: 0.3 })}
      </>
    ),
    html: <Chip text="อายุ 16 เข้าเมืองไปทำงาน" f={f - 4} y={230} border="#d8c08a" />,
    style: PAST,
  }),
  split: ({ f, d, F }) => {
    const gap = interpolate(f, [0, d], [0, 160], clamp);
    return {
      bg: bg("f1-ricefield-past", d, { blur: 10, light: 0.7 }),
      svg: (
        <>
          {P(null, F, { id: "sp1", x: 330 - gap, y: 1800, s: 0.85, look: SLIM_FON, flip: true, gaze: 0.5 })}
          {P(null, F, { id: "sp2", x: 750 + gap, y: 1800, s: 0.86, look: SLIM_PRAE, gaze: 0.5 })}
          <path d={`M540,${300 + f * 4} L540,${1500 + f * 4}`} stroke="#fff" strokeWidth={6} strokeDasharray="30 20" opacity={0.6} />
        </>
      ),
      html: <Chip text="แยกทาง" f={f - 4} y={230} border="#d8c08a" />,
      style: PAST,
    };
  },
  years: ({ f, d, F }) => ({
    bg: bg("f1-prae-home", d),
    svg: P(null, F, { id: "yr", x: 520, y: 1820, s: 0.95, look: SLIM_PRAE, gaze: -0.5, front: arm(4, 6), back: arm(10, 20) }),
    html: (
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, textAlign: "center", fontFamily: UI, opacity: interpolate(f, [0, 8], [0, 1], clamp) }}>
        <div style={{ fontSize: 150, fontWeight: 800, color: "#fff", textShadow: "0 6px 0 #000, 0 0 30px #000" }}>18 ปีต่อมา</div>
      </div>
    ),
    zoom: [1.06, 1],
  }),
  praeHome: ({ d, F }) => ({
    bg: bg("f1-prae-home", d, { zoom: [1.08, 1.12] }),
    svg: (
      <>
        <Bench x={330} y={1830} w={300} />
        {P("prae", F, { id: "ph1", x: 290, y: 1830, s: 0.9, look: SLIM_PRAE, pose: "sit", gaze: 1, front: arm(40, 50), back: arm(30, 40) })}
        {P("praemom", F, { id: "ph2", x: 780, y: 1840, s: 0.9, look: PRAE_MOM, flip: true, gaze: 1, front: arm(30, 60) })}
      </>
    ),
  }),
  market: ({ f, d, F }) => ({
    bg: bg("f1-market", d),
    svg: (
      <>
        {P(null, F, { id: "mk1", x: 160 + Math.min(f, 40) * 5, y: 1800, s: 0.86, look: SLIM_PRAE, gaze: 1, front: arm(20 * Math.sin(f / 4), 10), back: arm(-20 * Math.sin(f / 4), 10) })}
        {P(null, F, { id: "mk2", x: 760, y: 1810, s: 0.86, look: SLIM_FON_THIN, gaze: -1, tilt: 4 })}
      </>
    ),
  }),
  marketFon: ({ f, d, F }) => ({
    bg: bg("f1-market", d, { zoom: [1.15, 1.2], blur: 9 }),
    svg: (
      <>
        {P(null, F, { id: "mf", x: 560, y: 2150, s: 1.45, look: SLIM_FON_THIN, gaze: -1, brow: 0.4, tilt: 5, eyesOpen: 0.8 })}
        <ClueRing x={560} y={1350} rx={170} ry={300} f={f - 10} />
      </>
    ),
    html: <Chip text="ผอมลงมาก" f={f - 14} y={300} border={C.red} />,
    zoom: [1, 1.06],
  }),
  marketEyes: ({ f, d, F }) => ({
    bg: bg("f1-market", d, { zoom: [1.1, 1.14] }),
    svg: (
      <>
        {P("prae", F, { id: "me1", x: 400, y: 1900, s: 1.05, look: SLIM_PRAE, gaze: 1, brow: 0.3, mouth: 0.25 + 0.3 * Math.abs(Math.sin(F * 0.7)), front: arm(70, 10) })}
        {P(null, F, { id: "me2", x: 720, y: 1910, s: 1.05, look: SLIM_FON_THIN, flip: true, gaze: -1.4, tilt: 8, eyesOpen: 0.6 })}
        <ClueRing x={700} y={835} rx={90} ry={50} f={f - 30} />
      </>
    ),
    html: <Chip text="ไม่สบตาเลย" f={f - 36} y={300} border={C.red} />,
  }),
  grocery: ({ f, d, F }) => ({
    bg: bg("f1-grocery", d),
    svg: P(null, F, { id: "gr", x: 300 + Math.min(f, 30) * 6, y: 1800, s: 0.85, look: SLIM_FON_THIN, flip: false, gaze: 1, front: arm(30, 50), back: arm(-30, 50) }),
  }),
  groceryBike: ({ f, d }) => ({
    bg: bg("f1-grocery", d, { zoom: [1.3, 1.4], blur: 2 }),
    svg: <ClueRing x={760} y={1080} rx={200} ry={130} f={f - 8} />,
    html: <Chip text="ปกติขี่มอเตอร์ไซค์" f={f - 14} y={300} border="#e9b65a" />,
  }),
  groceryClues: ({ f, d, F }) => ({
    bg: bg("f1-grocery", d, { zoom: [1.15, 1.2], blur: 9 }),
    svg: (
      <>
        {P(null, F, { id: "gc", x: 540, y: 1960, s: 1.25, look: SLIM_FON_THIN, bruise: 1, bandage: true, gaze: -1, brow: 0.6 })}
        <ClueRing x={470} y={540} rx={70} ry={55} f={f - 4} />
        <ClueRing x={630} y={650} rx={70} ry={55} f={f - 16} />
        <ClueRing x={620} y={1920} rx={90} ry={50} f={f - 28} />
      </>
    ),
  }),
  fonExcuse: ({ d, F }) => ({
    bg: bg("f1-grocery", d, { zoom: [1.12, 1.16], blur: 8 }),
    svg: P("fon", F, { id: "fe", x: 560, y: 2000, s: 1.2, look: SLIM_FON_THIN, bruise: 1, gaze: -1.2, tilt: 6, brow: 0.5, front: arm(30, 120) }),
    zoom: [1, 1.05],
  }),
  fonExcuseStamp: ({ f, d, F }) => ({
    bg: bg("f1-grocery", d, { zoom: [1.12, 1.16], blur: 8 }),
    svg: P(null, F, { id: "fs", x: 520, y: 2000, s: 1.2, look: SLIM_PRAE, flip: true, gaze: 1, brow: -0.6, tilt: -5 }),
    html: f > 20 && <Stamp text="ไม่น่าใช่" f={f - 20} y={520} size={120} />,
  }),
  fonRides: ({ f, d, F }) => ({
    bg: bg("f1-grocery", d),
    svg: P(null, F, { id: "fr", x: 560 + f * 9, y: 1800, s: 0.85, look: SLIM_FON_THIN, gaze: 1, front: arm(30 * Math.sin(f / 3), 30), back: arm(-30 * Math.sin(f / 3), 30) }),
  }),
  fonYard: ({ f, d, F }) => ({
    bg: bg("f1-fon-yard", d),
    svg: (
      <>
        {P(null, F, { id: "fy1", x: 120 + Math.min(f, 40) * 5, y: 1800, s: 0.85, look: SLIM_PRAE, gaze: 1, front: arm(20 * Math.sin(f / 4), 10), back: arm(-20 * Math.sin(f / 4), 10) })}
        {P(null, F, { id: "fy2", x: 790, y: 1810, s: 0.85, look: SLIM_MOM, flip: true, gaze: 1, brow: 0.5 })}
      </>
    ),
  }),
  fonYardMom: ({ d, F }) => ({
    bg: bg("f1-fon-yard", d, { zoom: [1.08, 1.12] }),
    svg: (
      <>
        {P(null, F, { id: "fm1", x: 340, y: 1820, s: 0.9, look: SLIM_PRAE, gaze: 1, brow: 0.4 })}
        {P("momfon", F, { id: "fm2", x: 760, y: 1830, s: 0.9, look: SLIM_MOM, flip: true, gaze: 1, brow: 0.8, front: arm(30, 60) })}
      </>
    ),
  }),
  momClose: ({ d, F }) => ({
    bg: bg("f1-fon-yard", d, { zoom: [1.2, 1.24], blur: 10 }),
    svg: P("momfon", F, { id: "mc", x: 560, y: 2250, s: 1.6, look: SLIM_MOM, flip: true, gaze: 0.6, brow: 0.9, tilt: -4 }),
    zoom: [1, 1.05],
  }),
  momCloseDark: ({ d, F }) => ({
    bg: bg("f1-fon-yard", d, { zoom: [1.22, 1.28], blur: 12, light: 0.6 }),
    svg: P("momfon", F, { id: "md", x: 560, y: 2280, s: 1.7, look: SLIM_MOM, flip: true, gaze: 0, brow: 1, eyesOpen: 0.85 }),
    svgStyle: { filter: "brightness(0.8)" },
    zoom: [1, 1.1],
    origin: [540, 700],
  }),
  kitchenNight: ({ f, d, F }) => ({
    bg: bg("f1-fon-kitchen", d, { dark: true }),
    svg: P(null, F, { id: "kn", x: 560, y: 1830, s: 0.95, look: SLIM_FON_THIN, rim: "#cfe8d0", gaze: 1, brow: -0.5, mouth: 0.3 + 0.4 * Math.abs(Math.sin(f / 3)), front: arm(80 + 15 * Math.sin(f / 4), 30), back: arm(60, 40) }),
    svgStyle: NIGHT,
    shake: 0.6,
  }),
  bananaNight: ({ f, d, F }) => ({
    bg: bg("f1-banana-night", d, { dark: true }),
    svg: P(null, F, { id: "bn", x: 320 + f * 2, y: 1760, s: 0.7, look: SLIM_FON_THIN, rim: MOON, gaze: 1, front: arm(20, -10, 6, "knife"), back: arm(-20, 20) }),
    svgStyle: NIGHT,
  }),
  bananaShout: ({ f, d, F }) => ({
    bg: bg("f1-banana-night", d, { dark: true, zoom: [1.14, 1.2] }),
    svg: P("fon", F, { id: "bs", x: 520, y: 2040, s: 1.25, look: SLIM_FON_THIN, rim: MOON, gaze: 1, brow: -1, front: arm(150, 20, 0, "knife") }),
    svgStyle: NIGHT,
    shake: 3,
  }),
  bananaChop: ({ f, d, F }) => {
    const swing = Math.max(0, Math.sin(f / 4));
    return {
      bg: bg("f1-banana-night", d, { dark: true, zoom: [1.06, 1.1] }),
      svg: P(null, F, { id: "bc", x: 460, y: 1900, s: 1.05, look: SLIM_FON_THIN, rim: MOON, gaze: 1, brow: -1, mouth: 0.5, front: arm(30 + 120 * swing, 10, 0, "knife") }),
      svgStyle: NIGHT,
      html: <Onomato text="ฉับ! ฉับ! ฉับ!" f={f - 4} x={720} y={760} size={100} gap={12} hot={2} />,
      shake: swing > 0.9 ? 4 : 0,
    };
  },
  kitchenHide: ({ f, d, F }) => ({
    bg: bg("f1-fon-kitchen", d, { dark: true, zoom: [1.1, 1.14] }),
    svg: (
      <>
        {P(null, F, { id: "kh1", x: 470, y: 1830, s: 0.9, look: SLIM_MOM, pose: "sit", gaze: 1, brow: 1, front: arm(70, 80) })}
        {P(null, F, { id: "kh2", x: 640, y: 1830, s: 0.6, head: 1.2, look: SLIM_KID, flip: true, gaze: 0.5, brow: 0.9 })}
      </>
    ),
    svgStyle: NIGHT,
    shake: 0.8,
  }),
  kitchenBottle: ({ d, F }) => ({
    bg: bg("f1-fon-kitchen", d, { dark: true, zoom: [1.08, 1.12] }),
    svg: (
      <>
        {P(null, F, { id: "kb1", x: 330, y: 1840, s: 0.9, look: SLIM_FON_THIN, pose: "sit", gaze: 1, tilt: 10, eyesOpen: 0.5 })}
        {P(null, F, { id: "kb2", x: 760, y: 1840, s: 0.9, look: SLIM_MOM, flip: true, gaze: 1, brow: 1, front: arm(70, 10, 0, "bottle") })}
      </>
    ),
    svgStyle: NIGHT,
  }),
  phone: ({ f, d, F }) => ({
    bg: bg("f1-prae-home", d, { zoom: [1.1, 1.14] }),
    svg: P("prae", F, { id: "pn", x: 540, y: 1960, s: 1.15, look: SLIM_PRAE, gaze: 1, mouth: 0.2 + 0.4 * Math.abs(Math.sin(F * 0.8)), gaze: 0.4, tilt: 10, front: arm(60, 80, 0, "phone") }),
  }),
  hut: ({ f, d }) => ({
    bg: bg("f1-hut", d, { blur: 3, zoom: [1.02, 1.1] }),
    svg: <g />,
    html: <Chip text="เถียงนา" f={f - 8} y={260} border="#e9b65a" />,
  }),
  hammock: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 12, zoom: [1.3, 1.34] }),
    svg: (
      <>
        {P(null, F, { id: "hm1", x: 300, y: 1450, s: 0.45, look: SLIM_PRAE, pose: "lie", gaze: 1, front: arm(40, 90) })}
        <Hammock x={300} y={1470} w={460} color="#3f6aa0" />
        {P(null, F, { id: "hm2", x: 790, y: 1530, s: 0.45, look: SLIM_FON_THIN, pose: "lie", gaze: 1, front: arm(10, 10) })}
        <Hammock x={790} y={1550} w={460} color="#c9824a" />
      </>
    ),
  }),
  hammockPrae: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 14, zoom: [1.4, 1.44] }),
    svg: (
      <>
        {P("prae", F, { id: "hp", x: 520, y: 1300, s: 0.85, look: SLIM_PRAE, pose: "lie", gaze: 1.5, front: arm(40, 90) })}
        <Hammock x={520} y={1330} w={900} color="#3f6aa0" />
      </>
    ),
    zoom: [1, 1.04],
  }),
  hammockPrae2: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 14, zoom: [1.44, 1.48] }),
    svg: (
      <>
        {P("prae", F, { id: "hq", x: 560, y: 1360, s: 0.95, look: SLIM_PRAE, pose: "lie", flip: true, gaze: 1.2, brow: 0.3, front: arm(60, 100) })}
        <Hammock x={560} y={1390} w={980} color="#3f6aa0" />
      </>
    ),
  }),
  hammockFon: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 14, zoom: [1.4, 1.44] }),
    svg: (
      <>
        {P("fon", F, { id: "hf", x: 540, y: 1320, s: 0.85, look: SLIM_FON_THIN, pose: "lie", flip: true, gaze: 1.6, brow: 0.6, eyesOpen: 0.8, front: arm(10, 10) })}
        <Hammock x={540} y={1350} w={900} color="#c9824a" />
      </>
    ),
    zoom: [1, 1.05],
  }),
  hammockPraeClose: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 16, zoom: [1.5, 1.54] }),
    svg: (
      <>
        {P("prae", F, { id: "hpc", x: 1150, y: 1250, s: 1.6, look: SLIM_PRAE, pose: "lie", gaze: 1.6, brow: 0.2, front: arm(10, 10) })}
        <Hammock x={1150} y={1420} w={1700} color="#3f6aa0" />
      </>
    ),
    zoom: [1.02, 1],
  }),
  hammockFonClose: ({ d, F }) => ({
    bg: bg("f1-hut", d, { blur: 16, zoom: [1.5, 1.54] }),
    svg: (
      <>
        {P("fon", F, { id: "hfc", x: -70, y: 1250, s: 1.6, look: SLIM_FON_THIN, pose: "lie", flip: true, gaze: 1.6, brow: 0.7, eyesOpen: 0.75, front: arm(10, 10) })}
        <Hammock x={-70} y={1420} w={1700} color="#c9824a" />
      </>
    ),
    zoom: [1, 1.04],
  }),
  armyHouse: ({ f, d, F }) => ({
    bg: bg("f1-army-house", d, { light: 0.85 }),
    svg: (
      <>
        {P(null, F, { id: "ah1", x: 420, y: 1820, s: 0.9, look: SOLDIER, gaze: 1, front: arm(40, 40) })}
        {P(null, F, { id: "ah2", x: 680, y: 1830, s: 0.86, look: SLIM_FON, flip: true, gaze: 1, tilt: -6, mouth: 0.25 })}
      </>
    ),
    style: PAST,
    html: <Chip text="ทหาร · บอกว่าเลิกกับเมียแล้ว" f={f - 30} y={260} border="#4b5a3a" />,
  }),
  armyCar: ({ f, d }) => ({
    bg: bg("f1-army-house", d, { zoom: [1.1, 1.35], light: 0.85 }),
    svg: <rect width={W} height={H} fill="#fff6d0" opacity={f > d - 22 ? interpolate(f, [d - 22, d - 18, d], [0, 0.5, 0], clamp) : 0} />,
    html: f > d - 24 && <Stamp text="เมียตัวจริง" f={f - (d - 24)} y={700} size={130} />,
    origin: [700, 1150],
    shake: f > d - 24 ? 3 : 0,
  }),
  endCard: ({ f, d }) => ({
    bg: bg("f1-army-house", d, { dark: true, blur: 14 }),
    svg: <g />,
    html: (
      <>
        <EndCard f={f} series="เพื่อนรัก" ep="EP.1" next="EP.2 เดินเข้าไป" teaser="“ถึงกูนอนออกมา มึงก็ต้องมารับกูอยู่ดี”" question="ถ้าเป็นคุณ จะเชื่อคำแก้ตัวของเพื่อนไหม" accent="#c2185b" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1800, textAlign: "center", fontFamily: UI, fontSize: 28, color: "#d8cfbf", opacity: interpolate(f, [40, 50], [0, 1], clamp) }}>ติดสุรา ปรึกษาฟรี สายด่วนเลิกเหล้า 1413</div>
      </>
    ),
  }),
};

// decode each set's layers ~45 frames before its first shot opens (a new shot's first frame stayed blank without it)
const SET_OF: Record<string, string> = {
  hookMachete: "f1-banana-night", title: "f1-banana-night", pastField: "f1-ricefield-past", pastFieldKids: "f1-ricefield-past", pastCity: "f1-market", split: "f1-ricefield-past",
  years: "f1-prae-home", praeHome: "f1-prae-home", market: "f1-market", marketFon: "f1-market", marketEyes: "f1-market", grocery: "f1-grocery", groceryBike: "f1-grocery",
  groceryClues: "f1-grocery", fonExcuse: "f1-grocery", fonExcuseStamp: "f1-grocery", fonRides: "f1-grocery", fonYard: "f1-fon-yard", fonYardMom: "f1-fon-yard", momClose: "f1-fon-yard",
  momCloseDark: "f1-fon-yard", kitchenNight: "f1-fon-kitchen", bananaNight: "f1-banana-night", bananaShout: "f1-banana-night", bananaChop: "f1-banana-night", kitchenHide: "f1-fon-kitchen",
  kitchenBottle: "f1-fon-kitchen", phone: "f1-prae-home", hut: "f1-hut", hammock: "f1-hut", hammockPrae: "f1-hut", hammockPrae2: "f1-hut", hammockFon: "f1-hut", hammockPraeClose: "f1-hut", hammockFonClose: "f1-hut",
  armyHouse: "f1-army-house", armyCar: "f1-army-house", endCard: "f1-army-house",
};
const Warm = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", pointerEvents: "none" }}>
    {BEATS.map((b, i) => i > 0 && BEATS[i - 1].scene !== b.scene ? <FlowWarm key={b.id} name={SET_OF[b.scene]} from={at(b.id) - 45} to={at(b.id) + 2} layers={5} /> : null)}
  </svg>
);

const night: [string, string][] = [["hook", "title"], ["p17", "mf4"]];
const Sounds = () => (
  <>
    <Bed id="horror_ambience" from={0} to={EP.frames} volume={0.12} voice={EP.voiceSpans} duck={0.5} />
    {night.map(([a, b]) => <Bed key={a} id="crickets_night" from={at(a)} to={at(b)} volume={0.12} voice={EP.voiceSpans} />)}
    <Bed id="wind" from={at("p1")} to={at("p6")} volume={0.08} voice={EP.voiceSpans} />
    <Bed id="leaves_rustle" from={at("p22")} to={at("p32")} volume={0.07} voice={EP.voiceSpans} />
    <Bed id="heartbeat_fast" from={at("p34")} to={at("next")} volume={0.22} voice={EP.voiceSpans} duck={0.6} />
    <Hit id="deep_impact" at={2} volume={0.25} />
    <Sfx src={SFX.hit} at={at("hook") + 8} volume={0.18} />
    <Sfx src={SFX.swell} at={at("title")} volume={0.2} />
    <Hit id="terror_sweep" at={at("title") + 4} volume={0.15} />
    <Sfx src={SFX.whoosh} at={at("p1") - 4} volume={0.18} />
    <Sfx src={SFX.whoosh} at={at("p6") - 4} volume={0.18} />
    <Sfx src={SFX.pop} at={at("p9") + 24} volume={0.15} />
    <Sfx src={SFX.pop} at={at("p13") + 4} volume={0.15} />
    <Sfx src={SFX.pop} at={at("p13") + 16} volume={0.15} />
    <Sfx src={SFX.pop} at={at("p13") + 28} volume={0.15} />
    <Sfx src={SFX.hit} at={at("p14") + 20} volume={0.15} />
    <Hit id="moto_pass" at={at("p16")} volume={0.12} />
    <Hit id="terror_transition" at={at("p18")} volume={0.15} />
    {[0, 1, 2].map((i) => <Sfx key={i} src={SFX.hit} at={at("p19") + 4 + i * 12} volume={0.2} />)}
    <Hit id="horror_hit" at={at("f2")} volume={0.18} />
    <Sfx src={lib("msg_pop")} at={at("p22") + 4} volume={0.25} />
    <Sfx src={SFX.whoosh} at={at("p32") - 4} volume={0.18} />
    <Hit id="terror_sweep" at={at("p34")} volume={0.18} />
    <Hit id="deep_impact" at={at("next") - 22} volume={0.25} />
    <Sfx src={lib("msg_pop")} at={at("next") + 18} volume={0.25} />
  </>
);

export const FriendEp01 = () => <EP.Episode scenes={SCENES} sounds={<><Sounds /><Warm /></>} />;
