# Sound for "The Lawn Chair That Went to 16,000 Feet": an original light score (pizzicato bass, ukulele-like plucked
# chords, glockenspiel tune, brushes; airy pads for the sky; a sad-trombone gag after the power line) + synthesized
# SFX on the picture's events + the voice. Music is ducked under the speech (word times from words.json).
# Mix: voice unchanged, music bed ~ -10 LU under the voice (standard +3 dB), SFX ~ -15 LU (standard -6 dB, and kept
# under the voice). Master -15 LUFS integrated, true peak <= -1.2 dBTP, exactly TOTAL frames / 48 kHz / stereo.
# Usage (from this folder): py lawnchair_audio.py <voice.wav> <words.json> <outdir>
import json
import os
import sys
import numpy as np
from scipy import ndimage, signal
from dsp import (SR, TAU, ns, tt, rng, lp, hp, bp, colored, smooth_noise, fades, phase, pan, st, place, widen, dbg,
                 read_wav, write_wav, integrated, true_peak, make_ir, convolve_st)
import instruments as I
import sfx_gen as G

FPS = 30
TOTAL = 2101
DUR = TOTAL / FPS
N = ns(DUR)
fr = lambda f: f / FPS
R = rng(1982)

# ---- picture events (frames from story.ts / words.json) ----
FLASH = fr(185)
SNAP = fr(791)
POPS = [fr(1181), fr(1193), fr(1204)]
SHOTS_T = [fr(1176) - 0.06, fr(1188) - 0.06, fr(1199) - 0.06]
DROP = fr(1243)
CATCH = fr(1395)
SHOVE = fr(1557)
CUTS = [fr(f) for f in (137, 258, 405, 555, 672, 864, 918, 949, 1109, 1214, 1404, 1481, 1553, 1815, 1859, 2020)]


# ================================================================ SFX
def pfft(r):
    """pellet gun: short compressed-air pop"""
    n = ns(0.18); t = np.arange(n) / SR
    y = bp(r.standard_normal(n), 600, 5000, 2) * np.exp(-t / 0.018) * 1.4 + np.sin(phase(180 * (1 - 0.5 * t))) * np.exp(-t / 0.03) * 0.6
    return fades(y, 0.0, 0.02)


def balloon_pop(r):
    n = ns(0.5); t = np.arange(n) / SR
    y = hp(r.standard_normal(n), 900) * np.exp(-t / 0.006) * 2.2 + np.sin(phase(95)) * np.exp(-t / 0.06) * 0.9
    y += bp(r.standard_normal(n), 300, 2500, 1) * np.exp(-t / 0.08) * 0.3  # rubber flap
    return fades(y, 0.0, 0.05)


def squeak(r, f0=900, f1=1500, dur=0.14):
    t = tt(dur)
    f = f0 + (f1 - f0) * (t / dur) + 60 * np.sin(TAU * 30 * t)
    return np.sin(phase(f)) * np.sin(np.pi * t / dur) ** 1.5 * 0.5


def boing(r, f0=180, dur=0.6):
    t = tt(dur)
    f = f0 * (1 + 0.6 * np.exp(-t / 0.08) * np.sin(TAU * 14 * t))
    return (np.sin(phase(f)) + 0.3 * np.sin(2 * phase(f))) * np.exp(-t / 0.22) * 0.7


def can_open(r):
    n = ns(0.45); t = np.arange(n) / SR
    click = G.clink(r, 2600, 0.06) * 0.6
    hiss = hp(r.standard_normal(n), 3000) * np.exp(-np.maximum(t - 0.02, 0) / 0.12) * (t > 0.02) * 0.5
    y = hiss.copy(); y[: len(click)] += click
    return fades(y, 0.0, 0.05)


def static(r, dur=0.5):
    n = ns(dur); t = np.arange(n) / SR
    crackle = (r.uniform(size=n) > 0.985) * r.standard_normal(n) * 2.0
    y = bp(r.standard_normal(n) * 0.25 + crackle, 500, 5000, 2) * np.sin(np.pi * t / dur) ** 0.5
    y += np.sin(TAU * 1200 * t) * 0.05 * (t < 0.15)
    return fades(y, 0.005, 0.05)


