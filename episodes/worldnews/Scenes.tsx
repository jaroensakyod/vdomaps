import { Easing, interpolate } from "remotion";
import { Bowl, LOOKS, Person, Protester, type Look } from "../../components/Figures";
import { InsetPanel, Street, type InsetGeom } from "../../components/Inset";
import {
  AidTruck, Airliner, BallotBox, Blast, CoastSkyline, Drone, Fire, InfoChip, Interceptor, KyivSkyline, Launcher, LaunchTower,
  Lorry, MarsPhobos, Missile, OilBarrel, PetersburgSkyline, PriceBoard, RockiesSkyline, Rocket, RuinsSkyline, SahelSkyline,
  Sacks, SaoPauloSkyline, Smoke, Stall, TehranSkyline, VoteBars,
} from "../../components/Props";
import { style } from "../../components/style";
import { wordFrame } from "./France";

// One illustrated inset per story (France lives in France.tsx). Every cue is a spoken word from timing.json.
// All panels are labelled "ภาพประกอบ" (illustration) — they are not footage.
type Beat = Parameters<typeof wordFrame>[0];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (f: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const age = (f: number, at: number, len: number) => (f < at ? 0 : Math.min(1, (f - at) / len));
const F = style.font;

const KYIV: [number, number] = [30.5234, 50.4501];
const SPB: [number, number] = [30.3351, 59.9343];
const TEHRAN: [number, number] = [51.389, 35.6892];
const GAZA: [number, number] = [34.4668, 31.5017];
const SUDAN: [number, number] = [29.25, 11.6];
const SAO_PAULO: [number, number] = [-46.6333, -23.5505];
const ALBERTA: [number, number] = [-113.4938, 53.5461];
const TANEGASHIMA: [number, number] = [130.9752, 30.4007];

/* ---------------- Ukraine · Russia ---------------- */
export const UkraineScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const drones = wordFrame(beat, "โดรน", 0.14);
  const missiles = wordFrame(beat, "ขีปนาวุธ", 0.18);
  const strikeBack = wordFrame(beat, "ตอบโต้", 0.5);
  const patriot = wordFrame(beat, "ส่วน", 0.75);
  return (
    <>
      <InsetPanel id="kyiv" anchor={KYIV} label="เคียฟ · ภาพประกอบ" start={beat.start + 20} end={strikeBack} sky={["#070d1f", "#1c2541"]} font={F}>
        {(g) => {
          const hitX = g.cx - 70 * g.s, hitY = g.ground - 130 * g.s;
          const mp = ramp(g.frame, missiles, missiles + 26, Easing.in(Easing.quad));
          const impact = missiles + 26;
          return (
            <>
              <KyivSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} night={1} />
              <Street g={g} />
              {[0, 1, 2].map((i) => {
                const p = ramp(g.frame, drones + i * 8, drones + i * 8 + 70, Easing.linear);
                if (p <= 0 || p >= 1) return null;
                return <Drone key={i} x={g.x + g.W + 40 * g.s - p * (g.W * 0.9)} y={g.y + (80 + i * 34) * g.s} scale={g.sc * 0.7} />;
              })}
              <Interceptor x0={g.x + 60 * g.s} y0={g.ground} x1={g.x + g.W * 0.55} y1={g.y + 100 * g.s} p={ramp(g.frame, drones + 20, drones + 50)} s={g.s} />
              {mp > 0 && mp < 1 && <Missile x={g.x + g.W + 20 * g.s + (hitX - g.x - g.W - 20 * g.s) * mp} y={g.y + 30 * g.s + (hitY - g.y - 30 * g.s) * mp} angle={150} scale={g.sc * 0.9} trail={120} />}
              <Blast x={hitX} y={hitY} scale={g.sc} k={age(g.frame, impact, 24)} />
              {g.frame > impact && (
                <>
                  <Fire x={hitX} y={hitY + 30 * g.s} size={50 * g.s} seed={41} k={ramp(g.frame, impact, impact + 10)} />
                  <Smoke x={hitX} y={hitY} size={40 * g.s} seed={42} k={ramp(g.frame, impact, impact + 20)} />
                </>
              )}
            </>
          );
        }}
      </InsetPanel>
      <InsetPanel id="spb" anchor={SPB} label="เซนต์ปีเตอร์สเบิร์ก · ภาพประกอบ" start={strikeBack} end={patriot} sky={["#1b1f3a", "#7a4e48"]} font={F}>
        {(g) => {
          const t1 = g.x + g.W * 0.75, t2 = g.x + g.W * 0.87;
          const hit = strikeBack + 40;
          return (
            <>
              <PetersburgSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
              <Street g={g} />
              {[0, 1].map((i) => {
                const p = ramp(g.frame, strikeBack + i * 8, hit + i * 8, Easing.in(Easing.quad));
                if (p <= 0 || p >= 1) return null;
                return <Drone key={i} flip x={g.x - 30 * g.s + (t1 + i * 50 * g.s - g.x) * p} y={g.y + 70 * g.s + (g.ground - 110 * g.s - g.y) * p} scale={g.sc * 0.7} />;
              })}
              <Blast x={t1 + 26 * g.s} y={g.ground - 70 * g.s} scale={g.sc} k={age(g.frame, hit, 22)} />
              {g.frame > hit && (
                <>
                  <Fire x={t1 + 26 * g.s} y={g.ground - 56 * g.s} size={70 * g.s} seed={51} k={ramp(g.frame, hit, hit + 12)} />
                  <Fire x={t2 + 26 * g.s} y={g.ground - 56 * g.s} size={55 * g.s} seed={52} k={ramp(g.frame, hit + 8, hit + 20)} />
                  <Smoke x={t1 + 26 * g.s} y={g.ground - 110 * g.s} size={60 * g.s} seed={53} k={ramp(g.frame, hit, hit + 25)} />
                </>
              )}
            </>
          );
        }}
      </InsetPanel>
      <InsetPanel id="patriot" anchor={KYIV} label="แพทริออต · ภาพประกอบ" start={patriot} end={end} sky={["#3d5a80", "#98c1d9"]} font={F}>
        {(g) => (
          <>
            <path d={`M${g.x} ${g.ground - 40 * g.s} Q${g.cx} ${g.ground - 90 * g.s} ${g.x + g.W} ${g.ground - 50 * g.s} L${g.x + g.W} ${g.ground} L${g.x} ${g.ground} Z`} fill="#6a7f4f" />
            <Street g={g} color="#5b5446" kerb="#6b6152" marks={false} />
            <Launcher x={g.cx} y={g.ground + 10 * g.s} scale={g.sc * 1.2} ammo={0.13} />
            <text x={g.cx} y={g.y + 76 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={F}>
              ขีปนาวุธสกัดกั้นใกล้หมด
            </text>
          </>
        )}
      </InsetPanel>
    </>
  );
};

