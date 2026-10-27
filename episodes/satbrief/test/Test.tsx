import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadPlexThai } from "@remotion/google-fonts/IBMPlexSansThai";
import type { Feature, FeatureCollection, LineString, Polygon } from "geojson";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, type Cam, type CamKey } from "../../../components/camera";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Bed, Sfx, SFX, lib, voiceSpans } from "../../../components/Sound";
import { buildBeats, cues, totalFrames } from "../../../components/subs.mjs";
import { useJson } from "../../../components/useJson";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ~16-second look test: "Satellite briefing" (analyst look) with the house storytelling.
// Real imagery graded to an analyst's grey, thin white measurement marks on real coordinates, dated plates swapped by
// a soft scan front, one amber reading per screen, colour back only where the story turns.
// Story: Wat Khun Samut Trawat (วัดขุนสมุทราวาส, Samut Prakan) — the 1988 shoreline ran past the temple; in 2025 the
// temple stands in the sea. Shorelines measured from Landsat NIR (see FACTS.md).

const sans = loadPlexThai("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
const num = loadBarlow("normal", { weights: ["300", "500"], subsets: ["latin"] }).fontFamily;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out3 = Easing.out(Easing.cubic);
const MARK = "#f2f5f6"; // white = measured
const AMBER = "#ffbe55"; // the one reading on screen
const HALO = "rgba(4,8,12,0.55)";
const GRADE = "grayscale(1) contrast(1.32) brightness(0.8)";

const LAYOUT = { lead: 3, gap: 8, tail: 66 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, n = 0) => {
  const b = B[id];
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : b.start;
};
export const SATBRIEF_TEST_FRAMES = totalFrames(BEATS, LAYOUT);
const END = SATBRIEF_TEST_FRAMES;

const TEMPLE: [number, number] = [100.5312, 13.507];
const RANGE = { lon: 100.5567, a: 13.50895, b: 13.51412, metres: 576 }; // 1988 → 2025 shoreline on one transect
const kmScale = (km: number) => (1080 * 6371) / km; // camera scale for a view `km` wide on a 1080-px-wide frame

// ---- timeline ----
const T = {
  lock: 2,
  pull: B.y1988.start,
  shore88: wf("y1988", "ชายฝั่ง"),
  rangeGo: wf("reading", "ถอย"),
  rangeLand: wf("reading", "เมตร"),
  turn: B.turn.start,
  colour: wf("turn", "เหลือ"),
  five: wf("turn", "ห้า"),
  climb: B.turn.end + 10,
};

type Scan = { at: number; dur: number; from: number; to: number; dir: 1 | -1 };
const s1: Scan = { at: B.y1988.start + 10, dur: 30, from: 2025, to: 1988, dir: -1 }; // rewind: south → north
const s2: Scan = { at: wf("rings", "ทะเล"), dur: 22, from: 1988, to: 2000, dir: 1 };
const s3: Scan = { at: Math.max(wf("rings", "กิน"), s2.at + s2.dur + 2), dur: 17, from: 2000, to: 2010, dir: 1 };
const s4: Scan = { at: Math.max(wf("rings", "ที"), s3.at + s3.dur + 2), dur: 13, from: 2010, to: 2025, dir: 1 };
const SCANS = [s1, s2, s3, s4];
const YEARS = [1988, 2000, 2010, 2025];
const SCENE: Record<number, string> = {
  1988: "LANDSAT 5 · 1988-12-27",
  2000: "LANDSAT 5 · 2000-02-28",
  2010: "LANDSAT 5 · 2010-02-23",
  2025: "LANDSAT 8 · 2025-01-15",
};

const scanAt = (f: number) => {
  let base = 2025;
  for (const s of SCANS) {
    if (f >= s.at + s.dur) base = s.to;
    else if (f >= s.at) return { base: s.from, scan: s, p: interpolate(f, [s.at, s.at + s.dur], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }) };
  }
  return { base, scan: null as Scan | null, p: 0 };
};
// When each year's shoreline is printed (behind its scan front).
const outlineAt: Record<number, number> = { 1988: T.shore88, 2000: s2.at, 2010: s3.at, 2025: s4.at };

