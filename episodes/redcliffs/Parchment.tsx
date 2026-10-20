import { loadFont as loadChonburi } from "@remotion/google-fonts/Chonburi";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { geoArea, geoGraticule10 } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import land50 from "world-atlas/land-50m.json";
import { isVisible } from "../../components/camera";
import { useMap } from "../../components/Map";
import water from "./china-water.json";

// Style S13 "Parchment Explorer", tuned for Three Kingdoms.
export const fonts = {
  title: loadChonburi("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily,
  body: loadKanit("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily,
};

export const C = {
  paper: "#e6d4aa",
  sea: "#c9b68c",
  land: "#efe1bb",
  coast: "#5b4026",
  river: "#4d7488",
  lake: "#b7c4b1",
  ink: "#3b2a1a",
  wei: "#2f4f86",
  shu: "#2f7a45",
  wu: "#b0302a",
  fire: "#ff7a1a",
};

const landTopo = land50 as unknown as Topology<{ land: GeometryCollection }>;
export const land = feature(landTopo, landTopo.objects.land);
const rivers = (water as { rivers: FeatureCollection<Geometry, { main: boolean; rank: number }> }).rivers;
// Drop rings that rounding made degenerate: d3 would read them as "everything except this lake".
const lakes = (water as { lakes: FeatureCollection }).lakes.features.filter((f) => geoArea(f) < 2 * Math.PI);

// Paper sea + land with an ink coastline. Also defines <clipPath id="land"> for <Region>.
export const PaperMap = ({ riverBoost = 0 }: { riverBoost?: number }) => {
  const { path, projection, s } = useMap();
  const landD = path(land) ?? "";
  const pxPerDeg = (projection.scale() * Math.PI) / 180;
  // Main rivers get wider as the camera zooms in, up to a visible "water" band at battle scale.
  const mainW = Math.max(3.2 * s, Math.min(pxPerDeg * 0.02, 70 * s)) * (1 + riverBoost);
  return (
    <g>
      <defs>
        <clipPath id="land">
          <path d={landD} />
        </clipPath>
      </defs>
      <path d={path({ type: "Sphere" }) ?? ""} fill={C.sea} stroke={C.coast} strokeWidth={2 * s} />
      <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="rgba(91,64,38,0.13)" strokeWidth={1 * s} />
      <path d={landD} fill="none" stroke={C.coast} strokeWidth={7 * s} strokeOpacity={0.15} />
      <path d={landD} fill={C.land} stroke={C.coast} strokeWidth={1.6 * s} strokeLinejoin="round" />
      {lakes.map((f, i) => (
        <path key={i} d={path(f) ?? ""} fill={C.lake} stroke={C.river} strokeWidth={1 * s} />
      ))}
      {rivers.features.map((f, i) => (
        <path
          key={i}
          d={path(f) ?? ""}
          fill="none"
          stroke={C.river}
          strokeWidth={f.properties.main ? mainW : Math.max(1, (1.6 - f.properties.rank * 0.12) * s)}
          strokeOpacity={f.properties.main ? 0.9 : 0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

// Grain + blotches + vignette, drawn live with SVG noise filters. Slow (full-frame feTurbulence every frame),
// so render it once per aspect ratio with the PaperTex* compositions and use <PaperTexture> in the video.
export const PaperTextureLive = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0.24  0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0.55 0" />
        </filter>
        <filter id="blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={3} seed={11} />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.5 -0.12" />
        </filter>
        <radialGradient id="vig" cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="#3b2a1a" stopOpacity={0} />
          <stop offset="1" stopColor="#2a1b0e" stopOpacity={0.55} />
        </radialGradient>
        <rect width={width} height={height} filter="url(#blotch)" />
        <rect width={width} height={height} filter="url(#grain)" opacity={0.35} />
        <rect width={width} height={height} fill="url(#vig)" />
      </svg>
    </AbsoluteFill>
  );
};

const usePop = (start: number, end?: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - start, fps, config: { damping: 12, mass: 0.6 } });
  const out = end === undefined ? 1 : interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { frame, k, out };
};

// Faction leader badge: coloured banner with name, pin to the place. HTML via foreignObject for auto width.
export const Badge = ({
  at,
  name,
  sub,
  color,
  start,
  end,
  above = true,
}: {
  at: [number, number];
  name: string;
  sub?: string;
  color: string;
  start: number;
  end?: number;
  above?: boolean;
}) => {
  const { projection, cam, s } = useMap();
  const { frame, k, out } = usePop(start, end);
  if (frame < start || out <= 0 || !isVisible(cam, at)) return null;
  const xy = projection(at);
  if (!xy) return null;
  const W = 520 * s;
  const H = 150 * s;
  const gap = 22 * s;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={out}>
      <circle r={9 * s * k} fill={color} stroke="#fff6dd" strokeWidth={3 * s} />
      <g transform={`scale(${k})`}>
        <foreignObject x={-W / 2} y={above ? -H - gap : gap} width={W} height={H}>
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: above ? "flex-end" : "flex-start",
              fontFamily: fonts.body,
            }}
          >
            <div
              style={{
                background: color,
                color: "#fff6dd",
                fontSize: 40 * s,
                fontWeight: 700,
                lineHeight: 1.45,
                padding: `${2 * s}px ${22 * s}px`,
                borderRadius: 10 * s,
                border: `${3 * s}px solid #fff6dd`,
                boxShadow: `0 ${4 * s}px ${10 * s}px rgba(40,25,10,0.4)`,
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>
            {sub && (
              <div
                style={{
                  marginTop: 4 * s,
                  fontSize: 26 * s,
                  fontWeight: 600,
                  color: C.ink,
                  lineHeight: 1.4,
                  WebkitTextStroke: `${6 * s}px ${C.land}`,
                  paintOrder: "stroke fill",
                  whiteSpace: "nowrap",
                }}
              >
                {sub}
              </div>
            )}
          </div>
        </foreignObject>
      </g>
    </g>
  );
};

// Small ink place name with a paper halo.
export const InkLabel = ({
  at,
  text,
  start,
  end,
  size = 1,
  dot = true,
  dy = -16,
  color = C.ink,
}: {
  at: [number, number];
  text: string;
  start: number;
  end?: number;
  size?: number;
  dot?: boolean;
  dy?: number;
  color?: string;
}) => {
  const { projection, cam, s } = useMap();
  const { frame, k, out } = usePop(start, end);
  if (frame < start || out <= 0 || !isVisible(cam, at)) return null;
  const xy = projection(at);
  if (!xy) return null;
  return (
    <g transform={`translate(${xy[0]},${xy[1]})`} opacity={out * Math.min(1, k)}>
      {dot && <rect x={-6 * s} y={-6 * s} width={12 * s} height={12 * s} fill={C.ink} transform="rotate(45)" />}
      <text
        y={dy * s}
        textAnchor="middle"
        fontFamily={fonts.body}
        fontWeight={600}
        fontSize={34 * s * size}
        fill={color}
        stroke={C.land}
        strokeWidth={8 * s}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {text}
      </text>
    </g>
  );
};

// The pre-rendered texture: public/paper-16x9.png and public/paper-9x16.png (npm run paper).
export const PaperTexture = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Img src={staticFile(height > width ? "paper-9x16.png" : "paper-16x9.png")} style={{ width, height }} />
    </AbsoluteFill>
  );
};
