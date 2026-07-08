import { describe, it, expect } from 'vitest';
import {
  capaciteRonde,
  capaciteDroite,
  dimensionnerPour,
  etatCapacite,
  empreinte,
  empreinteTournee,
  alleeSuffisante,
  CHAISE_PROFONDEUR,
  RECT_LARGEUR_STD,
} from '@/lib/geometry/tableGeometry';

describe('capaciteRonde', () => {
  it('Ø120 → 6 convives', () => {
    expect(capaciteRonde(120)).toBe(6);
  });
  it('Ø150 → 8 convives', () => {
    expect(capaciteRonde(150)).toBe(8);
  });
  it('Ø180 → 10 convives', () => {
    expect(capaciteRonde(180)).toBe(10);
  });
});

describe('capaciteDroite', () => {
  it('180 cm → 6 convives', () => {
    expect(capaciteDroite(180)).toBe(6);
  });
  it('240 cm → 8 convives', () => {
    expect(capaciteDroite(240)).toBe(8);
  });
  it('180 cm + bouts → 8 convives', () => {
    expect(capaciteDroite(180, { bouts: true })).toBe(8);
  });
});

describe('dimensionnerPour', () => {
  it('ronde pour 10 → capacité ≥ 10', () => {
    const r = dimensionnerPour(10, 'ronde');
    expect(r.capacite).toBeGreaterThanOrEqual(10);
  });
  it('banquet pour 64 → capacité ≥ 64', () => {
    const b = dimensionnerPour(64, 'banquet');
    expect(b.capacite).toBeGreaterThanOrEqual(64);
  });
});

describe('etatCapacite', () => {
  const table = { shape: 'ronde' as const, diametreCm: 150 };

  it('8/8 → plein', () => {
    expect(etatCapacite(table, 8).niveau).toBe('plein');
  });
  it('9/8 → depassement', () => {
    expect(etatCapacite(table, 9).niveau).toBe('depassement');
  });
  it('6/8 → ok', () => {
    expect(etatCapacite(table, 6).niveau).toBe('ok');
  });
});

describe('empreinte', () => {
  it('ronde Ø150 → diamètre + 2×chaises', () => {
    const e = empreinte({ shape: 'ronde', diametreCm: 150 });
    const attendu = 150 + 2 * CHAISE_PROFONDEUR;
    expect(e.largeurCm).toBe(attendu);
    expect(e.profondeurCm).toBe(attendu);
  });
  it('rect 240×90 → profondeur = largeur + 2×chaises', () => {
    const e = empreinte({ shape: 'rect', longueurCm: 240, largeurCm: 90 });
    expect(e.largeurCm).toBe(240);
    expect(e.profondeurCm).toBe(90 + 2 * CHAISE_PROFONDEUR);
  });
});

describe('empreinteTournee', () => {
  const rect = { shape: 'rect' as const, longueurCm: 240, largeurCm: 90 };
  // empreinte de base : 240 × (90 + 2×50) = 240 × 190

  it('rot 0 → identique à empreinte', () => {
    const e = empreinteTournee(rect, 0);
    expect(e.largeurCm).toBeCloseTo(240, 5);
    expect(e.profondeurCm).toBeCloseTo(190, 5);
  });

  it('rot 90 → dimensions échangées', () => {
    const e = empreinteTournee(rect, 90);
    expect(e.largeurCm).toBeCloseTo(190, 5);
    expect(e.profondeurCm).toBeCloseTo(240, 5);
  });

  it('rot 45 → AABC élargie et carrée', () => {
    const e = empreinteTournee(rect, 45);
    const attendu = (240 + 190) * Math.abs(Math.cos(Math.PI / 4));
    expect(e.largeurCm).toBeCloseTo(attendu, 3);
    expect(e.profondeurCm).toBeCloseTo(attendu, 3);
  });

  it('ronde : invariante par rotation', () => {
    const base = empreinte({ shape: 'ronde', diametreCm: 150 });
    const e = empreinteTournee({ shape: 'ronde', diametreCm: 150 }, 37);
    expect(e.largeurCm).toBe(base.largeurCm);
    expect(e.profondeurCm).toBe(base.profondeurCm);
  });
});

describe('alleeSuffisante', () => {
  it('120 cm service → ok', () => {
    expect(alleeSuffisante(120, 'service').ok).toBe(true);
  });
  it('100 cm service → pas ok, manque 20', () => {
    const r = alleeSuffisante(100, 'service');
    expect(r.ok).toBe(false);
    expect(r.manque).toBe(20);
  });
  it('75 cm invite → ok', () => {
    expect(alleeSuffisante(75, 'invite').ok).toBe(true);
  });
});
