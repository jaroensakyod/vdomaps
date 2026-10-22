import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { clamp, font, GOLD, Panel, RED, Rivers, view } from "../news/kit";
import { Banner, COSTUME, Depth, Fighter, Glow, Grass, impactAt, PAL, Ridge, Shot } from "../../../components/Scene";
import { CityDot, Stockades } from "./beatsKit";
import { PL, VW } from "./places";
import { SiegeScene } from "./scenes";

// Style test (not part of the episode): old panel → upgraded panel → nang yai shadow-puppet panel.
const SEG = 150;
export const ICONTEST_FRAMES = SEG * 3;

const GILT = PAL.gilt;

// The upgraded siege panel, built only from the shared house-style kit (components/Scene.tsx) — the reference example.
const CANNON_PERIOD = 46;
const SiegeV2 = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="v2" anchor={PL.plk} start={start} end={end} sky={["#2b1f3a", "#e8a25a"]} accent={GOLD}>
      {(g) => {
        const lt = frame - start;
        const hits = Array.from({ length: 6 }, (_, i) => start + i * CANNON_PERIOD + 18);
        const shot = lt % CANNON_PERIOD;
        const fired = Math.floor(lt / CANNON_PERIOD);
        const wallX = g.x + g.W * 0.7;
        const muzzle: [number, number] = [wallX + 10 * g.s, g.ground - 108 * g.s];
        const target: [number, number] = [g.x + g.W * (0.18 + (fired % 3) * 0.1), g.ground - 6 * g.s];
        const march = interpolate(lt, [0, end - start], [0, 70], clamp) * g.s;
        return (
          <Depth g={g} id="v2" start={start} end={end} impact={impactAt(frame, hits)}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.ground - 150 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 90 * g.s} amp={60 * g.s} seed={1} color="#7a6a8a" shift={pan * 0.2} />
                <Ridge g={g} base={g.ground - 40 * g.s} amp={40 * g.s} seed={4} color="#4f5a48" shift={pan * 0.5} />
                <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={50 * g.s} fill="#f3d9b0" opacity={0.25} />
                <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={g.H} fill={PAL.earth} />
                <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={6 * g.s} fill="#8a6c45" />
                {Array.from({ length: 11 }, (_, i) => (
                  <path key={i} d={`M${g.x + g.W * 0.04 + i * 16 * g.s + pan * 0.7} ${g.ground - 10 * g.s} l0 ${-62 * g.s} l${6 * g.s} ${-10 * g.s} l${6 * g.s} ${10 * g.s} l0 ${62 * g.s} Z`} fill="#8a5a32" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                ))}
                <Banner x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground - 70 * g.s} s={g.s} color={PAL.ochre} />
                <rect x={wallX} y={g.ground - 100 * g.s} width={g.W * 0.4} height={90 * g.s} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={2.2 * g.s} />
                {Array.from({ length: 9 }, (_, i) => (
                  <path key={i} d={`M${wallX + 4 * g.s + i * 30 * g.s} ${g.ground - 100 * g.s} l0 ${-12 * g.s} q${11 * g.s} ${-18 * g.s} ${22 * g.s} 0 l0 ${12 * g.s} Z`} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={1.8 * g.s} />
                ))}
                {Array.from({ length: 5 }, (_, i) => <rect key={i} x={wallX + (14 + i * 52) * g.s} y={g.ground - (60 - (i % 2) * 22) * g.s} width={26 * g.s} height={8 * g.s} fill="#c9a77a" opacity={0.6} />)}
                <Banner x={wallX + g.W * 0.26} y={g.ground - 112 * g.s} s={g.s} color={PAL.gilt} />
                <Fighter x={wallX + 70 * g.s} y={g.ground - 110 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={COSTUME.siam} phase={1} />
                <Fighter x={wallX + 150 * g.s} y={g.ground - 110 * g.s} scale={g.sc * 0.62} flip mode="attack" costume={COSTUME.siam} phase={2} />
                <rect x={muzzle[0] - 6 * g.s} y={muzzle[1] - 6 * g.s} width={44 * g.s} height={12 * g.s} rx={5 * g.s} fill="#2a2a2a" transform={`rotate(-12,${muzzle[0] + 16 * g.s},${muzzle[1]})`} />
                <Shot from={muzzle} to={target} t={shot} s={g.s} />
                {[0, 1, 2, 3].map((i) => (
                  <Fighter key={i} x={g.x + g.W * (0.22 + i * 0.09) + march} y={g.ground + 4 * g.s} scale={g.sc * 0.8} mode={i === 3 ? "attack" : "walk"} costume={COSTUME.burma} phase={i * 1.3} />
                ))}
                <Grass g={g} shift={pan * 1.6} />
              </g>
            )}
          </Depth>
        );
      }}
    </Panel>
  );
};

