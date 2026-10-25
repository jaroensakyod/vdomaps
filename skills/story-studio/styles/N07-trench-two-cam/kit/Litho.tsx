import type { ReactNode } from "react";
import { interpolate } from "remotion";

// WW1-era lithograph poster pieces: three flat inks (khaki, brick, black) on off-white stone-printed paper. No
// outlines: every shape is a flat ink with a lithographic-crayon tooth (speckled holes + slightly rough edges,
// `<LithoDefs/>` filters), shading is diagonal crayon hatching. The world is a side view (ground GROUND, x −400…3000)
// shown through slanted poster panels (`Panel`). Everything animates on twos (see `twos`).
export const GROUND = 1000;
export const INK = { paper: "#ece2c8", paper2: "#e2d5b4", khaki: "#8c7b4e", khakiLt: "#b9a774", brick: "#b3402a", black: "#17130f" } as const;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const since = (list: number[], f: number) => { let d = 1e9; for (const x of list) if (x <= f) d = Math.min(d, f - x); return d; };
// stepped-on-twos: picture holds every drawing for 2 frames, like a printed flip-book.
export const twos = (f: number) => Math.floor(f / 2) * 2;

// Filters and patterns, once per <svg>: `url(#crayon)` gives an ink layer its crayon tooth, `url(#hatch)` and
// `url(#hatchK)` are diagonal crayon hatchings (black / khaki), `url(#stone)` is the paper grain.
export const LithoDefs = () => (
  <defs>
    <filter id="crayon" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1920}>
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={4} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -26 16.6" result="holes" />
      <feComposite in="SourceGraphic" in2="holes" operator="in" result="toothed" />
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={9} result="w" />
      <feDisplacementMap in="toothed" in2="w" scale={5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="crayonT" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1920}>
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -30 19.8" result="holes" />
      <feComposite in="SourceGraphic" in2="holes" operator="in" result="toothed" />
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={1} seed={3} result="w" />
      <feDisplacementMap in="toothed" in2="w" scale={2} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="stone" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55 0.7" numOctaves={3} seed={2} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.16  0 0 0 0.5 -0.12" />
    </filter>
    <pattern id="hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
      <rect width={14} height={14} fill="none" />
      <line x1={0} y1={3} x2={14} y2={3} stroke={INK.black} strokeWidth={4.5} />
    </pattern>
    <pattern id="hatchK" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
      <line x1={0} y1={4} x2={18} y2={4} stroke={INK.khaki} strokeWidth={6} />
    </pattern>
    <pattern id="hatchB" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(58)">
      <line x1={0} y1={4} x2={16} y2={4} stroke={INK.brick} strokeWidth={5} />
    </pattern>
  </defs>
);

// Paper with its stone grain, full bleed.
export const Paper = ({ w, h }: { w: number; h: number }) => (
  <g>
    <rect width={w} height={h} fill={INK.paper} />
    <rect width={w} height={h} filter="url(#stone)" />
  </g>
);

// A slanted poster panel: `poly` is the panel outline on the page; the world is drawn inside it with camera
// (cx, cy, zoom) centred on the panel. No rounded frame — a hard printed edge and a thick black keyline.
export const Panel = ({ id, poly, cx, cy, zoom, shake, children }: { id: string; poly: [number, number][]; cx: number; cy: number; zoom: number; shake: number; children: ReactNode }) => {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const pts = poly.map((p) => p.join(",")).join(" ");
  const sx = Math.sin(cx * 0.013 + cy) * shake;
  const sy = Math.cos(cx * 0.017) * shake;
  return (
    <g>
      <clipPath id={`clip-${id}`}><polygon points={pts} /></clipPath>
      <g clipPath={`url(#clip-${id})`} filter="url(#crayon)">
        <rect x={0} y={0} width={1080} height={1920} fill={INK.paper} />
        <g transform={`translate(${mx + sx},${my + sy}) scale(${zoom}) translate(${-cx},${-cy})`}>{children}</g>
      </g>
      <polygon points={pts} fill="none" stroke={INK.black} strokeWidth={10} strokeLinejoin="miter" />
    </g>
  );
};

