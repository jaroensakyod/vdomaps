import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { SFX } from "../../../components/Sound";
import { at, B, BLUE, CityRing, clamp, FloodLayer, font, GOLD, P, Panel, RED, Skyline, V, view, wf, type Chapter } from "./kit";
import { BurmeseSoldier, CityWall, Fire } from "./Period";
import { DryField, Galleon, Junk, Rain, Sampan, SiamSoldier, Stall, Townsperson, WallCannon, WarElephant, WaterBand } from "./Period2";

// Chapter 1 "อาวุธลับของอยุธยา" (beats go → worked): the island, trade, the flood season, the "รอน้ำ" formula.
const T = {
  go: B.go.start,
  island: B.island.start,
  isle: wf("island", "เกาะ", 0.45),
  three: wf("island", "ตรง", 0.5),
  cp: wf("island", "เจ้าพระยา", 0.76),
  lb: wf("island", "ลพบุรี", 0.86),
  ps: wf("island", "ป่า", 0.95),
  trade: B.trade.start,
  ships: wf("trade", "เรือ", 0.25),
  cn: wf("trade", "จีน", 0.4),
  jp: wf("trade", "ญี่ปุ่น", 0.45),
  in: wf("trade", "อินเดีย", 0.5),
  pe: wf("trade", "เปอร์เซีย", 0.6),
  eu: wf("trade", "ฝรั่ง", 0.75),
  arrive: wf("trade", "แล่น", 0.82),
  weapon: B.weapon.start,
  water: Math.min(wf("weapon", "น้ำ", 0.9), B.weapon.end - 12),
  season: B.season.start,
  dry: wf("season", "แล้ง", 0.25),
  wet: wf("season", "ฝน", 0.62),
  sea: wf("season", "ทะเล", 0.93),
  d1: B.diagram1.start,
  d1Water: wf("diagram1", "น้ำ", 0.47),
  d1Sink: wf("diagram1", "จม", 0.57),
  d1Rot: wf("diagram1", "เสบียง", 0.63),
  d1Sick: wf("diagram1", "ทหาร", 0.72),
  d1Lose: wf("diagram1", "แพ้", 0.95),
  formula: B.formula.start,
  close: wf("formula", "ปิด", 0.3),
  defend: wf("formula", "ตั้ง", 0.38),
  rain: wf("formula", "ฝน", 0.72),
  name: wf("formula", "สูตร", 0.87, 1),
  worked: B.worked.start,
  enemy: wf("worked", "ข้าศึก", 0.38),
  retreat: wf("worked", "ถอย", 0.75),
};
const END = B.burma.start;

const SKY_DAY: [string, string] = ["#3a6ea5", "#bfe0f2"];

// 1 · the city on its island: golden skyline behind the wall, river in front with boats.
const CityScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c1city" anchor={P.ayut} start={start} end={end} sky={SKY_DAY} accent={BLUE}>
    {(g) => (
      <g>
        <Skyline g={g} color="#7a5a40" gold base={110} />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 24 * g.s} h={80 * g.s} s={g.s} />
        <WaterBand x={g.x} y={g.ground - 20 * g.s} W={g.W} H={g.H} s={g.s} />
        <Sampan x={g.x + g.W * 0.25} y={g.ground + 10 * g.s} scale={g.sc} people={2} cargo />
        <Sampan x={g.x + g.W * 0.7} y={g.ground + 22 * g.s} scale={g.sc * 0.9} flip phase={2} />
      </g>
    )}
  </Panel>
);

// 2 · the riverside market.
const MarketScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c1market" anchor={P.ayut} start={start} end={end} sky={["#f2c27a", "#fbe7c2"]} accent={GOLD}>
    {(g) => (
      <g>
        <Skyline g={g} color="#a07a52" gold base={120} />
        <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#b79a6e" />
        <Stall x={g.x + g.W * 0.2} y={g.ground - 6 * g.s} s={g.s} />
        <Stall x={g.x + g.W * 0.55} y={g.ground - 6 * g.s} s={g.s} awning="#2f6b8f" goods={["#c9302c", "#e8c75a", "#f4ecd8"]} />
        <Stall x={g.x + g.W * 0.88} y={g.ground - 6 * g.s} s={g.s} awning="#3f8f4a" />
        <Townsperson x={g.x + g.W * 0.36} y={g.ground + 8 * g.s} scale={g.sc} load phase={1} />
        <Townsperson x={g.x + g.W * 0.7} y={g.ground + 10 * g.s} scale={g.sc} woman cloth="#7a2f4a" flip phase={2} />
        <Townsperson x={g.x + g.W * 0.08} y={g.ground + 12 * g.s} scale={g.sc} cloth="#2f4f6b" shirt="#e9e1cf" walk={false} />
      </g>
    )}
  </Panel>
);

