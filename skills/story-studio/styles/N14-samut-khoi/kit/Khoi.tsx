import type { ReactNode } from "react";

// N14 samut khoi kit: a WHITE khoi-paper folding book (สมุดข่อยขาว) lying on indigo hand-dyed cotton. The
// accordion opens page by page: each leaf swings open on its fold, alternate leaves tilt toward and away from the
// light, the unopened leaves stay as a folded stack below. Paintings are polychrome mineral colours with a black
// ink outline; text is hand-written ink lines that write themselves after the leaf opens.

export const C = {
  cloth: "#d9a521", // golden temple silk the manuscript is wrapped in
  paper: "#f1ead8", // khoi paper
  shade: "#d8ccb0", // paper in shadow
  red: "#c8402a", // vermilion (chad)
  ochre: "#d9a43a", // yellow ochre / gold leaf
  green: "#3f7a4a", // verdigris green
  blue: "#2f4f8a", // indigo paint
  pink: "#e79a92", // lotus
  skin: "#f2cf9a",
  ink: "#1c1712",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OL = { stroke: C.ink, strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const KhoiDefs = () => (
  <defs>
    <pattern id="n14-weave" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill={C.cloth} />
      <rect width="6" height="2.4" fill="#e2b23a" />
      <rect width="2.2" height="6" fill="#b8861a" opacity="0.6" />
    </pattern>
    <linearGradient id="n14-silk" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.3" stopColor="#fff3c2" stopOpacity="0.28" />
      <stop offset="0.42" stopColor="#ffffff" stopOpacity="0" />
      <stop offset="0.7" stopColor="#7a4a08" stopOpacity="0.18" />
      <stop offset="0.85" stopColor="#fff3c2" stopOpacity="0.2" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <filter id="n14-dye" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="3" seed="11" />
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.45  0 0 0 1.6 -0.55" />
    </filter>
    <filter id="n14-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.32" numOctaves="2" seed="4" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 1.3 -0.5" />
    </filter>
    <filter id="n14-stain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="21" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.46  0 0 0 0 0.24  0 0 0 2.4 -1.5" />
    </filter>
    <filter id="n14-paint" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="8" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
    </filter>
    <filter id="n14-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="n14-soft" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <linearGradient id="n14-up" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fdfbf4" />
      <stop offset="1" stopColor="#f0ebdf" />
    </linearGradient>
    <linearGradient id="n14-down" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e6e0d2" />
      <stop offset="1" stopColor="#f7f3ea" />
    </linearGradient>
    <linearGradient id="n14-cover" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#a8321f" />
      <stop offset="1" stopColor="#6e1d14" />
    </linearGradient>
  </defs>
);

// Golden silk under the book: fine weave, uneven dye, a soft diagonal sheen, darker toward the edges.
export const Cloth = ({ w, h }: { w: number; h: number }) => (
  <g>
    <rect width={w} height={h} fill="url(#n14-weave)" />
    <rect width={w} height={h} filter="url(#n14-dye)" opacity={0.2} />
    <rect width={w} height={h} fill="url(#n14-silk)" />
    <rect width={w} height={h} fill="none" stroke="#5a3404" strokeWidth={120} opacity={0.35} filter="url(#n14-shadow)" />
  </g>
);

// ---------- the accordion ----------
export type Leaf = { h: number; open: number; content: ReactNode };
// The accordion seen at an angle across the table. Each leaf is an affine-mapped parallelogram: `u` is the fold
// direction (shared by every leaf), and the step from one fold to the next alternates — leaves tilted toward the
// eye are tall and lit, leaves tilted away are foreshortened and in shade — so the left edge zigzags like a real
// concertina. Each leaf opens (0→1) on its top fold; the unopened rest of the book stays folded at the end.
const grows = (o: number) => 0.06 + 0.94 * Math.sin((Math.max(0, Math.min(1, o)) * Math.PI) / 2);
// y of each fold (left end) for the current open values: use it to aim a camera at the newest leaf
export const foldYs = (leaves: Leaf[], y0: number, away = 0.8) => {
  const ys = [y0];
  leaves.forEach((lf, i) => ys.push(ys[i] + (lf.open > 0 ? lf.h * (i % 2 === 0 ? 1 : away) * grows(lf.open) : 0)));
  return ys;
};
export const Accordion = ({ x0, y0, w, angle = -9, leaves, left = 0, away = 0.8, kink = 34 }: { x0: number; y0: number; w: number; angle?: number; leaves: Leaf[]; left?: number; away?: number; kink?: number }) => {
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a) * w;
  const uy = Math.sin(a) * w;
  let px = x0;
  let py = y0;
  const rows: ReactNode[] = [];
  const folds: ReactNode[] = [];
  const P = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  leaves.forEach((lf, i) => {
    const o = Math.max(0, Math.min(1, lf.open));
    if (o <= 0) return;
    const towards = i % 2 === 0;
    const g = grows(o);
    const vy = lf.h * (towards ? 1 : away) * g;
    const vx = (towards ? -kink : kink) * g;
    const poly = [P(px, py), P(px + ux, py + uy), P(px + ux + vx, py + uy + vy), P(px + vx, py + vy)].join(" ");
    const m = `matrix(${ux / w},${uy / w},${vx / lf.h},${vy / lf.h},${px},${py})`;
    const id = `n14-leaf-${i}`;
    rows.push(
      <g key={i}>
        <clipPath id={id}>
          <polygon points={poly} />
        </clipPath>
        <g clipPath={`url(#${id})`}>
          <g transform={m}>
            <rect width={w} height={lf.h} fill={towards ? "url(#n14-up)" : "url(#n14-down)"} />
            <rect width={w} height={lf.h} filter="url(#n14-fibre)" opacity={0.22} />
            <rect width={w} height={lf.h} filter="url(#n14-stain)" opacity={0.16} />
            <g opacity={Math.min(1, o * 1.6)}>{lf.content}</g>
            {/* fold shading: leaves turned away from the light are in shade; every crease has a soft dark band */}
            <rect width={w} height={lf.h} fill="#2a2a3a" opacity={(towards ? 0 : 0.2) + (1 - o) * 0.35} />
            <rect y={towards ? lf.h - 30 : 0} width={w} height={30} fill="#4a3a20" opacity={0.2} filter="url(#n14-soft)" />
          </g>
        </g>
        <polygon points={poly} fill="none" stroke="#a89a78" strokeWidth={1.4} />
      </g>,
    );
    // ridge folds (toward the eye) catch light; valley folds are dark creases
    folds.push(<line key={i} x1={px} y1={py} x2={px + ux} y2={py + uy} stroke={towards ? "#6a5530" : "#fffdf4"} strokeWidth={towards ? 2.5 : 4} opacity={0.8} />);
    px += vx;
    py += vy;
  });
  // the folded rest of the book, and the red lacquered cover board under it
  const n = Math.max(3, left);
  const stack = (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <polygon key={i} points={[P(px + (i % 2) * 4, py + i * 4), P(px + ux - (i % 2) * 4, py + uy + i * 4), P(px + ux - (i % 2) * 4, py + uy + i * 4 + 4), P(px + (i % 2) * 4, py + i * 4 + 4)].join(" ")} fill={i % 2 ? "#e6e0d2" : "#f7f3ea"} stroke="#ad9f7d" strokeWidth={0.6} />
      ))}
      <polygon points={[P(px - 8, py + n * 4), P(px + ux + 8, py + uy + n * 4), P(px + ux + 8, py + uy + n * 4 + 22), P(px - 8, py + n * 4 + 22)].join(" ")} fill="url(#n14-cover)" stroke="#3a0d08" strokeWidth={1} />
    </g>
  );
  const by = py + n * 4 + 22;
  const shadow = [P(x0 + 30, y0 + 30), P(x0 + ux + 60, y0 + uy + 40), P(px + ux + 60, by + uy + 40), P(px + 20, by + 34)].join(" ");
  return (
    <g>
      <polygon points={shadow} fill="#4a2a04" opacity={0.55} filter="url(#n14-shadow)" />
      {rows}
      {folds}
      {stack}
    </g>
  );
};

