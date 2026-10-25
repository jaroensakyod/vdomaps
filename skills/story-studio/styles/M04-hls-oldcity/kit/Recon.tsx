import { loadFont as loadChakra } from "@remotion/google-fonts/ChakraPetch";
import { loadFont as loadSriracha } from "@remotion/google-fonts/Sriracha";
import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { camForFeature, projectionFor, type Cam } from "../../../components/camera";
import { bbox } from "../../../components/Region";
import { cues } from "../../../components/subs.mjs";

// M04 recon film: the real NASA HLS / Blue Marble imagery graded to grainy green-grey monochrome, printed on a film
// frame lying on a light box — bright sprocket holes, edge print and frame counters, fiducial marks and measuring
// ticks, a typed dossier label taped on with a red "ลับ" stamp, analyst grease pencil on top (kit/Pencil.tsx).

export const fonts = {
  type: loadChakra("normal", { weights: ["400", "500", "600", "700"], subsets: ["thai", "latin"] }).fontFamily,
  hand: loadSriracha("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily,
};
export const C = {
  base: "#0b0c0a", // film base
  emul: "#8f9a84", // green-grey emulsion mid tone
  silver: "#d8dccf", // highlights / light box
  red: "#d9342b", // grease pencil red, stamp
  yellow: "#f2d64b", // grease pencil yellow
  paper: "#e9e3d0", // dossier label, caption tape
  ink: "#1b1c18", // typewriter ink
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const s = Math.min(width, height) / 1080;
  const perf = 74 * s; // sprocket strip
  // image window inside the film frame
  const img = vertical ? { x: perf + 8 * s, y: 26 * s, w: width - 2 * (perf + 8 * s), h: height - 52 * s } : { x: 26 * s, y: perf + 8 * s, w: width - 52 * s, h: height - 2 * (perf + 8 * s) };
  return { width, height, vertical, s, perf, img };
};

// Approximate points and views (central plain / Ayutthaya).
export const P = {
  ayut: [100.566, 14.357],
  sanphet: [100.5585, 14.3559], // Wat Phra Si Sanphet (next to the old Grand Palace)
  mahathat: [100.5675, 14.3571], // Wat Mahathat
  chaiwat: [100.5417, 14.343], // Wat Chaiwatthanaram (west bank, off the island)
  phanan: [100.5843, 14.3452], // Wat Phanan Choeng (east bank of the Pasak)
  phet: [100.5735, 14.3445], // Phet fortress (south-east corner of the island)
} satisfies Record<string, [number, number]>;
export const V = {
  island: bbox([[100.52, 14.32], [100.62, 14.4]]),
  central: bbox([[99.4, 13.3], [101.6, 15.4]]),
  region: bbox([[94.0, 5.0], [108.0, 21.0]]),
};

// Camera on a feature, zoomed by k, subject lifted by `lift` of the height.
export const view = (f: Parameters<typeof camForFeature>[0], width: number, height: number, k = 1, lift = 0.08): Cam => {
  const c = camForFeature(f, width, height, 0.02);
  const scaled = { ...c, scale: c.scale * k };
  const p = projectionFor(scaled, width, height);
  const [lon, lat] = p.invert!([width / 2, height / 2 + height * lift])!;
  return { lon, lat, scale: scaled.scale };
};
// A sharper tile only shows once it covers the whole screen.
export const tileOpacity = (cam: Cam, w: number, h: number, [x0, y0, x1, y1]: [number, number, number, number]) => {
  const p = projectionFor(cam, w, h);
  let n = 0;
  let inside = 0;
  for (let i = 0; i <= 11; i++)
    for (let j = 0; j <= 19; j++) {
      const q = p.invert!([(w * i) / 11, (h * j) / 19]);
      n++;
      if (q && q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1) inside++;
    }
  return Math.min(1, Math.max(0, (inside / n - 0.8) * 5));
};
export const screenKm = (scale: number, width: number) => (width / scale) * 6371;
export const fmtKm = (km: number) => (km >= 100 ? Math.round(km / 10) * 10 : km >= 10 ? Math.round(km) : Math.round(km * 10) / 10).toLocaleString("en-US");

// Gate weave: the film drifts a pixel or two in the gate, brightness breathes a little.
export const weave = (frame: number, s: number) => ({
  x: (Math.sin(frame * 0.37) * 1.2 + Math.sin(frame * 1.3) * 0.6) * s,
  y: (Math.sin(frame * 0.29 + 1) * 1.6 + Math.sin(frame * 1.9) * 0.5) * s,
  b: 1 + Math.sin(frame * 0.9) * 0.015 + (random(`fl${frame}`) - 0.5) * 0.03,
});

// The photographic print: children (Raster) are graded to green-grey silver with lifted blacks, grain and vignette.
export const Print = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { width, height, s, img } = useLayout();
  const w = weave(frame, s);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${img.y}px ${width - img.x - img.w}px ${height - img.y - img.h}px ${img.x}px round ${6 * s}px)` }}>
      <AbsoluteFill style={{ transform: `translate(${w.x}px,${w.y}px)`, filter: `grayscale(1) contrast(1.55) brightness(${1.02 * w.b})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "#7d8f74", mixBlendMode: "color" }} />
      <AbsoluteFill style={{ background: "#1c2219", mixBlendMode: "screen" }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.55 }}>
        <filter id="m04-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={width} height={height} filter="url(#m04-grain)" />
      </svg>
      <Dust />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)` }} />
    </AbsoluteFill>
  );
};

// A few dust specks and hair scratches, new every frame (film is never clean).
const Dust = () => {
  const frame = useCurrentFrame();
  const { width, height, s } = useLayout();
  const specks = Array.from({ length: 7 }, (_, i) => ({ x: random(`dx${frame}-${i}`) * width, y: random(`dy${frame}-${i}`) * height, r: (1 + random(`dr${frame}-${i}`) * 3) * s, w: random(`dw${frame}-${i}`) > 0.5 }));
  const hair = random(`h${Math.floor(frame / 9)}`) > 0.55;
  const hx = random(`hx${Math.floor(frame / 9)}`) * width;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      {specks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.w ? "#f4f6ee" : "#050605"} opacity={0.7} />)}
      {hair && <path d={`M${hx} ${height * 0.1} q${30 * s} ${height * 0.2} ${-10 * s} ${height * 0.45}`} stroke="#f4f6ee" strokeWidth={1.2 * s} fill="none" opacity={0.35} />}
    </svg>
  );
};

// Film frame on a light box: base, bright sprocket holes, edge print and frame counters, fiducials, ticks.
export const FilmFrame = ({ counter, roll = "ม้วน 0417" }: { counter: string; roll?: string }) => {
  const { width, height, vertical, s, perf, img } = useLayout();
  const holes: ReactNode[] = [];
  const along = vertical ? height : width;
  const pitch = 56 * s;
  for (let t = 18 * s, i = 0; t < along; t += pitch, i++) {
    for (const side of [0, 1]) {
      const a = perf * 0.3;
      const hw = perf * 0.42;
      const hl = pitch * 0.56;
      const x = vertical ? (side ? width - a - hw : a) : t;
      const y = vertical ? t : side ? height - a - hw : a;
      holes.push(<rect key={`${i}-${side}`} x={x} y={y} width={vertical ? hw : hl} height={vertical ? hl : hw} rx={5 * s} fill="#eef3e6" />);
    }
  }
  // edge print, rotated along the strip
  const edge = (text: string, t: number, side: number, key: string, color = "#c7b56b") => {
    const x = vertical ? (side ? width - perf * 0.12 : perf * 0.12) : t;
    const y = vertical ? t : side ? height - perf * 0.08 : perf * 0.92;
    return (
      <text key={key} x={x} y={y} transform={vertical ? `rotate(${side ? 90 : -90} ${x} ${y})` : undefined} textAnchor="middle" fontFamily={fonts.type} fontWeight={600} fontSize={17 * s} fill={color} letterSpacing={3 * s}>
        {text}
      </text>
    );
  };
  const ticks: ReactNode[] = [];
  const tick = 12 * s;
  for (let x = img.x; x <= img.x + img.w; x += 20 * s) {
    const big = Math.round((x - img.x) / (20 * s)) % 5 === 0;
    ticks.push(<line key={`tx${x}`} x1={x} x2={x} y1={img.y} y2={img.y + (big ? tick * 1.8 : tick)} />, <line key={`bx${x}`} x1={x} x2={x} y1={img.y + img.h} y2={img.y + img.h - (big ? tick * 1.8 : tick)} />);
  }
  for (let y = img.y; y <= img.y + img.h; y += 20 * s) {
    const big = Math.round((y - img.y) / (20 * s)) % 5 === 0;
    ticks.push(<line key={`ly${y}`} y1={y} y2={y} x1={img.x} x2={img.x + (big ? tick * 1.8 : tick)} />, <line key={`ry${y}`} y1={y} y2={y} x1={img.x + img.w} x2={img.x + img.w - (big ? tick * 1.8 : tick)} />);
  }
  const cx = img.x + img.w / 2;
  const cy = img.y + img.h / 2;
  const fid = 22 * s;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <path fillRule="evenodd" d={`M0 0H${width}V${height}H0Z M${img.x} ${img.y + 6 * s} q0 ${-6 * s} ${6 * s} ${-6 * s} H${img.x + img.w - 6 * s} q${6 * s} 0 ${6 * s} ${6 * s} V${img.y + img.h - 6 * s} q0 ${6 * s} ${-6 * s} ${6 * s} H${img.x + 6 * s} q${-6 * s} 0 ${-6 * s} ${-6 * s} Z`} fill={C.base} />
      {holes}
      {[0.12, 0.42, 0.72].map((t, i) => edge(`${roll}  ▸  ${counter}${i ? "" : "A"}`, along * t, 0, `e${i}`))}
      {[0.27, 0.57, 0.87].map((t, i) => edge(`ฟิล์มลาดตระเวน  ·  ${counter}`, along * t, 1, `f${i}`, "#a99a5c"))}
      <g stroke="#f4f6ee" strokeOpacity={0.75} strokeWidth={1.6 * s}>{ticks}</g>
      {/* fiducial marks at the middle of each edge and a centre reticle */}
      <g stroke="#f4f6ee" strokeWidth={2.4 * s} fill="none" opacity={0.85}>
        {[[cx, img.y + 40 * s], [cx, img.y + img.h - 40 * s], [img.x + 40 * s, cy], [img.x + img.w - 40 * s, cy]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M${x - fid} ${y} H${x + fid} M${x} ${y - fid} V${y + fid}`} />
            <circle cx={x} cy={y} r={fid * 0.45} />
          </g>
        ))}
        <path d={`M${cx - 70 * s} ${cy} H${cx - 18 * s} M${cx + 18 * s} ${cy} H${cx + 70 * s} M${cx} ${cy - 70 * s} V${cy - 18 * s} M${cx} ${cy + 18 * s} V${cy + 70 * s}`} strokeWidth={1.6 * s} />
      </g>
    </svg>
  );
};

