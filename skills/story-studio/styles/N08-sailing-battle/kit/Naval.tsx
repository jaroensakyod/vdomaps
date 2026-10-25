import { interpolate, random, useCurrentFrame } from "remotion";
import { PAL } from "../../../components/Scene";

// Age-of-sail sea battle pieces in house style v2: layered rolling waves with foam, three-masted warships that roll
// and heave, rippling broadsides with lingering white powder smoke, cannonballs on arcs, splashes, a mast shot away
// and fire on deck. World units: sea level SEA, x −800…3200; the camera scales the world.
export const SEA = 1000; // world sea level
export const GUNS = 6; // gun ports per side
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const since = (f: number, list: number[]) => list.reduce((d, x) => (x <= f ? Math.min(d, f - x) : d), 1e9);
export const PORT = (i: number) => -170 + i * 62; // gun port x on the hull (ship facing right)
export const portX = (shipX: number, flip: boolean, i: number) => shipX + (flip ? -1 : 1) * PORT(i);

// ---- sea ----
export const waveY = (x: number, f: number, base: number, amp: number, k: number, w: number, ph = 0) => base + Math.sin(x * k + f * w + ph) * amp + Math.sin(x * k * 2.3 - f * w * 1.4 + ph) * amp * 0.35;
// One wave layer: filled down to y 3000; `foam` draws a dashed white crest that travels.
export const Waves = ({ frame, base, amp, k, w, color, foam = false, ph = 0, x0 = -800, x1 = 3200 }: { frame: number; base: number; amp: number; k: number; w: number; color: string; foam?: boolean; ph?: number; x0?: number; x1?: number }) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 24) pts.push(`${x},${waveY(x, frame, base, amp, k, w, ph).toFixed(1)}`);
  return (
    <g>
      <path d={`M${x0},3000 L${pts.join(" L")} L${x1},3000 Z`} fill={color} />
      {foam && <path d={`M${pts.join(" L")}`} stroke="#e8f2f2" strokeWidth={5} fill="none" strokeDasharray="40 70" strokeDashoffset={-frame * 3} opacity={0.75} />}
    </g>
  );
};

// Dusk sky with drifting dark cloud banks and a low sun glow (behind everything).
export const Sky = ({ frame }: { frame: number }) => (
  <g>
    <defs>
      <linearGradient id="nvsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#262f48" />
        <stop offset="0.6" stopColor="#7a6070" />
        <stop offset="1" stopColor="#e09a6a" />
      </linearGradient>
    </defs>
    <rect x={-800} y={-1200} width={4000} height={SEA + 1200} fill="url(#nvsky)" />
    <circle cx={1300} cy={860} r={220} fill="#ffcf8a" opacity={0.3} />
    {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={((i * 560 + frame * (0.8 + i * 0.15)) % 3600) - 800} cy={420 + (i % 3) * 110} rx={420} ry={90} fill="#3a3a4e" opacity={0.55} />)}
  </g>
);

// Deep-water darkening under the near waves and the sun's reflection streaks.
export const Deep = ({ frame }: { frame: number }) => (
  <g>
    <defs><linearGradient id="nv-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2230" stopOpacity={0} /><stop offset="1" stopColor="#0c2230" stopOpacity={0.85} /></linearGradient></defs>
    <rect x={-800} y={SEA + 40} width={4000} height={900} fill="url(#nv-deep)" />
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={1240 + Math.sin(i * 2.1) * 160 + Math.sin(frame * 0.08 + i) * 20} y1={SEA + 70 + i * 22} x2={1300 + Math.sin(i * 2.1) * 160 + Math.sin(frame * 0.08 + i) * 20} y2={SEA + 70 + i * 22} stroke="#ffd9a0" strokeWidth={4} opacity={0.35 - i * 0.018} />)}
  </g>
);

// ---- guns ----
// White powder smoke from a gun: puffs that swell and drift downwind, lingering ~3 s; muzzle flash for 5 frames.
export const PowderSmoke = ({ x, y, age, dir }: { x: number; y: number; age: number; dir: 1 | -1 }) => {
  if (age < 0 || age > 110) return null;
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => {
        const a = age - i * 2;
        if (a < 0) return null;
        const k = a / 110;
        return <circle key={i} cx={x + dir * (30 + a * 1.6 + i * 14)} cy={y - a * 0.5 - i * 6} r={18 + a * 0.9 + i * 4} fill="#efeae0" opacity={0.75 * (1 - k)} />;
      })}
      {age < 5 && <circle cx={x + dir * 22} cy={y} r={34 - age * 5} fill="#ffd25a" />}
    </g>
  );
};

