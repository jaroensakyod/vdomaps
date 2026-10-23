import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { Glow } from "../../../components/Scene";
import { Bed, Hit, SFX } from "./mix";
import { clamp, font, GOLD, RED, view } from "../news/kit";
import { B, CityDot, Ring, VOICE, wf, type Chapter4 } from "./beatsKit";
import { FlickerTable, inBeat, mono, Timeline } from "./ch6_cards";
import { PL, R, VW } from "./places";
import { Backdrop, C, Fighter, Fire, Grass, Hall, Monk, Noble, PAL, Prang, Puppet, ShadowStage, Smoke, Tree, V2 } from "./v2";

// Episode 4, chapter 7 (legend → why): the Nakhon Si Thammarat legend — what it says (nang yai), when it was
// first printed, how its versions contradict each other, why historians reject it, and why it lives on.

const T = {
  legend: B.legend.start,
  nakhon: inBeat("legend", wf("legend", "นครศรีธรรมราช", 0.47), 30),
  story: B.story.start,
  sub: inBeat("story", wf("story", "ตัวแทน", 0.32), 140),
  boat: inBeat("story", wf("story", "เรือ", 0.53), 100),
  hill: inBeat("story", wf("story", "เขา", 0.68), 50),
  years: inBeat("story", wf("story", "หลาย", 0.91), 10),
  fp: B.firstprint.start,
  y2492: inBeat("firstprint", wf("firstprint", "สี่", 0.31), 250),
  luang: inBeat("firstprint", wf("firstprint", "หลวง", 0.48), 160),
  unsure: inBeat("firstprint", wf("firstprint", "ยืนยัน", 0.92), 15),
  versions: B.versions.start,
  verdict: B.verdict.start,
  zero: inBeat("verdict", wf("verdict", "หลัก", 0.36), 220),
  king: inBeat("verdict", wf("verdict", "กษัตริย์", 0.55), 150),
  guard: inBeat("verdict", wf("verdict", "เฝ้า", 0.69), 100),
  why: B.why.start,
  want: inBeat("why", wf("why", "อยาก", 0.5), 80),
  end: B.answer.start,
};
const ROWS = mono([wf("versions", "ใคร", 0.4), wf("versions", "ทำไม", 0.52), wf("versions", "ที่ไหน", 0.75)], 20, T.versions + 30, B.versions.end - 20);
const BOAT = Math.max(T.boat, T.sub + 40);
const HILL = Math.max(T.hill, BOAT + 30);
const PRESS = [T.luang + 18, T.luang + 52, T.luang + 86, T.luang + 120];
const BOW = T.want;

// ---------- illustrated panels ----------

