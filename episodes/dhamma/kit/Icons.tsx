import type { ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import { font, PANEL_TOP } from "../../thaihistory/news/kit";
import { CINNABAR, LEAF, MURAL_H } from "./Mural";

// Icon storytelling in the manner of Thai lai rot nam (gold leaf on black lacquer): flat gold pictograms drawn
// in code, popped in on the spoken word. Free to make, same look every episode. AI art is kept for portraits only.
export const GOLD_DARK = "#7a5418";
const LACQUER: [string, string] = ["#1a0f08", "#0c0704"];

// Pop-in scale for an icon that appears at frame f (0 before, springs to 1).
export const usePop = (f: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame < f ? 0 : spring({ frame: frame - f, fps, config: { damping: 11, mass: 0.6 } });
};

// Lacquer panel with a thin gold inner frame and a scatter of small gold flowers (the lai rot nam ground).
export const IconPanel = ({ id, anchor, start, end, children }: { id: string; anchor: [number, number]; start: number; end: number; children: (g: InsetGeom) => ReactNode }) => (
  <InsetPanel id={id} anchor={anchor} label="ภาพอธิบาย" start={start} end={end} sky={LACQUER} font={font} accent={CINNABAR} top={PANEL_TOP} panelHeight={MURAL_H}>
    {(g) => (
      <g>
        <rect x={g.x + 10 * g.s} y={g.y + 10 * g.s} width={g.W - 20 * g.s} height={g.H - 20 * g.s} rx={12 * g.s} fill="none" stroke={LEAF} strokeOpacity={0.45} strokeWidth={2 * g.s} />
        {Array.from({ length: 28 }, (_, i) => {
          const px = g.x + ((i * 137) % 100) / 100 * g.W;
          const py = g.y + ((i * 61) % 100) / 100 * g.H;
          return <Flower key={i} x={px} y={py} r={5 * g.s} o={0.18} />;
        })}
        {children(g)}
      </g>
    )}
  </InsetPanel>
);

const Flower = ({ x, y, r, o }: { x: number; y: number; r: number; o: number }) => (
  <g opacity={o} fill={LEAF}>
    {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={x + Math.cos((i * Math.PI) / 2) * r} cy={y + Math.sin((i * Math.PI) / 2) * r} rx={r * 0.7} ry={r * 0.4} transform={`rotate(${i * 90} ${x + Math.cos((i * Math.PI) / 2) * r} ${y + Math.sin((i * Math.PI) / 2) * r})`} />)}
    <circle cx={x} cy={y} r={r * 0.45} />
  </g>
);

