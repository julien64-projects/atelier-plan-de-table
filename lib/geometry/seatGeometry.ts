/**
 * seatGeometry.ts — Positions des sièges autour d'une table.
 *
 * Coordonnées locales à la table : origine au centre, mêmes axes que le
 * rendu Konva (y vers le bas). Distances en centimètres.
 */

import { RECT_LARGEUR_STD } from './tableGeometry';

export interface SeatPos {
  index: number;
  x: number;
  y: number;
  angle: number; // radians, direction centre → siège
}

/** Distance entre le bord de la table et le centre d'un siège. */
export const SIEGE_OFFSET = 30;

/**
 * Sièges répartis régulièrement autour d'une table ronde,
 * en partant du haut (12 h) dans le sens horaire.
 */
export function positionsSiegesRonde(
  diametreCm: number,
  n: number,
  offsetCm: number = SIEGE_OFFSET,
): SeatPos[] {
  if (n <= 0) return [];
  const r = diametreCm / 2 + offsetCm;
  const out: SeatPos[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    out.push({ index: i, x: Math.cos(angle) * r, y: Math.sin(angle) * r, angle });
  }
  return out;
}

/** Répartit c positions le long d'un côté de longueur L, centrées. */
function positionsLeLong(L: number, c: number): number[] {
  if (c <= 0) return [];
  const out: number[] = [];
  for (let j = 0; j < c; j++) {
    out.push(-L / 2 + (L * (j + 1)) / (c + 1));
  }
  return out;
}

export interface OptionsDroite {
  bouts?: boolean;
  largeurCm?: number;
  offsetCm?: number;
}

/**
 * Sièges d'une table droite : répartis sur les deux grands côtés
 * (haut puis bas), plus éventuellement un siège à chaque bout.
 */
export function positionsSiegesDroite(
  longueurCm: number,
  n: number,
  opts: OptionsDroite = {},
): SeatPos[] {
  if (n <= 0) return [];
  const largeurCm = opts.largeurCm ?? RECT_LARGEUR_STD;
  const offsetCm = opts.offsetCm ?? SIEGE_OFFSET;
  const yOff = largeurCm / 2 + offsetCm;
  const xEnd = longueurCm / 2 + offsetCm;

  const out: SeatPos[] = [];
  let restant = n;

  // Sièges de bout (droite puis gauche)
  const bouts: { x: number; y: number }[] = [];
  if (opts.bouts) {
    if (restant > 0) { bouts.push({ x: xEnd, y: 0 }); restant--; }
    if (restant > 0) { bouts.push({ x: -xEnd, y: 0 }); restant--; }
  }

  // Reste réparti haut / bas
  const haut = Math.ceil(restant / 2);
  const bas = restant - haut;
  const xsHaut = positionsLeLong(longueurCm, haut);
  const xsBas = positionsLeLong(longueurCm, bas);

  const pts: { x: number; y: number }[] = [
    ...xsHaut.map(x => ({ x, y: -yOff })),
    ...xsBas.map(x => ({ x, y: yOff })),
    ...bouts,
  ];

  pts.forEach((p, i) => {
    out.push({ index: i, x: p.x, y: p.y, angle: Math.atan2(p.y, p.x) });
  });
  return out;
}

/**
 * Plus petit indice de siège libre (≥ 0) sachant les sièges déjà occupés.
 * Renvoie 0..max-1 tant qu'une place existe, puis des indices de débordement.
 */
export function premierSiegeLibre(occupes: Iterable<number>): number {
  const set = new Set(occupes);
  let i = 0;
  while (set.has(i)) i++;
  return i;
}

/**
 * Ordonne des sièges du plus central au plus extérieur (banquet des mariés).
 * Les mariés occupent le centre ; toute place ajoutée se décale vers
 * l'extérieur sans jamais traverser le centre.
 */
export function ordonnerDepuisCentre(sieges: SeatPos[]): SeatPos[] {
  return [...sieges]
    .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))
    .map((s, index) => ({ ...s, index }));
}
