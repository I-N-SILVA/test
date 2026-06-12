'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PitchView } from './PitchView';
import { useGame } from '@/lib/game/store';
import { getFormation } from '@/lib/game/formations';
import { isPerfectRun, squadAverage, starRating } from '@/lib/game/engine';
import { renderShareCard } from '@/lib/game/shareCard';

export function ResultsScreen() {
    const { state, dispatch } = useGame();
    const formation = getFormation(state.formationId);
    const players = Object.values(state.squad);
    const last = state.matches[state.matches.length - 1];
    const perfect = isPerfectRun(state.matches);
    const stars = starRating(state.matches, state.champion);

    const goalsFor = state.matches.reduce((s, m) => s + m.goalsFor, 0);
    const cleanSheets = state.matches.filter((m) => m.goalsAgainst === 0).length;
    const avgRating = Math.round(squadAverage(players));
    const motmCounts = state.matches.reduce<Record<string, number>>((acc, m) => {
        acc[m.motm] = (acc[m.motm] ?? 0) + 1;
        return acc;
    }, {});
    const bestPlayer = Object.entries(motmCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '–';

    const headline = perfect
        ? 'THE PERFECT RUN'
        : state.champion
          ? 'WORLD CHAMPIONS'
          : last
            ? `Out at the ${last.round}`
            : 'Run abandoned';

    const subline = perfect
        ? '8 wins. 0 conceded. It actually happened.'
        : state.champion
          ? 'Champions, but not perfect. The clean sheet run is still out there.'
          : last
            ? `${last.goalsFor}–${last.goalsAgainst} vs ${last.opponent}. Football is cruel.`
            : '';

    const seedTag =
        state.mode === 'daily'
            ? `Daily ${state.seedLabel}`
            : state.seedLabel
              ? `Seed ${state.seedLabel}`
              : '';

    const shareUrl =
        typeof window !== 'undefined' && state.seedLabel
            ? `${window.location.origin}/game?seed=${encodeURIComponent(state.seedLabel)}`
            : undefined;

    const shareText = [
        perfect
            ? 'THE PERFECT RUN. 8 wins, 0 conceded. World Cup, flawless. 🏆'
            : state.champion
              ? 'I won the World Cup! 🏆'
              : `My World Cup run ended at the ${last?.round ?? 'group stage'}.`,
        `${formation.name} · ${goalsFor} goals · ${cleanSheets} clean sheets · ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`,
        state.mode === 'daily' ? `Daily Challenge ${state.seedLabel}.` : '',
        shareUrl
            ? `Beat my run on the same seed: ${shareUrl}`
            : 'Think you can do the Perfect Run? Draft World Cup legends and find out.',
    ]
        .filter(Boolean)
        .join('\n');

    const [status, setStatus] = React.useState<'idle' | 'working' | 'copied'>('idle');

    const buildCard = () =>
        renderShareCard({
            headline,
            subline,
            formation,
            squad: state.squad,
            showRatings: true,
            stars,
            accent: perfect || state.champion,
            stats: [
                ['Goals', goalsFor],
                ['Clean sheets', cleanSheets],
                ['Avg rating', avgRating],
                ['Best player', bestPlayer],
            ].map(([label, value]) => ({ label: String(label), value: String(value) })),
            seedLabel: seedTag,
        });

    const handleShare = async () => {
        setStatus('working');
        let blob: Blob | null = null;
        try {
            blob = await buildCard();
        } catch {
            blob = null;
        }

        const file = blob ? new File([blob], 'perfect-run.png', { type: 'image/png' }) : null;
        try {
            if (
                file &&
                navigator.canShare?.({ files: [file] }) &&
                navigator.share
            ) {
                await navigator.share({ title: 'Perfect Run', text: shareText, files: [file] });
                setStatus('idle');
                return;
            }
            if (navigator.share) {
                await navigator.share({ title: 'Perfect Run', text: shareText });
                setStatus('idle');
                return;
            }
        } catch {
            // Cancelled or unsupported — fall through to download + clipboard.
        }

        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'perfect-run.png';
            a.click();
            URL.revokeObjectURL(url);
        }
        try {
            await navigator.clipboard.writeText(shareText);
        } catch {
            // Clipboard unavailable — the image download is still the main payload.
        }
        setStatus('copied');
        window.setTimeout(() => setStatus('idle'), 2000);
    };

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
            <div className="text-center">
                <p className="caption-mono text-white/50">
                    Full time{seedTag && <span className="text-white/40"> · {seedTag}</span>}
                </p>
                <h1
                    className={
                        perfect || state.champion
                            ? 'display-caps text-flame-gradient mt-3 text-5xl sm:text-6xl'
                            : 'display-caps mt-3 text-4xl sm:text-5xl'
                    }
                >
                    {headline}
                </h1>
                {subline && <p className="mt-3 font-serif italic text-white/60">{subline}</p>}
                <p
                    className="mt-4 font-mono text-xl tracking-[0.3em] text-flame-1"
                    aria-label={`${stars} out of 5 stars`}
                >
                    {'★'.repeat(stars)}
                    <span className="text-white/25">{'★'.repeat(5 - stars)}</span>
                </p>
            </div>

            <PitchView formation={formation} squad={state.squad} showRatings className="max-w-sm" />

            <dl className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 sm:grid-cols-4">
                {[
                    ['Goals', goalsFor],
                    ['Clean sheets', cleanSheets],
                    ['Avg rating', avgRating],
                    ['Best player', bestPlayer],
                ].map(([label, value]) => (
                    <div key={label} className="bg-obsidian p-4 text-center">
                        <dt className="caption-mono text-white/50">{label}</dt>
                        <dd className="mt-2 truncate font-mono text-lg text-white">{value}</dd>
                    </div>
                ))}
            </dl>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                    size="xl"
                    variant="flame"
                    className="flex-1"
                    onClick={handleShare}
                    disabled={status === 'working'}
                >
                    {status === 'working'
                        ? 'Building card…'
                        : status === 'copied'
                          ? 'Saved · text copied'
                          : 'Share your run'}
                </Button>
                <Button
                    size="xl"
                    variant="outline"
                    className="flex-1"
                    onClick={() => dispatch({ type: 'reset' })}
                >
                    Run it back
                </Button>
            </div>
        </div>
    );
}
