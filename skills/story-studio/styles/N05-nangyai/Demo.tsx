import { loadFont } from "@remotion/google-fonts/Kanit";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Burst, Cloth, ClothDefs, Far, FieldGun, Mid, Panel, Performer, Plane, SKIN, Tank, Tommy } from "./kit/NangYai";

// N05 nang yai: a WW1 battle staged as Thai shadow-puppet theatre. Carved panels on poles held up by dancing
// performers in front of a fire-lit cloth; far puppets blur, shell bursts light the cloth from behind. 10 s.
export const demo: StyleDemo = { id: "N05", name: "หนังใหญ่", frames: 300, cover: 185, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BLASTS = [48, 104, 150, 196, 240];
const BLAST_X = [720, 300, 860, 520, 200];

export const Demo = () => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [0, 20], [0, 1], clamp);
  const flicker = 0.94 + 0.03 * Math.sin(frame * 0.21) + 0.02 * Math.sin(frame * 0.53);
  const blastK = (b: number) => (frame >= b && frame < b + 30 ? (frame - b) / 30 : 0);
  const flash = Math.max(0, ...BLASTS.map((b) => (frame >= b && frame < b + 12 ? 1 - (frame - b) / 12 : 0)));
  const shake = flash * 8;
  const push = 1 + interpolate(frame, [0, demo.frames], [0, 0.06], clamp);
  const t = frame * 0.22;
  const charge = interpolate(frame, [20, 300], [0, 140], clamp);
  const tankX = interpolate(frame, [0, 300], [980, 640], clamp);
  const planeX = interpolate(frame, [30, 260], [-120, 1180], clamp);
  return (
    <AbsoluteFill style={{ background: "#050302" }}>
      {BLASTS.map((b) => <Sfx key={b} src={SFX.hit} at={b} volume={0.55} />)}
      <Sfx src={SFX.swell} at={0} volume={0.35} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <ClothDefs />
        <g transform={`translate(${Math.sin(frame * 2.1) * shake},${Math.cos(frame * 2.9) * shake}) translate(540,1500) scale(${push}) translate(-540,-1500)`}>
          <Cloth light={on * flicker} />
          {/* shell bursts light the cloth from behind */}
          {BLASTS.map((b, i) => (frame >= b && frame < b + 24 ? <circle key={b} cx={BLAST_X[i]} cy={1110} r={260 + (frame - b) * 10} fill="#fff6dc" opacity={(1 - (frame - b) / 24) * 0.55} /> : null))}

          <Far opacity={0.6 * on}>
            {Array.from({ length: 7 }, (_, i) => <Tommy key={i} x={110 + i * 74 + charge * 0.3} y={1000} s={0.8} t={t + i} />)}
            <path d={`M30 1000 ${Array.from({ length: 30 }, (_, i) => `L${30 + i * 35} ${1000 - (i % 2) * 14}`).join(" ")} L${W - 30} 1022 L30 1022 Z`} fill={SKIN} />
          </Far>
          <Mid opacity={on}>
            <Tank x={tankX} y={1220} s={1.5} t={t} />
            <Plane x={planeX} y={560 + Math.sin(t * 0.7) * 30} s={1.9} t={t} />
            {BLASTS.map((b, i) => <Burst key={b} x={BLAST_X[i]} y={1110} k={blastK(b)} />)}
          </Mid>

          <g opacity={on}>
            <Panel x={20 + charge} y={1450} w={560}>
              <Tommy x={140 + charge} y={1450} s={2.3} t={t} />
              <Tommy x={380 + charge} y={1450} s={2.3} t={t + 1.6} />
              <g transform={`translate(${270 + charge},1450) scale(1.5)`}>
                {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-90 + i * 40} -40 l20 -26 m-20 0 l20 26`} stroke={SKIN} strokeWidth={4} />)}
              </g>
            </Panel>
            <Panel x={640} y={1500} w={400}>
              <FieldGun x={810} y={1500} s={1.3} frame={frame} />
            </Panel>
          </g>
        </g>
        {/* performers stand in front of the screen: always sharp, darkest */}
        <g opacity={on}>
          <Performer x={300 + charge} t={t} />
          <Performer x={840} t={t * 0.7 + 2} />
        </g>
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff1d0" opacity={flash * 0.25} />}
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#ffe2a8", opacity: interpolate(frame, [10, 30], [0, 1], clamp) }}>
        <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85 }}>N05 · หนังใหญ่</div>
        <div style={{ fontSize: 76, fontWeight: 900 }}>สงครามโลกครั้งที่ 1</div>
      </div>
    </AbsoluteFill>
  );
};
