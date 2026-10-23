import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Glow } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { B, CHINA_C, CityDot, VIET_C, VOICE, wf, Zones, type Chapter4 } from "./beatsKit";
import { Calendar, Compare, FourSources, GREEN, inBeat, mono, NotePage, Staircase, Surname, Timeline } from "./ch6_cards";
import { PL, R, VW } from "./places";
import { Backdrop, C, Candle, Fighter, Manuscript, Noble, PAL, Smoke, V2, type G } from "./v2";

// Episode 4, chapter 6 (dates → agree): the sources disagree — dates, method, oldest texts, who wrote them,
// the Qing record, the Vietnamese record, today's historians, and the one thing all four sides share.

const T = {
  dates: B.dates.start,
  all: inBeat("dates", wf("dates", "หลัก", 0.33)),
  even: inBeat("dates", wf("dates", "แม้แต่", 0.6), 60),
  method: B.method.start,
  thai: inBeat("method", wf("method", "ประหาร", 0.32), 60),
  viet: inBeat("method", wf("method", "ถุง", 0.52), 40),
  early: B.early.start,
  line: inBeat("early", wf("early", "สำเร็จ", 0.39), 80),
  fort: inBeat("early", wf("early", "ป้อม", 0.47), 70),
  note: inBeat("early", wf("early", "บันทึก", 0.61), 60),
  skip: inBeat("early", wf("early", "ข้าม", 0.84), 20),
  written: B.written.start,
  w1: inBeat("written", wf("written", "พงศาวดาร", 0.3), 80),
  w2: inBeat("written", wf("written", "ชำระ", 0.69), 40),
  w3: inBeat("written", wf("written", "ทั้งหมด", 0.92), 10),
  grows: B.grows.start,
  china2: B.china2.start,
  zhao: inBeat("china2", wf("china2", "เจิ้ง", 0.35), 90),
  son1: inBeat("china2", wf("china2", "บุตร", 0.69), 40),
  hua: inBeat("china2", wf("china2", "เจิ้ง", 0.76, 1), 30),
  son: B.son.start,
  letter: inBeat("son", wf("son", "สาส์น", 0.26), 200),
  surname: inBeat("son", wf("son", "แซ่", 0.42), 150),
  seal: inBeat("son", wf("son", "บุตร", 0.69), 80),
  change: inBeat("son", wf("son", "เปลี่ยน", 0.9), 20),
  vietnam: B.vietnam.start,
  war: inBeat("vietnam", wf("vietnam", "คู่", 0.15), 250),
  vtell: inBeat("vietnam", wf("vietnam", "เจ้าพระยา", 0.45), 120),
  blame: inBeat("vietnam", wf("vietnam", "โยน", 0.83), 40),
  historians: B.historians.start,
  nidhi: inBeat("historians", wf("historians", "นิธิ", 0.32), 200),
  san: inBeat("historians", wf("historians", "พระยา", 0.76), 60),
  agree: B.agree.start,
  end: B.legend.start,
};
const [D6, D7, D10] = mono([wf("dates", "หก", 0.87), wf("dates", "เจ็ด", 0.88), wf("dates", "สิบ", 0.93)], 10, T.even + 10, B.dates.end + 8);
const STEPS = mono([T.grows + 12, wf("grows", "ห่าง", 0.26), wf("grows", "หนัก", 0.63), wf("grows", "สัญญา", 0.72)], 25, T.grows, B.grows.end - 10);
const CHECKS = mono([wf("agree", "ไทย", 0.3), wf("agree", "จีน", 0.32), wf("agree", "เวียดนาม", 0.34), wf("agree", "ฝรั่งเศส", 0.46)], 12, T.agree + 20, B.agree.end - 60);
const MATCH = Math.max(CHECKS[3] + 20, inBeat("agree", wf("agree", "ตรง", 0.52), 40));
const APRIL = Math.max(MATCH + 20, inBeat("agree", wf("agree", "เมษายน", 0.78), 15));
const SCROLL_OPEN = T.china2 + 18;

// ---------- illustrated panels ----------

