'use client';

import Link from 'next/link';
import { GameProvider, useGame } from '@/lib/game/store';
import { SetupScreen } from '@/components/game/SetupScreen';
import { DraftScreen } from '@/components/game/DraftScreen';
import { SimScreen } from '@/components/game/SimScreen';
import { ResultsScreen } from '@/components/game/ResultsScreen';

const PHASE_TITLES: Record<string, string> = {
    setup: 'Set up your run',
    draft: 'Draft your XI',
    sim: 'Tournament',
    results: 'Full time',
};

function GameFlow() {
    const { state, dispatch } = useGame();

    return (
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">
            <header className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-gold-gradient font-display text-3xl">
                    48-0
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {PHASE_TITLES[state.phase]}
                    </span>
                    {state.phase !== 'setup' && (
                        <button
                            type="button"
                            onClick={() => dispatch({ type: 'reset' })}
                            className="rounded-full border border-border px-3 py-1 text-xs hover:border-destructive hover:text-destructive"
                        >
                            Abandon run
                        </button>
                    )}
                </div>
            </header>

            {state.phase === 'setup' && <SetupScreen />}
            {state.phase === 'draft' && <DraftScreen />}
            {state.phase === 'sim' && <SimScreen />}
            {state.phase === 'results' && <ResultsScreen />}
        </main>
    );
}

export default function GamePage() {
    return (
        <GameProvider>
            <GameFlow />
        </GameProvider>
    );
}
