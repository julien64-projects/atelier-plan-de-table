/**
 * guests.ts — Catégories d'invités, événements du mariage et récapitulatif.
 * Logique pure, sans dépendance UI.
 */

export const CATEGORIES = [
  { key: 'adulte', label: 'Adulte', pluriel: 'Adultes' },
  { key: 'enfant', label: 'Enfant', pluriel: 'Enfants' },
  { key: 'prestataire', label: 'Prestataire', pluriel: 'Prestataires' },
] as const;

export type CategorieInvite = (typeof CATEGORIES)[number]['key'];

/** Rang du foyer (comme dans le récap Excel). Le Welcome dinner est VIP only. */
export const RANGS = [
  { key: 'vip', label: 'VIP' },
  { key: 'classique', label: 'Classique' },
] as const;

export type RangInvite = (typeof RANGS)[number]['key'];

export const EVENEMENTS = [
  { key: 'welcome', label: 'Welcome dinner', court: 'Veille', date: '07 août' },
  { key: 'cocktail', label: "Vin d'honneur", court: 'Cocktail', date: '08 août' },
  { key: 'mariage', label: 'Mariage', court: 'Jour J', date: '08 août' },
  { key: 'brunch', label: 'Brunch', court: 'Lendemain', date: '09 août' },
] as const;

export type EvenementKey = (typeof EVENEMENTS)[number]['key'];

export interface InviteRecapInput {
  categorie?: CategorieInvite;
  rang?: RangInvite;
  evenements?: Partial<Record<EvenementKey, boolean>>;
}

export interface RecapEvenement {
  adulte: number;
  enfant: number;
  prestataire: number;
  total: number;
}

export interface RecapRang {
  adulte: number;
  enfant: number;
  prestataire: number;
  total: number;
}

export interface Recap {
  total: number;
  parCategorie: Record<CategorieInvite, number>;
  parRang: Record<RangInvite, RecapRang>;
  parEvenement: Record<EvenementKey, RecapEvenement>;
}

/** Récapitulatif chiffré : total, décompte par catégorie, par rang et par événement. */
export function recapInvites(guests: InviteRecapInput[]): Recap {
  const parCategorie: Record<CategorieInvite, number> = { adulte: 0, enfant: 0, prestataire: 0 };
  const parRang: Record<RangInvite, RecapRang> = {
    vip: { adulte: 0, enfant: 0, prestataire: 0, total: 0 },
    classique: { adulte: 0, enfant: 0, prestataire: 0, total: 0 },
  };
  const parEvenement = {} as Record<EvenementKey, RecapEvenement>;
  for (const e of EVENEMENTS) {
    parEvenement[e.key] = { adulte: 0, enfant: 0, prestataire: 0, total: 0 };
  }

  for (const g of guests) {
    const cat: CategorieInvite = g.categorie ?? 'adulte';
    const rang: RangInvite = g.rang ?? 'classique';
    parCategorie[cat]++;
    parRang[rang][cat]++;
    parRang[rang].total++;
    for (const e of EVENEMENTS) {
      if (g.evenements?.[e.key]) {
        parEvenement[e.key][cat]++;
        parEvenement[e.key].total++;
      }
    }
  }

  return { total: guests.length, parCategorie, parRang, parEvenement };
}
