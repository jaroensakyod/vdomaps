// Page branding for คืนนี้มีเรื่องเล่า (the "เพื่อนรัก" series page): cover 1640×624 and profile picture 1080×1080.
// Facebook crops the cover on phones to the middle ~1000 px, and the profile to a circle: everything that matters sits inside those.
import { AbsoluteFill } from "remotion";
import { Flow25DScreen } from "../../../components/Flow25D";
import { UI } from "../kit";
import { Slim, SLIM_FON_LAST, SLIM_PRAE } from "../slim";

const PINK = "#c2185b";
const NIGHT = { filter: "brightness(0.66) saturate(0.75) contrast(1.05)" };
const GHOST = { filter: "brightness(1.25) saturate(0.4) drop-shadow(0 0 22px #bcd7ff) drop-shadow(0 0 50px #7fa8ff)", opacity: 0.88 };

export const TalePageCover = () => (
  <AbsoluteFill style={{ background: "#05070d" }}>
    <AbsoluteFill style={{ filter: "blur(3px) brightness(0.7)" }}>
      <Flow25DScreen name="f1-banana-night" id="cover" start={0} end={1} zoom={[1.0, 1.0]} pan={0} parallax={0} dust={false} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(5,7,13,0.15) 0%, rgba(5,7,13,0.75) 70%)" }} />
    {/* living friend on the left, her friend's ghost on the right */}
    <svg width={1640} height={624} viewBox="0 0 1640 624" style={{ position: "absolute", ...NIGHT }}>
      <Slim id="cv1" x={270} y={760} s={0.62} look={SLIM_PRAE} rim="#9fc4ff" gaze={1} brow={0.6} front={{ sh: 8, el: 20, wr: 0 }} />
    </svg>
    <svg width={1640} height={624} viewBox="0 0 1640 624" style={{ position: "absolute", ...GHOST }}>
      <Slim id="cv2" x={1380} y={770} s={0.62} look={SLIM_FON_LAST} flip tilt={16} veil={1} eyesOpen={0.2} front={{ sh: 2, el: 2, wr: 0 }} back={{ sh: -2, el: 0, wr: 0 }} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: UI }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#ffd0dc", letterSpacing: 1 }}>เรื่องผีจากทางบ้าน · เล่าใหม่เป็นแอนิเมชัน</div>
      <div style={{ fontSize: 138, fontWeight: 800, lineHeight: 1.12, color: "#fff", textShadow: `0 0 26px ${PINK}, 0 0 70px ${PINK}, 0 5px 0 #000` }}>คืนนี้มีเรื่องเล่า</div>
      <div style={{ marginTop: 22, display: "inline-block", fontSize: 32, fontWeight: 800, color: "#fff", background: PINK, borderRadius: 30, padding: "6px 30px", border: "4px solid #16100c" }}>
        ตอนใหม่ · เพื่อนรัก · กดติดตามไว้
      </div>
    </div>
  </AbsoluteFill>
);

// profile: the ghost's bowed head under the moon, no text (reads at 40 px)
export const TalePageProfile = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #2a3a66 0%, #0d1428 55%, #05070d 100%)" }}>
    <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{ position: "absolute" }}>
      <circle cx={540} cy={300} r={210} fill="#f1e6c8" opacity={0.95} />
      <circle cx={540} cy={300} r={290} fill="#f1e6c8" opacity={0.08} />
    </svg>
    <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{ position: "absolute", ...GHOST, opacity: 1 }}>
      <Slim id="pf" x={560} y={2380} s={2.05} look={SLIM_FON_LAST} tilt={4} veil={1} eyesOpen={0.35} tears={0.7} />
    </svg>
    <AbsoluteFill style={{ boxShadow: `inset 0 0 0 26px ${PINK}`, borderRadius: "50%" }} />
  </AbsoluteFill>
);
