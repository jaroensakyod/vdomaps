import type { ReactNode } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../../../components/Caption";
import { Fighter } from "../../../components/Scene";
import { Bed, Hit, SFX, Sfx, voiceSpans } from "../../../components/Sound";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";
import { APEX, Bagger, Blueprint, BP, camAt, clamp, DimH, DimV, EXTENT, font, Ground, MiniBagger, toScreen, Tower, WHEEL, World, type CamKey } from "../kit/Bagger";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ~28-second look test for the giant-machines channel (Man & Machine-style explainer): Bagger 293 drawn in code on
// blueprint paper — weight hook, length/height dimension lines, a 30-storey tower for scale, a zoom into the bucket
// wheel with a worker beside it, the day's dig as a spoil pile, 96 Olympic pools filling, and a speed race.
// Facts (Wikipedia "Bagger 293", TAKRAF 1995): 14,200 t, 225 m long, 96 m high, wheel 21.6 m with 20 buckets,
// 240,000 m³ a day, top speed ~0.6 km/h. Olympic pool 50×25×2 m = 2,500 m³ → 96 pools.
const LAYOUT = { lead: 3, gap: 10 };
const BEATS = buildBeats(timing, beatsText, LAYOUT);
const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  const hit = (b.words ?? []).filter((w) => w.w.replace(/[!?]/g, "") === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const MACHINES_TEST_FRAMES = totalFrames(BEATS, LAYOUT);
const END = MACHINES_TEST_FRAMES;

const T = {
  name: B.name.start,
  len: wf("size", "ยาว"),
  h: wf("size", "สูง"),
  tower: wf("size", "ตึก"),
  wheel: B.wheel.start,
  dim: wf("wheel", "ยี่สิบ"),
  bucket: wf("wheel", "ถัง"),
  day: B.day.start,
  count: wf("day", "สอง"),
  pools: B.pools.start - 8,
  fillEnd: wf("pools", "เก้า"),
  slow: B.slow.start - 8,
  eight: wf("slow", "แปด"),
};

// Camera keys [frame, x, y, px/m]: hold, then a 24–30-frame move landing on the word.
const CAM: CamKey[] = [
  [0, -38, 42, 7.2],
  [T.name, -34, 42, 7.0],
  [T.len - 32, -24, 44, 6.6],
  [T.len, 34, 46, 3.6],
  [T.wheel - 12, 34, 46, 3.6],
  [T.wheel + 28, -86, 13, 22],
  [T.day - 8, -86, 13, 22],
  [T.day + 32, 36, 40, 3.75],
];

const pop = (frame: number, at: number, fps: number) => spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 180 } });

// Big yellow number with a small white line above it (the reference look: heavy Thai type, thick dark outline).
const Stat = ({ small, big, at, top = 1130 }: { small: string; big: string; at: number; top?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = at <= 0 ? 1 : pop(frame, at, fps);
  const slam = at <= 0 ? interpolate(frame, [0, 8], [1.18, 1], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: font, transform: `scale(${(0.6 + 0.4 * k) * slam})`, opacity: Math.min(1, k * 1.5), transformOrigin: "50% 60%" }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: "#fff", WebkitTextStroke: `10px ${BP.ink}`, paintOrder: "stroke fill", lineHeight: 1.1 }}>{small}</div>
      <div style={{ fontSize: 150, fontWeight: 900, color: BP.yellow, WebkitTextStroke: `16px ${BP.ink}`, paintOrder: "stroke fill", lineHeight: 1.1 }}>{big}</div>
    </div>
  );
};

// Small label pill that sits at a screen point.
const Pill = ({ x, y, text, at, color = BP.yellow, dx = 0 }: { x: number; y: number; text: string; at: number; color?: string; dx?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = pop(frame, at, fps);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x + dx, top: y, transform: `translate(-50%,-50%) scale(${k})`, background: BP.ink, border: `4px solid ${color}`, borderRadius: 16, padding: "4px 22px", fontFamily: font, fontWeight: 900, fontSize: 52, color, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const count = (frame: number, at: number, to: number, len = 24) => interpolate(frame, [at, at + len], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) });

