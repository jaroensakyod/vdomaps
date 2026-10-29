import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, font, GOLD, RED } from "../news/kit";

// × Mumate overlays: the BaZi chart card, the luck-pillar ribbon, pillar characters slamming onto the map, the hook
// title and the Mumate call to action. HTML on top of the map, sized for 1080×1920.

export const EL = { wood: "#43b56a", fire: "#ef5b4f", earth: "#e0aa45", metal: "#d8dee6", water: "#4a8df0" } as const;
type El = keyof typeof EL;
const STEM: Record<string, [El, string]> = {
  甲: ["wood", "ไม้"], 乙: ["wood", "ไม้"], 丙: ["fire", "ไฟ"], 丁: ["fire", "ไฟ"], 戊: ["earth", "ดิน"],
  己: ["earth", "ดิน"], 庚: ["metal", "โลหะ"], 辛: ["metal", "โลหะ"], 壬: ["water", "น้ำ"], 癸: ["water", "น้ำ"],
};
const BRANCH: Record<string, [El, string]> = {
  子: ["water", "หนู"], 丑: ["earth", "วัว"], 寅: ["wood", "เสือ"], 卯: ["wood", "กระต่าย"], 辰: ["earth", "มังกร"],
  巳: ["fire", "งู"], 午: ["fire", "ม้า"], 未: ["earth", "แพะ"], 申: ["metal", "ลิง"], 酉: ["metal", "ไก่"],
  戌: ["earth", "หมา"], 亥: ["water", "หมู"],
};
// Mumate wordmark (white script, pink dot), from the brand file the user supplied.
export const MumateLogo = ({ h }: { h: number }) => <Img src={staticFile("brand/mumate-white.png")} style={{ height: h, width: h * 4.32 }} />;
const HAN = "'Noto Serif SC','Microsoft YaHei','SimSun',serif";

const useS = () => {
  const { width } = useVideoConfig();
  return width / 1080;
};

