import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Beads, clamp, font, Gilt, GiltMass, H, MosaicDefs, Vine, W, Wall } from "./kit/Mosaic";
import { busabokOutline, chediField, chediOutline, CITIES, CRACK_D, GABLE, gablePath, journey, riverPoint, throneField } from "./kit/Pictures";

// N25 glass mosaic: the legend of the Emerald Buddha told in the glass field of a temple gable. A chedi in Chiang
// Rai is struck by lightning and an emerald seam opens in its gilded stucco; the glass re-sets itself tile by tile
// into the journey through five cities, then into the pavilion throne in Bangkok, 2327 BE. A band of light sweeps
// the gable all the time and single mirror pieces flash. Dates from the chronicle tradition (sources in STYLE.md).
export const demo: StyleDemo = { id: "N25", name: "กระจกเกรียบ", frames: 540, cover: 175, sizes: ["9x16"] };

const STRIKE = 70;
const CAPS = [
  { from: 0, to: 212, a: "พ.ศ. 1977 · เชียงราย", b: "ฟ้าผ่าเจดีย์ ปูนกะเทาะ เห็นเนื้อสีเขียว" },
  { from: 212, to: 372, a: "เดินทางผ่านหลายเมือง", b: "ลำปาง เชียงใหม่ หลวงพระบาง เวียงจันทน์" },
  { from: 372, to: 540, a: "พ.ศ. 2327 · กรุงเทพฯ", b: "ประดิษฐานที่วัดพระศรีรัตนศาสดาราม" },
];
const BOLT = "M880 0 L800 210 L850 228 L730 470 L780 486 L640 720 L680 734 L520 930";
const { ax, ay, by, hw } = GABLE;
const slope = (by - ay) / hw;

// gilded bargeboards with bai raka fins along the two slopes, the chofa hook at the apex
const Bargeboards = () => {
  const off = 34;
  const n = 15;
  const fins = Array.from({ length: n }, (_, i) => {
    const k = (i + 0.7) / n;
    return [-1, 1].map((s) => {
      const x = ax + s * hw * k, y = ay + (by - ay) * k;
      const ox = x + s * off * 1.2, oy = y - off * 0.9;
      return `M${ox - s * 4} ${oy + 4} C${ox} ${oy - 30} ${ox + s * 6} ${oy - 52} ${ox + s * 30} ${oy - 74} C${ox + s * 22} ${oy - 50} ${ox + s * 34} ${oy - 24} ${ox + s * 44} ${oy - 4} Z`;
    }).join(" ");
  }).join(" ");
  return (
    <g>
      <Gilt d={`M${ax - hw - 40} ${by + 40 * slope * 0.6} L${ax} ${ay - off} L${ax + hw + 40} ${by + 40 * slope * 0.6}`} w={54} />
      <Gilt d={`M${ax - hw} ${by} L${ax} ${ay + 18} L${ax + hw} ${by}`} w={12} />
      <Gilt d={fins} w={4} fill />
      {/* chofa: a slender hooked finial rising from the apex */}
      <Gilt d={`M${ax - 16} ${ay - 40} C${ax - 20} ${ay - 120} ${ax + 10} ${ay - 170} ${ax + 52} ${ay - 196} C${ax + 70} ${ay - 206} ${ax + 74} ${ay - 186} ${ax + 58} ${ay - 178} C${ax + 30} ${ay - 160} ${ax + 18} ${ay - 120} ${ax + 16} ${ay - 40} Z`} w={6} fill />
    </g>
  );
};

