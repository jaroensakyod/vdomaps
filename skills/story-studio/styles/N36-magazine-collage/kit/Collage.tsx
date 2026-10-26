import type { ReactNode } from "react";

// N36 kit: magazine cut-out collage, 1080×1920 SVG. Paper pieces are torn (`torn`, ragged edge with a white
// paper core showing) or scissor-cut (`cut`, a few straight snips with a white margin), printed with halftone
// dots (`Halftone`), stuck with masking tape (`Tape`) and placed by hand in stop motion (`Piece`: moves on twos,
// lands with a small slap, and "boils" ±1 px every 2 frames like re-shot paper). Titles are ransom-note letters
// (`Ransom`): every Thai cluster cut from a different "magazine".

export const K = {
  pink: "#ec4f8c",
  news: "#efe7d3",
  ink: "#1b1a22",
  cyan: "#16a3c4",
  yellow: "#ffd23a",
  red: "#e23b2e",
  tape: "#efe0b4",
};
export const rnd = (seed: number) => {
  let s = Math.floor(seed * 9301 + 49297) % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};
const cl = (v: number) => Math.max(0, Math.min(1, v));

export const CollageDefs = () => (
  <defs>
    <filter id="mc-glue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx={5} dy={9} stdDeviation={5} floodColor="#2a0814" floodOpacity={0.42} />
    </filter>
    <filter id="mc-lift" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx={14} dy={24} stdDeviation={12} floodColor="#2a0814" floodOpacity={0.35} />
    </filter>
    <filter id="mc-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5 0.03" numOctaves={2} seed={3} />
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.95  0 0 0 0.9 -0.35" />
    </filter>
    <filter id="mc-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={8} />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.15  0 0 0 1.2 -0.5" />
    </filter>
    <pattern id="mc-dots" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <circle cx={7} cy={7} r={3.2} fill="#000" />
    </pattern>
    <pattern id="mc-dots-fine" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(-22)">
      <circle cx={4.5} cy={4.5} r={1.8} fill="#000" />
    </pattern>
  </defs>
);

// Ragged torn rectangle path.
export const torn = (x: number, y: number, w: number, h: number, seed: number, amp = 9, step = 16) => {
  const r = rnd(seed);
  const pts: string[] = [];
  const edge = (x1: number, y1: number, x2: number, y2: number) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
    const nx = -(y2 - y1) / Math.hypot(x2 - x1, y2 - y1), ny = (x2 - x1) / Math.hypot(x2 - x1, y2 - y1);
    for (let i = 0; i < n; i++) {
      const k = i / n, o = (r() - 0.5) * amp * 2;
      pts.push(`${(x1 + (x2 - x1) * k + nx * o).toFixed(1)} ${(y1 + (y2 - y1) * k + ny * o).toFixed(1)}`);
    }
  };
  edge(x, y, x + w, y);
  edge(x + w, y, x + w, y + h);
  edge(x + w, y + h, x, y + h);
  edge(x, y + h, x, y);
  return `M${pts.join(" L")} Z`;
};
// Scissor-cut polygon: a few snips, slightly off-square.
export const cut = (x: number, y: number, w: number, h: number, seed: number, off = 10) => {
  const r = rnd(seed);
  const j = () => (r() - 0.5) * off * 2;
  return `M${x + j()} ${y + j()} L${x + w * 0.5 + j()} ${y + j() * 0.4} L${x + w + j()} ${y + j()} L${x + w + j() * 0.4} ${y + h * 0.5 + j()} L${x + w + j()} ${y + h + j()} L${x + w * 0.45 + j()} ${y + h + j() * 0.4} L${x + j()} ${y + h + j()} L${x + j() * 0.4} ${y + h * 0.55 + j()} Z`;
};

