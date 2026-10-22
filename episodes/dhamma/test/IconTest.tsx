import { AbsoluteFill, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { camAt } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { PointLabel } from "../../../components/Labels";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CAPTION_TOP, clamp, font, HeadCard, LAYOUT, view } from "../../thaihistory/news/kit";
import { Baby, Crown, Figure, Gate, HorseRider, IconLabel, IconPanel, Moon, Mountains, Palace, Stars, usePop } from "../kit/Icons";
import { DhammaBar, LEAF, Night } from "../kit/Mural";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Icon-style look test for ตามรอยธรรม (hook + setup, ~15 s): gold-on-lacquer pictograms instead of AI murals;
// AI art only as portraits on the story card.
const BEATS = buildBeats(timing, beatsText, LAYOUT).slice(0, 2);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, k = 0.5) => {
  const b = B[id];
  const hit = (b.words ?? []).find((w) => w.w === word);
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const ICON_TEST_FRAMES = B.setup.end + 30;

const KAPILA: [number, number] = [83.09, 27.51];
const FOOTHILLS = bbox([[82.0, 26.6], [84.4, 28.6]]);
const PLAIN = bbox([[79.5, 23.5], [88.5, 30.2]]);
const T = { setup: B.setup.start, prince: wf("setup", "เจ้า", 0.3), all: wf("setup", "มี", 0.45), palace: wf("setup", "วัง", 0.62), wife: wf("setup", "ชายา", 0.74), son: wf("setup", "โอรส", 0.88) };

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

// Hook: the prince gallops out of the palace gate under the moon.
const Escape = () => {
  const frame = useCurrentFrame();
  return (
    <IconPanel id="i0" anchor={KAPILA} start={-12} end={T.setup + 14}>
      {(g) => {
        const run = interpolate(frame, [0, T.setup], [0, 1], clamp);
        return (
          <g>
            <Stars g={g} />
            <Moon x={g.x + g.W * 0.82} y={g.y + 80 * g.s} r={34 * g.s} />
            <Gate x={g.x + g.W * 0.18} y={g.ground + 10 * g.s} size={260 * g.s} />
            <HorseRider x={g.x + g.W * (0.32 + 0.4 * run)} y={g.ground + 10 * g.s} size={250 * g.s} phase={frame * 0.6} />
          </g>
        );
      }}
    </IconPanel>
  );
};

// Setup: 2,600 years ago under the Himalaya → a prince with a crown → three palaces → wife → son.
const Everything = () => {
  const frame = useCurrentFrame();
  const kM = usePop(T.setup);
  const kC = usePop(T.prince);
  const kP = [0, 1, 2].map((i) => usePop(T.palace + i * 7));
  const kW = usePop(T.wife);
  const kS = usePop(T.son);
  const kA = usePop(T.all);
  const years = Math.round(interpolate(frame, [T.setup + 5, T.setup + 35], [0, 2600], clamp));
  return (
    <>
      <IconPanel id="i1" anchor={KAPILA} start={T.setup} end={T.prince + 14}>
        {(g) => (
          <g>
            <Mountains x={g.cx - 220 * g.s} y={g.ground + 20 * g.s} size={210 * g.s} k={kM} />
            <Mountains x={g.cx + 220 * g.s} y={g.ground + 20 * g.s} size={240 * g.s} k={kM} flip />
            <text x={g.cx} y={g.y + g.H * 0.55} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110 * g.s} fill={LEAF}>
              {years.toLocaleString("en-US")}
            </text>
            <IconLabel x={g.cx} y={g.y + g.H * 0.55 + 46 * g.s} text="ปีก่อน · เชิงเขาหิมาลัย" s={g.s} k={kM} />
          </g>
        )}
      </IconPanel>
      <IconPanel id="i2" anchor={KAPILA} start={T.prince} end={T.palace + 14}>
        {(g) => (
          <g>
            <circle cx={g.cx} cy={g.ground - 110 * g.s} r={(120 + 8 * Math.sin(frame * 0.12)) * g.s * kC} fill={LEAF} opacity={0.12} />
            <Crown x={g.cx} y={g.ground + 20 * g.s} size={290 * g.s} k={kC} />
            <IconLabel x={g.cx - 260 * g.s} y={g.ground - 120 * g.s} text="เจ้าชาย" s={g.s * 1.3} k={kC} />
            <IconLabel x={g.cx + 260 * g.s} y={g.ground - 120 * g.s} text="มีทุกอย่าง" s={g.s * 1.3} k={kA} />
          </g>
        )}
      </IconPanel>
      <IconPanel id="i3" anchor={KAPILA} start={T.palace} end={ICON_TEST_FRAMES + 20}>
        {(g) => {
          const shift = interpolate(frame, [T.wife, T.wife + 15], [0, 1], clamp);
          return (
            <g>
              {["ร้อน", "ฝน", "หนาว"].map((t, i) => {
                const px = g.cx + (i - 1) * 270 * g.s * (1 - 0.45 * shift) - 230 * g.s * shift;
                return (
                  <g key={t}>
                    <Palace x={px} y={g.ground - 30 * g.s} size={(230 - 100 * shift) * g.s} k={kP[i]} />
                    <IconLabel x={px} y={g.ground + 4 * g.s} text={`หน้า${t}`} s={g.s * (1 - 0.3 * shift)} k={kP[i]} />
                  </g>
                );
              })}
              <Figure x={g.cx + 180 * g.s} y={g.ground - 10 * g.s} size={250 * g.s} k={kW} crown />
              <Figure x={g.cx + 330 * g.s} y={g.ground - 10 * g.s} size={225 * g.s} k={kW} wide={1.2} />
              <Baby x={g.cx + 255 * g.s} y={g.ground - 10 * g.s} size={100 * g.s} k={kS} />
            </g>
          );
        }}
      </IconPanel>
    </>
  );
};

