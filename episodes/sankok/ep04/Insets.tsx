import { interpolate } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { Fireflies, HanFigure, LOOK, OfficeGate, River } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RIVERBANK: [number, number] = [112.6, 34.95]; // Yellow River north of Luoyang, approximate

// massacre: Yuan Shao's soldiers storm the palace gate with spears; eunuchs run out the far side.
export const Storm = ({ g, start }: { g: InsetGeom; start: number }) => {
  const t = g.frame - start;
  const charge = Math.min(t, 90) * 1.6 * g.s;
  const run = t * 3.4 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#9c8a66" />
      <OfficeGate x={g.x + g.W * 0.66} y={g.ground + 4 * g.s} scale={g.sc * 1.05} />
      {[0.72, 0.84, 0.95].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx + run} y={g.ground + (20 + (i % 2) * 10) * g.s} scale={g.sc * 0.9} {...LOOK.zhangrang} robe={i === 1 ? "#3d4f6b" : "#9c3426"} pose="flee" phase={i * 2} />
      ))}
      {[0.04, 0.13, 0.22, 0.31].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx + charge} y={g.ground + (18 + (i % 2) * 12) * g.s} scale={g.sc * 0.95} {...LOOK.soldier} pose={i % 2 ? "walk" : "raise"} hold="spear" phase={i * 1.4} />
      ))}
    </g>
  );
};

// river → meet: night on the Yellow River bank, the two boys walk hand in hand under fireflies (novel detail);
// on "เจอ" torches and banners of Dong Zhuo's army come out of the dark, Dong Zhuo himself on "ตั๋ง".
export const Riverbank = ({ g, start, army, dong }: { g: InsetGeom; start: number; army: number; dong: number }) => {
  const walk = Math.min(g.frame - start, 200) * 0.9 * g.s;
  const a = usePopIn(army);
  const d = usePopIn(dong);
  const river = g.ground + 30 * g.s;
  return (
    <g>
      <circle cx={g.x + g.W * 0.16} cy={g.y + 90 * g.s} r={28 * g.s} fill="#efe6c2" opacity={0.85} />
      <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={40 * g.s} fill="#3a3324" />
      <River x={g.x} y={river} w={g.W} h={g.H} s={g.s} night />
      <Fireflies x={g.x + 40 * g.s} y={g.y + 120 * g.s} w={g.W * 0.55} h={150 * g.s} k={interpolate(g.frame, [start + 20, start + 50], [0, 1], clamp)} />
      <HanFigure x={g.x + g.W * 0.12 + walk} y={g.ground + 18 * g.s} scale={g.sc * 0.78} {...LOOK.prince} phase={1} />
      <HanFigure x={g.x + g.W * 0.2 + walk} y={g.ground + 20 * g.s} scale={g.sc * 0.62} {...LOOK.emperor} phase={2} />
      <g opacity={Math.min(1, a)}>
        <circle cx={g.x + g.W * 0.86} cy={g.ground - 60 * g.s} r={200 * g.s} fill="url(#fig-glow)" />
        {[0.74, 0.84, 0.94].map((fx, i) => (
          <HanFigure key={fx} x={g.x + g.W * fx} y={g.ground + (14 + (i % 2) * 10) * g.s} scale={g.sc * 0.9} {...LOOK.soldier} pose="stand" hold={i === 1 ? "flag" : "torch"} flag={{ text: "董", color: "#3d3f5c" }} flip phase={i} />
        ))}
      </g>
      <g opacity={Math.min(1, d)}>
        <HanFigure x={g.x + g.W * 0.64} y={g.ground + 26 * g.s} scale={g.sc * 1.05} {...LOOK.dongzhuo} flip phase={5} />
      </g>
    </g>
  );
};

