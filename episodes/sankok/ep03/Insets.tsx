import { interpolate, spring } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { HanFigure, LOOK, ThroneRoom } from "../kit/Scenes";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// seer → prophecy → laugh: the old judge of men sits on his mat and points; Cao Cao laughs on "หัวเราะ".
const Reading = ({ g, laugh }: { g: InsetGeom; laugh: number }) => (
  <g>
    <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#d9c39a" />
    {[0.2, 0.8].map((fx) => (
      <g key={fx}>
        <rect x={g.x + g.W * fx - 70 * g.s} y={g.y + 70 * g.s} width={140 * g.s} height={150 * g.s} fill="#efe2bd" stroke="#6b4a2b" strokeWidth={6 * g.s} />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={g.x + g.W * fx - 70 * g.s + i * 35 * g.s} y1={g.y + 70 * g.s} x2={g.x + g.W * fx - 70 * g.s + i * 35 * g.s} y2={g.y + 220 * g.s} stroke="#6b4a2b" strokeWidth={3 * g.s} />
        ))}
        {[1, 2].map((i) => (
          <line key={i} x1={g.x + g.W * fx - 70 * g.s} y1={g.y + 70 * g.s + i * 50 * g.s} x2={g.x + g.W * fx + 70 * g.s} y2={g.y + 70 * g.s + i * 50 * g.s} stroke="#6b4a2b" strokeWidth={3 * g.s} />
        ))}
      </g>
    ))}
    <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill="#8c6a3a" />
    <rect x={g.x + g.W * 0.22} y={g.ground + 14 * g.s} width={150 * g.s} height={16 * g.s} rx={4 * g.s} fill="#b99a5a" stroke="#2a1b0e" strokeWidth={1.4 * g.s} />
    <HanFigure x={g.x + g.W * 0.3} y={g.ground + 26 * g.s} scale={g.sc} {...LOOK.seer} pose="sit" hold="point" phase={1} />
    <HanFigure x={g.x + g.W * 0.62} y={g.ground + 30 * g.s} scale={g.sc} {...LOOK.caocao} pose={g.frame >= laugh ? "laugh" : "stand"} flip phase={2} />
    {g.frame >= laugh && (
      <text x={g.x + g.W * 0.72} y={g.y + 130 * g.s} fontFamily={fonts.title} fontSize={44 * g.s} fill={C.wu} opacity={interpolate(g.frame, [laugh, laugh + 6], [0, 1], clamp)} transform={`rotate(-8,${g.x + g.W * 0.72},${g.y + 130 * g.s})`}>
        ฮ่า ฮ่า!
      </text>
    )}
  </g>
);

// emperor → cliff: the empty throne, two princes either side, a "?" on "เลือก"; on cliff the general (He Jin)
// and the chief eunuch step in from the edges.
const EmptyThrone = ({ g, ask, rivals }: { g: InsetGeom; ask: number; rivals: number }) => {
  const q = g.frame < ask ? 0 : spring({ frame: g.frame - ask, fps: 30, config: { damping: 9 } });
  const k = usePopIn(rivals);
  const feet = g.ground + 30 * g.s;
  return (
    <g>
      <ThroneRoom x={g.cx} y={g.ground + 4 * g.s} w={g.W} h={g.H} s={g.s * 1.1} />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#4a2a1a" />
      <HanFigure x={g.x + g.W * 0.3} y={feet} scale={g.sc * 0.82} {...LOOK.prince} phase={1} />
      <HanFigure x={g.x + g.W * 0.7} y={feet} scale={g.sc * 0.62} {...LOOK.emperor} flip phase={2} />
      {q > 0 && (
        <text x={g.cx} y={g.ground - 140 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={90 * g.s * q} fill="#f3e6c4" stroke="#2a1b0e" strokeWidth={4 * g.s} paintOrder="stroke">
          ?
        </text>
      )}
      <g opacity={Math.min(1, k)}>
        <HanFigure x={g.x + g.W * 0.1 + (1 - Math.min(1, k)) * -60 * g.s} y={feet} scale={g.sc * 0.95} {...LOOK.hejin} phase={3} />
        <HanFigure x={g.x + g.W * 0.9 + (1 - Math.min(1, k)) * 60 * g.s} y={feet} scale={g.sc * 0.95} {...LOOK.zhangrang} flip phase={4} />
      </g>
    </g>
  );
};

export const Insets = ({ B, word }: Timeline) => (
  <>
    <InsetPanel id="seer" anchor={place("luoyang")} label="ภาพประกอบ" start={B.seer.start} end={B.laugh.end + 6} sky={["#d9c39a", "#d9c39a"]} font={fonts.body} accent={C.wu} top={0.42}>
      {(g) => <Reading g={g} laugh={word("laugh", "หัวเราะ")} />}
    </InsetPanel>
    <InsetPanel id="throne" anchor={place("luoyang")} label="ภาพประกอบ" start={B.emperor.start + 10} end={B.cliff.end + 6} sky={["#6e2a1f", "#6e2a1f"]} font={fonts.body} accent={C.wu}>
      {(g) => <EmptyThrone g={g} ask={word("emperor", "เลือก")} rivals={B.cliff.start} />}
    </InsetPanel>
  </>
);
