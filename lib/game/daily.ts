'use client';

import { dailyLabel } from './rng';

// Local Daily Challenge history + streak, persisted to localStorage. A *global*
// leaderboard would need a backend; this is the honest local-only version: your
// own best result per day, and your current streak.

export interface DailyEntry {
    date: string; // ISO label, e.g. "2026-06-16"
    stars: number;
    score: number; // perfect=6, champion=5, else stars — used to keep the best
    finishLabel: string;
    goals: number;
    champion: boolean;
    perfect: boolean;
}

const KEY = 'perfect_run_daily_v1';

function dayFromLabel(label: string): number {
    const [y, m, d] = label.split('-').map(Number);
    if (!y || !m || !d) return 0;
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function loadMap(): Record<string, DailyEntry> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw) as Record<string, DailyEntry>;
    } catch {
        // ignore corrupt storage
    }
    return {};
}

/** Store a daily result, keeping only the best run per date. */
export function recordDaily(entry: DailyEntry): void {
    if (!entry.date) return;
    const map = loadMap();
    const prev = map[entry.date];
    if (!prev || entry.score > prev.score) {
        map[entry.date] = entry;
        try {
            localStorage.setItem(KEY, JSON.stringify(map));
        } catch {
            // best effort
        }
    }
}

/** Most recent first. */
export function loadDailyHistory(): DailyEntry[] {
    return Object.values(loadMap()).sort((a, b) => dayFromLabel(b.date) - dayFromLabel(a.date));
}

/**
 * Consecutive days played, ending today. A grace day is allowed: before you've
 * played today the streak still counts up to yesterday, so it doesn't read as
 * broken until a full day is actually missed.
 */
export function dailyStreak(entries: DailyEntry[]): number {
    const days = new Set(entries.map((e) => dayFromLabel(e.date)));
    let d = dayFromLabel(dailyLabel());
    if (!days.has(d)) d -= 1;
    let streak = 0;
    while (days.has(d)) {
        streak += 1;
        d -= 1;
    }
    return streak;
}
