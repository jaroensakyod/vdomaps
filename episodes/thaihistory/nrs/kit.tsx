import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COSTUME, PAL, type Costume } from "../../../components/Scene";
import { clamp } from "../news/kit";

// Naresuan episodes (ep05, ep06): props and figures of the 1560s–1600s in house style v2 — war elephants, Burmese
// stupas and palace roofs, camps, a golden ewer, ladders, manuscripts and letters. Panels are built in scenes.tsx.

export const C: Record<string, Costume> = {
  ...COSTUME,
  siam: { jacket: PAL.indigo, sash: PAL.ochre, pants: "#3a2a22", head: "short" },
  siamRed: { jacket: "#8a2a1e", sash: PAL.gilt, pants: "#2a2420", head: "short" },
  prince: { jacket: "#9a2a1e", sash: PAL.gilt, pants: "#2a2420", head: "crown", headColor: PAL.gilt },
  burma: { jacket: "#b8862a", sash: "#7a2a22", pants: "#4a3a2a", head: "wrap", headColor: PAL.chalk },
  burmaRed: { jacket: "#7a2a22", sash: PAL.gilt, pants: "#3a2a22", head: "wrap", headColor: "#efe6d0" },
  burmaPrince: { jacket: "#efe6d0", sash: PAL.gilt, pants: "#5a4a3a", head: "crown", headColor: PAL.gilt },
  mon: { jacket: "#3a4a6a", sash: "#c9a04a", pants: "#2a2a30", head: "wrap", headColor: "#c9302c" },
  khmer: { jacket: "#6b4a2a", sash: PAL.gilt, pants: "#3a2a1a", head: "short" },
  lanna: { jacket: "#2a3a2a", sash: "#3fbf6a", pants: "#2a2420", head: "topknot" },
  porto: { jacket: "#3a3a46", sash: "#a8322a", pants: "#5a4a3a", head: "helmet", headColor: "#9aa0a8", skin: "#e0b08a" },
  dutch: { jacket: "#1b1d24", sash: "#efe6d0", pants: "#1b1d24", head: "helmet", headColor: "#1b1d24", skin: "#e8bc96" },
  villager: { jacket: "#8a7a5a", sash: "#5b6e4a", pants: "#3a2f26", head: "short" },
  villagerW: { jacket: "#a8322a", sash: "#d9a93a", pants: "#5a3a2a", head: "wrap", headColor: "#3a2a22" },
  child: { jacket: "#c9b48a", sash: PAL.ochre, pants: "#3a2a22", head: "topknot" },
  shadow: { jacket: "#1a1418", sash: "#1a1418", pants: "#1a1418", head: "short", skin: "#2a2024" },
};

const GREY = "#8c8781";
const GREY_D = "#6c6762";

