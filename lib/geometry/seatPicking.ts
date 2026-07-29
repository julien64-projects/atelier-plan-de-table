/**
 * seatPicking.ts — Positions mondiales des sièges (en cm dans le repère salle)
 * et recherche du siège le plus proche d'un point. Sert au glisser-déposer des
 * invités sur le plan. Logique pure, sans dépendance UI.
 *
 * Réplique exactement le placement des sièges de TableShape : positions locales
 * via seatGeometry, puis rotation de la table et translation au centre.
 */
import type { TableOnPlan } from '@/lib/store/types';
import { etatCapacite } from './tableGeometry';
import { positionsSiegesRonde, positionsSiegesDroite } from './seatGeometry';

export interface SiegeMonde {
  tableId: string;
  seatIndex: number;
  xCm: number;
  yCm: number;
}

/** Tous les sièges de toutes les tables, en coordonnées salle (cm). */
export function siegesMondiaux(tables: TableOnPlan[]): SiegeMonde[] {
  const out: SiegeMonde[] = [];
  for (const t of tables) {
    const input = {
      shape: t.shape,
      diametreCm: t.diametreCm,
      longueurCm: t.longueurCm,
      largeurCm: t.largeurCm,
      confort: t.confort,
      bouts: t.bouts,
    };
    const max = etatCapacite(input, 0).max;
    const seats = t.shape === 'ronde'
      ? positionsSiegesRonde(t.diametreCm ?? 150, max)
      : positionsSiegesDroite(t.longueurCm ?? 180, max, { largeurCm: t.largeurCm, bouts: t.bouts });
    const rot = ((t.rot ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    for (const s of seats) {
      const sx = s.x * cos - s.y * sin;
      const sy = s.x * sin + s.y * cos;
      out.push({ tableId: t.id, seatIndex: s.index, xCm: t.pos_x + sx, yCm: t.pos_y + sy });
    }
  }
  return out;
}

/**
 * Siège le plus proche du point (xCm, yCm), à condition d'être à moins de
 * `maxDistCm`. Renvoie null si aucune table ou si le point est trop loin.
 */
export function siegeLePlusProche(
  tables: TableOnPlan[],
  xCm: number,
  yCm: number,
  maxDistCm = 90,
): { tableId: string; seatIndex: number } | null {
  let best: SiegeMonde | null = null;
  let bestD = Infinity;
  for (const s of siegesMondiaux(tables)) {
    const d = Math.hypot(s.xCm - xCm, s.yCm - yCm);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  if (!best || bestD > maxDistCm) return null;
  return { tableId: best.tableId, seatIndex: best.seatIndex };
}
