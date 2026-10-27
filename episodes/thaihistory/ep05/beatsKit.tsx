import type { Feature } from "geojson";
import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { country } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";
import { buildBeats } from "../../../components/subs.mjs";
import { clamp, GOLD, LAYOUT, RED, type Chapter } from "../news/kit";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 5 timing (same layout as episodes 1–4): beats, lookup by id, word cue frames.
export const BEATS = buildBeats(timing, beatsText, LAYOUT);
export const B = Object.fromEntries(BEATS.map((b) => [b.id, b]));
export const wf = (id: string, word: string, k = 0.5, n = 0) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).filter((w) => w.w === word)[n];
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
// Frame of the first spoken word that contains `part` (Whisper splits Thai words its own way).
export const wp = (id: string, part: string, k = 0.5) => {
  const b = B[id];
  if (!b) throw new Error(`no beat ${id}`);
  const hit = (b.words ?? []).find((w) => w.w.includes(part));
  return hit ? Math.round(b.start + hit.s * 30) : Math.round(b.start + b.len * k);
};
export const at = (id: string, k = 0) => Math.round(B[id].start + B[id].len * k);
export const VOICE: [number, number][] = BEATS.map((b) => [b.start, b.end]);

export type Chapter5 = Chapter & { Audio?: () => ReactNode };

export const SIAM_C = GOLD;
export const BRIT_C = "#e8443a";
export const FR_C = "#3f8cff";
export { RED, GOLD };

type Ring = [number, number][];
// Approximate areas (modern country outlines from Natural Earth, partial areas drawn by hand and clipped to the
// country they lie in). Said on screen as "แนวโดยประมาณ" and in the description.
const RINGS: Record<string, { clip: string; ring?: Ring }> = {
  thai: { clip: "764" },
  burma: { clip: "104" },
  lowerBurma: { clip: "104", ring: [[92.0, 21.4], [93.3, 21.3], [94.3, 19.6], [95.3, 19.3], [96.6, 19.6], [97.7, 19.1], [97.9, 17.5], [98.9, 15.6], [99.3, 13.4], [99.7, 10.8], [98.6, 9.6], [97.9, 11.6], [97.5, 15.6], [96.4, 16.3], [95.2, 15.6], [94.0, 15.8], [94.2, 18.0], [93.4, 19.4]] },
  malaysia: { clip: "458" },
  malayaSouth: { clip: "458", ring: [[99.5, 5.9], [100.4, 5.15], [100.9, 5.45], [101.2, 5.5], [101.5, 4.5], [102.3, 4.85], [103.0, 4.05], [103.6, 4.2], [104.7, 1.0], [103.2, 0.9], [100.9, 2.4], [100.0, 4.0]] },
  kedahPerlis: { clip: "458", ring: [[99.9, 6.9], [100.95, 6.4], [101.15, 5.8], [100.9, 5.45], [100.4, 5.15], [99.5, 5.9]] },
  kelantan: { clip: "458", ring: [[101.15, 5.8], [102.1, 6.35], [102.45, 5.7], [102.3, 4.85], [101.5, 4.5], [101.2, 5.5], [100.9, 5.45]] },
  terengganu: { clip: "458", ring: [[102.1, 6.35], [103.6, 5.0], [103.6, 4.2], [103.0, 4.05], [102.3, 4.85], [102.45, 5.7]] },
  vietnam: { clip: "704" },
  cochin: { clip: "704", ring: [[104.2, 8.2], [104.3, 10.6], [105.1, 10.95], [106.2, 11.75], [107.6, 11.6], [109.8, 11.6], [109.8, 8.0]] },
  cambodia: { clip: "116" },
  bsr: { clip: "116", ring: [[102.3, 13.2], [102.4, 13.75], [102.75, 14.15], [103.3, 14.42], [104.35, 14.45], [104.45, 13.6], [104.05, 12.95], [103.45, 12.45], [102.85, 12.3], [102.45, 12.7]] },
  laos: { clip: "418" },
  sayaboury: { clip: "418", ring: [[100.75, 19.55], [101.2, 19.95], [101.85, 19.95], [102.15, 19.3], [101.95, 18.4], [101.4, 17.85], [101.0, 17.8], [100.85, 18.4], [100.55, 19.0]] },
  champasakRB: { clip: "418", ring: [[105.15, 15.45], [105.95, 15.35], [105.88, 14.45], [105.95, 13.9], [105.4, 14.05], [105.1, 14.35], [105.5, 14.9]] },
};
export type AreaId = keyof typeof RINGS;
const featureOf = (id: AreaId): Feature => (RINGS[id].ring ? region(RINGS[id].ring!) : country(RINGS[id].clip));

