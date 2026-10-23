import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { Glow, Grass } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Backdrop, PAL, V2 } from "../ep04/v2";
import { B, BRIT_C, CityDot, Empire, FR_C, ramp, SIAM_C, VOICE, wp, type AreaId, type Chapter5 } from "./beatsKit";
import { C5, Gunboat, PalaceRoof, Sea } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, VW } from "./places";

// Opening (hook → question): Siam alone between British and French colonies — how did it stay free?
const T = {
  ring: B.ring.start,
  around: wp("ring", "รอบ", 0.4),
  brit: wp("ring", "อังกฤษ", 0.75),
  fr: wp("ring", "ฝรั่งเศส", 0.9),
  king: B.king.start,
  danger: wp("king", "อันตราย", 0.3),
  name: wp("king", "จุลจอมเกล้า", 0.75),
  q: B.question.start,
  day: wp("question", "ปิยมหาราช", 0.25),
  map: wp("question", "แผนที่", 0.45),
  trade: wp("question", "แลก", 0.8),
};
const END = B.eclipse.start;

// Colonies arrive one at a time over the `ring` beat, then stay for the rest of the opening.
const order: [AreaId, string][] = [["burma", BRIT_C], ["malaysia", BRIT_C], ["vietnam", FR_C], ["cambodia", FR_C], ["laos", FR_C]];
export const ColonyMap = ({ from, gap, fade = 1, thai = 1 }: { from: number; gap: number; fade?: number; thai?: number }) => {
  const frame = useCurrentFrame();
  return <Empire areas={[["thai", SIAM_C, thai], ...order.map(([id, c], i) => [id, c, ramp(frame, from + i * gap, 14) * fade] as [AreaId, string, number])]} />;
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 2, B.hook.end + 10], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.1, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>ทำไม<span style={{ color: GOLD }}>สยาม</span></div>
        <div style={{ fontSize: 96 * s, fontWeight: 900 }}>ไม่เป็น<span style={{ color: "#ff6b5f" }}>เมืองขึ้น</span>?</div>
      </div>
    </AbsoluteFill>
  );
};

// "Only 1 left" counter while colonies close in.
const LeftCounter = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.around || frame > T.king + 10) return null;
  const n = Math.max(1, 6 - order.filter((_, i) => frame >= T.around + 10 + i * 12).length);
  const k = interpolate(frame, [T.around, T.around + 10, T.king, T.king + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", right: 60 * s, top: height * 0.31, opacity: k, fontFamily: font, color: "#fff", textAlign: "center", background: "rgba(8,14,26,0.86)", borderRadius: 16 * s, padding: `${10 * s}px ${26 * s}px`, borderTop: `${6 * s}px solid ${GOLD}` }}>
      <div style={{ fontSize: 26 * s, fontWeight: 700 }}>ประเทศเอกราช</div>
      <div style={{ fontSize: 96 * s, fontWeight: 900, color: n === 1 ? GOLD : "#fff", lineHeight: 1.1 }}>เหลือ {n}</div>
    </div>
  );
};

