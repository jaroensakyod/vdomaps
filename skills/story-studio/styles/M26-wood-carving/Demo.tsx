import type { Feature, MultiLineString } from "geojson";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import { useJson } from "../../components/useJson";
import type { StyleDemo } from "../types";
import { archPath, C, CarveDefs, Carved, Chisel, clamp, countryById, fade, fitProjection, font, g, GoldLeaf, Beads, Groove, H, KanokBorder, KhaoMo, partial, pathOf, riverLines, Rosette, W } from "./kit/Carving";

// M26 carved teak relief: King Mangrai founds Lan Na. Northern Thailand is cut out of a teak panel — the ground
// around it gouged away, rivers chiselled as V-grooves (a chisel and its chips at the head of each cut), every
// city a carved rosette, the one in the story gilded. Mekong → Ngoen Yang, Chiang Rai (1262), Hariphunchai,
// the Ping → Chiang Mai (1296). 16 s.
export const demo: StyleDemo = { id: "M26", name: "แผนที่ไม้แกะสลัก", frames: 480, cover: 420, sizes: ["9x16"] };

type Rivers = { rivers: { features: Feature<MultiLineString, { name: string }>[] } };
const ARCH = { x: 120, y: 352, w: 840, h: 1160 };
const proj = fitProjection([97.75, 17.35, 101.15, 20.45], [150, 520, 780, 960]);
const P = {
  ngoenyang: [100.08, 20.27], chiangrai: [99.83, 19.91], lamphun: [99.01, 18.58], chiangmai: [98.99, 18.79],
} as Record<string, [number, number]>;
const CITY = [
  { at: P.ngoenyang, t: 120, gold: [120, 178], name: "เงินยาง", dx: 0, dy: -40, anchor: "middle" },
  { at: P.chiangrai, t: 182, gold: [182, 252], name: "เชียงราย", dx: -34, dy: 8, anchor: "end" },
  { at: P.lamphun, t: 300, gold: [300, 352], name: "หริภุญไชย", dx: 32, dy: 30, anchor: "start" },
  { at: P.chiangmai, t: 362, gold: [362, 999], name: "เชียงใหม่", dx: -36, dy: -8, anchor: "end", big: true },
];
const CUTS = [
  { name: "Mekong", keys: [[52, 0], [114, 1]] },
  { name: "Ping", keys: [[238, 0], [296, 0.42], [372, 0.42], [470, 1]] },
  { name: "Yom", keys: [[300, 0], [350, 1]] },
];
const BEATS = [
  { f: 40, e: 152, tag: "แคว้นเงินยาง ริมแม่น้ำโขง", head: "พญามังราย", line: "เจ้าเมืองเงินยาง ผู้รวมแคว้นทางเหนือเป็นหนึ่ง" },
  { f: 146, e: 236, tag: "พ.ศ. 1805", head: "สร้างเมืองเชียงราย", line: "ศูนย์กลางแห่งแรกของแคว้นใหม่" },
  { f: 230, e: 350, tag: "ลุ่มแม่น้ำปิง", head: "รวมแคว้นหริภุญไชย", line: "เมืองเก่าของชาวมอญ ปัจจุบันคือลำพูน" },
  { f: 344, e: 520, tag: "พ.ศ. 1839", head: "สร้างเมืองเชียงใหม่", line: "ราชธานีล้านนาริมแม่น้ำปิง เป็นศูนย์กลางราว 260 ปี" },
];
const TH = countryById("764");
// mountain motifs on the northern ranges (decorative positions)
const RANGES: [number, number, number][] = [[98.45, 18.55, 1.1], [98.3, 19.4, 0.9], [99.15, 19.25, 0.95], [100.3, 19.0, 1], [99.7, 18.05, 0.85], [100.9, 19.5, 0.9], [98.75, 17.75, 0.85], [100.35, 17.8, 0.8]];

