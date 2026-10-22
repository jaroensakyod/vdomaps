import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { COSTUME, Fighter, PAL, PaperGrain } from "../../components/Scene";
import { Bed, lib, Sfx } from "../../components/Sound";
import { font } from "../thaihistory/news/kit";

// Lab: a 20-s WW1 attack-and-defence scene in house style v2, colour. One live side-view world (attackers from the
// left, defenders' trench on the right) seen through two cameras: a wide shot (top) and a tight trench camera
// (bottom). 1080×1920.
export const WW1_FRAMES = 600;
const W = 1080;
const GROUND = 1000; // world ground line
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Shell bursts: [frame, world x, size].
const BLASTS: [number, number, number][] = [
  [20, 1500, 1], [45, 900, 1], [70, 1720, 1], [95, 1200, 1], [160, 700, 1], [230, 1420, 1.1],
  [300, 1640, 1], [345, 1770, 1.2], [400, 1100, 1], [465, 1700, 1.2], [490, 1860, 2.3],
];
const BIG = 490;

// ---------- world pieces ----------
const Explosion = ({ x, size, age }: { x: number; size: number; age: number }) => {
  if (age < 0 || age > 70) return null;
  const k = age / 70;
  const fire = interpolate(age, [0, 4, 22], [0, 1, 0], clamp);
  const ring = interpolate(age, [0, 14], [0, 1], clamp);
  return (
    <g transform={`translate(${x},${GROUND}) scale(${size})`}>
      {/* dark smoke rising */}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={`s${i}`} cx={(rnd(i + x) - 0.5) * 80 + k * 30} cy={-60 - age * (2.2 + i * 0.4)} r={30 + age * 0.9 + i * 6} fill="#3a3330" opacity={0.55 * (1 - k)} />
      ))}
      {/* dirt column */}
      {Array.from({ length: 9 }, (_, i) => {
        const vx = (rnd(i * 3 + x) - 0.5) * 9;
        const vy = -10 - rnd(i * 7 + x) * 9;
        const t = age;
        return <circle key={`d${i}`} cx={vx * t} cy={Math.min(0, vy * t + 0.35 * t * t)} r={10 + rnd(i) * 10} fill="#5a4630" opacity={1 - k} />;
      })}
      {/* fireball */}
      {fire > 0 && (
        <g>
          <circle cx={0} cy={-40} r={70 * fire + 20} fill="#ff7a1a" opacity={0.85 * fire} />
          <circle cx={0} cy={-40} r={40 * fire + 10} fill="#ffd25a" opacity={fire} />
          <circle cx={0} cy={-40} r={18 * fire} fill="#fff6d8" opacity={fire} />
        </g>
      )}
      {/* shock ring on the ground */}
      {ring < 1 && <ellipse cx={0} cy={0} rx={40 + ring * 160} ry={8 + ring * 26} fill="none" stroke="#fff1c8" strokeWidth={6 * (1 - ring)} opacity={1 - ring} />}
    </g>
  );
};

const Wire = ({ x0, x1 }: { x0: number; x1: number }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 60) + 1 }, (_, i) => {
      const x = x0 + i * 60;
      return <path key={i} d={`M${x - 14} ${GROUND} L${x + 14} ${GROUND - 56} M${x + 14} ${GROUND} L${x - 14} ${GROUND - 56}`} stroke="#3a2a1a" strokeWidth={5} />;
    })}
    {[0, 1].map((r) => (
      <path key={r} d={`M${x0} ${GROUND - 30 - r * 16} ` + Array.from({ length: Math.floor((x1 - x0) / 14) }, (_, i) => `q7 ${i % 2 ? -14 : 14} 14 0`).join(" ")} stroke="#6a6a6a" strokeWidth={2.4} fill="none" />
    ))}
  </g>
);

