'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PitchView } from './PitchView';
import { useGame } from '@/lib/game/store';
import { getFormation } from '@/lib/game/formations';
import { isPerfectRun, squadAverage, starRating } from '@/lib/game/engine';

export function ResultsScreen() {
    const { state, dispatch } = useGame();
    const formation = getFormation(state.formationId);
    const players = Object.values(state.squad);
    const last = state.matches[state.matches.length - 1];
    const perfect = isPerfectRun(state.matches);
    const stars = starRating(state.matches, state.champion);

    const goalsFor = state.matches.reduce((s, m) => s + m.goalsFor, 0);
    const cleanSheets = state.matches.filter((m) => m.goalsAgainst === 0).length;
    const avgRating = Math.round(squadAverage(players));
    const motmCounts = state.matches.reduce<Record<string, number>>((acc, m) => {
        acc[m.motm] = (acc[m.motm] ?? 0) + 1;
        return acc;
    }, {});
    const bestPlayer = Object.entries(motmCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const headline = perfect
        ? '🏆 48-0 PERFECT RUN'
        : state.champion
          ? '🏆 WORLD CHAMPIONS'
          : last
            ? `${last.round} exit: ${last.goalsFor}–${last.goalsAgainst} vs ${last.opponent}`
            : 'Run abandoned';

    const shareText = [
        perfect ? 'I went 48-0. PERFECT World Cup run. 🏆' : state.champion ? 'I won the World Cup! 🏆' : `My World Cup run ended at the ${last?.round ?? 'group stage'}.`,
        `Formation ${formation.name} · ${goalsFor} goals · ${cleanSheets} clean sheets · ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`,
        'Can you go 48-0? Draft World Cup legends and find out.',
    ].join('\n');

    const [copied, setCopied] = React.useState(false);
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: '48-0 World Cup Draft', text: shareText });
                return;
            }
        } catch {
            // Fall through to clipboard when share is cancelled/unsupported.
        }
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable — nothing else to do.
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
            <div className="text-center">
                <p className="font-display text-3xl text-primary-main sm:text-4xl">{headline}</p>
                <p
                    className="mt-2 text-2xl tracking-widest text-primary-main"
                    aria-label={`${stars} out of 5 stars`}
                >
                    {'★'.repeat(stars)}
                    <span className="text-muted-foreground">{'★'.repeat(5 - stars)}</span>
                </p>
            </div>

            <PitchView formation={formation} squad={state.squad} showRatings className="max-w-sm" />

            <dl className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    ['Goals', goalsFor],
                    ['Clean sheets', cleanSheets],
                    ['Avg rating', avgRating],
                    ['Best player', bestPlayer],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {label}
                        </dt>
                        <dd className="mt-1 truncate font-display text-xl">{value}</dd>
                    </div>
                ))}
            </dl>

            <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                    size="xl"
                    className="bg-gold-gradient flex-1 font-display text-lg uppercase text-black hover:opacity-90"
                    onClick={handleShare}
                >
                    {copied ? 'Copied!' : 'Share your run'}
                </Button>
                <Button
                    size="xl"
                    variant="outline"
                    className="flex-1 font-display text-lg uppercase"
                    onClick={() => dispatch({ type: 'reset' })}
                >
                    Try again
                </Button>
            </div>
        </div>
    );
}
