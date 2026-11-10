// The French envoy (our own cartoon of La Loubère) and small drawn props / effect marks for the old-Siam short.
// Props are drawn around (0, 0) in their own little coordinate space and placed with a <g transform>.
import React from "react";
import { INK, Mouth, arm } from "./cast";

/** ลาลูแบร์: long curled wig, red coat, white cravat. viewBox 400 x 720, feet at (200, 712) */
export const Envoy: React.FC<{ x: number; y: number; h: number; flip?: boolean; armR?: number; elbowR?: number; mouth?: Mouth; blink?: number; pinch?: boolean; brows?: number; look?: number; hold?: React.ReactNode }> = ({
  x, y, h, flip = false, armR = 20, elbowR = 40, mouth = "flat", blink = 0, pinch = false, brows = 0, look = 0, hold,
}) => {
  const w = (h * 400) / 720, SK = "#f3d2bd", COAT = "#a8333a", WIG = "#7a5232";
  const R = arm(250, 330, 1, armR, elbowR), L = pinch ? { ex: 168, ey: 300, hx: 200, hy: 248 } : arm(150, 330, -1, 10, 10);
  const lid = Math.min(1, Math.max(0, blink));
  const eye = (ex: number) => lid > 0.6
    ? <path d={`M${ex - 10},212 Q${ex},218 ${ex + 10},212`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    : <ellipse cx={ex + look * 4} cy={212} rx={7} ry={10 * (1 - lid * 0.7)} fill={INK} />;
  const path = mouth === "smile" ? "M184,262 Q200,274 216,262" : mouth === "flat" ? "M188,264 L212,264" : "";
  return (
    <svg x={x - w / 2} y={y - h} width={w} height={h} viewBox="0 0 400 720" overflow="visible">
      <g transform={flip ? "translate(400 0) scale(-1 1)" : ""}>
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M${200 + s * 28},560 L${200 + s * 28},690`} stroke="#f4f1ea" strokeWidth={24} strokeLinecap="round" />
            <ellipse cx={200 + s * 34} cy={700} rx={26} ry={12} fill="#1d1a1a" stroke={INK} strokeWidth={5} />
          </g>
        ))}
        <path d="M140,310 Q126,450 132,580 L268,580 Q274,450 260,310 Q200,292 140,310 Z" fill={COAT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[350, 390, 430, 470, 510].map((yy) => <circle key={yy} cx={206} cy={yy} r={6} fill="#e8c45a" stroke={INK} strokeWidth={3} />)}
        <path d="M200,330 L200,580" stroke={INK} strokeWidth={4} />
        <path d="M112,200 Q100,120 200,104 Q300,120 288,200 Q306,280 286,340 Q262,352 246,330 L154,330 Q138,352 114,340 Q94,280 112,200 Z" fill={WIG} stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((k) => [-1, 1].map((s) => <circle key={`${k}${s}`} cx={200 + s * (78 + (k % 2) * 8)} cy={250 + k * 34} r={20} fill={WIG} stroke={INK} strokeWidth={4} />))}
        <ellipse cx={200} cy={212} rx={72} ry={82} fill={SK} stroke={INK} strokeWidth={6} />
        <path d="M134,170 Q160,120 200,118 Q240,120 266,170 Q232,150 200,152 Q168,150 134,170 Z" fill={WIG} stroke={INK} strokeWidth={5} />
        <path d="M178,298 L222,298 L214,338 L200,330 L186,338 Z" fill="#f7f4ec" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M164,${186 - brows * 4} L186,${186 + brows * 2} M214,${186 + brows * 2} L236,${186 - brows * 4}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        {eye(174)}{eye(226)}
        <path d="M196,226 Q204,242 196,246" stroke={INK} strokeWidth={4} fill="none" />
        {path ? <path d={path} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /> : <ellipse cx={200} cy={265} rx={10} ry={13} fill="#7a2e2a" stroke={INK} strokeWidth={5} />}
        {[L, R].map((A, i) => (
          <g key={i}>
            <path d={`M${i ? 250 : 150},330 L${A.ex},${A.ey} L${A.hx},${A.hy}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${i ? 250 : 150},330 L${A.ex},${A.ey} L${A.hx},${A.hy}`} stroke={COAT} strokeWidth={23} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={A.hx} cy={A.hy} r={13} fill={SK} stroke={INK} strokeWidth={5} />
          </g>
        ))}
        {hold ? <g transform={`translate(${R.hx} ${R.hy})`}>{hold}</g> : null}
      </g>
    </svg>
  );
};

export const Stick: React.FC<{ rot?: number }> = ({ rot = -30 }) => (
  <g transform={`rotate(${rot})`}>
    <path d="M0,0 L0,-150" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M0,0 L0,-150" stroke="#9a6a3c" strokeWidth={13} strokeLinecap="round" />
    <circle cx={0} cy={-150} r={16} fill="#c9573f" stroke={INK} strokeWidth={5} />
  </g>
);
export const Quill: React.FC = () => (
  <g transform="rotate(-25)"><path d="M0,0 Q10,-60 40,-120 Q14,-70 0,0 Z" fill="#f4f1ea" stroke={INK} strokeWidth={4} /></g>
);
export const Pot: React.FC<{ coins?: number }> = ({ coins = 0 }) => (
  <g>
    <path d="M-50,-60 Q-64,10 -30,30 L30,30 Q64,10 50,-60 Z" fill="#a8623a" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-60} rx={52} ry={14} fill="#5a3322" stroke={INK} strokeWidth={6} />
    {Array.from({ length: coins }, (_, k) => <ellipse key={k} cx={-24 + k * 18} cy={-64 - (k % 2) * 6} rx={12} ry={8} fill="#f3e3b6" stroke={INK} strokeWidth={3} />)}
  </g>
);
/** sound rings spreading from a strike, u = 0..1 */
export const Rings: React.FC<{ u: number; r?: number; col?: string }> = ({ u, r = 160, col = "#fff4d6" }) => (
  <g opacity={Math.max(0, 1 - u)}>
    {[0, 0.25, 0.5].map((d) => { const k = Math.max(0, u - d); return k > 0 ? <circle key={d} r={r * k * 1.6} fill="none" stroke={col} strokeWidth={10 * (1 - k)} /> : null; })}
  </g>
);
export const Burst: React.FC<{ u: number; r?: number; col?: string }> = ({ u, r = 90, col = "#fff1b0" }) => (
  <g opacity={Math.max(0, 1 - u)}>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2, r0 = r * 0.35 + r * 0.4 * u, r1 = r * 0.6 + r * 0.9 * u;
      return <path key={i} d={`M${Math.cos(a) * r0},${Math.sin(a) * r0} L${Math.cos(a) * r1},${Math.sin(a) * r1}`} stroke={col} strokeWidth={12} strokeLinecap="round" />;
    })}
  </g>
);
const Crossed: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>{children}<circle r={92} fill="none" stroke="#d63a2f" strokeWidth={16} /><path d="M-64,-64 L64,64" stroke="#d63a2f" strokeWidth={16} strokeLinecap="round" /></g>
);
export const NoClock: React.FC = () => (
  <Crossed>
    <circle r={70} fill="#f6efe0" stroke={INK} strokeWidth={8} />
    <path d="M0,0 L0,-44 M0,0 L30,16" stroke={INK} strokeWidth={9} strokeLinecap="round" />
    {[0, 90, 180, 270].map((a) => <circle key={a} cx={Math.sin((a * Math.PI) / 180) * 54} cy={-Math.cos((a * Math.PI) / 180) * 54} r={6} fill={INK} />)}
  </Crossed>
);
export const NoFridge: React.FC = () => (
  <Crossed>
    <rect x={-42} y={-70} width={84} height={140} rx={12} fill="#eef2f4" stroke={INK} strokeWidth={8} />
    <path d="M-42,-18 L42,-18" stroke={INK} strokeWidth={6} />
    <path d="M28,-54 L28,-32 M28,-4 L28,30" stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </Crossed>
);
export const Sun: React.FC<{ low?: boolean }> = ({ low }) => (
  <g>
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M${Math.cos(a) * 62},${Math.sin(a) * 62} L${Math.cos(a) * 86},${Math.sin(a) * 86}`} stroke={low ? "#f08a3c" : "#f4c430"} strokeWidth={10} strokeLinecap="round" />; })}
    <circle r={50} fill={low ? "#f6a04a" : "#ffd84a"} stroke={INK} strokeWidth={7} />
  </g>
);
export const Moon: React.FC = () => <path d="M20,-60 A62,62 0 1 0 20,60 A48,48 0 1 1 20,-60 Z" fill="#f4ecc8" stroke={INK} strokeWidth={7} />;
export const Question: React.FC = () => (
  <g>
    <path d="M-30,-40 Q-30,-80 6,-80 Q44,-80 40,-46 Q36,-20 6,-12 L6,14" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M-30,-40 Q-30,-80 6,-80 Q44,-80 40,-46 Q36,-20 6,-12 L6,14" stroke="#ffe08a" strokeWidth={18} fill="none" strokeLinecap="round" />
    <circle cx={6} cy={48} r={14} fill="#ffe08a" stroke={INK} strokeWidth={6} />
  </g>
);
export const Stink: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[-40, 0, 40].map((dx, i) => (
      <path key={i} d={`M${dx},0 Q${dx + 18},-30 ${dx},-60 Q${dx - 18},-90 ${dx},-120`} stroke="#8fbf5a" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85}
        transform={`translate(${Math.sin(t * 6 + i) * 6} ${-((t * 40 + i * 20) % 30)})`} />
    ))}
  </g>
);
export const Mustard: React.FC = () => (
  <g>
    <path d="M-38,-30 L-34,50 Q0,62 34,50 L38,-30 Z" fill="#f2e6c8" stroke={INK} strokeWidth={6} />
    <rect x={-42} y={-50} width={84} height={22} rx={6} fill="#c9a04a" stroke={INK} strokeWidth={6} />
    <rect x={-28} y={-2} width={56} height={30} rx={4} fill="#e8c23a" stroke={INK} strokeWidth={4} />
  </g>
);
export const Flag: React.FC = () => (
  <g><path d="M0,0 L0,-90" stroke={INK} strokeWidth={6} /><path d="M0,-90 L44,-78 L0,-62 Z" fill="#c8453a" stroke={INK} strokeWidth={4} /></g>
);
