import 'server-only';

/**
 * server.ts — Client Stripe et accès Supabase privilégié. Ce module ne doit
 * JAMAIS être importé depuis un composant client : `server-only` fait échouer
 * le build si ça arrive, plutôt que de laisser fuiter une clé secrète.
 */
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { StatutStripe } from './abonnement';

function requis(nom: string): string {
  const v = process.env[nom];
  if (!v) throw new Error(`Variable d'environnement manquante : ${nom}`);
  return v;
}

/** Client Stripe (clé restreinte ou secrète). */
export function stripe(): Stripe {
  return new Stripe(requis('STRIPE_SECRET_KEY'));
}

/**
 * Client Supabase en clé secrète : hors RLS. Réservé au webhook, qui écrit
 * les colonnes de facturation sans session utilisateur (c'est Stripe qui
 * appelle, pas le planner).
 */
export function supabaseAdmin(): SupabaseClient {
  return createClient(
    requis('NEXT_PUBLIC_SUPABASE_URL'),
    requis('SUPABASE_SECRET_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Identifie l'appelant à partir de son jeton Supabase (en-tête Authorization).
 * Renvoie null si absent ou invalide — les routes répondent alors 401.
 */
export async function plannerDepuisRequete(
  req: Request,
): Promise<{ id: string; email: string } | null> {
  const auth = req.headers.get('authorization');
  const jeton = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!jeton) return null;

  const sb = createClient(
    requis('NEXT_PUBLIC_SUPABASE_URL'),
    requis('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await sb.auth.getUser(jeton);
  if (error || !data.user?.email) return null;

  // Un invité anonyme (mariés) n'a pas d'email et n'est pas un client.
  if (data.user.is_anonymous) return null;

  return { id: data.user.id, email: data.user.email };
}

/**
 * Fin de la période payée, quel que soit l'emplacement du champ.
 *
 * Stripe a déplacé `current_period_end` de l'abonnement vers ses lignes
 * (`items.data[].current_period_end`) dans les versions récentes de l'API.
 * On lit les deux : sans ça, la date serait `null` et TOUT abonnement
 * résilié ou en retard perdrait sa période de grâce d'un coup.
 */
export function finDePeriode(sub: Stripe.Subscription): string | null {
  const surAbonnement = (sub as unknown as { current_period_end?: number }).current_period_end;
  const surLigne = sub.items?.data?.[0]?.current_period_end;
  const ts = surAbonnement ?? surLigne;
  return typeof ts === 'number' ? new Date(ts * 1000).toISOString() : null;
}

/** Lignes à écrire sur `planner` à partir d'un abonnement Stripe. */
export function champsAbonnement(sub: Stripe.Subscription) {
  const statut = sub.status as StatutStripe;
  return {
    stripe_subscription_id: sub.id,
    abo_statut: statut,
    abo_fin: finDePeriode(sub),
    abo_annule_a_la_fin: sub.cancel_at_period_end === true,
    plan_abo: statut === 'active' || statut === 'trialing' ? 'pro' : 'free',
  };
}

/** URL publique du site, pour les retours de Checkout et du portail. */
export function origineSite(req: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
}
