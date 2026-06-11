'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getNation } from '@/lib/game/wheel';
import type { Player } from '@/lib/game/types';

interface PlayerCardProps {
    player: Player;
    showRating: boolean;
    onPick?: () => void;
}

const ERA_LABELS: Record<string, string> = {
    classic: 'Classic',
    modern: 'Modern',
    contemporary: 'Contemporary',
};

export function PlayerCard({ player, showRating, onPick }: PlayerCardProps) {
    const keyStat =
        player.position[0] === 'GK'
            ? `${player.clean_sheets ?? 0} clean sheets`
            : `${player.goals ?? 0}G ${player.assists ?? 0}A`;

    return (
        <button
            type="button"
            onClick={onPick}
            className={cn(
                'group flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all animate-slide-up',
                'hover:border-primary-main hover:shadow-[0_0_20px_rgba(255,215,0,0.15)]',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-display text-xl uppercase leading-none">{player.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {getNation(player.nation)?.flag} {player.nation} · {player.world_cup_year}
                    </p>
                </div>
                {showRating && (
                    <span className="font-display text-3xl text-primary-main">{player.overall_rating}</span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                {player.position.map((pos) => (
                    <Badge key={pos} variant="outline" className="text-[10px]">
                        {pos}
                    </Badge>
                ))}
                <Badge variant="secondary" className="text-[10px]">
                    {ERA_LABELS[player.era]}
                </Badge>
                <span className="ml-auto text-xs font-semibold text-primary-light">{keyStat}</span>
            </div>
            {player.fun_fact && (
                <p className="text-xs italic text-muted-foreground">“{player.fun_fact}”</p>
            )}
            <span className="mt-1 hidden text-center text-xs font-bold uppercase tracking-wide text-primary-main group-hover:block">
                Tap to draft →
            </span>
        </button>
    );
}
