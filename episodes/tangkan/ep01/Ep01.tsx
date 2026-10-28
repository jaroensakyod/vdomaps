// ต่างกันยังไง EP.1: ผายมือ vs ผายลม (~38 s, 1080×1920). Voxel hotel lobby in three.js; deadpan comparison in
// three points, a punch card, and the doorman's advice at the end.
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useEffect, useLayoutEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Bed, Hit, Sfx } from "../../../components/Sound";
import { Caption, Chip, Exclaim, KANIT, kanitReady, Meter, PunchCard, SoundWord } from "../kit/hud";
import { Elevator, ELEV, Gas, Room, signTex } from "../kit/lobby";
import { Post } from "../kit/post";
import { AUNTIE, CatVox, DOORMAN, faceTint, GIRL, GRANDPA, mouthOpen, NERD, PersonVox, PlantVox, SALARYMAN } from "../kit/voxel";
import BEATS from "./beats.json";
import TIMING from "./timing.json";

// ---------- Timeline from the TTS timing ----------
const FPS = 30;
const GAP: Record<string, number> = { h1: 2, h2: 8, a1: 14, a2: 10, b1: 16, b2: 10, b3: 12, c1: 44, c2: 10, c3: 36, e1: 22, e2: 12 };
type Beat = { id: string; text: string; chip?: string; card?: string; file: string; start: number; end: number };
const BEAT: Record<string, Beat> = {};
{
  let t = 0;
  for (const b of BEATS as { id: string; text: string; chip?: string; card?: string }[]) {
    const tm = (TIMING as { id: string; sec: number; file: string }[]).find((x) => x.id === b.id)!;
    t += GAP[b.id] ?? 10;
    BEAT[b.id] = { ...b, file: tm.file, start: t, end: t + Math.round(tm.sec * FPS) };
    t = BEAT[b.id].end;
  }
}
const ALL = Object.values(BEAT);
export const EP01_FRAMES = ALL[ALL.length - 1].end + 60;

// Frame where a word is spoken, estimated by its position in the sentence.
const wordAt = (id: string, word: string) => {
  const b = BEAT[id];
  const i = b.text.indexOf(word);
  return Math.round(b.start + ((b.end - b.start) * Math.max(0, i)) / b.text.length);
};

// ---------- Key moments ----------
const K = {
  a1Arm: wordAt("a1", "ยื่นมือ"),
  a2Strain: wordAt("a2", "เกร็ง"),
  a2Puff: BEAT.a2.end + 2,
  b1Arm: BEAT.b1.start + 4,
  b2Loud: wordAt("b2", "มีเสียง") + 4,
  b2Silent: wordAt("b2", "เงียบ"),
  wilt: BEAT.b3.start + 8,
  green: BEAT.b3.start + 16,
  fall: BEAT.b3.end + 6,
  c1Open: BEAT.c1.start - 8,
  c1Arm: wordAt("c1", "เชิญ"),
  c2Open: BEAT.c2.start - 4,
  card: wordAt("c3", "ขึ้นอยู่กับ"),
  e1Puff: BEAT.e1.end + 3,
  e2Point: wordAt("e2", "ผายมือ"),
};
const CAT_SHOCK = K.e2Point + 6;

