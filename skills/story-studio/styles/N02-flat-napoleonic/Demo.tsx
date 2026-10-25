import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { Smoke } from "../../components/Figures";
import type { StyleDemo } from "../types";
import { Cannon, Cossack, EagleStandard, Explosion, Hills, Isba, Kutuzov, SnowGround, Tricolour } from "./kit/Battle";
import { HeadCard, Layers, Line, Page, Panel, SKY, TopBar, GOLD, RED, BLUE, clamp } from "./kit/Panel";
import { FRENCH, Napoleon, PontoonBridge, RUSSIAN, Snow, Soldier, Treeline, Water } from "./kit/Period";

// N02 flat Napoleonic: two-tone figures with a thin dark outline, in news-style illustration panels. 1812 in
// three pictures: the Grande Armée crosses the Niemen on pontoons, the guns at Borodino, the retreat in the snow
// with Cossacks closing in. 15 s.
export const demo: StyleDemo = { id: "N02", name: "ตัวละครแบนสองโทน ยุคนโปเลียน", frames: 450, cover: 250, sizes: ["9x16", "16x9"] };

const P1 = [0, 164], P2 = [150, 314], P3 = [300, 450];
const BLASTS = [196, 232, 268];
const blast = (f: number, b: number) => (f >= b && f < b + 34 ? (f - b) / 34 : 0);
const impact = (f: number) => Math.max(0, ...BLASTS.map((b) => (f >= b && f < b + 8 ? 1 - (f - b) / 8 : 0)));

