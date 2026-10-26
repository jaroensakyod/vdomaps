import { G, rnd } from "./Butai";

// Painted pieces for story cards, drawn inside a card's 840×630 space. Flat opaque shapes; the card's gouache
// filter adds the brushed edges and texture, so draw clean shapes and let it paint them.

// Two-tone fill: a base shape plus a lighter stroke band, the way gouache is laid down in strokes.
export const Strokes = ({ x, y, w, h, color, n = 6, light = "#ffffff" }: { x: number; y: number; w: number; h: number; color: string; n?: number; light?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={color} />
    {Array.from({ length: n }, (_, i) => <rect key={i} x={x + rnd(i + x) * w * 0.2} y={y + (i / n) * h + 4} width={w * (0.6 + rnd(i + y) * 0.35)} height={h / n * 0.4} rx={6} fill={light} opacity={0.08} />)}
  </g>
);

// A person: robe or shirt, pants, head, hair or hat; arms as thick strokes. `pose`: stand | pull | kneel | sit | point.
export const Person = ({ x, y, s = 1, shirt, pants = G.ink, hat, pose = "stand", face = 1, armA = 0 }: { x: number; y: number; s?: number; shirt: string; pants?: string; hat?: "ngob" | "tall" | "none"; pose?: "stand" | "pull" | "kneel" | "sit" | "point"; face?: 1 | -1; armA?: number }) => {
  const kneel = pose === "kneel" || pose === "sit";
  const lean = pose === "pull" ? -18 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.14} />
      {kneel ? (
        <path d="M-50 0 Q-56 -50 -20 -60 L36 -60 Q60 -40 58 0 Z" fill={pants} />
      ) : (
        <g fill={pants}>
          <path d={`M-28 -110 L${-44 + lean} 0 L${-18 + lean} 0 L0 -70 L14 0 L40 0 L28 -110 Z`} />
        </g>
      )}
      <g transform={`rotate(${lean * 0.6} 0 ${kneel ? -60 : -110})`}>
        <path d={kneel ? "M-38 -60 Q-44 -150 -6 -168 L14 -168 Q46 -150 40 -60 Z" : "M-34 -106 Q-40 -200 -6 -214 L14 -214 Q44 -200 36 -106 Z"} fill={shirt} />
        {/* arms */}
        <path d={kneel ? `M0 -150 Q${46 + armA} -120 ${66 + armA} ${-96 - armA}` : pose === "pull" ? "M0 -196 Q60 -180 120 -170" : pose === "point" ? "M0 -196 Q60 -220 112 -250" : "M0 -196 Q30 -150 26 -110"} fill="none" stroke={shirt} strokeWidth={22} strokeLinecap="round" />
        {pose === "pull" && <circle cx={124} cy={-170} r={13} fill={G.skin} />}
        {pose === "point" && <circle cx={116} cy={-252} r={12} fill={G.skin} />}
        <g transform={`translate(0,${kneel ? -196 : -242})`}>
          <rect x={-8} y={10} width={18} height={20} fill={G.skin} />
          <ellipse cx={2} cy={-6} rx={30} ry={33} fill={G.skin} />
          <circle cx={16} cy={-10} r={3.6} fill={G.ink} />
          <path d="M8 10 Q16 14 22 8" fill="none" stroke={G.ink} strokeWidth={3} strokeLinecap="round" />
          {hat === "ngob" && <path d="M-62 -14 L2 -66 L66 -14 Q2 -26 -62 -14 Z" fill="#f0dc9c" />}
          {hat === "ngob" && <path d="M-62 -14 Q2 -26 66 -14 L60 -8 Q2 -18 -56 -8 Z" fill="#8a5a2a" />}
          {hat === "tall" && <path d="M-26 -22 L-14 -112 Q2 -128 18 -112 L30 -22 Q2 -32 -26 -22 Z" fill={G.cream} />}
          {hat === "tall" && <rect x={-26} y={-40} width={56} height={10} fill={G.ochre} />}
          {(!hat || hat === "none") && <path d="M-30 -10 Q-30 -44 2 -42 Q30 -42 32 -16 Q10 -30 -30 -10 Z" fill={G.ink} />}
        </g>
      </g>
    </g>
  );
};

