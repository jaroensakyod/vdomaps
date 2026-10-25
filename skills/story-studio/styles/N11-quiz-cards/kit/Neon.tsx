import { loadFont } from "@remotion/google-fonts/Mitr";
import type { CSSProperties, ReactNode } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Neon game-show quiz: a dark stage with spotlights and a glossy floor, a question board ringed by chasing marquee
// bulbs, neon-tube lettering that flickers on, lit podium options, a 3-2-1 bulb countdown, a buzzer flash on the
// answer and a confetti burst.
export const font = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["thai", "latin"] }).fontFamily;
export const NE = { stage: "#07030f", deep: "#140726", pink: "#ff3fa6", cyan: "#2ee8ff", bulb: "#ffd23a", text: "#fff2fa", right: "#3dff9a", wrong: "#ff4d5e" } as const;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const useU = () => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  return { u: (Math.min(width, height) / 1080) * (wide ? 1 : 1.12), width, height, wide };
};

// Neon flicker: a tube that strikes on over ~16 frames from `on`, then holds with rare short dips. 0..1.
const STRIKE = [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1];
export const flick = (frame: number, on: number, seed = 0) => {
  const d = frame - on;
  if (d < 0) return 0;
  if (d < STRIKE.length) return STRIKE[(d + seed) % STRIKE.length] ? 1 : 0.12;
  const r = random(`f${seed}-${Math.floor(frame / 3)}`);
  return r < 0.02 ? 0.35 : 1;
};
export const glow = (c: string, u: number, k = 1) => `0 0 ${3 * u}px #fff, 0 0 ${9 * u * k}px ${c}, 0 0 ${20 * u * k}px ${c}, 0 0 ${42 * u * k}px ${c}`;

