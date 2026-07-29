import { describe, it, expect } from 'vitest';
import { siegesMondiaux, siegeLePlusProche } from '@/lib/geometry/seatPicking';
import { SIEGE_OFFSET } from '@/lib/geometry/seatGeometry';
import type { TableOnPlan } from '@/lib/store/types';

function ronde(id: string, x: number, y: number, diametreCm = 150): TableOnPlan {
  return {
    id, nom: id, shape: 'ronde', diametreCm,
    confort: 'standard', bouts: false, pos_x: x, pos_y: y, rot: 0,
  };
}

describe('siegesMondiaux', () => {
  it('translate les sièges au centre de la table', () => {
    const sieges = siegesMondiaux([ronde('A', 1000, 800, 150)]);
    expect(sieges.length).toBeGreaterThan(0);
    // Le siège 0 d'une ronde est en haut (12 h) : (x, y - (r + offset)).
    const s0 = sieges.find(s => s.seatIndex === 0)!;
    expect(s0.tableId).toBe('A');
    expect(s0.xCm).toBeCloseTo(1000, 3);
    expect(s0.yCm).toBeCloseTo(800 - (75 + SIEGE_OFFSET), 3);
  });

  it('sépare les sièges de deux tables', () => {
    const sieges = siegesMondiaux([ronde('A', 0, 0), ronde('B', 5000, 0)]);
    expect(sieges.some(s => s.tableId === 'A')).toBe(true);
    expect(sieges.some(s => s.tableId === 'B')).toBe(true);
  });
});

describe('siegeLePlusProche', () => {
  it('renvoie le siège exact quand on tombe dessus', () => {
    const tables = [ronde('A', 1000, 800, 150)];
    const cible = siegeLePlusProche(tables, 1000, 800 - (75 + SIEGE_OFFSET));
    expect(cible).toEqual({ tableId: 'A', seatIndex: 0 });
  });

  it('choisit la table la plus proche parmi plusieurs', () => {
    const tables = [ronde('A', 0, 0), ronde('B', 5000, 0)];
    const cible = siegeLePlusProche(tables, 4980, 0 - (75 + SIEGE_OFFSET));
    expect(cible?.tableId).toBe('B');
  });

  it('renvoie null si le point est trop loin de tout siège', () => {
    const tables = [ronde('A', 0, 0, 150)];
    expect(siegeLePlusProche(tables, 100000, 100000)).toBeNull();
  });

  it('renvoie null sans table', () => {
    expect(siegeLePlusProche([], 0, 0)).toBeNull();
  });
});
