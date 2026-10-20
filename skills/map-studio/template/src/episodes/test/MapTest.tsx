import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { camAt, camForFeature, globeCam, type CamKey } from "../../components/camera";
import { country, places } from "../../components/data";
import { AreaLabel, PointLabel } from "../../components/Labels";
import { Countries, Fill, Graticule, MapFrame, Sphere } from "../../components/Map";
import { Credit, TearCalendar, Title } from "../../components/Overlays";
import { ReasonChips } from "../../components/Reasons";
import { DistanceHud, Route } from "../../components/Route";
import { style } from "../../components/style";

// 9 s toolchain test: globe spin → zoom to Thailand → fill → labels → calendar tear + reason chips → flight to Tokyo.
export const MAP_TEST_FRAMES = 270;

const thailand = country("764");

export const MapTest = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const route = {
    type: "LineString" as const,
    coordinates: [places.bangkok, places.tokyo],
  };
  const keys: CamKey[] = [
    { frame: 0, cam: globeCam(40, 10, width, height) },
    { frame: 45, cam: globeCam(70, 12, width, height) },
    { frame: 110, cam: camForFeature(thailand, width, height, 0.2) },
    { frame: 175, cam: camForFeature(thailand, width, height, 0.2) },
    { frame: 215, cam: camForFeature(route, width, height, 0.18) },
  ];
  const cam = camAt(keys, frame);
  const fill = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: style.bg }}>
      <MapFrame cam={cam}>
        <Sphere />
        <Graticule />
        <Countries />
        <Fill feature={thailand} opacity={fill} />
        <AreaLabel feature={thailand} text="ประเทศไทย" start={118} at={[102.4, 16.3]} />
        <PointLabel at={places.bangkok} text="กรุงเทพฯ" start={132} />
        <Route from={places.bangkok} to={places.tokyo} start={190} end={258} />
        <PointLabel at={places.tokyo} text="โตเกียว" start={250} />
      </MapFrame>
      <Title text="Map Studio" sub="คลิปทดสอบ · วาดด้วยโค้ดทุกเฟรม" start={0} end={70} />
      <TearCalendar
        start={135}
        pages={[
          { frame: 135, day: "20", month: "ตุลาคม", year: "2569" },
          { frame: 185, day: "21", month: "ตุลาคม", year: "2569" },
        ]}
      />
      <ReasonChips
        title="ชุดเครื่องมือ"
        end={190}
        items={[
          { text: "ระบายสีพื้นที่", at: 140 },
          { text: "ป้ายชื่อเมือง", at: 154 },
          { text: "ปฏิทินฉีก", at: 168 },
        ]}
      />
      <DistanceHud from={places.bangkok} to={places.tokyo} start={190} end={258} hours={6} />
      <Credit lines={["Map data: Natural Earth"]} />
    </AbsoluteFill>
  );
};