// One character tile in its element colour.
const Tile = ({ ch, size, glow = 0, dim = false }: { ch: string; size: number; glow?: number; dim?: boolean }) => {
  const el = (STEM[ch] ?? BRANCH[ch])?.[0];
  const c = el ? EL[el] : "#888";
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.16, display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, ${c}38, ${c}14)`, border: `${size * 0.035}px solid ${c}${dim ? "55" : "cc"}`,
      boxShadow: glow > 0 ? `0 0 ${size * 0.5 * glow}px ${c}` : "none", transform: `scale(${1 + 0.08 * glow})`,
      fontFamily: HAN, fontWeight: 700, fontSize: size * 0.62, color: dim ? "#8a8f98" : c, opacity: dim ? 0.7 : 1,
    }}>{ch}</div>
  );
};

// The chart: four columns (hour · day · month · year, right to left as in the books), hour unknown.
// `at` = keyframes of where the card sits: "big" (centre of the map area), "corner" (small, top right) or "off".
export type CardPos = "big" | "corner" | "off";
export const PILLARS: [string, string, string][] = [["ยาม", "?", "?"], ["วัน", "庚", "寅"], ["เดือน", "戊", "辰"], ["ปี", "甲", "寅"]];
export const BaziCard = ({ at, fill, glow = [] }: { at: [number, CardPos][]; fill: number[]; glow?: [number, number, string][] }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  const k = [...at].reverse().find(([f]) => frame >= f);
  if (!k) return null;
  const idx = at.indexOf(k);
  const prev = idx > 0 ? at[idx - 1][1] : "off";
  const t = spring({ frame: frame - k[0], fps, config: { damping: 18 } });
  const geo = (p: CardPos) => (p === "big" ? { x: 540, y: height / s * 0.2, sc: 1, o: 1 } : p === "corner" ? { x: 880, y: 250, sc: 0.42, o: 1 } : { x: 540, y: height / s * 0.2, sc: 0.85, o: 0 });
  const a = geo(prev);
  const b = geo(k[1]);
  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const sc = a.sc + (b.sc - a.sc) * t;
  const o = a.o + (b.o - a.o) * t;
  if (o <= 0.01) return null;
  const lit = (key: string) => glow.reduce((m, [f0, f1, kk]) => (kk === key ? Math.max(m, interpolate(frame, [f0, f0 + 8, f1 - 8, f1], [0, 1, 1, 0], clamp)) : m), 0);
  return (
    <div style={{ position: "absolute", left: x * s, top: y * s, width: 0, height: 0, opacity: o }}>
      <div style={{
        position: "absolute", left: -420 * s * sc, top: 0, width: 840 * s, transform: `scale(${sc})`, transformOrigin: "0 0",
        background: "linear-gradient(170deg, rgba(14,18,30,0.94), rgba(26,20,36,0.94))", borderRadius: 34 * s, padding: `${26 * s}px ${30 * s}px`,
        border: `${3 * s}px solid ${GOLD}aa`, boxShadow: "0 18px 60px rgba(0,0,0,0.6)", fontFamily: font, color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 * s }}>
          <div style={{ fontSize: 36 * s, fontWeight: 800, color: GOLD }}>ดวงพระเจ้าตาก</div>
          <div style={{ fontSize: 26 * s, opacity: 0.8 }}>17 เม.ย. 2277 · ชาย</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {PILLARS.map(([label, st, br], i) => {
            const shown = interpolate(frame, [fill[i] ?? 0, (fill[i] ?? 0) + 10], [0, 1], clamp);
            const unknown = st === "?";
            const pulse = unknown ? 0.5 + 0.5 * Math.sin(frame / 9) : 0;
            return (
              <div key={label} style={{ width: 180 * s, textAlign: "center", opacity: 0.25 + 0.75 * shown, transform: `translateY(${(1 - shown) * 30 * s}px)` }}>
                <div style={{ fontSize: 28 * s, marginBottom: 8 * s, color: unknown ? "#9aa" : "#fff", fontWeight: 700 }}>{label}</div>
                {unknown ? (
                  <div style={{ height: 330 * s, borderRadius: 24 * s, border: `${3 * s}px dashed #8a8f98`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120 * s, fontWeight: 900, color: `rgba(170,176,186,${0.55 + 0.35 * pulse})` }}>?</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s }}>
                    <Tile ch={st} size={150 * s} glow={lit(`${i}s`)} />
                    <Tile ch={br} size={150 * s} glow={lit(`${i}b`)} />
                  </div>
                )}
                <div style={{ fontSize: 26 * s, marginTop: 10 * s, color: "#d8d8d8" }}>{unknown ? "ไม่ทราบ" : `${STEM[st][1]}${BRANCH[br][1]}`}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 * s, fontSize: 22 * s, marginTop: 12 * s, opacity: 0.85 }}>คำนวณด้วยระบบ <MumateLogo h={34 * s} /></div>
      </div>
    </div>
  );
};

