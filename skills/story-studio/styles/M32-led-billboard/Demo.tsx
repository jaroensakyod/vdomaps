import { geoEquirectangular, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Building, C, clamp, fade, font, LedPanel, Moire, Night, Small, useFontReady, type Draw } from "./kit/Led";

// M32 LED billboard: a ranking told on a giant LED screen on a building at night. Mastercard's Global
// Destination Cities Index 2019 (international overnight visitors in 2018): Bangkok 22.78 million, Paris 19.10,
// London 19.09, Dubai 15.93, Singapore 14.67 — Bangkok first for the fourth year running. The ranks build up from
// fifth to first on the screen, a news ticker crawls below, the camera drifts and the LED grid beats (moiré). 16 s.
export const demo: StyleDemo = { id: "M32", name: "ป้ายไฟ LED", frames: 480, cover: 400, sizes: ["9x16"] };

const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
const LAND = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

const COLS = 160, ROWS = 200, PITCH = 6;
const SX = 60, SY = 270;
const T_COLS = 160, T_ROWS = 13, T_PITCH = 6;

const RANK = [
  { n: 1, name: "กรุงเทพฯ", v: 22.78, at: [100.5, 13.75] as [number, number] },
  { n: 2, name: "ปารีส", v: 19.1, at: [2.35, 48.86] as [number, number] },
  { n: 3, name: "ลอนดอน", v: 19.09, at: [-0.13, 51.5] as [number, number] },
  { n: 4, name: "ดูไบ", v: 15.93, at: [55.27, 25.2] as [number, number] },
  { n: 5, name: "สิงคโปร์", v: 14.67, at: [103.82, 1.35] as [number, number] },
];
const SHOW = (n: number) => 120 + (5 - n) * 44; // fifth appears first
const BIG = 330; // the "number one" moment
const TICKER = "ข่าวด่วน ● Mastercard จัดอันดับเมืองที่ชาวต่างชาติมาค้างคืนมากที่สุดในโลก ● กรุงเทพฯ 22.78 ล้านคน แซงปารีสและลอนดอน ● อันดับ 1 เป็นปีที่ 4 ติดต่อกัน ● ";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const screen = (frame: number): Draw => (ctx, w, h) => {
  const u = w / 120; // layout unit: 1/120 of the panel width (the panel has 140 LEDs across)
  ctx.textBaseline = "alphabetic";
  // full-panel LED gradient, red-orange to amber: the screen is the brightest thing on the street
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#ff2d1a");
  bg.addColorStop(0.55, "#ff6a00");
  bg.addColorStop(1, "#ffa000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // header bar
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, 22 * u);
  ctx.fillStyle = C.white;
  ctx.font = `800 ${10.6 * u}px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("เมืองท่องเที่ยวอันดับโลก", w / 2, 15.5 * u);
  ctx.fillStyle = C.white;
  ctx.font = `800 ${8.6 * u}px ${font}`;
  ctx.fillText("ต่างชาติมาค้างคืน ปี 2561", w / 2, 32 * u);
  // map band
  const mapY = 36 * u, mapH = 44 * u;
  const proj = geoEquirectangular().fitExtent([[2 * u, mapY], [w - 2 * u, mapY + mapH]], { type: "MultiPoint", coordinates: [[-12, -4], [112, 58]] });
  const big = interpolate(frame, [BIG, BIG + 14], [0, 1], clamp);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, mapY - 2 * u, w, mapH + 4 * u);
  ctx.clip();
  // the map band is a deep LED blue, the complement of the orange screen
  const sea = ctx.createLinearGradient(0, mapY, w, mapY + mapH);
  sea.addColorStop(0, "#0a1fd8");
  sea.addColorStop(1, "#0a78ff");
  ctx.fillStyle = sea;
  ctx.fillRect(0, mapY - 2 * u, w, mapH + 4 * u);
  // land as a dot screen (one dot every 2 LEDs), with a moving scan line of brighter dots
  ctx.save();
  ctx.beginPath();
  geoPath(proj, ctx)(LAND);
  ctx.clip();
  const L = w / COLS;
  const scan = ((frame * 2.2) % 160) * L;
  for (let yy = mapY; yy < mapY + mapH; yy += 2 * L)
    for (let xx = L * 0.5; xx < w; xx += 2 * L) {
      const hot = Math.abs(xx - scan) < 6 * L;
      ctx.fillStyle = hot ? "#ffffff" : "#8fe6ff";
      ctx.fillRect(xx, yy, L * 1.2, L * 1.2);
    }
  ctx.restore();
  // flight lines from each ranked city to Bangkok, then the city dots
  for (const r of RANK) {
    const k = interpolate(frame, [SHOW(r.n), SHOW(r.n) + 16], [0, 1], clamp);
    if (k <= 0) continue;
    const [x, y] = proj(r.at) as [number, number];
    const pulse = r.n === 1 ? 1 + 0.5 * Math.sin(frame * 0.35) : 1;
    ctx.fillStyle = r.n === 1 ? C.yellow : C.white;
    ctx.beginPath();
    ctx.arc(x, y, (r.n === 1 ? 2.6 : 1.8) * u * k * pulse, 0, Math.PI * 2);
    ctx.fill();
    if (r.n === 1 && big > 0) {
      for (let i = 0; i < 3; i++) {
        const ph = ((frame - BIG) * 0.6 + i * 6) % 18;
        ctx.strokeStyle = `rgba(255,210,31,${(1 - ph / 18) * big})`;
        ctx.lineWidth = 1.2 * u;
        ctx.beginPath();
        ctx.arc(x, y, (3 + ph) * u, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.fillStyle = r.n === 1 ? C.yellow : C.white;
    ctx.font = `800 ${8 * u}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(String(r.n), x, y - 3.4 * u);
  }
  ctx.restore();
  // ranking rows: #1 on top, revealed from #5 up
  const top = 84 * u, rowH = 11.6 * u;
  const maxV = 24;
  RANK.forEach((r, i) => {
    const k = ease(interpolate(frame, [SHOW(r.n), SHOW(r.n) + 20], [0, 1], clamp));
    if (k <= 0) return;
    const y = top + i * rowH;
    const one = r.n === 1;
    const flash = one && frame > BIG ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.7) : 1;
    ctx.globalAlpha = Math.min(1, k * 1.4);
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.fillRect(0, y - 0.6 * u, w, 11 * u);
    ctx.fillStyle = one ? C.yellow : C.white;
    ctx.fillRect(1 * u, y, 10 * u, 10.4 * u);
    ctx.fillStyle = "#000";
    ctx.font = `800 ${9.4 * u}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(String(r.n), 6 * u, y + 8.9 * u);
    ctx.fillStyle = one ? C.yellow : C.white;
    ctx.textAlign = "left";
    ctx.font = `800 ${9 * u}px ${font}`;
    ctx.fillText(r.name, 13 * u, y + 8.6 * u);
    // bar under the name, value at its end
    const bw = (r.v / maxV) * 34 * u * k;
    ctx.fillStyle = one ? `rgba(255,210,31,${flash})` : "#ff6a2a";
    ctx.fillRect(60 * u, y + 2 * u, bw, 7 * u);
    ctx.fillStyle = one ? C.yellow : C.white;
    ctx.font = `800 ${8.6 * u}px ${font}`;
    ctx.textAlign = "right";
    ctx.fillText((r.v * k).toFixed(2), w - 1 * u, y + 8.6 * u);
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = "#000";
  ctx.font = `700 ${6.8 * u}px ${font}`;
  ctx.textAlign = "right";
  ctx.fillText("ล้านคน", w - 1 * u, top + 5 * rowH + 6.4 * u);
  ctx.textAlign = "left";
  ctx.fillText("ที่มา Mastercard GDCI 2019", 1 * u, top + 5 * rowH + 6.6 * u);
  // the "number one" overlay over the map
  if (big > 0) {
    const out = interpolate(frame, [440, 470], [1, 0], clamp);
    ctx.globalAlpha = big * out;
    // a yellow badge in the empty ocean corner of the map, the map stays visible
    const bx = 3 * u, by = mapY + 21 * u;
    ctx.fillStyle = C.yellow;
    ctx.fillRect(bx, by, 44 * u, 22 * u);
    ctx.fillStyle = "#000";
    ctx.font = `800 ${12 * u}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText("อันดับ 1", bx + 22 * u, by + 12 * u);
    ctx.font = `800 ${7.4 * u}px ${font}`;
    ctx.fillText("4 ปีติดต่อกัน", bx + 22 * u, by + 19.6 * u);
    ctx.globalAlpha = 1;
  }
};

