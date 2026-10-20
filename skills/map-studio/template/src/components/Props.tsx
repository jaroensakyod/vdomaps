import { random, useCurrentFrame } from "remotion";
import { Fire, Smoke } from "./Figures";

// Detailed scenery and objects for news insets. Same conventions as Figures: SVG, (x, y) = ground point
// unless noted, `scale` multiplies a design size of ~1 px per unit, 1.6 px dark outlines, two-tone shading.
const INK = "#1b1d24";
type P = { x: number; y: number; scale?: number };

/* ---------- airborne ---------- */

// Delta-wing attack drone seen from the side-top, flying to the left; prop disc at the back.
export const Drone = ({ x, y, scale = 1, flip = false }: P & { flip?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <path d="M-30 0 L18 -4 L26 0 L18 4 Z" fill="#7a7f87" stroke={INK} strokeWidth={1.4} />
      <path d="M-4 -2 L22 -22 L28 -22 L14 0 Z" fill="#8d939b" stroke={INK} strokeWidth={1.3} />
      <path d="M-4 2 L18 14 L24 14 L12 2 Z" fill="#5f646b" stroke={INK} strokeWidth={1.2} />
      <rect x={20} y={-10} width={3} height={20} fill="#555" />
      <ellipse cx={30} cy={0} rx={2} ry={10 * Math.abs(Math.sin(frame * 1.7))} fill="#ccc" opacity={0.7} />
      <circle cx={-26} cy={0} r={2} fill="#ff3b30" opacity={frame % 10 < 5 ? 1 : 0.3} />
    </g>
  );
};

