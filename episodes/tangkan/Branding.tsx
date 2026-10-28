// Page branding for ต่างกันยังไง: cover 1640×624 and profile picture 1080×1080, in the same voxel lobby as the episodes.
// Facebook crops the cover on phones to the middle ~1000 px and the profile to a circle: everything that matters sits inside.
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { KANIT } from "./kit/hud";
import { Elevator, ELEV, Gas, Room } from "./kit/lobby";
import { Post } from "./kit/post";
import { CatVox, DOORMAN, PersonVox, PlantVox } from "./kit/voxel";

type V3 = [number, number, number];
const BLUE = "#1d3f9a";
const RED = "#c8202c";

const Cam = ({ pos, look, fov }: { pos: V3; look: V3; fov: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.fov = fov;
    c.lookAt(...look);
    c.updateProjectionMatrix();
  });
  return null;
};

const Lights = () => (
  <>
    <ambientLight intensity={0.35} color="#ffe8cc" />
    <hemisphereLight args={["#fff1d6", "#6a4a32", 0.55]} />
    <directionalLight position={[-2.5, 5, 4]} intensity={1.6} color="#fff0d8" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0005} />
  </>
);

const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: false, preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }} camera={{ fov: 40, position: [0, 1.5, 4] }}>
      {children}
    </ThreeCanvas>
  );
};

// Cover: the doorman presents the title with the house gesture (ผายมือ), the cat on the other side looks shocked,
// a small green puff behind the cat says what kind of comparisons this page makes.
export const TangkanPageCover = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Canvas>
      <Cam pos={[0, 1.45, 3.6]} look={[0, 1.4, -1.0]} fov={34} />
      <color attach="background" args={["#1a1410"]} />
      <Lights />
      <Room />
      <Elevator x={ELEV.left} open={0} sign={null} />
      <Elevator x={ELEV.right} open={0.25} sign={null} />
      <group position={[-2.5, 0, -2.4]}>
        <PlantVox />
      </group>
      <group position={[2.5, 0, -2.4]}>
        <PlantVox wilt={0.7} />
      </group>
      <group position={[-1.25, 0, -1.0]} rotation={[0, 0.25, 0]}>
        <PersonVox who={DOORMAN} armR={100} pal={{ m: "#5a1a1a" }} />
      </group>
      <group position={[1.2, 0, -0.9]} rotation={[0, -0.25, 0]}>
        <CatVox shock />
      </group>
      <Gas t={40} origin={[1.45, 0.45, -1.15]} count={22} spread={0.55} drift={[0.3, 0.3, -0.2]} hold opacity={0.4} seedN={3} />
      <Post focus={[0, 1.1, -1.0]} range={3.2} bokeh={2.4} />
    </Canvas>
    <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: KANIT }}>
      <div style={{ background: BLUE, border: "8px solid #f4f4f4", outline: `6px solid ${BLUE}`, borderRadius: 10, padding: "0 40px 8px", boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>ต่างกันยังไง?</div>
      </div>
      <div style={{ position: "absolute", top: 530, fontSize: 34, fontWeight: 700, color: "#fff", background: RED, borderRadius: 14, padding: "6px 30px 10px", boxShadow: "0 6px 0 #7a0f17" }}>
        เปรียบเทียบคำที่คนสับสน · แบบจริงจังเกินเหตุ
      </div>
    </div>
  </AbsoluteFill>
);

// Profile: the doorman's head and shoulders on the sign blue, no text (reads at 40 px in a circle).
export const TangkanPageProfile = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #2f5ccc 0%, ${BLUE} 55%, #0f2260 100%)` }}>
    <Canvas>
      <Cam pos={[0, 1.45, 2.15]} look={[0, 1.4, -1]} fov={40} />
      <ambientLight intensity={0.55} color="#ffe8cc" />
      <hemisphereLight args={["#fff1d6", "#20306a", 0.6]} />
      <directionalLight position={[-2, 3, 4]} intensity={1.9} color="#fff0d8" />
      <directionalLight position={[3, 2, -2]} intensity={1.2} color="#9fb8ff" />
      <group position={[0, 0, 0]}>
        <PersonVox who={DOORMAN} pal={{ m: "#5a1a1a" }} />
      </group>
    </Canvas>
  </AbsoluteFill>
);
