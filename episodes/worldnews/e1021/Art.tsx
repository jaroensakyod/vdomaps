import { Easing, interpolate, random } from "remotion";
import type { InsetGeom } from "../../../components/Inset";

// Props drawn for the 21 Oct 2026 edition. Same conventions as components/Props: (x, y) = ground point,
// `scale` ≈ 1 px per design unit, dark outlines, two-tone shading. No injured people are ever drawn.
const INK = "#1b1d24";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
export const age = (f: number, at: number, len: number) => (f < at ? 0 : Math.min(1, (f - at) / len));
type P = { x: number; y: number; scale?: number };

// Boxy 4WD (LandCruiser-like), side view, facing left unless flip.
export const Suv = ({ x, y, scale = 1, color = "#e8e4dc", flip = false, lights = 0 }: P & { color?: string; flip?: boolean; lights?: number }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
    <path d="M-62 -14 L-62 -34 Q-60 -40 -52 -41 L-34 -42 L-22 -64 L40 -64 Q48 -64 50 -56 L58 -40 L64 -38 L64 -14 Z" fill={color} stroke={INK} strokeWidth={1.8} />
    <path d="M-62 -24 L64 -24 L64 -14 L-62 -14 Z" fill="#00000022" />
    <path d="M-18 -60 L-4 -60 L-4 -43 L-29 -43 Z" fill="#9fc3d8" stroke={INK} strokeWidth={1.2} />
    <path d="M0 -60 L22 -60 L22 -43 L0 -43 Z" fill="#9fc3d8" stroke={INK} strokeWidth={1.2} />
    <path d="M26 -60 L40 -60 L50 -43 L26 -43 Z" fill="#9fc3d8" stroke={INK} strokeWidth={1.2} />
    <rect x={-66} y={-30} width={10} height={14} rx={2} fill="#333" />
    <rect x={-63} y={-38} width={6} height={5} fill="#fff6c2" />
    {lights > 0 && <path d="M-63 -36 L-150 -52 L-150 -18 Z" fill="#fff6c2" opacity={0.35 * lights} />}
    {[-38, 40].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={-10} r={14} fill="#222" stroke={INK} strokeWidth={1.5} />
        <circle cx={cx} cy={-10} r={6} fill="#999" />
      </g>
    ))}
  </g>
);

// Low office front with a sign and a glass door. (x = left edge, y = ground)
export const OfficeFront = ({ x, y, w, s, sign, font }: { x: number; y: number; w: number; s: number; sign: string; font: string }) => (
  <g>
    <rect x={x} y={y - 170 * s} width={w} height={170 * s} fill="#c9b79c" stroke={INK} strokeWidth={1.6 * s} />
    <rect x={x} y={y - 182 * s} width={w} height={14 * s} fill="#8c7a62" />
    <rect x={x + w * 0.08} y={y - 150 * s} width={w * 0.84} height={36 * s} rx={4 * s} fill="#0b3d6b" />
    <text x={x + w / 2} y={y - 124 * s} textAnchor="middle" fontSize={22 * s} fontWeight={900} fill="#fff" fontFamily={font}>{sign}</text>
    <rect x={x + w * 0.1} y={y - 100 * s} width={w * 0.38} height={70 * s} fill="#9fc3d8" stroke={INK} strokeWidth={1.4 * s} />
    <rect x={x + w * 0.58} y={y - 100 * s} width={w * 0.28} height={100 * s} fill="#7fa9c2" stroke={INK} strokeWidth={1.4 * s} />
    <line x1={x + w * 0.72} y1={y - 100 * s} x2={x + w * 0.72} y2={y} stroke={INK} strokeWidth={1.2 * s} />
  </g>
);

