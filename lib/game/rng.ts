// Deterministic, seedable PRNG (mulberry32). Tiny, fast, dependency-free.
//
// The whole game runs off one of these so that a given seed always produces the
// same wheel sequence and the same simulation — which is what makes Daily
// Challenges comparable and runs reproducible/shareable. The 32-bit internal
// state is serialisable, so a run can be persisted mid-flight and resumed
// without breaking determinism (see RunState.rngState).

export interface Rng {
    /** Float in [0, 1). */
    next(): number;
    /** Float in [min, max). */
    range(min: number, max: number): number;
    /** Integer in [min, max] inclusive. */
    int(min: number, max: number): number;
    /** Uniformly pick one element. Returns undefined for an empty array. */
    pick<T>(items: readonly T[]): T;
    /** Current 32-bit state, for persistence. */
    state(): number;
}

export function createRng(seed: number): Rng {
    // Force to uint32 so behaviour matches across reloads/persistence.
    let a = seed >>> 0;

    const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    return {
        next,
        range: (min, max) => min + next() * (max - min),
        int: (min, max) => min + Math.floor(next() * (max - min + 1)),
        pick: (items) => items[Math.floor(next() * items.length)],
        state: () => a >>> 0,
    };
}

/** A fresh, non-deterministic seed for free-play runs. */
export function randomSeed(): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        return crypto.getRandomValues(new Uint32Array(1))[0];
    }
    return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

/** Stable hash of a string → uint32. Used for human-friendly shareable seeds. */
export function seedFromString(input: string): number {
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/**
 * Deterministic seed for a given calendar day (local time). Everyone playing the
 * same day's challenge draws from the same stream.
 */
export function dailySeed(date: Date = new Date()): number {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return seedFromString(`perfect-run-${y}-${m}-${d}`);
}

/** Human label for a daily seed, e.g. "2026-06-12". */
export function dailyLabel(date: Date = new Date()): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
}
