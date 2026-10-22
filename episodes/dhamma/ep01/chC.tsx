import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { SFX } from "../../../components/Sound";
import { clamp, font, RED, view, type Chapter } from "../../thaihistory/news/kit";
import { CINNABAR, LEAF, Moon } from "../kit/Mural";
import { IconStrip } from "../kit/Pictos";
import { B, card, wf } from "./beatsKit";
import { LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA, PL, VW } from "./places";

// Chapters 7–8 of episode 1: the night of the enlightenment (sujata → bodhgaya) and the answer (answer → poll).

// Golden dawn light spreading from the bodhi tree, strength k.
const Dawn = ({ k }: { k: number }) => {
  const { projection, s } = useMap();
  const frame = useCurrentFrame();
  const p = projection(PL.bodhgaya);
  if (!p || k <= 0) return null;
  return (
    <g opacity={k}>
      <defs>
        <radialGradient id="d1dawn">
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.9} />
          <stop offset="0.35" stopColor={LEAF} stopOpacity={0.45} />
          <stop offset="1" stopColor={LEAF} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={p[0]} cy={p[1]} r={(260 + 20 * Math.sin(frame * 0.1)) * s * k} fill="url(#d1dawn)" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + frame * 0.004;
        return <line key={i} x1={p[0]} y1={p[1]} x2={p[0] + Math.cos(a) * 420 * s * k} y2={p[1] + Math.sin(a) * 420 * s * k} stroke="#fff3c4" strokeOpacity={0.25} strokeWidth={6 * s} />;
      })}
    </g>
  );
};

// ── Chapter 7 · คืนตรัสรู้ ───────────────────────────────────────────────────────────────────────────
const C7 = {
  suj: B.sujata.start,
  rice: wf("sujata", "มธุปายาส", 0.6),
  tray: B.tray.start,
  up: wf("tray", "ทวน", 0.8, 1),
  grass: B.grass.start,
  seat: wf("grass", "โพธิ์", 0.75),
  vow: B.vow.start,
  mara: B.mara.start,
  witness: B.witness.start,
  touch: wf("witness", "แตะ", 0.6),
  pang: wf("witness", "ปางมารวิชัย", 0.9),
  thorani: B.thorani.start,
  flood: wf("thorani", "น้ำ", 0.45),
  watches: B.watches.start,
  second: wf("watches", "ยามสอง", 0.65),
  dawn: B.dawn.start,
  enl: wf("dawn", "ตรัสรู้", 0.7),
  bg: B.bodhgaya.start,
  end: B.answer.start,
};

