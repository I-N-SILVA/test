import nationsData from '@/data/nations.json';
import playersData from '@/data/players.json';
import type {
    Confederation,
    EraFilter,
    FormationSlot,
    Nation,
    Player,
    RunState,
    SpinMode,
} from './types';
import { createRng, type Rng } from './rng';

export const NATIONS = nationsData as Nation[];
export const PLAYERS = playersData as Player[];

/** Confederation wheel order (first stage of the two-stage spin). */
export const CONFEDERATIONS: Confederation[] = [
    'UEFA',
    'CONMEBOL',
    'CONCACAF',
    'CAF',
    'AFC',
    'OFC',
];

/** How many players a landed nation offers in the picker. */
export const CANDIDATE_LIMIT = 8;

export function getNation(name: string): Nation | undefined {
    return NATIONS.find((n) => n.name === name);
}

function matchesEra(player: Player, era: EraFilter): boolean {
    return era === 'all' || player.era === era;
}

function playerFitsSlot(player: Player, slot: FormationSlot): boolean {
    return player.position.some((p) => slot.accepts.includes(p));
}

export function openSlots(slots: FormationSlot[], squad: RunState['squad']): FormationSlot[] {
    return slots.filter((s) => !squad[s.id]);
}

/** The slot a position-first spin targets: the first still-open slot. */
export function nextOpenSlot(
    slots: FormationSlot[],
    squad: RunState['squad'],
): FormationSlot | null {
    return openSlots(slots, squad)[0] ?? null;
}

export interface EligibleOpts {
    /** Restrict to players who fit this specific slot (position-first mode). */
    slotId?: string | null;
    /** Cap the returned list (defaults to CANDIDATE_LIMIT). */
    limit?: number;
}

/** Players from a nation that fit at least one relevant slot and aren't drafted yet. */
export function eligiblePlayers(
    nationName: string,
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
    opts: EligibleOpts = {},
): Player[] {
    const open = openSlots(slots, state.squad);
    const targets = opts.slotId ? open.filter((s) => s.id === opts.slotId) : open;
    const draftedIds = new Set(Object.values(state.squad).map((p) => p.id));
    return PLAYERS.filter(
        (p) =>
            p.nation === nationName &&
            !draftedIds.has(p.id) &&
            matchesEra(p, state.eraFilter) &&
            targets.some((s) => playerFitsSlot(p, s)),
    )
        .sort((a, b) => b.overall_rating - a.overall_rating)
        .slice(0, opts.limit ?? CANDIDATE_LIMIT);
}

export interface PoolOpts {
    excludeNation?: string | null;
    confederation?: Confederation | null;
    slotId?: string | null;
}

/** Nations that can still offer at least one eligible player (with optional filters). */
export function spinnableNations(
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
    opts: PoolOpts = {},
): Nation[] {
    return NATIONS.filter(
        (n) =>
            n.name !== opts.excludeNation &&
            (!opts.confederation || n.confederation === opts.confederation) &&
            eligiblePlayers(n.name, slots, state, { slotId: opts.slotId, limit: 1 }).length > 0,
    );
}

/** Confederations that still have at least one spinnable nation. */
export function spinnableConfederations(
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
): Confederation[] {
    const live = new Set(spinnableNations(slots, state).map((n) => n.confederation));
    return CONFEDERATIONS.filter((c) => live.has(c));
}

/** Pick one nation from a pool: weighted by appearances, or uniform. */
function pickNation(rng: Rng, pool: Nation[], weighted: boolean): Nation | null {
    if (pool.length === 0) return null;
    if (!weighted) return rng.pick(pool);
    const total = pool.reduce((sum, n) => sum + n.appearances, 0);
    let roll = rng.next() * total;
    for (const nation of pool) {
        roll -= nation.appearances;
        if (roll <= 0) return nation;
    }
    return pool[pool.length - 1];
}

export interface SpinResult {
    nation: Nation;
    /** PRNG state to persist after this spin, keeping the run deterministic. */
    rngState: number;
}

export interface ConfederationSpinResult {
    confederation: Confederation;
    rngState: number;
}

export interface GambleResult {
    player: Player;
    slotId: string;
    rngState: number;
}

type SpinState = Pick<RunState, 'squad' | 'eraFilter' | 'rngState'>;

export interface SpinOpts {
    mode: SpinMode;
    excludeNation?: string | null;
    /** Required in confederation mode: the confederation already landed. */
    confederation?: Confederation | null;
    /** Required in position mode: the slot being filled. */
    slotId?: string | null;
}

/**
 * Deterministic nation spin from the run's live PRNG state. Pure: it reads
 * `rngState` without mutating `state`, so a component can peek the result, play
 * its animation, then commit the new `rngState` on landing.
 */
export function rollNation(
    state: SpinState,
    slots: FormationSlot[],
    opts: SpinOpts,
): SpinResult | null {
    const rng = createRng(state.rngState);
    const pool = spinnableNations(slots, state, {
        excludeNation: opts.excludeNation,
        confederation: opts.mode === 'confederation' ? opts.confederation : null,
        slotId: opts.mode === 'position' ? opts.slotId : null,
    });
    // Only the "Realistic" mode keeps appearance-weighting; everything else is
    // uniform for maximum variety. The confederation/nation second stage is
    // uniform within the chosen confederation.
    const nation = pickNation(rng, pool, opts.mode === 'weighted');
    if (!nation) return null;
    return { nation, rngState: rng.state() };
}

/** First stage of the two-stage spin: land a confederation (uniform). */
export function rollConfederation(
    state: SpinState,
    slots: FormationSlot[],
): ConfederationSpinResult | null {
    const rng = createRng(state.rngState);
    const pool = spinnableConfederations(slots, state);
    if (pool.length === 0) return null;
    return { confederation: rng.pick(pool), rngState: rng.state() };
}

/**
 * Double-or-nothing: auto-draft a uniformly random eligible player from the
 * entire pool into a fitting slot. Could be a 98 or a 72 — that's the gamble.
 */
export function rollGamble(state: SpinState, slots: FormationSlot[]): GambleResult | null {
    const rng = createRng(state.rngState);
    const open = openSlots(slots, state.squad);
    const draftedIds = new Set(Object.values(state.squad).map((p) => p.id));
    const pool = PLAYERS.filter(
        (p) =>
            !draftedIds.has(p.id) &&
            matchesEra(p, state.eraFilter) &&
            open.some((s) => playerFitsSlot(p, s)),
    );
    if (pool.length === 0) return null;
    const player = rng.pick(pool);
    const fitting = open.filter((s) => playerFitsSlot(player, s));
    const natural = fitting.find((s) => s.accepts[0] === player.position[0]) ?? fitting[0];
    return { player, slotId: natural.id, rngState: rng.state() };
}

/** Open slots a given player can be placed into. */
export function fittingSlots(
    player: Player,
    slots: FormationSlot[],
    squad: RunState['squad'],
): FormationSlot[] {
    return openSlots(slots, squad).filter((s) => playerFitsSlot(player, s));
}

/** Prefer the slot whose natural position matches the player's first position. */
export function bestSlotFor(
    player: Player,
    slots: FormationSlot[],
    squad: RunState['squad'],
): FormationSlot | null {
    const fitting = fittingSlots(player, slots, squad);
    if (fitting.length === 0) return null;
    const natural = fitting.find((s) => s.accepts[0] === player.position[0]);
    return natural ?? fitting[0];
}
