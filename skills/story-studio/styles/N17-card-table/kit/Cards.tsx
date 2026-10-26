import type { ReactNode } from "react";

// N17 card table: a story of factions dealt as playing cards on green baize under a hanging lamp. Every person is
// an original double-ended court card; relations are silk ribbons pinned between cards (gold = allied, red =
// hostile). Coordinates are for a 1080×1920 frame. Put <TableDefs /> inside the <svg> once.
export const C = {
  baize: "#14513a",
  baizeDeep: "#06201a",
  card: "#f3ead6",
  cardEdge: "#cdbf9f",
  red: "#b3262e",
  navy: "#1f2f5c",
  gold: "#d4a64a",
  ink: "#1c1410",
  wood: "#4a1f12",
};
export const CARD_W = 256;
export const CARD_H = 358;

export const TableDefs = () => (
  <defs>
    {/* the lamp makes a pool: lit baize in the middle, near-black at the edges of the table */}
    <radialGradient id="ct-baize" cx="0.5" cy="0.52" r="0.62">
      <stop offset="0" stopColor="#6c9e36" />
      <stop offset="0.28" stopColor="#3f8a32" />
      <stop offset="0.55" stopColor="#237a2e" />
      <stop offset="0.8" stopColor="#155a22" />
      <stop offset="1" stopColor="#0e4419" />
    </radialGradient>
    <radialGradient id="ct-pool" cx="0.5" cy="0.5" r="0.45">
      <stop offset="0" stopColor="#ffd98a" stopOpacity={0.34} />
      <stop offset="0.6" stopColor="#ffb85a" stopOpacity={0.08} />
      <stop offset="1" stopColor="#ffb85a" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="ct-vig" cx="0.5" cy="0.52" r="0.7">
      <stop offset="0.5" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.4} />
    </radialGradient>
    <linearGradient id="ct-gloss" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
      <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.12} />
    </linearGradient>
    <linearGradient id="ct-wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7a3a1e" />
      <stop offset="0.35" stopColor="#4a1f12" />
      <stop offset="1" stopColor="#1a0a05" />
    </linearGradient>
    <linearGradient id="ct-brass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5c4214" />
      <stop offset="0.5" stopColor="#e9c46a" />
      <stop offset="1" stopColor="#5c4214" />
    </linearGradient>
    <pattern id="ct-back" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="22" height="22" fill="#7a1620" />
      <path d="M0 11 H22 M11 0 V22" stroke="#d4a64a" strokeWidth={1.4} opacity={0.75} />
      <circle cx={11} cy={11} r={2.4} fill="#d4a64a" />
    </pattern>
    {/* baize fibres and card paper */}
    <filter id="ct-fibre" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.85 0.6" numOctaves={3} seed={4} />
      <feColorMatrix values="0 0 0 0 0.8  0 0 0 0 1  0 0 0 0 0.5  0 0 0 0.16 0" />
    </filter>
    <filter id="ct-paper" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={2} seed={9} />
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.13 0" />
    </filter>
    <filter id="ct-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={9} /></filter>
    <filter id="ct-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={4} /></filter>
  </defs>
);

// The table: lit baize, fibres, a mahogany rail with brass trim along the bottom, the hanging lamp's rim at the
// top. `light` 0–1 fades the lamp in (flicker it a little).
export const Table = ({ light }: { light: number }) => (
  <g>
    <rect width={1080} height={1920} fill="#010604" />
    <rect width={1080} height={1920} fill="url(#ct-baize)" opacity={0.5 + 0.5 * light} />
    <rect width={1080} height={1920} filter="url(#ct-fibre)" />
    <rect width={1080} height={1920} fill="url(#ct-pool)" opacity={light} />
    {/* rail */}
    <path d="M-20 1830 Q540 1772 1100 1830 L1100 1940 L-20 1940 Z" fill="url(#ct-wood)" />
    <path d="M-20 1830 Q540 1772 1100 1830" stroke="url(#ct-brass)" strokeWidth={6} fill="none" />
    <path d="M-20 1846 Q540 1790 1100 1846" stroke="#000" strokeOpacity={0.35} strokeWidth={3} fill="none" />
    <rect width={1080} height={1920} fill="url(#ct-vig)" />
    {/* lamp shade rim, seen from below the shade */}
    <ellipse cx={540} cy={-60} rx={380} ry={130} fill="#0b1a12" />
    <ellipse cx={540} cy={-60} rx={380} ry={130} fill="none" stroke="url(#ct-brass)" strokeWidth={9} />
    <ellipse cx={540} cy={-70} rx={352} ry={112} fill="#ffe6a8" opacity={0.18 + 0.5 * light} filter="url(#ct-soft)" />
    <ellipse cx={540} cy={-80} rx={270} ry={80} fill="#fff4d0" opacity={0.25 + 0.6 * light} filter="url(#ct-shadow)" />
  </g>
);

