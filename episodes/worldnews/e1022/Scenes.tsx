import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import type { InsetGeom } from "../../../components/Inset";
import { Airliner, Fire, InfoChip, Smoke } from "../../../components/Props";
import { Banner, COSTUME, Depth, Fighter, Glow, Grass, impactAt, PAL, Ridge, type Costume } from "../../../components/Scene";
import { font, GOLD, Panel, RED } from "../../thaihistory/news/kit";
import { age, clamp, Helicopter, Hemicycle, Lectern, Palm, Rain, ramp, Waves } from "../e1021/Art";
import { B, chain, endOf, PL, wf } from "./kit";

// Illustration panels, style v2 (Depth + parallax ridges + light + jointed figures + impact + paper grain).
// Every panel is labelled "ภาพประกอบ". No injured people are drawn; grim numbers go on chips.
// Event frames live in EV so the picture, the shake and the <Hit> sounds share one schedule.
const MODERN: Record<string, Costume> = {
  suit: { jacket: "#232838", sash: "#b8322a", pants: "#1c1f29", head: "short", skin: "#e0b08a" },
  suitB: { jacket: "#2f3b55", sash: "#d9d4c7", pants: "#252a36", head: "short", skin: "#c68b62" },
  civ: { jacket: "#4f7a9a", sash: "#e9c46a", pants: "#3a3d4a", head: "short", skin: "#e0b08a" },
  civ2: { jacket: "#b5654a", sash: "#2b3a67", pants: "#3a3030", head: "wrap", headColor: "#efe6d0", skin: "#b9784e" },
  mp: { jacket: "#3a4a3a", sash: "#c9a227", pants: "#2a3328", head: "short", skin: "#7a4a2e" },
  un: { jacket: "#5b6e4a", sash: "#3a5a8a", pants: "#4a5a3a", head: "helmet", headColor: "#4fa3ff", skin: "#c68b62" },
  riot: { jacket: "#1f2a3a", sash: "#3a4a5a", pants: "#1a2230", head: "helmet", headColor: "#2a3442", skin: "#e0b08a" },
};

// ---------- event schedule (frames) ----------
export const EV = {
  hookOff: [8, 22, 38, 52, 64],
  phpRed: [] as number[],
  saudiHit: 0,
  prisonDoor: 0,
  kyivHit: 0,
  vote: 0,
  scale: 0,
};
EV.phpRed = [0, 1, 2, 3, 4, 5].map((i) => wf("php", "ปิด") + 6 + i * 7);
EV.saudiHit = wf("saudi", "โจมตี") + 22;
EV.prisonDoor = B.russia.start + 34;
EV.kyivHit = wf("russia", "ขีปนาวุธ") + 26;
EV.vote = wf("burkina", "ศูนย์");
EV.scale = wf("burkina", "นำ") + 20;

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
// Office building / ministry facade with columns and a flag.
const Ministry = ({ g, x, w, flag, dark = 0 }: { g: InsetGeom; x: number; w: number; flag: string[]; dark?: number }) => {
  const s = g.s;
  const h = 170 * s;
  return (
    <g>
      <rect x={x} y={g.ground - 14 * s - h} width={w} height={h} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={2 * s} />
      <path d={`M${x - 14 * s} ${g.ground - 14 * s - h} L${x + w / 2} ${g.ground - 14 * s - h - 60 * s} L${x + w + 14 * s} ${g.ground - 14 * s - h} Z`} fill="#e3d6bb" stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={x + 18 * s + (i * (w - 50 * s)) / 5} y={g.ground - 14 * s - h + 20 * s} width={16 * s} height={h - 20 * s} fill="#d9ccb0" stroke={PAL.ink} strokeWidth={1.2 * s} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={x + 40 * s + (i * (w - 90 * s)) / 4} y={g.ground - 14 * s - h + 40 * s} width={22 * s} height={34 * s} fill={dark > (i + 0.5) / 5 ? "#1b1f27" : "#ffd56b"} stroke={PAL.ink} strokeWidth={1 * s} />
      ))}
      <line x1={x + w / 2} y1={g.ground - 14 * s - h - 60 * s} x2={x + w / 2} y2={g.ground - 14 * s - h - 130 * s} stroke="#4a2f18" strokeWidth={3 * s} />
      {flag.map((c, i) => (
        <rect key={i} x={x + w / 2} y={g.ground - 14 * s - h - 130 * s + (i * 36 * s) / flag.length} width={54 * s} height={(36 * s) / flag.length} fill={c} stroke={PAL.ink} strokeWidth={0.8 * s} />
      ))}
    </g>
  );
};
// Monitor on a stand; `on` 0..1 (1 = lit), `red` shows a warning screen.
const Monitor = ({ x, y, s, on, red = 0, frame, seed }: { x: number; y: number; s: number; on: number; red?: number; frame: number; seed: number }) => {
  const flicker = on > 0 && on < 1 ? (Math.floor(frame / 2) % 2 ? 0.2 : 1) : 1;
  return (
    <g>
      <rect x={x - 70 * s} y={y - 100 * s} width={140 * s} height={90 * s} rx={6 * s} fill="#11151c" stroke={PAL.ink} strokeWidth={2 * s} />
      <rect x={x - 62 * s} y={y - 92 * s} width={124 * s} height={74 * s} fill={red ? "#7a1410" : "#1e5f8a"} opacity={on * flicker} />
      {on > 0 &&
        !red &&
        Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={x - 54 * s} y={y - 84 * s + i * 11 * s} width={(40 + random(`m${seed}${i}`) * 60) * s} height={4 * s} fill="#9fd3ff" opacity={on * flicker * 0.8} />
        ))}
      {red > 0 && on > 0 && (
        <text x={x} y={y - 48 * s} textAnchor="middle" fontSize={20 * s} fontWeight={900} fill="#fff" fontFamily={font} opacity={on}>
          OFFLINE
        </text>
      )}
      <rect x={x - 8 * s} y={y - 10 * s} width={16 * s} height={10 * s} fill="#2a2f3a" />
    </g>
  );
};

