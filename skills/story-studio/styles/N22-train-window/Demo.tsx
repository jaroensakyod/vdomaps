import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Carriage, Embankment, FarLand, MidLand, mix, NearLayer, Outside, Plaque, Rain, Reflection, speedAt, travel, Weather, WIN_W, WindowDefs, type Era } from "./kit/Window";

// N22 train window: about a hundred years of Bangkok seen from one rain-streaked carriage window. Rice fields
// and stilt houses give way to shophouses, concrete blocks and a lit night skyline; the train slows at four
// station boards that announce each year, and a brass plaque under the window keeps count. 18 s.
export const demo: StyleDemo = { id: "N22", name: "หน้าต่างรถไฟ", frames: 540, cover: 470, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const ERAS: Era[] = [
  { year: "2439", event: "รถไฟสายแรก กรุงเทพฯ–อยุธยา", sky: ["#c9cfc4", "#efe3c4"], land: "#5f7a46", haze: "#a9b4a2" },
  { year: "2475", event: "เปลี่ยนแปลงการปกครอง", sky: ["#8e9eab", "#c9d0d2"], land: "#58684a", haze: "#9aa6ac" },
  { year: "2525", event: "กรุงเทพฯ ครบ 200 ปี", sky: ["#5b5a83", "#e79a6c"], land: "#4c5240", haze: "#8a7c8c" },
  { year: "2542", event: "รถไฟฟ้าสายแรกเปิดวิ่ง", sky: ["#0d1326", "#2c3558"], land: "#1c2226", haze: "#2c3550", night: true },
];
const STATIONS = [72, 204, 336, 470];
const LEAD = 66; // the sky turns to the next era this many frames before its station (half way)

export const Demo = () => {
  const frame = useCurrentFrame();
  const p = travel(frame, STATIONS);
  const speed = speedAt(frame, STATIONS);
  const bounds = STATIONS.map((s, i) => travel(i ? Math.round((s + STATIONS[i - 1]) / 2) : 0, STATIONS));
  const eraIdx = (pc: number) => bounds.reduce((n, b, i) => (i > 0 && pc >= b ? i : n), 0);
  const era = (wx: number, factor: number) => ERAS[eraIdx((wx - WIN_W / 2) / factor)];
  // sky and ground blend across each change
  let k = 0;
  STATIONS.forEach((s, i) => { if (i > 0) k += interpolate(frame, [s - LEAD - 26, s - LEAD + 26], [0, 1], clamp); });
  const a = ERAS[Math.floor(k)], b = ERAS[Math.min(3, Math.floor(k) + 1)], f = k - Math.floor(k);
  const sky: [string, string] = [mix(a.sky[0], b.sky[0], f), mix(a.sky[1], b.sky[1], f)];
  const land = mix(a.land, b.land, f);
  const signs = STATIONS.map((s, i) => ({ wx: travel(s, STATIONS) + WIN_W / 2, era: ERAS[i] }));
  // plaque: last station passed, year counting between stations
  const last = STATIONS.reduce((n, s, i) => (frame >= s ? i : n), -1);
  const yr = interpolate(frame, [0, ...STATIONS], [2430, ...ERAS.map((e) => Number(e.year))], clamp);
  const stamp = Math.max(0, ...STATIONS.map((s) => (frame >= s && frame < s + 10 ? 1 - (frame - s) / 10 : 0)));
  const sway = Math.sin(frame * 0.5) * 1.2 + Math.sin(frame * 1.7) * 0.6; // carriage rocking on the rails
  const on = interpolate(frame, [0, 18], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#7aa995" }}>
      <Bed id="rain_light" from={0} to={demo.frames} volume={0.18} />
      {STATIONS.map((s) => <Hit key={s} id="ship_bell" at={s} volume={0.18} />)}
      {STATIONS.map((s) => <Sfx key={`w${s}`} src={SFX.whoosh} at={s - 40} volume={0.18} />)}
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ opacity: on }}>
        <WindowDefs blur={Math.min(14, speed * 0.55)} sky={sky} />
        <g transform={`translate(0,${sway})`}>
          <Outside>
            <Weather p={p} frame={frame} speed={speed} tint={mix(sky[1], "#ffffff", 0.25)} />
            <FarLand p={p} now={ERAS[Math.round(k)]} />
            <MidLand p={p} era={era} frame={frame} />
            <Embankment p={p} land={land} paddy={interpolate(k, [0.6, 1.4], [1, 0], clamp)} sky={sky[1]} />
            <NearLayer p={p} signs={signs} font={font} />
          </Outside>
          <Rain frame={frame} speed={speed} />
          <Reflection />
        </g>
        <Carriage />
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#173f33", opacity: on }}>
        <div style={{ display: "inline-block", fontSize: 30, fontWeight: 600, letterSpacing: 3, padding: "6px 22px", border: "2px solid #8a6a2c", borderRadius: 40, color: "#6b4f1c" }}>N22 · หน้าต่างรถไฟ</div>
        <div style={{ fontSize: 78, fontWeight: 700, marginTop: 14, textShadow: "0 2px 0 #e9f6ef" }}>ร้อยปี นอกหน้าต่าง</div>
      </div>
      <Plaque year={Math.round(yr)} event={last >= 0 ? ERAS[last].event : "ออกเดินทาง"} font={font} stamp={stamp} />
      <div style={{ position: "absolute", bottom: 54, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 24, fontWeight: 500, letterSpacing: 2, color: "#3f6b5a", opacity: 0.8 }}>
        ภาพประกอบ · ทิวทัศน์จำลองตามยุค
      </div>
    </AbsoluteFill>
  );
};
