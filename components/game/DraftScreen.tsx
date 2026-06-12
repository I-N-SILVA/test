'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PitchView } from './PitchView';
import { SpinWheel } from './SpinWheel';
import { PlayerCard } from './PlayerCard';
import { useGame } from '@/lib/game/store';
import { getFormation } from '@/lib/game/formations';
import {
    eligiblePlayers,
    fittingSlots,
    getNation,
    rollGamble,
    rollNation,
    spinnableNations,
    type SpinResult,
} from '@/lib/game/wheel';
import type { Player } from '@/lib/game/types';

export function DraftScreen() {
    const { state, dispatch } = useGame();
    const formation = getFormation(state.formationId);
    const showRatings = state.showRatings;
    const drafted = Object.keys(state.squad).length;
    const total = formation.slots.length;

    // Player chosen but with several fitting slots → user picks where they play.
    const [placing, setPlacing] = React.useState<Player | null>(null);

    const candidates = state.spunNation
        ? eligiblePlayers(state.spunNation, formation.slots, state)
        : [];
    const placingSlots = placing ? fittingSlots(placing, formation.slots, state.squad) : [];

    // Nations currently reachable on the wheel (matches the odds the spin uses).
    const nationPool = spinnableNations(formation.slots, state);
    const nationSegments = nationPool.map((n) => ({ id: n.id, label: n.flag }));

    const handlePick = (player: Player) => {
        const fitting = fittingSlots(player, formation.slots, state.squad);
        if (fitting.length === 1) {
            dispatch({ type: 'pick', player, slotId: fitting[0].id });
        } else {
            setPlacing(player);
        }
    };

    const handleSlotClick = (slotId: string) => {
        if (!placing) return;
        if (!placingSlots.some((s) => s.id === slotId)) return;
        dispatch({ type: 'pick', player: placing, slotId });
        setPlacing(null);
    };

    const handleGamble = () => {
        const g = rollGamble(state, formation.slots);
        if (g) dispatch({ type: 'gamble', player: g.player, slotId: g.slotId, rngState: g.rngState });
    };

    const spunNationMeta = state.spunNation ? getNation(state.spunNation) : null;
    const picksLeft = total - drafted;
    const nationLabel = `${picksLeft} pick${picksLeft === 1 ? '' : 's'} to go`;

    const gambleButton = state.gambles > 0 && (
        <button
            type="button"
            onClick={handleGamble}
            className="caption-mono rounded-full border border-white/20 px-4 py-2 text-white/70 transition-colors hover:border-flame-2 hover:text-flame-1"
        >
            🎲 Gamble · double or nothing ({state.gambles})
        </button>
    );

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
                <div className="caption-mono mb-2 flex items-center justify-between">
                    <span className="text-white/70">
                        {drafted}/{total} drafted
                    </span>
                    <span className="text-white/50">
                        Rerolls <span className="text-flame-1">{state.rerolls}</span>
                    </span>
                </div>
                <div
                    className="mb-4 h-px w-full bg-white/15"
                    role="progressbar"
                    aria-valuenow={drafted}
                    aria-valuemin={0}
                    aria-valuemax={total}
                >
                    <div
                        className="h-px bg-flame-gradient transition-all duration-500 ease-expo"
                        style={{ width: `${(drafted / total) * 100}%` }}
                    />
                </div>
                <PitchView
                    formation={formation}
                    squad={state.squad}
                    showRatings={showRatings}
                    highlightSlotIds={placing ? placingSlots.map((s) => s.id) : []}
                    onSlotClick={placing ? handleSlotClick : undefined}
                />
                {placing && (
                    <p className="mt-3 text-center text-sm text-flame-1">
                        Choose a highlighted slot for {placing.name}, or{' '}
                        <button
                            type="button"
                            className="underline underline-offset-4"
                            onClick={() => setPlacing(null)}
                        >
                            cancel
                        </button>
                    </p>
                )}
            </div>

            <div className="order-1 flex flex-col items-center gap-4 lg:order-2">
                {/* Spin a nation */}
                {!state.spunNation && !placing && (
                    <>
                        <SpinWheel<SpinResult>
                            label={nationLabel}
                            segments={nationSegments}
                            onSpin={() => {
                                const res = rollNation(state, formation.slots, { mode: 'uniform' });
                                return res ? { segmentId: res.nation.id, payload: res } : null;
                            }}
                            onLanded={(res) =>
                                dispatch({
                                    type: 'spun',
                                    nation: res.nation.name,
                                    rngState: res.rngState,
                                })
                            }
                        />
                        {gambleButton}
                    </>
                )}

                {/* Pick a player */}
                {state.spunNation && !placing && (
                    <div className="w-full animate-slide-up">
                        <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
                            <h2 className="text-2xl font-semibold">
                                {spunNationMeta?.flag} {state.spunNation}
                            </h2>
                            {state.rerolls > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const next = rollNation(state, formation.slots, {
                                            mode: 'uniform',
                                            excludeNation: state.spunNation,
                                        });
                                        if (next)
                                            dispatch({
                                                type: 'reroll',
                                                nation: next.nation.name,
                                                rngState: next.rngState,
                                            });
                                    }}
                                >
                                    Re-spin ({state.rerolls})
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            {candidates.map((player) => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    showRating={showRatings}
                                    onPick={() => handlePick(player)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