// Khao Khun Phanom at dusk: a limestone hill with a small temple on top, a monk climbing the path.
const KhunPhanomScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <V2 id={id} anchor={PL.khunphanom} start={start} end={end} sky={["#4a3a6a", "#f0a060"]} accent={GOLD} warm={0.08}>
    {(g, pan, lt) => {
      const hx = g.x + g.W * 0.5 + pan * 0.5;
      const hb = g.ground - 14 * g.s;
      const climb = interpolate(lt, [0, 200], [0, 1], clamp);
      return (
        <g>
          <Backdrop g={g} pan={pan} light={[0.82, 0.42]} lightColor={["#ffb060", "#ffe7b8"]} far="#6a5a7a" mid="#4a5a4a" ground="#3a3a24" mist="#f0c8a0" />
          {/* mid: the karst hill */}
          <path d={`M${hx - 230 * g.s} ${hb} C${hx - 220 * g.s} ${hb - 150 * g.s} ${hx - 150 * g.s} ${hb - 250 * g.s} ${hx - 40 * g.s} ${hb - 262 * g.s} C${hx + 60 * g.s} ${hb - 270 * g.s} ${hx + 150 * g.s} ${hb - 200 * g.s} ${hx + 170 * g.s} ${hb - 120 * g.s} L${hx + 250 * g.s} ${hb} Z`} fill="#5a6a4a" stroke={PAL.ink} strokeWidth={2 * g.s} />
          <path d={`M${hx - 120 * g.s} ${hb - 200 * g.s} q${20 * g.s} ${60 * g.s} ${-10 * g.s} ${150 * g.s} M${hx + 90 * g.s} ${hb - 200 * g.s} q${-16 * g.s} ${50 * g.s} ${14 * g.s} ${120 * g.s}`} stroke="#8a8a72" strokeWidth={6 * g.s} fill="none" opacity={0.6} />
          {[...Array(6)].map((_, i) => <circle key={i} cx={hx + (-170 + i * 64) * g.s} cy={hb - (60 + ((i * 37) % 70)) * g.s} r={(22 + (i % 3) * 6) * g.s} fill="#3f5a3a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
          <path d={`M${hx - 180 * g.s} ${hb} L${hx - 120 * g.s} ${hb - 60 * g.s} L${hx - 160 * g.s} ${hb - 110 * g.s} L${hx - 80 * g.s} ${hb - 170 * g.s} L${hx - 50 * g.s} ${hb - 240 * g.s}`} stroke="#d8c8a0" strokeWidth={5 * g.s} fill="none" strokeDasharray={`${6 * g.s} ${4 * g.s}`} />
          <Hall x={hx - 90 * g.s} y={hb - 255 * g.s} w={90 * g.s} s={g.s} roof="#a8322a" glow={0.6} />
          <Monk x={hx - 180 * g.s + climb * 60 * g.s} y={hb - climb * 60 * g.s} scale={g.sc * 0.36} mode="walk" />
          <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={46 * g.s} fill="#f6d2a8" opacity={0.25} />
          {/* near: palms */}
          <Tree x={g.x + g.W * 0.12 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s * 1.3} kind="palm" />
          <Tree x={g.x + g.W * 0.86 + pan * 0.7} y={g.ground - 10 * g.s} s={g.s * 1.1} kind="palm" />
          <Grass g={g} shift={pan * 1.6} color="#2a3018" />
        </g>
      );
    }}
  </V2>
);

// Nang yai: the substitute steps in at the palace, then a small boat rowed by four boatmen slips away south.
const LegendShadow = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <ShadowStage id={id} anchor={PL.thon} start={start} end={end}>
      {(g) => {
        const ink = "#100a06";
        const scroll = interpolate(frame, [BOAT - 10, BOAT + 50], [0, -g.W * 0.75], clamp);
        const walkIn = interpolate(frame, [start + 10, T.sub + 10], [g.W * 0.92, g.W * 0.42], clamp);
        const kingOut = interpolate(frame, [T.sub + 10, BOAT], [g.W * 0.3, g.W * 0.62], clamp);
        const water = g.ground - 18 * g.s;
        const bx = interpolate(frame, [BOAT, end], [g.x - 160 * g.s, g.x + g.W * 0.62], clamp);
        const hill = interpolate(frame, [HILL, HILL + 30], [0, 1], clamp);
        const bob = Math.sin(frame * 0.18) * 3 * g.s;
        return (
          <g>
            {/* palace (scrolls away when the boat leaves) */}
            <g transform={`translate(${scroll},0)`}>
              <path d={`M${g.x + 30 * g.s} ${g.ground} v${-70 * g.s} ${[...Array(9)].map((_, i) => `h${10 * g.s} v${-12 * g.s} h${10 * g.s} v${12 * g.s}`).join(" ")} v${70 * g.s} Z`} fill={ink} />
              <path d={`M${g.x + 90 * g.s} ${g.ground - 70 * g.s} l${20 * g.s} ${-120 * g.s} l${20 * g.s} ${120 * g.s} Z`} fill={ink} />
              {frame < BOAT + 10 && <Puppet x={g.x + kingOut} y={g.ground - 10 * g.s} s={g.s * 0.95} kind="thai" arm={0.2} />}
              {frame < BOAT + 10 && <Puppet x={g.x + walkIn} y={g.ground - 10 * g.s} s={g.s * 0.95} kind="plain" flip arm={0.1 + 0.1 * Math.sin(frame * 0.1)} />}
            </g>
            {/* river */}
            <path d={`M${g.x} ${g.y + g.H} V${water} ${[...Array(14)].map((_, i) => `q${18 * g.s} ${-10 * g.s * Math.sin(frame * 0.1 + i)} ${36 * g.s} 0`).join(" ")} V${g.y + g.H} Z`} fill={ink} opacity={frame >= BOAT - 10 ? interpolate(frame, [BOAT - 10, BOAT + 10], [0, 1], clamp) : 0} />
            {/* the hill rises on the right */}
            {hill > 0 && (
              <g opacity={hill} transform={`translate(0,${(1 - hill) * 60 * g.s})`}>
                <path d={`M${g.x + g.W * 0.7} ${water} Q${g.x + g.W * 0.78} ${g.y + 60 * g.s} ${g.x + g.W * 0.88} ${g.y + 70 * g.s} Q${g.x + g.W * 0.98} ${g.y + 120 * g.s} ${g.x + g.W} ${water} Z`} fill={ink} />
                <path d={`M${g.x + g.W * 0.84} ${g.y + 72 * g.s} l${10 * g.s} ${-30 * g.s} l${10 * g.s} ${30 * g.s} Z`} fill={ink} />
              </g>
            )}
            {/* the boat: four boatmen and the passenger */}
            {frame >= BOAT - 5 && (
              <g transform={`translate(${bx},${water + bob})`}>
                {[0, 1, 2, 3].map((i) => <Puppet key={i} x={(-120 + i * 52) * g.s} y={0} s={g.s * 0.55} kind="boatman" arm={0.45 + 0.4 * Math.sin(frame * 0.22 + i * 0.4)} />)}
                <Puppet x={110 * g.s} y={-4 * g.s} s={g.s * 0.6} kind="plain" />
                <path d={`M${-170 * g.s} ${-26 * g.s} Q${-190 * g.s} ${-50 * g.s} ${-196 * g.s} ${-66 * g.s} L${-150 * g.s} ${-26 * g.s} Z M${-170 * g.s} ${-26 * g.s} L${170 * g.s} ${-30 * g.s} Q${150 * g.s} ${6 * g.s} ${120 * g.s} ${8 * g.s} L${-140 * g.s} ${8 * g.s} Z`} fill={ink} />
                {[...Array(10)].map((_, i) => <circle key={i} cx={(-130 + i * 28) * g.s} cy={-12 * g.s} r={2 * g.s} fill="#f6d9a0" opacity={0.8} />)}
              </g>
            )}
            <text x={g.x + g.W - 40 * g.s} y={g.y + 40 * g.s} textAnchor="end" fontFamily={font} fontWeight={900} fontSize={24 * g.s} fill="#3a1a08" opacity={0.7}>ตามตำนาน</text>
          </g>
        );
      }}
    </ShadowStage>
  );
};

