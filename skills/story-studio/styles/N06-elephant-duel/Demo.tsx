import { loadFont } from "@remotion/google-fonts/Kanit";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { Banner, COSTUME, Fighter, PAL, PaperGrain } from "../../components/Scene";
import { Bed, Hit } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Arrows, BURMA_WHITE, clamp, DustPuffs, Elephant, FallingBanner, Field, G, SIAM_RED, since, Sparks } from "./kit/Duel";

// N06 elephant duel: two armies, arrow volleys, the charge, two war elephants meeting head-on, ngao blows with
// sparks and shake, the enemy banners fall, cheer, title. One full-screen world under one moving camera; one event
// schedule drives picture and sound. 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N06", name: "ยุทธหัตถี", frames: 600, cover: 352, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;

// ---- the schedule (frames) ----
const HORN = 18;
const VOLLEY = 96; // arrows loosed
const ARROW_LAND = [124, 129, 134, 140];
const CHARGE = 118; // infantry battle cry
const TRUMPET = { siam: 196, burma: 230 };
const CLASH = 300; // the two elephants meet
const STRIKES = [332, 364, 396]; // ngao blows (sparks)
const DECISIVE = 414; // the decisive blow; the opposing banners fall
const CHEER = 446;
const GONG = 520;

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
  const dust = Array.from({ length: 10 }, (_, i) => interpolate(frame, [150 + i * 12, 240 + i * 12], [0, 1], clamp) * (1 - interpolate(frame, [CLASH + 120, CLASH + 220], [0, 1], clamp)));
  return (
    <g>
      <Field />
      <DustPuffs ks={dust} />
      {/* two armies: lines of banners and infantry */}
      {Array.from({ length: 9 }, (_, i) => <Banner key={`sb${i}`} x={60 + i * 55} y={G + 10} s={1.4} color={i % 2 ? SIAM_RED : PAL.gilt} />)}
      {Array.from({ length: 9 }, (_, i) => <FallingBanner key={`bb${i}`} x={1900 + i * 55} y={G + 10} s={1.4} color={i % 2 ? BURMA_WHITE : "#7a2a22"} fall={interpolate(frame, [DECISIVE + 10 + i * 4, DECISIVE + 30 + i * 4], [0, 80], clamp)} />)}
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
      <Sparks frame={frame} blows={[...STRIKES, DECISIVE]} x={(sx + bx) / 2} y={G - 420} />
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  // camera: wide on both armies → push in on the elephants → tight on the duel → pull back for the cheer
  const cx = interpolate(frame, [0, 430, 600], [1200, 1200, 1100], clamp);
  const zoom = interpolate(frame, [0, 150, 290, 420, 470, 600], [0.6, 0.7, 1.12, 1.22, 0.78, 0.72], clamp);
  const cy = G - 330 / zoom; // keeps the elephants' feet at ~2/3 of the screen at every zoom
  const blow = since(frame, [CLASH, ...STRIKES, DECISIVE]);
  const shake = blow < 10 ? (1 - blow / 10) * (frame >= DECISIVE ? 22 : 12) : 0;
  const fl = since(frame, [CLASH, DECISIVE]);
  const flash = fl < 6 ? 1 - fl / 6 : 0;
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
        <defs><filter id="yh-fgblur"><feGaussianBlur stdDeviation={2.5} /></filter></defs>
        <g opacity={0.92} filter="url(#yh-fgblur)">
          {Array.from({ length: 6 }, (_, i) => <Fighter key={i} x={((i * 230 - (cx - 1200) * 1.6 + 2400) % 1500) - 200} y={2010 + (i % 2) * 40} scale={3.4} flip={i % 2 === 1} mode="stand" costume={{ jacket: "#2a1d14", sash: "#3a2a1a", pants: "#1f1610", head: "short", skin: "#2a1d14" }} phase={i} />)}
          {Array.from({ length: 22 }, (_, i) => { const gx = ((i * 61 - (cx - 1200) * 1.6 + 3000) % 1300) - 100; return <path key={`g${i}`} d={`M${gx} 1920 q8 -70 22 -110 q-4 50 14 110 Z`} fill="#2f2a18" />; })}
        </g>
        <rect x={0} y={0} width={W} height={1920} fill="#ffb060" opacity={0.07} />
        <PaperGrain g={g} id="yh" />
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={flash * 0.5} />}
      </svg>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [0, 15, GONG - 10, GONG], [0, 1, 1, 0], clamp) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: PAL.gilt }}>N06 · ยุทธหัตถี</div>
        <div style={{ fontSize: 66, fontWeight: 900 }}>ช้างศึก <span style={{ color: "#ffb35c" }}>ปะทะ</span> ช้างศึก</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 56px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 110, fontWeight: 900 }}>ยุทธหัตถี</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>ชนช้างตัดสินศึก</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
