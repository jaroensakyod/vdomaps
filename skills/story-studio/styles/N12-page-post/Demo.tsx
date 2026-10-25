import { interpolate, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { AlbumPage, BLUE, Caption, CARMINE, clamp, EngravedFrame, EngravedMap, Footer, GREEN, INK, Label, Mount, PageHead, PAPER, PictureWindow, Postmark, Stamp, useIn } from "./kit/Stamp";

// N12 stamp album: a 4:5 anniversary post announcing the next clip (ยุทธนาวีเกาะช้าง, 17 ม.ค. 2484), drawn as a
// commemorative stamp issue on a buff album page. Big stamp = the post's picture (here an engraved warship at
// dusk in green + ultramarine + carmine; pass `photo` to PictureWindow for the page's own picture), small stamp =
// the map, perforated carmine label = "coming soon", round postmark with the date ring, printed caption below.
// 1080×1350 (`Style-N12-post`), 10 s.
export const demo: StyleDemo = { id: "N12", name: "แสตมป์ที่ระลึก", frames: 300, cover: 200, sizes: ["4x5"] };

const KOCHANG: [number, number] = [102.35, 12.05];

// Engraved picture, 560×470: line-ruled sky, sun in carmine rings, hatched island, wave-line sea, cross-hatched
// ship with smoke and splashes. Only lines — the tone comes from line weight and spacing, as in intaglio.
const PW = 560;
const PH = 470;
const HORIZON = 300;
const Warship = ({ t }: { t: number }) => {
  const bob = Math.sin(t * 0.07) * 2;
  const sun: [number, number] = [404, 262];
  const sky = Array.from({ length: 75 }, (_, i) => {
    const y = 2 + i * 4;
    const wgt = 3.6 - (y / HORIZON) * 1.9; // heavy at the top, fine at the horizon = light at dusk
    return { y, wgt };
  });
  const sea = Array.from({ length: 26 }, (_, i) => {
    const y = HORIZON + 3 + Math.pow(i, 1.35) * 2.4;
    const amp = 0.6 + i * 0.22;
    const len = 9 + i * 1.6;
    let d = `M-10 ${y}`;
    for (let x = -10; x < PW + 20; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return { d, w: 1.6 + i * 0.17, shift: ((t * (0.25 + i * 0.03)) % len) - len };
  });
  return (
    <g>
      <defs>
        <radialGradient id="n12sunfade"><stop offset="0.33" stopColor="#000" /><stop offset="0.5" stopColor="#555" /><stop offset="1" stopColor="#fff" /></radialGradient>
        <mask id="n12sunhole" maskUnits="userSpaceOnUse" x={0} y={0} width={PW} height={PH}>
          <rect width={PW} height={PH} fill="#fff" />
          <circle cx={sun[0]} cy={sun[1]} r={130} fill="url(#n12sunfade)" />
        </mask>
        <clipPath id="n12skyclip"><rect width={PW} height={HORIZON} /></clipPath>
      </defs>
      {/* sky: ruled lines, ultramarine */}
      {/* pale ultramarine underprint tint, glowing toward the sun */}
      <rect width={PW} height={HORIZON} fill="#9eacd6" />
      <circle cx={sun[0]} cy={sun[1]} r={150} fill="#efd3c4" opacity={0.85} style={{ filter: "blur(30px)" }} />
      <g mask="url(#n12sunhole)" clipPath="url(#n12skyclip)">
        {sky.map(({ y, wgt }) => <line key={y} x1={0} x2={PW} y1={y} y2={y} stroke={BLUE} strokeWidth={Math.max(0.35, wgt)} />)}
        {/* two cloud banks: denser cross-lines */}
        <path d="M30 120 Q120 92 230 110 Q300 96 340 122 Q240 138 30 132 Z" fill="url(#n12hatchB)" stroke={BLUE} strokeWidth={1} />
        <path d="M300 200 Q380 178 470 190 Q530 186 560 200 L560 214 Q430 222 300 212 Z" fill="url(#n12hatchB)" stroke={BLUE} strokeWidth={1} />
      </g>
      {/* sun: carmine rays + concentric rings */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r0 = 54, r1 = i % 2 ? 96 : 130;
        return <line key={i} x1={sun[0] + Math.cos(a) * r0} y1={sun[1] + Math.sin(a) * r0} x2={sun[0] + Math.cos(a) * r1} y2={Math.min(HORIZON, sun[1] + Math.sin(a) * r1)} stroke={CARMINE} strokeWidth={0.9} opacity={sun[1] + Math.sin(a) * r0 > HORIZON ? 0 : 0.85} />;
      })}
      <clipPath id="n12sunclip"><rect width={PW} height={HORIZON} /></clipPath>
      <g clipPath="url(#n12sunclip)">
        {[8, 14, 20, 26, 32, 38].map((r) => <circle key={r} cx={sun[0]} cy={sun[1]} r={r} fill="none" stroke={CARMINE} strokeWidth={1.6} />)}
      </g>
      {/* far island, left: hatched green with a contour */}
      <path d={`M0 ${HORIZON} L0 258 Q40 232 84 244 Q118 206 156 236 Q190 228 214 ${HORIZON} Z`} fill="url(#n12hatchG)" stroke={GREEN} strokeWidth={1.4} />
      {/* sea: wave lines in deep green, heavier toward the viewer */}
      <rect y={HORIZON} width={PW} height={PH - HORIZON} fill="#86ac98" />{/* pale green underprint tint (second plate) */}
      {sea.map((l, i) => <path key={i} d={l.d} transform={`translate(${l.shift} 0)`} fill="none" stroke={GREEN} strokeWidth={l.w} />)}
      {/* sun's path on the water: carmine dashes */}
      {Array.from({ length: 12 }, (_, i) => {
        const y = HORIZON + 6 + i * 11;
        const half = 10 + i * 4;
        const x0 = sun[0] + Math.sin(i * 1.7 + t * 0.05) * 8;
        return <line key={i} x1={x0 - half} x2={x0 + half} y1={y} y2={y} stroke={CARMINE} strokeWidth={1.6} strokeDasharray="8 5" opacity={0.85 - i * 0.05} />;
      })}
      {/* smoke: hatched puffs drifting aft */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((t * 0.5 + i * 20) % 120) / 120;
        return <ellipse key={i} cx={238 - a * 200} cy={196 - a * 70 + bob} rx={18 + a * 40} ry={12 + a * 22} fill="url(#n12hatchG)" stroke={GREEN} strokeWidth={0.9} opacity={0.9 * (1 - a)} />;
      })}
      {/* the ship: cross-hatched silhouette, paper highlights on deck lines */}
      <g transform={`translate(36 ${-90 + bob}) scale(1.45)`} strokeLinejoin="round">
        <g fill="url(#n12cross)" stroke="#122a22" strokeWidth={1}>
          <path d="M18 286 L40 306 L300 306 L318 280 L240 284 L60 284 Z" />
          <path d="M110 284 L110 262 L130 262 L130 244 L170 244 L170 262 L205 262 L205 284 Z" />
          <rect x={140} y={206} width={16} height={40} />
          <rect x={137} y={204} width={22} height={6} />
          <rect x={177} y={180} width={4} height={66} />
          <rect x={166} y={196} width={26} height={3} />
          <path d="M62 284 Q62 266 84 266 Q100 266 100 284 Z" />
          <rect x={20} y={270} width={48} height={5} />
          <path d="M222 284 Q222 266 244 266 Q260 266 260 284 Z" />
          <rect x={256} y={270} width={50} height={5} />
        </g>
        <path d="M179 180 L240 284 M179 180 L70 284" stroke="#122a22" strokeWidth={0.8} />
        <path d="M44 290 L296 290" stroke={PAPER} strokeWidth={0.9} />
        <path d="M114 266 L200 266" stroke={PAPER} strokeWidth={0.7} />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={70 + i * 26} cy={297} r={1.6} fill={PAPER} />)}
        {/* bow wave */}
        <path d="M300 306 q10 -6 22 -2 M296 309 q14 -4 30 0" stroke={GREEN} strokeWidth={0.9} fill="none" />
      </g>
      {/* shell splashes: engraved fountains */}
      {[[86, 0], [480, 40]].map(([x, d]) => {
        const a = ((t + d) % 90) / 90;
        const hgt = 70 * Math.sin(a * Math.PI);
        return (
          <g key={x} opacity={Math.sin(a * Math.PI)}>
            {[-10, -5, 0, 5, 10].map((o) => <path key={o} d={`M${x + o * 0.6} ${HORIZON + 46} Q${x + o * 1.4} ${HORIZON + 46 - hgt} ${x + o * 2.2} ${HORIZON + 46 - hgt * 0.7}`} fill="none" stroke={BLUE} strokeWidth={1} />)}
          </g>
        );
      })}
    </g>
  );
};

