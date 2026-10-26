import { loadFont } from "@remotion/google-fonts/Charm";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Comb, head, MarbleDefs, type Op, type Pt, simulate, Stylus, Surface, Tray } from "./kit/Marble";

// N30 marbling: the Thai folk tale of Mekhala and Ramasura (why there is lightning and thunder), retold on a
// marbling tray. Colour is dropped on the size, combed into a stormy sky, figures are dropped and pulled out with
// the stylus, Mekhala's crystal flashes into a lightning streak, Ramasura's axe is dragged across the sky (thunder),
// then a sheet is laid on, lifted and turned over to show the print. 19 s.
export const demo: StyleDemo = { id: "N30", name: "กระดาษหินอ่อน", frames: 570, cover: 462, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);
// the tray fills the whole frame: the picture is the floating paint, labels lie on top
const BOX: [number, number, number, number] = [0, 0, 1080, 1920];
const GROUND = "#efe3c6";
const P = { indigo: "#4a2a8c", teal: "#1f8f94", ochre: "#d8a03a", red: "#c8284a", cream: "#f1e7cf", turq: "#3c9a94", blue: "#6a8ad8", jade: "#5fb8a8", skin: "#f3dcb8", ink: "#14261f", wine: "#7a1a22", rust: "#a3441f", white: "#fffaf0" };
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const OPS: Op[] = [];
const drop = (at: number, c: Pt, r: number, color: string, dur = 8) => OPS.push({ kind: "drop", at, dur, c, r, color });
const stroke = (at: number, dur: number, path: Pt[], z: number, lambda: number) => OPS.push({ kind: "stroke", at, dur, path, z, lambda });
// ground: big drops of indigo and teal
[[270, 110], [820, 90], [260, 430], [800, 400], [530, 700], [230, 980], [830, 960], [530, 1250], [250, 1500], [820, 1500], [540, 980], [270, 1820], [820, 1830]].forEach(([x, y], i) => drop(6 + i * 6, [x, y], 230, i % 2 ? P.teal : P.indigo, 10));
// accents sprinkled from the brush
const ACC = [P.ochre, P.red, P.cream, P.turq, P.blue, P.cream];
// … big ones first, then a shower of small ones: the "stone" pattern (each new drop squeezes the older ones)
for (let i = 0; i < 24; i++) drop(60 + i, [80 + rnd(i) * 920, 60 + rnd(i + 40) * 1800], 36 + rnd(i + 80) * 40, ACC[i % ACC.length], 6);
for (let i = 0; i < 110; i++) drop(84 + Math.floor(i / 3), [40 + rnd(i + 300) * 1000, 30 + rnd(i + 400) * 1860], 12 + rnd(i + 500) * 22, ACC[(i + 2) % ACC.length], 5);
// comb 1: vertical teeth, alternate up/down; comb 2: horizontal teeth, alternate left/right → a stormy sky
const VT = Array.from({ length: 13 }, (_, i) => 80 + i * 80);
VT.forEach((x, i) => OPS.push({ kind: "tine", at: 116, dur: 34, p: [x, 0], dir: [0, i % 2 ? 1 : -1], z: 70, lambda: 16 }));
const HT = Array.from({ length: 24 }, (_, i) => 30 + i * 80);
HT.forEach((y, i) => OPS.push({ kind: "tine", at: 156, dur: 34, p: [0, y], dir: [i % 2 ? 1 : -1, 0], z: 44, lambda: 14 }));
// comb 3: a fine comb, teeth close together, dragged once down: fine feathered veins all over the sky
const FT = Array.from({ length: 33 }, (_, i) => 52 + i * 30);
FT.forEach((x) => OPS.push({ kind: "tine", at: 176, dur: 18, p: [x, 0], dir: [0, 1], z: 22, lambda: 6 }));
// Mekhala: gown, head, crown, the arm raised to the crystal
drop(196, [320, 1060], 92, P.turq);
drop(202, [320, 960], 74, P.jade);
drop(208, [320, 868], 54, P.cream);
drop(214, [320, 770], 40, P.skin);
drop(218, [320, 722], 17, P.ochre, 6);
stroke(222, 8, [[320, 724], [320, 650]], 36, 8);
stroke(228, 18, [[320, 1000], [320, 1430]], 160, 46);
stroke(246, 12, [[320, 1180], [226, 1430]], 90, 26);
stroke(258, 12, [[320, 1180], [414, 1430]], 90, 26);
stroke(270, 12, [[332, 870], [400, 706], [440, 606]], 70, 18);
// the crystal
drop(284, [452, 560], 64, P.ochre);
drop(288, [452, 560], 46, P.cream);
drop(292, [452, 560], 28, P.white);
drop(296, [452, 560], 11, P.ochre, 6);
// Ramasura: body, head, glowing eyes, crown spikes, legs, arm and axe
drop(302, [760, 1080], 120, P.red);
drop(308, [760, 950], 96, P.wine);
drop(314, [760, 800], 58, P.ink);
drop(320, [738, 792], 9, P.ochre, 5);
drop(322, [782, 792], 9, P.ochre, 5);
stroke(326, 8, [[730, 764], [710, 676]], 46, 9);
stroke(332, 8, [[760, 750], [760, 656]], 46, 9);
stroke(338, 8, [[790, 764], [810, 676]], 46, 9);
stroke(344, 12, [[730, 1160], [690, 1436]], 110, 30);
stroke(352, 12, [[790, 1160], [830, 1436]], 110, 30);
stroke(362, 10, [[822, 930], [880, 780], [910, 690]], 70, 18);
drop(372, [930, 652], 52, P.ochre);
drop(376, [956, 640], 26, P.ink, 6);
// lightning: the crystal's light dragged into a zigzag across the sky
const BOLT: Pt[] = [[470, 548], [560, 430], [620, 500], [716, 330], [776, 404], [900, 282]];
// a chain of white drops along the bolt, then the stylus drags them into one bright zigzag
const along = (path: Pt[], step: number) => {
  const out: Pt[] = [];
  for (let i = 0; i + 1 < path.length; i++) {
    const [ax, ay] = path[i], [bx, by] = path[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let j = 0; j < n; j++) out.push([ax + ((bx - ax) * j) / n, ay + ((by - ay) * j) / n]);
  }
  return out;
};
along(BOLT, 30).forEach((p, i) => drop(386 + Math.floor(i / 3), p, 13, P.white, 4));
stroke(398, 22, BOLT, 70, 10);
// the axe is thrown across the sky towards the crystal: thunder
const THROW: Pt[] = [[930, 652], [800, 600], [640, 572], [520, 562]];
stroke(430, 22, THROW, 150, 24);

