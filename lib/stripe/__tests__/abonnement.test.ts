import { describe, it, expect } from 'vitest';
import {
  abonnementActif,
  peutCreerProjet,
  auDessusDuQuota,
  libelleAbonnement,
  PROJETS_OFFERTS,
  type EtatAbonnement,
} from '@/lib/stripe/abonnement';

const T0 = new Date('2026-08-01T12:00:00.000Z');
const DEMAIN = '2026-08-02T12:00:00.000Z';
const HIER = '2026-07-31T12:00:00.000Z';

const etat = (
  statut: EtatAbonnement['statut'],
  finPeriode: string | null = DEMAIN,
): EtatAbonnement => ({ statut, finPeriode });

describe('abonnementActif', () => {
  it('refuse quand il n’y a jamais eu d’abonnement', () => {
    expect(abonnementActif(etat(null, null), T0)).toBe(false);
  });

  it('accepte un abonnement actif ou en essai', () => {
    expect(abonnementActif(etat('active'), T0)).toBe(true);
    expect(abonnementActif(etat('trialing'), T0)).toBe(true);
  });

  it('accepte un abonnement actif sans date de fin connue', () => {
    expect(abonnementActif(etat('active', null), T0)).toBe(true);
  });

  it('refuse un paiement initial non abouti', () => {
    expect(abonnementActif(etat('incomplete'), T0)).toBe(false);
    expect(abonnementActif(etat('incomplete_expired'), T0)).toBe(false);
  });

  it('refuse un abonnement en pause', () => {
    expect(abonnementActif(etat('paused'), T0)).toBe(false);
  });

  describe('période de grâce', () => {
    it('laisse l’accès en past_due tant que la période payée court', () => {
      expect(abonnementActif(etat('past_due', DEMAIN), T0)).toBe(true);
    });

    it('coupe l’accès en past_due une fois la période écoulée', () => {
      expect(abonnementActif(etat('past_due', HIER), T0)).toBe(false);
    });

    it('coupe l’accès en past_due sans date de fin', () => {
      expect(abonnementActif(etat('past_due', null), T0)).toBe(false);
    });

    it('applique la même règle à unpaid', () => {
      expect(abonnementActif(etat('unpaid', DEMAIN), T0)).toBe(true);
      expect(abonnementActif(etat('unpaid', HIER), T0)).toBe(false);
    });
  });

  describe('résiliation', () => {
    it('honore la période déjà réglée après résiliation', () => {
      expect(abonnementActif(etat('canceled', DEMAIN), T0)).toBe(true);
    });

    it('coupe l’accès une fois le terme atteint', () => {
      expect(abonnementActif(etat('canceled', HIER), T0)).toBe(false);
    });

    it('coupe l’accès sur une résiliation immédiate (pas de période restante)', () => {
      expect(abonnementActif(etat('canceled', null), T0)).toBe(false);
    });
  });

  it('refuse une date de fin illisible plutôt que d’ouvrir l’accès', () => {
    expect(abonnementActif(etat('active', 'pas-une-date'), T0)).toBe(false);
    expect(abonnementActif(etat('canceled', 'pas-une-date'), T0)).toBe(false);
  });

  it('traite la seconde exacte de fin comme expirée', () => {
    expect(abonnementActif(etat('active', T0.toISOString()), T0)).toBe(false);
  });
});

describe('peutCreerProjet', () => {
  it('offre un projet au planner gratuit', () => {
    expect(PROJETS_OFFERTS).toBe(1);
    expect(peutCreerProjet(0, false)).toBe(true);
  });

  it('bloque le deuxième projet en gratuit', () => {
    expect(peutCreerProjet(1, false)).toBe(false);
  });

  it('ne limite pas un abonné', () => {
    expect(peutCreerProjet(0, true)).toBe(true);
    expect(peutCreerProjet(42, true)).toBe(true);
  });
});

describe('auDessusDuQuota', () => {
  it('signale un ancien abonné redescendu en gratuit', () => {
    expect(auDessusDuQuota(3, false)).toBe(true);
  });

  it('ne signale rien tant qu’on est dans le quota', () => {
    expect(auDessusDuQuota(1, false)).toBe(false);
    expect(auDessusDuQuota(0, false)).toBe(false);
  });

  it('ne signale rien pour un abonné', () => {
    expect(auDessusDuQuota(10, true)).toBe(false);
  });
});

describe('libelleAbonnement', () => {
  it('distingue les états courants', () => {
    expect(libelleAbonnement(etat(null, null), false, T0)).toBe('gratuit');
    expect(libelleAbonnement(etat('trialing'), false, T0)).toBe('essai');
    expect(libelleAbonnement(etat('active'), false, T0)).toBe('actif');
    expect(libelleAbonnement(etat('active'), true, T0)).toBe('resiliation_programmee');
  });

  it('distingue un retard de paiement d’un abonnement expiré', () => {
    expect(libelleAbonnement(etat('past_due', DEMAIN), false, T0)).toBe('paiement_en_retard');
    expect(libelleAbonnement(etat('past_due', HIER), false, T0)).toBe('expire');
  });

  it('affiche « expiré » après le terme d’une résiliation', () => {
    expect(libelleAbonnement(etat('canceled', HIER), true, T0)).toBe('expire');
  });
});
