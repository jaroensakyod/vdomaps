// ออเดอร์ตีสาม — drawing kit: chibi cast, night street, banana grove, phone UI, rule notes. All SVG on a 1080×1920 stage.
import type { ReactNode } from "react";
import { loadFont as loadMali } from "@remotion/google-fonts/Mali";
import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";

export const HAND = loadMali("normal", { weights: ["600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const UI = loadKanit("normal", { weights: ["500", "700", "800"], subsets: ["thai", "latin"] }).fontFamily;

export const W = 1080;
export const H = 1920;
export const OL = "#16100c";
export const C = {
  app: "#ff7a1a",
  appDeep: "#d9530a",
  night: "#0a1022",
  night2: "#141c38",
  tani: "#5fe39a",
  taniDeep: "#2f8f57",
  cherd: "#ffb03a",
  red: "#e8463a",
  paper: "#f3ead6",
};

const rad = (d: number) => (d * Math.PI) / 180;
export const wave = (f: number, period: number, phase = 0) => Math.sin((f / period) * Math.PI * 2 + phase);

// ---------- cast ----------
export type Who = "kaeng" | "cherd" | "youngCherd" | "tani" | "boy" | "tonKid";
export type Mood = "neutral" | "scared" | "sad" | "shock" | "smile" | "grim";
export type Arm = [number, number]; // shoulder angle from straight down (outward +), elbow bend (outward +)

const LOOK: Record<Who, { skin: string; hair: string; top: string; topDark: string; pants: string }> = {
  kaeng: { skin: "#e3a979", hair: "#1b1716", top: C.app, topDark: C.appDeep, pants: "#2a3350" },
  cherd: { skin: "#c88a5a", hair: "#bdb7ad", top: "#5d6a4c", topDark: "#434d36", pants: "#3a3530" },
  youngCherd: { skin: "#c88a5a", hair: "#1b1716", top: "#c46a2b", topDark: "#94491a", pants: "#3a3530" },
  tani: { skin: "#ece6d6", hair: "#0e0c0b", top: "#3f9a5a", topDark: "#2b7443", pants: "#2c6b40" },
  boy: { skin: "#b9d3d8", hair: "#0d1416", top: "#dfe8ea", topDark: "#b4c3c6", pants: "#2b4a66" },
  tonKid: { skin: "#e0a676", hair: "#1b1716", top: "#e8b53a", topDark: "#b98a1f", pants: "#4a3a2a" },
};

const limbPath = (x: number, y: number, side: number, [a1, a2]: Arm, l1: number, l2: number) => {
  const ex = x + side * Math.sin(rad(a1)) * l1;
  const ey = y + Math.cos(rad(a1)) * l1;
  const hx = ex + side * Math.sin(rad(a1 + a2)) * l2;
  const hy = ey + Math.cos(rad(a1 + a2)) * l2;
  return { d: `M${x},${y} L${ex},${ey} L${hx},${hy}`, hx, hy };
};

const ArmG = ({ x, y, side, arm, color, skin }: { x: number; y: number; side: number; arm: Arm; color: string; skin: string }) => {
  const { d, hx, hy } = limbPath(x, y, side, arm, 105, 95);
  return (
    <g>
      <path d={d} stroke={OL} strokeWidth={56} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={25} fill={skin} stroke={OL} strokeWidth={7} />
    </g>
  );
};

const Eyes = ({ mood, look, blink, pale }: { mood: Mood; look: number; blink: boolean; pale?: boolean }) => {
  const wide = mood === "shock" || mood === "scared";
  const rx = wide ? 34 : 30;
  const ry = blink ? 3 : wide ? 42 : mood === "sad" || mood === "grim" ? 26 : 36;
  const ir = mood === "shock" ? 13 : mood === "scared" ? 15 : 19;
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={s * 52} cy={-548} rx={rx} ry={ry} fill="#fff" stroke={OL} strokeWidth={6} />
          {!blink && (
            <>
              <circle cx={s * 52 + look * 9} cy={-544 + (mood === "sad" ? 6 : 0)} r={ir} fill={pale ? "#1d3b2a" : "#1d1712"} />
              <circle cx={s * 52 + look * 9 - 6} cy={-551} r={6} fill="#fff" />
            </>
          )}
          {(mood === "sad" || mood === "grim") && !blink && (
            <path d={`M${s * 52 - 34},${-560} Q${s * 52},${-574} ${s * 52 + 34},${-560}`} fill={pale ? LOOK.tani.skin : "none"} stroke={OL} strokeWidth={6} />
          )}
        </g>
      ))}
    </g>
  );
};

const Brows = ({ mood, color }: { mood: Mood; color: string }) => {
  const tilt = mood === "scared" || mood === "sad" ? 16 : mood === "grim" ? -14 : mood === "shock" ? 0 : 4;
  const lift = mood === "shock" ? -18 : mood === "scared" ? -8 : 0;
  return (
    <g stroke={color} strokeWidth={11} strokeLinecap="round">
      <line x1={-80} y1={-598 + lift + tilt * 0.6} x2={-28} y2={-602 + lift - tilt * 0.6} />
      <line x1={80} y1={-598 + lift + tilt * 0.6} x2={28} y2={-602 + lift - tilt * 0.6} />
    </g>
  );
};

const Mouth = ({ mood, talk }: { mood: Mood; talk: number }) => {
  if (talk > 0.05) return <ellipse cx={0} cy={-472} rx={18 + talk * 4} ry={5 + talk * 15} fill="#5a1d1a" stroke={OL} strokeWidth={6} />;
  if (mood === "shock") return <ellipse cx={0} cy={-470} rx={17} ry={22} fill="#5a1d1a" stroke={OL} strokeWidth={6} />;
  if (mood === "scared") return <path d="M-26,-468 q8,-10 13,0 q8,10 13,0 q8,-10 13,0 q6,8 13,0" fill="none" stroke={OL} strokeWidth={6} strokeLinecap="round" />;
  if (mood === "sad" || mood === "grim") return <path d="M-24,-462 Q0,-480 24,-462" fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />;
  if (mood === "smile") return <path d="M-26,-478 Q0,-452 26,-478" fill="none" stroke={OL} strokeWidth={7} strokeLinecap="round" />;
  return <line x1={-18} y1={-470} x2={18} y2={-470} stroke={OL} strokeWidth={7} strokeLinecap="round" />;
};

export type ChibiProps = {
  who: Who;
  x: number;
  y: number;
  s?: number;
  f?: number;
  mood?: Mood;
  look?: number;
  armL?: Arm;
  armR?: Arm;
  talk?: number;
  flip?: boolean;
  walk?: number;
  helmet?: boolean;
  float?: number;
  back?: boolean;
  noLegs?: boolean;
};

