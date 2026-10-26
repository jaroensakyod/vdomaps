import { loadFont as loadWood } from "@remotion/google-fonts/Chonburi";
import { loadFont as loadMetal } from "@remotion/google-fonts/Taviraj";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Inked, Marks, P, Platen, PressDefs, Sheet, stroke } from "./kit/Press";

// N20 letterpress: a record told as a printed broadside. Each colour is a press stroke — the platen comes down,
// thump, lifts — leaving wooden-type numerals and metal-type captions inked into thick cotton paper. 14 s.
export const demo: StyleDemo = { id: "N20", name: "ตัวเรียงพิมพ์", frames: 420, cover: 400, sizes: ["9x16"] };

const wood = loadWood("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const metal = loadMetal("normal", { weights: ["400", "600"], subsets: ["thai", "latin"] }).fontFamily;
const STROKES = [40, 112, 196, 286];

export const Demo = () => {
  const frame = useCurrentFrame();
  const st = STROKES.map((at) => stroke(frame, at));
  const hit = st.some((s) => s.hit);
  const k = Math.max(...st.map((s) => s.k));
  const T = (x: number, y: number, size: number, text: string, fill: string, f = metal, weight = 400, anchor: "middle" | "start" | "end" = "middle", spacing = 0) => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={f} fontWeight={weight} fontSize={size} fill={fill} letterSpacing={spacing}>{text}</text>
  );
  return (
    <AbsoluteFill style={{ background: P.bed }}>
      {STROKES.map((at) => <Hit key={at} id="wood_hit" at={at} volume={0.45} />)}
      {STROKES.map((at) => <Sfx key={`w${at}`} src={SFX.whoosh} at={at - 12} volume={0.12} />)}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PressDefs />
        <mask id="lp-knock" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#fff" />
          <text x={540} y={1000} textAnchor="middle" fontFamily={wood} fontSize={520} letterSpacing={-18} fill="#000">168</text>
        </mask>
        <mask id="lp-knock2" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#fff" />
          <text x={540} y={1636} textAnchor="middle" fontFamily={wood} fontSize={128} fill="#000">พ.ศ. ๒๓๒๕</text>
        </mask>
        <g transform={hit ? "translate(540,960) scale(0.996) translate(-540,-957)" : undefined}>
          <Sheet />
          {/* already on the sheet: header and imprint (black, metal type) */}
          <Inked ink="c">
            <g fill={P.black}>
              <rect x={90} y={128} width={900} height={6} />
              <rect x={90} y={140} width={900} height={2} />
              {T(540, 206, 40, "N20 · ตัวเรียงพิมพ์", P.black, metal, 600, "middle", 4)}
              {T(540, 252, 26, "แผ่นที่ ๑ · บันทึกสถิติ · ตัวอย่างสไตล์", P.black)}
              <rect x={90} y={280} width={900} height={2} />
              <rect x={90} y={287} width={900} height={6} />
              {T(540, 1806, 22, "ข้อมูล: Guinness World Records · Wikipedia (Bangkok)", P.black)}
            </g>
          </Inked>
          {/* pass 1: black caption */}
          {st[0].printed && (
            <Inked ink="c" fresh={st[0].fresh}>
              {T(540, 1236, 50, "ชื่อเต็มของกรุงเทพมหานคร", P.black, metal, 600)}
              {T(540, 1300, 38, "ยาวทั้งหมด ๑๖๘ ตัวอักษร", P.black)}
            </Inked>
          )}
          {/* pass 2: a solid wooden slab in blue with the numerals cut out of it (the paper shows through) */}
          {st[1].printed && (
            <Inked ink="a" fresh={st[1].fresh} dx={2} dy={-1}>
              <rect x={72} y={330} width={936} height={790} fill={P.blue} mask="url(#lp-knock)" />
            </Inked>
          )}
          {/* pass 3: orange numerals overprinted into the cut-out, a hair off register; orange rule */}
          {st[2].printed && (
            <Inked ink="b" fresh={st[2].fresh} dx={-5} dy={4}>
              {T(540, 1000, 520, "168", P.orange, wood, 400, "middle", -18)}
              <rect x={72} y={1140} width={936} height={22} fill={P.orange} />
            </Inked>
          )}
          {/* pass 4: black captions + orange date */}
          {st[3].printed && (
            <g>
              <Inked ink="c" fresh={st[3].fresh}>
                {T(540, 1384, 44, "ชื่อสถานที่ที่ยาวที่สุดในโลก", P.black, metal, 600)}
                {T(540, 1438, 32, "ตามบันทึกของกินเนสส์เวิลด์เรคคอร์ดส", P.black)}
                <rect x={72} y={1486} width={936} height={200} fill={P.black} mask="url(#lp-knock2)" />
                {T(540, 1738, 32, "ปีที่สถาปนากรุงเทพฯ เป็นราชธานี", P.black)}
              </Inked>
            </g>
          )}
          <Marks />
        </g>
        <Platen k={k} />
      </svg>
    </AbsoluteFill>
  );
};
