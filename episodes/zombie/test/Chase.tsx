import { loadFont } from "@remotion/google-fonts/Kanit";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fk, keyed, LOOKS, mixAng, PoseFigure, runCycle, shamble, STAND, type AngPose, type Look } from "../../../components/Pose";
import { PAL } from "../../../components/Scene";
import { Bed, Hit } from "../../../components/Sound";

// 15-second look test "หนีซอมบี้": a night street chase with pose-driven figures (components/Pose.tsx). All moves are
// code-written for now; each figure's pose comes from one function (runnerAng, chaserAng, …), so a captured move
// (`npm run mocap`, then mocapPose) can replace any of them later without touching the scene.
// Beats: hook close-up of a lunging zombie → chase → look back → trip and fall, zombies close in from both sides →
// up and through the gap → into a shop → door slams → zombies bang on it.
const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const CHASE_FRAMES = 450;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AY = 1250; // screen y of the back (sidewalk) lane at zoom 1
const S = 1.55; // px per cm, back lane
const FRONT = { y: 95, s: 1.68 }; // road lane, nearer the camera
const V = 19.5; // run speed px/frame (matches the stride of runCycle at this scale)
const DOOR = 4560;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- timeline ----------
const T = { run: 20, look: 118, lookEnd: 146, trip: 185, down: 198, up: 222, go: 240, front: 246, back: 292, door: 318, slam: 330, end: 424 };
const BANGS = [350, 362, 371, 384, 393, 405, 414];

// Runner travel: recoil, accelerate, sprint, trip slide, on the ground, sprint again, into the doorway.
const RX: [number, number][] = [[0, 0], [T.run, 0], [T.run + 14, 140], [T.trip, 140 + (T.trip - T.run - 14) * V], [T.down, 140 + (T.trip - T.run - 14) * V + 70]];
RX.push([T.go, RX[4][1] + 10], [T.door, DOOR - 6]);
const runnerX = (f: number) => {
  for (let i = 1; i < RX.length; i++) if (f <= RX[i][0]) return interpolate(f, [RX[i - 1][0], RX[i][0]], [RX[i - 1][1], RX[i][1]]);
  return RX[RX.length - 1][1];
};
const runnerLane = (f: number) => interpolate(f, [T.go, T.front, T.back, T.back + 16], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });

const RECOIL: AngPose = { lean: -14, neck: -12, shN: 150, elN: 70, shF: 135, elF: 80, thN: 18, knN: 12, thF: -16, knF: 6, look: -1 };
const TRIP: AngPose = { lean: 38, neck: -10, shN: 85, elN: 20, shF: 60, elF: 30, thN: -12, knN: 20, thF: 45, knF: 40, look: 1 };
const FALLEN: AngPose = { lean: 74, neck: -35, shN: 18, elN: 4, shF: 26, elF: 4, thN: 38, knN: 95, thF: 55, knF: 105, look: 1 };
const LOOKBACK: AngPose = { ...FALLEN, neck: -50, look: -1 };
const RISE: AngPose = { lean: 34, neck: -8, shN: -30, elN: 80, shF: 40, elF: 90, thN: 50, knN: 70, thF: -10, knF: 40, look: 1 };
// The runner's pose for frame f. To use a captured run: `runCycle(f)` → mocapPose(runClip, f) (and fk → skip).
const runnerAng = (f: number): AngPose => {
  if (f < T.run) return RECOIL;
  if (f < T.run + 8) return mixAng(RECOIL, runCycle(f), (f - T.run) / 8);
  if (f < T.trip) {
    const r = runCycle(f);
    // look back over the shoulder mid-chase
    const k = interpolate(f, [T.look, T.look + 5, T.lookEnd - 5, T.lookEnd], [0, 1, 1, 0], clamp);
    return k > 0 ? { ...r, neck: r.neck - 20 * k, lean: r.lean - 6 * k, look: k > 0.5 ? -1 : 1 } : r;
  }
  if (f < T.go + 6)
    return mixAng(
      keyed([[T.trip, runCycle(T.trip)], [T.trip + 5, TRIP], [T.down, FALLEN], [T.down + 8, LOOKBACK], [T.up - 4, LOOKBACK], [T.up, FALLEN], [T.go - 4, RISE], [T.go + 6, runCycle(T.go + 6)]], f),
      runCycle(f),
      interpolate(f, [T.go, T.go + 6], [0, 1], clamp),
    );
  if (f < T.door) return runCycle(f);
  return STAND;
};