// Main stamp face, 640×760.
const SW = 640;
const SH = 760;
const MainFace = ({ t }: { t: number }) => (
  <>
    {/* solid deep-green frame printed in recess, lettering reversed out in paper colour */}
    <rect x={24} y={24} width={SW - 48} height={SH - 48} fill={GREEN} />
    <rect x={24} y={24} width={SW - 48} height={SH - 48} fill="url(#n12guilloche)" opacity={0.5} />
    <EngravedFrame x={30} y={30} w={SW - 60} h={SH - 60} color={PAPER} />
    <text x={54} y={84} fontSize={34} fontWeight={700} fill={PAPER} letterSpacing={2}>ประเทศไทย</text>
    <text x={SW - 54} y={84} fontSize={24} fontWeight={600} fill={PAPER} textAnchor="end" letterSpacing={6}>THAILAND</text>
    <PictureWindow id="n12main" x={40} y={100} w={PW} h={PH}>
      <Warship t={t} />
    </PictureWindow>
    <rect x={40} y={100} width={PW} height={PH} fill="none" stroke={PAPER} strokeWidth={2} />
    {/* bottom panel: title left, denomination right */}
    <text x={54} y={642} fontSize={50} fontWeight={700} fill={PAPER}>ยุทธนาวีเกาะช้าง</text>
    <text x={54} y={688} fontSize={27} fontWeight={600} fill={PAPER} opacity={0.9}>๑๗ มกราคม พุทธศักราช ๒๔๘๔</text>
    <g transform={`translate(${SW - 52} 0)`}>
      <circle cx={-62} cy={648} r={56} fill={PAPER} />
      <circle cx={-62} cy={648} r={49} fill="none" stroke={CARMINE} strokeWidth={1.2} />
      <text x={-62} y={664} fontSize={50} fontWeight={700} fill={CARMINE} textAnchor="middle">๒๕</text>
      <text x={-62} y={688} fontSize={17} fontWeight={700} fill={CARMINE} textAnchor="middle">บาท</text>
    </g>
    {/* honest label, printed like the printer's imprint in the bottom margin */}
    <text x={SW / 2} y={SH - 7} fontSize={13} fontWeight={600} fill={INK} opacity={0.8} textAnchor="middle" letterSpacing={1}>ภาพประกอบ · วาดลายเส้นด้วยโค้ด · เรือรบหลวงยุค ๒๔๘๐</text>
  </>
);

