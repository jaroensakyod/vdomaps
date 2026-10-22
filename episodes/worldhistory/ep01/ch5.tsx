import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow } from "../../../components/Arrow";
import { Fire, FigureDefs, Smoke } from "../../../components/Figures";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { BLUE, clamp, display, font, GOLD, Panel, PANEL_TOP, Pin, QuizNews, RED, RUS, view, type Chapter } from "../kit/news";
import { FRENCH, Napoleon, RUSSIAN, Soldier, Treeline } from "../kit/Period";
import { Block, Cannon, Earthwork, Fort, Grenadier, House, Kutuzov, MapChip, MapGlow, MoscowSkyline, Signpost, Tricolour } from "../kit/PeriodC";
import { CITY } from "./minard";
import { at, B, span, wf } from "./time";

// Chapter 5 (smolensk → quizans2): Smolensk burns, the choice to push on, Kutuzov, Borodino (approximate positions),
// 70,000+ casualties, the Guard held back, the quiz, and Russia giving up Moscow.
const [from, to] = span("ch5");

const T = {
  smol: B.smolensk.start,
  smolPin: wf("smolensk", "Smolensk", 0.2),
  caught: wf("smolensk", "caught", 0.48),
  city: wf("smolensk", "city", 0.66),
  slipped: wf("smolensk", "slipped", 0.9),
  losses: B.smolosses.start,
  three: at("smolosses", 0.06),
  fr: at("smolosses", 0.3),
  ru: at("smolosses", 0.55),
  kw: at("smolosses", 0.8),
  choice: B.choice.start,
  stop: wf("choice", "Stop", 0.3),
  push: wf("choice", "push", 0.6),
  pushed: wf("choice", "pushed", 0.9),
  kut: B.kutuzov.start,
  furious: wf("kutuzov", "furious", 0.15),
  endless: wf("kutuzov", "endless", 0.3),
  tsar: wf("kutuzov", "Tsar", 0.45),
  old: wf("kutuzov", "old", 0.65),
  eyed: wf("kutuzov", "eyed", 0.7),
  mikhail: wf("kutuzov", "Mikhail", 0.85),
  stand: B.stand.start,
  turned: wf("stand", "turned", 0.2),
  village: wf("stand", "village", 0.45),
  boro: wf("stand", "Borodino", 0.55),
  km: wf("stand", "kilometres", 0.8),
  mosc: wf("stand", "Moscow", 0.95),
  sides: B.sides.start,
  sept: wf("sides", "September", 0.1),
  fr130: wf("sides", "About", 0.3),
  ru120: wf("sides", "against", 0.5),
  cannon: wf("sides", "over", 0.8),
  battle: B.battle.start,
  dawn: wf("battle", "dawn", 0.2),
  dark: wf("battle", "dark", 0.4),
  earth: wf("battle", "earthworks", 0.55),
  fleches: wf("battle", "flèches", 0.7),
  redoubt: wf("battle", "Great", 0.88),
  loss: B.losses.start,
  seventy: wf("losses", "seventy-", 0.18),
  dead: wf("losses", "dead", 0.4),
  bloodiest: wf("losses", "bloodiest", 0.65),
  guard: B.guard.start,
  refused: wf("guard", "refused", 0.1),
  imperial: wf("guard", "Imperial", 0.25),
  reserve: wf("guard", "last", 0.4),
  rus: wf("guard", "Russian", 0.66),
  pulled: wf("guard", "pulled", 0.85),
  pyr: B.pyrrhic.start,
  held: wf("pyrrhic", "held", 0.2),
  knock: wf("pyrrhic", "knockout", 0.6),
  quiz: B.quiz2.start,
  ans: B.quizans2.start,
  save: wf("quizans2", "save", 0.4),
  abandoned: wf("quizans2", "abandoned", 0.75),
};

export const V5 = {
  smol: bbox([[30.9, 54.45], [33.1, 55.15]]),
  route: bbox([[31.2, 54.5], [38.4, 56.0]]),
  mosc: bbox([[35.3, 55.3], [38.3, 55.9]]),
  field: bbox([[35.7, 55.465], [35.96, 55.555]]),
};

// Approximate positions on the morning of 7 September (west = French, east = Russian).
const FR: [number, number][] = [[35.785, 55.489], [35.795, 55.503], [35.8, 55.515], [35.803, 55.53]];
const GUARD: [number, number] = [35.765, 55.5];
const RU: [number, number][] = [[35.852, 55.49], [35.846, 55.504], [35.853, 55.519], [35.866, 55.534], [35.885, 55.51]];
const FLECHES: [number, number] = [35.828, 55.507];
const REDOUBT: [number, number] = [35.839, 55.5175];
const ease = Easing.inOut(Easing.cubic);

// ---- panels ----

