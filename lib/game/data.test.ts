import { describe, expect, it } from 'vitest';
import { NATIONS, PLAYERS, eligiblePlayers } from './wheel';
import { getFormation } from './formations';
import type { Position } from './types';

const VALID_POSITIONS: Position[] = [
    'GK',
    'RB',
    'CB',
    'LB',
    'CDM',
    'CM',
    'CAM',
    'LW',
    'RW',
    'ST',
];
const VALID_ERAS = ['classic', 'modern', 'contemporary'];

const lineOf = (p: Position) =>
    p === 'GK'
        ? 'GK'
        : ['RB', 'CB', 'LB'].includes(p)
          ? 'DEF'
          : ['CDM', 'CM', 'CAM'].includes(p)
            ? 'MID'
            : 'ATT';

describe('dataset integrity', () => {
    it('has a healthy 48+ nation pool', () => {
        expect(NATIONS.length).toBeGreaterThanOrEqual(48);
        const ids = NATIONS.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length); // unique nation ids
        expect(NATIONS.every((n) => n.flag && n.appearances >= 1)).toBe(true);
    });

    it('has unique, well-formed player entries', () => {
        const ids = PLAYERS.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        const nationNames = new Set(NATIONS.map((n) => n.name));
        for (const p of PLAYERS) {
            expect(nationNames.has(p.nation)).toBe(true);
            expect(p.position.length).toBeGreaterThan(0);
            expect(p.position.every((pos) => VALID_POSITIONS.includes(pos))).toBe(true);
            expect(VALID_ERAS).toContain(p.era);
            expect(p.overall_rating).toBeGreaterThanOrEqual(40);
            expect(p.overall_rating).toBeLessThanOrEqual(99);
        }
    });

    it('gives every nation a keeper and all four lines', () => {
        for (const nation of NATIONS) {
            const roster = PLAYERS.filter((p) => p.nation === nation.name);
            expect(roster.length).toBeGreaterThanOrEqual(7);
            const lines = new Set(roster.map((p) => lineOf(p.position[0])));
            expect(lines).toContain('GK');
            expect(lines).toContain('DEF');
            expect(lines).toContain('MID');
            expect(lines).toContain('ATT');
        }
    });

    it('lets every nation offer a draftable player at the start of a run', () => {
        const slots = getFormation('4-3-3').slots;
        const fresh = { squad: {}, eraFilter: 'all' as const };
        for (const nation of NATIONS) {
            expect(eligiblePlayers(nation.name, slots, fresh).length).toBeGreaterThan(0);
        }
    });
});
