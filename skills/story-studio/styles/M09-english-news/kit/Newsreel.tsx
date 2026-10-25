import { loadFont as loadLimelight } from "@remotion/google-fonts/Limelight";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadTrirong } from "@remotion/google-fonts/Trirong";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { countries } from "../../../components/data";
import type { InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { useJson } from "../../../components/useJson";

// M09 cinema newsreel (1940s): everything in black & white film — grain that changes every frame, vertical
// scratches, dust, exposure flicker, gate weave, a heavy vignette and rounded gate corners. The map is a b/w
// animated map (grey land, dark sea, white coast, dashed borders) with a bold white arrow outlined in black. Shots
// are separated by art-deco title cards (sunburst, stepped double rules, Limelight capitals). English on screen;
// the kicker is Thai in Trirong. Illustration shots are full-frame re-enactments marked "ILLUSTRATION".
export const deco = loadLimelight("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const serif = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin"] }).fontFamily;
export const thai = loadTrirong("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const INK = "#0e0e0e";
export const PAPER = "#f2efe6";
export const SILVER = "#bdbab2";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// The film: b/w grade + flicker + gate weave on everything inside, then grain, scratches, dust, vignette, gate.
export const Film = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const flick = 1 + (random(`fl${frame}`) - 0.5) * 0.12 + Math.sin(frame * 0.7) * 0.02;
  const wx = (random(`wx${Math.floor(frame / 2)}`) - 0.5) * 3 * s + Math.sin(frame * 0.21) * 1.5 * s;
  const wy = (random(`wy${frame}`) - 0.5) * 4 * s + Math.sin(frame * 0.13) * 2 * s;
  const scratches = Array.from({ length: 4 }, (_, i) => {
    const life = Math.floor(frame / (6 + i * 3));
    const on = random(`son${i}-${life}`) > 0.45;
    return on ? { x: random(`sx${i}-${life}`) * width + Math.sin(frame * 0.4 + i) * 6 * s, w: (0.8 + random(`sw${i}-${life}`) * 2) * s, o: 0.25 + random(`so${i}-${frame}`) * 0.35, dark: random(`sd${i}-${life}`) > 0.5 } : null;
  });
  const dust = Array.from({ length: 7 }, (_, i) => (random(`d${i}-${frame}`) > 0.55 ? { x: random(`dx${i}-${frame}`) * width, y: random(`dy${i}-${frame}`) * height, r: (2 + random(`dr${i}-${frame}`) * 7) * s, dark: random(`dk${i}-${frame}`) > 0.4 } : null));
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `grayscale(1) contrast(1.15) brightness(${flick * 1.08})`, transform: `translate(${wx}px,${wy}px) scale(1.012)` }}>{children}</AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="m09-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={frame % 97} />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  1.8 0 0 0 -0.62" />
          </filter>
          <radialGradient id="m09-vig" cx="50%" cy="50%" r="72%">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="0.85" stopColor="#000" stopOpacity={0.45} />
            <stop offset="1" stopColor="#000" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <rect width={width} height={height} filter="url(#m09-grain)" style={{ mixBlendMode: "overlay" }} opacity={0.9} />
        {scratches.map((c, i) => c && <rect key={i} x={c.x} y={0} width={c.w} height={height} fill={c.dark ? "#000" : "#fff"} opacity={c.o} />)}
        {dust.map((d, i) => d && <ellipse key={i} cx={d.x} cy={d.y} rx={d.r} ry={d.r * 0.6} fill={d.dark ? "#000" : "#fff"} opacity={0.6} transform={`rotate(${i * 40} ${d.x} ${d.y})`} />)}
        <rect width={width} height={height} fill="url(#m09-vig)" />
        <path d={`M0 0 H${width} V${height} H0 Z M${18 * s} ${70 * s} Q${18 * s} ${18 * s} ${70 * s} ${18 * s} H${width - 70 * s} Q${width - 18 * s} ${18 * s} ${width - 18 * s} ${70 * s} V${height - 70 * s} Q${width - 18 * s} ${height - 18 * s} ${width - 70 * s} ${height - 18 * s} H${70 * s} Q${18 * s} ${height - 18 * s} ${18 * s} ${height - 70 * s} Z`} fill="#000" fillRule="evenodd" />
      </svg>
    </AbsoluteFill>
  );
};

// The b/w animated map: imagery pushed to grey, dark sea, white coastlines, dashed borders, rivers in white.
export const BWMap = ({ layers = ["world", "europe"] }: { layers?: string[] }) => {
  const { path, s } = useMap();
  return (
    <g>
      <g style={{ filter: "grayscale(1) brightness(1.2) contrast(1.05)" }}>
        <Raster layers={layers.map((name) => ({ name }))} />
      </g>
      <path d={path(countries) ?? ""} fill="#b9b6ae" fillOpacity={0.62} />
      <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeWidth={3.2 * s} strokeOpacity={0.9} />
      <path d={path(countries) ?? ""} fill="none" stroke={INK} strokeWidth={1.6 * s} strokeDasharray={`${10 * s} ${7 * s}`} />
    </g>
  );
};

