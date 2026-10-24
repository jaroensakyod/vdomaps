import { makeBeats, makeMix } from "../nrs/beats";
import beatsText from "./beats.json";
import timing from "./timing.json";

// Episode 6 timing: beats, lookup by id, word cue frames, head cards from beats.json, and the mix.
export const { BEATS, B, wf, at, VOICE, heads } = makeBeats(timing, beatsText);
export const { Hit, Bed } = makeMix(VOICE);
