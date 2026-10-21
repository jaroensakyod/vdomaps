import { interpolate } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { Farmhouse, HanFigure, LOOK, Mirror, Pig } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// 9:16: between the title / stamp cards (top 20 %) and the character cards (57 %).
const MID = 0.37;

// hook → mirror (novel): Dong Zhuo dozes with his back turned, Lü Bu on guard; Cao Cao comes up with the sword.
// On "เงา" the mirror flashes, Dong turns, and Cao kneels offering the sword as a gift.
const Chamber = ({ g, from, lvbuOut, glint, kneel }: { g: InsetGeom; from: number; lvbuOut: number; glint: number; kneel: number }) => {
  const f = g.frame;
  const step = Math.min(Math.max(f - from, 0), 90) * 0.9 * g.s;
  const lb = 1 - interpolate(f, [lvbuOut, lvbuOut + 10], [0, 1], clamp);
  const flash = interpolate(f, [glint, glint + 4, glint + 20], [0, 1, 0.3], clamp);
  const feet = g.ground + 28 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2a1f" />
      {[0.12, 0.88].map((fx) => (
        <rect key={fx} x={g.x + g.W * fx - 12 * g.s} y={g.y} width={24 * g.s} height={g.H} fill="#a8382a" />
      ))}
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#3a2016" />
      <rect x={g.x + g.W * 0.58} y={g.ground - 18 * g.s} width={g.W * 0.3} height={30 * g.s} rx={6 * g.s} fill="#8c6a3a" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
      <Mirror x={g.x + g.W * 0.92} y={g.ground + 8 * g.s} scale={g.sc * 0.9} glint={flash} />
      <HanFigure x={g.x + g.W * 0.73} y={feet - 6 * g.s} scale={g.sc * 1.3} {...LOOK.dongzhuo} pose="sit" flip={f < glint} phase={1} />
      <g opacity={lb}>
        <HanFigure x={g.x + g.W * 0.5} y={feet} scale={g.sc} {...LOOK.lvbu} hold="halberd" flip phase={2} />
      </g>
      <HanFigure x={g.x + g.W * 0.14 + step} y={feet} scale={g.sc * 1.3} {...LOOK.caocao} pose={f >= kneel ? "bow" : f < from + 90 ? "walk" : "stand"} hold="sword" phase={3} />
      {f >= kneel && (
        <text x={g.x + g.W * 0.62} y={g.y + 56 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={32 * g.s} fill="#f3e6c4" opacity={interpolate(f, [kneel, kneel + 8], [0, 1], clamp)}>
          "ข้านำดาบมาถวาย"
        </text>
      )}
    </g>
  );
};

