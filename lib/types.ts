// --- Niveaux de confort ---
export type NiveauConfort = 'serré' | 'standard' | 'généreux';

// --- Formes de table ---
export type TableShape = 'ronde' | 'rect' | 'banquet';

// --- Table (entrée du moteur géométrie) ---
export interface TableInput {
  shape: TableShape;
  diametreCm?: number;
  longueurCm?: number;
  largeurCm?: number;
  confort?: NiveauConfort;
  bouts?: boolean;
}

// --- Résultat de etatCapacite ---
export type NiveauCapacite = 'ok' | 'plein' | 'depassement';

export interface EtatCapacite {
  max: number;
  assis: number;
  restant: number;
  depassement: number;
  niveau: NiveauCapacite;
}

// --- Empreinte au sol ---
export interface Empreinte {
  largeurCm: number;
  profondeurCm: number;
}

// --- Résultat allée ---
export interface ResultatAllee {
  ok: boolean;
  mini: number;
  manque: number;
}

// --- Résultat auto-dimensionnement ---
export interface DimensionRonde {
  shape: 'ronde';
  diametreCm: number;
  capacite: number;
}

export interface DimensionDroite {
  shape: 'rect' | 'banquet';
  longueurCm: number;
  largeurCm: number;
  bouts: boolean;
  capacite: number;
}

export type Dimension = DimensionRonde | DimensionDroite;

// --- Entités Supabase ---
export interface Guest {
  id: string;
  project_id: string;
  nom: string;
  menu?: string;
  marie?: boolean;
  a_confirmer?: boolean;
}

export interface Table {
  id: string;
  project_id: string;
  nom: string;
  shape: TableShape;
  diametreCm?: number;
  longueurCm?: number;
  largeurCm?: number;
  confort?: NiveauConfort;
  pos_x: number;
  pos_y: number;
  rot: number;
}

export interface Seat {
  id: string;
  table_id: string;
  index: number;
  guest_id: string | null;
}

export interface Decor {
  id: string;
  project_id: string;
  type: string;
  label: string;
  pos_x: number;
  pos_y: number;
  w_cm: number;
  h_cm: number;
  rot: number;
}

export interface Project {
  id: string;
  planner_id: string;
  couple_names: string;
  salle_w_cm: number;
  salle_h_cm: number;
  theme?: string;
  accent?: string;
  accent2?: string;
}