// ---------- page furniture ----------
export const Rules = ({ w, h }: { w: number; h: number }) => (
  <g fill="none" stroke={C.red} opacity={0.85}>
    <rect x={18} y={16} width={w - 36} height={h - 32} strokeWidth={2.4} />
    <rect x={26} y={24} width={w - 52} height={h - 48} strokeWidth={1} />
  </g>
);

// Hand-written ink lines that write themselves left to right (k 0→1 across all lines).
export const InkLines = ({ x, y, lines, size, lead, k, font, color = C.ink, id }: { x: number; y: number; lines: string[]; size: number; lead: number; k: number; font: string; color?: string; id: string }) => (
  <g>
    {lines.map((t, i) => {
      const kk = Math.max(0, Math.min(1, k * lines.length - i));
      if (kk <= 0) return null;
      return (
        <g key={i}>
          <clipPath id={`${id}-${i}`}>
            <rect x={x - 10} y={y + i * lead - size * 1.2} width={(size * t.length * 0.62 + 30) * kk} height={size * 1.8} />
          </clipPath>
          <text x={x} y={y + i * lead} fontFamily={font} fontSize={size} fill={color} clipPath={`url(#${id}-${i})`} opacity={0.92}>{t}</text>
        </g>
      );
    })}
  </g>
);

