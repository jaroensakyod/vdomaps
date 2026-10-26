import type { FeatureCollection, Geometry } from "geojson";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { useJson } from "../../components/useJson";
import type { StyleDemo } from "../types";
import { along, Beams, C, clamp, DarkMap, Defs, fit, font, geoPath, Impact, landFromCoast, LightMask, LitMap, ramp, Ship, StarShell, Tag, Tracer, Track, type Beam, type Flare } from "./kit/Night";

// M23 searchlight sea: the Battle of Ko Chang, 17 January 1941, as a night plot. The French squadron closes from
// the south-west in the dark; searchlights sweep and star shells light the islands in flashes; tracers cross to
// the torpedo boats, then to HTMS Thonburi in the eastern channel. Positions are approximate; the lights are a
// dramatisation (the battle began at first light). 18 s.
export const demo: StyleDemo = { id: "M23", name: "ไฟฉายกลางทะเล", frames: 540, cover: 262, sizes: ["9x16"] };

const W = 1080;
const H = 1920;
const BOX: [number, number, number, number] = [0, 330, 1080, 1260];
const proj = fit([102.02, 11.6, 102.66, 12.3], BOX);
const path = geoPath(proj);
const P = (lon: number, lat: number) => proj([lon, lat]) as [number, number];

// approximate positions (see STYLE.md "Data")
const LP: [number, number][] = [P(102.05, 11.6), P(102.17, 11.72), P(102.27, 11.81), P(102.31, 11.84)]; // Lamotte-Picquet
const AV: [number, number][] = [P(102.14, 11.6), P(102.24, 11.7), P(102.33, 11.78), P(102.37, 11.8)]; // the four avisos
const TB1 = P(102.38, 11.9); // torpedo boats at the anchorage south of Ko Chang
const TB2 = P(102.415, 11.885);
const TH: [number, number][] = [P(102.53, 11.93), P(102.49, 11.99), P(102.45, 12.05)]; // Thonburi, heading NW

