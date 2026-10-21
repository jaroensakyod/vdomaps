import { random, useCurrentFrame } from "remotion";

// More 18th-century pieces in the news-figure style (feet / waterline at y = 0, ~110 units tall at scale 1,
// two-tone fills, 1.5 px dark outline, small idle motion).
const INK = "#1b1d24";
type Fig = { x: number; y: number; scale?: number; phase?: number; flip?: boolean };

// Siamese soldier / defender: dark jacket, pha chong kraben, round helmet; spear, gun or nothing.
export const SiamSoldier = ({ x, y, scale = 1, phase = 0, flip = false, hold = "spear", walk = false, jacket = "#2f4f86" }: Fig & { hold?: "spear" | "gun" | "none"; walk?: boolean; jacket?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.3 + phase;
  const swing = walk ? Math.sin(t) * 15 : 0;
  const bob = walk ? -Math.abs(Math.sin(t)) * 2.5 : Math.sin(frame * 0.07 + phase) * 0.8;
  const skin = "#c98f62";
  const leg = (a: number, back: boolean) => (
    <g transform={`translate(0,-40) rotate(${a})`} opacity={back ? 0.85 : 1}>
      <path d="M-4.5 0 L4.5 0 L4 38 L-3.5 38 Z" fill={skin} stroke={INK} strokeWidth={1.5} />
      <path d="M-4 37 L7 37 Q8 40 6 41 L-4 41 Z" fill={skin} stroke={INK} strokeWidth={1.1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={13} ry={3} fill="#000" opacity={0.28} />
      {leg(-swing, true)}
      {leg(swing, false)}
      {/* chong kraben: wrapped trousers to the knee */}
      <path d="M-12 -58 L12 -58 L11 -26 L4 -26 L0 -36 L-4 -26 L-11 -26 Z" fill="#7a2f4a" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={`M-4 -82 Q-10 -68 ${-6 - swing * 0.4} -56`} stroke={jacket} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M-11 -86 Q-12 -70 -11 -56 L11 -56 Q12 -70 11 -86 Q0 -91 -11 -86 Z" fill={jacket} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M-11 -60 L11 -60" stroke="#d9b45a" strokeWidth={3} />
      <rect x={-3} y={-94} width={6} height={7} fill={skin} />
      <g transform="translate(0,-103)">
        <ellipse cx={0} cy={0} rx={9.5} ry={10.5} fill={skin} stroke={INK} strokeWidth={1.5} />
        <path d="M-11 -2 Q-11 -17 0 -17 Q11 -17 11 -2 Q0 -6 -11 -2 Z" fill="#8a7a52" stroke={INK} strokeWidth={1.3} />
        <path d="M-1.5 -17 L0 -24 L1.5 -17 Z" fill="#8a7a52" stroke={INK} strokeWidth={1} />
        <circle cx={5} cy={1} r={1.3} fill={INK} />
        <path d="M2 6 Q5 7 7 5" stroke={INK} strokeWidth={1.1} fill="none" />
      </g>
      <g transform={`translate(6,-82) rotate(${hold === "gun" ? -75 : -35 - swing * 0.4})`}>
        <path d="M0 0 L0 22" stroke={jacket} strokeWidth={7} strokeLinecap="round" />
        <circle cx={0} cy={24} r={3.6} fill={skin} stroke={INK} strokeWidth={1.1} />
        {hold === "spear" && (
          <g transform="translate(0,24) rotate(125)">
            <line x1={-30} y1={0} x2={70} y2={0} stroke="#6b4a2b" strokeWidth={2.6} strokeLinecap="round" />
            <path d="M70 -4 L86 0 L70 4 Z" fill="#c9ced3" stroke={INK} strokeWidth={1.1} />
          </g>
        )}
        {hold === "gun" && (
          <g transform="translate(0,22) rotate(75)">
            <rect x={-14} y={-3} width={58} height={5} rx={1.5} fill="#5a3a22" stroke={INK} strokeWidth={1} />
            <rect x={30} y={-2.2} width={26} height={3.4} fill="#6d6f73" />
          </g>
        )}
      </g>
    </g>
  );
};

// Townsperson / trader / villager: sarong, bare-chested or a loose shirt, optional basket on a shoulder pole.
export const Townsperson = ({ x, y, scale = 1, phase = 0, flip = false, walk = true, cloth = "#b5532e", shirt, load = false, woman = false }: Fig & { walk?: boolean; cloth?: string; shirt?: string; load?: boolean; woman?: boolean }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.28 + phase;
  const swing = walk ? Math.sin(t) * 13 : 0;
  const bob = walk ? -Math.abs(Math.sin(t)) * 2 : 0;
  const skin = woman ? "#d7a07a" : "#b97c53";
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={1} rx={12} ry={3} fill="#000" opacity={0.25} />
      {[-swing, swing].map((a, i) => (
        <g key={i} transform={`translate(0,-36) rotate(${a})`} opacity={i ? 1 : 0.85}>
          <path d="M-4 0 L4 0 L3.6 35 L-3.2 35 Z" fill={skin} stroke={INK} strokeWidth={1.4} />
        </g>
      ))}
      <path d={woman ? "M-12 -62 L12 -62 L13 -14 L-13 -14 Z" : "M-12 -60 L12 -60 L11 -30 L-11 -30 Z"} fill={cloth} stroke={INK} strokeWidth={1.4} />
      {[-6, 0, 6].map((cx) => <line key={cx} x1={cx} y1={-59} x2={cx} y2={woman ? -15 : -31} stroke="#000" strokeOpacity={0.15} strokeWidth={2} />)}
      <path d="M-10 -84 Q-11 -70 -11 -60 L11 -60 Q11 -70 10 -84 Q0 -89 -10 -84 Z" fill={shirt ?? skin} stroke={INK} strokeWidth={1.4} />
      {woman && <path d="M-10 -80 L10 -70" stroke="#c9a03c" strokeWidth={5} />}
      <g transform="translate(0,-98)">
        <ellipse cx={0} cy={0} rx={9} ry={10} fill={skin} stroke={INK} strokeWidth={1.4} />
        <path d={woman ? "M-9 -2 Q-10 -13 0 -13 Q10 -13 9 -2 Q4 -8 -2 -7 Q-7 -6 -9 -2 Z" : "M-9 -4 Q-9 -12 0 -12 Q9 -12 9 -4 Q0 -8 -9 -4 Z"} fill="#1c1410" />
        <circle cx={4.5} cy={1} r={1.2} fill={INK} />
      </g>
      {load ? (
        <g transform="translate(0,-86)">
          <line x1={-40} y1={0} x2={40} y2={-4} stroke="#8b5a2b" strokeWidth={3} />
          {[-38, 38].map((bx) => (
            <g key={bx} transform={`translate(${bx},${-2 + Math.sin(frame * 0.3 + phase) * 1.5})`}>
              <line x1={-6} y1={0} x2={-8} y2={20} stroke="#6b4a2b" strokeWidth={1} />
              <line x1={6} y1={0} x2={8} y2={20} stroke="#6b4a2b" strokeWidth={1} />
              <path d="M-12 20 L12 20 L9 36 L-9 36 Z" fill="#c9a36a" stroke={INK} strokeWidth={1.2} />
              <ellipse cx={0} cy={20} rx={11} ry={4} fill={bx < 0 ? "#e8c75a" : "#7aa04a"} stroke={INK} strokeWidth={1} />
            </g>
          ))}
        </g>
      ) : (
        <path d={`M6 -80 Q12 -66 ${8 + swing * 0.4} -54`} stroke={shirt ?? skin} strokeWidth={6.5} strokeLinecap="round" fill="none" />
      )}
    </g>
  );
};

// Chinese junk, waterline at y. sails = battened mat sails.
export const Junk = ({ x, y, scale = 1, phase = 0, flip = false }: Fig) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.08 + phase) * 2;
  const roll = Math.sin(frame * 0.06 + phase) * 1.2;
  return (
    <g transform={`translate(${x},${y + bob}) rotate(${roll}) scale(${flip ? -scale : scale},${scale})`}>
      <path d="M-95 -30 Q-100 -10 -80 0 L80 0 Q100 -8 108 -42 L70 -34 L-70 -34 Z" fill="#7b4a2a" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M-90 -22 L100 -30" stroke="#c9302c" strokeWidth={4} />
      <circle cx={-78} cy={-16} r={5} fill="#f3e6c4" stroke={INK} strokeWidth={1.2} />
      {[[-40, 120, 70], [25, 150, 84], [80, 90, 50]].map(([mx, h, w], i) => (
        <g key={i}>
          <line x1={mx} y1={-34} x2={mx} y2={-34 - h} stroke={INK} strokeWidth={2.4} />
          <path d={`M${mx} ${-34 - h} L${mx - w} ${-26 - h} Q${mx - w - 6} ${-60} ${mx - w + 4} ${-44} L${mx} ${-46} Z`} fill={i === 1 ? "#d9a35e" : "#c98f4e"} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
          {Array.from({ length: 6 }, (_, k) => <line key={k} x1={mx} y1={-50 - (k * (h - 20)) / 6} x2={mx - w - 2} y2={-44 - (k * (h - 20)) / 6} stroke={INK} strokeWidth={1} opacity={0.6} />)}
        </g>
      ))}
    </g>
  );
};

