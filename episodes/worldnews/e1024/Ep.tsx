import { geoInterpolate } from "d3-geo";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, globeCam, panelHideAt, type Cam, type CamKey } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { countries, country } from "../../../components/data";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, Sphere, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Route } from "../../../components/Route";
import { Bed, Hit, SFX, Sfx, voiceSpans } from "../../../components/Sound";
import { CAPTION_TOP, CLEAR, font, GOLD, HeadCard, LayoutCtx, RED, type Head } from "../../thaihistory/news/kit";
import { clamp, ramp, Spiral } from "../e1021/Art";
import { B, BEATS, endOf, FRAMES, LAYOUT, PL, wf, type LL } from "./kit";
import { BrazilPanels, EV, FrancePanels, HookPanel, KenyaPanels, KimPanels, OleshkyPanels, SouthAfricaPanels, TyphoonPanels, WestBankPanels } from "./Scenes";

// แผนที่ข่าวโลก · เสาร์ 24 ต.ค. 2569 — house standard + illustration style v2 + recorded SFX + clear layout (rule 9).
export const E1024_FRAMES = FRAMES;
const EDITION = { title: "แผนที่ข่าวโลก", date: "เสาร์ 24 ต.ค. 2569" };

type Story = { id: string; ids: string[]; focus: LL; zoom: number; pins: { at: LL; label: string; word: string }[] };
const STORIES: Story[] = [
  { id: "kenya", ids: ["404"], focus: [37.6, 0.3], zoom: 6, pins: [{ at: PL.nairobi, label: "ไนโรบี", word: "กรุง" }] },
  { id: "france", ids: ["250"], focus: [2.4, 47.6], zoom: 6, pins: [{ at: PL.trappes, label: "ตราปส์", word: "ตรา" }] },
  { id: "westbank", ids: ["376", "275"], focus: [35.2, 31.6], zoom: 14, pins: [{ at: PL.hebron, label: "เฮบรอน", word: "เฮ" }] },
  { id: "oleshky", ids: ["804"], focus: [32.5, 47.8], zoom: 6, pins: [{ at: PL.oleshky, label: "โอเลชกี", word: "เมือง" }] },
  { id: "kim", ids: ["156", "408"], focus: [125, 39.8], zoom: 7, pins: [{ at: PL.dandong, label: "ตานตง", word: "ตาน" }, { at: PL.pyongyang, label: "เปียงยาง", word: "คิม" }] },
  { id: "safrica", ids: ["710"], focus: [27, -29.5], zoom: 4.5, pins: [{ at: PL.durban, label: "เดอร์บัน", word: "เด" }] },
  { id: "typhoon", ids: ["392"], focus: [125.2, 25.3], zoom: 9, pins: [{ at: PL.ishigaki, label: "อิชิงากิ", word: "อิ" }, { at: PL.miyako, label: "มิยาโกะ", word: "มิ" }] },
  { id: "brazil", ids: ["076"], focus: [-52, -12], zoom: 2.4, pins: [{ at: PL.brasilia, label: "บราซิเลีย", word: "บราซิล" }] },
];

