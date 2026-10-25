import { circ, Cut, diamond, leaf, moon, P, rect, saw, slit } from "./Paper";

// N04 cuts: figures and sets as red paper silhouettes with cut-out detail (crescents, saw teeth, lattice,
// spirals). Local units: figures 100 tall, feet at y = 0, facing right. Mirror with scale(-1,1).

type Hat = "bun" | "official" | "turban" | "crown" | "eunuch";
type Hold = "none" | "halberd" | "spear" | "torch" | "hoe" | "scroll";

// A person: wide-sleeved robe, round head with a crescent eye. sway/step animate the whole piece (paper does
// not bend). raise lifts the near arm.
export const Person = ({ hat = "bun", hold = "none", raise = 0, beard = false, t = 0, walk = false }: { hat?: Hat; hold?: Hold; raise?: number; beard?: boolean; t?: number; walk?: boolean }) => {
  const bob = walk ? Math.abs(Math.sin(t / 5)) * -3 : 0;
  const tip = walk ? Math.sin(t / 5) * 2.5 : Math.sin(t / 18) * 1;
  const robe =
    "M-17 0 L-13 -50 Q0 -60 12 -50 L19 0 L9 0 L7 -4 L-2 -4 L-4 0 Z " +
    [moon(-6, -38, 3.4), moon(4, -38, 3.4), moon(-1, -27, 3.4), moon(9, -27, 3.2), moon(-9, -27, 3)].join(" ") +
    " " + slit(-12.5, -45, 13, -45, 2.2) + " " + saw(-14, 17, -8, 4.5, 7);
  const arm = raise > 0
    ? `M4 -52 Q18 ${-60 - raise * 10} ${22} ${-70 - raise * 18} L28 ${-66 - raise * 18} Q22 ${-50 - raise * 6} 10 -42 Z ` + moon(14, -54 - raise * 6, 2.6, 0.6)
    : "M3 -51 Q22 -48 27 -33 L18 -29 Q12 -40 3 -40 Z " + moon(15, -40, 2.6, 0.4);
  const head = circ(2, -68, 10.5) + " " + moon(6.5, -70, 3.4, Math.PI) + " " + slit(5, -62.5, 10.5, -63.5, 1.4) + " " + moon(-3, -66, 2.4, -0.5);
  const hand = raise > 0 ? [24, -72 - raise * 18] : [24, -32];
  return (
    <g transform={`translate(0,${bob}) rotate(${tip})`}>
      {hold === "halberd" && <Cut d={slit(hand[0] - 14, 0, hand[0] + 10, -120, 2.6) + " " + `M${hand[0] + 8} -118 Q${hand[0] + 26} -122 ${hand[0] + 28} -104 Q${hand[0] + 18} -110 ${hand[0] + 10} -104 Z`} />}
      {hold === "spear" && <Cut d={slit(hand[0] - 10, 4, hand[0] + 6, -118, 2.4) + ` M${hand[0] + 6} -132 l4 14 l-8 0 Z`} />}
      {hold === "hoe" && <Cut d={slit(hand[0] - 6, -20, hand[0] + 4, -96, 2.4) + ` M${hand[0] - 2} -100 l16 4 l-2 6 l-16 -4 Z`} />}
      <Cut d={robe} />
      <Cut d={arm} />
      <Cut d={head} />
      {beard && <Cut d={`M2 -60 Q8 -50 14 -54 Q10 -60 9 -62 Z`} />}
      {hat === "bun" && <Cut d={circ(-2, -80, 5) + " " + slit(-9, -79, 5, -81, 1.6)} />}
      {hat === "official" && <Cut d={"M-9 -77 L-7 -90 L10 -90 L12 -77 Z " + slit(-16, -86, 18, -86, 2.4) + " " + diamond(1.5, -83, 2.4, 3)} />}
      {hat === "eunuch" && <Cut d={"M-10 -76 Q2 -96 13 -76 Z " + circ(1.5, -82, 2.4)} />}
      {hat === "crown" && <Cut d={"M-10 -76 L-12 -92 L-5 -84 L1.5 -96 L8 -84 L15 -92 L13 -76 Z " + circ(1.5, -82, 2)} color={P.gold} />}
      {hat === "turban" && <Cut d={"M-11 -74 Q2 -88 14 -74 L14 -70 Q2 -76 -11 -70 Z M-11 -73 Q-20 -70 -22 -60 Q-16 -66 -10 -68 Z"} color={P.gold} lift={2} />}
      {hold === "torch" && (
        <g>
          <Cut d={slit(hand[0] - 2, hand[1] + 30, hand[0] + 2, hand[1] - 6, 3)} />
          <Flame x={hand[0] + 2} y={hand[1] - 6} s={0.55} t={t} />
        </g>
      )}
      {hold === "scroll" && <Cut d={rect(hand[0] - 4, hand[1] - 10, 16, 20) + " " + slit(hand[0], hand[1] - 4, hand[0] + 8, hand[1] - 4, 1.2) + " " + slit(hand[0], hand[1] + 2, hand[0] + 8, hand[1] + 2, 1.2)} color={P.gold} lift={2} />}
    </g>
  );
};

