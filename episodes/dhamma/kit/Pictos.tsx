import type { ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { font } from "../../thaihistory/news/kit";
import { Baby, Box, Crown, Figure, GOLD_DARK, Gate, HorseRider, IconLabel, IconPanel, Mountains, Palace, Stars, type P } from "./Icons";
import { LEAF } from "./Mural";

// The rest of the pictogram set (same 100-unit box as Icons.tsx) and the declarative icon shots used by the episodes.
const DARK = "#0c0704";
const RED = "#c8442f";
const CREAM = "#fff8e0";
const WATER = "#7fd4ff";

export const Person = ({ head = "none", ...p }: P & { head?: "none" | "crown" | "topknot" | "shaved" | "veil" }) => (
  <Box {...p}>
    <circle cx="50" cy="22" r="11" />
    {head === "crown" && <path d="M41 16 L59 16 L52 0 L50 -6 L48 0 Z" />}
    {head === "topknot" && <ellipse cx="50" cy="8" rx="6" ry="7" />}
    {head === "veil" && <path d="M38 22 Q38 6 50 6 Q62 6 62 22 L66 40 L34 40 Z" />}
    <path d="M36 36 L64 36 L72 100 L28 100 Z" />
    {head === "shaved" && <path d="M36 36 L64 36 L72 100 L58 100 L40 40 Z" fill={RED} stroke="none" opacity={0.7} />}
  </Box>
);

export const OldMan = (p: P) => (
  <Box {...p}>
    <circle cx="58" cy="30" r="10" />
    <path d="M44 40 Q60 34 64 46 L60 100 L36 100 L40 60 Z" />
    <path d="M70 46 L76 100" fill="none" stroke={LEAF} strokeWidth="4" />
    <path d="M60 50 L72 52" fill="none" stroke={LEAF} strokeWidth="5" />
    <path d="M50 26 Q58 16 68 24" fill="none" stroke={CREAM} strokeWidth="4" />
  </Box>
);

export const Lying = ({ wrapped = false, ...p }: P & { wrapped?: boolean }) => (
  <Box {...p}>
    <rect x="4" y="88" width="92" height="12" rx="3" />
    {wrapped ? (
      <path d="M12 88 Q12 72 30 72 L84 74 Q92 76 90 88 Z" fill={CREAM} />
    ) : (
      <>
        <circle cx="16" cy="76" r="9" />
        <path d="M24 74 L88 76 Q92 80 88 88 L24 88 Z" />
      </>
    )}
  </Box>
);

export const Bier = (p: P) => (
  <Box {...p}>
    <path d="M0 52 L100 52" stroke={LEAF} strokeWidth="5" />
    <path d="M14 50 Q14 36 30 36 L80 38 Q88 40 86 50 Z" fill={CREAM} />
    {[12, 88].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy="58" r="7" />
        <path d={`M${cx - 8} 66 L${cx + 8} 66 L${cx + 10} 100 L${cx - 10} 100 Z`} />
      </g>
    ))}
  </Box>
);

export const Chariot = (p: P) => (
  <Box {...p}>
    <path d="M30 40 L70 40 L74 72 L26 72 Z" />
    <path d="M40 40 L46 14 L54 14 L60 40" />
    <circle cx="50" cy="80" r="18" fill={DARK} stroke={LEAF} strokeWidth="5" />
    {[0, 45, 90, 135].map((a) => {
      const c = Math.cos((a * Math.PI) / 180) * 18;
      const s = Math.sin((a * Math.PI) / 180) * 18;
      return <line key={a} x1={50 - c} y1={80 - s} x2={50 + c} y2={80 + s} stroke={LEAF} strokeWidth="3" />;
    })}
    <path d="M74 60 L100 52" stroke={LEAF} strokeWidth="4" />
  </Box>
);

export const Tree = ({ kind = "round", ...p }: P & { kind?: "round" | "bodhi" | "sal" }) => (
  <Box {...p}>
    <path d="M44 100 L46 56 Q36 50 30 56 Q40 44 47 48 L48 40 L52 40 L53 48 Q60 44 70 56 Q64 50 54 56 L56 100 Z" />
    {kind === "bodhi" ? (
      <path d="M50 2 Q90 4 96 34 Q98 56 76 58 Q64 64 50 56 Q36 64 24 58 Q2 56 4 34 Q10 4 50 2 Z" />
    ) : (
      <>
        <circle cx="50" cy="26" r="24" />
        <circle cx="26" cy="40" r="18" />
        <circle cx="74" cy="40" r="18" />
      </>
    )}
    {kind === "bodhi" &&
      [[30, 24], [50, 18], [70, 26], [40, 40], [62, 42]].map(([cx, cy], i) => <path key={i} d={`M${cx} ${cy - 7} Q${cx + 6} ${cy} ${cx} ${cy + 7} Q${cx - 6} ${cy} ${cx} ${cy - 7} Z`} fill={GOLD_DARK} stroke="none" opacity={0.6} />)}
    {kind === "sal" && [[30, 30], [52, 14], [70, 34], [42, 44], [62, 22]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="4" fill="#ffd6dc" stroke="none" />)}
  </Box>
);

