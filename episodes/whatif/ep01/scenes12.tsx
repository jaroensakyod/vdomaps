import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { COSTUME, type Costume, Depth, Fighter, Glow, Grass, PAL, Ridge, Shot, impactAt } from "../../../components/Scene";
import { clamp, GOLD, Panel } from "../../worldhistory/kit/news";
import { Flag, LogHouse, OnionChurch, Pine, REAL, RU_FLAG, Snow, SnowGround, US_FLAG } from "../kit/WhatIf";

// Style-v2 panels for chapters 1–2 (Russian America, why sell). One scene per story moment; shared props below.

const XY = (p: number[]) => p as [number, number];

// ---- costumes ----
export const C: Record<string, Costume> = {
  aleut: { jacket: "#9a7a52", sash: "#5a3a22", pants: "#6b5236", head: "short", skin: "#b9784e" },
  tlingit: { jacket: "#2f2a2a", sash: "#a8322a", pants: "#3a2a22", head: "wrap", headColor: "#a8322a", skin: "#a8683e" },
  trader: { jacket: "#5a3a2a", sash: "#c9302c", pants: "#2a2a2a", head: "helmet", headColor: "#3a2a1c", skin: "#e0b08a" },
  sailor: { jacket: "#2a3550", sash: "#efe6d0", pants: "#efe6d0", head: "short", skin: "#e0b08a" },
  redcoat: { jacket: "#b22222", sash: "#efe6d0", pants: "#2a2a3a", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" },
  french: { jacket: "#2b3f86", sash: "#efe6d0", pants: "#b22222", head: "helmet", headColor: "#2b3f86", skin: "#e0b08a" },
  rusArmy: { jacket: "#2f4a32", sash: "#c9302c", pants: "#2a2a2a", head: "helmet", headColor: "#1b1d24", skin: "#e0b08a" },
  union: { jacket: "#2b3f6e", sash: "#efe6d0", pants: "#6f8fc4", head: "helmet", headColor: "#22305a", skin: "#e0b08a" },
  grey: { jacket: "#7a7d80", sash: "#4a4c50", pants: "#8a8d90", head: "helmet", headColor: "#6a6d70", skin: "#e0b08a" },
  suit: { jacket: "#1f2228", sash: "#efe6d0", pants: "#1f2228", head: "short", skin: "#e0b08a" },
  noble: { jacket: "#2f4a32", sash: "#d9a93a", pants: "#efe6d0", head: "short", skin: "#e0b08a" },
  clerk: { jacket: "#4a3a2e", sash: "#efe6d0", pants: "#2a2420", head: "short", skin: "#e0b08a" },
  merchant: { jacket: "#3a5a8a", sash: PAL.gilt, pants: "#2a2a2a", head: "topknot", skin: "#d9a070" },
};
export const UK_FLAG = ["#22307a", "#22307a", "#22307a"]; // field; the crosses are drawn by UnionJack
export const FR_FLAG = ["#22307a", "#f4f1ea", "#d52b1e"];

// ---- the panel wrapper: Panel + Depth, children get (g, pan) ----
export const Scene = ({ id, anchor, start, end, sky, accent = REAL, warm = 0.06, impact = 0, children }: { id: string; anchor: number[]; start: number; end: number; sky: [string, string]; accent?: string; warm?: number; impact?: number; children: (g: InsetGeom, pan: number) => ReactNode }) => (
  <Panel id={id} anchor={XY(anchor)} start={start} end={end} sky={sky} accent={accent}>
    {(g) => (
      <Depth g={g} id={id} start={start} end={end} warm={warm} impact={impact}>
        {(pan) => children(g, pan)}
      </Depth>
    )}
  </Panel>
);

// ---- props ----

// A sea band from y down, with moving crests. shift = parallax offset.
export const Sea = ({ g, y, shift = 0, color = "#3b5a6e", crest = "#c8d6e0" }: { g: InsetGeom; y: number; shift?: number; color?: string; crest?: string }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={g.x - 10 * g.s} y={y} width={g.W + 20 * g.s} height={g.y + g.H - y + 10 * g.s} fill={color} />
      {[0, 1, 2, 3].map((r) => {
        const ry = y + (8 + r * r * 9) * g.s;
        const amp = (2 + r * 1.5) * g.s;
        const pts = Array.from({ length: 26 }, (_, i) => `${g.x - 60 * g.s + i * ((g.W + 120 * g.s) / 25) + ((shift * (0.4 + r * 0.4)) % (40 * g.s))},${ry + Math.sin(i * 1.3 + frame * (0.08 + r * 0.03) + r) * amp}`).join(" L");
        return <path key={r} d={`M${pts}`} fill="none" stroke={crest} strokeWidth={(1.2 + r * 0.6) * g.s} opacity={0.35 + r * 0.12} />;
      })}
    </g>
  );
};

// Mist band across the panel.
export const Mist = ({ g, y, k = 0.35, color = "#e8eef4" }: { g: InsetGeom; y: number; k?: number; color?: string }) => (
  <rect x={g.x} y={y - 18 * g.s} width={g.W} height={36 * g.s} fill={color} opacity={k} style={{ filter: `blur(${10 * g.s}px)` }} />
);

// Three-masted sailing ship; flag stripes at the stern. Bobs on the swell.
export const Ship = ({ x, y, s, flag = RU_FLAG, phase = 0, scale = 1, union = false, smoke = 0 }: { x: number; y: number; s: number; flag?: string[]; phase?: number; scale?: number; union?: boolean; smoke?: number }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + phase) * 3 * s;
  const roll = Math.sin(frame * 0.05 + phase) * 1.5;
  const k = s * scale;
  return (
    <g transform={`translate(${x},${y + bob}) rotate(${roll}) scale(${k})`}>
      <path d="M-90 0 L90 0 L72 26 L-74 26 Z" fill="#4a3322" stroke={PAL.ink} strokeWidth={2} />
      <rect x={-86} y={4} width={170} height={5} fill="#c9b994" />
      {[-52, 0, 48].map((mx, i) => (
        <g key={i}>
          <line x1={mx} y1={0} x2={mx} y2={-(120 - i * 10)} stroke="#3a2a1c" strokeWidth={3} />
          {[0, 1].map((r) => (
            <path key={r} d={`M${mx - 26} ${-(110 - i * 10) + r * 46} Q${mx + 6} ${-(96 - i * 10) + r * 46} ${mx + 26} ${-(110 - i * 10) + r * 46} L${mx + 24} ${-(74 - i * 10) + r * 46} Q${mx + 6} ${-(62 - i * 10) + r * 46} ${mx - 24} ${-(74 - i * 10) + r * 46} Z`} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4} />
          ))}
        </g>
      ))}
      <g transform="translate(-92,-34)">
        <rect x={-36} y={0} width={36} height={22} fill={flag[0]} />
        {flag.map((c, i) => <rect key={i} x={-36} y={(i * 22) / flag.length} width={36} height={22 / flag.length + 0.3} fill={c} />)}
        {union && <UnionJackMarks x={-36} y={0} w={36} h={22} />}
        <rect x={-36} y={0} width={36} height={22} fill="none" stroke={PAL.ink} strokeWidth={1} />
      </g>
      {smoke > 0 && Array.from({ length: 4 }, (_, i) => <circle key={i} cx={20 + i * 14} cy={10 - i * 6} r={10 + i * 6} fill="#efeae0" opacity={smoke * (0.6 - i * 0.12)} />)}
    </g>
  );
};

const UnionJackMarks = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <path d={`M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}`} stroke="#f4f1ea" strokeWidth={h * 0.22} />
    <path d={`M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}`} stroke="#c8102e" strokeWidth={h * 0.08} />
    <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke="#f4f1ea" strokeWidth={h * 0.32} />
    <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke="#c8102e" strokeWidth={h * 0.18} />
  </g>
);

// A Union Jack on a pole (static field + crosses, gentle sway).
export const UnionJack = ({ x, y, s, h = 150 }: { x: number; y: number; s: number; h?: number }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.2) * 3;
  const w = 66 * s;
  const fh = 40 * s;
  const top = y - h * s;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={top - 6 * s} stroke="#3a2a1c" strokeWidth={4 * s} />
      <g transform={`translate(${x},${top}) skewY(${sway})`}>
        <rect x={0} y={0} width={w} height={fh} fill="#22307a" />
        <UnionJackMarks x={0} y={0} w={w} h={fh} />
        <rect x={0} y={0} width={w} height={fh} fill="none" stroke={PAL.ink} strokeWidth={1.4 * s} />
      </g>
    </g>
  );
};

// Sea otter floating on its back, paws on its chest, bobbing.
export const Otter = ({ x, y, s, phase = 0, flip = false }: { x: number; y: number; s: number; phase?: number; flip?: boolean }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.09 + phase) * 3 * s;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={0} rx={34} ry={11} fill="#5a3f2a" stroke={PAL.ink} strokeWidth={1.6} />
      <circle cx={34} cy={-6} r={10} fill="#d9c9a8" stroke={PAL.ink} strokeWidth={1.6} />
      <circle cx={37} cy={-8} r={1.6} fill={PAL.ink} />
      <ellipse cx={8} cy={-8} rx={7} ry={4} fill="#4a3322" stroke={PAL.ink} strokeWidth={1.2} />
      <path d="M-34 0 q-14 -4 -18 -12" stroke="#4a3322" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

