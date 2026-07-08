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
  nbAssis: number;
}

export interface RoomState {
  salleLargeurCm: number;
  salleHauteurCm: number;
  tables: TableOnPlan[];
  selectedTableId: string | null;
  nextTableNumber: number;
}