// Suit pips (original): lotus for the Siamese court, anchor for foreigners who came by sea.
export type Suit = "lotus" | "anchor";
export const Pip = ({ suit, x, y, s = 1 }: { suit: Suit; x: number; y: number; s?: number }) =>
  suit === "lotus" ? (
    <g transform={`translate(${x},${y}) scale(${s})`} fill={C.red}>
      <path d="M0 -14 Q7 -4 0 8 Q-7 -4 0 -14 Z" />
      <path d="M0 8 Q-14 2 -13 -9 Q-4 -6 0 8 Z M0 8 Q14 2 13 -9 Q4 -6 0 8 Z" />
      <rect x={-9} y={8} width={18} height={3} rx={1.5} />
    </g>
  ) : (
    <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={C.navy} strokeWidth={3} strokeLinecap="round">
      <circle cx={0} cy={-11} r={3} />
      <path d="M0 -8 V10 M-7 -3 H7 M-11 3 Q-9 11 0 11 Q9 11 11 3" />
    </g>
  );

export type Hat = "crown" | "lomphok" | "plume" | "tricorn" | "spike";
export type Court = { name: string; rank: string; suit: Suit; robe: string; trim: string; hat: Hat; hatColor: string; skin: string; item: "sword" | "lotus" | "scroll" | "baton" | "goad"; beard?: boolean };

