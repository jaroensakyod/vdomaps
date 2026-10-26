import { loadFont } from "@remotion/google-fonts/Chonburi";
import type { ReactNode } from "react";
import { random } from "remotion";

// N26 khon mask theatre: painted and gilded khon masks lit on a dark stage, close enough to fill the frame. A
// mask "turns" in the light: every feature sits on a curved face (a cylinder), so as the head turns (`yaw`) the
// features slide across and narrow, while a lamp (`L`) rakes the gold and the painted face. Behind: costume
// embroidery (gold thread and sequins on silk), out of focus. The masks here are this pack's own designs.

export const font = loadFont("normal", { weights: ["400"], subsets: ["thai", "latin"] }).fontFamily;

export const C = {
  stage: "#070407",
  silk: "#0c2a8c", // costume silk behind
  gold: "#e8b84a",
  goldDeep: "#7a4f10",
  demon: "#1f8f4e", // the demon's face
  monkey: "#f2eee4", // the monkey hero's face
  lip: "#c0182a",
  text: "#ffe7a6",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hx = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const to = (v: number[]) => `#${v.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;
// colour lit by a factor k (0 dark … 1 base … >1 towards white)
export const lit = (h: string, k: number) => {
  const c = hx(h);
  return to(k <= 1 ? c.map((v) => v * (0.18 + 0.82 * k)) : c.map((v) => v + (255 - v) * Math.min(1, k - 1)));
};

// ---------- turning geometry ----------
export type Turn = { yaw: number; L: number; R: number };
// screen x offset, horizontal squash and light for a feature at u (-1..1 across the face)
export const place = (u: number, t: Turn) => {
  const a = Math.asin(Math.max(-1, Math.min(1, u))) + t.yaw;
  const facing = Math.cos(a);
  return { x: t.R * (Math.sin(a) - 0.8 * Math.sin(t.yaw)), sx: Math.max(0, facing), light: 0.2 + 0.95 * Math.pow(Math.max(0, Math.cos(a - t.L)), 1.3), vis: facing > 0.05 };
};
// A feature group drawn around (0,0) at face position u, row y.
export const Feat = ({ u, y, t, children, mirror = false }: { u: number; y: number; t: Turn; children: ReactNode; mirror?: boolean }) => {
  const p = place(u, t);
  if (!p.vis) return null;
  return <g transform={`translate(${p.x.toFixed(1)},${y}) scale(${(p.sx * (mirror ? -1 : 1)).toFixed(3)},1)`}>{children}</g>;
};

// ---------- defs ----------
export const KhonDefs = ({ L }: { L: number }) => {
  // lamp position across the face drives the face gradient
  const stops = Array.from({ length: 9 }, (_, i) => {
    const s = -1 + (i / 8) * 2;
    const c = Math.max(0, Math.cos(Math.asin(s) - L));
    const k = 0.1 + 0.95 * Math.pow(c, 1.4) + 0.35 * Math.pow(c, 12);
    return { off: i / 8, k };
  });
  return (
    <defs>
      {(["demon", "monkey"] as const).map((n) => (
        <linearGradient key={n} id={`n26-${n}`} x1="0" y1="0" x2="1" y2="0">
          {stops.map((s, i) => <stop key={i} offset={s.off} stopColor={lit(C[n], s.k)} />)}
        </linearGradient>
      ))}
      <linearGradient id="n26-gold" x1="0" y1="0" x2="1" y2="0">
        {stops.map((s, i) => <stop key={i} offset={s.off} stopColor={lit(C.gold, s.k * 1.05)} />)}
      </linearGradient>
      <linearGradient id="n26-goldv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff2b8" />
        <stop offset="0.45" stopColor={C.gold} />
        <stop offset="1" stopColor={C.goldDeep} />
      </linearGradient>
      <radialGradient id="n26-spot" cx="0.5" cy="0.38" r="0.62">
        <stop offset="0" stopColor="#ffdca0" stopOpacity={0.32} />
        <stop offset="0.55" stopColor="#ff9d4a" stopOpacity={0.08} />
        <stop offset="1" stopColor="#000" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="n26-vig" cx="0.5" cy="0.45" r="0.72">
        <stop offset="0.5" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55} />
      </radialGradient>
      <radialGradient id="n26-fire" cx="0.5" cy="1" r="0.9">
        <stop offset="0" stopColor="#ffb340" stopOpacity={0.7} />
        <stop offset="0.5" stopColor="#ff5a1a" stopOpacity={0.25} />
        <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
      </radialGradient>
      <pattern id="n26-brocade" width={120} height={120} patternUnits="userSpaceOnUse">
        <rect width={120} height={120} fill={C.silk} />
        <path d="M60 0 L120 60 L60 120 L0 60 Z" fill="none" stroke="#c99634" strokeWidth={5} />
        <path d="M60 18 L102 60 L60 102 L18 60 Z" fill="none" stroke="#e8c060" strokeWidth={2} />
        <path d="M60 36 C70 48 70 72 60 84 C50 72 50 48 60 36 Z M36 60 C48 50 72 50 84 60 C72 70 48 70 36 60 Z" fill="#d4a43c" />
        <circle cx={60} cy={60} r={7} fill="#2a8a5a" stroke="#fff0b0" strokeWidth={2} />
        {[[0, 0], [120, 0], [0, 120], [120, 120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#e8c060" />)}
        {Array.from({ length: 8 }, (_, i) => <circle key={`s${i}`} cx={60 + Math.cos((i * Math.PI) / 4) * 30} cy={60 + Math.sin((i * Math.PI) / 4) * 30} r={3} fill="#fff4c8" />)}
      </pattern>
      <filter id="n26-dof" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation={1.2} />
      </filter>
      <filter id="n26-flame" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={60} xChannelSelector="R" yChannelSelector="G" result="dd" />
        <feGaussianBlur in="dd" stdDeviation={7} />
      </filter>
      <filter id="n26-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={2} />
      </filter>
      <filter id="n26-bloom" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={3} result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* the mask's surface: fine lacquer / gold-leaf grain multiplied in, then a deep drop shadow */}
      <filter id="n26-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={12} result="n" />
        <feColorMatrix in="n" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="na" />
        <feComposite in="SourceGraphic" in2="na" operator="arithmetic" k1={0.5} k2={0.75} k3={0} k4={0} result="g" />
        <feComposite in="g" in2="SourceAlpha" operator="in" result="gi" />
        <feDropShadow in="gi" dx={0} dy={16} stdDeviation={22} floodColor="#000" floodOpacity={0.8} />
      </filter>
    </defs>
  );
};

// Costume embroidery behind, out of focus, drifting slowly.
export const Brocade = ({ drift, dim = 0.55 }: { drift: number; dim?: number }) => (
  <g>
    <g filter="url(#n26-dof)" transform={`translate(${drift % 120},${(drift * 0.4) % 120})`}>
      <rect x={-240} y={-240} width={1560} height={2400} fill="url(#n26-brocade)" />
    </g>
    <rect x={0} y={0} width={1080} height={1920} fill="#05020a" opacity={dim} />
  </g>
);

// ---------- the masks ----------
// gold flame-scroll (kranok) used for brows, ear ornaments, crown tiers
const kranok = (w: number, h: number) => `M0 0 C${w * 0.3} ${-h * 0.2} ${w * 0.65} ${-h * 0.15} ${w} ${-h} C${w * 0.85} ${-h * 0.4} ${w * 0.55} ${h * 0.25} 0 ${h * 0.2} Z`;

// A tall tiered crown (ชฎา) as a solid of revolution; jewels slide round it as the head turns.
const Crown = ({ t, h = 560, w = 300, tiers = 9 }: { t: Turn; h?: number; w?: number; tiers?: number }) => {
  const rows = Array.from({ length: tiers }, (_, i) => {
    const k = i / tiers;
    const y = -k * h;
    const rw = (w / 2) * (1 - k * 0.86);
    return { y, rw, th: (h / tiers) * 0.95 };
  });
  return (
    <g>
      {rows.map((r, i) => (
        <g key={i}>
          <path d={`M${-r.rw} ${r.y} C${-r.rw} ${r.y - r.th * 0.5} ${-r.rw * 0.92} ${r.y - r.th} ${-r.rw * 0.86} ${r.y - r.th} L${r.rw * 0.86} ${r.y - r.th} C${r.rw * 0.92} ${r.y - r.th} ${r.rw} ${r.y - r.th * 0.5} ${r.rw} ${r.y} Z`} fill="url(#n26-gold)" stroke={C.goldDeep} strokeWidth={2.5} />
          {/* flame petals standing on each tier rim; they slide round as the head turns */}
          {Array.from({ length: 10 }, (_, j) => {
            const a = (j / 10) * Math.PI * 2 + t.yaw + i * 0.3;
            const f = Math.cos(a);
            if (f < 0.1) return null;
            const px = Math.sin(a) * r.rw * 0.95;
            const sh = 0.5 + 0.7 * Math.max(0, Math.cos(a - t.L));
            const pw = (r.rw / 5) * f;
            return <path key={`p${j}`} d={`M${px - pw} ${r.y - r.th * 0.35} Q${px - pw * 0.4} ${r.y - r.th * 1.1} ${px + pw * 0.3} ${r.y - r.th * 1.35} Q${px + pw * 0.2} ${r.y - r.th * 0.8} ${px + pw} ${r.y - r.th * 0.35} Z`} fill={lit(C.gold, sh)} stroke={C.goldDeep} strokeWidth={1.5} />;
          })}
          {/* petal rim of each tier */}
          <path d={Array.from({ length: 9 }, (_, j) => { const x = -r.rw + ((j + 0.5) * 2 * r.rw) / 9; return `M${x - r.rw / 9} ${r.y} Q${x} ${r.y - r.th * 0.7} ${x + r.rw / 9} ${r.y}`; }).join(" ")} fill="none" stroke="#fff0b0" strokeWidth={2} opacity={0.7} />
          {/* jewels on a ring: they move round as the mask turns */}
          {Array.from({ length: 6 }, (_, j) => {
            const a = (j / 6) * Math.PI * 2 + t.yaw + i * 0.4;
            if (Math.cos(a) < 0.15) return null;
            const x = Math.sin(a) * r.rw * 0.92;
            const sh = 0.5 + 0.6 * Math.max(0, Math.cos(a - t.L));
            return <circle key={j} cx={x} cy={r.y - r.th * 0.45} r={Math.max(2, 7 * Math.cos(a)) * (1 - i / tiers / 2)} fill={j % 2 ? lit("#1fbf6a", sh) : lit("#e0203a", sh)} stroke="#fff3c0" strokeWidth={1.2} />;
          })}
        </g>
      ))}
      <path d={`M-10 ${-h} C-8 ${-h - 60} -2 ${-h - 110} 0 ${-h - 150} C2 ${-h - 110} 8 ${-h - 60} 10 ${-h} Z`} fill="url(#n26-goldv)" />
    </g>
  );
};

// Inner shading over a face: dark rim, a soft lit patch on the lamp side (gives the lacquered face its volume).
const FaceShade = ({ d, t }: { d: string; t: Turn }) => {
  const id = `n26-fs${Math.round(t.L * 100)}`;
  return (
    <g>
      <radialGradient id={id} cx={0.5 + 0.32 * Math.sin(t.L)} cy="0.38" r="0.7">
        <stop offset="0" stopColor="#fff" stopOpacity={0.42} />
        <stop offset="0.22" stopColor="#fff" stopOpacity={0.12} />
        <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
        <stop offset="0.8" stopColor="#000" stopOpacity={0.25} />
        <stop offset="1" stopColor="#000" stopOpacity={0.7} />
      </radialGradient>
      <path d={d} fill={`url(#${id})`} />
    </g>
  );
};
// fine painted gold scroll (a spiral with a tail), drawn as a stroke
const spiralD = (r: number, turns = 1.6, dir = 1) => {
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const th = (i / 30) * turns * Math.PI * 2;
    const rr = r * Math.exp(-0.38 * th);
    pts.push(`${(Math.cos(dir * th) * rr).toFixed(1)} ${(Math.sin(dir * th) * rr).toFixed(1)}`);
  }
  return `M${-r * 1.8} ${r * 0.9} Q${-r * 1.2} ${r * 0.2} ${pts.join(" L")}`;
};
// a gold-rimmed, flame-tailed eye
const Eye = ({ k, ring = "#c0182a", tail = 1, big = 1 }: { k: number; ring?: string; tail?: number; big?: number }) => (
  <g transform={`scale(${big})`}>
    <path d={`M-70 4 C-50 -40 40 -46 66 -6 C${66 + 40 * tail} -20 ${66 + 70 * tail} -34 ${66 + 92 * tail} -60 C${66 + 70 * tail} -8 ${66 + 40 * tail} 16 60 14 C30 40 -40 40 -70 4 Z`} fill={lit(C.gold, k)} stroke="#3a2408" strokeWidth={2.5} />
    <path d="M-54 2 C-36 -30 34 -32 52 -2 C32 26 -36 28 -54 2 Z" fill={lit("#fffaf0", k)} stroke="#2a1a08" strokeWidth={2} />
    <circle cx={2} cy={0} r={22} fill={ring} />
    <circle cx={2} cy={0} r={13} fill="#0b0605" />
    <circle cx={-5} cy={-8} r={5} fill="#fff" />
  </g>
);

