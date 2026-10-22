import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, view, type Chapter } from "../../thaihistory/news/kit";
import { Borders, CINNABAR, LEAF, Moon } from "../kit/Mural";
import { IconStrip } from "../kit/Pictos";
import { B, card, wf } from "./beatsKit";
import { PL, VW } from "./places";

// Chapters 1–3 of episode 1: Lumbini (where → maya7), the prophecy (asita → marry), the four sights (outside → rahula).

// ── Chapter 1 · ลุมพินี ─────────────────────────────────────────────────────────────────────────────────
const C1 = {
  where: B.where.start,
  border: wf("where", "เนปาล", 0.6),
  sakya: B.sakya.start,
  king: wf("sakya", "สุทโธทนะ", 0.75),
  maya: B.maya.start,
  home: wf("maya", "เทวทหะ", 0.75),
  garden: B.garden.start,
  born: wf("garden", "ประสูติ", 0.8),
  day: B.day.start,
  steps: B.steps.start,
  lotus: B.lotus.start,
  ashoka: B.ashoka.start,
  here: wf("ashoka", "ที่นี่", 0.8, 1),
  pillar: B.pillar.start,
  heritage: wf("pillar", "มรดก", 0.85),
  maya7: B.maya7.start,
  gotami: wf("maya7", "มหาปชาบดีโคตมี", 0.7),
  end: B.asita.start,
};