// War elephant, side view facing right (flip = facing left). Feet at (x, y). s ≈ 0.45·g.s for a panel.
// walk 0–1 (leg cycle), trumpet 0–1 (trunk up), swing 0–1 (the rider's ngao sweeps down), rider: king | rider | none.
// white = a white elephant (pale hide, no war cloth); hurt 0–1 tilts it (falls back on its haunches).
export const Elephant = ({ x, y, s, flip = false, walk = 0, trumpet = 0, swing = 0, cloth = PAL.ochre, trim = PAL.gilt, crown = PAL.gilt, rider = "king", white = false, hurt = 0, umbrella = false, phase = 0, riderCostume, hat = 0, slump = 0 }: { x: number; y: number; s: number; flip?: boolean; walk?: number; trumpet?: number; swing?: number; cloth?: string; trim?: string; crown?: string; rider?: "king" | "rider" | "none"; white?: boolean; hurt?: number; umbrella?: boolean; phase?: number; riderCostume?: Costume; hat?: number; slump?: number }) => {
  const frame = useCurrentFrame();
  const t = frame * 0.16 + phase;
  const hide = white ? "#e4ddd0" : GREY;
  const hideD = white ? "#c9c0b0" : GREY_D;
  const leg = (lx: number, ph: number, back: boolean) => {
    const a = Math.sin(t + ph) * 16 * walk;
    const k = Math.max(0, Math.sin(t + ph + 1)) * 18 * walk;
    return (
      <g key={lx} transform={`rotate(${a},${lx},-100)`} opacity={back ? 0.85 : 1}>
        <path d={`M${lx - 17} -110 L${lx + 17} -110 L${lx + 15} -52 L${lx - 15} -52 Z`} fill={back ? hideD : hide} stroke={PAL.ink} strokeWidth={3} />
        <g transform={`rotate(${-k},${lx},-54)`}>
          <path d={`M${lx - 15} -56 L${lx + 15} -56 L${lx + 16} -4 L${lx - 16} -4 Z`} fill={back ? hideD : hide} stroke={PAL.ink} strokeWidth={3} />
          <ellipse cx={lx} cy={-3} rx={19} ry={6} fill="#4a4642" />
        </g>
      </g>
    );
  };
  const segs = Array.from({ length: 6 }, (_, i) => interpolate(trumpet, [0, 1], [8 + Math.sin(t * 0.8 + i * 0.5) * 6 * (i / 5), -38 - i * 6], clamp));
  let px = 168;
  let py = -170;
  const pts: [number, number][] = [[px, py]];
  let ang = 90;
  segs.forEach((d, i) => {
    ang += d;
    const r = (ang * Math.PI) / 180;
    const len = 26 - i * 2;
    px += Math.cos(r) * len;
    py += Math.sin(r) * len;
    pts.push([px, py]);
  });
  const ear = Math.sin(frame * 0.12 + phase) * 6;
  const bob = Math.abs(Math.sin(t)) * 4 * walk;
  const ngao = -40 + swing * 120;
  const rc = riderCostume ?? { jacket: cloth, sash: trim, pants: "#2a2420", head: "short" as const };
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${-hurt * 14},-120,0)`}>
      <ellipse cx={0} cy={2} rx={170} ry={14} fill="#000" opacity={0.25} />
      <g transform={`translate(0,${-bob})`}>
        {leg(-85, 3.1, true)}
        {leg(80, 0, true)}
        <path d="M-150 -150 Q-160 -235 -60 -250 Q40 -262 120 -230 Q150 -205 148 -150 Q120 -96 20 -100 L-110 -100 Q-150 -105 -150 -150 Z" fill={hide} stroke={PAL.ink} strokeWidth={4} />
        <path d="M-158 -170 Q-178 -150 -170 -120" stroke={PAL.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        {!white && (
          <g>
            <path d="M-95 -248 Q20 -262 100 -236 L92 -150 Q10 -138 -88 -148 Z" fill={cloth} stroke={PAL.ink} strokeWidth={3.5} />
            <path d="M-88 -150 Q10 -140 92 -152 L90 -138 Q10 -126 -86 -136 Z" fill={trim} stroke={PAL.ink} strokeWidth={2} />
            {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-70 + i * 26} cy={-142 + Math.sin(i) * 2} r={5} fill={trim} stroke={PAL.ink} strokeWidth={1.5} />)}
          </g>
        )}
        {white && <path d="M-60 -252 Q20 -262 90 -238 L86 -222 Q20 -244 -58 -238 Z" fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2} />}
        {leg(-55, 0, false)}
        {leg(108, 3.1, false)}
        <path d="M100 -232 Q170 -250 190 -190 Q196 -150 168 -150 Q130 -150 110 -170 Z" fill={hide} stroke={PAL.ink} strokeWidth={4} />
        <path d={`M120 -222 Q${84 - ear} -210 ${90 - ear} -160 Q110 -150 132 -170 Z`} fill={hideD} stroke={PAL.ink} strokeWidth={3.5} />
        <path d="M140 -238 Q165 -246 182 -222 L176 -210 Q160 -228 140 -226 Z" fill={trim} stroke={PAL.ink} strokeWidth={2.5} />
        <circle cx={170} cy={-200} r={4} fill={PAL.ink} />
        <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} stroke={PAL.ink} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${pts.map((p) => p.join(",")).join(" L")}`} stroke={hide} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M176 -162 Q222 -150 236 -186 Q214 -164 178 -172 Z" fill="#f4eedf" stroke={PAL.ink} strokeWidth={2.5} />
        {umbrella && (
          <g transform="translate(-30,-250)">
            <line x1={0} y1={0} x2={0} y2={-170} stroke="#4a2f18" strokeWidth={5} />
            {[0, 1, 2].map((i) => <path key={i} d={`M${-70 + i * 14} ${-150 + i * 26} Q0 ${-178 + i * 26} ${70 - i * 14} ${-150 + i * 26} Z`} fill={i % 2 ? PAL.chalk : PAL.gilt} stroke={PAL.ink} strokeWidth={2.5} />)}
          </g>
        )}
        {rider !== "none" && (
          <g>
            {rider === "king" && (
              <g transform="translate(-40,-252)">
                <path d="M-10 0 Q-12 -30 -8 -50 L8 -50 Q12 -30 10 0 Z" fill={rc.jacket} stroke={PAL.ink} strokeWidth={2.5} />
                <circle cx={0} cy={-62} r={10} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
              </g>
            )}
            <g transform={`translate(78,-250) rotate(${-slump * 50},0,0)`}>
              <path d="M-14 0 Q-16 -38 -10 -64 L12 -64 Q16 -38 14 0 Z" fill={rc.jacket} stroke={PAL.ink} strokeWidth={3} />
              <path d="M-12 -40 L12 -36 L12 -30 L-12 -34 Z" fill={rc.sash} />
              <circle cx={0} cy={-78} r={12} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2.5} />
              {rider === "king" ? <g transform={`translate(${hat * 60},${-hat * 50}) rotate(${hat * 50},0,-100)`}><path d="M-12 -84 L0 -122 L12 -84 Z" fill={crown} stroke={PAL.ink} strokeWidth={2} /></g> : <path d="M-12 -82 Q0 -98 12 -82 Z" fill="#1f1712" />}
              {rider === "king" && (
                <g transform={`rotate(${ngao},6,-56)`}>
                  <line x1={-60} y1={-56} x2={170} y2={-56} stroke="#5a3a1f" strokeWidth={6} strokeLinecap="round" />
                  <path d="M168 -66 Q214 -76 226 -52 Q200 -58 168 -46 Z" fill="#d7dbde" stroke={PAL.ink} strokeWidth={2.5} />
                  <path d="M8 -62 L22 -62 L22 -50 L8 -50 Z" fill={trim} />
                </g>
              )}
              <path d="M-4 -60 L26 -58" stroke={PAL.skin} strokeWidth={8} strokeLinecap="round" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

// Mon–Burmese bell stupa covered in gold (Shwemawdaw-like), base centre (x, y), height h.
export const GoldStupa = ({ x, y, h, s, glow = 0 }: { x: number; y: number; h: number; s: number; glow?: number }) => {
  const w = h * 0.42;
  return (
    <g>
      {glow > 0 && <circle cx={x} cy={y - h * 0.5} r={h * 0.7} fill="#ffd25a" opacity={0.18 * glow} />}
      {[0, 1, 2].map((i) => <rect key={i} x={x - w * (0.75 - i * 0.12)} y={y - h * (0.06 + i * 0.06)} width={w * (1.5 - i * 0.24)} height={h * 0.06} fill={i % 2 ? "#c99a2e" : PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * s} />)}
      <path d={`M${x - w * 0.42} ${y - h * 0.24} Q${x - w * 0.5} ${y - h * 0.5} ${x - w * 0.14} ${y - h * 0.62} L${x + w * 0.14} ${y - h * 0.62} Q${x + w * 0.5} ${y - h * 0.5} ${x + w * 0.42} ${y - h * 0.24} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.8 * s} />
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={x} cy={y - h * (0.64 + i * 0.055)} rx={w * (0.14 - i * 0.022)} ry={h * 0.022} fill={i % 2 ? "#e8c25a" : PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * s} />)}
      <path d={`M${x - w * 0.03} ${y - h * 0.9} L${x} ${y - h} L${x + w * 0.03} ${y - h * 0.9} Z`} fill="#f4e2a0" stroke={PAL.ink} strokeWidth={1 * s} />
      <path d={`M${x - w * 0.3} ${y - h * 0.3} Q${x - w * 0.34} ${y - h * 0.48} ${x - w * 0.1} ${y - h * 0.58}`} stroke="#fff3c0" strokeWidth={3 * s} fill="none" opacity={0.6} />
    </g>
  );
};

// Burmese palace hall with a tiered pyatthat roof (n tiers), base-left (x, y), width w.
export const Pyatthat = ({ x, y, w, s, n = 5, roof = "#6a2a1a", wall = "#b8862a", glow = 0 }: { x: number; y: number; w: number; s: number; n?: number; roof?: string; wall?: string; glow?: number }) => {
  const wh = w * 0.3;
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y - wh} width={w} height={wh} fill={wall} stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={x + w * (0.08 + i * 0.18)} y={y - wh * 0.78} width={w * 0.07} height={wh * 0.62} fill={glow > 0 ? "#ffcf7a" : "#3a2414"} opacity={glow > 0 ? 0.5 + glow * 0.5 : 0.75} />)}
      {Array.from({ length: n }, (_, i) => {
        const tw = w * (1.08 - i * (0.86 / n));
        const ty = y - wh - i * w * 0.075;
        return <path key={i} d={`M${cx - tw / 2} ${ty} Q${cx - tw * 0.3} ${ty - w * 0.05} ${cx - tw * 0.24} ${ty - w * 0.08} L${cx + tw * 0.24} ${ty - w * 0.08} Q${cx + tw * 0.3} ${ty - w * 0.05} ${cx + tw / 2} ${ty} Z`} fill={i % 2 ? "#8a3a22" : roof} stroke={PAL.ink} strokeWidth={1.6 * s} />;
      })}
      <path d={`M${cx - 4 * s} ${y - wh - n * w * 0.075 - w * 0.02} L${cx} ${y - wh - n * w * 0.075 - w * 0.14} L${cx + 4 * s} ${y - wh - n * w * 0.075 - w * 0.02} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.2 * s} />
    </g>
  );
};

// Thai bell chedi (Sukhothai / Ayutthaya), base centre; ruin = broken top, weathered brick.
export const Chedi = ({ x, y, h, s, ruin = false, color = PAL.chalk }: { x: number; y: number; h: number; s: number; ruin?: boolean; color?: string }) => {
  const w = h * 0.4;
  const c = ruin ? "#9a6a4a" : color;
  return (
    <g>
      <rect x={x - w * 0.7} y={y - h * 0.1} width={w * 1.4} height={h * 0.1} fill={c} stroke={PAL.ink} strokeWidth={1.6 * s} />
      <rect x={x - w * 0.55} y={y - h * 0.18} width={w * 1.1} height={h * 0.08} fill={c} stroke={PAL.ink} strokeWidth={1.4 * s} />
      <path d={`M${x - w * 0.46} ${y - h * 0.18} Q${x - w * 0.5} ${y - h * 0.5} ${x} ${y - h * 0.58} Q${x + w * 0.5} ${y - h * 0.5} ${x + w * 0.46} ${y - h * 0.18} Z`} fill={c} stroke={PAL.ink} strokeWidth={1.8 * s} />
      {!ruin && <rect x={x - w * 0.12} y={y - h * 0.66} width={w * 0.24} height={h * 0.08} fill={c} stroke={PAL.ink} strokeWidth={1.2 * s} />}
      {!ruin && <path d={`M${x - w * 0.08} ${y - h * 0.66} L${x} ${y - h} L${x + w * 0.08} ${y - h * 0.66} Z`} fill={c} stroke={PAL.ink} strokeWidth={1.2 * s} />}
      {ruin && (
        <g>
          <path d={`M${x - w * 0.2} ${y - h * 0.56} L${x - w * 0.05} ${y - h * 0.68} L${x + w * 0.1} ${y - h * 0.6} L${x + w * 0.22} ${y - h * 0.55}`} fill="none" stroke={PAL.ink} strokeWidth={1.6 * s} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x - w * 0.4 + i * w * 0.15} y1={y - h * (0.22 + (i % 3) * 0.08)} x2={x - w * 0.32 + i * w * 0.15} y2={y - h * (0.22 + (i % 3) * 0.08)} stroke="#5a3a22" strokeWidth={2 * s} />)}
          <path d={`M${x - w * 0.3} ${y - h * 0.2} q${10 * s} ${-20 * s} ${24 * s} ${-12 * s}`} stroke={PAL.green} strokeWidth={4 * s} fill="none" />
        </g>
      )}
    </g>
  );
};