// Embroidered collar (กรองคอ) under the mask: gold-bead scallops on silk, a jewel at each point.
export const Collar = ({ t, w = 380, y = 300 }: { t: Turn; w?: number; y?: number }) => (
  <g>
    <path d={`M${-w} ${y} Q0 ${y + 220} ${w} ${y} L${w + 40} ${y + 120} Q0 ${y + 360} ${-w - 40} ${y + 120} Z`} fill="#3a0a14" stroke={C.goldDeep} strokeWidth={3} />
    {Array.from({ length: 11 }, (_, i) => {
      const k = i / 10;
      const x = -w - 20 + k * (2 * w + 40);
      const yy = y + 60 + Math.sin(k * Math.PI) * 190;
      const sh = 0.55 + 0.6 * Math.max(0, Math.cos(Math.asin(Math.max(-1, Math.min(1, x / (w + 40)))) - t.L));
      return (
        <g key={i}>
          <path d={`M${x - 40} ${yy - 30} Q${x} ${yy + 40} ${x + 40} ${yy - 30}`} fill="none" stroke={lit(C.gold, sh)} strokeWidth={9} />
          <circle cx={x} cy={yy + 18} r={10} fill={i % 2 ? lit("#1fbf6a", sh) : lit("#e0203a", sh)} stroke="#fff3c0" strokeWidth={2} />
        </g>
      );
    })}
    {[0.35, 0.62].map((k, j) => <path key={j} d={`M${-w - 30 * k} ${y + 120 * k} Q0 ${y + 220 + 150 * k} ${w + 30 * k} ${y + 120 * k}`} fill="none" stroke={lit(C.gold, 0.9)} strokeWidth={4} strokeDasharray="2 9" strokeLinecap="round" />)}
    <path d={`M${-w} ${y} Q0 ${y + 220} ${w} ${y}`} fill="none" stroke="url(#n26-gold)" strokeWidth={16} />
  </g>
);

