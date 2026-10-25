import { interpolate } from "remotion";

// Woodblock-print sea battle pieces (inspired by the craft, not copying any print): black keyblock outlines over
// flat colour blocks, bokashi gradients in the sky and the sea, curling stylised waves with claw-like foam,
// kasumi-band powder smoke with scalloped outlines, wood grain and washi paper over everything (`PrintDefs`,
// `Grain`). World units: sea level SEA, x −800…3200; ship facing right with gun ports PORT(i).
export const SEA = 1000;
export const GUNS = 6;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const since = (f: number, list: number[]) => list.reduce((d, x) => (x <= f ? Math.min(d, f - x) : d), 1e9);
export const PORT = (i: number) => -170 + i * 62;
export const portX = (shipX: number, flip: boolean, i: number) => shipX + (flip ? -1 : 1) * PORT(i);
export const rnd = (i: number) => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};
export const P = {
  paper: "#efe2c4", sumi: "#1a1611", prussian: "#1f3d6b", indigo: "#28466f", blue: "#7fa6c0", pale: "#c9d8d6",
  vermilion: "#c4432b", ochre: "#d9a441", wood: "#6b4a2e", woodDk: "#4a3020", sail: "#f3ead3", dusk: "#e9b48f",
} as const;
const K = 4.5; // keyblock line width in world px

// Defs once per <svg>: `carve` wobbles every edge like a cut block (page coordinates), `grainFx` makes wood grain,
// `washi` paper fibres; bokashi gradients for sky and sea.
export const PrintDefs = () => (
  <defs>
    <filter id="carve" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1920}>
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={5} result="w" />
      <feDisplacementMap in="SourceGraphic" in2="w" scale={4} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="grainFx" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1920}>
      <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.11" numOctaves={3} seed={11} result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.17  0 0 0 0 0.08  0 0 0 -1.6 1.05" />
    </filter>
    <filter id="washi" filterUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1920}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="f" />
      <feColorMatrix in="f" type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 0 0 -2.2 1.3" />
    </filter>
    <linearGradient id="skyBk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.prussian} />
      <stop offset="0.16" stopColor={P.prussian} stopOpacity={0.95} />
      <stop offset="0.34" stopColor={P.blue} stopOpacity={0.4} />
      <stop offset="0.45" stopColor={P.paper} stopOpacity={0} />
      <stop offset="0.53" stopColor={P.dusk} stopOpacity={0.6} />
      <stop offset="0.6" stopColor={P.vermilion} stopOpacity={0.5} />
    </linearGradient>
    <linearGradient id="seaBk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.blue} />
      <stop offset="0.35" stopColor={P.indigo} />
      <stop offset="1" stopColor="#13284a" />
    </linearGradient>
    <linearGradient id="waveBk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.prussian} />
      <stop offset="0.55" stopColor={P.indigo} />
      <stop offset="1" stopColor={P.blue} />
    </linearGradient>
  </defs>
);

// Wood grain + washi fibres, laid over the whole print (multiply).
export const Grain = ({ w, h }: { w: number; h: number }) => (
  <g style={{ mixBlendMode: "multiply" }} pointerEvents="none">
    <rect width={w} height={h} filter="url(#grainFx)" opacity={0.28} />
    <rect width={w} height={h} filter="url(#washi)" opacity={0.5} />
  </g>
);

// Sky (world part): kasumi mist bands. The bokashi itself is drawn in page space (`skyBk` on a full-page rect)
// so the prussian always sits at the top of the screen and the dusk band on the horizon.
export const Sky = ({ frame }: { frame: number }) => (
  <g>
    {[[-300, 380, 900], [1300, 300, 1100], [2400, 470, 700], [500, 640, 800]].map(([x, y, w], i) => {
      const dx = x + Math.sin(frame * 0.01 + i) * 30;
      return <rect key={i} x={dx} y={y} width={w} height={46} rx={23} fill={P.paper} opacity={0.75} />;
    })}
  </g>
);

// Far sea: flat ground of bokashi blue with keyblock horizon and a row of small scalloped wavelets.
export const FarSea = ({ frame }: { frame: number }) => (
  <g>
    <rect x={-1200} y={SEA - 130} width={5200} height={1600} fill="url(#seaBk)" />
    <line x1={-1200} y1={SEA - 130} x2={4000} y2={SEA - 130} stroke={P.sumi} strokeWidth={K} />
    {[0, 1, 2].map((r) => (
      <path key={r} d={`M-1200 ${SEA - 100 + r * 38} ` + Array.from({ length: 110 }, (_, i) => `a24 ${12 + r * 3} 0 0 1 ${48} 0`).join(" ")} transform={`translate(${((frame * (0.6 + r * 0.4) + r * 17) % 48) - 48},0)`} fill="none" stroke={r ? P.pale : P.paper} strokeWidth={3} opacity={0.8} />
    ))}
  </g>
);

