import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { alga, C, clamp, CyanoDefs, fadeIn, fern, font, Print, Sheet, Strokes, Sun, type Seg } from "./kit/Cyano";

// N28 cyanotype: "photographs without a camera". The sensitiser is brushed onto rag paper, a seaweed is laid on
// it and the sheet goes into the sun, then it is washed and the print develops from the waterline down: Prussian
// blue ground, the weed left white. Then the 1843 book of algae prints, and a second sheet (a fern) slides in.
// Facts: Herschel 1842, Atkins 1843 (sources in STYLE.md). 16 s.
export const demo: StyleDemo = { id: "N28", name: "ไซยาโนไทป์", frames: 480, cover: 452, sizes: ["9x16"] };

const ease = Easing.inOut(Easing.cubic);

// the specimen: a red alga with five fronds from one holdfast
const ALGA: Seg[] = [];
[-2.45, -2.1, -1.8, -1.57, -1.34, -1.05, -0.72].forEach((a, i) => alga(40 + i, 480 + (i - 3) * 5, 1460, 165 + (i % 2) * 40 + (i === 3 ? 50 : 0), a, 8.5 - Math.abs(i - 3) * 0.6, 0, ALGA));
const AlgaShape = () => (
  <g>
    <Strokes segs={ALGA} />
    <ellipse cx={480} cy={1466} rx={14} ry={8} stroke="none" />
    {/* the title is cut from paper and printed with the weed */}
    <text x={540} y={290} fontFamily={font} fontSize={104} fontWeight={700} textAnchor="middle" stroke="none">ภาพถ่ายที่ไม่ใช้กล้อง</text>
  </g>
);
const FERN = fern(846, 994, 400, -1.68, 0.5);
const FernShape = () => <g>{FERN}</g>;

const CAPS = [
  { from: 0, to: 105, a: "ค.ศ. 1842 · จอห์น เฮอร์เชล", b: ["พบว่าเกลือเหล็กบางชนิด", "กลายเป็นสีน้ำเงินเมื่อโดนแดด"] },
  { from: 105, to: 215, a: "วางของจริงทับลงบนกระดาษ", b: ["แล้วนำออกตากแดดหลายนาที"] },
  { from: 215, to: 315, a: "ล้างด้วยน้ำเปล่า", b: ["ส่วนที่ถูกบังแสงจะกลายเป็นสีขาว"] },
  { from: 315, to: 480, a: "ค.ศ. 1843 · แอนนา แอตกินส์", b: ["พิมพ์ภาพสาหร่ายทีละแผ่น รวมเป็นหนังสือ", "ที่ถือกันว่ามีภาพถ่ายประกอบเป็นเล่มแรก"] },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const brush = interpolate(frame, [18, 92], [0, 1], clamp);
  const lay = interpolate(frame, [92, 112], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const on = interpolate(frame, [92, 104, 196, 214], [0, 1, 1, 0], clamp);
  const sun = interpolate(frame, [110, 190], [0, 1], { ...clamp, easing: ease });
  const sunLight = interpolate(frame, [104, 124, 180, 200], [0, 1, 1, 0], clamp);
  const lift = interpolate(frame, [192, 214], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const wash = interpolate(frame, [222, 306], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const slide = interpolate(frame, [350, 392], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const push = interpolate(frame, [0, 315, 480], [1, 1.02, 1.045], { ...clamp, easing: ease });
  const driftX = Math.sin(frame / 90) * 6;
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capIn = fadeIn(frame, cap.from + (cap.from ? 4 : 30), 14);
  const sheetIn = interpolate(frame, [0, 22], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: C.table }}>
      <Bed id="wind" from={0} to={480} volume={0.08} />
      <Sfx src={SFX.whoosh} at={20} volume={0.25} />
      <Sfx src={SFX.whoosh} at={55} volume={0.2} />
      <Sfx src={SFX.swell} at={106} volume={0.3} />
      <Hit id="splash" at={224} volume={0.35} />
      <Sfx src={SFX.whoosh} at={346} volume={0.3} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <CyanoDefs />
        {/* the sheet fills the frame: coat almost to the edges, notes in the margins */}
        <g opacity={sheetIn} transform={`translate(${540 + driftX},900) scale(${push}) translate(-540,-900)`}>
          <Sheet x={-40} y={-40} w={1160} h={2000} rot={-0.5}>
            <Print id="p1" x={52} y={118} w={976} h={1420} brush={brush} sun={sun} wash={wash} specimen={<AlgaShape />} specimenOn={on} lift={lift} />
            <g fontFamily={font} fill={C.ink}>
              <text x={540} y={80} fontSize={32} fontWeight={600} letterSpacing={5} textAnchor="middle" opacity={0.85}>N28 · ไซยาโนไทป์</text>
              <text x={70} y={1592} fontSize={26} fontStyle="italic" opacity={0.75}>Pl. 1 · สาหร่ายสีแดง</text>
              <text x={1010} y={1592} fontSize={24} textAnchor="end" opacity={0.6}>ภาพประกอบ · วาดใหม่</text>
              <g opacity={capIn} transform={`translate(0,${(1 - capIn) * 10})`}>
                <text x={70} y={1676} fontSize={50} fontWeight={700}>{cap.a}</text>
                {cap.b.map((l, i) => <text key={i} x={70} y={1736 + i * 48} fontSize={35} fontStyle="italic" opacity={0.9}>{l}</text>)}
              </g>
            </g>
          </Sheet>
          {/* second sheet, already developed, slides in over the corner */}
          {frame >= 348 && (
            <g transform={`translate(${slide * 620},${-slide * 80})`}>
              <Sheet x={640} y={520} w={400} h={580} rot={6}>
                <Print id="p2" x={662} y={546} w={356} h={470} brush={1} sun={1} wash={1} specimen={<FernShape />} />
                <text x={668} y={1066} fontFamily={font} fontSize={24} fontStyle="italic" fill={C.ink} opacity={0.75}>Pl. 2 · เฟิร์น</text>
              </Sheet>
            </g>
          )}
        </g>
        <Sun k={sunLight} />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#n28-vig)" opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};
