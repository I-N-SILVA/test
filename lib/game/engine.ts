import type { Formation, MatchResult, Player, Position } from './types';
import { NATIONS } from './wheel';
import type { Rng } from './rng';

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

// All sim tuning lives here so balance is adjustable in one place.
const TUNING = {
    chemistryMax: 0.05, // up to +5% for a fully linked squad
    eraChemWeight: 0.15, // shared era counts far less than shared nation
    yourRngLow: 0.85,
    yourRngHigh: 1.15,
    oppRngLow: 0.8,
    oppRngHigh: 1.2,
    drawMargin: 0.05,
    maxGoals: 5,
    // How attack/defence lines combine into a single power number.
    attackFromMid: 0.35,
    defenceFromGk: 0.4,
    // Goal scaling.
    winGoalGain: 6, // goals scale with how far your attack outguns their defence
    cleanSheetBase: 0.25,
    cleanSheetGain: 0.9, // clean-sheet odds rise with defensive superiority
} as const;

const rand = (rng: Rng, min: number, max: number) => rng.range(min, max);

export function squadAverage(players: Player[]): number {
    if (players.length === 0) return 0;
    return players.reduce((sum, p) => sum + p.overall_rating, 0) / players.length;
}

type Line = 'gk' | 'def' | 'mid' | 'att';

function lineOf(position: Position): Line {
    if (position === 'GK') return 'gk';
    if (position === 'RB' || position === 'CB' || position === 'LB') return 'def';
    if (position === 'LW' || position === 'RW' || position === 'ST') return 'att';
    return 'mid'; // CDM, CM, CAM
}

export interface LineRatings {
    gk: number;
    def: number;
    mid: number;
    att: number;
    attack: number;
    defence: number;
}

/**
 * Per-line strength from a squad. Empty lines fall back to the squad average so
 * a missing specialist weakens rather than nullifies that line.
 */
export function lineRatings(players: Player[]): LineRatings {
    const fallback = squadAverage(players);
    const buckets: Record<Line, number[]> = { gk: [], def: [], mid: [], att: [] };
    for (const p of players) buckets[lineOf(p.position[0])].push(p.overall_rating);
    const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : fallback);

    const gk = avg(buckets.gk);
    const def = avg(buckets.def);
    const mid = avg(buckets.mid);
    const att = avg(buckets.att);
    return {
        gk,
        def,
        mid,
        att,
        attack: att * (1 - TUNING.attackFromMid) + mid * TUNING.attackFromMid,
        defence: def * (1 - TUNING.defenceFromGk) + gk * TUNING.defenceFromGk,
    };
}

/**
 * Squad cohesion bonus. Sharing a nation is the real prize; sharing only an era
 * barely moves the needle — so nation-stacking is a genuine risk/reward lever,
 * not the near-constant it used to be.
 */
export function chemistryBonus(players: Player[]): number {
    let score = 0;
    let pairs = 0;
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            pairs += 1;
            if (players[i].nation === players[j].nation) score += 1;
            else if (players[i].era === players[j].era) score += TUNING.eraChemWeight;
        }
    }
    if (pairs === 0) return 1;
    return 1 + TUNING.chemistryMax * (score / pairs);
}

/** Squad chemistry as a 0–100% display value (0 = no shared links). */
export function chemistryPercent(players: Player[]): number {
    return Math.round(((chemistryBonus(players) - 1) / TUNING.chemistryMax) * 100);
}

function pickScorers(rng: Rng, players: Player[], count: number): string[] {
    const attackers = players.filter((p) => p.position[0] !== 'GK');
    const weighted = attackers.flatMap((p) => {
        const attacking = ['ST', 'LW', 'RW', 'CAM'].includes(p.position[0]) ? 3 : 1;
        return Array<Player>(attacking).fill(p);
    });
    const scorers: string[] = [];
    for (let i = 0; i < count; i++) {
        scorers.push(weighted.length ? rng.pick(weighted).name : 'Own goal');
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

const clampGoals = (n: number) => Math.max(0, Math.min(TUNING.maxGoals, n));

export function simulateMatch(
    rng: Rng,
    players: Player[],
    formation: Formation,
    round: Round,
): MatchResult {
    const opponentNation = rng.pick(NATIONS);
    const opponentRating = Math.round(rand(rng, round.min, round.max));

    const chem = chemistryBonus(players);
    const lines = lineRatings(players);
    const overall = (lines.attack + lines.defence) / 2;

    // Overall strength decides win/draw/loss so run pacing stays balanced...
    const yourScore = overall * formation.bonus * chem * rand(rng, TUNING.yourRngLow, TUNING.yourRngHigh);
    const oppScore = opponentRating * rand(rng, TUNING.oppRngLow, TUNING.oppRngHigh);
    const diff = yourScore - oppScore;
    const margin = Math.abs(diff) / oppScore;

    let outcome: MatchResult['outcome'];
    if (margin <= TUNING.drawMargin) outcome = 'draw';
    else if (diff > 0) outcome = 'win';
    else outcome = 'loss';

    // ...but the scoreline reflects the line battle: your attack vs their
    // defence drives goals for, your defence + GK drives the clean sheet.
    const attackIndex = (lines.attack * formation.bonus * chem) / opponentRating;
    const defenceIndex = (lines.defence * formation.bonus) / opponentRating;
    const cleanSheetChance = Math.max(
        0.05,
        Math.min(0.9, TUNING.cleanSheetBase + (defenceIndex - 1) * TUNING.cleanSheetGain),
    );

    let goalsFor: number;
    let goalsAgainst: number;
    if (outcome === 'win') {
        goalsFor = clampGoals(1 + Math.floor((attackIndex - 1) * TUNING.winGoalGain + margin * 4));
        goalsAgainst = rng.next() < cleanSheetChance ? 0 : Math.max(1, goalsFor - 1 - rng.int(0, 1));
    } else if (outcome === 'loss') {
        goalsAgainst = clampGoals(1 + Math.floor(margin * 8));
        goalsFor = rng.next() < 0.5 ? 0 : Math.max(0, goalsAgainst - 1 - rng.int(0, 1));
    } else {
        goalsFor = rng.int(0, 2);
        goalsAgainst = goalsFor;
    }

    let wonOnPens: boolean | undefined;
    if (outcome === 'draw' && round.isKnockout) {
        // Penalties slightly favour the stronger squad.
        wonOnPens = rng.next() < 0.5 + Math.min(0.2, diff / 200);
    }

    const scorers = pickScorers(rng, players, goalsFor);
    const sorted = [...players].sort((a, b) => b.overall_rating - a.overall_rating);
    const motm =
        outcome === 'loss'
            ? sorted[rng.int(0, Math.min(5, sorted.length) - 1)].name
            : scorers[0] ?? sorted[0].name;

    const flavourPool =
        outcome === 'win' ? FLAVOUR_WIN : outcome === 'draw' ? FLAVOUR_DRAW : FLAVOUR_LOSS;
    const flavour = rng.pick(flavourPool).replace('{scorer}', scorers[0] ?? motm);

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
