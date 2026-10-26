import type { ReactNode } from "react";

// N34 kit: radiograph films clipped on a wall light box. 1080×1920 SVG. Films are dark blue-grey where the beam
// passed freely; dense material glows (bones, metal, thick walls). Everything is drawn: `Radio` softens any
// shapes into radiograph density (blur halo + sharper core), `Film` gives the sheet its base, grain, edge fog,
// corner notch and lead markers, `Grease` is the radiologist's wax-pencil mark drawn on in time.

export const X = {
  wall: "#0a0f15",
  housing: "#c3c6c2",
  bezel: "#2a3036",
  panel: "#eef5fb",
  film: "#13212c",
  soft: "#5e7d94", // low density (shell, soft tissue)
  bone: "#e6f2ff", // high density
  grease: "#ffb02e",
  text: "#e6f2ff",
};
const cl = (v: number) => Math.max(0, Math.min(1, v));
export const rnd = (seed: number) => {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

export const XRayDefs = () => (
  <defs>
    <filter id="xr-halo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={9} /></filter>
    <filter id="xr-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={2.2} /></filter>
    <filter id="xr-wide" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={22} /></filter>
    <filter id="xr-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
      <feColorMatrix values="0 0 0 0 0.8  0 0 0 0 0.9  0 0 0 0 1  0 0 0 1.6 -0.62" />
    </filter>
    <filter id="xr-mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={3} seed={9} />
      <feColorMatrix values="0 0 0 0 0.02  0 0 0 0 0.04  0 0 0 0 0.06  0 0 0 1.3 -0.35" />
    </filter>
    {/* wax pencil: slightly broken, waxy edge */}
    <filter id="xr-wax" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={1} seed={3} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} />
    </filter>
    <linearGradient id="xr-tubes" x1="0" y1="0" x2="1" y2="0">
      {[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].map((o, i) => <stop key={o} offset={o} stopColor={i % 2 ? "#ffffff" : "#d9e6f1"} />)}
    </linearGradient>
    <radialGradient id="xr-filmfog" cx="0.5" cy="0.5" r="0.72">
      <stop offset="0.6" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.55} />
    </radialGradient>
    <radialGradient id="xr-room" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0" stopColor="#1a2a38" />
      <stop offset="1" stopColor={X.wall} />
    </radialGradient>
  </defs>
);

// The wall light box. `on` 0–1 (use `tubeFlicker` while it starts). Children go on the panel.
export const LightBox = ({ x, y, w, h, on, children }: { x: number; y: number; w: number; h: number; on: number; children?: ReactNode }) => (
  <g>
    {/* spill of light on the wall */}
    <rect x={x - 60} y={y - 60} width={w + 120} height={h + 160} fill="#bcd8f0" opacity={0.16 * on} filter="url(#xr-wide)" />
    <rect x={x - 30} y={y - 30} width={w + 60} height={h + 110} rx={18} fill={X.housing} />
    <rect x={x - 30} y={y - 30} width={w + 60} height={h + 110} rx={18} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={6} fill={X.bezel} />
    <rect x={x} y={y} width={w} height={h} fill="#3a434c" />
    <rect x={x} y={y} width={w} height={h} fill="url(#xr-tubes)" opacity={on} />
    {children}
    {/* control strip: switch + pilot light */}
    <rect x={x + w - 170} y={y + h + 26} width={60} height={34} rx={6} fill="#8d918e" />
    <rect x={x + w - 160} y={y + h + 30} width={22} height={26} rx={4} fill="#e9ebe7" transform={on > 0.5 ? "" : `translate(18 0)`} />
    <circle cx={x + w - 70} cy={y + h + 43} r={9} fill={on > 0.5 ? "#7dff9a" : "#2f4a36"} />
    {on > 0.5 && <circle cx={x + w - 70} cy={y + h + 43} r={18} fill="#7dff9a" opacity={0.4} filter="url(#xr-halo)" />}
    <text x={x + 10} y={y + h + 54} fontSize={22} fill="#4a4f52" fontFamily="monospace" letterSpacing={3}>VIEWER · 2</text>
  </g>
);

