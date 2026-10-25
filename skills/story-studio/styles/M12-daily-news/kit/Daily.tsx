import { loadFont } from "@remotion/google-fonts/Kanit";
import { geoInterpolate } from "d3-geo";
import type { ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { globeCam, type Cam, type CamKey } from "../../../components/camera";
import { countries, country } from "../../../components/data";
import { InfoChip } from "../../../components/Props";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { age, clamp, ramp, Spiral } from "./Art";

// Daily world-news short (แผนที่ข่าวโลก รายวัน, 60–90 s, 9:16): shock line at frame 0, an intro card with the
// headline count and a dot per story on the globe, then one story after another — each with ONE dark head card
// whose text swaps on every shot, a fixed-slot illustration panel low on the screen, and captions under it.
export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";
export const BLUE = "#4fa3ff";
export const GREEN = "#3fb950";
export const BG = "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)";
export { age, clamp, ramp };
export const O = 14; // panel overlap (frames)

// Screen layout (9:16): card on top (10–27 %), map in the middle, panel low (56–74 %), captions at 76.5 %.
export const PANEL_TOP = 0.56;
export const PANEL_H = 350;
export const CAPTION_TOP = 0.765;

export type LL = [number, number];
export type Story = { id: string; ids: string[]; focus: LL; zoom: number; start: number; end: number; pin: { at: LL; label: string; f: number } };

// Chain of panels: cue frames → [start, end] with the 14-frame overlap.
export const chain = (cues: number[], end: number) => cues.map((c, i) => [c, i + 1 < cues.length ? cues[i + 1] + O : end] as const);

/* ---------------- map layers ---------------- */
export const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.9 * s} />;
};

