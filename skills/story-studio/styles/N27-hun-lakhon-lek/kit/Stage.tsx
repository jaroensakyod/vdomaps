import { loadFont } from "@remotion/google-fonts/Krub";
import type { ReactNode } from "react";
import { random } from "remotion";

// N27 hun lakhon lek: a small rod puppet in full costume, worked by three puppeteers in black who stand behind it
// in plain sight and dance its steps with it. Behind them a painted cloth backdrop (canvas weave, a seam, soft
// folds), in front a worn plank stage; one warm follow-spot from the front and a cooler wash behind.

export const font = loadFont("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  dark: "#120a06",
  board: "#8a5530",
  sky: ["#f6ecb8", "#5fd0d0", "#1f9cc4"], // painted morning sky, horizon to top
  sea: "#1f9c94",
  velvet: "#a8148c", // ban-yen pink velvet of the proscenium
  rock: "#5a4a3a",
  black: "#0d0b0c", // puppeteers
  red: "#b8202a",
  gold: "#e6b44a",
  green: "#1f6e4a",
  skin: "#f1d6b4", // the puppet's painted face
  text: "#fff0d6",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const StageDefs = () => (
  <defs>
    <linearGradient id="n27-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.sky[2]} />
      <stop offset="0.45" stopColor={C.sky[1]} />
      <stop offset="1" stopColor={C.sky[0]} />
    </linearGradient>
    <linearGradient id="n27-sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3fbcae" />
      <stop offset="1" stopColor="#16786e" />
    </linearGradient>
    {/* canvas weave + brush mottling of the painted cloth */}
    <filter id="n27-canvas" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves={1} seed={2} result="w" />
      <feTurbulence type="fractalNoise" baseFrequency="0.06 0.9" numOctaves={1} seed={3} result="h" />
      <feBlend in="w" in2="h" mode="multiply" result="weave" />
      <feColorMatrix in="weave" values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 -0.9 0.55" />
    </filter>
    <filter id="n27-brush" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves={3} seed={8} />
      <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.9 -0.35" />
    </filter>
    <filter id="n27-wood" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.002 0.08" numOctaves={3} seed={5} />
      <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 1.2 -0.4" />
    </filter>
    <filter id="n27-blur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={2.2} />
    </filter>
    <filter id="n27-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation={14} />
    </filter>
    <filter id="n27-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={3} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="n27-spot" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55} />
      <stop offset="0.6" stopColor="#ffb060" stopOpacity={0.18} />
      <stop offset="1" stopColor="#ffb060" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="n27-vig" cx="0.5" cy="0.55" r="0.75">
      <stop offset="0.45" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.8} />
    </radialGradient>
    <linearGradient id="n27-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff0b0" />
      <stop offset="0.5" stopColor={C.gold} />
      <stop offset="1" stopColor="#8a5a14" />
    </linearGradient>
    <linearGradient id="n27-cloth" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#000" stopOpacity={0.35} />
      <stop offset="0.5" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.35} />
    </linearGradient>
    <linearGradient id="n27-blackcloth" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#2c2426" />
      <stop offset="0.18" stopColor="#0d0b0c" />
      <stop offset="0.85" stopColor="#0d0b0c" />
      <stop offset="1" stopColor="#3a2c24" />
    </linearGradient>
    <linearGradient id="n27-skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f6dcbc" />
      <stop offset="1" stopColor="#c08a64" />
    </linearGradient>
    <linearGradient id="n27-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.22} />
      <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
    </linearGradient>
    <pattern id="n27-diaper" width={60} height={60} patternUnits="userSpaceOnUse">
      <path d="M30 4 L56 30 L30 56 L4 30 Z" fill="none" stroke="#a8742a" strokeWidth={3} />
      <path d="M30 18 C36 24 36 36 30 42 C24 36 24 24 30 18 Z" fill="#b8202a" />
    </pattern>
    <pattern id="n27-brocade" width={26} height={26} patternUnits="userSpaceOnUse">
      <rect width={26} height={26} fill="none" />
      <path d="M13 3 L23 13 L13 23 L3 13 Z" fill="none" stroke={C.gold} strokeWidth={2} />
      <circle cx={13} cy={13} r={2.5} fill="#fff0b0" />
    </pattern>
  </defs>
);

