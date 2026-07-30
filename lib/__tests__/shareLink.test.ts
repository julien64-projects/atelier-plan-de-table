import { describe, it, expect } from 'vitest';
import {
  genererToken,
  hashToken,
  tokenValide,
  lienRejoindre,
  dateExpiration,
  lienActif,
} from '@/lib/shareLink';

describe('génération de token', () => {
  it('produit 32 caractères hexadécimaux (128 bits)', () => {
    expect(genererToken()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('ne se répète pas', () => {
    const tokens = new Set(Array.from({ length: 500 }, genererToken));
    expect(tokens.size).toBe(500);
  });
});

describe('hachage du token', () => {
  it('correspond au SHA-256 de référence', async () => {
    // Vecteur connu : SHA-256("abc"). Garde-fou contre un changement
    // d'algorithme ou d'encodage qui désynchroniserait le client et la RPC.
    expect(await hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('est stable pour un même token', async () => {
    const t = genererToken();
    expect(await hashToken(t)).toBe(await hashToken(t));
  });

  it('diffère pour deux tokens distincts', async () => {
    expect(await hashToken(genererToken())).not.toBe(await hashToken(genererToken()));
  });

  it('renvoie 64 caractères hexadécimaux minuscules', async () => {
    expect(await hashToken(genererToken())).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('validation de token', () => {
  it('accepte un token généré', () => {
    expect(tokenValide(genererToken())).toBe(true);
  });

  it('refuse une longueur incorrecte, des majuscules ou du non-hexadécimal', () => {
    expect(tokenValide('abc')).toBe(false);
    expect(tokenValide('A'.repeat(32))).toBe(false);
    expect(tokenValide('z'.repeat(32))).toBe(false);
    expect(tokenValide('')).toBe(false);
  });
});

describe('construction du lien', () => {
  it('assemble origine et token', () => {
    expect(lienRejoindre('https://tableplan.app', 'ab12')).toBe(
      'https://tableplan.app/rejoindre/ab12',
    );
  });

  it('ne double pas la barre oblique', () => {
    expect(lienRejoindre('https://tableplan.app/', 'ab12')).toBe(
      'https://tableplan.app/rejoindre/ab12',
    );
  });
});

describe('expiration', () => {
  const t0 = new Date('2026-01-01T00:00:00.000Z');

  it('« jamais » ne pose pas de date', () => {
    expect(dateExpiration('jamais', t0)).toBeNull();
  });

  it('décale du bon nombre de jours', () => {
    expect(dateExpiration('7j', t0)).toBe('2026-01-08T00:00:00.000Z');
    expect(dateExpiration('30j', t0)).toBe('2026-01-31T00:00:00.000Z');
    expect(dateExpiration('90j', t0)).toBe('2026-04-01T00:00:00.000Z');
  });
});

describe('état d’un lien', () => {
  const t0 = new Date('2026-01-01T00:00:00.000Z');

  it('actif sans expiration', () => {
    expect(lienActif({ revoked: false, expires_at: null }, t0)).toBe(true);
  });

  it('inactif si révoqué, même non expiré', () => {
    expect(lienActif({ revoked: true, expires_at: null }, t0)).toBe(false);
  });

  it('inactif après la date d’expiration', () => {
    expect(lienActif({ revoked: false, expires_at: '2025-12-31T23:59:59.000Z' }, t0)).toBe(false);
  });

  it('actif avant la date d’expiration', () => {
    expect(lienActif({ revoked: false, expires_at: '2026-01-02T00:00:00.000Z' }, t0)).toBe(true);
  });
});
