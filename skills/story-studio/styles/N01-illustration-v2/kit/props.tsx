import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { COSTUME, Glow, PAL, Ridge, type Costume } from "../../../components/Scene";

// Props and figures for house illustration style v2, built on the template's components/Scene.tsx (Depth, Ridge,
// Grass, Glow, Fighter, Banner, Shot, impactAt): backdrop, buildings, fire, smoke, war elephants, arrow volleys,
// dust, ladders. Everything takes the panel geometry `g` (or a scale `s` = g.s) so it works at any panel size.
export type G = InsetGeom;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const RED = "#ff3b30";
export const GOLD = "#ffc94a";

// Costumes: the template presets plus a few common ones (house method: jacket / sash / pants / head).
export const C: Record<string, Costume> = {
  ...COSTUME,
  siamRed: { jacket: "#8a2a1e", sash: PAL.gilt, pants: "#2a2420", head: "short" },
  prince: { jacket: "#9a2a1e", sash: PAL.gilt, pants: "#2a2420", head: "crown", headColor: PAL.gilt },
  burmaRed: { jacket: "#7a2a22", sash: PAL.gilt, pants: "#3a2a22", head: "wrap", headColor: "#efe6d0" },
  khmer: { jacket: "#6b4a2a", sash: PAL.gilt, pants: "#3a2a1a", head: "short" },
  villager: { jacket: "#8a7a5a", sash: "#5b6e4a", pants: "#3a2f26", head: "short" },
  villagerW: { jacket: "#a8322a", sash: "#d9a93a", pants: "#5a3a2a", head: "wrap", headColor: "#3a2a22" },
};

// Sky presets [top, bottom] for <Stage sky>.
export const DAY: [string, string] = ["#6f8fb8", "#f2c98a"];
export const DUSK: [string, string] = ["#3a2a5a", "#e0875a"];
export const NIGHT: [string, string] = ["#0b1026", "#2a2a4a"];
export const DAWN: [string, string] = ["#4a5a8a", "#f6b880"];

// Drifting cloud banks in the upper sky (far layer, slow).
export const Clouds = ({ g, pan = 0, color = "#ffffff", opacity = 0.18, n = 5 }: { g: G; pan?: number; color?: string; opacity?: number; n?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const span = g.W + 400 * g.s;
        const cx = g.x - 200 * g.s + ((i * span) / n + frame * (0.3 + i * 0.08) * g.s + pan * 0.15) % span;
        return <ellipse key={i} cx={cx} cy={g.y + g.H * (0.14 + (i % 3) * 0.09)} rx={(150 + (i % 2) * 60) * g.s} ry={22 * g.s} fill={color} opacity={opacity} />;
      })}
    </g>
  );
};

// Sky light + far and mid ridges (+ a pale distant range on tall 9:16 panels) + mist band + ground. light: sun/moon/fire position (fractions of the panel).
export const Backdrop = ({ g, pan, light = [0.8, 0.25], lightColor, far = "#7a6a8a", mid = "#4f5a48", ground = PAL.earth, mist = "#f3d9b0", ridges = true }: { g: G; pan: number; light?: [number, number] | null; lightColor?: [string, string]; far?: string; mid?: string; ground?: string; mist?: string; ridges?: boolean }) => (
  <g>
    {light && <Glow x={g.x + g.W * light[0] + pan * 0.1} y={g.y + g.H * light[1]} s={g.s} color={lightColor?.[0]} core={lightColor?.[1]} />}
    {ridges && g.vertical && g.H / g.s > 500 && <g opacity={0.5}><Ridge g={g} base={g.ground - 190 * g.s} amp={90 * g.s} seed={5.1} color={far} shift={pan * 0.1} /></g>}
    {ridges && <Ridge g={g} base={g.ground - 90 * g.s} amp={50 * g.s} seed={g.W % 7} color={far} shift={pan * 0.2} />}
    {ridges && <Ridge g={g} base={g.ground - 40 * g.s} amp={34 * g.s} seed={3.3} color={mid} shift={pan * 0.5} />}
    <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={50 * g.s} fill={mist} opacity={0.22} />
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={g.H} fill={ground} />
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={6 * g.s} fill="#8a6c45" opacity={0.8} />
  </g>
);

