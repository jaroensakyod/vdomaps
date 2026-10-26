import { loadFont } from "@remotion/google-fonts/Prompt";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { continueRender, delayRender, interpolate } from "remotion";

// M32 LED billboard: a giant outdoor LED screen on a building at night, filmed from the street. Content is drawn
// in vector at 4× resolution, averaged down to the panel's LED grid, then every LED is drawn as three RGB
// sub-pixels behind a black mask — the grid stays visible even on black. A blurred copy of the low-res image is
// screened on top (bloom); a beat pattern (moiré) appears when the camera moves. Everything drawn in code.

const loaded = loadFont("normal", { weights: ["500", "700", "800"], subsets: ["thai", "latin"] });
export const font = loaded.fontFamily;

export const C = {
  night: "#06070d", // sky / LED off
  red: "#ff2a4a", // RGB red
  cyan: "#22d3ff", // RGB cyan
  yellow: "#ffd21f",
  white: "#f4f6ff",
  concrete: "#2a2b31",
  haze: "#ff9d5c",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const fade = (f: number, a: number, b: number, d = 10) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);

// Canvas text needs the font in memory before the first draw: hold the render until it is.
export const useFontReady = () => {
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender("led font"));
  useLayoutEffect(() => {
    loaded
      .waitUntilDone()
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(h);
      });
  }, [h]);
  return ready;
};

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

// Rasterise `draw` onto a cols×rows LED panel. Returns the full-resolution LED image and the low-res colours.
export const ledImage = (cols: number, rows: number, pitch: number, draw: Draw, ss = 4) => {
  const cw = cols * ss, ch = rows * ss;
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  draw(ctx, cw, ch);
  const src = ctx.getImageData(0, 0, cw, ch).data;
  const low = new ImageData(cols, rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < ss; j++)
        for (let i = 0; i < ss; i++) {
          const p = ((y * ss + j) * cw + x * ss + i) * 4;
          r += src[p];
          g += src[p + 1];
          b += src[p + 2];
        }
      const n = ss * ss;
      const q = (y * cols + x) * 4;
      low.data[q] = r / n;
      low.data[q + 1] = g / n;
      low.data[q + 2] = b / n;
      low.data[q + 3] = 255;
    }
  // LED layout inside one pitch cell: R, G, B sub-pixel columns, a black mask line on the right and bottom.
  const W = cols * pitch, H = rows * pitch;
  const out = new ImageData(W, H);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const q = (y * cols + x) * 4;
      const vary = 0.93 + hash(x, y) * 0.12; // LED-to-LED brightness spread
      const rgb = [low.data[q], low.data[q + 1], low.data[q + 2]];
      for (let j = 0; j < pitch - 1; j++) {
        const edge = j === 0 || j === pitch - 2 ? 0.72 : 1; // rounded LED ends
        for (let i = 0; i < pitch - 1; i++) {
          const c = Math.min(2, Math.floor((i * 3) / (pitch - 1)));
          const p = ((y * pitch + j) * W + x * pitch + i) * 4;
          const v = rgb[c] * vary * edge;
          // off LEDs are dark grey dots, not black: the panel reads as a panel
          out.data[p] = c === 0 ? 16 + v : 10 + v * 0.16;
          out.data[p + 1] = c === 1 ? 16 + v : 10 + v * 0.16;
          out.data[p + 2] = c === 2 ? 20 + v : 12 + v * 0.16;
          out.data[p + 3] = 255;
        }
      }
    }
  return { out, low, W, H };
};

const Paint = ({ img, style }: { img: ImageData; style: React.CSSProperties }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = img.width;
    cv.height = img.height;
    cv.getContext("2d")!.putImageData(img, 0, 0);
  }, [img]);
  return <canvas ref={ref} style={style} />;
};

// One LED panel placed at x, y. `deps` decides when to redraw (usually the frame).
export const LedPanel = ({ x, y, cols, rows, pitch, draw, deps, bloom = 0.6, ready }: { x: number; y: number; cols: number; rows: number; pitch: number; draw: Draw; deps: unknown[]; bloom?: number; ready: boolean }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const led = useMemo(() => (ready ? ledImage(cols, rows, pitch, draw) : null), [ready, cols, rows, pitch, ...deps]);
  if (!led) return <div style={{ position: "absolute", left: x, top: y, width: cols * pitch, height: rows * pitch, background: "#0b0b10" }} />;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: led.W, height: led.H }}>
      <Paint img={led.out} style={{ position: "absolute", inset: 0, width: led.W, height: led.H }} />
      {/* bloom: the light spills over the mask and into the night air */}
      <Paint img={led.low} style={{ position: "absolute", inset: 0, width: led.W, height: led.H, filter: `blur(${pitch * 0.55}px) saturate(1.15)`, mixBlendMode: "screen", opacity: Math.min(0.9, bloom * 1.25) }} />
      <Paint img={led.low} style={{ position: "absolute", left: -pitch * 8, top: -pitch * 8, width: led.W + pitch * 16, height: led.H + pitch * 16, filter: `blur(${pitch * 7}px)`, mixBlendMode: "screen", opacity: bloom * 0.35 }} />
    </div>
  );
};