export const Chibi = ({ who, x, y, s = 1, f = 0, mood = "neutral", look = 0, armL = [8, 6], armR = [8, 6], talk = 0, flip = false, walk = -1, helmet = false, float = 0, back = false, noLegs = false }: ChibiProps) => {
  const L = LOOK[who];
  const ghost = who === "tani";
  const breathe = wave(f, 70) * 4;
  const blink = f % 97 > 92;
  const step = walk >= 0 ? Math.sin(walk) : 0;
  const bob = walk >= 0 ? Math.abs(Math.cos(walk)) * -10 : 0;
  const hover = ghost ? wave(f, 80) * 10 - float : 0;
  return (
    <g transform={`translate(${x},${y + bob + hover}) scale(${flip ? -s : s},${s})`}>
      {/* shadow */}
      {!ghost && <ellipse cx={0} cy={6 - bob} rx={150} ry={22} fill="#000" opacity={0.35} />}
      {/* long hair behind */}
      {ghost && <path d="M-150,-600 C-190,-380 -170,-250 -120,-170 L120,-170 C170,-250 190,-380 150,-600 Z" fill={L.hair} stroke={OL} strokeWidth={6} />}
      {/* legs / skirt */}
      {ghost ? (
        <g>
          <path d="M-112,-260 L-128,-24 Q0,-6 128,-24 L112,-260 Z" fill={L.pants} stroke={OL} strokeWidth={7} />
          <path d="M-124,-70 Q0,-52 124,-70 L127,-38 Q0,-20 -127,-38 Z" fill="#d8b04a" stroke={OL} strokeWidth={5} />
          {[-1, 1].map((sd) => (
            <ellipse key={sd} cx={sd * 42} cy={8} rx={34} ry={16} fill={L.skin} stroke={OL} strokeWidth={6} />
          ))}
        </g>
      ) : noLegs ? null : (
        [-1, 1].map((sd) => (
          <g key={sd} transform={`rotate(${sd * step * 18},${sd * 45},-210)`}>
            <rect x={sd * 45 - 32} y={-215} width={64} height={205} rx={26} fill={L.pants} stroke={OL} strokeWidth={7} />
            <ellipse cx={sd * 45 + sd * 10} cy={-8} rx={44} ry={22} fill="#1e1b1b" stroke={OL} strokeWidth={6} />
          </g>
        ))
      )}
      {/* back arm */}
      <ArmG x={-100} y={-405 + breathe} side={-1} arm={armL} color={L.top} skin={L.skin} />
      {/* body */}
      <path d={`M-108,${-430 + breathe} Q0,${-452 + breathe} 108,${-430 + breathe} L122,-200 Q0,-184 -122,-200 Z`} fill={L.top} stroke={OL} strokeWidth={7} />
      {who === "kaeng" && !back && (
        <g>
          <line x1={0} y1={-430 + breathe} x2={0} y2={-196} stroke={OL} strokeWidth={5} />
          <rect x={-120} y={-300} width={240} height={22} fill="#ffe2b8" opacity={0.85} />
          <path d={`M-60,${-440 + breathe} L0,${-400 + breathe} L60,${-440 + breathe}`} fill="none" stroke={C.appDeep} strokeWidth={14} />
          <text x={60} y={-350} fontSize={26} fontWeight={800} fontFamily={UI} fill="#fff" textAnchor="middle">ส่งไว</text>
        </g>
      )}
      {(who === "cherd" || who === "youngCherd") && !back && (
        <g>
          <path d={`M-46,${-436 + breathe} L-40,-200 L40,-200 L46,${-436 + breathe} Z`} fill={who === "cherd" ? "#b86a32" : "#f2a03a"} stroke={OL} strokeWidth={5} />
          {who === "cherd" && (
            <>
              <path d={`M-96,${-440 + breathe} Q0,${-392 + breathe} 96,${-440 + breathe}`} fill="none" stroke="#3a5aa0" strokeWidth={30} />
              <path d={`M-96,${-440 + breathe} Q0,${-392 + breathe} 96,${-440 + breathe}`} fill="none" stroke="#d24a3c" strokeWidth={30} strokeDasharray="16 16" />
              <line x1={0} y1={-410} x2={0} y2={-352} stroke="#c9a43c" strokeWidth={3} />
              <rect x={-15} y={-354} width={30} height={40} rx={6} fill="#e7c25a" stroke={OL} strokeWidth={4} />
            </>
          )}
        </g>
      )}
      {ghost && <path d={`M-108,${-430 + breathe} L108,-300 L112,-260 L-112,-330 Z`} fill="#c9a43a" opacity={0.85} />}
      {/* head */}
      <g transform={`translate(0,${breathe * 0.6})`}>
        {(who === "cherd" || who === "youngCherd" || who === "kaeng" || who === "boy" || who === "tonKid") && (
          <>
            <circle cx={-148} cy={-540} r={26} fill={L.skin} stroke={OL} strokeWidth={6} />
            <circle cx={148} cy={-540} r={26} fill={L.skin} stroke={OL} strokeWidth={6} />
          </>
        )}
        <circle cx={0} cy={-560} r={150} fill={L.skin} stroke={OL} strokeWidth={7} />
        {back ? (
          <path d="M-152,-570 A152,152 0 0 1 152,-570 L150,-500 Q0,-430 -150,-500 Z" fill={L.hair} stroke={OL} strokeWidth={6} />
        ) : (
          <>
            {who === "kaeng" && !helmet && <path d="M-150,-580 Q-140,-720 0,-716 Q140,-720 150,-580 L120,-610 L95,-640 L70,-606 L40,-648 L10,-608 L-25,-650 L-55,-606 L-90,-640 L-118,-604 Z" fill={L.hair} stroke={OL} strokeWidth={6} />}
            {(who === "youngCherd" || who === "tonKid") && <path d="M-150,-575 Q-150,-715 0,-715 Q150,-715 150,-575 Q80,-640 -10,-628 Q-90,-620 -150,-575 Z" fill={L.hair} stroke={OL} strokeWidth={6} />}
            {who === "boy" && (
              <>
                <path d="M-152,-560 Q-160,-716 0,-718 Q160,-716 152,-560 L130,-600 L118,-540 L96,-610 L70,-560 L44,-622 L14,-566 L-16,-626 L-46,-568 L-74,-620 L-100,-560 L-120,-612 L-136,-546 Z" fill={L.hair} stroke={OL} strokeWidth={6} />
                {[-90, 20, 110].map((dx, i) => (
                  <path key={i} d={`M${dx},${-520 + ((f * 4 + i * 40) % 120)} q8,14 0,20 q-8,-6 0,-20 Z`} fill="#8fd4ff" opacity={0.8} />
                ))}
              </>
            )}
            {who === "cherd" && (
              <>
                <path d="M-152,-560 Q-160,-660 -96,-676 Q-120,-620 -128,-560 Z M152,-560 Q160,-660 96,-676 Q120,-620 128,-560 Z" fill={L.hair} stroke={OL} strokeWidth={5} />
                <path d="M-50,-640 Q0,-652 50,-640" fill="none" stroke="#8b5a36" strokeWidth={5} />
                <path d="M-44,-498 Q0,-520 44,-498 Q30,-484 0,-494 Q-30,-484 -44,-498 Z" fill="#cfc9bd" stroke={OL} strokeWidth={5} />
              </>
            )}
            {ghost && (
              <>
                <path d="M-152,-560 Q-150,-716 0,-716 Q150,-716 152,-560 Q100,-650 0,-648 Q-100,-650 -152,-560 Z" fill={L.hair} stroke={OL} strokeWidth={6} />
                <circle cx={0} cy={-724} r={52} fill={L.hair} stroke={OL} strokeWidth={6} />
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx={-40 + i * 22} cy={-750 + (i % 2) * 10} r={11} fill="#fffbe8" stroke={OL} strokeWidth={3} />
                ))}
              </>
            )}
            <Brows mood={mood} color={who === "cherd" ? "#8f887d" : L.hair} />
            <Eyes mood={mood} look={look} blink={blink && mood !== "shock"} pale={ghost || who === "boy"} />
            {who !== "cherd" && <Mouth mood={mood} talk={talk} />}
            {who === "cherd" && talk > 0.05 && <ellipse cx={0} cy={-478} rx={14} ry={4 + talk * 9} fill="#5a1d1a" stroke={OL} strokeWidth={5} />}
            {(mood === "scared" || mood === "shock") && !ghost && <path d="M118,-626 q14,26 0,40 q-14,-14 0,-40 Z" fill="#8fd4ff" stroke={OL} strokeWidth={4} />}
            {who === "cherd" && <path d="M-110,-520 l22,8 M110,-520 l-22,8" stroke="#8b5a36" strokeWidth={5} />}
            {ghost && <ellipse cx={0} cy={-470} rx={14} ry={6} fill="#7a2f3a" opacity={0.8} />}
          </>
        )}
        {helmet && who === "kaeng" && (
          <g>
            <path d="M-162,-560 Q-160,-736 0,-738 Q160,-736 162,-560 Z" fill={C.app} stroke={OL} strokeWidth={7} />
            <rect x={-170} y={-578} width={340} height={30} rx={14} fill={C.appDeep} stroke={OL} strokeWidth={6} />
            <g transform="translate(70,-660)">
              <circle r={26} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M-20,-14 L-14,-34 L-4,-20 M20,-14 L14,-34 L4,-20" fill="#fff" stroke={OL} strokeWidth={4} />
              <circle cx={-9} cy={-2} r={4} fill={OL} />
              <circle cx={9} cy={-2} r={4} fill={OL} />
            </g>
          </g>
        )}
      </g>
      {/* front arm */}
      <ArmG x={100} y={-405 + breathe} side={1} arm={armR} color={L.top} skin={L.skin} />
    </g>
  );
};

