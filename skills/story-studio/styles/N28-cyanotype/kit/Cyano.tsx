import { loadFont } from "@remotion/google-fonts/Trirong";
import type { ReactNode } from "react";
import { interpolate, interpolateColors, random } from "remotion";

// N28 cyanotype: a sun print on rag paper. The sensitiser is brushed on (yellow-green, ragged brush edges), a real
// object is laid on it and the sheet goes out in the sun (the coat turns grey-bronze), then it is washed: from the
// waterline down the exposed coat turns deep Prussian blue and the shaded shape is left white. Specimens are drawn
// procedurally (branching algae, a fern); nothing is traced from a real plate.

const normal = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
loadFont("italic", { weights: ["400", "600"], subsets: ["thai", "latin"] });
export const font = normal;

export const C = {
  table: "#1d2125", // dark slate drying table
  paper: "#efe8d6", // rag paper
  coat: "#d2cf86", // wet ferric sensitiser, before light
  exposed: "#6e7782", // grey-bronze after the sun
  prussian: "#17428f", // washed cyanotype
  deep: "#0d2a63", // pooled coat, edges of strokes
  ink: "#163a7c", // printed text on the margin
  white: "#f6f3ea", // the shaded shape, after the wash
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- specimens (white silhouettes) ----------
export type Seg = { d: string; w: number };

// Branching red-alga frond: recursive forks with thinning stems and curling tips.
export const alga = (seed: number, x: number, y: number, len: number, ang: number, w: number, depth = 0, out: Seg[] = []): Seg[] => {
  const r = (k: number) => random(`${seed}-${depth}-${k}-${Math.round(x)}-${Math.round(y)}`);
  const bend = (r(1) - 0.5) * 1.5;
  const x1 = x + Math.cos(ang) * len;
  const y1 = y + Math.sin(ang) * len;
  const cx = x + Math.cos(ang + bend) * len * 0.55;
  const cy = y + Math.sin(ang + bend) * len * 0.55;
  out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, w });
  if (depth > 5 || len < 16) {
    // curled tip
    const tip = ang + (r(2) > 0.5 ? 1 : -1) * 1.6;
    out.push({ d: `M${x1.toFixed(1)} ${y1.toFixed(1)} q${(Math.cos(ang) * 10).toFixed(1)} ${(Math.sin(ang) * 10).toFixed(1)} ${(Math.cos(tip) * 9).toFixed(1)} ${(Math.sin(tip) * 9).toFixed(1)}`, w: Math.max(2.2, w * 0.7) });
    return out;
  }
  const n = r(3) > 0.78 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const spread = 0.5 + r(4 + i) * 0.4;
    const a = ang + (i - (n - 1) / 2) * spread + (r(8 + i) - 0.5) * 0.25;
    alga(seed, x1, y1, len * (0.66 + r(12 + i) * 0.18), a, Math.max(2.2, w * 0.66), depth + 1, out);
  }
  // little side bladelets along the stem
  if (depth > 1 && r(20) > 0.4) {
    const t = 0.5;
    const bx = (x + x1) / 2, by = (y + y1) / 2;
    const ba = ang + (r(21) > 0.5 ? 1.1 : -1.1);
    out.push({ d: `M${bx.toFixed(1)} ${by.toFixed(1)} l${(Math.cos(ba) * len * 0.3 * t * 2).toFixed(1)} ${(Math.sin(ba) * len * 0.3 * t * 2).toFixed(1)}`, w: Math.max(2, w * 0.5) });
  }
  return out;
};

