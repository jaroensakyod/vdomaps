import { interpolate, useCurrentFrame } from "remotion";
import { COSTUME, PAL, type Costume } from "../../../components/Scene";
import { clamp } from "../news/kit";
import type { G } from "../ep04/v2";

// Episode 5 scene pieces (house style v2): steam gunboats, flags, sea, colonial buildings, map table.
// Costumes for the 1860s–1900s.
export const C5: Record<string, Costume> = {
  ...COSTUME,
  british: { jacket: "#b0262a", sash: "#efe6d0", pants: "#1f2433", head: "helmet", headColor: "#efe6d0", skin: "#e0b08a" },
  french: { jacket: "#2a3f7a", sash: "#c9302c", pants: "#b0262a", head: "helmet", headColor: "#2a3f7a", skin: "#e0b08a" },
  siamArmy: { jacket: "#efe6d0", sash: PAL.ochre, pants: "#2b3a67", head: "helmet", headColor: "#efe6d0" },
  siamNavy: { jacket: "#f4f2ea", sash: "#2b3a67", pants: "#f4f2ea", head: "short" },
  villager: { jacket: "#8a7a5a", sash: "#5b6e4a", pants: "#3a2f26", head: "short" },
  official: { jacket: "#efe6d0", sash: PAL.gilt, pants: "#2b3a67", head: "short" },
  lao: { jacket: "#2a3a2a", sash: "#3fbf6a", pants: "#2a2420", head: "topknot" },
  shan: { jacket: "#3a3a4a", sash: PAL.ochre, pants: "#2a2420", head: "wrap", headColor: "#c9b48a" },
};

// Flag colours (simplified, no emblems): British red ensign, French tricolour, Siam red with white elephant.
export type FlagKind = "uk" | "fr" | "siam";
export const PanelFlag = ({ x, y, s, kind, h = 70, w = 46 }: { x: number; y: number; s: number; kind: FlagKind; h?: number; w?: number }) => {
  const frame = useCurrentFrame();
  const wave = Math.sin(frame * 0.25 + x * 0.01) * 4 * s;
  const top = y - h * s;
  const cloth = (fill: string, dx: number, ww: number) => (
    <path d={`M${x + dx * s} ${top} q${(ww * s) / 2} ${-5 * s + wave} ${ww * s} 0 v${28 * s} q${(-ww * s) / 2} ${5 * s - wave} ${-ww * s} 0 Z`} fill={fill} />
  );
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={top - 4 * s} stroke="#e8e2d0" strokeWidth={2.6 * s} />
      {kind === "fr" && (
        <g>
          {cloth("#2a3f9a", 0, w / 3)}
          {cloth("#f4f2ea", w / 3, w / 3)}
          {cloth("#c9302c", (2 * w) / 3, w / 3)}
        </g>
      )}
      {kind === "uk" && (
        <g>
          {cloth("#b0262a", 0, w)}
          <rect x={x} y={top - 2 * s} width={(w / 2.4) * s} height={13 * s} fill="#1f2a6a" />
          <path d={`M${x} ${top - 2 * s} l${(w / 2.4) * s} ${13 * s} M${x + (w / 2.4) * s} ${top - 2 * s} l${(-w / 2.4) * s} ${13 * s}`} stroke="#f4f2ea" strokeWidth={2 * s} />
        </g>
      )}
      {kind === "siam" && (
        <g>
          {cloth("#c9302c", 0, w)}
          <ellipse cx={x + (w / 2) * s} cy={top + 13 * s} rx={9 * s} ry={6 * s} fill="#f4f2ea" />
        </g>
      )}
      <path d={`M${x} ${top - 2 * s} q${(w * s) / 2} ${-5 * s + wave} ${w * s} 0 v${28 * s} q${(-w * s) / 2} ${5 * s - wave} ${-w * s} 0 Z`} fill="none" stroke={PAL.ink} strokeWidth={1.4 * s} />
    </g>
  );
};

