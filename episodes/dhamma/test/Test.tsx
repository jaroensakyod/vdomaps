import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import { CAPTION_TOP, clamp, font, HeadCard, LAYOUT, view } from "../../thaihistory/news/kit";
import { DhammaBar, LEAF, MuralPanel } from "../kit/Mural";
import beatsText from "./beats.json";
import timing from "./timing.json";

// 20-second look test for ตามรอยธรรม ep 1 (hook → setup → night): news map + mural panels + word-timed captions.
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, k = 0.5) => {
  const b = B[id];
  const hit = (b.words ?? []).find((w) => w.w === word);
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const DHAMMA_TEST_FRAMES = totalFrames(BEATS, LAYOUT);

const KAPILA: [number, number] = [83.05, 27.55]; // approximate (Tilaurakot / Piprahwa debate)
const FOOTHILLS = bbox([[82.0, 26.6], [84.4, 28.6]]);
const PLAIN = bbox([[79.5, 23.5], [88.5, 30.2]]);
const T = { setup: B.setup.start, palace: wf("setup", "วัง", 0.6), wife: wf("setup", "ชายา", 0.75), night: B.night.start, ride: wf("night", "ทรง", 0.5) };
const DIR = "dhamma/ep01";

// Night over the imagery: a blue grade, strength k.
const Night = ({ k }: { k: number }) => {
  const { width, height } = useMap();
  return <rect width={width} height={height} fill="#040a1f" opacity={0.55 * k} />;
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.12, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 120 * s, fontWeight: 900 }}>ทิ้ง<span style={{ color: LEAF }}>บัลลังก์</span></div>
        <div style={{ fontSize: 110 * s, fontWeight: 900 }}>เพื่ออะไร?</div>
      </div>
    </AbsoluteFill>
  );
};

export const DhammaTest = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(FOOTHILLS, width, height, 1.1, 0.1) },
      { frame: T.setup, cam: view(FOOTHILLS, width, height, 1.1, 0.1) },
      { frame: T.setup + 40, cam: view(PLAIN, width, height, 0.9, 0.1) },
      { frame: T.night, cam: view(PLAIN, width, height, 0.9, 0.1) },
      { frame: T.night + 40, cam: view(FOOTHILLS, width, height, 1.0, 0.1) },
    ],
    frame,
  );
  const night = interpolate(frame, [0, T.setup, T.setup + 30, T.night, T.night + 30], [1, 1, 0.15, 0.15, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sfx src={SFX.hit} at={0} volume={0.6} />
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.setup - 6} volume={0.35} />
      <Sfx src={SFX.pop} at={T.palace} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.night - 6} volume={0.35} />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "ganga" }]} />
        <Night k={night} />
        <PointLabel at={KAPILA} text="กบิลพัสดุ์" start={6} color={LEAF} size={0.9} />
        {frame >= T.ride && <Arrow points={[KAPILA, [83.4, 27.2], [83.8, 26.9]]} start={T.ride} end={T.ride + 50} color={LEAF} width={16} />}
        <MuralPanel id="t1" dir={DIR} img="renounce" anchor={KAPILA} start={-12} end={T.setup + 14} from={{ x: 0.5, y: 0.55, z: 1.25 }} to={{ x: 0.45, y: 0.55, z: 1.05 }} />
        <MuralPanel id="t2" dir={DIR} img="palace" anchor={KAPILA} start={T.setup} end={T.palace + 14} from={{ x: 0.5, y: 0.4, z: 1.0 }} to={{ x: 0.35, y: 0.5, z: 1.3 }} />
        <MuralPanel id="t2b" dir={DIR} img="palace" anchor={KAPILA} start={T.palace} end={T.wife + 14} from={{ x: 0.7, y: 0.6, z: 1.5 }} to={{ x: 0.6, y: 0.55, z: 1.2 }} />
        <MuralPanel id="t3" dir={DIR} img="farewell" anchor={KAPILA} start={T.wife} end={T.night + 14} from={{ x: 0.6, y: 0.5, z: 1.1 }} to={{ x: 0.6, y: 0.5, z: 1.3 }} />
        <MuralPanel id="t4" dir={DIR} img="renounce" anchor={KAPILA} start={T.night} end={B.night.end + 40} from={{ x: 0.3, y: 0.6, z: 1.5 }} to={{ x: 0.6, y: 0.6, z: 1.5 }} />
      </MapFrame>
      {frame >= T.setup - 4 && <DhammaBar chapter="ประสูติถึงตรัสรู้" when="ราว 2,600 ปีก่อน" />}
      <HeadCard
        heads={[
          { f: T.setup, tag: "ราว 2,600 ปีก่อน · เชิงเขาหิมาลัย", head: "เจ้าชายผู้มีทุกอย่าง", color: LEAF },
          { f: T.palace, tag: "มีทุกอย่าง", head: "วัง 3 หลัง · ชายา · พระโอรส", color: LEAF },
          { f: T.night, tag: "คืนเดียว", head: "ทิ้งไปทั้งหมด", color: LEAF },
        ]}
        from={T.setup}
        to={DHAMMA_TEST_FRAMES}
      />
      <HookTitle />
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP + 0.03} />
      ))}
    </AbsoluteFill>
  );
};
