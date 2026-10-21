import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Boat, Camp, Firewood, Flame, RicePlant, RiceSack, Shovel, Soldier } from "./Icons";
import { Panel } from "./Hud";
import { C, clamp, useUnit } from "./theme";

// Cross-section diagrams ("ภาพตัดขวาง"), drawn in an 800 × 440 box inside a centre panel.
// Each animates from `start`; `rise` = frames for the main change (water rising / wall falling).
const VB = { w: 800, h: 440 };
const O = C.ink;

const Sky = () => <rect x={0} y={0} width={VB.w} height={VB.h} fill="#dbeef2" />;
const Grass = ({ d }: { d: string }) => <path d={d} fill="#c9a874" stroke={O} strokeWidth={4} strokeLinejoin="round" />;

const Water = ({ level, frame }: { level: number; frame: number }) => {
  const y = level;
  const wave = Array.from({ length: 21 }, (_, i) => `${i * 40},${y + Math.sin(i * 1.3 + frame * 0.12) * 4}`).join(" L");
  return (
    <g>
      <path d={`M0,${VB.h} L${wave} L${VB.w},${VB.h} Z`} fill={C.water} opacity={0.82} />
      <path d={`M${wave}`} fill="none" stroke="#2c6680" strokeWidth={4} />
    </g>
  );
};

const Title = ({ n, text }: { n: number; text: string }) => {
  const { s } = useUnit();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginBottom: 12 * s }}>
      <div style={{ width: 52 * s, height: 52 * s, borderRadius: "50%", background: C.burma, color: "#fff", fontSize: 34 * s, fontWeight: 700, lineHeight: `${52 * s}px`, textAlign: "center" }}>{n}</div>
      <div style={{ fontSize: 40 * s, fontWeight: 700, lineHeight: 1.35 }}>{text}</div>
    </div>
  );
};

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ width: "100%", display: "block", borderRadius: 8, border: `3px solid ${O}` }}>{children}</svg>
);

const ease = Easing.inOut(Easing.cubic);

// ① Dry season camp on the flat plain → the flood comes, camp under water.
export const FloodDiagram = ({ start, end, rise = 60, y }: { start: number; end?: number; rise?: number; y?: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [start + 25, start + 25 + rise], [0, 1], { ...clamp, easing: ease });
  const level = 360 - k * 150;
  return (
    <Panel start={start} end={end} y={y}>
      <Title n={1} text={k < 0.5 ? "หน้าแล้ง: ตั้งค่ายบนทุ่ง" : "หน้าน้ำ: ค่ายจมน้ำ"} />
      <Svg>
        <Sky />
        <Grass d={`M0 360 L800 360 L800 440 L0 440 Z`} />
        <Camp x={330} y={358} size={150} />
        {[180, 470, 560].map((x, i) => <Soldier key={x} x={x} y={358 + Math.min(k * 20, 6)} size={110} hat="helmet" phase={i} />)}
        <RiceSack x={640} y={358 - k * 150} size={70} />
        <Water level={level} frame={frame} />
        {k > 0.05 && <text x={40} y={level - 14} fontSize={30} fontWeight={700} fill="#2c6680">ระดับน้ำ</text>}
      </Svg>
    </Panel>
  );
};

// ② Burmese answer: camps on mounds above the flood, boats between them, rice growing.
export const HighGroundDiagram = ({ start, end, rise = 60, y }: { start: number; end?: number; rise?: number; y?: number }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [start + 20, start + 20 + rise], [0, 1], { ...clamp, easing: ease });
  const level = 380 - k * 120;
  const boatX = interpolate(frame, [start + 20 + rise, start + 20 + rise + 150], [80, 700], clamp);
  return (
    <Panel start={start} end={end} y={y}>
      <Title n={2} text="พม่าแก้เกม: ค่ายบนที่ดอน" />
      <Svg>
        <Sky />
        <Grass d="M0 380 L120 380 Q200 380 230 230 L420 222 Q470 380 560 380 L800 380 L800 440 L0 440 Z" />
        <Camp x={330} y={228} size={130} />
        <Soldier x={250} y={232} size={90} hat="helmet" hold="sickle" phase={1} />
        <Soldier x={410} y={228} size={90} hat="helmet" phase={2} />
        <RicePlant x={290} y={230} size={60} />
        <RicePlant x={380} y={226} size={60} phase={3} />
        <Water level={level} frame={frame} />
        {k > 0.6 && <Boat x={boatX} y={level + 12} size={80} color={C.burma} />}
        <path d="M600 140 l60 0" stroke={O} strokeWidth={0} />
        {k > 0.5 && <text x={600} y={level - 18} fontSize={30} fontWeight={700} fill="#2c6680">น้ำท่วมไม่ถึง</text>}
      </Svg>
    </Panel>
  );
};

// ③ Tunnel under the wall: dig → stack firewood → fire → foundation sinks → wall collapses.
export const TunnelDiagram = ({ start, end, y }: { start: number; end?: number; y?: number }) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const dig = interpolate(f, [20, 80], [0, 1], { ...clamp, easing: ease });
  const wood = f > 85;
  const fire = interpolate(f, [100, 140], [0, 1], clamp);
  const fall = interpolate(f, [150, 185], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const tunnel = `M60 420 Q120 400 200 395 L${200 + dig * 260} 395`;
  return (
    <Panel start={start} end={end} y={y}>
      <Title n={3} text={fall > 0 ? "กำแพงทรุด!" : fire > 0 ? "สุมไฟใต้ฐานกำแพง" : "ขุดอุโมงค์ลอดใต้กำแพง"} />
      <Svg>
        <Sky />
        <Grass d="M0 330 L800 330 L800 440 L0 440 Z" />
        <path d={tunnel} fill="none" stroke="#5a4130" strokeWidth={34} strokeLinecap="round" />
        <path d={tunnel} fill="none" stroke="#2a1d14" strokeWidth={4} strokeDasharray="12 10" />
        <Shovel x={200 + dig * 260} y={405} size={60} />
        {wood && <Firewood x={430} y={410} size={50} />}
        {fire > 0 && <g opacity={fire}><Flame x={420} y={410} size={44 * fire + 10} t={frame} /><Flame x={455} y={410} size={36 * fire + 10} t={frame + 6} /></g>}
        <g transform={`translate(${fall * 30},${fall * 70}) rotate(${fall * 24},440,330)`}>
          <rect x={390} y={150} width={110} height={180} fill="#c26a43" stroke={O} strokeWidth={4} />
          {[180, 210, 240, 270, 300].map((yy, i) => <line key={yy} x1={390} y1={yy} x2={500} y2={yy} stroke={O} strokeWidth={2} opacity={0.5} />)}
          {[0, 1, 2, 3].map((i) => <rect key={i} x={392 + i * 28} y={128} width={20} height={24} fill="#c26a43" stroke={O} strokeWidth={3} />)}
          {fire > 0.6 && <path d="M440 330 L452 290 L436 260 L450 220" fill="none" stroke={O} strokeWidth={4} />}
        </g>
        <Soldier x={110} y={330} size={100} hat="helmet" hold="hoe" phase={1} />
        <Soldier x={650} y={330} size={100} hat="cap" color={C.ayut} hold="spear" flip phase={2} />
        <text x={600} y={300} fontSize={28} fontWeight={700} fill={C.ayut}>ในเมือง</text>
        <text x={40} y={300} fontSize={28} fontWeight={700} fill={C.burma}>ค่ายพม่า</text>
      </Svg>
    </Panel>
  );
};
