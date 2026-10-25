import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { at, clamp, Cotton, hop, Line, Place, Tabletop, Tag, TiltShift, Titles, useCam } from "./kit/Table";
import { bridge, cannon, cossack, eagle, Flame, Flour, FRENCH, isba, kutuzov, napoleon, PaperSnow, River, RUSSIAN, soldier, tree } from "./kit/Toys";

// N02 tin soldiers: 1812 played out with gloss-painted metal toys on a wooden table under a warm lamp, shot
// tilt-shift. One table, three set-ups along it; the camera dollies from one to the next. The Grande Armée hops
// across a pontoon bridge over a ribbon river, the guns fire at Borodino, the retreat through flour snow with a
// Cossack closing in and the eagle tipping over. 15 s.
export const demo: StyleDemo = { id: "N02", name: "ทหารดีบุกบนโต๊ะ", frames: 450, cover: 400, sizes: ["9x16", "16x9"] };

const SHOTS = [176, 212, 248, 284]; // the gun at Borodino fires
const BLASTS = [196, 232, 268]; // shells land among the Russian line
const since = (f: number, list: number[]) => Math.min(...list.map((b) => (f >= b ? f - b : 999)));
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

export const Demo = () => {
  const frame = useCurrentFrame();
  // dolly along the table: set-up A at x 0, B at x 16, C at x 40
  const camX = interpolate(frame, [0, 140, 166, 290, 316, 450], [-0.4, 0.3, 16, 16.4, 40, 40.5], ease);
  const tilt = interpolate(frame, [0, 150, 160, 300, 310, 450], [0.02, 0, 0.03, 0, 0.03, 0.01], clamp);
  const b = since(frame, BLASTS);
  const bump = b < 8 ? (1 - b / 8) * 0.012 : 0; // the table jolts when a shell lands
  const c = useCam(camX + Math.sin(frame * 2.1) * bump, tilt + bump * Math.cos(frame * 3));
  const s = since(frame, SHOTS);
  const recoil = s < 14 ? Math.sin((s / 14) * Math.PI) : 0;
  const fall = interpolate(frame, [400, 418], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const fallBounce = frame > 418 && frame < 430 ? Math.sin(((frame - 418) / 12) * Math.PI) * 6 : 0;
  const t3 = frame - 300;

  return (
    <AbsoluteFill style={{ background: "#0c0705" }}>
      <Sfx src={SFX.swell} at={0} volume={0.25} />
      <Bed id="army_marching" from={0} to={160} volume={0.22} />
      {SHOTS.map((f) => <Hit key={f} id="cannon" at={f} volume={0.35} />)}
      {BLASTS.map((f) => <Hit key={f} id="explosion_mid" at={f} volume={0.28} />)}
      <Bed id="wind_storm" from={300} to={450} volume={0.18} />
      <Hit id="horse_gallop" at={330} volume={0.25} />
      <Hit id="wood_hit" at={418} volume={0.35} />

      <TiltShift id="n02">
        <Tabletop c={c} />

        {/* A — the Niemen: a ribbon river, a cork-and-stick pontoon bridge, the column hopping across */}
        {Array.from({ length: 9 }, (_, i) => <Place key={`ta${i}`} c={c} x={-7 + i * 1.7} z={5.4 + (i % 2) * 0.5} size={0.55} draw={tree(0, 1)} />)}
        <River c={c} z0={2.05} z1={2.75} x0={-9} x1={9} t={frame} />
        <Place c={c} x={-9} z={2.4} size={1} draw={bridge(1800)} />
        {Array.from({ length: 14 }, (_, i) => {
          const h = hop(frame, 22, 0.2, i * 5);
          return <Place key={`m${i}`} c={c} x={-6.4 + i * 0.78 + h.d} z={2.38} size={0.7} lift={0.16 + h.lift} tilt={h.tilt} draw={soldier(FRENCH, "march")} />;
        })}
        <Place c={c} x={0.55} z={1.62} size={0.9} draw={eagle} />
        <Place c={c} x={-0.62} z={1.45} size={0.82} lift={hop(frame - 40, 60, 0.06).lift * 0.6} draw={napoleon} />

        {/* B — Borodino: the Russian line far off, shells bursting in cotton wool, the gun firing in front */}
        {Array.from({ length: 7 }, (_, i) => <Place key={`tb${i}`} c={c} x={10 + i * 2} z={6} size={0.5} draw={tree(0, 1.1)} />)}
        {Array.from({ length: 8 }, (_, i) => <Place key={`r${i}`} c={c} x={14.2 + i * 0.5} z={3.1 + (i % 2) * 0.22} size={0.6} flip draw={soldier(RUSSIAN, "stand")} />)}
        <Place c={c} x={17.9} z={2.9} size={0.68} flip draw={kutuzov} />
        {BLASTS.map((f, i) => {
          const k = frame >= f ? interpolate(frame - f, [0, 6, 60], [0, 1, 0.55], clamp) : 0;
          const p = at(c, 15.0 + i * 0.9, 2.8);
          return (
            <g key={f}>
              <Flame x={p.sx} y={p.sy} r={p.k * 0.5} k={frame >= f && frame < f + 14 ? 1 - (frame - f) / 14 : 0} t={frame} />
              <Cotton x={p.sx} y={p.sy - p.k * 0.25} r={p.k * 0.42} k={k} seed={i * 3} />
            </g>
          );
        })}
        <Place c={c} x={15.05} z={1.95} size={0.8} draw={soldier(FRENCH, "stand")} />
        <Place c={c} x={15.75} z={1.62} size={1.1} draw={cannon(recoil)} />
        {SHOTS.map((f, i) => {
          const k = frame >= f ? interpolate(frame - f, [0, 5, 70], [0, 1, 0], clamp) : 0;
          const p = at(c, 16.3 + (frame - f) * 0.004, 1.62);
          return <Cotton key={f} x={p.sx + (frame - f) * 1.4} y={p.sy - p.k * 0.62 - (frame - f) * 0.8} r={p.k * 0.3} k={k} seed={i + 5} />;
        })}
        <Place c={c} x={16.85} z={1.98} size={0.8} draw={soldier(FRENCH, "stand")} />

        {/* C — the retreat: flour snow, a burnt cardboard house, the column trudging back, a Cossack closing in */}
        <Flour c={c} x0={32.5} x1={48} z0={1.1} z1={6.6} k={interpolate(frame, [150, 300], [0, 1], clamp)} />
        {Array.from({ length: 8 }, (_, i) => <Place key={`tc${i}`} c={c} x={33.5 + i * 1.9} z={5.6 + (i % 2) * 0.6} size={0.6} draw={tree(1, 1)} />)}
        <Place c={c} x={40.9} z={3.4} size={0.95} draw={isba(1)} />
        {(() => {
          const p = at(c, 40.8, 3.4);
          return (
            <g>
              <Cotton x={p.sx} y={p.sy - p.k * 1.25 - (frame % 90) * 0.3} r={p.k * 0.42} k={1} seed={4} dark />
              <Flame x={p.sx - p.k * 0.25} y={p.sy - p.k * 0.6} r={p.k * 0.32} k={0.9} t={frame} />
            </g>
          );
        })()}
        {(() => {
          const h = hop(t3, 18, 0.32, 0);
          return <Place c={c} x={42.6 - h.d} z={2.6} size={0.85} lift={h.lift} tilt={h.tilt} flip draw={cossack} />;
        })()}
        {Array.from({ length: 4 }, (_, i) => {
          const h = hop(t3, 30, 0.14, i * 7);
          return <Place key={`f${i}`} c={c} x={39.4 + i * 0.55 - h.d} z={1.85 + (i % 2) * 0.3} size={0.72} lift={h.lift * 0.7} tilt={h.tilt} flip draw={soldier(FRENCH, "trudge", 1)} />;
        })}
        <Place c={c} x={40.9 - fall * 0.1} z={1.5} size={0.95} tilt={-fall * 84 + fallBounce} draw={eagle} />
        {frame > 290 && <PaperSnow W={c.W} H={c.H} t={frame} n={c.W > c.H ? 110 : 80} />}
      </TiltShift>

      <Titles
        id="N02"
        year="ค.ศ. 1812"
        end={450}
        heads={[
          { f: 0, tag: "มิถุนายน 1812", head: "ทัพใหญ่ข้ามแม่น้ำเนมัน", stat: "600,000", label: "นาย" },
          { f: 160, tag: "7 กันยายน · โบโรดิโน", head: "ปืนใหญ่ยิงกันทั้งวัน", stat: "70,000", label: "คนตายในวันเดียว" },
          { f: 306, tag: "พฤศจิกายน", head: "ถอยทัพกลางหิมะ" },
        ]}
      />
      <Tag />
      <Line text="นโปเลียนบุกรัสเซีย ด้วยทัพใหญ่ที่สุด" start={8} end={156} />
      <Line text="ปืนใหญ่ยิงกันทั้งวัน แต่รัสเซียไม่แตก" start={162} end={306} />
      <Line text="ฤดูหนาวมาถึง คอสแซคไล่ตามไม่หยุด" start={310} end={450} />
    </AbsoluteFill>
  );
};