// 3 · foreign ships moored in front of the city.
const ShipsScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1ships" anchor={P.ayut} start={start} end={end} sky={SKY_DAY} accent={GOLD}>
      {(g) => {
        const sail = interpolate(frame, [start, start + 90], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return (
          <g>
            <Skyline g={g} color="#7a5a40" gold base={140} />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground - 50 * g.s} h={70 * g.s} s={g.s} />
            <WaterBand x={g.x} y={g.ground - 46 * g.s} W={g.W} H={g.H} s={g.s} />
            <Galleon x={g.x + g.W * (1.1 - sail * 0.42)} y={g.ground + 6 * g.s} scale={g.sc * 0.62} flip />
            <Junk x={g.x + g.W * (-0.1 + sail * 0.38)} y={g.ground + 20 * g.s} scale={g.sc * 0.7} />
            <Sampan x={g.x + g.W * 0.5} y={g.ground + 40 * g.s} scale={g.sc * 0.8} cargo people={2} />
          </g>
        );
      }}
    </Panel>
  );
};

// 4 · dry season: cracked fields, an army marching easily.
const DryScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1dry" anchor={P.ayut} start={start} end={end} sky={["#f2b35e", "#fbe3b0"]} accent={GOLD}>
      {(g) => {
        const m = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <circle cx={g.x + g.W * 0.82} cy={g.y + 90 * g.s} r={44 * g.s} fill="#ffd76a" />
            <DryField x={g.x} y={g.ground - 30 * g.s} W={g.W} H={g.H} s={g.s} />
            <WarElephant x={g.x + g.W * (0.2 + m * 0.25)} y={g.ground + 4 * g.s} scale={g.sc * 0.62} />
            {[0, 1, 2, 3].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.42 + i * 0.12 + m * 0.2)} y={g.ground + 8 * g.s} scale={g.sc * 0.85} phase={i} hold={i % 2 ? "sword" : "spear"} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// 5 · the monsoon: rain, water spreading over the fields up to the city wall.
const WetScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1wet" anchor={P.ayut} start={start} end={end} sky={["#4a5866", "#9aa8b4"]} accent={BLUE}>
      {(g) => {
        const lvl = interpolate(frame, [start + 10, T.sea + 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        return (
          <g>
            <Skyline g={g} color="#5d5a5a" base={120} />
            <CityWall x0={g.x + g.W * 0.55} x1={g.x + g.W + 10 * g.s} ground={g.ground - 30 * g.s} h={80 * g.s} s={g.s} />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#6f8a4a" />
            <WaterBand x={g.x} y={g.ground - 26 * g.s - lvl * 40 * g.s} W={g.W} H={g.H} s={g.s} color="#5f8fa8" />
            <Sampan x={g.x + g.W * 0.3} y={g.ground - 14 * g.s - lvl * 40 * g.s} scale={g.sc * 0.8} phase={1} />
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// 6 · cross-section ①: a camp on the plain, then the water comes.
const FloodSection = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1section" anchor={P.ayut} start={start} end={end} sky={["#7d8c99", "#cfdde6"]} accent={RED}>
      {(g) => {
        const lvl = interpolate(frame, [T.d1Water, T.d1Sink + 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
        const ground = g.ground - 20 * g.s;
        const sick = frame >= T.d1Sick;
        return (
          <g>
            <text x={g.x + 24 * g.s} y={g.y + 90 * g.s} fill="#1b1d24" fontFamily={font} fontWeight={900} fontSize={30 * g.s}>ภาพตัดขวาง ①</text>
            <rect x={g.x} y={ground} width={g.W} height={g.H} fill="#8a6a42" />
            <rect x={g.x} y={ground} width={g.W} height={10 * g.s} fill="#6f8a4a" />
            {/* camp: tents + soldiers; soldiers crouch when sick */}
            {[0.3, 0.5].map((fx, i) => <path key={i} d={`M${g.x + g.W * fx - 40 * g.s} ${ground} L${g.x + g.W * fx} ${ground - 70 * g.s} L${g.x + g.W * fx + 40 * g.s} ${ground} Z`} fill={i ? "#e8dcc0" : "#b8362c"} stroke="#1b1d24" strokeWidth={1.5 * g.s} />)}
            {[0.18, 0.64, 0.78].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={ground + 4 * g.s} scale={g.sc * (sick ? 0.8 : 0.9)} pose="stand" hold="spear" phase={i} jacket={sick ? "#6b4a4a" : undefined} />)}
            {/* rice sacks float off and rot */}
            {[0.4, 0.88].map((fx, i) => {
              const y0 = ground - 18 * g.s - lvl * (60 + i * 10) * g.s;
              return <g key={i} transform={`translate(${g.x + g.W * fx},${y0}) rotate(${lvl * 25 * (i ? -1 : 1)})`}><path d={`M${-18 * g.s} 0 Q${-22 * g.s} ${-26 * g.s} ${-10 * g.s} ${-34 * g.s} L${10 * g.s} ${-34 * g.s} Q${22 * g.s} ${-26 * g.s} ${18 * g.s} 0 Z`} fill={frame >= T.d1Rot ? "#7d7a4a" : "#e3cf9e"} stroke="#1b1d24" strokeWidth={1.4 * g.s} /></g>;
            })}
            {lvl > 0 && <WaterBand x={g.x} y={ground - lvl * 110 * g.s} W={g.W} H={g.H} s={g.s} />}
            {lvl > 0.1 && <text x={g.x + g.W - 30 * g.s} y={ground - lvl * 110 * g.s - 12 * g.s} textAnchor="end" fill="#0d3b5a" fontFamily={font} fontWeight={900} fontSize={28 * g.s}>ระดับน้ำ</text>}
          </g>
        );
      }}
    </Panel>
  );
};

// 7 · the formula: gate shuts, defenders and cannons on the wall, rain clouds roll in.
const GateScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1gate" anchor={P.ayut} start={start} end={end} sky={frame >= T.rain ? ["#4a5866", "#9aa8b4"] : SKY_DAY} accent={BLUE}>
      {(g) => {
        const shut = interpolate(frame, [T.close, T.close + 15], [0, 1], { ...clamp, easing: Easing.out(Easing.bounce) });
        const wallTop = g.ground - 130 * g.s;
        const gx = g.x + g.W * 0.5;
        return (
          <g>
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#7a6a4a" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={130 * g.s} s={g.s} />
            {/* gate arch + two doors closing */}
            <path d={`M${gx - 50 * g.s} ${g.ground} L${gx - 50 * g.s} ${g.ground - 80 * g.s} Q${gx} ${g.ground - 120 * g.s} ${gx + 50 * g.s} ${g.ground - 80 * g.s} L${gx + 50 * g.s} ${g.ground} Z`} fill="#2a1d14" />
            <rect x={gx - 50 * g.s} y={g.ground - 90 * g.s} width={50 * g.s * shut} height={90 * g.s} fill="#8a4a24" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            <rect x={gx + 50 * g.s - 50 * g.s * shut} y={g.ground - 90 * g.s} width={50 * g.s * shut} height={90 * g.s} fill="#7a3f1e" stroke="#1b1d24" strokeWidth={1.4 * g.s} />
            {frame >= T.defend && [0.12, 0.3, 0.7, 0.88].map((fx, i) => <SiamSoldier key={i} x={g.x + g.W * fx} y={wallTop + 2 * g.s} scale={g.sc * 0.8} hold={i % 2 ? "gun" : "spear"} phase={i} />)}
            {frame >= T.defend && <WallCannon x={g.x + g.W * 0.2} y={wallTop + 4 * g.s} s={g.sc * 0.9} fire={((frame - T.defend) % 50) / 16} />}
            {frame >= T.defend && <WallCannon x={g.x + g.W * 0.8} y={wallTop + 4 * g.s} s={g.sc * 0.9} fire={((frame - T.defend + 25) % 50) / 16} />}
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} k={interpolate(frame, [T.rain, T.rain + 20], [0, 1], clamp)} />
          </g>
        );
      }}
    </Panel>
  );
};

// 8 · it worked: an enemy army wading back through the flood.
const RetreatScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1retreat" anchor={P.ayut} start={start} end={end} sky={["#4a5866", "#9aa8b4"]} accent={BLUE}>
      {(g) => {
        const back = interpolate(frame, [T.retreat, end], [0, 1], clamp);
        const water = g.ground - 40 * g.s;
        return (
          <g>
            <Skyline g={g} color="#5d5a5a" base={150} />
            <CityWall x0={g.x + g.W * 0.62} x1={g.x + g.W + 10 * g.s} ground={g.ground - 50 * g.s} h={70 * g.s} s={g.s} />
            {[0, 1, 2, 3].map((i) => <BurmeseSoldier key={i} x={g.x + g.W * (0.45 + i * 0.08 - back * 0.4)} y={g.ground + 4 * g.s} scale={g.sc * 0.9} phase={i} flip={frame >= T.retreat} hold="spear" />)}
            <WaterBand x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#5f8fa8" />
            <Rain x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </Panel>
  );
};

// "ของดีที่สุด… ไม่ใช่การค้า": river water close-up, a question mark rising out of it.
const SecretScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c1secret" anchor={P.ayut} start={start} end={end} sky={["#1d3557", "#5f97b5"]} accent={BLUE}>
      {(g) => {
        const k = interpolate(frame, [start + 15, start + 45], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
        return (
          <g>
            <WaterBand x={g.x} y={g.y + g.H * 0.45} W={g.W} H={g.H} s={g.s} color="#3d7fa8" />
            {Array.from({ length: 14 }, (_, i) => (
              <ellipse key={i} cx={g.x + ((i * 61) % 100) / 100 * g.W} cy={g.y + g.H * (0.55 + ((i * 23) % 40) / 100)} rx={(18 + (i % 4) * 8) * g.s} ry={3 * g.s} fill="#d6ecf5" opacity={0.35 + 0.3 * Math.sin(frame * 0.1 + i)} />
            ))}
            <text x={g.x + g.W / 2} y={g.y + g.H * 0.42 - (1 - k) * 40 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={150 * g.s * k} fill="#fff" opacity={k} style={{ filter: "drop-shadow(0 0 12px #4fc3ff)" }}>?</text>
          </g>
        );
      }}
    </Panel>
  );
};

// "ภาคกลางมีสองฤดู": the same plain split down the middle — dry on the left, flooded on the right.
const TwoSeasons = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c1two" anchor={P.ayut} start={start} end={end} sky={["#f2b35e", "#4a5866"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W / 2} height={g.H} fill="#f6c77a" />
        <rect x={g.x + g.W / 2} y={g.y} width={g.W / 2} height={g.H} fill="#7d8a96" />
        <circle cx={g.x + g.W * 0.22} cy={g.y + 95 * g.s} r={36 * g.s} fill="#ffd76a" />
        <DryField x={g.x} y={g.ground - 40 * g.s} W={g.W / 2} H={g.H} s={g.s} />
        <rect x={g.x + g.W / 2} y={g.ground - 40 * g.s} width={g.W / 2} height={g.H} fill="#6f8a4a" />
        <WaterBand x={g.x + g.W / 2} y={g.ground - 46 * g.s} W={g.W / 2} H={g.H} s={g.s} color="#5f8fa8" />
        <Rain x={g.x + g.W / 2} y={g.y} W={g.W / 2} H={g.H} s={g.s} n={40} />
        <line x1={g.x + g.W / 2} y1={g.y} x2={g.x + g.W / 2} y2={g.y + g.H} stroke="#fff" strokeWidth={4 * g.s} />
        <text x={g.x + g.W * 0.25} y={g.y + g.H - 26 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={38 * g.s} fill="#5a3a12">หน้าแล้ง</text>
        <text x={g.x + g.W * 0.75} y={g.y + g.H - 26 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={38 * g.s} fill="#fff">หน้าน้ำ</text>
      </g>
    )}
  </Panel>
);

// Trade routes over the sea view, one per word.
const Routes = () => {
  const r: [[number, number][], number, string][] = [
    [[[121, 25], [114, 18], [106, 11], [101.5, 12.4], P.mouth], T.cn, "จีน"],
    [[[124, 30], [121, 22], [110, 12], [102, 12.8], P.mouth], T.jp, "ญี่ปุ่น"],
    [[[80, 10], [92, 5], [98.5, 3], [104, 1.5], [104, 7], [101.2, 12.2], P.mouth], T.in, "อินเดีย"],
    [[[60, 20], [80, 6], [95, 4], [104, 1.3], [103.5, 9], P.mouth], T.pe, "เปอร์เซีย"],
    [[[70, -5], [95, -2], [105, 0], [104.5, 6], [102, 11], P.mouth], T.eu, "ฝรั่ง"],
  ];
  return (
    <>
      {r.map(([pts, f, name], i) => (
        <g key={name}>
          <Arrow points={pts} start={f} end={f + 30} color={GOLD} width={10} variant="dashed" />
          <PointLabel at={pts[1]} text={name} start={f + 4} color={GOLD} size={0.8} />
          {i === 0 && null}
        </g>
      ))}
    </>
  );
};

// Map shot "worked": enemy arrows reach the city, the flood rises, they turn back.
const WorkedMap = () => {
  const frame = useCurrentFrame();
  const fade = (a: number, b: number) => interpolate(frame, [a, b], [1, 0], clamp);
  return (
    <>
      <FloodLayer at={P.ayut} radius={0.5} k={interpolate(frame, [T.enemy + 20, T.retreat], [0, 1], clamp)} />
      {[[[99.5, 14.7], [100.3, 14.45]], [[99.7, 13.6], [100.4, 14.2]], [[100.9, 15.3], [100.62, 14.55]]].map((pts, i) => (
        <g key={i} opacity={fade(T.retreat, T.retreat + 10)}>
          <Arrow points={pts as [number, number][]} start={T.enemy + i * 6} end={T.enemy + 30 + i * 6} color={RED} width={20} />
        </g>
      ))}
      {[[[100.3, 14.45], [99.5, 14.7]], [[100.4, 14.2], [99.7, 13.6]], [[100.62, 14.55], [100.9, 15.3]]].map((pts, i) => (
        <Arrow key={`b${i}`} points={pts as [number, number][]} start={T.retreat + i * 5} end={T.retreat + 35 + i * 5} color={RED} width={14} variant="dashed" />
      ))}
    </>
  );
};

// "มันคือน้ำ": one big word over the map.
const WaterWord = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.water || frame > B.season.start + 6) return null;
  const k = interpolate(frame, [T.water, T.water + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const o = interpolate(frame, [B.season.start - 6, B.season.start + 6], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ transform: `scale(${k})`, fontFamily: font, fontWeight: 900, fontSize: 260 * s, color: "#8fd3ff", textShadow: `0 0 ${50 * s}px rgba(79,195,255,0.9), 0 ${8 * s}px ${30 * s}px rgba(0,0,0,0.8)`, lineHeight: 1 }}>น้ำ</div>
    </AbsoluteFill>
  );
};

