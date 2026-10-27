// Page branding for ออเดอร์ตีสาม: cover 1640×624 and profile picture 1080×1080.
// The channel's mark is the order card at 03:00: an orange delivery box in the dark with two green ghost eyes inside.
import { AbsoluteFill } from "remotion";
import { BananaClump, C, Chibi, Scooter, Sky, Torch, UI, Wisps } from "./kit";

const OL = "#16100c";

// Delivery box with the lid ajar and green eyes in the gap — reads at 40 px as "orange box + eyes".
const GhostBox = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={330} rx={330} ry={40} fill="#000" opacity={0.45} />
    <rect x={-300} y={-120} width={600} height={450} rx={44} fill={C.app} stroke={OL} strokeWidth={16} />
    <rect x={-300} y={20} width={600} height={56} fill="#ffe2b8" opacity={0.9} />
    <rect x={-290} y={-230} width={580} height={110} fill="#06070d" />
    {[-1, 1].map((k) => (
      <g key={k}>
        <ellipse cx={k * 110} cy={-176} rx={70} ry={36} fill={C.tani} opacity={0.55} />
        <ellipse cx={k * 110} cy={-176} rx={40} ry={17} fill="#d9ffe8" />
        <ellipse cx={k * 110} cy={-174} rx={12} ry={15} fill="#0b2a18" />
      </g>
    ))}
    <path d="M-320,-230 L320,-230 L320,-290 Q320,-310 300,-310 L-300,-310 Q-320,-310 -320,-290 Z" fill={C.appDeep} stroke={OL} strokeWidth={16} transform="rotate(-6,-320,-230)" />
    <path d={`M-150,-60 h300`} stroke={C.appDeep} strokeWidth={14} strokeLinecap="round" />
    <text x={0} y={250} textAnchor="middle" fontFamily={UI} fontWeight={800} fontSize={120} fill="#fff">03:00</text>
  </g>
);

export const OrderPageProfile = () => (
  <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #1c2a52 0%, #070a16 70%)" }}>
    <svg width={1080} height={1080} viewBox="0 0 1080 1080">
      <circle cx={540} cy={470} r={420} fill={C.tani} opacity={0.07} />
      <Wisps f={40} n={10} />
      <GhostBox x={540} y={540} s={1.12} />
    </svg>
  </AbsoluteFill>
);

// Cover: rider and headlight on the left, the banana clump and Nang Tani on the right, the name in the middle
// (phones keep the middle ~1100 px; the desktop profile picture covers the bottom-left corner, so keep it quiet).
export const OrderPageCover = () => (
  <AbsoluteFill style={{ background: "#05060c" }}>
    <svg width={1640} height={624} viewBox="0 0 1640 624">
      <g transform="scale(1.52,0.325)">
        <Sky id="cv" top="#03050d" bottom="#1a2446" moon={false} />
      </g>
      <circle cx={1400} cy={110} r={46} fill="#fdf1cf" />
      <circle cx={1400} cy={110} r={120} fill="#fdf1cf" opacity={0.12} />
      <rect y={520} width={1640} height={104} fill="#10140f" />
      <g transform="translate(0,0)">
        <BananaClump x={1480} y={560} s={0.5} f={30} glow={0.9} cloth />
        <g opacity={0.92}>
          <Chibi who="tani" x={1345} y={535} s={0.4} f={30} mood="sad" look={-1} float={40} />
        </g>
      </g>
      <Torch x={500} y={440} angle={-4} len={900} spread={22} k={0.25} />
      <Scooter x={400} y={560} s={0.36} light={false} />
      <Chibi who="kaeng" x={330} y={578} s={0.38} f={0} mood="scared" look={1} helmet />
      <Wisps f={80} n={18} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: UI }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#ffd0a8", letterSpacing: 1 }}>เรื่องผีไทย · แอนิเมชันเล่าเรื่อง</div>
      <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1.1, color: "#fff", textShadow: `0 0 26px ${C.app}, 0 0 70px ${C.app}` }}>ออเดอร์ตีสาม</div>
      <div style={{ marginTop: 18, fontSize: 40, fontWeight: 700, color: "#dfffe9", textShadow: `0 0 18px ${C.taniDeep}` }}>ทุกคืนตีสาม มีออเดอร์จากลูกค้าที่ไม่มีชื่อ</div>
      <div style={{ marginTop: 22, display: "inline-block", fontSize: 30, fontWeight: 800, color: "#fff", background: C.app, borderRadius: 30, padding: "6px 30px", border: `4px solid ${OL}` }}>
        ผีไทยตอนละตน · กดติดตามไว้ ออเดอร์ต่อไปกำลังเด้ง
      </div>
    </div>
  </AbsoluteFill>
);