// Map stamp face, 290×360.
const MW = 290;
const MH = 360;
const MapFace = () => (
  <>
    <rect x={16} y={16} width={MW - 32} height={MH - 32} fill={CARMINE} />
    <rect x={16} y={16} width={MW - 32} height={MH - 32} fill="url(#n12guilloche)" opacity={0.45} />
    <EngravedFrame x={21} y={21} w={MW - 42} h={MH - 42} color={PAPER} />
    <text x={MW / 2} y={64} fontSize={26} fontWeight={700} fill={PAPER} textAnchor="middle">อ่าวไทย ๒๔๘๔</text>
    <g transform="translate(32 78)">
      <EngravedMap w={MW - 64} h={212} extent={[[100.2, 10.6], [104.4, 14.4]]} mark={KOCHANG}
        areas={[["764", GREEN, "n12hatchG"], ["116", BLUE, "n12hatchB"], ["704", BLUE, "n12hatchB"], ["418", BLUE, "n12hatchB"]]}
        labels={[{ at: [101.3, 13.9], text: "ไทย", size: 22, color: GREEN }, { at: [103.6, 13.1], text: "อินโดจีน", size: 18, color: BLUE }, { at: [102.0, 11.55], text: "เกาะช้าง", size: 17, color: CARMINE }]} />
      <rect width={MW - 64} height={212} fill="none" stroke={PAPER} strokeWidth={2} />
    </g>
    <text x={36} y={326} fontSize={20} fontWeight={600} fill={PAPER}>ไทย–ฝรั่งเศส</text>
    <text x={MW - 36} y={328} fontSize={34} fontWeight={700} fill={PAPER} textAnchor="end">๓</text>
  </>
);

