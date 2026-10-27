import { loadFont } from "@remotion/google-fonts/Kanit";
import type { FeatureCollection, MultiLineString } from "geojson";
import { createContext, useContext, type ReactNode } from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { buildBeats } from "../../../components/subs.mjs";
import { useJson } from "../../../components/useJson";
import beatsText from "../ep01/beats.json";
import timing from "../ep01/timing.json";
import { BellChedi, Fire, Prang } from "./Period";

// Shared pieces of the news-look Ayutthaya episode (house standard): timing, places, map overlays, cards, panels.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
// Layout options (default = the approved look). compact: smaller head card; panelScale: illustration box shrunk
// about its bottom edge. Set by an episode with <LayoutCtx.Provider> to keep more of the map clear.
// panelHide (0..1): how far the illustration panel is tucked away (the episode raises it while the camera moves).
export const LayoutCtx = createContext({ compact: false, panelScale: 1, panelHide: 0 });
// House-standard clear layout values: camera zoomed out and its focus raised into the band between the compact head
// card and the shrunk panel. Episodes: cam.scale × camScale, <MapFrame focusY>, LayoutCtx { compact, panelScale,
// panelHide: panelHideAt(keys, frame) } — see thaihistory/ep05/Ep.tsx (Ep05Clear).
// Storyboard: a scene built for one place can be reused anywhere — its leader line then points at this anchor.
export const AnchorCtx = createContext<[number, number] | null>(null);
export const CLEAR = { camScale: 0.8, focusY: 0.444, panelScale: 0.8 };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const LAYOUT = { lead: 3, gap: 16 };
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));

// Frame where a word is spoken (Whisper timing after snap-words), n-th match; else a share of the beat.
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);

export const P = {
  ayut: [100.566, 14.357],
  huaro: [100.578, 14.366],
  mouth: [100.58, 13.52],
} satisfies Record<string, [number, number]>;

export const V = {
  island: bbox([[100.52, 14.32], [100.62, 14.4]]),
  plain: bbox([[100.25, 14.05], [100.9, 14.65]]),
  central: bbox([[99.4, 13.3], [101.6, 15.4]]),
  gulf: bbox([[99.0, 11.8], [102.2, 14.8]]),
  sea: bbox([[92, 0], [124, 30]]),
};

// Camera on a feature, zoomed by k, with the subject lifted into the upper part of the frame (panels sit below).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// OSM rivers over the imagery: soft glow + crisp line. `hi` = river names to light up (0 → 1 each).
export const Rivers = ({ hi = {} }: { hi?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const isle = useJson<FeatureCollection<MultiLineString, { name: string }>>("data/th-island.json");
  const plain = useJson<FeatureCollection<MultiLineString, { name: string }>>("data/th-plain.json");
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const w = Math.min(Math.max(pxDeg * 0.0009, 2.5 * s), 16 * s);
  const all = [...(plain?.features ?? []), ...(isle?.features ?? [])];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map((f, i) => <path key={`g${i}`} d={path(f) ?? ""} stroke="#4fc3ff" strokeWidth={w * 2.2} strokeOpacity={0.16} />)}
      {all.map((f, i) => <path key={`l${i}`} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.85} />)}
      {all.map((f, i) => {
        const k = hi[f.properties.name] ?? 0;
        return k > 0 ? <path key={`h${i}`} d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 2.4} strokeOpacity={k} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} /> : null;
      })}
    </g>
  );
};

// Lift near-black water off the floor (house rule 25 Oct 2026, from the Facebook check "วิดีโอของคุณมีขอบ"): Blue
// Marble ocean is so dark that a sea filling the bottom of a 9:16 frame reads as a black letterbox. A shadow-only
// curve on the imagery lifts near-black to deep blue (luma ~29, so cropdetect limit 24 no longer trips) and leaves
// mid-tones and land almost untouched. Wrap the <Raster> in it.
export const SeaLift = ({ children }: { children: ReactNode }) => (
  <g filter="url(#sealift)">
    <defs>
      <filter id="sealift" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.05 0.29 0.53 0.77 1" />
          <feFuncG type="table" tableValues="0.13 0.32 0.54 0.77 1" />
          <feFuncB type="table" tableValues="0.20 0.36 0.57 0.79 1" />
        </feComponentTransfer>
      </filter>
    </defs>
    {children}
  </g>
);

