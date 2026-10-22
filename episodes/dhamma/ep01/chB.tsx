import { interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { PointLabel } from "../../../components/Labels";
import { SFX } from "../../../components/Sound";
import { clamp, QuizNews, view, type Chapter } from "../../thaihistory/news/kit";
import { CINNABAR, LEAF } from "../kit/Mural";
import { IconStrip } from "../kit/Pictos";
import { B, card, wf } from "./beatsKit";
import { LEG_ANOMA, LEG_RAJGIR, LEG_URUVELA, PL, VW } from "./places";

// Chapters 4–6 of episode 1: the night he left (night2 → great), Rajagaha and the two teachers (walk → notenough),
// six years at Uruvela (uruvela → eat).

// ── Chapter 4 · คืนออกผนวช ───────────────────────────────────────────────────────────────────────────
const C4 = {
  n: B.night2.start,
  look: B.look.start,
  hold: wf("look", "อุ้ม", 0.6),
  ride: B.ride.start,
  gate: B.gate.start,
  where: B.where2.start,
  nepal: wf("where2", "ติเลาราโกต", 0.35),
  india: wf("where2", "ปิปราห์วา", 0.6),
  anoma: B.anoma.start,
  dawn: wf("anoma", "รุ่งสาง", 0.85),
  cut: B.cut.start,
  throw: wf("cut", "โยน", 0.45),
  channa: B.channa.start,
  died: wf("channa", "หัวใจ", 0.7),
  great: B.great.start,
  end: B.walk.start,
};

export const d1c4: Chapter = {
  name: "คืนออกผนวช",
  from: C4.n,
  to: C4.end,
  cams: (w, h) => [
    { frame: C4.n, cam: view(VW.kapila, w, h, 1, 0.1) },
    { frame: C4.where, cam: view(VW.kapila, w, h, 1, 0.1) },
    { frame: C4.anoma, cam: view(VW.kapila, w, h, 1, 0.1) },
    { frame: C4.anoma + 45, cam: view(VW.anoma, w, h, 1, 0.1) },
  ],
  years: [[C4.n, "พระชนมายุ 29"]],
  heads: [
    card("night2", CINNABAR),
    card("look", LEAF),
    card("ride", LEAF),
    card("gate", CINNABAR),
    card("where2", LEAF, { chips: [{ text: "ติเลาราโกต (เนปาล)", f: C4.nepal }, { text: "ปิปราห์วา (อินเดีย)", f: C4.india }] }),
    card("anoma", LEAF),
    card("cut", LEAF),
    card("channa", CINNABAR),
    card("great", LEAF, { stat: "29", label: "พรรษา" }),
  ],
  night: (f) => interpolate(f, [C4.n - 20, C4.n + 10, C4.dawn - 20, C4.dawn + 30], [0.2, 1, 1, 0.1], clamp),
  Map: () => {
    const frame = useCurrentFrame();
    const duo = frame >= C4.where && frame < C4.anoma + 10;
    return (
      <>
        {!duo && <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={C4.n} color={LEAF} size={0.9} />}
        {duo && (
          <>
            <PointLabel at={PL.tilaura} text="ติเลาราโกต" start={C4.nepal} color="#ffffff" size={0.85} />
            <PointLabel at={PL.piprahwa} text="ปิปราห์วา" start={C4.india} color="#ffffff" size={0.85} />
            <Arrow points={[PL.tilaura, PL.piprahwa]} start={C4.india + 10} end={C4.india + 30} color={LEAF} width={8} variant="dashed" />
          </>
        )}
        {frame >= C4.anoma && <Arrow points={LEG_ANOMA} start={C4.anoma + 20} end={C4.dawn} color={LEAF} width={16} />}
        {frame >= C4.anoma && <PointLabel at={PL.anoma} text="แม่น้ำอโนมา" start={C4.dawn - 10} color={LEAF} size={0.85} />}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d4"
      anchor={PL.kapila}
      end={C4.end}
      shots={[
        { f: C4.n, night: true, icons: [{ k: "lying", x: 0.18, size: 230 }, { k: "palace", x: 0.5, size: 260 }, { k: "lying", x: 0.82, size: 230, flip: true }] },
        { f: C4.look, night: true, icons: [{ k: "lying", x: 0.38, size: 320 }, { k: "baby", x: 0.5, y: 30, size: 70, d: 8 }, { k: "figure", x: 0.84, size: 240, o: { crown: true }, d: 12 }] },
        { f: C4.ride, night: true, icons: [{ k: "gate", x: 0.15, size: 250 }, { k: "horse", x: 0.38, move: 0.85, size: 250, d: 3 }] },
        { f: C4.gate, night: true, icons: [{ k: "gate", x: 0.12, size: 220 }, { k: "horse", x: 0.4, size: 240 }, { k: "demon", x: 0.78, size: 250, d: 10, label: "อีก 7 วันจะได้ครองโลก" }] },
        { f: C4.where, icons: [{ k: "palace", x: 0.25, size: 210, label: "ติเลาราโกต", d: C4.nepal - C4.where }, { k: "question", x: 0.5, y: 120, size: 120 }, { k: "palace", x: 0.75, size: 210, label: "ปิปราห์วา", d: C4.india - C4.where }] },
        { f: C4.anoma, at: PL.anoma, icons: [{ k: "horse", x: 0.15, move: 0.62, size: 240 }, { k: "waves", x: 0.86, size: 160 }, { k: "sun", x: 0.88, y: 210, size: 80, d: C4.dawn - C4.anoma }] },
        { f: C4.cut, at: PL.anoma, icons: [{ k: "waves", x: 0.12, size: 140 }, { k: "figure", x: 0.45, size: 250, o: { crown: true } }, { k: "sword", x: 0.66, y: 60, size: 200, d: 8 }] },
        { f: C4.throw, at: PL.anoma, icons: [{ k: "crown", x: 0.2, size: 190, label: "ถอดเครื่องทรง" }, { k: "sword", x: 0.5, size: 240 }, { k: "person", x: 0.8, size: 250, label: "นักบวช", o: { head: "shaved" } }] },
        { f: C4.channa, at: PL.anoma, icons: [{ k: "person", x: 0.62, move: 0.3, size: 230, label: "ฉันนะ" }, { k: "horse", x: 0.85, move: 0.5, size: 230, flip: true, o: { rider: false } }] },
        { f: C4.died, at: PL.anoma, icons: [{ k: "horse", x: 0.45, size: 250, flip: true, o: { rider: false } }, { k: "lotus", x: 0.8, size: 100 }] },
        { f: C4.great, at: PL.anoma, title: "29", sub: "พรรษา · มหาภิเนษกรมณ์", icons: [{ k: "person", x: 0.12, size: 240, o: { head: "shaved" } }, { k: "bowl", x: 0.88, size: 110 }] },
      ]}
    />
  ),
  sfx: [
    [C4.n, SFX.swell, 0.25],
    [C4.ride, SFX.whoosh, 0.35],
    [C4.gate, SFX.hit, 0.4],
    [C4.nepal, SFX.pop, 0.3],
    [C4.india, SFX.pop, 0.3],
    [C4.anoma + 15, SFX.whoosh, 0.3],
    [C4.throw, SFX.whoosh, 0.3],
    [C4.great, SFX.hit, 0.45],
  ],
};

// ── Chapter 5 · ราชคฤห์ ──────────────────────────────────────────────────────────────────────────────
const C5 = {
  walk: B.walk.start,
  km: wf("walk", "เส้นตรง", 0.75),
  alms: B.alms.start,
  king: wf("alms", "พิมพิสาร", 0.85),
  bimb: B.bimbisara.start,
  no: wf("bimbisara", "ปฏิเสธ", 0.55),
  promise: B.promise.start,
  teachers: B.teachers.start,
  udd: wf("teachers", "อุททกดาบส", 0.75),
  jhana: B.jhana.start,
  not: B.notenough.start,
  end: B.uruvela.start,
};

export const d1c5: Chapter = {
  name: "ราชคฤห์",
  from: C5.walk,
  to: C5.end,
  cams: (w, h) => [
    { frame: C5.walk, cam: view(VW.anoma, w, h, 1, 0.1) },
    { frame: C5.walk + 40, cam: view(VW.magadha, w, h, 0.95, 0.1) },
    { frame: C5.alms, cam: view(VW.magadha, w, h, 0.95, 0.1) },
    { frame: C5.alms + 40, cam: view(VW.rajgir, w, h, 1, 0.1) },
  ],
  years: [[C5.walk, "พระชนมายุ 29"]],
  heads: [
    card("walk", LEAF, { stat: (f) => `${Math.round(interpolate(f, [C5.km, C5.km + 40], [0, 350], clamp))}+`, label: "กม. (เส้นตรง)" }),
    card("alms", LEAF),
    card("bimbisara", LEAF),
    card("promise", LEAF),
    card("teachers", LEAF),
    card("jhana", LEAF, { chips: [{ text: "อาฬาระ · ขั้นที่ 7", f: C5.jhana + 20 }, { text: "อุททกะ · ขั้นที่ 8", f: C5.jhana + 40 }] }),
    card("notenough", CINNABAR),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={LEG_ANOMA} start={C5.walk - 30} end={C5.walk - 29} color={LEAF} width={14} />
        <Arrow points={LEG_RAJGIR} start={C5.walk + 30} end={C5.km + 40} color={LEAF} width={16} />
        <PointLabel at={PL.kapila} text="กบิลพัสดุ์" start={C5.walk} color={LEAF} size={0.7} />
        {frame >= C5.km && <PointLabel at={PL.rajgir} text="ราชคฤห์" start={C5.km + 30} color={LEAF} size={0.9} />}
        {frame >= C5.walk + 40 && frame < C5.alms + 30 && <PointLabel at={[84.6, 25.95]} text="แม่น้ำคงคา" start={C5.walk + 50} color="#7fd4ff" size={0.65} />}
      </>
    );
  },
  Panels: () => (
    <IconStrip
      id="d5"
      anchor={PL.rajgir}
      end={C5.end}
      shots={[
        { f: C5.walk, icons: [{ k: "person", x: 0.12, move: 0.75, size: 240, o: { head: "shaved" } }, ...[0.3, 0.45, 0.6].map((x, i) => ({ k: "footprint" as const, x, size: 60, d: 12 + i * 10 }))] },
        { f: C5.km, icons: [{ k: "mountains", x: 0.15, size: 180 }, { k: "mountains", x: 0.32, size: 150, flip: true }, ...[0.55, 0.7, 0.85].map((x, i) => ({ k: "palace" as const, x, size: 170, d: 8 + i * 5 }))] },
        { f: C5.alms, icons: [{ k: "person", x: 0.28, size: 250, o: { head: "shaved" } }, { k: "bowl", x: 0.42, y: 70, size: 70, d: 6 }, { k: "person", x: 0.7, size: 170, d: 12 }, { k: "person", x: 0.84, size: 170, d: 16, o: { head: "veil" } }] },
        { f: C5.king, icons: [{ k: "person", x: 0.2, size: 230, o: { head: "shaved" } }, { k: "figure", x: 0.62, size: 250, o: { crown: true } }, { k: "palace", x: 0.86, size: 180 }] },
        { f: C5.bimb, icons: [{ k: "person", x: 0.16, size: 240, o: { head: "shaved" } }, { k: "coins", x: 0.45, size: 150, d: 8 }, { k: "elephant", x: 0.62, size: 150, d: 12 }, { k: "figure", x: 0.84, size: 250, o: { crown: true } }] },
        { f: C5.no, title: "ปฏิเสธ", sub: "ออกมาเพื่อหาทางพ้นทุกข์", icons: [{ k: "person", x: 0.1, size: 230, o: { head: "shaved" } }, { k: "coins", x: 0.9, size: 130 }] },
        { f: C5.promise, icons: [{ k: "person", x: 0.3, size: 240, o: { head: "shaved" } }, { k: "wheel", x: 0.5, y: 190, size: 90, d: 10 }, { k: "figure", x: 0.72, size: 250, o: { crown: true } }] },
        { f: C5.teachers, icons: [{ k: "person", x: 0.2, size: 240, label: "อาฬาระ", o: { head: "topknot" } }, { k: "sitter", x: 0.5, size: 160, d: 6, o: { head: "shaved" } }, { k: "person", x: 0.8, size: 240, label: "อุททกะ", d: C5.udd - C5.teachers, o: { head: "topknot" } }] },
        { f: C5.jhana, icons: [{ k: "steps", x: 0.5, size: 270, o: { n: 8, lit: 7 } }, { k: "sitter", x: 0.13, size: 170, o: { head: "shaved" } }] },
        { f: C5.jhana + 45, icons: [{ k: "steps", x: 0.5, size: 270, o: { n: 8, lit: 8 } }, { k: "sitter", x: 0.13, size: 170, o: { head: "shaved" } }] },
        { f: C5.not, icons: [{ k: "sitter", x: 0.3, size: 230, o: { head: "shaved" } }, { k: "question", x: 0.7, size: 240, d: 10 }] },
      ]}
    />
  ),
  sfx: [
    [C5.walk + 25, SFX.whoosh, 0.35],
    [C5.km, SFX.tick, 0.3],
    [C5.alms + 30, SFX.whoosh, 0.3],
    [C5.no, SFX.hit, 0.4],
    [C5.teachers, SFX.pop, 0.3],
    [C5.not, SFX.riser, 0.2],
  ],
};

// ── Chapter 6 · อุรุเวลา ─────────────────────────────────────────────────────────────────────────────
const C6 = {
  uru: B.uruvela.start,
  river: wf("uruvela", "เนรัญชรา", 0.55),
  five: B.five.start,
  kond: wf("five", "โกณฑัญญะ", 0.35),
  aus: B.austerity.start,
  fast: wf("austerity", "อด", 0.7),
  body: B.body.start,
  six: B.sixyears.start,
  quiz: B.quiz.start,
  mid: B.middle.start,
  lute: B.lute.start,
  tight: wf("lute", "ตึง", 0.4),
  loose: wf("lute", "หย่อน", 0.6),
  eat: B.eat.start,
  left: wf("eat", "ทิ้ง", 0.6),
  end: B.sujata.start,
};

export const d1c6: Chapter = {
  name: "หกปีที่อุรุเวลา",
  from: C6.uru,
  to: C6.end,
  cams: (w, h) => [
    { frame: C6.uru, cam: view(VW.rajgir, w, h, 1, 0.1) },
    { frame: C6.uru + 45, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C6.eat, cam: view(VW.uruvela, w, h, 1, 0.1) },
    { frame: C6.eat + 40, cam: view(VW.sarnath, w, h, 1, 0.1) },
  ],
  years: [[C6.uru, "พระชนมายุ 29–35"]],
  heads: [
    card("uruvela", LEAF),
    card("five", LEAF),
    card("austerity", CINNABAR),
    card("body", CINNABAR),
    card("sixyears", CINNABAR, { stat: "6", label: "ปี" }),
    card("quiz", LEAF),
    card("middle", LEAF),
    card("lute", LEAF, { chips: [{ text: "ตึงไป → ขาด", f: C6.tight }, { text: "หย่อนไป → ไม่ดัง", f: C6.loose }, { text: "พอดี → ไพเราะ", f: C6.loose + 45 }] }),
    card("eat", CINNABAR),
  ],
  Map: () => {
    const frame = useCurrentFrame();
    return (
      <>
        <Arrow points={LEG_URUVELA} start={C6.uru + 10} end={C6.uru + 50} color={LEAF} width={14} />
        <PointLabel at={PL.uruvela} text="อุรุเวลา" start={C6.uru + 40} color={LEAF} size={0.9} />
        {frame >= C6.river && frame < C6.eat && <PointLabel at={[85.02, 24.735]} text="แม่น้ำเนรัญชรา" start={C6.river} color="#7fd4ff" size={0.75} />}
        {frame >= C6.left && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <Arrow key={i} points={[[PL.uruvela[0], PL.uruvela[1] + i * 0.03], [84.0, 25.15 + i * 0.03], PL.sarnath]} start={C6.left + i * 6} end={C6.left + 45 + i * 6} color={CINNABAR} width={6} variant="dashed" />
            ))}
            <PointLabel at={PL.sarnath} text="ป่าอิสิปตนะ (สารนาถ)" start={C6.left + 40} color={LEAF} size={0.8} />
          </>
        )}
      </>
    );
  },
  // The quiz card takes the panel slot from quiz to middle, so the icons pause there.
  Panels: () => (
    <>
      <IconStrip
        id="d6a"
        anchor={PL.uruvela}
        end={C6.quiz}
        shots={[
          { f: C6.uru, icons: [{ k: "tree", x: 0.14, size: 230 }, { k: "waves", x: 0.5, size: 200 }, { k: "hut", x: 0.86, size: 150 }] },
          { f: C6.river, icons: [{ k: "tree", x: 0.12, size: 240 }, { k: "waves", x: 0.5, size: 260 }, { k: "person", x: 0.84, size: 220, o: { head: "shaved" } }] },
          { f: C6.five, icons: [{ k: "sitter", x: 0.5, size: 200, o: { head: "shaved" } }, ...[0.1, 0.22, 0.34, 0.78, 0.9].map((x, i) => ({ k: "person" as const, x, size: 150, d: 8 + i * 5, o: { head: "topknot" } }))] },
          { f: C6.kond, title: "โกณฑัญญะ", sub: "คนที่เคยยกนิ้วเดียว", icons: [{ k: "person", x: 0.1, size: 230, o: { head: "topknot" } }, { k: "baby", x: 0.9, size: 120 }] },
          { f: C6.kond + 75, icons: [{ k: "sitter", x: 0.5, size: 200, o: { head: "shaved" } }, ...[0.1, 0.22, 0.34, 0.78, 0.9].map((x, i) => ({ k: "person" as const, x, size: 150, d: i * 3, o: { head: "topknot" } }))] },
          { f: C6.aus, icons: [{ k: "sitter", x: 0.5, size: 260, o: { thin: true, head: "shaved" } }, { k: "tree", x: 0.14, size: 200 }, { k: "tree", x: 0.86, size: 200, flip: true }] },
          { f: C6.fast, icons: [{ k: "sitter", x: 0.42, size: 270, o: { thin: true, head: "shaved" } }, { k: "bowl", x: 0.78, size: 90, label: "น้ำถั่วกอบมือ", d: 8 }] },
          { f: C6.body, icons: [{ k: "sitter", x: 0.5, size: 330, o: { thin: true, head: "shaved" } }] },
          { f: C6.six, title: "6 ปี", icons: [{ k: "sitter", x: 0.12, size: 210, o: { thin: true, head: "shaved" } }, { k: "sun", x: 0.88, y: 150, size: 90 }] },
        ]}
      />
      <IconStrip
        id="d6b"
        anchor={PL.uruvela}
        end={C6.end}
        shots={[
          { f: C6.mid + 20, icons: [{ k: "tree", x: 0.5, size: 330 }, { k: "sitter", x: 0.5, size: 130 }, { k: "lotus", x: 0.15, size: 100 }] },
          { f: C6.lute, icons: [{ k: "lute", x: 0.5, size: 310 }, { k: "person", x: 0.16, size: 200, d: 8, o: { head: "crown" } }] },
          { f: C6.loose + 45, icons: [{ k: "lute", x: 0.28, size: 270 }, { k: "sitter", x: 0.68, size: 220, label: "ทางสายกลาง", d: 8, o: { head: "shaved" } }] },
          { f: C6.eat, icons: [{ k: "bowl", x: 0.3, size: 120 }, { k: "sitter", x: 0.52, size: 210, o: { head: "shaved" } }, { k: "person", x: 0.82, move: 0.98, size: 160, o: { head: "topknot" } }] },
          { f: C6.left, at: PL.sarnath, icons: [0, 1, 2, 3, 4].map((i) => ({ k: "person" as const, x: 0.05 + i * 0.1, move: 0.5 + i * 0.1, size: 150, d: i * 4, o: { head: "topknot" } })) },
        ]}
      />
    </>
  ),
  Screen: () => <QuizNews title="ทายกันหน่อย" question="จะทำยังไงต่อ?" options={["ทรมานตัวหนักขึ้นอีก", "ล้มเลิก กลับวัง", "เปลี่ยนวิธีใหม่"]} answer={2} start={C6.quiz} reveal={C6.mid + 4} end={C6.mid + 34} color={LEAF} />,
  sfx: [
    [C6.uru + 5, SFX.whoosh, 0.35],
    [C6.river, SFX.pop, 0.3],
    [C6.kond, SFX.hit, 0.4],
    [C6.aus, SFX.swell, 0.25],
    [C6.six, SFX.hit, 0.45],
    [C6.quiz, SFX.riser, 0.25],
    [C6.mid + 4, SFX.hit, 0.5],
    [C6.tight, SFX.pop, 0.3],
    [C6.loose, SFX.pop, 0.3],
    [C6.left, SFX.whoosh, 0.3],
  ],
};
