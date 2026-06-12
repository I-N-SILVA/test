import { describe, expect, it } from 'vitest';
import { createRng, dailyLabel, dailySeed, seedFromString } from './rng';

describe('createRng', () => {
    it('is deterministic for a given seed', () => {
        const a = createRng(12345);
        const b = createRng(12345);
        const seqA = Array.from({ length: 10 }, () => a.next());
        const seqB = Array.from({ length: 10 }, () => b.next());
        expect(seqA).toEqual(seqB);
    });

    it('produces different streams for different seeds', () => {
        const a = createRng(1);
        const b = createRng(2);
        expect(a.next()).not.toEqual(b.next());
    });

    it('emits floats in [0, 1)', () => {
        const rng = createRng(99);
        for (let i = 0; i < 1000; i++) {
            const v = rng.next();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });

    it('int() stays within inclusive bounds', () => {
        const rng = createRng(7);
        for (let i = 0; i < 1000; i++) {
            const v = rng.int(3, 6);
            expect(v).toBeGreaterThanOrEqual(3);
            expect(v).toBeLessThanOrEqual(6);
        }
    });

    it('can resume from a persisted state', () => {
        const a = createRng(555);
        a.next();
        a.next();
        const saved = a.state();
        const expected = [a.next(), a.next(), a.next()];

        const resumed = createRng(saved);
        expect([resumed.next(), resumed.next(), resumed.next()]).toEqual(expected);
    });
});

describe('seeds', () => {
    it('seedFromString is stable and uint32', () => {
        const s = seedFromString('hello');
        expect(s).toBe(seedFromString('hello'));
        expect(s).toBe(s >>> 0);
    });

    it('dailySeed is identical within a day and changes across days', () => {
        const d1 = new Date(2026, 5, 12);
        const d1b = new Date(2026, 5, 12, 23, 59);
        const d2 = new Date(2026, 5, 13);
        expect(dailySeed(d1)).toBe(dailySeed(d1b));
        expect(dailySeed(d1)).not.toBe(dailySeed(d2));
    });

    it('dailyLabel formats as YYYY-MM-DD', () => {
        expect(dailyLabel(new Date(2026, 5, 9))).toBe('2026-06-09');
    });
});
