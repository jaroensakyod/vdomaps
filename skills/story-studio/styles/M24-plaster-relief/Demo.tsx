import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { useJson } from "../../components/useJson";
import type { StyleDemo } from "../types";
import { along, at, Block, BlurDefs, C, clamp, ease, Flag, font, geo, Pointer, Relief, Slab, Thread, type Dem, type Model } from "./kit/Plaster";

// M24 plaster relief: the Battle of Lat Ya in the Nine Armies' War (1785–86) briefed on a white plaster model of
// the Kanchanaburi hills. A pointer stick traces the Burmese route from the Three Pagodas Pass, blue blocks are set
// down in the hills, red blocks close the valley mouth at Lat Ya, a red thread loops behind to cut the supply line,
// and the blue thread turns back. Positions and routes are approximate. 18 s.
export const demo: StyleDemo = { id: "M24", name: "แบบจำลองปูนปลาสเตอร์", frames: 540, cover: 405, sizes: ["9x16"] };

const W = 1080;
const H = 1920;
const M: Model = { pw: 930, ph: 960, cx: 540, cy: 890, tilt: 26, P: 1700, scale: 1 };

const CAPS = [
  { f: 20, to: 125, t: "สงครามเก้าทัพ พ.ศ. 2328", s: "พม่ายกทัพใหญ่มาหลายทางพร้อมกัน" },
  { f: 125, to: 235, t: "ทัพหลวงพระเจ้าปดุง", s: "เข้ามาทางด่านเจดีย์สามองค์" },
  { f: 235, to: 330, t: "วังหน้าตั้งรับที่ทุ่งลาดหญ้า", s: "ปิดปากทางลงสู่ที่ราบ" },
  { f: 330, to: 430, t: "ส่งกองโจรอ้อมไปตัดเสบียง", s: "ทัพพม่าติดอยู่ในป่าเขา" },
  { f: 430, to: 560, t: "ทัพพม่าแตก ถอยกลับ", s: "ชัยชนะครั้งสำคัญของสงครามเก้าทัพ" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const dem = useJson<Dem>("raster/kan-dem.json");
  const on = interpolate(frame, [0, 24], [0, 1], clamp);
  const cap = CAPS.find((c) => frame >= c.f && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.f, cap.f + 12, cap.to - 8, cap.to], [0, 1, 1, cap.to >= demo.frames ? 1 : 0], clamp);
  if (!dem) return <AbsoluteFill style={{ background: C.studio }} />;
  const g = (lon: number, lat: number) => geo(M, dem, lon, lat);
  const PASS = g(98.39, 15.3);
  const LATYA = g(99.43, 14.12);
  const KAN = g(99.53, 14.0);
  const ROUTE: [number, number][] = [PASS, g(98.45, 15.12), g(98.62, 14.78), g(98.84, 14.45), g(99.08, 14.27), g(99.3, 14.18)];
  const CAMPS = [g(99.2, 14.24), g(99.28, 14.2), g(99.24, 14.3), g(99.33, 14.26)];
  const LINE = [g(99.42, 14.2), g(99.44, 14.13), g(99.43, 14.06)];
  const RAID: [number, number][] = [g(99.46, 14.2), g(99.4, 14.36), g(99.18, 14.44), g(98.98, 14.4)];
  const BACK: [number, number][] = [g(99.22, 14.25), g(98.98, 14.33), g(98.75, 14.56), g(98.6, 14.82)];

  // the pointer: pass → down the route → Lat Ya → along the raid → back along the retreat
  const tip: [number, number] =
    frame < 125
      ? along([g(98.9, 14.6), PASS], ease(frame, 30, 80))
      : frame < 235
        ? along(ROUTE, ease(frame, 135, 220))
        : frame < 330
          ? along([ROUTE[ROUTE.length - 1], LATYA], ease(frame, 240, 270))
          : frame < 430
            ? along(RAID, ease(frame, 340, 410))
            : along(BACK, ease(frame, 440, 520));
  const taps = [84, 222, 272, 300, 412, 522];
  const tap = Math.max(0, ...taps.map((t) => (frame >= t && frame < t + 10 ? Math.sin(((frame - t) / 10) * Math.PI) : 0)));
  const drop = (f: number) => ({ k: interpolate(frame, [f, f + 4], [0, 1], clamp), lift: interpolate(frame, [f, f + 12], [40, 0], { ...clamp, easing: (t) => t * t }) });
  const retreat = ease(frame, 440, 520);
  return (
    <AbsoluteFill style={{ background: C.studio, opacity: on }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.05} />
      {taps.map((t) => <Hit key={t} id="wood_hit" at={t + 4} volume={0.22} />)}
      {[200, 210, 220, 230, 262, 270, 278].map((f) => <Sfx key={f} src={SFX.tick} at={f + 10} volume={0.3} />)}
      <Sfx src={SFX.whoosh} at={130} volume={0.15} />
      <Sfx src={SFX.whoosh} at={436} volume={0.15} />
      <Bed id="war_drums" from={430} to={demo.frames} volume={0.06} />
      {/* studio: dark table, a lamp pool from the upper left */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="m24-pool" cx="0.42" cy="0.5" r="0.75">
            <stop offset="0" stopColor="#3a3d40" />
            <stop offset="0.55" stopColor={C.table} />
            <stop offset="1" stopColor="#0b0c0d" />
          </radialGradient>
        </defs>
        <BlurDefs />
        <rect width={W} height={H} fill="url(#m24-pool)" />
        {/* the lamp: a soft shaft of light in the air, from the upper left */}
        <defs>
          <linearGradient id="m24-shaft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d="M-80 -60 L260 -60 L1000 900 L120 1100 Z" fill="url(#m24-shaft)" filter="url(#m24-soft2)" />
        <Slab m={M} />
      </svg>
      <Relief m={M} dem={dem} azimuth={interpolate(frame, [0, demo.frames], [296, 306])} elevation={18} exaggeration={3.4} detail="kan-hillshade" />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <BlurDefs />
        {/* falloff of the lamp across the model */}
        <defs>
          <radialGradient id="m24-lamp" cx="0.3" cy="0.3" r="0.9">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.7" stopColor="#000" stopOpacity={0.12} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#m24-lamp)" />
        <Thread m={M} pts={ROUTE} color={C.blue} k={ease(frame, 135, 220) * (1 - retreat * 0.7)} />
        <Thread m={M} pts={RAID} color={C.red} k={ease(frame, 340, 410)} dash="10 8" />
        <Thread m={M} pts={BACK} color={C.blue} k={retreat} dash="10 8" />
        {CAMPS.map((p, i) => {
          const d = drop(200 + i * 10);
          const back = along([p, BACK[1], BACK[2]], retreat * 0.55);
          return <Block key={i} m={M} x={back[0]} y={back[1]} color={C.blue} k={d.k} lift={d.lift} w={34} d={20} h={13} />;
        })}
        {LINE.map((p, i) => {
          const d = drop(262 + i * 8);
          return <Block key={i} m={M} x={p[0]} y={p[1]} color={C.red} k={d.k} lift={d.lift} w={20} d={34} h={13} />;
        })}
        {/* the raiders move round behind */}
        {[0, 1].map((i) => {
          const p = along(RAID, ease(frame, 350 + i * 12, 418 + i * 6));
          return <Block key={i} m={M} x={p[0] + i * 14} y={p[1] + i * 12} color={C.red} k={interpolate(frame, [348 + i * 12, 354 + i * 12], [0, 1], clamp)} w={14} d={14} h={10} />;
        })}
        <Flag m={M} x={PASS[0]} y={PASS[1]} text="ด่านเจดีย์สามองค์" k={interpolate(frame, [70, 90], [0, 1], clamp)} />
        <Flag m={M} x={LATYA[0] + 8} y={LATYA[1] - 30} text="ทุ่งลาดหญ้า" k={interpolate(frame, [270, 290], [0, 1], clamp)} side={-1} tall={95} />
        <Flag m={M} x={KAN[0]} y={KAN[1]} text="กาญจนบุรี" k={interpolate(frame, [36, 56], [0, 1], clamp)} tall={60} />
        <Pointer m={M} x={tip[0]} y={tip[1]} tap={tap} k={interpolate(frame, [26, 40], [0, 1], clamp)} />
        {/* engraved scale bar on the slab's front edge */}
        {(() => {
          const kmPerUnit = ((dem.bbox[2] - dem.bbox[0]) * 111.32 * Math.cos((14.65 * Math.PI) / 180)) / M.pw;
          const len = 20 / kmPerUnit;
          const [a1, b1] = at(M, 40, M.ph, -16);
          const [a2, b2] = at(M, 40 + len, M.ph, -16);
          return (
            <g fontFamily={font} fontSize={20} fill="#5d5a54">
              <path d={`M${a1} ${b1} H${a2} M${a1} ${b1 - 6} V${b1 + 6} M${a2} ${b2 - 6} V${b2 + 6}`} stroke="#5d5a54" strokeWidth={2} />
              <text x={a2 + 12} y={b2 + 7}>20 กม. · แนวตั้งขยาย 3 เท่า</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ position: "absolute", top: 84, left: 70, right: 70, fontFamily: font, color: C.text, opacity: interpolate(frame, [6, 24], [0, 1], clamp) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600, color: "#b9b7b1" }}>
          <span style={{ width: 16, height: 16, background: C.red, display: "inline-block" }} />
          <span style={{ width: 16, height: 16, background: C.blue, display: "inline-block", marginLeft: -8 }} />
          M24 · แบบจำลองปูนปลาสเตอร์
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>ศึกทุ่งลาดหญ้า</div>
        <div style={{ fontSize: 34, color: "#b9b7b1", marginTop: 4 }}>แผนรับทัพพม่าที่กาญจนบุรี</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1505, fontFamily: font, color: C.text, opacity: capK }}>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.2 }}>{cap.t}</div>
        <div style={{ fontSize: 32, color: "#b9b7b1", marginTop: 6 }}>{cap.s}</div>
        <div style={{ display: "flex", gap: 30, marginTop: 22, fontSize: 24, color: "#9c9a94" }}>
          <span><span style={{ display: "inline-block", width: 18, height: 12, background: C.red, marginRight: 8 }} />สยาม</span>
          <span><span style={{ display: "inline-block", width: 18, height: 12, background: C.blue, marginRight: 8 }} />พม่า</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 70, right: 70, fontFamily: font, fontSize: 21, color: "#7d7b76" }}>
        ภาพประกอบ · ตำแหน่งและเส้นทางโดยประมาณ · ความสูง Copernicus DEM GLO-90
      </div>
    </AbsoluteFill>
  );
};
