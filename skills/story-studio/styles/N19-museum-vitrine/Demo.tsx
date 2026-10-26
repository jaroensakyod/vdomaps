import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { CASE, CaseBack, CaseGlass, FishPlate, Gallery, GalleryDefs, LabelCard, Marker, Plinth, Spot, V } from "./kit/Vitrine";

// N19 museum vitrine: a Sukhothai underglaze iron-black fish plate (Sangkhalok ware) turning on its stand in a lit
// glass case; numbered callouts on the plate match the label cards on the plinth. One full turn in 18 s.
export const demo: StyleDemo = { id: "N19", name: "ตู้จัดแสดง", frames: 540, cover: 150, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PLATE = { cx: 540, cy: 930, R: 280 };
// callouts in plate coordinates (u across the face, v down), with the label they point to
const CALL = [
  { n: 1, u: -70, v: 34, at: 60, head: "ลายปลา เขียนสีดำใต้เคลือบ", line: "สีจากแร่เหล็ก เขียนก่อนเคลือบใส แล้วเผาครั้งเดียว" },
  { n: 2, u: 0.5 * 280, v: -0.22 * 280, at: 96, head: "รอยกี๋ 5 จุด", line: "รอยแป้นรองที่ใช้วางชามซ้อนกันในเตา" },
  { n: 3, u: -0.74 * 280, v: 0.5 * 280, at: 132, head: "เนื้อดินหยาบ ทาน้ำดินขาว", line: "ทาดินขาวรองพื้นก่อนเขียนลาย ให้ลายสีดำเด่น" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const theta = -1.2 + (frame * 2 * Math.PI) / 540;
  const c = Math.cos(theta);
  const on = interpolate(frame, [0, 24], [0, 1], clamp);
  const facing = Math.max(0, Math.min(1, (c - 0.3) * 4));
  return (
    <AbsoluteFill style={{ background: V.wall }}>
      <Bed id="city_crowd" from={0} to={540} volume={0.04} />
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      {CALL.map((m) => <Sfx key={m.n} src={SFX.pop} at={m.at} volume={0.3} />)}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <GalleryDefs />
        <Gallery />
        {/* wall vinyl: kicker, object name, date */}
        <g opacity={on}>
          <text x={540} y={96} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={32} letterSpacing={8} fill="#c9d3d8">N19 · ตู้จัดแสดง</text>
          <text x={540} y={236} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={104} fill="#f4f2ec">ชามลายปลา</text>
          <text x={540} y={300} textAnchor="middle" fontFamily={font} fontWeight={400} fontSize={36} fill="#c9d3d8">เครื่องสังคโลก · เตาสุโขทัย</text>
          <path d="M470 336 H610" stroke={V.accent} strokeWidth={4} />
          <text x={540} y={384} textAnchor="middle" fontFamily={font} fontWeight={400} fontSize={26} fill="#9fb0b8">ราวพุทธศตวรรษที่ 20–22 · คริสต์ศตวรรษที่ 14–16</text>
        </g>
        <CaseBack />
        <Spot k={on} />
        <FishPlate cx={PLATE.cx} cy={PLATE.cy} R={PLATE.R} theta={theta} />
        {CALL.map((m) => (
          <Marker key={m.n} x={PLATE.cx + m.u * c} y={PLATE.cy + m.v} n={m.n} font={font} k={interpolate(frame, [m.at, m.at + 12], [0, 1], clamp) * facing} />
        ))}
        {/* small deck label inside the case */}
        <g opacity={on}>
          <rect x={CASE.x + 40} y={CASE.y + CASE.h - 58} width={250} height={40} fill={V.label} />
          <text x={CASE.x + 62} y={CASE.y + CASE.h - 30} fontFamily={font} fontWeight={600} fontSize={22} fill={V.ink}>ภาพจำลอง · วาดใหม่</text>
        </g>
        <CaseGlass drift={Math.sin(frame * 0.012) * 40} />
        <Plinth>
          {CALL.map((m, i) => (
            <LabelCard key={m.n} x={110} y={1536 + i * 118} w={860} n={m.n} head={m.head} line={m.line} font={font} k={interpolate(frame, [m.at + 6, m.at + 20], [0, 1], clamp)} />
          ))}
        </Plinth>
      </svg>
    </AbsoluteFill>
  );
};
