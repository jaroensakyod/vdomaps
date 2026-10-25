import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Barge, Book, Candle, clamp, Cloud, display, Figure, font, GROUND, Hall, KanokFire, Kanok, L, LacquerPage, Moon, PanelFrame, Parasol, Prang, Scene, Scroll, Stars, useLq, Wall, Water } from "./kit/Lacquer";

// N10 palace and capital as Thai gilt lacquer (ลายรดน้ำ): seven scenes of an old riverside capital, each washed in
// as gold leaf on black lacquer inside a cabinet-door panel with kanok friezes — moonlit prang, throne hall, monks at
// dawn, the royal barge, a scribe's samut khoi, a night attack on the palace gate (fire as kanok flames), and the
// new capital at sunrise. One every ~2.7 s; each new scene washes down over the last. 19 s.
export const demo: StyleDemo = { id: "N10", name: "ฉากวังและพระนคร", frames: 570, cover: 296, sizes: ["9x16", "16x9"] };

const LEN = 80;
const at = (i: number) => i * LEN;
const end = (i: number) => Math.min(demo.frames, (i + 1) * LEN + 26);
const CAPTIONS = [
  "วัดริมแม่น้ำ ยามค่ำคืน",
  "ท้องพระโรง ขุนนางหมอบเฝ้า",
  "รุ่งเช้า พระออกบิณฑบาต",
  "ขบวนเรือหลวงเลียบพระนคร",
  "อาลักษณ์จดลงสมุดข่อย",
  "คืนจลาจล ประตูวังถูกตี",
  "รุ่งอรุณ ราชธานีใหม่ริมน้ำ",
];
const STORM = [at(5) + 18, at(5) + 38, at(5) + 58];
const CHIME = [at(6) + 10, at(6) + 34];

