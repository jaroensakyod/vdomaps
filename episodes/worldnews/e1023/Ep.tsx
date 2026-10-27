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
import { AbyeiPanels, BrazilPanels, EV, HookPanel, IndiaPanels, KoreaPanels, SaudiPanels, TyphoonPanels, UkrainePanels, VolvoPanels } from "./Scenes";

// แผนที่ข่าวโลก · ศุกร์ 23 ต.ค. 2569 — house standard + illustration style v2 + recorded SFX + clear layout (rule 9).
export const E1023_FRAMES = FRAMES;
const EDITION = { title: "แผนที่ข่าวโลก", date: "ศุกร์ 23 ต.ค. 2569" };

type Story = { id: string; ids: string[]; focus: LL; zoom: number; pins: { at: LL; label: string; word: string }[] };
const STORIES: Story[] = [
  { id: "abyei", ids: ["729", "728"], focus: [29.5, 10], zoom: 5, pins: [{ at: PL.abyei, label: "อาบเยย์", word: "อาบ" }] },
  { id: "typhoon", ids: ["158"], focus: [121.5, 23.8], zoom: 9, pins: [{ at: PL.taipei, label: "ไทเป", word: "ไต้หวัน" }, { at: PL.liuqiu, label: "หลิวฉิว", word: "เสีย" }] },
  { id: "ukraine", ids: ["804", "643"], focus: [34, 52.5], zoom: 4.2, pins: [{ at: PL.kyiv, label: "เคียฟ", word: "เคียฟ" }, { at: PL.moscow, label: "มอสโก", word: "มอสโก" }] },
  { id: "saudi", ids: ["682", "818"], focus: [40, 23], zoom: 3, pins: [{ at: PL.riyadh, label: "ริยาด", word: "สกัด" }, { at: PL.cairo, label: "ไคโร", word: "อียิปต์" }] },
  { id: "korea", ids: ["410"], focus: [124, 36.5], zoom: 5, pins: [{ at: PL.seoul, label: "โซล", word: "หุ้น" }] },
  { id: "volvo", ids: ["752"], focus: [15, 61], zoom: 4.2, pins: [{ at: PL.gothenburg, label: "โกเธนเบิร์ก", word: "วอล" }] },
  { id: "india", ids: ["616", "356"], focus: [50, 40], zoom: 1.8, pins: [{ at: PL.warsaw, label: "วอร์ซอ", word: "โปแลนด์" }, { at: PL.delhi, label: "นิวเดลี", word: "เยือน" }] },
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
// Champi: spiral passing off Taiwan's east coast toward Japan's southwestern islands (approximate track).
const Typhoon = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = B.typhoon.start;
  if (frame < a || frame > endOf("typhoon") + 10) return null;
  const pos = geoInterpolate([122.8, 22.3], [123.6, 25.4])(ramp(frame, a, endOf("typhoon"), Easing.linear)) as LL;
  const p = projection(pos);
  const k = ramp(frame, a, a + 20) * interpolate(frame, [endOf("typhoon") - 6, endOf("typhoon") + 10], [1, 0], clamp);
  return p ? <Spiral x={p[0]} y={p[1]} r={150 * s} k={k} frame={frame} /> : null;
};
const StoryDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = wf("intro", "แปด");
  if (frame < a || frame > B.abyei.start + 20) return null;
  return (
    <g>
      {STORIES.map((st, i) => {
        const p = projection(st.pins[st.pins.length - 1].at);
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
  abyei: [
    { f: B.abyei.start + 6, tag: "1/8 · ซูดาน · ซูดานใต้", head: "โดรนโจมตีตลาดในอาบเยย์", stat: "≥153", label: "เสียชีวิต" },
    { f: wf("abyei", "นาย"), tag: "1/8 · ซูดาน · ซูดานใต้", head: "ทหารซูดานอ้างเป้าคือรถน้ำมัน RSF", label: "ยังไม่ยืนยัน", color: GOLD },
  ],
  typhoon: [
    { f: B.typhoon.start + 6, tag: "2/8 · ไต้หวัน", head: "ไต้ฝุ่นจำปีปิดเกือบทั้งเกาะ", color: GOLD },
    { f: wf("typhoon", "ยกเลิก"), tag: "2/8 · ไต้หวัน", head: "ยกเลิกเที่ยวบิน", stat: "931", label: "เที่ยว", color: GOLD },
    { f: wf("typhoon", "เสีย"), tag: "2/8 · ไต้หวัน", head: "เสียชีวิต 1 · เจ็บอย่างน้อย 94" },
  ],
  ukraine: [
    { f: B.ukraine.start + 6, tag: "3/8 · ยูเครน · รัสเซีย", head: "ขีปนาวุธหัวรบลูกปรายถล่มเคียฟ" },
    { f: wf("ukraine", "ไฟ"), tag: "3/8 · ยูเครน", head: "ไฟดับ", stat: "500,000+", label: "คน", color: GOLD },
    { f: wf("ukraine", "ส่วน"), tag: "3/8 · รัสเซีย", head: "โดรนยูเครนบุกเขตมอสโก", stat: "~600", label: "ลำ" },
  ],
  saudi: [
    { f: B.saudi.start + 6, tag: "4/8 · ซาอุดีอาระเบีย", head: "สกัดขีปนาวุธ-โดรนฮูตีอีกระลอก" },
    { f: wf("saudi", "อียิปต์"), tag: "4/8 · ซาอุดีอาระเบีย · อียิปต์", head: "อียิปต์พร้อมช่วยป้องกันซาอุฯ", color: GOLD },
  ],
  korea: [
    { f: B.korea.start + 6, tag: "5/8 · เกาหลีใต้ · ตลาดหุ้น", head: "หุ้นชิปยังร่วงต่อ" },
    { f: wf("korea", "ซัม"), tag: "5/8 · เกาหลีใต้ · ตลาดหุ้น", head: "1 สัปดาห์ 12–16 ต.ค.", stat: "−24%", label: "SK hynix" },
  ],
  volvo: [
    { f: B.volvo.start + 6, tag: "6/8 · สวีเดน · ธุรกิจ", head: "วอลโว่ คาร์ส ขาดทุนไตรมาส 3", stat: "−3.7", label: "พันล้านโครนา" },
    { f: wf("volvo", "ประกาศ"), tag: "6/8 · สวีเดน · ธุรกิจ", head: "ลดพนักงานทั่วโลก", stat: "2,500", label: "ตำแหน่ง" },
  ],
  india: [{ f: B.india.start + 6, tag: "7/8 · อินเดีย · โปแลนด์", head: "นายกฯ โปแลนด์เยือนอินเดีย", stat: "16", label: "ปี ครั้งแรกในรอบ", color: GOLD }],
  brazil: [
    { f: B.brazil.start + 6, tag: "8/8 · บราซิล", head: "เลือกตั้งรอบสอง อาทิตย์ 25 ต.ค.", color: "#3fb950" },
    { f: wf("brazil", "โพล"), tag: "8/8 · บราซิล", head: "โพลสูสี ในค่าคลาดเคลื่อน", stat: "47–45", label: "Datafolha", color: GOLD },
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
      <span style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontSize: 34 * s, fontWeight: 900 }}>ด่วน · ซูดาน · ซูดานใต้</span>
      <div style={{ fontSize: 96 * s, fontWeight: 900, marginTop: 18 * s, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>โดรนถล่มตลาด</div>
      <div style={{ fontSize: 80 * s, fontWeight: 900, color: "#ff6b5f", textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>ตายอย่างน้อย 153 คน</div>
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
      {/* hook: market, drone, blast */}
      <Bed id="city_crowd" from={0} to={EV.hookHit + 4} volume={0.3} fade={6} voice={voice} />
      <Hit id="explosion_big" at={EV.hookHit} volume={0.7} />
      <Bed id="fire_crackle" from={EV.hookHit} to={B.intro.start + 10} volume={0.25} voice={voice} />
      <Sfx src={SFX.swell} at={B.intro.start} volume={0.3} />
      {/* Abyei */}
      <Bed id="wind" from={B.abyei.start} to={wf("abyei", "โดรน") + 14} volume={0.18} voice={voice} />
      <Bed id="city_crowd" from={wf("abyei", "โดรน")} to={EV.abyeiHit + 4} volume={0.22} voice={voice} />
      <Hit id="explosion_mid" at={EV.abyeiHit} volume={0.6} />
      <Bed id="fire_big" from={EV.abyeiHit} to={wf("abyei", "นาย") + 14} volume={0.2} voice={voice} />
      <Bed id="wind" from={wf("abyei", "นาย")} to={e("abyei")} volume={0.15} voice={voice} />
      {/* Typhoon */}
      <Bed id="wind_storm" from={B.typhoon.start} to={wf("typhoon", "ยกเลิก") + 14} volume={0.3} voice={voice} />
      <Bed id="rain_heavy" from={wf("typhoon", "ปิด")} to={wf("typhoon", "ยกเลิก") + 14} volume={0.2} voice={voice} />
      <Bed id="airport_crowd" from={wf("typhoon", "ยกเลิก")} to={wf("typhoon", "เสีย") + 14} volume={0.2} voice={voice} />
      <Bed id="sea_rough" from={wf("typhoon", "เสีย")} to={e("typhoon")} volume={0.3} voice={voice} />
      <Hit id="splash_big" at={EV.waveHit} volume={0.5} />
      {/* Ukraine */}
      <Hit id="shell_incoming" at={EV.kyivHit - 20} volume={0.4} />
      {EV.kyivBomblets.map((f, i) => <Hit key={`kb${i}`} id={i % 2 ? "explosion_far" : "explosion_mid"} at={f} volume={0.45} />)}
      <Bed id="fire_crackle" from={EV.kyivHit + 10} to={wf("ukraine", "ไม่") + 14} volume={0.2} voice={voice} />
      <Hit id="power_glitch" at={wf("ukraine", "ดับ")} volume={0.45} />
      <Bed id="wind" from={wf("ukraine", "ไฟ")} to={wf("ukraine", "ส่วน") + 14} volume={0.15} voice={voice} />
      <Bed id="plane_prop_loop" from={wf("ukraine", "ส่วน")} to={e("ukraine")} volume={0.18} voice={voice} />
      {/* Saudi */}
      <Bed id="wind" from={B.saudi.start} to={wf("saudi", "สกัด") + 14} volume={0.15} voice={voice} />
      <Hit id="jet_flyover" at={B.saudi.start + 20} volume={0.3} />
      {EV.intercepts.map((f, i) => <Hit key={`ic${i}`} id="explosions_distant" at={f} volume={0.45} />)}
      <Bed id="army_marching" from={wf("saudi", "อียิปต์")} to={e("saudi")} volume={0.15} voice={voice} />
      {/* Korea */}
      <Bed id="keyboard_typing" from={B.korea.start} to={wf("korea", "ซัม") + 14} volume={0.22} voice={voice} />
      <Bed id="server_hum" from={wf("korea", "ซัม")} to={e("korea")} volume={0.2} voice={voice} />
      <Hit id="wood_break" at={wf("korea", "กลัว") + 8} volume={0.35} />
      {/* Volvo */}
      <Bed id="server_hum" from={B.volvo.start} to={wf("volvo", "ขาดทุน") + 14} volume={0.25} voice={voice} />
      <Hit id="electric_switch" at={wf("volvo", "ขาดทุน")} volume={0.35} />
      <Bed id="city_crowd" from={wf("volvo", "ประกาศ")} to={e("volvo")} volume={0.15} voice={voice} />
      {/* India */}
      <Hit id="jet_flyover" at={B.india.start + 16} volume={0.4} />
      <Bed id="applause_conference" from={wf("india", "หารือ")} to={wf("india", "อวกาศ") + 14} volume={0.15} voice={voice} />
      {/* Brazil */}
      <Bed id="crowd_cheer" from={B.brazil.start} to={wf("brazil", "ระหว่าง") + 14} volume={0.15} voice={voice} />
      <Bed id="city_crowd" from={wf("brazil", "ระหว่าง")} to={e("brazil")} volume={0.12} voice={voice} />
      {/* UI */}
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={B[st.id].start - 12} volume={0.25} />)}
    </>
  );
};

/* ---------------- composition ---------------- */
export const WorldNews1023 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.min(width, height) * 0.42;
  const target = (st: { focus: LL; zoom: number }): Cam => ({ lon: st.focus[0], lat: st.focus[1], scale: R * st.zoom });
  const hookCam = target({ focus: [29.5, 10], zoom: 5 });
  const authored: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: B.hook.end, cam: { ...hookCam, scale: hookCam.scale * 1.06 }, easing: (t) => t },
    { frame: B.intro.start + 30, cam: globeCam(40, 25, width, height, 0.42), easing: Easing.inOut(Easing.cubic) },
    { frame: B.intro.end, cam: globeCam(30, 20, width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = authored[authored.length - 1].cam;
  for (const st of STORIES) {
    const b = B[st.id];
    const t = target(st);
    const ip = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat]) as unknown as ((k: number) => [number, number]) & { distance: number };
    const [mlon, mlat] = ip(0.5);
    const far = ip.distance > 0.6 ? 1.05 : Math.max(1.05, (t.scale / R) * 0.45);
    authored.push({ frame: b.start - 24, cam: prev });
    authored.push({ frame: b.start + 4, cam: { lon: mlon, lat: mlat, scale: R * far }, easing: Easing.inOut(Easing.quad) });
    authored.push({ frame: b.start + 26, cam: t, easing: Easing.out(Easing.cubic) });
    prev = t;
  }
  authored.push({ frame: B.outro.start, cam: prev });
  authored.push({ frame: B.outro.start + 30, cam: globeCam(prev.lon, 15, width, height, 0.42), easing: Easing.inOut(Easing.cubic) });
  authored.push({ frame: FRAMES, cam: globeCam(prev.lon + 20, 15, width, height, 0.42), easing: (x) => x });
  // Authored keys already hold still between stories and move only across the cut (start − 24 → start + 26; 28 frames out so big zooms do not trip check-glitch);
  // holdAndMove would stretch these long pans to ~4 s and tuck each story's last panel away early.
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
          <Highlight ids={["729", "728"]} opacity={interpolate(frame, [0, B.hook.end, B.hook.end + 10], [1, 1, 0], clamp)} />
          {STORIES.map((st) => {
            const b = B[st.id];
            const o = interpolate(frame, [b.start + 14, b.start + 28, endOf(st.id) - 6, endOf(st.id) + 6], [0, 1, 1, 0], clamp);
            return <Highlight key={st.id} ids={st.ids} opacity={o} />;
          })}
          <Typhoon />
          <StoryDots />
          {frame >= B.ukraine.start && frame < endOf("ukraine") && <Route from={PL.moscow} to={PL.kyiv} start={B.ukraine.start + 26} end={EV.kyivHit} color={RED} />}
          {frame >= wf("ukraine", "ส่วน") && frame < endOf("ukraine") && <Route from={PL.kyiv} to={PL.moscow} start={wf("ukraine", "ส่วน")} end={wf("ukraine", "มอสโก")} color={GOLD} />}
          {frame >= wf("saudi", "อียิปต์") && frame < endOf("saudi") && <Route from={PL.cairo} to={PL.riyadh} start={wf("saudi", "อียิปต์")} end={wf("saudi", "อียิปต์") + 30} color={GOLD} />}
          {frame >= B.india.start && frame < endOf("india") && <Route from={PL.warsaw} to={PL.delhi} start={B.india.start + 26} end={wf("india", "เยือน") + 30} color={GOLD} />}
          {active?.pins.map((p) => (
            <PointLabel key={p.label} at={p.at} text={p.label} start={Math.max(B[active.id].start + 26, wf(active.id, p.word, 0.3))} color={RED} size={0.85} />
          ))}
          <HookPanel />
          <AbyeiPanels />
          <TyphoonPanels />
          <UkrainePanels />
          <SaudiPanels />
          <KoreaPanels />
          <VolvoPanels />
          <IndiaPanels />
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