// ---------- environment ----------
export const Sky = ({ id, top = "#050816", bottom = "#1b2347", moon = true, mx = 820, my = 300 }: { id: string; top?: string; bottom?: string; moon?: boolean; mx?: number; my?: number }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      <radialGradient id={`${id}-moon`}>
        <stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} />
        <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-sky)`} />
    {Array.from({ length: 46 }, (_, i) => (
      <circle key={i} cx={(i * 397) % W} cy={(i * 211) % 900} r={i % 5 === 0 ? 3 : 1.6} fill="#fff" opacity={0.25 + ((i * 7) % 10) / 20} />
    ))}
    {moon && (
      <>
        <circle cx={mx} cy={my} r={220} fill={`url(#${id}-moon)`} />
        <circle cx={mx} cy={my} r={70} fill="#fdf1cf" />
        <circle cx={mx - 18} cy={my - 12} r={14} fill="#eadbb0" />
        <circle cx={mx + 22} cy={my + 20} r={9} fill="#eadbb0" />
      </>
    )}
  </g>
);

export const Ground = ({ y, color = "#151a14", edge = "#222a1d" }: { y: number; color?: string; edge?: string }) => (
  <g>
    <rect x={-200} y={y} width={W + 400} height={H - y + 400} fill={color} />
    <rect x={-200} y={y} width={W + 400} height={14} fill={edge} />
  </g>
);

export const Poles = ({ y, shift = 0 }: { y: number; shift?: number }) => (
  <g>
    {[60, 620, 1180].map((px, i) => (
      <g key={i} transform={`translate(${((px + shift) % 1680) - 300},0)`}>
        <rect x={-10} y={y - 760} width={20} height={760} fill="#0b0d14" />
        <rect x={-70} y={y - 720} width={140} height={14} fill="#0b0d14" />
      </g>
    ))}
    {[0, 1, 2].map((k) => (
      <path key={k} d={`M-200,${y - 700 + k * 22} Q540,${y - 600 + k * 22} 1280,${y - 700 + k * 22}`} stroke="#0b0d14" strokeWidth={4} fill="none" />
    ))}
  </g>
);

export const Shophouses = ({ y, lit = 0.6, shift = 0 }: { y: number; lit?: number; shift?: number }) => (
  <g transform={`translate(${shift},0)`}>
    {Array.from({ length: 7 }, (_, i) => {
      const x = -200 + i * 230;
      const h = 420 + ((i * 97) % 160);
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={220} height={h} fill={i % 2 ? "#161b2c" : "#1a2033"} />
          {[0, 1].map((r) =>
            [0, 1].map((c) => (
              <rect key={`${r}${c}`} x={x + 30 + c * 100} y={y - h + 60 + r * 140} width={60} height={80} fill={(i + r + c) % 3 === 0 ? "#f3c76b" : "#0d1120"} opacity={(i + r + c) % 3 === 0 ? lit : 1} />
            )),
          )}
          <rect x={x + 20} y={y - 130} width={180} height={130} fill="#0d1120" />
          {Array.from({ length: 9 }, (_, k) => (
            <line key={k} x1={x + 20} y1={y - 120 + k * 13} x2={x + 200} y2={y - 120 + k * 13} stroke="#222a40" strokeWidth={3} />
          ))}
        </g>
      );
    })}
  </g>
);