// The field behind everything: paper sky with searchlight beams, a low brick sun, a khaki far ridge with crayon
// hatching, black mud sloping into the frame with paper-coloured crater lips.
export const Field = ({ frame }: { frame: number }) => {
  const sweep = Math.sin(frame * 0.012) * 6;
  return (
    <g>
      {/* searchlight beams: long khaki wedges, slowly sweeping */}
      {[[300, -26], [1500, 18], [2350, -12]].map(([x, a], i) => (
        <path key={i} transform={`translate(${x},${GROUND - 40}) rotate(${a + sweep * (i % 2 ? -1 : 1)})`} d="M-14 0 L-170 -1500 L170 -1500 L14 0 Z" fill={INK.khakiLt} opacity={0.45} />
      ))}
      <circle cx={1250} cy={GROUND - 170} r={260} fill={INK.brick} />
      {/* far ridge */}
      <path d={`M-500 ${GROUND - 120} ${Array.from({ length: 18 }, (_, i) => `L${-500 + i * 220} ${GROUND - 70 - rnd(i + 3) * 90}`).join(" ")} L3400 ${GROUND - 60} L3400 ${GROUND + 40} L-500 ${GROUND + 40} Z`} fill={INK.paper2} />
      <path d={`M-500 ${GROUND - 60} ${Array.from({ length: 18 }, (_, i) => `L${-500 + i * 220} ${GROUND - 70 - rnd(i + 3) * 90}`).join(" ")} L3400 ${GROUND - 60} L3400 ${GROUND + 40} L-500 ${GROUND + 40} Z`} fill="url(#hatchK)" opacity={0.7} />
      {/* mud: black, rising toward the defenders on the right (the strong diagonal of the poster) */}
      <path d={`M-500 ${GROUND + 30} L900 ${GROUND - 4} L1900 ${GROUND - 22} L3400 ${GROUND - 50} L3400 3000 L-500 3000 Z`} fill={INK.black} />
      {[[300, 60, 140], [760, 150, 200], [1180, 40, 120], [1350, 230, 260], [1700, 110, 170], [2250, 70, 150], [620, 330, 230]].map(([x, dy, r], i) => (
        <g key={i}>
          <path d={`M${x - r} ${GROUND + dy} Q${x} ${GROUND + dy - r * 0.32} ${x + r} ${GROUND + dy}`} stroke={INK.khaki} strokeWidth={10} fill="none" />
          <path d={`M${x - r * 0.8} ${GROUND + dy + 6} Q${x} ${GROUND + dy + r * 0.25} ${x + r * 0.8} ${GROUND + dy + 6}`} stroke={INK.paper} strokeWidth={5} fill="none" opacity={0.6} />
        </g>
      ))}
    </g>
  );
};

