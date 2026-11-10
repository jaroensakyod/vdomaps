// Our own cast for the old-Siam shorts, drawn in SVG so every part can move: นายมั่น (a man of Ayutthaya: Mahatthai
// haircut, bare torso, indigo chong kraben, checked pha khao ma at the waist, bare feet) and แมวเฝ้ากลอง (a Wichien
// Maat / Siamese cat: cream coat, dark brown points, blue eyes), plus small props (mouse, fish, cowrie shell).
// Feet of every character stand on the bottom-centre of its viewBox, so `x, y` place the feet on the background.
import React from "react";

export const INK = "#3a2a22";
const SKIN = "#e8b48a", SKIN_SH = "#d39c72", HAIR = "#2b211c", STUBBLE = "#b8957a";
const PANTS = "#34477a", PANTS_SH = "#2a3a66";

export type Mouth = "smile" | "grin" | "o" | "flat" | "wow";
export type ManPose = {
  armL?: number; armR?: number;     // shoulder angles in degrees (0 = hanging down, +90 = straight out sideways)
  elbowL?: number; elbowR?: number; // extra bend at the elbow (degrees)
  mouth?: Mouth; blink?: number;    // 0 open .. 1 shut
  look?: number;                    // eyes -1 left .. 1 right
  brows?: number;                   // -1 worried .. 0 .. 1 cheerful
  tilt?: number;                    // whole-body lean (degrees)
  step?: number;                    // walk phase 0..1 (0 = standing)
  hold?: React.ReactNode;           // something in the right hand (drawn at the hand)
};

const rad = (d: number) => (d * Math.PI) / 180;
/** shoulder -> elbow -> hand points of an arm hanging from (sx, sy); side -1 = screen left */
export const arm = (sx: number, sy: number, side: number, ang: number, bend: number) => {
  const a = rad(ang) * side, L1 = 78, L2 = 72;
  const ex = sx + Math.sin(a) * L1, ey = sy + Math.cos(a) * L1;
  const b = a + rad(bend) * side;
  return { ex, ey, hx: ex + Math.sin(b) * L2, hy: ey + Math.cos(b) * L2 };
};