// Moiré: the camera's sensor grid beating against the LED grid. Stronger when the camera moves.
export const Moire = ({ x, y, w, h, pitch, k, phase }: { x: number; y: number; w: number; h: number; pitch: number; k: number; phase: number }) => {
  if (k <= 0.01) return null;
  const a = pitch * 1.047;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, mixBlendMode: "multiply", opacity: k }}>
      <defs>
        <pattern id="m32-ma" width={pitch} height={pitch} patternUnits="userSpaceOnUse">
          <rect width={pitch} height={pitch} fill="#fff" />
          <rect width={pitch * 0.4} height={pitch} fill="#9a9aae" />
        </pattern>
        <pattern id="m32-mb" width={a} height={a} patternUnits="userSpaceOnUse" patternTransform={`rotate(${2.2 + phase * 0.6}) translate(${phase * 9} 0)`}>
          <rect width={a} height={a} fill="#fff" />
          <rect width={a * 0.4} height={a} fill="#a89ab4" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#m32-ma)" />
      <rect width={w} height={h} fill="url(#m32-mb)" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
};

// Blue hour over the city: sky gradient to a warm horizon, far towers with lit windows and aircraft lights.
export const Night = ({ width, height }: { width: number; height: number }) => {
  const towers = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const w = 80 + hash(i, 1) * 120;
        const h = 420 + hash(i, 2) * 620;
        const x = -60 + i * 118 + hash(i, 3) * 40;
        return { x, w, h };
      }),
    [],
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="m32-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1430" />
          <stop offset="0.42" stopColor="#1d2c68" />
          <stop offset="0.68" stopColor="#3e4083" />
          <stop offset="0.84" stopColor="#8a4d6a" />
          <stop offset="1" stopColor="#d0743f" />
        </linearGradient>
        <pattern id="m32-win" width={18} height={26} patternUnits="userSpaceOnUse">
          <rect x={4} y={6} width={9} height={12} fill="#f3c27a" opacity={0.3} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#m32-sky)" />
      {towers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={height - t.h} width={t.w} height={t.h} fill="#141a3a" />
          <rect x={t.x} y={height - t.h} width={t.w} height={t.h} fill="url(#m32-win)" opacity={0.4 + hash(i, 5) * 0.6} />
          {hash(i, 6) > 0.4 && <circle cx={t.x + t.w / 2} cy={height - t.h - 14} r={5} fill="#ff3b3b" opacity={0.9} />}
        </g>
      ))}
    </svg>
  );
};

// A rooftop billboard: the LED screen on a steel truss above the roof of a tower, lit floors below the roof.
export const Building = ({ x, w, top, screen }: { x: number; w: number; top: number; screen: [number, number, number, number] }) => {
  const [sx, sy, sw, sh] = screen;
  const floors = Array.from({ length: 12 }, (_, i) => top + 70 + i * 46);
  const legs = [0.08, 0.36, 0.64, 0.92].map((k) => sx + sw * k);
  const by = sy + sh + 22;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="m32-face" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#151827" />
          <stop offset="0.5" stopColor="#2b2a38" />
          <stop offset="1" stopColor="#11131f" />
        </linearGradient>
        <linearGradient id="m32-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a3a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ff8a3a" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* truss: legs and cross braces from the screen down to the roof */}
      {legs.map((lx, i) => (
        <g key={i}>
          <rect x={lx - 7} y={by} width={14} height={top - by} fill="#1a1c26" />
          {i < legs.length - 1 && <path d={`M${lx} ${by + 6}L${legs[i + 1]} ${top - 6}M${legs[i + 1]} ${by + 6}L${lx} ${top - 6}`} stroke="#1a1c26" strokeWidth={6} />}
        </g>
      ))}
      <rect x={sx - 34} y={by} width={sw + 68} height={12} fill="#232532" />
      {/* the tower below the roof */}
      <rect x={x} y={top} width={w} height={1920 - top} fill="url(#m32-face)" />
      <rect x={x - 10} y={top - 14} width={w + 20} height={18} fill="#222433" />
      <rect x={x} y={top} width={w} height={120} fill="url(#m32-spill)" />
      {floors.map((fy, i) => (
        <g key={i}>
          <rect x={x} y={fy} width={w} height={4} fill="#0b0b12" />
          <rect x={x + 18} y={fy + 6} width={w - 36} height={38} fill="#161a2a" />
          {Array.from({ length: 22 }, (_, k) => {
            const on = hash(i, k) > 0.62;
            const ww = (w - 36) / 22;
            return on ? <rect key={k} x={x + 18 + k * ww} y={fy + 6} width={ww} height={38} fill={hash(k, i) > 0.5 ? "#f1c98a" : "#bcd2ff"} opacity={0.12 + hash(k, i + 9) * 0.22} /> : null;
          })}
          {Array.from({ length: 23 }, (_, k) => <rect key={'m' + k} x={x + 17 + k * ((w - 36) / 22)} y={fy + 6} width={2} height={38} fill="#30344a" />)}
        </g>
      ))}
      {/* screen frame: steel border, light spill on the truss */}
      <rect x={sx - 22} y={sy - 22} width={sw + 44} height={sh + 44} fill="#050507" stroke="#3a3c4c" strokeWidth={4} />
      <rect x={sx - 8} y={sy - 8} width={sw + 16} height={sh + 16} fill="#000" />
      <rect x={sx - 40} y={by + 12} width={sw + 80} height={top - by} fill="url(#m32-spill)" />
    </svg>
  );
};

export const Small = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div style={{ fontFamily: font, fontWeight: 500, color: "#c9c4d6", ...style }}>{children}</div>
);