// Night grade over the imagery + a fire glow at a point.
export const NightGrade = ({ k, fireAt }: { k: number; fireAt: [number, number] }) => {
  const { projection, width, height, s } = useMap();
  const frame = useCurrentFrame();
  if (k <= 0) return null;
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

// Glowing ring around the old city.
export const CityRing = ({ k, color = RED }: { k: number; color?: string }) => {
  const { projection, s } = useMap();
  const p = projection(P.ayut);
  if (!p || k <= 0) return null;
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const rx = Math.max(0.027 * pxDeg, 26 * s);
  const ry = Math.max(0.014 * pxDeg, 16 * s);
  return (
    <g opacity={k}>
      <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${5 * s}px)` }} />
      <ellipse cx={p[0]} cy={p[1]} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={2.6 * s} strokeDasharray={`${14 * s} ${8 * s}`} />
    </g>
  );
};

// Flood: translucent water spreading from a point (radius in degrees), wobbly edge.
export const FloodLayer = ({ at: c, radius, k }: { at: [number, number]; radius: number; k: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(c);
  if (!p) return null;
  const r = radius * ((projection.scale() * Math.PI) / 180) * k;
  const pts = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    const w = 1 + 0.07 * Math.sin(a * 5 + frame * 0.03) + 0.05 * Math.sin(a * 9 + 1.3);
    return `${p[0] + Math.cos(a) * r * w},${p[1] + Math.sin(a) * r * w * 1.15}`;
  });
  return (
    <g>
      <path d={`M${pts.join(" L")} Z`} fill="#3d8fc4" opacity={0.42} />
      <path d={`M${pts.join(" L")} Z`} fill="none" stroke="#8fd3ff" strokeWidth={3 * s} opacity={0.6} />
    </g>
  );
};

// Top bar: channel badge, chapter, year chip.
export const TopBar = ({ chapter, year, channel = "ประวัติศาสตร์บนแผนที่" }: { chapter: string; year: string; channel?: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{channel}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>
      </div>
      {year && <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>{/^d/.test(year) ? `พ.ศ. ${year}` : year}</div>}
    </div>
  );
};

// One card per shot: [frame, tag, headline, stat?, statLabel?, color?]. The card stays; text swaps on each shot.
export type Head = { f: number; tag: string; head: string; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[]; portrait?: string; photo?: string };
export const HeadCard = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const { compact } = useContext(LayoutCtx);
  const s = (Math.min(width, height) / 1080) * (compact ? 0.72 : 1);
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  if (!h.head) return null; // an empty head hands the top slot to a chapter overlay (quote, poll)
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swapRaw = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  // clear layout: new text starts at 70 % so the card never goes blank for a frame (with the panel tucked away
  // during camera moves, that blank frame showed up as a brightness dip in check-glitch).
  const swap = compact ? 0.7 + 0.3 * swapRaw : swapRaw;
  const color = h.color ?? RED;
  const stat = typeof h.stat === "function" ? h.stat(frame) : h.stat;
  return (
    <div style={{ position: "absolute", left: compact ? 40 : 50 * s, right: compact ? undefined : 50 * s, maxWidth: compact ? width * 0.82 : undefined, top: height * (compact ? 0.085 : 0.1), transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
      {h.portrait && (
        // AI-drawn portrait (style A, episodes/thaihistory/portraits.json): always labelled ภาพประกอบ
        <div style={{ float: "left", position: "relative", width: 190 * s, height: 190 * s, marginRight: 24 * s, transform: `scale(${0.8 + 0.2 * swap})`, opacity: swap }}>
          <Img src={staticFile(h.portrait.includes("/") ? `portraits/${h.portrait}.jpg` : `portraits/thaihistory/${h.portrait}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 * s, border: `${4 * s}px solid ${color}` }} />
          <span style={{ position: "absolute", left: 8 * s, bottom: 8 * s, background: "rgba(8,14,26,0.75)", fontSize: 16 * s, padding: `0 ${8 * s}px`, borderRadius: 6 * s }}>{h.photo ?? "ภาพประกอบ"}</span>
        </div>
      )}
      <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>{h.tag}</span>
      <div style={{ fontSize: 54 * s, fontWeight: 900, marginTop: 6 * s, transform: `translateY(${(1 - swap) * 14 * s}px)`, opacity: swap }}>{h.head}</div>
      {stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, opacity: swap }}>
          <span style={{ fontSize: 92 * s, fontWeight: 900, color: color === RED ? "#ff6b5f" : color, lineHeight: 1.15 }}>{stat}</span>
          {h.label && <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{h.label}</span>}
        </div>
      )}
      {h.chips && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 * s, marginTop: 10 * s }}>
          {h.chips.map((c) => {
            const ck = spring({ frame: frame - c.f, fps, config: { damping: 12 } });
            return frame < c.f ? null : (
              <span key={c.text} style={{ transform: `scale(${ck})`, background: color, color: "#fff", padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontSize: 30 * s, fontWeight: 700 }}>{c.text}</span>
            );
          })}
        </div>
      )}
      {h.portrait && <div style={{ clear: "both" }} />}
    </div>
  );
};

// Screen layout (9:16): card on top (10–27%), map in the middle, illustration panel low (56–74%), captions at 76%.
export const PANEL_TOP = 0.56;
export const PANEL_H = 350;
export const CAPTION_TOP = 0.765;

