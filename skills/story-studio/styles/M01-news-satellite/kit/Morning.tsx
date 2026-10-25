import { loadFont } from "@remotion/google-fonts/IBMPlexSansThai";
import { geoGraticule10, geoInterpolate } from "d3-geo";
import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { globeCam, isVisible, type Cam, type CamKey } from "../../../components/camera";
import { countries, country } from "../../../components/data";
import { FigureDefs } from "../../../components/Figures";
import type { InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";

// M01 morning world bulletin: a sunlit Blue Marble globe (lifted exposure, soft blue sea) on a pale morning sky,
// frosted white cards with deep-navy text and one teal accent, hairline rules, calm left-to-right wipes, a round
// "lens" illustration hung on a hairline from the pin, and a white lower-third ticker. 9:16 and 16:9.
export const font = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const NAVY = "#0d2342";
export const TEAL = "#009fb0";
export const SKY = "#e9f2fa";
export const SEA = "#9cc8e6";
export const MIST = "#5f7a96"; // secondary text
export const FROST = "rgba(255,255,255,0.80)";
export const BG = `radial-gradient(circle at 82% 8%, #fffaf0 0%, rgba(255,250,240,0) 28%), linear-gradient(180deg, #f6f9fc 0%, ${SKY} 45%, #c9ddee 100%)`;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

export type Story = {
  id: string;
  country: string; // world-atlas id (ISO 3166-1 numeric)
  name: string;
  tag: string;
  stat: string;
  statLabel: string;
  headline: string;
  sources: string;
  focus: [number, number];
  zoom: number;
  start: number;
  end: number;
};

const useUnit = () => {
  const { width, height } = useVideoConfig();
  return { width, height, s: Math.min(width, height) / 1080, vertical: height > width };
};

// Daylight globe: pale atmosphere halo, soft blue sea, imagery with lifted exposure, white graticule and borders.
export const DayGlobe = ({ imagery = "world" }: { imagery?: string }) => {
  const { path, projection, s } = useMap();
  const [cx, cy] = projection.translate();
  const r = projection.scale();
  const sphere = path({ type: "Sphere" }) ?? "";
  return (
    <g>
      <defs>
        <radialGradient id="m01-air" cx={cx} cy={cy} r={r * 1.16} gradientUnits="userSpaceOnUse">
          <stop offset="0.84" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="0.9" stopColor="#ffffff" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="m01-sun" cx={cx - r * 0.35} cy={cy - r * 0.45} r={r * 1.3} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fffdf5" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#b9d6ec" stopOpacity={0.35} />
        </radialGradient>
        <clipPath id="m01-sphere">
          <path d={sphere} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.16} fill="url(#m01-air)" />
      <path d={sphere} fill={SEA} />
      <g style={{ filter: "brightness(1.12) saturate(1.05) contrast(0.95)" }}>
        <Raster layers={[{ name: imagery }]} />
      </g>
      <mask id="m01-sea" maskUnits="userSpaceOnUse" x={cx - r * 1.2} y={cy - r * 1.2} width={r * 2.4} height={r * 2.4}>
        <path d={sphere} fill="#fff" />
        <path d={path(countries) ?? ""} fill="#000" stroke="#000" strokeWidth={1.5 * s} />
      </mask>
      <g clipPath="url(#m01-sphere)">
        <rect x={cx - r * 1.2} y={cy - r * 1.2} width={r * 2.4} height={r * 2.4} fill="#62acdf" style={{ mixBlendMode: "screen" }} opacity={0.85} mask="url(#m01-sea)" />
        <rect x={cx - r * 1.2} y={cy - r * 1.2} width={r * 2.4} height={r * 2.4} fill="#fff6e0" style={{ mixBlendMode: "screen" }} opacity={0.18} />
        <rect x={cx - r * 1.2} y={cy - r * 1.2} width={r * 2.4} height={r * 2.4} fill="#ffffff" style={{ mixBlendMode: "soft-light" }} opacity={0.35} />
        <path d={sphere} fill="url(#m01-sun)" />
      </g>
      <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="#ffffff" strokeOpacity={0.18} strokeWidth={0.7 * s} />
      <path d={path(countries) ?? ""} fill="none" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={0.9 * s} />
      <path d={sphere} fill="none" stroke="#ffffff" strokeWidth={2 * s} strokeOpacity={0.9} />
    </g>
  );
};

