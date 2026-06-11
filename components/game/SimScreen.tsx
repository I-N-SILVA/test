'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, triggerHaptic } from '@/lib/utils';
import { useGame } from '@/lib/game/store';
import { ROUNDS, groupPoints } from '@/lib/game/engine';

export function SimScreen() {
    const { state, dispatch } = useGame();
    const last = state.matches[state.matches.length - 1];
    const nextRound = ROUNDS[state.matches.length];
    const runOver = state.eliminated || state.champion;
    const inGroup = state.matches.length < 3;

    React.useEffect(() => {
        if (last?.outcome === 'win') triggerHaptic('success');
        if (last?.outcome === 'loss') triggerHaptic('error');
    }, [last]);

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
            {/* Run tracker */}
            <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Tournament progress">
                {ROUNDS.map((round, i) => {
                    const match = state.matches[i];
                    return (
                        <li
                            key={round.name}
                            title={round.name}
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold',
                                !match && 'border-border text-muted-foreground',
                                match?.outcome === 'win' && 'border-primary-main bg-primary-main text-black',
                                match?.outcome === 'draw' &&
                                    (match.wonOnPens
                                        ? 'border-primary-main bg-primary-main/40 text-white'
                                        : 'border-destructive bg-destructive text-white'),
                                match?.outcome === 'loss' && 'border-destructive bg-destructive text-white',
                            )}
                        >
                            {match
                                ? match.outcome === 'win'
                                    ? 'W'
                                    : match.outcome === 'draw'
                                      ? match.wonOnPens
                                          ? 'P'
                                          : i < 3
                                            ? 'D'
                                            : 'L'
                                      : i < 3
                                        ? 'L'
                                        : 'L'
                                : i + 1}
                        </li>
                    );
                })}
            </ol>

            {inGroup && state.matches.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    Group points: <span className="font-bold text-foreground">{groupPoints(state.matches)}</span>{' '}
                    (need 4 to qualify)
                </p>
            )}

            {last && (
                <Card className="w-full border-border bg-card animate-slide-up" key={state.matches.length}>
                    <CardContent className="flex flex-col items-center gap-3 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {last.round}
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="font-display text-2xl">YOU</span>
                            <span className="animate-score-pop font-display text-5xl text-primary-main">
                                {last.goalsFor}–{last.goalsAgainst}
                            </span>
                            <span className="font-display text-2xl">
                                {last.opponentFlag} {last.opponent}
                            </span>
                        </div>
                        {last.wonOnPens !== undefined && (
                            <p className="text-sm font-semibold">
                                {last.wonOnPens ? '✅ Won on penalties' : '❌ Lost on penalties'}
                            </p>
                        )}
                        {last.scorers.length > 0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                ⚽ {last.scorers.join(', ')}
                            </p>
                        )}
                        <p className="text-center text-sm italic">{last.flavour}</p>
                        <p className="rounded-full border border-primary-dark px-3 py-1 text-xs">
                            ⭐ Man of the Match: <span className="font-bold">{last.motm}</span>
                        </p>
                    </CardContent>
                </Card>
            )}

            {!runOver && nextRound && (
                <Button
                    size="xl"
                    className="bg-gold-gradient w-full font-display text-xl uppercase text-black hover:opacity-90"
                    onClick={() => dispatch({ type: 'playMatch' })}
                >
                    {last ? `Play ${nextRound.name}` : `Kick off — ${nextRound.name}`}
                </Button>
            )}

            {runOver && (
                <Button
                    size="xl"
                    className="bg-gold-gradient w-full font-display text-xl uppercase text-black hover:opacity-90"
                    onClick={() => dispatch({ type: 'finish' })}
                >
                    {state.champion ? '🏆 See your trophy card' : 'See your run card'}
                </Button>
            )}
        </div>
    );
}
