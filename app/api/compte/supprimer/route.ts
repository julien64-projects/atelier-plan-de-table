import { NextResponse } from 'next/server';
import { stripe, supabaseAdmin, plannerDepuisRequete } from '@/lib/stripe/server';

export const runtime = 'nodejs';

/**
 * POST /api/compte/supprimer
 *
 * Suppression définitive du compte, à la demande de son titulaire (droit à
 * l'effacement, RGPD art. 17).
 *
 * L'ordre des opérations compte : on RÉSILIE D'ABORD chez Stripe. Supprimer
 * le compte sans le faire laisserait un abonnement actif, donc un client
 * prélevé chaque mois pour un service auquel il n'a plus accès.
 *
 * La suppression de l'utilisateur d'authentification suffit ensuite à tout
 * effacer : `planner` référence `auth.users` en cascade, et `project`,
 * `guest`, `table_plan`, `seat`, `decor`, `project_link` et `project_member`
 * suivent de proche en proche.
 */
export async function POST(req: Request) {
  const planner = await plannerDepuisRequete(req);
  if (!planner) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const admin = supabaseAdmin();

  try {
    const { data: ligne } = await admin
      .from('planner')
      .select('stripe_subscription_id')
      .eq('id', planner.id)
      .single();

    const abo = ligne?.stripe_subscription_id as string | null | undefined;
    if (abo) {
      try {
        await stripe().subscriptions.cancel(abo);
      } catch (e) {
        // Abonnement déjà résilié ou inconnu : ce n'est pas un motif de
        // blocage, mais toute autre panne Stripe l'est — mieux vaut refuser
        // la suppression que laisser un prélèvement orphelin.
        const msg = (e as Error).message ?? '';
        if (!/no such subscription|already canceled/i.test(msg)) throw e;
      }
    }

    const { error } = await admin.auth.admin.deleteUser(planner.id);
    if (error) throw error;

    return NextResponse.json({ supprime: true });
  } catch (e) {
    console.error('[compte/supprimer]', e);
    return NextResponse.json(
      { error: (e as Error).message ?? 'Échec de la suppression' },
      { status: 500 },
    );
  }
}
