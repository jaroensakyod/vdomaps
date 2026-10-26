import { loadFont } from "@remotion/google-fonts/Prompt";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { AREA, Bench, Ink, INK, Marks, PrintDefs, rnd, Screen, SHEET, Sheet, Squeegee } from "./kit/Print";

// N29 screen print: a gig poster for Woodstock (15–18 Aug 1969) pulled ink by ink. The screen drops on the sheet,
// the squeegee drags each spot ink down (a pink → orange → yellow split fountain, then violet, then a near-black),
// inks overprint into new colours, the screen lifts. Then the sheet is pulled off and a second poster gets one
// more pass: the crowd number. 16 s.
export const demo: StyleDemo = { id: "N29", name: "ภาพพิมพ์สกรีน", frames: 480, cover: 300, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["500", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
const Y0 = SHEET.y - 40;
const Y1 = SHEET.y + SHEET.h + 70;
// one pass of the screen: [screen down, pull start, pull end, screen up]
const PASSES = [
  { down: 12, a: 30, b: 88, up: 108, ink: INK.orange },
  { down: 106, a: 124, b: 176, up: 196, ink: INK.blue },
  { down: 194, a: 212, b: 258, up: 278, ink: INK.dark },
  { down: 372, a: 390, b: 438, up: 458, ink: INK.dark },
];
const CX = 540;
const CY = 830;

// a crowd of heads and shoulders, some arms up with a fist; draw it inside one <Ink>
const Crowd = ({ y: y0, fill, seed = 0 }: { y: number; fill: string; seed?: number }) => (
  <g fill={fill}>
    {Array.from({ length: 34 }, (_, i) => {
      const x = AREA.x + 10 + (i * 27.5) % AREA.w;
      const y = y0 + (i % 2) * 48 + rnd(i + seed) * 18;
      const r = 25 + rnd(i + 9 + seed) * 9;
      const s = rnd(i + 7 + seed) > 0.5 ? 1 : -1;
      const arm = rnd(i + 4 + seed) > 0.55;
      const hx = x + s * r * 2.1, hy = y - r * 2.6;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={r} />
          <path d={`M${x - r * 1.5} ${y + r * 3.4} Q${x - r * 1.6} ${y + r * 1.1} ${x} ${y + r * 1.05} Q${x + r * 1.6} ${y + r * 1.1} ${x + r * 1.5} ${y + r * 3.4} Z`} />
          {arm && <path d={`M${x + s * r * 0.9} ${y + r * 1.3} L${hx} ${hy}`} stroke={fill} strokeWidth={15} strokeLinecap="round" />}
          {arm && <ellipse cx={hx} cy={hy - 4} rx={11} ry={13} />}
        </g>
      );
    })}
    <rect x={AREA.x} y={y0 + 82} width={AREA.w} height={AREA.y + AREA.h - y0 - 82} />
  </g>
);

const Poster1 = ({ k }: { k: number[] }) => {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a0 = (i / 18) * Math.PI * 2, a1 = a0 + 0.05;
    const R = 1300, r0 = 300;
    return `M${CX + Math.cos(a0) * r0} ${CY + Math.sin(a0) * r0} L${CX + Math.cos(a0) * R} ${CY + Math.sin(a0) * R} L${CX + Math.cos(a1) * R} ${CY + Math.sin(a1) * R} L${CX + Math.cos(a1) * r0} ${CY + Math.sin(a1) * r0} Z`;
  }).join(" ");
  const hill = `M${AREA.x} 1262 C250 1190 380 1150 540 1168 C720 1188 840 1130 ${AREA.x + AREA.w} 1180 L${AREA.x + AREA.w} ${AREA.y + AREA.h} L${AREA.x} ${AREA.y + AREA.h} Z`;
  return (
    <g>
      <defs>
        <mask id="sp-m1">
          <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} fill="#fff" />
          <circle cx={CX} cy={CY} r={262} fill="none" stroke="#000" strokeWidth={22} />
          <path d={rays} fill="#000" />
          <circle cx={CX} cy={CY} r={250} fill="#fff" />
          <circle cx={CX} cy={CY} r={205} fill="none" stroke="#000" strokeWidth={12} />
          <circle cx={CX} cy={CY} r={164} fill="none" stroke="#000" strokeWidth={8} />
          <path d={hill} fill="#000" transform="translate(0,26)" />
        </mask>
        <clipPath id="sp-area"><rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} /></clipPath>
        <mask id="sp-m2">
          <rect x={0} y={0} width={1080} height={1920} fill="#fff" />
          {Array.from({ length: 7 }, (_, i) => {
            const y = 1215 + i * (26 + i * 9);
            return <path key={i} d={`M${AREA.x} ${y + 50} C300 ${y - 10} 700 ${y + 30} ${AREA.x + AREA.w} ${y - 6}`} stroke="#000" strokeWidth={6 + i * 2.4} fill="none" />;
          })}
        </mask>
        <mask id="sp-m3">
          <rect x={0} y={0} width={1080} height={1920} fill="#fff" />
          <text x={CX} y={1622} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={44} fill="#000">ฟาร์มโคนม เมืองเบเธล รัฐนิวยอร์ก</text>
        </mask>
      </defs>
      {/* ink 1: split fountain, sun and rays knocked out to paper */}
      <Ink upto={k[0]}>
        <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} fill="url(#sp-fountain)" mask="url(#sp-m1)" />
        <rect x={110} y={SHEET.y + SHEET.h - 110} width={56} height={56} fill="url(#sp-fountain)" />
      </Ink>
      {/* ink 2: blue — title, the year in the sun, the hill, stage and speaker towers */}
      <Ink upto={k[1]}>
        <g fill={INK.blue} filter="url(#sp-cut)">
          <text x={CX} y={AREA.y + 236} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={214} letterSpacing={-6}>วูดสต็อก</text>
          <text x={CX} y={CY + 72} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={200} letterSpacing={-8}>1969</text>
        </g>
        <path d={hill} fill={INK.blue} mask="url(#sp-m2)" />
        {/* stage on the hill: canopy, scaffold towers with speaker stacks */}
        <path d="M392 1150 L392 1078 L688 1078 L688 1150 Z" fill={INK.blue} />
        <path d="M372 1082 L540 1016 L708 1082 Z" fill={INK.blue} />
        {[318, 716].map((x) => (
          <g key={x} fill={INK.blue}>
            <rect x={x} y={960} width={46} height={200} />
            <rect x={x - 10} y={942} width={66} height={34} />
          </g>
        ))}
        <rect x={180} y={SHEET.y + SHEET.h - 110} width={56} height={56} fill={INK.blue} />
      </Ink>
      {/* ink 3: near-black — crowd in front, the dates, the kicker in the margin */}
      <Ink upto={k[2]}>
        <g fill={INK.dark}>
          <g mask="url(#sp-m3)" clipPath="url(#sp-area)">
            <Crowd y={1478} fill={INK.dark} />
          </g>
          <text x={CX} y={AREA.y + 330} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={64} filter="url(#sp-cut)">15–18 สิงหาคม 1969</text>
          <text x={CX} y={AREA.y + 400} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={40} letterSpacing={2}>สามวันแห่งสันติภาพและดนตรี</text>
          <text x={AREA.x} y={SHEET.y + 72} fontFamily={font} fontWeight={700} fontSize={36}>N29 · ภาพพิมพ์สกรีน</text>
          <text x={AREA.x + AREA.w} y={SHEET.y + 72} textAnchor="end" fontFamily={font} fontWeight={500} fontSize={28}>ภาพประกอบ</text>
          <rect x={250} y={SHEET.y + SHEET.h - 110} width={56} height={56} />
          <text x={330} y={SHEET.y + SHEET.h - 68} fontFamily={font} fontWeight={500} fontSize={30}>พิมพ์ 3 สี · ชมพู-ส้ม-เหลืองไล่สี / ม่วง / ดำ</text>
        </g>
      </Ink>
    </g>
  );
};

