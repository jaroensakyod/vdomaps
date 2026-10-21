import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { camAt, camForFeature, globeCam } from "../../../components/camera";
import { MapFrame } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX, Sfx } from "../../../components/Sound";
import { buildBeats } from "../../../components/subs.mjs";
import { CharacterCard, PortraitCard, Seal, SideCard, StatCard, TitleCard } from "../kit/Cards";
import { ERAS, YELLOW_TURBAN_RISINGS } from "../kit/eras";
import { EpisodeFrame, timeline, type EpisodeMeta, type Variant } from "../kit/Frame";
import { Flames, Tint } from "../kit/Marks";
import { at as place } from "../kit/places";
import { Chest, DryField, EarthWall, Hall, HanFigure, OfficeGate } from "../kit/Scenes";
import { EraMap, YearBadge } from "../kit/Scoreboard";
import { Badge, C, fade, fonts, InkLabel, PaperMap, useUnit } from "../kit/theme";
import beatsText from "./beats.json";
import timing from "./timing.json";

// ตอนที่ 1 · ฟ้าเหลืองจะขึ้นแทน (ค.ศ. 184)
export const EP: EpisodeMeta = { n: 1, title: "ฟ้าเหลืองจะขึ้นแทน", next: "สวนท้อที่ไม่มีอยู่จริง", nextQ: ["คนใจดีที่สุดในสามก๊ก", "เฆี่ยนขุนนาง 200 ที?"], ask: "ถ้าเป็นคุณ จะเข้าร่วมกบฏผ้าเหลืองไหม?" };
export const BEATS = buildBeats(timing, beatsText);
const { B, at, word } = timeline(BEATS);
export const THUMB = at("slogan", 0.5); // thumbnail frame

const NORTH = bbox([[111.5, 34.2], [119.5, 41]]);
const ZHUO = bbox([[114.6, 38.6], [117.4, 40.3]]);
const ZHUO_AT = place("zhuo");
// More fires around each rising for the "spread" beat (illustrative, not specific towns).
const SPREAD = YELLOW_TURBAN_RISINGS.flatMap((r): [number, number][] => [
  [r.at[0] + 0.9, r.at[1] + 0.5],
  [r.at[0] - 0.8, r.at[1] - 0.6],
]);

const Court = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("why", 0.3)} to={B.zhangjiao.start + 6}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ค.ศ. 184 · ฮั่นใกล้ล่ม</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.6 }}>
        <b>ในวัง:</b> ขันทีกุมอำนาจ
        <br />
        <b>นอกวัง:</b> ภัยแล้ง ชาวนาอดตาย
      </div>
    </SideCard>
  );
};

const Proclamation = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.call.start} to={at("liubei", 0.3)} tilt={2}>
      <div style={{ fontFamily: fonts.title, fontSize: 44 * s, lineHeight: 1.4 }}>ประกาศ</div>
      <div style={{ fontSize: 30 * s, lineHeight: 1.55 }}>ทุกเมืองเปิดรับอาสาสมัคร ไปปราบโจรโพกผ้าเหลือง</div>
      <Seal text="詔" at={B.call.start + 14} />
    </SideCard>
  );
};

// Mid-episode re-hook: the record itself describes Liu Bei's odd looks.
const Ears = () => {
  const { s } = useUnit();
  return (
    <SideCard from={B.ears.start} to={B.zhangfei.start + 6} tilt={2}>
      <div style={{ fontSize: 28 * s, fontWeight: 700, color: C.wu, lineHeight: 1.5 }}>ตามบันทึก · จดหมายเหตุสามก๊ก</div>
      <div style={{ fontSize: 32 * s, lineHeight: 1.6 }}>
        แขนยาวเลยเข่า
        <br />
        เหลือบตาเห็นใบหูตัวเอง
      </div>
      <Seal text="垂手下膝" at={B.ears.start + 16} />
    </SideCard>
  );
};

