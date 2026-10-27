// ออเดอร์ตีสาม ตอน 1 · นางตานี — 9:16. Beats + VO timing → one scene per group of beats, captions, SFX.
import type { ReactNode } from "react";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { buildBeats, cues, totalFrames } from "../../../components/subs.mjs";
import { Bed, Hit, lib, SFX, Sfx } from "../../../components/Sound";
import BEATS from "./beats.json";
import TIMING from "./timing.json";
import {
  BananaClump, C, Chibi, Chip, Grain, Ground, H, HAND, Incense, LotteryStack, Offerings, OrderCard, Phone, Poles, RuleNote,
  Scooter, Shophouses, Sky, Store, Chair, Torch, UI, Vignette, W, Wisps, wave,
} from "../kit";

const LAYOUT = { lead: 6, gap: 7, tail: 75 };
export const BEATLIST = buildBeats(TIMING, BEATS, LAYOUT);
export const EP01_FRAMES = totalFrames(BEATLIST, LAYOUT);
const meta = (id: string) => BEATS.find((b) => b.id === id) as { id: string; scene: string; speaker?: string };
const at = (id: string) => BEATLIST.find((b) => b.id === id)!.start;
const endOf = (id: string) => BEATLIST.find((b) => b.id === id)!.end;

// Consecutive beats with the same scene play as one shot.
type Group = { scene: string; from: number; to: number; ids: string[] };
const GROUPS: Group[] = [];
BEATLIST.forEach((b, i) => {
  const scene = meta(b.id).scene;
  const last = GROUPS[GROUPS.length - 1];
  if (last && last.scene === scene) last.ids.push(b.id);
  else GROUPS.push({ scene, from: i === 0 ? 0 : b.start, to: 0, ids: [b.id] });
});
GROUPS.forEach((g, i) => (g.to = i < GROUPS.length - 1 ? GROUPS[i + 1].from : EP01_FRAMES));

// Lip flap only for spoken dialogue (narration stays in the head).
const DIALOGUE = new Set(["k1", "rule1a", "rule1b", "rule2a", "rule2b", "rule2c", "rule3a", "rule3b", "c1", "c2", "t1", "t2", "t3", "t4", "t5", "t6"]);
const talkOf = (who: string, frame: number) => {
  const b = BEATLIST.find((x) => frame >= x.start && frame < x.end && DIALOGUE.has(x.id));
  if (!b) return 0;
  const sp = meta(b.id).speaker;
  if (sp !== who) return 0;
  return 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.8));
};

const SEPIA = { filter: "grayscale(0.85) sepia(0.55) contrast(1.05) brightness(0.9)" };

// ---------- scenes: (f = frame in shot, d = shot length, F = absolute frame) ----------
type Ctx = { f: number; d: number; F: number; k: number };
type Shot = { svg: ReactNode; html?: ReactNode; zoom?: [number, number]; origin?: [number, number]; shake?: number; style?: React.CSSProperties };

const street = (id: string, shift = 0) => (
  <>
    <Sky id={id} />
    <Shophouses y={1380} shift={shift} />
    <Poles y={1380} shift={shift} />
    <Ground y={1380} color="#1b1d24" edge="#2a2e38" />
    <rect x={0} y={1520} width={W} height={10} fill="#d9c27a" opacity={0.35} />
  </>
);

const grove = (id: string, f: number, o: { sway?: number; glow?: number; cloth?: boolean; clothSway?: number; s?: number; x?: number; y?: number } = {}) => (
  <>
    <Sky id={id} top="#03050d" bottom="#14203a" mx={250} my={330} />
    <g opacity={0.5}>
      <Shophouses y={1150} lit={0.25} shift={-900} />
    </g>
    <Ground y={1150} color="#10140f" edge="#1d2618" />
    {Array.from({ length: 30 }, (_, i) => (
      <path key={i} d={`M${(i * 131) % W},${1170 + (i * 53) % 700} l-10,-40 m10,40 l10,-46 m-10,46 l22,-30`} stroke="#2a3a22" strokeWidth={6} />
    ))}
    <BananaClump x={o.x ?? 560} y={o.y ?? 1420} s={o.s ?? 1.25} f={f} sway={o.sway ?? 0.6} glow={o.glow ?? 0} cloth={o.cloth ?? true} clothSway={o.clothSway} />
  </>
);

