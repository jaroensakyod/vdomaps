import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { BallotBox, InfoChip, Smoke } from "../../../components/Props";
import { Banner, Depth, Fighter, Glow, Grass, impactAt, PAL, Ridge, type Costume } from "../../../components/Scene";
import { font, GOLD, Panel, RED } from "../../thaihistory/news/kit";
import { clamp, Lectern, Palm, PoliceCar, Rain, ramp, Waves } from "../e1021/Art";
import { B, chain, endOf, PL, wf } from "./kit";

// Illustration panels, style v2 (Depth + parallax ridges + light + jointed figures + impact + paper grain).
// Every panel is labelled "ภาพประกอบ". No injured people or violence are drawn; grim numbers go on chips.
// Event frames live in EV so the picture, the shake and the <Hit> sounds share one schedule.
const MODERN: Record<string, Costume> = {
  suit: { jacket: "#232838", sash: "#b8322a", pants: "#1c1f29", head: "short", skin: "#e0b08a" },
  suitB: { jacket: "#2f3b55", sash: "#d9d4c7", pants: "#252a36", head: "short", skin: "#c68b62" },
  civ: { jacket: "#4f7a9a", sash: "#e9c46a", pants: "#3a3d4a", head: "short", skin: "#e0b08a" },
  kenya: { jacket: "#c9573a", sash: "#e9c46a", pants: "#3a3d4a", head: "short", skin: "#5a3a26" },
  kenya2: { jacket: "#2a6f4a", sash: "#efe6d0", pants: "#2a2f3a", head: "wrap", headColor: "#efe6d0", skin: "#4a2f1f" },
  rescue: { jacket: "#e8742a", sash: "#f0e040", pants: "#2a3340", head: "helmet", headColor: "#f0c020", skin: "#5a3a26" },
  police: { jacket: "#1f2a44", sash: "#c9a227", pants: "#1a2236", head: "short", skin: "#e0b08a" },
  idf: { jacket: "#5a6a3a", sash: "#3a4a2a", pants: "#4a5a30", head: "helmet", headColor: "#4a5a30", skin: "#d8a880" },
  uaCiv: { jacket: "#6b5a48", sash: "#3a5a8a", pants: "#3a3d4a", head: "wrap", headColor: "#c8c0b0", skin: "#e0b08a" },
  aid: { jacket: "#e8e4dc", sash: "#c0392b", pants: "#3a3d4a", head: "short", skin: "#e0b08a" },
  pla: { jacket: "#4a5a3a", sash: "#c0392b", pants: "#3a4a2a", head: "helmet", headColor: "#4a5a3a", skin: "#e0b890" },
  sa: { jacket: "#e9c46a", sash: "#2a6f4a", pants: "#2a2f3a", head: "short", skin: "#4a2f1f" },
  sa2: { jacket: "#2b3a67", sash: "#e76f51", pants: "#3a3030", head: "wrap", headColor: "#e76f51", skin: "#5a3a26" },
  rain: { jacket: "#e9c46a", sash: "#2b3a67", pants: "#2b3a67", head: "short", skin: "#e8c39e" },
  voter: { jacket: "#2a9d5a", sash: "#ffdf00", pants: "#2a2f3a", head: "short", skin: "#b9784e" },
  voter2: { jacket: "#f0d040", sash: "#1d3557", pants: "#3a3030", head: "short", skin: "#e0b08a" },
};

// ---------- event schedule (frames) ----------
export const EV = { hookFall: -18, kenyaFall: 0 }; // hook: already crumbling at frame 0
EV.kenyaFall = wf("kenya", "ถล่ม");

/* ---------------- helpers ---------------- */
const tag = (g: InsetGeom, text: string, y = 74, color = "#fff") => (
  <text x={g.cx} y={g.y + y * g.s} textAnchor="middle" fontSize={28 * g.s} fontWeight={900} fill={color} stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>
    {text}
  </text>
);
const Chip = ({ g, label, value, color }: { g: InsetGeom; label: string; value: string; color?: string }) => {
  const sc = g.sc * 0.9;
  const w = Math.max(150, value.length * 17 + 30) * sc;
  return <InfoChip x={g.x + g.W - w - 20 * g.s} y={g.y + 20 * g.s + 56 * sc} scale={sc} label={label} value={value} font={font} color={color} />;
};
const Ground = ({ g, color, top = "#8a6c45" }: { g: InsetGeom; color: string; top?: string }) => (
  <g>
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={g.H} fill={color} />
    <rect x={g.x - 100 * g.s} y={g.ground - 14 * g.s} width={g.W + 200 * g.s} height={5 * g.s} fill={top} />
  </g>
);
const Mist = ({ g, y, k = 0.22, color = "#f3e3c8" }: { g: InsetGeom; y: number; k?: number; color?: string }) => <rect x={g.x} y={y} width={g.W} height={46 * g.s} fill={color} opacity={k} />;
const Stars = ({ g, n = 30 }: { g: InsetGeom; n?: number }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={g.x + random(`sx${i}`) * g.W} cy={g.y + random(`sy${i}`) * g.H * 0.5} r={(1 + random(`sr${i}`) * 1.2) * g.s} fill="#fff" opacity={0.7} />
    ))}
  </g>
);
const Flag = ({ x, y, s, bands, vertical = false, h = 40, w = 62, wave = 0 }: { x: number; y: number; s: number; bands: string[]; vertical?: boolean; h?: number; w?: number; wave?: number }) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y - (h + 80) * s} stroke="#4a2f18" strokeWidth={3 * s} />
    <g transform={`translate(${x},${y - (h + 80) * s}) skewY(${wave})`}>
      {bands.map((c, i) =>
        vertical ? (
          <rect key={i} x={(i * w * s) / bands.length} y={0} width={(w * s) / bands.length} height={h * s} fill={c} stroke={PAL.ink} strokeWidth={0.8 * s} />
        ) : (
          <rect key={i} x={0} y={(i * h * s) / bands.length} width={w * s} height={(h * s) / bands.length} fill={c} stroke={PAL.ink} strokeWidth={0.8 * s} />
        ),
      )}
    </g>
  </g>
);
const Stamp = ({ g, text, k, color = RED, size = 40 }: { g: InsetGeom; text: string; k: number; color?: string; size?: number }) =>
  k <= 0 ? null : (
    <g transform={`translate(${g.cx},${g.y + g.H * 0.45}) rotate(-8) scale(${1.4 - 0.4 * k})`} opacity={k}>
      <rect x={-260 * g.s} y={-44 * g.s} width={520 * g.s} height={80 * g.s} rx={10 * g.s} fill="rgba(11,20,38,0.6)" stroke={color} strokeWidth={6 * g.s} />
      <text y={12 * g.s} textAnchor="middle" fontSize={size * g.s} fontWeight={900} fill={color} fontFamily={font}>{text}</text>
    </g>
  );
