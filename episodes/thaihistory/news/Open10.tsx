import { loadFont } from "@remotion/google-fonts/Kanit";
import type { FeatureCollection, MultiLineString } from "geojson";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { InsetPanel } from "../../../components/Inset";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { useJson } from "../../../components/useJson";
import beatsText from "../ep01/beats.json";
import timing from "../ep01/timing.json";
import { Arrow } from "../../../components/Arrow";
import { BellChedi, BurmeseSoldier, CityWall, Dust, Embers, Fire, Moon, Prang, RuinedPrang, SiegeCamp, Smoke } from "./Period";

// News-style test of the first ~11 s (hook + night): satellite base, dark news cards, word captions, inset scene.
const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const RED = "#ff3b30";
const GOLD = "#ffc94a";
const LAYOUT = { lead: 3, gap: 16 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const OPEN10_FRAMES = B.night.end + 20;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const AYUT: [number, number] = [100.566, 14.357];
const HUARO: [number, number] = [100.578, 14.366]; // approximate

// Rivers from OSM on top of the imagery: a soft glow + a crisp line, so the island reads at a glance.
const Rivers = ({ glow = 1 }: { glow?: number }) => {
  const { path, projection, s } = useMap();
  const isle = useJson<FeatureCollection<MultiLineString>>("data/th-island.json");
  const plain = useJson<FeatureCollection<MultiLineString>>("data/th-plain.json");
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.0009, 2.5 * s), 16 * s);
  const all = [...(plain?.features ?? []), ...(isle?.features ?? [])];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map((f, i) => <path key={`g${i}`} d={path(f) ?? ""} stroke="#4fc3ff" strokeWidth={w * 2.2} strokeOpacity={0.16 * glow} />)}
      {all.map((f, i) => <path key={`l${i}`} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.85} />)}
    </g>
  );
};

