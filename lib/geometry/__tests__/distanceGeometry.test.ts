import { describe, it, expect } from 'vitest';
import { distanceBordABord, alleesInsuffisantes } from '@/lib/geometry/distanceGeometry';
import { CHAISE_PROFONDEUR } from '@/lib/geometry/tableGeometry';
import type { TableOnPlan } from '@/lib/store/types';

function makeRonde(id: string, diametreCm: number, x: number, y: number): TableOnPlan {
  return { id, nom: id, shape: 'ronde', diametreCm, confort: 'standard', bouts: false, pos_x: x, pos_y: y, rot: 0 };
}

function makeRect(id: string, longueurCm: number, largeurCm: number, x: number, y: number): TableOnPlan {
  return { id, nom: id, shape: 'rect', longueurCm, largeurCm, confort: 'standard', bouts: false, pos_x: x, pos_y: y, rot: 0 };
}

describe('distanceBordABord', () => {
  it('deux rondes Ø150 côte à côte avec 200cm entre centres', () => {
    // Empreinte ronde Ø150 = 150 + 2*50 = 250cm de diamètre, rayon = 125cm
    const a = makeRonde('a', 150, 0, 0);
    const b = makeRonde('b', 150, 400, 0);
    const r = distanceBordABord(a, b);
    // Gap = 400 - 125 - 125 = 150cm
    expect(r.distanceCm).toBeCloseTo(150, 0);
    expect(r.allee.ok).toBe(true); // 150 >= 120
  });

  it('deux rondes trop proches → allée insuffisante', () => {
    // Centres à 300, empreinte rayon = 125 chaque → gap = 300 - 250 = 50
    const a = makeRonde('a', 150, 0, 0);
    const b = makeRonde('b', 150, 300, 0);
    const r = distanceBordABord(a, b);
    expect(r.distanceCm).toBeCloseTo(50, 0);
    expect(r.allee.ok).toBe(false);
  });

  it('deux rect côte à côte horizontalement', () => {
    // rect 240×90, empreinte = 240 × (90+100) = 240 × 190
    // halfW = 120, centres à x=0 et x=400
    // gap = 400 - 120 - 120 = 160
    const a = makeRect('a', 240, 90, 0, 0);
    const b = makeRect('b', 240, 90, 400, 0);
    const r = distanceBordABord(a, b);
    expect(r.distanceCm).toBeCloseTo(160, 0);
    expect(r.allee.ok).toBe(true);
  });

  it('tables qui se chevauchent → distance 0', () => {
    const a = makeRonde('a', 150, 100, 100);
    const b = makeRonde('b', 150, 100, 100);
    const r = distanceBordABord(a, b);
    expect(r.distanceCm).toBe(0);
  });

  it('placement diagonal', () => {
    const a = makeRonde('a', 150, 0, 0);
    const b = makeRonde('b', 150, 500, 500);
    const r = distanceBordABord(a, b);
    // Bounding box gap : gapX = 500 - 125 - 125 = 250, gapY idem
    // Distance = sqrt(250² + 250²) ≈ 354
    expect(r.distanceCm).toBeCloseTo(354, 0);
    expect(r.allee.ok).toBe(true);
  });
});

describe('alleesInsuffisantes', () => {
  it('ne retourne que les paires < 120cm, triées par étroitesse', () => {
    const a = makeRonde('a', 150, 0, 0);
    const b = makeRonde('b', 150, 300, 0);   // gap 50 avec a → insuffisant
    const c = makeRonde('c', 150, 280, 0);   // gap 30 avec a ; empreintes b/c se chevauchent → gap 0
    const loin = makeRonde('loin', 150, 1000, 1000); // largement OK
    const res = alleesInsuffisantes([a, b, c, loin]);
    // paires insuffisantes : a-b (50), a-c (30), b-c (0, chevauchement)
    expect(res.length).toBe(3);
    // triées de la plus étroite à la moins étroite
    const dists = res.map(p => Math.round(p.result.distanceCm));
    expect(dists).toEqual([0, 30, 50]);
    expect(res.every(p => !p.result.allee.ok)).toBe(true);
  });

  it('aucune paire insuffisante quand les tables sont espacées', () => {
    const a = makeRonde('a', 150, 0, 0);
    const b = makeRonde('b', 150, 500, 0); // gap 250 → OK
    expect(alleesInsuffisantes([a, b])).toEqual([]);
  });
});
