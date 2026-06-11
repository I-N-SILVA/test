'use client';

import { cn } from '@/lib/utils';
import { getNation } from '@/lib/game/wheel';
import type { Formation, Player } from '@/lib/game/types';

interface PitchViewProps {
    formation: Formation;
    squad: Record<string, Player>;
    showRatings: boolean;
    highlightSlotIds?: string[];
    onSlotClick?: (slotId: string) => void;
    className?: string;
}

export function PitchView({
    formation,
    squad,
    showRatings,
    highlightSlotIds = [],
    onSlotClick,
    className,
}: PitchViewProps) {
    return (
        <div
            className={cn(
                'relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-pitch-light/40 bg-pitch-texture shadow-2xl',
                className,
            )}
        >
            {/* Pitch markings */}
            <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-white/30" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[calc(100%-1.5rem)] -translate-x-1/2 bg-white/30" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 h-16 w-40 -translate-x-1/2 border-2 border-b-0 border-white/30" />
            <div className="pointer-events-none absolute left-1/2 top-3 h-16 w-40 -translate-x-1/2 border-2 border-t-0 border-white/30" />

            {formation.slots.map((slot) => {
                const player = squad[slot.id];
                const highlighted = highlightSlotIds.includes(slot.id);
                return (
                    <button
                        key={slot.id}
                        type="button"
                        disabled={!onSlotClick}
                        onClick={() => onSlotClick?.(slot.id)}
                        aria-label={player ? `${slot.label}: ${player.name}` : `Empty ${slot.label} slot`}
                        className={cn(
                            'absolute flex -translate-x-1/2 translate-y-1/2 flex-col items-center gap-0.5 transition-transform',
                            onSlotClick && 'cursor-pointer hover:scale-110',
                        )}
                        style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
                    >
                        <span
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-12 sm:w-12',
                                player
                                    ? 'border-primary-main bg-black/80 text-primary-main'
                                    : 'border-dashed border-white/50 bg-black/30 text-white/60',
                                highlighted && 'animate-pulse border-primary-light ring-2 ring-primary-main',
                            )}
                        >
                            {player ? (
                                <span className="text-base">{getNation(player.nation)?.flag ?? '⚽'}</span>
                            ) : (
                                slot.label
                            )}
                        </span>
                        {player && (
                            <span className="max-w-[72px] truncate rounded bg-black/70 px-1 text-[9px] font-semibold text-white sm:text-[10px]">
                                {player.name.split(' ').slice(-1)[0]}
                                {showRatings && (
                                    <span className="ml-1 text-primary-main">{player.overall_rating}</span>
                                )}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
