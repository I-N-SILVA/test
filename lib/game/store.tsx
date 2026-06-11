'use client';

import * as React from 'react';
import { getFormation } from './formations';
import { simulateMatch, isRunOver, isChampion, ROUNDS } from './engine';
import type { Difficulty, EraFilter, Player, RunState } from './types';

const STORAGE_KEY = 'perfect_run_v1';

export const REROLLS_BY_DIFFICULTY: Record<Difficulty, number> = {
    easy: 3,
    normal: 1,
    legend: 0,
};

const initialState: RunState = {
    phase: 'setup',
    formationId: '4-3-3',
    difficulty: 'normal',
    eraFilter: 'all',
    showRatings: true,
    squad: {},
    rerolls: 1,
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
      }
    | { type: 'spun'; nation: string }
    | { type: 'reroll'; nation: string }
    | { type: 'pick'; player: Player; slotId: string }
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
                rerolls: REROLLS_BY_DIFFICULTY[action.difficulty],
            };
        case 'spun':
            return { ...state, spunNation: action.nation };
        case 'reroll':
            return { ...state, spunNation: action.nation, rerolls: Math.max(0, state.rerolls - 1) };
        case 'pick': {
            const squad = { ...state.squad, [action.slotId]: action.player };
            const full = Object.keys(squad).length >= getFormation(state.formationId).slots.length;
            return { ...state, squad, spunNation: null, phase: full ? 'sim' : 'draft' };
        }
        case 'playMatch': {
            if (state.eliminated || state.matches.length >= ROUNDS.length) return state;
            const formation = getFormation(state.formationId);
            const players = Object.values(state.squad);
            const result = simulateMatch(players, formation, ROUNDS[state.matches.length]);
            const matches = [...state.matches, result];
            const eliminated = isRunOver(matches);
            const champion = isChampion(matches);
            return {
                ...state,
                matches,
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