// Neon tube lettering (HTML): white-hot core, coloured glow, flickers on at `on`.
export const NeonText = ({ children, color, on, size, seed = 0, style }: { children: ReactNode; color: string; on: number; size: number; seed?: number; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const { u } = useU();
  const k = flick(frame, on, seed);
  return (
    <div style={{ fontFamily: font, fontSize: size * u, fontWeight: 600, color: k > 0.5 ? "#fff6fb" : "#3a2a40", textShadow: k > 0.5 ? glow(color, u, k) : "none", WebkitTextStroke: `${1.2 * u}px ${color}`, opacity: 0.35 + 0.65 * k, lineHeight: 1.3, ...style }}>{children}</div>
  );
};

// ---------- stage ----------
export const StageBackdrop = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, u, wide } = useU();
  const floorY = H * (wide ? 0.78 : 0.8);
  const sweep = (i: number) => Math.sin(frame * 0.02 + i * 2.1) * 14;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="ng-back" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#2a0f4a" />
          <stop offset="0.6" stopColor={NE.deep} />
          <stop offset="1" stopColor={NE.stage} />
        </radialGradient>
        <linearGradient id="ng-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.32} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="ng-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c0b33" />
          <stop offset="1" stopColor="#050208" />
        </linearGradient>
        <filter id="ng-blur"><feGaussianBlur stdDeviation={18 * u} /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#ng-back)" />
      {/* back wall: vertical LED slats */}
      {Array.from({ length: Math.ceil(W / (60 * u)) }, (_, i) => <rect key={i} x={i * 60 * u} y={0} width={4 * u} height={floorY} fill={i % 2 ? NE.pink : NE.cyan} opacity={0.06 + 0.05 * Math.sin(frame * 0.08 + i * 0.7)} />)}
      {/* spotlights from the rig */}
      {[0.15, 0.5, 0.85].map((fx, i) => (
        <g key={fx} transform={`translate(${W * fx},${-20 * u}) rotate(${sweep(i)})`}>
          <path d={`M${-18 * u} 0 L${-W * 0.22} ${floorY + 40 * u} L${W * 0.22} ${floorY + 40 * u} L${18 * u} 0 Z`} fill="url(#ng-beam)" opacity={0.55} style={{ mixBlendMode: "screen" }} />
          <circle r={22 * u} fill="#fff" opacity={0.9} />
        </g>
      ))}
      {/* glossy floor with perspective lines and the board's reflection glow */}
      <rect x={0} y={floorY} width={W} height={H - floorY} fill="url(#ng-floor)" />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={W / 2} y1={floorY} x2={W / 2 + (i - 6) * W * 0.22} y2={H} stroke={NE.cyan} strokeWidth={1.2 * u} opacity={0.22} />)}
      {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1={0} x2={W} y1={floorY + (H - floorY) * ((i + 1) / 6) ** 1.6} y2={floorY + (H - floorY) * ((i + 1) / 6) ** 1.6} stroke={NE.pink} strokeWidth={1.2 * u} opacity={0.2} />)}
      <ellipse cx={W / 2} cy={floorY + 40 * u} rx={W * 0.4} ry={40 * u} fill={NE.pink} opacity={0.25} filter="url(#ng-blur)" />
      <line x1={0} x2={W} y1={floorY} y2={floorY} stroke={NE.pink} strokeWidth={3 * u} style={{ filter: `drop-shadow(0 0 ${8 * u}px ${NE.pink})` }} />
      {/* contestants' podiums on the floor, each with a lit front, a light strip and a bulb row */}
      {(wide ? [-1, 1] : [-1, 0, 1]).map((k) => {
        const pw = (wide ? 230 : 250) * u;
        const ph = (wide ? 120 : 170) * u;
        const cx = W / 2 + k * (wide ? 640 : 330) * u;
        const py = floorY + (wide ? 20 : 40) * u;
        const c = k === 0 ? NE.bulb : k < 0 ? NE.pink : NE.cyan;
        return (
          <g key={k}>
            <ellipse cx={cx} cy={py + ph + 10 * u} rx={pw * 0.7} ry={18 * u} fill={c} opacity={0.3} filter="url(#ng-blur)" />
            <path d={`M${cx - pw / 2} ${py} L${cx + pw / 2} ${py} L${cx + pw * 0.42} ${py + ph} L${cx - pw * 0.42} ${py + ph} Z`} fill="#1a0a30" stroke={c} strokeWidth={3 * u} style={{ filter: `drop-shadow(0 0 ${8 * u}px ${c})` }} />
            <rect x={cx - pw / 2 - 10 * u} y={py - 14 * u} width={pw + 20 * u} height={16 * u} rx={6 * u} fill={c} opacity={0.9} />
            {Array.from({ length: 6 }, (_, i) => {
              const lit = (i + Math.floor(frame / 4) + k) % 2 === 0;
              return <circle key={i} cx={cx - pw * 0.32 + (i * pw * 0.64) / 5} cy={py + ph * 0.55} r={7 * u} fill={lit ? "#fffbe0" : "#3a2a12"} stroke={lit ? c : "none"} strokeWidth={3 * u} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// A rectangle of marquee bulbs that chase (every 3rd bulb lit, stepping each 3 frames). `fast` doubles the speed.
export const Bulbs = ({ x, y, w, h, gap, r, frame, fast = false, all = false, color = NE.bulb }: { x: number; y: number; w: number; h: number; gap: number; r: number; frame: number; fast?: boolean; all?: boolean; color?: string }) => {
  const nx = Math.max(2, Math.round(w / gap));
  const ny = Math.max(2, Math.round(h / gap));
  const pts: [number, number][] = [];
  for (let i = 0; i < nx; i++) pts.push([x + (i * w) / nx, y]);
  for (let i = 0; i < ny; i++) pts.push([x + w, y + (i * h) / ny]);
  for (let i = 0; i < nx; i++) pts.push([x + w - (i * w) / nx, y + h]);
  for (let i = 0; i < ny; i++) pts.push([x, y + h - (i * h) / ny]);
  const step = Math.floor(frame / (fast ? 2 : 3));
  return (
    <g>
      {pts.map(([px, py], i) => {
        const lit = all || (i + step) % 3 === 0;
        return (
          <g key={i}>
            {lit && <circle cx={px} cy={py} r={r * 2.4} fill={color} opacity={0.25} />}
            <circle cx={px} cy={py} r={r} fill={lit ? "#fffbe0" : "#4a3a1a"} stroke={lit ? color : "#2a2010"} strokeWidth={r * 0.5} />
          </g>
        );
      })}
    </g>
  );
};

// Header sign: "ข้อ n/of" in bulb letters + the round title in a neon tube.
export const ShowHeader = ({ n, of, title, start, top }: { n: number; of: number; title: string; start: number; top: number }) => {
  const frame = useCurrentFrame();
  const { u, height, width } = useU();
  if (frame < start) return null;
  return (
    <div style={{ position: "absolute", left: 0, width, top: height * top, textAlign: "center" }}>
      <div style={{ display: "inline-block", fontFamily: font, fontWeight: 700, fontSize: 30 * u, color: "#1a0d00", background: NE.bulb, padding: `${2 * u}px ${22 * u}px`, borderRadius: 8 * u, boxShadow: `0 0 ${18 * u}px ${NE.bulb}`, opacity: flick(frame, start, 3) }}>ข้อ {n}/{of}</div>
      <NeonText color={NE.cyan} on={start + 4} size={66} seed={n} style={{ marginTop: 10 * u }}>{title}</NeonText>
    </div>
  );
};

// Deterministic confetti burst from the top at frame `at`.
export const Confetti = ({ at, n = 70 }: { at: number; n?: number }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, u } = useU();
  const t = frame - at;
  if (t < 0 || t > 90) return null;
  const cols = [NE.pink, NE.cyan, NE.bulb, "#ffffff", NE.right];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const sx = W * (0.15 + random(`cx${i}`) * 0.7);
        const vx = (random(`vx${i}`) - 0.5) * 22 * u;
        const vy = -(8 + random(`vy${i}`) * 16) * u;
        const x = sx + vx * t;
        const y = H * 0.32 + vy * t + 0.55 * u * t * t;
        const rot = t * (8 + random(`r${i}`) * 20) * (i % 2 ? 1 : -1);
        const w = (10 + random(`w${i}`) * 10) * u;
        return <rect key={i} x={-w / 2} y={-w / 4} width={w} height={w / 2} fill={cols[i % cols.length]} transform={`translate(${x},${y}) rotate(${rot}) scale(1,${Math.cos(t * 0.3 + i)})`} opacity={interpolate(t, [70, 90], [1, 0], clamp)} />;
      })}
    </svg>
  );
};

// The question board and podium options. Countdown from `start` to `reveal` (bulb ring drains, digit flickers),
// buzzer flash and confetti at `reveal`, explanation after; `end` switches it off.
export const QuizShow = ({ question, options, answer, start, reveal, end, explain, top }: { question: string; options: string[]; answer: number; start: number; reveal: number; end: number; explain?: string; top: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, width: W, height: H, wide } = useU();
  if (frame < start || frame > end) return null;
  const on = frame >= reveal;
  const off = interpolate(frame, [end - 6, end], [1, 0], clamp);
  const bw = wide ? 1240 * u : W - 90 * u;
  const bx = (W - bw) / 2;
  const by = H * top;
  const bh = (wide ? 230 : 270) * u;
  const left = Math.max(0, Math.ceil((reveal - frame) / 30));
  const drain = interpolate(frame, [start + 10, reveal], [1, 0], clamp);
  const flash = on && frame < reveal + 8 ? 1 - (frame - reveal) / 8 : 0;
  const tick = spring({ frame: frame - reveal, fps, config: { damping: 9, mass: 0.6 } });
  const letters = ["ก", "ข", "ค", "ง"];
  const cols = wide ? 2 : 1;
  const ow = cols === 2 ? (bw - 30 * u) / 2 : bw;
  const oh = (wide ? 92 : 104) * u;
  const oy = by + bh + 40 * u;
  const ringN = 24;
  const lit = Math.round(ringN * drain);
  const cdY = oy + Math.ceil(options.length / cols) * (oh + 22 * u) + (wide ? 10 : 30) * u;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: off }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* board: dark glass, pink tube inside, chasing bulbs around */}
        <rect x={bx} y={by} width={bw} height={bh} rx={18 * u} fill="#12062a" opacity={0.92} />
        <rect x={bx + 22 * u} y={by + 22 * u} width={bw - 44 * u} height={bh - 44 * u} rx={12 * u} fill="none" stroke={NE.pink} strokeWidth={4 * u} opacity={flick(frame, start, 2)} style={{ filter: `drop-shadow(0 0 ${10 * u}px ${NE.pink})` }} />
        <Bulbs x={bx} y={by} w={bw} h={bh} gap={38 * u} r={6 * u} frame={frame} fast={on} all={on && frame < reveal + 20 && frame % 4 < 2} />
        {/* countdown ring of bulbs (drains one by one) */}
        {!on && (
          <g>
            {Array.from({ length: ringN }, (_, i) => {
              const a = (i / ringN) * Math.PI * 2 - Math.PI / 2;
              const l = i < lit;
              const cx = W / 2 + Math.cos(a) * 92 * u;
              const cy = cdY + 92 * u + Math.sin(a) * 92 * u;
              return <circle key={i} cx={cx} cy={cy} r={7 * u} fill={l ? "#fffbe0" : "#3a2a12"} stroke={l ? NE.bulb : "none"} strokeWidth={3 * u} style={l ? { filter: `drop-shadow(0 0 ${6 * u}px ${NE.bulb})` } : undefined} />;
            })}
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", left: bx + 50 * u, width: bw - 100 * u, top: by, height: bh, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <NeonText color={NE.pink} on={start + 2} size={wide ? 60 : 62} seed={7}>{question}</NeonText>
      </div>
      {/* podium options */}
      <div style={{ position: "absolute", left: bx, width: bw, top: oy, display: "grid", gridTemplateColumns: `repeat(${cols}, ${ow}px)`, gap: `${22 * u}px ${30 * u}px` }}>
        {options.map((t, i) => {
          const right = i === answer;
          const ink = on ? (right ? NE.right : NE.wrong) : NE.cyan;
          const o = flick(frame, start + 10 + i * 6, i + 4);
          const dim = on && !right ? (frame - reveal < 10 ? (frame % 4 < 2 ? 0.2 : 0.7) : 0.22) : 1;
          return (
            <div key={t} style={{ position: "relative", height: oh, display: "flex", alignItems: "center", gap: 22 * u, padding: `0 ${26 * u}px`, borderRadius: 14 * u, border: `${3 * u}px solid ${ink}`, background: on && right ? `${NE.right}` : "rgba(20,6,40,0.85)", boxShadow: `0 0 ${16 * u}px ${ink}, inset 0 0 ${18 * u}px ${ink}55`, opacity: o * dim, transform: on && right ? `scale(${1 + 0.06 * Math.sin(Math.min(1, tick) * Math.PI)})` : undefined, fontFamily: font }}>
              <div style={{ width: 60 * u, height: 60 * u, flex: "none", borderRadius: "50%", border: `${3 * u}px solid ${on && right ? "#06210f" : ink}`, color: on && right ? "#06210f" : "#fff", textShadow: on && right ? "none" : glow(ink, u, 0.6), fontSize: 36 * u, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{on ? (right ? "✓" : "✕") : letters[i]}</div>
              <div style={{ fontSize: 44 * u, fontWeight: 600, color: on && right ? "#06210f" : "#fff", textShadow: on && right ? "none" : glow(ink, u, 0.5) }}>{t}</div>
              {/* podium light strip */}
              <div style={{ position: "absolute", left: 18 * u, right: 18 * u, bottom: -10 * u, height: 5 * u, borderRadius: 3 * u, background: ink, boxShadow: `0 0 ${12 * u}px ${ink}` }} />
            </div>
          );
        })}
      </div>
      {!on && (
        <div style={{ position: "absolute", left: 0, width: W, top: cdY + 34 * u, textAlign: "center" }}>
          <NeonText color={NE.bulb} on={start + 14} size={96} seed={left} style={{ fontWeight: 700 }}>{left}</NeonText>
        </div>
      )}
      {on && explain && (
        <div style={{ position: "absolute", left: 0, width: W, top: cdY + 40 * u, textAlign: "center" }}>
          <NeonText color={NE.bulb} on={reveal + 14} size={46} seed={11}>{explain}</NeonText>
        </div>
      )}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, #ffffff ${10}%, ${NE.pink} 60%, transparent 100%)`, opacity: flash * 0.8, mixBlendMode: "screen" }} />}
      {on && <Confetti at={reveal} />}
    </div>
  );
};