// Army tent (camp), base centre.
export const Tent = ({ x, y, w, s, color = "#e9dcc0", stripe = "#7a2a22", lit = 0 }: { x: number; y: number; w: number; s: number; color?: string; stripe?: string; lit?: number }) => (
  <g>
    <path d={`M${x - w / 2} ${y} L${x} ${y - w * 0.62} L${x + w / 2} ${y} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.6 * s} />
    <path d={`M${x - w * 0.12} ${y} L${x} ${y - w * 0.36} L${x + w * 0.12} ${y} Z`} fill={lit > 0 ? "#ffcf7a" : "#3a2414"} opacity={lit > 0 ? 0.6 + lit * 0.4 : 0.8} />
    <line x1={x - w * 0.3} y1={y - w * 0.24} x2={x + w * 0.3} y2={y - w * 0.24} stroke={stripe} strokeWidth={3 * s} />
    <line x1={x} y1={y - w * 0.62} x2={x} y2={y - w * 0.74} stroke="#4a2f18" strokeWidth={2 * s} />
    <path d={`M${x} ${y - w * 0.74} l${12 * s} ${4 * s} l${-12 * s} ${4 * s} Z`} fill={stripe} />
  </g>
);

// Campfire with a glow ring.
export const Campfire = ({ x, y, s, seed = 0 }: { x: number; y: number; s: number; seed?: number }) => {
  const frame = useCurrentFrame();
  const f = 1 + Math.sin(frame * 0.8 + seed) * 0.15;
  return (
    <g>
      <circle cx={x} cy={y - 10 * s} r={46 * s * f} fill="#ff9a3a" opacity={0.16} />
      <path d={`M${x - 14 * s} ${y} L${x + 14 * s} ${y - 4 * s} M${x - 12 * s} ${y - 4 * s} L${x + 12 * s} ${y}`} stroke="#4a2f18" strokeWidth={4 * s} />
      <path d={`M${x - 10 * s} ${y - 2 * s} Q${x - 6 * s} ${y - 20 * s * f} ${x + Math.sin(frame * 0.5 + seed) * 3 * s} ${y - 30 * s * f} Q${x + 8 * s} ${y - 16 * s} ${x + 10 * s} ${y - 2 * s} Z`} fill="#ffb03a" />
      <path d={`M${x - 5 * s} ${y - 2 * s} Q${x - 2 * s} ${y - 12 * s * f} ${x} ${y - 18 * s * f} Q${x + 4 * s} ${y - 10 * s} ${x + 5 * s} ${y - 2 * s} Z`} fill="#fff0a0" />
    </g>
  );
};

// Golden ewer (kendi / suwanna phingkhan) tipping water; pour 0–1 = tilt and stream length. Spout at the right.
export const Ewer = ({ x, y, s, pour = 0 }: { x: number; y: number; s: number; pour?: number }) => {
  const frame = useCurrentFrame();
  const tilt = pour * 55;
  return (
    <g>
      <g transform={`translate(${x},${y}) rotate(${tilt})`}>
        <ellipse cx={0} cy={0} rx={26 * s} ry={30 * s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={2 * s} />
        <path d={`M${-10 * s} ${-28 * s} L${-8 * s} ${-46 * s} L${8 * s} ${-46 * s} L${10 * s} ${-28 * s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * s} />
        <path d={`M${20 * s} ${-12 * s} Q${40 * s} ${-18 * s} ${48 * s} ${-34 * s}`} stroke={PAL.ink} strokeWidth={9 * s} fill="none" strokeLinecap="round" />
        <path d={`M${20 * s} ${-12 * s} Q${40 * s} ${-18 * s} ${48 * s} ${-34 * s}`} stroke={PAL.gilt} strokeWidth={6 * s} fill="none" strokeLinecap="round" />
        <path d={`M${-18 * s} ${-6 * s} Q${0} ${4 * s} ${18 * s} ${-6 * s}`} stroke="#fff3c0" strokeWidth={2 * s} fill="none" opacity={0.7} />
      </g>
      {pour > 0.4 && (
        <g>
          {(() => {
            const sx = x + Math.cos(((tilt - 35) * Math.PI) / 180) * 52 * s;
            const sy = y + Math.sin(((tilt - 35) * Math.PI) / 180) * 52 * s;
            const len = (pour - 0.4) * 400 * s;
            return (
              <g>
                <path d={`M${sx} ${sy} Q${sx + 14 * s} ${sy + len * 0.4} ${sx + 10 * s} ${sy + len}`} stroke="#bfe6ff" strokeWidth={5 * s} fill="none" opacity={0.85} />
                {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={sx + 10 * s + Math.sin(frame * 0.7 + i) * 10 * s} cy={sy + len + ((frame * 2 + i * 7) % 16) * s} r={2.5 * s} fill="#dff2ff" opacity={0.8} />)}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};

// Bamboo ladder against a wall, from (x, y) up to height h, leaning `lean` px.
export const Ladder = ({ x, y, h, s, lean = 30 }: { x: number; y: number; h: number; s: number; lean?: number }) => (
  <g stroke="#7a5a32" strokeWidth={4 * s} strokeLinecap="round">
    <line x1={x} y1={y} x2={x + lean * s} y2={y - h} />
    <line x1={x + 22 * s} y1={y} x2={x + 22 * s + lean * s} y2={y - h} />
    {Array.from({ length: Math.floor(h / (20 * s)) }, (_, i) => {
      const k = (i + 1) / (h / (20 * s));
      return <line key={i} x1={x + lean * s * k} y1={y - h * k} x2={x + 22 * s + lean * s * k} y2={y - h * k} strokeWidth={3 * s} />;
    })}
  </g>
);

// Dust cloud that swells from `start` (frames) and drifts.
export const Dust = ({ x, y, s, k = 1, n = 9, color = "#d8b98a" }: { x: number; y: number; s: number; k?: number; n?: number; color?: string }) => {
  const frame = useCurrentFrame();
  if (k <= 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={x + (i - n / 2) * 34 * s + Math.sin(frame * 0.03 + i) * 10 * s} cy={y - (i % 3) * 18 * s - 20 * s} r={(40 + (i % 4) * 14) * s * (0.6 + 0.4 * k)} fill={color} opacity={0.38 * k} />
      ))}
    </g>
  );
};

// Arrows flying on an arc from x0 to x1 (panel px), launched at `at`.
export const Volley = ({ at, x0, x1, y, s, n = 10, seed = 1, h = 120 }: { at: number; x0: number; x1: number; y: number; s: number; n?: number; seed?: number; h?: number }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = interpolate(frame, [at + i * 2, at + 24 + i * 2], [0, 1], clamp);
        if (t <= 0 || t >= 1) return null;
        const sx = x0 + ((i * 37 + seed) % 60) * s - 30 * s;
        const ex = x1 + ((i * 53 + seed) % 120) * s - 60 * s;
        const dir = ex > sx ? 1 : -1;
        const ax = sx + (ex - sx) * t;
        const ay = y - Math.sin(t * Math.PI) * h * s;
        const ang = (Math.atan2(-Math.cos(t * Math.PI) * h * s * Math.PI, ex - sx) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${ax},${ay}) rotate(${ang})`}>
            <line x1={-12 * s * dir} y1={0} x2={12 * s * dir} y2={0} stroke="#3a2a1a" strokeWidth={1.8 * s} />
            <path d={`M${12 * s * dir} 0 l${-4 * s * dir} ${-2.5 * s} l0 ${5 * s} Z`} fill="#cfd3d6" />
          </g>
        );
      })}
    </g>
  );
};

// A lady of the court (seated or standing), facing right. sabai = shoulder cloth colour.
export const Lady = ({ x, y, scale, mode = "sit", sabai = PAL.gilt, skirt = PAL.ochre, flip = false, phase = 0 }: { x: number; y: number; scale: number; mode?: "sit" | "stand"; sabai?: string; skirt?: string; flip?: boolean; phase?: number }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.07 + phase) * 1;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale})`}>
      <ellipse cx={0} cy={2} rx={mode === "sit" ? 30 : 16} ry={5} fill="#000" opacity={0.28} />
      {mode === "sit" ? <path d="M-28 0 Q-26 -26 0 -28 Q20 -26 24 0 Z" fill={skirt} stroke={PAL.ink} strokeWidth={2} /> : <path d="M-14 0 L-12 -50 L12 -50 L14 0 Z" fill={skirt} stroke={PAL.ink} strokeWidth={2} />}
      <g transform={`translate(0,${(mode === "sit" ? -26 : -50) + b})`}>
        <path d="M-11 0 Q-13 -30 -8 -44 L8 -44 Q13 -30 11 0 Z" fill="#c98a5e" stroke={PAL.ink} strokeWidth={2} />
        <path d="M-11 -2 L9 -42 L13 -36 L-5 0 Z" fill={sabai} stroke={PAL.ink} strokeWidth={1.6} />
        <ellipse cx={0} cy={-56} rx={9} ry={10.5} fill={PAL.skin} stroke={PAL.ink} strokeWidth={2} />
        <path d="M-9.5 -58 Q-10 -69 0 -69 Q10 -69 9.5 -58 Q4 -62 -9.5 -58 Z" fill="#1f1712" />
        <circle cx={0} cy={-72} r={5} fill="#1f1712" />
        <circle cx={5} cy={-56} r={1.4} fill={PAL.ink} />
      </g>
    </g>
  );
};

// Folding Burmese parabaik (black paper book) or a European letter with a wax seal, lying on a table.
export const Parabaik = ({ x, y, w, s }: { x: number; y: number; w: number; s: number }) => (
  <g>
    <path d={`M${x} ${y} l${w} 0 l${-10 * s} ${-w * 0.32} l${-w + 20 * s} 0 Z`} fill="#16130f" stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={x + 16 * s + i * 2 * s} y1={y - (10 + i * 10) * s} x2={x + w - 20 * s - i * 2 * s} y2={y - (10 + i * 10) * s} stroke="#e8e2d0" strokeWidth={1.6 * s} strokeDasharray={`${3 * s} ${2 * s}`} opacity={0.8} />)}
  </g>
);
export const Letter = ({ x, y, w, s, seal = "#a8322a", rot = -6 }: { x: number; y: number; w: number; s: number; seal?: string; rot?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={0} y={-w * 0.75} width={w} height={w * 0.75} fill="#f4ecd8" stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${10 * s} ${-w * 0.7 + (12 + i * 12) * s} q${w * 0.2} ${-4 * s} ${w * 0.4} 0 t${w * 0.4} 0`} stroke="#3a2a6a" strokeWidth={1.4 * s} fill="none" />)}
    <circle cx={w * 0.8} cy={-14 * s} r={10 * s} fill={seal} />
  </g>
);

// Long matchlock gun on a stand (the royal gun), with a gold band and a glow.
export const RoyalGun = ({ x, y, w, s, glow = 1 }: { x: number; y: number; w: number; s: number; glow?: number }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y - 30 * s} rx={w * 0.6} ry={60 * s} fill="#ffd25a" opacity={0.15 * glow} />
    <path d={`M${x + w * 0.1} ${y} L${x + w * 0.16} ${y - 34 * s} M${x + w * 0.84} ${y} L${x + w * 0.78} ${y - 34 * s}`} stroke="#5a3a1f" strokeWidth={5 * s} />
    <path d={`M${x} ${y - 30 * s} L${x + w * 0.28} ${y - 36 * s} L${x + w} ${y - 40 * s} L${x + w} ${y - 34 * s} L${x + w * 0.28} ${y - 26 * s} Q${x + w * 0.08} ${y - 14 * s} ${x} ${y - 20 * s} Z`} fill="#6a4524" stroke={PAL.ink} strokeWidth={1.8 * s} />
    <line x1={x + w * 0.25} y1={y - 36 * s} x2={x + w} y2={y - 39 * s} stroke="#3a3f44" strokeWidth={5 * s} />
    {[0.35, 0.55, 0.75].map((f) => <rect key={f} x={x + w * f} y={y - 42 * s} width={8 * s} height={10 * s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1 * s} />)}
  </g>
);

// Group helper: n figures in a row with spacing `gap`, any render function.
export const Row = ({ n, x, gap, render }: { n: number; x: number; gap: number; render: (i: number, x: number) => ReactNode }) => <g>{Array.from({ length: n }, (_, i) => <g key={i}>{render(i, x + i * gap)}</g>)}</g>;