// Water column where a ball falls short (age = frames since it landed).
export const Splash = ({ x, age, big = 1 }: { x: number; age: number; big?: number }) => {
  if (age < 0 || age > 40) return null;
  const up = Math.sin((age / 40) * Math.PI);
  return (
    <g opacity={1 - age / 40}>
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={x + (i - 3) * 12 * big} cy={SEA - up * (120 + (i % 3) * 40) * big + Math.abs(i - 3) * 14} r={(14 + (i % 2) * 6) * big} fill="#f2f8f8" />)}
      <ellipse cx={x} cy={SEA + 6} rx={(30 + age * 3) * big} ry={8 * big} fill="none" stroke="#f2f8f8" strokeWidth={4} />
    </g>
  );
};

// A cannonball from a gun port (fired at `t`) on an arc to target x.
export const Ball = ({ frame, t, x0, x1, flight = 22 }: { frame: number; t: number; x0: number; x1: number; flight?: number }) => {
  const k = interpolate(frame, [t + 1, t + flight], [0, 1], clamp);
  if (k <= 0 || k >= 1) return null;
  return <circle cx={x0 + (x1 - x0) * k} cy={SEA - 52 - Math.sin(k * Math.PI) * 90} r={7} fill="#111" />;
};

// ---- fire (copied from the template's Figures Fire, with its own gradients) ----
export const FireDefs = () => (
  <defs>
    <radialGradient id="nv-flame" cx="0.5" cy="0.8" r="0.8">
      <stop offset="0" stopColor="#fff6c2" />
      <stop offset="0.35" stopColor="#ffd04a" />
      <stop offset="0.7" stopColor="#ff7a1a" />
      <stop offset="1" stopColor="#d6331a" />
    </radialGradient>
    <radialGradient id="nv-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ff9a3c" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ff9a3c" stopOpacity={0} />
    </radialGradient>
  </defs>
);
// Flames with a base at (x, y); size ≈ height in px. Put <FireDefs /> in the svg once.
export const Fire = ({ x, y, size = 60, seed = 0, k = 1 }: { x: number; y: number; size?: number; seed?: number; k?: number }) => {
  const frame = useCurrentFrame();
  const f = (n: number) => 1 + 0.16 * Math.sin(frame * (0.55 + random(`${seed}-${n}`) * 0.5) + random(`${seed}+${n}`) * 6);
  const tongue = (w: number, h: number, dx: number, n: number, fill: string) => (
    <path transform={`translate(${dx},0) scale(${f(n)},${f(n + 5)})`} d={`M${-w} 0 C${-w} ${-h * 0.45} ${-w * 0.15} ${-h * 0.6} ${w * 0.1} ${-h} C${w * 0.3} ${-h * 0.62} ${w} ${-h * 0.45} ${w} 0 Z`} fill={fill} />
  );
  const sc = (size / 60) * k;
  if (sc <= 0) return null;
  return (
    <g transform={`translate(${x},${y}) scale(${sc})`}>
      <circle cx={0} cy={-25} r={55} fill="url(#nv-glow)" />
      {tongue(22, 58, -10, 1, "#c62d14")}
      {tongue(20, 66, 8, 2, "#e04a1a")}
      {tongue(17, 52, 0, 3, "url(#nv-flame)")}
      {tongue(8, 30, -2, 4, "#fff1a8")}
      {[0, 1, 2].map((i) => {
        const a = ((frame * 2 + i * 23 + seed * 7) % 40) / 40;
        return <circle key={i} cx={(random(`e${seed}${i}`) - 0.5) * 30 + a * 10} cy={-30 - a * 50} r={1.8} fill="#ffcf5a" opacity={1 - a} />;
      })}
    </g>
  );
};

