// Original score for the satellite-briefing look test, from the same beat timeline as Test.tsx.
// Dry palette (pulse bass with 2nd/3rd harmonics, low detuned-saw drone, FM pings, timpani-like pitched hits), a real
// silence before the turn, the heaviest hit on the turn's number. Usage: node src/episodes/satbrief/test/score.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { buildBeats, totalFrames } from "../../../components/subs.mjs";

const dir = "src/episodes/satbrief/test";
const LAYOUT = { lead: 3, gap: 8, tail: 66 };
const beats = buildBeats(JSON.parse(readFileSync(`${dir}/timing.json`, "utf8")), JSON.parse(readFileSync(`${dir}/beats.json`, "utf8")), LAYOUT);
const B = Object.fromEntries(beats.map((b) => [b.id, b]));
const wf = (id, word) => {
  const hit = (B[id].words ?? []).find((w) => w.w === word);
  return hit ? Math.round(B[id].start + hit.s * 30) : B[id].start;
};
const END = totalFrames(beats, LAYOUT);
const sec = (f) => f / 30;
const T = {
  lock: 2,
  rewind: B.y1988.start + 10,
  rangeLand: wf("reading", "เมตร"),
  turn: B.turn.start,
  five: wf("turn", "ห้า"),
  climb: B.turn.end + 10,
};

const SR = 48000;
const n = Math.ceil(sec(END) * SR);
const L = new Float32Array(n);
const R = new Float32Array(n);
const add = (i, v, pan = 0) => {
  if (i < 0 || i >= n) return;
  L[i] += v * (1 - Math.max(0, pan));
  R[i] += v * (1 + Math.min(0, pan));
};
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
// Gain curve for the music bed: in, out before the turn (suck-out), back after the turn, out at the end.
const bedGain = (t) => {
  const g = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  const before = 1 - g(t, sec(T.turn) - 0.75, sec(T.turn) - 0.4);
  const after = g(t, sec(T.turn) + 0.1, sec(T.turn) + 0.9);
  return g(t, 0, 0.3) * Math.max(before, after * 1.15) * (1 - g(t, sec(END) - 0.8, sec(END)));
};

// Drone: A1 + E2, detuned saws through a one-pole low-pass.
{
  let lp = 0;
  const saw = (f, t) => 2 * ((f * t) % 1) - 1;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const x = 0.5 * (saw(55, t) + saw(55.35, t)) + 0.35 * (saw(82.4, t) + saw(82.0, t));
    const cut = 0.02 + 0.015 * Math.sin(t * 0.7);
    lp += cut * (x - lp);
    const swell = t > sec(T.climb) ? 1 + 0.8 * Math.min(1, (t - sec(T.climb)) / 1.5) : 1;
    add(i, lp * 0.09 * bedGain(t) * swell);
  }
}

// Pulse bass on 8ths at 100 bpm from the rewind to the suck-out, again after the five lands.
const pulse = (t0, f, v) => {
  const len = 0.26 * SR;
  for (let j = 0; j < len; j++) {
    const t = j / SR;
    const ph = 2 * Math.PI * f * t;
    add(Math.round(t0 * SR) + j, v * env(t, 0.004, 0.07) * (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.3 * Math.sin(3 * ph)));
  }
};
const eighth = 60 / 100 / 2;
for (let t = sec(T.rewind); t < sec(T.turn) - 0.75; t += eighth) {
  const k = Math.round((t - sec(T.rewind)) / eighth);
  pulse(t, k % 8 === 6 ? 65.4 : 55, 0.16 * bedGain(t));
}
for (let t = sec(T.five) + eighth * 2; t < sec(T.climb) + 1.2; t += eighth) pulse(t, 55, 0.11 * bedGain(t));

// FM ping (telemetry lock-on).
const ping = (t0, f, v, pan) => {
  for (let j = 0; j < 0.7 * SR; j++) {
    const t = j / SR;
    add(Math.round(t0 * SR) + j, v * env(t, 0.002, 0.16) * Math.sin(2 * Math.PI * f * t + 1.6 * Math.sin(2 * Math.PI * f * 1.5 * t) * Math.exp(-t * 9)), pan);
  }
};
ping(sec(T.lock), 1318, 0.16, 0.2);
ping(sec(T.rangeLand), 1760, 0.1, -0.2);

// Timpani-like pitched hit (falling pitch, noise attack) and a low brass-ish stab.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const timp = (t0, f, v) => {
  let ph = 0;
  for (let j = 0; j < 2.2 * SR; j++) {
    const t = j / SR;
    ph += (2 * Math.PI * f * (1 + 0.12 * Math.exp(-t * 18))) / SR;
    add(Math.round(t0 * SR) + j, v * (env(t, 0.002, 0.55) * (Math.sin(ph) + 0.35 * Math.sin(1.5 * ph)) + 0.3 * rnd() * Math.exp(-t * 60)));
  }
};
const stab = (t0, f, v) => {
  let lp = 0;
  for (let j = 0; j < 1.4 * SR; j++) {
    const t = j / SR;
    const x = 2 * ((f * t) % 1) - 1 + (2 * ((f * 1.5 * t) % 1) - 1) * 0.6;
    lp += (0.06 + 0.1 * Math.exp(-t * 6)) * (x - lp);
    add(Math.round(t0 * SR) + j, v * env(t, 0.012, 0.35) * lp);
  }
};
timp(sec(T.rangeLand), 98, 0.22);
timp(sec(T.five), 73.4, 0.34);
stab(sec(T.five), 110, 0.2);
timp(sec(END) - 1.1, 55, 0.18);

// Normalise to −1 dBFS peak and write 16-bit stereo WAV.
let peak = 0;
for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / (peak || 1);
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + n * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
writeFileSync("public/audio/satbrief/test/score.wav", buf);
console.log(`score.wav ${sec(END).toFixed(2)} s · suck-out before ${sec(T.turn).toFixed(2)} s · hit on five at ${sec(T.five).toFixed(2)} s`);