// Typed dossier label taped onto the print, with the red "ลับ" stamp. One label per shot; the stat updates live.
export type Head = { f: number; tag: string; head: string; stat?: string; label?: string };
export const Dossier = ({ heads, end }: { heads: Head[]; end: number }) => {
  const frame = useCurrentFrame();
  const { vertical, s, img } = useLayout();
  const list = heads.filter((h) => frame >= h.f);
  if (!list.length || frame > end) return null;
  const h = list[list.length - 1];
  const k = interpolate(frame, [heads[0].f, heads[0].f + 10], [0, 1], clamp);
  const swap = interpolate(frame, [h.f, h.f + 6], [0, 1], clamp);
  const typed = Math.floor(interpolate(frame, [h.f, h.f + 16], [0, h.head.length], clamp));
  const left = img.x + 40 * s;
  const w = vertical ? img.w - 80 * s : 760 * s;
  const stampOn = interpolate(frame, [heads[0].f + 14, heads[0].f + 20], [2, 1], clamp);
  return (
    <div style={{ position: "absolute", left, top: img.y + (vertical ? 70 : 40) * s, width: w, transform: `rotate(-0.8deg) translateY(${(1 - k) * -30 * s}px)`, opacity: k }}>
      <div style={{ position: "relative", background: C.paper, padding: `${20 * s}px ${30 * s}px ${22 * s}px`, fontFamily: fonts.type, color: C.ink, boxShadow: `0 ${8 * s}px ${22 * s}px rgba(0,0,0,0.55)`, backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(160,150,120,0.18))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 * s, fontWeight: 500, letterSpacing: 1 * s, borderBottom: `${2 * s}px solid ${C.ink}`, paddingBottom: 6 * s }}>
          <span>M04 · ฟิล์มลาดตระเวน</span>
          <span>{h.tag}</span>
        </div>
        <div style={{ fontSize: 54 * s, fontWeight: 700, lineHeight: 1.35, marginTop: 8 * s, opacity: 0.4 + 0.6 * swap }}>
          {h.head.slice(0, typed)}
          <span style={{ opacity: frame % 16 < 8 && typed < h.head.length ? 1 : 0 }}>▌</span>
        </div>
        {h.stat && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 * s, fontWeight: 600 }}>
            <span style={{ fontSize: 30 * s, letterSpacing: 2 * s }}>{h.label?.split("|")[0]}</span>
            <span style={{ fontSize: 84 * s, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{h.stat}</span>
            <span style={{ fontSize: 30 * s }}>{h.label?.split("|")[1]}</span>
          </div>
        )}
        <div style={{ position: "absolute", right: 30 * s, top: 70 * s, transform: `rotate(9deg) scale(${stampOn})`, border: `${5 * s}px solid ${C.red}`, color: C.red, padding: `${0}px ${22 * s}px`, fontFamily: fonts.type, fontWeight: 700, fontSize: 64 * s, lineHeight: 1.3, opacity: 0.85 * Math.min(1, frame > heads[0].f + 14 ? 1 : 0), maskImage: "radial-gradient(circle at 30% 40%, #000 55%, rgba(0,0,0,0.55) 100%)" }}>ลับ</div>
        {/* tape */}
        {[-1, 1].map((d) => (
          <div key={d} style={{ position: "absolute", top: -16 * s, [d < 0 ? "left" : "right"]: 40 * s, width: 120 * s, height: 36 * s, background: "rgba(232,222,190,0.6)", transform: `rotate(${d * 6}deg)`, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        ))}
      </div>
    </div>
  );
};

