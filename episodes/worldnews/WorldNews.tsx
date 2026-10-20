import { geoInterpolate } from "d3-geo";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, globeCam, type Cam, type CamKey } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { countries, country } from "../../components/data";
import { PointLabel } from "../../components/Labels";
import { MapFrame, Sphere, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Route } from "../../components/Route";
import { SFX, Sfx } from "../../components/Sound";
import { style } from "../../components/style";
import beatsText from "./beats.json";
import { FranceScene } from "./France";
import { BrazilScene, CanadaScene, GazaScene, IranScene, JapanScene, SudanScene, UkraineScene } from "./Scenes";
import { EDITION, STORIES, type Story } from "./stories";
import timing from "./timing.json";

// Daily world-news map. Data: npm run imagery -- bluemarble world ; npm run sfx
export const FPS = 30;
const LEAD = 15;
const GAP = 8;
const TAIL = 30;
const RED = "#ff3b30";

type Word = { w: string; s: number; e: number };
export const BEATS = (() => {
  let f = LEAD;
  return (timing as { id: string; file: string; sec: number; words?: Word[] }[]).map((t, i) => {
    const len = Math.ceil(t.sec * FPS);
    const b = { ...t, start: f, len, end: f + len, caption: beatsText[i].caption ?? beatsText[i].text, spoken: beatsText[i].text };
    f += len + GAP;
    return b;
  });
})();
export const NEWS_FRAMES = BEATS[BEATS.length - 1].end + TAIL;
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.9 * s} />;
};

