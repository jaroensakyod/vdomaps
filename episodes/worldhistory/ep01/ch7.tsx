import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { BLACK, clamp, font, GOLD, Panel, Pin, RED, Rivers, RUS, TAN, view, type Chapter } from "../kit/news";
import { FRENCH, POLISH, RUSSIAN, Snow, Soldier, Treeline, Water } from "../kit/Period";
import { Cannon, Cossack, EagleStandard, Isba, Sledge, SnowGround, Trestle, Wader, Wagon, WheelFire } from "../kit/PeriodD";
import { CITY, RETREAT, TEMPS } from "./minard";
import { at, B, span, wf } from "./time";

// Chapter 7 "Retreat in the snow" (beats malo → flanks): the blocked southern road, the stripped old road, Vyazma,
// winter and Minard's temperature line, horses and cannon lost, Cossacks, the cold, Smolensk, Krasnoi, the
// Berezina (Eblé's bridges), Napoleon's sledge to Paris, and Minard's whole figure at the Neman.
const [from, to] = span("ch7");
const INK = "#1b1d24";
export const ICE = "#9fd4ff";

const T = {
  malo: B.malo.start,
  south: wf("malo", "south", 0.27),
  maloPin: wf("malo", "Maloyaroslavets", 0.63),
  blocked: wf("malo", "blocked", 0.86),
  old: B.oldroad.start,
  turned: wf("oldroad", "turned", 0.12),
  bare: wf("oldroad", "stripped", 0.8),
  vy: B.vyazma.start,
  vyPin: at("vyazma", 0.06),
  caught: at("vyazma", 0.36),
  running: at("vyazma", 0.72),
  snow: B.snow.start,
  winter: wf("snow", "winter", 0.25),
  line: wf("snow", "second", 0.65),
  h2: B.horses2.start,
  horses: wf("horses2", "horses", 0.08),
  cannon: wf("horses2", "Cannon", 0.24),
  cavalry: wf("horses2", "cavalry", 0.66),
  coss: B.cossacks.start,
  cut: wf("cossacks", "cut", 0.33),
  anyone: wf("cossacks", "Anyone", 0.7),
  cold: B.cold.start,
  burned: wf("cold", "burned", 0.05),
  dec: wf("cold", "December", 0.57),
  thirty: wf("cold", "thirty", 0.86),
  sm: B.smolensk2.start,
  smPin: at("smolensk2", 0.12),
  sixty: at("smolensk2", 0.68),
  kr: B.krasnoi.start,
  krPin: wf("krasnoi", "Krasnoi", 0.03),
  struck: wf("krasnoi", "struck", 0.45),
  ney: wf("krasnoi", "Ney's", 0.68),
  be: B.berezina.start,
  river: wf("berezina", "Berezina", 0.15),
  bridge: wf("berezina", "bridge", 0.4),
  three: wf("berezina", "closing", 0.75),
  eb: B.eble.start,
  water: wf("eble", "freezing", 0.37),
  two: wf("eble", "two", 0.64),
  cr: B.crossing.start,
  crossed: wf("crossing", "crossed", 0.2),
  burn: wf("crossing", "burned", 0.64),
  left: wf("crossing", "stragglers", 0.78),
  nl: B.napleave.start,
  napL: wf("napleave", "Napoleon", 0.3),
  raced: wf("napleave", "raced", 0.63),
  paris: wf("napleave", "Paris", 0.8),
  bk: B.back.start,
  neman: wf("back", "Neman", 0.3),
  minard: wf("back", "Minard's", 0.48),
  four: wf("back", "four-", 0.62),
  ten: wf("back", "ten-", 0.86),
  fl: B.flanks.start,
  flank: wf("flanks", "flanks", 0.2),
  hundred: wf("flanks", "one-", 0.35),
  grande: wf("flanks", "Grande", 0.76),
};

export const V7 = {
  malo: bbox([[35.2, 54.6], [38.2, 56.1]]),
  mid: bbox([[33.2, 54.4], [37.9, 56.0]]),
  route: bbox([[23.2, 53.9], [38.3, 56.2]]),
  smolensk: bbox([[30.4, 53.9], [33.6, 55.5]]),
  berezina: bbox([[27.5, 53.7], [29.6, 54.9]]),
  paris: bbox([[-1.5, 46.5], [28.5, 56.5]]),
  wide: bbox([[20.5, 51.8], [38.3, 57.2]]),
};

export const fade = (frame: number, f0: number, f1: number, d = 10) => interpolate(frame, [f0, f0 + d, f1 - d, f1], [0, 1, 1, 0], clamp);

// ---------------------------------------------------------------- map pieces

