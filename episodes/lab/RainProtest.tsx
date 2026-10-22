import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { PAL, PaperGrain } from "../../components/Scene";
import { Bed, Hit, levelAt } from "../../components/Sound";
import { font } from "../thaihistory/news/kit";

// Lab: a peaceful night protest in the rain, house style v2. Neutral on purpose: blank placards, no clash.
// The chant recording drives the fists (levelAt), lightning and sirens come from one schedule. 1080×1920, 20 s.
export const RAIN_FRAMES = 600;
const W = 1080;
const ROAD = 1000; // world street level
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- the schedule ----
const CHANT_FROM = 20; // the chant bed starts; fists follow its loudness
const LIGHTNING = [128, 334];
const SIREN = 214;
const LIGHTS_UP = 404; // everyone raises a phone light, the crowd cheers
const TITLE = 520;
// one flash rising over 2 frames and fading over 16 (a real double-flicker trips the no-flicker rule)
const flashAt = (f: number) => Math.max(0, ...LIGHTNING.map((l) => interpolate(f, [l - 2, l, l + 16], [0, 1, 0], clamp)));

const rnd = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

// A protester, facing right: walk cycle, arm raise 0–1 (fist or phone light), optional umbrella or placard.
const Protester = ({ x, y, s, frame, phase, walk, raise, shirt, hold, light }: { x: number; y: number; s: number; frame: number; phase: number; walk: number; raise: number; shirt: string; hold: "none" | "umbrella" | "placard"; light: number }) => {
  const t = frame * 0.22 + phase;
  const a = Math.sin(t) * 22 * walk;
  const bob = -Math.abs(Math.sin(t)) * 2.5 * walk;
  const arm = -20 - raise * 150; // degrees from straight down; -170 = straight up
  const r = Math.PI / 180;
  const hx = 6 + Math.sin(arm * r) * 40;
  const hy = -96 + Math.cos(arm * r) * 40;
  const color = ["#c0302a", "#2a6fb0", "#e0a020", "#3f8f4a", "#8a3a8a"][Math.floor(rnd(phase * 7) * 5)];
  return (
    <g transform={`translate(${x},${y + bob}) scale(${s})`}>
      <ellipse cx={0} cy={2 - bob} rx={18} ry={4} fill="#000" opacity={0.3} />
      <path d={`M-4 -58 L${-4 + Math.sin(a * r) * 58} 0`} stroke="#22262e" strokeWidth={10} strokeLinecap="round" />
      <path d={`M4 -58 L${4 - Math.sin(a * r) * 58} 0`} stroke="#2a2e36" strokeWidth={10} strokeLinecap="round" />
      <path d="M-13 -102 Q-15 -80 -11 -56 L11 -56 Q15 -80 13 -102 Q0 -108 -13 -102 Z" fill={shirt} stroke={PAL.ink} strokeWidth={2.2} />
      <circle cx={0} cy={-116} r={10} fill="#c08a62" stroke={PAL.ink} strokeWidth={2} />
      <path d="M-10 -118 Q-10 -130 0 -130 Q10 -130 10 -118 Q4 -122 -10 -118 Z" fill="#1a1512" />
      {/* the other arm, down, holding an umbrella or a placard */}
      {hold === "umbrella" && (
        <g>
          <line x1={-8} y1={-90} x2={-8} y2={-190} stroke="#2a2a2a" strokeWidth={3} />
          <path d="M-74 -180 Q-8 -246 58 -180 Q36 -190 25 -180 Q8 -192 -8 -180 Q-24 -192 -41 -180 Q-52 -190 -74 -180 Z" fill={color} stroke={PAL.ink} strokeWidth={2.5} />
        </g>
      )}
      {hold === "placard" && (
        <g>
          <line x1={-8} y1={-80} x2={-8} y2={-200} stroke="#6a4a2a" strokeWidth={4} />
          <rect x={-46} y={-250} width={76} height={54} fill="#f2ede0" stroke={PAL.ink} strokeWidth={2.5} />
          <rect x={-38} y={-240} width={60} height={8} fill={color} />
          <rect x={-38} y={-226} width={44} height={6} fill="#9a9488" />
        </g>
      )}
      <path d={`M6 -98 L${hx} ${hy}`} stroke={shirt} strokeWidth={9} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={6} fill="#c08a62" stroke={PAL.ink} strokeWidth={1.6} />
      {light > 0 && (
        <g opacity={light}>
          <circle cx={hx} cy={hy - 6} r={26} fill="#fff6d8" opacity={0.25} />
          <circle cx={hx} cy={hy - 6} r={6} fill="#ffffff" />
        </g>
      )}
    </g>
  );
};

