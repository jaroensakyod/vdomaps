import type { ReactNode } from "react";

// Train-window pieces: a carriage wall with a glazed window, the era's scenery scrolling past outside in parallax
// layers, rain beading and streaking on the glass, a faint reflection of the carriage. 1080×1920 frame.
export const WIN = { x0: 110, y0: 330, x1: 970, y1: 1330, r: 54 };
export const WIN_W = WIN.x1 - WIN.x0;
export const GROUND = 1090; // where the far land meets the embankment, inside the window
export const C = { wall: "#a3cdb9", wallHi: "#c4e6d6", brass: "#c8a35a", brassLo: "#7c5f2c", rain: "#7f9bb0", signal: "#d2412f", cream: "#f1ead8", ink: "#141a17", wood: "#5b3a22" };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const hex = (h: string) => (h.startsWith("rgb") ? (h.match(/[0-9]+/g) ?? []).slice(0, 3).map(Number) : [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`;
};

// One era of the timeline: its sky (top, horizon), haze and whether lights are on.
export type Era = { year: string; event: string; sky: [string, string]; land: string; haze: string; night?: boolean };

// Train speed profile: cruising, slowing as each station sign passes the middle of the window. Returns the near
// layer's travelled distance (px) at `frame`. Stations are frames where a sign is centred in the window.
export const travel = (frame: number, stations: number[], cruise = 24, slow = 3.5, width = 34) => {
  let p = 0;
  for (let f = 0; f < frame; f++) {
    let k = 0;
    for (const s of stations) k = Math.max(k, Math.exp(-((f - s) ** 2) / (2 * width * width)));
    p += cruise - (cruise - slow) * k;
  }
  return p;
};
export const speedAt = (frame: number, stations: number[]) => travel(frame + 1, stations) - travel(frame, stations);

// Items of a parallax layer: world positions every `step` px; the layer moves `factor` × the near layer.
// `eraOf(worldX)` tells which era an item belongs to (so the scenery changes era as the train rolls on).
export const layerItems = (p: number, factor: number, step: number, margin = 400) => {
  const off = p * factor;
  const out: { i: number; x: number; wx: number }[] = [];
  for (let i = Math.floor((off - margin) / step); i <= Math.ceil((off + WIN_W + margin) / step); i++) out.push({ i, wx: i * step, x: WIN.x0 + i * step - off });
  return out;
};

export const WindowDefs = ({ blur, sky }: { blur: number; sky: [string, string] }) => (
  <defs>
    <clipPath id="tw-glass"><rect x={WIN.x0} y={WIN.y0} width={WIN_W} height={WIN.y1 - WIN.y0} rx={WIN.r} /></clipPath>
    <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={sky[0]} />
      <stop offset="1" stopColor={sky[1]} />
    </linearGradient>
    <linearGradient id="tw-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#c4e6d6" />
      <stop offset="0.35" stopColor={C.wall} />
      <stop offset="1" stopColor="#7aa995" />
    </linearGradient>
    <linearGradient id="tw-brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#f1d08a" />
      <stop offset="0.5" stopColor={C.brass} />
      <stop offset="1" stopColor={C.brassLo} />
    </linearGradient>
    <linearGradient id="tw-fog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.6" stopColor="#dfe8ee" stopOpacity={0} />
      <stop offset="1" stopColor="#dfe8ee" stopOpacity={0.32} />
    </linearGradient>
    <radialGradient id="tw-lamp" cx="0.5" cy="0" r="0.9">
      <stop offset="0" stopColor="#ffe3a6" stopOpacity={0.35} />
      <stop offset="1" stopColor="#ffe3a6" stopOpacity={0} />
    </radialGradient>
    <filter id="tw-near" x="-0.2" y="0" width="1.4" height="1"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
    <filter id="tw-mid" x="-0.2" y="0" width="1.4" height="1"><feGaussianBlur stdDeviation={`${blur * 0.25} 0.3`} /></filter>
    <filter id="tw-far"><feGaussianBlur stdDeviation={1.6} /></filter>
    <filter id="tw-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={4} />
      <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 0 0.1  0 0 0 0.12 0" />
    </filter>
    <filter id="tw-wood" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.18" numOctaves={3} seed={11} />
      <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.04  0 0 0 0.55 0" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
  </defs>
);

// The scenery inside the glass: sky, far, mid, embankment and near layers. Children go on top (inside the clip).
export const Outside = ({ children }: { children: ReactNode }) => (
  <g clipPath="url(#tw-glass)">
    <rect x={WIN.x0} y={WIN.y0} width={WIN_W} height={WIN.y1 - WIN.y0} fill="url(#tw-sky)" />
    {children}
  </g>
);

// Far layer: hills and tree lines (old eras) or a hazy skyline (city eras). It is so far away that it follows
// the era of the moment (`now`), not the era of the ground it stands on.
export const FarLand = ({ p, now }: { p: number; now: Era }) => (
  <g filter="url(#tw-far)">
    {layerItems(p, 0.06, 90).map(({ i, x, wx }) => {
      const e = now;
      void wx;
      const city = e.night || e.year >= "2525";
      const h = city ? 90 + rnd(i) * 170 : 40 + Math.sin(i * 0.55) * 26 + rnd(i) * 30;
      return city ? (
        <g key={i}>
          <rect x={x} y={GROUND - h} width={70 + rnd(i + 3) * 30} height={h} fill={e.haze} />
          {e.night && Array.from({ length: Math.floor(h / 26) }, (_, j) => <rect key={j} x={x + 10 + (j % 3) * 18} y={GROUND - h + 12 + j * 22} width={8} height={6} fill="#ffd77a" opacity={rnd(i * 9 + j) > 0.45 ? 0.8 : 0} />)}
        </g>
      ) : (
        <ellipse key={i} cx={x + 45} cy={GROUND - 6} rx={90} ry={h} fill={e.haze} />
      );
    })}
  </g>
);

// Mid layer: what stands beside the line in each era.
export const MidLand = ({ p, era, frame }: { p: number; era: (wx: number, f: number) => Era; frame: number }) => (
  <g filter="url(#tw-mid)">
    {layerItems(p, 0.34, 260).map(({ i, x, wx }) => {
      const e = era(wx, 0.34);
      const y = GROUND + 10;
      if (e.year === "2439") return <Stilt key={i} x={x} y={y} i={i} land={e.land} />;
      if (e.year === "2475") return <Shophouse key={i} x={x} y={y} i={i} />;
      if (e.year === "2525") return <Block key={i} x={x} y={y} i={i} />;
      return <Tower key={i} x={x} y={y} i={i} frame={frame} />;
    })}
  </g>
);

const Stilt = ({ x, y, i, land }: { x: number; y: number; i: number; land: string }) =>
  rnd(i) < 0.45 ? (
    <g fill={land}>
      {/* sugar palm */}
      <rect x={x + 120} y={y - 230} width={7} height={230} />
      {Array.from({ length: 9 }, (_, j) => <path key={j} d={`M${x + 123} ${y - 230} l${Math.cos(j * 0.7) * 60} ${Math.sin(j * 0.7) * 30 - 6} l-${Math.cos(j * 0.7) * 50} 6 Z`} />)}
    </g>
  ) : (
    <g>
      {[0, 1, 2, 3].map((j) => <rect key={j} x={x + 40 + j * 40} y={y - 70} width={6} height={70} fill="#2a2a22" />)}
      <rect x={x + 32} y={y - 128} width={140} height={60} fill="#6b5a3e" />
      <path d={`M${x + 14} ${y - 124} L${x + 102} ${y - 200} L${x + 190} ${y - 124} Z`} fill="#8c7a52" />
      <path d={`M${x + 14} ${y - 124} L${x + 102} ${y - 200} L${x + 190} ${y - 124}`} fill="none" stroke="#3a3122" strokeWidth={3} />
      <rect x={x + 88} y={y - 112} width={26} height={30} fill="#2a2418" />
    </g>
  );

const Shophouse = ({ x, y, i }: { x: number; y: number; i: number }) => {
  const tone = ["#a8876a", "#8f9c8a", "#b49a6e"][i % 3];
  return (
    <g>
      <rect x={x} y={y - 210} width={250} height={210} fill={tone} />
      <path d={`M${x - 10} ${y - 210} L${x + 125} ${y - 250} L${x + 260} ${y - 210} Z`} fill="#6e4b3a" />
      {[0, 1, 2, 3].map((j) => (
        <g key={j}>
          <rect x={x + 14 + j * 60} y={y - 186} width={40} height={52} fill="#3b2c22" />
          <rect x={x + 14 + j * 60} y={y - 186} width={20} height={52} fill="#5d6f63" />
          <rect x={x + 10 + j * 60} y={y - 96} width={50} height={96} fill={j % 2 ? "#4a3a2c" : "#2f2820"} />
        </g>
      ))}
      <rect x={x} y={y - 118} width={250} height={10} fill="#5a4636" />
      {i % 4 === 1 && <rect x={x + 250} y={y - 340} width={6} height={340} fill="#2b2b26" />}
    </g>
  );
};

const Block = ({ x, y, i }: { x: number; y: number; i: number }) => {
  const h = 280 + rnd(i) * 200;
  const tone = ["#c9bfae", "#a9b3b5", "#d1c49e"][i % 3];
  return (
    <g>
      <rect x={x} y={y - h} width={220} height={h} fill={tone} />
      {Array.from({ length: Math.floor(h / 46) }, (_, r) => <rect key={r} x={x + 14} y={y - h + 20 + r * 46} width={192} height={22} fill="#4f5d66" opacity={0.8} />)}
      {Array.from({ length: Math.floor(h / 46) }, (_, r) => <rect key={`b${r}`} x={x + 10} y={y - h + 44 + r * 46} width={200} height={4} fill="#7d7468" />)}
      {i % 3 === 0 && (
        <g>
          <rect x={x + 30} y={y - h - 110} width={170} height={90} fill={C.signal} />
          <rect x={x + 44} y={y - h - 96} width={90} height={14} fill={C.cream} />
          <rect x={x + 44} y={y - h - 72} width={120} height={10} fill={C.cream} opacity={0.7} />
          <rect x={x + 60} y={y - h - 20} width={6} height={20} fill="#333" />
          <rect x={x + 160} y={y - h - 20} width={6} height={20} fill="#333" />
        </g>
      )}
    </g>
  );
};

const Tower = ({ x, y, i, frame }: { x: number; y: number; i: number; frame: number }) => {
  const h = 420 + rnd(i) * 260;
  return (
    <g>
      <rect x={x + 10} y={y - h} width={180} height={h} fill="#1d2433" />
      {Array.from({ length: Math.floor(h / 34) }, (_, r) =>
        [0, 1, 2, 3, 4].map((c) => (rnd(i * 31 + r * 7 + c) > 0.38 ? <rect key={`${r}-${c}`} x={x + 22 + c * 34} y={y - h + 16 + r * 34} width={20} height={16} fill="#ffd37a" opacity={0.55 + 0.4 * rnd(r + c + i)} /> : null)),
      )}
      {/* the elevated line: viaduct beam and pillars, continuous through the city */}
      <rect x={x - 2} y={y - 170} width={264} height={30} fill="#3a4152" />
      <rect x={x + 110} y={y - 140} width={26} height={140} fill="#2c3240" />
      {i % 2 === 0 && <circle cx={x + 230} cy={y - 186} r={5} fill="#ff6a5a" opacity={0.6 + 0.4 * Math.sin(frame * 0.3)} />}
    </g>
  );
};

// Embankment strip with ballast dots and a low fence; per-era ground colour.
export const Embankment = ({ p, land, paddy = 0, sky }: { p: number; land: string; paddy?: number; sky?: string }) => {
  const off = (p * 0.7) % 60;
  return (
    <g>
      <rect x={WIN.x0} y={GROUND + 8} width={WIN_W} height={WIN.y1 - GROUND} fill={land} />
      {/* flooded rice fields: rows of seedlings and the sky caught in the water between them */}
      {paddy > 0 && (
        <g opacity={paddy}>
          {Array.from({ length: 7 }, (_, r) => {
            const y = GROUND + 14 + r * r * 2.2 + r * 4;
            const sp = 14 + r * 6;
            const o = (p * (0.36 + r * 0.05)) % sp;
            return (
              <g key={r}>
                <rect x={WIN.x0} y={y + 3} width={WIN_W} height={2 + r * 0.6} fill={sky ?? "#d8d2bf"} opacity={0.55} />
                {Array.from({ length: Math.ceil(WIN_W / sp) + 2 }, (_, j) => <rect key={j} x={WIN.x0 + j * sp - o} y={y - 3 - r * 0.6} width={2 + r * 0.5} height={4 + r} fill="#86a85a" />)}
              </g>
            );
          })}
        </g>
      )}
      <rect x={WIN.x0} y={GROUND + 120} width={WIN_W} height={WIN.y1 - GROUND} fill="#2b2a26" />
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={WIN.x0 + i * 60 - off} y={GROUND + 112} width={4} height={36} fill="#1b1a17" />)}
      <rect x={WIN.x0} y={GROUND + 118} width={WIN_W} height={3} fill="#1b1a17" />
    </g>
  );
};

// Near layer: telegraph poles with sagging wires and the station signs. Motion-blurred by the train's speed.
export const NearLayer = ({ p, signs, font }: { p: number; signs: { wx: number; era: Era }[]; font?: string }) => {
  const poles = layerItems(p, 1, 520, 600);
  return (
    <g filter="url(#tw-near)">
      {poles.map(({ i, x }) => (
        <g key={i}>
          <rect x={x - 7} y={WIN.y0 + 70} width={14} height={WIN.y1 - WIN.y0} fill="#17130f" />
          <rect x={x - 46} y={WIN.y0 + 96} width={92} height={10} fill="#17130f" />
          <path d={`M${x - 40} ${WIN.y0 + 100} Q${x + 220} ${WIN.y0 + 170} ${x + 480} ${WIN.y0 + 100} M${x + 40} ${WIN.y0 + 100} Q${x + 300} ${WIN.y0 + 160} ${x + 560} ${WIN.y0 + 100}`} fill="none" stroke="#17130f" strokeWidth={2.5} />
        </g>
      ))}
      {signs.map(({ wx, era }) => {
        const x = WIN.x0 + wx - p;
        return x > -700 && x < 1800 ? <StationSign key={era.year} x={x} era={era} font={font} /> : null;
      })}
    </g>
  );
};

// A station name-board on two posts: white enamel, a dark border, the year big, the event under it.
export const StationSign = ({ x, era, font }: { x: number; era: Era; font?: string }) => (
  <g>
    {/* platform edge */}
    <rect x={x - 520} y={GROUND + 150} width={1040} height={190} fill="#8c8678" />
    <rect x={x - 520} y={GROUND + 150} width={1040} height={14} fill="#e8d48a" />
    <rect x={x - 200} y={800} width={14} height={GROUND + 150 - 800} fill="#2a2a28" />
    <rect x={x + 186} y={800} width={14} height={GROUND + 150 - 800} fill="#2a2a28" />
    <rect x={x - 270} y={640} width={540} height={210} rx={10} fill="#1f3c6b" />
    <rect x={x - 258} y={652} width={516} height={186} rx={6} fill="#f6f2e6" />
    <text x={x} y={752} textAnchor="middle" fontFamily={font} fontSize={92} fontWeight={700} fill="#1f3c6b">พ.ศ. {era.year}</text>
    <text x={x} y={808} textAnchor="middle" fontFamily={font} fontSize={34} fontWeight={600} fill="#2a2a28">{era.event}</text>
  </g>
);

// Rain on the glass: beads that slide down in jerks and streak backwards with the train's speed.
export const Rain = ({ frame, speed }: { frame: number; speed: number }) => (
  <g clipPath="url(#tw-glass)">
    {Array.from({ length: 90 }, (_, i) => {
      const r = 3 + rnd(i + 5) * 7;
      const slide = Math.floor((frame + rnd(i) * 300) / (20 + rnd(i + 2) * 40)) * (6 + r);
      const x = WIN.x0 + ((rnd(i + 9) * WIN_W - slide * speed * 0.06 + WIN_W * 4) % WIN_W);
      const y = WIN.y0 + ((rnd(i + 17) * (WIN.y1 - WIN.y0) + slide) % (WIN.y1 - WIN.y0));
      const tail = speed * (0.8 + rnd(i) * 1.4);
      return (
        <g key={i}>
          <path d={`M${x} ${y} L${x + tail} ${y - tail * 0.28}`} stroke="#e6eef3" strokeWidth={r * 0.5} strokeLinecap="round" opacity={0.16} />
          <circle cx={x} cy={y} r={r} fill="#d9e4ea" opacity={0.2} />
          <path d={`M${x - r * 0.8} ${y + r * 0.2} A${r} ${r} 0 0 0 ${x + r * 0.8} ${y + r * 0.2}`} fill="none" stroke="#0e1512" strokeWidth={1.4} opacity={0.4} />
          <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.28} fill="#ffffff" opacity={0.75} />
        </g>
      );
    })}
  </g>
);

// Reflections on the inside of the glass: the carriage lamp and a passenger's profile, very faint.
export const Reflection = ({ opacity = 1 }: { opacity?: number }) => (
  <g clipPath="url(#tw-glass)" opacity={opacity}>
    <rect x={WIN.x0} y={WIN.y0} width={WIN_W} height={WIN.y1 - WIN.y0} fill="url(#tw-fog)" />
    <ellipse cx={330} cy={WIN.y0 + 60} rx={260} ry={70} fill="#ffe7b8" opacity={0.12} />
    <path d="M830 1330 L830 1120 Q826 1040 852 1004 Q838 960 846 920 Q872 860 930 870 Q980 880 990 940 L990 1330 Z" fill="#f4efe6" opacity={0.07} />
    <path d={`M${WIN.x0 + 40} ${WIN.y0} L${WIN.x0 + 200} ${WIN.y0} L${WIN.x0 - 60} ${WIN.y1} L${WIN.x0 - 220} ${WIN.y1} Z`} fill="#ffffff" opacity={0.05} />
  </g>
);

// The carriage wall around the window (painted panels, rivets, brass frame) and the wooden sill.
export const Carriage = ({ w = 1080 }: { w?: number }) => (
  <g>
    <path fillRule="evenodd" fill="url(#tw-wall)" d={`M0 0 H${w} V1920 H0 Z M${WIN.x0 + WIN.r} ${WIN.y0} H${WIN.x1 - WIN.r} A${WIN.r} ${WIN.r} 0 0 1 ${WIN.x1} ${WIN.y0 + WIN.r} V${WIN.y1 - WIN.r} A${WIN.r} ${WIN.r} 0 0 1 ${WIN.x1 - WIN.r} ${WIN.y1} H${WIN.x0 + WIN.r} A${WIN.r} ${WIN.r} 0 0 1 ${WIN.x0} ${WIN.y1 - WIN.r} V${WIN.y0 + WIN.r} A${WIN.r} ${WIN.r} 0 0 1 ${WIN.x0 + WIN.r} ${WIN.y0} Z`} />
    <rect x={0} y={0} width={w} height={1920} fill="url(#tw-lamp)" />
    {/* panel seams and rivets */}
    {[40, 1040].map((x) => <rect key={x} x={x} y={0} width={3} height={1920} fill="#4f7f6c" opacity={0.6} />)}
    {[230, 1560].map((y) => <rect key={y} x={0} y={y} width={w} height={3} fill="#4f7f6c" opacity={0.5} />)}
    {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={60 + (i % 12) * 87} cy={i < 12 ? 250 : 1580} r={5} fill="#e2f3ea" stroke="#4f7f6c" strokeWidth={1.5} />)}
    {/* brass frame: outer lip + rubber gasket */}
    <rect x={WIN.x0 - 18} y={WIN.y0 - 18} width={WIN_W + 36} height={WIN.y1 - WIN.y0 + 36} rx={WIN.r + 18} fill="none" stroke="url(#tw-brass)" strokeWidth={20} />
    <rect x={WIN.x0 - 4} y={WIN.y0 - 4} width={WIN_W + 8} height={WIN.y1 - WIN.y0 + 8} rx={WIN.r + 4} fill="none" stroke="#0b0d0c" strokeWidth={8} />
    <rect x={WIN.x0 - 30} y={WIN.y0 - 30} width={WIN_W + 60} height={WIN.y1 - WIN.y0 + 60} rx={WIN.r + 30} fill="none" stroke="#4f7f6c" strokeWidth={3} opacity={0.7} />
    {/* sill */}
    <rect x={60} y={WIN.y1 + 40} width={w - 120} height={70} rx={8} fill={C.wood} />
    <rect x={60} y={WIN.y1 + 40} width={w - 120} height={70} rx={8} filter="url(#tw-wood)" />
    <rect x={60} y={WIN.y1 + 40} width={w - 120} height={6} rx={3} fill="#8a5d39" />
    <rect x={70} y={WIN.y1 + 110} width={w - 140} height={18} fill="#000" opacity={0.35} />
    <rect x={0} y={0} width={w} height={1920} filter="url(#tw-grain)" />
  </g>
);

// Brass plaque under the window: the year counter and the last station's event.
export const Plaque = ({ year, event, font, stamp }: { year: number; event: string; font: string; stamp: number }) => (
  <div style={{ position: "absolute", left: 150, right: 150, top: 1510, height: 250, borderRadius: 14, background: "linear-gradient(160deg,#e9c97f,#c8a35a 45%,#86662f)", boxShadow: "0 14px 30px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 0 rgba(0,0,0,0.3)", fontFamily: font, textAlign: "center", color: "#2a1c0b" }}>
    <div style={{ position: "absolute", left: 14, top: 14, width: 12, height: 12, borderRadius: 6, background: "#7c5f2c" }} />
    <div style={{ position: "absolute", right: 14, top: 14, width: 12, height: 12, borderRadius: 6, background: "#7c5f2c" }} />
    <div style={{ fontSize: 30, fontWeight: 600, marginTop: 22, letterSpacing: 2, opacity: 0.8 }}>ขณะนี้ผ่าน</div>
    <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", transform: `scale(${1 + stamp * 0.08})` }}>พ.ศ. {year}</div>
    <div style={{ fontSize: 34, fontWeight: 600, marginTop: 2 }}>{event}</div>
  </div>
);

// Low rain clouds drifting slowly and rain falling outside (diagonal from the train's speed).
export const Weather = ({ p, frame, speed, tint }: { p: number; frame: number; speed: number; tint: string }) => (
  <g>
    <g filter="url(#tw-far)">
      {layerItems(p, 0.03, 300, 500).map(({ i, x }) => (
        <g key={i} fill={tint} opacity={0.55}>
          <ellipse cx={x + 120} cy={WIN.y0 + 150 + rnd(i) * 120} rx={190 + rnd(i + 1) * 80} ry={46} />
          <ellipse cx={x + 210} cy={WIN.y0 + 120 + rnd(i) * 120} rx={120} ry={56} />
        </g>
      ))}
    </g>
    <g stroke="#e9eef2" strokeWidth={1.6} opacity={0.22}>
      {Array.from({ length: 60 }, (_, i) => {
        const x = WIN.x0 + ((rnd(i) * WIN_W + frame * 9 - frame * speed * 0.6) % WIN_W + WIN_W) % WIN_W;
        const y = WIN.y0 + ((rnd(i + 40) * 1000 + frame * 46) % 1000);
        return <line key={i} x1={x} y1={y} x2={x + 6 + speed * 1.2} y2={y + 54} />;
      })}
    </g>
  </g>
);
