import { loadFont } from "@remotion/google-fonts/K2D";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Bail, C, Carriage, cells, clamp, code5, DotText, Housing, Keys, Roll, Tape, TeleDefs } from "./kit/Teleprinter";

// N16 teleprinter: a generic, clearly-marked sample bulletin (ตัวอย่าง) hammered out on a teleprinter under cold
// office light. Each character is struck through a dot grid by the print head, the bell rings and the carriage
// snaps back at each line end, the roll feeds up one line, and the punched tape below grows one column per
// character. 15 s.
export const demo: StyleDemo = { id: "N16", name: "โทรพิมพ์", frames: 450, cover: 418, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const H = 1920;
const PX = 150; // paper left
const PW = 780; // paper width
const BAIL = 270;
const PLATEN = 1318;
const YC = 1296; // baseline of the line being typed
const LEAD = 80;
const SIZE = 54;
const CELL = 31; // advance per visible character (K2D 600 at 54 px, letter-spacing 2)
const LX = 236; // left margin
const PER = 1.7; // frames per character
const CR = 12; // frames for a carriage return + line feed

const LINES: { t: string; red?: boolean }[] = [
  { t: "ZCZC 0417 ด่วนมาก", red: true },
  { t: "ถึง : โต๊ะข่าว กรุงเทพฯ" },
  { t: "จาก : ผู้สื่อข่าวภาคสนาม" },
  { t: "" },
  { t: "02.15 น. ไฟดับทั้งเมืองท่า" },
  { t: "ยังไม่ทราบสาเหตุ" },
  { t: "จะรายงานเพิ่มเติม ++" },
  { t: "NNNN", red: true },
];
// schedule: start/end frame of each line and the frame its carriage return finishes
const SCHED = (() => {
  let f = 22;
  return LINES.map((l) => {
    const n = [...l.t].length;
    const s = f;
    const e = s + n * PER;
    f = e + CR;
    return { s, e, cr: f };
  });
})();
// tail of the previous bulletin, already on the roll when the demo starts
const PREV = ["...ตามเวลาท้องถิ่น", "NNNN", ""];
const ALL = LINES.map((l) => l.t).join("");

export const Demo = () => {
  const frame = useCurrentFrame();
  // which line is being typed, how much of it, and how many line feeds have happened (fractional while feeding)
  let fed = 0;
  let cur = -1;
  let typed = "";
  SCHED.forEach((s, i) => {
    if (frame >= s.s) cur = i;
    if (frame >= s.e) fed = i + interpolate(frame, [s.e + 3, s.cr], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  });
  const shown = (i: number) => {
    const s = SCHED[i];
    if (frame < s.s) return "";
    const n = Math.floor((frame - s.s) / PER) + 1;
    return [...LINES[i].t].slice(0, n).join("");
  };
  if (cur >= 0) typed = shown(cur);
  const s = cur >= 0 ? SCHED[cur] : null;
  const typing = s && frame < s.e;
  const back = s && frame >= s.e ? interpolate(frame, [s.e + 1, s.e + 7], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) }) : 1;
  const hx = typing || !s ? LX + cells(typed) * CELL + 10 : LX + (cells(LINES[cur].t) * CELL + 10) * back;
  const strike = typing ? 1 - ((frame - s.s) % PER) / PER : 0;
  const nPunched = SCHED.reduce((a, sc, i) => a + (frame >= sc.s ? [...shown(i)].length : 0), 0);
  const codes = [...ALL].slice(0, nPunched).map(code5);
  const keyPressed = typing ? nPunched % 10 : -1;
  const hum = 0.97 + 0.03 * Math.sin(frame * 0.7) * Math.sin(frame * 0.13); // fluorescent tube
  const on = interpolate(frame, [0, 14], [0, 1], clamp);
  const bell = Math.max(0, ...SCHED.map((sc, i) => (LINES[i].t && frame >= sc.e && frame < sc.e + 10 ? 1 - (frame - sc.e) / 10 : 0)));
  return (
    <AbsoluteFill style={{ background: C.wall }}>
      <Sfx src={SFX.swell} at={2} volume={0.15} />
      {/* each struck character: a short tick; each carriage return: the bell */}
      {SCHED.flatMap((sc, i) => Array.from({ length: [...LINES[i].t].length }, (_, j) => <Sfx key={`${i}-${j}`} src={SFX.tick} at={Math.round(sc.s + j * PER)} volume={0.12} />))}
      {SCHED.map((sc, i) => (LINES[i].t ? <Hit key={i} id="ship_bell" at={Math.round(sc.e)} volume={0.08} /> : null))}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: on }}>
        <TeleDefs />
        <defs>
          <radialGradient id="n16-pool" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#a9cdf0" stopOpacity="0.32" />
            <stop offset="0.6" stopColor="#6f93c0" stopOpacity="0.1" />
            <stop offset="1" stopColor="#7fa8bd" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="n16-vignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.6" stopColor="#0d1620" stopOpacity="0" />
            <stop offset="1" stopColor="#0d1620" stopOpacity="0.45" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#n16-wall)" />
        {/* the cold fluorescent pool: strongest on the paper, falling off on the wall */}
        <ellipse cx={540} cy={640} rx={720} ry={900} fill="url(#n16-pool)" opacity={hum} />
        <clipPath id="n16-paperclip">
          <rect x={PX - 30} y={BAIL} width={PW + 60} height={PLATEN - BAIL + 20} />
        </clipPath>
        <g clipPath="url(#n16-paperclip)">
          <Roll x={PX} y={BAIL} w={PW} h={PLATEN - BAIL + 20} offset={fed * LEAD}>
            {PREV.map((t, j) => (t ? <DotText key={`p${j}`} x={LX} y={YC - (fed + PREV.length - j) * LEAD} text={t} size={SIZE} color={t === "NNNN" ? C.red : C.ink} font={font} /> : null))}
            {LINES.map((l, i) => {
              const t = i < cur ? l.t : i === cur ? typed : "";
              if (!t) return null;
              const y = YC - (fed - i) * LEAD;
              return <DotText key={i} x={LX} y={y} text={t} size={SIZE} color={l.red ? C.red : C.ink} font={font} />;
            })}
            {/* curl: the paper bends over the bail and goes dark */}
            <rect x={PX} y={BAIL} width={PW} height={110} fill="url(#n16-curl)" />
          </Roll>
          <defs>
            <linearGradient id="n16-curl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b4650" stopOpacity="0.65" />
              <stop offset="1" stopColor="#3b4650" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* cold light band reflected across the paper */}
          <rect x={PX} y={BAIL + 200} width={PW} height={260} fill="#f4fbff" opacity={0.12 * hum} />
        </g>
        <Bail x={PX} y={BAIL} w={PW} />
        <Housing y={PLATEN + 40} w={W} h={H - PLATEN - 40}>
          {/* tape slot and the reperforator's punched tape */}
          <rect x={940} y={1500} width={110} height={120} rx={8} fill="#2a3230" />
          <Tape x0={990} y={1512} codes={codes} scroll={0} />
          <rect x={985} y={1500} width={70} height={120} rx={6} fill="#56645f" stroke="#2a3230" strokeWidth={3} />
          {/* riveted plate */}
          <g transform="translate(110,1658)">
            <rect width={520} height={70} rx={6} fill="url(#n16-chrome)" stroke="#4c5a56" strokeWidth={2} />
            {[[14, 14], [506, 14], [14, 56], [506, 56]].map(([a, b]) => <circle key={`${a}-${b}`} cx={a} cy={b} r={5} fill="#7b878c" stroke="#3c464d" />)}
            <text x={260} y={47} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={32} fill="#2b3331">ตัวอย่าง · ข้อความสมมุติ</text>
          </g>
          {/* bell lamp: lights at every carriage return */}
          <g transform="translate(760,1693)">
            <circle r={30} fill="#2a3230" />
            <circle r={22} fill={bell > 0 ? "#ff5a3c" : "#6b2a22"} />
            {bell > 0 && <circle r={46} fill="#ff7a50" opacity={bell * 0.45} filter="url(#n16-shadow)" />}
            <text x={44} y={12} fontFamily={font} fontWeight={700} fontSize={30} fill="#1d2422">กระดิ่ง</text>
          </g>
          <Keys y={1840} labels={["ก", "ด", "ห", "ส", "ว", "ง", "า", "ร", "ท", "น"]} font={font} pressed={keyPressed} />
        </Housing>
        <Carriage x={PX} y={PLATEN} w={PW} hx={hx} strike={strike} />
        {/* kicker: embossed label tape stuck on the wall */}
        <g transform="translate(540,128) rotate(-1.2)">
          <rect x={-250} y={-46} width={500} height={84} rx={6} fill="#1f3f7a" />
          <rect x={-250} y={-46} width={500} height={10} rx={4} fill="#ffffff" opacity={0.14} />
          <text x={0} y={18} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={50} fill="#eef3ff" letterSpacing={6} style={{ filter: "drop-shadow(0 -1px 0 #ffffff) drop-shadow(0 2px 0 #0d1f40)" }}>N16 · โทรพิมพ์</text>
        </g>
        <rect width={W} height={H} fill="url(#n16-vignette)" />
      </svg>
    </AbsoluteFill>
  );
};
