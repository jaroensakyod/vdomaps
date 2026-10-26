import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, Coin, CoinDefs, Cut, font, Plate, RealmFace, ReignFace, rollAt, thai, Tray, Velvet, type Metal } from "./kit/Coin";

// M21 coin reign: the first five reigns of the Chakri dynasty as struck coins on a velvet tray. The big coin flips
// to each reign (numeral face, years on the rim), a small coin of the same metal rolls into the timeline tray, and
// at the end the coin turns to its embossed map of the realm. 18 s. Coins are new designs, not real coins.
export const demo: StyleDemo = { id: "M21", name: "เหรียญรัชกาล", frames: 540, cover: 470, sizes: ["9x16"] };

const W = 1080;
const H = 1920;
type Reign = { n: number; a: number; b: number; metal: Metal; note: string };
const REIGNS: Reign[] = [
  { n: 1, a: 2325, b: 2352, metal: "bronze", note: "สถาปนากรุงรัตนโกสินทร์" },
  { n: 2, a: 2352, b: 2367, metal: "bronze", note: "ยุคทองของวรรณคดี" },
  { n: 3, a: 2367, b: 2394, metal: "silver", note: "สนธิสัญญาเบอร์นี พ.ศ. ๒๓๖๙" },
  { n: 4, a: 2394, b: 2411, metal: "silver", note: "สนธิสัญญาเบาว์ริง พ.ศ. ๒๓๙๘" },
  { n: 5, a: 2411, b: 2453, metal: "gold", note: "เลิกทาส · ปฏิรูปการปกครอง" },
];
const FLIPS = [40, 120, 195, 270, 345, 425]; // the last one turns to the realm face
const FLIP_LEN = 26;
const R = 400;
const CY = 790;
const TRAY = { x: 60, y: 1400, w: 960, h: 250 };
const r = 80;
const slotX = (i: number) => TRAY.x + 110 + i * 185;
const coinY = TRAY.y + TRAY.h - 54 - r + 6;

export const Demo = () => {
  const frame = useCurrentFrame();
  // which face the big coin shows: -1 = realm (start), 0..4 = reigns, 5 = realm (end)
  let stage = -1;
  let flip = 0;
  FLIPS.forEach((f, i) => {
    const p = interpolate(frame, [f, f + FLIP_LEN], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
    if (frame >= f) {
      stage = p < 0.5 ? i - 1 : i;
      flip = p;
    }
  });
  if (frame >= FLIPS[FLIPS.length - 1] + FLIP_LEN) flip = 0;
  else if (FLIPS.every((f) => frame < f || frame >= f + FLIP_LEN)) flip = 0;
  const reign = stage >= 0 && stage < 5 ? REIGNS[stage] : null;
  const metal: Metal = reign ? reign.metal : stage === 5 ? "gold" : "bronze";
  const push = interpolate(frame, [0, demo.frames], [1, 1.045], clamp);
  const bob = Math.sin(frame * 0.05) * 3;
  const on = interpolate(frame, [0, 18], [0, 1], clamp);
  const plateK = (i: number) => interpolate(frame, [FLIPS[i] + 13, FLIPS[i] + 28], [0, 1], clamp);
  const capIdx = Math.min(4, Math.max(0, stage));
  const capK = stage >= 0 ? interpolate(frame, [FLIPS[Math.min(stage, 5)] + 12, FLIPS[Math.min(stage, 5)] + 26], [0, 1], clamp) : 0;
  const end = stage === 5;
  return (
    <AbsoluteFill style={{ background: C.velvetDeep }}>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      {FLIPS.map((f) => <Sfx key={f} src={SFX.whoosh} at={f - 4} volume={0.22} />)}
      {FLIPS.slice(0, 5).map((f) => <Sfx key={f} src={SFX.tick} at={f + 13 + 36} volume={0.35} />)}
      <Sfx src={SFX.hit} at={FLIPS[5] + 14} volume={0.3} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: on }}>
        <CoinDefs />
        <Velvet w={W} h={H} pool={[540, CY]} />
        {/* the big coin */}
        <g transform={`translate(540 ${CY + bob}) scale(${push})`}>
          <Coin id="big" r={R} metal={metal} flip={flip} rim={reign ? `พ.ศ. ${thai(reign.a)} – ${thai(reign.b)} · ราชวงศ์จักรี ·` : end ? "ห้ารัชกาล · ๑๒๘ ปี · พ.ศ. ๒๓๒๕ – ๒๔๕๓ ·" : "ราชอาณาจักรสยาม · กรุงรัตนโกสินทร์ ·"}>
            {reign ? <ReignFace r={R} metal={metal} n={reign.n} /> : <RealmFace r={R} metal={metal} />}
          </Coin>
        </g>
        {/* caption plaque */}
        <Plate x={540} y={1222} w={880} h={130} k={capK}>
          <Cut x={540} y={1276} size={44}>
            {end ? "ห้ารัชกาล รวม ๑๒๘ ปี" : `รัชกาลที่ ${thai(REIGNS[capIdx].n)} · พ.ศ. ${thai(REIGNS[capIdx].a)}–${thai(REIGNS[capIdx].b)}`}
          </Cut>
          <Cut x={540} y={1326} size={34} weight={600} color="#5a3a0e">
            {end ? "จากสถาปนากรุงฯ ถึงสิ้นรัชกาลที่ ๕" : REIGNS[capIdx].note}
          </Cut>
        </Plate>
        <Tray {...TRAY} />
        {REIGNS.map((g, i) => {
          const land = FLIPS[i] + 13;
          if (frame < land) return null;
          const { x, spin } = rollAt(frame, land, land + 36, W + r * 1.4, slotX(i), r);
          return (
            <g key={i}>
              <g transform={`translate(${x} ${coinY})`}>
                <Coin id={`t${i}`} r={r} metal={g.metal} spin={spin} rim={`${thai(g.a)}–${thai(g.b)} ·`}>
                  <ReignFace r={r} metal={g.metal} n={g.n} />
                </Coin>
              </g>
            </g>
          );
        })}
        {/* year plates under the tray */}
        {REIGNS.map((g, i) => (
          <Plate key={i} x={slotX(i)} y={TRAY.y + TRAY.h + 22} w={166} h={52} k={plateK(i)}>
            <Cut x={slotX(i)} y={TRAY.y + TRAY.h + 58} size={27}>{`ร.${thai(g.n)} · ${thai(g.a)}`}</Cut>
          </Plate>
        ))}
      </svg>
      {/* kicker + title: letter-spaced brass over a polished white title */}
      <div style={{ position: "absolute", top: 86, left: 0, right: 0, textAlign: "center", fontFamily: font, opacity: interpolate(frame, [8, 26], [0, 1], clamp) }}>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, color: C.brass }}>M21 · เหรียญรัชกาล</div>
        <div style={{ width: 280, height: 2, margin: "14px auto 10px", background: `linear-gradient(90deg, transparent, ${C.brass}, transparent)` }} />
        <div style={{ fontSize: 70, fontWeight: 800, lineHeight: 1.15, color: C.text, textShadow: "0 2px 0 #000, 0 0 30px rgba(200,160,255,0.22)" }}>ห้ารัชกาลแรก</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#e4d6f2", marginTop: 4 }}>แห่งกรุงรัตนโกสินทร์</div>
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 24, color: "#b59bd3", letterSpacing: 1 }}>
        ภาพประกอบ · เหรียญออกแบบใหม่ ไม่ใช่เหรียญจริง · แผนที่แสดงเขตแดนปัจจุบัน
      </div>
    </AbsoluteFill>
  );
};