// The story's country: teal wash, navy hairline, wide white edge (no glow).
export const Highlight = ({ id, opacity }: { id: string; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  const d = path(country(id)) ?? "";
  return (
    <g opacity={opacity} strokeLinejoin="round">
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={7 * s} strokeOpacity={0.8} />
      <path d={d} fill={TEAL} fillOpacity={0.3} stroke={NAVY} strokeWidth={1.6 * s} />
    </g>
  );
};

// Pin: navy dot in a teal ring, the name on a white flag tag at the end of a vertical hairline.
export const Pin = ({ at, text, start }: { at: [number, number]; text: string; start: number }) => {
  const frame = useCurrentFrame();
  const { projection, cam, s } = useMap();
  if (frame < start || !isVisible(cam, at)) return null;
  const p = projection(at);
  if (!p) return null;
  const k = ramp(frame, start, start + 14, Easing.out(Easing.cubic));
  const breathe = 1 + 0.12 * Math.sin((frame - start) * 0.12);
  const fs = 34 * s;
  const w = text.length * fs * 0.62 + 44 * s;
  const lineH = 34 * s * k;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} fontFamily={font}>
      <circle r={22 * s * breathe} fill="none" stroke={TEAL} strokeWidth={2 * s} opacity={0.7} />
      <circle r={9 * s} fill={NAVY} stroke="#fff" strokeWidth={3 * s} />
      <line x1={8 * s} y1={-8 * s} x2={8 * s + lineH} y2={-8 * s - lineH} stroke={NAVY} strokeWidth={1.5 * s} />
      <g opacity={k} transform={`translate(${8 * s + lineH},${-8 * s - lineH + 25 * s})`}>
        <rect x={0} y={-50 * s} width={w * k} height={50 * s} fill="#fff" />
        <rect x={0} y={-50 * s} width={5 * s} height={50 * s} fill={TEAL} />
        <text x={22 * s} y={-14 * s} fontSize={fs} fontWeight={600} fill={NAVY} clipPath={undefined}>{text}</text>
      </g>
    </g>
  );
};

// Camera: hook spin, then per story a wide arc to the globe midpoint and a calm push in. Phones lift the place.
export const newsCam = (stories: Story[], width: number, height: number, hook: [number, number, number, number]): CamKey[] => {
  const R = Math.min(width, height) * 0.42;
  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(hook[0], hook[1], width, height, 0.42) },
    { frame: stories[0].start, cam: globeCam(hook[2], hook[3], width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = keys[1].cam;
  for (const st of stories) {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    const target: Cam = { lon: st.focus[0] + (height > width ? 0 : -(width * 0.12) / pxPerDeg), lat: st.focus[1] - (height > width ? (height * 0.125) / pxPerDeg : 0), scale: R * st.zoom };
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [target.lon, target.lat])(0.5);
    keys.push({ frame: st.start - 12, cam: prev });
    keys.push({ frame: st.start + 10, cam: { lon: mlon, lat: mlat, scale: R * 1.1 }, easing: Easing.inOut(Easing.sin) });
    keys.push({ frame: st.start + 36, cam: target, easing: Easing.out(Easing.quad) });
    keys.push({ frame: st.end, cam: { ...target, scale: target.scale * 1.04 }, easing: (t) => t });
    prev = { ...target, scale: target.scale * 1.04 };
  }
  return keys;
};

// Wipe 0 → 1 as a CSS clip (left to right), used by every card.
const wipe = (k: number) => `inset(0 ${(1 - k) * 100}% 0 0)`;

