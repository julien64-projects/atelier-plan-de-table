import { describe, it, expect } from 'vitest';
import {
  positionsSiegesRonde,
  positionsSiegesDroite,
  ordonnerDepuisCentre,
  SIEGE_OFFSET,
} from '@/lib/geometry/seatGeometry';

describe('positionsSiegesRonde', () => {
  it('génère n sièges', () => {
    expect(positionsSiegesRonde(150, 8)).toHaveLength(8);
    expect(positionsSiegesRonde(150, 0)).toHaveLength(0);
  });

  it('le premier siège est en haut (12 h)', () => {
    const [s0] = positionsSiegesRonde(150, 8);
    const r = 150 / 2 + SIEGE_OFFSET;
    expect(s0.x).toBeCloseTo(0, 5);
    expect(s0.y).toBeCloseTo(-r, 5);
  });

  it('tous les sièges sont à la même distance du centre', () => {
    const r = 200 / 2 + SIEGE_OFFSET;
    for (const s of positionsSiegesRonde(200, 10)) {
      expect(Math.hypot(s.x, s.y)).toBeCloseTo(r, 5);
    }
  });
});

describe('positionsSiegesDroite', () => {
  it('répartit à parts égales sur les deux grands côtés', () => {
    const sieges = positionsSiegesDroite(240, 8, { largeurCm: 90 });
    expect(sieges).toHaveLength(8);
    const yOff = 90 / 2 + SIEGE_OFFSET;
    expect(sieges.filter(s => Math.abs(s.y - -yOff) < 0.01)).toHaveLength(4);
    expect(sieges.filter(s => Math.abs(s.y - yOff) < 0.01)).toHaveLength(4);
  });

  it('ajoute un siège à chaque bout quand bouts = true', () => {
    const sieges = positionsSiegesDroite(240, 10, { largeurCm: 90, bouts: true });
    expect(sieges).toHaveLength(10);
    const xEnd = 240 / 2 + SIEGE_OFFSET;
    expect(sieges.filter(s => Math.abs(Math.abs(s.x) - xEnd) < 0.01 && Math.abs(s.y) < 0.01)).toHaveLength(2);
  });

  it('nombre impair : un côté a un siège de plus', () => {
    const sieges = positionsSiegesDroite(300, 7, { largeurCm: 90 });
    const yOff = 90 / 2 + SIEGE_OFFSET;
    expect(sieges.filter(s => s.y < 0)).toHaveLength(4);
    expect(sieges.filter(s => s.y > 0)).toHaveLength(3);
  });
});

describe('ordonnerDepuisCentre', () => {
  it('le premier siège est le plus central, le dernier le plus extérieur', () => {
    const sieges = positionsSiegesDroite(400, 6, { largeurCm: 90 });
    const ordonnes = ordonnerDepuisCentre(sieges);
    const d = ordonnes.map(s => Math.hypot(s.x, s.y));
    // distances croissantes
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThanOrEqual(d[i - 1]);
    // indices réattribués 0..n-1
    expect(ordonnes.map(s => s.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