// Caption on a strip of typed paper tape (9:16 at `top`, 16:9 at the bottom).
export const TapeCaption = ({ text, start, len, top = 0.765 }: { text: string; start: number; len: number; top?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { vertical, s, height, width } = useLayout();
  if (frame < start || frame >= start + len) return null;
  const list = cues({ text, sec: len / fps, maxChars: vertical ? 20 : 30 });
  const t = (frame - start) / fps;
  const cue = list.find((c) => t < c.end) ?? list[list.length - 1];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? height * top : undefined, bottom: vertical ? undefined : 120 * s, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: width * 0.8, background: C.paper, color: C.ink, fontFamily: fonts.type, fontWeight: 600, fontSize: (vertical ? 54 : 46) * s, lineHeight: 1.4, padding: `${6 * s}px ${26 * s}px`, transform: "rotate(-0.6deg)", boxShadow: `0 ${6 * s}px ${16 * s}px rgba(0,0,0,0.5)`, textAlign: "center" }}>{cue.text}</div>
    </div>
  );
};

// Data block burned into the frame by the camera: date, time, altitude, source, scale.
export const DataBlock = ({ lines, scale }: { lines: string[]; scale?: { px: number; label: string } }) => {
  const { vertical, s, img } = useLayout();
  const x = img.x + 40 * s;
  const y = vertical ? img.y + img.h - 210 * s : img.y + img.h - 150 * s;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: fonts.type, color: "#f4f6ee", fontSize: 22 * s, fontWeight: 500, letterSpacing: 2 * s, lineHeight: 1.5, textShadow: "0 0 3px #000" }}>
      <div style={{ border: `${1.5 * s}px solid rgba(244,246,238,0.8)`, padding: `${6 * s}px ${12 * s}px`, background: "rgba(5,6,5,0.55)" }}>
        {lines.map((l) => <div key={l}>{l}</div>)}
      </div>
      {scale && (
        <div style={{ marginTop: 10 * s }}>
          <div style={{ display: "flex", width: scale.px, height: 10 * s, border: `${1.5 * s}px solid #f4f6ee` }}>
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ flex: 1, background: i % 2 ? "transparent" : "#f4f6ee" }} />)}
          </div>
          <div style={{ fontSize: 22 * s, marginTop: 2 * s }}>{scale.label}</div>
        </div>
      )}
    </div>
  );
};
