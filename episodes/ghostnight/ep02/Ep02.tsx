// ออเดอร์ตีสาม ตอน 2 · ผีพราย — 9:16. Same engine as EP1 (engine.tsx); river, sala and the drowned boy from kit.tsx.
import { interpolate } from "remotion";
import { Bed, Hit, lib, SFX, Sfx } from "../../../components/Sound";
import { makeEpisode, SEPIA, type Scenes } from "../engine";
import {
  BananaClump, Boat, C, Chair, Chibi, Chip, Eggs, Ground, H, Offerings, OrderCard, Orbs, Phone, RuleNote, Sala, Scooter, Shophouses,
  Sky, Steps, Store, TempleRoof, Torch, UI, W, Water, WetHand, Wisps, wave,
} from "../kit";
import BEATS from "./beats.json";
import TIMING from "./timing.json";

const EP = makeEpisode(BEATS, TIMING, {
  dialogue: ["rule4a", "rule4b", "rule4c", "rule5a", "rule5b", "rule5c", "b1", "b2", "c1", "k1", "c2"],
  hl: ["ห้ามขานรับ", "อย่าขานรับ", "ขานรับ", "ตัวตายตัวแทน", "ผีพราย", "เก่ง", "500", "20", "เปียก", "รอยมือ", "1", "2", "ต้น"],
});
export const EP02_FRAMES = EP.frames;
const { at, endOf, talkOf } = EP;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BLUE = "#7fd0ff";

// Night riverside: temple roof across the water, the sala on the left, steps down into the river.
const river = (id: string, f: number, o: { orbs?: number; sala?: boolean; steps?: boolean; y?: number } = {}) => {
  const y = o.y ?? 1180;
  return (
    <>
      <Sky id={id} top="#02040b" bottom="#14223f" mx={780} my={300} />
      <TempleRoof x={760} y={y - 40} s={0.7} />
      <rect x={-50} y={y - 30} width={W + 100} height={40} fill="#0b0f1c" />
      <Water y={y} f={f} id={id} />
      {(o.orbs ?? 0) > 0 && <Orbs y={y} f={f} k={o.orbs} />}
      {o.sala !== false && <Sala x={230} y={y + 60} s={0.75} />}
      {o.steps !== false && <Steps x={300} y={y + 110} s={1.1} />}
    </>
  );
};

const card3 = (time: string) => <OrderCard time={time} items={["ไข่ต้ม 2 ฟอง", "พวงมาลัย 1 พวง"]} fee="฿500" place="📍 ศาลาท่าน้ำวัด" />;