// A monastery library: lacquered manuscript cabinet, a reader kneeling at a stand, dusk through the window.
// variant "faded": close on the oldest chronicle — the writing fades and one short line glows.
const ChronicleScene = ({ id, start, end, variant = "stand", lineF = 1e9 }: { id: string; start: number; end: number; variant?: "stand" | "faded"; lineF?: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={variant === "faded" ? PL.fort : PL.thon} start={start} end={end} sky={["#3a2a4a", "#e09a5a"]} accent={GOLD} warm={0.1}>
      {(g, pan, lt) => {
        const wx = g.x + g.W * 0.7 + pan * 0.2;
        const wy = g.y + 40 * g.s;
        const ww = 170 * g.s;
        const wh = 190 * g.s;
        const close = variant === "faded";
        const fade = close ? interpolate(lt, [10, 70], [1, 0.22], clamp) : 1;
        const lk = interpolate(frame, [lineF, lineF + 16], [0, 1], clamp);
        return (
          <g>
            {/* far: dusk window in a teak wall */}
            <Glow x={wx + ww * 0.6} y={wy + wh * 0.55} s={g.s} color="#ffb070" core="#ffe0a8" />
            <path d={`M${g.x - 60 * g.s} ${g.y - 10 * g.s} H${g.x + g.W + 60 * g.s} V${g.y + g.H + 10 * g.s} H${g.x - 60 * g.s} Z M${wx} ${wy + wh} V${wy + 40 * g.s} Q${wx + ww / 2} ${wy - 30 * g.s} ${wx + ww} ${wy + 40 * g.s} V${wy + wh} Z`} fill="#3a2414" fillRule="evenodd" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={wx + ww * f} y1={wy + 10 * g.s} x2={wx + ww * f} y2={wy + wh} stroke="#2a1a10" strokeWidth={6 * g.s} />)}
            {Array.from({ length: 7 }, (_, i) => <line key={i} x1={g.x - 60 * g.s + pan * 0.2} y1={g.y + (30 + i * 46) * g.s} x2={wx - 10 * g.s} y2={g.y + (30 + i * 46) * g.s} stroke="#2a1a0e" strokeWidth={1.4 * g.s} opacity={0.6} />)}
            {/* mid: lacquered manuscript cabinet (tu phra tham) */}
            <g transform={`translate(${g.x + g.W * (close ? 0.02 : 0.08) + pan * 0.5},${g.ground - 14 * g.s})`}>
              <path d={`M${-8 * g.s} 0 L${8 * g.s} ${-200 * g.s} L${142 * g.s} ${-200 * g.s} L${158 * g.s} 0 Z`} fill="#16100c" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={14 * g.s} y={-188 * g.s} width={122 * g.s} height={172 * g.s} fill="none" stroke={PAL.gilt} strokeWidth={2.5 * g.s} />
              <line x1={75 * g.s} y1={-188 * g.s} x2={75 * g.s} y2={-16 * g.s} stroke={PAL.gilt} strokeWidth={2 * g.s} />
              {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${(30 + (i % 3) * 22 + (i % 2) * 40) * g.s} ${(-170 + Math.floor(i / 3) * 40) * g.s} l${7 * g.s} ${-9 * g.s} l${7 * g.s} ${9 * g.s} l${-7 * g.s} ${9 * g.s} Z`} fill={PAL.gilt} opacity={0.85} />)}
            </g>
            {/* haze in the lamplight */}
            <rect x={g.x} y={g.ground - 110 * g.s} width={g.W} height={70 * g.s} fill="#ffcf8a" opacity={0.12} />
            {/* near: stand + manuscript + reader */}
            {close ? (
              <g>
                <rect x={g.x + g.W * 0.24 + pan * 0.7} y={g.ground - 30 * g.s} width={g.W * 0.62} height={40 * g.s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <Manuscript x={g.x + g.W * 0.27 + pan * 0.7} y={g.ground - 34 * g.s} w={g.W * 0.56} s={g.s} lines={7} fade={fade} />
                {lk > 0 && (
                  <g opacity={lk} transform={`translate(${g.x + g.W * 0.55 + pan * 0.7},${g.ground - 142 * g.s})`}>
                    <rect x={-170 * g.s} y={-30 * g.s} width={340 * g.s} height={44 * g.s} rx={8 * g.s} fill="#ffd25a" opacity={0.22 * lk} />
                    <text textAnchor="middle" y={4 * g.s} fontFamily={font} fontWeight={900} fontSize={30 * g.s} fill="#ffe7b8" stroke="#1a140f" strokeWidth={4 * g.s} paintOrder="stroke">"สำเร็จ … ป้อมท้ายเมือง"</text>
                  </g>
                )}
              </g>
            ) : (
              <g>
                <path d={`M${g.x + g.W * 0.42 + pan * 0.7} ${g.ground - 14 * g.s} l${14 * g.s} ${-70 * g.s} l${230 * g.s} 0 l${14 * g.s} ${70 * g.s} Z`} fill="#6b4422" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <rect x={g.x + g.W * 0.42 + pan * 0.7} y={g.ground - 92 * g.s} width={258 * g.s} height={12 * g.s} fill={PAL.ochre} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <Manuscript x={g.x + g.W * 0.43 + pan * 0.7} y={g.ground - 94 * g.s} w={240 * g.s} s={g.s} />
                <Noble x={g.x + g.W * 0.34 + pan * 0.7} y={g.ground - 6 * g.s} scale={g.sc * 0.62} mode="kneel" bow={0.25 + 0.1 * Math.sin(frame * 0.05)} jacket="#efe6d0" />
              </g>
            )}
            {/* foreground: candle + hanging cloth */}
            <Candle x={g.x + g.W * (close ? 0.92 : 0.9) + pan * 1.6} y={g.ground - 10 * g.s} s={g.s * 1.5} />
            <path d={`M${g.x - 20 * g.s + pan * 1.6} ${g.y} Q${g.x + 70 * g.s + pan * 1.6} ${g.y + 40 * g.s + Math.sin(frame * 0.05) * 4 * g.s} ${g.x + 160 * g.s + pan * 1.6} ${g.y} Z`} fill="#7a1f1a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
          </g>
        );
      }}
    </V2>
  );
};

// A Qing court hall at dawn: a scroll unrolls on the table; the column 子鄭華 is brushed in after 鄭昭 / 昭卒.
const ChineseScrollScene = ({ id, start, end, open, zhaoF, huaF }: { id: string; start: number; end: number; open: number; zhaoF: number; huaF: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.beijing} start={start} end={end} sky={["#f0c27a", "#f6e2b0"]} accent={CHINA_C} warm={0.08}>
      {(g, pan) => {
        const ok = interpolate(frame, [open - 14, open], [0, 1], clamp);
        const sx = g.x + g.W * 0.5 + pan * 0.7;
        const sw = 400 * g.s * ok;
        const top = g.ground - 250 * g.s;
        const hk = interpolate(frame, [huaF, huaF + 24], [0, 1], clamp);
        const zk = interpolate(frame, [zhaoF, zhaoF + 10], [0, 1], clamp);
        const cjk = `"Microsoft YaHei", "SimSun", "Noto Serif CJK SC", serif`;
        const col = (x: number, text: string, size: number, k = 1, color = PAL.ink) => (
          <g>
            <defs>
              <clipPath id={`${id}-c${Math.round(x)}`}><rect x={x - size} y={top + 14 * g.s} width={size * 2} height={(text.length * size + 10 * g.s) * k} /></clipPath>
            </defs>
            <g clipPath={`url(#${id}-c${Math.round(x)})`}>
              {text.split("").map((ch, i) => <text key={i} x={x} y={top + 14 * g.s + (i + 0.88) * size} textAnchor="middle" fontSize={size} fontFamily={cjk} fontWeight={700} fill={color}>{ch}</text>)}
            </g>
          </g>
        );
        return (
          <g>
            {/* far: palace roofs and the red wall at dawn */}
            <Glow x={g.x + g.W * 0.18 + pan * 0.1} y={g.y + g.H * 0.3} s={g.s} color="#ffcf7a" core="#fff1c9" />
            <rect x={g.x - 60 * g.s + pan * 0.2} y={g.ground - 120 * g.s} width={g.W + 120 * g.s} height={110 * g.s} fill="#9a2a22" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[0.12, 0.48, 0.84].map((f, i) => (
              <path key={f} d={`M${g.x + g.W * f - 120 * g.s + pan * 0.2} ${g.ground - 120 * g.s} q${20 * g.s} ${-6 * g.s} ${40 * g.s} ${-30 * g.s} h${160 * g.s} q${20 * g.s} ${24 * g.s} ${40 * g.s} ${30 * g.s} Z`} fill={i === 1 ? "#d9a93a" : "#c9962a"} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            ))}
            <rect x={g.x} y={g.ground - 140 * g.s} width={g.W} height={60 * g.s} fill="#fff1c9" opacity={0.25} />
            {/* mid: red pillars */}
            {[0.06, 0.94].map((f) => (
              <g key={f}>
                <rect x={g.x + g.W * f - 20 * g.s + pan * 0.5} y={g.y - 10 * g.s} width={40 * g.s} height={g.H} fill="#b3261e" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <rect x={g.x + g.W * f - 26 * g.s + pan * 0.5} y={g.y + 10 * g.s} width={52 * g.s} height={16 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
              </g>
            ))}
            {/* near: official at the table, the scroll */}
            <Fighter x={g.x + g.W * 0.84 + pan * 0.7} y={g.ground - 12 * g.s} scale={g.sc * 0.62} flip mode="stand" costume={C.qing} weapon="none" phase={1} />
            <rect x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground - 30 * g.s} width={g.W * 0.7} height={24 * g.s} fill="#5a1a14" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.x + g.W * 0.16 + pan * 0.7} y={g.ground - 8 * g.s} width={14 * g.s} height={60 * g.s} fill="#3a120e" />
            <rect x={g.x + g.W * 0.76 + pan * 0.7} y={g.ground - 8 * g.s} width={14 * g.s} height={60 * g.s} fill="#3a120e" />
            <rect x={sx - sw / 2} y={top} width={sw} height={220 * g.s} fill="#f3e6c4" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {ok > 0.98 && (
              <g>
                {col(sx + 150 * g.s, "暹羅國王", 30 * g.s, 1, "#5a4a3a")}
                {col(sx + 90 * g.s, "鄭昭", 52 * g.s, zk)}
                {col(sx + 30 * g.s, "昭卒", 34 * g.s, zk, "#5a4a3a")}
                {col(sx - 40 * g.s, "子鄭華", 52 * g.s, hk)}
                {col(sx - 105 * g.s, "嗣立", 34 * g.s, hk, "#5a4a3a")}
                {zk > 0.5 && <rect x={sx + 60 * g.s} y={top + 12 * g.s} width={60 * g.s} height={112 * g.s} fill="none" stroke={CHINA_C} strokeWidth={3 * g.s} rx={6 * g.s} opacity={zk} />}
                {hk > 0.9 && <rect x={sx - 70 * g.s} y={top + 60 * g.s} width={60 * g.s} height={112 * g.s} fill="none" stroke={CHINA_C} strokeWidth={3 * g.s} rx={6 * g.s} />}
              </g>
            )}
            <rect x={sx - sw / 2 - 12 * g.s} y={top - 8 * g.s} width={14 * g.s} height={236 * g.s} rx={7 * g.s} fill="#6b2a1a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={sx + sw / 2 - 2 * g.s} y={top - 8 * g.s} width={14 * g.s} height={236 * g.s} rx={7 * g.s} fill="#6b2a1a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {/* foreground: hanging lantern */}
            <g transform={`translate(${g.x + g.W * 0.2 + pan * 1.6},${g.y}) rotate(${Math.sin(frame * 0.06) * 4})`}>
              <line x1={0} y1={0} x2={0} y2={40 * g.s} stroke={PAL.ink} strokeWidth={2 * g.s} />
              <ellipse cx={0} cy={70 * g.s} rx={30 * g.s} ry={36 * g.s} fill="#d22a1e" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <circle cx={0} cy={70 * g.s} r={44 * g.s} fill="#ffb060" opacity={0.18} />
              <line x1={0} y1={106 * g.s} x2={0} y2={130 * g.s} stroke={PAL.gilt} strokeWidth={4 * g.s} />
            </g>
          </g>
        );
      }}
    </V2>
  );
};