// Incised text: drawn into the height map (cut) and again as a thin dark stain so it reads at phone size.
// On the aged boards the cut letters are gilded instead (gold leaf in the cut).
const Txt = ({ x, y, size, text, anchor = "middle", cut, k = 1, gild }: { x: number; y: number; size: number; text: string; anchor?: string; cut: boolean; k?: number; gild?: boolean }) => (
  <text x={x} y={y} fontFamily={font} fontSize={size} textAnchor={anchor as never} fill={cut ? g(0.42) : gild ? "url(#m26-gold)" : C.ink} opacity={cut ? k : gild ? k : k * 0.6} style={cut ? undefined : { mixBlendMode: gild ? "hard-light" : "multiply" }}>
    {text}
  </text>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const data = useJson<Rivers>("data/nrs-rivers.json");
  const lines = (name: string) => riverLines(proj, (data?.rivers.features ?? []).filter((f) => f.properties.name === name));
  const cuts = CUTS.map((c) => ({ ...c, lines: lines(c.name), k: interpolate(frame, c.keys.map((x) => x[0]), c.keys.map((x) => x[1]), clamp) }));
  // opening: the ground is gouged away from the top down (a scalloped cut edge)
  const dig = interpolate(frame, [2, 46], [ARCH.y - 40, ARCH.y + ARCH.h + 40], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 1.6) });
  const edge = `M0 ${H} V${dig} ${Array.from({ length: 28 }, (_, i) => `Q${(i + 0.5) * 40} ${dig + (i % 2 ? 26 : -18)} ${(i + 1) * 40} ${dig}`).join(" ")} V${H} Z`;
  const beat = BEATS.filter((b) => frame >= b.f).pop() ?? BEATS[0];
  const bk = fade(frame, beat.f, beat.e, 10);
  const titleK = interpolate(frame, [6, 34], [0, 1], clamp);
  const az = interpolate(frame, [0, demo.frames], [220, 236], clamp);
  const push = interpolate(frame, [0, demo.frames], [1, 1.035], clamp);
  const arch = archPath(ARCH.x, ARCH.y, ARCH.w, ARCH.h);
  const thD = pathOf(proj, TH);
  const texts = (cut: boolean) => (
    <g>
      <g clipPath="url(#m26-title)">
        <Txt x={540} y={190} size={40} text="M26 · แผนที่ไม้แกะสลัก" cut={cut} />
        <Txt x={540} y={296} size={92} text="กำเนิดล้านนา" cut={cut} gild />
      </g>
      {CITY.map((c) => {
        const [x, y] = proj(c.at) as [number, number];
        return <Txt key={c.name} x={x + c.dx} y={y + c.dy + 12} size={c.big ? 44 : 36} text={c.name} anchor={c.anchor} cut={cut} k={interpolate(frame, [c.t + 4, c.t + 16], [0, 1], clamp)} />;
      })}
      <g opacity={bk}>
        <Txt x={540} y={1626} size={36} text={beat.tag} cut={cut} />
        <Txt x={540} y={1712} size={66} text={beat.head} cut={cut} />
        <Txt x={540} y={1782} size={30} text={beat.line} cut={cut} />
      </g>
    </g>
  );
  const heads = cuts.map((c) => {
    const longest = c.lines.slice().sort((a, b) => b.len - a.len)[0];
    return longest ? partial(longest, c.k) : { d: "", ang: 0, head: undefined };
  });
  return (
    <AbsoluteFill style={{ background: "#2a1708" }}>
      <Bed id="jungle_rain" from={0} to={demo.frames} volume={0.06} />
      <Sfx src={SFX.swell} at={4} volume={0.2} />
      {Array.from({ length: 10 }, (_, i) => <Hit key={`d${i}`} id="wood_hit" at={4 + i * 4} volume={0.1} />)}
      {[[52, 114], [238, 296], [300, 350], [372, 470]].flatMap(([a, b]) => Array.from({ length: Math.floor((b - a) / 7) }, (_, i) => a + i * 7)).map((f) => <Hit key={f} id="wood_hit" at={f} volume={0.14} />)}
      {CITY.map((c) => <Sfx key={c.t} src={SFX.hit} at={c.t} volume={0.22} />)}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <CarveDefs az={az} />
        <defs>
          <clipPath id="m26-arch">
            <path d={arch} />
          </clipPath>
          <clipPath id="m26-title">
            <rect x={120} y={120} width={840 * titleK} height={220} />
          </clipPath>
        </defs>
        <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>
          <Carved>
            <KanokBorder />
            {/* title board and caption board: raised plates with a bevel */}
            {[[120, 116, 840, 218], [120, 1540, 840, 290]].map(([x, y, w, h], i) => (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} rx={10} fill={g(0.7)} />
                <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={6} fill={g(0.93)} />
                <Beads x={x + 20} y={y + 22} w={w - 40} />
                <Beads x={x + 20} y={y + h - 22} w={w - 40} />
              </g>
            ))}
            {/* the arch: rim bead, gouged ground, Thailand raised */}
            <path d={arch} fill={g(0.6)} stroke={g(1)} strokeWidth={16} />
            <g clipPath="url(#m26-arch)">
              <rect x={0} y={0} width={W} height={H} fill="url(#m26-gouge)" />
              <path d={thD} fill={g(0.6)} transform="translate(0 3)" />
              <path d={thD} fill={g(0.88)} stroke={g(0.7)} strokeWidth={5} strokeLinejoin="round" />
              {/* neighbours named in low raised letters on the cut ground */}
              <text x={260} y={760} fontFamily={font} fontSize={40} fill={g(0.6)} textAnchor="middle">พม่า</text>
              <text x={850} y={1080} fontFamily={font} fontSize={40} fill={g(0.6)} textAnchor="middle">ลาว</text>
              {cuts.map((c) => c.lines.map((l, i) => <Groove key={`${c.name}${i}`} d={partial(l, c.k).d} w={c.name === "Mekong" ? 12 : 9} />))}
              {RANGES.map(([lo, la, sc], i) => {
                const [x, y] = proj([lo, la]) as [number, number];
                return <KhaoMo key={i} x={x} y={y} s={sc} k={interpolate(frame, [40 + i * 6, 58 + i * 6], [0, 1], clamp)} />;
              })}
              {CITY.map((c) => {
                const [x, y] = proj(c.at) as [number, number];
                return <Rosette key={c.name} x={x} y={y} r={c.big ? 30 : 22} k={interpolate(frame, [c.t, c.t + 10], [0, 1], clamp)} />;
              })}
            </g>
            <path d={arch} fill="none" stroke={g(1)} strokeWidth={16} />
            <path d={arch} fill="none" stroke={g(0.5)} strokeWidth={4} opacity={0.9} />
            {frame < 48 && (
              <g clipPath="url(#m26-arch)">
                <path d={edge} fill={g(0.88)} />
              </g>
            )}
            {texts(true)}
          </Carved>
          {/* the old surface of the panel is dark, oiled teak; the fresh cut inside the arch is light */}
          <path d={`M0 0H${W}V${H}H0Z ${arch} M128 1548H952V1822H128Z M128 124H952V326H128Z`} fillRule="evenodd" fill="#6e4e36" style={{ mixBlendMode: "multiply" }} />
          {/* fresh-cut teak is golden with an olive cast */}
          <path d={arch} fill="#4a3a12" style={{ mixBlendMode: "screen" }} />
          {texts(false)}
          {/* gold leaf in the cut title and on the arch bead */}
          <path d={arch} fill="none" stroke="url(#m26-gold)" strokeWidth={7} opacity={interpolate(frame, [40, 70], [0, 0.9], clamp)} style={{ mixBlendMode: "hard-light" }} />
          {/* gold leaf on the city in the story */}
          {CITY.map((c) => {
            const [x, y] = proj(c.at) as [number, number];
            const k = fade(frame, c.gold[0] + 4, c.gold[1], 14);
            const r = c.big ? 30 : 22;
            return <GoldLeaf key={c.name} x={x} y={y} r={r} k={k} />;
          })}
          {cuts.map((c, i) => <Chisel key={c.name} at={heads[i].head} ang={heads[i].ang} frame={frame} k={c.k} />)}
        </g>
        <rect width={W} height={H} fill="url(#m26-vig)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: font, fontSize: 15, color: "#e8c89a", opacity: 0.8 }}>
        ภาพประกอบ · ตำแหน่งเมืองโดยประมาณ · เส้นเขตแดนปัจจุบันเพื่ออ้างอิง · แผนที่ Natural Earth
      </div>
    </AbsoluteFill>
  );
};