// The country in today's story: red wash + glowing outline.
const Highlight = ({ story, opacity }: { story: Story; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  const d = path(country(story.country)) ?? "";
  return (
    <g opacity={opacity}>
      <path d={d} fill={RED} fillOpacity={0.32} />
      <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
      <path d={d} fill="none" stroke="#ff8a80" strokeWidth={2.5 * s} strokeLinejoin="round" />
    </g>
  );
};

const TopBar = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const current = STORIES.findIndex((st) => frame >= B[st.id].start - 10 && frame < B[st.id].end + GAP);
  return (
    <div
      style={{
        position: "absolute",
        top: vertical ? height * 0.045 : 34 * s,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: "center",
        justifyContent: vertical ? "flex-start" : "space-between",
        gap: 12 * s,
        padding: `0 ${50 * s}px`,
        fontFamily: style.font,
        color: "#fff",
        lineHeight: 1.4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 38 * s }}>{EDITION.title}</div>
        <div style={{ fontSize: 32 * s, fontWeight: 700, opacity: 0.9 }}>{EDITION.date}</div>
      </div>
      <div style={{ display: "flex", gap: 10 * s }}>
        {STORIES.map((st, i) => (
          <div
            key={st.id}
            style={{
              width: 38 * s,
              height: 10 * s,
              borderRadius: 5 * s,
              background: i === current ? RED : i < current || frame > B.japan.end ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const StoryCard = ({ story, index }: { story: Story; index: number }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const b = B[story.id];
  const inAt = b.start + 18;
  const outAt = b.end + GAP;
  if (frame < inAt || frame > outAt) return null;
  const k = spring({ frame: frame - inAt, fps, config: { damping: 14 } });
  const o = interpolate(frame, [outAt - 8, outAt], [1, 0], clamp);
  const statK = interpolate(frame, [inAt + 6, inAt + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <div
      style={{
        position: "absolute",
        left: vertical ? 50 * s : 60 * s,
        right: vertical ? 50 * s : undefined,
        top: vertical ? height * 0.13 : 120 * s,
        width: vertical ? undefined : 640 * s,
        transform: `translateX(${(1 - k) * -60 * s}px)`,
        opacity: k * o,
        fontFamily: style.font,
        color: "#fff",
        background: "rgba(8,14,26,0.86)",
        borderLeft: `${8 * s}px solid ${RED}`,
        borderRadius: 14 * s,
        padding: `${22 * s}px ${30 * s}px`,
        boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`,
        lineHeight: 1.45,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s, fontSize: 28 * s, fontWeight: 700 }}>
        <span style={{ opacity: 0.7 }}>{index + 1}/{STORIES.length}</span>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s }}>{story.tag}</span>
      </div>
      <div style={{ fontSize: 60 * s, fontWeight: 900, marginTop: 4 * s }}>{story.name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 * s, transform: `scale(${0.6 + 0.4 * statK})`, transformOrigin: "left center", opacity: statK }}>
        <span style={{ fontSize: 92 * s, fontWeight: 900, color: "#ff6b5f", lineHeight: 1.2 }}>{story.stat}</span>
        <span style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.9 }}>{story.statLabel}</span>
      </div>
      <div style={{ fontSize: 34 * s, fontWeight: 700, marginTop: 6 * s }}>{story.headline}</div>
      <div style={{ fontSize: 22 * s, opacity: 0.6, marginTop: 8 * s }}>{story.sources}</div>
    </div>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.outro.start, B.outro.start + 12], [0, 1], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, fontFamily: style.font, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
      <div style={{ background: "rgba(8,14,26,0.82)", padding: `${24 * s}px ${50 * s}px`, borderRadius: 18 * s, border: `${3 * s}px solid ${RED}` }}>
        <div style={{ fontSize: 76 * s, fontWeight: 900 }}>{EDITION.title}</div>
        <div style={{ fontSize: 36 * s, opacity: 0.85 }}>ทุกวัน · กดติดตามเพจไว้ แล้วพบกันพรุ่งนี้</div>
      </div>
    </AbsoluteFill>
  );
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const o = interpolate(frame, [LEAD, LEAD + 10, B.hook.end - 6, B.hook.end + 4], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: vertical ? "flex-start" : "flex-end", paddingTop: vertical ? height * 0.2 : 0, paddingBottom: vertical ? 0 : 150 * s, opacity: o, fontFamily: style.font, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>
      <div style={{ fontSize: 110 * s, fontWeight: 900, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.8)` }}>8 ข่าวใหญ่ทั่วโลก</div>
      <div style={{ fontSize: 44 * s, fontWeight: 700, opacity: 0.9, textShadow: `0 ${4 * s}px ${20 * s}px rgba(0,0,0,0.8)` }}>ใน 24 ชั่วโมง · สรุปใน 90 วินาที</div>
    </AbsoluteFill>
  );
};

export const WorldNews = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.min(width, height) * 0.42;

  // Camera: spin during the hook, then for every story pull back to globe size at the great-circle midpoint
  // and push in on the story's focus, landing ~1 s after its beat starts.
  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(-20, 20, width, height, 0.42) },
    { frame: B.hook.end, cam: globeCam(10, 30, width, height, 0.42) },
  ];
  let prev: Cam = keys[1].cam;
  for (const st of STORIES) {
    const b = B[st.id];
    // On phones the illustration panel sits in the lower half, so aim the camera lower: the place moves up.
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    const target: Cam = { lon: st.focus[0], lat: st.focus[1] - (height > width ? (height * 0.11) / pxPerDeg : 0), scale: R * st.zoom };
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [target.lon, target.lat])(0.5);
    keys.push({ frame: b.start - 12, cam: prev });
    keys.push({ frame: b.start + 8, cam: { lon: mlon, lat: mlat, scale: R * 1.05 }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: b.start + 32, cam: target, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: b.end, cam: { ...target, scale: target.scale * 1.06 }, easing: (t) => t });
    prev = { ...target, scale: target.scale * 1.06 };
  }
  keys.push({ frame: B.outro.start, cam: prev });
  keys.push({ frame: B.outro.start + 30, cam: globeCam(prev.lon, 15, width, height, 0.42) });
  keys.push({ frame: NEWS_FRAMES, cam: globeCam(prev.lon + 20, 15, width, height, 0.42) });
  const cam = camAt(keys, frame);

  const active = STORIES.find((st) => frame >= B[st.id].start - 4 && frame < B[st.id].end + GAP);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + GAP}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {STORIES.map((st) => (
        <Sfx key={st.id} src={SFX.whoosh} at={B[st.id].start - 10} volume={0.3} />
      ))}
      {STORIES.map((st) => (
        <Sfx key={`p${st.id}`} src={SFX.pop} at={B[st.id].start + 34} volume={0.35} />
      ))}
      <Sfx src={SFX.swell} at={LEAD} volume={0.35} />
      <MapFrame cam={cam}>
        <Sphere />
        <Raster layers={[{ name: "world", opacity: 0.85 }]} />
        <Borders />
        {STORIES.map((st) => {
          const b = B[st.id];
          const o = interpolate(frame, [b.start + 20, b.start + 34, b.end + GAP - 6, b.end + GAP + 6], [0, 1, 1, 0], clamp);
          return <Highlight key={st.id} story={st} opacity={o} />;
        })}
        {active?.route && <Route from={active.route.from} to={active.route.to} start={B[active.id].start + 34} end={B[active.id].start + 90} color="#ffd36b" />}
        <FranceScene beat={B.france} gap={GAP} />
        <UkraineScene beat={B.ukraine} gap={GAP} />
        <IranScene beat={B.iran} gap={GAP} />
        <GazaScene beat={B.gaza} gap={GAP} />
        <SudanScene beat={B.sudan} gap={GAP} />
        <BrazilScene beat={B.brazil} gap={GAP} />
        <CanadaScene beat={B.canada} gap={GAP} />
        <JapanScene beat={B.japan} gap={GAP} />
        {active?.pins.map((p) => (
          <PointLabel key={p.label} at={p.at} text={p.label} start={B[active.id].start + 34} color={RED} size={0.9} />
        ))}
      </MapFrame>
      <TopBar />
      <HookTitle />
      {STORIES.map((st, i) => (
        <StoryCard key={st.id} story={st} index={i} />
      ))}
      <Outro />
      {BEATS.filter((b) => b.id !== "outro").map((b) => (
        <Caption key={b.id} text={b.caption} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={style.font} />
      ))}
      <div
        style={{
          position: "absolute",
          right: 24,
          bottom: height > width ? height * 0.2 : 14,
          fontFamily: style.font,
          fontSize: Math.min(width, height) / 60,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Imagery: NASA Blue Marble · Borders: Natural Earth
      </div>
    </AbsoluteFill>
  );
};
