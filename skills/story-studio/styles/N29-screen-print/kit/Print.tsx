import type { ReactNode } from "react";

// Screen-print pieces: an off-white sheet on a green vacuum print bed, spot inks that overprint (multiply), a hinged screen
// that drops onto the sheet, and a squeegee whose pull reveals each ink from top to bottom. 1080×1920 frame.
// Each <Ink> is ONE ink: draw its shapes in solid colour (or the split-fountain gradient) inside it; shapes are
// roughened (hand-cut stencil), get a darker ink build-up along every edge and fine pin-holes, and multiply with
// the inks under them, so violet over pink prints plum. INK.blue is the violet second ink.
export const PAPER = "#f1eadb";
export const BENCH = "#1f8a6e";
export const INK = { pink: "#ff2f7d", orange: "#ff8a1e", yellow: "#ffd21a", blue: "#4b2aa8", dark: "#1d1430", teal: "#11a7a0" };
export const SHEET = { x: 34, y: 84, w: 1012, h: 1752 };
export const AREA = { x: 60, y: 200, w: 960, h: 1460 };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const PrintDefs = () => (
  <defs>
    {/* split fountain: two or three inks laid side by side on the screen and blended by the squeegee */}
    <linearGradient id="sp-fountain" x1="0" y1="0" x2="0.18" y2="1">
      <stop offset="0" stopColor={INK.pink} />
      <stop offset="0.3" stopColor={INK.pink} />
      <stop offset="0.56" stopColor={INK.orange} />
      <stop offset="0.86" stopColor={INK.yellow} />
      <stop offset="1" stopColor={INK.yellow} />
    </linearGradient>
    <linearGradient id="sp-fountain2" x1="0" y1="0" x2="0.18" y2="1">
      <stop offset="0" stopColor={INK.teal} />
      <stop offset="0.35" stopColor={INK.teal} />
      <stop offset="0.7" stopColor="#9ed43a" />
      <stop offset="1" stopColor={INK.yellow} />
    </linearGradient>
    {/* paper: fibres and a little tooth */}
    <filter id="sp-paper" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.7 0.05" numOctaves={2} seed={5} result="f" />
      <feColorMatrix in="f" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.55 -0.18" />
    </filter>
    <filter id="sp-bench" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves={3} seed={11} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.05  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.5 -0.1" />
    </filter>
    {/* one ink: hand-cut wobble, pin-holes where the mesh starved, uneven lay-down, darker build-up on the edges */}
    <filter id="sp-ink" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={3} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feMorphology in="d" operator="erode" radius={3.5} result="er" />
      <feGaussianBlur in="er" stdDeviation={2.2} result="erb" />
      <feComposite in="d" in2="erb" operator="out" result="edge" />
      <feColorMatrix in="edge" values="0.62 0 0 0 0  0 0.6 0 0 0  0 0 0.66 0 0  0 0 0 0.85 0" result="edgeDark" />
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={9} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -11 8.3" result="holes" />
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={2} seed={21} result="lay" />
      <feColorMatrix in="lay" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0.72" result="layA" />
      <feComposite in="holes" in2="layA" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="cov" />
      <feComposite in="d" in2="cov" operator="in" result="body" />
      <feMerge><feMergeNode in="body" /><feMergeNode in="edgeDark" /></feMerge>
    </filter>
    {/* chunky hand-cut letters: a rougher wobble */}
    <filter id="sp-cut" x="-5%" y="-20%" width="110%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={14} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={7} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* the screen mesh: fine woven grid */}
    <pattern id="sp-mesh" width={7} height={7} patternUnits="userSpaceOnUse">
      <rect width={7} height={7} fill="none" />
      <path d="M0 0.5 H7 M0.5 0 V7" stroke="#fff" strokeWidth={1} strokeOpacity={0.5} />
    </pattern>
    <pattern id="sp-wood" width={1080} height={70} patternUnits="userSpaceOnUse">
      <rect width={1080} height={70} fill="#9a6a38" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${6 + i * 7} C300 ${2 + i * 7 + (i % 3) * 3} 700 ${10 + i * 7 - (i % 2) * 4} 1080 ${5 + i * 7}`} stroke="#6e4620" strokeWidth={1.4} fill="none" opacity={0.55} />)}
    </pattern>
  </defs>
);

// The vacuum bed (green, rows of suction holes, registration stops) and the sheet laid on it with a soft shadow.
export const Bench = () => (
  <g>
    <rect width={1080} height={1920} fill={BENCH} />
    <rect width={1080} height={1920} filter="url(#sp-bench)" />
    {/* vacuum bed: rows of small suction holes */}
    {Array.from({ length: 30 * 17 }, (_, i) => <circle key={`h${i}`} cx={18 + (i % 17) * 64} cy={20 + Math.floor(i / 17) * 64} r={4} fill="#0e3e31" />)}
    {/* registration stops: little L-shaped tabs the sheet is pushed against */}
    {[[SHEET.x - 14, SHEET.y + 300], [SHEET.x - 14, SHEET.y + 1300]].map(([x, y], i) => <rect key={i} x={x} y={y} width={14} height={90} fill="#c9c1a8" opacity={0.7} />)}
  </g>
);

export const Sheet = ({ x = 0, y = 0, rot = 0, children }: { x?: number; y?: number; rot?: number; children?: ReactNode }) => (
  <g transform={`translate(${x},${y}) rotate(${rot},540,960)`}>
    <rect x={SHEET.x + 10} y={SHEET.y + 16} width={SHEET.w} height={SHEET.h} fill="#000" opacity={0.45} rx={2} style={{ filter: "blur(12px)" }} />
    <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={PAPER} />
    <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} filter="url(#sp-paper)" />
    {children}
    {/* the mesh leaves its weave in the ink */}
    <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} fill="url(#sp-mesh)" opacity={0.09} style={{ mixBlendMode: "screen" }} />
  </g>
);

// Crop marks and a registration target in the margins.
export const Marks = ({ color = INK.dark }: { color?: string }) => {
  const c = [[AREA.x, AREA.y], [AREA.x + AREA.w, AREA.y], [AREA.x, AREA.y + AREA.h], [AREA.x + AREA.w, AREA.y + AREA.h]];
  return (
    <g stroke={color} strokeWidth={2} fill="none" opacity={0.8}>
      {c.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y + (y === AREA.y ? -48 : 18)} v30 M${x + (x === AREA.x ? -48 : 18)} ${y} h30`} />
        </g>
      ))}
      {[[540, SHEET.y + 40], [540, SHEET.y + SHEET.h - 38]].map(([x, y], i) => (
        <g key={`t${i}`}><circle cx={x} cy={y} r={13} /><path d={`M${x - 22} ${y} h44 M${x} ${y - 22} v44`} /></g>
      ))}
    </g>
  );
};

