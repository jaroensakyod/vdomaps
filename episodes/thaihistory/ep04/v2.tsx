import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { Banner, COSTUME, Depth, Fighter, Glow, Grass, impactAt, PAL, Ridge, type Costume } from "../../../components/Scene";
import { clamp, GOLD, Panel } from "../news/kit";

// Episode 4 scene kit, built on the house style v2 (components/Scene.tsx): one wrapper per panel, Thonburi-era
// buildings, monks, nobles, boats, fire, manuscripts and a nang yai stage. Chapters compose scenes from these.

// Costumes for this story (house method, new presets).
export const C: Record<string, Costume> = {
  ...COSTUME,
  guard: { jacket: "#7a1f1a", sash: PAL.gilt, pants: "#2a2420", head: "short" } as Costume,
  rebel: { jacket: "#5a4a3a", sash: PAL.ochre, pants: "#3a2a22", head: "wrap", headColor: "#8a6a4a" } as Costume,
  villager: { jacket: "#8a7a5a", sash: "#5b6e4a", pants: "#3a2f26", head: "short" } as Costume,
  lao: { jacket: "#2a3a2a", sash: "#3fbf6a", pants: "#2a2420", head: "topknot" } as Costume,
  viet: { jacket: "#1f3f5f", sash: "#c9302c", pants: "#1a1a1a", head: "wrap", headColor: "#1a1a1a" } as Costume,
  khmer: { jacket: "#6b4a2a", sash: PAL.gilt, pants: "#3a2a1a", head: "short" } as Costume,
};

export type G = InsetGeom;