// Standard illustration panel for this episode.
// Consecutive panels must overlap: pass the next panel's start + 14 as `end`.
export const Panel = ({ id, anchor, start, end, sky, accent = RED, size, children }: { id: string; anchor: [number, number]; start: number; end: number; sky: [string, string]; accent?: string; size?: { w: number; h: number }; children: (g: InsetGeom) => ReactNode }) => {
  const { panelScale, panelHide } = useContext(LayoutCtx);
  const forced = useContext(AnchorCtx);
  const { height } = useVideoConfig();
  if (panelHide >= 0.999) return null;
  return (
    <g opacity={1 - panelHide} transform={panelHide > 0 ? `translate(0,${panelHide * panelHide * height * 0.06})` : undefined}>
    <InsetPanel id={id} anchor={forced ?? anchor} label="ภาพประกอบ" start={start} end={end} sky={sky} font={font} accent={accent} top={PANEL_TOP} panelHeight={size?.h ?? PANEL_H} panelWidth={size?.w} boxScale={panelScale}>
      {children}
    </InsetPanel>
    </g>
  );
};

// Ayutthaya skyline: prangs and bell chedis, optionally burning.
type G = { x: number; W: number; ground: number; s: number };
export const Skyline = ({ g, color, burn = 0, base = 95, gold = false }: { g: G; color: string; burn?: number; base?: number; gold?: boolean }) => (
  <g>
    {([[0.1, 150, "p"], [0.28, 120, "c"], [0.45, 190, "p"], [0.6, 110, "c"], [0.78, 165, "p"], [0.93, 100, "c"]] as [number, number, string][]).map(([fx, h, t], i) =>
      t === "p" ? <Prang key={i} x={g.x + g.W * fx} y={g.ground - base * g.s} h={h * g.s} color={gold && i % 2 === 0 ? "#d9a93a" : color} /> : <BellChedi key={i} x={g.x + g.W * fx} y={g.ground - base * g.s} h={h * g.s} color={gold ? "#e2b84a" : color} />,
    )}
    {burn > 0 && [0.2, 0.5, 0.72, 0.9].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - (base + 5) * g.s} size={(70 + i * 12) * g.s * burn} seed={i * 5} />)}
  </g>
);

// Chapter contract: each chapter adds camera keys, map overlays, panels, cards and sounds for its own beats.
export type Chapter = {
  name: string;
  from: number; // first frame (inclusive)
  to: number; // last frame (exclusive)
  cams: (width: number, height: number) => { frame: number; cam: Cam }[];
  years: [number, string][];
  heads: Head[];
  Map: () => ReactNode; // inside <MapFrame>, under the panels
  Panels: () => ReactNode; // inside <MapFrame>
  Screen?: () => ReactNode; // HTML overlays above the map
  sfx: [number, string, number][];
  night?: (frame: number) => number;
};

// News-style quiz: question + options in the dark card style, a 3-2-1 countdown, then the answer lights up.
export const QuizNews = ({ title, question, options, answer, start, reveal, end, color = GOLD }: { title: string; question: string; options: string[]; answer: number; start: number; reveal: number; end: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 8, end], [1, 0], clamp);
  const left = Math.max(0, Math.ceil((reveal - frame) / 30));
  const on = frame >= reveal;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * PANEL_TOP, opacity: o, transform: `scale(${0.9 + 0.1 * k})`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${color}`, borderRadius: 18 * s, padding: `${22 * s}px ${30 * s}px`, lineHeight: 1.35 }}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color }}>{title}</div>
      <div style={{ fontSize: 52 * s, fontWeight: 900, margin: `${6 * s}px 0 ${14 * s}px` }}>{question}</div>
      {options.map((t, i) => {
        const right = i === answer;
        return (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 18 * s, margin: `${10 * s}px 0`, padding: `${10 * s}px ${20 * s}px`, borderRadius: 12 * s, background: on && right ? "rgba(63,143,74,0.9)" : "rgba(255,255,255,0.1)", opacity: on && !right ? 0.4 : 1, border: `${2 * s}px solid rgba(255,255,255,0.3)` }}>
            <div style={{ width: 48 * s, height: 48 * s, borderRadius: "50%", background: on ? (right ? "#fff" : RED) : "rgba(255,255,255,0.2)", color: on && right ? "#3f8f4a" : "#fff", fontSize: 34 * s, fontWeight: 900, lineHeight: `${48 * s}px`, textAlign: "center" }}>{on ? (right ? "✓" : "✕") : String.fromCharCode(65 + i)}</div>
            <div style={{ fontSize: 42 * s, fontWeight: 700 }}>{t}</div>
          </div>
        );
      })}
      {!on && <div style={{ textAlign: "center", fontSize: 64 * s, fontWeight: 900, color }}>{left}</div>}
    </div>
  );
};
