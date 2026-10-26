import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MapFrame, useMap } from "../../components/Map";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { along, buildRoute, C, clamp, ease, fitBox, font, Ground, LifeLine, OtherLine, StationMark, Train, useDiagram, type Leg, type Station, type XY } from "./kit/Metro";

// M20 metro line: the life of King Taksin (1734–1782) as a transit line over a faint map of central and eastern
// Siam — born in Ayutthaya, governor of Tak, the break-out through the Burmese siege, Rayong, Chanthaburi, the
// recapture at Pho Sam Ton and the coronation at Thonburi. Interchanges: the Burmese siege line at Ayutthaya and
// Chao Phraya Chakri's (Rama I's) line at Thonburi. A little train runs the life and pauses at each stop. 20 s.
export const demo: StyleDemo = { id: "M20", name: "สายชีวิต", frames: 600, cover: 578, sizes: ["9x16"] };

// Real places [lon, lat]; Pho Sam Ton is drawn a little west of Ayutthaya (schematic, it is only ~8 km away).
const PLACES: [number, number][] = [
  [100.568, 14.355], // 0 Ayutthaya
  [99.126, 16.884], // 1 Tak
  [101.276, 12.681], // 2 Rayong
  [102.104, 12.611], // 3 Chanthaburi
  [100.488, 13.725], // 4 Thonburi
  [100.568, 14.355], // 5 Pho Sam Ton (offset on screen)
];
const ST: Station[] = [
  { name: "อยุธยา", when: "ประสูติ 2277 · ฝ่าวงล้อม 2310", what: "", dx: 30, dy: -46, inter: true },
  { name: "ตาก", when: "เจ้าเมืองตาก", what: "", dx: 32, dy: 10 },
  { name: "ระยอง", when: "รวมไพร่พล 2310", what: "", dx: -30, dy: -30, anchor: "end" },
  { name: "จันทบุรี", when: "ยึดเมือง มิ.ย. 2310", what: "", dx: 0, dy: -72, anchor: "middle" },
  { name: "ธนบุรี", when: "ปราบดาภิเษก 2310", what: "", dx: -30, dy: 58, anchor: "end", inter: true },
  { name: "โพธิ์สามต้น", when: "กู้กรุง พ.ย. 2310", what: "", dx: -30, dy: -26, anchor: "end" },
];
// The stops in order: [station, sign text, date, age]
const STOPS: { st: number; what: string; when: string; age: string; arrive: number; leave: number }[] = [
  { st: 0, what: "ประสูติที่กรุงศรีอยุธยา", when: "17 เม.ย. พ.ศ. 2277", age: "แรกเกิด", arrive: 26, leave: 70 },
  { st: 1, what: "เป็นเจ้าเมืองตาก จึงเรียก “พระยาตาก”", when: "ก่อน พ.ศ. 2308 (โดยประมาณ)", age: "ราว 30 ปี", arrive: 118, leave: 160 },
  { st: 0, what: "ตีฝ่าวงล้อมพม่า ออกจากกรุง", when: "ม.ค. พ.ศ. 2310", age: "32 ปี", arrive: 208, leave: 250 },
  { st: 2, what: "รวมไพร่พล ตั้งตัวเป็นผู้นำ", when: "พ.ศ. 2310", age: "32 ปี", arrive: 294, leave: 330 },
  { st: 3, what: "ยึดเมืองจันทบุรี", when: "มิ.ย. พ.ศ. 2310", age: "33 ปี", arrive: 354, leave: 388 },
  { st: 5, what: "ตีค่ายพม่าที่โพธิ์สามต้น กู้กรุงศรีฯ", when: "พ.ย. พ.ศ. 2310", age: "33 ปี", arrive: 470, leave: 500 },
  { st: 4, what: "ปราบดาภิเษก ครองกรุงธนบุรี", when: "28 ธ.ค. 2310 · สวรรคต 2325", age: "33 ปี", arrive: 532, leave: 9999 },
];
const BOX: [number, number, number, number] = [98.6, 12.3, 102.7, 17.25];

