import { loadFont as loadPattaya } from "@remotion/google-fonts/Pattaya";
import { loadFont as loadChonburi } from "@remotion/google-fonts/Chonburi";
import { geoInterpolate } from "d3-geo";
import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { globeCam, type Cam, type CamKey } from "../../../components/camera";
import { countries, country } from "../../../components/data";
import { FigureDefs } from "../../../components/Figures";
import type { InsetGeom } from "../../../components/Inset";
import { useMap } from "../../../components/Map";
import { clamp, ramp } from "./Art";

// M12 hand-painted tin signboard (ป้ายสังกะสีเขียนมือ): the whole frame is a riveted, slightly dented enamel-painted
// tin sheet with a red-and-yellow painted border; the map is painted on it simply (blue sea, cream land, a brushed
// black outline, the story's country in enamel red); the day's stories arrive as separate painted signs that drop in
// on two wires and swing until they settle; the illustration hangs below on its own sign. Brush lettering with the
// sign-writer's offset shade (Pattaya), numbers in Chonburi.
export const font = loadPattaya("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const num = loadChonburi("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export { clamp, ramp };
export const RED = "#d7261e";
export const YELLOW = "#f6c21a";
export const GREEN = "#0f7a4a";
export const CREAM = "#f4ead2";
export const BLUE = "#1f6fc5";
export const BLACK = "#161311";
export const SEA = "#2a7fd0";
export const LAND = "#f1e2b8";

export type LL = [number, number];
export type Story = { id: string; ids: string[]; focus: LL; zoom: number; start: number; end: number; pin: { at: LL; label: string; f: number } };

// Brush / enamel filters (place once inside MapFrame).
export const TinDefs = () => {
  const { s } = useMap();
  return (
    <defs>
      <filter id="m12-brush" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={5} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={6 * s} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
};

// The painted map: green sheet behind a blue globe disc, cream land, brushed black outline, red story countries.
export const PaintedMap = ({ ids = [], k = 0 }: { ids?: string[]; k?: number }) => {
  const { path, s, width, height } = useMap();
  const land = path(countries) ?? "";
  return (
    <g>
      <rect width={width} height={height} fill={GREEN} />
      <path d={path({ type: "Sphere" }) ?? ""} fill={SEA} stroke={BLACK} strokeWidth={6 * s} filter="url(#m12-brush)" />
      <path d={land} fill={LAND} />
      <g filter="url(#m12-brush)">
        <path d={land} fill="none" stroke={BLACK} strokeWidth={3.4 * s} strokeLinejoin="round" />
        {k > 0 && ids.map((id) => {
          const d = path(country(id)) ?? "";
          return (
            <g key={id} opacity={k}>
              <path d={d} fill={RED} stroke={YELLOW} strokeWidth={7 * s} strokeLinejoin="round" paintOrder="stroke" />
              <path d={d} fill="none" stroke={BLACK} strokeWidth={3 * s} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// Painted pointing arrow + cream name plate above a place.
export const PaintPin = ({ at, label, start }: { at: LL; label: string; start: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (frame < start) return null;
  const p = projection(at);
  if (!p) return null;
  const k = ramp(frame, start, start + 10, Easing.out(Easing.back(2)));
  const bob = Math.sin((frame - start) * 0.2) * 6 * s;
  const w = label.length * 30 * s + 50 * s;
  return (
    <g transform={`translate(${p[0]},${p[1] - bob})`} opacity={Math.min(1, k * 2)} filter="url(#m12-brush)">
      <g transform={`scale(${k})`}>
        <path d={`M0 ${-6 * s} L${-26 * s} ${-46 * s} L${-11 * s} ${-46 * s} L${-11 * s} ${-90 * s} L${11 * s} ${-90 * s} L${11 * s} ${-46 * s} L${26 * s} ${-46 * s} Z`} fill={RED} stroke={BLACK} strokeWidth={4 * s} strokeLinejoin="round" />
        <rect x={-w / 2} y={-158 * s} width={w} height={64 * s} fill={CREAM} stroke={BLACK} strokeWidth={4 * s} />
        <text y={-112 * s} textAnchor="middle" fontFamily={font} fontSize={42 * s} fill={RED} stroke={BLACK} strokeWidth={0.6 * s}>{label}</text>
      </g>
    </g>
  );
};

// Painted typhoon: a white cloud disc with a black brushed spiral and a red eye; rotates.
export const PaintSpiral = ({ x, y, r, frame }: { x: number; y: number; r: number; frame: number }) => {
  const pts = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    const a = t * Math.PI * 4.2;
    const rr = r * (0.16 + 0.72 * t);
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${-frame * 2})`} filter="url(#m12-brush)">
      <circle r={r * 0.95} fill="#ffffff" stroke={BLACK} strokeWidth={r * 0.06} opacity={0.92} />
      <polyline points={pts.join(" ")} fill="none" stroke={BLACK} strokeWidth={r * 0.09} strokeLinecap="round" />
      <circle r={r * 0.16} fill={RED} stroke={BLACK} strokeWidth={r * 0.05} />
    </g>
  );
};

// Storm track painted as yellow dashes with a black edge; spiral rides it from trackAt to `to`.
export const StormTrack = ({ track, from, to, trackAt, label = "เส้นทางคาดการณ์ (โดยประมาณ)" }: { track: LL[]; from: number; to: number; trackAt: number; label?: string }) => {
  const frame = useCurrentFrame();
  const { projection, path, s } = useMap();
  if (frame < from || frame > to + 10) return null;
  const k = ramp(frame, from, from + 20) * interpolate(frame, [to - 6, to + 10], [1, 0], clamp);
  const t = ramp(frame, trackAt, to, Easing.inOut(Easing.quad)) * 0.5;
  const seg = t * (track.length - 1);
  const i = Math.min(track.length - 2, Math.floor(seg));
  const pos = geoInterpolate(track[i], track[i + 1])(seg - i) as LL;
  const p = projection(pos);
  const trackK = ramp(frame, trackAt, trackAt + 30);
  const lp = projection(track[Math.min(3, track.length - 1)]);
  const d = path({ type: "LineString", coordinates: track }) ?? "";
  return (
    <g opacity={k}>
      {trackK > 0 && (
        <g opacity={trackK} filter="url(#m12-brush)">
          <path d={d} fill="none" stroke={BLACK} strokeWidth={13 * s} strokeDasharray={`${30 * s} ${16 * s}`} />
          <path d={d} fill="none" stroke={YELLOW} strokeWidth={8 * s} strokeDasharray={`${30 * s} ${16 * s}`} />
          {lp && <text x={lp[0] + 22 * s} y={lp[1]} fontSize={34 * s} fill={YELLOW} stroke={BLACK} strokeWidth={7 * s} paintOrder="stroke" fontFamily={font}>{label}</text>}
        </g>
      )}
      {p && <PaintSpiral x={p[0]} y={p[1]} r={110 * s} frame={frame} />}
    </g>
  );
};

// Painted flood: a flat blue blob with a wobbly brushed edge.
export const FloodPaint = ({ at: c, radius, k }: { at: LL; radius: number; k: number }) => {
  const frame = useCurrentFrame();
  const { projection, s } = useMap();
  if (k <= 0) return null;
  const p = projection(c);
  if (!p) return null;
  const r = radius * ((projection.scale() * Math.PI) / 180) * k;
  const pts = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const w = 1 + 0.08 * Math.sin(a * 5 + frame * 0.03) + 0.06 * Math.sin(a * 9 + 1.3);
    return `${p[0] + Math.cos(a) * r * w},${p[1] + Math.sin(a) * r * w * 1.15}`;
  });
  return <path d={`M${pts.join(" L")} Z`} fill={BLUE} stroke={BLACK} strokeWidth={4 * s} opacity={0.85} filter="url(#m12-brush)" />;
};

// Camera: hook close-up → painted globe turning for the intro → fly to each story → globe at the end.
export const dailyCam = (stories: Story[], width: number, height: number, hook: { focus: LL; zoom: number; to: number }, intro: { at: number; to: number; lon: [number, number] }, total: number): CamKey[] => {
  const R = Math.min(width, height) * 0.4;
  const lift = height > width ? 0.02 : 0;
  const target = (st: { focus: LL; zoom: number }): Cam => {
    const pxPerDeg = (R * st.zoom * Math.PI) / 180;
    return { lon: st.focus[0] - (height > width ? 0 : (width * 0.16) / pxPerDeg), lat: st.focus[1] - (height * lift) / pxPerDeg, scale: R * st.zoom };
  };
  const hookCam = target(hook);
  const keys: CamKey[] = [
    { frame: 0, cam: hookCam },
    { frame: hook.to, cam: { ...hookCam, scale: hookCam.scale * 1.06 }, easing: (t) => t },
    { frame: intro.at + 30, cam: globeCam(intro.lon[0], 5, width, height, 0.4), easing: Easing.inOut(Easing.cubic) },
    { frame: intro.to, cam: globeCam(intro.lon[1], 15, width, height, 0.4), easing: (t) => t },
  ];
  let prev: Cam = keys[keys.length - 1].cam;
  for (const st of stories) {
    const t = target(st);
    const [mlon, mlat] = geoInterpolate([prev.lon, prev.lat], [t.lon, t.lat])(0.5);
    keys.push({ frame: st.start - 12, cam: prev });
    keys.push({ frame: st.start + 6, cam: { lon: mlon, lat: mlat, scale: R * 1.05 }, easing: Easing.inOut(Easing.quad) });
    keys.push({ frame: st.start + 26, cam: t, easing: Easing.out(Easing.cubic) });
    keys.push({ frame: st.end, cam: { ...t, scale: t.scale * 1.04 }, easing: (x) => x });
    prev = { ...t, scale: t.scale * 1.04 };
  }
  const end = stories[stories.length - 1].end;
  keys.push({ frame: end + 4, cam: prev });
  keys.push({ frame: end + 30, cam: globeCam(prev.lon, 10, width, height, 0.4), easing: Easing.inOut(Easing.cubic) });
  keys.push({ frame: total, cam: globeCam(prev.lon + 20, 10, width, height, 0.4), easing: (x) => x });
  return keys;
};

// Swing of a hanging sign (degrees, drop offset 0 → 1, exit 0 → 1): drop in from above, damped swing, a small
// jolt every time its content is repainted, lifted out at the end.
export const swingAt = (frame: number, from: number, to: number, jolts: number[] = []) => {
  const t = frame - from;
  const drop = 1 - ramp(frame, from, from + 14, Easing.out(Easing.quad));
  let ang = t >= 0 ? 10 * Math.exp(-t / 24) * Math.cos(t * 0.3 + 0.4) : 0;
  for (const j of jolts) if (frame >= j) ang += 4 * Math.exp(-(frame - j) / 16) * Math.sin((frame - j) * 0.36);
  const exit = ramp(frame, to - 12, to, Easing.in(Easing.quad));
  return { ang: ang - exit * 6, drop, exit };
};

// Enamel texture + dents + rivets drawn over a sign or the whole sheet (HTML overlay, w×h px).
const Enamel = ({ w, h, s, rivets = true }: { w: number; h: number; s: number; rivets?: boolean }) => {
  const r = 9 * s, m = 22 * s;
  const pts = rivets ? [[m, m], [w - m, m], [m, h - m], [w - m, h - m]] : [];
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="m12-enamel" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.05" numOctaves={3} seed={9} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 -0.45" />
        </filter>
        <radialGradient id="m12-dent" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.05} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="m12-dent2" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#000" stopOpacity={0.22} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={w} height={h} filter="url(#m12-enamel)" opacity={rivets ? 0.3 : 0.18} />
      <ellipse cx={w * 0.3} cy={h * 0.35} rx={w * 0.22} ry={h * 0.3} fill="url(#m12-dent)" />
      <ellipse cx={w * 0.72} cy={h * 0.68} rx={w * 0.16} ry={h * 0.22} fill="url(#m12-dent2)" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#8b8f93" stroke={BLACK} strokeWidth={2 * s} />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#e8eaec" />
        </g>
      ))}
    </svg>
  );
};

// A hanging tin sign at (x, y = top edge) with two wires up to a nail. Children = the painted content.
export const Hanging = ({ from, to, jolts, x, y, w, h, bg, edge = YELLOW, wire = 140, children }: { from: number; to: number; jolts?: number[]; x: number; y: number; w: number; h: number; bg: string; edge?: string; wire?: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from || frame > to) return null;
  const { ang, drop, exit } = swingAt(frame, from, to, jolts);
  const dy = -drop * (y + h + wire * s) - exit * (y + h + wire * s);
  const ws = wire * s;
  return (
    <div style={{ position: "absolute", left: x, top: y - ws, width: w, height: h + ws, transform: `translateY(${dy}px) rotate(${ang}deg)`, transformOrigin: `50% 0` }}>
      <svg width={w} height={ws + 4 * s} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={w / 2} y1={6 * s} x2={w * 0.12} y2={ws} stroke="#3a3530" strokeWidth={3 * s} />
        <line x1={w / 2} y1={6 * s} x2={w * 0.88} y2={ws} stroke="#3a3530" strokeWidth={3 * s} />
        <circle cx={w / 2} cy={6 * s} r={7 * s} fill="#6d6a66" stroke={BLACK} strokeWidth={2 * s} />
      </svg>
      <div style={{ position: "absolute", left: 0, top: ws, width: w, height: h, background: bg, border: `${10 * s}px solid ${edge}`, outline: `${3 * s}px solid ${BLACK}`, boxShadow: `${10 * s}px ${16 * s}px ${0}px rgba(0,0,0,0.35)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 8 * s, border: `${3 * s}px solid ${BLACK}`, opacity: 0.85 }} />
        {children}
        <Enamel w={w} h={h} s={s} />
      </div>
    </div>
  );
};

// Sign-writer lettering: solid colour with an offset shade and a thin outline.
export const paint = (s: number, color: string, shade = BLACK, off = 5) => ({ color, textShadow: `${off * s}px ${off * s}px 0 ${shade}`, WebkitTextStroke: `${1.2 * s}px ${BLACK}` });

// Painted scene inside a hanging sign: an <svg> of w×h with an InsetGeom, label "ภาพประกอบ" painted small.
export const SceneSign = ({ w, h, sky, children }: { w: number; h: number; sky: [string, string]; children: (g: InsetGeom) => ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const k = w / (980 * s);
  const g: InsetGeom = { x: 0, y: 0, W: w, H: h, ground: h - 46 * s * k, cx: w / 2, s: s * k, sc: 1.55 * s * k, vertical: height > width, frame };
  return (
    <>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <FigureDefs />
        <rect width={w} height={h} fill={sky[0]} />
        <rect y={h * 0.45} width={w} height={h * 0.55} fill={sky[1]} />
        {children(g)}
      </svg>
      <div style={{ position: "absolute", right: 26 * s, bottom: 18 * s, fontFamily: font, fontSize: 30 * s, ...paint(s, CREAM, BLACK, 3) }}>ภาพประกอบ</div>
    </>
  );
};

// The tin sheet frame over everything: enamel texture, dents, a painted red border with a yellow pinstripe, rivets.
export const Sheet = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const b = 26 * s;
  const n = Math.round(width / (120 * s));
  const m = Math.round(height / (120 * s));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Enamel w={width} h={height} s={s} rivets={false} />
      <div style={{ position: "absolute", inset: 0, border: `${b}px solid ${RED}`, boxShadow: `inset 0 0 0 ${5 * s}px ${YELLOW}, inset 0 0 0 ${8 * s}px ${BLACK}` }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n + 1 }, (_, i) => [i * (width / n), b / 2]).concat(Array.from({ length: n + 1 }, (_, i) => [i * (width / n), height - b / 2])).concat(Array.from({ length: m + 1 }, (_, i) => [b / 2, i * (height / m)])).concat(Array.from({ length: m + 1 }, (_, i) => [width - b / 2, i * (height / m)])).map(([x, y], i) => (
          <circle key={i} cx={Math.min(Math.max(x, b / 2), width - b / 2)} cy={Math.min(Math.max(y, b / 2), height - b / 2)} r={5 * s} fill="#9a9ea2" stroke={BLACK} strokeWidth={1.5 * s} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Date plate + one painted disc per story (current = red, done = black), top of the sheet.
export const DatePlate = ({ date, stories, from }: { date: string; stories: Story[]; from: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < from) return null;
  const cur = stories.findIndex((st) => frame >= st.start - 6 && frame < st.end);
  const vertical = height > width;
  return (
    <div style={{ position: "absolute", left: vertical ? 50 * s : undefined, right: vertical ? 50 * s : 60 * s, bottom: vertical ? height * 0.05 : undefined, top: vertical ? undefined : 50 * s, display: "flex", alignItems: "center", gap: 18 * s }}>
      <div style={{ background: CREAM, border: `${4 * s}px solid ${BLACK}`, padding: `${2 * s}px ${22 * s}px`, fontFamily: font, fontSize: 36 * s, color: GREEN }}>{date}</div>
      {stories.map((st, i) => (
        <div key={st.id} style={{ width: 38 * s, height: 38 * s, borderRadius: "50%", background: i === cur ? RED : i < cur ? BLACK : CREAM, border: `${4 * s}px solid ${BLACK}`, fontFamily: num, fontSize: 22 * s, color: i === cur ? CREAM : BLACK, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
      ))}
    </div>
  );
};

// Kicker painted small at the top.
export const Kicker = ({ text }: { text: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return <div style={{ position: "absolute", top: 36 * s, left: 0, right: 0, textAlign: "center", fontFamily: font, fontSize: 32 * s, ...paint(s, YELLOW, BLACK, 3) }}>{text}</div>;
};
