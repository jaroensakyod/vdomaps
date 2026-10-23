import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { FigureDefs, usePopIn } from "./Figures";
import { useMap } from "./Map";

// A news-style illustration panel tied to a place on the map by a dashed leader line.
// Phones: below the pin (between the story card and the captions). 16:9: on the right.
// Children get the panel geometry: draw scenery from `ground` up, figures at `sc` scale around `cx`.
export type InsetGeom = { x: number; y: number; W: number; H: number; ground: number; cx: number; s: number; sc: number; vertical: boolean; frame: number };

export const InsetPanel = ({
  id,
  anchor,
  label,
  start,
  end,
  sky = ["#1d3557", "#e07a5f"],
  font,
  accent = "#ff3b30",
  top,
  panelHeight,
  boxScale = 1,
  children,
}: {
  id: string;
  anchor: [number, number];
  label: string;
  start: number;
  end: number;
  sky?: [string, string];
  font: string;
  accent?: string;
  /** 9:16 only: panel top as a fraction of the height, to clear cards (default: just below the pin) */
  top?: number;
  /** 9:16 only: panel height in px at 1080 (default 380) */
  panelHeight?: number;
  /** shrink the panel box about its bottom centre (the leader line still ends on the box) */
  boxScale?: number;
  children: (g: InsetGeom) => ReactNode;
}) => {
  const frame = useCurrentFrame();
  const { projection, width, height, s } = useMap();
  const k = usePopIn(start, end);
  if (frame < start || frame > end || k <= 0) return null;
  const p = projection(anchor);
  if (!p) return null;
  const vertical = height > width;
  const W = vertical ? width - 100 * s : 780 * s;
  const H = vertical ? (panelHeight ?? 380) * s : 420 * s;
  const x = vertical ? 50 * s : width - W - 40 * s;
  const y = vertical && top !== undefined ? height * top : vertical ? Math.min(Math.max(p[1] + 60 * s, 660 * s), height * 0.695 - H) : Math.min(Math.max(p[1] - H / 2, 150 * s), height - H - 150 * s);
  const ground = y + H - 46 * s;
  const sc = (vertical ? 1.55 : 1.5) * s;
  const bx = x + (W * (1 - boxScale)) / 2;
  const by = y + H * (1 - boxScale);
  const lx = vertical ? Math.min(Math.max(p[0], bx + 30 * s), bx + W * boxScale - 30 * s) : bx;
  const ly = vertical ? by : Math.min(Math.max(p[1], by + 30 * s), by + H * boxScale - 30 * s);
  const box = boxScale === 1 ? undefined : `translate(${x + W / 2},${y + H}) scale(${boxScale}) translate(${-(x + W / 2)},${-(y + H)})`;
  const clip = `inset-${id}`;
  return (
    <g opacity={Math.min(1, k)}>
      <FigureDefs />
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={W} height={H} rx={18 * s} />
        </clipPath>
        <linearGradient id={`${clip}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <line x1={p[0]} y1={p[1]} x2={lx} y2={ly} stroke={accent} strokeWidth={3 * s} strokeDasharray={`${8 * s} ${6 * s}`} />
      <g transform={box}>
      <g clipPath={`url(#${clip})`} transform={`translate(0,${(1 - Math.min(1, k)) * 30 * s})`}>
        <rect x={x} y={y} width={W} height={H} fill={`url(#${clip}-sky)`} />
        {children({ x, y, W, H, ground, cx: x + W / 2, s, sc, vertical, frame })}
      </g>
      <rect x={x} y={y} width={W} height={H} rx={18 * s} fill="none" stroke={accent} strokeWidth={3 * s} />
      <rect x={x + 18 * s} y={y + 16 * s} width={(label.length * 15 + 40) * s} height={36 * s} rx={8 * s} fill={accent} />
      <text x={x + 38 * s} y={y + 42 * s} fontSize={22 * s} fontWeight={900} fill="#fff" fontFamily={font}>
        {label}
      </text>
      </g>
    </g>
  );
};

// Road/ground strip helpers used by most scenes.
export const Street = ({ g, color = "#3a3d42", kerb = "#8d8a84", marks = true }: { g: InsetGeom; color?: string; kerb?: string; marks?: boolean }) => (
  <g>
    <rect x={g.x} y={g.ground - 10 * g.s} width={g.W} height={10 * g.s} fill={kerb} />
    <rect x={g.x} y={g.ground} width={g.W} height={g.H} fill={color} />
    {marks &&
      Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={g.x + i * 90 * g.s} y={g.ground + 24 * g.s} width={44 * g.s} height={5 * g.s} fill="#d9d4c7" opacity={0.6} />
      ))}
  </g>
);