// One illustrated panel: Panel (leader line, label) + Depth (push-in, pan, shake on `hits`, warm light, grain).
// children get the geometry, the pan offset (×0.2 far, ×0.5 mid, ×0.7 near, ×1.6 foreground) and local time.
export const V2 = ({ id, anchor, start, end, sky, accent = GOLD, hits = [], warm = 0.08, children }: { id: string; anchor: [number, number]; start: number; end: number; sky: [string, string]; accent?: string; hits?: number[]; warm?: number; children: (g: G, pan: number, lt: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={sky} accent={accent}>
      {(g) => (
        <Depth g={g} id={id} start={start} end={end} impact={impactAt(frame, hits)} warm={warm}>
          {(pan) => children(g, pan, frame - start)}
        </Depth>
      )}
    </Panel>
  );
};

// Sky light + far and mid ridges + mist band + ground. light: sun/moon/fire position (fractions of the panel).
export const Backdrop = ({ g, pan, light = [0.8, 0.25], lightColor, far = "#7a6a8a", mid = "#4f5a48", ground = PAL.earth, mist = "#f3d9b0", ridges = true }: { g: G; pan: number; light?: [number, number] | null; lightColor?: [string, string]; far?: string; mid?: string; ground?: string; mist?: string; ridges?: boolean }) => (
  <g>
    {light && <Glow x={g.x + g.W * light[0] + pan * 0.1} y={g.y + g.H * light[1]} s={g.s} color={lightColor?.[0]} core={lightColor?.[1]} />}
    {ridges && <Ridge g={g} base={g.ground - 90 * g.s} amp={50 * g.s} seed={g.W % 7} color={far} shift={pan * 0.2} />}
    {ridges && <Ridge g={g} base={g.ground - 40 * g.s} amp={34 * g.s} seed={3.3} color={mid} shift={pan * 0.5} />}
    <rect x={g.x} y={g.ground - 70 * g.s} width={g.W} height={50 * g.s} fill={mist} opacity={0.22} />
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={g.H} fill={ground} />
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={6 * g.s} fill="#8a6c45" opacity={0.8} />
  </g>
);

// River band across the panel with moving ripples (top edge at y).
export const River = ({ g, y, pan = 0, color = "#3d6f8f", night = false }: { g: G; y: number; pan?: number; color?: string; night?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={g.x - 100 * g.s} y={y} width={g.W + 200 * g.s} height={g.y + g.H - y} fill={color} />
      <rect x={g.x - 100 * g.s} y={y} width={g.W + 200 * g.s} height={4 * g.s} fill={night ? "#9fc3e0" : "#cfe6f0"} opacity={0.5} />
      {Array.from({ length: 14 }, (_, i) => {
        const rx = g.x + ((i * 97 + frame * 1.2 + pan * 0.7) % (g.W + 80 * g.s)) - 40 * g.s;
        const ry = y + (10 + (i % 4) * 9) * g.s;
        return <path key={i} d={`M${rx} ${ry} q${10 * g.s} ${-4 * g.s} ${20 * g.s} 0`} stroke="#e8f4f8" strokeWidth={1.6 * g.s} fill="none" opacity={night ? 0.35 : 0.5} />;
      })}
    </g>
  );
};

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

// Thai palace / city wall with bai sema merlons; optional gate at gateAt (fraction of w).
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

// Khmer-style prang (Wat Arun / Wat Chaeng), base centre (x, y), height h.
export const Prang = ({ x, y, h, s, color = PAL.chalk, gold = false }: { x: number; y: number; h: number; s: number; color?: string; gold?: boolean }) => {
  const w = h * 0.36;
  const tiers = 5;
  return (
    <g>
      <rect x={x - w * 0.75} y={y - h * 0.16} width={w * 1.5} height={h * 0.16} fill={color} stroke={PAL.ink} strokeWidth={1.8 * s} />
      {Array.from({ length: tiers }, (_, i) => {
        const tw = w * (1 - i * 0.16);
        const ty = y - h * 0.16 - i * h * 0.13;
        return <path key={i} d={`M${x - tw / 2} ${ty} Q${x - tw * 0.52} ${ty - h * 0.07} ${x - tw * 0.42} ${ty - h * 0.13} L${x + tw * 0.42} ${ty - h * 0.13} Q${x + tw * 0.52} ${ty - h * 0.07} ${x + tw / 2} ${ty} Z`} fill={i % 2 ? color : "#e6dcc4"} stroke={PAL.ink} strokeWidth={1.5 * s} />;
      })}
      <path d={`M${x - w * 0.14} ${y - h * 0.81} L${x} ${y - h} L${x + w * 0.14} ${y - h * 0.81} Z`} fill={gold ? PAL.gilt : "#cfc6b0"} stroke={PAL.ink} strokeWidth={1.4 * s} />
      <rect x={x - w * 0.1} y={y - h * 0.5} width={w * 0.2} height={h * 0.12} fill="#2a1a10" opacity={0.6} />
    </g>
  );
};

// Ordination hall / palace hall with stacked roofs and chofa finials; base-left (x, y), width w.
export const Hall = ({ x, y, w, s, roof = PAL.ochre, wall = PAL.chalk, glow = 0 }: { x: number; y: number; w: number; s: number; roof?: string; wall?: string; glow?: number }) => {
  const wh = w * 0.32;
  return (
    <g>
      <rect x={x} y={y - wh} width={w} height={wh} fill={wall} stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={x + w * (0.12 + i * 0.21)} y={y - wh * 0.8} width={w * 0.08} height={wh * 0.6} fill={glow > 0 ? "#ffcf7a" : "#3a2414"} opacity={glow > 0 ? 0.5 + glow * 0.5 : 0.8} />
      ))}
      {[0, 1, 2].map((i) => {
        const inset = i * w * 0.12;
        const ry = y - wh - i * w * 0.1;
        return <path key={i} d={`M${x - w * 0.06 + inset} ${ry} L${x + w * 0.2 + inset * 0.4} ${ry - w * 0.16} L${x + w * 0.8 - inset * 0.4} ${ry - w * 0.16} L${x + w * 1.06 - inset} ${ry} Z`} fill={roof} stroke={PAL.ink} strokeWidth={1.8 * s} />;
      })}
      <path d={`M${x + w * 0.3} ${y - wh - w * 0.36} q${-6 * s} ${-14 * s} ${4 * s} ${-18 * s}`} stroke={PAL.gilt} strokeWidth={3 * s} fill="none" />
      <path d={`M${x + w * 0.7} ${y - wh - w * 0.36} q${6 * s} ${-14 * s} ${-4 * s} ${-18 * s}`} stroke={PAL.gilt} strokeWidth={3 * s} fill="none" />
    </g>
  );
};

