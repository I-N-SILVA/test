import { describe, expect, it } from 'vitest';
import {
    CANDIDATE_LIMIT,
    eligiblePlayers,
    getNation,
    rollConfederation,
    rollGamble,
    rollNation,
    spinnableConfederations,
    spinnableNations,
} from './wheel';
import { getFormation } from './formations';

const slots = getFormation('4-3-3').slots;
const base = { squad: {}, eraFilter: 'all' as const, rngState: 0 };

describe('rollNation (uniform / weighted)', () => {
    it('is deterministic for a given rng state and mode', () => {
        const a = rollNation({ ...base, rngState: 777 }, slots, { mode: 'uniform' });
        const b = rollNation({ ...base, rngState: 777 }, slots, { mode: 'uniform' });
        expect(a?.nation.id).toBe(b?.nation.id);
        expect(a?.rngState).toBe(b?.rngState);
    });

    it('advances the rng state so a re-roll differs', () => {
        const first = rollNation({ ...base, rngState: 1 }, slots, { mode: 'uniform' });
        expect(first).not.toBeNull();
        const second = rollNation({ ...base, rngState: first!.rngState }, slots, { mode: 'uniform' });
        expect(second!.rngState).not.toBe(first!.rngState);
    });

    it('never lands on an excluded nation', () => {
        for (let seed = 0; seed < 200; seed++) {
            const r = rollNation({ ...base, rngState: seed }, slots, {
                mode: 'uniform',
                excludeNation: 'Brazil',
            });
            expect(r?.nation.name).not.toBe('Brazil');
        }
    });

    it('uniform mode gives small nations a real chance; weighted favours giants', () => {
        const tally = (mode: 'uniform' | 'weighted') => {
            let brazil = 0;
            for (let seed = 0; seed < 2000; seed++) {
                const r = rollNation({ ...base, rngState: seed * 2654435761 }, slots, { mode });
                if (r?.nation.name === 'Brazil') brazil += 1;
            }
            return brazil;
        };
        // Brazil (22 apps) should come up far more under weighting than uniform.
        expect(tally('weighted')).toBeGreaterThan(tally('uniform') * 2);
    });
});

describe('confederation mode', () => {
    it('lists confederations that still have spinnable nations', () => {
        const confs = spinnableConfederations(slots, base);
        expect(confs).toContain('UEFA');
        expect(confs).toContain('CONMEBOL');
        expect(confs.length).toBeGreaterThanOrEqual(5);
    });

    it('rollConfederation is deterministic and yields a live confederation', () => {
        const a = rollConfederation({ ...base, rngState: 42 }, slots);
        const b = rollConfederation({ ...base, rngState: 42 }, slots);
        expect(a?.confederation).toBe(b?.confederation);
        expect(spinnableConfederations(slots, base)).toContain(a!.confederation);
    });

    it('only lands nations inside the chosen confederation', () => {
        for (let seed = 0; seed < 200; seed++) {
            const r = rollNation({ ...base, rngState: seed }, slots, {
                mode: 'confederation',
                confederation: 'CONMEBOL',
            });
            expect(getNation(r!.nation.name)?.confederation).toBe('CONMEBOL');
        }
    });
});

describe('position-first mode', () => {
    it('only lands nations that can fill the target slot', () => {
        const gkSlot = slots.find((s) => s.id === 'gk')!;
        for (let seed = 0; seed < 100; seed++) {
            const r = rollNation({ ...base, rngState: seed }, slots, {
                mode: 'position',
                slotId: gkSlot.id,
            });
            const players = eligiblePlayers(r!.nation.name, slots, base, { slotId: gkSlot.id });
            expect(players.length).toBeGreaterThan(0);
            expect(players.every((p) => p.position.includes('GK'))).toBe(true);
        }
    });
});

describe('rollGamble', () => {
    it('is deterministic and returns a valid player for an open slot', () => {
        const a = rollGamble({ ...base, rngState: 99 }, slots);
        const b = rollGamble({ ...base, rngState: 99 }, slots);
        expect(a?.player.id).toBe(b?.player.id);
        expect(a?.slotId).toBe(b?.slotId);
        const slot = slots.find((s) => s.id === a!.slotId)!;
        expect(a!.player.position.some((p) => slot.accepts.includes(p))).toBe(true);
    });
});

describe('eligiblePlayers', () => {
    it('returns up to the candidate limit, all from the nation', () => {
        const players = eligiblePlayers('Brazil', slots, base);
        expect(players.length).toBeGreaterThan(0);
        expect(players.length).toBeLessThanOrEqual(CANDIDATE_LIMIT);
        expect(players.every((p) => p.nation === 'Brazil')).toBe(true);
    });
});

describe('spinnableNations filters', () => {
    it('respects the confederation filter', () => {
        const pool = spinnableNations(slots, base, { confederation: 'AFC' });
        expect(pool.length).toBeGreaterThan(0);
        expect(pool.every((n) => n.confederation === 'AFC')).toBe(true);
    });
});