// Layered paper flame: deep red, orange and gold sheets flickering (scaleY).
export const Flame = ({ x, y, s = 1, t }: { x: number; y: number; s?: number; t: number }) => {
  const k = (i: number) => 1 + Math.sin(t / 3 + i * 2) * 0.08;
  const fl = (h: number) => `M-20 0 Q-26 ${-h * 0.4} -12 ${-h * 0.6} Q-10 ${-h * 0.8} -4 ${-h * 0.75} Q0 ${-h} 6 ${-h * 0.8} Q12 ${-h * 0.62} 14 ${-h * 0.7} Q24 ${-h * 0.4} 20 0 Z`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g transform={`scale(1,${k(0)})`}><Cut d={fl(70) + " " + moon(-4, -26, 3.5, Math.PI)} color={P.red} lift={2} /></g>
      <g transform={`scale(0.72,${0.75 * k(1)})`}><Cut d={fl(70) + " " + diamond(0, -22, 3, 5)} color={P.orange} lift={2} /></g>
      <g transform={`scale(0.42,${0.48 * k(2)})`}><Cut d={fl(70)} color={P.gold} lift={2} /></g>
    </g>
  );
};

// Full moon in gold paper with a red cloud cut across it.
export const MoonDisc = ({ r = 60 }: { r?: number }) => (
  <g>
    <Cut d={circ(0, 0, r) + " " + [0, 1, 2, 3, 4, 5].map((i) => moon(Math.cos(i) * r * 0.55, Math.sin(i) * r * 0.55 - r * 0.1, r * 0.08, i)).join(" ")} color={P.gold} />
    <g transform={`translate(${-r * 0.2},${r * 0.45}) scale(${r / 60})`}><Cloud /></g>
  </g>
);

// Ruyi cloud: three lobes with spiral cuts; ~80 wide.
export const Cloud = () => (
  <Cut
    d={
      "M-40 10 Q-46 -6 -30 -10 Q-28 -26 -10 -22 Q0 -36 16 -24 Q34 -28 34 -10 Q48 -4 40 10 Z " +
      moon(-26, -2, 6, Math.PI) + " " + moon(-8, -12, 7, Math.PI) + " " + moon(14, -12, 7, Math.PI) + " " + moon(30, 0, 5, Math.PI) +
      " " + saw(-34, 36, 8, 4, 10)
    }
  />
);

