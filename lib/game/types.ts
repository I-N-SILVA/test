export type Position = 'GK' | 'RB' | 'CB' | 'LB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';

export type Era = 'classic' | 'modern' | 'contemporary';

export interface Player {
    id: string;
    name: string;
    nation: string;
    position: Position[];
    world_cup_year: number;
    overall_rating: number;
    goals?: number;
    assists?: number;
    clean_sheets?: number;
    era: Era;
    fun_fact?: string;
}

export interface Nation {
    id: string;
    name: string;
    flag: string;
    /** World Cup appearances — used as wheel weighting. */
    appearances: number;
}

export interface FormationSlot {
    id: string;
    label: string;
    /** Positions this slot accepts (first entry = natural position). */
    accepts: Position[];
    /** Pitch coordinates in % — x: 0 left → 100 right, y: 0 own goal → 100 attack. */
    x: number;
    y: number;
}

export interface Formation {
    id: string;
    name: string;
    bonus: number;
    slots: FormationSlot[];
}

export type Difficulty = 'easy' | 'normal' | 'legend';

export type EraFilter = 'all' | Era;

export interface MatchResult {
    round: string;
    opponent: string;
    opponentFlag: string;
    opponentRating: number;
    goalsFor: number;
    goalsAgainst: number;
    outcome: 'win' | 'draw' | 'loss';
    wonOnPens?: boolean;
    scorers: string[];
    motm: string;
    flavour: string;
}

export type GameMode = 'free' | 'daily';

export interface RunState {
    phase: 'setup' | 'draft' | 'sim' | 'results';
    formationId: string;
    difficulty: Difficulty;
    eraFilter: EraFilter;
    /** Blind mode: when false, player overalls stay hidden during the draft. */
    showRatings: boolean;
    /** Free play (random seed) or the shared Daily Challenge seed. */
    mode: GameMode;
    /** Seed the whole run derives from — wheel spins and match sim alike. */
    seed: number;
    /** Human label for the seed, e.g. the daily date. */
    seedLabel: string;
    /** Live PRNG state, advanced on every spin and simulated match. */
    rngState: number;
    /** slot id → player */
    squad: Record<string, Player>;
    rerolls: number;
    /** Nation currently on the wheel (after a spin), pending player pick. */
    spunNation: string | null;
    matches: MatchResult[];
    eliminated: boolean;
    champion: boolean;
}
