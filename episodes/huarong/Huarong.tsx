import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt, camForFeature, type CamKey } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { bbox, Region, region } from "../../components/Region";
import { SFX, Sfx } from "../../components/Sound";
import { buildBeats, LAYOUT, totalFrames } from "../../components/subs.mjs";
import { P } from "../redcliffs/geo";
import { Badge, C, fonts, InkLabel, PaperMap, PaperTexture } from "../redcliffs/Parchment";
import beatsText from "./beats.json";
import { Pass, ROAD } from "./Pass";
import timing from "./timing.json";

// สามก๊ก: กวนอูปล่อยโจโฉที่ฮัวหยง — 1 minute, style S13 parchment (same look as ศึกผาแดง / ยืมธนู).
export const FPS = LAYOUT.fps;
export const BEATS = buildBeats(timing, beatsText);
export const TOTAL_FRAMES = totalFrames(BEATS);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, (typeof BEATS)[number]>;
const at = (id: string, k: number) => Math.round(B[id].start + B[id].len * k);

const RETREAT_VIEW = bbox([[111.7, 29.1], [114.1, 30.7]]);
const PASS_VIEW = bbox([[112.44, 29.45], [112.78, 29.67]]);
const JING_VIEW = bbox([[107.5, 24.0], [117.5, 34.5]]);
// Jing province (荊州) around 208, very rough — shown as "approximate".
const JINGZHOU = region([[108.6, 33.4], [112.5, 33.6], [114.6, 32.0], [115.8, 30.0], [114.3, 28.6], [114.2, 25.4], [111.3, 24.8], [109.3, 25.6], [108.6, 28.4], [109.6, 30.8]]);

const T = {
  arrive: at("plead", 0.25),
  release: at("release", 0.25),
  through: at("release", 0.95),
  stamp: at("history", 0.05),
  mud: at("history", 0.6),
  straw: at("mud", 0.05),
  strawEnd: at("mud", 0.4),
  march: at("mud", 0.2),
  marchEnd: at("mud", 0.62),
  fire: at("mud", 0.72),
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const fade = (f: number, a: number, b: number, c?: number, d?: number) =>
  c === undefined ? interpolate(f, [a, b], [0, 1], clamp) : interpolate(f, [a, b, c, d!], [0, 1, 1, 0], clamp);
const useUnit = () => {
  const { width, height, fps } = useVideoConfig();
  const vertical = height > width;
  // 9:16 is watched on phones: overlay cards and text 1.3× larger than in 16:9
  return { width, height, fps, s: (Math.min(width, height) / 1080) * (vertical ? 1.3 : 1), vertical };
};
const card = (s: number) =>
  ({
    background: "rgba(239,225,187,0.94)",
    border: `${3 * s}px solid ${C.ink}`,
    boxShadow: `0 ${8 * s}px ${24 * s}px rgba(40,25,10,0.4)`,
    color: C.ink,
    fontFamily: fonts.body,
  }) as const;

// A card that pops in at `from` and fades at `to`; 16:9 sits on the right, 9:16 in the upper third.
const SideCard = ({ from, to, children, tilt = -2 }: { from: number; to: number; children: ReactNode; tilt?: number }) => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const o = fade(frame, from, from + 8, to - 10, to);
  if (o <= 0) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-end", justifyContent: vertical ? "flex-start" : "center", paddingTop: vertical ? height * 0.2 : 0, paddingRight: vertical ? 0 : 90 * s, opacity: o }}>
      <div style={{ ...card(s), width: 540 * s, padding: `${22 * s}px ${34 * s}px`, transform: `scale(${0.8 + 0.2 * k}) rotate(${tilt * k}deg)`, position: "relative" }}>{children}</div>
    </AbsoluteFill>
  );
};

