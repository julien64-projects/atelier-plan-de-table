/**
 * dictionary.ts — Traductions FR / EN de l'interface TablePlan.
 *
 * Clés plates par domaine (préfixe). t(clé) renvoie la chaîne dans la langue
 * courante, avec repli sur le français si absente en anglais (déploiement
 * progressif des traductions sans casser l'affichage). Le nom de marque
 * « TablePlan » reste invariant.
 */

export type Lang = 'fr' | 'en';

export const LANGS: { key: Lang; label: string; flag: string }[] = [
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
];

type Dict = Record<string, string>;

const fr: Dict = {
  // Marque / en-tête
  'brand.eyebrow': 'Mariage',
  'brand.tagline.sidebar': 'Votre projet de mariage',
  'brand.tagline.login': 'Espace wedding planner',

  // Connexion
  'auth.email': 'Email',
  'auth.password': 'Mot de passe',
  'auth.signin': 'Se connecter',
  'auth.signup': 'Créer mon compte',
  'auth.toSignup': 'Pas encore de compte ? Créer un compte',
  'auth.toSignin': 'Déjà un compte ? Se connecter',
  'auth.needConfirm': 'Compte créé. Vérifie tes emails pour confirmer ton adresse, puis connecte-toi.',
  'auth.signout': 'Déconnexion',
  'auth.setPassword': 'Définir un mot de passe',
  'auth.setPassword.close': 'Fermer',
  'auth.setPassword.placeholder': 'Nouveau mot de passe (min. 6)',
  'auth.setPassword.save': 'Enregistrer le mot de passe',
  'auth.setPassword.saved': 'Mot de passe enregistré ✓ Tu peux désormais te connecter avec ton email et ce mot de passe.',
  'auth.setPassword.tooShort': 'Au moins 6 caractères.',

  // Sections du menu
  'section.salle': 'Salle',
  'section.mobilier': 'Mobilier de la salle',
  'section.distances': 'Distances de service',
  'section.tables': 'Tables',
  'section.invites': 'Invités',
  'section.partage': 'Partager le projet',
  'section.apparence': 'Apparence',

  // Apparence
  'appearance.ambiance': 'Ambiance',
  'appearance.clair': '☀ Clair',
  'appearance.sombre': '☾ Sombre',
  'appearance.couleurs': 'Couleurs',
  'appearance.accent': 'Accent (boutons)',
  'appearance.or': 'Filets d’or',
  'appearance.reset': 'Réinitialiser les couleurs',
  'appearance.langue': 'Langue',

  // Commun
  'common.add': 'Ajouter',
  'common.remove': 'Retirer',
  'common.delete': 'Supprimer',
  'common.close': 'Fermer',
  'common.cancel': 'Annuler',
  'common.clair': 'Clair',
  'common.sombre': 'Sombre',
};

const en: Dict = {
  'brand.eyebrow': 'Wedding',
  'brand.tagline.sidebar': 'Your wedding project',
  'brand.tagline.login': 'Wedding planner workspace',

  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signin': 'Sign in',
  'auth.signup': 'Create my account',
  'auth.toSignup': 'No account yet? Sign up',
  'auth.toSignin': 'Already have an account? Sign in',
  'auth.needConfirm': 'Account created. Check your inbox to confirm your address, then sign in.',
  'auth.signout': 'Sign out',
  'auth.setPassword': 'Set a password',
  'auth.setPassword.close': 'Close',
  'auth.setPassword.placeholder': 'New password (min. 6)',
  'auth.setPassword.save': 'Save password',
  'auth.setPassword.saved': 'Password saved ✓ You can now sign in with your email and this password.',
  'auth.setPassword.tooShort': 'At least 6 characters.',

  'section.salle': 'Room',
  'section.mobilier': 'Room furniture',
  'section.distances': 'Service clearances',
  'section.tables': 'Tables',
  'section.invites': 'Guests',
  'section.partage': 'Share the project',
  'section.apparence': 'Appearance',

  'appearance.ambiance': 'Theme',
  'appearance.clair': '☀ Light',
  'appearance.sombre': '☾ Dark',
  'appearance.couleurs': 'Colors',
  'appearance.accent': 'Accent (buttons)',
  'appearance.or': 'Gold lines',
  'appearance.reset': 'Reset colors',
  'appearance.langue': 'Language',

  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.clair': 'Light',
  'common.sombre': 'Dark',
};

export const DICT: Record<Lang, Dict> = { fr, en };

/** Traduit une clé ; repli sur le français, puis sur la clé brute. */
export function translate(lang: Lang, key: string): string {
  return DICT[lang]?.[key] ?? DICT.fr[key] ?? key;
}
