import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { Banner, COSTUME, Fighter, PAL, PaperGrain } from "../../components/Scene";
import { Bed, Hit } from "../../components/Sound";
import { font } from "../thaihistory/news/kit";

// Lab: an elephant duel (ยุทธหัตถี) in house style v2 — one full-screen world, a moving camera, and one event
// schedule that drives both the picture and the sound. 1080×1920, 20 s.
export const YH_FRAMES = 600;
const W = 1080;
const G = 1000; // world ground line
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GREY = "#8c8781";
const GREY_D = "#6c6762";
const SIAM_RED = "#b3261e";
const BURMA_WHITE = "#e9e2cf";

// ---- the schedule (frames) ----
const HORN = 18;
const VOLLEY = 96; // arrows loosed
const ARROW_LAND = [124, 129, 134, 140];
const CHARGE = 118; // infantry battle cry
const TRUMPET = { siam: 196, burma: 230 };
const CLASH = 300; // the two elephants meet
const STRIKES = [332, 364, 396]; // ngao blows (sparks)
const DECISIVE = 414; // the decisive blow; the opposing banner falls
const CHEER = 446;
const GONG = 520;
const since = (f: number, list: number[]) => list.reduce((d, x) => (x <= f ? Math.min(d, f - x) : d), 1e9);

// ---- war elephant, side view facing right; walk cycle, ear flap, trunk raise (trumpet), rider with a ngao ----
const Elephant = ({ x, y, s, flip = false, walk = 0, trumpet = 0, swing = 0, cloth, trim, crown, frame, rider = true }: { x: number; y: number; s: number; flip?: boolean; walk?: number; trumpet?: number; swing?: number; cloth: string; trim: string; crown: string; frame: number; rider?: boolean }) => {
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

// Arrows on an arc from (x0) to (x1), launched at `at`, flight `dur` frames.
const Arrows = ({ frame, at, x0, x1, n, dir, seed }: { frame: number; at: number; x0: number; x1: number; n: number; dir: 1 | -1; seed: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = interpolate(frame, [at + i * 2, at + 30 + i * 2], [0, 1], clamp);
      if (t <= 0 || t >= 1) return null;
      const sx = x0 + ((i * 37 + seed) % 120) - 60;
      const ex = x1 + ((i * 53 + seed) % 260) - 130;
      const ax = sx + (ex - sx) * t;
      const ay = G - 60 - Math.sin(t * Math.PI) * 420;
      const ang = Math.atan2(-Math.cos(t * Math.PI) * 420 * Math.PI, (ex - sx)) * (180 / Math.PI);
      return (
        <g key={i} transform={`translate(${ax},${ay}) rotate(${ang})`}>
          <line x1={-26 * dir} y1={0} x2={26 * dir} y2={0} stroke="#3a2a1a" strokeWidth={3} />
          <path d={`M${26 * dir} 0 l${-8 * dir} -4 l0 8 Z`} fill="#cfd3d6" />
        </g>
      );
    })}
  </g>
);

