# Sound for the old-Siam short: the voice beats placed on the picture's timeline (layout.json from buildBeats), an
# original light score in a Thai pentatonic flavour (xylophone-like mallets, plucked zither, ching on the beat, a soft
# thon drum), and synthesized SFX on the picture events (drum strikes, gong, fire, mice, cat, cowries, quill...).
# Music ducked under the speech; mix to -14 LUFS (channel standard), true peak <= -1.2 dBTP.
# Usage (from this folder): py oldsiam_audio.py <project root> <outdir>
import json
import os
import sys
import numpy as np
from dsp import (SR, TAU, ns, tt, rng, lp, hp, bp, colored, smooth_noise, fades, phase, pan, st, place, dbg,
                 read_wav, write_wav, integrated, true_peak)
import instruments as I
import sfx_gen as G
from lawnchair_audio import speech_spans, duck_gain, limit, boing, squeak, rustle, static

FPS = 30
R = rng(1688)
fr = lambda f: f / FPS


def thai_drum(r, big=1.0):
    """big barrel drum: low boom + skin slap"""
    n = ns(1.6); t = np.arange(n) / SR
    boom = np.sin(phase(62 * (1 + 0.5 * np.exp(-t / 0.04)))) * np.exp(-t / 0.45) * 1.6
    slap = bp(r.standard_normal(n), 120, 1800, 2) * np.exp(-t / 0.03) * 0.9
    return fades((boom + slap) * big, 0.0, 0.2)


def gong(r, f0=196.0, dur=4.5):
    t = tt(dur)
    parts = [(1.0, 1.0, 2.6), (2.12, 0.55, 1.6), (2.76, 0.35, 1.1), (3.98, 0.22, 0.7), (5.3, 0.12, 0.4)]
    y = sum(a * np.sin(phase(f0 * k * (1 + 0.004 * np.sin(TAU * 3.2 * t)))) * np.exp(-t / d) for k, a, d in parts)
    y += bp(r.standard_normal(len(t)), 300, 3000, 1) * np.exp(-t / 0.02) * 0.5
    return fades(y * (1 - np.exp(-t / 0.004)) * 0.8, 0.0, 0.5)


def ching(r, vel=0.4):
    t = tt(0.9)
    y = sum(np.sin(phase(f)) * np.exp(-t / d) for f, d in [(3150, 0.35), (4420, 0.25), (5980, 0.18), (7700, 0.1)])
    return fades(y * vel * 0.3, 0.0, 0.1)


def fire(dur, r):
    n = ns(dur)
    roar = lp(colored(n, r, 1.5), 500, 2) * (0.6 + 0.4 * smooth_noise(n, r, 0.8)) * 0.6
    crack = (r.uniform(size=n) > 0.9993) * r.standard_normal(n) * 3
    crack = bp(crack, 1500, 9000, 1)
    return st(fades(roar + crack, 0.3, 0.6))


def meow(r, dur=0.55, f0=620):
    t = tt(dur); u = t / dur
    f = f0 * (1 + 0.45 * np.sin(np.pi * u)) * (1 - 0.15 * u)
    y = sum(np.sin(k * phase(f)) / k ** 1.3 for k in range(1, 9))
    y = bp(y, 400, 3500, 1) * np.sin(np.pi * u) ** 0.8
    return fades(y * 0.6, 0.01, 0.05)


def nibble(r, dur=0.8):
    y = np.zeros(ns(dur)); tm = 0.0
    while tm < dur - 0.03:
        c = bp(r.standard_normal(ns(0.02)), 2000, 8000, 1) * np.exp(-tt(0.02) / 0.004)
        G._place_mono(y, c * r.uniform(0.3, 0.8), tm); tm += r.uniform(0.04, 0.09)
    return y


def quill(r, dur=1.6):
    n = ns(dur)
    a = (np.sin(TAU * 3.0 * np.arange(n) / SR) > 0.1) * smooth_noise(n, r, 10)
    return bp(r.standard_normal(n), 2500, 9000, 2) * a * 0.35


