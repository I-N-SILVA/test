import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NATIONS, PLAYERS } from '@/lib/game/wheel';

const HOW_TO_PLAY = [
    {
        step: '01',
        title: 'Spin the wheel',
        body: 'Every spin lands on a real World Cup nation, weighted by tournament appearances. Brazil shows up more than Wales. That is football.',
    },
    {
        step: '02',
        title: 'Draft a legend',
        body: 'Pick one player from that nation and slot them into your formation. Pele or Ronaldo? Maldini or Marcelo? Your call.',
    },
    {
        step: '03',
        title: 'Build your XI',
        body: 'Repeat until all eleven positions are filled. Chemistry rewards players who share a nation or an era.',
    },
    {
        step: '04',
        title: 'Run the World Cup',
        body: 'Simulate all 8 matches of the 2026 format, three group games then Round of 32 to the Final. Win them all, concede nothing, and you have done it.',
    },
];

const CHALLENGES = [
    'Win the World Cup',
    'Win all 8 matches',
    'The Perfect Run: 8 wins, 0 conceded',
    'Survive Legend mode with ratings hidden',
    'Build a one-era XI: Classic, Modern or Contemporary',
    'Win it with a back five',
];

const FAQS = [
    {
        q: 'What is Perfect Run?',
        a: 'A free, browser-based fan game. You draft an all-time World Cup XI from legends spanning 1930 to 2026, then simulate a full run through the 2026 tournament format. The Perfect Run is the holy grail: 8 wins from 8 matches without conceding a single goal.',
    },
    {
        q: 'Is it free? Do I need an account?',
        a: 'Completely free, no account, no download. Your run is saved locally in your browser so you can close the tab and come back.',
    },
    {
        q: 'Where do the ratings come from?',
        a: 'Ratings and stats are community-curated, per player per World Cup year, so a 2002 Ronaldo and a 1998 Ronaldo are different cards. Disagree with a rating? That is half the fun. Corrections welcome on GitHub.',
    },
    {
        q: 'Is this affiliated with FIFA?',
        a: 'No. Perfect Run is an independent fan-made game. It is not affiliated with, endorsed by or associated with FIFA, any federation, club or ratings provider. No official logos, crests or player images are used.',
    },
];

