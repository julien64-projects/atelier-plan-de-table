/**
 * tableGeometry.js — Moteur de calcul des tables de réception
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

/* Espace linéaire occupé par convive, le long du bord de table (cm).
   La table ronde tolère un peu moins car les convives se ferment vers le centre. */
export const CONFORT = {
  ronde:   { serré: 50, standard: 55, généreux: 62 },
  droite:  { serré: 55, standard: 60, généreux: 70 }, // banquet & rectangle
};

export const CHAISE_PROFONDEUR = 50;   // encombrement d'une chaise occupée (cm)
export const ALLEE_SERVICE      = 120; // allée de service recommandée entre zones assises (cm)
export const ALLEE_INVITE       = 75;  // passage invité minimal (cm)
export const RECT_LARGEUR_STD   = 90;  // largeur standard d'une table rectangulaire/banquet (cm)

const PI = Math.PI;
const clampConfort = c => (c === 'serré' || c === 'standard' || c === 'généreux') ? c : 'standard';

/* ------------------------------------------------------------------ */
/*  TABLE RONDE                                                        */
/* ------------------------------------------------------------------ */

/** Capacité max d'une table ronde de diamètre donné. */
export function capaciteRonde(diametreCm, confort = 'standard') {
  const pas = CONFORT.ronde[clampConfort(confort)];
  return Math.max(1, Math.floor((PI * diametreCm) / pas));
}

/** Diamètre minimal (cm) pour asseoir n convives autour d'une ronde. */
export function diametreRondePour(n, confort = 'standard') {
  const pas = CONFORT.ronde[clampConfort(confort)];
  return Math.ceil((n * pas) / PI);
}

/* ------------------------------------------------------------------ */
/*  TABLE RECTANGULAIRE / BANQUET (convives sur les 2 grands côtés)     */
/* ------------------------------------------------------------------ */

/** Nombre de convives par grand côté pour une longueur donnée. */
export function convivesParCote(longueurCm, confort = 'standard') {
  const pas = CONFORT.droite[clampConfort(confort)];
  return Math.max(0, Math.floor(longueurCm / pas));
}

/**
 * Capacité max d'une table droite.
 * @param {object} opt { bouts:boolean } — convives en bout de table (défaut false : réservé au banquet des mariés / accès service)
 */
export function capaciteDroite(longueurCm, { confort = 'standard', bouts = false, largeurCm = RECT_LARGEUR_STD } = {}) {
  const cotes = 2 * convivesParCote(longueurCm, confort);
  const enBout = bouts && largeurCm >= 70 ? 2 : 0;
  return cotes + enBout;
}

/** Longueur minimale (cm) pour asseoir n convives sur une table droite. */
export function longueurDroitePour(n, { confort = 'standard', bouts = false } = {}) {
  const pas = CONFORT.droite[clampConfort(confort)];
  const enBout = bouts ? 2 : 0;
  const parCote = Math.ceil(Math.max(0, n - enBout) / 2);
  return parCote * pas;
}

/* ------------------------------------------------------------------ */
/*  CAPACITÉ GÉNÉRIQUE + ALERTE                                        */
/* ------------------------------------------------------------------ */

/**
 * Capacité max d'une table, quelle que soit sa forme.
 * table = { shape:'ronde'|'rect'|'banquet', diametreCm?, longueurCm?, largeurCm?, confort?, bouts? }
 */
export function capaciteMax(table) {
  const confort = table.confort || 'standard';
  if (table.shape === 'ronde') return capaciteRonde(table.diametreCm, confort);
  return capaciteDroite(table.longueurCm, {
    confort, bouts: !!table.bouts, largeurCm: table.largeurCm || RECT_LARGEUR_STD,
  });
}

/**
 * État d'occupation d'une table. À afficher dans l'UI (badge, couleur).
 * @param {number} nbAssis nombre de convives déjà placés
 * @returns {{max, assis, restant, depassement, niveau}}
 *   niveau: 'ok' | 'plein' | 'depassement'
 */
export function etatCapacite(table, nbAssis) {
  const max = capaciteMax(table);
  const restant = max - nbAssis;
  let niveau = 'ok';
  if (nbAssis > max) niveau = 'depassement';
  else if (nbAssis === max) niveau = 'plein';
  return { max, assis: nbAssis, restant, depassement: Math.max(0, nbAssis - max), niveau };
}

/* ------------------------------------------------------------------ */
/*  AUTO-DIMENSIONNEMENT (proposer une table pour N invités)           */
/* ------------------------------------------------------------------ */

/**
 * Propose des dimensions pour asseoir n invités.
 * @returns pour ronde: { shape, diametreCm, capacite }
 *          pour droite: { shape, longueurCm, largeurCm, capacite }
 */
export function dimensionnerPour(n, shape = 'ronde', confort = 'standard') {
  if (shape === 'ronde') {
    const diametreCm = arrondi5(diametreRondePour(n, confort));
    return { shape, diametreCm, capacite: capaciteRonde(diametreCm, confort) };
  }
  const bouts = shape === 'rect';
  const longueurCm = arrondi5(longueurDroitePour(n, { confort, bouts }));
  const largeurCm = RECT_LARGEUR_STD;
  return { shape, longueurCm, largeurCm, bouts, capacite: capaciteDroite(longueurCm, { confort, bouts, largeurCm }) };
}

/* ------------------------------------------------------------------ */
/*  EMPREINTE AU SOL (pour le plan de salle et les distances)          */
/* ------------------------------------------------------------------ */

/** Encombrement réel (table + chaises occupées), en cm. */
export function empreinte(table) {
  if (table.shape === 'ronde') {
    const d = table.diametreCm + 2 * CHAISE_PROFONDEUR;
    return { largeurCm: d, profondeurCm: d };
  }
  return {
    largeurCm: table.longueurCm,
    profondeurCm: (table.largeurCm || RECT_LARGEUR_STD) + 2 * CHAISE_PROFONDEUR,
  };
}

/** Deux tables sont-elles trop proches ? distance = bord à bord des empreintes (cm). */
export function alleeSuffisante(distanceBordCm, type = 'service') {
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
};

const arrondi5 = v => Math.ceil(v / 5) * 5;