// Stilted wooden house (base-left x, ground y).
export const House = ({ x, y, w, s, burn = 0 }: { x: number; y: number; w: number; s: number; burn?: number }) => (
  <g>
    {[0.1, 0.5, 0.9].map((f) => <rect key={f} x={x + w * f - 3 * s} y={y - w * 0.3} width={6 * s} height={w * 0.3} fill="#4a2f18" />)}
    <rect x={x} y={y - w * 0.62} width={w} height={w * 0.32} fill={burn > 0.6 ? "#3a2a1a" : "#8a5a32"} stroke={PAL.ink} strokeWidth={1.8 * s} />
    <path d={`M${x - w * 0.12} ${y - w * 0.6} L${x + w / 2} ${y - w * 1.02} L${x + w * 1.12} ${y - w * 0.6} Z`} fill={burn > 0.6 ? "#2a1f18" : "#6b4a2a"} stroke={PAL.ink} strokeWidth={1.8 * s} />
    {burn > 0 && <Fire x={x + w / 2} y={y - w * 0.62} h={w * 0.9 * burn} seed={x} />}
  </g>
);

// Long boat with n rowers (moving right when dir = 1). Base on the water line y.
export const Boat = ({ x, y, w, s, n = 4, dir = 1, costume = COSTUME.siam, canopy = false, gilt = false }: { x: number; y: number; w: number; s: number; n?: number; dir?: 1 | -1; costume?: Costume; canopy?: boolean; gilt?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${dir},1)`}>
      <path d={`M${-w / 2} ${-14 * s} Q${-w / 2 - 20 * s} ${-30 * s} ${-w / 2 - 26 * s} ${-44 * s} L${-w / 2 + 10 * s} ${-14 * s} Z`} fill={gilt ? PAL.gilt : "#6b3a1a"} stroke={PAL.ink} strokeWidth={1.4 * s} />
      <path d={`M${-w / 2} ${-14 * s} L${w / 2 + 14 * s} ${-18 * s} Q${w / 2} ${4 * s} ${w / 2 - 20 * s} ${4 * s} L${-w / 2 + 14 * s} ${4 * s} Z`} fill={gilt ? "#b8862a" : "#7a4a22"} stroke={PAL.ink} strokeWidth={1.8 * s} />
      {canopy && <path d={`M${-w * 0.1} ${-16 * s} l0 ${-50 * s} l${w * 0.3} 0 l0 ${50 * s} M${-w * 0.16} ${-64 * s} L${w * 0.05} ${-86 * s} L${w * 0.26} ${-64 * s} Z`} fill={PAL.ochre} stroke={PAL.ink} strokeWidth={1.4 * s} />}
      {Array.from({ length: n }, (_, i) => {
        const rx = -w / 2 + 30 * s + i * ((w - 60 * s) / Math.max(1, n - 1)) * (canopy ? 0.45 : 1);
        const stroke = Math.sin(frame * 0.3 + i * 0.6);
        return (
          <g key={i}>
            <line x1={rx} y1={-30 * s} x2={rx - (18 + stroke * 14) * s} y2={16 * s} stroke="#4a2f18" strokeWidth={3 * s} />
            <Fighter x={rx} y={-14 * s} scale={s * 0.62} mode="stand" costume={costume} weapon="none" phase={i} />
          </g>
        );
      })}
    </g>
  );
};

// A monk in a saffron robe (shaved head). mode: stand, walk, sit (cross-legged), kneel (bowing forward by `bow` 0–1).
export const Monk = ({ x, y, scale, mode = "stand", bow = 0, phase = 0, flip = false, robe = "#d9822b" }: { x: number; y: number; scale: number; mode?: "stand" | "walk" | "sit" | "kneel"; bow?: number; phase?: number; flip?: boolean; robe?: string }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.24 + phase;
  const walk = mode === "walk" ? 1 : 0;
  const bob = walk ? -Math.abs(Math.sin(t)) * 3 : Math.sin(frame * 0.07 + phase) * 0.8;
  if (mode === "sit" || mode === "kneel") {
    const b = mode === "kneel" ? bow : 0;
    return (
      <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
        <ellipse cx={0} cy={2} rx={34} ry={5} fill="#000" opacity={0.28} />
        <path d="M-34 0 Q-30 -26 0 -28 Q30 -26 34 0 Z" fill={robe} stroke={PAL.ink} strokeWidth={2.2} />
        <g transform={`rotate(${b * 55},0,-26)`}>
          <path d="M-16 -26 Q-18 -60 -10 -76 L10 -76 Q18 -60 16 -26 Z" fill={robe} stroke={PAL.ink} strokeWidth={2.2} />
          <path d="M-10 -74 Q4 -50 16 -30" stroke="#b5651d" strokeWidth={4} fill="none" />
          <ellipse cx={0} cy={-88 + bob} rx={9} ry={10.5} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
          {mode === "sit" && <path d="M-12 -46 Q0 -38 12 -46" stroke={PAL.skin} strokeWidth={6} fill="none" strokeLinecap="round" />}
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={18} ry={4} fill="#000" opacity={0.28} />
      <g transform={`translate(0,${bob})`}>
        <path d={`M-5 -40 L${-5 + Math.sin(t) * 9 * walk} 0 M5 -40 L${5 - Math.sin(t) * 9 * walk} 0`} stroke={PAL.skin} strokeWidth={6} strokeLinecap="round" />
        <path d="M-15 -104 Q-19 -60 -16 -22 L16 -22 Q19 -60 15 -104 Q0 -110 -15 -104 Z" fill={robe} stroke={PAL.ink} strokeWidth={2.2} />
        <path d="M-14 -102 Q2 -70 15 -30" stroke="#b5651d" strokeWidth={4} fill="none" />
        <ellipse cx={0} cy={-117} rx={9} ry={10.5} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
        <circle cx={5} cy={-117} r={1.4} fill={PAL.ink} />
      </g>
    </g>
  );
};

// A court noble kneeling, sitting or prostrate (mode), facing right; jacket colour.
export const Noble = ({ x, y, scale, mode = "kneel", jacket = "#efe6d0", flip = false, phase = 0, bow = 0 }: { x: number; y: number; scale: number; mode?: "kneel" | "prostrate" | "sit"; jacket?: string; flip?: boolean; phase?: number; bow?: number }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.08 + phase) * 1;
  const lean = mode === "prostrate" ? 70 : mode === "kneel" ? 15 + bow * 45 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={30} ry={5} fill="#000" opacity={0.28} />
      <path d="M-26 0 Q-24 -24 2 -24 L14 -4 L14 0 Z" fill="#3a2a22" stroke={PAL.ink} strokeWidth={2} />
      <g transform={`rotate(${lean},0,-24)`}>
        <path d={`M-12 -24 Q-14 -54 -9 -70 L9 -70 Q14 -54 12 -24 Z`} fill={jacket} stroke={PAL.ink} strokeWidth={2.2} transform={`translate(0,${breathe})`} />
        <path d="M6 -62 L22 -42 L26 -30" stroke={jacket} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M6 -62 L22 -42 L26 -30" stroke={PAL.ink} strokeWidth={1.2} fill="none" />
        <g transform={`translate(0,${-82 + breathe})`}>
          <ellipse cx={0} cy={0} rx={9} ry={10.5} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
          <path d="M-9.5 -2 Q-10 -13 0 -13 Q10 -13 9.5 -2 Q4 -6 -9.5 -2 Z" fill="#1f1712" />
          <circle cx={5} cy={0} r={1.4} fill={PAL.ink} />
        </g>
      </g>
    </g>
  );
};

// A king seated on a raised throne (generic figure, crown point), facing left. `light` 0–1 adds a halo.
export const King = ({ x, y, scale, light = 0 }: { x: number; y: number; scale: number; light?: number }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.07) * 1;
  return (
    <g transform={`translate(${x},${y}) scale(${-scale},${scale})`}>
      {light > 0 && <circle cx={0} cy={-100} r={60} fill="#ffe7b8" opacity={0.3 * light} />}
      <path d="M-46 0 L-40 -40 L40 -40 L46 0 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2.2} />
      <path d="M-30 -40 L-30 -130 Q0 -150 30 -130 L30 -40" fill="#8a2a22" stroke={PAL.ink} strokeWidth={2} />
      <path d="M-20 -40 Q-22 -72 -12 -96 L12 -96 Q22 -72 20 -40 Z" fill="#b8862a" stroke={PAL.ink} strokeWidth={2.2} transform={`translate(0,${breathe})`} />
      <path d="M-24 -42 Q0 -30 24 -42 L20 -34 Q0 -24 -20 -34 Z" fill="#3a2a22" />
      <g transform={`translate(0,${-108 + breathe})`}>
        <ellipse cx={0} cy={0} rx={9} ry={10.5} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
        <path d="M-10 -3 L0 -34 L10 -3 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4} />
        <circle cx={5} cy={0} r={1.4} fill={PAL.ink} />
      </g>
    </g>
  );
};

// Candle with flickering flame.
export const Candle = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const frame = useCurrentFrame();
  const f = 1 + Math.sin(frame * 0.9 + x) * 0.12;
  return (
    <g>
      <circle cx={x} cy={y - 26 * s} r={34 * s * f} fill="#ffcf7a" opacity={0.18} />
      <rect x={x - 3 * s} y={y - 20 * s} width={6 * s} height={20 * s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1 * s} />
      <path d={`M${x} ${y - 20 * s} q${-5 * s} ${-8 * s} 0 ${-16 * s * f} q${5 * s} ${8 * s} 0 ${16 * s * f} Z`} fill="#ffd25a" />
    </g>
  );
};

// Folding manuscript (samut khoi) open on a stand, with ink lines; `fade` 0–1 fades the writing.
export const Manuscript = ({ x, y, w, s, lines = 6, fade = 1, dark = true }: { x: number; y: number; w: number; s: number; lines?: number; fade?: number; dark?: boolean }) => {
  const h = w * 0.36;
  return (
    <g>
      <path d={`M${x} ${y} l${w / 2} ${-8 * s} l${w / 2} ${8 * s} l0 ${-h} l${-w / 2} ${-8 * s} l${-w / 2} ${8 * s} Z`} fill={dark ? "#2a2420" : "#e8dcc0"} stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: lines }, (_, i) => (
        <g key={i} opacity={fade * (1 - (i % 3) * 0.15)}>
          <line x1={x + 10 * s} y1={y - h + 16 * s + i * ((h - 24 * s) / lines)} x2={x + w / 2 - 10 * s} y2={y - h + 12 * s + i * ((h - 24 * s) / lines)} stroke={dark ? "#e8dcc0" : PAL.ink} strokeWidth={2 * s} strokeDasharray={`${6 * s} ${3 * s}`} />
          <line x1={x + w / 2 + 10 * s} y1={y - h + 12 * s + i * ((h - 24 * s) / lines)} x2={x + w - 10 * s} y2={y - h + 16 * s + i * ((h - 24 * s) / lines)} stroke={dark ? "#e8dcc0" : PAL.ink} strokeWidth={2 * s} strokeDasharray={`${5 * s} ${4 * s}`} />
        </g>
      ))}
    </g>
  );
};

// Spears planted / a palisade row (camp), from x over w.
export const Palisade = ({ x, y, w, s, color = "#8a5a32" }: { x: number; y: number; w: number; s: number; color?: string }) => (
  <g>
    {Array.from({ length: Math.floor(w / (16 * s)) }, (_, i) => (
      <path key={i} d={`M${x + i * 16 * s} ${y} l0 ${-56 * s} l${6 * s} ${-10 * s} l${6 * s} ${10 * s} l0 ${56 * s} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.5 * s} />
    ))}
  </g>
);

