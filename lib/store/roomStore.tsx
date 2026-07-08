'use client';

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { RoomState, TableOnPlan } from './types';

// --- Actions ---

type Action =
  | { type: 'MOVE_TABLE'; id: string; x: number; y: number }
  | { type: 'ADD_TABLE'; table: TableOnPlan }
  | { type: 'REMOVE_TABLE'; id: string }
  | { type: 'SELECT_TABLE'; id: string | null }
  | { type: 'UPDATE_TABLE'; id: string; changes: Partial<TableOnPlan> }
  | { type: 'SET_ROOM_SIZE'; largeurCm: number; hauteurCm: number };

// --- Initial state ---

const initialState: RoomState = {
  salleLargeurCm: 2000,  // 20 m
  salleHauteurCm: 1500,  // 15 m
  tables: [
    { id: 'seed-1', nom: 'Table 1', shape: 'ronde', diametreCm: 150, confort: 'standard', bouts: false, pos_x: 500, pos_y: 400, rot: 0 },
    { id: 'seed-2', nom: 'Table 2', shape: 'ronde', diametreCm: 180, confort: 'standard', bouts: false, pos_x: 900, pos_y: 400, rot: 0 },
    { id: 'seed-3', nom: 'Table 3', shape: 'rect', longueurCm: 240, largeurCm: 90, confort: 'standard', bouts: false, pos_x: 700, pos_y: 800, rot: 0 },
  ],
  selectedTableId: null,
  nextTableNumber: 4,
};

// --- Reducer ---

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
        tables: [...state.tables, action.table],
        nextTableNumber: state.nextTableNumber + 1,
      };
    case 'REMOVE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(t => t.id !== action.id),
        selectedTableId: state.selectedTableId === action.id ? null : state.selectedTableId,
      };
    case 'SELECT_TABLE':
      return { ...state, selectedTableId: action.id };
    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(t =>
          t.id === action.id ? { ...t, ...action.changes } : t
        ),
      };
    case 'SET_ROOM_SIZE':
      return { ...state, salleLargeurCm: action.largeurCm, salleHauteurCm: action.hauteurCm };
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