// The Hue court: a scribe writes with a brush in an open pavilion; the citadel gate in the misty hills behind.
const VietScribeScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.hue} start={start} end={end} sky={["#7d93a6", "#e2d2b0"]} accent={VIET_C} warm={0.05}>
      {(g, pan, lt) => {
        const gx = g.x + g.W * 0.58 + pan * 0.5;
        const gy = g.ground - 40 * g.s;
        const write = (lt * 1.6) % 120;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.2]} lightColor={["#fff1c9", "#fffaf0"]} far="#6a7f8a" mid="#58705a" ground="#5a4a38" mist="#eef2f0" />
            {/* mid: Ngo Mon-style gate */}
            <rect x={gx} y={gy - 70 * g.s} width={300 * g.s} height={70 * g.s} fill="#8a8578" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {[0.2, 0.5, 0.8].map((f) => <path key={f} d={`M${gx + 300 * g.s * f - 18 * g.s} ${gy} v${-38 * g.s} q${18 * g.s} ${-20 * g.s} ${36 * g.s} 0 v${38 * g.s} Z`} fill="#2a2420" />)}
            <rect x={gx + 40 * g.s} y={gy - 110 * g.s} width={220 * g.s} height={40 * g.s} fill="#b3261e" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <path d={`M${gx + 10 * g.s} ${gy - 106 * g.s} q${30 * g.s} ${-4 * g.s} ${50 * g.s} ${-26 * g.s} h${180 * g.s} q${20 * g.s} ${22 * g.s} ${50 * g.s} ${26 * g.s} Z`} fill="#d9a93a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <path d={`M${gx + 60 * g.s} ${gy - 132 * g.s} q${20 * g.s} ${-4 * g.s} ${34 * g.s} ${-20 * g.s} h${112 * g.s} q${14 * g.s} ${16 * g.s} ${34 * g.s} ${20 * g.s} Z`} fill="#3f8a5a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={g.x} y={g.ground - 80 * g.s} width={g.W} height={40 * g.s} fill="#f4f6f2" opacity={0.3} />
            {/* near: pavilion floor, scribe at a low desk, an official waiting */}
            <rect x={g.x - 40 * g.s} y={g.ground - 20 * g.s} width={g.W * 0.62} height={80 * g.s} fill="#6b2a1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.x + g.W * 0.03 + pan * 0.7} y={g.y - 10 * g.s} width={26 * g.s} height={g.ground - g.y - 10 * g.s} fill="#9a2a22" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <Noble x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground - 20 * g.s} scale={g.sc * 0.62} mode="sit" jacket="#1f3f5f" phase={0.5} />
            <rect x={g.x + g.W * 0.25 + pan * 0.7} y={g.ground - 56 * g.s} width={150 * g.s} height={14 * g.s} fill="#3a1a10" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={g.x + g.W * 0.27 + pan * 0.7} y={g.ground - 66 * g.s} width={110 * g.s} height={10 * g.s} fill="#f3e6c4" stroke={PAL.ink} strokeWidth={1 * g.s} />
            {[0, 1, 2, 3].map((i) => <line key={i} x1={g.x + g.W * 0.27 + (12 + i * 24) * g.s + pan * 0.7} y1={g.ground - 61 * g.s} x2={g.x + g.W * 0.27 + (12 + i * 24 + Math.min(18, Math.max(0, write - i * 30))) * g.s + pan * 0.7} y2={g.ground - 61 * g.s} stroke={PAL.ink} strokeWidth={3 * g.s} />)}
            <line x1={g.x + g.W * 0.24 + pan * 0.7} y1={g.ground - 84 * g.s} x2={g.x + g.W * 0.28 + Math.sin(frame * 0.4) * 4 * g.s + pan * 0.7} y2={g.ground - 64 * g.s} stroke="#3a2a1a" strokeWidth={3 * g.s} />
            <Fighter x={g.x + g.W * 0.48 + pan * 0.7} y={g.ground - 20 * g.s} scale={g.sc * 0.6} flip mode="stand" costume={C.viet} weapon="none" phase={2} />
            {/* foreground: banana leaves + silk lantern */}
            {[0, 1, 2].map((i) => <path key={i} d={`M${g.x + g.W * 0.94 + pan * 1.6} ${g.y + g.H} q${(-60 - i * 30) * g.s} ${(-90 - i * 30) * g.s + Math.sin(frame * 0.05 + i) * 4 * g.s} ${(-130 - i * 20) * g.s} ${(-60 - i * 50) * g.s}`} stroke="#3f6a3a" strokeWidth={22 * g.s} fill="none" strokeLinecap="round" />)}
            <g transform={`translate(${g.x + g.W * 0.4 + pan * 1.6},${g.y}) rotate(${Math.sin(frame * 0.07) * 5})`}>
              <line x1={0} y1={0} x2={0} y2={30 * g.s} stroke={PAL.ink} strokeWidth={2 * g.s} />
              <path d={`M${-22 * g.s} ${34 * g.s} Q0 ${20 * g.s} ${22 * g.s} ${34 * g.s} Q${30 * g.s} ${60 * g.s} ${22 * g.s} ${86 * g.s} Q0 ${100 * g.s} ${-22 * g.s} ${86 * g.s} Q${-30 * g.s} ${60 * g.s} ${-22 * g.s} ${34 * g.s} Z`} fill="#e8b23a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <circle cx={0} cy={60 * g.s} r={40 * g.s} fill="#ffd27a" opacity={0.2} />
            </g>
          </g>
        );
      }}
    </V2>
  );
};