// One half of a court figure (head, hat, robe, held item) above the card's centre line.
const Half = ({ c }: { c: Court }) => {
  const o = { stroke: C.ink, strokeWidth: 2.2, strokeLinejoin: "round" as const };
  return (
    <g>
      {/* robe with vertical bands and a gold collar */}
      <path d="M-84 0 L-80 -42 Q-66 -62 -26 -64 L26 -64 Q66 -62 80 -42 L84 0 Z" fill={c.robe} {...o} />
      {[-58, 58].map((x) => <path key={x} d={`M${x} -54 L${x + (x < 0 ? -4 : 4)} 0`} stroke={c.trim} strokeWidth={8} opacity={0.95} />)}
      {[-36, -12, 12, 36].map((x, i) => [-40, -18].map((y) => <path key={`${x}${y}`} d={`M${x} ${y - 9} l8 9 l-8 9 l-8 -9 Z`} fill={c.trim} opacity={(i + (y === -18 ? 1 : 0)) % 2 ? 0.95 : 0.5} />))}
      <path d="M-30 -64 Q0 -30 30 -64" fill={C.gold} {...o} />
      <path d="M-30 -64 Q0 -42 30 -64" fill="none" stroke={c.trim} strokeWidth={3} />
      {/* head */}
      <ellipse cx={0} cy={-84} rx={20} ry={23} fill={c.skin} {...o} />
      <path d="M-8 -86 h5 M3 -86 h5" stroke={C.ink} strokeWidth={2} />
      <path d="M-3 -76 q3 2 6 0" stroke={C.ink} strokeWidth={1.6} fill="none" />
      {c.beard && <path d="M-12 -74 Q0 -60 12 -74 Q6 -66 0 -66 Q-6 -66 -12 -74 Z" fill="#3a2a1c" />}
      {/* hat */}
      {c.hat === "crown" && (
        <g {...o} fill={c.hatColor}>
          <path d="M-20 -98 L20 -98 L17 -110 L-17 -110 Z" />
          <path d="M-16 -110 L16 -110 L11 -122 L-11 -122 Z" />
          <path d="M-11 -122 L11 -122 L6 -134 L-6 -134 Z" />
          <path d="M-5 -134 L5 -134 L0 -150 Z" />
          <path d="M-22 -96 Q-30 -88 -26 -78 M22 -96 Q30 -88 26 -78" fill="none" />
        </g>
      )}
      {c.hat === "lomphok" && (
        <g {...o}>
          <path d="M-19 -98 L19 -98 L5 -148 L-5 -148 Z" fill={c.hatColor} />
          <path d="M-17 -104 L17 -104" stroke={C.gold} strokeWidth={5} />
        </g>
      )}
      {c.hat === "plume" && (
        <g {...o}>
          <ellipse cx={0} cy={-100} rx={40} ry={8} fill={c.hatColor} />
          <path d="M-20 -101 Q-20 -126 0 -126 Q20 -126 20 -101 Z" fill={c.hatColor} />
          <path d="M14 -118 Q44 -142 30 -96 Q34 -118 14 -118 Z" fill="#f3ead6" />
          <path d="M-16 -64 Q-30 -78 -20 -96 M16 -64 Q30 -78 20 -96" fill="none" stroke="#3a2a1c" strokeWidth={6} />
        </g>
      )}
      {c.hat === "tricorn" && (
        <g {...o}>
          {[-1, 1].map((s) => <circle key={s} cx={s * 22} cy={-78} r={9} fill="#e8e0cc" />)}
          {[-1, 1].map((s) => <circle key={s + 2} cx={s * 21} cy={-66} r={8} fill="#e8e0cc" />)}
          <path d="M-36 -98 Q0 -88 36 -98 L22 -122 Q0 -112 -22 -122 Z" fill={c.hatColor} />
          <path d="M-34 -98 Q0 -90 34 -98" fill="none" stroke={C.gold} strokeWidth={3} />
        </g>
      )}
      {c.hat === "spike" && (
        <g {...o}>
          <path d="M-21 -96 Q-21 -124 0 -126 Q21 -124 21 -96 Z" fill={c.hatColor} />
          <path d="M-3 -126 L0 -148 L3 -126 Z" fill={C.gold} />
          <path d="M-22 -97 H22" stroke={C.gold} strokeWidth={4} />
        </g>
      )}
      {/* hand + item */}
      <g {...o}>
        {c.item === "sword" && <path d="M50 -24 L58 -142 L64 -142 L58 -24 Z M42 -30 H70" fill="#d8d8d0" />}
        {c.item === "goad" && <path d="M54 -20 L60 -136 M60 -136 Q74 -134 72 -120 M60 -136 L64 -150" fill="none" stroke={C.ink} strokeWidth={4} />}
        {c.item === "baton" && <rect x={48} y={-128} width={12} height={110} rx={5} fill={C.navy} />}
        {c.item === "scroll" && <g><rect x={36} y={-112} width={40} height={64} rx={4} fill="#efe3c2" /><path d="M42 -100 h28 M42 -90 h28 M42 -80 h20" stroke={C.ink} strokeWidth={1.4} /></g>}
        {c.item === "lotus" && <g><path d="M56 -22 L58 -100" fill="none" /><path d="M58 -100 Q46 -116 58 -134 Q70 -116 58 -100 Z" fill="#e88a9a" /></g>}
        <circle cx={56} cy={-24} r={9} fill={c.skin} />
      </g>
    </g>
  );
};