// Soft emergency light: blue/red cross-faded with a sine (never a hard swap), for police scenes.
const Beacon = ({ x, y, s, frame }: { x: number; y: number; s: number; frame: number }) => {
  const t = (Math.sin(frame * 0.18) + 1) / 2;
  return (
    <g>
      <circle cx={x} cy={y} r={60 * s} fill="#3a7bff" opacity={0.18 * t} />
      <circle cx={x} cy={y} r={60 * s} fill="#ff3b30" opacity={0.18 * (1 - t)} />
    </g>
  );
};
const Bus = ({ x, y, s, color = "#e9c46a" }: { x: number; y: number; s: number; color?: string }) => (
  <g>
    <rect x={x - 150 * s} y={y - 100 * s} width={300 * s} height={84 * s} rx={12 * s} fill={color} stroke={PAL.ink} strokeWidth={2 * s} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x - 136 * s + i * 46 * s} y={y - 88 * s} width={36 * s} height={28 * s} fill="#8aa8c0" stroke={PAL.ink} strokeWidth={1 * s} />)}
    {[-95, 95].map((dx) => <circle key={dx} cx={x + dx * s} cy={y - 14 * s} r={18 * s} fill="#1a1d24" stroke={PAL.ink} strokeWidth={1.4 * s} />)}
  </g>
);

/* ================= HOOK + KENYA ================= */
// Concrete-frame building under construction; `fall` 0..1 pancakes the floors down into a dust cloud.
const Collapse = ({ g, pan, frame, at }: { g: InsetGeom; pan: number; frame: number; at: number }) => {
  const fall = ramp(frame, at, at + 26, Easing.in(Easing.quad));
  const bx = g.x + g.W * 0.42 + pan * 0.6;
  const floors = 7;
  const fh = 34 * g.s;
  const base = g.ground - 14 * g.s;
  return (
    <g>
      <Glow x={g.x + g.W * 0.85 + pan * 0.1} y={g.ground - 220 * g.s} s={g.s} color="#ffd38a" />
      <Ridge g={g} base={g.ground - 80 * g.s} amp={14 * g.s} seed={11} color="#9aa0a8" shift={pan * 0.2} />
      {/* neighbouring blocks */}
      {[0.08, 0.72, 0.88].map((fx, i) => (
        <rect key={i} x={g.x + g.W * fx + pan * 0.5} y={base - (150 + i * 30) * g.s} width={110 * g.s} height={(150 + i * 30) * g.s} fill={["#c9b8a0", "#b8c0c8", "#d8c8b0"][i]} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
      ))}
      {Array.from({ length: floors }, (_, i) => {
        const drop = fall * (i * fh * 0.9);
        const tilt = fall * (i % 2 ? 4 : -3);
        const y = base - (i + 1) * fh + drop;
        return (
          <g key={i} transform={`rotate(${tilt},${bx + 110 * g.s},${y})`} opacity={1 - fall * 0.15}>
            <rect x={bx} y={y} width={220 * g.s} height={8 * g.s} fill="#9a9a92" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
            {[0, 1, 2, 3].map((c) => <rect key={c} x={bx + (10 + c * 66) * g.s} y={y + 8 * g.s} width={10 * g.s} height={fh - 8 * g.s} fill="#a8a8a0" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
          </g>
        );
      })}
      {fall > 0 && <Smoke x={bx + 110 * g.s} y={base - 80 * g.s} size={(90 + 90 * fall) * g.s} seed={12} k={fall} />}
      {fall > 0 && <ellipse cx={bx + 110 * g.s} cy={base - 20 * g.s} rx={(140 + 120 * fall) * g.s} ry={50 * g.s * fall} fill="#c8b8a0" opacity={0.6 * fall} />}
      <Mist g={g} y={g.ground - 60 * g.s} color="#e8dcc4" />
      <Ground g={g} color="#6b6658" top="#8a8474" />
    </g>
  );
};
const StreetCrowd = ({ g, pan, frame, at }: { g: InsetGeom; pan: number; frame: number; at: number }) => {
  const run = interpolate(frame, [at, at + 50], [0, 140], clamp) * g.s;
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <Fighter key={i} x={g.x + g.W * (0.14 + i * 0.22) + pan * 1.2 + (frame > at ? (i % 2 ? run : -run) : 0)} y={g.ground + 24 * g.s} scale={g.sc * 0.8} flip={frame > at && i % 2 === 0} mode={frame > at ? "run" : "walk"} weapon="none" costume={i % 2 ? MODERN.kenya : MODERN.kenya2} phase={i * 1.4} />
      ))}
    </>
  );
};

export const HookPanel = () => {
  const frame = useCurrentFrame();
  return (
    <Panel id="w24-hook" anchor={PL.nairobi} start={-12} end={B.hook.end + 14} sky={["#8ab0d0", "#e8dcc4"]}>
      {(g) => (
        <Depth g={g} id="w24-hook" start={-12} end={B.hook.end + 14} impact={impactAt(frame, [EV.hookFall + 14], 14) * 0.7}>
          {(pan) => (
            <g>
              <Collapse g={g} pan={pan} frame={frame} at={EV.hookFall} />
              <StreetCrowd g={g} pan={pan} frame={frame} at={EV.hookFall + 6} />
              <Grass g={g} shift={pan * 1.6} color="#5a5040" />
            </g>
          )}
        </Depth>
      )}
    </Panel>
  );
};