// Kayak (baidarka) with one or two paddlers; paddle swings.
export const Kayak = ({ x, y, s, phase = 0, crew = 1, flip = false }: { x: number; y: number; s: number; phase?: number; crew?: number; flip?: boolean }) => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame * 0.18 + phase) * 30;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <path d="M-80 0 Q0 12 86 -6 Q0 2 -80 0 Z" fill="#a88a5a" stroke={PAL.ink} strokeWidth={1.8} />
      {Array.from({ length: crew }, (_, i) => {
        const cx = -14 + i * 34;
        return (
          <g key={i}>
            <path d={`M${cx - 8} 0 Q${cx - 10} -26 ${cx} -30 Q${cx + 10} -26 ${cx + 8} 0 Z`} fill="#9a7a52" stroke={PAL.ink} strokeWidth={1.4} />
            <circle cx={cx} cy={-36} r={7} fill="#b9784e" stroke={PAL.ink} strokeWidth={1.4} />
            <path d={`M${cx - 8} -40 Q${cx} -52 ${cx + 9} -40 Z`} fill="#c9b994" stroke={PAL.ink} strokeWidth={1} />
            <g transform={`rotate(${a + i * 40},${cx},-20)`}>
              <line x1={cx - 34} y1={-20} x2={cx + 34} y2={-20} stroke="#5a3a1f" strokeWidth={3} />
              <ellipse cx={cx - 36} cy={-20} rx={6} ry={3} fill="#5a3a1f" />
              <ellipse cx={cx + 36} cy={-20} rx={6} ry={3} fill="#5a3a1f" />
            </g>
          </g>
        );
      })}
    </g>
  );
};

// Sod house (barabara): a grassy mound with a smoke hole.
export const Barabara = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    <path d={`M${x} ${y} Q${x + w / 2} ${y - w * 0.55} ${x + w} ${y} Z`} fill="#6b7a4a" stroke={PAL.ink} strokeWidth={1.6 * s} />
    <rect x={x + w * 0.42} y={y - w * 0.3} width={w * 0.16} height={w * 0.04} fill="#2a2420" />
    <rect x={x + w * 0.44} y={y - w * 0.16} width={w * 0.12} height={w * 0.16} fill="#2a2420" />
  </g>
);

// Volcano cone with a slow steam plume.
export const Volcano = ({ x, y, h, s, color = "#7d8bb0" }: { x: number; y: number; h: number; s: number; color?: string }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={`M${x - h * 1.3} ${y} L${x - h * 0.12} ${y - h} L${x + h * 0.12} ${y - h} L${x + h * 1.3} ${y} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.4 * s} strokeOpacity={0.6} />
      <path d={`M${x - h * 0.4} ${y - h * 0.7} L${x - h * 0.12} ${y - h} L${x + h * 0.12} ${y - h} L${x + h * 0.4} ${y - h * 0.7} Q${x} ${y - h * 0.62} ${x - h * 0.4} ${y - h * 0.7} Z`} fill="#eef3f8" />
      {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={x + Math.sin(frame * 0.02 + i) * 8 * s + i * 10 * s} cy={y - h - (14 + i * 20) * s} r={(12 + i * 7) * s} fill="#eef3f8" opacity={0.5 - i * 0.1} />)}
    </g>
  );
};

// Wooden palisade from x0 to x1 standing on y.
export const Palisade = ({ x0, x1, y, h, s }: { x0: number; x1: number; y: number; h: number; s: number }) => (
  <g>
    {Array.from({ length: Math.ceil((x1 - x0) / (14 * s)) }, (_, i) => (
      <path key={i} d={`M${x0 + i * 14 * s} ${y} l0 ${-h} l${7 * s} ${-8 * s} l${7 * s} ${8 * s} l0 ${h} Z`} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1 * s} />
    ))}
  </g>
);

// Old cannon on a wooden carriage, muzzle to the right.
export const Cannon = ({ x, y, s, flip = false, recoil = 0 }: { x: number; y: number; s: number; flip?: boolean; recoil?: number }) => (
  <g transform={`translate(${x - recoil * 8 * s * (flip ? -1 : 1)},${y}) scale(${flip ? -s : s},${s})`}>
    <path d="M-30 -14 L30 -22 L32 -12 L-30 -4 Z" fill="#2a2a2a" stroke={PAL.ink} strokeWidth={1.6} />
    <rect x={-26} y={-8} width={40} height={8} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.2} />
    <circle cx={-14} cy={2} r={9} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1.4} />
    <circle cx={10} cy={2} r={9} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1.4} />
  </g>
);

// Fur bundle (bale) and a stack of pelts.
export const Bale = ({ x, y, s, w = 40 }: { x: number; y: number; s: number; w?: number }) => (
  <g>
    <rect x={x} y={y - w * 0.6 * s} width={w * s} height={w * 0.6 * s} rx={6 * s} fill="#5a3f2a" stroke={PAL.ink} strokeWidth={1.4 * s} />
    <line x1={x + w * 0.3 * s} y1={y - w * 0.6 * s} x2={x + w * 0.3 * s} y2={y} stroke="#c9b994" strokeWidth={2 * s} />
    <line x1={x + w * 0.7 * s} y1={y - w * 0.6 * s} x2={x + w * 0.7 * s} y2={y} stroke="#c9b994" strokeWidth={2 * s} />
  </g>
);

// Coin stack.
export const Coins = ({ x, y, s, n }: { x: number; y: number; s: number; n: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => <ellipse key={i} cx={x} cy={y - i * 5 * s} rx={16 * s} ry={5 * s} fill={GOLD} stroke={PAL.ink} strokeWidth={1 * s} />)}
  </g>
);

// Redwood trunk (tall, narrow canopy).
export const Redwood = ({ x, y, h, s }: { x: number; y: number; h: number; s: number }) => (
  <g>
    <rect x={x - h * 0.025} y={y - h * 0.5} width={h * 0.05} height={h * 0.5} fill="#7a3a22" stroke={PAL.ink} strokeWidth={1 * s} />
    <path d={`M${x} ${y - h} L${x + h * 0.14} ${y - h * 0.35} L${x - h * 0.14} ${y - h * 0.35} Z`} fill="#2f4a32" stroke={PAL.ink} strokeWidth={1 * s} strokeOpacity={0.6} />
  </g>
);

// Snowy sledge train: a covered sledge pulled by a small horse, bobbing along.
export const Sledge = ({ x, y, s, phase = 0 }: { x: number; y: number; s: number; phase?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.3 + phase;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* horse */}
      <g transform={`translate(70,${-Math.abs(Math.sin(t)) * 2})`}>
        <ellipse cx={0} cy={-34} rx={26} ry={12} fill="#4a3322" stroke={PAL.ink} strokeWidth={1.6} />
        <path d="M20 -40 L34 -58 L42 -56 L32 -36 Z" fill="#4a3322" stroke={PAL.ink} strokeWidth={1.4} />
        {[-18, -8, 10, 20].map((lx, i) => <line key={i} x1={lx} y1={-26} x2={lx + Math.sin(t + i * 1.6) * 6} y2={0} stroke="#3a2a1c" strokeWidth={4} strokeLinecap="round" />)}
        <path d="M-26 -36 q-10 6 -8 18" stroke="#2a1c12" strokeWidth={4} fill="none" />
      </g>
      <line x1={10} y1={-24} x2={48} y2={-34} stroke="#3a2a1c" strokeWidth={2} />
      {/* sledge */}
      <path d="M-60 0 L30 0 Q40 0 42 -8" stroke="#3a2a1c" strokeWidth={3} fill="none" />
      <path d="M-56 -6 L20 -6 L18 -46 Q-18 -64 -54 -46 Z" fill="#7a6a4a" stroke={PAL.ink} strokeWidth={1.6} />
      <path d="M-56 -46 Q-18 -60 18 -46" fill="none" stroke="#eef3f8" strokeWidth={5} opacity={0.8} />
    </g>
  );
};

// ---- chapter 1 panels ----

// Two shores across the strait: Chukotka hills left, Alaska hills right, ice floes and gulls.
export const StraitPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="strait" anchor={anchor} start={start} end={end} sky={["#7d93ad", "#dfe6ec"]}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.6;
        return (
          <g>
            <Glow x={g.x + g.W * 0.5} y={g.y + 60 * g.s} s={g.s * 0.6} color="#fff2cf" core="#fffaf0" />
            <g transform={`translate(${pan * 0.2},0)`}>
              <path d={`M${g.x - 40 * g.s} ${sea} L${g.x - 40 * g.s} ${sea - 90 * g.s} Q${g.x + g.W * 0.12} ${sea - 120 * g.s} ${g.x + g.W * 0.3} ${sea - 40 * g.s} L${g.x + g.W * 0.36} ${sea} Z`} fill="#8d9a8a" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.6} />
              <path d={`M${g.x + g.W + 40 * g.s} ${sea} L${g.x + g.W + 40 * g.s} ${sea - 70 * g.s} Q${g.x + g.W * 0.86} ${sea - 100 * g.s} ${g.x + g.W * 0.7} ${sea - 30 * g.s} L${g.x + g.W * 0.64} ${sea} Z`} fill="#9aa88f" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.6} />
              <path d={`M${g.x + g.W * 0.04} ${sea - 96 * g.s} q${40 * g.s} -${16 * g.s} ${80 * g.s} 0`} stroke="#eef3f8" strokeWidth={6 * g.s} fill="none" />
            </g>
            <Mist g={g} y={sea - 20 * g.s} k={0.3} />
            <Sea g={g} y={sea} shift={pan} color="#46667c" />
            {/* drifting ice floes, mid layer */}
            <g transform={`translate(${pan * 0.8 + ((frame - start) * 0.4 * g.s)},0)`}>
              {[0.15, 0.42, 0.7].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx} ${sea + (30 + i * 18) * g.s} l${40 * g.s} -${8 * g.s} l${36 * g.s} ${6 * g.s} l-${20 * g.s} ${10 * g.s} Z`} fill="#eef3f8" stroke={PAL.ink} strokeWidth={1 * g.s} strokeOpacity={0.5} />)}
            </g>
            {/* gulls */}
            {[0, 1, 2].map((i) => {
              const gx = g.x + ((frame - start) * (1.2 + i * 0.3) * g.s + i * 260 * g.s) % g.W;
              const gy = g.y + (70 + i * 30) * g.s + Math.sin(frame * 0.1 + i) * 8 * g.s;
              const w = Math.sin(frame * 0.4 + i) * 6 * g.s;
              return <path key={i} d={`M${gx - 14 * g.s} ${gy + w} Q${gx - 6 * g.s} ${gy - 6 * g.s} ${gx} ${gy} Q${gx + 6 * g.s} ${gy - 6 * g.s} ${gx + 14 * g.s} ${gy + w}`} fill="none" stroke={PAL.ink} strokeWidth={2 * g.s} />;
            })}
            <text x={g.x + g.W * 0.12} y={sea - 130 * g.s} fontSize={22 * g.s} fontWeight={700} fill="#fff" stroke={PAL.ink} strokeWidth={4 * g.s} paintOrder="stroke" fontFamily="Inter, sans-serif">ASIA</text>
            <text x={g.x + g.W * 0.78} y={sea - 110 * g.s} fontSize={22 * g.s} fontWeight={700} fill="#fff" stroke={PAL.ink} strokeWidth={4 * g.s} paintOrder="stroke" fontFamily="Inter, sans-serif">AMERICA</text>
            {/* near foreground floe, fastest */}
            <g transform={`translate(${pan * 1.6},0)`}>
              <path d={`M${g.x - 30 * g.s} ${g.y + g.H} l${60 * g.s} -${34 * g.s} l${150 * g.s} -${6 * g.s} l${60 * g.s} ${40 * g.s} Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.5} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// An umiak with Yupik paddlers crossing the strait between the two coasts.
export const UmiakPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="umiak" anchor={anchor} start={start} end={end} sky={["#5e7593", "#d6dee6"]}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.58;
        const bx = g.x + interpolate(frame, [start, end], [g.W * 0.2, g.W * 0.55], clamp);
        return (
          <g>
            <Ridge g={g} base={sea} amp={30 * g.s} seed={4} color="#9aa7b4" shift={pan * 0.2} />
            <Mist g={g} y={sea - 10 * g.s} k={0.4} />
            <Sea g={g} y={sea} shift={pan} color="#3f5f74" />
            <Kayak x={bx} y={sea + 70 * g.s} s={g.s * 1.5} crew={3} />
            <Kayak x={bx - 260 * g.s} y={sea + 40 * g.s} s={g.s * 1.0} crew={1} phase={2} />
            <g transform={`translate(${pan * 1.6},0)`}>
              <path d={`M${g.x + g.W * 0.7} ${g.y + g.H} l${50 * g.s} -${30 * g.s} l${120 * g.s} -${4 * g.s} l${60 * g.s} ${34 * g.s} Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.5} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Big and Little Diomede across a narrow channel, one flag on each.
