import { interpolate } from "remotion";
import { usePopIn } from "../../../components/Figures";
import { InsetPanel, type InsetGeom } from "../../../components/Inset";
import type { Timeline } from "../kit/Frame";
import { at as place } from "../kit/places";
import { CityGate, HanFigure, LOOK, ThroneRoom, WarDrum } from "../kit/Scenes";
import { C, fonts } from "../kit/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// trick: at night the same soldiers sneak out of the gate; on "เช้า" day breaks and they march back in
// with drums and Dong banners, as if new reinforcements had arrived.
const Trick = ({ g, start, dawn }: { g: InsetGeom; start: number; dawn: number }) => {
  const night = g.frame < dawn;
  const day = interpolate(g.frame, [dawn - 6, dawn + 10], [0, 1], clamp);
  const out = (g.frame - start) * 1.8 * g.s;
  const back = Math.min(g.frame - dawn, 150) * 1.6 * g.s;
  const gate = g.x + g.W * 0.72;
  return (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e6c98e" />
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#101a30" opacity={1 - day} />
      {night ? (
        <circle cx={g.x + g.W * 0.15} cy={g.y + 80 * g.s} r={24 * g.s} fill="#efe6c2" />
      ) : (
        <circle cx={g.x + g.W * 0.15} cy={g.y + 130 * g.s - day * 40 * g.s} r={34 * g.s} fill="#f6c25a" opacity={day} />
      )}
      <CityGate x0={g.x + g.W * 0.45} x1={g.x + g.W + 20 * g.s} cx={gate} y={g.ground + 6 * g.s} s={g.s * 1.1} open={1} />
      <rect x={g.x} y={g.ground + 6 * g.s} width={g.W} height={g.H} fill={night ? "#2a2a2e" : "#a88a5c"} />
      {night
        ? [0, 1, 2, 3].map((i) => (
            <HanFigure key={i} x={gate - 20 * g.s - i * 56 * g.s - out} y={g.ground + (24 + (i % 2) * 8) * g.s} scale={g.sc * 0.85} {...LOOK.soldier} robe="#2d3340" shade="#1f242e" pose="crouch" flip phase={i} />
          ))
        : [0, 1, 2, 3, 4].map((i) => (
            <HanFigure key={i} x={g.x + g.W * 0.02 + i * 58 * g.s + back} y={g.ground + (24 + (i % 2) * 8) * g.s} scale={g.sc * 0.85} {...LOOK.soldier} pose="walk" hold={i % 2 ? "flag" : "spear"} flag={{ text: "董", color: "#3d3f5c" }} phase={i} />
          ))}
      {!night && <WarDrum x={g.x + g.W * 0.38} y={g.ground + 26 * g.s} scale={g.sc * 0.9} />}
    </g>
  );
};

// power: officials bow low on both sides while Dong Zhuo walks up to the throne in his boots, sword at his belt.
const Court = ({ g, dong }: { g: InsetGeom; dong: number }) => {
  const d = usePopIn(dong);
  const stride = Math.max(0, Math.min(g.frame - dong, 120)) * 1.3 * g.s;
  const feet = g.ground + 30 * g.s;
  const robes = ["#3d4f6b", "#5a6b4a", "#6b3a2a"];
  return (
    <g>
      <ThroneRoom x={g.cx} y={g.ground + 4 * g.s} w={g.W} h={g.H} s={g.s * 1.1} />
      <rect x={g.x} y={g.ground + 4 * g.s} width={g.W} height={g.H} fill="#4a2a1a" />
      <rect x={g.cx - 60 * g.s} y={g.ground + 4 * g.s} width={120 * g.s} height={g.H} fill="#8a2a20" />
      {[0.06, 0.16, 0.26].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx} y={feet} scale={g.sc * 0.85} {...LOOK.official} robe={robes[i]} pose="bow" phase={i} />
      ))}
      {[0.74, 0.84, 0.94].map((fx, i) => (
        <HanFigure key={fx} x={g.x + g.W * fx} y={feet} scale={g.sc * 0.85} {...LOOK.official} robe={robes[2 - i]} pose="bow" flip phase={i + 3} />
      ))}
      <g opacity={Math.min(1, d)}>
        <HanFigure x={g.x + g.W * 0.32 + stride} y={feet + 4 * g.s} scale={g.sc * 1.1} {...LOOK.dongzhuo} pose={g.frame - dong < 120 ? "walk" : "stand"} phase={6} />
      </g>
    </g>
  );
};

export const Insets = ({ B, word }: Timeline) => (
  <>
    <InsetPanel id="trick" anchor={place("luoyang")} label="ภาพประกอบ" start={B.trick.start} end={Math.round(B.fear.start + B.fear.len * 0.55)} sky={["#e6c98e", "#e6c98e"]} font={fonts.body} accent={C.wu}>
      {(g) => <Trick g={g} start={B.trick.start} dawn={word("trick", "เช้า")} />}
    </InsetPanel>
    <InsetPanel id="court" anchor={place("luoyang")} label="ภาพประกอบ" start={B.power.start} end={B.cliff.start + 6} sky={["#6e2a1f", "#6e2a1f"]} font={fonts.body} accent={C.wu}>
      {(g) => <Court g={g} dong={word("power", "ตั๋ง")} />}
    </InsetPanel>
  </>
);
