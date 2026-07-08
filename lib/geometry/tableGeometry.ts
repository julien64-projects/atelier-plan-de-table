/**
 * tableGeometry.ts — Moteur de calcul des tables de réception
 * ------------------------------------------------------------
 * Aucune dépendance. Utilisable en HTML, React, Node, etc.
 * Toutes les mesures sont en CENTIMÈTRES.
 *
 * Sert à :
 *  - déduire la capacité maximale d'une table selon sa taille et sa forme
 *  - proposer la bonne taille de table selon un nombre d'invités
 *  - calculer l'empreinte au sol (table + chaises) pour le plan de salle
 *  - alerter quand on dépasse la capacité
 *
 * Les valeurs par défaut suivent les standards traiteur / événementiel.
 * Elles sont paramétrables par un niveau de confort.
 */

import type {
  NiveauConfort,
  TableInput,
  EtatCapacite,
  Empreinte,
  ResultatAllee,
  Dimension,
  DimensionRonde,
  DimensionDroite,
} from '@/lib/types';

/* Espace linéaire occupé par convive, le long du bord de table (cm).
   La table ronde tolère un peu moins car les convives se ferment vers le centre. */
export const CONFORT: Record<'ronde' | 'droite', Record<NiveauConfort, number>> = {
  ronde:  { serré: 50, standard: 55, généreux: 62 },
  droite: { serré: 55, standard: 60, généreux: 70 },
};

export const CHAISE_PROFONDEUR = 50;
export const ALLEE_SERVICE     = 120;
export const ALLEE_INVITE      = 75;
export const RECT_LARGEUR_STD  = 90;

const PI = Math.PI;

function clampConfort(c: string | undefined): NiveauConfort {
  return (c === 'serré' || c === 'standard' || c === 'généreux') ? c : 'standard';
}

/* ------------------------------------------------------------------ */
/*  TABLE RONDE                                                        */
/* ------------------------------------------------------------------ */

export function capaciteRonde(diametreCm: number, confort: NiveauConfort = 'standard'): number {
  const pas = CONFORT.ronde[clampConfort(confort)];
  return Math.max(1, Math.floor((PI * diametreCm) / pas));
}

export function diametreRondePour(n: number, confort: NiveauConfort = 'standard'): number {
  const pas = CONFORT.ronde[clampConfort(confort)];
  return Math.ceil((n * pas) / PI);
}

/* ------------------------------------------------------------------ */
/*  TABLE RECTANGULAIRE / BANQUET (convives sur les 2 grands côtés)     */
/* ------------------------------------------------------------------ */

export function convivesParCote(longueurCm: number, confort: NiveauConfort = 'standard'): number {
  const pas = CONFORT.droite[clampConfort(confort)];
  return Math.max(0, Math.floor(longueurCm / pas));
}

export function capaciteDroite(
  longueurCm: number,
  { confort = 'standard', bouts = false, largeurCm = RECT_LARGEUR_STD }: {
    confort?: NiveauConfort;
    bouts?: boolean;
    largeurCm?: number;
  } = {},
): number {
  const cotes = 2 * convivesParCote(longueurCm, confort);
  const enBout = bouts && largeurCm >= 70 ? 2 : 0;
  return cotes + enBout;
}

export function longueurDroitePour(
  n: number,
  { confort = 'standard', bouts = false }: { confort?: NiveauConfort; bouts?: boolean } = {},
): number {
  const pas = CONFORT.droite[clampConfort(confort)];
  const enBout = bouts ? 2 : 0;
  const parCote = Math.ceil(Math.max(0, n - enBout) / 2);
  return parCote * pas;
}

/* ------------------------------------------------------------------ */
/*  CAPACITÉ GÉNÉRIQUE + ALERTE                                        */
/* ------------------------------------------------------------------ */

export function capaciteMax(table: TableInput): number {
  const confort = table.confort || 'standard';
  if (table.shape === 'ronde') return capaciteRonde(table.diametreCm!, confort);
  return capaciteDroite(table.longueurCm!, {
    confort,
    bouts: !!table.bouts,
    largeurCm: table.largeurCm || RECT_LARGEUR_STD,
  });
}

export function etatCapacite(table: TableInput, nbAssis: number): EtatCapacite {
  const max = capaciteMax(table);
  const restant = max - nbAssis;
  let niveau: EtatCapacite['niveau'] = 'ok';
  if (nbAssis > max) niveau = 'depassement';
  else if (nbAssis === max) niveau = 'plein';
  return { max, assis: nbAssis, restant, depassement: Math.max(0, nbAssis - max), niveau };
}

/* ------------------------------------------------------------------ */
/*  AUTO-DIMENSIONNEMENT (proposer une table pour N invités)           */
/* ------------------------------------------------------------------ */

const arrondi5 = (v: number): number => Math.ceil(v / 5) * 5;

export function dimensionnerPour(n: number, shape: TableInput['shape'] = 'ronde', confort: NiveauConfort = 'standard'): Dimension {
  if (shape === 'ronde') {
    const diametreCm = arrondi5(diametreRondePour(n, confort));
    return { shape, diametreCm, capacite: capaciteRonde(diametreCm, confort) } satisfies DimensionRonde;
  }
  const bouts = shape === 'rect';
  const longueurCm = arrondi5(longueurDroitePour(n, { confort, bouts }));
  const largeurCm = RECT_LARGEUR_STD;
  return {
    shape, longueurCm, largeurCm, bouts,
    capacite: capaciteDroite(longueurCm, { confort, bouts, largeurCm }),
  } satisfies DimensionDroite;
}

/* ------------------------------------------------------------------ */
/*  EMPREINTE AU SOL (pour le plan de salle et les distances)          */
/* ------------------------------------------------------------------ */

export function empreinte(table: TableInput): Empreinte {
  if (table.shape === 'ronde') {
    const d = table.diametreCm! + 2 * CHAISE_PROFONDEUR;
    return { largeurCm: d, profondeurCm: d };
  }
  return {
    largeurCm: table.longueurCm!,
    profondeurCm: (table.largeurCm || RECT_LARGEUR_STD) + 2 * CHAISE_PROFONDEUR,
  };
}

export function alleeSuffisante(distanceBordCm: number, type: 'service' | 'invite' = 'service'): ResultatAllee {
  const mini = type === 'service' ? ALLEE_SERVICE : ALLEE_INVITE;
  return { ok: distanceBordCm >= mini, mini, manque: Math.max(0, mini - distanceBordCm) };
}

/* ------------------------------------------------------------------ */
/*  RÉFÉRENTIEL DE TAILLES STANDARD (pour l'UI / le catalogue)         */
/* ------------------------------------------------------------------ */

export const TABLES_STANDARD = {
  ronde: [
    { diametreCm: 120, label: 'Ø120 cm' },
    { diametreCm: 150, label: 'Ø150 cm' },
    { diametreCm: 180, label: 'Ø180 cm' },
    { diametreCm: 210, label: 'Ø210 cm' },
  ],
  droite: [
    { longueurCm: 180, largeurCm: 90, label: '180 × 90 cm' },
    { longueurCm: 240, largeurCm: 90, label: '240 × 90 cm' },
    { longueurCm: 300, largeurCm: 90, label: '300 × 90 cm' },
  ],
} as const;
