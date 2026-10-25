import { interpolate } from "remotion";
import { Banner, PAL } from "../../../components/Scene";

// War-elephant duel (ยุทธหัตถี) pieces in house style v2: one full-screen side-view world (ground line G), a war
// elephant with a walk cycle, flapping ear, trumpeting trunk and a rider swinging the ngao, arrow volleys, blow
// sparks and the sky/hills/ground the duel happens on. World units: 1 px at zoom 1; the camera scales the world.
export const G = 1000; // world ground line
export const GREY = "#8c8781";
export const GREY_D = "#6c6762";
export const SIAM_RED = "#b3261e";
export const BURMA_WHITE = "#e9e2cf";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// frames since the most recent event in `list` (1e9 if none yet)
export const since = (f: number, list: number[]) => list.reduce((d, x) => (x <= f ? Math.min(d, f - x) : d), 1e9);

// War elephant, side view facing right (flip = facing left), feet at (x, y). walk 0–1 leg cycle, trumpet 0–1 trunk
// curls up, swing 0–1 the king's ngao sweeps down. cloth/trim = caparison colours, crown = the king's crown.
export const Elephant = ({ x, y, s, flip = false, walk = 0, trumpet = 0, swing = 0, cloth, trim, crown, frame, rider = true }: { x: number; y: number; s: number; flip?: boolean; walk?: number; trumpet?: number; swing?: number; cloth: string; trim: string; crown: string; frame: number; rider?: boolean }) => {
  const t = frame * 0.16;
  const leg = (lx: number, ph: number, back: boolean) => {
    const a = Math.sin(t + ph) * 16 * walk;
    const k = Math.max(0, Math.sin(t + ph + 1)) * 18 * walk;
    return (
      <g key={lx} transform={`rotate(${a},${lx},-100)`} opacity={back ? 0.82 : 1}>
        <path d={`M${lx - 17} -110 L${lx + 17} -110 L${lx + 15} -52 L${lx - 15} -52 Z`} fill={back ? GREY_D : GREY} stroke={PAL.ink} strokeWidth={3} />
        <g transform={`rotate(${-k},${lx},-54)`}>
          <path d={`M${lx - 15} -56 L${lx + 15} -56 L${lx + 16} -4 L${lx - 16} -4 Z`} fill={back ? GREY_D : GREY} stroke={PAL.ink} strokeWidth={3} />
          <ellipse cx={lx} cy={-3} rx={19} ry={6} fill="#4a4642" />
        </g>
      </g>
    );
  };
  // trunk: 6 segments from the face; hangs and sways, or curls up when trumpeting
  const segs = Array.from({ length: 6 }, (_, i) => interpolate(trumpet, [0, 1], [8 + Math.sin(t * 0.8 + i * 0.5) * 6 * (i / 5), -38 - i * 6], clamp));
  let px = 168;
  let py = -170;
  const pts: [number, number][] = [[px, py]];
  let ang = 90;
  segs.forEach((d, i) => {
    ang += d;
    const r = (ang * Math.PI) / 180;
    const len = 26 - i * 2;
    px += Math.cos(r) * len;
    py += Math.sin(r) * len;
    pts.push([px, py]);
  });
  const ear = Math.sin(frame * 0.12) * 6;
  const ngao = -40 + swing * 120; // pole angle (deg from horizontal), raised → swept down
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={2} rx={170} ry={14} fill="#000" opacity={0.25} />
      {leg(-85, 3.1, true)}
      {leg(80, 0, true)}
      {/* body */}
      <path d="M-150 -150 Q-160 -235 -60 -250 Q40 -262 120 -230 Q150 -205 148 -150 Q120 -96 20 -100 L-110 -100 Q-150 -105 -150 -150 Z" fill={GREY} stroke={PAL.ink} strokeWidth={4} />
      <path d="M-158 -170 Q-178 -150 -170 -120" stroke={PAL.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* caparison */}
      <path d="M-95 -248 Q20 -262 100 -236 L92 -150 Q10 -138 -88 -148 Z" fill={cloth} stroke={PAL.ink} strokeWidth={3.5} />
      <path d="M-88 -150 Q10 -140 92 -152 L90 -138 Q10 -126 -86 -136 Z" fill={trim} stroke={PAL.ink} strokeWidth={2} />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-70 + i * 26} cy={-142 + Math.sin(i) * 2} r={5} fill={trim} stroke={PAL.ink} strokeWidth={1.5} />)}
      {leg(-55, 0, false)}
      {leg(108, 3.1, false)}
      {/* head, ear, eye, tusk, trunk */}
      <path d="M100 -232 Q170 -250 190 -190 Q196 -150 168 -150 Q130 -150 110 -170 Z" fill={GREY} stroke={PAL.ink} strokeWidth={4} />
      <path d={`M120 -222 Q${84 - ear} -210 ${90 - ear} -160 Q110 -150 132 -170 Z`} fill={GREY_D} stroke={PAL.ink} strokeWidth={3.5} />
      <path d="M140 -238 Q165 -246 182 -222 L176 -210 Q160 -228 140 -226 Z" fill={trim} stroke={PAL.ink} strokeWidth={2.5} />
      <circle cx={170} cy={-200} r={4} fill={PAL.ink} />
      <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} stroke={PAL.ink} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} stroke={GREY} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M176 -162 Q222 -150 236 -186 Q214 -164 178 -172 Z" fill="#f4eedf" stroke={PAL.ink} strokeWidth={2.5} />
      {/* rear rider with a banner, then the king on the neck with the ngao */}
      {rider && (
        <g>
          <g transform="translate(-40,-252)">
            <path d="M-10 0 Q-12 -30 -8 -50 L8 -50 Q12 -30 10 0 Z" fill={cloth} stroke={PAL.ink} strokeWidth={2.5} />
            <circle cx={0} cy={-62} r={10} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
            <Banner x={-6} y={-30} s={1} color={trim} />
          </g>
          <g transform="translate(78,-250)">
            <path d="M-14 0 Q-16 -38 -10 -64 L12 -64 Q16 -38 14 0 Z" fill={cloth} stroke={PAL.ink} strokeWidth={3} />
            <path d="M-12 -40 L12 -36 L12 -30 L-12 -34 Z" fill={trim} />
            <circle cx={0} cy={-78} r={12} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2.5} />
            <path d="M-12 -84 L0 -122 L12 -84 Z" fill={crown} stroke={PAL.ink} strokeWidth={2} />
            <g transform={`rotate(${ngao},6,-56)`}>
              <line x1={-60} y1={-56} x2={170} y2={-56} stroke="#5a3a1f" strokeWidth={6} strokeLinecap="round" />
              <path d="M168 -66 Q214 -76 226 -52 Q200 -58 168 -46 Z" fill="#d7dbde" stroke={PAL.ink} strokeWidth={2.5} />
              <path d="M8 -62 L22 -62 L22 -50 L8 -50 Z" fill={trim} />
            </g>
            <path d="M-4 -60 L26 -58" stroke={PAL.skin} strokeWidth={8} strokeLinecap="round" />
          </g>
        </g>
      )}
    </g>
  );
};

