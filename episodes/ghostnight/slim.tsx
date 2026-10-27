// Slim figure, no outlines: 1 : 4.3 head-to-body, 3/4 view facing right, soft shading + warm rim light.
// Joints: head tilt, blink, brows, mouth, shoulder / elbow / wrist per arm, finger spread. Origin = between the feet.
const rad = (d: number) => (d * Math.PI) / 180;
// deg 0 = straight down, +90 = toward +x
const at = (x: number, y: number, deg: number, len: number) => ({ x: x + Math.sin(rad(deg)) * len, y: y + Math.cos(rad(deg)) * len });

export type SlimLook = { skin: string; skinShade: string; hair: string; top: string; topShade: string; pants: string; shoes: string };
export const SLIM_GUARD: SlimLook = { skin: "#c98f62", skinShade: "#a5704a", hair: "#1b1614", top: "#2f3d5c", topShade: "#222c44", pants: "#2a2a30", shoes: "#e9e2d4" };

// arm angles in degrees: sh = shoulder (from straight down, + = forward / toward +x), el = elbow bend, wr = wrist bend
export type SlimArm = { sh: number; el: number; wr: number; spread?: number };
export type SlimProps = {
  x: number; y: number; s?: number; f?: number;
  look?: SlimLook; tilt?: number; eyesOpen?: number; gaze?: number; brow?: number; mouth?: number;
  front?: SlimArm; back?: SlimArm; rim?: string; id?: string;
};

const Hand = ({ x, y, deg, spread = 0.3, skin, shade }: { x: number; y: number; deg: number; spread?: number; skin: string; shade: string }) => (
  <g transform={`translate(${x},${y}) rotate(${-deg})`}>
    {[-1.5, -0.5, 0.5, 1.5].map((k, i) => (
      <line key={i} x1={k * 9} y1={30} x2={k * 9 + k * 10 * spread} y2={30 + 38 - Math.abs(k) * 6} stroke={i === 3 ? shade : skin} strokeWidth={13} strokeLinecap="round" />
    ))}
    <line x1={20} y1={14} x2={20 + 22 * (0.4 + spread)} y2={34} stroke={skin} strokeWidth={14} strokeLinecap="round" />
    <rect x={-25} y={-4} width={50} height={44} rx={20} fill={skin} />
  </g>
);