// Smolensk: the red fortress wall and churches, then the city catches fire.
const SmolenskScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5smol" anchor={CITY.smolensk} start={start} end={end} sky={["#3a2a3a", "#e0703a"]}>
      {(g) => {
        const burn = interpolate(frame, [T.city - 10, T.city + 30], [0, 1], clamp);
        return (
          <g>
            <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#5a5a3a" />
            <MoscowSkyline x={g.x + 40 * g.s} y={g.ground - 10 * g.s} W={g.W - 80 * g.s} s={g.s * 0.95} burn={burn} bell={false} />
            {[0.15, 0.32, 0.55, 0.72, 0.9].map((k, i) => <Smoke key={`s${i}`} x={g.x + g.W * k} y={g.ground - 120 * g.s} size={70 * g.s} seed={i} k={burn} />)}
            {[0.15, 0.32, 0.55, 0.72, 0.9].map((k, i) => <Fire key={i} x={g.x + g.W * k} y={g.ground - (50 + (i % 2) * 40) * g.s} size={(60 + (i % 3) * 20) * g.s} seed={i + 2} k={burn} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The choice: Napoleon at a signpost, "Winter quarters" or "Moscow".
const ChoiceScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5choice" anchor={CITY.smolensk} start={start} end={end} sky={["#7aa0c4", "#f0d9a0"]} accent={GOLD}>
      {(g) => {
        const k = interpolate(frame, [T.pushed - 4, T.pushed + 8], [0, 1], clamp);
        const pick = interpolate(frame, [T.push - 6, T.push + 10], [0.5, 1], clamp);
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 30 * g.s} s={g.s} color="#3e5a3a" />
            <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a9a5a" />
            <path d={`M${g.cx} ${g.ground + 46 * g.s} L${g.cx - 40 * g.s} ${g.ground - 30 * g.s} M${g.cx} ${g.ground + 46 * g.s} L${g.x + g.W} ${g.ground - 10 * g.s}`} stroke="#c9b48a" strokeWidth={22 * g.s} fill="none" />
            <Signpost x={g.cx} y={g.ground - 190 * g.s} s={g.s} left="WINTER QUARTERS" right="MOSCOW" k={frame < T.push ? 0.4 : Math.max(pick, k)} />
            <Napoleon x={g.x + g.W * 0.2 + k * 80 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.85} />
            {[0, 1, 2].map((i) => <Soldier key={i} x={g.x + g.W * (0.06 + i * 0.05) + k * 60 * g.s} y={g.ground + 22 * g.s} scale={g.sc * 0.6} phase={i} u={FRENCH} pose={k > 0.5 ? "walk" : "stand"} />)}
          </g>
        );
      }}
    </Panel>
  );
};

// The endless retreat: a Russian column marches east past a burning village.
const RetreatScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5retreat" anchor={CITY.vyazma} start={start} end={end} sky={["#6a7a8a", "#e0b080"]} accent={RUS}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#3a4a3a" />
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#8a7a50" />
          <House x={g.x + 30 * g.s} y={g.ground - 30 * g.s} s={g.s * 0.8} />
          <Smoke x={g.x + 80 * g.s} y={g.ground - 120 * g.s} size={60 * g.s} seed={4} />
          <Fire x={g.x + 80 * g.s} y={g.ground - 90 * g.s} size={70 * g.s} seed={4} />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.3 + ((frame - start) * 1.3 * g.s + i * 110 * g.s) % (g.W * 0.75)} y={g.ground + 14 * g.s} scale={g.sc * 0.62} phase={i * 0.8} u={RUSSIAN} />)}
        </g>
      )}
    </Panel>
  );
};

// Kutuzov: portrait panel.
const KutuzovScene = ({ start, end, id = "c5kut" }: { start: number; end: number; id?: string }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={CITY.borodino} start={start} end={end} sky={["#4a6a8a", "#d8c8a0"]} accent={RUS}>
      {(g) => {
        const z = interpolate(frame, [start, end], [1, 1.12], clamp);
        return (
          <g>
            <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#3a4a3a" />
            <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#7a8a5a" />
            {[0, 1, 2].map((i) => <Soldier key={i} x={g.x + g.W * (0.68 + i * 0.1)} y={g.ground - 20 * g.s} scale={g.sc * 0.5} phase={i} u={RUSSIAN} pose="stand" flip />)}
            <g transform={`translate(${g.x + g.W * 0.38},${g.ground + 20 * g.s}) scale(${z}) translate(${-(g.x + g.W * 0.38)},${-(g.ground + 20 * g.s)})`}>
              <Kutuzov x={g.x + g.W * 0.38} y={g.ground + 20 * g.s} scale={g.sc * 1.3} />
            </g>
          </g>
        );
      }}
    </Panel>
  );
};