export const KenyaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.kenya.start + 16, wf("kenya", "หลาย"), wf("kenya", "ผู้ว่า")], endOf("kenya"));
  return (
    <>
      <Panel id="w24-fall" anchor={PL.nairobi} start={a[0]} end={a[1]} sky={["#8ab0d0", "#efe2c8"]}>
        {(g) => (
          <Depth g={g} id="w24-fall" start={a[0]} end={a[1]} impact={impactAt(frame, [EV.kenyaFall + 14], 14) * 0.6}>
            {(pan) => (
              <g>
                <Collapse g={g} pan={pan} frame={frame} at={EV.kenyaFall} />
                <StreetCrowd g={g} pan={pan} frame={frame} at={EV.kenyaFall + 6} />
                <Grass g={g} shift={pan * 1.6} color="#5a5040" />
                {tag(g, "ย่านอีสต์ลีห์ · ไนโรบี", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-rescue" anchor={PL.nairobi} start={b[0]} end={b[1]} sky={["#3a4a5a", "#a8a090"]}>
        {(g) => (
          <Depth g={g} id="w24-rescue" start={b[0]} end={b[1]} warm={0.06}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.15} y={g.ground - 200 * g.s} s={g.s} color="#f0d8a8" />
                <Ridge g={g} base={g.ground - 70 * g.s} amp={12 * g.s} seed={14} color="#7a8088" shift={pan * 0.2} />
                {/* rubble mound */}
                <path d={`M${g.x + 80 * g.s + pan * 0.6} ${g.ground - 14 * g.s} Q${g.cx + pan * 0.6} ${g.ground - 200 * g.s} ${g.x + g.W - 80 * g.s + pan * 0.6} ${g.ground - 14 * g.s} Z`} fill="#8a8478" stroke={PAL.ink} strokeWidth={2 * g.s} />
                {Array.from({ length: 12 }, (_, i) => (
                  <rect key={i} x={g.x + (180 + random(`rb${i}`) * 600) * g.s + pan * 0.6} y={g.ground - (40 + random(`ry${i}`) * 110) * g.s} width={(40 + random(`rw${i}`) * 50) * g.s} height={8 * g.s} fill="#9a9a92" stroke={PAL.ink} strokeWidth={1 * g.s} transform={`rotate(${random(`rr${i}`) * 50 - 25},${g.cx},${g.ground - 80 * g.s})`} />
                ))}
                <Smoke x={g.cx + pan * 0.4} y={g.ground - 210 * g.s} size={70 * g.s} seed={15} k={1} />
                {/* floodlight */}
                <path d={`M${g.x + 60 * g.s + pan * 0.8} ${g.ground - 160 * g.s} L${g.cx + 140 * g.s + pan * 0.6} ${g.ground - 60 * g.s} L${g.cx - 40 * g.s + pan * 0.6} ${g.ground - 20 * g.s} Z`} fill="#fff6c2" opacity={0.18} />
                <Ground g={g} color="#6b6658" top="#8a8474" />
                {[0, 1, 2, 3].map((i) => (
                  <Fighter key={i} x={g.x + g.W * (0.22 + i * 0.18) + pan * 1.1} y={g.ground + 16 * g.s} scale={g.sc * 0.85} mode={i % 2 ? "attack" : "stand"} weapon="none" costume={MODERN.rescue} phase={frame * 0.15 + i} flip={i > 1} />
                ))}
                <Grass g={g} shift={pan * 1.6} color="#4a4438" />
                <Chip g={g} label="กาชาดเคนยา" value="ยังไม่มียอดทางการ" color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-permit" anchor={PL.nairobi} start={c[0]} end={c[1]} sky={["#1d2a4a", "#2b3a67"]}>
        {(g) => (
          <Depth g={g} id="w24-permit" start={c[0]} end={c[1]} warm={0.04}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d2a4a" />
                <g transform={`translate(${g.cx + pan * 0.4},${g.y + g.H * 0.48}) rotate(-3)`}>
                  <rect x={-200 * g.s} y={-150 * g.s} width={400 * g.s} height={290 * g.s} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <text y={-110 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#1d3557" fontFamily={font}>ใบรับรองการเข้าใช้อาคาร</text>
                  {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-170 * g.s} y={(-80 + i * 30) * g.s} width={(340 - (i % 3) * 60) * g.s} height={8 * g.s} fill="#b8b0a0" />)}
                </g>
                <Fighter x={g.x + g.W * 0.12 + pan * 1.2} y={g.ground + 40 * g.s} scale={g.sc * 0.9} mode="stand" weapon="none" costume={MODERN.suitB} />
                <Stamp g={g} text="ไม่มีใบรับรอง" k={ramp(frame, wf("kenya", "ไม่มี", 0.8, 1), wf("kenya", "ไม่มี", 0.8, 1) + 8, Easing.out(Easing.back(2)))} />
                {tag(g, "ผู้ว่าฯ ไนโรบี: อนุมัติให้สร้าง แต่ยังไม่ให้เข้าใช้", g.H - 22, "#cfd6e6")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= FRANCE ================= */
export const FrancePanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.france.start + 16, wf("france", "มาครง"), wf("france", "ผู้ต้อง")], endOf("france"));
  return (
    <>
      <Panel id="w24-trappes" anchor={PL.trappes} start={a[0]} end={a[1]} sky={["#1c2541", "#c07a5a"]}>
        {(g) => (
          <Depth g={g} id="w24-trappes" start={a[0]} end={a[1]} warm={0.08}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.15} y={g.ground - 90 * g.s} s={g.s} color="#ff9a5a" core="#ffd0a0" />
                <Ridge g={g} base={g.ground - 60 * g.s} amp={20 * g.s} seed={21} color="#3a3048" shift={pan * 0.2} />
                {/* petrol station */}
                <rect x={g.x + g.W * 0.3 + pan * 0.6} y={g.ground - 150 * g.s} width={360 * g.s} height={22 * g.s} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={g.x + g.W * 0.3 + pan * 0.6} y={g.ground - 128 * g.s} width={360 * g.s} height={6 * g.s} fill="#2a6f4a" />
                {[0.36, 0.56].map((fx, i) => <rect key={i} x={g.x + g.W * fx + pan * 0.6} y={g.ground - 122 * g.s} width={16 * g.s} height={108 * g.s} fill="#c8ccd2" stroke={PAL.ink} strokeWidth={1 * g.s} />)}
                {[0.42, 0.62].map((fx, i) => <rect key={i} x={g.x + g.W * fx + pan * 0.6} y={g.ground - 70 * g.s} width={30 * g.s} height={56 * g.s} rx={4 * g.s} fill="#c0392b" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                <Ground g={g} color="#3a3a42" top="#5a5a62" />
                {/* police tape */}
                <path d={`M${g.x + pan * 1.1} ${g.ground - 40 * g.s} Q${g.cx + pan * 1.1} ${g.ground - 20 * g.s} ${g.x + g.W + pan * 1.1} ${g.ground - 46 * g.s}`} stroke="#f0d020" strokeWidth={8 * g.s} fill="none" strokeDasharray={`${30 * g.s} ${10 * g.s}`} />
                <Beacon x={g.x + g.W * 0.82 + pan * 0.9} y={g.ground - 60 * g.s} s={g.s} frame={frame} />
                <PoliceCar x={g.x + g.W * 0.82 + pan * 0.9} y={g.ground} scale={g.sc} frame={0} />
                <Fighter x={g.x + g.W * 0.18 + pan * 1.2} y={g.ground + 24 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={MODERN.police} />
                <Grass g={g} shift={pan * 1.6} color="#2a2430" />
                <Chip g={g} label="ตราปส์ · ชานกรุงปารีส" value="เสียชีวิต 1 · เจ็บ 5" />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-macron" anchor={PL.trappes} start={b[0]} end={b[1]} sky={["#e8dcc0", "#c8b48a"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w24-macron" start={b[0]} end={b[1]} warm={0.06}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e8dcc0" />
                {Array.from({ length: 5 }, (_, i) => (
                  <g key={i}>
                    <rect x={g.x + (40 + i * 200) * g.s + pan * 0.3} y={g.y + 40 * g.s} width={120 * g.s} height={220 * g.s} fill="#c8b48a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    <rect x={g.x + (52 + i * 200) * g.s + pan * 0.3} y={g.y + 52 * g.s} width={96 * g.s} height={196 * g.s} fill="#7fa0c2" opacity={0.5} />
                  </g>
                ))}
                {["#002395", "#ffffff", "#ed2939"].map((col, j) => <rect key={j} x={g.x + g.W * 0.78 + j * 34 * g.s + pan * 0.6} y={g.y + 60 * g.s} width={34 * g.s} height={150 * g.s} fill={col} stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#8a2a2a" />
                <Fighter x={g.cx + pan * 0.8} y={g.ground - 26 * g.s} scale={g.sc * 1.05} mode="stand" weapon="none" costume={MODERN.suitB} />
                <Lectern x={g.cx + pan * 0.8} y={g.ground} scale={g.sc} color="#2f3e46" />
                {tag(g, "มาครง: ก่อการร้าย · แรงจูงใจทางเชื้อชาติ", 66, "#1d2a4a")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-arrest" anchor={PL.trappes} start={c[0]} end={c[1]} sky={["#0b1220", "#2a3550"]}>
        {(g) => (
          <Depth g={g} id="w24-arrest" start={c[0]} end={c[1]} warm={0.03}>
            {(pan) => (
              <g>
                <Stars g={g} />
                <Ridge g={g} base={g.ground - 80 * g.s} amp={30 * g.s} seed={23} color="#141c2c" shift={pan * 0.2} />
                {Array.from({ length: 6 }, (_, i) => <rect key={i} x={g.x + i * 170 * g.s + pan * 0.5} y={g.ground - (130 + random(`fb${i}`) * 60) * g.s} width={140 * g.s} height={(130 + random(`fb${i}`) * 60) * g.s} fill="#1f2738" stroke={PAL.ink} strokeWidth={1.2 * g.s} />)}
                <Ground g={g} color="#1a1f2a" top="#2a3040" />
                <Beacon x={g.x + g.W * 0.7 + pan * 0.9} y={g.ground - 60 * g.s} s={g.s} frame={frame} />
                <PoliceCar x={g.x + g.W * 0.7 + pan * 0.9} y={g.ground} scale={g.sc * 1.1} frame={0} />
                <Fighter x={g.x + g.W * 0.3 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.9} mode="walk" weapon="none" costume={MODERN.police} phase={0} />
                <Fighter x={g.x + g.W * 0.38 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.9} mode="walk" weapon="none" costume={{ jacket: "#3a3a3a", sash: "#3a3a3a", pants: "#2a2a2a", head: "short", skin: "#888" }} phase={1} />
                <Fighter x={g.x + g.W * 0.46 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.9} mode="walk" weapon="none" costume={MODERN.police} phase={2} />
                <Grass g={g} shift={pan * 1.6} color="#0f141e" />
                <Chip g={g} label="ผู้ต้องสงสัย" value="อายุ 39 · ถูกจับแล้ว" color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= WEST BANK ================= */
const ISR = ["#ffffff", "#0038b8", "#ffffff"];
const StoneTown = ({ g, pan, k = 0.4 }: { g: InsetGeom; pan: number; k?: number }) => (
  <g transform={`translate(${pan * k},0)`}>
    {Array.from({ length: 10 }, (_, i) => {
      const h = (50 + random(`st${i}`) * 50) * g.s;
      return <rect key={i} x={g.x + i * 100 * g.s} y={g.ground - 70 * g.s - h} width={86 * g.s} height={h} fill="#d8c8a8" stroke={PAL.ink} strokeWidth={1 * g.s} />;
    })}
  </g>
);
export const WestBankPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.westbank.start + 16, wf("westbank", "ปิด"), wf("westbank", "เลือก")], endOf("westbank"));
  return (
    <>
      <Panel id="w24-check" anchor={PL.hebron} start={a[0]} end={a[1]} sky={["#c98a4a", "#efd2a8"]}>
        {(g) => (
          <Depth g={g} id="w24-check" start={a[0]} end={a[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 200 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 90 * g.s} amp={40 * g.s} seed={31} color="#c8a878" shift={pan * 0.2} />
                <StoneTown g={g} pan={pan} />
                <Ridge g={g} base={g.ground - 40 * g.s} amp={20 * g.s} seed={32} color="#a88a5a" shift={pan * 0.5} />
                <Ground g={g} color="#a08a6a" top="#b8a07a" />
                <rect x={g.x + g.W * 0.55 + pan * 0.7} y={g.ground - 110 * g.s} width={90 * g.s} height={96 * g.s} fill="#c8ccd2" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={g.x + g.W * 0.2 + pan * 0.7} y={g.ground - 54 * g.s} width={g.W * 0.35} height={10 * g.s} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                <Flag x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground} s={g.s} bands={ISR} wave={Math.sin(frame * 0.2) * 3} />
                {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.3 + i * 0.12) + pan * 1.1} y={g.ground + 16 * g.s} scale={g.sc * 0.85} mode="stand" weapon="rifle" costume={MODERN.idf} phase={i} />)}
                <Grass g={g} shift={pan * 1.6} color="#7a6a40" />
                <Chip g={g} label="กองทัพอิสราเอล" value="ทหารเสียชีวิต 2 นาย" />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-closure" anchor={PL.hebron} start={b[0]} end={b[1]} sky={["#b8906a", "#e8d4b0"]}>
        {(g) => {
          const k = ramp(frame, b[0] + 6, b[0] + 30, Easing.out(Easing.cubic));
          return (
            <Depth g={g} id="w24-closure" start={b[0]} end={b[1]} impact={impactAt(frame, [b[0] + 30], 6) * 0.3}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.2} y={g.ground - 200 * g.s} s={g.s} />
                  <Ridge g={g} base={g.ground - 90 * g.s} amp={30 * g.s} seed={33} color="#c0a070" shift={pan * 0.2} />
                  <StoneTown g={g} pan={pan} k={0.5} />
                  <Ground g={g} color="#8a8478" top="#a8a296" />
                  <path d={`M${g.x} ${g.ground} L${g.cx - 60 * g.s} ${g.ground - 60 * g.s} L${g.cx + 60 * g.s} ${g.ground - 60 * g.s} L${g.x + g.W} ${g.ground}`} fill="#4a4a50" />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path key={i} d={`M${g.x + g.W * (0.2 + i * 0.15) + (1 - k) * (i < 2 ? -400 : 400) * g.s + pan * 1.0} ${g.ground + 6 * g.s} l${20 * g.s} ${-60 * g.s} l${60 * g.s} 0 l${20 * g.s} ${60 * g.s} Z`} fill="#c8c4bc" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  ))}
                  <Fighter x={g.x + g.W * 0.85 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.85} flip mode="stand" weapon="rifle" costume={MODERN.idf} />
                  {tag(g, "ปิดล้อมเฮบรอนและฮัลฮูล", 74)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w24-vote" anchor={PL.hebron} start={c[0]} end={c[1]} sky={["#1d3557", "#3a5a8a"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w24-vote" start={c[0]} end={c[1]} warm={0.04}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d3557" />
                <rect x={g.x + g.W * 0.08 + pan * 0.4} y={g.y + 50 * g.s} width={220 * g.s} height={190 * g.s} rx={10 * g.s} fill="#f0ede6" stroke={PAL.ink} strokeWidth={2 * g.s} />
                <rect x={g.x + g.W * 0.08 + pan * 0.4} y={g.y + 50 * g.s} width={220 * g.s} height={50 * g.s} rx={10 * g.s} fill={RED} />
                <text x={g.x + g.W * 0.08 + 110 * g.s + pan * 0.4} y={g.y + 86 * g.s} textAnchor="middle" fontSize={28 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>ต.ค. 2569</text>
                <text x={g.x + g.W * 0.08 + 110 * g.s + pan * 0.4} y={g.y + 180 * g.s} textAnchor="middle" fontSize={80 * g.s} fontWeight={900} fill="#1d3557" fontFamily={font}>27</text>
                <text x={g.x + g.W * 0.08 + 110 * g.s + pan * 0.4} y={g.y + 224 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#1d3557" fontFamily={font}>วันอังคาร</text>
                <BallotBox x={g.x + g.W * 0.62 + pan * 0.8} y={g.ground} scale={g.sc * 2} band={["#0038b8", "#ffffff"]} />
                {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.78 + i * 0.1) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={i ? MODERN.civ : MODERN.suit} phase={i} flip />)}
                {tag(g, "อิสราเอลเลือกตั้งวันอังคาร", g.H - 22, "#cfd6e6")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= OLESHKY ================= */
const UA = ["#0057b7", "#ffd700"];
const RU = ["#ffffff", "#0039a6", "#d52b1e"];
export const OleshkyPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.oleshky.start + 16, wf("oleshky", "หยุด"), wf("oleshky", "อพยพ")], endOf("oleshky"));
  return (
    <>
      <Panel id="w24-ruins" anchor={PL.oleshky} start={a[0]} end={a[1]} sky={["#5a6070", "#a8a8a0"]}>
        {(g) => (
          <Depth g={g} id="w24-ruins" start={a[0]} end={a[1]} warm={0.04}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 200 * g.s} s={g.s} color="#e0d8c8" core="#f4f0e8" />
                <Ridge g={g} base={g.ground - 100 * g.s} amp={14 * g.s} seed={41} color="#7a8070" shift={pan * 0.2} />
                <Waves g={g} level={g.ground - 80 * g.s} frame={frame} amp={4} color="#5a7a8a" />
                {Array.from({ length: 7 }, (_, i) => {
                  const x = g.x + (40 + i * 140) * g.s + pan * 0.6;
                  const h = (60 + random(`ol${i}`) * 50) * g.s;
                  return (
                    <g key={i}>
                      <path d={`M${x} ${g.ground - 14 * g.s} l0 ${-h} l${30 * g.s} ${-20 * g.s} l${20 * g.s} ${30 * g.s} l${40 * g.s} ${-14 * g.s} l0 ${h + 4 * g.s} Z`} fill="#b0a898" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                      <rect x={x + 20 * g.s} y={g.ground - h + 10 * g.s} width={20 * g.s} height={20 * g.s} fill="#2a2a2a" />
                    </g>
                  );
                })}
                <Smoke x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 150 * g.s} size={70 * g.s} seed={42} k={1} />
                <Ground g={g} color="#6a6a5a" top="#8a8a78" />
                <Fighter x={g.x + g.W * 0.4 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="walk" weapon="none" costume={MODERN.uaCiv} />
                <Grass g={g} shift={pan * 1.6} color="#4a4a38" />
                {tag(g, "โอเลชกี · เคอร์ซอน (พื้นที่ที่รัสเซียยึด)", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-truce" anchor={PL.oleshky} start={b[0]} end={b[1]} sky={["#8ab0d0", "#e8e4dc"]} accent={GOLD}>
        {(g) => {
          const rise = ramp(frame, b[0] + 6, b[0] + 30, Easing.out(Easing.cubic));
          return (
            <Depth g={g} id="w24-truce" start={b[0]} end={b[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.5} y={g.ground - 220 * g.s} s={g.s} color="#fff4dc" core="#ffffff" />
                  <Ridge g={g} base={g.ground - 60 * g.s} amp={14 * g.s} seed={43} color="#8a9a7a" shift={pan * 0.2} />
                  <Ground g={g} color="#7a7a5a" top="#9a9a78" />
                  <path d={`M${g.x} ${g.ground - 20 * g.s} L${g.x + g.W} ${g.ground - 20 * g.s}`} stroke="#4a3a28" strokeWidth={14 * g.s} />
                  <Flag x={g.x + g.W * 0.15 + pan * 0.7} y={g.ground} s={g.s} bands={UA} />
                  <Flag x={g.x + g.W * 0.85 + pan * 0.7} y={g.ground} s={g.s} bands={RU} />
                  {/* white flag rising in the middle */}
                  <line x1={g.cx + pan * 0.7} y1={g.ground} x2={g.cx + pan * 0.7} y2={g.ground - 200 * g.s * rise} stroke="#6a4a2a" strokeWidth={4 * g.s} />
                  <path d={`M${g.cx + pan * 0.7} ${g.ground - 200 * g.s * rise} q${40 * g.s} ${(-10 + Math.sin(frame * 0.3) * 6) * g.s} ${80 * g.s} 0 l0 ${50 * g.s} q${-40 * g.s} ${(10 + Math.sin(frame * 0.3) * 6) * g.s} ${-80 * g.s} 0 Z`} fill="#ffffff" stroke={PAL.ink} strokeWidth={1.4 * g.s} opacity={rise} />
                  <Grass g={g} shift={pan * 1.6} color="#5a5a3a" />
                  {tag(g, "ทำเนียบขาว: เมลาเนีย ทรัมป์ เป็นคนกลาง", 74, "#1d2a4a")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w24-evac" anchor={PL.oleshky} start={c[0]} end={c[1]} sky={["#7a90a8", "#d8d4c8"]}>
        {(g) => {
          const walk = interpolate(frame, [c[0], c[1]], [0, 160], clamp) * g.s;
          return (
            <Depth g={g} id="w24-evac" start={c[0]} end={c[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.15} y={g.ground - 190 * g.s} s={g.s} color="#f0e0c0" core="#fff4dc" />
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={18 * g.s} seed={45} color="#7a8a7a" shift={pan * 0.2} />
                  <Mist g={g} y={g.ground - 60 * g.s} color="#e8ecf0" />
                  <Ground g={g} color="#6b6f66" top="#8d8a84" />
                  <Bus x={g.x + g.W * 0.7 + pan * 0.7} y={g.ground} s={g.s * 1.1} color="#e9c46a" />
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <Fighter x={g.x + g.W * (0.15 + i * 0.1) + walk + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * (i === 1 ? 0.6 : 0.85)} mode="walk" weapon="none" costume={MODERN.uaCiv} phase={i * 1.5} />
                    </g>
                  ))}
                  {[0, 1].map((i) => <rect key={i} x={g.x + g.W * (0.48 + i * 0.06) + pan * 0.9} y={g.ground - 50 * g.s} width={44 * g.s} height={36 * g.s} fill="#c9a66b" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                  <Grass g={g} shift={pan * 1.6} color="#4a5038" />
                  <Chip g={g} label="ฝ่ายยูเครน" value="เริ่ม 27 ต.ค. 03:00" color={GOLD} />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= KIM IN CHINA ================= */
const Train = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={x - i * 150 * s} y={y - 56 * s} width={140 * s} height={50 * s} rx={8 * s} fill="#2a6a3a" stroke={PAL.ink} strokeWidth={1.6 * s} />
        <rect x={x - i * 150 * s} y={y - 30 * s} width={140 * s} height={8 * s} fill="#e9c46a" />
        {[0, 1, 2, 3].map((w) => <rect key={w} x={x - i * 150 * s + (10 + w * 32) * s} y={y - 50 * s} width={22 * s} height={16 * s} fill="#c8d8e0" />)}
      </g>
    ))}
  </g>
);
export const KimPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.kim.start + 16, wf("kim", "ตาน"), wf("kim", "ครบ")], endOf("kim"));
  return (
    <>
      <Panel id="w24-bridge" anchor={PL.dandong} start={a[0]} end={a[1]} sky={["#2b3a67", "#e0906a"]}>
        {(g) => {
          const go = interpolate(frame, [a[0], a[1]], [0, 1], clamp);
          const deck = g.ground - 70 * g.s;
          return (
            <Depth g={g} id="w24-bridge" start={a[0]} end={a[1]} warm={0.08}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.2} y={g.ground - 140 * g.s} s={g.s} color="#ffb070" core="#ffd9a8" />
                  <Ridge g={g} base={g.ground - 90 * g.s} amp={30 * g.s} seed={51} color="#5a4a5a" shift={pan * 0.2} />
                  <Waves g={g} level={g.ground - 30 * g.s} frame={frame} amp={4} color="#5a6a8a" />
                  {/* cable-stayed towers */}
                  {[0.3, 0.72].map((fx, i) => {
                    const tx = g.x + g.W * fx + pan * 0.6;
                    return (
                      <g key={i}>
                        <path d={`M${tx - 20 * g.s} ${g.ground} L${tx} ${deck - 150 * g.s} L${tx + 20 * g.s} ${g.ground}`} fill="none" stroke="#c8ccd2" strokeWidth={8 * g.s} />
                        {[-1, 1].map((d) => [60, 120, 180].map((o) => <line key={`${d}${o}`} x1={tx} y1={deck - 130 * g.s} x2={tx + d * o * g.s} y2={deck} stroke="#e8ecf0" strokeWidth={1.4 * g.s} />))}
                      </g>
                    );
                  })}
                  <rect x={g.x - 50 * g.s} y={deck} width={g.W + 100 * g.s} height={14 * g.s} fill="#9aa0a8" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <g transform={`translate(${pan * 0.6},0)`}>
                    <Train x={g.x + g.W * (0.1 + 0.9 * go)} y={deck} s={g.s} />
                  </g>
                  <Grass g={g} shift={pan * 1.6} color="#2a3040" />
                  {tag(g, "สะพานแม่น้ำยาลูแห่งใหม่", 74)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w24-station" anchor={PL.dandong} start={b[0]} end={b[1]} sky={["#4a3a3a", "#c08a6a"]}>
        {(g) => (
          <Depth g={g} id="w24-station" start={b[0]} end={b[1]} warm={0.08}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a3a30" />
                {[0.15, 0.4, 0.65, 0.9].map((fx, i) => (
                  <g key={i}>
                    <line x1={g.x + g.W * fx + pan * 0.3} y1={g.y} x2={g.x + g.W * fx + pan * 0.3} y2={g.y + 50 * g.s} stroke="#3a2a20" strokeWidth={2 * g.s} />
                    <ellipse cx={g.x + g.W * fx + pan * 0.3} cy={g.y + 70 * g.s} rx={22 * g.s} ry={28 * g.s} fill="#d02a2a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    <Glow x={g.x + g.W * fx + pan * 0.3} y={g.y + 70 * g.s} s={g.s * 0.4} color="#ff8a5a" core="#ffd0a0" />
                  </g>
                ))}
                <Flag x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 40 * g.s} s={g.s} bands={["#de2910"]} />
                <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={36 * g.s} fill="#2a6a3a" />
                <rect x={g.x} y={g.ground - 28 * g.s} width={g.W} height={6 * g.s} fill="#e9c46a" />
                <Ground g={g} color="#8a8478" top="#a8a296" />
                {[0, 1, 2, 3, 4].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.18) + pan * 1.1} y={g.ground + 24 * g.s} scale={g.sc * 0.8} mode="stand" weapon="none" costume={MODERN.pla} phase={i} />)}
                {tag(g, "ตานตง · เมืองชายแดนจีน", 66, "#ffe7b0")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-monument" anchor={PL.dandong} start={c[0]} end={c[1]} sky={["#6a7a8a", "#d8d4c8"]}>
        {(g) => (
          <Depth g={g} id="w24-monument" start={c[0]} end={c[1]} warm={0.05}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 200 * g.s} s={g.s} color="#f0e0c0" core="#fff4dc" />
                <Ridge g={g} base={g.ground - 70 * g.s} amp={30 * g.s} seed={53} color="#7a8a7a" shift={pan * 0.2} />
                <path d={`M${g.cx - 30 * g.s + pan * 0.6} ${g.ground - 14 * g.s} L${g.cx - 16 * g.s + pan * 0.6} ${g.ground - 250 * g.s} L${g.cx + pan * 0.6} ${g.ground - 280 * g.s} L${g.cx + 16 * g.s + pan * 0.6} ${g.ground - 250 * g.s} L${g.cx + 30 * g.s + pan * 0.6} ${g.ground - 14 * g.s} Z`} fill="#d8d4c8" stroke={PAL.ink} strokeWidth={1.8 * g.s} />
                <rect x={g.cx - 90 * g.s + pan * 0.6} y={g.ground - 40 * g.s} width={180 * g.s} height={26 * g.s} fill="#b8b4a8" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                <circle cx={g.cx + pan * 0.6} cy={g.ground - 70 * g.s} r={24 * g.s} fill="none" stroke="#2a6a3a" strokeWidth={10 * g.s} />
                <Ground g={g} color="#7a7a6a" top="#9a9a88" />
                {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.25 + i * 0.5) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="stand" weapon="rifle" costume={MODERN.pla} flip={i === 1} />)}
                <Banner x={g.x + g.W * 0.08 + pan * 1.2} y={g.ground} s={g.s} color="#de2910" />
                <Grass g={g} shift={pan * 1.6} color="#4a5038" />
                {tag(g, "25 ต.ค. ครบรอบจีนส่งทหารเข้าสงครามเกาหลี", 74, "#1d2a4a")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= SOUTH AFRICA ================= */
export const SouthAfricaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.safrica.start + 16, wf("safrica", "ท่ามกลาง"), wf("safrica", "ซิมบับเว")], endOf("safrica"));
  return (
    <>
      <Panel id="w24-durban" anchor={PL.durban} start={a[0]} end={a[1]} sky={["#4a5a78", "#c8b8a0"]}>
        {(g) => (
          <Depth g={g} id="w24-durban" start={a[0]} end={a[1]} warm={0.06}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.2} y={g.ground - 180 * g.s} s={g.s} color="#f0d8a8" />
                <Ridge g={g} base={g.ground - 90 * g.s} amp={20 * g.s} seed={61} color="#6a7a88" shift={pan * 0.2} />
                <Smoke x={g.x + g.W * 0.85 + pan * 0.3} y={g.ground - 200 * g.s} size={60 * g.s} seed={62} k={1} />
                {/* shops with shutters down */}
                {Array.from({ length: 5 }, (_, i) => {
                  const x = g.x + (30 + i * 190) * g.s + pan * 0.6;
                  return (
                    <g key={i}>
                      <rect x={x} y={g.ground - 170 * g.s} width={170 * g.s} height={156 * g.s} fill={["#e8d8b8", "#d8c0a0", "#c8d0d8", "#e0c8a8", "#d0d8c0"][i]} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                      <rect x={x + 16 * g.s} y={g.ground - 110 * g.s} width={138 * g.s} height={96 * g.s} fill="#8a8e96" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                      {Array.from({ length: 8 }, (_, r) => <line key={r} x1={x + 16 * g.s} x2={x + 154 * g.s} y1={g.ground - (104 - r * 12) * g.s} y2={g.ground - (104 - r * 12) * g.s} stroke="#6a6e76" strokeWidth={1.4 * g.s} />)}
                    </g>
                  );
                })}
                <Ground g={g} color="#5a5a5a" top="#7a7a7a" />
                <Beacon x={g.x + g.W * 0.78 + pan * 0.9} y={g.ground - 60 * g.s} s={g.s} frame={frame} />
                <PoliceCar x={g.x + g.W * 0.78 + pan * 0.9} y={g.ground} scale={g.sc} frame={0} />
                <Fighter x={g.x + g.W * 0.3 + pan * 1.2} y={g.ground + 22 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={MODERN.police} />
                <Grass g={g} shift={pan * 1.6} color="#3a3a30" />
                <Chip g={g} label="ตำรวจเดอร์บัน" value="ฝูงชนราว 50 คน" />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-protest" anchor={PL.durban} start={b[0]} end={b[1]} sky={["#c98a4a", "#efd2a8"]}>
        {(g) => (
          <Depth g={g} id="w24-protest" start={b[0]} end={b[1]} warm={0.08}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 200 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 80 * g.s} amp={20 * g.s} seed={63} color="#b88a5a" shift={pan * 0.2} />
                <Ground g={g} color="#8a7a60" top="#a8987a" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <g key={i}>
                    <Fighter x={g.x + g.W * (0.08 + i * 0.16) + pan * 1.0} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="walk" weapon="none" costume={i % 2 ? MODERN.sa : MODERN.sa2} phase={i * 1.2} />
                    {i % 2 === 0 && (
                      <g>
                        <line x1={g.x + g.W * (0.08 + i * 0.16) + 14 * g.s + pan * 1.0} y1={g.ground - 140 * g.s} x2={g.x + g.W * (0.08 + i * 0.16) + 14 * g.s + pan * 1.0} y2={g.ground - 80 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
                        <rect x={g.x + g.W * (0.08 + i * 0.16) - 40 * g.s + pan * 1.0} y={g.ground - 196 * g.s} width={110 * g.s} height={58 * g.s} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                        <text x={g.x + g.W * (0.08 + i * 0.16) + 15 * g.s + pan * 1.0} y={g.ground - 160 * g.s} textAnchor="middle" fontSize={22 * g.s} fontWeight={900} fill={RED} fontFamily={font}>ประท้วง</text>
                      </g>
                    )}
                  </g>
                ))}
                <Grass g={g} shift={pan * 1.6} color="#6a5a3a" />
                {tag(g, "การประท้วงต่อต้านผู้อพยพ", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-home" anchor={PL.durban} start={c[0]} end={c[1]} sky={["#5a7aa0", "#efd2a8"]} accent={GOLD}>
        {(g) => {
          const walk = interpolate(frame, [c[0], c[1]], [0, 140], clamp) * g.s;
          const flags: [string, string[], number][] = [["ซิมบับเว", ["#319208", "#ffd200", "#de2010", "#000000", "#de2010", "#ffd200", "#319208"], wf("safrica", "ซิมบับเว")], ["ไนจีเรีย", ["#008751", "#ffffff", "#008751"], wf("safrica", "ไนจีเรีย")], ["กานา", ["#ce1126", "#fcd116", "#006b3f"], wf("safrica", "กานา")]];
          return (
            <Depth g={g} id="w24-home" start={c[0]} end={c[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.2} y={g.ground - 170 * g.s} s={g.s} />
                  <Ridge g={g} base={g.ground - 50 * g.s} amp={18 * g.s} seed={65} color="#c9a47a" shift={pan * 0.2} />
                  <Ground g={g} color="#8a8478" top="#a8a296" />
                  <Bus x={g.x + g.W * 0.72 + pan * 0.7} y={g.ground} s={g.s * 1.1} color="#e8e4dc" />
                  {[0, 1, 2].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.1) + walk + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * (i === 2 ? 0.6 : 0.85)} mode="walk" weapon="none" costume={i % 2 ? MODERN.sa : MODERN.sa2} phase={i * 1.4} />)}
                  {flags.map(([name, bands, f], i) =>
                    frame >= Math.min(f, c[0] + 4) ? (
                      <g key={name}>
                        <Flag x={g.x + g.W * (0.12 + i * 0.16)} y={g.y + 200 * g.s} s={g.s * 0.8} bands={bands} wave={Math.sin(frame * 0.2 + i) * 3} />
                        <text x={g.x + g.W * (0.12 + i * 0.16) + 25 * g.s} y={g.y + 220 * g.s} textAnchor="middle" fontSize={20 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={5 * g.s} paintOrder="stroke" fontFamily={font}>{name}</text>
                      </g>
                    ) : null,
                  )}
                  <Grass g={g} shift={pan * 1.6} color="#6a5a3a" />
                  {tag(g, "เตรียมพาพลเมืองกลับบ้าน", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= TYPHOON (OKINAWA) ================= */
export const TyphoonPanels = () => {
  const frame = useCurrentFrame();
  const [a, b] = chain([B.typhoon.start + 16, wf("typhoon", "เที่ยว")], endOf("typhoon"));
  const rows = ["NAHA → ISHIGAKI", "NAHA → MIYAKO", "HANEDA → ISHIGAKI", "ISHIGAKI → YONAGUNI", "MIYAKO → TARAMA"];
  return (
    <>
      <Panel id="w24-harbor" anchor={PL.ishigaki} start={a[0]} end={a[1]} sky={["#2a3440", "#5a6a78"]}>
        {(g) => (
          <Depth g={g} id="w24-harbor" start={a[0]} end={a[1]} warm={0.02}>
            {(pan) => (
              <g>
                <Ridge g={g} base={g.ground - 90 * g.s} amp={40 * g.s} seed={71} color="#3a4a3a" shift={pan * 0.2} />
                <Waves g={g} level={g.ground - 40 * g.s} frame={frame} amp={20} color="#2f4f6a" />
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`rotate(${Math.sin(frame * 0.2 + i) * 6},${g.x + g.W * (0.25 + i * 0.22) + pan * 0.6},${g.ground - 40 * g.s})`}>
                    <path d={`M${g.x + g.W * (0.25 + i * 0.22) - 70 * g.s + pan * 0.6} ${g.ground - 60 * g.s} l${140 * g.s} 0 l${-20 * g.s} ${30 * g.s} l${-100 * g.s} 0 Z`} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={g.x + g.W * (0.25 + i * 0.22) - 30 * g.s + pan * 0.6} y={g.ground - 90 * g.s} width={50 * g.s} height={30 * g.s} fill="#2b3a67" stroke={PAL.ink} strokeWidth={1.2 * g.s} />
                  </g>
                ))}
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#6a6a62" />
                {[0.08, 0.92].map((fx, i) => <Palm key={i} x={g.x + g.W * fx + pan * 1.2} y={g.ground - 10 * g.s} scale={g.sc} wind={1} frame={frame} seed={i + 7} />)}
                <Rain g={g} k={1} frame={frame} slant={0.6} />
                <Grass g={g} shift={pan * 1.6} color="#2a3a2a" />
                {tag(g, "ไต้ฝุ่นจำปี · หมู่เกาะซากิชิมะ โอกินาวา", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-board" anchor={PL.ishigaki} start={b[0]} end={b[1]} sky={["#141a24", "#202a38"]}>
        {(g) => (
          <Depth g={g} id="w24-board" start={b[0]} end={b[1]} warm={0.02}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a24" />
                <rect x={g.x + 40 * g.s + pan * 0.3} y={g.y + 60 * g.s} width={g.W - 80 * g.s} height={g.H - 120 * g.s} rx={8 * g.s} fill="#0a0d12" stroke="#3a4250" strokeWidth={3 * g.s} />
                {rows.map((r, i) => {
                  const off = frame >= b[0] + 8 + i * 6;
                  return (
                    <g key={r}>
                      <text x={g.x + 70 * g.s + pan * 0.3} y={g.y + (100 + i * 38) * g.s} fontSize={22 * g.s} fontWeight={700} fill="#ffd56b" fontFamily="monospace">{r}</text>
                      <text x={g.x + g.W - 70 * g.s + pan * 0.3} y={g.y + (100 + i * 38) * g.s} textAnchor="end" fontSize={22 * g.s} fontWeight={900} fill={off ? "#ff3b30" : "#3fb950"} fontFamily="monospace">{off ? "CANCELLED" : "ON TIME"}</text>
                    </g>
                  );
                })}
                <Chip g={g} label={frame >= wf("typhoon", "เรือ") ? "เรือรอบอิชิงากิ" : "ANA · JAL"} value={frame >= wf("typhoon", "เรือ") ? "งดเดินเรือ" : "ยกเลิกเที่ยวบิน"} color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= BRAZIL ================= */
export const BrazilPanels = () => {
  const frame = useCurrentFrame();
  const [a, b] = chain([B.brazil.start + 16, wf("brazil", "โพ")], endOf("brazil"));
  return (
    <>
      <Panel id="w24-ballot" anchor={PL.brasilia} start={a[0]} end={a[1]} sky={["#4a90c0", "#cfe6f0"]}>
        {(g) => (
          <Depth g={g} id="w24-ballot" start={a[0]} end={a[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.85} y={g.ground - 200 * g.s} s={g.s} />
                <g transform={`translate(${pan * 0.2},0)`}>
                  {[0, 1].map((i) => <rect key={i} x={g.x + g.W * 0.48 + i * 34 * g.s} y={g.ground - 230 * g.s} width={26 * g.s} height={200 * g.s} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                  <path d={`M${g.x + g.W * 0.3} ${g.ground - 40 * g.s} q${60 * g.s} ${-60 * g.s} ${120 * g.s} 0 Z`} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                </g>
                <Ridge g={g} base={g.ground - 30 * g.s} amp={10 * g.s} seed={81} color="#6a8a5a" shift={pan * 0.5} />
                <Ground g={g} color="#7a8a5a" top="#9aaa6a" />
                <BallotBox x={g.cx + 120 * g.s + pan * 0.8} y={g.ground} scale={g.sc * 1.8} text="TSE" />
                {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.08) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="walk" weapon="none" costume={i % 2 ? MODERN.voter : MODERN.voter2} phase={i} />)}
                <Grass g={g} shift={pan * 1.6} color="#4a6a34" />
                {tag(g, "พรุ่งนี้ อาทิตย์ 25 ต.ค. · รอบสอง", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w24-tie" anchor={PL.brasilia} start={b[0]} end={b[1]} sky={["#1d3557", "#3a6a5a"]} accent={GOLD}>
        {(g) => {
          const k = ramp(frame, wf("brazil", "เสมอ"), wf("brazil", "เสมอ") + 14, Easing.out(Easing.cubic));
          return (
            <Depth g={g} id="w24-tie" start={b[0]} end={b[1]} warm={0.04}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d3557" />
                  <path d={`M${g.cx} ${g.y + 20 * g.s} L${g.x + g.W - 20 * g.s} ${g.y + g.H / 2} L${g.cx} ${g.y + g.H - 20 * g.s} L${g.x + 20 * g.s} ${g.y + g.H / 2} Z`} fill="#009c3b" opacity={0.25} />
                  <g transform={`translate(${g.cx + pan * 0.6},${g.ground - 20 * g.s})`}>
                    <rect x={-6 * g.s} y={-220 * g.s} width={12 * g.s} height={210 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={-50 * g.s} y={-14 * g.s} width={100 * g.s} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={-210 * g.s} y={-214 * g.s} width={420 * g.s} height={8 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    {([[-200, "ลูลา", "#c0392b"], [200, "ฟลาวิโอ", "#1d6fb8"]] as const).map(([dx, name, col]) => (
                      <g key={name}>
                        <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s - 50 * g.s} y2={-120 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                        <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s + 50 * g.s} y2={-120 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                        <path d={`M${dx * g.s - 60 * g.s} ${-120 * g.s} Q${dx * g.s} ${-90 * g.s} ${dx * g.s + 60 * g.s} ${-120 * g.s} Z`} fill={col} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                        <text x={dx * g.s} y={-60 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>{name}</text>
                        <text x={dx * g.s} y={-150 * g.s} textAnchor="middle" fontSize={44 * g.s} fontWeight={900} fill={GOLD} opacity={k} fontFamily={font}>50%</text>
                      </g>
                    ))}
                  </g>
                  {tag(g, "Datafolha 22 ต.ค. · คะแนนที่ใช้ได้", 66, "#cfd6e6")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};
