import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { PAL, PaperGrain } from "../../components/Scene";
import { Bed, Hit } from "../../components/Sound";
import { Fire } from "../thaihistory/news/Period";
import { font } from "../thaihistory/news/kit";

// Lab: a sea battle between two sailing warships in house style v2 — rolling ships on layered waves, rippling
// broadsides with lingering powder smoke, a mast shot away, fire. One schedule drives picture and sound.
export const NAVAL_FRAMES = 600;
const W = 1080;
const SEA = 1000; // world sea level
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const A_X = 830; // our ship (red flags), facing right
const B_X = 1570; // enemy ship (blue flags), facing left

// ---- the schedule ----
const BELL = 12;
const GUNS = 6;
const A_VOLLEY = [70, 76, 82, 88, 94, 100];
const A_MISS = [92, 101, 108]; // splashes near B (flight 22)
const A_HIT1 = 118;
const B_VOLLEY = [160, 166, 172, 178, 184, 190];
const B_MISS = [182, 192];
const B_HIT = [198, 207];
const A_VOLLEY2 = [250, 256, 262, 268];
const MAST = 288; // B's mainmast is hit and cracks
const MAST_DOWN = 328; // ...and hits the water
const CHEER = 380;
const TITLE = 515;
const since = (f: number, list: number[]) => list.reduce((d, x) => (x <= f ? Math.min(d, f - x) : d), 1e9);
const PORT = (i: number) => -170 + i * 62; // gun port x on the hull (ship facing right)
// firing frames per gun port, so flash, smoke, ball and sound all come from one list
const A_FIRES = Array.from({ length: GUNS }, (_, i) => [A_VOLLEY[i], A_VOLLEY2[i]].filter((f): f is number => f !== undefined));
const B_FIRES = Array.from({ length: GUNS }, (_, i) => [B_VOLLEY[i]]);
const portX = (shipX: number, flip: boolean, i: number) => shipX + (flip ? -1 : 1) * PORT(i);

const waveY = (x: number, f: number, base: number, amp: number, k: number, w: number, ph = 0) => base + Math.sin(x * k + f * w + ph) * amp + Math.sin(x * k * 2.3 - f * w * 1.4 + ph) * amp * 0.35;
const Waves = ({ frame, base, amp, k, w, color, foam = false, ph = 0, x0 = -800, x1 = 3200 }: { frame: number; base: number; amp: number; k: number; w: number; color: string; foam?: boolean; ph?: number; x0?: number; x1?: number }) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 24) pts.push(`${x},${waveY(x, frame, base, amp, k, w, ph).toFixed(1)}`);
  return (
    <g>
      <path d={`M${x0},3000 L${pts.join(" L")} L${x1},3000 Z`} fill={color} />
      {foam && <path d={`M${pts.join(" L")}`} stroke="#e8f2f2" strokeWidth={5} fill="none" strokeDasharray="40 70" strokeDashoffset={-frame * 3} opacity={0.75} />}
    </g>
  );
};

// White powder smoke from a gun: puffs that swell and drift downwind, lingering ~3 s.
const PowderSmoke = ({ x, y, age, dir }: { x: number; y: number; age: number; dir: 1 | -1 }) => {
  if (age < 0 || age > 110) return null;
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => {
        const a = age - i * 2;
        if (a < 0) return null;
        const k = a / 110;
        return <circle key={i} cx={x + dir * (30 + a * 1.6 + i * 14)} cy={y - a * 0.5 - i * 6} r={18 + a * 0.9 + i * 4} fill="#efeae0" opacity={0.75 * (1 - k)} />;
      })}
      {age < 5 && <circle cx={x + dir * 22} cy={y} r={34 - age * 5} fill="#ffd25a" />}
    </g>
  );
};

const Splash = ({ x, age, big = 1 }: { x: number; age: number; big?: number }) => {
  if (age < 0 || age > 40) return null;
  const up = Math.sin((age / 40) * Math.PI);
  return (
    <g opacity={1 - age / 40}>
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={x + (i - 3) * 12 * big} cy={SEA - up * (120 + (i % 3) * 40) * big + Math.abs(i - 3) * 14} r={(14 + (i % 2) * 6) * big} fill="#f2f8f8" />)}
      <ellipse cx={x} cy={SEA + 6} rx={(30 + age * 3) * big} ry={8 * big} fill="none" stroke="#f2f8f8" strokeWidth={4} />
    </g>
  );
};