export const Store = ({ y }: { y: number }) => (
  <g>
    <defs>
      <radialGradient id="store-spill" cx="0.5" cy="0" r="0.9">
        <stop offset="0" stopColor="#e8f7ff" stopOpacity={0.45} />
        <stop offset="1" stopColor="#e8f7ff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={40} y={y - 760} width={1000} height={760} fill="#d9dde3" stroke={OL} strokeWidth={8} />
    <rect x={40} y={y - 760} width={1000} height={120} fill="#2f8c5a" stroke={OL} strokeWidth={8} />
    <rect x={40} y={y - 650} width={1000} height={22} fill={C.app} />
    <text x={540} y={y - 680} fontFamily={UI} fontWeight={800} fontSize={66} fill="#fff" textAnchor="middle">ร้านสะดวกซื้อ · 24 ชม.</text>
    <rect x={90} y={y - 600} width={900} height={600} fill="#f4fbff" stroke={OL} strokeWidth={8} />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={120} y={y - 560 + r * 150} width={360} height={14} fill="#9aa4ae" />
        {Array.from({ length: 9 }, (_, k) => (
          <rect key={k} x={128 + k * 38} y={y - 610 + r * 150} width={28} height={50} rx={5} fill={["#e8463a", "#2f8c5a", "#ffb03a", "#3a7bd5"][(k + r) % 4]} />
        ))}
      </g>
    ))}
    <rect x={560} y={y - 560} width={380} height={560} fill="#cfe6f2" stroke={OL} strokeWidth={6} />
    <line x1={750} y1={y - 560} x2={750} y2={y} stroke={OL} strokeWidth={6} />
    <rect x={-200} y={y} width={1480} height={700} fill="url(#store-spill)" />
  </g>
);

export const Chair = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-110} y={-210} width={220} height={36} rx={12} fill="#2f7fd0" stroke={OL} strokeWidth={6} />
    <rect x={-110} y={-420} width={220} height={190} rx={22} fill="#2f7fd0" stroke={OL} strokeWidth={6} />
    {[-90, 90].map((lx) => (
      <rect key={lx} x={lx - 10} y={-180} width={20} height={180} fill="#2a6db3" stroke={OL} strokeWidth={5} />
    ))}
  </g>
);

export const Scooter = ({ x, y, s = 1, f = 0, flip = false, light = false, moving = false }: { x: number; y: number; s?: number; f?: number; flip?: boolean; light?: boolean; moving?: boolean }) => (
  <g transform={`translate(${x},${y + (moving ? wave(f, 6) * 2 : 0)}) scale(${flip ? -s : s},${s})`}>
    {light && <path d="M300,-250 L1500,-520 L1500,120 Z" fill="#fff3c4" opacity={0.22} />}
    {[-230, 250].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-85} r={85} fill="#1a1a1a" stroke={OL} strokeWidth={8} />
        <circle cx={wx} cy={-85} r={36} fill="#777" />
        <line x1={wx} y1={-85} x2={wx + Math.cos(f / 3) * 36} y2={-85 + Math.sin(f / 3) * 36} stroke="#333" strokeWidth={6} />
      </g>
    ))}
    <path d="M-330,-190 Q-300,-300 -120,-300 L120,-300 Q200,-300 240,-230 L320,-160 Q300,-120 250,-130 L-300,-130 Z" fill={C.app} stroke={OL} strokeWidth={8} />
    <path d="M140,-300 L240,-470 L280,-470" fill="none" stroke={OL} strokeWidth={22} strokeLinecap="round" />
    <circle cx={300} cy={-430} r={30} fill={light ? "#fff7c8" : "#e8d9a0"} stroke={OL} strokeWidth={6} />
    <rect x={-320} y={-560} width={240} height={250} rx={18} fill={C.app} stroke={OL} strokeWidth={8} />
    <rect x={-320} y={-470} width={240} height={30} fill="#fff" opacity={0.85} />
    <text x={-200} y={-500} fontFamily={UI} fontWeight={800} fontSize={44} fill="#fff" textAnchor="middle">ส่งไว</text>
  </g>
);

