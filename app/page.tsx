import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NATIONS, PLAYERS } from '@/lib/game/wheel';

export default function LandingPage() {
    const years = PLAYERS.map((p) => p.world_cup_year);
    const stats = [
        [`${NATIONS.length} Nations`, 'and growing to all 48'],
        [`${PLAYERS.length}+ Player Seasons`, `${Math.min(...years)}–2026 covered`],
        ['8 Matches', 'group stage to the final'],
    ];

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.12),transparent_60%)]"
            />

            <div className="relative text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Unofficial fan game
                </p>
                <h1 className="text-gold-gradient font-display text-8xl sm:text-9xl">48-0</h1>
                <p className="mt-4 max-w-md text-lg text-muted-foreground">
                    Draft World Cup legends. Win the whole thing.
                </p>
            </div>

            <div className="relative grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map(([title, sub]) => (
                    <div key={title} className="rounded-xl border border-border bg-card/60 p-4 text-center">
                        <p className="font-display text-2xl text-primary-main">{title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                    </div>
                ))}
            </div>

            <div className="relative flex flex-col items-center gap-3">
                <Button
                    asChild
                    size="xl"
                    className="bg-gold-gradient px-12 font-display text-2xl uppercase text-black hover:opacity-90"
                >
                    <Link href="/game">Start new run</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                    No account needed · spin the wheel · build your XI · survive 8 matches
                </p>
            </div>

            <footer className="relative text-center text-[11px] text-muted-foreground">
                <p>
                    Unofficial fan project. Not affiliated with or endorsed by FIFA. Player data is
                    community-curated.
                </p>
            </footer>
        </main>
    );
}
