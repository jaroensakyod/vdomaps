// Slim figure, no outlines: 1 : 4.3 head-to-body, 3/4 view facing right, soft shading + warm rim light.
// Joints: head tilt, blink, brows, mouth, shoulder / elbow / wrist per arm, finger spread. Origin = between the feet.
// Look: male / female build, hair style, bottom (pants / sarong / robe), shoes (incl. oversized slip-ons), age lines, lips.
const rad = (d: number) => (d * Math.PI) / 180;
// deg 0 = straight down, +90 = toward +x
const at = (x: number, y: number, deg: number, len: number) => ({ x: x + Math.sin(rad(deg)) * len, y: y + Math.cos(rad(deg)) * len });

export type SlimHair = "short" | "crop" | "long" | "bun" | "bald";
export type SlimLook = {
  skin: string; skinShade: string; hair: string; top: string; topShade: string; pants: string; shoes: string;
  body?: "m" | "f"; hairStyle?: SlimHair; bottom?: "pants" | "sarong" | "robe"; shoe?: "sneaker" | "slipper" | "big";
  lips?: string; age?: number; pattern?: string;
  print?: "dots" | "check" | "stripe"; // printed paper on the shirt (paper style only)
};
export const SLIM_GUARD: SlimLook = { skin: "#c98f62", skinShade: "#a5704a", hair: "#1b1614", top: "#2f3d5c", topShade: "#222c44", pants: "#2a2a30", shoes: "#e9e2d4" };

// Cast for "เพื่อนรัก"
export const SLIM_PRAE: SlimLook = { skin: "#c08658", skinShade: "#9c6842", hair: "#191412", top: "#2c3b57", topShade: "#1e2a40", pants: "#3a3530", shoes: "#d9d2c4", body: "f", hairStyle: "crop", lips: "#8a4a3c", print: "check" };
export const SLIM_FON: SlimLook = { skin: "#b97f55", skinShade: "#966240", hair: "#120e0d", top: "#c65b7c", topShade: "#9c4360", pants: "#3b4a6b", shoes: "#e6ddd0", body: "f", hairStyle: "long", lips: "#a84a48", print: "dots" };
export const SLIM_FON_THIN: SlimLook = { ...SLIM_FON, print: undefined, skin: "#ad7a55", skinShade: "#86593b", top: "#8f8a80", topShade: "#6b665e", shoe: "slipper", lips: "#8a5048" };
// hospital-day / ghost look: powdered face, red lips, black top, grey trousers, his black slip-ons
export const SLIM_FON_LAST: SlimLook = { ...SLIM_FON, print: undefined, skin: "#e2cfc0", skinShade: "#b9a090", top: "#18171a", topShade: "#0c0b0d", pants: "#6e6d70", shoes: "#141315", shoe: "big", lips: "#b3202c" };
export const SLIM_MOM: SlimLook = { skin: "#b07a52", skinShade: "#8c5d3c", hair: "#9a958e", top: "#d8cdb8", topShade: "#b3a78f", pants: "#5a3b52", shoes: "#c9b9a0", body: "f", hairStyle: "bun", bottom: "sarong", pattern: "#7a5470", shoe: "slipper", age: 0.85, lips: "#7a4a3e", print: "dots" };
export const SLIM_DAD: SlimLook = { skin: "#a8724a", skinShade: "#835636", hair: "#b8b2aa", top: "#4c5a46", topShade: "#38432f", pants: "#2f2b28", shoes: "#8a7a66", hairStyle: "short", shoe: "slipper", age: 0.8, print: "check" };
export const SLIM_TOM: SlimLook = { skin: "#eabd9c", skinShade: "#c99878", hair: "#d9b46a", top: "#4f8f94", topShade: "#3a6d71", pants: "#3f6d72", shoes: "#f0ece4", hairStyle: "short" };
export const SLIM_MONK: SlimLook = { skin: "#b67e54", skinShade: "#916040", hair: "#3a302a", top: "#d9822b", topShade: "#b0651c", pants: "#d9822b", shoes: "#b67e54", hairStyle: "bald", bottom: "robe", shoe: "slipper", age: 0.6 };
export const SLIM_KID: SlimLook = { skin: "#c08a60", skinShade: "#9c6a46", hair: "#15110f", top: "#f2d36b", topShade: "#cfae48", pants: "#4d6fa3", shoes: "#f1ece2", body: "f", hairStyle: "long", lips: "#b25a50", print: "dots" };

