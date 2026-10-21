import { interpolate, random, useCurrentFrame } from "remotion";

// Bang Rachan pieces: villagers (fighters), the monk, buffalo, a bronze-casting furnace, manuscripts, the monument.
const INK = "#1b1d24";

// Villager fighter: bare-chested, pha khao ma round the waist, red headband; spear / sword / hoe / sickle / none.
// pose: stand · charge (running forward, weapon up) · dig (hoe swinging) · cheer. mustache for นายจันหนวดเขี้ยว.
export const Villager = ({ x, y, scale = 1, phase = 0, flip = false, hold = "spear", pose = "stand", mustache = false, band = "#c7322a", cloth = "#3f6a3a", skin = "#b97c53" }: { x: number; y: number; scale?: number; phase?: number; flip?: boolean; hold?: "spear" | "sword" | "hoe" | "sickle" | "none"; pose?: "stand" | "charge" | "dig" | "cheer"; mustache?: boolean; band?: string; cloth?: string; skin?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * (pose === "charge" ? 0.42 : 0.25) + phase;
  const swing = pose === "charge" ? Math.sin(t) * 22 : 0;
  const bob = pose === "charge" ? -Math.abs(Math.sin(t)) * 4 : Math.sin(frame * 0.07 + phase) * 0.8;
  const lean = pose === "charge" ? 12 : pose === "dig" ? 16 : 0;
  const armA = pose === "dig" ? -150 + Math.abs(Math.sin(frame * 0.18 + phase)) * 120 : pose === "charge" ? -120 : pose === "cheer" ? -165 + Math.sin(frame * 0.3 + phase) * 10 : -35;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.28} />
      {[-swing, swing].map((a, i) => (
        <g key={i} transform={`translate(0,-38) rotate(${a})`} opacity={i ? 1 : 0.85}>
          <path d="M-4.5 0 L4.5 0 L4 37 L-3.5 37 Z" fill={skin} stroke={INK} strokeWidth={1.5} />
        </g>
      ))}
      <g transform={`rotate(${lean},0,-38)`}>
        <path d="M-12 -56 L12 -56 L11 -30 L4 -28 L0 -36 L-4 -28 L-11 -30 Z" fill={cloth} stroke={INK} strokeWidth={1.4} />
        <path d="M-12 -52 L12 -52" stroke="#e9d8a6" strokeWidth={2} strokeDasharray="4 3" />
        <path d={`M-4 -82 Q-10 -70 ${-6 - swing * 0.4} -58`} stroke={skin} strokeWidth={6.5} strokeLinecap="round" fill="none" />
        <path d="M-11 -86 Q-12 -70 -11 -56 L11 -56 Q12 -70 11 -86 Q0 -91 -11 -86 Z" fill={skin} stroke={INK} strokeWidth={1.4} />
        <path d="M-6 -78 Q0 -74 6 -78" stroke="#8a5a3a" strokeWidth={1.2} fill="none" />
        <rect x={-3} y={-94} width={6} height={7} fill={skin} />
        <g transform="translate(0,-103)">
          <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.4} />
          <path d="M-10 -4 Q-10 -14 0 -14 Q10 -14 10 -4 Q0 -8 -10 -4 Z" fill="#1c1410" />
          <path d="M-10 -5 L10 -5" stroke={band} strokeWidth={4} />
          <path d={`M-9 -5 L-17 ${-1 + Math.sin(frame * 0.3 + phase) * 2} L-14 3`} stroke={band} strokeWidth={3} fill="none" />
          <circle cx={5} cy={0} r={1.3} fill={INK} />
          {mustache ? <path d="M-2 5 Q4 2 10 5 Q16 9 18 4 M-2 5 Q-6 9 -9 5" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" /> : <path d="M2 6 Q5 7 7 5" stroke={INK} strokeWidth={1.1} fill="none" />}
          {mustache && <path d="M-3 -3 L3 -5 M5 -5 L10 -3" stroke={INK} strokeWidth={2} />}
        </g>
        <g transform={`translate(6,-82) rotate(${armA})`}>
          <path d="M0 0 L0 22" stroke={skin} strokeWidth={6.5} strokeLinecap="round" />
          <circle cx={0} cy={24} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
          {hold === "spear" && <g transform="translate(0,24) rotate(110)"><line x1={-30} y1={0} x2={70} y2={0} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" /><path d="M70 -4 L86 0 L70 4 Z" fill="#c9ced3" stroke={INK} strokeWidth={1.1} /></g>}
          {hold === "sword" && <g transform="translate(0,24) rotate(160)"><path d="M0 -2 L40 -4 Q48 0 40 4 L0 2 Z" fill="#dfe3e6" stroke={INK} strokeWidth={1} /></g>}
          {hold === "hoe" && <g transform="translate(0,24) rotate(100)"><line x1={-10} y1={0} x2={56} y2={0} stroke="#6b4a2b" strokeWidth={2.6} /><path d="M56 -2 L58 16 L50 16 L50 -2 Z" fill="#9aa0a4" stroke={INK} strokeWidth={1} /></g>}
          {hold === "sickle" && <path d="M0 26 Q16 20 14 6 Q10 18 0 22 Z" fill="#cfd3d6" stroke={INK} strokeWidth={1} />}
        </g>
      </g>
    </g>
  );
};

