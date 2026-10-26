import type { ReactNode } from "react";

// N33 kit: a hand-painted cinema billboard on a steel scaffold. Everything is SVG in a 1080×1920 frame.
// The painting is revealed by brush strokes (`PaintIn`): a mask of thick zig-zag strokes, each drawn with a dash,
// with ragged bristle edges from a displacement filter. Faces are built from flat oil-paint planes: warm light
// side, purple shadow side, a cyan rim light and white-yellow highlight dabs (`Face`).

export const C = {
  sky: ["#1d2f4f", "#4a4470", "#d9785a"], // dusk top → horizon
  night: ["#060a18", "#121a36", "#2a2346"],
  prime: "#efe6d2", // primed board
  skin: "#f2905a",
  skinLit: "#ffd27a",
  shadow: "#2e5f8a",
  rim: "#58e2e6",
  hair: "#0f1834",
  red: "#d7262b",
  yellow: "#ffd23a",
  steel: "#2a2c34",
  bulb: "#fff0a8",
};

// Seeded random, so strokes are the same on every frame.
export const rnd = (seed: number) => {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};
const cl = (v: number) => Math.max(0, Math.min(1, v));

export const BillboardDefs = () => (
  <defs>
    {/* ragged bristle edge for the brush masks */}
    <filter id="bb-bristle" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves={2} seed={5} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={38} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* oil-paint wobble on painted shapes */}
    <filter id="bb-oil" x="-3%" y="-3%" width="106%" height="106%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* brush streak texture: noise stretched along the stroke direction */}
    <filter id="bb-streak" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.16" numOctaves={3} seed={21} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 -2.2 1.25" />
    </filter>
    <filter id="bb-streak-dark" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.14 0.007" numOctaves={3} seed={8} />
      <feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.06  0 0 0 0 0.2  0 0 0 -2.4 1.3" />
    </filter>
    <filter id="bb-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation={9} />
    </filter>
    <filter id="bb-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={16} />
    </filter>
    <linearGradient id="bb-sunset" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0b1f4a" />
      <stop offset="0.35" stopColor="#1d5a9a" />
      <stop offset="0.62" stopColor="#3fa3c0" />
      <stop offset="0.8" stopColor="#b6e3d4" />
      <stop offset="1" stopColor="#ffd88a" />
    </linearGradient>
    <linearGradient id="bb-title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff6b0" />
      <stop offset="0.45" stopColor={C.yellow} />
      <stop offset="1" stopColor="#ff8a1c" />
    </linearGradient>
    <linearGradient id="bb-cone" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#ffe9a8" stopOpacity={0.2} />
      <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
    </linearGradient>
  </defs>
);

// Dusk → night sky with a few stars once it is dark.
export const Sky = ({ night }: { night: number }) => {
  const mix = (a: string, b: string) => {
    const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
    return `rgb(${[0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * night)).join(",")})`;
  };
  const r = rnd(3);
  return (
    <g>
      <defs>
        <linearGradient id="bb-sky" x1="0" y1="0" x2="0" y2="1">
          {[0, 0.55, 1].map((o, i) => <stop key={o} offset={o} stopColor={mix(C.sky[i], C.night[i])} />)}
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bb-sky)" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={r() * 1080} cy={r() * 320} r={1 + r() * 1.6} fill="#fff" opacity={night * (0.3 + r() * 0.5)} />)}
    </g>
  );
};