// A print shop around 2492: the press stamps, the first book of the legend lies on the desk.
const PressScene = ({ id, start, end }: { id: string; start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#3a3428", "#6a5a40"]} accent={GOLD} warm={0.1} hits={PRESS}>
      {(g, pan) => {
        const last = [...PRESS].reverse().find((f) => frame >= f - 8);
        const down = last === undefined ? 0 : interpolate(frame, [last - 8, last, last + 10], [0, 1, 0], clamp);
        const px = g.x + g.W * 0.36 + pan * 0.5;
        const pb = g.ground - 14 * g.s;
        return (
          <g>
            {/* far: wall, window light, wall calendar */}
            <rect x={g.x - 60 * g.s} y={g.y - 10 * g.s} width={g.W + 120 * g.s} height={g.H + 20 * g.s} fill="#4a4030" />
            <Glow x={g.x + g.W * 0.12 + pan * 0.2} y={g.y + 90 * g.s} s={g.s} color="#ffe0a0" core="#fff6dc" />
            <rect x={g.x + g.W * 0.04 + pan * 0.2} y={g.y + 30 * g.s} width={150 * g.s} height={140 * g.s} fill="#fff1c9" opacity={0.35} stroke={PAL.ink} strokeWidth={3 * g.s} />
            <line x1={g.x + g.W * 0.04 + 75 * g.s + pan * 0.2} y1={g.y + 30 * g.s} x2={g.x + g.W * 0.04 + 75 * g.s + pan * 0.2} y2={g.y + 170 * g.s} stroke={PAL.ink} strokeWidth={4 * g.s} />
            <g transform={`translate(${g.x + g.W * 0.82 + pan * 0.2},${g.y + 40 * g.s})`}>
              <rect x={0} y={0} width={110 * g.s} height={120 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={0} y={0} width={110 * g.s} height={30 * g.s} fill="#a8322a" />
              <text x={55 * g.s} y={84 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34 * g.s} fill={PAL.ink}>2492</text>
            </g>
            {/* paper dust in the light */}
            <rect x={g.x} y={g.ground - 120 * g.s} width={g.W} height={60 * g.s} fill="#ffe8b0" opacity={0.12} />
            {/* mid: the press and its printer */}
            <g>
              <rect x={px - 70 * g.s} y={pb - 200 * g.s} width={20 * g.s} height={200 * g.s} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={px + 70 * g.s} y={pb - 200 * g.s} width={20 * g.s} height={200 * g.s} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={px - 80 * g.s} y={pb - 210 * g.s} width={180 * g.s} height={22 * g.s} fill="#3a3a3a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={px - 40 * g.s} y={pb - (170 - down * 60) * g.s} width={120 * g.s} height={26 * g.s} fill="#5a5a5a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <line x1={px + 20 * g.s} y1={pb - 188 * g.s} x2={px + 20 * g.s} y2={pb - (170 - down * 60) * g.s} stroke="#8a8a8a" strokeWidth={6 * g.s} />
              <rect x={px - 60 * g.s} y={pb - 84 * g.s} width={160 * g.s} height={20 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <g transform={`translate(${px + 140 * g.s},${pb - 120 * g.s}) rotate(${frame * 3 + down * 40})`}>
                <circle r={46 * g.s} fill="none" stroke="#2a2a2a" strokeWidth={8 * g.s} />
                {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-46 * g.s} x2={0} y2={46 * g.s} stroke="#2a2a2a" strokeWidth={5 * g.s} transform={`rotate(${a})`} />)}
              </g>
              <Fighter x={px - 120 * g.s} y={pb} scale={g.sc * 0.6} mode="stand" costume={C.villager} weapon="none" phase={1} />
            </g>
            {/* near: desk with the book */}
            <rect x={g.x + g.W * 0.58 + pan * 0.7} y={g.ground - 40 * g.s} width={g.W * 0.44} height={22 * g.s} fill="#6b4a2a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={g.x + g.W * 0.62 + pan * 0.7} y={g.ground - 18 * g.s} width={14 * g.s} height={60 * g.s} fill="#4a3020" />
            <g transform={`translate(${g.x + g.W * 0.72 + pan * 0.7},${g.ground - 40 * g.s}) skewX(-20)`}>
              <rect x={0} y={-22 * g.s} width={170 * g.s} height={22 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <rect x={6 * g.s} y={-118 * g.s} width={150 * g.s} height={96 * g.s} fill="#7a1f1a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <rect x={20 * g.s} y={-104 * g.s} width={122 * g.s} height={6 * g.s} fill={PAL.gilt} />
              <text x={81 * g.s} y={-56 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={22 * g.s} fill="#ffe7b8">ตำนาน</text>
              <text x={81 * g.s} y={-32 * g.s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={18 * g.s} fill="#ffe7b8">พิมพ์ราว 2492</text>
            </g>
            {/* foreground: hanging bulb + paper stack */}
            <g transform={`translate(${g.x + g.W * 0.55 + pan * 1.6},${g.y}) rotate(${Math.sin(frame * 0.05) * 3})`}>
              <line x1={0} y1={0} x2={0} y2={50 * g.s} stroke={PAL.ink} strokeWidth={2 * g.s} />
              <circle cx={0} cy={60 * g.s} r={12 * g.s} fill="#fff1c9" />
              <circle cx={0} cy={60 * g.s} r={50 * g.s} fill="#ffd38a" opacity={0.18} />
            </g>
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={g.x - 20 * g.s + pan * 1.6} y={g.y + g.H - (14 + i * 12) * g.s} width={150 * g.s} height={10 * g.s} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
          </g>
        );
      }}
    </V2>
  );
};

// Night at Wat Chaeng: torches, guards with spears ringed round a closed pavilion, nobles watching.
const GuardedScene = ({ id, start, end, guardF }: { id: string; start: number; end: number; guardF: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.watArun} start={start} end={end} sky={["#0c1226", "#2a2440"]} accent={RED} warm={0.05}>
      {(g, pan) => {
        const ring = interpolate(frame, [guardF, guardF + 16], [0, 1], clamp);
        const cx = g.x + g.W * 0.5 + pan * 0.6;
        const cy = g.ground - 20 * g.s;
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.85, 0.2]} lightColor={["#cfd8ff", "#f4f6ff"]} far="#1f2440" mid="#232838" ground="#1e1a14" mist="#6a6f90" ridges={false} />
            <Prang x={g.x + g.W * 0.2 + pan * 0.2} y={g.ground - 40 * g.s} h={230 * g.s} s={g.s} color="#a9a290" gold />
            <Prang x={g.x + g.W * 0.06 + pan * 0.2} y={g.ground - 40 * g.s} h={120 * g.s} s={g.s} color="#99927f" />
            <rect x={g.x} y={g.ground - 80 * g.s} width={g.W} height={40 * g.s} fill="#8a90b0" opacity={0.18} />
            {/* mid: closed pavilion and the ring */}
            <Hall x={cx - 70 * g.s} y={cy - 6 * g.s} w={140 * g.s} s={g.s} roof="#6a2a22" wall="#bdb39c" />
            <ellipse cx={cx} cy={cy} rx={230 * g.s} ry={34 * g.s} fill="none" stroke={RED} strokeWidth={4 * g.s} strokeDasharray={`${14 * g.s} ${10 * g.s}`} opacity={ring} transform={`rotate(0)`} />
            {[-1, 1].map((d) => (
              <g key={d}>
                <line x1={cx + d * 250 * g.s} y1={cy} x2={cx + d * 250 * g.s} y2={cy - 120 * g.s} stroke="#4a2f18" strokeWidth={4 * g.s} />
                <Fire x={cx + d * 250 * g.s} y={cy - 120 * g.s} h={34 * g.s} seed={d + 2} />
              </g>
            ))}
            {[-200, -120, 120, 200].map((dx, i) => <Fighter key={dx} x={cx + dx * g.s} y={cy + (i % 2 ? 14 : 4) * g.s} scale={g.sc * 0.58} flip={dx > 0} mode={frame >= guardF ? "aim" : "stand"} costume={C.guard} phase={i} />)}
            {/* near: nobles who knew the king's face */}
            {[0, 1].map((i) => <Noble key={i} x={g.x + g.W * (0.08 + i * 0.1) + pan * 0.8} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode="kneel" jacket={i ? "#c9b48a" : "#efe6d0"} phase={i} />)}
            <Noble x={g.x + g.W * 0.9 + pan * 0.8} y={g.ground + 8 * g.s} scale={g.sc * 0.62} mode="kneel" flip jacket="#efe6d0" phase={2} />
            <Grass g={g} shift={pan * 1.6} color="#10140c" />
          </g>
        );
      }}
    </V2>
  );
};