// Flames (animated), base at (x, y), height h px.
export const Fire = ({ x, y, h, seed = 0 }: { x: number; y: number; h: number; seed?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.35 + seed;
  const w = h * 0.55;
  const tongue = (k: number, c: string, o: number) => {
    const sway = Math.sin(t + k) * w * 0.18;
    const top = h * (0.75 + 0.25 * Math.sin(t * 1.7 + k * 2));
    return <path d={`M${x - w * k} ${y} Q${x - w * k * 0.9 + sway} ${y - top * 0.5} ${x + sway * 1.4} ${y - top} Q${x + w * k * 0.9 + sway} ${y - top * 0.5} ${x + w * k} ${y} Z`} fill={c} opacity={o} />;
  };
  return (
    <g>
      <circle cx={x} cy={y - h * 0.4} r={h * 0.9} fill="#ff8a2a" opacity={0.18} />
      {tongue(1, "#c9302c", 0.9)}
      {tongue(0.7, "#ff8a2a", 0.95)}
      {tongue(0.4, "#ffd25a", 0.95)}
    </g>
  );
};

// Smoke column rising from (x, y).
export const Smoke = ({ x, y, s, n = 6, dark = false }: { x: number; y: number; s: number; n?: number; dark?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const age = (frame * 0.8 + i * 18) % 110;
        return <circle key={i} cx={x + Math.sin(age * 0.05 + i) * 14 * s + age * 0.4 * s} cy={y - age * 1.6 * s} r={(10 + age * 0.35) * s} fill={dark ? "#3a3530" : "#d9d2c6"} opacity={0.5 * (1 - age / 110)} />;
      })}
    </g>
  );
};

// City wall with bai sema merlons; optional gate at gateAt (fraction of w). Base-left (x, y), height h.
export const PalaceWall = ({ x, y, w, h, s, gateAt, gateOpen = 0, color = PAL.chalk }: { x: number; y: number; w: number; h: number; s: number; gateAt?: number; gateOpen?: number; color?: string }) => {
  const n = Math.max(2, Math.floor(w / (26 * s)));
  const gx = gateAt !== undefined ? x + w * gateAt : 0;
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={color} stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x + 3 * s + i * (w / n)} ${y - h} l0 ${-10 * s} q${(w / n - 6 * s) / 2} ${-16 * s} ${w / n - 6 * s} 0 l0 ${10 * s} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
      ))}
      {gateAt !== undefined && (
        <g>
          <path d={`M${gx - 24 * s} ${y} l0 ${-h * 0.7} q${24 * s} ${-26 * s} ${48 * s} 0 l0 ${h * 0.7} Z`} fill="#2a1a10" stroke={PAL.ink} strokeWidth={2 * s} />
          <rect x={gx - 24 * s} y={y - h * 0.7} width={24 * s * (1 - gateOpen)} height={h * 0.7} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.4 * s} />
          <rect x={gx + 24 * s * gateOpen} y={y - h * 0.7} width={24 * s * (1 - gateOpen)} height={h * 0.7} fill="#7a4a22" stroke={PAL.ink} strokeWidth={1.4 * s} />
          <path d={`M${gx - 34 * s} ${y - h * 0.7 - 20 * s} L${gx} ${y - h - 46 * s} L${gx + 34 * s} ${y - h * 0.7 - 20 * s} Z`} fill={PAL.ochre} stroke={PAL.ink} strokeWidth={1.6 * s} />
        </g>
      )}
    </g>
  );
};

