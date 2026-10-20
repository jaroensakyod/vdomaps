import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BurningCar, CurfewChip, Fire, FigureDefs, LOOKS, Protester, RiotPolice, usePopIn } from "../../components/Figures";
import { useMap } from "../../components/Map";
import { style } from "../../components/style";

type Beat = { start: number; len: number; end: number; spoken: string; words?: { w: string; s: number; e: number }[] };

// Frame when the voice says `needle` (falls back to a share of the beat when there is no word timing).
export const wordFrame = (beat: Beat, needle: string, fallback: number, fps = 30) => {
  const words = beat.words ?? [];
  const joined = words.map((w) => w.w).join("");
  const at = joined.indexOf(needle);
  if (at < 0) return beat.start + Math.round(beat.len * fallback);
  let acc = 0;
  for (const w of words) {
    if (acc + w.w.length > at) return beat.start + Math.round(w.s * fps);
    acc += w.w.length;
  }
  return beat.start + Math.round(beat.len * fallback);
};

const PARIS: [number, number] = [2.3522, 48.8566];
const OTHER_RIOTS: { at: [number, number]; seed: number }[] = [
  { at: [4.8357, 45.764], seed: 21 }, // Lyon
  { at: [5.3698, 43.2965], seed: 34 }, // Marseille
];
// Front row uses 0–3, back row 4–6 (French protest slogans: high cost of living, strike, wages, rents).
const SIGNS = ["VIE CHÈRE", "€€€", "STOP", "GRÈVE", "SALAIRES", "NON!", "LOYERS"];

// Cost-of-living riots: a marching crowd with placards, a burning car, a riot-police line that steps in on
// "ถูกจับ", fires in Lyon and Marseille, and a curfew chip as night falls on "เคอร์ฟิว".
export const FranceScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { projection, width, height, s } = useMap();
  const riot = wordFrame(beat, "จลาจล", 0.25, fps);
  const arrest = wordFrame(beat, "จับ", 0.5, fps);
  const curfew = wordFrame(beat, "เคอร์ฟิว", 0.75, fps);
  const end = beat.end + gap;

  const crowd = usePopIn(beat.start + 30, end);
  const car = usePopIn(riot, end);
  const police = usePopIn(arrest - 6, end);
  const chip = usePopIn(curfew, end);
  const cities = usePopIn(riot + 10, end);
  if (frame < beat.start + 25 || frame > end) return null;

  const p = projection(PARIS);
  if (!p) return null;
  const vertical = height > width;
  // Inset panel: below Paris on phones (empty sea/Spain area), to the right of France on 16:9.
  const W = vertical ? width - 100 * s : 780 * s;
  const H = vertical ? 380 * s : 420 * s;
  const px = vertical ? 50 * s : Math.min(p[0] + 150 * s, width - W - 40 * s);
  const py = vertical ? p[1] + 60 * s : p[1] - 160 * s;
  const sc = (vertical ? 1.55 : 1.5) * s;
  const cx = px + W / 2;
  const ground = py + H - 46 * s;
  const panel = Math.min(crowd, 1);
  const march = interpolate(frame, [beat.start + 30, end], [0, 30], { extrapolateRight: "clamp" }) * s;
  const advance = -interpolate(frame, [arrest, arrest + 40], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * s;
  const night = interpolate(frame, [curfew - 5, curfew + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <g>
      <FigureDefs />
      <defs>
        <clipPath id="fr-panel">
          <rect x={px} y={py} width={W} height={H} rx={18 * s} />
        </clipPath>
        <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night > 0.5 ? "#050b1c" : "#1d3557"} />
          <stop offset="1" stopColor={night > 0.5 ? "#1b1f3a" : "#e07a5f"} />
        </linearGradient>
      </defs>
      {OTHER_RIOTS.map((c) => {
        const xy = projection(c.at);
        return xy ? <Fire key={c.seed} x={xy[0]} y={xy[1]} size={30 * s} seed={c.seed} k={cities} /> : null;
      })}
      <g opacity={panel}>
        {/* leader line from the Paris pin to the panel */}
        <line x1={p[0]} y1={p[1]} x2={vertical ? p[0] : px} y2={vertical ? py : py + 40 * s} stroke="#ff3b30" strokeWidth={3 * s} strokeDasharray={`${8 * s} ${6 * s}`} />
        <g clipPath="url(#fr-panel)">
          <rect x={px} y={py} width={W} height={H} fill="url(#fr-sky)" />
          <rect x={px} y={py} width={W} height={H} fill="#050b1c" opacity={night * 0.6} />
          <Skyline x={px} y={ground - 8 * s} w={W} s={s} night={night} />
          {/* street: pavement, kerb, asphalt with lane marks */}
          <rect x={px} y={ground - 10 * s} width={W} height={10 * s} fill="#8d8a84" />
          <rect x={px} y={ground} width={W} height={H} fill="#3a3d42" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={px + i * 90 * s - ((frame * 0.6 * s) % (90 * s))} y={ground + 24 * s} width={44 * s} height={5 * s} fill="#d9d4c7" opacity={0.6} />
          ))}
          {/* back row of the crowd */}
          {[0, 1, 2].map((i) => (
            <Protester key={`b${i}`} x={cx - 300 * s + i * 95 * s + march} y={ground - 8 * s} scale={sc * 0.85} look={LOOKS[(i + 3) % LOOKS.length]} sign={SIGNS[4 + i]} phase={i * 1.9 + 0.7} lift={-30} />
          ))}
          <BurningCar x={cx + 70 * s} y={ground + 6 * s} scale={sc * 0.9 * car} burn={car} seed={7} />
          {[0, 1, 2, 3].map((i) => (
            <Protester key={`f${i}`} x={cx - 340 * s + i * 92 * s + march} y={ground + 14 * s} scale={sc} look={LOOKS[i % LOOKS.length]} sign={SIGNS[i]} phase={i * 1.3} lift={(i % 2) * 34} />
          ))}
          <g opacity={police}>
            {[0, 1, 2].map((i) => (
              <RiotPolice key={i} x={cx + (vertical ? 240 : 225) * s + i * 62 * s} y={ground + 10 * s + (i % 2) * 6 * s} scale={sc * Math.max(police, 0.001)} phase={i * 1.1} advance={advance} />
            ))}
          </g>
          <CurfewChip x={px + W - 250 * s} y={py + 52 * s} scale={1.2 * s} hours="23:00–06:00" label="เคอร์ฟิวปารีส" font={style.font} k={chip} />
        </g>
        <rect x={px} y={py} width={W} height={H} rx={18 * s} fill="none" stroke="#ff3b30" strokeWidth={3 * s} />
        <rect x={px + 18 * s} y={py + 16 * s} width={210 * s} height={36 * s} rx={8 * s} fill="#ff3b30" />
        <text x={px + 123 * s} y={py + 42 * s} textAnchor="middle" fontSize={22 * s} fontWeight={900} fill="#fff" fontFamily={style.font}>
          ปารีส · ภาพประกอบ
        </text>
      </g>
    </g>
  );
};