// arm angles in degrees: sh = shoulder (from straight down, + = forward / toward +x), el = elbow bend, wr = wrist bend
export type SlimHold = "cup" | "knife" | "phone" | "papaya" | "bottle";
export type SlimArm = { sh: number; el: number; wr: number; spread?: number; hold?: SlimHold };
export type SlimProps = {
  x: number; y: number; s?: number; f?: number;
  look?: SlimLook; tilt?: number; eyesOpen?: number; gaze?: number; brow?: number; mouth?: number;
  front?: SlimArm; back?: SlimArm; rim?: string; id?: string;
  head?: number; bruise?: number; bandage?: boolean; veil?: number; tears?: number;
  // soft = shaded figure · paper = flat cut-out puppet with cream edge, pins at the joints, grain · ink = shadow-play silhouette, rim light, glowing eyes
  style?: SlimStyle;
  // stand (origin = between the feet) · sit (origin = feet on the floor, seat ~260 up) · lie (on the back, origin = middle of the body, head to the left)
  pose?: "stand" | "sit" | "lie"; flip?: boolean;
};
export type SlimStyle = "soft" | "paper" | "ink";
// the dead in shadow-play: pale, cold, glowing
const INK_GHOST = (l: SlimLook): SlimLook => ({ ...l, skin: "#dfe6ee", skinShade: "#b9c4d2", hair: "#e9eef4", top: "#cfd8e4", topShade: "#aab6c6", pants: "#c3ccd8", shoes: "#9aa6b8", lips: undefined, age: 0 });
const INK = (l: SlimLook): SlimLook => ({ ...l, skin: "#1d1923", skinShade: "#15121a", hair: "#0c0a0f", top: "#18151d", topShade: "#121016", pants: "#141118", shoes: "#0f0d12", pattern: "#211c28", lips: undefined, age: 0 });

const Held = ({ hold }: { hold: SlimHold }) => {
  if (hold === "cup") return <g><rect x={-22} y={20} width={44} height={56} rx={8} fill="#efe8dc" /><rect x={-22} y={20} width={44} height={10} fill="#5b3a26" opacity={0.8} /><path d="M22,34 Q40,40 22,58" stroke="#efe8dc" strokeWidth={7} fill="none" /></g>;
  if (hold === "phone") return <g><rect x={-20} y={8} width={40} height={78} rx={8} fill="#141418" /><rect x={-15} y={14} width={30} height={64} rx={4} fill="#9fd2ff" opacity={0.85} /></g>;
  if (hold === "papaya") return <g><ellipse cx={0} cy={60} rx={34} ry={58} fill="#7fa83e" /><ellipse cx={-10} cy={44} rx={10} ry={30} fill="#a9cc5c" opacity={0.6} /></g>;
  if (hold === "bottle") return <g><rect x={-14} y={0} width={28} height={84} rx={8} fill="#b9d6c8" opacity={0.9} /><rect x={-14} y={30} width={28} height={30} fill="#e0b13a" /><rect x={-7} y={-12} width={14} height={14} fill="#c43c32" /></g>;
  // machete (มีดพร้า): wooden grip then a long blade, hooked tip
  return <g><rect x={-9} y={-6} width={18} height={56} rx={6} fill="#5b3a22" /><path d="M-12,48 L14,48 L22,250 Q4,276 -18,258 Z" fill="#b9bec4" /><path d="M8,52 L18,248" stroke="#e8ecef" strokeWidth={5} opacity={0.7} /></g>;
};

const Hand = ({ x, y, deg, spread = 0.3, skin, shade, hold }: { x: number; y: number; deg: number; spread?: number; skin: string; shade: string; hold?: SlimHold }) => (
  <g transform={`translate(${x},${y}) rotate(${-deg})`}>
    {hold && <Held hold={hold} />}
    {[-1.5, -0.5, 0.5, 1.5].map((k, i) => (
      <line key={i} x1={k * 8} y1={26} x2={k * 8 + k * 8 * (hold ? -0.3 : spread)} y2={26 + (hold ? 22 : 34) - Math.abs(k) * 5} stroke={i === 3 ? shade : skin} strokeWidth={11} strokeLinecap="round" />
    ))}
    <line x1={17} y1={12} x2={17 + 18 * (0.4 + (hold ? 0 : spread))} y2={30} stroke={skin} strokeWidth={12} strokeLinecap="round" />
    <path d="M-20,0 Q-23,22 -16,36 L16,36 Q23,22 20,0 Z" fill={skin} />
    <path d="M10,4 Q18,20 14,34" stroke={shade} strokeWidth={5} fill="none" opacity={0.5} />
  </g>
);