const Tank = ({ x, frame, gunAt }: { x: number; frame: number; gunAt: number[] }) => {
  const flash = Math.max(0, ...gunAt.map((g) => (frame >= g && frame < g + 6 ? 1 - (frame - g) / 6 : 0)));
  return (
    <g transform={`translate(${x},${GROUND + 6})`}>
      {Array.from({ length: 4 }, (_, i) => {
        const age = (frame + i * 9) % 36;
        return <circle key={i} cx={-150 - age * 2} cy={-170 - age * 3} r={14 + age * 0.8} fill="#4a4440" opacity={0.5 * (1 - age / 36)} />;
      })}
      <path d="M-180 0 L-220 -90 L-150 -150 L160 -150 L230 -90 L190 0 Z" fill="#6a6a3a" stroke={PAL.ink} strokeWidth={4} />
      <path d="M-170 -20 L-200 -88 L-148 -128 L150 -128 L206 -88 L176 -20 Z" fill="#555530" />
      {Array.from({ length: 22 }, (_, i) => {
        const p = ((i * 30 + frame * 5) % 660) / 660;
        const px = -190 + p * 380;
        return <rect key={i} x={px} y={-16} width={10} height={14} fill="#2a2a1a" />;
      })}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-150 + i * 50} cy={-55} r={16} fill="#3a3a22" stroke={PAL.ink} strokeWidth={3} transform={`rotate(${frame * 6},${-150 + i * 50},-55)`} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={170 + i * 12} y={-118} width={10} height={40} fill={i === 1 ? "#c0302a" : "#f2efe6"} transform="rotate(-36,190,-100)" />)}
      <rect x={-30} y={-190} width={90} height={44} rx={6} fill="#6a6a3a" stroke={PAL.ink} strokeWidth={3} />
      <rect x={58} y={-176} width={90} height={14} fill="#3a3a22" stroke={PAL.ink} strokeWidth={2} />
      {flash > 0 && <g transform="translate(160,-169)"><circle r={40 * flash} fill="#ffd25a" opacity={flash} /><circle r={18 * flash} fill="#fff6d8" /></g>}
    </g>
  );
};

