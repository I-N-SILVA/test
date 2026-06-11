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

// Blueprint pitch: ink surface, hairline markings, flame for filled slots.
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
                'relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/15 bg-[#0a0a0a]',
                className,
            )}
        >
            {/* Pitch markings as hairlines */}
            <div className="pointer-events-none absolute inset-3 rounded-sm border border-white/15" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[calc(100%-1.5rem)] -translate-x-1/2 bg-white/15" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 h-16 w-40 -translate-x-1/2 border border-b-0 border-white/15" />
            <div className="pointer-events-none absolute left-1/2 top-3 h-16 w-40 -translate-x-1/2 border border-t-0 border-white/15" />

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
                            'absolute flex -translate-x-1/2 translate-y-1/2 flex-col items-center gap-1 transition-transform duration-300 ease-expo',
                            onSlotClick && 'cursor-pointer hover:scale-110',
                        )}
                        style={{ left: `${slot.x}%`, bottom: `${slot.y}%` }}
                    >
                        <span
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[10px] sm:h-12 sm:w-12',
                                player
                                    ? 'border-flame-2 bg-flame-2/15 text-flame-1'
                                    : 'border-dashed border-white/30 bg-white/[0.03] text-white/50',
                                highlighted &&
                                    'animate-pulse border-flame-1 ring-2 ring-flame-1/60',
                            )}
                        >
                            {player ? (
                                <span className="text-base">{getNation(player.nation)?.flag ?? '⚽'}</span>
                            ) : (
                                slot.label
                            )}
                        </span>
                        {player && (
                            <span className="max-w-[76px] truncate rounded-sm bg-black/80 px-1.5 py-px font-mono text-[9px] text-white sm:text-[10px]">
                                {player.name.split(' ').slice(-1)[0]}
                                {showRatings && (
                                    <span className="ml-1 text-flame-1">{player.overall_rating}</span>
                                )}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