// Fast zombie: a sprint with arms out in front, head pushed forward.
const zombieRun = (f: number, phase: number): AngPose => {
  const r = runCycle(f * 0.92, phase);
  return { ...r, lean: 22, neck: 20, shN: 78 + 6 * Math.sin(f * 0.2 + phase), elN: 10, shF: 66 + 6 * Math.sin(f * 0.2 + phase + 1), elF: 18 };
};
const LUNGE: AngPose = { lean: 34, neck: 14, shN: 96, elN: 4, shF: 86, elF: 8, thN: 38, knN: 12, thF: -26, knF: 22 };
// Chasers keep a gap behind the runner that opens during the sprint and closes while the runner is down.
const CHASERS = [
  { look: LOOKS.zombieGrey, gap: [[0, 150], [T.run, 150], [60, 260], [T.trip, 340], [T.up, 120], [T.go, 105], [T.door, 430], [T.slam + 10, 150]] as [number, number][], phase: 0 },
  { look: LOOKS.zombieOffice, gap: [[0, 520], [T.run, 520], [60, 470], [T.trip, 520], [T.up, 250], [T.go, 220], [T.door, 600], [T.slam + 16, 260]] as [number, number][], phase: 2 },
];
const gapAt = (keys: [number, number][], f: number) => interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), clamp);
const chaserX = (c: (typeof CHASERS)[number], f: number) => (f < T.slam ? runnerX(f) - gapAt(c.gap, f) : DOOR - gapAt(c.gap, f));
// Door banging: arm raised, comes down on each hit.
const bang = (f: number, seed: number): AngPose => {
  const hits = BANGS.filter((_, i) => i % 2 === seed % 2);
  const h = hits.filter((b) => f >= b - 6).pop();
  // 0 = arm up, 1 = fist on the door (swings down over 6 frames, back up over 8)
  const down = h === undefined ? 0 : f < h ? (f - (h - 6)) / 6 : Math.max(0, 1 - (f - h) / 8);
  return { ...shamble(f, seed), lean: 18, neck: 10, shN: 160 - 70 * down, elN: 30, shF: 120 + 10 * Math.sin(f * 0.1), elF: 40 };
};
const chaserAng = (c: (typeof CHASERS)[number], i: number, f: number): AngPose => {
  if (f < T.run + 6 && i === 0) return keyed([[0, LUNGE], [14, { ...LUNGE, lean: 40, shN: 100 }], [T.run + 6, zombieRun(T.run + 6, c.phase)]], f);
  if (f >= T.slam + 6) return bang(f, i);
  const speed = chaserX(c, f + 1) - chaserX(c, f);
  return mixAng(shamble(f, i + 3), zombieRun(f, c.phase), interpolate(speed, [3, 10], [0, 1], clamp));
};
// Shamblers step out of an alley ahead and lurch toward the runner (they face −x).
const SHAMBLERS = [
  { look: LOOKS.zombieWorker, x0: 3460, start: 150, seed: 5 },
  { look: LOOKS.zombieNurse, x0: 3600, start: 165, seed: 8 },
];
const shamblerX = (z: (typeof SHAMBLERS)[number], f: number) => (f < T.slam ? z.x0 - Math.max(0, f - z.start) * 2.6 : interpolate(f, [T.slam, T.slam + 60], [z.x0 - (T.slam - z.start) * 2.6, DOOR + 110 + z.seed * 8], clamp));
const shamblerAng = (z: (typeof SHAMBLERS)[number], i: number, f: number) => (f >= T.slam + 60 ? bang(f, i + 1) : shamble(f, z.seed));