// Shell burst on the ground at world x; age = frames since impact (draws 0–70). A brick starburst, a black fan of
// dirt spikes thrown on a diagonal, and flat khaki smoke rising.
export const Burst = ({ x, size, age }: { x: number; size: number; age: number }) => {
  if (age < 0 || age > 70) return null;
  const k = age / 70;
  const fire = interpolate(age, [0, 3, 18], [0.4, 1, 0], clamp);
  const n = 11;
  const star = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2 + rnd(x) * 2;
    const r = (i % 2 ? 60 : 150 + rnd(i + x) * 90) * (0.6 + fire * 0.6);
    return `${Math.cos(a) * r},${-70 + Math.sin(a) * r * 0.85}`;
  }).join(" ");
  return (
    <g transform={`translate(${x},${GROUND}) scale(${size})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={`s${i}`} cx={(rnd(i + x) - 0.5) * 120 + k * 60} cy={-90 - age * (2 + i * 0.5)} rx={60 + age * 1.2 + i * 10} ry={40 + age * 0.8} fill={i % 2 ? INK.paper2 : INK.khakiLt} opacity={0.95 * (1 - k * k)} />
      ))}
      {fire > 0 && <polygon points={star} fill={INK.brick} />}
      {fire > 0.5 && <circle cx={0} cy={-70} r={46 * fire} fill={INK.paper} />}
      {age < 40 && Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI / 2 + (i - 4) * 0.2 + 0.25;
        const len = (120 + rnd(i * 5 + x) * 220) * interpolate(age, [0, 8, 40], [0.3, 1, 0.6], clamp);
        const wdt = 18 + rnd(i) * 14;
        return <path key={`d${i}`} d={`M${-wdt / 2} 0 L${Math.cos(a) * len} ${Math.sin(a) * len} L${wdt / 2} 0 Z`} fill={INK.black} opacity={1 - age / 40} />;
      })}
    </g>
  );
};

// Barbed wire: black crossed stakes, a sharp zigzag strand.
export const Wire = ({ x0, x1 }: { x0: number; x1: number }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 70) + 1 }, (_, i) => {
      const x = x0 + i * 70;
      return <path key={i} d={`M${x - 18} ${GROUND + 4} L${x + 18} ${GROUND - 70} M${x + 18} ${GROUND + 4} L${x - 18} ${GROUND - 70}`} stroke={INK.black} strokeWidth={8} />;
    })}
    {[0, 1].map((r) => (
      <path key={r} d={`M${x0} ${GROUND - 40 - r * 22} ` + Array.from({ length: Math.floor((x1 - x0) / 18) }, (_, i) => `l9 ${i % 2 ? -12 : 12} l9 ${i % 2 ? 12 : -12}`).join(" ")} stroke={INK.black} strokeWidth={3.5} fill="none" />
    ))}
  </g>
);

// Trench parapet: staggered khaki sandbags with a black shadow band and hatching.
export const Sandbags = ({ x, n = 9, rows = 3 }: { x: number; n?: number; rows?: number }) => (
  <g>
    <rect x={x - 40} y={GROUND - 30} width={n * 62 + 80} height={140} fill={INK.black} />
    {Array.from({ length: rows }, (_, r) =>
      Array.from({ length: n - r }, (_, i) => (
        <rect key={`${r}-${i}`} x={x + i * 62 + r * 31} y={GROUND - 34 - r * 30} width={58} height={30} rx={14} fill={r % 2 ? INK.khakiLt : INK.khaki} />
      )),
    )}
    <rect x={x} y={GROUND - 64} width={n * 62} height={30} fill="url(#hatch)" opacity={0.35} />
  </g>
);

// Rhomboid tank: one black mass, paper-coloured track teeth that run, a brick muzzle flash on gun frames.
export const Tank = ({ x, frame, gunAt }: { x: number; frame: number; gunAt: number[] }) => {
  const d = since(gunAt, frame);
  return (
    <g transform={`translate(${x},${GROUND - 8})`}>
      <path d="M-200 -10 L-150 -150 L150 -150 L230 -10 L160 30 L-140 30 Z" fill={INK.black} />
      <path d="M-120 -150 L-90 -200 L40 -200 L70 -150 Z" fill={INK.black} />
      <rect x={60} y={-190} width={150} height={20} fill={INK.black} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-170 + ((i * 34 + frame * 4) % 400)} y={8} width={16} height={8} fill={INK.paper} opacity={0.75} />)}
      <path d="M-120 -110 L140 -110" stroke={INK.khaki} strokeWidth={8} />
      {d < 5 && <polygon points="210,-180 320,-230 290,-180 340,-150 250,-165" fill={INK.brick} />}
      {/* exhaust */}
      {[0, 1, 2].map((i) => <ellipse key={i} cx={-190 - i * 50 - (frame % 20) * 2} cy={-170 - i * 30} rx={28 + i * 10} ry={18 + i * 6} fill={INK.khakiLt} opacity={0.8 - i * 0.2} />)}
    </g>
  );
};

// Biplane as a black silhouette with a paper roundel or cross; prop shown as a brick blur disc.
export const Plane = ({ x, y, flip, frame, mark }: { x: number; y: number; flip: boolean; frame: number; mark: "cross" | "roundel" }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1) rotate(${Math.sin(frame * 0.07) * 3})`}>
    <rect x={-70} y={-48} width={150} height={12} fill={INK.black} />
    <rect x={-60} y={2} width={140} height={12} fill={INK.black} />
    <path d="M-110 -18 L80 -26 L100 -10 L80 6 L-110 -4 Z" fill={INK.black} />
    <path d="M-110 -18 L-130 -44 L-100 -20 Z" fill={INK.black} />
    {[-40, 40].map((sx) => <line key={sx} x1={sx} y1={-40} x2={sx} y2={6} stroke={INK.black} strokeWidth={4} />)}
    <ellipse cx={104} cy={-10} rx={6} ry={frame % 2 ? 34 : 26} fill={INK.brick} />
    {mark === "roundel" ? <circle cx={-10} cy={-42} r={9} fill={INK.paper} /> : <path d="M-18 -42 h16 M-10 -50 v16" stroke={INK.paper} strokeWidth={5} />}
  </g>
);

