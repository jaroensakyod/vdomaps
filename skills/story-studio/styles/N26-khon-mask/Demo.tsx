import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Brocade, C, clamp, DemonMask, Flames, font, Glitter, KhonDefs, MonkeyMask, type Turn } from "./kit/Khon";

// N26 khon mask: a Ramakien episode (Hanuman sets Lanka alight) retold in three close-ups. The demon king's mask
// turns slowly in the lamp light and gives the order; it turns away and the monkey hero's mask turns in, the fire
// rises under it; the two masks face each other over the flames. Embroidered costume silk behind, gold glitter.
// The story is retold in our own words, the masks are original designs. 18 s.
export const demo: StyleDemo = { id: "N26", name: "หน้ากากโขน", frames: 540, cover: 330, sizes: ["9x16"] };

const ease = Easing.inOut(Easing.sin);
const CAPS = [
  { from: 0, to: 205, a: ["ทศกัณฐ์", "จับหนุมานได้"], b: ["สั่งให้เอาผ้าชุบน้ำมัน", "พันหาง แล้วจุดไฟ"] },
  { from: 205, to: 400, a: ["หนุมาน", "ไม่สะทกสะท้าน"], b: ["สะบัดหางลุกโชน", "กระโจนไปตามหลังคาเมือง"] },
  { from: 400, to: 540, a: ["กรุงลงกาลุกเป็นไฟ"], b: ["รามเกียรติ์ · ตอนหนุมานเผากรุงลงกา"] },
];
// whole-mask edge-on squash once a head turns past ~35°
const edge = (yaw: number) => {
  const a = Math.abs(yaw);
  return a < 0.6 ? 1 : Math.max(0.02, Math.cos(((a - 0.6) / (Math.PI / 2 - 0.6)) * (Math.PI / 2)));
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const L = interpolate(frame, [0, 200, 400, 540], [-0.9, 0.1, -0.7, 0.3], { ...clamp, easing: ease });
  const yawD = interpolate(frame, [0, 168, 205], [-0.1, 0.42, 1.57], { ...clamp, easing: ease });
  const yawM = interpolate(frame, [190, 240, 390], [-1.57, 0.12, 0.42], { ...clamp, easing: ease });
  const duel = interpolate(frame, [392, 440], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fire = interpolate(frame, [250, 320], [0, 1], clamp);
  const push = interpolate(frame, [0, 540], [1, 1.05]);
  const capFor = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capIn = interpolate(frame, [capFor.from + 10, capFor.from + 26], [0, 1], clamp);
  const breathe = Math.sin(frame * 0.05) * 6;

  const tD: Turn = { yaw: frame < 400 ? yawD : interpolate(duel, [0, 1], [-1.57, -0.42]), L, R: 300 };
  const tM: Turn = { yaw: frame < 400 ? yawM : interpolate(duel, [0, 1], [0.3, 0.42]), L, R: 290 };
  const mX = interpolate(duel, [0, 1], [540, 250]);
  const mY = interpolate(duel, [0, 1], [1110, 1180]);
  const mS = interpolate(duel, [0, 1], [1.6, 1.22]);
  const dX = interpolate(duel, [0, 1], [540, 850]);
  const dY = interpolate(duel, [0, 1], [1110, 1000]);
  const dS = interpolate(duel, [0, 1], [1.62, 1.26]);

  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <Bed id="war_drums" from={0} to={540} volume={0.12} />
      <Hit id="gong" at={20} volume={0.35} />
      <Sfx src={SFX.whoosh} at={186} volume={0.3} />
      <Hit id="fire_big" at={256} volume={0.3} />
      <Bed id="fire_crackle" from={250} to={540} volume={0.14} />
      <Hit id="gong" at={404} volume={0.35} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <KhonDefs L={L} />
        <Brocade drift={frame * 0.4} dim={0.18 + fire * 0.3} />
        {fire > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#5a1004" opacity={fire * 0.55} />}
        <rect x={0} y={0} width={1080} height={1920} fill="url(#n26-spot)" />
        <g transform={`translate(540,1000) scale(${push}) translate(-540,-1000)`}>
          {/* fire behind the masks once the tail is lit */}
          <Flames frame={frame} x={540} y={1900} w={760} h={700 + fire * 700} k={fire} />
          {(frame < 205 || frame >= 400) && (
            <g transform={`rotate(${-6 * (1 - duel)} 540 1000) translate(${-290 * (1 - duel)},0) translate(${dX},${dY + breathe}) scale(${edge(tD.yaw)},1) translate(${-dX},${-dY - breathe})`} opacity={frame >= 400 ? 0.92 : 1}>
              <DemonMask x={dX} y={dY + breathe} s={dS} t={tD} />
            </g>
          )}
          {frame >= 190 && (
            <g transform={`rotate(${-6 * (1 - duel)} 540 1000) translate(${-290 * (1 - duel)},0) translate(${mX},${mY - breathe}) scale(${edge(tM.yaw)},1) translate(${-mX},${-mY + breathe})`}>
              <MonkeyMask x={mX} y={mY - breathe} s={mS} t={tM} />
            </g>
          )}
          {/* the lamp catching the front edge: a warm rim light from the lamp side */}
          <rect x={0} y={0} width={1080} height={1920} fill={`url(#n26-spot)`} opacity={0.5} />
        </g>
        <linearGradient id="n26-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.42" stopColor="#000" stopOpacity={0} />
          <stop offset="0.75" stopColor="#000" stopOpacity={0.6} />
          <stop offset="1" stopColor="#000" stopOpacity={0.85} />
        </linearGradient>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#n26-side)" opacity={1 - duel} />
        <Glitter frame={frame} n={90} />
        {fire > 0 && <Glitter frame={frame + 300} n={50} seed={7} area={[60, 900, 960, 1000]} />}
        <rect x={0} y={0} width={1080} height={1920} fill="url(#n26-vig)" opacity={0.5} />
        {/* dark foot for the caption */}
        <linearGradient id="n26-foot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.45" stopColor="#000" stopOpacity={0.5} />
          <stop offset="1" stopColor="#000" stopOpacity={0.7} />
        </linearGradient>
        <rect x={0} y={1560} width={1080} height={360} fill="url(#n26-foot)" />
        {/* foreground flames lick up in front of the collar, under the caption */}
        {fire > 0 && frame < 400 && <Flames frame={frame + 40} x={540} y={1960} w={640} h={300 + fire * 120} k={fire * 0.85} />}
      </svg>
      <div style={{ position: "absolute", top: 70, right: 56, width: 560, textAlign: "right", fontFamily: font, color: C.text, opacity: interpolate(frame, [8, 26], [0, 1], clamp) }}>
        <div style={{ fontSize: 36, letterSpacing: 4, color: "#ffd76a", textShadow: "0 0 14px #000, 0 0 6px #000" }}>N26 · หน้ากากโขน</div>
        <div style={{ fontSize: 80, lineHeight: 1.15, textShadow: "0 0 24px #000, 0 0 10px #000, 0 4px 0 #3a1004" }}>หนุมาน<br />เผาลงกา</div>
      </div>
      <div style={{ position: "absolute", bottom: 90, right: 56, width: duel > 0.5 ? 968 : 470, textAlign: duel > 0.5 ? "center" : "right", fontFamily: font, opacity: capIn, transform: `translateY(${(1 - capIn) * 12}px)` }}>
        <div style={{ fontSize: 58, lineHeight: 1.2, color: C.text, textShadow: "0 0 14px #000, 0 3px 0 #3a1004" }}>{capFor.a.map((l) => <div key={l}>{l}</div>)}</div>
        <div style={{ fontSize: 34, lineHeight: 1.35, color: "#f6d79a", marginTop: 10, textShadow: "0 0 12px #000" }}>{capFor.b.map((l) => <div key={l}>{l}</div>)}</div>
        <div style={{ fontSize: 22, color: "#c9a77a", marginTop: 14, opacity: 0.85 }}>ภาพประกอบ · หน้ากากออกแบบใหม่<br />เล่าความโดยย่อ</div>
      </div>
    </AbsoluteFill>
  );
};