// 23 ตุลาคม tear-off calendar page + gold question mark.
const DayCard = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.q || frame > END + 8) return null;
  const k = interpolate(frame, [T.q, T.q + 12, END - 4, END + 8], [0, 1, 1, 0], clamp);
  const qk = interpolate(frame, [T.trade, T.trade + 10], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", right: 60 * s, top: height * 0.3, opacity: k, transform: `translateY(${(1 - k) * 30 * s}px)`, fontFamily: font, display: "flex", gap: 20 * s, alignItems: "center" }}>
      <div style={{ width: 200 * s, borderRadius: 14 * s, overflow: "hidden", boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.6)`, textAlign: "center" }}>
        <div style={{ background: RED, color: "#fff", fontSize: 30 * s, fontWeight: 900, padding: `${6 * s}px 0` }}>ตุลาคม</div>
        <div style={{ background: "#f4f0e6", color: "#1a140f", fontSize: 110 * s, fontWeight: 900, lineHeight: 1.1 }}>23</div>
        <div style={{ background: "#f4f0e6", color: "#7a3a1a", fontSize: 24 * s, fontWeight: 700, paddingBottom: 8 * s }}>วันปิยมหาราช</div>
      </div>
      <div style={{ width: 120 * s, height: 120 * s, borderRadius: "50%", background: GOLD, color: "#1a140f", fontWeight: 900, fontSize: 96 * s, lineHeight: `${120 * s}px`, textAlign: "center", transform: `scale(${qk})`, boxShadow: `0 0 ${40 * s}px rgba(255,201,74,0.7)` }}>?</div>
    </div>
  );
};

// Two gunboats, British from the west and French from the east, close in at dusk on a small Siamese boat.
const SqueezeSeaScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a1a3a", "#d0703a"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const close = interpolate(lt, [0, end - start], [0, 1], clamp);
      return (
        <g>
          <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.ground - 70 * g.s} s={g.s * 1.3} color="#ff9a4a" core="#ffe0a0" />
          <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={40 * g.s} fill="#f3c890" opacity={0.18} />
          <Sea g={g} y={g.ground - 40 * g.s} pan={pan} color="#3a4a6a" deep="#1f2840" />
          <Gunboat x={g.x + g.W * (0.08 + close * 0.12) + pan * 0.5} y={g.ground - 12 * g.s} s={g.s * 0.62} flag="uk" />
          <Gunboat x={g.x + g.W * (0.92 - close * 0.12) + pan * 0.5} y={g.ground - 8 * g.s} s={g.s * 0.66} flag="fr" dir={-1} />
          <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.7},${g.ground + 6 * g.s + Math.sin(lt * 0.1) * 3 * g.s})`}>
            <path d={`M${-50 * g.s} 0 Q0 ${18 * g.s} ${50 * g.s} 0 L${42 * g.s} ${-8 * g.s} L${-42 * g.s} ${-8 * g.s} Z`} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <line x1={0} y1={-8 * g.s} x2={0} y2={-70 * g.s} stroke="#3a2414" strokeWidth={3 * g.s} />
            <path d={`M0 ${-70 * g.s} q${26 * g.s} ${-4 * g.s} ${34 * g.s} 0 v${20 * g.s} q${-14 * g.s} ${4 * g.s} ${-34 * g.s} 0 Z`} fill="#c9302c" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
            <ellipse cx={17 * g.s} cy={-60 * g.s} rx={6 * g.s} ry={4 * g.s} fill="#f4f2ea" />
          </g>
        </g>
      );
    }}
  </V2>
);