// Demon (yak) mask: green lacquered face, gold flame-tailed eyes under red brows, gold scrolls painted on the
// cheeks, flared nose, wide gilt-edged mouth with upturned fangs, a tall tiered crown, flame ear ornaments.
const DEMON_FACE = "M-285 -250 C-305 -150 -330 -40 -308 70 C-286 180 -222 266 -124 304 L124 304 C222 266 286 180 308 70 C330 -40 305 -150 285 -250 Z";
export const DemonMask = ({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: Turn }) => {
  const squash = 1 - 0.12 * Math.abs(Math.sin(t.yaw));
  const shift = t.R * 0.2 * Math.sin(t.yaw);
  const eL = place(-0.4, t), eR = place(0.4, t), mid = place(0, t);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#n26-shadow)">
      <Collar t={t} y={210} w={380} />
      {[-1, 1].filter((side) => Math.cos(Math.asin(0.97 * side) + t.yaw) > -0.15).map((side) => (
        <g key={side} transform={`translate(${side * t.R * 1.0 + shift},${-30}) scale(${side},1)`}>
          <path d={kranok(170, 250)} fill="url(#n26-goldv)" stroke={C.goldDeep} strokeWidth={3} transform="rotate(-8)" />
          <path d={kranok(120, 180)} fill="#9e1222" stroke="#fff0b0" strokeWidth={2} transform="translate(18,6) rotate(-8)" />
          <path d={kranok(70, 110)} fill="url(#n26-goldv)" transform="translate(34,8) rotate(-8)" />
          {[0, 1, 2].map((j) => <circle key={j} cx={40 + j * 28} cy={-40 - j * 40} r={7} fill={j % 2 ? "#1fbf6a" : "#e0203a"} stroke="#fff3c0" strokeWidth={1.5} />)}
        </g>
      ))}
      <g transform="translate(0,-250)"><Crown t={t} /></g>
      <g transform={`translate(${shift},0) scale(${squash},1)`}>
        <path d={DEMON_FACE} fill="url(#n26-demon)" stroke="#06200e" strokeWidth={4} />
        <FaceShade d={DEMON_FACE} t={t} />
      </g>
      {/* forehead band with jewels */}
      <path d="M-296 -252 Q0 -304 296 -252 L284 -196 Q0 -246 -284 -196 Z" fill="url(#n26-gold)" stroke={C.goldDeep} strokeWidth={3} />
      <path d="M-280 -214 Q0 -262 280 -214" stroke="#fff0b0" strokeWidth={2} fill="none" opacity={0.6} />
      {Array.from({ length: 11 }, (_, i) => { const p = place(-0.88 + i * 0.176, t); return p.vis ? <ellipse key={i} cx={p.x} cy={-226 - Math.cos((i - 5) / 6) * 10} rx={10 * p.sx + 1} ry={10} fill={i % 2 ? "#e0203a" : "#1fbf6a"} stroke="#fff3c0" strokeWidth={1.5} /> : null; })}
      {/* forehead flame between the brows */}
      <Feat u={0} y={-150} t={t}><path d="M0 -50 C16 -24 22 0 0 34 C-22 0 -16 -24 0 -50 Z" fill={lit(C.gold, mid.light)} stroke="#3a2408" strokeWidth={2} /><circle cx={0} cy={6} r={8} fill="#e0203a" /></Feat>
      {/* brows: red band, gold edge, curling up and out */}
      <Feat u={-0.42} y={-118} t={t}>
        <path d="M100 18 C40 -20 -40 -30 -120 -8 C-150 -40 -150 -80 -120 -96 C-118 -66 -100 -50 -70 -48 C-10 -52 60 -30 110 0 Z" fill={lit("#b0142a", eL.light)} stroke={lit(C.gold, eL.light)} strokeWidth={6} />
        <path d={spiralD(20, 1.4, -1)} transform="translate(-122,-80)" stroke={lit(C.gold, eL.light)} strokeWidth={4} fill="none" />
      </Feat>
      <Feat u={0.42} y={-118} t={t}>
        <path d="M-100 18 C-40 -20 40 -30 120 -8 C150 -40 150 -80 120 -96 C118 -66 100 -50 70 -48 C10 -52 -60 -30 -110 0 Z" fill={lit("#b0142a", eR.light)} stroke={lit(C.gold, eR.light)} strokeWidth={6} />
        <path d={spiralD(20, 1.4, 1)} transform="translate(122,-80) scale(-1,1)" stroke={lit(C.gold, eR.light)} strokeWidth={4} fill="none" />
      </Feat>
      <Feat u={-0.4} y={-46} t={t}><g transform="scale(-1,1)"><Eye k={eL.light} big={1.08} /></g></Feat>
      <Feat u={0.4} y={-46} t={t}><Eye k={eR.light} big={1.08} /></Feat>
      {/* cheek scrolls painted in gold */}
      <Feat u={-0.66} y={70} t={t}><path d={spiralD(30, 1.7, 1)} stroke={lit(C.gold, eL.light)} strokeWidth={5} fill="none" /><path d={spiralD(18, 1.5, 1)} transform="translate(-20,52)" stroke={lit(C.gold, eL.light)} strokeWidth={4} fill="none" /></Feat>
      <Feat u={0.66} y={70} t={t}><g transform="scale(-1,1)"><path d={spiralD(30, 1.7, 1)} stroke={lit(C.gold, eR.light)} strokeWidth={5} fill="none" /><path d={spiralD(18, 1.5, 1)} transform="translate(-20,52)" stroke={lit(C.gold, eR.light)} strokeWidth={4} fill="none" /></g></Feat>
      {/* flared nose */}
      <Feat u={0} y={44} t={t}>
        <path d="M-58 34 C-66 4 -34 -10 -22 -64 C-10 -84 10 -84 22 -64 C34 -10 66 4 58 34 C36 52 -36 52 -58 34 Z" fill={lit(C.demon, mid.light * 1.08)} stroke={lit(C.gold, mid.light)} strokeWidth={4} />
        <path d="M-40 26 C-30 12 -14 14 -12 28 M40 26 C30 12 14 14 12 28" stroke="#06200e" strokeWidth={6} fill="none" />
      </Feat>
      {/* mouth: gilt lips, a row of teeth, upturned fangs, a gold moustache line */}
      <Feat u={0} y={176} t={t}>
        <path d="M-200 -26 C-150 -60 -60 -40 0 -34 C60 -40 150 -60 200 -26" stroke={lit(C.gold, mid.light)} strokeWidth={8} fill="none" />
        <path d="M-180 -10 C-100 36 100 36 180 -10 C130 82 -130 82 -180 -10 Z" fill={lit(C.lip, mid.light)} stroke={lit(C.gold, mid.light)} strokeWidth={5} />
        <path d="M-150 4 C-80 30 80 30 150 4 L146 22 C80 46 -80 46 -146 22 Z" fill="#fff6e8" stroke="#7a6a5a" strokeWidth={1.5} />
        <path d={Array.from({ length: 11 }, (_, i) => `M${-130 + i * 26} ${12 + Math.sin((i / 10) * Math.PI) * 14} l0 22`).join(" ")} stroke="#9a8a7a" strokeWidth={1.5} />
        <path d="M-128 12 C-146 -40 -124 -96 -98 -120 C-102 -70 -98 -30 -86 18 Z" fill="#fffaf0" stroke="#6a5a4a" strokeWidth={2.5} />
        <path d="M128 12 C146 -40 124 -96 98 -120 C102 -70 98 -30 86 18 Z" fill="#fffaf0" stroke="#6a5a4a" strokeWidth={2.5} />
      </Feat>
      <path d="M-124 304 Q0 344 124 304 L104 336 Q0 366 -104 336 Z" fill="url(#n26-gold)" stroke={C.goldDeep} strokeWidth={3} />
    </g>
  );
};