// Painted cloth backdrop: dusk sky, sea, an island with palms and rocks; weave, a seam, soft vertical folds.
export const Backdrop = ({ y0 = 300, y1 = 1420, waves = 0 }: { y0?: number; y1?: number; waves?: number }) => {
  const sea = y0 + (y1 - y0) * 0.62;
  return (
    <g>
      <rect x={0} y={y0} width={1080} height={y1 - y0} fill="url(#n27-sky)" />
      {/* painted clouds: soft strokes */}
      {[[220, y0 + 200, 260], [760, y0 + 140, 320], [540, y0 + 330, 220]].map(([x, y, w], i) => (
        <g key={i} opacity={0.55}>
          <ellipse cx={x} cy={y} rx={w} ry={34} fill="#f4fbf6" />
          <ellipse cx={x + w * 0.3} cy={y - 26} rx={w * 0.5} ry={30} fill="#ffffff" />
        </g>
      ))}
      <circle cx={820} cy={sea - 150} r={64} fill="#fff6c8" opacity={0.95} />
      <rect x={0} y={sea} width={1080} height={y1 - sea} fill="url(#n27-sea)" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M${-40 + ((i * 137) % 300)} ${sea + 30 + i * 38} q60 ${-10 + Math.sin(waves + i) * 6} 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0`} stroke="#bfe0d6" strokeWidth={4} fill="none" opacity={0.45} />
      ))}
      {/* island with palms */}
      <path d={`M120 ${sea + 6} C180 ${sea - 70} 300 ${sea - 90} 380 ${sea - 40} C420 ${sea - 20} 460 ${sea} 480 ${sea + 6} Z`} fill="#2f8a44" />
      {[[210, sea - 70, -8], [300, sea - 84, 6]].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y})`}>
          <path d={`M${x} ${y} C${x + 6} ${y - 80} ${x - 4} ${y - 150} ${x + 10} ${y - 210}`} stroke="#5a3a22" strokeWidth={9} fill="none" />
          {[-150, -110, -60, -20, 20, 60].map((a, j) => <path key={j} d={`M${x + 10} ${y - 210} q${Math.cos((a * Math.PI) / 180) * 50} ${Math.sin((a * Math.PI) / 180) * 50 - 20} ${Math.cos((a * Math.PI) / 180) * 100} ${Math.sin((a * Math.PI) / 180) * 100 + 30}`} stroke="#2a7a3a" strokeWidth={14} fill="none" strokeLinecap="round" />)}
        </g>
      ))}
      <path d={`M700 ${y1} L760 ${sea + 40} L840 ${sea + 70} L900 ${sea + 20} L1000 ${sea + 90} L1080 ${sea + 60} L1080 ${y1} Z`} fill="#8a7a5a" />
      <path d={`M760 ${sea + 40} L800 ${sea + 120} M900 ${sea + 20} L930 ${sea + 110}`} stroke="#3a2e24" strokeWidth={6} />
      {/* the cloth itself */}
      <rect x={0} y={y0} width={1080} height={y1 - y0} filter="url(#n27-brush)" opacity={0.5} />
      <rect x={0} y={y0} width={1080} height={y1 - y0} filter="url(#n27-canvas)" opacity={0.45} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 180} y={y0} width={180} height={y1 - y0} fill="url(#n27-cloth)" opacity={0.5} />)}
      <path d={`M540 ${y0} L540 ${y1}`} stroke="#000" strokeWidth={3} opacity={0.25} />
      <path d={`M0 ${y0 + 4} L1080 ${y0 + 4}`} stroke="#2a1a10" strokeWidth={14} />
      {Array.from({ length: 13 }, (_, i) => <circle key={i} cx={20 + i * 86} cy={y0 + 4} r={7} fill="#8a6a3a" />)}
    </g>
  );
};

