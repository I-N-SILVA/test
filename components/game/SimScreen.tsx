'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
            {/* Run tracker: one square per round, system style */}
            <ol className="flex flex-wrap justify-center gap-1.5" aria-label="Tournament progress">
                {ROUNDS.map((round, i) => {
                    const match = state.matches[i];
                    const lostKO = match && i >= 3 && match.outcome !== 'win' && !match.wonOnPens;
                    const won = match && (match.outcome === 'win' || match.wonOnPens);
                    return (
                        <li
                            key={round.name}
                            title={round.name}
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-sm border font-mono text-[10px]',
                                !match && 'border-white/20 text-white/40',
                                won && 'border-flame-2 bg-flame-2/15 text-flame-1',
                                match && !won && !lostKO && 'border-white/40 bg-white/10 text-white',
                                (match?.outcome === 'loss' || lostKO) &&
                                    'border-flame-3 bg-flame-3 text-white',
                            )}
                        >
                            {match
                                ? match.outcome === 'win'
                                    ? 'W'
                                    : match.wonOnPens
                                      ? 'P'
                                      : match.outcome === 'draw' && i < 3
                                        ? 'D'
                                        : 'L'
                                : i + 1}
                        </li>
                    );
                })}
            </ol>

            {inGroup && state.matches.length > 0 && (
                <p className="caption-mono text-white/50">
                    Group points <span className="text-white">{groupPoints(state.matches)}</span> ·
                    need 4 to qualify
                </p>
            )}

            {last && (
                <div
                    className="w-full animate-slide-up rounded-lg border border-white/15 bg-white/[0.03]"
                    key={state.matches.length}
                >
                    <div className="flex flex-col items-center gap-4 p-8">
                        <p className="caption-mono text-white/50">{last.round}</p>
                        <div className="flex items-baseline gap-5">
                            <span className="text-xl font-semibold">YOU</span>
                            <span className="display-caps animate-score-pop text-6xl text-flame-1">
                                {last.goalsFor}–{last.goalsAgainst}
                            </span>
                            <span className="text-xl font-semibold">
                                {last.opponentFlag} {last.opponent}
                            </span>
                        </div>
                        {last.wonOnPens !== undefined && (
                            <p className="caption-mono">
                                {last.wonOnPens ? 'Won on penalties' : 'Lost on penalties'}
                            </p>
                        )}
                        {last.scorers.length > 0 && (
                            <p className="text-center font-mono text-sm text-white/60">
                                ⚽ {last.scorers.join(', ')}
                            </p>
                        )}
                        <p className="max-w-md text-center font-serif text-sm italic text-white/60">
                            {last.flavour}
                        </p>
                        <p className="caption-mono rounded-full border border-white/20 px-4 py-1.5">
                            MOTM · <span className="text-flame-1">{last.motm}</span>
                        </p>
                    </div>
                </div>
            )}

            {!runOver && nextRound && (
                <Button
                    size="xl"
                    variant="flame"
                    className="w-full"
                    onClick={() => dispatch({ type: 'playMatch' })}
                >
                    {last ? `Play ${nextRound.name}` : `Kick off · ${nextRound.name}`}
                </Button>
            )}

            {runOver && (
                <Button
                    size="xl"
                    variant="flame"
                    className="w-full"
                    onClick={() => dispatch({ type: 'finish' })}
                >
                    {state.champion ? 'See your trophy card' : 'See your run card'}
                </Button>
            )}
        </div>
    );
}