// ---------- camera ----------
const camAt = (f: number) => {
  const follow = runnerX(f) + 110;
  const hook = -60;
  const k = interpolate(f, [4, 36], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const door = interpolate(f, [T.back + 10, T.slam], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cx = (hook + (follow - hook) * k) * (1 - door) + DOOR * door;
  // hook: tight on the zombie's face and hands; tension zoom while the runner is down; slight push at the door
  const z = interpolate(f, [0, 4, 36, T.down, T.down + 20, T.up + 10, T.go + 10, T.slam, T.slam + 30], [2.9, 2.9, 1.3, 1.3, 1.55, 1.55, 1.3, 1.3, 1.42], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(f, [0, 4, 36, T.down, T.down + 20, T.up + 10, T.go + 10], [-150, -150, 0, 0, -40, -40, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cxDown = interpolate(f, [T.down, T.down + 20, T.up + 10, T.go + 10], [0, -60, -60, 0], clamp);
  return { cx: cx + cxDown, z, cy };
};
const shakeAt = (f: number) => {
  const hits = [T.slam, ...BANGS].filter((h) => f >= h && f < h + 10);
  const h = hits.pop();
  if (h === undefined) return [0, 0];
  const a = (h === T.slam ? 14 : 5) * (1 - (f - h) / 10);
  return [Math.sin(f * 2.3) * a, Math.cos(f * 3.1) * a];
};

// A parallax layer: `k` = how fast it moves with the camera (far 0.25, street 1, foreground 1.5).
const Layer = ({ k, children }: { k: number; children: ReactNode }) => {
  const f = useCurrentFrame();
  const { cx, z, cy } = camAt(f);
  const zl = 1 + (z - 1) * Math.min(1, k);
  return <g transform={`translate(540,${AY}) scale(${zl}) translate(${-cx * k},${-cy * Math.min(1, k)})`}>{children}</g>;
};

// ---------- set ----------
const Sky = () => (
  <g>
    <defs>
      <linearGradient id="z-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#05070f" />
        <stop offset="0.6" stopColor="#14202e" />
        <stop offset="1" stopColor="#24323a" />
      </linearGradient>
      <radialGradient id="z-moon">
        <stop offset="0" stopColor="#f3f0dc" stopOpacity={0.5} />
        <stop offset="1" stopColor="#f3f0dc" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2400} width={20000} height={2400} fill="url(#z-sky)" />
    {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={-900 + rnd(i) * 3000} cy={-2300 + rnd(i + 40) * 1500} r={1 + rnd(i + 80) * 1.6} fill="#dfe6ff" opacity={0.3 + rnd(i + 9) * 0.5} />)}
    <circle cx={520} cy={-1500} r={260} fill="url(#z-moon)" />
    <circle cx={520} cy={-1500} r={70} fill="#ece7cf" />
    <circle cx={500} cy={-1515} r={14} fill="#d6d0b4" />
    <circle cx={545} cy={-1480} r={9} fill="#d6d0b4" />
  </g>
);
const Skyline = () => (
  <g>
    {Array.from({ length: 34 }, (_, i) => {
      const x = -1400 + i * 230, w = 160 + rnd(i) * 120, h = 500 + rnd(i + 3) * 700;
      return (
        <g key={i}>
          <rect x={x} y={-260 - h} width={w} height={h + 300} fill="#0d141d" />
          {Array.from({ length: 6 }, (_, j) => (rnd(i * 9 + j) > 0.8 ? <rect key={j} x={x + 20 + (j % 3) * 45} y={-260 - h + 60 + Math.floor(j / 3) * 120 + rnd(j) * 200} width={14} height={20} fill="#c9b36a" opacity={0.5} /> : null))}
        </g>
      );
    })}
  </g>
);
const FACADE = 640;
const Facades = () => {
  const items: ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const x = -1600 + i * 460;
    const kind = x > DOOR - 300 && x < DOOR + 200 ? "door" : x > 3200 && x < 3700 ? "alley" : ["shutter", "broken", "brick", "shutter"][i % 4];
    if (kind === "door") continue;
    items.push(
      <g key={i}>
        {kind === "alley" ? (
          <g>
            <rect x={x} y={-30 - FACADE} width={460} height={FACADE} fill="#06090d" />
            <path d={`M${x + 120} ${-30}L${x + 200} ${-30 - 300}L${x + 260} ${-30 - 300}L${x + 340} ${-30}Z`} fill="#0e161c" />
          </g>
        ) : (
          <g>
            <rect x={x} y={-30 - FACADE} width={456} height={FACADE} fill={kind === "brick" ? "#3a2622" : "#28323a"} stroke={PAL.ink} strokeWidth={3} />
            {[0, 1, 2].map((j) => <rect key={j} x={x + 40 + j * 135} y={-30 - FACADE + 60} width={90} height={110} fill={rnd(i * 5 + j) > 0.75 ? "#5b4a26" : "#121a20"} stroke={PAL.ink} strokeWidth={3} />)}
            {kind === "shutter" && (
              <g>
                <rect x={x + 40} y={-30 - 320} width={376} height={320} fill="#4a5258" stroke={PAL.ink} strokeWidth={3} />
                {Array.from({ length: 16 }, (_, j) => <path key={j} d={`M${x + 40} ${-30 - 320 + j * 20}H${x + 416}`} stroke="#2f363b" strokeWidth={3} />)}
                <path d={`M${x + 90} ${-160}q40 -30 90 -10t110 0`} stroke="#8a2a2a" strokeWidth={8} fill="none" opacity={0.7} />
              </g>
            )}
            {kind === "broken" && (
              <g>
                <rect x={x + 40} y={-30 - 330} width={376} height={300} fill="#0b1116" stroke={PAL.ink} strokeWidth={3} />
                <path d={`M${x + 40} ${-360}l120 110l-40 80l90 110M${x + 416} ${-300}l-110 60l30 90`} stroke="#6d7a80" strokeWidth={3} fill="none" />
              </g>
            )}
            {kind === "brick" && Array.from({ length: 14 }, (_, j) => <path key={j} d={`M${x} ${-30 - j * 45}H${x + 456}`} stroke="#2a1a17" strokeWidth={3} />)}
          </g>
        )}
      </g>,
    );
  }
  return <g>{items}</g>;
};
// The shop the runner escapes into: warm light, glass door, sign.
const Shop = ({ f }: { f: number }) => {
  const close = interpolate(f, [T.slam - 6, T.slam], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const x = DOOR - 330;
  const lit = 0.85 + 0.15 * Math.sin(f * 0.05);
  return (
    <g>
      <rect x={x} y={-30 - FACADE} width={660} height={FACADE} fill="#2c3036" stroke={PAL.ink} strokeWidth={3} />
      <rect x={x + 60} y={-30 - FACADE + 70} width={540} height={90} rx={10} fill="#160c0c" stroke="#ff4a3a" strokeWidth={5} opacity={lit} />
      <text x={DOOR} y={-30 - FACADE + 133} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={56} fill="#ff6a5a" opacity={lit}>ร้านชำ 24 ชม.</text>
      <rect x={x + 40} y={-30 - 330} width={170} height={250} fill="#d6a65a" opacity={0.55} stroke={PAL.ink} strokeWidth={3} />
      <rect x={x + 450} y={-30 - 330} width={170} height={250} fill="#d6a65a" opacity={0.55} stroke={PAL.ink} strokeWidth={3} />
      {/* doorway and the door swinging shut */}
      <rect x={DOOR - 90} y={-30 - 380} width={180} height={380} fill="#f0c070" />
      <rect x={DOOR - 90} y={-30 - 380} width={180} height={380} fill="#ffdc9a" opacity={0.4} />
      <g transform={`translate(${DOOR - 90},0) scale(${0.12 + 0.88 * close},1)`}>
        <rect x={0} y={-30 - 380} width={180} height={380} fill="#3a2a20" stroke={PAL.ink} strokeWidth={4} />
        <rect x={24} y={-30 - 350} width={132} height={170} fill="#c99a52" opacity={0.6} stroke={PAL.ink} strokeWidth={3} />
        <circle cx={150} cy={-30 - 170} r={8} fill="#c9b36a" stroke={PAL.ink} strokeWidth={2} />
      </g>
      <rect x={DOOR - 100} y={-30 - 390} width={200} height={390} fill="none" stroke={PAL.ink} strokeWidth={8} />
    </g>
  );
};
// Warm spill of light from the shop onto the pavement, and a cold lamp pool every 900 px.
const Lights = ({ f }: { f: number }) => (
  <g>
    <defs>
      <radialGradient id="z-pool">
        <stop offset="0" stopColor="#bfe2ff" stopOpacity={0.3} />
        <stop offset="1" stopColor="#bfe2ff" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="z-warm">
        <stop offset="0" stopColor="#ffc46a" stopOpacity={0.45} />
        <stop offset="1" stopColor="#ffc46a" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="z-bulb">
        <stop offset="0" stopColor="#e6f4ff" stopOpacity={0.9} />
        <stop offset="1" stopColor="#e6f4ff" stopOpacity={0} />
      </radialGradient>
    </defs>
    {Array.from({ length: 8 }, (_, i) => {
      const x = -800 + i * 900;
      if (Math.abs(x - DOOR) < 500) return null; // keep the shop front clear
      // one dying lamp: a slow sag, never a strobe
      const level = i === 4 ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(f * 0.09)) : 1;
      return (
        <g key={i}>
          <ellipse cx={x + 60} cy={30} rx={300} ry={60} fill="url(#z-pool)" opacity={level} />
          <path d={`M${x} 60V-560q0 -40 50 -40h40`} stroke="#1a2228" strokeWidth={14} fill="none" />
          <rect x={x + 70} y={-612} width={60} height={18} rx={6} fill="#c9d6de" stroke={PAL.ink} strokeWidth={3} />
          <path d={`M${x + 75} -596L${x - 140} 40L${x + 340} 40L${x + 125} -596Z`} fill="#cfe8ff" opacity={0.07 * level} />
          <circle cx={x + 100} cy={-590} r={60} fill="url(#z-bulb)" opacity={level} />
        </g>
      );
    })}
    <ellipse cx={DOOR} cy={30} rx={380} ry={80} fill="url(#z-warm)" opacity={interpolate(f, [T.slam - 6, T.slam], [1, 0.35], clamp)} />
  </g>
);
const Street = () => (
  <g>
    <rect x={-3000} y={-30} width={14000} height={75} fill="#3b4246" />
    <path d="M-3000 -30H11000" stroke={PAL.ink} strokeWidth={4} />
    <rect x={-3000} y={45} width={14000} height={20} fill="#59636a" stroke={PAL.ink} strokeWidth={3} />
    <rect x={-3000} y={65} width={14000} height={900} fill="#1b2125" />
    {Array.from({ length: 60 }, (_, i) => <rect key={i} x={-3000 + i * 260} y={300} width={140} height={14} fill="#c9c08a" opacity={0.55} />)}
    {Array.from({ length: 40 }, (_, i) => <ellipse key={i} cx={-2800 + i * 340 + rnd(i) * 200} cy={140 + rnd(i + 7) * 260} rx={60 + rnd(i + 3) * 90} ry={8 + rnd(i) * 8} fill="#2e3a42" opacity={0.6} />)}
  </g>
);
// Foreground: big dark shapes close to the lens, fastest layer.
const Foreground = () => (
  <g>
    {Array.from({ length: 22 }, (_, i) => {
      const x = -1500 + i * 520 + rnd(i) * 200;
      const kind = i % 4;
      const y = 520;
      return (
        <g key={i} fill="#07090b" stroke="#000" strokeWidth={4}>
          {kind === 0 && <path d={`M${x} ${y}q10 -150 70 -170q60 20 70 170Z`} />}
          {kind === 1 && <path d={`M${x} ${y}l60 -230l60 230Z M${x + 22} ${y - 90}h76`} fill="#2a1a12" />}
          {kind === 2 && <g><rect x={x} y={y - 210} width={70} height={210} rx={18} /><rect x={x - 18} y={y - 160} width={106} height={24} rx={8} /></g>}
          {kind === 3 && <path d={`M${x} ${y}q-10 -120 80 -140q120 -10 140 140Z`} />}
        </g>
      );
    })}
  </g>
);

// ---------- overlays ----------
const Title = ({ text, at, out, top, size = 150, color = "#fff" }: { text: string; at: number; out: number; top: number; size?: number; color?: string }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at || f > out) return null;
  const k = at <= 0 ? 1 : spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200 } });
  const slam = at <= 0 ? interpolate(f, [0, 8], [1.25, 1], clamp) : 0.6 + 0.4 * k;
  const fade = interpolate(f, [out - 8, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: font, fontWeight: 900, fontSize: size, color, WebkitTextStroke: `16px #000`, paintOrder: "stroke fill", transform: `scale(${slam})`, opacity: fade, textShadow: "0 0 30px rgba(200,20,20,0.6)" }}>
      {text}
    </div>
  );
};

