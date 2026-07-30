import { describe, it, expect } from 'vitest';
import { entetesSecurite, politiqueCSP } from '@/lib/securite/entetes';

const valeur = (cle: string) => entetesSecurite().find(e => e.key === cle)?.value ?? '';

describe('en-têtes de sécurité', () => {
  it('impose HTTPS durablement (PCI DSS 4.2.1)', () => {
    const hsts = valeur('Strict-Transport-Security');
    expect(hsts).toContain('includeSubDomains');
    const age = Number(/max-age=(\d+)/.exec(hsts)?.[1]);
    expect(age).toBeGreaterThanOrEqual(31536000); // au moins un an
  });

  it('interdit l’encadrement de la page de paiement', () => {
    expect(valeur('X-Frame-Options')).toBe('DENY');
    expect(politiqueCSP()).toContain("frame-ancestors 'none'");
  });

  it('bloque le reniflage de type MIME', () => {
    expect(valeur('X-Content-Type-Options')).toBe('nosniff');
  });

  it('ne fuit pas l’URL complète vers les tiers', () => {
    expect(valeur('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('déclare tous les en-têtes attendus', () => {
    const cles = entetesSecurite().map(e => e.key);
    for (const attendu of [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      expect(cles).toContain(attendu);
    }
  });
});

describe('politique de sécurité de contenu', () => {
  const csp = politiqueCSP();

  it('n’autorise que Stripe à fournir du script tiers', () => {
    const script = csp.split('; ').find(d => d.startsWith('script-src')) ?? '';
    expect(script).toContain('https://js.stripe.com');
    expect(script).toContain("'self'");
    // Aucune autre origine de script ne doit s'être glissée là.
    const origines = script.match(/https?:\/\/[^\s;]+/g) ?? [];
    expect(origines).toEqual(['https://js.stripe.com']);
  });

  it('n’ouvre les connexions qu’à Supabase et Stripe', () => {
    const connect = csp.split('; ').find(d => d.startsWith('connect-src')) ?? '';
    expect(connect).toContain('https://*.supabase.co');
    expect(connect).toContain('wss://*.supabase.co');
    expect(connect).toContain('https://api.stripe.com');
  });

  it('interdit les greffons et le détournement de la balise base', () => {
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
  });

  it('n’accorde jamais unsafe-eval aux scripts en production', () => {
    const avant = process.env.NODE_ENV;
    try {
      // @ts-expect-error — réécriture volontaire pour le test
      process.env.NODE_ENV = 'production';
      const script = politiqueCSP().split('; ').find(d => d.startsWith('script-src')) ?? '';
      expect(script).not.toContain('unsafe-eval');
    } finally {
      // @ts-expect-error — restauration
      process.env.NODE_ENV = avant;
    }
  });
});