def metal_clack(r):
    y = G.clink(r, 1900, 0.16) * 0.7
    G._place_mono(y, G.clink(r, 3100, 0.1) * 0.4, 0.0)
    return y


def rope_snap(r):
    n = ns(0.9); t = np.arange(n) / SR
    crack = bp(r.standard_normal(n), 800, 9000, 2) * np.exp(-t / 0.004) * 2.5
    twang = np.sin(phase(140 * (1 + 0.8 * np.exp(-t / 0.05)))) * np.exp(-t / 0.18) * 0.9
    y = crack + twang
    G._place_mono(y, G.whoosh(0.6, r, 0.08, 500, 3000, 0.9, 0.2) * 0.8, 0.02)
    return fades(y, 0.0, 0.1)


def chatter(r, dur=1.4):
    y = np.zeros(ns(dur)); tm = 0.0
    while tm < dur - 0.03:
        c = G.clink(r, r.uniform(1800, 2600), 0.03) * r.uniform(0.3, 0.7)
        G._place_mono(y, c, tm); tm += r.uniform(0.045, 0.07)
    return y


def jet_pass(r, dur, t_pass):
    """airliner passing: roar + whine with a Doppler drop at t_pass"""
    n = ns(dur); t = np.arange(n) / SR
    d = t - t_pass
    prox = 1 / (1 + (d / 0.9) ** 2)
    roar = lp(colored(n, r, 1.2), 900, 2) * (0.25 + prox) * 0.9
    whine_f = 2300 * (1 - 0.18 * np.tanh(d / 0.6))
    whine = np.sin(phase(whine_f)) * prox ** 1.5 * 0.12
    return st(fades(roar + whine, 0.4, 0.8))


def prop_drone(r, dur):
    n = ns(dur); t = np.arange(n) / SR
    f = 92 * (1 + 0.01 * np.sin(TAU * 0.3 * t))
    saw = sum(np.sin(k * phase(f)) / k for k in range(1, 12))
    y = lp(saw, 1200, 2) * (0.6 + 0.4 * np.sin(TAU * 0.5 * t)) * np.sin(np.pi * t / dur) ** 1.2
    return fades(y * 0.4, 0.3, 0.5)


def fall_whistle(r, dur=1.0):
    t = tt(dur)
    f = 1700 * np.exp(-t * 1.1) + 300
    return np.sin(phase(f)) * np.sin(np.pi * t / dur) ** 0.6 * 0.35


def zap(r, dur=1.1):
    n = ns(dur); t = np.arange(n) / SR
    buzz = sum(np.sin(k * phase(120)) / k for k in range(1, 20)) * 0.4
    env = np.exp(-t / 0.35) * (0.6 + 0.4 * (np.sin(TAU * 9 * t) > 0))
    crack = (r.uniform(size=n) > 0.97) * r.standard_normal(n) * np.exp(-t / 0.25) * 2
    y = bp(buzz * env + crack, 100, 8000, 1)
    y[: ns(0.01)] += hp(r.standard_normal(ns(0.01)), 2000) * 2
    return fades(y, 0.0, 0.1)


def rustle(r, dur=0.45, f=(1500, 7000)):
    n = ns(dur)
    a = smooth_noise(n, r, 25) ** 2 * np.sin(np.pi * np.arange(n) / n)
    return bp(r.standard_normal(n), *f, 1) * a * 0.6


def page_flips(r, k=3):
    y = np.zeros(ns(0.2 * k + 0.3))
    for i in range(k):
        G._place_mono(y, rustle(r, 0.16, (1200, 6000)) * 1.2, i * 0.17)
    return y


def tweet(r):
    y = np.zeros(ns(1.0))
    for j in range(3):
        G._place_mono(y, squeak(r, 2600, 3400, 0.09) * 0.6, j * 0.22)
    return y