// Cruise/ballistic missile with flame and a fading trail behind it; `angle` in degrees (0 = flying right).
export const Missile = ({ x, y, scale = 1, angle = 0, trail = 160 }: P & { angle?: number; trail?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`}>
      <defs>
        <linearGradient id="missile-trail" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#f5f5f5" stopOpacity={0.9} />
          <stop offset="1" stopColor="#f5f5f5" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-trail - 18} y={-4} width={trail} height={8} rx={4} fill="url(#missile-trail)" />
      <path d={`M-20 0 L${-28 - (frame % 4) * 2} -4 L${-34 - (frame % 3) * 3} 0 L${-28 - (frame % 4) * 2} 4 Z`} fill="#ffb347" />
      <rect x={-20} y={-4} width={34} height={8} rx={2} fill="#d9dde3" stroke={INK} strokeWidth={1.3} />
      <path d="M14 -4 Q24 0 14 4 Z" fill="#9aa3ad" stroke={INK} strokeWidth={1.3} />
      <path d="M-20 -4 L-26 -10 L-14 -4 Z M-20 4 L-26 10 L-14 4 Z" fill="#9aa3ad" stroke={INK} strokeWidth={1} />
    </g>
  );
};

// Air-defence interceptor streak: a curved white trail from (x0, y0) toward (x1, y1), drawn to `p` (0–1).
export const Interceptor = ({ x0, y0, x1, y1, p, s }: { x0: number; y0: number; x1: number; y1: number; p: number; s: number }) => {
  if (p <= 0) return null;
  const mx = (x0 + x1) / 2 - 40 * s;
  const my = Math.min(y0, y1) - 60 * s;
  const n = 30;
  const pts = Array.from({ length: Math.max(2, Math.round(n * p)) }, (_, i) => {
    const t = (i / n) * 1;
    return [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1];
  });
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
  const [hx, hy] = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke="#fff" strokeWidth={3 * s} strokeOpacity={0.55} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={4 * s} fill="#fff6c2" />
    </g>
  );
};

// Explosion flash + fireball ring; `k` 0–1 is its age (0 = just started).
export const Blast = ({ x, y, scale = 1, k }: P & { k: number }) => {
  if (k <= 0 || k >= 1) return null;
  const r = 10 + k * 46;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity={1 - k * 0.8}>
      <circle r={r * 1.6} fill="#ff9a3c" opacity={0.25 * (1 - k)} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <path key={i} d={`M0 0 L${Math.cos(a - 0.12) * r} ${Math.sin(a - 0.12) * r} L${Math.cos(a) * r * 1.35} ${Math.sin(a) * r * 1.35} L${Math.cos(a + 0.12) * r} ${Math.sin(a + 0.12) * r} Z`} fill="#ffd04a" />;
      })}
      <circle r={r * 0.7} fill="#ff7a1a" />
      <circle r={r * 0.35} fill="#fff6c2" />
    </g>
  );
};

/* ---------- vehicles ---------- */

// Patriot-style launcher on a truck: cab, chassis, raised box of 4 canisters; `ammo` 0–1 lights the gauge.
export const Launcher = ({ x, y, scale = 1, ammo = 0.15 }: P & { ammo?: number }) => {
  const frame = useCurrentFrame();
  const blink = frame % 16 < 8;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={70} ry={6} fill="#000" opacity={0.3} />
      <rect x={-62} y={-26} width={104} height={14} fill="#4f5b3a" stroke={INK} strokeWidth={1.6} />
      <path d="M42 -26 L42 -48 L60 -48 L68 -34 L68 -12 L42 -12 Z" fill="#5b6844" stroke={INK} strokeWidth={1.6} />
      <rect x={48} y={-44} width={12} height={10} fill="#9fb3c8" stroke={INK} strokeWidth={1} />
      <g transform="translate(-40,-26) rotate(-28)">
        <rect x={0} y={-28} width={92} height={28} fill="#6b7a4c" stroke={INK} strokeWidth={1.6} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={92} cy={-24 + i * 7 + 3} r={2.8} fill={i / 4 < ammo ? "#2b2b2b" : "#111"} stroke="#999" strokeWidth={0.8} />
        ))}
        <line x1={6} y1={-14} x2={86} y2={-14} stroke={INK} strokeWidth={1} opacity={0.5} />
      </g>
      {[-48, -22, 10, 54].map((wx) => (
        <g key={wx} transform={`translate(${wx},-8)`}>
          <circle r={9} fill="#16181c" stroke={INK} strokeWidth={1.4} />
          <circle r={4} fill="#5a5f66" />
        </g>
      ))}
      {/* interceptor stock gauge */}
      <g transform="translate(-60,-100)">
        <rect x={0} y={0} width={124} height={22} rx={5} fill="#0b1426" stroke="#ff3b30" strokeWidth={2} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={6 + i * 14.5} y={5} width={11} height={12} rx={2} fill={i / 8 < ammo ? (blink ? "#ff3b30" : "#7a1f1a") : "#26324a"} />
        ))}
      </g>
    </g>
  );
};

// Airliner (side view, nose left) on the apron with boarding stairs; tail stripe colour configurable.
export const Airliner = ({ x, y, scale = 1, tail = "#1f7a3f" }: P & { tail?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={130} ry={7} fill="#000" opacity={0.3} />
    <path d="M-130 -40 Q-142 -50 -128 -60 L100 -62 Q118 -62 124 -56 L150 -110 L172 -110 L162 -56 L170 -48 L120 -38 Z" fill="#eef1f5" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M150 -110 L172 -110 L166 -82 L144 -82 Z" fill={tail} />
    <path d="M-40 -46 L40 -46 L70 -20 L40 -20 Z" fill="#d5dae1" stroke={INK} strokeWidth={1.4} />
    {Array.from({ length: 16 }, (_, i) => (
      <rect key={i} x={-110 + i * 13} y={-56} width={7} height={8} rx={2} fill="#3d5a80" />
    ))}
    <path d="M-128 -58 Q-138 -54 -134 -48 L-122 -52 Z" fill="#3d5a80" />
    <rect x={-96} y={-56} width={12} height={18} rx={2} fill="#c9d1db" stroke={INK} strokeWidth={1.2} />
    {/* stairs */}
    <path d="M-92 -38 L-60 0 L-50 0 L-82 -38 Z" fill="#bfc5cc" stroke={INK} strokeWidth={1.3} />
    {Array.from({ length: 6 }, (_, i) => (
      <line key={i} x1={-88 + i * 5.5} y1={-33 + i * 6.3} x2={-79 + i * 5.5} y2={-33 + i * 6.3} stroke={INK} strokeWidth={1} />
    ))}
    {[-60, 60].map((wx) => (
      <g key={wx}>
        <line x1={wx} y1={-38} x2={wx} y2={-8} stroke="#555" strokeWidth={3} />
        <circle cx={wx} cy={-6} r={6} fill="#16181c" />
      </g>
    ))}
  </g>
);

// Aid lorry: cab + box body with "AID" and a UN-blue band, sacks on the tailgate.
export const AidTruck = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={80} ry={6} fill="#000" opacity={0.3} />
    <rect x={-80} y={-70} width={110} height={58} rx={3} fill="#f4f4f2" stroke={INK} strokeWidth={1.8} />
    <rect x={-80} y={-46} width={110} height={10} fill="#4a90d9" />
    <text x={-25} y={-52} textAnchor="middle" fontSize={16} fontWeight={900} fill="#2c5f9e" fontFamily="Arial Black, Arial, sans-serif">AID</text>
    <path d="M30 -52 L56 -52 L72 -32 L72 -12 L30 -12 Z" fill="#e6e6e2" stroke={INK} strokeWidth={1.8} />
    <path d="M36 -48 L54 -48 L64 -34 L36 -34 Z" fill="#9fb3c8" stroke={INK} strokeWidth={1} />
    {[-60, -30, 54].map((wx) => (
      <g key={wx} transform={`translate(${wx},-8)`}>
        <circle r={10} fill="#16181c" stroke={INK} strokeWidth={1.4} />
        <circle r={4} fill="#6b7078" />
      </g>
    ))}
  </g>
);

// Stack of flour/food sacks; `n` sacks visible (they disappear as aid is cut).
export const Sacks = ({ x, y, scale = 1, n = 6 }: P & { n?: number }) => {
  const spots: [number, number][] = [
    [-24, 0], [0, 0], [24, 0], [-12, -18], [12, -18], [0, -36],
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {spots.slice(0, Math.max(0, Math.round(n))).map(([sx, sy], i) => (
        <g key={i} transform={`translate(${sx},${sy})`}>
          <path d="M-13 0 Q-14 -18 -10 -20 L10 -20 Q14 -18 13 0 Z" fill="#e9dfc4" stroke={INK} strokeWidth={1.4} />
          <path d="M-10 -20 Q0 -25 10 -20" stroke={INK} strokeWidth={1.2} fill="none" />
          <rect x={-8} y={-13} width={16} height={7} fill="#4a90d9" opacity={0.8} />
        </g>
      ))}
    </g>
  );
};

// Flatbed lorry used at a rural transport hub, loaded with sacks and a tarp.
export const Lorry = ({ x, y, scale = 1, color = "#c2552f" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={72} ry={6} fill="#000" opacity={0.3} />
    <rect x={-70} y={-30} width={96} height={16} fill="#6b4f2c" stroke={INK} strokeWidth={1.6} />
    <path d="M-66 -30 Q-40 -56 -12 -52 Q12 -58 22 -30 Z" fill="#3f6e8c" stroke={INK} strokeWidth={1.4} />
    <path d="M26 -46 L50 -46 L64 -28 L64 -12 L26 -12 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <path d="M32 -42 L48 -42 L58 -30 L32 -30 Z" fill="#9fb3c8" stroke={INK} strokeWidth={1} />
    {[-52, -20, 48].map((wx) => (
      <g key={wx} transform={`translate(${wx},-8)`}>
        <circle r={9} fill="#16181c" stroke={INK} strokeWidth={1.4} />
        <circle r={3.5} fill="#6b7078" />
      </g>
    ))}
  </g>
);

/* ---------- objects ---------- */

export const OilBarrel = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={20} ry={4} fill="#000" opacity={0.3} />
    <path d="M-18 -58 L18 -58 L18 0 L-18 0 Z" fill="#1f4e79" stroke={INK} strokeWidth={1.6} />
    <path d="M6 -58 L18 -58 L18 0 L6 0 Z" fill="#173b5c" />
    <ellipse cx={0} cy={-58} rx={18} ry={5} fill="#2c6aa3" stroke={INK} strokeWidth={1.4} />
    {[-40, -20].map((ry) => (
      <rect key={ry} x={-18} y={ry} width={36} height={4} fill="#173b5c" stroke={INK} strokeWidth={1} />
    ))}
    <path d="M0 -36 Q-7 -26 -6 -22 A6 6 0 0 0 6 -22 Q7 -26 0 -36 Z" fill="#111" stroke="#ddd" strokeWidth={1} />
  </g>
);

// Price board that counts up: label + big number (string prepared by the caller).
export const PriceBoard = ({ x, y, scale = 1, value, label, font }: P & { value: string; label: string; font: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-70} y={-62} width={140} height={62} rx={8} fill="#0b1426" stroke="#ffd36b" strokeWidth={2.5} />
    <text x={0} y={-40} textAnchor="middle" fontSize={15} fontWeight={700} fill="#ffd36b" fontFamily={font}>{label}</text>
    <text x={0} y={-12} textAnchor="middle" fontSize={28} fontWeight={900} fill="#fff" fontFamily={font}>{value}</text>
    <path d="M44 -26 L54 -38 L64 -26 Z" fill="#ffd36b" />
  </g>
);

export const BallotBox = ({ x, y, scale = 1, band = ["#009c3b", "#ffdf00"], text }: P & { band?: [string, string]; text?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx={0} cy={2} rx={30} ry={5} fill="#000" opacity={0.3} />
    <path d="M-28 -50 L28 -50 L28 0 L-28 0 Z" fill="#eef2f7" stroke={INK} strokeWidth={1.8} />
    <path d="M14 -50 L28 -50 L28 0 L14 0 Z" fill="#d6dce4" />
    <rect x={-28} y={-30} width={56} height={6} fill={band[0]} />
    <rect x={-28} y={-24} width={56} height={4} fill={band[1]} />
    <path d="M-32 -50 L-24 -60 L32 -60 L32 -50 Z" fill="#dfe5ec" stroke={INK} strokeWidth={1.6} />
    <rect x={-12} y={-57} width={24} height={4} rx={2} fill="#333" />
    {text && <text x={0} y={-6} textAnchor="middle" fontSize={11} fontWeight={900} fill="#333" fontFamily="Arial, sans-serif">{text}</text>}
  </g>
);

// Market stall: striped awning, table with produce baskets.
export const Stall = ({ x, y, scale = 1, awning = "#e76f51" }: P & { awning?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <line x1={-34} y1={0} x2={-34} y2={-62} stroke="#6b4f2c" strokeWidth={3} />
    <line x1={34} y1={0} x2={34} y2={-62} stroke="#6b4f2c" strokeWidth={3} />
    <path d="M-42 -62 L42 -62 L36 -48 L-36 -48 Z" fill={awning} stroke={INK} strokeWidth={1.4} />
    {[-30, -12, 6, 24].map((sx) => (
      <path key={sx} d={`M${sx} -62 L${sx + 9} -62 L${sx + 8} -48 L${sx - 1} -48 Z`} fill="#fff" opacity={0.85} />
    ))}
    <rect x={-36} y={-26} width={72} height={8} fill="#8b5a2b" stroke={INK} strokeWidth={1.2} />
    <rect x={-32} y={-18} width={4} height={18} fill="#6b4f2c" />
    <rect x={28} y={-18} width={4} height={18} fill="#6b4f2c" />
    {[-24, 0, 22].map((bx, i) => (
      <g key={bx} transform={`translate(${bx},-26)`}>
        <path d="M-10 0 L10 0 L8 -8 L-8 -8 Z" fill="#c9a66b" stroke={INK} strokeWidth={1} />
        {[-5, 0, 5].map((ox) => (
          <circle key={ox} cx={ox} cy={-10} r={3.5} fill={["#e63946", "#f4a261", "#2a9d8f"][i]} />
        ))}
      </g>
    ))}
  </g>
);

// H3-style rocket on the pad (y = pad); `lift` px moves it up, `burn` 0–1 shows the exhaust plume.
export const Rocket = ({ x, y, scale = 1, lift = 0, burn = 0 }: P & { lift?: number; burn?: number }) => {
  const frame = useCurrentFrame();
  const flick = 1 + 0.12 * Math.sin(frame * 1.3);
  return (
    <g transform={`translate(${x},${y - lift}) scale(${scale})`}>
      {burn > 0 && (
        <g>
          <path d={`M-14 0 Q0 ${80 * burn * flick} 14 0 Z`} fill="#ffd04a" />
          <path d={`M-8 0 Q0 ${50 * burn * flick} 8 0 Z`} fill="#fff6c2" />
          <circle cx={0} cy={0} r={22 * burn} fill="#ff9a3c" opacity={0.35} />
        </g>
      )}
      <path d="M-11 0 L-11 -150 Q0 -178 11 -150 L11 0 Z" fill="#f2f3f5" stroke={INK} strokeWidth={1.8} />
      <path d="M3 -150 Q8 -162 11 -150 L11 0 L3 0 Z" fill="#d5d9df" />
      <rect x={-11} y={-108} width={22} height={6} fill="#c1121f" />
      <text x={0} y={-60} textAnchor="middle" fontSize={8} fontWeight={900} fill="#c1121f" fontFamily="Arial, sans-serif" transform="rotate(-90 0 -60)">JAPAN</text>
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 11} -50 L${d * 19} -50 Q${d * 22} -62 ${d * 19} -70 L${d * 11} -70 Z`} fill="#e8e9ec" stroke={INK} strokeWidth={1.3} />
          <path d={`M${d * 11} 0 L${d * 20} 0 L${d * 20} -48 L${d * 11} -48 Z`} fill="#e8e9ec" stroke={INK} strokeWidth={1.3} />
        </g>
      ))}
    </g>
  );
};

