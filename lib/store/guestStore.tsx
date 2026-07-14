'use client';

import { createContext, useContext, useReducer, useMemo, type Dispatch, type ReactNode } from 'react';
import type { CategorieInvite, EvenementKey, RangInvite } from '@/lib/guests';

export interface GuestOnPlan {
  id: string;
  nom: string;
  menu?: string;
  marie?: boolean;
  aConfirmer?: boolean;
  categorie?: CategorieInvite;
  rang?: RangInvite;
  evenements?: Partial<Record<EvenementKey, boolean>>;
}

export type GuestFields = Omit<GuestOnPlan, 'id'>;

export interface Assignment {
  tableId: string;
  seatIndex: number;
}

interface GuestState {
  guests: GuestOnPlan[];
  assignments: Record<string, Assignment>; // guestId -> siège
  placementMode: { active: boolean; guestId: string | null };
  warning: string | null;
}

type GuestAction =
  | { type: 'ADD_GUEST'; nom: string; fields?: Partial<GuestFields> }
  | { type: 'ADD_GUESTS'; noms: string[] }
  | { type: 'UPDATE_GUEST'; id: string; changes: Partial<GuestFields> }
  | { type: 'REMOVE_GUEST'; id: string }
  | { type: 'ASSIGN_GUEST'; guestId: string; tableId: string; seatIndex: number; warning?: string | null }
  | { type: 'UNASSIGN_GUEST'; guestId: string }
  | { type: 'START_PLACEMENT'; guestId: string }
  | { type: 'CANCEL_PLACEMENT' }
  | { type: 'DISMISS_WARNING' }
  | { type: 'LOAD_GUESTS'; guests: GuestOnPlan[]; assignments: Record<string, Assignment> };

const initialState: GuestState = {
  guests: [],
  assignments: {},
  placementMode: { active: false, guestId: null },
  warning: null,
};

function guestReducer(state: GuestState, action: GuestAction): GuestState {
  switch (action.type) {
    case 'ADD_GUEST':
      return {
        ...state,
        guests: [...state.guests, {
          id: crypto.randomUUID(),
          nom: action.nom,
          categorie: 'adulte',
          evenements: { mariage: true },
          ...action.fields,
        }],
      };
    case 'ADD_GUESTS': {
      const nouveaux = action.noms
        .map(n => n.trim())
        .filter(Boolean)
        .map(nom => ({
          id: crypto.randomUUID(),
          nom,
          categorie: 'adulte' as const,
          evenements: { mariage: true },
        }));
      return { ...state, guests: [...state.guests, ...nouveaux] };
    }
    case 'UPDATE_GUEST':
      return {
        ...state,
        guests: state.guests.map(g => (g.id === action.id ? { ...g, ...action.changes } : g)),
      };
    case 'REMOVE_GUEST': {
      const { [action.id]: _, ...rest } = state.assignments;
      return {
        ...state,
        guests: state.guests.filter(g => g.id !== action.id),
        assignments: rest,
        placementMode: state.placementMode.guestId === action.id
          ? { active: false, guestId: null }
          : state.placementMode,
      };
    }
    case 'ASSIGN_GUEST': {
      // Libère le siège visé s'il est déjà occupé par un autre invité
      const assignments = { ...state.assignments };
      for (const [gid, a] of Object.entries(assignments)) {
        if (gid !== action.guestId && a.tableId === action.tableId && a.seatIndex === action.seatIndex) {
          delete assignments[gid];
        }
      }
      assignments[action.guestId] = { tableId: action.tableId, seatIndex: action.seatIndex };
      return {
        ...state,
        assignments,
        placementMode: { active: false, guestId: null },
        warning: action.warning ?? null,
      };
    }
    case 'UNASSIGN_GUEST': {
      const { [action.guestId]: _, ...rest } = state.assignments;
      return { ...state, assignments: rest };
    }
    case 'START_PLACEMENT':
      return { ...state, placementMode: { active: true, guestId: action.guestId }, warning: null };
    case 'CANCEL_PLACEMENT':
      return { ...state, placementMode: { active: false, guestId: null }, warning: null };
    case 'DISMISS_WARNING':
      return { ...state, warning: null };
    case 'LOAD_GUESTS':
      return {
        ...state,
        guests: action.guests,
        assignments: action.assignments,
        placementMode: { active: false, guestId: null },
        warning: null,
      };
    default:
      return state;
  }
}

const GuestStateContext = createContext<GuestState>(initialState);
const GuestDispatchContext = createContext<Dispatch<GuestAction>>(() => {});

export function GuestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(guestReducer, initialState);
  return (
    <GuestStateContext.Provider value={state}>
      <GuestDispatchContext.Provider value={dispatch}>
        {children}
      </GuestDispatchContext.Provider>
    </GuestStateContext.Provider>
  );
}

export function useGuestState() {
  return useContext(GuestStateContext);
}

export function useGuestDispatch() {
  return useContext(GuestDispatchContext);
}

export function useGuestsForTable(tableId: string): GuestOnPlan[] {
  const { guests, assignments } = useContext(GuestStateContext);
  return useMemo(
    () => guests.filter(g => assignments[g.id]?.tableId === tableId),
    [guests, assignments, tableId],
  );
}

/** Association siège → invité pour une table donnée. */
export function useSeatMap(tableId: string): Record<number, GuestOnPlan> {
  const { guests, assignments } = useContext(GuestStateContext);
  return useMemo(() => {
    const map: Record<number, GuestOnPlan> = {};
    for (const g of guests) {
      const a = assignments[g.id];
      if (a && a.tableId === tableId) map[a.seatIndex] = g;
    }
    return map;
  }, [guests, assignments, tableId]);
}

export function useUnassignedGuests(): GuestOnPlan[] {
  const { guests, assignments } = useContext(GuestStateContext);
  return useMemo(
    () => guests.filter(g => !assignments[g.id]),
    [guests, assignments],
  );
}
