/**
 * societe.ts — Informations légales de l'éditeur, source unique.
 *
 * Toutes les pages légales et les données structurées lisent ces constantes :
 * une information erronée se corrige ici, à un seul endroit.
 *
 * Données issues de l'extrait Kbis du 04/06/2026. Les adresses personnelles
 * des dirigeants figurent au Kbis mais n'ont RIEN à faire sur un site public :
 * elles ne sont volontairement pas reprises ici.
 */

export const SOCIETE = {
  nom: 'Tickly',
  forme: 'Société par actions simplifiée (SAS)',
  capital: '10,00 €',
  rcsVille: 'Paris',
  rcsNumero: '105 850 945',
  siren: '105850945',
  euid: 'FR7501.105850945',
  immatriculation: '4 juin 2026',
  siege: '47 rue Vivienne, 75002 Paris, France',
  president: 'Julien Poincon',
  directeurGeneral: 'Florian Auffray',
  /** Directeur de la publication au sens de la LCEN. */
  directeurPublication: 'Julien Poincon',

  /**
   * À VÉRIFIER puis compléter : numéro de TVA intracommunautaire.
   * Laissé vide volontairement — les pages omettent la ligne plutôt que
   * d'afficher un identifiant fiscal non vérifié.
   */
  tvaIntracom: '',

  /** Adresse de contact publiée. Doit rester une boîte réellement relevée. */
  email: 'julienpoincon@gmail.com',

  marque: 'TablePlan',
  siteUrl: 'https://atelier-plan-de-table.vercel.app',
} as const;

/** Hébergeur du site, mention obligatoire (LCEN art. 6 III). */
export const HEBERGEUR = {
  nom: 'Vercel Inc.',
  adresse: '340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis',
  site: 'https://vercel.com',
} as const;

/** Sous-traitants au sens du RGPD (art. 28). */
export const SOUS_TRAITANTS = [
  {
    nom: 'Vercel Inc.',
    role: 'Hébergement du site et de l’application',
    pays: 'États-Unis (avec instances de traitement en Union européenne)',
    garantie: 'Clauses contractuelles types de la Commission européenne',
  },
  {
    nom: 'Supabase Inc.',
    role: 'Base de données, authentification et synchronisation temps réel',
    pays: 'Union européenne (région eu-west-1, Irlande)',
    garantie: 'Données hébergées dans l’Union européenne',
  },
  {
    nom: 'Stripe Payments Europe, Ltd.',
    role: 'Traitement des paiements et gestion des abonnements',
    pays: 'Irlande',
    garantie: 'Prestataire certifié PCI DSS niveau 1',
  },
] as const;

/** Prix public de l'abonnement, affiché partout à l'identique. */
export const TARIF = {
  montantHT: '4,90 €',
  periode: 'par mois',
  devise: 'EUR',
  valeurNumerique: '4.90',
} as const;

/** Date de dernière mise à jour des documents contractuels. */
export const MAJ_LEGALE = '30 juillet 2026';