def sfx_stem(voice_words):
    b = np.zeros((2, N))
    ev = []

    def put(x, t, db=0.0, p=0.0, label=""):
        x = np.asarray(x, float)
        place(b, pan(x, p) if x.ndim == 1 else x, t, dbg(db))
        ev.append((t, label, db))

    # 1 hook: high wind, balloons creaking softly
    put(G.breeze(6.4, R, 1.0, 0.25, 700), 0.0, -6, label="altitude wind (hook)")
    for k in range(4): put(G.creak(0.5, R, 260, 330, G.WOOD, rough=0.08, scale=1.6) * 0.25, 1.0 + k * 1.4, -12, 0.3, "rubber creak")
    put(G.whoosh(0.9, R, 0.55, 300, 2600, 0.8, 0.3), FLASH - 0.55, -4, label="flash whoosh")
    # 2-5 backyard: birds, the small plane, balloon squeaks, items, rope creaks
    put(G.bird_chirps(18.5, R, 0.45, "sparrow") * 0.5, 6.2, -14, -0.4, "birds (yard)")
    put(prop_drone(R, 4.6), 6.3, -12, 0.5, "small plane overhead")
    for k in range(14): put(squeak(R, 700 + 60 * k, 1300 + 60 * k, 0.12), fr(389) + k * 0.17, -14, (k % 3 - 1) * 0.4, "balloon squeak")
    put(G.whoosh(0.5, R, 0.25, 400, 2400), fr(405) - 0.25, -12, label="crane whoosh")
    put(squeak(R, 500, 900, 0.1), fr(492) - 0.03, -10, -0.3, "sandwich pop"); put(G.clink(R, 1400, 0.08), fr(492), -16, -0.3)
    put(can_open(R), fr(522) - 0.05, -9, 0.1, "soda can")
    put(static(R, 0.55), fr(542), -12, 0.4, "radio static")
    put(metal_clack(R), fr(564) - 0.03, -9, 0.2, "pellet gun clack")
    for k in range(3): put(G.creak(0.7, R, 90, 140, G.TIMBER, rough=0.1) * 0.5, 20.0 + k * 1.6, -14, 0.2, "rope creak (hover)")
    # 6 the cord: strain then snap
    put(G.creak(1.6, R, 120, 300, G.TIMBER, [(0, 0), (0.3, 0.6), (0.9, 1), (1, 0.2)], rough=0.15) * 0.8, fr(738), -8, 0.3, "cord strain")
    put(rope_snap(R), SNAP - 0.02, -3, 0.1, "cord SNAP")
    put(G.whoosh(1.6, R, 0.35, 250, 3200, 0.9, 0.5), SNAP + 0.05, -6, label="shoots up whoosh")
    put(boing(R, 120, 0.7), fr(883) - 0.02, -10, label="cork boing")
    # 8 climb: whooshes at the altitude cuts, wind rising
    put(G.breeze(9.3, R, 1.0, 0.4, 1100), fr(900), -5, label="climbing wind")
    for f in (900, 918, 949): put(G.whoosh(0.7, R, 0.3, 350, 2600), fr(f) - 0.3, -9, label="altitude whoosh")
    # 9 freezing: teeth chatter
    put(chatter(R, 1.3), fr(1018), -11, 0.1, "teeth chatter")
    put(G.breeze(4.0, R, 1.2, 0.6, 1500), fr(1016), -9, label="cold wind")
    # 10 the airliner
    put(jet_pass(R, 4.2, 1.2), fr(1059), -5, label="airliner pass")
    put(G.whoa(R) if hasattr(G, "whoa") else squeak(R), fr(1139), -14, -0.3, "pilot gasp")
    # 11 pellet shots, pops, sinking, the gun falls
    for ts, tp in zip(SHOTS_T, POPS):
        put(pfft(R), ts, -8, 0.2, "pellet shot"); put(balloon_pop(R), tp - 0.01, -5, -0.1, "BALLOON POP")
    put(G.whoosh(1.4, R, 0.9, 900, 250, 0.9, 0.4), fr(1214), -12, label="sinking (falling whoosh)")
    put(fall_whistle(R, 1.1), DROP, -10, 0.3, "gun falls")
    # 12 luckily: breeze + birds
    put(G.breeze(2.2, R, 0.7, 0.3, 800), fr(1282), -12, label="descent breeze")
    put(G.bird_chirps(2.0, R, 0.8) * 0.5, fr(1290), -16, 0.4, "birds")
    # 13 unluckily: the snag, sparks, buzz, dazed tweets
    put(zap(R, 1.2), CATCH - 0.02, -6, 0.0, "power-line ZAP")
    put(zap(R, 0.6), CATCH + 0.5, -10, 0.2, "spark")
    put(tweet(R), fr(1404) + 0.4, -14, 0.3, "dazed tweets")
    # 14 the pool: water, the ball shoots up
    put(G.water_bed(5.2, R, 0.8, 0.9), fr(1429), -14, label="pool water")
    put(G.splash_big(R) * 0.5, SHOVE - 0.03, -8, label="ball splash")
    put(boing(R, 210, 0.7), SHOVE + 0.02, -10, label="ball boing")
    # 15 rising sky
    put(G.breeze(4.8, R, 0.9, 0.3, 900), fr(1583), -10, label="sky wind")
    for k in range(6): put(boing(R, 260 + 30 * k, 0.4), fr(1660) + k * 0.09, -16, (k % 3 - 1) * 0.5, "beach-ball boings")
    # 16 the fine
    put(G.bird_chirps(6.8, R, 0.35) * 0.5, fr(1727), -16, -0.4, "birds (front yard)")
    put(rustle(R, 0.5), fr(1751) - 0.05, -10, 0.2, "ticket paper")
    put(page_flips(R, 3), fr(1825), -10, -0.2, "rule book pages")
    put(rustle(R, 0.3, (300, 2000)), fr(1865), -14, label="shrug")
    # 17 museum: big room tone, a few footsteps, the crane up
    n = ns(DUR - fr(1930))
    room = lp(colored(n, R, 1.0), 500, 2) * 0.25
    put(st(room), fr(1930), -18, label="museum room tone")
    for k in range(5): put(G.stroll_step(R, 0.3) if hasattr(G, "stroll_step") else G.clink(R, 300, 0.05), fr(1935) + k * 0.55, -16, (k % 2) * 0.4 - 0.2, "footsteps")
    put(G.whoosh(1.8, R, 1.0, 300, 1800, 0.8, 0.5), fr(2020), -12, label="crane up")
    # cut whooshes (soft)
    for c in CUTS: put(G.whoosh(0.5, R, 0.22, 400, 2200, 0.8, 0.15), c - 0.22, -18, label="cut swish")
    return b, ev


