import type { ReactNode } from "react";

// N35 kit: colour southern Thai shadow puppets on a white lit screen inside a small performance hut. 1080×1920.
// Puppets are translucent dyed hide: colour fills multiplied onto the screen (`mixBlendMode: multiply`), a dark
// outline, and punched holes that let pure lamp light through. A puppet has a main rod and a thin rod to its
// moving hand; comic puppets also have a hinged jaw. `Depth` blurs and enlarges a puppet pulled back from the
// screen (the signature focus pull); `away` 0 = pressed on the cloth (sharp), 1 = far from it (soft, pale).

export const T = {
  night: "#0c1220",
  screen: "#fff3d6",
  edge: "#f0d9a4",
  lamp: "#fff7dc",
  border: "#1d3b8f",
  trim: "#c8202a",
  hide: "#2a140a", // outline
  wood: "#3a2414",
  thatch: ["#8a6a3a", "#b48a4a", "#5e4424"],
  text: "#fff2c4",
};
export const rnd = (seed: number) => {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

export const TalungDefs = () => (
  <defs>
    <radialGradient id="tl-screen" cx="0.5" cy="0.38" r="0.75">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.55" stopColor={T.screen} />
      <stop offset="0.85" stopColor={T.edge} />
      <stop offset="1" stopColor="#d9a860" />
    </radialGradient>
    <radialGradient id="tl-lamp" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={T.lamp} stopOpacity={0.9} />
      <stop offset="1" stopColor={T.lamp} stopOpacity={0} />
    </radialGradient>
    <filter id="tl-weave" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves={1} seed={2} />
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.9 -0.42" />
    </filter>
    {/* dyed hide: mottled density inside the puppet only (composited in its own alpha) */}
    <filter id="tl-hide" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={3} seed={6} result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0.35  0 0 0 0 0.16  0 0 0 0 0.05  0 0 0 1.4 -0.5" result="m" />
      <feComposite in="m" in2="SourceAlpha" operator="in" result="mi" />
      <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="mi" /></feMerge>
    </filter>
    <filter id="tl-bleed" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={16} /></filter>
    <filter id="tl-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
  </defs>
);

// The hut: night outside, thatch fringe, posts, the signboard and the lit screen with its cloth border.
export const Hut = ({ x, y, w, h, lamp, sign }: { x: number; y: number; w: number; h: number; lamp: number; sign: ReactNode }) => {
  const r = rnd(5);
  return (
    <g>
      <rect width={1080} height={1920} fill={T.night} />
      {/* glow of the screen on the hut */}
      <rect x={x - 80} y={y - 80} width={w + 160} height={h + 160} fill={T.lamp} opacity={0.22 * lamp} filter="url(#tl-glow)" />
      {/* posts */}
      <rect x={14} y={120} width={52} height={1800} fill={T.wood} />
      <rect x={1014} y={120} width={52} height={1800} fill={T.wood} />
      <rect x={14} y={120} width={12} height={1800} fill="#5a3a20" />
      {/* border cloth + red trim */}
      <rect x={x - 46} y={y - 46} width={w + 92} height={h + 92} fill={T.border} />
      <rect x={x - 46} y={y - 46} width={w + 92} height={h + 92} fill="none" stroke={T.trim} strokeWidth={14} />
      {Array.from({ length: 23 }, (_, i) => <circle key={i} cx={x - 20 + i * ((w + 40) / 22)} cy={y - 24} r={6} fill="#f2c43a" />)}
      {Array.from({ length: 23 }, (_, i) => <circle key={`b${i}`} cx={x - 20 + i * ((w + 40) / 22)} cy={y + h + 24} r={6} fill="#f2c43a" />)}
      {/* the screen */}
      <rect x={x} y={y} width={w} height={h} fill="url(#tl-screen)" />
      <ellipse cx={x + w / 2} cy={y + h * 0.38} rx={w * 0.42} ry={h * 0.36} fill="url(#tl-lamp)" opacity={lamp} />
      <rect x={x} y={y} width={w} height={h} filter="url(#tl-weave)" opacity={0.5} />
      {/* thatch fringe and signboard */}
      <g>
        <rect x={0} y={0} width={1080} height={210} fill={T.thatch[2]} />
        {Array.from({ length: 150 }, (_, i) => {
          const px = (i / 150) * 1100 - 10, len = 190 + r() * 120;
          return <path key={i} d={`M${px} 0 L${px + (r() - 0.5) * 14} ${len}`} stroke={T.thatch[i % 3]} strokeWidth={8 + r() * 6} strokeLinecap="round" />;
        })}
        <rect x={0} y={0} width={1080} height={300} fill="#000" opacity={0.25} />
        {sign}
      </g>
    </g>
  );
};

// Punched holes in a row (light shows through).
export const Holes = ({ d, n, r = 3.2 }: { d: [number, number][]; n: number; r?: number }) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < d.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const k = j / n;
      pts.push([d[i][0] + (d[i + 1][0] - d[i][0]) * k, d[i][1] + (d[i + 1][1] - d[i][1]) * k]);
    }
  return <g fill="#fffdf4">{pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
};

