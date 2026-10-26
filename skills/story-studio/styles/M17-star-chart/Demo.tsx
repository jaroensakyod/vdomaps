import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { camAt } from "../../components/camera";
import { MapFrame } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Bond, C, ChartLand, clamp, Descent, ease, Entry, fitSquare, font, Legend, rise, Sheet, Star, TitleBlock, useChart, YearDial } from "./kit/Sky";

// M17 star chart: how the Habsburgs built an empire by marriage, 1469–1519, as constellations on an antique
// celestial chart. Each person is a star at the city where they were born; gold lines are marriages, silver
// dotted lines are descent; the ring is a year dial that turns to each date. Charles V's star ends brightest. 18 s.
export const demo: StyleDemo = { id: "M17", name: "แผนที่ดาวราชวงศ์", frames: 540, cover: 505, sizes: ["9x16"] };

// Birthplaces [lon, lat] (Britannica biographies, see STYLE.md).
const P = {
  ferdinand: [-1.21, 42.5] as [number, number], // Sos (del Rey Católico), Aragon, 1452
  isabella: [-4.99, 40.99] as [number, number], // Madrigal de las Altas Torres, Castile, 1451
  maximilian: [16.25, 47.81] as [number, number], // Wiener Neustadt, Austria, 1459
  mary: [4.35, 50.85] as [number, number], // Brussels, 1457
  philip: [3.22, 51.21] as [number, number], // Bruges, 1478
  joanna: [-4.02, 39.86] as [number, number], // Toledo, 1479
  charles: [3.72, 51.05] as [number, number], // Ghent, 1500
};
const BOX: [number, number, number, number] = [-6.5, 39.2, 17.2, 52];