export const Demo = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [0, 12], [0, 1], clamp);
  const big = useIn(6);
  const small = useIn(20);
  const label = useIn(32);
  const mounts = useIn(44, 18);
  const cancel = interpolate(frame, [62, 68], [0, 1], clamp);
  const cap = [useIn(76), useIn(84), useIn(92)];
  const foot = interpolate(frame, [100, 116], [0, 1], clamp);
  return (
    <>
      <Sfx src={SFX.swell} at={0} volume={0.22} />
      <Sfx src={SFX.whoosh} at={6} volume={0.18} />
      <Sfx src={SFX.whoosh} at={20} volume={0.15} />
      <Sfx src={SFX.pop} at={64} volume={0.3} />
      <AlbumPage>
        <PageHead kicker="N12 · แสตมป์ที่ระลึก" right="ชุดที่ระลึก · แผ่นที่ ๑๗" k={head} />
        <Stamp id="n12big" cx={390} cy={536} w={SW} h={SH} rot={-1.6} k={big}>
          <MainFace t={frame} />
        </Stamp>
        <Stamp id="n12map" cx={880} cy={352} w={MW} h={MH} rot={3} k={small} from={[260, 60]} tilt={10}>
          <MapFace />
        </Stamp>
        <Label id="n12soon" cx={878} cy={652} w={270} h={150} rot={-2.5} k={label} lines={["คลิปใหม่", "เร็ว ๆ นี้"]} />
        <Mount cx={392} y={176} w={700} rot={-1.6} k={mounts} />
        <Mount cx={880} y={182} w={330} h={48} rot={3} k={mounts} />
        <Postmark cx={676} cy={858} r={98} rot={-9} k={cancel} ring="ครบรอบยุทธนาวีเกาะช้าง ✦ ตราด ✦ ครบรอบยุทธนาวีเกาะช้าง ✦" date="๑๗ ม.ค." year="ที่ระลึก" waveLen={290} />
        <Caption x={70} y={1000} date="๑๗ มกราคม · ครบรอบ" lines={["ยุทธนาวีเกาะช้าง"]} ask="จบลงยังไง?" sub="ไทย–ฝรั่งเศส · พ.ศ. ๒๔๘๔" k={cap} />
        <Footer brand={["ประวัติศาสตร์", "บนแผนที่"]} k={foot} credit="ภาพประกอบวาดด้วยโค้ด ไม่ใช่แสตมป์จริง · แผนที่ Natural Earth · เส้นเขตแดนปัจจุบัน ใช้แทนเขตแดนเดิมโดยประมาณ" />
      </AlbumPage>
    </>
  );
};