export const d1c1: Chapter = {
  name: "ลุมพินี",
  from: C1.where,
  to: C1.end,
  cams: (w, h) => [
    { frame: C1.where, cam: view(VW.asia, w, h, 0.9, 0.1) },
    { frame: C1.where + 50, cam: view(VW.foothills, w, h, 1, 0.1) },
    { frame: C1.sakya, cam: view(VW.sakya, w, h, 1, 0.1) },
    { frame: C1.garden, cam: view(VW.sakya, w, h, 1, 0.1) },
    { frame: C1.garden + 40, cam: view(VW.lumbini, w, h, 1, 0.1) },
    { frame: C1.maya7, cam: view(VW.lumbini, w, h, 1, 0.1) },
    { frame: C1.maya7 + 40, cam: view(VW.sakya, w, h, 1, 0.1) },
  ],
  years: [[C1.where, "ราว 2,600 ปีก่อน"], [C1.day, "80 ปีก่อน พ.ศ."]],
  heads: [
    card("where", LEAF),
    card("sakya", LEAF),
    card("maya", LEAF),
    card("garden", LEAF),
    card("day", LEAF, { stat: "80", label: "ปีก่อน พ.ศ." }),
    card("steps", LEAF),
    card("lotus", LEAF),
    card("ashoka", LEAF),
    card("pillar", LEAF, { stat: (f) => String(Math.round(interpolate(f, [C1.pillar + 10, C1.pillar + 50], [1800, 1896], clamp))), label: "ค.ศ." }),
    card("maya7", CINNABAR, { stat: "7", label: "วัน" }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const bk = interpolate(frame, [C1.border, C1.border + 15, C1.garden, C1.garden + 15], [0, 1, 1, 0], clamp);
    return (
      <>
        <Borders k={bk} />
        {frame >= C1.border && frame < C1.sakya + 20 && (
          <>
            <PointLabel at={[84.1, 28.35]} text="เนปาล" start={C1.border} color="#ffffff" size={0.8} />
            <PointLabel at={[83.4, 26.6]} text="อินเดีย" start={C1.border + 8} color="#ffffff" size={0.8} />
          </>
        )}
        {frame >= C1.sakya && <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={C1.sakya + 6} color={LEAF} size={0.85} />}
        {frame >= C1.home && frame < C1.ashoka && <PointLabel at={PL.devadaha} text="เทวทหะ" start={C1.home} color={LEAF} size={0.75} />}
        {frame >= C1.home && frame < C1.ashoka && <Arrow points={[PL.kapila, [83.18, 27.47], PL.lumbini]} start={C1.home + 6} end={C1.garden + 30} color={LEAF} width={12} variant="dashed" />}
        {frame >= C1.garden && <PointLabel at={PL.lumbini} text="ลุมพินี" start={C1.born - 6} color={LEAF} size={1} />}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d1"
      anchor={PL.lumbini}
      end={C1.end}
      shots={[
        { f: C1.where, at: PL.kapila, icons: [{ k: "mountains", x: 0.3, size: 230 }, { k: "mountains", x: 0.7, size: 260, flip: true }, { k: "sun", x: 0.9, y: 220, size: 70 }] },
        { f: C1.sakya, at: PL.kapila, icons: [{ k: "palace", x: 0.2, size: 180 }, { k: "crown", x: 0.5, size: 260 }, { k: "palace", x: 0.8, size: 180 }] },
        { f: C1.king, at: PL.kapila, icons: [{ k: "palace", x: 0.18, size: 170 }, { k: "figure", x: 0.5, size: 260, o: { crown: true } }, { k: "palace", x: 0.82, size: 170 }] },
        { f: C1.maya, icons: [{ k: "person", x: 0.3, size: 240, o: { head: "crown" } }, { k: "baby", x: 0.48, y: 60, size: 70, d: 10 }, { k: "palace", x: 0.78, size: 190 }] },
        { f: C1.home, icons: [{ k: "person", x: 0.15, move: 0.55, size: 230, o: { head: "crown" } }, { k: "tree", x: 0.85, size: 260, o: { kind: "sal" } }] },
        { f: C1.garden, icons: [{ k: "tree", x: 0.5, size: 300, o: { kind: "sal" } }, { k: "person", x: 0.3, size: 220, o: { head: "crown" } }] },
        { f: C1.born, icons: [{ k: "tree", x: 0.3, size: 290, o: { kind: "sal" } }, { k: "baby", x: 0.6, size: 120 }, { k: "lotus", x: 0.8, size: 100 }] },
        { f: C1.day, icons: [{ k: "lotus", x: 0.18, size: 120 }, { k: "moon", x: 0.5, y: 60, size: 200 }, { k: "lotus", x: 0.82, size: 120 }] },
        { f: C1.steps, icons: [...Array.from({ length: 7 }, (_, i) => ({ k: "lotus" as const, x: 0.1 + i * 0.13, size: 80, d: i * 8 })), { k: "baby", x: 0.1, move: 0.88, y: 50, size: 110, d: 0 }] },
        { f: C1.lotus, icons: [{ k: "lotus", x: 0.5, size: 290 }, { k: "lotus", x: 0.18, size: 120, d: 8 }, { k: "lotus", x: 0.82, size: 120, d: 12 }] },
        { f: C1.ashoka, icons: [{ k: "figure", x: 0.22, size: 230, o: { crown: true } }, { k: "pillar", x: 0.52, size: 320 }, { k: "elephant", x: 0.82, size: 200 }] },
        { f: C1.here, icons: [{ k: "pillar", x: 0.5, size: 330 }, { k: "lotus", x: 0.25, size: 110 }, { k: "baby", x: 0.75, size: 110 }] },
        { f: C1.pillar, title: "1896", sub: "ค้นพบเสาอีกครั้ง", icons: [{ k: "pillar", x: 0.1, size: 280 }, { k: "pillar", x: 0.9, size: 280, flip: true }] },
        { f: C1.maya7, icons: [{ k: "person", x: 0.5, size: 250, o: { head: "crown" } }, { k: "lotus", x: 0.2, size: 110 }, { k: "lotus", x: 0.8, size: 110 }] },
        { f: C1.gotami, icons: [{ k: "person", x: 0.42, size: 250, o: { head: "veil" } }, { k: "baby", x: 0.6, y: 50, size: 100, d: 8 }] },
      ]}
    />
  ),
  Screen: () => {
    const frame = useCurrentFrame();
    return <Moon k={interpolate(frame, [C1.day, C1.day + 15, C1.steps, C1.steps + 10], [0, 1, 1, 0], clamp)} />;
  },
  sfx: [
    [C1.where - 6, SFX.whoosh, 0.35],
    [C1.sakya, SFX.pop, 0.3],
    [C1.garden + 30, SFX.whoosh, 0.3],
    [C1.born, SFX.swell, 0.35],
    [C1.day, SFX.hit, 0.45],
    [C1.ashoka, SFX.pop, 0.3],
    [C1.pillar + 10, SFX.tick, 0.3],
    [C1.heritage, SFX.hit, 0.4],
  ],
};

// ── Chapter 2 · คำทำนาย ──────────────────────────────────────────────────────────────────────────────
const C2 = {
  asita: B.asita.start,
  cry: B.laughcry.start,
  tears: wf("laughcry", "น้ำตา", 0.3),
  name: B.name.start,
  sid: wf("name", "สิทธัตถะ", 0.55),
  two: B.twoways.start,
  king: wf("twoways", "จักรพรรดิ", 0.5),
  buddha: wf("twoways", "พระพุทธเจ้า", 0.9),
  kond: B.kondanna.start,
  finger: wf("kondanna", "นิ้ว", 0.3),
  father: B.father.start,
  palaces: B.palaces.start,
  hot: wf("palaces", "ร้อน", 0.45),
  rain: wf("palaces", "ฝน", 0.55),
  cold: wf("palaces", "หนาว", 0.65),
  rose: B.rose.start,
  sit: wf("rose", "สมาธิ", 0.6),
  marry: B.marry.start,
  end: B.outside.start,
};

export const d1c2: Chapter = {
  name: "คำทำนาย",
  from: C2.asita,
  to: C2.end,
  cams: (w, h) => [
    { frame: C2.asita, cam: view(VW.foothills, w, h, 1, 0.1) },
    { frame: C2.cry, cam: view(VW.foothills, w, h, 1, 0.1) },
    { frame: C2.cry + 40, cam: view(VW.kapila, w, h, 0.8, 0.1) },
    { frame: C2.marry, cam: view(VW.kapila, w, h, 0.8, 0.1) },
    { frame: C2.marry + 40, cam: view(VW.sakya, w, h, 1, 0.1) },
  ],
  years: [[C2.asita, "80 ปีก่อน พ.ศ."], [C2.marry, "พระชนมายุ 16"]],
  heads: [
    card("asita", LEAF),
    card("laughcry", LEAF),
    card("name", LEAF),
    card("twoways", LEAF, { chips: [{ text: "ครองเรือน → จักรพรรดิ", f: C2.king }, { text: "ออกบวช → พระพุทธเจ้า", f: C2.buddha }] }),
    card("kondanna", LEAF, { stat: "☝", label: "ทางเดียว" }),
    card("father", CINNABAR),
    card("palaces", LEAF, { chips: [{ text: "หน้าร้อน", f: C2.hot }, { text: "หน้าฝน", f: C2.rain }, { text: "หน้าหนาว", f: C2.cold }] }),
    card("rose", LEAF),
    card("marry", LEAF, { stat: "16", label: "พรรษา" }),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        {frame < C2.cry + 30 && <Arrow points={[PL.hills, [83.4, 27.95], PL.kapila]} start={C2.asita + 10} end={C2.asita + 60} color={LEAF} width={12} variant="dashed" />}
        {frame < C2.cry + 30 && <PointLabel at={PL.hills} text="หิมาลัย" start={C2.asita + 4} color="#ffffff" size={0.7} />}
        <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={C2.asita} color={LEAF} size={0.9} />
        {frame >= C2.marry && <PointLabel at={PL.devadaha} text="เทวทหะ" start={C2.marry + 20} color={LEAF} size={0.8} />}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d2"
      anchor={PL.kapila}
      end={C2.end}
      shots={[
        { f: C2.asita, icons: [{ k: "mountains", x: 0.2, size: 220 }, { k: "person", x: 0.4, move: 0.62, size: 250, o: { head: "topknot" } }, { k: "palace", x: 0.86, size: 180 }] },
        { f: C2.cry, icons: [{ k: "person", x: 0.4, size: 260, o: { head: "topknot" } }, { k: "baby", x: 0.6, y: 70, size: 100 }] },
        { f: C2.tears, title: "ยินดี · น้ำตาไหล", icons: [{ k: "person", x: 0.12, size: 220, o: { head: "topknot" } }, { k: "baby", x: 0.88, y: 40, size: 100 }] },
        { f: C2.name, icons: Array.from({ length: 8 }, (_, i) => ({ k: "person" as const, x: 0.08 + i * 0.12, size: 160, d: i * 4, o: { head: "topknot" } })) },
        { f: C2.sid, title: "สิทธัตถะ", sub: "ผู้ที่สิ่งที่ประสงค์สำเร็จแล้ว", icons: [{ k: "lotus", x: 0.1, size: 120 }, { k: "lotus", x: 0.9, size: 120 }] },
        { f: C2.two, icons: [{ k: "crown", x: 0.25, size: 240, label: "ครองเรือน → จักรพรรดิ", d: C2.king - C2.two }, { k: "wheel", x: 0.75, y: 40, size: 180, label: "ออกบวช → พระพุทธเจ้า", d: C2.buddha - C2.two }] },
        { f: C2.kond, icons: [...Array.from({ length: 7 }, (_, i) => ({ k: "person" as const, x: 0.06 + i * 0.075, size: 120, d: i * 3, o: { head: "topknot" } })), { k: "person", x: 0.78, size: 270, d: C2.finger - C2.kond, label: "โกณฑัญญะ", o: { head: "topknot" } }] },
        { f: C2.father, icons: [{ k: "palace", x: 0.2, size: 170 }, { k: "figure", x: 0.5, size: 260, o: { crown: true } }, { k: "palace", x: 0.8, size: 170 }] },
        { f: C2.palaces, icons: [["ร้อน", C2.hot], ["ฝน", C2.rain], ["หนาว", C2.cold]].map(([t, f], i) => ({ k: "palace" as const, x: 0.2 + i * 0.3, size: 230, d: Math.max(0, (f as number) - C2.palaces), label: `หน้า${t}` })) },
        { f: C2.cold + 30, icons: [{ k: "person", x: 0.18, size: 170, o: { head: "crown" } }, { k: "palace", x: 0.5, size: 300 }, { k: "person", x: 0.82, size: 170, o: { head: "crown" } }] },
        { f: C2.rose, icons: [{ k: "tree", x: 0.5, size: 320 }, { k: "sitter", x: 0.5, size: 120, d: 10 }, { k: "hut", x: 0.88, size: 120 }] },
        { f: C2.sit, icons: [{ k: "tree", x: 0.5, size: 340 }, { k: "sitter", x: 0.5, size: 200, o: { glow: 1 } }] },
        { f: C2.marry, icons: [{ k: "figure", x: 0.38, size: 250, o: { crown: true } }, { k: "figure", x: 0.62, size: 230, o: { crown: true, wide: 1.2 } }, { k: "lotus", x: 0.5, y: 200, size: 80, d: 20 }] },
      ]}
    />
  ),
  sfx: [
    [C2.asita, SFX.whoosh, 0.3],
    [C2.name, SFX.pop, 0.3],
    [C2.king, SFX.pop, 0.35],
    [C2.buddha, SFX.pop, 0.35],
    [C2.finger, SFX.hit, 0.45],
    [C2.hot, SFX.pop, 0.3],
    [C2.rain, SFX.pop, 0.3],
    [C2.cold, SFX.pop, 0.3],
    [C2.marry, SFX.swell, 0.3],
  ],
};

// ── Chapter 3 · เทวทูต 4 ─────────────────────────────────────────────────────────────────────────────
const C3 = {
  out: B.outside.start,
  ride: wf("outside", "เสด็จ", 0.6),
  old: B.old.start,
  ask: wf("old", "ถาม", 0.5),
  sick: B.sick.start,
  dead: wf("sick", "ศพ", 0.6),
  shock: B.shock.start,
  age: wf("shock", "แก่", 0.8),
  ill: wf("shock", "เจ็บ", 0.87),
  die: wf("shock", "ตาย", 0.94),
  monk: B.monk.start,
  name4: B.name4.start,
  rahula: B.rahula.start,
  fetter: wf("rahula", "บ่วง", 0.65),
  end: B.night2.start,
};

export const d1c3: Chapter = {
  name: "เทวทูต 4",
  from: C3.out,
  to: C3.end,
  cams: (w, h) => [
    { frame: C3.out, cam: view(VW.sakya, w, h, 1, 0.1) },
    { frame: C3.out + 40, cam: view(VW.kapila, w, h, 1, 0.1) },
  ],
  years: [[C3.out, "พระชนมายุ 29"]],
  heads: [
    card("outside", LEAF, { stat: "29", label: "พรรษา" }),
    card("old", CINNABAR, { stat: "①" }),
    card("sick", CINNABAR, { stat: "②" }),
    { ...card("sick", CINNABAR, { stat: "③" }), f: C3.dead, head: "เทวทูตที่ 3", tag: "คนตาย" },
    card("shock", CINNABAR, { chips: [{ text: "แก่", f: C3.age }, { text: "เจ็บ", f: C3.ill }, { text: "ตาย", f: C3.die }] }),
    card("monk", LEAF, { stat: "④" }),
    card("name4", LEAF, { chips: [{ text: "① คนแก่", f: C3.name4 + 15 }, { text: "② คนเจ็บ", f: C3.name4 + 25 }, { text: "③ คนตาย", f: C3.name4 + 35 }, { text: "④ สมณะ", f: C3.name4 + 45 }] }),
    card("rahula", LEAF),
  ],
  Map: () => <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={C3.out} color={LEAF} size={0.9} />,
  Panels: () => (
    <IconStrip
      id="d3"
      anchor={PL.kapila}
      end={C3.end}
      shots={[
        { f: C3.out, icons: [{ k: "palace", x: 0.12, size: 200 }, { k: "chariot", x: 0.3, move: 0.8, size: 230, d: 4 }] },
        { f: C3.old, icons: [{ k: "chariot", x: 0.2, size: 210 }, { k: "oldman", x: 0.68, size: 250, label: "①", d: 6 }] },
        { f: C3.ask, title: "ทุกคนต้องแก่", icons: [{ k: "oldman", x: 0.12, size: 240 }, { k: "figure", x: 0.88, size: 230, o: { crown: true } }] },
        { f: C3.sick, icons: [{ k: "chariot", x: 0.2, size: 210 }, { k: "lying", x: 0.66, size: 320, label: "②", d: 6 }] },
        { f: C3.dead, icons: [{ k: "chariot", x: 0.16, size: 190 }, { k: "bier", x: 0.62, size: 260, label: "③", d: 6 }] },
        { f: C3.shock, icons: [{ k: "oldman", x: 0.18, size: 210, d: 0 }, { k: "lying", x: 0.5, size: 280, d: 6 }, { k: "bier", x: 0.82, size: 220, d: 12 }] },
        { f: C3.age - 6, icons: [{ k: "oldman", x: 0.18, size: 210, label: "แก่", d: 0 }, { k: "lying", x: 0.5, size: 280, label: "เจ็บ", d: C3.ill - C3.age + 6 }, { k: "bier", x: 0.82, size: 220, label: "ตาย", d: C3.die - C3.age + 6 }] },
        { f: C3.monk, icons: [{ k: "chariot", x: 0.2, size: 200 }, { k: "person", x: 0.62, size: 270, label: "④", d: 6, o: { head: "shaved" } }, { k: "bowl", x: 0.8, y: 70, size: 70, d: 12 }] },
        { f: C3.name4, icons: [{ k: "oldman", x: 0.13, size: 190, label: "① คนแก่" }, { k: "lying", x: 0.37, size: 250, label: "② คนเจ็บ" }, { k: "bier", x: 0.62, size: 190, label: "③ คนตาย" }, { k: "person", x: 0.87, size: 200, label: "④ สมณะ", o: { head: "shaved" } }] },
        { f: C3.rahula, icons: [{ k: "figure", x: 0.45, size: 240, o: { crown: true, wide: 1.2 } }, { k: "baby", x: 0.6, y: 40, size: 100, d: 8 }, { k: "palace", x: 0.15, size: 170 }] },
        { f: C3.fetter, title: "ราหุล", sub: "แปลว่า บ่วง", icons: [{ k: "baby", x: 0.12, size: 140 }, { k: "baby", x: 0.88, size: 140, flip: true }] },
      ]}
    />
  ),
  sfx: [
    [C3.out, SFX.whoosh, 0.3],
    [C3.old, SFX.hit, 0.4],
    [C3.sick, SFX.hit, 0.4],
    [C3.dead, SFX.hit, 0.4],
    [C3.age, SFX.pop, 0.3],
    [C3.ill, SFX.pop, 0.3],
    [C3.die, SFX.pop, 0.3],
    [C3.monk, SFX.swell, 0.35],
    [C3.fetter, SFX.hit, 0.4],
  ],
};