/* ---------------- Iran ---------------- */
export const IranScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const fly = wordFrame(beat, "บิน", 0.3);
  const oil = wordFrame(beat, "น้ำมัน", 0.7);
  const barrel = wordFrame(beat, "บาร์เรล", 0.95);
  return (
    <InsetPanel id="tehran" anchor={TEHRAN} label="เตหะราน · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#7fb7d9", "#f4e9d8"]} font={F}>
      {(g) => {
        const stairs = g.cx + 70 * g.s;
        const walk = ramp(g.frame, fly, fly + 60, Easing.linear);
        const officerX = stairs - walk * 110 * g.s;
        const price = Math.round(interpolate(g.frame, [oil, barrel], [96, 110], clamp));
        return (
          <>
            <TehranSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#6f7378" kerb="#9a9c9f" marks={false} />
            <Airliner x={g.cx + 190 * g.s} y={g.ground + 4 * g.s} scale={g.sc * 0.62} />
            <Person x={g.cx - 150 * g.s} y={g.ground + 12 * g.s} scale={g.sc} look={LOOKS[3]} outfit="suit" pose={walk > 0.9 ? "wave" : "stand"} />
            <Person x={g.cx - 105 * g.s} y={g.ground + 14 * g.s} scale={g.sc} look={LOOKS[1]} outfit="suit" pose="stand" phase={1.4} />
            {g.frame >= fly - 10 && <Person x={officerX} y={g.ground + 14 * g.s} scale={g.sc} look={LOOKS[5]} outfit="uniform" hat="peaked" pose={walk < 1 ? "walk" : "stand"} facing={-1} />}
            {g.frame >= oil && (
              <g opacity={ramp(g.frame, oil, oil + 10)}>
                <OilBarrel x={g.x + 60 * g.s} y={g.ground + 14 * g.s} scale={g.sc} />
                <OilBarrel x={g.x + 110 * g.s} y={g.ground + 18 * g.s} scale={g.sc} />
                <PriceBoard x={g.x + 120 * g.s} y={g.y + 150 * g.s} scale={g.sc * 0.95} value={`$${price}`} label="น้ำมันดิบ/บาร์เรล" font={F} />
              </g>
            )}
          </>
        );
      }}
    </InsetPanel>
  );
};

