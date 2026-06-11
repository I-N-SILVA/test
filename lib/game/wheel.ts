import nationsData from '@/data/nations.json';
import playersData from '@/data/players.json';
import type { EraFilter, FormationSlot, Nation, Player, RunState } from './types';

export const NATIONS = nationsData as Nation[];
export const PLAYERS = playersData as Player[];

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

/** Players from a nation that fit at least one open slot and aren't drafted yet. */
export function eligiblePlayers(
    nationName: string,
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
): Player[] {
    const open = openSlots(slots, state.squad);
    const draftedIds = new Set(Object.values(state.squad).map((p) => p.id));
    return PLAYERS.filter(
        (p) =>
            p.nation === nationName &&
            !draftedIds.has(p.id) &&
            matchesEra(p, state.eraFilter) &&
            open.some((s) => playerFitsSlot(p, s)),
    )
        .sort((a, b) => b.overall_rating - a.overall_rating)
        .slice(0, 5);
}

/** Nations that can still offer at least one eligible player. */
export function spinnableNations(
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
    excludeNation?: string | null,
): Nation[] {
    return NATIONS.filter(
        (n) => n.name !== excludeNation && eligiblePlayers(n.name, slots, state).length > 0,
    );
}

/** Weighted random spin — nations with more World Cup appearances come up more often. */
export function spinWheel(
    slots: FormationSlot[],
    state: Pick<RunState, 'squad' | 'eraFilter'>,
    excludeNation?: string | null,
): Nation | null {
    const pool = spinnableNations(slots, state, excludeNation);
    if (pool.length === 0) return null;
    const total = pool.reduce((sum, n) => sum + n.appearances, 0);
    let roll = Math.random() * total;
    for (const nation of pool) {
        roll -= nation.appearances;
        if (roll <= 0) return nation;
    }
    return pool[pool.length - 1];
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
