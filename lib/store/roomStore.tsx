'use client';

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { RoomState, TableOnPlan, DecorOnPlan, AppMode, PlannerSetup } from './types';

// --- Actions ---

type Action =
  | { type: 'MOVE_TABLE'; id: string; x: number; y: number }
  | { type: 'ADD_TABLE'; table: TableOnPlan }
  | { type: 'REMOVE_TABLE'; id: string }
  | { type: 'SELECT_TABLE'; id: string | null }
  | { type: 'UPDATE_TABLE'; id: string; changes: Partial<TableOnPlan> }
  | { type: 'ADD_DECOR'; decor: DecorOnPlan }
  | { type: 'MOVE_DECOR'; id: string; x: number; y: number }
  | { type: 'REMOVE_DECOR'; id: string }
  | { type: 'SELECT_DECOR'; id: string | null }
  | { type: 'UPDATE_DECOR'; id: string; changes: Partial<DecorOnPlan> }
  | { type: 'SET_ROOM_SIZE'; largeurCm: number; hauteurCm: number }
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'LOAD_SETUP'; setup: PlannerSetup; mode: AppMode }
  | { type: 'SET_TABLES'; tables: TableOnPlan[]; nextTableNumber: number }
  | { type: 'LOAD_STATE'; state: RoomState };

// --- Initial state ---

const initialState: RoomState = {
  mode: 'planner',
  salleLargeurCm: 2000,  // 20 m
  salleHauteurCm: 1500,  // 15 m
  tables: [],
  decors: [],
  selectedTableId: null,
  selectedDecorId: null,
  nextTableNumber: 1,
};

// --- Reducer ---

/** Ordre d'empilement suivant : au-dessus de tous les éléments existants. */
function prochainOrdre(state: RoomState): number {
  const ordres = [
    ...state.tables.map(t => t.ordre ?? 0),
    ...state.decors.map(d => d.ordre ?? 0),
  ];
  return (ordres.length ? Math.max(...ordres) : 0) + 1;
}

function roomReducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case 'MOVE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.id ? { ...t, pos_x: action.x, pos_y: action.y } : t
        ),
      };
    case 'ADD_TABLE':
      return {
        ...state,
        tables: [...state.tables, { ...action.table, ordre: prochainOrdre(state) }],
        nextTableNumber: state.nextTableNumber + 1,
      };
    case 'REMOVE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(t => t.id !== action.id),
        selectedTableId: state.selectedTableId === action.id ? null : state.selectedTableId,
      };
    case 'SELECT_TABLE':
      return { ...state, selectedTableId: action.id, selectedDecorId: null };
    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.id ? { ...t, ...action.changes } : t
        ),
      };
    case 'ADD_DECOR':
      return {
        ...state,
        decors: [...state.decors, { ...action.decor, ordre: prochainOrdre(state) }],
        selectedDecorId: action.decor.id,
        selectedTableId: null,
      };
    case 'MOVE_DECOR':
      return {
        ...state,
        decors: state.decors.map(d =>
          d.id === action.id ? { ...d, pos_x: action.x, pos_y: action.y } : d
        ),
      };
    case 'REMOVE_DECOR':
      return {
        ...state,
        decors: state.decors.filter(d => d.id !== action.id),
        selectedDecorId: state.selectedDecorId === action.id ? null : state.selectedDecorId,
      };
    case 'SELECT_DECOR':
      return { ...state, selectedDecorId: action.id, selectedTableId: null };
    case 'UPDATE_DECOR':
      return {
        ...state,
        decors: state.decors.map(d =>
          d.id === action.id ? { ...d, ...action.changes } : d
        ),
      };
    case 'SET_ROOM_SIZE':
      return { ...state, salleLargeurCm: action.largeurCm, salleHauteurCm: action.hauteurCm };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'LOAD_SETUP':
      return {
        ...state,
        mode: action.mode,
        salleLargeurCm: action.setup.salleLargeurCm,
        salleHauteurCm: action.setup.salleHauteurCm,
        decors: action.setup.decors,
        selectedTableId: null,
        selectedDecorId: null,
      };
    case 'SET_TABLES':
      return {
        ...state,
        tables: action.tables,
        nextTableNumber: action.nextTableNumber,
        selectedTableId: null,
      };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

// --- Context ---

const RoomStateContext = createContext<RoomState>(initialState);
const RoomDispatchContext = createContext<Dispatch<Action>>(() => {});

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);
  return (
    <RoomStateContext.Provider value={state}>
      <RoomDispatchContext.Provider value={dispatch}>
        {children}
      </RoomDispatchContext.Provider>
    </RoomStateContext.Provider>
  );
}

export function useRoomState() {
  return useContext(RoomStateContext);
}

export function useRoomDispatch() {
  return useContext(RoomDispatchContext);
}
