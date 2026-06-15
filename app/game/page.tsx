'use client';

import * as React from 'react';
import Link from 'next/link';
import { GameProvider, useGame } from '@/lib/game/store';
import { isMuted, toggleMuted } from '@/lib/game/sound';
import { SetupScreen } from '@/components/game/SetupScreen';
import { DraftScreen } from '@/components/game/DraftScreen';
import { SimScreen } from '@/components/game/SimScreen';
import { ResultsScreen } from '@/components/game/ResultsScreen';

const PHASES: { id: string; label: string; short: string }[] = [
    { id: 'setup', label: 'Setup', short: 'Setup' },
    { id: 'draft', label: 'Draft', short: 'Draft' },
    { id: 'sim', label: 'Tournament', short: 'Cup' },
    { id: 'results', label: 'Full time', short: 'FT' },
];

function GameFlow() {
    const { state, dispatch } = useGame();
    const phaseIndex = PHASES.findIndex((p) => p.id === state.phase);
    const [confirmAbandon, setConfirmAbandon] = React.useState(false);
    const [muted, setMutedState] = React.useState(false);

    React.useEffect(() => setMutedState(isMuted()), []);
    const handleToggleMute = () => setMutedState(toggleMuted());

    React.useEffect(() => {
        if (!confirmAbandon) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setConfirmAbandon(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [confirmAbandon]);

    return (
        <div className="dark min-h-screen bg-obsidian bg-grid-ink text-white">
            <header className="border-b border-white/15">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-lg font-bold uppercase tracking-display text-white"
                        >
                            Perfect<span className="text-flame-1">.</span>Run
                        </Link>
                        <span aria-hidden className="hidden h-4 w-px bg-white/15 sm:block" />
                        <a
                            href="https://plyaz.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="caption-mono hidden items-center gap-1.5 text-white/40 transition-colors hover:text-white sm:flex"
                        >
                            by
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/plyaz/plyaz-wordmark.png" alt="PLYAZ" className="h-3 w-auto" />
                        </a>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <ol className="hidden items-center gap-3 sm:flex" aria-label="Game phase">
                            {PHASES.map((p, i) => (
                                <li
                                    key={p.id}
                                    className="caption-mono flex items-center gap-3"
                                    aria-current={state.phase === p.id ? 'step' : undefined}
                                >
                                    <span
                                        className={
                                            i === phaseIndex
                                                ? 'text-flame-1'
                                                : i < phaseIndex
                                                  ? 'text-white/70'
                                                  : 'text-white/30'
                                        }
                                    >
                                        {p.label}
                                    </span>
                                    {i < PHASES.length - 1 && (
                                        <span aria-hidden className="h-px w-4 bg-white/20" />
                                    )}
                                </li>
                            ))}
                        </ol>
                        <span className="caption-mono text-flame-1 sm:hidden">
                            {PHASES[phaseIndex]?.short}
                        </span>
                        <button
                            type="button"
                            onClick={handleToggleMute}
                            aria-pressed={muted}
                            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                            title={muted ? 'Sound off' : 'Sound on'}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm transition-colors hover:border-white/50"
                        >
                            <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
                        </button>
                        {state.phase !== 'setup' && (
                            <button
                                type="button"
                                onClick={() => setConfirmAbandon(true)}
                                className="caption-mono rounded-full border border-white/20 px-3 py-1.5 transition-colors hover:border-flame-3 hover:text-flame-3"
                            >
                                Abandon
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-10">
                {state.phase === 'setup' && <SetupScreen />}
                {state.phase === 'draft' && <DraftScreen />}
                {state.phase === 'sim' && <SimScreen />}
                {state.phase === 'results' && <ResultsScreen />}
            </main>

            {confirmAbandon && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="abandon-title"
                    onClick={() => setConfirmAbandon(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm animate-slide-up rounded-lg border border-white/15 bg-obsidian p-6 text-center"
                    >
                        <h2 id="abandon-title" className="text-xl font-semibold">
                            Abandon this run?
                        </h2>
                        <p className="mt-2 text-sm text-white/60">
                            Your squad and tournament progress will be lost. This can&apos;t be
                            undone.
                        </p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => setConfirmAbandon(false)}
                                className="flex-1 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white/50"
                            >
                                Keep playing
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    dispatch({ type: 'reset' });
                                    setConfirmAbandon(false);
                                }}
                                className="flex-1 rounded-full border border-flame-3 bg-flame-3/10 px-5 py-2.5 text-sm font-semibold text-flame-3 transition-colors hover:bg-flame-3 hover:text-white"
                            >
                                Abandon run
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GamePage() {
    return (
        <GameProvider>
            <GameFlow />
        </GameProvider>
    );
}