const LY = place("luoyang");
const NIGHT: [string, string] = ["#0e1626", "#24324a"];

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "storm-open", at: -8, anchor: LY, sky: ["#e2c79a", "#c9a46a"], draw: (g, a) => <Storm g={g} start={a} /> },
      { id: "beard", at: word("hookq", "หนวด"), anchor: LY, ...tab("palace", [{ who: "soldier", x: 0.3, hold: "spear" }, { who: "zhangrang", x: 0.62, pose: "raise", flip: true }], "ใครไม่มีหนวด ถูกฆ่า") },
      { id: "hejin", at: word("hejin", "ล้าง"), anchor: LY, ...tab("palace", [{ who: "hejin", x: 0.3, pose: "raise", hold: "sword" }, { who: "zhangrang", x: 0.62, pose: "hunch", flip: true }, { who: "official", x: 0.8, pose: "hunch", flip: true, head: "eunuch", robe: "#7a2518" }], "อยากล้างบางขันทีให้หมด") },
      { id: "summon", at: word("summon", "เรียก"), anchor: LY, ...tab("road", [{ who: "soldier", x: 0.2, ride: true, walk: 3, robe: "#9a7b2f" }], "เรียกขุนศึกเข้าเมืองหลวง") },
      { id: "laugh", at: B.caolaugh.start, anchor: LY, until: B.cao.start + 4, ...tab("palace", [{ who: "caocao", x: 0.45, pose: "laugh", size: 1.1 }], "โจโฉหัวเราะ") },
      // cao: Cao Cao's portrait is the picture
      { id: "trap", at: word("trap", "หลอก"), anchor: LY, until: B.zhangrang.start + 4, ...tab("palace", [{ who: "hejin", x: 0.15, walk: 1.2 }, { who: "zhangrang", x: 0.82, flip: true }], "เข้าวังเพียงลำพัง") },
      // zhangrang: his portrait is the picture
      { id: "storm", at: word("massacre", "อ้วน"), anchor: LY, sky: ["#e2c79a", "#c9a46a"], draw: (g, a) => <Storm g={g} start={a} /> },
      { id: "flee", at: word("massacre", "ขันที"), anchor: LY, until: B.river.start + 8, ...tab("palace", [{ who: "zhangrang", x: 0.3, pose: "flee", walk: 3 }, { who: "zhangrang", x: 0.45, pose: "flee", walk: 3, robe: "#3d4f6b" }, { who: "soldier", x: 0.1, walk: 2.6, hold: "spear" }], "ขันทีตายกว่าสองพันคน") },
      { id: "night-run", at: B.river.start, anchor: RIVERBANK, ...tab("night", [{ who: "zhangrang", x: 0.7, walk: -1.6, flip: true }, { who: "prince", x: 0.82, walk: -1.6, flip: true, size: 0.8 }, { who: "emperor", x: 0.92, walk: -1.6, flip: true, size: 0.65 }], "หนีออกจากวังกลางดึก") },
      { id: "river", at: word("river", "ริม"), anchor: RIVERBANK, sky: NIGHT, until: B.test.start + 8, draw: (g, a) => <Riverbank g={g} start={a} army={word("meet", "เจอ")} dong={word("meet", "ตั๋ง")} /> },
      { id: "test", at: word("test", "ร้องไห้"), anchor: RIVERBANK, ...tab("night", [{ who: "dongzhuo", x: 0.72, ride: true, flip: true }, { who: "prince", x: 0.28, pose: "hunch", size: 0.8 }, { who: "emperor", x: 0.42, size: 0.65 }], "องค์น้องตอบได้ฉะฉาน") },
      { id: "smile", at: word("cliff", "ยิ้ม"), anchor: LY, until: B.cliff.end + 30, ...tab("throne", [{ who: "dongzhuo", x: 0.62, pose: "laugh", flip: true, size: 1.1 }, { who: "emperor", x: 0.36, size: 0.65 }], "ทำไมอยากได้ฮ่องเต้องค์ใหม่?") },
    ]}
  />
);