const PoliceLine = ({ frame }: { frame: number }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const x = 1840 + i * 48;
      return (
        <g key={i} transform={`translate(${x},${ROAD + (i % 2) * 10})`}>
          <path d="M-4 -58 L-6 0 M4 -58 L6 0" stroke="#1a1d24" strokeWidth={10} />
          <path d="M-13 -102 L13 -102 L11 -56 L-11 -56 Z" fill="#2a3242" stroke={PAL.ink} strokeWidth={2} />
          <circle cx={0} cy={-116} r={11} fill="#3a4252" stroke={PAL.ink} strokeWidth={2} />
          <rect x={-30} y={-110} width={22} height={80} rx={6} fill="#8aa0b8" opacity={0.55} stroke="#c8d4e0" strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

const World = ({ frame }: { frame: number }) => {
  const march = interpolate(frame, [0, 330], [0, 200], { ...clamp, easing: (k) => 1 - (1 - k) * (1 - k) });
  const walking = frame < 330 ? 1 : 0;
  const lights = interpolate(frame, [LIGHTS_UP, LIGHTS_UP + 30], [0, 1], clamp);
  const flash = flashAt(frame);
  const siren = frame >= SIREN ? 1 : 0;
  const crowd = Array.from({ length: 30 }, (_, i) => {
    const row = i % 3;
    return { i, row, x: 260 + ((i * 97) % 1300) + rnd(i) * 40, y: ROAD - 60 + row * 70, s: 1.15 + row * 0.22, hold: (["none", "umbrella", "placard"] as const)[Math.floor(rnd(i + 3) * 3)], shirt: ["#3a4a6a", "#5a3a3a", "#2f5a4a", "#6a5a3a", "#4a3a5a", "#2a2a2a"][i % 6] };
  }).sort((a, b) => a.row - b.row);
  return (
    <g>
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1020" />
          <stop offset="1" stopColor="#24304a" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2230" />
          <stop offset="1" stopColor="#0c0f16" />
        </linearGradient>
      </defs>
      <rect x={-800} y={-1200} width={4000} height={ROAD + 1200} fill="url(#nsky)" />
      <rect x={-800} y={-1200} width={4000} height={ROAD + 1200} fill="#cfd8ff" opacity={flash * 0.55} />
      {/* lightning bolts */}
      {LIGHTNING.map((l, k) => frame >= l && frame < l + 12 ? <path key={l} d={`M${900 + k * 700} -400 L${860 + k * 700} -150 L${930 + k * 700} -120 L${870 + k * 700} 150 L${950 + k * 700} 120 L${900 + k * 700} 420`} stroke="#f4f6ff" strokeWidth={9} fill="none" opacity={flashAt(frame)} strokeLinejoin="round" /> : null)}
      {/* far skyline, then near buildings with lit windows */}
      {Array.from({ length: 14 }, (_, i) => <rect key={`f${i}`} x={-600 + i * 260} y={ROAD - 520 - (i % 4) * 90} width={230} height={600} fill="#161c2c" />)}
      {Array.from({ length: 9 }, (_, i) => {
        const bx = -400 + i * 420;
        const bh = 440 + (i % 3) * 120;
        return (
          <g key={`b${i}`}>
            <rect x={bx} y={ROAD - bh} width={360} height={bh} fill="#20283a" stroke="#0a0d14" strokeWidth={4} />
            {Array.from({ length: Math.floor(bh / 70) * 5 }, (_, j) => (rnd(i * 50 + j) > 0.45 ? <rect key={j} x={bx + 24 + (j % 5) * 66} y={ROAD - bh + 30 + Math.floor(j / 5) * 70} width={34} height={40} fill={rnd(j + i) > 0.5 ? "#f2c56a" : "#9ab4d8"} opacity={0.65} /> : null))}
          </g>
        );
      })}
      {/* street lamps with glow */}
      {[0, 700, 1400, 2100].map((lx) => (
        <g key={lx}>
          <rect x={lx - 5} y={ROAD - 420} width={10} height={420} fill="#2a2e36" />
          <path d={`M${lx} ${ROAD - 420} q40 -10 60 10`} stroke="#2a2e36" strokeWidth={8} fill="none" />
          <circle cx={lx + 60} cy={ROAD - 404} r={110} fill="#ffd38a" opacity={0.16} />
          <circle cx={lx + 60} cy={ROAD - 404} r={14} fill="#fff1c8" />
          <path d={`M${lx + 40} ${ROAD - 400} L${lx - 60} ${ROAD} L${lx + 180} ${ROAD} L${lx + 80} ${ROAD - 400} Z`} fill="#ffd38a" opacity={0.07} />
        </g>
      ))}
      {/* wet road with reflections */}
      <rect x={-800} y={ROAD - 10} width={4000} height={1200} fill="url(#road)" />
      {[0, 700, 1400, 2100].map((lx) => <ellipse key={`r${lx}`} cx={lx + 60} cy={ROAD + 200} rx={30} ry={150} fill="#ffd38a" opacity={0.12} />)}
      {siren > 0 && (
        <g>
          {/* red and blue cross-fade smoothly (a hard swap every few frames reads as flicker) */}
          <ellipse cx={2200} cy={ROAD + 160} rx={260} ry={120} fill="#ff3030" opacity={0.18 * (0.5 + 0.5 * Math.sin(frame * 0.25))} />
          <ellipse cx={2200} cy={ROAD + 160} rx={260} ry={120} fill="#3060ff" opacity={0.18 * (0.5 - 0.5 * Math.sin(frame * 0.25))} />
          <circle cx={2200} cy={ROAD - 140} r={300} fill="#ff3030" opacity={0.12 * (0.5 + 0.5 * Math.sin(frame * 0.25))} />
          <circle cx={2200} cy={ROAD - 140} r={300} fill="#3060ff" opacity={0.12 * (0.5 - 0.5 * Math.sin(frame * 0.25))} />
        </g>
      )}
      <PoliceLine frame={frame} />
      {/* the crowd: fists follow the chant loudness, each with its own lag; phones at LIGHTS_UP */}
      {crowd.map((p) => {
        const lag = Math.floor(rnd(p.i + 9) * 6);
        const r = Math.max(levelAt("crowd_protest", CHANT_FROM + lag, frame) > 0.72 ? 0.85 : 0.15, lights * 0.95);
        const lt = lights * (rnd(p.i + 1) > 0.25 ? 1 : 0);
        return <g key={p.i}>{lt > 0 && <ellipse cx={p.x + march + 40} cy={ROAD + 150 + p.row * 30} rx={10} ry={90} fill="#fff6d8" opacity={0.18 * lt} />}<Protester x={p.x + march} y={p.y} s={p.s} frame={frame} phase={p.i * 1.3} walk={walking} raise={p.hold === "none" || lights > 0 ? r : 0.1} shirt={p.shirt} hold={p.hold} light={lt} /></g>;
      })}
    </g>
  );
};

export const RainProtest = () => {
  const frame = useCurrentFrame();
  // a news camera: slow dolly in on the crowd, slight handheld sway
  // crowd → pan to the police line when the siren starts → back to the crowd for the lights
  const zoom = interpolate(frame, [0, SIREN, SIREN + 36, 330, LIGHTS_UP, TITLE, 600], [0.95, 1.15, 1.05, 1.05, 1.35, 1.2, 1.0], clamp);
  const cx = interpolate(frame, [0, SIREN, SIREN + 36, 330, 380, 600], [900, 1000, 1720, 1720, 1150, 1150], clamp) + Math.sin(frame * 0.05) * 6;
  const cy = ROAD - 380 / zoom + Math.cos(frame * 0.07) * 4; // street line held at ~70% of the screen
  const flash = flashAt(frame);
  const titleK = interpolate(frame, [TITLE, TITLE + 20], [0, 1], clamp);
  const g = { x: 0, y: 0, W, H: 1920, ground: 1920, cx: W / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      {/* sound — beds set the place; every one-shot is an event in the schedule */}
      <Bed id="rain_heavy" from={0} to={600} volume={0.4} />
      <Bed id="crowd_protest" from={CHANT_FROM} to={600} volume={0.5} />
      {LIGHTNING.map((l) => <Hit key={l} id="thunder_close" at={l + 3} volume={0.75} />)}
      <Hit id="siren_police" at={SIREN} volume={0.35} />
      <Hit id="crowd_cheer" at={LIGHTS_UP} volume={0.55} />
      <Hit id="thunder_rumble" at={TITLE} volume={0.5} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <g transform={`translate(${W / 2},960) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
        </g>
        {/* rain in three layers (screen space, fastest nearest) */}
        {[0, 1, 2].map((layer) => (
          <g key={layer} opacity={0.25 + layer * 0.18}>
            {Array.from({ length: 70 - layer * 15 }, (_, i) => {
              const sp = 38 + layer * 22;
              const x = (rnd(i + layer * 100) * 1300 + frame * 6 * (layer + 1)) % 1300 - 100;
              const y = (rnd(i * 3 + layer) * 2100 + frame * sp) % 2100 - 100;
              return <line key={i} x1={x} y1={y} x2={x - 8 - layer * 4} y2={y + 30 + layer * 22} stroke="#b8c8e8" strokeWidth={1.4 + layer} strokeLinecap="round" />;
            })}
          </g>
        ))}
        {/* foreground: umbrellas of people right next to the camera (fastest parallax) */}
        {Array.from({ length: 5 }, (_, i) => {
          const ux = ((i * 290 - cx * 1.5 + 6000) % 1500) - 200;
          return <g key={`u${i}`} transform={`translate(${ux},${1830 + (i % 2) * 50})`}><path d="M-170 40 Q0 -150 170 40 Q110 10 60 40 Q0 0 -60 40 Q-110 10 -170 40 Z" fill={["#151a24", "#1d1418", "#14201c"][i % 3]} stroke="#3a4458" strokeWidth={3} /><line x1={0} y1={-100} x2={0} y2={-130} stroke="#3a4458" strokeWidth={4} /></g>;
        })}
        {/* splashes on the road near the camera */}
        {Array.from({ length: 24 }, (_, i) => {
          const p = (frame + i * 7) % 18;
          return <ellipse key={i} cx={rnd(i) * 1080} cy={1640 + rnd(i + 5) * 260} rx={4 + p * 1.2} ry={1.5 + p * 0.3} fill="none" stroke="#b8c8e8" strokeWidth={1.5} opacity={0.5 * (1 - p / 18)} />;
        })}
        <PaperGrain g={g} id="rp" />
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#e8eeff" opacity={flash * 0.3} />}
      </svg>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [TITLE - 10, TITLE], [1, 0], clamp) }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: PAL.gilt }}>ทดลองฉากฝูงชน · สไตล์ v2</div>
        <div style={{ fontSize: 66, fontWeight: 900 }}>ฝูงชน <span style={{ color: "#8ab4ff" }}>กลางสายฝน</span></div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid #8ab4ff`, borderRadius: 22, padding: "24px 56px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 100, fontWeight: 900 }}>การชุมนุม</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#8ab4ff" }}>คืนฝนตก · กลางเมือง</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
