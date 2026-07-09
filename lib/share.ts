/**
 * share.ts — Encode/décode la configuration du planner (salle + mobilier)
 * pour la transmettre aux mariés via le fragment (#…) d'un lien.
 *
 * Aucune dépendance réseau : la config voyage dans l'URL. Supabase
 * remplacera ce mécanisme pour la vraie persistance / les comptes.
 */

import type { PlannerSetup } from './store/types';

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return decodeURIComponent(escape(atob(b64 + pad)));
}

export function encodeSetup(setup: PlannerSetup): string {
  return toBase64Url(JSON.stringify(setup));
}

export function decodeSetup(encoded: string): PlannerSetup | null {
  try {
    const obj = JSON.parse(fromBase64Url(encoded));
    if (
      typeof obj?.salleLargeurCm !== 'number' ||
      typeof obj?.salleHauteurCm !== 'number' ||
      !Array.isArray(obj?.decors)
    ) {
      return null;
    }
    return obj as PlannerSetup;
  } catch {
    return null;
  }
}

/** Construit l'URL de partage à destination des mariés. */
export function lienMaries(origin: string, setup: PlannerSetup): string {
  return `${origin}/maries#${encodeSetup(setup)}`;
}