export const Lotus = (p: P) => (
  <Box {...p}>
    <path d="M50 30 Q64 56 50 92 Q36 56 50 30 Z" />
    <path d="M50 92 Q20 80 18 52 Q40 60 50 92 Z" />
    <path d="M50 92 Q80 80 82 52 Q60 60 50 92 Z" />
    <path d="M50 92 Q8 90 2 74 Q30 72 50 92 Z" />
    <path d="M50 92 Q92 90 98 74 Q70 72 50 92 Z" />
    <rect x="20" y="92" width="60" height="8" rx="4" />
  </Box>
);

export const Footprint = (p: P) => (
  <Box {...p}>
    <path d="M50 30 Q70 30 70 60 Q70 96 50 98 Q30 96 30 60 Q30 30 50 30 Z" />
    {[[36, 20, 6], [46, 14, 6], [56, 14, 6], [65, 20, 5], [72, 30, 4]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
    <circle cx="50" cy="64" r="10" fill="none" stroke={GOLD_DARK} strokeWidth="2.5" />
  </Box>
);

// Ashoka's pillar: polished shaft, bell capital, lion on top.
export const Pillar = (p: P) => (
  <Box {...p}>
    <rect x="44" y="24" width="12" height="76" />
    <path d="M38 24 Q50 14 62 24 Z" />
    <path d="M40 14 Q42 2 52 4 Q60 6 60 14 Z" />
    <rect x="30" y="96" width="40" height="4" />
  </Box>
);

export const Bowl = (p: P) => (
  <Box {...p}>
    <path d="M10 50 Q10 96 50 96 Q90 96 90 50 Z" />
    <path d="M30 50 Q50 26 70 50" fill="none" stroke={LEAF} strokeWidth="5" />
    <rect x="34" y="94" width="32" height="6" rx="3" />
  </Box>
);

// Golden tray on the river, arrow upstream.
export const Tray = (p: P) => (
  <Box {...p}>
    <ellipse cx="50" cy="70" rx="40" ry="12" />
    <ellipse cx="50" cy="66" rx="32" ry="8" fill={GOLD_DARK} stroke="none" />
    <path d="M0 90 Q12 82 25 90 T50 90 T75 90 T100 90" fill="none" stroke={WATER} strokeWidth="4" />
    <path d="M30 40 L50 24 L70 40 M50 24 L50 54" fill="none" stroke="#fff3c4" strokeWidth="4" />
  </Box>
);

export const Grass = (p: P) => (
  <Box {...p}>
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${30 + i * 5} 100 Q${26 + i * 6} 50 ${14 + i * 9} ${10 + (i % 3) * 8}`} fill="none" stroke={LEAF} strokeWidth="3.5" />)}
    <rect x="32" y="70" width="40" height="8" fill={RED} stroke="none" />
  </Box>
);

export const Sword = (p: P) => (
  <Box {...p}>
    <path d="M47 4 L53 4 L54 70 L46 70 Z" />
    <rect x="34" y="70" width="32" height="6" rx="3" />
    <rect x="45" y="76" width="10" height="18" />
    <circle cx="50" cy="96" r="5" />
  </Box>
);

export const Waves = (p: P) => (
  <Box {...p}>
    {[0, 1, 2].map((r) => (
      <path key={r} d={`M0 ${50 + r * 18} Q12 ${36 + r * 18} 25 ${50 + r * 18} T50 ${50 + r * 18} T75 ${50 + r * 18} T100 ${50 + r * 18}`} fill="none" stroke={r === 1 ? "#fff3c4" : WATER} strokeWidth="6" strokeLinecap="round" />
    ))}
  </Box>
);

export const Elephant = (p: P) => (
  <Box {...p}>
    <path d="M14 40 Q14 20 40 20 L70 22 Q88 24 90 42 Q92 54 86 62 Q84 76 90 90 L82 92 Q76 78 76 66 L72 66 L72 100 L60 100 L60 70 L34 70 L34 100 L22 100 L22 66 Q12 60 14 40 Z" />
    <path d="M70 36 Q60 30 56 44 Q60 56 70 52" fill={GOLD_DARK} stroke="none" />
    <circle cx="80" cy="36" r="3" fill={DARK} stroke="none" />
    <path d="M86 58 L98 62" stroke={CREAM} strokeWidth="4" />
    <path d="M30 20 L40 6 L56 6 L60 20 Z" fill={RED} />
  </Box>
);

// Mara: a crowned yaksha with fangs, arms raised.
export const Demon = (p: P) => (
  <Box {...p}>
    <circle cx="50" cy="26" r="13" fill="#3f8f4a" />
    <path d="M38 18 L62 18 L54 -2 L50 -10 L46 -2 Z" />
    <path d="M44 34 L46 40 L48 34 M52 34 L54 40 L56 34" fill="#fff" stroke="none" />
    <path d="M32 40 L68 40 L76 100 L24 100 Z" />
    <path d="M32 44 L10 20 M68 44 L90 20" stroke={LEAF} strokeWidth="7" strokeLinecap="round" />
  </Box>
);

// The Buddha in meditation (signage pictogram): halo, flame ushnisha, robe over the left shoulder.
// `touch` = earth-touching gesture (Maravijaya): right hand down to the ground.
export const Buddha = ({ touch = false, glow = 0, ...p }: P & { touch?: boolean; glow?: number }) => (
  <Box {...p}>
    {glow > 0 && <circle cx="50" cy="40" r={46 + 6 * glow} fill="#fff3c4" opacity={0.25 * glow} stroke="none" />}
    <circle cx="50" cy="24" r="20" fill="none" stroke={LEAF} strokeWidth="2.5" />
    <circle cx="50" cy="26" r="11" />
    <path d="M46 14 Q50 2 54 14 Z" />
    <path d="M34 40 Q50 34 66 40 L72 76 L28 76 Z" />
    <path d="M10 98 Q10 74 50 74 Q90 74 90 98 Z" />
    <path d="M40 40 L64 74" stroke={GOLD_DARK} strokeWidth="3" />
    {touch ? <path d="M66 46 L76 74 L74 100" fill="none" stroke={LEAF} strokeWidth="7" strokeLinecap="round" /> : <ellipse cx="50" cy="80" rx="14" ry="5" fill={GOLD_DARK} stroke="none" />}
  </Box>
);

// Seated meditator without a halo (the boy under the rose-apple tree, the ascetic). `thin` = the austerities.
export const Sitter = ({ thin = false, head = "topknot", ...p }: P & { thin?: boolean; head?: "topknot" | "shaved" }) => (
  <Box {...p}>
    <circle cx="50" cy="28" r="10" />
    {head === "topknot" && <ellipse cx="50" cy="15" rx="5" ry="6" />}
    <path d={thin ? "M44 40 L56 40 L62 76 L38 76 Z" : "M36 40 Q50 34 64 40 L70 76 L30 76 Z"} />
    {thin && [50, 56, 62, 68].map((y) => <path key={y} d={`M43 ${y} L57 ${y}`} stroke={GOLD_DARK} strokeWidth="2" />)}
    <path d="M14 98 Q14 74 50 74 Q86 74 86 98 Z" />
  </Box>
);

// Three-string lute (phin): one string snapped (too tight), one slack, one just right.
export const Lute = (p: P) => (
  <Box {...p}>
    <ellipse cx="50" cy="78" rx="26" ry="20" />
    <rect x="46" y="4" width="8" height="60" />
    <path d="M44 4 Q50 -6 56 4 Z" />
    <circle cx="50" cy="78" r="7" fill={DARK} stroke="none" />
    <path d="M47 8 L40 40" fill="none" stroke="#ff8a7a" strokeWidth="1.8" />
    <path d="M50 8 L50 92" fill="none" stroke="#fff3c4" strokeWidth="2.2" />
    <path d="M53 8 Q62 50 53 92" fill="none" stroke="#fff3c4" strokeWidth="1.5" opacity={0.6} />
  </Box>
);

export const Steps = ({ n = 8, lit = 0, ...p }: P & { n?: number; lit?: number }) => (
  <Box {...p}>
    {Array.from({ length: n }, (_, i) => <rect key={i} x={i * (100 / n)} y={100 - (i + 1) * (90 / n)} width={100 / n} height={(i + 1) * (90 / n)} fill={i < lit ? LEAF : "#3a2a14"} />)}
  </Box>
);

export const Wheel = (p: P) => (
  <Box {...p}>
    <circle cx="50" cy="50" r="44" fill="none" stroke={LEAF} strokeWidth="7" />
    <circle cx="50" cy="50" r="10" />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return <line key={i} x1={50 + 10 * Math.cos(a)} y1={50 + 10 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke={LEAF} strokeWidth="5" />;
    })}
  </Box>
);

export const Coins = (p: P) => (
  <Box {...p}>
    {[[30, 86], [50, 86], [70, 86], [40, 70], [60, 70], [50, 54]].map(([cx, cy], i) => <ellipse key={i} cx={cx} cy={cy} rx="12" ry="8" />)}
    <path d="M20 40 L36 20 L50 36 L64 20 L80 40 Z" fill={RED} />
  </Box>
);

export const Hut = (p: P) => (
  <Box {...p}>
    <path d="M10 56 L50 20 L90 56 Z" />
    <rect x="20" y="56" width="60" height="44" />
    <rect x="44" y="70" width="12" height="30" fill={DARK} />
  </Box>
);

export const Sun = (p: P) => (
  <Box {...p}>
    <circle cx="50" cy="50" r="22" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={50 + 30 * Math.cos(a)} y1={50 + 30 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke={LEAF} strokeWidth="5" strokeLinecap="round" />;
    })}
  </Box>
);

export const MoonIcon = (p: P) => (
  <Box {...p}>
    <circle cx="50" cy="50" r="40" fill="#fff3c4" stroke="none" />
  </Box>
);

export const Question = (p: P) => (
  <Box {...p}>
    <text x="50" y="92" textAnchor="middle" fontFamily={font} fontWeight={900} fontSize="100" fill={LEAF} stroke="none">
      ?
    </text>
  </Box>
);

// ── Declarative icon shots ──────────────────────────────────────────────────────────────────────────
// One shot = one lacquer panel of pictograms, each popping `d` frames after the shot starts (default i × 5).
// x = fraction of the panel width, y = px above the ground line, size = px tall (at 1080 wide);
// `move` slides the icon to that x over the shot; `o` = extra props (head, kind, touch, thin, wrapped, lit...).
const KINDS = {
  mountains: Mountains, palace: Palace, crown: Crown, figure: Figure, person: Person, oldman: OldMan, lying: Lying, bier: Bier,
  baby: Baby, horse: HorseRider, gate: Gate, chariot: Chariot, tree: Tree, lotus: Lotus, footprint: Footprint, pillar: Pillar,
  bowl: Bowl, tray: Tray, grass: Grass, sword: Sword, waves: Waves, elephant: Elephant, demon: Demon, buddha: Buddha,
  sitter: Sitter, lute: Lute, steps: Steps, wheel: Wheel, coins: Coins, hut: Hut, sun: Sun, moon: MoonIcon, question: Question,
};
export type IconKind = keyof typeof KINDS;
export type IconSpec = { k: IconKind; x: number; size: number; y?: number; d?: number; label?: string; flip?: boolean; move?: number; o?: Record<string, unknown> };
export type IconShot = { f: number; icons: IconSpec[]; night?: boolean; title?: string; sub?: string; at?: [number, number] };

const ShotPanel = ({ id, anchor, start, end, shot }: { id: string; anchor: [number, number]; start: number; end: number; shot: IconShot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (d: number) => (frame < start + d ? 0 : spring({ frame: frame - start - d, fps, config: { damping: 11, mass: 0.6 } }));
  const t = Math.min(1, Math.max(0, (frame - start) / Math.max(1, end - start)));
  return (
    <IconPanel id={id} anchor={shot.at ?? anchor} start={start} end={end}>
      {(g) => (
        <g>
          {shot.night && <Stars g={g} />}
          {shot.title && (
            <text x={g.cx} y={g.y + g.H * 0.52} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={96 * g.s * Math.min(1, pop(0))} fill={LEAF}>
              {shot.title}
            </text>
          )}
          {shot.sub && <IconLabel x={g.cx} y={g.y + g.H * 0.52 + 50 * g.s} text={shot.sub} s={g.s * 1.1} k={pop(6)} />}
          {shot.icons.map((ic, i) => {
            const C = KINDS[ic.k] as unknown as (p: P & Record<string, unknown>) => ReactNode;
            const k = pop(ic.d ?? i * 5);
            const fx = ic.move === undefined ? ic.x : ic.x + (ic.move - ic.x) * t;
            const px = g.x + fx * g.W;
            const py = g.ground - (ic.y ?? 0) * g.s + Math.sin(frame * 0.07 + i) * 2 * g.s;
            return (
              <g key={i}>
                <C x={px} y={py} size={ic.size * g.s} k={k} flip={ic.flip} phase={frame * 0.6} {...(ic.o ?? {})} />
                {ic.label && <IconLabel x={px} y={Math.min(py + 34 * g.s, g.y + g.H - 14 * g.s)} text={ic.label} s={g.s} k={k} />}
              </g>
            );
          })}
        </g>
      )}
    </IconPanel>
  );
};

// A run of icon shots that hand over with the house-standard 14-frame overlap; the last one ends at `end`.
export const IconStrip = ({ id, anchor, shots, end }: { id: string; anchor: [number, number]; shots: IconShot[]; end: number }) => (
  <>
    {shots.map((sh, i) => (
      <ShotPanel key={`${id}${i}`} id={`${id}${i}`} anchor={anchor} start={sh.f} end={(shots[i + 1]?.f ?? end) + 14} shot={sh} />
    ))}
  </>
);
