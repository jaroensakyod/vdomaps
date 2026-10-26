import { loadFont as loadHand } from "@remotion/google-fonts/Sriracha";
import { loadFont as loadKrub } from "@remotion/google-fonts/Krub";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { geoOrthographic } from "d3-geo";
import { useMemo, type ReactNode } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cam } from "../../../components/camera";
import { useMap } from "../../../components/Map";
import { region } from "../../../components/Region";
import { useJson } from "../../../components/useJson";

// M19 slide projector: a dark room, a pull-down screen, a carousel projector throwing a warm beam full of dust.
// Each "slide" is the local satellite raster graded like a different film stock (faded magenta Ektachrome → warm
// Kodachrome → clean modern colour) with grease-pencil marks drawn on it; the carousel advances with a shutter
// blink, a drop-in jolt and a click. The mount of the slide in the gate is shown with its handwritten label.

export const hand = loadHand("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
export const font = loadKrub("normal", { weights: ["500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  room: "#0d0a08", // the dark room
  beam: "#ffdf9e", // warm tungsten light
  screen: "#ece6d8", // matte screen
  mark: "#e2412c", // red grease pencil
  mount: "#f1ede3", // cardboard slide mount
  text: "#f6ead0",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// Screen and projected picture at 1080×1920.
export const useRoom = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return { s, width, height, screen: [80 * s, 180 * s, 920 * s, 800 * s], pic: [112 * s, 210 * s, 856 * s, 736 * s], lens: [540 * s, 1530 * s] as [number, number] };
};

export const fitBox = ([w, so, e, n]: [number, number, number, number], side: number): Cam => {
  const lon = (w + e) / 2;
  const lat = (so + n) / 2;
  const p = geoOrthographic().rotate([-lon, -lat]).fitSize([side, side], region([[w, so], [w, n], [e, n], [e, so]]));
  return { lon, lat, scale: p.scale() };
};

// Film grades for the slides (CSS filters on the projected picture) and a colour cast laid over it.
export const GRADES = {
  ekta: { filter: "sepia(0.35) saturate(1.3) hue-rotate(-38deg) contrast(0.8) brightness(1.5)", cast: "rgba(232,92,160,0.34)", label: "ฟิล์มสไลด์เก่า (โทนจำลอง)" },
  koda: { filter: "sepia(0.3) saturate(1.5) contrast(1.12) brightness(1.4)", cast: "rgba(255,170,60,0.12)", label: "ฟิล์มสี (โทนจำลอง)" },
  now: { filter: "saturate(1.35) contrast(1.1) brightness(1.25)", cast: "rgba(0,0,0,0)", label: "ภาพดาวเทียมปัจจุบัน" },
} as const;
export type Grade = keyof typeof GRADES;

// The room: near-black with a warm haze where the beam is, the screen on the wall with its roller case, weighted
// bottom bar and pull ring, and the projector light falling off towards the picture's corners.
export const Room = ({ light }: { light: number }) => {
  const { s, width, height, screen } = useRoom();
  const [x, y, w, h] = screen;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="m19-room" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.55" stopColor="#000" stopOpacity={0.05} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
        <filter id="m19-cloth" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={1} seed={2} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.25  0 0 0 0.28 -0.04" />
        </filter>
        <linearGradient id="m19-case" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3833" />
          <stop offset="0.45" stopColor="#8d877c" />
          <stop offset="1" stopColor="#1f1d1a" />
        </linearGradient>
        <linearGradient id="m19-wrinkle" x1="0" y1="0" x2="1" y2="0">
          {Array.from({ length: 9 }, (_, i) => (
            <stop key={i} offset={i / 8} stopColor="#000" stopOpacity={i % 2 ? 0.05 : 0} />
          ))}
        </linearGradient>
        <linearGradient id="m19-folds" x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse" gradientTransform={`scale(${70 * s} 1)`}>
          <stop offset="0" stopColor="#2a1030" />
          <stop offset="0.35" stopColor="#62285a" />
          <stop offset="0.55" stopColor="#481d44" />
          <stop offset="1" stopColor="#2a1030" />
        </linearGradient>
        <filter id="m19-wall" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={8} />
          <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.25 -0.05" />
        </filter>
      </defs>
      {/* drawn velvet curtains on the wall behind, lit only by the projector spill */}
      <rect width={width} height={height} fill="url(#m19-folds)" />
      <rect width={width} height={height} filter="url(#m19-wall)" />
      <rect width={width} height={height} fill="url(#m19-room)" />
      {/* spill of light round the screen on the wall */}
      <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.72} ry={h * 0.7} fill={C.beam} opacity={0.16 * light} style={{ filter: `blur(${50 * s}px)` }} />
      {/* screen cloth with a black border */}
      <rect x={x} y={y} width={w} height={h + 26 * s} fill="#141210" />
      <rect x={x + 10 * s} y={y + 10 * s} width={w - 20 * s} height={h - 20 * s} fill={C.screen} opacity={0.18 + 0.82 * light} />
      <rect x={x + 10 * s} y={y + 10 * s} width={w - 20 * s} height={h - 20 * s} filter="url(#m19-cloth)" />
      <rect x={x + 10 * s} y={y + 10 * s} width={w - 20 * s} height={h - 20 * s} fill="url(#m19-wrinkle)" />
      {/* roller case at the top, bottom bar, pull cord and ring */}
      <rect x={x - 26 * s} y={y - 38 * s} width={w + 52 * s} height={40 * s} rx={20 * s} fill="url(#m19-case)" />
      <rect x={x - 32 * s} y={y - 34 * s} width={16 * s} height={32 * s} rx={4 * s} fill="#2a2724" />
      <rect x={x + w + 16 * s} y={y - 34 * s} width={16 * s} height={32 * s} rx={4 * s} fill="#2a2724" />
      <rect x={x - 6 * s} y={y + h + 20 * s} width={w + 12 * s} height={16 * s} rx={8 * s} fill="url(#m19-case)" />
      <line x1={x + w / 2} y1={y + h + 36 * s} x2={x + w / 2} y2={y + h + 74 * s} stroke="#6d675e" strokeWidth={2.5 * s} />
      <circle cx={x + w / 2} cy={y + h + 86 * s} r={12 * s} fill="none" stroke="#8d877c" strokeWidth={4 * s} />
    </svg>
  );
};

// The projected picture: children (a <MapFrame> with a <Raster> and marks) graded like a film stock, with the
// lamp's hot centre, dark corners, dust and a hair on the slide, and the carousel change (`cut` = frames since the
// slide dropped in: 0…16 jolt + flash; `dark` 0…1 = shutter closed).
export const Projected = ({ children, grade, light, dark, cut, seed, box }: { children: ReactNode; grade: Grade; light: number; dark: number; cut: number; seed: string; box?: number[] }) => {
  const frame = useCurrentFrame();
  const { s, width, height, pic: pic0 } = useRoom();
  const pic = box ?? pic0;
  const [x, y, w, h] = pic;
  const g = GRADES[grade];
  const jolt = cut < 16 ? Math.sin(cut * 1.6) * Math.exp(-cut / 4) * 14 * s : 0;
  const flick = 0.96 + 0.04 * Math.sin(frame * 1.7) * Math.sin(frame * 0.31);
  const flash = cut < 6 ? (6 - cut) / 6 : 0;
  const bright = light * (1 - dark) * flick;
  const specks = useMemo(() => Array.from({ length: 26 }, (_, i) => [random(`${seed}x${i}`), random(`${seed}y${i}`), random(`${seed}r${i}`)]), [seed]);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height, clipPath: `inset(${y}px ${width - x - w}px ${height - y - h}px ${x}px)` }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${jolt}px)`, filter: `${g.filter} blur(${0.7 * s}px)`, opacity: bright }}>
        {children}
        <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: g.cast, mixBlendMode: "multiply" }} />
        {/* dust and a hair on the slide itself (they move with it) */}
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {specks.map(([a, b, r], i) => (
            <circle key={i} cx={x + a * w} cy={y + b * h} r={(0.8 + r * 2.6) * s} fill="#1a120c" opacity={0.55} />
          ))}
          <path d={`M${x + w * 0.72} ${y + h * 0.18} c${30 * s} ${10 * s} ${10 * s} ${50 * s} ${46 * s} ${70 * s} s${10 * s} ${40 * s} ${-6 * s} ${60 * s}`} fill="none" stroke="#1a120c" strokeWidth={1.4 * s} opacity={0.5} />
        </svg>
      </div>
      {/* lamp hot spot and vignette */}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: `radial-gradient(ellipse at 50% 48%, rgba(255,240,205,${0.18 * bright}) 0%, rgba(0,0,0,0) 45%, rgba(10,6,2,${0.25 * bright + 0.12}) 100%)` }} />
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#fff6dc", opacity: flash * 0.35 }} />
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#0b0907", opacity: dark * 0.92 }} />
    </div>
  );
};

// The beam from the lens to the picture: a warm cone with haze, brighter near the lens, dust motes drifting in it.
export const Beam = ({ light, box, from }: { light: number; box?: number[]; from?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { s, width, height, pic: pic0, lens: lens0 } = useRoom();
  const pic = box ?? pic0;
  const lens = from ?? lens0;
  const [x, y, w, h] = pic;
  const [lx, ly] = lens;
  const motes = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ t: random(`mt${i}`), u: random(`mu${i}`), sp: 0.3 + random(`ms${i}`), r: 0.8 + random(`mr${i}`) * 2.2 })), []);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: light }}>
      <defs>
        <linearGradient id="m19-beam" x1={lx} y1={ly} x2={x + w / 2} y2={y + h / 2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.beam} stopOpacity={0.95} />
          <stop offset="0.25" stopColor={C.beam} stopOpacity={0.5} />
          <stop offset="1" stopColor={C.beam} stopOpacity={0.16} />
        </linearGradient>
      </defs>
      <path d={`M${lx - 40 * s} ${ly} L${x} ${y + h} L${x + w} ${y + h} L${lx + 40 * s} ${ly} Z`} fill="url(#m19-beam)" style={{ filter: `blur(${14 * s}px)` }} />
      <path d={`M${lx - 8 * s} ${ly} L${x + w * 0.2} ${y + h} L${x + w * 0.8} ${y + h} L${lx + 8 * s} ${ly} Z`} fill={C.beam} opacity={0.35} style={{ filter: `blur(${30 * s}px)` }} />
      {motes.map((m, i) => {
        // position along the beam (t: 0 lens → 1 screen) and across it (u), drifting slowly
        const t = (m.t + frame * 0.0006 * m.sp) % 1;
        const u = m.u + Math.sin(frame * 0.02 * m.sp + i) * 0.03;
        const yy = ly + (y + h - ly) * t;
        const half = 16 * s + (w / 2 - 16 * s) * t;
        const xx = lx - half + 2 * half * u;
        const tw = 0.5 + 0.5 * Math.sin(frame * 0.15 * m.sp + i * 3);
        return <circle key={i} cx={xx} cy={yy} r={m.r * s} fill="#fff3d6" opacity={(0.25 + 0.55 * tw) * (1 - t * 0.5)} />;
      })}
    </svg>
  );
};

// The carousel projector seen from behind and above: body, round tray with numbered slots that turns one slot per
// change, lens glowing at the front.
export const Projector = ({ slot, light, at, scale = 1 }: { slot: number; light: number; at?: [number, number]; scale?: number }) => {
  const { s, width, height, lens: lens0 } = useRoom();
  const lens = lens0;
  const [ax, ay] = at ?? lens0;
  const [lx, ly] = lens;
  const cy = ly + 130 * s;
  const n = 24;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${ax} ${ay}) scale(${scale}) translate(${-lens0[0]} ${-lens0[1]})`}>
      <defs>
        <linearGradient id="m19-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b554c" />
          <stop offset="0.3" stopColor="#3a3631" />
          <stop offset="1" stopColor="#151311" />
        </linearGradient>
        <radialGradient id="m19-lens" cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.35" stopColor={C.beam} />
          <stop offset="1" stopColor="#6b4a1a" />
        </radialGradient>
      </defs>
      {/* shadow on the table */}
      <ellipse cx={lx} cy={cy + 160 * s} rx={300 * s} ry={30 * s} fill="#000" opacity={0.5} style={{ filter: `blur(${12 * s}px)` }} />
      {/* body */}
      <path d={`M${lx - 250 * s} ${cy + 150 * s} L${lx - 230 * s} ${cy - 40 * s} Q${lx - 226 * s} ${cy - 66 * s} ${lx - 200 * s} ${cy - 66 * s} H${lx + 200 * s} Q${lx + 226 * s} ${cy - 66 * s} ${lx + 230 * s} ${cy - 40 * s} L${lx + 250 * s} ${cy + 150 * s} Z`} fill="url(#m19-body)" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={lx + (-200 + i * 18) * s} y={cy + 60 * s} width={8 * s} height={60 * s} rx={4 * s} fill="#0c0b0a" />)}
      <rect x={lx + 60 * s} y={cy + 70 * s} width={120 * s} height={30 * s} rx={6 * s} fill="#23201c" stroke="#6d675e" strokeWidth={1.5 * s} />
      <circle cx={lx + 160 * s} cy={cy + 85 * s} r={6 * s} fill="#d23b2a" opacity={0.6 + 0.4 * light} />
      {/* the round tray */}
      <g transform={`translate(${lx} ${cy - 40 * s})`}>
        <ellipse rx={210 * s} ry={70 * s} fill="#2b2824" stroke="#6d675e" strokeWidth={2 * s} />
        <ellipse rx={210 * s} ry={70 * s} fill="none" stroke="#000" strokeWidth={10 * s} opacity={0.3} transform={`translate(0 ${6 * s})`} />
        {Array.from({ length: n }, (_, i) => {
          const a = ((i - slot) / n) * Math.PI * 2 + Math.PI / 2;
          const [c, sn] = [Math.cos(a), Math.sin(a)];
          if (sn < -0.2) return null; // back half hidden by the hub
          return (
            <g key={i}>
              <line x1={c * 120 * s} y1={sn * 40 * s} x2={c * 200 * s} y2={sn * 66 * s} stroke="#0f0e0c" strokeWidth={6 * s} />
              {i < 3 && <rect x={c * 160 * s - 16 * s} y={sn * 53 * s - 6 * s} width={32 * s} height={12 * s} fill={C.mount} opacity={0.85} transform={`rotate(${(a * 180) / Math.PI + 90} ${c * 160 * s} ${sn * 53 * s})`} />}
            </g>
          );
        })}
        <ellipse rx={110 * s} ry={36 * s} fill="#1f1c19" stroke="#55504a" strokeWidth={1.5 * s} />
        <ellipse rx={36 * s} ry={12 * s} fill="#4a453f" />
        <text y={-48 * s} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={22 * s} fill="#b9b1a3">
          {String(slot + 1).padStart(2, "0")}
        </text>
      </g>
      {/* lens barrel (pointing at the screen) */}
      <ellipse cx={lx} cy={ly + 22 * s} rx={62 * s} ry={30 * s} fill="#1a1816" />
      <ellipse cx={lx} cy={ly} rx={56 * s} ry={26 * s} fill="#2d2a26" stroke="#77716a" strokeWidth={2 * s} />
      <ellipse cx={lx} cy={ly} rx={38 * s} ry={17 * s} fill="url(#m19-lens)" opacity={0.35 + 0.65 * light} />
      <circle cx={lx} cy={ly} r={70 * s} fill={C.beam} opacity={0.35 * light} style={{ filter: `blur(${22 * s}px)` }} />
      </g>
    </svg>
  );
};