const Arm = ({ sx, sy, arm, top, topShade, skin, shade, far, thin, pins }: { sx: number; sy: number; arm: SlimArm; top: string; topShade: string; skin: string; shade: string; far?: boolean; thin?: boolean; pins?: boolean }) => {
  const e = at(sx, sy, arm.sh, thin ? 180 : 190);
  const w = at(e.x, e.y, arm.sh + arm.el, thin ? 165 : 175);
  const d = `M${sx},${sy} L${e.x},${e.y} L${w.x},${w.y}`;
  const sw = thin ? 46 : 58;
  // sleeve stops at the elbow-ish: forearm in skin
  const mid = { x: e.x + (w.x - e.x) * 0.35, y: e.y + (w.y - e.y) * 0.35 };
  return (
    <g opacity={far ? 0.96 : 1}>
      <path d={`M${e.x},${e.y} L${w.x},${w.y}`} stroke={far ? shade : skin} strokeWidth={sw - 14} fill="none" strokeLinecap="round" />
      <path d={`M${sx},${sy} L${e.x},${e.y} L${mid.x},${mid.y}`} stroke={far ? topShade : top} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {!far && <path d={d} stroke={topShade} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(12,4)" opacity={0.35} />}
      <Hand x={w.x} y={w.y} deg={arm.sh + arm.el + arm.wr} spread={arm.spread} skin={far ? shade : skin} shade={shade} hold={arm.hold} />
      {pins && [{ x: sx, y: sy }, e].map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r={9} fill="#c9a24a" /><circle cx={q.x - 2} cy={q.y - 2} r={3} fill="#fff3c4" /></g>)}
    </g>
  );
};

const Shoe = ({ x, kind, color, skin, front }: { x: number; kind: "sneaker" | "slipper" | "big"; color: string; skin: string; front?: boolean }) => {
  if (kind === "slipper") return (
    <g transform={`translate(${x},0)`}>
      <path d="M-36,-22 L30,-22 Q48,-8 40,4 L-38,4 Q-48,-8 -36,-22 Z" fill={skin} />
      <rect x={-46} y={0} width={96} height={12} rx={6} fill={color} />
      <path d="M-20,-20 Q4,-34 26,-14" stroke={color} strokeWidth={9} fill="none" />
    </g>
  );
  if (kind === "big") return (
    // oversized slip-on: toe box sticks out far past the foot, heel shows bare skin
    <g transform={`translate(${x},0)`}>
      <path d="M-44,-34 L-16,-34 L-16,4 L-46,4 Z" fill={skin} />
      <path d="M-22,-40 L66,-40 Q124,-30 124,2 Q124,16 104,16 L-26,16 Q-34,-16 -22,-40 Z" fill={color} />
      <path d="M-20,-36 Q24,-48 64,-36" stroke="#4a4a52" strokeWidth={5} fill="none" opacity={0.7} />
      {front && <path d="M40,-34 Q92,-30 116,-6" stroke="#66656e" strokeWidth={5} fill="none" opacity={0.6} />}
    </g>
  );
  return <path transform={`translate(${x},0)`} d="M-42,-28 L36,-28 Q58,-4 44,8 L-30,8 Q-50,-10 -42,-28 Z" fill={color} />;
};

