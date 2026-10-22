import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { countries } from "../../../components/data";
import { useMap } from "../../../components/Map";
import { useJson } from "../../../components/useJson";
import { InsetPanel } from "../../../components/Inset";
import { clamp, font, PANEL_TOP } from "../../thaihistory/news/kit";

// ตามรอยธรรม: shared look. Map, cards, captions and the Chapter contract come from the Thai history news kit;
// this file adds the channel colours, the top bar and the mural illustration panel.
export const LEAF = "#e8b84a"; // gold leaf: the Buddha's route
export const CINNABAR = "#c8442f";
export const INDIGO = "#2f5d8a";
export const MURAL_H = 380; // panel height at 1080 wide (a little taller than the news kit's 350: murals need room)
const MURAL_ASPECT = 1376 / 768; // Gemini 16:9 output

// Camera inside a mural: zoom z (1 = panel width) centred on (x, y) as fractions of the picture.
export type Look = { x: number; y: number; z: number };

// AI mural (murals.json → public/murals/<dir>/<img>.jpg) in the news inset frame, with a slow Ken Burns move
// from `from` to `to`. Always labelled ภาพประกอบ. Overlap consecutive panels by 14 frames (end = next start + 14).
export const MuralPanel = ({ id, dir, img, anchor, start, end, from = { x: 0.5, y: 0.5, z: 1 }, to = { x: 0.5, y: 0.5, z: 1.12 } }: { id: string; dir: string; img: string; anchor: [number, number]; start: number; end: number; from?: Look; to?: Look }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, end], [0, 1], clamp);
  const e = t * t * (3 - 2 * t);
  const lk = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, z: from.z + (to.z - from.z) * e };
  return (
    <InsetPanel id={id} anchor={anchor} label="ภาพประกอบ" start={start} end={end} sky={["#1a1208", "#1a1208"]} font={font} accent={LEAF} top={PANEL_TOP} panelHeight={MURAL_H}>
      {(g) => {
        const w = g.W * Math.max(1, lk.z, (g.H * MURAL_ASPECT) / g.W);
        const h = w / MURAL_ASPECT;
        const x = Math.min(g.x, Math.max(g.x + g.W - w, g.x + g.W / 2 - lk.x * w));
        const y = Math.min(g.y, Math.max(g.y + g.H - h, g.y + g.H / 2 - lk.y * h));
        return <image href={staticFile(`murals/${dir}/${img}.jpg`)} x={x} y={y} width={w} height={h} preserveAspectRatio="none" />;
      }}
    </InsetPanel>
  );
};

// Top bar: channel badge, chapter, time chip (e.g. "80 ปีก่อน พ.ศ.").
export const DhammaBar = ({ chapter, when }: { chapter: string; when: string }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return (
    <div style={{ position: "absolute", top: height * 0.045, left: 50 * s, right: 50 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
        <div style={{ background: CINNABAR, border: `${2 * s}px solid ${LEAF}`, padding: `${4 * s}px ${16 * s}px`, borderRadius: 8 * s, fontWeight: 900, fontSize: 32 * s }}>ตามรอยธรรม</div>
        <div style={{ fontSize: 30 * s, fontWeight: 700, opacity: 0.92 }}>{chapter}</div>
      </div>
      <div style={{ background: "rgba(8,14,26,0.8)", border: `${2 * s}px solid rgba(232,184,74,0.5)`, padding: `${2 * s}px ${16 * s}px`, borderRadius: 30 * s, fontWeight: 700, fontSize: 30 * s }}>{when}</div>
    </div>
  );
};

// A run of murals for one stretch of story: each shot starts at its frame and hands over to the next with the
// 14-frame overlap the house standard asks for (no map blink between pictures). The last one ends at `end`.
export type Shot = { f: number; img: string; from?: Look; to?: Look; at?: [number, number] };
export const MuralStrip = ({ id, dir, anchor, shots, end }: { id: string; dir: string; anchor: [number, number]; shots: Shot[]; end: number }) => (
  <>
    {shots.map((sh, i) => (
      <MuralPanel key={`${id}${i}`} id={`${id}${i}`} dir={dir} img={sh.img} anchor={sh.at ?? anchor} start={sh.f} end={(shots[i + 1]?.f ?? end) + 14} from={sh.from} to={sh.to} />
    ))}
  </>
);

// Night grade over the imagery (strength k), as a flat blue veil.
export const Night = ({ k }: { k: number }) => {
  const { width, height } = useMap();
  return k > 0 ? <rect width={width} height={height} fill="#040a1f" opacity={0.6 * k} /> : null;
};

// Natural Earth rivers of the Ganges plain + the OSM rivers at Bodh Gaya (Lilajan = Neranjara, Mohana, Phalgu).
// `hi` lights one river by name (0 → 1).
type Lines = FeatureCollection<LineString | MultiLineString, { name: string | null; rank?: number }>;
const LOCAL = ["Lilājān Nadi", "Mohana Nadi", "Phalgu"];
export const DhammaRivers = ({ hi = {} }: { hi?: Record<string, number> }) => {
  const { path, projection, s } = useMap();
  const ne = useJson<{ rivers: Lines }>("data/ganga-rivers.json");
  const osm = useJson<Lines>("data/neranjara.geojson");
  const pxDeg = (projection.scale() * Math.PI) / 180;
  const all = [
    ...(ne?.rivers.features ?? []).filter((f) => (f.properties.rank ?? 9) <= 7).map((f) => ({ f, w: Math.min(Math.max(pxDeg * 0.004, 1.5 * s), 7 * s) })),
    ...(osm?.features ?? []).filter((f) => LOCAL.includes(f.properties.name ?? "")).map((f) => ({ f, w: Math.min(Math.max(pxDeg * 0.0012, 2 * s), 14 * s) })),
  ];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {all.map(({ f, w }, i) => <path key={`g${i}`} d={path(f) ?? ""} stroke="#4fc3ff" strokeWidth={w * 2.2} strokeOpacity={0.15} />)}
      {all.map(({ f, w }, i) => <path key={`l${i}`} d={path(f) ?? ""} stroke="#7fd4ff" strokeWidth={w} strokeOpacity={0.8} />)}
      {all.map(({ f, w }, i) => {
        const k = hi[f.properties.name ?? ""] ?? 0;
        return k > 0 ? <path key={`h${i}`} d={path(f) ?? ""} stroke="#fff3a6" strokeWidth={w * 2.4} strokeOpacity={k} style={{ filter: `drop-shadow(0 0 ${8 * s}px ${LEAF})` }} /> : null;
      })}
    </g>
  );
};

// Today's borders (Nepal / India), thin and quiet, faded in by k.
export const Borders = ({ k = 1 }: { k?: number }) => {
  const { path, s } = useMap();
  return k > 0 ? (
    <g opacity={0.55 * k} fill="none" stroke="#fff" strokeWidth={1.6 * s} strokeDasharray={`${6 * s} ${4 * s}`}>
      {countries.features.map((f, i) => <path key={i} d={path(f) ?? ""} />)}
    </g>
  ) : null;
};

// Full moon (วันเพ็ญเดือน 6), top right, faded by k.
export const Moon = ({ k }: { k: number }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (k <= 0) return null;
  return <div style={{ position: "absolute", right: 70 * s, top: height * 0.31, width: 150 * s, height: 150 * s, borderRadius: "50%", opacity: k, transform: `scale(${0.8 + 0.2 * k})`, background: "radial-gradient(circle at 40% 38%, #fffbe8, #f3e2a6 60%, #d9c27a)", boxShadow: `0 0 ${60 * s}px ${20 * s}px rgba(255,240,190,0.45)` }} />;
};