// Illustrated insets (word-cued). "ภาพประกอบ" = drawn illustration, not a record of a real scene.
// why: inside the palace eunuchs sit on the wealth · outside the wall farmers starve (appear on "นอก").
const PalaceVsFields = ({ g, outside }: { g: InsetGeom; outside: number }) => {
  const k = usePopIn(outside);
  const half = g.x + g.W / 2;
  const sc = g.sc;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W / 2} height={g.H} fill="#f0dfb2" />
      <rect x={half} y={g.y} width={g.W / 2} height={g.H} fill="#d6bf8f" />
      <circle cx={g.x + g.W * 0.86} cy={g.y + 90 * g.s} r={34 * g.s} fill="#f4e3b0" opacity={0.8} />
      <rect x={g.x} y={g.ground} width={g.W / 2} height={g.H} fill="#cdbb92" />
      <DryField x0={half} x1={g.x + g.W} y={g.ground} depth={g.H} s={g.s} />
      <Hall x={g.x + g.W * 0.25} y={g.ground - 6 * g.s} scale={sc * 0.82} />
      <Chest x={g.x + g.W * 0.25} y={g.ground + 22 * g.s} scale={sc * 1.1} />
      <HanFigure x={g.x + g.W * 0.12} y={g.ground + 26 * g.s} scale={sc * 0.95} head="eunuch" robe="#9c3426" shade="#7a2518" hold="scroll" phase={1} />
      <HanFigure x={g.x + g.W * 0.38} y={g.ground + 26 * g.s} scale={sc * 0.95} head="eunuch" robe="#3d4f6b" shade="#2c3a50" flip phase={2} />
      <EarthWall x={half} y={g.ground + 30 * g.s} h={190 * g.s} w={26 * g.s} />
      <g opacity={Math.min(1, k)} transform={`translate(${(1 - Math.min(1, k)) * 30 * g.s},0)`}>
        {[0.62, 0.76, 0.9].map((fx, i) => (
          <HanFigure key={fx} x={g.x + g.W * fx} y={g.ground + (14 + (i % 2) * 14) * g.s} scale={sc * 0.9} robe={i === 1 ? "#7d6b4f" : "#8a7a5c"} shade="#5e5038" pose="hunch" hold="bowl" ragged flip phase={i * 2} skin="#d4a57c" />
        ))}
      </g>
      <text x={g.x + g.W * 0.25} y={g.y + 92 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={40 * g.s} fill={C.wu}>
        ในวัง
      </text>
      <text x={g.x + g.W * 0.75} y={g.y + 92 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={40 * g.s} fill={C.ink} opacity={Math.min(1, k)}>
        นอกวัง
      </text>
    </g>
  );
};