export default function LandingPage() {
    const years = PLAYERS.map((p) => p.world_cup_year);
    const stats: [string, string][] = [
        [`${NATIONS.length}`, 'World Cup nations on the wheel'],
        [`${PLAYERS.length}+`, `player seasons, ${Math.min(...years)} to 2026`],
        ['8', 'matches between you and history'],
    ];

    return (
        <div className="bg-paper text-obsidian">
            {/* Nav */}
            <header className="border-b border-black/10">
                <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <span className="text-lg font-bold uppercase tracking-display">
                        Perfect<span className="text-flame-2">.</span>Run
                    </span>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/game"
                            className="caption-mono text-graphite transition-colors hover:text-flame-2"
                        >
                            Play
                        </Link>
                        <a
                            href="https://github.com/I-N-SILVA/test/issues"
                            className="caption-mono hidden text-graphite transition-colors hover:text-flame-2 sm:block"
                        >
                            Feedback
                        </a>
                        <Button asChild variant="flame" size="sm">
                            <Link href="/game">Start a run</Link>
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <section className="bg-grid-paper border-b border-black/10">
                <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
                    <p className="caption-mono text-stone">Unofficial fan draft game · 1930–2026</p>
                    <h1 className="display-caps mt-6 text-6xl sm:text-8xl lg:text-9xl">
                        The <span className="serif-accent normal-case">perfect</span>
                        <br />
                        run.
                    </h1>
                    <p className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal">
                        Spin the wheel. Draft World Cup legends. Simulate all 8 matches of a 2026
                        World Cup. Win every one of them and concede nothing, and you join the club
                        that does not exist yet.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <Button asChild variant="flame" size="xl">
                            <Link href="/game">Start a new run →</Link>
                        </Button>
                        <p className="caption-mono text-stone">No account · saves in your browser</p>
                    </div>
                </div>
            </section>

            {/* Stat strip */}
            <section className="border-b border-black/10">
                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {stats.map(([value, label]) => (
                        <div key={label} className="px-4 py-8 sm:px-8">
                            <p className="display-caps text-5xl">{value}</p>
                            <p className="caption-mono mt-2 text-graphite">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* What is it */}
            <section className="border-b border-black/10 bg-paperwarm">
                <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_2fr]">
                    <p className="caption-mono text-stone">What is Perfect Run?</p>
                    <div className="space-y-5 text-lg leading-relaxed text-charcoal">
                        <p>
                            Perfect Run is a World Cup draft game and squad builder. The wheel
                            decides which nation you draft from, you decide who makes the XI. Mix a
                            1970 Brazilian with a 2014 German and a 2022 Argentine, then find out
                            if the chemistry holds when the knockouts start.
                        </p>
                        <p>
                            Inspired by the 82-0 and 38-0 family of perfect-season games, this one
                            asks the international version of the question: not whether you can win
                            the World Cup, but whether you can win it{' '}
                            <span className="font-serif italic">perfectly</span>.
                        </p>
                    </div>
                </div>
            </section>

            {/* How to play */}
            <section className="border-b border-black/10">
                <div className="mx-auto w-full max-w-6xl px-4 py-16">
                    <p className="caption-mono text-stone">How to play</p>
                    <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
                        {HOW_TO_PLAY.map(({ step, title, body }) => (
                            <div key={step} className="bg-paper p-6">
                                <p className="font-mono text-sm text-flame-2">{step}</p>
                                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-graphite">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Challenges */}
            <section className="border-b border-black/10 bg-paperwarm">
                <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_2fr]">
                    <p className="caption-mono text-stone">Popular challenges</p>
                    <ul className="divide-y divide-black/10">
                        {CHALLENGES.map((c) => (
                            <li key={c} className="flex items-baseline gap-4 py-3 text-lg">
                                <span aria-hidden className="font-mono text-xs text-flame-2">
                                    ▸
                                </span>
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-b border-black/10">
                <div className="mx-auto w-full max-w-6xl px-4 py-16">
                    <p className="caption-mono text-stone">Questions</p>
                    <div className="mt-6 divide-y divide-black/10">
                        {FAQS.map(({ q, a }) => (
                            <details key={q} className="group py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">
                                    {q}
                                    <span
                                        aria-hidden
                                        className="font-mono text-stone transition-transform duration-300 ease-expo group-open:rotate-45"
                                    >
                                        +
                                    </span>
                                </summary>
                                <p className="mt-3 max-w-3xl leading-relaxed text-graphite">{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA, on ink */}
            <section className="dark bg-obsidian bg-grid-ink text-white">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-20">
                    <h2 className="display-caps text-4xl sm:text-6xl">
                        8 wins. 0 conceded.
                        <br />
                        <span className="serif-accent normal-case">Still think it&apos;s easy?</span>
                    </h2>
                    <Button asChild variant="flame" size="xl">
                        <Link href="/game">Draft your XI →</Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-obsidian text-white/60">
                <div className="mx-auto w-full max-w-6xl space-y-6 border-t border-white/15 px-4 py-10">
                    <div className="flex flex-wrap items-center gap-6">
                        <span className="text-sm font-bold uppercase tracking-display text-white">
                            Perfect<span className="text-flame-1">.</span>Run
                        </span>
                        <Link href="/game" className="caption-mono hover:text-white">
                            Play
                        </Link>
                        <a
                            href="https://github.com/I-N-SILVA/test/issues"
                            className="caption-mono hover:text-white"
                        >
                            Feedback &amp; bugs
                        </a>
                    </div>
                    <p className="max-w-4xl text-xs leading-relaxed">
                        Perfect Run is an independent, fan-made game. It is not affiliated with,
                        endorsed by, sponsored by, licensed by or otherwise associated with FIFA,
                        any national federation, club, competition, governing body, game publisher
                        or ratings provider. Player names, nations and statistics are used for
                        informational, descriptive and editorial purposes only. No official logos,
                        crests, player images or likenesses are used. Ratings are community
                        opinions, argued over like everything else in football.
                    </p>
                </div>
            </footer>
        </div>
    );
}