// Steam gunboat facing right (dir -1 faces left): dark hull, funnel smoke, bow gun. `fire` = frames of gun flashes.
export const Gunboat = ({ x, y, s, flag = "fr", dir = 1, fire = [], smoke = true }: { x: number; y: number; s: number; flag?: FlagKind; dir?: 1 | -1; fire?: number[]; smoke?: boolean }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.08 + x * 0.003) * 3;
  const roll = Math.sin(frame * 0.06 + x * 0.002) * 1.2;
  return (
    <g transform={`translate(${x},${y + bob * s}) rotate(${roll}) scale(${s * dir},${s})`}>
      {smoke &&
        Array.from({ length: 6 }, (_, i) => {
          const t = (frame * 0.6 + i * 14) % 84;
          return <circle key={i} cx={-6 - t * 1.4} cy={-118 - t * 0.9} r={10 + t * 0.32} fill="#3a3a3a" opacity={0.5 * (1 - t / 84)} />;
        })}
      <path d="M-150 -40 L136 -40 L170 -52 Q150 8 116 14 L-128 14 Q-150 -8 -150 -40 Z" fill="#23262c" stroke={PAL.ink} strokeWidth={2.6} />
      <path d="M-140 -26 L150 -26" stroke="#a88a50" strokeWidth={3} />
      <rect x={-70} y={-74} width={110} height={34} fill="#d8d0b8" stroke={PAL.ink} strokeWidth={2} />
      {[-58, -36, -14, 8].map((px) => <rect key={px} x={px} y={-66} width={12} height={10} fill="#3a4a5a" />)}
      <rect x={-18} y={-120} width={22} height={48} fill="#2a2a2a" stroke={PAL.ink} strokeWidth={2} />
      <rect x={-18} y={-120} width={22} height={8} fill="#a8322a" />
      <line x1={-110} y1={-40} x2={-110} y2={-150} stroke="#3a2414" strokeWidth={4} />
      <line x1={70} y1={-40} x2={70} y2={-130} stroke="#3a2414" strokeWidth={3.5} />
      <path d="M-110 -150 L70 -130 M-110 -150 L-150 -40 M70 -130 L136 -40" stroke="#3a2414" strokeWidth={1} opacity={0.7} />
      <g transform="scale(1,1)">
        <rect x={96} y={-56} width={56} height={9} rx={4} fill="#1a1a1a" stroke={PAL.ink} strokeWidth={1.4} />
        <rect x={86} y={-62} width={22} height={22} rx={4} fill="#3a3a3a" stroke={PAL.ink} strokeWidth={1.4} />
      </g>
      {fire.map((f) => {
        const t = frame - f;
        if (t < 0 || t > 22) return null;
        const o = interpolate(t, [0, 2, 22], [0, 1, 0], clamp);
        return (
          <g key={f} opacity={o}>
            <circle cx={168} cy={-52} r={18 + t * 1.4} fill="#fff2b0" opacity={t < 5 ? 0.9 : 0.25} />
            <circle cx={178 + t * 2.4} cy={-58 - t * 0.6} r={14 + t * 1.8} fill="#cfc8bc" opacity={0.6} />
          </g>
        );
      })}
      <g transform={`scale(${dir},1)`}>
        <PanelFlag x={dir * -110} y={-148} s={1} kind={flag} h={26} w={44} />
      </g>
    </g>
  );
};

// Open sea band with rolling swell and whitecaps; the bottom band (`near`) moves fastest (foreground layer).
export const Sea = ({ g, y, pan = 0, color = "#2c5a78", deep = "#173248", near = true }: { g: G; y: number; pan?: number; color?: string; deep?: string; near?: boolean }) => {
  const frame = useCurrentFrame();
  const wave = (yy: number, amp: number, len: number, speed: number, shift: number) => {
    let d = `M${g.x - 60 * g.s} ${g.y + g.H + 10}`;
    for (let px = -60; px <= g.W / g.s + 60; px += 12) d += ` L${g.x + px * g.s} ${yy + Math.sin((px + frame * speed + shift) / len) * amp * g.s}`;
    return d + ` L${g.x + g.W + 60 * g.s} ${g.y + g.H + 10} Z`;
  };
  return (
    <g>
      <rect x={g.x - 60 * g.s} y={y} width={g.W + 120 * g.s} height={g.y + g.H - y} fill={deep} />
      <path d={wave(y, 3, 30, 0.6, pan * 0.5)} fill={color} />
      <rect x={g.x - 60 * g.s} y={y} width={g.W + 120 * g.s} height={3 * g.s} fill="#cfe6f0" opacity={0.45} />
      {Array.from({ length: 12 }, (_, i) => {
        const rx = g.x + ((i * 83 + frame * 0.9 + pan * 0.7) % (g.W + 60 * g.s)) - 30 * g.s;
        const ry = y + (14 + (i % 4) * 14) * g.s;
        return <path key={i} d={`M${rx} ${ry} q${12 * g.s} ${-5 * g.s} ${24 * g.s} 0`} stroke="#e8f4f8" strokeWidth={1.6 * g.s} fill="none" opacity={0.5} />;
      })}
      {near && <path d={wave(g.ground + 26 * g.s, 9, 22, 1.8, pan * 1.6)} fill={deep} stroke="#e8f4f8" strokeWidth={2 * g.s} strokeOpacity={0.5} />}
    </g>
  );
};