// A tree (palm or round) for village scenes.
export const Tree = ({ x, y, s, kind = "round" }: { x: number; y: number; s: number; kind?: "round" | "palm" }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.05 + x) * 3 * s;
  return kind === "palm" ? (
    <g>
      <path d={`M${x} ${y} Q${x + 6 * s} ${y - 60 * s} ${x + sway} ${y - 120 * s}`} stroke="#5a4028" strokeWidth={6 * s} fill="none" />
      {[-60, -25, 15, 50, 90].map((a) => <path key={a} d={`M${x + sway} ${y - 120 * s} q${Math.cos((a * Math.PI) / 180) * 30 * s} ${-14 * s} ${Math.cos((a * Math.PI) / 180) * 56 * s} ${Math.abs(Math.sin((a * Math.PI) / 180)) * 20 * s}`} stroke={PAL.green} strokeWidth={7 * s} fill="none" strokeLinecap="round" />)}
    </g>
  ) : (
    <g>
      <rect x={x - 4 * s} y={y - 50 * s} width={8 * s} height={50 * s} fill="#5a4028" />
      <circle cx={x + sway} cy={y - 70 * s} r={34 * s} fill={PAL.green} stroke={PAL.ink} strokeWidth={1.6 * s} />
      <circle cx={x - 18 * s + sway} cy={y - 58 * s} r={22 * s} fill="#4a5c3c" stroke={PAL.ink} strokeWidth={1.2 * s} />
    </g>
  );
};