// A cardboard slide mount with a handwritten label on its border; `lit` 0…1 = light glowing through the window.
export const Mount = ({ x, y, no, label, year, note, lit, rot = 0, w = 250 }: { x: number; y: number; no: string; label: string; year: string; note: string; lit: number; rot?: number; w?: number }) => {
  const { s } = useRoom();
  const W = w * s;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: W, height: W, transform: `rotate(${rot}deg)`, background: C.mount, borderRadius: 14 * s, boxShadow: `0 ${10 * s}px ${24 * s}px rgba(0,0,0,0.7)`, fontFamily: hand, color: "#2a2520" }}>
      <div style={{ position: "absolute", left: W * 0.17, top: W * 0.17, width: W * 0.66, height: W * 0.42, borderRadius: 6 * s, background: `rgba(255,214,150,${0.12 + 0.7 * lit})`, boxShadow: `0 0 ${30 * s * lit}px rgba(255,214,150,${0.8 * lit}), inset 0 0 ${10 * s}px rgba(0,0,0,0.5)` }} />
      <div style={{ position: "absolute", left: 14 * s, top: 6 * s, fontSize: 24 * s, color: "#b8321f" }}>{no}</div>
      <div style={{ position: "absolute", right: 14 * s, top: 8 * s, fontSize: 21 * s }}>{year}</div>
      <div style={{ position: "absolute", left: 10 * s, right: 10 * s, bottom: W * 0.15, textAlign: "center", fontSize: 25 * s, lineHeight: 1.1 }}>{label}</div>
      <div style={{ position: "absolute", left: 10 * s, right: 10 * s, bottom: 3 * s, textAlign: "center", fontSize: 17 * s, color: "#7a6f62" }}>{note}</div>
    </div>
  );
};