// Colonial / new-ministry building: colonnade, pediment, shuttered windows (base centre x, y).
export const Colonnade = ({ x, y, w, s, wall = "#efe6d0", roof = "#b65a3a", cols = 6, sign }: { x: number; y: number; w: number; s: number; wall?: string; roof?: string; cols?: number; sign?: string }) => {
  const h = 130 * s;
  const left = x - w / 2;
  return (
    <g>
      <rect x={left} y={y - h} width={w} height={h} fill={wall} stroke={PAL.ink} strokeWidth={2 * s} />
      <path d={`M${left - 10 * s} ${y - h} L${x} ${y - h - 46 * s} L${left + w + 10 * s} ${y - h} Z`} fill={roof} stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: cols }, (_, i) => {
        const cx = left + ((i + 0.5) * w) / cols;
        return (
          <g key={i}>
            <rect x={cx - 7 * s} y={y - h + 10 * s} width={14 * s} height={h - 18 * s} fill="#f8f4ea" stroke={PAL.ink} strokeWidth={1.4 * s} />
            {i < cols - 1 && <rect x={cx + w / cols / 2 - 10 * s} y={y - h + 30 * s} width={20 * s} height={34 * s} fill="#3a5a4a" stroke={PAL.ink} strokeWidth={1.2 * s} />}
          </g>
        );
      })}
      <rect x={left - 6 * s} y={y - 8 * s} width={w + 12 * s} height={10 * s} fill="#cfc6b0" stroke={PAL.ink} strokeWidth={1.4 * s} />
      {sign && (
        <g>
          <rect x={x - 70 * s} y={y - h - 26 * s} width={140 * s} height={24 * s} fill="#1f2a3a" stroke={PAL.gilt} strokeWidth={1.4 * s} />
          <text x={x} y={y - h - 8 * s} textAnchor="middle" fontSize={16 * s} fontWeight={700} fill={PAL.gilt}>{sign}</text>
        </g>
      )}
    </g>
  );
};

// Map spread on a table: coastline blotches, red and blue areas, pins (seen from a low angle).
export const MapTable = ({ x, y, w, s, red = 1, blue = 1 }: { x: number; y: number; w: number; s: number; red?: number; blue?: number }) => (
  <g>
    <path d={`M${x - w / 2} ${y} L${x - w / 2 + 40 * s} ${y - 70 * s} L${x + w / 2 - 40 * s} ${y - 70 * s} L${x + w / 2} ${y} Z`} fill="#e9dcb8" stroke={PAL.ink} strokeWidth={2 * s} />
    <path d={`M${x - w * 0.3} ${y - 14 * s} q${30 * s} ${-40 * s} ${60 * s} ${-44 * s} q${20 * s} ${10 * s} ${10 * s} ${30 * s} q${-30 * s} ${20 * s} ${-70 * s} ${14 * s} Z`} fill="#c9302c" opacity={0.75 * red} />
    <path d={`M${x + w * 0.08} ${y - 56 * s} q${40 * s} ${4 * s} ${70 * s} ${20 * s} q${-6 * s} ${26 * s} ${-40 * s} ${30 * s} q${-30 * s} ${-14 * s} ${-30 * s} ${-50 * s} Z`} fill="#2a5aa8" opacity={0.75 * blue} />
    <path d={`M${x - w * 0.06} ${y - 50 * s} q${16 * s} ${6 * s} ${12 * s} ${34 * s} q${-12 * s} ${4 * s} ${-18 * s} ${-12 * s} Z`} fill={PAL.gilt} opacity={0.9} />
    <rect x={x - w / 2} y={y} width={w} height={14 * s} fill="#5a3a20" stroke={PAL.ink} strokeWidth={1.6 * s} />
    <rect x={x - w / 2 + 12 * s} y={y + 14 * s} width={12 * s} height={70 * s} fill="#4a2f1a" />
    <rect x={x + w / 2 - 24 * s} y={y + 14 * s} width={12 * s} height={70 * s} fill="#4a2f1a" />
  </g>
);

// Thai-style palace roofline (gable layers + spire) for the Grand Palace in silhouette (base centre x, y).
export const PalaceRoof = ({ x, y, w, s, color = "#c9a24a", wall = "#efe6d0" }: { x: number; y: number; w: number; s: number; color?: string; wall?: string }) => (
  <g>
    <rect x={x - w / 2} y={y - 60 * s} width={w} height={60 * s} fill={wall} stroke={PAL.ink} strokeWidth={1.8 * s} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${x - w / 2 - 14 * s + i * 22 * s} ${y - 60 * s - i * 34 * s} L${x} ${y - 130 * s - i * 34 * s} L${x + w / 2 + 14 * s - i * 22 * s} ${y - 60 * s - i * 34 * s} Z`} fill={i % 2 ? "#2a5a3a" : "#a8322a"} stroke={color} strokeWidth={2.4 * s} />
    ))}
    <path d={`M${x - 6 * s} ${y - 196 * s} L${x} ${y - 300 * s} L${x + 6 * s} ${y - 196 * s} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.4 * s} />
    {[-0.3, 0, 0.3].map((f) => <rect key={f} x={x + f * w - 10 * s} y={y - 46 * s} width={20 * s} height={46 * s} fill="#5a2a18" stroke={PAL.ink} strokeWidth={1.2 * s} />)}
  </g>
);