const KEYS: CamKey[] = [
  { frame: 0, cam: { lon: TEMPLE[0], lat: TEMPLE[1] + 0.0004, scale: kmScale(2.5) } },
  { frame: T.pull, cam: { lon: TEMPLE[0], lat: TEMPLE[1] + 0.0004, scale: kmScale(2.25) }, easing: (t) => t },
  { frame: T.pull + 36, cam: { lon: 100.531, lat: 13.5105, scale: kmScale(6.6) } },
  { frame: B.reading.start, cam: { lon: 100.532, lat: 13.5105, scale: kmScale(6.1) }, easing: (t) => t },
  { frame: B.reading.start + 28, cam: { lon: 100.5485, lat: 13.5107, scale: kmScale(3.1) } },
  { frame: T.turn, cam: { lon: 100.5482, lat: 13.5107, scale: kmScale(2.95) }, easing: (t) => t },
  { frame: T.turn + 34, cam: { lon: 100.5345, lat: 13.5096, scale: kmScale(4.3) } },
  { frame: T.climb, cam: { lon: 100.5343, lat: 13.5094, scale: kmScale(4.0) }, easing: (t) => t },
  { frame: END - 8, cam: { lon: 100.53, lat: 13.51, scale: kmScale(30) }, easing: Easing.inOut(Easing.cubic) },
];
const FOCUS = 0.444;

// ---- imagery ----
const PLATE = (y: number) => `kscn-y${y}`;
// s2 (10 m) is the close-up of 2025; it fades out as the camera pulls back past its edges.
const s2Opacity = (cam: Cam) => interpolate(Math.log(cam.scale), [Math.log(kmScale(5.2)), Math.log(kmScale(3.6))], [0, 1], clamp);

// The world plate is its own Raster (coarse grid); the small plates use a fine grid so the 0.1° tiles still bend.
const Plates = ({ cam, year, wide }: { cam: Cam; year: number; wide: boolean }) => (
  <MapFrame cam={cam} focusY={FOCUS}>
    {wide && cam.scale < kmScale(25) ? <Raster layers={[{ name: "world" }]} /> : null}
    <Raster
      cell={0.06}
      layers={[
        { name: "kscn-region", opacity: wide && cam.scale < kmScale(5) ? 1 : 0 },
        ...YEARS.map((y) => ({ name: PLATE(y), opacity: y === year ? 1 : 0 })),
        { name: "kscn-s2", opacity: year === 2025 ? s2Opacity(cam) : 0 },
      ]}
    />
  </MapFrame>
);

// Soft scan front (a satellite pass, never a hairline): what is behind the front shows the new date.
const frontY = (scan: Scan, p: number, H: number) => (scan.dir === 1 ? -120 + p * (H + 240) : H + 120 - p * (H + 240));
const scanMask = (scan: Scan, p: number, H: number): CSSProperties => {
  const y = frontY(scan, p, H);
  const g = scan.dir === 1 ? `linear-gradient(to bottom, #000 ${y - 70}px, transparent ${y + 70}px)` : `linear-gradient(to top, #000 ${H - y - 70}px, transparent ${H - y + 70}px)`;
  return { WebkitMaskImage: g, maskImage: g };
};