/* ---------------- Gaza ---------------- */
const QUEUE: { look: Look; hat: "hijab" | "cap" | "none"; child?: boolean }[] = [
  { look: LOOKS[4], hat: "hijab" },
  { look: LOOKS[1], hat: "cap" },
  { look: LOOKS[2], hat: "hijab", child: true },
  { look: LOOKS[5], hat: "none" },
  { look: LOOKS[0], hat: "hijab" },
];
export const GazaScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const cut = wordFrame(beat, "ตัด", 0.5);
  const people = wordFrame(beat, "ห้าแสน", 0.7);
  return (
    <InsetPanel id="gaza" anchor={GAZA} label="กาซา · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#b8a99a", "#efe6dc"]} font={F}>
      {(g) => {
        const leave = ramp(g.frame, cut + 20, end, Easing.in(Easing.quad));
        const sacks = 6 - 5 * ramp(g.frame, cut, cut + 50, Easing.linear);
        return (
          <>
            <RuinsSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#9c8f7a" kerb="#8a7e6a" marks={false} />
            <AidTruck x={g.cx + 200 * g.s + leave * 420 * g.s} y={g.ground + 8 * g.s} scale={g.sc} />
            <Sacks x={g.cx + 70 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.9} n={sacks} />
            {QUEUE.map((q, i) => (
              <Person key={i} x={g.cx - 330 * g.s + i * 74 * g.s} y={g.ground + 14 * g.s} scale={g.sc * (q.child ? 0.72 : 1)} look={q.look} hat={q.hat === "none" ? "none" : q.hat} pose="hold" holding={<Bowl />} phase={i * 0.9} />
            ))}
            {g.frame >= people && <InfoChip x={g.x + 24 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.95} label="ถูกตัดความช่วยเหลือ" value="500,000 คน" font={F} />}
          </>
        );
      }}
    </InsetPanel>
  );
};

/* ---------------- Sudan ---------------- */
export const SudanScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const drone = wordFrame(beat, "โดรน", 0.05);
  const strike = wordFrame(beat, "ตลาด", 0.25) + 8;
  const toll = wordFrame(beat, "ราว", 0.55);
  return (
    <InsetPanel id="sudan" anchor={SUDAN} label="คอร์โดฟานตะวันตก · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#d9a65a", "#f4e3c1"]} font={F}>
      {(g) => {
        const dp = ramp(g.frame, drone, strike, Easing.linear);
        const bx = g.cx - 40 * g.s, by = g.ground - 40 * g.s;
        return (
          <>
            <SahelSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#c2a26b" kerb="#b08f58" marks={false} />
            <Stall x={g.cx - 230 * g.s} y={g.ground + 8 * g.s} scale={g.sc} awning="#e76f51" />
            <Stall x={g.cx - 120 * g.s} y={g.ground + 8 * g.s} scale={g.sc} awning="#2a9d8f" />
            <Lorry x={g.cx + 60 * g.s} y={g.ground + 12 * g.s} scale={g.sc} />
            <Lorry x={g.cx + 230 * g.s} y={g.ground + 14 * g.s} scale={g.sc * 0.95} color="#3d5a80" />
            {dp > 0 && dp < 1 && <Drone x={g.x + g.W + 20 * g.s - dp * (g.x + g.W - bx + 20 * g.s)} y={g.y + 60 * g.s + dp * (by - g.y - 120 * g.s)} scale={g.sc * 0.75} />}
            <Blast x={bx} y={by} scale={g.sc * 1.1} k={age(g.frame, strike, 24)} />
            {g.frame > strike && (
              <>
                <Fire x={bx} y={by + 30 * g.s} size={45 * g.s} seed={61} k={ramp(g.frame, strike, strike + 10)} />
                <Smoke x={bx} y={by} size={70 * g.s} seed={62} k={ramp(g.frame, strike, strike + 25)} />
              </>
            )}
            {g.frame >= toll && <InfoChip x={g.x + 24 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.95} label="ผู้เสียชีวิต (ตามรายงาน)" value="ราว 80 คน" font={F} />}
          </>
        );
      }}
    </InsetPanel>
  );
};