// Brush-stroke reveal. `p` 0→1 draws the strokes in order (rows of a zig-zag covering the box). Children are
// painted only where the strokes have passed. `angle` tilts the rows; `sw` = brush width.
export const PaintIn = ({ id, p, x, y, w, h, sw = 120, angle = -8, seed = 1, children }: { id: string; p: number; x: number; y: number; w: number; h: number; sw?: number; angle?: number; seed?: number; children: ReactNode }) => {
  const r = rnd(seed);
  const rows = Math.ceil(h / (sw * 0.62)) + 2;
  const paths = Array.from({ length: rows }, (_, i) => {
    const yy = y - sw * 0.6 + i * sw * 0.62;
    const a = x - 120, b = x + w + 120;
    const [s, e] = i % 2 ? [b, a] : [a, b];
    const mid = (s + e) / 2;
    return `M${s} ${yy + (r() - 0.5) * 30} Q${mid} ${yy + (r() - 0.5) * 80} ${e} ${yy + (r() - 0.5) * 30}`;
  });
  if (p >= 1) return <g>{children}</g>;
  return (
    <g>
      <defs>
        <mask id={`bb-m-${id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <g filter="url(#bb-bristle)" transform={`rotate(${angle} ${x + w / 2} ${y + h / 2})`}>
            {paths.map((d, i) => {
              const k = cl(p * rows - i);
              return k > 0 ? <path key={i} d={d} pathLength={1} stroke="#fff" strokeWidth={sw} strokeLinecap="round" fill="none" strokeDasharray="1 1" strokeDashoffset={1 - k} /> : null;
            })}
          </g>
        </mask>
      </defs>
      <g mask={`url(#bb-m-${id})`}>{children}</g>
    </g>
  );
};

// Loose brush hatching: short strokes of one colour scattered in a box (texture inside painted areas).
export const Strokes = ({ x, y, w, h, n, color, sw = 10, len = 60, angle = -20, seed = 1, opacity = 0.35 }: { x: number; y: number; w: number; h: number; n: number; color: string; sw?: number; len?: number; angle?: number; seed?: number; opacity?: number }) => {
  const r = rnd(seed);
  const a = (angle * Math.PI) / 180;
  return (
    <g stroke={color} strokeLinecap="round" fill="none" opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const px = x + r() * w, py = y + r() * h, l = len * (0.5 + r()), da = (r() - 0.5) * 0.5;
        return <path key={i} d={`M${px} ${py} q${Math.cos(a + da) * l * 0.5} ${Math.sin(a + da) * l * 0.5 + 6} ${Math.cos(a + da) * l} ${Math.sin(a + da) * l}`} strokeWidth={sw * (0.5 + r())} />;
      })}
    </g>
  );
};

