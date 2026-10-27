import { geoInterpolate } from "d3-geo";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, globeCam, type Cam, type CamKey } from "../../../components/camera";
import { Caption } from "../../../components/Caption";
import { countries, country } from "../../../components/data";
import { PointLabel } from "../../../components/Labels";
import { MapFrame, Sphere, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { Route } from "../../../components/Route";
import { Bed, Hit, SFX, Sfx, voiceSpans } from "../../../components/Sound";
import { CAPTION_TOP, font, GOLD, HeadCard, RED, type Head } from "../../thaihistory/news/kit";
import { clamp, ramp, Spiral } from "../e1021/Art";
import { B, BEATS, endOf, FRAMES, LAYOUT, PL, wf, type LL } from "./kit";
import { BurkinaPanels, ElNinoPanels, EV, FrancePanels, HaitiPanels, HookPanel, PhpPanels, RussiaPanels, SaudiPanels, TyphoonPanels } from "./Scenes";

// แผนที่ข่าวโลก · พฤหัส 22 ต.ค. 2569 — house standard + illustration style v2 + recorded SFX library.
export const E1022_FRAMES = FRAMES;
const EDITION = { title: "แผนที่ข่าวโลก", date: "พฤหัส 22 ต.ค. 2569" };

type Story = { id: string; ids: string[]; focus: LL; zoom: number; pins: { at: LL; label: string; word: string }[] };
const STORIES: Story[] = [
  { id: "php", ids: ["246", "528", "250"], focus: [14, 55], zoom: 3, pins: [{ at: PL.helsinki, label: "ฟินแลนด์", word: "ฟินแลนด์" }, { at: PL.hague, label: "เนเธอร์แลนด์", word: "เนเธอร์แลนด์" }, { at: PL.paris, label: "ฝรั่งเศส", word: "ฝรั่งเศส" }] },
  { id: "saudi", ids: ["682"], focus: [46, 25], zoom: 4, pins: [{ at: PL.dammam, label: "ดัมมาม", word: "สนาม" }] },
  { id: "russia", ids: ["643", "804"], focus: [32, 55], zoom: 3.6, pins: [{ at: PL.spb, label: "เซนต์ปีเตอร์สเบิร์ก", word: "ระหว่าง" }, { at: PL.kyiv, label: "เคียฟ", word: "เคียฟ" }] },
  { id: "france", ids: ["250"], focus: [2.5, 47], zoom: 6, pins: [{ at: PL.paris, label: "ปารีส", word: "มา" }] },
  { id: "burkina", ids: ["854"], focus: [-1.5, 12.5], zoom: 7, pins: [{ at: PL.ouaga, label: "วากาดูกู", word: "สภา" }] },
  { id: "haiti", ids: ["332", "222"], focus: [-80, 16], zoom: 3.6, pins: [{ at: PL.sansal, label: "ซานซัลวาดอร์", word: "ประธานาธิบดี" }, { at: PL.pap, label: "ปอร์โตแปรงซ์", word: "แก๊ง" }] },
  { id: "elnino", ids: [], focus: [-140, 2], zoom: 1.5, pins: [] },
  { id: "typhoon", ids: ["158", "392"], focus: [125, 26], zoom: 3.8, pins: [{ at: PL.okinawa, label: "โอกินาวา", word: "โอกินาวา" }] },
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
// El Niño: a warm anomaly tongue along the equatorial Pacific, growing as the beat runs.
const WarmPool = () => {
  const frame = useCurrentFrame();
  const { path, s } = useMap();
  const a = B.elnino.start + 10;
  if (frame < a || frame > endOf("elnino") + 10) return null;
  const k = ramp(frame, a, wf("elnino", "บันทึก"), Easing.inOut(Easing.quad)) * interpolate(frame, [endOf("elnino") - 6, endOf("elnino") + 10], [1, 0], clamp);
  const ring = (w: number, h: number): GeoJSON.Polygon => ({
    type: "Polygon",
    coordinates: [Array.from({ length: 49 }, (_, i) => {
      const t = (i / 48) * Math.PI * 2;
      return [-125 - (8 + 40 * k) * w * Math.cos(t), 0 + h * Math.sin(t)] as [number, number];
    })],
  });
  return (
    <g opacity={Math.min(1, k * 1.4)} style={{ mixBlendMode: "screen" }}>
      <path d={path(ring(1.1, 9)) ?? ""} fill="#ff6a00" opacity={0.25} style={{ filter: `blur(${14 * s}px)` }} />
      <path d={path(ring(0.8, 6)) ?? ""} fill="#ff3b30" opacity={0.4} style={{ filter: `blur(${10 * s}px)` }} />
      <path d={path(ring(0.45, 3.5)) ?? ""} fill="#ffd56b" opacity={0.45} style={{ filter: `blur(${6 * s}px)` }} />
    </g>
  );
};
// Champi: spiral moving north toward Okinawa (approximate).
const Typhoon = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = B.typhoon.start;
  if (frame < a || frame > endOf("typhoon") + 10) return null;
  const pos = geoInterpolate([123.5, 21], [126.5, 25])(ramp(frame, a, endOf("typhoon"), Easing.linear)) as LL;
  const p = projection(pos);
  const k = ramp(frame, a, a + 20) * interpolate(frame, [endOf("typhoon") - 6, endOf("typhoon") + 10], [1, 0], clamp);
  return p ? <Spiral x={p[0]} y={p[1]} r={120 * s} k={k} frame={frame} /> : null;
};
const StoryDots = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const a = wf("intro", "แปด");
  if (frame < a || frame > B.php.start + 20) return null;
  return (
    <g>
      {STORIES.map((st, i) => {
        const p = projection(st.pins[0]?.at ?? PL.nino);
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
  php: [
    { f: B.php.start + 6, tag: "1/8 · ยุโรป · ไซเบอร์", head: "ช่องโหว่ร้ายแรงใน PHP", stat: "9.2", label: "/ 10 ความรุนแรง" },
    { f: wf("php", "ฟินแลนด์"), tag: "1/8 · ยุโรป · ไซเบอร์", head: "เว็บรัฐบาลปิดหลายประเทศ", chips: [{ text: "ฟินแลนด์", f: wf("php", "ฟินแลนด์") }, { text: "เนเธอร์แลนด์", f: wf("php", "เนเธอร์แลนด์") }, { text: "ฝรั่งเศส", f: wf("php", "ฝรั่งเศส") }] },
    { f: wf("php", "ขณะ"), tag: "1/8 · ยุโรป · ไซเบอร์", head: "PHP ออกแพตช์แก้แล้ว", color: "#3fb950" },
  ],
  saudi: [
    { f: B.saudi.start + 6, tag: "2/8 · ซาอุดีอาระเบีย", head: "ฮูตีโจมตีสนามบินดัมมาม", stat: "1 · 8", label: "เสียชีวิต · บาดเจ็บ" },
    { f: wf("saudi", "สหรัฐ"), tag: "2/8 · ซาอุดีอาระเบีย", head: "สหรัฐฯ สั่งเจ้าหน้าที่ออกจากซาอุฯ" },
  ],
  russia: [
    { f: B.russia.start + 6, tag: "3/8 · รัสเซีย", head: "ปล่อยตัวชาวอเมริกัน", stat: "74", label: "ปี · สตีเฟน ฮับบาร์ด" },
    { f: wf("russia", "เค"), tag: "3/8 · รัสเซีย · ยูเครน", head: "พร้อมเจรจาสามฝ่าย", stat: "พ.ย.", color: GOLD },
    { f: wf("russia", "แต่"), tag: "3/8 · ยูเครน", head: "ขีปนาวุธยังถล่มเคียฟ" },
  ],
  france: [
    { f: B.france.start + 6, tag: "4/8 · ฝรั่งเศส", head: "มาครงตอกกลับทรัมป์", color: "#4fa3ff" },
    { f: wf("france", "ว่า", 0.8, 1), tag: "4/8 · ฝรั่งเศส", head: "“รับไม่ได้ และโง่เขลา”", color: "#4fa3ff" },
  ],
  burkina: [
    { f: B.burkina.start + 6, tag: "5/8 · บูร์กินาฟาโซ", head: "สภานำโทษประหารกลับมา", stat: (f) => `${Math.round(interpolate(f, [wf("burkina", "โหวต"), EV.vote], [0, 71], clamp))}–0`, label: "เสียง" },
    { f: wf("burkina", "องค์กร"), tag: "5/8 · บูร์กินาฟาโซ", head: "HRW ห่วงใช้เล่นงานผู้เห็นต่าง", color: GOLD },
  ],
  haiti: [
    { f: B.haiti.start + 6, tag: "6/8 · เฮติ · เอลซัลวาดอร์", head: "แก๊งจับตัวประกัน", stat: "4", label: "นาย กองกำลังปราบแก๊ง" },
    { f: wf("haiti", "และ"), tag: "6/8 · เฮติ", head: "บูเคเลสั่งปฏิบัติการชิงตัว", color: GOLD },
  ],
  elnino: [
    { f: B.elnino.start + 6, tag: "7/8 · แปซิฟิก · ภูมิอากาศ", head: "WMO เตือนเอลนีโญแรงสุดเป็นประวัติการณ์", color: GOLD },
    { f: wf("elnino", "ผิวน้ำ"), tag: "7/8 · แปซิฟิก · ภูมิอากาศ", head: "ผิวน้ำร้อนกว่าปกติ", stat: "+3.8°C", label: "สถิติเดิม 2.6°C", color: RED },
  ],
  typhoon: [
    { f: B.typhoon.start + 6, tag: "8/8 · ไต้หวัน · ญี่ปุ่น", head: "ไต้ฝุ่นจำปี ป่วนการบิน", stat: "125", label: "เที่ยวบินไต้หวัน", color: GOLD },
    { f: wf("typhoon", "สาย"), tag: "8/8 · ไต้หวัน · ญี่ปุ่น", head: "ญี่ปุ่นยกเลิกอีก", stat: "100+", label: "เที่ยว", color: GOLD },
    { f: wf("typhoon", "ก่อน"), tag: "8/8 · ญี่ปุ่น", head: "ถึงโอกินาวา ศุกร์–เสาร์", color: GOLD },
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
      <span style={{ background: RED, padding: `${4 * s}px ${18 * s}px`, borderRadius: 8 * s, fontSize: 34 * s, fontWeight: 900 }}>ด่วน · ยุโรป · ไซเบอร์</span>
      <div style={{ fontSize: 96 * s, fontWeight: 900, marginTop: 18 * s, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>AI เจอช่องโหว่</div>
      <div style={{ fontSize: 80 * s, fontWeight: 900, color: "#ff6b5f", textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>เว็บรัฐบาลยุโรปดับ</div>
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
      {/* hook: control room, screens dying */}
      <Bed id="server_hum" from={0} to={B.intro.start + 10} volume={0.35} fade={6} voice={voice} />
      <Bed id="alarm_facility" from={20} to={B.hook.end + 10} volume={0.12} fade={10} voice={voice} />
      {EV.hookOff.map((f, i) => <Hit key={`ho${i}`} id={i % 2 ? "electric_switch" : "power_glitch"} at={f + 6} volume={0.45} />)}
      <Sfx src={SFX.swell} at={B.intro.start} volume={0.3} />
      {/* PHP */}
      <Bed id="keyboard_typing" from={B.php.start + 20} to={wf("php", "ฟินแลนด์") + 14} volume={0.25} voice={voice} />
      <Bed id="server_hum" from={wf("php", "ฟินแลนด์")} to={e("php")} volume={0.25} voice={voice} />
      {EV.phpRed.filter((_, i) => i % 2 === 0).map((f, i) => <Hit key={`pr${i}`} id="electric_switch" at={f} volume={0.35} />)}
      {/* Saudi */}
      <Bed id="airport_crowd" from={B.saudi.start} to={e("saudi")} volume={0.22} voice={voice} />
      <Hit id="explosion_mid" at={EV.saudiHit} volume={0.6} />
      <Hit id="jet_flyover" at={wf("saudi", "เสีย") + 20} volume={0.35} />
      {/* Russia */}
      <Hit id="prison_door" at={EV.prisonDoor + 8} volume={0.5} />
      <Bed id="wind" from={wf("russia", "แต่")} to={e("russia")} volume={0.18} voice={voice} />
      <Hit id="shell_incoming" at={EV.kyivHit} volume={0.4} />
      <Hit id="explosion_big" at={EV.kyivHit} volume={0.65} />
      <Bed id="fire_crackle" from={EV.kyivHit} to={e("russia")} volume={0.2} voice={voice} />
      {/* France */}
      <Bed id="crowd_riot" from={wf("france", "ที่")} to={wf("france", "ว่า", 0.8, 1) + 14} volume={0.2} voice={voice} />
      {/* Burkina */}
      <Hit id="applause_conference" at={EV.vote} volume={0.45} />
      <Hit id="wood_hit" at={EV.scale} volume={0.5} />
      <Bed id="crowd_protest" from={wf("burkina", "องค์กร")} to={e("burkina")} volume={0.16} voice={voice} />
      {/* Haiti */}
      <Bed id="firefight" from={wf("haiti", "แก๊ง")} to={wf("haiti", "และ") + 14} volume={0.12} voice={voice} />
      <Bed id="helicopter" from={wf("haiti", "และ")} to={e("haiti")} volume={0.35} voice={voice} />
      {/* El Niño */}
      <Bed id="sea_rough" from={B.elnino.start} to={wf("elnino", "ช่วง") + 14} volume={0.18} voice={voice} />
      <Bed id="rain_heavy" from={wf("elnino", "ช่วง")} to={e("elnino")} volume={0.18} voice={voice} />
      {/* Typhoon */}
      <Bed id="wind_storm" from={B.typhoon.start} to={wf("typhoon", "ไต้หวัน") + 14} volume={0.3} voice={voice} />
      <Bed id="airport_crowd" from={wf("typhoon", "ไต้หวัน")} to={wf("typhoon", "ก่อน") + 14} volume={0.2} voice={voice} />
      <Bed id="storm" from={wf("typhoon", "ก่อน")} to={e("typhoon") + 20} volume={0.3} voice={voice} />
      <Hit id="thunder_close" at={wf("typhoon", "โอกินาวา")} volume={0.45} />
      {/* UI */}
      {STORIES.map((st) => <Sfx key={st.id} src={SFX.whoosh} at={B[st.id].start - 12} volume={0.25} />)}
    </>
  );
};

/* ---------------- composition ---------------- */
export const WorldNews1022 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const R = Math.min(width, height) * 0.42;
  const lift = height > width ? 0.085 : 0;
  const target = (st: { focus: LL; zoom: number }): Cam => {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    return { lon: st.focus[0], lat: st.focus[1] - (height * lift) / pxPerDeg, scale: R * st.zoom };
  };
  const hookCam = target({ focus: [14, 56], zoom: 3.4 });
  const keys: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: B.hook.end, cam: { ...hookCam, scale: hookCam.scale * 1.06 }, easing: (t) => t },
    { frame: B.intro.start + 30, cam: globeCam(40, 25, width, height, 0.42), easing: Easing.inOut(Easing.cubic) },
    { frame: B.intro.end, cam: globeCam(20, 35, width, height, 0.42), easing: (t) => t },
  ];
  let prev: Cam = keys[keys.length - 1].cam;
  for (const st of STORIES) {
    const b = B[st.id];
    const t = target(st);
    const ip = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat]) as unknown as ((k: number) => [number, number]) & { distance: number };
    const [mlon, mlat] = ip(0.5);
    const far = ip.distance > 0.6 ? 1.05 : Math.max(1.05, (t.scale / R) * 0.45);
    keys.push({ frame: b.start - 12, cam: prev });
    keys.push({ frame: b.start + 6, cam: { lon: mlon, lat: mlat, scale: R * far }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: b.start + 26, cam: t, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: b.end, cam: { ...t, scale: t.scale * 1.06 }, easing: (x) => x });
    prev = { ...t, scale: t.scale * 1.06 };
  }
  keys.push({ frame: B.outro.start, cam: prev });
  keys.push({ frame: B.outro.start + 30, cam: globeCam(prev.lon, 15, width, height, 0.42), easing: Easing.inOut(Easing.cubic) });
  keys.push({ frame: FRAMES, cam: globeCam(prev.lon + 20, 15, width, height, 0.42), easing: (x) => x });
  const cam = camAt(keys, frame);
  const active = STORIES.find((st) => frame >= B[st.id].start - 4 && frame < endOf(st.id));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0b1830 0%, #02060d 70%)" }}>
      {BEATS.map((b) => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.len + LAYOUT.gap}>
          <Html5Audio src={staticFile(b.file)} />
        </Sequence>
      ))}
      <Sounds />
      <MapFrame cam={cam}>
        <Sphere />
        <Raster layers={[{ name: "world", opacity: 0.9 }]} />
        <Borders />
        <Highlight ids={["246", "528", "250"]} opacity={interpolate(frame, [0, B.hook.end, B.hook.end + 10], [1, 1, 0], clamp)} />
        {STORIES.map((st) => {
          const b = B[st.id];
          const o = interpolate(frame, [b.start + 14, b.start + 28, endOf(st.id) - 6, endOf(st.id) + 6], [0, 1, 1, 0], clamp);
          return <Highlight key={st.id} ids={st.ids} opacity={o} />;
        })}
        <WarmPool />
        <Typhoon />
        <StoryDots />
        {frame >= wf("haiti", "แก๊ง") && frame < endOf("haiti") && <Route from={PL.sansal} to={PL.pap} start={wf("haiti", "แก๊ง") - 20} end={wf("haiti", "แก๊ง") + 20} color={GOLD} />}
        {active?.pins.map((p) => (
          <PointLabel key={p.label} at={p.at} text={p.label} start={Math.max(B[active.id].start + 26, wf(active.id, p.word, 0.3))} color={RED} size={0.85} />
        ))}
        <HookPanel />
        <PhpPanels />
        <SaudiPanels />
        <RussiaPanels />
        <FrancePanels />
        <BurkinaPanels />
        <HaitiPanels />
        <ElNinoPanels />
        <TyphoonPanels />
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
      {frame >= B.elnino.start + 20 && frame < endOf("elnino") && (
        <div style={{ position: "absolute", left: 50, top: height * 0.44, fontFamily: font, fontSize: 26, fontWeight: 700, color: "#ffd0a0", textShadow: "0 2px 8px #000" }}>แถบน้ำอุ่น: ภาพประกอบ ไม่ใช่ข้อมูลจริง</div>
      )}
    </AbsoluteFill>
  );
};