const Scenes = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {/* 0 moonlit prang across the river, a small boat slips by */}
      <Scene id="moon" start={at(0)} end={end(0)}>
        {(lt, W) => (
          <g>
            <Stars W={W} n={22} seed={3} top={40} bottom={420} />
            <Moon x={W * 0.74} y={210} r={70} />
            <Cloud x={W * 0.22} y={250} w={240} />
            <Cloud x={W * 0.9} y={380} w={170} flip />
            <Prang x={W * 0.5} y={GROUND - 120} h={440} />
            <Prang x={W * 0.27} y={GROUND - 120} h={250} />
            <Prang x={W * 0.73} y={GROUND - 120} h={250} />
            <Wall x={W * 0.08} y={GROUND - 110} w={W * 0.84} h={40} />
            <Water W={W} y={GROUND - 40} rows={4} frame={frame} />
            <Barge x={W * 0.2 + lt * 1.2} y={GROUND + 30} w={220} frame={frame} rowers={3} pavilion={false} />
          </g>
        )}
      </Scene>
      {/* 1 throne hall: the king under a tiered parasol, nobles prostrate */}
      <Scene id="throne" start={at(1)} end={end(1)}>
        {(lt, W) => (
          <g>
            {[0.1, 0.3, 0.7, 0.9].map((f) => <rect key={f} x={W * f - 16} y={60} width={32} height={GROUND - 60} fill="url(#sgold)" />)}
            {[0.1, 0.3, 0.7, 0.9].map((f) => <Kanok key={`k${f}`} x={W * f} y={120} size={60} rot={180} />)}
            <path d={`M${W * 0.5 - 170} ${GROUND - 140} L${W * 0.5 + 170} ${GROUND - 140} L${W * 0.5 + 200} ${GROUND} L${W * 0.5 - 200} ${GROUND} Z`} fill="url(#sgold)" />
            {Array.from({ length: 5 }, (_, i) => <line key={i} x1={W * 0.5 - 180 + i * 6} x2={W * 0.5 + 180 - i * 6} y1={GROUND - 120 + i * 26} y2={GROUND - 120 + i * 26} stroke={L.line} strokeWidth={2.4} />)}
            <Scroll x={W * 0.5 - 120} y={GROUND - 60} r={36} />
            <Scroll x={W * 0.5 + 120} y={GROUND - 60} r={36} flip />
            <Parasol x={W * 0.5 - 150} y={GROUND - 140} h={360} />
            <Parasol x={W * 0.5 + 150} y={GROUND - 140} h={360} />
            <Figure x={W * 0.5} y={GROUND - 140} s={1.9} pose="seated" crown />
            {[0, 1, 2].map((i) => <Figure key={i} x={W * (0.1 + i * 0.12)} y={GROUND + 150} s={0.95} pose="kneel" phase={i} />)}
            {[0, 1, 2].map((i) => <Figure key={`r${i}`} x={W * (0.9 - i * 0.12)} y={GROUND + 150} s={0.95} pose="kneel" flip />)}
            <rect x={0} y={GROUND} width={W} height={4} fill="url(#sgold)" />
            <rect x={0} y={GROUND + 6 + lt * 0} width={W} height={2} fill="url(#sgold)" opacity={0.6} />
          </g>
        )}
      </Scene>
      {/* 2 dawn: monks walk past the ordination hall, villagers kneel with offerings */}
      <Scene id="alms" start={at(2)} end={end(2)}>
        {(lt, W) => (
          <g>
            <circle cx={W * 0.78} cy={300} r={90} fill="url(#sgold)" />
            {Array.from({ length: 18 }, (_, i) => {
              const a = (i / 18) * Math.PI * 2 + lt * 0.004;
              return <Kanok key={i} x={W * 0.78 + Math.cos(a) * 130} y={300 + Math.sin(a) * 130} size={34} rot={(a * 180) / Math.PI + 90} line={false} />;
            })}
            <Cloud x={W * 0.25} y={200} w={220} />
            <Hall x={W * 0.36} y={GROUND - 120} w={460} />
            <Prang x={W * 0.08} y={GROUND - 120} h={300} />
            <rect x={0} y={GROUND - 120} width={W} height={4} fill="url(#sgold)" />
            {[0, 1, 2, 3].map((i) => <Figure key={i} x={W * 0.1 + i * 120 + lt * 1.1} y={GROUND + 60} s={1.05} pose="walk" monk phase={i * 1.3} frame={frame} />)}
            {[0, 1].map((i) => <Figure key={`v${i}`} x={W * (0.78 + i * 0.13)} y={GROUND + 60} s={1} pose="kneel" flip />)}
            <rect x={0} y={GROUND + 64} width={W} height={4} fill="url(#sgold)" />
            {Array.from({ length: Math.ceil(W / 70) }, (_, i) => <Kanok key={`g${i}`} x={i * 70 + 20} y={SHB} size={46} rot={-10 + (i % 3) * 10} line={false} />)}
          </g>
        )}
      </Scene>
      {/* 3 royal barge with a pavilion, rowing boat ahead, palace roofs on the far bank */}
      <Scene id="barge" start={at(3)} end={end(3)}>
        {(lt, W) => (
          <g>
            <Cloud x={W * 0.2} y={150} w={200} />
            <Cloud x={W * 0.8} y={120} w={240} flip />
            <Wall x={0} y={GROUND - 330} w={W} h={34} />
            <Hall x={W * 0.18} y={GROUND - 360} w={280} />
            <Prang x={W * 0.5} y={GROUND - 360} h={260} />
            <Hall x={W * 0.82} y={GROUND - 360} w={280} />
            <Water W={W} y={GROUND - 280} rows={2} frame={frame} size={18} gap={70} />
            <Barge x={W * 0.45 + lt * 0.9} y={GROUND - 40} w={560} frame={frame} rowers={10} />
            <Water W={W} y={GROUND + 30} rows={4} frame={frame} />
          </g>
        )}
      </Scene>
      {/* 4 a scribe's low table: samut khoi under one candle, shelves of folded books */}
      <Scene id="scribe" start={at(4)} end={end(4)}>
        {(lt, W) => (
          <g>
            {[230, 400].map((y) => (
              <g key={y}>
                <rect x={W * 0.06} y={y} width={W * 0.88} height={10} fill="url(#sgold)" />
                {Array.from({ length: 8 }, (_, i) => Array.from({ length: 2 + ((i + y) % 3) }, (_, j) => <rect key={`${i}-${j}`} x={W * 0.08 + i * ((W * 0.84) / 8)} y={y - (j + 1) * 18} width={(W * 0.84) / 8 - 14} height={14} fill={(i + j) % 2 ? "url(#sgold)" : L.black} stroke="url(#sgold)" strokeWidth={2} />))}
              </g>
            ))}
            <Figure x={W * 0.3} y={GROUND - 40} s={1.6} pose="write" />
            <Book x={W * 0.62} y={GROUND - 70} w={320} k={interpolate(lt, [8, 70], [0, 1], clamp)} />
            <Candle x={W * 0.86} y={GROUND - 70} s={1.4} frame={frame} />
            <rect x={W * 0.38} y={GROUND - 10} width={W * 0.56} height={14} fill="url(#sgold)" />
            <Scroll x={W * 0.1} y={GROUND + 100} r={50} />
            <Scroll x={W * 0.9} y={GROUND + 100} r={50} flip />
          </g>
        )}
      </Scene>
      {/* 5 night attack: rebels rush the palace gate, guards on the wall, kanok fire (shake on each blow) */}
      <Scene id="storm" start={at(5)} end={end(5)} hits={STORM}>
        {(lt, W) => {
          const rush = interpolate(lt, [0, LEN], [0, 90], clamp);
          return (
            <g>
              <Stars W={W} n={14} seed={9} top={40} bottom={260} />
              <KanokFire x={W * 0.12} y={GROUND - 150} h={170} frame={frame} seed={1} />
              <KanokFire x={W * 0.9} y={GROUND - 260} h={120} frame={frame} seed={4} />
              <Wall x={W * 0.42} y={GROUND} w={W * 0.6} h={260} gateAt={0.3} gateOpen={interpolate(frame, [STORM[2], STORM[2] + 10], [0, 0.6], clamp)} />
              <Figure x={W * 0.7} y={GROUND - 260} s={0.9} pose="attack" flip />
              <Figure x={W * 0.86} y={GROUND - 260} s={0.9} pose="stand" spear flip />
              {[0, 1, 2, 3, 4].map((i) => <Figure key={i} x={W * 0.04 + i * 80 + rush} y={GROUND + 60 + (i % 2) * 30} s={1.1} pose={i % 2 ? "run" : "attack"} phase={i * 1.1} frame={frame} />)}
              {STORM.map((h) => (frame >= h && frame < h + 6 ? <g key={h}>{Array.from({ length: 10 }, (_, i) => <Kanok key={i} x={W * 0.55} y={GROUND - 120} size={70} rot={i * 36} line={false} fill={L.pale} />)}</g> : null))}
              <rect x={0} y={GROUND + 70} width={W} height={4} fill="url(#sgold)" />
            </g>
          );
        }}
      </Scene>
      {/* 6 the new capital at sunrise: halls and prang reflected over the river */}
      <Scene id="dawn" start={at(6)} end={demo.frames}>
        {(lt, W) => (
          <g>
            <circle cx={W * 0.5} cy={GROUND - 210} r={150} fill="none" stroke="url(#sgold)" strokeWidth={14} />
            <circle cx={W * 0.5} cy={GROUND - 210} r={124} fill="none" stroke="url(#sgold)" strokeWidth={3} />
            {Array.from({ length: 24 }, (_, i) => {
              const a = Math.PI + (i / 23) * Math.PI;
              const r = 190 + (i % 2) * 40 + Math.sin(lt * 0.08 + i) * 6;
              return <Kanok key={i} x={W * 0.5 + Math.cos(a) * r} y={GROUND - 210 + Math.sin(a) * r} size={i % 2 ? 40 : 56} rot={(a * 180) / Math.PI + 90} line={false} />;
            })}
            <Hall x={W * 0.2} y={GROUND - 60} w={330} />
            <Prang x={W * 0.5} y={GROUND - 60} h={380} />
            <Hall x={W * 0.8} y={GROUND - 60} w={330} />
            <rect x={0} y={GROUND - 64} width={W} height={6} fill="url(#sgold)" />
            <Water W={W} y={GROUND} rows={5} frame={frame} />
            {CHIME.map((c) => (frame >= c && frame < c + 16 ? <circle key={c} cx={W * 0.5} cy={GROUND - 210} r={140 + (frame - c) * 8} fill="none" stroke={L.pale} strokeWidth={3} opacity={1 - (frame - c) / 16} /> : null))}
          </g>
        )}
      </Scene>
    </>
  );
};
const SHB = GROUND + 180;

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Bed id="wind" from={0} to={at(1) + 14} volume={0.12} fade={20} />
    <Hit id="gong" at={at(1) + 6} volume={0.35} />
    <Bed id="city_crowd" from={at(2)} to={at(4) + 14} volume={0.1} fade={20} />
    <Hit id="war_drums" at={at(3) + 4} volume={0.25} />
    <Bed id="fire_crackle" from={at(5) - 4} to={at(6) + 14} volume={0.2} fade={14} />
    <Bed id="crowd_angry" from={at(5)} to={at(6) + 6} volume={0.14} fade={14} />
    {STORM.map((h) => <Hit key={h} id="wood_hit" at={h} volume={0.4} />)}
    {CHIME.map((h) => <Hit key={h} id="gong" at={h} volume={0.25} />)}
  </>
);