const Ground = ({ cam }: { cam: Cam }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const { base, scan, p } = scanAt(frame);
  return (
    <AbsoluteFill style={{ filter: GRADE }}>
      <AbsoluteFill>
        <Plates cam={cam} year={base} wide />
      </AbsoluteFill>
      {scan ? (
        <AbsoluteFill style={scanMask(scan, p, height)}>
          <Plates cam={cam} year={scan.to} wide={false} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// Cool toning over the grey + vignette (the analyst's grade).
const Tone = () => (
  <>
    <AbsoluteFill style={{ background: "#5d7b8c", mixBlendMode: "color", opacity: 0.22 }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 44%, transparent 45%, rgba(3,6,9,0.6) 100%)" }} />
  </>
);

const ScanBand = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const { scan, p } = scanAt(frame);
  if (!scan) return null;
  const y = frontY(scan, p, height);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 60, height: 120, background: "linear-gradient(to bottom, transparent, rgba(220,235,245,0.16) 50%, transparent)" }} />
    </AbsoluteFill>
  );
};

// ---- colour returns where the story turns: the land lost since 1988, in the 1988 picture's true colour ----
const LostLand = ({ cam }: { cam: Cam }) => {
  const frame = useCurrentFrame();
  const shores = useJson<FeatureCollection>("data/satbrief-shores.json");
  const k = interpolate(frame, [T.colour, T.colour + 16], [0, 1], clamp) * interpolate(frame, [T.climb + 4, T.climb + 30], [1, 0], clamp);
  if (k <= 0 || !shores) return null;
  const lost = shores.features.find((f) => f.properties?.year === "lost") as Feature<Polygon>;
  return <LostClip cam={cam} lost={lost} k={k} />;
};
const LostClip = ({ cam, lost, k }: { cam: Cam; lost: Feature<Polygon>; k: number }) => (
  <MapFrame cam={cam} focusY={FOCUS}>
    <LostPath lost={lost} k={k} />
  </MapFrame>
);
const LostPath = ({ lost, k }: { lost: Feature<Polygon>; k: number }) => {
  const { path, width, height } = useMap();
  const d = path(lost) ?? "";
  return (
    <foreignObject x={0} y={0} width={width} height={height} opacity={k}>
      <div style={{ position: "absolute", inset: 0, clipPath: `path('${d}')`, filter: "saturate(0.85) contrast(1.05)" }}>
        <PlainPlate />
      </div>
    </foreignObject>
  );
};
// The 1988 plate drawn with the current camera (re-read from the outer MapFrame).
const PlainPlate = () => {
  const { cam } = useMap();
  return <Plates cam={cam} year={1988} wide={false} />;
};

// ---- marks (hairlines on the ground) ----
const draw = (frame: number, at: number, dur = 22) => interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: out3 });

