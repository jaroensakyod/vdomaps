import { loadFont } from "@remotion/google-fonts/Itim";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Clown, Depth, Hut, lampAt, T, TalungDefs, TreePuppet } from "./kit/Talung";

// N35 colour nang talung: a lamp-lit white screen in a thatched hut. The tree puppet twirls on to open the
// show and away again; two original comic puppets hop on and talk with flapping hinged jaws and rod arms, one
// pulled in from far behind the screen (blurred) until it presses sharp on the cloth. Facts about the form. 18 s.
export const demo: StyleDemo = { id: "N35", name: "หนังตะลุงสี", frames: 540, cover: 352, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const S = { x: 70, y: 370, w: 940, h: 1010 };
const FEET = S.y + S.h - 60;
const CAPS = [
  { from: 0, to: 132, who: "", text: "หนังตะลุง มหรสพเงาของภาคใต้" },
  { from: 132, to: 262, who: "ลุงหมอก", text: "นายหนังคนเดียว เชิดและพากย์ทุกตัว!" },
  { from: 262, to: 402, who: "น้าเหมี้ยว", text: "ตัวตลกอย่างข้า ขยับปาก ขยับแขนได้" },
  { from: 402, to: 540, who: "ลุงหมอก", text: "เชื่อกันว่า “ตะลุง” มาจากชื่อ “พัทลุง”" },
];
const talk = (f: number, a: number, b: number) => (f >= a && f < b ? Math.max(0, Math.sin((f - a) * 0.75)) * (0.6 + 0.4 * Math.sin(f * 0.21)) : 0);

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const lamp = r(0, 24) * lampAt(frame);
  // tree puppet: twirls in, plants, twirls out
  const treeX = interpolate(frame, [14, 60, 82, 118], [-260, 540, 540, 1360], { ...clamp, easing: io });
  const treeSpin = interpolate(frame, [14, 66, 82, 118], [0, 2, 2, 3.5], { ...clamp, easing: io });
  // ลุงหมอก
  const mokX = interpolate(frame, [104, 150], [-260, 320], { ...clamp, easing: Easing.out(Easing.quad) });
  const mokHop = frame > 104 && frame < 150 ? -Math.abs(Math.sin(frame * 0.4)) * 34 : 0;
  const mokJaw = talk(frame, 140, 256) + talk(frame, 412, 530);
  const mokArm = frame < 140 ? -0.4 : interpolate(frame, [140, 160, 240, 262, 410, 430], [-0.2, 0.45, 0.45, -0.2, -0.2, 0.9], clamp) + Math.sin(frame * 0.2) * 0.08;
  // น้าเหมี้ยว: comes from far behind the screen (soft), then presses on (sharp)
  const miuX = interpolate(frame, [226, 290], [1340, 770], { ...clamp, easing: Easing.out(Easing.quad) });
  const miuAway = 1 - r(262, 310);
  const miuHop = frame > 226 && frame < 290 ? -Math.abs(Math.sin(frame * 0.33)) * 40 : 0;
  const miuJaw = talk(frame, 300, 398);
  const miuArm = interpolate(frame, [300, 320], [-0.3, 0.15], clamp) * (frame < 400 ? 1 : 0.2) + Math.sin(frame * 0.32) * (frame > 300 && frame < 400 ? 0.22 : 0.05);
  const laugh = frame > 470 ? Math.abs(Math.sin(frame * 0.5)) * 14 : 0;
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 10, cap.to - 8, cap.to], [0, 1, 1, 0], clamp);
  const sign = (
    <g>
      <rect x={160} y={70} width={760} height={220} rx={10} fill={T.trim} stroke="#f2c43a" strokeWidth={8} />
      <rect x={178} y={88} width={724} height={184} rx={6} fill="none" stroke="#f2c43a" strokeWidth={2} strokeDasharray="10 8" />
      <text x={540} y={140} textAnchor="middle" fontFamily={font} fontSize={40} fill="#ffe7a0">N35 · หนังตะลุงสี</text>
      <text x={540} y={250} textAnchor="middle" fontFamily={font} fontSize={96} fill="#fff6dc" stroke="#5a0a0e" strokeWidth={4} paintOrder="stroke">หนังตะลุง คืออะไร?</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ background: T.night }}>
      <Bed id="city_crowd" from={0} to={demo.frames} volume={0.06} />
      <Hit id="gong" at={60} volume={0.35} />
      <Hit id="gong" at={150} volume={0.2} />
      <Sfx src={SFX.whoosh} at={12} volume={0.2} />
      <Sfx src={SFX.whoosh} at={84} volume={0.2} />
      <Sfx src={SFX.whoosh} at={262} volume={0.15} />
      <Hit id="crowd_cheer" at={478} volume={0.2} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <TalungDefs />
        <Hut {...S} lamp={lamp} sign={sign} />
        <clipPath id="tl-scr"><rect x={S.x} y={S.y} width={S.w} height={S.h} /></clipPath>
        <g clipPath="url(#tl-scr)">
          {treeX > -250 && treeX < 1350 && (
            <Depth id="tree" x={treeX} y={FEET + 20} s={1.2} away={0}>
              <TreePuppet spin={treeSpin} />
            </Depth>
          )}
          <Depth id="miu" x={miuX} y={FEET + miuHop + (frame > 470 ? -laugh : 0)} s={1.36} face={-1} away={miuAway} rot={frame > 470 ? -laugh * 0.3 : 0}>
            <Clown kind="thin" skin="#5a4fc8" cloth="#f2b731" accent="#d0342c" jaw={miuJaw} arm={miuArm} t={frame / 30} />
          </Depth>
          <Depth id="mok" x={mokX} y={FEET + mokHop + (frame > 470 ? -laugh * 0.7 : 0)} s={1.38} away={0} rot={frame > 470 ? laugh * 0.25 : 0}>
            <Clown kind="fat" skin="#d2552e" cloth="#2f9a4a" accent="#f2b731" jaw={mokJaw} arm={mokArm} t={frame / 30} />
          </Depth>
        </g>
        {/* fascia board with the caption */}
        <rect x={40} y={S.y + S.h + 70} width={1000} height={250} fill="#1f5a34" stroke="#f2c43a" strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${60 + i * 84} ${S.y + S.h + 70} l42 26 l42 -26`} fill="#c8202a" stroke="#f2c43a" strokeWidth={3} />)}
        <g opacity={capK}>
          {cap.who && (
            <g>
              <rect x={80} y={S.y + S.h + 122} width={cap.who.length * 26 + 50} height={60} rx={30} fill="#f2c43a" />
              <text x={105} y={S.y + S.h + 164} fontFamily={font} fontSize={38} fill="#3a1a08">{cap.who}</text>
            </g>
          )}
          <text x={540} y={S.y + S.h + (cap.who ? 262 : 222)} textAnchor="middle" fontFamily={font} fontSize={56} fill={T.text}>{cap.text}</text>
        </g>
        {/* audience on mats, lit by the screen */}
        <defs>
          <linearGradient id="tl-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a2a1a" />
            <stop offset="1" stopColor="#0c0a08" />
          </linearGradient>
        </defs>
        <rect x={0} y={1720} width={W} height={200} fill="url(#tl-ground)" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = 60 + i * 96 + (i % 2) * 20, y = 1890 - (i % 3) * 26;
          return (
            <g key={i} transform={`translate(${x} ${y + Math.sin(frame * 0.05 + i) * 2})`}>
              <path d="M-50 80 C-50 10 -30 -6 0 -6 C30 -6 50 10 50 80 Z" fill="#07060a" />
              <circle cx={0} cy={-36} r={30} fill="#07060a" />
              <path d="M-26 -54 A30 30 0 0 1 26 -54" stroke="#ffe7b0" strokeWidth={3} fill="none" opacity={0.35 * lamp} />
            </g>
          );
        })}
        <text x={540} y={1752} textAnchor="middle" fontFamily={font} fontSize={26} fill="#c9b79a" opacity={0.8}>ภาพประกอบ · ตัวละครสมมติ</text>
      </svg>
    </AbsoluteFill>
  );
};
