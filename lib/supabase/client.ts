'use client';

/**
 * Client Supabase (navigateur). Singleton partagé par toute l'app côté client.
 *
 * Utilise la clé « publishable » (publique, protégée par les règles RLS) — jamais
 * la clé secrète. Tant que les variables d'env ne sont pas renseignées, `supabase`
 * vaut null : l'app continue de fonctionner en localStorage (transition douce).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

if (!supabase && typeof window !== 'undefined') {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquantes — persistance locale utilisée.',
  );
}

/** True quand Supabase est configuré (clés présentes). */
export const supabaseReady = supabase !== null;