// ---- ship ----
// A three-masted warship, facing right (flip = facing left), waterline at SEA + heave, rolled `roll` degrees.
// fires[i] = frames gun port i fires (the gun recoils); mastFall 0–1 topples the mainmast; fire 0–1 sets the deck
// burning; hits = frames shots struck (a scorched hole appears for each).
export const Ship = ({ x, frame, flip, flag, sail, fires, roll, heave, mastFall = 0, fire = 0, hits = [] }: { x: number; frame: number; flip: boolean; flag: string; sail: string; fires: number[][]; roll: number; heave: number; mastFall?: number; fire?: number; hits?: number[] }) => {
  const billow = Math.sin(frame * 0.07) * 6;
  const mast = (mx: number, h: number, sails: number, key: string, fall = 0) => (
    <g key={key} transform={`rotate(${-fall * 80},${mx},-150)`}>
      <rect x={mx - 6} y={-150 - h} width={12} height={h} fill="#4a3020" stroke={PAL.ink} strokeWidth={2.5} />
      {Array.from({ length: sails }, (_, i) => {
        const top = -150 - h + 40 + i * (h * 0.38);
        const sw = 150 - i * 10;
        return (
          <g key={i}>
            <line x1={mx - sw / 2 - 10} y1={top} x2={mx + sw / 2 + 10} y2={top} stroke="#4a3020" strokeWidth={5} />
            <path d={`M${mx - sw / 2} ${top} L${mx + sw / 2} ${top} Q${mx + sw / 2 + 18 + billow} ${top + h * 0.17} ${mx + sw / 2} ${top + h * 0.32} L${mx - sw / 2} ${top + h * 0.32} Q${mx - sw / 2 + 18 + billow} ${top + h * 0.17} ${mx - sw / 2} ${top} Z`} fill={sail} stroke={PAL.ink} strokeWidth={2.5} />
            <path d={`M${mx - 10} ${top + 10} L${mx + 10} ${top + 10} L${mx + 10} ${top + h * 0.25} L${mx - 10} ${top + h * 0.25} Z`} fill={flag} opacity={i === 0 ? 0.9 : 0} />
          </g>
        );
      })}
      <path d={`M${mx} ${-150 - h} L${mx + 50} ${-150 - h + 6 + Math.sin(frame * 0.3) * 5} L${mx} ${-150 - h + 16} Z`} fill={flag} stroke={PAL.ink} strokeWidth={1.5} />
    </g>
  );
  const ports = Array.from({ length: GUNS }, (_, i) => PORT(i));
  return (
    <g transform={`translate(${x},${SEA + heave}) rotate(${roll}) scale(${flip ? -1 : 1},1)`}>
      {mast(-160, 300, 2, "mz")}
      {mast(-20, 380, 3, "mn", mastFall)}
      {mast(120, 340, 3, "fr")}
      <line x1={230} y1={-120} x2={360} y2={-190} stroke="#4a3020" strokeWidth={8} />
      {/* hull */}
      <path d="M-290 -170 L-230 -175 L-220 -130 L230 -120 L300 -150 L250 -30 Q200 20 0 24 Q-210 22 -260 -20 Z" fill="#5a3a22" stroke={PAL.ink} strokeWidth={4} />
      <path d="M-290 -170 L-230 -175 L-226 -150 L-292 -146 Z" fill="#4a2e1a" stroke={PAL.ink} strokeWidth={3} />
      <path d="M-258 -80 L262 -78 L258 -66 L-252 -68 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2} />
      <path d="M-262 -112 L280 -104 L276 -96 L-258 -102 Z" fill="#7a2a22" />
      {ports.map((px, i) => (
        <g key={i}>
          <rect x={px - 13} y={-60} width={26} height={22} fill="#1a120c" stroke={PAL.ink} strokeWidth={2} />
          <rect x={px - 4 - (since(frame, fires[i] ?? []) < 4 ? 6 : 0)} y={-52} width={14} height={8} fill="#2a2a2a" />
        </g>
      ))}
      {/* damage: scorched holes where shots struck */}
      {hits.filter((h) => frame >= h).map((h, i) => <ellipse key={h} cx={-120 + i * 140} cy={-100} rx={24} ry={16} fill="#1a120c" stroke="#7a3a1a" strokeWidth={3} />)}
      {fire > 0 && [-60, 40, 150].map((fx, i) => <Fire key={i} x={fx} y={-140} size={(60 + i * 12) * fire} seed={i + 2} />)}
    </g>
  );
};

// Dark smoke column rising from a burning ship at x (starts at frame `from`, strength k 0–1).
export const ShipSmoke = ({ frame, from, x, k }: { frame: number; from: number; x: number; k: number }) => (
  <g>
    {k > 0 && Array.from({ length: 8 }, (_, i) => {
      const a = (frame - from + i * 14) % 112;
      return <circle key={i} cx={x - 40 + a * 1.2} cy={SEA - 300 - a * 3.2} r={40 + a * 1.1} fill="#2e2a2a" opacity={0.5 * k * (1 - a / 112)} />;
    })}
  </g>
);
