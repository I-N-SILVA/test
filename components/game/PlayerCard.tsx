'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getNation } from '@/lib/game/wheel';
import type { Player } from '@/lib/game/types';

interface PlayerCardProps {
    player: Player;
    showRating: boolean;
    /** How many of the current squad share this player's nation (chemistry). */
    nationLinks?: number;
    onPick?: () => void;
}

const ERA_LABELS: Record<string, string> = {
    classic: 'Classic',
    modern: 'Modern',
    contemporary: 'Contemporary',
};

export function PlayerCard({ player, showRating, nationLinks = 0, onPick }: PlayerCardProps) {
    const isGk = player.position[0] === 'GK';
    const hasStat = isGk
        ? player.clean_sheets != null
        : player.goals != null || player.assists != null;
    const keyStat = isGk
        ? `${player.clean_sheets ?? 0} clean sheets`
        : `${player.goals ?? 0}G ${player.assists ?? 0}A`;

    return (
        <button
            type="button"
            onClick={onPick}
            className={cn(
                'group flex w-full flex-col gap-2.5 rounded-md border border-white/15 bg-white/[0.03] p-4 text-left transition-all duration-300 ease-expo animate-slide-up focus-ring',
                'hover:border-flame-1 hover:bg-flame-2/[0.06]',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-semibold leading-tight">{player.name}</p>
                    <p className="caption-mono mt-1.5 text-white/50">
                        {getNation(player.nation)?.flag} {player.nation} · {player.world_cup_year}
                    </p>
                    {player.club && (
                        <p className="mt-0.5 text-xs text-white/40">{player.club}</p>
                    )}
                </div>
                {showRating && (
                    <span className="font-mono text-2xl font-medium text-flame-1">
                        {player.overall_rating}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                {player.position.map((pos) => (
                    <Badge key={pos} variant="outline">
                        {pos}
                    </Badge>
                ))}
                <Badge variant="secondary">{ERA_LABELS[player.era]}</Badge>
                {nationLinks > 0 && (
                    <span
                        title={`Shares a nation with ${nationLinks} of your squad — boosts chemistry`}
                        className="font-mono text-xs text-flame-1"
                    >
                        🔗 +{nationLinks} chem
                    </span>
                )}
                {hasStat && (
                    <span className="ml-auto font-mono text-xs text-white/70">{keyStat}</span>
                )}
            </div>
            {player.fun_fact && (
                <p className="font-serif text-sm italic text-white/50">“{player.fun_fact}”</p>
            )}
            <span className="caption-mono mt-1 hidden text-flame-1 group-hover:block">
                Draft →
            </span>
        </button>
    );
}