// Golden evening at a Taksin shrine: garlands, incense smoke, people bowing.
const ShrineScene = ({ id, start, end, bowF }: { id: string; start: number; end: number; bowF: number }) => {
  const frame = useCurrentFrame();
  return (
    <V2 id={id} anchor={PL.thon} start={start} end={end} sky={["#e0803a", "#ffd890"]} accent={GOLD} warm={0.14}>
      {(g, pan) => {
        const sx = g.x + g.W * 0.56 + pan * 0.7;
        const sy = g.ground - 18 * g.s;
        const bow = interpolate(frame, [bowF - 10, bowF + 10, bowF + 40, bowF + 60], [0.1, 1, 1, 0.3], clamp);
        return (
          <g>
            <Backdrop g={g} pan={pan} light={[0.12, 0.5]} lightColor={["#ffb050", "#fff0c0"]} far="#c08060" mid="#8a6a40" ground="#6a4a2a" mist="#ffe0a0" />
            <Hall x={g.x + g.W * 0.16 + pan * 0.5} y={g.ground - 30 * g.s} w={190 * g.s} s={g.s} roof="#a8322a" />
            {/* near: the shrine */}
            <rect x={sx - 120 * g.s} y={sy - 18 * g.s} width={240 * g.s} height={22 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={2 * g.s} />
            <rect x={sx - 104 * g.s} y={sy - 190 * g.s} width={14 * g.s} height={172 * g.s} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <rect x={sx + 90 * g.s} y={sy - 190 * g.s} width={14 * g.s} height={172 * g.s} fill="#a8322a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            <path d={`M${sx - 140 * g.s} ${sy - 186 * g.s} L${sx} ${sy - 250 * g.s} L${sx + 140 * g.s} ${sy - 186 * g.s} Z`} fill="#c9962a" stroke={PAL.ink} strokeWidth={2 * g.s} />
            {/* gilded seated statue with a sword across the lap */}
            <g transform={`translate(${sx},${sy - 18 * g.s})`}>
              <path d={`M${-44 * g.s} 0 Q${-40 * g.s} ${-36 * g.s} 0 ${-38 * g.s} Q${40 * g.s} ${-36 * g.s} ${44 * g.s} 0 Z`} fill="#d9a93a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <path d={`M${-20 * g.s} ${-36 * g.s} Q${-24 * g.s} ${-90 * g.s} ${-12 * g.s} ${-104 * g.s} L${12 * g.s} ${-104 * g.s} Q${24 * g.s} ${-90 * g.s} ${20 * g.s} ${-36 * g.s} Z`} fill="#e2b84a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <ellipse cx={0} cy={-116 * g.s} rx={12 * g.s} ry={14 * g.s} fill="#e2b84a" stroke={PAL.ink} strokeWidth={2 * g.s} />
              <path d={`M${-12 * g.s} ${-126 * g.s} L0 ${-150 * g.s} L${12 * g.s} ${-126 * g.s} Z`} fill="#d9a93a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
              <line x1={-50 * g.s} y1={-30 * g.s} x2={50 * g.s} y2={-46 * g.s} stroke="#8a6a2a" strokeWidth={5 * g.s} />
              <circle r={70 * g.s} cy={-90 * g.s} fill="#fff1c0" opacity={0.15} />
            </g>
            {/* garlands swaying from the eaves */}
            {[-80, -40, 40, 80].map((dx, i) => (
              <g key={dx} transform={`translate(${sx + dx * g.s},${sy - 186 * g.s}) rotate(${Math.sin(frame * 0.06 + i) * 4})`}>
                {[...Array(6)].map((_, j) => <circle key={j} cx={0} cy={(8 + j * 9) * g.s} r={5 * g.s} fill={j % 2 ? "#ff9a1a" : "#f4f0e0"} stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
                <circle cx={0} cy={66 * g.s} r={4 * g.s} fill="#c9302c" />
              </g>
            ))}
            {/* incense pot and smoke */}
            <path d={`M${sx - 150 * g.s} ${sy} l${10 * g.s} ${-26 * g.s} h${36 * g.s} l${10 * g.s} ${26 * g.s} Z`} fill="#8a5a2a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
            {[-6, 0, 6].map((d) => <line key={d} x1={sx - 122 * g.s + d * g.s} y1={sy - 26 * g.s} x2={sx - 122 * g.s + d * 2 * g.s} y2={sy - 60 * g.s} stroke="#7a2a1a" strokeWidth={2 * g.s} />)}
            <Smoke x={sx - 122 * g.s} y={sy - 62 * g.s} s={g.s * 0.5} n={6} />
            {/* people bowing */}
            <Noble x={sx - 230 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.62} mode="kneel" bow={bow} jacket="#efe6d0" />
            <Noble x={sx - 310 * g.s} y={g.ground + 6 * g.s} scale={g.sc * 0.62} mode="kneel" bow={bow * 0.8} jacket="#c9b48a" phase={1} />
            <Fighter x={sx + 190 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.58} flip mode="stand" costume={C.villager} weapon="none" phase={2} />
            <Grass g={g} shift={pan * 1.6} color="#4a3a18" />
          </g>
        );
      }}
    </V2>
  );
};

export const e4c7: Chapter4 = {
  name: "ตำนานนครศรีฯ",
  from: T.legend,
  to: T.end,
  cams: (w, h) => [
    { frame: T.legend, cam: view(VW.asia, w, h, 0.45, 0.1) },
    { frame: T.legend + 45, cam: view(VW.south, w, h, 0.55, 0.1) },
    { frame: T.verdict, cam: view(VW.south, w, h, 0.55, 0.1) },
    { frame: T.verdict + 50, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.why, cam: view(VW.thonWide, w, h, 0.95, 0.08) },
    { frame: T.why + 45, cam: view(VW.siam, w, h, 0.8, 0.1) },
  ],
  years: [[T.legend, "2325–2492"]],
  heads: [
    { f: T.legend, tag: "แล้วตำนานนครศรีฯ", head: "มาจากไหน?", color: GOLD },
    { f: T.story, tag: "ตามตำนาน", head: "ตัวแทนถูกประหาร", color: GOLD },
    { f: BOAT, tag: "ตามตำนาน", head: "ลงเรือหนีไปบวช", color: GOLD },
    { f: HILL, tag: "ตามตำนาน · เขาขุนพนม", head: "อยู่ต่อมาอีกหลายสิบปี", color: GOLD },
    { f: T.fp, tag: "ตำนานนี้เป็นหนังสือครั้งแรก", head: "ราว พ.ศ. 2492", color: GOLD },
    { f: T.y2492, tag: "พิมพ์ครั้งแรก ราว 2492", head: "กว่า 160 ปีหลังเหตุการณ์", color: RED },
    { f: T.luang, tag: "หลวงวิจิตรวาทการ", head: "เล่าตามคำบอกเล่าปากต่อปาก", color: GOLD },
    { f: T.unsure, tag: "ผู้เขียนเองบอกว่า", head: "\"ยืนยันไม่ได้\"", color: RED },
    { f: T.versions, tag: "หลายฉบับ", head: "ขัดกันเอง", color: RED },
    { f: T.verdict, tag: "นักประวัติศาสตร์ส่วนใหญ่", head: "ไม่ยอมรับตำนานนี้", color: RED },
    { f: T.zero, tag: "หลักฐานร่วมสมัยที่เล่าว่าหนี", head: "ไม่มีเลย", stat: "0 ฉบับ", color: RED },
    { f: T.king, tag: "กษัตริย์ที่ถูกถอด", head: "ถูกเฝ้าอย่างแน่นหนา", color: RED },
    { f: T.why, tag: "ตำนานยังอยู่", head: "เพราะคนรักท่าน", color: GOLD, portrait: "taksin_king" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const south = frame >= T.legend + 20 && frame < T.verdict + 30;
    return (
      <>
        {south && (
          <>
            <CityDot at={PL.nakhonsi} color={GOLD} r={14} start={T.legend + 30} end={T.verdict + 20} />
            {frame < T.story && <PointLabel at={PL.nakhonsi} text="นครศรีธรรมราช" start={Math.max(T.legend + 35, T.nakhon)} color={GOLD} size={0.85} />}
            {frame >= T.story && <PointLabel at={PL.khunphanom} text="เขาขุนพนม" start={T.story} color={GOLD} size={0.85} />}
            <Arrow points={R.escape} start={BOAT} end={BOAT + 70} color={GOLD} width={10} variant="dashed" opacity={interpolate(frame, [T.fp, T.fp + 20], [1, 0.35], clamp)} />
            {frame >= BOAT && <PointLabel at={PL.thon} text="ธนบุรี" start={BOAT} color={RED} size={0.75} />}
          </>
        )}
        <Ring at={PL.watArun} r={0.006} start={T.guard} end={T.why + 10} />
        {frame >= T.verdict + 40 && frame < T.why + 40 && <PointLabel at={PL.watArun} text="วัดแจ้ง" start={T.verdict + 50} color={RED} size={0.8} />}
        {frame >= T.why + 30 && <PointLabel at={PL.thon} text="ธนบุรี" start={T.why + 40} color={GOLD} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <>
      <KhunPhanomScene id="e4c7hill" start={T.legend} end={T.story + 14} />
      <LegendShadow id="e4c7shadow" start={T.story} end={T.fp + 14} />
      <PressScene id="e4c7press" start={T.luang} end={T.versions + 14} />
      <GuardedScene id="e4c7guard" start={T.verdict} end={T.why + 14} guardF={T.guard} />
      <ShrineScene id="e4c7shrine" start={T.why} end={T.end + 14} bowF={BOW} />
    </>
  ),
  Screen: () => (
    <>
      <Timeline
        start={T.fp}
        end={T.luang + 8}
        title="ตำนานปรากฏเมื่อไหร่"
        from={2300}
        to={2520}
        dotted
        marks={[
          { at: 2325, top: "2325", bottom: "เหตุการณ์", f: T.fp + 8, color: RED, big: true },
          { at: 2492, top: "2492", bottom: "พิมพ์ครั้งแรก", f: T.y2492, big: true },
        ]}
        blink={{ a: 2325, b: 2492, text: "กว่า 160 ปี", f: T.y2492 + 12 }}
      />
      <FlickerTable start={T.versions} end={T.verdict + 8} rows={["ใครเป็นตัวแทน?", "ทำไมต้องหนี?", "สิ้นพระชนม์ที่ไหน?"]} cols={["ฉบับหนึ่ง", "อีกฉบับ", "อีกฉบับ"]} values={["คำตอบ ก", "คำตอบ ข", "คำตอบ ค", "คำตอบ ง"]} rowF={ROWS} />
    </>
  ),
  sfx: [
    [T.legend + 39, SFX.whoosh, 0.35],
    [T.nakhon, SFX.pop, 0.3],
    [T.story, SFX.pop, 0.25],
    [BOAT + 10, SFX.whoosh, 0.25],
    [HILL, SFX.pop, 0.3],
    [T.fp, SFX.pop, 0.3],
    [T.y2492, SFX.hit, 0.35],
    ...[0, 24, 48, 72].map((d) => [T.y2492 + 12 + d, SFX.tick, 0.25] as [number, string, number]),
    [T.unsure, SFX.hit, 0.35],
    [T.versions, SFX.pop, 0.3],
    ...ROWS.map((f) => [f, SFX.tick, 0.35] as [number, string, number]),
    [T.verdict + 44, SFX.whoosh, 0.35],
    [T.zero, SFX.hit, 0.4],
    [T.why, SFX.swell, 0.25],
  ],
  Audio: () => (
    <>
      {/* dusk at Khao Khun Phanom */}
      <Bed id="wind" from={T.legend} to={T.story + 14} volume={0.16} voice={VOICE} />
      {/* nang yai: the lamp behind the screen and the drum, the oars pushing off */}
      <Bed id="fire_crackle" from={T.story} to={T.fp + 14} volume={0.14} voice={VOICE} />
      <Bed id="war_drums" from={T.story} to={T.fp + 14} volume={0.1} voice={VOICE} duck={0.3} />
      <Hit id="splash" at={BOAT + 12} volume={0.35} />
      {/* print shop: each stroke of the press */}
      {PRESS.map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.22} />)}
      {/* Wat Chaeng at night: torches, wind, the guards level their spears */}
      <Bed id="fire_crackle" from={T.verdict} to={T.why + 14} volume={0.14} voice={VOICE} />
      <Bed id="wind" from={T.verdict} to={T.why + 14} volume={0.12} voice={VOICE} />
      <Hit id="sword_draw" at={T.guard} volume={0.3} />
      {/* shrine at golden evening: soft gong as the people bow */}
      <Bed id="wind" from={T.why} to={T.end + 14} volume={0.12} voice={VOICE} />
      <Hit id="gong" at={BOW + 10} volume={0.3} />
    </>
  ),
};
