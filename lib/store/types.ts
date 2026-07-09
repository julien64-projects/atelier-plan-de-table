import type { TableShape, NiveauConfort } from '@/lib/types';

export interface TableOnPlan {
  id: string;
  nom: string;
  shape: TableShape;
  diametreCm?: number;
  longueurCm?: number;
  largeurCm?: number;
  confort: NiveauConfort;
  bouts: boolean;
  pos_x: number;
  pos_y: number;
  rot: number;
}

export interface DecorOnPlan {
  id: string;
  type: string;
  label: string;
  pos_x: number;
  pos_y: number;
  w_cm: number;
  h_cm: number;
  rot: number;
}

export type AppMode = 'planner' | 'maries';

export interface RoomState {
  mode: AppMode;
  salleLargeurCm: number;
  salleHauteurCm: number;
  tables: TableOnPlan[];
  decors: DecorOnPlan[];
  selectedTableId: string | null;
  selectedDecorId: string | null;
  nextTableNumber: number;
}

/** Configuration transmise du planner aux mariés (via le lien de partage). */
export interface PlannerSetup {
  salleLargeurCm: number;
  salleHauteurCm: number;
  decors: DecorOnPlan[];
}