// ---------- nang yai: shadow puppets on a lit cloth screen ----------
export const Puppet = ({ x, y, s, flip = false, arm = 0, kind = "thai" }: { x: number; y: number; s: number; flip?: boolean; arm?: number; kind?: "thai" | "plain" | "boatman" }) => {
  const holes: [number, number][] = [];
  for (let r = 0; r < 7; r++) for (let c = -2; c <= 2; c++) if ((r + c) % 2 === 0) holes.push([c * 6, -82 + r * 8]);
  for (let i = 0; i < 5; i++) holes.push([-24 + i * 12, -33]);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <line x1={-4} y1={0} x2={-14} y2={90} stroke="#2a1a10" strokeWidth={3} />
      <line x1={22} y1={-78} x2={40} y2={90} stroke="#2a1a10" strokeWidth={2} />
      <path d="M-26 0 L-14 -26 L-6 -20 L-2 0 Z M26 0 L14 -26 L6 -20 L2 0 Z" fill="#100a06" />
      <path d="M-18 -24 Q-22 -60 -14 -86 L14 -86 Q22 -60 18 -24 Z" fill="#100a06" />
      <path d="M-30 -30 Q-26 -40 -18 -40 L18 -40 Q26 -40 30 -30 L22 -26 L-22 -26 Z" fill="#100a06" />
      <ellipse cx={0} cy={-96} rx={10} ry={11} fill="#100a06" />
      {kind === "thai" && <path d="M-11 -102 L0 -150 L11 -102 Z M-14 -104 L-20 -112 L-8 -108 Z M14 -104 L20 -112 L8 -108 Z" fill="#100a06" />}
      {kind === "plain" && <path d="M-10 -100 Q0 -112 10 -100 Z" fill="#100a06" />}
      {kind === "boatman" && <path d="M-16 -100 L0 -116 L16 -100 Z" fill="#100a06" />}
      <path d="M10 -96 L16 -94 L10 -92 Z" fill="#100a06" />
      {holes.map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r={1.8} fill="#f6d9a0" opacity={0.85} />)}
      <g transform={`rotate(${-arm * 70},14,-78)`}>
        <path d="M14 -80 L40 -70 L38 -64 L12 -74 Z" fill="#100a06" />
        {kind === "thai" && <path d="M38 -70 L80 -96 L82 -92 L42 -64 Z" fill="#100a06" />}
        {kind === "boatman" && <path d="M38 -70 L60 40 L64 40 L42 -66 Z" fill="#100a06" />}
      </g>
    </g>
  );
};