const Seal = ({ text, at: when, color = C.wu }: { text: string; at: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { s, fps } = useUnit();
  const k = spring({ frame: frame - when, fps, config: { damping: 9 } });
  if (frame < when) return null;
  return (
    <div style={{ position: "absolute", right: -34 * s, top: -34 * s, width: 104 * s, height: 104 * s, background: "rgba(239,225,187,0.9)", border: `${5 * s}px solid ${color}`, color, borderRadius: 10 * s, fontSize: 34 * s, fontFamily: "'Microsoft YaHei', 'SimSun', serif", display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: `scale(${k}) rotate(-12deg)`, opacity: Math.min(1, k) * 0.92 }}>
      {text}
    </div>
  );
};

const Title = () => {
  const frame = useCurrentFrame();
  const { s, height, vertical } = useUnit();
  const o = fade(frame, at("hook", 0.55), at("hook", 0.65), B.hook.end + 4, B.hook.end + 18);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? height * 0.13 : 60 * s, opacity: o }}>
      <div style={{ ...card(s), textAlign: "center", padding: `${12 * s}px ${50 * s}px ${16 * s}px`, outline: `${2 * s}px solid ${C.ink}`, outlineOffset: `${6 * s}px` }}>
        <div style={{ fontSize: 30 * s, color: C.wu, fontWeight: 700, lineHeight: 1.5 }}>สามก๊ก · กวนอูที่ทางแคบฮัวหยง</div>
        <div style={{ fontFamily: fonts.title, fontSize: (vertical ? 64 : 84) * s, lineHeight: 1.3 }}>
          ปล่อยโจโฉ
          <br />
          <span style={{ color: C.wu }}>ทั้งที่ต้องตาย?</span>
        </div>
        <div style={{ fontSize: 30 * s, lineHeight: 1.5, opacity: 0.8 }}>ค.ศ. 208 · หลังศึกผาแดง</div>
      </div>
    </AbsoluteFill>
  );
};

