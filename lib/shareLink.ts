/**
 * shareLink.ts — Liens de partage privés (planner → mariés).
 *
 * Le planner génère un token aléatoire de 128 bits. Seul son SHA-256 part en
 * base (`project_link.token_hash`) : quelqu'un qui lirait la table ne peut pas
 * reconstituer un lien valide. Le token en clair n'existe que dans l'URL
 * remise aux mariés.
 *
 * Ouvrir l'URL déclenche une session anonyme Supabase puis la RPC
 * `redeem_project_link`, qui rattache le compte au projet avec le rôle du lien.
 */

/** Nombre d'octets aléatoires du token (16 = 128 bits). */
const TOKEN_BYTES = 16;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/** Génère un token d'invitation imprévisible (32 caractères hexadécimaux). */
export function genererToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/**
 * SHA-256 du token, en hexadécimal minuscule — doit rester identique au
 * `encode(digest(p_token, 'sha256'), 'hex')` de la RPC côté Postgres.
 */
export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return toHex(new Uint8Array(buf));
}

/** Vérifie la forme d'un token avant tout aller-retour réseau. */
export function tokenValide(token: string): boolean {
  return new RegExp(`^[0-9a-f]{${TOKEN_BYTES * 2}}$`).test(token);
}

/** URL à remettre aux mariés. */
export function lienRejoindre(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/rejoindre/${token}`;
}

/** Durées d'expiration proposées dans l'interface. */
export type Expiration = 'jamais' | '7j' | '30j' | '90j';

/** Convertit un choix d'expiration en timestamp ISO (null = sans limite). */
export function dateExpiration(choix: Expiration, maintenant: Date = new Date()): string | null {
  const jours = { jamais: 0, '7j': 7, '30j': 30, '90j': 90 }[choix];
  if (!jours) return null;
  return new Date(maintenant.getTime() + jours * 86_400_000).toISOString();
}

/** True si le lien est encore utilisable (miroir côté client de la RPC). */
export function lienActif(
  lien: { revoked: boolean; expires_at: string | null },
  maintenant: Date = new Date(),
): boolean {
  if (lien.revoked) return false;
  if (!lien.expires_at) return true;
  return new Date(lien.expires_at).getTime() > maintenant.getTime();
}
