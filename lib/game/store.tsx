'use client';

import * as React from 'react';
import { getFormation } from './formations';
import { simulateMatch, isRunOver, isChampion, ROUNDS } from './engine';
import { createRng, randomSeed } from './rng';
import type {
    Confederation,
    Difficulty,
    EraFilter,
    GameMode,
    Player,
    RunState,
    SpinMode,
} from './types';

const STORAGE_KEY = 'perfect_run_v3';

export const REROLLS_BY_DIFFICULTY: Record<Difficulty, number> = {
    easy: 3,
    normal: 1,
    legend: 0,
};

/** Double-or-nothing tokens granted at the start of every run. */
export const GAMBLES_PER_RUN = 2;

const initialState: RunState = {
    phase: 'setup',
    formationId: '4-3-3',
    difficulty: 'normal',
    eraFilter: 'all',
    showRatings: true,
    mode: 'free',
    seed: 0,
    seedLabel: '',
    rngState: 0,
    spinMode: 'uniform',
    squad: {},
    rerolls: 1,
    gambles: GAMBLES_PER_RUN,
    spunConfederation: null,
    spunNation: null,
    matches: [],
    eliminated: false,
    champion: false,
};

type Action =
    | {
          type: 'configure';
          formationId: string;
          difficulty: Difficulty;
          eraFilter: EraFilter;
          showRatings: boolean;
          mode: GameMode;
          seed: number;
          seedLabel: string;
          spinMode: SpinMode;
      }
    | { type: 'spunConfederation'; confederation: Confederation; rngState: number }
    | { type: 'spun'; nation: string; rngState: number }
    | { type: 'reroll'; nation: string; rngState: number }
    | { type: 'pick'; player: Player; slotId: string }
    | { type: 'gamble'; player: Player; slotId: string; rngState: number }
    | { type: 'startSim' }
    | { type: 'playMatch' }
    | { type: 'finish' }
    | { type: 'reset' }
    | { type: 'hydrate'; state: RunState };

function reducer(state: RunState, action: Action): RunState {
    switch (action.type) {
        case 'configure':
            return {
                ...initialState,
                phase: 'draft',
                formationId: action.formationId,
                difficulty: action.difficulty,
                eraFilter: action.eraFilter,
                showRatings: action.showRatings,
                mode: action.mode,
                seed: action.seed,
                seedLabel: action.seedLabel,
                rngState: action.seed,
                spinMode: action.spinMode,
                rerolls: REROLLS_BY_DIFFICULTY[action.difficulty],
                gambles: GAMBLES_PER_RUN,
            };
        case 'spunConfederation':
            return {
                ...state,
                spunConfederation: action.confederation,
                rngState: action.rngState,
            };
        case 'spun':
            return { ...state, spunNation: action.nation, rngState: action.rngState };
        case 'reroll':
            return {
                ...state,
                spunNation: action.nation,
                rngState: action.rngState,
                rerolls: Math.max(0, state.rerolls - 1),
            };
        case 'pick': {
            const squad = { ...state.squad, [action.slotId]: action.player };
            const full = Object.keys(squad).length >= getFormation(state.formationId).slots.length;
            return {
                ...state,
                squad,
                spunNation: null,
                spunConfederation: null,
                phase: full ? 'sim' : 'draft',
            };
        }
        case 'gamble': {
            if (state.gambles <= 0 || state.squad[action.slotId]) return state;
            const squad = { ...state.squad, [action.slotId]: action.player };
            const full = Object.keys(squad).length >= getFormation(state.formationId).slots.length;
            return {
                ...state,
                squad,
                gambles: state.gambles - 1,
                rngState: action.rngState,
                spunNation: null,
                spunConfederation: null,
                phase: full ? 'sim' : 'draft',
            };
        }
        case 'playMatch': {
            if (state.eliminated || state.matches.length >= ROUNDS.length) return state;
            const formation = getFormation(state.formationId);
            const players = Object.values(state.squad);
            const rng = createRng(state.rngState);
            const result = simulateMatch(rng, players, formation, ROUNDS[state.matches.length]);
            const matches = [...state.matches, result];
            const eliminated = isRunOver(matches);
            const champion = isChampion(matches);
            return {
                ...state,
                matches,
                rngState: rng.state(),
                eliminated,
                champion,
                phase: eliminated || champion ? 'sim' : state.phase,
            };
        }
        case 'finish':
            return { ...state, phase: 'results' };
        case 'reset':
            return { ...initialState };
        case 'hydrate':
            return { ...initialState, ...action.state };
        default:
            return state;
    }
}

const GameContext = React.createContext<{
    state: RunState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const hydrated = React.useRef(false);

    React.useEffect(() => {
        if (hydrated.current) return;
        hydrated.current = true;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) dispatch({ type: 'hydrate', state: JSON.parse(raw) as RunState });
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    React.useEffect(() => {
        if (!hydrated.current) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Storage full or unavailable — the run simply won't persist.
        }
    }, [state]);

    return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = React.useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within GameProvider');
    return ctx;
}
