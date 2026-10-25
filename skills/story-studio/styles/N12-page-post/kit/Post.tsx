import { loadFont } from "@remotion/google-fonts/Kanit";
import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cam } from "../../../components/camera";
import { country } from "../../../components/data";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";

// N12 page-post kit: a 4:5 Facebook post / cover (1080×1350, the tallest a feed shows uncropped). Dark satellite
// map with coloured areas, a red date badge, a 3-line headline with the question word in gold, an arched gold
// photo frame top right with a caption, a gold "coming soon" chip + page name at the bottom, credits line.
// The card is drawn centred in whatever frame it gets: in a 1080×1350 composition it fills it, in 9:16 it sits
// in the middle with dark bands above and below.

export const font = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] }).fontFamily;
export const GOLD = "#ffc94a";
export const RED = "#ff3b30";
export const BLUE = "#3d8bff";
export const BG = "#02060d";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const POST_W = 1080;
export const POST_H = 1350;

// Card geometry inside the current frame: unit `s` (1 at 1080 wide) and the card's top/height in px.
export const usePostBox = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width / POST_W, height / POST_H);
  const w = POST_W * s;
  const h = POST_H * s;
  return { s, w, h, left: (width - w) / 2, top: (height - h) / 2, width, height };
};

// Entrance: 0 → 1 spring starting at `at`.
const useIn = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping: 16 } });
};

// Map background clipped to the card. `focusY` is a share of the CARD height (0.63 = the subject sits low,
// under the headline). Children are map layers (use `useMap`).
export const PostMap = ({ cam, focusY = 0.63, raster = "sea", tint = 0.4, children }: { cam: Cam; focusY?: number; raster?: string; tint?: number; children?: ReactNode }) => {
  const { top, h, height, width } = usePostBox();
  return (
    <>
      <MapFrame cam={cam} focusY={(top + h * focusY) / height}>
        <Raster layers={[{ name: raster }]} />
        <rect width={width} height={height} fill="#06112b" opacity={tint} />
        {children}
      </MapFrame>
    </>
  );
};

// Country areas: fill 42 %, 3 px line. Labels: white Kanit 900 with a thick coloured outline.
export const Areas = ({ ids, color, opacity = 0.42 }: { ids: string[]; color: string; opacity?: number }) => {
  const { path, s } = useMap();
  return <g>{ids.map((id) => <path key={id} d={path(country(id)) ?? ""} fill={color} fillOpacity={opacity} stroke={color} strokeWidth={3 * s} strokeLinejoin="round" />)}</g>;
};
// The hero country: blurred gold glow + gold fill 22 % + 5 px gold line.
export const Hero = ({ id, color = GOLD, glow = 1 }: { id: string; color?: string; glow?: number }) => {
  const { path, s } = useMap();
  const d = path(country(id)) ?? "";
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={22 * s} strokeOpacity={0.35 * glow} style={{ filter: `blur(${10 * s}px)` }} />
      <path d={d} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={5 * s} strokeLinejoin="round" />
    </g>
  );
};
export const MapLabel = ({ at, text, color, size, k = 1 }: { at: [number, number]; text: string; color: string; size: number; k?: number }) => {
  const { projection, s } = useMap();
  const p = projection(at)!;
  return (
    <text x={p[0]} y={p[1]} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={size * s} stroke={color} strokeWidth={10 * s} paintOrder="stroke" strokeLinejoin="round" opacity={k}>{text}</text>
  );
};
// Place marker: gold dot with white rim + a ring (pulses with `pulse` 0–1).
export const Spot = ({ at, pulse = 0, color = GOLD }: { at: [number, number]; pulse?: number; color?: string }) => {
  const { projection, s } = useMap();
  const p = projection(at)!;
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={(36 + pulse * 26) * s} fill="none" stroke={color} strokeWidth={4 * s} opacity={0.6 * (1 - pulse * 0.7)} />
      <circle cx={p[0]} cy={p[1]} r={14 * s} fill={color} stroke="#fff" strokeWidth={4 * s} />
    </g>
  );
};

