import type { ReactNode } from "react";

// N19 museum vitrine: one object in a lit glass case on a white plinth against a dark gallery wall. The object is
// drawn in code and turns slowly on its stand (`theta`, radians about the vertical axis); numbered callouts sit on
// the object and match museum label cards. Coordinates are for a 1080×1920 frame. Put <GalleryDefs /> in the <svg>.
export const V = {
  wall: "#1a252e",
  wallLit: "#34444f",
  plinth: "#ecebe6",
  plinthShade: "#b9b8b2",
  glass: "#bcd7de",
  spot: "#ffe8c2",
  label: "#f6f3ec",
  ink: "#1b1b1b",
  accent: "#b5562c",
};
export const CASE = { x: 150, y: 470, w: 780, h: 1000 }; // glass box (front face)

export const GalleryDefs = () => (
  <defs>
    <radialGradient id="mv-wallspot" cx="0.5" cy="0.36" r="0.6">
      <stop offset="0" stopColor="#4b5c66" />
      <stop offset="0.55" stopColor="#24313a" />
      <stop offset="1" stopColor="#0d1419" />
    </radialGradient>
    <linearGradient id="mv-cone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffe8c2" stopOpacity={0.32} />
      <stop offset="1" stopColor="#ffe8c2" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="mv-plinth" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#cfcec8" />
      <stop offset="0.45" stopColor="#f1f0ec" />
      <stop offset="1" stopColor="#a9a8a2" />
    </linearGradient>
    <linearGradient id="mv-plinthTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fbfaf6" />
      <stop offset="1" stopColor="#d9d8d2" />
    </linearGradient>
    <linearGradient id="mv-lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2a3238" />
      <stop offset="1" stopColor="#11171b" />
    </linearGradient>
    <linearGradient id="mv-streak" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity={0} />
      <stop offset="0.5" stopColor="#fff" stopOpacity={0.16} />
      <stop offset="1" stopColor="#fff" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="mv-glaze" cx="0.42" cy="0.38" r="0.7">
      <stop offset="0" stopColor="#ece6d2" />
      <stop offset="0.62" stopColor="#d9d0b4" />
      <stop offset="0.9" stopColor="#c4b994" />
      <stop offset="1" stopColor="#a99c78" />
    </radialGradient>
    <radialGradient id="mv-clay" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stopColor="#9a7656" />
      <stop offset="1" stopColor="#6a4c36" />
    </radialGradient>
    <filter id="mv-grain" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.7  0 0 0 0 0.75  0 0 0 0.06 0" />
    </filter>
    <filter id="mv-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={14} /></filter>
    <filter id="mv-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={3} /></filter>
    <filter id="mv-brush" x="-5%" y="-5%" width="110%" height="110%">
      {/* iron-black brushwork: slightly ragged edge and uneven density, as painted under a glaze */}
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={2} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={2.5} result="d" />
      <feGaussianBlur in="d" stdDeviation={0.7} />
    </filter>
  </defs>
);

// The gallery: dark wall with a soft wall-wash behind the case, faint grain, a shadow line at the floor.
export const Gallery = () => (
  <g>
    <rect width={1080} height={1920} fill={V.wall} />
    <rect width={1080} height={1920} fill="url(#mv-wallspot)" />
    <rect width={1080} height={1920} filter="url(#mv-grain)" />
  </g>
);

// Ceiling spotlight cone down onto the object (draw before the case contents) and the pool it leaves on the deck.
export const Spot = ({ k = 1 }: { k?: number }) => (
  <g opacity={k}>
    <path d={`M${540 - 70} ${CASE.y} L${540 + 70} ${CASE.y} L${540 + 330} ${CASE.y + CASE.h} L${540 - 330} ${CASE.y + CASE.h} Z`} fill="url(#mv-cone)" />
    <ellipse cx={540} cy={CASE.y + CASE.h - 18} rx={300} ry={40} fill={V.spot} opacity={0.28} filter="url(#mv-blur)" />
  </g>
);

