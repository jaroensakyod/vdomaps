import { loadFont } from "@remotion/google-fonts/Chonburi";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, bedFrom, Hit, levelAt, sfxInfo } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Burst, clamp, Field, GROUND, INK, LithoDefs, Panel, Paper, Plane, rnd, Sandbags, since, Soldier, Stump, Tank, twos, Wire } from "./kit/Litho";

// N07 trench, two cameras — as a WW1-era lithograph war poster. One live side-view world (attackers from the left,
// the defenders' trench on the right) printed in three flat inks on off-white stone paper and seen through two
// slanted poster panels at once: the whole field (top) and a tight trench camera (bottom). Shell bursts, a machine
// gun whose tracers follow its recorded sound, rifles, a tank, biplanes. Picture steps on twos; one event schedule
// drives picture and the recorded sound mix. 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N07", name: "สนามเพลาะสองกล้อง", frames: 600, cover: 425, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
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
const PLANE1_CROSS = 283;
const PLANE2_CROSS = 491;

// Page layout: two slanted panels with a diagonal paper gap between them (the poster's main diagonal).
const TOP: [number, number][] = [[40, 360], [1040, 320], [1040, 930], [40, 1030]];
const BOT: [number, number][] = [[40, 1080], [1040, 980], [1040, 1760], [40, 1760]];

// The whole live world at this frame (every panel prints it).
const World = ({ frame }: { frame: number }) => {
  const men = Array.from({ length: 20 }, (_, i) => {
    const start = 110 + (i % 5) * 8 + Math.floor(i / 5) * 22;
    const v = 3.6 * (0.85 + rnd(i) * 0.35);
    const stop = 1470 + (i % 5) * 26;
    const x = Math.min(170 + (i % 3) * 30 + Math.max(0, frame - start) * v, stop);
    const climb = interpolate(frame, [start, start + 12], [70, 0], clamp);
    return { i, start, x, y: GROUND + 14 + (i % 3) * 16 + climb - x * 0.012, at: x >= stop, sc: 1.95 + (i % 3) * 0.12 };
  });
  const tankX = interpolate(frame, [190, 560], [-260, 1320], clamp);
  const p1 = interpolate(frame, [140, 430], [-300, 2700], clamp);
  const p2 = interpolate(frame, [380, 600], [2700, -300], clamp);
  return (
    <g>
      <Field frame={frame} />
      <Stump x={520} h={230} lean={-8} />
      <Stump x={1180} h={180} lean={10} />
      <Stump x={2400} h={260} lean={-4} />
      {/* attackers' trench lip (left) */}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={20 + i * 36} y={GROUND} width={32} height={20} rx={9} fill={INK.khaki} />)}
      <Wire x0={1380} x1={1660} />
      <Plane x={p1} y={330 + Math.sin(frame * 0.05) * 60} flip={false} frame={frame} mark="cross" />
      <Plane x={p1 - 330} y={380 + Math.sin(frame * 0.05 + 1) * 60} flip={false} frame={frame} mark="roundel" />
      {frame >= 140 && frame < 430 && Array.from({ length: 4 }, (_, i) => ((frame + i * 3) % 12 < 6 ? <line key={i} x1={p1 - 200 + i * 40} y1={380} x2={p1 - 160 + i * 40} y2={356} stroke={INK.brick} strokeWidth={6} /> : null))}
      <Plane x={p2} y={260} flip frame={frame} mark="roundel" />
      <Tank x={tankX} frame={frame} gunAt={TANK_GUN} />
      {men.filter((m) => frame >= m.start).map((m) => (
        <Soldier key={m.i} x={m.x} y={m.y} s={m.sc} pose={m.at ? "stand" : "run"} phase={m.i * 0.7} frame={frame} fill={INK.khaki} helmet={INK.black} />
      ))}
      {BLASTS.map(([f, x, size]) => <Burst key={f} x={x} size={size} age={frame - f} />)}
      {/* defenders' trench (right): black riflemen behind a khaki parapet, a machine gun, brick tracers */}
      {[1920, 2035, 2150, 2265].map((x, i) => {
        const d = since(RIFLE.filter(([, who]) => who === i).map(([f]) => f), frame);
        return <Soldier key={i} x={x} y={GROUND - 30} s={2.1} flip pose="aim" frame={frame} fill={INK.black} helmet={INK.khakiLt} flash={d < 4 ? 1 - d / 4 : 0} />;
      })}
      <Sandbags x={1830} />
      <g transform={`translate(1880,${GROUND - 98})`}>
        <path d="M-10 0 L-34 44 M10 0 L34 44" stroke={INK.black} strokeWidth={8} />
        <rect x={-70} y={-26} width={104} height={30} fill={INK.black} />
        <rect x={-130} y={-17} width={64} height={11} fill={INK.black} />
        {since(MG_SHOTS, frame) < 2 && <polygon points="-130,-12 -190,-44 -172,-12 -196,20 -150,-4" fill={INK.brick} />}
      </g>
      {MG_SHOTS.filter((b) => b <= frame && frame - b < 14).map((born, k) => {
        const d = (frame - born) * 70;
        const tx = 1750 - d;
        const ty = GROUND - 109 + (rnd(born) - 0.5) * 30 + d * 0.03;
        return tx > 300 ? <line key={k} x1={tx} y1={ty} x2={tx + 60} y2={ty - 2} stroke={INK.brick} strokeWidth={6} /> : null;
      })}
    </g>
  );
};