const SCENES: Scenes = {
  hook: ({ f }) => ({
    svg: (
      <>
        {river("hk", f, { orbs: 1, y: 1000 })}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={560} cy={1500} rx={60 + ((f * 3 + i * 70) % 210)} ry={(60 + ((f * 3 + i * 70) % 210)) / 4} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.6 * (1 - ((f * 3 + i * 70) % 210) / 210)} />
        ))}
        <WetHand x={560} y={1430 - Math.min(f, 30) * 2} s={1.6} />
        <rect x={0} y={1520} width={W} height={400} fill="#040a16" opacity={0.85} />
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, textAlign: "center", fontFamily: UI }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#ffd0a8" }}>ออเดอร์ตีสาม · ตอน 2</div>
        <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1.15, color: "#fff", textShadow: `0 0 28px ${C.app}, 0 0 60px ${C.app}` }}>มีเสียงเรียกชื่อ</div>
        <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1.15, color: "#e3f6ff", textShadow: `0 0 28px ${BLUE}, 0 0 60px #2a7bb8` }}>จากใต้น้ำ</div>
      </div>
    ),
    zoom: [1, 1.07],
    origin: [540, 1400],
    shake: f < 8 ? (8 - f) * 1.5 : 0,
  }),
  title: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#03070e" />
        <Wisps f={f} n={20} color={BLUE} />
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: UI, opacity: interpolate(f, [0, 8, d - 6, d], [0, 1, 1, 0.2]) }}>
        <div style={{ fontSize: 150, fontWeight: 800, color: "#fff", textShadow: `0 0 30px ${C.app}, 0 0 80px ${C.app}` }}>ออเดอร์ตีสาม</div>
        <div style={{ marginTop: 30, fontSize: 64, fontWeight: 700, color: BLUE, textShadow: "0 0 24px #2a7bb8" }}>ตอน 2 · ผีพราย</div>
      </div>
    ),
  }),
  recap: ({ f }) => ({
    svg: (
      <>
        <Sky id="rc" top="#03050d" bottom="#14203a" mx={250} my={330} />
        <Ground y={1150} color="#10140f" edge="#1d2618" />
        <BananaClump x={560} y={1420} s={1.15} f={f} cloth glow={0.6} />
        <Offerings x={360} y={1560} s={1.1} />
        <Chibi who="tani" x={640} y={1540} s={1.0} f={f} mood="sad" look={-1} float={40} />
      </>
    ),
    html: <Chip text="ตอนที่แล้ว" f={f - 4} y={230} border="#d8c08a" />,
    style: SEPIA,
    zoom: [1.06, 1],
  }),
  recapCherd: ({ f }) => ({
    svg: (
      <>
        <Sky id="rcc" moon={false} />
        <Store y={1450} />
        <Ground y={1450} color="#24262c" edge="#3a3d45" />
        <Chair x={540} y={1640} />
        <Chibi who="cherd" x={540} y={1520} s={1.0} f={f} mood="sad" look={-0.5} noLegs />
      </>
    ),
    html: <Chip text="คนที่ติดค้าง = ลุงเชิด" f={f - 30} y={230} border={C.red} />,
    style: SEPIA,
    zoom: [1, 1.08],
    origin: [540, 1100],
  }),
  orderCard: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        <Orbs y={1400} f={f} n={8} />
        <Phone x={540} y={960} s={1.2}>
          {card3("03:33")}
        </Phone>
      </>
    ),
    zoom: [1, 1.07],
    origin: [540, 1000],
  }),
  orderNote: ({ f, d }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        <Phone x={540} y={700} s={1.7}>
          <OrderCard time="03:33" items={["ไข่ต้ม 2 ฟอง", "พวงมาลัย 1 พวง"]} fee="฿500" note="ถ้ามีคนเรียกชื่อ อย่าขานรับ" typed={interpolate(f, [d * 0.35, d * 0.85], [0, 1], clamp)} />
        </Phone>
      </>
    ),
    zoom: [1, 1.12],
    origin: [540, 1100],
  }),
  rule4: ({ f, F }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(9px) brightness(0.45)" }}>
          <Store y={1450} />
        </g>
        <RuleNote n={4} lines={["ที่ท่าน้ำตอนดึก", "ใครเรียกชื่อ", "ห้ามขานรับ เด็ดขาด"]} hl={2} f={f} y={800} />
        <Chibi who="cherd" x={830} y={2050} s={1.0} f={f} mood="grim" look={-1} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.04],
  }),
  riverRide: ({ f, d }) => ({
    svg: (
      <>
        <Sky id="rr" top="#02040b" bottom="#14223f" />
        <g opacity={0.6}>
          <Shophouses y={1000} lit={0.3} shift={-f * 3} />
        </g>
        <rect x={0} y={1000} width={W} height={200} fill="#1b1d24" />
        <Water y={1200} f={f} id="rr" />
        <Scooter x={interpolate(f, [0, d], [-200, 1200])} y={1190} s={0.5} f={f} moving light />
        <Chibi who="kaeng" x={interpolate(f, [0, d], [-230, 1170])} y={1120} s={0.4} f={f} helmet noLegs />
      </>
    ),
    html: <Chip text="วัดริมแม่น้ำ ท้ายตลาดเก่า" f={f - 15} y={230} />,
  }),
  sala: ({ f }) => ({
    svg: <>{river("sl", f, { y: 1200 })}</>,
    zoom: [1.08, 1.0],
    origin: [400, 1200],
  }),
  orbs: ({ f, d }) => ({
    svg: (
      <>
        {river("ob", f, { orbs: interpolate(f, [0, d * 0.6], [0.2, 1], clamp), sala: false, steps: false, y: 900 })}
      </>
    ),
    zoom: [1, 1.1],
    origin: [540, 1300],
  }),
  flashCherd: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#cfe6f2" />
        <Chibi who="cherd" x={540} y={1900} s={1.6} f={f} mood="grim" talk={talkOf("cherd", F)} />
      </>
    ),
    style: SEPIA,
    zoom: [1.08, 1.0],
  }),
  rule5: ({ f, F }) => ({
    svg: (
      <>
        <g style={{ filter: "blur(8px) brightness(0.5)" }}>{river("r5", f, { orbs: 1 })}</g>
        <RuleNote n={5} lines={["คนที่จมน้ำตาย", "จะกลายเป็นผีพราย", "ต้องหาตัวตายตัวแทน"]} hl={2} f={f} y={780} />
        <Chibi who="cherd" x={850} y={2080} s={0.95} f={f} mood="grim" look={-1} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.04],
  }),
  placeEggs: ({ f, d }) => ({
    svg: (
      <>
        {river("pe", f, { orbs: 0.6, y: 1000 })}
        <Torch x={-60} y={1100} angle={20} len={1400} k={0.25} />
        <g opacity={interpolate(f, [d * 0.4, d * 0.55], [0, 1], clamp)}>
          <Eggs x={520} y={1330} s={1.0} />
        </g>
        <Chibi who="kaeng" x={260} y={1560} s={0.95} f={f} mood="scared" look={1} armR={[75, 15]} helmet />
      </>
    ),
    zoom: [1, 1.06],
    origin: [450, 1300],
  }),
  call: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#040a16" />
        <Water y={300} f={f} id="cl" glow={1} />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={540} cy={1100} rx={40 + ((f * 4 + i * 80) % 320)} ry={(40 + ((f * 4 + i * 80) % 320)) / 3.5} fill="none" stroke={BLUE} strokeWidth={5} opacity={0.7 * (1 - ((f * 4 + i * 80) % 320) / 320)} />
        ))}
        <g opacity={0.18 + 0.08 * wave(f, 20)}>
          <ellipse cx={540} cy={1150} rx={120} ry={170} fill="#cfe0ef" />
          <circle cx={540} cy={950} r={90} fill="#cfe0ef" />
        </g>
      </>
    ),
    html: <Chip text="เสียงแม่?" f={f - 20} y={230} border="#ff8fb1" />,
    zoom: [1, 1.1],
    origin: [540, 1100],
  }),
  call2: ({ f }) => ({
    svg: (
      <>
        {river("c2", f, { orbs: 0.5, y: 900, sala: false })}
        <g transform={`rotate(${wave(f, 24) * 12},520,1500)`}>
          <WetHand x={520} y={1420} s={1.3} />
        </g>
        <rect x={0} y={1500} width={W} height={420} fill="#040a16" opacity={0.85} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [520, 1400],
  }),
  kaengFreeze: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#081226" />
        <ellipse cx={540} cy={1300} rx={600} ry={500} fill={BLUE} opacity={0.08} />
        <Chibi who="kaeng" x={540} y={2300} s={2.3} f={f} mood="shock" helmet />
      </>
    ),
    zoom: [1.1, 1.0],
    shake: f < 10 ? 3 : 0,
  }),
  khonkaen: ({ f, d }) => {
    const p = interpolate(f, [0, d * 0.7], [0, 1], clamp);
    return {
      svg: (
        <>
          <rect width={W} height={H} fill="#0d1322" />
          <path d="M540,1450 L540,1450" />
          <path d={`M300,520 Q700,900 640,1420`} stroke={C.app} strokeWidth={10} fill="none" strokeDasharray="30 20" strokeDashoffset={-f * 2} opacity={p} />
          <g transform="translate(300,520)">
            <circle r={36} fill="#ff8fb1" stroke="#16100c" strokeWidth={6} />
            <text y={-60} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={56} fill="#fff">ขอนแก่น · บ้านแม่</text>
          </g>
          <g transform="translate(640,1420)">
            <circle r={36} fill={BLUE} stroke="#16100c" strokeWidth={6} />
            <text y={90} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={56} fill="#fff">ท่าน้ำวัด</text>
          </g>
          <text x={760} y={960} fontFamily={UI} fontWeight={800} fontSize={90} fill={C.app} opacity={p}>500 กม.</text>
        </>
      ),
      zoom: [1, 1.05],
    };
  },
  bite: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#081226" />
        <Chibi who="kaeng" x={540} y={2500} s={2.8} f={f} mood="scared" look={-0.5} helmet />
        <rect x={470} y={1120} width={140} height={22} rx={11} fill="#7a2a24" opacity={0.85} />
      </>
    ),
    zoom: [1, 1.1],
    origin: [540, 1100],
  }),
  hand: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#040a16" />
        <rect x={-50} y={900} width={W + 100} height={260} fill="#8c8a84" stroke="#16100c" strokeWidth={8} />
        <Water y={1160} f={f} id="hd" />
        <rect x={420} y={0} width={190} height={1000} rx={60} fill="#2a3350" stroke="#16100c" strokeWidth={8} />
        <ellipse cx={540} cy={1000} rx={150} ry={70} fill="#1e1b1b" stroke="#16100c" strokeWidth={8} />
        <WetHand x={470} y={1010} s={1.6} rot={-150} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${460 + i * 50},${1060 + ((f * 6 + i * 30) % 120)} q8,14 0,20 q-8,-6 0,-20 Z`} fill="#8fd4ff" />
        ))}
      </>
    ),
    zoom: [1.15, 1.0],
    origin: [520, 1000],
    shake: f < 14 ? 7 : 1,
  }),
  boy: ({ f }) => ({
    svg: (
      <>
        {river("by", f, { orbs: 0.8, y: 1000 })}
        <Eggs x={700} y={1330} s={0.8} />
        <Chibi who="boy" x={520} y={1500} s={0.85} f={f} mood="sad" look={-1} />
        <Chibi who="kaeng" x={200} y={1700} s={1.0} f={f} mood="scared" look={1} helmet />
      </>
    ),
    zoom: [1.04, 1.0],
    origin: [450, 1300],
  }),
  boyClose: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        <ellipse cx={540} cy={800} rx={600} ry={700} fill={BLUE} opacity={0.1} />
        <Chibi who="boy" x={540} y={2380} s={2.6} f={f} mood="sad" talk={talkOf("boy", F)} />
        <Wisps f={f} color={BLUE} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [540, 800],
  }),
  boyClose2: ({ f, F }) => ({
    svg: (
      <>
        {river("b2", f, { orbs: 1, sala: false, steps: false, y: 1200 })}
        <Chibi who="boy" x={700} y={2100} s={1.8} f={f} mood="sad" look={-1} talk={talkOf("boy", F)} />
      </>
    ),
    zoom: [1, 1.05],
  }),
  pastBoat: ({ f, d }) => {
    const tilt = interpolate(f, [d * 0.4, d * 0.75], [0, 38], clamp);
    return {
      svg: (
        <>
          <Sky id="pb" top="#6d7f99" bottom="#c9d4de" moon={false} />
          <TempleRoof x={800} y={1000} s={0.6} color="#4b5568" />
          <Water y={1000} f={f} id="pb" />
          <g transform={`translate(0,${tilt * 3})`}>
            <Chibi who="boy" x={430} y={1380 + tilt * 4} s={0.6} f={f} mood={tilt > 10 ? "shock" : "smile"} noLegs />
            <Chibi who="tonKid" x={650} y={1380} s={0.6} f={f} mood={tilt > 10 ? "shock" : "smile"} noLegs />
            <Boat x={540} y={1400} s={1.1} tilt={tilt} />
          </g>
          {tilt > 20 && <path d={`M300,1400 q60,-${tilt * 3} 120,0 q60,-${tilt * 2} 120,0`} fill="#dfe8ea" opacity={0.8} />}
        </>
      ),
      html: <Chip text="เรือข้ามฟากล่ม" f={f - 20} y={230} border="#d8c08a" />,
      style: SEPIA,
      shake: tilt > 5 && tilt < 36 ? 4 : 0,
    };
  },
  pastPromise: ({ f }) => ({
    svg: (
      <>
        <Sky id="pp" top="#6d7f99" bottom="#c9d4de" moon={false} />
        <Water y={1150} f={f} id="pp" />
        <Sala x={260} y={1210} s={0.75} lamp={0} />
        <Steps x={330} y={1260} s={1.1} />
        <Chibi who="tonKid" x={600} y={1500} s={0.85} f={f} mood="sad" look={-1} armL={[-10, -120]} armR={[-10, -120]} />
        <g opacity={0.4}>
          <Chibi who="boy" x={900} y={1500} s={0.6} f={f} mood="sad" look={-1} noLegs />
        </g>
      </>
    ),
    html: <Chip text="สัญญาว่าจะกลับมาทำบุญให้" f={f - 20} y={230} border="#d8c08a" />,
    style: SEPIA,
    zoom: [1, 1.06],
  }),
  emptySala: ({ f, d }) => {
    const years = Math.min(30, 1 + Math.floor(interpolate(f, [0, d * 0.85], [0, 30], clamp)));
    return {
      svg: (
        <>
          {river("es", f, { orbs: 0.4, y: 1150 })}
          <g opacity={0.5}>
            <Chibi who="boy" x={560} y={1470} s={0.6} f={f} mood="sad" look={-1} />
          </g>
        </>
      ),
      html: <Chip text={`รอมาแล้ว ${years} ปี`} f={f} y={230} border={BLUE} />,
      style: SEPIA,
      zoom: [1, 1.05],
    };
  },
  eggsClose: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#040a16" />
        <rect x={-50} y={1000} width={W + 100} height={260} fill="#8c8a84" stroke="#16100c" strokeWidth={8} />
        <Water y={1260} f={f} id="ec" />
        <Orbs y={1260} f={f} n={8} />
        <Eggs x={480} y={1020} s={2.1} />
        <Torch x={-80} y={800} angle={22} len={1400} k={0.25} />
      </>
    ),
    zoom: [1, 1.08],
    origin: [540, 1000],
  }),
  boyLook: ({ f }) => ({
    svg: (
      <>
        {river("bl", f, { orbs: 0.7, y: 1000 })}
        <Eggs x={420} y={1330} s={0.9} />
        <Chibi who="boy" x={640} y={1480} s={0.85} f={f} mood="sad" look={-1} />
      </>
    ),
    zoom: [1, 1.06],
    origin: [540, 1300],
  }),
  dawn: ({ f, d }) => ({
    svg: (
      <>
        <Sky id="dw" top="#3a3f6e" bottom="#ffb37a" moon={false} />
        <circle cx={800} cy={1100} r={interpolate(f, [0, d], [60, 90])} fill="#ffe2a8" opacity={0.9} />
        <TempleRoof x={540} y={1150} s={1.1} color="#2a2140" />
        <rect x={0} y={1460} width={W} height={460} fill="#3a3040" />
        <Chibi who="kaeng" x={420} y={1720} s={1.0} f={f} mood="sad" look={1} noLegs armR={[50, 60]} />
        <g transform="translate(600,1440)">
          <rect x={-22} y={-60} width={44} height={70} rx={10} fill="#c9a43a" stroke="#16100c" strokeWidth={5} />
          <path d={`M10,10 q6,${30 + wave(f, 8) * 4} 0,70`} stroke="#bfe6ff" strokeWidth={6} fill="none" />
          <ellipse cx={10} cy={95} rx={50} ry={16} fill="#c9a43a" stroke="#16100c" strokeWidth={5} />
        </g>
      </>
    ),
    html: <Chip text="ทำบุญ · กรวดน้ำ" f={f - 30} y={230} border="#ffd38a" />,
    zoom: [1, 1.06],
  }),
  orbsFade: ({ f, d }) => ({
    svg: (
      <>
        {river("of", f, { orbs: interpolate(f, [0, d * 0.9], [1, 0], clamp), y: 1000 })}
        <rect width={W} height={H} fill="#ffb37a" opacity={interpolate(f, [0, d], [0.05, 0.25])} />
        <g opacity={interpolate(f, [0, d * 0.9], [0.8, 0], clamp)}>
          <Chibi who="boy" x={560} y={1420} s={0.7} f={f} mood="smile" armR={[150, 10]} float={0} />
        </g>
      </>
    ),
    zoom: [1, 1.05],
  }),
  storeBack: ({ f, F }) => ({
    svg: (
      <>
        <Sky id="sb" top="#3a3f6e" bottom="#ffb37a" moon={false} />
        <Store y={1450} />
        <Ground y={1450} color="#24262c" edge="#3a3d45" />
        <Chair x={680} y={1640} />
        <Chibi who="cherd" x={680} y={1520} s={0.95} f={f} mood="grim" look={-1} noLegs talk={talkOf("cherd", F)} />
        <Chibi who="kaeng" x={300} y={1720} s={1.0} f={f} mood="sad" look={1} helmet />
      </>
    ),
    zoom: [1, 1.06],
    origin: [520, 1300],
  }),
  cherdAsk: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#e6d2bf" />
        <rect y={1300} width={W} height={620} fill="#a89a8c" />
        <Chibi who="cherd" x={540} y={2350} s={2.3} f={f} mood="grim" look={-0.2} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.1],
    origin: [540, 900],
  }),
  kaengSay: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#e6d2bf" />
        <Chibi who="kaeng" x={540} y={2300} s={2.3} f={f} mood="scared" talk={talkOf("kaeng", F)} />
      </>
    ),
    zoom: [1.06, 1.0],
  }),
  cherdAsk2: ({ f, F }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#e6d2bf" />
        <rect y={1300} width={W} height={620} fill="#a89a8c" />
        <Chibi who="cherd" x={540} y={2150} s={1.9} f={f} mood="grim" look={-0.8} armR={[40, 20]} talk={talkOf("cherd", F)} />
      </>
    ),
    zoom: [1, 1.12],
    origin: [540, 1000],
  }),
  ankle: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#3a3d45" />
        <rect y={1500} width={W} height={420} fill="#24262c" />
        <rect x={400} y={0} width={280} height={1300} rx={80} fill="#2a3350" stroke="#16100c" strokeWidth={8} />
        <rect x={420} y={1240} width={240} height={150} fill="#e3a979" stroke="#16100c" strokeWidth={8} />
        <ellipse cx={560} cy={1450} rx={230} ry={100} fill="#1e1b1b" stroke="#16100c" strokeWidth={8} />
        <g opacity={interpolate(f, [10, 30], [0, 0.75], clamp)}>
          <WetHand x={520} y={1300} s={1.2} rot={-100} color="#5f86b8" />
        </g>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${470 + i * 40},${1390 + ((f * 5 + i * 33) % 120)} q8,14 0,20 q-8,-6 0,-20 Z`} fill="#8fd4ff" />
        ))}
      </>
    ),
    html: <Chip text="รอยมือเด็ก" f={f - 30} y={230} border={BLUE} />,
    zoom: [1.12, 1.0],
    origin: [540, 1300],
  }),
  phoneBuzz: ({ f }) => ({
    svg: (
      <>
        <Sky id="pz" top="#3a3f6e" bottom="#ffb37a" moon={false} />
        <Ground y={1300} color="#24262c" edge="#3a3d45" />
        <Scooter x={560} y={1760} s={1.3} f={f} />
        <g transform={`translate(${f > 10 ? wave(f, 3) * 8 : 0},0)`}>
          <Phone x={420} y={1330} s={0.22} rot={-78}>
            <rect x={-245} y={-470} width={490} height={940} rx={50} fill={C.app} />
          </Phone>
        </g>
      </>
    ),
    zoom: [1, 1.1],
    origin: [500, 1300],
  }),
  order3: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#140812" />
        <rect x={220} y={300} width={640} height={1500} fill="#221a26" stroke="#16100c" strokeWidth={8} />
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={260 + (i % 4) * 150} y={360 + Math.floor(i / 4) * 230} width={110} height={150} fill={i === 13 ? "#ffd6e6" : "#0e0a12"} opacity={i === 13 ? 0.6 + 0.3 * wave(f, 14) : 1} />
        ))}
        <Wisps f={f} color="#ff9ad0" />
        <Phone x={540} y={1100} s={1.0}>
          <OrderCard time="03:44" items={["ตุ๊กตา 1 ตัว", "นมกล่อง 1 กล่อง"]} fee="฿500" place="📍 หอพักร้าง ชั้น 4" />
        </Phone>
      </>
    ),
    zoom: [1, 1.05],
  }),
  cta: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#06121c" />
        <Wisps f={f} color={BLUE} />
        <g transform="translate(540,620) scale(1.4)">
          <WetHand x={0} y={0} s={1} color="#5f86b8" />
        </g>
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 1000, left: 60, right: 60, display: "flex", gap: 36, fontFamily: UI }}>
        {[
          ["1", "ขานรับ", C.red],
          ["2", "ไม่ได้ขานรับ", "#2f8c5a"],
        ].map(([n, t, col], i) => (
          <div key={n} style={{ flex: 1, background: col, borderRadius: 40, padding: "30px 0", textAlign: "center", color: "#fff", border: "6px solid #16100c", transform: `scale(${interpolate(f, [8 + i * 8, 16 + i * 8], [0.5, 1], clamp)})` }}>
            <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 52, fontWeight: 700 }}>{t}</div>
          </div>
        ))}
      </div>
    ),
  }),
  end: ({ f }) => ({
    svg: (
      <>
        <rect width={W} height={H} fill="#05060c" />
        <Wisps f={f} n={16} color={BLUE} />
        <Wisps f={f + 300} color="#ff9ad0" n={10} />
      </>
    ),
    html: (
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: UI }}>
        <div style={{ fontSize: 140, fontWeight: 800, color: "#fff", textShadow: `0 0 30px ${C.app}, 0 0 80px ${C.app}` }}>ออเดอร์ตีสาม</div>
        <div style={{ marginTop: 20, fontSize: 56, fontWeight: 700, color: "#ff9ad0" }}>ตอนต่อไป · แม่ซื้อ</div>
        <div style={{ marginTop: 70, display: "inline-block", fontSize: 54, fontWeight: 800, color: "#fff", background: C.app, borderRadius: 50, padding: "16px 56px", transform: `scale(${1 + 0.04 * wave(f, 24)})` }}>กดติดตาม</div>
      </div>
    ),
  }),
};