// Kutuzov turns to fight: Russian infantry behind a fresh earthwork, guns facing west.
const StandScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5stand" anchor={CITY.borodino} start={start} end={end} sky={["#5a7aa0", "#e8d0a0"]} accent={RUS}>
    {(g) => (
      <g>
        <Treeline x={g.x} W={g.W} ground={g.ground - 50 * g.s} s={g.s} color="#3a4a3a" />
        <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#7a8a5a" />
        {[0, 1, 2, 3].map((i) => <Soldier key={i} x={g.x + g.W * (0.5 + i * 0.09)} y={g.ground - 30 * g.s} scale={g.sc * 0.55} phase={i} u={RUSSIAN} pose="stand" flip />)}
        <Earthwork x0={g.x + g.W * 0.22} x1={g.x + g.W * 0.82} y={g.ground + 10 * g.s} s={g.s} h={50} />
        <Cannon x={g.x + g.W * 0.36} y={g.ground - 40 * g.s} scale={g.sc * 0.7} flip every={9999} />
        <Kutuzov x={g.x + g.W * 0.9} y={g.ground + 16 * g.s} scale={g.sc * 0.85} flip />
      </g>
    )}
  </Panel>
);

// French columns advance (marching right, towards the Russians).
const FrenchScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5french" anchor={FR[2]} start={start} end={end} sky={["#7aa0c4", "#f0d9a0"]} accent={BLUE}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a9a5a" />
          {Array.from({ length: 2 }, (_, r) =>
            Array.from({ length: 7 }, (_, i) => (
              <Soldier key={`${r}${i}`} x={g.x + ((frame - start) * 1.2 * g.s + i * 130 * g.s + r * 60 * g.s) % (g.W + 100 * g.s) - 50 * g.s} y={g.ground - (r ? 16 : -18) * g.s} scale={g.sc * (r ? 0.55 : 0.68)} phase={i + r} u={FRENCH} />
            )),
          )}
          <Napoleon x={g.x + g.W * 0.08} y={g.ground - 30 * g.s} scale={g.sc * 0.62} />
        </g>
      )}
    </Panel>
  );
};

// The Russian line waits behind the earthworks, facing west.
const RussianScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5russian" anchor={RU[2]} start={start} end={end} sky={["#7aa0c4", "#f0d9a0"]} accent={RUS}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#7a8a5a" />
        {Array.from({ length: 2 }, (_, r) =>
          Array.from({ length: 8 }, (_, i) => <Soldier key={`${r}${i}`} x={g.x + g.W * (0.3 + i * 0.09) + r * 40 * g.s} y={g.ground - (r ? 20 : -16) * g.s} scale={g.sc * (r ? 0.52 : 0.64)} phase={i * 0.7 + r} u={RUSSIAN} pose="stand" flip />),
        )}
        <Earthwork x0={g.x - 40 * g.s} x1={g.x + g.W * 0.3} y={g.ground + 20 * g.s} s={g.s} h={44} />
      </g>
    )}
  </Panel>
);

// Over 1,200 guns: a battery firing.
const GunsScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5guns" anchor={FR[1]} start={start} end={end} sky={["#8a94a0", "#e8dcc0"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#7a7a50" />
        {[0, 1, 2, 3].map((i) => <Cannon key={i} x={g.x + g.W * (0.12 + i * 0.22)} y={g.ground + 4 * g.s - (i % 2) * 24 * g.s} scale={g.sc * 0.85} phase={i * 17} every={48} />)}
      </g>
    )}
  </Panel>
);

// Dawn to dusk: smoke over the Great Redoubt, guns firing, French columns climbing (no casualties shown).
const RedoubtScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  const dusk = interpolate(frame, [T.dawn, T.dark + 20], [0, 1], clamp);
  const sky: [string, string] = dusk < 0.5 ? ["#5a5a7a", "#f0a060"] : ["#2a2a4a", "#c0502a"];
  return (
    <Panel id="c5redoubt" anchor={REDOUBT} start={start} end={end} sky={sky}>
      {(g) => (
        <g>
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#6a6a44" />
          <Earthwork x0={g.x + g.W * 0.45} x1={g.x + g.W + 40 * g.s} y={g.ground + 4 * g.s} s={g.s} h={70} />
          {[0, 1].map((i) => <Cannon key={i} x={g.x + g.W * (0.62 + i * 0.2)} y={g.ground - 66 * g.s} scale={g.sc * 0.7} flip phase={i * 23} every={40} />)}
          {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.05 + ((frame - start) * 0.8 * g.s + i * 70 * g.s) % (g.W * 0.4)} y={g.ground + 20 * g.s} scale={g.sc * 0.58} phase={i} u={FRENCH} />)}
          {[0.2, 0.45, 0.6, 0.8].map((k, i) => <Smoke key={i} x={g.x + g.W * k} y={g.ground - 60 * g.s} size={90 * g.s} seed={i + 7} wind={-0.2} />)}
        </g>
      )}
    </Panel>
  );
};

