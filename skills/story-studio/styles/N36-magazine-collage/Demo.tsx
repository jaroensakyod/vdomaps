import { loadFont as loadPattaya } from "@remotion/google-fonts/Pattaya";
import { loadFont as loadChonburi } from "@remotion/google-fonts/Chonburi";
import { loadFont as loadMitr } from "@remotion/google-fonts/Mitr";
import { loadFont as loadSriracha } from "@remotion/google-fonts/Sriracha";
import { loadFont as loadFahkwang } from "@remotion/google-fonts/Fahkwang";
import { loadFont as loadPrompt } from "@remotion/google-fonts/Prompt";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Cassette, CollageDefs, cut, Disc, Halftone, Headphones, K, Newsprint, Piece, Ransom, Tape, TornPaper } from "./kit/Collage";

// N36 magazine collage: the cassette era told with cut-out paper. A torn newsprint sheet and a cut-out cassette
// are stuck down on pink paper, ransom-note letters land one by one for the title, then each year arrives as
// cut digits with a torn caption strip and a new cut-out object (headphones, a mixtape label, a disc), all
// placed in stop motion on twos. Facts: see STYLE.md. 18 s.
export const demo: StyleDemo = { id: "N36", name: "ภาพปะติด", frames: 540, cover: 486, sizes: ["9x16"] };

