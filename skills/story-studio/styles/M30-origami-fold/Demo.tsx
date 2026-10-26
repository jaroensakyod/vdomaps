import { geoPath } from "d3-geo";
import type { LineString, MultiLineString } from "geojson";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, ease, fade, font, PaperBand, PaperBoat, PaperChedi, PlaceCard, printProj, Sheet, SHEET, StandUp, Table } from "./kit/Origami";
import { RIVER_ROUTE } from "./kit/route";
import { WATER } from "./kit/water";

// M30 origami fold: Sunthorn Phu's boat journey in Nirat Phu Khao Thong (reign of Rama III), from Bangkok up the
// Chao Phraya to the old capital Ayutthaya to pay homage at the Phu Khao Thong chedi. A folded paper map opens on a
// slate table, a vermilion paper boat sails the river, place cards fold up as it passes, and a gold paper chedi
// folds up at the end. River lines from OpenStreetMap; the route is the river course, ~94 km. 16 s.
export const demo: StyleDemo = { id: "M30", name: "แผนที่พับกระดาษ", frames: 480, cover: 452, sizes: ["9x16"] };

const EXTENT: [number, number, number, number] = [100.3, 13.66, 100.8, 14.43];
const PHUKHAOTHONG: [number, number] = [100.548, 14.373];
const T_ROW: [number, number] = [22, 60];
const T_COL: [number, number] = [56, 98];
const T_SAIL: [number, number] = [112, 372];
const T_CHEDI = 372;

const TOWNS: { at: [number, number]; text: string; dx: number; dy: number; anchor?: "end" }[] = [
  { at: [100.4913, 13.75], text: "บางกอก", dx: -16, dy: 10, anchor: "end" },
  { at: [100.5, 13.862], text: "นนทบุรี", dx: 16, dy: 8 },
  { at: [100.53, 14.02], text: "ปทุมธานี", dx: 16, dy: 8 },
  { at: [100.57, 14.355], text: "กรุงเก่า", dx: 16, dy: 26 },
];
const CARDS: { at: [number, number]; text: string; sub?: string; f: number; side: number }[] = [
  { at: [100.5, 13.862], text: "ตลาดขวัญ", sub: "นนทบุรี", f: 172, side: -1 },
  { at: [100.535, 14.06], text: "สามโคก", sub: "ปทุมธานี", f: 262, side: 1 },
  { at: [100.57, 14.33], text: "กรุงเก่า", f: 350, side: 1 },
];
const CAPS = [
  { text: "สุนทรภู่ล่องเรือจากบางกอก ขึ้นไปกรุงเก่า", f0: 12, f1: 140 },
  { text: "ผ่านตลาดขวัญ เมืองนนทบุรี และสามโคก", f0: 140, f1: 262 },
  { text: "ตามลำน้ำเจ้าพระยา ราว 94 กิโลเมตร", f0: 262, f1: 372 },
  { text: "เพื่อนมัสการเจดีย์ภูเขาทอง ที่กรุงเก่า", f0: 372, f1: 494 },
];

// Point and progress along the route polyline (screen px of the print).
const along = (pts: [number, number][], k: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = k * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const t = seg[i] ? d / seg[i] : 0;
      return { p: [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t] as [number, number], i };
    }
    d -= seg[i];
  }
  return { p: pts[pts.length - 1], i: pts.length - 2 };
};