// Fern frond: a curving rachis with paired, lobed, lance-shaped pinnae that shrink towards the tip.
export const fern = (x: number, y: number, len: number, ang: number, curl = 0.25): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const N = 20;
  let px = x, py = y, a = ang;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= N; i++) {
    pts.push([px, py, a]);
    px += Math.cos(a) * (len / N);
    py += Math.sin(a) * (len / N);
    a += curl / N;
  }
  nodes.push(<path key="r" d={`M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}`} strokeWidth={6} fill="none" strokeLinecap="round" />);
  pts.slice(2, N).forEach(([qx, qy, qa], i) => {
    const k = 1 - i / (N - 2); // 1 at the base, 0 at the tip
    const L = 18 + 100 * Math.sin(Math.PI * (0.15 + 0.77 * (1 - k)));
    for (const side of [-1, 1]) {
      const pa = qa + side * 1.15;
      const lobes = Math.max(3, Math.round(L / 16));
      const left: string[] = [];
      const right: string[] = [];
      for (let j = 0; j <= 24; j++) {
        const t = j / 24;
        const wv = L * 0.1 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.7) * (0.65 + 0.35 * Math.abs(Math.sin(t * lobes * Math.PI)));
        const cx = qx + Math.cos(pa) * L * t, cy = qy + Math.sin(pa) * L * t;
        const nx = -Math.sin(pa), ny = Math.cos(pa);
        left.push(`${(cx + nx * wv).toFixed(1)} ${(cy + ny * wv).toFixed(1)}`);
        right.unshift(`${(cx - nx * wv).toFixed(1)} ${(cy - ny * wv).toFixed(1)}`);
      }
      nodes.push(<path key={`${i}${side}`} d={`M${left.join(" L")} L${right.join(" L")} Z`} stroke="none" />);
    }
  });
  return nodes;
};

// Stroke colour comes from the parent group (white print, black mask, brown object).
export const Strokes = ({ segs }: { segs: Seg[] }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    {segs.map((s, i) => <path key={i} d={s.d} strokeWidth={s.w} />)}
  </g>
);

// ---------- defs ----------
export const CyanoDefs = () => (
  <defs>
    <filter id="n28-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0.28 -0.06" />
    </filter>
    <filter id="n28-blotch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves={4} seed={3} />
      <feColorMatrix values="0 0 0 0 0.03  0 0 0 0 0.08  0 0 0 0 0.22  0 0 0 0.9 -0.32" />
    </filter>
    {/* ragged brush edge: displace the coat mask with coarse + fine noise */}
    <filter id="n28-rag" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.16" numOctaves={3} seed={11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={54} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* deckled paper edge: small, fibrous */}
    <filter id="n28-deckle" x="-3%" y="-3%" width="106%" height="106%">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={3} seed={4} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* bristle streaks inside the coat */}
    <filter id="n28-bristle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0015 0.22" numOctaves={2} seed={9} />
      <feColorMatrix values="0 0 0 0 0.02  0 0 0 0 0.06  0 0 0 0 0.2  0 0 0 0.7 -0.25" />
    </filter>
    {/* photogram softness: where the object did not lie flat, light crept in */}
    <filter id="n28-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={1.6} />
    </filter>
    <filter id="n28-halo" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation={9} />
    </filter>
    <filter id="n28-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feGaussianBlur stdDeviation={16} />
    </filter>
    <linearGradient id="n28-sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff2c2" stopOpacity={0.75} />
      <stop offset="0.5" stopColor="#ffd98a" stopOpacity={0.25} />
      <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="n28-vig" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.55} />
    </radialGradient>
  </defs>
);

// Brush bands of the coat, each revealed left→right by `k` (0..1 over all bands).
export const BrushMask = ({ id, x, y, w, h, k, children }: { id: string; x: number; y: number; w: number; h: number; k: number; children?: ReactNode }) => {
  const bands = 9;
  const bh = h / bands;
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
      <g filter="url(#n28-rag)">
        {Array.from({ length: bands }, (_, i) => {
          const kk = Math.max(0, Math.min(1, k * bands - i));
          const dir = i % 2 ? -1 : 1;
          const len = (w + 40) * kk;
          const x0 = dir > 0 ? x - 20 : x + w + 20 - len;
          const wob = (random(`b${i}`) - 0.5) * 18;
          return kk > 0 ? <rect key={i} x={x0} y={y + i * bh - 6 + wob * 0.3} width={len} height={bh + 14} rx={bh * 0.4} fill="#fff" /> : null;
        })}
      </g>
      {children}
    </mask>
  );
};