// European ship (Dutch / Portuguese, 17th–18th c.): high stern, square sails, flag.
export const Galleon = ({ x, y, scale = 1, phase = 0, flip = false, flag = ["#c0392b", "#f4f1e8", "#1f4e8c"] }: Fig & { flag?: string[] }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + phase) * 2;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      <path d="M-100 -46 L-96 -10 Q-90 0 -70 0 L72 0 Q92 -4 104 -26 L60 -24 L60 -34 L-60 -34 L-62 -60 L-100 -60 Z" fill="#5d3a22" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M-96 -20 L100 -22" stroke="#c9a03c" strokeWidth={3} />
      {[-70, -40, -10, 20, 50].map((px) => <rect key={px} x={px} y={-17} width={9} height={7} fill="#1b1d24" />)}
      {[[-30, 170], [40, 140]].map(([mx, h], i) => (
        <g key={i}>
          <line x1={mx} y1={-34} x2={mx} y2={-34 - h} stroke={INK} strokeWidth={3} />
          {[0, 1].map((k) => (
            <path key={k} d={`M${mx - 42 + k * 6} ${-60 - h * 0.45 * k - 10} Q${mx} ${-48 - h * 0.45 * k + Math.sin(frame * 0.1 + i) * 2} ${mx + 42 - k * 6} ${-60 - h * 0.45 * k - 10} L${mx + 38 - k * 6} ${-60 - h * 0.45 * k - 60 + k * 16} L${mx - 38 + k * 6} ${-60 - h * 0.45 * k - 60 + k * 16} Z`} fill="#efe6cf" stroke={INK} strokeWidth={1.4} />
          ))}
        </g>
      ))}
      <g transform="translate(-30,-204)">
        {flag.map((c, k) => <rect key={k} x={0} y={k * 6} width={30} height={6} fill={c} />)}
      </g>
    </g>
  );
};