// A year (or luck) pillar chip with a star name: "丙戌 · ปีไฟหมา / 七杀 ดาวเจ็ดสังหาร".
export const YearChip = ({ gz, label, star, from, to, y = 0.47 }: { gz: string; label: string; star?: string; from: number; to: number; y?: number }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < from - 2 || frame > to + 10) return null;
  const k = spring({ frame: frame - from, fps, config: { damping: 13 } });
  const o = interpolate(frame, [from, from + 6, to, to + 10], [0, 1, 1, 0], clamp);
  const [a, b] = [...gz];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * y, display: "flex", justifyContent: "center", opacity: o, transform: `scale(${0.7 + 0.3 * k})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 * s, background: "rgba(12,14,24,0.92)", borderRadius: 28 * s, padding: `${16 * s}px ${28 * s}px`, border: `${3 * s}px solid ${GOLD}88`, fontFamily: font, color: "#fff" }}>
        <Tile ch={a} size={96 * s} />
        <Tile ch={b} size={96 * s} />
        <div>
          <div style={{ fontSize: 46 * s, fontWeight: 800 }}>{label}</div>
          {star && <div style={{ fontSize: 32 * s, color: GOLD, fontWeight: 700 }}>{star}</div>}
        </div>
      </div>
    </div>
  );
};

// Luck pillars, ten years each, with a playhead. `head` = keyframes [frame, cell index].
export const LUCK: [string, string][] = [["己巳", "2283"], ["庚午", "2293"], ["辛未", "2303"], ["壬申", "2313"], ["癸酉", "2323"]];
export const LuckRibbon = ({ show, head }: { show: [number, number][]; head: [number, number][] }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  const win = show.find(([a, b]) => frame >= a - 2 && frame <= b + 12);
  if (!win) return null;
  const o = interpolate(frame, [win[0], win[0] + 10, win[1], win[1] + 12], [0, 1, 1, 0], clamp);
  const h = [...head].reverse().find(([f]) => frame >= f);
  const hi = h ? h[1] : -1;
  const ht = h ? spring({ frame: frame - h[0], fps, config: { damping: 15 } }) : 0;
  return (
    <div style={{ position: "absolute", left: 40 * s, right: 40 * s, top: height * 0.465, opacity: o, fontFamily: font }}>
      <div style={{ color: GOLD, fontSize: 26 * s, fontWeight: 800, marginBottom: 6 * s, textShadow: "0 2px 8px #000" }}>วัยจร (ช่วงละ 10 ปี)</div>
      <div style={{ display: "flex", gap: 10 * s }}>
        {LUCK.map(([gz, yr], i) => {
          const on = i === hi ? ht : 0;
          const [a, b] = [...gz];
          const ca = EL[STEM[a][0]];
          return (
            <div key={gz} style={{ flex: 1, background: on > 0 ? `rgba(30,24,10,0.95)` : "rgba(10,12,20,0.85)", borderRadius: 18 * s, border: `${3 * s}px solid ${on > 0 ? GOLD : "#ffffff30"}`, padding: `${8 * s}px 0`, textAlign: "center", transform: `translateY(${-10 * s * on}px)`, boxShadow: on > 0 ? `0 0 ${30 * s * on}px ${GOLD}aa` : "none" }}>
              <div style={{ fontFamily: HAN, fontSize: 46 * s, fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{ color: ca }}>{a}</span><span style={{ color: EL[BRANCH[b][0]] }}>{b}</span>
              </div>
              <div style={{ fontSize: 22 * s, color: "#ddd" }}>{STEM[a][1]}{BRANCH[b][1]}</div>
              <div style={{ fontSize: 20 * s, color: on > 0 ? GOLD : "#999" }}>{yr}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Big characters slamming onto the screen (with a shock ring), optionally with a caption under them.
export const PillarSlam = ({ chars, at, until, text, y = 0.3, link }: { chars: string[]; at: number[]; until: number; text?: string; y?: number; link?: { f: number; color: string; mode: "bind" | "clash" } }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < at[0] - 2 || frame > until + 12) return null;
  const o = interpolate(frame, [until, until + 12], [1, 0], clamp);
  const lk = link ? interpolate(frame, [link.f, link.f + 14], [0, 1], clamp) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * y, opacity: o, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: (link?.mode === "bind" ? 140 - 90 * lk : 140) * s, position: "relative" }}>
        {chars.map((c, i) => {
          const f0 = at[i] ?? at[0];
          if (frame < f0) return <div key={i} style={{ width: 230 * s }} />;
          const k = spring({ frame: frame - f0, fps, config: { damping: 9, stiffness: 180 } });
          const ring = interpolate(frame - f0, [0, 18], [0, 1], clamp);
          const el = (STEM[c] ?? BRANCH[c])?.[0];
          const col = el ? EL[el] : GOLD;
          const shake = link?.mode === "clash" && lk > 0 && lk < 1 ? Math.sin(frame * 2.3 + i) * 8 * s : 0;
          return (
            <div key={i} style={{ width: 230 * s, position: "relative", transform: `translateX(${shake}px)` }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 260 * s * (0.4 + ring), height: 260 * s * (0.4 + ring), marginLeft: -130 * s * (0.4 + ring), marginTop: -130 * s * (0.4 + ring), borderRadius: "50%", border: `${6 * s}px solid ${col}`, opacity: 1 - ring }} />
              <div style={{ fontFamily: HAN, fontWeight: 900, fontSize: 230 * s, lineHeight: 1, color: col, transform: `scale(${2.2 - 1.2 * k})`, textShadow: `0 0 ${40 * s}px ${col}, 0 8px 30px rgba(0,0,0,0.9)`, WebkitTextStroke: `${3 * s}px rgba(0,0,0,0.5)` }}>{c}</div>
            </div>
          );
        })}
        {link && lk > 0 && (
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 120 * s, height: 120 * s, marginLeft: -60 * s, marginTop: -60 * s, borderRadius: "50%", background: `radial-gradient(${link.color}, transparent 70%)`, opacity: link.mode === "clash" ? (1 - lk) * 1.2 + 0.2 : lk }} />
        )}
      </div>
      {text && (
        <div style={{ marginTop: 18 * s, fontFamily: font, fontSize: 46 * s, fontWeight: 800, color: "#fff", textShadow: "0 4px 20px #000", opacity: interpolate(frame, [at[at.length - 1] + 6, at[at.length - 1] + 18], [0, 1], clamp) }}>{text}</div>
      )}
    </div>
  );
};

// Element cycle arrow: A → B (e.g. ดิน → โลหะ), shown in the map area.
export const Cycle = ({ from: a, to: b, label, start, end, y = 0.47 }: { from: El; to: El; label: string; start: number; end: number; y?: number }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const s = useS();
  if (frame < start - 2 || frame > end + 10) return null;
  const o = interpolate(frame, [start, start + 8, end, end + 10], [0, 1, 1, 0], clamp);
  const k = interpolate(frame, [start + 6, start + 26], [0, 1], clamp);
  const TH = { wood: "ไม้", fire: "ไฟ", earth: "ดิน", metal: "โลหะ", water: "น้ำ" };
  const Dot = ({ e }: { e: El }) => (
    <div style={{ width: 170 * s, height: 170 * s, borderRadius: "50%", background: `${EL[e]}30`, border: `${5 * s}px solid ${EL[e]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 * s, fontWeight: 800, color: EL[e] }}>{TH[e]}</div>
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * y, opacity: o, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 * s, background: "rgba(10,12,20,0.88)", borderRadius: 30 * s, padding: `${18 * s}px ${30 * s}px` }}>
        <Dot e={a} />
        <svg width={200 * s} height={60 * s} viewBox="0 0 200 60">
          <path d={`M10 30 H${10 + 160 * k}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
          {k > 0.95 && <path d="M160 10 L190 30 L160 50 Z" fill={GOLD} />}
        </svg>
        <Dot e={b} />
      </div>
      <div style={{ marginTop: 12 * s, fontSize: 40 * s, fontWeight: 800, color: "#fff", textShadow: "0 3px 14px #000" }}>{label}</div>
    </div>
  );
};

// Two short cards side by side ("หลักฐาน = เกิดอะไรขึ้น" / "ดวง = มุมมอง").
export const TwoCards = ({ a, b, from, to, y = 0.24 }: { a: [string, string]; b: [string, string]; from: number; to: number; y?: number }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < from - 2 || frame > to + 10) return null;
  const o = interpolate(frame, [from, from + 8, to, to + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * y, display: "flex", gap: 24 * s, opacity: o, fontFamily: font }}>
      {[a, b].map(([t, sub], i) => {
        const k = spring({ frame: frame - from - i * 10, fps, config: { damping: 14 } });
        return (
          <div key={t} style={{ flex: 1, background: "rgba(10,12,20,0.92)", border: `${4 * s}px solid ${i ? "#b48cff" : GOLD}`, borderRadius: 28 * s, padding: `${26 * s}px ${20 * s}px`, textAlign: "center", transform: `translateY(${(1 - k) * 40 * s}px)`, opacity: k }}>
            <div style={{ fontSize: 58 * s, fontWeight: 900, color: i ? "#cdb4ff" : GOLD }}>{t}</div>
            <div style={{ fontSize: 36 * s, color: "#fff", marginTop: 8 * s }}>{sub}</div>
          </div>
        );
      })}
    </div>
  );
};

// Hook title over the portrait: "เกิดปีเสือ / จบปีเสือ" with two 寅 tiles.
export const HookTitle = ({ end }: { end: number }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const s = useS();
  const o = interpolate(frame, [end - 4, end + 10], [1, 0], clamp);
  if (o <= 0) return null;
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.1, opacity: o, textAlign: "center", fontFamily: font, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.95)", transform: `scale(${pop})` }}>
      <Img src={staticFile("portraits/thaihistory/taksin_king.jpg")} style={{ width: 300 * s, height: 360 * s, objectFit: "cover", borderRadius: 26 * s, border: `${6 * s}px solid ${GOLD}`, boxShadow: "0 10px 50px rgba(0,0,0,0.8)" }} />
      <div style={{ fontSize: 24 * s, opacity: 0.85, marginTop: 4 * s }}>ภาพประกอบ</div>
      <div style={{ fontSize: 112 * s, fontWeight: 900, lineHeight: 1.15, marginTop: 6 * s }}>เกิด<span style={{ color: EL.wood }}>ปีเสือ</span></div>
      <div style={{ fontSize: 112 * s, fontWeight: 900, lineHeight: 1.1, color: GOLD }}>จบปีเสือ</div>
    </div>
  );
};

// Mumate call to action: a phone-style card with the element and luck pillar, no fake screenshot.
export const MumateCTA = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < from - 2 || frame > to + 10) return null;
  const o = interpolate(frame, [from, from + 10, to, to + 10], [0, 1, 1, 0], clamp);
  const k = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.12, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, fontFamily: font, transform: `translateY(${(1 - k) * 60 * s}px)` }}>
      <div style={{ width: 560 * s, borderRadius: 60 * s, background: "linear-gradient(170deg,#1b1530,#0f1a2a)", border: `${6 * s}px solid #ffffff22`, boxShadow: `0 20px 80px rgba(0,0,0,0.7), 0 0 60px ${GOLD}44`, padding: `${40 * s}px ${36 * s}px`, color: "#fff", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 * s }}><MumateLogo h={100 * s} /></div>
        <div style={{ fontSize: 30 * s, opacity: 0.85, marginBottom: 26 * s }}>ดวงปาจื้อใน LINE</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14 * s, marginBottom: 22 * s }}>
          {(["wood", "fire", "earth", "metal", "water"] as El[]).map((e, i) => {
            const on = interpolate(frame, [from + 20 + i * 8, from + 30 + i * 8], [0, 1], clamp);
            return <div key={e} style={{ width: 74 * s, height: 74 * s, borderRadius: "50%", background: `${EL[e]}${on > 0.5 ? "55" : "18"}`, border: `${4 * s}px solid ${EL[e]}`, transform: `scale(${0.6 + 0.4 * on})` }} />;
          })}
        </div>
        <div style={{ fontSize: 42 * s, fontWeight: 800 }}>ดวงคุณเป็นธาตุอะไร?</div>
        <div style={{ fontSize: 32 * s, opacity: 0.85, marginTop: 6 * s }}>ตอนนี้อยู่วัยจรแบบไหน</div>
        <div style={{ marginTop: 30 * s, background: GOLD, color: "#1a1206", borderRadius: 40 * s, padding: `${16 * s}px 0`, fontSize: 38 * s, fontWeight: 900 }}>ลิงก์ในคำอธิบาย</div>
      </div>
    </div>
  );
};