// ---------- Camera shots (hard cuts between, slow move inside each) ----------
type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov?: number };
const SHOTS: { from: number; a: Cam; b: Cam; focus: V3 }[] = [
  { from: 0, a: { pos: [0, 1.55, 5.2], look: [0, 1.3, -2.6] }, b: { pos: [0, 1.5, 4.4], look: [0, 1.3, -2.6] }, focus: [0, 1.2, -1.4] },
  { from: BEAT.a1.start - 4, a: { pos: [-0.95, 1.5, 1.9], look: [-0.7, 1.2, -1.6] }, b: { pos: [-0.8, 1.45, 1.5], look: [-0.7, 1.2, -1.6] }, focus: [-0.45, 1.2, -1.6] },
  { from: BEAT.a2.start - 4, a: { pos: [1.4, 1.45, 2.0], look: [1.75, 1.1, -1.1] }, b: { pos: [1.5, 1.4, 1.6], look: [1.75, 1.1, -1.1] }, focus: [1.85, 1.1, -1.1] },
  { from: BEAT.b1.start - 4, a: { pos: [-0.2, 1.5, 1.3], look: [-0.55, 1.25, -1.6] }, b: { pos: [-0.3, 1.5, 1.1], look: [-0.55, 1.25, -1.6] }, focus: [-0.45, 1.3, -1.6] },
  { from: BEAT.b2.start - 4, a: { pos: [1.55, 1.3, 1.8], look: [1.85, 1.0, -1.1] }, b: { pos: [1.6, 1.25, 1.4], look: [1.85, 1.0, -1.1] }, focus: [1.85, 1.0, -1.1] },
  { from: BEAT.b3.start - 4, a: { pos: [1.4, 0.65, 2.9], look: [1.35, 0.7, -1.2] }, b: { pos: [1.4, 0.6, 2.5], look: [1.35, 0.65, -1.2] }, focus: [1.2, 0.6, -0.7] },
  { from: BEAT.c1.start - 12, a: { pos: [-1.45, 1.45, -4.45], look: [-1.3, 1.05, 1] }, b: { pos: [-1.45, 1.45, -4.35], look: [-1.3, 1.05, 1] }, focus: [-1.4, 1.1, -2.2] },
  { from: BEAT.c2.start - 8, a: { pos: [1.15, 1.45, 3.0], look: [1.45, 1.15, -2.6] }, b: { pos: [1.2, 1.4, 2.6], look: [1.45, 1.15, -2.6] }, focus: [1.45, 1.0, -1.0] },
  { from: BEAT.c3.start - 6, a: { pos: [0, 3.4, 5.0], look: [0, 0.5, -1.4] }, b: { pos: [0, 3.5, 4.3], look: [0, 0.5, -1.4] }, focus: [0, 0.6, -1.4] },
  { from: BEAT.e1.start - 8, a: { pos: [0, 1.35, 1.5], look: [-0.05, 1.1, -1.6] }, b: { pos: [0.05, 1.32, 1.25], look: [-0.05, 1.1, -1.6] }, focus: [-0.1, 1.1, -1.55] },
  { from: K.e2Point - 2, a: { pos: [0.05, 1.32, 1.25], look: [-0.05, 1.1, -1.6] }, b: { pos: [0.2, 1.2, 1.0], look: [0.1, 0.95, -1.5] }, focus: [0.2, 0.9, -1.45] },
];
const shotAt = (f: number) => {
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1].from <= f) i++;
  const s = SHOTS[i];
  const end = i + 1 < SHOTS.length ? SHOTS[i + 1].from : EP01_FRAMES;
  const k = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (f - s.from) / Math.max(1, end - s.from))));
  const mix = (a: V3, b: V3) => a.map((v, j) => v + (b[j] - v) * k) as V3;
  return { i, pos: mix(s.a.pos, s.b.pos), look: mix(s.a.look, s.b.look), fov: s.a.fov ?? 66, focus: s.focus };
};

const CamRig = ({ pos, look, fov }: { pos: V3; look: V3; fov: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.fov = fov;
    c.near = 0.05;
    c.far = 40;
    c.lookAt(...look);
    c.updateProjectionMatrix();
  });
  return null;
};

// ---------- Helpers ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, len: number) => interpolate(f, [a, a + len], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
const speaking = (f: number, ids: string[]) => ids.some((id) => f >= BEAT[id].start && f < BEAT[id].end - 2);
const walk = (f: number, a: number, b: number, from: V3, to: V3): { p: V3; bob: number } => {
  const k = interpolate(f, [a, b], [0, 1], clamp);
  const moving = f > a && f < b;
  return { p: from.map((v, i) => v + (to[i] - v) * k) as V3, bob: moving ? Math.abs(Math.sin((f - a) * 0.55)) * 0.06 : 0 };
};

