import { interpolate } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { FeastTable, HanFigure, LOOK, WineCup } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MID = 0.37;

// drink: the allied lords at a banquet, cups raised, banners behind — nobody marching.
const Banquet = ({ g }: { g: InsetGeom }) => {
  const feet = g.ground + 28 * g.s;
  const lords = ["yuanshao", "yuanshu", "official", "official", "official"];
  const robes = [undefined, undefined, "#5a6b4a", "#6b3a2a", "#3d4f6b"];
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e2c79a" />
      {[0.1, 0.3, 0.7, 0.9].map((fx, i) => (
        <g key={fx}>
          <line x1={g.x + g.W * fx} y1={g.ground} x2={g.x + g.W * fx} y2={g.y + 40 * g.s} stroke="#6b4a2b" strokeWidth={4 * g.s} />
          <path d={`M${g.x + g.W * fx} ${g.y + 44 * g.s} l${60 * g.s} ${8 * g.s} l${-4 * g.s} ${70 * g.s} l${-56 * g.s} ${-6 * g.s} Z`} fill={i % 2 ? "#7a5230" : "#8a6a3c"} stroke="#2a1b0e" strokeWidth={1.2 * g.s} />
        </g>
      ))}
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#9c8a66" />
      {lords.map((k, i) => (
        <HanFigure key={i} x={g.x + g.W * (0.12 + i * 0.19)} y={feet - 10 * g.s} scale={g.sc * 0.9} {...LOOK[k]} {...(robes[i] ? { robe: robes[i] } : {})} pose="sit" hold="cup" flip={i > 2} phase={i} />
      ))}
      <FeastTable x={g.cx} y={feet + 6 * g.s} w={g.W / g.sc - 60} scale={g.sc} />
    </g>
  );
};

// guanyu → warm (novel): a cup poured and steaming on the table; Guan Yu rides out and walks back in with Hua
// Xiong's plumed helmet on "ถือ" — the steam still rising.
const Warm = ({ g, back }: { g: InsetGeom; back: number }) => {
  const k = usePopIn(back);
  const feet = g.ground + 28 * g.s;
  const walkIn = interpolate(g.frame, [back, back + 40], [g.W * 0.25, 0], clamp);
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#d9c39a" />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#8c6a3a" />
      <rect x={g.x + g.W * 0.18} y={g.ground - 14 * g.s} width={g.W * 0.26} height={16 * g.s} fill="#7a3a24" stroke="#2a1b0e" strokeWidth={1.4 * g.s} />
      <WineCup x={g.x + g.W * 0.31} y={g.ground - 14 * g.s} scale={g.sc * 1.3} />
      <HanFigure x={g.x + g.W * 0.12} y={feet} scale={g.sc} {...LOOK.caocao} pose="sit" phase={1} />
      <g opacity={Math.min(1, k)}>
        <HanFigure x={g.x + g.W * 0.62 + walkIn} y={feet} scale={g.sc * 1.05} {...LOOK.guanyu} pose={g.frame < back + 40 ? "walk" : "stand"} flip phase={2} />
        <g transform={`translate(${g.x + g.W * 0.55 + walkIn},${feet - 52 * g.sc})`}>
          <path d={`M${-12 * g.sc} 0 Q0 ${-18 * g.sc} ${12 * g.sc} 0 Z`} fill="#3a3a40" stroke="#2a1b0e" strokeWidth={1.2 * g.s} />
          <path d={`M0 ${-12 * g.sc} q${-8 * g.sc} ${-12 * g.sc} ${-18 * g.sc} ${-10 * g.sc}`} stroke="#a8382a" strokeWidth={3 * g.s} fill="none" />
        </g>
      </g>
      <text x={g.x + g.W * 0.55} y={g.y + 60 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill={C.wu}>
        เหล้ายังอุ่น
      </text>
    </g>
  );
};

