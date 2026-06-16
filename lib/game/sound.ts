'use client';

// Tiny synthesised sound engine. No audio files — everything is generated with
// the Web Audio API, so it adds nothing to the bundle and works offline. Kept
// deliberately quiet and short; a mute toggle persists to localStorage.

export type SoundName =
    | 'spin'
    | 'land'
    | 'pick'
    | 'gamble'
    | 'goal'
    | 'miss'
    | 'win'
    | 'lose'
    | 'fanfare';

const MUTE_KEY = 'perfect_run_muted';

let ctx: AudioContext | null = null;
let muted = false;
let loaded = false;

function load() {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try {
        muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
        // localStorage unavailable — default to unmuted.
    }
}

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
        const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
        const AC = window.AudioContext ?? w.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
    }
    // Browsers suspend audio until a user gesture; resume on first real use.
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return ctx;
}

export function isMuted(): boolean {
    load();
    return muted;
}

export function setMuted(value: boolean): void {
    load();
    muted = value;
    try {
        localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    } catch {
        // Best effort only.
    }
    if (!value) getCtx(); // warm the context while we're inside a user gesture
}

export function toggleMuted(): boolean {
    setMuted(!isMuted());
    return muted;
}

/** One short enveloped tone. */
function tone(
    c: AudioContext,
    freq: number,
    startAt: number,
    dur: number,
    type: OscillatorType = 'sine',
    gain = 0.14,
) {
    const t = c.currentTime + startAt;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
}

function arpeggio(c: AudioContext, freqs: number[], step: number, dur: number, gain = 0.12) {
    freqs.forEach((f, i) => tone(c, f, i * step, dur, 'triangle', gain));
}

export function playSound(name: SoundName): void {
    load();
    if (muted) return;
    const c = getCtx();
    if (!c) return;

    switch (name) {
        case 'spin': {
            // Rising whir as the wheel gets going.
            const t = c.currentTime;
            const osc = c.createOscillator();
            const g = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(420, t + 0.45);
            g.gain.setValueAtTime(0.05, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(g).connect(c.destination);
            osc.start(t);
            osc.stop(t + 0.52);
            break;
        }
        case 'land':
            tone(c, 660, 0, 0.12, 'triangle', 0.12);
            tone(c, 988, 0.06, 0.14, 'triangle', 0.08);
            break;
        case 'pick':
            tone(c, 523, 0, 0.1, 'triangle', 0.1);
            tone(c, 784, 0.05, 0.12, 'triangle', 0.08);
            break;
        case 'gamble':
            tone(c, 300, 0, 0.05, 'square', 0.06);
            tone(c, 450, 0.07, 0.05, 'square', 0.06);
            tone(c, 620, 0.14, 0.09, 'square', 0.06);
            break;
        case 'goal':
            tone(c, 880, 0, 0.1, 'triangle', 0.12);
            tone(c, 1320, 0.05, 0.12, 'triangle', 0.08);
            break;
        case 'miss':
            tone(c, 196, 0, 0.2, 'sine', 0.1);
            break;
        case 'win':
            arpeggio(c, [523, 659, 784, 1047], 0.07, 0.18);
            break;
        case 'lose':
            arpeggio(c, [392, 311, 233], 0.12, 0.32, 0.12);
            break;
        case 'fanfare':
            arpeggio(c, [523, 659, 784, 1047, 1319], 0.1, 0.34, 0.13);
            tone(c, 1047, 0.55, 0.6, 'triangle', 0.1);
            break;
    }
}
