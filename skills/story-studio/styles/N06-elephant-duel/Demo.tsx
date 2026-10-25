import { Fragment } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Age, Arrows, Banner, BURMA, clamp, Dust, Elephant, Flare, fonts, G, M, Rock, SIAM, Soldier, Tree, WallPaint } from "./kit/Mural";

// N06 elephant duel as a Thai temple mural: the whole battle is painted along one long wall and the camera
// dollies along it. Two armies, arrow volleys, the charge, the two war elephants meeting head-on, ngao blows
// with gold flame-bursts, the enemy banners fall, cheer, title. One event schedule drives picture and sound.
// 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N06", name: "จิตรกรรมฝาผนังยุทธหัตถี", frames: 600, cover: 300, sizes: ["9x16"] };

const W = 1080;

// ---- the schedule (frames) ----
const HORN = 18;
const VOLLEY = 96;
const ARROW_LAND = [124, 129, 134, 140];
const CHARGE = 118;
const TRUMPET = { siam: 196, burma: 230 };
const CLASH = 300;
const STRIKES = [332, 364, 396];
const DECISIVE = 414;
const CHEER = 446;
const GONG = 520;
const since = (f: number, list: number[]) => Math.min(...list.map((e) => (f >= e ? f - e : 999)));
const ease = { ...clamp, easing: Easing.inOut(Easing.sin) };

