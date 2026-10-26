import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Backdrop, C, Proscenium, clamp, Floor, font, Notes, Puppet, Puppeteer, puppetRig, Spot, StageDefs, type Pose, type Pt } from "./kit/Stage";

// N27 hun lakhon lek: one scene of Phra Aphai Mani played by a rod puppet. The puppet steps in with its three
// puppeteers dancing behind it, lifts the flute and plays (notes drift up over the painted sea), then lowers it and
// bows with its puppeteers. The scene is a generic sample; the work's author and date are in STYLE.md. 16 s.
export const demo: StyleDemo = { id: "N27", name: "หุ่นละครเล็ก", frames: 480, cover: 250, sizes: ["9x16"] };

const ease = Easing.inOut(Easing.cubic);
const CAPS = [
  { from: 0, to: 150, a: "พระอภัยมณี", b: "ตัวอย่างฉาก · หุ่นหนึ่งตัว คนเชิดสามคน" },
  { from: 150, to: 330, a: "เป่าปี่วิเศษ", b: "ใครได้ยินเสียงปี่ ก็เคลิ้มหลับไปสิ้น" },
  { from: 330, to: 480, a: "สุนทรภู่ ประพันธ์", b: "ราว พ.ศ. 2365–2387" },
];
const mix = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const Demo = () => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 130], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const x = interpolate(enter, [0, 1], [1260, 560]);
  const walking = frame < 130 ? 1 - enter * 0.7 : 0.3;
  const step = frame * 0.22 * (frame < 130 ? 1.2 : 0.6);
  const lift = interpolate(frame, [140, 176, 318, 344], [0, 1, 1, 0], { ...clamp, easing: ease });
  const wai = interpolate(frame, [350, 384], [0, 1], { ...clamp, easing: ease });
  const bow = interpolate(frame, [372, 404, 440, 470], [0, 1, 1, 0.25], { ...clamp, easing: ease });
  const rest: [Pt, Pt] = [[-40 + Math.sin(step) * 10, 170], [60 + Math.sin(step + 1) * 10, 160]];
  const play: [Pt, Pt] = [[10, -40], [40, -20]];
  const praying: [Pt, Pt] = [[60, 64], [-60, 64]];
  const armR = mix(mix(rest[0], play[0], lift), praying[0], wai);
  const armL = mix(mix(rest[1], play[1], lift), praying[1], wai);
  const sway = lift * Math.sin(frame * 0.07);
  const pose: Pose = { x, y: 1580 - Math.abs(Math.sin(step)) * 10 * walking, head: sway * 0.8, armR, armL, step: step * walking + 0.3, bow, flute: lift };
  const r = puppetRig(pose);
  const bob = (k: number) => Math.sin(step + k) * walking;
  const push = interpolate(frame, [0, 480], [1.24, 1.3]);
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capIn = interpolate(frame, [cap.from + 10, cap.from + 26], [0, 1], clamp);
  const lights = interpolate(frame, [0, 24], [0.2, 1], clamp);

  return (
    <AbsoluteFill style={{ background: C.dark }}>
      <Bed id="wind" from={0} to={480} volume={0.06} />
      <Hit id="gong" at={6} volume={0.3} />
      {Array.from({ length: 9 }, (_, i) => <Hit key={i} id="wood_hit" at={10 + i * 14} volume={0.12} />)}
      <Sfx src={SFX.swell} at={170} volume={0.3} />
      <Hit id="gong" at={384} volume={0.3} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <StageDefs />
        <g transform={`translate(540,1180) scale(${push}) translate(-540,-1180)`} opacity={lights}>
          <Backdrop y0={250} y1={1440} waves={frame * 0.05} />
          <Floor y={1440} />
          {/* cool wash on the cloth, warm follow-spot on the players */}
          
          <path d={`M${x - 60} 0 L${x + 60} 0 L${x + 460} 1760 L${x - 460} 1760 Z`} fill="url(#n27-beam)" style={{ mixBlendMode: "screen" }} />
          <Spot x={x} y={1150} rx={600} ry={760} k={1} />
          <ellipse cx={x} cy={1720} rx={420} ry={90} fill="#000" opacity={0.45} filter="url(#n27-soft)" />
          {/* puppeteers stand behind and dance the steps with the puppet */}
          <Puppeteer x={x + 230} y={1860} h={820} hands={[[r.hip[0] + 60, r.hip[1] + 40], [r.hip[0] + 120, r.hip[1] + 120]]} step={bob(2)} face={-1} />
          <Puppeteer x={x - 230} y={1850} h={860} hands={[r.rodHead, r.rodR]} step={bob(0)} face={1} />
          <Puppeteer x={x + 40} y={1870} h={900} hands={[r.rodL, [r.rodL[0] + 40, r.rodL[1] + 60]]} step={bob(1)} face={0} />
          <Puppet p={pose} frame={frame} />
          {lift > 0.6 && <Notes frame={frame} from={180} x={r.head[0] + 80} y={r.head[1]} />}
          <Spot x={x} y={1000} rx={300} ry={420} k={0.5} />
        </g>
        {/* the proscenium wall above the stage: velvet with a gold diaper */}
        <rect x={0} y={0} width={1080} height={260} fill="#5a0a50" />
        <rect x={0} y={0} width={1080} height={260} fill="url(#n27-brocade)" opacity={0.3} />
        <Proscenium y0={250} y1={1920} sway={Math.sin(frame * 0.03) * 6} />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#n27-vig)" opacity={0.55} />
      </svg>
      <div style={{ position: "absolute", top: 56, left: 0, right: 0, textAlign: "center", fontFamily: font, color: C.text }}>
        <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: 3, color: "#e6b44a" }}>N27 · หุ่นละครเล็ก</div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.2 }}>{cap.a}</div>
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 40, right: 40, textAlign: "center", fontFamily: font, opacity: capIn }}>
        <div style={{ display: "inline-block", padding: "14px 30px", background: "rgba(18,10,6,0.78)", borderTop: "3px solid #e6b44a", borderBottom: "3px solid #e6b44a" }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.text }}>{cap.b}</div>
          <div style={{ fontSize: 22, color: "#c8a878", marginTop: 4 }}>ภาพประกอบ · ตัวอย่างฉาก</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