const Shorelines = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const shores = useJson<FeatureCollection<LineString | Polygon>>("data/satbrief-shores.json");
  if (!shores) return null;
  const latest = [...YEARS].reverse().find((y) => frame >= outlineAt[y]) ?? 0;
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {YEARS.map((y) => {
        const f = shores.features.find((x) => x.properties?.year === y);
        if (!f || frame < outlineAt[y]) return null;
        const p = y === 1988 ? draw(frame, outlineAt[y], 24) : interpolate(frame, [outlineAt[y] + 4, outlineAt[y] + 16], [0, 1], clamp);
        const d = path(f) ?? "";
        const isHist = y === 1988;
        const o = y === latest || isHist ? 1 : 0.42;
        const id = `m${y}`;
        return (
          <g key={y} opacity={o * interpolate(frame, [T.climb + 10, END - 24], [1, 0], clamp)}>
            {isHist ? (
              <>
                <defs>
                  <mask id={id} maskUnits="userSpaceOnUse">
                    <path d={d} pathLength={1} stroke="#fff" strokeWidth={14 * s} strokeDasharray={`${p} 1`} />
                  </mask>
                </defs>
                <g mask={`url(#${id})`}>
                  <path d={d} stroke={HALO} strokeWidth={5.5 * s} />
                  <path d={d} stroke={MARK} strokeWidth={2.4 * s} strokeDasharray={`${10 * s} ${7 * s}`} />
                </g>
              </>
            ) : (
              <g opacity={p}>
                <path d={d} stroke={HALO} strokeWidth={4.5 * s} />
                <path d={d} stroke={MARK} strokeWidth={y === 2025 ? 2.4 * s : 1.6 * s} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// Year tags at the west end of each printed shoreline.
const YearTags = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const shores = useJson<FeatureCollection<LineString>>("data/satbrief-shores.json");
  if (!shores || frame > T.climb + 20) return null;
  const tag = (y: number, lon: number, below: boolean) => {
    const f = shores.features.find((x) => x.properties?.year === y);
    if (!f || frame < outlineAt[y] + 8) return null;
    const pt = f.geometry.coordinates.reduce((b, c) => (Math.abs(c[0] - lon) < Math.abs(b[0] - lon) ? c : b));
    const [x, yy] = projection(pt as [number, number]) as [number, number];
    const k = interpolate(frame, [outlineAt[y] + 8, outlineAt[y] + 16], [0, 1], clamp);
    return (
      <text key={y} x={x} y={yy + (below ? 34 : -14) * s} opacity={k} fontFamily={mono} fontWeight={500} fontSize={24 * s} fill={MARK} stroke={HALO} strokeWidth={4 * s} paintOrder="stroke" textAnchor="middle">
        {y + 543}
      </text>
    );
  };
  return <g>{[tag(1988, 100.492, true), tag(2025, 100.492, false)]}</g>;
};

// Lock-on brackets on the temple, with a leader to its name.
const Reticle = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const [x, y] = projection(TEMPLE) as [number, number];
  const k = interpolate(frame, [T.lock, T.lock + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const gone = interpolate(frame, [T.climb, T.climb + 14], [1, 0], clamp);
  if (k <= 0 || gone <= 0) return null;
  const r = (54 + (1 - k) * 60) * s;
  const c = 18 * s;
  const corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const labelK = interpolate(frame, [T.lock + 6, T.lock + 14], [0, 1], clamp) * gone;
  const lx = x - 70 * s;
  const ly = y - 150 * s;
  return (
    <g opacity={gone}>
      {corners.map(([sx, sy], i) => (
        <path key={i} d={`M${x + sx * r},${y + sy * (r - c)} L${x + sx * r},${y + sy * r} L${x + sx * (r - c)},${y + sy * r}`} fill="none" stroke={MARK} strokeWidth={2.4 * s} opacity={k} style={{ filter: `drop-shadow(0 0 ${3 * s}px ${HALO})` }} />
      ))}
      <circle cx={x} cy={y} r={3 * s} fill={MARK} opacity={k} />
      <g opacity={labelK}>
        <path d={`M${x - r * 0.7},${y - r * 0.7} L${lx},${ly}`} stroke={MARK} strokeWidth={1.6 * s} fill="none" />
        <text x={lx - 8 * s} y={ly - 14 * s} textAnchor="end" fontFamily={sans} fontWeight={600} fontSize={34 * s} fill={MARK} stroke={HALO} strokeWidth={5 * s} paintOrder="stroke">
          วัดขุนสมุทราวาส
        </text>
        <text x={lx - 8 * s} y={ly + 20 * s} textAnchor="end" fontFamily={mono} fontSize={21 * s} fill={MARK} opacity={0.85} stroke={HALO} strokeWidth={4 * s} paintOrder="stroke">
          13.507°N 100.531°E
        </text>
      </g>
    </g>
  );
};

// Ticked range line from the 1988 shore to the 2025 shore on one transect; the tip grows north.
const RangeLine = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < T.rangeGo) return null;
  const p = interpolate(frame, [T.rangeGo, T.rangeLand], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const gone = interpolate(frame, [T.turn + 4, T.turn + 18], [1, 0], clamp);
  const [x, y0] = projection([RANGE.lon, RANGE.a]) as [number, number];
  const [, y1] = projection([RANGE.lon, RANGE.b]) as [number, number];
  const yt = y0 + (y1 - y0) * p;
  const ticks = Math.floor((RANGE.metres * p) / 100);
  const pxPer100 = (y1 - y0) / (RANGE.metres / 100);
  return (
    <g opacity={gone}>
      <line x1={x} y1={y0} x2={x} y2={yt} stroke={HALO} strokeWidth={5 * s} />
      <line x1={x} y1={y0} x2={x} y2={yt} stroke={MARK} strokeWidth={2.2 * s} />
      {Array.from({ length: ticks + 1 }, (_, i) => (
        <line key={i} x1={x - 9 * s} x2={x + 9 * s} y1={y0 + i * pxPer100} y2={y0 + i * pxPer100} stroke={MARK} strokeWidth={1.6 * s} />
      ))}
      <line x1={x - 22 * s} x2={x + 22 * s} y1={y0} y2={y0} stroke={MARK} strokeWidth={2.4 * s} />
      <line x1={x - 22 * s} x2={x + 22 * s} y1={yt} y2={yt} stroke={AMBER} strokeWidth={2.6 * s} />
    </g>
  );
};

// ---- screen-space instruments ----
const useS = () => {
  const { width, height } = useVideoConfig();
  return { s: Math.min(width, height) / 1080, width, height };
};

const roll = (frame: number, a: number, b: number, from: number, to: number) => Math.round(interpolate(frame, [a, b], [from, to], { ...clamp, easing: out3 }));

// Year readout (Buddhist Era big, CE + scene id small); rolls during each scan.
const YearReadout = () => {
  const frame = useCurrentFrame();
  const { s } = useS();
  const k = interpolate(frame, [B.hook.end - 2, B.hook.end + 10], [0, 1], clamp) * interpolate(frame, [T.climb, T.climb + 12], [1, 0], clamp);
  if (k <= 0) return null;
  const { base, scan, p } = scanAt(frame);
  const year = scan ? Math.round(scan.from + (scan.to - scan.from) * p) : base;
  const sceneYear = scan ? (p > 0.5 ? scan.to : scan.from) : base;
  return (
    <div style={{ position: "absolute", left: 64 * s, top: 118 * s, opacity: k, color: MARK, textShadow: `0 0 ${10 * s}px ${HALO}` }}>
      <div style={{ fontFamily: mono, fontSize: 22 * s, letterSpacing: 1, opacity: 0.85 }}>{SCENE[sceneYear]}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s }}>
        <span style={{ fontFamily: num, fontWeight: 300, fontSize: 132 * s, lineHeight: 1 }}>{year + 543}</span>
        <span style={{ fontFamily: mono, fontSize: 24 * s, opacity: 0.8 }}>ค.ศ. {year}</span>
      </div>
    </div>
  );
};

// Altitude + scale bar from the same camera.
const Instruments = ({ cam }: { cam: Cam }) => {
  const { s, width } = useS();
  const viewKm = (width * 6371) / cam.scale;
  const alt = viewKm * 0.866;
  const pxPerKm = cam.scale / 6371;
  const nice = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50].find((km) => km * pxPerKm >= 110 * s) ?? 50;
  const bar = nice * pxPerKm;
  return (
    <div style={{ position: "absolute", right: 64 * s, top: 124 * s, textAlign: "right", color: MARK, fontFamily: mono, fontSize: 22 * s, textShadow: `0 0 ${8 * s}px ${HALO}` }}>
      <div style={{ opacity: 0.85 }}>ALT {alt < 10 ? alt.toFixed(1) : Math.round(alt)} KM</div>
      <div style={{ marginTop: 14 * s, display: "inline-block" }}>
        <div style={{ width: bar, height: 8 * s, borderLeft: `${2 * s}px solid ${MARK}`, borderRight: `${2 * s}px solid ${MARK}`, borderBottom: `${2 * s}px solid ${MARK}` }} />
        <div style={{ marginTop: 6 * s }}>{nice < 1 ? `${nice * 1000} M` : `${nice} KM`}</div>
      </div>
    </div>
  );
};

// Hook title: the shock line, on screen at frame 0.
const HookTitle = () => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  const o = interpolate(frame, [B.hook.end, B.hook.end + 10], [1, 0], clamp);
  if (o <= 0) return null;
  const pop = 1 + 0.05 * Math.max(0, 1 - frame / 8);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.085, opacity: o }}>
      <div style={{ transform: `scale(${pop})`, textAlign: "center", fontFamily: sans, fontWeight: 700, color: MARK, fontSize: 104 * s, lineHeight: 1.25, textShadow: `0 ${4 * s}px ${28 * s}px rgba(0,0,0,0.85)` }}>
        วัดนี้
        <br />
        เคยอยู่<span style={{ color: AMBER }}>บนบก</span>
      </div>
    </AbsoluteFill>
  );
};