/* ================= HOOK + PHP ================= */
const ControlRoom = ({ g, offs, flag }: { g: InsetGeom; offs: number[]; flag?: string[] }) => {
  const frame = g.frame;
  return (
    <>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0d1320" />
      <Glow x={g.x + g.W * 0.5} y={g.ground - 120 * g.s} s={g.s} color="#3b6fa0" core="#7fb3e0" />
      {flag && <Banner x={g.x + 50 * g.s} y={g.ground} s={g.s} color={flag[0]} />}
      {[0.18, 0.39, 0.6, 0.81].map((fx, i) =>
        [0, 1].map((row) => {
          const k = i * 2 + row;
          const off = offs[k % offs.length];
          const on = frame < off ? 1 : frame < off + 6 ? 0.5 : 0;
          return <Monitor key={k} x={g.x + g.W * fx} y={g.ground - 30 * g.s - row * 105 * g.s} s={g.s} on={on > 0 ? on : 1} red={frame >= off + 6 ? 1 : 0} frame={frame} seed={k} />;
        }),
      )}
      <rect x={g.x} y={g.ground - 20 * g.s} width={g.W} height={g.H} fill="#1b2230" />
      <Fighter x={g.x + g.W * 0.48} y={g.ground + 30 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={MODERN.suit} />
      <Fighter x={g.x + g.W * 0.62} y={g.ground + 34 * g.s} scale={g.sc * 0.85} mode="stand" flip weapon="none" costume={MODERN.civ} phase={2} />
    </>
  );
};

export const HookPanel = () => {
  const frame = useCurrentFrame();
  return (
    <Panel id="w22-hook" anchor={PL.helsinki} start={-12} end={B.hook.end + 14} sky={["#0d1320", "#1b2230"]}>
      {(g) => (
        <Depth g={g} id="w22-hook" start={-12} end={B.hook.end + 14} impact={impactAt(frame, EV.hookOff, 6) * 0.6} warm={0.03}>
          {() => <ControlRoom g={g} offs={EV.hookOff} />}
        </Depth>
      )}
    </Panel>
  );
};

export const PhpPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c, d] = chain([B.php.start + 20, wf("php", "ฟินแลนด์"), wf("php", "เนเธอร์แลนด์"), wf("php", "ขณะ")], endOf("php"));
  return (
    <>
      <Panel id="w22-ai" anchor={PL.helsinki} start={a[0]} end={a[1]} sky={["#101828", "#24324a"]} accent={GOLD}>
        {(g) => {
          const sweep = interpolate(frame, [a[0], a[1]], [0, 1], clamp);
          const found = frame > wf("php", "พบ");
          return (
            <Depth g={g} id="w22-ai" start={a[0]} end={a[1]} warm={0.02}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0f1726" />
                  {Array.from({ length: 14 }, (_, i) => (
                    <text key={i} x={g.x + 30 * g.s + pan * 0.2} y={g.y + (70 + i * 20) * g.s} fontSize={15 * g.s} fill={found && i === 7 ? "#ff6b5f" : "#6fa8d8"} fontFamily="monospace" opacity={0.85}>
                      {["<?php", "$req = parse($in);", "if ($len > MAX) {", "  $buf = alloc($len);", "}", "memcpy($buf, $req);", "return render($buf);", "unserialize($_GET['q']);", "foreach ($rows as $r)", "  echo $r->name;", "$db->query($sql);", "session_start();", "header('X-Powered-By');", "?>"][i]}
                    </text>
                  ))}
                  {found && <rect x={g.x + 24 * g.s} y={g.y + 197 * g.s} width={330 * g.s} height={26 * g.s} fill="none" stroke={RED} strokeWidth={3 * g.s} />}
                  {/* AI scanner: a robot head with a lens sweeping the code */}
                  <g transform={`translate(${g.x + g.W * (0.55 + 0.25 * sweep) + pan * 0.7},${g.ground - 120 * g.s})`}>
                    <circle r={70 * g.s} fill="none" stroke={GOLD} strokeWidth={6 * g.s} />
                    <circle r={70 * g.s} fill="#ffd56b" opacity={0.12} />
                    <line x1={50 * g.s} y1={50 * g.s} x2={110 * g.s} y2={110 * g.s} stroke={GOLD} strokeWidth={14 * g.s} strokeLinecap="round" />
                    <text y={12 * g.s} textAnchor="middle" fontSize={44 * g.s} fontWeight={900} fill={GOLD} fontFamily={font}>AI</text>
                  </g>
                  {found && <Chip g={g} label="ความรุนแรง (CVSS)" value="9.2 / 10" />}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-servers" anchor={PL.helsinki} start={b[0]} end={b[1]} sky={["#0b1220", "#18233a"]}>
        {(g) => (
          <Depth g={g} id="w22-servers" start={b[0]} end={b[1]} impact={impactAt(frame, EV.phpRed, 5) * 0.4} warm={0.02}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#0b1220" />
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const rx = g.x + 40 * g.s + i * 160 * g.s + pan * (0.4 + i * 0.05);
                  const off = frame >= EV.phpRed[i];
                  return (
                    <g key={i}>
                      <rect x={rx} y={g.y + 60 * g.s} width={120 * g.s} height={g.H - 80 * g.s} fill="#1c2433" stroke={PAL.ink} strokeWidth={2 * g.s} />
                      {Array.from({ length: 9 }, (_, r) => (
                        <g key={r}>
                          <rect x={rx + 10 * g.s} y={g.y + (72 + r * 26) * g.s} width={100 * g.s} height={18 * g.s} fill="#121822" />
                          <circle cx={rx + 98 * g.s} cy={g.y + (81 + r * 26) * g.s} r={4 * g.s} fill={off ? "#ff3b30" : (frame + r * 3 + i) % 12 < 6 ? "#3fb950" : "#1d5a2a"} />
                        </g>
                      ))}
                    </g>
                  );
                })}
                {tag(g, "ฟินแลนด์ปิดบริการออนไลน์ของรัฐ", g.H - 24, "#ffd0cc")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-gov" anchor={PL.hague} start={c[0]} end={c[1]} sky={["#4a5a78", "#c9b8a0"]}>
        {(g) => {
          const shut = ramp(frame, wf("php", "ปิด", 0.8, 1), wf("php", "ปิด", 0.8, 1) + 20);
          return (
            <Depth g={g} id="w22-gov" start={c[0]} end={c[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.82 + pan * 0.1} y={g.ground - 200 * g.s} s={g.s} color="#f0c890" />
                  <Ridge g={g} base={g.ground - 60 * g.s} amp={30 * g.s} seed={3} color="#7d8798" shift={pan * 0.2} />
                  <Ministry g={g} x={g.x + 60 * g.s + pan * 0.5} w={360 * g.s} flag={["#ae1c28", "#ffffff", "#21468b"]} dark={shut} />
                  <Ministry g={g} x={g.x + 520 * g.s + pan * 0.6} w={360 * g.s} flag={["#002395", "#ffffff", "#ed2939"]} dark={shut} />
                  <Mist g={g} y={g.ground - 60 * g.s} />
                  <Ground g={g} color="#6b6f76" top="#8d8a84" />
                  {[0.3, 0.75].map((fx, i) => (
                    <g key={i} opacity={shut}>
                      <rect x={g.x + g.W * fx - 90 * g.s + pan * 0.55} y={g.ground - 150 * g.s} width={180 * g.s} height={40 * g.s} rx={6 * g.s} fill={RED} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                      <text x={g.x + g.W * fx + pan * 0.55} y={g.ground - 121 * g.s} textAnchor="middle" fontSize={24 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>เว็บปิดชั่วคราว</text>
                    </g>
                  ))}
                  <Fighter x={g.x + g.W * 0.48 + pan * 1.2} y={g.ground + 20 * g.s} scale={g.sc * 0.9} mode="walk" weapon="none" costume={MODERN.civ} />
                  <Grass g={g} shift={pan * 1.6} color="#3a4a34" />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-patch" anchor={PL.helsinki} start={d[0]} end={d[1]} sky={["#1d3557", "#457b9d"]} accent="#3fb950">
        {(g) => {
          const p = ramp(frame, wf("php", "แก้"), wf("php", "แก้") + 30);
          return (
            <Depth g={g} id="w22-patch" start={d[0]} end={d[1]} warm={0.03}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#13233a" />
                  <Glow x={g.cx + pan * 0.2} y={g.ground - 130 * g.s} s={g.s} color="#3fb950" core="#a8f0b4" />
                  <rect x={g.cx - 230 * g.s + pan * 0.6} y={g.ground - 250 * g.s} width={460 * g.s} height={190 * g.s} rx={10 * g.s} fill="#0f1726" stroke={PAL.ink} strokeWidth={3 * g.s} />
                  <text x={g.cx + pan * 0.6} y={g.ground - 190 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>PHP · อัปเดตความปลอดภัย</text>
                  <rect x={g.cx - 190 * g.s + pan * 0.6} y={g.ground - 150 * g.s} width={380 * g.s} height={30 * g.s} rx={15 * g.s} fill="#2a3446" />
                  <rect x={g.cx - 190 * g.s + pan * 0.6} y={g.ground - 150 * g.s} width={380 * g.s * p} height={30 * g.s} rx={15 * g.s} fill="#3fb950" />
                  {p >= 1 && <text x={g.cx + pan * 0.6} y={g.ground - 82 * g.s} textAnchor="middle" fontSize={34 * g.s} fontWeight={900} fill="#3fb950" fontFamily={font}>✓ แพตช์ออกแล้ว</text>}
                  <rect x={g.cx - 280 * g.s + pan} y={g.ground - 40 * g.s} width={560 * g.s} height={30 * g.s} fill="#2a2f3a" stroke={PAL.ink} strokeWidth={2 * g.s} />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= SAUDI ================= */
const Terminal = ({ g, pan, hit }: { g: InsetGeom; pan: number; hit: boolean }) => {
  const s = g.s;
  const x = g.x + 200 * s + pan * 0.6;
  return (
    <g>
      <path d={`M${x} ${g.ground - 14 * s} L${x} ${g.ground - 120 * s} Q${x + 260 * s} ${g.ground - 190 * s} ${x + 520 * s} ${g.ground - 120 * s} L${x + 520 * s} ${g.ground - 14 * s} Z`} fill="#e8dcc4" stroke={PAL.ink} strokeWidth={2 * s} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={x + 20 * s + i * 50 * s} y={g.ground - 100 * s} width={36 * s} height={70 * s} fill={hit && i > 3 && i < 8 ? "#3a2a22" : "#7fa9c2"} stroke={PAL.ink} strokeWidth={1 * s} />
      ))}
      <rect x={x + 580 * s} y={g.ground - 230 * s} width={30 * s} height={216 * s} fill="#d9ccb0" stroke={PAL.ink} strokeWidth={1.6 * s} />
      <path d={`M${x + 560 * s} ${g.ground - 230 * s} L${x + 630 * s} ${g.ground - 230 * s} L${x + 620 * s} ${g.ground - 270 * s} L${x + 570 * s} ${g.ground - 270 * s} Z`} fill="#4f7a9a" stroke={PAL.ink} strokeWidth={1.6 * s} />
    </g>
  );
};

export const SaudiPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.saudi.start + 20, wf("saudi", "เสีย"), wf("saudi", "สหรัฐ")], endOf("saudi"));
  return (
    <>
      <Panel id="w22-dmm" anchor={PL.dammam} start={a[0]} end={a[1]} sky={["#2b2440", "#e08a4a"]}>
        {(g) => {
          const fly = ramp(frame, EV.saudiHit - 40, EV.saudiHit, Easing.in(Easing.quad));
          const hit = frame >= EV.saudiHit;
          return (
            <Depth g={g} id="w22-dmm" start={a[0]} end={a[1]} impact={impactAt(frame, [EV.saudiHit], 10)}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.15 + pan * 0.1} y={g.ground - 90 * g.s} s={g.s} color="#ffb070" core="#ffd9a8" />
                  <Ridge g={g} base={g.ground - 40 * g.s} amp={14 * g.s} seed={2} color="#c9a47a" shift={pan * 0.2} />
                  <Terminal g={g} pan={pan} hit={hit} />
                  <Mist g={g} y={g.ground - 50 * g.s} color="#ffd9a8" />
                  <Ground g={g} color="#7a6a58" top="#a08868" />
                  {!hit && fly > 0 && (
                    <g transform={`translate(${g.x + g.W * (0.05 + 0.5 * fly)},${g.y + 60 * g.s + fly * 120 * g.s}) rotate(25) scale(${g.sc * 0.8})`}>
                      <path d="M-30 0 L18 -4 L26 0 L18 4 Z M-4 -2 L14 -22 L20 -22 L10 0 Z M-4 2 L14 22 L20 22 L10 0 Z" fill="#6f767f" stroke={PAL.ink} strokeWidth={1.4} />
                    </g>
                  )}
                  {hit && (
                    <>
                      <Fire x={g.x + g.W * 0.58 + pan * 0.6} y={g.ground - 140 * g.s} size={60 * g.s} seed={5} k={ramp(frame, EV.saudiHit, EV.saudiHit + 10)} />
                      <Smoke x={g.x + g.W * 0.55 + pan * 0.6} y={g.ground - 190 * g.s} size={80 * g.s} seed={6} k={ramp(frame, EV.saudiHit, EV.saudiHit + 30)} />
                    </>
                  )}
                  {tag(g, "สนามบินคิงฟาฮัด · ดัมมาม", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-divert" anchor={PL.dammam} start={b[0]} end={b[1]} sky={["#3a3550", "#d8956a"]}>
        {(g) => {
          const p = ramp(frame, b[0], b[1], Easing.linear);
          return (
            <Depth g={g} id="w22-divert" start={b[0]} end={b[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.8} y={g.ground - 60 * g.s} s={g.s} color="#ffb070" core="#ffd9a8" />
                  <Smoke x={g.x + g.W * 0.25 + pan * 0.3} y={g.ground - 60 * g.s} size={70 * g.s} seed={7} k={1} />
                  <Ridge g={g} base={g.ground - 20 * g.s} amp={10 * g.s} seed={5} color="#a8876a" shift={pan * 0.4} />
                  <g transform={`rotate(${-12 * p},${g.x + g.W * (0.3 + 0.4 * p)},${g.y + g.H * 0.45})`}>
                    <Airliner x={g.x + g.W * (0.3 + 0.4 * p)} y={g.y + g.H * (0.55 - 0.15 * p)} scale={g.sc * 1.1} tail="#2a6f4a" />
                  </g>
                  <Chip g={g} label="GACA" value="เสียชีวิต 1 · เจ็บ 8" />
                  {tag(g, "เครื่องบินถูกเบนไปลงที่อื่น", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-evac" anchor={PL.dammam} start={c[0]} end={c[1]} sky={["#5a7aa0", "#efd2a8"]}>
        {(g) => (
          <Depth g={g} id="w22-evac" start={c[0]} end={c[1]}>
            {(pan) => {
              const walk = interpolate(frame, [c[0], c[1]], [0, 140], clamp) * g.s;
              return (
                <g>
                  <Glow x={g.x + g.W * 0.2} y={g.ground - 170 * g.s} s={g.s} />
                  <Ridge g={g} base={g.ground - 50 * g.s} amp={18 * g.s} seed={8} color="#c9a47a" shift={pan * 0.2} />
                  <Airliner x={g.x + g.W * 0.78 + pan * 0.6} y={g.ground - 40 * g.s} scale={g.sc * 1.3} tail="#1d3557" />
                  <path d={`M${g.x + g.W * 0.62 + pan * 0.6} ${g.ground - 14 * g.s} l${60 * g.s} ${-70 * g.s} l${20 * g.s} 0 l0 ${70 * g.s} Z`} fill="#d9d4c7" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  <Ground g={g} color="#8a8478" top="#a8a296" />
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <Fighter x={g.x + g.W * (0.12 + i * 0.1) + walk} y={g.ground} scale={g.sc * (i === 2 ? 0.6 : 0.85)} mode="walk" weapon="none" costume={i % 2 ? MODERN.civ : MODERN.suitB} phase={i * 1.4} />
                      {i !== 2 && <rect x={g.x + g.W * (0.12 + i * 0.1) + walk - 40 * g.s} y={g.ground - 34 * g.s} width={26 * g.s} height={34 * g.s} rx={4 * g.s} fill={["#b8322a", "#2b3a67", "", "#5b6e4a"][i]} stroke={PAL.ink} strokeWidth={1.4 * g.s} />}
                    </g>
                  ))}
                  <Grass g={g} shift={pan * 1.6} color="#6a5a3a" />
                  {tag(g, "สหรัฐฯ สั่งเจ้าหน้าที่ที่ไม่จำเป็น + ครอบครัว ออกจากซาอุฯ")}
                </g>
              );
            }}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= RUSSIA ================= */
export const RussiaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.russia.start + 20, wf("russia", "ระหว่าง"), wf("russia", "แต่")], endOf("russia"));
  return (
    <>
      <Panel id="w22-free" anchor={PL.spb} start={a[0]} end={a[1]} sky={["#6a7a8a", "#d8d4c8"]}>
        {(g) => {
          const open = ramp(frame, EV.prisonDoor - 10, EV.prisonDoor + 8);
          const walk = interpolate(frame, [EV.prisonDoor, a[1]], [0, 220], clamp) * g.s;
          return (
            <Depth g={g} id="w22-free" start={a[0]} end={a[1]} warm={0.05}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.85} y={g.ground - 200 * g.s} s={g.s} color="#f0e0c0" core="#fff4dc" />
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={20 * g.s} seed={9} color="#8a96a4" shift={pan * 0.2} />
                  <rect x={g.x + 40 * g.s + pan * 0.6} y={g.ground - 220 * g.s} width={420 * g.s} height={206 * g.s} fill="#9a9488" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  {Array.from({ length: 8 }, (_, i) => (
                    <line key={i} x1={g.x + (52 + i * 52) * g.s + pan * 0.6} y1={g.ground - 220 * g.s} x2={g.x + (52 + i * 52) * g.s + pan * 0.6} y2={g.ground - 240 * g.s} stroke="#555" strokeWidth={2 * g.s} />
                  ))}
                  <path d={`M${g.x + 40 * g.s + pan * 0.6} ${g.ground - 236 * g.s} l${420 * g.s} 0`} stroke="#777" strokeWidth={3 * g.s} strokeDasharray={`${6 * g.s} ${4 * g.s}`} />
                  <rect x={g.x + 300 * g.s + pan * 0.6} y={g.ground - 140 * g.s} width={110 * g.s} height={126 * g.s} fill="#2a2420" />
                  <rect x={g.x + 300 * g.s + pan * 0.6 + open * 100 * g.s} y={g.ground - 140 * g.s} width={110 * g.s} height={126 * g.s} fill="#5a5a5e" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <Ground g={g} color="#6b6658" top="#8a8474" />
                  {frame >= EV.prisonDoor - 4 && <Fighter x={g.x + 355 * g.s + pan * 0.6 + walk} y={g.ground} scale={g.sc * 0.9} mode="walk" weapon="none" costume={{ jacket: "#6b5a48", sash: "#3a3028", pants: "#3a3d4a", head: "brodie", headColor: "#c8c8c8", skin: "#e0b08a" }} />}
                  <Grass g={g} shift={pan * 1.6} color="#4a5038" />
                  <Chip g={g} label="สตีเฟน ฮับบาร์ด" value="อายุ 74 ปี" color={GOLD} />
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-talks" anchor={PL.spb} start={b[0]} end={b[1]} sky={["#4a3a2a", "#c9a46a"]} accent={GOLD}>
        {(g) => (
          <Depth g={g} id="w22-talks" start={b[0]} end={b[1]} warm={0.1}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#6b4a2f" />
                {[0.15, 0.5, 0.85].map((fx, i) => (
                  <g key={i}>
                    <rect x={g.x + g.W * fx - 50 * g.s + pan * 0.2} y={g.y + 40 * g.s} width={100 * g.s} height={180 * g.s} rx={50 * g.s} fill="#e8d3a0" opacity={0.35} />
                    <Glow x={g.x + g.W * fx + pan * 0.2} y={g.y + 30 * g.s} s={g.s * 0.5} color="#ffe7b0" core="#fff6dc" />
                  </g>
                ))}
                {[["#b22234", "#ffffff", "#3c3b6e"], ["#ffffff", "#0039a6", "#d52b1e"], ["#0057b7", "#ffd700"]].map((fl, i) => (
                  <g key={i}>
                    <line x1={g.x + g.W * (0.3 + i * 0.2) + pan * 0.6} y1={g.ground - 60 * g.s} x2={g.x + g.W * (0.3 + i * 0.2) + pan * 0.6} y2={g.ground - 180 * g.s} stroke="#c9a227" strokeWidth={3 * g.s} />
                    {fl.map((col, j) => <rect key={j} x={g.x + g.W * (0.3 + i * 0.2) + pan * 0.6} y={g.ground - 180 * g.s + (j * 42 * g.s) / fl.length} width={60 * g.s} height={(42 * g.s) / fl.length} fill={col} stroke={PAL.ink} strokeWidth={0.8 * g.s} />)}
                  </g>
                ))}
                <rect x={g.x + 80 * g.s + pan} y={g.ground - 60 * g.s} width={g.W - 160 * g.s} height={22 * g.s} fill="#3a2414" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                <rect x={g.x + 100 * g.s + pan} y={g.ground - 38 * g.s} width={g.W - 200 * g.s} height={60 * g.s} fill="#2a1a10" />
                {tag(g, "เครมลิน: พร้อมเจรจาสามฝ่าย เดือนพฤศจิกายน", 66, "#ffe7b0")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-kyiv" anchor={PL.kyiv} start={c[0]} end={c[1]} sky={["#05070f", "#1c2541"]}>
        {(g) => {
          const fall = ramp(frame, EV.kyivHit - 24, EV.kyivHit, Easing.in(Easing.quad));
          const hit = frame >= EV.kyivHit;
          return (
            <Depth g={g} id="w22-kyiv" start={c[0]} end={c[1]} impact={impactAt(frame, [EV.kyivHit], 12)} warm={0.03}>
              {(pan) => (
                <g>
                  <Stars g={g} />
                  <Glow x={g.x + g.W * 0.85} y={g.y + 70 * g.s} s={g.s * 0.6} color="#c8d0e0" core="#f0f4ff" />
                  <Ridge g={g} base={g.ground - 60 * g.s} amp={50 * g.s} seed={12} color="#151b2a" shift={pan * 0.3} />
                  {Array.from({ length: 7 }, (_, i) => {
                    const h = (90 + random(`k${i}`) * 90) * g.s;
                    return <rect key={i} x={g.x + i * 140 * g.s + pan * 0.6} y={g.ground - 14 * g.s - h} width={110 * g.s} height={h} fill="#1f2738" stroke={PAL.ink} strokeWidth={1.4 * g.s} />;
                  })}
                  {/* petrol station canopy */}
                  <rect x={g.x + g.W * 0.55 + pan * 0.8} y={g.ground - 110 * g.s} width={220 * g.s} height={18 * g.s} fill="#d9d4c7" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  {[0.58, 0.72].map((fx, i) => <rect key={i} x={g.x + g.W * fx + pan * 0.8} y={g.ground - 92 * g.s} width={14 * g.s} height={78 * g.s} fill="#9aa0a8" />)}
                  <Ground g={g} color="#1a1f2a" top="#2a3040" />
                  {!hit && fall > 0 && (
                    <g transform={`translate(${g.x + g.W * (0.2 + 0.45 * fall)},${g.y + 10 * g.s + fall * (g.H - 100 * g.s)}) rotate(55)`}>
                      <rect x={-30 * g.s} y={-5 * g.s} width={60 * g.s} height={10 * g.s} rx={5 * g.s} fill="#c8c8c8" />
                      <path d={`M${-30 * g.s} 0 L${-110 * g.s} 0`} stroke="#ffb347" strokeWidth={6 * g.s} opacity={0.6} />
                    </g>
                  )}
                  {hit && (
                    <>
                      <ellipse cx={g.x + g.W * 0.68 + pan * 0.8} cy={g.ground - 30 * g.s} rx={220 * g.s} ry={90 * g.s} fill="#ff8a2a" opacity={0.3} />
                      <Fire x={g.x + g.W * 0.68 + pan * 0.8} y={g.ground - 14 * g.s} size={90 * g.s} seed={14} k={ramp(frame, EV.kyivHit, EV.kyivHit + 10)} />
                      <Smoke x={g.x + g.W * 0.66 + pan * 0.8} y={g.ground - 120 * g.s} size={80 * g.s} seed={15} k={ramp(frame, EV.kyivHit, EV.kyivHit + 30)} />
                    </>
                  )}
                  <Grass g={g} shift={pan * 1.6} color="#0f141e" />
                  {tag(g, "เคียฟ · ขีปนาวุธโจมตีคืนวันพุธ")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= FRANCE ================= */
export const FrancePanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.france.start + 20, wf("france", "ที่"), wf("france", "ว่า", 0.8, 1)], endOf("france"));
  const Elysee = ({ g, pan }: { g: InsetGeom; pan: number }) => (
    <g>
      <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#e8dcc0" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x={g.x + (40 + i * 200) * g.s + pan * 0.3} y={g.y + 40 * g.s} width={120 * g.s} height={220 * g.s} fill="#c8b48a" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
          <rect x={g.x + (52 + i * 200) * g.s + pan * 0.3} y={g.y + 52 * g.s} width={96 * g.s} height={196 * g.s} fill="#7fa0c2" opacity={0.5} />
        </g>
      ))}
      {["#002395", "#ffffff", "#ed2939"].map((col, j) => (
        <rect key={j} x={g.x + g.W * 0.78 + j * 34 * g.s + pan * 0.6} y={g.y + 60 * g.s} width={34 * g.s} height={150 * g.s} fill={col} stroke={PAL.ink} strokeWidth={0.8 * g.s} />
      ))}
    </g>
  );
  return (
    <>
      <Panel id="w22-macron" anchor={PL.paris} start={a[0]} end={a[1]} sky={["#e8dcc0", "#c8b48a"]}>
        {(g) => (
          <Depth g={g} id="w22-macron" start={a[0]} end={a[1]} warm={0.06}>
            {(pan) => (
              <g>
                <Elysee g={g} pan={pan} />
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#8a2a2a" />
                <Fighter x={g.cx + pan * 0.8} y={g.ground - 26 * g.s} scale={g.sc * 1.05} mode="stand" weapon="none" costume={MODERN.suitB} />
                <Lectern x={g.cx + pan * 0.8} y={g.ground} scale={g.sc} color="#2f3e46" />
                {tag(g, "มาครง · พระราชวังเอลิเซ")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-riot" anchor={PL.paris} start={b[0]} end={b[1]} sky={["#140e1a", "#4a2a2a"]}>
        {(g) => (
          <Depth g={g} id="w22-riot" start={b[0]} end={b[1]} warm={0.12}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.3 + pan * 0.2} y={g.ground - 80 * g.s} s={g.s} color="#ff7a2a" core="#ffc080" />
                {Array.from({ length: 6 }, (_, i) => (
                  <path key={i} d={`M${g.x + i * 170 * g.s + pan * 0.4} ${g.ground - 14 * g.s} l0 ${-180 * g.s} l${40 * g.s} ${-30 * g.s} l${100 * g.s} 0 l0 ${210 * g.s} Z`} fill="#2a2030" stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                ))}
                <Smoke x={g.x + g.W * 0.3 + pan * 0.5} y={g.ground - 130 * g.s} size={80 * g.s} seed={21} k={1} />
                <Fire x={g.x + g.W * 0.3 + pan * 0.7} y={g.ground - 20 * g.s} size={60 * g.s} seed={22} k={1} />
                <Ground g={g} color="#2a2a30" top="#44444c" />
                {[0, 1, 2, 3].map((i) => (
                  <Fighter key={i} x={g.x + g.W * (0.6 + i * 0.09) + pan * 1.1} y={g.ground + 10 * g.s} scale={g.sc * 0.85} flip mode="stand" weapon="none" costume={MODERN.riot} phase={i} />
                ))}
                <Grass g={g} shift={pan * 1.6} color="#1a1418" />
                {tag(g, "ทรัมป์และผู้นำบางชาติโทษผู้อพยพ ว่าเป็นต้นเหตุจลาจล", g.H - 22, "#ffd0cc")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-quote" anchor={PL.paris} start={c[0]} end={c[1]} sky={["#1d2a4a", "#2b3a67"]} accent={GOLD}>
        {(g) => {
          const k = ramp(frame, c[0], c[0] + 12);
          return (
            <Depth g={g} id="w22-quote" start={c[0]} end={c[1]} warm={0.04}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d2a4a" />
                  {["#002395", "#ffffff", "#ed2939"].map((col, j) => (
                    <rect key={j} x={g.x + j * (g.W / 3) + pan * 0.2} y={g.y} width={g.W / 3} height={g.H} fill={col} opacity={0.12} />
                  ))}
                  <text x={g.cx} y={g.y + 110 * g.s} textAnchor="middle" fontSize={120 * g.s} fill={GOLD} opacity={0.5} fontFamily="serif">“</text>
                  <text x={g.cx} y={g.y + 175 * g.s} textAnchor="middle" fontSize={56 * g.s * (0.8 + 0.2 * k)} fontWeight={900} fill="#fff" opacity={k} fontFamily={font}>ทั้งรับไม่ได้</text>
                  <text x={g.cx} y={g.y + 245 * g.s} textAnchor="middle" fontSize={64 * g.s * (0.8 + 0.2 * k)} fontWeight={900} fill={GOLD} opacity={ramp(frame, wf("france", "โง่"), wf("france", "โง่") + 8)} fontFamily={font}>และโง่เขลา</text>
                  <text x={g.cx} y={g.y + 300 * g.s} textAnchor="middle" fontSize={26 * g.s} fontWeight={700} fill="#cfd6e6" fontFamily={font}>— เอมานุเอล มาครง, 21 ต.ค.</text>
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= BURKINA FASO ================= */
export const BurkinaPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.burkina.start + 20, wf("burkina", "นำ"), wf("burkina", "องค์กร")], endOf("burkina"));
  return (
    <>
      <Panel id="w22-assembly" anchor={PL.ouaga} start={a[0]} end={a[1]} sky={["#4a3a2a", "#a87a4a"]}>
        {(g) => {
          const k = ramp(frame, wf("burkina", "โหวต"), EV.vote, Easing.out(Easing.quad));
          return (
            <Depth g={g} id="w22-assembly" start={a[0]} end={a[1]} warm={0.1}>
              {(pan) => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#5a4030" />
                  <Glow x={g.cx + pan * 0.2} y={g.y + 40 * g.s} s={g.s} color="#ffd38a" />
                  {["#ef2b2d", "#009e49"].map((col, j) => (
                    <rect key={j} x={g.x + g.W * 0.06 + pan * 0.3} y={g.y + 60 * g.s + j * 40 * g.s} width={120 * g.s} height={40 * g.s} fill={col} stroke={PAL.ink} strokeWidth={0.8 * g.s} />
                  ))}
                  <polygon points={`${g.x + g.W * 0.06 + 60 * g.s + pan * 0.3},${g.y + 86 * g.s} ${g.x + g.W * 0.06 + 52 * g.s + pan * 0.3},${g.y + 108 * g.s} ${g.x + g.W * 0.06 + 72 * g.s + pan * 0.3},${g.y + 94 * g.s} ${g.x + g.W * 0.06 + 48 * g.s + pan * 0.3},${g.y + 94 * g.s} ${g.x + g.W * 0.06 + 68 * g.s + pan * 0.3},${g.y + 108 * g.s}`} fill="#fcd116" />
                  <Hemicycle x={g.cx + 60 * g.s + pan * 0.6} y={g.ground - 10 * g.s} r={230 * g.s} s={g.s} yes={71} no={0.0001} k={k} />
                  <text x={g.cx + 60 * g.s + pan * 0.6} y={g.ground - 30 * g.s} textAnchor="middle" fontSize={56 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{Math.round(71 * k)} : 0</text>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Fighter key={i} x={g.x + g.W * (0.08 + i * 0.05) + pan * 1.2} y={g.ground + 40 * g.s} scale={g.sc * 0.7} mode="stand" weapon="none" costume={i % 2 ? MODERN.mp : { ...MODERN.mp, jacket: "#efe6d0" }} phase={i} />
                  ))}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-scale" anchor={PL.ouaga} start={b[0]} end={b[1]} sky={["#c98a4a", "#efd2a8"]}>
        {(g) => {
          const tilt = 16 * ramp(frame, EV.scale - 10, EV.scale + 10);
          const chips = [["ก่อการร้าย", wf("burkina", "ก่อการ")], ["กบฏ", wf("burkina", "กบฏ")], ["จารกรรม", wf("burkina", "จาร")]] as const;
          return (
            <Depth g={g} id="w22-scale" start={b[0]} end={b[1]} impact={impactAt(frame, [EV.scale], 6) * 0.5}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.8 + pan * 0.1} y={g.ground - 180 * g.s} s={g.s} />
                  <Ridge g={g} base={g.ground - 40 * g.s} amp={20 * g.s} seed={17} color="#b07a4a" shift={pan * 0.2} />
                  <Ground g={g} color="#a0623a" top="#c07a4a" />
                  <g transform={`translate(${g.x + g.W * 0.3 + pan * 0.6},${g.ground - 30 * g.s})`}>
                    <rect x={-6 * g.s} y={-220 * g.s} width={12 * g.s} height={210 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={-50 * g.s} y={-14 * g.s} width={100 * g.s} height={14 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <g transform={`rotate(${tilt},0,${-210 * g.s})`}>
                      <rect x={-150 * g.s} y={-214 * g.s} width={300 * g.s} height={8 * g.s} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                      {[-140, 140].map((dx) => (
                        <g key={dx} transform={`rotate(${-tilt},${dx * g.s},${-210 * g.s})`}>
                          <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s - 40 * g.s} y2={-130 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                          <line x1={dx * g.s} y1={-210 * g.s} x2={dx * g.s + 40 * g.s} y2={-130 * g.s} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                          <path d={`M${dx * g.s - 50 * g.s} ${-130 * g.s} Q${dx * g.s} ${-100 * g.s} ${dx * g.s + 50 * g.s} ${-130 * g.s} Z`} fill={PAL.gilt} stroke={PAL.ink} strokeWidth={1.4 * g.s} />
                        </g>
                      ))}
                    </g>
                  </g>
                  {chips.map(([t, f], i) =>
                    frame >= f ? (
                      <g key={t} transform={`translate(${g.x + g.W * 0.58},${g.y + (90 + i * 70) * g.s}) scale(${0.8 + 0.2 * age(frame, f, 6)})`}>
                        <rect x={0} y={-36 * g.s} width={320 * g.s} height={52 * g.s} rx={10 * g.s} fill="#0b1426" stroke={RED} strokeWidth={2.5 * g.s} />
                        <text x={20 * g.s} y={2 * g.s} fontSize={32 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>{t}</text>
                      </g>
                    ) : null,
                  )}
                  {tag(g, "โทษประหารกลับมา", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-rights" anchor={PL.ouaga} start={c[0]} end={c[1]} sky={["#d8a060", "#f0dcb4"]}>
        {(g) => (
          <Depth g={g} id="w22-rights" start={c[0]} end={c[1]}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.15} y={g.ground - 170 * g.s} s={g.s} />
                <Ridge g={g} base={g.ground - 50 * g.s} amp={24 * g.s} seed={19} color="#b88a5a" shift={pan * 0.2} />
                <Ridge g={g} base={g.ground - 20 * g.s} amp={14 * g.s} seed={20} color="#9a6a42" shift={pan * 0.5} />
                <Ground g={g} color="#a0623a" top="#c07a4a" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i}>
                    <Fighter x={g.x + g.W * (0.18 + i * 0.15) + pan * 0.9} y={g.ground + 10 * g.s} scale={g.sc * 0.85} mode="stand" weapon="none" costume={i % 2 ? MODERN.civ2 : MODERN.mp} phase={i} />
                    {i % 2 === 0 && (
                      <g>
                        <line x1={g.x + g.W * (0.18 + i * 0.15) + 14 * g.s + pan * 0.9} y1={g.ground - 140 * g.s} x2={g.x + g.W * (0.18 + i * 0.15) + 14 * g.s + pan * 0.9} y2={g.ground - 80 * g.s} stroke="#5a3a1f" strokeWidth={3 * g.s} />
                        <rect x={g.x + g.W * (0.18 + i * 0.15) - 40 * g.s + pan * 0.9} y={g.ground - 200 * g.s} width={110 * g.s} height={62 * g.s} fill={PAL.chalk} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                        <text x={g.x + g.W * (0.18 + i * 0.15) + 15 * g.s + pan * 0.9} y={g.ground - 162 * g.s} textAnchor="middle" fontSize={20 * g.s} fontWeight={900} fill={RED} fontFamily={font}>สิทธิมนุษยชน</text>
                      </g>
                    )}
                  </g>
                ))}
                <Grass g={g} shift={pan * 1.6} color="#7a5030" />
                <Chip g={g} label="HRW · Amnesty" value="ห่วงใช้เล่นงานผู้เห็นต่าง" color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};

/* ================= HAITI ================= */
export const HaitiPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.haiti.start + 20, wf("haiti", "แก๊ง"), wf("haiti", "และ")], endOf("haiti"));
  return (
    <>
      <Panel id="w22-bukele" anchor={PL.sansal} start={a[0]} end={a[1]} sky={["#2b3a67", "#5a7aa0"]}>
        {(g) => (
          <Depth g={g} id="w22-bukele" start={a[0]} end={a[1]} warm={0.04}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1f2b4a" />
                {["#0047ab", "#ffffff", "#0047ab"].map((col, j) => (
                  <rect key={j} x={g.x + g.W * 0.72 + pan * 0.3} y={g.y + 50 * g.s + j * 50 * g.s} width={200 * g.s} height={50 * g.s} fill={col} stroke={PAL.ink} strokeWidth={0.8 * g.s} />
                ))}
                <Glow x={g.x + g.W * 0.35 + pan * 0.2} y={g.y + 60 * g.s} s={g.s * 0.8} color="#c8d8ff" core="#f0f4ff" />
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#2a2f3a" />
                <Fighter x={g.x + g.W * 0.4 + pan * 0.8} y={g.ground - 26 * g.s} scale={g.sc * 1.05} mode="stand" weapon="none" costume={{ ...MODERN.suit, head: "short", jacket: "#1a1a1a" }} />
                <Lectern x={g.x + g.W * 0.4 + pan * 0.8} y={g.ground} scale={g.sc} color="#1d2a4a" />
                {tag(g, "บูเคเล · ประธานาธิบดีเอลซัลวาดอร์")}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-alley" anchor={PL.pap} start={b[0]} end={b[1]} sky={["#7a6a5a", "#d8c0a0"]}>
        {(g) => (
          <Depth g={g} id="w22-alley" start={b[0]} end={b[1]} warm={0.1}>
            {(pan) => (
              <g>
                <Glow x={g.x + g.W * 0.8} y={g.ground - 190 * g.s} s={g.s} color="#ffd0a0" />
                <Ridge g={g} base={g.ground - 90 * g.s} amp={50 * g.s} seed={23} color="#7a8a6a" shift={pan * 0.2} />
                {Array.from({ length: 6 }, (_, i) => (
                  <g key={i}>
                    <rect x={g.x + i * 170 * g.s + pan * 0.5} y={g.ground - (110 + (i % 3) * 30) * g.s} width={150 * g.s} height={(96 + (i % 3) * 30) * g.s} fill={["#c9a47a", "#a8b48a", "#d8b8a0"][i % 3]} stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <rect x={g.x + i * 170 * g.s + 40 * g.s + pan * 0.5} y={g.ground - 70 * g.s} width={30 * g.s} height={56 * g.s} fill="#3a2a22" />
                  </g>
                ))}
                <Smoke x={g.x + g.W * 0.2 + pan * 0.4} y={g.ground - 150 * g.s} size={70 * g.s} seed={24} k={1} />
                <Ground g={g} color="#7a6a58" top="#9a8a74" />
                {/* abandoned armoured vehicle */}
                <g transform={`translate(${g.x + g.W * 0.55 + pan * 0.8},${g.ground})`}>
                  <path d={`M${-120 * g.s} ${-14 * g.s} L${-120 * g.s} ${-70 * g.s} L${-70 * g.s} ${-100 * g.s} L${100 * g.s} ${-100 * g.s} L${130 * g.s} ${-60 * g.s} L${130 * g.s} ${-14 * g.s} Z`} fill="#e8e8e8" stroke={PAL.ink} strokeWidth={2 * g.s} />
                  <text x={0} y={-50 * g.s} textAnchor="middle" fontSize={30 * g.s} fontWeight={900} fill="#1d3557" fontFamily={font}>GSF</text>
                  {[-80, 0, 80].map((dx) => <circle key={dx} cx={dx * g.s} cy={-14 * g.s} r={20 * g.s} fill="#222" />)}
                </g>
                <Grass g={g} shift={pan * 1.6} color="#4a5a34" />
                <Chip g={g} label="ซานโต · ครัวเดบูเก" value="4 นาย ถูกจับเป็นตัวประกัน" />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-rescue" anchor={PL.pap} start={c[0]} end={c[1]} sky={["#e0905a", "#f4dcb0"]}>
        {(g) => {
          const p = ramp(frame, c[0], c[1], Easing.linear);
          return (
            <Depth g={g} id="w22-rescue" start={c[0]} end={c[1]}>
              {(pan) => (
                <g>
                  <Glow x={g.x + g.W * 0.2} y={g.ground - 60 * g.s} s={g.s} color="#ffb070" core="#ffe0b0" />
                  <Ridge g={g} base={g.ground - 70 * g.s} amp={50 * g.s} seed={26} color="#6a7a5a" shift={pan * 0.2} />
                  <Ridge g={g} base={g.ground - 20 * g.s} amp={24 * g.s} seed={27} color="#4a5a3a" shift={pan * 0.5} />
                  <Mist g={g} y={g.ground - 70 * g.s} color="#ffe0b0" />
                  <Helicopter x={g.x + g.W * (0.85 - 0.3 * p)} y={g.y + 110 * g.s} scale={g.sc * 1.2} frame={frame} />
                  <Ground g={g} color="#4a5a34" top="#6a7a4a" />
                  {[0, 1, 2, 3].map((i) => (
                    <Fighter key={i} x={g.x + g.W * (0.1 + i * 0.09) + p * 160 * g.s} y={g.ground + 10 * g.s} scale={g.sc * 0.85} mode="run" weapon="rifle" costume={MODERN.un} phase={i * 1.2} />
                  ))}
                  <Grass g={g} shift={pan * 1.6} color="#2f3a24" />
                  {tag(g, "ปฏิบัติการชิงตัวประกัน")}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
    </>
  );
};

/* ================= EL NINO ================= */
export const ElNinoPanels = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = chain([B.elnino.start + 20, wf("elnino", "ผิวน้ำ"), wf("elnino", "ช่วง")], endOf("elnino"));
  return (
    <>
      <Panel id="w22-ocean" anchor={PL.nino} start={a[0]} end={a[1]} sky={["#f0a050", "#ffe0a0"]}>
        {(g) => {
          const heat = ramp(frame, a[0], wf("elnino", "บันทึก"), Easing.inOut(Easing.quad));
          return (
            <Depth g={g} id="w22-ocean" start={a[0]} end={a[1]} warm={0.12}>
              {(pan) => (
                <g>
                  <Glow x={g.cx + pan * 0.1} y={g.ground - 170 * g.s} s={g.s * 1.3} color="#ffb040" core="#fff0b0" />
                  <Waves g={g} level={g.ground - 60 * g.s} frame={frame} color="#2f6690" amp={6} />
                  <rect x={g.x} y={g.ground - 50 * g.s} width={g.W} height={g.H} fill="#d9480f" opacity={0.55 * heat} />
                  {Array.from({ length: 8 }, (_, i) => (
                    <path key={i} d={`M${g.x + (80 + i * 120) * g.s + pan * 0.5} ${g.ground - 70 * g.s - ((frame * 1.5 + i * 20) % 100) * g.s} q${8 * g.s} ${-10 * g.s} 0 ${-20 * g.s} q${-8 * g.s} ${-10 * g.s} 0 ${-20 * g.s}`} stroke="#fff3d0" strokeWidth={3 * g.s} fill="none" opacity={0.5 * heat} />
                  ))}
                  {tag(g, "แปซิฟิกเขตศูนย์สูตร · น้ำอุ่นผิดปกติ", g.H - 22)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-thermo" anchor={PL.nino} start={b[0]} end={b[1]} sky={["#1d2a4a", "#3a4a6a"]} accent={GOLD}>
        {(g) => {
          const k = ramp(frame, b[0] + 6, wf("elnino", "องศา") + 10, Easing.out(Easing.quad));
          const bar = (v: number, x: number, col: string, label: string, kk: number) => {
            const h = (v / 4) * 230 * g.s * kk;
            return (
              <g>
                <rect x={x} y={g.ground - 20 * g.s - h} width={120 * g.s} height={h} fill={col} stroke={PAL.ink} strokeWidth={2 * g.s} />
                <text x={x + 60 * g.s} y={g.ground - 30 * g.s - h} textAnchor="middle" fontSize={40 * g.s} fontWeight={900} fill="#fff" fontFamily={font}>+{(v * kk).toFixed(1)}°</text>
                <text x={x + 60 * g.s} y={g.ground + 20 * g.s} textAnchor="middle" fontSize={24 * g.s} fontWeight={700} fill="#cfd6e6" fontFamily={font}>{label}</text>
              </g>
            );
          };
          return (
            <Depth g={g} id="w22-thermo" start={b[0]} end={b[1]} warm={0.03}>
              {() => (
                <g>
                  <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#1d2a4a" />
                  {bar(2.6, g.x + g.W * 0.25, "#8a96a4", "สถิติเดิม 2015–16", 1)}
                  {bar(3.8, g.x + g.W * 0.58, RED, "คาดการณ์ ธ.ค. 2569", k)}
                  {[1, 2, 3, 4].map((t) => <line key={t} x1={g.x + 40 * g.s} x2={g.x + g.W - 40 * g.s} y1={g.ground - 20 * g.s - (t / 4) * 230 * g.s} y2={g.ground - 20 * g.s - (t / 4) * 230 * g.s} stroke="#fff" strokeOpacity={0.12} />)}
                </g>
              )}
            </Depth>
          );
        }}
      </Panel>
      <Panel id="w22-impact" anchor={PL.nino} start={c[0]} end={c[1]} sky={["#c98a4a", "#5a6a8a"]}>
        {(g) => (
          <Depth g={g} id="w22-impact" start={c[0]} end={c[1]}>
            {(pan) => (
              <g>
                {/* left: drought */}
                <rect x={g.x} y={g.y} width={g.W / 2} height={g.H} fill="#e8b070" />
                <Glow x={g.x + g.W * 0.2} y={g.y + 80 * g.s} s={g.s} color="#ffb040" core="#fff0b0" />
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W / 2} height={g.H} fill="#b07a4a" />
                {Array.from({ length: 10 }, (_, i) => (
                  <path key={i} d={`M${g.x + (20 + i * 46) * g.s + pan * 0.3} ${g.ground} l${10 * g.s} ${20 * g.s} l${-6 * g.s} ${14 * g.s}`} stroke={PAL.ink} strokeWidth={1.6 * g.s} fill="none" />
                ))}
                {/* right: flood */}
                <rect x={g.cx} y={g.y} width={g.W / 2} height={g.H} fill="#4a5a7a" />
                <Rain g={{ ...g, x: g.cx, W: g.W / 2 }} k={1} frame={frame} slant={0.25} n={40} />
                {[0, 1, 2].map((i) => (
                  <path key={i} d={`M${g.cx + (60 + i * 140) * g.s + pan * 0.5} ${g.ground - 30 * g.s} l0 ${-60 * g.s} l${50 * g.s} ${-40 * g.s} l${50 * g.s} ${40 * g.s} l0 ${60 * g.s} Z`} fill="#c9a47a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                ))}
                <Waves g={{ ...g, x: g.cx, W: g.W / 2 }} level={g.ground - 40 * g.s} frame={frame} color="#7a6a4f" amp={4} />
                <line x1={g.cx} y1={g.y} x2={g.cx} y2={g.y + g.H} stroke={PAL.ink} strokeWidth={3 * g.s} />
                {tag(g, "แล้ง · น้ำท่วม — ผลกระทบทั่วโลก", g.H - 22)}
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
  const [a, b, c] = chain([B.typhoon.start + 16, wf("typhoon", "ไต้หวัน"), wf("typhoon", "ก่อน")], endOf("typhoon"));
  const rows = ["TAIPEI → NAHA", "TAOYUAN → OKINAWA", "KAOHSIUNG → NAHA", "TOKYO → ISHIGAKI", "OSAKA → NAHA", "NAHA → MIYAKO"];
  return (
    <>
      <Panel id="w22-storm" anchor={PL.taipei} start={a[0]} end={a[1]} sky={["#2f3e4e", "#6c7f8f"]}>
        {(g) => (
          <Depth g={g} id="w22-storm" start={a[0]} end={a[1]} warm={0.02}>
            {(pan) => (
              <g>
                <Ridge g={g} base={g.ground - 80 * g.s} amp={30 * g.s} seed={31} color="#4a5a6a" shift={pan * 0.2} />
                <Waves g={g} level={g.ground - 20 * g.s} frame={frame} amp={14} color="#2f4f6a" />
                {[0.15, 0.4, 0.68, 0.9].map((fx, i) => (
                  <Palm key={i} x={g.x + g.W * fx + pan * 0.7} y={g.ground - 10 * g.s} scale={g.sc * (0.95 + (i % 2) * 0.15)} wind={1} frame={frame} seed={i} />
                ))}
                <rect x={g.x} y={g.ground - 14 * g.s} width={g.W} height={g.H} fill="#a89a70" />
                <Rain g={g} k={1} frame={frame} slant={0.6} />
                {tag(g, "ไต้ฝุ่นจำปี", 74)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-board" anchor={PL.taipei} start={b[0]} end={b[1]} sky={["#141a24", "#202a38"]}>
        {(g) => (
          <Depth g={g} id="w22-board" start={b[0]} end={b[1]} warm={0.02}>
            {(pan) => (
              <g>
                <rect x={g.x} y={g.y} width={g.W} height={g.H} fill="#141a24" />
                <rect x={g.x + 40 * g.s + pan * 0.3} y={g.y + 60 * g.s} width={g.W - 80 * g.s} height={g.H - 90 * g.s} rx={8 * g.s} fill="#0a0d12" stroke="#3a4250" strokeWidth={3 * g.s} />
                {rows.map((r, i) => {
                  const off = frame >= b[0] + 10 + i * 9;
                  return (
                    <g key={r}>
                      <text x={g.x + 70 * g.s + pan * 0.3} y={g.y + (100 + i * 38) * g.s} fontSize={24 * g.s} fontWeight={700} fill="#ffd56b" fontFamily="monospace">{r}</text>
                      <text x={g.x + g.W - 70 * g.s + pan * 0.3} y={g.y + (100 + i * 38) * g.s} textAnchor="end" fontSize={24 * g.s} fontWeight={900} fill={off ? "#ff3b30" : "#3fb950"} fontFamily="monospace">{off ? "CANCELLED" : "ON TIME"}</text>
                    </g>
                  );
                })}
                <Chip g={g} label={frame >= wf("typhoon", "สาย") ? "JAL · ANA · Skymark" : "ไต้หวัน (พฤหัส)"} value={frame >= wf("typhoon", "สาย") ? "ยกเลิก 100+ เที่ยว" : "ยกเลิก 125 เที่ยวบิน"} color={GOLD} />
              </g>
            )}
          </Depth>
        )}
      </Panel>
      <Panel id="w22-okinawa" anchor={PL.okinawa} start={c[0]} end={c[1]} sky={["#2a3440", "#5a6a78"]}>
        {(g) => (
          <Depth g={g} id="w22-okinawa" start={c[0]} end={c[1]} impact={impactAt(frame, [wf("typhoon", "โอกินาวา")], 8) * 0.5}>
            {(pan) => (
              <g>
                <Ridge g={g} base={g.ground - 60 * g.s} amp={40 * g.s} seed={33} color="#3a4a3a" shift={pan * 0.3} />
                {[0, 1, 2, 3].map((i) => (
                  <g key={i}>
                    <rect x={g.x + (380 + i * 130) * g.s + pan * 0.6} y={g.ground - 90 * g.s} width={100 * g.s} height={60 * g.s} fill="#efe6d0" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                    <path d={`M${g.x + (370 + i * 130) * g.s + pan * 0.6} ${g.ground - 90 * g.s} L${g.x + (430 + i * 130) * g.s + pan * 0.6} ${g.ground - 130 * g.s} L${g.x + (490 + i * 130) * g.s + pan * 0.6} ${g.ground - 90 * g.s} Z`} fill="#c0503a" stroke={PAL.ink} strokeWidth={1.6 * g.s} />
                  </g>
                ))}
                <Waves g={g} level={g.ground - 30 * g.s} frame={frame} amp={18} color="#2f4f6a" />
                <Rain g={g} k={1} frame={frame} slant={0.5} />
                <Chip g={g} label="JMA" value="ถึงโอกินาวา ศ.–ส." color={GOLD} />
                {tag(g, "โอกินาวาเตรียมรับพายุ", g.H - 22)}
              </g>
            )}
          </Depth>
        )}
      </Panel>
    </>
  );
};
