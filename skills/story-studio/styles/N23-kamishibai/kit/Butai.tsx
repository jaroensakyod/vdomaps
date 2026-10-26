import type { ReactNode } from "react";

// Kamishibai pieces: a small wooden box stage (butai) whose doors open, and painted story cards that slide out
// through the side slot one by one. Cards are painted in opaque gouache: flat matte colour, wobbly brushed edges,
// paper tooth. Coordinates are for a 1080×1920 frame; a card is drawn in its own 840×630 space.
export const BOX = { x0: 60, y0: 330, x1: 1020, y1: 1110 }; // outer box
export const OPEN = { x: 120, y: 410, w: 840, h: 630 }; // stage opening = card size
export const G = { vermilion: "#d4512e", ochre: "#e2a63b", viridian: "#2e7b67", ultra: "#2b4a8e", cream: "#f2e4c4", ink: "#2a211d", skin: "#c9875a", wood: "#8a5632", woodLo: "#4e2d17", wall: "#2a6aa8" };

export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const ButaiDefs = () => (
  <defs>
    {/* gouache: slightly wobbly brushed edges, gentle chalky mottling, paper tooth — still flat and opaque */}
    <filter id="ks-gouache" x="-0.02" y="-0.02" width="1.04" height="1.04">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={5} result="wob" />
      <feDisplacementMap in="SourceGraphic" in2="wob" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves={3} seed={9} result="mot" />
      <feColorMatrix in="mot" type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 0 0 0.5 -0.2" result="light" />
      <feComposite in="light" in2="d" operator="in" result="lightIn" />
      <feComposite in="lightIn" in2="d" operator="arithmetic" k1={0} k2={0.22} k3={1} k4={0} result="m" />
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={2} result="tooth" />
      <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.5 -0.18" result="toothA" />
      <feComposite in="toothA" in2="m" operator="in" result="toothIn" />
      <feMerge><feMergeNode in="m" /><feMergeNode in="toothIn" /></feMerge>
    </filter>
    <filter id="ks-wood" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.16" numOctaves={3} seed={21} />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.04  0 0 0 0.75 -0.1" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="ks-woodv" x="0" y="0" width="1" height="1">
      <feTurbulence type="fractalNoise" baseFrequency="0.16 0.006" numOctaves={3} seed={23} />
      <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.04  0 0 0 0.75 -0.1" />
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="ks-plaster">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={4} seed={31} />
      <feColorMatrix values="0 0 0 0 0.8  0 0 0 0 0.9  0 0 0 0 1  0 0 0 0.12 0" />
    </filter>
    <filter id="ks-shadow" x="-0.2" y="-0.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation={18} /></filter>
    <radialGradient id="ks-spot" cx="0.5" cy="0.36" r="0.7">
      <stop offset="0" stopColor="#6aa6da" stopOpacity={0.8} />
      <stop offset="0.6" stopColor="#2a6aa8" stopOpacity={0.3} />
      <stop offset="1" stopColor="#0f2a48" stopOpacity={0.85} />
    </radialGradient>
    <clipPath id="ks-open"><rect x={OPEN.x} y={OPEN.y} width={OPEN.w} height={OPEN.h} /></clipPath>
    {/* a card pulled out shows inside the opening and beyond the right-hand slot */}
    <clipPath id="ks-slot"><rect x={OPEN.x} y={OPEN.y} width={2000} height={OPEN.h} /></clipPath>
  </defs>
);

// The wall behind: warm plaster under a soft spotlight, with the box's cast shadow.
export const Wall = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill={G.wall} />
    <rect x={0} y={0} width={1080} height={1920} filter="url(#ks-plaster)" />
    <rect x={0} y={0} width={1080} height={1920} fill="url(#ks-spot)" />
    <rect x={BOX.x0 + 40} y={BOX.y0 + 60} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0 + 40} rx={20} fill="#2a1a10" opacity={0.45} filter="url(#ks-shadow)" />
  </g>
);

// A card in its own 840×630 space, painted: put shapes inside, the filter makes them gouache.
export const Card = ({ x, y, children, n, total }: { x: number; y: number; children: ReactNode; n?: number; total?: number }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={OPEN.w} height={OPEN.h} fill={G.cream} />
    <g filter="url(#ks-gouache)">{children}</g>
    {/* the white margin and the card number a performer reads from */}
    <rect x={0} y={0} width={OPEN.w} height={OPEN.h} fill="none" stroke="#efe6d2" strokeWidth={10} />
    {n !== undefined && <text x={OPEN.w - 22} y={OPEN.h - 20} textAnchor="end" fontSize={20} fill="#6b5a48" opacity={0.7}>{n}/{total}</text>}
  </g>
);

// Stage: `back` is the next card (still in the box), `front` the current one, pulled right by `pull` 0 → 1.
export const Stage = ({ back, front, pull }: { back?: ReactNode; front: ReactNode; pull: number }) => (
  <g>
    <rect x={OPEN.x} y={OPEN.y} width={OPEN.w} height={OPEN.h} fill="#1c120b" />
    {back && <g clipPath="url(#ks-open)">{back}</g>}
    <g clipPath="url(#ks-slot)">
      <g transform={`translate(${pull * (OPEN.w + 80)},0)`}>
        {front}
        <rect x={OPEN.x - 14} y={OPEN.y} width={14} height={OPEN.h} fill="#000" opacity={pull > 0 ? 0.25 : 0} />
      </g>
    </g>
  </g>
);

