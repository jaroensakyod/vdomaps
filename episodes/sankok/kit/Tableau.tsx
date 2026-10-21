import { interpolate } from "remotion";
import { Fire, Smoke } from "../../../components/Figures";
import type { InsetGeom } from "../../../components/Inset";
import { Bushes, CityGate, DryField, Farmhouse, Grave, HanFigure, Horse, LOOK, OfficeGate, ThroneRoom, type HanPose, type Hold } from "./Scenes";
import { C, fonts } from "./theme";

// A scene as data, for the "new picture every 3–4 s" cadence: a backdrop, a few figures, an optional caption.
// Figures: `who` = a LOOK key (cast portraits' colours), x = 0–1 across the panel, `walk` px per frame
// (positive = right), `size` multiplies the default figure scale (1.3 — readable on a phone).
export type Backdrop = "palace" | "throne" | "study" | "night" | "field" | "camp" | "city" | "road" | "hill" | "house" | "gate" | "fire" | "tomb" | "well" | "seal";
export type Fig = { who: string; x: number; pose?: HanPose; hold?: Hold; flip?: boolean; size?: number; walk?: number; ride?: boolean; dy?: number; robe?: string; from?: number; flag?: { text: string; color: string } };
// who: "horse" = a riderless horse.
export type TableauProps = { g: InsetGeom; from: number; bg: Backdrop; figs: Fig[]; caption?: string; captionColor?: string; burn?: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INK = "#2a1b0e";

export const SKY: Record<Backdrop, [string, string]> = {
  palace: ["#5a2a1f", "#5a2a1f"],
  throne: ["#6e2a1f", "#6e2a1f"],
  study: ["#4a4560", "#4a4560"],
  night: ["#0e1626", "#24324a"],
  field: ["#e9d7a6", "#cdb27a"],
  camp: ["#e2c79a", "#c9a46a"],
  city: ["#e6c98e", "#d6b47a"],
  road: ["#e9d7a6", "#cdb27a"],
  hill: ["#0e1626", "#24324a"],
  house: ["#0e1626", "#24324a"],
  gate: ["#d6bf8f", "#c9a46a"],
  fire: ["#2a1408", "#c0602e"],
  tomb: ["#0e1626", "#24324a"],
  well: ["#d9c39a", "#c9a46a"],
  seal: ["#2a1b0e", "#5a3a1a"],
};

const Back = ({ g, bg, burn = 1 }: { g: InsetGeom; bg: Backdrop; burn?: number }) => {
  const gr = g.ground + 4 * g.s;
  const floor = (c: string) => <rect x={g.x} y={gr} width={g.W} height={g.H} fill={c} />;
  switch (bg) {
    case "palace":
      return (
        <g>
          {[0.08, 0.92].map((fx) => <rect key={fx} x={g.x + g.W * fx - 12 * g.s} y={g.y} width={24 * g.s} height={g.H} fill="#a8382a" />)}
          {floor("#3a2016")}
        </g>
      );
    case "throne":
      return (
        <g>
          <ThroneRoom x={g.cx} y={gr} w={g.W} h={g.H} s={g.s * 1.1} />
          {floor("#4a2a1a")}
        </g>
      );
    case "study":
      return (
        <g>
          <rect x={g.x + g.W * 0.82} y={g.y + 60 * g.s} width={120 * g.s} height={110 * g.s} fill="#e6cf8a" opacity={0.85} />
          {floor("#3a2a20")}
        </g>
      );
    case "night":
      return (
        <g>
          <circle cx={g.x + g.W * 0.84} cy={g.y + 80 * g.s} r={24 * g.s} fill="#efe6c2" opacity={0.85} />
          {floor("#252a22")}
        </g>
      );
    case "field":
      return <DryField x0={g.x} x1={g.x + g.W} y={gr} depth={g.H} s={g.s} />;
    case "camp":
      return (
        <g>
          {[0.15, 0.45, 0.78].map((fx, i) => (
            <g key={fx}>
              <path d={`M${g.x + g.W * fx - 80 * g.s} ${gr} L${g.x + g.W * fx} ${gr - 110 * g.s} L${g.x + g.W * fx + 80 * g.s} ${gr} Z`} fill={i % 2 ? "#c9b48a" : "#d9c59a"} stroke={INK} strokeWidth={1.5 * g.s} />
              <line x1={g.x + g.W * fx} y1={gr - 110 * g.s} x2={g.x + g.W * fx} y2={gr - 160 * g.s} stroke="#6b4a2b" strokeWidth={3 * g.s} />
              <path d={`M${g.x + g.W * fx} ${gr - 160 * g.s} l${36 * g.s} ${6 * g.s} l${-2 * g.s} ${22 * g.s} l${-34 * g.s} ${-4 * g.s} Z`} fill={C.yuan} />
            </g>
          ))}
          {floor("#a88a5c")}
        </g>
      );
    case "city":
      return (
        <g>
          <CityGate x0={g.x - 20 * g.s} x1={g.x + g.W + 20 * g.s} cx={g.cx} y={gr + 2 * g.s} s={g.s * 1.1} open={1} />
          {floor("#a88a5c")}
        </g>
      );
    case "road":
      return (
        <g>
          <path d={`M${g.x} ${gr - 40 * g.s} L${g.x + g.W * 0.3} ${gr - 130 * g.s} L${g.x + g.W * 0.55} ${gr - 60 * g.s} L${g.x + g.W * 0.8} ${gr - 150 * g.s} L${g.x + g.W} ${gr - 70 * g.s} L${g.x + g.W} ${gr} L${g.x} ${gr} Z`} fill="#8a7350" opacity={0.6} />
          {floor("#a88a5c")}
        </g>
      );
    case "hill":
      return (
        <g>
          <circle cx={g.x + g.W * 0.82} cy={g.y + 80 * g.s} r={26 * g.s} fill="#efe6c2" opacity={0.85} />
          <path d={`M${g.x} ${gr} L${g.x + g.W * 0.45} ${gr - 30 * g.s} L${g.x + g.W * 0.75} ${gr - 170 * g.s} L${g.x + g.W} ${gr - 120 * g.s} L${g.x + g.W} ${gr} Z`} fill="#1f2a22" />
          <Bushes x0={g.x + g.W * 0.58} x1={g.x + g.W * 0.98} y={gr - 60 * g.s} s={g.s} n={5} />
          {floor("#252a22")}
        </g>
      );
    case "house":
      return (
        <g>
          <circle cx={g.x + g.W * 0.12} cy={g.y + 80 * g.s} r={24 * g.s} fill="#efe6c2" opacity={0.85} />
          {floor("#2b2a22")}
          <Farmhouse x={g.x + g.W * 0.36} y={gr + 2 * g.s} scale={g.sc * 1.05} />
        </g>
      );
    case "gate":
      return (
        <g>
          {floor("#9c8a66")}
          <OfficeGate x={g.x + g.W * 0.62} y={gr + 2 * g.s} scale={g.sc * 1.05} />
        </g>
      );
    case "tomb":
      return (
        <g>
          <circle cx={g.x + g.W * 0.84} cy={g.y + 80 * g.s} r={24 * g.s} fill="#efe6c2" opacity={0.85} />
          {floor("#2b2a22")}
          <Grave x={g.x + g.W * 0.62} y={gr + 4 * g.s} scale={g.sc * 1.2} />
        </g>
      );
    case "well": {
      const wx = g.x + g.W * 0.6;
      const cols = ["#e04a3a", "#e0b63e", "#3a9a5a", "#3a6ab0", "#f3efe4"];
      return (
        <g>
          {floor("#a88a5c")}
          {cols.map((c, i) => (
            <path key={c} d={`M${wx - 30 * g.s + i * 15 * g.s} ${gr - 40 * g.s} L${wx - 120 * g.s + i * 60 * g.s} ${g.y} L${wx - 90 * g.s + i * 60 * g.s} ${g.y} L${wx - 22 * g.s + i * 15 * g.s} ${gr - 40 * g.s} Z`} fill={c} opacity={0.35} />
          ))}
          <ellipse cx={wx} cy={gr - 40 * g.s} rx={60 * g.s} ry={14 * g.s} fill="#1a120c" stroke={INK} strokeWidth={1.5 * g.s} />
          <path d={`M${wx - 60 * g.s} ${gr - 40 * g.s} L${wx - 60 * g.s} ${gr} L${wx + 60 * g.s} ${gr} L${wx + 60 * g.s} ${gr - 40 * g.s}`} fill="#8a8478" stroke={INK} strokeWidth={1.5 * g.s} />
        </g>
      );
    }
    case "seal": {
      const sx = g.cx, sy = g.y + g.H * 0.62, S = g.s * 1.4;
      return (
        <g>
          <circle cx={sx} cy={sy - 40 * S} r={140 * S} fill="#e0b63e" opacity={0.18} />
          <rect x={sx - 70 * S} y={sy - 40 * S} width={140 * S} height={70 * S} rx={6 * S} fill="#7fb08a" stroke={INK} strokeWidth={2 * g.s} />
          <rect x={sx - 70 * S} y={sy - 40 * S} width={140 * S} height={16 * S} fill="#a9cfae" />
          <path d={`M${sx - 50 * S} ${sy - 40 * S} Q${sx - 40 * S} ${sy - 110 * S} ${sx} ${sy - 95 * S} Q${sx + 45 * S} ${sy - 110 * S} ${sx + 50 * S} ${sy - 40 * S} Z`} fill="#8fc09a" stroke={INK} strokeWidth={2 * g.s} />
          <circle cx={sx + 18 * S} cy={sy - 82 * S} r={4 * S} fill={INK} />
          <path d={`M${sx + 46 * S} ${sy - 34 * S} l${8 * S} ${-10 * S} l${4 * S} ${12 * S} Z`} fill="#e0b63e" />
        </g>
      );
    }
    case "fire":
      return (
        <g>
          {floor("#3a2416")}
          <CityGate x0={g.x - 20 * g.s} x1={g.x + g.W + 20 * g.s} cx={g.cx} y={gr + 2 * g.s} s={g.s * 1.2} />
          {[0.12, 0.3, 0.5, 0.68, 0.86].map((fx, i) => (
            <g key={fx}>
              <Smoke x={g.x + g.W * fx} y={g.ground - 120 * g.s} size={40 * g.s} seed={i} wind={0.6} k={burn} />
              <Fire x={g.x + g.W * fx} y={g.ground - (i === 2 ? 190 : 120) * g.s} size={(i === 2 ? 90 : 64) * g.s} seed={i * 3} k={burn} />
            </g>
          ))}
        </g>
      );
  }
};

export const Tableau = ({ g, from, bg, figs, caption, captionColor, burn }: TableauProps) => {
  const t = Math.max(0, g.frame - from);
  const feet = g.ground + 28 * g.s;
  return (
    <g>
      <Back g={g} bg={bg} burn={burn} />
      {figs.map((f, i) => {
        if (f.from !== undefined && g.frame < f.from) return null;
        const sc = g.sc * 1.3 * (f.size ?? 1);
        const x = g.x + g.W * f.x + (f.walk ?? 0) * t * g.s;
        const y = feet + (f.dy ?? 0) * g.s;
        const look = LOOK[f.who] ?? {};
        if (f.who === "horse") return <Horse key={i} x={x} y={y - 37 * sc} scale={sc * 1.3} color="#6b3a22" flip={f.flip} run={!!f.walk} />;
        const fig = <HanFigure x={f.ride ? x + 2 * sc : x} y={f.ride ? y - 46 * sc : y} scale={sc} {...look} {...(f.robe ? { robe: f.robe } : {})} pose={f.pose ?? (f.walk && !f.ride ? "walk" : "stand")} hold={f.hold ?? (f.flag ? "flag" : "none")} flag={f.flag} flip={f.flip} phase={i * 1.3} />;
        return (
          <g key={i} opacity={f.from !== undefined ? interpolate(g.frame, [f.from, f.from + 8], [0, 1], clamp) : 1}>
            {fig}
            {f.ride && <Horse x={x} y={y - 37 * sc} scale={sc * 1.3} color="#6b3a22" flip={f.flip} run={!!f.walk} />}
          </g>
        );
      })}
      {caption && (
        <text x={g.x + g.W * 0.6} y={g.y + 60 * g.s} textAnchor="middle" fontFamily={fonts.title} fontSize={30 * g.s} fill={captionColor ?? (["field", "camp", "city", "road", "gate"].includes(bg) ? C.wu : "#f3e6c4")}>
          {caption}
        </text>
      )}
    </g>
  );
};

// Shorthand for a Shot: `{ id, at, anchor, ...tab("palace", [...figs], "caption") }`.
export const tab = (bg: Backdrop, figs: Fig[], caption?: string, extra: Partial<Omit<TableauProps, "g" | "from" | "bg" | "figs" | "caption">> = {}) => ({
  sky: SKY[bg],
  draw: (g: InsetGeom, from: number) => <Tableau g={g} from={from} bg={bg} figs={figs} caption={caption} {...extra} />,
});