// The Grand Palace at dawn — the young kingdom's centre (no royal likeness drawn).
const PalaceDawnScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#1f2a4a", "#e8a060"]} accent={GOLD} warm={0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={[0.78, 0.42]} lightColor={["#ffb070", "#ffe8c0"]} far="#4a4a6a" mid="#3a3a40" ground="#3a2e22" mist="#f3c890" ridges={false} />
        <PalaceRoof x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.36} s={g.s} />
        <PalaceRoof x={g.x + g.W * 0.15 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.18} s={g.s * 0.7} />
        <PalaceRoof x={g.x + g.W * 0.86 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.18} s={g.s * 0.7} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${g.x + g.W * (0.08 + i * 0.27) + pan * 1.0},${g.ground + 6 * g.s})`}>
            <rect x={-3 * g.s} y={-120 * g.s} width={6 * g.s} height={120 * g.s} fill="#3a2414" />
            <path d={`M0 ${-120 * g.s} q${22 * g.s} ${-4 * g.s + Math.sin(lt * 0.2 + i) * 4 * g.s} ${40 * g.s} 0 v${24 * g.s} q${-18 * g.s} ${4 * g.s} ${-40 * g.s} 0 Z`} fill="#c9302c" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
          </g>
        ))}
        <Grass g={g} shift={pan * 1.6} color="#2a2a18" />
      </g>
    )}
  </V2>
);

// Morning at a shrine table: garland, candles, a gilt frame turned away — the day of remembrance.
const GarlandScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#f0c890", "#fff0d0"]} accent={GOLD} warm={0.14}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e9d2a8" />
          <Glow x={g.x + g.W * 0.5 + pan * 0.1} y={g.y + g.H * 0.3} s={g.s * 1.4} color="#ffd890" core="#fff4d8" />
          <rect x={g.x + g.W * 0.32 + pan * 0.3} y={g.y + g.H * 0.08} width={g.W * 0.36} height={g.H * 0.5} fill="#7a3a1a" stroke={PAL.gilt} strokeWidth={8 * g.s} />
          <rect x={g.x + g.W * 0.35 + pan * 0.3} y={g.y + g.H * 0.11} width={g.W * 0.3} height={g.H * 0.44} fill="#c9b48a" opacity={0.6} />
          <rect x={g.x - 40 * g.s} y={g.ground - 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#a8322a" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <rect x={g.x - 40 * g.s} y={g.ground - 40 * g.s} width={g.W + 80 * g.s} height={10 * g.s} fill={PAL.gilt} />
          {[0.18, 0.82].map((f) => (
            <g key={f} transform={`translate(${g.x + g.W * f + pan * 0.6},${g.ground - 40 * g.s})`}>
              <rect x={-6 * g.s} y={-70 * g.s} width={12 * g.s} height={70 * g.s} fill="#f4f0e6" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
              <ellipse cx={0} cy={-80 * g.s + Math.sin(frame * 0.4 + f * 9) * 1.5 * g.s} rx={6 * g.s} ry={12 * g.s} fill="#ffd25a" />
              <circle cx={0} cy={-80 * g.s} r={26 * g.s} fill="#ffd25a" opacity={0.18} />
            </g>
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={g.x + g.W * (0.3 + i * 0.05) + pan * 0.8} cy={g.ground - 30 * g.s + Math.sin(i * 0.9) * 10 * g.s} r={14 * g.s} fill={i % 3 ? "#f4f0e6" : "#e8a030"} stroke={PAL.ink} strokeWidth={1.2 * g.s} />
          ))}
          <path d={`M${g.x - 20 * g.s} ${g.y + g.H} Q${g.x + g.W * 0.5} ${g.ground + 30 * g.s} ${g.x + g.W + 20 * g.s} ${g.y + g.H} Z`} fill="#7a2a1a" opacity={0.6} transform={`translate(${pan * 1.6},0)`} />
        </g>
      )}
    </V2>
  );
};

export const e5c0: Chapter5 = {
  name: "สยามรอดได้อย่างไร",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(VW.hook, w, h, 0.86, 0.1) },
    { frame: T.ring, cam: view(VW.hook, w, h, 0.9, 0.1) },
    { frame: T.king, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.q, cam: view(VW.siam, w, h, 0.9, 0.08) },
    { frame: T.map, cam: view(VW.sea, w, h, 0.85, 0.1) },
  ],
  years: [[0, "2411–2453"]],
  heads: [
    { f: T.ring, tag: "ปลายศตวรรษที่ 19", head: "รอบตัวสยามตกเป็นอาณานิคม", color: RED, chips: [{ text: "อังกฤษ", f: T.brit }, { text: "ฝรั่งเศส", f: T.fr }] },
    { f: T.king, tag: "รัชกาลที่ 5", head: "พระจุลจอมเกล้าเจ้าอยู่หัว", stat: "2411–2453", label: "ครองราชย์", color: GOLD, portrait: "rama5", photo: "ภาพถ่าย" },
    { f: T.q, tag: "วันปิยมหาราช", head: "รอดได้อย่างไร แลกอะไร?", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const thai = 0.9 + 0.1 * Math.sin(frame * 0.12) ** 2;
    return (
      <>
        {frame < T.ring ? (
          <ColonyMap from={-40} gap={0} thai={thai} />
        ) : (
          <ColonyMap from={T.around} gap={12} thai={thai} />
        )}
        <CityDot at={PL.bkk} color={GOLD} r={14} start={2} />
        <PointLabel at={PL.bkk} text="กรุงเทพฯ" start={T.king} color={GOLD} size={0.8} />
        <PointLabel at={PL.rangoon} text="พม่า (อังกฤษ)" start={T.brit} color={BRIT_C} size={0.75} />
        <PointLabel at={PL.hue} text="อินโดจีน (ฝรั่งเศส)" start={T.fr} color={FR_C} size={0.75} />
      </>
    );
  },
  Panels: () => (
    <>
      <SqueezeSeaScene id="e5sea" start={T.ring} end={T.king + 14} />
      <PalaceDawnScene id="e5palace" start={T.king} end={T.q + 14} />
      <GarlandScene id="e5garland" start={T.q} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <HookTitle />
      <LeftCounter />
      <DayCard />
    </>
  ),
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    ...order.map((_, i) => [T.around + 10 + i * 12, SFX.pop, 0.25] as [number, string, number]),
    [T.name, SFX.pop, 0.3],
    [T.q, SFX.whoosh, 0.3],
    [T.trade, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Hit id="cannon_far" at={2} volume={0.5} />
      <Bed id="sea_rough" from={T.ring - 6} to={T.king + 14} volume={0.25} voice={VOICE} />
      <Hit id="ship_bell" at={T.ring + 20} volume={0.35} />
      <Hit id="gong" at={T.king + 4} volume={0.4} />
      <Bed id="wind" from={T.king} to={T.q + 10} volume={0.15} voice={VOICE} />
    </>
  ),
};