// Fluorescent start-up: flickers a few times then holds. Returns 0–1 for frame f relative to switch-on.
export const tubeFlicker = (f: number) => {
  if (f < 0) return 0;
  if (f > 30) return 1;
  const pattern = [0, 1, 1, 0, 0, 0.6, 0, 1, 1, 1, 0, 0, 0, 1, 0.4, 1, 1, 1, 0, 1];
  return pattern[Math.floor(f / 1.5)] ?? 1;
};

// One film sheet. Local coordinates: the image is drawn in (0,0)-(w,h). `lit` = how much light comes through.
export const Film = ({ x, y, w, h, rot = 0, lit, id, label, side = "R", children }: { x: number; y: number; w: number; h: number; rot?: number; lit: number; id: string; label: string; side?: string; children?: ReactNode }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot} ${w / 2} 0)`}>
    <defs>
      <clipPath id={`xr-clip-${id}`}><path d={`M10 0 H${w - 10} Q${w} 0 ${w} 10 V${h - 10} Q${w} ${h} ${w - 10} ${h} H10 Q0 ${h} 0 ${h - 10} V40 L-0 30 L14 22 L0 14 V10 Q0 0 10 0 Z`} /></clipPath>
    </defs>
    <rect x={6} y={10} width={w} height={h} fill="#000" opacity={0.35} filter="url(#xr-soft)" />
    <g clipPath={`url(#xr-clip-${id})`}>
      <rect width={w} height={h} fill={X.film} />
      <rect width={w} height={h} fill="#30495c" opacity={0.35 * lit} />
      <g opacity={0.25 + 0.75 * lit}>{children}</g>
      <rect width={w} height={h} filter="url(#xr-mottle)" />
      <rect width={w} height={h} filter="url(#xr-grain)" opacity={0.35} />
      <rect width={w} height={h} fill="url(#xr-filmfog)" />
      {/* lead marker and imprint */}
      <g transform={`translate(${w - 92} 40)`}>
        <rect width={56} height={66} rx={6} fill="#dbe9f6" opacity={0.85 * (0.3 + 0.7 * lit)} />
        <text x={28} y={52} textAnchor="middle" fontSize={54} fontWeight={700} fill={X.film} fontFamily="monospace">{side}</text>
      </g>
      <text x={34} y={h - 34} fontSize={24} fill={X.bone} opacity={0.7 * lit} fontFamily="monospace" letterSpacing={2}>{label}</text>
    </g>
  </g>
);

// Radiograph density for any shapes: a wide halo (scatter), the shapes softened, and an optional sharp core.
export const Radio = ({ children, core = true, strength = 1 }: { children: ReactNode; core?: boolean; strength?: number }) => (
  <g>
    <g filter="url(#xr-halo)" opacity={0.55 * strength}>{children}</g>
    <g filter="url(#xr-soft)" opacity={0.9 * strength}>{children}</g>
    {core && <g opacity={0.35 * strength}>{children}</g>}
  </g>
);

