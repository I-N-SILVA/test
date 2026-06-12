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
    nextOpenSlot,
    rollConfederation,
    rollGamble,
    rollNation,
    spinnableConfederations,
    spinnableNations,
    type ConfederationSpinResult,
    type SpinResult,
} from '@/lib/game/wheel';
import type { Player } from '@/lib/game/types';

const SPIN_MODE_LABEL: Record<string, string> = {
    uniform: 'Open draw',
    weighted: 'Realistic',
    confederation: 'Confederation',
    position: 'Position-first',
};

export function DraftScreen() {
    const { state, dispatch } = useGame();
    const formation = getFormation(state.formationId);
    const showRatings = state.showRatings;
    const drafted = Object.keys(state.squad).length;
    const total = formation.slots.length;
    const mode = state.spinMode;

    // Player chosen but with several fitting slots → user picks where they play.
    const [placing, setPlacing] = React.useState<Player | null>(null);

    const targetSlot = mode === 'position' ? nextOpenSlot(formation.slots, state.squad) : null;
    const confStage =
        mode === 'confederation' && !state.spunConfederation && !state.spunNation;

    const candidates = state.spunNation
        ? eligiblePlayers(state.spunNation, formation.slots, state, {
              slotId: mode === 'position' ? targetSlot?.id : undefined,
          })
        : [];
    const placingSlots = placing ? fittingSlots(placing, formation.slots, state.squad) : [];

    // Nations currently reachable on the wheel (matches the odds the spin uses).
    const nationPool = spinnableNations(formation.slots, state, {
        confederation: mode === 'confederation' ? state.spunConfederation : null,
        slotId: mode === 'position' ? targetSlot?.id : null,
    });
    const nationSegments = nationPool.map((n) => ({ id: n.id, label: n.flag }));
    const confSegments = spinnableConfederations(formation.slots, state).map((c) => ({
        id: c,
        label: c,
    }));

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
    const nationLabel =
        mode === 'position' && targetSlot
            ? `Spin a nation for ${targetSlot.label}`
            : `${total - drafted} pick${total - drafted === 1 ? '' : 's'} to go`;

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
                    <span className="flex items-center gap-3 text-white/50">
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-white/60">
                            {SPIN_MODE_LABEL[mode]}
                        </span>
                        <span>
                            Rerolls <span className="text-flame-1">{state.rerolls}</span>
                        </span>
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
                {/* Stage 1 (confederation mode only): spin a confederation */}
                {confStage && !placing && (
                    <>
                        <SpinWheel<ConfederationSpinResult>
                            label="Spin a confederation"
                            segments={confSegments}
                            onSpin={() => {
                                const res = rollConfederation(state, formation.slots);
                                return res ? { segmentId: res.confederation, payload: res } : null;
                            }}
                            onLanded={(res) =>
                                dispatch({
                                    type: 'spunConfederation',
                                    confederation: res.confederation,
                                    rngState: res.rngState,
                                })
                            }
                        />
                        {gambleButton}
                    </>
                )}

                {/* Stage 2: spin a nation */}
                {!confStage && !state.spunNation && !placing && (
                    <>
                        {mode === 'confederation' && state.spunConfederation && (
                            <p className="caption-mono text-white/50">
                                Confederation · <span className="text-flame-1">{state.spunConfederation}</span>
                            </p>
                        )}
                        <SpinWheel<SpinResult>
                            label={nationLabel}
                            segments={nationSegments}
                            onSpin={() => {
                                const res = rollNation(state, formation.slots, {
                                    mode,
                                    confederation: state.spunConfederation,
                                    slotId: targetSlot?.id,
                                });
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

                {/* Stage 3: pick a player */}
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
                                            mode,
                                            excludeNation: state.spunNation,
                                            confederation: state.spunConfederation,
                                            slotId: targetSlot?.id,
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
                        {mode === 'position' && targetSlot && (
                            <p className="caption-mono mb-3 text-white/50">
                                Filling · <span className="text-flame-1">{targetSlot.label}</span>
                            </p>
                        )}
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
