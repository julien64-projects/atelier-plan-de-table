/**
 * share.ts — Encode/décode le plan partagé (salle + mobilier + tables +
 * invités) pour le transmettre aux mariés via le fragment (#…) d'un lien.
 *
 * Aucune dépendance réseau : le plan voyage dans l'URL. Supabase remplacera
 * ce mécanisme pour la vraie persistance / synchro multi-appareils.
 */

import type { TableOnPlan, DecorOnPlan } from './store/types';
import type { GuestOnPlan, Assignment } from './store/guestStore';

export interface SharedPlan {
  salleLargeurCm: number;
  salleHauteurCm: number;
  decors: DecorOnPlan[];
  tables: TableOnPlan[];
  nextTableNumber: number;
  guests: GuestOnPlan[];
  assignments: Record<string, Assignment>;
}

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return decodeURIComponent(escape(atob(b64 + pad)));
}

export function encodePlan(plan: SharedPlan): string {
  return toBase64Url(JSON.stringify(plan));
}

export function decodePlan(encoded: string): SharedPlan | null {
  try {
    const obj = JSON.parse(fromBase64Url(encoded));
    if (
      typeof obj?.salleLargeurCm !== 'number' ||
      typeof obj?.salleHauteurCm !== 'number' ||
      !Array.isArray(obj?.decors) ||
      !Array.isArray(obj?.tables) ||
      !Array.isArray(obj?.guests)
    ) {
      return null;
    }
    return {
      salleLargeurCm: obj.salleLargeurCm,
      salleHauteurCm: obj.salleHauteurCm,
      decors: obj.decors,
      tables: obj.tables,
      nextTableNumber: typeof obj.nextTableNumber === 'number' ? obj.nextTableNumber : obj.tables.length + 1,
      guests: obj.guests,
      assignments: obj.assignments ?? {},
    };
  } catch {
    return null;
  }
}

/** Construit l'URL de partage à destination des mariés. */
export function lienMaries(origin: string, plan: SharedPlan): string {
  return `${origin}/maries#${encodePlan(plan)}`;
}