// Banana clump: trunks + big torn leaves that sway; `cloth` ties coloured ribbons.
export const BananaClump = ({ x, y, s = 1, f = 0, sway = 1, cloth = false, glow = 0, clothSway }: { x: number; y: number; s?: number; f?: number; sway?: number; cloth?: boolean; glow?: number; clothSway?: number }) => {
  const cs = clothSway ?? sway;
  const trunks = [-170, -60, 50, 150];
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {glow > 0 && <ellipse cx={0} cy={-500} rx={520} ry={620} fill={C.tani} opacity={0.12 * glow} />}
      {trunks.map((tx, i) => {
        const h = 520 + (i % 2) * 140;
        const a = wave(f, 50 + i * 7, i) * 3 * sway;
        return (
          <g key={i} transform={`rotate(${a},${tx},0)`}>
            <path d={`M${tx - 34},0 L${tx - 24},${-h} L${tx + 24},${-h} L${tx + 34},0 Z`} fill={i % 2 ? "#3e5a2a" : "#4b6b31"} stroke={OL} strokeWidth={7} />
            <path d={`M${tx - 10},-20 L${tx - 6},${-h + 20}`} stroke="#2e4420" strokeWidth={5} />
            {[0, 1, 2].map((k) => {
              const dir = (i + k) % 2 ? 1 : -1;
              const la = dir * (40 + k * 22) + wave(f, 36 + k * 5, i + k) * 7 * sway;
              return (
                <g key={k} transform={`translate(${tx},${-h + 10}) rotate(${la})`}>
                  <path d="M0,0 C60,-120 70,-330 0,-470 C-70,-330 -60,-120 0,0 Z" fill={k === 1 ? "#5f8f3a" : "#4f7d30"} stroke={OL} strokeWidth={6} />
                  <path d="M0,0 L0,-460" stroke="#c9d98a" strokeWidth={5} />
                  {[1, 2, 3].map((t) => (
                    <path key={t} d={`M${dir * 6},${-110 * t} L${dir * 54},${-110 * t - 30}`} stroke="#22331a" strokeWidth={6} />
                  ))}
                </g>
              );
            })}
            {cloth && (
              <g>
                {[
                  ["#3fbf6a", 0],
                  ["#ff6fa8", 1],
                  ["#ffd23a", 2],
                ].map(([col, k]) => {
                  const cy = -150 - (k as number) * 70 - i * 10;
                  const tail = wave(f, 20, i + (k as number)) * 18 * cs;
                  return (
                    <g key={k as number}>
                      <rect x={tx - 36} y={cy} width={72} height={26} fill={col as string} stroke={OL} strokeWidth={4} />
                      <path d={`M${tx + 30},${cy + 10} q30,${20 + tail} 10,${80 + tail} l22,-6 q10,${-50 - tail} -22,${-74}`} fill={col as string} stroke={OL} strokeWidth={4} />
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const Offerings = ({ x, y, s = 1, show = 1 }: { x: number; y: number; s?: number; show?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={show}>
    {[-70, 0].map((ox, i) => (
      <g key={i} transform={`translate(${ox},${-i * 10}) rotate(${i ? 12 : -8})`}>
        <ellipse cx={0} cy={-40} rx={46} ry={70} fill="#5c8f34" stroke={OL} strokeWidth={6} />
        <path d="M-40,-60 L40,-60 M-44,-20 L44,-20" stroke="#e8d7a8" strokeWidth={6} />
      </g>
    ))}
    <g transform="translate(110,0)">
      <rect x={-28} y={-150} width={56} height={150} rx={14} fill="#d8232f" stroke={OL} strokeWidth={6} opacity={0.92} />
      <rect x={-16} y={-182} width={32} height={36} fill="#d8232f" stroke={OL} strokeWidth={5} />
      <rect x={-28} y={-100} width={56} height={40} fill="#fff4d8" />
      <text x={0} y={-72} fontSize={22} fontFamily={UI} fontWeight={700} textAnchor="middle" fill="#b0101c">น้ำแดง</text>
      <line x1={6} y1={-182} x2={30} y2={-250} stroke="#f2f2f2" strokeWidth={8} />
    </g>
  </g>
);

export const LotteryStack = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i} transform={`rotate(${(i - 3) * 7}) translate(${i * 6},${-i * 8})`}>
        <rect x={-130} y={-80} width={260} height={150} rx={6} fill={i % 2 ? "#e9dfc1" : "#ddd0ab"} stroke={OL} strokeWidth={5} />
        <rect x={-110} y={-60} width={110} height={18} fill="#b54a4a" opacity={0.6} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={-110} y={-20 + k * 24} width={200 - k * 40} height={10} fill="#8d8270" opacity={0.6} />
        ))}
        <rect x={20} y={-62} width={90} height={26} rx={4} fill="#8d8270" opacity={0.35} />
      </g>
    ))}
  </g>
);

export const Incense = ({ x, y, f = 0, s = 1 }: { x: number; y: number; f?: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-18, 0, 18].map((ix, i) => (
      <g key={i}>
        <line x1={ix} y1={0} x2={ix * 1.6} y2={-200} stroke="#b4442a" strokeWidth={6} />
        <circle cx={ix * 1.6} cy={-202} r={6} fill="#ff8a3a" />
        <path d={`M${ix * 1.6},-210 q${20 + wave(f, 40, i) * 20},-60 0,-120 q${-20 + wave(f, 33, i) * 20},-60 10,-130`} stroke="#cfd6e0" strokeWidth={5} fill="none" opacity={0.45} />
      </g>
    ))}
  </g>
);

// ---------- phone & app ----------
export const Phone = ({ x, y, s = 1, rot = 0, children, glow = true }: { x: number; y: number; s?: number; rot?: number; children: ReactNode; glow?: boolean }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    {glow && <rect x={-330} y={-560} width={660} height={1120} rx={120} fill={C.app} opacity={0.12} />}
    <rect x={-270} y={-500} width={540} height={1000} rx={70} fill="#0e0f12" stroke={OL} strokeWidth={10} />
    <rect x={-245} y={-470} width={490} height={940} rx={50} fill="#f6f3ee" />
    <rect x={-60} y={-462} width={120} height={22} rx={11} fill="#0e0f12" />
    <g>{children}</g>
  </g>
);

export type OrderProps = { time: string; items: string[]; fee: string; note?: string; typed?: number; status?: string; dots?: number; accept?: number; place?: string };

export const OrderCard = ({ time, items, fee, note, typed = 1, status, dots = 0, accept = 0, place }: OrderProps) => {
  const shown = note ? [...note].slice(0, Math.round([...note].length * typed)).join("") : "";
  return (
    <g fontFamily={UI}>
      <rect x={-245} y={-430} width={490} height={130} fill={C.app} />
      <text x={-210} y={-372} fontSize={34} fontWeight={800} fill="#fff">ส่งไว · ออเดอร์ใหม่</text>
      <text x={210} y={-372} fontSize={34} fontWeight={700} fill="#fff" textAnchor="end">{time}</text>
      <text x={-210} y={-326} fontSize={24} fontWeight={500} fill="#ffe1c6">{place ?? "ลูกค้ารอรับ"}</text>
      <circle cx={-170} cy={-230} r={44} fill="#c9c4bb" />
      <circle cx={-170} cy={-246} r={16} fill="#a29c92" />
      <path d="M-200,-206 Q-170,-236 -140,-206" fill="#a29c92" />
      <text x={-108} y={-240} fontSize={34} fontWeight={700} fill="#222">ไม่ระบุชื่อ</text>
      <text x={-108} y={-198} fontSize={30} fill="#f5a623">★★★★★</text>
      {items.map((it, i) => (
        <text key={i} x={-210} y={-120 + i * 54} fontSize={34} fontWeight={500} fill="#333">• {it}</text>
      ))}
      <rect x={-210} y={-120 + items.length * 54 - 20} width={420} height={4} fill="#e2ddd4" />
      <text x={-210} y={-120 + items.length * 54 + 40} fontSize={30} fontWeight={500} fill="#555">ค่าส่ง</text>
      <text x={210} y={-120 + items.length * 54 + 44} fontSize={56} fontWeight={800} fill={C.appDeep} textAnchor="end">{fee}</text>
      {note !== undefined && (
        <g>
          <rect x={-215} y={110} width={430} height={150} rx={20} fill="#fff3e4" stroke="#f0c999" strokeWidth={3} />
          <text x={-195} y={150} fontSize={24} fontWeight={700} fill="#b5651d">หมายเหตุถึงไรเดอร์</text>
          <text x={-195} y={210} fontSize={36} fontWeight={700} fill="#3b2a1a">
            {shown.length > 13 ? shown.slice(0, 13) : shown}
          </text>
          <text x={-195} y={252} fontSize={36} fontWeight={700} fill="#3b2a1a">{shown.length > 13 ? shown.slice(13) : ""}</text>
        </g>
      )}
      {status ? (
        <g>
          <rect x={-215} y={300} width={430} height={120} rx={60} fill="#fff" stroke={C.app} strokeWidth={5} />
          <text x={0} y={374} fontSize={34} fontWeight={700} fill={C.appDeep} textAnchor="middle">
            {status}
            {".".repeat(dots)}
          </text>
        </g>
      ) : (
        <g>
          <rect x={-215} y={300} width={430} height={120} rx={60} fill={accept > 0.5 ? "#2f8c5a" : C.app} transform={`translate(0,${accept > 0 && accept < 0.5 ? 6 : 0})`} />
          <text x={0} y={378} fontSize={44} fontWeight={800} fill="#fff" textAnchor="middle">{accept > 0.5 ? "รับแล้ว ✓" : "กดรับออเดอร์"}</text>
        </g>
      )}
    </g>
  );
};

// ---------- overlays ----------
export const RuleNote = ({ n, lines, f, hl, x = 540, y = 760 }: { n: number; lines: string[]; f: number; hl?: number; x?: number; y?: number }) => {
  const k = Math.min(1, f / 10);
  return (
    <g transform={`translate(${x},${y}) rotate(${-3 + (1 - k) * -8}) scale(${0.7 + 0.3 * k})`} opacity={k} fontFamily={HAND}>
      <rect x={-430} y={-300} width={860} height={600} fill="#000" opacity={0.35} transform="translate(14,18)" />
      <rect x={-430} y={-300} width={860} height={600} fill={C.paper} stroke={OL} strokeWidth={6} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={-400} y1={-160 + i * 70} x2={400} y2={-160 + i * 70} stroke="#9fb6d6" strokeWidth={3} opacity={0.6} />
      ))}
      <line x1={-330} y1={-300} x2={-330} y2={300} stroke="#e7a3a3" strokeWidth={4} />
      <rect x={-90} y={-330} width={180} height={60} fill="#e9dcb0" opacity={0.85} transform="rotate(4)" />
      <text x={-300} y={-200} fontSize={58} fontWeight={700} fill="#1d2d6b">กฎของกะดึก ข้อ {n}</text>
      {lines.map((l, i) => {
        const vis = Math.min(1, Math.max(0, (f - 12 - i * 18) / 14));
        return (
          <g key={i} opacity={vis}>
            <text x={-300} y={-60 + i * 92} fontSize={62} fontWeight={700} fill={hl === i ? C.red : "#1d1d1d"}>
              {l}
            </text>
            {hl === i && <path d={`M-300,${-40 + i * 92} q300,${14} 640,0`} stroke={C.red} strokeWidth={8} fill="none" strokeDasharray={700} strokeDashoffset={700 * (1 - vis)} />}
          </g>
        );
      })}
      <text x={300} y={260} fontSize={36} fill="#555" textAnchor="end">— ลุงเชิด</text>
    </g>
  );
};

