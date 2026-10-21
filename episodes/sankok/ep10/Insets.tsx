import { interpolate } from "remotion";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { HanFigure, LOOK, OfficeGate } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MID = 0.37;

// hook → halberd (novel): Diaochan between Lü Bu and Dong Zhuo, Wang Yun watching from the side.
// On "ขว้าง" Dong Zhuo hurls a short halberd at Lü Bu, who ducks; it sticks in the pillar behind him.
const Triangle = ({ g, throwAt }: { g: InsetGeom; throwAt: number }) => {
  const feet = g.ground + 28 * g.s;
  const p = interpolate(g.frame, [throwAt, throwAt + 12], [0, 1], clamp);
  const duck = interpolate(g.frame, [throwAt + 2, throwAt + 8, throwAt + 30, throwAt + 40], [0, 1, 1, 0], clamp);
  const x0 = g.x + g.W * 0.72, x1 = g.x + g.W * 0.12;
  const hx = x0 + (x1 - x0) * p;
  const hy = feet - 80 * g.sc - Math.sin(p * Math.PI) * 20 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6e2a1f" />
      <rect x={g.x + g.W * 0.08} y={g.y} width={26 * g.s} height={g.H} fill="#a8382a" />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#3a2016" />
      <HanFigure x={g.x + g.W * 0.24} y={feet + duck * 14 * g.s} scale={g.sc} {...LOOK.lvbu} pose={duck > 0.5 ? "crouch" : "stand"} phase={1} />
      <HanFigure x={g.x + g.W * 0.47} y={feet} scale={g.sc * 0.95} {...LOOK.diaochan} flip={g.frame < throwAt} phase={2} />
      <HanFigure x={g.x + g.W * 0.72} y={feet} scale={g.sc * 1.05} {...LOOK.dongzhuo} pose={g.frame >= throwAt && g.frame < throwAt + 20 ? "raise" : "stand"} flip phase={3} />
      <HanFigure x={g.x + g.W * 0.92} y={feet - 6 * g.s} scale={g.sc * 0.85} {...LOOK.wangyun} flip phase={4} />
      {p > 0 && (
        <g transform={`translate(${hx},${hy}) rotate(${p < 1 ? -90 : -80})`}>
          <line x1={0} y1={-40 * g.sc} x2={0} y2={30 * g.sc} stroke="#6b4a2b" strokeWidth={3 * g.s} />
          <path d={`M${-3 * g.sc} ${-40 * g.sc} L0 ${-52 * g.sc} L${3 * g.sc} ${-40 * g.sc} Z`} fill="#b9bcc0" />
        </g>
      )}
    </g>
  );
};

// kill: the palace gate at Chang'an; Lü Bu and the guards raise their halberds — Dong Zhuo's carriage stands empty.
const Gate = ({ g, strike }: { g: InsetGeom; strike: number }) => {
  const up = g.frame >= strike;
  const feet = g.ground + 28 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#9c8a66" />
      <OfficeGate x={g.x + g.W * 0.62} y={g.ground + 6 * g.s} scale={g.sc * 1.05} />
      {[0.82, 0.92].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx} y={feet} scale={g.sc * 0.9} {...LOOK.soldier} pose={up ? "raise" : "stand"} hold="spear" flip phase={i} />
      ))}
      <HanFigure x={g.x + g.W * 0.34} y={feet} scale={g.sc * 1.05} {...LOOK.lvbu} pose={up ? "raise" : "walk"} hold="halberd" phase={3} />
      <g transform={`translate(${g.x + g.W * 0.12},${feet})`}>
        <rect x={-40 * g.s} y={-60 * g.s} width={70 * g.s} height={44 * g.s} fill="#6b3a22" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
        <path d={`M${-48 * g.s} ${-60 * g.s} L${-5 * g.s} ${-80 * g.s} L${38 * g.s} ${-60 * g.s} Z`} fill="#3d3f5c" stroke="#2a1b0e" strokeWidth={1.5 * g.s} />
        {[-24, 14].map((wx) => (
          <circle key={wx} cx={wx * g.s} cy={-14 * g.s} r={14 * g.s} fill="none" stroke="#2a1b0e" strokeWidth={4 * g.s} />
        ))}
      </g>
      {up && (
        <text x={g.x + g.W * 0.4} y={g.y + 60 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={32 * g.s} fill={C.wu}>
          ตั๋งโต๊ะสิ้นแล้ว
        </text>
      )}
    </g>
  );
};

