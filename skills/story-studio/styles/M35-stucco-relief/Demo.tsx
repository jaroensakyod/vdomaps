import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { WATER } from "./kit/ayutthaya";
import { APEX, Bargeboards, Beads, BL, Boat, C, Carved, Chedi, clamp, fitProj, font, H, hgt, Incised, Kanok, latin, linePath, Lotus, Motes, Prang, Relief, ReliefDefs, rise, Roof, Sky, W, Weather } from "./kit/Stucco";

// M35 temple stucco relief: Ayutthaya, the island capital, modelled in white lime stucco on the jade-painted field
// of a temple gable, seen close up and from below so one bargeboard runs diagonally across the frame against the
// evening sky. Kanok scrolls and the three chedis of Wat Phra Si Sanphet rise out of the plaster, the three rivers
// are carved round the island in an oval cartouche, temples rise on the map as they are named, the title and
// captions are raised stucco letters, and the late sun rakes lower across it all.
// Facts: UNESCO "Historic City of Ayutthaya", Fine Arts Department. 18 s.
export const demo: StyleDemo = { id: "M35", name: "ภาพนูนปูนปั้น", frames: 540, cover: 470, sizes: ["9x16"] };

// the map cartouche
const MC: [number, number] = [560, 1196];
const MR: [number, number] = [404, 158];
const proj = fitProj([186, 1068, 748, 256], [100.534, 14.336, 100.6, 14.37]);
const P = (lon: number, lat: number) => proj([lon, lat]) as [number, number];
const RIVERS = [
  { d: linePath(proj, WATER.chaoPhraya), w: 24, at: 140 },
  { d: linePath(proj, WATER.lopburi), w: 19, at: 160 },
  { d: linePath(proj, WATER.paSak), w: 21, at: 178 },
  { d: linePath(proj, WATER.khlongMueang), w: 10, at: 200 },
];
const SANPHET = P(100.5589, 14.3558);
const MAHATHAT = P(100.5675, 14.3569);
const CHAIWAT = P(100.5417, 14.3428);