const SCENES: Record<string, (c: Ctx) => Shot> = {
  hook: ({ f }) => ({
    svg: (
      <>
        {grove("hk", f, { glow: 0.8, y: 1250, s: 1.1 })}
        <g opacity={0.55 + 0.2 * wave(f, 20)}>
          <Chibi who="tani" x={560} y={1180} s={0.8} f={f} mood="sad" float={30} />
        </g>
        <rect width={W} height={H} fill="#000" opacity={0.35} />
        <Phone x={540} y={1180} s={0.78} rot={-4}>
          <OrderCard time="03:00" items={["ข้าวต้มมัด 1 ห่อ", "น้ำแดง 1 ขวด"]} fee="฿500" place="📍 กอกล้วย ท้ายซอย" />
        </Phone>
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", fontFamily: UI }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#ffd0a8" }}>ออเดอร์ตีสาม · ตอน 1</div>
        <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.15, color: "#fff", textShadow: `0 0 28px ${C.app}, 0 0 60px ${C.app}` }}>ออเดอร์ตีสาม</div>
        <div style={{ fontSize: 112, fontWeight: 800, lineHeight: 1.15, color: "#dfffe9", textShadow: `0 0 28px ${C.tani}, 0 0 60px ${C.taniDeep}` }}>ส่งให้ต้นกล้วย?</div>
      </div>
    ),
    zoom: [1, 1.06],
    shake: f < 8 ? (8 - f) * 1.5 : 0,
  }),
  title: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#05060c" />
        <Wisps f={f} n={20} />
        <circle cx={540} cy={900} r={500} fill={C.app} opacity={0.06} />
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: UI, opacity: interpolate(f, [0, 8, d - 6, d], [0, 1, 1, 0.2]) }}>
        <div style={{ fontSize: 150, fontWeight: 800, color: "#fff", textShadow: `0 0 30px ${C.app}, 0 0 80px ${C.app}`, opacity: 1 }}>ออเดอร์ตีสาม</div>
        <div style={{ marginTop: 30, fontSize: 64, fontWeight: 700, color: C.tani, textShadow: `0 0 24px ${C.taniDeep}` }}>ตอน 1 · นางตานี</div>
      </div>
    ),
  }),
  kaengBike: ({ f }) => ({
    svg: (
      <>
        {street("kb")}
        <Scooter x={620} y={1560} s={0.9} f={f} light />
        <Chibi who="kaeng" x={360} y={1620} s={1.15} f={f} mood="smile" helmet armR={[30, 70]} />
      </>
    ),
    html: <Chip text="ไรเดอร์ 3 อาทิตย์" f={f - 10} />,
    zoom: [1.02, 1.1],
    origin: [500, 1200],
  }),
  clock: ({ f, d }) => {
    const mins = Math.round(interpolate(f, [0, d * 0.8], [23 * 60 + 40, 27 * 60], { extrapolateRight: "clamp" }));
    const hh = String(Math.floor(mins / 60) % 24).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    return {
      svg: (
        <>
          <g style={{ filter: "blur(10px) brightness(0.55)" }}>{street("ck", -f * 6)}</g>
          <Phone x={540} y={900} s={0.95}>
            <rect x={-245} y={-470} width={490} height={940} rx={50} fill="#121524" />
            <text x={0} y={-120} fontFamily={UI} fontWeight={800} fontSize={170} fill="#fff" textAnchor="middle">
              {hh}:{mm}
            </text>
            <text x={0} y={-30} fontFamily={UI} fontSize={40} fill="#9aa3c7" textAnchor="middle">กะดึก · ค่ารอบ x1.5</text>
          </Phone>
        </>
      ),
      zoom: [1, 1.04],
    };
  },
  phonePing: ({ f }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(6px) brightness(0.5)" }}>{street("pp")}</g>
        <ellipse cx={560} cy={800} rx={420} ry={520} fill={C.app} opacity={0.12 + 0.06 * wave(f, 10)} />
        <Chibi who="kaeng" x={540} y={2100} s={2.1} f={f} mood="scared" look={-0.5} armR={[-20, -110]} />
        <g transform={`translate(0,${interpolate(f, [4, 14], [-260, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`}>
          <rect x={70} y={130} width={940} height={170} rx={34} fill="#fff" stroke={OLC} strokeWidth={6} />
          <rect x={100} y={162} width={104} height={104} rx={24} fill={C.app} />
          <text x={152} y={232} fontFamily={UI} fontWeight={800} fontSize={44} fill="#fff" textAnchor="middle">ส่ง</text>
          <text x={230} y={200} fontFamily={UI} fontWeight={800} fontSize={40} fill="#222">ส่งไว · ออเดอร์ใหม่</text>
          <text x={230} y={256} fontFamily={UI} fontSize={36} fill="#555">03:00 · ลูกค้าไม่ระบุชื่อ</text>
        </g>
      </>
    ),
    zoom: [1.0, 1.08],
    origin: [540, 700],
  }),
  orderCard: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#0b0e1c" />
        <Phone x={540} y={980} s={1.25}>
          <OrderCard time="03:00" items={["ข้าวต้มมัด 1 ห่อ", "น้ำแดง 1 ขวด"]} fee="฿500" place="📍 กอกล้วย ท้ายซอย" />
        </Phone>
      </>
    ),
    html: <Chip text="ค่าส่ง ฿500 (ปกติ ฿40)" f={f - 30} y={150} />,
    zoom: [1, 1.08],
    origin: [540, 1050],
  }),
  orderNote: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#0b0e1c" />
        <Phone x={540} y={700} s={1.7}>
          <OrderCard time="03:00" items={["ข้าวต้มมัด 1 ห่อ", "น้ำแดง 1 ขวด"]} fee="฿500" note="วางไว้ที่โคนต้น ไม่ต้องเรียก" typed={interpolate(f, [d * 0.35, d * 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </Phone>
      </>
    ),
    zoom: [1, 1.12],
    origin: [540, 1100],
  }),
  store: ({ f, F }) => ({
    svg: (
      <>
        <Sky id="st" moon={false} />
        <Store y={1450} />
        <Ground y={1450} color="#24262c" edge="#3a3d45" />
        <Scooter x={930} y={1700} s={0.6} f={f} flip />
        <Chair x={680} y={1640} />
        <Chibi who="cherd" x={680} y={1520} s={0.95} f={f} mood="grim" look={-0.6} noLegs talk={talkOf("cherd", F)} />
        <Chibi who="kaeng" x={280} y={1720} s={1.0} f={f} mood="neutral" look={1} armR={[70, 20]} talk={talkOf("kaeng", F)} />
      </>
    ),
    zoom: [1, 1.06],
    origin: [520, 1300],
  }),
  cherdFace: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#cfe6f2" />
        <rect y={1300} width={W} height={620} fill="#9fb2bd" />
        <Chibi who="cherd" x={540} y={2350} s={2.3} f={f} mood="grim" look={-0.3} talk={talkOf("cherd", F)} />
        <rect width={W} height={H} fill="#0a1022" opacity={interpolate(f, [0, 60], [0, 0.35], { extrapolateRight: "clamp" })} />
      </>
    ),
    zoom: [1, 1.12],
    origin: [540, 900],
  }),
  rule1: ({ f, F }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(9px) brightness(0.45)" }}>
          <Store y={1450} />
        </g>
        <RuleNote n={1} lines={["ออเดอร์ที่มีน้ำแดง", "ไม่ใช่ของให้คนกิน"]} hl={1} f={f} y={820} />
        <Chibi who="cherd" x={830} y={2050} s={1.0} f={f} mood="grim" look={-1} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.04],
  }),
  accept: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#0b0e1c" />
        <Phone x={540} y={900} s={1.2}>
          <OrderCard time="03:02" items={["ข้าวต้มมัด 1 ห่อ", "น้ำแดง 1 ขวด"]} fee="฿500" accept={interpolate(f, [d * 0.55, d * 0.62, d * 0.7], [0, 0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        </Phone>
        <g transform={`translate(${interpolate(f, [d * 0.4, d * 0.58], [900, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })},${1580})`}>
          <circle r={60} fill="#e3a979" stroke="#16100c" strokeWidth={7} />
          <rect x={-40} y={40} width={80} height={400} fill={C.app} stroke="#16100c" strokeWidth={7} />
        </g>
      </>
    ),
    html: <Chip text="= เงินส่งแม่ 1 อาทิตย์" f={f - 20} y={150} border={C.tani} />,
    zoom: [1, 1.05],
  }),
  mapRide: ({ f, d }) => {
    const p = interpolate(f, [0, d * 0.9], [0, 1], { extrapolateRight: "clamp" });
    const route = "M540,1700 L540,1200 L300,1200 L300,700 L760,700 L760,420";
    return {
      svg: (
        <>
          <rect width={W} height={H} fill="#0d1322" />
          {[200, 450, 700, 950, 1200, 1450, 1700].map((y) => (
            <rect key={y} x={0} y={y - 20} width={W} height={40} fill="#1b2438" />
          ))}
          {[150, 300, 540, 760, 920].map((x) => (
            <rect key={x} x={x - 20} y={y0(x)} width={40} height={H} fill="#1b2438" />
          ))}
          {Array.from({ length: 40 }, (_, i) => {
            const x = 40 + (i % 8) * 130;
            const y = 760 + Math.floor(i / 8) * 250;
            return <rect key={i} x={x} y={y} width={90} height={150} rx={10} fill="#26324d" />;
          })}
          <rect x={560} y={240} width={420} height={420} fill="#121a14" stroke="#2c3a2a" strokeWidth={6} strokeDasharray="20 14" />
          <text x={770} y={630} fontFamily={UI} fontSize={36} fill="#5d7a5a" textAnchor="middle">ที่ดินรกร้าง</text>
          <path d={route} stroke="#3a2a1c" strokeWidth={22} fill="none" />
          <path d={route} stroke={C.app} strokeWidth={14} fill="none" strokeDasharray={2400} strokeDashoffset={2400 * (1 - p)} strokeLinecap="round" />
          <g transform="translate(760,360)">
            <path d="M0,0 C-50,-60 -60,-150 0,-150 C60,-150 50,-60 0,0 Z" fill={C.tani} stroke="#16100c" strokeWidth={6} />
            <text x={0} y={-82} fontSize={60} textAnchor="middle">🍌</text>
          </g>
        </>
      ),
      html: <Chip text="สุดซอย · ไม่มีบ้านสักหลัง" f={f - 30} y={1500} />,
      zoom: [1.1, 1.0],
    };
  },
  grove: ({ f }) => ({
    svg: (
      <>
        {grove("gv", f, { s: 1.05, y: 1350 })}
        <Torch x={-60} y={1380} angle={-12} len={1500} k={0.35} />
        <Scooter x={40} y={1560} s={0.55} f={f} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [560, 1100],
  }),
  cloths: ({ f }) => ({
    svg: (
      <>
        {grove("cl", f, { s: 2.4, y: 2300, x: 600, sway: 0.4 })}
        <Torch x={-80} y={1500} angle={-20} len={1700} k={0.3} />
      </>
    ),
    zoom: [1, 1.07],
  }),
  lottery: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#0c0f0b" />
        <rect y={1200} width={W} height={720} fill="#1a1f15" />
        {[160, 440, 760].map((x, i) => (
          <rect key={i} x={x} y={0} width={160} height={1300} fill={i % 2 ? "#3e5a2a" : "#4b6b31"} stroke="#16100c" strokeWidth={8} />
        ))}
        <LotteryStack x={520} y={1260} s={1.6} />
        {[0, 1].map((i) => (
          <circle key={i} cx={260 + i * 560} cy={1350} r={90} fill="none" stroke="#a8843a" strokeWidth={22} strokeDasharray="10 8" opacity={0.7} />
        ))}
        <Torch x={-100} y={1000} angle={15} len={1500} k={0.35} />
      </>
    ),
    html: <Chip text="ขอหวย" f={f - 25} y={300} border={C.tani} />,
    zoom: [1, 1.1],
    origin: [520, 1250],
  }),
  flashCherd: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#cfe6f2" />
        <Chibi who="cherd" x={540} y={1900} s={1.6} f={f} mood="grim" talk={talkOf("cherd", F)} />
      </>
    ),
    style: SEPIA,
    zoom: [1.08, 1.0],
  }),
  rule2: ({ f, F }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(8px) brightness(0.5)" }}>{grove("r2", f, { glow: 0.6 })}</g>
        <g opacity={0.18}>
          <Chibi who="tani" x={560} y={1650} s={1} f={f} mood="sad" float={40} />
        </g>
        <RuleNote n={2} lines={["ไม่มีใครปลูกกล้วยตานี", "ไว้ใกล้บ้าน เพราะมี", "นางตานีอยู่ในต้น"]} hl={2} f={f} y={760} />
        <Chibi who="cherd" x={850} y={2080} s={0.95} f={f} mood="grim" look={-1} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.04],
  }),
  incense: ({ f }) => ({
    svg: (
      <>
        {grove("ic", f, { y: 1300, s: 1.1 })}
        <Incense x={520} y={1420} f={f} s={1.4} />
        <Chibi who="youngCherd" x={560} y={1980} s={1.0} f={f} back noLegs armL={[60, 60]} armR={[60, 60]} />
      </>
    ),
    html: <Chip text="บนบาน · ขอหวย" f={f - 30} y={260} border={C.tani} />,
    style: SEPIA,
    zoom: [1, 1.06],
  }),
  placeFood: ({ f, d }) => ({
    svg: (
      <>
        {grove("pf", f, { s: 1.6, y: 1780, x: 620 })}
        <Torch x={-80} y={1500} angle={-8} len={1600} k={0.32} />
        <Offerings x={600} y={1760} s={1.3} show={interpolate(f, [d * 0.45, d * 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
        <Chibi who="kaeng" x={280} y={1880} s={1.05} f={f} mood="scared" look={1} armR={[75, 15]} helmet />
      </>
    ),
    zoom: [1, 1.05],
  }),
  coming: ({ f }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(8px) brightness(0.45)" }}>{grove("cm", f, { glow: 0.3 })}</g>
        <Phone x={540} y={960} s={1.1}>
          <OrderCard time="03:14" items={["ข้าวต้มมัด 1 ห่อ", "น้ำแดง 1 ขวด"]} fee="฿500" status="ลูกค้ากำลังมารับ" dots={Math.floor(f / 10) % 4} />
        </Phone>
      </>
    ),
    zoom: [1, 1.06],
  }),
  leaves: ({ f }) => ({
    svg: (
      <>
        {grove("lv", f, { sway: 3.2, clothSway: 0, s: 1.3, y: 1500, glow: 0.25 })}
        <Torch x={-60} y={1500} angle={-10} len={1500} k={0.28} />
        <Chibi who="kaeng" x={250} y={2050} s={1.2} f={f} mood="scared" look={1} helmet />
      </>
    ),
    html: <Chip text="ไม่มีลม" f={f - 15} y={260} border="#9aa3c7" />,
    zoom: [1, 1.08],
    shake: 1.5,
  }),
  rule3: ({ f, F }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(9px) brightness(0.4)" }}>{grove("r3", f, { sway: 3, glow: 0.4 })}</g>
        <RuleNote n={3} lines={["ถ้าลูกค้าออกมารับเอง", "อย่ามองที่เท้า"]} hl={1} f={f} y={820} />
        <Chibi who="cherd" x={830} y={2050} s={1.0} f={f} mood="grim" look={-1} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.05],
  }),
  feet: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#070a08" />
        <rect y={1450} width={W} height={470} fill="#141a12" />
        <ellipse cx={540} cy={1250} rx={600} ry={500} fill={C.tani} opacity={0.12} />
        <Offerings x={850} y={1520} s={1.1} />
        <g transform={`translate(0,${interpolate(f, [0, d], [40, 0])})`}>
          <Chibi who="tani" x={520} y={1420} s={2.6} f={f} float={0} />
        </g>
        <Torch x={-100} y={1300} angle={6} len={1600} k={0.4} />
        <rect width={W} height={H} fill="#000" opacity={interpolate(f, [0, 10], [1, 0], { extrapolateRight: "clamp" })} />
      </>
    ),
    zoom: [1.12, 1.0],
    origin: [540, 1400],
    shake: f > 6 && f < 18 ? 6 : 0,
  }),
  taniFull: ({ f }) => ({
    svg: (
      <>
        {grove("tf", f, { glow: 1, s: 1.15, y: 1420 })}
        <rect width={W} height={H} fill={C.taniDeep} opacity={0.12} />
        <Chibi who="tani" x={540} y={1560} s={1.25} f={f} mood="sad" float={60} />
        <Wisps f={f} />
      </>
    ),
    zoom: [1.05, 1.0],
    origin: [540, 1000],
  }),
  taniLook: ({ f }) => ({
    svg: (
      <>
        {grove("tl", f, { glow: 0.9, s: 1.3, y: 1500, x: 700 })}
        <Offerings x={420} y={1640} s={1.2} />
        <Chibi who="tani" x={720} y={1560} s={1.15} f={f} mood="sad" look={-1} float={50} />
        <Wisps f={f} n={10} />
      </>
    ),
    zoom: [1, 1.06],
  }),
  taniClose: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06110a" />
        <ellipse cx={540} cy={800} rx={600} ry={700} fill={C.tani} opacity={0.14} />
        <Chibi who="tani" x={540} y={2380} s={2.6} f={f} mood="sad" talk={talkOf("tani", F)} />
        <Wisps f={f} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [540, 800],
  }),
  pastKneel: ({ f }) => ({
    svg: (
      <>
        {grove("pk", f, { cloth: false, y: 1300, s: 1.1 })}
        <Incense x={430} y={1460} f={f} s={1.2} />
        <Chibi who="youngCherd" x={680} y={1720} s={0.95} f={f} mood="smile" look={-1} noLegs armR={[-10, -110]} armL={[-10, -110]} />
      </>
    ),
    html: <Chip text="20 ปีก่อน" f={f - 5} y={230} border="#d8c08a" />,
    style: SEPIA,
    zoom: [1.06, 1.0],
  }),
  pastWin: ({ f }) => ({
    svg: (
      <>
        {street("pw")}
        <Chibi who="youngCherd" x={540} y={1650 - Math.abs(wave(f, 20)) * 60} s={1.2} f={f} mood="smile" armR={[165, 10]} armL={[120, 20]} />
        <g transform={`translate(${540 + 150},${1650 - 1270 - Math.abs(wave(f, 20)) * 60}) rotate(-10)`}>
          <rect x={-90} y={-60} width={180} height={110} rx={6} fill="#e9dfc1" stroke="#16100c" strokeWidth={5} />
          <rect x={-70} y={-40} width={90} height={16} fill="#b54a4a" />
        </g>
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={540 + Math.cos(i) * (200 + (f * 6) % 300)} cy={900 + Math.sin(i) * (200 + (f * 6) % 300)} r={8} fill="#ffe08a" opacity={0.7} />
        ))}
      </>
    ),
    html: <Chip text="ถูกรางวัล" f={f - 20} y={230} border="#d8c08a" />,
    style: SEPIA,
    zoom: [1, 1.06],
  }),
  pastLeave: ({ f, d }) => ({
    svg: (
      <>
        {grove("pl", f, { cloth: false, y: 1300, s: 1.0, x: 360 })}
        <g opacity={0.35}>
          <Chibi who="tani" x={360} y={1360} s={0.75} f={f} mood="sad" look={1} float={30} />
        </g>
        <Chibi who="youngCherd" x={interpolate(f, [0, d], [620, 1150])} y={1700} s={0.9} f={f} walk={f / 4} mood="smile" />
      </>
    ),
    html: <Chip text="สัญญาว่าจะกลับมาแก้บน" f={f - 20} y={230} border="#d8c08a" />,
    style: SEPIA,
  }),
  seasons: ({ f, d }) => {
    const years = Math.min(20, 1 + Math.floor(interpolate(f, [0, d * 0.85], [0, 20], { extrapolateRight: "clamp" })));
    const fade = interpolate(f, [0, d], [0, 0.7]);
    return {
      svg: (
        <>
          {grove("ss", f, { glow: 0.5, s: 1.15, y: 1420 })}
          {years % 4 < 2 &&
            Array.from({ length: 40 }, (_, i) => (
              <line key={i} x1={(i * 97 + f * 9) % W} y1={(i * 211 + f * 40) % H} x2={(i * 97 + f * 9) % W - 12} y2={((i * 211 + f * 40) % H) + 60} stroke="#9fb6d6" strokeWidth={3} opacity={0.5} />
            ))}
          <rect width={W} height={H} fill="#0a0d0a" opacity={fade * 0.4} />
          <g opacity={0.8}>
            <Chibi who="tani" x={540} y={1560} s={1.05} f={f} mood="sad" look={1} float={40} />
          </g>
        </>
      ),
      html: <Chip text={`รอมาแล้ว ${years} ปี`} f={f} y={230} border={C.tani} />,
      zoom: [1, 1.04],
    };
  },
  point: ({ f }) => ({
    svg: (
      <>
        {grove("pt", f, { glow: 0.8, s: 1.0, y: 1360, x: 380 })}
        <circle cx={1010} cy={1140} r={80} fill="#e8f7ff" opacity={0.5} />
        <circle cx={1010} cy={1140} r={26} fill="#fff" />
        <Chibi who="tani" x={400} y={1560} s={1.05} f={f} mood="sad" look={1} armR={[95, 0]} float={40} />
        <Chibi who="kaeng" x={800} y={1900} s={0.9} f={f} mood="scared" look={1} helmet />
      </>
    ),
    html: <Chip text="ร้านสะดวกซื้อ ปากซอย" f={f - 25} y={980} border="#cfe6f2" />,
    zoom: [1, 1.05],
  }),
  taniLast: ({ f, d, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06110a" />
        <ellipse cx={540} cy={800} rx={600} ry={700} fill={C.tani} opacity={0.16} />
        <Chibi who="tani" x={540} y={2500} s={2.8} f={f} mood="sad" talk={talkOf("tani", F)} />
        <path d={`M610,${880 + Math.min(f, 60) * 3} q16,30 0,46 q-16,-16 0,-46 Z`} fill="#9fe7ff" opacity={0.85} />
        <Wisps f={f} />
        <rect width={W} height={H} fill="#000" opacity={interpolate(f, [d - 20, d], [0, 1], { extrapolateLeft: "clamp" })} />
      </>
    ),
    zoom: [1, 1.1],
    origin: [540, 800],
  }),
  storeBack: ({ f, d }) => ({
    svg: (
      <>
        <Sky id="sb" moon={false} />
        <Store y={1450} />
        <Ground y={1450} color="#24262c" edge="#3a3d45" />
        <Chair x={540} y={1640} />
        <Chibi who="cherd" x={540} y={1520} s={0.95} f={f} back noLegs />
        <Scooter x={interpolate(f, [0, d * 0.5], [1300, 900], { extrapolateRight: "clamp" })} y={1820} s={0.7} f={f} flip moving={f < d * 0.5} light />
      </>
    ),
    zoom: [1, 1.06],
    origin: [540, 1400],
  }),
  cherdAmulet: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#cfe6f2" />
        <rect y={1300} width={W} height={620} fill="#9fb2bd" />
        <Chibi who="cherd" x={540} y={2150} s={1.9} f={f} mood="sad" look={-0.4} armR={[-12, -128]} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [540, 1300],
  }),
  kaengShock: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#d8e9f2" />
        <Chibi who="kaeng" x={540} y={2300} s={2.3} f={f} mood="shock" talk={talkOf("kaeng", F)} />
      </>
    ),
    zoom: [1.1, 1.0],
    shake: f < 10 ? 4 : 0,
  }),
  cherdTurn: ({ f, d, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#bcd3df" />
        <Chibi who="cherd" x={540} y={2350} s={2.3} f={f} mood="sad" talk={talkOf("cherd", F)} />
        <g opacity={interpolate(f, [d * 0.45, d * 0.6, d - 10, d], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp" })} style={SEPIA}>
          <Chibi who="youngCherd" x={540} y={2350} s={2.3} f={f} mood="smile" />
        </g>
      </>
    ),
    html: <Chip text="คนสั่ง = ลุงเชิด" f={f - Math.round(d * 0.6)} y={230} border={C.red} />,
    zoom: [1, 1.12],
    origin: [540, 900],
  }),
  phoneBuzz: ({ f }) => ({
    svg: (
      <>
        <Sky id="pb" moon={false} />
        <Ground y={1300} color="#24262c" edge="#3a3d45" />
        <Scooter x={560} y={1760} s={1.3} f={f} />
        <g transform={`translate(${f > 25 ? wave(f, 3) * 8 : 0},0)`}>
          <Phone x={420} y={1330} s={0.22} rot={-78}>
            <rect x={-245} y={-470} width={490} height={940} rx={50} fill={C.app} />
          </Phone>
        </g>
      </>
    ),
    zoom: [1, 1.1],
    origin: [500, 1050],
  }),
  order2: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={540} cy={1700} rx={((f * 4 + i * 120) % 900) + 20} ry={(((f * 4 + i * 120) % 900) + 20) / 4} fill="none" stroke="#5fb8e3" strokeWidth={4} opacity={0.4 * (1 - ((f * 4 + i * 120) % 900) / 900)} />
        ))}
        <Wisps f={f} color="#7fd0ff" />
        <Phone x={540} y={940} s={1.15}>
          <OrderCard time="03:33" items={["ไข่ต้ม 2 ฟอง", "พวงมาลัย 1 พวง"]} fee="฿500" place="📍 ศาลาท่าน้ำวัด" />
        </Phone>
      </>
    ),
    zoom: [1, 1.05],
  }),
  cta: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        <Wisps f={f} color="#7fd0ff" />
        <Phone x={540} y={560} s={0.6}>
          <OrderCard time="03:33" items={["ไข่ต้ม 2 ฟอง", "พวงมาลัย 1 พวง"]} fee="฿500" place="📍 ศาลาท่าน้ำวัด" />
        </Phone>
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 1000, left: 70, right: 70, display: "flex", gap: 40, fontFamily: UI }}>
        {[
          ["1", "รับ", "#2f8c5a"],
          ["2", "ปฏิเสธ", C.red],
        ].map(([n, t, col], i) => (
          <div key={n} style={{ flex: 1, background: col, borderRadius: 40, padding: "30px 0", textAlign: "center", color: "#fff", border: "6px solid #16100c", transform: `scale(${interpolate(f, [8 + i * 8, 16 + i * 8], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }}>
            <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 60, fontWeight: 700 }}>{t}</div>
          </div>
        ))}
      </div>
    ),
  }),
  end: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#05060c" />
        <Wisps f={f} n={20} />
        <Wisps f={f + 300} color="#7fd0ff" n={10} />
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: UI }}>
        <div style={{ fontSize: 140, fontWeight: 800, color: "#fff", textShadow: `0 0 30px ${C.app}, 0 0 80px ${C.app}` }}>ออเดอร์ตีสาม</div>
        <div style={{ marginTop: 20, fontSize: 56, fontWeight: 700, color: "#7fd0ff" }}>ตอนต่อไป · ผีพราย</div>
        <div style={{ marginTop: 70, display: "inline-block", fontSize: 54, fontWeight: 800, color: "#fff", background: C.app, borderRadius: 50, padding: "16px 56px", transform: `scale(${1 + 0.04 * wave(f, 24)})` }}>
          กดติดตาม
        </div>
      </div>
    ),
  }),
};

const OLC = "#16100c";
const y0 = (x: number) => (x === 760 ? 400 : x === 300 ? 700 : 1100);

const ShotView = ({ g }: { g: Group }) => {
  const frame = useCurrentFrame();
  const d = g.to - g.from;
  const f = frame;
  const F = g.from + frame;
  const shot = SCENES[g.scene]({ f, d, F, k: f / d });
  const [z0, z1] = shot.zoom ?? [1, 1.04];
  const z = interpolate(f, [0, d], [z0, z1]);
  const [ox, oy] = shot.origin ?? [540, 960];
  const sh = shot.shake ?? 0;
  const sx = sh ? Math.sin(f * 2.3) * sh : 0;
  const sy = sh ? Math.cos(f * 1.9) * sh : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ ...shot.style, transform: `translate(${sx}px,${sy}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px` }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {shot.svg}
        </svg>
      </AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <Vignette k={0.7} />
        <Grain f={F} />
      </svg>
      {shot.html}
    </AbsoluteFill>
  );
};

// ---------- captions ----------
const HL = ["500", "น้ำแดง", "นางตานี", "อย่ามองที่เท้า", "20", "ลุงเอง", "ขอหวย", "ต้นกล้วย", "ไม่ใช่ของฉัน", "ยังรอ", "1", "2"];
const BORDER: Record<string, string> = { cherd: C.cherd, tani: C.tani };

const Captions = () => {
  const frame = useCurrentFrame();
  const b = BEATLIST.find((x) => frame >= x.start && frame < x.end + 6);
  if (!b || b.id === "hook" || b.id === "title" || b.id === "cta2") return null;
  const list = cues({ text: b.text, spoken: b.spoken, sec: b.len / 30, maxChars: 20 });
  const t = (frame - b.start) / 30;
  const cue = list.find((c) => t < c.end) ?? list[list.length - 1];
  const sp = meta(b.id).speaker ?? "kaeng";
  const border = BORDER[sp];
  const parts = cue.text.split(new RegExp(`(${HL.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`));
  return (
    <div style={{ position: "absolute", top: 1590, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 60, lineHeight: 1.35, color: "#fff", background: "rgba(10,10,14,0.86)", borderRadius: 26, padding: "10px 34px", border: border ? `5px solid ${border}` : "none", maxWidth: 960, textAlign: "center" }}>
        {parts.map((p, i) => (HL.includes(p) ? <span key={i} style={{ color: border ?? "#ffb03a" }}>{p}</span> : <span key={i}>{p}</span>))}
      </div>
    </div>
  );
};

// ---------- sound ----------
const voiceSpans = BEATLIST.map((b) => [b.start, b.end] as [number, number]);
const Sounds = () => (
  <>
    {BEATLIST.map((b) => (
      <Sequence key={b.id} from={b.start}>
        <Html5Audio src={staticFile(meta(b.id).speaker === "tani" ? b.file.replace(".wav", "-fx.wav") : b.file)} volume={meta(b.id).speaker === "tani" ? 1.05 : 1} />
      </Sequence>
    ))}
    <Bed id="horror_ambience" from={0} to={EP01_FRAMES} volume={0.2} voice={voiceSpans} duck={0.5} />
    <Bed id="crickets_night" from={at("me1")} to={at("cherd1")} volume={0.14} voice={voiceSpans} />
    <Bed id="crickets_night" from={at("ride1")} to={at("tani1")} volume={0.18} voice={voiceSpans} />
    <Bed id="scary_wind" from={at("leaves")} to={at("back1")} volume={0.16} voice={voiceSpans} />
    <Bed id="heartbeat_fast" from={at("rule3b")} to={at("tani1")} volume={0.3} voice={voiceSpans} duck={0.6} />
    <Sfx src={lib("msg_pop")} at={2} volume={0.45} />
    <Sfx src={SFX.swell} at={at("title")} volume={0.3} />
    <Hit id="terror_sweep" at={at("title") + 4} volume={0.25} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Sfx key={i} src={SFX.tick} at={at("me2") + 6 + i * 9} volume={0.18} />
    ))}
    <Sfx src={lib("msg_pop")} at={at("ping") + 4} volume={0.45} />
    <Sfx src={SFX.pop} at={at("order") + 30} volume={0.25} />
    {Array.from({ length: 14 }, (_, i) => (
      <Sfx key={i} src={SFX.tick} at={at("note2") + 4 + i * 3} volume={0.08} />
    ))}
    <Sfx src={SFX.whoosh} at={at("rule1a") - 4} volume={0.3} />
    <Sfx src={SFX.pop} at={Math.round(at("accept") + (endOf("accept") - at("accept")) * 0.62)} volume={0.3} />
    <Hit id="moto_start" at={endOf("accept") + 2} volume={0.3} />
    <Sfx src={SFX.whoosh} at={at("recall") - 4} volume={0.3} />
    <Sfx src={SFX.whoosh} at={at("rule2a") - 4} volume={0.3} />
    <Sfx src={lib("msg_pop")} at={at("coming") + 4} volume={0.3} />
    {[0, 1, 2].map((i) => (
      <Sfx key={i} src={lib("leaves_rustle")} at={at("leaves") + 10 + i * 36} volume={0.45} />
    ))}
    <Sfx src={SFX.whoosh} at={at("rule3a") - 4} volume={0.3} />
    <Hit id="terror_transition" at={at("tani1") - 46} volume={0.25} />
    <Hit id="horror_hit" at={at("tani1") - 44} volume={0.35} />
    <Sfx src={SFX.whoosh} at={at("t2") - 4} volume={0.3} />
    <Hit id="moto_pass" at={at("back1") + 10} volume={0.25} />
    <Hit id="deep_impact" at={at("c2") + Math.round((endOf("c2") - at("c2")) * 0.55)} volume={0.35} />
    <Sfx src={lib("msg_pop")} at={at("next2") + 2} volume={0.45} />
    <Sfx src={SFX.pop} at={at("cta1") + 8} volume={0.25} />
    <Sfx src={SFX.pop} at={at("cta1") + 16} volume={0.25} />
    <Sfx src={lib("msg_pop")} at={at("cta2") + 30} volume={0.35} />
  </>
);

export const Ep01 = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {GROUPS.map((g) => (
      <Sequence key={`${g.scene}-${g.from}`} from={g.from} durationInFrames={g.to - g.from}>
        <ShotView g={g} />
      </Sequence>
    ))}
    <Captions />
    <Sounds />
  </AbsoluteFill>
);

export { HAND };
