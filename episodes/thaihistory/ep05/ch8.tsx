import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Fighter, Glow, Grass } from "../../../components/Scene";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { Balance, Sack } from "../ep04/ch1_kit";
import { Backdrop, Candle, Noble, PAL, Tree, V2 } from "../ep04/v2";
import { B, BEATS, CityDot, Empire, ramp, Ring, VOICE, wp, type Chapter5 } from "./beatsKit";
import { Timeline } from "./cards";
import { FinalEmpire } from "./ch7";
import { C5, Colonnade, MapTable, PalaceRoof, PanelFlag } from "./kit5";
import { Bed, Hit, SFX } from "./mix";
import { PL, R, VW } from "./places";

// Chapter 8 (answer → poll): the three reasons, the end of extraterritoriality, 23 Oct 1910, Piyamaharaj Day, poll.
const T = {
  from: B.answer.start,
  ask: wp("answer", "ทำไม", 0.6),
  a1: B.a1.start,
  reform: wp("a1", "ปฏิรูป", 0.2),
  excuse: wp("a1", "อ้าง", 0.7),
  a2: B.a2.start,
  powers: wp("a2", "มหาอำนาจ", 0.35),
  diplo: wp("a2", "ทูต", 0.8),
  a3: B.a3.start,
  trade: wp("a3", "แลก", 0.2),
  edge: wp("a3", "ขอบ", 0.4),
  core: wp("a3", "ใจกลาง", 0.75),
  fin: B.finish.start,
  done: wp("finish", "หมด", 0.3),
  y2481: wp("finish", "พอศอ", 0.45),
  reign: wp("finish", "รัชกาล", 0.75),
  death: B.death.start,
  name: wp("death", "จุลจอมเกล้า", 0.35),
  passed: wp("death", "สวรรคต", 0.8),
  years: wp("death", "ราชย์", 0.95),
  piya: B.piya.start,
  title: wp("piya", "ปิย", 0.3),
  beloved: wp("piya", "ที่รัก", 0.6),
  every: wp("piya", "ทุก", 0.88),
  poll: B.poll.start,
  o1: wp("poll", "ปฏิรูป", 0.45),
  o2: wp("poll", "ทูต", 0.6),
  o3: wp("poll", "ยอม", 0.8),
  type: wp("poll", "พิมพ์", 0.85),
};
const LAST = BEATS[BEATS.length - 1].end;
const END = LAST + 60;
const DUSIT: [number, number] = [100.5133, 13.7703]; // Royal Plaza, equestrian statue (approximate)