const Arm = ({ sx, sy, arm, top, topShade, skin, shade, far }: { sx: number; sy: number; arm: SlimArm; top: string; topShade: string; skin: string; shade: string; far?: boolean }) => {
  const e = at(sx, sy, arm.sh, 190);
  const w = at(e.x, e.y, arm.sh + arm.el, 175);
  const d = `M${sx},${sy} L${e.x},${e.y} L${w.x},${w.y}`;
  return (
    <g opacity={far ? 0.96 : 1}>
      <path d={d} stroke={far ? topShade : top} strokeWidth={58} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {!far && <path d={d} stroke={topShade} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(14,4)" opacity={0.55} />}
      <Hand x={w.x} y={w.y} deg={arm.sh + arm.el + arm.wr} spread={arm.spread} skin={far ? shade : skin} shade={shade} />
    </g>
  );
};

export const Slim = ({ x, y, s = 1, f = 0, look = SLIM_GUARD, tilt = 0, eyesOpen = 1, gaze = 0, brow = 0, mouth = 0, front = { sh: 6, el: 4, wr: 0 }, back = { sh: -4, el: -2, wr: 0 }, rim = "#ffb46a", id = "slim" }: SlimProps) => {
  const L = look;
  const breathe = Math.sin(f / 26) * 0.008;
  const shY = -790;
  const open = Math.max(0.08, eyesOpen);
  const eye = (cx: number, rx: number) => (
    <g transform={`translate(${cx},2)`}>
      <g transform={`scale(1,${open})`}>
        <ellipse rx={rx} ry={13} fill="#fbf6ee" />
        <circle cx={gaze * 5 + 3} r={10} fill="#2b1d16" />
        <circle cx={gaze * 5 + 6} cy={-4} r={3} fill="#fff" />
      </g>
      <path d={`M${-rx - 2},${-13 * open} Q0,${-19 * open} ${rx + 2},${-13 * open}`} stroke="#1b1614" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" x2="1">
          <stop offset="0" stopColor={L.top} />
          <stop offset="0.62" stopColor={L.top} />
          <stop offset="1" stopColor={L.topShade} />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.42" cy="0.4" r="0.7">
          <stop offset="0.55" stopColor={L.skin} />
          <stop offset="1" stopColor={L.skinShade} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={8} rx={170} ry={26} fill="#000" opacity={0.28} />
      {/* legs */}
      <path d="M-78,-470 L-70,-20 L-14,-20 L-4,-430 L6,-430 L22,-20 L80,-20 L84,-470 Z" fill={L.pants} />
      <path d="M40,-460 L84,-470 L80,-20 L56,-20 Z" fill="#000" opacity={0.18} />
      <path d="M-82,-28 L-6,-28 Q4,4 -20,8 L-88,8 Q-96,-10 -82,-28 Z" fill={L.shoes} />
      <path d="M14,-28 L88,-28 Q110,-4 96,8 L22,8 Q8,-10 14,-28 Z" fill={L.shoes} />
      {/* back arm (behind the body) */}
      <Arm sx={-70} sy={shY + 20} arm={{ ...back, sh: -back.sh }} top={L.top} topShade={L.topShade} skin={L.skin} shade={L.skinShade} far />
      {/* torso */}
      <g transform={`translate(0,${shY}) scale(1,${1 + breathe}) translate(0,${-shY})`}>
        <path d={`M-104,${shY + 6} Q0,${shY - 26} 108,${shY + 6} L96,-560 Q90,-480 86,-456 L-84,-456 Q-92,-500 -96,-560 Z`} fill={`url(#${id}-top)`} />
        <path d={`M22,${shY - 10} L28,-458`} stroke={L.topShade} strokeWidth={5} />
        <path d={`M-84,-500 L86,-500 L86,-456 L-84,-456 Z`} fill={L.topShade} opacity={0.6} />
        <path d={`M-104,${shY + 6} Q-112,${shY + 120} -96,-560`} stroke={rim} strokeWidth={6} fill="none" opacity={0.55} />
        <path d={`M-30,${shY - 14} Q22,${shY + 34} 70,${shY - 10}`} stroke={L.topShade} strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
      {/* neck + head (tilts around the neck) */}
      <g transform={`translate(10,${shY - 14}) rotate(${tilt}) translate(-10,${-(shY - 14)})`}>
        <rect x={-16} y={shY - 60} width={50} height={64} rx={14} fill={L.skinShade} />
        <g transform={`translate(8,${shY - 160})`}>
          <ellipse cx={-80} cy={10} rx={20} ry={27} fill={L.skinShade} />
          <path d="M-96,-30 Q-100,70 -40,104 Q10,128 58,100 Q100,70 100,-10 Q98,-110 0,-118 Q-92,-114 -96,-30 Z" fill={`url(#${id}-face)`} />
          <path d="M-98,-20 Q-104,-128 6,-130 Q104,-126 104,-30 Q90,-70 60,-82 Q40,-56 -6,-70 Q-40,-50 -66,-60 Q-80,-30 -78,0 Z" fill={L.hair} />
          <path d="M-60,-108 Q0,-138 70,-100" stroke="#4a3d36" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M-98,-20 Q-104,-110 -10,-128" stroke={rim} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          {/* brows: + brow = worried (inner ends up) */}
          <path d={`M-30,${-36 + brow * 2} Q-14,${-44 - brow * 4} 4,${-40 - brow * 9}`} stroke={L.hair} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M34,${-40 - brow * 9} Q52,${-46 - brow * 4} 70,${-36 + brow * 2}`} stroke={L.hair} strokeWidth={8} fill="none" strokeLinecap="round" />
          {eye(-14, 15)}
          {eye(52, 17)}
          <path d="M28,10 Q42,36 30,46" stroke={L.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
          {mouth > 0.05 ? (
            <g transform="translate(30,72)">
              <ellipse rx={15 + mouth * 3} ry={3 + mouth * 13} fill="#5a2620" />
              <ellipse cy={mouth * 7} rx={9} ry={mouth * 5} fill="#c45a50" />
            </g>
          ) : (
            <path d="M16,72 Q30,78 44,70" stroke="#6b3328" strokeWidth={5} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
      {/* front arm */}
      <Arm sx={82} sy={shY + 20} arm={front} top={L.top} topShade={L.topShade} skin={L.skin} shade={L.skinShade} />
    </g>
  );
};