const CA = place("changan");
const NOVEL = "ภาพประกอบ · ในนิยาย";
const RED: [string, string] = ["#6e2a1f", "#6e2a1f"];

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "triangle-open", at: -8, anchor: CA, label: NOVEL, sky: RED, draw: (g) => <Triangle g={g} throwAt={1e9} /> },
      { id: "fooled", at: word("hookq", "หลอก"), anchor: CA, label: NOVEL, ...tab("palace", [{ who: "lvbu", x: 0.3, size: 1.1 }, { who: "diaochan", x: 0.55, flip: true }], "ถูกหญิงคนเดียวหลอก?") },
      { id: "to-lvbu", at: word("novel", "ยก"), anchor: CA, label: NOVEL, ...tab("study", [{ who: "wangyun", x: 0.22 }, { who: "diaochan", x: 0.42 }, { who: "lvbu", x: 0.68, flip: true }], "ยกให้ลิโป้") },
      { id: "to-dong", at: word("novel", "ตั๋ง"), anchor: CA, label: NOVEL, ...tab("palace", [{ who: "wangyun", x: 0.22 }, { who: "diaochan", x: 0.42 }, { who: "dongzhuo", x: 0.7, flip: true }], "แล้วยกให้ตั๋งโต๊ะด้วย") },
      { id: "triangle", at: word("novel", "แย่ง"), anchor: CA, label: NOVEL, until: B.record.start + 8, sky: RED, draw: (g) => <Triangle g={g} throwAt={word("halberd", "ขว้าง")} /> },
      { id: "maid", at: word("record", "สาว"), anchor: CA, ...tab("palace", [{ who: "lvbu", x: 0.36 }, { who: "diaochan", x: 0.56, flip: true, robe: "#b9a888" }], "มีแค่สาวใช้ที่ลิโป้แอบคบ") },
      { id: "fear", at: word("record", "กลัว"), anchor: CA, until: B.plot.start + 8, ...tab("night", [{ who: "lvbu", x: 0.4, pose: "hunch" }], "กลัวความจะแตก") },
      { id: "plot", at: word("plot", "ชวน"), anchor: CA, until: B.wangyun.start + 4, ...tab("study", [{ who: "wangyun", x: 0.32, hold: "point" }, { who: "lvbu", x: 0.62, flip: true }], "ชวนร่วมแผนฆ่าตั๋งโต๊ะ") },
      // wangyun: his portrait is the picture
      { id: "arrive", at: B.kill.start, anchor: CA, ...tab("gate", [{ who: "dongzhuo", x: 0.2, walk: 1.4 }, { who: "soldier", x: 0.08, walk: 1.4, robe: "#3d3f5c" }], "เข้าวังตามนัด") },
      { id: "gate", at: word("kill", "แทง"), anchor: CA, until: B.navel.start + 8, sky: ["#d6bf8f", "#c9a46a"], draw: (g) => <Gate g={g} strike={word("kill", "แทง")} /> },
      { id: "lamp", at: word("navel", "ไฟ"), anchor: CA, top: 0.42, until: B.cliff.start + 8, ...tab("night", [{ who: "soldier", x: 0.3, hold: "torch" }, { who: "soldier", x: 0.72, hold: "spear", flip: true }], "ไฟลุกสว่างอยู่หลายวัน") },
      { id: "hero", at: B.cliff.start, anchor: CA, ...tab("palace", [{ who: "lvbu", x: 0.45, pose: "raise", hold: "halberd", size: 1.15 }], "ลิโป้กลายเป็นวีรบุรุษ") },
      { id: "revenge", at: word("cliff", "ยก"), anchor: [106.2, 35.6], ...tab("road", [{ who: "soldier", x: 0.2, ride: true, walk: 2.4, robe: "#3d3f5c" }, { who: "soldier", x: 0.05, walk: 2.4, robe: "#3d3f5c", flag: { text: "董", color: "#3d3f5c" } }], "ลูกน้องตั๋งโต๊ะกลับมาล้างแค้น") },
      { id: "run", at: word("cliff", "หนี"), anchor: CA, until: B.cliff.end + 30, ...tab("road", [{ who: "lvbu", x: 0.7, ride: true, walk: -2.6, flip: true }], "ลิโป้จะหนีไปพึ่งใคร?") },
    ]}
  />
);