// Torn paper: white core edge underneath, printed face on top (slightly inset), fibres on the edge.
export const TornPaper = ({ x, y, w, h, seed, fill, amp = 9, children }: { x: number; y: number; w: number; h: number; seed: number; fill: string; amp?: number; children?: ReactNode }) => {
  const outer = torn(x, y, w, h, seed, amp);
  const inner = torn(x + 7, y + 7, w - 14, h - 14, seed + 7, amp * 0.8);
  const id = `mc-tp-${seed}`;
  return (
    <g>
      <path d={outer} fill="#fbf8f2" />
      <clipPath id={id}><path d={inner} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={fill} />
        {children}
        <rect x={x} y={y} width={w} height={h} filter="url(#mc-grain)" opacity={0.35} />
      </g>
    </g>
  );
};

// Halftone dots whose size follows `fn(u, v)` 0–1 over the box (u, v 0–1). Use for shading on printed pieces.
export const Halftone = ({ x, y, w, h, step = 14, fn, color, angle = 15 }: { x: number; y: number; w: number; h: number; step?: number; fn: (u: number, v: number) => number; color: string; angle?: number }) => {
  const dots: ReactNode[] = [];
  const cx = x + w / 2, cy = y + h / 2;
  const a = (angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const R = Math.hypot(w, h) / 2;
  for (let i = -R; i <= R; i += step)
    for (let j = -R; j <= R; j += step) {
      const px = cx + i * ca - j * sa, py = cy + i * sa + j * ca;
      if (px < x - step || px > x + w + step || py < y - step || py > y + h + step) continue;
      const v = cl(fn((px - x) / w, (py - y) / h));
      if (v > 0.04) dots.push(<circle key={`${i}-${j}`} cx={px.toFixed(1)} cy={py.toFixed(1)} r={(step * 0.56 * Math.sqrt(v)).toFixed(2)} />);
    }
  return <g fill={color}>{dots}</g>;
};

// Masking tape strip with torn ends.
export const Tape = ({ x, y, w = 150, rot = 0, seed = 1 }: { x: number; y: number; w?: number; rot?: number; seed?: number }) => {
  const r = rnd(seed);
  const end = (sx: number) => Array.from({ length: 6 }, (_, i) => `${sx + (r() - 0.5) * 10} ${-22 + i * 8.8}`).join(" L");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M${end(-w / 2)} L${end(w / 2).split(" L").reverse().join(" L")} Z`} fill={K.tape} opacity={0.82} />
      <path d={`M${-w / 2} -22 L${w / 2} -22`} stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
    </g>
  );
};

// Stop-motion placement. `at` = landing frame; the piece arrives from (dx, dy) over `dur` frames, stepped on twos,
// then sits still apart from a ±1 px boil. `out` (optional) = frame it is pulled off again, towards (dx, dy).
export const Piece = ({ frame, at, dur = 10, dx = 0, dy = -900, x, y, rot = 0, seed = 1, out, lift = false, children }: { frame: number; at: number; dur?: number; dx?: number; dy?: number; x: number; y: number; rot?: number; seed?: number; out?: number; lift?: boolean; children: ReactNode }) => {
  const f = Math.floor(frame / 2) * 2;
  if (f < at - dur) return null;
  if (out !== undefined && f > out + dur) return null;
  const kin = cl((f - (at - dur)) / dur);
  const kout = out === undefined ? 0 : cl((f - out) / dur);
  const e = 1 - (1 - kin) * (1 - kin);
  const off = 1 - e + kout * kout;
  const r = rnd(seed * 31 + Math.floor(f / 2));
  const boil = kin >= 1 ? 1 : 0;
  const slap = f >= at && f < at + 4 ? 1.035 : 1;
  const px = x + dx * off + (r() - 0.5) * 2 * boil, py = y + dy * off + (r() - 0.5) * 2 * boil;
  const pr = rot + (1 - e) * 8 + (r() - 0.5) * 0.6 * boil;
  return (
    <g transform={`translate(${px} ${py}) rotate(${pr}) scale(${slap})`} filter={lift || kin < 1 ? "url(#mc-lift)" : "url(#mc-glue)"}>
      {children}
    </g>
  );
};

// Ransom-note letters: each Thai grapheme cluster on its own cut scrap, own font, colours and tilt.
const SCRAPS: [string, string][] = [
  [K.yellow, K.ink], [K.ink, "#fff"], [K.news, K.red], [K.cyan, "#fff"], ["#fff", K.ink], [K.red, K.yellow], ["#f6c6d8", K.ink],
];
export const Ransom = ({ text, x, y, size, fonts, seed = 1, frame, at = 0, every = 4 }: { text: string; x: number; y: number; size: number; fonts: string[]; seed?: number; frame: number; at?: number; every?: number }) => {
  const seg = new Intl.Segmenter("th", { granularity: "grapheme" });
  const parts = Array.from(seg.segment(text), (s) => s.segment);
  const r = rnd(seed);
  let cx = 0;
  const items = parts.map((ch, i) => {
    const sz = size * (0.86 + r() * 0.3);
    const wd = ch === " " ? size * 0.3 : sz * (/[ัิีึืุูเแโใไ]/.test(ch) && ch.length === 1 ? 0.62 : 0.78);
    const it = { ch, sz, wd, x: cx, font: fonts[Math.floor(r() * fonts.length)], col: SCRAPS[Math.floor(r() * SCRAPS.length)], rot: (r() - 0.5) * 12, dy: (r() - 0.5) * size * 0.16, seed: seed * 100 + i };
    cx += wd + size * 0.07;
    return it;
  });
  const total = cx;
  return (
    <g transform={`translate(${x - total / 2} ${y})`}>
      {items.map((it, i) =>
        it.ch === " " ? null : (
          <Piece key={i} frame={frame} at={at + i * every} dur={6} dy={-260 - i * 20} dx={(i % 2 ? 1 : -1) * 120} x={it.x + it.wd / 2} y={it.dy} rot={it.rot} seed={it.seed}>
            <path d={cut(-it.wd / 2 - 8, -it.sz * 0.62, it.wd + 16, it.sz * 1.14, it.seed, 6)} fill={it.col[0]} />
            <text x={0} y={it.sz * 0.3} textAnchor="middle" fontFamily={it.font} fontSize={it.sz} fill={it.col[1]}>{it.ch}</text>
          </Piece>
        ),
      )}
    </g>
  );
};

// A cut-out compact cassette (generic, no brand), centred on (0,0), about 700 × 440 plus a white cut margin.
export const Cassette = ({ spin = 0 }: { spin?: number }) => (
  <g>
    <path d={cut(-378, -248, 756, 496, 12, 9)} fill="#fbf8f2" />
    <rect x={-350} y={-220} width={700} height={440} rx={26} fill="#1f8fa8" />
    <clipPath id="mc-cas"><rect x={-350} y={-220} width={700} height={440} rx={26} /></clipPath>
    <g clipPath="url(#mc-cas)"><Halftone x={-350} y={-220} w={700} h={440} step={13} color="#0c3f57" fn={(u, v) => 0.15 + v * 0.55 - u * 0.15} /></g>
    {/* label */}
    <rect x={-300} y={-186} width={600} height={190} rx={10} fill={K.news} />
    <rect x={-300} y={-186} width={600} height={46} fill={K.red} />
    <rect x={-300} y={-140} width={600} height={10} fill={K.yellow} />
    {Array.from({ length: 3 }, (_, i) => <line key={i} x1={-270} y1={-96 + i * 30} x2={270} y2={-96 + i * 30} stroke="#9a8f7c" strokeWidth={2} />)}
    <text x={-280} y={-152} fontSize={30} fontWeight={700} fill="#fff" fontFamily="sans-serif">A</text>
    <text x={270} y={-152} fontSize={22} fill="#fff" textAnchor="end" fontFamily="sans-serif">C-60</text>
    {/* window with reels */}
    <rect x={-180} y={-60} width={360} height={120} rx={58} fill="#2a2630" />
    <rect x={-120} y={-36} width={240} height={72} fill="#5a3a2a" opacity={0.7} />
    {[-110, 110].map((cx, k) => (
      <g key={cx} transform={`translate(${cx} 0) rotate(${spin * (k ? 1 : 1)})`}>
        <circle r={k ? 34 : 52} fill="#4a2c1e" />
        <circle r={24} fill="#f4f1ea" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-4} y={-24} width={8} height={10} fill="#2a2630" transform={`rotate(${i * 60})`} />)}
        <circle r={9} fill="#2a2630" />
      </g>
    ))}
    {/* bottom trapezoid with holes */}
    <path d="M-230 120 L230 120 L200 210 L-200 210 Z" fill="#17708a" />
    <Halftone x={-230} y={120} w={460} h={90} step={9} color="#0a3346" fn={() => 0.35} />
    {[-150, -50, 50, 150].map((x, i) => <circle key={x} cx={x} cy={168} r={i % 3 ? 10 : 16} fill="#0d2a36" />)}
    {[[-326, -196], [326, -196], [-326, 196], [326, 196]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={9} fill="#c8d6dc" stroke="#0d2a36" strokeWidth={3} />)}
  </g>
);

// Cut-out headphones (generic), centred, about 420 wide.
export const Headphones = () => (
  <g>
    <path d="M-200 60 C-200 -230 200 -230 200 60" stroke="#fbf8f2" strokeWidth={56} fill="none" strokeLinecap="round" />
    <path d="M-200 60 C-200 -230 200 -230 200 60" stroke="#2a2630" strokeWidth={26} fill="none" strokeLinecap="round" />
    {[-1, 1].map((d) => (
      <g key={d} transform={`translate(${d * 196} 90)`}>
        <ellipse rx={86} ry={110} fill="#fbf8f2" />
        <ellipse rx={66} ry={90} fill={K.yellow} />
        <clipPath id={`mc-cup${d}`}><ellipse rx={66} ry={90} /></clipPath>
        <g clipPath={`url(#mc-cup${d})`}><Halftone x={-66} y={-90} w={132} h={180} step={10} color="#c1531c" fn={(u, v) => (d > 0 ? u : 1 - u) * 0.7 + v * 0.2} /></g>
        <ellipse rx={30} ry={46} fill="#2a2630" opacity={0.8} />
      </g>
    ))}
  </g>
);

