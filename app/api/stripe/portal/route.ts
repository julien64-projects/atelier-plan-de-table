import { NextResponse } from 'next/server';
import {
  stripe,
  supabaseAdmin,
  plannerDepuisRequete,
  origineSite,
} from '@/lib/stripe/server';

export const runtime = 'nodejs';

/**
 * POST /api/stripe/portal
 * Ouvre le portail de facturation Stripe : moyen de paiement, factures,
 * résiliation. Tout est géré par Stripe, rien à maintenir de notre côté.
 */
export async function POST(req: Request) {
  const planner = await plannerDepuisRequete(req);
  if (!planner) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const admin = supabaseAdmin();
    const { data: ligne } = await admin
      .from('planner')
      .select('stripe_customer_id')
      .eq('id', planner.id)
      .single();

    const customerId = ligne?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement à gérer pour ce compte.' },
        { status: 400 },
      );
    }

    const session = await stripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origineSite(req)}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[stripe/portal]', e);
    return NextResponse.json(
      { error: (e as Error).message ?? 'Échec de l’ouverture du portail' },
      { status: 500 },
    );
  }
}