const BEATS = [
  { f: 0, to: 140, t: "พ.ศ. 1893 สถาปนากรุงศรีอยุธยา", s: "พระเจ้าอู่ทอง ปฐมกษัตริย์" },
  { f: 140, to: 270, t: "เมืองเป็นเกาะ มีแม่น้ำล้อมรอบ", s: "เจ้าพระยา · ลพบุรี · ป่าสัก" },
  { f: 270, to: 400, t: "วัดพระศรีสรรเพชญ์ กลางพระราชวัง", s: "เจดีย์ทรงระฆังสามองค์" },
  { f: 400, to: 560, t: "ราชธานี 417 ปี จนถึง พ.ศ. 2310", s: "มรดกโลก ยูเนสโก พ.ศ. 2534" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, len = 40) => interpolate(frame, [a, a + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  // the late sun swings lower and further round as the clip goes on
  const az = interpolate(frame, [0, demo.frames], [236, 200], clamp);
  const el = interpolate(frame, [0, demo.frames], [38, 28], clamp);
  const warm = interpolate(frame, [0, demo.frames], [0, 1], clamp);
  const beat = BEATS.find((b) => frame >= b.f && frame < b.to) ?? BEATS[0];
  const bk = interpolate(frame, [beat.f, beat.f + 12, beat.to - 8, beat.to], [0, 1, 1, beat.to >= demo.frames ? 1 : 0], clamp);
  const lab = (a: number) => interpolate(frame, [a, a + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#262a5c" }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.06} />
      <Sfx src={SFX.swell} at={4} volume={0.2} />
      {[10, 36, 56].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.15} />)}
      <Sfx src={SFX.whoosh} at={136} volume={0.14} />
      <Hit id="gong" at={282} volume={0.22} />
      {[312, 342].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.18} />)}
      <Hit id="church_bell" at={404} volume={0.08} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <ReliefDefs az={az} el={el} />
        <defs>
          <clipPath id="m35-oval">
            <ellipse cx={MC[0]} cy={MC[1]} rx={MR[0]} ry={MR[1]} />
          </clipPath>
        </defs>
        <Sky warm={warm} />
        <Roof band={210} />

        {/* the gable panel: a height map lit by the sun */}
        <g clipPath="url(#m35-tri)">
          <Relief x={-40} y={0} w={1160} h={H}>
            <Beads a={[APEX[0] - 20, APEX[1] + 40]} b={[BL[0] + 34, BL[1] - 12]} step={24} r={7} />
            <path d={`M${APEX[0] - 40} ${APEX[1] + 76} L${BL[0] + 74} ${BL[1] - 40}`} stroke={hgt(0.58)} strokeWidth={7} />
            {/* kanok flames along the slope and round the emblem */}
            <Kanok x={930} y={240} s={0.62} k={r(10, 40)} rot={20} />
            <Kanok x={720} y={420} s={0.55} flip k={r(16, 40)} rot={-30} />
            <Kanok x={350} y={920} s={0.9} flip k={r(20, 50)} rot={-20} />
            <Kanok x={960} y={900} s={0.95} k={r(24, 50)} rot={20} />
            <Kanok x={110} y={1420} s={0.78} flip k={r(36, 46)} rot={-30} />
            <Kanok x={990} y={1420} s={0.78} k={r(36, 46)} rot={30} />
            {/* the emblem: Wat Phra Si Sanphet's three bell chedis */}
            <path d="M478 924 L814 924 L800 942 L492 942 Z" fill={hgt(0.66)} />
            <Chedi x={520} y={924} ht={252} k={r(56, 46)} />
            <Chedi x={772} y={924} ht={252} k={r(56, 46)} />
            <Chedi x={646} y={924} ht={350} h={0.98} k={r(44, 50)} />
            {/* the map sits in an oval cartouche with a raised rim */}
            <ellipse cx={MC[0]} cy={MC[1]} rx={MR[0] + 16} ry={MR[1] + 16} fill={hgt(0.66)} />
            <ellipse cx={MC[0]} cy={MC[1]} rx={MR[0]} ry={MR[1]} fill={hgt(0.5)} />
            <g clipPath="url(#m35-oval)">
              {RIVERS.map((rv) => <Carved key={rv.at} d={rv.d} width={rv.w} k={r(rv.at, 70)} />)}
            </g>
            <Chedi x={SANPHET[0] - 17} y={SANPHET[1] + 12} ht={66} k={r(280, 26)} />
            <Chedi x={SANPHET[0]} y={SANPHET[1] + 12} ht={78} k={r(280, 26)} />
            <Chedi x={SANPHET[0] + 17} y={SANPHET[1] + 12} ht={66} k={r(280, 26)} />
            <Prang x={MAHATHAT[0]} y={MAHATHAT[1] + 12} ht={86} k={r(310, 26)} />
            <Prang x={CHAIWAT[0]} y={CHAIWAT[1] + 12} ht={98} k={r(340, 26)} />
            <Prang x={CHAIWAT[0] - 26} y={CHAIWAT[1] + 16} ht={54} k={r(346, 26)} />
            <Prang x={CHAIWAT[0] + 26} y={CHAIWAT[1] + 16} ht={54} k={r(346, 26)} />
            <Boat x={P(100.566, 14.3462)[0]} y={P(100.566, 14.3462)[1] + 6} s={0.85} k={r(362, 24)} />
            <Lotus x0={-40} x1={1120} y={1414} size={42} />
            <Beads a={[0, 1432]} b={[W, 1432]} step={22} r={6} />
            {/* the title and captions are raised stucco letters: they rise out of the field when they change */}
            <text x={540} y={1562} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={104} fill={rise(r(4, 30), 0.8)}>กรุงศรีอยุธยา</text>
            <path d="M260 1604 L820 1604" stroke={rise(r(14, 30), 0.66)} strokeWidth={6} strokeLinecap="round" />
            <circle cx={540} cy={1604} r={11} fill={rise(r(14, 30), 0.74)} />
            <text x={540} y={1700} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={54} fill={rise(bk, 0.78)}>{beat.t}</text>
            <text x={540} y={1768} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={38} fill={rise(bk, 0.72)}>{beat.s}</text>
            <Lotus x0={-40} x1={1120} y={1906} size={40} />
          </Relief>
          <Weather x={-40} y={0} w={1160} h={H} mould={0.3} moss={0.5} />
          {/* incised labels on the map */}
          <Incised x={SANPHET[0]} y={SANPHET[1] + 50} text="วัดพระศรีสรรเพชญ์" size={28} opacity={lab(296)} />
          <Incised x={MAHATHAT[0] + 74} y={MAHATHAT[1] - 58} text="วัดมหาธาตุ" size={28} opacity={lab(324)} />
          <Incised x={CHAIWAT[0] + 10} y={CHAIWAT[1] + 52} text="วัดไชยวัฒนาราม" size={28} opacity={lab(354)} />
          <Incised x={780} y={1290} text="เจ้าพระยา" size={26} opacity={lab(200) * 0.9} />
          <Incised x={810} y={1134} text="ป่าสัก" size={26} opacity={lab(230) * 0.9} />
          <Incised x={320} y={1106} text="ลพบุรี" size={26} opacity={lab(216) * 0.9} />
          <Incised x={540} y={1838} text="ภาพจำลองปูนปั้น · ตำแหน่งวัดโดยประมาณ" size={24} weight={400} opacity={0.85} color="#1d2c4a" />
        </g>
        <Bargeboards />
        {/* the sun's warm glow and floating dust */}
        <rect width={W} height={H} fill="#ffb060" opacity={0.08 + 0.1 * warm} style={{ mixBlendMode: "soft-light" }} />
        <Motes frame={frame} k={0.8} />
      </svg>
      <div style={{ position: "absolute", top: 50, left: 52, fontFamily: font, fontSize: 38, fontWeight: 700, color: C.text, textShadow: "0 2px 6px rgba(0,0,0,0.6)", opacity: interpolate(frame, [0, 16], [0, 1], clamp) }}>
        <span style={{ fontFamily: latin }}>M35</span> · ภาพนูนปูนปั้น
      </div>
      <div style={{ position: "absolute", top: 104, left: 54, fontFamily: font, fontSize: 26, color: "#f4dcc0", textShadow: "0 2px 6px rgba(0,0,0,0.5)", opacity: interpolate(frame, [8, 24], [0, 1], clamp) }}>
        หน้าบันปูนปั้น · แผนที่เกาะเมือง
      </div>
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 17, color: "#e8e0d0", textShadow: "0 1px 3px #000" }}>
        แม่น้ำจาก © OpenStreetMap · ข้อมูล: UNESCO, กรมศิลปากร
      </div>
    </AbsoluteFill>
  );
};