// Minard's temperature line, drawn under the route by longitude: 0 °C at 45.5 % of the height, −40 °C at 53 %.
const latAt = (lon: number) => {
  for (let i = 0; i < RETREAT.length - 1; i++) {
    const [a, b] = [RETREAT[i], RETREAT[i + 1]];
    if (lon <= a[0] && lon >= b[0]) return a[1] + ((b[1] - a[1]) * (a[0] - lon)) / (a[0] - b[0] || 1);
  }
  return RETREAT[RETREAT.length - 1][1];
};
export const TempChart = ({ k, upto, hot = 0 }: { k: number; upto: number; hot?: number }) => {
  const { projection, height, s } = useMap();
  if (k <= 0) return null;
  const X = (lon: number) => projection([lon, 54.4])?.[0] ?? 0;
  const Y = (t: number) => height * 0.455 + (-t / 40) * height * 0.075;
  const shown = TEMPS.filter((p) => p[0] >= upto);
  const nxt = TEMPS.find((p) => p[0] < upto);
  const last = shown[shown.length - 1];
  const tip: [number, number] | null = nxt && last ? [upto, last[1] + ((nxt[1] - last[1]) * (last[0] - upto)) / (last[0] - nxt[0])] : null;
  const pts = [...shown.map((p) => [p[0], p[1]] as [number, number]), ...(tip ? [tip] : [])];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join(" ");
  const x0 = Math.min(X(38.2), X(24.6));
  const x1 = Math.max(X(38.2), X(24.6));
  const LABEL = new Set(["18 Oct", "9 Nov", "14 Nov", "28 Nov", "6 Dec"]);
  return (
    <g opacity={k} fontFamily={font}>
      <rect x={x0 - 14 * s} y={Y(4) - 34 * s} width={x1 - x0 + 28 * s} height={Y(-44) - Y(4) + 34 * s} rx={12 * s} fill="rgba(8,14,26,0.62)" />
      <text x={x0} y={Y(4) - 8 * s} fontSize={24 * s} fontWeight={700} fill={ICE}>Temperature °C (Minard)</text>
      {[0, -10, -20, -30].map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={Y(t)} y2={Y(t)} stroke="#fff" strokeOpacity={0.18} strokeWidth={1.5 * s} strokeDasharray={`${6 * s} ${6 * s}`} />
          <text x={x1 + 4 * s} y={Y(t) + 7 * s} fontSize={20 * s} fill="#fff" opacity={0.6} textAnchor="end">{t === 0 ? "0" : `−${-t}`}</text>
        </g>
      ))}
      {shown.map((p) => {
        const by = projection([p[0], latAt(p[0])])?.[1] ?? 0;
        return <line key={`v${p[0]}`} x1={X(p[0])} x2={X(p[0])} y1={by + 10 * s} y2={Y(p[1])} stroke="#fff" strokeOpacity={0.3} strokeWidth={1.4 * s} />;
      })}
      <path d={d} fill="none" stroke={ICE} strokeWidth={5 * s} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${6 * s}px ${ICE})` }} />
      {shown.map((p) => (
        <g key={p[0]}>
          <circle cx={X(p[0])} cy={Y(p[1])} r={6 * s} fill="#fff" stroke={ICE} strokeWidth={2.5 * s} />
          {LABEL.has(p[2]) && (
            <text x={X(p[0])} y={Y(p[1]) + 32 * s} textAnchor="middle" fontSize={22 * s} fontWeight={700} fill="#fff" stroke="#0b1020" strokeWidth={6 * s} paintOrder="stroke">
              {`${p[1] === 0 ? "0" : `−${-p[1]}`}° · ${p[2]}`}
            </text>
          )}
        </g>
      ))}
      {hot > 0 && (
        <g transform={`translate(${X(26.7)},${Y(-37)})`} opacity={hot}>
          <circle r={(14 + 8 * Math.sin(hot * 6)) * s} fill="none" stroke={RED} strokeWidth={4 * s} />
          <rect x={-70 * s} y={-82 * s} width={140 * s} height={48 * s} rx={10 * s} fill={RED} />
          <text y={-47 * s} textAnchor="middle" fontSize={32 * s} fontWeight={900} fill="#fff">−37 °C</text>
        </g>
      )}
    </g>
  );
};

// Snow over the whole map.
export const MapSnow = ({ k }: { k: number }) => {
  const { width, height, s } = useMap();
  return <Snow x={0} y={0} W={width} H={height} s={s * 1.4} k={k} n={110} />;
};

// A red bar across the road: the way is blocked.
const Block = ({ at: p, k, angle = 30 }: { at: [number, number]; k: number; angle?: number }) => {
  const { projection, s } = useMap();
  const xy = projection(p);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1]}) rotate(${angle}) scale(${k})`}>
      <rect x={-70 * s} y={-14 * s} width={140 * s} height={28 * s} rx={6 * s} fill={RED} stroke="#fff" strokeWidth={3 * s} />
      {[-40, 0, 40].map((dx) => <path key={dx} d={`M${(dx - 12) * s} ${-14 * s} L${(dx + 4) * s} ${14 * s}`} stroke="#fff" strokeWidth={6 * s} />)}
    </g>
  );
};

// Hit marker: a burst that settles into a small cross.
export const Hit = ({ at: p, f, color = RED }: { at: [number, number]; f: number; color?: string }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const xy = projection(p);
  if (!xy || frame < f) return null;
  const a = interpolate(frame, [f, f + 16], [0, 1], clamp);
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`}>
      <circle r={(10 + 40 * a) * s} fill="none" stroke={color} strokeWidth={5 * s} opacity={1 - a} />
      {Array.from({ length: 8 }, (_, i) => {
        const ang = (i * Math.PI) / 4;
        return <line key={i} x1={Math.cos(ang) * 12 * s} y1={Math.sin(ang) * 12 * s} x2={Math.cos(ang) * (16 + 22 * a) * s} y2={Math.sin(ang) * (16 + 22 * a) * s} stroke="#ffd36b" strokeWidth={4 * s} opacity={1 - a} />;
      })}
      <path d={`M${-9 * s} ${-9 * s} L${9 * s} ${9 * s} M${9 * s} ${-9 * s} L${-9 * s} ${9 * s}`} stroke={color} strokeWidth={5 * s} strokeLinecap="round" />
    </g>
  );
};

// Small burnt-village glyph on the map (the road already stripped).
const Burnt = ({ at: p, k }: { at: [number, number]; k: number }) => {
  const { projection, s } = useMap();
  const xy = projection(p);
  if (!xy || k <= 0) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1] - 16 * s}) scale(${s * k * 1.4})`}>
      <path d="M-14 10 L-14 -2 L-6 -10 L2 -2 L8 -8 L14 0 L14 10 Z" fill="#2a2420" stroke="#ff9a3c" strokeWidth={2.5} />
      <circle cx={4} cy={-20} r={6} fill="#57514b" opacity={0.8} />
      <circle cx={10} cy={-30} r={8} fill="#57514b" opacity={0.5} />
    </g>
  );
};

export const Label = ({ at: p, text, k, color = "#fff", size = 30 }: { at: [number, number]; text: string; k: number; color?: string; size?: number }) => {
  const { projection, s } = useMap();
  const xy = projection(p);
  if (!xy || k <= 0) return null;
  return (
    <text x={xy[0]} y={xy[1]} opacity={k} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size * s} fill={color} stroke="#0b1020" strokeWidth={8 * s} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  );
};

