import type { ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { GAUL, IBERIAN, LIBYAN, ROMAN, Warrior } from "../kit/Ancient";
import { ArmyTent, Cavalry, Citizen, DroppedGear, General, Signum, Temple } from "../kit/AncientD";
import { clamp, display, font, GOLD, Panel, Pin, RED, TAN, view, type Chapter } from "../kit/news";
import { Block, MapChip } from "../kit/PeriodC";
import { PLACE } from "./route";
import { B, span, wf } from "./time";
import { H } from "./views";

// Chapter 7 "Cannae" (beats fabius → maharbal): Fabius shadows Hannibal, Rome wants a real battle, the double
// envelopment at Cannae drawn on the map at battle scale (approx.), the losses, three armies lost, Maharbal's line.
const [from, to] = span("ch7");
const INK = "#1b1d24";

const T = {
  fa: B.fabius.start,
  panicked: wf("fabius", "panicked.", 0.05),
  gave: wf("fabius", "gave", 0.18),
  fabius: wf("fabius", "Fabius", 0.3),
  refused: wf("fabius", "refused", 0.45),
  fight: wf("fabius", "fight", 0.5),
  followed: wf("fabius", "followed", 0.75),
  down: wf("fabius", "down.", 0.9),
  im: B.impatient.start,
  mocked: wf("impatient", "mocked", 0.1),
  delayer: wf("impatient", "Delayer.", 0.42),
  summer: wf("impatient", "summer", 0.6),
  wanted: wf("impatient", "wanted", 0.68),
  real: wf("impatient", "real", 0.75),
  big: wf("impatient", "big", 0.88),
  ca: B.cannae.start,
  august: wf("cannae", "August", 0.15),
  cannae: wf("cannae", "Cannae,", 0.4),
  rom: wf("cannae", "eighty-", 0.55),
  car: wf("cannae", "fifty-", 0.85),
  cr: B.crescent.start,
  weakest: wf("crescent", "weakest", 0.15),
  bulging: wf("crescent", "bulging", 0.38),
  crescentW: wf("crescent", "crescent,", 0.55),
  african: wf("crescent", "African", 0.78),
  wings: wf("crescent", "wings.", 0.95),
  gw: B.giveway.start,
  smashed: wf("giveway", "smashed", 0.15),
  gave2: wf("giveway", "gave", 0.7),
  pulled: wf("giveway", "pulled", 0.85),
  cl: B.close.start,
  africanC: wf("close", "African", 0.1),
  turned: wf("close", "turned", 0.22),
  cavalry: wf("close", "cavalry", 0.5),
  behind: wf("close", "behind.", 0.65),
  surrounded: wf("close", "surrounded.", 0.9),
  de: B.cannaedead.start,
  polybius: wf("cannaedead", "Polybius", 0.03),
  seventy: wf("cannaedead", "seventy-", 0.1),
  livy: wf("cannaedead", "Livy", 0.42),
  either: wf("cannaedead", "Either", 0.7),
  worst: wf("cannaedead", "worst", 0.85),
  pa: B.paullus.start,
  aemilius: wf("paullus", "Aemilius", 0.2),
  paullus: wf("paullus", "Paullus,", 0.28),
  rome: wf("paullus", "Rome", 0.6),
  three: wf("paullus", "three", 0.7),
  ma: B.maharbal.start,
  you: wf("maharbal", "you", 0.5),
  but: wf("maharbal", "but", 0.85),
};

export const V7 = {
  south: bbox([[12, 40.2], [17.6, 43.4]]),
  field: bbox([[15.958, 41.1945], [16.282, 41.3205]]),
  three: bbox([[9.3, 41.1], [16.4, 45.2]]),
};

// ---------------------------------------------------------------- shared helpers (ch8 uses them too)

// 0 → 1 over d frames from a, 1 → 0 over the d frames before b.
export const fade = (frame: number, a: number, b: number, d = 10) => interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
// 0 → 1 from a, then held until a hard cut at b (for pins that the next chapter keeps on screen).
export const hold = (frame: number, a: number, b: number) => (frame >= b ? 0 : interpolate(frame, [a, a + 10], [0, 1], clamp));

// Outlined text at a map point.
export const Label = ({ at, text, k, color = "#fff", size = 34, dy = 0, weight = 800 }: { at: [number, number]; text: string; k: number; color?: string; size?: number; dy?: number; weight?: number }) => {
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(at);
  if (!p) return null;
  return (
    <text x={p[0]} y={p[1] + dy * s} opacity={k} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={size * s} fill={color} stroke="#0b1020" strokeWidth={size * 0.24 * s} paintOrder="stroke" strokeLinejoin="round">
      {text}
    </text>
  );
};

// ---------------------------------------------------------------- the battle (approx., drawn at battle scale)

// Local battle grid around Cannae: u = east (0.006° lon), v = north (0.0045° lat), about 0.5 km each.
// Romans to the north facing south, Hannibal's line to the south facing north; positions approximate.
const C0: [number, number] = [16.12, 41.235];
export const G = (u: number, v: number): [number, number] => [C0[0] + u * 0.006, C0[1] + v * 0.0045];

const ease = Easing.inOut(Easing.cubic);
const iv = (frame: number, f: number[], v: number[]) => interpolate(frame, f, v, { ...clamp, easing: ease });

const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((x, i) => Math.round(x + (pb[i] - x) * t)).join(",")})`;
};

const Battle = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < T.rom - 6 || frame > T.rome + 40) return null;
  const P = (u: number, v: number) => projection(G(u, v)) ?? [0, 0];
  const pu = Math.hypot(P(1, 0)[0] - P(0, 0)[0], P(1, 0)[1] - P(0, 0)[1]);
  const poly = (pts: [number, number][]) => pts.map(([u, v], i) => `${i ? "L" : "M"}${P(u, v).join(",")}`).join(" ") + " Z";
  const all = interpolate(frame, [T.rome, T.rome + 30], [1, 0], clamp);

  // Romans: a deep block of maniples that advances, narrows and is finally hemmed in.
  const romK = spring({ frame: frame - T.rom, fps: 30, config: { damping: 14 } });
  const adv = iv(frame, [T.smashed, T.smashed + 40, T.gave2 - 10, T.pulled + 12], [0, -2, -2, -6.6]);
  const hw = iv(frame, [T.gave2 - 10, T.pulled + 12], [11, 9]);
  const depth = iv(frame, [T.gave2 - 10, T.pulled + 12], [8, 9.5]);
  const front = 4 + adv;
  const rear = front + depth;
  const loss = interpolate(frame, [T.seventy, T.either + 20], [0, 0.75], clamp);
  const romFill = mixHex("#d8392f", "#3a2a2c", loss);
  const cols = 12;
  const rows = 5;

  // Hannibal's centre: a line that bulges forward (crescent), then bends back.
  const carK = interpolate(frame, [T.car - 4, T.car + 12], [0, 1], clamp);
  const bulge = iv(frame, [T.bulging - 4, T.crescentW + 8, T.gave2 - 12, T.pulled + 12], [0, 1, 1, -1.15]);
  const arcV = (u: number) => -2 + bulge * 4 * (1 - (u / 12) ** 2);
  const arc = Array.from({ length: 25 }, (_, i) => -12 + i).map((u) => P(u, arcV(u)));
  const arcD = arc.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");

  // African wings: turn inward onto the Roman flanks.
  const turn = iv(frame, [T.turned - 6, T.turned + 34], [0, 1]);
  const afr = (side: number) => {
    const cu = side * (15.3 + (hw + 2.4 - 15.3) * turn);
    const cv = -2 + ((front + rear) / 2 + 2) * turn;
    const a = (side * Math.PI * turn) / 2;
    const corners: [number, number][] = [[-2.5, -2], [2.5, -2], [2.5, 2], [-2.5, 2]];
    return corners.map(([x, y]) => [cu + x * Math.cos(a) - y * Math.sin(a), cv + x * Math.sin(a) + y * Math.cos(a)] as [number, number]);
  };
  const afrGlow = interpolate(frame, [T.african - 4, T.african + 8, T.wings + 30, T.wings + 50], [0, 1, 1, 0], clamp);

  // Cavalry: blocks on the far wings, then a loop round behind the Romans.
  const cavHome = interpolate(frame, [T.car - 4, T.car + 12, T.cavalry, T.cavalry + 16], [0, 1, 1, 0], clamp);
  const cavBack = interpolate(frame, [T.behind, T.behind + 14], [0, 1], clamp);
  const ring = interpolate(frame, [T.surrounded - 10, T.surrounded + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pulse = 1 + Math.sin(frame * 0.25) * 0.15;

  const lab = (u: number, v: number, text: string, k: number, size = 30, color = "#fff") => {
    if (k <= 0) return null;
    const p = P(u, v);
    return (
      <text x={p[0]} y={p[1]} opacity={k} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size * s} fill={color} stroke="#0b1020" strokeWidth={size * 0.25 * s} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
    );
  };
  const ringPath = poly([[-hw - 4.8, front - 3.4], [hw + 4.8, front - 3.4], [hw + 4.8, rear + 3.2], [-hw - 4.8, rear + 3.2]]);
  const ringLen = 2 * (2 * (hw + 4.8) + (rear - front + 6.6)) * pu;

  return (
    <g opacity={all}>
      {/* Romans */}
      {romK > 0.01 && (
        <g opacity={Math.min(1, romK * 1.4)}>
          <path d={poly([[-hw - 0.4, front - 0.4], [hw + 0.4, front - 0.4], [hw + 0.4, rear + 0.4], [-hw - 0.4, rear + 0.4]])} fill="rgba(20,10,10,0.45)" stroke="#fff" strokeWidth={3 * s} />
          {Array.from({ length: cols * rows }, (_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const cw = (2 * hw) / cols;
            const rh = depth / rows;
            const u0 = -hw + c * cw + cw * 0.12;
            const v0 = front + r * rh + rh * 0.14;
            return <path key={i} d={poly([[u0, v0], [u0 + cw * 0.76, v0], [u0 + cw * 0.76, v0 + rh * 0.72], [u0, v0 + rh * 0.72]])} fill={romFill} stroke={INK} strokeWidth={1.2 * s} />;
          })}
          {lab(0, front + depth / 2 + 0.2, "ROMANS", romK, 40)}
          {lab(0, front + depth / 2 - 1.6, "~86,000", romK * interpolate(frame, [T.seventy, T.seventy + 10], [1, 0], clamp), 32, "#ffd0cc")}
        </g>
      )}
      {/* Hannibal's centre */}
      {carK > 0 && (
        <g opacity={carK}>
          <path d={arcD} fill="none" stroke={INK} strokeWidth={2.3 * pu + 6 * s} strokeLinecap="round" />
          <path d={arcD} fill="none" stroke={TAN} strokeWidth={2.3 * pu} strokeLinecap="round" />
          <path d={arcD} fill="none" stroke="#fff6dc" strokeWidth={2 * s} strokeDasharray={`${6 * s} ${10 * s}`} opacity={0.8} />
        </g>
      )}
      {/* African wings */}
      {carK > 0 &&
        [-1, 1].map((side) => (
          <g key={side} opacity={carK}>
            {afrGlow > 0 && <path d={poly(afr(side))} fill="none" stroke={GOLD} strokeWidth={14 * s * pulse} opacity={0.45 * afrGlow} style={{ filter: `blur(${4 * s}px)` }} />}
            <path d={poly(afr(side))} fill="#c9952e" stroke={INK} strokeWidth={3 * s} />
            <path d={poly(afr(side))} fill="none" stroke="#fff" strokeWidth={1.5 * s} opacity={0.7} />
          </g>
        ))}
      {/* cavalry at home, the loop, and the cavalry behind */}
      {[-1, 1].map((side) => (
        <g key={`c${side}`}>
          {cavHome > 0 && <path d={poly([[side * 19.5, -3.6], [side * 24, -3.6], [side * 24, -0.6], [side * 19.5, -0.6]])} fill={GOLD} stroke={INK} strokeWidth={3 * s} opacity={cavHome} />}
          <Arrow points={[G(side * 21.7, -0.4), G(side * 26, 5), G(side * 21, rear + 2.6), G(side * 6, rear + 2.4)]} start={T.cavalry} end={T.behind + 12} color={GOLD} width={22} opacity={interpolate(frame, [T.surrounded + 20, T.surrounded + 40], [1, 0.35], clamp)} />
        </g>
      ))}
      {cavBack > 0 && <path d={poly([[-hw, rear + 1.1], [hw, rear + 1.1], [hw, rear + 3.1], [-hw, rear + 3.1]])} fill={GOLD} stroke={INK} strokeWidth={3 * s} opacity={cavBack} />}
      {ring > 0 && (
        <g>
          <path d={ringPath} fill="none" stroke={GOLD} strokeWidth={16 * s * pulse} opacity={0.35} strokeDasharray={`${ringLen * ring} ${ringLen}`} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
          <path d={ringPath} fill="none" stroke={GOLD} strokeWidth={5 * s} strokeDasharray={`${ringLen * ring} ${ringLen}`} strokeLinejoin="round" />
        </g>
      )}
      {/* labels */}
      {lab(0, -7.2, "HANNIBAL ~50,000", carK * interpolate(frame, [T.weakest - 8, T.weakest], [1, 0], clamp), 34, GOLD)}
      {lab(0, -6.8, "weakest troops", fade(frame, T.weakest - 4, T.gw + 10), 32, "#ffe9b0")}
      {[-1, 1].map((side) => (
        <g key={`l${side}`}>
          {lab(side * 15.3, -5.6, "Africans", fade(frame, T.african - 4, T.turned + 4), 30, GOLD)}
          {lab(side * 21.7, 0.9, "cavalry", fade(frame, T.car + 6, T.cavalry + 6), 28, GOLD)}
        </g>
      ))}
      {lab(0, rear + 5.4, "cavalry behind", fade(frame, T.behind + 8, T.de + 10), 28, GOLD)}
    </g>
  );
};

// ---------------------------------------------------------------- map

// Hannibal's moves after Trasimene and Fabius shadowing him (approx.).
const H_ROUTE: [number, number][] = [PLACE.trasimene, [13.2, 43.25], [13.9, 42.9], [14.6, 42.15], [15.45, 41.55], [14.85, 41.2], [14.25, 41.12], [14.85, 41.55], [15.15, 41.75]];
const F_ROUTE: [number, number][] = [PLACE.rome, [13.1, 42.2], [13.9, 42.1], [14.75, 41.75], [14.65, 41.4], [14.25, 41.35], [14.55, 41.6], [14.75, 41.9]];

// Roman armies gathering for the battle: they slide from around Italy to Cannae.
const GATHER: [[number, number], number][] = [[[12.5, 41.85], 0], [[13.6, 42.35], 8], [[14.3, 41.3], 16], [[15.0, 42.0], 24]];

// A big red ring that blooms once around a battle pin.
const Ring = ({ at, f }: { at: [number, number]; f: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < f || frame > f + 60) return null;
  const k = (frame - f) / 60;
  return <circle cx={p[0]} cy={p[1]} r={(20 + k * 110) * s} fill="none" stroke={RED} strokeWidth={8 * s * (1 - k)} opacity={1 - k} />;
};

const Map7 = () => {
  const frame = useCurrentFrame();
  const routeO = interpolate(frame, [T.summer, T.summer + 20], [1, 0], clamp);
  return (
    <g>
      <Pin at={PLACE.rome} text="Rome" k={fade(frame, T.panicked - 4, T.ca + 30)} />
      <Pin at={PLACE.rome} text="Rome" k={hold(frame, T.three + 20, to)} dy={58} />
      <Pin at={PLACE.trasimene} text="Trasimene" k={fade(frame, from, T.im + 10)} size={0.8} color={GOLD} />
      {frame < T.summer + 20 && (
        <g opacity={routeO}>
          <Arrow points={H_ROUTE} start={T.refused - 10} end={T.down} color={GOLD} width={16} />
          <Arrow points={F_ROUTE} start={T.followed - 14} end={T.down + 24} color={RED} width={16} variant="dashed" outline="#ffffff" />
        </g>
      )}
      <MapChip at={[15.0, 41.75]} text="Hannibal" k={fade(frame, T.refused + 10, T.summer + 10)} color={GOLD} dx={150} dy={-30} size={0.8} textColor={INK} />
      <MapChip at={[13.9, 42.1]} text="Fabius" k={fade(frame, T.followed + 4, T.summer + 10)} dx={-110} dy={50} size={0.8} />
      <MapChip at={[15.2, 41.0]} text="routes approx." k={fade(frame, T.down, T.summer + 10)} color="rgba(8,14,26,0.85)" dx={90} dy={60} size={0.62} />
      <MapChip at={[13.9, 42.1]} text="the Delayer" k={fade(frame, T.delayer, T.summer + 14)} dx={-110} dy={100} size={0.8} color="#7a1f2a" />
      {/* Roman armies gather */}
      {GATHER.map(([p, d], i) => {
        const m = iv(frame, [T.big - 6 + d / 2, T.ca + 40 + d], [0, 1]);
        const at: [number, number] = [p[0] + (16.05 - p[0]) * m, p[1] + (41.3 - p[1]) * m];
        return <Block key={i} at={at} k={fade(frame, T.wanted - 6 + d, T.rom + 6)} color={RED} w={60} h={24} />;
      })}
      <Pin at={PLACE.cannae} text="Cannae" k={hold(frame, T.cannae - 4, to)} />
      <Battle />
      <MapChip at={PLACE.cannae} text="consul Paullus killed" k={fade(frame, T.paullus - 4, T.rome + 10)} dx={-250} dy={10} size={0.8} color="#7a1f2a" />
      {/* three Roman armies lost */}
      <Pin at={PLACE.trebia} text="Trebia" k={hold(frame, T.three - 6, to)} dy={interpolate(frame, [T.ma + 20, to - 1], [58, -30], clamp)} />
      <Pin at={PLACE.trasimene} text="Trasimene" k={hold(frame, T.three + 2, to)} />
      <Ring at={PLACE.trebia} f={T.three - 6} />
      <Ring at={PLACE.trasimene} f={T.three + 2} />
      <Ring at={PLACE.cannae} f={T.three + 10} />
    </g>
  );
};

// ---------------------------------------------------------------- screen: Maharbal quote card

const QuoteCard = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.ma || frame >= to) return null;
  const k = spring({ frame: frame - T.ma, fps, config: { damping: 14 } });
  const o = interpolate(frame, [to - 10, to], [1, 0], clamp);
  const q = spring({ frame: frame - T.you, fps, config: { damping: 16 } });
  const q2 = spring({ frame: frame - T.but, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * 0.1, opacity: Math.min(1, k) * o, transform: `translateX(${(1 - k) * -60 * s}px)`, fontFamily: font, color: "#fff", background: "rgba(8,14,26,0.9)", borderLeft: `${8 * s}px solid ${GOLD}`, borderRadius: 14 * s, padding: `${18 * s}px ${30 * s}px`, boxShadow: `0 ${10 * s}px ${30 * s}px rgba(0,0,0,0.5)`, lineHeight: 1.3 }}>
      <div style={{ display: "flex", gap: 12 * s, alignItems: "center" }}>
        <span style={{ background: "rgba(255,255,255,0.14)", padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 700 }}>Livy 22.51</span>
        <span style={{ background: GOLD, color: INK, padding: `${2 * s}px ${14 * s}px`, borderRadius: 30 * s, fontSize: 26 * s, fontWeight: 900 }}>Livy only</span>
      </div>
      <div style={{ fontFamily: display, fontSize: 44 * s, fontWeight: 700, textTransform: "uppercase", marginTop: 8 * s, color: GOLD }}>Maharbal, one of Hannibal's officers</div>
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 50 * s, lineHeight: 1.25, marginTop: 8 * s, minHeight: 130 * s }}>
        <span style={{ opacity: q }}>“You know how to win a victory, Hannibal, </span>
        <span style={{ opacity: q2, color: "#ffd98a" }}>but not how to use it.”</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- panels

type S = { start: number; end: number };
type GG = { x: number; W: number; H: number; ground: number; s: number };
const pave = (g: GG, c = "#cdbf9e") => <rect x={g.x} y={g.ground - 24 * g.s} width={g.W} height={g.H} fill={c} />;
const field = (g: GG, c = "#b8a66a") => <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill={c} />;

// Rome gives power to Fabius: the general in front of a temple, two legionaries.
const FabiusScene = ({ start, end }: S) => (
  <Panel id="c7fabius" anchor={PLACE.rome} start={start} end={end} sky={["#7fa3c8", "#efe2c0"]}>
    {(g) => (
      <g>
        <Temple x={g.x + g.W * 0.52} W={g.W * 0.4} ground={g.ground - 24 * g.s} s={g.s} />
        {pave(g)}
        <General x={g.x + g.W * 0.32} y={g.ground + 6 * g.s} scale={g.sc * 0.78} cloak="#7a1f2a" crest="#e8e2d0" />
        <Warrior x={g.x + g.W * 0.16} y={g.ground + 8 * g.s} scale={g.sc * 0.66} kit={ROMAN} roman pose="stand" />
        <Warrior x={g.x + g.W * 0.46} y={g.ground + 8 * g.s} scale={g.sc * 0.66} kit={ROMAN} roman pose="stand" phase={2} />
      </g>
    )}
  </Panel>
);

// Shadowing: Romans walk along the ridge, Hannibal's column marches on the plain below.
const ShadowScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7shadow" anchor={[14.6, 41.8]} start={start} end={end} sky={["#8fb0cf", "#f0e2b8"]}>
      {(g) => {
        const ridge = g.ground - 120 * g.s;
        const span = g.W + 200 * g.s;
        const dx = (frame - start) * 0.9 * g.s;
        return (
          <g>
            <path d={`M${g.x} ${ridge + 20 * g.s} Q${g.x + g.W * 0.3} ${ridge - 30 * g.s} ${g.x + g.W * 0.6} ${ridge} Q${g.x + g.W * 0.85} ${ridge + 20 * g.s} ${g.x + g.W} ${ridge - 10 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#7d8f55" />
            {field(g, "#c2ad6e")}
            {[0, 1, 2, 3].map((i) => (
              <Warrior key={`r${i}`} x={g.x - 100 * g.s + ((dx + i * 46 * g.s) % span)} y={ridge - 4 * g.s} scale={g.sc * 0.34} kit={ROMAN} roman phase={i} />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Warrior key={`c${i}`} x={g.x - 100 * g.s + ((dx + 260 * g.s + i * 110 * g.s) % span)} y={g.ground + 8 * g.s} scale={g.sc * 0.58} kit={i % 3 === 1 ? IBERIAN : LIBYAN} phase={i * 1.3} />
            ))}
          </g>
        );
      }}
    </Panel>
  );
};