// Willow: trunk with hanging strands of leaf cuts. ~160 tall.
export const Willow = ({ t = 0 }: { t?: number }) => (
  <g>
    <Cut d={"M-10 0 Q-2 -50 -18 -100 Q-24 -118 -10 -136 L-2 -132 Q-12 -116 -6 -100 Q10 -54 8 0 Z " + moon(-2, -40, 3.5, 1.4) + " " + moon(-8, -80, 3.5, 1.4) + " " + saw(-8, 6, -3, 4, 3)} />
    <Cut d={"M-80 -126 Q-50 -168 -6 -150 Q40 -172 76 -130 Q70 -118 60 -124 Q30 -152 -6 -136 Q-46 -150 -70 -118 Q-78 -116 -80 -126 Z " + moon(-40, -146, 5, Math.PI) + " " + moon(30, -148, 5, Math.PI)} />
    {Array.from({ length: 10 }, (_, i) => {
      const x = -70 + i * 15, top = -130 - Math.sin((i / 9) * Math.PI) * 26, sw = Math.sin(t / 22 + i) * 5, end = -24 - (i % 3) * 16;
      const d = `M${x} ${top} Q${x + sw * 0.5 + (x < 0 ? -4 : 4)} ${(top + end) / 2} ${x + sw} ${end} L${x + sw + 2.6} ${end} Q${x + sw * 0.5 + 2.6 + (x < 0 ? -4 : 4)} ${(top + end) / 2} ${x + 2.6} ${top} Z`;
      const leaves = Array.from({ length: 5 }, (_, j) => {
        const k = (j + 1) / 6;
        return leaf(x + sw * k + (x < 0 ? -4 : 4) * Math.sin(k * Math.PI) + (j % 2 ? 4.5 : -3), top + (end - top) * k, 5.5, j % 2 ? 0.7 : -0.7);
      }).join(" ");
      return <Cut key={i} d={d + " " + leaves} />;
    })}
  </g>
);

// Farmhouse: lattice window, tiled roof with slits. ~120 wide, 100 tall.
export const Farmhouse = () => {
  const lattice = Array.from({ length: 9 }, (_, i) => rect(-38 + (i % 3) * 8, -50 + Math.floor(i / 3) * 8, 6, 6)).join(" ");
  const tiles = Array.from({ length: 8 }, (_, i) => slit(-44 + i * 12, -66, -50 + i * 12, -88, 2)).join(" ");
  return (
    <g>
      <Cut d={"M-50 0 L-50 -62 L50 -62 L50 0 Z " + lattice + " " + rect(10, -40, 18, 40) + " " + saw(-46, -6, -4, 5, 6)} />
      <Cut d={"M-66 -60 Q-40 -66 -30 -96 L30 -96 Q40 -66 66 -60 Z " + tiles} />
      <Cut d={"M-40 -96 L40 -96 L44 -102 L-44 -102 Z"} color={P.deep} />
    </g>
  );
};

// Palace hall: double roof with upturned eaves, red columns, lattice doors, steps. ~300 wide, ~230 tall.
export const Hall = () => {
  const doors = Array.from({ length: 4 }, (_, i) => Array.from({ length: 12 }, (_, j) => rect(-92 + i * 48 + (j % 3) * 11, -118 + Math.floor(j / 3) * 22, 8, 18)).join(" ")).join(" ");
  return (
    <g>
      <Cut d={"M-150 0 L150 0 L140 -20 L-140 -20 Z " + saw(-140, 140, -4, 8, 20)} color={P.deep} />
      <Cut d={"M-110 -20 L110 -20 L110 -130 L-110 -130 Z " + doors} />
      <Cut d={"M-160 -128 Q-120 -140 -110 -170 L110 -170 Q120 -140 160 -128 Q170 -126 176 -138 Q172 -116 150 -118 L-150 -118 Q-172 -116 -176 -138 Q-170 -126 -160 -128 Z " + Array.from({ length: 14 }, (_, i) => slit(-96 + i * 15, -126, -100 + i * 15, -164, 2.4)).join(" ")} />
      <Cut d={"M-80 -168 L80 -168 L80 -190 L-80 -190 Z " + Array.from({ length: 6 }, (_, i) => diamond(-60 + i * 24, -179, 5, 6)).join(" ")} color={P.deep} />
      <Cut d={"M-120 -188 Q-90 -196 -84 -220 L84 -220 Q90 -196 120 -188 Q130 -186 134 -198 Q130 -178 110 -180 L-110 -180 Q-130 -178 -134 -198 Q-130 -186 -120 -188 Z " + circ(0, -202, 8) + " " + moon(-40, -200, 5, Math.PI) + " " + moon(40, -200, 5, Math.PI)} />
      <Cut d={"M-90 -220 L90 -220 L80 -228 L-80 -228 Z M-96 -226 q-6 -14 6 -18 l2 6 q-6 2 -2 10 Z M96 -226 q6 -14 -6 -18 l-2 6 q6 2 2 10 Z"} color={P.gold} />
    </g>
  );
};