// Small rowing boat (sampan) with one or two people.
export const Sampan = ({ x, y, scale = 1, phase = 0, flip = false, people = 1, cargo = false }: Fig & { people?: number; cargo?: boolean }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.1 + phase) * 1.5;
  return (
    <g transform={`translate(${x},${y + bob}) scale(${flip ? -scale : scale},${scale})`}>
      {cargo && [-20, -4, 12].map((cx) => <ellipse key={cx} cx={cx} cy={-14} rx={9} ry={7} fill={cx === -4 ? "#7aa04a" : "#e0b65a"} stroke={INK} strokeWidth={1} />)}
      {Array.from({ length: people }, (_, i) => (
        <g key={i} transform={`translate(${30 - i * 50},-12)`}>
          <path d="M-6 0 L6 0 L5 -22 L-5 -22 Z" fill="#3a5a7a" stroke={INK} strokeWidth={1.2} />
          <circle cx={0} cy={-28} r={6} fill="#b97c53" stroke={INK} strokeWidth={1.2} />
          <path d="M-12 -32 Q0 -42 12 -32 Z" fill="#d8c48a" stroke={INK} strokeWidth={1} />
          <line x1={2} y1={-16} x2={22 + Math.sin(frame * 0.25 + phase + i) * 6} y2={10} stroke="#6b4a2b" strokeWidth={2.4} />
        </g>
      ))}
      <path d="M-56 -12 Q-50 2 -30 2 L36 2 Q54 0 60 -14 Z" fill="#8a5a32" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  );
};

