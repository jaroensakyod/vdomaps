import type { ReactNode } from "react";

// Nang yai (Thai shadow-puppet theatre) pieces: carved leather silhouettes (SKIN) with light through perforations
// (HOLE), panels on poles, performers in front of the cloth. Coordinates are for a 1080-wide frame; figures stand
// with feet at y and scale s. `t` is a phase (frame × ~0.22) for walk and sway cycles.
export const SKIN = "#0e0805"; // leather silhouette
export const HOLE = "#ffe2a8"; // light through perforations
export const CLOTH = { top: 230, bottom: 1880 }; // the lit screen inside a 1080×1920 frame

// Perforated dot pattern inside a box (the carving that lets light through).
export const Holes = ({ x, y, w, h, step = 9, r = 1.7 }: { x: number; y: number; w: number; h: number; step?: number; r?: number }) => (
  <g>
    {Array.from({ length: Math.floor(h / step) }, (_, j) =>
      Array.from({ length: Math.floor(w / step) }, (_, i) => ((i + j) % 2 === 0 ? <circle key={`${i}-${j}`} cx={x + i * step + step / 2} cy={y + j * step + step / 2} r={r} fill={HOLE} opacity={0.85} /> : null)),
    )}
  </g>
);

// Kanok flame edge: a row of carved flame tips along a baseline.
export const Kanok = ({ x, y, w, n = 10, h = 16, flip = false }: { x: number; y: number; w: number; n?: number; h?: number; flip?: boolean }) => (
  <path
    d={`M${x} ${y} ` + Array.from({ length: n }, (_, i) => { const a = x + (i * w) / n; const b = a + w / n; return `Q${a + w / n * 0.2} ${y - (flip ? -h : h)} ${(a + b) / 2} ${y - (flip ? -h * 1.3 : h * 1.3)} Q${a + w / n * 0.8} ${y - (flip ? -h * 0.4 : h * 0.4)} ${b} ${y}`; }).join(" ") + " Z"}
    fill={SKIN}
  />
);

// The lit cloth screen: fire-lit radial gradient, weave lines, grain, red top/bottom borders, wooden posts.
// Put <ClothDefs /> inside the <svg> once. `light` 0–1 (fade in × flicker).
export const ClothDefs = () => (
  <defs>
    <radialGradient id="ny-cloth" cx="0.5" cy="0.55" r="0.75">
      <stop offset="0" stopColor="#fff3cf" />
      <stop offset="0.5" stopColor="#f2b25a" />
      <stop offset="1" stopColor="#5a2a0c" />
    </radialGradient>
    <filter id="ny-far"><feGaussianBlur stdDeviation={5} /></filter>
    <filter id="ny-mid"><feGaussianBlur stdDeviation={1.6} /></filter>
    <filter id="ny-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.18 0" /></filter>
  </defs>
);
export const Cloth = ({ light, w = 1080 }: { light: number; w?: number }) => (
  <g>
    <rect x={30} y={CLOTH.top} width={w - 60} height={CLOTH.bottom - CLOTH.top} fill="url(#ny-cloth)" opacity={light} />
    {Array.from({ length: 40 }, (_, i) => <line key={i} x1={30} y1={CLOTH.top + i * 32} x2={w - 30} y2={CLOTH.top + i * 32} stroke="#8a5a28" strokeWidth={0.7} opacity={0.18} />)}
    <rect x={30} y={CLOTH.top} width={w - 60} height={CLOTH.bottom - CLOTH.top} filter="url(#ny-grain)" />
    <rect x={30} y={CLOTH.top - 26} width={w - 60} height={30} fill="#8a1a14" />
    <rect x={30} y={CLOTH.bottom - 4} width={w - 60} height={30} fill="#8a1a14" />
    <rect x={14} y={CLOTH.top - 40} width={22} height={CLOTH.bottom - CLOTH.top + 80} fill="#3a2410" />
    <rect x={w - 36} y={CLOTH.top - 40} width={22} height={CLOTH.bottom - CLOTH.top + 80} fill="#3a2410" />
  </g>
);