// One curling wave: back rising to a crest, a lip curling forward with a rope of foam and claw-like fingers.
// Origin = base under the crest; w = half width, h = height; dir +1 curls to the right.
export const Curl = ({ x, y, w, h, dir = 1 }: { x: number; y: number; w: number; h: number; dir?: 1 | -1 }) => {
  const body = `M${-w} 0 C${-0.5 * w} 0 ${-0.3 * w} ${-h} ${0.1 * w} ${-h} C${0.45 * w} ${-h} ${0.64 * w} ${-0.8 * h} ${0.55 * w} ${-0.52 * h} C${0.45 * w} ${-0.7 * h} ${0.3 * w} ${-0.72 * h} ${0.24 * w} ${-0.5 * h} C${0.2 * w} ${-0.25 * h} ${0.45 * w} ${-0.04 * h} ${0.9 * w} 0 Z`;
  // points along the lip (cubic from crest to tip)
  const lip = (t: number) => {
    const p0 = [0.1 * w, -h], p1 = [0.45 * w, -h], p2 = [0.64 * w, -0.8 * h], p3 = [0.55 * w, -0.52 * h];
    const u = 1 - t;
    const bx = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const by = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    return { bx, by, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  const cs = Math.max(0.5, h / 160);
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <path d={body} fill="url(#waveBk)" />
      <path d={body.replace(/ Z$/, "")} fill="none" stroke={P.sumi} strokeWidth={K} strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((k) => (
        <path key={k} d={`M${-w * (1 - k * 0.55)} 0 C${-0.5 * w + k * 0.25 * w} 0 ${-0.3 * w + k * 0.2 * w} ${-h * (1 - k * 0.3)} ${0.08 * w} ${-h * (1 - k * 0.3)}`} fill="none" stroke={P.blue} strokeWidth={3} />
      ))}
      <path d={`M${-0.15 * w} ${-0.96 * h} C${0.1 * w} ${-1.04 * h} ${0.5 * w} ${-1.0 * h} ${0.6 * w} ${-0.7 * h}`} fill="none" stroke={P.sumi} strokeWidth={16 * cs} strokeLinecap="round" />
      <path d={`M${-0.15 * w} ${-0.96 * h} C${0.1 * w} ${-1.04 * h} ${0.5 * w} ${-1.0 * h} ${0.6 * w} ${-0.7 * h}`} fill="none" stroke={P.paper} strokeWidth={9 * cs} strokeLinecap="round" />
      {Array.from({ length: 7 }, (_, i) => {
        const { bx, by, a } = lip(0.1 + i * 0.14);
        return (
          <g key={i} transform={`translate(${bx},${by}) rotate(${a + 20}) scale(${cs * (0.8 + (i % 2) * 0.35)})`}>
            <path d="M0 0 C10 -16 30 -18 40 -4 C30 -10 20 -6 18 4 C14 -2 6 -2 0 0 Z" fill={P.paper} stroke={P.sumi} strokeWidth={2.4} strokeLinejoin="round" />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={(0.2 + i * 0.14) * w} cy={-h * (1.12 + (i % 2) * 0.08)} r={5 * cs} fill={P.paper} stroke={P.sumi} strokeWidth={2} />)}
    </g>
  );
};

// A row of curls scrolling sideways; amp = wave height, gap = spacing.
export const CurlRow = ({ frame, y, h, gap, speed, ph = 0, x0 = -900, x1 = 3300, flipEvery = 0 }: { frame: number; y: number; h: number; gap: number; speed: number; ph?: number; x0?: number; x1?: number; flipEvery?: number }) => {
  const n = Math.ceil((x1 - x0) / gap) + 2;
  const off = (frame * speed + ph) % gap;
  return (
    <g>
      <rect x={x0 - gap} y={y - 4} width={x1 - x0 + gap * 2} height={900} fill="url(#seaBk)" />
      {[0.18, 0.34, 0.55].map((f, j) => (
        <path key={j} d={Array.from({ length: Math.ceil((x1 - x0) / 160) + 2 }, (_, i) => `M${x0 - gap + i * 160 + ((frame * speed * 0.5 + j * 50) % 160)} ${y + h * f * 2} q40 -8 80 0`).join(" ")} fill="none" stroke={P.blue} strokeWidth={2.4} opacity={0.7} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const bob = Math.sin(frame * 0.05 + i * 1.7 + ph) * h * 0.12;
        const hh = h * (0.8 + rnd(i + ph) * 0.4) + bob;
        return <Curl key={i} x={x0 + i * gap + off - gap} y={y} w={gap * 0.62} h={hh} dir={flipEvery && i % flipEvery === 0 ? -1 : 1} />;
      })}
    </g>
  );
};

// Powder smoke: a cluster of puffs whose union gets one keyblock outline (outline pass, then fill pass),
// stretched into a kasumi band as it drifts.
export const PowderSmoke = ({ x, y, age, dir }: { x: number; y: number; age: number; dir: 1 | -1 }) => {
  if (age < 0 || age > 150) return null;
  const k = age / 150;
  const puffs = Array.from({ length: 5 }, (_, i) => ({
    cx: x + dir * (18 + age * (1.6 + i * 0.25)) + (i - 2) * 20,
    cy: y - age * 0.3 - i * 10 + Math.sin(i * 2.1) * 12,
    r: (14 + age * 0.55) * (0.7 + (i % 3) * 0.18),
  }));
  const op = interpolate(age, [0, 6, 110, 150], [0, 1, 1, 0], clamp);
  return (
    <g opacity={op}>
      {puffs.map((p, i) => <circle key={`o${i}`} cx={p.cx} cy={p.cy} r={p.r + K * 0.8} fill={P.sumi} />)}
      {puffs.map((p, i) => <circle key={`f${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={i % 2 ? P.sail : P.paper} />)}
      {age > 4 && puffs.slice(0, 3).map((p, i) => <path key={`c${i}`} d={`M${p.cx - p.r * 0.5} ${p.cy + p.r * 0.1} q${p.r * 0.3} ${-p.r * 0.45} ${p.r * 0.6} 0`} fill="none" stroke={P.sumi} strokeWidth={2} />)}
      {age < 5 && <polygon points={`${x},${y} ${x + dir * 90},${y - 30} ${x + dir * 70},${y} ${x + dir * 100},${y + 24}`} fill={P.vermilion} stroke={P.sumi} strokeWidth={2.5} />}
      {age < 5 && <circle cx={x + dir * 34} cy={y} r={16} fill={P.ochre} stroke={P.sumi} strokeWidth={2} />}
    </g>
  );
};

// Splash where a shot falls short: a fountain of claw fingers.
export const Splash = ({ x, age, big = 1 }: { x: number; age: number; big?: number }) => {
  if (age < 0 || age > 40) return null;
  const k = age / 40;
  const hgt = Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.5) * 190 * big * (1 - k * 0.5);
  return (
    <g transform={`translate(${x},${SEA - 30}) scale(${big})`} opacity={k > 0.8 ? (1 - k) * 5 : 1}>
      {[-2, -1, 0, 1, 2].map((i) => {
        const sg = i < 0 ? -1 : 1;
        const tipX = i * 38;
        const tipY = -hgt / big * (1 - Math.abs(i) * 0.18);
        return (
          <g key={i}>
            <path d={`M${i * 14 - 16} 0 C${i * 18 - 14} ${tipY * 0.5} ${tipX - 14} ${tipY * 0.8} ${tipX} ${tipY} c${sg * 16} -4 ${sg * 30} 6 ${sg * 30} 22 c${-sg * 8} -8 ${-sg * 18} -8 ${-sg * 22} 0 C${tipX + 6} ${tipY * 0.6} ${i * 18 + 8} ${tipY * 0.3} ${i * 14 + 16} 0 Z`} fill={P.paper} stroke={P.sumi} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={tipX + sg * 34} cy={tipY - 18} r={6} fill={P.paper} stroke={P.sumi} strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};

// Cannonball in flight (ship x0 → target x1, arcing).
export const Ball = ({ frame, t, x0, x1, flight = 22 }: { frame: number; t: number; x0: number; x1: number; flight?: number }) => {
  const k = (frame - t) / flight;
  if (k < 0 || k > 1) return null;
  return <circle cx={x0 + (x1 - x0) * k} cy={SEA - 50 - Math.sin(k * Math.PI) * 90} r={8} fill={P.sumi} />;
};

// Stylised flames: vermilion tongues with ochre hearts and keyblock lines.
export const Flames = ({ x, y, size = 60, frame, seed = 0 }: { x: number; y: number; size?: number; frame: number; seed?: number }) => (
  <g transform={`translate(${x},${y}) scale(${size / 60})`}>
    {[-1, 0, 1].map((i) => {
      const sw = Math.sin(frame * 0.3 + i * 2 + seed) * 8;
      const h = 70 + (i === 0 ? 30 : 0) + Math.sin(frame * 0.4 + seed + i) * 10;
      return (
        <g key={i} transform={`translate(${i * 26},0)`}>
          <path d={`M-20 0 C-26 ${-h * 0.4} ${-6 + sw} ${-h * 0.6} ${sw} ${-h} C${10 + sw} ${-h * 0.62} 26 ${-h * 0.4} 20 0 Z`} fill={P.vermilion} stroke={P.sumi} strokeWidth={2.6} />
          <path d={`M-9 0 C-11 ${-h * 0.25} ${sw * 0.5} ${-h * 0.4} ${sw * 0.6} ${-h * 0.55} C${8} ${-h * 0.35} 12 ${-h * 0.2} 9 0 Z`} fill={P.ochre} />
        </g>
      );
    })}
  </g>
);

// Burning ship's smoke: a leaning column of sumi-grey scalloped billows (outline pass, then fill pass), each billow
// with a curled inner line, rising and drifting downwind.
export const ShipSmoke = ({ frame, from, x, k }: { frame: number; from: number; x: number; k: number }) => {
  if (k <= 0) return null;
  const t = frame - from;
  const puffs = Array.from({ length: 9 }, (_, i) => {
    const life = (t * 1.2 + i * 40) % 360;
    const g = interpolate(life, [0, 30, 300, 360], [0, 1, 0.9, 0], clamp);
    return { cx: x + 40 - life * 0.9 + Math.sin(i * 2.3) * 40, cy: SEA - 220 - life * 1.4, r: (40 + life * 0.22 + (i % 3) * 10) * g, op: 1 };
  });
  return (
    <g opacity={k}>
      {puffs.map((p, i) => <circle key={`o${i}`} cx={p.cx} cy={p.cy} r={p.r + K} fill={P.sumi} opacity={p.op} />)}
      {puffs.map((p, i) => <circle key={`f${i}`} cx={p.cx} cy={p.cy} r={p.r} fill={i % 2 ? "#5a5650" : "#6e6a62"} opacity={p.op} />)}
      {puffs.map((p, i) => <path key={`c${i}`} d={`M${p.cx - p.r * 0.5} ${p.cy + p.r * 0.2} q${p.r * 0.1} ${-p.r * 0.6} ${p.r * 0.6} ${-p.r * 0.3}`} fill="none" stroke={P.sumi} strokeWidth={2.4} opacity={p.op} />)}
    </g>
  );
};

// Three-masted warship with keyblock lines: wood hull with vermilion and ochre wales, cream sails with seam lines,
// gun ports that run out on their firing frames, scorched hits, a mainmast that can fall, flames on deck.
export const Ship = ({ x, frame, flip, flag, fires, roll, heave, mastFall = 0, fire = 0, hits = [] }: { x: number; frame: number; flip: boolean; flag: string; fires: number[][]; roll: number; heave: number; mastFall?: number; fire?: number; hits?: number[] }) => {
  const billow = Math.sin(frame * 0.07) * 6;
  const mast = (mx: number, h: number, sails: number, key: string, fall = 0) => (
    <g key={key} transform={`rotate(${-fall * 80},${mx},-150)`}>
      <rect x={mx - 7} y={-150 - h} width={14} height={h} fill={P.woodDk} stroke={P.sumi} strokeWidth={K * 0.7} />
      {Array.from({ length: sails }, (_, i) => {
        const top = -150 - h + 40 + i * (h * 0.38);
        const sw = 160 - i * 12;
        const bh = h * 0.32;
        return (
          <g key={i}>
            <line x1={mx - sw / 2 - 14} y1={top} x2={mx + sw / 2 + 14} y2={top} stroke={P.sumi} strokeWidth={7} />
            <path d={`M${mx - sw / 2} ${top} L${mx + sw / 2} ${top} Q${mx + sw / 2 + 22 + billow} ${top + bh * 0.5} ${mx + sw / 2} ${top + bh} L${mx - sw / 2} ${top + bh} Q${mx - sw / 2 + 22 + billow} ${top + bh * 0.5} ${mx - sw / 2} ${top} Z`} fill={P.sail} stroke={P.sumi} strokeWidth={K} strokeLinejoin="round" />
            {[-0.25, 0, 0.25].map((s) => <path key={s} d={`M${mx + s * sw} ${top + 4} q${10 + billow * 0.5} ${bh * 0.5} 0 ${bh - 8}`} fill="none" stroke={P.sumi} strokeWidth={1.6} opacity={0.6} />)}
          </g>
        );
      })}
      <path d={`M${mx} ${-150 - h} L${mx + 60} ${-150 - h + 8 + Math.sin(frame * 0.3) * 6} L${mx} ${-150 - h + 20} Z`} fill={flag} stroke={P.sumi} strokeWidth={2.4} />
    </g>
  );
  const ports = Array.from({ length: GUNS }, (_, i) => PORT(i));
  return (
    <g transform={`translate(${x},${SEA + heave}) rotate(${roll}) scale(${flip ? -1 : 1},1)`}>
      <path d="M-160 -450 L300 -150 M120 -490 L360 -190 M-20 -530 L-280 -170" stroke={P.sumi} strokeWidth={1.8} fill="none" />
      {mast(-160, 300, 2, "mz")}
      {mast(-20, 380, 3, "mn", mastFall)}
      {mast(120, 340, 3, "fr")}
      <line x1={230} y1={-120} x2={370} y2={-196} stroke={P.sumi} strokeWidth={9} />
      <path d="M-290 -170 L-230 -175 L-220 -130 L230 -120 L300 -150 L250 -30 Q200 20 0 24 Q-210 22 -260 -20 Z" fill={P.wood} stroke={P.sumi} strokeWidth={K * 1.2} strokeLinejoin="round" />
      <path d="M-290 -170 L-230 -175 L-226 -150 L-292 -146 Z" fill={P.woodDk} stroke={P.sumi} strokeWidth={K * 0.7} />
      <path d="M-262 -112 L280 -104 L276 -92 L-258 -98 Z" fill={P.vermilion} stroke={P.sumi} strokeWidth={2} />
      <path d="M-258 -80 L262 -78 L258 -66 L-252 -68 Z" fill={P.ochre} stroke={P.sumi} strokeWidth={2} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-240 + i * 90} -20 q40 6 80 0`} stroke={P.sumi} strokeWidth={1.6} fill="none" opacity={0.7} />)}
      {ports.map((px, i) => (
        <g key={i}>
          <rect x={px - 13} y={-60} width={26} height={22} fill={P.sumi} />
          <rect x={px - 4 - (since(frame, fires[i] ?? []) < 4 ? 8 : 0)} y={-52} width={16} height={8} fill="#55504a" />
        </g>
      ))}
      {hits.filter((h) => frame >= h).map((h, i) => (
        <g key={h}>
          <polygon points={`${-120 + i * 140 - 26},-100 ${-120 + i * 140 - 8},-122 ${-120 + i * 140 + 18},-114 ${-120 + i * 140 + 26},-92 ${-120 + i * 140},-80`} fill={P.sumi} />
          <path d={`M${-120 + i * 140 + 20} -120 l18 -22 M${-120 + i * 140 - 20} -98 l-22 -8`} stroke={P.sumi} strokeWidth={3} />
        </g>
      ))}
      {fire > 0 && [-60, 40, 150].map((fx, i) => <Flames key={i} x={fx} y={-140} size={(60 + i * 14) * fire} frame={frame} seed={i + 2} />)}
    </g>
  );
};

// Title cartouche: a pale rectangle with a double keyblock border; `seal` adds a vermilion seal stamp.
export const Cartouche = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: React.ReactNode }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={w} height={h} fill="#f4e9cc" stroke={P.sumi} strokeWidth={6} />
    <rect x={10} y={10} width={w - 20} height={h - 20} fill="none" stroke={P.sumi} strokeWidth={2.2} />
    <rect x={10} y={10} width={w - 20} height={h - 20} fill={P.ochre} opacity={0.18} />
    {children}
  </g>
);

export const Seal = ({ x, y, s = 1, font }: { x: number; y: number; s?: number; font: string }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(-3)`}>
    <rect x={-60} y={-60} width={120} height={120} rx={12} fill={P.vermilion} />
    <rect x={-50} y={-50} width={100} height={100} rx={6} fill="none" stroke={P.paper} strokeWidth={3} />
    <text x={0} y={-6} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={P.paper}>ภาพ</text>
    <text x={0} y={34} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={30} fill={P.paper}>ประกอบ</text>
  </g>
);