// A giant painted face (original character). Local head ≈ 360 × 500, centred on (0,0). `turn` −1…1 turns the
// face (features slide, far side narrows); `kind` picks hair and lips; `look` moves the eyes.
export const Face = ({ x, y, s = 1, turn = 0, kind, look = 0, id }: { x: number; y: number; s?: number; turn?: number; kind: "hero" | "heroine"; look?: number; id: string }) => {
  const t = turn * 38;
  const her = kind === "heroine";
  const eye = (ex: number, sc: number) => (
    <g transform={`translate(${ex + t} -38) scale(${sc} 1)`}>
      <path d="M-50 4 Q-8 -30 48 0 Q8 22 -50 4 Z" fill="#fff4e4" />
      <circle cx={look * 10 + 2} cy={2} r={17} fill="#3a1d12" />
      <circle cx={look * 10 + 2} cy={2} r={8} fill="#0a0506" />
      <circle cx={look * 10 + 8} cy={-5} r={5} fill="#fff" />
      <path d="M-56 6 Q-10 -38 54 -2" stroke={C.hair} strokeWidth={her ? 11 : 8} fill="none" strokeLinecap="round" />
      {her && <path d="M44 -4 l18 -10 M30 -14 l12 -14 M14 -20 l6 -16" stroke={C.hair} strokeWidth={4} strokeLinecap="round" />}
      <path d="M-44 14 Q0 26 40 10" stroke={C.shadow} strokeWidth={5} fill="none" opacity={0.7} />
    </g>
  );
  const head = "M-172 -70 C-178 -215 -98 -268 0 -270 C98 -268 178 -215 172 -70 C170 40 132 150 62 218 C30 246 -30 246 -62 218 C-132 150 -170 40 -172 -70 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s * 1.07} ${s * 0.93})`} filter="url(#bb-oil)">
      <defs>
        <radialGradient id={`bb-skin-${id}`} cx={0.34 - turn * 0.12} cy="0.38" r="0.75">
          <stop offset="0" stopColor={C.skinLit} />
          <stop offset="0.42" stopColor={C.skin} />
          <stop offset="0.82" stopColor="#9a5a7a" />
          <stop offset="1" stopColor={C.shadow} />
        </radialGradient>
        <clipPath id={`bb-head-${id}`}><path d={head} /></clipPath>
      </defs>
      {/* hair behind and shoulders */}
      {her ? (
        <path d="M-200 -120 C-240 -300 230 -320 205 -110 C230 60 250 260 300 420 L-300 420 C-250 250 -235 60 -200 -120 Z" fill={C.hair} />
      ) : (
        <path d="M-190 -60 C-200 -260 200 -270 190 -60 L170 40 L-170 40 Z" fill={C.hair} />
      )}
      <path d={`M-70 190 L-80 300 C-180 320 -300 350 -340 470 L340 470 C300 350 180 320 80 300 L70 190 Z`} fill={`url(#bb-skin-${id})`} />
      <path d="M-78 200 C-40 270 40 270 78 200 L80 250 C40 300 -40 300 -80 250 Z" fill="#5a1a40" opacity={0.6} />
      {!her && <path d="M-340 470 C-300 350 -170 320 -90 300 L0 400 L90 300 C170 320 300 350 340 470 Z" fill="#f4efe6" />}
      {!her && <path d="M-90 300 L0 400 L-40 470 L-130 470 Z M90 300 L0 400 L40 470 L130 470 Z" fill="#1d2440" />}
      {her && <path d="M-340 470 C-300 360 -200 330 -120 320 C-60 380 60 380 120 320 C200 330 300 360 340 470 Z" fill="#c2185b" />}
      {/* face planes */}
      <path d={head} fill={`url(#bb-skin-${id})`} />
      <g clipPath={`url(#bb-head-${id})`}>
        {/* shadow side, cool purple */}
        <path d={`M${120 + t} -280 C${70 + t} -120 ${110 + t} 60 ${40 + t} 260 L260 260 L260 -280 Z`} fill={C.shadow} opacity={0.55} />
        {/* cyan rim on the shadow edge */}
        <path d={head} fill="none" stroke={C.rim} strokeWidth={34} transform="translate(-14 0)" opacity={0.85} strokeDasharray="0 330 520 2000" />
        <Strokes x={-170} y={-250} w={180} h={420} n={26} color={C.skinLit} sw={9} len={70} angle={70} seed={3} opacity={0.4} />
        <Strokes x={40} y={-220} w={150} h={420} n={22} color="#5b2148" sw={9} len={70} angle={100} seed={4} opacity={0.35} />
        {/* eye sockets, under-chin, jaw: the darker planes that make a billboard face read from the street */}
        <ellipse cx={-78 + t} cy={-52} rx={70} ry={40} fill={C.shadow} opacity={0.28} />
        <ellipse cx={78 + t} cy={-52} rx={66} ry={40} fill={C.shadow} opacity={0.34} />
        <path d="M-150 120 C-120 200 -60 240 0 242 C60 240 120 200 150 120 C120 220 60 262 0 262 C-60 262 -120 220 -150 120 Z" fill="#6a2448" opacity={0.5} />
        <path d="M-160 -120 C-150 -200 -90 -240 -30 -246" stroke={C.skinLit} strokeWidth={28} fill="none" opacity={0.5} strokeLinecap="round" />
        {/* cheeks */}
        <ellipse cx={-90 + t} cy={70} rx={60} ry={34} fill="#e5545a" opacity={her ? 0.45 : 0.22} />
        <ellipse cx={95 + t} cy={70} rx={50} ry={30} fill="#e5545a" opacity={her ? 0.35 : 0.15} />
      </g>
      {/* brows */}
      <path d={`M${-128 + t} -96 Q${-80 + t} ${her ? -124 : -116} ${-22 + t} -100`} stroke={C.hair} strokeWidth={her ? 12 : 22} fill="none" strokeLinecap="round" />
      <path d={`M${22 + t} -100 Q${80 + t} ${her ? -124 : -118} ${126 + t * 0.6} -94`} stroke={C.hair} strokeWidth={her ? 12 : 22} fill="none" strokeLinecap="round" />
      {eye(-78, 1 + turn * 0.12)}
      {eye(78, 1 - turn * 0.18)}
      {/* nose: shadow plane + highlight */}
      <path d={`M${8 + t * 1.2} -60 C${14 + t * 1.3} 0 ${40 + t * 1.3} 40 ${30 + t * 1.3} 70 C${10 + t} 84 ${-20 + t} 82 ${-36 + t} 70`} stroke="#8e3a48" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.75} />
      <path d={`M${-6 + t} -50 L${-4 + t} 30`} stroke="#fff3c8" strokeWidth={10} strokeLinecap="round" opacity={0.85} />
      <circle cx={-2 + t} cy={50} r={8} fill="#fff6d8" opacity={0.9} />
      {/* lips */}
      <path d={`M${-58 + t} 132 Q${-24 + t} 112 ${t} 122 Q${24 + t} 112 ${58 + t} 132 Q${t} 146 ${-58 + t} 132 Z`} fill={her ? "#d01e3c" : "#a8434a"} />
      <path d={`M${-58 + t} 132 Q${t} 150 ${58 + t} 132 Q${30 + t} 176 ${t} 176 Q${-30 + t} 176 ${-58 + t} 132 Z`} fill={her ? "#e8384f" : "#b85656"} />
      <path d={`M${-14 + t} 156 q14 8 28 0`} stroke="#fff0e0" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.8} />
      {/* front hair */}
      {her ? (
        <>
          <path d="M-182 -60 C-200 -240 -60 -300 40 -272 C-40 -230 -120 -170 -150 -40 Z" fill={C.hair} />
          <path d="M40 -272 C150 -262 210 -170 186 -40 C160 -150 110 -220 30 -236 Z" fill={C.hair} />
          <path d="M-120 -240 C-60 -270 0 -268 30 -250" stroke="#6a4a8a" strokeWidth={10} fill="none" opacity={0.8} />
          {/* flower behind the ear */}
          <g transform="translate(-178 -110)">
            {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={0} cy={-26} rx={18} ry={30} fill="#fff1f4" transform={`rotate(${i * 60})`} />)}
            <circle r={13} fill={C.yellow} />
          </g>
        </>
      ) : (
        <>
          <path d="M-188 -50 C-210 -240 -60 -330 70 -300 C170 -280 214 -200 190 -60 C170 -170 120 -210 20 -214 C-60 -216 -140 -180 -188 -50 Z" fill={C.hair} />
          <path d="M-110 -262 C-40 -300 60 -300 130 -250" stroke="#5f73c8" strokeWidth={8} fill="none" opacity={0.85} strokeLinecap="round" />
          <path d="M-80 -236 C-20 -262 40 -262 90 -236" stroke="#5f73c8" strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

// Steel scaffold under the board: pipes, couplers, cross braces and a working plank.
export const Scaffold = ({ top, dark }: { top: number; dark: number }) => {
  const xs = [90, 330, 570, 810, 990];
  const ys = [top + 30, top + 220, top + 420];
  const col = `rgb(${Math.round(70 - 45 * dark)},${Math.round(72 - 45 * dark)},${Math.round(84 - 45 * dark)})`;
  return (
    <g stroke={col} strokeLinecap="round">
      {xs.map((x) => <line key={x} x1={x} y1={top - 10} x2={x} y2={1920} strokeWidth={16} />)}
      {ys.map((y) => <line key={y} x1={50} y1={y} x2={1030} y2={y} strokeWidth={12} />)}
      {xs.slice(0, -1).map((x, i) => <line key={`d${x}`} x1={x} y1={ys[i % 2 ? 1 : 0]} x2={xs[i + 1]} y2={ys[i % 2 ? 0 : 1] + (i % 2 ? 0 : 0)} strokeWidth={8} />)}
      {xs.slice(0, -1).map((x, i) => <line key={`e${x}`} x1={x} y1={ys[1]} x2={xs[i + 1]} y2={ys[2]} strokeWidth={8} />)}
      {xs.flatMap((x) => ys.map((y) => <rect key={`${x}-${y}`} x={x - 13} y={y - 11} width={26} height={22} fill={col} stroke="none" rx={4} />))}
      {/* plank */}
      <rect x={60} y={top + 8} width={960} height={26} fill={dark > 0.5 ? "#2a1e14" : "#7a5634"} stroke="none" />
      <rect x={60} y={top + 30} width={960} height={6} fill="#000" opacity={0.35} stroke="none" />
    </g>
  );
};

// Bamboo ladder leaning on the scaffold.
export const Ladder = ({ x, y1, y2, lean = 120, dark }: { x: number; y1: number; y2: number; lean?: number; dark: number }) => {
  const c = dark > 0.5 ? "#3a2a12" : "#c79a4a";
  const n = Math.floor((y2 - y1) / 70);
  return (
    <g stroke={c} strokeLinecap="round">
      <line x1={x} y1={y1} x2={x + lean} y2={y2} strokeWidth={12} />
      <line x1={x + 80} y1={y1} x2={x + 80 + lean} y2={y2} strokeWidth={12} />
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 0.5) / n;
        return <line key={i} x1={x + lean * k} y1={y1 + (y2 - y1) * k} x2={x + 80 + lean * k} y2={y1 + (y2 - y1) * k} strokeWidth={8} />;
      })}
    </g>
  );
};