// One ink layer revealed by the squeegee down to `upto` (frame y). Leave `upto` out once the pull is done.
export const Ink = ({ children, upto = 9999, opacity = 1 }: { children: ReactNode; upto?: number; opacity?: number }) => {
  const id = `sp-clip-${Math.round(upto)}-${Math.round(opacity * 100)}`;
  return (
    <g style={{ mixBlendMode: "multiply" }} opacity={opacity}>
      <defs><clipPath id={id}><rect x={0} y={0} width={1080} height={Math.max(0, upto)} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <g filter="url(#sp-ink)">{children}</g>
      </g>
    </g>
  );
};

// The hinged screen: aluminium frame, stretched mesh with a faint yellow emulsion tint. down 0 = lifted away,
// 1 = flat on the sheet.
export const Screen = ({ down }: { down: number }) => {
  if (down <= 0.001) return null;
  const lift = 1 - down;
  return (
    <g opacity={Math.min(1, down * 1.6)} transform={`translate(540,${-lift * 260}) scale(${1 + lift * 0.08}) translate(-540,0)`}>
      <rect x={20} y={40} width={1040} height={1830} fill="#000" opacity={0.18 * down} style={{ filter: "blur(18px)" }} />
      <rect x={24} y={50} width={1032} height={1810} fill="#e9dc8a" opacity={0.16} />
      <rect x={24} y={50} width={1032} height={1810} fill="url(#sp-mesh)" opacity={0.35} />
      <rect x={24} y={50} width={1032} height={1810} fill="none" stroke="#b9bcbd" strokeWidth={30} />
      <rect x={24} y={50} width={1032} height={1810} fill="none" stroke="#7d8183" strokeWidth={4} />
      <rect x={10} y={36} width={1060} height={1838} fill="none" stroke="#e6e8e8" strokeWidth={2} opacity={0.6} />
    </g>
  );
};

// The squeegee: wooden handle, aluminium holder, rubber blade and the ink bead it pushes. y = blade line.
export const Squeegee = ({ y, ink, show = 1 }: { y: number; ink: string; show?: number }) => {
  if (show <= 0) return null;
  const bead = Array.from({ length: 28 }, (_, i) => {
    const x = 40 + i * 37.5;
    return `Q${x + 18} ${y + 30 + 10 * rnd(i + y * 0.01)} ${x + 37.5} ${y + 22 + 6 * rnd(i + 3)}`;
  }).join(" ");
  return (
    <g opacity={show}>
      <rect x={20} y={y - 70} width={1040} height={120} fill="#000" opacity={0.35} style={{ filter: "blur(14px)" }} transform="translate(8,26)" />
      {/* ink bead rolling ahead of the blade */}
      <path d={`M40 ${y + 6} L40 ${y + 22} ${bead} L1040 ${y + 6} Z`} fill={ink} />
      <path d={`M48 ${y + 14} H1032`} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
      <rect x={30} y={y - 6} width={1020} height={18} fill="#1f4a3c" />
      <rect x={30} y={y - 30} width={1020} height={26} fill="#c2c6c7" />
      <rect x={30} y={y - 30} width={1020} height={6} fill="#eef0f0" />
      <rect x={30} y={y - 90} width={1020} height={62} fill="url(#sp-wood)" />
      <rect x={30} y={y - 90} width={1020} height={62} fill="none" stroke="#4a2e14" strokeWidth={3} />
      <rect x={34} y={y - 86} width={1012} height={8} fill="#fff" opacity={0.18} />
    </g>
  );
};
