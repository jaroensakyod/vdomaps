import type { ReactNode } from "react";

// N16 teleprinter kit: a message hammered out on a continuous paper roll under cold office light. The paper rises
// out of the machine over the platen and curls over a chrome bail at the top; every character is a dot-impact
// glyph (the font is masked through a dot grid); a print head rides the current line and snaps back with a bell at
// each carriage return; a punched paper tape runs out of the reperforator below, one column of holes per character.

export const C = {
  wall: "#17213a", // office wall at night, outside the lamp
  paper: "#b4d3e0", // roll paper, tinted by the cold fluorescent light
  ink: "#2a2440", // violet-black ribbon ink
  red: "#b3322b", // red half of the ribbon
  steel: "#4d5b55", // hammertone housing
  tape: "#e8d98a", // punched tape
  chrome: "#dfe6ea",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const TeleDefs = () => (
  <defs>
    <pattern id="n16-dots" width="5" height="5" patternUnits="userSpaceOnUse">
      <rect width="5" height="5" fill="#000" />
      <circle cx="2.5" cy="2.5" r="2.15" fill="#fff" />
    </pattern>
    <mask id="n16-dotmask" maskUnits="userSpaceOnUse" x="-100" y="-120" width="1300" height="200">
      <rect x="-100" y="-120" width="1300" height="200" fill="url(#n16-dots)" />
    </mask>
    <linearGradient id="n16-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#25344f" />
      <stop offset="0.5" stopColor="#17213a" />
      <stop offset="1" stopColor="#0a0f1c" />
    </linearGradient>
    <linearGradient id="n16-paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8fb0c0" />
      <stop offset="0.08" stopColor="#bcdbe8" />
      <stop offset="0.8" stopColor={C.paper} />
      <stop offset="1" stopColor="#93b3c2" />
    </linearGradient>
    <linearGradient id="n16-chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f8fbfc" />
      <stop offset="0.45" stopColor="#9aa6ad" />
      <stop offset="0.55" stopColor="#5d6870" />
      <stop offset="1" stopColor="#d6dde1" />
    </linearGradient>
    <linearGradient id="n16-platen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3b3f44" />
      <stop offset="0.35" stopColor="#15171a" />
      <stop offset="1" stopColor="#2a2d31" />
    </linearGradient>
    <linearGradient id="n16-housing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6c7d76" />
      <stop offset="0.25" stopColor={C.steel} />
      <stop offset="1" stopColor="#1c2321" />
    </linearGradient>
    <filter id="n16-hammer" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="9" />
      <feDiffuseLighting lightingColor="#ffffff" surfaceScale="2.2">
        <feDistantLight azimuth="235" elevation="55" />
      </feDiffuseLighting>
    </filter>
    <filter id="n16-paperfibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.45  0 0 0 0 0.45  0 0 0 0.9 -0.35" />
    </filter>
    <filter id="n16-smudge" x="-5%" y="-30%" width="110%" height="160%">
      <feGaussianBlur stdDeviation="1.4" />
    </filter>
    <filter id="n16-shadow" x="-10%" y="-30%" width="120%" height="160%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <radialGradient id="n16-glare" cx="0.5" cy="0" r="0.8">
      <stop offset="0" stopColor="#f4fbff" stopOpacity="0.9" />
      <stop offset="1" stopColor="#f4fbff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

// Dot-impact text: the glyphs are printed through a dot grid that travels with the line (so a line feed does not
// make the dots swim), with a faint ribbon smudge behind.
export const DotText = ({ x, y, text, size, color = C.ink, weight = 700, font, anchor = "start" }: { x: number; y: number; text: string; size: number; color?: string; weight?: number; font: string; anchor?: "start" | "middle" }) => (
  <g transform={`translate(${x},${y})`}>
    <text fontFamily={font} fontWeight={weight} fontSize={size} fill={color} opacity={0.14} filter="url(#n16-smudge)" textAnchor={anchor} letterSpacing={2}>{text}</text>
    <g mask="url(#n16-dotmask)">
      <text fontFamily={font} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} letterSpacing={2}>{text}</text>
    </g>
  </g>
);

// Visible advance of a Thai string: combining vowels and tone marks take no width.
const COMBINING = /[ัิ-ฺ็-๎]/;
export const cells = (s: string) => [...s].filter((ch) => !COMBINING.test(ch)).length;

// Continuous roll with pin-feed sprocket holes and perforated tear lines along both edges.
export const Roll = ({ x, y, w, h, offset, children }: { x: number; y: number; w: number; h: number; offset: number; children?: ReactNode }) => {
  const step = 40;
  const n = Math.ceil(h / step) + 2;
  const o = ((offset % step) + step) % step;
  return (
    <g>
      <rect x={x + 18} y={y} width={w} height={h} fill="#27303a" opacity={0.35} filter="url(#n16-shadow)" />
      <rect x={x} y={y} width={w} height={h} fill="url(#n16-paper)" />
      <rect x={x} y={y} width={w} height={h} filter="url(#n16-paperfibre)" opacity={0.12} />
      {[x + 34, x + w - 34].map((sx) => (
        <g key={sx}>
          {Array.from({ length: n }, (_, i) => <circle key={i} cx={sx} cy={y + i * step - o} r={8} fill="#5a646c" opacity={y + i * step - o > y && y + i * step - o < y + h ? 1 : 0} />)}
          <line x1={sx + (sx < x + w / 2 ? 26 : -26)} y1={y} x2={sx + (sx < x + w / 2 ? 26 : -26)} y2={y + h} stroke="#9aa5a8" strokeWidth={1.6} strokeDasharray="3 5" strokeDashoffset={-offset} />
        </g>
      ))}
      {/* page perforation every 600 px of paper */}
      {Array.from({ length: 4 }, (_, i) => {
        const py = y + h - ((offset + i * 600) % 2400);
        return py > y && py < y + h ? <line key={i} x1={x} y1={py} x2={x + w} y2={py} stroke="#a3adb0" strokeWidth={1.4} strokeDasharray="6 5" /> : null;
      })}
      {children}
    </g>
  );
};

// The chrome paper bail at the top: the roll curls over it and falls away behind the machine.
export const Bail = ({ x, y, w }: { x: number; y: number; w: number }) => (
  <g>
    <rect x={x - 40} y={y - 14} width={w + 80} height={28} rx={14} fill="url(#n16-chrome)" />
    <rect x={x - 40} y={y - 10} width={w + 80} height={4} rx={2} fill="#ffffff" opacity={0.8} />
    {[x - 52, x + w + 30].map((bx) => <rect key={bx} x={bx} y={y - 26} width={22} height={52} rx={6} fill="#4c5a56" />)}
  </g>
);

// Platen, ribbon guide and the print head (`hx` = x of the character being struck, `strike` 0–1 for the blow).
export const Carriage = ({ x, y, w, hx, strike }: { x: number; y: number; w: number; hx: number; strike: number }) => (
  <g>
    <rect x={x - 60} y={y} width={w + 120} height={74} rx={30} fill="url(#n16-platen)" />
    <rect x={x - 60} y={y + 8} width={w + 120} height={5} rx={2} fill="#ffffff" opacity={0.18} />
    {[x - 86, x + w + 50].map((kx) => (
      <g key={kx}>
        <circle cx={kx + 18} cy={y + 37} r={36} fill="url(#n16-chrome)" />
        <circle cx={kx + 18} cy={y + 37} r={14} fill="#3c464d" />
      </g>
    ))}
    {/* rail */}
    <rect x={x - 30} y={y + 64} width={w + 60} height={16} fill="url(#n16-chrome)" />
    <g transform={`translate(${hx},${y + 6 - strike * 6})`}>
      <rect x={-46} y={-8} width={92} height={22} rx={4} fill="#2f2440" />
      <rect x={-46} y={-2} width={92} height={7} fill={C.red} opacity={0.8} />
      <path d="M-34,14 L34,14 L44,86 L-44,86 Z" fill="#4a5753" stroke="#26302d" strokeWidth={2} />
      <rect x={-28} y={30} width={56} height={30} rx={4} fill="url(#n16-chrome)" />
      <rect x={-5} y={-16} width={10} height={14} fill="#c9d2d6" />
    </g>
  </g>
);

// Housing below the platen: hammertone paint, a chrome trim, a riveted plate and a row of round keys.
export const Housing = ({ y, w, h, children }: { y: number; w: number; h: number; children?: ReactNode }) => (
  <g>
    <rect x={0} y={y} width={w} height={h} fill="url(#n16-housing)" />
    <rect x={0} y={y} width={w} height={h} filter="url(#n16-hammer)" opacity={0.22} style={{ mixBlendMode: "multiply" }} />
    <rect x={0} y={y} width={w} height={10} fill="url(#n16-chrome)" />
    {children}
  </g>
);

export const Keys = ({ y, labels, font, pressed = -1 }: { y: number; labels: string[]; font: string; pressed?: number }) => (
  <g>
    {labels.map((l, i) => {
      const x = 70 + i * 98 + (i % 2) * 6;
      const p = i === pressed ? 5 : 0;
      return (
        <g key={i} transform={`translate(${x},${y + p})`}>
          <ellipse cx={0} cy={14} rx={40} ry={18} fill="#1d2422" opacity={0.6} />
          <circle r={38} fill="#2b3331" />
          <circle r={33} fill="#f0efe6" />
          <circle r={33} fill="none" stroke="#c7c6bb" strokeWidth={3} />
          <text y={12} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={32} fill="#2b3331">{l}</text>
        </g>
      );
    })}
  </g>
);

// Punched tape: 5 data channels + a small feed hole per column; `codes` = one value per character punched.
export const Tape = ({ x0, y, codes, pitch = 22, scroll }: { x0: number; y: number; codes: number[]; pitch?: number; scroll: number }) => {
  const H = 96;
  const ch = [12, 28, 52, 68, 84];
  return (
    <g>
      <path d={`M${x0},${y + 8} L-40,${y + 30} L-40,${y + 30 + H} L${x0},${y + 8 + H} Z`} fill="#1d2422" opacity={0.4} filter="url(#n16-shadow)" />
      <rect x={-40} y={y} width={x0 + 40} height={H} fill={C.tape} />
      <rect x={-40} y={y} width={x0 + 40} height={6} fill="#fff6c8" opacity={0.6} />
      <rect x={-40} y={y + H - 6} width={x0 + 40} height={6} fill="#b9a95e" opacity={0.6} />
      {codes.map((c, i) => {
        const cx = x0 - 26 - (codes.length - 1 - i) * pitch - scroll;
        if (cx < -30) return null;
        return (
          <g key={i}>
            <circle cx={cx} cy={y + 40} r={3.4} fill="#2a3230" />
            {ch.map((cy, b) => ((c >> b) & 1 ? <circle key={b} cx={cx} cy={y + cy} r={7} fill="#2a3230" /> : null))}
          </g>
        );
      })}
    </g>
  );
};

// Baudot-like 5-bit code for a character (illustrative: derived from the code point, not a real ITA2 table).
export const code5 = (ch: string) => {
  const n = ch.codePointAt(0) ?? 32;
  const v = (n * 7 + 11) % 31;
  return v === 0 ? 1 : v;
};