// Proscenium of ban-yen velvet: two side drapes with deep folds and a valance with a gold fringe.
export const Proscenium = ({ y0 = 250, y1 = 1500, w = 150, sway = 0 }: { y0?: number; y1?: number; w?: number; sway?: number }) => {
  const drape = (x0: number, dir: number) => (
    <g>
      <path d={`M${x0} ${y0} L${x0 + dir * w} ${y0} C${x0 + dir * (w - 30)} ${y0 + 500} ${x0 + dir * (w + 20 + sway)} ${y1 - 300} ${x0 + dir * (w - 10)} ${y1} L${x0} ${y1} Z`} fill={C.velvet} />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${x0 + dir * (12 + i * 28)} ${y0} C${x0 + dir * (6 + i * 28)} ${y0 + 500} ${x0 + dir * (18 + i * 28 + sway * 0.5)} ${y1 - 300} ${x0 + dir * (10 + i * 28)} ${y1}`} stroke="#3a0438" strokeWidth={10} opacity={0.55} fill="none" />)}
      {Array.from({ length: 5 }, (_, i) => <path key={`h${i}`} d={`M${x0 + dir * (26 + i * 28)} ${y0} C${x0 + dir * (20 + i * 28)} ${y0 + 500} ${x0 + dir * (32 + i * 28 + sway * 0.5)} ${y1 - 300} ${x0 + dir * (24 + i * 28)} ${y1}`} stroke="#e070d8" strokeWidth={5} opacity={0.35} fill="none" />)}
    </g>
  );
  return (
    <g>
      {drape(0, 1)}
      {drape(1080, -1)}
      <path d={`M0 ${y0 - 10} L1080 ${y0 - 10} L1080 ${y0 + 90} ${Array.from({ length: 9 }, (_, i) => `Q${1080 - (i + 0.5) * 120} ${y0 + 150} ${1080 - (i + 1) * 120} ${y0 + 90}`).join(" ")} Z`} fill={C.velvet} />
      <path d={`M0 ${y0 + 90} ${Array.from({ length: 9 }, (_, i) => `Q${(i + 0.5) * 120} ${y0 + 150} ${(i + 1) * 120} ${y0 + 90}`).join(" ")}`} stroke="url(#n27-gold)" strokeWidth={10} fill="none" />
      {Array.from({ length: 60 }, (_, i) => {
        const x = i * 18 + 9;
        const k = ((x % 120) / 120);
        const yy = y0 + 90 + Math.sin(k * Math.PI) * 44;
        return <path key={i} d={`M${x} ${yy} l0 26`} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />;
      })}
      <rect x={0} y={y0 - 14} width={1080} height={20} fill="url(#n27-gold)" />
    </g>
  );
};

// Plank stage floor in perspective with a lip at the front.
export const Floor = ({ y = 1420 }: { y?: number }) => (
  <g>
    <rect x={0} y={y} width={1080} height={1920 - y} fill={C.board} />
    {Array.from({ length: 12 }, (_, i) => {
      const x = -400 + i * 170;
      return <path key={i} d={`M${540 + (x - 540) * 0.55} ${y} L${x} 1920`} stroke="#2a180c" strokeWidth={3} />;
    })}
    {[0.15, 0.4, 0.75].map((k, i) => <path key={`h${i}`} d={`M0 ${y + (1920 - y) * k} L1080 ${y + (1920 - y) * k}`} stroke="#2a180c" strokeWidth={2} opacity={0.6} />)}
    <rect x={0} y={y} width={1080} height={1920 - y} filter="url(#n27-wood)" />
    <rect x={0} y={y} width={1080} height={22} fill="#000" opacity={0.5} />
  </g>
);

// ---------- figures ----------
export type Pt = [number, number];
// two-bone limb: from root to target with segment lengths l1, l2 (bend side s)
export const ik = (root: Pt, target: Pt, l1: number, l2: number, s = 1): Pt => {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const d = Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy));
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  return [root[0] + Math.cos(a - s * b) * l1, root[1] + Math.sin(a - s * b) * l1];
};

// A puppeteer in black: mandarin-collar shirt, loose trousers, bare feet; face lit warm by the follow-spot from
// the front, a rim of light on the lamp side; knees soft, stepping with the puppet. Hands go where the rods are.
export const Puppeteer = ({ x, y, h = 860, hands, step = 0, face = 0 }: { x: number; y: number; h?: number; hands: [Pt, Pt]; step?: number; face?: number }) => {
  const k = h / 860;
  const lift = Math.abs(Math.sin(step)) * -10 * k;
  const hip: Pt = [x, y - 400 * k + lift];
  const sh: Pt = [x + face * 8 * k, y - 690 * k + lift];
  const head: Pt = [sh[0] + face * 10 * k, sh[1] - 110 * k];
  const legs = [-1, 1].map((sd) => {
    const ph = step + (sd > 0 ? Math.PI : 0);
    const foot: Pt = [x + sd * 92 * k + Math.sin(ph) * 22 * k, y - Math.max(0, Math.sin(ph)) * 26 * k];
    const root: Pt = [hip[0] + sd * 40 * k, hip[1]];
    return { foot, root, knee: ik(root, foot, 205 * k, 205 * k, sd) };
  });
  const arms = hands.map((hd, i) => {
    const root: Pt = [sh[0] + (i ? 74 : -74) * k, sh[1] + 30 * k];
    return { root, el: ik(root, hd, 175 * k, 165 * k, i ? -1 : 1), hd };
  });
  const torso = `M${sh[0] - 92 * k} ${sh[1] + 26 * k} C${sh[0] - 96 * k} ${sh[1] - 10 * k} ${sh[0] - 40 * k} ${sh[1] - 26 * k} ${sh[0]} ${sh[1] - 26 * k} C${sh[0] + 40 * k} ${sh[1] - 26 * k} ${sh[0] + 96 * k} ${sh[1] - 10 * k} ${sh[0] + 92 * k} ${sh[1] + 26 * k} L${hip[0] + 84 * k} ${hip[1] + 40 * k} L${hip[0] - 84 * k} ${hip[1] + 40 * k} Z`;
  return (
    <g>
      {legs.map((l, i) => <path key={i} d={`M${l.root[0]} ${l.root[1]} Q${l.knee[0]} ${l.knee[1]} ${l.foot[0]} ${l.foot[1] - 20 * k}`} stroke="url(#n27-blackcloth)" strokeWidth={100 * k} strokeLinecap="round" fill="none" />)}
      {legs.map((l, i) => <ellipse key={`f${i}`} cx={l.foot[0]} cy={l.foot[1]} rx={40 * k} ry={14 * k} fill="#3a2418" />)}
      <path d={torso} fill="url(#n27-blackcloth)" />
      <path d={`M${sh[0] - 18 * k} ${sh[1] - 24 * k} L${sh[0]} ${sh[1] + 30 * k} L${sh[0] + 18 * k} ${sh[1] - 24 * k}`} stroke="#2a2426" strokeWidth={4 * k} fill="none" />
      {arms.map((a, i) => <path key={i} d={`M${a.root[0]} ${a.root[1]} Q${a.el[0]} ${a.el[1]} ${a.hd[0]} ${a.hd[1]}`} stroke="url(#n27-blackcloth)" strokeWidth={52 * k} strokeLinecap="round" fill="none" />)}
      {arms.map((a, i) => <ellipse key={`h${i}`} cx={a.hd[0]} cy={a.hd[1]} rx={18 * k} ry={22 * k} fill="url(#n27-skin)" />)}
      {/* neck, face, hair */}
      <rect x={head[0] - 22 * k} y={head[1] + 50 * k} width={44 * k} height={50 * k} fill="#6a4a36" />
      <ellipse cx={head[0]} cy={head[1]} rx={56 * k} ry={70 * k} fill="url(#n27-skin)" />
      <ellipse cx={head[0] + face * 30 * k} cy={head[1] + 10 * k} rx={40 * k} ry={60 * k} fill="#1a0c06" opacity={0.25} filter="url(#n27-soft)" />
      {[-1, 1].map((sd) => <ellipse key={sd} cx={head[0] + sd * 56 * k} cy={head[1] + 4 * k} rx={9 * k} ry={16 * k} fill="#a07454" />)}
      <path d={`M${head[0] - 20 * k + face * 10 * k} ${head[1] - 4 * k} l14 ${-2 * k} M${head[0] + 8 * k + face * 10 * k} ${head[1] - 6 * k} l14 ${2 * k}`} stroke="#2a1810" strokeWidth={4 * k} strokeLinecap="round" />
      <path d={`M${head[0] - 8 * k + face * 12 * k} ${head[1] + 36 * k} q8 ${4 * k} 16 0`} stroke="#5a2a20" strokeWidth={4 * k} fill="none" strokeLinecap="round" />
      <path d={`M${head[0] - 57 * k} ${head[1] - 8 * k} C${head[0] - 62 * k} ${head[1] - 60 * k} ${head[0] - 30 * k} ${head[1] - 78 * k} ${head[0]} ${head[1] - 78 * k} C${head[0] + 34 * k} ${head[1] - 78 * k} ${head[0] + 62 * k} ${head[1] - 58 * k} ${head[0] + 57 * k} ${head[1] - 8 * k} C${head[0] + 50 * k} ${head[1] - 30 * k} ${head[0] + 30 * k} ${head[1] - 46 * k} ${head[0] + 4 * k} ${head[1] - 44 * k} C${head[0] - 24 * k} ${head[1] - 46 * k} ${head[0] - 48 * k} ${head[1] - 34 * k} ${head[0] - 57 * k} ${head[1] - 8 * k} Z`} fill="#140e0c" />
    </g>
  );
};

export type Pose = { x: number; y: number; head: number; armR: Pt; armL: Pt; step: number; bow: number; flute: number };

// Rig of the rod puppet (about 1 m tall on stage): joint positions, and the rod tips the puppeteers hold.
export const puppetRig = (p: Pose) => {
  const hip: Pt = [p.x, p.y - 330 + p.bow * 40];
  const neck: Pt = [p.x + p.bow * 50, p.y - 560 + p.bow * 120];
  const head: Pt = [neck[0] + p.bow * 20, neck[1] - 70];
  const shR: Pt = [neck[0] - 74, neck[1] + 34];
  const shL: Pt = [neck[0] + 74, neck[1] + 34];
  const handR: Pt = [shR[0] + p.armR[0], shR[1] + p.armR[1]];
  const handL: Pt = [shL[0] + p.armL[0], shL[1] + p.armL[1]];
  return {
    hip, neck, head, shR, shL, handR, handL,
    elR: ik(shR, handR, 95, 95, -1), elL: ik(shL, handL, 95, 95, 1),
    rodHead: [head[0] + 30, head[1] + 440] as Pt,
    rodR: [handR[0] - 10, handR[1] + 300] as Pt,
    rodL: [handL[0] + 10, handL[1] + 300] as Pt,
  };
};

// The puppet: a crowned hero (พระ) in a red brocade jacket with gold collar and upturned shoulder flames, gold belt
// and front panel, green knee breeches with gold hems, bare painted shins, feet flexed up in the dance stance.
export const Puppet = ({ p, frame }: { p: Pose; frame: number }) => {
  const r = puppetRig(p);
  const legs = [-1, 1].map((sd) => {
    const phase = p.step + (sd > 0 ? Math.PI : 0);
    const foot: Pt = [p.x + sd * 150 + Math.sin(phase) * 18, p.y - Math.max(0, Math.sin(phase)) * 46];
    const root: Pt = [r.hip[0] + sd * 40, r.hip[1] + 20];
    return { root, knee: ik(root, foot, 165, 165, sd), foot, sd };
  });
  const tilt = p.head * 12;
  const [hx, hy] = r.head;
  const waistY = r.hip[1] - 30;
  return (
    <g>
      <g stroke="#2a1a10" strokeWidth={7} strokeLinecap="round">
        <path d={`M${hx + 10} ${hy + 40} L${r.rodHead[0]} ${r.rodHead[1]}`} />
        <path d={`M${r.handR[0]} ${r.handR[1]} L${r.rodR[0]} ${r.rodR[1]}`} />
        <path d={`M${r.handL[0]} ${r.handL[1]} L${r.rodL[0]} ${r.rodL[1]}`} />
      </g>
      {/* side tails behind the hips */}
      {[-1, 1].map((sd) => <path key={sd} d={`M${r.hip[0] + sd * 60} ${waistY} C${r.hip[0] + sd * 120} ${waistY + 60} ${r.hip[0] + sd * 150} ${waistY + 150} ${r.hip[0] + sd * 130 + Math.sin(frame * 0.08) * 6} ${waistY + 230} L${r.hip[0] + sd * 96} ${waistY + 200} C${r.hip[0] + sd * 100} ${waistY + 120} ${r.hip[0] + sd * 70} ${waistY + 60} ${r.hip[0] + sd * 30} ${waistY + 20} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={2} />)}
      {legs.map((l, i) => {
        const shin = `M${l.knee[0]} ${l.knee[1]} L${l.foot[0]} ${l.foot[1]}`;
        return (
          <g key={i}>
            <path d={shin} stroke="url(#n27-skin)" strokeWidth={34} strokeLinecap="round" />
            <path d={`M${l.foot[0]} ${l.foot[1]} l${l.sd * 36} 6 l${l.sd * 8} -16`} stroke="url(#n27-skin)" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={l.foot[0]} cy={l.foot[1] - 8} r={13} fill="none" stroke="url(#n27-gold)" strokeWidth={6} />
            <path d={`M${l.root[0]} ${l.root[1]} L${l.knee[0]} ${l.knee[1]}`} stroke={C.green} strokeWidth={70} strokeLinecap="round" />
            <path d={`M${l.root[0]} ${l.root[1]} L${l.knee[0]} ${l.knee[1]}`} stroke="url(#n27-brocade)" strokeWidth={62} opacity={0.65} />
            <circle cx={l.knee[0]} cy={l.knee[1]} r={33} fill="none" stroke="url(#n27-gold)" strokeWidth={10} />
          </g>
        );
      })}
      {/* front panel and belt */}
      <path d={`M${r.hip[0] - 34} ${waistY} L${r.hip[0] + 34} ${waistY} L${r.hip[0] + 26} ${waistY + 210} Q${r.hip[0]} ${waistY + 236} ${r.hip[0] - 26} ${waistY + 210} Z`} fill={C.red} stroke="url(#n27-gold)" strokeWidth={8} />
      <path d={`M${r.hip[0]} ${waistY + 20} L${r.hip[0]} ${waistY + 200}`} stroke="url(#n27-gold)" strokeWidth={6} />
      {/* jacket: tapered, brocade, gold front borders */}
      <path d={`M${r.shR[0] - 14} ${r.shR[1] - 8} C${r.neck[0] - 30} ${r.neck[1] + 10} ${r.neck[0] + 30} ${r.neck[1] + 10} ${r.shL[0] + 14} ${r.shL[1] - 8} L${r.hip[0] + 64} ${waistY} L${r.hip[0] - 64} ${waistY} Z`} fill={C.red} />
      <path d={`M${r.shR[0] - 14} ${r.shR[1] - 8} C${r.neck[0] - 30} ${r.neck[1] + 10} ${r.neck[0] + 30} ${r.neck[1] + 10} ${r.shL[0] + 14} ${r.shL[1] - 8} L${r.hip[0] + 64} ${waistY} L${r.hip[0] - 64} ${waistY} Z`} fill="url(#n27-brocade)" opacity={0.75} />
      <path d={`M${r.hip[0] - 72} ${waistY} L${r.hip[0] + 72} ${waistY}`} stroke="url(#n27-gold)" strokeWidth={24} strokeLinecap="round" />
      <circle cx={r.hip[0]} cy={waistY} r={16} fill="#1fbf6a" stroke="#fff0b0" strokeWidth={3} />
      {/* collar (กรองคอ): scalloped gold with jewels */}
      <path d={`M${r.neck[0] - 96} ${r.neck[1] + 22} Q${r.neck[0]} ${r.neck[1] + 150} ${r.neck[0] + 96} ${r.neck[1] + 22} Q${r.neck[0]} ${r.neck[1] + 62} ${r.neck[0] - 96} ${r.neck[1] + 22} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={2} />
      {Array.from({ length: 9 }, (_, i) => { const t = i / 8; return <circle key={i} cx={r.neck[0] - 80 + t * 160} cy={r.neck[1] + 44 + Math.sin(t * Math.PI) * 52} r={6} fill={i % 2 ? "#1fbf6a" : "#e0203a"} stroke="#fff0b0" strokeWidth={1.5} />; })}
      {/* shoulder flames (อินทรธนู) curling up */}
      {[[r.shR, -1], [r.shL, 1]].map(([sp, sd], i) => {
        const [sx, sy] = sp as Pt;
        const s = sd as number;
        return <path key={i} d={`M${sx - s * 24} ${sy - 4} C${sx + s * 20} ${sy - 10} ${sx + s * 50} ${sy - 36} ${sx + s * 54} ${sy - 90} C${sx + s * 70} ${sy - 50} ${sx + s * 58} ${sy - 4} ${sx + s * 30} ${sy + 22} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={2} />;
      })}
      {/* arms: red sleeves, gold arm bands and bracelets, hands with curled fingers */}
      {[[r.shR, r.elR, r.handR, -1], [r.shL, r.elL, r.handL, 1]].map(([a, b, c, sd], i) => {
        const A = a as Pt, B = b as Pt, Cc = c as Pt;
        const band = mixPt(A, B, 0.45);
        const cuff = mixPt(B, Cc, 0.82);
        return (
          <g key={i}>
            <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${Cc[0]} ${Cc[1]}`} stroke={C.red} strokeWidth={38} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${Cc[0]} ${Cc[1]}`} stroke="url(#n27-brocade)" strokeWidth={32} strokeLinejoin="round" fill="none" opacity={0.6} />
            <circle cx={band[0]} cy={band[1]} r={21} fill="url(#n27-gold)" />
            <circle cx={cuff[0]} cy={cuff[1]} r={19} fill="url(#n27-gold)" />
            <ellipse cx={Cc[0]} cy={Cc[1]} rx={18} ry={15} fill="url(#n27-skin)" />
            <path d={`M${Cc[0]} ${Cc[1]} q${(sd as number) * 26} -4 ${(sd as number) * 30} -26`} stroke="url(#n27-skin)" strokeWidth={9} strokeLinecap="round" fill="none" />
          </g>
        );
      })}
      {p.flute > 0 && <path d={`M${r.handR[0] - 10} ${r.handR[1] + 6} L${r.handL[0] + 14} ${r.handL[1] - 4}`} stroke="#6a3e1a" strokeWidth={13} strokeLinecap="round" opacity={p.flute} />}
      {/* head: painted face, crown (ชฎา) with ear flames */}
      <g transform={`rotate(${tilt} ${r.neck[0]} ${r.neck[1]})`}>
        <rect x={hx - 18} y={hy + 50} width={36} height={40} fill="url(#n27-skin)" />
        <path d={`M${hx - 42} ${hy - 26} C${hx - 48} ${hy + 36} ${hx - 22} ${hy + 72} ${hx} ${hy + 74} C${hx + 22} ${hy + 72} ${hx + 48} ${hy + 36} ${hx + 42} ${hy - 26} Z`} fill="url(#n27-skin)" stroke="#c89a7a" strokeWidth={1.5} />
        <path d={`M${hx - 32} ${hy - 4} Q${hx - 18} ${hy - 16} ${hx - 6} ${hy - 6} M${hx + 6} ${hy - 6} Q${hx + 18} ${hy - 16} ${hx + 32} ${hy - 4}`} stroke="#2a1a10" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={`M${hx - 30} ${hy + 12} Q${hx - 18} ${hy + 20} ${hx - 6} ${hy + 12} M${hx + 6} ${hy + 12} Q${hx + 18} ${hy + 20} ${hx + 30} ${hy + 12}`} stroke="#2a1a10" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d={`M${hx - 2} ${hy + 18} q-6 16 2 22`} stroke="#c89a7a" strokeWidth={2.5} fill="none" />
        <path d={`M${hx - 12} ${hy + 50} Q${hx} ${hy + 58} ${hx + 12} ${hy + 50} Q${hx} ${hy + 46} ${hx - 12} ${hy + 50} Z`} fill="#c8202a" />
        <ellipse cx={hx - 24} cy={hy + 34} rx={10} ry={6} fill="#e89a8a" opacity={0.5} />
        <ellipse cx={hx + 24} cy={hy + 34} rx={10} ry={6} fill="#e89a8a" opacity={0.5} />
        {/* crown: band, five tiers, slender spire */}
        <path d={`M${hx - 48} ${hy - 22} Q${hx} ${hy - 40} ${hx + 48} ${hy - 22} L${hx + 40} ${hy - 58} Q${hx} ${hy - 70} ${hx - 40} ${hy - 58} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={2} />
        {Array.from({ length: 5 }, (_, i) => {
          const yy = hy - 60 - i * 30;
          const w = 36 - i * 6;
          return (
            <g key={i}>
              <path d={`M${hx - w} ${yy} Q${hx} ${yy + 6} ${hx + w} ${yy} L${hx + w - 4} ${yy - 30} Q${hx} ${yy - 26} ${hx - w + 4} ${yy - 30} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={1.5} />
              <circle cx={hx} cy={yy - 14} r={4} fill={i % 2 ? "#1fbf6a" : "#e0203a"} />
            </g>
          );
        })}
        <path d={`M${hx - 8} ${hy - 210} C${hx - 6} ${hy - 250} ${hx - 2} ${hy - 290} ${hx} ${hy - 330} C${hx + 2} ${hy - 290} ${hx + 6} ${hy - 250} ${hx + 8} ${hy - 210} Z`} fill="url(#n27-gold)" />
        {[-1, 1].map((sd) => <path key={sd} d={`M${hx + sd * 42} ${hy - 22} C${hx + sd * 84} ${hy - 10} ${hx + sd * 96} ${hy + 30} ${hx + sd * 84} ${hy + 80} C${hx + sd * 78} ${hy + 40} ${hx + sd * 62} ${hy + 14} ${hx + sd * 40} ${hy + 6} Z`} fill="url(#n27-gold)" stroke="#7a4a10" strokeWidth={1.5} />)}
      </g>
    </g>
  );
};
const mixPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const Notes = ({ frame, from, x, y }: { frame: number; from: number; x: number; y: number }) => (
  <g fill="#ffe7a8" filter="url(#n27-glow)">
    {Array.from({ length: 10 }, (_, i) => {
      const t = frame - from - i * 12;
      if (t < 0) return null;
      const k = (t % 120) / 120;
      const nx = x + k * (200 + random(`nx${i}`) * 260) * (i % 2 ? 1 : -0.6);
      const ny = y - k * 520 + Math.sin(k * 8 + i) * 20;
      return (
        <g key={i} opacity={Math.sin(k * Math.PI)} transform={`translate(${nx},${ny}) rotate(${Math.sin(k * 6 + i) * 20})`}>
          <ellipse cx={0} cy={0} rx={14} ry={10} transform="rotate(-20)" />
          <rect x={10} y={-50} width={4} height={50} />
          {i % 3 === 0 && <path d="M14 -50 q20 8 18 26" stroke="#ffe7a8" strokeWidth={4} fill="none" />}
        </g>
      );
    })}
  </g>
);

export const Spot = ({ x, y, rx, ry, k = 1 }: { x: number; y: number; rx: number; ry: number; k?: number }) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#n27-spot)" opacity={k} style={{ mixBlendMode: "screen" }} />;

export const Layer = ({ children, o = 1 }: { children: ReactNode; o?: number }) => <g opacity={o}>{children}</g>;
