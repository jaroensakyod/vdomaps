import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { GAUL, IBERIAN, LIBYAN, Mountains, ROMAN, Warrior } from "./kit/Ancient";
import { BLUE, clamp, GOLD, HeadCard, Layers, Line, Page, Panel, RED, SKY, TopBar } from "./kit/Panel";
import { Cavalry, Citizen, Column, General, HannibalOnElephant, Senator, Signum, Snow, Temple, Tree } from "./kit/Pieces";

// N03 flat ancient: two-tone Mediterranean figures with a thin dark outline, in news-style illustration panels.
// Hannibal in three pictures: elephants over the snowy Alps, the Roman line breaks at Cannae, the Senate in
// panic in the Forum. 15 s.
export const demo: StyleDemo = { id: "N03", name: "ตัวละครแบนสองโทน ยุคโบราณ", frames: 450, cover: 240, sizes: ["9x16", "16x9"] };

const P1 = [0, 164], P2 = [150, 314], P3 = [300, 450];
const CLASH = [200, 232, 264];
const impact = (f: number) => Math.max(0, ...CLASH.map((b) => (f >= b && f < b + 8 ? 1 - (f - b) / 8 : 0)));

export const Demo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Bed id="wind_storm" from={0} to={160} volume={0.22} />
      <Hit id="elephant" at={30} volume={0.35} />
      <Hit id="war_horn" at={152} volume={0.3} />
      <Bed id="sword_battle" from={160} to={306} volume={0.2} />
      {CLASH.map((c) => <Hit key={c} id="sword_clash" at={c} volume={0.3} />)}
      <Hit id="crowd_panic" at={300} volume={0.25} />
      <Page />

      {/* 1 — 218 BC: elephants over the Alps */}
      <Panel id="a1" start={P1[0]} end={P1[1]} sky={SKY.winter} accent={GOLD}>
        {(g) => {
          const t = frame - P1[0];
          return (
            <Layers g={g} start={P1[0]} end={P1[1]}>
              {(pan) => (
                <g>
                  <Mountains x={g.x + pan * 0.2 - 40 * g.s} W={g.W * 1.2} ground={g.ground - 40 * g.s} s={g.s * 1.6} snow={1} />
                  <rect x={g.x} y={g.ground - 42 * g.s} width={g.W} height={g.H} fill="#e8eef2" />
                  {[0.08, 0.9].map((tx, i) => <Tree key={tx} x={g.x + g.W * tx + pan * 0.6} y={g.ground - 30 * g.s} scale={g.sc * 0.7} snow={1} phase={i} />)}
                  <Column x={g.x} y={g.ground - 20 * g.s} W={g.W} s={g.s} sc={g.sc * 0.8} order="wwwwww" kits={[LIBYAN, IBERIAN]} speed={1.4} t0={P1[0]} pose="trudge" cloak={1} />
                  <HannibalOnElephant x={g.x + g.W * 0.3 + t * 1.2 * g.s + pan * 1.6} y={g.ground + 30 * g.s} scale={g.sc * 0.62} snow={0.8} />
                  <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s * 1.4} n={80} />
                </g>
              )}
            </Layers>
          );
        }}
      </Panel>

      {/* 2 — 216 BC: Cannae, the Roman line breaks */}
      <Panel id="a2" start={P2[0]} end={P2[1]} sky={SKY.dawn} accent={RED}>
        {(g) => {
          const adv = interpolate(frame, [P2[0], P2[0] + 60], [0, 1], clamp);
          const fall = interpolate(frame, [P2[0] + 100, P2[0] + 130], [0, 1], clamp);
          const t = frame - P2[0];
          return (
            <Layers g={g} start={P2[0]} end={P2[1]} impact={impact(frame)}>
              {(pan) => (
                <g>
                  <path d={`M${g.x} ${g.ground - 120 * g.s} Q${g.x + g.W * 0.3} ${g.ground - 200 * g.s} ${g.x + g.W * 0.6} ${g.ground - 130 * g.s} T${g.x + g.W} ${g.ground - 150 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#b8a46a" />
                  <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#c9b07a" />
                  {Array.from({ length: 5 }, (_, i) => (
                    <Warrior key={i} x={g.x + g.W * (0.08 + i * 0.09) + adv * 30 * g.s + pan * 0.9} y={g.ground + (10 - (i % 2) * 22) * g.s} scale={g.sc * 0.62} phase={i} kit={ROMAN} roman pose={adv < 1 ? "walk" : "stand"} />
                  ))}
                  <Signum x={g.x + g.W * 0.3 + pan * 0.9} y={g.ground - 10 * g.s} scale={g.sc * 0.7} fall={fall} />
                  {Array.from({ length: 4 }, (_, i) => (
                    <Warrior key={`c${i}`} x={g.x + g.W * (0.9 - i * 0.09) - adv * 50 * g.s + pan * 0.9} y={g.ground + (10 - (i % 2) * 22) * g.s} scale={g.sc * 0.62} phase={i * 2} kit={i % 2 ? GAUL : LIBYAN} flip pose={adv < 1 ? "charge" : "stand"} />
                  ))}
                  <Cavalry x={g.x - 100 * g.s + t * 4 * g.s + pan * 1.6} y={g.ground + 50 * g.s} scale={g.sc * 0.6} kit={IBERIAN} />
                  <General x={g.x + g.W * 0.72 + pan * 1.6} y={g.ground + 34 * g.s} scale={g.sc * 0.74} flip point={adv} />
                </g>
              )}
            </Layers>
          );
        }}
      </Panel>

      {/* 3 — Rome: panic in the Forum */}
      <Panel id="a3" start={P3[0]} end={P3[1]} sky={SKY.summer} accent={BLUE}>
        {(g) => {
          const alarm = interpolate(frame, [P3[0] + 10, P3[0] + 30], [0, 1], clamp);
          return (
            <Layers g={g} start={P3[0]} end={P3[1]}>
              {(pan) => (
                <g>
                  <Temple x={g.x + g.W * 0.12 + pan * 0.3} W={g.W * 0.76} ground={g.ground - 30 * g.s} s={g.s * 1.8} />
                  <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#d9cfb4" />
                  {[0.12, 0.3, 0.72, 0.9].map((fx, i) => (
                    <Citizen key={fx} x={g.x + g.W * fx + pan * 1.2} y={g.ground + (30 + (i % 2) * 20) * g.s} scale={g.sc * 0.62} phase={i} flip={fx > 0.5} raise={i % 2 ? alarm : 0} />
                  ))}
                  <Senator x={g.x + g.W * 0.5 + pan * 1.6} y={g.ground + 60 * g.s} scale={g.sc * 0.82} alarm={alarm} />
                </g>
              )}
            </Layers>
          );
        }}
      </Panel>

      <TopBar channel="N03" chapter="ตัวละครแบนสองโทน ยุคโบราณ" year="218–216 ปีก่อน ค.ศ." />
      <HeadCard
        from={4}
        to={450}
        heads={[
          { f: 4, tag: "218 ปีก่อน ค.ศ.", head: "ข้ามเทือกเขาแอลป์", stat: "37", label: "ช้างศึก", color: GOLD },
          { f: 150, tag: "แคนเน · 216 ปีก่อน ค.ศ.", head: "โรมแตกในวันเดียว", stat: "50,000", label: "ทหารโรมัน", color: RED },
          { f: 300, tag: "กรุงโรม", head: "สภาโรมันแตกตื่น", color: BLUE },
        ]}
      />
      <Line text="ฮันนิบาลพาช้างข้ามภูเขาหิมะ" start={8} end={156} />
      <Line text="ทัพโรมันถูกล้อมจนแตกทั้งแนว" start={156} end={306} />
      <Line text="ข่าวมาถึงโรม ทั้งเมืองตื่นตระหนก" start={306} end={450} />
    </AbsoluteFill>
  );
};