// Kanok-like flame scallops along a horizontal line (borders, cartouches).
export const Flames = ({ x, y, w, n, color = C.ochre, up = true }: { x: number; y: number; w: number; n: number; color?: string; up?: boolean }) => {
  const s = w / n;
  const d = up ? -1 : 1;
  return (
    <path
      d={Array.from({ length: n }, (_, i) => {
        const a = x + i * s;
        return `M${a},${y} C${a + s * 0.1},${y + d * s * 0.6} ${a + s * 0.7},${y + d * s * 0.5} ${a + s * 0.78},${y + d * s * 1.1} C${a + s * 0.86},${y + d * s * 0.5} ${a + s},${y + d * s * 0.3} ${a + s},${y}Z`;
      }).join(" ")}
      fill={color}
      {...OL}
      strokeWidth={1.4}
    />
  );
};

// Sprig of four-petal flowers scattered on a painted ground (ดอกลอย).
export const Sprigs = ({ pts, color = "#f7e7c4" }: { pts: [number, number][]; color?: string }) => (
  <g>
    {pts.map(([a, b], i) => (
      <g key={i} transform={`translate(${a},${b}) rotate(${i * 37})`}>
        {[0, 90, 180, 270].map((r) => <ellipse key={r} cx={0} cy={-5} rx={2.6} ry={5} fill={color} transform={`rotate(${r})`} />)}
        <circle r={1.8} fill={C.red} />
      </g>
    ))}
  </g>
);

