import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, Console, echoField, EchoCanvas, fade, font, Glass, Glow, Graticule, Legend, Plate, scopeProj, StormMark, Sweep, type Scope, type Storm } from "./kit/Radar";

// M31 weather radar scope: Tropical Storm Pabuk making landfall at Pak Phanang, Nakhon Si Thammarat, at 12:45 on
// 4 January 2019 (Thai Meteorological Department) — the first tropical storm to make landfall in southern
// Thailand since Linda in 1997. The beam turns every 3 s and repaints the spiral rain bands as the storm crosses
// the coast. The echoes are simulated (ภาพจำลอง); the track is approximate. 16 s.
export const demo: StyleDemo = { id: "M31", name: "จอเรดาร์อากาศ", frames: 480, cover: 262, sizes: ["9x16"] };

const SCOPE: Scope = { cx: 540, cy: 890, r: 430, rangeKm: 240, centre: [100.0, 8.75] };
const PERIOD = 90; // frames per turn of the beam
const LANDFALL = 255; // frame of 12:45
const T0 = 8.5; // the clock at frame 0 (08:30), one hour = 60 frames
const TRACK: [number, number, number][] = [
  [-200, 101.45, 8.12],
  [LANDFALL, 100.2, 8.35],
  [520, 99.55, 8.5],
];
const at = (t: number): [number, number] => {
  const i = t <= TRACK[1][0] ? 0 : 1;
  const [f0, x0, y0] = TRACK[i];
  const [f1, x1, y1] = TRACK[i + 1];
  const u = (t - f0) / (f1 - f0);
  return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
};
const STORM: Storm = { at, spin: 0.012, size: 175 };

const TOWNS: { at: [number, number]; text: string; dx?: number; dy?: number; anchor?: "start" | "end" }[] = [
  { at: [99.96, 8.43], text: "นครศรีธรรมราช", dx: -14, dy: -12, anchor: "end" },
  { at: [100.2, 8.33], text: "ปากพนัง", dx: 16, dy: 34 },
  { at: [99.33, 9.14], text: "สุราษฎร์ธานี", dx: -14, dy: -12, anchor: "end" },
  { at: [100.06, 9.5], text: "เกาะสมุย", dx: 18, dy: 8 },
  { at: [100.6, 7.2], text: "สงขลา", dx: 16, dy: 8 },
];

