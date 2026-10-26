import { loadFont } from "@remotion/google-fonts/Sriracha";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Accordion, C, Chedi, clamp, Cloth, Deva, Flames, InkLines, KhoiDefs, Lotus, Monk, Offerer, Rocks, Rules, Sprigs } from "./kit/Khoi";

// N14 samut khoi: the Phra Malai legend in a white folding book. The accordion opens leaf by leaf on indigo cotton;
// each leaf swings open on its fold, then its ink lines write themselves; paintings are polychrome with ink
// outlines. Story (retold, not copied): the monk Phra Malai receives eight lotuses from a poor man and offers them
// at the Chulamani chedi in Tavatimsa heaven, where the devas gather. 15 s.
export const demo: StyleDemo = { id: "N14", name: "สมุดข่อย", frames: 450, cover: 420, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;
const W = 1080;
const H = 1920;
const PW = 940;
const OPEN = [14, 72, 170, 268];
const SPRIGS: [number, number][] = [[60, 70], [140, 50], [250, 80], [400, 60], [430, 150], [70, 190], [380, 230], [220, 140]];

export const Demo = () => {
  const frame = useCurrentFrame();
  const op = (i: number) => interpolate(frame, [OPEN[i], OPEN[i] + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const ink = (a: number, b: number) => interpolate(frame, [a, b], [0, 1], clamp);
  const push = interpolate(frame, [0, demo.frames], [1, 1.04], clamp);
  const breathe = Math.sin(frame * 0.08) * 3;
  const opened = OPEN.filter((f) => frame >= f + 15).length;
  const lift = interpolate(frame, [110, 150], [0, 16], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const glow = 0.5 + 0.5 * Math.sin(frame * 0.1);

  const leaves = [
    {
      h: 230,
      open: op(0),
      content: (
        <g>
          <Rules w={PW} h={230} />
          <rect x={40} y={36} width={860} height={158} fill={C.red} stroke={C.ink} strokeWidth={2.4} filter="url(#n14-paint)" />
          <Sprigs pts={[[70, 60], [120, 170], [200, 80], [740, 70], [820, 168], [870, 90], [230, 160], [700, 150]]} color="#f7e2b0" />
          <Flames x={260} y={66} w={420} n={14} />
          <Flames x={260} y={164} w={420} n={14} up={false} />
          <rect x={260} y={66} width={420} height={98} rx={14} fill="#f2d27a" stroke={C.ink} strokeWidth={2.4} filter="url(#n14-paint)" />
          <rect x={272} y={76} width={396} height={78} rx={10} fill="none" stroke={C.red} strokeWidth={2} />
          <text x={470} y={138} textAnchor="middle" fontFamily={font} fontSize={64} fill={C.ink}>พระมาลัย</text>
          <Lotus x={150} y={140} s={1.4} />
          <Lotus x={790} y={140} s={1.4} />
        </g>
      ),
    },
    {
      h: 360,
      open: op(1),
      content: (
        <g>
          <Rules w={PW} h={360} />
          <rect x={40} y={38} width={440} height={284} fill={C.red} stroke={C.ink} strokeWidth={2.4} filter="url(#n14-paint)" />
          <rect x={48} y={46} width={424} height={268} fill="none" stroke={C.ochre} strokeWidth={2} />
          <Sprigs pts={SPRIGS} />
          <Rocks x={380} y={268} s={0.9} />
          <path d="M60,300 C120,280 200,296 260,300 C320,304 400,290 470,300 L470,314 L60,314Z" fill={C.green} stroke={C.ink} strokeWidth={2} />
          <Monk x={170} y={300} s={1.05} sway={breathe} />
          <Offerer x={330} y={304} s={1.35} lift={lift} />
          <InkLines x={520} y={110} lines={["ครั้งหนึ่ง พระมาลัยเถระ", "ออกบิณฑบาตยามเช้า", "ชายเข็ญใจผู้หนึ่ง", "ถวายดอกบัวแปดดอก"]} size={42} lead={62} k={ink(96, 160)} font={font} id="p2" />
        </g>
      ),
    },
    {
      h: 360,
      open: op(2),
      content: (
        <g>
          <Rules w={PW} h={360} />
          <InkLines x={60} y={110} lines={["พระเถระเหาะขึ้นไป", "สวรรค์ชั้นดาวดึงส์", "นำดอกบัวนั้นบูชา", "พระจุฬามณีเจดีย์"]} size={42} lead={62} k={ink(196, 258)} font={font} id="p3" />
          <rect x={470} y={38} width={430} height={284} fill="#2e5a3c" stroke={C.ink} strokeWidth={2.4} filter="url(#n14-paint)" />
          <rect x={478} y={46} width={414} height={268} fill="none" stroke={C.ochre} strokeWidth={2} />
          <Sprigs pts={[[500, 80], [560, 150], [860, 70], [830, 160], [520, 220], [870, 240]]} color="#f2d27a" />
          <Chedi x={690} y={300} s={1.12} glow={glow} />
          <Deva x={540} y={306} s={0.8} skin="#7fb08a" bob={breathe * 0.6} />
          <g transform="translate(1380,0) scale(-1,1)">
            <Deva x={540} y={306} s={0.8} robe={C.blue} bob={-breathe * 0.6} />
          </g>
          <Lotus x={610} y={268} s={0.8} />
          <Lotus x={770} y={268} s={0.8} />
        </g>
      ),
    },
    {
      h: 330,
      open: op(3),
      content: (
        <g>
          <Rules w={PW} h={330} />
          <rect x={40} y={38} width={860} height={200} fill={C.blue} stroke={C.ink} strokeWidth={2.4} filter="url(#n14-paint)" />
          <rect x={48} y={46} width={844} height={184} fill="none" stroke={C.ochre} strokeWidth={2} />
          <Sprigs pts={[[90, 80], [300, 64], [470, 90], [640, 70], [850, 84], [200, 120], [740, 130]]} color="#f2d27a" />
          {[150, 310, 630, 790].map((x, i) => (
            <g key={x} transform={i >= 2 ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
              <Deva x={x} y={226} s={0.85} skin={i === 1 ? "#7fb08a" : C.skin} robe={i % 2 ? C.red : C.green} bob={Math.sin(frame * 0.08 + i) * 3} />
            </g>
          ))}
          <Lotus x={470} y={168} s={1.3} />
          <Flames x={40} y={238} w={860} n={30} up={false} color={C.red} />
          <InkLines x={270} y={310} lines={["ทวยเทพมาชุมนุมสาธุการ"]} size={40} lead={60} k={ink(300, 345)} font={font} id="p4" />
        </g>
      ),
    },
  ];
  return (
    <AbsoluteFill style={{ background: C.cloth }}>
      <Hit id="gong" at={8} volume={0.22} />
      {OPEN.map((f) => <Sfx key={f} src={SFX.whoosh} at={f} volume={0.18} />)}
      {[100, 200, 300].map((f) => <Sfx key={f} src={SFX.tick} at={f} volume={0.15} />)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <KhoiDefs />
        <Cloth w={W} h={H} />
        <g transform={`translate(556,1010) rotate(-14) scale(${push * 0.92}) translate(-540,-1000)`}>
          <Accordion x0={96} y0={450} w={PW} leaves={leaves} left={14 - opened * 3} />
        </g>
      </svg>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: font, color: "#5a1a10", opacity: ink(4, 24) }}>
        <div style={{ fontSize: 38, color: "#8a2a1e" }}>N14 · สมุดข่อย</div>
        <div style={{ fontSize: 66, lineHeight: 1.25, textShadow: "0 2px 0 #f6d77a" }}>ดอกบัวแปดดอกของพระมาลัย</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 70, display: "flex", justifyContent: "space-between", fontFamily: font, fontSize: 27, color: "#5a1a10", opacity: 0.85 * ink(30, 50) }}>
        <span>ภาพประกอบ · วาดใหม่ ไม่ใช่สมุดข่อยจริง</span>
        <span>ตำนานพระมาลัย</span>
      </div>
    </AbsoluteFill>
  );
};