// A three-masted warship, facing right. `mastFall` 0–1 topples the mainmast; `fire` 0–1 sets the deck burning.
const Ship = ({ x, frame, flip, flag, sail, fires, roll, heave, mastFall = 0, fire = 0, hits = [] }: { x: number; frame: number; flip: boolean; flag: string; sail: string; fires: number[][]; roll: number; heave: number; mastFall?: number; fire?: number; hits?: number[] }) => {
  const billow = Math.sin(frame * 0.07) * 6;
  const mast = (mx: number, h: number, sails: number, key: string, fall = 0) => (
    <g key={key} transform={`rotate(${-fall * 80},${mx},-150)`}>
      <rect x={mx - 6} y={-150 - h} width={12} height={h} fill="#4a3020" stroke={PAL.ink} strokeWidth={2.5} />
      {Array.from({ length: sails }, (_, i) => {
        const top = -150 - h + 40 + i * (h * 0.38);
        const sw = 150 - i * 10;
        return (
          <g key={i}>
            <line x1={mx - sw / 2 - 10} y1={top} x2={mx + sw / 2 + 10} y2={top} stroke="#4a3020" strokeWidth={5} />
            <path d={`M${mx - sw / 2} ${top} L${mx + sw / 2} ${top} Q${mx + sw / 2 + 18 + billow} ${top + h * 0.17} ${mx + sw / 2} ${top + h * 0.32} L${mx - sw / 2} ${top + h * 0.32} Q${mx - sw / 2 + 18 + billow} ${top + h * 0.17} ${mx - sw / 2} ${top} Z`} fill={sail} stroke={PAL.ink} strokeWidth={2.5} />
            <path d={`M${mx - 10} ${top + 10} L${mx + 10} ${top + 10} L${mx + 10} ${top + h * 0.25} L${mx - 10} ${top + h * 0.25} Z`} fill={flag} opacity={i === 0 ? 0.9 : 0} />
          </g>
        );
      })}
      <path d={`M${mx} ${-150 - h} L${mx + 50} ${-150 - h + 6 + Math.sin(frame * 0.3) * 5} L${mx} ${-150 - h + 16} Z`} fill={flag} stroke={PAL.ink} strokeWidth={1.5} />
    </g>
  );
  const ports = Array.from({ length: GUNS }, (_, i) => PORT(i));
  return (
    <g transform={`translate(${x},${SEA + heave}) rotate(${roll}) scale(${flip ? -1 : 1},1)`}>
      {mast(-160, 300, 2, "mz")}
      {mast(-20, 380, 3, "mn", mastFall)}
      {mast(120, 340, 3, "fr")}
      <line x1={230} y1={-120} x2={360} y2={-190} stroke="#4a3020" strokeWidth={8} />
      {/* hull */}
      <path d="M-290 -170 L-230 -175 L-220 -130 L230 -120 L300 -150 L250 -30 Q200 20 0 24 Q-210 22 -260 -20 Z" fill="#5a3a22" stroke={PAL.ink} strokeWidth={4} />
      <path d="M-290 -170 L-230 -175 L-226 -150 L-292 -146 Z" fill="#4a2e1a" stroke={PAL.ink} strokeWidth={3} />
      <path d="M-258 -80 L262 -78 L258 -66 L-252 -68 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2} />
      <path d="M-262 -112 L280 -104 L276 -96 L-258 -102 Z" fill="#7a2a22" />
      {ports.map((px, i) => (
        <g key={i}>
          <rect x={px - 13} y={-60} width={26} height={22} fill="#1a120c" stroke={PAL.ink} strokeWidth={2} />
          <rect x={px - 4 - (since(frame, fires[i]) < 4 ? 6 : 0)} y={-52} width={14} height={8} fill="#2a2a2a" />
        </g>
      ))}
      {/* damage: scorched holes where shots struck */}
      {hits.filter((h) => frame >= h).map((h, i) => <ellipse key={h} cx={-120 + i * 140} cy={-100} rx={24} ry={16} fill="#1a120c" stroke="#7a3a1a" strokeWidth={3} />)}
      {fire > 0 && [-60, 40, 150].map((fx, i) => <Fire key={i} x={fx} y={-140} size={(60 + i * 12) * fire} seed={i + 2} />)}
    </g>
  );
};

