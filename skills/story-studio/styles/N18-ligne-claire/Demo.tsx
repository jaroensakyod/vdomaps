import { loadFont } from "@remotion/google-fonts/Mali";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bed, Hit, Sfx, SFX } from "../../components/Sound";
import type { StyleDemo } from "../types";
import { Balloon, Boat, Coach, K, Loco, Narration, Page, PageDefs, Palm, Panel, Person, Puff, StiltHouse, Water } from "./kit/Comic";

// N18 clean-line comic: a light history anecdote laid out as one adventure-comic page — Siam's first railway, the
// Paknam line (opened 11 April 1893). Panels slide in one by one, balloons pop, the train steams along the canal. 15 s.
export const demo: StyleDemo = { id: "N18", name: "การ์ตูนเส้นใส", frames: 450, cover: 400, sizes: ["9x16"] };

const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const IN = { A: 8, B: 92, C: 150, D: 236 };

const BOY = { shirt: K.white, pants: "#2b5fa8", hat: "straw" as const };
const MUM = { shirt: K.red, pants: "#6a3b8e", hat: "bun" as const, hair: "#1d1a18" };
const GUARD = { shirt: "#2b5fa8", pants: "#1f3e70", hat: "cap" as const, capColor: "#1f3e70" };

export const Demo = () => {
  const frame = useCurrentFrame();
  const enter = (at: number) => interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: ease });
  const pop = (at: number) => interpolate(frame, [at, at + 10], [0, 1], clamp);
  const spin = frame * 0.22;
  const trainB = interpolate(frame, [IN.B, 450], [120, 560], clamp);
  const puffs = (x: number, y: number, n: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const age = ((frame * 1.2 + i * (60 / n) + seed) % 60) / 60;
      return <Puff key={i} x={x - age * 170} y={y - age * 120} r={22 + age * 44} k={1 - age * 0.7} />;
    });
  return (
    <AbsoluteFill style={{ background: K.paper }}>
      <Bed id="ship_sailing" from={IN.B} to={450} volume={0.08} />
      {Object.values(IN).map((f) => <Sfx key={f} src={SFX.whoosh} at={f - 4} volume={0.3} />)}
      <Sfx src={SFX.pop} at={IN.A + 34} volume={0.35} />
      <Sfx src={SFX.pop} at={IN.C + 40} volume={0.35} />
      <Hit id="ship_bell" at={IN.A + 30} volume={0.25} />
      <Hit id="whistle_officer" at={IN.B + 30} volume={0.2} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PageDefs />
        <Page />
        {/* title strip */}
        <g opacity={interpolate(frame, [0, 12], [0, 1], clamp)}>
          <text x={540} y={110} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={K.ink} letterSpacing={2}>N18 · การ์ตูนเส้นใส</text>
          <text x={540} y={238} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={112} fill={K.red} stroke={K.ink} strokeWidth={7} paintOrder="stroke" strokeLinejoin="round">รถไฟสายแรก!</text>
          <path d="M150 262 H930" stroke={K.ink} strokeWidth={4} />
          <circle cx={540} cy={262} r={9} fill={K.yellow} stroke={K.ink} strokeWidth={4} />
        </g>

        {/* A: the station */}
        <Panel id="A" x={50} y={292} w={980} h={500} enter={enter(IN.A)} from="left">
          <rect x={50} y={292} width={980} height={500} fill="url(#lc-sky)" />
          {[[240, 380], [760, 360]].map(([cx, cy], i) => <path key={i} d={`M${cx - 70} ${cy} q10 -36 50 -26 q20 -30 56 -6 q40 -6 34 32 Z`} fill={K.white} stroke={K.ink} strokeWidth={4} transform={`translate(${(frame * 0.3 * (i ? -1 : 1)) % 40},0)`} />)}
          {/* station building */}
          <rect x={90} y={500} width={420} height={190} fill={K.cream} stroke={K.ink} strokeWidth={4} />
          <path d="M60 504 L300 410 L540 504 Z" fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
          {[130, 230, 330, 430].map((x) => <rect key={x} x={x} y={560} width={50} height={80} fill={K.wood} stroke={K.ink} strokeWidth={4} />)}
          <rect x={200} y={470} width={200} height={36} fill={K.white} stroke={K.ink} strokeWidth={4} />
          <text x={300} y={498} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={26} fill={K.ink}>สถานีหัวลำโพง</text>
          {/* platform + rails */}
          <rect x={50} y={690} width={980} height={40} fill="#d9c39a" stroke={K.ink} strokeWidth={4} />
          <rect x={50} y={730} width={980} height={70} fill="#8d8a7e" />
          <path d="M50 770 H1030" stroke={K.ink} strokeWidth={5} />
          <g transform={`translate(${interpolate(frame, [IN.A, IN.A + 40], [160, 0], { ...clamp, easing: ease })},0)`}>
            <Coach x={600} y={770} s={0.7} spin={0} faces={2} />
            <Loco x={900} y={770} s={0.7} spin={0} />
            {puffs(960, 600, 3, 0)}
          </g>
          <Person x={190} y={720} s={0.9} look={MUM} phase={0} />
          <Person x={330} y={724} s={1} look={BOY} wave={0.5 + 0.5 * Math.sin(frame * 0.3)} phase={frame * 0.3} mouth="open" />
          <Person x={470} y={722} s={0.95} look={GUARD} flip />
          <Narration x={70} y={312} w={430} lines={["กรุงเทพฯ 11 เมษายน 2436"]} font={font} size={30} k={enter(IN.A + 14)} />
          <Balloon x={560} y={330} w={330} h={110} tx={370} ty={520} lines={["มาแล้ว! รถไฟ!"]} font={font} size={44} k={pop(IN.A + 34)} />
        </Panel>

        {/* B: along the canal */}
        <Panel id="B" x={50} y={814} w={580} h={480} enter={enter(IN.B)} from="left">
          <rect x={50} y={814} width={580} height={480} fill="url(#lc-sky)" />
          <StiltHouse x={190} y={1140} s={0.8} />
          <StiltHouse x={520} y={1150} s={0.7} roof={K.yellow} />
          <Palm x={360} y={1120} s={0.95} sway={Math.sin(frame * 0.05) * 4} />
          <Palm x={90} y={1110} s={0.8} sway={Math.sin(frame * 0.05 + 1) * 4} />
          <rect x={50} y={1106} width={580} height={46} fill="#9ccf6a" stroke={K.ink} strokeWidth={4} />
          <path d="M50 1140 H630" stroke={K.ink} strokeWidth={4} />
          <g>
            <Coach x={trainB - 250} y={1144} s={0.55} spin={spin} />
            <Loco x={trainB} y={1144} s={0.55} spin={spin} />
            {puffs(trainB + 48, 1000, 4, 10)}
          </g>
          <Water x={50} y={1152} w={580} h={142} t={frame} />
          <Boat x={interpolate(frame, [IN.B, 450], [440, 380])} y={1240} s={0.8} row={Math.sin(frame * 0.15)} />
          <Narration x={66} y={830} w={370} lines={["สายปากน้ำ", "วิ่งเลียบคลอง"]} font={font} size={30} k={enter(IN.B + 14)} />
        </Panel>

        {/* C: at the window */}
        <Panel id="C" x={652} y={814} w={378} h={480} enter={enter(IN.C)} from="right">
          <rect x={652} y={814} width={378} height={480} fill={K.yellow} />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${652 + ((i * 140 - frame * 18) % 980 + 980) % 980 - 200} ${880 + i * 30} h120`} stroke={K.ink} strokeWidth={4} strokeLinecap="round" opacity={0.85} />)}
          <rect x={672} y={1000} width={338} height={270} fill={K.cream} stroke={K.ink} strokeWidth={4} />
          <rect x={700} y={1020} width={282} height={150} fill={K.sky} stroke={K.ink} strokeWidth={4} />
          <Palm x={interpolate((frame * 9) % 600, [0, 600], [1100, 620])} y={1180} s={0.55} />
          <g transform="translate(0,0)">
            <Person x={780} y={1330} s={1.35} look={MUM} mouth="open" />
            <Person x={910} y={1340} s={1.15} look={BOY} wave={1} phase={frame * 0.35} />
          </g>
          <rect x={672} y={1160} width={338} height={22} fill={K.wood} stroke={K.ink} strokeWidth={4} />
          <Balloon x={672} y={836} w={340} h={120} tx={760} ty={1010} lines={["เร็วกว่าเรือแจว", "ตั้งเยอะ!"]} font={font} size={36} k={pop(IN.C + 40)} />
        </Panel>

        {/* D: the line from Bangkok to Paknam */}
        <Panel id="D" x={50} y={1316} w={980} h={444} enter={enter(IN.D)} from="down">
          <rect x={50} y={1316} width={980} height={444} fill="url(#lc-sky)" />
          <Water x={50} y={1560} w={980} h={200} t={frame} />
          <path d="M50 1560 L50 1530 L640 1532 L700 1560 Z" fill="#9ccf6a" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M880 1560 L950 1540 L1030 1544 V1560 Z" fill="#9ccf6a" stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
          {/* a sailing ship off the river mouth */}
          <g transform={`translate(${300 + Math.sin(frame * 0.04) * 6},1712) scale(0.8)`}>
            <path d="M-80 -20 H80 L60 10 H-60 Z" fill={K.ink} />
            <path d="M0 -20 V-150" stroke={K.ink} strokeWidth={5} />
            <path d="M4 -146 Q70 -100 4 -40 Z" fill={K.cream} stroke={K.ink} strokeWidth={4} />
            <path d="M-4 -130 Q-56 -90 -4 -46 Z" fill={K.cream} stroke={K.ink} strokeWidth={4} />
            <path d="M0 -150 l24 8 l-24 8 Z" fill={K.red} />
          </g>
          {/* Paknam: a small station and the train pulling in */}
          <rect x={90} y={1440} width={150} height={92} fill={K.cream} stroke={K.ink} strokeWidth={4} />
          <path d="M74 1444 L165 1396 L256 1444 Z" fill={K.red} stroke={K.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={136} y={1476} width={34} height={56} fill={K.wood} stroke={K.ink} strokeWidth={4} />
          <Palm x={290} y={1532} s={0.5} sway={Math.sin(frame * 0.05) * 4} />
          {(() => {
            const tx = interpolate(frame, [IN.D, IN.D + 150], [900, 420], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <g>
                {/* front to the left: the train runs toward the Paknam station */}
                <g transform={`translate(${tx},1552) scale(-1,1)`}>
                  <Coach x={-158} y={0} s={0.36} spin={tx * 0.06} faces={3} />
                  <Loco x={0} y={0} s={0.36} spin={tx * 0.06} />
                </g>
                {puffs(tx - 10, 1472, 3, 20)}
              </g>
            );
          })()}
          {/* line diagram board */}
          <g transform={`translate(540,${470 + (1 - enter(IN.D + 16)) * 40}) scale(0.82) translate(-120,0)`} opacity={enter(IN.D + 16)}>
            <rect x={120} y={1384} width={560} height={150} rx={10} fill={K.white} stroke={K.ink} strokeWidth={5} />
            <path d="M190 1474 H610" stroke={K.ink} strokeWidth={10} strokeLinecap="round" />
            <path d="M190 1474 H610" stroke={K.red} strokeWidth={5} strokeDasharray="18 12" pathLength={420} strokeDashoffset={-frame * 2} />
            {[190, 610].map((x) => <circle key={x} cx={x} cy={1474} r={16} fill={K.yellow} stroke={K.ink} strokeWidth={5} />)}
            <text x={190} y={1438} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={32} fill={K.ink}>กรุงเทพฯ</text>
            <text x={610} y={1438} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={32} fill={K.ink}>ปากน้ำ</text>
            <text x={400} y={1518} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={28} fill={K.ink}>ราว 21 กิโลเมตร</text>
          </g>
          <Narration x={70} y={1336} w={940} lines={["รถไฟสายแรกของสยาม · เปิดเดินรถถึง พ.ศ. 2503"]} font={font} size={30} k={enter(IN.D + 30)} />
        </Panel>

        {/* footer */}
        <text x={60} y={1830} fontFamily={font} fontWeight={600} fontSize={24} fill={K.ink} opacity={0.7}>ภาพประกอบ · ตัวละครและบทพูดแต่งขึ้น</text>
        <text x={1020} y={1830} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={26} fill={K.ink} opacity={0.7}>— 1 —</text>
      </svg>
    </AbsoluteFill>
  );
};