const BEREZINA: [number, number][] = [[28.3, 54.85], [28.42, 54.55], [28.5, 54.3], [28.52, 54.15], [28.66, 53.9], [28.9, 53.55], [29.15, 53.2]];
const RiverLine = ({ pts, k }: { pts: [number, number][]; k: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const d = pts.map((p, i) => { const xy = projection(p) ?? [0, 0]; return `${i ? "L" : "M"}${xy[0]},${xy[1]}`; }).join(" ");
  return (
    <g opacity={k} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#fff3a6" strokeWidth={14 * s} strokeOpacity={0.6} style={{ filter: `drop-shadow(0 0 ${8 * s}px #ffd84a)` }} />
      <path d={d} stroke="#7fd4ff" strokeWidth={5 * s} />
    </g>
  );
};

// Two bridge marks across the river at Studianka; they catch fire on the last morning.
const Bridges = ({ k, fire }: { k: number; fire: number }) => {
  const { projection, s } = useMap();
  const xy = projection(CITY.studianka);
  if (!xy || k <= 0) return null;
  return (
    <g opacity={k}>
      {[-22, 22].map((dy, i) => (
        <g key={dy} transform={`translate(${xy[0]},${xy[1] + dy * s})`}>
          <rect x={-34 * s} y={-6 * s} width={68 * s} height={12 * s} rx={3 * s} fill={GOLD} stroke={INK} strokeWidth={2 * s} />
          {fire > 0 && <Fire x={0} y={4 * s} size={46 * s} seed={i + 4} k={fire} />}
        </g>
      ))}
    </g>
  );
};

const Map7 = () => {
  const frame = useCurrentFrame();
  const snowK = interpolate(frame, [T.winter - 10, T.winter + 20, to - 20, to], [0, 1, 1, 0], clamp) * (frame >= T.be && frame < T.bk ? 0.55 : 0.85);
  const upto = interpolate(frame, [T.line, T.thirty], [37.6, 26.7], clamp) - interpolate(frame, [T.minard, T.minard + 30], [0, 1.4], clamp);
  const chartK = interpolate(frame, [T.line - 10, T.line + 6, T.sm - 10, T.sm + 5, T.minard, T.minard + 15, T.flank - 10, T.flank + 6], [0, 1, 1, 0, 0, 1, 1, 0], clamp) * (frame < to ? 1 : 0);
  return (
    <g>
      <Rivers hi={{ Neman: fade(frame, T.neman - 6, T.minard + 30, 12) }} />
      {/* Maloyaroslavets: the road south, blocked */}
      {frame < T.vy + 30 && (
        <g opacity={interpolate(frame, [T.vy, T.vy + 20], [1, 0], clamp)}>
          <Arrow points={[[37.6, 55.72], [37.2, 55.35], [36.75, 55.08], [36.56, 55.02]]} start={T.south - 6} end={T.maloPin + 10} color={BLACK} outline="#f2f2f2" width={20} variant="dashed" />
          <Block at={[36.6, 55.06]} k={interpolate(frame, [T.blocked - 4, T.blocked + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })} angle={40} />
          <Arrow points={[[36.75, 55.05], [36.4, 55.3], [36.05, 55.48], [35.5, 55.42]]} start={T.turned} end={T.turned + 40} color={BLACK} outline="#f2f2f2" width={20} />
          {[[35.9, 55.47], [35.5, 55.43], [35.1, 55.38], [34.75, 55.4]].map((p, i) => <Burnt key={i} at={p as [number, number]} k={interpolate(frame, [T.bare - 6 + i * 5, T.bare + 6 + i * 5], [0, 1], clamp)} />)}
        </g>
      )}
      <Pin at={CITY.maloyaroslavets} text="Maloyaroslavets" k={fade(frame, T.maloPin - 4, T.vy + 10)} dy={56} />
      <Pin at={CITY.mozhaysk} text="Mozhaysk" k={fade(frame, T.turned + 20, T.vy + 10)} size={0.8} color={TAN} />
      <Label at={[35.3, 55.68]} text="stripped bare" k={fade(frame, T.bare, T.vy + 10)} color="#ffb27a" size={34} />
      {/* Vyazma */}
      <Pin at={CITY.vyazma} text="Vyazma" k={fade(frame, T.vyPin, T.snow + 20)} dy={56} />
      {frame >= T.caught - 10 && frame < T.snow + 30 && (
        <g opacity={interpolate(frame, [T.snow, T.snow + 25], [1, 0], clamp)}>
          <Arrow points={[[34.9, 54.55], [34.6, 54.85], [34.42, 55.1]]} start={T.caught - 6} end={T.caught + 16} color={RUS} width={22} />
          <Arrow points={[[33.7, 54.55], [33.95, 54.85], [34.15, 55.08]]} start={T.caught + 4} end={T.caught + 26} color={RUS} width={22} />
          <Hit at={[34.35, 55.2]} f={T.caught + 16} />
          <Hit at={[34.0, 55.08]} f={T.running} />
          <Hit at={[34.8, 55.27]} f={T.running + 12} />
        </g>
      )}
      {/* Cossack raids along the column */}
      {frame >= T.cut - 6 && frame < T.cold + 20 && (
        <g opacity={interpolate(frame, [T.cold, T.cold + 20], [1, 0], clamp)}>
          {[[33.6, 54.95], [33.0, 54.75], [32.5, 54.68], [33.3, 54.85]].map((p, i) => <Hit key={i} at={p as [number, number]} f={T.cut + i * 14} color={RUS} />)}
        </g>
      )}
      <TempChart k={chartK} upto={upto} hot={fade(frame, T.thirty, T.sm + 10, 8)} />
      {/* Smolensk and Krasnoi */}
      <Pin at={CITY.smolensk} text="Smolensk" k={fade(frame, T.smPin, T.be)} dy={56} />
      <Pin at={CITY.krasnoi} text="Krasnoi" k={fade(frame, T.krPin, T.be)} dy={60} />
      {frame >= T.struck - 10 && frame < T.be + 20 && (
        <g opacity={interpolate(frame, [T.be, T.be + 20], [1, 0], clamp)}>
          <Arrow points={[[31.2, 53.95], [31.32, 54.25], [31.4, 54.48]]} start={T.struck - 6} end={T.struck + 16} color={RUS} width={22} />
          <Arrow points={[[31.9, 55.05], [31.6, 54.82], [31.45, 54.64]]} start={T.struck} end={T.struck + 22} color={RUS} width={22} />
          <Hit at={[31.4, 54.56]} f={T.ney} />
        </g>
      )}
      {/* The Berezina at Studianka */}
      <RiverLine pts={BEREZINA} k={fade(frame, T.river - 8, T.nl + 10, 12)} />
      <Label at={[28.78, 54.7]} text="Berezina" k={fade(frame, T.river, T.nl + 10)} color="#bfe8ff" size={36} />
      <Pin at={CITY.studianka} text="" k={fade(frame, T.river + 10, T.nl + 10)} />
      <Label at={[27.95, 54.33]} text="Studianka" k={fade(frame, T.river + 10, T.nl + 10)} size={40} />
      {frame >= T.three - 10 && frame < T.eb + 40 && (
        <g opacity={interpolate(frame, [T.eb + 10, T.eb + 40], [1, 0], clamp)}>
          <Arrow points={[[28.9, 54.95], [28.7, 54.65], [28.58, 54.42]]} start={T.three - 6} end={T.three + 18} color={RED} width={22} />
          <Arrow points={[[28.15, 53.85], [28.3, 54.05], [28.43, 54.22]]} start={T.three} end={T.three + 24} color={RED} width={22} />
          <Arrow points={[[29.5, 54.15], [29.1, 54.25], [28.72, 54.3]]} start={T.three + 6} end={T.three + 30} color={RED} width={22} />
        </g>
      )}
      <Bridges k={fade(frame, T.two - 4, T.nl + 10, 8)} fire={interpolate(frame, [T.burn - 4, T.burn + 10], [0, 1], clamp)} />
      <Label at={[28.2, 54.1]} text="left behind" k={fade(frame, T.left, T.nl + 10)} color="#ffb27a" size={30} />
      {/* Napoleon's sledge to Paris */}
      <Pin at={CITY.smorgoni} text="Smorgoni" k={fade(frame, T.napL - 4, T.bk + 10)} size={0.8} color={GOLD} dy={56} />
      {frame >= T.raced - 6 && frame < T.bk + 20 && (
        <g opacity={interpolate(frame, [T.bk, T.bk + 20], [1, 0], clamp)}>
          <Arrow points={[CITY.smorgoni, CITY.vilna, [21.5, 52.6], [13.7, 51.05], [7.5, 49.6], CITY.paris]} start={T.raced - 6} end={T.paris + 6} color={GOLD} width={22} variant="dashed" />
        </g>
      )}
      <Pin at={CITY.paris} text="Paris" k={fade(frame, T.paris, T.bk + 10)} color={GOLD} />
      {/* Back at the Neman: Minard's figure */}
      <Pin at={CITY.kovno} text="Kovno" k={fade(frame, T.neman - 4, to + 20)} size={0.85} dy={-40} />
      <Label at={[25.6, 56.45]} text="422,000" k={fade(frame, T.four, to + 20)} color={TAN} size={46} />
      <Label at={[24.3, 54.0]} text="10,000" k={fade(frame, T.ten, to + 20)} color="#ffffff" size={46} />
      {/* The flank corps */}
      {frame >= T.flank - 6 && (
        <g opacity={interpolate(frame, [to - 10, to + 10], [1, 0], clamp)}>
          <Arrow points={[[24.4, 56.85], [23.0, 56.2], [22.2, 55.4]]} start={T.flank - 4} end={T.flank + 22} color="#5a5d66" outline="#f2f2f2" width={20} variant="dashed" />
          <Arrow points={[[25.6, 52.6], [23.6, 52.3], [21.4, 52.25]]} start={T.flank + 4} end={T.flank + 30} color="#5a5d66" outline="#f2f2f2" width={20} variant="dashed" />
          <Label at={[22.6, 57.3]} text="North flank" k={fade(frame, T.flank + 16, to + 30)} size={30} />
          <Label at={[23.6, 52.05]} text="South flank" k={fade(frame, T.flank + 22, to + 30)} size={30} />
        </g>
      )}
      <MapSnow k={snowK} />
    </g>
  );
};

// ---------------------------------------------------------------- panels

type S = { start: number; end: number };
const AUTUMN: [string, string] = ["#6f8fb0", "#e9c88a"];
const GREY: [string, string] = ["#56616e", "#c3ccd4"];
const DUSK: [string, string] = ["#1d2440", "#8a6a6a"];

// A new road south through untouched farmland: a column on a lane between golden fields.
const SouthScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7south" anchor={CITY.maloyaroslavets} start={start} end={end} sky={AUTUMN} accent={GOLD}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 60 * g.s} s={g.s} color="#4a5a3a" />
          <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#d8b45a" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${g.x} ${g.ground - (50 - i * 9) * g.s} L${g.x + g.W} ${g.ground - (54 - i * 9) * g.s}`} stroke="#b8923a" strokeWidth={2 * g.s} />)}
          <Isba x={g.x + g.W * 0.82} y={g.ground - 30 * g.s} scale={g.sc * 0.55} />
          <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={30 * g.s} fill="#9a7a50" />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.08 + ((frame - start) * 1.1 * g.s + i * 90 * g.s) % (g.W * 0.8)} y={g.ground + 12 * g.s} scale={g.sc * 0.6} phase={i} u={i % 3 === 1 ? POLISH : FRENCH} />)}
        </g>
      )}
    </Panel>
  );
};

