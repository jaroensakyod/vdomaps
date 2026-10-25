import { loadFont } from "@remotion/google-fonts/Kanit";
import type { FeatureCollection, MultiLineString } from "geojson";
import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { useJson } from "../../../components/useJson";
import { BellChedi, Fire, Prang } from "./Period";

// M02 history vertical: the news look of the long-form history episodes (THNews). Real imagery, glowing OSM rivers,
// a red-glow city at night, one dark head card per shot with a big stat, an illustration panel tied to the map by a
// dashed leader line, captions at 76 %. Everything here is scheduled by frame numbers passed in by the scene.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
export const CARD = "rgba(8,14,26,0.86)";
export const BG = "#02060d";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Approximate points and views (central plain / Ayutthaya).
export const P = {
  ayut: [100.566, 14.357],
  huaro: [100.578, 14.366],
  bangkok: [100.49, 13.75],
} satisfies Record<string, [number, number]>;

export const V = {
  island: bbox([[100.52, 14.32], [100.62, 14.4]]),
  plain: bbox([[100.25, 14.05], [100.9, 14.65]]),
  central: bbox([[99.4, 13.3], [101.6, 15.4]]),
};

// Camera on a feature, zoomed by k, with the subject lifted into the upper part of the frame (panels sit below).
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};

// A high-res tile only shows when it fills the whole screen (else its edge shows against the coarse layer).
// Returns the opacity for <Raster layers={[..., { name, opacity }]}/>; the 12 × 20 grid keeps the fade smooth.
export const tileOpacity = (cam: Cam, w: number, h: number, [x0, y0, x1, y1]: [number, number, number, number]) => {
  const p = projectionFor(cam, w, h);
  let n = 0;
  let inside = 0;
  for (let i = 0; i <= 11; i++)
    for (let j = 0; j <= 19; j++) {
      const q = p.invert!([(w * i) / 11, (h * j) / 19]);
      n++;
      if (q && q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1) inside++;
    }
  return Math.min(1, Math.max(0, (inside / n - 0.8) * 5));
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

// Glowing dashed ring around a city (default: Ayutthaya island).
export const CityRing = ({ k, at = P.ayut, color = RED }: { k: number; at?: [number, number]; color?: string }) => {
  const { projection, s } = useMap();
  const p = projection(at);
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

// Top bar: red channel badge (left), chapter name, year chip (right).
export const TopBar = ({ badge, chapter, year, start = 0 }: { badge: string; chapter?: string; year: string; start?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [start, start + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, opacity: o, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{badge}</div>
        {chapter && <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>}
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(255,255,255,0.25)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>พ.ศ. {year}</div>
    </div>
  );
};

// One card per shot. The card stays; tag/headline/stat swap with a small spring on each head's frame `f`.
export type Head = { f: number; tag: string; head: string; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[] };
export const HeadCard = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  if (!h.head) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? RED;
  const stat = typeof h.stat === "function" ? h.stat(frame) : h.stat;
  const wide = width > height;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: wide ? undefined : 50 * s, width: wide ? 760 * s : undefined, top: height * (wide ? 0.15 : 0.1), transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: CARD, borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
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
    </div>
  );
};

// Screen layout (9:16): card on top (10–27 %), map in the middle, illustration panel low (56–74 %), captions at 76.5 %.
export const PANEL_TOP = 0.56;
export const PANEL_H = 350;
export const CAPTION_TOP = 0.765;

// Illustration panel ("ภาพประกอบ") tied to `anchor` on the map by a dashed leader line.
// Consecutive panels must overlap: pass the next panel's start + 14 as `end`.
export const Panel = ({ id, anchor, start, end, sky, accent = RED, children }: { id: string; anchor: [number, number]; start: number; end: number; sky: [string, string]; accent?: string; children: (g: InsetGeom) => ReactNode }) => (
  <InsetPanel id={id} anchor={anchor} label="ภาพประกอบ" start={start} end={end} sky={sky} font={font} accent={accent} top={PANEL_TOP} panelHeight={PANEL_H}>
    {children}
  </InsetPanel>
);

// Old-city skyline: prangs and bell chedis, optionally burning.
type G = { x: number; W: number; ground: number; s: number };
export const Skyline = ({ g, color, burn = 0, base = 95, gold = false }: { g: G; color: string; burn?: number; base?: number; gold?: boolean }) => (
  <g>
    {([[0.1, 150, "p"], [0.28, 120, "c"], [0.45, 190, "p"], [0.6, 110, "c"], [0.78, 165, "p"], [0.93, 100, "c"]] as [number, number, string][]).map(([fx, h, t], i) =>
      t === "p" ? <Prang key={i} x={g.x + g.W * fx} y={g.ground - base * g.s} h={h * g.s} color={gold && i % 2 === 0 ? "#d9a93a" : color} /> : <BellChedi key={i} x={g.x + g.W * fx} y={g.ground - base * g.s} h={h * g.s} color={gold ? "#e2b84a" : color} />,
    )}
    {burn > 0 && [0.2, 0.5, 0.72, 0.9].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={g.ground - (base + 5) * g.s} size={(70 + i * 12) * g.s * burn} seed={i * 5} />)}
  </g>
);