// Stylised rocks (เขามอ): stacked lobed blocks with ink outlines and darker inner bands.
export const Rocks = ({ x, y, s = 1, color = C.green }: { x: number; y: number; s?: number; color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#n14-paint)">
    {[
      [0, 0, 70, 46],
      [44, -30, 60, 40],
      [-30, -22, 50, 34],
      [10, -58, 44, 32],
    ].map(([a, b, w, h], i) => (
      <g key={i}>
        <path d={`M${a},${b + h} L${a},${b + 10} Q${a},${b} ${a + 10},${b} L${a + w - 10},${b} Q${a + w},${b} ${a + w},${b + 10} L${a + w},${b + h}Z`} fill={i % 2 ? C.blue : color} {...OL} />
        <path d={`M${a + 8},${b + h - 6} L${a + 8},${b + 14} Q${a + 8},${b + 8} ${a + 16},${b + 8} L${a + w - 16},${b + 8}`} fill="none" stroke="#f4ecd9" strokeWidth={2} opacity={0.6} />
      </g>
    ))}
  </g>
);

export const Lotus = ({ x, y, s = 1, open = 1 }: { x: number; y: number; s?: number; open?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0,0 L0,40" stroke={C.green} strokeWidth={3} />
    {[-1, 1].map((d) => <path key={d} d={`M0,0 C${d * 18 * open},-6 ${d * 20 * open},-22 ${d * 6},-30 C${d * 4},-18 ${d * 2},-8 0,0Z`} fill={C.pink} {...OL} strokeWidth={1.6} />)}
    <path d="M0,0 C-8,-10 -6,-26 0,-36 C6,-26 8,-10 0,0Z" fill="#f3b8ae" {...OL} strokeWidth={1.6} />
  </g>
);

// Phra Malai: a standing monk in an ochre-saffron robe with a flame halo, on swirling clouds, holding lotuses.
export const Monk = ({ x, y, s = 1, sway = 0 }: { x: number; y: number; s?: number; sway?: number }) => (
  <g transform={`translate(${x},${y + sway}) scale(${s})`} filter="url(#n14-paint)">
    <path d="M0,-150 C-34,-150 -40,-196 -14,-214 C-8,-238 8,-238 14,-214 C40,-196 34,-150 0,-150Z" fill={C.ochre} {...OL} />
    <path d="M0,-158 C-22,-160 -26,-190 -10,-202 C-4,-218 4,-218 10,-202 C26,-190 22,-160 0,-158Z" fill="#f0c25e" {...OL} strokeWidth={1.2} />
    <ellipse cx={0} cy={-178} rx={16} ry={19} fill={C.skin} {...OL} />
    <path d="M-6,-178 q3,3 6,0 M4,-178 q3,3 6,0" fill="none" {...OL} strokeWidth={1.4} />
    {/* robe */}
    <path d="M-30,-150 C-44,-110 -46,-40 -40,0 L38,0 C44,-40 42,-110 30,-150 C16,-160 -16,-160 -30,-150Z" fill="#d9762e" {...OL} />
    <path d="M-30,-150 C-10,-120 10,-90 38,-40 M-36,-90 C-20,-60 -6,-30 4,0 M12,-60 L18,0" fill="none" stroke="#9e4a1c" strokeWidth={2} />
    <path d="M30,-150 C40,-132 44,-118 40,-100 C30,-106 24,-120 22,-140Z" fill={C.skin} {...OL} />
    {/* hands holding lotus */}
    <path d="M-10,-104 C-2,-112 10,-110 16,-102 C8,-96 -4,-96 -10,-104Z" fill={C.skin} {...OL} />
    <Lotus x={4} y={-112} s={0.9} />
    {/* clouds */}
    {[-46, -14, 18, 50].map((cx, i) => (
      <path key={i} d={`M${cx - 26},12 C${cx - 30},-6 ${cx - 6},-12 ${cx},2 C${cx + 6},-12 ${cx + 30},-6 ${cx + 26},12Z`} fill={i % 2 ? "#cfe0f0" : "#f6f2ea"} {...OL} strokeWidth={1.6} />
    ))}
    <path d="M-60,14 C-40,30 40,30 66,14" fill="none" stroke={C.blue} strokeWidth={2.6} />
  </g>
);

// A poor man kneeling, both hands raised offering lotuses.
export const Offerer = ({ x, y, s = 1, lift = 0 }: { x: number; y: number; s?: number; lift?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#n14-paint)">
    <ellipse cx={-6} cy={-100} rx={13} ry={15} fill="#c98f5e" {...OL} />
    <path d="M-16,-108 C-14,-122 4,-122 4,-108" fill={C.ink} />
    <path d="M-18,-86 C-24,-60 -30,-36 -24,-18 L22,-18 C24,-40 16,-64 6,-86Z" fill="#c98f5e" {...OL} />
    <path d="M-30,-22 C-32,-6 -10,2 30,0 C40,-2 40,-18 24,-24 Z" fill={C.red} {...OL} />
    <path d="M-34,0 L40,0" stroke={C.ink} strokeWidth={2.4} />
    <path d={`M2,-80 C18,-86 26,${-98 - lift} 30,${-110 - lift}`} fill="none" stroke="#c98f5e" strokeWidth={9} strokeLinecap="round" />
    <path d={`M2,-80 C18,-86 26,${-98 - lift} 30,${-110 - lift}`} fill="none" stroke={C.ink} strokeWidth={1.4} opacity={0.6} />
    {[-10, 0, 10].map((d, i) => <Lotus key={i} x={30 + d} y={-114 - lift} s={0.55} />)}
  </g>
);

// The Chulamani chedi in Tavatimsa heaven: a gold bell-shaped stupa on a stepped base, rays and clouds.
export const Chedi = ({ x, y, s = 1, glow = 0 }: { x: number; y: number; s?: number; glow?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#n14-paint)">
    {Array.from({ length: 13 }, (_, i) => {
      const a = (-90 + (i - 6) * 13) * (Math.PI / 180);
      return <line key={i} x1={0} y1={-120} x2={Math.cos(a) * (150 + glow * 12)} y2={-120 + Math.sin(a) * (150 + glow * 12)} stroke={C.ochre} strokeWidth={3} opacity={0.55} />;
    })}
    <path d="M-70,0 L70,0 L60,-16 L-60,-16Z M-56,-16 L56,-16 L46,-32 L-46,-32Z" fill="#f2d27a" {...OL} />
    <path d="M-44,-32 C-50,-80 -24,-110 0,-112 C24,-110 50,-80 44,-32Z" fill={C.ochre} {...OL} />
    <path d="M-30,-40 C-32,-74 -14,-96 0,-98" fill="none" stroke="#fff2c4" strokeWidth={3} opacity={0.8} />
    <rect x={-16} y={-128} width={32} height={16} fill="#f2d27a" {...OL} />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={0} cy={-134 - i * 11} rx={12 - i * 1.6} ry={4.5} fill={C.ochre} {...OL} strokeWidth={1.4} />)}
    <path d="M0,-200 L-3,-198 L0,-226 L3,-198Z" fill={C.ochre} {...OL} strokeWidth={1.2} />
    <path d="M-40,-60 L-20,-60 M20,-60 L40,-60" stroke={C.red} strokeWidth={3} />
    {[-1, 1].map((d) => (
      <path key={d} d={`M${d * 70},4 C${d * 80},-14 ${d * 104},-14 ${d * 108},2 C${d * 118},-10 ${d * 140},-4 ${d * 136},12Z`} fill="#f6f2ea" {...OL} strokeWidth={1.6} />
    ))}
  </g>
);

// A deva (thewada) kneeling in anjali (palms together), wearing a pointed crown; `skin` lets Indra be green.
export const Deva = ({ x, y, s = 1, skin = C.skin, robe = C.red, bob = 0 }: { x: number; y: number; s?: number; skin?: string; robe?: string; bob?: number }) => (
  <g transform={`translate(${x},${y + bob}) scale(${s})`} filter="url(#n14-paint)">
    <path d="M-36,-2 C-40,-30 -30,-60 -10,-74 L14,-74 C26,-56 30,-30 30,-2Z" fill={robe} {...OL} />
    <path d="M-28,-30 C-10,-36 10,-36 28,-28" fill="none" stroke={C.ochre} strokeWidth={4} />
    <path d="M-44,0 C-40,-20 20,-20 44,0Z" fill={C.blue} {...OL} />
    <ellipse cx={2} cy={-92} rx={14} ry={16} fill={skin} {...OL} />
    <path d="M-12,-100 L16,-100 L10,-118 L6,-134 L2,-160 L-2,-134 L-6,-118Z" fill={C.ochre} {...OL} strokeWidth={1.6} />
    <path d="M-14,-96 C-22,-90 -22,-80 -16,-74" fill="none" stroke={C.ochre} strokeWidth={3} />
    <path d="M14,-62 C22,-74 26,-86 22,-100 C18,-90 12,-80 8,-66Z" fill={skin} {...OL} strokeWidth={1.6} />
    <path d="M-6,-70 L14,-62" stroke={skin} strokeWidth={8} strokeLinecap="round" />
  </g>
);
