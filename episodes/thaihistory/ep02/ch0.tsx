import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PointLabel } from "../../../components/Labels";
import { useMap } from "../../../components/Map";
import { bbox } from "../../../components/Region";
import { SFX } from "../../../components/Sound";
import { RuinScene } from "../news/ch0";
import { clamp, font, GOLD, Panel, RED, view, type Chapter } from "../news/kit";
import { Fire, Smoke } from "../news/Period";
import { HorseGeneral, Mountains } from "../news/Period4";
import { B, FACTIONS, wf, type FactionId } from "./beatsKit";

// Episode 2 opening (beats hook → question): the land split into five factions; the smallest one, in the east.
const ORDER: FactionId[] = ["plk", "fang", "phimai", "nakhon", "tak"];
const T = {
  q0: 0,
  broken: B.broken.start,
  noCentre: wf("broken", "แผ่นดิน", 0.25),
  warlords: wf("broken", "ใคร", 0.45),
  five: wf("broken", "จน", 0.75),
  under: B.underdog.start,
  far: wf("underdog", "จันทบุรี", 0.3),
  few: wf("underdog", "ทหาร", 0.45),
  years: wf("underdog", "อีก", 0.65),
  q: B.question.start,
};
const END = B.recap.start;
export const SIAM = bbox([[97.4, 6.6], [105.4, 19.6]]);
const EAST = bbox([[100.6, 11.6], [103.2, 14.0]]);