// Police car with flashing bar.
export const PoliceCar = ({ x, y, scale = 1, frame }: P & { frame: number }) => {
  const on = Math.floor(frame / 5) % 2 === 0;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M-70 -12 L-70 -30 Q-66 -36 -50 -38 L-30 -56 L30 -56 L52 -38 Q68 -36 70 -28 L70 -12 Z" fill="#f4f4f4" stroke={INK} strokeWidth={1.8} />
      <rect x={-70} y={-30} width={140} height={9} fill="#1d4ed8" />
      <path d="M-26 -52 L-4 -52 L-4 -38 L-40 -38 Z M2 -52 L26 -52 L44 -38 L2 -38 Z" fill="#9fc3d8" stroke={INK} strokeWidth={1.2} />
      <rect x={-16} y={-64} width={14} height={8} rx={2} fill={on ? "#ff3b30" : "#5a1a16"} />
      <rect x={2} y={-64} width={14} height={8} rx={2} fill={on ? "#1e3a8a" : "#4f8cff"} />
      {on && <circle cx={-9} cy={-60} r={22} fill="#ff3b30" opacity={0.25} />}
      {!on && <circle cx={9} cy={-60} r={22} fill="#4f8cff" opacity={0.25} />}
      {[-42, 42].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-10} r={13} fill="#222" />
          <circle cx={cx} cy={-10} r={5} fill="#aaa" />
        </g>
      ))}
    </g>
  );
};

// Courthouse with columns. (x = centre, y = ground)
export const Courthouse = ({ x, y, s, font, label = "ศาล" }: { x: number; y: number; s: number; font: string; label?: string }) => (
  <g>
    <rect x={x - 190 * s} y={y - 22 * s} width={380 * s} height={22 * s} fill="#d6d0c4" stroke={INK} strokeWidth={1.4 * s} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={x - 160 * s + i * 60 * s} y={y - 170 * s} width={22 * s} height={148 * s} fill="#ece6da" stroke={INK} strokeWidth={1.2 * s} />
    ))}
    <rect x={x - 180 * s} y={y - 190 * s} width={360 * s} height={22 * s} fill="#d6d0c4" stroke={INK} strokeWidth={1.4 * s} />
    <path d={`M${x - 190 * s} ${y - 190 * s} L${x} ${y - 250 * s} L${x + 190 * s} ${y - 190 * s} Z`} fill="#e3ddd0" stroke={INK} strokeWidth={1.4 * s} />
    <text x={x} y={y - 200 * s} textAnchor="middle" fontSize={26 * s} fontWeight={900} fill="#5b4a2f" fontFamily={font}>{label}</text>
  </g>
);

// Lectern with microphones and a crest.
export const Lectern = ({ x, y, scale = 1, color = "#5b3a24" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-34 0 L-26 -80 L26 -80 L34 0 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <rect x={-40} y={-92} width={80} height={14} rx={3} fill="#7a5235" stroke={INK} strokeWidth={1.4} />
    <circle cx={0} cy={-46} r={14} fill="#d9b44a" stroke={INK} strokeWidth={1.2} />
    <path d="M-8 -92 L-14 -112 M8 -92 L14 -112" stroke="#222" strokeWidth={2} />
    <circle cx={-14} cy={-114} r={4} fill="#222" />
    <circle cx={14} cy={-114} r={4} fill="#222" />
  </g>
);

// Power plant: hall, two chimneys, a pylon line. `hit` 0..1 = blast + darkness.
export const PowerPlant = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    <rect x={x} y={y - 120 * s} width={260 * s} height={120 * s} fill="#6f7782" stroke={INK} strokeWidth={1.6 * s} />
    <rect x={x + 30 * s} y={y - 250 * s} width={34 * s} height={130 * s} fill="#8a929c" stroke={INK} strokeWidth={1.4 * s} />
    <rect x={x + 90 * s} y={y - 220 * s} width={34 * s} height={100 * s} fill="#8a929c" stroke={INK} strokeWidth={1.4 * s} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={x + (150 + i * 20) * s} y={y - 90 * s} width={12 * s} height={20 * s} fill="#1d2430" />
    ))}
  </g>
);