// Kongming reads the stars (novel): a few twinkling stars + a note.
const Stars = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useUnit();
  const o = fade(frame, B.kongming.start, B.kongming.start + 15, B.kongming.end, B.kongming.end + 12);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(30,30,60,0.55), rgba(30,30,60,0) 55%)" }} />
      <svg width={width} height={height}>
        {Array.from({ length: 16 }, (_, i) => {
          const x = random(`sx${i}`) * width;
          const y = random(`sy${i}`) * height * 0.4;
          const r = (3 + random(`sr${i}`) * 5) * s * (0.7 + 0.3 * Math.sin(frame * 0.2 + i));
          return <path key={i} d={`M${x} ${y - r * 2} L${x + r * 0.5} ${y - r * 0.5} L${x + r * 2} ${y} L${x + r * 0.5} ${y + r * 0.5} L${x} ${y + r * 2} L${x - r * 0.5} ${y + r * 0.5} L${x - r * 2} ${y} L${x - r * 0.5} ${y - r * 0.5} Z`} fill="#fff6dd" />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const NovelStamp = () => {
  const frame = useCurrentFrame();
  const { s, fps, width, height, vertical } = useUnit();
  const o = fade(frame, T.stamp, T.stamp + 4, B.history.end - 6, B.history.end + 6); // the mud part is the record, not the novel
  if (o <= 0) return null;
  const hit = spring({ frame: frame - T.stamp, fps, config: { damping: 10, mass: 0.7 } });
  const park = interpolate(frame, [T.stamp + 34, T.stamp + 52], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = width / 2 + ((vertical ? width / 2 : width - 230 * s) - width / 2) * park;
  const y = height * 0.45 + ((vertical ? height * 0.14 : 110 * s) - height * 0.45) * park;
  const k = (2.2 - 1.2 * hit) * (1 - 0.45 * park);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translate(-50%,-50%) scale(${k}) rotate(-10deg)`, border: `${6 * s}px solid ${C.wu}`, color: C.wu, fontFamily: fonts.title, fontSize: 64 * s, lineHeight: 1.3, padding: `${4 * s}px ${26 * s}px`, borderRadius: 12 * s, background: "rgba(239,225,187,0.6)", whiteSpace: "nowrap" }}>
      ฉากนี้มีแค่ในนิยาย
    </div>
  );
};

// Cao's line from the record, then the "too late" fire note.
const Quote = () => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const from = at("mud", 0.62);
  const o = fade(frame, from, from + 8, B.mud.end + 6, B.mud.end + 18);
  if (o <= 0) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-start", justifyContent: vertical ? "flex-start" : "flex-end", padding: vertical ? `${height * 0.13}px 0 0` : `0 0 ${200 * s}px ${80 * s}px`, opacity: o }}>
      <div style={{ ...card(s), maxWidth: 640 * s, padding: `${16 * s}px ${30 * s}px`, borderLeft: `${14 * s}px solid ${C.wei}`, transform: `translateY(${(1 - k) * 30 * s}px)` }}>
        <div style={{ fontSize: 34 * s, fontWeight: 700, lineHeight: 1.5 }}>“เล่าปี่ฉลาดพอ ๆ กับเรา แต่ได้แผนช้าไปหน่อย”</div>
        <div style={{ fontSize: 24 * s, lineHeight: 1.5, opacity: 0.75 }}>โจโฉ · ตามบันทึกซันหยางกงไจ้จี้</div>
      </div>
    </AbsoluteFill>
  );
};

const NextCard = () => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const from = at("next", 0.5);
  if (frame < from) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-end", padding: vertical ? `${height * 0.2}px 0 0` : `${70 * s}px ${70 * s}px 0 0` }}>
      <div style={{ ...card(s), padding: `${16 * s}px ${36 * s}px`, transform: `scale(${k})`, textAlign: "center" }}>
        <div style={{ fontSize: 30 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตอนต่อไป ▶</div>
        <div style={{ fontFamily: fonts.title, fontSize: 68 * s, lineHeight: 1.35 }}>ศึกชิงเกงจิ๋ว</div>
        <div style={{ fontSize: 28 * s, lineHeight: 1.5, opacity: 0.8 }}>ดินแดนที่ทำให้กวนอูต้องตาย</div>
      </div>
    </AbsoluteFill>
  );
};

const Credit = () => {
  const { s, height, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", right: 26 * s, bottom: vertical ? height * 0.2 : 18 * s, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.75, lineHeight: 1.4, textAlign: "right" }}>
      แผนที่: Natural Earth · ตำแหน่งและเขตแดนโดยประมาณ · เล่าตามนิยายสามก๊ก ยกเว้นช่วงท้าย
    </div>
  );
};

const Sounds = () => (
  <>
    <Sfx src={SFX.whoosh} at={B.hook.start + 20} />
    <Sfx src={SFX.hit} at={at("hook", 0.62)} volume={0.45} />
    <Sfx src={SFX.pop} at={B.pledge.start + 2} volume={0.3} />
    <Sfx src={SFX.hit} at={B.pledge.start + 20} volume={0.35} />
    <Sfx src={SFX.swell} at={B.debt.start} volume={0.25} />
    <Sfx src={SFX.whoosh} at={B.plead.start - 6} />
    <Sfx src={SFX.whoosh} at={T.release} volume={0.3} />
    <Sfx src={SFX.swell} at={B.kongming.start} volume={0.25} />
    <Sfx src={SFX.hit} at={T.stamp} volume={0.5} />
    {Array.from({ length: 9 }, (_, i) => (
      <Sfx key={i} src={SFX.pop} at={Math.round(T.straw + ((T.strawEnd - T.straw) * i) / 9)} volume={0.2} />
    ))}
    <Sfx src={SFX.riser} at={T.fire - 50} volume={0.25} />
    <Sfx src={SFX.hit} at={T.fire} volume={0.4} />
    <Sfx src={SFX.whoosh} at={B.next.start - 4} />
    <Sfx src={SFX.swell} at={at("next", 0.5)} volume={0.3} />
  </>
);

// captions={false} for thumbnails, where the headline replaces the subtitle.
export const Huarong = ({ captions = true }: { captions?: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const retreat = fit(RETREAT_VIEW);
  const pass = fit(PASS_VIEW, 0.04);
  const jing = fit(JING_VIEW);

  const keys: CamKey[] = [
    { frame: 0, cam: { ...retreat, lon: retreat.lon + 0.5, scale: retreat.scale * 0.9 } },
    { frame: at("hook", 0.5), cam: retreat },
    { frame: B.pledge.start + 10, cam: retreat },
    { frame: B.plead.start + 25, cam: pass },
    { frame: B.next.start + 10, cam: pass },
    { frame: B.next.start + 50, cam: jing },
  ];
  const cam = camAt(keys, frame);
  const flash = frame >= at("next", 0.3) ? 0.55 + 0.25 * Math.sin((frame - at("next", 0.3)) * 0.3) : 0;

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sounds />
      <MapFrame cam={cam}>
        <PaperMap />
        <Region feature={JINGZHOU} color={C.shu} opacity={flash} />
        <InkLabel at={P.redCliffs} text="ผาแดง" start={0} end={B.pledge.end} dy={44} color={C.wu} />
        <InkLabel at={P.jiangling} text="เกงจิ๋ว (กังเหลง)" start={B.pledge.start} end={B.plead.start + 20} dy={44} />
        <Arrow points={[P.wulin, [113.1, 29.6], ROAD[0], P.huarong]} start={B.hook.start + 10} end={at("hook", 0.6)} color={C.wei} width={22} variant="dashed" opacity={1 - fade(frame, B.plead.start, B.plead.start + 20)} />
        <InkLabel at={P.huarong} text="ทางแคบฮัวหยง · ตำแหน่งโดยประมาณ" start={at("hook", 0.55)} end={B.plead.start + 10} dot={false} dy={60} />
        <InkLabel at={[112.5, 29.655]} text="ทางแคบฮัวหยง · ตำแหน่งโดยประมาณ" start={B.plead.start + 20} end={B.release.start} dot={false} />
        <Pass appear={B.plead.start + 10} until={B.next.start + 30} arrive={T.arrive} release={T.release} through={T.through} historyAt={T.stamp} mudAt={T.mud} strawStart={T.straw} strawEnd={T.strawEnd} marchStart={T.march} marchEnd={T.marchEnd} fireAt={T.fire} />
        <Badge at={[P.huarong[0] - 0.02, P.huarong[1] + 0.012]} name="กวนอู" sub="ทหาร 500 คน" color={C.shu} start={at("hook", 0.62)} end={T.stamp + 12} />
        <Badge at={[ROAD[1][0] + 0.005, ROAD[1][1] - 0.012]} name="โจโฉ" sub="เหลือทหารไม่กี่ร้อย" color={C.wei} start={B.plead.start + 30} end={T.through} above={false} />
        <Badge at={[ROAD[3][0], ROAD[3][1] + 0.01]} name="โจโฉ" sub="รอด" color={C.wei} start={T.marchEnd} end={B.next.start + 20} />
        <InkLabel at={[ROAD[1][0], ROAD[1][1] - 0.035]} text="ไฟของเล่าปี่ · มาช้าไป" start={T.fire + 15} end={B.next.start + 20} dot={false} color={C.wu} />
        <InkLabel at={[112.0, 29.2]} text="เกงจิ๋ว · เขตโดยประมาณ" start={at("next", 0.35)} size={1.6} dot={false} color={C.shu} />
      </MapFrame>
      <Stars />
      <PaperTexture />
      <Title />
      <SideCard from={B.pledge.start} to={B.debt.start + 10}>
        <PledgeBody />
        <Seal text="軍令狀" at={B.pledge.start + 18} />
      </SideCard>
      <SideCard from={B.debt.start + 6} to={B.plead.start + 10} tilt={2}>
        <DebtBody />
      </SideCard>
      <SideCard from={at("kongming", 0.1)} to={B.kongming.end + 8}>
        <KongmingBody />
      </SideCard>
      <NovelStamp />
      <Quote />
      <NextCard />
      {captions &&
        BEATS.map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={fonts.body} color="#fff6dd" stroke="#2a1b0e" />
        ))}
      <Credit />
    </AbsoluteFill>
  );
};

const PledgeBody = () => {
  const { s } = useUnit();
  return (
    <>
      <div style={{ fontFamily: fonts.title, fontSize: 46 * s, lineHeight: 1.4 }}>หนังสือสัญญา</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55, marginTop: 6 * s }}>
        ถ้าปล่อยโจโฉรอดไป
        <br />
        <b style={{ color: C.wu }}>ยอมรับโทษถึงตาย</b>
      </div>
      <div style={{ fontSize: 26 * s, lineHeight: 1.5, marginTop: 10 * s, opacity: 0.8 }}>ลงชื่อ กวนอู · ต่อหน้าขงเบ้ง</div>
    </>
  );
};

const DebtBody = () => {
  const { s } = useUnit();
  return (
    <>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ย้อนไป ค.ศ. 200</div>
      <div style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.4 }}>บุญคุณของโจโฉ</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.6, marginTop: 6 * s }}>
        · ยศ ฮั่นโซ่วถิงโหว <span style={{ opacity: 0.65, fontSize: 24 * s }}>(ตามบันทึก)</span>
        <br />· ม้าเซ็กเธาว์ <span style={{ opacity: 0.65, fontSize: 24 * s }}>(ในนิยาย)</span>
      </div>
    </>
  );
};

const KongmingBody = () => {
  const { s } = useUnit();
  return (
    <>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.shu, lineHeight: 1.5 }}>ขงเบ้งดูดาว (ในนิยาย)</div>
      <div style={{ fontSize: 32 * s, lineHeight: 1.55, marginTop: 4 * s }}>
        “โจโฉยังไม่ถึงฆาต
        <br />
        ให้กวนอูได้ใช้หนี้บุญคุณ”
      </div>
    </>
  );
};