export const DiomedePanel = ({ start, end, anchor, village = false }: { start: number; end: number; anchor: number[]; village?: boolean }) => (
  <Scene id={village ? "diomede2" : "diomede"} anchor={anchor} start={start} end={end} sky={village ? ["#a9b4c2", "#eef0f0"] : ["#6f839c", "#d8dfe5"]}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.64;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            <path d={`M${g.x - 60 * g.s} ${sea} L${g.x + g.W * 0.05} ${sea - 140 * g.s} L${g.x + g.W * 0.32} ${sea - 150 * g.s} L${g.x + g.W * 0.44} ${sea} Z`} fill="#7a7d72" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <Flag x={g.x + g.W * 0.2} y={sea - 146 * g.s} s={g.s * 0.8} h={70} stripes={RU_FLAG} w={52} />
          </g>
          <g transform={`translate(${pan * 0.5},0)`}>
            <path d={`M${g.x + g.W * 0.58} ${sea} L${g.x + g.W * 0.66} ${sea - 96 * g.s} L${g.x + g.W * 0.86} ${sea - 104 * g.s} L${g.x + g.W + 40 * g.s} ${sea} Z`} fill="#8a8d80" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <Flag x={g.x + g.W * 0.76} y={sea - 100 * g.s} s={g.s * 0.8} h={70} stripes={US_FLAG} canton w={52} />
            {village && [0.64, 0.7, 0.76, 0.83].map((fx, i) => (
              <g key={i}>
                <line x1={g.x + g.W * fx} y1={sea - (8 + i * 6) * g.s} x2={g.x + g.W * fx} y2={sea - (30 + i * 6) * g.s} stroke="#3a2a1c" strokeWidth={2 * g.s} />
                <rect x={g.x + g.W * fx - 16 * g.s} y={sea - (52 + i * 6) * g.s} width={34 * g.s} height={22 * g.s} fill={["#b54a3a", "#c9b994", "#5a7a9a", "#d9a93a"][i]} stroke={PAL.ink} strokeWidth={1.2 * g.s} />
              </g>
            ))}
          </g>
          <Mist g={g} y={sea - 4 * g.s} k={0.3} />
          <Sea g={g} y={sea} shift={pan} color="#3f5f74" />
          {village && <Fighter x={g.x + g.W * 0.62} y={sea - 6 * g.s} scale={g.sc * 0.5} mode="stand" costume={C.aleut} weapon="none" />}
          <g transform={`translate(${pan * 1.6},0)`}>
            <path d={`M${g.x + g.W * 0.05} ${g.y + g.H} l${40 * g.s} -${22 * g.s} l${110 * g.s} -${2 * g.s} l${40 * g.s} ${24 * g.s} Z`} fill="#f4f8fb" stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.5} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Bering's ship in the fog, 1741.
export const FogShipPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="fogship" anchor={anchor} start={start} end={end} sky={["#6a7684", "#c3cad0"]} accent={GOLD}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.64;
        return (
          <g>
            <Mist g={g} y={g.y + 80 * g.s} k={0.5} color="#dfe4e8" />
            <Sea g={g} y={sea} shift={pan} color="#4b5f6c" />
            <Ship x={g.x + g.W * 0.45 + interpolate(frame, [start, end], [-30, 40], clamp) * g.s} y={sea + 22 * g.s} s={g.s} scale={1.25} flag={["#f4f1ea", "#f4f1ea", "#2a52be"]} />
            <Mist g={g} y={sea - 30 * g.s} k={0.45} color="#e6eaee" />
            <g transform={`translate(${pan * 1.6},0)`}>
              <Mist g={g} y={g.y + g.H - 20 * g.s} k={0.5} color="#eef1f3" />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Landfall: the ship anchored off a snowy mountain coast, a longboat rowing in.
export const LandfallPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="landfall" anchor={anchor} start={start} end={end} sky={["#7e9bbd", "#eef0ee"]} accent={GOLD}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.62;
        const row = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <g transform={`translate(${pan * 0.2},0)`}>
              <path d={`M${g.x + g.W * 0.35} ${sea} L${g.x + g.W * 0.62} ${g.y + 40 * g.s} L${g.x + g.W * 0.9} ${sea} Z`} fill="#9aa6b8" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.6} />
              <path d={`M${g.x + g.W * 0.53} ${g.y + 100 * g.s} L${g.x + g.W * 0.62} ${g.y + 40 * g.s} L${g.x + g.W * 0.71} ${g.y + 100 * g.s} Q${g.x + g.W * 0.62} ${g.y + 90 * g.s} ${g.x + g.W * 0.53} ${g.y + 100 * g.s} Z`} fill="#f4f8fb" />
            </g>
            <Ridge g={g} base={sea} amp={26 * g.s} seed={6} color="#4f6a52" shift={pan * 0.5} />
            <Sea g={g} y={sea} shift={pan} color="#41637a" />
            <Ship x={g.x + g.W * 0.2} y={sea + 30 * g.s} s={g.s} scale={0.95} flag={["#f4f1ea", "#f4f1ea", "#2a52be"]} />
            {/* longboat */}
            <g transform={`translate(${g.x + g.W * (0.35 + row * 0.25)},${sea + 64 * g.s}) scale(${g.s})`}>
              <path d="M-50 0 L50 0 L40 14 L-42 14 Z" fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.6} />
              {[-24, 0, 24].map((ox, i) => (
                <g key={i}>
                  <circle cx={ox} cy={-14} r={7} fill="#e0b08a" stroke={PAL.ink} strokeWidth={1.2} />
                  <rect x={ox - 7} y={-8} width={14} height={10} fill="#2a3550" />
                  <line x1={ox} y1={0} x2={ox - 22 + Math.sin(frame * 0.2 + i) * 10} y2={20} stroke="#5a3a1f" strokeWidth={3} />
                </g>
              ))}
            </g>
            <g transform={`translate(${pan * 1.6},0)`}>
              <path d={`M${g.x + g.W * 0.75} ${g.y + g.H} Q${g.x + g.W * 0.85} ${g.y + g.H - 40 * g.s} ${g.x + g.W + 40 * g.s} ${g.y + g.H - 50 * g.s} L${g.x + g.W + 40 * g.s} ${g.y + g.H} Z`} fill="#6b5a44" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              <Pine x={g.x + g.W * 0.95} y={g.y + g.H + 10 * g.s} h={180 * g.s} color="#1f3a2e" snow={false} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Sea otters floating in kelp, coast behind.