// Every icon: drawn in a 100-unit box, bottom-centre at (x, y), `size` px tall, popped by k.
export type P = { x: number; y: number; size: number; k?: number; flip?: boolean };
export const Box = ({ x, y, size, k = 1, flip, children }: P & { children: ReactNode }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${(size / 100) * k * (flip ? -1 : 1)} ${(size / 100) * k}) translate(-50 -100)`} fill={LEAF} stroke={GOLD_DARK} strokeWidth={1.5} strokeLinejoin="round">
      {children}
    </g>
  );

export const Mountains = (p: P) => (
  <Box {...p}>
    <path d="M0 100 L28 38 L40 58 L58 20 L78 60 L88 46 L100 100 Z" />
    <path d="M52 33 L58 20 L64 34 L60 31 L57 36 Z M24 47 L28 38 L32 46 Z" fill="#fff8e0" stroke="none" />
  </Box>
);

// Thai pavilion: platform, four pillars, two-tier roof with chofa horns, spire.
export const Palace = (p: P) => (
  <Box {...p}>
    <rect x="10" y="88" width="80" height="12" />
    {[18, 36, 60, 78].map((c) => <rect key={c} x={c} y="56" width="5" height="32" />)}
    <path d="M6 58 Q18 52 26 40 L74 40 Q82 52 94 58 L98 50 L90 54 Q80 46 74 34 L26 34 Q20 46 10 54 L2 50 Z" />
    <path d="M18 40 Q28 34 34 22 L66 22 Q72 34 82 40 Z" />
    <path d="M40 22 L50 2 L60 22 Z" />
    <rect x="44" y="64" width="12" height="24" fill="#2a1a0c" />
  </Box>
);

// Chada crown: tiered cone with a slender spire.
export const Crown = (p: P) => (
  <Box {...p}>
    <path d="M24 100 L76 100 L70 84 L30 84 Z" />
    <path d="M30 84 L70 84 L64 66 L36 66 Z" />
    <path d="M36 66 L64 66 L58 48 L42 48 Z" />
    <path d="M42 48 L58 48 L52 10 L50 0 L48 10 Z" />
    {[92, 75, 57].map((cy) => <circle key={cy} cx="50" cy={cy} r="3" fill="#c8442f" stroke="none" />)}
  </Box>
);

// Standing figure: head, pointed crown (optional), robe.
export const Figure = ({ crown = false, wide = 1, ...p }: P & { crown?: boolean; wide?: number }) => (
  <Box {...p}>
    <circle cx="50" cy="22" r="11" />
    {crown && <path d="M41 16 L59 16 L52 0 L50 -6 L48 0 Z" />}
    <path d={`M${50 - 14 * wide} 36 L${50 + 14 * wide} 36 L${50 + 22 * wide} 100 L${50 - 22 * wide} 100 Z`} />
    <path d="M36 44 Q50 60 64 44" fill="none" stroke={GOLD_DARK} strokeWidth="3" />
  </Box>
);

export const Baby = (p: P) => (
  <Box {...p}>
    <ellipse cx="50" cy="72" rx="22" ry="28" />
    <circle cx="50" cy="38" r="14" />
    <path d="M34 66 Q50 80 66 66" fill="none" stroke={GOLD_DARK} strokeWidth="3" />
  </Box>
);

// Prancing horse with a crowned rider, galloping right (legs swing with `phase`).
export const HorseRider = ({ phase = 0, rider = true, ...p }: P & { phase?: number; rider?: boolean }) => {
  const a = Math.sin(phase) * 14;
  return (
    <Box {...p}>
      <path d="M20 56 Q18 42 36 40 L64 40 Q70 30 74 20 Q76 12 84 12 L88 8 L90 14 Q98 22 100 32 Q100 36 95 36 L86 31 Q82 44 78 56 Q60 66 36 64 Q24 64 20 56 Z" />
      <path d="M22 46 Q4 44 2 72 Q8 60 22 56 Z" />
      {[[30, a], [38, -a], [68, -a], [74, a]].map(([lx, sw], i) => <path key={i} d={`M${lx} 58 L${lx + 5} 58 L${lx + 4 + sw} 84 L${lx + 3 + sw * 0.4} 98 L${lx - 1 + sw * 0.4} 98 L${lx + sw} 84 Z`} />)}
      <path d="M40 40 Q52 46 64 40 L62 48 Q52 52 42 48 Z" fill="#c8442f" stroke="none" />
      {rider && (
        <>
          <path d="M48 42 L48 26 Q50 18 56 18 Q62 18 62 26 L62 42 Z" />
          <circle cx="55" cy="12" r="6" />
          <path d="M50 8 L60 8 L56 -4 L55 -10 L54 -4 Z" />
        </>
      )}
    </Box>
  );
};

export const Gate = (p: P) => (
  <Box {...p}>
    <rect x="8" y="30" width="18" height="70" />
    <rect x="74" y="30" width="18" height="70" />
    <path d="M4 32 L96 32 L86 18 L14 18 Z" />
    <path d="M30 18 L50 -10 L70 18 Z" />
    <path d="M26 100 L26 50 Q50 30 74 50 L74 100" fill="#0c0704" />
  </Box>
);

export const Moon = ({ x, y, r, k = 1 }: { x: number; y: number; r: number; k?: number }) =>
  k <= 0 ? null : (
    <g opacity={k}>
      <circle cx={x} cy={y} r={r} fill="#fff3c4" />
      <circle cx={x + r * 0.45} cy={y - r * 0.2} r={r * 0.9} fill="#130b06" />
    </g>
  );

export const Stars = ({ g, n = 14, seed = 1 }: { g: InsetGeom; n?: number; seed?: number }) => (
  <g fill="#fff3c4">
    {Array.from({ length: n }, (_, i) => {
      const px = g.x + (((i + seed) * 73) % 100) / 100 * g.W;
      const py = g.y + 20 * g.s + (((i + seed) * 37) % 45) / 100 * g.H;
      return <circle key={i} cx={px} cy={py} r={(1.5 + (i % 3)) * g.s} opacity={0.5 + 0.5 * Math.abs(Math.sin(g.frame * 0.08 + i))} />;
    })}
  </g>
);

// Gold caption under an icon.
export const IconLabel = ({ x, y, text, s, k = 1 }: { x: number; y: number; text: string; s: number; k?: number }) =>
  k <= 0 ? null : (
    <text x={x} y={y} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={28 * s} fill="#fff3c4" opacity={Math.min(1, k)}>
      {text}
    </text>
  );
