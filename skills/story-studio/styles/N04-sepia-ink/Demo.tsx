import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Fire, Smoke } from "../../components/Figures";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { ArrowShot, Bushes, Chest, Farmhouse, Fireflies, HanFigure, LOOK, OfficeGate, ThroneRoom, WarDrum, Willow } from "./kit/Scenes";
import { C, clamp, fonts, Layers, Line, Page, Stage } from "./kit/Stage";

// N04 sepia ink: Han-era illustration panels — flat muted colours with a sepia ink outline, warm light, grain.
// Three panels, a new picture every ~5 s with a 14-frame overlap: three brothers leave a village at night,
// eunuchs rule the palace, peasants in yellow turbans burn the county office. 15 s.
export const demo: StyleDemo = { id: "N04", name: "ลายเส้นหมึกซีเปียแบบจีน", frames: 450, cover: 384, sizes: ["9x16", "16x9"] };

const S1 = [0, 164], S2 = [150, 314], S3 = [300, 450];
const HITS = [336, 372, 408];
const impact = (f: number) => Math.max(0, ...HITS.map((h) => (f >= h && f < h + 10 ? 1 - (f - h) / 10 : 0)));

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  return (
    <AbsoluteFill>
      <Bed id="wind" from={0} to={160} volume={0.15} />
      <Hit id="horse_neigh" at={40} volume={0.2} />
      <Hit id="gong" at={150} volume={0.35} />
      <Hit id="crowd_angry" at={300} volume={0.25} />
      <Bed id="fire_big" from={300} to={450} volume={0.2} />
      {HITS.map((h) => <Hit key={h} id="war_drums" at={h} volume={0.3} />)}
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Page />

      {/* 1 — night: three brothers leave the village */}
      <Stage id="n1" start={S1[0]} end={S1[1]} sky={C.night}>
        {(g) => (
          <Layers g={g} id="n1" start={S1[0]} end={S1[1]} warm={0.04}>
            {(pan) => (
              <g>
                <circle cx={g.x + g.W * 0.8 + pan * 0.2} cy={g.y + 150 * g.s} r={46 * g.s} fill="#efe6c2" opacity={0.9} />
                <circle cx={g.x + g.W * 0.8 + pan * 0.2} cy={g.y + 150 * g.s} r={110 * g.s} fill="#efe6c2" opacity={0.12} />
                <path d={`M${g.x} ${g.ground - 150 * g.s} L${g.x + g.W * 0.3 + pan * 0.2} ${g.ground - 260 * g.s} L${g.x + g.W * 0.55 + pan * 0.2} ${g.ground - 170 * g.s} L${g.x + g.W * 0.85 + pan * 0.2} ${g.ground - 300 * g.s} L${g.x + g.W} ${g.ground - 200 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#1f2a22" />
                <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#252a22" />
                <Farmhouse x={g.x + g.W * 0.28 + pan * 0.6} y={g.ground + 4 * g.s} scale={g.sc * 0.9} />
                <Willow x={g.x + g.W * 0.78 + pan * 0.6} y={g.ground + 4 * g.s} scale={g.sc * 0.85} />
                <Fireflies x={g.x} y={g.y + g.H * 0.3} w={g.W} h={g.H * 0.5} n={16} />
                {(["liubei", "guanyu", "zhangfei"] as const).map((who, i) => (
                  <HanFigure key={who} x={g.x + g.W * (0.12 + i * 0.13) + (frame - S1[0]) * 1.2 * g.s} y={g.ground + 40 * g.s} scale={g.sc * 1.05} {...LOOK[who]} pose="walk" hold={i === 1 ? "halberd" : i === 2 ? "spear" : "none"} phase={i * 1.4} />
                ))}
                <Bushes x0={g.x + pan * 1.6} x1={g.x + g.W * 0.4 + pan * 1.6} y={g.y + g.H + 10 * g.s} s={g.s * 2.2} n={4} />
              </g>
            )}
          </Layers>
        )}
      </Stage>

      {/* 2 — the palace: eunuchs hold the power */}
      <Stage id="n2" start={S2[0]} end={S2[1]} sky={C.hall}>
        {(g) => (
          <Layers g={g} id="n2" start={S2[0]} end={S2[1]} warm={0.1}>
            {(pan) => (
              <g>
                <g transform={`translate(${pan * 0.3},0)`}>
                  <ThroneRoom x={g.cx} y={g.ground + 4 * g.s} w={g.W * 1.2} h={g.H} s={g.sc * 0.85} />
                </g>
                <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#4a2a1a" />
                <HanFigure x={g.x + g.W * 0.44 + pan * 0.6} y={g.ground - 30 * g.s} scale={g.sc * 0.95} {...LOOK.emperor} pose="sit" />
                <Chest x={g.x + g.W * 0.62 + pan} y={g.ground + 56 * g.s} scale={g.sc * 1.1} />
                <HanFigure x={g.x + g.W * 0.17 + pan * 1.3} y={g.ground + 50 * g.s} scale={g.sc * 1.0} {...LOOK.zhangrang} pose="laugh" hold="scroll" />
                <HanFigure x={g.x + g.W * 0.88 + pan * 1.3} y={g.ground + 50 * g.s} scale={g.sc * 1.0} {...LOOK.official} pose="bow" flip />
              </g>
            )}
          </Layers>
        )}
      </Stage>

      {/* 3 — dusk: the Yellow Turbans burn the county office */}
      <Stage id="n3" start={S3[0]} end={S3[1]} sky={C.dusk}>
        {(g) => {
          const burn = interpolate(frame, [S3[0] + 10, S3[0] + 60], [0, 1], clamp);
          const t = frame - S3[0];
          return (
            <Layers g={g} id="n3" start={S3[0]} end={S3[1]} impact={impact(frame)} warm={0.12}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#3a2416" />
                  <Smoke x={g.x + g.W * 0.2 + pan * 0.2} y={g.ground - 330 * g.s} size={90 * g.s} seed={2} wind={0.5} k={burn} />
                  <OfficeGate x={g.x + g.W * 0.6 + pan * 0.6} y={g.ground + 6 * g.s} scale={g.sc * 1.15} burn={burn} />
                  <WarDrum x={g.x + g.W * 0.12 + pan * 0.9} y={g.ground + 30 * g.s} scale={g.sc * 1.1} />
                  {[0, 1, 2].map((i) => (
                    <ArrowShot key={i} x0={g.x + g.W * 0.05} y0={g.ground - 300 * g.s} x1={g.x + g.W * 0.7} y1={g.ground - 220 * g.s} p={((t - i * 12) % 40) / 26} s={g.s * 2} />
                  ))}
                  {[0, 1, 2, 3].map((i) => (
                    <HanFigure key={i} x={g.x + g.W * (0.08 + i * 0.2) + pan * 1.6} y={g.ground + (44 + (i % 2) * 18) * g.s} scale={g.sc * 1.0} {...LOOK.rebel} pose="raise" hold={i % 2 ? "torch" : "hoe"} phase={i * 1.7} />
                  ))}
                  <Fire x={g.x + g.W * 0.95 + pan * 1.6} y={g.ground + 30 * g.s} size={70 * g.s} seed={8} k={burn} />
                </g>
              )}
            </Layers>
          );
        }}
      </Stage>

      <Line text="คืนนั้น สามพี่น้องออกเดินทาง" start={6} end={158} />
      <Line text="ในวัง ขันทีกุมอำนาจทั้งแผ่นดิน" start={158} end={306} />
      <Line text="ชาวนาโพกผ้าเหลือง ลุกฮือทั้งแผ่นดิน" start={306} end={450} />
      <div style={{ position: "absolute", top: vertical ? 70 : 34 * s, left: 0, right: 0, textAlign: "center", fontFamily: fonts.body, color: C.text, opacity: interpolate(frame, [6, 24], [0, 1], clamp) }}>
        <div style={{ fontSize: 40 * (vertical ? 1 : s), fontWeight: 700, opacity: 0.85 }}>N04 · ลายเส้นหมึกซีเปียแบบจีน</div>
        {vertical && <div style={{ fontFamily: fonts.title, fontSize: 76, lineHeight: 1.35, color: C.red }}>ปลายราชวงศ์ฮั่น</div>}
      </div>
    </AbsoluteFill>
  );
};
