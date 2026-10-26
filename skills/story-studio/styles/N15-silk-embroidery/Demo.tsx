import { loadFont } from "@remotion/google-fonts/Athiti";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, Couched, Hoop, Knot, Needle, needleAt, Running, Satin, SilkDefs, Spool } from "./kit/Silk";

// N15 silk embroidery: the Thai folk tale ปลาบู่ทอง (the golden goby), stitched on plum silk in a wooden hoop.
// A night pond sews itself in: running-stitch water, satin lotus pads, then the golden goby in satin with couched
// gold outlines and scales, lotus flowers, and the title in gold satin. The needle and thread ride the leading
// edge of whatever is being stitched. 16 s.
export const demo: StyleDemo = { id: "N15", name: "งานปักไหม", frames: 480, cover: 452, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const H = 1920;
const CX = 540;
const CY = 920;
const R = 460;
const S0 = R / 430; // the scene is drawn for a 430 px hoop centred at (540, 1000)

type Sat = { id: string; d: string; c: [string, string, string]; angle: number; at: [number, number]; box: [number, number, number] };
const GOLD: [string, string, string] = ["#d9a441", "#fff0b0", "#7a5418"];
const JADE: [string, string, string] = [C.jade, "#c9f0d8", "#24513c"];
const PEONY: [string, string, string] = [C.peony, "#ffe0ea", "#8a3150"];
const IVORY: [string, string, string] = [C.ivory, "#ffffff", "#9a8a68"];

// lotus pad seen at an angle: an ellipse with a wedge notch cut to the centre
const pad = (x: number, y: number, r: number) => `M${x},${y} L${(x + r * Math.cos(-0.2)).toFixed(1)},${(y + r * 0.6 * Math.sin(-0.2)).toFixed(1)} A${r},${r * 0.6} 0 1 0 ${(x + r * Math.cos(0.2)).toFixed(1)},${(y + r * 0.6 * Math.sin(0.2)).toFixed(1)} Z`;
const petal = (x: number, y: number, rot: number, s = 1) => {
  const a = (rot * Math.PI) / 180;
  const p = (u: number, v: number) => `${(x + (u * Math.cos(a) - v * Math.sin(a)) * s).toFixed(1)},${(y + (u * Math.sin(a) + v * Math.cos(a)) * s).toFixed(1)}`;
  return `M${p(0, 0)} C${p(-22, -20)} ${p(-16, -58)} ${p(0, -74)} C${p(16, -58)} ${p(22, -20)} ${p(0, 0)} Z`;
};

const SHAPES: Sat[] = [
  { id: "moon", d: "M880,905 A52,52 0 1 1 836,830 A40,40 0 1 0 880,905 Z", c: IVORY, angle: 60, at: [10, 50], box: [850, 865, 60] },
  { id: "pad1", d: pad(300, 1240, 100), c: JADE, angle: 30, at: [60, 110], box: [300, 1240, 110] },
  { id: "pad2", d: pad(790, 1250, 84), c: JADE, angle: -25, at: [85, 130], box: [790, 1250, 92] },
  { id: "pad3", d: pad(560, 1345, 70), c: JADE, angle: 10, at: [110, 150], box: [560, 1345, 76] },
  { id: "tail", d: "M700,975 L792,932 C812,975 812,1035 792,1078 L700,1032 Z", c: GOLD, angle: 0, at: [140, 175], box: [750, 1005, 80] },
  { id: "body", d: "M300,1010 C300,950 360,925 430,928 C530,934 620,955 705,975 L705,1032 C620,1050 530,1074 430,1082 C360,1084 300,1068 300,1010Z", c: GOLD, angle: 80, at: [160, 235], box: [500, 1005, 220] },
  { id: "belly", d: "M318,1032 C380,1070 480,1072 600,1052 L650,1042 C560,1066 460,1082 400,1078 C356,1072 328,1056 318,1032Z", c: IVORY, angle: 75, at: [228, 250], box: [480, 1058, 170] },
  { id: "fin1", d: "M430,930 C438,876 482,866 512,878 C522,900 516,926 506,936 Z", c: PEONY, angle: 110, at: [245, 268], box: [475, 905, 50] },
  { id: "fin2", d: "M548,942 C562,892 642,890 672,912 C676,940 670,960 664,966 Z", c: PEONY, angle: 100, at: [258, 284], box: [610, 930, 70] },
  { id: "fin3", d: "M420,1030 C440,1072 482,1094 504,1082 C494,1060 472,1040 450,1024Z", c: PEONY, angle: 50, at: [270, 292], box: [460, 1056, 46] },
  ...[[300, 1150, -10], [300, 1150, 25], [300, 1150, -45], [820, 1140, 5], [820, 1140, 38], [820, 1140, -30]].map(([x, y, r], i) => ({
    id: `pe${i}`,
    d: petal(x, y, r, 1.1),
    c: PEONY,
    angle: r + 90,
    at: [330 + (i % 3) * 14 + Math.floor(i / 3) * 24, 352 + (i % 3) * 14 + Math.floor(i / 3) * 24] as [number, number],
    box: [x, y - 40, 60] as [number, number, number],
  })),
];

const SCALES = Array.from({ length: 21 }, (_, i) => {
  const col = i % 7;
  const row = Math.floor(i / 7);
  const x = 450 + col * 36 + (row % 2) * 18;
  const y = 966 + row * 30 - col * 2;
  return `M${x},${y} a13,13 0 0 0 0,24`;
});
const WATER = [1110, 1170, 1230, 1290, 1350, 1410].map((y, i) => `M${130 + (i % 2) * 40},${y} ${Array.from({ length: 10 }, (_, j) => `q40,${j % 2 ? 14 : -14} 80,0`).join(" ")}`);

export const Demo = () => {
  const frame = useCurrentFrame();
  const k = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);
  const active = SHAPES.find((s) => frame >= s.at[0] && frame < s.at[1]);
  const titleK = k(372, 428);
  const on = k(0, 16);
  const needle: [number, number] | null = active
    ? needleAt(active.box, active.angle, k(active.at[0], active.at[1]), frame)
    : frame >= 372 && frame < 428
      ? [300 + titleK * 480 + Math.sin(frame * 0.9) * 10, 700 + Math.cos(frame * 0.9) * 40]
      : null;
  const thread = active ? active.c[0] : C.gold;
  return (
    <AbsoluteFill style={{ background: C.linen }}>
      <Sfx src={SFX.swell} at={4} volume={0.22} />
      {Array.from({ length: 40 }, (_, i) => 14 + i * 10).map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.06} />)}
      <Sfx src={SFX.hit} at={428} volume={0.22} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <SilkDefs />
        <rect width={W} height={H} fill="url(#n15-linen)" />
        <rect width={W} height={H} filter="url(#n15-grain)" opacity={0.12} />
        <Spool x={150} y={1720} color={C.peony} rot={-12} />
        <Spool x={320} y={1770} color={C.jade} rot={8} />
        <Spool x={930} y={1690} color={C.gold} rot={14} />
        <g opacity={on}>
          <Hoop cx={CX} cy={CY} r={R} tilt={0.2}>
            <g transform={`translate(${CX},${CY}) scale(${S0}) translate(-540,-1000)`}>
            {/* stars: french knots */}
            {[[260, 640], [340, 720], [640, 610], [920, 820], [200, 860], [700, 760]].map(([x, y], i) => frame > 30 + i * 5 && <Knot key={i} x={x} y={y} r={5} color={C.ivory} />)}
            {WATER.map((d, i) => <Running key={i} id={`w${i}`} d={d} k={k(20 + i * 12, 110 + i * 12)} len={820} color={i % 2 ? "#a9c3e8" : "#d8e4f4"} />)}
            {SHAPES.map((s) => <Satin key={s.id} id={`n15-${s.id}`} d={s.d} color={s.c[0]} light={s.c[1]} dark={s.c[2]} angle={s.angle} k={k(s.at[0], s.at[1])} box={s.box} />)}
            {/* lotus stems and pad veins: couched jade cord */}
            <Couched id="stem1" d="M300,1150 C300,1190 296,1215 300,1240" k={k(318, 332)} len={100} w={5} color="#3f7a5c" tie="#1c3a2a" />
            <Couched id="stem2" d="M820,1140 C824,1180 812,1220 790,1250" k={k(340, 354)} len={120} w={5} color="#3f7a5c" tie="#1c3a2a" />
            {/* the goby's outline, gill, mouth and scales in couched gold */}
            <Couched id="body" d="M300,1010 C300,950 360,925 430,928 C530,934 620,955 705,975 L792,932 C812,975 812,1035 792,1078 L705,1032 C620,1050 530,1074 430,1082 C360,1084 300,1068 300,1010Z" k={k(286, 330)} len={1300} w={6} />
            <Couched id="gill" d="M396,948 C412,990 412,1040 392,1076" k={k(300, 314)} len={140} w={4.5} />
            <Couched id="tailr" d="M712,1004 L790,1004 M712,990 L788,962 M712,1018 L788,1048" k={k(306, 322)} len={260} w={3.5} />
            {SCALES.map((d, i) => <Couched key={i} id={`sc${i}`} d={d} k={k(304 + i * 2, 312 + i * 2)} len={42} w={3.5} />)}
            {frame >= 312 && <Knot x={345} y={994} r={12} color="#1a0b14" />}
            {frame >= 314 && <circle cx={345} cy={994} r={15} fill="none" stroke="url(#n15-goldcord)" strokeWidth={3} />}
            {/* title in gold satin, stitched left to right */}
            <defs>
              <pattern id="n15-tsat" width="40" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(72)">
                <rect width="40" height="3.6" fill="#d9a441" />
                <rect y="0.3" width="40" height="1.4" fill="#fff0b0" opacity="0.6" />
                <rect y="3" width="40" height="0.6" fill="#7a5418" opacity="0.7" />
              </pattern>
              <clipPath id="n15-tclip">
                <rect x={240} y={590} width={600 * titleK} height={250} />
              </clipPath>
            </defs>
            <g clipPath="url(#n15-tclip)" filter="url(#n15-raise)">
              <text x={540} y={765} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={150} fill="url(#n15-tsat)" stroke="#7a5418" strokeWidth={2}>ปลาบู่ทอง</text>
            </g>
            {needle && <Needle at={needle} color={thread} from={[540 + 430 * 0.95, 1000 + 430 * 0.4]} />}
            </g>
          </Hoop>
        </g>
      </svg>
      {/* kicker: a woven label sewn onto the linen */}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: on }}>
        <div style={{ fontFamily: font, fontWeight: 700, fontSize: 40, color: C.ivory, background: "#5a2754", padding: "10px 34px", borderRadius: 6, outline: "3px dashed #d8b25a", outlineOffset: -10, boxShadow: "0 6px 14px rgba(40,30,20,0.35)" }}>N15 · งานปักไหม</div>
      </div>
      <div style={{ position: "absolute", top: 1500, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k(380, 400) }}>
        <div style={{ fontFamily: font, fontWeight: 600, fontSize: 44, lineHeight: 1.35, textAlign: "center", color: "#3d1a3a", background: "#efe7d6", padding: "18px 44px", borderRadius: 4, outline: "3px dashed #b8475f", outlineOffset: -12, boxShadow: "0 8px 18px rgba(40,30,20,0.3)", transform: "rotate(-1.5deg)" }}>
          แม่ของเอื้อยกลับชาติมาเกิด<br />เป็นปลาบู่ทองในสระ
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 64, display: "flex", justifyContent: "space-between", fontFamily: font, fontWeight: 600, fontSize: 28, color: "#4a3f34", opacity: 0.85 * k(30, 50) }}>
        <span>ภาพประกอบ · ลายปักวาดด้วยโค้ด</span>
        <span>นิทานพื้นบ้านไทย</span>
      </div>
    </AbsoluteFill>
  );
};