// The painter on the plank, reaching up with a long brush. `reach` 0–1 lifts the arm; `t` sways.
export const Painter = ({ x, y, reach, t, dark, paint = C.red }: { x: number; y: number; reach: number; t: number; dark: number; paint?: string }) => {
  const body = dark > 0.5 ? "#0b0a12" : "#22202c";
  const a = -60 - reach * 70 + Math.sin(t * 3) * 10;
  const rad = (a * Math.PI) / 180;
  const sx = 0, sy = -150;
  const hx = sx + Math.cos(rad) * 90, hy = sy + Math.sin(rad) * 90;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={2} rx={60} ry={8} fill="#000" opacity={0.3} />
      <path d="M-22 0 L-14 -90 L14 -90 L24 0 L10 0 L0 -60 L-8 0 Z" fill={body} />
      <path d="M-30 -90 Q-34 -150 -10 -170 L14 -170 Q34 -150 30 -90 Z" fill={dark > 0.5 ? "#1a2a3a" : "#3c6a8e"} />
      <circle cx={2} cy={-192} r={22} fill={body} />
      <path d="M-30 -200 Q2 -238 34 -200 Z" fill={dark > 0.5 ? "#2a2416" : "#e8d9b0"} />
      <path d={`M${sx} ${sy} L${hx} ${hy}`} stroke={body} strokeWidth={14} strokeLinecap="round" />
      <path d={`M${hx} ${hy} l${Math.cos(rad) * 190} ${Math.sin(rad) * 190}`} stroke="#6b4a2a" strokeWidth={7} strokeLinecap="round" />
      <circle cx={hx + Math.cos(rad) * 196} cy={hy + Math.sin(rad) * 196} r={9} fill={paint} />
      <path d="M-14 -150 L-46 -100 L-30 -66" stroke={body} strokeWidth={13} fill="none" strokeLinecap="round" />
      {/* paint cans */}
      {[C.red, C.yellow, "#2f6fd0"].map((c, i) => (
        <g key={c} transform={`translate(${60 + i * 40} 0)`}>
          <rect x={-15} y={-34} width={30} height={34} fill="#8a8f98" />
          <rect x={-15} y={-38} width={30} height={8} fill={c} />
          <path d="M-15 -34 l0 18 q6 -8 12 0" fill={c} />
        </g>
      ))}
    </g>
  );
};