// Five faction areas: soft fill + glowing outline, each grown by its own k.
export const Factions = ({ k, dim = {}, colors = {} }: { k: Partial<Record<FactionId, number>>; dim?: Partial<Record<FactionId, number>>; colors?: Partial<Record<FactionId, string>> }) => {
  const { projection, s } = useMap();
  const frame = useCurrentFrame();
  return (
    <g>
      {ORDER.map((id) => {
        const f = { ...FACTIONS[id], color: colors[id] ?? FACTIONS[id].color };
        const kk = k[id] ?? 0;
        if (kk <= 0) return null;
        const pts = f.ring.map((p) => projection(p)).filter(Boolean) as [number, number][];
        if (pts.length < 3) return null;
        const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
        const pulse = 0.85 + 0.15 * Math.sin(frame * 0.15 + ORDER.indexOf(id));
        const o = kk * (1 - (dim[id] ?? 0) * 0.75);
        return (
          <g key={id} opacity={o}>
            <path d={d} fill={f.color} fillOpacity={0.28 * pulse} />
            <path d={d} fill="none" stroke={f.color} strokeWidth={10 * s} strokeOpacity={0.35} style={{ filter: `blur(${6 * s}px)` }} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={f.color} strokeWidth={3 * s} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Five warlords on five hills, each under his own banner.
const WarlordsScene = ({ id, start, end }: { id: string; start: number; end: number }) => (
  <Panel id={id} anchor={[100.5, 14.4]} start={start} end={end} sky={["#7a3a1a", "#f2b35e"]} accent={GOLD}>
    {(g) => (
      <g>
        <Mountains x={g.x} y={g.ground + 4 * g.s} W={g.W} s={g.s} h={110} seed="lords" />
        {ORDER.map((fid, i) => (
          <HorseGeneral key={fid} x={g.x + g.W * (0.1 + i * 0.2)} y={g.ground + 6 * g.s} scale={g.sc * 0.62} banner={FACTIONS[fid].color} coat={fid === "fang" ? "#c98a1a" : "#5a3a2a"} flip={i % 2 === 1} phase={i} />
        ))}
      </g>
    )}
  </Panel>
);

// The smallest faction: a camp by the eastern sea with a gold banner.
const EastScene = ({ start, end }: { start: number; end: number }) => (
  <Panel id="e2east" anchor={FACTIONS.tak.seat} start={start} end={end} sky={["#4fa3d4", "#f2d9a0"]} accent={GOLD}>
    {(g) => (
      <g>
        <rect x={g.x} y={g.ground - 60 * g.s} width={g.W} height={g.H} fill="#3d8fc4" />
        <path d={`M${g.x} ${g.ground - 20 * g.s} Q${g.cx} ${g.ground - 50 * g.s} ${g.x + g.W} ${g.ground - 14 * g.s} L${g.x + g.W} ${g.y + g.H} L${g.x} ${g.y + g.H} Z`} fill="#e9d8a6" />
        <Fire x={g.x + g.W * 0.25} y={g.ground - 18 * g.s} size={36 * g.s} seed={1} />
        <HorseGeneral x={g.x + g.W * 0.55} y={g.ground - 10 * g.s} scale={g.sc * 0.8} banner={GOLD} coat="#a8322a" />
        <Smoke x={g.x + g.W * 0.25} y={g.ground - 50 * g.s} size={80 * g.s} />
      </g>
    )}
  </Panel>
);

const HookTitle = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const o = interpolate(frame, [B.hook.end - 4, B.hook.end + 8], [1, 0], clamp);
  const pop = 1 + 0.06 * Math.max(0, 1 - frame / 8);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: height * 0.1, opacity: o, fontFamily: font, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>
      <div style={{ transform: `scale(${pop})`, textShadow: `0 ${6 * s}px ${30 * s}px rgba(0,0,0,0.9)` }}>
        <div style={{ fontSize: 112 * s, fontWeight: 900 }}>ทหาร<span style={{ color: GOLD }}>ไม่กี่พัน</span></div>
        <div style={{ fontSize: 100 * s, fontWeight: 900 }}>รวม <span style={{ color: "#ff6b5f" }}>5 ก๊ก</span>ได้ไง?</div>
      </div>
    </AbsoluteFill>
  );
};

const QuestionMark = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  if (frame < T.q || frame > END + 6) return null;
  const k = interpolate(frame, [T.q, T.q + 10], [0, 1], clamp);
  return <div style={{ position: "absolute", right: 70 * s, top: height * 0.34, width: 150 * s, height: 150 * s, borderRadius: "50%", background: RED, color: "#fff", fontFamily: font, fontWeight: 900, fontSize: 120 * s, lineHeight: `${150 * s}px`, textAlign: "center", transform: `scale(${k})`, boxShadow: `0 0 ${40 * s}px rgba(255,59,48,0.7)` }}>?</div>;
};

export const e2ch0: Chapter = {
  name: "แผ่นดิน 5 ก๊ก",
  from: 0,
  to: END,
  cams: (w, h) => [
    { frame: 0, cam: view(SIAM, w, h, 0.62, 0.1) },
    { frame: T.broken, cam: view(SIAM, w, h, 0.66, 0.1) },
    { frame: T.under, cam: view(SIAM, w, h, 0.66, 0.1) },
    { frame: T.far, cam: view(EAST, w, h, 1, 0.08) },
    { frame: T.q, cam: view(EAST, w, h, 1, 0.08) },
    { frame: T.q + 35, cam: view(SIAM, w, h, 0.66, 0.1) },
  ],
  years: [[0, "2310–2313"], [T.broken, "2310"]],
  heads: [
    { f: T.broken, tag: "หลังกรุงแตก 7 เม.ย. 2310", head: "แผ่นดินไม่มีศูนย์กลาง", color: RED },
    { f: T.warlords, tag: "ใครมีคน มีอาวุธ", head: "ตั้งตัวเป็นใหญ่", color: RED },
    { f: T.five, tag: "แผ่นดินแตก", head: "5 ก๊ก", color: GOLD, chips: ORDER.map((id, i) => ({ text: FACTIONS[id].name, f: T.five + 8 + i * 8 })) },
    { f: T.under, tag: "ก๊กเล็กที่สุดก๊กหนึ่ง", head: "พระยาตาก · จันทบุรี", color: GOLD, portrait: "taksin_general" },
    { f: T.years, tag: "แต่อีกราว", head: "รวมแผ่นดินได้ทั้งหมด", stat: "3 ปี", color: GOLD, portrait: "taksin_general" },
    { f: T.q, tag: "คำถามของวันนี้", head: "ทำได้ยังไง?", color: GOLD },
  ],
  Map: () => {
    const frame = useCurrentFrame();
    const k: Partial<Record<FactionId, number>> = {};
    ORDER.forEach((id, i) => {
      const hookK = interpolate(frame, [i * 5, i * 5 + 10], [0, 1], clamp) * interpolate(frame, [T.broken, T.broken + 15], [1, 0], clamp);
      const fiveK = interpolate(frame, [T.five + 8 + i * 8, T.five + 18 + i * 8], [0, 1], clamp);
      k[id] = Math.max(hookK, fiveK);
    });
    const dim = frame >= T.under ? { plk: 1, fang: 1, phimai: 1, nakhon: 1 } : {};
    return (
      <>
        <Factions k={k} dim={dim} />
        {frame >= T.five && frame < T.under && ORDER.map((id, i) => <PointLabel key={id} at={FACTIONS[id].seat} text={FACTIONS[id].name} start={T.five + 8 + i * 8} color={FACTIONS[id].color} size={0.6} />)}
        {frame >= T.under && <PointLabel at={FACTIONS.tak.seat} text="จันทบุรี" start={T.far - 10} color={GOLD} size={0.85} />}
      </>
    );
  },
  Panels: () => (
    <>
      <WarlordsScene id="e2hook" start={-12} end={T.broken + 14} />
      <RuinScene start={T.broken} end={T.warlords + 14} />
      <WarlordsScene id="e2lords" start={T.warlords} end={T.under + 14} />
      <EastScene start={T.under} end={END + 14} />
    </>
  ),
  Screen: () => (
    <>
      <HookTitle />
      <QuestionMark />
    </>
  ),
  sfx: [
    [0, SFX.hit, 0.6],
    [0, SFX.swell, 0.3],
    [T.broken - 4, SFX.whoosh, 0.35],
    [T.warlords, SFX.pop, 0.3],
    ...ORDER.map((_, i) => [T.five + 8 + i * 8, SFX.pop, 0.3] as [number, string, number]),
    [T.far - 6, SFX.whoosh, 0.35],
    [T.years, SFX.hit, 0.5],
    [T.q, SFX.riser, 0.25],
  ],
};
void Smoke;