// Seated statue shell (low density lacquer/clay wall), centred on (0,0), about 820 tall.
export const StatueShell = ({ k }: { k: number }) => {
  const d = "M0 -470 C22 -470 30 -452 26 -436 C70 -432 96 -396 96 -340 C96 -300 86 -270 66 -250 L60 -226 C150 -214 210 -190 226 -130 C240 -70 236 10 250 70 C300 90 380 120 398 180 C410 240 380 290 300 300 L-300 300 C-380 290 -410 240 -398 180 C-380 120 -300 90 -250 70 C-236 10 -240 -70 -226 -130 C-210 -190 -150 -214 -60 -226 L-66 -250 C-86 -270 -96 -300 -96 -340 C-96 -396 -70 -432 -26 -436 C-30 -452 -22 -470 0 -470 Z";
  return (
    <g opacity={k}>
      <path d={d} fill={X.soft} opacity={0.32} filter="url(#xr-soft)" />
      <Radio core={false}>
        <path d={d} fill="none" stroke="#a9c4d8" strokeWidth={20} />
      </Radio>
      {/* plinth / cushion */}
      <Radio core={false} strength={0.8}>
        <path d="M-420 300 L420 300 L440 390 L-440 390 Z" fill="#8aa6bb" opacity={0.6} />
        <path d="M-440 390 L440 390" stroke="#c7dbea" strokeWidth={10} />
      </Radio>
      {/* ear lobes and curls of the shell */}
      <g opacity={0.5}>
        <path d="M-100 -360 q-24 40 -6 96 M100 -360 q24 40 6 96" stroke="#a9c4d8" strokeWidth={10} fill="none" filter="url(#xr-soft)" />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-70 + (i % 7) * 23} cy={-410 + Math.floor(i / 7) * 22} r={8} fill="none" stroke="#a9c4d8" strokeWidth={4} filter="url(#xr-soft)" />)}
      </g>
    </g>
  );
};

// The seated skeleton inside (legs crossed, hands in the lap), same coordinates as StatueShell. `k` 0–1 = how
// visible (the "window" being opened up on the light box).
export const Skeleton = ({ k }: { k: number }) => {
  const B = X.bone;
  const ribs = Array.from({ length: 9 }, (_, i) => {
    const y = -186 + i * 24, wd = 100 + Math.sin((i / 8) * Math.PI) * 34 - i * 2;
    return `M-8 ${y} C${-wd * 0.7} ${y - 26} ${-wd} ${y + 6} ${-wd + 12} ${y + 40} M8 ${y} C${wd * 0.7} ${y - 26} ${wd} ${y + 6} ${wd - 12} ${y + 40}`;
  });
  return (
    <g opacity={k}>
      <Radio>
        {/* skull */}
        <path d="M0 -412 C52 -412 76 -376 74 -332 C72 -300 60 -282 50 -270 L46 -246 C30 -232 -30 -232 -46 -246 L-50 -270 C-60 -282 -72 -300 -74 -332 C-76 -376 -52 -412 0 -412 Z" fill={B} opacity={0.75} />
        {/* spine */}
        {Array.from({ length: 17 }, (_, i) => <rect key={i} x={-15 + Math.sin(i * 0.3) * 2} y={-232 + i * 18.5} width={30} height={13} rx={5} fill={B} />)}
        {/* clavicles, ribs */}
        <path d="M-12 -206 C-60 -214 -110 -206 -150 -196 M12 -206 C60 -214 110 -206 150 -196" stroke={B} strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d={ribs.join(" ")} stroke={B} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* arms to the lap */}
        <path d="M-150 -192 L-182 -40 L-70 104 M150 -192 L182 -40 L70 104" stroke={B} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-170 -40 L-58 96 M170 -40 L58 96" stroke={B} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-48 + i * 10.5} cy={112 + Math.sin(i) * 4} r={5} fill={B} />)}
        {/* pelvis */}
        <path d="M-20 70 C-60 50 -110 60 -116 96 C-110 130 -60 140 -30 128 Z M20 70 C60 50 110 60 116 96 C110 130 60 140 30 128 Z" fill={B} opacity={0.8} />
        {/* crossed legs */}
        <path d="M-90 120 L-300 210 L60 252 M90 120 L300 210 L-60 252" stroke={B} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-300 210 L60 238 M300 210 L-60 238" stroke={B} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
        <circle cx={-300} cy={210} r={18} fill={B} /><circle cx={300} cy={210} r={18} fill={B} />
      </Radio>
      {/* skull holes on top (no core so they stay dark-edged) */}
      <g fill={X.film} filter="url(#xr-soft)">
        <path d="M-52 -346 Q-30 -360 -8 -344 Q-6 -322 -22 -314 Q-46 -314 -52 -346 Z" />
        <path d="M52 -346 Q30 -360 8 -344 Q6 -322 22 -314 Q46 -314 52 -346 Z" />
        <path d="M0 -308 L-9 -284 Q0 -280 9 -284 Z" />
        <ellipse cx={0} cy={-150} rx={14} ry={60} opacity={0.0} />
      </g>
      <g fill={B} opacity={0.9}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-30 + i * 7.6} y={-262} width={5} height={10} rx={2} />)}</g>
      {/* the empty belly: darker pocket with faint scraps */}
      <ellipse cx={0} cy={0} rx={70} ry={52} fill={X.film} opacity={0.5} filter="url(#xr-halo)" />
      <Scraps x={-50} y={-28} w={100} h={60} n={7} seed={4} scale={0.5} />
    </g>
  );
};