// Empire colours over the map: areas[id] = [colour, strength 0..1]. Later entries paint over earlier ones.
export const Empire = ({ areas, pulse = true }: { areas: [AreaId, string, number][]; pulse?: boolean }) => {
  const { path, s } = useMap();
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        {[...new Set(areas.map(([id]) => RINGS[id].clip))].map((c) => (
          <clipPath key={c} id={`e5clip${c}`}>
            <path d={path(country(c)) ?? ""} />
          </clipPath>
        ))}
      </defs>
      {areas.map(([id, color, k], i) => {
        if (k <= 0) return null;
        const d = path(featureOf(id)) ?? "";
        const pz = pulse ? 0.88 + 0.12 * Math.sin(frame * 0.12 + i) : 1;
        return (
          <g key={`${id}${i}`} opacity={k} clipPath={`url(#e5clip${RINGS[id].clip})`}>
            <path d={d} fill={color} fillOpacity={0.3 * pz} />
            <path d={d} fill="none" stroke={color} strokeWidth={12 * s} strokeOpacity={0.3} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeWidth={3 * s} strokeLinejoin="round" strokeDasharray={RINGS[id].ring ? `${14 * s} ${8 * s}` : undefined} />
          </g>
        );
      })}
    </g>
  );
};

// 0→1 ramp starting at f over n frames (and back to 0 at `off` if given).
export const ramp = (frame: number, f: number, n = 18, off = 1e9) => interpolate(frame, [f, f + n, off, off + n], [0, 1, 1, 0], clamp);

// A glowing city dot.
export const CityDot = ({ at: c, color = SIAM_C, r = 14, start = 0, end = 1e9 }: { at: [number, number]; color?: string; r?: number; start?: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 10) return null;
  const k = interpolate(frame, [start, start + 10, end, end + 10], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.25 * Math.sin(frame * 0.25);
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      <circle r={r * 2.2 * pulse * s} fill={color} opacity={0.25} />
      <circle r={r * s} fill={color} stroke="#fff" strokeWidth={3 * s} />
    </g>
  );
};

// A small flag on a pole planted on the map (colonial occupation, treaty marks).
export const MapFlag = ({ at: c, color, start, end = 1e9, size = 1 }: { at: [number, number]; color: string; start: number; end?: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 12) return null;
  const k = interpolate(frame, [start, start + 12, end, end + 12], [0, 1, 1, 0], clamp);
  const z = s * size;
  const wave = Math.sin(frame * 0.3) * 4 * z;
  const rise = (1 - k) * 30 * z;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={k}>
      <ellipse rx={14 * z} ry={5 * z} fill="#000" opacity={0.35} />
      <line x1={0} y1={0} x2={0} y2={-80 * z + rise} stroke="#f4f0e6" strokeWidth={4 * z} />
      <path d={`M0 ${-80 * z + rise} q${24 * z} ${-8 * z + wave} ${48 * z} 0 v${30 * z} q${-24 * z} ${8 * z - wave} ${-48 * z} 0 Z`} fill={color} stroke="#fff" strokeWidth={2 * z} />
    </g>
  );
};

// Ring around a point (radius in degrees), dashed and slowly turning.
export const Ring = ({ at: c, r, color = RED, start, end = 1e9 }: { at: [number, number]; r: number; color?: string; start: number; end?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(c);
  if (!p || frame < start || frame > end + 12) return null;
  const k = interpolate(frame, [start, start + 12, end, end + 12], [0, 1, 1, 0], clamp);
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const rr = Math.max(r * pxDeg, 30 * s) * (0.6 + 0.4 * k);
  return (
    <g opacity={k}>
      <circle cx={p[0]} cy={p[1]} r={rr} fill={color} fillOpacity={0.1} stroke={color} strokeWidth={10 * s} strokeOpacity={0.3} style={{ filter: `blur(${5 * s}px)` }} />
      <circle cx={p[0]} cy={p[1]} r={rr} fill="none" stroke={color} strokeWidth={3 * s} strokeDasharray={`${14 * s} ${9 * s}`} transform={`rotate(${frame * 0.6},${p[0]},${p[1]})`} />
    </g>
  );
};