// Night grade over the imagery + fire glow around a point.
const NightGrade = ({ k, fireAt }: { k: number; fireAt: [number, number] }) => {
  const { projection, width, height, s } = useMap();
  const frame = useCurrentFrame();
  const p = projection(fireAt);
  const flicker = 1 + Math.sin(frame * 0.4) * 0.04 + Math.sin(frame * 1.1) * 0.03;
  return (
    <g>
      <defs>
        <radialGradient id="fireglow">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#ff5a1a" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="#06112b" opacity={0.5 * k} />
      {p && <circle cx={p[0]} cy={p[1]} r={420 * s * flicker} fill="url(#fireglow)" opacity={k} style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

// Island outline highlight (news "Highlight"): red glow ring around the old city.
const CityRing = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  const p = projection(AYUT);
  if (!p || k <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const rx = 0.027 * pxDeg;
  const ry = 0.014 * pxDeg;
  return (
    <g opacity={k}>
      <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill={RED} fillOpacity={0.12} stroke={RED} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${5 * s}px)` }} />
      <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill="none" stroke="#ff8a80" strokeWidth={2.6 * s} strokeDasharray={`${14 * s} ${8 * s}`} />
    </g>
  );
};

const TopBar = ({ chapter, year }: { chapter: string; year: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>ประวัติศาสตร์บนแผนที่</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>พ.ศ. {year}</div>
    </div>
  );
};

// Dark news card: tag, headline, big number + label.
const NewsCard = ({ start, end, tag, head, stat, statLabel }: { start: number; end: number; tag: string; head: string; stat?: string; statLabel?: string }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const statK = interpolate(frame, [start + 8, start + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${RED}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{tag}</span>
      <div style={{ fontSize: 50 * s, fontWeight: 900, marginTop: 6 * s }}>{head}</div>
      {stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, transform: `scale(${0.6 + 0.4 * statK})`, transformOrigin: "left center", opacity: statK }}>
          <span style={{ fontSize: 92 * s, fontWeight: 900, color: "#ff6b5f", lineHeight: 1.15 }}>{stat}</span>
          <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{statLabel}</span>
        </div>
      )}
    </div>
  );
};

// Hook title over the map from frame 0 (no fade-in: the first frame must already hit).
const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.11, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 120 * s, fontWeight: 900 }}>อยุธยา <span style={{ color: GOLD }}>417 ปี</span></div>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>แตกใน<span style={{ color: "#ff6b5f" }}>คืนเดียว</span>ได้ไง?</div>
      </div>
    </AbsoluteFill>
  );
};

// Frame where a word is spoken in a beat (Whisper timing), n-th match; falls back to a share of the beat.
const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
const T = {
  date: B.night.start,
  wall: wf("night", "กำแพง", 0.25),
  fall: wf("night", "พัง", 0.37),
  storm: wf("night", "ทหาร", 0.42),
  dawn: wf("night", "พอ", 0.62),
  end: wf("night", "ราชธานี", 0.7),
  gone: wf("night", "เหลือ", 0.92),
};

type G = { x: number; W: number; ground: number; s: number };
const Skyline = ({ g, color, burn = 0 }: { g: G; color: string; burn?: number }) => (
  <g>
    {([[0.1, 150, "p"], [0.28, 120, "c"], [0.45, 190, "p"], [0.6, 110, "c"], [0.78, 165, "p"], [0.93, 100, "c"]] as [number, number, string][]).map(([fx, h, t], i) =>
      t === "p" ? <Prang key={i} x={g.x + g.W * fx} y={g.ground - 95 * g.s} h={h * g.s} color={color} /> : <BellChedi key={i} x={g.x + g.W * fx} y={g.ground - 95 * g.s} h={h * g.s} color={color} />,
    )}
    {burn > 0 && [0.2, 0.5, 0.72, 0.9].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - 100 * g.s} size={(70 + i * 12) * g.s * burn} seed={i * 5} />)}
  </g>
);

// Consecutive panels overlap by 14 frames: the outgoing one fades only after the incoming one covers it,
// otherwise both are half transparent for a moment and the map blinks through.
// Hook + shot 4: the breach with soldiers storming in, city burning behind.
const StormScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <InsetPanel id={id} anchor={HUARO} label="ภาพประกอบ" start={start} end={end} sky={["#0b1230", "#c8461f"]} font={font} top={0.47}>
      {(g) => {
        const climb = interpolate(frame, [start, end], [0, 1], clamp);
        return (
          <g>
            <Skyline g={g} color="#2a1a1f" burn={1} />
            <Smoke x={g.x + g.W * 0.5} y={g.ground - 140 * g.s} size={160 * g.s} />
            <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
            <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} breach={1} bx={g.x + g.W * 0.55} />
            {[0, 1, 2, 3, 4].map((i) => {
              const p = (climb * 0.9 + i * 0.16) % 1;
              const sx = g.x + g.W * (0.18 + p * 0.5);
              const sy = g.ground + 6 * g.s - Math.sin(Math.min(1, p * 1.4) * Math.PI) * 50 * g.s * (p > 0.25 ? 1 : 0);
              return <BurmeseSoldier key={i} x={sx} y={sy} scale={g.sc * 0.95} phase={i * 1.3} hold={i % 2 ? "torch" : "spear"} pose={p > 0.25 && p < 0.7 ? "climb" : "walk"} />;
            })}
            <Embers x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} />
          </g>
        );
      }}
    </InsetPanel>
  );
};

// Shot 2: the last quiet night — moon over the walls, siege camp fires on the plain outside.
const NightScene = ({ start, end }: { start: number; end: number }) => (
  <InsetPanel id="night" anchor={AYUT} label="ภาพประกอบ" start={start} end={end} sky={["#050a1e", "#1c2d5a"]} font={font} top={0.47}>
    {(g) => (
      <g>
        <Moon x={g.x + g.W * 0.82} y={g.y + 80 * g.s} r={34 * g.s} />
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={g.x + (((i * 97) % 100) / 100) * g.W} cy={g.y + (((i * 37) % 100) / 100) * 140 * g.s} r={1.6 * g.s} fill="#fff" opacity={0.6} />)}
        <Skyline g={g} color="#1a1f36" />
        <rect x={g.x} y={g.ground - 4 * g.s} width={g.W} height={g.H} fill="#1b2235" />
        <CityWall x0={g.x + g.W * 0.38} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={80 * g.s} s={g.s} />
        <SiegeCamp x={g.x + g.W * 0.16} y={g.ground + 2 * g.s} s={g.s} w={230} />
        <BurmeseSoldier x={g.x + g.W * 0.3} y={g.ground + 4 * g.s} scale={g.sc * 0.9} pose="stand" hold="spear" />
      </g>
    )}
  </InsetPanel>
);

// Shot 3: the wall at Hua Ro gives way — cracks, then collapses in a dust burst on "พัง".
const CollapseScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const breach = interpolate(frame, [T.fall - 4, T.fall + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const shake = frame > T.fall - 4 && frame < T.fall + 12 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <InsetPanel id="collapse" anchor={HUARO} label="ภาพประกอบ" start={start} end={end} sky={["#0b1230", "#8a2f1a"]} font={font} top={0.47}>
      {(g) => (
        <g transform={`translate(${shake * g.s},0)`}>
          <Skyline g={g} color="#2a1a1f" burn={0.6} />
          <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#2b2016" />
          <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={95 * g.s} s={g.s} breach={breach} bx={g.x + g.W * 0.5} />
          {breach === 0 && <path d={`M${g.x + g.W * 0.5} ${g.ground - 90 * g.s} l${-8 * g.s} ${25 * g.s} l${12 * g.s} ${18 * g.s} l${-10 * g.s} ${30 * g.s}`} stroke="#3a2a20" strokeWidth={3 * g.s} fill="none" opacity={interpolate(frame, [start, T.fall], [0.2, 1], clamp)} />}
          <Dust x={g.x + g.W * 0.5} y={g.ground} s={g.s} k={interpolate(frame, [T.fall, T.fall + 30], [0, 1], clamp)} />
          {[0.12, 0.25, 0.8].map((fx, i) => <BurmeseSoldier key={i} x={g.x + g.W * fx} y={g.ground + 6 * g.s} scale={g.sc} pose="stand" hold={i === 1 ? "torch" : "spear"} phase={i} flip={fx > 0.5} />)}
        </g>
      )}
    </InsetPanel>
  );
};

// Shot 5: dawn — smoke columns over the burnt city.
const DawnScene = ({ start, end }: { start: number; end: number }) => (
  <InsetPanel id="dawn" anchor={AYUT} label="ภาพประกอบ" start={start} end={end} sky={["#6b5a73", "#f0a35e"]} font={font} top={0.47}>
    {(g) => (
      <g>
        <circle cx={g.x + g.W * 0.2} cy={g.ground - 60 * g.s} r={46 * g.s} fill="#ffd38a" opacity={0.9} />
        {[0.25, 0.5, 0.75].map((fx, i) => <Smoke key={i} x={g.x + g.W * fx} y={g.ground - 120 * g.s} size={200 * g.s} />)}
        <Skyline g={g} color="#3b2c2c" burn={0.35} />
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#4a3a2c" />
        <CityWall x0={g.x - 10 * g.s} x1={g.x + g.W + 10 * g.s} ground={g.ground} h={90 * g.s} s={g.s} breach={1} bx={g.x + g.W * 0.55} />
      </g>
    )}
  </InsetPanel>
);

// Shot 6: what is left — brick ruins.
const RuinScene = ({ start, end }: { start: number; end: number }) => (
  <InsetPanel id="ruin" anchor={AYUT} label="ภาพประกอบ" start={start} end={end} sky={["#7d8a99", "#d9c3a0"]} font={font} top={0.47}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#6b5a44" />
        {[0.18, 0.5, 0.82].map((fx, i) => <RuinedPrang key={i} x={g.x + g.W * fx} y={g.ground + 4 * g.s} h={(190 - i * 20) * g.s} s={g.s} />)}
        {[0.34, 0.66].map((fx, i) => <Smoke key={i} x={g.x + g.W * fx} y={g.ground - 40 * g.s} size={130 * g.s} />)}
      </g>
    )}
  </InsetPanel>
);

// Burmese assault arrows from the north-east into the island (approximate).
const StormArrows = ({ start }: { start: number }) => (
  <>
    <Arrow points={[[100.6, 14.4], [100.585, 14.375], [100.572, 14.362]]} start={start} end={start + 25} color={RED} width={20} />
    <Arrow points={[[100.61, 14.37], [100.59, 14.364], [100.575, 14.358]]} start={start + 8} end={start + 33} color={RED} width={16} />
  </>
);

const HEADS: [number, string, string][] = [
  [T.date, "7 เมษายน 2310", "คืนสุดท้ายของกรุงศรีฯ"],
  [T.wall, "หัวรอ · มุมตะวันออกเฉียงเหนือ", "กำแพงเมืองพังลงมา"],
  [T.storm, "ค่ำ 7 เมษายน 2310", "ทหารพม่าบุกเข้าเมือง"],
  [T.dawn, "เช้าวันรุ่งขึ้น", "ควันไฟทั่วเกาะเมือง"],
  [T.end, "พ.ศ. 1893 – 2310", "ราชธานีที่ไม่เหลืออีกแล้ว"],
];

const Card = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.date) return null;
  const idx = HEADS.filter(([f]) => frame >= f).length - 1;
  const [f0, tag, head] = HEADS[idx];
  const k = spring({ frame: frame - T.date, fps, config: { damping: 14 } });
  const swap = spring({ frame: frame - f0, fps, config: { damping: 16 } });
  const years = Math.round(interpolate(frame, [T.end + 6, T.end + 50], [0, 417], clamp));
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${RED}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{tag}</span>
      <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, transform: `translateY(${(1 - swap) * 14 * s}px)`, opacity: swap }}>{head}</div>
      {frame >= T.end && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s }}>
          <span style={{ fontSize: 96 * s, fontWeight: 900, color: "#ff6b5f", lineHeight: 1.15 }}>{years} ปี</span>
          <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{frame >= T.gone ? "จบลงในคืนเดียว" : "ราชธานีของสยาม"}</span>
        </div>
      )}
    </div>
  );
};

export const Open10 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const island = camForFeature(bbox([[100.52, 14.32], [100.62, 14.4]]), width, height, 0.02);
  const up = (c: Cam, frac: number): Cam => {
    const p = projectionFor(c, width, height);
    const [lon, lat] = p.invert!([width / 2, height / 2 + height * frac])!;
    return { lon, lat, scale: c.scale };
  };
  const z = (k: number, frac = 0.13) => up({ ...island, scale: island.scale * k }, frac);
  const cam = camAt(
    [
      { frame: 0, cam: z(1.35) },
      { frame: T.date, cam: z(1.15) },
      { frame: T.date + 30, cam: z(0.8) },
      { frame: T.storm, cam: z(0.85) },
      { frame: T.storm + 20, cam: z(1.3) },
      { frame: T.end, cam: z(1.3) },
      { frame: T.end + 40, cam: z(0.45, 0.12) },
      { frame: OPEN10_FRAMES, cam: z(0.4, 0.12) },
    ],
    frame,
  );
  const night = interpolate(frame, [T.dawn, T.dawn + 25], [1, 0.25], clamp);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.filter((b) => b.id === "hook" || b.id === "night").map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + 16}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sfx src={SFX.hit} at={0} volume={0.6} />
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.date - 6} volume={0.35} />
      <Sfx src={SFX.pop} at={T.wall} volume={0.3} />
      <Sfx src={SFX.hit} at={T.fall} volume={0.6} />
      <Sfx src={SFX.whoosh} at={T.storm - 4} volume={0.35} />
      <Sfx src={SFX.whoosh} at={T.dawn - 4} volume={0.3} />
      <Sfx src={SFX.tick} at={T.end + 6} volume={0.3} />
      <Sfx src={SFX.hit} at={T.gone} volume={0.45} />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "sea" }, { name: "plainhls" }, { name: "isle" }]} />
        <Rivers />
        <NightGrade k={night} fireAt={AYUT} />
        {frame >= T.dawn && <rect width={width} height={height} fill="#ff9a4a" opacity={interpolate(frame, [T.dawn, T.dawn + 25, T.end, T.end + 20], [0, 0.12, 0.12, 0], clamp)} />}
        <CityRing k={interpolate(frame, [T.date, T.date + 12], [0, 1], clamp) * interpolate(frame, [T.gone, T.gone + 15], [1, 0.35], clamp)} />
        {frame >= T.storm && frame < T.dawn + 10 && <StormArrows start={T.storm} />}
        <PointLabel at={HUARO} text="หัวรอ" start={T.wall} color={RED} size={0.8} />
        <StormScene id="hook" start={-12} end={T.date + 14} />
        <NightScene start={T.date} end={T.wall + 14} />
        <CollapseScene start={T.wall} end={T.storm + 14} />
        <StormScene id="storm" start={T.storm} end={T.dawn + 14} />
        <DawnScene start={T.dawn} end={T.end + 14} />
        <RuinScene start={T.end} end={OPEN10_FRAMES + 20} />
      </MapFrame>
      <HookTitle />
      {frame >= T.date - 4 && <TopBar chapter="คืนกรุงแตก" year={frame >= T.end ? "1893 – 2310" : "2310 · 7 เมษายน"} />}
      <Card />
      {BEATS.filter((b) => b.id === "night").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} />
      ))}
    </AbsoluteFill>
  );
};