// Masthead: teal square, programme name, hairline, clock + date on the right, one thin segment per story.
export const Masthead = ({ title, date, clock, stories }: { title: string; date: string; clock: string; stories: Story[] }) => {
  const frame = useCurrentFrame();
  const { width, height, s, vertical } = useUnit();
  const k = ramp(frame, 0, 18);
  const current = stories.findIndex((st) => frame >= st.start - 10 && frame < st.end);
  const pad = vertical ? 56 * s : 60 * s;
  return (
    <div style={{ position: "absolute", top: vertical ? height * 0.05 : 34 * s, left: pad, right: pad, fontFamily: font, color: NAVY, clipPath: wipe(k) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * s }}>
        <div style={{ width: 26 * s, height: 26 * s, background: TEAL }} />
        <div style={{ fontSize: 40 * s, fontWeight: 700, letterSpacing: 0.5 * s }}>{title}</div>
        <div style={{ flex: 1, height: 1.5 * s, background: NAVY, opacity: 0.35 }} />
        <div style={{ fontSize: 40 * s, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{clock}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s, marginTop: 10 * s, marginLeft: 44 * s }}>
        <div style={{ fontSize: 26 * s, fontWeight: 500, color: MIST }}>{date}</div>
        <div style={{ display: "flex", gap: 8 * s, marginLeft: "auto" }}>
          {stories.map((st, i) => (
            <div key={st.id} style={{ width: 54 * s, height: 4 * s, background: i === current ? TEAL : i < current ? NAVY : "rgba(13,35,66,0.18)" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Story card: frosted white sheet, teal hairline on top, n/N · tag, country, a big teal stat, headline, sources.
export const StoryCard = ({ story, index, count }: { story: Story; index: number; count: number }) => {
  const frame = useCurrentFrame();
  const { height, s, vertical } = useUnit();
  const inAt = story.start + 18;
  const outAt = story.end;
  if (frame < inAt || frame > outAt) return null;
  const k = ramp(frame, inAt, inAt + 20, Easing.inOut(Easing.quad));
  const out = ramp(frame, outAt - 10, outAt);
  const statK = ramp(frame, inAt + 12, inAt + 30, Easing.out(Easing.quad));
  return (
    <div style={{ position: "absolute", left: vertical ? 56 * s : 60 * s, right: vertical ? 56 * s : undefined, top: vertical ? height * 0.135 : 150 * s, width: vertical ? undefined : 660 * s, clipPath: out > 0 ? `inset(0 0 0 ${out * 100}%)` : wipe(k), fontFamily: font, color: NAVY, background: FROST, backdropFilter: `blur(${14 * s}px)`, boxShadow: `0 ${18 * s}px ${50 * s}px rgba(40,80,120,0.18)`, padding: `${26 * s}px ${34 * s}px ${22 * s}px`, lineHeight: 1.45 }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: 4 * s, width: `${k * 100}%`, background: TEAL }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontSize: 26 * s, fontWeight: 600, color: TEAL }}>
        <span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
        <span style={{ width: 30 * s, height: 1.5 * s, background: TEAL }} />
        <span>{story.tag}</span>
      </div>
      <div style={{ fontSize: 58 * s, fontWeight: 700, marginTop: 2 * s }}>{story.name}</div>
      <div style={{ height: 1.5 * s, background: NAVY, opacity: 0.16, margin: `${8 * s}px 0` }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 * s, opacity: statK, transform: `translateY(${(1 - statK) * 14 * s}px)` }}>
        <span style={{ fontSize: 96 * s, fontWeight: 600, color: TEAL, lineHeight: 1.15, letterSpacing: -1 * s }}>{story.stat}</span>
        <span style={{ fontSize: 30 * s, fontWeight: 500, color: NAVY }}>{story.statLabel}</span>
      </div>
      <div style={{ fontSize: 34 * s, fontWeight: 500, marginTop: 4 * s }}>{story.headline}</div>
      <div style={{ fontSize: 21 * s, color: MIST, marginTop: 8 * s }}>{story.sources}</div>
    </div>
  );
};

// Hook title: navy on the bright sky, a teal rule wipes under it.
export const HookTitle = ({ title, sub, from, to }: { title: string; sub: string; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { height, s, vertical } = useUnit();
  const k = ramp(frame, from, from + 18);
  const o = interpolate(frame, [to - 8, to + 2], [1, 0], clamp);
  if (frame < from || o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...(vertical ? { top: height * 0.17 } : { bottom: 170 * s }), display: "flex", flexDirection: "column", alignItems: "center", fontFamily: font, color: NAVY, opacity: o, lineHeight: 1.3 }}>
      <div style={{ fontSize: 104 * s, fontWeight: 700, clipPath: wipe(k), textShadow: `0 0 ${30 * s}px rgba(255,255,255,0.9)` }}>{title}</div>
      <div style={{ width: 360 * s * k, height: 4 * s, background: TEAL, margin: `${10 * s}px 0` }} />
      <div style={{ fontSize: 40 * s, fontWeight: 500, color: NAVY, clipPath: wipe(ramp(frame, from + 8, from + 26)), textShadow: `0 0 ${20 * s}px rgba(255,255,255,0.9)` }}>{sub}</div>
    </div>
  );
};

// Lower-third ticker: teal label block + a white strip with the day's lines scrolling left.
export const Ticker = ({ label, items, from }: { label: string; items: string[]; from: number }) => {
  const frame = useCurrentFrame();
  const { width, height, s, vertical } = useUnit();
  const k = ramp(frame, from, from + 16);
  const h = 66 * s;
  const text = items.join("   ·   ");
  const x = -((frame - from) * 3.2 * s);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? height * 0.085 : 0, height: h, display: "flex", fontFamily: font, clipPath: wipe(k), boxShadow: `0 -${1 * s}px 0 rgba(13,35,66,0.15)` }}>
      <div style={{ background: TEAL, color: "#fff", fontSize: 30 * s, fontWeight: 700, padding: `0 ${30 * s}px`, display: "flex", alignItems: "center", zIndex: 1 }}>{label}</div>
      <div style={{ flex: 1, background: "rgba(255,255,255,0.92)", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 24 * s, display: "flex", alignItems: "center", whiteSpace: "nowrap", transform: `translateX(${x}px)`, fontSize: 30 * s, fontWeight: 500, color: NAVY }}>
          {text}   ·   {text}   ·   {text}
        </div>
      </div>
    </div>
  );
};