// The Guard stays back: Napoleon with the bearskinned grenadiers standing at ease.
const GuardScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5guard" anchor={GUARD} start={start} end={end} sky={["#5a5a7a", "#d09060"]} accent="#8a8d93">
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#6a7a4a" />
        <Smoke x={g.x + g.W * 0.9} y={g.ground - 50 * g.s} size={80 * g.s} seed={3} />
        {Array.from({ length: 2 }, (_, r) =>
          Array.from({ length: 6 }, (_, i) => <Grenadier key={`${r}${i}`} x={g.x + g.W * (0.08 + i * 0.09) + r * 40 * g.s} y={g.ground - (r ? 22 : -12) * g.s} scale={g.sc * (r ? 0.5 : 0.62)} phase={i + r} />),
        )}
        <Napoleon x={g.x + g.W * 0.78} y={g.ground + 16 * g.s} scale={g.sc * 0.9} flip />
      </g>
    )}
  </Panel>
);

// The Russian army pulls back east in good order.
const WithdrawScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5withdraw" anchor={RU[4]} start={start} end={end} sky={["#3a3a5a", "#c07040"]} accent={RUS}>
      {(g) => (
        <g>
          <Treeline x={g.x} W={g.W} ground={g.ground - 40 * g.s} s={g.s} color="#2a3a2a" />
          <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={g.H} fill="#5a6a44" />
          {Array.from({ length: 2 }, (_, r) =>
            Array.from({ length: 7 }, (_, i) => <Soldier key={`${r}${i}`} x={g.x + ((frame - start) * 1.1 * g.s + i * 140 * g.s + r * 70 * g.s) % (g.W + 100 * g.s) - 50 * g.s} y={g.ground - (r ? 16 : -18) * g.s} scale={g.sc * (r ? 0.52 : 0.64)} phase={0} u={RUSSIAN} />),
          )}
          <Cannon x={g.x + g.W * 0.5 + (frame - start) * 1.1 * g.s} y={g.ground + 30 * g.s} scale={g.sc * 0.6} every={9999} />
        </g>
      )}
    </Panel>
  );
};

// The French hold the field: a torn tricolour over the smoking ground at dusk.
const FieldScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="c5field" anchor={CITY.borodino} start={start} end={end} sky={["#2a2a44", "#b0603a"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#4a4a34" />
        <Earthwork x0={g.x + g.W * 0.4} x1={g.x + g.W * 0.95} y={g.ground + 4 * g.s} s={g.s} h={60} />
        {[0.15, 0.5, 0.85].map((k, i) => <Smoke key={i} x={g.x + g.W * k} y={g.ground - 40 * g.s} size={70 * g.s} seed={i + 11} />)}
        <Tricolour x={g.x + g.W * 0.62} y={g.ground - 56 * g.s} s={g.s * 1.1} h={170} />
        <Napoleon x={g.x + g.W * 0.2} y={g.ground + 16 * g.s} scale={g.sc * 0.85} />
      </g>
    )}
  </Panel>
);

// Moscow is given up: the Russian army marches out past the Kremlin.
const AbandonScene = ({ start, end }: { start: number; end: number }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id="c5abandon" anchor={CITY.moscow} start={start} end={end} sky={["#6a7a9a", "#e8c890"]} accent={RUS}>
      {(g) => (
        <g>
          <MoscowSkyline x={g.x + 20 * g.s} y={g.ground - 30 * g.s} W={g.W * 0.7} s={g.s * 0.9} />
          <rect x={g.x} y={g.ground - 30 * g.s} width={g.W} height={g.H} fill="#8a8060" />
          {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={g.x + g.W * 0.2 + ((frame - start) * 1.4 * g.s + i * 120 * g.s) % (g.W * 0.85)} y={g.ground + 22 * g.s} scale={g.sc * 0.62} phase={i} u={RUSSIAN} />)}
        </g>
      )}
    </Panel>
  );
};

// ---- screen overlays ----

const card = (s: number, color: string) => ({ background: "rgba(8,14,26,0.9)", border: `${3 * s}px solid ${color}`, borderRadius: 18 * s, fontFamily: font, color: "#fff", lineHeight: 1.25 }) as const;