export const LaunchTower = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-60} y={-8} width={120} height={8} fill="#6d6d6d" stroke={INK} strokeWidth={1.4} />
    <rect x={30} y={-190} width={18} height={182} fill="none" stroke="#c1121f" strokeWidth={3} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={30} y1={-190 + i * 15} x2={48} y2={-175 + i * 15} stroke="#c1121f" strokeWidth={1.6} />
    ))}
    <rect x={14} y={-150} width={18} height={4} fill="#c1121f" />
  </g>
);

// Mars with Phobos and a dashed transfer arc from the left (for space stories).
export const MarsPhobos = ({ x, y, scale = 1, p = 1 }: P & { p?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`} opacity={p}>
    <circle r={26} fill="#c1440e" stroke="#7a2a08" strokeWidth={1.5} />
    <path d="M-18 -8 Q-4 -14 10 -6 M-12 8 Q2 4 16 10" stroke="#8a300a" strokeWidth={3} fill="none" opacity={0.6} />
    <ellipse cx={0} cy={0} rx={44} ry={12} fill="none" stroke="#fff" strokeOpacity={0.35} strokeDasharray="3 3" />
    <ellipse cx={42} cy={-4} rx={6} ry={4.5} fill="#8d8178" stroke={INK} strokeWidth={1} />
  </g>
);

// Bar comparison (two values, percentages) for votes.
export const VoteBars = ({ x, y, scale = 1, items, font, k = 1 }: P & { items: { label: string; value: number; color: string }[]; font: string; k?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-10} y={-14} width={250} height={items.length * 46 + 20} rx={10} fill="#0b1426" opacity={0.92} stroke="#fff" strokeOpacity={0.25} />
    {items.map((it, i) => (
      <g key={it.label} transform={`translate(0,${i * 46})`}>
        <text x={0} y={8} fontSize={16} fontWeight={700} fill="#fff" fontFamily={font}>{it.label}</text>
        <rect x={0} y={14} width={200 * (it.value / 100) * k} height={16} rx={4} fill={it.color} />
        <text x={206 * Math.max(k, 0.01) * (it.value / 100) + 4} y={28} fontSize={16} fontWeight={900} fill="#fff" fontFamily={font}>~{Math.round(it.value * k)}%</text>
      </g>
    ))}
  </g>
);

/* ---------- skylines (draw from the ground line up, full panel width) ---------- */

type Sky = { x: number; y: number; w: number; s: number; night?: number };

const windows = (bx: number, top: number, bw: number, bh: number, s: number, lit: boolean, seed: number, color = "#ffd98a") =>
  Array.from({ length: Math.max(0, Math.floor(bh / (26 * s)) - 1) }, (_, r) =>
    Array.from({ length: Math.max(0, Math.floor(bw / (20 * s))) }, (_, c) => (
      <rect key={`${r}-${c}`} x={bx + 6 * s + c * 20 * s} y={top + 10 * s + r * 26 * s} width={9 * s} height={13 * s} fill={lit && random(`${seed}-${r}-${c}`) > 0.35 ? color : "#3c4656"} />
    )),
  );

// Kyiv: apartment blocks and golden-domed cathedrals.
export const KyivSkyline = ({ x, y, w, s, night = 1 }: Sky) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const bw = (70 + (i * 29) % 40) * s, bh = (90 + (i * 47) % 70) * s, bx = x + i * (w / 8.2);
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw} height={bh} fill={i % 2 ? "#4a5263" : "#575f71"} stroke="#2b3140" strokeWidth={1.2 * s} />
          {windows(bx, y - bh, bw, bh, s, night > 0.3, i)}
        </g>
      );
    })}
    {[0.3, 0.72].map((f, i) => {
      const cx = x + w * f;
      return (
        <g key={i}>
          <rect x={cx - 34 * s} y={y - 120 * s} width={68 * s} height={120 * s} fill="#f1efe6" stroke="#8c8a80" strokeWidth={1.4 * s} />
          {[-22, 0, 22].map((d, j) => (
            <g key={j}>
              <rect x={cx + d * s - 7 * s} y={y - (j === 1 ? 160 : 140) * s} width={14 * s} height={22 * s} fill="#f1efe6" stroke="#8c8a80" strokeWidth={1 * s} />
              <path d={`M${cx + d * s - 10 * s} ${y - (j === 1 ? 160 : 140) * s} Q${cx + d * s} ${y - (j === 1 ? 192 : 168) * s} ${cx + d * s + 10 * s} ${y - (j === 1 ? 160 : 140) * s} Z`} fill="#e9b949" stroke="#9a7420" strokeWidth={1 * s} />
              <line x1={cx + d * s} y1={y - (j === 1 ? 192 : 168) * s} x2={cx + d * s} y2={y - (j === 1 ? 204 : 178) * s} stroke="#e9b949" strokeWidth={2 * s} />
            </g>
          ))}
        </g>
      );
    })}
  </g>
);

// St Petersburg: low classical facades, the Peter and Paul spire and St Isaac's dome, plus oil tanks.
export const PetersburgSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => {
      const bw = w / 9, bh = (70 + (i * 31) % 30) * s, bx = x + i * bw;
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw - 2 * s} height={bh} fill={["#d8b98a", "#c9a0a0", "#a8c3b8", "#e3d3a8"][i % 4]} stroke="#6b5b45" strokeWidth={1.2 * s} />
          {windows(bx, y - bh, bw - 2 * s, bh, s, false, i + 40)}
        </g>
      );
    })}
    <path d={`M${x + w * 0.22} ${y - 100 * s} L${x + w * 0.22 + 6 * s} ${y - 240 * s} L${x + w * 0.22 + 12 * s} ${y - 100 * s} Z`} fill="#e9b949" stroke="#9a7420" strokeWidth={1 * s} />
    <rect x={x + w * 0.44} y={y - 140 * s} width={60 * s} height={40 * s} fill="#cfc6b2" stroke="#6b5b45" strokeWidth={1.2 * s} />
    <path d={`M${x + w * 0.44} ${y - 140 * s} Q${x + w * 0.44 + 30 * s} ${y - 200 * s} ${x + w * 0.44 + 60 * s} ${y - 140 * s} Z`} fill="#c9a43a" stroke="#8a6e1f" strokeWidth={1.2 * s} />
    {[0.72, 0.84].map((f) => (
      <g key={f}>
        <rect x={x + w * f} y={y - 60 * s} width={52 * s} height={60 * s} fill="#b9bec6" stroke="#4b5059" strokeWidth={1.4 * s} />
        <ellipse cx={x + w * f + 26 * s} cy={y - 60 * s} rx={26 * s} ry={6 * s} fill="#cfd4db" stroke="#4b5059" strokeWidth={1.2 * s} />
      </g>
    ))}
  </g>
);

// Tehran: the Milad tower in front of the snow-capped Alborz range, low city blocks.
export const TehranSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    <path d={`M${x} ${y - 90 * s} L${x + w * 0.18} ${y - 190 * s} L${x + w * 0.3} ${y - 140 * s} L${x + w * 0.46} ${y - 220 * s} L${x + w * 0.62} ${y - 150 * s} L${x + w * 0.8} ${y - 200 * s} L${x + w} ${y - 120 * s} L${x + w} ${y} L${x} ${y} Z`} fill="#7d8597" />
    <path d={`M${x + w * 0.4} ${y - 200 * s} L${x + w * 0.46} ${y - 220 * s} L${x + w * 0.52} ${y - 196 * s} Z M${x + w * 0.75} ${y - 185 * s} L${x + w * 0.8} ${y - 200 * s} L${x + w * 0.85} ${y - 184 * s} Z`} fill="#f4f6f8" />
    {Array.from({ length: 12 }, (_, i) => {
      const bw = w / 11, bh = (40 + (i * 23) % 45) * s, bx = x + i * bw;
      return <rect key={i} x={bx} y={y - bh} width={bw - 3 * s} height={bh} fill={i % 2 ? "#d9c8a9" : "#cbb894"} stroke="#7b6a4f" strokeWidth={1 * s} />;
    })}
    <g transform={`translate(${x + w * 0.2},${y})`}>
      <path d={`M${-6 * s} 0 L${-3 * s} ${-200 * s} L${3 * s} ${-200 * s} L${6 * s} 0 Z`} fill="#c7ccd4" stroke="#5b616b" strokeWidth={1 * s} />
      <ellipse cx={0} cy={-200 * s} rx={22 * s} ry={14 * s} fill="#9aa3ad" stroke="#5b616b" strokeWidth={1.2 * s} />
      <line x1={0} y1={-214 * s} x2={0} y2={-262 * s} stroke="#9aa3ad" strokeWidth={3 * s} />
    </g>
  </g>
);

// Gaza: damaged concrete blocks, exposed rebar, rubble mounds.
export const RuinsSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => {
      const bw = (80 + (i * 21) % 30) * s, bh = (70 + (i * 41) % 70) * s, bx = x + i * (w / 7.4);
      const bite = (20 + (i * 17) % 30) * s;
      return (
        <g key={i}>
          <path d={`M${bx} ${y} L${bx} ${y - bh} L${bx + bw * 0.4} ${y - bh} L${bx + bw * 0.55} ${y - bh + bite} L${bx + bw * 0.7} ${y - bh + bite * 0.4} L${bx + bw} ${y - bh + bite} L${bx + bw} ${y} Z`} fill={i % 2 ? "#a9a49a" : "#bdb7ab"} stroke="#5c574e" strokeWidth={1.2 * s} />
          {windows(bx, y - bh + bite, bw, bh - bite, s, false, i + 70)}
          <path d={`M${bx + bw * 0.55} ${y - bh + bite} l${4 * s} ${-14 * s} M${bx + bw * 0.62} ${y - bh + bite * 0.7} l${-3 * s} ${-12 * s}`} stroke="#5c4a3a" strokeWidth={1.4 * s} />
        </g>
      );
    })}
    <path d={`M${x} ${y} Q${x + w * 0.15} ${y - 26 * s} ${x + w * 0.3} ${y} Q${x + w * 0.6} ${y - 18 * s} ${x + w * 0.8} ${y} Z`} fill="#8e877a" />
  </g>
);

// Rural Sudan: acacia trees and low mud-brick buildings under a pale sky.
export const SahelSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const bw = (70 + (i * 19) % 30) * s, bh = (40 + (i * 13) % 20) * s, bx = x + i * (w / 6.5);
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw} height={bh} fill={i % 2 ? "#c58b57" : "#b97a46"} stroke="#6e4524" strokeWidth={1.2 * s} />
          <rect x={bx + bw * 0.4} y={y - bh * 0.6} width={12 * s} height={bh * 0.6} fill="#5a3a20" />
        </g>
      );
    })}
    {[0.15, 0.85].map((f) => (
      <g key={f} transform={`translate(${x + w * f},${y})`}>
        <path d={`M0 0 L${3 * s} ${-60 * s}`} stroke="#5a3a20" strokeWidth={5 * s} />
        <ellipse cx={3 * s} cy={-66 * s} rx={46 * s} ry={12 * s} fill="#6b8f3e" stroke="#46612a" strokeWidth={1.2 * s} />
      </g>
    ))}
  </g>
);

// São Paulo: dense high-rises and a glass office tower carrying a name sign.
export const SaoPauloSkyline = ({ x, y, w, s, sign = "", at = 0.62 }: Sky & { sign?: string; at?: number }) => (
  <g>
    {Array.from({ length: 11 }, (_, i) => {
      const bw = (50 + (i * 23) % 30) * s, bh = (120 + (i * 59) % 110) * s, bx = x + i * (w / 10.5);
      return (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw} height={bh} fill={i % 3 ? "#8d99ae" : "#a7b1c2"} stroke="#4a5568" strokeWidth={1.2 * s} />
          {windows(bx, y - bh, bw, bh, s, false, i + 90)}
        </g>
      );
    })}
    <g transform={`translate(${x + w * at},${y})`}>
      <rect x={-70 * s} y={-230 * s} width={140 * s} height={230 * s} fill="#4f7cac" stroke="#24476b" strokeWidth={1.6 * s} />
      {Array.from({ length: 7 }, (_, c) => (
        <line key={c} x1={(-70 + c * 20) * s} y1={-230 * s} x2={(-70 + c * 20) * s} y2={0} stroke="#9cc3e6" strokeWidth={1 * s} opacity={0.6} />
      ))}
      {Array.from({ length: 11 }, (_, r) => (
        <line key={r} x1={-70 * s} y1={(-230 + r * 21) * s} x2={70 * s} y2={(-230 + r * 21) * s} stroke="#9cc3e6" strokeWidth={1 * s} opacity={0.6} />
      ))}
      <path d={`M${-70 * s} ${-230 * s} L${-10 * s} ${-230 * s} L${-70 * s} ${-120 * s} Z`} fill="#fff" opacity={0.18} />
      {sign && (
        <g>
          <rect x={-56 * s} y={-258 * s} width={112 * s} height={26 * s} rx={5 * s} fill="#fff" stroke="#24476b" strokeWidth={1.4 * s} />
          <text x={0} y={-239 * s} textAnchor="middle" fontSize={18 * s} fontWeight={900} fill="#24476b" fontFamily="Arial, sans-serif">{sign}</text>
        </g>
      )}
    </g>
  </g>
);

// Alberta: Rocky Mountains with snow, foothills, a prairie town hall used as a polling station.
export const RockiesSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    <path d={`M${x} ${y - 60 * s} L${x + w * 0.12} ${y - 200 * s} L${x + w * 0.22} ${y - 130 * s} L${x + w * 0.36} ${y - 240 * s} L${x + w * 0.5} ${y - 150 * s} L${x + w * 0.66} ${y - 220 * s} L${x + w * 0.82} ${y - 140 * s} L${x + w} ${y - 190 * s} L${x + w} ${y} L${x} ${y} Z`} fill="#5d6d7e" />
    {[[0.12, 200], [0.36, 240], [0.66, 220], [1, 190]].map(([f, h]) => (
      <path key={f} d={`M${x + w * f - 34 * s} ${y - (h - 50) * s} L${x + w * f} ${y - h * s} L${x + w * f + 34 * s} ${y - (h - 50) * s} L${x + w * f + 12 * s} ${y - (h - 40) * s} L${x + w * f - 8 * s} ${y - (h - 56) * s} Z`} fill="#f4f6f8" />
    ))}
    <path d={`M${x} ${y - 40 * s} Q${x + w * 0.3} ${y - 80 * s} ${x + w * 0.6} ${y - 50 * s} Q${x + w * 0.85} ${y - 30 * s} ${x + w} ${y - 60 * s} L${x + w} ${y} L${x} ${y} Z`} fill="#4f7942" />
    {[0.08, 0.16, 0.9].map((f) => (
      <path key={f} d={`M${x + w * f} ${y - 20 * s} l${-12 * s} ${30 * s} l${24 * s} 0 Z M${x + w * f} ${y - 36 * s} l${-9 * s} ${22 * s} l${18 * s} 0 Z`} fill="#2d5a27" />
    ))}
  </g>
);

// Tanegashima: sea horizon, green coast, the launch complex on the shore.
export const CoastSkyline = ({ x, y, w, s }: Sky) => (
  <g>
    <rect x={x} y={y - 70 * s} width={w} height={70 * s} fill="#2e6f9e" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={`M${x + i * (w / 7)} ${y - 40 * s} q${12 * s} ${-5 * s} ${24 * s} 0`} stroke="#9cc3e6" strokeWidth={2 * s} fill="none" opacity={0.6} />
    ))}
    <path d={`M${x} ${y - 30 * s} Q${x + w * 0.2} ${y - 60 * s} ${x + w * 0.45} ${y - 40 * s} L${x + w * 0.45} ${y} L${x} ${y} Z`} fill="#4f7942" />
  </g>
);

export { Fire, Smoke };

// Plain information chip (no arrows or colour judgements) for grim numbers.
export const InfoChip = ({ x, y, scale = 1, label, value, font, color = "#ff3b30" }: P & { label: string; value: string; font: string; color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={0} y={-56} width={Math.max(150, value.length * 17 + 30)} height={58} rx={10} fill="#0b1426" stroke={color} strokeWidth={2.5} />
    <text x={14} y={-35} fontSize={15} fontWeight={700} fill={color} fontFamily={font}>{label}</text>
    <text x={14} y={-10} fontSize={24} fontWeight={900} fill="#fff" fontFamily={font}>{value}</text>
  </g>
);