export const Chip = ({ text, f, y = 250, color = "rgba(12,12,18,0.85)", border = C.app }: { text: string; f: number; y?: number; color?: string; border?: string }) => {
  const k = Math.min(1, Math.max(0, f / 7));
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${0.6 + 0.4 * k})`,
        opacity: k,
      }}
    >
      <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 52, color: "#fff", background: color, border: `4px solid ${border}`, borderRadius: 26, padding: "6px 34px" }}>{text}</div>
    </div>
  );
};

// ---------- HUD cards (news-style data cards: pay, nights, clock, stamps, end card) ----------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const HUD = { card: "#f6efe0", ink: "#1d1a16", soft: "#8a8070", gold: "#d9a43a", pill: "#1d1a16" };

const HudCard = ({ label, f, x, y, w, accent = C.app, children }: { label: string; f: number; x: number; y: number; w: number; accent?: string; children: ReactNode }) => {
  const k = easeOut(f / 8);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: k,
        transform: `translateX(${(1 - k) * -60}px)`,
        background: HUD.card,
        borderLeft: `12px solid ${accent}`,
        borderRadius: 18,
        padding: "22px 30px 24px",
        boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
        fontFamily: UI,
        color: HUD.ink,
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: HUD.pill, color: "#fff", borderRadius: 24, padding: "4px 20px", fontSize: 28, fontWeight: 700 }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: accent }} />
        {label}
      </div>
      {children}
    </div>
  );
};

// counts from `from` to `value` over ~20 frames after the card lands; rate × n line when both given
export const PayCard = ({ value, f, from = 0, rate, n, unit = "฿", label = "ค่าจ้าง · PAY", note, x = 60, y = 300, accent = C.tani }: { value: number; f: number; from?: number; rate?: number; n?: number; unit?: string; label?: string; note?: string; x?: number; y?: number; accent?: string }) => {
  const v = Math.round(from + (value - from) * easeOut((f - 8) / 20));
  return (
    <HudCard label={label} f={f} x={x} y={y} w={560} accent={accent}>
      {rate !== undefined && n !== undefined && (
        <div style={{ marginTop: 14, fontSize: 44, fontWeight: 700, color: HUD.soft }}>
          {rate.toLocaleString("en-US")} × <span style={{ color: HUD.ink, fontSize: 60 }}>{n}</span> =
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
        <span style={{ fontSize: 130, fontWeight: 800, lineHeight: 1, color: accent }}>{v.toLocaleString("en-US")}</span>
        <span style={{ fontSize: 56, fontWeight: 700, color: HUD.soft }}>{unit}</span>
      </div>
      {note && <div style={{ marginTop: 8, fontSize: 34, fontWeight: 700 }}>{note}</div>}
    </HudCard>
  );
};

// boxes 1..total, the first `done` filled; the newest one pops in. stamp defaults to "เหลืออีก N คืน"
export const NightTrack = ({ done, f, total = 7, label = "คืนที่ · NIGHT", stamp, x = 60, y = 300, accent = HUD.gold }: { done: number; f: number; total?: number; label?: string; stamp?: string | false; x?: number; y?: number; accent?: string }) => {
  const pop = easeOut((f - 10) / 8);
  const left = total - done;
  const st = stamp === false ? null : stamp ?? (left > 0 ? `เหลืออีก ${left} คืน` : "ครบแล้ว");
  return (
    <HudCard label={label} f={f} x={x} y={y} w={640} accent={accent}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
        <span style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>{done}</span>
        <span style={{ fontSize: 56, fontWeight: 700, color: HUD.soft }}>/ {total}</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {Array.from({ length: total }, (_, i) => {
          const filled = i < done - 1 || (i === done - 1 && pop > 0.5);
          const s = i === done - 1 ? 1 + 0.35 * Math.sin(Math.PI * pop) : 1;
          return (
            <div key={i} style={{ width: 58, height: 58, borderRadius: 10, border: `4px solid ${HUD.ink}`, background: filled ? accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, transform: `scale(${s})` }}>
              {i + 1}
            </div>
          );
        })}
      </div>
      {st && (
        <div style={{ position: "absolute", right: 26, bottom: 96 }}>
          <StampMark text={st} f={f - 22} size={40} rot={-10} />
        </div>
      )}
    </HudCard>
  );
};

// minutes since midnight (pass an interpolated value to roll the clock); moon at night, sun 05:00–18:00
export const ClockCard = ({ min, f, label, x = 60, y = 300, accent = "#7f93d6" }: { min: number; f: number; label?: string; x?: number; y?: number; accent?: string }) => {
  const m = ((Math.floor(min) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  const day = m >= 300 && m < 1080;
  return (
    <HudCard label={label ?? (day ? "เช้า · DAY" : "กลางคืน · NIGHT")} f={f} x={x} y={y} w={470} accent={day ? HUD.gold : accent}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 10 }}>
        <svg width={76} height={76} viewBox="-40 -40 80 80">
          {day ? (
            <g>
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1={0} y1={-26} x2={0} y2={-36} stroke={HUD.gold} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45})`} />
              ))}
              <circle r={18} fill={HUD.gold} />
            </g>
          ) : (
            <path d="M8,-30 A30,30 0 1,0 30,8 A24,24 0 1,1 8,-30 Z" fill={HUD.ink} />
          )}
        </svg>
        <span style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>
          {hh}:{mm}
        </span>
      </div>
    </HudCard>
  );
};