// Arched gold frame (top right). `photo` = a file in public/ (the user's own picture); otherwise `children`
// draws an illustration inside a 330×420 box (SVG units).
export const ArchFrame = ({ photo, caption, children, at = 20 }: { photo?: string; caption?: ReactNode; children?: ReactNode; at?: number }) => {
  const { s } = usePostBox();
  const k = useIn(at);
  return (
    <>
      <div style={{ position: "absolute", right: 44 * s, top: 48 * s, width: 330 * s, height: 420 * s, borderRadius: `${165 * s}px ${165 * s}px ${18 * s}px ${18 * s}px`, border: `${7 * s}px solid ${GOLD}`, overflow: "hidden", boxShadow: `0 0 ${50 * s}px rgba(255,201,74,0.45), 0 ${14 * s}px ${40 * s}px rgba(0,0,0,0.7)`, opacity: k, transform: `translateY(${(1 - k) * 30 * s}px)`, background: "#0b1426" }}>
        {photo ? (
          <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%", filter: "sepia(0.35) contrast(1.05)" }} />
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 330 420" preserveAspectRatio="xMidYMid slice">{children}</svg>
        )}
      </div>
      {caption && <div style={{ position: "absolute", right: 44 * s, top: 480 * s, width: 330 * s, textAlign: "center", fontFamily: font, fontSize: 22 * s, fontWeight: 700, color: GOLD, lineHeight: 1.3, textShadow: "0 3px 10px rgba(0,0,0,0.9)", opacity: k }}>{caption}</div>}
    </>
  );
};

// Headline block (top left): red date badge, 80 px 3-line headline (last part in gold), 38 px sub line.
export const Headline = ({ badge, lines, ask, sub, at = 6 }: { badge: string; lines: string[]; ask: string; sub?: string; at?: number }) => {
  const { s } = usePostBox();
  const a = useIn(at);
  const b = useIn(at + 8);
  const c = useIn(at + 16);
  return (
    <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 56 * s, fontFamily: font, color: "#fff", lineHeight: 1.3, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
      <div style={{ display: "inline-block", background: RED, borderRadius: 14 * s, padding: `${4 * s}px ${24 * s}px`, fontSize: 38 * s, fontWeight: 700, opacity: a, transform: `translateX(${(1 - a) * -40 * s}px)` }}>{badge}</div>
      <div style={{ fontSize: 80 * s, fontWeight: 900, marginTop: 16 * s, lineHeight: 1.2, opacity: b, transform: `translateY(${(1 - b) * 24 * s}px)` }}>
        {lines.map((l) => <div key={l}>{l}</div>)}
        <span style={{ color: GOLD }}>{ask}</span>
      </div>
      {sub && <div style={{ fontSize: 38 * s, fontWeight: 700, opacity: 0.92 * c, marginTop: 14 * s }}>{sub}</div>}
    </div>
  );
};

// Bottom bar: gold chip (left) + page name with its second part in gold (right), credits line under it.
export const Footer = ({ chip, brand, credit, at = 30 }: { chip: string; brand: [string, string]; credit?: string; at?: number }) => {
  const { s } = usePostBox();
  const k = useIn(at);
  return (
    <>
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, bottom: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.3, opacity: k, transform: `translateY(${(1 - k) * 20 * s}px)` }}>
        <div style={{ background: GOLD, color: "#1a1200", borderRadius: 12 * s, padding: `${4 * s}px ${22 * s}px`, fontSize: 36 * s, fontWeight: 900 }}>{chip}</div>
        <div style={{ fontSize: 32 * s, fontWeight: 900 }}>{brand[0]}<span style={{ color: GOLD }}>{brand[1]}</span></div>
      </div>
      {credit && <div style={{ position: "absolute", left: 0, right: 0, bottom: 12 * s, textAlign: "center", fontFamily: font, fontSize: 17 * s, color: "rgba(255,255,255,0.55)" }}>{credit}</div>}
    </>
  );
};

// The card: background (PostMap or any layer) + top/bottom dark fades + the HTML layers, clipped to 4:5.
export const PostCard = ({ background, children }: { background: ReactNode; children: ReactNode }) => {
  const { left, top, w, h, s } = usePostBox();
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left, top, width: w, height: h, overflow: "hidden", background: BG, opacity: fade, boxShadow: `0 0 ${60 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ position: "absolute", left: -left, top: -top, width: left * 2 + w, height: top * 2 + h }}>{background}</div>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,6,13,0.97) 0%, rgba(2,6,13,0.9) 24%, rgba(2,6,13,0) 40%, rgba(2,6,13,0) 84%, rgba(2,6,13,0.95) 100%)" }} />
        {children}
      </div>
    </AbsoluteFill>
  );
};
