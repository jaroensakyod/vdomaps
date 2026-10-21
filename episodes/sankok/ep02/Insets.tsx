import { interpolate } from "remotion";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { HanFigure, LOOK, Rope, Willow } from "../kit/Scenes";
import { C, fonts } from "../kit/theme";

const ANXI: [number, number] = [115.0, 38.52];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// novel2 → twist → flee, one panel: the inspector tied to a willow. In the novel Zhang Fei holds the whip; on
// "บันทึก" the whip passes to Liu Bei (the record). On "แขวน" his seal of office hangs on the inspector's neck,
// on "หนี" the three walk away.
const Willowed = ({ g, twist, hang, flee }: { g: InsetGeom; twist: number; hang: number; flee: number }) => {
  const f = g.frame;
  const sc = g.sc * 0.95;
  const novel = f < twist;
  const swap = interpolate(f, [twist, twist + 8], [0, 1], clamp);
  const lashing = f < hang;
  const walk = Math.max(0, f - flee) * 3.2 * g.s;
  const tree = g.x + g.W * 0.28;
  const feet = g.ground + 24 * g.s;
  const whipper = novel ? "zhangfei" : "liubei";
  const watchers = novel ? ["liubei", "guanyu"] : ["zhangfei", "guanyu"];
  const sealK = interpolate(f, [hang, hang + 10], [0, 1], clamp);
  return (
    <g>
      <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#a99063" />
      <Willow x={tree - 6 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 1.1} broken={novel ? interpolate(f, [twist - 60, twist], [0, 1], clamp) : 1} />
      <HanFigure x={tree} y={feet} scale={sc} {...LOOK.official} pose="tied" phase={1} />
      <Rope x={tree} y={feet - 52 * sc} w={34} scale={sc} />
      {sealK > 0 && (
        <g transform={`translate(${tree + 4 * sc},${feet - 72 * sc}) scale(${sc * sealK})`}>
          <path d="M-8 -14 L0 2 L8 -14" stroke="#7a3324" strokeWidth={1.6} fill="none" />
          <rect x={-7} y={0} width={14} height={14} rx={2} fill="#c9302c" stroke="#2a1b0e" strokeWidth={1.2} />
          <text x={0} y={11} textAnchor="middle" fontSize={10} fill="#f3e6c4" fontFamily="'Microsoft YaHei', 'SimSun', serif">印</text>
        </g>
      )}
      <g opacity={novel ? 1 : swap}>
        <HanFigure x={g.x + g.W * 0.46 + walk} y={feet} scale={sc} {...LOOK[whipper]} pose={lashing ? "whip" : f >= flee ? "walk" : "stand"} hold={lashing ? "whip" : "none"} flip={f < flee} phase={2} />
        {watchers.map((w, i) => (
          <HanFigure key={w} x={g.x + g.W * (0.7 + i * 0.14) + walk} y={feet - 8 * g.s} scale={sc} {...LOOK[w]} pose={f >= flee ? "walk" : "stand"} flip={f < flee} phase={3 + i} />
        ))}
      </g>
      <text x={g.x + g.W * 0.62} y={g.y + 46 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={34 * g.s} fill={novel ? C.shu : C.wu}>
        {novel ? "ในนิยาย: เตียวหุยเฆี่ยน" : "ตามบันทึก: เล่าปี่เฆี่ยนเอง"}
      </text>
    </g>
  );
};

export const Insets = ({ B, word }: Timeline) => (
  <InsetPanel id="willow" anchor={ANXI} label="ภาพประกอบ" start={B.novel2.start} end={B.cliff.start + 6} sky={["#e9d7a6", "#cdb27a"]} font={fonts.body} accent={C.wu} top={0.42}>
    {(g) => <Willowed g={g} twist={word("twist", "บันทึก")} hang={word("flee", "แขวน")} flee={word("flee", "หนี")} />}
  </InsetPanel>
);