# ================================================================ music
BPM = 120
Q = 60 / BPM               # 0.5 s beat
BAR = 4 * Q
m2f = I.m2f
CH = {"F": (41, [65, 69, 72]), "Dm": (38, [62, 65, 69]), "Bb": (46, [62, 65, 70]), "C7": (36, [64, 67, 70]),
      "Gm": (43, [62, 67, 70]), "A7": (45, [61, 64, 67])}
PROG = ["F", "Dm", "Bb", "C7"]
# original tune (beat offset in the 2-bar phrase, midi, beats)
TUNE_A = [(0, 72, 0.5), (0.5, 69, 0.5), (1, 72, 0.5), (1.5, 77, 1), (2.5, 76, 0.5), (3, 72, 0.5), (3.5, 74, 1.5),
          (5, 70, 0.5), (5.5, 67, 0.5), (6, 70, 0.5), (6.5, 74, 0.5), (7, 72, 1)]
TUNE_B = [(0, 77, 0.5), (0.5, 76, 0.5), (1, 74, 0.5), (1.5, 72, 1), (2.5, 69, 0.5), (3, 70, 1), (4, 72, 0.5),
          (4.5, 74, 0.5), (5, 72, 0.5), (5.5, 70, 0.5), (6, 69, 1.0), (7, 65, 1)]