// Smolensk losses: two chips in the panel slot.
const LossChips = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const end = T.choice + 10;
  if (frame < T.three || frame > end) return null;
  const o = interpolate(frame, [end - 10, end], [1, 0], clamp);
  const chip = (f: number, color: string, side: string, n: string) => {
    const k = frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping: 12 } });
    return (
      <div style={{ ...card(s, color), flex: 1, padding: `${18 * s}px ${24 * s}px`, transform: `scale(${k})`, opacity: Math.min(1, k * 1.5), textAlign: "center" }}>
        <div style={{ fontSize: 34 * s, fontWeight: 700, color }}>{side}</div>
        <div style={{ fontFamily: display, fontSize: 110 * s, fontWeight: 700 }}>{n}</div>
      </div>
    );
  };
  const kw = interpolate(frame, [T.kw - 4, T.kw + 8], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 50 * s, right: 50 * s, top: height * PANEL_TOP, opacity: o }}>
      <div style={{ display: "flex", gap: 24 * s }}>
        {chip(T.fr, BLUE, "French", "~10,000")}
        {chip(T.ru, RUS, "Russian", "~12,000")}
      </div>
      <div style={{ ...card(s, RED), marginTop: 20 * s, padding: `${10 * s}px ${24 * s}px`, textAlign: "center", fontSize: 44 * s, fontWeight: 900, opacity: kw, transform: `translateY(${(1 - kw) * 20 * s}px)` }}>killed or wounded · 3 days</div>
    </div>
  );
};

// Borodino: the big casualty counter.
const BigCounter = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const start = T.seventy - 6;
  const end = T.guard + 14;
  if (frame < start || frame > end) return null;
  const k = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const o = interpolate(frame, [end - 10, end], [1, 0], clamp);
  const n = interpolate(frame, [start, start + 40], [0, 70000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const done = frame >= start + 40;
  const lab = interpolate(frame, [T.dead - 4, T.dead + 8], [0, 1], clamp);
  const chip = frame < T.bloodiest ? 0 : spring({ frame: frame - T.bloodiest, fps, config: { damping: 12 } });
  return (
    <div style={{ ...card(s, RED), position: "absolute", left: 50 * s, right: 50 * s, top: height * PANEL_TOP, opacity: o, transform: `scale(${0.9 + 0.1 * k})`, padding: `${16 * s}px ${30 * s}px`, textAlign: "center" }}>
      <div style={{ fontFamily: display, fontSize: 200 * s, fontWeight: 700, color: "#ff6b5f", lineHeight: 1.05 }}>
        {(Math.round(n / 1000) * 1000).toLocaleString("en-US")}
        {done ? "+" : ""}
      </div>
      <div style={{ fontSize: 46 * s, fontWeight: 900, opacity: lab }}>dead or wounded · in one day</div>
      <div style={{ display: "inline-block", marginTop: 14 * s, background: GOLD, color: "#1b1d24", borderRadius: 40 * s, padding: `${6 * s}px ${26 * s}px`, fontSize: 36 * s, fontWeight: 900, transform: `scale(${chip})` }}>Bloodiest single day of the Napoleonic Wars</div>
    </div>
  );
};

// ---- map overlays ----

const Battle = () => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const live = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const pop = (f0: number, f1: number) => (frame < f0 || frame > f1 ? 0 : spring({ frame: frame - f0, fps: 30, config: { damping: 12 } }) * interpolate(frame, [f1 - 10, f1], [1, 0], clamp));
  const off = T.pyr + 20;
  const back = interpolate(frame, [T.rus, T.pulled + 30], [0, 0.06], { ...clamp, easing: ease });
  const smoke = live(T.battle, T.guard + 20);
  const guardHi = live(T.imperial - 4, off);
  const gp = projection(GUARD);
  return (
    <g>
      {FR.map((p, i) => <Block key={`f${i}`} at={p} k={pop(T.fr130 + i * 5, off)} color={BLUE} rot={90} text={i === 0 ? "French" : undefined} dy={66} />)}
      <Block at={GUARD} k={pop(T.fr130 + 22, off)} color="#8a8d93" rot={90} w={56} h={30} text={frame >= T.imperial ? "Imperial Guard" : undefined} dy={60} size={0.85} />
      {gp && guardHi > 0 && <circle cx={gp[0]} cy={gp[1]} r={(52 + ((frame % 30) / 30) * 20) * s} fill="none" stroke="#e8edf2" strokeWidth={4 * s} opacity={guardHi * (1 - (frame % 30) / 30)} />}
      <MapChip at={GUARD} text="Held back" k={pop(T.reserve, off)} color="#5a5d63" dy={-64} size={0.8} />
      {RU.map((p, i) => <Block key={`r${i}`} at={[p[0] + back, p[1]]} k={pop(T.ru120 + i * 5, off)} color={RUS} rot={90} text={i === 3 ? "Russians" : undefined} dy={-60} />)}
      {/* cannon along both lines */}
      {frame >= T.cannon && frame < off &&
        [...FR, ...RU.slice(0, 4)].map((p, i) => {
          const q = projection([p[0] + (i < 4 ? 0.012 : -0.012), p[1]]);
          const k = pop(T.cannon + i * 3, off);
          return q && k > 0 ? <circle key={`c${i}`} cx={q[0]} cy={q[1]} r={9 * s * Math.min(1, k)} fill={GOLD} stroke="#0b1020" strokeWidth={3 * s} /> : null;
        })}
      {/* French attacks on the earthworks */}
      {frame >= T.battle && frame < T.guard + 20 && (
        <g opacity={live(T.battle, T.guard + 20)}>
          <Arrow points={[FR[1], [35.815, 55.505], FLECHES]} start={T.battle + 8} end={T.dawn + 25} color={BLUE} width={16} outline="#0b1020" />
          <Arrow points={[FR[2], [35.822, 55.517], REDOUBT]} start={T.dark - 10} end={T.earth + 10} color={BLUE} width={16} outline="#0b1020" />
          <Arrow points={[FR[0], [35.82, 55.49], [35.842, 55.493]]} start={T.dawn} end={T.dark + 10} color={BLUE} width={14} outline="#0b1020" />
        </g>
      )}
      <Fort at={FLECHES} kind="fleche" k={pop(T.earth, off)} />
      <Fort at={[FLECHES[0] + 0.004, FLECHES[1] - 0.006]} kind="fleche" k={pop(T.earth + 4, off)} />
      <Fort at={REDOUBT} kind="redoubt" k={pop(T.earth + 8, off)} />
      <MapChip at={FLECHES} text="Flèches" k={pop(T.fleches, T.loss + 10)} color="#7a5d3a" dy={56} size={0.85} />
      <MapChip at={REDOUBT} text="Great Redoubt" k={pop(T.redoubt, T.loss + 10)} color="#7a5d3a" dx={40} dy={-52} size={0.85} />
      {smoke > 0 &&
        [FLECHES, REDOUBT, [35.83, 55.495], [35.82, 55.512], [35.845, 55.525]].map((p, i) => {
          const q = projection(p as [number, number]);
          return q ? <Smoke key={`sm${i}`} x={q[0]} y={q[1] + 20 * s} size={46 * s} seed={i + 30} k={smoke * 0.9} wind={0.5} /> : null;
        })}
      {/* the Russians pull back east */}
      {frame >= T.rus && frame < off && <Arrow points={[[35.9, 55.515], [35.97, 55.51], [36.02, 55.5]]} start={T.rus} end={T.pulled + 25} color={RUS} width={20} outline="#0b1020" opacity={live(T.rus, off)} />}
      <MapChip at={[35.93, 55.535]} text="In order" k={pop(T.pulled, off)} color={RUS} size={0.85} />
    </g>
  );
};