/* ---------------- Brazil ---------------- */
const BR_LOOKS: Look[] = [
  { ...LOOKS[0], top: "#009c3b", topShade: "#007a2e" },
  { ...LOOKS[2], top: "#ffdf00", topShade: "#d1b600" },
  { ...LOOKS[1], top: "#c1121f", topShade: "#8f0d17" },
  { ...LOOKS[3], top: "#f4f4f4", topShade: "#cfcfcf" },
  { ...LOOKS[4], top: "#002776", topShade: "#001b52" },
];
export const BrazilScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const runoff = wordFrame(beat, "ชี้ขาด", 0.65);
  const lula = wordFrame(beat, "ลูลา", 0.72);
  const flavio = wordFrame(beat, "ลาวิโอ", 0.8);
  const signs = ["DEMOCRACIA", "FAKE NEWS NÃO", "VOTO LIVRE", "ELEIÇÃO LIMPA", ""];
  return (
    <InsetPanel id="brazil" anchor={SAO_PAULO} label="เซาเปาโล · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#4ea8de", "#d6ecf7"]} font={F}>
      {(g) => (
        <>
          <SaoPauloSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} sign="META" at={0.42} />
          <Street g={g} />
          {BR_LOOKS.map((l, i) => (
            <Protester key={i} x={g.cx - 330 * g.s + i * 80 * g.s} y={g.ground + 14 * g.s - (i % 2) * 10 * g.s} scale={g.sc} look={l} sign={signs[i] || undefined} phase={i * 1.4} walking={false} lift={(i % 2) * 22} />
          ))}
          {g.frame >= runoff && (
            <g opacity={ramp(g.frame, runoff, runoff + 8)}>
              <BallotBox x={g.cx + 190 * g.s} y={g.ground + 12 * g.s} scale={g.sc * 1.1} text="25/10" />
            </g>
          )}
          {g.frame >= lula && <InfoChip x={g.x + g.W - 330 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.8} label="ผู้สมัคร" value="ลูลา" font={F} color="#e63946" />}
          {g.frame >= flavio && <InfoChip x={g.x + g.W - 190 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.8} label="ผู้สมัคร" value="ฟลาวิโอ" font={F} color="#4ea8de" />}
        </>
      )}
    </InsetPanel>
  );
};