export const OtterPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="otter" anchor={anchor} start={start} end={end} sky={["#86a3bf", "#e8ecea"]} accent={GOLD}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.5;
      return (
        <g>
          <Ridge g={g} base={sea} amp={40 * g.s} seed={9} color="#5a7262" shift={pan * 0.2} />
          <Sea g={g} y={sea} shift={pan} color="#3d6a72" />
          {/* kelp fronds */}
          <g transform={`translate(${pan * 0.6},0)`}>
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${g.x + i * 100 * g.s} ${sea + (40 + (i % 3) * 30) * g.s} q${20 * g.s} -${6 * g.s} ${40 * g.s} 0 q${20 * g.s} ${6 * g.s} ${40 * g.s} 0`} stroke="#6b6a2a" strokeWidth={5 * g.s} fill="none" />)}
          </g>
          <Otter x={g.x + g.W * 0.3} y={sea + 80 * g.s} s={g.s * 1.6} />
          <Otter x={g.x + g.W * 0.62} y={sea + 110 * g.s} s={g.s * 1.9} phase={2} flip />
          <Otter x={g.x + g.W * 0.82} y={sea + 50 * g.s} s={g.s * 1.1} phase={4} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <path d={`M${g.x - 40 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.1} ${g.y + g.H - 50 * g.s} ${g.x + g.W * 0.22} ${g.y + g.H} Z`} fill="#4a4a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// A fur market at Kyakhta: a Chinese merchant counting coins, a Russian trader with pelts.
export const MarketPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="market" anchor={anchor} start={start} end={end} sky={["#c8a46a", "#f2e2b8"]} accent={GOLD} warm={0.1}>
    {(g, pan) => {
      const ground = g.y + g.H * 0.68;
      return (
        <g>
          <Ridge g={g} base={ground - 30 * g.s} amp={30 * g.s} seed={12} color="#b08a5a" shift={pan * 0.2} />
          <g transform={`translate(${pan * 0.5},0)`}>
            {[0.1, 0.5, 0.82].map((fx, i) => (
              <g key={i}>
                <rect x={g.x + g.W * fx - 60 * g.s} y={ground - 90 * g.s} width={120 * g.s} height={90 * g.s} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <path d={`M${g.x + g.W * fx - 76 * g.s} ${ground - 90 * g.s} Q${g.x + g.W * fx} ${ground - 118 * g.s} ${g.x + g.W * fx + 76 * g.s} ${ground - 90 * g.s} Z`} fill="#2a3a2a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              </g>
            ))}
          </g>
          <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#a8875a" />
          <g transform={`translate(${pan * 0.7},0)`}>
            <rect x={g.cx - 110 * g.s} y={ground - 10 * g.s} width={220 * g.s} height={40 * g.s} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <Bale x={g.cx - 100 * g.s} y={ground - 10 * g.s} s={g.s} w={50} />
            <Bale x={g.cx - 46 * g.s} y={ground - 10 * g.s} s={g.s} w={44} />
            <Coins x={g.cx + 60 * g.s} y={ground - 12 * g.s} s={g.s} n={6} />
            <Coins x={g.cx + 92 * g.s} y={ground - 12 * g.s} s={g.s} n={4} />
          </g>
          <Fighter x={g.cx - 170 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" costume={C.trader} weapon="none" />
          <Fighter x={g.cx + 170 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" flip costume={C.merchant} weapon="none" phase={2} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <Bale x={g.x + 20 * g.s} y={g.y + g.H + 10 * g.s} s={g.s * 1.6} w={60} />
            <Bale x={g.x + g.W - 120 * g.s} y={g.y + g.H + 14 * g.s} s={g.s * 1.6} w={60} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Traders loading a ship at a wooden quay (Okhotsk), crates and pelts.
export const QuayPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="quay" anchor={anchor} start={start} end={end} sky={["#8394a6", "#e3e5e2"]}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.6;
        return (
          <g>
            <Ridge g={g} base={sea} amp={30 * g.s} seed={14} color="#8a9aa0" shift={pan * 0.2} />
            <Sea g={g} y={sea} shift={pan} color="#41637a" />
            <Ship x={g.x + g.W * 0.62} y={sea + 30 * g.s} s={g.s} scale={1.05} />
            <g transform={`translate(${pan * 0.7},0)`}>
              <rect x={g.x - 20 * g.s} y={sea + 30 * g.s} width={g.W * 0.45} height={16 * g.s} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              {Array.from({ length: 6 }, (_, i) => <rect key={i} x={g.x + i * 70 * g.s} y={sea + 46 * g.s} width={8 * g.s} height={60 * g.s} fill="#4a3322" />)}
              <Bale x={g.x + 40 * g.s} y={sea + 30 * g.s} s={g.s} w={46} />
              <Bale x={g.x + 100 * g.s} y={sea + 30 * g.s} s={g.s} w={40} />
            </g>
            {[0, 1, 2].map((i) => {
              const p = ((frame - start) * 0.004 + i * 0.33) % 1;
              return <Fighter key={i} x={g.x + g.W * (0.08 + p * 0.3)} y={sea + 30 * g.s} scale={g.sc * 0.6} mode="walk" costume={C.trader} weapon="none" phase={i} />;
            })}
            <g transform={`translate(${pan * 1.6},0)`}>
              <Bale x={g.x + g.W * 0.82} y={g.y + g.H + 10 * g.s} s={g.s * 1.8} w={60} />
              <rect x={g.x + g.W * 0.92} y={g.y + g.H - 90 * g.s} width={14 * g.s} height={100 * g.s} fill="#3a2a1c" />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Hunting boats along the Aleutians: a volcano steaming, baidarkas in the swell.
export const AleutianPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="aleutian" anchor={anchor} start={start} end={end} sky={["#7088a4", "#d9dfe4"]}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.62;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            <Volcano x={g.x + g.W * 0.3} y={sea} h={150 * g.s} s={g.s} />
            <Volcano x={g.x + g.W * 0.78} y={sea} h={100 * g.s} s={g.s} color="#8d98b8" />
          </g>
          <Mist g={g} y={sea - 20 * g.s} k={0.35} />
          <Sea g={g} y={sea} shift={pan} color="#3a5b70" />
          <Kayak x={g.x + g.W * 0.25} y={sea + 50 * g.s} s={g.s * 1.1} crew={2} />
          <Kayak x={g.x + g.W * 0.55} y={sea + 80 * g.s} s={g.s * 1.4} crew={2} phase={1.5} />
          <Ship x={g.x + g.W * 0.85} y={sea + 26 * g.s} s={g.s} scale={0.6} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <path d={`M${g.x - 40 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.12} ${g.y + g.H - 36 * g.s} ${g.x + g.W * 0.3} ${g.y + g.H} Z`} fill="#3a3a32" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Grass g={g} color="#4a5a3a" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// An Aleut village: sod houses, kayaks on racks, people at the shore.
export const VillagePanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="village" anchor={anchor} start={start} end={end} sky={["#8ea3b8", "#e6e9e4"]}>
    {(g, pan) => {
      const land = g.y + g.H * 0.6;
      return (
        <g>
          <Ridge g={g} base={land - 20 * g.s} amp={40 * g.s} seed={21} color="#7d8e7a" shift={pan * 0.2} />
          <Sea g={g} y={land - 20 * g.s} shift={pan * 0.4} color="#46667c" />
          <g transform={`translate(${pan * 0.5},0)`}>
            <path d={`M${g.x - 40 * g.s} ${land} Q${g.cx} ${land - 30 * g.s} ${g.x + g.W + 40 * g.s} ${land} L${g.x + g.W + 40 * g.s} ${g.y + g.H} L${g.x - 40 * g.s} ${g.y + g.H} Z`} fill="#7a8a5a" stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.5} />
            <Barabara x={g.x + g.W * 0.12} y={land} w={120 * g.s} s={g.s} />
            <Barabara x={g.x + g.W * 0.62} y={land + 4 * g.s} w={140 * g.s} s={g.s} />
            {/* kayak rack */}
            <line x1={g.x + g.W * 0.38} y1={land + 10 * g.s} x2={g.x + g.W * 0.38} y2={land - 40 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
            <line x1={g.x + g.W * 0.52} y1={land + 10 * g.s} x2={g.x + g.W * 0.52} y2={land - 40 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
            <path d={`M${g.x + g.W * 0.33} ${land - 40 * g.s} Q${g.x + g.W * 0.45} ${land - 32 * g.s} ${g.x + g.W * 0.57} ${land - 44 * g.s} Q${g.x + g.W * 0.45} ${land - 38 * g.s} ${g.x + g.W * 0.33} ${land - 40 * g.s} Z`} fill="#a88a5a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
          {[0.3, 0.48, 0.86].map((fx, i) => <Fighter key={i} x={g.x + g.W * fx} y={g.ground} scale={g.sc * (0.8 + i * 0.05)} mode="stand" flip={i === 2} costume={C.aleut} weapon="none" phase={i * 1.7} />)}
          <g transform={`translate(${pan * 1.6},0)`}>
            <Grass g={g} color="#5a6a3a" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Forced to hunt: kayaks heading out while a company ship waits offshore with an overseer at the rail.
export const ForcedPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="forced" anchor={anchor} start={start} end={end} sky={["#56677d", "#bfc6cc"]} warm={0.02}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.55;
        return (
          <g>
            <Ridge g={g} base={sea} amp={28 * g.s} seed={25} color="#6c7a86" shift={pan * 0.2} />
            <Sea g={g} y={sea} shift={pan} color="#36556a" />
            <Ship x={g.x + g.W * 0.75} y={sea + 24 * g.s} s={g.s} scale={0.85} />
            <Fighter x={g.x + g.W * 0.72} y={sea + 8 * g.s} scale={g.sc * 0.38} mode="stand" flip costume={C.trader} weapon="rifle" />
            {[0, 1, 2, 3].map((i) => <Kayak key={i} x={g.x + g.W * (0.08 + i * 0.13) + (frame - start) * 0.5 * g.s} y={sea + (50 + (i % 2) * 34) * g.s} s={g.s * (1 + (i % 2) * 0.3)} crew={1} phase={i} flip />)}
            <g transform={`translate(${pan * 1.6},0)`}>
              <path d={`M${g.x - 40 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.15} ${g.y + g.H - 44 * g.s} ${g.x + g.W * 0.34} ${g.y + g.H} Z`} fill="#3a3a32" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Tlingit warriors in carved wooden armour face the Russian palisade: a standoff, no fighting.
export const StandoffPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="standoff" anchor={anchor} start={start} end={end} sky={["#4a5a6a", "#b8b0a0"]} warm={0.04}>
    {(g, pan) => {
      const land = g.y + g.H * 0.62;
      return (
        <g>
          <Ridge g={g} base={land - 10 * g.s} amp={50 * g.s} seed={27} color="#3f5a4a" shift={pan * 0.2} />
          <g transform={`translate(${pan * 0.5},0)`}>
            {Array.from({ length: 10 }, (_, i) => <Pine key={i} x={g.x + i * 110 * g.s} y={land + 6 * g.s} h={(90 + (i % 3) * 20) * g.s} color="#2c4a3c" snow={false} />)}
          </g>
          <rect x={g.x} y={land} width={g.W} height={g.H} fill="#5a6a44" />
          <g transform={`translate(${pan * 0.7},0)`}>
            <Palisade x0={g.x + g.W * 0.62} x1={g.x + g.W + 40 * g.s} y={land + 30 * g.s} h={80 * g.s} s={g.s} />
            <Flag x={g.x + g.W * 0.8} y={land - 50 * g.s} s={g.s * 0.8} h={70} stripes={RU_FLAG} w={50} />
          </g>
          {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.14 + i * 0.12)} y={g.ground - (i % 2) * 8 * g.s} scale={g.sc * 0.85} mode="stand" costume={C.tlingit} weapon="spear" phase={i} />)}
          {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.56 - i * 0.06)} y={g.ground - i * 6 * g.s} scale={g.sc * 0.8} mode="stand" flip costume={C.trader} weapon="rifle" phase={i + 3} />)}
          <g transform={`translate(${pan * 1.6},0)`}>
            <Grass g={g} color="#3f4a2e" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// The company warehouse: bales of fur, a clerk stamping a ledger.
export const WarehousePanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  const stamp = Math.max(0, Math.sin((frame - start) * 0.12));
  return (
    <Scene id="warehouse" anchor={anchor} start={start} end={end} sky={["#3a2a1c", "#6b4a2e"]} accent={GOLD} warm={0.1}>
      {(g, pan) => {
        const floor = g.y + g.H * 0.7;
        return (
          <g>
            {/* back wall planks + window light */}
            <g transform={`translate(${pan * 0.2},0)`}>
              {Array.from({ length: 16 }, (_, i) => <line key={i} x1={g.x + i * 70 * g.s} y1={g.y} x2={g.x + i * 70 * g.s} y2={floor} stroke="#2a1c12" strokeWidth={2 * g.s} />)}
              <rect x={g.x + g.W * 0.7} y={g.y + 40 * g.s} width={90 * g.s} height={70 * g.s} fill="#ffe3a8" opacity={0.85} />
              <path d={`M${g.x + g.W * 0.7} ${g.y + 110 * g.s} L${g.x + g.W * 0.5} ${floor} L${g.x + g.W * 0.75} ${floor} L${g.x + g.W * 0.7 + 90 * g.s} ${g.y + 110 * g.s} Z`} fill="#ffe3a8" opacity={0.12} />
            </g>
            <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#4a3322" />
            <g transform={`translate(${pan * 0.6},0)`}>
              {Array.from({ length: 7 }, (_, i) => <Bale key={i} x={g.x + 20 * g.s + (i % 4) * 56 * g.s} y={floor - Math.floor(i / 4) * 30 * g.s} s={g.s} w={52} />)}
              <rect x={g.cx + 40 * g.s} y={floor - 50 * g.s} width={160 * g.s} height={50 * g.s} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <rect x={g.cx + 70 * g.s} y={floor - 58 * g.s} width={80 * g.s} height={10 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />
            </g>
            <Fighter x={g.cx + 120 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" flip costume={C.clerk} weapon="none" />
            <rect x={g.cx + 96 * g.s} y={floor - 90 * g.s + stamp * 26 * g.s} width={16 * g.s} height={24 * g.s} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1 * g.s} />
            <g transform={`translate(${pan * 1.6},0)`}>
              <Bale x={g.x + g.W - 130 * g.s} y={g.y + g.H + 6 * g.s} s={g.s * 1.8} w={60} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Company ships at anchor flying the company colours, a harbour busy at dusk.
export const FleetPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="fleet" anchor={anchor} start={start} end={end} sky={["#3a3f6a", "#f0a96a"]} accent={GOLD}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.6;
      return (
        <g>
          <Glow x={g.x + g.W * 0.2} y={sea - 20 * g.s} s={g.s * 0.8} color="#ffb35a" core="#ffe3a8" />
          <Ridge g={g} base={sea} amp={34 * g.s} seed={31} color="#3a3550" shift={pan * 0.2} />
          <Sea g={g} y={sea} shift={pan} color="#4a4a6a" crest="#f0c48a" />
          <Ship x={g.x + g.W * 0.3} y={sea + 30 * g.s} s={g.s} scale={0.9} />
          <Ship x={g.x + g.W * 0.62} y={sea + 50 * g.s} s={g.s} scale={1.15} phase={2} />
          <Ship x={g.x + g.W * 0.88} y={sea + 22 * g.s} s={g.s} scale={0.6} phase={4} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <rect x={g.x - 20 * g.s} y={g.y + g.H - 30 * g.s} width={g.W * 0.4} height={30 * g.s} fill="#3a2a1c" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Bale x={g.x + 40 * g.s} y={g.y + g.H - 30 * g.s} s={g.s * 1.4} w={50} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Sitka from the water: Baranov's castle on the hill, the church, the town.
export const SitkaTownPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="sitkatown" anchor={anchor} start={start} end={end} sky={["#6f88a6", "#e0e4e2"]}>
    {(g, pan) => {
      const shore = g.y + g.H * 0.62;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            <path d={`M${g.x + g.W * 0.5} ${shore} L${g.x + g.W * 0.72} ${g.y + 30 * g.s} L${g.x + g.W * 0.96} ${shore} Z`} fill="#8796a8" stroke={PAL.ink} strokeWidth={1.4 * g.s} strokeOpacity={0.6} />
            <path d={`M${g.x + g.W * 0.64} ${g.y + 70 * g.s} L${g.x + g.W * 0.72} ${g.y + 30 * g.s} L${g.x + g.W * 0.8} ${g.y + 70 * g.s} Z`} fill="#f4f8fb" />
          </g>
          <Ridge g={g} base={shore} amp={30 * g.s} seed={33} color="#3f5a46" shift={pan * 0.45} />
          <g transform={`translate(${pan * 0.6},0)`}>
            {/* castle hill */}
            <path d={`M${g.x + g.W * 0.08} ${shore} Q${g.x + g.W * 0.2} ${shore - 60 * g.s} ${g.x + g.W * 0.34} ${shore} Z`} fill="#4f6a52" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
            <rect x={g.x + g.W * 0.15} y={shore - 92 * g.s} width={90 * g.s} height={44 * g.s} fill="#c9b994" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <path d={`M${g.x + g.W * 0.15 - 6 * g.s} ${shore - 92 * g.s} L${g.x + g.W * 0.15 + 45 * g.s} ${shore - 112 * g.s} L${g.x + g.W * 0.15 + 96 * g.s} ${shore - 92 * g.s} Z`} fill="#6b3a2a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <OnionChurch x={g.x + g.W * 0.5} y={shore + 12 * g.s} s={g.s * 0.8} />
            <LogHouse x={g.x + g.W * 0.6} y={shore + 14 * g.s} w={70 * g.s} h={36 * g.s} s={g.s} />
            <LogHouse x={g.x + g.W * 0.74} y={shore + 14 * g.s} w={60 * g.s} h={32 * g.s} s={g.s} />
            <LogHouse x={g.x + g.W * 0.36} y={shore + 14 * g.s} w={56 * g.s} h={30 * g.s} s={g.s} />
          </g>
          <Sea g={g} y={shore + 14 * g.s} shift={pan} color="#3e6176" />
          <Ship x={g.x + g.W * 0.85} y={shore + 60 * g.s} s={g.s} scale={0.8} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <Kayak x={g.x + g.W * 0.2} y={g.y + g.H - 20 * g.s} s={g.s * 1.6} crew={2} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// The Sitka shipyard: a hull on the slip, carpenters hammering (each blow on its frame).
export const ShipyardPanel = ({ start, end, anchor, blows }: { start: number; end: number; anchor: number[]; blows: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="shipyard" anchor={anchor} start={start} end={end} sky={["#7a8da4", "#e2e2dc"]}>
      {(g, pan) => {
        const yard = g.y + g.H * 0.66;
        return (
          <g>
            <Ridge g={g} base={yard - 20 * g.s} amp={50 * g.s} seed={37} color="#3f5a46" shift={pan * 0.2} />
            <Sea g={g} y={yard - 20 * g.s} shift={pan * 0.3} color="#3e6176" />
            <rect x={g.x} y={yard} width={g.W} height={g.H} fill="#7a6a4a" />
            <g transform={`translate(${pan * 0.6},0)`}>
              {/* hull ribs on the slip */}
              <path d={`M${g.cx - 220 * g.s} ${yard - 10 * g.s} Q${g.cx} ${yard + 30 * g.s} ${g.cx + 240 * g.s} ${yard - 30 * g.s}`} stroke="#4a3322" strokeWidth={10 * g.s} fill="none" />
              {Array.from({ length: 11 }, (_, i) => {
                const x = g.cx - 200 * g.s + i * 42 * g.s;
                return <path key={i} d={`M${x} ${yard - 2 * g.s} q${-30 * g.s} ${-50 * g.s} ${-10 * g.s} ${-110 * g.s}`} stroke="#6b4a2e" strokeWidth={6 * g.s} fill="none" />;
              })}
              <path d={`M${g.cx - 230 * g.s} ${yard - 70 * g.s} L${g.cx + 50 * g.s} ${yard - 76 * g.s}`} stroke="#8a6a4a" strokeWidth={8 * g.s} />
            </g>
            {[0, 1, 2].map((i) => {
              const hit = blows.filter((b) => frame >= b - 6 && frame < b + 4).length > 0 && i === 1;
              return <Fighter key={i} x={g.cx + (-160 + i * 150) * g.s} y={g.ground} scale={g.sc * 0.8} mode={hit || i === 0 ? "attack" : "stand"} costume={C.clerk} weapon="none" phase={i * 2} />;
            })}
            <g transform={`translate(${pan * 1.6},0)`}>
              {Array.from({ length: 4 }, (_, i) => <rect key={i} x={g.x + g.W * 0.75 + i * 40 * g.s} y={g.y + g.H - (18 + (i % 2) * 14) * g.s} width={120 * g.s} height={14 * g.s} fill="#8a6a4a" stroke={PAL.ink} strokeWidth={1.2 * g.s} transform={`rotate(-4,${g.x + g.W * 0.75},${g.y + g.H})`} />)}
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// Fort Ross on its cliff over the Pacific: redwoods, the stockade, a blockhouse, a little chapel.
export const FortRossPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="fortross" anchor={anchor} start={start} end={end} sky={["#8fb3d6", "#f1ead6"]} warm={0.08}>
    {(g, pan) => {
      const cliff = g.y + g.H * 0.6;
      return (
        <g>
          <Glow x={g.x + g.W * 0.85} y={g.y + 60 * g.s} s={g.s * 0.7} />
          <g transform={`translate(${pan * 0.2},0)`}>
            {Array.from({ length: 8 }, (_, i) => <Redwood key={i} x={g.x + g.W * 0.45 + i * 70 * g.s} y={cliff - 10 * g.s} h={(150 + (i % 3) * 30) * g.s} s={g.s} />)}
          </g>
          <Sea g={g} y={cliff + 30 * g.s} shift={pan * 0.4} color="#3e7290" />
          <g transform={`translate(${pan * 0.55},0)`}>
            <path d={`M${g.x + g.W * 0.25} ${cliff + 30 * g.s} L${g.x + g.W * 0.3} ${cliff} L${g.x + g.W + 40 * g.s} ${cliff} L${g.x + g.W + 40 * g.s} ${g.y + g.H} L${g.x + g.W * 0.2} ${g.y + g.H} Z`} fill="#8a7a4a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Palisade x0={g.x + g.W * 0.36} x1={g.x + g.W * 0.84} y={cliff + 6 * g.s} h={44 * g.s} s={g.s} />
            {/* octagonal blockhouse */}
            <rect x={g.x + g.W * 0.36 - 20 * g.s} y={cliff - 70 * g.s} width={50 * g.s} height={76 * g.s} fill="#7a5233" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <path d={`M${g.x + g.W * 0.36 - 26 * g.s} ${cliff - 70 * g.s} L${g.x + g.W * 0.36 + 5 * g.s} ${cliff - 96 * g.s} L${g.x + g.W * 0.36 + 36 * g.s} ${cliff - 70 * g.s} Z`} fill="#4a3322" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <OnionChurch x={g.x + g.W * 0.62} y={cliff - 4 * g.s} s={g.s * 0.6} />
            <Flag x={g.x + g.W * 0.5} y={cliff - 4 * g.s} s={g.s * 0.8} h={110} stripes={RU_FLAG} w={52} />
          </g>
          <Fighter x={g.x + g.W * 0.72} y={g.ground} scale={g.sc * 0.8} mode="walk" flip costume={C.trader} weapon="none" />
          <g transform={`translate(${pan * 1.6},0)`}>
            <Grass g={g} color="#6b6a2a" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Emptiness: one sentry on an endless tundra, a tiny settlement far off.
export const EmptyPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="empty" anchor={anchor} start={start} end={end} sky={["#8aa0b8", "#e9ece6"]}>
    {(g, pan) => {
      const land = g.y + g.H * 0.58;
      return (
        <g>
          <Ridge g={g} base={land} amp={18 * g.s} seed={41} color="#a9b6c6" shift={pan * 0.2} />
          <SnowGround g={g} y={land} shift={pan * 0.5} color="#dfe5d8" shade="#a8b29a" />
          <g transform={`translate(${pan * 0.5},0)`}>
            <LogHouse x={g.x + g.W * 0.8} y={land + 8 * g.s} w={22 * g.s} h={12 * g.s} s={g.s * 0.4} />
          </g>
          <Fighter x={g.x + g.W * 0.3} y={g.ground - 20 * g.s} scale={g.sc * 0.55} mode="stand" costume={C.trader} weapon="rifle" />
          <g transform={`translate(${pan * 1.6},0)`}>
            <Grass g={g} color="#7a7a5a" />
          </g>
          <Snow g={g} n={14} depth={0.4} />
        </g>
      );
    }}
  </Scene>
);

// ---- chapter 2 panels ----

// The Tsar's council in a palace hall: ministers around a long table under chandeliers.
export const CouncilPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="council" anchor={anchor} start={start} end={end} sky={["#3a2f2a", "#7a5a3a"]} accent={GOLD} warm={0.1}>
    {(g, pan) => {
      const floor = g.y + g.H * 0.7;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((fx, i) => (
              <g key={i}>
                <rect x={g.x + g.W * fx - 24 * g.s} y={g.y + 30 * g.s} width={48 * g.s} height={120 * g.s} rx={24 * g.s} fill="#c9a86a" opacity={0.7} />
                <rect x={g.x + g.W * fx - 6 * g.s} y={g.y} width={12 * g.s} height={floor - g.y} fill="#e8d4a0" opacity={0.25} />
              </g>
            ))}
            {[0.25, 0.65].map((fx, i) => <Glow key={i} x={g.x + g.W * fx} y={g.y + 30 * g.s} s={g.s * 0.5} color="#ffd38a" core="#fff1c8" />)}
          </g>
          <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#5a3a22" />
          <g transform={`translate(${pan * 0.6},0)`}>
            <rect x={g.cx - 280 * g.s} y={floor - 46 * g.s} width={560 * g.s} height={22 * g.s} fill="#7a3a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={g.cx - 280 * g.s} y={floor - 24 * g.s} width={560 * g.s} height={40 * g.s} fill="#2f4a32" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <rect x={g.cx - 60 * g.s} y={floor - 56 * g.s} width={120 * g.s} height={12 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * g.s} />
          </g>
          {[-220, -110, 110, 220].map((ox, i) => <Fighter key={i} x={g.cx + ox * g.s} y={floor - 20 * g.s} scale={g.sc * 0.62} mode="stand" flip={ox > 0} costume={C.noble} weapon="none" phase={i} />)}
          <g transform={`translate(${pan * 1.6},0)`}>
            <rect x={g.x - 20 * g.s} y={g.y + g.H - 60 * g.s} width={80 * g.s} height={60 * g.s} fill="#7a3a22" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <rect x={g.x + g.W - 60 * g.s} y={g.y + g.H - 60 * g.s} width={80 * g.s} height={60 * g.s} fill="#7a3a22" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// The otters are gone: a hunter in an empty sea, a nearly empty boat.
export const EmptySeaPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="emptysea" anchor={anchor} start={start} end={end} sky={["#5a6676", "#b8bec4"]} warm={0}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.55;
      return (
        <g>
          <Ridge g={g} base={sea} amp={22 * g.s} seed={45} color="#6a7480" shift={pan * 0.2} />
          <Mist g={g} y={sea - 10 * g.s} k={0.35} color="#c8ced4" />
          <Sea g={g} y={sea} shift={pan} color="#3a4a56" />
          <Kayak x={g.cx} y={sea + 80 * g.s} s={g.s * 1.7} crew={1} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <path d={`M${g.x + g.W * 0.72} ${g.y + g.H} Q${g.x + g.W * 0.86} ${g.y + g.H - 40 * g.s} ${g.x + g.W + 40 * g.s} ${g.y + g.H} Z`} fill="#2a2e34" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// The money machine running dry: a nearly empty warehouse, one bale, a clerk with an empty ledger.
export const DryPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="dry" anchor={anchor} start={start} end={end} sky={["#2a221c", "#4a3a2a"]} accent={GOLD} warm={0.05}>
    {(g, pan) => {
      const floor = g.y + g.H * 0.7;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            {Array.from({ length: 16 }, (_, i) => <line key={i} x1={g.x + i * 70 * g.s} y1={g.y} x2={g.x + i * 70 * g.s} y2={floor} stroke="#1a140f" strokeWidth={2 * g.s} />)}
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={g.x + 40 * g.s + i * 150 * g.s} y={g.y + 60 * g.s} width={110 * g.s} height={6 * g.s} fill="#2a1c12" />)}
          </g>
          <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#3a2a1c" />
          <g transform={`translate(${pan * 0.6},0)`}>
            <Bale x={g.cx - 30 * g.s} y={floor} s={g.s} w={44} />
            <Coins x={g.cx + 150 * g.s} y={floor - 2 * g.s} s={g.s} n={2} />
          </g>
          <Fighter x={g.cx + 220 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" flip costume={C.clerk} weapon="none" />
          <g transform={`translate(${pan * 1.6},0)`}>
            <rect x={g.x + 10 * g.s} y={g.y + g.H - 50 * g.s} width={140 * g.s} height={50 * g.s} fill="#5a3a22" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Months on the road: a sledge train crossing the snowy Siberian taiga.
export const SiberiaPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="siberia" anchor={anchor} start={start} end={end} sky={["#8b99ad", "#e6e9ec"]} warm={0.02}>
      {(g, pan) => {
        const road = g.y + g.H * 0.66;
        const move = (frame - start) * 1.1 * g.s;
        return (
          <g>
            <Ridge g={g} base={road - 30 * g.s} amp={30 * g.s} seed={51} color="#b6c0cc" shift={pan * 0.2} />
            <g transform={`translate(${pan * 0.5},0)`}>
              {Array.from({ length: 14 }, (_, i) => <Pine key={i} x={g.x + i * 76 * g.s} y={road - 10 * g.s} h={(70 + (i % 3) * 16) * g.s} color="#2c4a3c" />)}
            </g>
            <SnowGround g={g} y={road - 12 * g.s} shift={pan * 0.7} />
            <Sledge x={g.x + 80 * g.s + move} y={road + 40 * g.s} s={g.s * 1.1} />
            <Sledge x={g.x - 160 * g.s + move} y={road + 46 * g.s} s={g.s * 1.1} phase={2} />
            <Fighter x={g.x + 230 * g.s + move} y={road + 44 * g.s} scale={g.sc * 0.6} mode="walk" costume={C.trader} weapon="none" />
            <g transform={`translate(${pan * 1.6},0)`}>
              <Pine x={g.x + g.W * 0.9} y={g.y + g.H + 20 * g.s} h={220 * g.s} color="#16281f" />
            </g>
            <Snow g={g} n={30} depth={0.3} wind={1.4} />
            <Snow g={g} n={12} depth={0.9} wind={1.4} />
          </g>
        );
      }}
    </Scene>
  );
};

// A storm on the Sea of Okhotsk: a ship heeling in grey waves.
export const StormSeaPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="stormsea" anchor={anchor} start={start} end={end} sky={["#2c3540", "#7a858e"]} warm={0}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.58;
      return (
        <g>
          <Ridge g={g} base={sea + 10 * g.s} amp={40 * g.s} seed={55} color="#3a4a56" shift={pan * 0.3} />
          <Sea g={g} y={sea} shift={pan * 1.4} color="#2e3e4a" crest="#dfe6ec" />
          <g transform={`rotate(-6,${g.cx},${sea})`}>
            <Ship x={g.cx} y={sea + 40 * g.s} s={g.s} scale={1.2} />
          </g>
          <Ridge g={g} base={g.y + g.H + 6 * g.s} amp={34 * g.s} seed={57} color="#26343e" shift={pan * 1.6} />
          <Snow g={g} n={40} depth={0.6} wind={2.4} />
        </g>
      );
    }}
  </Scene>
);

// British redcoats under the Union Jack.
export const RedcoatPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="redcoat" anchor={anchor} start={start} end={end} sky={["#7d93ad", "#e6e2d4"]} accent="#ff8fb3">
    {(g, pan) => {
      const land = g.y + g.H * 0.64;
      return (
        <g>
          <Ridge g={g} base={land} amp={30 * g.s} seed={61} color="#7d9a6e" shift={pan * 0.2} />
          <rect x={g.x} y={land} width={g.W} height={g.H} fill="#6b8a52" />
          <g transform={`translate(${pan * 0.6},0)`}>
            <UnionJack x={g.x + g.W * 0.5} y={land + 20 * g.s} s={g.s} h={150} />
          </g>
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={g.x + g.W * (0.18 + i * 0.12)} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.78} mode="stand" costume={C.redcoat} weapon="rifle" phase={i} />)}
          <g transform={`translate(${pan * 1.6},0)`}>
            <Grass g={g} color="#3f5a2e" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Crimea: British and French guns firing on the forts of Sevastopol (smoke, no bodies).
export const CrimeaPanel = ({ start, end, anchor, shots }: { start: number; end: number; anchor: number[]; shots: number[] }) => {
  const frame = useCurrentFrame();
  const impact = impactAt(frame, shots, 10) * 0.55;
  return (
    <Scene id="crimea" anchor={anchor} start={start} end={end} sky={["#8a8a8a", "#e0d4bc"]} accent="#ff8fb3" impact={impact}>
      {(g, pan) => {
        const land = g.y + g.H * 0.64;
        return (
          <g>
            <g transform={`translate(${pan * 0.2},0)`}>
              <path d={`M${g.x + g.W * 0.6} ${land} L${g.x + g.W * 0.62} ${land - 60 * g.s} L${g.x + g.W * 0.98} ${land - 64 * g.s} L${g.x + g.W} ${land} Z`} fill="#b8a888" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              {Array.from({ length: 7 }, (_, i) => <rect key={i} x={g.x + g.W * 0.62 + i * 50 * g.s} y={land - 74 * g.s} width={24 * g.s} height={14 * g.s} fill="#b8a888" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
            </g>
            <rect x={g.x} y={land} width={g.W} height={g.H} fill="#8a7a5a" />
            <g transform={`translate(${pan * 0.6},0)`}>
              {[0.12, 0.3].map((fx, i) => <Cannon key={i} x={g.x + g.W * fx} y={land + 24 * g.s} s={g.s * 1.4} recoil={impactAt(frame, shots.map((f) => f + i * 4), 8)} />)}
            </g>
            {shots.map((f, i) => <Shot key={i} from={[g.x + g.W * (0.12 + (i % 2) * 0.18) + 46 * g.s, land - 4 * g.s]} to={[g.x + g.W * (0.7 + (i % 3) * 0.08), land - 50 * g.s]} t={frame - f} s={g.s} flight={20} />)}
            <Fighter x={g.x + g.W * 0.2} y={g.ground} scale={g.sc * 0.75} mode="stand" costume={C.redcoat} weapon="rifle" />
            <Fighter x={g.x + g.W * 0.4} y={g.ground} scale={g.sc * 0.75} mode="stand" costume={C.french} weapon="rifle" phase={2} />
            <g transform={`translate(${pan * 1.6},0)`}>
              <path d={`M${g.x - 30 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.2} ${g.y + g.H - 40 * g.s} ${g.x + g.W * 0.45} ${g.y + g.H} Z`} fill="#6b5a3a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// The Anglo-French squadron sailing north into the Pacific.
export const SquadronPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="squadron" anchor={anchor} start={start} end={end} sky={["#6f88a6", "#dfe4e2"]} accent="#ff8fb3">
    {(g, pan) => {
      const sea = g.y + g.H * 0.56;
      return (
        <g>
          <Sea g={g} y={sea} shift={pan} color="#3e6176" />
          <Ship x={g.x + g.W * 0.22} y={sea + 30 * g.s} s={g.s} scale={0.8} flag={["#22307a", "#22307a", "#22307a"]} union />
          <Ship x={g.x + g.W * 0.52} y={sea + 60 * g.s} s={g.s} scale={1.15} flag={FR_FLAG} phase={2} />
          <Ship x={g.x + g.W * 0.8} y={sea + 26 * g.s} s={g.s} scale={0.7} flag={["#22307a", "#22307a", "#22307a"]} union phase={4} />
          <g transform={`translate(${pan * 1.6},0)`}>
            <Ridge g={g} base={g.y + g.H + 8 * g.s} amp={20 * g.s} seed={63} color="#2e4e62" />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Warships firing on the harbour forts of Petropavlovsk under the volcano.
export const BombardPanel = ({ start, end, anchor, shots }: { start: number; end: number; anchor: number[]; shots: number[] }) => {
  const frame = useCurrentFrame();
  const impact = impactAt(frame, shots, 10) * 0.55;
  return (
    <Scene id="bombard" anchor={anchor} start={start} end={end} sky={["#6a7a8e", "#dcd6c8"]} accent="#ff8fb3" impact={impact}>
      {(g, pan) => {
        const sea = g.y + g.H * 0.6;
        return (
          <g>
            <g transform={`translate(${pan * 0.2},0)`}>
              <Volcano x={g.x + g.W * 0.75} y={sea} h={170 * g.s} s={g.s} color="#8d98ac" />
            </g>
            <g transform={`translate(${pan * 0.5},0)`}>
              <path d={`M${g.x + g.W * 0.55} ${sea} L${g.x + g.W * 0.6} ${sea - 40 * g.s} L${g.x + g.W + 40 * g.s} ${sea - 46 * g.s} L${g.x + g.W + 40 * g.s} ${sea} Z`} fill="#6b6a52" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              <Palisade x0={g.x + g.W * 0.62} x1={g.x + g.W * 0.9} y={sea - 36 * g.s} h={26 * g.s} s={g.s} />
              <Flag x={g.x + g.W * 0.76} y={sea - 40 * g.s} s={g.s * 0.7} h={70} stripes={RU_FLAG} w={46} />
            </g>
            <Sea g={g} y={sea} shift={pan} color="#3e5a6c" />
            <Ship x={g.x + g.W * 0.18} y={sea + 50 * g.s} s={g.s} scale={1.1} flag={["#22307a", "#22307a", "#22307a"]} union smoke={impactAt(frame, shots, 30)} />
            <Ship x={g.x + g.W * 0.4} y={sea + 30 * g.s} s={g.s} scale={0.8} flag={FR_FLAG} phase={2} smoke={impactAt(frame, shots.map((f) => f + 5), 30)} />
            {shots.map((f, i) => <Shot key={i} from={[g.x + g.W * (i % 2 ? 0.44 : 0.24), sea + 30 * g.s]} to={[g.x + g.W * (0.68 + (i % 3) * 0.08), sea - 40 * g.s]} t={frame - f} s={g.s} flight={18} />)}
            <g transform={`translate(${pan * 1.6},0)`}>
              <Ridge g={g} base={g.y + g.H + 6 * g.s} amp={18 * g.s} seed={65} color="#2e4a5a" />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// The lesson: a Russian officer at the Sitka battery, telescope on the empty sea.
export const LookoutPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="lookout" anchor={anchor} start={start} end={end} sky={["#5e7088", "#d2d6d6"]}>
    {(g, pan) => {
      const sea = g.y + g.H * 0.6;
      return (
        <g>
          <Sea g={g} y={sea} shift={pan * 0.6} color="#3e5a6c" />
          <Ship x={g.x + g.W * 0.75} y={sea + 14 * g.s} s={g.s} scale={0.35} flag={["#22307a", "#22307a", "#22307a"]} union />
          <g transform={`translate(${pan * 0.7},0)`}>
            <path d={`M${g.x - 30 * g.s} ${g.y + g.H} L${g.x - 30 * g.s} ${sea + 30 * g.s} L${g.x + g.W * 0.5} ${sea + 40 * g.s} L${g.x + g.W * 0.56} ${g.y + g.H} Z`} fill="#6b6a52" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Cannon x={g.x + g.W * 0.4} y={sea + 30 * g.s} s={g.s * 1.3} />
          </g>
          <g transform={`translate(${g.x + g.W * 0.25},${g.ground - 30 * g.s})`}>
            <Fighter x={0} y={0} scale={g.sc * 0.9} mode="aim" costume={C.rusArmy} weapon="none" />
            <rect x={6 * g.sc} y={-104 * g.sc} width={34 * g.sc} height={6 * g.sc} fill="#a88a3a" stroke={PAL.ink} strokeWidth={1 * g.s} />
          </g>
          <g transform={`translate(${pan * 1.6},0)`}>
            <Pine x={g.x + g.W * 0.93} y={g.y + g.H + 20 * g.s} h={220 * g.s} color="#1f3a2e" snow={false} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Redcoats marching through the northern forest.
export const MarchPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <Scene id="march" anchor={anchor} start={start} end={end} sky={["#7d8ea4", "#dde2e2"]} accent="#ff8fb3">
      {(g, pan) => {
        const land = g.y + g.H * 0.64;
        const move = (frame - start) * 1.2 * g.s;
        return (
          <g>
            <Ridge g={g} base={land - 20 * g.s} amp={40 * g.s} seed={67} color="#9fb0c2" shift={pan * 0.2} />
            <g transform={`translate(${pan * 0.5},0)`}>
              {Array.from({ length: 12 }, (_, i) => <Pine key={i} x={g.x + i * 90 * g.s} y={land} h={(90 + (i % 3) * 20) * g.s} color="#2c4a3c" />)}
            </g>
            <SnowGround g={g} y={land} shift={pan * 0.7} />
            {Array.from({ length: 7 }, (_, i) => <Fighter key={i} x={g.x - 60 * g.s + i * 110 * g.s + move} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.75} mode="walk" costume={C.redcoat} weapon="rifle" phase={i * 0.8} />)}
            <g transform={`translate(${pan * 1.6},0)`}>
              <Pine x={g.x + g.W * 0.06} y={g.y + g.H + 20 * g.s} h={230 * g.s} color="#16281f" />
            </g>
            <Snow g={g} n={24} depth={0.3} />
          </g>
        );
      }}
    </Scene>
  );
};

// Broke: the treasury vault with an open, nearly empty chest.
export const VaultPanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="vault" anchor={anchor} start={start} end={end} sky={["#1c1a20", "#3a3440"]} accent={GOLD} warm={0.04}>
    {(g, pan) => {
      const floor = g.y + g.H * 0.72;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${g.x + i * 230 * g.s} ${floor} L${g.x + i * 230 * g.s} ${g.y + 80 * g.s} Q${g.x + i * 230 * g.s + 115 * g.s} ${g.y} ${g.x + i * 230 * g.s + 230 * g.s} ${g.y + 80 * g.s}`} fill="none" stroke="#5a5060" strokeWidth={10 * g.s} />)}
          </g>
          <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#2a2630" />
          <Glow x={g.cx} y={floor - 60 * g.s} s={g.s * 0.6} color="#ffd38a" core="#fff1c8" />
          <g transform={`translate(${pan * 0.6},0)`}>
            <rect x={g.cx - 80 * g.s} y={floor - 60 * g.s} width={160 * g.s} height={60 * g.s} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <path d={`M${g.cx - 80 * g.s} ${floor - 60 * g.s} L${g.cx - 70 * g.s} ${floor - 120 * g.s} L${g.cx + 90 * g.s} ${floor - 120 * g.s} L${g.cx + 80 * g.s} ${floor - 60 * g.s} Z`} fill="#5a3a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.cx - 70 * g.s} y={floor - 58 * g.s} width={140 * g.s} height={10 * g.s} fill="#1a140f" />
            <Coins x={g.cx - 20 * g.s} y={floor - 50 * g.s} s={g.s} n={2} />
          </g>
          <Fighter x={g.cx + 200 * g.s} y={g.ground} scale={g.sc * 0.85} mode="stand" flip costume={C.noble} weapon="none" />
          <g transform={`translate(${pan * 1.6},0)`}>
            <rect x={g.x - 10 * g.s} y={g.y + g.H - 80 * g.s} width={50 * g.s} height={80 * g.s} fill="#3a3440" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// Get paid: a scale tipping as gold piles onto one pan against a little rolled map on the other.
