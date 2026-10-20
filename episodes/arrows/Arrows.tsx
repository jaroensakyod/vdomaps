import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, camForFeature, globeCam, type CamKey } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { bbox } from "../../components/Region";
import { SFX, Sfx } from "../../components/Sound";
import { buildBeats, LAYOUT, totalFrames } from "../../components/subs.mjs";
import { P, VIEW } from "../redcliffs/geo";
import { Badge, C, fonts, InkLabel, PaperMap, PaperTexture } from "../redcliffs/Parchment";
import beatsText from "./beats.json";
import { CaoCamp, Fog, river, StrawFleet, SunQuanBoat } from "./Straw";
import timing from "./timing.json";

// สามก๊ก: ขงเบ้งยืมธนูแสนดอก — 1 minute, style S13 parchment (same look as ศึกผาแดง).
export const FPS = LAYOUT.fps;
export const BEATS = buildBeats(timing, beatsText);
export const TOTAL_FRAMES = totalFrames(BEATS);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, (typeof BEATS)[number]>;
const at = (id: string, k: number) => Math.round(B[id].start + B[id].len * k); // k = share of the beat

// Places (approximate). Ruxu (濡須口) sits where the Ruxu river meets the Yangtze, near present-day Wuwei.
const RUXU: [number, number] = [117.92, 31.31];
const RUXU_BOAT: [number, number] = [118.004, 31.205];
const ALLY_CAMP = river(0.62, -0.035);
const CAMP_VIEW = bbox([[113.45, 29.79], [113.72, 29.99]]);
const EAST_VIEW = bbox([[112.6, 28.9], [119.2, 32.3]]);
const RUXU_VIEW = bbox([[117.78, 31.08], [118.2, 31.4]]);

