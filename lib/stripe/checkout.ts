'use client';

/**
 * checkout.ts — Départ vers Stripe depuis le navigateur.
 *
 * Les routes serveur identifient l'appelant par son jeton Supabase, transmis
 * en en-tête `Authorization`. Rien de sensible ne transite ici : la clé
 * secrète reste côté serveur, et la saisie de carte se fait chez Stripe.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

async function appeler(
  supabase: SupabaseClient,
  route: '/api/stripe/checkout' | '/api/stripe/portal',
): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const jeton = data.session?.access_token;
  if (!jeton) throw new Error('Session expirée : reconnectez-vous.');

  const r = await fetch(route, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jeton}` },
  });
  const corps = await r.json().catch(() => ({}));
  if (!r.ok || !corps?.url) {
    throw new Error(corps?.error ?? `Échec (${r.status})`);
  }
  return corps.url as string;
}

/** Ouvre la page de paiement Stripe pour souscrire. */
export async function ouvrirPaiement(supabase: SupabaseClient): Promise<void> {
  window.location.href = await appeler(supabase, '/api/stripe/checkout');
}

/** Ouvre le portail Stripe : moyen de paiement, factures, résiliation. */
export async function ouvrirPortail(supabase: SupabaseClient): Promise<void> {
  window.location.href = await appeler(supabase, '/api/stripe/portal');
}

/**
 * Lit le résultat du retour de Stripe dans l'URL, puis nettoie celle-ci.
 *
 * Le paramètre est retiré de la barre d'adresse : sans cela, un rechargement
 * ou un partage du lien réafficherait indéfiniment « paiement confirmé ».
 */
export function lireRetourPaiement(): 'ok' | 'annule' | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const abo = params.get('abo');
  if (abo !== 'ok' && abo !== 'annule') return null;

  params.delete('abo');
  const reste = params.toString();
  window.history.replaceState({}, '', window.location.pathname + (reste ? `?${reste}` : ''));
  return abo;
}