// spread: Yellow Turbans with torches, hoes and spears storm a county office; it catches fire on "เผา",
// and the magistrate runs off with his bundle on "ขุนนาง".
const RebelsBurn = ({ g, start, fire, flee }: { g: InsetGeom; start: number; fire: number; flee: number }) => {
  const burn = interpolate(g.frame, [fire, fire + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const march = Math.min(g.frame - start, 60) * 0.6 * g.s;
  const run = Math.max(0, g.frame - flee) * 4.5 * g.s;
  const rebels: { fx: number; pose: "raise" | "walk"; hold: "torch" | "spear" | "hoe"; robe: string }[] = [
    { fx: 0.05, pose: "walk", hold: "hoe", robe: "#8a6a3c" },
    { fx: 0.13, pose: "raise", hold: "torch", robe: "#a07a3a" },
    { fx: 0.21, pose: "raise", hold: "spear", robe: "#7d6b4f" },
    { fx: 0.29, pose: "walk", hold: "hoe", robe: "#94703e" },
    { fx: 0.37, pose: "raise", hold: "torch", robe: "#86663a" },
  ];
  return (
    <g>
      <path d={`M${g.x} ${g.ground - 50 * g.s} L${g.x + g.W} ${g.ground - 50 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#4a3020" opacity={0.55} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={g.x + i * 86 * g.s} y={g.ground - 62 * g.s} width={40 * g.s} height={14 * g.s} fill="#4a3020" opacity={0.55} />
      ))}
      <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#6e4f30" />
      <circle cx={g.x + g.W * 0.62} cy={g.ground - 90 * g.s} r={220 * g.s * burn} fill="url(#fig-glow)" />
      <OfficeGate x={g.x + g.W * 0.64} y={g.ground + 4 * g.s} scale={g.sc * 0.95} burn={burn} />
      <HanFigure x={g.x + g.W * 0.8 + run} y={g.ground + 24 * g.s} scale={g.sc * 0.95} head="official" robe="#3d4f6b" shade="#2c3a50" pose={g.frame >= flee ? "flee" : "stand"} hold="bundle" flip={g.frame < flee} />
      {rebels.map((r, i) => (
        <HanFigure key={r.fx} x={g.x + g.W * r.fx + march} y={g.ground + (18 + (i % 2) * 12) * g.s} scale={g.sc * 0.95} head="turban" robe={r.robe} shade="#5e4a2c" pose={r.pose} hold={r.hold} phase={i * 1.3} ragged={i % 2 === 0} />
      ))}
    </g>
  );
};

const PeachQuestion = () => {
  const { s } = useUnit();
  return (
    <SideCard from={at("cliff", 0.1)} to={B.cliff.end + 6}>
      <div style={{ fontFamily: fonts.title, fontSize: 52 * s, lineHeight: 1.35, textAlign: "center" }}>สาบานในสวนท้อ</div>
      <div style={{ fontSize: 28 * s, lineHeight: 1.5, textAlign: "center", opacity: 0.8 }}>มีจริงไหม?</div>
      <Seal text="?" at={at("cliff", 0.55)} />
    </SideCard>
  );
};

export const Ep = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = (f: Parameters<typeof camForFeature>[0], pad = 0.05) => camForFeature(f, width, height, pad);
  const han = fit(ERAS[184].sides[0].area);
  const cam = camAt(
    [
      { frame: 0, cam: globeCam(100, 30, width, height, 0.42) },
      { frame: at("hook", 0.35), cam: han },
      { frame: B.zhangjiao.start, cam: han },
      { frame: B.zhangjiao.start + 30, cam: fit(NORTH) },
      { frame: B.call.end, cam: fit(NORTH) },
      { frame: B.liubei.start + 25, cam: fit(ZHUO, 0.08) },
    ],
    frame,
  );
  const yellow = (f: number) => 0.55 * fade(f, B.slogan.start, B.slogan.start + 8, B.slogan.end - 6, B.slogan.end + 10);

  return (
    <EpisodeFrame
      ep={EP}
      beats={BEATS}
      variant={variant}
      sounds={
        <>
          <Sfx src={SFX.swell} at={0} volume={0.25} />
          <Sfx src={SFX.riser} at={at("hook", 0.2)} volume={0.2} />
          <Sfx src={SFX.whoosh} at={B.zhangjiao.start - 4} />
          <Sfx src={SFX.hit} at={B.slogan.start} volume={0.45} />
          <Sfx src={SFX.riser} at={B.spread.start} volume={0.2} />
          <Sfx src={SFX.pop} at={B.call.start + 14} volume={0.3} />
          <Sfx src={SFX.hit} at={B.ears.start + 16} volume={0.35} />
          <Sfx src={SFX.whoosh} at={B.liubei.start} />
          <Sfx src={SFX.pop} at={B.zhangfei.start} volume={0.3} />
          <Sfx src={SFX.pop} at={at("three", 0.55)} volume={0.3} />
          <Sfx src={SFX.hit} at={at("cliff", 0.55)} volume={0.4} />
        </>
      }
      map={
        <MapFrame cam={cam}>
          <PaperMap />
          <EraMap from={184} start={at("hook", 0.2)} end={B.liubei.start + 20} opacity={0.75} />
          <Flames points={YELLOW_TURBAN_RISINGS.map((r) => r.at)} start={at("hook", 0.35)} stagger={7} outAt={B.liubei.start} size={1.1} />
          <Flames points={SPREAD} start={B.spread.start + 4} stagger={3} outAt={B.liubei.start} size={0.8} />
          <InsetPanel id="palace" anchor={place("luoyang")} label="ภาพประกอบ" start={word("why", "ใน")} end={B.zhangjiao.start + 6} sky={["#f0dfb2", "#d6bf8f"]} font={fonts.body} accent={C.wu}>
            {(g) => <PalaceVsFields g={g} outside={word("why", "นอก")} />}
          </InsetPanel>
          <InsetPanel id="burn" anchor={YELLOW_TURBAN_RISINGS[0].at} label="ภาพประกอบ" start={B.spread.start} end={B.call.start + 8} sky={["#3a2416", "#c0602e"]} font={fonts.body} accent={C.wu}>
            {(g) => <RebelsBurn g={g} start={B.spread.start} fire={word("spread", "เผา")} flee={word("spread", "ขุนนาง")} />}
          </InsetPanel>
          <Badge at={place("julu")} name="เตียวก๊ก" sub="กิลก" color={C.yellow} start={B.zhangjiao.start + 30} end={B.spread.start + 4} />
          <InkLabel at={ZHUO_AT} text="โต๊ะกุ๋น" start={B.liubei.start + 20} dy={48} />
          <Badge at={ZHUO_AT} name="เล่าปี่" color={C.shu} start={B.liubei.start + 30} />
          <Badge at={[ZHUO_AT[0] + 0.55, ZHUO_AT[1] + 0.32]} name="เตียวหุย" color={C.shu} start={B.zhangfei.start} />
          <Badge at={[ZHUO_AT[0] - 0.55, ZHUO_AT[1] + 0.32]} name="กวนอู" color={C.shu} start={at("three", 0.55)} />
        </MapFrame>
      }
      overlay={
        <>
          <Tint color="#e8c22a" opacity={yellow} />
          <TitleCard kicker="สามก๊ก · ตอนที่ 1" lines={["ชาวนาหลายแสนคน", "ลุกฮือในเดือนเดียว?"]} from={4} to={at("hook", 0.6)} />
          <StatCard label="ผู้ลุกฮือ" value="หลายแสนคน" sub="ใน 8 มณฑล · ค.ศ. 184" from={at("hook", 0.6)} to={at("why", 0.25)} color={C.yellow} />
          <YearBadge year={184} title="ราชวงศ์ฮั่น" start={at("why", 0.05)} end={at("why", 0.3)} />
          <Court />
          <CharacterCard who="zhangjiao" from={at("zhangjiao", 0.3)} to={B.slogan.start} />
          <PortraitCard who="zhangjiao" from={B.slogan.start - 2} to={B.slogan.end + 6} />
          <Proclamation />
          <CharacterCard who="liubei" from={at("liubei", 0.35)} to={B.ears.start} />
          <Ears />
          <PortraitCard who="zhangfei" from={B.zhangfei.start} to={B.zhangfei.end + 6} />
          <CharacterCard who="zhangfei" from={B.three.start} to={at("three", 0.5)} />
          <CharacterCard who="guanyu" from={at("three", 0.55)} to={B.cliff.start} />
          <PeachQuestion />
        </>
      }
    />
  );
};
