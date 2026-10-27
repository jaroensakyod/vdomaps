import { Easing, interpolate, useCurrentFrame } from "remotion";
import type { Pose } from "../../../components/Flow25D";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { clamp, view } from "../news/kit";
import { CityDot } from "../ep05/beatsKit";
import { Battle } from "../ep06/mapkit";
import { B, BEATS, GOLD, RED, wp, type Chapter10 } from "./beatsKit";
import { Bed, Hit, SFX } from "./mix";
import { OLD, PL, VW } from "./places";
import { FlowFull, FlowPanel } from "./flowscene";

// Episode 10: ยุทธหัตถีเกิดที่ไหนกันแน่ — two "Don Chedi"s, three candidate sites, five accounts.

const LAST = BEATS[BEATS.length - 1];
export const E10_END = LAST.end + 45;

// ---------------- 0 · hook ----------------

// Cut-out moves for the duel still (parts from `npm run flow-parts`, see flow/ep10/duel-parts.json). Every action is
// anticipation → action → impact → follow-through: the elephants walk in (legs stepping, bodies bobbing on the
// step), lean back a beat before the clash, lunge, and the gold side keeps driving while the red side rears; the
// king winds up, the glaive comes down fast (motion blur from its speed) and overshoots; riders, trunk and parasols
// lag behind the bodies they ride on.
const ease = (f: number, a: number, b: number, from: number, to: number, e = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [from, to], { ...clamp, easing: e });
// a decaying wobble after frame a (follow-through), amplitude k degrees/px
const wobble = (f: number, a: number, k: number, rate = 0.45, decay = 14) => (f >= a ? Math.sin((f - a) * rate) * Math.exp(-(f - a) / decay) * k : 0);
const step = (f: number, phase = 0) => Math.sin(f * 0.17 + phase); // walk cycle, ~1.2 s
const glaiveAngle = (f: number) => {
  const { strike } = T0;
  // arm + glaive about the shoulder: slow wind-up back, a fast cut down, a small overshoot, then half-way back
  return ease(f, 8, strike - 10, 0, -14) + ease(f, strike - 10, strike - 3, 0, 40, Easing.in(Easing.quad)) - wobble(f, strike - 3, 5, 0.6, 8) + ease(f, strike + 14, strike + 60, 0, -16);
};
const duelPose = (part: string, f: number): Pose => {
  const { clash, strike } = T0;
  const walking = f < clash ? 1 : f < strike ? 0.25 : 0.15;
  switch (part) {
    case "elephantL":
      return {
        dx: ease(f, 0, clash - 6, -40, -6) + ease(f, clash - 6, clash, 0, 12, Easing.in(Easing.quad)) + ease(f, clash + 4, strike + 40, 0, 14),
        dy: -Math.abs(step(f)) * 5 * walking,
        rotate: ease(f, clash - 12, clash - 4, 0, 1.2) + ease(f, clash - 4, clash + 2, 0, -3) + wobble(f, clash + 2, 1.2) + ease(f, clash + 10, strike, 0, 1.4),
      };
    case "legFL":
      return { rotate: step(f) * 11 * walking + ease(f, clash - 4, clash + 4, 0, -6) + ease(f, clash + 4, clash + 30, 0, 6) };
    case "headL":
      return { rotate: Math.sin(f * 0.11) * 1.5 + ease(f, clash - 5, clash, 0, -7, Easing.in(Easing.quad)) + wobble(f, clash, 3) + ease(f, clash + 6, clash + 30, 0, 5) };
    case "trunkL":
      return { rotate: Math.sin(f * 0.13) * 6 - wobble(f, clash, 14, 0.35, 18) };
    case "kingL":
      return { rotate: step(f, 0.6) * 1.2 * walking + ease(f, 8, strike - 10, 0, -5) + ease(f, strike - 10, strike - 2, 0, 9, Easing.in(Easing.quad)) + ease(f, strike + 10, strike + 50, 0, -4) - wobble(f, clash, 3) };
    case "glaive": {
      const a = glaiveAngle(f);
      return { rotate: a, blur: Math.abs(a - glaiveAngle(f - 1)) * 0.5 };
    }
    case "parasolW":
      return { rotate: Math.sin(f * 0.07) * 2 - step(f - 3) * 1.5 * walking + wobble(f, clash + 2, 6, 0.35, 18) };
    case "elephantR":
      return {
        dx: ease(f, 0, clash - 6, 40, 6) + ease(f, clash - 6, clash, 0, -10, Easing.in(Easing.quad)) + ease(f, clash, clash + 12, 0, 12) + ease(f, strike, strike + 30, 0, 22),
        dy: -Math.abs(step(f, 1.4)) * 5 * walking - ease(f, strike, strike + 24, 0, 10),
        rotate: ease(f, clash, clash + 10, 0, 1.6) + wobble(f, clash, 1) + ease(f, strike, strike + 26, 0, 5.5, Easing.out(Easing.cubic)),
      };
    case "legFR":
      return { rotate: step(f, 1.4) * 11 * walking + ease(f, strike, strike + 22, 0, -16) };
    case "riderR":
      return { rotate: step(f, 2) * 1.2 * walking - wobble(f, clash, 5) - ease(f, strike - 2, strike + 6, 0, 9) + ease(f, strike + 10, strike + 50, 0, 6), dx: ease(f, strike - 2, strike + 8, 0, 6) };
    case "mahoutR":
      return { rotate: step(f, 2.4) * 1.5 * walking - wobble(f, clash, 6) - wobble(f, strike, 6) };
    case "parasolR":
      return { rotate: Math.sin(f * 0.07 + 2) * 2 - step(f - 3, 1.4) * 1.5 * walking - wobble(f, clash + 2, 6, 0.35, 18) + ease(f, strike + 4, strike + 30, 0, 6) };
    case "soldiersL":
      return { dx: f * 0.28, dy: -Math.abs(Math.sin(f * 0.24)) * 7, rotate: Math.sin(f * 0.24) * 1.2 };
    case "soldiersR":
      return { dx: -f * 0.22, dy: -Math.abs(Math.sin(f * 0.24 + 1.3)) * 6, rotate: Math.sin(f * 0.24 + 1.3) * -1.2 };
    default:
      return {};
  }
};
const T0 = {
  clash: 20,
  strike: 74,
  famous: B.famous.start,
  battle: wp("famous", "คือศึก", 0.3),
  book: wp("famous", "แบบเรียน", 0.65),
  film: wp("famous", "ในหนัง", 0.8),
  note: wp("famous", "ธนบัตร", 0.92),
  twist: B.twist.start,
  where: wp("twist", "ตรงไหน", 0.4),
  more: wp("twist", "มากกว่า", 0.8),
};
export const e10c0: Chapter10 = {
  name: "ช้างชนกันที่ไหน?",
  from: 0,
  to: B.two ? B.two.start : E10_END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.suphan, w, h, 0.95, 0.06) },
    { frame: T0.where, cam: view(VW.both, w, h, 0.92, 0.06) },
  ],
  years: [[0, "2135"]],
  heads: [
    { f: T0.famous, tag: "ศึกที่คนไทยรู้จักที่สุด", head: "ยุทธหัตถี พ.ศ. 2135", color: GOLD, chips: [{ text: "แบบเรียน", f: T0.book }, { text: "หนัง", f: T0.film }, { text: "ธนบัตร", f: T0.note }] },
    { f: T0.twist, tag: "ช้างชนกันตรงไหน?", head: "ดอนเจดีย์ 2 แห่ง ห่างราว 70 กม.", color: RED },
  ],
  Map: () => (
    <>
      <Battle at={PL.donSuphan} start={2} end={T0.where} color={RED} size={1.2} />
      <CityDot at={PL.donSuphan} color={GOLD} r={13} start={T0.famous} />
      <PointLabel at={PL.donSuphan} text="ดอนเจดีย์ สุพรรณ" start={T0.famous + 10} color={GOLD} size={0.85} />
      <CityDot at={PL.donKan} color={RED} r={13} start={T0.more} />
      <PointLabel at={PL.donKan} text="ดอนเจดีย์ กาญจน์" start={T0.more + 6} color={RED} size={0.85} />
      <Arrow points={[PL.donSuphan, PL.donKan]} start={T0.more + 10} end={T0.more + 40} color="#7a1f1a" width={6} variant="dashed" />
      <PointLabel at={OLD.siam} text="SIAM = กรุงศรีอยุธยา" start={T0.famous + 20} color={GOLD} size={0.75} />
    </>
  ),
  Panels: () => (
    <>
      <FlowPanel id="e10mon" anchor={PL.donSuphan} start={T0.battle} end={T0.twist + 14} name="ep10-chedi" accent={GOLD} light={[0.85, 0.08]} wind={[[0.37, 0.06, 0.48, 0.26], [0, 0.34, 0.18, 0.64], [0.86, 0.45, 1, 0.66]]} />
    </>
  ),
  Full: () => (
    <FlowFull name="ep10-duel-base" rig="ep10-duel" pose={duelPose} punch={0.04}
      bursts={[{ at: [0.57, 0.52], frame: T0.clash }, { at: [0.52, 0.67], frame: T0.clash + 2, n: 18 }, { at: [0.64, 0.42], frame: T0.strike, n: 16, color: "#fff2c8" }]} start={0} end={T0.battle + 14} to={[540, 852]} hits={[T0.clash, T0.strike]} light={[0.22, 0.04]} smokeBehind={2}
      wind={[[0.8, 0.6, 1, 0.76]]} />
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    const o = interpolate(frame, [B.hook.end - 2, B.hook.end + 12], [1, 0], clamp);
    return o > 0 ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: "10%", textAlign: "center", opacity: o, fontFamily: "Kanit", color: "#fff", lineHeight: 1.2, textShadow: "0 6px 30px rgba(0,0,0,0.95)", transform: `scale(${1 + 0.06 * Math.max(0, 1 - frame / 8)})` }}>
        <div style={{ fontSize: 104, fontWeight: 900 }}>ไม่มีใครรู้</div>
        <div style={{ fontSize: 92, fontWeight: 900 }}>ว่า<span style={{ color: GOLD }}>ช้างชนกัน</span><span style={{ color: "#ff6b5f" }}>ที่ไหน?</span></div>
      </div>
    ) : null;
  },
  sfx: [[0, SFX.hit, 0.22], [0, SFX.swell, 0.15], [T0.clash, SFX.hit, 0.2], [T0.strike, SFX.hit, 0.16], [T0.more, SFX.pop, 0.15], [T0.where - 8, SFX.whoosh, 0.14]],
  Audio: () => (
    <>
      <Hit id="elephant" at={T0.clash - 10} volume={0.4} />
      <Hit id="elephant" at={T0.strike + 6} volume={0.28} />
      <Bed id="sword_battle" from={0} to={T0.battle + 20} volume={0.12} />
      <Bed id="war_drums" from={0} to={T0.twist + 30} volume={0.12} />
      <Bed id="wind" from={T0.twist} to={E10_END} volume={0.12} />
    </>
  ),
};
