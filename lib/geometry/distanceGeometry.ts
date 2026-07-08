/**
 * distanceGeometry.ts — Calcul des distances bord-à-bord entre tables
 * Utilise empreinte() et alleeSuffisante() du moteur existant.
 */

import { empreinte, alleeSuffisante } from './tableGeometry';
import type { TableOnPlan } from '@/lib/store/types';
import type { ResultatAllee } from '@/lib/types';

export interface DistanceResult {
  distanceCm: number;
  fromPt: { x: number; y: number };
  toPt: { x: number; y: number };
  allee: ResultatAllee;
}

/**
 * Distance bord-à-bord entre deux tables (en cm).
 * Pour les rondes : centre-à-centre moins les deux demi-empreintes.
 * Pour les rect (sans rotation) : gap entre bounding boxes axis-aligned.
 */
export function distanceBordABord(a: TableOnPlan, b: TableOnPlan): DistanceResult {
  const empA = empreinte(a);
  const empB = empreinte(b);

  // Demi-dimensions des empreintes
  const halfAx = empA.largeurCm / 2;
  const halfAy = empA.profondeurCm / 2;
  const halfBx = empB.largeurCm / 2;
  const halfBy = empB.profondeurCm / 2;

  // Gap axis-aligned entre bounding boxes
  const gapX = Math.max(0, Math.abs(a.pos_x - b.pos_x) - halfAx - halfBx);
  const gapY = Math.max(0, Math.abs(a.pos_y - b.pos_y) - halfAy - halfBy);

  const distanceCm = Math.max(0, Math.sqrt(gapX * gapX + gapY * gapY));

  // Points de départ et d'arrivée pour la ligne (bords les plus proches)
  const dx = b.pos_x - a.pos_x;
  const dy = b.pos_y - a.pos_y;
  const len = Math.sqrt(dx * dx + dy * dy);

  let fromPt: { x: number; y: number };
  let toPt: { x: number; y: number };

  if (len === 0) {
    // Tables superposées
    fromPt = { x: a.pos_x, y: a.pos_y };
    toPt = { x: b.pos_x, y: b.pos_y };
  } else {
    const nx = dx / len;
    const ny = dy / len;

    // Pour les rondes, le rayon de l'empreinte est uniforme
    // Pour les rect, on utilise une approximation par la direction
    const radiusA = halfExtentInDirection(halfAx, halfAy, nx, ny);
    const radiusB = halfExtentInDirection(halfBx, halfBy, -nx, -ny);

    fromPt = { x: a.pos_x + nx * radiusA, y: a.pos_y + ny * radiusA };
    toPt = { x: b.pos_x - nx * radiusB, y: b.pos_y - ny * radiusB };
  }

  const allee = alleeSuffisante(distanceCm, 'service');

  return { distanceCm, fromPt, toPt, allee };
}

/**
 * Étendue d'un rectangle axis-aligned dans une direction donnée.
 * Retourne la distance du centre au bord dans la direction (nx, ny).
 */
function halfExtentInDirection(halfW: number, halfH: number, nx: number, ny: number): number {
  // Pour une boîte axis-aligned, l'extent dans une direction est :
  // |nx| * halfW + |ny| * halfH (support function de la boîte)
  // Mais pour tracer la ligne, on veut le point sur le bord, pas le support.
  // On utilise le rayon effectif dans cette direction :
  if (Math.abs(nx) < 0.001 && Math.abs(ny) < 0.001) return 0;
  const tx = Math.abs(nx) > 0.001 ? halfW / Math.abs(nx) : Infinity;
  const ty = Math.abs(ny) > 0.001 ? halfH / Math.abs(ny) : Infinity;
  return Math.min(tx, ty) * Math.sqrt(nx * nx + ny * ny);
}

export interface PaireDistance {
  a: string;
  b: string;
  result: DistanceResult;
}

/**
 * Calcule toutes les distances entre paires de tables.
 */
export function toutesLesDistances(tables: TableOnPlan[]): PaireDistance[] {
  const pairs: PaireDistance[] = [];
  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      pairs.push({
        a: tables[i].id,
        b: tables[j].id,
        result: distanceBordABord(tables[i], tables[j]),
      });
    }
  }
  return pairs;
}

/**
 * Paires de tables dont l'allée de service est insuffisante (< 120 cm),
 * triées de la plus étroite à la moins étroite.
 */
export function alleesInsuffisantes(tables: TableOnPlan[]): PaireDistance[] {
  return toutesLesDistances(tables)
    .filter(p => !p.result.allee.ok)
    .sort((x, y) => x.result.distanceCm - y.result.distanceCm);
}

export type Mur = 'gauche' | 'droite' | 'haut' | 'bas';

export interface DistanceMur {
  mur: Mur;
  distanceCm: number;
  allee: ResultatAllee;
}

const LIBELLE_MUR: Record<Mur, string> = {
  gauche: 'mur gauche',
  droite: 'mur droit',
  haut: 'mur du haut',
  bas: 'mur du bas',
};

export function libelleMur(mur: Mur): string {
  return LIBELLE_MUR[mur];
}

/**
 * Distance bord-à-bord (empreinte comprise) entre une table et les 4 murs.
 * Une distance négative signifie que l'empreinte dépasse hors de la salle.
 */
export function distanceAuxMurs(
  table: TableOnPlan,
  salleLargeurCm: number,
  salleHauteurCm: number,
): DistanceMur[] {
  const emp = empreinte(table);
  const halfW = emp.largeurCm / 2;
  const halfH = emp.profondeurCm / 2;

  const bruts: { mur: Mur; distanceCm: number }[] = [
    { mur: 'gauche', distanceCm: table.pos_x - halfW },
    { mur: 'droite', distanceCm: salleLargeurCm - table.pos_x - halfW },
    { mur: 'haut', distanceCm: table.pos_y - halfH },
    { mur: 'bas', distanceCm: salleHauteurCm - table.pos_y - halfH },
  ];

  return bruts.map(({ mur, distanceCm }) => ({
    mur,
    distanceCm,
    allee: alleeSuffisante(Math.max(0, distanceCm), 'service'),
  }));
}

export interface MurInsuffisant {
  tableId: string;
  tableNom: string;
  mur: Mur;
  distanceCm: number;
}

/**
 * Tables dont au moins un côté est trop près d'un mur (< 120 cm),
 * triées de la plus proche à la moins proche.
 */
export function tablesTropPresMur(
  tables: TableOnPlan[],
  salleLargeurCm: number,
  salleHauteurCm: number,
): MurInsuffisant[] {
  const out: MurInsuffisant[] = [];
  for (const t of tables) {
    for (const d of distanceAuxMurs(t, salleLargeurCm, salleHauteurCm)) {
      if (!d.allee.ok) {
        out.push({ tableId: t.id, tableNom: t.nom, mur: d.mur, distanceCm: d.distanceCm });
      }
    }
  }
  return out.sort((a, b) => a.distanceCm - b.distanceCm);
}
