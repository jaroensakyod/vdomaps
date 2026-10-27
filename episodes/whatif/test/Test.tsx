import { geoCircle } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { COSTUME, Depth, Fighter, Glow, PAL, Ridge, impactAt } from "../../../components/Scene";
import { Bed, Hit, SFX, Sfx, voiceSpans } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import { useJson } from "../../../components/useJson";
import { CAPTION_TOP, clamp, display, font, GOLD, HeadCard, Panel, view } from "../../worldhistory/kit/news";
import { alaska, BORDER, COSTUME_W, Flag, LogHouse, moveTrueSize, OnionChurch, Pine, REAL, RU_FLAG, russia, RUSSIA, Snow, SnowGround, SplitOut, US_FLAG, WHATIF, WhatIfBar, WhatIfGrade } from "../kit/WhatIf";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ~22-second look test for What if America ep 1 (English, US audience): what-if world (graded map, "WHAT IF" chip,
// v2 panels in snow) → the channel's split transition → the real 1867 sale (news look) → Texas, California and
// Montana at true size inside Alaska.
const LAYOUT = { lead: 3, gap: 16 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const WHATIF_TEST_FRAMES = totalFrames(BEATS, LAYOUT);
const END = WHATIF_TEST_FRAMES;

const T = {
  close: B.close.start,
  stand: wf("close", "guarding"),
  missile: wf("close", "missiles"),
  real: B.real.start,
  sell: wf("real", "sold"),
  price: wf("real", "seven-", 0.75),
  size: B.size.start,
  states: [wf("size", "Texas,", 0.3), wf("size", "California", 0.45), wf("size", "Montana", 0.7)],
};
const FLAG_DOWN = T.real + 20; // the Russian flag is lowered while the year is read
const FLAG_UP = T.sell; // the US flag goes up on "sold"
const SALUTE = [T.sell + 56, T.sell + 74];

const P = {
  silo: [-147.7, 64.8] as [number, number],
  sitka: [-135.33, 57.05] as [number, number],
  seattle: [-122.33, 47.61] as [number, number],
  vancouver: [-123.12, 49.28] as [number, number],
  borderMid: [-141, 63.5] as [number, number],
};
const V = {
  alaska: bbox([[-168, 54], [-132, 71.5]]),
  border: bbox([[-148, 57], [-128, 67]]),
  reach: bbox([[-178, 40], [-112, 74]]), // wide enough to hold the whole reach ring
};

// Texas, California and Montana at true size inside Alaska, each dropped in on its name: [centre, rotation].
const STATES: [string, [number, number], number, string][] = [
  ["Texas", [-151.5, 63.6], 0, GOLD],
  ["California", [-159.5, 59.4], 75, "#ff9f43"],
  ["Montana", [-152.5, 68.6], 0, "#7bed9f"],
];

const AreaTint = ({ f, color, k, line = 2 }: { f: Feature; color: string; k: number; line?: number }) => {
  const { path, s } = useMap();
  if (k <= 0) return null;
  const d = path(f) ?? "";
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke={color} strokeWidth={12 * s} strokeOpacity={0.35} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} fill={color} fillOpacity={0.38} stroke="#fff" strokeWidth={line * s} strokeOpacity={0.85} strokeLinejoin="round" />
    </g>
  );
};

const BorderGlow = ({ start }: { start: number }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  if (frame < start) return null;
  const k = interpolate(frame, [start, start + 30], [0, 1], clamp);
  const d = path({ type: "LineString", coordinates: BORDER }) ?? "";
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={RUSSIA} strokeWidth={18 * s} strokeOpacity={0.35 * k} style={{ filter: `blur(${6 * s}px)` }} />
      <path d={d} stroke="#ffd0dc" strokeWidth={4 * s} strokeDasharray={`${16 * s} ${10 * s}`} strokeDashoffset={-frame * 1.2 * s} opacity={k} />
    </g>
  );
};