/** นายมั่น, viewBox 400 x 720, feet at (200, 712) */
export const NaiMan: React.FC<ManPose & { x: number; y: number; h: number; flip?: boolean }> = ({
  x, y, h, flip = false, armL = 8, armR = 8, elbowL = 6, elbowR = 6, mouth = "smile", blink = 0, look = 0, brows = 0, tilt = 0, step = 0, hold,
}) => {
  const w = (h * 400) / 720;
  const sw = Math.sin(step * Math.PI * 2), bob = step ? Math.abs(Math.cos(step * Math.PI * 2)) * -8 : 0;
  const L = arm(150, 318 + bob, -1, armL + (step ? sw * 18 : 0), elbowL), R = arm(250, 318 + bob, 1, armR - (step ? sw * 18 : 0), elbowR);
  const eyeY = 214 + bob, lid = Math.min(1, Math.max(0, blink));
  const eye = (ex: number) => lid > 0.6
    ? <path d={`M${ex - 11},${eyeY} Q${ex},${eyeY + 6} ${ex + 11},${eyeY}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    : <ellipse cx={ex + look * 4} cy={eyeY} rx={8} ry={11 * (1 - lid * 0.7)} fill={INK} />;
  const mouthEl = {
    smile: <path d={`M182,${258 + bob} Q200,${272 + bob} 218,${258 + bob}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />,
    grin: <path d={`M178,${254 + bob} Q200,${286 + bob} 222,${254 + bob} Z`} fill="#7a2e2a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />,
    o: <ellipse cx={200} cy={263 + bob} rx={9} ry={12} fill="#7a2e2a" stroke={INK} strokeWidth={5} />,
    wow: <ellipse cx={200} cy={265 + bob} rx={14} ry={18} fill="#7a2e2a" stroke={INK} strokeWidth={5} />,
    flat: <path d={`M186,${262 + bob} L214,${262 + bob}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />,
  }[mouth];
  const legX = (s: number) => 200 + s * 26 + (step ? s * sw * 0 : 0);
  const legLift = (s: number) => (step ? Math.max(0, s * sw) * 14 : 0);
  return (
    <svg x={x - w / 2} y={y - h} width={w} height={h} viewBox="0 0 400 720" overflow="visible">
      <g transform={`rotate(${tilt} 200 712) ${flip ? "translate(400 0) scale(-1 1)" : ""}`}>
        {/* legs + feet */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${step ? s * sw * 10 : 0} ${-legLift(s)})`}>
            <path d={`M${legX(s)},560 L${legX(s)},690`} stroke={SKIN} strokeWidth={26} strokeLinecap="round" />
            <path d={`M${legX(s)},560 L${legX(s)},690`} stroke={INK} strokeWidth={34} strokeLinecap="round" opacity={0} />
            <ellipse cx={legX(s) + s * 8} cy={700} rx={26} ry={13} fill={SKIN} stroke={INK} strokeWidth={6} />
          </g>
        ))}
        {[-1, 1].map((s) => <path key={"o" + s} d={`M${legX(s) - 13},565 L${legX(s) - 13},688 M${legX(s) + 13},565 L${legX(s) + 13},688`} stroke={INK} strokeWidth={5} transform={`translate(${step ? s * sw * 10 : 0} ${-legLift(s)})`} />)}
        {/* chong kraben: wrapped trousers to the knee, the tuck between the legs */}
        <g transform={`translate(0 ${bob})`}>
          <path d="M138,430 Q128,520 150,578 L192,578 L200,540 L208,578 L250,578 Q272,520 262,430 Z" fill={PANTS} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M200,450 L200,540 M170,470 Q165,520 172,570 M230,470 Q235,520 228,570" stroke={PANTS_SH} strokeWidth={5} fill="none" />
          {/* torso, bare */}
          <path d="M146,312 Q142,372 140,432 L260,432 Q258,372 254,312 Q200,292 146,312 Z" fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M228,330 Q246,380 246,428" stroke={SKIN_SH} strokeWidth={10} fill="none" opacity={0.7} />
          {/* pha khao ma: red/white checked cloth at the waist, knot on the left */}
          <defs>
            <pattern id="khaoma" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#c8453a" /><rect width="12" height="24" fill="#e9d9c0" opacity="0.55" /><rect width="24" height="12" fill="#e9d9c0" opacity="0.4" />
            </pattern>
          </defs>
          <path d="M136,418 Q200,410 264,418 L266,448 Q200,440 134,448 Z" fill="url(#khaoma)" stroke={INK} strokeWidth={5} />
          <path d="M150,440 Q140,470 152,494 L166,490 Q158,468 166,444 Z" fill="url(#khaoma)" stroke={INK} strokeWidth={4} />
        </g>
        {/* arms (behind the hand prop) */}
        {[L, R].map((A, i) => (
          <g key={i}>
            <path d={`M${i ? 250 : 150},${318 + bob} L${A.ex},${A.ey} L${A.hx},${A.hy}`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${i ? 250 : 150},${318 + bob} L${A.ex},${A.ey} L${A.hx},${A.hy}`} stroke={SKIN} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {hold ? <g transform={`translate(${R.hx} ${R.hy})`}>{hold}</g> : null}
        {/* head: Mahatthai cut = dark crown, shaved pale sides */}
        <g transform={`translate(0 ${bob})`}>
          <path d="M184,286 L184,306 L216,306 L216,286 Z" fill={SKIN} stroke={INK} strokeWidth={5} />
          <ellipse cx={200} cy={210} rx={86} ry={90} fill={SKIN} stroke={INK} strokeWidth={6} />
          <path d="M120,190 Q118,128 200,118 Q282,128 280,190 Q262,176 250,178 Q200,150 150,178 Q138,176 120,190 Z" fill={STUBBLE} opacity={0.55} />
          <path d="M140,168 Q146,116 200,112 Q256,116 262,168 Q236,150 200,150 Q164,150 140,168 Z" fill={HAIR} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={114} cy={222} rx={10} ry={16} fill={SKIN} stroke={INK} strokeWidth={5} />
          <ellipse cx={286} cy={222} rx={10} ry={16} fill={SKIN} stroke={INK} strokeWidth={5} />
          {/* brows */}
          <path d={`M160,${188 - brows * 4} L184,${186 + brows * 2}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <path d={`M216,${186 + brows * 2} L240,${188 - brows * 4}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          {eye(172)}{eye(228)}
          {mouthEl}
        </g>
      </g>
    </svg>
  );
};

export type CatPose = { blink?: number; tail?: number; head?: number; mouth?: "closed" | "open" | "chew"; look?: number; eat?: boolean };
const CREAM = "#f4e8d2", POINT = "#5b4134", EYE = "#4fa3d9";
/** แมววิเชียรมาศ sitting, viewBox 300 x 300, paws at (150, 292) */
export const Cat: React.FC<CatPose & { x: number; y: number; h: number; flip?: boolean }> = ({ x, y, h, flip = false, blink = 0, tail = 0, head = 0, mouth = "closed", look = 0 }) => {
  const w = h;
  const lid = Math.min(1, Math.max(0, blink));
  const eye = (ex: number) => lid > 0.6
    ? <path d={`M${ex - 9},112 Q${ex},118 ${ex + 9},112`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    : <g><ellipse cx={ex} cy={112} rx={11} ry={12 * (1 - lid * 0.7)} fill={EYE} stroke={INK} strokeWidth={3} /><ellipse cx={ex + look * 3} cy={112} rx={3.5} ry={9 * (1 - lid * 0.7)} fill={INK} /></g>;
  return (
    <svg x={x - w / 2} y={y - h} width={w} height={h} viewBox="0 0 300 300" overflow="visible">
      <g transform={flip ? "translate(300 0) scale(-1 1)" : ""}>
        {/* tail */}
        <path d={`M200,270 Q${262 + tail * 18},${250 - tail * 10} ${250 + tail * 30},${190 - Math.abs(tail) * 10}`} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={`M200,270 Q${262 + tail * 18},${250 - tail * 10} ${250 + tail * 30},${190 - Math.abs(tail) * 10}`} stroke={POINT} strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M95,290 Q80,200 120,160 L180,160 Q222,200 210,290 Z" fill={CREAM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M120,290 L122,250 M178,290 L176,250" stroke={INK} strokeWidth={4} />
        <ellipse cx={122} cy={290} rx={18} ry={9} fill={POINT} stroke={INK} strokeWidth={4} />
        <ellipse cx={178} cy={290} rx={18} ry={9} fill={POINT} stroke={INK} strokeWidth={4} />
        {/* head */}
        <g transform={`rotate(${head} 150 150)`}>
          <path d="M88,98 L96,30 L136,72 Z" fill={POINT} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M212,98 L204,30 L164,72 Z" fill={POINT} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={150} cy={115} rx={70} ry={58} fill={CREAM} stroke={INK} strokeWidth={5} />
          <ellipse cx={150} cy={130} rx={36} ry={30} fill={POINT} opacity={0.85} />
          {eye(120)}{eye(180)}
          <path d="M143,128 L157,128 L150,136 Z" fill="#2a1c16" />
          {mouth === "closed" ? <path d="M140,142 Q150,148 150,138 Q150,148 160,142" stroke="#2a1c16" strokeWidth={3} fill="none" />
            : <ellipse cx={150} cy={146} rx={8} ry={mouth === "open" ? 9 : 5} fill="#7a2e2a" stroke="#2a1c16" strokeWidth={3} />}
          {[-1, 1].map((s) => <path key={s} d={`M${150 + s * 30},136 L${150 + s * 74},128 M${150 + s * 30},142 L${150 + s * 72},146`} stroke={INK} strokeWidth={2} />)}
        </g>
      </g>
    </svg>
  );
};

/** a small grey mouse, viewBox 120 x 70, feet at (60, 66) */
export const Mouse: React.FC<{ x: number; y: number; h: number; flip?: boolean; step?: number }> = ({ x, y, h, flip = false, step = 0 }) => {
  const w = (h * 120) / 70, s = Math.sin(step * Math.PI * 2) * 4;
  return (
    <svg x={x - w / 2} y={y - h} width={w} height={h} viewBox="0 0 120 70" overflow="visible">
      <g transform={flip ? "translate(120 0) scale(-1 1)" : ""}>
        <path d={`M20,50 Q0,40 4,${22 + s}`} stroke={INK} strokeWidth={3} fill="none" />
        <ellipse cx={58} cy={46} rx={38} ry={20} fill="#8d8a94" stroke={INK} strokeWidth={3} />
        <ellipse cx={92} cy={38} rx={16} ry={13} fill="#8d8a94" stroke={INK} strokeWidth={3} />
        <circle cx={84} cy={24} r={9} fill="#d9a3a8" stroke={INK} strokeWidth={3} />
        <circle cx={98} cy={35} r={2.6} fill={INK} /><circle cx={108} cy={41} r={3} fill="#e07a8a" />
        <path d={`M44,64 L${46 + s},68 M70,64 L${68 - s},68`} stroke={INK} strokeWidth={3} />
      </g>
    </svg>
  );
};

export const Fish: React.FC<{ x: number; y: number; w: number; rot?: number; dried?: boolean }> = ({ x, y, w, rot = 0, dried = false }) => (
  <svg x={x - w / 2} y={y - w * 0.25} width={w} height={w * 0.5} viewBox="0 0 200 100" overflow="visible">
    <g transform={`rotate(${rot} 100 50)`}>
      <path d="M30,50 Q80,10 150,50 Q80,90 30,50 Z" fill={dried ? "#c9a46a" : "#9fb3c4"} stroke={INK} strokeWidth={5} />
      <path d="M150,50 L190,25 L185,50 L190,75 Z" fill={dried ? "#c9a46a" : "#9fb3c4"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={55} cy={45} r={5} fill={INK} />
    </g>
  </svg>
);

/** เบี้ย: a cowrie shell (the small change paid by each stall) */
export const Cowrie: React.FC<{ x: number; y: number; w: number; rot?: number }> = ({ x, y, w, rot = 0 }) => (
  <svg x={x - w / 2} y={y - w * 0.35} width={w} height={w * 0.7} viewBox="0 0 100 70" overflow="visible">
    <g transform={`rotate(${rot} 50 35)`}>
      <ellipse cx={50} cy={35} rx={44} ry={30} fill="#f3e3b6" stroke={INK} strokeWidth={4} />
      <path d="M14,35 Q50,28 86,35" stroke={INK} strokeWidth={4} fill="none" />
      {[24, 36, 48, 60, 72].map((xx) => <path key={xx} d={`M${xx},31 L${xx},39`} stroke={INK} strokeWidth={2.5} />)}
    </g>
  </svg>
);