export const ScalePanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => {
  const frame = useCurrentFrame();
  const tip = interpolate(frame, [start + 10, start + 50], [8, -10], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <Scene id="scale" anchor={anchor} start={start} end={end} sky={["#2a2018", "#5a4028"]} accent={GOLD} warm={0.1}>
      {(g, pan) => {
        const floor = g.y + g.H * 0.74;
        const px = g.cx;
        const py = floor - 150 * g.s;
        return (
          <g>
            <g transform={`translate(${pan * 0.2},0)`}>
              {Array.from({ length: 3 }, (_, r) => <rect key={r} x={g.x - 40 * g.s} y={g.y + (40 + r * 70) * g.s} width={g.W + 80 * g.s} height={6 * g.s} fill="#2a1c12" />)}
            </g>
            <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#4a3322" />
            <g transform={`translate(${pan * 0.6},0)`}>
              <rect x={px - 8 * g.s} y={py} width={16 * g.s} height={150 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              <g transform={`rotate(${tip},${px},${py})`}>
                <line x1={px - 150 * g.s} y1={py} x2={px + 150 * g.s} y2={py} stroke={PAL.gilt} strokeWidth={6 * g.s} />
                <g transform={`translate(${px - 150 * g.s},${py}) rotate(${-tip})`}>
                  <path d={`M${-50 * g.s} ${60 * g.s} L${50 * g.s} ${60 * g.s} L${30 * g.s} ${76 * g.s} L${-30 * g.s} ${76 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <Coins x={0} y={58 * g.s} s={g.s} n={Math.round(interpolate(frame, [start + 6, start + 46], [1, 9], clamp))} />
                </g>
                <g transform={`translate(${px + 150 * g.s},${py}) rotate(${-tip})`}>
                  <path d={`M${-50 * g.s} ${60 * g.s} L${50 * g.s} ${60 * g.s} L${30 * g.s} ${76 * g.s} L${-30 * g.s} ${76 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <rect x={-34 * g.s} y={34 * g.s} width={68 * g.s} height={24 * g.s} rx={10 * g.s} fill="#e8d9b4" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                </g>
              </g>
            </g>
            <g transform={`translate(${pan * 1.6},0)`}>
              <Coins x={g.x + 60 * g.s} y={g.y + g.H - 4 * g.s} s={g.s * 1.8} n={5} />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

// The enemy of my enemy: a Russian diplomat and an American shake hands between the two flags.
export const HandshakePanel = ({ start, end, anchor }: { start: number; end: number; anchor: number[] }) => (
  <Scene id="handshake" anchor={anchor} start={start} end={end} sky={["#3a3048", "#8a6a5a"]} warm={0.1}>
    {(g, pan) => {
      const floor = g.y + g.H * 0.72;
      return (
        <g>
          <g transform={`translate(${pan * 0.2},0)`}>
            {[0.2, 0.5, 0.8].map((fx, i) => <rect key={i} x={g.x + g.W * fx - 40 * g.s} y={g.y + 30 * g.s} width={80 * g.s} height={150 * g.s} rx={40 * g.s} fill="#d9c08a" opacity={0.5} />)}
          </g>
          <rect x={g.x} y={floor} width={g.W} height={g.H} fill="#5a3a2a" />
          <g transform={`translate(${pan * 0.6},0)`}>
            <Flag x={g.x + g.W * 0.24} y={floor + 10 * g.s} s={g.s} h={170} stripes={RU_FLAG} />
            <Flag x={g.x + g.W * 0.7} y={floor + 10 * g.s} s={g.s} h={170} stripes={US_FLAG} canton />
          </g>
          <Fighter x={g.cx - 44 * g.s} y={g.ground} scale={g.sc * 0.9} mode="aim" costume={C.noble} weapon="none" />
          <Fighter x={g.cx + 44 * g.s} y={g.ground} scale={g.sc * 0.9} mode="aim" flip costume={C.suit} weapon="none" />
          <g transform={`translate(${pan * 1.6},0)`}>
            <rect x={g.x - 10 * g.s} y={g.y + g.H - 50 * g.s} width={g.W + 20 * g.s} height={50 * g.s} fill="#7a2a22" opacity={0.6} />
          </g>
        </g>
      );
    }}
  </Scene>
);

// The Civil War: blue and grey lines across a field in cannon smoke (no flags, no bodies).
export const CivilWarPanel = ({ start, end, anchor, shots }: { start: number; end: number; anchor: number[]; shots: number[] }) => {
  const frame = useCurrentFrame();
  const impact = impactAt(frame, shots, 10) * 0.5;
  return (
    <Scene id="civilwar" anchor={anchor} start={start} end={end} sky={["#8a8d8a", "#e0d8c4"]} impact={impact}>
      {(g, pan) => {
        const land = g.y + g.H * 0.62;
        return (
          <g>
            <Ridge g={g} base={land} amp={30 * g.s} seed={71} color="#7a8a6a" shift={pan * 0.2} />
            <rect x={g.x} y={land} width={g.W} height={g.H} fill="#7a8a52" />
            <g transform={`translate(${pan * 0.5},0)`}>
              <path d={`M${g.x} ${land + 20 * g.s} L${g.x + g.W} ${land + 14 * g.s}`} stroke="#6b4a2e" strokeWidth={4 * g.s} />
              {Array.from({ length: 14 }, (_, i) => <line key={i} x1={g.x + i * 72 * g.s} y1={land + 20 * g.s} x2={g.x + i * 72 * g.s} y2={land} stroke="#6b4a2e" strokeWidth={3 * g.s} />)}
            </g>
            <Cannon x={g.x + g.W * 0.14} y={land + 40 * g.s} s={g.s * 1.3} recoil={impactAt(frame, shots, 8)} />
            {shots.map((f, i) => <Shot key={i} from={[g.x + g.W * 0.14 + 44 * g.s, land + 20 * g.s]} to={[g.x + g.W * 0.8, land + 10 * g.s]} t={frame - f} s={g.s} flight={20} />)}
            {[0, 1, 2].map((i) => <Fighter key={`u${i}`} x={g.x + g.W * (0.26 + i * 0.07)} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.75} mode="aim" costume={C.union} weapon="rifle" phase={i} />)}
            {[0, 1, 2].map((i) => <Fighter key={`g${i}`} x={g.x + g.W * (0.66 + i * 0.08)} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.75} mode="aim" flip costume={C.grey} weapon="rifle" phase={i + 3} />)}
            <Mist g={g} y={land + 10 * g.s} k={0.4} color="#efeae0" />
            <g transform={`translate(${pan * 1.6},0)`}>
              <Grass g={g} color="#4a5a2e" />
            </g>
          </g>
        );
      }}
    </Scene>
  );
};

export { COSTUME, SnowGround };