// inn → kill → quote: night at Lü Boshe's house; knives being sharpened out back. Cao Cao draws his sword in the
// doorway on "ชัก"; on "หมู" the pig tied up behind the house shows what the knives were for. Nobody is drawn hurt.
const Inn = ({ g, draw, pig }: { g: InsetGeom; draw: number; pig: number }) => {
  const p = usePopIn(pig);
  const feet = g.ground + 26 * g.s;
  return (
    <g>
      <circle cx={g.x + g.W * 0.12} cy={g.y + 80 * g.s} r={24 * g.s} fill="#efe6c2" opacity={0.85} />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#2b2a22" />
      <Farmhouse x={g.x + g.W * 0.36} y={g.ground + 6 * g.s} scale={g.sc * 1.05} />
      <HanFigure x={g.x + g.W * 0.36} y={feet} scale={g.sc} {...LOOK.caocao} pose={g.frame >= draw ? "raise" : "stand"} hold="sword" phase={1} />
      <g opacity={Math.min(1, p)}>
        <Pig x={g.x + g.W * 0.78} y={feet} scale={g.sc * 1.1} />
        <HanFigure x={g.x + g.W * 0.92} y={feet} scale={g.sc * 0.9} robe="#6b5a44" shade="#4e3f2c" flip phase={2} />
        <text x={g.x + g.W * 0.8} y={g.y + 56 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill="#f3e6c4">
          มีดนั้น ลับไว้เชือดหมู
        </text>
      </g>
    </g>
  );
};

// Shot 1 (hook): close-up — the seven-star sword slides out of a dark-red sleeve.
const Sleeve = ({ g, from }: { g: InsetGeom; from: number }) => {
  const k = interpolate(g.frame, [from, from + 40], [0, 1], clamp);
  const cx = g.x + g.W * 0.5, cy = g.y + g.H * 0.55;
  const S = g.s * 1.6;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a1d16" />
      <g transform={`translate(${cx},${cy}) rotate(-18)`}>
        <g transform={`translate(${(k * 120 - 40) * S},0)`}>
          <rect x={-40 * S} y={-5 * S} width={150 * S} height={10 * S} fill="#d7dbe0" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
          <path d={`M${110 * S} ${-5 * S} L${128 * S} 0 L${110 * S} ${5 * S} Z`} fill="#d7dbe0" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={(-20 + i * 18) * S} cy={0} r={2.6 * S} fill="#e0b63e" />
          ))}
          <line x1={-30 * S} y1={-3 * S} x2={100 * S} y2={-3 * S} stroke="#fff" strokeWidth={1.2 * g.s} opacity={0.6} />
        </g>
        <path d={`M${-260 * S} ${-60 * S} Q${-120 * S} ${-70 * S} ${-30 * S} ${-40 * S} L${-20 * S} ${40 * S} Q${-120 * S} ${70 * S} ${-260 * S} ${60 * S} Z`} fill="#7a2a24" stroke="#2a1b0e" strokeWidth={2 * g.s} />
        <path d={`M${-30 * S} ${-40 * S} L${-20 * S} ${40 * S}`} stroke="#c9a03c" strokeWidth={5 * g.s} />
        <ellipse cx={-14 * S} cy={6 * S} rx={16 * S} ry={20 * S} fill="#e2b48a" stroke="#2a1b0e" strokeWidth={1.6 * g.s} />
      </g>
      <text x={g.x + g.W * 0.78} y={g.y + 70 * g.s} textAnchor="middle" fontFamily="'Microsoft YaHei', 'SimSun', serif" fontSize={40 * g.s} fill="#e0b63e">七星刀</text>
    </g>
  );
};

// Shot 2 (hookq, on "ลิ"): Dong Zhuo on his couch with Lü Bu standing guard at his side, halberd up.
const Guard = ({ g }: { g: InsetGeom }) => {
  const feet = g.ground + 28 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2a1f" />
      {[0.08, 0.92].map((fx) => (
        <rect key={fx} x={g.x + g.W * fx - 12 * g.s} y={g.y} width={24 * g.s} height={g.H} fill="#a8382a" />
      ))}
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#3a2016" />
      <rect x={g.x + g.W * 0.3} y={g.ground - 18 * g.s} width={g.W * 0.32} height={30 * g.s} rx={6 * g.s} fill="#8c6a3a" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
      <HanFigure x={g.x + g.W * 0.46} y={feet - 6 * g.s} scale={g.sc * 1.4} {...LOOK.dongzhuo} pose="sit" phase={1} />
      <HanFigure x={g.x + g.W * 0.72} y={feet} scale={g.sc * 1.45} {...LOOK.lvbu} hold="halberd" flip phase={2} />
      <text x={g.x + g.W * 0.5} y={g.y + 62 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill="#f3e6c4">ลิโป้ยืนเฝ้า</text>
    </g>
  );
};

// Shot 3 (novel, on "ยืม"): Wang Yun hands Cao Cao the sword in his study at night.
const Lend = ({ g, from }: { g: InsetGeom; from: number }) => {
  const feet = g.ground + 28 * g.s;
  const give = interpolate(g.frame, [from + 10, from + 40], [0, 1], clamp);
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a4560" />
      <rect x={g.x + g.W * 0.82} y={g.y + 60 * g.s} width={120 * g.s} height={110 * g.s} fill="#e6cf8a" opacity={0.9} />
      <line x1={g.x + g.W * 0.82 + 60 * g.s} y1={g.y + 60 * g.s} x2={g.x + g.W * 0.82 + 60 * g.s} y2={g.y + 170 * g.s} stroke="#4a3320" strokeWidth={4 * g.s} />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#3a2a20" />
      <HanFigure x={g.x + g.W * 0.3} y={feet} scale={g.sc * 1.4} {...LOOK.wangyun} hold={give < 0.5 ? "sword" : "none"} phase={1} />
      <HanFigure x={g.x + g.W * 0.68} y={feet} scale={g.sc * 1.4} {...LOOK.caocao} hold={give >= 0.5 ? "sword" : "none"} flip phase={2} />
      <text x={g.x + g.W * 0.5} y={g.y + 62 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill="#f3e6c4" opacity={give}>ยืมดาบเจ็ดดาว</text>
    </g>
  );
};