const ticker = (frame: number): Draw => (ctx, w, h) => {
  const u = w / T_COLS;
  ctx.fillStyle = "#0a2ad8";
  ctx.fillRect(0, 0, w, h);
  ctx.font = `700 ${10 * u}px ${font}`;
  ctx.textBaseline = "alphabetic";
  const tw = ctx.measureText(TICKER).width;
  const x = w - ((frame * 1.9 * u) % (tw + w));
  for (const off of [0, tw]) {
    ctx.fillStyle = C.white;
    ctx.fillText(TICKER, x + off, 10 * u);
  }
  // red "LIVE" tag pinned on the left
  ctx.fillStyle = C.red;
  ctx.fillRect(0, 0, 24 * u, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(24 * u, 0, 3 * u, h);
  ctx.fillStyle = C.white;
  ctx.font = `800 ${8.4 * u}px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("LIVE", 12 * u, 9.6 * u);
  ctx.textAlign = "left";
};

const sign: Draw = (ctx, w, h) => {
  const u = w / 130;
  ctx.fillStyle = C.red;
  ctx.fillRect(0, 0, 3 * u, h);
  ctx.fillRect(w - 3 * u, 0, 3 * u, h);
  ctx.fillStyle = C.white;
  ctx.font = `800 ${12 * u}px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText("M32 · ป้ายไฟ LED", w / 2, 11.6 * u);
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const ready = useFontReady();
  // street-level camera: slow push with a drift that speeds up between ranks (that is when the moiré shows)
  const rot = interpolate(frame, [0, 150, 230, 480], [-16, -14, -4, -2], clamp);
  const tilt = interpolate(frame, [0, 480], [16, 13], clamp);
  const sc = interpolate(frame, [0, 480], [0.9, 0.96], clamp);
  const speed = Math.abs(interpolate(frame + 1, [0, 150, 230, 480], [-16, -14, -4, -2], clamp) - rot);
  const moire = Math.min(0.4, 0.03 + speed * 2.6);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <Bed id="city_crowd" from={0} to={480} volume={0.06} />
      {[5, 4, 3, 2, 1].map((n) => <Sfx key={n} src={SFX.pop} at={SHOW(n)} volume={0.2} />)}
      <Sfx src={SFX.whoosh} at={150} volume={0.12} />
      <Sfx src={SFX.hit} at={BIG} volume={0.3} />
      <Hit id="crowd_cheer" at={BIG + 4} volume={0.08} />
      <Night width={1080} height={1920} />
      <div style={{ position: "absolute", inset: 0, perspective: 1500, perspectiveOrigin: "50% 85%" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${sc}) rotateY(${rot}deg) rotateX(${tilt}deg)`, transformOrigin: "50% 80%" }}>
          <Building x={30} w={1020} top={1590} screen={[SX, SY, COLS * PITCH, ROWS * PITCH]} />
          <LedPanel x={215} y={150} cols={130} rows={15} pitch={5} draw={sign} deps={[]} ready={ready} bloom={0.5} />
          <LedPanel x={SX} y={SY} cols={COLS} rows={ROWS} pitch={PITCH} draw={screen(frame)} deps={[frame]} ready={ready} />
          <Moire x={SX} y={SY} w={COLS * PITCH} h={ROWS * PITCH} pitch={PITCH} k={moire} phase={frame / 30} />
          <LedPanel x={SX} y={1640} cols={T_COLS} rows={T_ROWS} pitch={T_PITCH} draw={ticker(frame)} deps={[frame]} ready={ready} bloom={0.5} />
        </div>
      </div>
      {/* street haze in front of everything */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380, background: "linear-gradient(rgba(74,38,32,0), rgba(74,38,32,0.55) 60%, rgba(20,10,12,0.9))" }} />
      <Small style={{ position: "absolute", left: 0, right: 0, top: 1828, textAlign: "center", fontSize: 19, opacity: fade(frame, 0, 999, 10) }}>
        ข้อมูล: Mastercard Global Destination Cities Index 2019 (ปี 2561) · ภาพป้ายเป็นภาพประกอบ · แผนที่ Natural Earth
      </Small>
    </AbsoluteFill>
  );
};