// A printed label block: flat ink rectangle, paper-coloured poster type.
const Tag = ({ x, y, text, bg, color, size = 40, rot = 0 }: { x: number; y: number; text: string; bg: string; color: string; size?: number; rot?: number }) => {
  const w = text.length * size * 0.62 + 50;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <rect x={0} y={-size * 1.05} width={w} height={size * 1.55} fill={bg} />
      <text x={25} y={size * 0.12} fontFamily={font} fontSize={size} fill={color}>{text}</text>
    </g>
  );
};

export const Demo = () => {
  const real = useCurrentFrame();
  const frame = twos(real); // the picture steps on twos; sound keeps the real frame
  const hit = Math.max(0, ...BLASTS.map(([f, , size]) => (frame >= f && frame < f + 10 ? (1 - (frame - f) / 10) * size : 0)));
  const big = frame >= BIG && frame < BIG + 14 ? 1 - (frame - BIG) / 14 : 0;
  const camX = interpolate(frame, [0, 200, 300, 420, 470], [2040, 2040, 1720, 1640, 1960], clamp);
  const camZ = interpolate(frame, [0, 470, 600], [1.35, 1.45, 1.6], clamp);
  const wideZ = interpolate(frame, [0, 600], [0.56, 0.62], clamp);
  const wideX = interpolate(frame, [0, 110, 330, 480, 600], [1000, 800, 1250, 1600, 1700], clamp);
  const titleK = interpolate(frame, [515, 535], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: INK.paper }}>
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
        <LithoDefs />
        <Paper w={W} h={1920} />
        {/* masthead: kicker on a black rule, the headline set on the poster's diagonal */}
        <g filter="url(#crayonT)">
          <rect x={40} y={48} width={1000} height={12} fill={INK.black} />
          <text x={540} y={112} textAnchor="middle" fontFamily={font} fontSize={38} fill={INK.brick} letterSpacing={6}>N07 · สนามเพลาะสองกล้อง</text>
          <g transform="translate(540,262) rotate(-2.3)">
            <text x={0} y={0} textAnchor="middle" fontFamily={font} fontSize={138} fill={INK.black}>
              บุก <tspan fill={INK.brick}>ปะทะ</tspan> ตั้งรับ
            </text>
          </g>
        </g>
        <Panel id="wide" poly={TOP} cx={wideX} cy={770} zoom={wideZ} shake={hit * 4}>
          <World frame={frame} />
        </Panel>
        <Panel id="trench" poly={BOT} cx={camX} cy={GROUND - 180} zoom={camZ} shake={hit * 9 + big * 18}>
          <World frame={frame} />
        </Panel>
        <g filter="url(#crayonT)">
          <Tag x={40} y={388} text="สมรภูมิ" bg={INK.brick} color={INK.paper} size={40} />
          <Tag x={40} y={1108} text="ในสนามเพลาะ" bg={INK.black} color={INK.paper} size={40} />
          {/* footer: honest label printed like a poster imprint */}
          <rect x={40} y={1790} width={1000} height={12} fill={INK.black} />
          <text x={40} y={1868} fontFamily={font} fontSize={44} fill={INK.black}>แนวรบด้านตะวันตก</text>
          <text x={1040} y={1868} textAnchor="end" fontFamily={font} fontSize={34} fill={INK.brick}>ภาพประกอบ</text>
        </g>
        {big > 0 && <rect x={0} y={0} width={W} height={1920} fill={INK.brick} opacity={big * 0.55} style={{ mixBlendMode: "multiply" }} />}
        {/* end card: a brick band slammed across the page on the diagonal */}
        {titleK > 0 && (
          <g filter="url(#crayonT)" opacity={titleK}>
            <g transform={`translate(540,960) rotate(-6) scale(${0.9 + titleK * 0.1})`}>
              <rect x={-700} y={-170} width={1400} height={330} fill={INK.brick} />
              <rect x={-700} y={40} width={1400} height={120} fill={INK.black} />
              <text x={0} y={-40} textAnchor="middle" fontFamily={font} fontSize={100} fill={INK.paper}>สงครามสนามเพลาะ</text>
              <text x={0} y={116} textAnchor="middle" fontFamily={font} fontSize={44} fill={INK.paper}>บุกข้ามแดนกลาง · ภาพประกอบ</text>
            </g>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
