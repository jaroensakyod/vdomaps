import { random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";

// Han-era illustration pieces for <InsetPanel> scenes, drawn in SVG like components/Figures.tsx:
// (x, y) = ground point, side view facing right (flip = facing left), ~100 units tall at scale 1,
// sepia ink outline on muted parchment colours so they sit with the map and the painted portraits.

const INK = "#2a1b0e";
const SKIN = "#e2b48a";

export type Head = "topknot" | "turban" | "official" | "eunuch" | "helmet" | "child" | "prince" | "lady" | "plume";
export type HanPose = "stand" | "walk" | "raise" | "hunch" | "flee" | "whip" | "tied" | "laugh" | "bow" | "sit" | "crouch";
export type Hold = "none" | "torch" | "spear" | "hoe" | "bowl" | "bundle" | "scroll" | "whip" | "flag" | "point" | "sword" | "halberd" | "cup";
export type Beard = "none" | "short" | "long" | "white" | "bushy";

export const HanFigure = ({
  x,
  y,
  scale = 1,
  robe = "#8a7a5c",
  shade,
  head = "topknot",
  pose = "stand",
  hold = "none",
  flip = false,
  ragged = false,
  phase = 0,
  skin = SKIN,
  beard = "none",
  stout = false,
  sword = false,
  flag,
}: {
  x: number;
  y: number;
  scale?: number;
  robe?: string;
  shade?: string;
  head?: Head;
  pose?: HanPose;
  hold?: Hold;
  flip?: boolean;
  ragged?: boolean;
  phase?: number;
  skin?: string;
  beard?: Beard;
  stout?: boolean;
  sword?: boolean;
  flag?: { text: string; color: string };
}) => {
  const frame = useCurrentFrame();
  const t = frame * (pose === "flee" ? 0.42 : 0.3) + phase;
  const moving = pose === "walk" || pose === "flee" || pose === "raise" || pose === "crouch";
  const swing = moving ? Math.sin(t) * (pose === "flee" ? 24 : pose === "crouch" ? 10 : 15) : 0;
  const bob = moving ? -Math.abs(Math.sin(t)) * 3 : pose === "laugh" ? -Math.abs(Math.sin(frame * 0.9)) * 2 : Math.sin(frame * 0.06 + phase) * 0.6;
  const wiggle = pose === "tied" ? Math.sin(frame * 0.7 + phase) * 3 : 0;
  const lean = { hunch: 16, flee: 10, walk: 3, bow: 42, laugh: -10, crouch: 24, sit: 0, whip: 6 }[pose as string] ?? 0;
  const drop = pose === "sit" ? 30 : pose === "crouch" ? 10 : 0; // upper body lowered (kneeling / sneaking)
  const dark = shade ?? robe;
  const pump = Math.sin(frame * 0.2 + phase * 1.7) * 8;
  const lash = Math.sin(frame * 0.5 + phase);
  const front =
    pose === "raise" ? -155 + pump
    : pose === "whip" ? -100 + lash * 60
    : pose === "hunch" ? -70
    : pose === "bow" ? -85
    : pose === "laugh" ? -35 + Math.sin(frame * 0.9) * 6
    : pose === "tied" ? 28
    : pose === "flee" ? -swing * 1.6
    : hold === "point" ? -95
    : hold === "flag" ? -25
    : hold === "scroll" ? -55
    : pose === "sit" ? -40
    : moving ? -swing : 8;
  const back = pose === "hunch" ? -55 : pose === "bow" ? -80 : pose === "tied" ? 30 : pose === "laugh" ? -20 : pose === "flee" ? swing * 1.6 : pose === "sit" ? -30 : moving ? swing : -6;
  const hem = ragged ? "L14 -22 L10 -18 L6 -23 L2 -18 L-2 -23 L-6 -18 L-10 -23 L-14 -19 L-17 -22" : "Q0 -18 -17 -22";

  const leg = (a: number, op: number) => (
    <g transform={`rotate(${a},0,-40)`} opacity={op}>
      <path d="M-3.5 -30 L3.5 -30 L3 -3 L-3 -3 Z" fill="#5b4a36" stroke={INK} strokeWidth={1.4} />
      <path d="M-4 -4 L8 -4 Q9 0 6 1 L-4 1 Z" fill="#3b2c1e" stroke={INK} strokeWidth={1.2} />
    </g>
  );
  const held = (a: number) => {
    // drawn at the hand, counter-rotated so it stays upright in the world
    const inner =
      hold === "torch" ? (
        <g>
          <line x1={0} y1={14} x2={0} y2={-26} stroke="#6b4a2b" strokeWidth={3.5} strokeLinecap="round" />
          <path d="M-4 -24 L4 -24 L3 -30 L-3 -30 Z" fill="#4a3320" />
          <Fire x={0} y={-28} size={22} seed={phase * 7} />
        </g>
      ) : hold === "spear" ? (
        <g>
          <line x1={0} y1={34} x2={0} y2={-70} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
          <path d="M-4 -68 L0 -86 L4 -68 Z" fill="#a9a59a" stroke={INK} strokeWidth={1.2} />
          <path d="M-5 -66 Q0 -60 5 -66" stroke="#c9302c" strokeWidth={3} fill="none" />
        </g>
      ) : hold === "hoe" ? (
        <g>
          <line x1={0} y1={22} x2={0} y2={-42} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
          <path d="M-1 -42 L16 -40 L16 -34 L-1 -37 Z" fill="#8f8a7e" stroke={INK} strokeWidth={1.2} />
        </g>
      ) : hold === "bowl" ? (
        <path d="M-9 -2 Q0 9 9 -2 Z" fill="#9b7a52" stroke={INK} strokeWidth={1.3} />
      ) : hold === "scroll" ? (
        <g>
          <rect x={-3} y={-14} width={6} height={24} rx={2} fill="#efe2bd" stroke={INK} strokeWidth={1.2} />
          <rect x={-5} y={-16} width={10} height={4} rx={1.5} fill="#8a3324" />
          <rect x={-5} y={9} width={10} height={4} rx={1.5} fill="#8a3324" />
        </g>
      ) : hold === "sword" ? (
        <g>
          <rect x={-1.6} y={-44} width={3.2} height={40} fill="#d7dbe0" stroke={INK} strokeWidth={0.9} />
          <path d="M-1.6 -44 L0 -50 L1.6 -44 Z" fill="#d7dbe0" stroke={INK} strokeWidth={0.9} />
          {[-36, -28, -20, -12].map((y) => <circle key={y} cx={0} cy={y} r={0.9} fill="#c9a03c" />)}
          <rect x={-7} y={-5} width={14} height={3.5} rx={1} fill="#c9a03c" stroke={INK} strokeWidth={0.9} />
          <rect x={-2} y={-2} width={4} height={10} fill="#5a3b22" />
        </g>
      ) : hold === "halberd" ? (
        <g>
          <line x1={0} y1={34} x2={0} y2={-80} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
          <path d="M-3 -78 L0 -96 L3 -78 Z" fill="#b9bcc0" stroke={INK} strokeWidth={1.1} />
          <path d="M2 -76 Q16 -80 18 -66 Q10 -70 2 -68 Z" fill="#b9bcc0" stroke={INK} strokeWidth={1.1} />
          <path d="M-4 -66 Q0 -60 4 -66" stroke="#c9302c" strokeWidth={3} fill="none" />
        </g>
      ) : hold === "cup" ? (
        <path d="M-6 -6 L6 -6 L4 2 L-4 2 Z" fill="#b0892c" stroke={INK} strokeWidth={1.1} />
      ) : hold === "whip" ? (
        <g>
          <line x1={0} y1={4} x2={0} y2={-16} stroke="#5a3b22" strokeWidth={3} strokeLinecap="round" />
          <path d={`M0 -16 Q${18 + lash * 10} ${-30 - lash * 8} ${34 + lash * 14} ${-8 + lash * 18}`} stroke="#3b2a1a" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </g>
      ) : hold === "flag" ? (
        <g>
          <line x1={0} y1={30} x2={0} y2={-92} stroke="#6b4a2b" strokeWidth={3} strokeLinecap="round" />
          <path d={`M0 -90 L${34} ${-86 + Math.sin(frame * 0.3 + phase) * 3} L${32} ${-52 + Math.sin(frame * 0.3 + phase + 1) * 3} L0 -56 Z`} fill={flag?.color ?? "#a8382a"} stroke={INK} strokeWidth={1.2} />
          {flag && (
            <text x={16} y={-66} textAnchor="middle" fontSize={20} fill="#f3e6c4" fontFamily="'Microsoft YaHei', 'SimSun', serif" transform={flip ? "translate(32,0) scale(-1,1)" : undefined}>
              {flag.text}
            </text>
          )}
        </g>
      ) : null;
    return inner && <g transform={`translate(0,26) rotate(${-a - lean})`}>{inner}</g>;
  };
  const arm = (a: number, color: string, withHold: boolean, dx: number) => (
    <g transform={`translate(${dx},-74) rotate(${a})`}>
      <path d="M0 0 L0 22" stroke={color} strokeWidth={10} strokeLinecap="round" />
      <path d="M-5 18 L5 18 L6 24 L-6 24 Z" fill={color} stroke={INK} strokeWidth={1} />
      <circle cx={0} cy={27} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
      {withHold && held(a)}
    </g>
  );
  const hair = <path d="M-10 -2 Q-11 -14 0 -13 Q10 -13 10 -4 Q3 -8 -4 -7 Z" fill="#2b2118" />;
  const headwear =
    head === "turban" ? (
      <g>
        {hair}
        <circle cx={-3} cy={-15} r={4.5} fill="#2b2118" />
        <path d="M-10.5 -6 Q0 -10 10.5 -6 L10.5 -1 Q0 -5 -10.5 -1 Z" fill="#e4b829" stroke={INK} strokeWidth={1.1} />
        <path d={`M-10 -4 Q-20 ${-6 + Math.sin(frame * 0.4 + phase) * 3} -26 ${-1 + Math.sin(frame * 0.4 + phase + 1) * 4}`} stroke="#e4b829" strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d={`M-10 -2 Q-18 ${2 + Math.sin(frame * 0.35 + phase) * 3} -23 ${6 + Math.sin(frame * 0.35 + phase + 2) * 3}`} stroke="#d1a61f" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </g>
    ) : head === "official" ? (
      <g>
        {hair}
        <path d="M-9 -9 L9 -9 L8 -15 Q-1 -24 -8 -16 Z" fill="#1d1712" stroke={INK} strokeWidth={1.1} />
        <path d="M-8 -15 L-12 -24 L-4 -18" fill="#1d1712" />
      </g>
    ) : head === "eunuch" ? (
      <g>
        {hair}
        <path d="M-10 -8 L10 -8 L9 -28 Q0 -33 -9 -28 Z" fill="#1d1712" stroke={INK} strokeWidth={1.2} />
        <rect x={-3} y={-24} width={8} height={7} rx={1} fill="#d4a93a" />
        <path d="M-9 -26 Q-18 -38 -14 -46" stroke="#5a4a3a" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
    ) : head === "helmet" ? (
      <g>
        <path d="M-11 -1 Q-12 -17 0 -17 Q12 -17 11 -2 L8 -4 Q0 -9 -8 -4 Z" fill="#6b5a44" stroke={INK} strokeWidth={1.3} />
        <path d="M-11 -2 L-13 8 L-8 6 Z" fill="#6b5a44" stroke={INK} strokeWidth={1} />
        <line x1={0} y1={-17} x2={0} y2={-25} stroke={INK} strokeWidth={1.4} />
        <path d="M0 -25 Q-6 -30 -9 -24" stroke="#a8382a" strokeWidth={3} fill="none" />
      </g>
    ) : head === "lady" ? (
      <g>
        <path d="M-10 2 Q-12 -14 0 -13 Q11 -13 10 -2 Q6 -9 -2 -8 Q-7 -6 -10 2 Z" fill="#1d1712" />
        <ellipse cx={-2} cy={-17} rx={8} ry={6} fill="#1d1712" />
        <ellipse cx={-9} cy={-12} rx={4} ry={5} fill="#1d1712" />
        <line x1={-10} y1={-20} x2={6} y2={-24} stroke="#d4a93a" strokeWidth={1.6} />
        <circle cx={6} cy={-24} r={1.8} fill="#c9302c" />
        <path d="M-4 -21 q2 -4 5 -1" stroke="#d4a93a" strokeWidth={1.2} fill="none" />
      </g>
    ) : head === "plume" ? (
      <g>
        <path d="M-10 -2 Q-11 -14 0 -13 Q10 -13 10 -4 Q3 -8 -4 -7 Z" fill="#2b2118" />
        <path d="M-7 -12 L7 -12 L5 -18 L-5 -18 Z" fill="#c9a03c" stroke={INK} strokeWidth={1} />
        <path d={`M-3 -18 Q-14 -40 -30 ${-44 + Math.sin(frame * 0.15) * 3}`} stroke="#8a3b22" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d={`M2 -18 Q-6 -44 -20 ${-52 + Math.sin(frame * 0.15 + 1) * 3}`} stroke="#8a3b22" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
    ) : head === "prince" ? (
      <g>
        {hair}
        <path d="M-8 -9 L8 -9 L7 -17 L-7 -17 Z" fill="#1d1712" stroke={INK} strokeWidth={1.1} />
        <rect x={-3} y={-21} width={6} height={4} fill="#d4a93a" />
      </g>
    ) : (
      <g>
        {hair}
        <circle cx={-2} cy={-15} r={head === "child" ? 3.5 : 4.5} fill="#2b2118" />
        {head !== "child" && <rect x={-5} y={-13} width={7} height={2.2} fill="#5b4a36" />}
      </g>
    );
  const beardPath =
    beard === "short" ? <path d="M0 6 Q5 13 9 6 Q6 9 3 8 Z" fill="#2b2118" />
    : beard === "long" ? <path d="M-2 4 Q4 26 8 30 Q11 20 10 5 Q6 9 2 8 Z" fill="#2b2118" />
    : beard === "white" ? <path d="M-2 4 Q4 26 8 32 Q12 20 10 5 Q6 9 2 8 Z" fill="#efe9da" stroke={INK} strokeWidth={0.8} />
    : beard === "bushy" ? <path d="M-6 2 Q-6 16 3 17 Q12 17 12 3 Q8 9 3 8 Q-1 8 -6 2 Z" fill="#1d1712" />
    : null;
  const mouth =
    pose === "laugh" ? <ellipse cx={6} cy={6} rx={2.6} ry={2.2} fill="#5a1f17" />
    : pose === "hunch" || pose === "flee" || pose === "tied" ? <path d="M3 7 Q6 5 8 7" stroke={INK} strokeWidth={1.2} fill="none" />
    : <path d="M3 6 Q6 7 8 5" stroke={INK} strokeWidth={1.2} fill="none" />;

  return (
    <g transform={`translate(${x + wiggle},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={stout ? 20 : 15} ry={3.2} fill="#000" opacity={0.22} />
      {pose === "sit" ? (
        <path d="M-16 0 L20 0 Q22 -14 10 -16 L-14 -16 Q-18 -10 -16 0 Z" fill={dark} stroke={INK} strokeWidth={1.4} />
      ) : (
        <>
          {leg(-swing, 0.85)}
          {leg(swing, 1)}
        </>
      )}
      <g transform={`translate(0,${drop}) rotate(${lean},0,-30) scale(${stout ? 1.25 : 1},1)`}>
        {arm(back, dark, false, -6)}
        {pose === "tied" && arm(front, robe, false, 5)}
        {hold === "bundle" && <circle cx={-14} cy={-70} r={11} fill="#9c7f55" stroke={INK} strokeWidth={1.3} />}
        {/* robe: crossed collar (left over right), sash, hem */}
        <path d={`M-11 -78 Q0 -83 11 -78 Q14 -50 17 -22 ${hem} Q-14 -50 -11 -78 Z`} fill={robe} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M4 -79 Q12 -52 16 -24 L17 -22 Q14 -50 11 -78 Z" fill={dark} opacity={0.7} />
        <path d="M-7 -79 L5 -60" stroke="#efe2bd" strokeWidth={2.4} />
        <path d="M6 -79 L-1 -68" stroke="#efe2bd" strokeWidth={2.2} />
        <rect x={-13} y={-53} width={26} height={5} fill={dark} stroke={INK} strokeWidth={1} />
        {sword && (
          <g transform="rotate(-62,-8,-50)">
            <rect x={-10} y={-52} width={44} height={3.6} rx={1} fill="#4a3a2a" stroke={INK} strokeWidth={0.8} />
            <rect x={-18} y={-53} width={9} height={6} rx={1} fill="#c9a03c" stroke={INK} strokeWidth={0.8} />
          </g>
        )}
        <rect x={-3} y={-86} width={6} height={8} fill={skin} />
        <g transform={`translate(1,-95) rotate(${pose === "laugh" ? -14 : 0})`}>
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.6} />
          <circle cx={5} cy={-1} r={1.3} fill={INK} />
          {mouth}
          {pose === "hunch" && <path d="M2 -4 L7 -3" stroke={INK} strokeWidth={0.9} />}
          {beardPath}
          {headwear}
        </g>
        {pose !== "tied" && arm(front, robe, hold !== "bundle", 5)}
      </g>
    </g>
  );
};

// Han palace hall: stone platform with steps, red columns, hipped roof with upturned eaves. (x, y) = platform front centre.
export const Hall = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-150} y={-16} width={300} height={16} fill="#c9b893" stroke={INK} strokeWidth={1.6} />
    <path d="M-30 0 L-22 -16 L22 -16 L30 0 Z" fill="#b9a77f" stroke={INK} strokeWidth={1.2} />
    {[-10, -5].map((dy) => (
      <line key={dy} x1={-27} y1={dy} x2={27} y2={dy} stroke={INK} strokeWidth={0.8} />
    ))}
    <rect x={-122} y={-80} width={244} height={64} fill="#e8d6aa" stroke={INK} strokeWidth={1.4} />
    {[-110, -66, -22, 22, 66, 110].map((cx) => (
      <rect key={cx} x={cx - 5} y={-80} width={10} height={64} fill="#a8382a" stroke={INK} strokeWidth={1.2} />
    ))}
    {[-44, 0, 44].map((cx) => (
      <rect key={cx} x={cx - 16} y={-66} width={32} height={50} fill="#5a2c20" opacity={0.75} />
    ))}
    <rect x={-128} y={-88} width={256} height={9} fill="#3d4a44" stroke={INK} strokeWidth={1.2} />
    <path d="M-168 -86 Q-150 -90 -135 -100 L-90 -132 L90 -132 L135 -100 Q150 -90 168 -86 Q150 -96 140 -96 L100 -128 L-100 -128 L-140 -96 Q-150 -96 -168 -86 Z" fill="#46564f" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    <path d="M-150 -92 L-90 -130 L90 -130 L150 -92 Z" fill="#56685f" stroke={INK} strokeWidth={1.2} />
    {Array.from({ length: 13 }, (_, i) => -120 + i * 20).map((tx) => (
      <line key={tx} x1={tx * 0.75} y1={-129} x2={tx} y2={-94} stroke="#2f3a35" strokeWidth={1} />
    ))}
    <rect x={-96} y={-138} width={192} height={8} rx={2} fill="#2f3a35" stroke={INK} strokeWidth={1.2} />
    <path d="M-96 -134 Q-104 -146 -98 -150 M96 -134 Q104 -146 98 -150" stroke="#2f3a35" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// County office gate (the "yamen" rebels burned): tiled gatehouse, two posts, doors. `burn` 0–1 chars it and lights it.
export const OfficeGate = ({ x, y, scale = 1, burn = 0, seed = 1 }: { x: number; y: number; scale?: number; burn?: number; seed?: number }) => {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={110} ry={7} fill="#000" opacity={0.25} />
      <g style={{ filter: `brightness(${1 - burn * 0.45})` }}>
      <rect x={-90} y={-70} width={180} height={70} fill={"#d9c59a"} stroke={INK} strokeWidth={1.5} />
      <rect x={-34} y={-62} width={68} height={62} fill={"#7a3a24"} stroke={INK} strokeWidth={1.3} />
      <line x1={0} y1={-62} x2={0} y2={0} stroke={INK} strokeWidth={1.3} />
      {[-14, 14].map((cx) => [-48, -32, -16].map((cy) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={2.2} fill="#c9a03c" />))}
      {[-82, -40, 40, 82].map((cx) => (
        <rect key={cx} x={cx - 5} y={-70} width={10} height={70} fill={"#9c3426"} stroke={INK} strokeWidth={1.1} />
      ))}
      <rect x={-22} y={-90} width={44} height={16} fill={"#2f2a22"} stroke="#c9a03c" strokeWidth={1.5} />
      <path d="M-122 -70 Q-108 -74 -96 -84 L-60 -104 L60 -104 L96 -84 Q108 -74 122 -70 Q108 -80 98 -80 L56 -100 L-56 -100 L-98 -80 Q-108 -80 -122 -70 Z" fill={"#4a4a44"} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={-64} y={-110} width={128} height={7} rx={2} fill={"#33332e"} stroke={INK} strokeWidth={1.1} />
      </g>
      {burn > 0 && (
        <g>
          <Smoke x={-30} y={-104} size={30} seed={seed} k={burn} wind={0.5} />
          <Smoke x={40} y={-100} size={26} seed={seed + 4} k={burn} wind={0.5} />
          <Fire x={-50} y={-96} size={52} seed={seed} k={burn} />
          <Fire x={20} y={-100} size={64} seed={seed + 3} k={burn} />
          <Fire x={70} y={-78} size={40} seed={seed + 6} k={Math.max(0, burn * 1.4 - 0.4)} />
          <Fire x={-75} y={-4} size={34} seed={seed + 9} k={Math.max(0, burn * 1.6 - 0.6)} />
        </g>
      )}
    </g>
  );
};

// Rammed-earth wall with a tiled coping, from x0 to x1 (used to split "inside the palace" / "outside").
export const EarthWall = ({ x, y, h, w = 26 }: { x: number; y: number; h: number; w?: number }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#b99a6b" stroke={INK} strokeWidth={1.5} />
    {Array.from({ length: Math.floor(h / 14) }, (_, i) => (
      <line key={i} x1={x - w / 2} y1={y - 8 - i * 14} x2={x + w / 2} y2={y - 8 - i * 14} stroke="#8a6f48" strokeWidth={1} />
    ))}
    <path d={`M${x - w / 2 - 8} ${y - h} L${x} ${y - h - 12} L${x + w / 2 + 8} ${y - h} Z`} fill="#46564f" stroke={INK} strokeWidth={1.3} />
  </g>
);

// Parched field: cracked earth and withered stalks between x0 and x1, ground at y.
export const DryField = ({ x0, x1, y, depth, s, seed = 2 }: { x0: number; x1: number; y: number; depth: number; s: number; seed?: number }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={depth} fill="#b08a55" />
    {Array.from({ length: 14 }, (_, i) => {
      const cx = x0 + random(`c${seed}${i}`) * (x1 - x0);
      const cy = y + 8 * s + random(`d${seed}${i}`) * (depth - 12 * s);
      return <path key={i} d={`M${cx} ${cy} l${8 * s} ${3 * s} l${6 * s} ${-4 * s} M${cx + 8 * s} ${cy + 3 * s} l${2 * s} ${6 * s}`} stroke="#7a5a32" strokeWidth={1.4 * s} fill="none" />;
    })}
    {Array.from({ length: 11 }, (_, i) => {
      const sx = x0 + 12 * s + ((x1 - x0 - 24 * s) * i) / 10 + (random(`s${seed}${i}`) - 0.5) * 14 * s;
      const h = (16 + random(`h${seed}${i}`) * 14) * s;
      const bend = (random(`b${seed}${i}`) - 0.3) * 12 * s;
      return <path key={i} d={`M${sx} ${y + 2 * s} Q${sx + bend * 0.3} ${y - h * 0.6} ${sx + bend} ${y - h}`} stroke="#8c7340" strokeWidth={2 * s} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

// Small chest of coins with a glint (wealth piling up inside the palace).
export const Chest = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const frame = useCurrentFrame();
  const g = 0.5 + 0.5 * Math.sin(frame * 0.25);
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <rect x={-18} y={-18} width={36} height={18} fill="#7a4a26" stroke={INK} strokeWidth={1.4} />
      <path d="M-18 -18 Q0 -30 18 -18" fill="#8d5a30" stroke={INK} strokeWidth={1.4} />
      {[-10, -3, 4, 11].map((cx, i) => (
        <circle key={cx} cx={cx} cy={-20 - (i % 2) * 3} r={4} fill="#e0b63e" stroke="#8a6a1c" strokeWidth={1} />
      ))}
      <path d="M8 -34 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#fff6c2" opacity={g} />
    </g>
  );
};

// Willow: trunk + drooping strands that sway. (x, y) = foot of the trunk; `broken` shortens some strands (novel:
// whipped until the willow switches broke).
export const Willow = ({ x, y, scale = 1, broken = 0 }: { x: number; y: number; scale?: number; broken?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-8 0 Q-12 -60 -4 -120 L6 -120 Q2 -60 10 0 Z" fill="#6b5236" stroke={INK} strokeWidth={1.6} />
      <path d="M-4 -110 Q-40 -150 -70 -140 M4 -112 Q40 -150 72 -138 M0 -118 Q0 -150 -10 -165" stroke="#6b5236" strokeWidth={5} fill="none" strokeLinecap="round" />
      {Array.from({ length: 16 }, (_, i) => {
        const sx = -78 + i * 10.5;
        const top = -150 + Math.abs(i - 7.5) * 3;
        const len = 70 + random(`w${i}`) * 40 - (i % 3 === 0 ? broken * 45 : 0);
        const sway = Math.sin(frame * 0.05 + i) * 6;
        return <path key={i} d={`M${sx} ${top} Q${sx + sway * 0.5} ${top + len * 0.5} ${sx + sway} ${top + len}`} stroke={i % 2 ? "#7f9a56" : "#93ad66"} strokeWidth={3} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Rope coils across a post (used with Willow: the official tied to the tree). (x, y) = lowest coil centre.
export const Rope = ({ x, y, w, scale = 1 }: { x: number; y: number; w: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {[0, 12, 24].map((dy) => (
      <path key={dy} d={`M${-w / 2} ${-dy} Q0 ${-dy + 5} ${w / 2} ${-dy}`} stroke="#c9a46a" strokeWidth={3.2} fill="none" strokeLinecap="round" />
    ))}
  </g>
);

// Throne room interior: back wall, red columns, screen, raised dais with an (empty) throne. (x, y) = dais front centre.
export const ThroneRoom = ({ x, y, w, h, s }: { x: number; y: number; w: number; h: number; s: number }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill="#6e2a1f" />
    {[-0.42, -0.25, 0.25, 0.42].map((f) => (
      <g key={f}>
        <rect x={x + w * f - 14 * s} y={y - h} width={28 * s} height={h} fill="#a8382a" stroke={INK} strokeWidth={1.4 * s} />
        <rect x={x + w * f - 18 * s} y={y - h + 18 * s} width={36 * s} height={10 * s} fill="#c9a03c" />
      </g>
    ))}
    <rect x={x - 110 * s} y={y - 190 * s} width={220 * s} height={150 * s} fill="#c9a03c" stroke={INK} strokeWidth={1.6 * s} />
    <rect x={x - 100 * s} y={y - 180 * s} width={200 * s} height={130 * s} fill="#e6cf8a" />
    <path d={`M${x - 90 * s} ${y - 120 * s} Q${x - 40 * s} ${y - 170 * s} ${x} ${y - 125 * s} Q${x + 40 * s} ${y - 80 * s} ${x + 90 * s} ${y - 125 * s}`} stroke="#b0892c" strokeWidth={5 * s} fill="none" />
    <rect x={x - 150 * s} y={y - 40 * s} width={300 * s} height={40 * s} fill="#8c6a3a" stroke={INK} strokeWidth={1.6 * s} />
    {[14, 27].map((dy) => (
      <line key={dy} x1={x - 150 * s} y1={y - 40 * s + dy * s} x2={x + 150 * s} y2={y - 40 * s + dy * s} stroke={INK} strokeWidth={0.8 * s} />
    ))}
    <g transform={`translate(${x},${y - 40 * s}) scale(${s})`}>
      <path d="M-46 0 L-46 -56 Q-46 -66 -36 -66 L36 -66 Q46 -66 46 -56 L46 0 Z" fill="#c9a03c" stroke={INK} strokeWidth={1.6} />
      <rect x={-36} y={-30} width={72} height={30} fill="#a8382a" stroke={INK} strokeWidth={1.2} />
      <rect x={-52} y={-34} width={10} height={34} fill="#b0892c" stroke={INK} strokeWidth={1.2} />
      <rect x={42} y={-34} width={10} height={34} fill="#b0892c" stroke={INK} strokeWidth={1.2} />
    </g>
  </g>
);

// City wall across the panel with a gate tower at cx; `open` 0–1 opens the doors.
export const CityGate = ({ x0, x1, cx, y, s, open = 0 }: { x0: number; x1: number; cx: number; y: number; s: number; open?: number }) => {
  const wallH = 110 * s;
  return (
    <g>
      <rect x={x0} y={y - wallH} width={x1 - x0} height={wallH} fill="#a88a5c" stroke={INK} strokeWidth={1.5 * s} />
      {Array.from({ length: Math.ceil((x1 - x0) / (34 * s)) }, (_, i) => (
        <rect key={i} x={x0 + i * 34 * s} y={y - wallH - 14 * s} width={20 * s} height={14 * s} fill="#a88a5c" stroke={INK} strokeWidth={1.2 * s} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={x0} y1={y - 18 * s - i * 16 * s} x2={x1} y2={y - 18 * s - i * 16 * s} stroke="#8a6f48" strokeWidth={1 * s} />
      ))}
      <path d={`M${cx - 44 * s} ${y} L${cx - 44 * s} ${y - 60 * s} Q${cx} ${y - 100 * s} ${cx + 44 * s} ${y - 60 * s} L${cx + 44 * s} ${y} Z`} fill="#1e140c" stroke={INK} strokeWidth={1.5 * s} />
      <rect x={cx - 44 * s} y={y - 66 * s} width={44 * s * (1 - open)} height={66 * s} fill="#6b3a22" stroke={INK} strokeWidth={1.2 * s} />
      <rect x={cx + 44 * s - 44 * s * (1 - open)} y={y - 66 * s} width={44 * s * (1 - open)} height={66 * s} fill="#6b3a22" stroke={INK} strokeWidth={1.2 * s} />
      <rect x={cx - 80 * s} y={y - wallH - 60 * s} width={160 * s} height={46 * s} fill="#d9c59a" stroke={INK} strokeWidth={1.4 * s} />
      {[-60, -20, 20, 60].map((dx) => (
        <rect key={dx} x={cx + (dx - 5) * s} y={y - wallH - 60 * s} width={10 * s} height={46 * s} fill="#9c3426" />
      ))}
      <path d={`M${cx - 112 * s} ${y - wallH - 56 * s} Q${cx - 96 * s} ${y - wallH - 62 * s} ${cx - 86 * s} ${y - wallH - 74 * s} L${cx - 56 * s} ${y - wallH - 96 * s} L${cx + 56 * s} ${y - wallH - 96 * s} L${cx + 86 * s} ${y - wallH - 74 * s} Q${cx + 96 * s} ${y - wallH - 62 * s} ${cx + 112 * s} ${y - wallH - 56 * s} Z`} fill="#4a4a44" stroke={INK} strokeWidth={1.5 * s} strokeLinejoin="round" />
    </g>
  );
};

// River band with moving ripples (dark water when `night`).
export const River = ({ x, y, w, h, s, night = false }: { x: number; y: number; w: number; h: number; s: number; night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={night ? "#1f2f3c" : "#7a9aa0"} />
      {Array.from({ length: 10 }, (_, i) => {
        const rx = x + (((i * 97 * s + frame * 1.2 * s) % (w + 80 * s)) - 40 * s);
        const ry = y + 8 * s + (i % 4) * (h / 4);
        return <path key={i} d={`M${rx} ${ry} q${12 * s} ${-4 * s} ${24 * s} 0 q${12 * s} ${4 * s} ${24 * s} 0`} stroke={night ? "#5d7c8c" : "#c9dcdc"} strokeWidth={2 * s} fill="none" opacity={0.7} />;
      })}
    </g>
  );
};

// Fireflies drifting in an area (novel: fireflies lit the way for the two boys by the river).
export const Fireflies = ({ x, y, w, h, n = 14, k = 1 }: { x: number; y: number; w: number; h: number; n?: number; k?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => {
        const fx = x + random(`fx${i}`) * w + Math.sin(frame * 0.04 + i) * 14;
        const fy = y + random(`fy${i}`) * h + Math.cos(frame * 0.05 + i * 2) * 10;
        const glow = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.12 + i * 1.3));
        return (
          <g key={i} opacity={glow}>
            <circle cx={fx} cy={fy} r={9} fill="#e8f07a" opacity={0.25} />
            <circle cx={fx} cy={fy} r={2.6} fill="#f6ffb0" />
          </g>
        );
      })}
    </g>
  );
};

// War drum on a stand, pulsing on a steady beat.
export const WarDrum = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const frame = useCurrentFrame();
  const hit = Math.max(0, 1 - (frame % 15) / 6);
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-26 0 L-14 -30 M26 0 L14 -30" stroke="#5a3b22" strokeWidth={4} />
      <ellipse cx={0} cy={-46} rx={30 + hit * 2} ry={24 + hit * 2} fill="#a8382a" stroke={INK} strokeWidth={1.6} />
      <ellipse cx={0} cy={-46} rx={18} ry={22} fill="#e8d6aa" stroke={INK} strokeWidth={1.2} />
      {hit > 0.3 && <path d="M30 -60 l10 -6 M32 -46 l12 0 M30 -32 l10 6" stroke={INK} strokeWidth={1.6} />}
    </g>
  );
};

// Horse, side view facing right, galloping when `run`; a rider is a HanFigure drawn first at (x, y - 46·scale)
// so the horse's body covers its legs. (x, y) = ground under the belly.
export const Horse = ({ x, y, scale = 1, color = "#7a4a2a", run = true, flip = false, phase = 0 }: { x: number; y: number; scale?: number; color?: string; run?: boolean; flip?: boolean; phase?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.45 + phase;
  const leg = (hx: number, hy: number, a: number, back: boolean) => (
    <g transform={`translate(${hx},${hy}) rotate(${a})`} opacity={back ? 0.8 : 1}>
      <path d="M-3 0 L3 0 L2.5 26 L-2.5 26 Z" fill={color} stroke={INK} strokeWidth={1.3} />
      <rect x={-3.2} y={25} width={6.4} height={4} fill="#2a1b0e" />
    </g>
  );
  const sw = (k: number) => (run ? Math.sin(t + k) * 28 : 0);
  return (
    <g transform={`translate(${x},${y - (run ? Math.abs(Math.sin(t)) * 3 : 0)}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={30} rx={34} ry={4} fill="#000" opacity={0.2} />
      {leg(-22, 0, sw(0), true)}
      {leg(20, 0, sw(2), true)}
      <path d="M-34 -4 Q-40 -10 -46 4 Q-42 -14 -34 -12 Z" fill="#2a1b0e" />
      <ellipse cx={0} cy={-6} rx={34} ry={13} fill={color} stroke={INK} strokeWidth={1.6} />
      <path d="M24 -12 Q34 -30 40 -38 L50 -34 Q46 -22 34 -6 Z" fill={color} stroke={INK} strokeWidth={1.6} />
      <path d="M38 -40 L54 -32 Q56 -27 51 -26 L40 -30 Z" fill={color} stroke={INK} strokeWidth={1.4} />
      <path d="M26 -14 Q32 -30 38 -40 Q30 -32 24 -18 Z" fill="#2a1b0e" />
      <circle cx={46} cy={-33} r={1.4} fill={INK} />
      <path d="M-10 -18 Q0 -22 10 -18 L8 -10 L-8 -10 Z" fill="#8a3324" stroke={INK} strokeWidth={1} />
      {leg(-16, 2, -sw(1), false)}
      {leg(24, 2, -sw(3), false)}
    </g>
  );
};

// Pig, side view (the household was about to slaughter one for their guest — no slaughter drawn).
export const Pig = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={1} rx={22} ry={3} fill="#000" opacity={0.2} />
    {[-12, -6, 8, 14].map((lx) => (
      <rect key={lx} x={lx - 2.5} y={-8} width={5} height={9} fill="#d99a8a" stroke={INK} strokeWidth={1} />
    ))}
    <ellipse cx={0} cy={-14} rx={22} ry={12} fill="#e8b0a0" stroke={INK} strokeWidth={1.5} />
    <ellipse cx={22} cy={-15} rx={7} ry={6} fill="#e8b0a0" stroke={INK} strokeWidth={1.3} />
    <ellipse cx={28} cy={-14} rx={2.6} ry={3.2} fill="#d99a8a" stroke={INK} strokeWidth={1} />
    <path d="M18 -22 L22 -28 L24 -20 Z" fill="#d99a8a" stroke={INK} strokeWidth={1} />
    <circle cx={24} cy={-17} r={1.1} fill={INK} />
    <path d="M-22 -16 q-6 -2 -4 -7 q2 4 -1 5" stroke={INK} strokeWidth={1.2} fill="none" />
  </g>
);

// Country house: rammed-earth walls, thatched roof, a lit doorway. (x, y) = front centre on the ground.
export const Farmhouse = ({ x, y, scale = 1, lit = 1 }: { x: number; y: number; scale?: number; lit?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-80} y={-70} width={160} height={70} fill="#b99a6b" stroke={INK} strokeWidth={1.5} />
    {[18, 36, 54].map((dy) => (
      <line key={dy} x1={-80} y1={-dy} x2={80} y2={-dy} stroke="#8a6f48" strokeWidth={1} />
    ))}
    <rect x={-18} y={-50} width={36} height={50} fill="#2a1b0e" />
    <rect x={-18} y={-50} width={36} height={50} fill="#ffb84a" opacity={0.55 * lit} />
    <rect x={40} y={-52} width={24} height={18} fill="#2a1b0e" />
    <rect x={40} y={-52} width={24} height={18} fill="#ffb84a" opacity={0.6 * lit} />
    <path d="M-96 -66 L0 -112 L96 -66 Z" fill="#a8894a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
    {Array.from({ length: 9 }, (_, i) => -80 + i * 20).map((tx) => (
      <line key={tx} x1={tx * 0.2} y1={-108} x2={tx} y2={-70} stroke="#8a6f38" strokeWidth={1} />
    ))}
  </g>
);

// Round bronze mirror on a stand; `glint` 0–1 flashes the reflection (Dong Zhuo saw the sword in it).
export const Mirror = ({ x, y, scale = 1, glint = 0 }: { x: number; y: number; scale?: number; glint?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-4 0 L-2 -40 L2 -40 L4 0 Z" fill="#6b4a2b" stroke={INK} strokeWidth={1.2} />
    <circle cx={0} cy={-58} r={22} fill="#b0892c" stroke={INK} strokeWidth={1.6} />
    <circle cx={0} cy={-58} r={17} fill="#d9c07a" />
    <path d="M-8 -66 L8 -50" stroke="#fff6c2" strokeWidth={3 + glint * 4} opacity={0.4 + glint * 0.6} strokeLinecap="round" />
    {glint > 0 && <circle cx={0} cy={-58} r={30 + glint * 14} fill="#fff6c2" opacity={0.35 * glint} />}
  </g>
);

// Arrows in flight from (x0, y0) toward (x1, y1); `p` 0–1 is how far along. Drawn as shafts with fletching.
export const ArrowShot = ({ x0, y0, x1, y1, p, s }: { x0: number; y0: number; x1: number; y1: number; p: number; s: number }) => {
  if (p <= 0 || p >= 1) return null;
  const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 30 * s;
  const a = (Math.atan2(y1 - y0 - Math.cos(p * Math.PI) * 30 * s * Math.PI * 0.5, x1 - x0) * 180) / Math.PI;
  return (
    <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
      <line x1={-26} y1={0} x2={8} y2={0} stroke="#3b2a1a" strokeWidth={2} />
      <path d="M8 -3 L16 0 L8 3 Z" fill="#8f8a7e" />
      <path d="M-26 0 L-32 -5 M-26 0 L-32 5 M-22 0 L-28 -5 M-22 0 L-28 5" stroke="#efe2bd" strokeWidth={1.6} />
      <line x1={-60} y1={0} x2={-30} y2={0} stroke="#fff6dd" strokeWidth={1.2} opacity={0.4} />
    </g>
  );
};

// Wine cup with rising steam ("the wine was still warm"); `warm` 0–1 fades the steam.
export const WineCup = ({ x, y, scale = 1, warm = 1 }: { x: number; y: number; scale?: number; warm?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-14 -20 L14 -20 L10 -4 L-10 -4 Z" fill="#b0892c" stroke={INK} strokeWidth={1.4} />
      <rect x={-3} y={-4} width={6} height={4} fill="#8c6a3a" />
      <ellipse cx={0} cy={0} rx={10} ry={2.5} fill="#8c6a3a" stroke={INK} strokeWidth={1} />
      <ellipse cx={0} cy={-20} rx={14} ry={3} fill="#7a2a1a" stroke={INK} strokeWidth={1.2} />
      {[0, 1, 2].map((i) => {
        const a = ((frame * 1.2 + i * 20) % 60) / 60;
        return <path key={i} d={`M${-6 + i * 6} -24 q${5 + i} ${-10} 0 ${-20} q-6 -10 0 -20`} transform={`translate(0,${-a * 14})`} stroke="#fff6dd" strokeWidth={2.2} fill="none" opacity={(1 - a) * 0.8 * warm} />;
      })}
    </g>
  );
};

// Low banquet table with wine jars and dishes; (x, y) = front centre on the ground.
export const FeastTable = ({ x, y, w, scale = 1 }: { x: number; y: number; w: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-w / 2} y={-22} width={w} height={8} rx={2} fill="#7a3a24" stroke={INK} strokeWidth={1.4} />
    {[-w / 2 + 8, w / 2 - 14].map((lx) => (
      <rect key={lx} x={lx} y={-14} width={6} height={14} fill="#5a2a1a" />
    ))}
    {Array.from({ length: Math.max(2, Math.floor(w / 40)) }, (_, i) => -w / 2 + 20 + i * 40).map((jx, i) => (
      <g key={jx}>
        {i % 2 ? (
          <ellipse cx={jx} cy={-24} rx={9} ry={3} fill="#e6cf8a" stroke={INK} strokeWidth={1} />
        ) : (
          <path d={`M${jx - 7} -22 Q${jx - 10} -34 ${jx - 4} -38 L${jx + 4} -38 Q${jx + 10} -34 ${jx + 7} -22 Z`} fill="#8c6a3a" stroke={INK} strokeWidth={1.1} />
        )}
      </g>
    ))}
  </g>
);

// Burial mound with white mourning banners.
export const Grave = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-60 0 Q0 -50 60 0 Z" fill="#8a7350" stroke={INK} strokeWidth={1.5} />
      <rect x={-6} y={-46} width={12} height={20} fill="#c9bfa8" stroke={INK} strokeWidth={1.1} />
      {[-70, 70].map((bx, i) => (
        <g key={bx}>
          <line x1={bx} y1={0} x2={bx} y2={-90} stroke="#6b4a2b" strokeWidth={2.5} />
          <path d={`M${bx} -88 L${bx + 10} ${-88} L${bx + 12 + Math.sin(frame * 0.12 + i) * 4} -40 L${bx + 2} -42 Z`} fill="#f3efe4" stroke={INK} strokeWidth={1} />
        </g>
      ))}
    </g>
  );
};

// Dark bushes on a hillside (ambush cover).
export const Bushes = ({ x0, x1, y, s, n = 6, seed = 4 }: { x0: number; x1: number; y: number; s: number; n?: number; seed?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const bx = x0 + ((x1 - x0) * (i + 0.5)) / n + (random(`bx${seed}${i}`) - 0.5) * 30 * s;
      const r = (16 + random(`br${seed}${i}`) * 12) * s;
      return (
        <g key={i}>
          <circle cx={bx} cy={y - r * 0.6} r={r} fill="#25301f" />
          <circle cx={bx + r * 0.7} cy={y - r * 0.4} r={r * 0.75} fill="#2e3a26" />
        </g>
      );
    })}
  </g>
);