// Khmer-style prang, base centre (x, y), height h.
export const Prang = ({ x, y, h, s, color = PAL.chalk, gold = false }: { x: number; y: number; h: number; s: number; color?: string; gold?: boolean }) => {
  const w = h * 0.36;
  return (
    <g>
      <rect x={x - w * 0.75} y={y - h * 0.16} width={w * 1.5} height={h * 0.16} fill={color} stroke={PAL.ink} strokeWidth={1.8 * s} />
      {Array.from({ length: 5 }, (_, i) => {
        const tw = w * (1 - i * 0.16);
        const ty = y - h * 0.16 - i * h * 0.13;
        return <path key={i} d={`M${x - tw / 2} ${ty} Q${x - tw * 0.52} ${ty - h * 0.07} ${x - tw * 0.42} ${ty - h * 0.13} L${x + tw * 0.42} ${ty - h * 0.13} Q${x + tw * 0.52} ${ty - h * 0.07} ${x + tw / 2} ${ty} Z`} fill={i % 2 ? color : "#e6dcc4"} stroke={PAL.ink} strokeWidth={1.5 * s} />;
      })}
      <path d={`M${x - w * 0.14} ${y - h * 0.81} L${x} ${y - h} L${x + w * 0.14} ${y - h * 0.81} Z`} fill={gold ? PAL.gilt : "#cfc6b0"} stroke={PAL.ink} strokeWidth={1.4 * s} />
      <rect x={x - w * 0.1} y={y - h * 0.5} width={w * 0.2} height={h * 0.12} fill="#2a1a10" opacity={0.6} />
    </g>
  );
};

// Stilted wooden house (base-left x, ground y); burn 0–1 sets it on fire.
export const House = ({ x, y, w, s, burn = 0 }: { x: number; y: number; w: number; s: number; burn?: number }) => (
  <g>
    {[0.1, 0.5, 0.9].map((f) => <rect key={f} x={x + w * f - 3 * s} y={y - w * 0.3} width={6 * s} height={w * 0.3} fill="#4a2f18" />)}
    <rect x={x} y={y - w * 0.62} width={w} height={w * 0.32} fill={burn > 0.6 ? "#3a2a1a" : "#8a5a32"} stroke={PAL.ink} strokeWidth={1.8 * s} />
    <path d={`M${x - w * 0.12} ${y - w * 0.6} L${x + w / 2} ${y - w * 1.02} L${x + w * 1.12} ${y - w * 0.6} Z`} fill={burn > 0.6 ? "#2a1f18" : "#6b4a2a"} stroke={PAL.ink} strokeWidth={1.8 * s} />
    {burn > 0 && <Fire x={x + w / 2} y={y - w * 0.62} h={w * 0.9 * burn} seed={x} />}
  </g>
);

// Sharpened stakes (camp / stockade), from x over w.
export const Palisade = ({ x, y, w, s, color = "#8a5a32" }: { x: number; y: number; w: number; s: number; color?: string }) => (
  <g>
    {Array.from({ length: Math.floor(w / (16 * s)) }, (_, i) => (
      <path key={i} d={`M${x + i * 16 * s} ${y} l0 ${-56 * s} l${6 * s} ${-10 * s} l${6 * s} ${10 * s} l0 ${56 * s} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.5 * s} />
    ))}
  </g>
);

// Bamboo ladder against a wall, from (x, y) up to height h, leaning `lean` px.
export const Ladder = ({ x, y, h, s, lean = 30 }: { x: number; y: number; h: number; s: number; lean?: number }) => (
  <g stroke="#7a5a32" strokeWidth={4 * s} strokeLinecap="round">
    <line x1={x} y1={y} x2={x + lean * s} y2={y - h} />
    <line x1={x + 22 * s} y1={y} x2={x + 22 * s + lean * s} y2={y - h} />
    {Array.from({ length: Math.floor(h / (20 * s)) }, (_, i) => {
      const k = (i + 1) / (h / (20 * s));
      return <line key={i} x1={x + lean * s * k} y1={y - h * k} x2={x + 22 * s + lean * s * k} y2={y - h * k} strokeWidth={3 * s} />;
    })}
  </g>
);

// Dust cloud kicked up by a crowd (k 0–1 strength).
export const Dust = ({ x, y, s, k = 1, n = 9, color = "#d8b98a" }: { x: number; y: number; s: number; k?: number; n?: number; color?: string }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + (i - n / 2) * 34 * s + Math.sin(frame * 0.03 + i) * 10 * s} cy={y - (i % 3) * 18 * s - 20 * s} r={(40 + (i % 4) * 14) * s * (0.6 + 0.4 * k)} fill={color} opacity={0.38 * k} />
      ))}
    </g>
  );
};

// Arrows flying on an arc from x0 to x1 (panel px), launched at frame `at`.
export const Volley = ({ at, x0, x1, y, s, n = 10, seed = 1, h = 120 }: { at: number; x0: number; x1: number; y: number; s: number; n?: number; seed?: number; h?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = interpolate(frame, [at + i * 2, at + 24 + i * 2], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        const sx = x0 + ((i * 37 + seed) % 60) * s - 30 * s;
        const ex = x1 + ((i * 53 + seed) % 120) * s - 60 * s;
        const dir = ex > sx ? 1 : -1;
        const ax = sx + (ex - sx) * t;
        const ay = y - Math.sin(t * Math.PI) * h * s;
        const ang = (Math.atan2(-Math.cos(t * Math.PI) * h * s * Math.PI, ex - sx) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${ax},${ay}) rotate(${ang})`}>
            <line x1={-12 * s * dir} y1={0} x2={12 * s * dir} y2={0} stroke="#3a2a1a" strokeWidth={1.8 * s} />
            <path d={`M${12 * s * dir} 0 l${-4 * s * dir} ${-2.5 * s} l0 ${5 * s} Z`} fill="#cfd3d6" />
          </g>
        );
      })}
    </g>
  );
};