export const d1c7: Chapter = {
  name: "คืนตรัสรู้",
  from: C7.suj,
  to: C7.end,
  cams: (w, h) => [
    { frame: C7.suj, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C7.grass, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C7.grass + 45, cam: view(VW.bodhi, w, h, 1, 0.1) },
    { frame: C7.dawn, cam: view(VW.bodhi, w, h, 1, 0.1) },
    { frame: C7.bg, cam: view(VW.bodhi, w, h, 1, 0.1) },
    { frame: C7.bg + 50, cam: view(VW.uruvela, w, h, 1, 0.1) },
  ],
  years: [[C7.suj, "45 ปีก่อน พ.ศ."]],
  heads: [
    card("sujata", LEAF),
    card("tray", LEAF),
    card("grass", LEAF),
    card("vow", LEAF),
    card("mara", CINNABAR),
    card("witness", LEAF),
    card("thorani", LEAF),
    card("watches", LEAF, { chips: [{ text: "ยามที่ 1 · ระลึกชาติ", f: C7.watches + 30 }, { text: "ยามที่ 2 · เห็นกรรม", f: C7.second }] }),
    card("dawn", LEAF, { stat: "35", label: "พรรษา · ตรัสรู้" }),
    card("bodhgaya", LEAF),
  ],
  night: (f) => interpolate(f, [C7.suj, C7.grass, C7.grass + 40, C7.mara, C7.mara + 20, C7.enl - 30, C7.enl + 30], [0, 0, 0.45, 0.6, 1, 1, 0], clamp),
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <PointLabel at={PL.uruvela} text="เสนานิคม" start={C7.suj + 10} color={LEAF} size={0.8} />
        {frame >= C7.tray && frame < C7.grass + 30 && <Arrow points={[[84.995, 24.705], [84.993, 24.695], [84.99, 24.684]]} start={C7.up - 10} end={C7.up + 30} color={LEAF} width={10} />}
        {frame >= C7.grass && <PointLabel at={PL.bodhgaya} text="ต้นโพธิ์" start={C7.seat} color={LEAF} size={1} />}
        <Dawn k={interpolate(frame, [C7.enl - 20, C7.enl + 20, C7.end - 10, C7.end + 20], [0, 1, 1, 0], clamp)} />
        {frame >= C7.bg && <PointLabel at={[84.99, 24.708]} text="พุทธคยา" start={C7.bg + 10} color="#ffffff" size={0.85} />}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d7"
      anchor={PL.bodhgaya}
      end={C7.end}
      shots={[
        { f: C7.suj, at: PL.uruvela, icons: [{ k: "tree", x: 0.25, size: 300 }, { k: "person", x: 0.62, size: 230, label: "สุชาดา", o: { head: "veil" } }, { k: "bowl", x: 0.8, y: 60, size: 80, d: 10 }, { k: "sun", x: 0.92, y: 230, size: 60 }] },
        { f: C7.rice, at: PL.uruvela, icons: [{ k: "bowl", x: 0.5, size: 200, label: "ข้าวมธุปายาส" }, { k: "lotus", x: 0.15, size: 100 }, { k: "lotus", x: 0.85, size: 100 }] },
        { f: C7.tray, icons: [{ k: "tray", x: 0.5, size: 260 }, { k: "sitter", x: 0.12, size: 180, o: { head: "shaved" } }] },
        { f: C7.up, icons: [{ k: "tray", x: 0.72, move: 0.3, size: 250 }, { k: "waves", x: 0.12, size: 120 }, { k: "waves", x: 0.88, size: 120 }] },
        { f: C7.grass, icons: [{ k: "grass", x: 0.38, size: 220, label: "หญ้าคา 8 กำ" }, { k: "person", x: 0.72, size: 240, label: "โสตถิยะ" }, { k: "sun", x: 0.92, y: 180, size: 60 }] },
        { f: C7.seat, icons: [{ k: "tree", x: 0.5, size: 340, o: { kind: "bodhi" } }, { k: "sitter", x: 0.5, size: 150, d: 8, o: { head: "shaved" } }] },
        { f: C7.vow, night: true, icons: [{ k: "tree", x: 0.5, size: 340, o: { kind: "bodhi" } }, { k: "sitter", x: 0.5, size: 160, o: { head: "shaved" } }, { k: "moon", x: 0.88, y: 220, size: 60 }] },
        { f: C7.mara, night: true, icons: [{ k: "sitter", x: 0.2, size: 180, o: { head: "shaved" } }, { k: "elephant", x: 0.72, size: 270, d: 6 }, { k: "demon", x: 0.72, y: 210, size: 130, d: 12 }] },
        { f: C7.witness, night: true, icons: [{ k: "buddha", x: 0.45, size: 270, o: { touch: true } }, { k: "demon", x: 0.84, size: 190 }] },
        { f: C7.touch, night: true, icons: [{ k: "buddha", x: 0.5, size: 320, o: { touch: true } }] },
        { f: C7.pang, title: "ปางมารวิชัย", icons: [{ k: "buddha", x: 0.11, size: 190, o: { touch: true } }, { k: "lotus", x: 0.9, size: 110 }] },
        { f: C7.thorani, night: true, icons: [{ k: "waves", x: 0.15, size: 190 }, { k: "person", x: 0.5, size: 240, label: "แม่พระธรณี", o: { head: "crown" } }, { k: "waves", x: 0.85, size: 190 }] },
        { f: C7.flood, night: true, icons: [{ k: "waves", x: 0.2, size: 230 }, { k: "demon", x: 0.5, move: 0.95, size: 160 }, { k: "elephant", x: 0.66, move: 1.1, size: 150, flip: true }, { k: "waves", x: 0.8, size: 230 }] },
        { f: C7.watches, night: true, icons: [{ k: "buddha", x: 0.5, size: 270 }, { k: "moon", x: 0.86, y: 220, size: 60 }, { k: "lotus", x: 0.14, size: 100 }] },
        { f: C7.dawn, icons: [{ k: "buddha", x: 0.5, size: 280, o: { glow: 0.5 } }, { k: "sun", x: 0.88, y: 200, size: 90, d: 20 }] },
        { f: C7.enl, title: "ตรัสรู้", icons: [{ k: "buddha", x: 0.16, size: 200, o: { glow: 1 } }, { k: "wheel", x: 0.86, y: 30, size: 150 }] },
        { f: C7.bg, icons: [{ k: "tree", x: 0.3, size: 310, o: { kind: "bodhi" } }, { k: "buddha", x: 0.7, size: 220, o: { glow: 0.6 } }] },
      ]}
    />
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    return <Moon k={interpolate(frame, [C7.suj, C7.suj + 15, C7.tray, C7.tray + 10], [0, 1, 1, 0], clamp)} />;
  },
  sfx: [
    [C7.suj, SFX.swell, 0.25],
    [C7.up, SFX.pop, 0.3],
    [C7.grass + 40, SFX.whoosh, 0.3],
    [C7.mara, SFX.hit, 0.5],
    [C7.touch, SFX.hit, 0.45],
    [C7.flood, SFX.whoosh, 0.4],
    [C7.enl - 40, SFX.riser, 0.3],
    [C7.enl, SFX.swell, 0.45],
    [C7.bg + 40, SFX.whoosh, 0.3],
  ],
};