// Missile reach ring from the silo, growing on "missiles".
const Reach = ({ start }: { start: number }) => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  if (frame < start) return null;
  const r = interpolate(frame, [start, start + 36], [0.5, 22.5], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const ring = geoCircle().center(P.silo).radius(r)();
  const d = path(ring) ?? "";
  return (
    <g>
      <path d={d} fill={WHATIF} fillOpacity={0.12} stroke={WHATIF} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${4 * s}px)` }} />
      <path d={d} fill="none" stroke="#ffc2e2" strokeWidth={3 * s} strokeDasharray={`${12 * s} ${8 * s}`} />
    </g>
  );
};

const States = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const data = useJson<FeatureCollection<Polygon | MultiPolygon, { name: string }>>("data/us-3states.json");
  return (
    <g>
      {STATES.map(([name, to, rot, color], i) => {
        const f = data?.features.find((x) => x.properties.name === name);
        const at = T.states[i];
        if (!f || frame < at) return null;
        const moved = moveTrueSize(f, to, rot);
        const k = interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
        const d = path(moved) ?? "";
        const [cx, cy] = path.centroid(moved);
        return (
          <g key={name} opacity={k}>
            <path d={d} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={10 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
            <path d={d} fill="none" stroke="#fff8dc" strokeWidth={2.6 * s} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily={display} fontWeight={700} fontSize={34 * s} fill="#fff" stroke="#111" strokeWidth={5 * s} paintOrder="stroke">
              {name.toUpperCase()}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.12, opacity: o, fontFamily: display, fontWeight: 700, textTransform: "uppercase", color: "#fff", textAlign: "center", lineHeight: 1.1 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 124 * s }}>What if <span style={{ color: "#ff6b6f" }}>Russia</span></div>
        <div style={{ fontSize: 104 * s }}>never sold Alaska?</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- panels (style v2) ----

// Aurora: three soft green bands drifting slowly (no flicker).
const Aurora = ({ x, y, W, s }: { x: number; y: number; W: number; s: number }) => {
  const frame = useCurrentFrame();
  return (
    <g style={{ filter: `blur(${10 * s}px)` }}>
      {[0, 1, 2].map((i) => {
        const pts = Array.from({ length: 9 }, (_, j) => `${x + (j * W) / 8},${y + i * 26 * s + Math.sin(j * 0.9 + frame * 0.03 + i) * 22 * s}`).join(" L");
        return <path key={i} d={`M${pts}`} fill="none" stroke={i === 1 ? "#7affc4" : "#3fe0a0"} strokeWidth={(26 - i * 6) * s} opacity={0.35 - i * 0.07} />;
      })}
    </g>
  );
};

// Hook: a Russian outpost in today's Alaska — church, log houses, the tricolour, a guard in the snow at night.
const OutpostPanel = ({ start, end }: { start: number; end: number }) => (
  <Panel id="outpost" anchor={P.sitka} start={start} end={end} sky={["#070b26", "#3a2c62"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="outpost" start={start} end={end} warm={0.03}>
        {(pan) => {
          const horizon = g.y + g.H * 0.64;
          return (
            <g>
              <Aurora x={g.x} y={g.y + 40 * g.s} W={g.W} s={g.s} />
              {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={g.x + ((i * 0.618) % 1) * g.W} cy={g.y + ((i * 0.37) % 1) * 120 * g.s} r={1.4 * g.s} fill="#fff" opacity={0.6} />)}
              <Ridge g={g} base={horizon - 10 * g.s} amp={46 * g.s} seed={2} color="#b8c3dc" shift={pan * 0.2} />
              <Ridge g={g} base={horizon + 8 * g.s} amp={22 * g.s} seed={5} color="#7d8bb0" shift={pan * 0.5} />
              <g transform={`translate(${pan * 0.65},0)`}>
                <LogHouse x={g.x + g.W * 0.12} y={horizon + 30 * g.s} w={70 * g.s} h={44 * g.s} s={g.s} />
                <OnionChurch x={g.x + g.W * 0.32} y={horizon + 34 * g.s} s={g.s} />
                <LogHouse x={g.x + g.W * 0.7} y={horizon + 32 * g.s} w={80 * g.s} h={48 * g.s} s={g.s} />
                <Flag x={g.x + g.W * 0.55} y={horizon + 40 * g.s} s={g.s} stripes={RU_FLAG} h={150} />
              </g>
              <SnowGround g={g} y={horizon + 30 * g.s} shift={pan * 0.8} />
              <Glow x={g.x + g.W * 0.75} y={horizon + 6 * g.s} s={g.s * 0.5} color="#ffcf7a" core="#fff1c8" />
              <Fighter x={g.x + g.W * 0.47} y={g.ground - 4 * g.s} scale={g.sc * 0.9} mode="stand" costume={COSTUME_W.soviet} weapon="rifle" />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.04} y={g.y + g.H + 10 * g.s} h={200 * g.s} color="#16281f" />
                <Pine x={g.x + g.W * 0.95} y={g.y + g.H + 14 * g.s} h={230 * g.s} color="#16281f" />
              </g>
              <Snow g={g} n={30} depth={0.2} />
              <Snow g={g} n={16} depth={0.9} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// The border: striped Soviet border post, barrier, guard hut, a patrol walking in the snow among the pines.
const BorderPanel = ({ start, end }: { start: number; end: number }) => (
  <Panel id="border" anchor={P.borderMid} start={start} end={end} sky={["#46557a", "#c3cede"]} accent={WHATIF}>
    {(g) => (
      <Depth g={g} id="border" start={start} end={end} warm={0.02}>
        {(pan) => {
          const horizon = g.y + g.H * 0.62;
          const post = g.x + g.W * 0.5;
          return (
            <g>
              <Ridge g={g} base={horizon - 4 * g.s} amp={40 * g.s} seed={8} color="#a9b6cc" shift={pan * 0.2} />
              <g transform={`translate(${pan * 0.5},0)`}>
                {Array.from({ length: 12 }, (_, i) => <Pine key={i} x={g.x + (i / 11) * g.W} y={horizon + 18 * g.s} h={(70 + (i % 3) * 18) * g.s} color="#2c4a3c" />)}
              </g>
              <SnowGround g={g} y={horizon + 16 * g.s} shift={pan * 0.7} />
              <g transform={`translate(${pan * 0.7},0)`}>
                {/* guard hut */}
                <rect x={post + 120 * g.s} y={horizon - 30 * g.s} width={64 * g.s} height={72 * g.s} fill="#6a6f5a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <path d={`M${post + 112 * g.s} ${horizon - 30 * g.s} L${post + 152 * g.s} ${horizon - 56 * g.s} L${post + 192 * g.s} ${horizon - 30 * g.s} Z`} fill="#4a4d40" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={post + 140 * g.s} y={horizon - 12 * g.s} width={24 * g.s} height={18 * g.s} fill="#ffcf7a" opacity={0.8} />
                {/* striped border post */}
                {Array.from({ length: 6 }, (_, i) => <rect key={i} x={post - 7 * g.s} y={horizon + 42 * g.s - (i + 1) * 20 * g.s} width={14 * g.s} height={20 * g.s} fill={i % 2 ? "#3f8f4a" : "#c9302c"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                <circle cx={post} cy={horizon - 86 * g.s} r={12 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                {/* barrier pole */}
                <rect x={post + 30 * g.s} y={horizon + 6 * g.s} width={10 * g.s} height={36 * g.s} fill="#3a3a32" />
                {Array.from({ length: 7 }, (_, i) => <rect key={i} x={post + 40 * g.s + i * 22 * g.s} y={horizon + 4 * g.s} width={22 * g.s} height={9 * g.s} fill={i % 2 ? "#f4f1ea" : "#c9302c"} stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
              </g>
              <Fighter x={post - 70 * g.s} y={g.ground - 2 * g.s} scale={g.sc * 0.95} mode="stand" costume={COSTUME_W.soviet} weapon="rifle" />
              <Fighter x={post + 110 * g.s} y={g.ground} scale={g.sc * 0.9} mode="stand" flip costume={COSTUME_W.soviet} weapon="rifle" phase={2} />
              <Fighter x={g.x + interpolate(g.frame, [start, end], [g.W * 0.08, g.W * 0.3], clamp)} y={g.ground + 6 * g.s} scale={g.sc} mode="walk" costume={COSTUME_W.soviet} weapon="rifle" phase={1} />
              <g transform={`translate(${pan * 1.6},0)`}>
                <Pine x={g.x + g.W * 0.9} y={g.y + g.H + 16 * g.s} h={230 * g.s} color="#16281f" />
                <path d={`M${g.x - 60 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.2} ${g.y + g.H - 40 * g.s} ${g.x + g.W * 0.45} ${g.y + g.H} Z`} fill="#eef3f8" stroke={PAL.ink} strokeWidth={1.2 * g.s} strokeOpacity={0.4} />
              </g>
              <Snow g={g} n={36} depth={0.25} wind={1.6} />
              <Snow g={g} n={14} depth={0.95} wind={1.6} />
            </g>
          );
        }}
      </Depth>
    )}
  </Panel>
);

// The silo at night: hatch open, the missile rising slowly, floodlights fading up, a slow searchlight sweep.
const SiloPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const lights = interpolate(frame, [start + 4, start + 24], [0, 1], clamp);
  const rise = interpolate(frame, [start + 10, end - 10], [0, 1], { ...clamp, easing: (x) => x * (2 - x) });
  const sweep = Math.sin((frame - start) * 0.035) * 22;
  return (
    <Panel id="silo" anchor={P.silo} start={start} end={end} sky={["#03050f", "#1b2142"]} accent={WHATIF}>
      {(g) => (
        <Depth g={g} id="silo" start={start} end={end} warm={0.0}>
          {(pan) => {
            const horizon = g.y + g.H * 0.6;
            const hx = g.cx + 10 * g.s;
            const hy = horizon + 46 * g.s;
            const mh = 200 * g.s;
            return (
              <g>
                {Array.from({ length: 28 }, (_, i) => <circle key={i} cx={g.x + ((i * 0.618) % 1) * g.W} cy={g.y + ((i * 0.29) % 1) * 140 * g.s} r={1.3 * g.s} fill="#fff" opacity={0.5} />)}
                <g transform={`rotate(${sweep},${g.x + g.W * 0.18},${horizon})`} opacity={0.18 * lights}>
                  <path d={`M${g.x + g.W * 0.18} ${horizon} L${g.x + g.W * 0.05} ${g.y - 40 * g.s} L${g.x + g.W * 0.32} ${g.y - 40 * g.s} Z`} fill="#dfe8ff" />
                </g>
                <Ridge g={g} base={horizon} amp={34 * g.s} seed={11} color="#2a3352" shift={pan * 0.2} />
                <SnowGround g={g} y={horizon + 12 * g.s} shift={pan * 0.6} color="#9fb0c8" shade="#56657f" />
                {/* hatch + missile (clipped at ground level so it comes up out of the silo) */}
                <defs>
                  <clipPath id="silo-clip"><rect x={g.x} y={g.y} width={g.W} height={hy - g.y} /></clipPath>
                </defs>
                <ellipse cx={hx} cy={hy} rx={70 * g.s} ry={16 * g.s} fill="#1a1d26" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <g clipPath="url(#silo-clip)">
                  <g transform={`translate(0,${(1 - rise * 0.75) * mh})`}>
                    <rect x={hx - 18 * g.s} y={hy - mh} width={36 * g.s} height={mh} fill="#d9dde3" stroke={PAL.ink} strokeWidth={2 * g.s} />
                    <path d={`M${hx - 18 * g.s} ${hy - mh} Q${hx} ${hy - mh - 70 * g.s} ${hx + 18 * g.s} ${hy - mh} Z`} fill="#c9302c" stroke={PAL.ink} strokeWidth={2 * g.s} />
                    <rect x={hx - 18 * g.s} y={hy - mh * 0.55} width={36 * g.s} height={10 * g.s} fill="#8a1a1a" />
                    <circle cx={hx} cy={hy - mh * 0.72} r={6 * g.s} fill="#c9302c" />
                  </g>
                </g>
                <path d={`M${hx - 76 * g.s} ${hy} A${76 * g.s} ${18 * g.s} 0 0 0 ${hx + 76 * g.s} ${hy}`} fill="none" stroke="#5a6070" strokeWidth={6 * g.s} />
                {/* floodlight towers */}
                {[0.22, 0.8].map((fx, i) => (
                  <g key={i} transform={`translate(${pan * 0.7},0)`}>
                    <line x1={g.x + g.W * fx} y1={hy + 8 * g.s} x2={g.x + g.W * fx} y2={horizon - 60 * g.s} stroke="#2a2d36" strokeWidth={5 * g.s} />
                    <g opacity={lights}><Glow x={g.x + g.W * fx} y={horizon - 64 * g.s} s={g.s * 0.55} color="#cfe0ff" core="#ffffff" /></g>
                  </g>
                ))}
                <rect x={g.x} y={horizon - 10 * g.s} width={g.W} height={40 * g.s} fill="#c8d4ee" opacity={0.08} style={{ filter: `blur(${8 * g.s}px)` }} />
                <Fighter x={hx - 130 * g.s} y={g.ground} scale={g.sc * 0.8} mode="stand" costume={COSTUME_W.soviet} weapon="rifle" />
                {/* fence: fastest foreground layer */}
                <g transform={`translate(${pan * 1.6},0)`}>
                  {Array.from({ length: 16 }, (_, i) => <line key={i} x1={g.x + i * 70 * g.s} y1={g.y + g.H} x2={g.x + i * 70 * g.s} y2={g.y + g.H - 90 * g.s} stroke="#14161c" strokeWidth={6 * g.s} />)}
                  {[0, 1, 2, 3].map((i) => <line key={i} x1={g.x - 40 * g.s} y1={g.y + g.H - (20 + i * 22) * g.s} x2={g.x + g.W + 40 * g.s} y2={g.y + g.H - (20 + i * 22) * g.s} stroke="#20242c" strokeWidth={2.2 * g.s} />)}
                </g>
                <Snow g={g} n={24} depth={0.3} />
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

// Sitka, 18 Oct 1867 (shown on the sale beat): the Russian flag comes down, the US flag goes up, two lines of
// soldiers, a salute from the guns.
const SitkaPanel = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const ru = interpolate(frame, [FLAG_DOWN, FLAG_DOWN + 70], [1, 0], { ...clamp, easing: (x) => x * (2 - x) });
  const us = interpolate(frame, [FLAG_UP, FLAG_UP + 56], [0, 1], { ...clamp, easing: (x) => x * (2 - x) });
  const impact = impactAt(frame, SALUTE, 10) * 0.6; // shake only: kept under 0.7 so Depth adds no white flash
  return (
    <Panel id="sitka" anchor={P.sitka} start={start} end={end} sky={["#6f819c", "#dfe2e2"]} accent={REAL}>
      {(g) => (
        <Depth g={g} id="sitka" start={start} end={end} impact={impact} warm={0.06}>
          {(pan) => {
            const horizon = g.y + g.H * 0.55;
            const pole = g.cx + 10 * g.s;
            return (
              <g>
                <Glow x={g.x + g.W * 0.82} y={g.y + 70 * g.s} s={g.s * 0.6} color="#fff2cf" core="#fffaf0" />
                <Ridge g={g} base={horizon - 6 * g.s} amp={64 * g.s} seed={3} color="#8e9fb6" shift={pan * 0.2} />
                <path d={`M${g.x} ${horizon - 6 * g.s} L${g.x + g.W} ${horizon - 6 * g.s}`} stroke="#eef3f8" strokeWidth={3 * g.s} opacity={0.6} />
                <rect x={g.x} y={horizon - 6 * g.s} width={g.W} height={30 * g.s} fill="#3b5a6e" />
                <rect x={g.x} y={horizon - 2 * g.s} width={g.W} height={24 * g.s} fill="#c8d6e0" opacity={0.08} />
                <g transform={`translate(${pan * 0.55},0)`}>
                  <OnionChurch x={g.x + g.W * 0.16} y={horizon + 46 * g.s} s={g.s * 0.9} />
                  <LogHouse x={g.x + g.W * 0.64} y={horizon + 44 * g.s} w={96 * g.s} h={50 * g.s} s={g.s} />
                  <LogHouse x={g.x + g.W * 0.82} y={horizon + 46 * g.s} w={70 * g.s} h={40 * g.s} s={g.s} />
                  {/* palisade */}
                  {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${g.x + i * 36 * g.s} ${horizon + 52 * g.s} l0 ${-30 * g.s} l${7 * g.s} ${-8 * g.s} l${7 * g.s} ${8 * g.s} l0 ${30 * g.s} Z`} fill="#6b4a2e" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                </g>
                <rect x={g.x} y={horizon + 50 * g.s} width={g.W} height={g.H} fill="#7d7a5e" />
                <rect x={g.x} y={horizon + 50 * g.s} width={g.W} height={g.H} fill="#eef3f8" opacity={0.25} />
                {/* one pole: Russian flag down, then the US flag up */}
                {ru > 0.02 ? <Flag x={pole} y={g.ground - 30 * g.s} s={g.s} h={190} raise={ru} stripes={RU_FLAG} /> : <Flag x={pole} y={g.ground - 30 * g.s} s={g.s} h={190} raise={us} stripes={US_FLAG} canton />}
                {/* two lines of soldiers facing the pole */}
                {[0, 1, 2, 3].map((i) => <Fighter key={`r${i}`} x={pole - (70 + i * 46) * g.s} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.78} mode="stand" costume={COSTUME_W.russia1860} weapon="rifle" phase={i} />)}
                {[0, 1, 2, 3].map((i) => <Fighter key={`u${i}`} x={pole + (70 + i * 46) * g.s} y={g.ground - (i % 2) * 6 * g.s} scale={g.sc * 0.78} flip mode="stand" costume={COSTUME_W.usa1860} weapon="rifle" phase={i + 4} />)}
                {/* salute smoke from a gun on the left edge */}
                {SALUTE.map((f, i) => {
                  const t = frame - f;
                  if (t < 0 || t > 50) return null;
                  return (
                    <g key={i}>
                      {Array.from({ length: 5 }, (_, j) => {
                        const age = t - j * 3;
                        if (age < 0) return null;
                        return <circle key={j} cx={g.x + 40 * g.s + age * 1.2 * g.s} cy={horizon + 30 * g.s - age * 1.1 * g.s} r={(10 + age * 1.1) * g.s} fill="#efeae0" opacity={0.6 * (1 - age / 50)} />;
                      })}
                    </g>
                  );
                })}
                {/* spectators + grass: fastest foreground layer */}
                <g transform={`translate(${pan * 1.6},0)`}>
                  {[0.05, 0.13, 0.86, 0.95].map((fx, i) => <Fighter key={i} x={g.x + g.W * fx} y={g.y + g.H + 30 * g.s} scale={g.sc * 1.25} mode="stand" flip={fx > 0.5} costume={{ ...COSTUME.siam, jacket: i % 2 ? "#4a3a2e" : "#2e3440", sash: "#6b5236", pants: "#2a2420", head: "short", skin: "#e0b08a" }} weapon="none" phase={i * 2} />)}
                </g>
              </g>
            );
          }}
        </Depth>
      )}
    </Panel>
  );
};

