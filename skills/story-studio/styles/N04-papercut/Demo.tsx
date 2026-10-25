import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Chest, CloudPair, Corner, Farmhouse, Flame, Ground, Hall, MoonDisc, OfficeGate, Person, Willow } from "./kit/Cuts";
import { clamp, Kicker, Label, Line, PaperDefs, Pin, Wall, Window } from "./kit/Paper";

// N04 paper-cut: the end of the Han told in red paper-cuts on a rice-paper wall. Each scene is a round window-cut
// that arrives folded, opens along its fold, and then gets its figures pinned on; at the end of the scene it
// folds shut again. Three brothers leave the village by moonlight, eunuchs rule the palace, peasants in yellow
// turbans set the county office alight. 15 s.
export const demo: StyleDemo = { id: "N04", name: "ลายตัดกระดาษแดง", frames: 450, cover: 384, sizes: ["9x16", "16x9"] };

const S = [[0, 164], [150, 314], [300, 450]];
const HITS = [336, 372, 408];
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const v = H > W;
  const R = v ? 500 : 450;
  const cx = v ? W / 2 : 1250;
  const cy = v ? 940 : H / 2;
  const sc = R / 470;
  const open = (i: number) => {
    const [a, b] = S[i];
    const last = i === S.length - 1;
    return interpolate(frame, [a + 4, a + 30, b - 20, b - 6], [0, 1, 1, last ? 1 : 0], ease);
  };
  const alpha = (i: number) => {
    const [a, b] = S[i];
    const last = i === S.length - 1;
    return interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, last ? 1 : 0], clamp);
  };
  const pin = (i: number, j: number) => interpolate(frame, [S[i][0] + 30 + j * 6, S[i][0] + 44 + j * 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const live = (i: number) => frame >= S[i][0] && frame < S[i][1];
  const hit = Math.max(0, ...HITS.map((h) => (frame >= h && frame < h + 10 ? 1 - (frame - h) / 10 : 0)));
  const ground = cy + R * 0.3;
  const fig = 2.9 * sc;
  const t = frame;

  return (
    <AbsoluteFill>
      <Bed id="wind" from={0} to={160} volume={0.15} />
      <Hit id="horse_neigh" at={60} volume={0.2} />
      <Hit id="gong" at={152} volume={0.35} />
      <Hit id="crowd_angry" at={300} volume={0.25} />
      <Bed id="fire_big" from={320} to={450} volume={0.2} />
      {HITS.map((h) => <Hit key={h} id="war_drums" at={h} volume={0.3} />)}
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Wall />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <PaperDefs />
        <g transform={`translate(${v ? -10 : -10},${v ? -10 : -10})`}><Corner s={v ? 1.6 : 1.3} /></g>
        <g transform={`translate(${W + 10},${H + 10}) rotate(180)`}><Corner s={v ? 1.6 : 1.3} /></g>

        {/* 1 — night: three brothers leave the village */}
        {live(0) && (
          <Window id="w1" cx={cx} cy={cy} R={R} open={open(0)} alpha={alpha(0)} sym={<g><Ground cx={cx} y={ground} R={R} /><CloudPair cx={cx} y={cy - R * 0.62} dx={R * 0.5} s={1.4 * sc} /></g>}>
            <Pin k={pin(0, 0)} x={cx + R * 0.36} y={cy - R * 0.36}><MoonDisc r={78 * sc} /></Pin>
            <Pin k={pin(0, 1)} x={cx - R * 0.5} y={ground + 6}><g transform={`scale(${1.7 * sc})`}><Farmhouse /></g></Pin>
            <Pin k={pin(0, 2)} x={cx + R * 0.58} y={ground + 8}><g transform={`scale(${2.2 * sc})`}><Willow t={t} /></g></Pin>
            {[0, 1, 2].map((i) => (
              <Pin key={i} k={pin(0, 3 + i)} x={cx - R * 0.42 + i * R * 0.28 + (frame - S[0][0]) * 0.9 * sc} y={ground + R * 0.12}>
                <g transform={`scale(${fig})`}><Person walk t={t + i * 9} hat={i === 1 ? "official" : "bun"} beard={i > 0} hold={i === 1 ? "halberd" : i === 2 ? "spear" : "none"} /></g>
              </Pin>
            ))}
          </Window>
        )}

        {/* 2 — the palace: eunuchs hold the power */}
        {live(1) && (
          <Window id="w2" cx={cx} cy={cy} R={R} open={open(1)} alpha={alpha(1)} sym={<g><Ground cx={cx} y={ground + R * 0.04} R={R} /><g transform={`translate(${cx},${ground + R * 0.04}) scale(${1.5 * sc})`}><Hall /></g></g>}>
            <Pin k={pin(1, 0)} x={cx} y={ground - R * 0.12}><g transform={`scale(${fig * 0.75})`}><Person hat="crown" t={t} /></g></Pin>
            <Pin k={pin(1, 1)} x={cx - R * 0.5} y={ground + R * 0.2}><g transform={`scale(${fig * 1.1})`}><Person hat="eunuch" hold="scroll" raise={0.6 + Math.sin(t / 8) * 0.2} t={t} /></g></Pin>
            <Pin k={pin(1, 2)} x={cx + R * 0.2} y={ground + R * 0.24}><g transform={`scale(${1.6 * sc})`}><Chest /></g></Pin>
            <Pin k={pin(1, 3)} x={cx + R * 0.55} y={ground + R * 0.2}><g transform={`scale(${-fig},${fig}) rotate(${12 + Math.sin(t / 10) * 3})`}><Person hat="official" beard t={t} /></g></Pin>
          </Window>
        )}

        {/* 3 — dusk: the Yellow Turbans burn the county office */}
        {live(2) && (
          <g transform={`rotate(${Math.sin(frame * 1.7) * hit * 1.2} ${cx} ${cy})`}>
            <Window id="w3" cx={cx} cy={cy} R={R} open={open(2)} alpha={alpha(2)} sym={<g><Ground cx={cx} y={ground} R={R} /><g transform={`translate(${cx},${ground + 4}) scale(${1.6 * sc})`}><OfficeGate /></g></g>}>
              {[-80, -30, 20, 70].map((x, i) => {
                const burn = interpolate(frame, [S[2][0] + 40 + i * 8, S[2][0] + 70 + i * 8], [0, 1], clamp);
                return <Flame key={x} x={cx + x * 1.6 * sc} y={ground + 4 - 130 * 1.6 * sc} s={(1 + (i % 2) * 0.5) * burn * 1.6 * sc} t={t + i * 7} />;
              })}
              {[0, 1, 2, 3].map((i) => (
                <Pin key={i} k={pin(2, i)} x={cx - R * 0.66 + i * R * 0.42} y={ground + R * (0.18 + (i % 2) * 0.1)}>
                  <g transform={`scale(${(i % 2 ? -1 : 1) * fig},${fig})`}><Person hat="turban" hold={i % 2 ? "hoe" : "torch"} raise={i % 2 ? 0.8 + hit * 0.3 : 1} t={t + i * 11} /></g>
                </Pin>
              ))}
            </Window>
          </g>
        )}
      </svg>

      <Kicker title="ปลายราชวงศ์ฮั่น" />
      <Line text="คืนนั้น สามพี่น้องออกเดินทาง" start={8} end={158} />
      <Line text="ในวัง ขันทีกุมอำนาจทั้งแผ่นดิน" start={160} end={306} />
      <Line text="ชาวนาโพกผ้าเหลือง ลุกฮือทั้งแผ่นดิน" start={310} end={450} />
      <Label />
    </AbsoluteFill>
  );
};