// Five-element poll for the comments.
export const ElementPoll = ({ from, to }: { from: number; to: number }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < from - 2 || frame > to + 10) return null;
  const o = interpolate(frame, [from, from + 10, to, to + 10], [0, 1, 1, 0], clamp);
  const TH: [El, string][] = [["wood", "ไม้"], ["fire", "ไฟ"], ["earth", "ดิน"], ["metal", "โลหะ"], ["water", "น้ำ"]];
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: height * 0.16, opacity: o, fontFamily: font, color: "#fff" }}>
      <div style={{ textAlign: "center", fontSize: 60 * s, fontWeight: 900, marginBottom: 24 * s, textShadow: "0 4px 20px #000" }}>คุณเป็นธาตุอะไร?</div>
      {TH.map(([e, t], i) => {
        const k = spring({ frame: frame - from - 6 - i * 6, fps, config: { damping: 14 } });
        return (
          <div key={e} style={{ display: "flex", alignItems: "center", gap: 20 * s, background: "rgba(10,12,20,0.9)", border: `${4 * s}px solid ${EL[e]}`, borderRadius: 26 * s, padding: `${14 * s}px ${26 * s}px`, marginBottom: 16 * s, transform: `translateX(${(1 - k) * 200 * s}px)`, opacity: k }}>
            <div style={{ width: 60 * s, height: 60 * s, borderRadius: "50%", background: EL[e] }} />
            <div style={{ fontSize: 50 * s, fontWeight: 800, color: EL[e] }}>{t}</div>
            {e === "metal" && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 * s }}>
                <div style={{ fontSize: 30 * s, opacity: 0.85 }}>เหมือนพระเจ้าตาก</div>
                <Img src={staticFile("portraits/thaihistory/taksin_king.jpg")} style={{ width: 70 * s, height: 70 * s, borderRadius: "50%", objectFit: "cover", border: `${3 * s}px solid ${EL.metal}` }} />
              </div>
            )}
          </div>
        );
      })}
      <div style={{ textAlign: "center", fontSize: 36 * s, marginTop: 10 * s, color: GOLD, fontWeight: 800 }}>คอมเมนต์บอกกันหน่อย</div>
    </div>
  );
};