export const Pylon = ({ x, y, s, h = 180 }: { x: number; y: number; s: number; h?: number }) => (
  <g stroke="#3a3f47" strokeWidth={2.4 * s} fill="none">
    <path d={`M${x - 26 * s} ${y} L${x} ${y - h * s} L${x + 26 * s} ${y}`} />
    <path d={`M${x - 40 * s} ${y - h * 0.75 * s} L${x + 40 * s} ${y - h * 0.75 * s} M${x - 30 * s} ${y - h * 0.55 * s} L${x + 30 * s} ${y - h * 0.55 * s}`} />
    <path d={`M${x - 18 * s} ${y - h * 0.35 * s} L${x + 18 * s} ${y - h * 0.6 * s} M${x + 18 * s} ${y - h * 0.35 * s} L${x - 18 * s} ${y - h * 0.6 * s}`} />
  </g>
);

// A row of apartment blocks whose windows go dark block by block as `dark` goes 0 → 1.
export const BlackoutCity = ({ g, dark }: { g: InsetGeom; dark: number }) => (
  <g>
    {Array.from({ length: 9 }, (_, i) => {
      const bw = g.W / 9;
      const h = (120 + random(`h${i}`) * 120) * g.s;
      const bx = g.x + i * bw;
      const off = dark > (i + 0.5) / 9;
      return (
        <g key={i}>
          <rect x={bx + 4 * g.s} y={g.ground - h} width={bw - 8 * g.s} height={h} fill={off ? "#151a24" : "#2c3446"} stroke={INK} strokeWidth={1.2 * g.s} />
          {Array.from({ length: Math.floor(h / (28 * g.s)) }, (_, r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={bx + (14 + c * 30) * g.s} y={g.ground - h + (12 + r * 28) * g.s} width={14 * g.s} height={14 * g.s} fill={off ? "#20262f" : random(`w${i}${r}${c}`) > 0.25 ? "#ffd56b" : "#3a4255"} />
            )),
          )}
        </g>
      );
    })}
  </g>
);

// Negotiation table seen from the front: folder with a title.
export const Table = ({ x, y, s, font, title }: { x: number; y: number; s: number; font: string; title: string }) => (
  <g>
    <rect x={x - 260 * s} y={y - 70 * s} width={520 * s} height={18 * s} fill="#6b4a2f" stroke={INK} strokeWidth={1.4 * s} />
    <rect x={x - 250 * s} y={y - 52 * s} width={500 * s} height={52 * s} fill="#4f3522" />
    <rect x={x - 80 * s} y={y - 92 * s} width={160 * s} height={24 * s} rx={3 * s} fill="#1d3557" stroke={INK} strokeWidth={1.2 * s} transform={`skewX(-20) translate(${(y - 80 * s) * 0.364},0)`} />
    <text x={x} y={y - 100 * s} textAnchor="middle" fontSize={24 * s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * s} paintOrder="stroke" fontFamily={font}>{title}</text>
    {[-180, 180].map((dx) => (
      <g key={dx}>
        <rect x={x + dx * s - 18 * s} y={y - 110 * s} width={4 * s} height={40 * s} fill="#888" />
        <rect x={x + dx * s - 16 * s} y={y - 110 * s} width={30 * s} height={18 * s} fill={dx < 0 ? "#3c3b6e" : "#e8e8e8"} />
        {dx < 0 && <rect x={x + dx * s - 16 * s} y={y - 110 * s} width={30 * s} height={6 * s} fill="#b22234" />}
        {dx > 0 && (
          <>
            <rect x={x + dx * s - 16 * s} y={y - 104 * s} width={30 * s} height={6 * s} fill="#0039a6" />
            <rect x={x + dx * s - 16 * s} y={y - 98 * s} width={30 * s} height={6 * s} fill="#d52b1e" />
          </>
        )}
      </g>
    ))}
  </g>
);