const Print = () => {
  const proj = useMemo(() => printProj(EXTENT), []);
  const path = useMemo(() => geoPath(proj), [proj]);
  const grid: string[] = [];
  for (let lon = 100.3; lon <= 100.81; lon += 0.1) grid.push(path({ type: "LineString", coordinates: [[lon, 13.6], [lon, 14.5]] }) ?? "");
  for (let lat = 13.7; lat <= 14.41; lat += 0.1) grid.push(path({ type: "LineString", coordinates: [[100.2, lat], [100.9, lat]] }) ?? "");
  const water = WATER.map((w) => ({ ...w, d: path({ type: "MultiLineString", coordinates: w.lines } as MultiLineString) ?? "" }));
  const route = path({ type: "LineString", coordinates: RIVER_ROUTE } as LineString) ?? "";
  return (
    <svg width={SHEET.w} height={SHEET.h} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="m30-paddy" width={26} height={18} patternUnits="userSpaceOnUse">
          <path d="M3 13h8M15 5h8" stroke={C.jade} strokeWidth={1.4} opacity={0.5} />
        </pattern>
      </defs>
      <rect width={SHEET.w} height={SHEET.h} fill="url(#m30-paddy)" />
      {grid.map((d, i) => <path key={i} d={d} stroke={C.jade} strokeWidth={1.2} strokeDasharray="2 6" fill="none" opacity={0.9} />)}
      {water.map((w) => (
        <g key={w.name}>
          <path d={w.d} fill="none" stroke="#b9cbe6" strokeWidth={w.big ? 11 : 5} strokeLinecap="round" strokeLinejoin="round" />
          <path d={w.d} fill="none" stroke={C.indigo} strokeWidth={w.big ? 3.4 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <path d={route} fill="none" stroke={C.vermilion} strokeWidth={2} strokeDasharray="3 9" opacity={0.6} />
      {TOWNS.map((t) => {
        const [x, y] = proj(t.at) as [number, number];
        return (
          <g key={t.text} fontFamily={font}>
            <circle cx={x} cy={y} r={7} fill={C.paper} stroke={C.ink} strokeWidth={2.4} />
            <text x={x + t.dx} y={y + t.dy} textAnchor={t.anchor ?? "start"} fontSize={30} fontWeight={600} fill={C.ink}>{t.text}</text>
          </g>
        );
      })}
      {/* printed title block, compass and scale */}
      <g fontFamily={font} fill={C.indigo}>
        <text x={60} y={92} fontSize={40} fontWeight={700}>ลำน้ำเจ้าพระยา</text>
        <text x={60} y={128} fontSize={22} fontWeight={500} fill="#5b6783">บางกอก – กรุงเก่า</text>
        <g transform={`translate(${SHEET.w - 110} ${SHEET.h - 160})`}>
          <path d="M0 -46 L12 0 L0 46 L-12 0 Z" fill="none" stroke={C.indigo} strokeWidth={2} />
          <path d="M0 -46 L12 0 L-12 0 Z" fill={C.indigo} />
          <text x={0} y={-56} textAnchor="middle" fontSize={22} fontWeight={700}>เหนือ</text>
        </g>
        {(() => {
          const a = proj([100.62, 13.72]) as [number, number];
          const b = proj([100.62 + 10 / (111.32 * Math.cos((13.72 * Math.PI) / 180)), 13.72]) as [number, number];
          return (
            <g>
              <path d={`M${a[0]} ${a[1]}H${b[0]}`} stroke={C.indigo} strokeWidth={4} />
              <path d={`M${a[0]} ${a[1] - 8}v16M${b[0]} ${b[1] - 8}v16`} stroke={C.indigo} strokeWidth={2} />
              <text x={(a[0] + b[0]) / 2} y={a[1] - 16} textAnchor="middle" fontSize={20} fontWeight={600}>10 กม.</text>
            </g>
          );
        })()}
      </g>
    </svg>
  );
};

// The plain back of the bottom-centre panel is the cover of the folded map.
const Cover = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: font, color: C.indigo }}>
    <div style={{ width: 70, height: 70, border: `3px solid ${C.indigo}`, transform: "rotate(45deg)", marginBottom: 46 }} />
    <div style={{ fontSize: 40, fontWeight: 700 }}>แผนที่นิราศ</div>
    <div style={{ fontSize: 22, fontWeight: 500, marginTop: 8 }}>บางกอก – กรุงเก่า</div>
  </div>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const proj = useMemo(() => printProj(EXTENT), []);
  const route = useMemo(() => RIVER_ROUTE.map((p) => proj(p) as [number, number]), [proj]);
  const row = ease(interpolate(frame, T_ROW, [0, 1], clamp));
  const col = ease(interpolate(frame, T_COL, [0, 1], clamp));
  const tilt = interpolate(frame, [0, 60, 130], [8, 14, 30], { ...clamp, easing: ease });
  const sail = interpolate(frame, T_SAIL, [0, 1], clamp);
  const k = sail < 1 ? sail * sail * (3 - 2 * sail) * 0.2 + sail * 0.8 : 1;
  const { p: boat, i: bi } = along(route, k);
  const behind = [...route.slice(0, bi + 1), boat];
  const bob = Math.sin(frame * 0.22) * 2.2;
  // camera: settle on the open sheet, then ease up the river with the boat
  const camY = interpolate(frame, [0, 130, 372, 480], [40, 0, -30, -50], { ...clamp, easing: ease });
  const camS = interpolate(frame, [0, 130, 372, 480], [1.06, 1, 1.1, 1.16], { ...clamp, easing: ease });
  const chedi = interpolate(frame, [T_CHEDI, T_CHEDI + 46], [0, 1], clamp);
  const [cx, cy] = proj(PHUKHAOTHONG) as [number, number];
  const cap = CAPS.find((c) => frame >= c.f0 && frame < c.f1);
  const capK = cap ? fade(frame, cap.f0, cap.f1, 8) : 0;
  return (
    <AbsoluteFill style={{ background: C.slate, overflow: "hidden" }}>
      <Bed id="ship_sailing" from={110} to={380} volume={0.06} />
      <Sfx src={SFX.whoosh} at={T_ROW[0]} volume={0.14} />
      <Sfx src={SFX.whoosh} at={T_COL[0]} volume={0.14} />
      <Hit id="wood_hit" at={T_ROW[1]} volume={0.08} />
      <Hit id="wood_hit" at={T_COL[1]} volume={0.08} />
      {CARDS.map((c) => <Sfx key={c.f} src={SFX.pop} at={c.f} volume={0.18} />)}
      <Hit id="church_bell" at={T_CHEDI + 30} volume={0.08} />
      <Sfx src={SFX.swell} at={T_CHEDI} volume={0.16} />
      <Table width={1080} height={1920} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${camY}px) scale(${camS})`, transformOrigin: "50% 22%" }}>
        <Sheet row={row} col={col} tilt={tilt} print={<Print />} cover={<Cover />}>
          {/* the route sailed so far, in vermilion paper ribbon */}
          <svg width={SHEET.w} height={SHEET.h} style={{ position: "absolute", inset: 0, opacity: sail > 0 ? 1 : 0 }}>
            <polyline points={behind.map((p) => p.join(",")).join(" ")} fill="none" stroke="#8f2a12" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" opacity={0.25} transform="translate(2 3)" />
            <polyline points={behind.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.vermilion} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {CARDS.map((c) => {
            const [x, y] = proj(c.at) as [number, number];
            const kk = ease(interpolate(frame, [c.f, c.f + 16], [0, 1], clamp));
            return (
              <StandUp key={c.text} x={x + c.side * 150} y={y + 20} w={220} h={c.sub ? 96 : 76} k={kk}>
                <PlaceCard text={c.text} sub={c.sub} />
              </StandUp>
            );
          })}
          <StandUp x={cx - 120} y={cy + 6} w={280} h={382} k={chedi > 0 ? Math.min(1, chedi * 2.2) : 0} stand={78}>
            <PaperChedi k={chedi} w={280} />
          </StandUp>
          <StandUp x={boat[0]} y={boat[1] + 12 + bob} w={150} h={108} k={interpolate(frame, [T_SAIL[0] - 8, T_SAIL[0] + 8], [0, 1], clamp)} stand={76}>
            <PaperBoat />
          </StandUp>
        </Sheet>
      </div>
      {/* kicker tag, title */}
      <div style={{ position: "absolute", left: 70, top: 72, display: "flex" }}>
        <div style={{ background: C.vermilion, color: "#fff7ee", fontFamily: font, fontWeight: 700, fontSize: 30, padding: "8px 22px 8px 18px", clipPath: "polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%)", boxShadow: "0 6px 10px rgba(0,0,0,0.4)" }}>M30 · แผนที่พับกระดาษ</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 150, fontFamily: font, fontWeight: 700, fontSize: 92, color: "#f7f1e4", lineHeight: 1.05, textShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>นิราศภูเขาทอง</div>
      <div style={{ position: "absolute", left: 72, top: 262, fontFamily: font, fontWeight: 500, fontSize: 34, color: "#c9d3d1" }}>เส้นทางเรือของสุนทรภู่ · สมัยรัชกาลที่ 3</div>
      <PaperBand style={{ left: 60, right: 60, top: 1632, height: 150 }}>
        <div style={{ fontFamily: font, fontWeight: 600, fontSize: 44, color: C.ink, opacity: capK, textAlign: "center" }}>{cap?.text ?? ""}</div>
      </PaperBand>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1790, height: 130, background: `linear-gradient(rgba(29,38,41,0), ${C.slate} 55%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1836, textAlign: "center", fontFamily: font, fontSize: 19, color: "#93a19f" }}>
        ภาพประกอบ · เส้นทางตามลำน้ำโดยประมาณ · แม่น้ำ © OpenStreetMap contributors
      </div>
    </AbsoluteFill>
  );
};