// ── Chapter 8 · คำตอบ ───────────────────────────────────────────────────────────────────────────────
const C8 = {
  ans: B.answer.start,
  why: wf("answer", "คำตอบ", 0.4),
  route: B.route.start,
  visakha: B.visakha.start,
  born: wf("visakha", "ประสูติ", 0.3),
  enl: wf("visakha", "ตรัสรู้", 0.4),
  pari: wf("visakha", "ปรินิพพาน", 0.7),
  lesson: B.lesson.start,
  next: B.next.start,
  first: wf("next", "ห้า", 0.5),
  poll: B.poll.start,
  type: wf("poll", "พิมพ์", 0.7),
  end: B.poll.end + 45,
};

const Poll = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < C8.poll + 10) return null;
  const k = spring({ frame: frame - C8.poll - 10, fps, config: { damping: 14 } });
  const btn = spring({ frame: frame - C8.type, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k), fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.92)", border: `${3 * s}px solid ${LEAF}`, borderRadius: 18 * s, padding: `${20 * s}px ${28 * s}px`, lineHeight: 1.35 }}>
        <div style={{ fontSize: 28 * s, fontWeight: 700, color: LEAF }}>ก่อนไป</div>
        <div style={{ fontSize: 50 * s, fontWeight: 900, margin: `${4 * s}px 0 ${10 * s}px` }}>ฉากไหนที่เคยเห็นบนผนังโบสถ์?</div>
        <div style={{ fontSize: 32 * s, opacity: 0.85 }}>พิมพ์ชื่อวัดใกล้บ้านในคอมเมนต์</div>
      </div>
      {frame >= C8.type && (
        <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.42, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${btn})`, background: RED, color: "#fff", borderRadius: 50 * s, padding: `${12 * s}px ${60 * s}px`, fontFamily: font, fontWeight: 900, fontSize: 48 * s }}>ติดตาม</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const d1c8: Chapter = {
  name: "คำตอบ",
  from: C8.ans,
  to: C8.end,
  cams: (w, h) => [
    { frame: C8.ans, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C8.route - 10, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C8.route + 40, cam: view(VW.route, w, h, 0.95, 0.1) },
    { frame: C8.next, cam: view(VW.route, w, h, 0.95, 0.1) },
    { frame: C8.next + 40, cam: view(VW.sarnath, w, h, 1, 0.1) },
    { frame: C8.poll, cam: view(VW.sarnath, w, h, 1, 0.1) },
    { frame: C8.poll + 40, cam: view(VW.route, w, h, 0.95, 0.1) },
  ],
  years: [[C8.ans, "ราว 2,600 ปีก่อน"]],
  heads: [
    { f: C8.ans, tag: "คำถามของวันนี้", head: "ทิ้งบัลลังก์ เพื่ออะไร?", color: LEAF },
    { ...card("answer", LEAF), f: C8.why },
    card("route", LEAF, { stat: "6", label: "ปี" }),
    card("visakha", LEAF, { chips: [{ text: "ประสูติ", f: C8.born }, { text: "ตรัสรู้", f: C8.enl }, { text: "ปรินิพพาน", f: C8.pari }] }),
    card("lesson", LEAF),
    card("next", CINNABAR),
    { f: C8.poll + 10, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const r = C8.route + 30;
    const legs = frame >= C8.route;
    return (
      <>
        {legs && [LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA].map((pts, i) => <Arrow key={i} points={pts} start={r + i * 40} end={r + 40 + i * 40} color={LEAF} width={14} />)}
        {legs && (
          <>
            <PointLabel at={PL.lumbini} text="ลุมพินี" start={r} color={LEAF} size={0.7} />
            <PointLabel at={PL.anoma} text="อโนมา" start={r + 40} color={LEAF} size={0.7} />
            <PointLabel at={PL.rajgir} text="ราชคฤห์" start={r + 80} color={LEAF} size={0.7} />
          </>
        )}
        <PointLabel at={PL.bodhgaya} text="ต้นโพธิ์" start={C8.ans} color={LEAF} size={0.85} />
        {frame >= C8.first && (
          <>
            <Arrow points={[PL.bodhgaya, [84.0, 25.1], PL.sarnath]} start={C8.first} end={C8.first + 40} color={LEAF} width={14} variant="dashed" />
            <PointLabel at={PL.sarnath} text="สารนาถ · ตอนหน้า" start={C8.first + 35} color={LEAF} size={0.85} />
          </>
        )}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d8"
      anchor={PL.bodhgaya}
      end={C8.end}
      shots={[
        { f: C8.ans, icons: [{ k: "crown", x: 0.2, size: 200 }, { k: "question", x: 0.55, size: 260 }, { k: "palace", x: 0.85, size: 170 }] },
        { f: C8.why, icons: [{ k: "oldman", x: 0.18, size: 200, label: "แก่" }, { k: "lying", x: 0.5, size: 270, label: "เจ็บ" }, { k: "bier", x: 0.82, size: 200, label: "ตาย" }] },
        { f: C8.route, at: PL.lumbini, icons: Array.from({ length: 6 }, (_, i) => ({ k: "footprint" as const, x: 0.1 + i * 0.16, size: 90, d: i * 8 })) },
        { f: C8.route + 70, at: PL.anoma, icons: [{ k: "horse", x: 0.2, move: 0.75, size: 240 }] },
        { f: C8.route + 110, at: PL.rajgir, icons: [{ k: "person", x: 0.4, size: 240, o: { head: "shaved" } }, { k: "bowl", x: 0.6, y: 70, size: 80 }] },
        { f: C8.route + 150, icons: [{ k: "tree", x: 0.3, size: 300, o: { kind: "bodhi" } }, { k: "buddha", x: 0.68, size: 240, o: { glow: 1 } }] },
        { f: C8.visakha, icons: [{ k: "moon", x: 0.5, y: 210, size: 70 }, { k: "lotus", x: 0.18, size: 140, label: "ประสูติ", d: C8.born - C8.visakha }, { k: "buddha", x: 0.5, size: 190, label: "ตรัสรู้", d: C8.enl - C8.visakha }, { k: "lying", x: 0.82, size: 230, label: "ปรินิพพาน", d: C8.pari - C8.visakha }] },
        { f: C8.lesson, at: PL.uruvela, icons: [{ k: "lute", x: 0.5, size: 300 }, { k: "lotus", x: 0.15, size: 100 }, { k: "lotus", x: 0.85, size: 100 }] },
        { f: C8.next, at: PL.sarnath, icons: [{ k: "wheel", x: 0.72, y: 20, size: 220 }, ...[0.08, 0.18, 0.28, 0.38, 0.48].map((x, i) => ({ k: "person" as const, x, size: 130, d: C8.first - C8.next + i * 4, o: { head: "topknot" } }))] },
        { f: C8.poll, icons: [{ k: "lotus", x: 0.18, size: 140 }, { k: "buddha", x: 0.5, size: 230 }, { k: "lotus", x: 0.82, size: 140 }] },
      ]}
    />
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Moon k={interpolate(frame, [C8.visakha, C8.visakha + 15, C8.lesson, C8.lesson + 10], [0, 1, 1, 0], clamp)} />
        <Poll />
      </>
    );
  },
  sfx: [
    [C8.ans, SFX.riser, 0.25],
    [C8.why, SFX.hit, 0.45],
    [C8.route + 30, SFX.whoosh, 0.35],
    [C8.born, SFX.pop, 0.35],
    [C8.enl, SFX.pop, 0.35],
    [C8.pari, SFX.pop, 0.35],
    [C8.lesson, SFX.swell, 0.25],
    [C8.first, SFX.whoosh, 0.3],
    [C8.poll + 10, SFX.pop, 0.35],
  ],
};