export const Highlight = ({ ids, opacity }: { ids: string[]; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {ids.map((id) => {
        const d = path(country(id)) ?? "";
        return (
          <g key={id}>
            <path d={d} fill={RED} fillOpacity={0.28} />
            <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
            <path d={d} fill="none" stroke="#ff8a80" strokeWidth={2.5 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Intro: one pulsing dot per story on the globe, popping in one after another from `at` until `to`.
export const StoryDots = ({ points, at, to }: { points: LL[]; at: number; to: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < at || frame > to) return null;
  return (
    <g>
      {points.map((pt, i) => {
        const p = projection(pt);
        const k = age(frame, at + i * 3, 8);
        if (!p || k <= 0) return null;
        const pulse = ((frame - at) % 30) / 30;
        return (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={(10 + pulse * 24) * s} fill="none" stroke={RED} strokeWidth={3 * s} opacity={1 - pulse} />
            <circle cx={p[0]} cy={p[1]} r={9 * s * k} fill={RED} stroke="#fff" strokeWidth={2.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

// Storm spiral riding an (approximate) forecast track, dashed gold track line and its label.
export const StormTrack = ({ track, from, to, trackAt, label = "เส้นทางคาดการณ์ (โดยประมาณ)" }: { track: LL[]; from: number; to: number; trackAt: number; label?: string }) => {
  const frame = useCurrentFrame();
  const { projection, path, s } = useMap();
  if (frame < from || frame > to + 10) return null;
  const k = ramp(frame, from, from + 20) * interpolate(frame, [to - 6, to + 10], [1, 0], clamp);
  const t = ramp(frame, trackAt, to, Easing.inOut(Easing.quad)) * 0.5;
  const seg = t * (track.length - 1);
  const i = Math.min(track.length - 2, Math.floor(seg));
  const pos = geoInterpolate(track[i], track[i + 1])(seg - i) as LL;
  const p = projection(pos);
  const trackK = ramp(frame, trackAt, trackAt + 30);
  const lp = projection(track[Math.min(3, track.length - 1)]);
  return (
    <g opacity={k}>
      {trackK > 0 && (
        <>
          <path d={path({ type: "LineString", coordinates: track }) ?? ""} fill="none" stroke={GOLD} strokeWidth={4 * s} strokeDasharray={`${14 * s} ${10 * s}`} opacity={trackK} />
          {lp && <text x={lp[0] + 18 * s} y={lp[1]} fontSize={30 * s} fontWeight={700} fill="#fff" stroke="#0b1426" strokeWidth={6 * s} paintOrder="stroke" fontFamily={font} opacity={trackK}>{label}</text>}
        </>
      )}
      {p && <Spiral x={p[0]} y={p[1]} r={110 * s} k={1} frame={frame} />}
    </g>
  );
};

// Flood: translucent water spreading from a point (radius in degrees), wobbly edge.
export const FloodLayer = ({ at: c, radius, k }: { at: LL; radius: number; k: number }) => {
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

/* ---------------- camera ---------------- */
// Hook close-up → globe spin during the intro → fly to each story (far pull-back only for long hops) → globe at the end.
export const dailyCam = (stories: Story[], width: number, height: number, hook: { focus: LL; zoom: number; to: number }, intro: { at: number; to: number; lon: [number, number] }, total: number): CamKey[] => {
  const R = Math.min(width, height) * 0.42;
  const lift = height > width ? 0.085 : 0;
  const target = (st: { focus: LL; zoom: number }): Cam => {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    return { lon: st.focus[0], lat: st.focus[1] - (height * lift) / pxPerDeg, scale: R * st.zoom };
  };
  const hookCam = target(hook);
  const keys: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: hook.to, cam: { ...hookCam, scale: hookCam.scale * 1.08 }, easing: (t) => t },
    { frame: intro.at + 30, cam: globeCam(intro.lon[0], 5, width, height, 0.42), easing: Easing.inOut(Easing.cubic) },
    { frame: intro.to, cam: globeCam(intro.lon[1], 15, width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = keys[keys.length - 1].cam;
  for (const st of stories) {
    const t = target(st);
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat])(0.5);
    const d = (geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat]) as unknown as { distance: number }).distance;
    const far = d > 0.6 ? 1.05 : Math.max(1.05, (t.scale / R) * 0.45);
    keys.push({ frame: st.start - 12, cam: prev });
    keys.push({ frame: st.start + 6, cam: { lon: mlon, lat: mlat, scale: R * far }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: st.start + 26, cam: t, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: st.end, cam: { ...t, scale: t.scale * 1.06 }, easing: (x) => x });
    prev = { ...t, scale: t.scale * 1.06 };
  }
  const end = stories[stories.length - 1].end;
  keys.push({ frame: end + 4, cam: prev });
  keys.push({ frame: end + 30, cam: globeCam(prev.lon, 10, width, height, 0.42), easing: Easing.inOut(Easing.cubic) });
  keys.push({ frame: total, cam: globeCam(prev.lon + 20, 10, width, height, 0.42), easing: (x) => x });
  return keys;
};

/* ---------------- screen ---------------- */
// Top bar: edition badge + date stamp on the left, one pill per story on the right.
export const TopBar = ({ title, date, stories, from }: { title: string; date: string; stories: Story[]; from: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from) return null;
  const current = stories.findIndex((st) => frame >= st.start - 10 && frame < st.end);
  const last = stories[stories.length - 1].end;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{title}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{date}</div>
      </div>
      <div style={{ display: "flex", gap: 8 * s }}>
        {stories.map((st, i) => (
          <div key={st.id} style={{ width: 30 * s, height: 10 * s, borderRadius: 5 * s, background: i === current ? RED : i < current || frame > last ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
};

// Frame 0: the shock line, big, in the card slot (red "ด่วน" badge, white line, red second line).
export const HookTitle = ({ badge, line1, line2, to }: { badge: string; line1: string; line2: string; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [to, to + 8], [1, 0], clamp);
  if (o <= 0) return null;
  const k = spring({ frame, fps, config: { damping: 12 }, from: 0.85, to: 1 });
  const sh = `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)`;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.09, opacity: o, transform: `scale(${k})`, fontFamily: font, color: "#fff", lineHeight: 1.25, textAlign: "center" }}>
      <span style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontSize: 34 * s, fontWeight: 900 }}>{badge}</span>
      <div style={{ fontSize: 100 * s, fontWeight: 900, marginTop: 18 * s, textShadow: sh }}>{line1}</div>
      <div style={{ fontSize: 76 * s, fontWeight: 900, color: "#ff6b5f", textShadow: sh }}>{line2}</div>
    </div>
  );
};

// One card per story: the card stays; tag / headline / stat swap on each shot (`f`).
export type Head = { f: number; tag: string; head: string; stat?: string | ((frame: number) => string); label?: string; color?: string; chips?: { text: string; f: number }[] };
export const HeadCard = ({ heads, from, to }: { heads: Head[]; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length) return null;
  const h = list[list.length - 1];
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 8, to], [1, 0], clamp);
  const swap = spring({ frame: frame - h.f, fps, config: { damping: 16 } });
  const color = h.color ?? RED;
  const stat = typeof h.stat === "function" ? h.stat(frame) : h.stat;
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.86)", borderLeft: `${8 * s}px solid ${color}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.4 }}>
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
            return frame < c.f ? null : <span key={c.text} style={{ transform: `scale(${ck})`, background: color, color: "#fff", padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontSize: 30 * s, fontWeight: 700 }}>{c.text}</span>;
          })}
        </div>
      )}
    </div>
  );
};

// Sign-off card: edition title + "every day" line.
export const Outro = ({ title, from, line = "ทุกวัน · กดติดตามไว้ แล้วพบกันพรุ่งนี้" }: { title: string; from: number; line?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [from, from + 12], [0, 1], clamp);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
      <div style={{ background: "rgba(8,14,26,0.86)", padding: `${24 * s}px ${50 * s}px`, borderRadius: 18 * s, border: `${3 * s}px solid ${RED}` }}>
        <div style={{ fontSize: 76 * s, fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 36 * s, opacity: 0.85 }}>{line}</div>
      </div>
    </div>
  );
};

/* ---------------- panels ---------------- */
// Fixed-slot illustration panel, always labelled "ภาพประกอบ". Consecutive panels overlap: end = next start + 14.
export const Panel = ({ id, anchor, start, end, sky, accent = RED, children }: { id: string; anchor: LL; start: number; end: number; sky: [string, string]; accent?: string; children: (g: InsetGeom) => ReactNode }) => (
  <InsetPanel id={id} anchor={anchor} label="ภาพประกอบ" start={start} end={end} sky={sky} font={font} accent={accent} top={PANEL_TOP} panelHeight={PANEL_H}>
    {children}
  </InsetPanel>
);

// Info chip in the top-right corner of a panel (the top-left holds the "ภาพประกอบ" tag).
export const Chip = ({ g, label, value, color }: { g: InsetGeom; label: string; value: string; color?: string }) => {
  const sc = g.sc * 0.9;
  const w = Math.max(150, value.length * 17 + 30) * sc;
  return <InfoChip x={g.x + g.W - w - 20 * g.s} y={g.y + 20 * g.s + 56 * sc} scale={sc} label={label} value={value} font={font} color={color} />;
};
// Outlined one-line caption inside a panel.
export const PanelLine = ({ g, text, y = 76 }: { g: InsetGeom; text: string; y?: number }) => (
  <text x={g.cx} y={g.y + y * g.s} textAnchor="middle" fontSize={28 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>{text}</text>
);
// White flash over a panel on an impact frame.
export const Flash = ({ g, at }: { g: InsetGeom; at: number }) => {
  const k = age(g.frame, at, 8);
  return k > 0 && k < 1 ? <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#fff" opacity={0.6 * (1 - k)} /> : null;
};