// Three year chips in a row for the answer (ไฟหมา · ไฟหมู · น้ำเสือ).
export const ThreeYears = ({ from, to, items }: { from: number; to: number; items: [string, string, string, number][] }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const s = useS();
  if (frame < from - 2 || frame > to + 10) return null;
  const o = interpolate(frame, [from, from + 8, to, to + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 30 * s, right: 30 * s, top: height * 0.2, display: "flex", gap: 16 * s, opacity: o, fontFamily: font, color: "#fff" }}>
      {items.map(([gz, label, sub, f]) => {
        const k = spring({ frame: frame - f, fps, config: { damping: 13 } });
        const [a, b] = [...gz];
        return (
          <div key={gz} style={{ flex: 1, background: "rgba(10,12,20,0.92)", border: `${4 * s}px solid ${frame >= f ? GOLD : "#ffffff22"}`, borderRadius: 26 * s, padding: `${18 * s}px 0`, textAlign: "center", opacity: 0.3 + 0.7 * k, transform: `scale(${0.85 + 0.15 * k})` }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 * s }}><Tile ch={a} size={90 * s} /><Tile ch={b} size={90 * s} /></div>
            <div style={{ fontSize: 40 * s, fontWeight: 900, marginTop: 10 * s }}>{label}</div>
            <div style={{ fontSize: 28 * s, color: GOLD }}>{sub}</div>
          </div>
        );
      })}
    </div>
  );
};

export { RED };
