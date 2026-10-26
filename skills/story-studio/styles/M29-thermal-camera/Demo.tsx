import type { FeatureCollection, Geometry } from "geojson";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { camAt } from "../../components/camera";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { useJson } from "../../components/useJson";
import type { StyleDemo } from "../types";
import { Battery, Brackets, C, clamp, Crosshair, fade, font, heatField, HeatCanvas, HotBox, HudText, Optics, projFor, ScaleBar, type Spot } from "./kit/Thermal";

// M29 thermal camera: April 2023, Thailand's hottest month on record, seen through an infrared camera. The wide
// view blooms as the palette range drops, the spot meter pans to Bang Na (heat index 54 °C) and then to Tak, where
// the camera locks on 45.4 °C — the highest temperature ever measured in Thailand. The heat field itself is
// simulated (labelled ภาพจำลอง); the two readings are real (Thai Meteorological Department). 16 s.
export const demo: StyleDemo = { id: "M29", name: "กล้องความร้อน", frames: 480, cover: 400, sizes: ["9x16"] };

const W = 1080;
const H = 1920;
const BOX = [40, 230, 1000, 1340]; // map fit box; its centre (540, 900) is the spot meter
const EXTENT: [number, number, number, number] = [97.2, 5.5, 105.8, 20.6];
const TAK: [number, number] = [99.126, 16.869];
const BANGNA: [number, number] = [100.605, 13.668];

// Simulated heat field (ภาพจำลอง): hot central plain and the Ping valley at Tak, a hot city, cooler hills and south.
const SPOTS: Spot[] = [
  { at: TAK, t: 7, r: 0.3 },
  { at: [99.6, 16.2], t: 4, r: 1.1 },
  { at: [100.2, 15.4], t: 5, r: 1.3 },
  { at: [99.6, 18.2], t: 3.5, r: 0.6 },
  { at: [100.55, 13.74], t: 5.5, r: 0.28 },
  { at: [102.6, 16.0], t: 3.2, r: 1.8 },
  { at: [98.5, 14.8], t: -4.5, r: 0.9 },
  { at: [98.5, 19.6], t: -3.5, r: 0.8 },
  { at: [99.4, 8.5], t: -3, r: 1.6 },
  { at: [96.5, 21.5], t: -2, r: 2 },
];
const base = (lon: number, lat: number) => 34.5 + Math.max(0, Math.min(1, (lat - 9) / 7)) * 1.5;

const TAGS: { at: [number, number]; text: string }[] = [
  { at: TAK, text: "ตาก" },
  { at: [100.5, 13.75], text: "กรุงเทพฯ" },
  { at: [98.98, 18.79], text: "เชียงใหม่" },
  { at: [102.83, 16.43], text: "ขอนแก่น" },
  { at: [100.47, 7.0], text: "หาดใหญ่" },
];