const Plane = ({ x, y, flip, frame, color, mark }: { x: number; y: number; flip: boolean; frame: number; color: string; mark: "cross" | "roundel" }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -1.3 : 1.3},1.3) rotate(${Math.sin(frame * 0.08) * 5})`}>
    <path d="M-80 -6 L64 -12 L82 0 L64 12 L-80 6 Z" fill={color} stroke={PAL.ink} strokeWidth={3} />
    <rect x={-40} y={-40} width={84} height={11} rx={4} fill={color} stroke={PAL.ink} strokeWidth={3} />
    <rect x={-44} y={20} width={92} height={11} rx={4} fill={color} stroke={PAL.ink} strokeWidth={3} />
    {[-30, 30].map((sx) => <line key={sx} x1={sx} y1={-30} x2={sx} y2={20} stroke={PAL.ink} strokeWidth={3} />)}
    <path d="M-80 -6 L-104 -30 L-94 0 L-104 26 L-80 6 Z" fill={color} stroke={PAL.ink} strokeWidth={3} />
    <ellipse cx={86} cy={0} rx={4} ry={28 * Math.abs(Math.sin(frame * 1.7))} fill="#2a2a2a" opacity={0.7} />
    {mark === "roundel" ? (
      <g><circle cx={0} cy={-35} r={9} fill="#2a4fa8" /><circle cx={0} cy={-35} r={6} fill="#fff" /><circle cx={0} cy={-35} r={3} fill="#c0302a" /></g>
    ) : (
      <g><rect x={-8} y={-38} width={16} height={6} fill="#111" /><rect x={-3} y={-41} width={6} height={12} fill="#111" /></g>
    )}
    <path d="M-10 -6 Q0 -22 12 -6 Z" fill="#3a2a1a" />
  </g>
);

const Tree = ({ x, h, lean }: { x: number; h: number; lean: number }) => (
  <g transform={`translate(${x},${GROUND}) rotate(${lean})`}>
    <path d={`M-12 0 L-8 ${-h} L-2 ${-h - 18} L4 ${-h + 6} L10 0 Z`} fill="#3a2a1e" stroke={PAL.ink} strokeWidth={3} />
    <path d={`M-6 ${-h * 0.6} L-40 ${-h * 0.75} L-38 ${-h * 0.7} Z`} stroke="#3a2a1e" strokeWidth={6} />
  </g>
);

// The whole live world at this frame.
const World = ({ frame }: { frame: number }) => {
  // attackers
  const men = Array.from({ length: 20 }, (_, i) => {
    const start = 110 + (i % 5) * 8 + Math.floor(i / 5) * 22;
    const v = 3.6 * (0.85 + rnd(i) * 0.35);
    const stop = 1470 + (i % 5) * 26;
    const x = Math.min(170 + (i % 3) * 30 + Math.max(0, frame - start) * v, stop);
    const climb = interpolate(frame, [start, start + 12], [70, 0], clamp);
    return { i, start, x, y: GROUND + (i % 3) * 16 + climb, at: x >= stop, sc: 1.45 + (i % 3) * 0.08 };
  });
  const tankX = interpolate(frame, [190, 560], [-260, 1320], clamp);
  const p1 = interpolate(frame, [140, 430], [-300, 2700], clamp);
  const p2 = interpolate(frame, [380, 600], [2700, -300], clamp);
  return (
    <g>
      {/* sky */}
      <defs>
        <linearGradient id="ww1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24305a" />
          <stop offset="0.55" stopColor="#7a5a7a" />
          <stop offset="1" stopColor="#f0a060" />
        </linearGradient>
        <linearGradient id="ww1mud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6244" />
          <stop offset="1" stopColor="#3e2f1f" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-600} width={3400} height={GROUND + 600} fill="url(#ww1sky)" />
      <circle cx={1300} cy={760} r={260} fill="#ffd38a" opacity={0.3} />
      <circle cx={1300} cy={760} r={80} fill="#ffe9bc" opacity={0.9} />
      {/* drifting smoke banks */}
      {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={(i * 520 + frame * (0.6 + i * 0.1)) % 3000 - 300} cy={720 + (i % 3) * 60} rx={360} ry={70} fill="#5a4e58" opacity={0.35} />)}
      {/* far ridge */}
      <path d={`M-400 ${GROUND - 60} ` + Array.from({ length: 18 }, (_, i) => `L${-400 + i * 200} ${GROUND - 70 - Math.sin(i * 1.3) * 40 - 30}`).join(" ") + ` L3000 ${GROUND} L-400 ${GROUND} Z`} fill="#5a5560" stroke={PAL.ink} strokeOpacity={0.4} strokeWidth={2} />
      {/* ground, craters, trees, wire */}
      <rect x={-400} y={GROUND - 12} width={3400} height={1400} fill="url(#ww1mud)" />
      {[300, 620, 980, 1260, 1540].map((cx, i) => <ellipse key={i} cx={cx} cy={GROUND + 40 + (i % 2) * 30} rx={110} ry={22} fill="#3a2a1a" opacity={0.7} />)}
      <Tree x={520} h={230} lean={-8} />
      <Tree x={1180} h={180} lean={10} />
      <Tree x={2400} h={260} lean={-4} />
      {/* attackers' trench (left) */}
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={40 + i * 36} cy={GROUND - 10} rx={22} ry={13} fill="#a08a5a" stroke={PAL.ink} strokeWidth={2} />)}
      <Wire x0={1380} x1={1660} />
      {/* planes */}
      <Plane x={p1} y={330 + Math.sin(frame * 0.05) * 60} flip={false} frame={frame} color="#c0302a" mark="cross" />
      <Plane x={p1 - 330} y={380 + Math.sin(frame * 0.05 + 1) * 60} flip={false} frame={frame} color="#e8e2c8" mark="roundel" />
      {frame >= 140 && frame < 430 && Array.from({ length: 4 }, (_, i) => ((frame + i * 3) % 12 < 6 ? <line key={i} x1={p1 - 200 + i * 40} y1={380} x2={p1 - 170 + i * 40} y2={360} stroke="#ffe08a" strokeWidth={4} /> : null))}
      <Plane x={p2} y={260} flip frame={frame} color="#2a4fa8" mark="roundel" />
      {/* tank */}
      <Tank x={tankX} frame={frame} gunAt={[330, 450]} />
      {/* attackers */}
      {men.filter((m) => frame >= m.start).map((m) => (
        <Fighter key={m.i} x={m.x} y={m.y} scale={m.sc} mode={m.at ? "attack" : "run"} costume={COSTUME.ww1khaki} weapon="rifle" phase={m.i * 1.7} />
      ))}
      {/* explosions */}
      {BLASTS.map(([f, x, size]) => <Explosion key={f} x={x} size={size} age={frame - f} />)}
      {/* defenders' trench (right): men behind a sandbag parapet, machine gun, tracers */}
      {[1920, 2010, 2100, 2190].map((x, i) => {
        const c = (frame + i * 11) % 40;
        return <Fighter key={i} x={x} y={GROUND + 52} scale={1.6} flip mode="aim" costume={COSTUME.ww1grey} weapon="rifle" phase={i} flash={frame > 130 && c < 4 ? 1 - c / 4 : 0} />;
      })}
      <rect x={1800} y={GROUND - 6} width={700} height={70} fill="#77603f" />
      {Array.from({ length: 3 }, (_, row) => Array.from({ length: 14 }, (_, i) => <ellipse key={`${row}-${i}`} cx={1830 + i * 44 + (row % 2) * 22} cy={GROUND - 4 - row * 24} rx={26} ry={14} fill={["#b49a64", "#a68c58", "#c2a874"][(i + row) % 3]} stroke={PAL.ink} strokeWidth={2.4} />))}
      <g transform={`translate(1880,${GROUND - 78})`}>
        <path d="M-10 0 L-30 40 M10 0 L30 40" stroke="#2a2a2a" strokeWidth={6} />
        <rect x={-60} y={-22} width={90} height={24} rx={6} fill="#3a3e36" stroke={PAL.ink} strokeWidth={3} />
        <rect x={-110} y={-15} width={54} height={8} fill="#2a2a2a" />
        {frame > 150 && frame < 540 && frame % 4 < 2 && <circle cx={-116} cy={-11} r={16} fill="#ffd25a" opacity={0.9} />}
      </g>
      {frame > 150 && frame < 540 && Array.from({ length: 7 }, (_, k) => {
        const born = frame - (frame % 3) - k * 3;
        const d = (frame - born) * 70;
        const tx = 1770 - d;
        const ty = GROUND - 89 + (rnd(born) - 0.5) * 30 + d * 0.02;
        return tx > 300 ? <line key={k} x1={tx} y1={ty} x2={tx + 46} y2={ty - 1} stroke="#ffe08a" strokeWidth={3.5} strokeLinecap="round" opacity={0.9} /> : null;
      })}
    </g>
  );
};

// A camera window onto the world: clip rect on screen, world centre and zoom; shake from the bursts.
const View = ({ x, y, w, h, cx, cy, zoom, shake, label, id }: { x: number; y: number; w: number; h: number; cx: number; cy: number; zoom: number; shake: number; label: string; id: string }) => {
  const frame = useCurrentFrame();
  const sx = Math.sin(frame * 2.3) * shake;
  const sy = Math.cos(frame * 3.1) * shake;
  const g = { x, y, W: w, H: h, ground: y + h, cx: x + w / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <g>
      <defs><clipPath id={`clip-${id}`}><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath></defs>
      <g clipPath={`url(#clip-${id})`}>
        <g transform={`translate(${x + w / 2 + sx},${y + h / 2 + sy}) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
        </g>
        <PaperGrain g={g} id={id} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={PAL.gilt} strokeWidth={4} />
      <rect x={x + 18} y={y + 16} width={label.length * 17 + 40} height={40} rx={8} fill={PAL.gilt} />
      <text x={x + 38} y={y + 45} fontSize={26} fontWeight={900} fill="#1a140f" fontFamily={font}>{label}</text>
    </g>
  );
};

export const WW1Battle = () => {
  const frame = useCurrentFrame();
  const hit = Math.max(0, ...BLASTS.map(([f, , size]) => (frame >= f && frame < f + 10 ? (1 - (frame - f) / 10) * size : 0)));
  const big = frame >= BIG && frame < BIG + 14 ? 1 - (frame - BIG) / 14 : 0;
  // bottom camera: trench → wire as the attack arrives → back to the trench for the big hit
  const camX = interpolate(frame, [0, 200, 300, 420, 470], [2040, 2040, 1720, 1640, 1960], clamp);
  const camZ = interpolate(frame, [0, 470, 600], [1.45, 1.55, 1.7], clamp);
  const wideZ = interpolate(frame, [0, 600], [0.62, 0.68], clamp);
  const wideX = interpolate(frame, [0, 110, 330, 480, 600], [900, 700, 1250, 1600, 1700], clamp);
  const titleK = interpolate(frame, [515, 535], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      {/* recorded house-library sound: beds under everything, one-shots on the frame of each event */}
      <Bed id="explosions_distant" from={0} to={600} volume={0.35} />
      <Bed id="wind" from={0} to={600} volume={0.18} />
      {BLASTS.map(([f, x, size]) => (
        <Fragment key={f}>
          {f > 30 && <Sfx src={lib("shell_incoming")} at={f - 16} volume={0.35} />}
          <Sfx src={lib(size > 2 ? "explosion_big" : x < 1000 ? "explosion_far" : "explosion_mid")} at={f} volume={size > 2 ? 0.95 : x < 1000 ? 0.5 : 0.7} />
        </Fragment>
      ))}
      <Sfx src={lib("explosion_debris")} at={BIG + 4} volume={0.55} />
      <Sfx src={lib("whistle_officer")} at={96} volume={0.6} />
      <Sfx src={lib("battle_cry")} at={112} volume={0.6} />
      <Sfx src={lib("mg_ww1")} at={150} volume={0.4} />
      <Sfx src={lib("mg_ww1")} at={390} volume={0.45} />
      {[140, 175, 205, 250, 285, 330, 360, 420, 455].map((f) => <Sfx key={f} src={lib("rifle_ww1")} at={f} volume={0.3} />)}
      <Bed id="tank_move" from={190} to={560} volume={0.4} />
      {[330, 450].map((f) => <Sfx key={f} src={lib("cannon")} at={f} volume={0.55} />)}
      <Bed id="plane_vintage" from={140} to={430} volume={0.4} />
      <Bed id="plane_prop_loop" from={380} to={600} volume={0.3} />
      <Sfx src={lib("war_horn_drums")} at={512} volume={0.5} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <View id="wide" x={30} y={190} w={W - 60} h={760} cx={wideX} cy={830} zoom={wideZ} shake={hit * 4} label="สมรภูมิ" />
        <View id="trench" x={30} y={980} w={W - 60} h={820} cx={camX} cy={GROUND - 150} zoom={camZ} shake={hit * 9 + big * 18} label="ในสนามเพลาะ" />
        {big > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={big * 0.7} />}
      </svg>
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff" }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: PAL.gilt }}>ทดลองฉากรบ · สไตล์ v2</div>
        <div style={{ fontSize: 64, fontWeight: 900 }}>บุก <span style={{ color: "#ffb35c" }}>vs</span> ตั้งรับ</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 50px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 92, fontWeight: 900 }}>สงครามโลกครั้งที่ 1</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>1914–1918 · สงครามสนามเพลาะ</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
