import { interpolate } from "remotion";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { ArrowShot, Bushes, Grave, HanFigure, Horse, LOOK } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MID = 0.37;

// hook / night: Sun Jian rides alone below a moonlit hill; archers hidden in the bushes loose their arrows on
// `shoot`. The panel ends before any arrow lands.
const Ambush = ({ g, start, shoot }: { g: InsetGeom; start: number; shoot: number }) => {
  const ride = Math.min(Math.max(g.frame - start, 0), 160) * 1.1 * g.s;
  const hx = g.x + g.W * 0.18 + ride;
  const feet = g.ground + 26 * g.s;
  return (
    <g>
      <circle cx={g.x + g.W * 0.82} cy={g.y + 80 * g.s} r={26 * g.s} fill="#efe6c2" opacity={0.85} />
      <path d={`M${g.x} ${g.ground} L${g.x + g.W * 0.45} ${g.ground - 30 * g.s} L${g.x + g.W * 0.75} ${g.ground - 170 * g.s} L${g.x + g.W} ${g.ground - 120 * g.s} L${g.x + g.W} ${g.ground} Z`} fill="#1f2a22" />
      <Bushes x0={g.x + g.W * 0.58} x1={g.x + g.W * 0.98} y={g.ground - 60 * g.s} s={g.s} n={5} />
      {[0.66, 0.8, 0.92].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx} y={g.ground - (70 + i * 10) * g.s} scale={g.sc * 0.7} {...LOOK.soldier} robe="#36422a" flip phase={i} />
      ))}
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#252a22" />
      <HanFigure x={hx + 2 * g.sc} y={feet - 46 * g.sc} scale={g.sc} {...LOOK.sunjian} phase={2} />
      <Horse x={hx} y={feet - 37 * g.sc} scale={g.sc * 1.3} color="#6b3a22" />
      {[0, 1, 2, 3, 4].map((i) => {
        const p = interpolate(g.frame, [shoot + i * 4, shoot + i * 4 + 26], [0, 0.9], clamp);
        return <ArrowShot key={i} x0={g.x + g.W * (0.66 + (i % 3) * 0.12)} y0={g.ground - (100 + i * 6) * g.s} x1={hx + 30 * g.s} y1={feet - 70 * g.s} p={p} s={g.s * 1.2} />;
      })}
    </g>
  );
};

// sons: Sun Ce (16) and Sun Quan (9) at their father's grave, white mourning banners.
const Sons = ({ g }: { g: InsetGeom }) => {
  const feet = g.ground + 28 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#8a9a6a" />
      <Grave x={g.x + g.W * 0.62} y={g.ground + 8 * g.s} scale={g.sc} />
      <HanFigure x={g.x + g.W * 0.26} y={feet} scale={g.sc * 0.92} {...LOOK.sunce} robe="#efe9da" shade="#c9bfa8" phase={1} />
      <HanFigure x={g.x + g.W * 0.36} y={feet} scale={g.sc * 0.68} {...LOOK.sunquan} robe="#efe9da" shade="#c9bfa8" phase={2} />
      <text x={g.x + g.W * 0.55} y={g.y + 60 * g.s} textAnchor="middle" fontFamily={fonts.body} fontWeight={700} fontSize={26 * g.s} fill={C.wu}>
        ซุนเซ็ก 16 · ซุนกวน 9
      </text>
    </g>
  );
};

const XS = place("xianshan");
const XY = place("xiangyang");
const NIGHT: [string, string] = ["#0e1626", "#24324a"];

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "ambush-open", at: -8, anchor: XS, sky: NIGHT, draw: (g, a) => <Ambush g={g} start={a} shoot={B.hookq.start} /> },
      { id: "riderless", at: word("hookq", "ไม่"), anchor: XS, ...tab("night", [{ who: "horse", x: 0.5 }], "ไม่ได้กลับมาอีกเลย") },
      { id: "order", at: word("war", "ส่ง"), anchor: place("nanyang"), ...tab("camp", [{ who: "yuanshu", x: 0.62, pose: "sit", flip: true }, { who: "sunjian", x: 0.3, pose: "bow" }], "อ้วนสุดส่งซุนเกี๋ยนไปตีเล่าเปียว") },
      { id: "rout", at: word("siege", "แตก"), anchor: XY, ...tab("field", [{ who: "sunjian", x: 0.3, pose: "raise", hold: "sword", size: 1.1 }, { who: "huangzu", x: 0.72, pose: "flee", walk: 2.4 }], "ตีทัพหองจอแตก") },
      { id: "siege", at: word("siege", "ล้อม"), anchor: XY, until: B.night.start + 8, ...tab("city", [{ who: "soldier", x: 0.12, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }, { who: "soldier", x: 0.26, robe: "#a8382a", hold: "spear" }, { who: "sunjian", x: 0.38 }], "ล้อมเมืองซงหยง") },
      { id: "ambush", at: B.night.start, anchor: XS, sky: NIGHT, draw: (g, a) => <Ambush g={g} start={a} shoot={word("night", "ยิง")} /> },
      { id: "horse-age", at: B.age.start, anchor: XS, ...tab("night", [{ who: "horse", x: 0.45 }], "อายุเพียง 37 ปี") },
      { id: "rocks", at: word("novel", "หิน"), anchor: XS, label: "ภาพประกอบ · ในนิยาย", ...tab("hill", [{ who: "soldier", x: 0.66, robe: "#36422a", flip: true, size: 0.75, dy: -70, pose: "raise" }, { who: "soldier", x: 0.82, robe: "#36422a", flip: true, size: 0.75, dy: -84, pose: "raise" }], "หินและธนูนับร้อยในหุบเขา") },
      { id: "battle", at: word("record", "ศึก"), anchor: XS, until: B.sons.start + 8, ...tab("field", [{ who: "soldier", x: 0.25, robe: "#a8382a", hold: "spear" }, { who: "soldier", x: 0.4, robe: "#a8382a", hold: "spear" }, { who: "soldier", x: 0.62, robe: "#4a5a3a", hold: "spear", flip: true }, { who: "soldier", x: 0.78, robe: "#4a5a3a", hold: "spear", flip: true }], "ตายในศึกธรรมดา") },
      { id: "sons", at: B.sons.start, anchor: XY, until: B.vow.start + 4, sky: ["#d9d2bc", "#b9b29a"], draw: (g) => <Sons g={g} /> },
      // vow: Sun Ce's portrait is the picture
      { id: "seal", at: B.seal.start, anchor: place("nanyang"), ...tab("seal", [], "ตราหยกตกไปอยู่กับอ้วนสุด") },
      { id: "usurp", at: word("seal", "ประกาศ"), anchor: place("nanyang"), until: B.cliff.start + 8, ...tab("throne", [{ who: "yuanshu", x: 0.5, size: 1.05 }], "ประกาศตั้งตัวเป็นฮ่องเต้") },
      { id: "boys", at: B.cliff.start, anchor: XY, ...tab("field", [{ who: "sunce", x: 0.42, robe: "#efe9da" }, { who: "sunquan", x: 0.54, robe: "#efe9da", size: 0.7 }], "สองพี่น้องยังเด็กเกินจะรบ") },
      { id: "plotter", at: word("cliff", "ขุนนาง"), anchor: place("changan"), until: B.cliff.end + 30, ...tab("study", [{ who: "wangyun", x: 0.32 }, { who: "diaochan", x: 0.6, flip: true, from: word("cliff", "หญิง") }], "แผนหญิงงามคนเดียว") },
    ]}
  />
);