export const WhatIfTest = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(V.alaska, width, height, 1.0, 0.1) },
      { frame: T.close, cam: view(V.alaska, width, height, 1.05, 0.1) },
      { frame: T.close + 40, cam: view(V.border, width, height, 1.0, 0.1) },
      { frame: T.missile, cam: view(V.border, width, height, 1.0, 0.1) },
      { frame: T.missile + 40, cam: view(V.reach, width, height, 1.0, 0.1) },
      { frame: T.real, cam: view(V.reach, width, height, 1.0, 0.1) },
      { frame: T.real + 36, cam: view(V.alaska, width, height, 1.0, 0.1) },
      { frame: T.size, cam: view(V.alaska, width, height, 1.0, 0.1) },
      { frame: T.size + 30, cam: view(V.alaska, width, height, 0.95, -0.08) }, // no panel now: drop Alaska below the card
    ],
    frame,
  );
  const whatIf = frame < T.real;
  const blue = interpolate(frame, [T.sell, T.sell + 18], [0, 1], clamp);
  const counter = interpolate(frame, [T.price, T.price + 24], [0, 7.2], clamp);
  const voice = voiceSpans(BEATS);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {/* UI moments: synthetic */}
      <Sfx src={SFX.hit} at={0} volume={0.6} />
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.close - 6} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.missile - 4} volume={0.3} />
      <Sfx src={SFX.pop} at={T.missile + 6} volume={0.3} />
      <Sfx src={SFX.riser} at={T.real - 60} volume={0.25} />
      <Sfx src={SFX.hit} at={T.real} volume={0.55} />
      <Sfx src={SFX.whoosh} at={T.real - 2} volume={0.35} />
      <Sfx src={SFX.pop} at={T.sell} volume={0.3} />
      <Sfx src={SFX.tick} at={T.price} volume={0.3} />
      {T.states.map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.32} />)}
      {/* story sounds: house library */}
      <Bed id="wind" from={0} to={T.real + 12} volume={0.32} voice={voice} />
      <Bed id="army_marching" from={T.stand} to={T.missile + 14} volume={0.1} voice={voice} />
      <Bed id="server_hum" from={T.missile} to={T.real + 8} volume={0.22} voice={voice} />
      <Bed id="sea_rough" from={T.real} to={T.size + 24} volume={0.14} voice={voice} />
      <Bed id="wind" from={T.real} to={END} volume={0.1} voice={voice} />
      {SALUTE.map((f) => <Hit key={f} id="cannon_far" at={f} volume={0.35} />)}
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "alaska" }, { name: "chukotka" }]} />
        <AreaTint f={russia} color={RUSSIA} k={interpolate(frame, [T.real, T.real + 20], [0.6, 0.25], clamp)} line={1.2} />
        {/* Alaska: Russian red (in the what-if world, and in 1867 before the sale), then US blue on "sold" */}
        <AreaTint f={alaska} color={RUSSIA} k={1 - blue} />
        <AreaTint f={alaska} color={REAL} k={blue} />
        {frame >= T.close && frame < T.real && <BorderGlow start={T.close + 10} />}
        {frame >= T.missile && frame < T.real && <Reach start={T.missile + 6} />}
        {frame >= T.size && <States />}
        <SplitOut at={T.real}>
          <WhatIfGrade k={1} />
        </SplitOut>
        {frame < T.real && <PointLabel at={P.silo} text="Missile base" start={T.missile + 6} color={WHATIF} size={0.8} />}
        {frame < T.real && <PointLabel at={P.seattle} text="Seattle" start={T.missile + 26} color="#fff" size={0.75} />}
        <PointLabel at={P.sitka} text="Sitka" start={T.sell + 4} color={REAL} size={0.8} />
        <OutpostPanel start={-12} end={T.stand + 14} />
        <BorderPanel start={T.stand} end={T.missile + 14} />
        <SiloPanel start={T.missile} end={T.real + 14} />
        <SitkaPanel start={T.real} end={T.size + 14} />
      </MapFrame>
      <WhatIfBar chapter={whatIf ? "No sale" : "The real story"} chip={whatIf ? "WHAT IF" : "1867"} whatIf={whatIf} />
      <HeadCard
        heads={[
          { f: T.close, tag: "What if · 2026", head: "Russian troops on the Canadian border", color: WHATIF },
          { f: T.missile, tag: "What if", head: "Soviet missiles in North America", color: WHATIF },
          { f: T.real, tag: "Real world · March 30, 1867", head: "Russia sells Alaska to the US", color: REAL, stat: (f) => (f >= T.price ? `$${counter.toFixed(1)} million` : ""), label: "for all of it" },
          { f: T.size, tag: "Alaska · 663,000 sq mi", head: "Bigger than TX + CA + MT", color: GOLD, stat: (f) => (f >= T.states[2] ? "579,000" : ""), label: "sq mi for all three" },
        ]}
        from={T.close}
        to={END}
      />
      <HookTitle />
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP + 0.03} />
      ))}
    </AbsoluteFill>
  );
};