// Paper scraps: thin bright rectangles with rows of character strokes (ink with metal pigment shows faintly).
export const Scraps = ({ x, y, w, h, n, seed, scale = 1 }: { x: number; y: number; w: number; h: number; n: number; seed: number; scale?: number }) => {
  const r = rnd(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x + r() * w, py = y + r() * h, a = (r() - 0.5) * 70, sw = (60 + r() * 50) * scale, sh = (40 + r() * 30) * scale;
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${a})`}>
            <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} fill="#9fbad0" opacity={0.45} filter="url(#xr-soft)" />
            {Array.from({ length: 4 }, (_, j) => Array.from({ length: 5 }, (_, q) => <rect key={`${j}-${q}`} x={-sw / 2 + 6 * scale + q * (sw - 12 * scale) / 5} y={-sh / 2 + 6 * scale + j * (sh - 10 * scale) / 4} width={7 * scale} height={6 * scale} fill={X.bone} opacity={0.5 + r() * 0.4} />))}
          </g>
        );
      })}
    </g>
  );
};

// Wax pencil mark drawn on over time: a wobbly ring or an arrow, plus a handwritten note.
export const Grease = ({ p, ring, arrow, note, nx, ny, font, size = 38 }: { p: number; ring?: [number, number, number, number]; arrow?: [number, number, number, number]; note?: string; nx?: number; ny?: number; font: string; size?: number }) => {
  const parts: string[] = [];
  if (ring) {
    const [cx, cy, rx, ry] = ring;
    const pts = Array.from({ length: 34 }, (_, i) => {
      const a = -1.9 + (i / 30) * Math.PI * 2.15, wob = 1 + Math.sin(i * 1.7) * 0.04;
      return `${cx + Math.cos(a) * rx * wob} ${cy + Math.sin(a) * ry * wob}`;
    });
    parts.push(`M${pts[0]} L${pts.slice(1).join(" L")}`);
  }
  if (arrow) {
    const [x1, y1, x2, y2] = arrow;
    const a = Math.atan2(y2 - y1, x2 - x1);
    parts.push(`M${x1} ${y1} Q${(x1 + x2) / 2 + 20} ${(y1 + y2) / 2 - 20} ${x2} ${y2} M${x2 - Math.cos(a - 0.5) * 30} ${y2 - Math.sin(a - 0.5) * 30} L${x2} ${y2} L${x2 - Math.cos(a + 0.5) * 30} ${y2 - Math.sin(a + 0.5) * 30}`);
  }
  return (
    <g filter="url(#xr-wax)">
      {parts.map((d, i) => <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cl(p * 1.6 - i * 0.3)} stroke={X.grease} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      {note && <text x={nx} y={ny} fontFamily={font} fontSize={size} fill={X.grease} opacity={cl(p * 3 - 1.6)}>{note}</text>}
    </g>
  );
};

// Spring metal clip at the top of the light box.
export const Clip = ({ x, y, snap }: { x: number; y: number; snap: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${(1 - snap) * -14})`}>
    <rect x={-34} y={-30} width={68} height={52} rx={8} fill="#9aa2a8" />
    <rect x={-34} y={-30} width={68} height={14} rx={6} fill="#d6dde2" />
    <rect x={-26} y={8} width={52} height={30} rx={4} fill="#6e767c" />
    <circle cx={0} cy={-4} r={6} fill="#4b5257" />
  </g>
);