// Wrapper for one puppet: position, facing, distance from the screen (blur + scale + pale), hop.
export const Depth = ({ x, y, s = 1, face = 1, away = 0, rot = 0, id, children }: { x: number; y: number; s?: number; face?: 1 | -1; away?: number; rot?: number; id: string; children: ReactNode }) => {
  const sc = s * (1 + away * 0.22);
  return (
    <g style={{ mixBlendMode: "multiply" }} opacity={1 - away * 0.45}>
      {away > 0.02 && (
        <defs>
          <filter id={`tl-d-${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={away * 12} /></filter>
        </defs>
      )}
      <g filter={away > 0.02 ? `url(#tl-d-${id})` : undefined} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc * face} ${sc})`}>
        {/* coloured light bleeding round the dyed hide, then the puppet itself */}
        <g filter="url(#tl-bleed)" opacity={0.45}>{children}</g>
        <g filter="url(#tl-hide)">{children}</g>
      </g>
    </g>
  );
};

const O = { stroke: T.hide, strokeWidth: 4.5, strokeLinejoin: "round" as const };

// A comic puppet in profile facing right. `kind` "fat" = pot-bellied, bald, round nose; "thin" = skinny, topknot,
// long chin. `jaw` 0–1 opens the hinged jaw, `arm` −1…1 swings the rod arm, `t` drives a small idle wobble.
export const Clown = ({ kind, skin, cloth, accent, jaw, arm, t }: { kind: "fat" | "thin"; skin: string; cloth: string; accent: string; jaw: number; arm: number; t: number }) => {
  const fat = kind === "fat";
  const sh: [number, number] = fat ? [-6, -272] : [2, -296];
  const a1 = -8 - arm * 62, a2 = a1 + 40 + arm * 10;
  const r1 = (a1 * Math.PI) / 180, r2 = (a2 * Math.PI) / 180;
  const el: [number, number] = [sh[0] + Math.cos(r1) * 92, sh[1] - Math.sin(r1) * -92];
  const hd: [number, number] = [el[0] + Math.cos(r2) * 86, el[1] + Math.sin(r2) * 86];
  const jawA = jaw * 20;
  return (
    <g>
      {/* rods behind the screen: dark, thin */}
      <line x1={0} y1={fat ? -360 : -430} x2={-6} y2={900} stroke="#1a0d06" strokeWidth={7} />
      <line x1={hd[0]} y1={hd[1]} x2={hd[0] - 40} y2={900} stroke="#1a0d06" strokeWidth={4} />
      {fat ? (
        <g>
          {/* legs */}
          <path d="M-40 -96 L-52 -6 L-8 -6 L-12 -96 Z M18 -96 L22 -6 L66 -6 L50 -96 Z" fill={skin} {...O} />
          {/* belly + chest */}
          <path d="M-70 -320 C-96 -260 -96 -180 -70 -110 L60 -110 C150 -140 160 -250 90 -300 C50 -330 -30 -340 -70 -320 Z" fill={skin} {...O} />
          {/* sarong with punched checks */}
          <path d="M-78 -170 C-96 -130 -88 -96 -66 -80 L82 -80 C108 -110 112 -150 100 -176 C40 -160 -20 -160 -78 -170 Z" fill={cloth} {...O} />
          <Holes d={[[-70, -150], [96, -160]]} n={12} /><Holes d={[[-68, -118], [100, -124]]} n={12} />
          <path d="M-74 -134 L100 -142 M-68 -100 L92 -104" stroke={accent} strokeWidth={8} opacity={0.9} />
          <path d="M-60 -300 C0 -250 60 -220 110 -210" stroke={accent} strokeWidth={14} fill="none" opacity={0.9} />
          <Holes d={[[-56, -300], [0, -254], [108, -210]]} n={6} r={2.6} />
          <path d="M70 -190 c-12 -6 -14 10 -2 10" stroke={T.hide} strokeWidth={4} fill="none" />
          <path d="M-60 -260 C-74 -220 -72 -180 -58 -150" stroke="#7a2a12" strokeWidth={4} fill="none" opacity={0.6} />
          {/* back arm on the belly */}
          <path d="M-40 -296 C-70 -250 -60 -200 -10 -190 L0 -206 C-30 -214 -34 -250 -16 -290 Z" fill={skin} {...O} />
          {/* head: bald dome, tuft, eye, ear, bulb nose */}
          <path d="M-46 -350 C-60 -420 -10 -452 40 -440 C86 -428 96 -390 86 -364 L60 -350 Z" fill={skin} {...O} />
          <path d="M-6 -446 C-20 -480 20 -490 14 -468 C10 -458 0 -460 4 -470" fill="none" stroke={T.hide} strokeWidth={5} />
          <circle cx={100} cy={-376} r={28} fill={accent} {...O} />
          <ellipse cx={44} cy={-400} rx={14} ry={10} fill="#fffdf4" {...O} strokeWidth={3} />
          <circle cx={50} cy={-400} r={4.5} fill={T.hide} />
          <path d="M26 -418 Q46 -430 66 -418" stroke={T.hide} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M-18 -398 C-34 -392 -32 -364 -14 -366" fill={skin} {...O} />
          <Holes d={[[-30, -430], [20, -446]]} n={5} r={2.6} />
          {/* hinged jaw */}
          <g transform={`rotate(${jawA} -10 -352)`}>
            <path d="M-12 -352 L84 -350 C80 -322 50 -306 10 -312 C-6 -318 -14 -334 -12 -352 Z" fill={skin} {...O} />
            <path d="M14 -340 L74 -340" stroke="#7a1a12" strokeWidth={6} />
          </g>
          <circle cx={-10} cy={-352} r={5} fill="#c9a24a" stroke={T.hide} strokeWidth={2} />
        </g>
      ) : (
        <g>
          {/* long legs and loose trousers */}
          <path d="M-30 -210 L-46 -6 L-8 -6 L0 -150 L20 -6 L58 -6 L36 -210 Z" fill={cloth} {...O} />
          <Holes d={[[-28, -180], [-40, -30]]} n={8} /><Holes d={[[30, -180], [44, -30]]} n={8} />
          {/* thin body */}
          <path d="M-36 -350 C-50 -300 -46 -240 -36 -200 L40 -200 C54 -260 50 -320 30 -352 Z" fill={skin} {...O} />
          <path d="M-36 -230 L42 -230" stroke={accent} strokeWidth={12} />
          <Holes d={[[-30, -230], [38, -230]]} n={7} r={2.4} />
          {/* neck + head with topknot, long nose, long chin */}
          <path d="M-14 -340 L-10 -392 L22 -392 L26 -340 Z" fill={skin} {...O} />
          <g transform="translate(0 -34)">
          <path d="M-30 -360 C-46 -430 -10 -470 30 -464 C70 -458 80 -430 76 -404 L118 -390 L76 -380 L56 -366 Z" fill={skin} {...O} />
          <circle cx={6} cy={-484} r={20} fill="#1a0d06" />
          <path d="M-8 -470 C-14 -500 30 -508 26 -478" fill="none" stroke={accent} strokeWidth={6} />
          <ellipse cx={36} cy={-420} rx={13} ry={9} fill="#fffdf4" {...O} strokeWidth={3} />
          <circle cx={42} cy={-420} r={4} fill={T.hide} />
          <path d="M18 -440 L58 -434" stroke={T.hide} strokeWidth={5} strokeLinecap="round" />
          <g transform={`rotate(${jawA} -20 -368)`}>
            <path d="M-22 -370 L60 -368 C66 -340 86 -318 92 -300 C60 -300 20 -320 -16 -336 Z" fill={skin} {...O} />
            <path d="M10 -360 L56 -358" stroke="#7a1a12" strokeWidth={5} />
          </g>
          <circle cx={-20} cy={-368} r={5} fill="#c9a24a" stroke={T.hide} strokeWidth={2} />
          </g>
          {/* shirt pattern */}
          <Holes d={[[-26, -330], [-30, -250]]} n={6} r={2.6} /><Holes d={[[30, -330], [38, -250]]} n={6} r={2.6} />
          <path d="M-20 -340 C0 -300 0 -260 -10 -210" stroke="#2a1a6a" strokeWidth={4} fill="none" opacity={0.6} />
        </g>
      )}
      {/* rod arm: upper arm, forearm, pointing hand (pinned joints) */}
      <path d={`M${sh[0]} ${sh[1]} L${el[0]} ${el[1]}`} stroke={T.hide} strokeWidth={fat ? 30 : 24} strokeLinecap="round" />
      <path d={`M${sh[0]} ${sh[1]} L${el[0]} ${el[1]}`} stroke={skin} strokeWidth={fat ? 21 : 15} strokeLinecap="round" />
      <path d={`M${el[0]} ${el[1]} L${hd[0]} ${hd[1]}`} stroke={T.hide} strokeWidth={fat ? 26 : 20} strokeLinecap="round" />
      <path d={`M${el[0]} ${el[1]} L${hd[0]} ${hd[1]}`} stroke={skin} strokeWidth={fat ? 17 : 11} strokeLinecap="round" />
      <g transform={`translate(${hd[0]} ${hd[1]}) rotate(${a2 + Math.sin(t * 4) * 6})`}>
        <path d="M-6 -12 L34 -6 L36 4 L-4 12 Z" fill={skin} {...O} strokeWidth={3} />
      </g>
      {[sh, el].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={5} fill="#c9a24a" stroke={T.hide} strokeWidth={2} />)}
    </g>
  );
};

// The forest/tree puppet that opens a show and wipes between scenes. Twirled on its rod: `spin` in turns.
export const TreePuppet = ({ spin }: { spin: number }) => {
  const sx = Math.cos(spin * Math.PI * 2);
  const leaf = "M0 -560 C120 -470 210 -330 190 -190 C176 -90 100 -30 0 -10 C-100 -30 -176 -90 -190 -190 C-210 -330 -120 -470 0 -560 Z";
  return (
    <g transform={`scale(${Math.abs(sx) < 0.08 ? 0.08 : sx} 1)`}>
      <line x1={0} y1={-520} x2={0} y2={900} stroke="#1a0d06" strokeWidth={8} />
      <path d={leaf} fill="#2f9a4a" {...O} strokeWidth={6} />
      <path d={leaf} fill="#f2b731" transform="translate(0 -60) scale(0.72)" {...O} />
      <path d={leaf} fill="#d0342c" transform="translate(0 -110) scale(0.46)" {...O} />
      <path d={leaf} fill="#3a6ad0" transform="translate(0 -150) scale(0.22)" {...O} />
      {/* branches and kanok curls in punched holes */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M0 -40 C${d * 60} -140 ${d * 120} -200 ${d * 150} -300`} stroke={T.hide} strokeWidth={6} fill="none" />
          <Holes d={[[d * 20, -60], [d * 90, -190], [d * 140, -320], [d * 110, -440]]} n={7} r={3.4} />
          <Holes d={[[d * 40, -120], [d * 70, -260], [d * 40, -400]]} n={6} r={2.8} />
        </g>
      ))}
      <Holes d={[[0, -40], [0, -520]]} n={22} r={3} />
    </g>
  );
};

// Lamp flicker (oil-lamp style) for frame f, about 0.85–1.
export const lampAt = (f: number) => 0.9 + 0.06 * Math.sin(f * 0.47) + 0.04 * Math.sin(f * 1.37 + 1);
