import { AbsoluteFill, useVideoConfig } from "remotion";
import { globeCam } from "../../components/camera";
import { countries } from "../../components/data";
import { MapFrame, Sphere, useMap } from "../../components/Map";
import { Raster } from "../../components/Raster";
import { style } from "../../components/style";
import { STORIES } from "./stories";

// Facebook page branding for แผนที่ข่าวโลก: cover 1640×624 and profile picture 1080×1080 (shown as a circle).
const RED = "#ff3b30";

const Pins = ({ size = 1 }: { size?: number }) => {
  const { projection, cam, s } = useMap();
  return (
    <g>
      {STORIES.flatMap((st) => st.pins.slice(0, 1)).map((p) => {
        const dLon = ((p.at[0] - cam.lon + 540) % 360) - 180;
        if (Math.abs(dLon) > 80) return null;
        const xy = projection(p.at);
        if (!xy) return null;
        return (
          <g key={p.label} transform={`translate(${xy[0]},${xy[1]})`}>
            <circle r={26 * s * size} fill={RED} opacity={0.25} />
            <circle r={11 * s * size} fill={RED} stroke="#fff" strokeWidth={3.5 * s * size} />
          </g>
        );
      })}
    </g>
  );
};

const Borders = () => {
  const { path, s } = useMap();
  return <path d={path(countries) ?? ""} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={1 * s} />;
};

const Globe = ({ lon, lat, fill, pinSize }: { lon: number; lat: number; fill: number; pinSize?: number }) => {
  const { width, height } = useVideoConfig();
  return (
    <MapFrame cam={globeCam(lon, lat, width, height, fill)}>
      <Sphere />
      <Raster layers={[{ name: "world", opacity: 0.92 }]} />
      <Borders />
      <Pins size={pinSize} />
    </MapFrame>
  );
};

const bg = "radial-gradient(circle at 70% 50%, #10213d 0%, #02060d 65%)";

// Cover: Facebook shows 820×312 on desktop and crops the sides to ~16:9 on phones, so all text stays inside
// the middle ~1100 px; the profile picture covers the bottom-left corner on desktop.
export const PageCover = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: bg }}>
      {/* Globe stays centred (the image layer is clipped to the frame), zoomed so Europe–Asia fill the cover. */}
      <Globe lon={8} lat={24} fill={1.2} pinSize={1.3} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(2,6,13,0.95) 0%, rgba(2,6,13,0.8) 38%, rgba(2,6,13,0.15) 62%, rgba(2,6,13,0) 80%)" }} />
      <div
        style={{
          position: "absolute",
          left: width * 0.2,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: style.font,
          color: "#fff",
          lineHeight: 1.3,
          textShadow: "0 6px 24px rgba(0,0,0,0.75)",
        }}
      >
        <div style={{ display: "inline-flex", alignSelf: "flex-start", background: RED, borderRadius: 14, padding: "4px 26px", fontSize: 92, fontWeight: 900 }}>
          แผนที่ข่าวโลก
        </div>
        <div style={{ fontSize: 50, fontWeight: 900, marginTop: 18 }}>สรุปข่าวใหญ่ทั่วโลก ทุกวัน</div>
        <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.85, marginTop: 6 }}>8 เรื่องใน 24 ชั่วโมง · บนแผนที่ · จบใน 90 วินาที</div>
      </div>
    </AbsoluteFill>
  );
};

// Profile picture: globe filling the circle, red ring, the name on a ribbon across the lower third.
export const PageProfile = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <Globe lon={60} lat={18} fill={0.47} pinSize={1.4} />
      <AbsoluteFill style={{ borderRadius: "50%", boxShadow: `inset 0 0 0 ${width * 0.03}px ${RED}` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: width * 0.17 }}>
        <div
          style={{
            background: RED,
            color: "#fff",
            fontFamily: style.font,
            fontWeight: 900,
            fontSize: width * 0.105,
            lineHeight: 1.35,
            padding: `${width * 0.004}px ${width * 0.045}px`,
            borderRadius: width * 0.02,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          ข่าวโลก
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
