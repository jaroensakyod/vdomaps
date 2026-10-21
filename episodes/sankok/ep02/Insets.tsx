import { interpolate } from "remotion";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { HanFigure, LOOK, Rope, Willow } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const ANXI: [number, number] = [115.0, 38.52];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// novel2 → twist → flee, one panel: the inspector tied to a willow. In the novel Zhang Fei holds the whip; on
// "บันทึก" the whip passes to Liu Bei (the record). On "แขวน" his seal of office hangs on the inspector's neck,
// on "หนี" the three walk away.
export const Willowed = ({ g, twist, hang, flee, caption = true }: { g: InsetGeom; twist: number; hang: number; flee: number; caption?: boolean }) => {
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
      {caption && <text x={g.x + g.W * 0.62} y={g.y + 46 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={34 * g.s} fill={novel ? C.shu : C.wu}>
        {novel ? "ในนิยาย: เตียวหุยเฆี่ยน" : "ตามบันทึก: เล่าปี่เฆี่ยนเอง"}
      </text>}
    </g>
  );
};

const NOVEL = "ภาพประกอบ · ในนิยาย";
const WILLOW: [string, string] = ["#e9d7a6", "#cdb27a"];
const ZHUO = place("zhuo");
const brothers = (pose?: "bow" | "sit" | "walk", walk?: number) => [
  { who: "liubei", x: 0.3, pose, walk },
  { who: "guanyu", x: 0.48, pose, walk },
  { who: "zhangfei", x: 0.66, pose, walk },
];

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "willow-open", at: -8, anchor: ANXI, sky: WILLOW, draw: (g) => <Willowed g={g} twist={-1e6} hang={1e9} flee={1e9} caption={false} /> },
      { id: "tie", at: word("hookq", "มัด"), anchor: ANXI, until: B.oath.start + 4, ...tab("gate", [{ who: "liubei", x: 0.3, hold: "whip", pose: "whip" }, { who: "official", x: 0.55, pose: "tied", flip: true }], "ลงมือเองจริงหรือ?") },
      // oath: Liu Bei's portrait is the picture
      { id: "peach", at: word("novel", "สวน"), anchor: ZHUO, label: NOVEL, ...tab("field", brothers("bow"), "สาบานในสวนท้อ มีแค่ในนิยาย") },
      { id: "bed", at: word("record", "นอน"), anchor: ZHUO, ...tab("study", brothers("sit"), "นอนเตียงเดียวกัน รักกันเหมือนพี่น้อง") },
      { id: "guard", at: word("record", "กวนอู"), anchor: ZHUO, ...tab("palace", [{ who: "guanyu", x: 0.24, hold: "halberd" }, { who: "liubei", x: 0.5, pose: "sit" }, { who: "zhangfei", x: 0.76, hold: "spear", flip: true }], "ยืนคุ้มกันเล่าปี่ได้ทั้งวัน") },
      { id: "war", at: word("war", "ปราบ"), anchor: ANXI, ...tab("field", [{ who: "liubei", x: 0.2, pose: "raise", hold: "sword" }, { who: "guanyu", x: 0.34, hold: "halberd" }, { who: "zhangfei", x: 0.48, hold: "spear" }, { who: "rebel", x: 0.74, pose: "flee", walk: 2.2 }, { who: "rebel", x: 0.88, pose: "flee", walk: 2.2 }], "ช่วยทัพหลวงปราบโจรโพกผ้าเหลือง") },
      { id: "post", at: word("war", "ตำแหน่ง"), anchor: ANXI, ...tab("gate", [{ who: "liubei", x: 0.3, robe: "#3d4f6b", head: "official" }], "ตำแหน่งแรก นายทหารอำเภอเล็ก ๆ") },
      { id: "turned", at: word("inspector", "ไล่"), anchor: ANXI, ...tab("gate", [{ who: "liubei", x: 0.3, pose: "bow" }, { who: "official", x: 0.7, hold: "point", flip: true, robe: "#7a2a24" }], "ขอเข้าพบ แต่ถูกไล่กลับ") },
      { id: "list", at: word("reason", "ปลด"), anchor: ANXI, until: B.novel2.start + 8, ...tab("study", [{ who: "official", x: 0.36, hold: "scroll", robe: "#7a2a24" }, { who: "liubei", x: 0.66, flip: true }], "ชื่อของเขาอยู่ในบัญชีปลด") },
      { id: "willow-novel", at: B.novel2.start, anchor: ANXI, label: NOVEL, sky: WILLOW, draw: (g) => <Willowed g={g} twist={1e9} hang={1e9} flee={1e9} /> },
      { id: "willow-record", at: B.twist.start, anchor: ANXI, sky: WILLOW, until: word("flee", "หนี") + 14, draw: (g) => <Willowed g={g} twist={-1e6} hang={word("flee", "แขวน")} flee={1e9} /> },
      { id: "leave", at: word("flee", "หนี"), anchor: ANXI, until: B.cliff.start + 8, ...tab("road", brothers("walk", 1.6).map((f) => ({ ...f, x: f.x - 0.15 })), "ทิ้งงานแรก หนีไปพร้อมน้องทั้งสอง") },
      { id: "losing", at: word("cliff", "แพ้"), anchor: place("julu"), ...tab("camp", [{ who: "rebel", x: 0.3, pose: "hunch" }, { who: "rebel", x: 0.5, pose: "hunch" }, { who: "rebel", x: 0.7, pose: "sit" }], "กบฏผ้าเหลืองกำลังจะแพ้") },
      { id: "what", at: word("cliff", "ฆ่า"), anchor: place("julu"), until: B.cliff.end + 30, ...tab("study", [{ who: "zhangjiao", x: 0.45, pose: "hunch", size: 1.1 }], "อะไรฆ่าผู้นำของพวกเขา?") },
    ]}
  />
);