/* ---------------- map layers ---------------- */
const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.9 * s} />;
};
const Highlight = ({ ids, opacity }: { ids: string[]; opacity: number }) => {
  const { path, s } = useMap();
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {ids.map((id) => {
        const d = path(country(id)) ?? "";
        return (
          <g key={id}>
            <path d={d} fill={RED} fillOpacity={0.28} />
            <path d={d} fill="none" stroke={RED} strokeWidth={9 * s} strokeOpacity={0.35} style={{ filter: `blur(${5 * s}px)` }} />
            <path d={d} fill="none" stroke="#ff8a80" strokeWidth={2.5 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};
// Champi over the Sakishima Islands, heading north-east (approximate track).
const Typhoon = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = B.typhoon.start;
  if (frame < a || frame > endOf("typhoon") + 10) return null;
  const pos = geoInterpolate([124.2, 23.8], [125.8, 25.8])(ramp(frame, a, endOf("typhoon"), Easing.linear)) as LL;
  const p = projection(pos);
  const k = ramp(frame, a, a + 20) * interpolate(frame, [endOf("typhoon") - 6, endOf("typhoon") + 10], [1, 0], clamp);
  return p ? <Spiral x={p[0]} y={p[1]} r={150 * s} k={k} frame={frame} /> : null;
};
const StoryDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = wf("intro", "แปด");
  if (frame < a || frame > B.kenya.start + 20) return null;
  return (
    <g>
      {STORIES.map((st, i) => {
        const p = projection(st.pins[0].at);
        if (!p || frame < a + i * 3) return null;
        const pulse = ((frame - a) % 30) / 30;
        return (
          <g key={st.id}>
            <circle cx={p[0]} cy={p[1]} r={(10 + pulse * 24) * s} fill="none" stroke={RED} strokeWidth={3 * s} opacity={1 - pulse} />
            <circle cx={p[0]} cy={p[1]} r={9 * s} fill={RED} stroke="#fff" strokeWidth={2.5 * s} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------------- cards ---------------- */
const HEADS: Record<string, Head[]> = {
  intro: [{ f: B.intro.start + 4, tag: EDITION.date, head: "8 ข่าวใหญ่ใน 24 ชั่วโมง", stat: "90", label: "วินาที" }],
  kenya: [
    { f: B.kenya.start + 6, tag: "1/8 · เคนยา", head: "ตึกถล่มกลางไนโรบี", label: "ยังไม่มียอดทางการ" },
    { f: wf("kenya", "ผู้ว่า"), tag: "1/8 · เคนยา", head: "ไม่มีใบรับรองการเข้าใช้อาคาร", color: GOLD },
  ],
  france: [
    { f: B.france.start + 6, tag: "2/8 · ฝรั่งเศส", head: "กราดยิงชานกรุงปารีส", stat: "1 · 5", label: "เสียชีวิต · บาดเจ็บ" },
    { f: wf("france", "มาครง"), tag: "2/8 · ฝรั่งเศส", head: "มาครง: ก่อการร้ายทางเชื้อชาติ", color: "#4fa3ff" },
  ],
  westbank: [
    { f: B.westbank.start + 6, tag: "3/8 · เวสต์แบงก์ · อิสราเอล", head: "ทหารอิสราเอลเสียชีวิต", stat: "2", label: "นาย" },
    { f: wf("westbank", "ปิด"), tag: "3/8 · เวสต์แบงก์", head: "ปิดล้อมเฮบรอน–ฮัลฮูล", color: GOLD },
  ],
  oleshky: [
    { f: B.oleshky.start + 6, tag: "4/8 · ยูเครน · รัสเซีย", head: "หยุดยิงชั่วคราวที่โอเลชกี", color: "#3fb950" },
    { f: wf("oleshky", "ฝ่าย"), tag: "4/8 · ยูเครน", head: "ฝ่ายยูเครน: เริ่ม", stat: "27 ต.ค.", color: GOLD },
  ],
  kim: [{ f: B.kim.start + 6, tag: "5/8 · จีน · เกาหลีเหนือ", head: "คิม จองอึน นั่งรถไฟเข้าจีน", color: GOLD }],
  safrica: [
    { f: B.safrica.start + 6, tag: "6/8 · แอฟริกาใต้", head: "ฝูงชนรุมทำร้ายชายต่างชาติ", stat: "~50", label: "คน" },
    { f: wf("safrica", "ซิมบับเว"), tag: "6/8 · แอฟริกาใต้", head: "3 ประเทศเตรียมพาพลเมืองกลับ", color: GOLD },
  ],
  typhoon: [{ f: B.typhoon.start + 6, tag: "7/8 · ญี่ปุ่น", head: "ไต้ฝุ่นจำปีถึงซากิชิมะ", color: GOLD }],
  brazil: [
    { f: B.brazil.start + 6, tag: "8/8 · บราซิล", head: "พรุ่งนี้เลือกตั้งรอบสอง", color: "#3fb950" },
    { f: wf("brazil", "โพ"), tag: "8/8 · บราซิล", head: "โพล Datafolha ล่าสุด", stat: "50–50", color: GOLD },
  ],
};

const TopBar = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < B.intro.start - 4) return null;
  const current = STORIES.findIndex((st) => frame >= B[st.id].start - 10 && frame < endOf(st.id));
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: RED, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>{EDITION.title}</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{EDITION.date}</div>
      </div>
      <div style={{ display: "flex", gap: 8 * s }}>
        {STORIES.map((st, i) => (
          <div key={st.id} style={{ width: 30 * s, height: 10 * s, borderRadius: 5 * s, background: i === current ? RED : i < current || frame > B.outro.start ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </div>
  );
};

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end, B.hook.end + 8], [1, 0], clamp);
  if (o <= 0) return null;
  const k = spring({ frame, fps, config: { damping: 12 }, from: 0.85, to: 1 });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.09, opacity: o, transform: `scale(${k})`, fontFamily: font, color: "#fff", lineHeight: 1.25, textAlign: "center" }}>
      <span style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontSize: 34 * s, fontWeight: 900 }}>ด่วน · เคนยา</span>
      <div style={{ fontSize: 96 * s, fontWeight: 900, marginTop: 18 * s, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>ตึกถล่มกลางไนโรบี</div>
      <div style={{ fontSize: 80 * s, fontWeight: 900, color: "#ff6b5f", textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>คนติดใต้ซาก</div>
    </div>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.outro.start, B.outro.start + 12], [0, 1], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.4 }}>
      <div style={{ background: "rgba(8,14,26,0.86)", padding: `${24 * s}px ${50 * s}px`, borderRadius: 18 * s, border: `${3 * s}px solid ${RED}` }}>
        <div style={{ fontSize: 76 * s, fontWeight: 900 }}>{EDITION.title}</div>
        <div style={{ fontSize: 36 * s, opacity: 0.85 }}>ทุกวัน · กดติดตามไว้ แล้วพบกันพรุ่งนี้</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- sound: one schedule with the pictures (EV) ---------------- */
const Sounds = () => {
  const voice = voiceSpans(BEATS);
  const e = endOf;
  return (
    <>
      {/* hook: street, collapse */}
      <Bed id="city_crowd" from={0} to={20} volume={0.3} fade={6} voice={voice} />
      <Hit id="wood_break" at={0} volume={0.5} />
      <Hit id="explosion_debris" at={EV.hookFall + 14} volume={0.6} />
      <Bed id="crowd_panic" from={6} to={B.intro.start + 10} volume={0.2} voice={voice} />
      <Sfx src={SFX.swell} at={B.intro.start} volume={0.3} />
      {/* Kenya */}
      <Bed id="city_crowd" from={B.kenya.start} to={EV.kenyaFall + 6} volume={0.2} voice={voice} />
      <Hit id="explosion_debris" at={EV.kenyaFall + 14} volume={0.55} />
      <Bed id="crowd_panic" from={EV.kenyaFall + 10} to={wf("kenya", "หลาย") + 14} volume={0.16} voice={voice} />
      <Bed id="siren_police" from={wf("kenya", "หลาย")} to={wf("kenya", "ผู้ว่า") + 14} volume={0.14} voice={voice} />
      {/* France */}
      <Bed id="siren_police" from={B.france.start} to={wf("france", "มาครง") + 14} volume={0.16} voice={voice} />
      <Bed id="city_crowd" from={wf("france", "มาครง")} to={wf("france", "ผู้ต้อง") + 14} volume={0.1} voice={voice} />
      <Bed id="siren_police" from={wf("france", "ผู้ต้อง")} to={e("france")} volume={0.12} voice={voice} />
      {/* West Bank */}
      <Bed id="wind" from={B.westbank.start} to={wf("westbank", "ปิด") + 14} volume={0.18} voice={voice} />
      <Hit id="tank_move" at={wf("westbank", "ปิด") + 4} volume={0.3} />
      <Bed id="city_crowd" from={wf("westbank", "เลือก")} to={e("westbank")} volume={0.12} voice={voice} />
      {/* Oleshky */}
      <Bed id="explosions_distant" from={B.oleshky.start} to={wf("oleshky", "หยุด") + 14} volume={0.15} voice={voice} />
      <Bed id="wind" from={wf("oleshky", "หยุด")} to={e("oleshky")} volume={0.18} voice={voice} />
      {/* Kim */}
      <Bed id="ship_sailing" from={B.kim.start} to={wf("kim", "ตาน") + 14} volume={0.12} voice={voice} />
      <Bed id="army_marching" from={wf("kim", "ตาน")} to={wf("kim", "ครบ") + 14} volume={0.14} voice={voice} />
      <Bed id="wind" from={wf("kim", "ครบ")} to={e("kim")} volume={0.15} voice={voice} />
      {/* South Africa */}
      <Bed id="siren_police" from={B.safrica.start} to={wf("safrica", "ท่ามกลาง") + 14} volume={0.12} voice={voice} />
      <Bed id="crowd_protest" from={wf("safrica", "ท่ามกลาง")} to={wf("safrica", "ซิมบับเว") + 14} volume={0.2} voice={voice} />
      <Bed id="city_crowd" from={wf("safrica", "ซิมบับเว")} to={e("safrica")} volume={0.12} voice={voice} />
      {/* Typhoon */}
      <Bed id="wind_storm" from={B.typhoon.start} to={wf("typhoon", "เที่ยว") + 14} volume={0.3} voice={voice} />
      <Bed id="sea_rough" from={B.typhoon.start} to={wf("typhoon", "เที่ยว") + 14} volume={0.2} voice={voice} />
      <Bed id="airport_crowd" from={wf("typhoon", "เที่ยว")} to={e("typhoon")} volume={0.18} voice={voice} />
      {/* Brazil */}
      <Bed id="crowd_cheer" from={B.brazil.start} to={wf("brazil", "โพ") + 14} volume={0.14} voice={voice} />
      <Bed id="city_crowd" from={wf("brazil", "โพ")} to={e("brazil")} volume={0.1} voice={voice} />
      {/* UI */}
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={B[st.id].start - 12} volume={0.25} />)}
    </>
  );
};

/* ---------------- composition ---------------- */
export const WorldNews1024 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.min(width, height) * 0.42;
  const target = (st: { focus: LL; zoom: number }): Cam => ({ lon: st.focus[0], lat: st.focus[1], scale: R * st.zoom });
  const hookCam = target({ focus: [37.6, 0.3], zoom: 6 });
  const authored: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: B.hook.end - 6, cam: hookCam },
    { frame: B.intro.start + 36, cam: globeCam(40, 15, width, height, 0.42), easing: Easing.inOut(Easing.cubic) },
    { frame: B.intro.end, cam: globeCam(30, 15, width, height, 0.42), easing: (t) => t },
  ];
  // Story changes (centred 10 frames after the cut so each story keeps its last panel): hold still, then zoom out through a midpoint and in on the next story. Each leg lasts
  // 28 frames plus 8 per e-fold of zoom (a 14× → globe zoom-out gets ~49), so big zooms never trip check-glitch.
  const legLen = (a: number, b: number) => Math.min(60, Math.round(28 + 8 * Math.abs(Math.log(a / b))));
  let prev: Cam = authored[authored.length - 1].cam;
  for (const st of STORIES) {
    const b = B[st.id];
    const t = target(st);
    const ip = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat]) as unknown as ((k: number) => [number, number]) & { distance: number };
    const [mlon, mlat] = ip(0.5);
    const far = ip.distance > 0.6 ? 1.05 : Math.max(1.05, (t.scale / R) * 0.45);
    const mid: Cam = { lon: mlon, lat: mlat, scale: R * far };
    const out = legLen(prev.scale, mid.scale);
    const inn = legLen(mid.scale, t.scale);
    authored.push({ frame: b.start + 10 - out, cam: prev });
    authored.push({ frame: b.start + 10, cam: mid, easing: Easing.inOut(Easing.quad) });
    authored.push({ frame: b.start + 10 + inn, cam: t, easing: Easing.out(Easing.cubic) });
    prev = t;
  }
  const outroOut = legLen(prev.scale, R * 1.05);
  authored.push({ frame: B.outro.start, cam: prev });
  authored.push({ frame: B.outro.start + outroOut, cam: globeCam(prev.lon, 15, width, height, 0.42), easing: Easing.inOut(Easing.cubic) });
  authored.push({ frame: FRAMES, cam: globeCam(prev.lon + 20, 15, width, height, 0.42), easing: (x) => x });
  const keys = authored;
  const base = camAt(keys, frame);
  const cam = { ...base, scale: base.scale * CLEAR.camScale };
  const hide = panelHideAt(keys, frame);
  const active = STORIES.find((st) => frame >= B[st.id].start - 4 && frame < endOf(st.id));
  return (
    <LayoutCtx.Provider value={{ compact: true, panelScale: CLEAR.panelScale, panelHide: hide }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)" }}>
        {BEATS.map((b) => (
          <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
            <Html5Audio src={staticFile(b.file)} />
          </Sequence>
        ))}
        <Sounds />
        <MapFrame cam={cam} focusY={CLEAR.focusY}>
          <Sphere />
          <Raster layers={[{ name: "world", opacity: 0.9 }]} />
          <Borders />
          <Highlight ids={["404"]} opacity={interpolate(frame, [0, B.hook.end, B.hook.end + 10], [1, 1, 0], clamp)} />
          {STORIES.map((st) => {
            const b = B[st.id];
            const o = interpolate(frame, [b.start + 14, b.start + 28, endOf(st.id) - 6, endOf(st.id) + 6], [0, 1, 1, 0], clamp);
            return <Highlight key={st.id} ids={st.ids} opacity={o} />;
          })}
          <Typhoon />
          <StoryDots />
          {frame >= B.kim.start && frame < endOf("kim") && <Route from={PL.pyongyang} to={PL.dandong} start={B.kim.start + 30} end={wf("kim", "ตาน")} color={GOLD} />}
          {active?.pins.map((p) => (
            <PointLabel key={p.label} at={p.at} text={p.label} start={Math.max(B[active.id].start + 26, wf(active.id, p.word, 0.3))} color={RED} size={0.85} />
          ))}
          <HookPanel />
          <KenyaPanels />
          <FrancePanels />
          <WestBankPanels />
          <OleshkyPanels />
          <KimPanels />
          <SouthAfricaPanels />
          <TyphoonPanels />
          <BrazilPanels />
        </MapFrame>
        <TopBar />
        <HookTitle />
        {Object.entries(HEADS).map(([id, heads]) => (
          <HeadCard key={id} heads={heads} from={heads[0].f} to={id === "intro" ? B.intro.end + 6 : endOf(id)} />
        ))}
        <Outro />
        {BEATS.filter((b) => b.id !== "hook" && b.id !== "outro").map((b) => (
          <Caption key={b.id} text={b.text} spoken={b.spoken} words={b.words} start={b.start} len={b.len} font={font} top={CAPTION_TOP} />
        ))}
        {frame >= B.typhoon.start + 20 && frame < endOf("typhoon") && (
          <div style={{ position: "absolute", left: 50, top: height * 0.235, fontFamily: font, fontSize: 26, fontWeight: 700, color: "#ffd0a0", textShadow: "0 2px 8px #000" }}>เส้นทางพายุ: โดยประมาณ</div>
        )}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
