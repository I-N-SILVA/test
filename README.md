# Perfect Run

An unofficial, browser-first fan game: spin the wheel, draft legendary World Cup players
(1930-2026), build your ultimate XI and simulate a full 2026-format World Cup run.
Three group matches, then Round of 32 to the Final. Win all 8 without conceding and you
have done **the Perfect Run**.

> Unofficial fan project. Not affiliated with or endorsed by FIFA.

## Game loop

```
START → Pick Formation → Spin Wheel (Nation) → Pick Player → Fill XI → Simulate 8 Matches → Share
```

- **Formations:** 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1
- **Difficulty:** Easy (3 rerolls), Normal (1), Legend (0 rerolls)
- **Blind mode:** hide ratings during the draft, independent of difficulty
- **Era filter:** Classic (to 1990), Modern (1990-2010), Contemporary (2010-2026)
- **Modes:** Free play (random seed) or the **Daily Challenge** — everyone gets
  the same wheel and the same opponents each day, so runs are directly comparable
- The wheel is weighted by World Cup appearances; Brazil and Germany come up more often
- **Chemistry** rewards nation-stacking strongly and shared eras weakly — it's a
  genuine risk/reward lever, not a flat bonus
- **Line-based simulation:** your attack (forwards + midfield) drives goals scored,
  your defence + goalkeeper drives clean sheets, so squad shape and formation matter

## Seeds & sharing

Every run derives from a single seed via a deterministic PRNG (mulberry32), so a
run can be persisted mid-flight and replayed exactly. The results screen renders a
shareable run-card PNG client-side (no dependencies) and, where the seed is known,
a `?seed=` deep link a friend can open to play the identical run.

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS 3** themed with the **PLYAZ Design System ("Kinetic Order")**:
  obsidian + flame palette, General Sans / Playfair Display / JetBrains Mono,
  square surfaces with hairline rules, pill actions, expo easing.
  Paper (light) landing page, ink (dark) game screens.
- **Client-only state** (React context + reducer, persisted to `localStorage`); no backend
- Static JSON datasets in `data/` (`players.json`, `nations.json`)

## Develop

```bash
npm install
npm run dev        # http://localhost:6048
npm run typecheck
npm test           # Vitest — engine, RNG and wheel logic
npm run build
```

## Project structure

```
app/            landing page + /game flow
components/ui   PLYAZ-themed primitives (button, badge, card)
components/game SpinWheel, PitchView, PlayerCard, screens per phase
lib/game/       types, formations, wheel logic, simulation engine, store
                rng.ts (seeded PRNG), shareCard.ts (canvas run-card)
lib/game/*.test.ts  Vitest coverage for the engine, RNG and wheel
data/           players.json (100 legends, 12 nations), nations.json
docs/PRD.md     full product requirements document
```

## Dataset

MVP ships 12 nations with roughly 8 player-seasons each (1950-2022). Ratings and stats
are community-curated; corrections welcome via GitHub Issues. Phase 2 grows this to all
48 qualified nations per the PRD.

## Roadmap

See [docs/PRD.md](docs/PRD.md). Phase 2 adds the full dataset, leaderboard (Supabase),
shareable run-card images and PWA install.
