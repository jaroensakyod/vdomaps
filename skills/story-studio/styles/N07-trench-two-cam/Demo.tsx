import { loadFont } from "@remotion/google-fonts/Kanit";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COSTUME, Fighter, PAL } from "../../components/Scene";
import { Bed, bedFrom, Hit, levelAt, sfxInfo } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Battlefield, clamp, Explosion, GROUND, Plane, rnd, Sandbags, since, Tank, Tree, View, Wire } from "./kit/Trench";

// N07 trench, two cameras: one live WW1 side-view world (attackers from the left, the defenders' trench on the
// right) seen through two windows at once — a wide shot of the whole field (top) and a tight trench camera
// (bottom). Shell bursts, a machine gun whose tracers follow its recorded sound, rifles, a tank, biplanes. One event
// schedule drives picture and the recorded sound mix. 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N07", name: "สนามเพลาะสองกล้อง", frames: 600, cover: 425, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const sfxHit = (id: string) => sfxInfo(id)?.hit ?? 0;

// Shell bursts: [frame, world x, size].
const BLASTS: [number, number, number][] = [
  [20, 1500, 1], [45, 900, 1], [70, 1720, 1], [95, 1200, 1], [160, 700, 1], [230, 1420, 1.1],
  [300, 1640, 1], [345, 1770, 1.2], [400, 1100, 1], [465, 1700, 1.2], [490, 1860, 2.3],
];
const BIG = 490;

// One event schedule drives both picture and sound (SYNC RULE, references/sound.md).
const RIFLE: [number, number][] = [0, 1, 2, 3].flatMap((i) => Array.from({ length: 10 }, (_, k) => [140 + i * 11 + k * 40, i] as [number, number])).filter(([f]) => f < 520);
const MG_PLAYS = [150, 390];
// The gun is firing whenever its sound is in a loud burst; a round is drawn every 2 frames inside a burst.
const mgFiring = (f: number) => MG_PLAYS.some((s) => levelAt("mg_ww1", s, f) > 0.6);
const MG_SHOTS = Array.from({ length: 600 }, (_, f) => f).filter((f) => f % 2 === 0 && mgFiring(f));
const TANK_GUN = [330, 450];
const PLANE1_CROSS = 283; // p1 passes the middle of the wide shot
const PLANE2_CROSS = 491;

// The whole live world at this frame (every camera window renders it).
const World = ({ frame }: { frame: number }) => {
  // attackers climb out of their trench, run, and stop at the wire
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
      <Battlefield frame={frame} />
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
      <Tank x={tankX} frame={frame} gunAt={TANK_GUN} />
      {men.filter((m) => frame >= m.start).map((m) => (
        <Fighter key={m.i} x={m.x} y={m.y} scale={m.sc} mode={m.at ? "attack" : "run"} costume={COSTUME.ww1khaki} weapon="rifle" phase={m.i * 1.7} />
      ))}
      {BLASTS.map(([f, x, size]) => <Explosion key={f} x={x} size={size} age={frame - f} />)}
      {/* defenders' trench (right): riflemen behind a sandbag parapet, machine gun, tracers */}
      {[1920, 2010, 2100, 2190].map((x, i) => {
        const d = since(RIFLE.filter(([, who]) => who === i).map(([f]) => f), frame);
        return <Fighter key={i} x={x} y={GROUND + 52} scale={1.6} flip mode="aim" costume={COSTUME.ww1grey} weapon="rifle" phase={i} flash={d < 4 ? 1 - d / 4 : 0} />;
      })}
      <Sandbags x={1830} />
      <g transform={`translate(1880,${GROUND - 78})`}>
        <path d="M-10 0 L-30 40 M10 0 L30 40" stroke="#2a2a2a" strokeWidth={6} />
        <rect x={-60} y={-22} width={90} height={24} rx={6} fill="#3a3e36" stroke={PAL.ink} strokeWidth={3} />
        <rect x={-110} y={-15} width={54} height={8} fill="#2a2a2a" />
        {since(MG_SHOTS, frame) < 2 && <circle cx={-116} cy={-11} r={16} fill="#ffd25a" opacity={0.9} />}
      </g>
      {MG_SHOTS.filter((b) => b <= frame && frame - b < 14).map((born, k) => {
        const d = (frame - born) * 70;
        const tx = 1770 - d;
        const ty = GROUND - 89 + (rnd(born) - 0.5) * 30 + d * 0.02;
        return tx > 300 ? <line key={k} x1={tx} y1={ty} x2={tx + 46} y2={ty - 1} stroke="#ffe08a" strokeWidth={3.5} strokeLinecap="round" opacity={0.9} /> : null;
      })}
    </g>
  );
};

export const Demo = () => {
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
      <Bed id="explosions_distant" from={0} to={600} volume={0.3} />
      <Bed id="wind" from={0} to={600} volume={0.16} />
      {BLASTS.map(([f, x, size]) => (
        <Fragment key={f}>
          {f > 30 && <Hit id="shell_incoming" at={f} volume={0.35} />}
          <Hit id={size > 2 ? "explosion_big" : x < 1000 ? "explosion_far" : "explosion_mid"} at={f} volume={size > 2 ? 0.95 : x < 1000 ? 0.5 : 0.7} />
        </Fragment>
      ))}
      <Hit id="explosion_debris" at={BIG + 6} volume={0.5} />
      <Hit id="whistle_officer" at={98} volume={0.6} />
      <Hit id="battle_cry" at={112} volume={0.6} />
      {MG_PLAYS.map((s) => <Hit key={s} id="mg_ww1" at={s + sfxHit("mg_ww1")} volume={0.42} />)}
      {RIFLE.map(([f, i], k) => <Hit key={f} id={k % 3 === 2 ? "rifle_echo" : "rifle_ww1"} at={f} volume={0.18 + (i % 2) * 0.08} />)}
      <Bed id="tank_move" from={190} to={560} volume={0.4} />
      {TANK_GUN.map((f) => <Hit key={f} id="cannon" at={f} volume={0.6} />)}
      <Bed id="plane_vintage" from={bedFrom("plane_vintage", PLANE1_CROSS)} to={440} volume={0.45} />
      <Bed id="plane_prop_loop" from={bedFrom("plane_prop_loop", PLANE2_CROSS)} to={600} volume={0.3} />
      <Hit id="war_horn_drums" at={515} volume={0.5} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <View id="wide" x={30} y={190} w={W - 60} h={760} cx={wideX} cy={830} zoom={wideZ} shake={hit * 4} label="สมรภูมิ" font={font}>
          <World frame={frame} />
        </View>
        <View id="trench" x={30} y={980} w={W - 60} h={820} cx={camX} cy={GROUND - 150} zoom={camZ} shake={hit * 9 + big * 18} label="ในสนามเพลาะ" font={font}>
          <World frame={frame} />
        </View>
        {big > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={big * 0.7} />}
      </svg>
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff" }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: PAL.gilt }}>N07 · สนามเพลาะสองกล้อง</div>
        <div style={{ fontSize: 64, fontWeight: 900 }}>บุก <span style={{ color: "#ffb35c" }}>ปะทะ</span> ตั้งรับ</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 50px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 92, fontWeight: 900 }}>สงครามสนามเพลาะ</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>บุกข้ามแดนกลาง · ภาพประกอบ</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