// A cannonball from a gun port (fired at `t`) on an arc to target x.
const Ball = ({ frame, t, x0, x1, flight = 22 }: { frame: number; t: number; x0: number; x1: number; flight?: number }) => {
  const k = interpolate(frame, [t + 1, t + flight], [0, 1], clamp);
  if (k <= 0 || k >= 1) return null;
  return <circle cx={x0 + (x1 - x0) * k} cy={SEA - 52 - Math.sin(k * Math.PI) * 90} r={7} fill="#111" />;
};

const World = ({ frame }: { frame: number }) => {
  const jolt = since(frame, B_HIT) < 12 ? (1 - since(frame, B_HIT) / 12) * 3 : 0;
  const rollA = Math.sin(frame * 0.05) * 3 - jolt;
  const list = interpolate(frame, [MAST, MAST + 160], [0, 7], clamp);
  const rollB = Math.sin(frame * 0.05 + 1.3) * 3 + list;
  const heaveA = Math.sin(frame * 0.06) * 10;
  const heaveB = Math.sin(frame * 0.06 + 1.6) * 10;
  const mastFall = interpolate(frame, [MAST + 6, MAST_DOWN], [0, 1], { ...clamp, easing: (k) => k * k });
  const fireB = interpolate(frame, [MAST, MAST + 40], [0, 1], clamp);
  const A_T = [B_X - 330, B_X - 260, B_X + 120, B_X - 120, B_X - 20, B_X + 60];
  const B_T = [A_X + 330, A_X + 380, A_X - 60, A_X + 80, A_X + 300, A_X + 20];
  return (
    <g>
      <defs>
        <linearGradient id="nvsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262f48" />
          <stop offset="0.6" stopColor="#7a6070" />
          <stop offset="1" stopColor="#e09a6a" />
        </linearGradient>
      </defs>
      <rect x={-800} y={-1200} width={4000} height={SEA + 1200} fill="url(#nvsky)" />
      <circle cx={1300} cy={860} r={220} fill="#ffcf8a" opacity={0.3} />
      {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={((i * 560 + frame * (0.8 + i * 0.15)) % 3600) - 800} cy={420 + (i % 3) * 110} rx={420} ry={90} fill="#3a3a4e" opacity={0.55} />)}
      <Waves frame={frame} base={SEA - 120} amp={6} k={0.012} w={0.04} color="#3f6a78" />
      <Waves frame={frame} base={SEA - 70} amp={10} k={0.009} w={0.05} color="#2f5868" ph={1} foam />
      {/* far-side smoke of B's fire */}
      {fireB > 0 && Array.from({ length: 8 }, (_, i) => {
        const a = (frame - MAST + i * 14) % 112;
        return <circle key={i} cx={B_X - 40 + a * 1.2} cy={SEA - 300 - a * 3.2} r={40 + a * 1.1} fill="#2e2a2a" opacity={0.5 * fireB * (1 - a / 112)} />;
      })}
      <Ship x={B_X} frame={frame} flip flag="#2a4fa8" sail="#e6dfcb" fires={B_FIRES} roll={rollB} heave={heaveB} mastFall={mastFall} fire={fireB} hits={[A_HIT1, MAST]} />
      <Ship x={A_X} frame={frame} flip={false} flag="#c0302a" sail="#f0e8d2" fires={A_FIRES} roll={rollA} heave={heaveA} hits={B_HIT} />
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`ba${t}`} frame={frame} t={t} x0={portX(A_X, false, i)} x1={A_T[i]} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`bb${t}`} frame={frame} t={t} x0={portX(B_X, true, i)} x1={B_T[i]} />))}
      {/* powder smoke from every gun */}
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`a${t}`} x={portX(A_X, false, i)} y={SEA - 50} age={frame - t} dir={1} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`b${t}`} x={portX(B_X, true, i)} y={SEA - 50} age={frame - t} dir={-1} />))}
      {A_MISS.map((t, i) => <Splash key={`am${t}`} x={B_X - 330 + i * 70} age={frame - t} />)}
      {B_MISS.map((t, i) => <Splash key={`bm${t}`} x={A_X + 340 + i * 50} age={frame - t} />)}
      <Splash x={B_X - 380} age={frame - MAST_DOWN} big={1.8} />
      <Waves frame={frame} base={SEA + 30} amp={16} k={0.007} w={0.06} color="#21485a" ph={2.2} foam />
      <defs><linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2230" stopOpacity={0} /><stop offset="1" stopColor="#0c2230" stopOpacity={0.85} /></linearGradient></defs>
      <rect x={-800} y={SEA + 40} width={4000} height={900} fill="url(#deep)" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={1240 + Math.sin(i * 2.1) * 160 + Math.sin(frame * 0.08 + i) * 20} y1={SEA + 70 + i * 22} x2={1300 + Math.sin(i * 2.1) * 160 + Math.sin(frame * 0.08 + i) * 20} y2={SEA + 70 + i * 22} stroke="#ffd9a0" strokeWidth={4} opacity={0.35 - i * 0.018} />)}
      <Waves frame={frame} base={SEA + 260} amp={22} k={0.006} w={0.07} color="#1a3d4c" ph={3.1} foam />
    </g>
  );
};

