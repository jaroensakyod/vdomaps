import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt, camForFeature, globeCam, type CamKey } from "../../components/camera";
import { Caption } from "../../components/Caption";
import { MapFrame } from "../../components/Map";
import { Region } from "../../components/Region";
import { buildBeats, LAYOUT, totalFrames } from "../../components/subs.mjs";
import beatsText from "./beats.json";
import { Fleet, Wind } from "./Fleet";
import { LIU_208, onRiver, P, SHU_222, VIEW, WEI_208, WEI_222, WU_208, WU_222 } from "./geo";
import { Badge, C, fonts, InkLabel, PaperMap, PaperTexture } from "./Parchment";
import timing from "./timing.json";

export const FPS = LAYOUT.fps;

// Beat frames from the VO lengths (LEAD 12 / GAP 8 / TAIL 45 frames, shared with scripts/srt.mjs and describe.mjs).
export const BEATS = buildBeats(timing, beatsText);
export const TOTAL_FRAMES = totalFrames(BEATS);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b])) as Record<string, (typeof BEATS)[number]>;

const fade = (frame: number, a: number, b: number, c?: number, d?: number) =>
  c === undefined
    ? interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(frame, [a, b, c, d!], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Title = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const o = fade(frame, 4, 16, B.hook.end - 20, B.hook.end);
  if (o <= 0) return null;
  const y = interpolate(frame, [4, 24], [24, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: vertical ? "flex-start" : "center",
        paddingTop: vertical ? height * 0.13 : 0,
        opacity: o,
      }}
    >
      <div
        style={{
          transform: `translateY(${y * s}px)`,
          textAlign: "center",
          background: "rgba(239,225,187,0.88)",
          border: `${4 * s}px solid ${C.ink}`,
          outline: `${2 * s}px solid ${C.ink}`,
          outlineOffset: `${6 * s}px`,
          padding: `${18 * s}px ${60 * s}px ${22 * s}px`,
          boxShadow: `0 ${10 * s}px ${30 * s}px rgba(40,25,10,0.45)`,
          position: "relative",
        }}
      >
        <div style={{ fontFamily: fonts.body, fontSize: 34 * s, color: C.wu, fontWeight: 700, lineHeight: 1.5 }}>สามก๊ก · ตอนที่ 1</div>
        <div style={{ fontFamily: fonts.title, fontSize: 130 * s, color: C.ink, lineHeight: 1.35 }}>ศึกผาแดง</div>
        <div style={{ fontFamily: fonts.body, fontSize: 32 * s, color: C.ink, opacity: 0.8, lineHeight: 1.5 }}>
          ค.ศ. 208 · ริมแม่น้ำแยงซี
        </div>
        <div
          style={{
            position: "absolute",
            right: -38 * s,
            top: -38 * s,
            width: 92 * s,
            height: 92 * s,
            background: C.wu,
            color: "#fff6dd",
            fontSize: 38 * s,
            fontWeight: 700,
            lineHeight: 1.05,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8 * s,
            transform: "rotate(8deg)",
            fontFamily: "'Microsoft YaHei', 'SimSun', serif",
            writingMode: "vertical-rl",
          }}
        >
          赤壁
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Numbers = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  const { start, len, end } = B.numbers;
  const o = fade(frame, start - 4, start + 8, end + 6, end + 18);
  if (o <= 0) return null;
  const rows = [
    { label: "โจโฉ (ที่ประกาศ)", value: 800000, color: C.wei, at: start, faded: true },
    { label: "โจโฉ (ที่ประเมิน)", value: 200000, color: C.wei, at: start + len * 0.38, faded: false },
    { label: "ซุนกวน + เล่าปี่", value: 50000, color: C.wu, at: start + len * 0.7, faded: false },
  ];
  const barW = (vertical ? 760 : 620) * s;
  return (
    <AbsoluteFill style={{ opacity: o, fontFamily: fonts.body }}>
      <div
        style={{
          position: "absolute",
          right: vertical ? undefined : 70 * s,
          left: vertical ? (width - barW - 80 * s) / 2 : undefined,
          top: vertical ? height * 0.12 : 90 * s,
          width: barW + 80 * s,
          padding: `${26 * s}px ${40 * s}px`,
          background: "rgba(239,225,187,0.93)",
          border: `${3 * s}px solid ${C.ink}`,
          boxShadow: `0 ${8 * s}px ${24 * s}px rgba(40,25,10,0.4)`,
          color: C.ink,
        }}
      >
        <div style={{ fontSize: 34 * s, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 * s }}>กำลังพล ศึกผาแดง</div>
        {rows.map((r) => {
          const k = interpolate(frame, [r.at, r.at + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          if (frame < r.at) return null;
          return (
            <div key={r.label} style={{ marginTop: 10 * s }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 * s, lineHeight: 1.5 }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.round(r.value * k).toLocaleString("th-TH")}</span>
              </div>
              <div style={{ height: 26 * s, background: "rgba(59,42,26,0.12)" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(r.value / 800000) * 100 * k}%`,
                    background: r.faded
                      ? `repeating-linear-gradient(135deg, ${r.color}55 0 ${8 * s}px, ${r.color}22 ${8 * s}px ${16 * s}px)`
                      : r.color,
                    border: r.faded ? `${2 * s}px dashed ${r.color}` : undefined,
                    minWidth: 6 * s,
                  }}
                />
              </div>
            </div>
          );
        })}
        <div style={{ fontSize: 20 * s, opacity: 0.7, marginTop: 12 * s, lineHeight: 1.4 }}>
          ตัวเลขประเมินจากบันทึกประวัติศาสตร์ ไม่ใช่ตัวเลขในนิยาย
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RedCliffs = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.08) => camForFeature(f, width, height, pad);
  const china = fit(VIEW.china, 0.04);
  const mid = fit(VIEW.mid, 0.06);
  const battle = fit(VIEW.battle, 0.04);

  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(95, 22, width, height, 0.4) },
    { frame: B.hook.end - 30, cam: globeCam(108, 27, width, height, 0.4) },
    { frame: B.cao.start + 30, cam: china },
    { frame: B.liubei.start, cam: china },
    { frame: B.liubei.start + 30, cam: mid },
    { frame: B.numbers.end - 10, cam: mid },
    { frame: B.redcliffs.start + 35, cam: battle },
    { frame: B.fire.end + 10, cam: { ...battle, scale: battle.scale * 1.12 } },
    { frame: B.retreat.start + 40, cam: mid },
    { frame: B.three.start, cam: mid },
    { frame: B.three.start + 40, cam: china },
  ];
  const cam = camAt(keys, frame);

  const before = fade(frame, B.three.start, B.three.start + 30);
  const after = fade(frame, B.three.start + 20, B.three.start + 45);
  const tail = B.three.end;
  const pop = (i: number) => tail - 66 + i * 22; // วุย จ๊ก ง่อ land at the end of the last line

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <MapFrame cam={cam}>
        <PaperMap />
        {/* 208: spheres of control */}
        <Region feature={WEI_208} color={C.wei} opacity={fade(frame, B.cao.start + 10, B.cao.start + 30) * (1 - before)} />
        <Region feature={LIU_208} color={C.shu} opacity={fade(frame, B.liubei.start + 70, B.liubei.end) * (1 - before)} />
        <Region feature={WU_208} color={C.wu} opacity={fade(frame, B.alliance.start + 5, B.alliance.start + 25) * (1 - before)} />
        {/* ~222: the three kingdoms */}
        <Region feature={WEI_222} color={C.wei} opacity={after} />
        <Region feature={SHU_222} color={C.shu} opacity={after} />
        <Region feature={WU_222} color={C.wu} opacity={after} />

        <InkLabel at={P.xuchang} text="ฮูโต๋" start={B.cao.start + 20} end={B.liubei.end} dy={46} />
        <InkLabel at={P.jiangling} text="เกงจิ๋ว" start={B.liubei.start + 5} end={B.redcliffs.start + 20} size={1.15} dy={50} />
        <InkLabel at={P.redCliffs} text="ผาแดง (เซ็กเพ็ก)" start={B.numbers.start + 40} end={B.redcliffs.start + 20} dy={44} size={1.1} color={C.wu} />
        <InkLabel at={[113.74, 29.79]} text="ผาแดง (เซ็กเพ็ก) · ตำแหน่งโดยประมาณ" start={B.redcliffs.start + 30} end={B.retreat.start + 20} dot={false} size={1.1} color={C.wu} />
        <InkLabel at={P.huarong} text="ฮัวหยง" start={B.retreat.start + 30} end={B.three.start + 10} />

        <Arrow points={[P.xuchang, P.xiangyang, P.jiangling]} start={B.cao.start + 50} end={B.cao.end} color={C.wei} width={30} opacity={1 - fade(frame, B.redcliffs.start, B.redcliffs.start + 15)} />
        <Arrow points={[P.changban, [113.0, 30.9], P.xiakou]} start={B.liubei.start + 40} end={B.liubei.end - 10} color={C.shu} width={20} variant="dashed" opacity={1 - fade(frame, B.redcliffs.start, B.redcliffs.start + 15)} />
        <Arrow points={[P.xiakou, [115.2, 30.3], P.chaisang]} start={B.alliance.start + 10} end={B.alliance.start + 60} color={C.shu} width={14} variant="dashed" opacity={1 - fade(frame, B.numbers.start, B.numbers.start + 15)} />
        <Arrow points={[P.jiangling, [113.0, 30.05], P.wulin]} start={B.numbers.start + 10} end={B.numbers.end - 10} color={C.wei} width={26} opacity={1 - fade(frame, B.redcliffs.start + 20, B.redcliffs.start + 35)} />
        <Arrow points={[P.chaisang, [115.0, 30.15], [114.1, 30.05], P.redCliffs]} start={B.numbers.start + 30} end={B.numbers.end} color={C.wu} width={22} opacity={1 - fade(frame, B.redcliffs.start + 20, B.redcliffs.start + 35)} />
        <Arrow points={[P.wulin, [113.0, 29.55], P.huarong, [112.2, 29.95], P.jiangling, P.xiangyang]} start={B.retreat.start + 25} end={B.retreat.end + 20} color={C.wei} width={26} variant="dashed" opacity={1 - after} />

        <Fleet appear={B.redcliffs.start + 25} fireStart={B.fire.start + 15} fireEnd={B.fire.start + 15 + Math.round(B.fire.len * 0.55)} burnUntil={B.retreat.end} />
        <Wind start={B.fire.start + Math.round(B.fire.len * 0.45)} end={B.retreat.start + 30} />

        <Badge at={P.xuchang} name="โจโฉ" sub="ครองแผ่นดินเหนือ" color={C.wei} start={B.cao.start + 28} end={B.liubei.start + 25} />
        <Badge at={P.changban} name="เล่าปี่" color={C.shu} start={B.liubei.start + 35} end={B.alliance.start} />
        <Badge at={P.xiakou} name="เล่าปี่" color={C.shu} start={B.alliance.start} end={B.numbers.end} />
        <Badge at={P.chaisang} name="ซุนกวน" sub="กังตั๋ง" color={C.wu} start={B.alliance.start + 30} end={B.numbers.end} above={false} />
        <Badge at={[115.1, 30.28]} name="ขงเบ้ง" color={C.shu} start={B.alliance.start + 5} end={B.alliance.end} above={false} />
        <Badge at={onRiver(0.4, 0.016)} name="ทัพโจโฉ" color={C.wei} start={B.redcliffs.start + 40} end={B.fire.start + 20} />
        <Badge at={[113.74, 29.87]} name="อุยกาย" sub="แสร้งยอมแพ้" color={C.wu} start={B.fire.start + 5} end={B.fire.end} above={false} />

        <InkLabel at={[110.5, 38]} text="วุย" start={pop(0)} size={2.6} dot={false} color={C.wei} />
        <InkLabel at={[102.8, 29.2]} text="จ๊ก" start={pop(1)} size={2.6} dot={false} color={C.shu} />
        <InkLabel at={[116.5, 27.5]} text="ง่อ" start={pop(2)} size={2.6} dot={false} color={C.wu} />
      </MapFrame>
      <PaperTexture />
      <Title />
      <Numbers />
      {BEATS.map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={fonts.body} color="#fff6dd" stroke="#2a1b0e" />
      ))}
      <Credit />
    </AbsoluteFill>
  );
};

const Credit = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  return (
    <div
      style={{
        position: "absolute",
        right: 26 * s,
        bottom: vertical ? height * 0.2 : 18 * s,
        fontFamily: fonts.body,
        fontSize: 18 * s,
        color: C.ink,
        opacity: 0.75,
        lineHeight: 1.4,
        textAlign: "right",
      }}
    >
      แผนที่: Natural Earth · ตำแหน่งและเขตอิทธิพลโดยประมาณ
    </div>
  );
};
