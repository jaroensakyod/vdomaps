import { loadFont } from "@remotion/google-fonts/Kanit";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../components/Inset";
import { PAL, PaperGrain } from "../../components/Scene";
import { Bed, Hit } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Ball, clamp, Deep, FireDefs, GUNS, portX, PowderSmoke, SEA, Ship, ShipSmoke, since, Sky, Splash, Waves } from "./kit/Naval";

// N08 sailing battle: two three-masted warships trade rippling broadsides on a rolling dusk sea; powder smoke
// lingers, shots fall short as splashes or splinter the hull, the enemy mainmast is shot away and the deck burns.
// One world under one moving camera; one schedule drives picture and sound. 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N08", name: "เรือใบรบกลางทะเล", frames: 600, cover: 345, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["700", "900"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const A_X = 830; // our ship (red flags), facing right
const B_X = 1570; // enemy ship (blue flags), facing left

// ---- the schedule ----
const BELL = 12;
const A_VOLLEY = [70, 76, 82, 88, 94, 100];
const A_MISS = [92, 101, 108]; // splashes near B (flight 22)
const A_HIT1 = 118;
const B_VOLLEY = [160, 166, 172, 178, 184, 190];
const B_MISS = [182, 192];
const B_HIT = [198, 207];
const A_VOLLEY2 = [250, 256, 262, 268];
const MAST = 288; // B's mainmast is hit and cracks
const MAST_DOWN = 328; // ...and hits the water
const CHEER = 380;
const TITLE = 515;
// firing frames per gun port, so flash, smoke, ball and sound all come from one list
const A_FIRES = Array.from({ length: GUNS }, (_, i) => [A_VOLLEY[i], A_VOLLEY2[i]].filter((f): f is number => f !== undefined));
const B_FIRES = Array.from({ length: GUNS }, (_, i) => [B_VOLLEY[i]]);