// the hall under the gable: lintel, two white columns with lotus capitals, the lacquered name board
const Hall = () => (
  <g>
    <rect x={0} y={by} width={W} height={H - by} fill="#2a140c" />
    <rect x={0} y={by} width={W} height={H - by} fill="url(#n25-hallshade)" />
    {[70, 1010].map((x) => (
      <g key={x}>
        <rect x={x - 46} y={by + 40} width={92} height={H - by} fill="#ece6d6" />
        <rect x={x - 46} y={by + 40} width={92} height={H - by} filter="url(#n25-plaster)" opacity={0.5} />
        <rect x={x + 10} y={by + 40} width={36} height={H - by} fill="#000" opacity={0.12} />
        <Gilt d={`M${x - 60} ${by + 84} Q${x} ${by + 30} ${x + 60} ${by + 84} Z`} w={6} fill />
      </g>
    ))}
    <Gilt d={`M0 ${by + 14} L${W} ${by + 14}`} w={30} />
    <Beads x0={20} x1={1060} y={by + 50} gap={24} />
    {/* name board */}
    <rect x={150} y={by + 92} width={780} height={238} rx={10} fill="#6e0f14" />
    <rect x={150} y={by + 92} width={780} height={238} rx={10} fill="url(#n25-lacquer)" />
    <Gilt d={`M150 ${by + 92} L930 ${by + 92} L930 ${by + 330} L150 ${by + 330} Z`} w={14} />
    <Gilt d={`M176 ${by + 116} L904 ${by + 116} L904 ${by + 306} L176 ${by + 306} Z`} w={3} />
    {/* doors glimpsed in the dark interior */}
    <Gilt d={`M300 ${H} L300 ${by + 400} Q540 ${by + 360} 780 ${by + 400} L780 ${H}`} w={8} />
    <Gilt d={`M540 ${by + 384} L540 ${H}`} w={5} />
  </g>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const crack = interpolate(frame, [STRIKE + 2, 180], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bolt = interpolate(frame, [STRIKE - 2, STRIKE, STRIKE + 5, STRIKE + 8, STRIKE + 12, STRIKE + 22], [0, 1, 0.2, 1, 0.6, 0], clamp);
  const flip1 = interpolate(frame, [192, 238], [0, 1], clamp);
  const flip2 = interpolate(frame, [352, 398], [0, 1], clamp);
  const travel = interpolate(frame, [244, 348], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const lit = Math.min(5, Math.floor(travel * 4.0001) + 1);
  // the camera drifts; the lamp is fixed in the room, so the glints travel across the glass as we move
  const camY = interpolate(frame, [0, 540], [-10, 12]);
  const camS = interpolate(frame, [0, 540], [1.0, 1.04]);
  const u0 = ((frame * 15 + camY * 20) % 2600) - 300;
  const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.35);

  const pic = frame < 300 ? { A: chediField(crack), B: journey(lit), flip: flip1, origin: [545, 1080] as [number, number] } : { A: journey(5), B: throneField, flip: flip2, origin: [690, 1290] as [number, number] };
  const scene = frame < 215 ? 0 : frame < 375 ? 1 : 2;
  const cap = CAPS[scene];
  const capIn = interpolate(frame, [cap.from + 8, cap.from + 24], [0, 1], clamp);
  const [dx, dy] = riverPoint(travel);
  const flash = interpolate(frame, [STRIKE, STRIKE + 14], [0.5, 0], clamp);
  const outA = interpolate(frame, [192, 214], [1, 0], clamp);
  const inC = interpolate(flip2, [0.45, 1], [0, 1], clamp);
  const showCities = (frame >= 228 && frame < 380) || (frame >= 380 && flip2 < 0.6);
  const cityOp = frame < 380 ? interpolate(frame, [228, 244], [0, 1], clamp) : 1 - flip2;

  return (
    <AbsoluteFill style={{ background: "#2a140c" }}>
      <Bed id="wind" from={0} to={540} volume={0.07} />
      <Hit id="thunder_close" at={STRIKE} volume={0.45} />
      <Sfx src={SFX.riser} at={150} volume={0.18} />
      <Sfx src={SFX.whoosh} at={190} volume={0.25} />
      <Hit id="gong" at={244} volume={0.3} />
      <Sfx src={SFX.whoosh} at={350} volume={0.25} />
      <Hit id="gong" at={400} volume={0.35} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <MosaicDefs az={200 + Math.sin(frame / 60) * 40} />
        <defs>
          <linearGradient id="n25-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5f9fd8" />
            <stop offset="0.55" stopColor="#9cc9ea" />
            <stop offset="1" stopColor="#d6ebf5" />
          </linearGradient>
          <linearGradient id="n25-hallshade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.55} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="n25-lacquer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
            <stop offset="0.4" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.3} />
          </linearGradient>
          <clipPath id="n25-gable">
            <path d={gablePath()} />
          </clipPath>
          <mask id="n25-seam" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect x={0} y={0} width={W} height={H} fill="#fff" />
            {crack > 0 && <path d={CRACK_D} stroke="#000" strokeWidth={16 + crack * 40} strokeLinejoin="round" strokeLinecap="round" fill="none" strokeDasharray="420" strokeDashoffset={420 * (1 - Math.min(1, crack * 1.15))} />}
          </mask>
        </defs>
        <g transform={`translate(540,960) scale(${camS}) translate(-540,${-960 + camY})`}>
          {/* smooth sky (not glass) */}
          <rect x={-40} y={-40} width={W + 80} height={by + 40} fill="url(#n25-sky)" />
          <Hall />
          <Wall A={pic.A} B={pic.B} flip={pic.flip} origin={pic.origin} u0={u0} twinkle={twinkle} clip="url(#n25-gable)" />
          <g clipPath="url(#n25-gable)">
            {/* A: gilt chedi with the seam, scroll vines in the lower corners */}
            {frame < 215 && (
              <g opacity={outA}>
                <Vine x={190} y0={1090} y1={1350} side={-1} amp={30} r={56} step={260} />
                <Vine x={890} y0={1090} y1={1350} side={1} amp={30} r={56} step={260} />
                <g mask="url(#n25-seam)">
                  <GiltMass d={chediOutline()} />
                  {[1010, 1080, 1150, 1210].map((y, i) => (
                    <g key={y}>
                      {Array.from({ length: 9 + i * 3 }, (_, k) => {
                        const n = 9 + i * 3;
                        const h = [95, 150, 185, 205][i];
                        const x = 540 - h + ((k + 0.5) * 2 * h) / n;
                        const fl = Math.max(0, Math.sin(frame * 0.12 + k * 1.7 + i)) ** 6;
                        return <rect key={k} x={x - 9} y={y - 9} width={18} height={18} transform={`rotate(45 ${x} ${y})`} fill={fl > 0.5 ? "#ffffff" : "#cfe0e4"} stroke="#6e4a12" strokeWidth={2} />;
                      })}
                    </g>
                  ))}
                </g>
                {crack > 0 && <circle cx={545} cy={1080} r={520} fill="url(#n25-seamglow)" opacity={crack} style={{ mixBlendMode: "screen" }} />}
              </g>
            )}
            {/* B: medallion rims and the travelling light */}
            {showCities && CITIES.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={56} fill="none" stroke="#d9a63a" strokeWidth={10} filter="url(#n25-emboss)" opacity={cityOp} />)}
            {frame >= 244 && frame < 372 && (
              <g>
                <circle cx={dx} cy={dy} r={80} fill="url(#n25-seamglow)" style={{ mixBlendMode: "screen" }} />
                <circle cx={dx} cy={dy} r={22} fill="#e6fff0" opacity={0.9} filter="url(#n25-glow)" />
              </g>
            )}
            {/* C: the gilt pavilion throne, an emerald light in its niche */}
            {frame >= 380 && (
              <g opacity={inC}>
                <GiltMass d={busabokOutline()} />
                <path d="M470 1220 L470 1080 Q540 1010 610 1080 L610 1220 Z" fill="#0b2a1a" />
                <circle cx={540} cy={1150} r={130} fill="url(#n25-seamglow)" style={{ mixBlendMode: "screen" }} />
                <ellipse cx={540} cy={1160} rx={30} ry={44} fill="#2fd88a" opacity={0.85} filter="url(#n25-glow)" />
              </g>
            )}
          </g>
          <Bargeboards />
          {/* city names sit over the glass */}
          {showCities &&
            CITIES.map((c, i) => (
              <g key={i} fontFamily={font} opacity={cityOp} textAnchor={c.side > 0 ? "start" : "end"}>
                <text x={c.x + c.side * 74} y={c.y - 2} fontSize={i === 3 ? 32 : 42} fontWeight={700} fill="#fff1c4" stroke="#3a0a0c" strokeWidth={8} paintOrder="stroke">{c.th}</text>
                <text x={c.x + c.side * 74} y={c.y + 38} fontSize={28} fill="#ffd77a" stroke="#3a0a0c" strokeWidth={6} paintOrder="stroke">{c.yr}</text>
              </g>
            ))}
          {bolt > 0 && (
            <g opacity={bolt}>
              <path d={BOLT} stroke="#ffe27a" strokeWidth={26} fill="none" opacity={0.35} />
              <path d={BOLT} stroke="#fffbe6" strokeWidth={9} fill="none" strokeLinejoin="bevel" filter="url(#n25-glow)" />
            </g>
          )}
          {/* caption on the lacquered name board, gold leaf letters */}
          <g fontFamily={font} textAnchor="middle" opacity={capIn}>
            <text x={540} y={by + 182} fontSize={58} fontWeight={700} fill="#f3cf6a">{cap.a}</text>
            <text x={540} y={by + 240} fontSize={36} fill="#f6e2a8">{cap.b}</text>
            <text x={540} y={by + 286} fontSize={22} fill="#e0b9a0" opacity={0.85}>ภาพประกอบ · เล่าตามตำนาน</text>
          </g>
        </g>
        <rect x={0} y={0} width={W} height={H} fill="#fffbe6" opacity={flash} />
        <rect x={0} y={0} width={W} height={H} fill="url(#n25-vig)" opacity={0.7} />
        <g fontFamily={font} textAnchor="middle" opacity={interpolate(frame, [6, 26], [0, 1], clamp)}>
          <text x={540} y={92} fontSize={36} fontWeight={700} fill="#fff3d0" letterSpacing={2}>N25 · กระจกเกรียบ</text>
          <text x={540} y={186} fontSize={90} fontWeight={700} fill="#ffffff" stroke="#123a6a" strokeWidth={10} paintOrder="stroke">ตำนานพระแก้วมรกต</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