// Puppets farther from the cloth are softer: wrap them in <Far> (blurred, dimmed) or <Mid>.
export const Far = ({ children, opacity = 0.6 }: { children: ReactNode; opacity?: number }) => <g filter="url(#ny-far)" opacity={opacity}>{children}</g>;
export const Mid = ({ children, opacity = 1 }: { children: ReactNode; opacity?: number }) => <g filter="url(#ny-mid)" opacity={opacity}>{children}</g>;

// A big carved panel: figures inside a carved ground band with kanok edge, two poles down to the performer.
export const Panel = ({ x, y, w, children, poles = true }: { x: number; y: number; w: number; children: ReactNode; poles?: boolean }) => (
  <g>
    {poles && (
      <g stroke="#2a1608" strokeWidth={5}>
        <line x1={x + w * 0.3} y1={y + 20} x2={x + w * 0.46} y2={y + 250} />
        <line x1={x + w * 0.7} y1={y + 20} x2={x + w * 0.54} y2={y + 250} />
      </g>
    )}
    <rect x={x} y={y} width={w} height={26} fill={SKIN} />
    <Holes x={x + 6} y={y + 4} w={w - 12} h={18} step={10} r={2} />
    <Kanok x={x} y={y + 26} w={w} n={Math.round(w / 34)} h={-12} />
    {children}
  </g>
);

// A performer in front of the screen (sharp silhouette, never blurred), dancing a step, arms up on the poles.
export const Performer = ({ x, t, ground = 1915 }: { x: number; t: number; ground?: number }) => {
  const step = Math.sin(t);
  return (
    <g transform={`translate(${x},${ground - Math.abs(step) * 10})`} fill="#050302">
      <path d={`M-14 -150 L-22 ${-60} L${-30 + step * 16} 0 L${-16 + step * 16} 0 L-6 -70 L6 -70 L${16 - step * 16} 0 L${30 - step * 16} 0 L22 -60 L14 -150 Z`} />
      <ellipse cx={0} cy={-168} rx={16} ry={18} />
      <path d={`M-14 -146 L-46 -230 L-36 -234 L-4 -150 Z M14 -146 L46 -230 L36 -234 L4 -150 Z`} />
      <path d="M-20 -110 L20 -110 L26 -80 L-26 -80 Z" fill="#3a0d0a" />
    </g>
  );
};

// Carved burst (explosion, magic, fire): kanok flame tongues opening up. k = 0→1 over its life.
export const Burst = ({ x, y, k }: { x: number; y: number; k: number }) => {
  if (k <= 0 || k >= 1) return null;
  const open = Math.sin(k * Math.PI);
  return (
    <g transform={`translate(${x},${y}) scale(${0.4 + open})`} opacity={Math.min(1, (1 - k) * 2.5)}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -90 + (i - 4) * 22;
        return <path key={i} d="M-14 0 Q-20 -60 0 -120 Q6 -80 22 -96 Q14 -50 14 0 Z" fill={SKIN} transform={`rotate(${a + 90})`} />;
      })}
      <circle r={30} fill={SKIN} />
      <Holes x={-20} y={-20} w={40} h={40} step={8} r={2} />
    </g>
  );
};