// Buddhist monk in saffron robes, seated (blessing) or standing.
export const Monk = ({ x, y, scale = 1, seated = true }: { x: number; y: number; scale?: number; seated?: boolean }) => {
  const frame = useCurrentFrame();
  const skin = "#c98f62";
  const b = Math.sin(frame * 0.06) * 0.6;
  return (
    <g transform={`translate(${x},${y + b}) scale(${scale})`}>
      <ellipse cx={0} cy={1} rx={seated ? 30 : 13} ry={4} fill="#000" opacity={0.28} />
      {seated ? (
        <path d="M-32 0 Q-34 -22 -14 -26 L-14 -70 Q0 -78 14 -70 L14 -26 Q34 -22 32 0 Z" fill="#e0861f" stroke={INK} strokeWidth={1.5} />
      ) : (
        <path d="M-13 0 L-14 -76 Q0 -84 14 -76 L13 0 Z" fill="#e0861f" stroke={INK} strokeWidth={1.5} />
      )}
      <path d={seated ? "M-14 -66 L14 -36" : "M-14 -72 L13 -30"} stroke="#b8661a" strokeWidth={5} />
      <path d={seated ? "M14 -56 Q22 -48 16 -40" : "M14 -66 Q22 -56 16 -48"} stroke={skin} strokeWidth={6} strokeLinecap="round" fill="none" />
      <g transform={`translate(0,${seated ? -82 : -88})`}>
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={skin} stroke={INK} strokeWidth={1.4} />
        <path d="M2 5 Q5 6 7 4" stroke={INK} strokeWidth={1.1} fill="none" />
        <path d="M2 -1 Q4 -2 7 -1" stroke={INK} strokeWidth={1.2} fill="none" />
      </g>
    </g>
  );
};

// Water buffalo.
export const Buffalo = ({ x, y, scale = 1, flip = false, phase = 0 }: { x: number; y: number; scale?: number; flip?: boolean; phase?: number }) => {
  const frame = useCurrentFrame();
  const tail = Math.sin(frame * 0.15 + phase) * 10;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={44} ry={5} fill="#000" opacity={0.25} />
      {[-28, -16, 18, 30].map((lx) => <rect key={lx} x={lx - 4} y={-30} width={8} height={30} fill="#4a4a50" stroke={INK} strokeWidth={1.2} />)}
      <path d="M-40 -28 Q-44 -62 -6 -62 L26 -60 Q40 -58 40 -30 Z" fill="#55555c" stroke={INK} strokeWidth={1.5} />
      <path d={`M-40 -50 Q-50 ${-40 + tail * 0.3} -48 -24`} stroke="#3a3a40" strokeWidth={3} fill="none" />
      <path d="M34 -56 Q50 -62 58 -48 Q60 -36 50 -34 L36 -36 Z" fill="#55555c" stroke={INK} strokeWidth={1.4} />
      <path d="M40 -60 Q30 -78 10 -74 Q30 -70 36 -58 Z M52 -60 Q64 -80 82 -72 Q64 -68 56 -58 Z" fill="#d8d0bc" stroke={INK} strokeWidth={1.2} />
      <circle cx={50} cy={-50} r={1.8} fill={INK} />
    </g>
  );
};

// Bronze casting: a clay furnace pouring glowing metal into a cannon mould.
export const Furnace = ({ x, y, s, pour = 1 }: { x: number; y: number; s: number; pour?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={`M${x - 50 * s} ${y} L${x - 36 * s} ${y - 120 * s} L${x + 36 * s} ${y - 120 * s} L${x + 50 * s} ${y} Z`} fill="#8a5a3a" stroke={INK} strokeWidth={1.6 * s} />
      <rect x={x - 20 * s} y={y - 50 * s} width={40 * s} height={30 * s} rx={10 * s} fill="#ff7a1a" />
      <circle cx={x} cy={y - 35 * s} r={(10 + Math.sin(frame * 0.5) * 2) * s} fill="#ffd34d" />
      {[0, 1, 2].map((i) => <circle key={i} cx={x + Math.sin(frame * 0.1 + i) * 8 * s} cy={y - (130 + ((frame * 2 + i * 30) % 80)) * s} r={(10 + i * 4) * s} fill="#8b8682" opacity={0.5} />)}
      {pour > 0 && <path d={`M${x + 40 * s} ${y - 90 * s} Q${x + 80 * s} ${y - 80 * s} ${x + 90 * s} ${y - 20 * s}`} stroke="#ffb03a" strokeWidth={8 * s * pour} fill="none" style={{ filter: `drop-shadow(0 0 ${8 * s}px #ff7a1a)` }} />}
      <rect x={x + 70 * s} y={y - 22 * s} width={110 * s} height={22 * s} rx={6 * s} fill="#6b4a2b" stroke={INK} strokeWidth={1.4 * s} />
      <rect x={x + 76 * s} y={y - 18 * s} width={98 * s * pour} height={10 * s} rx={4 * s} fill="#ff9a2a" />
    </g>
  );
};