// ---------- nang yai: shadow puppets on a lit cloth screen ----------
const Puppet = ({ x, y, s, flip = false, arm = 0, kind = "thai" }: { x: number; y: number; s: number; flip?: boolean; arm?: number; kind?: "thai" | "burma" }) => {
  const holes: [number, number][] = [];
  for (let r = 0; r < 7; r++) for (let c = -2; c <= 2; c++) if ((r + c) % 2 === 0) holes.push([c * 6, -82 + r * 8]);
  for (let i = 0; i < 5; i++) holes.push([-24 + i * 12, -33]);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {/* rods */}
      <line x1={-4} y1={0} x2={-14} y2={90} stroke="#2a1a10" strokeWidth={3} />
      <line x1={22} y1={-78} x2={40} y2={90} stroke="#2a1a10" strokeWidth={2} />
      {/* body: legs in a wide stance, ornate body, tall crown */}
      <path d="M-26 0 L-14 -26 L-6 -20 L-2 0 Z M26 0 L14 -26 L6 -20 L2 0 Z" fill="#100a06" />
      <path d="M-18 -24 Q-22 -60 -14 -86 L14 -86 Q22 -60 18 -24 Z" fill="#100a06" />
      <path d="M-30 -30 Q-26 -40 -18 -40 L18 -40 Q26 -40 30 -30 L22 -26 L-22 -26 Z" fill="#100a06" />
      <ellipse cx={0} cy={-96} rx={10} ry={11} fill="#100a06" />
      {kind === "thai" ? <path d="M-11 -102 L0 -150 L11 -102 Z M-14 -104 L-20 -112 L-8 -108 Z M14 -104 L20 -112 L8 -108 Z" fill="#100a06" /> : <path d="M-12 -102 Q-14 -122 0 -124 Q14 -122 12 -102 Z M6 -118 Q22 -124 26 -112" fill="#100a06" stroke="#100a06" strokeWidth={3} />}
      <path d="M10 -96 L16 -94 L10 -92 Z" fill="#100a06" />
      {/* perforations let light through */}
      {holes.map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r={1.8} fill="#f6d9a0" opacity={0.85} />)}
      <path d="M-10 -80 Q0 -74 10 -80" stroke="#f6d9a0" strokeWidth={1.2} fill="none" opacity={0.8} />
      {/* jointed sword arm */}
      <g transform={`rotate(${-arm * 70},14,-78)`}>
        <path d="M14 -80 L40 -70 L38 -64 L12 -74 Z" fill="#100a06" />
        <path d="M38 -70 L80 -96 L82 -92 L42 -64 Z" fill="#100a06" />
      </g>
    </g>
  );
};

const ShadowPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="nangyai" anchor={PL.plk} start={start} end={end} sky={["#1a0f08", "#1a0f08"]} accent={GILT}>
      {(g) => {
        const lt = frame - start;
        const flicker = 0.88 + 0.06 * Math.sin(frame * 0.9) + 0.04 * Math.sin(frame * 2.3);
        const approach = interpolate(lt, [10, 80], [0, 1], clamp);
        const clash = lt >= 82 && lt < 92 ? 1 - (lt - 82) / 10 : 0;
        const armL = lt < 70 ? Math.max(0, Math.sin(lt * 0.15)) * 0.4 : interpolate(lt, [70, 82, 100], [0.4, 1.1, 0.2], clamp);
        const armR = lt < 70 ? Math.max(0, Math.sin(lt * 0.15 + 2)) * 0.4 : interpolate(lt, [70, 82, 100], [0.3, 0.9, 0.5], clamp);
        const bobL = Math.sin(lt * 0.18) * 4 * g.s;
        const bobR = Math.sin(lt * 0.18 + 1.5) * 4 * g.s;
        const blur = interpolate(lt, [0, 40], [2.5, 0.8], clamp);
        return (
          <g>
            <defs>
              <radialGradient id="screenlight" cx="0.5" cy="0.6" r="0.7">
                <stop offset="0" stopColor="#fff1c9" />
                <stop offset="0.55" stopColor="#f0b35c" />
                <stop offset="1" stopColor="#6a3410" />
              </radialGradient>
              <filter id="shadowblur"><feGaussianBlur stdDeviation={blur} /></filter>
            </defs>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="url(#screenlight)" opacity={flicker} />
            {/* cloth weave + frame poles */}
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={g.x} y1={g.y + i * 30 * g.s} x2={g.x + g.W} y2={g.y + i * 30 * g.s} stroke="#7a4a20" strokeWidth={0.6 * g.s} opacity={0.25} />)}
            <rect x={g.x} y={g.y} width={22 * g.s} height={g.H} fill="#3a2414" />
            <rect x={g.x + g.W - 22 * g.s} y={g.y} width={22 * g.s} height={g.H} fill="#3a2414" />
            {/* city gate puppet (scenery) */}
            <g filter="url(#shadowblur)" opacity={0.92}>
              <path d={`M${g.x + g.W * 0.78} ${g.ground} l0 ${-120 * g.s} l${30 * g.s} ${-40 * g.s} l${30 * g.s} ${40 * g.s} l0 ${120 * g.s} Z`} fill="#100a06" />
              <path d={`M${g.x + g.W * 0.8} ${g.ground} l0 ${-60 * g.s} q${16 * g.s} ${-26 * g.s} ${32 * g.s} 0 l0 ${60 * g.s} Z`} fill="#e8b46a" opacity={0.6} />
              <Puppet x={g.x + g.W * (0.18 + approach * 0.18)} y={g.ground + bobL} s={g.sc * 0.82} arm={armL} kind="thai" />
              <Puppet x={g.x + g.W * (0.78 - approach * 0.2)} y={g.ground + bobR} s={g.sc * 0.82} arm={armR} kind="burma" flip />
            </g>
            {clash > 0 && <circle cx={g.cx} cy={g.ground - 140 * g.s} r={(30 + (1 - clash) * 60) * g.s} fill="#fff6d0" opacity={clash * 0.8} />}
            {/* stage edge */}
            <rect x={g.x} y={g.ground + 20 * g.s} width={g.W} height={g.H} fill="#120a05" />
          </g>
        );
      }}
    </Panel>
  );
};

const Tag = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const i = Math.min(2, Math.floor(frame / SEG));
  const [t, sub, c] = [["แบบเดิม", "ภาพประกอบตอนนี้", "#9aa3ad"], ["แบบใหม่", "ระยะลึก แสง ท่าทาง เส้นหมึก + เนื้อกระดาษ", GOLD], ["หนังใหญ่", "เงาตัวหนังบนจอผ้า แสงไฟ", "#ffb35c"]][i];
  const k = interpolate(frame - i * SEG, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.12, fontFamily: font, color: "#fff", textAlign: "center", opacity: k }}>
      <div style={{ background: "rgba(8,14,26,0.88)", border: `${4 * s}px solid ${c}`, borderRadius: 20 * s, padding: `${16 * s}px ${40 * s}px` }}>
        <div style={{ fontSize: 96 * s, fontWeight: 900, color: c }}>{t}</div>
        <div style={{ fontSize: 34 * s, fontWeight: 700, opacity: 0.9 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const IconTest = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={view(VW.plk, width, height, 0.95, 0.06)}>
        <Raster layers={[{ name: "world" }, { name: "sea" }, { name: "northhls" }, { name: "plkhls" }]} />
        <Rivers />
        <Stockades center={PL.plk} n={12} r0={0.075} start={-100} step={0} />
        <CityDot at={PL.plk} color={GOLD} r={16} />
        <SiegeScene id="old" anchor={PL.plk} start={-10} end={SEG + 7} />
        <SiegeV2 start={SEG - 7} end={2 * SEG + 7} />
        <ShadowPanel start={2 * SEG - 7} end={3 * SEG + 10} />
      </MapFrame>
      <Tag />
    </AbsoluteFill>
  );
};
void RED;