export const Rivers = ({ file = "data/eu-rivers.json", hi = {} }: { file?: string; hi?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const data = useJson<{ rivers: FeatureCollection<LineString | MultiLineString, { name: string }> }>(file);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.004, 1.6 * s), 6 * s);
  const all = data?.rivers?.features ?? [];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map((f, i) => <path key={i} d={path(f) ?? ""} stroke="#fff" strokeWidth={w * (1 + 1.6 * (hi[f.properties.name] ?? 0))} strokeOpacity={0.55 + 0.45 * (hi[f.properties.name] ?? 0)} />)}
    </g>
  );
};

// Bold newsreel arrow: white body with a black outline, growing along a lon/lat polyline (k 0 → 1 by length).
export const BoldArrow = ({ pts, k }: { pts: [number, number][]; k: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = pts.map((p) => projection(p) ?? [0, 0]);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  let left = Math.min(1, k) * seg.reduce((a, b) => a + b, 0);
  const out: [number, number][] = [xy[0] as [number, number]];
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / (seg[i] || 1));
    out.push([xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t]);
    left -= seg[i];
  }
  const [a, b] = [out[Math.max(0, out.length - 2)], out[out.length - 1]];
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const back = 30 * s;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const end: [number, number] = [b[0] - ((b[0] - a[0]) / L) * back, b[1] - ((b[1] - a[1]) / L) * back];
  const d = `M${[...out.slice(0, -1), end].map((p) => p.join(",")).join(" L")}`;
  const head = `M${40 * s} 0 L${-14 * s} ${-36 * s} L${-14 * s} ${36 * s} Z`;
  return (
    <g strokeLinejoin="round">
      <path d={d} fill="none" stroke={INK} strokeWidth={34 * s} strokeLinecap="butt" />
      <path d={d} fill="none" stroke="#fff" strokeWidth={22 * s} strokeLinecap="butt" />
      <path transform={`translate(${end[0]},${end[1]}) rotate(${ang})`} d={head} fill="#fff" stroke={INK} strokeWidth={6 * s} />
    </g>
  );
};

// Place: white dot in a black ring, name in Limelight capitals with a black outline.
export const Place = ({ at, text, k, size = 1, dy = -34 }: { at: [number, number]; text: string; k: number; size?: number; dy?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const xy = projection(at);
  if (!xy) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={k}>
      <circle r={13 * s} fill="#fff" stroke={INK} strokeWidth={6 * s} />
      <text y={dy * s} textAnchor="middle" fontFamily={deco} fontSize={46 * s * size} fill="#fff" stroke={INK} strokeWidth={10 * s} paintOrder="stroke" strokeLinejoin="round" letterSpacing={2 * s}>{text.toUpperCase()}</text>
    </g>
  );
};

// Sunburst + stepped double-rule deco frame, drawn behind a title card.
const DecoFrame = ({ width, height, s, k }: { width: number; height: number; s: number; k: number }) => {
  const cx = width / 2, cy = height * 0.5;
  const rays = 36;
  const m = 70 * s;
  const step = 34 * s;
  const frameP = (o: number) => `M${m + o + step} ${m + o} H${width - m - o - step} V${m + o + step} H${width - m - o} V${height - m - o - step} H${width - m - o - step} V${height - m - o} H${m + o + step} V${height - m - o - step} H${m + o} V${m + o + step} H${m + o + step} Z`;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="m09-card" cx="50%" cy="50%" r="65%">
          <stop offset="0" stopColor="#3a3936" />
          <stop offset="1" stopColor="#0b0b0b" />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#m09-card)" />
      <g opacity={0.22 * k}>
        {Array.from({ length: rays }, (_, i) => {
          const a = (i / rays) * Math.PI * 2 + k * 0.08;
          const a2 = a + Math.PI / rays / 1.6;
          const R = Math.max(width, height);
          return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R} L${cx + Math.cos(a2) * R} ${cy + Math.sin(a2) * R} Z`} fill={PAPER} />;
        })}
      </g>
      <path d={frameP(0)} fill="none" stroke={PAPER} strokeWidth={5 * s} opacity={k} />
      <path d={frameP(16 * s)} fill="none" stroke={PAPER} strokeWidth={2 * s} opacity={k} />
      {[0.33, 0.67].map((f) => <line key={f} x1={width * 0.3} x2={width * 0.7} y1={height * f} y2={height * f} stroke={PAPER} strokeWidth={2 * s} opacity={k * 0.7} />)}
    </svg>
  );
};

// Art-deco title card (full screen) between shots: kicker line, big capitals, sub line. Cut in, cut out.
export const TitleCard = ({ from, to, over, title, sub }: { from: number; to: number; over?: string; title: string; sub?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame >= to) return null;
  const k = ramp(frame, from, from + 14, Easing.out(Easing.quad));
  const vertical = height > width;
  return (
    <AbsoluteFill>
      <DecoFrame width={width} height={height} s={s} k={k} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: PAPER, padding: `0 ${130 * s}px` }}>
        {over && <div style={{ fontFamily: serif, fontWeight: 700, fontStyle: "italic", fontSize: 46 * s, letterSpacing: 2 * s, opacity: k }}>{over}</div>}
        <div style={{ fontFamily: deco, fontSize: (vertical ? 150 : 130) * s, lineHeight: 1.05, letterSpacing: 4 * s, margin: `${20 * s}px 0`, transform: `scale(${0.94 + 0.06 * k})`, textShadow: `0 ${4 * s}px 0 #000` }}>{title}</div>
        {sub && <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 52 * s, letterSpacing: 10 * s, opacity: k }}>{sub}</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Superimposed caption over the map: deco number + serif label, centred band with rules (fades in).
export const Super = ({ from, to, value, label }: { from: number; to: number; value: string; label: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const o = interpolate(frame, [from, from + 10, to - 8, to], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? height * 0.1 : 50 * s, padding: `${26 * s}px 0`, textAlign: "center", color: PAPER, opacity: o, background: "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.72) 20%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0))", textShadow: `0 ${3 * s}px 0 #000` }}>
      <div style={{ width: 420 * s, height: 3 * s, background: PAPER, margin: "0 auto", boxShadow: `0 ${7 * s}px 0 -${1 * s}px ${PAPER}` }} />
      <div style={{ fontFamily: deco, fontSize: 168 * s, lineHeight: 1.1, marginTop: 14 * s }}>{value}</div>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 44 * s, letterSpacing: 8 * s }}>{label.toUpperCase()}</div>
      <div style={{ width: 420 * s, height: 3 * s, background: PAPER, margin: `${14 * s}px auto 0`, boxShadow: `0 -${7 * s}px 0 -${1 * s}px ${PAPER}` }} />
    </div>
  );
};