// ---------- The 3D scene for one frame ----------
const Scene = ({ f, signs }: { f: number; signs: { l: THREE.Texture; r: THREE.Texture } | null }) => {
  const shot = shotAt(f);
  const S = shot.i;

  // Doorman: arm out toward the left elevator in the hook, a1, b1, c1; snaps to the cat at e2.
  const armIn = (at: number) => -100 * ramp(f, at, 10);
  let doorL = 0;
  if (S === 0) doorL = -100;
  else if (S === 1) doorL = armIn(K.a1Arm);
  else if (S === 3) doorL = armIn(K.b1Arm);
  else if (S === 6) doorL = armIn(K.c1Arm);
  const doorR = f >= K.e2Point ? 95 * ramp(f, K.e2Point, 5) : 0;
  const doorTalk = speaking(f, ["e1", "e2"]) && Math.floor(f / 4) % 2 === 0;

  // Salaryman: strains in a2, lets go in b2, then waits inside the right elevator.
  const strain = (S === 2 && f >= K.a2Strain && f < K.a2Puff) || (S === 4 && f >= K.b2Loud - 10 && f < K.b2Loud);
  const salaryPos: V3 = S >= 6 ? [1.45, 0, -4.05] : [1.85, 0, -1.1];
  const jitter = strain ? Math.sin(f * 2.3) * 0.012 : 0;
  const red = strain ? faceTint("#e0745a") : undefined;

  // Auntie: goes green and falls backwards in b3; in c1 she walks into the left elevator with the nerd.
  const greenK = interpolate(f, [K.green, K.green + 18], [0, 1], clamp);
  const auntieFace = greenK > 0 ? faceTint(new THREE.Color("#d99f72").lerp(new THREE.Color("#8fbf5a"), greenK).getStyle()) : undefined;
  const fallK = interpolate(f, [K.fall, K.fall + 12], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const auntieWalk = walk(f, K.c1Open + 8, K.c1Open + 70, [-0.9, 0, 0.8], [-1.65, 0, -2.6]);
  const nerdWalk = walk(f, K.c1Open + 14, K.c1Open + 74, [-2.0, 0, 1.2], [-1.2, 0, -2.2]);

  // Runners burst out of the gassed right elevator.
  const girlRun = walk(f, K.c2Open + 12, K.c2Open + 84, [1.25, 0, -3.6], [0.55, 0, 2.6]);
  const grandRun = walk(f, K.c2Open + 20, K.c2Open + 96, [1.7, 0, -3.8], [2.2, 0, 2.4]);

  const leftOpen = S === 6 ? ramp(f, K.c1Open, 18) : 0;
  const rightOpen = S === 0 ? 0.06 : S >= 7 ? ramp(f, K.c2Open, 16) : 0;

  return (
    <>
      <CamRig pos={shot.pos} look={shot.look} fov={shot.fov} />
      <color attach="background" args={["#1a1410"]} />
      <ambientLight intensity={0.35} color="#ffe8cc" />
      <hemisphereLight args={["#fff1d6", "#6a4a32", 0.55]} />
      <directionalLight
        position={[-2.5, 5, 4]}
        intensity={1.6}
        color="#fff0d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />
      <Room />
      <Elevator x={ELEV.left} open={leftOpen} sign={signs?.l ?? null} />
      <Elevator x={ELEV.right} open={rightOpen} sign={signs?.r ?? null} />

      <group position={[2.35, 0, -2.4]}>
        <PlantVox wilt={interpolate(f, [K.wilt, K.wilt + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) }) * (S >= 5 ? 1 : 0)} />
      </group>
      <group position={[-2.5, 0, -2.4]}>
        <PlantVox />
      </group>

      {/* Doorman + cat stay by the middle pillar all episode. */}
      <group position={[-0.35, 0, -1.6]}>
        <PersonVox who={DOORMAN} armL={doorL} armR={doorR} pal={mouthOpen(DOORMAN, doorTalk)} />
      </group>
      <group position={[0.25, 0, -1.45]}>
        <CatVox shock={f >= CAT_SHOCK} />
      </group>

      <group position={[salaryPos[0] + jitter, 0, salaryPos[2]]}>
        <PersonVox who={SALARYMAN} squash={strain ? 0.95 : 1} pal={{ ...red, ...(S >= 7 ? { m: "#5a1a1a" } : {}) }} />
      </group>

      {S <= 5 ? (
        <group position={[0.95, 0, -0.55]} rotation={[(-Math.PI / 2) * fallK, 0, 0]}>
          <PersonVox who={AUNTIE} pal={auntieFace} armL={-30 * greenK} armR={30 * greenK} />
        </group>
      ) : S === 6 ? (
        <group position={[auntieWalk.p[0], auntieWalk.bob, auntieWalk.p[2]]} rotation={[0, Math.PI, 0]}>
          <PersonVox who={AUNTIE} />
        </group>
      ) : null}
      {S === 6 ? (
        <group position={[nerdWalk.p[0], nerdWalk.bob, nerdWalk.p[2]]} rotation={[0, Math.PI, 0]}>
          <PersonVox who={NERD} />
        </group>
      ) : null}
      {S >= 7 ? (
        <>
          <group position={[girlRun.p[0], girlRun.bob, girlRun.p[2]]}>
            <PersonVox who={GIRL} armL={-150} armR={150} pal={{ m: "#5a1a1a", s: "#cfd98a" }} />
          </group>
          <group position={[grandRun.p[0], grandRun.bob, grandRun.p[2]]}>
            <PersonVox who={GRANDPA} armL={-60} armR={60} pal={{ m: "#5a1a1a", s: "#b9c47a" }} />
          </group>
        </>
      ) : null}

      {/* Gas */}
      {S === 0 ? <Gas t={f + 40} origin={[1.45, 1.0, -2.92]} count={26} spread={0.7} drift={[0, 0.15, 0.7]} hold seedN={1} /> : null}
      {S === 2 && f >= K.a2Puff ? <Gas t={f - K.a2Puff} origin={[1.85, 0.72, -1.25]} count={14} spread={0.35} drift={[0, 0.2, -0.3]} life={60} seedN={2} /> : null}
      {S === 4 && f >= K.b2Loud ? <Gas t={f - K.b2Loud} origin={[1.85, 0.72, -1.25]} count={40} spread={0.9} drift={[0, 0.3, -0.2]} life={70} seedN={3} /> : null}
      {(S === 4 || S === 5) && f >= K.b2Silent ? <Gas t={f - K.b2Silent} origin={[1.85, 0.2, -1.2]} count={80} spread={2.4} drift={[-0.6, 0, 0.35]} flat hold opacity={0.3} seedN={4} /> : null}
      {S >= 7 && S <= 8 && f >= K.c2Open ? <Gas t={(f - K.c2Open) * 0.8} origin={[1.45, 1.0, -3.5]} count={80} spread={3.0} drift={[0, 0.05, 1.0]} hold opacity={0.26} seedN={5} /> : null}
      {S === 8 ? <Gas t={f - BEAT.c3.start + 70} origin={[0.6, 0.25, -1.2]} count={120} spread={3.6} drift={[0, 0, 0.2]} flat hold opacity={0.3} seedN={6} /> : null}
      {S >= 9 && f >= K.e1Puff ? <Gas t={f - K.e1Puff} origin={[-0.35, 0.72, -1.8]} count={18} spread={0.5} drift={[0.8, 0.1, 0]} life={120} seedN={7} /> : null}

      <Post focus={shot.focus} />
    </>
  );
};

