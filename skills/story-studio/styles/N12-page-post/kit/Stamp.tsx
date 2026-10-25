import { loadFont } from "@remotion/google-fonts/Fahkwang";
import { geoMercator, geoPath } from "d3-geo";
import type { ReactNode } from "react";
import { AbsoluteFill, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { country } from "../../../components/data";

// N12 stamp-album kit: a 4:5 page post (1080×1350) drawn as a commemorative stamp issue mounted on a buff
// philatelic album page. The post's picture is a large perforated stamp printed in 2–3 inks (intaglio look: line
// work only, no flat fills), a smaller stamp carries the map, a round postmark cancels both, glassine mount
// strips hold them, and a printed caption block sits below. Everything is one SVG in 1080×1350 units; the card
// centres itself in any frame size.

export const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const PAGE = "#f3e6b4"; // buff album page
export const PAPER = "#f4eedd"; // stamp paper
export const GREEN = "#1f5a45"; // deep green ink
export const BLUE = "#22389a"; // ultramarine ink
export const CARMINE = "#b8243f"; // carmine ink
export const INK = "#1c1f2b"; // text / postmark ink
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const POST_W = 1080;
export const POST_H = 1350;

// Card geometry inside the current frame: unit `s` (1 at 1080 wide) and the card's box in px.
export const usePostBox = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width / POST_W, height / POST_H);
  const w = POST_W * s;
  const h = POST_H * s;
  return { s, w, h, left: (width - w) / 2, top: (height - h) / 2, width, height };
};

// Entrance 0 → 1 spring starting at `at` (slightly heavy: a stamp laid down by hand).
export const useIn = (at: number, damping = 15) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.9 } });
};

// Shared defs: paper grain, ink spread, hatch patterns. Rendered once inside AlbumPage.
const Defs = () => (
  <defs>
    <filter id="n12grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.15  0 0 0 -1.6 1.05" />
    </filter>
    <filter id="n12fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.18" numOctaves={3} seed={3} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 -2.2 1.2" />
    </filter>
    {/* ink spread: lines wobble a hair, like ink pressed out of engraved grooves */}
    <filter id="n12ink" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} />
    </filter>
    {/* rubber-stamp cancel: patchy ink */}
    <filter id="n12cancel" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={5} result="big" />
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={9} result="fine" />
      <feComposite in="big" in2="fine" operator="arithmetic" k1="0" k2="0.6" k3="0.5" k4="0.05" result="mix" />
      <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.2 -1.1" result="holes" />
      <feComposite in="SourceGraphic" in2="holes" operator="in" />
    </filter>
    <pattern id="n12hatchG" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1={0} y1={0} x2={0} y2={4} stroke={GREEN} strokeWidth={1.3} />
    </pattern>
    <pattern id="n12hatchB" width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1={0} y1={0} x2={0} y2={5} stroke={BLUE} strokeWidth={1} />
    </pattern>
    <pattern id="n12cross" width={3.2} height={3.2} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <rect width={3.2} height={3.2} fill="#55705f" />
      <line x1={0} y1={0} x2={0} y2={3.2} stroke="#0f211b" strokeWidth={2.2} />
      <line x1={0} y1={0} x2={3.2} y2={0} stroke="#122a22" strokeWidth={1.1} />
    </pattern>
    {/* guilloche: interlaced fine waves engraved into the solid frame ink */}
    <pattern id="n12guilloche" width={24} height={12} patternUnits="userSpaceOnUse">
      <path d="M0 6 Q6 0 12 6 T24 6" fill="none" stroke={PAPER} strokeWidth={0.7} />
      <path d="M0 6 Q6 12 12 6 T24 6" fill="none" stroke={PAPER} strokeWidth={0.7} />
    </pattern>
    <pattern id="n12grid" width={27} height={27} patternUnits="userSpaceOnUse">
      <path d="M27 0 L0 0 0 27" fill="none" stroke="#a8946a" strokeWidth={0.8} />
    </pattern>
  </defs>
);

// The album page: buff paper, faint quadrille grid inside a ruled border, fibres and grain. Children are SVG in
// 1080×1350 units; `html` is for anything that must be HTML (rare).
export const AlbumPage = ({ children, html }: { children: ReactNode; html?: ReactNode }) => {
  const { left, top, w, h } = usePostBox();
  return (
    <AbsoluteFill style={{ background: "#2a2418" }}>
      <div style={{ position: "absolute", left, top, width: w, height: h, overflow: "hidden", background: PAGE }}>
        <svg viewBox={`0 0 ${POST_W} ${POST_H}`} width={w} height={h} style={{ position: "absolute", inset: 0, fontFamily: font }}>
          <Defs />
          <rect width={POST_W} height={POST_H} fill={PAGE} />
          <rect x={40} y={128} width={1000} height={1110} fill="url(#n12grid)" opacity={0.8} />
          <rect width={POST_W} height={POST_H} filter="url(#n12fibre)" opacity={0.3} />
          {/* ruled album border: thick + thin */}
          <rect x={26} y={26} width={1028} height={1298} fill="none" stroke={GREEN} strokeWidth={3} />
          <rect x={34} y={34} width={1012} height={1282} fill="none" stroke={GREEN} strokeWidth={1} />
          {children}
          <rect width={POST_W} height={POST_H} filter="url(#n12grain)" opacity={0.35} style={{ mixBlendMode: "multiply" }} />
        </svg>
        {html}
      </div>
    </AbsoluteFill>
  );
};