// Romans mock Fabius in the Forum.
const MockScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const bubble = spring({ frame: frame - T.delayer, fps: 30, config: { damping: 11 } });
  return (
    <Panel id="c7mock" anchor={PLACE.rome} start={start} end={end} sky={["#86a8c8", "#f1e4c4"]}>
      {(g) => (
        <g>
          <Temple x={g.x + g.W * 0.08} W={g.W * 0.38} ground={g.ground - 24 * g.s} s={g.s} />
          {pave(g)}
          {[0, 1, 2, 3, 4].map((i) => (
            <Citizen key={i} x={g.x + g.W * (0.5 + i * 0.1)} y={g.ground + 8 * g.s} scale={g.sc * 0.64} phase={i * 1.7} raise={i % 2 ? 0 : 1} toga={i === 3 ? "#e2d8c0" : "#efe9da"} tunic={["#c9b48a", "#8a6a4a", "#a8946c", "#7a8a9a", "#c9b48a"][i]} flip />
          ))}
          {frame >= T.delayer && (
            <g transform={`translate(${g.x + g.W * 0.62},${g.y + 70 * g.s}) scale(${bubble})`}>
              <rect x={-120 * g.s} y={-32 * g.s} width={240 * g.s} height={64 * g.s} rx={30 * g.s} fill="#fff" stroke={INK} strokeWidth={2 * g.s} />
              <path d={`M${-10 * g.s} ${30 * g.s} L${10 * g.s} ${56 * g.s} L${20 * g.s} ${30 * g.s} Z`} fill="#fff" stroke={INK} strokeWidth={2 * g.s} />
              <text y={13 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={40 * g.s} fill={RED}>"Delayer!"</text>
            </g>
          )}
        </g>
      )}
    </Panel>
  );
};

