import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cues } from "../../../components/subs.mjs";
import { C, clamp, Cut, fonts, Knots, Leaf, Seal, slideOut, StackEdge, toThai, useU } from "./Leaf";

// M03 cards, all as palm leaves: the head leaf (claim + knotted confidence cord), source leaves sliding out of the
// stack one per chronicle, two leaves compared with a lacquer seal, a timeline leaf of when each text was written,
// and the caption on the table. Screen bands at 1080×1920: head 5–17 %, map bundle 17.5–55.5 %, slot 57–75 %,
// caption 76.5 %.

export const BAND = { head: [84, 92, 912, 232], map: [80, 348, 920, 718], slot: [84, 1098, 912, 342], caption: 0.765 } as const;
const W = 1080;

// Full-frame SVG layer in screen units of 1080 wide.
export const Layer = ({ children, opacity = 1 }: { children: React.ReactNode; opacity?: number }) => {
  const { width, height } = useVideoConfig();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${W} ${(W * height) / width}`} style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
      {children}
    </svg>
  );
};

export type Head = { f: number; tag: string; head: string; color?: string; sure?: "high" | "mid" | "low"; note?: string };
const SURE = { high: { n: 3, text: "ผูก ๓ ปม · หลักฐานตรงกัน" }, mid: { n: 2, text: "ผูก ๒ ปม · ยังถกเถียง" }, low: { n: 1, text: "ผูก ๑ ปม · หลักฐานฝ่ายเดียว" } } as const;

// The head leaf: kicker, the claim, and the knot cord for confidence. A new head slides in from the right while the
// old one slides out to the left.
export const HeadLeaf = ({ heads, kicker, end }: { heads: Head[]; kicker: string; end: number }) => {
  const frame = useCurrentFrame();
  const [x, y, w, h] = BAND.head;
  return (
    <Layer>
      {heads.map((hd, i) => {
        const next = heads[i + 1]?.f ?? end + 100;
        if (frame < hd.f - 2 || frame > next + 16) return null;
        const inK = interpolate(frame, [hd.f, hd.f + 14], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
        const outK = interpolate(frame, [next, next + 14], [0, 1], { ...clamp, easing: (t) => t * t });
        const dx = i === 0 ? 0 : (1 - inK) * 1100 - outK * 1100;
        const dy = i === 0 ? 0 : 0;
        const sure = hd.sure ? SURE[hd.sure] : null;
        return (
          <g key={i} transform={`translate(${dx},${dy})`}>
            <Leaf x={x} y={y} w={w} h={h} seed={11 + i} tone={i} holes={[0.035, 0.965]} margins={[0.07, 0.93]}>
              <Cut x={w * 0.1} y={50} size={30} color={C.umber}>
                {kicker}
              </Cut>
              <Cut x={w * 0.9} y={50} size={32} anchor="end" color={hd.color ?? C.lacquer}>
                {hd.tag}
              </Cut>
              <line x1={w * 0.09} x2={w * 0.91} y1={68} y2={68} stroke={C.soot} strokeWidth={1.4} opacity={0.4} />
              <Cut x={w * 0.5} y={146} size={hd.head.length > 18 ? 60 : 70} anchor="middle" font={fonts.title}>
                {hd.head}
              </Cut>
              {sure && (
                <>
                  <Cut x={w * 0.73} y={204} size={27} anchor="end" color={C.umber}>
                    {sure.text}
                  </Cut>
                  <Knots x={w * 0.75} y={195} n={sure.n} k={interpolate(frame, [hd.f + 4, hd.f + 14], [0, 1], clamp)} />
                </>
              )}
            </Leaf>
          </g>
        );
      })}
    </Layer>
  );
};

export type Source = { side: string; text: string; color: string; say: string };

// One thin leaf per source, sliding out of the stack; "?" until its check frame, then what that source says.
export const SourceLeaves = ({ sources, start, end, checks, agree }: { sources: Source[]; start: number; end: number; checks: number[]; agree?: { f: number; text: string } }) => {
  const frame = useCurrentFrame();
  if (frame < start - 2 || frame > end + 30) return null;
  const [x, y, w, h] = BAND.slot;
  const n = sources.length;
  const gap = 10;
  const lh = (h - gap * (n - 1)) / n;
  return (
    <Layer>
      <StackEdge x={x + w - 20} y={y + 6} h={h - 12} />
      {sources.map((src, i) => {
        const k = slideOut(frame, start + i * 7, end + i * 3);
        if (k <= 0) return null;
        const ly = y + i * (lh + gap);
        const said = frame >= checks[i];
        const pop = interpolate(frame, [checks[i], checks[i] + 6], [1.5, 1], clamp);
        return (
          <g key={i} transform={`translate(${(1 - k) * 1040},0)`}>
            <Leaf x={x} y={ly} w={w} h={lh} seed={31 + i} tone={i + 1} holes={[0.025, 0.975]} margins={[0.05, 0.95]}>
              <rect x={w * 0.065} y={lh * 0.22} width={10} height={lh * 0.56} rx={3} fill={src.color} />
              <Cut x={w * 0.09} y={lh * 0.52} size={40} font={fonts.title} color={src.color}>
                {src.side}
              </Cut>
              <Cut x={w * 0.09} y={lh * 0.86} size={23} color={C.umber}>
                {src.text}
              </Cut>
              <g transform={`translate(${w * 0.64},${lh * 0.66}) scale(${said ? pop : 1})`}>
                <Cut x={0} y={0} size={said ? 58 : 50} anchor="middle" font={fonts.title} color={said ? C.soot : C.umber} opacity={said ? 1 : 0.5}>
                  {said ? src.say : "?"}
                </Cut>
              </g>
                          </Leaf>
            {agree && <Seal x={x + w * 0.86} y={ly + lh / 2} r={34} text="สิ้น" at={agree.f + i * 4} rot={-14 + i * 7} />}
          </g>
        );
      })}
    </Layer>
  );
};

export type Side = { tag: string; text: string; color: string; f: number; dashed?: boolean };

// Two leaves: what each authority proposes, then a red seal "ยังถกเถียง" pressed across both.
export const CompareLeaves = ({ start, end, title, left, right, stamp }: { start: number; end: number; title: string; left: Side; right: Side; stamp?: { text: string; f: number } }) => {
  const frame = useCurrentFrame();
  if (frame < start - 2 || frame > end + 30) return null;
  const [x, y, w, h] = BAND.slot;
  const tk = slideOut(frame, start, end);
  const lh = (h - 76) / 2;
  return (
    <Layer>
      <g opacity={tk}>
        <text x={x + 20} y={y + 44} fontFamily={fonts.title} fontWeight={700} fontSize={40} fill="#e8c98c">
          {title}
        </text>
      </g>
      <StackEdge x={x + w - 20} y={y + 70} h={h - 76} />
      {[left, right].map((sd, i) => {
        const k = slideOut(frame, sd.f - 8, end + i * 3);
        if (k <= 0) return null;
        const ly = y + 66 + i * (lh + 10);
        return (
          <g key={i} transform={`translate(${(1 - k) * 1040},0)`}>
            <Leaf x={x} y={ly} w={w} h={lh} seed={51 + i} tone={i} holes={[0.025, 0.975]} margins={[0.05, 0.95]}>
              <g transform={`translate(${w * 0.11},${lh / 2})`}>
                {sd.dashed ? (
                  Array.from({ length: 10 }, (_, j) => <circle key={j} cx={Math.cos((j / 10) * Math.PI * 2) * 24} cy={Math.sin((j / 10) * Math.PI * 2) * 24} r={3.5} fill={sd.color} />)
                ) : (
                  <circle r={24} fill="none" stroke={sd.color} strokeWidth={3} />
                )}
                <circle r={11} fill="#0d0703" />
              </g>
              <Cut x={w * 0.19} y={lh * 0.38} size={26} color={C.umber}>
                {sd.tag}
              </Cut>
              <Cut x={w * 0.19} y={lh * 0.84} size={62} font={fonts.title} color={sd.color}>
                {sd.text}
              </Cut>
            </Leaf>
          </g>
        );
      })}
      {stamp && frame < end + 10 && <Seal x={x + w * 0.76} y={y + 66 + lh + 5} r={58} text={stamp.text} at={stamp.f} rot={-9} />}
    </Layer>
  );
};

export type Mark = { at: number; top: string; bottom: string; f: number; color?: string; big?: boolean };

// A long leaf ruled as a time line: the event as a lacquer seal, each text a drilled hole on the word, a hatched
// "written later" stretch.
export const TimelineLeaf = ({ start, end, title, from, to, marks, zone }: { start: number; end: number; title: string; from: number; to: number; marks: Mark[]; zone?: { from: number; text: string; f: number } }) => {
  const frame = useCurrentFrame();
  if (frame < start - 2) return null;
  const [x, y, w, h] = BAND.slot;
  const k = slideOut(frame, start, end);
  const x0 = w * 0.1;
  const x1 = w * 0.9;
  const X = (v: number) => x0 + ((v - from) / (to - from)) * (x1 - x0);
  const ay = h * 0.56;
  const zk = zone ? interpolate(frame, [zone.f, zone.f + 14], [0, 1], clamp) : 0;
  const ticks: number[] = [];
  for (let v = Math.ceil(from / 20) * 20; v <= to; v += 20) ticks.push(v);
  return (
    <Layer>
      <StackEdge x={x + w - 20} y={y + 6} h={h - 12} />
      <g transform={`translate(${(1 - k) * 1040},0)`}>
        <Leaf x={x} y={y} w={w} h={h} seed={71} tone={2} holes={[0.035, 0.965]} margins={[0.07, 0.93]}>
          <Cut x={w * 0.5} y={58} size={44} anchor="middle" font={fonts.title}>
            {title}
          </Cut>
          {zone && (
            <g opacity={zk}>
              <defs>
                <pattern id="m03-later" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                  <line x1={0} y1={0} x2={0} y2={12} stroke={C.umber} strokeWidth={2.4} />
                </pattern>
              </defs>
              <rect x={X(zone.from)} y={ay - 26} width={(x1 - X(zone.from)) * zk} height={52} fill="url(#m03-later)" opacity={0.35} />
              <Cut x={(X(zone.from) + x1) / 2} y={h - 22} size={28} anchor="middle" color={C.umber}>
                {zone.text}
              </Cut>
            </g>
          )}
          <line x1={x0} x2={x1} y1={ay + 1.6} y2={ay + 1.6} stroke={C.leafLight} strokeWidth={4} opacity={0.7} />
          <line x1={x0} x2={x1} y1={ay} y2={ay} stroke={C.soot} strokeWidth={4} />
          {ticks.map((v) => (
            <line key={v} x1={X(v)} x2={X(v)} y1={ay - (v % 100 === 0 ? 14 : 8)} y2={ay + (v % 100 === 0 ? 14 : 8)} stroke={C.soot} strokeWidth={2} />
          ))}
          {marks.map((m, i) => {
            if (frame < m.f) return null;
            const p = interpolate(frame, [m.f, m.f + 6, m.f + 10], [1.8, 0.9, 1], clamp);
            const up = i % 2 === 0;
            return (
              <g key={i} transform={`translate(${X(m.at)},${ay})`}>
                <g transform={`scale(${p})`}>
                  {m.big ? <circle r={20} fill={m.color ?? C.lacquer} stroke="#5e130a" strokeWidth={3} /> : <><circle r={11} cy={1.6} fill={C.leafLight} opacity={0.7} /><circle r={11} fill="#0d0703" /></>}
                </g>
                <Cut x={0} y={up ? -34 : 52} size={m.big ? 36 : 30} anchor="middle" font={fonts.title} color={m.color ?? C.soot}>
                  {toThai(m.top)}
                </Cut>
                {m.bottom.split("\n").map((ln, j) => (
                  <Cut key={j} x={0} y={(up ? -70 : 84) + (up ? -j * 26 : j * 26)} size={24} anchor="middle" color={C.umber}>
                    {ln}
                  </Cut>
                ))}
              </g>
            );
          })}
        </Leaf>
      </g>
    </Layer>
  );
};

// Caption on the table: pale leaf-gold text with a dark lacquer edge.
// Captions are cut into their own long leaf under the slot (one phrase at a time, timed by characters).
export const Subtitle = ({ lines, end }: { lines: [number, string][]; end: number }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const y = height * BAND.caption - 6;
  const i = lines.findIndex(([f], n) => frame >= f && frame < (lines[n + 1]?.[0] ?? end));
  const k = interpolate(frame, [0, 12], [0, 1], clamp);
  let text = "";
  if (i >= 0) {
    const [f, line] = lines[i];
    const len = (lines[i + 1]?.[0] ?? end) - f;
    const list = cues({ text: line, sec: len / fps, maxChars: 22 });
    const t = (frame - f) / fps;
    text = (list.find((c) => t < c.end) ?? list[list.length - 1]).text;
  }
  return (
    <Layer>
      <g transform={`translate(${(1 - k) * -1100},0)`}>
        <Leaf x={84} y={y} w={912} h={132} seed={91} tone={1} holes={[0.035, 0.965]} margins={[0.07, 0.93]}>
          <Cut x={456} y={86} size={54} anchor="middle">
            {text}
          </Cut>
        </Leaf>
      </g>
    </Layer>
  );
};

// Small credit line cut at the bottom of the frame.
export const Credit = ({ text }: { text: string }) => {
  const u = useU();
  const { height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height - 70 * u, textAlign: "center", fontFamily: fonts.body, fontSize: 22 * u, color: "#c9a46a", opacity: 0.7 }}>{text}</div>
  );
};
