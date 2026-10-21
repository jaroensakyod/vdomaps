import { Fire, Smoke } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { CityGate, HanFigure, LOOK } from "../kit/Scenes";
import { Shots } from "../kit/Shots";
import { tab } from "../kit/Tableau";
import { C, fonts } from "../kit/theme";

const MID = 0.37;

// hook / burn: Luoyang's walls and gate tower in flames, smoke over the city.
export const Blaze = ({ g }: { g: InsetGeom }) => (
  <g>
    <rect x={g.x} y={g.ground + 6 * g.s} width={g.W} height={g.H} fill="#3a2416" />
    <CityGate x0={g.x - 20 * g.s} x1={g.x + g.W + 20 * g.s} cx={g.cx} y={g.ground + 6 * g.s} s={g.s * 1.2} />
    {[0.12, 0.3, 0.5, 0.68, 0.86].map((fx, i) => (
      <g key={fx}>
        <Smoke x={g.x + g.W * fx} y={g.ground - 120 * g.s} size={40 * g.s} seed={i} wind={0.6} />
        <Fire x={g.x + g.W * fx} y={g.ground - (i === 2 ? 190 : 120) * g.s} size={(i === 2 ? 90 : 64) * g.s} seed={i * 3} />
      </g>
    ))}
    {[0.2, 0.42, 0.6, 0.78].map((fx, i) => (
      <Fire key={fx} x={g.x + g.W * fx} y={g.ground + 4 * g.s} size={36 * g.s} seed={i + 20} />
    ))}
  </g>
);

// march: townspeople with bundles walk west, soldiers with spears drive them on. Nobody is drawn hurt.
export const March = ({ g, start }: { g: InsetGeom; start: number }) => {
  const t = g.frame - start;
  const drift = (t * 0.8 * g.s) % (g.W * 0.2);
  const feet = g.ground + 26 * g.s;
  return (
    <g>
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#a88a5c" />
      <path d={`M${g.x} ${g.ground - 40 * g.s} L${g.x + g.W * 0.25} ${g.ground - 120 * g.s} L${g.x + g.W * 0.45} ${g.ground - 50 * g.s} L${g.x + g.W * 0.7} ${g.ground - 140 * g.s} L${g.x + g.W} ${g.ground - 60 * g.s} L${g.x + g.W} ${g.ground + 4 * g.s} L${g.x} ${g.ground + 4 * g.s} Z`} fill="#8a7350" opacity={0.6} />
      {[0.08, 0.18, 0.28, 0.38, 0.48, 0.58].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx - drift} y={feet - (i % 2) * 8 * g.s} scale={g.sc * 0.85} robe={["#8a7a5c", "#7d6b4f", "#94703e"][i % 3]} shade="#5e5038" pose="hunch" hold={i % 2 ? "bundle" : "none"} ragged={i % 2 === 0} flip phase={i * 1.3} />
      ))}
      {[0.72, 0.86].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx - drift} y={feet} scale={g.sc * 0.9} {...LOOK.soldier} robe="#3d3f5c" pose="walk" hold="spear" flip phase={i + 7} />
      ))}
      <text x={g.x + g.W * 0.5} y={g.y + 58 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill="#2a1b0e">
        ← เตียงอัน
      </text>
    </g>
  );
};

const LY = place("luoyang");
const FIRE: [string, string] = ["#2a1408", "#c0602e"];

