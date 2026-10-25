import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Backdrop, Boat, C, Candle, clamp, Fighter, Fire, font, GOLD, Grass, Hall, House, King, Manuscript, Monk, Noble, PAL, PalaceWall, Parasol, Prang, Puppet, RED, River, ShadowStage, Smoke, Tree, useStage, V2 } from "./kit/Palace";

// N10 palace and capital: seven illustrated v2 scenes of an old Thai riverside capital, one every ~2.7 s, each
// overlapping the next by 14 frames — moonlit prang, throne hall, monks at dawn, a royal barge, a scribe's
// manuscript, a night attack on the palace gate, and the same story retold as nang yai. 19 s.
export const demo: StyleDemo = { id: "N10", name: "ฉากวังและพระนคร", frames: 570, cover: 296, sizes: ["9x16", "16x9"] };

const LEN = 80;
const at = (i: number) => i * LEN;
const end = (i: number) => Math.min(demo.frames, (i + 1) * LEN + 14);
const CAPTIONS = [
  "วัดริมแม่น้ำ ยามค่ำคืน",
  "ท้องพระโรง ขุนนางหมอบเฝ้า",
  "รุ่งเช้า พระออกบิณฑบาต",
  "ขบวนเรือหลวงเลียบพระนคร",
  "อาลักษณ์จดลงสมุดข่อย",
  "คืนจลาจล ประตูวังถูกตี",
  "เรื่องเดียวกัน เล่าด้วยหนังใหญ่",
];
const STORM = [at(5) + 18, at(5) + 38, at(5) + 58];
const DIGS = [at(6) + 10, at(6) + 34, at(6) + 58];

