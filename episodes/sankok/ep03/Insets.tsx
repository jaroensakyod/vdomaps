import { interpolate, spring } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { HanFigure, LOOK, ThroneRoom } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// seer → prophecy → laugh: the old judge of men sits on his mat and points; Cao Cao laughs on "หัวเราะ".
export const Reading = ({ g, laugh }: { g: InsetGeom; laugh: number }) => (
  <g>
    <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#d9c39a" />
    {[0.2, 0.8].map((fx) => (
      <g key={fx}>
        <rect x={g.x + g.W * fx - 70 * g.s} y={g.y + 70 * g.s} width={140 * g.s} height={150 * g.s} fill="#efe2bd" stroke="#6b4a2b" strokeWidth={6 * g.s} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={g.x + g.W * fx - 70 * g.s + i * 35 * g.s} y1={g.y + 70 * g.s} x2={g.x + g.W * fx - 70 * g.s + i * 35 * g.s} y2={g.y + 220 * g.s} stroke="#6b4a2b" strokeWidth={3 * g.s} />
        ))}
        {[1, 2].map((i) => (
          <line key={i} x1={g.x + g.W * fx - 70 * g.s} y1={g.y + 70 * g.s + i * 50 * g.s} x2={g.x + g.W * fx + 70 * g.s} y2={g.y + 70 * g.s + i * 50 * g.s} stroke="#6b4a2b" strokeWidth={3 * g.s} />
        ))}
      </g>
    ))}
    <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#8c6a3a" />
    <rect x={g.x + g.W * 0.22} y={g.ground + 14 * g.s} width={150 * g.s} height={16 * g.s} rx={4 * g.s} fill="#b99a5a" stroke="#2a1b0e" strokeWidth={1.4 * g.s} />
    <HanFigure x={g.x + g.W * 0.3} y={g.ground + 26 * g.s} scale={g.sc} {...LOOK.seer} pose="sit" hold="point" phase={1} />
    <HanFigure x={g.x + g.W * 0.62} y={g.ground + 30 * g.s} scale={g.sc} {...LOOK.caocao} pose={g.frame >= laugh ? "laugh" : "stand"} flip phase={2} />
    {g.frame >= laugh && (
      <text x={g.x + g.W * 0.72} y={g.y + 130 * g.s} fontFamily={fonts.title} fontSize={44 * g.s} fill={C.wu} opacity={interpolate(g.frame, [laugh, laugh + 6], [0, 1], clamp)} transform={`rotate(-8,${g.x + g.W * 0.72},${g.y + 130 * g.s})`}>
        ฮ่า ฮ่า!
      </text>
    )}
  </g>
);

