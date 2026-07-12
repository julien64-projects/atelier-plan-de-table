import { describe, it, expect } from 'vitest';
import { recapInvites, type InviteRecapInput } from '@/lib/guests';

const guests: InviteRecapInput[] = [
  { categorie: 'adulte', evenements: { mariage: true, cocktail: true, welcome: true } },
  { categorie: 'adulte', evenements: { mariage: true, cocktail: true, brunch: true } },
  { categorie: 'enfant', evenements: { mariage: true } },
  { categorie: 'prestataire', evenements: { mariage: true, cocktail: true } },
  { evenements: { mariage: true } }, // catégorie par défaut = adulte
];

describe('recapInvites', () => {
  const r = recapInvites(guests);

  it('compte le total de personnes', () => {
    expect(r.total).toBe(5);
  });

  it('décompte par catégorie (défaut = adulte)', () => {
    expect(r.parCategorie).toEqual({ adulte: 3, enfant: 1, prestataire: 1 });
  });

  it('décompte le mariage : tout le monde', () => {
    expect(r.parEvenement.mariage.total).toBe(5);
    expect(r.parEvenement.mariage.adulte).toBe(3);
    expect(r.parEvenement.mariage.enfant).toBe(1);
    expect(r.parEvenement.mariage.prestataire).toBe(1);
  });

  it('décompte le vin d’honneur', () => {
    expect(r.parEvenement.cocktail.total).toBe(3);
    expect(r.parEvenement.cocktail.adulte).toBe(2);
    expect(r.parEvenement.cocktail.prestataire).toBe(1);
  });

  it('décompte welcome et brunch', () => {
    expect(r.parEvenement.welcome.total).toBe(1);
    expect(r.parEvenement.brunch.total).toBe(1);
  });

  it('liste vide → tout à zéro', () => {
    const v = recapInvites([]);
    expect(v.total).toBe(0);
    expect(v.parCategorie.adulte).toBe(0);
    expect(v.parEvenement.mariage.total).toBe(0);
  });
});