export const Slim = ({ x, y, s = 1, f = 0, look = SLIM_GUARD, tilt = 0, eyesOpen = 1, gaze = 0, brow = 0, mouth = 0, front = { sh: 6, el: 4, wr: 0 }, back = { sh: -4, el: -2, wr: 0 }, rim = "#ffb46a", id = "slim", head = 1, bruise = 0, bandage, veil = 0, tears = 0, style = "soft", pose = "stand", flip = false }: SlimProps) => {
  const ghost = style === "ink" && veil > 0;
  const L = style === "ink" ? (ghost ? INK_GHOST(look) : INK(look)) : look;
  const flat = style !== "soft";
  if (style === "paper") { rim = "transparent"; head *= 1.35; }
  // paper: every body part is its own cut piece (hand-cut cream edge, small drop shadow, paper fibre)
  const pc = style === "paper" ? `url(#${id}-pc)` : undefined;
  if (style === "ink" && rim === "#ffb46a") rim = "#ffcf8f";
  const soft = style === "soft";
  if (soft) head *= 1.1;
  const fem = L.body === "f";
  const hs = L.hairStyle ?? "short";
  const bottom = L.bottom ?? "pants";
  const shoe = L.shoe ?? "sneaker";
  const age = L.age ?? 0;
  const breathe = Math.sin(f / 26) * 0.008;
  const shY = fem ? -770 : -790;
  const shX = fem ? 88 : 104;
  const open = Math.max(0.08, eyesOpen);
  const eye = (cx: number, rx: number) => style === "paper" ? (
    <g transform={`translate(${cx + gaze * 4},4) scale(1,${open})`}>
      <ellipse rx={rx * 0.55} ry={12} fill="#1b1614" />
      <circle cx={3} cy={-4} r={3} fill="#fff" />
    </g>
  ) : style === "ink" ? (
    <g transform={`translate(${cx + gaze * 4},4) scale(1,${open})`}>
      <ellipse rx={rx * 0.45} ry={6} fill="#e9dcc4" opacity={0.85} />
    </g>
  ) : (
    <g transform={`translate(${cx},2)`}>
      <clipPath id={`${id}-e${cx}`}><path d={`M${-rx},3 Q${-rx * 0.2},-33 ${rx},-6 Q${rx * 0.3},26 ${-rx},3 Z`} transform={`scale(1,${open})`} /></clipPath>
      <path d={`M${-rx},3 Q${-rx * 0.2},-33 ${rx},-6 Q${rx * 0.3},26 ${-rx},3 Z`} transform={`scale(1,${open})`} fill="#fbf6ee" />
      <g clipPath={`url(#${id}-e${cx})`}>
        <circle cx={gaze * 5 + 2} cy={-1} r={fem ? 12.5 : 11} fill={`url(#${id}-iris)`} />
        <circle cx={gaze * 5 + 2} cy={-1} r={5.5} fill="#120c0a" />
        <circle cx={gaze * 5 + 6.5} cy={-6} r={3.6} fill="#fff" />
        <circle cx={gaze * 5 - 2} cy={4} r={1.7} fill="#fff" opacity={0.85} />
        <path d={`M${-rx},-24 L${rx},-24 L${rx},-8 Q0,-14 ${-rx},-4 Z`} fill="#000" opacity={0.12} />
      </g>
      <path d={`M${-rx - 2},3 Q${-rx * 0.2},${-33 * open - 1} ${rx + 2},${-6 * open}`} stroke="#1b1614" strokeWidth={fem ? 6.5 : 5} fill="none" strokeLinecap="round" />
      {fem && <path d={`M${rx + 1},${-6 * open} Q${rx + 8},${-9 * open} ${rx + 13},${-16 * open}`} stroke="#1b1614" strokeWidth={4.5} fill="none" strokeLinecap="round" />}
      {open > 0.5 && <path d={`M${-rx * 0.6},-24 Q${rx * 0.1},-34 ${rx * 0.8},-21`} stroke={L.skinShade} strokeWidth={3} fill="none" opacity={0.75} strokeLinecap="round" />}
      {open > 0.5 && <path d={`M${-rx * 0.55},13 Q${rx * 0.1},18 ${rx * 0.75},9`} stroke={L.skinShade} strokeWidth={2.5} fill="none" opacity={0.6} strokeLinecap="round" />}
    </g>
  );
  const torso = fem
    ? `M${-shX},${shY + 8} Q0,${shY - 22} ${shX + 4},${shY + 8} L84,-650 Q68,-600 74,-540 Q88,-490 90,-456 L-86,-456 Q-84,-500 -70,-545 Q-62,-600 -78,-650 Z`
    : `M${-shX},${shY + 6} Q0,${shY - 26} ${shX + 4},${shY + 6} L96,-560 Q90,-480 86,-456 L-84,-456 Q-92,-500 -96,-560 Z`;
  const legs = fem
    ? "M-80,-470 L-60,-20 L-16,-20 L-4,-420 L6,-420 L20,-20 L64,-20 L84,-470 Z"
    : "M-78,-470 L-70,-20 L-14,-20 L-4,-430 L6,-430 L22,-20 L80,-20 L84,-470 Z";
  const headT = `translate(10,${shY - 14}) rotate(${tilt}) scale(${head}) translate(-10,${-(shY - 14)})`;
  const D = pose === "sit" ? 210 : 0;
  const hipY = -260;
  const sitLegs = (
    <g filter={pc}>
      {(() => {
        const col = bottom === "pants" ? L.pants : L.skinShade;
        const w = fem ? 70 : 80;
        return <>
          <path d={`M-30,${hipY + 6} L150,${hipY + 10} L158,-28`} stroke={col} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M-30,${hipY + 6} L150,${hipY + 10} L158,-28`} stroke="#000" strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.22} />
          <path d={`M0,${hipY + 14} L196,${hipY + 18} L204,-28`} stroke={bottom === "pants" ? L.pants : L.skin} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {bottom === "pants" && <path d={`M40,${hipY - 14} L180,${hipY - 8}`} stroke="#fff" strokeWidth={6} opacity={0.08} strokeLinecap="round" />}
          {bottom !== "pants" && <path d={`M-96,${hipY - 40} L236,${hipY - 30} L244,-70 L130,-70 L126,${hipY + 50} L-96,${hipY + 50} Z`} fill={bottom === "robe" ? L.top : L.pants} />}
          {bottom === "sarong" && [0, 1, 2].map((i) => <path key={i} d={`M${130 + i * 2},${-200 + i * 50} L${240 - i * 2},${-196 + i * 50}`} stroke={L.pattern ?? L.topShade} strokeWidth={i % 2 ? 6 : 12} opacity={0.7} />)}
          {bottom === "robe" && <path d={`M-90,${hipY - 20} Q80,${hipY - 10} 236,${hipY + 10}`} stroke={L.topShade} strokeWidth={8} fill="none" opacity={0.6} />}
        </>;
      })()}
      <Shoe x={150} kind={shoe} color={L.shoes} skin={L.skinShade} />
      <Shoe x={204} kind={shoe} color={L.shoes} skin={L.skin} front />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})${pose === "lie" ? " rotate(-90) translate(0,520)" : ""}`}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" x2="1">
          <stop offset="0" stopColor={L.top} />
          <stop offset="0.62" stopColor={L.top} />
          <stop offset="1" stopColor={flat ? L.top : L.topShade} />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.42" cy="0.4" r="0.7">
          <stop offset="0.55" stopColor={L.skin} />
          <stop offset="1" stopColor={flat ? L.skin : L.skinShade} />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="0.5" cy="0.7" r="0.6">
          <stop offset="0" stopColor="#8a5a38" /><stop offset="0.55" stopColor="#3f2618" /><stop offset="1" stopColor="#170d08" />
        </radialGradient>
        <radialGradient id={`${id}-blush`}><stop offset="0" stopColor="#e86e5e" stopOpacity={0.55} /><stop offset="1" stopColor="#e86e5e" stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0.3} /><stop offset="0.6" stopColor="#000" stopOpacity={0} /></linearGradient>
        <filter id={`${id}-pc`} x="-30%" y="-20%" width="160%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={7} result="d0" />
          <feTurbulence type="fractalNoise" baseFrequency={0.06} numOctaves={2} seed={7} result="t" />
          <feDisplacementMap in="d0" in2="t" scale={9} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feFlood floodColor="#f6efdf" /><feComposite in2="d" operator="in" result="edge" />
          <feOffset in="d" dx={6} dy={8} result="o" /><feGaussianBlur in="o" stdDeviation={4} result="ob" />
          <feFlood floodColor="#000" floodOpacity={0.38} /><feComposite in2="ob" operator="in" result="shadow" />
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={3} seed={4} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.24 0 0 0 -0.07" result="g" />
          <feComposite in="g" in2="SourceAlpha" operator="in" result="grain" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="edge" /><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /></feMerge>
        </filter>
      </defs>
        <filter id={`${id}-glow`} x="-40%" y="-20%" width="180%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={18} result="b" />
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.88  0 0 0 0 1  0 0 0 0.9 0" result="c" />
          <feMerge><feMergeNode in="c" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      <g filter={ghost ? `url(#${id}-glow)` : undefined} opacity={ghost ? 0.82 : 1}>
      {style !== "paper" && pose !== "lie" && <ellipse cx={pose === "sit" ? 90 : 0} cy={8} rx={170} ry={26} fill="#000" opacity={0.28} />}
      {pose === "sit" ? sitLegs : <g filter={pc}>
      {/* legs / bottom */}
      {bottom === "pants" && <>
        <path d={legs} fill={L.pants} />
        <path d="M40,-460 L84,-470 L76,-20 L56,-20 Z" fill="#000" opacity={0.18} />
      </>}
      {bottom === "sarong" && <>
        <path d="M-56,-60 L-50,-20 L-18,-20 L-20,-60 Z M22,-60 L20,-20 L56,-20 L60,-60 Z" fill={L.skinShade} />
        <path d="M-90,-480 L92,-480 L80,-52 L-76,-52 Z" fill={L.pants} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-88 + i * 2},${-400 + i * 62} L${90 - i * 2},${-400 + i * 62}`} stroke={L.pattern ?? L.topShade} strokeWidth={i % 2 ? 6 : 14} opacity={0.7} />)}
        <path d="M44,-476 L92,-480 L80,-52 L58,-52 Z" fill="#000" opacity={0.18} />
      </>}
      {bottom === "robe" && <>
        <path d={`M${-shX - 6},${shY + 10} Q0,${shY - 30} ${shX + 10},${shY + 10} L128,-36 Q0,-14 -120,-36 Z`} fill={L.top} />
        <path d={`M-90,${shY + 20} Q10,-560 118,-300`} stroke={L.topShade} strokeWidth={10} fill="none" opacity={0.7} />
        <path d={`M-100,-300 Q0,-260 120,-200 M-110,-160 Q10,-130 124,-90`} stroke={L.topShade} strokeWidth={6} fill="none" opacity={0.5} />
        <path d="M60,-500 L128,-36 L90,-30 Z" fill="#000" opacity={0.15} />
      </>}
      <Shoe x={-40} kind={shoe} color={L.shoes} skin={L.skinShade} />
      <Shoe x={46} kind={shoe} color={L.shoes} skin={L.skin} front />
      {bandage && <g><rect x={20} y={-46} width={64} height={30} rx={10} fill="#f4f1ea" /><path d="M24,-38 L80,-26 M24,-26 L80,-38" stroke="#d6cfc2" strokeWidth={4} /></g>}
      </g>}
      <g transform={`translate(0,${D})`}>
      {/* long hair falls behind the shoulders: own layer under the torso, same tilt as the head */}
      {hs === "long" && (
        <g transform={headT} filter={pc}>
          <g transform={`translate(8,${shY - 160})`}>
            {style === "paper" && <path d="M-70,60 Q-96,160 -90,262 M-30,120 Q-40,200 -30,280" stroke="#3a302c" strokeWidth={4} fill="none" />}
            <path d="M-104,-50 Q-134,110 -120,280 Q-40,306 34,276 Q76,200 84,120 Q106,40 104,-40 Z" fill={L.hair} />
            <path d="M-104,-50 Q-134,110 -120,280" stroke={rim} strokeWidth={6} fill="none" opacity={0.5} />
            {soft && <g fill="none" strokeLinecap="round"><path d="M-96,40 Q-112,160 -100,270 M-60,120 Q-70,200 -56,284 M10,150 Q14,220 4,276" stroke="#000" strokeWidth={4} opacity={0.35} /><path d="M-84,0 Q-100,120 -90,220" stroke="#fff" strokeWidth={10} opacity={0.07} /></g>}
          </g>
        </g>
      )}
      {/* back arm (behind the body) */}
      <g filter={pc}><Arm sx={fem ? -60 : -70} sy={shY + 20} arm={{ ...back, sh: -back.sh }} top={L.top} topShade={L.topShade} skin={L.skin} shade={L.skinShade} far thin={fem} /></g>
      {/* torso */}
      {(bottom !== "robe" || pose === "sit") && (
        <g transform={`translate(0,${shY}) scale(1,${1 + breathe}) translate(0,${-shY})`} filter={pc}>
          <path d={torso} fill={`url(#${id}-top)`} />
          {style === "paper" && L.print && <g clipPath={`url(#${id}-tc)`}>
            <clipPath id={`${id}-tc`}><path d={torso} /></clipPath>
            {L.print === "dots" && Array.from({ length: 48 }, (_, i) => <circle key={i} cx={-110 + (i % 6) * 44 + (Math.floor(i / 6) % 2) * 22} cy={shY - 10 + Math.floor(i / 6) * 42} r={7} fill={L.topShade} opacity={0.75} />)}
            {L.print === "check" && <g stroke={L.topShade} strokeWidth={16} opacity={0.45}>{[-90, -40, 10, 60, 110].map((x) => <path key={x} d={`M${x},${shY - 40} L${x},-440`} />)}{[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={k} d={`M-120,${shY + 20 + k * 50} L130,${shY + 20 + k * 50}`} />)}</g>}
            {L.print === "stripe" && <g stroke={L.topShade} strokeWidth={16} opacity={0.55}>{[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={k} d={`M-120,${shY + 20 + k * 46} L130,${shY + 20 + k * 46}`} />)}</g>}
          </g>}
          {!fem && <path d={`M22,${shY - 10} L28,-458`} stroke={L.topShade} strokeWidth={5} />}
          <path d={`M-86,-500 L88,-500 L88,-456 L-86,-456 Z`} fill={L.topShade} opacity={0.6} />
          <path d={`M${-shX},${shY + 6} Q${-shX - 8},${shY + 120} ${fem ? -72 : -96},-560`} stroke={rim} strokeWidth={6} fill="none" opacity={0.55} />
          <path d={`M-30,${shY - 14} Q22,${shY + 34} 70,${shY - 10}`} stroke={L.topShade} strokeWidth={14} fill="none" strokeLinecap="round" />
          {soft && <g fill="none" strokeLinecap="round">
            <path d={`M-28,${shY - 6} Q22,${shY + 30} 66,${shY - 4}`} stroke="#fff" strokeWidth={3} opacity={0.12} />
            <path d="M-40,-560 Q-10,-540 20,-556 M10,-520 Q40,-500 70,-516" stroke={L.topShade} strokeWidth={5} opacity={0.6} />
            <path d={`M${shX - 30},${shY + 30} Q${shX - 10},${shY + 160} ${shX - 20},-560`} stroke="#000" strokeWidth={20} opacity={0.08} />
          </g>}
        </g>
      )}
      {bottom === "robe" && <path d={`M${-shX},${shY + 8} Q${-shX - 10},${shY + 160} -110,-300`} stroke={rim} strokeWidth={6} fill="none" opacity={0.5} />}
      {/* neck + head (tilts around the neck) */}
      <g transform={headT} filter={pc}>
        <rect x={-16} y={shY - 60} width={fem ? 44 : 50} height={64} rx={14} fill={L.skinShade} />
        {soft && <rect x={-16} y={shY - 60} width={fem ? 44 : 50} height={64} rx={14} fill={`url(#${id}-neck)`} />}
        <g transform={`translate(8,${shY - 160})`}>
          {/* hair behind the head */}
          {hs === "bun" && <><circle cx={-64} cy={-112} r={40} fill={L.hair} /><path d="M-92,-130 Q-70,-152 -40,-140" stroke="#fff" strokeWidth={5} fill="none" opacity={0.25} /></>}
          <ellipse cx={-80} cy={10} rx={20} ry={27} fill={L.skinShade} />
          <path d="M-96,-30 Q-100,70 -40,104 Q10,128 58,100 Q100,70 100,-10 Q98,-110 0,-118 Q-92,-114 -96,-30 Z" fill={`url(#${id}-face)`} />
          {soft && <>
            <path d="M-96,-30 Q-100,70 -40,104 Q-10,118 10,118 Q-40,90 -56,30 Q-66,-40 -40,-110 Q-92,-100 -96,-30 Z" fill={L.skinShade} opacity={0.45} />
            <path d="M-86,0 Q-78,-6 -74,10 Q-78,24 -86,22" stroke={L.skin} strokeWidth={4} fill="none" opacity={0.7} />
            <ellipse cx={-32} cy={44} rx={26} ry={16} fill={`url(#${id}-blush)`} opacity={fem ? 1 : 0.5} />
            <ellipse cx={74} cy={42} rx={20} ry={14} fill={`url(#${id}-blush)`} opacity={fem ? 1 : 0.5} />
          </>}
          {/* hair on top */}
          {hs === "short" && <path d="M-98,-20 Q-104,-128 6,-130 Q104,-126 104,-30 Q90,-70 60,-82 Q40,-56 -6,-70 Q-40,-50 -66,-60 Q-80,-30 -78,0 Z" fill={L.hair} />}
          {hs === "crop" && <path d="M-100,-10 Q-110,-136 10,-134 Q110,-128 106,-40 Q96,-60 80,-66 Q70,-40 40,-58 Q20,-30 -10,-56 Q-40,-36 -62,-52 Q-76,-20 -76,10 Z" fill={L.hair} />}
          {hs === "long" && <path d="M-100,-10 Q-110,-132 8,-134 Q108,-128 106,-30 L104,40 Q96,-40 74,-74 Q30,-52 -10,-80 Q-58,-56 -80,30 Q-86,80 -92,120 Z" fill={L.hair} />}
          {hs === "bun" && <path d="M-98,-20 Q-104,-124 6,-126 Q104,-122 104,-36 Q80,-84 30,-88 Q-30,-90 -70,-50 Q-82,-24 -80,0 Z" fill={L.hair} />}
          {hs === "bald" && <path d="M-96,-30 Q-98,-112 0,-118 Q98,-112 100,-30 Q60,-90 0,-92 Q-60,-90 -96,-30 Z" fill={L.hair} opacity={0.35} />}
          {hs !== "bald" && <path d="M-60,-108 Q0,-138 70,-100" stroke="#ffffff" strokeWidth={7} fill="none" opacity={hs === "bun" ? 0.15 : 0.1} strokeLinecap="round" />}
          {soft && hs !== "bald" && <g fill="none" strokeLinecap="round">
            <path d="M-74,-96 Q-10,-124 60,-110" stroke="#ffffff" strokeWidth={16} opacity={0.09} />
            <path d="M-50,-118 Q-70,-80 -76,-30 M-10,-126 Q-30,-96 -40,-70 M40,-122 Q60,-100 66,-80" stroke="#000" strokeWidth={4} opacity={0.35} />
            <path d="M-30,-122 Q-46,-96 -56,-64 M20,-126 Q34,-104 40,-84" stroke="#ffffff" strokeWidth={3} opacity={0.14} />
          </g>}
          <path d="M-98,-20 Q-104,-110 -10,-128" stroke={rim} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          {/* brows: + brow = worried (inner ends up) */}
          {soft ? <g fill={L.hair === "#d9b46a" ? "#a8823e" : age > 0.5 ? "#6d655d" : "#1b1614"}>
            <path d={`M-34,${-34 + brow * 2} Q-16,${-46 - brow * 4} 6,${-44 - brow * 9} L6,${-34 - brow * 9} Q-14,${-40 - brow * 3} -34,${-32 + brow * 2} Z`} />
            <path d={`M32,${-44 - brow * 9} Q52,${-50 - brow * 4} 72,${-36 + brow * 2} Q54,${-42 - brow * 3} 32,${-34 - brow * 9} Z`} />
          </g> : <>
          <path d={`M-30,${-36 + brow * 2} Q-14,${-44 - brow * 4} 4,${-40 - brow * 9}`} stroke={L.hair === "#d9b46a" ? "#a8823e" : age > 0.5 ? "#6d655d" : "#1b1614"} strokeWidth={fem ? 6 : 8} fill="none" strokeLinecap="round" />
          <path d={`M34,${-40 - brow * 9} Q52,${-46 - brow * 4} 70,${-36 + brow * 2}`} stroke={L.hair === "#d9b46a" ? "#a8823e" : age > 0.5 ? "#6d655d" : "#1b1614"} strokeWidth={fem ? 6 : 8} fill="none" strokeLinecap="round" />
          </>}
          {bruise > 0 && <g opacity={bruise}>
            <ellipse cx={54} cy={6} rx={30} ry={24} fill="#5b3b6e" opacity={0.55} />
            <ellipse cx={-46} cy={-66} rx={26} ry={18} fill={L.skinShade} />
            <ellipse cx={-46} cy={-66} rx={20} ry={13} fill="#6b4a7a" opacity={0.6} />
          </g>}
          {eye(-14, 15)}
          {eye(52, 17)}
          {style === "paper" && <g fill="#e8806e" opacity={0.45}><ellipse cx={-30} cy={40} rx={16} ry={9} /><ellipse cx={76} cy={40} rx={14} ry={9} /></g>}
          {age > 0 && <g stroke={L.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" opacity={age}>
            <path d="M-20,-62 Q14,-70 60,-62 M-10,-52 Q16,-58 50,-52" />
            <path d="M-26,22 Q-14,28 0,22 M40,24 Q54,30 70,22" />
            <path d="M10,54 Q4,70 12,84 M60,52 Q68,70 58,84" />
          </g>}
          <path d="M28,10 Q42,36 30,46" stroke={L.skinShade} strokeWidth={6} fill="none" strokeLinecap="round" />
          {soft && <><ellipse cx={34} cy={48} rx={10} ry={4} fill={L.skinShade} opacity={0.5} /><path d="M22,6 Q30,24 26,38" stroke="#fff" strokeWidth={3} opacity={0.18} fill="none" /></>}
          {mouth > 0.05 ? (
            <g transform="translate(30,72)">
              <ellipse rx={15 + mouth * 3} ry={3 + mouth * 13} fill="#5a2620" />
              <ellipse cy={mouth * 7} rx={9} ry={mouth * 5} fill="#c45a50" />
            </g>
          ) : soft && L.lips ? (
            <g>
              <path d="M13,72 Q21,64 29,69 Q37,64 47,71 Q30,75 13,72 Z" fill={L.lips} />
              <path d="M15,73 Q30,86 45,72 Q30,77 15,73 Z" fill={L.lips} opacity={0.85} />
              <path d="M24,78 Q30,80 36,78" stroke="#fff" strokeWidth={2.5} opacity={0.35} fill="none" strokeLinecap="round" />
              <path d="M13,72 Q30,76 47,71" stroke="#4a1e1a" strokeWidth={2.5} fill="none" opacity={0.7} />
            </g>
          ) : (
            <g>
              <path d="M16,72 Q30,78 44,70" stroke={L.lips ?? "#6b3328"} strokeWidth={L.lips ? 8 : 5} fill="none" strokeLinecap="round" />
              {soft && <path d="M22,84 Q30,88 38,84" stroke={L.skinShade} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />}
            </g>
          )}
          {tears > 0 && <g opacity={tears} fill="#bfe3ff">
            <path d="M58,18 Q52,40 58,56 Q64,40 58,18 Z" />
            <path d="M-12,18 Q-18,36 -12,50 Q-6,36 -12,18 Z" opacity={0.7} />
          </g>}
          {/* strands hanging over the face (head bowed, ghost) */}
          {veil > 0 && <g fill={L.hair} opacity={veil}>
            <path d="M-96,-96 Q-64,40 -70,196 Q-30,210 6,198 Q8,40 -16,-112 Z" />
            <path d="M-4,-114 Q42,30 30,206 Q66,200 96,176 Q100,20 74,-100 Z" />
            <path d="M6,40 Q18,120 14,210" stroke={L.hair} strokeWidth={6} fill="none" />
          </g>}
        </g>
      </g>
      {/* front arm */}
      <g filter={pc}><Arm sx={fem ? 72 : 82} sy={shY + 20} arm={front} top={L.top} topShade={L.topShade} skin={L.skin} shade={L.skinShade} thin={fem} pins={style === "paper"} /></g>
      </g>
      </g>
    </g>
  );
};