const Map5 = () => {
  const frame = useCurrentFrame();
  const show = (f0: number, f1: number) => interpolate(frame, [f0, f0 + 10, f1 - 10, f1], [0, 1, 1, 0], clamp);
  const pop = (f0: number, f1: number) => (frame < f0 || frame > f1 ? 0 : spring({ frame: frame - f0, fps: 30, config: { damping: 12 } }) * interpolate(frame, [f1 - 10, f1], [1, 0], clamp));
  const lose = interpolate(frame, [T.pushed - 4, T.pushed + 10], [1, 0.25], clamp);
  return (
    <g>
      <FigureDefs />
      {/* Smolensk */}
      <MapGlow at={CITY.smolensk} k={show(T.city - 6, T.choice + 20)} r={110} />
      <Pin at={CITY.smolensk} text="Smolensk" k={show(T.smolPin - 4, T.kut + 10)} />
      <Block at={[32.45, 55.0]} k={pop(T.caught, T.slipped + 10)} color={RUS} text="Russians" dy={-40} rot={-20} />
      {frame >= T.slipped && frame < T.choice + 20 && <Arrow points={[[32.45, 55.0], [33.3, 55.1], [34.2, 55.2]]} start={T.slipped} end={T.slipped + 35} color={RUS} width={18} variant="dashed" outline="#0b1020" opacity={show(T.slipped, T.choice + 20)} />}
      {/* the choice: stop for the winter or push on */}
      {frame >= T.stop && frame < T.kut + 20 && (
        <g opacity={show(T.stop, T.kut + 20)}>
          <g opacity={lose}>
            <Arrow points={[[32, 54.85], [31.7, 55.15], [31.4, 55.35]]} start={T.stop} end={T.stop + 20} color="#e8edf2" width={22} outline="#0b1020" />
          </g>
          <Arrow points={[[32.2, 54.9], [34.3, 55.25], [35.8, 55.55], [37.4, 55.78]]} start={T.push - 4} end={T.push + 30} color={GOLD} width={frame >= T.pushed ? 30 : 22} outline="#0b1020" />
        </g>
      )}
      <MapChip at={[31.4, 55.35]} text="Stop for winter" k={pop(T.stop + 6, T.kut + 20) * (frame >= T.pushed ? 0.6 : 1)} color="#5a6a80" dy={-40} size={0.9} />
      {frame >= T.pushed + 4 && frame < T.kut + 20 && <MapChip at={[31.4, 55.35]} text="✕" k={pop(T.pushed + 4, T.kut + 20)} color={RED} dx={0} dy={-40} size={1.3} />}
      <MapChip at={[37.4, 55.78]} text="Moscow" k={pop(T.push + 20, T.kut + 20)} color={GOLD} textColor="#1b1d24" dy={-46} />
      {/* the endless retreat, then Kutuzov turns at Borodino */}
      {frame >= T.endless && frame < T.sides + 10 && <Arrow points={[[33.6, 55.05], [34.6, 55.3], [35.85, 55.52]]} start={T.endless} end={T.tsar + 10} color={RUS} width={20} variant="dashed" outline="#0b1020" opacity={show(T.endless, T.sides + 10)} />}
      <Block at={[35.95, 55.53]} k={pop(T.turned, T.sides + 10)} color={RUS} rot={90} />
      <Pin at={CITY.borodino} text="Borodino" k={show(T.boro - 4, T.sides + 10)} color={RUS} dy={64} />
      {frame >= T.km - 10 && frame < T.sides + 10 && <Arrow points={[[35.9, 55.52], [36.7, 55.66], [37.55, 55.78]]} start={T.km - 10} end={T.km + 20} color="#e8edf2" width={10} variant="dashed" outline="#0b1020" opacity={show(T.km - 10, T.sides + 10)} />}
      <MapChip at={[36.7, 55.66]} text="~120 km" k={pop(T.km, T.sides + 10)} color="#2a3446" dy={-44} />
      <Pin at={CITY.moscow} text="Moscow" k={show(T.mosc - 6, T.sides + 10)} color={GOLD} />
      {/* Borodino, 7 September */}
      {frame >= T.sides - 10 && frame < T.pyr + 30 && <Battle />}
      <Pin at={CITY.borodino} text="Borodino" k={show(T.sides + 20, T.pyr + 30) * (frame < T.pyr ? 0.85 : 1)} color={RUS} size={0.8} />
      {/* the French hold the field */}
      <MapChip at={CITY.borodino} text="French hold the field" k={pop(T.held, T.quiz + 10)} color={BLUE} dy={60} size={0.85} />
      <Pin at={CITY.moscow} text="Moscow" k={show(T.pyr + 20, to + 5)} color={GOLD} dy={64} />
      <MapChip at={CITY.moscow} text="?" k={pop(T.quiz + 10, T.ans + 4)} color={GOLD} textColor="#1b1d24" dx={110} dy={-30} size={1.5} />
      <MapChip at={CITY.moscow} text="Abandoned" k={pop(T.ans + 20, to)} color={RUS} dy={124} size={0.9} />
      {/* Kutuzov gives Moscow up and swings around it to the south */}
      {frame >= T.save - 10 && frame < to + 20 && (
        <Arrow points={[[35.95, 55.52], [36.8, 55.7], [37.55, 55.8], [38.05, 55.62], [37.75, 55.35], [37.0, 55.27], [36.7, 55.3]]} start={T.save - 10} end={T.abandoned + 30} color={RUS} width={22} outline="#0b1020" opacity={show(T.save - 10, to + 20)} />
      )}
    </g>
  );
};