// Key moments, all tied to the VO.
const T = {
  boats: at("nothing", 0.45),
  sail: at("fog", 0.2),
  arrive: at("fog", 0.85),
  shoot: at("shoot", 0.45),
  flip: at("reveal", 0.3),
  shootEnd: at("reveal", 0.5),
  back: at("reveal", 0.55),
  home: at("reveal", 0.95),
  stamp: at("history", 0.02),
  lean: at("history", 0.55),
  turn: at("history", 0.78),
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

const Title = () => {
  const frame = useCurrentFrame();
  const { s, height, vertical } = useUnit();
  const o = fade(frame, 4, 16, B.hook.end - 16, B.hook.end);
  if (o <= 0) return null;
  const y = interpolate(frame, [4, 24], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? height * 0.13 : 70 * s, opacity: o }}>
      <div style={{ ...card(s), transform: `translateY(${y * s}px)`, textAlign: "center", padding: `${12 * s}px ${50 * s}px ${16 * s}px`, outline: `${2 * s}px solid ${C.ink}`, outlineOffset: `${6 * s}px` }}>
        <div style={{ fontSize: 30 * s, color: C.wu, fontWeight: 700, lineHeight: 1.5 }}>สามก๊ก · ขงเบ้งยืมธนูแสนดอก</div>
        {/* the hook as a question: the episode name above it no longer gives the answer away first */}
        <div style={{ fontFamily: fonts.title, fontSize: (vertical ? 64 : 84) * s, lineHeight: 1.3 }}>
          ไม่ทำธนูสักดอก
          <br />
          <span style={{ color: C.wu }}>แต่ได้มาแสนดอก?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Arrow counter + deadline card. Big in the hook, then parked in the top-left corner until the reveal.
const Counter = () => {
  const frame = useCurrentFrame();
  const { s, width, height, vertical } = useUnit();
  const o = fade(frame, 10, 22, T.home + 30, T.home + 45);
  if (o <= 0) return null;
  const park = interpolate(frame, [B.hook.end - 6, B.where.start + 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const n = Math.round(interpolate(frame, [T.shoot, T.shootEnd + 25], [0, 100000], { ...clamp, easing: Easing.in(Easing.quad) }));
  const done = frame >= T.shootEnd + 25;
  const days = frame < at("nothing", 0.12) ? 1 : frame < at("nothing", 0.4) ? 2 : 3;
  const night = frame >= B.fog.start;
  const flash = frame >= B.nothing.start && frame < T.shoot ? 0.5 + 0.5 * Math.sin(frame * 0.35) : 0;
  // centre of the big layout → corner of the parked layout
  const big = { x: width / 2, y: vertical ? height * 0.47 : height * 0.6, k: 1 };
  const small = { x: vertical ? width / 2 : 310 * s, y: vertical ? height * 0.135 : 120 * s, k: vertical ? 0.62 : 0.5 };
  const x = big.x + (small.x - big.x) * park;
  const y = big.y + (small.y - big.y) * park;
  const k = big.k + (small.k - big.k) * park;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${k})`, opacity: o, display: "flex", gap: 24 * s, alignItems: "stretch" }}>
      <div style={{ ...card(s), padding: `${14 * s}px ${36 * s}px`, textAlign: "center", borderColor: flash ? C.wu : C.ink }}>
        <div style={{ fontSize: 34 * s, fontWeight: 600, lineHeight: 1.5 }}>ลูกธนู</div>
        <div style={{ fontSize: 96 * s, fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: "tabular-nums", color: done ? C.shu : n === 0 ? C.wu : C.ink }}>
          {n.toLocaleString("th-TH")}
          {done ? "+" : ""}
        </div>
        <div style={{ fontSize: 30 * s, lineHeight: 1.5, opacity: 0.75 }}>เป้า 100,000 ดอก</div>
      </div>
      <div style={{ ...card(s), width: 190 * s, textAlign: "center", overflow: "hidden" }}>
        <div style={{ background: night ? C.ink : C.wu, color: "#fff6dd", fontSize: 30 * s, fontWeight: 700, lineHeight: 1.6 }}>{night ? "คืนที่" : "วันที่"}</div>
        <div style={{ fontSize: 100 * s, fontWeight: 700, lineHeight: 1.15 }}>{days}</div>
        <div style={{ fontSize: 28 * s, lineHeight: 1.4, opacity: 0.75 }}>จาก 3 วัน</div>
      </div>
    </div>
  );
};

// The pledge Zhuge Liang signs (in the novel): fail and he dies.
const Pledge = () => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const start = at("zhouyu", 0.55);
  const o = fade(frame, start, start + 8, B.nothing.start + 20, B.nothing.start + 32);
  if (o <= 0) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 13 } });
  const seal = spring({ frame: frame - start - 18, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-end", justifyContent: vertical ? "flex-start" : "center", paddingTop: vertical ? height * 0.36 : 0, paddingRight: vertical ? 0 : 90 * s, opacity: o }}>
      <div style={{ ...card(s), width: 520 * s, padding: `${22 * s}px ${34 * s}px`, transform: `scale(${0.8 + 0.2 * k}) rotate(${-2 * k}deg)`, position: "relative" }}>
        <div style={{ fontFamily: fonts.title, fontSize: 46 * s, lineHeight: 1.4 }}>หนังสือสัญญา</div>
        <div style={{ fontSize: 30 * s, lineHeight: 1.55, marginTop: 6 * s }}>
          ภายใน 3 วัน ส่งลูกธนู 100,000 ดอก
          <br />
          หากไม่ครบ <b style={{ color: C.wu }}>ยอมรับโทษถึงตาย</b>
        </div>
        <div style={{ fontSize: 26 * s, lineHeight: 1.5, marginTop: 10 * s, opacity: 0.8 }}>ลงชื่อ ขงเบ้ง</div>
        <div
          style={{
            position: "absolute",
            right: -34 * s,
            top: -34 * s,
            width: 104 * s,
            background: "rgba(239,225,187,0.9)",
            height: 104 * s,
            border: `${5 * s}px solid ${C.wu}`,
            color: C.wu,
            borderRadius: 10 * s,
            fontSize: 34 * s,
            fontFamily: "'Microsoft YaHei', 'SimSun', serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
            transform: `scale(${seal}) rotate(-12deg)`,
            opacity: Math.min(1, seal) * 0.9,
          }}
        >
          軍令狀
        </div>
      </div>
    </AbsoluteFill>
  );
};

// History beat: "ในนิยาย" stamp, then a novel-vs-record comparison card.
const NovelStamp = () => {
  const frame = useCurrentFrame();
  const { s, fps, width, height, vertical } = useUnit();
  const o = fade(frame, T.stamp, T.stamp + 4, B.history.end + 4, B.history.end + 16);
  if (o <= 0) return null;
  const hit = spring({ frame: frame - T.stamp, fps, config: { damping: 10, mass: 0.7 } });
  const park = interpolate(frame, [T.stamp + 34, T.stamp + 52], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = width / 2 + ((vertical ? width / 2 : width - 230 * s) - width / 2) * park;
  const y = height * 0.45 + ((vertical ? height * 0.14 : 110 * s) - height * 0.45) * park;
  const k = (2.2 - 1.2 * hit) * (1 - 0.45 * park);
  const rows = [
    { label: "ในนิยาย", who: "ขงเบ้ง", when: "ค.ศ. 208", why: "หลอกเอาลูกธนู", color: C.shu, at: at("history", 0.42) },
    { label: "ตามบันทึก", who: "ซุนกวน", when: "ค.ศ. 213 · ยี่สู", why: "กลับลำกันเรือล่ม", color: C.wu, at: at("history", 0.62) },
  ];
  return (
    <AbsoluteFill style={{ opacity: o, fontFamily: fonts.body, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `translate(-50%,-50%) scale(${k}) rotate(-10deg)`,
          border: `${6 * s}px solid ${C.wu}`,
          color: C.wu,
          fontFamily: fonts.title,
          fontSize: 64 * s,
          lineHeight: 1.3,
          padding: `${4 * s}px ${26 * s}px`,
          borderRadius: 12 * s,
          background: "rgba(239,225,187,0.6)",
          whiteSpace: "nowrap",
          opacity: Math.min(1, hit * 1.4),
        }}
      >
        ในนิยาย
      </div>
      <div style={{ position: "absolute", left: vertical ? 60 * s : 80 * s, right: vertical ? 60 * s : undefined, top: vertical ? height * 0.24 : height * 0.5, display: "flex", flexDirection: "column", gap: 14 * s }}>
        {rows.map((r) => {
          if (frame < r.at) return null;
          const p = spring({ frame: frame - r.at, fps, config: { damping: 14 } });
          return (
            <div key={r.label} style={{ ...card(s), display: "flex", alignItems: "center", gap: 18 * s, padding: `${10 * s}px ${24 * s}px`, opacity: p, transform: `translateX(${(1 - p) * -50 * s}px)`, borderLeft: `${14 * s}px solid ${r.color}` }}>
              <div style={{ fontSize: 28 * s, fontWeight: 700, color: r.color, width: 150 * s, lineHeight: 1.4 }}>{r.label}</div>
              <div style={{ fontSize: 30 * s, lineHeight: 1.45 }}>
                <b>{r.who}</b> · {r.when}
                <br />
                {r.why}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// End: fire glow around the frame and a "next episode" card pointing to ศึกผาแดง.
const NextCard = () => {
  const frame = useCurrentFrame();
  const { s, fps, height, vertical } = useUnit();
  const { start, end } = B.next;
  const glow = fade(frame, start + 10, start + 40) * (0.75 + 0.25 * Math.sin(frame * 0.25));
  const cardAt = at("next", 0.45);
  const k = spring({ frame: frame - cardAt, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ opacity: glow, background: `radial-gradient(ellipse at 50% 60%, rgba(255,122,26,0) 45%, rgba(255,122,26,0.35) 75%, rgba(198,45,20,0.6) 100%)` }} />
      {frame >= cardAt && (
        <AbsoluteFill style={{ alignItems: vertical ? "center" : "flex-end", justifyContent: vertical ? "flex-start" : "flex-start", padding: vertical ? `${height * 0.2}px 0 0` : `${70 * s}px ${70 * s}px 0 0`, opacity: fade(frame, cardAt, cardAt + 6, end + 40, end + 44) }}>
          <div style={{ ...card(s), padding: `${16 * s}px ${36 * s}px`, transform: `scale(${k})`, textAlign: "center" }}>
            <div style={{ fontSize: 30 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ดูต่อ ▶ คลิปถัดไป</div>
            <div style={{ fontFamily: fonts.title, fontSize: 72 * s, lineHeight: 1.35 }}>ศึกผาแดง</div>
            <div style={{ fontSize: 28 * s, lineHeight: 1.5, opacity: 0.8 }}>ไฟคืนเดียว ที่เปลี่ยนแผ่นดินจีน</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Dawn after the fog lifts.
const Dawn = () => {
  const frame = useCurrentFrame();
  const o = fade(frame, at("reveal", 0.4), at("reveal", 0.65), B.history.start, B.history.start + 20);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", opacity: o * 0.45, background: "linear-gradient(180deg, rgba(255,190,110,0.8), rgba(255,190,110,0) 60%)" }} />;
};

const Credit = () => {
  const { s, height, vertical } = useUnit();
  return (
    <div style={{ position: "absolute", right: 26 * s, bottom: vertical ? height * 0.2 : 18 * s, fontFamily: fonts.body, fontSize: 18 * s, color: C.ink, opacity: 0.75, lineHeight: 1.4, textAlign: "right" }}>
      แผนที่: Natural Earth · ตำแหน่งโดยประมาณ · เล่าตามนิยายสามก๊ก ยกเว้นช่วงท้าย
    </div>
  );
};

const Sounds = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.25} />
    <Sfx src={SFX.whoosh} at={B.where.start - 6} />
    <Sfx src={SFX.whoosh} at={B.where.start + 34} />
    <Sfx src={SFX.pop} at={B.where.start + 50} volume={0.3} />
    <Sfx src={SFX.pop} at={B.zhouyu.start + 10} volume={0.3} />
    <Sfx src={SFX.hit} at={at("zhouyu", 0.55) + 18} volume={0.35} />
    <Sfx src={SFX.tick} at={at("nothing", 0.12)} volume={0.5} />
    <Sfx src={SFX.tick} at={at("nothing", 0.4)} volume={0.5} />
    <Sfx src={SFX.pop} at={T.boats} volume={0.3} />
    {[0.55, 0.68, 0.81].map((k) => (
      <Sfx key={k} src={SFX.hit} at={at("fog", k)} volume={0.45} />
    ))}
    <Sfx src={SFX.riser} at={T.shoot - 20} volume={0.3} />
    {Array.from({ length: 12 }, (_, i) => (
      <Sfx key={i} src={SFX.tick} at={T.shoot + i * 7} volume={0.25} />
    ))}
    <Sfx src={SFX.hit} at={T.shootEnd + 25} volume={0.4} />
    <Sfx src={SFX.hit} at={T.stamp} volume={0.5} />
    <Sfx src={SFX.whoosh} at={T.stamp + 22} />
    <Sfx src={SFX.whoosh} at={at("history", 0.3)} />
    <Sfx src={SFX.whoosh} at={B.next.start - 4} />
    <Sfx src={SFX.swell} at={at("next", 0.4)} volume={0.3} />
  </>
);

// captions={false} for thumbnails, where the headline replaces the subtitle.
export const Arrows = ({ captions = true }: { captions?: boolean }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.06) => camForFeature(f, width, height, pad);
  const mid = fit(VIEW.mid);
  const camp = fit(CAMP_VIEW, 0.04);
  const east = fit(EAST_VIEW);
  const ruxu = fit(RUXU_VIEW, 0.04);
  const battle = fit(VIEW.battle, 0.04);

  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(98, 24, width, height, 0.4) },
    { frame: B.hook.end, cam: globeCam(108, 28, width, height, 0.42) },
    { frame: B.where.start + 40, cam: mid },
    { frame: B.where.end + 10, cam: mid },
    { frame: B.zhouyu.start + 40, cam: camp },
    { frame: T.stamp + 22, cam: camp },
    { frame: at("history", 0.3), cam: east },
    { frame: at("history", 0.5), cam: ruxu },
    { frame: B.next.start, cam: ruxu },
    { frame: B.next.start + 40, cam: { ...battle, scale: battle.scale * 0.8 } },
  ];
  const cam = camAt(keys, frame);

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sounds />
      <MapFrame cam={cam}>
        <PaperMap riverBoost={1.6 * fade(frame, B.where.end, B.zhouyu.start + 40, T.stamp + 10, T.stamp + 30)} />
        <InkLabel at={[117.2, 30.75]} text="แม่น้ำแยงซี" start={B.where.start + 40} end={B.zhouyu.start + 30} dot={false} size={1.2} color={C.river} />
        <InkLabel at={P.wulin} text="ค่ายโจโฉ" start={B.where.start + 50} end={B.zhouyu.start + 20} dy={-24} color={C.wei} />
        <InkLabel at={P.redCliffs} text="ค่ายพันธมิตร (ง่อ + เล่าปี่)" start={B.where.start + 60} end={B.zhouyu.start + 20} dy={44} color={C.wu} />
        <CaoCamp start={B.zhouyu.start + 30} end={T.stamp + 20} />
        <Badge at={river(0.5, 0.04)} name="โจโฉ" sub="ทัพฝั่งเหนือ" color={C.wei} start={B.zhouyu.start + 40} end={at("zhouyu", 0.55)} />
        <Badge at={ALLY_CAMP} name="จิวยี่" sub="แม่ทัพง่อ" color={C.wu} start={B.zhouyu.start + 10} end={B.nothing.start + 20} above={false} />
        <Badge at={river(0.25, -0.03)} name="ขงเบ้ง" color={C.shu} start={at("zhouyu", 0.35)} end={B.fog.start} above={false} />
        <StrawFleet appear={T.boats} sailStart={T.sail} sailEnd={T.arrive} shootStart={T.shoot} flipAt={T.flip} shootEnd={T.shootEnd} returnStart={T.back} returnEnd={T.home} until={T.stamp + 20} />
        <InkLabel at={river(0.5, -0.022)} text="เรือฟาง 20 ลำ" start={T.boats + 8} end={T.sail} dot={false} />
        <InkLabel at={RUXU} text="ยี่สู · ค.ศ. 213 · ตำแหน่งโดยประมาณ" start={at("history", 0.48)} end={B.next.start + 10} color={C.wu} />
        <InkLabel at={P.redCliffs} text="ผาแดง" start={B.next.start + 30} size={1.6} color={C.wu} dy={60} />
        <SunQuanBoat at={RUXU_BOAT} appear={at("history", 0.48)} leanStart={T.lean} turnAt={T.turn} until={B.next.start + 10} />
        <Badge at={[RUXU_BOAT[0] + 0.07, RUXU_BOAT[1] + 0.02]} name="ซุนกวน" color={C.wu} start={at("history", 0.62)} end={B.next.start + 10} />
      </MapFrame>
      <Fog start={B.fog.start} peak={B.fog.start + 30} clear={at("reveal", 0.35)} end={at("reveal", 0.6)} />
      <Dawn />
      <PaperTexture />
      <Title />
      <Counter />
      <Pledge />
      <NovelStamp />
      <NextCard />
      {captions &&
        BEATS.map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={fonts.body} color="#fff6dd" stroke="#2a1b0e" />
        ))}
      <Credit />
    </AbsoluteFill>
  );
};
