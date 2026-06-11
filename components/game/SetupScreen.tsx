'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FormationPicker } from './FormationPicker';
import { useGame, REROLLS_BY_DIFFICULTY } from '@/lib/game/store';
import type { Difficulty, EraFilter } from '@/lib/game/types';

const DIFFICULTIES: { id: Difficulty; name: string; blurb: string }[] = [
    { id: 'easy', name: 'Easy', blurb: '3 rerolls · ratings visible' },
    { id: 'normal', name: 'Normal', blurb: '1 reroll · ratings visible' },
    { id: 'legend', name: 'Legend', blurb: '0 rerolls · ratings hidden' },
];

const ERAS: { id: EraFilter; name: string }[] = [
    { id: 'all', name: 'All Eras' },
    { id: 'classic', name: 'Classic 1930–1990' },
    { id: 'modern', name: 'Modern 1990–2010' },
    { id: 'contemporary', name: '2010–2026' },
];

export function SetupScreen() {
    const { dispatch } = useGame();
    const [formationId, setFormationId] = React.useState('4-3-3');
    const [difficulty, setDifficulty] = React.useState<Difficulty>('normal');
    const [eraFilter, setEraFilter] = React.useState<EraFilter>('all');

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <section>
                <h2 className="mb-3 text-2xl">Pick your formation</h2>
                <FormationPicker value={formationId} onChange={setFormationId} />
            </section>

            <section>
                <h2 className="mb-3 text-2xl">Difficulty</h2>
                <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => setDifficulty(d.id)}
                            aria-pressed={difficulty === d.id}
                            className={cn(
                                'rounded-xl border p-3 text-center transition-all',
                                difficulty === d.id
                                    ? 'border-primary-main bg-primary-main/10'
                                    : 'border-border bg-card hover:border-primary-dark',
                            )}
                        >
                            <span className="font-display text-lg">{d.name}</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">{d.blurb}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-2xl">Era filter</h2>
                <div className="flex flex-wrap gap-2">
                    {ERAS.map((era) => (
                        <button
                            key={era.id}
                            type="button"
                            onClick={() => setEraFilter(era.id)}
                            aria-pressed={eraFilter === era.id}
                            className={cn(
                                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                                eraFilter === era.id
                                    ? 'border-primary-main bg-primary-main text-black'
                                    : 'border-border bg-card hover:border-primary-dark',
                            )}
                        >
                            {era.name}
                        </button>
                    ))}
                </div>
            </section>

            <Button
                size="xl"
                className="bg-gold-gradient font-display text-xl uppercase text-black hover:opacity-90"
                onClick={() => dispatch({ type: 'configure', formationId, difficulty, eraFilter })}
            >
                Start drafting ({REROLLS_BY_DIFFICULTY[difficulty]} rerolls)
            </Button>
        </div>
    );
}