// One finding per screen, in the right third: label above, amber number, source note below.
const Reading = ({ from, to, label, value, unit, note }: { from: number; to: number; label: string; value: ReactNode; unit: string; note: string }) => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  const k = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], clamp);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", right: 64 * s, top: height * 0.6, textAlign: "right", opacity: k, color: MARK, textShadow: `0 0 ${12 * s}px ${HALO}` }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 32 * s }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 10 * s, color: AMBER }}>
        <span style={{ fontFamily: num, fontWeight: 500, fontSize: 150 * s, lineHeight: 1.02 }}>{value}</span>
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 44 * s }}>{unit}</span>
      </div>
      <div style={{ fontFamily: mono, fontSize: 20 * s, opacity: 0.8, marginTop: 4 * s }}>{note}</div>
    </div>
  );
};

const LandingPop = ({ at, children }: { at: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const k = 1 + 0.08 * interpolate(frame, [at, at + 3, at + 12], [0, 1, 0], clamp);
  return <span style={{ display: "inline-block", transform: `scale(${k})`, transformOrigin: "right bottom" }}>{children}</span>;
};

// Transcript strip at the bottom left: 2 px white rule, dark plate fading right, one line.
const Transcript = () => {
  const frame = useCurrentFrame();
  const { s, height } = useS();
  const b = BEATS.find((x) => frame >= x.start && frame < x.end + 6);
  if (!b || b.id === "hook") return null;
  const list = cues({ text: b.text, spoken: b.spoken, words: b.words, sec: b.len / 30, maxChars: 22 });
  const t = (frame - b.start) / 30;
  const cue = list.find((c) => t < c.end) ?? list[list.length - 1];
  const k = interpolate(frame - b.start, [0, 4], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, top: height * 0.775, opacity: k }}>
      <div style={{ marginLeft: 64 * s, width: 64 * s, height: 2 * s, background: MARK }} />
      <div style={{ padding: `${14 * s}px ${120 * s}px ${16 * s}px ${64 * s}px`, background: "linear-gradient(to right, rgba(4,8,12,0.78) 60%, transparent)", fontFamily: sans, fontWeight: 600, fontSize: 56 * s, color: MARK, whiteSpace: "nowrap" }}>
        {cue.text}
      </div>
    </div>
  );
};