// Cut-out compact disc with a halftone rainbow sheen, centred, radius ~190.
export const Disc = () => (
  <g>
    <circle r={196} fill="#fbf8f2" />
    <circle r={180} fill="#d9dde4" />
    {["#9fe3ff", "#ffd5f0", "#fff3a8", "#b8ffd0", "#c8c2ff", "#ffc9a8"].map((c, i) => (
      <path key={c} d={`M0 0 L${Math.cos((i * Math.PI) / 3) * 180} ${Math.sin((i * Math.PI) / 3) * 180} A180 180 0 0 1 ${Math.cos(((i + 1) * Math.PI) / 3) * 180} ${Math.sin(((i + 1) * Math.PI) / 3) * 180} Z`} fill={c} opacity={0.85} />
    ))}
    <Halftone x={-180} y={-180} w={360} h={360} step={11} color="#6a6f80" fn={(u, v) => { const d = Math.hypot(u - 0.5, v - 0.5); return d > 0.5 ? 0 : 0.25 + 0.45 * Math.abs(Math.sin(Math.atan2(v - 0.5, u - 0.5) * 2)); }} />
    <circle r={58} fill="#eef0f4" />
    <circle r={24} fill={K.pink} />
    <circle r={24} fill="none" stroke="#9aa0ac" strokeWidth={3} />
  </g>
);

// Newsprint strip: columns of grey "text" lines and a halftone picture block (abstract), for backgrounds.
export const Newsprint = ({ x, y, w, h, seed }: { x: number; y: number; w: number; h: number; seed: number }) => {
  const r = rnd(seed);
  const cols = Math.max(2, Math.floor(w / 220));
  const cw = w / cols;
  return (
    <g>
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: Math.floor(h / 22) }, (_, i) => <rect key={`${c}-${i}`} x={x + c * cw + 16} y={y + 20 + i * 22} width={(cw - 32) * (i % 7 === 6 ? 0.5 : 0.9 + r() * 0.1)} height={8} fill="#8f877a" opacity={0.55} />),
      )}
    </g>
  );
};