const World = ({ frame }: { frame: number }) => {
  const jolt = since(frame, B_HIT) < 12 ? (1 - since(frame, B_HIT) / 12) * 3 : 0;
  const rollA = Math.sin(frame * 0.05) * 3 - jolt;
  const list = interpolate(frame, [MAST, MAST + 160], [0, 7], clamp);
  const rollB = Math.sin(frame * 0.05 + 1.3) * 3 + list;
  const heaveA = Math.sin(frame * 0.06) * 10;
  const heaveB = Math.sin(frame * 0.06 + 1.6) * 10;
  const mastFall = interpolate(frame, [MAST + 6, MAST_DOWN], [0, 1], { ...clamp, easing: (k) => k * k });
  const fireB = interpolate(frame, [MAST, MAST + 40], [0, 1], clamp);
  const A_T = [B_X - 330, B_X - 260, B_X + 120, B_X - 120, B_X - 20, B_X + 60];
  const B_T = [A_X + 330, A_X + 380, A_X - 60, A_X + 80, A_X + 300, A_X + 20];
  return (
    <g>
      <FireDefs />
      <Sky frame={frame} />
      <Waves frame={frame} base={SEA - 120} amp={6} k={0.012} w={0.04} color="#3f6a78" />
      <Waves frame={frame} base={SEA - 70} amp={10} k={0.009} w={0.05} color="#2f5868" ph={1} foam />
      <ShipSmoke frame={frame} from={MAST} x={B_X} k={fireB} />
      <Ship x={B_X} frame={frame} flip flag="#2a4fa8" sail="#e6dfcb" fires={B_FIRES} roll={rollB} heave={heaveB} mastFall={mastFall} fire={fireB} hits={[A_HIT1, MAST]} />
      <Ship x={A_X} frame={frame} flip={false} flag="#c0302a" sail="#f0e8d2" fires={A_FIRES} roll={rollA} heave={heaveA} hits={B_HIT} />
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`ba${t}`} frame={frame} t={t} x0={portX(A_X, false, i)} x1={A_T[i]} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`bb${t}`} frame={frame} t={t} x0={portX(B_X, true, i)} x1={B_T[i]} />))}
      {/* powder smoke from every gun */}
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`a${t}`} x={portX(A_X, false, i)} y={SEA - 50} age={frame - t} dir={1} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`b${t}`} x={portX(B_X, true, i)} y={SEA - 50} age={frame - t} dir={-1} />))}
      {A_MISS.map((t, i) => <Splash key={`am${t}`} x={B_X - 330 + i * 70} age={frame - t} />)}
      {B_MISS.map((t, i) => <Splash key={`bm${t}`} x={A_X + 340 + i * 50} age={frame - t} />)}
      <Splash x={B_X - 380} age={frame - MAST_DOWN} big={1.8} />
      <Waves frame={frame} base={SEA + 30} amp={16} k={0.007} w={0.06} color="#21485a" ph={2.2} foam />
      <Deep frame={frame} />
      <Waves frame={frame} base={SEA + 260} amp={22} k={0.006} w={0.07} color="#1a3d4c" ph={3.1} foam />
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  // camera: wide on both ships → push in on the enemy as the mast falls → pull back for the title
  const zoom = interpolate(frame, [0, 150, 230, 300, 430, 490, 600], [0.7, 0.74, 0.74, 1.1, 1.1, 0.76, 0.72], clamp);
  const cx = interpolate(frame, [0, 230, 300, 430, 490], [1200, 1200, 1470, 1470, 1200], clamp);
  const cy = SEA - 330 / zoom; // waterline held at ~2/3 of the screen
  const d = since(frame, [A_HIT1, ...B_HIT, MAST, MAST_DOWN]);
  const shake = d < 10 ? (1 - d / 10) * (frame >= MAST ? 16 : 9) : 0;
  const flash = since(frame, [MAST]) < 6 ? 1 - since(frame, [MAST]) / 6 : 0;
  const titleK = interpolate(frame, [TITLE, TITLE + 20], [0, 1], clamp);
  const g = { x: 0, y: 0, W, H: 1920, ground: 1920, cx: W / 2, s: 1, sc: 1, vertical: true, frame } as InsetGeom;
  return (
    <AbsoluteFill style={{ background: "#0a0b10" }}>
      {/* sound — every entry is an event in the schedule above */}
      <Bed id="sea_rough" from={0} to={600} volume={0.45} />
      <Bed id="wind_storm" from={0} to={600} volume={0.2} />
      <Bed id="ship_creak" from={0} to={600} volume={0.3} />
      <Hit id="ship_bell" at={BELL} volume={0.5} />
      {A_FIRES.flat().map((f, i) => <Hit key={`a${f}`} id={i % 2 ? "cannon_old" : "cannon_heavy"} at={f} volume={0.65} />)}
      {B_FIRES.flat().map((f, i) => <Hit key={`b${f}`} id={i % 2 ? "cannon_heavy" : "cannon_old"} at={f} volume={0.45} />)}
      {[...A_MISS, ...B_MISS].map((f) => <Hit key={`s${f}`} id="splash_big" at={f} volume={0.4} />)}
      {[A_HIT1, ...B_HIT].map((f) => (
        <Fragment key={`h${f}`}>
          <Hit id="wood_hit" at={f} volume={0.6} />
          <Hit id="wood_break" at={f} volume={0.4} />
        </Fragment>
      ))}
      <Hit id="wood_break" at={MAST} volume={0.75} />
      <Hit id="mast_fall" at={MAST + 6} volume={0.6} />
      <Hit id="splash_big" at={MAST_DOWN} volume={0.75} />
      <Bed id="fire_big" from={MAST} to={600} volume={0.3} />
      <Hit id="crowd_cheer" at={CHEER} volume={0.3} />
      <Hit id="ship_bell" at={TITLE} volume={0.55} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        <g transform={`translate(${W / 2 + Math.sin(frame * 2.3) * shake},${960 + Math.cos(frame * 3.1) * shake}) scale(${zoom}) translate(${-cx},${-cy})`}>
          <World frame={frame} />
        </g>
        {/* foreground swell and spray close to the camera */}
        <path d={`M-50 1960 ${Array.from({ length: 14 }, (_, i) => `L${-50 + i * 90} ${1800 + Math.sin(i * 0.8 + frame * 0.07 - (cx - 1200) * 0.004) * 40}`).join(" ")} L1200 1960 Z`} fill="#173847" opacity={0.95} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={(i * 131 + frame * 2) % 1150} cy={1790 + Math.sin(frame * 0.1 + i) * 30} r={6 + (i % 3) * 3} fill="#e8f2f2" opacity={0.6} />)}
        <rect x={0} y={0} width={W} height={1920} fill="#ffb060" opacity={0.06} />
        <PaperGrain g={g} id="nv" />
        {flash > 0 && <rect x={0} y={0} width={W} height={1920} fill="#fff4dc" opacity={flash * 0.45} />}
      </svg>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#fff", opacity: interpolate(frame, [0, 15, TITLE - 10, TITLE], [0, 1, 1, 0], clamp) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: PAL.gilt }}>N08 · เรือใบรบกลางทะเล</div>
        <div style={{ fontSize: 66, fontWeight: 900 }}>เรือรบ <span style={{ color: "#ffb35c" }}>ปะทะ</span> เรือรบ</div>
      </div>
      {titleK > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${0.85 + titleK * 0.15})`, opacity: titleK, background: "rgba(8,14,26,0.88)", border: `5px solid ${PAL.gilt}`, borderRadius: 22, padding: "24px 56px", textAlign: "center", fontFamily: font, color: "#fff" }}>
            <div style={{ fontSize: 110, fontWeight: 900 }}>ยุทธนาวี</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: PAL.gilt }}>ยุคเรือใบ · ปืนใหญ่กราบเรือ</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