export const ZombieChase = () => {
  const f = useCurrentFrame();
  const [sx, sy] = shakeAt(f);
  const lane = runnerLane(f);
  const rIn = interpolate(f, [T.door - 4, T.door + 6], [1, 0], clamp); // runner fades into the doorway
  const danger = interpolate(f, [T.down - 6, T.down + 4, T.go + 10, T.go + 30], [0, 1, 1, 0], clamp) * (0.65 + 0.35 * Math.sin(f * 0.32));
  type Fig = { key: string; x: number; lane: number; pose: AngPose; look: Look; flip?: boolean; opacity?: number };
  const figs: Fig[] = [
    ...SHAMBLERS.filter((z) => f >= z.start - 4).map((z, i) => ({ key: `s${i}`, x: shamblerX(z, f), lane: 0, pose: shamblerAng(z, i, f), look: z.look, flip: f < T.slam + 40 || shamblerX(z, f) > DOOR })),
    ...CHASERS.map((c, i) => ({ key: `c${i}`, x: chaserX(c, f), lane: 0, pose: chaserAng(c, i, f), look: c.look, flip: f >= T.slam + 6 && chaserX(c, f) > DOOR })),
    ...(rIn > 0 ? [{ key: "runner", x: runnerX(f), lane, pose: runnerAng(f), look: LOOKS.runner, opacity: rIn }] : []),
  ].sort((a, b) => a.lane - b.lane);
  return (
    <AbsoluteFill style={{ background: "#05070f", overflow: "hidden" }}>
      {/* sound: library recordings for every event, beds for the night */}
      <Hit id="horror_hit" at={0} volume={0.6} />
      <Hit id="zombie_roar" at={2} volume={0.55} />
      <Bed id="scary_wind" from={0} to={CHASE_FRAMES} volume={0.3} fade={10} />
      <Bed id="horror_ambience" from={0} to={CHASE_FRAMES} volume={0.25} fade={10} />
      <Bed id="run_steps" from={T.run} to={T.trip + 4} volume={0.5} fade={6} />
      <Bed id="run_steps" from={T.go} to={T.door + 4} volume={0.5} fade={6} />
      <Bed id="breath_heavy" from={T.trip} to={T.slam + 60} volume={0.4} fade={8} />
      <Bed id="heartbeat_fast" from={T.look} to={T.slam + 10} volume={0.45} fade={12} />
      <Hit id="zombie_growl" at={62} volume={0.45} />
      <Hit id="zombie_growl" at={T.look + 4} volume={0.4} />
      <Hit id="zombie_gasp" at={168} volume={0.45} />
      <Hit id="wood_hit" at={T.down - 4} volume={0.35} />
      <Hit id="zombie_grunt" at={T.down + 12} volume={0.45} />
      <Hit id="zombie_roar" at={T.go + 2} volume={0.45} />
      <Hit id="door_slam" at={T.slam} volume={0.75} />
      {BANGS.map((b) => <Hit key={b} id="door_knock_heavy" at={b} volume={0.55} />)}
      <Hit id="zombie_growl" at={BANGS[1] + 4} volume={0.35} />
      <Hit id="zombie_grunt" at={BANGS[4]} volume={0.35} />
      <Hit id="horror_hit" at={T.end} volume={0.5} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${sx},${sy})`}>
          <Layer k={0.05}><Sky /></Layer>
          <Layer k={0.25}><Skyline /></Layer>
          <Layer k={1}>
            <Facades />
            <Shop f={f} />
            <Street />
            <Lights f={f} />
            {figs.map((g) => {
              const s = g.lane ? S + (FRONT.s - S) * g.lane : S;
              return (
                <g key={g.key} opacity={g.opacity ?? 1}>
                  <PoseFigure pose={fk(g.pose)} look={g.look} x={g.x} y={FRONT.y * g.lane} scale={s} flip={g.flip} />
                </g>
              );
            })}
            {/* low fog drifting over the pavement */}
            <rect x={-3000} y={-160} width={14000} height={260} fill="url(#z-fog)" opacity={0.5} />
          </Layer>
          <Layer k={1.5}><Foreground /></Layer>
        </g>
        <defs>
          <linearGradient id="z-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fa3b0" stopOpacity={0} />
            <stop offset="0.6" stopColor="#8fa3b0" stopOpacity={0.35} />
            <stop offset="1" stopColor="#8fa3b0" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="z-vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </radialGradient>
          <radialGradient id="z-red" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.45" stopColor="#a00000" stopOpacity={0} />
            <stop offset="1" stopColor="#a00000" stopOpacity={0.7} />
          </radialGradient>
          <filter id="z-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.10 0" />
          </filter>
        </defs>
        <rect width={1080} height={1920} fill="#0a2a3a" opacity={0.18} style={{ mixBlendMode: "multiply" }} />
        <rect width={1080} height={1920} fill="url(#z-red)" opacity={danger} />
        <rect width={1080} height={1920} fill="url(#z-vig)" />
        <rect width={1080} height={1920} filter="url(#z-grain)" />
      </svg>
      <Title text="อย่าหยุดวิ่ง!" at={0} out={44} top={300} />
      <Title text="ตี 2 · ถนนร้าง" at={48} out={110} top={180} size={60} color="#cfe8ff" />
      <Title text="ทางตัน?!" at={T.down + 4} out={T.go} top={300} size={120} color="#ff5a4a" />
      <Title text="รอด…หรือยัง?" at={T.end} out={CHASE_FRAMES + 10} top={360} size={130} />
    </AbsoluteFill>
  );
};
