import { useCurrentFrame } from "remotion";

// Courts and kings, news-figure style. Rulers are shown as small full figures or from behind / at a distance,
// never as close-up portraits. Ground at y = 0, scale 1 ≈ 110 units tall.
const INK = "#1b1d24";

// Burmese palace hall with a tiered pyatthat spire (Konbaung style). w = width in px.
export const BurmesePalace = ({ x, y, s, w = 420, gold = "#d9a93a", wall = "#8e2a22" }: { x: number; y: number; s: number; w?: number; gold?: string; wall?: string }) => {
  const W = w * s;
  const tiers = 6;
  return (
    <g>
      <rect x={x - W / 2} y={y - 70 * s} width={W} height={70 * s} fill={wall} stroke={INK} strokeWidth={1.6 * s} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={x - W / 2 + (i + 0.3) * (W / 9)} y={y - 55 * s} width={W / 18} height={55 * s} fill="#5a1a14" />)}
      <path d={`M${x - W / 2 - 20 * s} ${y - 70 * s} L${x - W / 2 + 30 * s} ${y - 110 * s} L${x + W / 2 - 30 * s} ${y - 110 * s} L${x + W / 2 + 20 * s} ${y - 70 * s} Z`} fill={gold} stroke={INK} strokeWidth={1.6 * s} />
      {Array.from({ length: tiers }, (_, i) => {
        const tw = (150 - i * 20) * s;
        const ty = y - 110 * s - i * 26 * s;
        return <path key={i} d={`M${x - tw / 2} ${ty} L${x - tw / 2 + 14 * s} ${ty - 22 * s} L${x + tw / 2 - 14 * s} ${ty - 22 * s} L${x + tw / 2} ${ty} Z`} fill={gold} stroke={INK} strokeWidth={1.4 * s} />;
      })}
      <path d={`M${x - 6 * s} ${y - 110 * s - tiers * 26 * s} L${x} ${y - 110 * s - tiers * 26 * s - 50 * s} L${x + 6 * s} ${y - 110 * s - tiers * 26 * s} Z`} fill={gold} stroke={INK} strokeWidth={1.2 * s} />
      <circle cx={x} cy={y - 110 * s - tiers * 26 * s - 52 * s} r={5 * s} fill="#fff3a6" />
    </g>
  );
};

