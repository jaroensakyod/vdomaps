import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../components/Arrow";
import { camAt } from "../../components/camera";
import { PointLabel } from "../../components/Labels";
import { MapFrame } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BLUE, clamp, Compare, FourSources, GOLD, GREEN, RED, Timeline, VIET_C } from "./kit/Cards";
import { HeadCard, Subtitle, type Head } from "./kit/Head";
import { BattleMark, BigRivers, CityDot, MapTag, PL, ROUTES, TopBar, view, VW, Zones } from "./kit/Map";

// M03 evidence on the map: the elephant duel of 2135 told by four sides. Satellite map with approximate kingdom
// extents and the march, then "which source says what" (glaive / lance / gun), the two proposed sites with a
// dashed disputed pin, and when each text was written. Head cards carry confidence chips. 18 s.
export const demo: StyleDemo = { id: "M03", name: "เล่าด้วยหลักฐานหลายฝ่าย", frames: 540, cover: 236, sizes: ["9x16"] };

const BURMA = "#e05a3a";
const T = { march: 20, clash: 82, src: 100, c: [128, 148, 168, 188], agree: 220, site: 270, don: 296, phan: 318, stamp: 360, tl: 410, w: [436, 456, 476], zone: 500, end: 540 };

const HEADS: Head[] = [
  { f: 0, tag: "ยุทธหัตถี พ.ศ. 2135", head: "จบลงด้วยอะไร?", color: GOLD },
  { f: T.src, tag: "หลักฐานเล่าต่างกัน", head: "ง้าว หอก หรือปืน?", color: RED, sure: "mid" },
  { f: T.agree, tag: "ทุกฝ่ายตรงกัน", head: "พระมหาอุปราชาสิ้นพระชนม์", color: GREEN, sure: "high" },
  { f: T.site, tag: "แล้วรบกันที่ไหน?", head: "สองที่ สองอนุสรณ์", color: GOLD, sure: "mid" },
  { f: T.tl, tag: "ก่อนเชื่อ ดูว่าเขียนเมื่อไหร่", head: "ไม่มีฉบับไหนเขียนทันที", color: GOLD },
];
const LINES: [number, string][] = [
  [0, "ศึกครั้งเดียว แต่หลักฐานแต่ละฝ่ายเล่าไม่เหมือนกัน"],
  [T.src, "ไทยว่าง้าว ฟาน ฟลีตว่าหอก พม่าและโปรตุเกสว่าปืน"],
  [T.site, "สถานที่ก็ยังถกเถียง ดอนเจดีย์ หรือพนมทวน"],
  [T.tl, "ทุกฉบับเขียนหลังเหตุการณ์ 48 ถึง 240 ปี"],
];