const Sounds = () => (
  <>
    <Bed id="horror_ambience" from={0} to={EP.frames} volume={0.2} voice={EP.voiceSpans} duck={0.5} />
    <Bed id="water_flow" from={0} to={at("recap1")} volume={0.12} voice={EP.voiceSpans} />
    <Bed id="crickets_night" from={at("ride1")} to={at("dawn")} volume={0.12} voice={EP.voiceSpans} />
    <Bed id="water_flow" from={at("ride2")} to={at("dawn")} volume={0.14} voice={EP.voiceSpans} />
    <Bed id="heartbeat_fast" from={at("call1")} to={at("boy0")} volume={0.3} voice={EP.voiceSpans} duck={0.6} />
    <Hit id="splash" at={4} volume={0.3} />
    <Sfx src={SFX.swell} at={at("title")} volume={0.3} />
    <Hit id="terror_sweep" at={at("title") + 4} volume={0.25} />
    <Sfx src={SFX.whoosh} at={at("recap1") - 4} volume={0.3} />
    <Sfx src={lib("msg_pop")} at={at("order1") + 4} volume={0.4} />
    {Array.from({ length: 14 }, (_, i) => (
      <Sfx key={i} src={SFX.tick} at={at("note2") + 4 + i * 3} volume={0.08} />
    ))}
    <Sfx src={SFX.whoosh} at={at("rule4a") - 4} volume={0.3} />
    <Hit id="moto_pass" at={at("ride1") + 20} volume={0.25} />
    <Sfx src={SFX.whoosh} at={at("recall") - 4} volume={0.3} />
    <Sfx src={SFX.whoosh} at={at("rule5a") - 4} volume={0.3} />
    <Hit id="terror_transition" at={at("call1")} volume={0.22} />
    <Hit id="splash" at={at("grab")} volume={0.35} />
    <Hit id="horror_hit" at={at("grab") + 2} volume={0.32} />
    <Sfx src={SFX.whoosh} at={at("b3") - 4} volume={0.3} />
    <Hit id="splash_big" at={at("b3") + Math.round((endOf("b3") - at("b3")) * 0.55)} volume={0.28} />
    <Hit id="gong" at={at("dawn") + 10} volume={0.25} />
    <Hit id="deep_impact" at={at("wet") + 30} volume={0.32} />
    <Sfx src={lib("msg_pop")} at={at("next1") + 2} volume={0.45} />
    <Sfx src={SFX.pop} at={at("cta1") + 8} volume={0.25} />
    <Sfx src={SFX.pop} at={at("cta1") + 16} volume={0.25} />
    <Sfx src={lib("msg_pop")} at={at("cta2") + 30} volume={0.35} />
  </>
);

export const Ep02 = () => <EP.Episode scenes={SCENES} sounds={<Sounds />} />;