const CAPS = [
  { from: 10, to: 192, a: "เมขลา เทพธิดาแห่งสมุทร", b: "มีดวงแก้ววิเศษเป็นของคู่กาย" },
  { from: 192, to: 300, a: "ยามฝนตั้งเค้า นางชูแก้วเล่นกลางฟ้า", b: "แสงแก้วสว่างวาบไปทั่ว" },
  { from: 300, to: 390, a: "ยักษ์รามสูรอยากได้แก้ว", b: "จึงถือขวานไล่ตาม" },
  { from: 390, to: 470, a: "แก้วล่อแวบ เป็นฟ้าแลบ", b: "ขวานขว้างกลางฟ้า ดังเป็นฟ้าร้อง" },
  { from: 470, to: 570, a: "นิทานพื้นบ้านไทย อธิบายฟ้าแลบ ฟ้าร้อง", b: "เล่าใหม่ด้วยลายหินอ่อน" },
];

const active = (frame: number) => {
  for (let i = OPS.length - 1; i >= 0; i--) {
    const o = OPS[i];
    const dur = o.kind === "drop" ? o.dur ?? 8 : o.dur;
    if (frame >= o.at && frame < o.at + dur + 4) return o;
  }
  return null;
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, e = io) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: e });
  const shapes = simulate(OPS, Math.min(frame, 469), GROUND);
  const op = active(frame);
  const flash = frame >= 412 && frame < 432 ? 1 - (frame - 412) / 20 : 0;
  const crystal = frame >= 296 ? 0.5 + 0.5 * Math.sin(frame * 0.3) : 0;
  // the sheet: laid on, soaks, lifted and turned over
  const lay = r(470, 486);
  const soak = r(484, 500);
  const flip = r(500, 540);
  const lift = Math.sin(flip * Math.PI);
  const ghost = frame >= 520;
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 14, cap.to - 10, cap.to], [0, 1, 1, 0], clamp);
  const W = BOX[2] - BOX[0], H = BOX[3] - BOX[1];
  const printSvg = (opacity = 1) => (
    <svg width={W} height={H} viewBox={`${BOX[0]} ${BOX[1]} ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity }}>
      <MarbleDefs />
      <defs><clipPath id="mb-p"><rect x={BOX[0]} y={BOX[1]} width={W} height={H} /></clipPath></defs>
      <Surface shapes={shapes} ground={GROUND} clip="mb-p" />
    </svg>
  );
  return (
    <AbsoluteFill style={{ background: "#16120f" }}>
      <Bed id="rain_light" from={0} to={demo.frames} volume={0.06} />
      <Bed id="wind" from={180} to={470} volume={0.07} />
      {[6, 18, 30, 42, 54].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.1} />)}
      {[116, 156, 228, 392, 430].map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.16} />)}
      <Hit id="thunder_rumble" at={412} volume={0.24} />
      <Hit id="thunder_close" at={452} volume={0.32} />
      <Sfx src={SFX.swell} at={500} volume={0.2} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <MarbleDefs />
        <defs><clipPath id="mb-tray"><rect x={BOX[0]} y={BOX[1]} width={W} height={H} /></clipPath></defs>
        <rect width={1080} height={1920} fill="#16120f" />
        <rect width={1080} height={1920} filter="url(#mb-wood)" opacity={0.5} />
        <Tray box={BOX}>
          <g opacity={ghost ? 0.22 : 1}>
            <Surface shapes={shapes} ground={GROUND} clip="mb-tray" />
          </g>
          {ghost && <rect x={BOX[0]} y={BOX[1]} width={W} height={H} fill={GROUND} opacity={0.72} />}
          {crystal > 0 && frame < 470 && <circle cx={452} cy={560} r={60 + crystal * 20} fill="#fffbe8" opacity={0.12 + crystal * 0.1} style={{ filter: "blur(18px)" }} />}
          {flash > 0 && <path d={`M${BOLT.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke="#fffbe6" strokeWidth={22} strokeLinejoin="round" opacity={flash} style={{ filter: "blur(10px)" }} />}
          {flash > 0 && <rect x={BOX[0]} y={BOX[1]} width={W} height={H} fill="#fffdf2" opacity={flash * 0.7} />}
        </Tray>
        {/* the tools */}
        {op?.kind === "stroke" && frame < 470 && (() => {
          const [x, y] = head(op.path, 1 - Math.pow(1 - Math.min(1, (frame - op.at) / op.dur), 3));
          return <Stylus x={x} y={y} show={frame - op.at > op.dur ? 1 - (frame - op.at - op.dur) / 4 : 1} />;
        })()}
        {op?.kind === "tine" && (() => {
          const k = Math.min(1, (frame - op.at) / op.dur);
          const vertical = op.dir[0] === 0;
          const off = vertical ? interpolate(k, [0, 1], [BOX[1] + 40, BOX[3] - 40]) : interpolate(k, [0, 1], [BOX[0] + 40, BOX[2] - 40]);
          return <Comb vertical={vertical} offset={off} teeth={vertical ? VT : HT} from={vertical ? BOX[0] : BOX[1]} to={vertical ? BOX[2] : BOX[3]} show={1} key="comb" />;
        })()}
        {op?.kind === "drop" && frame < 470 && frame - op.at < 6 && <circle cx={op.c[0]} cy={op.c[1]} r={op.r * 0.4 + (frame - op.at) * 10} fill="none" stroke="#fff" strokeOpacity={0.35 * (1 - (frame - op.at) / 6)} strokeWidth={3} />}
      </svg>
      {/* the sheet of paper, laid face-down, lifted and turned over */}
      {lay > 0 && (
        <div style={{ position: "absolute", left: BOX[0], top: BOX[1], width: W, height: H, perspective: 2600, opacity: lay }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateY(${(1 - lay) * -50}px) translateZ(${lift * 160}px) rotateY(${flip * 180}deg) rotateZ(${flip * -2}deg)` }}>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#f4ecda", boxShadow: `0 ${20 + lift * 60}px ${40 + lift * 80}px rgba(0,0,0,${0.4 + lift * 0.2})` }}>
              <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: soak * 0.32 }}>{printSvg()}</div>
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#f4ecda", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "absolute", inset: 14 }}>
                <svg width={W - 28} height={H - 28} viewBox={`${BOX[0]} ${BOX[1]} ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                  <MarbleDefs />
                  <defs><clipPath id="mb-p2"><rect x={BOX[0]} y={BOX[1]} width={W} height={H} /></clipPath></defs>
                  <g style={{ mixBlendMode: "multiply" }}><Surface shapes={shapes} ground="#f4ecda" clip="mb-p2" veins={false} /></g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* label on the table: kicker and title */}
      <div style={{ position: "absolute", top: 40, left: 140, right: 140, height: 172, background: "#d9b77e", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", transform: "rotate(-0.6deg)", textAlign: "center", fontFamily: font, color: "#2a1a12" }}>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 12, color: "#8a2a22" }}>N30 · กระดาษหินอ่อน</div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>เมขลา ล่อแก้ว</div>
      </div>
      {/* caption slip */}
      <div style={{ position: "absolute", top: 1680, left: 60, right: 60, height: 206, background: "#d9b77e", boxShadow: "0 10px 24px rgba(0,0,0,0.45)", transform: "rotate(0.5deg)", textAlign: "center", fontFamily: font, color: "#2a1a12" }}>
        <div style={{ opacity: capK }}>
          <div style={{ fontSize: 52, fontWeight: 700, marginTop: 30, lineHeight: 1.15 }}>{cap.a}</div>
          <div style={{ fontSize: 44, fontWeight: 400, color: "#22306b", lineHeight: 1.2 }}>{cap.b}</div>
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, fontSize: 24, color: "#6a5a4a" }}>ภาพประกอบ · นิทานพื้นบ้าน เล่าใหม่</div>
      </div>
    </AbsoluteFill>
  );
};