const CAPS = [
  { text: "ต้นปี 2562 พายุโซนร้อนปาบึกเข้าอ่าวไทย", f0: 10, f1: 170 },
  { text: "4 ม.ค. 12:45 น. ขึ้นฝั่งที่ อ.ปากพนัง", f0: 170, f1: 330 },
  { text: "ลูกแรกที่ขึ้นฝั่งภาคใต้ นับจากพายุลินดา ปี 2540", f0: 330, f1: 494 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const proj = useMemo(() => scopeProj(SCOPE), []);
  const field = useMemo(() => echoField({ scope: SCOPE, frame, period: PERIOD, storm: STORM, proj, cell: 3 }), [frame, proj]);
  const hours = T0 + frame / 60;
  const hh = Math.floor(hours);
  const mm = Math.floor((hours - hh) * 60);
  const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const [sx, sy] = proj(at(frame)) as [number, number];
  const trackPts = [at(-60), at(frame)].map((p) => proj(p) as [number, number]);
  const fullTrack = [at(-60), at(LANDFALL), at(470)].map((p) => proj(p) as [number, number]);
  const landed = interpolate(frame, [LANDFALL - 4, LANDFALL + 10], [0, 1], clamp);
  const cap = CAPS.find((c) => frame >= c.f0 && frame < c.f1);
  const capK = cap ? fade(frame, cap.f0, cap.f1, 8) : 0;
  const lamp = Math.floor(frame / 12) % 2 === 0;
  const [pk, pky] = proj([100.2, 8.35]) as [number, number];
  return (
    <AbsoluteFill style={{ background: C.console, overflow: "hidden" }}>
      <Bed id="rain_heavy" from={0} to={480} volume={0.07} />
      <Bed id="wind_storm" from={180} to={480} volume={0.06} />
      {Array.from({ length: 6 }, (_, i) => i * PERIOD + 2).map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.14} />)}
      <Hit id="thunder_rumble" at={LANDFALL} volume={0.3} />
      <Sfx src={SFX.hit} at={LANDFALL} volume={0.18} />
      <Console width={1080} height={1920} scope={SCOPE} />
      <Graticule scope={SCOPE} proj={proj} rings={[60, 120, 180, 240]} />
      <EchoCanvas img={field.img} scope={SCOPE} />
      {/* track: dashed line so far, then the whole forecast line faint */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="m31-face2">
            <circle cx={SCOPE.cx} cy={SCOPE.cy} r={SCOPE.r} />
          </clipPath>
        </defs>
        <g clipPath="url(#m31-face2)">
          <polyline points={fullTrack.map((p) => p.join(",")).join(" ")} fill="none" stroke="#e8ffe9" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="4 10" />
          <polyline points={trackPts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#e8ffe9" strokeWidth={3} strokeDasharray="12 8" />
          {TOWNS.map((t) => {
            const [x, y] = proj(t.at) as [number, number];
            return (
              <g key={t.text}>
                <rect x={x - 6} y={y - 6} width={12} height={12} fill="#e8ffe9" stroke="#000" strokeWidth={2} />
                <text x={x + (t.dx ?? 14)} y={y + (t.dy ?? 8)} textAnchor={t.anchor ?? "start"} fontFamily={font} fontSize={27} fontWeight={700} fill="#e8ffe9" stroke="#000" strokeWidth={6} paintOrder="stroke" strokeOpacity={0.75}>{t.text}</text>
              </g>
            );
          })}
          <text x={SCOPE.cx} y={SCOPE.cy + SCOPE.r - 46} textAnchor="middle" fontFamily={font} fontSize={22} fontWeight={600} fill={C.text} opacity={0.85}>ภาพจำลอง · แนวพายุโดยประมาณ</text>
        </g>
        {/* landfall ring */}
        <circle cx={pk} cy={pky} r={30 + (1 - landed) * 50} fill="none" stroke={C.amber} strokeWidth={4} opacity={landed * fade(frame, LANDFALL - 4, 999)} />
      </svg>
      <StormMark x={sx} y={sy} rot={-frame * 2.4} />
      <Sweep scope={SCOPE} beam={field.beam} />
      <Glass scope={SCOPE} />
      {/* top panel */}
      <Plate x={70} y={74} w={600} h={62}>
        <Glow size={30} weight={700}>M31 · จอเรดาร์อากาศ</Glow>
      </Plate>
      <div style={{ position: "absolute", right: 74, top: 80, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: lamp ? C.red : "#3a0d09", boxShadow: lamp ? `0 0 14px ${C.red}` : "none", border: "2px solid #000" }} />
        <Glow size={24} weight={700} color={C.stencil} style={{ textShadow: "0 1px 0 #2b3016" }}>เฝ้าระวังพายุ</Glow>
      </div>
      {/* painted lettering on the olive console */}
      <Glow size={84} weight={700} color={C.stencil} style={{ position: "absolute", left: 70, top: 158, textShadow: "0 2px 0 #2b3016, 0 -1px 0 #9aa564" }}>พายุโซนร้อนปาบึก</Glow>
      <Glow size={32} weight={600} color={C.stencil} style={{ position: "absolute", left: 72, top: 270, opacity: 0.85, textShadow: "0 1px 0 #2b3016" }}>สะท้อนกลับจากฝน · รัศมี 240 กม.</Glow>
      {/* bottom panel */}
      <Legend x={110} y={1462} w={860} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1548, height: 108, borderRadius: 8, background: "#040a06", boxShadow: "inset 0 3px 8px #000, 0 1px 0 #9aa564", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px" }}>
        <Glow size={30} weight={500}>4 ม.ค. 2562</Glow>
        <Glow size={72} weight={700} style={{ fontVariantNumeric: "tabular-nums" }}>{clock} น.</Glow>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1672, height: 130, borderRadius: 8, background: "#040a06", boxShadow: "inset 0 3px 8px #000, 0 1px 0 #9aa564", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Glow size={42} weight={600} style={{ opacity: capK, textAlign: "center", padding: "0 20px" }}>{cap?.text ?? ""}</Glow>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1826, textAlign: "center", fontFamily: font, fontSize: 19, color: "#e4dfc2" }}>
        ภาพเรดาร์จำลอง · ข้อมูลพายุ: กรมอุตุนิยมวิทยา, JMA · แผนที่ Natural Earth
      </div>
    </AbsoluteFill>
  );
};