export const NavalBattle = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 150, 230, 300, 430, 490, 600], [0.7, 0.74, 0.74, 1.1, 1.1, 0.76, 0.72], clamp);
  const cx = interpolate(frame, [0, 230, 300, 430, 490], [1200, 1200, 1470, 1470, 1200], clamp);
  const cy = SEA - 330 / zoom; // waterline held at ~2/3 of the screen
  const hitList = [A_HIT1, ...B_HIT, MAST, MAST_DOWN];
  const d = since(frame, hitList);
  const shake = d < 10 ? (1 - d / 10) * (frame >= MAST ? 16 : 9) : 0;
  const flash = since(frame, [MAST]) < 6 ? 1 - since(frame, [MAST]) / 6 : 0;
  const titleK = interpolate(frame, [TITLE, TITLE + 20], [0, 1], clamp);
  const g = { x: 0, y: 0, W, H: 1920, ground: 1920, cx: W / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      {/* sound — every entry is an event in the schedule above */}
      <Bed id="sea_rough" from={0} to={600} volume={0.45} />
      <Bed id="wind_storm" from={0} to={600} volume={0.2} />
      <Bed id="ship_creak" from={0} to={600} volume={0.3} />
      <Hit id="ship_bell" at={BELL} volume={0.5} />
      {A_FIRES.flat().map((f, i) => <Hit key={`a${f}`} id={i % 2 ? "cannon_old" : "cannon_heavy"} at={f} volume={0.65} />)}
      {B_FIRES.flat().map((f, i) => <Hit key={`b${f}`} id={i % 2 ? "cannon_heavy" : "cannon_old"} at={f} volume={0.45} />)}
      {[...A_MISS, ...B_MISS].map((f) => <Hit key={`s${f}`} id="splash_big" at={f} volume={0.4} />)}
      {[A_HIT1, ...B_HIT].map((f) => (
        <Fragment key={`h${f}`}>
          <Hit id="wood_hit" at={f} volume={0.6} />
          <Hit id="wood_break" at={f} volume={0.4} />
        </Fragment>
      ))}
      <Hit id="wood_break" at={MAST} volume={0.75} />
      <Hit id="mast_fall" at={MAST + 6} volume={0.6} />
      <Hit id="splash_big" at={MAST_DOWN} volume={0.75} />
      <Bed id="fire_big" from={MAST} to={600} volume={0.3} />
      <Hit id="crowd_cheer" at={CHEER} volume={0.3} />
      <Hit id="ship_bell" at={TITLE} volume={0.55} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <g transform={`translate(${W / 2 + Math.sin(frame * 2.3) * shake},${960 + Math.cos(frame * 3.1) * shake}) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
        </g>
        {/* foreground swell and spray close to the camera */}
        <path d={`M-50 1960 ${Array.from({ length: 14 }, (_, i) => `L${-50 + i * 90} ${1800 + Math.sin(i * 0.8 + frame * 0.07 - (cx - 1200) * 0.004) * 40}`).join(" ")} L1200 1960 Z`} fill="#173847" opacity={0.95} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={(i * 131 + frame * 2) % 1150} cy={1790 + Math.sin(frame * 0.1 + i) * 30} r={6 + (i % 3) * 3} fill="#e8f2f2" opacity={0.6} />)}
        <rect x={0} y={0} width={W} height={1920} fill="#ffb060" opacity={0.06} />
        <PaperGrain g={g} id="nv" />
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={flash * 0.45} />}
      </svg>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [TITLE - 10, TITLE], [1, 0], clamp) }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: PAL.gilt }}>ทดลองฉากรบทางทะเล · สไตล์ v2</div>
        <div style={{ fontSize: 66, fontWeight: 900 }}>เรือรบ <span style={{ color: "#ffb35c" }}>ปะทะ</span> เรือรบ</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 56px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 110, fontWeight: 900 }}>ยุทธนาวี</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>การรบทางทะเล</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