// War elephant (news style) with mahout and a howdah.
export const WarElephant = ({ x, y, scale = 1, phase = 0, flip = false, walk = true, side = "#c7322a" }: Fig & { walk?: boolean; side?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.18 + phase;
  const sw = walk ? Math.sin(t) * 7 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={60} ry={6} fill="#000" opacity={0.25} />
      {[[-40, -sw], [-22, sw], [22, -sw], [40, sw]].map(([lx, a], i) => (
        <g key={i} transform={`rotate(${a},${lx},-44)`} opacity={i % 2 ? 1 : 0.85}>
          <path d={`M${lx - 9} -46 L${lx + 9} -46 L${lx + 8} 0 L${lx - 8} 0 Z`} fill="#8d8b93" stroke={INK} strokeWidth={1.6} />
        </g>
      ))}
      <path d="M-58 -44 Q-64 -112 -6 -116 Q46 -118 54 -82 L56 -44 Z" fill="#9a98a0" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M44 -104 Q80 -112 80 -76 Q82 -40 70 -14 Q64 -8 60 -16 Q68 -40 60 -60" fill="#9a98a0" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M34 -96 Q20 -74 38 -64 Q46 -70 44 -88 Z" fill="#88868e" stroke={INK} strokeWidth={1.4} />
      <circle cx={64} cy={-92} r={2.6} fill={INK} />
      <path d="M70 -66 Q88 -64 92 -58" stroke="#f4ecd8" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M-40 -112 L30 -112 L34 -104 L-44 -104 Z" fill={side} stroke={INK} strokeWidth={1.4} />
      <path d="M-34 -104 Q-34 -80 -40 -70 L26 -70 Q22 -80 24 -104 Z" fill={side} stroke={INK} strokeWidth={1.4} opacity={0.9} />
      <path d="M-30 -134 L22 -134 L26 -112 L-34 -112 Z" fill="#c9a03c" stroke={INK} strokeWidth={1.4} />
      <circle cx={-4} cy={-146} r={8} fill="#a86b45" stroke={INK} strokeWidth={1.3} />
      <path d="M-14 -150 Q-4 -160 6 -150 Z" fill={side} stroke={INK} strokeWidth={1} />
      <circle cx={42} cy={-120} r={7} fill="#a86b45" stroke={INK} strokeWidth={1.3} />
      <path d={`M-36 -134 Q-60 ${-150 + Math.sin(frame * 0.1) * 2} -60 -170`} stroke="#6b4a2b" strokeWidth={2} fill="none" />
    </g>
  );
};

// Rain streaks over a box.
export const Rain = ({ x, y, W, H, s, n = 70, k = 1 }: { x: number; y: number; W: number; H: number; s: number; n?: number; k?: number }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g stroke="#cfe3f0" strokeWidth={2 * s} opacity={0.55 * k}>
      {Array.from({ length: n }, (_, i) => {
        const p = (random(`r${i}`) + frame * 0.06) % 1;
        const rx = x + random(`rx${i}`) * W;
        const ry = y + p * H;
        return <line key={i} x1={rx} y1={ry} x2={rx - 6 * s} y2={ry + 18 * s} />;
      })}
    </g>
  );
};