// Album page heading (top band): kicker left, sheet name right, a double rule under.
export const PageHead = ({ kicker, right, k = 1 }: { kicker: string; right: string; k?: number }) => (
  <g opacity={k}>
    <text x={64} y={92} fontSize={30} fontWeight={700} fill={CARMINE} letterSpacing={2}>{kicker}</text>
    <text x={1016} y={92} fontSize={24} fontWeight={600} fill={GREEN} textAnchor="end" letterSpacing={1}>{right}</text>
    <line x1={64} x2={1016} y1={112} y2={112} stroke={GREEN} strokeWidth={2} />
    <line x1={64} x2={1016} y1={118} y2={118} stroke={GREEN} strokeWidth={0.8} />
  </g>
);

// Perforated stamp paper of w×h (local units, origin top-left). Teeth = holes of radius `r` every ~`pitch`.
const perfMask = (id: string, w: number, h: number, r: number, pitch: number) => {
  const nx = Math.round(w / pitch);
  const ny = Math.round(h / pitch);
  const holes: [number, number][] = [];
  for (let i = 0; i <= nx; i++) holes.push([(i * w) / nx, 0], [(i * w) / nx, h]);
  for (let j = 1; j < ny; j++) holes.push([0, (j * h) / ny], [w, (j * h) / ny]);
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x={-10} y={-10} width={w + 20} height={h + 20}>
      <rect width={w} height={h} fill="#fff" />
      {holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill="#000" />)}
    </mask>
  );
};

