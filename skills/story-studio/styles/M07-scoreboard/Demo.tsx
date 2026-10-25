import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { C, clamp, Die, EraCard, fade, font, GameBoard, Pawn, ScoreTrack, stepAt, Table, useBoardLayout, useBoardProjection, type Step } from "./kit/Board";
import { ERAS } from "./kit/eras";
import { CITIES, type CityKey } from "./kit/places";

// M07 board game: who holds which city, as a game. Han China printed as a board of square tiles; at each new era
// card the tiles flip in a wave to their new holder, pawns on captured cities hop and change colour, and each
// side's marker hops along the score track to its count. 190 → 208 → 222. 15 s, 9:16 and 16:9.
export const demo: StyleDemo = { id: "M07", name: "กระดานยึดเมือง", frames: 450, cover: 400, sizes: ["9x16", "16x9"] };

const STEPS: Step[] = [
  { year: 190, at: 0 },
  { year: 208, at: 150 },
  { year: 222, at: 300 },
];
const CITY_LIST: CityKey[] = ["luoyang", "changan", "xuchang", "ye", "xiangyang", "jiangling", "chaisang", "jianye", "chengdu", "hanzhong"];
const BB: [number, number, number, number] = [100, 21.5, 123.5, 41.5];

const Pieces = () => {
  const frame = useCurrentFrame();
  const { fps } = useBoardLayout();
  const { proj } = useBoardProjection(BB);
  const i = stepAt(STEPS, frame);
  const st = STEPS[i];
  const sideOf = (year: number, key?: string) => (key ? ERAS[year].sides.find((sd) => sd.key === key) : undefined);
  return (
    <g>
      {CITY_LIST.map((key, n) => {
        const c = CITIES[key];
        const p = proj(c.at);
        if (!p) return null;
        const t = 30 + n * 4;
        const born = spring({ frame: frame - t, fps, config: { damping: 11 } });
        if (born <= 0.02) return null;
        const side = sideOf(st.year, c.held[st.year]);
        const prev = i > 0 ? sideOf(STEPS[i - 1].year, c.held[STEPS[i - 1].year]) : undefined;
        const flipped = i > 0 && prev?.key !== side?.key;
        const hop = flipped ? interpolate(frame, [st.at + 34 + n * 3, st.at + 50 + n * 3], [0, 1], clamp) : 0;
        return <Pawn key={key} x={p[0]} y={p[1]} color={side?.color ?? "#f7f2e6"} from={prev?.color ?? "#f7f2e6"} hop={hop >= 1 ? 0 : hop} label={c.th} k={Math.min(1.1, born)} />;
      })}
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { vertical, s, title, board } = useBoardLayout();
  const i = stepAt(STEPS, frame);
  const st = STEPS[i];
  const sides = ERAS[st.year].sides.map((sd) => ({ key: sd.key, name: sd.name, color: sd.color, count: CITY_LIST.filter((c) => CITIES[c].held[st.year] === sd.key).length, at: (i ? st.at : 60) + 56 }));
  // tabletop tilt: the board leans back a little and settles; leans again at each new era
  const lean = 7 + 5 * Math.exp(-frame / 40) + STEPS.slice(1).reduce((a, x) => a + 3 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (frame - x.at) / 30)) * Math.PI)), 0);
  const cx = board[0] + board[2] / 2;
  const cy = board[1] + board[3] / 2;
  return (
    <AbsoluteFill style={{ background: C.table }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Hit id="war_drums" at={4} volume={0.28} />
      {STEPS.slice(1).map((x) => <Hit key={x.at} id="wood_hit" at={x.at} volume={0.45} />)}
      {STEPS.slice(1).map((x) => <Sfx key={`w${x.at}`} src={SFX.whoosh} at={x.at + 4} volume={0.25} />)}
      {STEPS.slice(1).map((x) => [0, 1, 2].map((d) => <Hit key={`p${x.at}${d}`} id="wood_hit" at={x.at + 34 + d * 6} volume={0.18} />))}
      {[0, 1, 2].map((d) => <Sfx key={`t${d}`} src={SFX.tick} at={116 + d * 150} volume={0.3} />)}
      <Table />
      <AbsoluteFill style={{ perspective: 2400 * s, perspectiveOrigin: `${cx}px ${cy - 400}px` }}>
        <AbsoluteFill style={{ transform: `rotateX(${lean}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <GameBoard steps={STEPS} eras={ERAS} bb={BB} start={4}>
            <Pieces />
          </GameBoard>
        </AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: vertical ? 0 : title[0], right: vertical ? 0 : undefined, top: title[1], textAlign: vertical ? "center" : "left", fontFamily: font, opacity: fade(frame, 2, 14) }}>
        <div style={{ display: "inline-block", background: "#f4c430", color: C.ink, fontSize: 30 * s, fontWeight: 600, padding: `${2 * s}px ${20 * s}px`, borderRadius: 40 * s, border: `${3 * s}px solid ${C.ink}`, transform: "rotate(-2deg)" }}>M07 · กระดานยึดเมือง</div>
        <div style={{ fontSize: (vertical ? 92 : 60) * s, maxWidth: vertical ? undefined : 420 * s, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginTop: 6 * s, textShadow: `0 ${6 * s}px 0 ${C.ink}, 0 ${10 * s}px ${20 * s}px rgba(0,0,0,0.5)` }}>
          ใครยึด<span style={{ color: "#f4c430" }}>เมือง</span>ไหน?
        </div>
      </div>
      <EraCard steps={STEPS} eras={ERAS} start={10} />
      <Die steps={STEPS} eras={ERAS} />
      <ScoreTrack n={CITY_LIST.length} sides={sides} start={50} title={vertical ? `เมืองในมือ · ${CITY_LIST.length} เมือง` : "นับเมือง"} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: (vertical ? 110 : 14) * s, textAlign: vertical ? "center" : "left", paddingLeft: vertical ? 0 : 50 * s, fontFamily: font, fontSize: 20 * s, color: "#f1dfb0", opacity: 0.75 }}>เขตโดยประมาณ · แผนที่ Natural Earth</div>
    </AbsoluteFill>
  );
};
