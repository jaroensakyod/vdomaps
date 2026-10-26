import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, CloudBand, Cobalt, Crackle, Defs, font, Glaze, Junk, LAND, Motif, pathOf, Peaks, Plate, Ripples, Rosewood, WaveBand, wellProjection } from "./kit/Porcelain";

// M22 porcelain map: how blue-and-white ware travelled from the kilns of Jingdezhen to Ayutthaya, painted as a
// cobalt map in the well of a white plate. The plate turns in on a rosewood stand, the route is brushed on (river and
// pass to Guangzhou, then a junk down the coast), each place appears as a little painted motif. 18 s.
export const demo: StyleDemo = { id: "M22", name: "แผนที่ลายคราม", frames: 540, cover: 432, sizes: ["9x16"] };

const W = 1080;
const H = 1920;
const R = 500;
const CX = 540;
const CY = 930;
const RW = 0.655 * R; // the well
const proj = wellProjection([95, 5.5, 124, 34.5], RW * 0.98);
const path = pathOf(proj);

type P = [number, number];
const JDZ: P = [117.18, 29.27];
const GZ: P = [113.26, 23.13];
const AYU: P = [100.57, 14.35];
// river and pass (approximate), then the sea leg round the south of Vietnam (approximate)
const RIVER: P[] = [JDZ, [116.4, 28.9], [115.9, 28.7], [115.2, 27.2], [114.9, 25.8], [114.3, 25.3], [113.6, 24.8], [113.4, 23.9], GZ];
const SEA: P[] = [GZ, [113.7, 22.0], [112.2, 19.6], [110.6, 16.8], [109.5, 13.2], [108.0, 10.0], [105.6, 8.3], [103.4, 9.9], [101.6, 12.0], [100.6, 13.4], AYU];

const lineTo = (pts: P[], k: number) => {
  const xy = pts.map((p) => proj(p)!);
  const seg = xy.slice(1).map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = total * Math.max(0, Math.min(1, k));
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  let head = xy[0];
  let ang = 0;
  for (let i = 0; i < seg.length && left > 0; i++) {
    const t = Math.min(1, left / seg[i]);
    head = [xy[i][0] + (xy[i + 1][0] - xy[i][0]) * t, xy[i][1] + (xy[i + 1][1] - xy[i][1]) * t];
    ang = Math.atan2(xy[i + 1][1] - xy[i][1], xy[i + 1][0] - xy[i][0]);
    d += ` L${head[0]} ${head[1]}`;
    left -= seg[i];
  }
  return { d, head, ang };
};