// red rubber stamp that slams in (scale 2.2 → 1 in 5 frames, small shake). StampMark = inline, Stamp = placed on the stage
const StampMark = ({ text, f, size = 72, rot = -8, color = C.red }: { text: string; f: number; size?: number; rot?: number; color?: string }) => {
  if (f < 0) return null;
  const k = clamp01(f / 5);
  const shake = f >= 5 && f < 11 ? Math.sin(f * 2.4) * 6 * (1 - (f - 5) / 6) : 0;
  return (
    <div
      style={{
        display: "inline-block",
        transform: `translate(${shake}px,0) rotate(${rot}deg) scale(${2.2 - 1.2 * k})`,
        opacity: 0.25 + 0.7 * k,
        border: `${Math.max(4, size / 12)}px solid ${color}`,
        outline: `${Math.max(2, size / 24)}px solid ${color}`,
        outlineOffset: size / 10,
        borderRadius: size / 5,
        padding: `${size * 0.08}px ${size * 0.35}px`,
        fontFamily: UI,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.25,
        color,
        whiteSpace: "nowrap",
        background: "rgba(246,239,224,0.18)",
        textShadow: "0 0 1px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  );
};

export const Stamp = ({ text, f, x = 540, y = 760, size = 96, rot = -8, color = C.red }: { text: string; f: number; x?: number; y?: number; size?: number; rot?: number; color?: string }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }}>
    <StampMark text={text} f={f} size={size} rot={rot} color={color} />
  </div>
);

// SVG: hand-drawn red ellipse around a clue, drawn on over ~10 frames, two loose passes, then a soft pulse
export const ClueRing = ({ x, y, rx, ry, f, color = C.red, w = 9 }: { x: number; y: number; rx: number; ry: number; f: number; color?: string; w?: number }) => {
  const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const draw = easeOut(f / 10);
  const pulse = f > 12 ? 1 + 0.03 * Math.sin((f - 12) / 5) : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${pulse})`} fill="none" stroke={color} strokeLinecap="round">
      <ellipse rx={rx} ry={ry} transform="rotate(-4)" strokeWidth={w} strokeDasharray={len * 1.1} strokeDashoffset={len * 1.1 * (1 - draw)} />
      <ellipse rx={rx * 1.04} ry={ry * 0.95} transform="rotate(3)" strokeWidth={w * 0.55} opacity={0.7} strokeDasharray={len * 1.1} strokeDashoffset={len * 1.1 * (1 - clamp01((f - 4) / 10))} />
    </g>
  );
};

// big sound word ("ก๊อก ก๊อก ก๊อก!"): words pop in one by one with a jitter; `hot` = index of the word drawn in color
export const Onomato = ({ text, f, x = 540, y = 600, size = 120, rot = -6, color = "#fff", hot = -1, hotColor = C.red, gap = 6 }: { text: string; f: number; x?: number; y?: number; size?: number; rot?: number; color?: string; hot?: number; hotColor?: string; gap?: number }) => {
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, display: "flex", gap: size * 0.25, alignItems: "flex-end", whiteSpace: "nowrap" }}>
      {words.map((wd, i) => {
        const t = f - i * gap;
        if (t < 0) return null;
        const k = easeOut(t / 4);
        const jit = Math.sin(t * 3.1 + i) * 4 * Math.max(0, 1 - t / 14);
        return (
          <span
            key={i}
            style={{
              fontFamily: UI,
              fontWeight: 800,
              fontSize: size * (1 + i * 0.12),
              lineHeight: 1,
              color: i === hot ? hotColor : color,
              WebkitTextStroke: `${size / 9}px ${OL}`,
              paintOrder: "stroke fill",
              transform: `translate(${jit}px,${(1 - k) * 30 - i * size * 0.08}px) scale(${0.4 + 0.6 * k})`,
              opacity: k,
              display: "inline-block",
            }}
          >
            {wd}
          </span>
        );
      })}
    </div>
  );
};

// full-screen end card over the last scene: series · this episode ✓ · NEXT episode + teaser · comment question
export const EndCard = ({ f, series, tag = "GHOST SERIES", ep, next, teaser, question, accent = C.red, size = 130 }: { f: number; series: string; tag?: string; ep: string; next?: string; teaser?: string; question?: string; accent?: string; size?: number }) => {
  const at = (s: number) => easeOut((f - s) / 9);
  const row = (s: number) => ({ opacity: at(s), transform: `translateY(${(1 - at(s)) * 30}px)` });
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(8,6,6,${0.85 * at(0)}) 0%, rgba(8,6,6,${0.35 * at(0)}) 45%, rgba(8,6,6,${0.9 * at(0)}) 100%)`, fontFamily: UI, color: "#fff", textAlign: "center" }}>
      <div style={{ ...row(2), marginTop: 190, fontSize: 32, fontWeight: 700, letterSpacing: 3, color: "#d8cfbf" }}>• {tag}</div>
      <div style={{ ...row(5), marginTop: 10, fontSize: size, fontWeight: 800, lineHeight: 1.1, WebkitTextStroke: `10px ${OL}`, paintOrder: "stroke fill" }}>{series}</div>
      <div style={{ ...row(9), marginTop: 22 }}>
        <span style={{ background: "#fff", color: HUD.ink, borderRadius: 14, padding: "8px 30px", fontSize: 46, fontWeight: 800 }}>{ep} ✓</span>
      </div>
      {next && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240 }}>
          <div style={{ ...row(16), fontSize: 32, fontWeight: 700, color: "#d8cfbf" }}>ตอนต่อไป · NEXT</div>
          <div style={{ ...row(19), marginTop: 14 }}>
            <span style={{ background: accent, borderRadius: 14, padding: "8px 34px", fontSize: 64, fontWeight: 800 }}>{next}</span>
          </div>
          {teaser && <div style={{ ...row(24), marginTop: 30, fontSize: 44, fontWeight: 700, padding: "0 70px" }}>{teaser}</div>}
        </div>
      )}
      {question && (
        <div style={{ ...row(32), position: "absolute", left: 0, right: 0, top: 1640 }}>
          <span style={{ background: "rgba(255,255,255,0.92)", color: HUD.ink, borderRadius: 40, padding: "14px 40px", fontSize: 42, fontWeight: 700 }}>💬 {question}</span>
        </div>
      )}
    </div>
  );
};

export const Vignette = ({ k = 0.75 }: { k?: number }) => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={k} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#vig)" />
  </g>
);

export const Torch = ({ x, y, angle, len = 1500, spread = 26, k = 0.3 }: { x: number; y: number; angle: number; len?: number; spread?: number; k?: number }) => {
  const a1 = rad(angle - spread / 2);
  const a2 = rad(angle + spread / 2);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id={`torch-${Math.round(x)}-${Math.round(y)}`} cx={x} cy={y} r={len} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6cf" stopOpacity={k * 1.6} />
          <stop offset="1" stopColor="#fff6cf" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${x},${y} L${x + Math.cos(a1) * len},${y + Math.sin(a1) * len} L${x + Math.cos(a2) * len},${y + Math.sin(a2) * len} Z`} fill={`url(#torch-${Math.round(x)}-${Math.round(y)})`} />
    </g>
  );
};