type Lines = FeatureCollection<LineString | MultiLineString, { name: string | null; kind: string }>;
const ptsOf = (d: Lines | null, name: string) =>
  d ? d.features.filter((f) => f.properties.name === name).flatMap((f) => (f.geometry.type === "LineString" ? f.geometry.coordinates : f.geometry.coordinates.flat())) : [];

// A moat as one ordered curve: its OSM pieces sorted by angle round a point inside the old city.
export const useMoat = (name: string, centre: [number, number] = [100.488, 13.752]) => {
  const d = useJson<Lines>("data/th-bkk.geojson");
  return useMemo(() => {
    const pts = ptsOf(d, name) as [number, number][];
    return pts
      .map((p) => ({ p, a: Math.atan2(p[1] - centre[1], (p[0] - centre[0]) * Math.cos((13.75 * Math.PI) / 180)) }))
      .sort((a, b) => b.a - a.a)
      .map((x) => x.p);
  }, [d, name, centre]);
};

// River and canals faintly, so the slide reads as a city map even before the marks.
export const Waters = ({ opacity = 0.5 }: { opacity?: number }) => {
  const { path, s } = useMap();
  const d = useJson<Lines>("data/th-bkk.geojson");
  if (!d) return null;
  return (
    <g fill="none" strokeLinecap="round" opacity={opacity}>
      {d.features.filter((f) => f.properties.kind === "river").map((f, i) => <path key={i} d={path(f) ?? ""} stroke="#bfe0f2" strokeWidth={3 * s} />)}
    </g>
  );
};