// Dry-season grade (warm, washed out) on the map.
const SeasonGrade = () => {
  const frame = useCurrentFrame();
  const { width, height } = useMap();
  const dry = interpolate(frame, [T.dry, T.dry + 15, T.wet - 10, T.wet + 5], [0, 1, 1, 0], clamp);
  const wet = interpolate(frame, [T.wet, T.wet + 20, B.formula.start, B.formula.start + 15], [0, 1, 1, 0], clamp);
  return (
    <>
      {dry > 0 && <rect width={width} height={height} fill="#d99a3a" opacity={0.22 * dry} style={{ mixBlendMode: "multiply" }} />}
      {wet > 0 && <rect width={width} height={height} fill="#1d3550" opacity={0.3 * wet} />}
    </>
  );
};

export const ch1: Chapter = {
  name: "อาวุธลับของอยุธยา",
  from: B.go.start,
  to: END,
  cams: (w, h) => [
    { frame: T.go, cam: view(V.central, w, h, 1) },
    { frame: T.island, cam: view(V.island, w, h, 0.55) },
    { frame: T.three - 4, cam: view(V.island, w, h, 0.55) },
    { frame: T.three + 30, cam: view(V.island, w, h, 0.4, 0.1) },
    { frame: T.trade, cam: view(V.island, w, h, 0.4, 0.1) },
    { frame: T.trade + 30, cam: view(V.gulf, w, h, 1, 0.12) },
    { frame: T.cn - 10, cam: view(V.gulf, w, h, 1, 0.12) },
    { frame: T.cn + 25, cam: view(V.sea, w, h, 1, 0.05) },
    { frame: T.arrive - 4, cam: view(V.sea, w, h, 1, 0.05) },
    { frame: T.arrive + 30, cam: view(V.island, w, h, 0.6) },
    { frame: T.weapon, cam: view(V.island, w, h, 0.6) },
    { frame: T.weapon + 30, cam: view(V.plain, w, h, 1) },
    { frame: T.formula, cam: view(V.plain, w, h, 1) },
    { frame: T.formula + 30, cam: view(V.island, w, h, 0.9) },
    { frame: T.worked, cam: view(V.island, w, h, 0.9) },
    { frame: T.worked + 30, cam: view(V.central, w, h, 1) },
  ],
  years: [[T.go, "1893"], [T.trade, "1893 – 2300"], [T.season, "ทุกปี"]],
  heads: [
    { f: T.island, tag: "พ.ศ. 1893 · พระเจ้าอู่ทองสร้างเมือง", head: "เมืองบนเกาะ", color: BLUE },
    { f: T.three, tag: "แม่น้ำล้อมรอบ", head: "แม่น้ำสามสายมาบรรจบ", color: BLUE, chips: [{ text: "เจ้าพระยา", f: T.cp }, { text: "ลพบุรี", f: T.lb }, { text: "ป่าสัก", f: T.ps }] },
    { f: T.trade, tag: "เมืองท่าค้าขาย", head: "ทำเลทองของการค้า", color: GOLD },
    { f: T.ships, tag: "เรือสำเภามาจาก", head: "การค้าทั่วโลก", color: GOLD, chips: [{ text: "จีน", f: T.cn }, { text: "ญี่ปุ่น", f: T.jp }, { text: "อินเดีย", f: T.in }, { text: "เปอร์เซีย", f: T.pe }, { text: "ฝรั่ง", f: T.eu }] },
    { f: T.arrive, tag: "แล่นขึ้นแม่น้ำเจ้าพระยา", head: "ถึงหน้าเมืองได้เลย", color: GOLD },
    { f: T.weapon, tag: "ของดีที่สุดของทำเลนี้", head: "ไม่ใช่การค้า…", color: BLUE },
    { f: T.season, tag: "ภาคกลาง", head: "สองฤดูที่ชี้ขาด", color: BLUE, chips: [{ text: "หน้าแล้ง", f: T.dry }, { text: "หน้าน้ำ", f: T.wet }] },
    { f: T.wet, tag: "หน้าน้ำ", head: "ทุ่งรอบกรุงกลายเป็นทะเล", color: BLUE },
    { f: T.d1, tag: "ภาพตัดขวาง ①", head: "ค่ายข้าศึกเจอน้ำ", color: RED, chips: [{ text: "ค่ายจม", f: T.d1Sink }, { text: "เสบียงเน่า", f: T.d1Rot }, { text: "ทหารป่วย", f: T.d1Sick }, { text: "ไม่ต้องรบก็แพ้", f: T.d1Lose }] },
    { f: T.formula, tag: "กลยุทธ์ของอยุธยา", head: "ง่ายมาก", color: BLUE, chips: [{ text: "✓ ปิดประตูเมือง", f: T.close }, { text: "✓ ตั้งรับหลังกำแพง", f: T.defend }, { text: "✓ รอฝน", f: T.rain }] },
    { f: T.name, tag: "ผมขอเรียกว่า", head: "สูตรรอน้ำ", color: GOLD },
    { f: T.worked, tag: "ได้ผลมาหลายครั้ง", head: "ข้าศึกถอยก่อนน้ำมาถึงคอ", color: BLUE },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const hi = {
      แม่น้ำเจ้าพระยา: interpolate(frame, [T.cp, T.cp + 8, T.trade, T.trade + 10], [0, 1, 1, 0], clamp),
      แม่น้ำลพบุรี: interpolate(frame, [T.lb, T.lb + 8, T.trade, T.trade + 10], [0, 1, 1, 0], clamp),
      แม่น้ำป่าสัก: interpolate(frame, [T.ps, T.ps + 8, T.trade, T.trade + 10], [0, 1, 1, 0], clamp),
      คลองเมือง: interpolate(frame, [T.lb, T.lb + 8, T.trade, T.trade + 10], [0, 1, 1, 0], clamp),
    };
    return (
      <>
        <RiversHi hi={hi} />
        <SeasonGrade />
        <CityRing k={interpolate(frame, [T.isle, T.isle + 10, T.trade, T.trade + 10], [0, 1, 1, 0], clamp)} color={BLUE} />
        {frame >= T.three && frame < T.trade && (
          <>
            <PointLabel at={[100.545, 14.343]} text="เจ้าพระยา" start={T.cp} color={BLUE} size={0.7} />
            <PointLabel at={[100.566, 14.372]} text="ลพบุรี" start={T.lb} color={BLUE} size={0.7} />
            <PointLabel at={[100.586, 14.35]} text="ป่าสัก" start={T.ps} color={BLUE} size={0.7} />
          </>
        )}
        {frame >= T.ships && frame < T.arrive + 30 && <Routes />}
        <FloodLayer at={P.ayut} radius={0.3} k={interpolate(frame, [T.wet, T.sea + 10, B.diagram1.end, B.formula.start + 10], [0, 1, 1, 0], clamp)} />
        {frame >= T.worked && <WorkedMap />}
        {frame >= T.worked && <PointLabel at={P.ayut} text="อยุธยา" start={T.worked + 20} color={BLUE} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <CityScene start={T.island} end={T.three + 14} />
      <MarketScene start={T.trade + 10} end={T.ships + 14} />
      <ShipsScene start={T.arrive} end={T.weapon + 14} />
      <SecretScene start={T.weapon} end={T.water + 14} />
      <TwoSeasons start={T.season} end={T.dry + 20 + 14} />
      <DryScene start={T.dry + 20} end={T.wet + 14} />
      <WetScene start={T.wet} end={T.d1 + 14} />
      <FloodSection start={T.d1} end={T.formula + 14} />
      <GateScene start={T.formula} end={T.worked + 14} />
      <RetreatScene start={T.retreat - 20} end={END + 14} />
    </>
  ),
  Screen: () => <WaterWord />,
  sfx: [
    [T.go - 4, SFX.whoosh, 0.45],
    [T.island, SFX.whoosh, 0.3],
    [T.cp, SFX.pop, 0.3],
    [T.lb, SFX.pop, 0.3],
    [T.ps, SFX.pop, 0.3],
    [T.trade + 4, SFX.whoosh, 0.3],
    [T.cn, SFX.pop, 0.25],
    [T.jp, SFX.pop, 0.25],
    [T.in, SFX.pop, 0.25],
    [T.pe, SFX.pop, 0.25],
    [T.eu, SFX.pop, 0.25],
    [T.arrive - 4, SFX.whoosh, 0.3],
    [T.water, SFX.hit, 0.55],
    [T.dry, SFX.pop, 0.3],
    [T.wet, SFX.swell, 0.3],
    [T.d1Water, SFX.riser, 0.25],
    [T.d1Lose, SFX.hit, 0.45],
    [T.close, SFX.hit, 0.4],
    [T.name, SFX.pop, 0.45],
    [T.enemy, SFX.whoosh, 0.35],
    [T.retreat, SFX.whoosh, 0.35],
  ],
};

// Highlighted rivers only (the base rivers are drawn by the episode).
import { Rivers } from "./kit";
const RiversHi = ({ hi }: { hi: Record<string, number> }) => (Object.values(hi).some((v) => v > 0) ? <Rivers hi={hi} /> : null);
void at;
void Fire;
void SiamSoldier;