// Figure looks per cast key, matched to the painted portraits, so a character reads the same in every scene.
type Look = Partial<Parameters<typeof HanFigure>[0]>;
export const LOOK: Record<string, Look> = {
  liubei: { robe: "#6f7f96", shade: "#4f5d72", beard: "short" },
  guanyu: { robe: "#4f6b4a", shade: "#3a5036", skin: "#b5523b", beard: "long" },
  zhangfei: { robe: "#4a4038", shade: "#352d26", skin: "#a8754f", beard: "bushy" },
  caocao: { robe: "#5a2a24", shade: "#3f1c18", head: "official", beard: "short" },
  seer: { robe: "#9a9a92", shade: "#77776f", head: "official", beard: "white" },
  hejin: { robe: "#8a3324", shade: "#66241a", head: "official", beard: "bushy", stout: true },
  zhangrang: { robe: "#9c3426", shade: "#7a2518", head: "eunuch" },
  dongzhuo: { robe: "#3d3f5c", shade: "#2b2c44", beard: "bushy", stout: true, sword: true },
  emperor: { robe: "#2b2620", shade: "#1d1a15", head: "prince" },
  prince: { robe: "#7a6428", shade: "#5a4a1c", head: "prince" },
  soldier: { robe: "#6b5236", shade: "#4e3b26", head: "helmet" },
  official: { robe: "#3d4f6b", shade: "#2c3a50", head: "official" },
  lvbu: { robe: "#8c2f4f", shade: "#6a2038", head: "plume" },
  sunjian: { robe: "#a8382a", shade: "#7a2518", head: "helmet", beard: "short" },
  sunce: { robe: "#8a3324", shade: "#66241a" },
  sunquan: { robe: "#9c3426", shade: "#7a2518", head: "child" },
  wangyun: { robe: "#3d4f6b", shade: "#2c3a50", head: "official", beard: "white" },
  diaochan: { robe: "#d9a0a8", shade: "#b77a84", head: "lady", skin: "#efc9a4" },
  huaxiong: { robe: "#3a3a40", shade: "#26262c", head: "helmet", beard: "bushy", stout: true },
  lvboshe: { robe: "#8a6a3c", shade: "#6a502c", beard: "white" },
  yuanshao: { robe: "#7a2a24", shade: "#5a1c18", head: "official", beard: "long" },
  yuanshu: { robe: "#5a3a6e", shade: "#422a52", head: "official", beard: "short" },
  liubiao: { robe: "#4a6a4a", shade: "#365036", head: "official", beard: "short" },
  huangzu: { robe: "#4a5a3a", shade: "#36422a", head: "helmet", beard: "short" },
};