const Diagram = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const P = PLACES.map((p) => projection(p) as XY);
  P[5] = [P[0][0] - 130 * s, P[0][1] + 12 * s];
  const legs: Leg[] = [
    { to: 1, mode: "diag" },
    { to: 0, mode: "straight" },
    { to: 2, mode: "diag" },
    { to: 3, mode: "straight" },
    { to: 4, mode: "diag", via: [[P[3][0], P[3][1] + 64 * s], [P[4][0] + 70 * s, P[3][1] + 64 * s]], sea: true },
    { to: 5, mode: "diag" },
    { to: 4, mode: "straight" },
  ];
  const { poly, stops, sea } = buildRoute(P, 0, legs);
  // stop index in `stops`: 0 A,1 T,2 A,3 R,4 C,5 B(pass),6 P,7 B
  const at = [0, 1, 2, 3, 4, 6, 7];
  const fk: number[] = [];
  const dk: number[] = [];
  STOPS.forEach((st, i) => {
    fk.push(st.arrive, Math.min(st.leave, 599));
    dk.push(stops[at[i]], stops[at[i]]);
  });
  const t = interpolate(frame, fk, dk, { ...clamp, easing: ease });
  const tr = along(poly, t);
  const reachedT = (st: number) => {
    const first = STOPS.findIndex((x) => x.st === st);
    return first < 0 ? 0 : interpolate(frame, [STOPS[first].arrive - 4, STOPS[first].arrive + 6], [0, 1], clamp);
  };
  const cur = STOPS.filter((x) => frame >= x.arrive - 2).pop();
  const dwell = (st: number) => (cur && cur.st === st && frame < cur.leave ? 1 : 0);
  const A = P[0];
  const B = P[4];
  return (
    <g>
      <OtherLine pts={[[A[0], A[1] - 380 * s], A]} color={C.other1} k={interpolate(frame, [180, 210], [0, 1], clamp)} label="สายทัพพม่า" sub="ล้อมกรุง 2309–2310" at={[A[0] + 18 * s, A[1] - 350 * s]} />
      <OtherLine pts={[[B[0] - 330 * s, B[1]], B, [B[0] + 110 * s, B[1]]]} color={C.other2} k={interpolate(frame, [540, 570], [0, 1], clamp)} label="สาย ร.1 พระยาจักรี" sub="ตั้งกรุงเทพฯ 2325" at={[B[0] - 330 * s, B[1] - 50 * s]} />
      <LifeLine poly={poly} t={Math.max(1, t)} sea={sea} />
      {/* ship marker on the sea leg */}
      {sea.map(([a, b], i) => {
        const m = along(poly, (a + b) / 2);
        return (
          <text key={i} x={m.p[0]} y={m.p[1] + 42 * s} textAnchor="middle" fontFamily={font} fontSize={20 * s} fontWeight={600} fill={C.line} opacity={t > a ? 1 : 0.35}>
            ทางเรือ
          </text>
        );
      })}
      {ST.map((st, i) => <StationMark key={i} p={P[i]} st={st} reached={reachedT(i)} now={dwell(i)} />)}
      <Train at={tr.p} ang={tr.ang} k={interpolate(frame, [10, 24], [0, 1], clamp)} />
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { s, width, height, map } = useDiagram();
  const [mx, my, mw, mh] = map;
  const cam = fitBox(BOX, [0, 0, mw, mh], interpolate(frame, [0, 600], [0.88, 0.91]));
  const cur = STOPS.filter((x) => frame >= x.arrive - 2).pop() ?? STOPS[0];
  const ci = STOPS.indexOf(cur);
  const sign = interpolate(frame, [cur.arrive - 2, cur.arrive + 10], [0, 1], { ...clamp, easing: ease });
  const st = ST[cur.st];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Bed id="city_crowd" from={0} to={demo.frames} volume={0.04} />
      {STOPS.map((x) => <Sfx key={x.arrive} src={SFX.tick} at={x.arrive} volume={0.35} />)}
      {STOPS.slice(0, -1).map((x) => <Sfx key={`w${x.leave}`} src={SFX.whoosh} at={x.leave - 2} volume={0.12} />)}
      <Hit id="war_drums" at={196} volume={0.15} />
      <Hit id="gong" at={534} volume={0.2} />
      <MapFrame cam={cam} focusX={(mx + mw / 2) / width} focusY={(my + mh / 2) / height}>
        <defs>
          <clipPath id="m20-map">
            <rect x={mx} y={my} width={mw} height={mh} rx={24 * s} />
          </clipPath>
        </defs>
        <g clipPath="url(#m20-map)">
          <Ground />
        </g>
        
        <Diagram />
      </MapFrame>
      {/* header: a full-width band in the line colour, white badge, title reversed out */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 296 * s, background: C.line, fontFamily: font }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10 * s, background: C.ink }} />
        <div style={{ position: "absolute", left: 90 * s, right: 90 * s, top: 74 * s, display: "flex", alignItems: "center", gap: 26 * s }}>
          <div style={{ width: 150 * s, height: 150 * s, borderRadius: 30 * s, background: "#fff", color: C.line, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 64 * s, fontWeight: 700, lineHeight: 1 }}>M20</div>
            <div style={{ fontSize: 22 * s, fontWeight: 600, marginTop: 6 * s, color: C.ink }}>สายชีวิต</div>
          </div>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 24 * s, fontWeight: 600, letterSpacing: 1 * s, opacity: 0.9 }}>M20 · สายชีวิต</div>
            <div style={{ fontSize: 62 * s, fontWeight: 700, lineHeight: 1.2 }}>สายพระเจ้าตากสิน</div>
            <div style={{ fontSize: 26 * s, fontWeight: 500, opacity: 0.9 }}>7 สถานีของชีวิต · พ.ศ. 2277–2325</div>
          </div>
        </div>
      </div>
      {/* station sign: a black platform sign across the foot of the frame */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1462 * s, bottom: 0, background: C.ink, fontFamily: font, color: "#fff" }}>
        <div style={{ height: 14 * s, background: C.line }} />
        <div style={{ padding: `${22 * s}px ${90 * s}px`, opacity: sign, transform: `translateX(${(1 - sign) * 30 * s}px)` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 24 * s, fontWeight: 600, color: C.line }}>{`สถานีที่ ${ci + 1} / ${STOPS.length}`}</span>
            <span style={{ fontSize: 26 * s, fontWeight: 600, color: C.ink, background: "#fff", borderRadius: 999, padding: `${2 * s}px ${18 * s}px` }}>{`อายุ ${cur.age}`}</span>
          </div>
          <div style={{ fontSize: 80 * s, fontWeight: 700, lineHeight: 1.2 }}>{st.name}</div>
          <div style={{ fontSize: 34 * s, fontWeight: 500, lineHeight: 1.3, color: "#e9e6df" }}>{cur.what}</div>
          <div style={{ fontSize: 26 * s, fontWeight: 600, color: "#ff8a5c", marginTop: 4 * s }}>{cur.when}</div>
        </div>
        {/* strip of stops */}
        <svg width={1080 * s} height={44 * s} style={{ position: "absolute", left: 0, top: 344 * s }}>
          <line x1={120 * s} x2={960 * s} y1={22 * s} y2={22 * s} stroke="#4a4c52" strokeWidth={8 * s} strokeLinecap="round" />
          <line x1={120 * s} x2={(120 + (840 * ci) / (STOPS.length - 1)) * s} y1={22 * s} y2={22 * s} stroke={C.line} strokeWidth={8 * s} strokeLinecap="round" />
          {STOPS.map((x, i) => (
            <circle key={i} cx={(120 + (840 * i) / (STOPS.length - 1)) * s} cy={22 * s} r={(i === ci ? 12 : 8) * s} fill={C.ink} stroke={i <= ci ? C.line : "#6a6c72"} strokeWidth={5 * s} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22 * s, textAlign: "center", fontSize: 18 * s, color: "#8d8f95" }}>
          แผนผังเส้นทาง · ตำแหน่งสถานีโดยประมาณ · แผนที่ Natural Earth
        </div>
      </div>
    </AbsoluteFill>
  );
};
