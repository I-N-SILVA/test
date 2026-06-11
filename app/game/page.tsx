'use client';

import Link from 'next/link';
import { GameProvider, useGame } from '@/lib/game/store';
import { SetupScreen } from '@/components/game/SetupScreen';
import { DraftScreen } from '@/components/game/DraftScreen';
import { SimScreen } from '@/components/game/SimScreen';
import { ResultsScreen } from '@/components/game/ResultsScreen';

const PHASES: { id: string; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'draft', label: 'Draft' },
    { id: 'sim', label: 'Tournament' },
    { id: 'results', label: 'Full time' },
];

function GameFlow() {
    const { state, dispatch } = useGame();
    const phaseIndex = PHASES.findIndex((p) => p.id === state.phase);

    return (
        <div className="dark min-h-screen bg-obsidian bg-grid-ink text-white">
            <header className="border-b border-white/15">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <Link
                        href="/"
                        className="text-lg font-bold uppercase tracking-display text-white"
                    >
                        Perfect<span className="text-flame-1">.</span>Run
                    </Link>
                    <div className="flex items-center gap-4">
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
                            {PHASES[phaseIndex]?.label}
                        </span>
                        {state.phase !== 'setup' && (
                            <button
                                type="button"
                                onClick={() => dispatch({ type: 'reset' })}
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