// Ending: the reticle opens out into a title card while the camera climbs.
const EndCard = () => {
  const frame = useCurrentFrame();
  const { s, height, width } = useS();
  const k = interpolate(frame, [T.climb + 20, T.climb + 36], [0, 1], { ...clamp, easing: out3 });
  if (k <= 0) return null;
  const w = 760 * s * (0.6 + 0.4 * k);
  const h = 230 * s * (0.6 + 0.4 * k);
  const x = (width - w) / 2;
  const y = height * 0.6;
  const c = 26 * s;
  const br = (d: string, i: number) => <path key={i} d={d} fill="none" stroke={MARK} strokeWidth={2.4 * s} />;
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: k }}>
        {[
          `M${x},${y + c} L${x},${y} L${x + c},${y}`,
          `M${x + w - c},${y} L${x + w},${y} L${x + w},${y + c}`,
          `M${x},${y + h - c} L${x},${y + h} L${x + c},${y + h}`,
          `M${x + w - c},${y + h} L${x + w},${y + h} L${x + w},${y + h - c}`,
        ].map(br)}
      </svg>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: k, color: MARK, textShadow: `0 0 ${14 * s}px ${HALO}` }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 76 * s }}>ทะเลกินแผ่นดิน</div>
        <div style={{ fontFamily: mono, fontSize: 24 * s, opacity: 0.85, marginTop: 6 * s }}>SAMUT PRAKAN · อ่าวไทยตอนบน</div>
      </div>
    </AbsoluteFill>
  );
};

