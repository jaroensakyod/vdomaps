import { loadFont } from "@remotion/google-fonts/NotoSerifThai";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { distLine, fine, glint, inEll, inPoly, MosaicDefs, rings, rows, type Paint, type Swatch, type Tile, TileEl } from "./kit/Mosaic";

// N32 Byzantine gold: Hagia Sophia told as a gold-ground mosaic icon. Emperor Justinian I, haloed, offers a
// model of the church (dedicated 27 Dec 537). Tesserae are pressed in tile by tile; in 558 the dome's tiles fall
// out of the wall, leaving the red underdrawing; in 562 a higher dome is set; in 1453 the city falls to the
// Ottomans and minarets are set beside it. The gold ground shimmers as light moves across it. 17 s.
export const demo: StyleDemo = { id: "N32", name: "โมเสกทองไบแซนไทน์", frames: 510, cover: 470, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["600", "800"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---- the picture ----
const A = { cx: 540, cy: 745, r: 474, band: 32, base: 1545 };
const H = { cx: 540, cy: 615, r: 152 };
const CHLAMYS = [418, 770, 540, 742, 662, 770, 700, 900, 716, 1180, 730, 1448, 350, 1448, 364, 1180, 380, 900];
const ARM_L = [420, 772, 378, 796, 340, 900, 348, 994, 404, 994, 404, 900, 436, 836];
const ARM_R = [660, 772, 702, 796, 740, 900, 732, 994, 676, 994, 676, 900, 644, 836];
const TUNIC = [360, 1060, 420, 1040, 462, 1448, 350, 1448];
const MODEL = [428, 1000, 652, 1000, 652, 930, 428, 930];
const FOLDS = [[600, 800, 620, 1000, 640, 1200, 660, 1440], [520, 1040, 530, 1250, 540, 1440], [470, 1050, 455, 1250, 440, 1440], [432, 806, 470, 860, 520, 900], [682, 950, 692, 1200, 706, 1440], [560, 790, 575, 900], [700, 820, 716, 960]];
const polyD = (p: number[]) => `M${p.reduce((s, v, i) => s + (i % 2 ? ` ${v}` : `${i ? " L" : ""}${v}`), "")} Z`;
const TFOLDS = [[382, 1080, 376, 1440], [428, 1080, 440, 1440], [372, 820, 360, 960]];

const S: Record<string, Swatch> = {
  gold: { shades: ["#f0cc5c", "#e6c24c", "#f6da70", "#dcb440", "#c99a35"], gold: true },
  halo: { shades: ["#f6dd90", "#ecca70", "#f9e6a8", "#e0bb5c"], gold: true },
  haloRing: { shades: ["#9b2b1d", "#86261a"], outline: "#5a160e" },
  outer: { shades: ["#6a1f26", "#5a1a20", "#7a252c", "#4e161c"] },
  cap: { shades: ["#121d47", "#16245a", "#0f193d", "#1a2858"] },
  bandR: { shades: ["#a3261d", "#8a1e17", "#b8342a"] },
  bandB: { shades: ["#1f3f8f", "#2a52a8", "#1a3578"] },
  pearl: { shades: ["#f3eee2", "#e2dccb"] },
  green: { shades: ["#3f7a3a", "#4e8c43", "#2f6330", "#5a9a4c"] },
  chlamys: { shades: ["#7a3069", "#6e2c60", "#62255a", "#3e1438", "#2a0c26"], outline: "#22091e" },
  tunic: { shades: ["#f2ecdf", "#e4ddcd", "#d2cab8", "#b9b09c"], outline: "#5a4c3c" },
  clavus: { shades: ["#e8bf5e", "#d6a744", "#f0cd74"], gold: true, outline: "#5a3a12" },
  tabDot: { shades: ["#a3261d", "#8a1e17"] },
  skin: { shades: ["#e8c09c", "#dcae88", "#d3a37e", "#c38e6a"], outline: "#6a3a22" },
  hair: { shades: ["#3a2416", "#4a3020", "#2e1c10"], outline: "#1a0e08" },
  eye: { shades: ["#1e130c"] },
  white: { shades: ["#f6f1e6"] },
  brow: { shades: ["#3a2416"] },
  lip: { shades: ["#a8443a"] },
  nose: { shades: ["#b07a58"] },
  crown: { shades: ["#f0cd74", "#e0b552"], gold: true, outline: "#5a3a12" },
  jewel: { shades: ["#b8241d", "#c8302a"], outline: "#4a0c08" },
  jewelG: { shades: ["#1f7a4f", "#2a8f5f"], outline: "#0c3a22" },
  shoe: { shades: ["#a3261d", "#8a1e17"], outline: "#3a0a06" },
  stone: { shades: ["#e6c19c", "#d9ae86", "#cc9f78", "#eccfae"], outline: "#5a3a26" },
  window: { shades: ["#3a2a3a", "#2a1f2e"] },
  lead: { shades: ["#9aabc2", "#8a9bb3", "#7a8ca6", "#6a7c96"], outline: "#2a3346" },
  minaret: { shades: ["#efe8da", "#ddd3c1", "#cfc3ae"], outline: "#4a4036" },
};

const insideArch = (x: number, y: number) => (y < A.cy ? Math.hypot(x - A.cx, y - A.cy) < A.r : Math.abs(x - A.cx) < A.r && y < A.base);
const band = (x: number, y: number) => {
  if (y >= A.base && y < A.base + 26) return "bandR";
  if (y >= A.base + 26) return null;
  let u: number, along: number;
  if (y < A.cy) { const d = Math.hypot(x - A.cx, y - A.cy); u = d - A.r; along = Math.atan2(y - A.cy, x - A.cx) * A.r; }
  else { u = Math.abs(x - A.cx) - A.r; along = y - A.cy; }
  if (u < 0 || u > A.band) return null;
  if (u > 12 && u < 20) return Math.round(along / 18) % 2 ? "pearl" : "bandB";
  return Math.floor(along / 46) % 2 ? "bandR" : "bandB";
};
// the model's own parts (drawn as separate layers so the dome can fall and be rebuilt)
// the model is drawn at 1 : 1 and shown 1.5× larger around (540, 1000), the hands under its corners
const MS = 1.5;
const big = (p: Paint): Paint => (x, y) => p(540 + (x - 540) / MS, 1000 + (y - 1000) / MS);
const modelBase0: Paint = (x, y) => {
  if (inPoly(x, y, MODEL)) return y > 946 && y < 974 && (x - 432) % 26 < 12 ? "window" : "stone";
  if (x > 470 && x < 610 && y > 896 && y <= 930) return y > 904 && y < 922 && (x - 472) % 20 < 8 ? "window" : "stone";
  if (y <= 930 && (inEll(x, y, 470, 930, 42, 34) || inEll(x, y, 610, 930, 42, 34))) return "lead";
  return null;
};
const dome = (ry: number): Paint => big((x, y) => (y <= 897 && inEll(x, y, 540, 897, 78, ry) ? "lead" : null));
const modelBase = big(modelBase0);
const dome1 = dome(48);
const dome2 = dome(70);
const minarets: Paint = big((x, y) => {
  for (const mx of [398, 682]) {
    if (Math.abs(x - mx) < 15 && y > 800 && y < 1000) return y > 852 && y < 866 ? "window" : "minaret";
    if (Math.abs(x - mx) < 21 && y > 836 && y < 852) return "minaret";
    if (y > 730 && y <= 800 && Math.abs(x - mx) < ((y - 730) / 70) * 17) return "lead";
  }
  return null;
});
const face: Paint = (x, y) => {
  if (inEll(x, y, 520, 634, 13, 6.5) || inEll(x, y, 560, 634, 13, 6.5)) return inEll(x, y, 520, 634, 5, 5.5) || inEll(x, y, 560, 634, 5, 5.5) ? "eye" : "white";
  if (distLine(x, y, [504, 618, 520, 612, 534, 618]) < 3 || distLine(x, y, [546, 618, 560, 612, 576, 618]) < 3) return "brow";
  if (distLine(x, y, [540, 630, 536, 668, 544, 670]) < 2.6) return "nose";
  if (inEll(x, y, 540, 688, 12, 4.5)) return "lip";
  if (inEll(x, y, 540, 648, 50, 64)) return "skin";
  if (inEll(x, y, 540, 626, 64, 76) && y < 706) return "hair";
  return null;
};
const base: Paint = (x, y) => {
  if (y < 250) return "gold";
  if (y >= A.base + 26) return "cap";
  const b = band(x, y);
  if (b) return b;
  if (!insideArch(x, y)) { const dx = (x + 40) % 132, dy = (y + 56) % 132; return (dx < 54 && dy > 18 && dy < 36) || (dy < 54 && dx > 18 && dx < 36) ? "bandR" : "gold"; }
  // spaces the model's layers fill (left bare: mortar and underdrawing show when they are empty)
  if (modelBase(x, y) || dome1(x, y)) return null;
  // figure
  if (inEll(x, y, 382, 1004, 28, 22) || inEll(x, y, 698, 1004, 28, 22)) return "skin";
  const crown = inPoly(x, y, [476, 580, 604, 580, 598, 540, 482, 540]);
  if (crown) return [500, 540, 580].some((cx) => inEll(x, y, cx, 560, 9, 9)) ? (Math.abs(x - 540) < 12 ? "jewelG" : "jewel") : "crown";
  for (const px of [480, 600]) for (let py = 596; py < 700; py += 22) if (inEll(x, y, px, py, 7, 7)) return "pearl";
  const f = face(x, y);
  if (f) return f;
  if (x > 516 && x < 564 && y > 700 && y < 752) return "skin";
  if (inEll(x, y, 432, 790, 18, 18)) return "jewel";
  if (inPoly(x, y, ARM_L)) return y > 962 ? "clavus" : "tunic";
  if (inPoly(x, y, ARM_R)) return y > 962 ? "clavus" : "chlamys";
  if (inPoly(x, y, TUNIC)) return Math.abs(x - 412 - (y - 1040) * 0.02) < 9 || y > 1418 ? "clavus" : "tunic";
  if (x > 572 && x < 668 && y > 1050 && y < 1170) return x > 584 && x < 656 && y > 1062 && y < 1158 && (Math.floor((x - 584) / 18) + Math.floor((y - 1062) / 18)) % 2 === 0 ? "tabDot" : "clavus";
  if (inPoly(x, y, CHLAMYS)) return "chlamys";
  if (inEll(x, y, 492, 1478, 30, 14) || inEll(x, y, 588, 1478, 30, 14)) return "shoe";
  if ((x > 474 && x < 512 || x > 570 && x < 608) && y >= 1440 && y < 1474) return "tunic";
  if (Math.hypot(x - H.cx, y - H.cy) < H.r) return Math.hypot(x - H.cx, y - H.cy) > H.r - 14 ? "haloRing" : "halo";
  if (y > 1470) return "green";
  return "gold";
};
const shade = (region: string, x: number, y: number) => {
  if (region === "chlamys") { const d = Math.min(...FOLDS.map((f) => distLine(x, y, f))); return d < 4.5 ? 4 : d < 9 ? 3 : 0; }
  if (region === "tunic") { const d = Math.min(...TFOLDS.map((f) => distLine(x, y, f))); return d < 5 ? 2 : 0; }
  if (region === "lead") return Math.abs(Math.atan2(897 - y, x - 540) * 6) % 1 < 0.22 ? 2 : 0;
  if (region === "skin") return Math.hypot(x - 540, (y - 650) * 0.8) > 40 ? 1 : 0;
  return 0;
};
const GROUND = new Set(["outer", "cap", "gold", "green"]);
const BAND = new Set(["bandR", "bandB", "pearl"]);
const HALO = new Set(["halo", "haloRing"]);
const FACE = new Set(["skin", "eye", "white", "brow", "nose", "lip", "hair"]);
const opt = (paint: Paint, keep: (r: string) => boolean, seed: number) => ({ paint, swatch: S, keep, shade, seed });
const TILES = (() => {
  const ground = rows(opt(base, (r) => GROUND.has(r), 1), [0, 0, 1080, 1920], 18);
  const bandT = [
    ...rings(opt(base, (r) => BAND.has(r), 2), A.cx, A.cy, A.r, A.r + A.band, 13, Math.PI, Math.PI * 2),
    ...fine(opt((x, y) => (y >= A.cy ? base(x, y) : null), (r) => BAND.has(r), 3), [20, A.cy, 1060, A.base + 26], 13),
  ];
  const halo = rings(opt(base, (r) => HALO.has(r), 4), H.cx, H.cy, 0, H.r, 14);
  const figure = fine(opt(base, (r) => !GROUND.has(r) && !BAND.has(r) && !HALO.has(r), 5), [320, 520, 760, 1500], 11).filter((t) => !(t.y < 760 && t.x > 470 && t.x < 610 && FACE.has(t.region)));
  const faceT = fine(opt(base, (r) => FACE.has(r), 6), [470, 540, 610, 760], 7);
  const model = fine(opt(modelBase, () => true, 7), [350, 800, 730, 1006], 9);
  const d1 = fine(opt(dome1, () => true, 8), [415, 760, 665, 850], 9);
  const d2 = fine(opt(dome2, () => true, 9), [415, 725, 665, 850], 9);
  const mins = fine(opt(minarets, () => true, 10), [290, 580, 790, 1004], 9);
  return { ground, bandT, halo, figure, faceT, model, d1, d2, mins };
})();

const CAPS = [
  { from: 16, to: 236, a: "ค.ศ. 537 · จักรพรรดิจัสติเนียนที่ 1", b: "ฉลองมหาวิหารฮาเกียโซเฟีย กรุงคอนสแตนติโนเปิล" },
  { from: 236, to: 300, a: "ค.ศ. 558 · แผ่นดินไหว", b: "โดมใหญ่พังถล่มลงมา" },
  { from: 300, to: 390, a: "ค.ศ. 562 · สร้างโดมใหม่", b: "สูงกว่าเดิมราว 6 เมตร" },
  { from: 390, to: 510, a: "ค.ศ. 1453 · ออตโตมันยึดเมือง", b: "เปลี่ยนเป็นมัสยิด หออะซานสร้างเพิ่มภายหลัง" },
];

export const Demo = () => {
  const frame = useCurrentFrame();
  const kAt = (at: number) => Math.max(0, Math.min(1, (frame - at) / 8));
  const bandPos = -500 + ((frame * 7) % 2700);
  const lay = (tiles: Tile[], at: (t: Tile) => number) => tiles.map((t, i) => {
    const k = kAt(at(t));
    return k > 0 ? <TileEl key={i} t={t} k={k} glow={t.gold ? glint(t, bandPos) : 0} /> : null;
  });
  const quake = frame >= 236 && frame < 262 ? (1 - (frame - 236) / 26) * 7 : 0;
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to) ?? CAPS[0];
  const capK = interpolate(frame, [cap.from, cap.from + 16, cap.to - 10, cap.to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#2a2118" }}>
      <Bed id="wind" from={0} to={demo.frames} volume={0.05} />
      <Hit id="church_bell" at={16} volume={0.2} />
      <Hit id="thunder_rumble" at={236} volume={0.3} />
      <Hit id="wood_break" at={246} volume={0.16} />
      <Sfx src={SFX.swell} at={300} volume={0.22} />
      <Hit id="gong" at={392} volume={0.22} />
      {Array.from({ length: 10 }, (_, i) => <Sfx key={i} src={SFX.tick} at={60 + i * 9} volume={0.06} />)}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <MosaicDefs />
        <g transform={`translate(${Math.sin(frame * 2.3) * quake},${Math.cos(frame * 3.1) * quake})`}>
          {/* mortar bed and the red underdrawing (sinopia) the mosaicist works over */}
          <rect width={1080} height={1920} fill="#c9b796" />
          <rect width={1080} height={1920} filter="url(#bz-mortar)" />
          <g fill="none" stroke="#a5452c" strokeWidth={3} opacity={0.75}>
            <g transform="translate(540,1000) scale(1.5) translate(-540,-1000)" strokeWidth={2.2}>
              <path d="M462 897 A78 70 0 0 1 618 897" />
              <path d="M462 897 A78 48 0 0 1 618 897" strokeDasharray="8 6" />
              <path d="M428 930 L652 930 L652 1000 L428 1000 Z M470 896 L610 896 L610 930 M470 896 L470 930" />
              <path d="M500 860 L500 897 M540 850 L540 897 M580 860 L580 897" strokeDasharray="5 6" />
            </g>
            <circle cx={H.cx} cy={H.cy} r={H.r} />
            <path d={polyD(CHLAMYS)} />
          </g>
          {lay(TILES.ground, (t) => (t.region === "gold" || t.region === "green" ? 18 + (Math.hypot(t.x - H.cx, t.y - H.cy) / 1100) * 46 + t.r * 12 : (t.y / 1920) * 34 + t.r * 12))}
          {lay(TILES.bandT, (t) => 8 + (t.y / 1920) * 40 + t.r * 10)}
          {lay(TILES.halo, (t) => 44 + (Math.hypot(t.x - H.cx, t.y - H.cy) / H.r) * 22 + t.r * 8)}
          {lay(TILES.figure, (t) => 56 + ((1500 - t.y) / 1000) * 60 + t.r * 14)}
          {lay(TILES.faceT, (t) => 104 + t.r * 22)}
          {lay(TILES.model, (t) => 132 + ((1006 - t.y) / 200) * 16 + t.r * 12)}
          {/* the first dome: set in 537, falls out of the wall in 558 */}
          {TILES.d1.map((t, i) => {
            const k = kAt(150 + ((850 - t.y) / 80) * 14 + t.r * 10);
            if (k <= 0) return null;
            const fallAt = 240 + t.r * 22 + ((t.x - 420) / 240) * 8;
            const tf = frame - fallAt;
            if (tf > 34) return null;
            const fall = tf > 0 ? { dx: (t.r - 0.5) * tf * 4, dy: 0.55 * tf * tf, rot: (t.r - 0.5) * tf * 24, o: 1 - tf / 34 } : undefined;
            return <TileEl key={i} t={t} k={k} fall={fall} />;
          })}
          {lay(TILES.d2, (t) => 304 + ((850 - t.y) / 110) * 34 + t.r * 12)}
          {lay(TILES.mins, (t) => 398 + ((1004 - t.y) / 410) * 34 + t.r * 8)}

          {/* inscriptions in tesserae: a solid dark outline row, letters cut into tiles */}
          <g fontFamily={font} textAnchor="middle" fill="none" strokeLinejoin="round">
            <g opacity={capK} stroke="#0a1230" strokeWidth={10}>
              <text x={540} y={1700} fontSize={62} fontWeight={800}>{cap.a}</text>
              <text x={540} y={1786} fontSize={44} fontWeight={600}>{cap.b}</text>
            </g>
            <text x={540} y={168} fontSize={60} fontWeight={800} stroke="#f7e3a0" strokeWidth={10} opacity={interpolate(frame, [20, 44], [0, 1], clamp)}>N32 · โมเสกทองไบแซนไทน์</text>
            <g opacity={interpolate(frame, [70, 100], [0, 1], clamp)} stroke="#f7e3a0" strokeWidth={8}>
              <text x={540} y={392} fontSize={84} fontWeight={800}>ฮาเกียโซเฟีย</text>
              <text x={262} y={600} fontSize={46} fontWeight={800}>จักรพรรดิ</text>
              <text x={818} y={600} fontSize={46} fontWeight={800}>จัสติเนียน</text>
            </g>
          </g>
          <g mask="url(#bz-tilemask)" fontFamily={font} textAnchor="middle">
            <g opacity={interpolate(frame, [70, 100], [0, 1], clamp)} fill="#7a1a12" fontWeight={800}>
              <text x={540} y={392} fontSize={84}>ฮาเกียโซเฟีย</text>
              <text x={262} y={600} fontSize={46}>จักรพรรดิ</text>
              <text x={818} y={600} fontSize={46}>จัสติเนียน</text>
            </g>
            <text x={540} y={168} fontSize={60} fontWeight={800} fill="#7a1a12" opacity={interpolate(frame, [20, 44], [0, 1], clamp)}>N32 · โมเสกทองไบแซนไทน์</text>
            <g opacity={capK}>
              <text x={540} y={1700} fontSize={62} fontWeight={800} fill="#f6f1e6">{cap.a}</text>
              <text x={540} y={1786} fontSize={44} fontWeight={600} fill="#f0cd74">{cap.b}</text>
            </g>
          </g>
          <rect width={1080} height={1920} fill="url(#bz-light)" />
          <text x={540} y={1858} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={25} fill="#9fb0dc" opacity={0.9}>ภาพประกอบ · ไม่ได้จำลองจากโมเสกชิ้นจริง</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
