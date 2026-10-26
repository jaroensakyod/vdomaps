import { loadFont } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadHand } from "@remotion/google-fonts/Sriracha";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Clip, Film, Grease, LightBox, Skeleton, StatueShell, tubeFlicker, X, XRayDefs } from "./kit/XRay";

// N34 x-ray film: the 2014–15 scan of a Chinese Buddha statue that holds a mummified monk, retold on a wall light
// box. The tubes flicker on, the film slides down under the clips, the "window" opens until the seated skeleton
// shows inside the shell, wax-pencil marks circle the skull and spine, and a detail film of the empty belly with
// paper scraps slides in. Drawn reconstruction, not the real scan. 18 s.
export const demo: StyleDemo = { id: "N34", name: "ฟิล์มเอกซเรย์", frames: 540, cover: 492, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily;
const hand = loadHand("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.out(Easing.back(1.2));
const io = Easing.inOut(Easing.cubic);
const P = { x: -40, y: 300, w: 1160, h: 1640 }; // light panel (bleeds off the sides and the bottom)
const F = { x: 40, y: 360, w: 700, h: 1000, rot: -2.5 }; // main film
const D = { x: 590, y: 1010, w: 440, h: 390, rot: 4.5 }; // detail film
const E = { x: 742, y: 340, w: 318, h: 420, rot: 6 }; // head film
const CAPS = [
  { from: 0, to: 112, text: "ปี 2014 โรงพยาบาลในเนเธอร์แลนด์", sub: "สแกน CT พระพุทธรูปจีนโบราณ" },
  { from: 112, to: 330, text: "ข้างในคือร่างพระภิกษุ", sub: "นั่งขัดสมาธิ อยู่ในองค์พระ" },
  { from: 330, to: 440, text: "เชื่อว่าคืออาจารย์หลิวฉวน", sub: "มรณภาพราว ค.ศ. 1100" },
  { from: 440, to: 540, text: "ช่องท้องไม่มีอวัยวะ", sub: "พบเศษกระดาษเขียนอักษรจีน" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const on = tubeFlicker(frame - 18);
  const slide = r(46, 96, out);
  const snap = r(92, 100);
  const win = r(112, 196);
  const slide2 = r(334, 374, out);
  const snap2 = r(370, 378);
  const g1 = r(206, 250), g2 = r(256, 300), g3 = r(448, 500);
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 12, cap.to - 8, cap.to], [0, 1, 1, 0], clamp);
  const push = 1 + 0.035 * r(100, 540, Easing.linear);
  const filmY = F.y - 1500 * (1 - slide);
  const detX = D.x + 760 * (1 - slide2);
  const slide3 = r(170, 206, out);
  const snap3 = r(202, 210);
  const headY = E.y - 1100 * (1 - slide3);
  const cx = F.w / 2, cy = 520, s = 0.74;
  return (
    <AbsoluteFill style={{ background: X.wall }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.035} />
      {[18, 22, 27, 33, 40].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.25} />)}
      <Sfx src={SFX.whoosh} at={44} volume={0.25} />
      <Sfx src={SFX.pop} at={96} volume={0.4} />
      <Sfx src={SFX.riser} at={120} volume={0.18} />
      <Sfx src={SFX.hit} at={196} volume={0.25} />
      <Sfx src={SFX.whoosh} at={168} volume={0.2} />
      <Sfx src={SFX.pop} at={206} volume={0.3} />
      <Sfx src={SFX.whoosh} at={332} volume={0.22} />
      <Sfx src={SFX.pop} at={374} volume={0.35} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <XRayDefs />
        <rect width={W} height={1920} fill="url(#xr-room)" opacity={0.35 + 0.65 * on} />
        <g transform={`translate(540 900) scale(${push}) translate(-540 -900)`}>
          <LightBox {...P} on={on}>
            <clipPath id="xr-panel"><rect x={P.x} y={P.y} width={P.w} height={P.h} /></clipPath>
            <g clipPath="url(#xr-panel)">
              <Film x={F.x} y={filmY} w={F.w} h={F.h} rot={F.rot} lit={on} id="main" label="ภาพจำลอง · STATUE / AP · 01">
                <g transform={`translate(${cx} ${cy}) scale(${s})`}>
                  <StatueShell k={1} />
                  <Skeleton k={win} />
                </g>
                              </Film>
              <g transform={`translate(${F.x} ${filmY}) rotate(${F.rot} ${F.w / 2} 0)`}>
                <Grease p={g1} ring={[cx, cy - 330 * s, 92, 100]} note="กะโหลก" nx={cx + 110} ny={cy - 380 * s} font={hand} />
                <Grease p={g2} arrow={[cx + 250, cy - 40, cx + 34, cy - 110 * s]} note="กระดูกสันหลัง" nx={cx + 130} ny={cy + 10} font={hand} />
              </g>
              <Film x={E.x} y={headY} w={E.w} h={E.h} rot={E.rot} lit={on} id="head" label="ภาพจำลอง · ศีรษะ ×2">
                <g transform={`translate(${E.w / 2} ${E.h / 2 + 330 * 2 - 10}) scale(2)`}>
                  <Skeleton k={1} />
                </g>
              </Film>
              <Film x={detX} y={D.y} w={D.w} h={D.h} rot={D.rot} lit={on} id="det" label="ภาพจำลอง · ช่องท้อง ×2.4" side="L">
                <g transform={`translate(${D.w / 2} ${D.h / 2 - 10}) scale(2.4)`}>
                  <Skeleton k={1} />
                </g>
              </Film>
              <g transform={`translate(${detX} ${D.y}) rotate(${D.rot} ${D.w / 2} 0)`}>
                <Grease p={g3} ring={[D.w / 2, D.h / 2 - 10, 140, 104]} note="เศษกระดาษ" nx={22} ny={70} font={hand} size={36} />
              </g>
            </g>
          </LightBox>
          <Clip x={F.x + 170} y={P.y - 2} snap={snap} />
          <Clip x={F.x + F.w - 170} y={P.y - 2} snap={snap} />
          {slide3 > 0 && <Clip x={E.x + E.w / 2} y={headY + 6} snap={snap3} />}
          {slide2 > 0 && <Clip x={detX + 262} y={D.y + 14} snap={snap2} />}
        </g>
        {/* kicker + title */}
        <text x={540} y={118} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={38} letterSpacing={6} fill="#8fd3ff">N34 · ฟิล์มเอกซเรย์</text>
        <text x={540} y={218} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={84} fill={X.text}>ข้างในพระพุทธรูป</text>
        {/* caption */}
        <g opacity={capK * on}>
          <rect x={90} y={1652} width={900} height={4} fill="#1d6fa0" opacity={0.7} />
          <text x={90} y={1640} fontFamily={font} fontWeight={500} fontSize={26} fill="#1d6fa0" letterSpacing={3}>{`0${CAPS.indexOf(cap) + 1} / 04`}</text>
          <text x={90} y={1730} fontFamily={font} fontWeight={700} fontSize={62} fill="#0c1822">{cap.text}</text>
          <text x={90} y={1800} fontFamily={font} fontWeight={500} fontSize={44} fill="#2c4a60">{cap.sub}</text>
        </g>
        <text x={540} y={1885} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={26} fill="#4a6a80">ภาพจำลอง วาดขึ้นใหม่ · ไม่ใช่ภาพสแกนจริง</text>
      </svg>
    </AbsoluteFill>
  );
};