const pattaya = loadPattaya("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const chonburi = loadChonburi("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const mitr = loadMitr("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily;
const sriracha = loadSriracha("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const fahkwang = loadFahkwang("normal", { weights: ["700"], subsets: ["thai", "latin"] }).fontFamily;
const prompt = loadPrompt("normal", { weights: ["600", "800"], subsets: ["thai", "latin"] }).fontFamily;
const FONTS = [pattaya, chonburi, mitr, sriracha, fahkwang, prompt];
const W = 1080;
const SCENES = [
  { from: 92, to: 206, year: "1963", text: "ฟิลิปส์เปิดตัวเทปคาสเซ็ต", sub: "ม้วนเล็ก พกไปไหนก็ได้" },
  { from: 206, to: 318, year: "1979", text: "Walkman ออกขายที่ญี่ปุ่น", sub: "ฟังเพลงไปพลาง เดินไปพลาง" },
  { from: 318, to: 428, year: "ยุค 80", text: "อัดเพลงรวมใส่ม้วน", sub: "ให้กันเป็นของขวัญ" },
  { from: 428, to: 600, year: "1982", text: "ซีดีเริ่มวางขาย", sub: "ยุคเทปค่อย ๆ จางลง" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const f2 = Math.floor(frame / 2) * 2;
  return (
    <AbsoluteFill style={{ background: K.pink }}>
      <Bed id="city_crowd" from={0} to={demo.frames} volume={0.04} />
      {[0, 50, 92, 112, 206, 222, 318, 334, 428, 446].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.22} />)}
      {[86, 200, 312, 422].map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.14} />)}
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <CollageDefs />
        {/* the base sheet: pink paper with fibres and a printed dot screen in one corner */}
        <rect width={W} height={1920} fill={K.pink} />
        <Halftone x={540} y={1300} w={540} h={620} step={22} color="#c93273" fn={(u, v) => u * 0.6 + v * 0.5 - 0.2} angle={30} />
        <Halftone x={0} y={0} w={420} h={460} step={18} color="#f98ab4" fn={(u, v) => 0.7 - u * 0.6 - v * 0.4} angle={-10} />
        <rect width={W} height={1920} filter="url(#mc-fibre)" opacity={0.35} />

        {/* torn newsprint sheet behind everything */}
        <Piece frame={frame} at={6} dur={8} dy={-1400} x={540} y={930} rot={3.5} seed={2}>
          <TornPaper x={-500} y={-470} w={1000} h={940} seed={4} fill={K.news} amp={12}>
            <Newsprint x={-500} y={-470} w={1000} h={940} seed={5} />
            <rect x={-150} y={-440} width={420} height={260} fill="#d8cfb9" />
            <Halftone x={-150} y={-440} w={420} h={260} step={9} color="#3a352e" fn={(u, v) => 0.75 - Math.hypot(u - 0.55, v - 0.4) * 1.4} />
          </TornPaper>
        </Piece>

        {/* kicker */}
        <Piece frame={frame} at={14} dur={6} dy={-300} x={540} y={92} rot={-2} seed={3}>
          <path d={cut(-210, -38, 420, 70, 3, 6)} fill={K.ink} />
          <text x={0} y={14} textAnchor="middle" fontFamily={mitr} fontWeight={500} fontSize={40} fill="#fff">N36 · ภาพปะติด</text>
        </Piece>
        {/* ransom title */}
        <Ransom text="ยุค" x={540} y={230} size={96} fonts={FONTS} seed={7} frame={frame} at={20} every={4} />
        <Ransom text="เทปคาสเซ็ต" x={540} y={370} size={118} fonts={FONTS} seed={11} frame={frame} at={34} every={4} />

        {/* the cassette */}
        <Piece frame={frame} at={64} dur={10} dx={-1200} dy={-200} x={520} y={820} rot={-5} seed={9}>
          <Cassette spin={f2 * 3} />
          <Tape x={-350} y={-230} rot={-35} seed={2} />
          <Tape x={350} y={225} rot={-35} seed={3} />
        </Piece>

        {/* scene objects */}
        <Piece frame={frame} at={222} dur={8} dx={900} dy={-300} x={800} y={630} rot={14} seed={21} lift>
          <Headphones />
        </Piece>
        <Piece frame={frame} at={334} dur={8} dx={-900} dy={200} x={330} y={1030} rot={-9} seed={31}>
          <path d={cut(-200, -80, 400, 160, 31, 6)} fill="#fffdf6" />
          {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-190} y1={-40 + i * 34} x2={190} y2={-40 + i * 34} stroke="#8fb7e0" strokeWidth={2} />)}
          <line x1={-150} y1={-80} x2={-150} y2={80} stroke="#e88" strokeWidth={2} />
          <text x={-130} y={-12} fontFamily={sriracha} fontSize={50} fill="#1a3a8a">เพลงรวมให้เธอ</text>
          <text x={-130} y={52} fontFamily={sriracha} fontSize={40} fill={K.red}>หน้า A ♥</text>
          <Tape x={0} y={-82} w={120} rot={4} seed={8} />
        </Piece>
        <Piece frame={frame} at={446} dur={8} dx={900} dy={500} x={810} y={1090} rot={0} seed={41} lift>
          <g transform={`rotate(${f2 * 1.5})`}><Disc /></g>
        </Piece>

        {/* year + caption per scene */}
        {SCENES.map((s, i) => (
          <g key={s.year}>
            <Piece frame={frame} at={s.from + 6} dur={8} dx={-900} dy={0} x={300} y={1240} rot={-4} seed={50 + i} out={s.to - 8}>
              <Ransom text={s.year} x={0} y={0} size={128} fonts={FONTS} seed={60 + i} frame={1e6} />
            </Piece>
            <Piece frame={frame} at={s.from + 16} dur={8} dx={0} dy={900} x={540} y={1560} rot={i % 2 ? 1.5 : -1.5} seed={70 + i} out={s.to - 8}>
              <TornPaper x={-470} y={-130} w={940} h={250} seed={80 + i} fill={i % 2 ? K.yellow : K.news} amp={10}>
                <rect x={-470} y={-130} width={14} height={250} fill={K.red} />
              </TornPaper>
              <text x={-420} y={-24} fontFamily={prompt} fontWeight={800} fontSize={62} fill={K.ink}>{s.text}</text>
              <text x={-420} y={62} fontFamily={prompt} fontWeight={600} fontSize={44} fill="#4a3b40">{s.sub}</text>
              <Tape x={-430} y={-120} w={130} rot={-24} seed={90 + i} />
            </Piece>
          </g>
        ))}

        {/* honesty label */}
        <Piece frame={frame} at={70} dur={6} dy={400} x={835} y={1830} rot={2} seed={99}>
          <path d={cut(-200, -30, 400, 56, 99, 5)} fill="#fff" />
          <text x={0} y={10} textAnchor="middle" fontFamily={mitr} fontWeight={500} fontSize={28} fill={K.ink}>ภาพประกอบ · วาดขึ้นใหม่</text>
        </Piece>
      </svg>
    </AbsoluteFill>
  );
};
