// Style frames for the old-Siam short (gate 2): the painted backgrounds with our cast on them. Frame 0 = the city at
// dusk, 1 = the drum tower (cat + mouse), 2 = the kitchen (fish drying, cat eyeing a fish).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { NaiMan, Cat, Mouse, Fish, Cowrie } from "./cast";

const Bg: React.FC<{ name: string }> = ({ name }) => (
  <Img src={staticFile(`oldsiam/bg/${name}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);
const Label: React.FC = () => (
  <div style={{ position: "absolute", right: 36, top: 40, padding: "6px 16px", borderRadius: 10, background: "rgba(20,14,10,0.45)",
    color: "#f6ecd8", fontFamily: "Sarabun, Tahoma, sans-serif", fontSize: 30 }}>ภาพประกอบ</div>
);
const shadow = (x: number, y: number, rx: number) => <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.18} fill="#2a1a12" opacity={0.28} />;

export const OldSiamStyle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2a1d16" }}>
      <Bg name={["city", "tower", "kitchen"][f % 3]} />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {f % 3 === 0 && <g>{shadow(640, 1690, 150)}<NaiMan x={640} y={1700} h={760} mouth="smile" look={-1} brows={0.5} armR={14} /></g>}
        {f % 3 === 1 && <g>
          {shadow(300, 1712, 120)}<Cat x={300} y={1715} h={300} look={1} tail={0.5} />
          {shadow(640, 1708, 60)}<Mouse x={640} y={1710} h={70} flip />
          <NaiMan x={830} y={1760} h={640} mouth="o" brows={-0.6} look={-1} armL={30} elbowL={60} />
          <Cowrie x={760} y={1580} w={70} rot={-20} />
        </g>}
        {f % 3 === 2 && <g>
          {shadow(360, 1760, 140)}<NaiMan x={360} y={1770} h={700} mouth="grin" brows={0.6} armR={70} elbowR={-40} hold={<Fish x={0} y={-10} w={170} rot={-20} dried />} />
          {shadow(800, 1740, 110)}<Cat x={800} y={1745} h={270} flip look={-1} tail={-0.6} mouth="open" />
        </g>}
      </svg>
      <Label />
    </AbsoluteFill>
  );
};
