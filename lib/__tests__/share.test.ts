import { describe, it, expect } from 'vitest';
import { encodeSetup, decodeSetup, lienMaries } from '@/lib/share';
import type { PlannerSetup } from '@/lib/store/types';

const setup: PlannerSetup = {
  salleLargeurCm: 1800,
  salleHauteurCm: 1200,
  decors: [
    { id: 'd1', type: 'piste', label: 'Piste de danse', pos_x: 900, pos_y: 1000, w_cm: 500, h_cm: 500, rot: 0 },
    { id: 'd2', type: 'bar', label: 'Bar à Champagne', pos_x: 300, pos_y: 200, w_cm: 300, h_cm: 80, rot: 90 },
  ],
};

describe('encode/decode setup', () => {
  it('round-trip fidèle', () => {
    const decoded = decodeSetup(encodeSetup(setup));
    expect(decoded).toEqual(setup);
  });

  it('préserve les accents des libellés', () => {
    const decoded = decodeSetup(encodeSetup(setup));
    expect(decoded?.decors[1].label).toBe('Bar à Champagne');
  });

  it('renvoie null sur une chaîne invalide', () => {
    expect(decodeSetup('pas-du-base64-valide!!!')).toBeNull();
    expect(decodeSetup('')).toBeNull();
  });

  it('renvoie null si la forme est incorrecte', () => {
    const bad = encodeSetup({ salleLargeurCm: 1, salleHauteurCm: 2, decors: [] });
    // on falsifie en encodant un objet sans decors
    const mauvais = btoa(JSON.stringify({ salleLargeurCm: 1 }));
    expect(decodeSetup(mauvais)).toBeNull();
    expect(decodeSetup(bad)).not.toBeNull();
  });
});

describe('lienMaries', () => {
  it('construit une URL /maries avec le fragment', () => {
    const url = lienMaries('https://exemple.fr', setup);
    expect(url.startsWith('https://exemple.fr/maries#')).toBe(true);
    const frag = url.split('#')[1];
    expect(decodeSetup(frag)).toEqual(setup);
  });
});
