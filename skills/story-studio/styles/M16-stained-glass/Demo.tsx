import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { archPath, C, clamp, CountryClips, Crack, fadeIn, font, GlassDefs, Leads, PaneMasks, Roundel, Surround, useQuarries, useWindowMap, Wall, type Box, type LonLat, type Pane } from "./kit/Glass";

// M16 stained glass: Siam's territorial losses 1867–1909 (approximate borders) as a lancet window. Siam's panes are
// amber-gold; when a territory passes to France (cobalt) or Britain (ruby) its pane cracks and a pane of the new
// colour is set in, the year changes in the roundel, and the window's colours fall on the stone floor. 15 s.
export const demo: StyleDemo = { id: "M16", name: "หน้าต่างกระจกสี", frames: 450, cover: 372, sizes: ["9x16"] };

const WIN: Box = [110, 200, 860, 1060];
const MAPBOX: Box = [110, 412, 860, 846];
const EXTENT: [number, number, number, number] = [97, 3.0, 108.6, 23.3];
const FLOOR = 1472;

// approximate cut lines (hand-drawn from the treaty descriptions; see STYLE.md)
const NW_CAMBODIA: LonLat[] = [[102.3, 14.75], [104.65, 14.75], [104.6, 13.0], [104.0, 12.7], [103.5, 12.4], [102.9, 12.2], [102.3, 12.3]];
const SIPSONG: LonLat[] = [[102.1, 22.6], [103.7, 22.9], [104.5, 21.9], [104.5, 20.9], [103.4, 20.6], [102.6, 21.0], [102.1, 21.5]];
const SAYABOURY: LonLat[] = [[100.0, 20.6], [100.4, 20.3], [101.1, 19.9], [102.15, 19.9], [101.42, 18.2], [101.66, 17.85], [100.0, 17.0]];
const CHAMPASAK_W: LonLat[] = [[105.2, 15.4], [105.82, 15.1], [105.9, 14.6], [105.97, 13.9], [105.0, 13.9], [105.0, 15.4]];
const MALAY_N: LonLat[] = [[99.6, 6.9], [102.2, 6.4], [103.6, 5.5], [103.6, 4.0], [102.4, 4.05], [101.3, 4.6], [100.6, 5.0], [100.2, 5.3], [99.6, 6.0]];