// Full-screen blueprint card that slides up over the machine (pools, race).
const Card = ({ from, to, children }: { from: number; to: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const y = interpolate(frame, [from, from + 14], [1300, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 250, height: 1170, transform: `translateY(${y}px)`, background: "rgba(10,36,68,0.96)", border: `6px solid ${BP.yellow}`, borderRadius: 36, boxShadow: `0 0 40px rgba(255,210,63,0.35)`, overflow: "hidden" }}>
      {children}
    </div>
  );
};

const POOL = { cols: 8, rows: 12, w: 98, h: 42, gx: 113, gy: 50, x0: 40, y0: 272 };
const Pools = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const span = T.fillEnd - T.pools - 16;
  const startOf = (i: number) => T.pools + 16 + (i / 96) * span;
  const filled = Math.max(0, Math.min(96, Math.floor(((frame - T.pools - 16) / span) * 96) + 1));
  const done = frame >= T.fillEnd;
  const k = pop(frame, T.fillEnd, fps);
  return (
    <>
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: font }}>
        <div style={{ fontSize: 50, fontWeight: 700, color: "#fff" }}>ดินที่ขุดได้ใน 1 วัน</div>
        <div style={{ fontSize: 92, fontWeight: 900, color: BP.yellow, lineHeight: 1.15 }}>240,000 ลบ.ม.</div>
        <div style={{ fontSize: 30, fontWeight: 400, color: BP.line, opacity: 0.85 }}>สระโอลิมปิก 1 สระ = 50 × 25 × 2 ม. = 2,500 ลบ.ม.</div>
      </div>
      <svg width={980} height={1170} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 96 }, (_, i) => {
          const c = i % POOL.cols, r = Math.floor(i / POOL.cols);
          const x = POOL.x0 + c * POOL.gx, y = POOL.y0 + r * POOL.gy;
          const w = interpolate(frame, [startOf(i), startOf(i) + 6], [0, 1], clamp);
          return (
            <g key={i}>
              <rect x={x} y={y} width={POOL.w} height={POOL.h} rx={5} fill={BP.paperDark} stroke={BP.line} strokeOpacity={0.6} strokeWidth={2} />
              <rect x={x + 3} y={y + 3 + (POOL.h - 6) * (1 - w)} width={POOL.w - 6} height={(POOL.h - 6) * w} rx={3} fill={BP.water} opacity={0.9} />
              {w > 0.5 && [1, 2, 3].map((l) => <path key={l} d={`M${x + 8} ${y + (l * POOL.h) / 4}H${x + POOL.w - 8}`} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="5 4" />)}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 890, left: 0, right: 0, textAlign: "center", fontFamily: font, transform: `scale(${done ? 0.7 + 0.3 * k : 1})` }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: "#fff", WebkitTextStroke: `8px ${BP.ink}`, paintOrder: "stroke fill" }}>= สระโอลิมปิก</div>
        <div style={{ fontSize: 132, fontWeight: 900, color: done ? BP.yellow : "#fff", WebkitTextStroke: `14px ${BP.ink}`, paintOrder: "stroke fill", lineHeight: 1.05 }}>{done ? "96 สระ!" : `${filled} สระ`}</div>
      </div>
    </>
  );
};

