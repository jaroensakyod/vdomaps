// Small tools for cross-section ③ (screen px at the given unit s).
const INK = "#1b1d24";

export const Shovel = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) rotate(25) scale(${s})`}>
    <rect x={-3} y={-70} width={6} height={50} fill="#8b5a32" stroke={INK} strokeWidth={1.4} />
    <path d="M-12 -22 L12 -22 L10 0 Q0 8 -10 0 Z" fill="#a4abb0" stroke={INK} strokeWidth={1.6} />
  </g>
);

export const Firewood = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[[-18, -6, -10], [4, -8, 8], [-8, -18, -4], [12, -18, 10]].map(([fx, fy, r], i) => (
      <g key={i} transform={`rotate(${r},${fx},${fy})`}>
        <rect x={fx - 22} y={fy - 6} width={44} height={12} rx={6} fill="#9a6a3c" stroke={INK} strokeWidth={1.4} />
        <circle cx={fx + 22} cy={fy} r={5} fill="#d8b183" stroke={INK} strokeWidth={1.2} />
      </g>
    ))}
  </g>
);
