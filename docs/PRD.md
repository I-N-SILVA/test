# PRD: World Cup Draft Challenge — "48-0" (Working Title)

A fan draft game where you build the ultimate FIFA World Cup 2026 XI from historical World Cup players and simulate the group stage + knockout rounds.

## 1. Product Overview

### Vision

An unofficial, browser-first fan game that lets football fans spin a wheel to draft legendary World Cup players across all eras (1930–2026), build an XI, and simulate a 7-match World Cup run — mirroring the addictive loop of 38-0 but themed entirely around the World Cup. The title "48-0" references the 48-team 2026 World Cup format.

### Problem Statement

With the 2026 World Cup currently underway, fan engagement tools are exploding — FIFA Fantasy, ESPN Predictor, Yahoo Pick'Em — but none offer the roguelike draft + simulate format that made 38-0 viral. There is a white space for a casual, shareable, World Cup-specific draft game.

### Target Audience

- Football fans aged 16–40 globally
- World Cup casual viewers who don't play FPL/fantasy seriously
- Content creators and streamers looking for shareable format
- Football Twitter/TikTok/Reddit communities

## 2. Core Game Loop

```
START → Pick Formation → Spin Wheel (Nation) → Pick Player → Fill XI → Simulate 7 Matches → Share Result
```

1. Pick your formation (4-3-3, 4-4-2, 3-5-2, etc.)
2. Spin the wheel — lands on a random national team from World Cup history
3. Pick one player from that nation's World Cup squad (from that era's best-rated season)
4. Repeat until all 11 positions are filled
5. Simulate 7 World Cup matches (Group Stage × 3 → Round of 32 → R16 → QF → SF → Final)
6. Share your final score card

## 3. Goals & Success Metrics

| Metric | Target (30 days post-launch) |
| --- | --- |
| Unique Sessions | 50,000 |
| Avg. Session Duration | 4+ minutes |
| Share Rate | >20% of completed runs |
| Return Rate (D7) | >25% |
| Viral Coefficient | >1.2 (shares per user) |

## 4. Feature Specifications

### 4.1 Onboarding / Landing Screen

- Bold hero title ("48-0" or branded name)
- Tagline: "Draft World Cup legends. Win the whole thing."
- Key stats visible: e.g. "48 Nations · 2,000+ Player Seasons · 1930–2026"
- CTA: Start New Run button
- Secondary CTA: Share / View Leaderboard
- No login required for first run (frictionless)

### 4.2 Game Setup Screen

**Formation Picker**

- Clickable formation grid with pitch preview
- Options: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1
- Each formation shows position bubbles on a mini pitch

**Difficulty**

- Easy — 3 rerolls, player ratings visible
- Normal — 1 reroll, ratings visible
- Legend — 0 rerolls, ratings hidden (trust your gut)

**Era Filter (optional toggle)**

- All Eras (default)
- Classic: 1930–1990
- Modern: 1990–2010
- Contemporary: 2010–2026

**Draft Mode**

- Nation First — spin lands on a nation, then pick from their players
- Position First — pick the position slot first, then spin for a nation that has someone for it

### 4.3 Spin Wheel / Draft Mechanic

**The Spin**

- Animated wheel containing all 48 nations (or subset from a chosen era)
- Nations weighted by: number of World Cup appearances (Brazil/Germany/Italy appear more frequently)
- 3-second spin animation with sound effect
- Lands on a nation → flag pops up with name

**Player Selection Panel**

- Shows 3–5 players from that nation's best World Cup squad for the relevant era
- Each player card displays: Name + Position, Nation Flag + Year, Overall Rating (if ratings ON), key World Cup stat (goals, assists, clean sheets), era badge (e.g. "1994 Brazil")
- One-click to pick → player slots into the pitch

**Reroll System**

- "Re-spin" button consumes one reroll token
- Lands on a different nation
- Tokens displayed visibly in the UI

**Position Validation**

- You cannot place a ST into a GK slot
- Flexible: can place CM in CDM/CAM slot (with warning)
- Nearest-match suggestion if mismatched

### 4.4 Team Builder / Pitch View

- Interactive pitch (top-down view, green field)
- Position bubbles show player name + rating once drafted
- Visual indication of empty slots
- Progress bar: "8/11 players drafted"
- Bench: optional 3-player bench (subs for simulation)
- Team chemistry indicator (players from same era or nation get bonus)

### 4.5 Simulation Engine

**Match Engine (stateless, weighted random)** — each match simulates against a procedurally generated opponent:

| Round | Opponent rating |
| --- | --- |
| Group Stage (1–3) | 55–70 |
| Round of 32 | 65–75 |
| Round of 16 | 70–80 |
| Quarter-Final | 75–85 |
| Semi-Final | 80–88 |
| Final | 82–90 |

**Simulation formula (per match)**

```
Your_Score = Σ(player_ratings) × formation_bonus × era_chemistry_bonus × RNG(0.85–1.15)
Opponent_Score = opponent_difficulty × RNG(0.80–1.20)
If Your_Score > Opponent_Score → Win
Within 5% → Draw (go to pens in knockouts)
Else → Loss (run ends)
```

