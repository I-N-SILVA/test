'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PitchView } from './PitchView';
import { SpinWheel } from './SpinWheel';
import { PlayerCard } from './PlayerCard';
import { useGame } from '@/lib/game/store';
import { getFormation } from '@/lib/game/formations';
import { eligiblePlayers, fittingSlots, getNation, spinWheel } from '@/lib/game/wheel';
import type { Player } from '@/lib/game/types';

export function DraftScreen() {
    const { state, dispatch } = useGame();
    const formation = getFormation(state.formationId);
    const showRatings = state.difficulty !== 'legend';
    const drafted = Object.keys(state.squad).length;
    const total = formation.slots.length;

    // Player chosen but with several fitting slots → user picks where they play.
    const [placing, setPlacing] = React.useState<Player | null>(null);

    const candidates = state.spunNation
        ? eligiblePlayers(state.spunNation, formation.slots, state)
        : [];
    const placingSlots = placing ? fittingSlots(placing, formation.slots, state.squad) : [];

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

    const spunNationMeta = state.spunNation ? getNation(state.spunNation) : null;

    return (
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                        {drafted}/{total} drafted
                    </span>
                    <span className="text-muted-foreground">
                        Rerolls: <span className="font-bold text-primary-main">{state.rerolls}</span>
                    </span>
                </div>
                <div
                    className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={drafted}
                    aria-valuemin={0}
                    aria-valuemax={total}
                >
                    <div
                        className="h-full bg-gold-gradient transition-all"
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
                    <p className="mt-2 text-center text-sm text-primary-main">
                        Choose a highlighted slot for {placing.name} — or{' '}
                        <button type="button" className="underline" onClick={() => setPlacing(null)}>
                            cancel
                        </button>
                    </p>
                )}
            </div>

            <div className="order-1 flex flex-col items-center gap-4 lg:order-2">
                {!state.spunNation && !placing && (
                    <SpinWheel
                        label={`Spin to draft your next legend (${total - drafted} to go)`}
                        onSpin={() => spinWheel(formation.slots, state)}
                        onLanded={(nation) => dispatch({ type: 'spun', nation: nation.name })}
                    />
                )}

                {state.spunNation && !placing && (
                    <div className="w-full animate-slide-up">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-2xl">
                                {spunNationMeta?.flag} {state.spunNation}
                            </h2>
                            {state.rerolls > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const next = spinWheel(formation.slots, state, state.spunNation);
                                        if (next) dispatch({ type: 'reroll', nation: next.name });
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
