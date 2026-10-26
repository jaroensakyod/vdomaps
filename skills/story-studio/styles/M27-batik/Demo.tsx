import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { BatikDefs, bathPath, C, Canting, clamp, Clove, cracks, fade, fitProjection, font, H, landIn, Nutmeg, pathOf, RedDrop, W } from "./kit/Batik";

// M27 batik: the Spice Islands told on a batik cloth. The canting draws the coasts in wax, the land is waxed,
// an indigo bath turns the sea blue (veins crack into the wax), the sea is waxed, a soga bath turns the land
// brown, the wax is boiled off. Then red mengkudu motifs mark Ternate and Tidore (cloves) and the Banda Islands
// (nutmeg), and a wax-dot sea lane leads west towards Malacca. 18 s.
export const demo: StyleDemo = { id: "M27", name: "แผนที่บาติก", frames: 540, cover: 300, sizes: ["9x16"] };

const BOX: [number, number, number, number] = [118.4, -9.6, 135.2, 4.2];
const LAND = landIn([110, -14, 142, 8]);
const proj = fitProjection(BOX, [30, 380, 1020, 1150], [354, 1546]);
const free = fitProjection(BOX, [30, 380, 1020, 1150]); // unclipped, for points
const P = {
  ternate: [127.35, 0.79], tidore: [127.4, 0.68], banda: [129.9, -4.53], ambon: [128.18, -3.7], makassar: [119.42, -5.14],
} as Record<string, [number, number]>;
const at = (p: [number, number]) => free(p) as [number, number];

const T = { draw: [6, 84], fill: [84, 108], indigo: [110, 150], seaWax: [150, 166], soga: [166, 206], boil: [206, 232] };
const BEATS = [
  { f: 14, e: 240, tag: "อินโดนีเซียตะวันออก", head: "หมู่เกาะเครื่องเทศ", line: "มาลุกู แหล่งเครื่องเทศที่โลกเคยแย่งชิงกัน" },
  { f: 236, e: 340, tag: "เตอร์นาเต · ติโดเร", head: "บ้านเกิดของกานพลู", line: "ต้นกานพลูเป็นพืชพื้นเมืองของหมู่เกาะมาลุกู" },
  { f: 336, e: 446, tag: "หมู่เกาะบันดา", head: "จันทน์เทศมีที่นี่ที่เดียว", line: "เป็นแหล่งจันทน์เทศแห่งเดียวของโลก จนถึงกลางคริสต์ศตวรรษที่ 19" },
  { f: 442, e: 560, tag: "เส้นทางเครื่องเทศ", head: "ล่องตะวันตกสู่มะละกา", line: "พ่อค้าขนเครื่องเทศผ่านเมืองท่ามะละกา ต่อไปอินเดียและยุโรป" },
];
const NAMES = [
  { p: [121.2, -1.2], t: "สุลาเวสี", s: 40 },
  { p: [129.3, 1.9], t: "ฮัลมาเฮรา", s: 30 },
  { p: [129.6, -2.6], t: "เซรัม", s: 30 },
  { p: [133.4, -1.9], t: "ปาปัว", s: 36 },
  { p: [124.3, -9.1], t: "ติมอร์", s: 30 },
] as { p: [number, number]; t: string; s: number }[];
const ROUTE: [number, number][] = [[129.9, -4.53], [128.6, -4.2], [126.8, -4.9], [124.2, -5.7], [121.6, -5.9], [119.6, -5.3], [117.2, -4.6]];