// A row of marquee bulbs; `on` 0–1 switches them on with a left-to-right chase, `t` animates the chase.
export const Bulbs = ({ x1, x2, y, on, t, gap = 44 }: { x1: number; x2: number; y: number; on: number; t: number; gap?: number }) => {
  const n = Math.floor((x2 - x1) / gap) + 1;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const lit = cl(on * (n + 6) - i) * (((i + Math.floor(t / 4)) % 3 === 0) ? 0.55 : 1);
        const cx = x1 + i * gap;
        return (
          <g key={i}>
            {lit > 0.05 && <circle cx={cx} cy={y} r={20} fill={C.bulb} opacity={lit * 0.55} filter="url(#bb-glow)" />}
            <circle cx={cx} cy={y} r={9} fill={lit > 0.05 ? C.bulb : "#6e6658"} stroke="#3a332a" strokeWidth={2} />
            {lit > 0.05 && <circle cx={cx - 2} cy={y - 3} r={3} fill="#fff" opacity={lit} />}
          </g>
        );
      })}
    </g>
  );
};

// Pencil squaring grid the painter uses to scale the poster up; fades as paint covers it.
export const Grid = ({ x, y, w, h, step = 98, opacity }: { x: number; y: number; w: number; h: number; step?: number; opacity: number }) => (
  <g stroke="#6d6a74" strokeWidth={2} opacity={opacity}>
    {Array.from({ length: Math.floor(w / step) + 1 }, (_, i) => <line key={`v${i}`} x1={x + i * step} y1={y} x2={x + i * step} y2={y + h} />)}
    {Array.from({ length: Math.floor(h / step) + 1 }, (_, i) => <line key={`h${i}`} x1={x} y1={y + i * step} x2={x + w} y2={y + i * step} />)}
    {Array.from({ length: Math.floor(w / step) }, (_, i) => <text key={`n${i}`} x={x + i * step + 6} y={y + 22} fontSize={18} fill="#6d6a74" stroke="none" fontFamily="monospace">{String.fromCharCode(65 + i)}</text>)}
  </g>
);

