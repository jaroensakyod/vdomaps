import { loadFont } from "@remotion/google-fonts/ChakraPetch";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Beam, C, Cabinet, craterLines, globeLines, Lander, rnd, Sphere, Sputnik, trail, TUBE, VectorDefs, Vostok, VText } from "./kit/Vector";

// N31 vector arcade: the space race played as a vector-display arcade game. Stage 1 Sputnik 1 (4 Oct 1957),
// stage 2 Gagarin on Vostok 1 (12 Apr 1961, 108 min), stage 3 Apollo 11 lands (20 Jul 1969), stage clear with
// the first step (21 Jul 1969 UTC). Wireframe globes, glowing beam lines with phosphor trails, a vector HUD that
// scores each side's "firsts". 18 s.
export const demo: StyleDemo = { id: "N31", name: "เกมตู้เวกเตอร์", frames: 540, cover: 400, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const EARTH = globeLines(5, 12);
const MOON = [...globeLines(3, 8, 36), ...craterLines([[0.3, 0.4, 0.22], [-0.4, -0.5, 0.16], [0.7, -0.9, 0.12], [-0.1, 1.3, 0.2], [-0.8, 0.6, 0.1], [0.1, -1.6, 0.14]])];
const CX = 540;
const STAGES = [
  { from: 24, to: 172, n: "1", year: "1957", name: "SPUTNIK 1", cap: ["4 ต.ค. 1957 · สปุตนิก 1", "ดาวเทียมดวงแรกของโลก"], ussr: 1, usa: 0 },
  { from: 172, to: 292, n: "2", year: "1961", name: "VOSTOK 1", cap: ["12 เม.ย. 1961 · ยูริ กาการิน", "มนุษย์คนแรกในอวกาศ"], ussr: 2, usa: 0 },
  { from: 292, to: 436, n: "3", year: "1969", name: "APOLLO 11", cap: ["20 ก.ค. 1969 · อะพอลโล 11", "ลงจอดบนดวงจันทร์"], ussr: 2, usa: 1 },
  { from: 436, to: 540, n: "4", year: "1969", name: "STAGE CLEAR", cap: ["21 ก.ค. 1969 · นีล อาร์มสตรอง", "ก้าวแรกบนดวงจันทร์"], ussr: 2, usa: 1 },
];

// orbit around a globe: an ellipse seen at a slant; back half hidden behind the globe
const orbit = (cx: number, cy: number, a: number, b: number, th: number, tilt = -0.32) => {
  const x = Math.cos(th) * a, y = Math.sin(th) * b;
  return { x: cx + x * Math.cos(tilt) - y * Math.sin(tilt), y: cy + x * Math.sin(tilt) + y * Math.cos(tilt), front: Math.sin(th) > 0 };
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const st = STAGES.find((s) => frame >= s.from && frame < s.to) ?? STAGES[0];
  const si = STAGES.indexOf(st);
  // power-on: the beam warms up, a dot opens into the picture
  const on = r(0, 22, Easing.out(Easing.cubic));
  const flicker = 0.93 + 0.05 * Math.sin(frame * 1.7) * Math.sin(frame * 0.31);
  const stageFlash = frame - st.from < 22 && si > 0 ? 1 - (frame - st.from) / 22 : 0;
  // earth: centre, then off to the corner when the ship heads for the moon
  const away = r(292, 326);
  const eCx = interpolate(away, [0, 1], [CX, 300]);
  const eCy = interpolate(away, [0, 1], [960, 1150]);
  const eR = interpolate(away, [0, 1], [230, 110]);
  const surface = frame >= 356; // stage 3b: on the lunar surface
  const rot = frame * 0.018;

  const earthView = !surface && (
    <g>
      <Sphere lines={EARTH} cx={eCx} cy={eCy} r={eR} rotY={rot} />
      {/* stage 1: Sputnik climbs from the surface into orbit */}
      {si === 0 && frame >= 40 && trail(frame, (f) => {
        const climb = interpolate(f, [40, 78], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
        const th = -1.9 + (f - 40) * 0.045;
        const p = orbit(eCx, eCy, 236 + climb * 150, 236 * (1 - climb) + climb * 120, th);
        if (!p.front && Math.hypot(p.x - eCx, p.y - eCy) < eR) return null;
        return <Sputnik x={p.x} y={p.y} s={0.9} a={(th * 180) / Math.PI + 90} />;
      }, 12, 1.4)}
      {si === 0 && <ellipse cx={eCx} cy={eCy} rx={386} ry={120} transform={`rotate(${-0.32 * 57.3},${eCx},${eCy})`} fill="none" stroke={C.white} strokeWidth={1.5} strokeDasharray="3 16" opacity={r(78, 100) * 0.7} />}
      {/* stage 2: Vostok 1 goes round once */}
      {si === 1 && trail(frame, (f) => {
        const th = -Math.PI / 2 + ((f - 178) / 108) * Math.PI * 2;
        const p = orbit(eCx, eCy, 330, 130, th, 0.2);
        if (!p.front && Math.hypot(p.x - eCx, p.y - eCy) < eR) return null;
        return <Vostok x={p.x} y={p.y} s={1.1} a={(th * 180) / Math.PI + 90} />;
      }, 14, 1.2)}
      {si === 1 && <VText text={`${String(Math.min(108, Math.max(0, Math.round(frame - 178)))).padStart(3, "0")} MIN`} x={CX} y={TUBE.y + 236} size={40} color={C.amber} anchor="middle" />}
      {/* stage 3a: the moon, and the trip out */}
      {si === 2 && (
        <g opacity={r(298, 318)}>
          <Sphere lines={MOON} cx={730} cy={740} r={160} rotY={0.4 + frame * 0.004} tilt={0.1} color={C.white} />
          <path d="M330 1050 C 380 900 470 860 590 830" fill="none" stroke={C.white} strokeWidth={1.6} strokeDasharray="3 14" opacity={0.7} />
          {trail(frame, (f) => {
            const k = interpolate(f, [312, 352], [0, 1], { ...clamp, easing: io });
            const t = k, u = 1 - k;
            const x = u * u * u * 330 + 3 * u * u * t * 380 + 3 * u * t * t * 470 + t * t * t * 590;
            const y = u * u * u * 1050 + 3 * u * u * t * 900 + 3 * u * t * t * 860 + t * t * t * 830;
            return <circle cx={x} cy={y} r={6} fill="none" stroke={C.cyan} strokeWidth={3} />;
          }, 14, 1.3, 0.8)}
        </g>
      )}
    </g>
  );

  // stage 3b and 4: the lunar surface in perspective, earth on the horizon, the lander comes down
  const land = r(362, 412, Easing.out(Easing.quad));
  const touched = frame >= 412;
  const lmY = interpolate(land, [0, 1], [560, 1056]);
  const SURF = 0;
  const surfaceView = surface && (
    <g>
      <Sphere lines={EARTH} cx={800} cy={700} r={66} rotY={rot} backOpacity={0} />
      {Array.from({ length: 34 }, (_, i) => <circle key={i} cx={TUBE.x + 30 + rnd(i) * (TUBE.w - 60)} cy={TUBE.y + 230 + rnd(i + 40) * 600} r={1.6} fill={C.white} opacity={0.5 + 0.5 * rnd(i + 3)} />)}
      <path d={`M${TUBE.x} 990 ${Array.from({ length: 19 }, (_, i) => `L${TUBE.x + (i + 1) * 50} ${990 - 30 * Math.sin(i * 1.3) * rnd(i + 5) - (i > 11 && i < 16 ? 50 : 0)}`).join(" ")}`} fill="none" stroke={C.white} strokeWidth={2.6} />
      {/* ground grid in perspective */}
      {Array.from({ length: 6 }, (_, i) => {
        const y = 1030 + Math.pow(i / 5, 1.7) * 250;
        return <path key={`h${i}`} d={`M${TUBE.x} ${y} L${TUBE.x + TUBE.w} ${y}`} stroke={C.cyan} strokeWidth={1.6} opacity={0.35 + i * 0.08} />;
      })}
      {Array.from({ length: 13 }, (_, i) => <path key={`v${i}`} d={`M${CX + (i - 6) * 60} 1030 L${CX + (i - 6) * 210} 1280`} stroke={C.cyan} strokeWidth={1.4} opacity={0.35} />)}
      {[[250, 1120, 80], [830, 1180, 100], [420, 1250, 60]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.22} fill="none" stroke={C.white} strokeWidth={2.2} />)}
      {/* descent: engine plume flickers, dust sprays at touchdown */}
      {!touched && trail(frame, (f) => {
        const y = interpolate(f, [362, 412], [560, 1056], { ...clamp, easing: Easing.out(Easing.quad) });
        return <Lander x={CX + 20} y={y} s={1.5} />;
      }, 6, 2, 0.6)}
      {touched && <Lander x={CX + 20} y={1056} s={1.5} />}
      {!touched && frame >= 362 && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${CX + 20 - 14 + i * 7} ${lmY} L${CX + 20 - 30 + i * 15 + Math.sin(frame * 3 + i) * 6} ${lmY + 40 + rnd(frame + i) * 50}`} stroke={C.amber} strokeWidth={2.4} />)}
      {frame >= 398 && frame < 430 && Array.from({ length: 14 }, (_, i) => {
        const k = (frame - 398) / 32;
        const s = i < 7 ? -1 : 1;
        const len = (40 + rnd(i) * 160) * k;
        return <path key={`d${i}`} d={`M${CX + 20 + s * 40} 1056 L${CX + 20 + s * (60 + len)} ${1056 - 8 - rnd(i + 2) * 30 * k}`} stroke={C.white} strokeWidth={1.8} opacity={1 - k} />;
      })}
      {/* stage 4: flag, the first step's bootprints */}
      {si === 3 && (
        <g>
          <path d={`M${CX + 190} 1076 L${CX + 190} 890 L${CX + 190 + 90 * r(440, 470)} 890 L${CX + 190 + 90 * r(440, 470)} 946 L${CX + 190} 946`} fill="none" stroke={C.white} strokeWidth={2.6} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${CX - 120 + i * 40} ${1110 + (i % 2) * 22} l0 -14 a10 8 0 0 1 20 0 l0 14 a10 8 0 0 1 -20 0`} fill="none" stroke={C.cyan} strokeWidth={2} opacity={r(450 + i * 10, 458 + i * 10)} />)}
        </g>
      )}
    </g>
  );

  const capK = interpolate(frame, [st.from + 10, st.from + 26, st.to - 10, st.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#f2b705" }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.03} />
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      {[76, 100, 124, 148].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.18} />)}
      {[40, 178, 312].map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.22} />)}
      {[172, 292, 436].map((f) => <Sfx key={f} src={SFX.hit} at={f} volume={0.3} />)}
      <Sfx src={SFX.riser} at={352} volume={0.18} />
      {Array.from({ length: 12 }, (_, i) => <Sfx key={`t${i}`} src={SFX.tick} at={182 + i * 9} volume={0.08} />)}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <VectorDefs />
        <Cabinet kicker="N31 · เกมตู้เวกเตอร์" marqueeFont={font} lit={on * (frame < 24 ? (frame % 6 < 3 ? 0.4 : 1) : 1)}>
          <Beam flicker={flicker}>
            <g transform={`translate(${CX},894) scale(${on < 1 ? Math.max(0.002, on) : 1},${on < 1 ? Math.max(0.004, on * on) : 1}) translate(${-CX},-894)`}>
              {/* HUD */}
              <VText text="USSR" x={TUBE.x + 70} y={TUBE.y + 50} size={30} color={C.red} />
              <VText text={String(st.ussr).padStart(2, "0")} x={TUBE.x + 70} y={TUBE.y + 98} size={56} color={C.red} width={3.6} />
              <VText text="USA" x={TUBE.x + TUBE.w - 70} y={TUBE.y + 50} size={30} color={C.cyan} anchor="end" />
              <VText text={String(st.usa).padStart(2, "0")} x={TUBE.x + TUBE.w - 70} y={TUBE.y + 98} size={56} color={C.cyan} anchor="end" width={3.6} />
              <VText text={st.year} x={CX} y={TUBE.y + 56} size={64} anchor="middle" width={3.8} />
              <VText text={si < 3 ? `STAGE ${st.n}  ${st.name}` : st.name} x={CX} y={TUBE.y + 170} size={si < 3 ? 30 : 58} color={si < 3 ? C.green : C.amber} anchor="middle" opacity={1 - stageFlash * 0.6 * (frame % 4 < 2 ? 1 : 0)} />
              <path d={`M${TUBE.x + 60} ${TUBE.y + 140} L${TUBE.x + TUBE.w - 60} ${TUBE.y + 140}`} stroke={C.cyan} strokeWidth={1.6} opacity={0.5} />
              {earthView}
              {surfaceView}
              {/* the caption is drawn by the beam too: outline lettering, no fill */}
              <g opacity={capK} fontFamily={font} textAnchor="middle" fill="none" strokeLinejoin="round">
                <text x={CX} y={TUBE.y + TUBE.h - 150} fontSize={58} fontWeight={700} stroke={C.white} strokeWidth={2.2}>{st.cap[0]}</text>
                <text x={CX} y={TUBE.y + TUBE.h - 74} fontSize={54} fontWeight={600} stroke={C.amber} strokeWidth={2}>{st.cap[1]}</text>
              </g>
              {frame >= 500 && frame % 20 < 12 && <VText text="INSERT COIN" x={CX} y={TUBE.y + 250} size={34} color={C.white} anchor="middle" />}
            </g>
            {on < 1 && <circle cx={CX} cy={894} r={6 + 30 * on} fill={C.white} opacity={1 - on} />}
          </Beam>
        </Cabinet>
        <text x={540} y={1530} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={26} fill="#16110e" letterSpacing={1}>ภาพประกอบ · คะแนน = ความสำเร็จ "ครั้งแรก" ของแต่ละฝ่าย</text>
        <text x={735} y={1300} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={30} fill="#16110e" letterSpacing={3}>1 PLAYER · ยิง · เร่ง</text>
      </svg>
    </AbsoluteFill>
  );
};