// Grease-pencil mark along a line, drawn on up to `k`, with a slightly wobbly double stroke.
export const PencilLine = ({ pts, k, color = C.mark, width = 7, dashed = false }: { pts: [number, number][]; k: number; color?: string; width?: number; dashed?: boolean }) => {
  const { projection, s } = useMap();
  if (k <= 0 || pts.length < 2) return null;
  const xy = pts.map((p) => projection(p)).filter(Boolean) as [number, number][];
  const n = Math.max(2, Math.round(xy.length * k));
  const d = xy.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const d2 = xy.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0] + Math.sin(i * 1.3) * 2.5 * s} ${p[1] + Math.cos(i * 0.9) * 2.5 * s}`).join(" ");
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={color} strokeDasharray={dashed ? `${10 * s} ${12 * s}` : undefined}>
      <path d={d} strokeWidth={width * s} opacity={0.9} />
      <path d={d2} strokeWidth={width * 0.45 * s} opacity={0.6} />
    </g>
  );
};

// Veil outside a boundary (the area that was not yet city), as a polygon closed along the river bank.
export const Veil = ({ ring, k, color = "#2b1a12" }: { ring: [number, number][]; k: number; color?: string }) => {
  const { path, width, height } = useMap();
  if (k <= 0 || ring.length < 3) return null;
  const inner = path(region(ring)) ?? "";
  return <path d={`M-50 -50 H${width + 50} V${height + 50} H-50 Z ${inner}`} fillRule="evenodd" fill={color} opacity={0.5 * k} style={{ filter: "blur(14px)" }} />;
};

// Handwritten note on the slide (grease pencil), with a short pointer line.
export const Note = ({ at, text, sub, k, dx = 0, dy = -40, color = "#fff8ea", anchor = "middle" }: { at: [number, number]; text: string; sub?: string; k: number; dx?: number; dy?: number; color?: string; anchor?: "start" | "middle" | "end" }) => {
  const { projection, s } = useMap();
  const p = projection(at);
  if (!p || k <= 0) return null;
  const x = p[0] + dx * s;
  const y = p[1] + dy * s;
  return (
    <g opacity={k} fontFamily={hand} textAnchor={anchor}>
      <path d={`M${p[0]} ${p[1]} Q${(p[0] + x) / 2 + 20 * s} ${(p[1] + y) / 2} ${x} ${y + 12 * s}`} fill="none" stroke={color} strokeWidth={3 * s} strokeLinecap="round" />
      <circle cx={p[0]} cy={p[1]} r={6 * s} fill={color} />
      <text x={x} y={y} fontSize={44 * s} fill={color} stroke="#2a1a10" strokeWidth={7 * s} paintOrder="stroke" strokeLinejoin="round">
        {text}
      </text>
      {sub && (
        <text x={x} y={y - 46 * s} fontSize={30 * s} fill={color} stroke="#2a1a10" strokeWidth={6 * s} paintOrder="stroke" strokeLinejoin="round">
          {sub}
        </text>
      )}
    </g>
  );
};
