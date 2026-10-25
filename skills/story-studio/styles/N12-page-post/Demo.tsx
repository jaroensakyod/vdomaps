import { interpolate, useCurrentFrame } from "remotion";
import { Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Areas, ArchFrame, BLUE, clamp, font, Footer, GOLD, Headline, Hero, MapLabel, PostCard, PostMap, RED, Spot, usePostBox } from "./kit/Post";

// N12 page post: a 4:5 anniversary post announcing the next clip (ยุทธนาวีเกาะช้าง, 17 ม.ค. 2484). Dark Blue
// Marble map with the two sides coloured, a red date badge, headline with the question in gold, an arched gold
// frame (here a code-drawn warship at dusk; pass `photo` for the page's own picture), gold chip + page name.
// The 4:5 card is drawn centred in the 9:16 frame (4:5 is not a template StyleSize). 10 s.
export const demo: StyleDemo = { id: "N12", name: "โพสต์เพจและปก 4:5", frames: 300, cover: 200, sizes: ["4x5"] };

const FRENCH = ["418", "116", "704"]; // Laos, Cambodia, Vietnam (French Indochina)
const KOCHANG: [number, number] = [102.35, 12.05];

// Code-drawn picture for the arch: a 1940s coastal-defence ship at dusk, smoke drifting, splashes around it.
const Warship = ({ t }: { t: number }) => {
  const bob = Math.sin(t * 0.08) * 3;
  const hull = "#0c0a10";
  return (
    <g>
      <defs>
        <linearGradient id="n12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2350" />
          <stop offset="0.55" stopColor="#c2563a" />
          <stop offset="0.8" stopColor="#ffb35c" />
        </linearGradient>
        <linearGradient id="n12sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a3a" />
          <stop offset="1" stopColor="#0a0f1e" />
        </linearGradient>
        <radialGradient id="n12sun">
          <stop offset="0" stopColor="#fff4c8" />
          <stop offset="0.4" stopColor="#ffc94a" stopOpacity={0.8} />
          <stop offset="1" stopColor="#ffc94a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={330} height={300} fill="url(#n12sky)" />
      <circle cx={210} cy={250} r={90} fill="url(#n12sun)" />
      <circle cx={210} cy={256} r={26} fill="#ffe7a0" />
      {/* far island */}
      <path d="M0 270 Q40 238 90 252 Q120 226 160 262 L160 280 L0 280 Z" fill="#2a1c2e" opacity={0.85} />
      <rect y={272} width={330} height={150} fill="url(#n12sea)" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={150 + Math.sin(i * 2.3 + t * 0.05) * 40} y={284 + i * 9} width={120 - i * 8} height={2.5} fill="#ffc94a" opacity={0.5 - i * 0.04} />)}
      {/* smoke from the funnel */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = ((t * 0.6 + i * 18) % 108) / 108;
        return <circle key={i} cx={150 - a * 120} cy={192 - a * 60 + bob} r={10 + a * 26} fill="#2a2430" opacity={0.55 * (1 - a)} />;
      })}
      <g transform={`translate(0,${bob})`}>
        {/* hull */}
        <path d="M18 286 L40 306 L300 306 L318 280 L240 284 L60 284 Z" fill={hull} />
        {/* superstructure, bridge, funnel, mast */}
        <path d="M110 284 L110 262 L130 262 L130 244 L170 244 L170 262 L205 262 L205 284 Z" fill={hull} />
        <rect x={140} y={206} width={16} height={40} fill={hull} />
        <rect x={137} y={204} width={22} height={6} fill={hull} />
        <rect x={177} y={180} width={4} height={66} fill={hull} />
        <rect x={166} y={196} width={26} height={3} fill={hull} />
        <path d="M179 180 L240 284" stroke={hull} strokeWidth={1.5} />
        <path d="M179 180 L70 284" stroke={hull} strokeWidth={1.5} />
        {/* turrets fore and aft with guns */}
        <path d="M62 284 Q62 266 84 266 Q100 266 100 284 Z" fill={hull} />
        <rect x={20} y={270} width={48} height={5} fill={hull} />
        <path d="M222 284 Q222 266 244 266 Q260 266 260 284 Z" fill={hull} />
        <rect x={256} y={270} width={50} height={5} fill={hull} />
        {/* lit portholes */}
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={70 + i * 26} cy={294} r={2} fill="#ffc94a" opacity={0.85} />)}
      </g>
      {/* shell splashes */}
      {[[60, 0], [270, 40]].map(([x, d]) => {
        const a = ((t + d) % 80) / 80;
        return <path key={x} d={`M${x - 8} 300 Q${x} ${300 - 60 * Math.sin(a * Math.PI)} ${x + 8} 300 Z`} fill="#e9eef8" opacity={0.75 * Math.sin(a * Math.PI)} />;
      })}
    </g>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const { top, s } = usePostBox();
  const push = interpolate(frame, [0, demo.frames], [2450, 2560], clamp);
  const pulse = (frame % 60) / 60;
  const glow = 0.75 + 0.25 * Math.sin(frame * 0.08);
  const lab = interpolate(frame, [40, 60], [0, 1], clamp);
  return (
    <>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Sfx src={SFX.pop} at={8} volume={0.25} />
      <Sfx src={SFX.whoosh} at={18} volume={0.25} />
      <Sfx src={SFX.pop} at={42} volume={0.25} />
      <PostCard
        background={
          <PostMap cam={{ lon: 101.6, lat: 13.6, scale: push }} focusY={0.66}>
            <Areas ids={FRENCH} color={BLUE} />
            <Hero id="764" glow={glow} />
            <Spot at={KOCHANG} pulse={pulse} />
            <MapLabel at={[104.3, 19.4]} text="อินโดจีนฝรั่งเศส" color={BLUE} size={40} k={lab} />
            <MapLabel at={[105.1, 12.9]} text="ฝรั่งเศส" color={BLUE} size={40} k={lab} />
            <MapLabel at={[100.4, 15.5]} text="ไทย" color="#8a5a00" size={64} k={lab} />
            <MapLabel at={[102.6, 11.3]} text="เกาะช้าง" color={RED} size={38} k={lab} />
          </PostMap>
        }
      >
        <ArchFrame caption={<>ภาพประกอบ<br />เรือรบหลวงยุค 2480</>}>
          <Warship t={frame} />
        </ArchFrame>
        <Headline badge="17 มกราคม · ครบรอบ" lines={["ยุทธนาวี", "เกาะช้าง"]} ask="จบลงยังไง?" sub="ไทย–ฝรั่งเศส · พ.ศ. 2484" />
        <Footer chip="คลิปใหม่ เร็ว ๆ นี้" brand={["ประวัติศาสตร์", "บนแผนที่"]} credit="ภาพดาวเทียม NASA Blue Marble · เส้นเขตแดนปัจจุบัน ใช้แทนเขตแดนเดิมโดยประมาณ · ภาพเรือวาดประกอบ" />
      </PostCard>
      {/* kicker in the band above the 4:5 card (only in the 9:16 demo) */}
      {top > 60 * s && (
        <div style={{ position: "absolute", top: top / 2 - 30 * s, left: 0, right: 0, textAlign: "center", fontFamily: font, color: GOLD, fontSize: 40 * s, fontWeight: 700, opacity: 0.85 }}>N12 · โพสต์เพจและปก 4:5</div>
      )}
    </>
  );
};