const SZ = place("suanzao");
const LY = place("luoyang");
const NOVEL = "ภาพประกอบ · ในนิยาย";
const idle = [0.1, 0.24, 0.38, 0.52, 0.66, 0.8].map((x, i) => ({ who: "soldier", x, pose: "sit" as const, size: 0.85, robe: ["#7a5230", "#6b5236", "#8a6a3c"][i % 3] }));

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "idle", at: -8, anchor: SZ, ...tab("camp", idle, "ทหารกว่าแสน นั่งรอ") },
      { id: "lords", at: word("hookq", "รวม"), anchor: SZ, ...tab("camp", [{ who: "yuanshao", x: 0.22 }, { who: "yuanshu", x: 0.42 }, { who: "official", x: 0.62, robe: "#5a6b4a" }, { who: "official", x: 0.8, robe: "#6b3a2a", flip: true }], "ทำไมทุกคนนั่งรอ") },
      { id: "chief", at: word("camps", "ตั้ง"), anchor: place("henei"), until: B.count.start + 6, ...tab("camp", [{ who: "yuanshao", x: 0.45, size: 1.2, pose: "raise", hold: "sword" }, { who: "soldier", x: 0.2, flag: { text: "袁", color: "#7a5230" } }, { who: "soldier", x: 0.75, flag: { text: "盟", color: "#a8382a" }, flip: true }], "อ้วนเสี้ยว แม่ทัพใหญ่") },
      // count: the 190 scoreboard map and the novel/record stamp carry the picture
      { id: "banquet", at: B.drink.start, anchor: SZ, sky: ["#e2c79a", "#e2c79a"], draw: (g) => <Banquet g={g} /> },
      { id: "cao-go", at: word("cao", "ยก"), anchor: SZ, ...tab("road", [{ who: "caocao", x: 0.2, ride: true, walk: 2.4 }, { who: "soldier", x: 0.06, walk: 2.4, hold: "spear", robe: "#2f4f86" }], "โจโฉยกทัพบุกลำพัง") },
      { id: "cao-lost", at: word("cao", "แพ้"), anchor: place("xingyang"), until: B.huaxiong.start + 8, ...tab("field", [{ who: "caocao", x: 0.7, pose: "flee", walk: -2.2, flip: true }, { who: "soldier", x: 0.95, walk: -2.2, hold: "spear", robe: "#3d3f5c", flip: true }], "แพ้ยับ เกือบไม่รอด") },
      { id: "hua", at: word("huaxiong", "ฆ่า"), anchor: place("hulao"), label: NOVEL, until: B.guanyu.start + 4, ...tab("field", [{ who: "huaxiong", x: 0.32, pose: "raise", hold: "halberd", size: 1.15 }, { who: "official", x: 0.7, pose: "flee", walk: 2.2, robe: "#7a5230" }, { who: "official", x: 0.84, pose: "flee", walk: 2.2, robe: "#5a3a6e" }], "ไม่มีใครกล้ารับมือ") },
      // guanyu: his portrait is the picture
      { id: "warm", at: B.warm.start, anchor: place("hulao"), label: NOVEL, sky: ["#d9c39a", "#d9c39a"], draw: (g) => <Warm g={g} back={word("warm", "ถือ")} /> },
      { id: "sun-win", at: word("record", "ตัด"), anchor: place("nanyang"), ...tab("field", [{ who: "sunjian", x: 0.35, pose: "raise", hold: "sword", size: 1.1 }, { who: "soldier", x: 0.15, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }, { who: "soldier", x: 0.75, robe: "#3d3f5c", pose: "flee", walk: 2, flip: false }], "ทัพซุนเกี๋ยนตัดหัวฮัวหยง") },
      { id: "nobody", at: word("record", "กวนอู"), anchor: place("hulao"), ...tab("camp", [{ who: "guanyu", x: 0.5, size: 0.9 }], "ตอนนั้น กวนอูยังไม่มีใครรู้จัก") },
      { id: "sun-go", at: word("sun", "บุก"), anchor: place("nanyang"), until: B.cliff.start + 8, ...tab("road", [{ who: "sunjian", x: 0.25, ride: true, walk: 2.4 }, { who: "soldier", x: 0.08, walk: 2.4, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }], "บุกใกล้ถึงเมืองหลวง") },
      { id: "burn", at: word("cliff", "เผา"), anchor: LY, ...tab("fire", [], "เผาเมืองหลวง") },
      { id: "emperor", at: word("cliff", "ฮ่องเต้"), anchor: LY, until: B.cliff.end + 30, ...tab("road", [{ who: "dongzhuo", x: 0.7, ride: true, walk: -2, flip: true }, { who: "emperor", x: 0.86, walk: -2, flip: true, size: 0.7 }], "พาฮ่องเต้หนีไปไหน?") },
    ]}
  />
);