const World = ({ frame }: { frame: number }) => {
  // the two great elephants close in, meet at CLASH, recoil a little on every blow
  const approach = interpolate(frame, [150, CLASH], [0, 1], { ...clamp, easing: (k) => k * k });
  const recoil = (side: 1 | -1) => STRIKES.reduce((r, f) => r + (frame >= f && frame < f + 12 ? Math.sin(((frame - f) / 12) * Math.PI) * 14 * side : 0), 0);
  const sx = 520 + approach * 390 + recoil(-1);
  const bx = 1880 - approach * 390 + recoil(1);
  const walking = frame >= 150 && frame < CLASH ? 1 : 0;
  const swingSiam = Math.max(0, ...[...STRIKES, DECISIVE].map((f) => (frame >= f - 10 && frame < f + 8 ? Math.sin(((frame - f + 10) / 18) * Math.PI) : 0)));
  const swingBurma = Math.max(0, ...STRIKES.map((f) => (frame >= f - 22 && frame < f - 6 ? Math.sin(((frame - f + 22) / 16) * Math.PI) : 0)));
  const tr = (f: number) => interpolate(frame, [f - 8, f, f + 40, f + 55], [0, 1, 1, 0], clamp);
  const fallen = interpolate(frame, [DECISIVE + 6, DECISIVE + 30], [0, 1], clamp);
  const infantry = interpolate(frame, [CHARGE, CHARGE + 200], [0, 1], clamp);
  return (
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
      {/* dust kicked up by the charge */}
      {Array.from({ length: 10 }, (_, i) => {
        const k = interpolate(frame, [150 + i * 12, 240 + i * 12], [0, 1], clamp) * (1 - interpolate(frame, [CLASH + 120, CLASH + 220], [0, 1], clamp));
        return <circle key={i} cx={900 + i * 60} cy={G - 40 - i * 4} r={60 + k * 60} fill="#d8b98a" opacity={0.35 * k} />;
      })}
      {/* two armies: lines of banners and infantry */}
      {Array.from({ length: 9 }, (_, i) => <Banner key={`sb${i}`} x={60 + i * 55} y={G + 10} s={1.4} color={i % 2 ? SIAM_RED : PAL.gilt} />)}
      {Array.from({ length: 9 }, (_, i) => {
        const fall = interpolate(frame, [DECISIVE + 10 + i * 4, DECISIVE + 30 + i * 4], [0, 80], clamp);
        return <g key={`bb${i}`} transform={`rotate(${fall},${1900 + i * 55},${G + 10})`}><Banner x={1900 + i * 55} y={G + 10} s={1.4} color={i % 2 ? BURMA_WHITE : "#7a2a22"} /></g>;
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <Fighter key={`si${i}`} x={140 + i * 46 + infantry * 260} y={G + 30 + (i % 2) * 16} scale={1.25} mode={frame > CHARGE ? (frame > CHEER ? "attack" : "run") : "stand"} costume={COSTUME.siam} phase={i} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <Fighter key={`bi${i}`} x={2260 - i * 46 - infantry * 220 * (1 - fallen * 0.6)} y={G + 30 + (i % 2) * 16} scale={1.25} flip mode={frame > CHARGE ? "run" : "stand"} costume={COSTUME.burma} phase={i + 0.5} />
      ))}
      {/* arrow volleys both ways */}
      <Arrows frame={frame} at={VOLLEY} x0={420} x1={1900} n={14} dir={1} seed={3} />
      <Arrows frame={frame} at={VOLLEY + 6} x0={2000} x1={500} n={14} dir={-1} seed={11} />
      {/* the duel */}
      <Elephant x={bx} y={G + 70} s={1.25} flip walk={walking} trumpet={tr(TRUMPET.burma)} swing={swingBurma} cloth={BURMA_WHITE} trim="#7a2a22" crown={PAL.gilt} frame={frame} rider={fallen < 0.5} />
      <Elephant x={sx} y={G + 80} s={1.3} walk={walking} trumpet={tr(TRUMPET.siam)} swing={swingSiam} cloth={SIAM_RED} trim={PAL.gilt} crown={PAL.gilt} frame={frame} />
      {/* sparks on each blow */}
      {[...STRIKES, DECISIVE].map((f) => {
        const k = frame - f;
        if (k < 0 || k > 10) return null;
        const cx = (sx + bx) / 2;
        return (
          <g key={f} transform={`translate(${cx},${G - 420})`} opacity={1 - k / 10}>
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i * 0.63) * (20 + k * 9)} y2={Math.sin(i * 0.63) * (20 + k * 9)} stroke="#ffe48a" strokeWidth={4} strokeLinecap="round" />)}
            <circle r={18 - k} fill="#fff6d0" />
          </g>
        );
      })}
    </g>
  );
};

