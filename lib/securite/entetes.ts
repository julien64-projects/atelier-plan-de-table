/**
 * entetes.ts — En-têtes de sécurité HTTP, définis à part pour être testables.
 *
 * Cadre PCI DSS v4.0, questionnaire SAQ A : les données de carte ne touchent
 * jamais nos serveurs (paiement délégué à une page hébergée par Stripe). Le
 * SAQ A exige néanmoins que la page qui MÈNE au paiement soit protégée contre
 * l'altération — un script injecté pourrait rediriger l'acheteur vers un faux
 * formulaire. D'où la politique de sécurité de contenu ci-dessous, qui
 * restreint les origines autorisées à exécuter du script ou à recevoir des
 * requêtes (exigences 6.4.3 et 11.6.1).
 */

/** Origines de confiance, hors 'self'. */
const SUPABASE = 'https://*.supabase.co';
const STRIPE_JS = 'https://js.stripe.com';
const STRIPE_API = 'https://api.stripe.com';
const GOOGLE_FONTS = 'https://fonts.gstatic.com';

/**
 * Politique de sécurité de contenu.
 *
 * `'unsafe-inline'` reste nécessaire pour les styles : Next.js et les styles
 * calculés de Konva injectent des attributs `style`. Il n'est PAS accordé aux
 * scripts, qui sont la surface d'attaque réelle.
 */
export function politiqueCSP(): string {
  return [
    `default-src 'self'`,
    // 'unsafe-eval' est requis par le moteur de développement de Next ; en
    // production seule l'origine du site et Stripe peuvent exécuter du script.
    process.env.NODE_ENV === 'production'
      ? `script-src 'self' 'unsafe-inline' ${STRIPE_JS}`
      : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${STRIPE_JS}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' ${GOOGLE_FONTS} data:`,
    `connect-src 'self' ${SUPABASE} wss://*.supabase.co ${STRIPE_API}`,
    // Le paiement s'ouvre dans un cadre Stripe.
    `frame-src ${STRIPE_JS} https://hooks.stripe.com`,
    // Personne ne doit pouvoir encadrer nos pages : parade au détournement de clic.
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

export interface EnteteSecurite {
  key: string;
  value: string;
}

/** En-têtes appliqués à toutes les réponses. */
export function entetesSecurite(): EnteteSecurite[] {
  return [
    // Impose HTTPS pendant deux ans, sous-domaines compris (PCI DSS 4.2.1).
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'Content-Security-Policy', value: politiqueCSP() },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Aucune fonctionnalité sensible n'est utilisée par le service.
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self), interest-cohort=()' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ];
}