// Round "lens" illustration hung from the pin on a hairline: circle wipe in, teal progress arc on the rim, label
// under it. Children draw a panel scene as if on a 980×380 strip (InsetGeom is scaled to fit the circle).
export const Lens = ({ id, anchor, label, start, end, sky, children }: { id: string; anchor: [number, number]; label: string; start: number; end: number; sky: [string, string]; children: (g: InsetGeom) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { projection, width, height, s } = useMap();
  if (frame < start || frame > end) return null;
  const p = projection(anchor);
  if (!p) return null;
  const vertical = height > width;
  const R = (vertical ? 250 : 230) * s;
  const cx = vertical ? width / 2 : width - R - 120 * s;
  const cy = vertical ? height * 0.56 : height * 0.5;
  const kin = ramp(frame, start, start + 22, Easing.inOut(Easing.quad));
  const kout = ramp(frame, end - 10, end);
  const r = R * kin * (1 - kout);
  if (r <= 1) return null;
  const k = (2 * R) / (980 * s);
  const g: InsetGeom = { x: cx - R, y: cy - R * 0.62, W: 2 * R, H: 2 * R, ground: cy + R * 0.42, cx, s: s * k * 1.25, sc: 1.55 * s * k * 1.25, vertical, frame };
  const clip = `m01-lens-${id}`;
  const prog = interpolate(frame, [start, end], [0, 1], clamp);
  const C = 2 * Math.PI * (R + 12 * s);
  // hairline from the pin to the nearest rim point
  const ang = Math.atan2(p[1] - cy, p[0] - cx);
  const rim: [number, number] = [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  return (
    <g fontFamily={font}>
      <FigureDefs />
      <defs>
        <clipPath id={clip}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        <linearGradient id={`${clip}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <line x1={p[0]} y1={p[1]} x2={rim[0]} y2={rim[1]} stroke={NAVY} strokeWidth={1.5 * s} opacity={kin} />
      <circle cx={cx} cy={cy} r={r + 2 * s} fill="none" stroke="rgba(40,80,120,0.25)" strokeWidth={30 * s} style={{ filter: `blur(${16 * s}px)` }} />
      <g clipPath={`url(#${clip})`}>
        <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill={`url(#${clip}-sky)`} />
        {children(g)}
        <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill="#ffffff" opacity={0.08} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={6 * s} />
      <circle cx={cx} cy={cy} r={R + 12 * s} fill="none" stroke={TEAL} strokeWidth={3 * s} strokeDasharray={`${C * prog * kin} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} opacity={1 - kout} />
      <g opacity={kin * (1 - kout)}>
        <rect x={cx - (label.length * 9.5 + 34) * s} y={cy + R + 30 * s} width={(label.length * 19 + 68) * s} height={46 * s} fill="#fff" />
        <rect x={cx - (label.length * 9.5 + 34) * s} y={cy + R + 30 * s} width={5 * s} height={46 * s} fill={TEAL} />
        <text x={cx} y={cy + R + 62 * s} textAnchor="middle" fontSize={24 * s} fontWeight={600} fill={NAVY}>{label}</text>
      </g>
    </g>
  );
};

// Small credit line (navy at 55 %).
export const MapCredit = ({ text = "Imagery: NASA Blue Marble · Borders: Natural Earth" }: { text?: string }) => {
  const { width, height, s, vertical } = useUnit();
  return <div style={{ position: "absolute", right: 30 * s, bottom: vertical ? height * 0.16 : 80 * s, fontFamily: font, fontSize: Math.min(width, height) / 62, color: NAVY, opacity: 0.55 }}>{text}</div>;
};

// Kicker: "<ID> · <name>" in small navy caps with a teal tick.
export const Kicker = ({ text }: { text: string }) => {
  const { s, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", ...(vertical ? { top: 22 * s, left: 0, right: 0, justifyContent: "center" } : { bottom: 90 * s, left: 60 * s }), display: "flex", alignItems: "center", gap: 10 * s, fontFamily: font, fontSize: 26 * s, fontWeight: 600, color: NAVY, opacity: 0.75 }}>
      <span style={{ width: 14 * s, height: 14 * s, background: TEAL, display: "inline-block" }} />
      {text}
    </div>
  );
};