// Today: a historian's desk at night — lamp light, open books, rain on the window over a lit city.
const HistorianScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#0e1626", "#1e2a40"]} accent={GOLD} warm={0.06}>
      {(g: G, pan) => {
        const wx = g.x + g.W * 0.08 + pan * 0.2;
        const wy = g.y + 30 * g.s;
        const ww = 300 * g.s;
        const wh = 190 * g.s;
        const lampX = g.x + g.W * 0.72 + pan * 0.7;
        return (
          <g>
            {/* far: window, rain over a lit city */}
            <rect x={g.x - 60 * g.s} y={g.y - 10 * g.s} width={g.W + 120 * g.s} height={g.H + 20 * g.s} fill="#2a2f3e" />
            <rect x={wx} y={wy} width={ww} height={wh} fill="#0c1424" stroke={PAL.ink} strokeWidth={3 * g.s} />
            <Glow x={wx + ww * 0.78} y={wy + 40 * g.s} s={g.s * 0.5} color="#9fb4e0" core="#eef2ff" />
            {Array.from({ length: 14 }, (_, i) => <rect key={i} x={wx + (8 + i * 21) * g.s} y={wy + wh - (30 + ((i * 37) % 70)) * g.s} width={16 * g.s} height={(30 + ((i * 37) % 70)) * g.s} fill="#1a2238" />)}
            {Array.from({ length: 30 }, (_, i) => <rect key={i} x={wx + (12 + ((i * 53) % 280)) * g.s} y={wy + wh - (10 + ((i * 29) % 80)) * g.s} width={4 * g.s} height={4 * g.s} fill="#ffd27a" opacity={0.7} />)}
            {Array.from({ length: 18 }, (_, i) => {
              const ry = ((frame * 9 + i * 41) % (wh + 40 * g.s)) - 20 * g.s;
              return <line key={i} x1={wx + ((i * 47) % 290) * g.s} y1={wy + ry} x2={wx + ((i * 47) % 290) * g.s - 6 * g.s} y2={wy + ry + 22 * g.s} stroke="#9fb4e0" strokeWidth={1.4 * g.s} opacity={0.5} />;
            })}
            <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#3a3f4e" strokeWidth={6 * g.s} />
            {/* mid: bookshelf */}
            <g transform={`translate(${g.x + g.W * 0.44 + pan * 0.5},${g.y + 20 * g.s})`}>
              <rect x={0} y={0} width={360 * g.s} height={240 * g.s} fill="#4a3020" stroke={PAL.ink} strokeWidth={2 * g.s} />
              {[0, 1, 2].map((r) => (
                <g key={r}>
                  <rect x={0} y={(76 + r * 78) * g.s} width={360 * g.s} height={8 * g.s} fill="#2a1a10" />
                  {Array.from({ length: 16 }, (_, i) => <rect key={i} x={(8 + i * 21.5) * g.s} y={(18 + r * 78 + (i % 3) * 4) * g.s} width={17 * g.s} height={(58 - (i % 3) * 4) * g.s} fill={["#7a2a22", "#2b3a67", "#5b6e4a", "#a8822a", "#3a2a4a"][(i + r * 2) % 5]} stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                </g>
              ))}
            </g>
            {/* lamp haze */}
            <path d={`M${lampX} ${g.ground - 130 * g.s} L${lampX - 170 * g.s} ${g.ground - 20 * g.s} L${lampX + 120 * g.s} ${g.ground - 20 * g.s} Z`} fill="#ffd38a" opacity={0.16} />
            {/* near: historian at the desk */}
            <Noble x={g.x + g.W * 0.5 + pan * 0.7} y={g.ground - 16 * g.s} scale={g.sc * 0.9} mode="kneel" bow={0.12 + 0.05 * Math.sin(frame * 0.04)} jacket="#d8dce4" />
            <rect x={g.x + g.W * 0.44 + pan * 0.7} y={g.ground - 46 * g.s} width={g.W * 0.5} height={20 * g.s} fill="#6b4a2a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.x + g.W * 0.47 + pan * 0.7} y={g.ground - 26 * g.s} width={14 * g.s} height={60 * g.s} fill="#4a3020" />
            <rect x={g.x + g.W * 0.9 + pan * 0.7} y={g.ground - 26 * g.s} width={14 * g.s} height={60 * g.s} fill="#4a3020" />
            <path d={`M${g.x + g.W * 0.56 + pan * 0.7} ${g.ground - 46 * g.s} l${60 * g.s} ${-8 * g.s} l${60 * g.s} ${8 * g.s} l0 ${-6 * g.s} l${-60 * g.s} ${-8 * g.s} l${-60 * g.s} ${8 * g.s} Z`} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <g>
              <line x1={lampX} y1={g.ground - 46 * g.s} x2={lampX + 30 * g.s} y2={g.ground - 110 * g.s} stroke="#2a2a2a" strokeWidth={4 * g.s} />
              <path d={`M${lampX + 6 * g.s} ${g.ground - 130 * g.s} l${44 * g.s} ${8 * g.s} l${-14 * g.s} ${26 * g.s} Z`} fill="#2f6a4a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <circle cx={lampX + 26 * g.s} cy={g.ground - 104 * g.s} r={9 * g.s} fill="#fff1c9" />
            </g>
            {/* foreground: book stack + tea steam */}
            {[0, 1, 2, 3].map((i) => <rect key={i} x={g.x + g.W * 0.02 + pan * 1.6 + (i % 2) * 6 * g.s} y={g.y + g.H - (26 + i * 22) * g.s} width={150 * g.s} height={20 * g.s} fill={["#7a2a22", "#2b3a67", "#a8822a", "#5b6e4a"][i]} stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
            <rect x={g.x + g.W * 0.86 + pan * 1.6} y={g.ground - 74 * g.s} width={30 * g.s} height={30 * g.s} rx={5 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            <Smoke x={g.x + g.W * 0.86 + 15 * g.s + pan * 1.6} y={g.ground - 80 * g.s} s={g.s * 0.35} n={4} />
          </g>
        );
      }}
    </V2>
  );
};

export const e4c6: Chapter4 = {
  name: "หลักฐานไม่ตรงกัน",
  from: T.dates,
  to: T.end,
  cams: (w, h) => [
    { frame: T.dates, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.early, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.early + 40, cam: view(VW.thonWide, w, h, 1.15, 0.08) },
    { frame: T.written, cam: view(VW.thonWide, w, h, 1.15, 0.08) },
    { frame: T.written + 45, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.china2, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.china2 + 45, cam: view(VW.asia, w, h, 0.45, 0.1) },
    { frame: T.vietnam, cam: view(VW.asia, w, h, 0.45, 0.1) },
    { frame: T.vietnam + 40, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.historians, cam: view(VW.region, w, h, 0.85, 0.1) },
    { frame: T.historians + 40, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.agree, cam: view(VW.siam, w, h, 0.8, 0.1) },
    { frame: T.agree + 40, cam: view(VW.asia, w, h, 0.45, 0.1) },
  ],
  years: [[T.dates, "2325–ปัจจุบัน"]],
  heads: [
    { f: T.dates, tag: "ฉบับพงศาวดาร", head: "คือเรื่องที่เพิ่งเล่ามา", color: GOLD },
    { f: T.all, tag: "ถ้าวางหลักฐานทั้งหมดเรียงกัน", head: "จะเห็นอะไร?", color: GOLD },
    { f: T.even, tag: "วันสิ้นพระชนม์", head: "มีถึง 3 วัน", stat: "6 · 7 · 10", label: "เมษายน 2325", color: RED },
    { f: T.method, tag: "วิธีไม่ตรงกัน", head: "ไทย vs เวียดนาม", color: RED },
    { f: T.early, tag: "พงศาวดารฉบับเก่าสุด", head: "เขียนไว้สั้นมาก", color: GOLD },
    { f: T.note, tag: "บันทึกกรมหลวงนรินทรเทวี", head: "ข้ามเรื่องนี้ไปเลย", color: GOLD },
    { f: T.written, tag: "พงศาวดารไทย", head: "ชำระในสมัยหลัง", color: GOLD, chips: [{ text: "ทุกฉบับอยู่หลัง 2325", f: T.w3 }] },
    { f: T.grows, tag: "ยิ่งเขียนห่างจากเหตุการณ์", head: "คำบรรยายยิ่งหนัก", color: RED },
    { f: STEPS[3], tag: "คำว่า \"สัญญาวิปลาส\"", head: "เพิ่งมาในสมัย ร.2", color: RED },
    { f: T.china2, tag: "บันทึกราชวงศ์ชิง (ถอดความ)", head: "\"เจิ้งเจาสิ้นพระชนม์\"", color: CHINA_C },
    { f: T.son1, tag: "บันทึกจีน (ถอดความ)", head: "\"บุตรขึ้นครองต่อ\"", color: CHINA_C },
    { f: T.son, tag: "เจิ้งหัว", head: "คือรัชกาลที่ 1", color: CHINA_C, portrait: "chakri" },
    { f: T.surname, tag: "ใช้แซ่เดียวกับพระเจ้าตาก", head: "จีนรับรอง 2330", color: CHINA_C },
    { f: T.change, tag: "ในสายตาราชสำนักจีน", head: "ไม่มีการเปลี่ยนราชวงศ์", color: CHINA_C },
    { f: T.vietnam, tag: "ฝั่งเวียดนามเล่า", head: "แต่เป็นคู่สงคราม", color: VIET_C, chips: [{ text: "คู่สงคราม", f: T.war }, { text: "หลักฐานมือสอง", f: T.war + 20 }] },
    { f: T.vtell, tag: "ฝั่งเวียดนามเล่า", head: "เล่าต่างออกไป", color: VIET_C, chips: [{ text: "คู่สงคราม", f: T.vtell + 20 }, { text: "หลักฐานมือสอง", f: T.vtell + 45 }] },
    { f: T.blame, tag: "ฝั่งเวียดนามเล่า", head: "แต่เป็นคู่สงคราม", color: VIET_C },
    { f: T.historians, tag: "นักประวัติศาสตร์ปัจจุบัน", head: "ยังเห็นต่างกัน", color: GOLD },
    { f: T.agree, tag: "แต่มีเรื่องหนึ่ง", head: "ที่ทุกฝ่ายตรงกัน", color: GREEN },
    { f: APRIL, tag: "4 ฝ่ายตรงกัน", head: "สิ้นพระชนม์ ต้น เม.ย. 2325", color: GREEN },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const asia = frame >= T.china2 && frame < T.historians + 30;
    const agree = frame >= T.agree;
    return (
      <>
        <Zones k={{ viet: interpolate(frame, [T.vietnam + 30, T.vietnam + 50, T.historians + 20, T.historians + 40], [0, 0.7, 0.7, 0], clamp) }} />
        <CityDot at={PL.thon} color={GOLD} r={14} end={T.fort} />
        {(frame < T.fort || (frame >= T.written + 10 && frame < T.written + 40)) && <PointLabel at={PL.thon} text="ธนบุรี" start={T.dates + 6} color={GOLD} size={0.85} />}
        {frame >= T.fort && frame < T.written + 10 && <PointLabel at={PL.fort} text="ป้อมท้ายเมือง" start={T.fort} color={RED} size={0.8} />}
        {asia && (
          <>
            <PointLabel at={PL.thon} text="ธนบุรี" start={T.china2 + 30} color={GOLD} size={0.8} />
            <PointLabel at={PL.beijing} text="ปักกิ่ง" start={T.china2 + 40} color={CHINA_C} size={0.85} />
            <Arrow points={R.china} start={T.letter} end={T.letter + 60} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.vietnam, T.vietnam + 20], [1, 0], clamp)} />
          </>
        )}
        {frame >= T.vietnam + 30 && frame < T.historians + 30 && (
          <>
            <PointLabel at={PL.hue} text="เว้" start={T.vietnam + 40} color={VIET_C} size={0.85} />
            <PointLabel at={PL.saigon} text="ไซ่ง่อน" start={T.vietnam + 55} color={VIET_C} size={0.8} />
          </>
        )}
        {agree && (
          <>
            <PointLabel at={PL.thon} text="ไทย" start={CHECKS[0]} color={GOLD} size={0.8} />
            <PointLabel at={PL.beijing} text="จีน" start={CHECKS[1]} color={CHINA_C} size={0.8} />
            <PointLabel at={PL.hue} text="เวียดนาม" start={CHECKS[2]} color={VIET_C} size={0.8} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <>
      <ChronicleScene id="e4c6chron" start={T.dates} end={T.even + 14} />
      <ChronicleScene id="e4c6early" start={T.early} end={T.note + 14} variant="faded" lineF={T.line} />
      <ChineseScrollScene id="e4c6scroll" start={T.china2} end={T.son + 14} open={SCROLL_OPEN} zhaoF={T.zhao} huaF={T.hua} />
      <VietScribeScene id="e4c6viet" start={T.vietnam} end={T.historians + 14} />
      <HistorianScene id="e4c6hist" start={T.historians} end={T.nidhi + 14} />
    </>
  ),
  Screen: () => (
    <>
      <Calendar start={T.even} end={T.method + 8} marks={[[6, D6], [7, D7], [10, D10]]} />
      <Compare
        start={T.method}
        end={T.early + 8}
        title="วิธีสิ้นพระชนม์ · หลักฐานเล่าต่างกัน"
        left={{ tag: "พงศาวดารไทย (ฉบับหลัง)", text: "ประหาร", color: GOLD, f: T.thai, icon: "thai" }}
        right={{ tag: "พงศาวดารเวียดนาม", text: "ถุงกำมะหยี่ · ท่อนจันทน์", color: VIET_C, f: T.viet, icon: "viet" }}
      />
      <NotePage start={T.note} end={T.written + 8} title="จดหมายเหตุความทรงจำ กรมหลวงนรินทรเทวี" gapAt={T.skip} note="ไม่กล่าวถึงเรื่องนี้" />
      <Timeline
        start={T.written}
        end={T.grows + 8}
        title="พงศาวดารไทย เขียน/ชำระเมื่อไหร่"
        from={2318}
        to={2420}
        marks={[
          { at: 2325, top: "2325", bottom: "เหตุการณ์", f: T.written + 8, color: RED, big: true },
          { at: 2346, top: "2338", bottom: "ฉบับ 2338", f: T.w1 },
          { at: 2400, top: "สมัยหลัง", bottom: "ฉบับพระราช\nหัตถเลขา", f: T.w2 },
        ]}
        zone={{ from: 2329, text: "ชำระในสมัยราชวงศ์ใหม่", f: T.w3 }}
      />
      <Staircase
        start={T.grows}
        end={T.china2 + 8}
        steps={[
          { year: "นรินทรเทวี", text: "ไม่กล่าวถึง", f: STEPS[0] },
          { year: "2332", text: "\"วิปริต\"", f: STEPS[1] },
          { year: "2338", text: "ฉบับ 2338", f: STEPS[2] },
          { year: "สมัย ร.2", text: "\"สัญญาวิปลาส\"", f: STEPS[3] },
        ]}
      />
      <Surname start={T.son} end={T.vietnam + 8} arrowF={T.surname} sealF={T.seal} />
      <Compare
        start={T.nidhi}
        end={T.agree + 8}
        title="นักประวัติศาสตร์เห็นต่างกัน"
        left={{ tag: "นิธิ เอียวศรีวงศ์ 2529", text: "เหตุทางการเมือง", color: GOLD, f: T.nidhi + 6, icon: "book" }}
        right={{ tag: "งานวิจัย 2558", text: "พระยาสรรค์คือต้นเหตุ", color: RED, f: T.san, icon: "book" }}
      />
      <FourSources start={T.agree} end={T.end + 8} checks={CHECKS} bottom={{ text: "สิ้นพระชนม์ ต้น เม.ย. 2325", f: MATCH }} />
    </>
  ),
  sfx: [
    [T.all, SFX.pop, 0.3],
    [T.even, SFX.hit, 0.35],
    [D6, SFX.pop, 0.35],
    [D7, SFX.pop, 0.35],
    [D10, SFX.pop, 0.35],
    [T.method, SFX.whoosh, 0.25],
    [T.thai, SFX.pop, 0.35],
    [T.viet, SFX.pop, 0.35],
    [T.early + 34, SFX.whoosh, 0.25],
    [T.fort, SFX.pop, 0.3],
    [T.note, SFX.pop, 0.3],
    [T.skip, SFX.hit, 0.3],
    [T.written, SFX.whoosh, 0.25],
    [T.w1, SFX.tick, 0.35],
    [T.w2, SFX.tick, 0.35],
    [T.w3, SFX.pop, 0.35],
    ...STEPS.map((f, i) => [f, i === 3 ? SFX.hit : SFX.tick, 0.35] as [number, string, number]),
    [T.china2 + 39, SFX.whoosh, 0.35],
    [T.son, SFX.pop, 0.3],
    [T.letter, SFX.whoosh, 0.25],
    [T.surname, SFX.pop, 0.3],
    [T.vietnam + 34, SFX.whoosh, 0.3],
    [T.war, SFX.pop, 0.3],
    [T.historians + 34, SFX.whoosh, 0.25],
    [T.nidhi + 6, SFX.pop, 0.35],
    [T.san, SFX.pop, 0.35],
    [T.agree + 34, SFX.whoosh, 0.3],
    ...CHECKS.map((f) => [f, SFX.tick, 0.4] as [number, string, number]),
    [MATCH, SFX.hit, 0.4],
  ],
  Audio: () => (
    <>
      {/* library at dusk: the candle */}
      <Bed id="fire_crackle" from={T.dates} to={T.even + 14} volume={0.12} voice={VOICE} />
      <Bed id="fire_crackle" from={T.early} to={T.note + 14} volume={0.12} voice={VOICE} />
      {/* Qing court: wind in the hall, gong as the scroll opens */}
      <Bed id="wind" from={T.china2} to={T.son + 14} volume={0.14} voice={VOICE} />
      <Hit id="gong" at={SCROLL_OPEN} volume={0.35} />
      {/* the seal stamped on the recognition */}
      <Hit id="wood_hit" at={T.seal} volume={0.35} />
      {/* Hue: misty morning wind */}
      <Bed id="wind" from={T.vietnam} to={T.historians + 14} volume={0.16} voice={VOICE} />
      {/* historian's desk: rain on the window */}
      <Bed id="rain_light" from={T.historians} to={T.nidhi + 14} volume={0.18} voice={VOICE} />
    </>
  ),
};