// The wooden box frame: thick bevelled border with grain, a right-hand slot, a title plate, a stand below.
export const Box = ({ title, font }: { title: string; font: string }) => {
  const { x0, y0, x1, y1 } = BOX;
  const frame = `M${x0} ${y0} H${x1} V${y1} H${x0} Z M${OPEN.x} ${OPEN.y} V${OPEN.y + OPEN.h} H${OPEN.x + OPEN.w} V${OPEN.y} Z`;
  return (
    <g>
      {/* stand: two legs and a cross bar */}
      <rect x={250} y={y1} width={34} height={600} fill={G.woodLo} />
      <rect x={796} y={y1} width={34} height={600} fill={G.woodLo} />
      <rect x={250} y={y1} width={34} height={600} fill={G.woodLo} filter="url(#ks-woodv)" />
      <rect x={796} y={y1} width={34} height={600} fill={G.woodLo} filter="url(#ks-woodv)" />
      <rect x={230} y={y1 + 470} width={620} height={26} fill={G.woodLo} />
      <rect x={210} y={y1 + 590} width={660} height={30} rx={6} fill="#3a2010" />
      {/* the teller's wooden clappers, tied with a cord, resting on the shelf */}
      <g transform={`translate(470,${y1 + 470}) rotate(-4)`}>
        <rect x={-120} y={-34} width={240} height={30} rx={8} fill="#c99a62" />
        <rect x={-110} y={-62} width={240} height={30} rx={8} fill="#b4824e" />
        <path d="M-118 -30 Q-150 -10 -136 14 Q-120 30 -100 18" fill="none" stroke={G.vermilion} strokeWidth={5} />
      </g>
      <path d={frame} fillRule="evenodd" fill={G.wood} />
      <path d={frame} fillRule="evenodd" filter="url(#ks-woodv)" />
      {/* bevel: light on top/left inner edge, dark on bottom/right */}
      <path d={`M${OPEN.x - 16} ${OPEN.y - 16} H${OPEN.x + OPEN.w + 16} L${OPEN.x + OPEN.w} ${OPEN.y} H${OPEN.x} V${OPEN.y + OPEN.h} L${OPEN.x - 16} ${OPEN.y + OPEN.h + 16} Z`} fill="#2e170a" opacity={0.55} />
      <path d={`M${OPEN.x + OPEN.w + 16} ${OPEN.y - 16} V${OPEN.y + OPEN.h + 16} H${OPEN.x - 16} L${OPEN.x} ${OPEN.y + OPEN.h} H${OPEN.x + OPEN.w} V${OPEN.y} Z`} fill="#c08a58" opacity={0.5} />
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke="#3b200e" strokeWidth={6} />
      <rect x={x0 + 8} y={y0 + 8} width={x1 - x0 - 16} height={6} fill="#c79466" opacity={0.6} />
      {/* the slot the cards come out of */}
      <rect x={x1 - 6} y={OPEN.y - 4} width={10} height={OPEN.h + 8} fill="#140a05" />
      {/* corner brass */}
      {[[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([cx, cy], i) => <path key={i} d={`M${cx} ${cy} l${cx === x0 ? 46 : -46} 0 l0 ${cy === y0 ? 10 : -10} l${cx === x0 ? -36 : 36} 0 l0 ${cy === y0 ? 36 : -36} l${cx === x0 ? -10 : 10} 0 Z`} fill="#c7a052" />)}
      {/* title plate */}
      <rect x={340} y={y0 + 14} width={400} height={50} rx={6} fill="#efe1bf" stroke="#3b200e" strokeWidth={3} />
      <text x={540} y={y0 + 51} textAnchor="middle" fontFamily={font} fontSize={32} fill={G.ink}>{title}</text>
    </g>
  );
};

// The two doors, hinged at the sides of the opening. open 0 (closed, meeting in the middle) → 1 (swung out
// past the hinges, seen almost edge-on). The outer edge grows taller as it swings toward the viewer.
export const Doors = ({ open }: { open: number }) => {
  const phi = open * Math.PI * 0.9;
  const half = OPEN.w / 2 + 20;
  const top = OPEN.y - 20, bot = OPEN.y + OPEN.h + 20;
  const door = (side: -1 | 1) => {
    const hinge = side < 0 ? OPEN.x - 20 : OPEN.x + OPEN.w + 20;
    const inward = -side; // left door spans to the right when closed
    const ex = hinge + inward * half * Math.cos(phi);
    const grow = Math.sin(phi) * 40;
    const d = `M${hinge} ${top} L${ex} ${top - grow} L${ex} ${bot + grow} L${hinge} ${bot} Z`;
    const inside = Math.cos(phi) < 0; // we now see the door's inner face
    return (
      <g key={side}>
        <path d={d} fill={inside ? "#5e331a" : G.wood} />
        <path d={d} filter="url(#ks-woodv)" />
        {!inside && <path d={`M${hinge + inward * 30 * Math.cos(phi)} ${top + 40} L${ex - inward * 30 * Math.cos(phi)} ${top + 40 - grow} L${ex - inward * 30 * Math.cos(phi)} ${bot - 40 + grow} L${hinge + inward * 30 * Math.cos(phi)} ${bot - 40} Z`} fill="none" stroke="#5a3218" strokeWidth={5} />}
        <path d={d} fill="none" stroke="#3b200e" strokeWidth={4} />
        {!inside && <circle cx={ex - inward * 26 * Math.cos(phi)} cy={(top + bot) / 2} r={9} fill="#c7a052" />}
      </g>
    );
  };
  return <g>{door(-1)}{door(1)}</g>;
};