// A stamp laid on the page: position (centre cx, cy), size, rotation, entrance `k` (slides up from below and
// straightens). Children draw on the stamp face in local units (0..w, 0..h).
export const Stamp = ({ id, cx, cy, w, h, rot = 0, k = 1, from = [0, 260], tilt = -6, children, teeth = 9, pitch = 26 }: { id: string; cx: number; cy: number; w: number; h: number; rot?: number; k?: number; from?: [number, number]; tilt?: number; children?: ReactNode; teeth?: number; pitch?: number }) => {
  const dx = (1 - k) * from[0];
  const dy = (1 - k) * from[1];
  const r = rot + (1 - k) * tilt;
  return (
    <g transform={`translate(${cx + dx} ${cy + dy}) rotate(${r}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, k * 3)}>
      <defs>{perfMask(`${id}perf`, w, h, teeth, pitch)}</defs>
      <g mask={`url(#${id}perf)`} style={{ filter: "drop-shadow(3px 6px 4px rgba(60,40,10,0.35))" }}>
        <rect width={w} height={h} fill={PAPER} />
        {children}
        <rect width={w} height={h} filter="url(#n12grain)" opacity={0.18} style={{ mixBlendMode: "multiply" }} />
      </g>
    </g>
  );
};

// Engraved double frame line around a stamp's design area.
export const EngravedFrame = ({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) => (
  <g fill="none" stroke={color}>
    <rect x={x} y={y} width={w} height={h} strokeWidth={3.2} />
    <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} strokeWidth={1} />
    {/* corner ornaments: little engraved quarter rosettes */}
    {[[x + 7, y + 7, 0], [x + w - 7, y + 7, 90], [x + w - 7, y + h - 7, 180], [x + 7, y + h - 7, 270]].map(([a, b, rr]) => (
      <g key={`${a}-${b}`} transform={`translate(${a} ${b}) rotate(${rr})`}>
        {[10, 15, 20].map((q) => <path key={q} d={`M${q} 0 A${q} ${q} 0 0 1 0 ${q}`} strokeWidth={0.9} />)}
      </g>
    ))}
  </g>
);

// A picture window on the main stamp. `photo` = file in public/ (the page's own picture), printed as a one-ink
// line-screen (greyscale + ink tint + engraved lines over it); else `children` = engraved SVG drawn in w×h.
export const PictureWindow = ({ id, x, y, w, h, photo, ink = GREEN, children }: { id: string; x: number; y: number; w: number; h: number; photo?: string; ink?: string; children?: ReactNode }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <clipPath id={`${id}clip`}><rect width={w} height={h} /></clipPath>
      <filter id={`${id}duo`}>
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={0.92} intercept={0.04} />
          <feFuncG type="linear" slope={0.9} intercept={0.04} />
          <feFuncB type="linear" slope={0.82} intercept={0.04} />
        </feComponentTransfer>
      </filter>
      <pattern id={`${id}screen`} width={4} height={4} patternUnits="userSpaceOnUse">
        <line x1={0} y1={2} x2={4} y2={2} stroke={PAPER} strokeWidth={1.4} />
      </pattern>
    </defs>
    <g clipPath={`url(#${id}clip)`}>
      <rect width={w} height={h} fill={PAPER} />
      {photo ? (
        <>
          <image href={staticFile(photo)} width={w} height={h} preserveAspectRatio="xMidYMin slice" filter={`url(#${id}duo)`} />
          <rect width={w} height={h} fill={ink} style={{ mixBlendMode: "screen" }} />
          <rect width={w} height={h} fill={`url(#${id}screen)`} />
        </>
      ) : (
        <g filter="url(#n12ink)">{children}</g>
      )}
    </g>
  </g>
);

// Map for the small stamp: coast as engraved water-lines (rings around the land), land hatched, one place marked.
// `extent` = [[west, south], [east, north]]; `areas` = [id, ink, hatch pattern id][].
export const EngravedMap = ({ w, h, extent, areas, mark, labels = [] }: { w: number; h: number; extent: [[number, number], [number, number]]; areas: [string, string, string][]; mark: [number, number]; labels?: { at: [number, number]; text: string; size: number; color: string }[] }) => {
  const proj = geoMercator().fitExtent([[0, 0], [w, h]], { type: "MultiPoint", coordinates: extent });
  const path = geoPath(proj);
  const land = areas.map(([id]) => path(country(id)) ?? "");
  const m = proj(mark)!;
  return (
    <g>
      <defs><clipPath id="n12mapclip"><rect width={w} height={h} /></clipPath></defs>
      <g clipPath="url(#n12mapclip)">
        <rect width={w} height={h} fill="#9aa7d6" />
        {/* water-lines: land strokes stacked wide → narrow, alternating ink and paper */}
        {[34, 28, 22, 16, 10].map((sw, i) => (
          <g key={sw}>
            {land.map((d, j) => <path key={j} d={d} fill="none" stroke={BLUE} strokeWidth={sw} strokeLinejoin="round" opacity={0.75 - i * 0.06} />)}
            {land.map((d, j) => <path key={`p${j}`} d={d} fill="none" stroke={PAPER} strokeWidth={sw - 2.4} strokeLinejoin="round" />)}
          </g>
        ))}
        {areas.map(([id], j) => <path key={`b${id}`} d={land[j]} fill={PAPER} />)}
        {areas.map(([id, ink, hatch], j) => <path key={id} d={land[j]} fill={`url(#${hatch})`} stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />)}
        {labels.map((l) => {
          const p = proj(l.at)!;
          return <text key={l.text} x={p[0]} y={p[1]} textAnchor="middle" fontSize={l.size} fontWeight={700} fill={l.color} stroke={PAPER} strokeWidth={4} paintOrder="stroke">{l.text}</text>;
        })}
        <g transform={`translate(${m[0]} ${m[1]})`}>
          <circle r={11} fill="none" stroke={CARMINE} strokeWidth={2} />
          <circle r={4} fill={CARMINE} />
          <path d="M-18 0 H-13 M13 0 H18 M0 -18 V-13 M0 13 V18" stroke={CARMINE} strokeWidth={2} />
        </g>
      </g>
    </g>
  );
};

// Round postmark with a date ring (text around the ring) and wavy cancel lines to the right. `k` 0 → 1 = the
// stamp hitting the page (scale 1.35 → 1, ink appears).
export const Postmark = ({ cx, cy, r = 100, ring, date, year, waves = 5, waveLen = 300, rot = -8, k = 1 }: { cx: number; cy: number; r?: number; ring: string; date: string; year: string; waves?: number; waveLen?: number; rot?: number; k?: number }) => {
  const sc = 1 + (1 - k) * 0.35;
  const ringR = r - 22;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sc})`} opacity={k > 0.02 ? 0.82 * Math.min(1, k * 1.6) : 0} filter="url(#n12cancel)">
      <defs>
        <path id="n12ringpath" d={`M ${-ringR} 0 A ${ringR} ${ringR} 0 1 1 ${ringR} 0 A ${ringR} ${ringR} 0 1 1 ${-ringR} 0`} />
      </defs>
      <circle r={r} fill="none" stroke={INK} strokeWidth={5} />
      <circle r={r - 44} fill="none" stroke={INK} strokeWidth={3} />
      <text fontSize={21} fontWeight={700} fill={INK} letterSpacing={1.5}>
        <textPath href="#n12ringpath" startOffset="0">{ring}</textPath>
      </text>
      <line x1={-(r - 50)} x2={r - 50} y1={-16} y2={-16} stroke={INK} strokeWidth={2} />
      <line x1={-(r - 50)} x2={r - 50} y1={22} y2={22} stroke={INK} strokeWidth={2} />
      <text y={12} fontSize={30} fontWeight={700} fill={INK} textAnchor="middle">{date}</text>
      <text y={48} fontSize={17} fontWeight={600} fill={INK} textAnchor="middle">{year}</text>
      {Array.from({ length: waves }, (_, i) => {
        const y = -r * 0.6 + (i * r * 1.2) / (waves - 1);
        let d = `M${r + 14} ${y}`;
        for (let x = r + 14; x < r + waveLen; x += 10) d += ` Q${x + 5} ${y + (Math.floor((x - r) / 10) % 2 ? 7 : -7)} ${x + 10} ${y}`;
        return <path key={i} d={d} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
      })}
    </g>
  );
};

// Glassine mount strip: a clear sleeve over the top of a stamp (cx, y = centre x and top edge, w wide).
export const Mount = ({ cx, y, w, h = 56, rot = 0, k = 1 }: { cx: number; y: number; w: number; h?: number; rot?: number; k?: number }) => (
  <g transform={`translate(${cx} ${y - (1 - k) * 40}) rotate(${rot})`} opacity={k}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#fffaf0" opacity={0.32} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke="#fffaf0" strokeWidth={1.2} opacity={0.8} />
    <line x1={-w / 2} x2={w / 2} y1={h / 2 - 3} y2={h / 2 - 3} stroke="#8a7a52" strokeWidth={1} opacity={0.6} />
    <rect x={-w / 2 + 30} y={-h / 2 + 8} width={w * 0.35} height={4} fill="#fff" opacity={0.5} />
  </g>
);

// Printed caption block under the stamps (SVG text, left-aligned at x). `ask` is printed in carmine.
export const Caption = ({ x, y, date, lines, ask, sub, k = [1, 1, 1] }: { x: number; y: number; date: string; lines: string[]; ask: string; sub?: string; k?: number[] }) => {
  const rise = (v: number) => `translate(0 ${(1 - v) * 26})`;
  return (
    <g>
      <g transform={rise(k[0])} opacity={k[0]}>
        <text x={x} y={y} fontSize={34} fontWeight={700} fill={CARMINE} letterSpacing={1}>{date}</text>
      </g>
      <g transform={rise(k[1])} opacity={k[1]}>
        {lines.map((l, i) => <text key={l} x={x} y={y + 92 + i * 88} fontSize={78} fontWeight={700} fill={INK}>{l}</text>)}
        <text x={x} y={y + 92 + lines.length * 88} fontSize={78} fontWeight={700} fill={CARMINE}>{ask}</text>
      </g>
      {sub && (
        <g transform={rise(k[2])} opacity={k[2]}>
          <text x={x} y={y + 92 + lines.length * 88 + 56} fontSize={32} fontWeight={600} fill={GREEN}>{sub}</text>
        </g>
      )}
    </g>
  );
};

// Perforated label (the "coming soon" chip): a carmine-printed tab with white lettering.
export const Label = ({ id, cx, cy, w, h, rot = 0, k = 1, lines }: { id: string; cx: number; cy: number; w: number; h: number; rot?: number; k?: number; lines: string[] }) => (
  <Stamp id={id} cx={cx} cy={cy} w={w} h={h} rot={rot} k={k} from={[220, 0]} tilt={8} teeth={6} pitch={18}>
    <rect x={14} y={14} width={w - 28} height={h - 28} fill={CARMINE} />
    <rect x={22} y={22} width={w - 44} height={h - 44} fill="none" stroke={PAPER} strokeWidth={1.2} />
    {lines.map((l, i) => <text key={l} x={w / 2} y={h / 2 + (i - (lines.length - 1) / 2) * 44 + 13} textAnchor="middle" fontSize={36} fontWeight={700} fill={PAPER}>{l}</text>)}
  </Stamp>
);

// Footer: page name (second part in green) right, credits line across the bottom border.
export const Footer = ({ brand, credit, k = 1 }: { brand: [string, string]; credit?: string; k?: number }) => (
  <g opacity={k}>
    <line x1={64} x2={1016} y1={1262} y2={1262} stroke={GREEN} strokeWidth={0.8} />
    <text x={1016} y={1250} textAnchor="end" fontSize={30} fontWeight={700} fill={INK}>{brand[0]}<tspan fill={GREEN}>{brand[1]}</tspan></text>
    {credit && <text x={540} y={1296} textAnchor="middle" fontSize={17} fontWeight={400} fill={INK} opacity={0.7}>{credit}</text>}
  </g>
);