// Speed race: a worker walking 5 km/h against Bagger 293 at ~0.6 km/h (lanes drawn at different scales).
const Race = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - T.slow - 14);
  const man = Math.min(930, 150 + t * 6.6);
  const machine = 266 + t * 0.8;
  const k = pop(frame, T.eight, fps);
  return (
    <>
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 64, fontWeight: 900, color: "#fff" }}>ความเร็วสูงสุด</div>
      <svg width={980} height={1170} style={{ position: "absolute", left: 0, top: 0 }}>
        {[470, 860].map((y) => (
          <g key={y}>
            <path d={`M40 ${y}H940`} stroke={BP.line} strokeWidth={3} />
            <path d={`M40 ${y + 8}H940`} stroke={BP.line} strokeOpacity={0.3} strokeWidth={10} strokeDasharray="2 14" />
          </g>
        ))}
        <path d="M930 300V880" stroke={BP.yellow} strokeWidth={4} strokeDasharray="14 10" />
        <Fighter x={man} y={470} scale={1.25} mode={man < 930 ? "walk" : "stand"} costume={{ jacket: "#ff8a1f", sash: "#e8f04a", pants: "#2b3a55", head: "helmet", headColor: BP.yellow, skin: "#e0b08a" }} weapon="none" />
        <MiniBagger frame={frame} x={machine} y={860} z={2} />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 180, fontFamily: font, fontSize: 48, fontWeight: 700, color: "#fff" }}>
        คนเดิน <span style={{ color: BP.yellow, fontWeight: 900 }}>5 กม./ชม.</span>
      </div>
      <div style={{ position: "absolute", left: 60, top: 560, fontFamily: font, fontSize: 48, fontWeight: 700, color: "#fff" }}>
        แบ็กเกอร์ 293 <span style={{ color: BP.yellow, fontWeight: 900 }}>~0.6 กม./ชม.</span>
      </div>
      {frame >= T.eight && (
        <div style={{ position: "absolute", top: 930, left: 0, right: 0, textAlign: "center", fontFamily: font, transform: `scale(${0.6 + 0.4 * k})` }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#fff", WebkitTextStroke: `8px ${BP.ink}`, paintOrder: "stroke fill" }}>ช้ากว่าคนเดิน</div>
          <div style={{ fontSize: 140, fontWeight: 900, color: BP.yellow, WebkitTextStroke: `14px ${BP.ink}`, paintOrder: "stroke fill", lineHeight: 1.05 }}>~8 เท่า!</div>
        </div>
      )}
    </>
  );
};

const Brand = () => (
  <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: font, fontWeight: 900, fontSize: 52, color: "#fff", letterSpacing: 2 }}>
    <svg width={50} height={50} viewBox="-25 -25 50 50">
      <circle r={13} fill="none" stroke={BP.yellow} strokeWidth={7} strokeDasharray="6 4.2" />
      <circle r={6} fill={BP.yellow} />
    </svg>
    ยักษ์เหล็ก
  </div>
);

// Engineering title block, bottom right: what the drawing is and that it is an illustration.
const TitleBlock = () => (
  <div style={{ position: "absolute", right: 56, bottom: 60, border: `2px solid ${BP.line}`, borderRadius: 6, padding: "8px 18px", fontFamily: font, color: BP.line, opacity: 0.8, fontSize: 26, lineHeight: 1.35, textAlign: "right" }}>
    <div style={{ fontWeight: 700 }}>แบบ: BAGGER 293 · TAKRAF 1995</div>
    <div>ภาพประกอบ · สัดส่วนโดยประมาณ</div>
  </div>
);

