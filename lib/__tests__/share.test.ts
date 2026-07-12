import { describe, it, expect } from 'vitest';
import { encodePlan, decodePlan, lienMaries, type SharedPlan } from '@/lib/share';

const plan: SharedPlan = {
  salleLargeurCm: 1800,
  salleHauteurCm: 1200,
  decors: [
    { id: 'd1', type: 'piste', label: 'Piste de danse', pos_x: 900, pos_y: 1000, w_cm: 500, h_cm: 500, rot: 0 },
    { id: 'd2', type: 'bar', label: 'Bar à Champagne', pos_x: 300, pos_y: 200, w_cm: 300, h_cm: 80, rot: 90 },
  ],
  tables: [
    { id: 't1', nom: 'Table 1', shape: 'ronde', diametreCm: 150, confort: 'standard', bouts: false, pos_x: 500, pos_y: 400, rot: 0 },
  ],
  nextTableNumber: 2,
  guests: [
    { id: 'g1', nom: 'Amélie', categorie: 'adulte', evenements: { mariage: true } },
  ],
  assignments: { g1: { tableId: 't1', seatIndex: 0 } },
};

describe('encode/decode plan', () => {
  it('round-trip fidèle', () => {
    expect(decodePlan(encodePlan(plan))).toEqual(plan);
  });

  it('préserve les accents des libellés', () => {
    expect(decodePlan(encodePlan(plan))?.decors[1].label).toBe('Bar à Champagne');
  });

  it('renvoie null sur une chaîne invalide', () => {
    expect(decodePlan('pas-du-base64-valide!!!')).toBeNull();
    expect(decodePlan('')).toBeNull();
  });

  it('renvoie null si la forme est incorrecte (pas de tables)', () => {
    const mauvais = btoa(JSON.stringify({ salleLargeurCm: 1, salleHauteurCm: 2, decors: [] }));
    expect(decodePlan(mauvais)).toBeNull();
  });
});

describe('lienMaries', () => {
  it('construit une URL /maries avec le fragment', () => {
    const url = lienMaries('https://exemple.fr', plan);
    expect(url.startsWith('https://exemple.fr/maries#')).toBe(true);
    expect(decodePlan(url.split('#')[1])).toEqual(plan);
  });
});