const Audio = () => (
  <>
    <Sfx src={SFX.swell} at={0} volume={0.3} />
    <Bed id="war_drums" from={0} to={T.src + 10} volume={0.22} fade={20} />
    <Hit id="elephant" at={12} volume={0.4} />
    <Hit id="sword_clash" at={T.clash} volume={0.4} />
    <Sfx src={SFX.whoosh} at={T.src - 4} volume={0.25} />
    {T.c.map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.35} />)}
    <Sfx src={SFX.hit} at={T.agree} volume={0.35} />
    <Bed id="wind" from={T.src} to={T.end} volume={0.12} fade={30} />
    <Sfx src={SFX.whoosh} at={T.site - 6} volume={0.3} />
    <Sfx src={SFX.pop} at={T.don} volume={0.35} />
    <Sfx src={SFX.pop} at={T.phan} volume={0.35} />
    <Sfx src={SFX.hit} at={T.stamp} volume={0.35} />
    <Sfx src={SFX.whoosh} at={T.tl - 6} volume={0.25} />
    {T.w.map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.35} />)}
    <Sfx src={SFX.pop} at={T.zone} volume={0.35} />
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = camAt(
    [
      { frame: 0, cam: view(VW.region, width, height, 0.85, 0.1) },
      { frame: 90, cam: view(VW.west, width, height, 0.85, 0.12) },
      { frame: T.site - 10, cam: view(VW.west, width, height, 0.9, 0.12) },
      { frame: T.site + 30, cam: view(VW.duel, width, height, 0.75, 0.13) },
      { frame: T.tl - 10, cam: view(VW.duel, width, height, 0.8, 0.13) },
      { frame: T.tl + 30, cam: view(VW.region, width, height, 0.85, 0.1) },
      { frame: T.end, cam: view(VW.region, width, height, 0.88, 0.1) },
    ],
    frame,
  );
  const zones = interpolate(frame, [6, 30, T.site - 10, T.site + 20, T.tl, T.tl + 30], [0, 1, 1, 0.25, 0.25, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Audio />
      <MapFrame cam={cam}>
        <Raster layers={[{ name: "world" }, { name: "sea" }]} />
        <BigRivers />
        <Zones k={{ burma: zones, siam: zones }} />
        <Arrow points={ROUTES.swa1592} start={T.march} end={T.march + 60} color={BURMA} width={12} opacity={interpolate(frame, [T.site - 10, T.site + 10], [1, 0], clamp)} />
        <BattleMark at={PL.nongsarai} start={T.clash} end={T.site - 10} />
        <CityDot at={PL.ayut} color={GOLD} r={13} start={8} end={T.site - 10} />
        {frame < T.site && <PointLabel at={PL.ayut} text="อยุธยา" start={14} color={GOLD} size={0.75} />}
        {frame < T.site && <PointLabel at={PL.pegu} text="หงสาวดี" start={20} color={BURMA} size={0.75} />}
        {/* the two proposed sites: the accepted one solid, the alternative dashed */}
        <CityDot at={PL.nongsarai} color={GOLD} r={16} start={T.don} end={T.tl} />
        <CityDot at={PL.phanomthuan} color={BLUE} r={14} start={T.phan} end={T.tl} dashed />
        <MapTag at={[PL.nongsarai[0], PL.nongsarai[1] + 0.07]} text="ดอนเจดีย์ สุพรรณบุรี" start={T.don + 4} end={T.tl} color={GOLD} size={36} weight={900} />
        <MapTag at={[PL.phanomthuan[0], PL.phanomthuan[1] - 0.09]} text="พนมทวน กาญจนบุรี" start={T.phan + 4} end={T.tl} color="#9cc8ff" size={36} weight={900} />
        <MapTag at={[(PL.nongsarai[0] + PL.phanomthuan[0]) / 2 + 0.25, (PL.nongsarai[1] + PL.phanomthuan[1]) / 2]} text="(ตำแหน่งโดยประมาณ)" start={T.phan + 14} end={T.tl} size={24} />
      </MapFrame>
      <TopBar badge="M03" chapter="เล่าด้วยหลักฐานหลายฝ่าย" year="2135" />
      <HeadCard heads={HEADS} from={0} to={T.end} />
      <FourSources
        start={T.src}
        end={T.site + 8}
        title="แต่ละฝ่ายเล่าว่าอะไร"
        color={GOLD}
        checks={T.c}
        sources={[["ไทย", "พงศาวดารไทย", GOLD, "ง้าว"], ["ดัตช์", "ฟาน ฟลีต (2183)", BLUE, "หอก"], ["พม่า", "ฉบับหอแก้ว", BURMA, "ปืน"], ["โปรตุเกส", "Bocarro · Pimenta", VIET_C, "ปืน"]]}
        bottom={{ text: "สิ้นพระชนม์ในศึกนี้", f: T.agree }}
      />
      <Compare
        start={T.site}
        end={T.tl + 8}
        title="ยุทธหัตถีเกิดที่ไหน"
        left={{ tag: "กรมพระยาดำรงฯ ระบุ 2456", text: "ดอนเจดีย์", color: GOLD, f: T.don, icon: "book" }}
        right={{ tag: "ข้อเสนอนักวิชาการบางกลุ่ม", text: "พนมทวน", color: BLUE, f: T.phan, icon: "book" }}
        stamp={{ text: "ยังถกเถียง", f: T.stamp, color: GOLD }}
      />
      <Timeline
        start={T.tl}
        end={T.end}
        title="แต่ละฉบับเขียนเมื่อไหร่"
        from={2120}
        to={2400}
        marks={[
          { at: 2135, top: "2135", bottom: "ศึก", f: T.tl + 8, color: RED, big: true },
          { at: 2183, top: "2183", bottom: "ฟาน ฟลีต", f: T.w[0], color: BLUE },
          { at: 2223, top: "2223", bottom: "ฉบับหลวง\nประเสริฐ", f: T.w[1] },
          { at: 2375, top: "2375", bottom: "ฉบับหอแก้ว", f: T.w[2], color: BURMA },
        ]}
        zone={{ from: 2150, text: "เขียนหลังเหตุการณ์ทั้งหมด", f: T.zone }}
      />
      <Subtitle lines={LINES} />
    </AbsoluteFill>
  );
};
