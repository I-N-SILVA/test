'use client';

// Cross-run progression, persisted to localStorage separately from the active
// run. Lets a returning player see how they're doing over time.

export interface CareerStats {
    runs: number;
    championships: number;
    perfectRuns: number;
    bestScore: number; // internal ranking used to decide the best finish
    bestStars: number;
    bestFinish: string;
    mostGoals: number;
    longestStreak: number;
    lastRunId: string;
}

export interface RunSummary {
    runId: string;
    /** perfect = 6, champion = 5, otherwise the star rating. */
    score: number;
    stars: number;
    champion: boolean;
    perfect: boolean;
    finishLabel: string;
    goals: number;
    streak: number;
}

const KEY = 'perfect_run_career_v1';

const EMPTY: CareerStats = {
    runs: 0,
    championships: 0,
    perfectRuns: 0,
    bestScore: 0,
    bestStars: 0,
    bestFinish: '',
    mostGoals: 0,
    longestStreak: 0,
    lastRunId: '',
};

export function loadCareer(): CareerStats {
    if (typeof window === 'undefined') return EMPTY;
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<CareerStats>) };
    } catch {
        // Corrupt/unavailable storage — start fresh.
    }
    return EMPTY;
}

/**
 * Fold a finished run into the career totals. Idempotent per `runId` so a page
 * reload on the results screen can't double-count the same run.
 */
export function recordRun(summary: RunSummary): { stats: CareerStats; isNewBest: boolean } {
    const prev = loadCareer();
    if (summary.runId && summary.runId === prev.lastRunId) {
        return { stats: prev, isNewBest: false };
    }
    const beatsBest = summary.score > prev.bestScore;
    const stats: CareerStats = {
        runs: prev.runs + 1,
        championships: prev.championships + (summary.champion ? 1 : 0),
        perfectRuns: prev.perfectRuns + (summary.perfect ? 1 : 0),
        bestScore: Math.max(prev.bestScore, summary.score),
        bestStars: Math.max(prev.bestStars, summary.stars),
        bestFinish: beatsBest ? summary.finishLabel : prev.bestFinish,
        mostGoals: Math.max(prev.mostGoals, summary.goals),
        longestStreak: Math.max(prev.longestStreak, summary.streak),
        lastRunId: summary.runId,
    };
    try {
        localStorage.setItem(KEY, JSON.stringify(stats));
    } catch {
        // Best effort only.
    }
    // Only flag a "new best" once the player has a prior run to beat.
    return { stats, isNewBest: beatsBest && prev.runs > 0 };
}