// Haussmann-style building row with lit windows, mansard roofs and the Eiffel Tower behind.
const Skyline = ({ x, y, w, s, night }: { x: number; y: number; w: number; s: number; night: number }) => {
  const blocks = [];
  let bx = x - 10 * s;
  let i = 0;
  while (bx < x + w) {
    const bw = (80 + (i * 37) % 50) * s;
    const bh = (110 + (i * 53) % 60) * s;
    blocks.push({ bx, bw, bh, i });
    bx += bw + 4 * s;
    i++;
  }
  const tx = x + w * 0.62;
  return (
    <g>
      <path
        d={`M${tx - 34 * s} ${y} L${tx - 8 * s} ${y - 150 * s} L${tx - 3 * s} ${y - 250 * s} L${tx} ${y - 290 * s} L${tx + 3 * s} ${y - 250 * s} L${tx + 8 * s} ${y - 150 * s} L${tx + 34 * s} ${y} L${tx + 18 * s} ${y} Q${tx} ${y - 60 * s} ${tx - 18 * s} ${y} Z`}
        fill="#2a2f3d"
        opacity={0.8}
      />
      <line x1={tx - 16 * s} y1={y - 150 * s} x2={tx + 16 * s} y2={y - 150 * s} stroke="#2a2f3d" strokeWidth={5 * s} />
      {night > 0.3 && <circle cx={tx} cy={y - 290 * s} r={4 * s} fill="#ffd36b" />}
      {blocks.map(({ bx, bw, bh, i }) => (
        <g key={i}>
          <rect x={bx} y={y - bh} width={bw} height={bh} fill={i % 2 ? "#c9b79c" : "#d8c8ac"} stroke="#5b5145" strokeWidth={1.2 * s} />
          <path d={`M${bx - 3 * s} ${y - bh} L${bx + 8 * s} ${y - bh - 18 * s} L${bx + bw - 8 * s} ${y - bh - 18 * s} L${bx + bw + 3 * s} ${y - bh} Z`} fill="#5c6b7a" stroke="#3a4450" strokeWidth={1 * s} />
          {Array.from({ length: Math.floor(bh / (30 * s)) - 1 }, (_, r) =>
            Array.from({ length: Math.floor(bw / (24 * s)) }, (_, c) => {
              const lit = night > 0.3 ? (r * 7 + c * 3 + i) % 4 !== 0 : false;
              return (
                <rect key={`${r}-${c}`} x={bx + 7 * s + c * 24 * s} y={y - bh + 12 * s + r * 30 * s} width={11 * s} height={17 * s} fill={lit ? "#ffd98a" : "#4b5563"} stroke="#3a3128" strokeWidth={0.8 * s} />
              );
            }),
          )}
          <rect x={bx} y={y - bh + 40 * s} width={bw} height={3 * s} fill="#2e2a25" opacity={0.6} />
        </g>
      ))}
    </g>
  );
};