// Full-frame re-enactment shot: draws children on a whole-screen InsetGeom, marked "ILLUSTRATION".
export const Shot = ({ from, to, sky, children }: { from: number; to: number; sky: [string, string]; children: (g: InsetGeom) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame >= to) return null;
  const vertical = height > width;
  const k = width / (vertical ? 640 : 980);
  const g: InsetGeom = { x: 0, y: vertical ? height * 0.3 : 0, W: width, H: vertical ? height * 0.7 : height, ground: vertical ? height * 0.64 : height * 0.72, cx: width / 2, s: s * k * (vertical ? 1 : 0.6), sc: 1.55 * s * k * (vertical ? 1 : 0.6), vertical, frame };
  const push = 1 + interpolate(frame, [from, to], [0, 0.06], clamp);
  return (
    <AbsoluteFill>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id={`m09-sky-${from}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky[0]} />
            <stop offset="1" stopColor={sky[1]} />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill={`url(#m09-sky-${from})`} />
        <g transform={`translate(${width / 2},${g.ground}) scale(${push}) translate(${-width / 2},${-g.ground})`}>{children(g)}</g>
        <text x={width - 70 * s} y={g.ground + 150 * s} textAnchor="end" fontFamily={serif} fontWeight={900} fontSize={26 * s} letterSpacing={6 * s} fill={PAPER} stroke="#000" strokeWidth={5 * s} paintOrder="stroke">ILLUSTRATION</text>
      </svg>
    </AbsoluteFill>
  );
};

// Quiz on a deco card: question, three options, a 3-2-1 count, then the answer is boxed.
export const Quiz = ({ from, to, reveal, question, options, answer }: { from: number; to: number; reveal: number; question: string; options: string[]; answer: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame >= to) return null;
  const k = ramp(frame, from, from + 14);
  const on = frame >= reveal;
  const left = Math.max(0, Math.ceil((reveal - frame) / 30));
  return (
    <AbsoluteFill>
      <DecoFrame width={width} height={height} s={s} k={k} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: PAPER, padding: `0 ${140 * s}px` }}>
        <div style={{ fontFamily: serif, fontWeight: 900, fontSize: 40 * s, letterSpacing: 10 * s }}>QUIZ OF THE WEEK</div>
        <div style={{ fontFamily: deco, fontSize: 82 * s, lineHeight: 1.15, margin: `${20 * s}px 0 ${30 * s}px` }}>{question}</div>
        {options.map((t, i) => {
          const right = on && i === answer;
          return (
            <div key={t} style={{ fontFamily: deco, fontSize: 76 * s, margin: `${8 * s}px 0`, padding: `${4 * s}px ${50 * s}px`, border: `${right ? 6 : 0}px double ${PAPER}`, opacity: on && !right ? 0.3 : 1, background: right ? PAPER : "transparent", color: right ? INK : PAPER }}>
              {String.fromCharCode(65 + i)}. {t}
            </div>
          );
        })}
        <div style={{ fontFamily: deco, fontSize: 120 * s, marginTop: 20 * s, height: 140 * s }}>{on ? "" : left}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Kicker: Thai serif, small, top centre, as a printed leader line.
export const Kicker = ({ text }: { text: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return <div style={{ position: "absolute", top: 34 * s, left: 0, right: 0, textAlign: "center", fontFamily: thai, fontWeight: 700, fontSize: 30 * s, letterSpacing: 2 * s, color: PAPER, opacity: 0.85, textShadow: "0 0 6px #000" }}>— {text} —</div>;
};
