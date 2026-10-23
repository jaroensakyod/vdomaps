import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { Airliner, Blast, BallotBox, Drone, Fire, InfoChip, Interceptor, Lorry, Missile, Rocket, Smoke, Stall } from "../../../components/Props";
import { Banner, Depth, Fighter, Glow, Grass, impactAt, PAL, Ridge, type Costume } from "../../../components/Scene";
import { font, GOLD, Panel, RED } from "../../thaihistory/news/kit";
import { age, BlackoutCity, clamp, Palm, Rain, ramp, Waves } from "../e1021/Art";
import { B, chain, endOf, PL, wf } from "./kit";

// Illustration panels, style v2 (Depth + parallax ridges + light + jointed figures + impact + paper grain).
// Every panel is labelled "ภาพประกอบ". No injured people are drawn; grim numbers go on chips.
// Event frames live in EV so the picture, the shake and the <Hit> sounds share one schedule.
const MODERN: Record<string, Costume> = {
  suit: { jacket: "#232838", sash: "#b8322a", pants: "#1c1f29", head: "short", skin: "#e0b08a" },
  suitB: { jacket: "#2f3b55", sash: "#d9d4c7", pants: "#252a36", head: "short", skin: "#c68b62" },
  civ: { jacket: "#4f7a9a", sash: "#e9c46a", pants: "#3a3d4a", head: "short", skin: "#e0b08a" },
  sudan: { jacket: "#e9e2cf", sash: "#b5654a", pants: "#d8cfb8", head: "wrap", headColor: "#f3eee0", skin: "#5a3a26" },
  sudan2: { jacket: "#c9573a", sash: "#e9c46a", pants: "#4a3a30", head: "wrap", headColor: "#e9c46a", skin: "#4a2f1f" },
  rain: { jacket: "#e9c46a", sash: "#2b3a67", pants: "#2b3a67", head: "short", skin: "#e8c39e" },
  trader: { jacket: "#f0ede6", sash: "#2b3a67", pants: "#2a2f3a", head: "short", skin: "#e8c39e" },
  worker: { jacket: "#2b4a6f", sash: "#e9c46a", pants: "#24364f", head: "short", skin: "#e8c8a8" },
  egypt: { jacket: "#b8a070", sash: "#6a5a3a", pants: "#a08a5a", head: "helmet", headColor: "#8a7a50", skin: "#b9784e" },
  voter: { jacket: "#2a9d5a", sash: "#ffdf00", pants: "#2a2f3a", head: "short", skin: "#b9784e" },
  voter2: { jacket: "#f0d040", sash: "#1d3557", pants: "#3a3030", head: "short", skin: "#e0b08a" },
};

// ---------- event schedule (frames) ----------
export const EV = {
  hookHit: 34,
  abyeiHit: 0,
  kyivHit: 0,
  kyivBomblets: [] as number[],
  intercepts: [] as number[],
  waveHit: 0,
};
EV.abyeiHit = wf("abyei", "โจมตี") + 8;
EV.kyivHit = B.ukraine.start + 52;
EV.kyivBomblets = [0, 5, 9, 14, 18].map((d) => EV.kyivHit + 10 + d);
EV.intercepts = [0, 20, 38].map((d) => wf("saudi", "สกัด") + 14 + d);
EV.waveHit = wf("typhoon", "เสีย") + 6;

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
// Explosion that rises over 3 frames and fades over the second half of `len` (never a 1-frame flash).
const Boom = ({ x, y, scale, at, frame, len = 24 }: { x: number; y: number; scale: number; at: number; frame: number; len?: number }) => {
  if (frame < at || frame > at + len) return null;
  const k = (frame - at) / len;
  return (
    <g opacity={Math.min(1, (frame - at + 1) / 3) * interpolate(k, [0.5, 1], [1, 0], clamp)}>
      <Blast x={x} y={y} scale={scale} k={Math.max(0.01, k * 0.95)} />
    </g>
  );
};
// Flag on a pole; `bands` top→bottom (or left→right when `vertical`).
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
const Stamp = ({ g, text, k, color = RED }: { g: InsetGeom; text: string; k: number; color?: string }) =>
  k <= 0 ? null : (
    <g transform={`translate(${g.cx},${g.y + g.H * 0.42}) rotate(-8) scale(${1.4 - 0.4 * k})`} opacity={k}>
      <rect x={-210 * g.s} y={-44 * g.s} width={420 * g.s} height={80 * g.s} rx={10 * g.s} fill="rgba(11,20,38,0.6)" stroke={color} strokeWidth={6 * g.s} />
      <text y={14 * g.s} textAnchor="middle" fontSize={44 * g.s} fontWeight={900} fill={color} fontFamily={font}>{text}</text>
    </g>
  );
const SUDAN = ["#d21034", "#ffffff", "#000000"];
const SSUDAN = ["#000000", "#da121a", "#078930"];

/* ================= HOOK + ABYEI ================= */
const Market = ({ g, pan, frame, hit, flee }: { g: InsetGeom; pan: number; frame: number; hit: number; flee: boolean }) => {
  const run = flee ? interpolate(frame, [hit, hit + 60], [0, 160], clamp) * g.s : 0;
  return (
    <g>
      <Glow x={g.x + g.W * 0.8 + pan * 0.1} y={g.ground - 210 * g.s} s={g.s} color="#ffd38a" />
      <Ridge g={g} base={g.ground - 70 * g.s} amp={18 * g.s} seed={41} color="#b89a6a" shift={pan * 0.2} />
      {[0.08, 0.22, 0.9].map((fx, i) => (
        <path key={i} d={`M${g.x + g.W * fx + pan * 0.4} ${g.ground - 14 * g.s} l0 ${-60 * g.s} m0 0 q${-40 * g.s} ${-10 * g.s} ${-50 * g.s} ${8 * g.s} m${50 * g.s} ${-8 * g.s} q${40 * g.s} ${-14 * g.s} ${56 * g.s} ${4 * g.s} m${-56 * g.s} ${-4 * g.s} q${-6 * g.s} ${-24 * g.s} ${20 * g.s} ${-30 * g.s}`} stroke="#4a3a24" strokeWidth={5 * g.s} fill="none" />
      ))}
      <Mist g={g} y={g.ground - 70 * g.s} color="#f0dcb4" />
      <Ground g={g} color="#a0784a" top="#c09460" />
      {[0.18, 0.36, 0.54, 0.72].map((fx, i) => (
        <Stall key={i} x={g.x + g.W * fx + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 1.5} awning={["#e76f51", "#2a9d8f", "#e9c46a", "#c0503a"][i]} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.2) + pan * 1.1 - run * (i % 2 ? 1 : -0.6)} y={g.ground + 22 * g.s} scale={g.sc * 0.8} flip={flee && i % 2 === 1} mode={flee ? "run" : i % 2 ? "walk" : "stand"} weapon="none" costume={i % 2 ? MODERN.sudan : MODERN.sudan2} phase={i * 1.3} />
      ))}
    </g>
  );
};
const DroneStrike = ({ g, frame, hit, pan }: { g: InsetGeom; frame: number; hit: number; pan: number }) => {
  const fly = ramp(frame, hit - 36, hit, Easing.in(Easing.quad));
  return (
    <g>
      {frame < hit && <Drone x={g.x + g.W * (0.1 + 0.42 * fly)} y={g.y + 50 * g.s + fly * (g.ground - g.y - 150 * g.s)} scale={g.sc * 1.4} />}
      {frame >= hit && (
        <>
          <Smoke x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground - 150 * g.s} size={110 * g.s} seed={43} k={ramp(frame, hit, hit + 40)} />
          <Fire x={g.x + g.W * 0.5 + pan * 0.6} y={g.ground - 30 * g.s} size={70 * g.s} seed={44} k={ramp(frame, hit, hit + 10)} />
        </>
      )}
      <Boom x={g.x + g.W * 0.52 + pan * 0.6} y={g.ground - 60 * g.s} scale={g.sc * 2.2} at={hit} frame={frame} />
    </g>
  );
};