const Poster2 = ({ k }: { k: number }) => (
  <g>
    <defs>
      <clipPath id="sp-area2"><rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} /></clipPath>
      <mask id="sp-m4">
        <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} fill="#fff" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={AREA.x} y={1222 + i * 34} width={AREA.w} height={6 + i * 3} fill="#000" />)}
        <rect x={AREA.x} y={1440} width={AREA.w} height={260} fill="#000" />
      </mask>
    </defs>
    {/* printed earlier in the run: teal → lime → yellow fountain and the blue hill */}
    <Ink>
      <rect x={AREA.x} y={AREA.y} width={AREA.w} height={AREA.h} fill="url(#sp-fountain2)" mask="url(#sp-m4)" />
      <rect x={110} y={SHEET.y + SHEET.h - 110} width={56} height={56} fill="url(#sp-fountain2)" />
    </Ink>
    <Ink>
      <g clipPath="url(#sp-area2)"><Crowd y={1430} fill={INK.blue} seed={40} /></g>
      <rect x={180} y={SHEET.y + SHEET.h - 110} width={56} height={56} fill={INK.blue} />
    </Ink>
    {/* this pass: the number */}
    <Ink upto={k}>
      <g fill={INK.dark}>
        <text x={CX} y={AREA.y + 230} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={80}>คนดูราว</text>
        <text x={CX} y={AREA.y + 560} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={196} letterSpacing={-6} filter="url(#sp-cut)">400,000</text>
        <text x={CX} y={AREA.y + 700} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={120}>คน</text>
        <rect x={AREA.x + 90} y={AREA.y + 780} width={AREA.w - 180} height={10} />
        <text x={CX} y={AREA.y + 900} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={70}>32 วง · 3 วัน 3 คืน</text>
        <text x={CX} y={AREA.y + 980} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={40}>ตัวเลขคนดูโดยประมาณ</text>
        <text x={AREA.x} y={SHEET.y + 72} fontFamily={font} fontWeight={700} fontSize={36}>N29 · ภาพพิมพ์สกรีน</text>
        <text x={AREA.x + AREA.w} y={SHEET.y + 72} textAnchor="end" fontFamily={font} fontWeight={500} fontSize={28}>ภาพประกอบ</text>
        <rect x={250} y={SHEET.y + SHEET.h - 110} width={56} height={56} />
        <text x={330} y={SHEET.y + SHEET.h - 68} fontFamily={font} fontWeight={500} fontSize={30}>วูดสต็อก 1969 · แผ่นที่ 2</text>
      </g>
    </Ink>
  </g>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const pullY = (p: (typeof PASSES)[number]) => (frame < p.a ? -1 : Y0 + (Y1 - Y0) * r(p.a, p.b, Easing.inOut(Easing.quad)));
  const k = PASSES.map((p) => (frame < p.a ? 0 : frame >= p.b ? 9999 : pullY(p)));
  const active = PASSES.find((p) => frame >= p.down && frame < p.up + 2);
  const screen = active ? r(active.down, active.down + 16) * (1 - r(active.up - 14, active.up)) : 0;
  const squeegee = active && frame >= active.a - 6 && frame <= active.b + 8 ? (frame < active.a ? (frame - active.a + 6) / 6 : frame > active.b ? 1 - (frame - active.b) / 8 : 1) : 0;
  const sqY = active ? (frame < active.a ? Y0 : frame > active.b ? Y1 : pullY(active)) : 0;
  // the finished poster is lifted off the bench and racked; the second sheet is under it
  const off = r(318, 366, Easing.in(Easing.cubic));
  const intro = r(0, 14);
  return (
    <AbsoluteFill style={{ background: "#1f8a6e" }}>
      <Bed id="city_crowd" from={0} to={demo.frames} volume={0.05} />
      {PASSES.map((p) => <Hit key={p.down} id="wood_hit" at={p.down + 16} volume={0.22} />)}
      {PASSES.map((p) => <Sfx key={p.a} src={SFX.whoosh} at={p.a} volume={0.2} />)}
      <Hit id="crowd_cheer" at={282} volume={0.22} />
      <Sfx src={SFX.whoosh} at={318} volume={0.18} />
      <Hit id="crowd_cheer" at={442} volume={0.2} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PrintDefs />
        <Bench />
        <g opacity={intro}>
          {frame >= 300 && (
            <Sheet>
              <Poster2 k={k[3]} />
              <Marks />
            </Sheet>
          )}
          {off < 1 && (
            <Sheet x={off * 240} y={-off * 2100} rot={off * 9}>
              <Poster1 k={k.slice(0, 3)} />
              {k[2] > 0 && <Marks />}
            </Sheet>
          )}
        </g>
        <Screen down={screen} />
        {active && <Squeegee y={sqY} ink={active.ink} show={squeegee} />}
      </svg>
    </AbsoluteFill>
  );
};