const Marks = ({ cam }: { cam: Cam }) => (
  <MapFrame cam={cam} focusY={FOCUS}>
    <Shorelines />
    <YearTags />
    <RangeLine />
    <Reticle />
  </MapFrame>
);

// ---- sound: recorded sea + wind beds, UI ticks for the analyst's instruments, score from scripts ----
const VO = voiceSpans(BEATS);
const Soundtrack = () => (
  <>
    {BEATS.map((b) => (
      <Sequence key={b.id} from={b.start} layout="none">
        <Html5Audio src={staticFile(b.file)} />
      </Sequence>
    ))}
    <Html5Audio src={staticFile("audio/satbrief/test/score.wav")} volume={0.55} />
    <Bed id="sea_rough" from={0} to={T.turn - 14} volume={0.16} voice={VO} />
    <Bed id="sea_rough" from={T.turn + 2} to={END} volume={0.18} voice={VO} fade={14} />
    <Bed id="wind" from={0} to={END} volume={0.07} voice={VO} />
    <Sfx src={SFX.pop} at={T.lock} volume={0.45} />
    {SCANS.map((sc, i) => (
      <Sfx key={i} src={SFX.whoosh} at={sc.at - 4} volume={sc.dir === -1 ? 0.35 : 0.22} />
    ))}
    <Sfx src={SFX.tick} at={T.shore88} volume={0.3} />
    <Sfx src={lib("tape_extend")} at={T.rangeGo} volume={0.3} />
    <Sfx src={SFX.hit} at={T.rangeLand} volume={0.4} />
    <Sfx src={SFX.hit} at={T.five} volume={0.5} />
    <Sfx src={SFX.whoosh} at={T.climb - 4} volume={0.3} />
    <Sfx src={SFX.swell} at={T.climb + 14} volume={0.25} />
  </>
);

export const SatBriefTest = () => {
  const frame = useCurrentFrame();
  const cam = camAt(KEYS, frame);
  return (
    <AbsoluteFill style={{ backgroundColor: "#06090c" }}>
      <Ground cam={cam} />
      <LostLand cam={cam} />
      <Tone />
      <ScanBand />
      <Marks cam={cam} />
      <YearReadout />
      <Instruments cam={cam} />
      <HookTitle />
      <Reading
        from={T.rangeGo}
        to={T.turn + 8}
        label="ชายฝั่งถอยร่น 2531 → 2568"
        value={<LandingPop at={T.rangeLand}>{roll(frame, T.rangeGo, T.rangeLand, 0, RANGE.metres)}</LandingPop>}
        unit="ม."
        note="วัดจาก LANDSAT · ±30 M"
      />
      <Reading
        from={T.turn + 10}
        to={T.climb + 8}
        label="ที่ดินวัด"
        value={<LandingPop at={T.five}>{roll(frame, T.colour, T.five, 76, 5)}</LandingPop>}
        unit="ไร่"
        note="จาก 76 ไร่ · ที่มา: วิกิพีเดีย"
      />
      <Transcript />
      <EndCard />
      <Soundtrack />
    </AbsoluteFill>
  );
};
