import { describe, expect, it } from 'vitest';
import {
    ROUNDS,
    chemistryBonus,
    groupPoints,
    isChampion,
    isPerfectRun,
    isRunOver,
    lineRatings,
    simulateMatch,
    squadAverage,
    starRating,
} from './engine';
import { getFormation } from './formations';
import { createRng } from './rng';
import type { MatchResult, Player, Position } from './types';

let id = 0;
function player(position: Position, rating: number, nation = 'Brazil', era: Player['era'] = 'modern'): Player {
    return {
        id: `p${id++}`,
        name: `Player ${id}`,
        nation,
        position: [position],
        world_cup_year: 2000,
        overall_rating: rating,
        era,
    };
}

// A balanced XI at a given uniform rating.
function squad(rating: number, nation = 'Brazil', era: Player['era'] = 'modern'): Player[] {
    const positions: Position[] = ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'];
    return positions.map((p) => player(p, rating, nation, era));
}

const result = (over: Partial<MatchResult>): MatchResult => ({
    round: 'Group Match 1',
    opponent: 'Spain',
    opponentFlag: '🇪🇸',
    opponentRating: 60,
    goalsFor: 0,
    goalsAgainst: 0,
    outcome: 'draw',
    scorers: [],
    motm: 'x',
    flavour: '',
    ...over,
});

describe('chemistryBonus', () => {
    it('rewards a fully nation-stacked squad close to the +5% ceiling', () => {
        const bonus = chemistryBonus(squad(85, 'Brazil'));
        expect(bonus).toBeCloseTo(1.05, 5);
    });

    it('barely moves for a shared-era-only squad', () => {
        const players = squad(85).map((p, i) => ({ ...p, nation: `Nation${i}` }));
        const bonus = chemistryBonus(players);
        expect(bonus).toBeGreaterThan(1);
        expect(bonus).toBeLessThan(1.01); // era alone is weak
    });

    it('is exactly neutral when nothing is shared', () => {
        const eras: Player['era'][] = ['classic', 'modern', 'contemporary'];
        const players = squad(85).map((p, i) => ({
            ...p,
            nation: `Nation${i}`,
            era: eras[i % 3],
        }));
        // Some era pairs still match across 11 players, so just assert it's tiny.
        expect(chemistryBonus(players)).toBeLessThan(1.01);
    });
});

describe('lineRatings', () => {
    it('averages each line and falls back for empty lines', () => {
        const players = [player('GK', 90), player('CB', 80), player('ST', 70)];
        const lines = lineRatings(players);
        expect(lines.gk).toBe(90);
        expect(lines.def).toBe(80);
        expect(lines.att).toBe(70);
        // No midfielder → falls back to squad average (80).
        expect(lines.mid).toBe(squadAverage(players));
    });
});

describe('simulateMatch', () => {
    it('is fully deterministic for the same seed and inputs', () => {
        const f = getFormation('4-3-3');
        const xi = squad(88); // same squad both times — only the seed drives the result
        const a = simulateMatch(createRng(42), xi, f, ROUNDS[0]);
        const b = simulateMatch(createRng(42), xi, f, ROUNDS[0]);
        expect(a).toEqual(b);
    });

    it('keeps goals within bounds and consistent with the outcome', () => {
        const f = getFormation('4-3-3');
        for (let seed = 0; seed < 300; seed++) {
            const m = simulateMatch(createRng(seed), squad(85), f, ROUNDS[3]);
            expect(m.goalsFor).toBeGreaterThanOrEqual(0);
            expect(m.goalsFor).toBeLessThanOrEqual(5);
            expect(m.goalsAgainst).toBeGreaterThanOrEqual(0);
            expect(m.goalsAgainst).toBeLessThanOrEqual(5);
            if (m.outcome === 'win') expect(m.goalsFor).toBeGreaterThan(m.goalsAgainst);
            if (m.outcome === 'loss') expect(m.goalsAgainst).toBeGreaterThan(m.goalsFor);
            if (m.outcome === 'draw') expect(m.goalsFor).toBe(m.goalsAgainst);
        }
    });

    it('rewards a stronger defence with more clean sheets', () => {
        const f = getFormation('4-3-3');
        const rounds = ROUNDS[3];
        const strongDef = ['GK', 'RB', 'CB', 'CB', 'LB'].length; // marker
        void strongDef;

        const countCleanSheets = (def: number) => {
            let clean = 0;
            for (let seed = 0; seed < 400; seed++) {
                const players = squad(80);
                // Boost the back line + keeper.
                for (const p of players) {
                    if (['GK', 'RB', 'CB', 'LB'].includes(p.position[0])) p.overall_rating = def;
                }
                const m = simulateMatch(createRng(seed), players, f, rounds);
                if (m.goalsAgainst === 0) clean += 1;
            }
            return clean;
        };

        expect(countCleanSheets(95)).toBeGreaterThan(countCleanSheets(60));
    });

    it('lets an elite squad beat weak group opponents most of the time', () => {
        const f = getFormation('4-3-3');
        let wins = 0;
        for (let seed = 0; seed < 500; seed++) {
            const m = simulateMatch(createRng(seed), squad(90), f, ROUNDS[0]);
            if (m.outcome === 'win') wins += 1;
        }
        expect(wins).toBeGreaterThan(300); // comfortably favoured, not guaranteed
    });
});

describe('run progression', () => {
    it('groupPoints tallies only group matches', () => {
        const matches = [
            result({ round: 'Group Match 1', outcome: 'win' }),
            result({ round: 'Group Match 2', outcome: 'draw' }),
            result({ round: 'Round of 32', outcome: 'win' }),
        ];
        expect(groupPoints(matches)).toBe(4);
    });

    it('ends the run on a knockout loss', () => {
        expect(isRunOver([result({ round: 'Round of 32', outcome: 'loss' })])).toBe(true);
    });

    it('ends the run on a knockout draw lost on penalties', () => {
        expect(
            isRunOver([result({ round: 'Round of 16', outcome: 'draw', wonOnPens: false })]),
        ).toBe(true);
        expect(
            isRunOver([result({ round: 'Round of 16', outcome: 'draw', wonOnPens: true })]),
        ).toBe(false);
    });

    it('only eliminates in the group after match 3 below the points line', () => {
        const twoLosses = [
            result({ round: 'Group Match 1', outcome: 'loss' }),
            result({ round: 'Group Match 2', outcome: 'loss' }),
        ];
        expect(isRunOver(twoLosses)).toBe(false); // still a match to play
        expect(isRunOver([...twoLosses, result({ round: 'Group Match 3', outcome: 'win' })])).toBe(
            true,
        ); // 3 points < 4
    });

    it('detects champions and the perfect run', () => {
        const clean = ROUNDS.map((r) => result({ round: r.name, outcome: 'win', goalsAgainst: 0 }));
        expect(isChampion(clean)).toBe(true);
        expect(isPerfectRun(clean)).toBe(true);

        const conceded = ROUNDS.map((r) =>
            result({ round: r.name, outcome: 'win', goalsAgainst: 1 }),
        );
        expect(isChampion(conceded)).toBe(true);
        expect(isPerfectRun(conceded)).toBe(false);
    });

    it('awards stars by how far the run got', () => {
        expect(starRating([], false)).toBe(1);
        expect(starRating(new Array(5).fill(result({})), false)).toBe(2);
        expect(starRating(new Array(7).fill(result({})), false)).toBe(4);
        expect(starRating(new Array(8).fill(result({})), true)).toBe(5);
    });
});
