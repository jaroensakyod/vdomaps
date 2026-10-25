import { geoInterpolate } from "d3-geo";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { globeCam, type Cam, type CamKey } from "../../../components/camera";
import { countries, country } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { style } from "../../../components/style";

// Satellite world-news look (from the แผนที่ข่าวโลก daily edition): NASA Blue Marble globe, faint white borders,
// the story's country in a red wash with a glowing outline, dark news cards with a red left bar and a big stat,
// a top bar with the edition title, date and one progress pill per story. Works at 9:16 and 16:9.
export const RED = "#ff3b30";
export const STAT = "#ff6b5f"; // big number on the card
export const GLOW = "#ff8a80"; // crisp country outline
export const CARD = "rgba(8,14,26,0.86)";
export const BG = "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Story = {
  id: string;
  country: string; // world-atlas id (ISO 3166-1 numeric), e.g. Japan "392"
  name: string; // Thai country name on the card
  tag: string; // category chip
  stat: string; // the big number
  statLabel: string;
  headline: string;
  sources: string;
  focus: [number, number]; // camera centre
  zoom: number; // globe radius multiple (bigger = closer)
  start: number; // first frame of the story
  end: number; // last frame of the story
};

export const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.9 * s} />;
};

// The country in the story: red wash + blurred glow + crisp outline.
export const Highlight = ({ id, opacity }: { id: string; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  const d = path(country(id)) ?? "";
  return (
    <g opacity={opacity}>
      <path d={d} fill={RED} fillOpacity={0.32} />
      <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke={GLOW} strokeWidth={2.5 * s} strokeLinejoin="round" />
    </g>
  );
};

// Camera: hook spin, then for every story pull back to globe size at the great-circle midpoint and push in on the
// story's focus, landing ~1 s after the story starts. On phones the place is lifted (the panel sits below it).
export const newsCam = (stories: Story[], width: number, height: number, hook: [number, number, number, number]): CamKey[] => {
  const R = Math.min(width, height) * 0.42;
  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(hook[0], hook[1], width, height, 0.42) },
    { frame: stories[0].start, cam: globeCam(hook[2], hook[3], width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = keys[1].cam;
  for (const st of stories) {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    const target: Cam = { lon: st.focus[0], lat: st.focus[1] - (height > width ? (height * 0.11) / pxPerDeg : 0), scale: R * st.zoom };
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [target.lon, target.lat])(0.5);
    keys.push({ frame: st.start - 12, cam: prev });
    keys.push({ frame: st.start + 8, cam: { lon: mlon, lat: mlat, scale: R * 1.05 }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: st.start + 32, cam: target, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: st.end, cam: { ...target, scale: target.scale * 1.06 }, easing: (t) => t });
    prev = { ...target, scale: target.scale * 1.06 };
  }
  return keys;
};

// Top bar: red edition badge, date, one pill per story (current = red, done = white).
export const TopBar = ({ title, date, stories }: { title: string; date: string; stories: Story[] }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const current = stories.findIndex((st) => frame >= st.start - 10 && frame < st.end);
  const last = stories[stories.length - 1];
  return (
    <div style={{ position: "absolute", top: vertical ? height * 0.045 : 34 * s, left: 0, right: 0, display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", justifyContent: vertical ? "flex-start" : "space-between", gap: 12 * s, padding: `0 ${50 * s}px`, fontFamily: style.font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 38 * s }}>{title}</div>
        <div style={{ fontSize: 32 * s, fontWeight: 700, opacity: 0.9 }}>{date}</div>
      </div>
      <div style={{ display: "flex", gap: 10 * s }}>
        {stories.map((st, i) => (
          <div key={st.id} style={{ width: 38 * s, height: 10 * s, borderRadius: 5 * s, background: i === current ? RED : i < current || frame > last.end ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
};

// Story card: n/N + tag chip, country name, big stat that pops with a back-ease, headline, sources line.
export const StoryCard = ({ story, index, count }: { story: Story; index: number; count: number }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const inAt = story.start + 18;
  const outAt = story.end;
  if (frame < inAt || frame > outAt) return null;
  const k = spring({ frame: frame - inAt, fps, config: { damping: 14 } });
  const o = interpolate(frame, [outAt - 8, outAt], [1, 0], clamp);
  const statK = interpolate(frame, [inAt + 6, inAt + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div style={{ position: "absolute", left: vertical ? 50 * s : 60 * s, right: vertical ? 50 * s : undefined, top: vertical ? height * 0.13 : 120 * s, width: vertical ? undefined : 640 * s, transform: `translateX(${(1 - k) * -60 * s}px)`, opacity: k * o, fontFamily: style.font, color: "#fff", background: CARD, borderLeft: `${8 * s}px solid ${RED}`, borderRadius: 14 * s, padding: `${22 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.45 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontSize: 28 * s, fontWeight: 700 }}>
        <span style={{ opacity: 0.7 }}>{index + 1}/{count}</span>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s }}>{story.tag}</span>
      </div>
      <div style={{ fontSize: 60 * s, fontWeight: 900, marginTop: 4 * s }}>{story.name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, transform: `scale(${0.6 + 0.4 * statK})`, transformOrigin: "left center", opacity: statK }}>
        <span style={{ fontSize: 92 * s, fontWeight: 900, color: STAT, lineHeight: 1.2 }}>{story.stat}</span>
        <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{story.statLabel}</span>
      </div>
      <div style={{ fontSize: 34 * s, fontWeight: 700, marginTop: 6 * s }}>{story.headline}</div>
      <div style={{ fontSize: 22 * s, opacity: 0.6, marginTop: 8 * s }}>{story.sources}</div>
    </div>
  );
};

// Hook title over the spinning globe (upper part on phones, low on 16:9).
export const HookTitle = ({ title, sub, from, to }: { title: string; sub: string; from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const o = interpolate(frame, [from, from + 10, to - 6, to + 4], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const shadow = (px: number) => `0 ${px * s}px ${px * 5 * s}px rgba(0,0,0,0.8)`;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: vertical ? "flex-start" : "flex-end", paddingTop: vertical ? height * 0.2 : 0, paddingBottom: vertical ? 0 : 150 * s, opacity: o, fontFamily: style.font, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>
      <div style={{ fontSize: 110 * s, fontWeight: 900, textShadow: shadow(6) }}>{title}</div>
      <div style={{ fontSize: 44 * s, fontWeight: 700, opacity: 0.9, textShadow: shadow(4) }}>{sub}</div>
    </div>
  );
};

// Small on-screen credit (bottom right, above the captions on phones).
export const MapCredit = ({ text = "Imagery: NASA Blue Marble · Borders: Natural Earth" }: { text?: string }) => {
  const { width, height } = useVideoConfig();
  return <div style={{ position: "absolute", right: 24, bottom: height > width ? height * 0.2 : 14, fontFamily: style.font, fontSize: Math.min(width, height) / 60, color: "rgba(255,255,255,0.6)" }}>{text}</div>;
};
