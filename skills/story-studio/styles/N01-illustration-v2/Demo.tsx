import { loadFont } from "@remotion/google-fonts/Kanit";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PAL } from "../../components/Scene";
import { Bed, Hit } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { clamp } from "./kit/props";
import { BattleScene, BurningCityScene, MarchScene, SHOT_FLIGHT, SiegeScene } from "./kit/scenes";

// N01 illustration v2: four illustrated panels, a new picture every ~4 s (house standard), each with depth layers,
// a light, jointed living figures and impacts (shake + flash + sound on the same frame). March at dawn → siege with
// a cannon on the wall → open battle with elephants and arrows → the city burns at night. 9:16 and 16:9, 15 s.
export const demo: StyleDemo = { id: "N01", name: "ภาพประกอบ v2", frames: 450, cover: 262, sizes: ["9x16", "16x9"] };

const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;

// ---- the schedule (frames). Each scene starts 14 frames before the previous one ends (no-flicker overlap). ----
const SC = [
  { start: 0, end: 120, text: ["รุ่งเช้า ทัพหลวง", "ยกออกจากเมือง"] },
  { start: 106, end: 232, text: ["ข้าศึกตั้งค่ายล้อม", "ปืนใหญ่บนกำแพงยิงสกัด"] },
  { start: 218, end: 344, text: ["สองทัพปะทะกันกลางทุ่ง", "ช้างศึกนำหน้า"] },
  { start: 330, end: 450, text: ["คืนนั้น ไฟลุกท่วมเมือง", "ชาวบ้านหนีตาย"] },
];
const SHOTS = [118, 164, 208]; // cannon fires (lands SHOT_FLIGHT + 2 frames later)
const VOLLEYS = [226, 236];
const CLASHES = [276, 306];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const u = Math.min(width, height) / 1080;
  const cur = SC.filter((c) => frame >= c.start).pop() ?? SC[0];
  const capK = interpolate(frame, [cur.start + 6, cur.start + 18], [0, 1], clamp) * interpolate(frame, [demo.frames - 14, demo.frames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#0d0b12" }}>
      {/* sound: an ambience bed per scene, recorded one-shots on the event frames */}
      <Bed id="army_marching" from={0} to={SC[0].end + 10} volume={0.3} />
      <Hit id="war_horn" at={14} volume={0.4} />
      <Bed id="war_drums" from={SC[1].start} to={SC[2].end} volume={0.25} />
      {SHOTS.map((f) => <Hit key={f} id="cannon" at={f} volume={0.5} />)}
      {SHOTS.map((f) => <Hit key={`l${f}`} id="explosion_far" at={f + SHOT_FLIGHT + 2} volume={0.35} />)}
      <Hit id="battle_cry" at={SC[2].start + 4} volume={0.4} />
      {VOLLEYS.map((f) => <Hit key={f} id="arrows_volley" at={f} volume={0.4} />)}
      <Hit id="elephant" at={252} volume={0.5} />
      {CLASHES.map((f, i) => <Hit key={f} id={i ? "sword_battle" : "sword_clash"} at={f} volume={0.55} />)}
      <Bed id="fire_big" from={SC[3].start} to={demo.frames} volume={0.35} />
      <Hit id="crowd_panic" at={SC[3].start + 10} volume={0.35} />
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <MarchScene id="march" start={SC[0].start} end={SC[0].end} side="siam" light="dawn" />
        <SiegeScene id="siege" start={SC[1].start} end={SC[1].end} shots={SHOTS} />
        <BattleScene id="battle" start={SC[2].start} end={SC[2].end} volleys={VOLLEYS} hits={CLASHES} />
        <BurningCityScene id="burn" start={SC[3].start} end={SC[3].end} fadeOut />
      </svg>
      <div style={{ position: "absolute", top: (vertical ? 78 : 22) * u, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [4, 20], [0, 1], clamp) }}>
        <div style={{ fontSize: (vertical ? 40 : 30) * u, fontWeight: 700, color: PAL.gilt }}>N01 · ภาพประกอบ v2</div>
        <div style={{ fontSize: (vertical ? 80 : 58) * u, fontWeight: 900, lineHeight: 1.15 }}>ศึกชิงเมือง</div>
      </div>
      <div style={{ position: "absolute", left: (vertical ? 60 : 300) * u, right: (vertical ? 60 : 300) * u, top: (vertical ? 1500 : 930) * u, textAlign: "center", fontFamily: font, color: "#fff", opacity: capK, transform: `translateY(${(1 - capK) * 14 * u}px)` }}>
        <div style={{ display: "inline-block", background: "rgba(8,14,26,0.9)", border: `${3 * u}px solid ${PAL.gilt}`, borderRadius: 18 * u, padding: `${(vertical ? 18 : 10) * u}px ${34 * u}px`, fontSize: (vertical ? 54 : 40) * u, fontWeight: 700, lineHeight: 1.3 }}>
          {vertical ? cur.text.map((l, i) => <div key={i} style={{ color: i ? PAL.gilt : "#fff" }}>{l}</div>) : <span>{cur.text[0]} <span style={{ color: PAL.gilt }}>{cur.text[1]}</span></span>}
        </div>
      </div>
    </AbsoluteFill>
  );
};