export const DhammaIconTest = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(FOOTHILLS, width, height, 1.1, 0.1) },
      { frame: T.setup, cam: view(FOOTHILLS, width, height, 1.1, 0.1) },
      { frame: T.setup + 40, cam: view(PLAIN, width, height, 0.9, 0.1) },
      { frame: T.palace, cam: view(PLAIN, width, height, 0.9, 0.1) },
      { frame: T.palace + 40, cam: view(FOOTHILLS, width, height, 1.1, 0.1) },
    ],
    frame,
  );
  const night = interpolate(frame, [0, T.setup, T.setup + 30], [1, 1, 0.15], clamp);
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
      <Sfx src={SFX.tick} at={T.setup + 5} volume={0.3} />
      <Sfx src={SFX.pop} at={T.prince} volume={0.35} />
      {[0, 1, 2].map((i) => <Sfx key={i} src={SFX.pop} at={T.palace + i * 7} volume={0.3} />)}
      <Sfx src={SFX.pop} at={T.wife} volume={0.3} />
      <Sfx src={SFX.pop} at={T.son} volume={0.35} />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "ganga" }]} />
        <Night k={night} />
        <PointLabel at={KAPILA} text="กบิลพัสดุ์" start={6} color={LEAF} size={0.9} />
        {frame < T.setup + 20 && <Arrow points={[KAPILA, [83.25, 27.2], [83.2, 26.95]]} start={20} end={80} color={LEAF} width={14} />}
        <Escape />
        <Everything />
      </MapFrame>
      {frame >= T.setup - 4 && <DhammaBar chapter="ประสูติถึงตรัสรู้" when="ราว 2,600 ปีก่อน" />}
      <HeadCard
        heads={[
          { f: T.setup, tag: "ราว 2,600 ปีก่อน · เชิงเขาหิมาลัย", head: "เจ้าชายผู้มีทุกอย่าง", color: LEAF },
          { f: T.prince, tag: "เจ้าชายแห่งศากยะ", head: "เจ้าชายสิทธัตถะ", color: LEAF, portrait: "dhamma/siddhattha_prince" },
          { f: T.palace, tag: "มีทุกอย่าง", head: "วัง 3 หลัง ตาม 3 ฤดู", color: LEAF, portrait: "dhamma/siddhattha_prince" },
          { f: T.wife, tag: "ชายา", head: "พระนางยโสธรา", color: LEAF, portrait: "dhamma/yasodhara" },
          { f: T.son, tag: "และพระโอรส", head: "ราหุล", color: LEAF, portrait: "dhamma/yasodhara" },
        ]}
        from={T.setup}
        to={ICON_TEST_FRAMES}
      />
      <HookTitle />
      <Caption text={B.setup.text} spoken={B.setup.spoken} words={B.setup.words} start={B.setup.start} len={B.setup.len} font={font} top={CAPTION_TOP + 0.03} />
    </AbsoluteFill>
  );
};