export const HookPanel = () => {
  const frame = useCurrentFrame();
  return (
    <Panel id="w23-hook" anchor={PL.abyei} start={-12} end={B.hook.end + 14} sky={["#d8a060", "#f0dcb4"]}>
      {(g) => (
        <Depth g={g} id="w23-hook" start={-12} end={B.hook.end + 14} impact={impactAt(frame, [EV.hookHit], 12)}>
          {(pan) => (
            <g>
              <Market g={g} pan={pan} frame={frame} hit={EV.hookHit} flee={frame >= EV.hookHit} />
              <DroneStrike g={g} frame={frame} hit={EV.hookHit} pan={pan} />
              <Grass g={g} shift={pan * 1.6} color="#7a5a30" />
            </g>
          )}
        </Depth>
      )}
    </Panel>
  );
};

export const AbyeiPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = chain([B.abyei.start + 20, wf("abyei", "โดรน"), wf("abyei", "ยอด"), wf("abyei", "นาย")], endOf("abyei"));
  return (
    <>
      <Panel id="w23-border" anchor={PL.abyei} start={a[0]} end={a[1]} sky={["#c98a4a", "#f0dcb4"]}>
        {(g) => (
          <Depth g={g} id="w23-border" start={a[0]} end={a[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.2 + pan * 0.1} y={g.ground - 180 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 60 * g.s} amp={22 * g.s} seed={45} color="#b88a5a" shift={pan * 0.2} />
                <Ridge g={g} base={g.ground - 26 * g.s} amp={12 * g.s} seed={46} color="#9a6a42" shift={pan * 0.5} />
                <Ground g={g} color="#a0623a" top="#c07a4a" />
                <line x1={g.cx + pan * 0.7} y1={g.ground - 14 * g.s} x2={g.cx + pan * 0.7} y2={g.y + g.H} stroke="#fff" strokeWidth={4 * g.s} strokeDasharray={`${14 * g.s} ${10 * g.s}`} opacity={0.8} />
                <Flag x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground} s={g.s} bands={SUDAN} wave={Math.sin(frame * 0.2) * 3} />
                <Flag x={g.x + g.W * 0.7 + pan * 0.7} y={g.ground} s={g.s} bands={SSUDAN} wave={Math.sin(frame * 0.2 + 1) * 3} />
                {tag(g, "ซูดาน", 74, "#ffd0cc")}
                <text x={g.x + g.W * 0.3} y={g.y + 120 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>ซูดาน</text>
                <text x={g.x + g.W * 0.7} y={g.y + 120 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>ซูดานใต้</text>
                {[0, 1, 2].map((i) => (
                  <Fighter key={i} x={g.x + g.W * (0.42 + i * 0.07) + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.8} mode="walk" weapon="none" costume={i % 2 ? MODERN.sudan : MODERN.sudan2} phase={i * 1.7} />
                ))}
                <Grass g={g} shift={pan * 1.6} color="#7a5030" />
                {tag(g, "อาบเยย์ · พื้นที่พิพาท (แนวโดยประมาณ)", g.H - 22)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-strike" anchor={PL.abyei} start={b[0]} end={b[1]} sky={["#e0a060", "#f6e2bc"]}>
        {(g) => (
          <Depth g={g} id="w23-strike" start={b[0]} end={b[1]} impact={impactAt(frame, [EV.abyeiHit], 12)}>
            {(pan) => (
              <g>
                <Market g={g} pan={pan} frame={frame} hit={EV.abyeiHit} flee={frame >= EV.abyeiHit} />
                <DroneStrike g={g} frame={frame} hit={EV.abyeiHit} pan={pan} />
                <Grass g={g} shift={pan * 1.6} color="#7a5a30" />
                {tag(g, "โดรนโจมตีตลาดอาเมียต", g.H - 22)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-toll" anchor={PL.abyei} start={c[0]} end={c[1]} sky={["#5a4a40", "#b0906a"]}>
        {(g) => (
          <Depth g={g} id="w23-toll" start={c[0]} end={c[1]} warm={0.12}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.75} y={g.ground - 200 * g.s} s={g.s} color="#ffb070" core="#ffd9a8" />
                <Ridge g={g} base={g.ground - 60 * g.s} amp={18 * g.s} seed={47} color="#7a6a58" shift={pan * 0.2} />
                {[0.2, 0.5, 0.8].map((fx, i) => (
                  <Smoke key={i} x={g.x + g.W * fx + pan * (0.3 + i * 0.1)} y={g.ground - 170 * g.s} size={(80 + i * 20) * g.s} seed={50 + i} k={1} />
                ))}
                <Ground g={g} color="#6a5040" top="#8a6a50" />
                {[0.25, 0.6].map((fx, i) => (
                  <g key={i}>
                    <Stall x={g.x + g.W * fx + pan * 0.6} y={g.ground - 10 * g.s} scale={g.sc * 1.5} awning="#4a3a30" />
                    <Fire x={g.x + g.W * fx + pan * 0.6} y={g.ground - 20 * g.s} size={50 * g.s} seed={54 + i} k={1} />
                  </g>
                ))}
                <Chip g={g} label="ทางการซูดานใต้" value={`เสียชีวิต ≥${Math.round(interpolate(frame, [c[0] + 6, wf("abyei", "สาม") + 10], [73, 153], clamp))}`} />
                <Grass g={g} shift={pan * 1.6} color="#3a2a20" />
                {tag(g, "ยอดผู้เสียชีวิตเพิ่มขึ้นเท่าตัว", g.H - 22, "#ffd0cc")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-tankers" anchor={PL.abyei} start={d[0]} end={d[1]} sky={["#c98a4a", "#efd2a8"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w23-tankers" start={d[0]} end={d[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.15} y={g.ground - 170 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 50 * g.s} amp={20 * g.s} seed={56} color="#b88a5a" shift={pan * 0.2} />
                <Mist g={g} y={g.ground - 60 * g.s} />
                <Ground g={g} color="#a0623a" top="#c07a4a" />
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <Lorry x={g.x + g.W * (0.2 + i * 0.28) + pan * 0.7} y={g.ground - 4 * g.s} scale={g.sc * 1.3} color="#8a8f96" />
                    <rect x={g.x + g.W * (0.2 + i * 0.28) - 70 * g.s + pan * 0.7} y={g.ground - 88 * g.s} width={110 * g.s} height={46 * g.s} rx={22 * g.s} fill="#c9ccd1" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  </g>
                ))}
                <Grass g={g} shift={pan * 1.6} color="#7a5030" />
                {tag(g, "นายทหารซูดาน: เป้าคือรถน้ำมันของ RSF", 74, "#ffe7b0")}
                <Stamp g={g} text="ยังไม่ยืนยัน" k={ramp(frame, wf("abyei", "แต่"), wf("abyei", "แต่") + 8, Easing.out(Easing.back(2)))} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= TYPHOON ================= */
export const TyphoonPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = chain([B.typhoon.start + 16, wf("typhoon", "ปิด"), wf("typhoon", "ยกเลิก"), wf("typhoon", "เสีย")], endOf("typhoon"));
  const rows = ["TPE → NRT", "TPE → HKG", "KHH → NRT", "TSA → KHH", "TPE → SIN", "TSA → MZG"];
  return (
    <>
      <Panel id="w23-storm" anchor={PL.taipei} start={a[0]} end={a[1]} sky={["#2f3e4e", "#6c7f8f"]}>
        {(g) => (
          <Depth g={g} id="w23-storm" start={a[0]} end={a[1]} warm={0.02}>
            {(pan) => (
              <g>
                <Ridge g={g} base={g.ground - 90 * g.s} amp={40 * g.s} seed={61} color="#3e4e5e" shift={pan * 0.2} />
                <Ridge g={g} base={g.ground - 50 * g.s} amp={20 * g.s} seed={62} color="#4a5a6a" shift={pan * 0.5} />
                <Waves g={g} level={g.ground - 20 * g.s} frame={frame} amp={16} color="#2f4f6a" />
                {[0.12, 0.36, 0.64, 0.88].map((fx, i) => (
                  <Palm key={i} x={g.x + g.W * fx + pan * 0.8} y={g.ground - 10 * g.s} scale={g.sc * (0.95 + (i % 2) * 0.2)} wind={1} frame={frame} seed={i + 4} />
                ))}
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#8a8a70" />
                <Rain g={g} k={1} frame={frame} slant={0.7} />
                <Grass g={g} shift={pan * 1.6} color="#3a4a34" />
                {tag(g, "ไต้ฝุ่นจำปี เฉียดฝั่งตะวันออกไต้หวัน", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-school" anchor={PL.taipei} start={b[0]} end={b[1]} sky={["#4a5a6a", "#8a9aa8"]}>
        {(g) => (
          <Depth g={g} id="w23-school" start={b[0]} end={b[1]}>
            {(pan) => {
              const shut = ramp(frame, b[0] + 6, b[0] + 24);
              return (
                <g>
                  <Ridge g={g} base={g.ground - 80 * g.s} amp={30 * g.s} seed={63} color="#5a6a78" shift={pan * 0.2} />
                  <rect x={g.x + 120 * g.s + pan * 0.5} y={g.ground - 220 * g.s} width={g.W - 240 * g.s} height={206 * g.s} fill="#e8dcc4" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  {Array.from({ length: 3 }, (_, r) =>
                    Array.from({ length: 7 }, (_, cI) => <rect key={`${r}${cI}`} x={g.x + (150 + cI * 105) * g.s + pan * 0.5} y={g.ground - (200 - r * 58) * g.s} width={60 * g.s} height={36 * g.s} fill="#5a6a7a" stroke={PAL.ink} strokeWidth={1 * g.s} />),
                  )}
                  <Flag x={g.x + g.W * 0.5 + pan * 0.5} y={g.ground - 220 * g.s} s={g.s * 0.8} bands={["#fe0000"]} wave={Math.sin(frame * 0.5) * 6} />
                  <Ground g={g} color="#6b6f76" top="#8d8a84" />
                  {/* gate sliding shut */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <rect key={i} x={g.x + g.W * 0.18 + i * 26 * g.s + (1 - shut) * -340 * g.s + pan * 0.9} y={g.ground - 90 * g.s} width={6 * g.s} height={80 * g.s} fill="#3a3f48" />
                  ))}
                  <rect x={g.x + g.W * 0.18 + (1 - shut) * -340 * g.s + pan * 0.9} y={g.ground - 94 * g.s} width={300 * g.s} height={10 * g.s} fill="#3a3f48" />
                  <g opacity={shut}>
                    <rect x={g.x + g.W * 0.24 + pan * 0.9} y={g.ground - 150 * g.s} width={200 * g.s} height={44 * g.s} rx={6 * g.s} fill={RED} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <text x={g.x + g.W * 0.24 + 100 * g.s + pan * 0.9} y={g.ground - 119 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>ปิดเรียน · ปิดทำการ</text>
                  </g>
                  {[0, 1].map((i) => (
                    <g key={i}>
                      <Fighter x={g.x + g.W * (0.68 + i * 0.12) + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="walk" weapon="none" costume={MODERN.rain} phase={i * 2} />
                      <path d={`M${g.x + g.W * (0.68 + i * 0.12) - 50 * g.s + pan * 1.2} ${g.ground - 110 * g.s} q${50 * g.s} ${-50 * g.s} ${100 * g.s} 0 Z`} fill={i ? "#2b3a67" : "#c0503a"} stroke={PAL.ink} strokeWidth={1.4 * g.s} transform={`rotate(${-10 + Math.sin(frame * 0.4 + i) * 6},${g.x + g.W * (0.68 + i * 0.12) + pan * 1.2},${g.ground - 110 * g.s})`} />
                    </g>
                  ))}
                  <Rain g={g} k={1} frame={frame} slant={0.6} />
                  <Grass g={g} shift={pan * 1.6} color="#3a4a34" />
                </g>
              );
            }}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-board" anchor={PL.taipei} start={c[0]} end={c[1]} sky={["#141a24", "#202a38"]}>
        {(g) => (
          <Depth g={g} id="w23-board" start={c[0]} end={c[1]} warm={0.02}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a24" />
                <rect x={g.x + 40 * g.s + pan * 0.3} y={g.y + 60 * g.s} width={g.W - 80 * g.s} height={g.H - 120 * g.s} rx={8 * g.s} fill="#0a0d12" stroke="#3a4250" strokeWidth={3 * g.s} />
                {rows.map((r, i) => {
                  const off = frame >= c[0] + 8 + i * 6;
                  return (
                    <g key={r}>
                      <text x={g.x + 70 * g.s + pan * 0.3} y={g.y + (100 + i * 36) * g.s} fontSize={24 * g.s} fontWeight={700} fill="#ffd56b" fontFamily="monospace">{r}</text>
                      <text x={g.x + g.W - 70 * g.s + pan * 0.3} y={g.y + (100 + i * 36) * g.s} textAnchor="end" fontSize={24 * g.s} fontWeight={900} fill={off ? "#ff3b30" : "#3fb950"} fontFamily="monospace">{off ? "CANCELLED" : "ON TIME"}</text>
                    </g>
                  );
                })}
                <Fighter x={g.x + g.W * 0.3 + pan * 1.2} y={g.ground + 60 * g.s} scale={g.sc * 0.9} mode="stand" weapon="none" costume={MODERN.civ} />
                <Fighter x={g.x + g.W * 0.7 + pan * 1.3} y={g.ground + 64 * g.s} scale={g.sc * 0.9} mode="walk" flip weapon="none" costume={MODERN.suitB} phase={1} />
                <Chip g={g} label="ในประเทศ 262 + ต่างประเทศ 669" value={`ยกเลิก ${Math.round(interpolate(frame, [c[0] + 4, wf("typhoon", "เที่ยว") + 6], [0, 931], clamp))} เที่ยว`} color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-waves" anchor={PL.liuqiu} start={d[0]} end={d[1]} sky={["#2a3440", "#5a6a78"]}>
        {(g) => {
          const surge = ramp(frame, EV.waveHit - 14, EV.waveHit, Easing.in(Easing.quad));
          return (
            <Depth g={g} id="w23-waves" start={d[0]} end={d[1]} impact={impactAt(frame, [EV.waveHit], 8) * 0.6}>
              {(pan) => (
                <g>
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={30 * g.s} seed={65} color="#3a4a3a" shift={pan * 0.2} />
                  <Waves g={g} level={g.ground - 30 * g.s} frame={frame} amp={20} color="#2f4f6a" />
                  {/* breakwater blocks */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <path key={i} d={`M${g.x + (60 + i * 120) * g.s + pan * 0.8} ${g.ground - 14 * g.s} l${40 * g.s} ${-60 * g.s} l${40 * g.s} ${60 * g.s} Z`} fill="#9a9a92" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  ))}
                  <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.cx} ${g.ground - (40 + 220 * surge) * g.s} ${g.x + g.W} ${g.ground - 20 * g.s} Z`} fill="#e8f2f8" opacity={0.75 * surge * interpolate(frame, [EV.waveHit, EV.waveHit + 20], [1, 0.3], clamp)} />
                  <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#5a6a70" />
                  <Rain g={g} k={1} frame={frame} slant={0.6} />
                  <Grass g={g} shift={pan * 1.6} color="#2a3a2a" />
                  <Chip g={g} label="AP · หลิวฉิว" value="เสียชีวิต 1 · เจ็บ ≥94" />
                  {tag(g, "คลื่นสูงซัดชายฝั่ง", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= UKRAINE ================= */
export const UkrainePanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = chain([B.ukraine.start + 16, wf("ukraine", "ไม่"), wf("ukraine", "ไฟ"), wf("ukraine", "ส่วน")], endOf("ukraine"));
  return (
    <>
      <Panel id="w23-cluster" anchor={PL.kyiv} start={a[0]} end={a[1]} sky={["#05070f", "#1c2541"]}>
        {(g) => {
          const fall = ramp(frame, EV.kyivHit - 26, EV.kyivHit, Easing.in(Easing.quad));
          const split = frame >= EV.kyivHit;
          return (
            <Depth g={g} id="w23-cluster" start={a[0]} end={a[1]} impact={impactAt(frame, [EV.kyivBomblets[0]], 12) * 0.6} warm={0.03}>
              {(pan) => (
                <g>
                  <Stars g={g} />
                  <Glow x={g.x + g.W * 0.85} y={g.y + 70 * g.s} s={g.s * 0.6} color="#c8d0e0" core="#f0f4ff" />
                  <Ridge g={g} base={g.ground - 60 * g.s} amp={40 * g.s} seed={71} color="#151b2a" shift={pan * 0.3} />
                  {Array.from({ length: 8 }, (_, i) => {
                    const h = (100 + random(`ky${i}`) * 100) * g.s;
                    return (
                      <g key={i}>
                        <rect x={g.x + i * 125 * g.s + pan * 0.6} y={g.ground - 14 * g.s - h} width={100 * g.s} height={h} fill="#1f2738" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                        {Array.from({ length: 4 }, (_, r) => <rect key={r} x={g.x + (i * 125 + 14) * g.s + pan * 0.6} y={g.ground - h + r * 30 * g.s} width={70 * g.s} height={10 * g.s} fill={random(`kw${i}${r}`) > 0.5 ? "#ffd56b" : "#2a3242"} />)}
                      </g>
                    );
                  })}
                  <Ground g={g} color="#1a1f2a" top="#2a3040" />
                  {!split && fall > 0 && <Missile x={g.x + g.W * (0.15 + 0.35 * fall)} y={g.y + 10 * g.s + fall * g.H * 0.35} scale={g.sc * 1.2} angle={50} trail={140} />}
                  {split &&
                    EV.kyivBomblets.map((t, i) => {
                      const p = ramp(frame, EV.kyivHit, t, Easing.in(Easing.quad));
                      const x = g.x + g.W * (0.5 + (i - 2) * 0.08);
                      return (
                        <g key={i}>
                          {frame < t && <circle cx={g.x + g.W * 0.5 + (x - g.x - g.W * 0.5) * p} cy={g.y + g.H * 0.4 + p * (g.ground - g.y - g.H * 0.4 - 40 * g.s)} r={4 * g.s} fill="#ffd56b" />}
                          <Boom x={x + pan * 0.6} y={g.ground - 40 * g.s} scale={g.sc * 1.1} at={t} frame={frame} />
                          {frame >= t && <Smoke x={x + pan * 0.6} y={g.ground - 90 * g.s} size={50 * g.s} seed={72 + i} k={ramp(frame, t, t + 30)} />}
                        </g>
                      );
                    })}
                  <Grass g={g} shift={pan * 1.6} color="#0f141e" />
                  {tag(g, "ขีปนาวุธหัวรบลูกปราย · ใจกลางเคียฟ")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-witkoff" anchor={PL.kyiv} start={b[0]} end={b[1]} sky={["#4a3a2a", "#c9a46a"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w23-witkoff" start={b[0]} end={b[1]} warm={0.1}>
            {(pan) => {
              const shake = ramp(frame, b[0] + 10, b[0] + 30);
              return (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6b4a2f" />
                  {[0.12, 0.38, 0.62, 0.88].map((fx, i) => (
                    <g key={i}>
                      <rect x={g.x + g.W * fx - 50 * g.s + pan * 0.2} y={g.y + 40 * g.s} width={100 * g.s} height={190 * g.s} rx={50 * g.s} fill="#e8d3a0" opacity={0.35} />
                      <Glow x={g.x + g.W * fx + pan * 0.2} y={g.y + 30 * g.s} s={g.s * 0.5} color="#ffe7b0" core="#fff6dc" />
                    </g>
                  ))}
                  <Flag x={g.x + g.W * 0.22 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} bands={["#b22234", "#ffffff", "#3c3b6e"]} />
                  <Flag x={g.x + g.W * 0.78 + pan * 0.5} y={g.ground - 20 * g.s} s={g.s} bands={["#ffffff", "#0039a6", "#d52b1e"]} />
                  <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#7a1f1f" />
                  <Fighter x={g.cx - (70 - 20 * shake) * g.s + pan * 0.9} y={g.ground + 10 * g.s} scale={g.sc * 1.05} mode="stand" weapon="none" costume={MODERN.suit} />
                  <Fighter x={g.cx + (70 - 20 * shake) * g.s + pan * 0.9} y={g.ground + 10 * g.s} scale={g.sc * 1.05} flip mode="stand" weapon="none" costume={MODERN.suitB} phase={1} />
                  {tag(g, "วิทคอฟพบปูติน · ไม่กี่ชั่วโมงก่อนการโจมตี", 66, "#ffe7b0")}
                </g>
              );
            }}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-dark" anchor={PL.kyiv} start={c[0]} end={c[1]} sky={["#05070f", "#141c30"]}>
        {(g) => (
          <Depth g={g} id="w23-dark" start={c[0]} end={c[1]} warm={0.02}>
            {(pan) => (
              <g>
                <Stars g={g} n={40} />
                <Ridge g={g} base={g.ground - 80 * g.s} amp={30 * g.s} seed={74} color="#10141e" shift={pan * 0.2} />
                <g transform={`translate(${pan * 0.6},0)`}>
                  <BlackoutCity g={g} dark={ramp(frame, wf("ukraine", "ดับ"), wf("ukraine", "ดับ") + 30, Easing.linear)} />
                </g>
                <Ground g={g} color="#10141c" top="#1e2430" />
                {[0, 1].map((i) => (
                  <g key={i}>
                    <Fighter x={g.x + g.W * (0.3 + i * 0.35) + pan * 1.3} y={g.ground + 30 * g.s} scale={g.sc * 0.85} mode="walk" weapon="none" costume={MODERN.civ} phase={i * 2} />
                    <path d={`M${g.x + g.W * (0.3 + i * 0.35) + 20 * g.s + pan * 1.3} ${g.ground - 70 * g.s} l${90 * g.s} ${-20 * g.s} l0 ${40 * g.s} Z`} fill="#fff6c2" opacity={0.25} />
                  </g>
                ))}
                <Grass g={g} shift={pan * 1.6} color="#0a0e16" />
                <Chip g={g} label="กระทรวงพลังงานยูเครน" value="ไฟดับ 500,000+ คน" color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-swarm" anchor={PL.moscow} start={d[0]} end={d[1]} sky={["#0b1220", "#2a3550"]}>
        {(g) => (
          <Depth g={g} id="w23-swarm" start={d[0]} end={d[1]} warm={0.02}>
            {(pan) => {
              const t = interpolate(frame, [d[0], d[1]], [0, 1], clamp);
              return (
                <g>
                  <Stars g={g} />
                  {/* far city with onion domes */}
                  <g transform={`translate(${pan * 0.15},0)`} opacity={0.8}>
                    {[0.62, 0.7, 0.78, 0.86].map((fx, i) => (
                      <g key={i}>
                        <rect x={g.x + g.W * fx} y={g.ground - (90 + i * 6) * g.s} width={30 * g.s} height={(90 + i * 6) * g.s} fill="#2a3448" />
                        <ellipse cx={g.x + g.W * fx + 15 * g.s} cy={g.ground - (96 + i * 6) * g.s} rx={18 * g.s} ry={14 * g.s} fill={i % 2 ? "#c9a227" : "#3a6a8a"} />
                      </g>
                    ))}
                  </g>
                  <Ridge g={g} base={g.ground - 40 * g.s} amp={14 * g.s} seed={76} color="#141e18" shift={pan * 0.4} />
                  {/* pine forest */}
                  {Array.from({ length: 14 }, (_, i) => (
                    <path key={i} d={`M${g.x + i * 75 * g.s + pan * 0.9} ${g.ground} l${24 * g.s} ${-90 * g.s} l${24 * g.s} ${90 * g.s} Z`} fill="#0e1a12" stroke={PAL.ink} strokeWidth={1 * g.s} />
                  ))}
                  {Array.from({ length: 9 }, (_, i) => (
                    <Drone key={i} x={g.x + g.W * (-0.1 + 0.6 * t + (i % 3) * 0.12 + random(`dx${i}`) * 0.05)} y={g.y + (90 + Math.floor(i / 3) * 50 + random(`dy${i}`) * 20) * g.s} scale={g.sc * 0.8} />
                  ))}
                  <Grass g={g} shift={pan * 1.6} color="#0a120c" />
                  <Chip g={g} label="ตามรายงาน" value="โดรน ~600 ลำ → เขตมอสโก" color={GOLD} />
                </g>
              );
            }}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= SAUDI ================= */
const RiyadhSkyline = ({ g, pan }: { g: InsetGeom; pan: number }) => (
  <g transform={`translate(${pan * 0.6},0)`}>
    {Array.from({ length: 9 }, (_, i) => {
      const h = (80 + random(`ry${i}`) * 90) * g.s;
      return <rect key={i} x={g.x + i * 115 * g.s} y={g.ground - 14 * g.s - h} width={80 * g.s} height={h} fill="#22283a" stroke={PAL.ink} strokeWidth={1.2 * g.s} />;
    })}
    {/* Kingdom Centre: tall tower with the arch cut-out */}
    <path d={`M${g.x + g.W * 0.48} ${g.ground - 14 * g.s} L${g.x + g.W * 0.48} ${g.ground - 250 * g.s} Q${g.x + g.W * 0.48 + 45 * g.s} ${g.ground - 300 * g.s} ${g.x + g.W * 0.48 + 90 * g.s} ${g.ground - 250 * g.s} L${g.x + g.W * 0.48 + 90 * g.s} ${g.ground - 14 * g.s} Z`} fill="#2c3448" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
    <path d={`M${g.x + g.W * 0.48 + 20 * g.s} ${g.ground - 250 * g.s} Q${g.x + g.W * 0.48 + 45 * g.s} ${g.ground - 210 * g.s} ${g.x + g.W * 0.48 + 70 * g.s} ${g.ground - 250 * g.s}`} fill="#1a2238" />
  </g>
);
export const SaudiPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.saudi.start + 16, wf("saudi", "สกัด"), wf("saudi", "อียิปต์")], endOf("saudi"));
  return (
    <>
      <Panel id="w23-launch" anchor={PL.riyadh} start={a[0]} end={a[1]} sky={["#0b0f1e", "#3a2a3a"]}>
        {(g) => {
          const t = interpolate(frame, [a[0], a[1]], [0, 1], clamp);
          return (
            <Depth g={g} id="w23-launch" start={a[0]} end={a[1]} warm={0.04}>
              {(pan) => (
                <g>
                  <Stars g={g} />
                  <Glow x={g.x + g.W * 0.2} y={g.y + 60 * g.s} s={g.s * 0.6} color="#c8d0e0" core="#f0f4ff" />
                  <Ridge g={g} base={g.ground - 50 * g.s} amp={30 * g.s} seed={81} color="#2a2030" shift={pan * 0.2} />
                  <Ridge g={g} base={g.ground - 20 * g.s} amp={14 * g.s} seed={82} color="#3a2a30" shift={pan * 0.5} />
                  <Ground g={g} color="#4a3a30" top="#6a5040" />
                  {[0, 1, 2].map((i) => {
                    const p = Math.min(1, Math.max(0, t * 1.3 - i * 0.15));
                    return p > 0 ? <Missile key={i} x={g.x + g.W * (0.05 + 0.75 * p)} y={g.ground - (40 + 220 * Math.sin(p * Math.PI * 0.6) + i * 30) * g.s} scale={g.sc * 0.9} angle={-30 + 50 * p} trail={120} /> : null;
                  })}
                  {[0, 1, 2, 3].map((i) => <Drone key={`d${i}`} x={g.x + g.W * (0.1 + 0.5 * t + i * 0.08)} y={g.y + (120 + i * 26) * g.s} scale={g.sc * 0.7} />)}
                  <Grass g={g} shift={pan * 1.6} color="#2a2020" />
                  {tag(g, "ขีปนาวุธและโดรนของฮูตี มุ่งหน้าซาอุฯ", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-intercept" anchor={PL.riyadh} start={b[0]} end={b[1]} sky={["#05070f", "#1c2541"]}>
        {(g) => (
          <Depth g={g} id="w23-intercept" start={b[0]} end={b[1]} impact={impactAt(frame, EV.intercepts, 8) * 0.4} warm={0.03}>
            {(pan) => (
              <g>
                <Stars g={g} />
                <RiyadhSkyline g={g} pan={pan} />
                <Ground g={g} color="#1a1c24" top="#2a2c34" />
                {EV.intercepts.map((t, i) => {
                  const x1 = g.x + g.W * (0.25 + i * 0.25);
                  const y1 = g.y + (70 + (i % 2) * 40) * g.s;
                  return (
                    <g key={i}>
                      {frame < t + 4 && <Interceptor x0={g.x + g.W * (0.2 + i * 0.3)} y0={g.ground - 20 * g.s} x1={x1} y1={y1} p={ramp(frame, t - 22, t, Easing.out(Easing.quad))} s={g.s} />}
                      <Boom x={x1} y={y1} scale={g.sc * 1.2} at={t} frame={frame} />
                    </g>
                  );
                })}
                <Grass g={g} shift={pan * 1.6} color="#10121a" />
                {tag(g, "กองกำลังผสมสกัดได้อีกระลอก เมื่อคืน", g.H - 22)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-egypt" anchor={PL.cairo} start={c[0]} end={c[1]} sky={["#d8a060", "#f6e2bc"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w23-egypt" start={c[0]} end={c[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 200 * g.s} s={g.s} />
                {[0.15, 0.32, 0.45].map((fx, i) => (
                  <path key={i} d={`M${g.x + g.W * fx - (90 - i * 20) * g.s + pan * 0.2} ${g.ground - 40 * g.s} l${(90 - i * 20) * g.s} ${-(110 - i * 25) * g.s} l${(90 - i * 20) * g.s} ${(110 - i * 25) * g.s} Z`} fill="#d8b47a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                ))}
                <Ridge g={g} base={g.ground - 30 * g.s} amp={10 * g.s} seed={84} color="#c9a070" shift={pan * 0.4} />
                <Ground g={g} color="#b08a5a" top="#c8a070" />
                <Flag x={g.x + g.W * 0.68 + pan * 0.7} y={g.ground} s={g.s * 1.1} bands={["#ce1126", "#ffffff", "#000000"]} wave={Math.sin(frame * 0.2) * 3} />
                {[0, 1, 2, 3].map((i) => (
                  <Fighter key={i} x={g.x + g.W * (0.52 + i * 0.1) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="stand" weapon="rifle" costume={MODERN.egypt} phase={i} />
                ))}
                <Banner x={g.x + g.W * 0.92 + pan * 1.2} y={g.ground} s={g.s} color="#ce1126" />
                <Grass g={g} shift={pan * 1.6} color="#8a6a3a" />
                {tag(g, "อียิปต์: พร้อมช่วยป้องกันซาอุฯ หากถูกร้องขอ", 74, "#ffe7b0")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= KOREA ================= */
export const KoreaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.korea.start + 16, wf("korea", "ซัม"), wf("korea", "นัก")], endOf("korea"));
  return (
    <>
      <Panel id="w23-trading" anchor={PL.seoul} start={a[0]} end={a[1]} sky={["#0d1320", "#1b2230"]}>
        {(g) => {
          const t = interpolate(frame, [a[0], a[1]], [0, 1], clamp);
          return (
            <Depth g={g} id="w23-trading" start={a[0]} end={a[1]} warm={0.02}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0d1320" />
                  {[0.2, 0.5, 0.8].map((fx, i) => {
                    const x0 = g.x + g.W * fx - 130 * g.s + pan * 0.4;
                    const y0 = g.y + 60 * g.s;
                    const pts = Array.from({ length: 12 }, (_, k) => `${x0 + 10 * g.s + k * 22 * g.s},${y0 + 40 * g.s + (k / 11) * 110 * g.s * t + Math.sin(k * 1.7 + i) * 10 * g.s}`).join(" ");
                    return (
                      <g key={i}>
                        <rect x={x0} y={y0} width={260 * g.s} height={180 * g.s} rx={6 * g.s} fill="#0a0d14" stroke="#3a4250" strokeWidth={2 * g.s} />
                        <polyline points={pts} fill="none" stroke={RED} strokeWidth={3 * g.s} />
                        <text x={x0 + 14 * g.s} y={y0 + 28 * g.s} fontSize={18 * g.s} fontWeight={900} fill="#ff6b5f" fontFamily="monospace">{["KOSPI", "SAMSUNG", "SK HYNIX"][i]} ▼</text>
                      </g>
                    );
                  })}
                  <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#1b2230" />
                  <Fighter x={g.x + g.W * 0.35 + pan * 1.2} y={g.ground + 40 * g.s} scale={g.sc * 0.9} mode="stand" weapon="none" costume={MODERN.trader} />
                  <Fighter x={g.x + g.W * 0.62 + pan * 1.3} y={g.ground + 44 * g.s} scale={g.sc * 0.9} flip mode="stand" weapon="none" costume={MODERN.suit} phase={2} />
                  {tag(g, "หุ้นชิปเกาหลีใต้ร่วงต่อ", g.H - 22, "#ffd0cc")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-bars" anchor={PL.seoul} start={b[0]} end={b[1]} sky={["#1d2a4a", "#2b3a67"]}>
        {(g) => {
          const bar = (v: number, x: number, label: string, at: number) => {
            const k = ramp(frame, at, at + 18, Easing.out(Easing.cubic));
            const h = (v / 25) * 230 * g.s * k;
            return (
              <g>
                <rect x={x} y={g.y + 60 * g.s} width={150 * g.s} height={h} fill={RED} stroke={PAL.ink} strokeWidth={2 * g.s} />
                <text x={x + 75 * g.s} y={g.y + 60 * g.s + h + 40 * g.s} textAnchor="middle" fontSize={40 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>−{(v * k).toFixed(2)}%</text>
                <text x={x + 75 * g.s} y={g.y + 44 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={900} fill="#cfd6e6" fontFamily={font}>{label}</text>
              </g>
            );
          };
          return (
            <Depth g={g} id="w23-bars" start={b[0]} end={b[1]} warm={0.03}>
              {() => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d2a4a" />
                  <line x1={g.x + 40 * g.s} x2={g.x + g.W - 40 * g.s} y1={g.y + 60 * g.s} y2={g.y + 60 * g.s} stroke="#fff" strokeOpacity={0.4} strokeWidth={2 * g.s} />
                  {bar(17.75, g.x + g.W * 0.22, "ซัมซุง", wf("korea", "ซัม"))}
                  {bar(24.33, g.x + g.W * 0.58, "SK hynix", wf("korea", "เอ"))}
                  {tag(g, "สัปดาห์ 12–16 ต.ค. · ตลาดหลักทรัพย์เกาหลี", g.H - 22, "#cfd6e6")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-wafer" anchor={PL.seoul} start={c[0]} end={c[1]} sky={["#141a28", "#2a3450"]}>
        {(g) => {
          const crack = ramp(frame, wf("korea", "กลัว"), wf("korea", "กลัว") + 16);
          const chase = interpolate(frame, [c[0], c[1]], [0, 1], clamp);
          return (
            <Depth g={g} id="w23-wafer" start={c[0]} end={c[1]} impact={impactAt(frame, [wf("korea", "กลัว") + 8], 6) * 0.4} warm={0.03}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a28" />
                  <g transform={`translate(${g.x + g.W * 0.62 + pan * 0.6},${g.y + g.H * 0.48})`}>
                    <circle r={130 * g.s} fill="#9aa6b8" stroke={PAL.ink} strokeWidth={3 * g.s} />
                    {Array.from({ length: 7 }, (_, r) =>
                      Array.from({ length: 7 }, (_, cI) => {
                        const x = (cI - 3) * 32 * g.s;
                        const y = (r - 3) * 32 * g.s;
                        return Math.hypot(x, y) < 112 * g.s ? <rect key={`${r}${cI}`} x={x - 13 * g.s} y={y - 13 * g.s} width={26 * g.s} height={26 * g.s} fill={(r + cI) % 2 ? "#6a7fa8" : "#8a6aa8"} opacity={0.85} /> : null;
                      }),
                    )}
                    <path d={`M${-120 * g.s} ${-30 * g.s} L${-40 * g.s} ${10 * g.s} L${10 * g.s} ${-20 * g.s} L${70 * g.s} ${40 * g.s} L${125 * g.s} ${20 * g.s}`} fill="none" stroke="#0b1020" strokeWidth={5 * g.s} strokeDasharray={`${600 * g.s}`} strokeDashoffset={`${600 * g.s * (1 - crack)}`} />
                  </g>
                  {/* China flag chasing */}
                  <g transform={`translate(${g.x + g.W * (0.08 + 0.18 * chase) + pan * 0.9},${g.y + g.H * 0.4})`}>
                    <rect width={110 * g.s} height={74 * g.s} fill="#de2910" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    <text x={22 * g.s} y={34 * g.s} fontSize={30 * g.s} fill="#ffde00">★</text>
                    <path d={`M${120 * g.s} ${37 * g.s} l${80 * g.s} 0 m${-20 * g.s} ${-16 * g.s} l${20 * g.s} ${16 * g.s} l${-20 * g.s} ${16 * g.s}`} stroke={GOLD} strokeWidth={6 * g.s} fill="none" />
                  </g>
                  {tag(g, "กลัวจีนตามทันชิปหน่วยความจำ", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= VOLVO ================= */
const CarBody = ({ x, y, s, color }: { x: number; y: number; s: number; color: string }) => (
  <g>
    <path d={`M${x - 80 * s} ${y - 20 * s} L${x - 70 * s} ${y - 50 * s} L${x - 30 * s} ${y - 70 * s} L${x + 40 * s} ${y - 70 * s} L${x + 75 * s} ${y - 45 * s} L${x + 85 * s} ${y - 20 * s} Z`} fill={color} stroke={PAL.ink} strokeWidth={1.8 * s} />
    <path d={`M${x - 26 * s} ${y - 64 * s} L${x + 36 * s} ${y - 64 * s} L${x + 60 * s} ${y - 46 * s} L${x - 50 * s} ${y - 46 * s} Z`} fill="#8aa8c0" opacity={0.7} />
    {[-50, 50].map((dx) => <circle key={dx} cx={x + dx * s} cy={y - 18 * s} r={16 * s} fill="#1a1d24" stroke={PAL.ink} strokeWidth={1.4 * s} />)}
  </g>
);
export const VolvoPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.volvo.start + 16, wf("volvo", "ขาดทุน"), wf("volvo", "ประกาศ")], endOf("volvo"));
  return (
    <>
      <Panel id="w23-factory" anchor={PL.gothenburg} start={a[0]} end={a[1]} sky={["#3a4250", "#8a96a4"]}>
        {(g) => {
          const belt = interpolate(frame, [a[0], a[1]], [0, 120], clamp) * g.s;
          return (
            <Depth g={g} id="w23-factory" start={a[0]} end={a[1]} warm={0.05}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#4a5260" />
                  {[0.15, 0.4, 0.65, 0.9].map((fx, i) => <Glow key={i} x={g.x + g.W * fx + pan * 0.1} y={g.y + 40 * g.s} s={g.s * 0.5} color="#e8f0ff" core="#ffffff" />)}
                  {Array.from({ length: 10 }, (_, i) => <line key={i} x1={g.x + i * 110 * g.s + pan * 0.2} y1={g.y} x2={g.x + i * 110 * g.s + pan * 0.2} y2={g.ground - 60 * g.s} stroke="#3a404c" strokeWidth={8 * g.s} />)}
                  <rect x={g.x} y={g.ground - 40 * g.s} width={g.W} height={26 * g.s} fill="#2a2f38" />
                  {[0, 1, 2, 3].map((i) => <CarBody key={i} x={g.x + (120 + i * 250) * g.s + belt + pan * 0.6} y={g.ground - 40 * g.s} s={g.s * 1.1} color={["#e8e4dc", "#2b3a55", "#8a1c1c", "#c0c4ca"][i]} />)}
                  <Ground g={g} color="#3a3f48" top="#5a606a" />
                  {[0, 1].map((i) => <Fighter key={i} x={g.x + g.W * (0.3 + i * 0.4) + pan * 1.2} y={g.ground + 40 * g.s} scale={g.sc * 0.9} mode="stand" weapon="none" costume={MODERN.worker} phase={i * 2} />)}
                  {tag(g, "วอลโว่ คาร์ส · โกเธนเบิร์ก สวีเดน", 74)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-loss" anchor={PL.gothenburg} start={b[0]} end={b[1]} sky={["#141a24", "#202a38"]}>
        {(g) => {
          const k = ramp(frame, b[0] + 4, b[0] + 24);
          return (
            <Depth g={g} id="w23-loss" start={b[0]} end={b[1]} warm={0.02}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a24" />
                  <rect x={g.x + 60 * g.s + pan * 0.3} y={g.y + 50 * g.s} width={g.W - 120 * g.s} height={g.H - 110 * g.s} rx={10 * g.s} fill="#0a0d12" stroke="#3a4250" strokeWidth={3 * g.s} />
                  <text x={g.cx + pan * 0.3} y={g.y + 110 * g.s} textAnchor="middle" fontSize={28 * g.s} fontWeight={700} fill="#cfd6e6" fontFamily={font}>ผลประกอบการไตรมาส 3 / 2569</text>
                  <text x={g.cx + pan * 0.3} y={g.y + 200 * g.s} textAnchor="middle" fontSize={80 * g.s} fontWeight={900} fill={RED} fontFamily={font}>−{(3.7 * k).toFixed(1)}</text>
                  <text x={g.cx + pan * 0.3} y={g.y + 250 * g.s} textAnchor="middle" fontSize={30 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>พันล้านโครนา (ขาดทุนจากการดำเนินงาน)</text>
                  <Fighter x={g.x + g.W * 0.2 + pan * 1.3} y={g.ground + 70 * g.s} scale={g.sc * 0.9} mode="stand" weapon="none" costume={MODERN.suitB} />
                  <Chip g={g} label="ปีก่อน" value="กำไร" color="#3fb950" />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-jobs" anchor={PL.gothenburg} start={c[0]} end={c[1]} sky={["#5a6a80", "#c8ccd4"]}>
        {(g) => {
          const walk = interpolate(frame, [c[0], c[1]], [0, 200], clamp) * g.s;
          return (
            <Depth g={g} id="w23-jobs" start={c[0]} end={c[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.15} y={g.ground - 190 * g.s} s={g.s} color="#f0e0c0" core="#fff4dc" />
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={26 * g.s} seed={91} color="#6a7a6a" shift={pan * 0.2} />
                  <rect x={g.x + g.W * 0.45 + pan * 0.5} y={g.ground - 200 * g.s} width={g.W * 0.5} height={186 * g.s} fill="#c8ccd4" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <rect x={g.x + g.W * 0.6 + pan * 0.5} y={g.ground - 110 * g.s} width={110 * g.s} height={96 * g.s} fill="#2a2f38" />
                  <text x={g.x + g.W * 0.7 + pan * 0.5} y={g.ground - 160 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill="#1d3557" fontFamily="Arial, sans-serif" letterSpacing={6 * g.s}>VOLVO</text>
                  <Mist g={g} y={g.ground - 60 * g.s} color="#e8ecf0" />
                  <Ground g={g} color="#6b6f76" top="#8d8a84" />
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <Fighter x={g.x + g.W * (0.62 - i * 0.12) + pan * 1.2 - walk} y={g.ground + 20 * g.s} scale={g.sc * 0.85} flip mode="walk" weapon="none" costume={i % 2 ? MODERN.worker : MODERN.civ} phase={i * 1.5} />
                      <rect x={g.x + g.W * (0.62 - i * 0.12) - 40 * g.s + pan * 1.2 - walk} y={g.ground - 60 * g.s} width={34 * g.s} height={26 * g.s} fill="#c9a66b" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                    </g>
                  ))}
                  <Grass g={g} shift={pan * 1.6} color="#3a4a34" />
                  <Chip g={g} label={frame >= wf("volvo", "ใน", 0.8, 1) ? "ในสวีเดน" : "ทั่วโลก"} value={frame >= wf("volvo", "ใน", 0.8, 1) ? "2,000 ตำแหน่ง" : "ลด 2,500 ตำแหน่ง"} />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= POLAND – INDIA ================= */
const POL = ["#ffffff", "#dc143c"];
const IND = ["#ff9933", "#ffffff", "#138808"];
export const IndiaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.india.start + 16, wf("india", "หารือ"), wf("india", "อวกาศ")], endOf("india"));
  return (
    <>
      <Panel id="w23-arrive" anchor={PL.delhi} start={a[0]} end={a[1]} sky={["#e0a060", "#f6e2bc"]}>
        {(g) => {
          const p = ramp(frame, a[0], a[1], Easing.out(Easing.quad));
          return (
            <Depth g={g} id="w23-arrive" start={a[0]} end={a[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.8} y={g.ground - 170 * g.s} s={g.s} />
                  {/* India Gate */}
                  <g transform={`translate(${g.x + g.W * 0.2 + pan * 0.2},${g.ground - 40 * g.s})`}>
                    <path d={`M${-60 * g.s} 0 L${-60 * g.s} ${-150 * g.s} L${60 * g.s} ${-150 * g.s} L${60 * g.s} 0 L${25 * g.s} 0 L${25 * g.s} ${-80 * g.s} Q0 ${-110 * g.s} ${-25 * g.s} ${-80 * g.s} L${-25 * g.s} 0 Z`} fill="#c8906a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={-70 * g.s} y={-170 * g.s} width={140 * g.s} height={20 * g.s} fill="#b07a54" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  </g>
                  <Ridge g={g} base={g.ground - 30 * g.s} amp={12 * g.s} seed={95} color="#b89a7a" shift={pan * 0.5} />
                  <Ground g={g} color="#8a8478" top="#a8a296" />
                  <g transform={`rotate(${8 * (1 - p)},${g.x + g.W * (0.25 + 0.45 * p)},${g.y + g.H * 0.4})`}>
                    <Airliner x={g.x + g.W * (0.25 + 0.45 * p)} y={g.y + g.H * (0.3 + 0.25 * p)} scale={g.sc * 1.3} tail="#dc143c" />
                  </g>
                  <Flag x={g.x + g.W * 0.88 + pan * 1.1} y={g.ground + 10 * g.s} s={g.s} bands={POL} wave={Math.sin(frame * 0.2) * 3} />
                  <Grass g={g} shift={pan * 1.6} color="#6a5a3a" />
                  {tag(g, "ตุสก์ถึงนิวเดลี · ครั้งแรกในรอบ 16 ปี", 74)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-meet" anchor={PL.delhi} start={b[0]} end={b[1]} sky={["#4a3a2a", "#c9a46a"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w23-meet" start={b[0]} end={b[1]} warm={0.1}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6a4a30" />
                {[0.2, 0.5, 0.8].map((fx, i) => (
                  <g key={i}>
                    <path d={`M${g.x + g.W * fx - 60 * g.s + pan * 0.2} ${g.y + 240 * g.s} L${g.x + g.W * fx - 60 * g.s + pan * 0.2} ${g.y + 90 * g.s} Q${g.x + g.W * fx + pan * 0.2} ${g.y + 30 * g.s} ${g.x + g.W * fx + 60 * g.s + pan * 0.2} ${g.y + 90 * g.s} L${g.x + g.W * fx + 60 * g.s + pan * 0.2} ${g.y + 240 * g.s} Z`} fill="#e8d3a0" opacity={0.3} />
                    <Glow x={g.x + g.W * fx + pan * 0.2} y={g.y + 40 * g.s} s={g.s * 0.5} color="#ffe7b0" core="#fff6dc" />
                  </g>
                ))}
                <Flag x={g.x + g.W * 0.4 + pan * 0.6} y={g.ground - 50 * g.s} s={g.s * 0.8} bands={POL} />
                <Flag x={g.x + g.W * 0.58 + pan * 0.6} y={g.ground - 50 * g.s} s={g.s * 0.8} bands={IND} />
                <rect x={g.x + 80 * g.s + pan} y={g.ground - 60 * g.s} width={g.W - 160 * g.s} height={22 * g.s} fill="#3a2414" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={g.x + 100 * g.s + pan} y={g.ground - 38 * g.s} width={g.W - 200 * g.s} height={60 * g.s} fill="#2a1a10" />
                <Fighter x={g.x + g.W * 0.18 + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc} mode="stand" weapon="none" costume={MODERN.suitB} />
                <Fighter x={g.x + g.W * 0.82 + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc} flip mode="stand" weapon="none" costume={{ jacket: "#efe6d0", sash: "#c9a227", pants: "#efe6d0", head: "short", headColor: "#e8e8e8", skin: "#c68b62" }} phase={1} />
                {tag(g, "ตุสก์ – โมดี · นิวเดลี", 66, "#ffe7b0")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-space" anchor={PL.delhi} start={c[0]} end={c[1]} sky={["#0b1430", "#3a4a7a"]}>
        {(g) => {
          const lift = ramp(frame, c[0] + 6, c[1], Easing.in(Easing.quad)) * 160 * g.s;
          const chips = [["กลาโหม", wf("india", "กลาโหม")], ["อวกาศ", wf("india", "อวกาศ")], ["การค้า", wf("india", "การ")]] as const;
          return (
            <Depth g={g} id="w23-space" start={c[0]} end={c[1]} warm={0.04}>
              {(pan) => (
                <g>
                  <Stars g={g} />
                  <Ridge g={g} base={g.ground - 50 * g.s} amp={20 * g.s} seed={97} color="#1e2a48" shift={pan * 0.2} />
                  <Ground g={g} color="#2a3040" top="#3a4050" />
                  <Rocket x={g.x + g.W * 0.28 + pan * 0.6} y={g.ground - 14 * g.s} scale={g.sc * 1.3} lift={lift} burn={ramp(frame, c[0], c[0] + 8)} />
                  <Smoke x={g.x + g.W * 0.28 + pan * 0.6} y={g.ground - 40 * g.s} size={70 * g.s} seed={98} k={ramp(frame, c[0] + 4, c[0] + 30)} />
                  {chips.map(([t, f], i) =>
                    frame >= Math.min(f, c[0]) ? (
                      <g key={t} transform={`translate(${g.x + g.W * 0.55},${g.y + (90 + i * 70) * g.s}) scale(${0.8 + 0.2 * age(frame, Math.min(f, c[0]), 6)})`}>
                        <rect x={0} y={-36 * g.s} width={280 * g.s} height={52 * g.s} rx={10 * g.s} fill="#0b1426" stroke={GOLD} strokeWidth={2.5 * g.s} />
                        <text x={20 * g.s} y={2 * g.s} fontSize={32 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{t}</text>
                      </g>
                    ) : null,
                  )}
                  <Grass g={g} shift={pan * 1.6} color="#141a2a" />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= BRAZIL ================= */
export const BrazilPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.brazil.start + 16, wf("brazil", "ระหว่าง"), wf("brazil", "โพล")], endOf("brazil"));
  return (
    <>
      <Panel id="w23-ballot" anchor={PL.brasilia} start={a[0]} end={a[1]} sky={["#4a90c0", "#cfe6f0"]}>
        {(g) => (
          <Depth g={g} id="w23-ballot" start={a[0]} end={a[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.85} y={g.ground - 200 * g.s} s={g.s} />
                {/* Congress: twin towers + two bowls */}
                <g transform={`translate(${pan * 0.2},0)`}>
                  {[0, 1].map((i) => <rect key={i} x={g.x + g.W * 0.48 + i * 34 * g.s} y={g.ground - 230 * g.s} width={26 * g.s} height={200 * g.s} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.4 * g.s} />)}
                  <path d={`M${g.x + g.W * 0.3} ${g.ground - 40 * g.s} q${60 * g.s} ${-60 * g.s} ${120 * g.s} 0 Z`} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                  <path d={`M${g.x + g.W * 0.66} ${g.ground - 40 * g.s} q${60 * g.s} ${50 * g.s} ${120 * g.s} 0 Z`} fill="#e8e4dc" stroke={PAL.ink} strokeWidth={1.4 * g.s} transform={`translate(0,${-30 * g.s})`} />
                </g>
                <Ridge g={g} base={g.ground - 30 * g.s} amp={10 * g.s} seed={101} color="#6a8a5a" shift={pan * 0.5} />
                <Ground g={g} color="#7a8a5a" top="#9aaa6a" />
                <BallotBox x={g.cx + pan * 0.8} y={g.ground} scale={g.sc * 1.8} text="TSE" />
                {[0, 1, 2, 3].map((i) => <Fighter key={i} x={g.x + g.W * (0.12 + i * 0.08) + pan * 1.1} y={g.ground + 20 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={i % 2 ? MODERN.voter : MODERN.voter2} phase={i} />)}
                <Grass g={g} shift={pan * 1.6} color="#4a6a34" />
                {tag(g, "เลือกตั้งประธานาธิบดีรอบสอง · อาทิตย์ 25 ต.ค.", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w23-scale" anchor={PL.brasilia} start={b[0]} end={b[1]} sky={["#1d3557", "#3a6a5a"]} accent={GOLD}>
        {(g) => {
          const tilt = 4 * Math.sin(frame * 0.08);
          return (
            <Depth g={g} id="w23-scale" start={b[0]} end={b[1]} warm={0.04}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d3557" />
                  <path d={`M${g.cx} ${g.y + 20 * g.s} L${g.x + g.W - 20 * g.s} ${g.y + g.H / 2} L${g.cx} ${g.y + g.H - 20 * g.s} L${g.x + 20 * g.s} ${g.y + g.H / 2} Z`} fill="#009c3b" opacity={0.25} />
                  <g transform={`translate(${g.cx + pan * 0.6},${g.ground - 20 * g.s})`}>
                    <rect x={-6 * g.s} y={-220 * g.s} width={12 * g.s} height={210 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={-50 * g.s} y={-14 * g.s} width={100 * g.s} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <g transform={`rotate(${tilt},0,${-210 * g.s})`}>
                      <rect x={-200 * g.s} y={-214 * g.s} width={400 * g.s} height={8 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                      {([[-190, "ลูลา", "#c0392b"], [190, "ฟลาวิโอ", "#1d6fb8"]] as const).map(([dx, name, col]) => (
                        <g key={name} transform={`rotate(${-tilt},${dx * g.s},${-210 * g.s})`}>
                          <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s - 50 * g.s} y2={-120 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                          <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s + 50 * g.s} y2={-120 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                          <path d={`M${dx * g.s - 60 * g.s} ${-120 * g.s} Q${dx * g.s} ${-90 * g.s} ${dx * g.s + 60 * g.s} ${-120 * g.s} Z`} fill={col} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                          <text x={dx * g.s} y={-60 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill="#fff" stroke="#0b1426" strokeWidth={6 * g.s} paintOrder="stroke" fontFamily={font}>{name}</text>
                        </g>
                      ))}
                    </g>
                  </g>
                  {tag(g, "ลูลา vs ฟลาวิโอ โบลโซนาโร", 66, "#ffe7b0")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w23-poll" anchor={PL.brasilia} start={c[0]} end={c[1]} sky={["#141a24", "#202a38"]}>
        {(g) => {
          const k = ramp(frame, c[0] + 4, c[0] + 24, Easing.out(Easing.cubic));
          const row = (i: number, name: string, v: number, col: string) => (
            <g transform={`translate(${g.x + 80 * g.s},${g.y + (110 + i * 90) * g.s})`}>
              <text x={0} y={0} fontSize={30 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{name}</text>
              <rect x={0} y={14 * g.s} width={(g.W - 260 * g.s) * (v / 50) * k} height={36 * g.s} rx={6 * g.s} fill={col} />
              <text x={(g.W - 260 * g.s) * (v / 50) * k + 12 * g.s} y={44 * g.s} fontSize={34 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{Math.round(v * k)}%</text>
            </g>
          );
          return (
            <Depth g={g} id="w23-poll" start={c[0]} end={c[1]} warm={0.02}>
              {() => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a24" />
                  {row(0, "ฟลาวิโอ โบลโซนาโร", 47, "#1d6fb8")}
                  {row(1, "ลูลา", 45, "#c0392b")}
                  {tag(g, "Datafolha 13–14 ต.ค. · ค่าคลาดเคลื่อน ±2", g.H - 22, "#cfd6e6")}
                  <Stamp g={g} text="สูสี" k={ramp(frame, wf("brazil", "สูสี"), wf("brazil", "สูสี") + 8, Easing.out(Easing.back(2)))} color={GOLD} />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};