/* ---------------- Canada ---------------- */
export const CanadaScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const share = wordFrame(beat, "สาม", 0.5);
  const voters: { look: Look; hat: "beanie" | "cap" | "none" }[] = [
    { look: LOOKS[3], hat: "beanie" },
    { look: LOOKS[0], hat: "none" },
    { look: LOOKS[5], hat: "cap" },
    { look: LOOKS[2], hat: "beanie" },
  ];
  return (
    <InsetPanel id="alberta" anchor={ALBERTA} label="อัลเบอร์ตา · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#5fa8d3", "#e3f1f9"]} font={F}>
      {(g) => {
        const hall = g.cx + 150 * g.s;
        return (
          <>
            <RockiesSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#7d7f7a" kerb="#9b9d97" marks={false} />
            {/* polling station: small hall, VOTE/VOTEZ sign, flag */}
            <g>
              <rect x={hall - 90 * g.s} y={g.ground - 120 * g.s} width={180 * g.s} height={110 * g.s} fill="#b5654b" stroke="#5a2e22" strokeWidth={1.6 * g.s} />
              <path d={`M${hall - 100 * g.s} ${g.ground - 120 * g.s} L${hall} ${g.ground - 165 * g.s} L${hall + 100 * g.s} ${g.ground - 120 * g.s} Z`} fill="#4b4b4b" />
              <rect x={hall - 22 * g.s} y={g.ground - 64 * g.s} width={44 * g.s} height={54 * g.s} fill="#3a2a20" />
              <rect x={hall - 70 * g.s} y={g.ground - 108 * g.s} width={140 * g.s} height={30 * g.s} rx={4 * g.s} fill="#fff" stroke="#5a2e22" strokeWidth={1.2 * g.s} />
              <text x={hall} y={g.ground - 87 * g.s} textAnchor="middle" fontSize={17 * g.s} fontWeight={900} fill="#d52b1e" fontFamily="Arial, sans-serif">VOTE · VOTEZ</text>
              <line x1={hall + 120 * g.s} y1={g.ground - 10 * g.s} x2={hall + 120 * g.s} y2={g.ground - 190 * g.s} stroke="#ccc" strokeWidth={3 * g.s} />
              <g transform={`translate(${hall + 121 * g.s},${g.ground - 188 * g.s})`}>
                <rect width={66 * g.s} height={34 * g.s} fill="#fff" stroke="#999" strokeWidth={1 * g.s} />
                <rect width={16 * g.s} height={34 * g.s} fill="#d52b1e" />
                <rect x={50 * g.s} width={16 * g.s} height={34 * g.s} fill="#d52b1e" />
                <path d={`M${33 * g.s} ${6 * g.s} l${4 * g.s} ${8 * g.s} l${6 * g.s} ${-2 * g.s} l${-3 * g.s} ${8 * g.s} l${4 * g.s} ${2 * g.s} l${-11 * g.s} ${6 * g.s} l${-11 * g.s} ${-6 * g.s} l${4 * g.s} ${-2 * g.s} l${-3 * g.s} ${-8 * g.s} l${6 * g.s} ${2 * g.s} Z`} fill="#d52b1e" />
              </g>
            </g>
            {voters.map((v, i) => (
              <Person key={i} x={g.cx - 320 * g.s + i * 72 * g.s} y={g.ground + 14 * g.s} scale={g.sc} look={v.look} hat={v.hat} outfit="coat" pose="walk" phase={i * 1.2} />
            ))}
            {g.frame >= share && (
              <VoteBars
                x={g.x + 30 * g.s}
                y={g.y + 90 * g.s}
                scale={g.sc * 0.9}
                font={F}
                k={ramp(g.frame, share, share + 25)}
                items={[
                  { label: "อยู่กับแคนาดา", value: 76, color: "#d52b1e" },
                  { label: "แยกตัว", value: 24, color: "#9aa3ad" },
                ]}
              />
            )}
          </>
        );
      }}
    </InsetPanel>
  );
};

/* ---------------- Japan ---------------- */
export const JapanScene = ({ beat, gap }: { beat: Beat; gap: number }) => {
  const end = beat.end + gap;
  const ignite = wordFrame(beat, "ออก", 0.3) - 6;
  const phobos = wordFrame(beat, "โฟบอส", 0.4);
  const ret = wordFrame(beat, "สองพัน", 0.88);
  return (
    <InsetPanel id="japan" anchor={TANEGASHIMA} label="ทาเนกาชิมะ · ภาพประกอบ" start={beat.start + 20} end={end} sky={["#4a7fb5", "#d8ecf7"]} font={F}>
      {(g) => {
        const burn = ramp(g.frame, ignite, ignite + 8);
        const lift = interpolate(g.frame, [ignite + 12, end], [0, 1], clamp) ** 2 * 260 * g.s;
        const rx = g.cx + 40 * g.s;
        return (
          <>
            <CoastSkyline x={g.x} y={g.ground - 8 * g.s} w={g.W} s={g.s} />
            <Street g={g} color="#8a8a86" kerb="#a0a09b" marks={false} />
            <LaunchTower x={rx} y={g.ground + 4 * g.s} scale={g.sc} />
            <Rocket x={rx} y={g.ground - 4 * g.s} scale={g.sc} lift={lift} burn={burn} />
            {burn > 0 &&
              [-1, 0, 1].map((i) => <Smoke key={i} x={rx + i * 50 * g.s} y={g.ground - 4 * g.s} size={36 * g.s} seed={70 + i} wind={i * 0.5} k={burn} />)}
            {g.frame >= phobos && <MarsPhobos x={g.x + 110 * g.s} y={g.y + 120 * g.s} scale={g.sc * 1.1} p={ramp(g.frame, phobos, phobos + 12)} />}
            {g.frame >= ret && <InfoChip x={g.x + g.W - 210 * g.s} y={g.y + 130 * g.s} scale={g.sc * 0.85} label="ตัวอย่างกลับถึงโลก" value="ปี 2031" font={F} color="#4ea8de" />}
          </>
        );
      }}
    </InsetPanel>
  );
};