// WW1 infantryman (brodie helmet, pack, rifle with bayonet), legs swing, carved tunic.
export const Tommy = ({ x, y, s, t, aim = false }: { x: number; y: number; s: number; t: number; aim?: boolean }) => {
  const a = Math.sin(t) * 26;
  const leg = (dx: number, ang: number) => <path d={`M${dx} -58 L${dx + Math.sin((ang * Math.PI) / 180) * 30} ${-58 + Math.cos((ang * Math.PI) / 180) * 30} L${dx + Math.sin((ang * Math.PI) / 180) * 30 + 6} -2 L${dx + Math.sin((ang * Math.PI) / 180) * 30 - 2} 0 Z`} stroke={SKIN} strokeWidth={9} strokeLinejoin="round" fill={SKIN} />;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {leg(-4, a)}
      {leg(4, -a)}
      <path d="M-14 -104 Q-18 -80 -12 -56 L12 -56 Q18 -80 14 -104 Q0 -110 -14 -104 Z" fill={SKIN} />
      <path d="M-26 -100 L-12 -102 L-12 -66 L-24 -70 Z" fill={SKIN} />
      <Holes x={-10} y={-98} w={20} h={36} step={7} r={1.5} />
      <circle cx={0} cy={-116} r={9} fill={SKIN} />
      <path d="M-20 -118 Q0 -136 20 -118 Z" fill={SKIN} />
      <g transform={`rotate(${aim ? -6 : -22 + Math.sin(t) * 4},6,-96)`}>
        <path d="M4 -98 L36 -92 L36 -86 L4 -90 Z" fill={SKIN} />
        <path d="M-10 -96 L86 -86 L86 -82 L-10 -91 Z" fill={SKIN} />
        <path d="M86 -86 L112 -84 L86 -81 Z" fill={SKIN} />
      </g>
    </g>
  );
};

// Mark I tank (rhomboid) with carved track wheels and a side gun.
export const Tank = ({ x, y, s, t }: { x: number; y: number; s: number; t: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-120 0 L-150 -60 L-100 -96 L110 -96 L150 -60 L120 0 Z" fill={SKIN} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-105 + i * 30} cy={-34} r={9} fill={HOLE} opacity={0.8} transform={`rotate(${t * 40},${-105 + i * 30},-34)`} />)}
    <Holes x={-90} y={-88} w={180} h={30} step={12} r={2.2} />
    <path d="M-30 -96 L30 -96 L24 -122 L-24 -122 Z" fill={SKIN} />
    <path d="M-24 -110 L-90 -116 L-90 -110 L-24 -104 Z" fill={SKIN} />
  </g>
);

// Biplane on a pole.
export const Plane = ({ x, y, s, t }: { x: number; y: number; s: number; t: number }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t * 0.8) * 4})`}>
    <path d="M-70 -4 L60 -10 L74 0 L60 10 L-70 4 Z" fill={SKIN} />
    <rect x={-40} y={-34} width={80} height={9} fill={SKIN} />
    <rect x={-44} y={18} width={88} height={9} fill={SKIN} />
    {[-30, 30].map((sx) => <line key={sx} x1={sx} y1={-26} x2={sx} y2={20} stroke={SKIN} strokeWidth={3} />)}
    <path d="M-70 -4 L-90 -26 L-80 0 L-90 22 L-70 4 Z" fill={SKIN} />
    <ellipse cx={76} cy={0} rx={4} ry={24 * Math.abs(Math.sin(t * 9))} fill={SKIN} />
    <Holes x={-60} y={-31} w={110} h={6} step={8} r={1.5} />
    <circle cx={0} cy={0} r={5} fill={HOLE} />
    <line x1={0} y1={0} x2={30} y2={400} stroke="#2a1608" strokeWidth={4} />
  </g>
);

// Field gun on a panel; fires (recoil + muzzle flash) every `every` frames.
export const FieldGun = ({ x, y, s, frame, every = 46 }: { x: number; y: number; s: number; frame: number; every?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${frame % every < 6 ? 4 : 0})`}>
    <path d="M-90 0 L-40 -50 L60 -50 L60 0 Z" fill={SKIN} />
    <circle cx={-50} cy={-8} r={34} fill={SKIN} />
    <Holes x={-70} y={-28} w={40} h={40} step={9} r={2.2} />
    <path d="M30 -46 L170 -130 L176 -120 L36 -36 Z" fill={SKIN} />
    {frame % every < 5 && <circle cx={180} cy={-128} r={26} fill={HOLE} />}
  </g>
);
