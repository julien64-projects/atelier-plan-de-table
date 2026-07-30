/**
 * abonnement.ts — Règles d'accès liées à l'abonnement. Logique PURE :
 * aucune dépendance à Stripe, Supabase ou React, donc testable directement.
 *
 * Le modèle : freemium. Un projet gratuit à vie, illimité une fois abonné.
 * Les mariés invités par lien ne sont JAMAIS concernés — leur accès passe par
 * `project_member` et ne regarde pas le planner (cf. migration 0005).
 */

/** Statuts d'abonnement renvoyés par Stripe. */
export type StatutStripe =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export interface EtatAbonnement {
  statut: StatutStripe | null;
  /** Fin de la période payée en cours (ISO), ou null si jamais abonné. */
  finPeriode: string | null;
}

/** Nombre de projets offerts sans abonnement. */
export const PROJETS_OFFERTS = 1;

/**
 * L'abonnement donne-t-il accès aux fonctions payantes ?
 *
 * Deux subtilités qui coûtent cher si on les rate :
 *
 * - `past_due` : le prélèvement a échoué mais Stripe relance pendant
 *   plusieurs jours. Couper l'accès immédiatement pour une carte expirée
 *   serait brutal et fait fuir des clients qui allaient payer. On laisse
 *   donc l'accès tant que la période déjà réglée n'est pas écoulée.
 *
 * - `canceled` : quand un planner résilie, Stripe garde le statut `active`
 *   jusqu'au terme, puis bascule sur `canceled`. Mais une résiliation
 *   immédiate bascule tout de suite. On se fie donc à la date de fin, pas
 *   au seul statut.
 */
export function abonnementActif(
  etat: EtatAbonnement,
  maintenant: Date = new Date(),
): boolean {
  const { statut, finPeriode } = etat;
  if (!statut) return false;

  // Jamais payé / paiement initial non abouti : aucun accès.
  if (statut === 'incomplete' || statut === 'incomplete_expired') return false;

  // Abonnement suspendu volontairement : pas d'accès.
  if (statut === 'paused') return false;

  // Essai et abonnement en règle : accès, borné par la fin de période si connue.
  if (statut === 'trialing' || statut === 'active') {
    return finPeriode === null || periodeEnCours(finPeriode, maintenant);
  }

  // Impayé ou résilié : on honore la période déjà réglée, pas au-delà.
  if (statut === 'past_due' || statut === 'unpaid' || statut === 'canceled') {
    return finPeriode !== null && periodeEnCours(finPeriode, maintenant);
  }

  return false;
}

function periodeEnCours(finPeriode: string, maintenant: Date): boolean {
  const fin = new Date(finPeriode).getTime();
  if (Number.isNaN(fin)) return false;
  return fin > maintenant.getTime();
}

/**
 * Le planner peut-il créer un projet de plus ?
 * Gratuit : un seul. Abonné : sans limite.
 */
export function peutCreerProjet(nbProjets: number, abonne: boolean): boolean {
  if (abonne) return true;
  return nbProjets < PROJETS_OFFERTS;
}

/**
 * Un planner qui se désabonne peut se retrouver au-dessus du quota gratuit.
 * On ne supprime évidemment rien : ses projets existants restent lisibles et
 * modifiables, seule la CRÉATION d'un nouveau projet est bloquée. Cette
 * fonction dit s'il faut afficher l'avertissement correspondant.
 */
export function auDessusDuQuota(nbProjets: number, abonne: boolean): boolean {
  return !abonne && nbProjets > PROJETS_OFFERTS;
}

/** Libellé d'état à afficher au planner. */
export function libelleAbonnement(
  etat: EtatAbonnement,
  annuleALaFin: boolean,
  maintenant: Date = new Date(),
): 'gratuit' | 'essai' | 'actif' | 'resiliation_programmee' | 'paiement_en_retard' | 'expire' {
  if (!etat.statut) return 'gratuit';
  if (etat.statut === 'trialing') return 'essai';
  if (etat.statut === 'past_due' || etat.statut === 'unpaid') {
    return abonnementActif(etat, maintenant) ? 'paiement_en_retard' : 'expire';
  }
  if (!abonnementActif(etat, maintenant)) return 'expire';
  return annuleALaFin ? 'resiliation_programmee' : 'actif';
}