export const Grain = ({ f }: { f: number }) => (
  <g pointerEvents="none" opacity={0.08}>
    <filter id={`grain-${f % 4}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 4} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter={`url(#grain-${f % 4})`} />
  </g>
);

export const Wisps = ({ f, color = C.tani, n = 14 }: { f: number; color?: string; n?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = (i * 173 + f * (0.6 + (i % 3) * 0.3)) % W;
      const y = 1900 - ((i * 291 + f * (1.4 + (i % 4) * 0.4)) % 1900);
      return <circle key={i} cx={x} cy={y} r={3 + (i % 3) * 2} fill={color} opacity={0.35 + 0.3 * wave(f, 30, i)} />;
    })}
  </g>
);

// ---------- river (EP2) ----------
export const Water = ({ y, f = 0, id, glow = 0 }: { y: number; f?: number; id: string; glow?: number }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14284a" />
        <stop offset="1" stopColor="#040a16" />
      </linearGradient>
    </defs>
    <rect x={-200} y={y} width={W + 400} height={H - y + 400} fill={`url(#${id}-water)`} />
    {Array.from({ length: 14 }, (_, i) => {
      const yy = y + 30 + i * i * 9;
      const off = ((f * (1 + i * 0.15) + i * 137) % 400) - 200;
      return <path key={i} d={`M${-100 + off},${yy} q140,-10 280,0 t280,0 t280,0 t280,0`} stroke="#5f86b8" strokeWidth={2 + i * 0.3} fill="none" opacity={0.25 + glow * 0.1} />;
    })}
    <ellipse cx={820} cy={y + 60} rx={140} ry={16} fill="#fdf1cf" opacity={0.18 + 0.06 * wave(f, 30)} />
  </g>
);

export const Orbs = ({ y, f = 0, n = 12, k = 1, color = "#7fd0ff" }: { y: number; f?: number; n?: number; k?: number; color?: string }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = 60 + ((i * 263) % 960);
      const yy = y + 40 + ((i * 97) % 260) + wave(f, 50 + i * 3, i) * 10;
      const on = Math.min(1, Math.max(0, k * n - i));
      return (
        <g key={i} opacity={on}>
          <circle cx={x} cy={yy} r={34} fill={color} opacity={0.15} />
          <circle cx={x} cy={yy} r={10 + (i % 3) * 3} fill="#d9f3ff" opacity={0.85} />
        </g>
      );
    })}
  </g>
);

export const TempleRoof = ({ x, y, s = 1, color = "#0b0f1c" }: { x: number; y: number; s?: number; color?: string }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={color}>
    <path d="M-420,0 L-300,-170 L300,-170 L420,0 Z" />
    <path d="M-300,-150 L-190,-300 L190,-300 L300,-150 Z" />
    <path d="M-300,-170 q-40,-30 -60,-90 q30,40 70,60 Z M300,-170 q40,-30 60,-90 q-30,40 -70,60 Z" />
    <path d="M-190,-300 q-30,-30 -40,-80 q25,35 55,55 Z M190,-300 q30,-30 40,-80 q-25,35 -55,55 Z" />
    <rect x={-360} y={0} width={720} height={320} />
  </g>
);

export const Sala = ({ x, y, s = 1, lamp = 1 }: { x: number; y: number; s?: number; lamp?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-300, -100, 100, 300].map((px) => (
      <rect key={px} x={px - 16} y={-420} width={32} height={420} fill="#5a3b24" stroke={OL} strokeWidth={6} />
    ))}
    <path d="M-400,-420 L-250,-600 L250,-600 L400,-420 Z" fill="#7a3b2a" stroke={OL} strokeWidth={8} />
    <path d="M-250,-600 L-150,-700 L150,-700 L250,-600 Z" fill="#8f4a33" stroke={OL} strokeWidth={8} />
    <path d="M-400,-420 q-50,-20 -70,-80 M400,-420 q50,-20 70,-80" stroke="#c99a3a" strokeWidth={14} fill="none" />
    <rect x={-360} y={-30} width={720} height={40} fill="#6b4a30" stroke={OL} strokeWidth={6} />
    {lamp > 0 && (
      <g>
        <circle cx={0} cy={-380} r={120} fill="#ffd38a" opacity={0.18 * lamp} />
        <rect x={-18} y={-410} width={36} height={50} rx={8} fill="#ffe7b8" opacity={lamp} stroke={OL} strokeWidth={4} />
      </g>
    )}
  </g>
);

export const Steps = ({ x, y, s = 1, n = 5 }: { x: number; y: number; s?: number; n?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-300 + i * 18} y={i * 50} width={600 - i * 36} height={50} fill={i < n - 2 ? "#8c8a84" : "#55606a"} stroke={OL} strokeWidth={5} />
    ))}
  </g>
);

export const Eggs = ({ x, y, s = 1, garland = true }: { x: number; y: number; s?: number; garland?: boolean }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={130} ry={34} fill="#4f7d30" stroke={OL} strokeWidth={5} />
    {[-40, 40].map((ex) => (
      <ellipse key={ex} cx={ex} cy={-36} rx={36} ry={46} fill="#fbf7ee" stroke={OL} strokeWidth={5} />
    ))}
    {garland && (
      <g transform="translate(130,-20)">
        <circle r={60} fill="none" stroke="#fffbe8" strokeWidth={22} strokeDasharray="12 6" />
        <circle r={60} fill="none" stroke={OL} strokeWidth={3} opacity={0.4} />
        <circle cx={0} cy={66} r={16} fill="#e8463a" stroke={OL} strokeWidth={4} />
        <path d="M-6,80 l-6,40 M6,80 l6,40" stroke="#e8463a" strokeWidth={6} />
      </g>
    )}
  </g>
);

export const Boat = ({ x, y, s = 1, tilt = 0 }: { x: number; y: number; s?: number; tilt?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M-360,-60 Q-340,40 -200,60 L200,60 Q340,40 360,-60 Z" fill="#6b4a30" stroke={OL} strokeWidth={8} />
    <path d="M-330,-40 L330,-40" stroke="#8c6a48" strokeWidth={10} />
  </g>
);

export const WetHand = ({ x, y, s = 1, rot = 0, color = "#b9d3d8" }: { x: number; y: number; s?: number; rot?: number; color?: string }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-40,120 L-40,0 Q-40,-30 -20,-30 L20,-30 Q40,-30 40,0 L40,120 Z" fill={color} stroke={OL} strokeWidth={6} />
    {[-30, -10, 10, 30].map((fx, i) => (
      <rect key={i} x={fx - 9} y={-80 + Math.abs(i - 1.5) * 10} width={18} height={60} rx={9} fill={color} stroke={OL} strokeWidth={5} />
    ))}
    <rect x={30} y={-20} width={50} height={18} rx={9} fill={color} stroke={OL} strokeWidth={5} transform="rotate(-30,30,-20)" />
  </g>
);