export const Insets = ({ B, word }: Timeline) => (
  <Shots
    items={[
      { id: "blaze-open", at: -8, anchor: LY, sky: FIRE, draw: (g) => <Blaze g={g} /> },
      { id: "herd", at: word("hookq", "ต้อน"), anchor: LY, sky: ["#d6bf8f", "#c9a46a"], draw: (g, a) => <March g={g} start={a} /> },
      { id: "move", at: word("why", "ย้าย"), anchor: LY, ...tab("road", [{ who: "dongzhuo", x: 0.7, ride: true, walk: -2, flip: true }, { who: "soldier", x: 0.88, walk: -2, flip: true, robe: "#3d3f5c", flag: { text: "董", color: "#3d3f5c" } }], "ย้ายเมืองหลวงไปเตียงอัน") },
      { id: "hills", at: word("why", "ภูเขา"), anchor: place("changan"), until: B.burn.start + 8, ...tab("city", [{ who: "soldier", x: 0.3, hold: "spear", robe: "#3d3f5c" }, { who: "soldier", x: 0.7, hold: "spear", robe: "#3d3f5c", flip: true }], "เตียงอัน มีภูเขาล้อม ป้องกันง่าย") },
      { id: "blaze", at: B.burn.start, anchor: LY, sky: FIRE, draw: (g) => <Blaze g={g} /> },
      { id: "flee-fire", at: word("burn", "ตลาด"), anchor: LY, until: B.dong.start + 4, ...tab("fire", [{ who: "official", x: 0.3, pose: "flee", walk: -2.4, flip: true, robe: "#8a7a5c" }, { who: "official", x: 0.5, pose: "flee", walk: -2.4, flip: true, robe: "#7d6b4f", hold: "bundle" }], "ลกเอี๋ยงกลายเป็นทะเลเพลิง") },
      // dong: his portrait is the picture
      { id: "march", at: B.march.start, anchor: [110.6, 34.55], sky: ["#d6bf8f", "#c9a46a"], draw: (g, a) => <March g={g} start={a} /> },
      { id: "cavalry", at: word("march", "ทหาร"), anchor: [110.6, 34.55], ...tab("road", [{ who: "official", x: 0.2, pose: "hunch", walk: -1.2, flip: true, robe: "#8a7a5c", hold: "bundle" }, { who: "official", x: 0.36, pose: "hunch", walk: -1.2, flip: true, robe: "#7d6b4f" }, { who: "soldier", x: 0.72, ride: true, walk: -1.4, flip: true, robe: "#3d3f5c" }], "ทหารม้าไล่ตามหลัง") },
      { id: "tombs", at: B.tombs.start, anchor: LY, ...tab("tomb", [{ who: "lvbu", x: 0.25, hold: "halberd" }, { who: "soldier", x: 0.45, pose: "hunch", hold: "hoe" }, { who: "soldier", x: 0.85, pose: "hunch", hold: "hoe", flip: true }], "ขุดสุสานฮ่องเต้ เอาสมบัติ") },
      { id: "ruins", at: word("sunjian", "ซาก"), anchor: LY, ...tab("fire", [{ who: "sunjian", x: 0.3, size: 1.1 }, { who: "soldier", x: 0.15, robe: "#a8382a", flag: { text: "孫", color: "#a8382a" } }], "ซุนเกี๋ยนบุกถึงซากเมือง", { burn: 0.35 }) },
      { id: "mend", at: word("sunjian", "ซ่อม"), anchor: LY, ...tab("tomb", [{ who: "soldier", x: 0.4, hold: "hoe", robe: "#a8382a" }, { who: "soldier", x: 0.86, hold: "hoe", robe: "#a8382a", flip: true }], "สั่งซ่อมสุสานที่ถูกขุด") },
      { id: "well", at: B.well.start, anchor: LY, ...tab("well", [{ who: "soldier", x: 0.2, hold: "point", robe: "#a8382a" }, { who: "soldier", x: 0.34, robe: "#a8382a" }], "แสงห้าสีจากบ่อน้ำร้าง") },
      { id: "seal", at: word("seal", "พบ"), anchor: LY, until: B.doubt.start + 8, ...tab("seal", [], "ตราหยกประจำแผ่นดิน") },
      // doubt: the doubt card carries the picture
      { id: "south", at: word("cliff", "หัน"), anchor: place("nanyang"), ...tab("road", [{ who: "sunjian", x: 0.3, ride: true, walk: 2 }], "เก็บตราหยก แล้วกลับลงใต้") },
      { id: "archers", at: word("cliff", "ลูก"), anchor: place("xianshan"), until: B.cliff.end + 30, ...tab("hill", [{ who: "soldier", x: 0.66, robe: "#36422a", flip: true, size: 0.75, dy: -70 }, { who: "soldier", x: 0.8, robe: "#36422a", flip: true, size: 0.75, dy: -80 }], "ลูกธนูดอกหนึ่งรออยู่") },
    ]}
  />
);
