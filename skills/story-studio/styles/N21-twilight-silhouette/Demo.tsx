import { loadFont } from "@remotion/google-fonts/Athiti";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Bank, Birds, Branch, Reeds, Boat, Chedi, Drift, FarHills, HORIZON, Palm, Prang, RuinWall, Sky, Tree, TwilightDefs, Walker, Water } from "./kit/Twilight";

// N21 twilight silhouette: the end of Ayutthaya told as one long dusk. The sky deepens from gold to violet over
// the shot, the first stars come out, black ruins, a rower and two walkers drift past in layers, and three sparse
// lines of type fade in and out. 16 s.
export const demo: StyleDemo = { id: "N21", name: "เงาสนธยา", frames: 480, cover: 268, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["200", "300", "500"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LINES = [
  { text: "สี่ร้อยสิบเจ็ดปี", from: 40, to: 330, y: 560, size: 104, weight: 300 },
  { text: "ของกรุงศรีอยุธยา", from: 150, to: 330, y: 690, size: 76, weight: 200 },
  { text: "ปิดฉากลงกลางเปลวไฟ", from: 345, to: 480, y: 600, size: 84, weight: 300 },
];

const Ruins = () => (
  <g>
    <RuinWall x={-80} y={HORIZON} w={520} />
    <Chedi x={120} y={HORIZON} h={250} />
    <Tree x={300} y={HORIZON} h={170} />
    <Prang x={500} y={HORIZON} h={460} />
    <RuinWall x={640} y={HORIZON} w={700} />
    <Chedi x={1010} y={HORIZON} h={310} />
    <Palm x={1130} y={HORIZON} h={300} />
    <Chedi x={1260} y={HORIZON} h={210} />
    <Tree x={1420} y={HORIZON} h={220} />
  </g>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, demo.frames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const t = frame * 0.13;
  const push = interpolate(frame, [0, demo.frames], [1, 1.045], clamp);
  const on = interpolate(frame, [0, 24], [0, 1], clamp);
  const fade = (a: number, b: number) => interpolate(frame, [a, a + 40, b - 34, b], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#06030a" }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.12} />
      <Sfx src={SFX.swell} at={10} volume={0.25} />
      <Hit id="gong" at={348} volume={0.22} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <TwilightDefs k={k} />
        <g transform={`translate(540,1300) scale(${push}) translate(-540,-1300)`}>
          <Sky k={k} frame={frame} />
          <Birds x={interpolate(frame, [60, 420], [-160, 1260], clamp)} y={880 - frame * 0.18} t={t * 2} />
          <Drift x={-frame * 0.08} haze><FarHills k={k} /></Drift>
          <Drift x={-frame * 0.22}><Ruins /></Drift>
          <Water top={HORIZON} h={260} frame={frame} k={k} mirror={<g transform={`translate(${-frame * 0.22},0)`}><Ruins /></g>} />
          <Boat x={interpolate(frame, [0, demo.frames], [180, 470])} y={HORIZON + 120} t={t * 1.4} />
          <Drift x={-frame * 0.6}>
            <Bank y={1540} x0={-200} w={1700} sway={Math.sin(t * 0.8) * 6} />
            <Walker x={620 + frame * 0.72} y={1556} h={290} t={t * 1.4} />
            <Walker x={735 + frame * 0.72} y={1560} h={200} t={t * 1.4 + 1.3} child hat={false} />
          </Drift>
          <Drift x={-frame * 0.9}>
            <Reeds x={110} y={1566} sway={Math.sin(t * 0.7) * 10} />
            <Reeds x={1180} y={1580} sway={Math.sin(t * 0.6 + 1) * 10} />
          </Drift>
          <Drift x={-frame * 0.35}><Branch x={1140} y={60} flip /></Drift>
        </g>
        <rect x={0} y={0} width={W} height={1920} filter="url(#tw-grain)" />
        {/* thin cinematic bars */}
        <rect x={0} y={0} width={W} height={42} fill="#06030a" />
        <rect x={0} y={1878} width={W} height={42} fill="#06030a" />
      </svg>
      <div style={{ position: "absolute", top: 108, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#ffe9c8", opacity: on * 0.9 }}>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: 5 }}>N21 · เงาสนธยา</div>
        <div style={{ width: 70, height: 1, background: "#ffe9c8", margin: "18px auto 0", opacity: 0.6 }} />
      </div>
      {LINES.map((l) => (
        <div key={l.text} style={{ position: "absolute", top: l.y, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: l.size, fontWeight: l.weight, color: "#fff6ea", letterSpacing: 2, opacity: fade(l.from, l.to), transform: `translateY(${interpolate(frame, [l.from, l.from + 60], [14, 0], clamp)}px)`, textShadow: "0 2px 30px rgba(40,0,40,0.35)" }}>
          {l.text}
        </div>
      ))}
      <div style={{ position: "absolute", top: 1700, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 38, fontWeight: 300, letterSpacing: 8, color: "#ffe2bc", opacity: fade(200, 480) * 0.9 }}>
        พ.ศ. 1893 – 2310
      </div>
      <div style={{ position: "absolute", bottom: 92, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 24, fontWeight: 300, letterSpacing: 4, color: "#b9a6c4", opacity: on * 0.8 }}>
        <span>ภาพประกอบ</span>
        <span>อยุธยา · 7 เมษายน 2310</span>
      </div>
    </AbsoluteFill>
  );
};
