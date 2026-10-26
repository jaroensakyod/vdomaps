import { loadFont } from "@remotion/google-fonts/BaiJamjuree";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BlockHalf, C, Callout, clamp, Fence, Globe, Grain, oblique, PosterDefs, PosterGround, Waves } from "./kit/Cutaway";

// N13 airbrush cutaway: why the ground shakes, as an airbrushed science poster. A block of crust is sprayed in,
// cut open along a fault; a fence across it bends as strain builds, then the rock snaps back (elastic rebound),
// the two halves jump past each other and seismic waves ring out from the focus. Numbered callouts label each
// part. Facts: USGS Earthquake Hazards Program ("Earthquakes 101", elastic rebound). 16 s.
export const demo: StyleDemo = { id: "N13", name: "ภาพตัดพ่นสี", frames: 480, cover: 318, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const H = 1920;
const SNAP = 228;
const BW = 340; // half width of the block
const D = 300; // block depth
const BH = 430; // block height (cross-section)
const A = 60; // slip at the snap

const STEPS = ["สะสมแรง", "ดีดตัว", "คลื่นแผ่ออก"];

export const Demo = () => {
  const frame = useCurrentFrame();
  const P = oblique(458, 1060);
  const strain = interpolate(frame, [70, SNAP], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const k = interpolate(frame, [SNAP, SNAP + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const after = frame - SNAP;
  const flash = after >= 0 && after < 14 ? 1 - after / 14 : 0;
  const shake = after >= 0 && after < 40 ? (1 - after / 40) * 14 : 0;
  const sx = Math.sin(frame * 2.3) * shake;
  const sy = Math.cos(frame * 3.1) * shake * 0.6;
  // airbrush reveal: a soft mask sweeps across the block like a spray pass
  const spray = interpolate(frame, [4, 46], [-200, 1300], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const push = interpolate(frame, [0, demo.frames], [1, 1.05], clamp);
  // fence: during strain the far ends are dragged, the fault stays locked; at the snap both halves straighten
  const zAt = (x: number) => D / 2 + A * ((1 - k) * -Math.tanh(x / 130) * strain + k * -Math.sign(x || 1));
  const heat = strain * (1 - k) + flash;
  const step = frame < SNAP ? 0 : frame < SNAP + 40 ? 1 : 2;
  const focus = P(0, D / 2, 300);
  const epi = P(0, D / 2, 0);
  const fadeIn = (f: number, len = 22) => interpolate(frame, [f, f + len], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sfx src={SFX.swell} at={4} volume={0.3} />
      <Sfx src={SFX.whoosh} at={6} volume={0.25} />
      {[56, 112, 160, 262].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.3} />)}
      <Sfx src={SFX.riser} at={SNAP - 62} volume={0.22} />
      <Hit id="thunder_rumble" at={SNAP} volume={0.42} />
      <Sfx src={SFX.hit} at={SNAP} volume={0.35} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <PosterDefs />
        <defs>
          <linearGradient id="n13-spray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.85" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="n13-reveal">
            <rect x={spray - 1500} y={0} width={1500} height={H} fill="url(#n13-spray)" />
          </mask>
        </defs>
        <PosterGround w={W} h={H} glow={1 + flash * 0.6} />
        <Globe cx={835} cy={560} r={150} rot={96 + frame * 0.05} k={fadeIn(30, 26)} />
        <g transform={`translate(${sx},${sy}) translate(540,1250) scale(${push}) translate(-540,-1250)`} mask="url(#n13-reveal)">
          {/* glow under the block: the hot mantle below the crust */}
          <ellipse cx={P(0, D / 2, BH)[0]} cy={P(0, D / 2, BH)[1] + 40} rx={560} ry={150} fill="url(#n13-magma)" filter="url(#n13-soft)" opacity={0.9} />
          <BlockHalf P={P} x0={-BW} x1={0} D={D} H={BH} t={A * k} id="l" heat={heat} />
          <BlockHalf P={P} x0={0} x1={BW} D={D} H={BH} t={-A * k} id="r" heat={heat} />
          <Fence P={P} x0={-BW} x1={BW} zAt={zAt} />
          {/* fault plane trace on the top face, glowing as stress builds */}
          <line x1={P(0, -A * k, 0)[0]} y1={P(0, -A * k, 0)[1]} x2={P(0, D + A * k, 0)[0]} y2={P(0, D + A * k, 0)[1]} stroke={C.ember} strokeWidth={10 + heat * 18} opacity={0.4 + heat * 0.5} filter="url(#n13-mist)" />
          <line x1={P(0, -A * k, 0)[0]} y1={P(0, -A * k, 0)[1]} x2={P(0, D + A * k, 0)[0]} y2={P(0, D + A * k, 0)[1]} stroke="#fff1d6" strokeWidth={2.5} />
          {/* plate motion arrows, airbrushed */}
          {[
            { x: -BW * 0.6, dir: 1 },
            { x: BW * 0.6, dir: -1 },
          ].map(({ x, dir }) => {
            const z0 = D / 2 - dir * 70 + 30;
            const z1 = z0 + dir * 120;
            const [ax, ay] = P(x, z0, -50);
            const [bx, by] = P(x, z1, -50);
            const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
            return (
              <g key={x} opacity={fadeIn(60) * (0.75 + 0.25 * Math.sin(frame * 0.12))}>
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#ffffff" strokeWidth={26} opacity={0.35} filter="url(#n13-mist)" />
                <line x1={ax} y1={ay} x2={bx} y2={by} stroke={C.paper} strokeWidth={10} strokeLinecap="round" />
                <path d="M0,-22 L34,0 L0,22 Z" fill={C.paper} transform={`translate(${bx},${by}) rotate(${ang})`} />
              </g>
            );
          })}
          {/* focus (x-ray view inside the rock) and epicentre */}
          <g opacity={interpolate(frame, [SNAP - 4, SNAP + 6], [0, 1], clamp)}>
            <line x1={focus[0]} y1={focus[1]} x2={epi[0]} y2={epi[1]} stroke={C.paper} strokeWidth={3} strokeDasharray="10 9" />
            <circle cx={focus[0]} cy={focus[1]} r={70 + flash * 80} fill="url(#n13-hot)" filter="url(#n13-mist)" />
            <circle cx={focus[0]} cy={focus[1]} r={11} fill="#fffbe6" />
            <path d="M0,-26 L7,-7 L26,0 L7,7 L0,26 L-7,7 L-26,0 L-7,-7 Z" fill="#fffbe6" transform={`translate(${epi[0]},${epi[1]})`} />
          </g>
          <Waves x={focus[0]} y={focus[1]} age={after} n={4} squash={0.9} />
          <Waves x={epi[0]} y={epi[1]} age={after - 8} n={3} squash={0.45} />
        </g>
        {flash > 0 && <rect width={W} height={H} fill="#fff4dc" opacity={flash * 0.35} />}

        {/* callouts */}
        <Callout n={1} at={[790, 470]} to={[110, 450]} below title="แผ่นเปลือกโลก" sub="เคลื่อนช้า ๆ ไม่หยุด" k={fadeIn(56, 26)} font={font} />
        <Callout n={2} at={P(0, D * 0.9, 0)} to={[640, 720]} title="รอยเลื่อน" sub="หินสองฝั่งล็อกกันไว้" k={fadeIn(112, 26)} font={font} />
        <Callout n={3} at={P(-BW * 0.75, D / 2 + A * strain * 0.95, -24)} to={[110, 840]} title="แรงสะสม" sub="หินบิดงอทีละนิด" k={fadeIn(160, 26)} font={font} />
        <Callout n={4} at={[focus[0] + sx, focus[1] + sy]} to={[110, 1590]} title="จุดกำเนิด" sub="หินดีดกลับ ปล่อยคลื่น" k={fadeIn(262, 26)} font={font} />
        <Grain w={W} h={H} />
      </svg>

      {/* title block: bold clean poster type */}
      <div style={{ position: "absolute", top: 70, left: 70, right: 70, fontFamily: font, color: C.paper, opacity: fadeIn(6, 20) }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 3, color: C.ember }}>N13 · ภาพตัดพ่นสี</div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.12, marginTop: 22, textShadow: "0 0 30px rgba(255,138,61,0.55), 0 4px 0 #10162b" }}>ทำไมพื้นดิน<br />ถึงสั่น?</div>
      </div>
      {/* process strip */}
      <div style={{ position: "absolute", left: 300, right: 60, bottom: 140, display: "flex", gap: 14, fontFamily: font, opacity: fadeIn(120) }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center", padding: "12px 6px", borderRadius: 40, fontSize: 30, fontWeight: 700, color: i === step ? C.ink : C.paper, background: i === step ? `radial-gradient(circle at 35% 30%, #ffe0a8, ${C.ember})` : "rgba(16,22,43,0.55)", boxShadow: i === step ? "0 0 34px rgba(255,138,61,0.8)" : "inset 0 0 0 2px rgba(255,246,232,0.35)" }}>
            {i + 1} {s}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 56, display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 26, fontWeight: 600, color: C.paper, opacity: 0.75 * fadeIn(20) }}>
        <span>ภาพประกอบ · ไม่ใช่สัดส่วนจริง</span>
        <span>ที่มา: USGS</span>
      </div>
    </AbsoluteFill>
  );
};