// Monkey hero mask: white lacquered face, round eyes ringed with gold and green paint, red-lined cheeks, an open
// grin with two rows of teeth, a gilt diadem with a short spire.
const MONKEY_FACE = "M-272 -230 C-314 -120 -314 0 -284 92 C-252 192 -172 272 -62 298 L62 298 C172 272 252 192 284 92 C314 0 314 -120 272 -230 Z";
export const MonkeyMask = ({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: Turn }) => {
  const squash = 1 - 0.12 * Math.abs(Math.sin(t.yaw));
  const shift = t.R * 0.2 * Math.sin(t.yaw);
  const eL = place(-0.38, t), eR = place(0.38, t), mid = place(0, t);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#n26-shadow)">
      <Collar t={t} y={210} w={360} />
      {[-1, 1].filter((side) => Math.cos(Math.asin(0.97 * side) + t.yaw) > -0.15).map((side) => (
        <g key={side} transform={`translate(${side * t.R * 0.98 + shift},${-6}) scale(${side},1)`}>
          <path d={kranok(130, 190)} fill="url(#n26-goldv)" stroke={C.goldDeep} strokeWidth={3} transform="rotate(-18)" />
          <path d={kranok(84, 120)} fill="#1a6a3a" stroke="#fff0b0" strokeWidth={2} transform="translate(16,4) rotate(-18)" />
        </g>
      ))}
      <g transform="translate(0,-236)"><Crown t={t} h={300} w={250} tiers={5} /></g>
      <g transform={`translate(${shift},0) scale(${squash},1)`}>
        <path d={MONKEY_FACE} fill="url(#n26-monkey)" stroke="#5a4a3a" strokeWidth={4} />
        <FaceShade d={MONKEY_FACE} t={t} />
      </g>
      <path d="M-280 -232 Q0 -282 280 -232 L268 -186 Q0 -228 -268 -186 Z" fill="url(#n26-gold)" stroke={C.goldDeep} strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => { const p = place(-0.84 + i * 0.21, t); return p.vis ? <ellipse key={i} cx={p.x} cy={-209} rx={9 * p.sx + 1} ry={9} fill={i % 2 ? "#1fbf6a" : "#e0203a"} stroke="#fff3c0" strokeWidth={1.5} /> : null; })}
      {/* diamond mark on the forehead */}
      <Feat u={0} y={-140} t={t}><path d="M0 -34 L22 0 L0 34 L-22 0 Z" fill={lit(C.gold, mid.light)} stroke="#3a2408" strokeWidth={2} /><path d="M0 -16 L10 0 L0 16 L-10 0 Z" fill="#1fbf6a" /></Feat>
      {/* gold and green paint round the eyes, red lines on the cheeks */}
      {[-1, 1].map((sd) => {
        const e = sd < 0 ? eL : eR;
        return (
          <g key={sd}>
            <Feat u={sd * 0.4} y={-52} t={t}>
              <g transform={`scale(${sd},1)`}>
                <path d="M-110 40 C-130 -40 -60 -120 60 -104 C110 -96 130 -60 120 -20 C90 -70 20 -80 -30 -50 C-70 -24 -84 10 -80 50 Z" fill={lit("#2a8a4a", e.light)} stroke={lit(C.gold, e.light)} strokeWidth={6} />
                <path d={spiralD(16, 1.4, 1)} transform="translate(104,-48)" stroke={lit(C.gold, e.light)} strokeWidth={4} fill="none" />
              </g>
            </Feat>
            <Feat u={sd * 0.66} y={90} t={t}>
              <g transform={`scale(${sd},1)`}>
                <path d="M-40 -50 C0 -20 10 20 -20 60 M-14 -50 C26 -16 34 24 6 66 M12 -46 C50 -12 56 26 30 64" stroke={lit("#c0182a", e.light)} strokeWidth={6} fill="none" strokeLinecap="round" />
              </g>
            </Feat>
          </g>
        );
      })}
      <Feat u={-0.38} y={-30} t={t}><g transform="scale(-0.9,1.06)"><Eye k={eL.light} ring="#2a6a3a" tail={0.4} /></g></Feat>
      <Feat u={0.38} y={-30} t={t}><g transform="scale(0.9,1.06)"><Eye k={eR.light} ring="#2a6a3a" tail={0.4} /></g></Feat>
      <Feat u={0} y={64} t={t}>
        <path d="M-40 12 C-36 -34 36 -34 40 12 C22 30 -22 30 -40 12 Z" fill={lit("#e8c8b8", mid.light)} stroke={lit(C.gold, mid.light)} strokeWidth={4} />
        <circle cx={-14} cy={10} r={6} fill="#3a1a10" /><circle cx={14} cy={10} r={6} fill="#3a1a10" />
      </Feat>
      <Feat u={0} y={176} t={t}>
        <path d="M-176 -34 C-100 -6 100 -6 176 -34 C146 96 -146 96 -176 -34 Z" fill="#6a0610" stroke={lit(C.gold, mid.light)} strokeWidth={6} />
        <path d={Array.from({ length: 11 }, (_, i) => { const xx = -150 + i * 27.3; return `M${xx} -20 l13.6 30 l13.6 -30`; }).join(" ")} fill="#fffaf0" stroke="#8a7a6a" strokeWidth={1.5} />
        <path d={Array.from({ length: 9 }, (_, i) => { const xx = -112 + i * 25; return `M${xx} 62 l12.5 -26 l12.5 26`; }).join(" ")} fill="#fffaf0" stroke="#8a7a6a" strokeWidth={1.5} />
        <path d="M-60 40 C-30 56 30 56 60 40" stroke="#c0182a" strokeWidth={10} fill="none" />
      </Feat>
    </g>
  );
};