// Arrows on a high arc from around x0 to around x1, n arrows launched 2 frames apart from `at`, flight 30 frames.
export const Arrows = ({ frame, at, x0, x1, n, dir, seed }: { frame: number; at: number; x0: number; x1: number; n: number; dir: 1 | -1; seed: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = interpolate(frame, [at + i * 2, at + 30 + i * 2], [0, 1], clamp);
      if (t <= 0 || t >= 1) return null;
      const sx = x0 + ((i * 37 + seed) % 120) - 60;
      const ex = x1 + ((i * 53 + seed) % 260) - 130;
      const ax = sx + (ex - sx) * t;
      const ay = G - 60 - Math.sin(t * Math.PI) * 420;
      const ang = Math.atan2(-Math.cos(t * Math.PI) * 420 * Math.PI, ex - sx) * (180 / Math.PI);
      return (
        <g key={i} transform={`translate(${ax},${ay}) rotate(${ang})`}>
          <line x1={-26 * dir} y1={0} x2={26 * dir} y2={0} stroke="#3a2a1a" strokeWidth={3} />
          <path d={`M${26 * dir} 0 l${-8 * dir} -4 l0 8 Z`} fill="#cfd3d6" />
        </g>
      );
    })}
  </g>
);

// Star of sparks where two blades meet, 10 frames after each blow in `blows`.
export const Sparks = ({ frame, blows, x, y }: { frame: number; blows: number[]; x: number; y: number }) => (
  <g>
    {blows.map((f) => {
      const k = frame - f;
      if (k < 0 || k > 10) return null;
      return (
        <g key={f} transform={`translate(${x},${y})`} opacity={1 - k / 10}>
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i * 0.63) * (20 + k * 9)} y2={Math.sin(i * 0.63) * (20 + k * 9)} stroke="#ffe48a" strokeWidth={4} strokeLinecap="round" />)}
          <circle r={18 - k} fill="#fff6d0" />
        </g>
      );
    })}
  </g>
);

// The field: dusk sky gradient, low sun with glow, far green hills, three trees, sandy ground. World x −600…3000.
export const Field = () => (
  <g>
    <defs>
      <linearGradient id="yhsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a4a7a" />
        <stop offset="0.6" stopColor="#d88a5a" />
        <stop offset="1" stopColor="#f6cf86" />
      </linearGradient>
      <linearGradient id="yhground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b8935a" />
        <stop offset="1" stopColor="#7a5a32" />
      </linearGradient>
    </defs>
    <rect x={-600} y={-800} width={3600} height={G + 800} fill="url(#yhsky)" />
    <circle cx={1200} cy={760} r={300} fill="#ffe2a0" opacity={0.35} />
    <circle cx={1200} cy={760} r={90} fill="#fff1cc" opacity={0.95} />
    <path d={`M-600 ${G - 50} ` + Array.from({ length: 20 }, (_, i) => `L${-600 + i * 200} ${G - 60 - Math.sin(i * 1.1) * 50 - 40}`).join(" ") + ` L3000 ${G} L-600 ${G} Z`} fill="#6a7a5a" stroke={PAL.ink} strokeOpacity={0.4} strokeWidth={2} />
    {[200, 2200, 2500].map((tx, i) => (
      <g key={i} transform={`translate(${tx},${G - 20})`}>
        <rect x={-8} y={-140} width={16} height={140} fill="#5a3a22" />
        <ellipse cx={0} cy={-170} rx={90} ry={60} fill="#3f5a32" stroke={PAL.ink} strokeWidth={3} />
      </g>
    ))}
    <rect x={-600} y={G - 12} width={3600} height={1400} fill="url(#yhground)" />
  </g>
);

// Dust kicked up by the charge: k 0–1 per puff is computed by the caller from the schedule.
export const DustPuffs = ({ ks, x = 900 }: { ks: number[]; x?: number }) => (
  <g>{ks.map((k, i) => <circle key={i} cx={x + i * 60} cy={G - 40 - i * 4} r={60 + k * 60} fill="#d8b98a" opacity={0.35 * k} />)}</g>
);

// A falling banner (rotates down `fall` degrees around its foot).
export const FallingBanner = ({ x, y, s, color, fall }: { x: number; y: number; s: number; color: string; fall: number }) => (
  <g transform={`rotate(${fall},${x},${y})`}><Banner x={x} y={y} s={s} color={color} /></g>
);
