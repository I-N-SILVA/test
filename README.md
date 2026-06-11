# 48-0 — World Cup Draft Challenge

An unofficial, browser-first fan game: spin the wheel, draft legendary World Cup players
(1930–2026), build your ultimate XI and simulate a full 2026-format World Cup run —
three group matches, then Round of 32 → Final. Win everything without conceding and you
earn the near-mythical **48-0 badge**.

> Unofficial fan project. Not affiliated with or endorsed by FIFA.

## Game loop

```
START → Pick Formation → Spin Wheel (Nation) → Pick Player → Fill XI → Simulate 8 Matches → Share
```

- **Formations:** 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1
- **Difficulty:** Easy (3 rerolls), Normal (1), Legend (0 rerolls, ratings hidden)
- **Era filter:** Classic (–1990), Modern (1990–2010), Contemporary (2010–2026)
- The wheel is weighted by World Cup appearances — Brazil and Germany come up more often
- Chemistry bonus for players sharing a nation or era

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS 3** — design system ported from [PLYAZ League](https://github.com/I-N-SILVA/plyaz-league)
  ("Kinetic Order" tokens, re-themed gold/pitch-green), including its `Button`, `Badge` and
  `Card` shadcn components
- **Client-only state** (React context + reducer, persisted to `localStorage`) — no backend,
  no accounts, nothing to deploy but static pages
- Static JSON datasets in `data/` (`players.json`, `nations.json`)

## Develop

```bash
npm install
npm run dev        # http://localhost:6048
npm run typecheck
npm run build
```

## Project structure

```
app/            landing page + /game flow
components/ui   ported PLYAZ design-system primitives
components/game SpinWheel, PitchView, PlayerCard, screens per phase
lib/game/       types, formations, wheel logic, simulation engine, store
data/           players.json (100 legends, 12 nations), nations.json
docs/PRD.md     full product requirements document
```

## Dataset

MVP ships 12 nations × ~8 player-seasons (1950–2022). Ratings and stats are
community-curated — corrections welcome via GitHub Issues. Phase 2 grows this to all
48 qualified nations (~720 entries) per the PRD.

## Roadmap

See [docs/PRD.md](docs/PRD.md) — Phase 2 adds the full dataset, leaderboard (Supabase),
OG share-image generation and PWA install; Phase 3 adds Daily Challenge and Rivals.
