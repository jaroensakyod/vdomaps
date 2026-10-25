import { geoDistance } from "d3-geo";
import type { FeatureCollection, MultiLineString } from "geojson";
import { interpolate, useCurrentFrame } from "remotion";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { C, clamp, fonts } from "./Recon";

// Analyst grease pencil on the print: waxy wobbling strokes drawn on in real time — circles round targets,
// numbered marks with handwritten labels, traced rivers. Put <PencilDefs /> once inside the <MapFrame>.

export const PencilDefs = () => {
  const { s } = useMap();
  return (
    <defs>
      <filter id="m04-wax" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={4} result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale={5 * s} xChannelSelector="R" yChannelSelector="G" result="wob" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={9} result="tex" />
        <feColorMatrix in="tex" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9" result="holes" />
        <feComposite in="wob" in2="holes" operator="in" />
      </filter>
    </defs>
  );
};

// Hand-drawn loop: an ellipse that overshoots its start by a tenth of a turn, radius wobbling.
const loop = (cx: number, cy: number, rx: number, ry: number, seed: number) => {
  const pts: string[] = [];
  const turns = 1.12;
  for (let i = 0; i <= 64; i++) {
    const a = -2.2 + seed + (i / 64) * Math.PI * 2 * turns;
    const wob = 1 + 0.06 * Math.sin(a * 3 + seed * 5) + (i / 64) * 0.08;
    pts.push(`${cx + Math.cos(a) * rx * wob},${cy + Math.sin(a) * ry * wob}`);
  }
  return `M${pts.join(" L")}`;
};

// Pencil ring drawn on over `draw` frames.
export const PencilRing = ({ at, rx, ry, start, color = C.red, width = 7, draw = 16, seed = 0.4, k = 1 }: { at: [number, number]; rx: number; ry: number; start: number; color?: string; width?: number; draw?: number; seed?: number; k?: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < start || k <= 0) return null;
  const t = interpolate(frame, [start, start + draw], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  return (
    <g filter="url(#m04-wax)" opacity={k}>
      <path d={loop(p[0], p[1], rx * s, ry * s, seed)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} fill="none" stroke={color} strokeWidth={width * s} strokeLinecap="round" opacity={0.92} />
    </g>
  );
};

// A numbered target: pencil circle, leader stroke, number in a small circle, handwritten name (+ sub line).
export const Mark = ({ at, n, text, sub, start, side = "right", color = C.yellow, r = 34 }: { at: [number, number]; n: number; text: string; sub?: string; start: number; side?: "left" | "right" | "up" | "down"; color?: string; r?: number }) => {
  const frame = useCurrentFrame();
  const { projection, cam, s } = useMap();
  if (frame < start || geoDistance([cam.lon, cam.lat], at) > 1.4) return null;
  const p = projection(at);
  if (!p) return null;
  const lead = interpolate(frame, [start + 10, start + 18], [0, 1], clamp);
  const txt = interpolate(frame, [start + 14, start + 22], [0, 1], clamp);
  const L = 90 * s;
  const [dx, dy] = { right: [L, -L * 0.5], left: [-L, -L * 0.5], up: [L * 0.3, -L * 1.1], down: [L * 0.4, L * 0.9] }[side];
  const ex = p[0] + dx * lead;
  const ey = p[1] + dy * lead;
  const anchor = side === "left" ? "end" : "start";
  const tx = p[0] + dx + (side === "left" ? -14 : 14) * s;
  const ty = p[1] + dy;
  const shadow = { stroke: "#050605", strokeWidth: 6 * s, strokeOpacity: 0.55, paintOrder: "stroke" as const };
  return (
    <g>
      <PencilRing at={at} rx={r} ry={r * 0.86} start={start} color={color} width={6} draw={12} seed={n * 0.9} />
      <g filter="url(#m04-wax)">
        <path d={`M${p[0] + (dx > 0 ? r : -r) * 0.7 * s} ${p[1] + (dy > 0 ? r : -r) * 0.6 * s} L${ex} ${ey}`} stroke={color} strokeWidth={5 * s} strokeLinecap="round" fill="none" opacity={lead ? 0.92 : 0} />
      </g>
      <g opacity={txt} transform={`rotate(-3 ${tx} ${ty})`}>
        <circle cx={tx + (anchor === "end" ? -18 : 18) * s} cy={ty - 14 * s} r={20 * s} fill="none" stroke={color} strokeWidth={3.5 * s} />
        <text x={tx + (anchor === "end" ? -18 : 18) * s} y={ty - 4 * s} textAnchor="middle" fontFamily={fonts.hand} fontSize={28 * s} fill={color} {...shadow}>
          {n}
        </text>
        <text x={tx + (anchor === "end" ? -48 : 48) * s} y={ty} textAnchor={anchor} fontFamily={fonts.hand} fontSize={40 * s} fill={color} {...shadow}>
          {text}
        </text>
        {sub && (
          <text x={tx + (anchor === "end" ? -48 : 48) * s} y={ty + 36 * s} textAnchor={anchor} fontFamily={fonts.hand} fontSize={27 * s} fill={C.silver} {...shadow}>
            {sub}
          </text>
        )}
      </g>
    </g>
  );
};

// OSM rivers traced in pencil: named rivers draw on together (0 → 1). Nothing is drawn before, so the photo leads.
export const RiverTrace = ({ hi, color = "#eef3e6" }: { hi: Record<string, number>; color?: string }) => {
  const { path, s } = useMap();
  const isle = useJson<FeatureCollection<MultiLineString, { name: string }>>("data/th-island.json");
  const plain = useJson<FeatureCollection<MultiLineString, { name: string }>>("data/th-plain.json");
  const all = [...(plain?.features ?? []), ...(isle?.features ?? [])];
  return (
    <g filter="url(#m04-wax)" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map((f, i) => {
        const k = hi[f.properties.name] ?? 0;
        if (k <= 0) return null;
        return f.geometry.coordinates.map((line, j) => (
          <path key={`${i}-${j}`} d={path({ type: "LineString", coordinates: line }) ?? ""} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} stroke={color} strokeWidth={4 * s} opacity={0.75} />
        ));
      })}
    </g>
  );
};

// Handwritten note anywhere on the print.
export const Note = ({ at, text, start, size = 38, color = C.yellow, rot = -4, anchor = "middle" }: { at: [number, number]; text: string; start: number; size?: number; color?: string; rot?: number; anchor?: "start" | "middle" | "end" }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || frame < start) return null;
  const k = interpolate(frame, [start, start + 8], [0, 1], clamp);
  return (
    <text x={p[0]} y={p[1]} transform={`rotate(${rot} ${p[0]} ${p[1]})`} textAnchor={anchor} fontFamily={fonts.hand} fontSize={size * s} fill={color} opacity={k} stroke="#050605" strokeWidth={6 * s} strokeOpacity={0.55} paintOrder="stroke">
      {text}
    </text>
  );
};