const CAPS = [
  { f: 50, to: 175, t: "จิ่งเต๋อเจิ้น เมืองเตาเผาเครื่องลายคราม", s: "มณฑลเจียงซี ประเทศจีน" },
  { f: 175, to: 290, t: "ล่องแม่น้ำ ข้ามเขา ลงไปท่าเรือกวางตุ้ง", s: "เส้นทางโดยประมาณ" },
  { f: 290, to: 416, t: "สำเภาแล่นลงใต้ อ้อมปลายแหลมญวน", s: "บรรทุกถ้วยชามมาขายทางทะเล" },
  { f: 416, to: 560, t: "ถึงกรุงศรีอยุธยา", s: "ยังพบเศษเครื่องลายครามจีนในเมืองเก่า" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const turnIn = interpolate(frame, [0, 70], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const turn = -32 * (1 - turnIn) + interpolate(frame, [70, demo.frames], [-3, 3], clamp);
  const on = interpolate(frame, [0, 16], [0, 1], clamp);
  const river = interpolate(frame, [95, 200], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const sea = interpolate(frame, [230, 440], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const show = (f: number, d = 18) => interpolate(frame, [f, f + d], [0, 1], clamp);
  const rv = lineTo(RIVER, river);
  const sv = lineTo(SEA, sea);
  const [jx, jy] = proj(JDZ)!;
  const [gx, gy] = proj(GZ)!;
  const [ax, ay] = proj(AYU)!;
  const sailing = frame >= 230 && frame < 434;
  const cap = CAPS.find((c) => frame >= c.f && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.f, cap.f + 14, cap.to - 10, cap.to], [0, 1, 1, cap.to >= demo.frames ? 1 : 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.woodDeep }}>
      <Bed id="sea_rough" from={230} to={460} volume={0.08} />
      <Sfx src={SFX.swell} at={0} volume={0.28} />
      <Sfx src={SFX.whoosh} at={0} volume={0.2} />
      {[60, 200, 440].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.3} />)}
      <Sfx src={SFX.hit} at={446} volume={0.25} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: on }}>
        <Defs />
        <Rosewood w={W} h={H} />
        <g transform={`translate(${CX} ${CY})`}>
          <Plate r={R} turn={turn}>
            <Cobalt>
              <WaveBand r0={R * 0.875} r1={R * 0.975} />
              <CloudBand r0={R * 0.695} r1={R * 0.86} />
              <circle r={RW + 8} fill="none" stroke={C.cobalt} strokeWidth={1.4} />
              <circle r={RW} fill="none" stroke={C.cobalt} strokeWidth={3} />
            </Cobalt>
            <defs>
              <clipPath id="m22-well">
                <circle r={RW - 3} />
              </clipPath>
            </defs>
            <g clipPath="url(#m22-well)">
              <Cobalt>
                <Ripples rr={RW} />
                {/* land: pale wash knocks out the ripples, then a darker wash and the brushed coast */}
                <path d={path(LAND) ?? ""} fill={C.glaze} />
                <path d={path(LAND) ?? ""} fill={C.pale} opacity={0.85} />
                <path d={path(LAND) ?? ""} fill="none" stroke={C.cobalt} strokeWidth={3.4} strokeLinejoin="round" />
                <path d={path(LAND) ?? ""} fill="none" stroke={C.wash} strokeWidth={9} strokeLinejoin="round" opacity={0.35} />
                <Peaks x={proj([104.5, 26.5])![0]} y={proj([104.5, 26.5])![1]} s={1.2} />
                <Peaks x={proj([110.8, 27.2])![0]} y={proj([110.8, 27.2])![1]} s={1} />
                <Peaks x={proj([102.4, 19.4])![0]} y={proj([102.4, 19.4])![1]} s={0.95} />
                <Peaks x={proj([99.2, 17.8])![0]} y={proj([99.2, 17.8])![1]} s={0.8} />
                <Motif kind="flower" x={proj([118.6, 25.4])![0]} y={proj([118.6, 25.4])![1]} s={1} />
                <Motif kind="flower" x={proj([106.5, 15.8])![0]} y={proj([106.5, 15.8])![1]} s={0.9} />
                {/* the route, brushed on in dotted cobalt */}
                <path d={rv.d} fill="none" stroke={C.cobalt} strokeWidth={4} strokeDasharray="2 9" strokeLinecap="round" />
                <path d={sv.d} fill="none" stroke={C.cobalt} strokeWidth={4.2} strokeDasharray="12 8" strokeLinecap="round" />
                <g opacity={show(55)}>
                  <Motif kind="kiln" x={jx} y={jy - 6} s={1.15} />
                </g>
                <g opacity={show(196)}>
                  <Motif kind="pagoda" x={gx + 4} y={gy - 4} s={0.95} />
                </g>
                <g opacity={show(420)}>
                  <Motif kind="prang" x={ax} y={ay - 2} s={1.05} />
                </g>
                {sailing && <Junk x={sv.head[0]} y={sv.head[1]} s={0.95} rot={Math.max(-18, Math.min(18, (sv.ang * 180) / Math.PI * 0.15))} />}
              </Cobalt>
              <g fontFamily={font} fontWeight={700} fill={C.text}>
                <text x={jx - 30} y={jy + 12} fontSize={30} textAnchor="end" opacity={show(62)}>จิ่งเต๋อเจิ้น</text>
                <text x={gx - 30} y={gy + 12} fontSize={30} textAnchor="end" opacity={show(204)}>กวางตุ้ง</text>
                <text x={ax + 6} y={ay + 52} fontSize={32} textAnchor="middle" opacity={show(426)}>กรุงศรีอยุธยา</text>
                <text x={proj([114.8, 15.2])![0]} y={proj([114.8, 15.2])![1]} fontSize={30} fontWeight={400} textAnchor="middle" fill={C.cobalt} opacity={0.85}>ทะเลจีนใต้</text>
              </g>
            </g>
          </Plate>
          <Crackle rr={R * 0.97} n={90} />
          <Glaze r={R} glint={turnIn} />
        </g>
        {/* the museum card */}
        <g opacity={capK}>
          <rect x={110} y={1515} width={860} height={176} rx={6} fill="#000" opacity={0.5} filter="url(#m22-soft)" />
          <rect x={100} y={1500} width={880} height={176} rx={6} fill="#fbfaf5" />
          <rect x={114} y={1514} width={852} height={148} rx={3} fill="none" stroke={C.cobalt} strokeWidth={1.6} />
          <rect x={120} y={1520} width={840} height={136} rx={2} fill="none" stroke={C.cobalt} strokeWidth={0.8} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 1530, left: 120, right: 120, height: 120, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: font, color: C.text, opacity: capK, textAlign: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2 }}>{cap.t}</div>
        <div style={{ fontSize: 30, color: "#4d68a8", marginTop: 4 }}>{cap.s}</div>
      </div>
      <div style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#f1f4fa", opacity: interpolate(frame, [6, 26], [0, 1], clamp) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#9fb6e3" }}>M22 · แผนที่ลายคราม</div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.2, marginTop: 6 }}>ทางของเครื่องลายคราม</div>
        <div style={{ fontSize: 38, color: "#9fb6e3" }}>จากเตาเผาจีน สู่กรุงศรีอยุธยา</div>
      </div>
      <div style={{ position: "absolute", bottom: 72, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 25, color: "#8f8d86" }}>
        ภาพประกอบ · เส้นทางโดยประมาณ · แผนที่วาดจาก Natural Earth
      </div>
    </AbsoluteFill>
  );
};
