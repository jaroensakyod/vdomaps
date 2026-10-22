import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { buildBeats } from "../../../components/subs.mjs";
import { clamp, GOLD, LAYOUT, RED } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 3 timing (same layout as episodes 1–2): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);

export const SIAM_C = GOLD;
export const BURMA_C = RED;
export const QING_C = "#c0186a";
export const LANNA_C = "#3fbf6a";
export const MON_C = "#c8a070";

// Rough extents of the powers in the 1770s (approximate — said in the description, not on screen).
export const ZONES = {
  siam: { color: SIAM_C, ring: [[99.2, 17.6], [100.8, 17.9], [101.6, 17.2], [102.2, 16.2], [104.4, 15.8], [104.5, 14.3], [102.9, 11.6], [100.9, 13.4], [100.3, 12.3], [99.4, 10.0], [98.4, 8.3], [100.4, 6.6], [101.3, 7.4], [100.4, 9.6], [99.9, 11.2], [99.9, 12.6], [99.3, 13.9], [98.9, 15.4]] as [number, number][] },
  lanna: { color: LANNA_C, ring: [[97.9, 18.0], [99.2, 17.6], [100.8, 17.9], [101.0, 19.5], [100.1, 20.4], [98.4, 19.9]] as [number, number][] },
  burma: { color: BURMA_C, ring: [[93.0, 20.0], [94.5, 16.0], [97.3, 15.8], [98.4, 13.4], [99.2, 11.0], [98.8, 15.6], [97.9, 18.0], [98.4, 19.9], [100.1, 20.4], [99.2, 22.4], [97.8, 24.0], [97.5, 26.2], [95.0, 26.6], [94.0, 24.0]] as [number, number][] },
  qing: { color: QING_C, ring: [[97.6, 24.4], [98.8, 22.5], [101.5, 21.6], [104.6, 22.6], [104.8, 26.0], [99.0, 26.4]] as [number, number][] },
};
export type ZoneId = keyof typeof ZONES;

// Zone areas: soft fill + glowing outline, each with its own visibility k and optional colour override.
export const Zones = ({ k, colors = {} }: { k: Partial<Record<ZoneId, number>>; colors?: Partial<Record<ZoneId, string>> }) => {
  const { projection, s } = useMap();
  const frame = useCurrentFrame();
  return (
    <g>
      {(Object.keys(ZONES) as ZoneId[]).map((id, i) => {
        const kk = k[id] ?? 0;
        if (kk <= 0) return null;
        const color = colors[id] ?? ZONES[id].color;
        const pts = ZONES[id].ring.map((p) => projection(p)).filter(Boolean) as [number, number][];
        if (pts.length < 3) return null;
        const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
        const pulse = 0.85 + 0.15 * Math.sin(frame * 0.15 + i);
        return (
          <g key={id} opacity={kk}>
            <path d={d} fill={color} fillOpacity={0.22 * pulse} />
            <path d={d} fill="none" stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Burmese stockades: n small red forts on a ring around `center`; each pops in at start + i*step,
// the ring shrinks from r0 to r1 (degrees) between creepFrom and creepTo; a camp can be knocked out and rebuilt.
export const Stockades = ({ center, n, r0, r1 = r0, start, step = 6, creepFrom = 0, creepTo = 0, gapAt, color = BURMA_C, out = 1e9 }: { center: [number, number]; n: number; r0: number; r1?: number; start: number; step?: number; creepFrom?: number; creepTo?: number; gapAt?: number; color?: string; out?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const r = creepTo > creepFrom ? interpolate(frame, [creepFrom, creepTo], [r0, r1], clamp) : r0;
  const fadeOut = interpolate(frame, [out, out + 15], [1, 0], clamp);
  if (fadeOut <= 0) return null;
  return (
    <g opacity={fadeOut}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const p = projection([center[0] + Math.cos(a) * r * 1.05, center[1] + Math.sin(a) * r]);
        const k = interpolate(frame, [start + i * step, start + i * step + 8], [0, 1], clamp);
        if (!p || k <= 0) return null;
        // `gapAt`: the camp at index 0 is knocked out and rebuilt (sorties).
        const blink = gapAt !== undefined && i === 0 ? (frame >= gapAt && frame < gapAt + 24 ? 0.15 : 1) : 1;
        const z = 13 * s * k;
        return (
          <g key={i} transform={`translate(${p[0]},${p[1]})`} opacity={blink}>
            <circle r={z * 1.9} fill={color} opacity={0.18} />
            <rect x={-z} y={-z} width={z * 2} height={z * 2} fill={color} stroke="#fff" strokeWidth={2 * s} transform="rotate(45)" />
          </g>
        );
      })}
    </g>
  );
};

// A glowing city dot (gold for Siam, red when taken).
export const CityDot = ({ at: c, color = SIAM_C, r = 14, start = 0 }: { at: [number, number]; color?: string; r?: number; start?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start) return null;
  const k = interpolate(frame, [start, start + 10], [0, 1], clamp);
  const pulse = 1 + 0.25 * Math.sin(frame * 0.25);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      <circle r={r * 2.2 * pulse * s} fill={color} opacity={0.25} />
      <circle r={r * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
    </g>
  );
};
