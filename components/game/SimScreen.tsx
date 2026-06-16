'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn, prefersReducedMotion, triggerHaptic } from '@/lib/utils';
import { useGame } from '@/lib/game/store';
import { playSound } from '@/lib/game/sound';
import { ROUNDS, QUALIFICATION_POINTS, groupPoints } from '@/lib/game/engine';

// The engine only stores who won the shootout, so synthesise a believable
// 5-kick scoreline for the reveal (cosmetic only — never affects the result).
function fabricatePens(youWon: boolean): { you: boolean[]; opp: boolean[] } {
    const gen = () => Array.from({ length: 5 }, () => Math.random() < 0.72);
    const makes = (a: boolean[]) => a.filter(Boolean).length;
    let you = gen();
    let opp = gen();
    let guard = 0;
    while (
        guard++ < 50 &&
        ((youWon && makes(you) <= makes(opp)) || (!youWon && makes(opp) <= makes(you)))
    ) {
        you = gen();
        opp = gen();
    }
    return { you, opp };
}

export function SimScreen() {
    const { state, dispatch } = useGame();
    const last = state.matches[state.matches.length - 1];
    const matchKey = state.matches.length;
    const nextRound = ROUNDS[state.matches.length];
    const runOver = state.eliminated || state.champion;
    const inGroup = state.matches.length < 3;
    const points = groupPoints(state.matches);
    const qualified = points >= QUALIFICATION_POINTS;
    // A defeat (or a knockout draw lost on penalties) belongs to the opposition,
    // not your XI — so the standout goes to the team that beat you.
    const lostMatch = !!last && (last.outcome === 'loss' || last.wonOnPens === false);

    // Animated reveal of the latest scoreline + shootout.
    const [reveal, setReveal] = React.useState({ for: 0, against: 0 });
    const [pens, setPens] = React.useState<{ you: boolean[]; opp: boolean[] } | null>(null);
    const [pensShown, setPensShown] = React.useState(0);

    React.useEffect(() => {
        if (!last) return;
        const reduced = prefersReducedMotion();
        const penData =
            last.wonOnPens !== undefined ? fabricatePens(last.wonOnPens === true) : null;
        const won = last.outcome === 'win' || last.wonOnPens === true;
        const lost = last.outcome === 'loss' || last.wonOnPens === false;

        const verdict = () => {
            if (won) {
                triggerHaptic('success');
                playSound('win');
            } else if (lost) {
                triggerHaptic('error');
                playSound('lose');
            }
        };

        if (reduced) {
            setReveal({ for: last.goalsFor, against: last.goalsAgainst });
            setPens(penData);
            setPensShown(penData ? 5 : 0);
            verdict();
            return;
        }

        setReveal({ for: 0, against: 0 });
        setPens(penData);
        setPensShown(0);

        const timers: number[] = [];
        let t = 350;
        const STEP = 360;
        for (let i = 1; i <= last.goalsFor; i++) {
            const n = i;
            timers.push(
                window.setTimeout(() => {
                    setReveal((r) => ({ ...r, for: n }));
                    playSound('goal');
                    triggerHaptic('light');
                }, t),
            );
            t += STEP;
        }
        for (let i = 1; i <= last.goalsAgainst; i++) {
            const n = i;
            timers.push(
                window.setTimeout(() => {
                    setReveal((r) => ({ ...r, against: n }));
                    playSound('miss');
                }, t),
            );
            t += STEP;
        }
        if (penData) {
            t += 200;
            for (let i = 1; i <= 5; i++) {
                const n = i;
                timers.push(
                    window.setTimeout(() => {
                        setPensShown(n);
                        playSound(penData.you[n - 1] || penData.opp[n - 1] ? 'goal' : 'miss');
                    }, t),
                );
                t += 450;
            }
        }
        timers.push(window.setTimeout(verdict, t + 150));

        return () => timers.forEach((id) => window.clearTimeout(id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchKey]);

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
                    Group points <span className="text-white">{points}</span> ·{' '}
                    {qualified ? (
                        <span className="text-flame-1">qualified ✓</span>
                    ) : (
                        `need ${QUALIFICATION_POINTS} to qualify`
                    )}
                </p>
            )}

            {last && (
                <div
                    className="w-full animate-slide-up rounded-lg border border-white/15 bg-white/[0.03]"
                    key={matchKey}
                >
                    <div className="flex flex-col items-center gap-4 p-8">
                        <p className="caption-mono text-white/50">{last.round}</p>
                        <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
                            <span className="text-base font-semibold sm:text-xl">YOU</span>
                            <span
                                key={`${reveal.for}-${reveal.against}`}
                                className="display-caps animate-score-pop text-5xl text-flame-1 sm:text-6xl"
                            >
                                {reveal.for}–{reveal.against}
                            </span>
                            <span className="text-base font-semibold sm:text-xl">
                                {last.opponentFlag} {last.opponent}
                            </span>
                        </div>

                        {pens && (
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="caption-mono text-white/50">Penalties</p>
                                {(
                                    [
                                        ['YOU', pens.you],
                                        [last.opponent, pens.opp],
                                    ] as const
                                ).map(([label, kicks]) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className="w-16 truncate text-right font-mono text-[10px] text-white/60">
                                            {label}
                                        </span>
                                        <span className="flex gap-1">
                                            {kicks.map((made, i) => (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                                                        i >= pensShown
                                                            ? 'border-white/15 text-transparent'
                                                            : made
                                                              ? 'border-flame-2 bg-flame-2/15 text-flame-1'
                                                              : 'border-white/30 text-white/40',
                                                    )}
                                                >
                                                    {i >= pensShown ? '·' : made ? '✓' : '✗'}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                ))}
                                {pensShown >= 5 && (
                                    <p className="caption-mono mt-1 text-flame-1">
                                        {last.wonOnPens ? 'Won on penalties' : 'Lost on penalties'}
                                    </p>
                                )}
                            </div>
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
                            MOTM ·{' '}
                            <span className="text-flame-1">
                                {lostMatch ? `${last.opponentFlag} ${last.opponent}` : last.motm}
                            </span>
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