// [frame, year] keys for the dial.
const YEARS: [number, number][] = [[0, 1458], [40, 1469], [140, 1469], [170, 1477], [250, 1479], [300, 1496], [380, 1500], [450, 1519], [540, 1519]];
const LINES = [
  { text: "ราชวงศ์ฮับส์บูร์กขยายอำนาจ\nด้วยการแต่งงานมากกว่าสงคราม", start: 22, len: 140, no: "I" },
  { text: "ปี 1477 มักซีมีเลียนแต่งงานกับแมรี\nแห่งเบอร์กันดี ได้ดินแดนเนเธอร์แลนด์", start: 162, len: 132, no: "II" },
  { text: "ปี 1496 ฟิลิปบุตรชาย\nแต่งงานกับฆวนา ธิดากษัตริย์สเปน", start: 294, len: 132, no: "III" },
  { text: "หลานชาย ชาร์ลที่ 5 จึงได้ครองทั้งสเปน\nเนเธอร์แลนด์ และออสเตรีย", start: 426, len: 114, no: "IV" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { s, width, height, cx, cy, r } = useChart();
  const year = interpolate(frame, YEARS.map((k) => k[0]), YEARS.map((k) => k[1]), { ...clamp, easing: ease });
  const side = 2 * r * 0.74;
  const cam = camAt(
    [
      { frame: 0, cam: fitSquare(BOX, side, 0.95) },
      { frame: 300, cam: fitSquare(BOX, side, 1.0) },
      { frame: 540, cam: fitSquare(BOX, side, 1.05) },
    ],
    frame,
  );
  const open = rise(frame, 0, 30);
  // brightness: each star appears faint at birth/entry, then grows as the person rules
  const b = {
    ferdinand: rise(frame, 40) * 0.55 + rise(frame, 120, 40) * 0.1,
    isabella: rise(frame, 46) * 0.6 + rise(frame, 120, 40) * 0.1,
    maximilian: rise(frame, 150) * 0.55 + rise(frame, 440, 30) * 0.1,
    mary: rise(frame, 156) * 0.45,
    philip: rise(frame, 240) * 0.35 + rise(frame, 300, 30) * 0.15,
    joanna: rise(frame, 252) * 0.35 + rise(frame, 300, 30) * 0.12,
    charles: rise(frame, 400) * 0.35 + rise(frame, 455, 45) * 0.65,
  };
  const hot = interpolate(frame, [455, 490], [0, 1], clamp);
  const bond = (f: number) => interpolate(frame, [f, f + 34], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sfx src={SFX.swell} at={4} volume={0.22} />
      <Bed id="wind" from={0} to={demo.frames} volume={0.06} />
      {[40, 150, 240, 400].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.22} />)}
      {[60, 176, 304, 380].map((f) => <Sfx key={`p${f}`} src={SFX.pop} at={f} volume={0.14} />)}
      <Hit id="church_bell" at={306} volume={0.16} />
      <Hit id="gong" at={458} volume={0.2} />
      <Sheet />
      <YearDial year={year} k={open} />
      <MapFrame cam={cam} focusX={cx / width} focusY={cy / height}>
        <defs>
          <clipPath id="m17-in">
            <circle cx={cx} cy={cy} r={r * open} />
          </clipPath>
        </defs>
        <g clipPath="url(#m17-in)">
          <ChartLand />
          <Bond a={P.ferdinand} b={P.isabella} k={bond(62)} year="1469" bend={-0.25} off={[70, 80]} />
          <Bond a={P.maximilian} b={P.mary} k={bond(176)} year="1477" bend={0.1} />
          <Descent from={[P.ferdinand, P.isabella]} to={P.joanna} k={interpolate(frame, [250, 280], [0, 1], clamp)} bend={-0.25} />
          <Descent from={[P.maximilian, P.mary]} to={P.philip} k={interpolate(frame, [236, 266], [0, 1], clamp)} bend={0.1} />
          <Bond a={P.philip} b={P.joanna} k={bond(304)} year="1496" bend={0.16} />
          <Descent from={[P.philip, P.joanna]} to={P.charles} k={interpolate(frame, [386, 416], [0, 1], clamp)} bend={0.16} />
          <Star at={P.isabella} b={b.isabella} name="อิซาเบลลา" sub="กัสติยา · 1451" dx={-6} dy={-42} />
          <Star at={P.ferdinand} b={b.ferdinand} name="เฟร์นันโด" sub="อารากอน · 1452" dx={20} dy={-40} anchor="start" />
          <Star at={P.joanna} b={b.joanna} name="ฆวนา" sub="โตเลโด · 1479" dx={0} dy={64} />
          <Star at={P.maximilian} b={b.maximilian} name="มักซีมีเลียน" sub="ออสเตรีย · 1459" dx={-10} dy={66} anchor="end" />
          <Star at={P.mary} b={b.mary} name="แมรี" sub="บรัสเซลส์ · 1457" dx={44} dy={58} anchor="start" />
          <Star at={P.philip} b={b.philip} name="ฟิลิป" sub="บรูจส์ · 1478" dx={-40} dy={-44} anchor="end" />
          <Star at={P.charles} b={b.charles} name="ชาร์ลที่ 5" sub="เกนต์ · 1500" dx={72} dy={-70} anchor="start" hot={hot} />
        </g>
      </MapFrame>
      <TitleBlock kicker="M17 · แผนที่ดาวราชวงศ์" title="ฮับส์บูร์ก: จักรวรรดิจากการแต่งงาน" sub="กลุ่มดาวแห่งราชวงศ์ ค.ศ. 1469–1519" k={rise(frame, 4, 24)} />
      {LINES.map((l) => <Entry key={l.start} {...l} />)}
      <Legend k={rise(frame, 30, 20)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: height - 120 * s, textAlign: "center", fontFamily: font, fontSize: 18 * s, color: C.ink, opacity: 0.75, letterSpacing: 1 * s }}>
        ภาพประกอบ · ตำแหน่งดาว = เมืองที่ประสูติ · แผนที่จาก Natural Earth
      </div>
    </AbsoluteFill>
  );
};
