import type { Glass, Picture, Tile } from "./Mosaic";

// Pictures set in the glass field of a temple gable (หน้าบัน), as classifiers (x, y, tile) → glass, or null outside
// the gable (sky and hall are smooth plaster, not glass). The gable: apex (540, 380), base y 1370, half-width 610.
export const GABLE = { ax: 540, ay: 380, by: 1370, hw: 610 };
export const gablePath = () => {
  const { ax, ay, by, hw } = GABLE;
  return `M${ax} ${ay} L${ax + hw} ${by} L${ax - hw} ${by} Z`;
};
export const inGable = (x: number, y: number) => {
  const { ax, ay, by, hw } = GABLE;
  if (y > by - 8) return false;
  return y > ay + 40 + (Math.abs(x - ax) * (by - ay)) / hw;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (h1: string, h2: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const a = p(h1), b = p(h2);
  return `#${a.map((v, i) => Math.round(lerp(v, b[i], Math.max(0, Math.min(1, t)))).toString(16).padStart(2, "0")).join("")}`;
};

// ---------- A: the chedi struck by lightning (emerald glass ground) ----------
export const CRACK_D = "M520 930 L560 990 L530 1050 L575 1110 L540 1180 L585 1240";
const chediPart = (x: number, y: number) => {
  const dx = Math.abs(x - 540);
  if (y > 1240 && y < 1350) return dx < (y < 1290 ? 220 : 270);
  if (y >= 950 && y <= 1240) return dx < 60 + 150 * Math.pow(Math.sin((((y - 950) / 290) * Math.PI) / 2), 0.7);
  if (y >= 890 && y < 950) return dx < 66;
  if (y >= 560 && y < 890) return dx < lerp(4, 46, (y - 560) / 330);
  return false;
};
export const chediOutline = () => {
  const L: string[] = [], R: string[] = [];
  for (let y = 560; y <= 890; y += 30) { const hw = lerp(4, 46, (y - 560) / 330) + 6; L.push(`${540 - hw} ${y}`); R.unshift(`${540 + hw} ${y}`); }
  L.push("470 890", "470 950"); R.unshift("610 950", "610 890");
  for (let y = 950; y <= 1240; y += 10) { const k = (y - 950) / 290; const hw = 60 + 150 * Math.pow(Math.sin((k * Math.PI) / 2), 0.7) + 8; L.push(`${540 - hw} ${y}`); R.unshift(`${540 + hw} ${y}`); }
  return `M${L.join(" L")} L${R.join(" L")} Z`;
};
export const chediField = (crack: number): Picture => (x, y, t) => {
  if (!inGable(x, y)) return null;
  if (chediPart(x, y) && y > 1240) return { c: Math.floor(y / 22) % 2 ? "#e6ecea" : "#c9d3d1", k: "m" }; // mirror plinth
  if (t.g > 0.985) return { c: "#eef3f1", k: "m" };
  // emerald ground lit from the seam: bright round it, deep towards the bargeboards
  const d = Math.hypot((x - 545) * 1.2, (y - 1080) * 0.9);
  const glow = Math.exp(-((d / (260 + 170 * crack)) ** 2)) * (0.35 + 0.65 * crack);
  return { c: mix(t.f > 0.5 ? "#0c5a26" : "#0e662c", t.f > 0.5 ? "#7cf0a6" : "#62e290", glow + t.f * 0.06), k: "g" };
};

// ---------- B: the journey (ruby glass, an emerald river, five mirror medallions) ----------
export const CITIES = [
  { x: 540, y: 640, th: "เชียงราย", yr: "พ.ศ. 1977", side: 1 },
  { x: 440, y: 815, th: "ลำปาง", yr: "พ.ศ. 1979", side: 1 },
  { x: 650, y: 970, th: "เชียงใหม่", yr: "พ.ศ. 2011", side: -1 },
  { x: 390, y: 1140, th: "หลวงพระบาง · เวียงจันทน์", yr: "พ.ศ. 2095", side: 1 },
  { x: 690, y: 1290, th: "กรุงเทพฯ", yr: "พ.ศ. 2327", side: -1 },
];
const riverX = (y: number) => {
  const ys = CITIES.map((c) => c.y), xs = CITIES.map((c) => c.x);
  if (y <= ys[0]) return xs[0];
  for (let i = 1; i < ys.length; i++)
    if (y <= ys[i]) {
      const k = (y - ys[i - 1]) / (ys[i] - ys[i - 1]);
      return lerp(xs[i - 1], xs[i], (1 - Math.cos(k * Math.PI)) / 2);
    }
  return xs[xs.length - 1];
};
export const riverPoint = (k: number) => {
  const y = lerp(CITIES[0].y, CITIES[CITIES.length - 1].y, k);
  return [riverX(y), y] as const;
};
export const journey = (lit: number): Picture => (x, y, t) => {
  if (!inGable(x, y)) return null;
  for (let i = 0; i < CITIES.length; i++) {
    const c = CITIES[i];
    const d = Math.hypot(x - c.x, y - c.y);
    if (d < 50) return i < lit ? { c: d < 24 ? "#9dffc4" : "#22c46c", k: "m" } : { c: d < 24 ? "#eef3f1" : "#c9d3d1", k: "m" };
  }
  if (y > CITIES[0].y && y < CITIES[4].y) {
    const dr = Math.abs(x - riverX(y));
    if (dr < 24) return { c: t.f > 0.5 ? "#1aa850" : "#139444", k: "g" };
    if (dr < 36) return { c: "#e0b040", k: "g" };
  }
  if (t.g > 0.985) return { c: "#eef3f1", k: "m" };
  return { c: t.f > 0.8 ? "#b3222a" : t.f < 0.2 ? "#6a0f16" : "#8a161d", k: "g" };
};

// ---------- C: the pavilion throne in Bangkok (blue glass, mirror rays) ----------
export const throneField = (x: number, y: number, t: Tile): Glass | null => {
  if (!inGable(x, y)) return null;
  const a = Math.atan2(y - 1010, x - 540) + Math.PI;
  const ray = (a / (Math.PI / 12)) % 1;
  const d = Math.hypot(x - 540, y - 1010);
  if (d > 290 && ray < 0.2) return { c: t.f > 0.5 ? "#e6ecee" : "#cfd8db", k: "m" };
  if (t.g > 0.985) return { c: "#eef3f1", k: "m" };
  return { c: mix(t.f > 0.5 ? "#173f8e" : "#1b4a9c", "#3b7fd0", Math.exp(-((d / 360) ** 2)) * 0.8), k: "g" };
};
// The busabok (pavilion throne): stepped base and a tiered spire, one outline.
export const busabokOutline = () => {
  const L: string[] = [], R: string[] = [];
  for (const [y, hw] of [[1340, 250], [1300, 210], [1260, 170], [1220, 140]]) { L.push(`${540 - hw} ${y + 40}`, `${540 - hw} ${y}`); R.unshift(`${540 + hw} ${y}`, `${540 + hw} ${y + 40}`); }
  for (const [y, hw] of [[1220, 118], [1010, 118], [1000, 150], [950, 120], [900, 96], [855, 76], [815, 58], [780, 42], [750, 28], [610, 4]]) { L.push(`${540 - hw} ${y}`); R.unshift(`${540 + hw} ${y}`); }
  return `M${L.join(" L")} L${R.join(" L")} Z`;
};