// Hand-lettered title: stacked offset copies make the painted 3D block, a dark outline, a gradient face and a
// white highlight stroke. Use inside a <PaintIn>.
export const Lettering = ({ x, y, size, text, font, anchor = "middle" }: { x: number; y: number; size: number; text: string; font: string; anchor?: "middle" | "start" }) => {
  const base = { x, y, fontSize: size, fontFamily: font, textAnchor: anchor, fontWeight: 400 } as const;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => <text key={i} {...base} x={x + 2 + i * 1.6} y={y + 2 + i * 1.8} fill="#5a0c14" stroke="#5a0c14" strokeWidth={size * 0.16} strokeLinejoin="round">{text}</text>)}
      <text {...base} fill="none" stroke="#1a0608" strokeWidth={size * 0.16} strokeLinejoin="round">{text}</text>
      <text {...base} fill="none" stroke={C.red} strokeWidth={size * 0.09} strokeLinejoin="round">{text}</text>
      <text {...base} fill="url(#bb-title)">{text}</text>
      <text {...base} fill="none" stroke="#fffbe0" strokeWidth={size * 0.02} opacity={0.8} transform={`translate(${-size * 0.015} ${-size * 0.02})`}>{text}</text>
    </g>
  );
};

// Street under the scaffold: a warm glow from the cinema doors and a queue of silhouettes (heads and shoulders)
// that fills in as `night` rises. `t` = frame, for a small idle sway.
export const Street = ({ night, t }: { night: number; t: number }) => {
  const r = rnd(17);
  const people = Array.from({ length: 16 }, (_, i) => ({ x: 40 + i * 66 + r() * 30, h: 150 + r() * 60, w: 44 + r() * 16, k: r() }));
  return (
    <g>
      <defs>
        <radialGradient id="bb-door" cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#ffb85a" stopOpacity={0.85} />
          <stop offset="0.5" stopColor="#d9603a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#d9603a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={1460} width={1080} height={460} fill="url(#bb-door)" opacity={0.25 + 0.75 * night} />
      {people.map((p, i) => {
        const on = Math.max(0, Math.min(1, night * 2.2 - p.k));
        const sway = Math.sin(t * 0.06 + i) * 3;
        return (
          <g key={i} opacity={on} transform={`translate(${p.x + sway} 1920)`} fill="#0a0710">
            <path d={`M${-p.w} 0 C${-p.w} ${-p.h + 60} ${-p.w * 0.6} ${-p.h + 40} 0 ${-p.h + 40} C${p.w * 0.6} ${-p.h + 40} ${p.w} ${-p.h + 60} ${p.w} 0 Z`} />
            <circle cx={0} cy={-p.h + 8} r={p.w * 0.5} />
          </g>
        );
      })}
    </g>
  );
};

// Light cones from floodlights on the scaffold up onto the board (night).
export const Floods = ({ y, on, xs = [200, 540, 880] }: { y: number; on: number; xs?: number[] }) => (
  <g opacity={on}>
    {xs.map((x) => (
      <g key={x}>
        <path d={`M${x - 26} ${y} L${x - 170} ${y - 640} L${x + 170} ${y - 640} L${x + 26} ${y} Z`} fill="url(#bb-cone)" style={{ mixBlendMode: "screen" }} />
        <rect x={x - 32} y={y - 6} width={64} height={30} rx={6} fill="#1a1a20" />
        <ellipse cx={x} cy={y - 6} rx={28} ry={8} fill="#fff8d8" />
      </g>
    ))}
  </g>
);
