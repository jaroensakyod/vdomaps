import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { country } from "../../../components/data";
import { MapFrame, useMap } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { font, GOLD, RED } from "../news/kit";

// Episode 5 cover 1080×1920 (9:16): the same map and portrait as the Piyamaharaj Day post, with the episode question.
// Siam squeezed between British Burma/Malaya and French Indochina; modern borders ≈ the 1909 ones.

const BRITISH = ["104", "458", "702"]; // Myanmar, Malaysia, Singapore
const FRENCH = ["418", "116", "704"]; // Laos, Cambodia, Vietnam
const BLUE = "#3d8bff";

const Areas = () => {
  const { path, s, projection } = useMap();
  const label = (at: [number, number], text: string, color: string, size: number) => {
    const p = projection(at)!;
    return (
      <text x={p[0]} y={p[1]} textAnchor="middle" fill="#fff" fontFamily={font} fontWeight={900} fontSize={size * s}
        stroke={color} strokeWidth={10 * s} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    );
  };
  const bkk = projection([100.5, 13.75])!;
  return (
    <g>
      {BRITISH.map((id) => <path key={id} d={path(country(id)) ?? ""} fill={RED} fillOpacity={0.42} stroke={RED} strokeWidth={3 * s} strokeLinejoin="round" />)}
      {FRENCH.map((id) => <path key={id} d={path(country(id)) ?? ""} fill={BLUE} fillOpacity={0.42} stroke={BLUE} strokeWidth={3 * s} strokeLinejoin="round" />)}
      <path d={path(country("764")) ?? ""} fill="none" stroke={GOLD} strokeWidth={22 * s} strokeOpacity={0.35} style={{ filter: `blur(${10 * s}px)` }} />
      <path d={path(country("764")) ?? ""} fill={GOLD} fillOpacity={0.22} stroke={GOLD} strokeWidth={5 * s} strokeLinejoin="round" />
      <circle cx={bkk[0]} cy={bkk[1]} r={36 * s} fill="none" stroke={GOLD} strokeWidth={4 * s} opacity={0.6} />
      <circle cx={bkk[0]} cy={bkk[1]} r={14 * s} fill={GOLD} stroke="#fff" strokeWidth={4 * s} />
      {label([96.0, 18.0], "อังกฤษ", RED, 46)}
      {label([101.9, 5.0], "อังกฤษ", RED, 40)}
      {label([104.6, 17.2], "ฝรั่งเศส", BLUE, 46)}
      {label([104.9, 12.6], "ฝรั่งเศส", BLUE, 40)}
      {label([100.6, 16.1], "สยาม", "#8a5a00", 64)}
    </g>
  );
};

export const Ep05Cover = () => {
  const { width, height } = useVideoConfig();
  const s = width / 1080;
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={{ lon: 100.8, lat: 13.0, scale: 3000 }} focusY={0.66}>
        <Raster layers={[{ name: "sea2" }]} />
        <rect width={width} height={height} fill="#06112b" opacity={0.4} />
        <Areas />
      </MapFrame>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,6,13,0.97) 0%, rgba(2,6,13,0.9) 22%, rgba(2,6,13,0) 36%, rgba(2,6,13,0) 88%, rgba(2,6,13,0.95) 100%)" }} />
      {/* Royal portrait in an arched gold frame, top right beside the headline. */}
      <div style={{ position: "absolute", right: 44 * s, top: 70 * s, width: 380 * s, height: 490 * s, borderRadius: `${190 * s}px ${190 * s}px ${18 * s}px ${18 * s}px`, border: `${7 * s}px solid ${GOLD}`, overflow: "hidden", boxShadow: `0 0 ${50 * s}px rgba(255,201,74,0.45), 0 ${14 * s}px ${40 * s}px rgba(0,0,0,0.7)` }}>
        <Img src={staticFile("portraits/piya/rama5.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%", filter: "sepia(0.35) contrast(1.05)" }} />
      </div>
      <div style={{ position: "absolute", right: 44 * s, top: 550 * s, width: 380 * s, textAlign: "center", fontFamily: font, fontSize: 22 * s, fontWeight: 700, color: GOLD, lineHeight: 1.3, textShadow: "0 3px 10px rgba(0,0,0,0.9)" }}>
        พระบาทสมเด็จ<br />พระจุลจอมเกล้าเจ้าอยู่หัว
      </div>
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, top: 80 * s, fontFamily: font, color: "#fff", lineHeight: 1.3, textShadow: "0 6px 24px rgba(0,0,0,0.8)" }}>
        <div style={{ display: "inline-block", background: RED, borderRadius: 14 * s, padding: `${4 * s}px ${24 * s}px`, fontSize: 38 * s, fontWeight: 700 }}>EP.5 · วันปิยมหาราช</div>
        <div style={{ fontSize: 86 * s, fontWeight: 900, marginTop: 16 * s, lineHeight: 1.2 }}>
          ทำไม<span style={{ color: GOLD }}>สยาม</span><br />ไม่เป็น<span style={{ color: "#ff6b5f" }}>เมืองขึ้น?</span>
        </div>
        <div style={{ fontSize: 38 * s, fontWeight: 700, opacity: 0.92, marginTop: 14 * s }}>รัชกาลที่ 5 · พ.ศ. 2411–2453</div>
      </div>
      <div style={{ position: "absolute", left: 60 * s, right: 60 * s, bottom: 90 * s, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font, color: "#fff", lineHeight: 1.3 }}>
        <div style={{ background: GOLD, color: "#1a1200", borderRadius: 12 * s, padding: `${4 * s}px ${22 * s}px`, fontSize: 40 * s, fontWeight: 900 }}>ต้องแลกกับอะไร?</div>
        <div style={{ fontSize: 32 * s, fontWeight: 900 }}>ประวัติศาสตร์<span style={{ color: GOLD }}>บนแผนที่</span></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 30 * s, textAlign: "center", fontFamily: font, fontSize: 17 * s, color: "rgba(255,255,255,0.55)" }}>
        พระบรมฉายาลักษณ์: Wikimedia Commons (สาธารณสมบัติ) · ภาพดาวเทียม NASA Blue Marble · เส้นเขตแดนโดยประมาณ ปลายรัชกาล
      </div>
    </AbsoluteFill>
  );
};