// Large bronze cannon on a carriage (side view, muzzle right). crack 0 → 1 draws the crack, puff = smoke.
export const BigCannon = ({ x, y, s, crack = 0, puff = 0 }: { x: number; y: number; s: number; crack?: number; puff?: number }) => (
  <g>
    <circle cx={x - 40 * s} cy={y - 26 * s} r={26 * s} fill="#6b4a2b" stroke={INK} strokeWidth={2 * s} />
    <circle cx={x - 40 * s} cy={y - 26 * s} r={6 * s} fill={INK} />
    <path d={`M${x - 110 * s} ${y - 70 * s} L${x + 110 * s} ${y - 82 * s} L${x + 112 * s} ${y - 52 * s} L${x - 104 * s} ${y - 36 * s} Z`} fill="#b08236" stroke={INK} strokeWidth={2 * s} />
    {[-70, -10, 60].map((bx) => <rect key={bx} x={x + bx * s} y={y - 78 * s} width={8 * s} height={40 * s} fill="#8f6a2a" />)}
    {crack > 0 && <path d={`M${x + 10 * s} ${y - 76 * s} l${-10 * s} ${12 * s * crack} l${14 * s} ${8 * s * crack} l${-8 * s} ${12 * s * crack} l${10 * s} ${8 * s * crack}`} stroke={INK} strokeWidth={4 * s} fill="none" />}
    {puff > 0 && puff < 1 && <circle cx={x + 10 * s} cy={y - 70 * s - puff * 40 * s} r={(16 + puff * 30) * s} fill="#8b8682" opacity={0.7 * (1 - puff)} />}
  </g>
);

// Thai folding book (samut khoi) open, with lines of script; Burmese palm-leaf manuscript (mostly blank).
export const SamutKhoi = ({ x, y, s, k = 1 }: { x: number; y: number; s: number; k?: number }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${x - 160 * s + i * 80 * s} ${y - (i % 2 ? 6 : 0) * s} l${80 * s} ${(i % 2 ? 6 : -6) * s} l0 ${-110 * s} l${-80 * s} ${(i % 2 ? -6 : 6) * s} Z`} fill="#efe1bb" stroke={INK} strokeWidth={1.4 * s} />
    ))}
    {Array.from({ length: 16 }, (_, i) => {
      const col = Math.floor(i / 4);
      const row = i % 4;
      const show = interpolate(k, [i / 16, i / 16 + 0.06], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return <path key={i} d={`M${x - 150 * s + col * 80 * s} ${y - (90 - row * 22) * s} q${15 * s} ${-6 * s} ${30 * s} 0 t${30 * s} 0`} stroke="#3b2a1a" strokeWidth={2 * s} fill="none" opacity={show} />;
    })}
  </g>
);

export const PalmLeaf = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    {[0, 1, 2].map((i) => <rect key={i} x={x - 170 * s} y={y - (70 - i * 26) * s} width={340 * s} height={20 * s} rx={10 * s} fill="#d9c08a" stroke={INK} strokeWidth={1.3 * s} />)}
    <line x1={x} y1={y - 80 * s} x2={x} y2={y - 6 * s} stroke="#8a3324" strokeWidth={3 * s} />
    <path d={`M${x - 140 * s} ${y - 62 * s} q${20 * s} ${-4 * s} ${40 * s} 0`} stroke="#3b2a1a" strokeWidth={2 * s} fill="none" />
  </g>
);

// Bang Rachan memorial: a raised plinth with a row of hero statues (bronze), flowers in front.
export const Monument = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    <rect x={x - 200 * s} y={y - 50 * s} width={400 * s} height={50 * s} fill="#cfc6b0" stroke={INK} strokeWidth={1.6 * s} />
    <rect x={x - 180 * s} y={y - 70 * s} width={360 * s} height={20 * s} fill="#bdb39a" stroke={INK} strokeWidth={1.4 * s} />
    {Array.from({ length: 6 }, (_, i) => {
      const sx = x - 150 * s + i * 60 * s;
      return (
        <g key={i} fill="#6b5a3a" stroke={INK} strokeWidth={1.2 * s}>
          <path d={`M${sx - 12 * s} ${y - 70 * s} L${sx - 10 * s} ${y - 140 * s} L${sx + 10 * s} ${y - 140 * s} L${sx + 12 * s} ${y - 70 * s} Z`} />
          <circle cx={sx} cy={y - 152 * s} r={11 * s} />
          <line x1={sx + 14 * s} y1={y - 130 * s} x2={sx + 22 * s} y2={y - 200 * s} strokeWidth={3 * s} />
        </g>
      );
    })}
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x - 190 * s + i * 29 * s} cy={y - 4 * s} r={7 * s} fill={["#f2c14e", "#e4572e", "#f6f0e0"][i % 3]} stroke={INK} strokeWidth={s} />)}
  </g>
);

// Scatter helper: deterministic offsets.
export const jitter = (key: string, amp: number) => (random(key) - 0.5) * 2 * amp;
