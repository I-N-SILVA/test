import type { Formation, MatchResult, Player } from './types';
import { NATIONS } from './wheel';

export interface Round {
    name: string;
    isKnockout: boolean;
    /** Opponent rating range. */
    min: number;
    max: number;
}

// 2026 format: 3 group matches, then five knockout rounds.
export const ROUNDS: Round[] = [
    { name: 'Group Match 1', isKnockout: false, min: 55, max: 70 },
    { name: 'Group Match 2', isKnockout: false, min: 58, max: 70 },
    { name: 'Group Match 3', isKnockout: false, min: 60, max: 72 },
    { name: 'Round of 32', isKnockout: true, min: 65, max: 75 },
    { name: 'Round of 16', isKnockout: true, min: 70, max: 80 },
    { name: 'Quarter-Final', isKnockout: true, min: 75, max: 85 },
    { name: 'Semi-Final', isKnockout: true, min: 80, max: 88 },
    { name: 'Final', isKnockout: true, min: 82, max: 90 },
];

/** Points needed after 3 group matches to reach the knockouts. */
export const QUALIFICATION_POINTS = 4;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function squadAverage(players: Player[]): number {
    if (players.length === 0) return 0;
    return players.reduce((sum, p) => sum + p.overall_rating, 0) / players.length;
}

/** Bonus for players sharing a nation or era — max +5%. */
export function chemistryBonus(players: Player[]): number {
    let pairs = 0;
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            if (
                players[i].nation === players[j].nation ||
                players[i].era === players[j].era
            ) {
                pairs += 1;
            }
        }
    }
    const maxPairs = (players.length * (players.length - 1)) / 2 || 1;
    return 1 + 0.05 * (pairs / maxPairs);
}

function pickScorers(players: Player[], count: number): string[] {
    const attackers = players.filter((p) => p.position[0] !== 'GK');
    const weighted = attackers.flatMap((p) => {
        const attacking = ['ST', 'LW', 'RW', 'CAM'].includes(p.position[0]) ? 3 : 1;
        return Array<Player>(attacking).fill(p);
    });
    const scorers: string[] = [];
    for (let i = 0; i < count; i++) {
        scorers.push(weighted[Math.floor(Math.random() * weighted.length)]?.name ?? 'Own goal');
    }
    return scorers;
}

const FLAVOUR_WIN = [
    '{scorer} fires you into the next round!',
    '{scorer} delivers when it matters most.',
    'A masterclass — {scorer} steals the show.',
    'Clinical. {scorer} settles it.',
];
const FLAVOUR_DRAW = ['Honours even after a tense ninety minutes.', 'Deadlock — neither side blinks.'];
const FLAVOUR_LOSS = ['Heartbreak. The dream ends here.', 'Outclassed on the day — the run is over.'];

export function simulateMatch(
    players: Player[],
    formation: Formation,
    round: Round,
): MatchResult {
    const opponentNation = NATIONS[Math.floor(Math.random() * NATIONS.length)];
    const opponentRating = Math.round(rand(round.min, round.max));

    // PRD formula: squad strength × formation bonus × chemistry × RNG vs difficulty × RNG.
    const yourScore = squadAverage(players) * formation.bonus * chemistryBonus(players) * rand(0.85, 1.15);
    const oppScore = opponentRating * rand(0.8, 1.2);

    const diff = yourScore - oppScore;
    const margin = Math.abs(diff) / oppScore;

    let outcome: MatchResult['outcome'];
    if (margin <= 0.05) outcome = 'draw';
    else if (diff > 0) outcome = 'win';
    else outcome = 'loss';

    let goalsFor: number;
    let goalsAgainst: number;
    if (outcome === 'win') {
        goalsFor = Math.min(5, 1 + Math.floor(margin * 12) + (Math.random() < 0.3 ? 1 : 0));
        goalsAgainst = Math.random() < 0.55 ? 0 : Math.max(0, goalsFor - 1 - Math.floor(Math.random() * 2));
    } else if (outcome === 'loss') {
        goalsAgainst = Math.min(4, 1 + Math.floor(margin * 10));
        goalsFor = Math.random() < 0.5 ? 0 : Math.max(0, goalsAgainst - 1 - Math.floor(Math.random() * 2));
    } else {
        goalsFor = Math.floor(Math.random() * 3);
        goalsAgainst = goalsFor;
    }

    let wonOnPens: boolean | undefined;
    if (outcome === 'draw' && round.isKnockout) {
        // Penalties slightly favour the stronger squad.
        wonOnPens = Math.random() < 0.5 + Math.min(0.2, diff / 200);
    }

    const scorers = pickScorers(players, goalsFor);
    const sorted = [...players].sort((a, b) => b.overall_rating - a.overall_rating);
    const motm =
        outcome === 'loss'
            ? sorted[Math.floor(Math.random() * Math.min(5, sorted.length))].name
            : scorers[0] ?? sorted[0].name;

    const flavourPool =
        outcome === 'win' ? FLAVOUR_WIN : outcome === 'draw' ? FLAVOUR_DRAW : FLAVOUR_LOSS;
    const flavour = flavourPool[Math.floor(Math.random() * flavourPool.length)].replace(
        '{scorer}',
        scorers[0] ?? motm,
    );

    return {
        round: round.name,
        opponent: opponentNation.name,
        opponentFlag: opponentNation.flag,
        opponentRating,
        goalsFor,
        goalsAgainst,
        outcome,
        wonOnPens,
        scorers,
        motm,
        flavour,
    };
}

export function groupPoints(matches: MatchResult[]): number {
    return matches
        .filter((m) => m.round.startsWith('Group'))
        .reduce((pts, m) => pts + (m.outcome === 'win' ? 3 : m.outcome === 'draw' ? 1 : 0), 0);
}

/** True when a result ends the run. */
export function isRunOver(matches: MatchResult[]): boolean {
    const last = matches[matches.length - 1];
    if (!last) return false;
    const round = ROUNDS.find((r) => r.name === last.round);
    if (!round) return false;
    if (round.isKnockout) {
        if (last.outcome === 'loss') return true;
        if (last.outcome === 'draw' && !last.wonOnPens) return true;
        return false;
    }
    // Group stage: run only ends if qualification is mathematically gone after match 3.
    const groupMatches = matches.filter((m) => m.round.startsWith('Group'));
    return groupMatches.length === 3 && groupPoints(matches) < QUALIFICATION_POINTS;
}

export function isChampion(matches: MatchResult[]): boolean {
    const final = matches.find((m) => m.round === 'Final');
    if (!final) return false;
    return final.outcome === 'win' || (final.outcome === 'draw' && !!final.wonOnPens);
}

/** The Perfect Run: champion, every match won outright, zero goals conceded. */
export function isPerfectRun(matches: MatchResult[]): boolean {
    return (
        matches.length === ROUNDS.length &&
        matches.every((m) => m.outcome === 'win' && m.goalsAgainst === 0)
    );
}

export function starRating(matches: MatchResult[], champion: boolean): number {
    if (champion) return 5;
    const reached = matches.length;
    if (reached >= 7) return 4; // semi-final
    if (reached >= 6) return 3; // quarter-final
    if (reached >= 5) return 2; // round of 16
    return 1;
}