// Palm tree bending in the wind (`wind` 0..1), frame-driven sway.
export const Palm = ({ x, y, scale = 1, wind = 0, frame, seed = 0 }: P & { wind?: number; frame: number; seed?: number }) => {
  const sway = wind * (18 + 6 * Math.sin(frame * 0.35 + seed));
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d={`M-5 0 Q${sway * 0.4} -60 ${sway} -120 L${sway + 8} -120 Q${sway * 0.4 + 8} -60 5 0 Z`} fill="#7a5a3a" stroke={INK} strokeWidth={1.2} />
      {[-150, -110, -60, -20, 20].map((a, i) => {
        const ang = ((a + sway * 2.2) * Math.PI) / 180;
        const ex = sway + 4 + Math.cos(ang) * 60;
        const ey = -120 + Math.sin(ang) * 30 + 22;
        return <path key={i} d={`M${sway + 4} -120 Q${(sway + 4 + ex) / 2} ${-140 + i * 2} ${ex} ${ey}`} stroke="#2f7a3a" strokeWidth={9} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

// Slanted rain over a box.
export const Rain = ({ g, k, frame, slant = 0.35, n = 70 }: { g: InsetGeom; k: number; frame: number; slant?: number; n?: number }) =>
  k <= 0 ? null : (
    <g stroke="#cfe6ff" strokeWidth={2 * g.s} opacity={0.55 * k}>
      {Array.from({ length: n }, (_, i) => {
        const px = random(`rx${i}`) * (g.W + 200 * g.s) + g.x - 100 * g.s;
        const sp = 18 + random(`rs${i}`) * 10;
        const py = g.y + (((random(`ry${i}`) * g.H + frame * sp * g.s) % (g.H + 40 * g.s)) - 20 * g.s);
        const len = 26 * g.s;
        return <line key={i} x1={px + py * slant - g.y * slant} y1={py} x2={px + (py + len) * slant - g.y * slant} y2={py + len} />;
      })}
    </g>
  );

// Waves along the bottom of a panel.
export const Waves = ({ g, level, frame, color = "#3b7fb5", amp = 8 }: { g: InsetGeom; level: number; frame: number; color?: string; amp?: number }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const px = g.x + (g.W * i) / 40;
    pts.push(`${px},${level + Math.sin(i * 0.9 + frame * 0.18) * amp * g.s}`);
  }
  return <path d={`M${g.x},${g.y + g.H} L${pts.join(" L")} L${g.x + g.W},${g.y + g.H} Z`} fill={color} opacity={0.88} />;
};

// Simple car (for flooded streets), facing right.
export const Car = ({ x, y, scale = 1, color = "#c0392b" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-56 -10 L-56 -26 Q-54 -30 -40 -32 L-24 -48 L22 -48 L40 -32 Q56 -30 58 -22 L58 -10 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <path d="M-20 -44 L0 -44 L0 -32 L-34 -32 Z M4 -44 L20 -44 L34 -32 L4 -32 Z" fill="#9fc3d8" />
    {[-34, 36].map((cx) => (
      <circle key={cx} cx={cx} cy={-8} r={11} fill="#222" />
    ))}
  </g>
);

// Rescue helicopter, facing left, rotor blur.
export const Helicopter = ({ x, y, scale = 1, frame }: P & { frame: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-40 0 Q-44 -26 -14 -28 L20 -28 Q30 -20 30 -8 L30 0 Z" fill="#e63946" stroke={INK} strokeWidth={1.6} />
    <path d="M-36 -6 Q-36 -22 -16 -22 L-16 -6 Z" fill="#9fc3d8" />
    <rect x={28} y={-18} width={70} height={7} fill="#e63946" stroke={INK} strokeWidth={1.2} />
    <ellipse cx={98} cy={-18} rx={4} ry={14 * Math.abs(Math.sin(frame * 1.3))} fill="#ccc" />
    <rect x={-6} y={-36} width={6} height={8} fill="#333" />
    <ellipse cx={-3} cy={-37} rx={70 * Math.abs(Math.cos(frame * 0.9)) + 10} ry={3} fill="#555" opacity={0.6} />
    <path d="M-34 8 L24 8 M-24 0 L-26 8 M14 0 L16 8" stroke="#333" strokeWidth={2.4} />
    <line x1={-8} y1={8} x2={-8} y2={60} stroke="#ddd" strokeWidth={1.4} strokeDasharray="4 3" />
  </g>
);

// Inflatable rescue boat with two rescuers (orange vests).
export const RescueBoat = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-60 -6 Q-62 8 -48 10 L52 10 Q64 4 62 -10 Z" fill="#f77f00" stroke={INK} strokeWidth={1.6} />
    {[-20, 20].map((dx) => (
      <g key={dx}>
        <rect x={dx - 8} y={-40} width={16} height={30} rx={4} fill="#ff9f1c" stroke={INK} strokeWidth={1.2} />
        <circle cx={dx} cy={-48} r={8} fill="#e0a87e" stroke={INK} strokeWidth={1.2} />
        <path d={`M${dx - 9} -52 Q${dx} -62 ${dx + 9} -52 Z`} fill="#fff" stroke={INK} strokeWidth={1} />
      </g>
    ))}
  </g>
);

// Delta-wing fighter (Mirage-like), facing right, with afterburner.
export const Fighter = ({ x, y, scale = 1, angle = 0, burner = 1 }: P & { angle?: number; burner?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`}>
    {burner > 0 && <path d="M-46 -3 L-46 3 L-90 0 Z" fill="#ffb347" opacity={0.85 * burner} />}
    <path d="M-46 -4 L40 -3 L58 0 L40 3 L-46 4 Z" fill="#7d8792" stroke={INK} strokeWidth={1.4} />
    <path d="M-40 0 L6 0 L-36 22 Z" fill="#69737e" stroke={INK} strokeWidth={1.2} />
    <path d="M-40 -2 L-30 -24 L-20 -24 L-24 -3 Z" fill="#69737e" stroke={INK} strokeWidth={1.2} />
    <path d="M18 -3 Q28 -10 38 -3 Z" fill="#9fc3d8" stroke={INK} strokeWidth={1} />
  </g>
);

// Dark forest silhouette.
export const Forest = ({ g, color = "#0d1a14" }: { g: InsetGeom; color?: string }) => (
  <g fill={color}>
    {Array.from({ length: 22 }, (_, i) => {
      const tx = g.x + (i / 21) * g.W;
      const th = (70 + random(`t${i}`) * 70) * g.s;
      return <path key={i} d={`M${tx - 26 * g.s} ${g.ground} L${tx} ${g.ground - th} L${tx + 26 * g.s} ${g.ground} Z`} />;
    })}
    <rect x={g.x} y={g.ground - 4 * g.s} width={g.W} height={g.H} />
  </g>
);

// Rescuer with a torch beam (beam angle in degrees, 0 = right).
export const Searcher = ({ x, y, scale = 1, beam = -10, frame, seed = 0 }: P & { beam?: number; frame: number; seed?: number }) => {
  const a = beam + Math.sin(frame * 0.07 + seed) * 12;
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d={`M8 -44 L${8 + Math.cos(((a - 9) * Math.PI) / 180) * 200} ${-44 + Math.sin(((a - 9) * Math.PI) / 180) * 200} L${8 + Math.cos(((a + 9) * Math.PI) / 180) * 200} ${-44 + Math.sin(((a + 9) * Math.PI) / 180) * 200} Z`} fill="#fff6c2" opacity={0.22} />
      <rect x={-8} y={-50} width={16} height={30} rx={4} fill="#c8d63a" stroke={INK} strokeWidth={1.2} />
      <rect x={-8} y={-36} width={16} height={4} fill="#ddd" />
      <rect x={-7} y={-20} width={6} height={20} fill="#2b2b36" />
      <rect x={1} y={-20} width={6} height={20} fill="#2b2b36" />
      <circle cx={0} cy={-58} r={8} fill="#e0a87e" stroke={INK} strokeWidth={1.2} />
      <path d="M-9 -60 Q0 -72 9 -60 Z" fill="#c8d63a" stroke={INK} strokeWidth={1} />
      <rect x={6} y={-46} width={6} height={4} fill="#ffe066" />
    </g>
  );
};

// Ro-ro ferry, facing right. (x = centre, y = waterline)
export const Ferry = ({ x, y, scale = 1 }: P) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-170 -30 L170 -30 L150 10 L-160 10 Z" fill="#f1f1f1" stroke={INK} strokeWidth={1.8} />
    <rect x={-170} y={-8} width={330} height={10} fill="#1d4e89" />
    <rect x={-130} y={-70} width={240} height={40} fill="#f7f7f7" stroke={INK} strokeWidth={1.6} />
    <rect x={-90} y={-100} width={150} height={30} fill="#f7f7f7" stroke={INK} strokeWidth={1.6} />
    {Array.from({ length: 11 }, (_, i) => (
      <rect key={i} x={-122 + i * 21} y={-60} width={13} height={12} fill="#2c3e50" />
    ))}
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-82 + i * 22} y={-92} width={13} height={11} fill="#2c3e50" />
    ))}
    <rect x={20} y={-128} width={22} height={28} fill="#e63946" stroke={INK} strokeWidth={1.4} />
  </g>
);

// Small rescue/tug boat, facing left.
export const Tug = ({ x, y, scale = 1, color = "#ff9f1c" }: P & { color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M-50 -14 L50 -14 L40 6 L-42 6 Z" fill={color} stroke={INK} strokeWidth={1.6} />
    <rect x={-10} y={-36} width={36} height={22} fill="#fff" stroke={INK} strokeWidth={1.4} />
    <rect x={-4} y={-30} width={10} height={8} fill="#2c3e50" />
    <rect x={10} y={-30} width={10} height={8} fill="#2c3e50" />
  </g>
);

// Parliament hemicycle: n seats, the first `yes` share lit in `yesColor`, rest in `noColor`, filling as k → 1.
export const Hemicycle = ({ x, y, r, s, yes, no, k }: { x: number; y: number; r: number; s: number; yes: number; no: number; k: number }) => {
  const total = 40 * 5;
  const rows = 5;
  const dots: { px: number; py: number; i: number }[] = [];
  let i = 0;
  for (let row = 0; row < rows; row++) {
    const rr = r * (0.5 + row * 0.12);
    const n = 28 + row * 6;
    for (let j = 0; j < n; j++) {
      const a = Math.PI - (j / (n - 1)) * Math.PI;
      dots.push({ px: x + Math.cos(a) * rr, py: y - Math.sin(a) * rr, i: i++ });
    }
  }
  dots.sort((a, b) => Math.atan2(b.py - y, b.px - x) - Math.atan2(a.py - y, a.px - x));
  const shown = Math.round(dots.length * k);
  const yesN = Math.round((dots.length * yes) / (yes + no));
  void total;
  return (
    <g>
      {dots.map((d, idx) => (
        <circle key={d.i} cx={d.px} cy={d.py} r={6 * s} fill={idx >= shown ? "#3a4255" : idx < yesN ? "#3fb950" : "#ff3b30"} stroke="#0b1426" strokeWidth={1 * s} />
      ))}
    </g>
  );
};

// Hillside with a timber-framed mine entrance. (x = entrance centre, y = ground)
export const MineHill = ({ g, x, collapse, frame }: { g: InsetGeom; x: number; collapse: number; frame: number }) => {
  const s = g.s;
  const shake = collapse > 0 && collapse < 1 ? Math.sin(frame * 2.1) * 3 * s : 0;
  return (
    <g transform={`translate(${shake},0)`}>
      <path d={`M${g.x} ${g.ground} L${g.x} ${g.y + 120 * s} Q${g.x + g.W * 0.35} ${g.y + 40 * s} ${g.x + g.W * 0.7} ${g.y + 90 * s} L${g.x + g.W} ${g.y + 150 * s} L${g.x + g.W} ${g.ground} Z`} fill="#5c4632" stroke={INK} strokeWidth={1.6 * s} />
      <path d={`M${g.x} ${g.y + 140 * s} Q${g.x + g.W * 0.35} ${g.y + 60 * s} ${g.x + g.W * 0.7} ${g.y + 110 * s} L${g.x + g.W} ${g.y + 170 * s}`} stroke="#3f7a3a" strokeWidth={22 * s} fill="none" />
      <path d={`M${x - 50 * s} ${g.ground} L${x - 50 * s} ${g.ground - 100 * s} L${x + 50 * s} ${g.ground - 100 * s} L${x + 50 * s} ${g.ground} Z`} fill="#120c08" />
      <path d={`M${x - 58 * s} ${g.ground} L${x - 58 * s} ${g.ground - 108 * s} L${x + 58 * s} ${g.ground - 108 * s} L${x + 58 * s} ${g.ground}`} stroke="#8a6a3e" strokeWidth={12 * s} fill="none" />
      {collapse > 0 &&
        Array.from({ length: 26 }, (_, i) => {
          const fall = Math.min(1, collapse * 1.4 - random(`d${i}`) * 0.4);
          if (fall <= 0) return null;
          const rx = x + (random(`x${i}`) - 0.5) * 220 * s;
          const ry = g.y + 60 * s + fall * (g.ground - 40 * s - random(`y${i}`) * 70 * s - g.y - 60 * s);
          const rr = (10 + random(`r${i}`) * 16) * s;
          return <circle key={i} cx={rx} cy={ry} r={rr} fill={i % 3 ? "#7a5c40" : "#5c4632"} stroke={INK} strokeWidth={1 * s} />;
        })}
      {collapse > 0.3 && <ellipse cx={x} cy={g.ground - 30 * s} rx={160 * s * collapse} ry={50 * s * collapse} fill="#a08868" opacity={0.45 * (1 - Math.max(0, collapse - 0.7))} />}
    </g>
  );
};

// Rescuer in helmet and vest (for the mine).
export const Rescuer = ({ x, y, scale = 1, shovel = 0 }: P & { shovel?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x={-9} y={-52} width={18} height={32} rx={4} fill="#ff9f1c" stroke={INK} strokeWidth={1.2} />
    <rect x={-9} y={-40} width={18} height={4} fill="#eee" />
    <rect x={-8} y={-20} width={7} height={20} fill="#33415c" />
    <rect x={1} y={-20} width={7} height={20} fill="#33415c" />
    <circle cx={0} cy={-60} r={8} fill="#b9784f" stroke={INK} strokeWidth={1.2} />
    <path d="M-10 -62 Q0 -76 10 -62 Z" fill="#ffd60a" stroke={INK} strokeWidth={1} />
    <g transform={`rotate(${-30 + shovel * 40} 8 -44)`}>
      <line x1={8} y1={-44} x2={34} y2={-6} stroke="#7a5a3a" strokeWidth={3} />
      <path d="M30 -10 L42 -2 L36 6 L26 0 Z" fill="#8d939b" stroke={INK} strokeWidth={1} />
    </g>
  </g>
);

// Rotating typhoon spiral (screen units). `k` fades/scales it in.
export const Spiral = ({ x, y, r, k, frame }: { x: number; y: number; r: number; k: number; frame: number }) => {
  if (k <= 0) return null;
  const rot = -frame * 2.2;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={Math.min(1, k)}>
      <defs>
        <radialGradient id="tycloud">
          <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
          <stop offset="0.55" stopColor="#f2f5f8" stopOpacity={0.7} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 0.75} fill="url(#tycloud)" />
      <g style={{ filter: `blur(${r * 0.035}px)` }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} transform={`rotate(${i * 60})`} d={`M${r * 0.15} 0 Q${r * 0.7} ${-r * 0.2} ${r * 0.95} ${r * 0.35} Q${r * 1.05} ${r * 0.8} ${r * 0.55} ${r * 1.15}`} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={r * 0.2} fill="none" strokeLinecap="round" />
        ))}
      </g>
      <circle r={r * 0.09} fill="#1b2b44" stroke="#dfe7ef" strokeWidth={r * 0.05} />
    </g>
  );
};