// County office gate with a plaque; burn 0..1 adds flames along the roof. ~220 wide.
export const OfficeGate = ({ burn = 0, t = 0 }: { burn?: number; t?: number }) => (
  <g>
    <Cut d={"M-100 0 L-100 -110 L100 -110 L100 0 L40 0 L40 -70 Q0 -96 -40 -70 L-40 0 Z " + Array.from({ length: 6 }, (_, i) => rect(-92 + (i % 2) * 22, -100 + Math.floor(i / 2) * 30, 14, 22)).join(" ") + " " + Array.from({ length: 6 }, (_, i) => rect(64 + (i % 2) * 14, -100 + Math.floor(i / 2) * 30, 10, 22)).join(" ")} />
    <Cut d={"M-124 -106 Q-100 -116 -92 -140 L92 -140 Q100 -116 124 -106 Q132 -104 136 -116 Q130 -96 110 -98 L-110 -98 Q-130 -96 -136 -116 Q-132 -104 -124 -106 Z " + Array.from({ length: 10 }, (_, i) => slit(-80 + i * 18, -104, -84 + i * 18, -136, 2.4)).join(" ")} />
    <Cut d={"M-30 -150 L30 -150 L30 -176 L-30 -176 Z " + slit(-20, -163, 20, -163, 2)} color={P.gold} lift={2} />
    {burn > 0 && [-80, -30, 20, 70].map((x, i) => <Flame key={x} x={x} y={-130} s={(0.9 + (i % 2) * 0.4) * burn} t={t + i * 7} />)}
  </g>
);

// Chest of coins (gold paper lid).
export const Chest = () => (
  <g>
    <Cut d={"M-30 0 L-30 -30 L30 -30 L30 0 Z " + circ(0, -16, 5) + " " + saw(-26, 26, -3, 4, 8)} />
    <Cut d={"M-32 -30 Q0 -50 32 -30 Z " + diamond(0, -36, 4, 3)} color={P.gold} lift={2} />
  </g>
);

// Ground band inside a window: rolling hills with wave cuts (symmetric, for the fold).
export const Ground = ({ cx, y, R }: { cx: number; y: number; R: number }) => {
  const waves = Array.from({ length: 14 }, (_, i) => moon(cx - R + (i + 0.5) * ((2 * R) / 14), y + R * 0.1, R * 0.03, Math.PI)).join(" ");
  const waves2 = Array.from({ length: 13 }, (_, i) => moon(cx - R + (i + 1) * ((2 * R) / 14), y + R * 0.2, R * 0.03, Math.PI)).join(" ");
  return <Cut color={P.deep} d={`M${cx - R} ${y + R} L${cx - R} ${y} Q${cx - R * 0.5} ${y - R * 0.12} ${cx} ${y} Q${cx + R * 0.5} ${y - R * 0.12} ${cx + R} ${y} L${cx + R} ${y + R} Z ` + waves + " " + waves2} />;
};

// Symmetric pair of clouds for a window's upper half.
export const CloudPair = ({ cx, y, dx, s }: { cx: number; y: number; dx: number; s: number }) => (
  <g>
    <g transform={`translate(${cx - dx},${y}) scale(${s})`}><Cloud /></g>
    <g transform={`translate(${cx + dx},${y}) scale(${-s},${s})`}><Cloud /></g>
  </g>
);

// A corner flower for the page corners (quarter fan of petals).
export const Corner = ({ s = 1 }: { s?: number }) => (
  <g transform={`scale(${s})`}>
    <Cut d={"M0 0 L160 0 Q150 40 120 50 Q110 110 50 120 Q40 150 0 160 Z " + [0.2, 0.5, 0.8].map((a) => moon(Math.cos(a * 1.57) * 90, Math.sin(a * 1.57) * 90, 10, a * 1.57 - 1.57)).join(" ") + " " + circ(40, 40, 10) + " " + [0.15, 0.85].map((a) => leaf(Math.cos(a * 1.57) * 130, Math.sin(a * 1.57) * 130, 9, a * 1.57)).join(" ")} />
  </g>
);