def groove(b, t0, t1, prog=PROG, mel=True, tuba=False, brush_on=True, vel=0.7):
    t = t0; bar = 0
    while t < t1 - 0.05:
        ch = prog[bar % len(prog)]; root, tri = CH[ch]
        for k in range(4):
            tb = t + k * Q
            if tb >= t1: break
            if k in (0, 2):
                f = m2f(root + (7 if k == 2 else 0))
                x = I.brass(f, 0.28, 0.55 * vel, R, "tuba") if tuba else I.pluck(f, 0.9 * vel, R, 0.6, 0.3)
                place(b, pan(x, -0.1), tb, 1.0)
            else:
                for j, m in enumerate(tri):
                    place(b, pan(I.pluck(m2f(m), 0.32 * vel, R, 0.35, 0.8), 0.3), tb + 0.004 * j, 1.0)
            if brush_on and k in (1, 3): place(b, pan(I.brush(0.5 * vel, R), 0.15), tb, 1.0)
        if mel and bar % 2 == 0:
            tune = TUNE_A if (bar // 2) % 2 == 0 else TUNE_B
            for (o, m, d) in tune:
                tn = t + o * Q
                if tn < t1 - 0.1: place(b, pan(I.glock(m2f(m), 0.42 * vel, R, 1.4), -0.25), tn, 1.0)
        t += BAR; bar += 1


def pad_chord(b, t0, dur, notes, vel=0.4, att=0.8, rel=1.2, warm=1100):
    place(b, I.pad([m2f(m) for m in notes], dur, vel, R, att, rel, warm), t0, 1.0)


def music_stem():
    b = np.zeros((2, N))
    groove(b, 0.0, FLASH)                                          # hook
    place(b, pan(I.glock(m2f(84), 0.5, R, 2.0), 0), FLASH - 0.02, 1.0)
    groove(b, FLASH + Q, fr(738))                                   # the yard, the plan
    # tension: pedal C, glock tremolo rising, dead stop on the snap
    t = fr(738)
    while t < SNAP - 0.1:
        u = (t - fr(738)) / (SNAP - fr(738))
        place(b, pan(I.pluck(m2f(36), 0.7, R, 0.3, 0.3), -0.1), t, 1.0)
        place(b, pan(I.glock(m2f(72 + int(u * 12)), 0.3, R, 0.4), 0.2), t + Q / 2, 1.0)
        t += Q / 2
    # the rise: pad swelling up + fast upward arpeggio
    pad_chord(b, SNAP + 0.1, fr(900) - SNAP, [53, 60, 65, 69], 0.5, 1.2, 0.6)
    for k in range(16): place(b, pan(I.glock(m2f(65 + [0, 4, 7, 12][k % 4] + 12 * (k // 8)), 0.35, R, 0.6), 0.3), SNAP + 0.6 + k * 0.17, 1.0)
    # the sky: airy pads, sparse high glock
    pad_chord(b, fr(900), fr(1016) - fr(900), [53, 60, 64, 69, 76], 0.45, 0.6, 1.0)
    pad_chord(b, fr(1016), fr(1170) - fr(1016), [50, 57, 62, 65, 72], 0.38, 0.4, 1.0, 900)
    for k, m in enumerate([88, 84, 81, 86, 84, 79]): place(b, pan(I.glock(m2f(m), 0.22, R, 1.5), 0.4), fr(905) + k * 1.4, 1.0)
    pad_chord(b, fr(1170), fr(1282) - fr(1170), [46, 53, 58, 62, 65], 0.3, 0.3, 0.8, 800)
    # luckily: warm major + glock "ding"
    pad_chord(b, fr(1282), fr(1341) - fr(1282), [53, 60, 65, 69, 72], 0.45, 0.2, 0.3)
    place(b, pan(I.glock(m2f(84), 0.5, R, 1.6), 0), fr(1282), 1.0)
    # unluckily: sad trombone after the zap
    for k, (m, d) in enumerate([(58, 0.32), (57, 0.32), (56, 0.32), (55, 1.0)]):
        place(b, pan(I.brass(m2f(m - 12), d, 0.7, R, "horn", fall=(-0.8 if k == 3 else 0)), 0.1), CATCH + 0.55 + k * 0.36, 1.0)
    # explanation + beach balls: light groove
    groove(b, fr(1429), fr(1727), ["F", "Gm", "C7", "F"], mel=True, brush_on=True, vel=0.6)
    # the fine: tuba groove (officialdom)
    groove(b, fr(1727), fr(1930), ["Bb", "F", "C7", "F"], mel=False, tuba=True, vel=0.65)
    # museum: warm groove to a final chord + tag on "aircraft"
    groove(b, fr(1930), fr(2040), ["F", "Bb", "F", "C7"], mel=True, vel=0.6)
    end = fr(2040)
    pad_chord(b, end, DUR - end - 0.3, [41, 53, 60, 65, 69, 72], 0.5, 0.05, 0.8)
    for k, m in enumerate([72, 77, 81, 84]): place(b, pan(I.glock(m2f(m), 0.45, R, 2.2), 0.1 * k - 0.15), end + k * 0.12, 1.0)
    place(b, pan(I.pluck(m2f(41), 0.9, R, 1.6, 0.3), -0.1), end, 1.0)
    return b


# ================================================================ mix
def speech_spans(words, merge=0.3):
    sp = []
    for w in words:
        s, e = float(w["s"]), float(w["e"])
        if sp and s - sp[-1][1] < merge: sp[-1][1] = max(sp[-1][1], e)
        else: sp.append([s, e])
    return sp


def duck_gain(spans, depth_db=-3.0, pre=0.08, post=0.15, att=0.07, rel=0.45):
    g = np.zeros(N)
    for s, e in spans: g[max(0, ns(s - pre)): min(N, ns(e + post))] = 1
    k = int(SR * (att + rel) / 2)
    g = ndimage.uniform_filter1d(g, size=max(3, k))
    return dbg(depth_db * np.clip(g, 0, 1))


def limit(x, ceil_db=-1.2):
    """4x-oversampled look-ahead peak limiter (gain computed on the oversampled signal, applied at base rate)"""
    c = dbg(ceil_db)
    up = signal.resample_poly(x, 4, 1, axis=-1)
    pk = np.abs(up).max(0).reshape(-1, 4).max(1)[: x.shape[1]]
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    look = ns(0.0015)
    g = ndimage.minimum_filter1d(g, size=2 * look + 1)
    g = np.minimum(g, ndimage.uniform_filter1d(g, size=ns(0.004)))
    rel = np.exp(-1 / (SR * 0.08))
    out = g.copy()
    for i in range(1, len(out)):  # release smoothing
        out[i] = min(g[i], out[i - 1] * rel + (1 - rel))
    return x * out[None, :]


def main():
    vpath, wpath, outdir = sys.argv[1:4]
    os.makedirs(outdir, exist_ok=True)
    words = json.load(open(wpath, encoding="utf8"))
    v, sr = read_wav(vpath); assert sr == SR, sr
    vm = v.mean(0); voice = np.zeros(N); voice[: min(N, len(vm))] = vm[:N]; voice = st(voice)
    Lv = integrated(voice)
    print("voice", round(Lv, 2), "LUFS")
    music = music_stem()
    music *= dbg((Lv - 10.0) - integrated(music))
    music *= duck_gain(speech_spans(words))[None, :]
    sfx, ev = sfx_stem(words)
    sfx *= dbg((Lv - 15.0) - integrated(sfx))
    mix = voice + music + sfx
    gain = dbg(-15.0 - integrated(mix))
    mix, voice, music, sfx = mix * gain, voice * gain, music * gain, sfx * gain
    mix = limit(mix, -1.2)
    mix = fades(mix, 0.002, 0.25) if mix.ndim == 1 else np.stack([fades(c, 0.002, 0.25) for c in mix])
    write_wav(os.path.join(outdir, "mix.wav"), mix)
    for name, x in (("voice", voice), ("music", music), ("sfx", sfx)): write_wav(os.path.join(outdir, f"stem_{name}.wav"), x)
    rep = [f"# Lawn chair short: sound cues\n", f"mix: {integrated(mix):.2f} LUFS integrated, true peak {true_peak(mix):.2f} dBTP, {mix.shape[1] / SR:.3f} s\n",
           f"voice {integrated(voice):.2f} / music {integrated(music):.2f} / sfx {integrated(sfx):.2f} LUFS (integrated, at mix gain)\n\n## SFX events\n"]
    rep += [f"- {t:6.2f} s  f{round(t * FPS):4d}  {lab} ({db:+.0f} dB)\n" for t, lab, db in sorted(ev) if lab]
    open(os.path.join(outdir, "cues.md"), "w", encoding="utf8").writelines(rep)
    print("".join(rep[:3]))


if __name__ == "__main__":
    main()