// The face of a court card: border, corner indexes, double-ended figure, name banner on the centre line.
export const Face = ({ c, font }: { c: Court; font: string }) => {
  const iw = CARD_W - 52;
  const ih = CARD_H - 70;
  return (
    <g>
      <rect x={-iw / 2} y={-ih / 2} width={iw} height={ih} fill="none" stroke={c.suit === "lotus" ? C.red : C.navy} strokeWidth={2} />
      <clipPath id={`ct-clip-${c.rank}${c.name.length}`}><rect x={-iw / 2} y={-ih / 2} width={iw} height={ih} /></clipPath>
      <g clipPath={`url(#ct-clip-${c.rank}${c.name.length})`}>
        <Half c={c} />
        <g transform="rotate(180)"><Half c={c} /></g>
      </g>
      {/* centre banner */}
      <path d={`M${-iw / 2 - 10} -19 H${iw / 2 + 10} L${iw / 2 + 2} 0 L${iw / 2 + 10} 19 H${-iw / 2 - 10} L${-iw / 2 - 2} 0 Z`} fill={C.card} stroke={C.ink} strokeWidth={2} />
      <text x={0} y={9} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={c.name.length > 9 ? 23 : 26} fill={C.ink}>{c.name}</text>
      {[0, 180].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <text x={-CARD_W / 2 + 15} y={-CARD_H / 2 + 34} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={c.suit === "lotus" ? C.red : C.navy}>{c.rank}</text>
          <Pip suit={c.suit} x={-CARD_W / 2 + 15} y={-CARD_H / 2 + 56} s={0.8} />
        </g>
      ))}
    </g>
  );
};

// Card back (original lattice + rosette).
export const Back = () => (
  <g>
    <rect x={-CARD_W / 2 + 14} y={-CARD_H / 2 + 14} width={CARD_W - 28} height={CARD_H - 28} rx={8} fill="url(#ct-back)" stroke={C.gold} strokeWidth={2} />
    <circle r={38} fill="#7a1620" stroke={C.gold} strokeWidth={3} />
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={0} cy={-20} rx={7} ry={16} fill={C.gold} transform={`rotate(${i * 45})`} opacity={0.9} />)}
    <circle r={8} fill="#7a1620" stroke={C.gold} strokeWidth={2} />
  </g>
);

// A card on the table. flip 0 = back up, 1 = face up (turns about its long axis); lift 0–1 raises it (bigger, longer
// softer shadow); dim 0–1 greys it out (out of the game).
export const Card = ({ x, y, rot = 0, flip = 1, lift = 0, dim = 0, children }: { x: number; y: number; rot?: number; flip?: number; lift?: number; dim?: number; children: ReactNode }) => {
  const sx = Math.abs(Math.cos(Math.PI * (1 - flip)));
  const s = 1 + lift * 0.08;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <rect x={-CARD_W / 2 + 8 + lift * 26} y={-CARD_H / 2 + 12 + lift * 34} width={CARD_W * sx} height={CARD_H} rx={14} fill="#000" opacity={0.55 - lift * 0.2} filter="url(#ct-shadow)" transform={`translate(${(CARD_W * (1 - sx)) / 2},0)`} />
      <g transform={`scale(${sx * s},${s})`}>
        <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={14} fill={C.card} stroke={C.cardEdge} strokeWidth={2} />
        {flip > 0.5 ? children : <Back />}
        <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={14} filter="url(#ct-paper)" />
        <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={14} fill="url(#ct-gloss)" />
        {dim > 0 && <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx={14} fill="#0a1410" opacity={dim * 0.55} />}
      </g>
    </g>
  );
};

