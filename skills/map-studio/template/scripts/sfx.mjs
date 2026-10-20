// Synthesised sound effects — generated from maths with ffmpeg, so there is no licence to check or credit.
// Usage: node scripts/sfx.mjs  → public/sfx/{whoosh,pop,hit,tick,riser,swell}.wav (48 kHz stereo, peaks ≈ −6 dBFS)
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

// Chirp phase for f(t) = a + b·e^(−kt): 2π(a·t + b(1 − e^(−kt))/k)
const chirp = (a, b, k) => `2*PI*(${a}*t+${b}*(1-exp(-${k}*t))/${k})`;
const sounds = {
  // camera move: band-passed noise with a smooth swell
  whoosh: { d: 0.7, src: "anoisesrc=c=pink:a=0.9:d=0.7:seed=7", af: "bandpass=f=1100:width_type=h:w=1600,volume=eval=frame:volume='1.6*pow(sin(PI*t/0.7),2)'" },
  // label / pin pop: quick falling blip
  pop: { d: 0.16, src: `aevalsrc='sin(${chirp(500, 900, 30)})*exp(-26*t)':d=0.16` },
  // reveal / impact: low falling sine with a little noise
  hit: { d: 1.4, src: `aevalsrc='0.9*sin(${chirp(48, 90, 10)})*exp(-3.2*t)+0.15*(random(0)*2-1)*exp(-18*t)':d=1.4` },
  // counter / clock tick
  tick: { d: 0.05, src: "aevalsrc='sin(2*PI*2400*t)*exp(-110*t)':d=0.05" },
  // build-up before a reveal: rising tone + noise
  riser: { d: 2.0, src: "aevalsrc='(0.6*sin(2*PI*(180*t+260*t*t))+0.25*(random(0)*2-1))*pow(t/2,2)':d=2" },
  // soft pad swell for title cards
  swell: { d: 2.5, src: "aevalsrc='(sin(2*PI*220*t)+0.6*sin(2*PI*329.6*t)+0.4*sin(2*PI*440*t))/2*pow(sin(PI*t/2.5),2)':d=2.5" },
};

mkdirSync("public/sfx", { recursive: true });
for (const [name, { src, af }] of Object.entries(sounds)) {
  const out = `public/sfx/${name}.wav`;
  // alimiter caps peaks at 0.5 (≈ −6 dBFS) without reshaping the envelope
  const filters = [af, "aformat=channel_layouts=stereo", "alimiter=limit=0.5:level=false"].filter(Boolean).join(",");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", src, "-af", filters, "-ar", "48000", out]);
  console.log(out);
}
