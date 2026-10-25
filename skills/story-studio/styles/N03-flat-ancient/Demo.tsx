import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Column, Elephant, Mountain, Palmette, Senator, Standard, Warrior } from "./kit/Figures";
import { C, clamp, Label, Line, On, Pot, Titles, useVase } from "./kit/Vase";

// N03 red-figure vase: Hannibal told round the belly of one black-glazed pot. Clay figures with fine black lines,
// a key border above and below, the scenes side by side round the pot; the pot turns slowly while each scene is
// told and swings round to the next. The Alps with the elephants, the Roman line broken at Cannae, the Senate in
// alarm. 15 s.
export const demo: StyleDemo = { id: "N03", name: "ภาพเขียนแดงบนไห", frames: 450, cover: 236, sizes: ["9x16", "16x9"] };

const CLASH = [200, 232, 264];
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

export const Demo = () => {
  const frame = useCurrentFrame();
  // the turn of the pot (px along the circumference): slow drift inside a scene, a swing between scenes
  const rot = interpolate(frame, [0, 148, 170, 298, 320, 450], [-170, 150, 1360, 1640, 2840, 3150], ease);
  const knock = CLASH.reduce((k, c) => k + (frame >= c && frame < c + 10 ? Math.sin(((frame - c) / 10) * Math.PI * 2) * (1 - (frame - c) / 10) * 8 : 0), 0);
  const z = useVase(rot + knock);
  const y = z.bot - 8;
  const fall = interpolate(frame, [250, 272], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const alarm = interpolate(frame, [330, 352], [0, 1], ease);

  return (
    <AbsoluteFill style={{ background: C.glaze }}>
      <Sfx src={SFX.swell} at={0} volume={0.3} />
      <Bed id="wind_storm" from={0} to={160} volume={0.2} />
      <Hit id="elephant" at={40} volume={0.3} />
      <Hit id="war_horn" at={160} volume={0.3} />
      <Bed id="sword_battle" from={176} to={300} volume={0.18} />
      {CLASH.map((c) => <Hit key={c} id="sword_clash" at={c} volume={0.3} />)}
      <Hit id="crowd_panic" at={330} volume={0.25} />

      <Pot z={z}>
        {/* A — 218 BC: over the Alps */}
        <On z={z} u={-20} y={y - 250} s={3.2}><Mountain w={260} h={120} peaks={4} /></On>
        <On z={z} u={-430} y={y} s={5.4}><Warrior cloak pose="walk" device="scorpion" /></On>
        <On z={z} u={-300} y={y} s={5.4}><Warrior cloak pose="walk" device="eye" /></On>
        <On z={z} u={20} y={y} s={4.3}><Elephant snow={1} /></On>
        <On z={z} u={420} y={y} s={5.4}><Warrior cloak pose="walk" device="star" /></On>
        <On z={z} u={760} y={y - 300} s={5.4}><Palmette /></On>

        {/* B — 216 BC: Cannae, the Roman line breaks */}
        <On z={z} u={1110} y={y} s={7.4}><Warrior shield="scutum" pose="stand" /></On>
        <On z={z} u={1260} y={y} s={7.4}><Warrior shield="scutum" pose="walk" /></On>
        <On z={z} u={1430} y={y - 10} s={5.6}><Standard fall={fall} /></On>
        <On z={z} u={1480} y={y} s={6}><Warrior shield="scutum" pose="fallen" /></On>
        <On z={z} u={1620} y={y} s={7.4} flip><Warrior pose="charge" device="scorpion" /></On>
        <On z={z} u={1765} y={y} s={7.4} flip><Warrior pose="charge" device="star" /></On>
        <On z={z} u={1910} y={y} s={7.4} flip><Warrior pose="walk" device="eye" /></On>
        <On z={z} u={2250} y={y - 300} s={5.4}><Palmette /></On>

        {/* C — Rome: the Senate in alarm */}
        <On z={z} u={2700} y={y} s={6.8}><Column /></On>
        <On z={z} u={2870} y={y} s={5.8}><Senator alarm={alarm} /></On>
        <On z={z} u={3010} y={y} s={5.8} flip><Senator alarm={alarm * 0.6} /></On>
        <On z={z} u={3150} y={y} s={5.8}><Senator alarm={alarm} /></On>
        <On z={z} u={3320} y={y} s={6.8}><Column /></On>
      </Pot>

      <Titles
        z={z}
        heads={[
          { f: 0, tag: "218 ปีก่อน ค.ศ.", head: "ข้ามเทือกเขาแอลป์", stat: "37", label: "ช้างศึก" },
          { f: 160, tag: "แคนเน · 216 ปีก่อน ค.ศ.", head: "โรมแตกในวันเดียว", stat: "50,000", label: "ทหารโรมัน" },
          { f: 310, tag: "กรุงโรม", head: "สภาโรมันแตกตื่น" },
        ]}
      />
      <Line z={z} text="ฮันนิบาลพาช้างข้ามภูเขาหิมะ" start={8} end={156} />
      <Line z={z} text="ทัพโรมันถูกล้อมจนแตกทั้งแนว" start={162} end={306} />
      <Line z={z} text="ข่าวมาถึงโรม ทั้งเมืองตื่นตระหนก" start={312} end={450} />
      <Label z={z} />
    </AbsoluteFill>
  );
};