// Maloyaroslavets: a Russian line across the road, the town burning behind (no people in it).
const BlockScene = ({ start, end }: S) => (
  <Panel id="c7block" anchor={CITY.maloyaroslavets} start={start} end={end} sky={["#3a2f3a", "#d98a5a"]} accent={RED}>
    {(g) => (
      <g>
        <Isba x={g.x + g.W * 0.18} y={g.ground - 40 * g.s} scale={g.sc * 0.55} fire={1} seed={2} />
        <Isba x={g.x + g.W * 0.4} y={g.ground - 46 * g.s} scale={g.sc * 0.45} burnt fire={0.8} seed={5} />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#6a5a3a" />
        <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={30 * g.s} fill="#8a6a46" />
        {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * (0.5 + i * 0.085)} y={g.ground + 14 * g.s} scale={g.sc * 0.66} phase={i * 1.3} u={RUSSIAN} pose="stand" flip />)}
        <Smoke x={g.x + g.W * 0.62} y={g.ground - 90 * g.s} size={30 * g.s} seed={9} />
      </g>
    )}
  </Panel>
);

// The old road, already stripped: burnt huts, bare fields, the column trudging back.
const OldRoadScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7old" anchor={[35.5, 55.42]} start={start} end={end} sky={["#5a5f68", "#b9a98a"]} accent={TAN}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#7a6a52" />
          <Isba x={g.x + g.W * 0.2} y={g.ground - 30 * g.s} scale={g.sc * 0.55} burnt />
          <Isba x={g.x + g.W * 0.55} y={g.ground - 40 * g.s} scale={g.sc * 0.45} burnt />
          <Isba x={g.x + g.W * 0.85} y={g.ground - 34 * g.s} scale={g.sc * 0.5} burnt />
          <rect x={g.x} y={g.ground - 6 * g.s} width={g.W} height={30 * g.s} fill="#5e4e3a" />
          {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={g.x + g.W - ((frame - start) * 0.8 * g.s + i * 120 * g.s) % (g.W * 0.95)} y={g.ground + 14 * g.s} scale={g.sc * 0.62} phase={i * 1.4} u={FRENCH} pose="trudge" flip />)}
        </g>
      )}
    </Panel>
  );
};