// Shattered stump.
export const Stump = ({ x, h, lean }: { x: number; h: number; lean: number }) => (
  <g transform={`translate(${x},${GROUND + 10}) rotate(${lean})`}>
    <path d={`M-18 0 L-12 ${-h} L-2 ${-h + 30} L6 ${-h - 20} L14 ${-h + 40} L20 0 Z`} fill={INK.black} />
    <path d={`M0 ${-h * 0.55} L46 ${-h * 0.75} L4 ${-h * 0.62} Z`} fill={INK.black} />
  </g>
);

// Infantryman, flat silhouette: helmet, greatcoat, rifle with a long bayonet held on the diagonal.
// pose "run" (two drawings, legs swapped), "aim" (kneeling behind the parapet, rifle level), "fall"-free by design.
export const Soldier = ({ x, y, s, flip = false, pose = "run", phase = 0, frame, fill, helmet, flash = 0 }: { x: number; y: number; s: number; flip?: boolean; pose?: "run" | "aim" | "stand"; phase?: number; frame: number; fill: string; helmet: string; flash?: number }) => {
  const step = Math.floor(frame / 6 + phase) % 2;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {pose === "run" && (
        <>
          <path d={step ? "M-6 -60 L-34 -4 L-22 0 L4 -50 Z" : "M-6 -60 L-12 0 L2 0 L6 -54 Z"} fill={fill} />
          <path d={step ? "M4 -60 L28 -2 L40 -6 L16 -60 Z" : "M2 -62 L40 -24 L32 -14 L-2 -50 Z"} fill={fill} />
          <path d="M-14 -62 L-2 -128 L22 -124 L22 -60 Z" fill={fill} />
          <path d="M-4 -124 L20 -120 L26 -106 L-8 -110 Z" fill={helmet} />
          <path d="M-10 -138 A20 17 0 0 1 30 -138 Z M-20 -140 L40 -140 L40 -134 L-20 -134 Z" fill={helmet} />
          <circle cx={10} cy={-132} r={10} fill={fill} />
          <path d="M-30 -60 L74 -148 L80 -142 L-24 -54 Z" fill={INK.black} />
          <path d="M74 -148 L104 -174 L78 -142 Z" fill={INK.black} />
        </>
      )}
      {pose === "aim" && (
        <>
          <path d="M-34 0 L-26 -54 L-2 -78 L28 -74 L40 -50 L36 0 Z" fill={fill} />
          <path d="M26 -74 L84 -66 L84 -56 L30 -58 Z" fill={fill} />
          <circle cx={20} cy={-88} r={12} fill={fill} />
          <path d="M0 -92 A20 15 0 0 1 40 -92 Z M-6 -94 L46 -94 L46 -88 L-6 -88 Z" fill={helmet} />
          <rect x={0} y={-74} width={150} height={9} fill={INK.black} />
          <path d="M150 -74 L190 -70 L150 -66 Z" fill={INK.black} />
          {flash > 0 && <polygon points="190,-70 240,-96 226,-70 250,-48 210,-62" fill={INK.brick} opacity={flash} />}
        </>
      )}
      {pose === "stand" && (
        <>
          <path d="M-14 0 L-12 -124 L22 -124 L24 0 Z" fill={fill} />
          <path d="M-10 -138 A20 17 0 0 1 30 -138 Z M-20 -140 L40 -140 L40 -134 L-20 -134 Z" fill={helmet} />
          <rect x={30} y={-200} width={7} height={200} fill={INK.black} />
        </>
      )}
    </g>
  );
};