// A silk ribbon pinned between two cards (a, b = card centres). It is drawn ON TOP of the cards, pinned with brass
// tacks near the facing edges. p 0–1 draws it from a to b; cut 0–1 snaps it in the middle and pulls both halves
// back to their pins.
export const pinPoints = (a: [number, number], b: [number, number], inset = 92): [[number, number], [number, number]] => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const k = Math.min(inset / Math.max(Math.abs(ux), 0.001), (inset * 1.45) / Math.max(Math.abs(uy), 0.001), L / 2.2);
  return [[a[0] + ux * k, a[1] + uy * k], [b[0] - ux * k, b[1] - uy * k]];
};
// Control point of the ribbon's curve: the middle pushed sideways (perpendicular) by `sag`, so the silk bows.
const bow = (p: [number, number], q: [number, number], sag: number): [number, number] => {
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L;
  if (ny < 0 || (Math.abs(ny) < 0.2 && nx < 0)) { nx = -nx; ny = -ny; }
  return [(p[0] + q[0]) / 2 + nx * sag, (p[1] + q[1]) / 2 + ny * sag];
};
export const ribbonMid = (a: [number, number], b: [number, number], sag = 70): [number, number] => {
  const [p, q] = pinPoints(a, b);
  const c = bow(p, q, sag);
  return [(p[0] + 2 * c[0] + q[0]) / 4, (p[1] + 2 * c[1] + q[1]) / 4];
};
export const Ribbon = ({ a, b, color, p = 1, cut = 0, sag = 70 }: { a: [number, number]; b: [number, number]; color: string; p?: number; cut?: number; sag?: number }) => {
  if (p <= 0 || cut >= 1) return null;
  const [[x1, y1], [x2, y2]] = pinPoints(a, b);
  const [mx, my] = bow([x1, y1], [x2, y2], sag);
  const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
  const half = 0.5 * (1 - cut);
  const dash = cut > 0 ? `${half} ${1 - 2 * half} ${half} 0` : `${p} 1`;
  const pin = (x: number, y: number) => (
    <g>
      <circle cx={x + 3} cy={y + 5} r={11} fill="#000" opacity={0.45} filter="url(#ct-soft)" />
      <circle cx={x} cy={y} r={10} fill="url(#ct-brass)" stroke="#3a2a0c" strokeWidth={2} />
      <circle cx={x - 3} cy={y - 3} r={3} fill="#fff6d0" opacity={0.8} />
    </g>
  );
  return (
    <g>
      <g fill="none" strokeLinecap="butt">
        <path d={d} pathLength={1} strokeDasharray={dash} stroke="#000" strokeWidth={22} opacity={0.5} transform="translate(9,16)" filter="url(#ct-soft)" />
        <path d={d} pathLength={1} strokeDasharray={dash} stroke="#2a0a08" strokeWidth={22} opacity={0.55} />
        <path d={d} pathLength={1} strokeDasharray={dash} stroke={color} strokeWidth={18} />
        <path d={d} pathLength={1} strokeDasharray={dash} stroke="#000" strokeWidth={2} opacity={0.25} transform="translate(0,5)" />
        <path d={d} pathLength={1} strokeDasharray={dash} stroke="#fff" strokeWidth={3} opacity={0.45} transform="translate(-1,-4)" />
      </g>
      {pin(x1, y1)}
      {p > 0.97 && pin(x2, y2)}
    </g>
  );
};

// A small paper tag hung on a ribbon's middle: "พันธมิตร" / "ศัตรู".
export const Tag = ({ x, y, text, color, font, k = 1 }: { x: number; y: number; text: string; color: string; font: string; k?: number }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x},${y}) rotate(-6) scale(${0.6 + 0.4 * k})`} opacity={k}>
      <rect x={-64} y={-20} width={128} height={40} rx={6} fill="#000" opacity={0.4} transform="translate(5,7)" filter="url(#ct-soft)" />
      <path d="M-64 -20 H52 L66 0 L52 20 H-64 Z" fill={C.card} stroke={color} strokeWidth={3} />
      <circle cx={50} cy={0} r={4} fill={color} />
      <text x={-6} y={9} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={color}>{text}</text>
    </g>
  );

// The crown token that changes hands (brass, embossed).
export const CrownToken = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={46} fill="#000" opacity={0.5} transform="translate(8,12)" filter="url(#ct-soft)" />
    <circle r={46} fill="url(#ct-brass)" stroke="#5c4214" strokeWidth={3} />
    <circle r={36} fill="none" stroke="#5c4214" strokeWidth={2} />
    <path d="M-20 12 L20 12 L16 2 L-16 2 Z M-14 2 L14 2 L9 -8 L-9 -8 Z M-8 -8 L8 -8 L0 -26 Z" fill="#5c4214" />
  </g>
);