// Vyazma: rearguard volleys against a Russian attack, powder smoke between them.
const VyazmaScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const puff = (i: number) => ((frame - start + i * 13) % 40) / 40;
  return (
    <Panel id="c7vyazma" anchor={CITY.vyazma} start={start} end={end} sky={["#4a5260", "#c9b89a"]} accent={RED}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#3a4436" />
          <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#8a7a5a" />
          {[0, 1, 2, 3].map((i) => <Soldier key={`f${i}`} x={g.x + g.W * (0.08 + i * 0.09)} y={g.ground + 10 * g.s} scale={g.sc * 0.62} phase={i} u={FRENCH} pose="stand" />)}
          {[0, 1, 2, 3, 4].map((i) => <Soldier key={`r${i}`} x={g.x + g.W * (0.66 + i * 0.075) - (frame - start) * 0.3 * g.s} y={g.ground + 14 * g.s} scale={g.sc * 0.64} phase={i * 1.1} u={RUSSIAN} flip />)}
          {[0, 1, 2].map((i) => <circle key={i} cx={g.x + g.W * (0.44 + i * 0.05)} cy={g.ground - 70 * g.s - puff(i) * 30 * g.s} r={(18 + puff(i) * 40) * g.s} fill="#e8e4dc" opacity={0.6 * (1 - puff(i))} />)}
          <Smoke x={g.x + g.W * 0.52} y={g.ground - 40 * g.s} size={36 * g.s} seed={3} wind={0.1} />
        </g>
      )}
    </Panel>
  );
};

// Winter arrives: the column trudges through falling snow.
const SnowScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7snow" anchor={[34, 55.2]} start={start} end={end} sky={GREY} accent={ICE}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#38443f" snow={1} />
          <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W - ((frame - start) * 0.7 * g.s + i * 105 * g.s) % (g.W * 1.05)} y={g.ground + 8 * g.s} scale={g.sc * 0.62} phase={i * 1.7} u={i % 2 ? POLISH : FRENCH} pose="trudge" wrap={1} flip />)}
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={80} />
        </g>
      )}
    </Panel>
  );
};

// Cannon and wagons left in the snow.
const CannonScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [start, start + 60], [0.3, 1], clamp);
  return (
    <Panel id="c7cannon" anchor={[33.5, 54.95]} start={start} end={end} sky={GREY} accent={ICE}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#38443f" snow={1} />
          <SnowGround x={g.x} W={g.W} ground={g.ground - 50 * g.s} H={g.H} s={g.s} seed={2} />
          <Wagon x={g.x + g.W * 0.68} y={g.ground - 10 * g.s} scale={g.sc * 0.85} snow={k} />
          <Cannon x={g.x + g.W * 0.32} y={g.ground + 4 * g.s} scale={g.sc * 1.05} snow={k} tilt={-4} />
          <Cannon x={g.x + g.W * 0.9} y={g.ground - 24 * g.s} scale={g.sc * 0.6} snow={k} flip />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={70} />
        </g>
      )}
    </Panel>
  );
};

// Cossacks ride out of the forest edge.
const CossackScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7cossacks" anchor={[33.3, 54.85]} start={start} end={end} sky={["#4e5866", "#b8c2cc"]} accent={RUS}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.y} width={g.W * 0.4} height={g.H} fill="#1f2a24" opacity={0.6} />
          <Treeline x={g.x - g.W * 0.1} W={g.W * 0.5} ground={g.ground} s={g.s * 2} color="#1b2a24" snow={0.8} />
          <SnowGround x={g.x} W={g.W} ground={g.ground - 20 * g.s} H={g.H} s={g.s} seed={4} />
          {[0, 1, 2].map((i) => (
            <Cossack key={i} x={g.x + g.W * 0.12 + (frame - start) * (2.2 + i * 0.3) * g.s + i * 110 * g.s} y={g.ground + (i % 2 ? 4 : 20) * g.s} scale={g.sc * 0.62} phase={i * 1.9} />
          ))}
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
        </g>
      )}
    </Panel>
  );
};

// A fire of broken wagon wheels at dusk, men wrapped in blankets around it.
const FireScene = ({ start, end }: S) => (
  <Panel id="c7fire" anchor={[32.6, 54.65]} start={start} end={end} sky={DUSK} accent="#ff9a3c">
    {(g) => (
      <g>
        <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#141c20" snow={0.6} />
        <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={6} />
        <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#1d2440" opacity={0.35} />
        <circle cx={g.cx} cy={g.ground - 20 * g.s} r={190 * g.s} fill="url(#fig-glow)" />
        <Soldier x={g.cx - 150 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.66} u={FRENCH} pose="stand" wrap={1} />
        <Soldier x={g.cx + 150 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.66} u={POLISH} pose="stand" wrap={1} flip phase={2} />
        <Soldier x={g.cx + 260 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.58} u={FRENCH} pose="stand" wrap={1} flip phase={4} />
        <WheelFire x={g.cx} y={g.ground + 8 * g.s} scale={g.sc * 1.0} />
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
      </g>
    )}
  </Panel>
);