// Case interior back panel (fabric-covered board), the deck, and the lit lid with its light strip.
export const CaseBack = () => (
  <g>
    <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} fill="#222d35" />
    <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} fill="url(#mv-wallspot)" opacity={0.6} />
    <path d={`M${CASE.x} ${CASE.y + CASE.h - 70} L${CASE.x + CASE.w} ${CASE.y + CASE.h - 70} L${CASE.x + CASE.w} ${CASE.y + CASE.h} L${CASE.x} ${CASE.y + CASE.h} Z`} fill="#2c3840" />
  </g>
);

// Glass front: edges, faint tint, two reflection streaks that drift with `drift` (px), the lid above.
export const CaseGlass = ({ drift = 0 }: { drift?: number }) => (
  <g>
    <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} fill={V.glass} opacity={0.05} />
    <clipPath id="mv-glass"><rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} /></clipPath>
    <g clipPath="url(#mv-glass)">
      <path d={`M${CASE.x + 80 + drift} ${CASE.y} l120 0 l-420 ${CASE.h} l-120 0 Z`} fill="url(#mv-streak)" />
      <path d={`M${CASE.x + 640 + drift * 1.4} ${CASE.y} l46 0 l-420 ${CASE.h} l-46 0 Z`} fill="url(#mv-streak)" />
      <path d={`M${CASE.x + 700 + drift * 1.4} ${CASE.y} l14 0 l-420 ${CASE.h} l-14 0 Z`} fill="#fff" opacity={0.08} />
    </g>
    <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} fill="none" stroke="#dfeef2" strokeOpacity={0.45} strokeWidth={3} />
    <path d={`M${CASE.x + 4} ${CASE.y + 4} V${CASE.y + CASE.h - 4}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
    {/* lid */}
    <rect x={CASE.x - 14} y={CASE.y - 70} width={CASE.w + 28} height={70} fill="url(#mv-lid)" />
    <rect x={CASE.x} y={CASE.y - 8} width={CASE.w} height={8} fill={V.spot} opacity={0.85} />
    <rect x={CASE.x} y={CASE.y} width={CASE.w} height={30} fill={V.spot} opacity={0.12} filter="url(#mv-soft)" />
  </g>
);

// White plinth under the case: top face in perspective + front face; children are drawn on the front face.
export const Plinth = ({ children }: { children?: ReactNode }) => (
  <g>
    <ellipse cx={540} cy={1915} rx={520} ry={40} fill="#000" opacity={0.5} filter="url(#mv-blur)" />
    <path d={`M${CASE.x - 40} ${CASE.y + CASE.h} L${CASE.x + CASE.w + 40} ${CASE.y + CASE.h} L${CASE.x + CASE.w + 70} ${CASE.y + CASE.h + 40} L${CASE.x - 70} ${CASE.y + CASE.h + 40} Z`} fill="url(#mv-plinthTop)" />
    <rect x={CASE.x - 70} y={CASE.y + CASE.h + 40} width={CASE.w + 140} height={1920 - CASE.y - CASE.h - 40} fill="url(#mv-plinth)" />
    <rect x={CASE.x - 70} y={CASE.y + CASE.h + 40} width={CASE.w + 140} height={16} fill="#000" opacity={0.12} />
    {children}
  </g>
);

// A Sukhothai-type underglaze iron-black fish plate on a stand, turning about its vertical axis.
// theta 0 = face to camera, π = back. cx, cy = plate centre, R = radius.
export const FishPlate = ({ cx, cy, R, theta }: { cx: number; cy: number; R: number; theta: number }) => {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const face = c >= 0;
  const sx = Math.max(0.02, Math.abs(c));
  const thick = 22; // rim depth seen when turned
  const ink = "#2b221d";
  const light = 0.75 + 0.25 * Math.abs(c);
  return (
    <g>
      {/* stand: black acrylic prongs and foot */}
      <path d={`M${cx - 70} ${cy + R + 40} L${cx + 70} ${cy + R + 40} L${cx + 50} ${cy + R + 14} L${cx - 50} ${cy + R + 14} Z`} fill="#121212" />
      <path d={`M${cx} ${cy + R + 16} L${cx} ${cy + R * 0.15}`} stroke="#141414" strokeWidth={14} />
      {/* shadow on the deck */}
      <ellipse cx={cx + 30} cy={cy + R + 44} rx={R * (0.45 + 0.45 * sx)} ry={14} fill="#000" opacity={0.45} filter="url(#mv-soft)" />
      {/* rim edge (thickness) */}
      <ellipse cx={cx - s * thick * 0.5} cy={cy} rx={R * sx + Math.abs(s) * thick * 0.5} ry={R} fill="#8a7a62" />
      <g transform={`translate(${cx},${cy}) scale(${sx},1)`}>
        {face ? (
          <g>
            <circle r={R} fill="url(#mv-glaze)" />
            {/* the well sits lower than the rim: a soft ring of shade where the cavetto falls */}
            <circle r={R * 0.6} fill="none" stroke="#8c7c60" strokeWidth={R * 0.1} opacity={0.22} filter="url(#mv-soft)" />
            <g filter="url(#mv-brush)" fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
              <circle r={R * 0.95} strokeWidth={4} />
              <circle r={R * 0.84} strokeWidth={3} />
              {/* rim band: a running wave between two rings */}
              <path d={Array.from({ length: 28 }, (_, i) => { const a0 = (i / 28) * Math.PI * 2, a1 = ((i + 0.5) / 28) * Math.PI * 2, a2 = ((i + 1) / 28) * Math.PI * 2; const r0 = R * 0.895, r1 = R * 0.93, r2 = R * 0.86; return `${i ? "" : `M${Math.cos(a0) * r0} ${Math.sin(a0) * r0}`} Q${Math.cos(a1) * r1} ${Math.sin(a1) * r1} ${Math.cos(a2) * r0} ${Math.sin(a2) * r0} M${Math.cos(a1) * r2} ${Math.sin(a1) * r2} l0 0`; }).join(" ")} strokeWidth={2.4} />
              <circle r={R * 0.6} strokeWidth={4} />
              <circle r={R * 0.555} strokeWidth={2} />
              {/* the fish: long body, crescent scales, spined dorsal fin, forked tail */}
              <g transform={`rotate(-8) scale(${R / 250})`}>
                <path d="M-118 2 Q-70 -44 10 -44 Q80 -42 122 -2 Q86 34 10 40 Q-70 42 -118 2 Z" fill="#cfc2a2" fillOpacity={0.55} strokeWidth={5} />
                <path d="M-118 2 Q-150 -16 -176 -50 Q-160 -6 -166 4 Q-160 14 -178 54 Q-150 22 -118 2 Z" fill={ink} fillOpacity={0.9} strokeWidth={3} />
                <path d="M-50 -42 Q-30 -84 34 -78 Q48 -60 52 -42" fill={ink} fillOpacity={0.25} strokeWidth={3.5} />
                {Array.from({ length: 7 }, (_, i) => <path key={`sp${i}`} d={`M${-40 + i * 13} -46 L${-34 + i * 13} ${-74 + Math.abs(i - 3) * 3}`} strokeWidth={2} />)}
                <path d="M-20 36 Q-4 70 26 38 M56 30 Q66 54 84 26" strokeWidth={3.5} />
                <path d="M70 -36 Q86 -2 70 34" strokeWidth={4} />
                {Array.from({ length: 3 }, (_, row) => Array.from({ length: 7 - row }, (_, i) => <path key={`s${row}-${i}`} d={`M${-86 + i * 22 + row * 11} ${-24 + row * 18} q9 9 0 18`} strokeWidth={2.4} />))}
                <circle cx={94} cy={-10} r={7} fill={ink} />
                <circle cx={94} cy={-10} r={13} strokeWidth={2} />
                <path d="M120 -4 q10 2 8 10" strokeWidth={2.6} />
              </g>
            </g>
            {/* iron spots in the glaze */}
            {Array.from({ length: 22 }, (_, i) => {
              const a = i * 2.39996, r = R * (0.15 + ((i * 37) % 80) / 100);
              return <circle key={`sp${i}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={1.2 + (i % 3) * 0.7} fill="#5a4a38" opacity={0.5} />;
            })}
            {/* five spur marks from the stacking disc */}
            {Array.from({ length: 5 }, (_, i) => {
              const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
              return <ellipse key={i} cx={Math.cos(a) * R * 0.4} cy={Math.sin(a) * R * 0.4} rx={10} ry={7} fill="#8a6a4a" opacity={0.85} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * R * 0.4} ${Math.sin(a) * R * 0.4})`} />;
            })}
            {/* crackle in the glaze */}
            <g stroke="#6e5f48" strokeWidth={0.9} opacity={0.35} fill="none">
              <path d={`M${-R * 0.8} ${-R * 0.2} l40 -10 l30 24 l44 -8 M${R * 0.3} ${R * 0.6} l-30 20 l-26 -14 l-40 18 M${R * 0.5} ${-R * 0.6} l20 30 l34 4`} />
            </g>
          </g>
        ) : (
          <g>
            {/* back: glaze stops short of the foot; the unglazed base shows the fired clay */}
            <circle r={R} fill="#c9bb9c" />
            <circle r={R * 0.5} fill="url(#mv-clay)" />
            <circle r={R * 0.5} fill="none" stroke="#4d3828" strokeWidth={10} />
            <circle r={R * 0.38} fill="none" stroke="#5a4230" strokeWidth={3} opacity={0.6} />
            <path d={`M${-R * 0.5} 0 Q${-R * 0.7} ${R * 0.4} ${-R * 0.3} ${R * 0.78}`} stroke="#b3a27f" strokeWidth={6} fill="none" opacity={0.6} />
          </g>
        )}
        {/* light: spot from above-left, specular slides across as the plate turns */}
        <ellipse cx={-R * 0.35 + s * R * 0.5} cy={-R * 0.45} rx={R * 0.28} ry={R * 0.14} fill="#fff" opacity={face ? 0.42 * light : 0.1} filter="url(#mv-soft)" />
        <circle r={R} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={6} />
        <circle r={R} fill="#000" opacity={(1 - light) * 0.6} />
      </g>
    </g>
  );
};

// A numbered callout dot on the object (k 0–1 pops it in).
export const Marker = ({ x, y, n, font, k = 1 }: { x: number; y: number; n: number; font: string; k?: number }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x},${y}) scale(${Math.min(1, k) + Math.sin(Math.PI * Math.min(1, k)) * 0.25})`} opacity={Math.min(1, k * 1.5)}>
      <circle r={30} fill="none" stroke={V.label} strokeOpacity={0.5} strokeWidth={2} />
      <circle r={22} fill={V.label} />
      <text y={9} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={V.ink}>{n}</text>
    </g>
  );

// A museum label card (on the plinth or the wall): number, heading, one line.
export const LabelCard = ({ x, y, w, n, head, line, font, k = 1 }: { x: number; y: number; w: number; n?: number; head: string; line: string; font: string; k?: number }) =>
  k <= 0 ? null : (
    <g opacity={Math.min(1, k * 1.5)} transform={`translate(0,${(1 - Math.min(1, k)) * 18})`}>
      <rect x={x + 3} y={y + 5} width={w} height={96} fill="#000" opacity={0.18} filter="url(#mv-soft)" />
      <rect x={x} y={y} width={w} height={96} fill={V.label} />
      {n !== undefined && (
        <g>
          <circle cx={x + 44} cy={y + 48} r={24} fill={V.ink} />
          <text x={x + 44} y={y + 57} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={V.label}>{n}</text>
        </g>
      )}
      <text x={x + (n !== undefined ? 86 : 24)} y={y + 40} fontFamily={font} fontWeight={600} fontSize={30} fill={V.ink}>{head}</text>
      <text x={x + (n !== undefined ? 86 : 24)} y={y + 78} fontFamily={font} fontWeight={400} fontSize={24} fill="#4a4a48">{line}</text>
    </g>
  );