**Match Result UI**

- Animated scoreline reveal (e.g. "3–1")
- Random goal scorer shown from your squad
- Short flavour text: "Ronaldo fires you into the Quarter Finals!"
- Man of the Match highlight card
- Continue → Next Match

**Run ends when:** you lose a group stage match and fail to qualify, OR you lose any knockout match (no second chances).

**Perfect Run: 48-0 Badge** — awarded only if you win all matches without conceding (extremely rare — sharable trophy).

### 4.6 Results / End Screen

- Final scoreline summary (e.g. "Round of 16 Exit: 1–2 vs Brazil")
- Full XI displayed on pitch with ratings
- Run stats: Total Goals, Clean Sheets, Best Player, Avg Rating
- Star Rating: 1–5 stars based on how far you got
- Share Card — auto-generated image: your XI on a pitch, run result + badge, "Can you go 48-0?" tagline, game URL watermark
- Share to: Twitter/X, WhatsApp, Copy Image
- CTAs: Try Again | View Leaderboard | Share

### 4.7 Leaderboard (V2 / Post-MVP)

- Global leaderboard of "furthest run" + "fewest goals conceded"
- Filter by: era, nation used most, formation
- User creates a handle (no full account needed — cookie-based)

## 5. Data Model

**Players dataset** — each entry:

```json
{
    "id": "pele-1970",
    "name": "Pelé",
    "nation": "Brazil",
    "position": ["ST"],
    "world_cup_year": 1970,
    "overall_rating": 97,
    "goals": 4,
    "assists": 1,
    "clean_sheets": null,
    "era": "classic",
    "image_url": "...",
    "fun_fact": "Scored the 100th World Cup goal"
}
```

Minimum viable dataset: 48 nations × ~15 players per squad = ~720 player entries, covering at minimum 1966, 1970, 1982, 1986, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026.

Sources for ratings: historical FIFAIndex.com data, Wikipedia World Cup squads, community-curated ratings.

**Simulation state** (client-side, no DB for MVP): all game state lives in localStorage/URL params; share cards generated client-side; no backend required for MVP.

## 6. Technical Architecture

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS (+ animations) |
| State | Client-only for MVP |
| Data | Static JSON files |
| Share Card | html2canvas or Satori (OG image generation) — Phase 2 |
| Deployment | Vercel (zero-config) |
| Analytics | Plausible or Vercel Analytics |

**Performance targets:** FCP < 1.5s, TTI < 2.5s, spin animation 60fps, share card < 2s.

## 7. Design Guidelines

- Dark theme; World Cup accents: Gold (#FFD700), white, deep red
- Typography: bold display font for numbers/scores (Bebas Neue), clean sans for body
- Pitch: top-down, clean grass texture; nation flags via emoji/flagcdn
- Animations: ease-out wheel deceleration, slide-up card reveals, ticker score reveal, confetti on goals
- Mobile-first: thumb-reach interactions, centred tap-to-spin wheel

## 8. Monetisation (Post-MVP)

| Model | Description |
| --- | --- |
| Extra rerolls | Free users get 1 reroll; pay £0.99 for 3 more per run |
| Remove ads | £1.99/month (if ads implemented) |
| Premium modes | "All-Time World Cup XI" mode — £2.99 unlock |
| Sponsorship | Football data providers or affiliates |
| Tip jar | Ko-fi link on results screen |

MVP is 100% free — monetise only after validating engagement.

## 9. Phased Roadmap

**Phase 1 — MVP (2–3 weeks):** static dataset (top nations), formation picker, spin wheel, player picker, pitch builder, simulation engine, results screen, share card, deploy on Vercel.

**Phase 2 — Growth (4–6 weeks post-launch):** full 48-nation dataset, era filter, difficulty modes, leaderboard (Supabase), cookie-based handles, PWA, SEO/OG tags.

**Phase 3 — Retention (2–3 months):** Daily Challenge (shared spin seed), Rivals comparisons, achievement badges, X bot for notable runs.

## 10. Key Differentiators

| Feature | 48-0 | FIFA Fantasy | ESPN Predictor | 38-0 |
| --- | --- | --- | --- | --- |
| Historical players | ✅ | ❌ | ❌ | ✅ |
| Spin wheel mechanic | ✅ | ❌ | ❌ | ✅ |
| No account required | ✅ | ❌ | ❌ | ✅ |
| World Cup themed | ✅ | ✅ | ✅ | ❌ |
| Shareable run card | ✅ | ⚠️ | ⚠️ | ✅ |
| Roguelike loop | ✅ | ❌ | ❌ | ✅ |

## 11. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| FIFA IP issues | Label clearly as "Unofficial Fan Game"; avoid official FIFA logos/marks |
| Player image rights | Use illustrated silhouettes or text-only cards initially |
| Data accuracy | Community-driven corrections via GitHub Issues |
| Simulation feels unfair | Show simulation formula to users; add seed-sharing for reproducibility |
| Low shareability | A/B test share card designs; add "48-0 Challenge" viral hook text |