// Smolensk again: the column staggers back towards the walls in the snow.
const SmolenskScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7smolensk" anchor={CITY.smolensk} start={start} end={end} sky={GREY} accent={ICE}>
      {(g) => {
        const wall = g.ground - 60 * g.s;
        return (
          <g>
            <rect x={g.x} y={wall - 70 * g.s} width={g.W} height={70 * g.s} fill="#8a4a3a" stroke={INK} strokeWidth={1.5 * g.s} />
            {Array.from({ length: 14 }, (_, i) => <rect key={i} x={g.x + i * 70 * g.s} y={wall - 84 * g.s} width={36 * g.s} height={16 * g.s} fill="#8a4a3a" stroke={INK} strokeWidth={1.2 * g.s} />)}
            <rect x={g.x} y={wall - 72 * g.s} width={g.W} height={6 * g.s} fill="#f2f6f8" />
            {[0.2, 0.62].map((fx) => (
              <g key={fx}>
                <rect x={g.x + g.W * fx} y={wall - 140 * g.s} width={70 * g.s} height={140 * g.s} fill="#7a3e30" stroke={INK} strokeWidth={1.5 * g.s} />
                <path d={`M${g.x + g.W * fx - 8 * g.s} ${wall - 140 * g.s} L${g.x + g.W * fx + 35 * g.s} ${wall - 190 * g.s} L${g.x + g.W * fx + 78 * g.s} ${wall - 140 * g.s} Z`} fill="#3f6a4a" stroke={INK} strokeWidth={1.5 * g.s} />
              </g>
            ))}
            <SnowGround x={g.x} W={g.W} ground={wall} H={g.H} s={g.s} seed={8} />
            {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W - ((frame - start) * 0.6 * g.s + i * 115 * g.s) % (g.W * 1.05)} y={g.ground + 10 * g.s} scale={g.sc * 0.62} phase={i * 1.3} u={FRENCH} pose="trudge" wrap={1} flip />)}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} />
          </g>
        );
      }}
    </Panel>
  );
};