export const Demo = () => {
  const frame = useCurrentFrame();
  const k = (r: number[]) => interpolate(frame, r, [0, 1], clamp);
  const kDraw = k(T.draw), kFill = k(T.fill), kInd = k(T.indigo), kSeaWax = k(T.seaWax), kSoga = k(T.soga), kBoil = k(T.boil);
  const landD = pathOf(proj, LAND);
  // wax lines are drawn on along a diagonal front
  const front = interpolate(kDraw, [0, 1], [-400, W + H + 200]);
  const wipe = `M-50 -50 L${front} -50 L${front - H - 100} ${H + 50} L-50 ${H + 50} Z`;
  const tool: [number, number] = [Math.max(60, Math.min(W - 60, front - 1000 + Math.sin(frame * 0.4) * 120)), 0];
  tool[1] = front - tool[0];
  const beat = BEATS.filter((b) => frame >= b.f).pop() ?? BEATS[0];
  const bk = fade(frame, beat.f, beat.e, 10);
  const capColor = "#2a1d14";
  const [tx, ty] = at(P.tidore), [ttx, tty] = at(P.ternate), [bx, by] = at(P.banda);
  const routeD = `M${ROUTE.map((p) => at(p).map((v) => v.toFixed(1)).join(" ")).join(" L")}`;
  const routeK = k([450, 520]);
  // everything that stays cream to the end: coast double line, isen-isen, tumpal, band rules, title
  const lines = (v: "k" | "w") => {
    const ink = v === "k" ? "#000" : "#fff";
    const gap = v === "k" ? "#fff" : "#000";
    return (
      <g>
        <path d={landD} fill="none" stroke={ink} strokeWidth={13} strokeLinejoin="round" />
        <path d={landD} fill="none" stroke={gap} strokeWidth={5} strokeLinejoin="round" />
        <path d={landD} fill="none" stroke={ink} strokeWidth={3.4} strokeDasharray="0 11" strokeLinecap="round" />
        <rect x={0} y={350} width={W} height={1200} fill={`url(#m27-waves-${v})`} mask="url(#m27-notland)" />
        <rect x={0} y={350} width={W} height={1200} fill={`url(#m27-dots-${v})`} mask="url(#m27-landonly)" />
      </g>
    );
  };
  // the head band motifs: tumpal row, title, rules — wax, so they stay cream on the indigo head band
  const head = (v: "k" | "w") => {
    const ink = v === "k" ? "#000" : "#fff";
    return (
      <g>
        <rect x={0} y={1806} width={W} height={52} fill={`url(#m27-dots-${v})`} />
        {[340, 352, 1548, 1560, 24, 36, H - 36, H - 24].map((y) => <rect key={y} x={0} y={y - 2} width={W} height={4} fill={ink} />)}
        <rect x={0} y={100} width={W} height={120} fill={`url(#m27-tumpal-${v})`} />
        <text x={W / 2} y={82} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={34} fill={ink} letterSpacing="2">M27 · แผนที่บาติก</text>
        <text x={W / 2} y={318} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={80} fill={ink} stroke={ink} strokeWidth={1}>หมู่เกาะเครื่องเทศ</text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <Bed id="sea_rough" from={0} to={demo.frames} volume={0.05} />
      <Sfx src={SFX.swell} at={4} volume={0.2} />
      <Hit id="splash" at={T.indigo[0]} volume={0.22} />
      <Hit id="splash" at={T.soga[0]} volume={0.22} />
      <Hit id="splash_big" at={T.boil[0]} volume={0.1} />
      {[250, 262, 352].map((f) => <Sfx key={f} src={SFX.pop} at={f} volume={0.25} />)}
      <Hit id="ship_bell" at={452} volume={0.14} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <BatikDefs />
        <defs>
          <mask id="m27-notland" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect width={W} height={H} fill="#fff" />
            <path d={landD} fill="#000" stroke="#000" strokeWidth={30} />
          </mask>
          <mask id="m27-landonly" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <path d={landD} fill="#fff" stroke="#000" strokeWidth={22} />
          </mask>
          <clipPath id="m27-wipe">
            <path d={wipe} />
          </clipPath>
          <clipPath id="m27-bathI">
            <path d={bathPath(kInd, frame)} />
          </clipPath>
          <clipPath id="m27-bathS">
            <path d={bathPath(kSoga, frame)} />
          </clipPath>
          {/* indigo resists: the lines, the land, the caption band */}
          <mask id="m27-dyeI" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <g clipPath="url(#m27-bathI)">
              <rect width={W} height={H} fill="#fff" />
              <path d={landD} fill="#000" />
              <rect x={0} y={1550} width={W} height={H} fill="#000" />
              {lines("k")}
              {head("k")}
            </g>
          </mask>
          {/* soga resists: the lines and the (re-waxed) sea and head band */}
          <mask id="m27-dyeS" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <g clipPath="url(#m27-bathS)">
              <rect width={W} height={H} fill="#fff" />
              <rect x={0} y={0} width={W} height={H} fill="#000" />
              <path d={landD} fill="#fff" />
              {lines("k")}
              {head("k")}
            </g>
          </mask>
          <mask id="m27-cracks" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <g clipPath="url(#m27-bathI)">
              <path d={landD} fill="#fff" />
              <rect x={0} y={1550} width={W} height={H} fill="#fff" />
            </g>
          </mask>
        </defs>
        <rect width={W} height={H} fill={C.cream} />
        <rect width={W} height={H} fill={C.indigo} mask="url(#m27-dyeI)" />
        <rect width={W} height={H} fill="#82532c" mask="url(#m27-dyeS)" style={{ mixBlendMode: "multiply" }} />
        <path d={cracks()} fill="none" stroke={C.indigo} strokeWidth={1.1} strokeLinejoin="round" mask="url(#m27-cracks)" opacity={0.6} />
        <path d={cracks()} fill="none" stroke={C.indigo} strokeWidth={3.2} strokeLinejoin="round" mask="url(#m27-cracks)" opacity={0.12} />
        <rect width={W} height={H} filter="url(#m27-cotton)" opacity={0.55} />
        {/* wax on the cloth (yellowish, glossy) until it is boiled off */}
        <g opacity={1 - kBoil}>
          <path d={landD} fill={C.wax} opacity={kFill * 0.42} style={{ mixBlendMode: "multiply" }} />
          <rect x={0} y={1550} width={W} height={H} fill={C.wax} opacity={kFill * 0.42} style={{ mixBlendMode: "multiply" }} />
          <rect x={0} y={0} width={W} height={1550} fill="#fff6d8" opacity={kSeaWax * 0.18} />
        </g>
        {/* the wax lines while they are only wax on cream: drawn on with the canting */}
        <g opacity={interpolate(kInd, [0, 0.5], [1, 0], clamp)} clipPath="url(#m27-wipe)">
          <rect width={W} height={H} fill="#c79b45" mask="url(#m27-waxlines)" />
        </g>
        <defs>
          <mask id="m27-waxlines" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect width={W} height={H} fill="#000" />
            {lines("w")}
            {head("w")}
          </mask>
        </defs>
        {/* island names, cream with a dye-dark edge */}
        {NAMES.map((n) => {
          const [x, y] = at(n.p);
          return (
            <text key={n.t} x={x} y={y} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={n.s} fill={C.text} stroke={C.indigoDeep} strokeWidth={6} paintOrder="stroke" opacity={k([236, 250])}>
              {n.t}
            </text>
          );
        })}
        <RedDrop x={(tx + ttx) / 2 - 4} y={(ty + tty) / 2 - 2} k={k([250, 272])}>
          <g transform="scale(0.9)"><Clove /></g>
        </RedDrop>
        <RedDrop x={bx} y={by} k={k([352, 374])}>
          <Nutmeg />
        </RedDrop>
        {[
          { x: ttx + 70, y: tty + 112, t: "เตอร์นาเต · ติโดเร", f: 262 },
          { x: bx + 10, y: by + 104, t: "หมู่เกาะบันดา", f: 366 },
        ].map((l) => (
          <text key={l.t} x={l.x} y={l.y} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={C.text} stroke={C.red} strokeWidth={8} paintOrder="stroke" opacity={k([l.f, l.f + 10])}>
            {l.t}
          </text>
        ))}
        <path d={routeD} fill="none" stroke={C.red} strokeWidth={7} strokeDasharray="1 16" strokeLinecap="round" pathLength={1000} style={{ strokeDashoffset: 0 }} clipPath="url(#m27-route)" />
        <defs>
          <clipPath id="m27-route">
            <rect x={interpolate(routeK, [0, 1], [bx + 30, 0])} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <g opacity={k([500, 512])}>
          <path d={`M110 ${at(ROUTE[6])[1] - 4} l-40 0 m14 -14 l-14 14 l14 14`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={124} y={at(ROUTE[6])[1] - 26} fontFamily={font} fontWeight={700} fontSize={30} fill={C.text} stroke={C.red} strokeWidth={7} paintOrder="stroke">ไปมะละกา</text>
        </g>
        <Canting x={tool[0]} y={tool[1]} k={kDraw} />
        <rect width={W} height={H} fill="url(#m27-vig)" />
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1592, textAlign: "center", fontFamily: font, color: capColor, opacity: bk * interpolate(frame, [10, 24], [0, 1], clamp) }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 1 }}>{beat.tag}</div>
        <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.25 }}>{beat.head}</div>
        <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.35 }}>{beat.line}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: H - 74, textAlign: "center", fontFamily: font, fontSize: 17, color: capColor, opacity: 0.75 }}>
        ภาพประกอบ · ลายผ้าวาดด้วยโค้ด · แผนที่ Natural Earth
      </div>
    </AbsoluteFill>
  );
};