const Scenes = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* 0 moonlit prang across the river, a small boat slips by */}
      <V2 id="moon" start={at(0)} end={end(0)} sky={["#0a1430", "#2a3a6a"]} warm={0.03}>
        {(g, pan, lt) => (
          <g>
            <Backdrop g={g} pan={pan} light={[0.2, 0.22]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2a4a" mid="#25304a" ground="#151a24" mist="#9aa8d0" ridges={false} />
            <Prang x={g.x + g.W * 0.55 + pan * 0.2} y={g.ground - 30 * g.s} h={300 * g.s} s={g.s} color="#c9c2b0" gold />
            <Prang x={g.x + g.W * 0.32 + pan * 0.2} y={g.ground - 30 * g.s} h={160 * g.s} s={g.s} color="#b7b09e" />
            <Prang x={g.x + g.W * 0.78 + pan * 0.2} y={g.ground - 30 * g.s} h={160 * g.s} s={g.s} color="#b7b09e" />
            <River g={g} y={g.ground - 24 * g.s} pan={pan} color="#101c34" night />
            <Boat x={g.x + g.W * (0.12 + lt * 0.004) + pan * 0.7} y={g.ground + 10 * g.s} w={150 * g.s} s={g.s} n={2} costume={C.villager} />
            <Grass g={g} shift={pan * 1.6} color="#0e1410" />
          </g>
        )}
      </V2>
      {/* 1 throne hall: the king on a raised throne, nobles prostrate in lamplight */}
      <V2 id="throne" start={at(1)} end={end(1)} sky={["#3a1a10", "#8a4a22"]} warm={0.12}>
        {(g, pan) => (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a2a18" />
            {[0.12, 0.32, 0.68, 0.88].map((f) => <rect key={f} x={g.x + g.W * f - 14 * g.s + pan * 0.2} y={g.y} width={28 * g.s} height={g.H} fill="#7a3a1a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#3a2414" />
            <Parasol x={g.x + g.W * 0.66 + pan * 0.5} y={g.ground - 14 * g.s} s={g.s * 1.3} h={230} />
            <King x={g.x + g.W * 0.8 + pan * 0.5} y={g.ground - 14 * g.s} scale={g.sc * 0.8} light={0.6} />
            {[0, 1, 2, 3].map((i) => <Noble key={i} x={g.x + g.W * (0.1 + i * 0.13) + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.75} mode="prostrate" phase={i} jacket={i % 2 ? "#efe6d0" : "#c9b48a"} />)}
            <Candle x={g.x + g.W * 0.6 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s * 1.3} />
            <Candle x={g.x + g.W * 0.95 + pan * 0.7} y={g.ground - 14 * g.s} s={g.s * 1.3} />
          </g>
        )}
      </V2>
      {/* 2 dawn: monks walk past the ordination hall, villagers kneel with offerings */}
      <V2 id="alms" start={at(2)} end={end(2)} sky={["#e8a87a", "#f8e0b8"]} warm={0.1}>
        {(g, pan, lt) => (
          <g>
            <Backdrop g={g} pan={pan} light={[0.82, 0.3]} lightColor={["#ffd38a", "#fff0c8"]} far="#b08a7a" mid="#8a7a5a" />
            <Prang x={g.x + g.W * 0.2 + pan * 0.3} y={g.ground - 60 * g.s} h={240 * g.s} s={g.s} gold />
            <Hall x={g.x + g.W * 0.36 + pan * 0.5} y={g.ground - 40 * g.s} w={360 * g.s} s={g.s} />
            <PalaceWall x={g.x - 20 * g.s + pan * 0.5} y={g.ground - 30 * g.s} w={g.W * 0.3} h={40 * g.s} s={g.s} />
            <Tree x={g.x + g.W * 0.92 + pan * 0.6} y={g.ground - 20 * g.s} s={g.s * 1.3} kind="palm" />
            {[0, 1, 2, 3].map((i) => <Monk key={i} x={g.x + g.W * (0.08 + i * 0.12) + lt * 1.1 * g.s + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.7} mode="walk" phase={i * 1.3} />)}
            {[0, 1].map((i) => <Noble key={i} x={g.x + g.W * (0.74 + i * 0.12) + pan * 0.7} y={g.ground + 4 * g.s} scale={g.sc * 0.7} mode="kneel" flip bow={0.5 + 0.5 * Math.sin(lt * 0.06 + i)} jacket={i ? "#8a7a5a" : "#c9b48a"} phase={i} />)}
            <Grass g={g} shift={pan * 1.6} color="#4a5a34" />
          </g>
        )}
      </V2>
      {/* 3 royal barge with a tiered parasol, rowing boats ahead, palace roofs on the far bank */}
      <V2 id="barge" start={at(3)} end={end(3)} sky={["#8ab0c8", "#f4e2b8"]} warm={0.08}>
        {(g, pan, lt) => (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.22]} lightColor={["#fff0c0", "#fffbe8"]} far="#8a9ab0" mid="#6a8a7a" ground="#2f5f7f" mist="#f0e0c0" ridges={false} />
            <PalaceWall x={g.x + pan * 0.2} y={g.ground - 130 * g.s} w={g.W} h={36 * g.s} s={g.s * 0.8} />
            <Hall x={g.x + g.W * 0.06 + pan * 0.2} y={g.ground - 160 * g.s} w={220 * g.s} s={g.s * 0.7} />
            <Prang x={g.x + g.W * 0.5 + pan * 0.2} y={g.ground - 150 * g.s} h={170 * g.s} s={g.s * 0.8} gold />
            <Hall x={g.x + g.W * 0.7 + pan * 0.2} y={g.ground - 160 * g.s} w={220 * g.s} s={g.s * 0.7} />
            <River g={g} y={g.ground - 130 * g.s} pan={pan} color="#2f5f7f" />
            <Boat x={g.x + g.W * 0.78 + lt * 0.9 * g.s + pan * 0.5} y={g.ground - 60 * g.s} w={180 * g.s} s={g.s * 0.8} n={4} costume={C.guard} />
            <g>
              <Boat x={g.x + g.W * 0.36 + lt * 0.9 * g.s + pan * 0.7} y={g.ground + 10 * g.s} w={420 * g.s} s={g.s * 1.1} n={6} canopy gilt costume={C.guard} />
              <Parasol x={g.x + g.W * 0.36 - 120 * g.s + lt * 0.9 * g.s + pan * 0.7} y={g.ground - 10 * g.s} s={g.s} h={150} />
              <Parasol x={g.x + g.W * 0.36 + 190 * g.s + lt * 0.9 * g.s + pan * 0.7} y={g.ground - 10 * g.s} s={g.s} h={150} />
            </g>
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${g.x + i * 120 * g.s + pan * 1.6} ${g.y + g.H - 6 * g.s} q${30 * g.s} ${-26 * g.s} ${60 * g.s} 0 q${30 * g.s} ${-26 * g.s} ${60 * g.s} 0`} fill="#1f4a66" stroke="#cfe6f0" strokeWidth={2 * g.s} />)}
          </g>
        )}
      </V2>
      {/* 4 a scribe's table: a samut khoi under one candle */}
      <V2 id="scribe" start={at(4)} end={end(4)} sky={["#1a120c", "#3a2414"]} warm={0.1}>
        {(g, pan, lt) => (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
            {/* back wall: two shelves of stacked folding books */}
            {[0.3, 0.52].map((f, r) => (
              <g key={f}>
                <rect x={g.x + pan * 0.2} y={g.y + g.H * f} width={g.W} height={10 * g.s} fill="#4a2f18" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {Array.from({ length: 9 }, (_, i) => (
                  <g key={i}>
                    {Array.from({ length: 2 + ((i + r) % 3) }, (_, j) => <rect key={j} x={g.x + (30 + i * 100) * g.s + pan * 0.2} y={g.y + g.H * f - (j + 1) * 14 * g.s} width={80 * g.s} height={12 * g.s} fill={(i + j) % 2 ? "#2a2420" : "#e8dcc0"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                  </g>
                ))}
              </g>
            ))}
            <Noble x={g.x + g.W * 0.78 + pan * 0.4} y={g.ground - 20 * g.s} scale={g.sc * 1.1} mode="kneel" flip bow={0.3 + 0.08 * Math.sin(lt * 0.1)} jacket="#efe6d0" />
            <rect x={g.x - 50 * g.s} y={g.ground - 60 * g.s} width={g.W + 100 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <Manuscript x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 64 * g.s} w={400 * g.s} s={g.s} lines={6} fade={interpolate(lt, [6, 50], [0.2, 1], clamp)} />
            <Candle x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 60 * g.s} s={g.s * 1.8} />
          </g>
        )}
      </V2>
      {/* 5 night attack: rebels rush the palace gate, guards on the wall, houses burn (shake on each blow) */}
      <V2 id="storm" start={at(5)} end={end(5)} sky={["#120b1e", "#5a2a1a"]} accent={RED} hits={STORM}>
        {(g, pan, lt) => {
          const rush = interpolate(lt, [0, LEN], [0, 90], clamp) * g.s;
          return (
            <g>
              <Backdrop g={g} pan={pan} light={[0.2, 0.3]} lightColor={["#ff8a2a", "#ffd25a"]} far="#2a1f2a" mid="#2a2420" ground="#2a2018" mist="#ff9a5a" />
              <House x={g.x + g.W * 0.02 + pan * 0.5} y={g.ground - 40 * g.s} w={120 * g.s} s={g.s} burn={interpolate(lt, [0, 40], [0.3, 1], clamp)} />
              <Smoke x={g.x + g.W * 0.08 + pan * 0.5} y={g.ground - 160 * g.s} s={g.s} dark />
              <PalaceWall x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} w={g.W * 0.52} h={150 * g.s} s={g.s} gateAt={0.3} gateOpen={interpolate(frame, [STORM[2], STORM[2] + 10], [0, 0.6], clamp)} />
              <Fire x={g.x + g.W * 0.9 + pan * 0.5} y={g.ground - 160 * g.s} h={60 * g.s} seed={2} />
              <Fighter x={g.x + g.W * 0.72 + pan * 0.5} y={g.ground - 160 * g.s} scale={g.sc * 0.6} flip mode="attack" costume={C.guard} phase={1} />
              <Fighter x={g.x + g.W * 0.84 + pan * 0.5} y={g.ground - 160 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C.guard} phase={2} />
              {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.04 + i * 0.08) + rush + pan * 0.7} y={g.ground + 2 * g.s} scale={g.sc * 0.85} mode={i % 2 ? "run" : "attack"} costume={C.rebel} phase={i * 1.1} />)}
              {STORM.map((h) => (frame >= h && frame < h + 6 ? <circle key={h} cx={g.x + g.W * 0.62} cy={g.ground - 70 * g.s} r={34 * g.s} fill="#fff2b0" opacity={0.8} /> : null))}
              <Grass g={g} shift={pan * 1.6} color="#1a1f14" />
            </g>
          );
        }}
      </V2>
      {/* 6 nang yai: the same story as shadow puppets on a lit cloth */}
      <ShadowStage id="shadow" start={at(6)} end={end(6)}>
        {(g, lt) => {
          const base = g.ground + 10 * g.s;
          const blow = (d: number) => 1 - Math.max(0, ...DIGS.map((f) => (frame >= f + d && frame < f + d + 22 ? 1 - (frame - f - d) / 22 : 0)));
          return (
            <g fill="#100a06">
              <g transform={`translate(${g.x + g.W * 0.6 - lt * 0.15 * g.s},${base})`}>
                <path d={`M${-90 * g.s} 0 L${-80 * g.s} ${-60 * g.s} L${-60 * g.s} ${-70 * g.s} L${-56 * g.s} ${-150 * g.s} L${-40 * g.s} ${-210 * g.s} L${-20 * g.s} ${-240 * g.s} L${0} ${-300 * g.s} L${20 * g.s} ${-240 * g.s} L${40 * g.s} ${-210 * g.s} L${56 * g.s} ${-150 * g.s} L${60 * g.s} ${-70 * g.s} L${84 * g.s} ${-58 * g.s} L${96 * g.s} 0 Z`} />
                {[[-30, -120], [10, -160], [-10, -80], [30, -100], [0, -220]].map(([hx, hy], i) => <circle key={i} cx={hx * g.s} cy={hy * g.s} r={5 * g.s} fill="#f6d9a0" opacity={0.7} />)}
              </g>
              <Puppet x={g.x + g.W * 0.14} y={base} s={g.s * 1.3} kind="thai" arm={blow(0)} />
              <Puppet x={g.x + g.W * 0.34} y={base} s={g.s * 1.2} kind="plain" arm={blow(11)} />
              <Puppet x={g.x + g.W * 0.86} y={base} s={g.s * 1.3} kind="thai" arm={1 - blow(5)} flip />
            </g>
          );
        }}
      </ShadowStage>
    </>
  );
};

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Bed id="wind" from={0} to={at(1) + 14} volume={0.12} fade={20} />
    <Hit id="gong" at={at(1) + 6} volume={0.35} />
    <Bed id="city_crowd" from={at(2)} to={at(4) + 14} volume={0.1} fade={20} />
    <Hit id="war_drums" at={at(3) + 4} volume={0.25} />
    <Bed id="fire_crackle" from={at(5) - 4} to={at(6) + 14} volume={0.2} fade={14} />
    <Bed id="crowd_angry" from={at(5)} to={at(6) + 6} volume={0.14} fade={14} />
    {STORM.map((h) => <Hit key={h} id="wood_hit" at={h} volume={0.4} />)}
    {DIGS.map((h) => <Sfx key={h} src={SFX.hit} at={h} volume={0.2} />)}
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = useStage();
  const { s, width, height, vertical } = st;
  const i = Math.min(CAPTIONS.length - 1, Math.floor((frame + 6) / LEN));
  const cap = spring({ frame: frame - at(i) - 4, fps, config: { damping: 16 } });
  const title = interpolate(frame, [6, 24], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #2a1a10 0%, #120c08 60%, #070504 100%)" }}>
      <Audio />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <Scenes />
      </svg>
      <div style={{ position: "absolute", top: vertical ? 90 * s : 50 * s, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: title }}>
        <div style={{ fontSize: 40 * s, fontWeight: 700, color: GOLD, opacity: 0.85 }}>N10 · ฉากวังและพระนคร</div>
        <div style={{ fontSize: (vertical ? 76 : 64) * s, fontWeight: 900, lineHeight: 1.25, marginTop: 6 * s, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>ราชธานีริมแม่น้ำ</div>
        {vertical && <div style={{ display: "inline-block", marginTop: 14 * s, background: GOLD, color: "#1a1200", borderRadius: 12 * s, padding: `${2 * s}px ${20 * s}px`, fontSize: 32 * s, fontWeight: 900 }}>พ.ศ. 2310–2325</div>}
      </div>
      <div style={{ position: "absolute", top: st.y + st.H + (vertical ? 50 : 26) * s, left: 60 * s, right: 60 * s, textAlign: "center", fontFamily: font, color: "#fff", fontSize: (vertical ? 50 : 44) * s, fontWeight: 700, lineHeight: 1.35, opacity: cap, transform: `translateY(${(1 - cap) * 16 * s}px)`, textShadow: "0 4px 16px rgba(0,0,0,0.9)" }}>
        {CAPTIONS[i]}
      </div>
    </AbsoluteFill>
  );
};
