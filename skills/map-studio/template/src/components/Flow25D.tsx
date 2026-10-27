import { continueRender, delayRender, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useEffect, useState, type ReactNode } from "react";
import { useJson } from "./useJson";

// SVG <image> is not awaited by Remotion (unlike <Img>), so a frame could be captured before a layer had loaded
// (blank panel, flagged by check-glitch). Hold the render until every file is decoded; decoded files are cached.
const loaded = new Map<string, Promise<void>>();
const load = (url: string) => {
  if (!loaded.has(url))
    loaded.set(
      url,
      new Promise<void>((ok) => {
        const im = new Image();
        im.onload = () => (im.decode ? im.decode().then(ok, ok) : ok());
        im.onerror = () => ok();
        im.src = url;
      }),
    );
  return loaded.get(url)!;
};
const useImagesReady = (urls: string[]) => {
  const key = urls.join("|");
  const [handle] = useState(() => (urls.length ? delayRender(`flow images ${urls[0]}`) : null));
  useEffect(() => {
    if (handle === null) return;
    Promise.all(urls.map(load)).then(() => continueRender(handle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, handle]);
};
// A picture inside the svg drawn with Remotion's <Img> in a foreignObject: <Img> holds each frame until the bitmap
// is decoded, which a plain svg <image> does not (frames came out blank or half-faded).
const Pic = ({ src, x, y, w, h }: { src: string; x: number; y: number; w: number; h: number }) => (
  <foreignObject x={x} y={y} width={w} height={h}>
    <Img src={src} style={{ width: "100%", height: "100%", display: "block" }} />
  </foreignObject>
);
/** Draw a still's files tiny and almost invisible from `from` to `to` (e.g. 45 frames before a panel opens), so the
 *  browser has them decoded and painted when the panel's first frame is captured — without it a new panel's first
 *  frame sometimes still showed the previous picture (check-glitch flags it). Put it inside the same svg. */
export const FlowWarm = ({ name, from, to, layers = 6, rig, parts = [] }: { name: string; from: number; to: number; layers?: number; rig?: string; parts?: string[] }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const files = [...Array.from({ length: layers }, (_, i) => staticFile(`flow/${name}-L${i}.png`)), ...parts.map((p) => staticFile(`flow/${rig}-part-${p}.png`))];
  return (
    <g opacity={0.01}>
      {files.map((f, i) => <Pic key={f} src={f} x={i * 3} y={0} w={3} h={3} />)}
    </g>
  );
};
// Preloads the layer and part files once their counts are known (after the json arrives).
const Preload = ({ urls }: { urls: string[] }) => {
  useImagesReady(urls);
  return null;
};

// Free 2.5D motion for one still (a Flow / Nano Banana image, a painting, a photo). Prepare it once with
//   npm run flow-layers -- <image> <name>
// then draw it inside any <svg> (full screen with <Flow25DScreen>, or inside an InsetPanel with box = the panel geom).
// Everything is code: depth layers that drift by their depth, a slow push-in, wind on chosen areas, smoke between
// layers, warm light rays, dust, and a soft shake + flash on impacts — and, with `rig`, cut-out parts (from
// `npm run flow-parts`) that rotate about pivots: a sword swings, a trunk sways, soldiers bob. No API, no credits,
// renders on any machine.
// Flashes rise over 2 frames and fade over 12, light pulses are slow sines — nothing strobes (house rule).

type Meta = { width: number; height: number; aspect: number; layers: number };
/** a rectangle in fractions of the picture: [x0, y0, x1, y1] */
export type Area = [number, number, number, number];
export type Flow25DProps = {
  name: string;
  id: string;
  box: { x: number; y: number; w: number; h: number };
  start: number;
  end: number;
  /** push-in from → to (1 = the picture just covers the box) */
  zoom?: [number, number];
  /** horizontal drift direction and strength (-1…1); nearer layers drift further */
  pan?: number;
  /** extra px the nearest layer drifts, at 1080 */
  parallax?: number;
  /** impact frames: soft shake + light flash */
  hits?: number[];
  /** areas that move in the wind (flags, parasols, cloth, trees, water) */
  wind?: Area[];
  /** strength of the wind ripple in px at 1080 */
  windStrength?: number;
  /** smoke drifting across, drawn after this layer index (0 = behind everything except the sky) */
  smokeBehind?: number;
  smoke?: number;
  /** warm light source in picture fractions, with rays */
  light?: [number, number];
  dust?: boolean;
  s?: number;
  /** cut-out parts made with `npm run flow-parts -- <rig> parts.json`; `name` is then the base (<rig>-base) */
  rig?: string;
  /** each part's move at a frame: rotate (deg) about its pivot, then shift (px at 1080) and scale. Children follow
   *  their parent's move. Ease with sines and interpolate; keep rotations small (a few degrees) except tools/arms. */
  pose?: (part: string, frame: number) => Pose;
  /** dust bursts at impacts */
  bursts?: Burst[];
  /** camera punch-in on each hit (0 = none, 0.04 = a firm jolt) */
  punch?: number;
};
/** blur = motion blur in px (use while a part swings fast, e.g. |rotation speed| × 0.6) */
export type Pose = { rotate?: number; dx?: number; dy?: number; scale?: number; blur?: number };
/** a burst of dust/debris at a point (picture fractions) on a frame — e.g. where tusks meet */
export type Burst = { at: [number, number]; frame: number; n?: number; color?: string };
type Rig = { width: number; height: number; parts: { id: string; pivot: [number, number]; parent: string | null; depth: number }[] };

export const Flow25D = ({ name, id, box, start, end, zoom = [1.04, 1.12], pan = 1, parallax = 40, hits = [], wind = [], windStrength = 2.5, smokeBehind, smoke = 0.35, light, dust = true, s = 1, rig, pose, bursts = [], punch = 0 }: Flow25DProps) => {
  const frame = useCurrentFrame();
  const meta = useJson<Meta>(`flow/${name}.json`);
  const rigData = useJson<Rig>(rig ? `flow/${rig}-rig.json` : `flow/${name}.json`);
  if (!meta || (rig && !rigData?.parts)) return null;
  const t = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lt = frame - start;
  // the picture covers the box (object-fit: cover), centred
  const cover = Math.max(box.w / meta.width, box.h / meta.height);
  const pw = meta.width * cover;
  const ph = meta.height * cover;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  let shake = 0;
  let flash = 0;
  let jolt = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d >= 0 && d < 14) shake += Math.sin(d * 2.1) * (1 - d / 14) * 12 * s;
    flash = Math.max(flash, interpolate(d, [0, 2, 14], [0, 0.22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    // punch-in: rises over 3 frames, settles over 20
    jolt = Math.max(jolt, interpolate(d, [0, 3, 23], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  const z = (zoom[0] + (zoom[1] - zoom[0]) * t) * (1 + punch * jolt);
  // where a picture fraction lands on screen for a layer at depth k (0 far … 1 near)
  const place = (k: number) => {
    const sc = z * (1 + k * 0.03 * t);
    const dx = (t * 2 - 1) * pan * (6 + k * parallax) * s;
    const dy = -k * 8 * t * s;
    return { x: cx - (pw * sc) / 2 + dx, y: cy - (ph * sc) / 2 + dy, w: pw * sc, h: ph * sc };
  };
  const layer = (i: number) => {
    const p = place(i / (meta.layers - 1));
    return <Pic key={i} src={staticFile(`flow/${name}-L${i}.png`)} {...p} />;
  };
  // Cut-out parts: each sprite is full-picture size, placed like a layer at the part's depth; its pose rotates and
  // shifts it about its pivot, and its children are drawn inside its group so they follow.
  const parts = rig && rigData?.parts ? rigData.parts : [];
  const drawPart = (p: Rig["parts"][number]): ReactNode => {
    const at = place(p.depth);
    const q = pose?.(p.id, frame) ?? {};
    const px = at.x + p.pivot[0] * at.w;
    const py = at.y + p.pivot[1] * at.h;
    const tr = `translate(${(q.dx ?? 0) * s},${(q.dy ?? 0) * s}) translate(${px},${py}) rotate(${q.rotate ?? 0}) scale(${q.scale ?? 1}) translate(${-px},${-py})`;
    const blur = Math.min(8, q.blur ?? 0) * s;
    return (
      <g key={p.id} transform={tr}>
        {blur > 0.3 && (
          <defs>
            <filter id={`${id}-mb-${p.id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={blur} /></filter>
          </defs>
        )}
        <g filter={blur > 0.3 ? `url(#${id}-mb-${p.id})` : undefined}>
          <Pic src={staticFile(`flow/${rig}-part-${p.id}.png`)} x={at.x} y={at.y} w={at.w} h={at.h} />
        </g>
        {parts.filter((c) => c.parent === p.id).map(drawPart)}
      </g>
    );
  };
  // Dust bursts: grains fly out from the point, slow down, fall a little and fade (~1.2 s).
  const burstAt = (b: Burst, k: number) => {
    const d = frame - b.frame;
    if (d < 0 || d > 40) return null;
    const at = place(0.7);
    const bx = at.x + b.at[0] * at.w;
    const by = at.y + b.at[1] * at.h;
    return (
      <g key={`b${k}`}>
        {Array.from({ length: b.n ?? 26 }, (_, i) => {
          const r = (q: number) => {
            const v = Math.sin((i + 1) * 47.3 * q + k * 9.1) * 9137.5;
            return v - Math.floor(v);
          };
          const a = -Math.PI * (0.05 + r(1) * 0.9) + (r(2) < 0.25 ? Math.PI * 0.95 : 0);
          const v = (3 + r(3) * 7) * s;
          const travel = (v * (1 - Math.exp(-d / 9)) * 9);
          const x = bx + Math.cos(a) * travel;
          const y = by + Math.sin(a) * travel + 0.05 * d * d * s;
          const o = interpolate(d, [0, 3, 40], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <circle key={i} cx={x} cy={y} r={(2 + r(4) * 5) * s * (1 + d / 30)} fill={b.color ?? "#e9d6aa"} opacity={o * (0.4 + r(5) * 0.6)} />;
        })}
      </g>
    );
  };
  const smokeAt = smokeBehind ?? Math.floor(meta.layers / 2);
  const near = place(1);
  const mid = place(0.5);
  const files = [
    ...Array.from({ length: meta.layers }, (_, i) => staticFile(`flow/${name}-L${i}.png`)),
    ...parts.map((p) => staticFile(`flow/${rig}-part-${p.id}.png`)),
  ];
  return (
    <g>
      <Preload urls={files} />
      <defs>
        <clipPath id={`${id}-box`}><rect x={box.x} y={box.y} width={box.w} height={box.h} /></clipPath>
        {/* wind: fractal noise that scrolls sideways (see the wind group below), used to ripple the chosen areas */}
        <filter id={`${id}-wind`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.016" numOctaves={2} seed={4} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={windStrength * 2 * s} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={28 * s} /></filter>
        <radialGradient id={`${id}-puff`}><stop offset="0" stopColor="#efe2c4" stopOpacity={0.9} /><stop offset="1" stopColor="#efe2c4" stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe7b0" stopOpacity={0.55} /><stop offset="1" stopColor="#ffe7b0" stopOpacity={0} /></linearGradient>
        {wind.map((a, i) => (
          <clipPath key={i} id={`${id}-wa${i}`}>
            <rect x={mid.x + a[0] * mid.w} y={mid.y + a[1] * mid.h} width={(a[2] - a[0]) * mid.w} height={(a[3] - a[1]) * mid.h} rx={12 * s} />
          </clipPath>
        ))}
      </defs>
      <g clipPath={`url(#${id}-box)`}>
        <g transform={`translate(${shake},${shake * 0.4})`}>
          {Array.from({ length: meta.layers }, (_, i) => (
            <g key={i}>
              {layer(i)}
              {i === smokeAt && smoke > 0 && (
                <g filter={`url(#${id}-soft)`} opacity={smoke}>
                  {Array.from({ length: 7 }, (_, j) => {
                    const r = (k: number) => {
                      const v = Math.sin((j + 1) * 91.7 * k) * 4375.85;
                      return v - Math.floor(v);
                    };
                    const x = box.x + ((r(1) * 1.4 - 0.2 + lt * (0.0012 + r(2) * 0.0016)) % 1.4) * box.w;
                    const y = box.y + (0.35 + r(3) * 0.45) * box.h + Math.sin(lt * 0.015 + j) * 10 * s;
                    return <ellipse key={j} cx={x} cy={y} rx={(160 + r(4) * 160) * s} ry={(60 + r(5) * 50) * s} fill={`url(#${id}-puff)`} />;
                  })}
                </g>
              )}
            </g>
          ))}
          {/* wind: the whole stack redrawn through the ripple filter, only inside the wind areas */}
          {wind.map((_, i) => (
            <g key={i} clipPath={`url(#${id}-wa${i})`}>
              {/* the filter's noise lives in the outer group's space, which slides left; the inner group slides back,
                  so the picture stays put while the ripple scrolls across it (no feOffset/feTile seams) */}
              <g transform={`translate(${-lt * s},0)`} filter={`url(#${id}-wind)`}>
                <g transform={`translate(${lt * s},0)`}>{Array.from({ length: meta.layers }, (_, k) => layer(k))}</g>
              </g>
            </g>
          ))}
          {parts.filter((p) => !p.parent).map(drawPart)}
          {bursts.map(burstAt)}
          {light && (() => {
            const lx = near.x + light[0] * near.w;
            const ly = near.y + light[1] * near.h;
            const pulse = 0.85 + 0.15 * Math.sin(lt * 0.05);
            return (
              <g style={{ mixBlendMode: "screen" }} opacity={pulse}>
                <circle cx={lx} cy={ly} r={Math.max(box.w, box.h) * 0.35} fill={`url(#${id}-puff)`} opacity={0.35} />
                {[-28, -14, 0, 12, 26, 40].map((a, i) => (
                  <polygon key={i} points={`0,0 ${box.h * 1.6},${-18 * s} ${box.h * 1.6},${18 * s}`} fill={`url(#${id}-ray)`} opacity={0.3 + 0.12 * Math.sin(lt * 0.03 + i)} transform={`translate(${lx},${ly}) rotate(${50 + a + Math.sin(lt * 0.01) * 3})`} />
                ))}
              </g>
            );
          })()}
          {dust &&
            Array.from({ length: 36 }, (_, i) => {
              const r = (k: number) => {
                const v = Math.sin((i + 1) * 12.9898 * k + 78.233) * 43758.5453;
                return v - Math.floor(v);
              };
              const x = box.x + ((r(1) * box.w + lt * (0.4 + r(2)) * s) % (box.w + 20 * s)) - 10 * s;
              const y = box.y + r(3) * box.h * 0.9 + Math.sin(lt * 0.02 + i) * 12 * s;
              return <circle key={i} cx={x} cy={y} r={(1.2 + r(4) * 3) * s} fill="#f3dfb0" opacity={0.12 + r(5) * 0.22} />;
            })}
        </g>
        {flash > 0 && <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="#fff6dc" opacity={flash} />}
      </g>
    </g>
  );
};

/** Full-screen Flow25D in its own svg (for cut-aways between map moves). */
export const Flow25DScreen = (p: Omit<Flow25DProps, "box" | "s">) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      <Flow25D {...p} box={{ x: 0, y: 0, w: width, h: height }} s={s} />
    </svg>
  );
};