// Opening title again, in gold.
const BigQ = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.from || frame > T.a1 + 8) return null;
  const k = spring({ frame: frame - T.ask, fps, config: { damping: 12 } });
  const o = interpolate(frame, [T.from, T.from + 10, T.a1 - 4, T.a1 + 8], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.3, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * (frame >= T.ask ? k : 0)})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.95)` }}>
        <div style={{ fontSize: 80 * s, fontWeight: 900 }}>ทำไม<span style={{ color: GOLD }}>สยาม</span></div>
        <div style={{ fontSize: 80 * s, fontWeight: 900 }}>ไม่เป็น<span style={{ color: "#ff6b5f" }}>เมืองขึ้น</span>?</div>
      </div>
    </AbsoluteFill>
  );
};

// The three reasons stack up on the right; the latest is bright, earlier ones dim.
const REASONS: [string, string, number][] = [
  ["①", "ปฏิรูปทันเวลา", T.a1],
  ["②", "รัฐกันชน + การทูต", T.a2],
  ["③", "ยอมแลก", T.a3],
];
const ReasonStack = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.a1 || frame > T.fin + 10) return null;
  const o = interpolate(frame, [T.fin - 4, T.fin + 10], [1, 0], clamp);
  const cur = REASONS.filter(([, , f]) => frame >= f).length - 1;
  return (
    <div style={{ position: "absolute", right: 50 * s, top: height * 0.3, display: "flex", flexDirection: "column", gap: 12 * s, opacity: o, fontFamily: font }}>
      {REASONS.map(([n, t, f], i) => {
        if (frame < f) return null;
        const k = spring({ frame: frame - f, fps, config: { damping: 12 } });
        const on = i === cur;
        return (
          <div key={n} style={{ transform: `translateX(${(1 - k) * 60 * s}px)`, opacity: on ? 1 : 0.55, background: "rgba(8,14,26,0.88)", borderLeft: `${7 * s}px solid ${GOLD}`, borderRadius: 12 * s, padding: `${6 * s}px ${20 * s}px`, color: "#fff", fontSize: (on ? 40 : 30) * s, fontWeight: 900, whiteSpace: "nowrap" }}>
            <span style={{ color: GOLD }}>{n}</span> {t}
          </div>
        );
      })}
    </div>
  );
};

// Three-option poll in the head slot + follow button.
const POLL: [string, string, number][] = [
  ["①", "ปฏิรูป", T.o1],
  ["②", "การทูต", T.o2],
  ["③", "ยอมแลก", T.o3],
];
const Poll3 = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.poll || frame > END) return null;
  const k = spring({ frame: frame - T.poll, fps, config: { damping: 14 } });
  const bk = frame < T.type + 10 ? 0 : spring({ frame: frame - T.type - 10, fps, config: { damping: 9 } });
  return (
    <>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 24 * s}px)`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${GOLD}`, borderRadius: 18 * s, padding: `${14 * s}px ${26 * s}px ${20 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.55)`, lineHeight: 1.3 }}>
        <div style={{ fontSize: 40 * s, fontWeight: 900, color: GOLD, marginBottom: 12 * s }}>ข้อไหนสำคัญที่สุด ที่ทำให้สยามรอด?</div>
        <div style={{ display: "flex", gap: 14 * s }}>
          {POLL.map(([n, t, f]) => {
            const pk = frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping: 12 } });
            const fresh = frame >= f && frame - f < 20;
            return (
              <div key={n} style={{ flex: 1, textAlign: "center", border: `${4 * s}px solid ${GOLD}`, borderRadius: 14 * s, padding: `${10 * s}px 0`, opacity: 0.25 + 0.75 * Math.min(1, pk), transform: `scale(${0.85 + 0.15 * Math.min(1, pk)})`, background: fresh ? "rgba(255,201,74,0.25)" : "transparent" }}>
                <div style={{ fontSize: 48 * s, fontWeight: 900, color: GOLD, lineHeight: 1.1 }}>{n}</div>
                <div style={{ fontSize: 40 * s, fontWeight: 900 }}>{t}</div>
              </div>
            );
          })}
        </div>
      </div>
      {bk > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.385, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s, fontFamily: font }}>
          <div style={{ transform: `scale(${bk})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${64 * s}px`, fontWeight: 900, fontSize: 50 * s, boxShadow: `0 ${8 * s}px ${30 * s}px rgba(255,59,48,0.55)` }}>ติดตาม</div>
          <div style={{ transform: `scale(${bk})`, background: "rgba(8,14,26,0.85)", color: "#fff", borderRadius: 30 * s, padding: `${4 * s}px ${24 * s}px`, fontWeight: 700, fontSize: 30 * s }}>พิมพ์บอกในคอมเมนต์ได้เลย</div>
        </div>
      )}
    </>
  );
};

// Lamp-lit desk with a map of the region, two officials studying it — the question again.
const QuestionDeskScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#1a120c", "#3a2414"]} accent={GOLD} warm={0.12}>
    {(g, pan) => (
      <g>
        <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#24180f" />
        <rect x={g.x + g.W * 0.12 + pan * 0.2} y={g.y + g.H * 0.08} width={g.W * 0.22} height={g.H * 0.4} fill="#3a2a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <rect x={g.x + g.W * 0.66 + pan * 0.2} y={g.y + g.H * 0.08} width={g.W * 0.22} height={g.H * 0.4} fill="#3a2a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
        <Glow x={g.x + g.W * 0.5 + pan * 0.4} y={g.ground - 120 * g.s} s={g.s * 0.9} color="#ffc060" core="#fff0c0" />
        <Fighter x={g.x + g.W * 0.2 + pan * 0.6} y={g.ground - 4 * g.s} scale={g.sc * 0.64} mode="stand" costume={C5.official} weapon="none" />
        <Fighter x={g.x + g.W * 0.82 + pan * 0.6} y={g.ground - 4 * g.s} scale={g.sc * 0.64} mode="stand" flip costume={C5.siamArmy} weapon="none" phase={1.4} />
        <MapTable x={g.x + g.W * 0.5 + pan * 0.9} y={g.ground - 30 * g.s} w={g.W * 0.5} s={g.s} />
        <Candle x={g.x + g.W * 0.72 + pan * 0.9} y={g.ground - 100 * g.s} s={g.s} />
        <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#1a1008" />
      </g>
    )}
  </V2>
);

// Steam train passes telegraph poles in front of a new ministry building — reform in time.
const Locomotive = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({ length: 6 }, (_, i) => {
        const t = (frame * 0.9 + i * 12) % 72;
        return <circle key={i} cx={66 - t * 1.8} cy={-118 - t * 0.7} r={10 + t * 0.35} fill="#d8d4cc" opacity={0.6 * (1 - t / 72)} />;
      })}
      <rect x={-90} y={-96} width={60} height={70} fill="#2a2a2e" stroke={PAL.ink} strokeWidth={2.4} />
      <rect x={-82} y={-88} width={20} height={20} fill="#ffd27a" />
      <rect x={-30} y={-78} width={110} height={52} rx={22} fill="#1f2a24" stroke={PAL.ink} strokeWidth={2.4} />
      <rect x={56} y={-112} width={16} height={36} fill="#1f2424" stroke={PAL.ink} strokeWidth={2} />
      <rect x={20} y={-92} width={18} height={16} rx={6} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6} />
      <path d="M80 -30 L104 -10 L80 -10 Z" fill="#5a2a1a" stroke={PAL.ink} strokeWidth={1.6} />
      <rect x={-96} y={-30} width={190} height={10} fill="#3a1a12" />
      {[-70, -30, 10, 50].map((wx) => (
        <g key={wx} transform={`translate(${wx},-6) rotate(${frame * 9})`}>
          <circle r={18} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
          <line x1={-18} y1={0} x2={18} y2={0} stroke="#8a8a8a" strokeWidth={2} />
          <line x1={0} y1={-18} x2={0} y2={18} stroke="#8a8a8a" strokeWidth={2} />
        </g>
      ))}
      <rect x={-260} y={-80} width={150} height={56} fill="#7a3a22" stroke={PAL.ink} strokeWidth={2} />
      {[-248, -210, -172, -134].map((wx) => <rect key={wx} x={wx} y={-70} width={24} height={18} fill="#e8d8a8" />)}
      {[-230, -140].map((wx) => (
        <g key={wx} transform={`translate(${wx},-10) rotate(${frame * 9})`}>
          <circle r={14} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
          <line x1={-14} y1={0} x2={14} y2={0} stroke="#8a8a8a" strokeWidth={2} />
        </g>
      ))}
    </g>
  );
};
const ReformEchoScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => (
  <V2 id={id} anchor={PL.ayut} start={start} end={end} sky={["#7aa8d0", "#f8e8c0"]} accent={GOLD} hits={hits} warm={0.1}>
    {(g, pan, lt) => {
      const tx = interpolate(lt, [0, end - start], [-0.1, 0.75], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.8, 0.3]} lightColor={["#ffe0a0", "#ffffff"]} far="#8a9ab0" mid="#6a8a5a" ground="#7a7a40" mist="#fff0c8" />
          <Colonnade x={g.x + g.W * 0.25 + pan * 0.4} y={g.ground - 40 * g.s} w={g.W * 0.36} s={g.s * 0.7} sign="กระทรวง" />
          {[0.1, 0.35, 0.6, 0.85, 1.1].map((f) => (
            <g key={f}>
              <line x1={g.x + g.W * f + pan * 0.6} y1={g.ground - 4 * g.s} x2={g.x + g.W * f + pan * 0.6} y2={g.ground - 130 * g.s} stroke="#5a3a1f" strokeWidth={4 * g.s} />
              <line x1={g.x + g.W * f - 14 * g.s + pan * 0.6} y1={g.ground - 124 * g.s} x2={g.x + g.W * f + 14 * g.s + pan * 0.6} y2={g.ground - 124 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
            </g>
          ))}
          <path d={`M${g.x - 40 * g.s} ${g.ground - 118 * g.s} ${[0.1, 0.35, 0.6, 0.85, 1.1].map((f) => `Q${g.x + g.W * (f - 0.125) + pan * 0.6} ${g.ground - 108 * g.s} ${g.x + g.W * f + pan * 0.6} ${g.ground - 124 * g.s}`).join(" ")}`} stroke="#2a2a2a" strokeWidth={1.4 * g.s} fill="none" />
          <rect x={g.x - 60 * g.s} y={g.ground - 4 * g.s} width={g.W + 120 * g.s} height={8 * g.s} fill="#5a4a3a" />
          <Locomotive x={g.x + g.W * tx + pan * 0.8} y={g.ground - 2 * g.s} s={g.s * 0.62} />
          <Grass g={g} shift={pan * 1.6} color="#4a5a24" />
        </g>
      );
    }}
  </V2>
);

// Diplomacy: British envoy, Siamese minister and French envoy around one table under three flags.
const DiplomacyScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#3a2a1a", "#8a6a3a"]} accent={GOLD} hits={hits} warm={0.12}>
      {(g, pan) => {
        const meet = interpolate(frame, [hits[0] - 20, hits[0]], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a3018" />
            {[0.15, 0.5, 0.85].map((f) => <rect key={f} x={g.x + g.W * f - 40 * g.s + pan * 0.2} y={g.y + g.H * 0.1} width={80 * g.s} height={g.H * 0.46} rx={40 * g.s} fill="#f0d8a0" opacity={0.35} />)}
            <Glow x={g.x + g.W * 0.5 + pan * 0.2} y={g.y + g.H * 0.15} s={g.s * 0.8} color="#ffd890" core="#fff4d8" />
            <PanelFlag x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="uk" h={150} w={54} />
            <PanelFlag x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="siam" h={170} w={60} />
            <PanelFlag x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} kind="fr" h={150} w={54} />
            <Fighter x={g.x + g.W * (0.16 + meet * 0.08) + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode={meet < 1 && meet > 0 ? "walk" : "stand"} costume={C5.british} weapon="none" />
            <Fighter x={g.x + g.W * 0.5 + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode="stand" costume={C5.official} weapon="none" phase={0.7} />
            <Fighter x={g.x + g.W * (0.84 - meet * 0.08) + pan * 0.8} y={g.ground + 4 * g.s} scale={g.sc * 0.66} mode={meet < 1 && meet > 0 ? "walk" : "stand"} flip costume={C5.french} weapon="none" phase={1.4} />
            <rect x={g.x + g.W * 0.32 + pan * 1.2} y={g.ground + 20 * g.s} width={g.W * 0.36} height={18 * g.s} fill="#6a3a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 38 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a1a0e" />
          </g>
        );
      }}
    </V2>
  );
};

// A balance: the sacks of the edge lands and of the heartland — Siam gives up the first to keep the second.
const ScaleScene = ({ id, start, end, hits }: { id: string; start: number; end: number; hits: number[] }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.bkk} start={start} end={end} sky={["#2a1a12", "#6a4020"]} accent={GOLD} hits={hits} warm={0.12}>
      {(g, pan) => {
        const tilt = interpolate(frame, [hits[0], hits[0] + 24], [0, 14], clamp) + Math.sin(frame * 0.1) * 0.6;
        return (
          <g>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#3a2414" />
            <Glow x={g.x + g.W * 0.5 + pan * 0.2} y={g.y + g.H * 0.2} s={g.s} color="#ffc060" core="#fff0c0" />
            <rect x={g.x - 40 * g.s} y={g.ground - 6 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <g transform={`translate(${pan * 0.6},0)`}>
              <Balance x={g.x + g.W * 0.5} y={g.ground - 6 * g.s} s={g.s * 1.3} tilt={-tilt} />
            </g>
            <text x={g.x + g.W * 0.25 + pan * 0.6} y={g.y + g.H * 0.2} textAnchor="middle" fontFamily={font} fontSize={30 * g.s} fontWeight={900} fill="#ffb0a0">ชายขอบ</text>
            <text x={g.x + g.W * 0.75 + pan * 0.6} y={g.y + g.H * 0.2} textAnchor="middle" fontFamily={font} fontSize={30 * g.s} fontWeight={900} fill={GOLD}>ใจกลาง</text>
            <Sack x={g.x + g.W * 0.12 + pan * 1.2} y={g.ground + 30 * g.s} s={g.s * 1.2} />
            <Sack x={g.x + g.W * 0.9 + pan * 1.2} y={g.ground + 30 * g.s} s={g.s * 1.1} color="#d8c8a0" />
            <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 34 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#2a180c" />
          </g>
        );
      }}
    </V2>
  );
};

// The palace at dusk: candles, mourners in white kneeling, gold light slowly dimming (no likeness drawn).
const DuskPalaceScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.palace} start={start} end={end} sky={["#1a1830", "#a0603a"]} accent={GOLD} warm={0.1}>
    {(g, pan, lt) => {
      const dim = interpolate(lt, [0, end - start], [1, 0.35], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.5, 0.45]} lightColor={["#ff9a50", "#ffe0b0"]} far="#2a2a40" mid="#2a2830" ground="#2a2018" mist="#c08060" ridges={false} />
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0a0a18" opacity={0.5 * (1 - dim)} />
          <PalaceRoof x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 14 * g.s} w={g.W * 0.4} s={g.s} color="#a88a4a" />
          {[0.12, 0.3, 0.7, 0.88].map((f, i) => <Candle key={f} x={g.x + g.W * f + pan * 0.8} y={g.ground + 6 * g.s} s={g.s * (1 + (i % 2) * 0.2)} />)}
          {[0, 1, 2, 3, 4].map((i) => <Noble key={i} x={g.x + g.W * (0.1 + i * 0.2) + pan * 1.1} y={g.ground + 22 * g.s} scale={g.sc * 0.6} mode="prostrate" phase={i} jacket="#f4f2ea" />)}
          <Grass g={g} shift={pan * 1.6} color="#141a10" />
        </g>
      );
    }}
  </V2>
);

// Royal Plaza: the equestrian statue as a distant dark silhouette on its plinth, the domed hall behind, garlands
// and people bowing. `evening` = lanterns at dusk.
const Statue = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-60} y={-90} width={120} height={90} fill="#c8bfae" stroke={PAL.ink} strokeWidth={2} />
    <rect x={-70} y={-98} width={140} height={10} fill="#d8d0c0" stroke={PAL.ink} strokeWidth={1.6} />
    <g fill="#2a2a26" stroke={PAL.ink} strokeWidth={1.2}>
      <ellipse cx={0} cy={-136} rx={44} ry={18} />
      <path d="M36 -146 L58 -176 L68 -170 L50 -136 Z" />
      {[-30, -16, 18, 32].map((lx) => <rect key={lx} x={lx - 4} y={-124} width={8} height={26} />)}
      <path d="M-44 -140 Q-58 -128 -54 -110" fill="none" strokeWidth={5} />
      <path d="M-8 -150 L-4 -190 L8 -190 L10 -150 Z" />
      <circle cx={2} cy={-198} r={9} />
    </g>
  </g>
);
const PlazaScene = ({ id, start, end, evening = false, hits = [] }: { id: string; start: number; end: number; evening?: boolean; hits?: number[] }) => (
  <V2 id={id} anchor={DUSIT} start={start} end={end} sky={evening ? ["#1a1a3a", "#c06a3a"] : ["#8ab4d8", "#ffe8c0"]} accent={GOLD} hits={hits} warm={evening ? 0.1 : 0.12}>
    {(g, pan, lt) => (
      <g>
        <Backdrop g={g} pan={pan} light={evening ? [0.2, 0.4] : [0.8, 0.3]} lightColor={evening ? ["#ff9a50", "#ffe0b0"] : ["#fff0c0", "#ffffff"]} far={evening ? "#2a2a40" : "#8a9ab0"} mid={evening ? "#2a2830" : "#7a8a6a"} ground={evening ? "#3a3028" : "#b8a888"} mist={evening ? "#c08060" : "#fff4dc"} ridges={false} />
        <g transform={`translate(${g.x + g.W * 0.5 + pan * 0.2},${g.ground - 30 * g.s})`} opacity={0.75}>
          <rect x={-130 * g.s} y={-60 * g.s} width={260 * g.s} height={60 * g.s} fill={evening ? "#8a8070" : "#e8e2d4"} />
          <path d={`M${-50 * g.s} ${-60 * g.s} Q0 ${-150 * g.s} ${50 * g.s} ${-60 * g.s} Z`} fill={evening ? "#7a7468" : "#d8d2c4"} />
          <path d={`M${-120 * g.s} ${-60 * g.s} Q${-95 * g.s} ${-110 * g.s} ${-70 * g.s} ${-60 * g.s} Z M${70 * g.s} ${-60 * g.s} Q${95 * g.s} ${-110 * g.s} ${120 * g.s} ${-60 * g.s} Z`} fill={evening ? "#7a7468" : "#d8d2c4"} />
        </g>
        <Tree x={g.x + g.W * 0.06 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        <Tree x={g.x + g.W * 0.94 + pan * 0.5} y={g.ground - 10 * g.s} s={g.s} />
        <Statue x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 6 * g.s} s={g.s * 0.75} />
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={g.x + g.W * (0.43 + i * 0.023) + pan * 0.5} cy={g.ground - 10 * g.s} r={7 * g.s} fill={i % 2 ? "#e8a030" : "#f4f0e6"} stroke={PAL.ink} strokeWidth={1 * g.s} />)}
        {evening && [0.3, 0.7].map((f) => <Candle key={f} x={g.x + g.W * f + pan * 0.8} y={g.ground + 4 * g.s} s={g.s * 1.2} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.17) + pan * 1.1} y={g.ground + 26 * g.s} scale={g.sc * 0.6} mode={i % 2 ? "kneel" : "prostrate"} phase={i + lt * 0.005} bow={0.5} jacket={["#f4f2ea", "#e8b8c8", "#f0d890"][i % 3]} />)}
        <Grass g={g} shift={pan * 1.6} color={evening ? "#1a2010" : "#4a6a24"} />
      </g>
    )}
  </V2>
);

// Close: offerings at the plinth — garlands, candles, incense smoke.
const OfferingScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={DUSIT} start={start} end={end} sky={["#f0c890", "#fff0d0"]} accent={GOLD} warm={0.14}>
      {(g, pan) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#d8ccb4" />
          <rect x={g.x + pan * 0.2} y={g.y} width={g.W} height={g.H * 0.55} fill="#c8bfae" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <Glow x={g.x + g.W * 0.7 + pan * 0.1} y={g.y + g.H * 0.2} s={g.s} color="#ffd890" core="#fff4d8" />
          {Array.from({ length: 4 }, (_, i) => {
            const t = (frame * 0.5 + i * 20) % 80;
            return <circle key={i} cx={g.x + g.W * 0.5 + Math.sin(t * 0.1 + i) * 10 * g.s + pan * 0.7} cy={g.ground - 60 * g.s - t * 1.4 * g.s} r={(6 + t * 0.2) * g.s} fill="#f4f0e6" opacity={0.4 * (1 - t / 80)} />;
          })}
          <rect x={g.x - 40 * g.s} y={g.ground - 30 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#a8322a" stroke={PAL.ink} strokeWidth={2 * g.s} />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} transform={`translate(${g.x + g.W * (0.06 + i * 0.08) + pan * 0.9},${g.ground - 20 * g.s})`}>
              <ellipse rx={20 * g.s} ry={30 * g.s} fill="none" stroke={i % 2 ? "#e8a030" : "#f4f0e6"} strokeWidth={9 * g.s} />
              <circle cy={30 * g.s} r={8 * g.s} fill="#c9302c" />
            </g>
          ))}
          <Candle x={g.x + g.W * 0.5 + pan * 0.9} y={g.ground - 30 * g.s} s={g.s * 1.3} />
          <rect x={g.x - 40 * g.s + pan * 1.6} y={g.ground + 40 * g.s} width={g.W + 80 * g.s} height={g.H} fill="#6a1a12" />
        </g>
      )}
    </V2>
  );
};

// Death beat: years counter 0 → 42.
const reignStat = (frame: number) => (frame < T.name ? "" : `${Math.round(interpolate(frame, [T.name, T.passed], [0, 42], clamp))} ปี`);

export const e5c8: Chapter5 = {
  name: "คำตอบ",
  from: T.from,
  to: END,
  cams: (w, h) => [
    { frame: T.from, cam: view(VW.hook, w, h, 0.86, 0.1) },
    { frame: T.a1, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.a2, cam: view(VW.hook, w, h, 0.86, 0.1) },
    { frame: T.a3, cam: view(VW.hook, w, h, 0.88, 0.1) },
    { frame: T.fin, cam: view(VW.siam, w, h, 0.85, 0.08) },
    { frame: T.death, cam: view(VW.siam, w, h, 0.88, 0.08) },
    { frame: T.death + 90, cam: view(VW.bkk, w, h, 0.9, 0.08) },
    { frame: T.poll, cam: view(VW.bkk, w, h, 0.95, 0.08) },
    { frame: T.poll + 80, cam: view(VW.siam, w, h, 0.85, 0.08) },
  ],
  years: [[T.from, "2453"], [T.y2481, "2481"], [T.death, "2453"]],
  heads: [
    { f: T.from, tag: "คำถามของวันนี้", head: "ทำไมไม่เป็นเมืองขึ้น?", color: GOLD },
    { f: T.a1, tag: "ข้อแรก", head: "① ปฏิรูปทันเวลา", color: GOLD, chips: [{ text: "ไม่มีข้ออ้าง", f: T.excuse }] },
    { f: T.a2, tag: "ข้อสอง", head: "② รัฐกันชน + การทูต", color: GOLD },
    { f: T.a3, tag: "ข้อสาม", head: "③ ยอมแลก", color: GOLD, chips: [{ text: "ดินแดนชายขอบ", f: T.edge }, { text: "รักษาใจกลาง", f: T.core }] },
    { f: T.fin, tag: "สิทธิสภาพนอกอาณาเขต", head: "หมดสิ้นราว พ.ศ. 2481", color: GOLD },
    { f: T.death, tag: "23 ต.ค. 2453", head: "เสด็จสวรรคต", stat: reignStat, label: "ครองราชย์", color: GOLD, portrait: "rama5", photo: "ภาพถ่าย" },
    { f: T.piya, tag: "23 ตุลาคม", head: "วันปิยมหาราช", color: GOLD, chips: [{ text: "พระปิยมหาราช", f: T.title }, { text: "ผู้เป็นที่รักยิ่ง", f: T.beloved }] },
    { f: T.poll, tag: "", head: "", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const ek = ramp(frame, T.from - 15, 15, END + 10);
    const thai = interpolate(frame, [T.death, T.piya, T.piya + 30], [1, 0.45, 1], clamp);
    const ceded = ramp(frame, T.edge, 16, T.fin);
    const pulse = 0.7 + 0.3 * Math.sin(frame * 0.12);
    return (
      <>
        <FinalEmpire k={ek} thai={thai} />
        {ceded > 0 && (
          <Empire
            areas={[
              ["laos", "#fff3c0", ceded * pulse],
              ["bsr", "#fff3c0", ceded * pulse],
              ["kedahPerlis", "#fff3c0", ceded * pulse],
              ["kelantan", "#fff3c0", ceded * pulse],
              ["terengganu", "#fff3c0", ceded * pulse],
            ]}
            pulse={false}
          />
        )}
        <CityDot at={PL.bkk} color={GOLD} r={14} start={T.from} />
        <Arrow points={R.railNorth} start={T.reform} end={T.reform + 30} color={GOLD} width={10} opacity={interpolate(frame, [T.a2, T.a2 + 15], [1, 0], clamp)} />
        <Arrow points={R.railSouth} start={T.reform + 10} end={T.reform + 50} color={GOLD} width={10} opacity={interpolate(frame, [T.a2, T.a2 + 15], [1, 0], clamp)} />
        <Ring at={[100.4, 15.0]} r={2.6} color={GOLD} start={T.powers} end={T.a3} />
        {frame >= T.death + 60 && <PointLabel at={PL.palace} text="พระบรมมหาราชวัง" start={T.death + 60} color={GOLD} size={0.75} />}
        {frame >= T.piya && <PointLabel at={DUSIT} text="ลานพระราชวังดุสิต" start={T.piya} color={GOLD} size={0.75} />}
      </>
    );
  },
  Panels: () => (
    <>
      <QuestionDeskScene id="e5c8desk" start={T.from - 4} end={T.a1 + 14} />
      <ReformEchoScene id="e5c8reform" start={T.a1} end={T.a2 + 14} hits={[T.reform]} />
      <DiplomacyScene id="e5c8diplo" start={T.a2} end={T.a3 + 14} hits={[T.diplo]} />
      <ScaleScene id="e5c8scale" start={T.a3} end={T.fin + 14} hits={[T.trade]} />
      <DuskPalaceScene id="e5c8dusk" start={T.death} end={T.piya + 14} />
      <PlazaScene id="e5c8plaza" start={T.piya} end={T.beloved + 14} />
      <OfferingScene id="e5c8offer" start={T.beloved} end={T.poll + 14} />
      <PlazaScene id="e5c8plaza2" start={T.poll} end={END + 14} evening />
    </>
  ),
  Screen: () => (
    <>
      <BigQ />
      <ReasonStack />
      <Timeline
        start={T.fin}
        end={T.death + 8}
        title="สิทธิพิเศษทางศาลของชาติตะวันตก"
        from={2390}
        to={2490}
        marks={[
          { at: 2398, top: "2398", bottom: "เบาว์ริง", f: T.fin + 10, color: RED },
          { at: 2452, top: "2450–52", bottom: "ศาลไทยบางส่วน", f: T.done },
          { at: 2453, top: "", bottom: "\n\nสิ้นรัชกาล 2453", f: T.reign, color: "#c8c8c8" },
          { at: 2481, top: "2481", bottom: "หมดสิ้น", f: T.y2481, big: true },
        ]}
      />
      <Poll3 />
    </>
  ),
  sfx: [
    [T.ask, SFX.hit, 0.4],
    [T.a1, SFX.pop, 0.3],
    [T.a2, SFX.pop, 0.3],
    [T.a3, SFX.pop, 0.3],
    [T.fin, SFX.whoosh, 0.25],
    [T.y2481, SFX.pop, 0.35],
    [T.o1, SFX.pop, 0.3],
    [T.o2, SFX.pop, 0.3],
    [T.o3, SFX.pop, 0.3],
    [T.type + 10, SFX.pop, 0.35],
  ],
  Audio: () => (
    <>
      <Bed id="wind" from={T.from - 6} to={T.a1 + 10} volume={0.15} voice={VOICE} />
      <Hit id="gong" at={T.ask} volume={0.35} />
      <Bed id="wind" from={T.a1} to={T.a2 + 10} volume={0.12} voice={VOICE} />
      <Hit id="electric_switch" at={T.reform} volume={0.3} />
      <Hit id="whistle_officer" at={T.reform + 30} volume={0.2} />
      <Bed id="city_crowd" from={T.a2} to={T.a3 + 10} volume={0.12} voice={VOICE} />
      <Hit id="applause_conference" at={T.diplo} volume={0.3} />
      <Bed id="fire_crackle" from={T.a3} to={T.fin + 10} volume={0.15} voice={VOICE} />
      <Hit id="wood_hit" at={T.trade} volume={0.4} />
      <Hit id="wood_hit" at={T.trade + 24} volume={0.25} />
      <Bed id="wind" from={T.fin} to={T.death + 10} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.y2481} volume={0.3} />
      <Bed id="wind" from={T.death} to={T.piya + 10} volume={0.18} voice={VOICE} />
      <Hit id="gong" at={T.name} volume={0.3} />
      <Hit id="gong" at={T.passed} volume={0.35} />
      <Bed id="city_crowd" from={T.piya} to={T.poll + 10} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={T.title} volume={0.3} />
      <Bed id="city_crowd" from={T.poll} to={END} volume={0.14} voice={VOICE} />
      <Hit id="crowd_cheer" at={T.type + 10} volume={0.25} />
    </>
  ),
};
