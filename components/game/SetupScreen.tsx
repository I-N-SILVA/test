'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FormationPicker } from './FormationPicker';
import { useGame, REROLLS_BY_DIFFICULTY } from '@/lib/game/store';
import { dailyLabel, dailySeed, randomSeed, seedFromString } from '@/lib/game/rng';
import type { Difficulty, EraFilter, GameMode } from '@/lib/game/types';

const DIFFICULTIES: { id: Difficulty; name: string; blurb: string }[] = [
    { id: 'easy', name: 'Easy', blurb: '3 rerolls available' },
    { id: 'normal', name: 'Normal', blurb: '1 reroll available' },
    { id: 'legend', name: 'Legend', blurb: 'No rerolls. No mercy.' },
];

const ERAS: { id: EraFilter; name: string; blurb: string }[] = [
    { id: 'all', name: 'All-time', blurb: '1930 to 2026, the full archive' },
    { id: 'classic', name: 'Classic', blurb: 'Up to 1990' },
    { id: 'modern', name: 'Modern', blurb: '1990 to 2010' },
    { id: 'contemporary', name: 'Contemporary', blurb: '2010 to 2026' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="caption-mono mb-3 text-white/50">{children}</p>;
}

export function SetupScreen() {
    const { dispatch } = useGame();
    const [formationId, setFormationId] = React.useState('4-3-3');
    const [difficulty, setDifficulty] = React.useState<Difficulty>('normal');
    const [eraFilter, setEraFilter] = React.useState<EraFilter>('all');
    const [showRatings, setShowRatings] = React.useState(true);
    const [mode, setMode] = React.useState<GameMode>('free');
    // A ?seed= link pins a specific seed so a friend replays your exact run.
    const [customSeed, setCustomSeed] = React.useState<{ seed: number; label: string } | null>(null);

    React.useEffect(() => {
        const raw = new URLSearchParams(window.location.search).get('seed');
        if (!raw) return;
        const seed = /^\d+$/.test(raw) ? Number(raw) >>> 0 : seedFromString(raw);
        setCustomSeed({ seed, label: raw });
        setMode('free');
    }, []);

    const start = () => {
        let seed: number;
        let seedLabel: string;
        if (mode === 'daily') {
            seed = dailySeed();
            seedLabel = dailyLabel();
        } else if (customSeed) {
            seed = customSeed.seed;
            seedLabel = customSeed.label;
        } else {
            seed = randomSeed();
            seedLabel = '';
        }
        dispatch({
            type: 'configure',
            formationId,
            difficulty,
            eraFilter,
            showRatings,
            mode,
            seed,
            seedLabel,
            spinMode: 'uniform',
        });
    };

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <div>
                <h1 className="display-caps text-4xl sm:text-5xl">
                    Set up <span className="serif-accent normal-case">your</span> run
                </h1>
                <p className="mt-3 text-white/60">
                    Eleven spins, eleven picks, eight matches. Choose your shape first.
                </p>
            </div>

            <section>
                <SectionLabel>Mode</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                    {(
                        [
                            {
                                id: 'free',
                                name: customSeed ? 'Shared seed' : 'Free play',
                                blurb: customSeed
                                    ? `Replaying seed “${customSeed.label}”`
                                    : 'A fresh random run every time',
                            },
                            {
                                id: 'daily',
                                name: 'Daily Challenge',
                                blurb: `Everyone gets today’s seed · ${dailyLabel()}`,
                            },
                        ] as { id: GameMode; name: string; blurb: string }[]
                    ).map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setMode(m.id)}
                            aria-pressed={mode === m.id}
                            className={cn(
                                'rounded-md border p-4 text-left transition-all duration-300 ease-expo',
                                mode === m.id
                                    ? 'border-flame-1 bg-flame-2/10'
                                    : 'border-white/15 bg-white/[0.03] hover:border-white/40',
                            )}
                        >
                            <span className="block font-semibold">{m.name}</span>
                            <span className="mt-1 block text-xs text-white/50">{m.blurb}</span>
                        </button>
                    ))}
                </div>
                {mode === 'daily' && (
                    <p className="mt-2 text-xs text-white/50">
                        Same wheel and same opponents for every player today — compare your run.
                    </p>
                )}
            </section>

            <section>
                <SectionLabel>Formation</SectionLabel>
                <FormationPicker value={formationId} onChange={setFormationId} />
            </section>

            <section>
                <SectionLabel>Difficulty</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                                setDifficulty(d.id);
                                if (d.id === 'legend') setShowRatings(false);
                            }}
                            aria-pressed={difficulty === d.id}
                            className={cn(
                                'rounded-md border p-4 text-left transition-all duration-300 ease-expo',
                                difficulty === d.id
                                    ? 'border-flame-1 bg-flame-2/10'
                                    : 'border-white/15 bg-white/[0.03] hover:border-white/40',
                            )}
                        >
                            <span className="block font-semibold">{d.name}</span>
                            <span className="mt-1 block text-xs text-white/50">{d.blurb}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-white/50">
                    Plus 2 🎲 gamble tokens per run — auto-draft a fully random player, double or
                    nothing.
                </p>
            </section>

            <section>
                <SectionLabel>Ratings</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { value: true, name: 'Visible', blurb: 'Player overalls shown while you draft' },
                        { value: false, name: 'Blind mode', blurb: 'No numbers. Trust your gut.' },
                    ].map((opt) => (
                        <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => setShowRatings(opt.value)}
                            aria-pressed={showRatings === opt.value}
                            className={cn(
                                'rounded-md border p-4 text-left transition-all duration-300 ease-expo',
                                showRatings === opt.value
                                    ? 'border-flame-1 bg-flame-2/10'
                                    : 'border-white/15 bg-white/[0.03] hover:border-white/40',
                            )}
                        >
                            <span className="block font-semibold">{opt.name}</span>
                            <span className="mt-1 block text-xs text-white/50">{opt.blurb}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <SectionLabel>Era</SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {ERAS.map((era) => (
                        <button
                            key={era.id}
                            type="button"
                            onClick={() => setEraFilter(era.id)}
                            aria-pressed={eraFilter === era.id}
                            className={cn(
                                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300 ease-expo',
                                eraFilter === era.id
                                    ? 'border-transparent bg-flame-gradient text-white'
                                    : 'border-white/20 hover:border-white/50',
                            )}
                        >
                            {era.name}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-white/50">
                    {ERAS.find((e) => e.id === eraFilter)?.blurb}. Only players from this era can be
                    drafted.
                </p>
            </section>

            <Button size="xl" variant="flame" onClick={start}>
                {mode === 'daily' ? 'Start the daily →' : 'Start the draft →'}
            </Button>
            <p className="caption-mono -mt-6 text-center text-white/40">
                {REROLLS_BY_DIFFICULTY[difficulty]} reroll
                {REROLLS_BY_DIFFICULTY[difficulty] === 1 ? '' : 's'} ·{' '}
                {showRatings ? 'ratings visible' : 'blind mode'}
            </p>
        </div>
    );
}