export const Yutthahatthi = () => {
  const frame = useCurrentFrame();
  // camera: wide on both armies → push in on the elephants → tight on the duel → pull back for the cheer
  const cx = interpolate(frame, [0, 150, 300, 430, 600], [1200, 1200, 1200, 1200, 1100], clamp);
  const zoom = interpolate(frame, [0, 150, 290, 420, 470, 600], [0.6, 0.7, 1.12, 1.22, 0.78, 0.72], clamp);
  const cy = G - 330 / zoom; // keeps the elephants’ feet at ~2/3 of the screen at every zoom
  const blow = since(frame, [CLASH, ...STRIKES, DECISIVE]);
  const shake = blow < 10 ? (1 - blow / 10) * (frame >= DECISIVE ? 22 : 12) : 0;
  const flash = since(frame, [CLASH, DECISIVE]) < 6 ? 1 - since(frame, [CLASH, DECISIVE]) / 6 : 0;
  const titleK = interpolate(frame, [GONG + 4, GONG + 24], [0, 1], clamp);
  const g = { x: 0, y: 0, W, H: 1920, ground: 1920, cx: W / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      {/* sound — every entry is an event in the schedule above */}
      <Bed id="war_drums" from={0} to={GONG} volume={0.35} />
      <Bed id="wind" from={0} to={600} volume={0.15} />
      <Hit id="war_horn_drums" at={HORN} volume={0.45} />
      <Hit id="arrows_volley" at={VOLLEY} volume={0.55} />
      {ARROW_LAND.map((f) => <Hit key={f} id="arrow_hit" at={f} volume={0.25} />)}
      <Hit id="battle_cry" at={CHARGE} volume={0.55} />
      <Bed id="army_marching" from={CHARGE} to={CLASH + 40} volume={0.25} />
      <Hit id="elephant" at={TRUMPET.siam} volume={0.7} />
      <Hit id="elephant" at={TRUMPET.burma} volume={0.6} />
      <Hit id="explosion_far" at={CLASH} volume={0.45} />
      <Hit id="sword_clash" at={CLASH} volume={0.4} />
      {STRIKES.map((f, i) => (
        <Fragment key={f}>
          <Hit id="sword_swish" at={f - 4} volume={0.3} />
          <Hit id={i % 2 ? "sword_battle" : "sword_clash"} at={f} volume={0.6} />
        </Fragment>
      ))}
      <Hit id="sword_swish" at={DECISIVE - 4} volume={0.4} />
      <Hit id="sword_battle" at={DECISIVE} volume={0.8} />
      <Hit id="explosion_far" at={DECISIVE} volume={0.3} />
      <Hit id="crowd_cheer" at={CHEER} volume={0.55} />
      <Hit id="battle_cry" at={CHEER + 6} volume={0.4} />
      <Hit id="gong" at={GONG} volume={0.6} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <g transform={`translate(${W / 2 + Math.sin(frame * 2.3) * shake},${960 + Math.cos(frame * 3.1) * shake}) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
        </g>
        {/* foreground layer: dark spear-bearers and grass close to the camera (fastest parallax) */}
        <g opacity={0.92} filter="url(#fgblur)">
          <defs><filter id="fgblur"><feGaussianBlur stdDeviation={2.5} /></filter></defs>
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={((i * 230 - (cx - 1200) * 1.6 + 2400) % 1500) - 200} y={2010 + (i % 2) * 40} scale={3.4} flip={i % 2 === 1} mode="stand" costume={{ jacket: "#2a1d14", sash: "#3a2a1a", pants: "#1f1610", head: "short", skin: "#2a1d14" }} phase={i} />)}
          {Array.from({ length: 22 }, (_, i) => { const gx = ((i * 61 - (cx - 1200) * 1.6 + 3000) % 1300) - 100; return <path key={`g${i}`} d={`M${gx} 1920 q8 -70 22 -110 q-4 50 14 110 Z`} fill="#2f2a18" />; })}
        </g>
        <rect x={0} y={0} width={W} height={1920} fill="#ffb060" opacity={0.07} />
        <PaperGrain g={g} id="yh" />
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={flash * 0.5} />}
      </svg>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [GONG - 10, GONG], [1, 0], clamp) }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: PAL.gilt }}>ทดลองฉากรบโบราณ · สไตล์ v2</div>
        <div style={{ fontSize: 66, fontWeight: 900 }}>ช้างศึก <span style={{ color: "#ffb35c" }}>ปะทะ</span> ช้างศึก</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 56px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 110, fontWeight: 900 }}>ยุทธหัตถี</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>การรบบนหลังช้าง</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