const CAPS = [
  { text: "เมษายน 2566 คลื่นความร้อนปกคลุมไทย", f0: 14, f1: 168 },
  { text: "กรุงเทพฯ ดัชนีความร้อนที่บางนาแตะ 54°C", f0: 168, f1: 316 },
  { text: "ตาก 45.4°C ร้อนที่สุดเท่าที่ไทยเคยวัดได้", f0: 316, f1: 494 },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  // frame-rate stutter: the sensor delivers ~10 images a second, and now and then one frame is held longer
  const fq = frame - (frame % 3) - (frame > 200 && frame < 206 ? 3 : 0);
  const cam = camAt(
    [
      { frame: 0, cam: { lon: 101.2, lat: 13.2, scale: 1 } },
      { frame: 168, cam: { lon: 101.0, lat: 13.3, scale: 1.05 }, easing: (t) => t },
      { frame: 236, cam: { lon: BANGNA[0], lat: BANGNA[1], scale: 4.4 } },
      { frame: 300, cam: { lon: BANGNA[0], lat: BANGNA[1], scale: 4.6 }, easing: (t) => t },
      { frame: 370, cam: { lon: TAK[0], lat: TAK[1], scale: 2.6 } },
      { frame: 480, cam: { lon: TAK[0], lat: TAK[1], scale: 2.8 }, easing: (t) => t },
    ],
    fq,
  );
  // heat bloom: the camera's range drops, so the whole scene climbs the palette towards white
  const tMax = interpolate(fq, [20, 150, 236, 300, 370], [54, 46, 47, 47, 46.5], clamp);
  const tMin = interpolate(fq, [20, 150, 236, 300, 370], [24, 27, 30, 30, 29], clamp);
  const rivers = useJson<{ rivers: FeatureCollection<Geometry> }>("data/th-rivers.json")?.rivers ?? null;
  const proj = useMemo(() => projFor(cam, EXTENT, BOX), [cam.lon, cam.lat, cam.scale]);
  const field = useMemo(() => heatField({ width: W, height: H, proj, spots: SPOTS, tMin, tMax, seed: fq, base, cell: 4, rivers }), [proj, tMin, tMax, fq, rivers]);
  const flat = interpolate(frame, [0, 6, 12], [1, 1, 0], clamp) + (frame >= 300 && frame < 305 ? 0.9 : 0); // shutter (NUC) at start and between targets
  const lockB = interpolate(frame, [236, 250], [0, 1], clamp) * interpolate(frame, [300, 306], [1, 0], clamp);
  const lockT = interpolate(frame, [372, 388], [0, 1], clamp);
  const lock = Math.max(lockB, lockT);
  const hot = field.hot;
  const secs = Math.floor(frame / 30);
  const clock = `00:${String(14 + Math.floor((secs + 22) / 60)).padStart(2, "0")}:${String((secs + 22) % 60).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`;
  const cap = CAPS.find((c) => frame >= c.f0 && frame < c.f1);
  const capK = cap ? fade(frame, cap.f0, cap.f1, 8) : 0;
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: C.black, overflow: "hidden" }}>
      <Bed id="wind" from={0} to={480} volume={0.05} />
      <Sfx src={SFX.tick} at={10} volume={0.3} />
      <Sfx src={SFX.tick} at={300} volume={0.3} />
      <Sfx src={SFX.whoosh} at={170} volume={0.16} />
      <Sfx src={SFX.whoosh} at={306} volume={0.16} />
      <Sfx src={SFX.pop} at={242} volume={0.22} />
      <Sfx src={SFX.hit} at={378} volume={0.28} />
      <Hit id="fire_crackle" at={380} volume={0.06} />
      <HeatCanvas img={field.img} width={W} height={H} flat={Math.min(1, flat)} />
      <Optics width={W} height={H} />
      <Brackets width={W} height={H} inset={34} len={84} />
      {/* status bar */}
      <div style={{ position: "absolute", left: 70, top: 66, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#ff3b2a", opacity: blink ? 1 : 0.25, boxShadow: "0 0 8px #000" }} />
        <HudText size={30} weight={700}>REC</HudText>
        <HudText size={30} weight={500} style={{ fontVariantNumeric: "tabular-nums" }}>{clock}</HudText>
      </div>
      <HudText size={26} weight={500} style={{ position: "absolute", right: 170, top: 70 }}>IR 9 Hz · ε 0.95</HudText>
      <Battery x={W - 150} y={64} level={0.75} />
      {/* kicker + title */}
      <HudText size={30} weight={600} style={{ position: "absolute", left: 70, top: 128, padding: "4px 14px", border: `2.5px solid ${C.hud}`, background: "rgba(0,0,0,0.35)" }}>M29 · กล้องความร้อน</HudText>
      <HudText size={84} weight={700} style={{ position: "absolute", left: 66, top: 190 }}>ไทยร้อนทำสถิติ</HudText>
      <HudText size={34} weight={500} style={{ position: "absolute", left: 70, top: 298 }}>เมษายน 2566 · มองผ่านกล้องอินฟราเรด</HudText>
      <HudText size={22} weight={600} style={{ position: "absolute", right: 60, top: 128, padding: "3px 10px", background: "rgba(0,0,0,0.45)" }}>ภาพจำลอง · สีความร้อนไม่ใช่ค่าวัดจริง</HudText>
      {/* scale bar */}
      <ScaleBar x={980} y={560} h={760} tMin={tMin} tMax={tMax} ticks={[25, 30, 35, 40, 45, 50]} />
      <HudText size={24} weight={600} style={{ position: "absolute", left: 978, top: 494 }}>°C</HudText>
      {/* hottest pixel in view */}
      <HotBox x={hot.x} y={hot.y} on={frame > 40 && Math.hypot(hot.x - 540, hot.y - 900) > 70 ? 1 : 0} label="MAX" />
      <Crosshair x={540} y={900} lock={lock} />
      {/* spot readouts */}
      <div style={{ position: "absolute", left: 610, top: 950, opacity: lockB }}>
        <HudText size={26} weight={500}>SP1 · บางนา กรุงเทพฯ</HudText>
        <HudText size={24} weight={500} style={{ marginTop: 4 }}>ดัชนีความร้อน</HudText>
        <HudText size={96} weight={700} color={C.white}>54°C</HudText>
        <HudText size={22} weight={500}>เม.ย. 2566 · กรมอุตุนิยมวิทยา</HudText>
      </div>
      <div style={{ position: "absolute", left: 600, top: 950, opacity: lockT }}>
        <HudText size={26} weight={500}>SP1 · อ.เมืองตาก จ.ตาก</HudText>
        <HudText size={124} weight={700} color={C.white} style={{ marginTop: -4 }}>45.4°</HudText>
        <div style={{ display: "inline-block", marginTop: 6, padding: "4px 14px", background: C.white, color: C.black, fontFamily: font, fontWeight: 700, fontSize: 28 }}>สถิติสูงสุดของไทย</div>
        <HudText size={22} weight={500} style={{ marginTop: 8 }}>เม.ย. 2566 · กรมอุตุนิยมวิทยา</HudText>
      </div>
      {/* place tags on the wide view */}
      {TAGS.map((t) => {
        const p = proj(t.at);
        const k = fade(frame, 30, 168);
        if (!p || k <= 0) return null;
        return (
          <div key={t.text} style={{ position: "absolute", left: p[0] - 9, top: p[1] - 9, opacity: k }}>
            <div style={{ width: 14, height: 14, border: `3px solid ${C.hud}`, transform: "rotate(45deg)", boxShadow: "0 0 4px #000" }} />
            <HudText size={26} weight={600} style={{ position: "absolute", left: 26, top: -10, whiteSpace: "nowrap" }}>{t.text}</HudText>
          </div>
        );
      })}
      <HudText size={24} weight={500} style={{ position: "absolute", left: 70, top: 1440, opacity: fade(frame, 20, 170) }}>มุมกว้าง · ประเทศไทยทั้งประเทศ</HudText>
      {/* caption strip */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1560, height: 150, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,2,12,0.62)", borderTop: `3px solid ${C.hud}`, borderBottom: `3px solid ${C.hud}` }}>
        <HudText size={46} weight={600} style={{ opacity: capK, textAlign: "center", padding: "0 20px" }}>{cap?.text ?? ""}</HudText>
      </div>
      <HudText size={19} weight={400} style={{ position: "absolute", left: 0, right: 0, top: 1790, textAlign: "center", opacity: 0.9 }}>
        ภาพความร้อนเป็นภาพจำลอง · ค่าที่วัดได้จาก กรมอุตุนิยมวิทยา (เม.ย. 2566) · แผนที่ Natural Earth
      </HudText>
    </AbsoluteFill>
  );
};