const LY = place("luoyang");
const CG = place("chenggao");
const NOVEL = "ภาพประกอบ · ในนิยาย";

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "sleeve", at: -8, anchor: LY, draw: (g, a) => <Sleeve g={g} from={a} />, sky: ["#3a1d16", "#3a1d16"], label: NOVEL },
      { id: "guard", at: word("hookq", "ลิ"), anchor: LY, draw: (g) => <Guard g={g} />, sky: ["#5a2a1f", "#5a2a1f"], label: NOVEL },
      { id: "lend", at: word("novel", "ยืม"), anchor: LY, draw: (g, a) => <Lend g={g} from={a} />, sky: ["#4a4560", "#4a4560"], label: NOVEL },
      { id: "chamber", at: word("novel", "เข้า"), anchor: LY, sky: ["#5a2a1f", "#5a2a1f"], label: NOVEL,
        draw: (g, a) => <Chamber g={g} from={a} lvbuOut={-1000} glint={word("mirror", "เงา")} kneel={word("mirror", "คุกเข่า")} /> },
      { id: "flee", at: word("flee", "ลอง"), anchor: LY, label: NOVEL, ...tab("city", [{ who: "caocao", x: 0.5, ride: true, walk: -3.2, flip: true }], "ควบหนีออกจากเมืองหลวง") },
      { id: "refuse", at: word("record", "ปฏิเสธ"), anchor: LY, ...tab("throne", [{ who: "dongzhuo", x: 0.62, pose: "sit", flip: true, size: 1.05 }, { who: "caocao", x: 0.28, pose: "bow" }], "ปฏิเสธตำแหน่ง") },
      { id: "disguise", at: word("record", "ปลอม"), anchor: LY, ...tab("road", [{ who: "caocao", x: 0.2, walk: 1.6, robe: "#6b5a44", hold: "bundle" }], "ปลอมชื่อ หนีไปทางตะวันออก") },
      { id: "visit", at: B.inn.start, anchor: CG, ...tab("house", [{ who: "caocao", x: 0.2 }, { who: "lvboshe", x: 0.58, flip: true }], "บ้านลิแปะเฉีย เพื่อนเก่าของพ่อ") },
      { id: "inn", at: word("inn", "ได้ยิน"), anchor: CG, until: B.quote.start + 4, sky: ["#0e1626", "#24324a"], draw: (g) => <Inn g={g} draw={word("kill", "ชัก")} pig={word("kill", "หมู")} /> },
      // quote: Cao Cao's portrait is the picture
      { id: "rob", at: word("twist", "ครอบครัว"), anchor: CG, top: 0.42, ...tab("house", [{ who: "caocao", x: 0.16, hold: "sword" }, { who: "official", x: 0.62, robe: "#6b5a44", hold: "hoe", flip: true, walk: -0.6 }, { who: "official", x: 0.78, robe: "#5e5038", hold: "spear", flip: true, walk: -0.6 }], "บางฉบับ: ครอบครัวนั้นคิดปล้นเขาก่อน") },
      { id: "words", at: word("twist", "คำ"), anchor: CG, top: 0.42, until: B.cliff.start + 6, ...tab("study", [{ who: "caocao", x: 0.4, pose: "stand", size: 1.15 }], "ไม่ได้พูดถึงคนทั้งแผ่นดิน") },
      { id: "lords", at: word("cliff", "ประกาศ"), anchor: place("suanzao"), ...tab("camp", [{ who: "yuanshao", x: 0.3, pose: "raise", hold: "sword" }, { who: "yuanshu", x: 0.5 }, { who: "soldier", x: 0.68, flag: { text: "袁", color: "#7a5230" } }, { who: "soldier", x: 0.84, flag: { text: "討", color: "#a8382a" } }], "ยกทัพปราบตั๋งโต๊ะ") },
      { id: "count", at: word("cliff", "สิบ"), anchor: place("suanzao"), until: B.cliff.end + 30, ...tab("camp", [0.12, 0.26, 0.4, 0.54, 0.68, 0.82].map((x, i) => ({ who: i % 2 ? "official" : "yuanshu", x, size: 0.8, robe: ["#7a5230", "#5a3a6e", "#3d4f6b", "#6b3a2a", "#5a6b4a", "#7a2a24"][i] })), "สิบแปดหัวเมือง?") },
    ]}
  />
);