// The lit cloth screen; children draw the puppets/scenery inside a soft-shadow group.
export const ShadowStage = ({ id, anchor, start, end, children }: { id: string; anchor: [number, number]; start: number; end: number; children: (g: G, lt: number) => ReactNode }) => {
  const frame = useCurrentFrame();
  return (
    <Panel id={id} anchor={anchor} start={start} end={end} sky={["#1a0f08", "#1a0f08"]} accent={PAL.gilt}>
      {(g) => {
        const lt = frame - start;
        const flicker = 0.9 + 0.05 * Math.sin(frame * 0.23) + 0.03 * Math.sin(frame * 0.41); // slow: fast lamp flicker trips check-glitch
        const blur = interpolate(lt, [0, 40], [2.5, 0.8], clamp);
        return (
          <g>
            <defs>
              <radialGradient id={`screen-${id}`} cx="0.5" cy="0.6" r="0.7">
                <stop offset="0" stopColor="#fff1c9" />
                <stop offset="0.55" stopColor="#f0b35c" />
                <stop offset="1" stopColor="#6a3410" />
              </radialGradient>
              <filter id={`sblur-${id}`}><feGaussianBlur stdDeviation={blur} /></filter>
            </defs>
            <rect x={g.x} y={g.y} width={g.W} height={g.H} fill={`url(#screen-${id})`} opacity={flicker} />
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={g.x} y1={g.y + i * 30 * g.s} x2={g.x + g.W} y2={g.y + i * 30 * g.s} stroke="#7a4a20" strokeWidth={0.6 * g.s} opacity={0.25} />)}
            <rect x={g.x} y={g.y} width={22 * g.s} height={g.H} fill="#3a2414" />
            <rect x={g.x + g.W - 22 * g.s} y={g.y} width={22 * g.s} height={g.H} fill="#3a2414" />
            <g filter={`url(#sblur-${id})`} opacity={0.92}>{children(g, lt)}</g>
            <rect x={g.x} y={g.ground + 20 * g.s} width={g.W} height={g.H} fill="#120a05" />
          </g>
        );
      }}
    </Panel>
  );
};

export { Banner, Fighter, Grass, PAL };