export const ch5: Chapter = {
  name: "Smolensk to Borodino",
  from,
  to,
  cams: (w, h) => [
    { frame: from, cam: view(bbox([[23.7, 54.1], [32.2, 55.9]]), w, h, 0.92, 0.1) },
    { frame: from + 36, cam: view(V5.smol, w, h, 0.75, 0.1) },
    { frame: T.choice - 4, cam: view(V5.smol, w, h, 0.75, 0.1) },
    { frame: T.choice + 34, cam: view(V5.route, w, h, 0.72, 0.1) },
    { frame: T.village - 24, cam: view(V5.route, w, h, 0.72, 0.1) },
    { frame: T.village + 14, cam: view(V5.mosc, w, h, 1, 0.1) },
    { frame: T.sides, cam: view(V5.mosc, w, h, 1, 0.1) },
    { frame: T.sides + 40, cam: view(V5.field, w, h, 1.15, 0.06) },
    { frame: T.pyr - 6, cam: view(V5.field, w, h, 1.15, 0.06) },
    { frame: T.pyr + 34, cam: view(V5.mosc, w, h, 1, 0.1) },
  ],
  years: [[from, "Aug 1812"], [T.sides, "7 Sep 1812"], [T.quiz, "Sep 1812"]],
  heads: [
    { f: from, tag: "16–18 August 1812", head: "Smolensk", color: RED },
    { f: T.city, tag: "Smolensk", head: "The city burns", color: RED, chips: [{ text: "Russians slip away", f: T.slipped }] },
    { f: T.losses, tag: "Smolensk · 3 days", head: "Killed or wounded", color: RED },
    { f: T.choice, tag: "Napoleon's choice", head: "Stop or push on?", color: GOLD, chips: [{ text: "He pushes on", f: T.pushed }] },
    { f: T.kut, tag: "In Russia", head: "Fury at the endless retreat", color: RUS },
    { f: T.tsar, tag: "New Russian commander", head: "Mikhail Kutuzov", color: RUS, chips: [{ text: "Old", f: T.old }, { text: "One-eyed", f: T.eyed }] },
    { f: T.turned, tag: "Kutuzov turns to fight", head: "Borodino", color: RUS, chips: [{ text: "~120 km from Moscow", f: T.km }] },
    { f: T.sides, tag: "7 September 1812 · positions approx.", head: "Battle of Borodino", color: RED },
    { f: T.fr130, tag: "French & allies", head: "Grande Armée", stat: "~130,000", label: "men", color: BLUE },
    { f: T.ru120, tag: "Russians", head: "Kutuzov's army", stat: "120,000+", label: "men", color: RUS },
    { f: T.cannon, tag: "Between them", head: "Cannon", stat: "1,200+", label: "guns", color: GOLD },
    { f: T.battle, tag: "Dawn to dusk · positions approx.", head: "Storming the earthworks", color: RED, chips: [{ text: "Flèches", f: T.fleches }, { text: "Great Redoubt", f: T.redoubt }] },
    { f: T.loss, tag: "By nightfall", head: "One day at Borodino", color: RED },
    { f: T.guard, tag: "Napoleon's last reserve", head: "The Guard stays back", color: "#8a8d93" },
    { f: T.rus, tag: "Borodino", head: "The Russians escape", color: RUS, chips: [{ text: "In order", f: T.pulled }] },
    { f: T.pyr, tag: "The French hold the field", head: "A victory?", color: GOLD, chips: [{ text: "Not the knockout", f: T.knock }] },
    { f: T.quiz, tag: "Quiz time", head: "What did Kutuzov do?", color: GOLD },
    { f: T.ans, tag: "Without a fight", head: "Moscow abandoned", color: RUS },
  ],
  Map: () => <Map5 />,
  Panels: () => (
    <g>
      <SmolenskScene start={from + 4} end={T.three + 14} />
      <ChoiceScene start={T.choice} end={T.kut + 14} />
      <RetreatScene start={T.kut} end={T.tsar + 14} />
      <KutuzovScene start={T.tsar} end={T.turned + 14} />
      <StandScene start={T.turned} end={T.fr130 + 14} />
      <FrenchScene start={T.fr130} end={T.ru120 + 14} />
      <RussianScene start={T.ru120} end={T.cannon + 14} />
      <GunsScene start={T.cannon} end={T.dawn + 14} />
      <RedoubtScene start={T.dawn} end={T.seventy + 14} />
      <GuardScene start={T.refused} end={T.rus + 14} />
      <WithdrawScene start={T.rus} end={T.held + 14} />
      <FieldScene start={T.held} end={T.quiz + 20} />
      <KutuzovScene id="c5kutquiz" start={T.quiz + 6} end={T.save + 16} />
      <AbandonScene start={T.save + 2} end={to + 14} />
    </g>
  ),
  Screen: () => (
    <>
      <LossChips />
      <BigCounter />
      <QuizNews title="Quiz time" question="After Borodino, what did Kutuzov do?" options={["Attack again", "Defend Moscow", "Give Moscow up"]} answer={2} start={T.quiz + 6} reveal={T.ans} end={T.save + 8} />
    </>
  ),
  sfx: [
    [from, SFX.whoosh, 0.35],
    [T.smolPin, SFX.pop, 0.4],
    [T.city, SFX.hit, 0.35],
    [T.fr, SFX.pop, 0.4],
    [T.ru, SFX.pop, 0.4],
    [T.choice - 6, SFX.whoosh, 0.4],
    [T.stop, SFX.pop, 0.35],
    [T.push, SFX.pop, 0.35],
    [T.pushed, SFX.hit, 0.4],
    [T.tsar, SFX.swell, 0.3],
    [T.village - 30, SFX.whoosh, 0.4],
    [T.boro, SFX.pop, 0.4],
    [T.km, SFX.pop, 0.35],
    [T.sides, SFX.whoosh, 0.4],
    [T.fr130, SFX.hit, 0.35],
    [T.ru120, SFX.hit, 0.35],
    [T.cannon, SFX.hit, 0.35],
    [T.fleches, SFX.pop, 0.35],
    [T.redoubt, SFX.pop, 0.35],
    [T.seventy - 6, SFX.tick, 0.3],
    [T.seventy + 34, SFX.hit, 0.5],
    [T.imperial, SFX.pop, 0.4],
    [T.pulled, SFX.pop, 0.35],
    [T.pyr - 6, SFX.whoosh, 0.4],
    [T.knock, SFX.pop, 0.35],
    [T.quiz, SFX.riser, 0.3],
    [T.ans, SFX.hit, 0.45],
  ],
};