// ---------- light, glitter, fire ----------
export const Glitter = ({ frame, n = 70, seed = 1, area = [0, 0, 1080, 1920] }: { frame: number; n?: number; seed?: number; area?: number[] }) => (
  <g fill="#fff4c8">
    {Array.from({ length: n }, (_, i) => {
      const x = area[0] + random(`gx${seed}${i}`) * area[2];
      const y0 = area[1] + random(`gy${seed}${i}`) * area[3];
      const y = ((y0 - frame * (0.6 + random(`gv${seed}${i}`) * 1.4)) % area[3] + area[3]) % area[3] + area[1];
      const tw = Math.max(0, Math.sin(frame * 0.18 + i * 2.3)) ** 4;
      const s = 3 + tw * 13;
      return tw > 0.05 ? <path key={i} d={`M${x} ${y - s} L${x + 1.6} ${y - 1.6} L${x + s} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + s} L${x - 1.6} ${y + 1.6} L${x - s} ${y} L${x - 1.6} ${y - 1.6} Z`} opacity={tw} filter="url(#n26-bloom)" /> : <circle key={i} cx={x} cy={y} r={1.6} opacity={0.5} />;
    })}
  </g>
);

// Fire: soft, blurred flame tongues licking up (three layers, the core brighter), embers rising.
export const Flames = ({ frame, x, y, w, h, k = 1 }: { frame: number; x: number; y: number; w: number; h: number; k?: number }) => (
  <g opacity={k}>
    <rect x={x - w} y={y - h * 1.4} width={w * 2} height={h * 1.7} fill="url(#n26-fire)" style={{ mixBlendMode: "screen" }} />
    <g filter="url(#n26-flame)" style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: 11 }, (_, i) => {
        const fx = x - w * 0.85 + (i / 10) * w * 1.7;
        const fh = h * (0.5 + 0.5 * random(`fh${i}`)) * (0.82 + 0.2 * Math.sin(frame * 0.31 + i * 1.7));
        const sway = Math.sin(frame * 0.17 + i * 0.9) * 40;
        const fw = 60 + random(`fw${i}`) * 50;
        const d = (s: number) => `M${fx - fw * s} ${y} C${fx - fw * s * 1.1} ${y - fh * s * 0.45} ${fx + sway * s - fw * 0.4 * s} ${y - fh * s * 0.6} ${fx + sway * 1.3 * s} ${y - fh * s} C${fx + sway * s + fw * 0.3 * s} ${y - fh * s * 0.55} ${fx + fw * s * 1.1} ${y - fh * s * 0.4} ${fx + fw * s} ${y} Z`;
        return (
          <g key={i}>
            <path d={d(1)} fill="#e8401a" opacity={0.55} />
            <path d={d(0.7)} fill="#ff9a2a" opacity={0.7} />
            <path d={d(0.42)} fill="#ffe08a" opacity={0.85} />
          </g>
        );
      })}
    </g>
    {Array.from({ length: 46 }, (_, i) => {
      const ex = x - w + random(`ex${i}`) * w * 2 + Math.sin(frame * 0.1 + i) * 24;
      const ey = y - ((frame * (3 + random(`ev${i}`) * 4) + random(`ey${i}`) * 1000) % 1000);
      return <circle key={`e${i}`} cx={ex} cy={ey} r={2 + random(`er${i}`) * 3} fill="#ffcf6a" opacity={0.9} filter="url(#n26-bloom)" />;
    })}
  </g>
);