// A big army marches out: ranks of legionaries with standards.
const LegionScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7legion" anchor={PLACE.rome} start={start} end={end} sky={["#8fb0cf", "#f2dfb0"]}>
      {(g) => {
        const span = g.W + 160 * g.s;
        const dx = (frame - start) * 1.0 * g.s;
        return (
          <g>
            {field(g, "#c2ad6e")}
            {Array.from({ length: 9 }, (_, i) => <Warrior key={`b${i}`} x={g.x - 80 * g.s + ((dx + i * 100 * g.s) % span)} y={g.ground - 30 * g.s} scale={g.sc * 0.42} kit={ROMAN} roman phase={i} />)}
            {Array.from({ length: 3 }, (_, i) => <Signum key={`s${i}`} x={g.x - 80 * g.s + ((dx + 50 * g.s + i * 330 * g.s) % span)} y={g.ground - 4 * g.s} scale={g.sc * 0.56} phase={i} />)}
            {Array.from({ length: 7 }, (_, i) => <Warrior key={`f${i}`} x={g.x - 80 * g.s + ((dx + 30 * g.s + i * 130 * g.s) % span)} y={g.ground + 10 * g.s} scale={g.sc * 0.6} kit={ROMAN} roman phase={i * 1.4} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// Cannae: the two armies face each other on the open plain.
const FaceOffScene = ({ start, end }: S) => (
  <Panel id="c7face" anchor={PLACE.cannae} start={start} end={end} sky={["#e0a860", "#f6e6b8"]} accent={GOLD}>
    {(g) => (
      <g>
        {field(g, "#c9b06a")}
        {Array.from({ length: 6 }, (_, i) => <Warrior key={`r${i}`} x={g.x + g.W * (0.05 + i * 0.065)} y={g.ground + (i % 2 ? -18 : 10) * g.s} scale={g.sc * (i % 2 ? 0.5 : 0.6)} kit={ROMAN} roman pose="stand" phase={i} />)}
        {Array.from({ length: 5 }, (_, i) => <Warrior key={`c${i}`} x={g.x + g.W * (0.66 + i * 0.07)} y={g.ground + (i % 2 ? -18 : 10) * g.s} scale={g.sc * (i % 2 ? 0.5 : 0.6)} kit={[GAUL, IBERIAN, LIBYAN][i % 3]} pose="stand" flip phase={i * 1.5} />)}
        <text x={g.x + g.W * 0.2} y={g.y + 90 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={44 * g.s} fill="#7a1f1a">~86,000</text>
        <text x={g.x + g.W * 0.8} y={g.y + 90 * g.s} textAnchor="middle" fontFamily={display} fontWeight={700} fontSize={44 * g.s} fill="#6a4a10">~50,000</text>
      </g>
    )}
  </Panel>
);

// The weak centre: Gauls and Iberians in a bulging line.
const CentreScene = ({ start, end }: S) => (
  <Panel id="c7centre" anchor={G(0, -2)} start={start} end={end} sky={["#e0a860", "#f6e6b8"]} accent={GOLD}>
    {(g) => (
      <g>
        {field(g, "#c9b06a")}
        {Array.from({ length: 7 }, (_, i) => {
          const t = (i - 3) / 3;
          return <Warrior key={i} x={g.x + g.W * (0.14 + i * 0.12)} y={g.ground + 10 * g.s - (1 - t * t) * 34 * g.s} scale={g.sc * 0.62} kit={i % 2 ? IBERIAN : GAUL} pose="stand" flip phase={i * 1.2} />;
        })}
        <text x={g.x + g.W - 30 * g.s} y={g.y + 46 * g.s} textAnchor="end" fontFamily={font} fontWeight={800} fontSize={26 * g.s} fill={INK} opacity={0.75}>Gauls and Iberians</text>
      </g>
    )}
  </Panel>
);

// The strong wings: African infantry in close ranks.
const AfricanScene = ({ start, end }: S) => (
  <Panel id="c7african" anchor={G(15.3, -2)} start={start} end={end} sky={["#d99a58", "#f4e0ae"]} accent={GOLD}>
    {(g) => (
      <g>
        {field(g, "#c9b06a")}
        {Array.from({ length: 8 }, (_, i) => <Warrior key={`b${i}`} x={g.x + g.W * (0.1 + i * 0.11)} y={g.ground - 22 * g.s} scale={g.sc * 0.5} kit={LIBYAN} pose="stand" flip phase={i} />)}
        {Array.from({ length: 7 }, (_, i) => <Warrior key={`f${i}`} x={g.x + g.W * (0.15 + i * 0.12)} y={g.ground + 10 * g.s} scale={g.sc * 0.62} kit={LIBYAN} pose="stand" flip phase={i * 1.6} />)}
        <text x={g.x + g.W - 30 * g.s} y={g.y + 46 * g.s} textAnchor="end" fontFamily={font} fontWeight={800} fontSize={26 * g.s} fill={INK} opacity={0.75}>African infantry</text>
      </g>
    )}
  </Panel>
);

// The Romans smash into the centre; it gives ground.
const ChargeScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const back = Math.min(1, (frame - start) / 110);
  return (
    <Panel id="c7charge" anchor={G(0, 0)} start={start} end={end} sky={["#d99a58", "#f4e0ae"]}>
      {(g) => (
        <g>
          {field(g, "#c9b06a")}
          {Array.from({ length: 4 }, (_, i) => <Warrior key={`g${i}`} x={g.x + g.W * (0.58 + i * 0.11) + back * 90 * g.s} y={g.ground + (i % 2 ? -14 : 10) * g.s} scale={g.sc * 0.6} kit={i % 2 ? IBERIAN : GAUL} pose="walk" flip phase={i} />)}
          {Array.from({ length: 5 }, (_, i) => <Warrior key={`r${i}`} x={g.x + g.W * (0.06 + i * 0.1) + back * 110 * g.s} y={g.ground + (i % 2 ? -14 : 10) * g.s} scale={g.sc * 0.6} kit={ROMAN} roman pose="charge" phase={i * 1.3} />)}
          {[0, 1, 2].map((i) => <circle key={i} cx={g.x + g.W * (0.3 + i * 0.12) + back * 100 * g.s} cy={g.ground - 6 * g.s} r={(24 + i * 6) * g.s} fill="#e2c48a" opacity={0.4} />)}
        </g>
      )}
    </Panel>
  );
};

// The African wings turn inward from both sides.
const TurnInScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  const m = Math.min(1, (frame - start) / 90);
  return (
    <Panel id="c7turn" anchor={G(-11.5, 2)} start={start} end={end} sky={["#d08a50", "#f2d8a2"]} accent={GOLD}>
      {(g) => (
        <g>
          {field(g, "#c9b06a")}
          {Array.from({ length: 4 }, (_, i) => <Warrior key={`m${i}`} x={g.x + g.W / 2 + (i - 1.5) * 44 * g.s} y={g.ground - 30 * g.s} scale={g.sc * 0.42} kit={ROMAN} roman pose="stand" phase={i} />)}
          {Array.from({ length: 3 }, (_, i) => <Warrior key={`l${i}`} x={g.x + g.W * (0.04 + i * 0.08) + m * 70 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.62} kit={LIBYAN} phase={i * 1.2} />)}
          {Array.from({ length: 3 }, (_, i) => <Warrior key={`r${i}`} x={g.x + g.W * (0.96 - i * 0.08) - m * 70 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.62} kit={LIBYAN} flip phase={i * 1.5} />)}
        </g>
      )}
    </Panel>
  );
};

// Hannibal's cavalry comes round behind.
const CavalryScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7cav" anchor={G(-24, 6)} start={start} end={end} sky={["#d08a50", "#f2d8a2"]} accent={GOLD}>
      {(g) => {
        const span = g.W + 300 * g.s;
        const dx = (frame - start) * 3.2 * g.s;
        return (
          <g>
            {field(g, "#c9b06a")}
            {Array.from({ length: 4 }, (_, i) => {
              const px = g.x + g.W + 150 * g.s - ((dx + i * 260 * g.s) % span);
              return (
                <g key={i}>
                  <circle cx={px + 60 * g.s} cy={g.ground - 10 * g.s} r={30 * g.s} fill="#e2c48a" opacity={0.45} />
                  <Cavalry x={px} y={g.ground + (i % 2 ? -8 : 10) * g.s} scale={g.sc * 0.7} kit={i % 2 ? IBERIAN : LIBYAN} coat={i % 2 ? "#5a3a22" : "#8a5a32"} flip phase={i * 1.7} />
                </g>
              );
            })}
          </g>
        );
      }}
    </Panel>
  );
};

// After the battle: an empty field at dusk, dropped shields and a fallen standard. No bodies.
const FieldScene = ({ start, end }: S) => (
  <Panel id="c7field" anchor={PLACE.cannae} start={start} end={end} sky={["#3a2a3a", "#d98a5a"]}>
    {(g) => (
      <g>
        <circle cx={g.x + g.W * 0.78} cy={g.ground - 60 * g.s} r={50 * g.s} fill="#ffb070" opacity={0.8} />
        {field(g, "#6a5638")}
        <Smoke x={g.x + g.W * 0.3} y={g.ground - 40 * g.s} size={40 * g.s} seed={3} wind={0.15} />
        <Smoke x={g.x + g.W * 0.7} y={g.ground - 46 * g.s} size={34 * g.s} seed={7} wind={0.15} />
        <DroppedGear x={g.x + g.W * 0.18} y={g.ground + 4 * g.s} scale={g.sc * 0.5} />
        <DroppedGear x={g.x + g.W * 0.52} y={g.ground + 12 * g.s} scale={g.sc * 0.58} flip />
        <DroppedGear x={g.x + g.W * 0.84} y={g.ground + 2 * g.s} scale={g.sc * 0.45} />
        <Signum x={g.x + g.W * 0.36} y={g.ground + 6 * g.s} scale={g.sc * 0.6} fall={1} />
      </g>
    )}
  </Panel>
);

// Rome in mourning: citizens standing in silence in the Forum.
const MourningScene = ({ start, end }: S) => (
  <Panel id="c7mourn" anchor={PLACE.rome} start={start} end={end} sky={["#4a5568", "#b9b4a8"]}>
    {(g) => (
      <g>
        <Temple x={g.x + g.W * 0.56} W={g.W * 0.36} ground={g.ground - 24 * g.s} s={g.s} color="#cfc6b0" shade="#aaa08a" />
        {pave(g, "#a89c84")}
        {[0, 1, 2, 3, 4].map((i) => (
          <Citizen key={i} x={g.x + g.W * (0.1 + i * 0.1)} y={g.ground + (i % 2 ? -10 : 8) * g.s} scale={g.sc * (i % 2 ? 0.56 : 0.64)} phase={i * 2} toga={i % 2 ? "#5a5560" : "#3a3a44"} tunic="#5a5048" />
        ))}
      </g>
    )}
  </Panel>
);

// Consul Paullus died on the field: his helmet and cloak on the ground.
const ConsulScene = ({ start, end }: S) => (
  <Panel id="c7consul" anchor={PLACE.cannae} start={start} end={end} sky={["#2f2a3a", "#c87a52"]}>
    {(g) => {
      const cx = g.x + g.W / 2;
      return (
        <g>
          {field(g, "#5e4c32")}
          <path d={`M${cx - 220 * g.s} ${g.ground + 10 * g.s} Q${cx - 120 * g.s} ${g.ground - 30 * g.s} ${cx} ${g.ground - 8 * g.s} Q${cx + 90 * g.s} ${g.ground + 14 * g.s} ${cx + 40 * g.s} ${g.ground + 30 * g.s} L${cx - 200 * g.s} ${g.ground + 34 * g.s} Z`} fill="#4a3a6a" stroke={INK} strokeWidth={1.5 * g.s} />
          <DroppedGear x={cx} y={g.ground + 18 * g.s} scale={g.sc * 1.0} crest="#e8e2d0" />
          <Signum x={g.x + g.W * 0.82} y={g.ground + 10 * g.s} scale={g.sc * 0.6} broken />
        </g>
      );
    }}
  </Panel>
);

// Three Roman armies lost: three fallen standards, one per battle.
const StandardsScene = ({ start, end }: S) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c7three" anchor={PLACE.trasimene} start={start} end={end} sky={["#4a5568", "#c9b8a0"]}>
      {(g) => (
        <g>
          {field(g, "#7a6a4a")}
          {["Trebia", "Trasimene", "Cannae"].map((t, i) => {
            const f = start + i * 8;
            const fall = interpolate(frame, [f, f + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
            return (
              <g key={t}>
                <Signum x={g.x + g.W * (0.18 + i * 0.3)} y={g.ground - 10 * g.s} scale={g.sc * 0.62} fall={fall * 0.9} phase={i} />
                <text x={g.x + g.W * (0.24 + i * 0.3)} y={g.ground + 30 * g.s} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34 * g.s} fill="#fff" stroke={INK} strokeWidth={6 * g.s} paintOrder="stroke" opacity={fall}>{t}</text>
              </g>
            );
          })}
        </g>
      )}
    </Panel>
  );
};

// Maharbal, on horseback, talks to Hannibal after the battle.
const MaharbalScene = ({ start, end }: S) => (
  <Panel id="c7maharbal" anchor={PLACE.cannae} start={start} end={end} sky={["#2a2f4a", "#d0905a"]} accent={GOLD}>
    {(g) => (
      <g>
        <ArmyTent x={g.x + g.W * 0.12} y={g.ground - 40 * g.s} scale={g.sc * 0.6} />
        <ArmyTent x={g.x + g.W * 0.88} y={g.ground - 44 * g.s} scale={g.sc * 0.5} color="#a88a5a" />
        {field(g, "#7a6440")}
        <General x={g.x + g.W * 0.36} y={g.ground + 8 * g.s} scale={g.sc * 0.8} cloak="#5a2a6a" crest="#f2ead8" armor="#b9a46a" skin="#c58e64" />
        <Cavalry x={g.x + g.W * 0.64} y={g.ground + 10 * g.s} scale={g.sc * 0.8} kit={LIBYAN} gait="stand" flip coat="#3a2a1e" />
      </g>
    )}
  </Panel>
);

// ---------------------------------------------------------------- chapter

const PANELS: [(p: S) => ReactNode, number][] = [
  [FabiusScene, T.gave],
  [ShadowScene, T.followed],
  [MockScene, T.mocked],
  [LegionScene, T.wanted],
  [FaceOffScene, T.cannae],
  [CentreScene, T.weakest],
  [AfricanScene, T.african],
  [ChargeScene, T.smashed],
  [TurnInScene, T.africanC],
  [CavalryScene, T.cavalry],
  [FieldScene, T.polybius],
  [MourningScene, T.either],
  [ConsulScene, T.aemilius],
  [StandardsScene, T.three],
  [MaharbalScene, T.ma + 6],
];
export const CH7_LAST_PANEL_END = B.answer.start + 14; // hands over to ch8's first panel

export const ch7: Chapter = {
  name: "Cannae",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: H(7, w, h) },
    { frame: T.summer - 10, cam: H(7, w, h) },
    { frame: T.big + 10, cam: view(V7.south, w, h, 1, 0.1) },
    { frame: T.ca + 4, cam: view(V7.south, w, h, 1, 0.1) },
    { frame: T.cannae + 10, cam: view(V7.field, w, h, 1, 0.08) },
    { frame: T.rome - 6, cam: view(V7.field, w, h, 1, 0.08) },
    { frame: T.three - 4, cam: view(V7.three, w, h, 0.6, 0.08) },
    { frame: T.ma + 20, cam: view(V7.three, w, h, 0.6, 0.08) },
    { frame: to - 1, cam: H(8, w, h) },
  ],
  years: [[from, "217 BC"], [T.summer, "216 BC"], [T.august, "2 Aug 216 BC"]],
  heads: [
    { f: from, tag: "217 BC · after Trasimene", head: "Rome panics", color: RED },
    { f: T.fabius, tag: "Rome's answer", head: "Fabius Maximus", color: RED, chips: [{ text: "No battles", f: T.fight }, { text: "Follow and wear him down", f: T.followed + 10 }] },
    { f: T.mocked, tag: "Fabius Maximus", head: "Mocked in Rome", color: RED, chips: [{ text: "the Delayer", f: T.delayer }] },
    { f: T.summer, tag: "216 BC", head: "Enough waiting", color: RED, chips: [{ text: "A real battle", f: T.real }, { text: "A big army", f: T.big }] },
    { f: T.ca, tag: "2 August 216 BC", head: "Cannae", color: RED },
    { f: T.rom, tag: "Cannae · positions approx.", head: "Romans", stat: "~86,000", label: "men", color: RED },
    { f: T.car, tag: "Cannae · positions approx.", head: "Hannibal", stat: "~50,000", label: "men", color: GOLD },
    { f: T.cr, tag: "Hannibal's plan · approx.", head: "The crescent", color: GOLD, chips: [{ text: "Weak centre", f: T.weakest }, { text: "Strong wings", f: T.wings - 6 }] },
    { f: T.gw, tag: "Cannae · approx.", head: "The centre bends", color: GOLD, chips: [{ text: "Pulling them in", f: T.pulled }] },
    { f: T.cl, tag: "Cannae · approx.", head: "The trap closes", color: GOLD, chips: [{ text: "Wings turn in", f: T.turned }, { text: "Cavalry behind", f: T.behind }, { text: "Surrounded", f: T.surrounded }] },
    {
      f: T.de,
      tag: "Roman dead · ancient figure",
      head: "Polybius says",
      stat: (f: number) => `~${(Math.round(interpolate(f, [T.seventy - 4, T.seventy + 34], [0, 70], { ...clamp, easing: Easing.out(Easing.cubic) })) * 1000).toLocaleString("en-US")}`,
      label: "Romans",
      color: RED,
    },
    { f: T.livy, tag: "Roman dead · ancient figure", head: "Livy says", stat: "~48,000", label: "Romans", color: RED },
    { f: T.either, tag: "Roman dead · Livy / Polybius", head: "One of history's worst defeats", stat: "48,000–70,000", color: RED },
    { f: T.pa, tag: "Cannae · 216 BC", head: "A consul killed", color: RED, chips: [{ text: "consul Paullus", f: T.paullus }] },
    { f: T.rome, tag: "Rome's losses", head: "Three armies", stat: "3", label: "in under two years", color: RED, chips: [{ text: "Trebia", f: T.three - 6 }, { text: "Trasimene", f: T.three + 2 }, { text: "Cannae", f: T.three + 10 }] },
    { f: T.ma, tag: "", head: "" },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    if (frame < from - 30) return null;
    return <Map7 />;
  },
  Panels: () => (
    <g>
      {PANELS.map(([P, start], i) => (
        <P key={i} start={start} end={i < PANELS.length - 1 ? PANELS[i + 1][1] + 14 : CH7_LAST_PANEL_END} />
      ))}
    </g>
  ),
  Screen: () => <QuoteCard />,
  sfx: [
    [T.panicked, SFX.pop, 0.35],
    [T.fabius, SFX.pop, 0.35],
    [T.refused - 6, SFX.whoosh, 0.3],
    [T.delayer, SFX.pop, 0.4],
    [T.big, SFX.whoosh, 0.35],
    [T.ca + 4, SFX.whoosh, 0.4],
    [T.cannae, SFX.pop, 0.4],
    [T.rom, SFX.hit, 0.4],
    [T.car, SFX.hit, 0.4],
    [T.bulging, SFX.whoosh, 0.3],
    [T.african, SFX.pop, 0.35],
    [T.smashed, SFX.hit, 0.4],
    [T.turned, SFX.whoosh, 0.35],
    [T.cavalry, SFX.whoosh, 0.35],
    [T.surrounded, SFX.hit, 0.45],
    [T.seventy, SFX.tick, 0.3],
    [T.livy, SFX.tick, 0.3],
    [T.either, SFX.hit, 0.45],
    [T.paullus, SFX.pop, 0.4],
    [T.rome - 6, SFX.whoosh, 0.35],
    [T.three - 6, SFX.pop, 0.35],
    [T.three + 2, SFX.pop, 0.35],
    [T.three + 10, SFX.pop, 0.35],
    [T.ma, SFX.pop, 0.4],
    [T.you, SFX.swell, 0.3],
  ],
};