// Krasnoi: Ney's rearguard, a handful of men in the snow, Russian guns smoking on the ridge.
const KrasnoiScene = ({ start, end }: S) => (
  <Panel id="c7krasnoi" anchor={CITY.krasnoi} start={start} end={end} sky={["#3e4552", "#a9b2bc"]} accent={RED}>
    {(g) => (
      <g>
        <path d={`M${g.x} ${g.ground - 70 * g.s} Q${g.x + g.W * 0.7} ${g.ground - 150 * g.s} ${g.x + g.W} ${g.ground - 110 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#dfe7ec" />
        <Cannon x={g.x + g.W * 0.7} y={g.ground - 120 * g.s} scale={g.sc * 0.42} flip />
        <Cannon x={g.x + g.W * 0.86} y={g.ground - 116 * g.s} scale={g.sc * 0.42} flip />
        <Smoke x={g.x + g.W * 0.66} y={g.ground - 130 * g.s} size={30 * g.s} seed={1} wind={-0.4} />
        <Smoke x={g.x + g.W * 0.82} y={g.ground - 126 * g.s} size={30 * g.s} seed={4} wind={-0.4} />
        <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={9} />
        {[0, 1, 2].map((i) => <Soldier key={i} x={g.x + g.W * (0.14 + i * 0.1)} y={g.ground + 10 * g.s} scale={g.sc * 0.64} phase={i * 2} u={FRENCH} pose="stand" wrap={1} />)}
        <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={50} />
      </g>
    )}
  </Panel>
);

// The Berezina: the burned bridge, charred stumps in an icy river.
const BurnedBridgeScene = ({ start, end }: S) => (
  <Panel id="c7burnt" anchor={CITY.studianka} start={start} end={end} sky={GREY} accent={RED}>
    {(g) => {
      const water = g.ground - 60 * g.s;
      return (
        <g>
          <Treeline x={g.x} W={g.W} ground={water - 20 * g.s} s={g.s} color="#38443f" snow={1} />
          <rect x={g.x} y={water - 20 * g.s} width={g.W} height={20 * g.s} fill="#e9eef1" />
          <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#6f8fa3" ice={1} />
          {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((fx, i) => (
            <rect key={i} x={g.x + g.W * fx} y={water - (20 + (i % 3) * 14) * g.s} width={12 * g.s} height={(60 + (i % 3) * 14) * g.s} fill="#1e1814" stroke={INK} strokeWidth={1.2 * g.s} />
          ))}
          <Smoke x={g.x + g.W * 0.3} y={water - 30 * g.s} size={26 * g.s} seed={2} />
          <Smoke x={g.x + g.W * 0.6} y={water - 30 * g.s} size={22 * g.s} seed={7} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
        </g>
      );
    }}
  </Panel>
);

// Eblé's pontonniers, chest-deep in the icy river, holding up the trestles.
const EbleScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7eble" anchor={CITY.studianka} start={start} end={end} sky={["#6d7b88", "#cfd8de"]} accent={GOLD}>
      {(g) => {
        const water = g.ground - 70 * g.s;
        const bed = g.ground + 40 * g.s;
        const top = water - 72 * g.s;
        const xs = [0.18, 0.5, 0.82];
        const sc = g.sc * 0.72;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={water - 20 * g.s} s={g.s} color="#38443f" snow={1} />
            <rect x={g.x} y={water - 20 * g.s} width={g.W} height={20 * g.s} fill="#e9eef1" />
            <rect x={g.x} y={water} width={g.W} height={g.H} fill="#58788c" />
            {xs.map((fx) => <Trestle key={fx} x={g.x + g.W * fx} bed={bed} top={top} s={g.s * 1.4} w={60} deck={false} />)}
            <rect x={g.x} y={top - 14 * g.s} width={g.W * interpolate(frame, [start, start + 90], [0.4, 1], clamp)} height={9 * g.s} fill="#9a7a50" stroke={INK} strokeWidth={1.2 * g.s} />
            {xs.flatMap((fx, i) => [-1, 1].map((sd) => <Wader key={`${i}${sd}`} x={g.x + g.W * fx + sd * 58 * g.s} y={water + 6 * g.s} scale={sc} phase={i * 2 + sd} flip={sd > 0} hold={-(water + 6 * g.s - top) / sc} />))}
            <Water x={g.x} y={water + 4 * g.s} W={g.W} H={g.H} s={g.s} color="rgba(88,120,140,0.78)" ice={1} />
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
          </g>
        );
      }}
    </Panel>
  );
};

// The bridge: the army crossing on the trestle deck; on the last morning it burns.
const BridgeScene = ({ start, end, burning = false }: S & { burning?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={burning ? "c7burn" : "c7cross"} anchor={CITY.studianka} start={start} end={end} sky={burning ? ["#3a2a2a", "#d9a07a"] : GREY} accent={burning ? RED : ICE}>
      {(g) => {
        const water = g.ground - 40 * g.s;
        const top = water - 60 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={water - 20 * g.s} s={g.s} color="#38443f" snow={1} />
            <rect x={g.x} y={water - 20 * g.s} width={g.W} height={20 * g.s} fill="#e9eef1" />
            <Water x={g.x} y={water} W={g.W} H={g.H} s={g.s} color="#58788c" ice={1} />
            {Array.from({ length: 7 }, (_, i) => <Trestle key={i} x={g.x + (i + 0.5) * (g.W / 7)} bed={g.ground + 20 * g.s} top={top} s={g.s} w={50} />)}
            {!burning && Array.from({ length: 8 }, (_, i) => <Soldier key={i} x={g.x + g.W - ((frame - start) * 1.1 * g.s + i * 95 * g.s) % (g.W * 1.05)} y={top - 12 * g.s} scale={g.sc * 0.5} phase={i * 1.1} u={i % 3 === 2 ? POLISH : FRENCH} pose="trudge" wrap={1} flip />)}
            {burning && [0.12, 0.3, 0.5, 0.7, 0.88].map((fx, i) => <Fire key={i} x={g.x + g.W * fx} y={top - 8 * g.s} size={(70 + (i % 2) * 30) * g.s} seed={i * 3} />)}
            {burning && <Smoke x={g.x + g.W * 0.5} y={top - 70 * g.s} size={50 * g.s} seed={5} />}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={40} />
          </g>
        );
      }}
    </Panel>
  );
};

// Napoleon's sledge races west over the snow.
const SledgeScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7sledge" anchor={CITY.smorgoni} start={start} end={end} sky={["#2a3550", "#9fb0c4"]} accent={GOLD}>
      {(g) => (
        <g>
          <Treeline x={g.x + ((frame - start) * 3 * g.s) % (g.W / 13) - g.W / 13} W={g.W * 1.1} ground={g.ground - 40 * g.s} s={g.s} color="#28343a" snow={1} />
          <SnowGround x={g.x} W={g.W} ground={g.ground - 40 * g.s} H={g.H} s={g.s} seed={11} />
          <Sledge x={g.x + g.W * 0.62} y={g.ground + 4 * g.s} scale={g.sc * 0.85} flip />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={70} />
        </g>
      )}
    </Panel>
  );
};

// The last of the main army back over the frozen Neman.
const NemanScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7neman" anchor={CITY.kovno} start={start} end={end} sky={GREY} accent={ICE}>
      {(g) => {
        const ice = g.ground - 40 * g.s;
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={ice - 26 * g.s} s={g.s} color="#38443f" snow={1} />
            <rect x={g.x} y={ice - 26 * g.s} width={g.W} height={26 * g.s} fill="#e9eef1" />
            <Water x={g.x} y={ice} W={g.W} H={g.H} s={g.s} color="#8ea6b6" ice={1} />
            {[0, 1].map((i) => <Soldier key={i} x={g.x + g.W * 0.75 - ((frame - start) * 0.8 * g.s + i * 140 * g.s)} y={ice + 24 * g.s} scale={g.sc * 0.7} phase={i * 1.7} u={FRENCH} pose="trudge" wrap={1} flip />)}
            <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={60} />
          </g>
        );
      }}
    </Panel>
  );
};

// The Grande Armée is gone: an eagle standard lying in the snow.
const EagleScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7eagle" anchor={CITY.kovno} start={start} end={end} sky={["#4a525e", "#c3ccd4"]} accent={RED}>
      {(g) => (
        <g>
          <SnowGround x={g.x} W={g.W} ground={g.ground - 30 * g.s} H={g.H} s={g.s} seed={13} />
          <EagleStandard x={g.cx - 60 * g.s} y={g.ground} scale={g.sc * 1.0} fall={interpolate(frame, [start + 10, start + 40], [0.1, 1], { ...clamp, easing: Easing.in(Easing.quad) })} />
          <Snow x={g.x} y={g.y} W={g.W} H={g.H} s={g.s} n={90} />
        </g>
      )}
    </Panel>
  );
};

// ---------------------------------------------------------------- chapter

const counterBack = (frame: number) => (frame < T.ten ? "422,000 →" : "422,000 → 10,000");

export const ch7: Chapter = {
  name: "Retreat in the snow",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(V7.malo, w, h, 1, 0.1) },
    { frame: T.old + 20, cam: view(V7.malo, w, h, 1, 0.1) },
    { frame: T.vy + 10, cam: view(V7.mid, w, h, 1, 0.1) },
    { frame: T.snow + 4, cam: view(V7.mid, w, h, 1, 0.1) },
    { frame: T.winter + 30, cam: view(V7.route, w, h, 1, 0.13) },
    { frame: T.sm - 8, cam: view(V7.route, w, h, 1, 0.13) },
    { frame: T.sm + 30, cam: view(V7.smolensk, w, h, 1, 0.1) },
    { frame: T.be - 6, cam: view(V7.smolensk, w, h, 1, 0.1) },
    { frame: T.be + 30, cam: view(V7.berezina, w, h, 1, 0.1) },
    { frame: T.nl - 4, cam: view(V7.berezina, w, h, 1, 0.1) },
    { frame: T.raced + 10, cam: view(V7.paris, w, h, 1, 0.1) },
    { frame: T.bk - 4, cam: view(V7.paris, w, h, 1, 0.1) },
    { frame: T.bk + 36, cam: view(V7.route, w, h, 1, 0.13) },
    { frame: T.fl - 4, cam: view(V7.route, w, h, 1, 0.13) },
    { frame: T.flank + 26, cam: view(V7.wide, w, h, 1, 0.1) },
  ],
  years: [[from, "Oct 1812"], [T.snow, "Nov 1812"], [T.dec, "Dec 1812"], [T.sm, "Nov 1812"], [T.nl, "Dec 1812"]],
  heads: [
    { f: from, tag: "24 October 1812", head: "A new road home, south", color: TAN },
    { f: T.blocked, tag: "Maloyaroslavets", head: "The Russians block the way", color: RED },
    { f: T.old, tag: "Back to the old road", head: "Already stripped bare", color: TAN },
    { f: T.vy, tag: "Vyazma · 3 November", head: "The rearguard is mauled", color: RED },
    { f: T.running, tag: "Vyazma · 3 November", head: "A running fight", color: RED },
    { f: T.snow, tag: "Early November", head: "Winter arrives", color: ICE },
    { f: T.line, tag: "Minard's second line", head: "The temperature", color: ICE },
    { f: T.h2, tag: "The column", head: "The last horses die", color: ICE, chips: [{ text: "No horses", f: T.horses }, { text: "No cannon", f: T.cannon }, { text: "No cavalry", f: T.cavalry }] },
    { f: T.coss, tag: "Cossacks", head: "Out of the forests", color: RUS },
    { f: T.anyone, tag: "Cossacks", head: "Fall behind, and you are lost", color: RUS },
    { f: T.cold, tag: "For warmth", head: "Wagons burned, horses eaten", color: "#ff9a3c" },
    { f: T.dec, tag: "Early December · nights", head: "Deep cold", stat: "below −30 °C", color: ICE },
    { f: T.sm, tag: "Smolensk · 9 November", head: "Back in Smolensk", color: TAN },
    { f: T.sixty, tag: "Smolensk · 9 November", head: "Still fit to fight", stat: "~60,000", label: "men", color: TAN },
    { f: T.kr, tag: "Krasnoi · mid-November", head: "The Russians strike again", color: RED },
    { f: T.ney, tag: "Krasnoi · mid-November", head: "Ney's rearguard almost wiped out", color: RED },
    { f: T.be, tag: "The Berezina", head: "The bridge is burned", color: RED },
    { f: T.three, tag: "The Berezina", head: "Trapped on three sides", color: RED },
    { f: T.eb, tag: "General Eblé's engineers", head: "In the freezing water", color: GOLD },
    { f: T.two, tag: "General Eblé's engineers", head: "Two bridges", color: GOLD },
    { f: T.cr, tag: "26–29 November", head: "Crossing the Berezina", color: ICE },
    { f: T.burn, tag: "The last morning", head: "Bridges burned, thousands left", color: RED },
    { f: T.nl, tag: "5 December", head: "Napoleon leaves his army", color: GOLD },
    { f: T.raced, tag: "5 December", head: "By sledge to Paris", color: GOLD },
    { f: T.bk, tag: "Mid-December · the Neman", head: "Back where it began", color: ICE },
    { f: T.minard, tag: "Minard's map", head: "In and out", stat: counterBack, color: TAN },
    { f: T.fl, tag: "All survivors", head: "With the flank corps", color: TAN, chips: [{ text: "~100,000 incl. flank corps", f: T.hundred }] },
    { f: T.grande, tag: "December 1812", head: "The Grande Armée is gone", color: RED },
  ],
  Map: () => <Map7 />,
  Panels: () => (
    <g>
      <SouthScene start={T.south} end={T.blocked + 14} />
      <BlockScene start={T.blocked} end={T.turned + 14} />
      <OldRoadScene start={T.turned} end={T.caught + 14} />
      <VyazmaScene start={T.caught} end={T.winter + 14} />
      <SnowScene start={T.winter} end={T.cannon + 14} />
      <CannonScene start={T.cannon} end={T.coss + 14} />
      <CossackScene start={T.coss} end={T.burned + 14} />
      <FireScene start={T.burned} end={T.sm + 20} />
      <SmolenskScene start={T.sm + 6} end={T.struck + 14} />
      <KrasnoiScene start={T.struck} end={T.bridge + 14} />
      <BurnedBridgeScene start={T.bridge} end={T.water + 14} />
      <EbleScene start={T.water} end={T.crossed + 14} />
      <BridgeScene start={T.crossed} end={T.burn + 14} />
      <BridgeScene start={T.burn} end={T.napL + 14} burning />
      <SledgeScene start={T.napL} end={T.bk + 14} />
      <NemanScene start={T.bk} end={T.minard + 10} />
      <EagleScene start={T.grande} end={B.answer.start + 10} />
    </g>
  ),
  sfx: [
    [from, SFX.whoosh, 0.35],
    [T.maloPin, SFX.pop, 0.35],
    [T.blocked - 2, SFX.hit, 0.45],
    [T.turned, SFX.whoosh, 0.3],
    [T.vy + 4, SFX.whoosh, 0.3],
    [T.vyPin, SFX.pop, 0.35],
    [T.caught + 14, SFX.hit, 0.4],
    [T.winter + 4, SFX.whoosh, 0.35],
    [T.line, SFX.tick, 0.35],
    [T.horses, SFX.pop, 0.3],
    [T.cannon, SFX.pop, 0.3],
    [T.cavalry, SFX.pop, 0.3],
    [T.cut, SFX.hit, 0.3],
    [T.thirty, SFX.hit, 0.45],
    [T.sm + 2, SFX.whoosh, 0.35],
    [T.sixty, SFX.hit, 0.4],
    [T.krPin, SFX.pop, 0.35],
    [T.ney, SFX.hit, 0.4],
    [T.be + 2, SFX.whoosh, 0.35],
    [T.three, SFX.hit, 0.4],
    [T.two, SFX.pop, 0.35],
    [T.burn, SFX.hit, 0.4],
    [T.raced - 4, SFX.whoosh, 0.35],
    [T.paris, SFX.pop, 0.35],
    [T.bk + 4, SFX.whoosh, 0.35],
    [T.four, SFX.pop, 0.4],
    [T.ten, SFX.hit, 0.5],
    [T.hundred, SFX.pop, 0.4],
    [T.flank + 20, SFX.whoosh, 0.3],
    [T.grande, SFX.hit, 0.45],
  ],
};