// Dry, cracked field strip.
export const DryField = ({ x, y, W, H, s }: { x: number; y: number; W: number; H: number; s: number }) => (
  <g>
    <rect x={x} y={y} width={W} height={H} fill="#c9a66b" />
    {Array.from({ length: 26 }, (_, i) => {
      const cx = x + random(`c${i}`) * W;
      const cy = y + 6 * s + random(`cy${i}`) * (H - 12 * s);
      return <path key={i} d={`M${cx} ${cy} l${10 * s} ${4 * s} l${6 * s} ${-6 * s} M${cx + 10 * s} ${cy + 4 * s} l${4 * s} ${8 * s}`} stroke="#8f6e3f" strokeWidth={1.4 * s} fill="none" />;
    })}
  </g>
);

// Water surface across a box at level y (waves move).
export const WaterBand = ({ x, y, W, H, s, color = "#5f97b5" }: { x: number; y: number; W: number; H: number; s: number; color?: string }) => {
  const frame = useCurrentFrame();
  const n = 24;
  const top = Array.from({ length: n + 1 }, (_, i) => `${x + (i / n) * W},${y + Math.sin(i * 1.4 + frame * 0.12) * 3 * s}`).join(" L");
  return (
    <g>
      <path d={`M${x},${y + H} L${top} L${x + W},${y + H} Z`} fill={color} opacity={0.88} />
      <path d={`M${top}`} fill="none" stroke="#d6ecf5" strokeWidth={2.5 * s} opacity={0.8} />
    </g>
  );
};

// Market stall with an awning and goods.
export const Stall = ({ x, y, s, awning = "#c0392b", goods = ["#e8c75a", "#7aa04a", "#c9302c"] }: { x: number; y: number; s: number; awning?: string; goods?: string[] }) => (
  <g>
    <rect x={x - 46 * s} y={y - 34 * s} width={92 * s} height={34 * s} fill="#8a5a32" stroke={INK} strokeWidth={1.4 * s} />
    {goods.map((c, i) => <ellipse key={i} cx={x + (-28 + i * 28) * s} cy={y - 38 * s} rx={12 * s} ry={7 * s} fill={c} stroke={INK} strokeWidth={s} />)}
    <line x1={x - 44 * s} y1={y - 34 * s} x2={x - 44 * s} y2={y - 86 * s} stroke={INK} strokeWidth={2 * s} />
    <line x1={x + 44 * s} y1={y - 34 * s} x2={x + 44 * s} y2={y - 86 * s} stroke={INK} strokeWidth={2 * s} />
    <path d={`M${x - 56 * s} ${y - 80 * s} L${x} ${y - 100 * s} L${x + 56 * s} ${y - 80 * s} Z`} fill={awning} stroke={INK} strokeWidth={1.4 * s} />
  </g>
);

// Bronze cannon on a wall, pointing right; fire 0 → 1 flash + smoke.
export const WallCannon = ({ x, y, s, fire = 0, flip = false }: { x: number; y: number; s: number; fire?: number; flip?: boolean }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
    <circle cx={-10} cy={-8} r={9} fill="#6b4a2b" stroke={INK} strokeWidth={1.4} />
    <path d="M-30 -22 L34 -26 L36 -14 L-28 -10 Z" fill="#b08236" stroke={INK} strokeWidth={1.5} />
    {fire > 0 && fire < 1 && (
      <g opacity={1 - fire}>
        <path d={`M38 -20 l${18 + fire * 16} -8 l-6 8 l${16 + fire * 10} 5 l-20 2 Z`} fill="#ffcf3f" stroke={INK} strokeWidth={1} />
        <circle cx={60 + fire * 36} cy={-24 - fire * 12} r={10 + fire * 18} fill="#9a958f" opacity={0.7} />
      </g>
    )}
  </g>
);