const CAPS = [
  { f: 10, to: 140, time: "05:30", t: "กองเรือฝรั่งเศสเข้าใกล้เกาะช้าง", s: "มาจากทางตะวันตกเฉียงใต้ ในความมืด" },
  { f: 140, to: 230, time: "06:05", t: "เครื่องบินลาดตระเวนพบเรือตอร์ปิโดไทย", s: "จอดอยู่ในอ่าวใต้เกาะช้าง" },
  { f: 230, to: 320, time: "ต่อมา", t: "ร.ล.ชลบุรี และ ร.ล.สงขลา ถูกยิงจม", s: "เรือตอร์ปิโดทั้งสองลำ" },
  { f: 320, to: 450, time: "06:38", t: "ร.ล.ธนบุรี ยิงตอบโต้", s: "จนถูกยิงเสียหายหนัก" },
  { f: 450, to: 560, time: "17 ม.ค. 2484", t: "ทหารเรือไทยเสียชีวิต 36 นาย", s: "ตามตัวเลขฝ่ายไทย" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const coast = useJson<FeatureCollection<Geometry>>("data/kochang-coast.geojson");
  const land = landFromCoast(coast, proj, [[103.6, 11.6], [103.6, 13.2], [101.9, 13.2]]);
  const on = interpolate(frame, [0, 24], [0, 1], clamp);
  const approach = interpolate(frame, [10, 200], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const lp = along(LP, approach);
  const av = along(AV, approach);
  const th = along(TH, interpolate(frame, [300, 540], [0, 1], clamp));
  const sunk1 = interpolate(frame, [250, 300], [0, 1], clamp);
  const sunk2 = interpolate(frame, [275, 330], [0, 1], clamp);

  // searchlights: the cruiser's sweeps across the islands, then locks on the anchorage, then on Thonburi
  const toward = (a: [number, number], b: [number, number]) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const sweep = interpolate(frame, [20, 150], [-95, -40], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const lock1 = toward(lp, TB1);
  const lock2 = toward(lp, th);
  const lpAngle = frame < 150 ? sweep : frame < 300 ? interpolate(frame, [150, 175], [sweep, lock1], clamp) : interpolate(frame, [300, 330], [lock1, lock2], clamp);
  const beams: Beam[] = [
    { x: lp[0], y: lp[1], angle: lpAngle + Math.sin(frame * 0.07) * 1.2, spread: 6, len: 1150, k: on },
    { x: av[0], y: av[1], angle: (frame < 230 ? -70 + Math.sin(frame * 0.03) * 22 : toward(av, frame < 320 ? TB2 : th)) + Math.sin(frame * 0.09), spread: 4.6, len: 950, k: on * 0.9 },
  ];
  // star shells: fall slowly and burn out
  const shells = [
    { at: 150, x: P(102.4, 11.95)[0], y: P(102.4, 11.95)[1] },
    { at: 318, x: P(102.5, 12.02)[0], y: P(102.5, 12.02)[1] },
  ];
  const flares: Flare[] = shells.map((s) => {
    const t = frame - s.at;
    const k = t < 0 ? 0 : interpolate(t, [0, 6, 120, 160], [0, 1, 0.8, 0], clamp);
    return { x: s.x, y: s.y + Math.max(0, t) * 0.6, r: 700, k };
  });
  const hits = [
    { at: 252, x: TB1[0], y: TB1[1] },
    { at: 278, x: TB2[0], y: TB2[1] },
    { at: 376, x: 0, y: 0, th: true },
    { at: 414, x: 0, y: 0, th: true },
  ].map((h) => (h.th ? { ...h, x: th[0], y: th[1] } : h));
  const flashes: Flare[] = hits.map((h) => ({ x: h.x, y: h.y, r: 260, k: ramp(frame, h.at, h.at + 2, h.at + 8, h.at + 28) }));
  const muzzles = [204, 218, 232, 246, 340, 352, 364, 392, 404];
  const muzzleK = Math.max(0, ...muzzles.map((m) => ramp(frame, m, m + 1, m + 2, m + 7)));
  const allFlashes: Flare[] = [...flashes, { x: lp[0], y: lp[1], r: 300, k: muzzleK * 0.8 }];
  const cap = CAPS.find((c) => frame >= c.f && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.f, cap.f + 10, cap.to - 8, cap.to], [0, 1, 1, cap.to >= demo.frames ? 1 : 0], clamp);
  const lit = (x: number, y: number) => (frame > 150 && Math.hypot(x - flares[0].x, y - flares[0].y) < 400 ? flares[0].k : 0);
  const shake = Math.max(...hits.map((h) => ramp(frame, h.at, h.at + 1, h.at + 3, h.at + 12))) * 5;
  return (
    <AbsoluteFill style={{ background: C.sea }}>
      <Bed id="sea_rough" from={0} to={demo.frames} volume={0.1} />
      <Sfx src={SFX.riser} at={90} volume={0.15} />
      {shells.map((s) => <Sfx key={s.at} src={SFX.pop} at={s.at} volume={0.3} />)}
      {muzzles.map((m) => <Hit key={m} id="cannon_far" at={m} volume={0.28} />)}
      {hits.map((h) => <Hit key={h.at} id="explosion_mid" at={h.at} volume={0.35} />)}
      <Sfx src={SFX.hit} at={450} volume={0.25} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: on }}>
        <Defs />
        <LightMask id="m23-warm" beams={[]} flares={flares} flashes={flashes} />
        <LightMask id="m23-light" beams={beams} flares={flares} flashes={allFlashes} dawn={interpolate(frame, [300, 530], [0, 0.85], clamp)} />
        <g transform={`translate(${Math.sin(frame * 3.1) * shake} ${Math.cos(frame * 2.3) * shake})`}>
          <rect width={W} height={H} fill={C.sea} />
          <DarkMap path={path} coast={coast} land={land} />
          {/* the map as the light shows it */}
          <g mask="url(#m23-light)">
            <LitMap path={path} coast={coast} land={land} w={W} h={H} />
          </g>
          {/* the flare tints what it lights warm */}
          <g mask="url(#m23-warm)" style={{ mixBlendMode: "multiply" }} opacity={Math.max(flares[0].k, flares[1].k) * 0.55}>
            <rect width={W} height={H} fill={C.flare} />
          </g>
          <Beams beams={beams} />
          <Track pts={LP} k={approach} />
          <Track pts={AV} k={approach} />
          {/* tracers */}
          <Tracer a={lp} b={TB1} frame={frame} k={ramp(frame, 200, 210, 262, 276)} />
          <Tracer a={av} b={TB2} frame={frame + 7} k={ramp(frame, 214, 224, 286, 300)} bend={-0.1} />
          <Tracer a={lp} b={th} frame={frame} k={ramp(frame, 336, 346, 420, 434)} bend={0.08} />
          <Tracer a={th} b={lp} frame={frame + 11} k={ramp(frame, 348, 360, 430, 446)} bend={0.1} />
          <Tracer a={av} b={th} frame={frame + 3} k={ramp(frame, 360, 372, 426, 440)} bend={-0.12} />
          {flares.map((f, i) => <StarShell key={i} x={f.x} y={f.y} k={f.k} frame={frame} />)}
          {hits.map((h) => <Impact key={h.at} x={h.x} y={h.y} t={(frame - h.at) / 26} />)}
          {/* ships */}
          <Ship x={lp[0]} y={lp[1]} kind="cruiser" heading={40} s={1.15} lit={muzzleK} />
          <Ship x={av[0]} y={av[1]} kind="sloop" heading={40} s={0.95} />
          <Ship x={av[0] - 30} y={av[1] + 34} kind="sloop" heading={40} s={0.85} />
          <Ship x={TB1[0]} y={TB1[1]} kind="torpedo" heading={180} s={1.1} lit={lit(TB1[0], TB1[1])} sunk={sunk1} />
          <Ship x={TB2[0]} y={TB2[1]} kind="torpedo" heading={0} s={1.1} lit={lit(TB2[0], TB2[1])} sunk={sunk2} />
          <g opacity={interpolate(frame, [300, 320], [0, 1], clamp)}>
            <Ship x={th[0]} y={th[1]} kind="coastal" heading={135} s={1.25} lit={frame > 318 ? 1 : 0} />
          </g>
          {/* labels */}
          <Tag x={lp[0] - 30} y={lp[1] + 52} text="ลามอตต์-ปีเกต์" sub="เรือลาดตระเวน · ฝรั่งเศส" anchor="end" k={interpolate(frame, [40, 60], [0, 1], clamp)} />
          <Tag x={av[0] + 40} y={av[1] + 72} text="เรือสลุป 4 ลำ" sub="ฝรั่งเศส" k={interpolate(frame, [60, 80], [0, 1], clamp)} />
          <Tag x={TB1[0] - 34} y={TB1[1] - 34} text={frame > 280 ? "ร.ล.ชลบุรี · จม" : "ร.ล.ชลบุรี"} anchor="end" warm={frame > 280} k={interpolate(frame, [160, 176], [0, 1], clamp)} />
          <Tag x={TB2[0] + 30} y={TB2[1] + 46} text={frame > 305 ? "ร.ล.สงขลา · จม" : "ร.ล.สงขลา"} warm={frame > 305} k={interpolate(frame, [170, 186], [0, 1], clamp)} />
          <Tag x={th[0] + 46} y={th[1] - 18} text="ร.ล.ธนบุรี" sub="เรือปืนหนัก · ไทย" k={interpolate(frame, [324, 340], [0, 1], clamp)} />
          <Tag x={P(102.34, 12.07)[0]} y={P(102.34, 12.07)[1]} text="เกาะช้าง" anchor="middle" k={0.85 * on} />
          <Tag x={P(102.57, 11.66)[0]} y={P(102.57, 11.66)[1]} text="เกาะกูด" anchor="middle" k={0.7 * on} />
          <Tag x={P(102.56, 12.25)[0]} y={P(102.56, 12.25)[1]} text="ตราด" anchor="middle" k={0.6 * on} />
        </g>
        <rect width={W} height={H} filter="url(#m23-grain)" />
        {/* a hard frame: blacked-out top and bottom bands for the title and the log */}
        <defs>
          <linearGradient id="m23-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor={C.sea} />
            <stop offset="1" stopColor={C.sea} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="m23-bot" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0.5" stopColor={C.sea} />
            <stop offset="1" stopColor={C.sea} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={W} height={420} fill="url(#m23-top)" />
        <rect y={1500} width={W} height={420} fill="url(#m23-bot)" />
      </svg>
      <div style={{ position: "absolute", top: 84, left: 70, right: 70, fontFamily: font, color: C.text, opacity: interpolate(frame, [6, 24], [0, 1], clamp) }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 2, color: C.iceDim }}>M23 · ไฟฉายกลางทะเล</div>
        <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.1, marginTop: 6, textShadow: "0 0 24px rgba(160,210,255,0.45)" }}>ยุทธนาวีเกาะช้าง</div>
        <div style={{ fontSize: 34, fontWeight: 400, color: "#a9c6e2", marginTop: 6 }}>
          รุ่งสาง 17 มกราคม 2484 <span style={{ color: C.flare }}>●</span> อ่าวไทย
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1580, fontFamily: font, color: C.text, opacity: capK }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, borderTop: `2px solid ${C.iceDim}`, paddingTop: 18 }}>
          <div style={{ fontSize: 54, fontWeight: 700, color: C.ice, fontVariantNumeric: "tabular-nums", minWidth: 170 }}>{cap.time}</div>
          <div>
            <div style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.2 }}>{cap.t}</div>
            <div style={{ fontSize: 30, color: "#a9c6e2", marginTop: 2 }}>{cap.s}</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 64, left: 70, right: 70, fontFamily: font, fontSize: 22, color: "#5f7b96" }}>
        ภาพจำลอง · ตำแหน่งโดยประมาณ · แสงไฟเพื่อการเล่าเรื่อง · © OpenStreetMap
      </div>
    </AbsoluteFill>
  );
};