export const Demo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Bed id="army_marching" from={0} to={160} volume={0.25} />
      <Hit id="cannon" at={160} volume={0.4} />
      {BLASTS.map((b) => <Hit key={b} id="explosion_mid" at={b} volume={0.35} />)}
      <Bed id="wind_storm" from={300} to={450} volume={0.2} />
      <Hit id="horse_gallop" at={330} volume={0.3} />
      <Page />

      {/* 1 — June: the army crosses the Niemen on pontoon bridges */}
      <Panel id="p1" start={P1[0]} end={P1[1]} sky={SKY.dawn} accent={GOLD}>
        {(g) => {
          const water = g.ground - 150 * g.s;
          const deck = water - 30 * g.s;
          const t = frame - P1[0];
          return (
            <Layers g={g} start={P1[0]} end={P1[1]}>
              {(pan) => (
                <g>
                  <Hills x={g.x + pan * 0.2} W={g.W * 1.2} ground={water - 20 * g.s} s={g.s * 1.6} color="#8a9a6a" />
                  <rect x={g.x} y={water - 22 * g.s} width={g.W} height={24 * g.s} fill="#6f8a52" />
                  <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s * 1.5} color="#3c6f8f" />
                  <PontoonBridge x0={g.x - 40 * g.s} x1={g.x + g.W + 40 * g.s} deck={deck} water={water + 20 * g.s} s={g.s * 1.4} />
                  {Array.from({ length: 7 }, (_, i) => (
                    <Soldier key={i} x={g.x + ((i * 150 * g.s + t * 1.6 * g.s) % (g.W + 150 * g.s)) - 60 * g.s} y={deck - 6 * g.s} scale={g.sc * 0.5} phase={i * 0.9} u={FRENCH} />
                  ))}
                  <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={g.H} fill="#b59b68" />
                  <path d={`M${g.x} ${g.ground - 10 * g.s} Q${g.x + g.W * 0.18} ${g.ground - 70 * g.s} ${g.x + g.W * 0.36} ${g.ground - 10 * g.s} Z`} fill="#a08756" />
                  <Napoleon x={g.x + g.W * 0.16 + pan * 1.6} y={g.ground - 40 * g.s} scale={g.sc * 0.72} />
                  <Tricolour x={g.x + g.W * 0.27 + pan * 1.6} y={g.ground - 20 * g.s} s={g.s * 1.5} tatter={0} />
                </g>
              )}
            </Layers>
          );
        }}
      </Panel>

      {/* 2 — September: the guns at Borodino */}
      <Panel id="p2" start={P2[0]} end={P2[1]} sky={SKY.smoke} accent={RED}>
        {(g) => (
          <Layers g={g} start={P2[0]} end={P2[1]} impact={impact(frame)}>
            {(pan) => (
              <g>
                <Hills x={g.x + pan * 0.2} W={g.W * 1.2} ground={g.ground - 120 * g.s} s={g.s * 1.4} color="#7a7a5a" />
                {[0.3, 0.55, 0.8].map((fx, i) => <Smoke key={fx} x={g.x + g.W * fx + pan * 0.2} y={g.ground - 200 * g.s} size={70 * g.s} seed={i * 3} wind={0.3} />)}
                <rect x={g.x} y={g.ground - 122 * g.s} width={g.W} height={g.H} fill="#9a8a5c" />
                {Array.from({ length: 5 }, (_, i) => (
                  <Soldier key={i} x={g.x + g.W * (0.6 + i * 0.075) + pan * 0.6} y={g.ground - 80 * g.s} scale={g.sc * 0.42} phase={i} u={RUSSIAN} pose="stand" flip />
                ))}
                <Kutuzov x={g.x + g.W * 0.94 + pan * 0.6} y={g.ground - 60 * g.s} scale={g.sc * 0.5} flip />
                {BLASTS.map((b, i) => <Explosion key={b} x={g.x + g.W * (0.64 + i * 0.1) + pan * 0.6} y={g.ground - 110 * g.s} size={40 * g.s} k={blast(frame, b)} />)}
                <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#b59b68" />
                <Cannon x={g.x + g.W * 0.2 + pan * 1.6} y={g.ground + 10 * g.s} scale={g.sc * 0.75} phase={0} every={36} />
                {[0, 1].map((i) => <Soldier key={i} x={g.x + g.W * (0.14 + i * 0.28) + pan * 1.6} y={g.ground + 16 * g.s} scale={g.sc * 0.62} phase={i * 2} u={FRENCH} pose="stand" />)}
              </g>
            )}
          </Layers>
        )}
      </Panel>

      {/* 3 — November: the retreat in the snow */}
      <Panel id="p3" start={P3[0]} end={P3[1]} sky={SKY.winter} accent={BLUE}>
        {(g) => {
          const t = frame - P3[0];
          const fall = interpolate(frame, [P3[0] + 90, P3[0] + 120], [0, 1], clamp);
          return (
            <Layers g={g} start={P3[0]} end={P3[1]}>
              {(pan) => (
                <g>
                  <Treeline x={g.x + pan * 0.2} W={g.W * 1.2} ground={g.ground - 90 * g.s} s={g.s * 1.3} color="#3a4a48" snow={0.9} />
                  <SnowGround x={g.x} W={g.W} ground={g.ground - 90 * g.s} H={g.H} s={g.s} />
                  <Isba x={g.x + g.W * 0.8 + pan * 0.6} y={g.ground - 80 * g.s} scale={g.sc * 0.55} burnt />
                  <Cossack x={g.x + g.W * 1.05 - t * 3 * g.s + pan * 0.6} y={g.ground - 60 * g.s} scale={g.sc * 0.42} flip />
                  {Array.from({ length: 4 }, (_, i) => (
                    <Soldier key={i} x={g.x + g.W * (0.12 + i * 0.16) - t * 0.5 * g.s + pan * 1.6} y={g.ground + 14 * g.s} scale={g.sc * 0.6} phase={i * 1.3} u={FRENCH} pose="trudge" wrap={1} flip />
                  ))}
                  <EagleStandard x={g.x + g.W * 0.58 + pan * 1.6} y={g.ground + 14 * g.s} scale={g.sc * 0.55} fall={fall} />
                  <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.4} n={90} />
                </g>
              )}
            </Layers>
          );
        }}
      </Panel>

      <TopBar channel="N02" chapter="ตัวละครแบนสองโทน ยุคนโปเลียน" year="ค.ศ. 1812" />
      <HeadCard
        from={4}
        to={450}
        heads={[
          { f: 4, tag: "มิถุนายน 1812", head: "ทัพใหญ่ข้ามแม่น้ำเนมัน", stat: "600,000", label: "นาย", color: GOLD },
          { f: 150, tag: "7 กันยายน", head: "ปืนใหญ่ที่โบโรดิโน", stat: "70,000", label: "คนตายในวันเดียว", color: RED },
          { f: 300, tag: "พฤศจิกายน", head: "ถอยทัพกลางหิมะ", color: BLUE },
        ]}
      />
      <Line text="นโปเลียนบุกรัสเซีย ด้วยทัพใหญ่ที่สุด" start={8} end={156} />
      <Line text="ปืนใหญ่ยิงกันทั้งวัน แต่รัสเซียไม่แตก" start={156} end={306} />
      <Line text="ฤดูหนาวมาถึง คอสแซคไล่ตามไม่หยุด" start={306} end={450} />
    </AbsoluteFill>
  );
};
