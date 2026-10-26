import { loadFont } from "@remotion/google-fonts/KoHo";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { drawn, Pour, Sand, Smear, Table, TableDefs } from "./kit/Sand";

// N24 sand art: the water cycle drawn in dark sand on a glowing light table. Sand pours in to make the sea and
// the sun, vapour rises and gathers into a cloud, the cloud drifts over a mountain that sweeps in from the left,
// rain falls, a river runs back to the sea and a loop arrow closes the cycle. Each picture is blown apart and
// re-poured into the next one. 18 s.
export const demo: StyleDemo = { id: "N24", name: "ภาพทราย", frames: 540, cover: 330, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const CAPS = [
  { from: 20, to: 150, text: "แดดอุ่นทะเล น้ำระเหยเป็นไอ" },
  { from: 150, to: 270, text: "ไอน้ำลอยขึ้น รวมตัวเป็นเมฆ" },
  { from: 270, to: 410, text: "เมฆหนักขึ้น ตกเป็นฝนบนภูเขา" },
  { from: 410, to: 540, text: "น้ำไหลลงแม่น้ำ กลับสู่ทะเล" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const glow = r(0, 18);
  // sea: poured in from the left
  const sea = r(14, 70);
  const sun = r(40, 84);
  const sunOut = r(262, 300); // the sun is swept away when the mountain comes in
  const vapour = r(84, 140) * (1 - r(150, 180));
  const cloud = r(140, 190);
  const cloudX = interpolate(frame, [260, 330], [0, -150], { ...clamp, easing: io });
  const mountain = r(268, 320);
  const rain = r(318, 340) * (1 - r(406, 432));
  const river = r(420, 480);
  const loop = r(470, 528);
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 28, cap.to - 16, cap.to], [0, 1, 1, 0], clamp);
  const wave = (y: number, amp: number, ph: number) => `M60 ${y} ` + Array.from({ length: 13 }, (_, i) => `Q${60 + i * 80 + 40} ${y - amp * Math.sin(ph + i)} ${140 + i * 80} ${y}`).join(" ");
  const ph = frame * 0.05;
  return (
    <AbsoluteFill style={{ background: "#1a0e06" }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.08} />
      <Bed id="rain_light" from={318} to={440} volume={0.16} />
      <Sfx src={SFX.swell} at={4} volume={0.22} />
      {[14, 140, 268, 420].map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.18} />)}
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <TableDefs />
        <Table glow={glow} />
        <g clipPath="url(#sa-glass)">

        {/* the sand frame: sand pushed to the edges of the table, a bright oval wiped clear in the middle; the
            title and the caption are written into it with a finger (light shows through the letters) */}
        <Sand id="frame" seed={3} opacity={glow} soft={2.6} even={0.8} cut={<g stroke="none">
          <ellipse cx={540} cy={925} rx={505} ry={620} fill="#000" />
          <text x={540} y={250} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={128} fill="#000">วัฏจักรน้ำ</text>
          <text x={540} y={100} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={52} letterSpacing={2} fill="#000">N24 · ภาพทราย</text>
          <text x={540} y={1690} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={66} fill={`rgba(0,0,0,${capK})`}>{cap.text}</text>
          <text x={540} y={1812} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={32} letterSpacing={2} fill="rgba(0,0,0,0.8)">ภาพประกอบ · วาดด้วยทราย</text>
        </g>}>
          <rect x={0} y={0} width={1080} height={1920} stroke="none" />
        </Sand>
        <defs><clipPath id="sa-oval"><ellipse cx={540} cy={925} rx={530} ry={645} /></clipPath></defs>
        <g clipPath="url(#sa-oval)">
        {/* sun: a sand disc with a finger-wiped ring and rays */}
        <Sand id="sun" seed={5} scatter={sunOut * 120} opacity={1 - sunOut} cut={<circle cx={800} cy={560} r={62} strokeWidth={14} />}>
          <circle cx={800} cy={560} r={104 * sun} />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + 0.2;
            return <line key={i} x1={800 + Math.cos(a) * 140} y1={560 + Math.sin(a) * 140} x2={800 + Math.cos(a) * (140 + 60 * sun)} y2={560 + Math.sin(a) * (140 + 60 * sun)} strokeWidth={20} opacity={sun > 0.4 ? 1 : 0} />;
          })}
        </Sand>

        {/* vapour: three wavy strokes rising off the sea */}
        <Sand id="vap" seed={9} scatter={r(150, 180) * 90} opacity={vapour > 0 ? 1 : 0}>
          {[300, 470, 640].map((x, i) => (
            <path key={x} d={`M${x} 1120 C${x - 40} 1040 ${x + 40} 980 ${x} 900 C${x - 40} 830 ${x + 30} 780 ${x + 10} 720`} fill="none" strokeWidth={18} {...drawn(vapour * 1.2 - i * 0.1)} />
          ))}
        </Sand>

        {/* cloud: gathers from the vapour, later drifts over the mountain */}
        <Sand id="cloud" seed={13} scatter={(1 - cloud) * 110} opacity={cloud > 0 ? Math.min(1, cloud * 2) : 0} cut={<path d={`M${310 + cloudX} 700 Q${420 + cloudX} 660 ${540 + cloudX} 700 M${360 + cloudX} 740 Q${460 + cloudX} 712 ${560 + cloudX} 742`} strokeWidth={10} />}>
          <g transform={`translate(${cloudX},0)`}>
            <circle cx={340} cy={680} r={92} />
            <circle cx={460} cy={620} r={120} />
            <circle cx={590} cy={670} r={96} />
            <rect x={260} y={680} width={420} height={96} rx={48} />
          </g>
        </Sand>

        {/* rain: slanted dashes under the cloud */}
        <Sand id="rain" seed={17} opacity={rain}>
          {Array.from({ length: 30 }, (_, i) => {
            const x = 140 + (i % 10) * 36 + Math.floor(i / 10) * 14;
            const y = 820 + ((Math.floor(i / 8) * 90 + frame * 9 + i * 23) % 260);
            return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} strokeWidth={9} />;
          })}
        </Sand>

        {/* mountain sweeps in from the left; snow line wiped by finger */}
        <Sand id="mtn" seed={21} scatter={(1 - mountain) * 120} opacity={mountain > 0 ? Math.min(1, mountain * 1.6) : 0} cut={<g><path d="M214 1010 L262 1050 L300 1016 L340 1052 L386 1006" strokeWidth={12} /><path d="M330 1000 C360 1060 300 1100 420 1130 C500 1150 560 1170 640 1200" strokeWidth={22} {...drawn(river)} /></g>}>
          <g transform={`translate(${(1 - mountain) * -260},0)`}>
            <path d="M44 1190 L44 1040 L170 1000 L300 880 L420 1000 L520 1060 L660 1190 Z" />
          </g>
        </Sand>

        {/* what the sweeps leave behind */}
        <Smear id="sm1" x={800} y={560} r={190} a0={-2.6} a1={0.9} k={r(266, 300)} />
        <Smear id="sm2" x={470} y={950} r={260} a0={-2.9} a1={-0.4} k={r(150, 176)} />
        {/* sea with finger-wiped wave lines */}
        <Sand id="sea" seed={2} cut={<g strokeWidth={10}>{[1230, 1300, 1380].map((y, i) => <path key={y} d={wave(y, 14 + i * 4, ph + i)} />)}</g>}>
          <path d={`M44 1180 ${wave(1180, 22, ph).slice(wave(1180, 22, ph).indexOf("Q"))} L1036 1180 L1036 1600 L44 1600 Z`} transform={`translate(${(sea - 1) * 1000},0)`} />
        </Sand>


        {/* the loop: a circle arrow closing the cycle */}
        <Sand id="loop" seed={31}>
          <path d="M900 1150 C1010 1000 1000 760 760 640" fill="none" strokeWidth={22} {...drawn(loop)} />
          {loop > 0.95 && <path d="M720 616 L800 610 L770 682 Z" stroke="none" />}
        </Sand>

        {/* birds flicked in with a fingertip, and grass tufts on the mountain foot */}
        <Sand id="birds" seed={51} opacity={r(176, 200)} soft={2.4} even={0.8}>
          {[[620, 820, 1], [690, 870, 0.8], [560, 900, 0.7]].map(([x, y, k], i) => {
            const fl = Math.sin(frame * 0.25 + i * 1.3) * 10 * k;
            return <path key={i} d={`M${x - 34 * k} ${y - fl} Q${x - 14 * k} ${y - 16 * k} ${x} ${y} Q${x + 14 * k} ${y - 16 * k} ${x + 34 * k} ${y - fl}`} fill="none" strokeWidth={7} />;
          })}
        </Sand>
        <Sand id="grass" seed={53} opacity={mountain} soft={2.4}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = 70 + i * 34;
            const y = 1180 - (i < 8 ? i * 4 : 0);
            return <path key={i} d={`M${x} ${y} l${-8 + (i % 3) * 8} -34`} fill="none" strokeWidth={6} />;
          })}
        </Sand>
        </g>
        <Pour x={60 + sea * 900} y={1300} frame={frame} on={sea > 0 && sea < 1 ? 1 : 0} />
        <Pour x={800} y={560} frame={frame} on={sun > 0 && sun < 1 ? 1 : 0} />
        <Pour x={300 + mountain * 120} y={900} frame={frame} on={mountain > 0.05 && mountain < 0.95 ? 1 : 0} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