const GREY = "#8c8781";
const GREY_D = "#6c6762";
// War elephant, side view facing right (flip = facing left). Feet at (x, y). s ≈ 0.38·g.s for a panel.
// walk 0–1 leg cycle, trumpet 0–1 trunk up, swing 0–1 the king's ngao sweeps down; rider: king | rider | none.
export const Elephant = ({ x, y, s, flip = false, walk = 0, trumpet = 0, swing = 0, cloth = PAL.ochre, trim = PAL.gilt, crown = PAL.gilt, rider = "king", phase = 0, riderCostume }: { x: number; y: number; s: number; flip?: boolean; walk?: number; trumpet?: number; swing?: number; cloth?: string; trim?: string; crown?: string; rider?: "king" | "rider" | "none"; phase?: number; riderCostume?: Costume }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.16 + phase;
  const leg = (lx: number, ph: number, back: boolean) => {
    const a = Math.sin(t + ph) * 16 * walk;
    const k = Math.max(0, Math.sin(t + ph + 1)) * 18 * walk;
    return (
      <g key={lx} transform={`rotate(${a},${lx},-100)`} opacity={back ? 0.85 : 1}>
        <path d={`M${lx - 17} -110 L${lx + 17} -110 L${lx + 15} -52 L${lx - 15} -52 Z`} fill={back ? GREY_D : GREY} stroke={PAL.ink} strokeWidth={3} />
        <g transform={`rotate(${-k},${lx},-54)`}>
          <path d={`M${lx - 15} -56 L${lx + 15} -56 L${lx + 16} -4 L${lx - 16} -4 Z`} fill={back ? GREY_D : GREY} stroke={PAL.ink} strokeWidth={3} />
          <ellipse cx={lx} cy={-3} rx={19} ry={6} fill="#4a4642" />
        </g>
      </g>
    );
  };
  const segs = Array.from({ length: 6 }, (_, i) => interpolate(trumpet, [0, 1], [8 + Math.sin(t * 0.8 + i * 0.5) * 6 * (i / 5), -38 - i * 6], clamp));
  let px = 168;
  let py = -170;
  const pts: [number, number][] = [[px, py]];
  let ang = 90;
  segs.forEach((d, i) => {
    ang += d;
    const r = (ang * Math.PI) / 180;
    const len = 26 - i * 2;
    px += Math.cos(r) * len;
    py += Math.sin(r) * len;
    pts.push([px, py]);
  });
  const ear = Math.sin(frame * 0.12 + phase) * 6;
  const bob = Math.abs(Math.sin(t)) * 4 * walk;
  const ngao = -40 + swing * 120;
  const rc = riderCostume ?? { jacket: cloth, sash: trim, pants: "#2a2420", head: "short" as const };
  const trunk = `M${pts.map((p) => p.join(",")).join(" L")}`;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={2} rx={170} ry={14} fill="#000" opacity={0.25} />
      <g transform={`translate(0,${-bob})`}>
        {leg(-85, 3.1, true)}
        {leg(80, 0, true)}
        <path d="M-150 -150 Q-160 -235 -60 -250 Q40 -262 120 -230 Q150 -205 148 -150 Q120 -96 20 -100 L-110 -100 Q-150 -105 -150 -150 Z" fill={GREY} stroke={PAL.ink} strokeWidth={4} />
        <path d="M-158 -170 Q-178 -150 -170 -120" stroke={PAL.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M-95 -248 Q20 -262 100 -236 L92 -150 Q10 -138 -88 -148 Z" fill={cloth} stroke={PAL.ink} strokeWidth={3.5} />
        <path d="M-88 -150 Q10 -140 92 -152 L90 -138 Q10 -126 -86 -136 Z" fill={trim} stroke={PAL.ink} strokeWidth={2} />
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-70 + i * 26} cy={-142 + Math.sin(i) * 2} r={5} fill={trim} stroke={PAL.ink} strokeWidth={1.5} />)}
        {leg(-55, 0, false)}
        {leg(108, 3.1, false)}
        <path d="M100 -232 Q170 -250 190 -190 Q196 -150 168 -150 Q130 -150 110 -170 Z" fill={GREY} stroke={PAL.ink} strokeWidth={4} />
        <path d={`M120 -222 Q${84 - ear} -210 ${90 - ear} -160 Q110 -150 132 -170 Z`} fill={GREY_D} stroke={PAL.ink} strokeWidth={3.5} />
        <path d="M140 -238 Q165 -246 182 -222 L176 -210 Q160 -228 140 -226 Z" fill={trim} stroke={PAL.ink} strokeWidth={2.5} />
        <circle cx={170} cy={-200} r={4} fill={PAL.ink} />
        <path d={trunk} stroke={PAL.ink} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={trunk} stroke={GREY} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M176 -162 Q222 -150 236 -186 Q214 -164 178 -172 Z" fill="#f4eedf" stroke={PAL.ink} strokeWidth={2.5} />
        {rider !== "none" && (
          <g>
            {rider === "king" && (
              <g transform="translate(-40,-252)">
                <path d="M-10 0 Q-12 -30 -8 -50 L8 -50 Q12 -30 10 0 Z" fill={rc.jacket} stroke={PAL.ink} strokeWidth={2.5} />
                <circle cx={0} cy={-62} r={10} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
              </g>
            )}
            <g transform="translate(78,-250)">
              <path d="M-14 0 Q-16 -38 -10 -64 L12 -64 Q16 -38 14 0 Z" fill={rc.jacket} stroke={PAL.ink} strokeWidth={3} />
              <path d="M-12 -40 L12 -36 L12 -30 L-12 -34 Z" fill={rc.sash} />
              <circle cx={0} cy={-78} r={12} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2.5} />
              {rider === "king" ? <path d="M-12 -84 L0 -122 L12 -84 Z" fill={crown} stroke={PAL.ink} strokeWidth={2} /> : <path d="M-12 -82 Q0 -98 12 -82 Z" fill="#1f1712" />}
              {rider === "king" && (
                <g transform={`rotate(${ngao},6,-56)`}>
                  <line x1={-60} y1={-56} x2={170} y2={-56} stroke="#5a3a1f" strokeWidth={6} strokeLinecap="round" />
                  <path d="M168 -66 Q214 -76 226 -52 Q200 -58 168 -46 Z" fill="#d7dbde" stroke={PAL.ink} strokeWidth={2.5} />
                  <path d="M8 -62 L22 -62 L22 -50 L8 -50 Z" fill={trim} />
                </g>
              )}
              <path d="M-4 -60 L26 -58" stroke={PAL.skin} strokeWidth={8} strokeLinecap="round" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};