// emperor → cliff: the empty throne, two princes either side, a "?" on "เลือก"; on cliff the general (He Jin)
// and the chief eunuch step in from the edges.
export const EmptyThrone = ({ g, ask, rivals }: { g: InsetGeom; ask: number; rivals: number }) => {
  const q = g.frame < ask ? 0 : spring({ frame: g.frame - ask, fps: 30, config: { damping: 9 } });
  const k = usePopIn(rivals);
  const feet = g.ground + 30 * g.s;
  return (
    <g>
      <ThroneRoom x={g.cx} y={g.ground + 4 * g.s} w={g.W} h={g.H} s={g.s * 1.1} />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#4a2a1a" />
      <HanFigure x={g.x + g.W * 0.3} y={feet} scale={g.sc * 0.82} {...LOOK.prince} phase={1} />
      <HanFigure x={g.x + g.W * 0.7} y={feet} scale={g.sc * 0.62} {...LOOK.emperor} flip phase={2} />
      {q > 0 && (
        <text x={g.cx} y={g.ground - 140 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={90 * g.s * q} fill="#f3e6c4" stroke="#2a1b0e" strokeWidth={4 * g.s} paintOrder="stroke">
          ?
        </text>
      )}
      <g opacity={Math.min(1, k)}>
        <HanFigure x={g.x + g.W * 0.1 + (1 - Math.min(1, k)) * -60 * g.s} y={feet} scale={g.sc * 0.95} {...LOOK.hejin} phase={3} />
        <HanFigure x={g.x + g.W * 0.9 + (1 - Math.min(1, k)) * 60 * g.s} y={feet} scale={g.sc * 0.95} {...LOOK.zhangrang} flip phase={4} />
      </g>
    </g>
  );
};

const LY = place("luoyang");
const GZ = place("guangzong");
const NOVEL = "ภาพประกอบ";

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "leader", at: -8, anchor: GZ, ...tab("field", [{ who: "zhangjiao", x: 0.5, pose: "raise", size: 1.2 }, { who: "rebel", x: 0.2 }, { who: "rebel", x: 0.32 }, { who: "rebel", x: 0.72, flip: true }, { who: "rebel", x: 0.84, flip: true }], "ผู้นำกบฏหลายแสนคน") },
      { id: "how", at: word("hookq", "ตาย"), anchor: GZ, ...tab("study", [{ who: "zhangjiao", x: 0.45, pose: "hunch", size: 1.1 }], "เขาตายยังไง?") },
      { id: "ill", at: word("ill", "ป่วย"), anchor: GZ, ...tab("night", [{ who: "zhangjiao", x: 0.4, pose: "sit" }, { who: "rebel", x: 0.66, hold: "bowl", flip: true }], "ป่วยตาย ก่อนเมืองแตก") },
      { id: "dig", at: word("head", "ขุด"), anchor: GZ, ...tab("tomb", [{ who: "huangfusong", x: 0.22, hold: "point" }, { who: "soldier", x: 0.42, pose: "hunch", hold: "hoe" }, { who: "soldier", x: 0.84, pose: "hunch", hold: "hoe", flip: true }], "แม่ทัพหลวงขุดศพขึ้นมา") },
      { id: "rout", at: word("head", "กบฏ"), anchor: GZ, until: B.cost.start + 8, ...tab("field", [{ who: "rebel", x: 0.3, pose: "flee", walk: 2.4 }, { who: "rebel", x: 0.46, pose: "flee", walk: 2.4 }, { who: "soldier", x: 0.12, walk: 2, hold: "spear", robe: "#9a7b2f" }], "กบฏแตกพ่ายในปีเดียว") },
      { id: "cost", at: word("cost", "ยอม"), anchor: LY, ...tab("throne", [{ who: "official", x: 0.25, pose: "bow" }, { who: "official", x: 0.75, pose: "bow", flip: true, robe: "#6b3a2a" }], "ยอมให้เจ้าเมืองตั้งทัพเอง") },
      { id: "lords", at: word("governors", "ภาษี"), anchor: LY, until: B.cao.start + 8, ...tab("camp", [{ who: "yuanshao", x: 0.3 }, { who: "soldier", x: 0.5, flag: { text: "袁", color: "#7a5230" } }, { who: "official", x: 0.72, robe: "#5a6b4a", flip: true }], "คุมทั้งทัพ ทั้งภาษี") },
      { id: "small", at: word("cao", "ร่าง"), anchor: LY, until: B.seer.start + 8, ...tab("camp", [{ who: "soldier", x: 0.3, size: 1.15, hold: "spear" }, { who: "caocao", x: 0.5, size: 0.85 }, { who: "soldier", x: 0.7, size: 1.15, hold: "spear", flip: true }], "ชายร่างเล็ก ชื่อโจโฉ") },
      { id: "reading", at: B.seer.start, anchor: LY, sky: ["#d9c39a", "#d9c39a"], draw: (g) => <Reading g={g} laugh={1e9} /> },
      { id: "laugh", at: word("laugh", "หัวเราะ"), anchor: LY, sky: ["#d9c39a", "#d9c39a"], until: B.emperor.start + 8, draw: (g) => <Reading g={g} laugh={word("laugh", "หัวเราะ")} /> },
      { id: "throne", at: word("emperor", "สวรรคต"), anchor: LY, label: NOVEL, sky: ["#6e2a1f", "#6e2a1f"], draw: (g) => <EmptyThrone g={g} ask={word("emperor", "เลือก")} rivals={1e9} /> },
      { id: "rivals", at: B.cliff.start, anchor: LY, sky: ["#6e2a1f", "#6e2a1f"], draw: (g) => <EmptyThrone g={g} ask={-1} rivals={B.cliff.start} /> },
      { id: "gate", at: word("cliff", "ประตู"), anchor: LY, until: B.cliff.end + 30, ...tab("gate", [{ who: "soldier", x: 0.3, hold: "torch" }, { who: "soldier", x: 0.84, hold: "torch", flip: true }], "ใครจะลงมือก่อน?") },
    ]}
  />
);