// Siamese palace hall: stacked red-and-green roofs with chofa finials, white walls.
export const ThaiPalace = ({ x, y, s, w = 440, crack = 0 }: { x: number; y: number; s: number; w?: number; crack?: number }) => {
  const W = w * s;
  const roof = (wd: number, yy: number, h: number, c: string) => (
    <g>
      <path d={`M${x - wd / 2} ${yy} L${x} ${yy - h} L${x + wd / 2} ${yy} Z`} fill={c} stroke={INK} strokeWidth={1.5 * s} />
      <path d={`M${x - wd / 2} ${yy} q${-12 * s} ${-6 * s} ${-16 * s} ${-22 * s}`} stroke="#d9a93a" strokeWidth={4 * s} fill="none" />
      <path d={`M${x + wd / 2} ${yy} q${12 * s} ${-6 * s} ${16 * s} ${-22 * s}`} stroke="#d9a93a" strokeWidth={4 * s} fill="none" />
    </g>
  );
  return (
    <g>
      <rect x={x - W / 2} y={y - 90 * s} width={W} height={90 * s} fill="#f1ebdc" stroke={INK} strokeWidth={1.6 * s} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x - W / 2 + (i + 0.4) * (W / 7)} ${y} l0 ${-56 * s} q${12 * s} ${-16 * s} ${24 * s} 0 l0 ${56 * s} Z`} fill="#8a3324" />)}
      {roof(W * 1.06, y - 90 * s, 120 * s, "#a8322a")}
      {roof(W * 0.8, y - 150 * s, 100 * s, "#2f6b4a")}
      {roof(W * 0.55, y - 200 * s, 90 * s, "#a8322a")}
      <path d={`M${x} ${y - 290 * s} l${-4 * s} ${-30 * s} l${8 * s} 0 Z`} fill="#d9a93a" />
      {crack > 0 && <path d={`M${x + W * 0.1} ${y - 90 * s} l${-10 * s} ${30 * s * crack} l${14 * s} ${20 * s * crack} l${-8 * s} ${40 * s * crack}`} stroke={INK} strokeWidth={3 * s} fill="none" />}
    </g>
  );
};

// A king (or general) in court dress with a tall pointed crown; on foot, pointing or seated on a throne.
export const Royal = ({ x, y, scale = 1, flip = false, robe = "#c9a03c", side = "#8e2a22", pose = "stand", phase = 0 }: { x: number; y: number; scale?: number; flip?: boolean; robe?: string; side?: string; pose?: "stand" | "point" | "sit" | "lie"; phase?: number }) => {
  const frame = useCurrentFrame();
  const skin = "#c98f62";
  const breathe = Math.sin(frame * 0.07 + phase) * 0.8;
  if (pose === "lie")
    return (
      <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
        <rect x={-70} y={-22} width={140} height={22} rx={6} fill="#e9dcc0" stroke={INK} strokeWidth={1.5} />
        <path d={`M-50 -22 Q0 ${-44 + breathe} 50 -22 Z`} fill={robe} stroke={INK} strokeWidth={1.5} />
        <circle cx={-58} cy={-34} r={11} fill={skin} stroke={INK} strokeWidth={1.4} />
        <path d="M-70 -40 Q-58 -52 -46 -40" fill="#f4ecd8" stroke={INK} strokeWidth={1.2} />
      </g>
    );
  const sit = pose === "sit";
  return (
    <g transform={`translate(${x},${y + breathe}) scale(${flip ? -scale : scale},${scale})`}>
      {sit && <path d="M-34 0 L-34 -70 Q0 -96 34 -70 L34 0 Z" fill="#d9a93a" stroke={INK} strokeWidth={1.5} />}
      <path d={sit ? "M-16 -40 L16 -40 L22 0 L-22 0 Z" : "M-14 -56 L14 -56 L17 0 L-17 0 Z"} fill={side} stroke={INK} strokeWidth={1.5} />
      <path d={sit ? "M-14 -86 Q-16 -60 -16 -40 L16 -40 Q16 -60 14 -86 Q0 -92 -14 -86 Z" : "M-13 -100 Q-15 -78 -14 -56 L14 -56 Q15 -78 13 -100 Q0 -106 -13 -100 Z"} fill={robe} stroke={INK} strokeWidth={1.5} />
      <path d={sit ? "M-16 -80 L16 -80" : "M-14 -94 L14 -94"} stroke="#fff3a6" strokeWidth={3} />
      <g transform={`translate(0,${sit ? -98 : -112})`}>
        <ellipse cx={0} cy={0} rx={10} ry={11} fill={skin} stroke={INK} strokeWidth={1.4} />
        <circle cx={5} cy={1} r={1.3} fill={INK} />
        <path d="M-10 -6 L10 -6 L6 -18 L2 -30 L0 -42 L-2 -30 L-6 -18 Z" fill="#e2b84a" stroke={INK} strokeWidth={1.2} />
      </g>
      {pose === "point" && <path d={`M8 -96 L40 ${-104 + Math.sin(frame * 0.1) * 2}`} stroke={robe} strokeWidth={7} strokeLinecap="round" />}
    </g>
  );
};

// White royal parasol (sawetrachat) on a pole.
export const Parasol = ({ x, y, s, tiers = 3, tilt = 0 }: { x: number; y: number; s: number; tiers?: number; tilt?: number }) => (
  <g transform={`rotate(${tilt},${x},${y})`}>
    <line x1={x} y1={y} x2={x} y2={y - (110 + tiers * 18) * s} stroke="#6b4a2b" strokeWidth={3 * s} />
    {Array.from({ length: tiers }, (_, i) => (
      <path key={i} d={`M${x - (34 - i * 8) * s} ${y - (60 + i * 22) * s} Q${x} ${y - (84 + i * 22) * s} ${x + (34 - i * 8) * s} ${y - (60 + i * 22) * s} Z`} fill="#f7f3ea" stroke={INK} strokeWidth={1.3 * s} />
    ))}
  </g>
);

// Explosion burst (cannon blowing up), k: 0 → 1.
export const Burst = ({ x, y, s, k }: { x: number; y: number; s: number; k: number }) => {
  if (k <= 0 || k >= 1) return null;
  const r = (20 + k * 110) * s;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const rr = i % 2 ? r : r * 0.55;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  });
  return (
    <g opacity={1 - k * 0.8}>
      <circle cx={x} cy={y} r={r * 1.3} fill="#9a958f" opacity={0.5} />
      <path d={`M${pts.join(" L")} Z`} fill="#ffcf3f" stroke="#ff7a1a" strokeWidth={4 * s} />
      <circle cx={x} cy={y} r={r * 0.35} fill="#fff6c2" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return <rect key={i} x={x + Math.cos(a) * r * 1.2} y={y + Math.sin(a) * r * 1.2} width={10 * s} height={5 * s} fill="#6d6f73" transform={`rotate(${i * 40},${x + Math.cos(a) * r * 1.2},${y + Math.sin(a) * r * 1.2})`} />;
      })}
    </g>
  );
};

// Field tent (royal or commander's), open at the front.
export const BigTent = ({ x, y, s, w = 260, color = "#8e2a22" }: { x: number; y: number; s: number; w?: number; color?: string }) => {
  const W = w * s;
  return (
    <g>
      <path d={`M${x - W / 2} ${y} L${x - W * 0.3} ${y - 120 * s} L${x + W * 0.3} ${y - 120 * s} L${x + W / 2} ${y} Z`} fill={color} stroke={INK} strokeWidth={1.6 * s} />
      <path d={`M${x - W * 0.3} ${y - 120 * s} L${x} ${y - 170 * s} L${x + W * 0.3} ${y - 120 * s} Z`} fill="#d9a93a" stroke={INK} strokeWidth={1.6 * s} />
      <path d={`M${x - W * 0.28} ${y} L${x - W * 0.2} ${y - 100 * s} L${x + W * 0.2} ${y - 100 * s} L${x + W * 0.28} ${y} Z`} fill="#3a1a14" opacity={0.85} />
    </g>
  );
};

// Map table seen from the side with a parchment map on it.
export const MapTable = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    <rect x={x - 120 * s} y={y - 50 * s} width={240 * s} height={12 * s} fill="#6b4a2b" stroke={INK} strokeWidth={1.4 * s} />
    <rect x={x - 110 * s} y={y - 38 * s} width={10 * s} height={38 * s} fill="#5a3a22" />
    <rect x={x + 100 * s} y={y - 38 * s} width={10 * s} height={38 * s} fill="#5a3a22" />
    <path d={`M${x - 100 * s} ${y - 50 * s} L${x - 80 * s} ${y - 66 * s} L${x + 90 * s} ${y - 66 * s} L${x + 100 * s} ${y - 50 * s} Z`} fill="#efe1bb" stroke={INK} strokeWidth={1.2 * s} />
    <path d={`M${x - 60 * s} ${y - 60 * s} q${30 * s} ${-6 * s} ${50 * s} ${4 * s} M${x + 10 * s} ${y - 62 * s} l${40 * s} ${8 * s}`} stroke="#c0392b" strokeWidth={3 * s} fill="none" />
  </g>
);