export const Demo = () => {
  const frame = useCurrentFrame();
  const { s, wide, panel, width } = useLq();
  const i = Math.min(CAPTIONS.length - 1, Math.floor((frame + 6) / LEN));
  const cap = interpolate(frame - at(i), [6, 22], [0, 1], clamp);
  const title = interpolate(frame, [4, 30], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Audio />
      <LacquerPage>
        <Scenes />
        <PanelFrame />
        {/* title block: kicker, decorative title, year in a gold-ruled cartouche */}
        <div style={{ position: "absolute", top: wide ? 110 * s : 118 * s, left: wide ? 70 * s : 0, width: wide ? 300 * s : width, textAlign: "center", fontFamily: font, opacity: title, clipPath: `inset(0 0 ${(1 - title) * 100}% 0)` }}>
          <div style={{ fontSize: 32 * s, fontWeight: 700, color: L.red }}>N10 · ฉากวังและพระนคร</div>
          <div style={{ fontFamily: display, fontSize: (wide ? 64 : 104) * s, fontWeight: 700, lineHeight: 1.25, marginTop: 4 * s, color: L.ink, textShadow: `0 ${2 * s}px 0 rgba(255,240,190,0.5)` }}>{wide ? <>ราชธานี<br />ริมแม่น้ำ</> : "ราชธานีริมแม่น้ำ"}</div>
          <div style={{ display: "inline-block", marginTop: 8 * s, border: `${2 * s}px solid ${L.ink}`, outline: `${1 * s}px solid ${L.ink}`, outlineOffset: 4 * s, padding: `${0}px ${18 * s}px`, fontSize: (wide ? 28 : 34) * s, fontWeight: 700, color: L.ink, whiteSpace: "nowrap" }}>พ.ศ. 2310–2325</div>
        </div>
        {/* caption under the panel, between two kanok sprigs */}
        <div style={{ position: "absolute", top: wide ? panel.y + panel.h + 56 * s : panel.y + panel.h + 64 * s, left: panel.x, width: panel.w, textAlign: "center", fontFamily: font, fontSize: (wide ? 44 : 54) * s, fontWeight: 700, color: L.ink, opacity: cap, clipPath: `inset(0 ${(1 - cap) * 50}% 0 ${(1 - cap) * 50}%)` }}>
          <span style={{ color: L.red }}>❦ </span>{CAPTIONS[i]}<span style={{ color: L.red }}> ❦</span>
        </div>
        <div style={{ position: "absolute", right: width - panel.x - panel.w + 14 * s, top: panel.y + 12 * s, fontFamily: font, fontSize: 24 * s, color: L.text, background: "rgba(12,8,6,0.75)", padding: `${0}px ${12 * s}px`, border: `${1 * s}px solid ${L.gold}` }}>ภาพประกอบ</div>
        {(
          <svg style={{ position: "absolute", left: wide ? 40 * s : panel.x, top: wide ? 560 * s : panel.y + panel.h + 150 * s }} width={wide ? 360 * s : panel.w} height={wide ? 120 * s : 150 * s} viewBox={wide ? "180 0 640 160" : "0 0 1000 160"}>
            <rect x={210} y={6} width={580} height={148} rx={74} fill={L.black} stroke={L.red} strokeWidth={6} />
            <Scroll x={330} y={80} r={56} flip />
            <Scroll x={670} y={80} r={56} />
            <Kanok x={500} y={120} size={90} />
            <Kanok x={440} y={124} size={50} rot={-40} flip />
            <Kanok x={560} y={124} size={50} rot={40} />
            <line x1={60} x2={204} y1={80} y2={80} stroke={L.ink} strokeWidth={3} />
            <line x1={796} x2={940} y1={80} y2={80} stroke={L.ink} strokeWidth={3} />
          </svg>
        )}
      </LacquerPage>
    </AbsoluteFill>
  );
};
