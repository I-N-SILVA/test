import { describe, expect, it } from 'vitest';
import { eligiblePlayers, rollNation, spinnableNations } from './wheel';
import { getFormation } from './formations';

const slots = getFormation('4-3-3').slots;
const emptyState = { squad: {}, eraFilter: 'all' as const, rngState: 0 };

describe('rollNation', () => {
    it('is deterministic for a given rng state', () => {
        const a = rollNation({ ...emptyState, rngState: 777 }, slots);
        const b = rollNation({ ...emptyState, rngState: 777 }, slots);
        expect(a?.nation.id).toBe(b?.nation.id);
        expect(a?.rngState).toBe(b?.rngState);
    });

    it('advances the rng state so a re-roll differs', () => {
        const first = rollNation({ ...emptyState, rngState: 1 }, slots);
        expect(first).not.toBeNull();
        const second = rollNation({ ...emptyState, rngState: first!.rngState }, slots);
        expect(second!.rngState).not.toBe(first!.rngState);
    });

    it('never lands on an excluded nation', () => {
        for (let seed = 0; seed < 200; seed++) {
            const r = rollNation({ ...emptyState, rngState: seed }, slots, 'Brazil');
            expect(r?.nation.name).not.toBe('Brazil');
        }
    });

    it('only returns spinnable nations', () => {
        const pool = spinnableNations(slots, emptyState).map((n) => n.name);
        for (let seed = 0; seed < 100; seed++) {
            const r = rollNation({ ...emptyState, rngState: seed }, slots);
            expect(pool).toContain(r?.nation.name);
        }
    });
});

describe('eligiblePlayers', () => {
    it('returns at most five players, all from the nation', () => {
        const players = eligiblePlayers('Brazil', slots, emptyState);
        expect(players.length).toBeGreaterThan(0);
        expect(players.length).toBeLessThanOrEqual(5);
        expect(players.every((p) => p.nation === 'Brazil')).toBe(true);
    });
});