const World = ({ frame }: { frame: number }) => {
  const approach = interpolate(frame, [150, CLASH], [0, 1], { ...clamp, easing: (k) => k * k });
  const recoil = (side: 1 | -1) => STRIKES.reduce((r, f) => r + (frame >= f && frame < f + 12 ? Math.sin(((frame - f) / 12) * Math.PI) * 14 * side : 0), 0);
  const sx = 880 + approach * 420 + recoil(-1);
  const bx = 2320 - approach * 420 + recoil(1);
  const walking = frame >= 150 && frame < CLASH ? 1 : 0;
  const swingSiam = Math.max(0, ...[...STRIKES, DECISIVE].map((f) => (frame >= f - 10 && frame < f + 8 ? Math.sin(((frame - f + 10) / 18) * Math.PI) : 0)));
  const swingBurma = Math.max(0, ...STRIKES.map((f) => (frame >= f - 22 && frame < f - 6 ? Math.sin(((frame - f + 22) / 16) * Math.PI) : 0)));
  const tr = (f: number) => interpolate(frame, [f - 8, f, f + 40, f + 55], [0, 1, 1, 0], clamp);
  const fallen = interpolate(frame, [DECISIVE + 6, DECISIVE + 30], [0, 1], clamp);
  const adv = interpolate(frame, [CHARGE, CHARGE + 200], [0, 1], clamp);
  const dust = (i: number) => interpolate(frame, [150 + i * 12, 240 + i * 12], [0, 1], clamp) * (1 - interpolate(frame, [CLASH + 120, CLASH + 220], [0, 1], clamp));
  const blow = since(frame, [CLASH, ...STRIKES, DECISIVE]);
  return (
    <WallPaint>
      {/* far rocks and trees (higher on the wall = further away) */}
      <Rock x={-120} y={G - 20} s={1.7} />
      <Rock x={3320} y={G - 20} s={1.7} color="#5a6f8a" dark={M.indigo} />
      <Rock x={1600} y={860} s={1.0} color="#5a6f8a" dark={M.indigo} />
      <Rock x={420} y={860} s={0.8} />
      <Rock x={2780} y={860} s={0.8} />
      <Tree x={1020} y={880} s={0.9} />
      <Tree x={2200} y={880} s={0.9} />
      <Tree x={150} y={1060} s={1.1} />
      <Tree x={3080} y={1060} s={1.1} />
      {/* banners: Siam left stand, the other side's fall after the decisive blow */}
      {Array.from({ length: 8 }, (_, i) => <Banner key={`sb${i}`} x={250 + i * 82} y={1000} s={0.9} color={i % 2 ? M.red : M.gold} t={frame} />)}
      {Array.from({ length: 8 }, (_, i) => <Banner key={`bb${i}`} x={2380 + i * 82} y={1000} s={0.9} color={i % 2 ? M.white : M.indigo} t={frame} fall={interpolate(frame, [DECISIVE + 10 + i * 4, DECISIVE + 30 + i * 4], [0, 78], clamp)} />)}
      {/* two rows of infantry each side */}
      {Array.from({ length: 8 }, (_, i) => <Soldier key={`sa${i}`} x={280 + i * 86 + adv * 380} y={1100} s={0.85} side={SIAM} t={frame + i * 5} run={frame > CHARGE && frame < CHEER} />)}
      {Array.from({ length: 8 }, (_, i) => <Soldier key={`ba${i}`} x={2920 - i * 86 - adv * 360 * (1 - fallen * 0.4)} y={1100} s={0.85} side={BURMA} flip t={frame + i * 5} run={frame > CHARGE} />)}
      <Arrows frame={frame} at={VOLLEY} x0={700} x1={2500} y={1000} n={14} seed={3} />
      <Arrows frame={frame} at={VOLLEY + 6} x0={2500} x1={700} y={980} n={14} seed={11} />
      {Array.from({ length: 7 }, (_, i) => <Soldier key={`sb${i}`} x={160 + i * 100 + adv * 340} y={1290} s={1.0} side={SIAM} t={frame + i * 7} run={frame > CHARGE && frame < CHEER} />)}
      {Array.from({ length: 7 }, (_, i) => <Soldier key={`bb2${i}`} x={3040 - i * 100 - adv * 320 * (1 - fallen * 0.4)} y={1290} s={1.0} side={BURMA} flip t={frame + i * 7} run={frame > CHARGE} fallen={i < 3 ? fallen * (i % 2 ? 1 : 0) : 0} />)}
      {/* the duel */}
      {Array.from({ length: 8 }, (_, i) => <Dust key={`d${i}`} x={i < 4 ? sx - 150 + i * 50 : bx + 150 - (i - 4) * 50} y={G + 10} k={dust(i)} />)}
      <Elephant x={bx} y={G} s={0.95} flip hide={M.hideB} cloth={M.indigo} walk={walking} trumpet={tr(TRUMPET.burma)} swing={swingBurma} t={frame} rider={fallen < 0.5} />
      <Elephant x={sx} y={G + 20} s={1.0} hide={M.hideA} cloth={M.red} walk={walking} trumpet={tr(TRUMPET.siam)} swing={swingSiam} t={frame} />
      {blow < 24 && <Flare x={(sx + bx) / 2} y={G - 470} k={blow / 24} s={frame >= DECISIVE ? 1.4 : 1} />}
    </WallPaint>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  // the dolly: along the Siam line → in on the duel → back along the fallen banners → the whole wall for the title
  const cx = interpolate(frame, [0, 120, 230, 300, 430, 500, 560, 600], [760, 900, 1180, 1600, 1600, 2060, 1600, 1600], ease);
  const zoom = interpolate(frame, [0, 150, 290, 420, 470, 560, 600], [1.0, 1.0, 1.12, 1.2, 1.0, 0.94, 0.94], ease);
  const cy = interpolate(zoom, [0.94, 1.2], [960, 1060]);
  const blow = since(frame, [CLASH, ...STRIKES, DECISIVE]);
  const shake = blow < 10 ? (1 - blow / 10) * (frame >= DECISIVE ? 12 : 6) : 0;
  const fl = since(frame, [CLASH, DECISIVE]);
  const flash = fl < 8 ? 1 - fl / 8 : 0;
  const titleK = interpolate(frame, [GONG + 4, GONG + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lines: [string, number, number][] = [
    ["สองทัพตั้งประจัญ ลูกเกาทัณฑ์ข้ามทุ่ง", 10, 190],
    ["ช้างทรงสองเชือก วิ่งเข้าหากัน", 196, 324],
    ["ฟันของ้าว ตัดสินศึกกลางหลังช้าง", 330, GONG - 8],
  ];
  return (
    <AbsoluteFill style={{ background: M.plaster }}>
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
        <g transform={`translate(${W / 2 + Math.sin(frame * 2.3) * shake},${960 + Math.cos(frame * 3.1) * shake * 0.5}) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
          <Age />
        </g>
        {/* lamp light falling on the wall from the left, darker corners */}
        <defs>
          <radialGradient id="n06-lamp" cx="0.35" cy="0.45" r="0.85">
            <stop offset="0" stopColor="#fff2d0" stopOpacity={0.14} />
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#1a0c04" stopOpacity={0.45} />
          </radialGradient>
        </defs>
        <rect width={W} height={1920} fill="url(#n06-lamp)" />
        {flash > 0 && <rect width={W} height={1920} fill="#f3d68a" opacity={flash * 0.35} />}
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", color: M.white, opacity: interpolate(frame, [0, 15, GONG - 10, GONG], [0, 1, 1, 0], clamp) }}>
        <div style={{ fontFamily: fonts.text, fontWeight: 700, fontSize: 38, letterSpacing: 2, color: M.goldLight }}>N06 · จิตรกรรมฝาผนังยุทธหัตถี</div>
        <div style={{ fontFamily: fonts.deco, fontSize: 92, lineHeight: 1.35, textShadow: "0 3px 0 #0c0e18" }}>
          ช้างศึก <span style={{ color: M.goldLight }}>ปะทะ</span> ช้างศึก
        </div>
      </div>
      {lines.map(([text, a, b]) => {
        const k = interpolate(frame, [a, a + 10, b - 8, b], [0, 1, 1, 0], clamp);
        return k > 0 ? (
          <div key={text} style={{ position: "absolute", left: 40, right: 40, top: 1700, textAlign: "center", opacity: k, fontFamily: fonts.text, fontWeight: 700, fontSize: 60, color: M.white, textShadow: "0 3px 0 #4a160e" }}>
            {text}
          </div>
        ) : null;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1846, textAlign: "center", fontFamily: fonts.text, fontSize: 28, color: M.goldLight, opacity: 0.9 }}>ภาพประกอบ · วาดเลียนแบบจิตรกรรมไทย</div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scaleX(${0.2 + titleK * 0.8})`, opacity: titleK, background: M.red, border: `6px double ${M.goldLight}`, outline: `3px solid ${M.ink}`, borderRadius: "48% 48% 12px 12px / 30% 30% 12px 12px", padding: "60px 70px 30px", textAlign: "center", boxShadow: "0 10px 30px rgba(30,10,4,0.5)" }}>
            <div style={{ fontFamily: fonts.deco, fontSize: 126, color: M.goldLight, lineHeight: 1.3 }}>ยุทธหัตถี</div>
            <div style={{ fontFamily: fonts.text, fontWeight: 700, fontSize: 46, color: M.white }}>ชนช้างตัดสินศึก</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