const PANES: Pane[] = [
  { id: "siam", country: "764" },
  { id: "cam1867", country: "116", drop: [NW_CAMBODIA] },
  { id: "cam1907", country: "116", keep: NW_CAMBODIA },
  { id: "sip1888", country: "704", keep: SIPSONG },
  { id: "lao1893", country: "418", drop: [SAYABOURY, CHAMPASAK_W] },
  { id: "say1904", country: "418", keep: SAYABOURY },
  { id: "cha1904", country: "418", keep: CHAMPASAK_W },
  { id: "mal1909", country: "458", keep: MALAY_N },
];
type Ev = { f: number; ids: string[]; to: string; be: string; ce: string; at: LonLat[]; line: string };
const EVENTS: Ev[] = [
  { f: 40, ids: ["cam1867"], to: C.france, be: "2410", ce: "1867", at: [[105.0, 12.2]], line: "2410 เขมรส่วนใหญ่ไปอยู่ใต้ฝรั่งเศส" },
  { f: 104, ids: ["sip1888"], to: C.france, be: "2431", ce: "1888", at: [[103.3, 21.7]], line: "2431 สิบสองจุไท" },
  { f: 168, ids: ["lao1893"], to: C.france, be: "2436", ce: "1893", at: [[103.6, 19.6]], line: "2436 ดินแดนฝั่งซ้ายแม่น้ำโขง" },
  { f: 232, ids: ["say1904", "cha1904"], to: C.france, be: "2447", ce: "1904", at: [[101.2, 18.9], [105.5, 14.6]], line: "2447 ดินแดนฝั่งขวาแม่น้ำโขง" },
  { f: 296, ids: ["cam1907"], to: C.france, be: "2450", ce: "1907", at: [[103.4, 13.5]], line: "2450 พระตะบอง เสียมราฐ ศรีโสภณ" },
  { f: 360, ids: ["mal1909"], to: C.britain, be: "2452", ce: "1909", at: [[101.8, 5.4]], line: "2452 สี่รัฐมลายูไปอยู่ใต้อังกฤษ" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const { projection, path } = useWindowMap(MAPBOX, EXTENT);
  const quarries = useQuarries(WIN, projection);
  const pr = (p: LonLat) => projection(p) as [number, number];
  const fillOf = (id: string) => {
    const ev = EVENTS.find((e) => e.ids.includes(id));
    if (!ev) return { color: C.siam, k: 0, flash: 0 };
    const k = interpolate(frame, [ev.f + 16, ev.f + 30], [0, 1], clamp);
    return { color: ev.to, k, flash: interpolate(frame, [ev.f + 16, ev.f + 22, ev.f + 40], [0, 1, 0], clamp) };
  };
  const cur = [...EVENTS].reverse().find((e) => frame >= e.f);
  const lineEv = [...EVENTS].reverse().find((e) => frame >= e.f);
  const sun = 0.9 + 0.06 * Math.sin(frame * 0.05) + 0.04 * Math.sin(frame * 0.13);
  // the glass itself, drawn twice: in the window and, softened, as coloured light on the floor
  const glass = (floor: boolean) => (
    <g>
      {quarries.map((q, i) => <path key={i} d={q.d} fill={q.fill} />)}
      {PANES.map((p) => {
        const { color, k, flash } = fillOf(p.id);
        return (
          <g key={p.id} mask={`url(#m16-p-${p.id})`}>
            <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} fill={C.siam} />
            {k > 0 && <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} fill={color} opacity={k} />}
            {!floor && flash > 0 && <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} fill="#fff" opacity={flash * 0.55} />}
          </g>
        );
      })}
      {!floor && (
        <>
          <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} filter="url(#m16-mottle)" style={{ mixBlendMode: "soft-light" }} />
          <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} filter="url(#m16-seed)" opacity={0.25} />
          {quarries.map((q, i) => <path key={`l${i}`} d={q.d} fill="none" stroke={C.lead} strokeWidth={3.6} strokeLinejoin="round" />)}
          <Leads panes={PANES} path={path} />
        </>
      )}
    </g>
  );
  const shaftK = 0.85 + 0.15 * Math.sin(frame * 0.07);
  return (
    <AbsoluteFill style={{ background: "#3d372f" }}>
      <Hit id="church_bell" at={6} volume={0.18} />
      <Bed id="wind" from={0} to={demo.frames} volume={0.05} />
      {EVENTS.map((e) => <Sfx key={e.f} src={SFX.hit} at={e.f} volume={0.28} />)}
      {EVENTS.map((e) => <Hit key={`w${e.f}`} id="wood_break" at={e.f} volume={0.12} />)}
      {EVENTS.map((e) => <Sfx key={`t${e.f}`} src={SFX.tick} at={e.f + 18} volume={0.18} />)}
      <Wall win={WIN} floorY={FLOOR} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <GlassDefs />
        <PaneMasks panes={PANES} path={path} />
        <CountryClips ids={["116", "704", "418", "458"]} path={path} />
        <clipPath id="m16-win">
          <path d={archPath(WIN)} />
        </clipPath>
        {/* carved lettering above the window */}
        <g fontFamily={font} textAnchor="middle">
          <text x={540} y={62} fontSize={30} fontWeight={600} fill="#15120e" letterSpacing={4} transform="translate(0,2)">M16 · หน้าต่างกระจกสี</text>
          <text x={540} y={62} fontSize={30} fontWeight={600} fill="#cfc4ac" letterSpacing={4}>M16 · หน้าต่างกระจกสี</text>
          <text x={540} y={128} fontSize={54} fontWeight={700} fill="#15120e" transform="translate(0,3)">ดินแดนที่สยามเสียไป</text>
          <text x={540} y={128} fontSize={54} fontWeight={700} fill="#e6dcc4">ดินแดนที่สยามเสียไป</text>
        </g>
        <Surround win={WIN} />
        {/* the window */}
        <g clipPath="url(#m16-win)">
          <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} fill="#fff7df" />
          <g opacity={sun}>{glass(false)}</g>
          {EVENTS.flatMap((e) =>
            e.ids.map((id, j) => <Crack key={`${e.f}${id}`} at={pr(e.at[j])} k={(frame - e.f) / 16} size={id === "lao1893" ? 230 : 140} seed={id} maskId={`m16-p-${id}`} />),
          )}
          {/* sun behind the glass: the panes glow brighter toward the upper right, where the sun is */}
          <defs>
            <radialGradient id="m16-sun" cx={800} cy={360} r={900} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff6d8" stopOpacity={0.3} />
              <stop offset="0.5" stopColor="#fff0c0" stopOpacity={0.08} />
              <stop offset="1" stopColor="#fff0c0" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={WIN[0]} y={WIN[1]} width={WIN[2]} height={WIN[3]} fill="url(#m16-sun)" opacity={sun} style={{ mixBlendMode: "screen" }} />
          {/* window border: a band of small ruby and cobalt quarries inside the stone */}
          <path d={archPath(WIN)} fill="none" stroke={C.lead} strokeWidth={34} />
          <path d={archPath(WIN, 8)} fill="none" stroke="#c9a23a" strokeWidth={10} strokeDasharray="22 10" />
          <Roundel cx={540} cy={318} r={92} top="พ.ศ." big={cur ? cur.be : "2409"} bottom={cur ? `ค.ศ. ${cur.ce}` : "ค.ศ. 1866"} flash={cur ? interpolate(frame, [cur.f, cur.f + 16], [1, 0], clamp) : 0} />
        </g>
        <path d={archPath(WIN)} fill="none" stroke="#3d372f" strokeWidth={4} />
        {/* sill and the carved caption plaque */}
        <rect x={60} y={WIN[1] + WIN[3] + 8} width={960} height={40} fill="#a79d88" />
        <rect x={60} y={WIN[1] + WIN[3] + 44} width={960} height={8} fill="#5d5547" />
        <rect x={90} y={1324} width={900} height={118} rx={6} fill="#b8ae98" stroke="#6a6252" strokeWidth={3} />
        <rect x={100} y={1334} width={880} height={98} rx={4} fill="none" stroke="#8a816e" strokeWidth={1.5} />
        {lineEv && (
          <g fontFamily={font} textAnchor="middle" opacity={fadeIn(frame, lineEv.f, 10)}>
            <text x={540} y={1400} fontSize={46} fontWeight={700} fill="#efe8d8" transform="translate(0,2)">{lineEv.line}</text>
            <text x={540} y={1400} fontSize={46} fontWeight={700} fill={lineEv.to === C.britain ? "#7a1426" : "#1f2f5c"}>{lineEv.line}</text>
          </g>
        )}
        {!lineEv && (
          <text x={540} y={1400} textAnchor="middle" fontFamily={font} fontSize={46} fontWeight={700} fill="#2a241c" opacity={fadeIn(frame, 4, 12)}>สยามก่อนปี 2410</text>
        )}
        {/* coloured light thrown on the floor */}
        <g transform="translate(150 1500) skewX(-26) scale(0.95 0.36) translate(-110 -200)" filter="url(#m16-blur3)" opacity={0.85 * sun} style={{ mixBlendMode: "screen" }}>
          <g clipPath="url(#m16-win)">{glass(true)}</g>
        </g>
        {/* light shafts and dust */}
        <defs>
          <linearGradient id="m16-shaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3cf" stopOpacity={0.5} />
            <stop offset="0.6" stopColor="#ffe9b0" stopOpacity={0.22} />
            <stop offset="1" stopColor="#ffe9b0" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        {[[230, 0.2], [420, 0.26], [610, 0.22], [790, 0.16]].map(([x, o], i) => (
          <path key={i} d={`M${x - 60} ${WIN[1] + 300 + i * 90} L${x + 40} ${WIN[1] + 260 + i * 90} L${x + 10 - 220} 1920 L${x - 170 - 220} 1920 Z`} fill="url(#m16-shaft)" opacity={o * 2.2 * shaftK} filter="url(#m16-blur8)" />
        ))}
        {Array.from({ length: 40 }, (_, i) => {
          const x = 120 + random(`dx${i}`) * 820 + Math.sin(frame * 0.02 + i) * 14 - ((frame * 0.3) % 40);
          const y = 1280 + ((random(`dy${i}`) * 640 + frame * (0.4 + random(`ds${i}`) * 0.5)) % 640);
          return <circle key={i} cx={x} cy={y} r={1.2 + random(`dr${i}`) * 1.6} fill="#fff6dc" opacity={0.35 + 0.3 * Math.sin(frame * 0.1 + i)} />;
        })}
        {/* legend on the floor edge */}
        <g fontFamily={font} fontSize={24} fontWeight={600} fill="#efe6d2">
          {[
            [C.siam, "สยาม"],
            [C.france, "ฝรั่งเศส"],
            [C.britain, "อังกฤษ"],
          ].map(([c, t], i) => (
            <g key={t} transform={`translate(${170 + i * 250} 1480)`}>
              <rect x={0} y={0} width={34} height={34} fill={c} stroke={C.lead} strokeWidth={4} />
              <text x={48} y={27}>{t}</text>
            </g>
          ))}
        </g>
        <text x={540} y={1872} textAnchor="middle" fontFamily={font} fontSize={22} fontWeight={500} fill="#d8cfbd">
          เขตแดนโดยประมาณ · ตามสนธิสัญญา 2410–2452 · แผนที่วาดจาก Natural Earth
        </text>
      </svg>
    </AbsoluteFill>
  );
};
