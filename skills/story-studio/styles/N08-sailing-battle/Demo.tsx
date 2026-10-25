import { loadFont } from "@remotion/google-fonts/Thasadith";
import { Fragment } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Ball, Cartouche, clamp, CurlRow, FarSea, Grain, GUNS, P, portX, PowderSmoke, PrintDefs, SEA, Seal, Ship, ShipSmoke, since, Sky, Splash } from "./kit/Woodblock";

// N08 sailing battle as a woodblock print: two three-masted warships trade rippling broadsides above rows of
// curling, claw-foamed waves under a bokashi sky; powder smoke rolls out as outlined kasumi puffs, shots fall short
// as claw splashes or splinter the hull, the enemy mainmast is shot away and the deck burns. One world, one camera
// that scrolls sideways along the print; one schedule drives picture and sound. 1080×1920, 20 s.
export const demo: StyleDemo = { id: "N08", name: "เรือใบรบกลางทะเล", frames: 600, cover: 345, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400", "700"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const A_X = 830; // our ship (vermilion flags), facing right
const B_X = 1570; // enemy ship (ochre flags), facing left

// ---- the schedule ----
const BELL = 12;
const A_VOLLEY = [70, 76, 82, 88, 94, 100];
const A_MISS = [92, 101, 108];
const A_HIT1 = 118;
const B_VOLLEY = [160, 166, 172, 178, 184, 190];
const B_MISS = [182, 192];
const B_HIT = [198, 207];
const A_VOLLEY2 = [250, 256, 262, 268];
const MAST = 288;
const MAST_DOWN = 328;
const CHEER = 380;
const TITLE = 515;
const A_FIRES = Array.from({ length: GUNS }, (_, i) => [A_VOLLEY[i], A_VOLLEY2[i]].filter((f): f is number => f !== undefined));
const B_FIRES = Array.from({ length: GUNS }, (_, i) => [B_VOLLEY[i]]);

const World = ({ frame }: { frame: number }) => {
  const jolt = since(frame, B_HIT) < 12 ? (1 - since(frame, B_HIT) / 12) * 3 : 0;
  const rollA = Math.sin(frame * 0.05) * 3 - jolt;
  const list = interpolate(frame, [MAST, MAST + 160], [0, 7], clamp);
  const rollB = Math.sin(frame * 0.05 + 1.3) * 3 + list;
  const heaveA = Math.sin(frame * 0.06) * 12;
  const heaveB = Math.sin(frame * 0.06 + 1.6) * 12;
  const mastFall = interpolate(frame, [MAST + 6, MAST_DOWN], [0, 1], { ...clamp, easing: (k) => k * k });
  const fireB = interpolate(frame, [MAST, MAST + 40], [0, 1], clamp);
  const A_T = [B_X - 330, B_X - 260, B_X + 120, B_X - 120, B_X - 20, B_X + 60];
  const B_T = [A_X + 330, A_X + 380, A_X - 60, A_X + 80, A_X + 300, A_X + 20];
  return (
    <g>
      <Sky frame={frame} />
      <FarSea frame={frame} />
      <CurlRow frame={frame} y={SEA - 40} h={70} gap={190} speed={0.8} ph={3} />
      <ShipSmoke frame={frame} from={MAST} x={B_X} k={fireB} />
      <Ship x={B_X} frame={frame} flip flag={P.ochre} fires={B_FIRES} roll={rollB} heave={heaveB} mastFall={mastFall} fire={fireB} hits={[A_HIT1, MAST]} />
      <Ship x={A_X} frame={frame} flip={false} flag={P.vermilion} fires={A_FIRES} roll={rollA} heave={heaveA} hits={B_HIT} />
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`ba${t}`} frame={frame} t={t} x0={portX(A_X, false, i)} x1={A_T[i]} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <Ball key={`bb${t}`} frame={frame} t={t} x0={portX(B_X, true, i)} x1={B_T[i]} />))}
      {A_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`a${t}`} x={portX(A_X, false, i)} y={SEA - 50} age={frame - t} dir={1} />))}
      {B_FIRES.flatMap((ts, i) => ts.map((t) => <PowderSmoke key={`b${t}`} x={portX(B_X, true, i)} y={SEA - 50} age={frame - t} dir={-1} />))}
      {A_MISS.map((t, i) => <Splash key={`am${t}`} x={B_X - 330 + i * 70} age={frame - t} />)}
      {B_MISS.map((t, i) => <Splash key={`bm${t}`} x={A_X + 340 + i * 50} age={frame - t} />)}
      <Splash x={B_X - 380} age={frame - MAST_DOWN} big={1.8} />
      <CurlRow frame={frame} y={SEA + 60} h={120} gap={300} speed={1.4} ph={1} />
      <CurlRow frame={frame} y={SEA + 330} h={210} gap={480} speed={2.2} ph={2.2} />
      <CurlRow frame={frame} y={SEA + 680} h={300} gap={680} speed={3} ph={0.4} />
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  // scroll-pan: the camera slides along the print like an unrolled sheet — our ship → the enemy as its mast falls →
  // back to both ships for the title; only a gentle push.
  const zoom = interpolate(frame, [0, 230, 300, 430, 490, 600], [0.8, 0.82, 0.92, 0.92, 0.82, 0.8], clamp);
  const cx = interpolate(frame, [0, 120, 230, 300, 430, 490, 600], [980, 1120, 1250, 1480, 1500, 1220, 1180], clamp);
  const cy = SEA - 260 / zoom;
  const d = since(frame, [A_HIT1, ...B_HIT, MAST, MAST_DOWN]);
  const shake = d < 10 ? (1 - d / 10) * (frame >= MAST ? 14 : 8) : 0;
  const titleK = interpolate(frame, [TITLE, TITLE + 20], [0, 1], clamp);
  const head = interpolate(frame, [0, 15, TITLE - 10, TITLE], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: P.paper }}>
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
        <PrintDefs />
        <rect width={W} height={1920} fill={P.paper} />
        <rect width={W} height={1920} fill="url(#skyBk)" />
        <g filter="url(#carve)">
          <g transform={`translate(${W / 2 + Math.sin(frame * 2.3) * shake},${960 + Math.cos(frame * 3.1) * shake}) scale(${zoom}) translate(${-cx},${-cy})`}>
            <World frame={frame} />
          </g>
        </g>
        {/* title cartouche, upper left, and the honest-label seal */}
        <g opacity={head}>
          <Cartouche x={56} y={84} w={660} h={250}>
            <text x={40} y={78} fontFamily={font} fontWeight={700} fontSize={34} fill={P.vermilion}>N08 · เรือใบรบกลางทะเล</text>
            <line x1={40} y1={100} x2={620} y2={100} stroke={P.sumi} strokeWidth={2} />
            <text x={40} y={196} fontFamily={font} fontWeight={700} fontSize={72} fill={P.sumi}>
              เรือรบ <tspan fill={P.vermilion}>ปะทะ</tspan> เรือรบ
            </text>
          </Cartouche>
        </g>
        <Seal x={960} y={1790} s={0.9} font={font} />
        <Grain w={W} h={1920} />
        {titleK > 0 && (
          <g opacity={titleK} transform={`translate(${W / 2},820) scale(${0.9 + titleK * 0.1}) translate(${-W / 2},-820)`}>
            <Cartouche x={150} y={640} w={780} h={360}>
              <text x={390} y={200} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={140} fill={P.sumi}>ยุทธนาวี</text>
              <line x1={80} y1={238} x2={700} y2={238} stroke={P.sumi} strokeWidth={2} />
              <text x={390} y={300} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={46} fill={P.vermilion}>ยุคเรือใบ · ปืนใหญ่กราบเรือ</text>
            </Cartouche>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