// ---------- Episode ----------
export const Ep01 = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [signs, setSigns] = useState<{ l: THREE.Texture; r: THREE.Texture } | null>(null);
  const [handle] = useState(() => delayRender("sign textures"));
  useEffect(() => {
    kanitReady()
      .then(() => document.fonts.load(`700 112px ${KANIT}`))
      .then(() => {
        setSigns({ l: signTex("ผายมือ", KANIT), r: signTex("ผายลม", KANIT) });
        continueRender(handle);
      });
  }, [handle]);

  const voice = ALL.map((b) => [b.start, b.end] as [number, number]);
  const sections: { from: number; to: number; text: string }[] = [];
  for (const b of ALL) {
    if (!b.chip) continue;
    const last = sections[sections.length - 1];
    if (last && last.text === b.chip) last.to = b.end;
    else sections.push({ from: b.start - 4, to: b.end, text: b.chip });
  }
  // A chip stays up until the next section (or the ending) starts.
  sections.forEach((s, i) => (s.to = (sections[i + 1]?.from ?? BEAT.e1.start - 8) - 1));

  return (
    <AbsoluteFill style={{ background: "#1a1410" }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }} camera={{ fov: 56, position: [0, 1.5, 4] }}>
        <Scene f={f} signs={signs} />
      </ThreeCanvas>

      {sections.map((s) => (f >= s.from && f <= s.to ? <Chip key={s.text} text={s.text} f={f - s.from} /> : null))}
      {f >= BEAT.b1.start && f < BEAT.b3.start ? <Meter f={f - BEAT.b1.start} db={f >= K.b2Loud && f < K.b2Silent ? 98 : 0} /> : null}
      <SoundWord text="ปู้ด!" f={f - K.b2Loud} x={700} y={820} />
      {f >= K.card && f < BEAT.e1.start - 8 ? <PunchCard text={BEAT.c3.card!} f={f - K.card} /> : null}
      <Exclaim f={f - CAT_SHOCK} x={880} y={780} />
      {ALL.map((b) => (f >= b.start && f < b.end + 6 ? <Caption key={b.id} text={b.text} f={f - b.start} dur={b.end + 6 - b.start} /> : null))}

      {/* Voice */}
      {ALL.map((b) => (
        <Sfx key={b.id} src={b.file} at={b.start} volume={1} />
      ))}
      {/* Sound */}
      <Bed id="hotel_lobby" from={0} to={EP01_FRAMES} volume={0.14} voice={voice} />
      <Hit id="elevator_ding" at={0} volume={0.3} />
      <Hit id="fart_small" at={K.a2Puff} volume={0.3} />
      <Hit id="fart_strong" at={K.b2Loud} volume={0.34} />
      <Hit id="trombone_fail" at={K.wilt + 10} volume={0.16} />
      <Hit id="gasp_female" at={K.fall - 6} volume={0.3} />
      <Hit id="wood_hit" at={K.fall + 12} volume={0.22} />
      <Hit id="elevator_ding" at={K.c1Open - 4} volume={0.3} />
      <Hit id="door_slide_soft" at={K.c1Open + 2} volume={0.22} />
      <Hit id="elevator_ding" at={K.c2Open - 6} volume={0.3} />
      <Hit id="door_slide_soft" at={K.c2Open + 2} volume={0.22} />
      <Hit id="gasp_male" at={K.c2Open + 10} volume={0.3} />
      <Bed id="run_steps" from={K.c2Open + 10} to={K.c2Open + 56} volume={0.25} fade={6} />
      <Hit id="boing_hit" at={K.card} volume={0.2} />
      <Hit id="fart_small" at={K.e1Puff} volume={0.28} />
      <Hit id="cat_meow_angry" at={CAT_SHOCK} volume={0.32} />
    </AbsoluteFill>
  );
};