export const MachinesTest = () => {
  const frame = useCurrentFrame();
  const cam = camAt(CAM, frame);
  const voice = voiceSpans(BEATS);
  const inCard = frame >= T.pools + 14;
  const wheelGlow = interpolate(frame, [T.wheel + 20, T.wheel + 30, T.day - 10, T.day], [0, 1, 1, 0], clamp);
  const buckets = frame >= T.bucket ? Math.min(20, Math.floor((frame - T.bucket) / 1.5) + 1) : -1;
  const pile = interpolate(frame, [T.day, T.pools + 10], [0.15, 1], clamp);
  const worker = toScreen(cam, -74, 0);
  const lenPill = toScreen(cam, (EXTENT.left + EXTENT.right) / 2, -8);
  const hPill = toScreen(cam, 151, APEX.y);
  const wheelPill = toScreen(cam, -106, WHEEL.y);
  // stat under the machine: one at a time, each popping in on its word
  const stat =
    frame < T.name ? { small: "หนักกว่า", big: "14,000 ตัน!", at: 0 }
    : frame < T.len ? { small: "เยอรมนี · สร้างปี 1995", big: "แบ็กเกอร์ 293", at: T.name }
    : frame < T.h ? { small: "ยาว", big: `${fmt(count(frame, T.len, 225))} ม.`, at: T.len }
    : frame < T.tower ? { small: "สูง", big: `${fmt(count(frame, T.h, 96))} ม.`, at: T.h }
    : frame < T.wheel ? { small: "สูงเท่า", big: "ตึก 30 ชั้น", at: T.tower }
    : frame < T.bucket ? { small: "ล้อตัก สูง", big: "21 ม.", at: T.dim }
    : frame < T.day ? { small: "ถังตัก", big: `${Math.max(1, buckets)} ใบ`, at: T.bucket }
    : { small: "ขุดดินได้วันละ", big: `${fmt(count(frame, T.count, 240000, 30))} ลบ.ม.`, at: T.day };
  return (
    <AbsoluteFill style={{ background: BP.paperDark }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      {/* UI moments: synthetic */}
      <Sfx src={SFX.hit} at={0} volume={0.6} />
      <Sfx src={SFX.pop} at={T.name} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.len - 36} volume={0.3} />
      <Sfx src={SFX.hit} at={T.tower} volume={0.4} />
      <Sfx src={SFX.whoosh} at={T.wheel - 16} volume={0.35} />
      <Sfx src={SFX.tick} at={T.bucket} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.day - 14} volume={0.3} />
      <Sfx src={SFX.tick} at={T.count} volume={0.3} />
      <Sfx src={SFX.whoosh} at={T.pools - 4} volume={0.35} />
      <Sfx src={SFX.hit} at={T.fillEnd} volume={0.5} />
      <Sfx src={SFX.whoosh} at={T.slow - 4} volume={0.35} />
      <Sfx src={SFX.hit} at={T.eight} volume={0.5} />
      {/* story sounds: house library */}
      <Hit id="rocks_fall" at={2} volume={0.4} />
      <Bed id="machine_heavy" from={0} to={T.pools + 16} volume={0.4} voice={voice} />
      <Hit id="tape_extend" at={T.len} volume={0.45} />
      <Hit id="tape_extend" at={T.h} volume={0.45} />
      <Hit id="tape_extend" at={T.dim} volume={0.45} />
      <Hit id="rocks_fall" at={T.bucket + 4} volume={0.35} />
      <Hit id="dirt_dump" at={T.day + 10} volume={0.45} />
      <Bed id="water_flow" from={T.pools + 10} to={T.slow + 10} volume={0.35} voice={voice} />
      <Hit id="splash" at={T.fillEnd} volume={0.4} />
      <Bed id="bulldozer" from={T.slow} to={END} volume={0.18} voice={voice} />

      <Blueprint />
      {!inCard && (
        <>
          <World cam={cam}>
            <Ground />
            <Tower frame={frame} start={T.tower} x={140} w={22} />
            <Bagger frame={frame} wheelGlow={wheelGlow} buckets={buckets} pile={pile} />
            <DimH frame={frame} start={T.len} x0={EXTENT.left} x1={EXTENT.right} y={-8} />
            <DimV frame={frame} start={T.h} x={172} y0={0} y1={APEX.y} guide={APEX.x} />
            {frame >= T.wheel && frame < T.day + 20 && (
              <>
                <DimV frame={frame} start={T.dim} x={-106} y0={WHEEL.y - WHEEL.r} y1={WHEEL.y + WHEEL.r} />
                <Fighter x={-74} y={0} scale={1.8 / 125} mode="stand" costume={{ jacket: "#ff8a1f", sash: "#e8f04a", pants: "#2b3a55", head: "helmet", headColor: BP.yellow, skin: "#e0b08a" }} weapon="none" />
              </>
            )}
          </World>
          {frame >= T.len && frame < T.wheel && <Pill x={lenPill[0]} y={lenPill[1] + 46} text="225 ม." at={T.len + 16} />}
          {frame >= T.h && frame < T.wheel && <Pill x={hPill[0]} y={hPill[1] - 56} text="96 ม." at={T.h + 16} />}
          {frame >= T.dim && frame < T.day && <Pill x={wheelPill[0]} y={wheelPill[1]} dx={110} text="21 ม." at={T.dim + 16} />}
          {frame >= T.wheel + 30 && frame < T.day && <Pill x={worker[0] + 40} y={worker[1] - 120} text="คน 1.8 ม." at={T.wheel + 30} color="#fff" />}
          <Stat {...stat} />
        </>
      )}
      <Card from={T.pools} to={T.slow + 14}>
        <Pools />
      </Card>
      <Card from={T.slow} to={END + 1}>
        <Race />
      </Card>
      <Brand />
      <TitleBlock />
      {BEATS.filter((b) => b.id !== "hook").map((b) => (
        <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={0.775} />
      ))}
    </AbsoluteFill>
  );
};