def cowrie_clink(r):
    return G.clink(r, r.uniform(2800, 3600), 0.08) * 0.6


def build(root, outdir):
    L = json.load(open(os.path.join(HERE, "layout.json"), encoding="utf8"))
    TOTAL = L["total"]; DUR = TOTAL / FPS; N = ns(DUR)
    # ---- voice ----
    voice = np.zeros((2, N))
    for b in L["beats"]:
        x, sr = read_wav(os.path.join(root, b["file"])); assert sr == SR
        place(voice, x.mean(0), fr(b["start"]))
    # ---- music: pentatonic loop (C D E G A), 104 bpm ----
    m = np.zeros((2, N)); q = 60 / 104; bar = 4 * q
    PENT = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81]
    tune = [5, 4, 3, 4, 5, 7, 6, 5, 3, 2, 3, 4, 2, 1, 0, 1]   # indices into PENT, eighth notes
    bass = [48, 48, 43, 45]
    t = 0.0; k = 0

    def quiet(tt0):  # leave the strike moments clear
        return any(a - 0.3 < tt0 < b for a, b in [(fr(1380), fr(1400)), (fr(1480), fr(1500))])
    while t < DUR - 2.0:
        if not quiet(t):
            place(m, pan(I.pluck(I.m2f(bass[k % 4]), 0.55, R, 1.0, 0.25), -0.2), t)
            place(m, pan(I.pluck(I.m2f(bass[k % 4] + 7), 0.35, R, 0.6, 0.35), -0.2), t + 2 * q)
            for j in range(4): place(m, pan(ching(R, 0.45 if j % 2 else 0.3), 0.35), t + j * q + q / 2)
            if k % 2 == 0:
                for i, idx in enumerate(tune):
                    tn = t + i * q / 2
                    if not quiet(tn) and tn < DUR - 2.5: place(m, pan(I.vibes(I.m2f(PENT[idx]), 0.32, R, 0.7, trem_depth=0.0), 0.15), tn)
            place(m, pan(thai_drum(R, 0.18), -0.1), t)
        t += bar; k += 1
    # ending: a ringing pentatonic chord
    end = DUR - 2.2
    for i, n_ in enumerate([60, 64, 67, 72, 76]): place(m, pan(I.vibes(I.m2f(n_), 0.4, R, 2.2, trem_depth=0.1), 0.1 * i - 0.2), end + 0.04 * i)
    # ---- SFX on the picture ----
    s = np.zeros((2, N)); ev = []

    def put(x, f, db=0.0, p=0.0, lab=""):
        x = np.asarray(x, float); place(s, pan(x, p) if x.ndim == 1 else x, fr(f), dbg(db)); ev.append((fr(f), lab))
    put(G.breeze(5.0, R, 0.6, 0.2, 700), 0, -14, lab="evening air")
    put(G.bird_chirps(4.0, R, 0.4, "blackbird") * 0.4, 10, -18, 0.4, "birds")
    put(squeak(R, 900, 1300, 0.12), 40, -12, -0.4, "icon pop (clock)"); put(squeak(R, 800, 1200, 0.12), 94, -12, 0.4, "icon pop (fridge)")
    put(meow(R), 182, -10, 0.3, "meow")
    for f in (318, 325, 332): put(ching(R, 0.6), f, -12, 0.2, "level ping")
    put(G.breeze(1.2, R, 0.9, 0.3, 900), 396, -14, lab="wind on the lookout")
    put(fire(9.0, R), 470, -10, lab="fire")
    for f in [551, 563, 571] + [612 + 7 * k for k in range(7)]: put(thai_drum(R), f - 1, -4, -0.2, "fire drum")
    put(G.crickets(2.0, R) * 0.2, 640, -22, lab="night")
    for f in (756, 798, 825, 863): put(thai_drum(R, 1.1), f - 1, -4, 0.0, "time drum")
    put(G.crickets(3.2, R) * 0.2, 863, -22, lab="crickets (night)")
    for k, f in enumerate((961, 967)): put(squeak(R, 2600, 3600, 0.08), f + 8 * k, -12, 0.5, "mouse squeak")
    put(nibble(R, 0.9), 1004, -10, 0.4, "nibbling")
    put(meow(R, 0.6, 700), 1055, -8, -0.3, "cat meow"); put(G.whoosh(0.4, R, 0.15, 900, 3000), 1081, -14, 0.5, "mice flee")
    for k in range(6): put(G.stroll_step(R, 0.4), 1104 + k * 17, -16, 0.0, "footsteps")
    for f in (1170, 1185, 1197): put(cowrie_clink(R), f, -10, 0.2, "cowrie into pot")
    put(meow(R, 0.4, 820), 1219, -12, 0.4, "happy meow")
    put(gong(R), 1384, -3, -0.2, "GONG (โมง)")
    put(thai_drum(R, 1.3), 1483, -3, 0.0, "DRUM (ทุ่ม)")
    put(G.crickets(2.8, R) * 0.2, 1476, -22, lab="crickets")
    put(boing(R, 260, 0.5), 1591, -14, 0.2, "question pop")
    put(quill(R, 1.6), 1716, -14, -0.3, "quill scratching")
    put(G.bird_chirps(5.5, R, 0.35) * 0.4, 1767, -20, 0.4, "birds (kitchen)")
    put(rustle(R, 0.3, (300, 2500)), 1824, -14, lab="nope")
    put(G.whoosh(0.5, R, 0.25, 400, 2200), 1866, -14, lab="pan to jars"); put(G.whoosh(0.5, R, 0.25, 400, 2200), 1882, -16, lab="pan to rack")
    put(squeak(R, 400, 260, 0.3), 1969, -12, 0.4, "pinched nose")
    put(squeak(R, 600, 1100, 0.12), 2047, -12, 0.4, "mustard pop")
    for k in range(5): put(cowrie_clink(R), 2205 + 3 * k, -12, 0.1 * k, "cowries")
    put(meow(R, 0.5, 760), 2170, -12, 0.3, "eating meow")
    # ---- mix ----
    Lv = integrated(voice)
    m *= dbg((Lv - 11.0) - integrated(m)); m *= duck_gain_n(speech_spans(L["words"]), N)[None, :]
    s *= dbg((Lv - 14.0) - integrated(s))
    mix = voice + m + s
    g = dbg(-14.0 - integrated(mix)); mix, voice, m, s = mix * g, voice * g, m * g, s * g
    mix = limit(mix, -1.2)
    mix = np.stack([fades(c, 0.002, 0.3) for c in mix])
    os.makedirs(outdir, exist_ok=True)
    write_wav(os.path.join(outdir, "mix.wav"), mix)
    rep = [f"mix {integrated(mix):.2f} LUFS, TP {true_peak(mix):.2f} dBTP, {mix.shape[1] / SR:.3f} s ({TOTAL} frames)\n",
           f"voice {integrated(voice):.2f} / music {integrated(m):.2f} / sfx {integrated(s):.2f}\n"] + [f"- {t_:6.2f} s f{round(t_ * FPS)} {lab}\n" for t_, lab in sorted(ev) if lab]
    open(os.path.join(outdir, "cues.md"), "w", encoding="utf8").writelines(rep)
    print("".join(rep[:2]))


def duck_gain_n(spans, N, depth_db=-3.0, pre=0.08, post=0.15):
    from scipy import ndimage
    g = np.zeros(N)
    for a, b in spans: g[max(0, ns(a - pre)): min(N, ns(b + post))] = 1
    g = ndimage.uniform_filter1d(g, size=int(SR * 0.26))
    return dbg(depth_db * np.clip(g, 0, 1))


HERE = os.path.dirname(os.path.abspath(__file__))
if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