// One sheet: paper, coat (sensitiser → exposed → washed from the waterline down), the white specimen.
// `brush` 0..1 coats it, `sun` 0..1 exposes, `wash` 0..1 moves the waterline from top to bottom.
export const Print = ({ id, x, y, w, h, brush, sun, wash, specimen, specimenOn = 0, lift = 0 }: { id: string; x: number; y: number; w: number; h: number; brush: number; sun: number; wash: number; specimen: ReactNode; specimenOn?: number; lift?: number }) => {
  const exposedCol = interpolateColors(sun, [0, 1], [C.coat, C.exposed]);
  const front = y - 40 + (h + 80) * wash;
  return (
    <g>
      <BrushMask id={`${id}-coat`} x={x} y={y} w={w} h={h} k={brush} />
      <BrushMask id={`${id}-cut`} x={x} y={y} w={w} h={h} k={brush}>
        <g fill="#000" stroke="#000" filter="url(#n28-soft)">{specimen}</g>
      </BrushMask>
      <clipPath id={`${id}-washed`}>
        <rect x={0} y={0} width={1080} height={Math.max(0, front)} />
      </clipPath>
      <clipPath id={`${id}-wet`}>
        <rect x={0} y={Math.max(0, front)} width={1080} height={1920} />
      </clipPath>
      {/* before the wash: one coat colour everywhere (the shaded part stays sensitiser yellow) */}
      <g clipPath={`url(#${id}-wet)`}>
        <rect x={0} y={0} width={1080} height={1920} fill={C.coat} mask={`url(#${id}-coat)`} />
        <rect x={0} y={0} width={1080} height={1920} fill={exposedCol} mask={`url(#${id}-cut)`} />
      </g>
      {/* after the wash: Prussian blue with pooled darker blotches, the shape left white */}
      <g clipPath={`url(#${id}-washed)`}>
        <g mask={`url(#${id}-cut)`}>
          <rect x={0} y={0} width={1080} height={1920} fill={C.prussian} />
          <rect x={0} y={0} width={1080} height={1920} filter="url(#n28-blotch)" />
          <rect x={0} y={0} width={1080} height={1920} filter="url(#n28-bristle)" />
        </g>
        {/* faint blue halo where light crept under the specimen */}
        <g fill={C.prussian} stroke={C.prussian} opacity={0.18} filter="url(#n28-halo)" mask={`url(#${id}-coat)`}>{specimen}</g>
      </g>
      {/* water front: a wet sheen line */}
      {wash > 0 && wash < 1 && (
        <g opacity={0.8}>
          <rect x={x - 40} y={front - 26} width={w + 80} height={26} fill="#cfe2f5" opacity={0.18} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M${x - 20} ${front - 4 - i * 9} q${w / 4} ${Math.sin(i + wash * 20) * 6} ${w / 2} 0 t${w / 2} 0`} stroke="#e9f3ff" strokeWidth={1.6} fill="none" opacity={0.5 - i * 0.06} />
          ))}
        </g>
      )}
      {/* the real object lying on the sheet during exposure */}
      {specimenOn > 0 && (
        <g transform={`translate(${lift * 30},${-lift * 60})`} opacity={specimenOn}>
          <g fill="#000" stroke="#000" opacity={0.35 * (1 - lift * 0.6)} transform={`translate(${10 + lift * 40},${14 + lift * 70})`} filter="url(#n28-halo)">{specimen}</g>
          <g fill="#4d3a1c" stroke="#4d3a1c" opacity={0.92}>{specimen}</g>
          <g fill="none" stroke="#8a6a32" opacity={0.5} transform="translate(-1.5,-1.5)">{specimen}</g>
        </g>
      )}
    </g>
  );
};

// Rag-paper sheet lying on the slate table, with a soft shadow, fibre and deckled edge.
export const Sheet = ({ x, y, w, h, rot = 0, children }: { x: number; y: number; w: number; h: number; rot?: number; children?: ReactNode }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 14} y={y + 26} width={w} height={h} fill="#000" opacity={0.55} filter="url(#n28-shadow)" />
    <rect x={x} y={y} width={w} height={h} fill={C.paper} filter="url(#n28-deckle)" />
    <rect x={x} y={y} width={w} height={h} filter="url(#n28-fibre)" opacity={0.9} />
    {children}
  </g>
);

// Sunlight raking across the sheet during exposure.
export const Sun = ({ k }: { k: number }) => (
  <g opacity={k}>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#n28-sun)" style={{ mixBlendMode: "screen" }} />
    {Array.from({ length: 5 }, (_, i) => (
      <path key={i} d={`M${-200 + i * 260} -100 L${200 + i * 260} -100 L${1180 + i * 120} 2000 L${880 + i * 120} 2000 Z`} fill="#fff3cc" opacity={0.05} />
    ))}
  </g>
);

export const fadeIn = (frame: number, a: number, d = 14) => interpolate(frame, [a, a + d], [0, 1], clamp);