// A calf or a cow (bigger), standing or running (legs splayed).
export const Cow = ({ x, y, s = 1, color = "#b27a46", run = 0, face = 1 }: { x: number; y: number; s?: number; color?: string; run?: number; face?: 1 | -1 }) => (
  <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
    <ellipse cx={0} cy={4} rx={86} ry={12} fill="#000" opacity={0.14} />
    {[-50, -30, 34, 54].map((lx, i) => <path key={i} d={`M${lx} -40 L${lx + (i < 2 ? -run : run) * 22} 0`} stroke={color} strokeWidth={16} strokeLinecap="round" />)}
    <ellipse cx={0} cy={-62} rx={76} ry={38} fill={color} />
    <ellipse cx={-14} cy={-50} rx={30} ry={16} fill={G.cream} opacity={0.75} />
    <path d="M60 -80 Q90 -120 112 -98 Q126 -72 104 -58 Q80 -54 62 -64 Z" fill={color} />
    <ellipse cx={112} cy={-70} rx={14} ry={12} fill="#e6b38e" />
    <path d="M86 -112 L80 -128 M100 -110 L106 -126" stroke={G.cream} strokeWidth={6} strokeLinecap="round" />
    <circle cx={96} cy={-96} r={4} fill={G.ink} />
    <path d="M-74 -70 Q-96 -60 -92 -30" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
  </g>
);

// Backdrops.
export const FieldBack = () => (
  <g>
    <rect x={0} y={0} width={840} height={330} fill={G.ochre} />
    <rect x={0} y={0} width={840} height={140} fill="#efc062" />
    <circle cx={640} cy={150} r={70} fill="#f6e2a0" />
    <path d="M0 330 Q140 250 300 300 Q480 240 640 290 Q760 260 840 300 L840 340 L0 340 Z" fill="#5f8f4e" />
    <rect x={0} y={330} width={840} height={300} fill={G.viridian} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M0 ${370 + i * 44} Q420 ${352 + i * 44} 840 ${370 + i * 44}`} fill="none" stroke="#5aa07c" strokeWidth={8} />)}
    {/* a sala far away */}
    <path d="M470 290 L470 250 L530 250 L530 290 Z" fill="#8a4a2c" />
    <path d="M454 254 L500 218 L546 254 Z" fill={G.vermilion} />
  </g>
);

export const CourtBack = () => (
  <g>
    <rect x={0} y={0} width={840} height={630} fill="#3f8a72" />
    <rect x={0} y={0} width={840} height={630} fill="#2e6f5c" opacity={0.5} transform="translate(0,300) scale(1,0.4)" />
    {/* hall: red pillars, a stepped roof with gable finials */}
    <path d="M40 140 L420 20 L800 140 Z" fill={G.vermilion} />
    <path d="M120 120 L420 40 L720 120 Z" fill="#b23d22" />
    <path d="M30 144 L810 144 L790 162 L50 162 Z" fill={G.ink} />
    <path d="M412 22 Q420 -4 428 22 Z M34 140 Q18 108 46 114 Z M806 140 Q822 108 794 114 Z" fill={G.ochre} />
    {[90, 240, 600, 750].map((px) => <rect key={px} x={px} y={162} width={30} height={374} fill="#a8361c" />)}
    <rect x={0} y={530} width={840} height={100} fill="#c99b5c" />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 96} y={540} width={86} height={34} fill="#d8ae70" />)}
    {/* the dais */}
    <rect x={300} y={404} width={240} height={50} fill={G.ochre} />
    <rect x={280} y={450} width={280} height={28} fill="#b9802c" />
  </g>
);

export const YardBack = () => (
  <g>
    <rect x={0} y={0} width={840} height={630} fill="#f0c56a" />
    <rect x={0} y={0} width={840} height={200} fill="#f4d68a" />
    <path d="M0 260 Q200 200 420 240 Q640 200 840 250 L840 630 L0 630 Z" fill="#d79c4a" />
    <path d="M0 420 Q420 380 840 420 L840 630 L0 630 Z" fill="#c4823c" />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${60 + i * 170} 250 l20 -110 l20 110 Z`} fill={G.viridian} />)}
    {/* speed lines of the run, painted */}
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={140 + i * 26} y={470 + i * 16} width={160 - i * 14} height={8} rx={4} fill={G.cream} opacity={0.7} />)}
  </g>
);
