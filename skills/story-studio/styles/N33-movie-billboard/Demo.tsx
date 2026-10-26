import { loadFont } from "@remotion/google-fonts/Chonburi";
import { loadFont as loadBody } from "@remotion/google-fonts/Sarabun";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BillboardDefs, Bulbs, C, Face, Floods, Grid, Ladder, Lettering, PaintIn, Painter, Scaffold, Sky, Street, Strokes } from "./kit/Billboard";

// N33 hand-painted cinema billboard: a made-up film's billboard is painted on a scaffold at dusk. A pencil
// squaring grid on primed boards, the moonlit harbour background brushed in stroke by stroke, then two giant faces, then
// the hand-lettered title; the sun goes down, the marquee bulbs chase and floodlights come on, and the camera walks up until one painted face fills the frame. 18 s, generic example.
export const demo: StyleDemo = { id: "N33", name: "ป้ายหนังเขียนมือ", frames: 540, cover: 534, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["600", "800"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.quad);
const B = { x: 50, y: 330, w: 980, h: 1080 }; // the board
const CAPS = [
  { from: 10, to: 135, text: "ตีตารางดินสอ ขยายจากโปสเตอร์ใบเล็ก" },
  { from: 135, to: 320, text: "ใบหน้าดาราเต็มแผ่นไม้ ลงสีทีละแปรง" },
  { from: 320, to: 432, text: "ชื่อเรื่องเขียนมือ ตัวโต อ่านได้จากถนน" },
  { from: 432, to: 560, text: "เปิดไฟป้าย คืนนี้ฉายรอบแรก" },
];
const STROKE_SFX = [34, 70, 104, 138, 176, 214, 252, 290, 326, 360, 392];

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: io });
  const bg = r(28, 150);
  const hero = r(128, 250);
  const heroine = r(222, 330);
  const title = r(322, 405);
  const tag = r(392, 432);
  const night = r(420, 470);
  const bulbs = r(440, 482);
  const floods = r(452, 470);
  const grid = 1 - r(140, 300);
  const push = 1 + 0.045 * r(0, 476);
  // final move: the camera walks up to the board until one painted face fills the frame
  const zoom = interpolate(frame, [476, 532], [1, 2.15], { ...clamp, easing: io });
  const camX = interpolate(frame, [476, 532], [540, 700], { ...clamp, easing: io });
  const camY = interpolate(frame, [476, 532], [960, 840], { ...clamp, easing: io });
  const painterX = interpolate(frame, [0, 130, 250, 330, 410, 470], [260, 420, 300, 700, 520, 760], { ...clamp, easing: io });
  const reach = 0.5 + 0.5 * Math.sin(frame * 0.18);
  const paint = frame < 128 ? "#f2683a" : frame < 322 ? C.skin : C.yellow;
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 14, cap.to - 10, cap.to], [0, 1, 1, 0], clamp);
  const dim = 1 - 0.2 * night; // the street and scaffold get darker, the lit board does not
  return (
    <AbsoluteFill style={{ background: C.night[0] }}>
      <Bed id="city_crowd" from={0} to={demo.frames} volume={0.07} />
      {STROKE_SFX.map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.12} />)}
      <Sfx src={SFX.swell} at={322} volume={0.25} />
      {[442, 452, 462, 472].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.2} />)}
      <Sfx src={SFX.hit} at={452} volume={0.3} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <BillboardDefs />
        <Sky night={night} />
        <g transform={`translate(540 960) scale(${push * zoom}) translate(${-camX} ${-camY})`}>
          {/* marquee strip above the board */}
          <rect x={B.x - 10} y={232} width={B.w + 20} height={98} fill="#9e1420" />
          <rect x={B.x - 10} y={232} width={B.w + 20} height={98} fill="none" stroke="#f6d88a" strokeWidth={5} />
          <text x={540} y={300} textAnchor="middle" fontFamily={font} fontSize={46} fill="#fff4d6">ฉายแล้ววันนี้ · ทุกรอบ</text>
          <Bulbs x1={B.x + 10} x2={B.x + B.w - 10} y={222} on={bulbs} t={frame} />

          {/* the board: primed plywood, seams, then paint */}
          <rect x={B.x - 14} y={B.y - 6} width={B.w + 28} height={B.h + 20} fill="#3a2a1e" />
          <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={C.prime} />
          <Grid x={B.x} y={B.y} w={B.w} h={B.h} opacity={grid * 0.9} />
          <clipPath id="bb-board"><rect x={B.x} y={B.y} width={B.w} height={B.h} /></clipPath>
          <g clipPath="url(#bb-board)">
            <PaintIn id="bg" p={bg} x={B.x} y={B.y} w={B.w} h={B.h} sw={150} seed={2}>
              <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="url(#bb-sunset)" />
              <Strokes x={B.x} y={B.y} w={B.w} h={560} n={70} color="#7fd0e0" sw={14} len={110} angle={-8} seed={7} opacity={0.35} />
              <Strokes x={B.x} y={B.y} w={B.w} h={400} n={50} color="#0a1540" sw={16} len={120} angle={-6} seed={9} opacity={0.35} />
              <circle cx={560} cy={920} r={150} fill="#fff2c0" opacity={0.95} />
              <circle cx={560} cy={920} r={210} fill="#e8fff4" opacity={0.25} />
              {/* sea and harbour */}
              <rect x={B.x} y={1010} width={B.w} height={400} fill="#123c44" />
              <Strokes x={B.x} y={1010} w={B.w} h={140} n={80} color="#cfeee0" sw={8} len={90} angle={0} seed={12} opacity={0.65} />
              <Strokes x={B.x} y={1050} w={B.w} h={300} n={60} color="#06222a" sw={12} len={120} angle={0} seed={13} opacity={0.5} />
              <path d="M50 1010 L50 940 L120 940 L120 900 L170 900 L170 960 L240 960 L240 1010 Z" fill="#071433" />
              <path d="M820 1012 L840 960 L1000 960 L1030 1012 Z M900 960 L900 820 M900 840 L970 940" fill="#071433" stroke="#071433" strokeWidth={8} />
              <rect x={B.x} y={B.y} width={B.w} height={B.h} filter="url(#bb-streak)" opacity={0.18} />
            </PaintIn>
            <PaintIn id="hero" p={hero} x={60} y={430} w={520} h={760} sw={130} angle={70} seed={4}>
              <Face id="hero" kind="hero" x={330} y={790} s={1.28} turn={0.35} look={0.4} />
            </PaintIn>
            <PaintIn id="heroine" p={heroine} x={560} y={380} w={440} h={640} sw={120} angle={-70} seed={6}>
              <Face id="her" kind="heroine" x={770} y={640} s={0.98} turn={-0.4} look={-0.6} />
            </PaintIn>
            {/* title band and lettering */}
            <PaintIn id="title" p={title} x={B.x} y={1140} w={B.w} h={180} sw={110} angle={0} seed={8}>
              <path d="M50 1148 L1030 1128 L1030 1300 L50 1320 Z" fill="#1c0d26" opacity={0.55} />
              <Lettering x={545} y={1268} size={104} text="ท่าเรือแห่งสัญญา" font={font} />
            </PaintIn>
            <g opacity={tag}>
              <rect x={B.x} y={1328} width={B.w} height={82} fill="#ffd23a" />
              <text x={540} y={1384} textAnchor="middle" fontFamily={font} fontSize={40} fill="#2a0a10">นำแสดงโดย ดาวเรือง · ภูผา</text>
              <rect x={826} y={344} width={190} height={50} fill="#fff4d6" transform="rotate(4 920 370)" />
              <text x={920} y={380} textAnchor="middle" fontFamily={body} fontWeight={800} fontSize={26} fill="#9e1420" transform="rotate(4 920 370)">หนังสมมติ</text>
            </g>
            <rect x={B.x} y={B.y} width={B.w} height={B.h} filter="url(#bb-streak-dark)" opacity={0.22} />
          </g>
          {/* board seams */}
          {[1, 2, 3].map((i) => <line key={i} x1={B.x + (B.w / 4) * i} y1={B.y} x2={B.x + (B.w / 4) * i} y2={B.y + B.h} stroke="#2a1a10" strokeWidth={3} opacity={0.4} />)}
          <rect x={B.x} y={B.y} width={B.w} height={B.h} fill={`rgba(255,236,190,${0.08 * floods})`} />

          <g opacity={dim}>
            <Scaffold top={B.y + B.h} dark={night * 0.6} />
            <Ladder x={860} y1={B.y + B.h + 20} y2={1920} lean={110} dark={night * 0.6} />
          </g>
          {/* street level: the cinema entrance glows and a queue gathers once the lights are on */}
          <Street night={night} t={frame} />
          <Painter x={painterX} y={B.y + B.h + 10} reach={reach} t={frame / 30} dark={night} paint={paint} />
          <Floods y={B.y + B.h + 12} on={floods * (2 - zoom) ** 3} />
          <Bulbs x1={B.x + 10} x2={B.x + B.w - 10} y={B.y + B.h + 4} on={bulbs} t={frame + 2} gap={52} />

        </g>
        {/* kicker: painted lettering on the sky */}
        <Lettering x={540} y={150} size={58} text="N33 · ป้ายหนังเขียนมือ" font={font} />
        {/* caption on a hand-painted board hung on the scaffold (stays put when the camera moves) */}
        <g transform="rotate(-1.5 540 1770)">
          <rect x={70} y={1698} width={940} height={142} fill="#f4e7c8" stroke="#2a1a10" strokeWidth={6} />
          <rect x={82} y={1710} width={916} height={118} fill="none" stroke="#c0262c" strokeWidth={4} />
          <line x1={200} y1={1660} x2={200} y2={1698} stroke="#2a2c34" strokeWidth={6} />
          <line x1={880} y1={1660} x2={880} y2={1698} stroke="#2a2c34" strokeWidth={6} />
          <text x={540} y={1788} textAnchor="middle" fontFamily={font} fontSize={44} fill="#2a0a10" opacity={capK}>{cap.text}</text>
        </g>
        <text x={990} y={1876} textAnchor="end" fontFamily={body} fontWeight={600} fontSize={24} fill="#f4e7c8" opacity={0.8}>ภาพประกอบ · ตัวอย่าง</text>
      </svg>
    </AbsoluteFill>
  );
};
